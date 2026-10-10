import { randomUUID } from 'node:crypto';
import { constants, existsSync, lstatSync, readFileSync, renameSync } from 'node:fs';
import { copyFile } from 'node:fs/promises';
import path from 'node:path';
import type { AssetIndexerService } from '../assets/indexer';
import { inspectAssetImage } from '../assets/image';
import { readiness } from '../assets/repository';
import { normalizeVariantKey } from '../assets/filename';
import { ASSET_ROLES, type AssetRole, type IndexedAssetSnapshot } from '../assets/types';
import { findManagedAssetById, findManagedAssetByTarget, insertManagedAsset, createArtVariant } from '../managed-assets/repository';
import type { SqliteDatabase, WorkspacePersistence } from '../persistence/database';
import { atomicJson, directory, fileIntegrity, noLinks, under } from '../recovery/filesystem';
import { AssetMutationError } from './errors';
import { AssetStateTokens, setOverride } from './state';

export type MutationPhase = 'stage' | 'preserve' | 'publication' | 'database' | 'reconciliation' | 'postcondition' | 'rollback';
export type MutationHooks = { phase?: (phase: MutationPhase) => void | Promise<void> };
export type ResolutionRequest = {
    operation: 'ATTACH' | 'MOVE' | 'CHOOSE' | 'UNASSIGN' | 'LEAVE';
    expected_state_token: string;
    asset_id?: string;
    variant_id?: string;
    role?: AssetRole;
    create_variant?: { card_id: string; variant_key: string; display_label?: string };
};
export type ManagedMutationRequest = {
    operation: 'REPLACE' | 'RELINK' | 'REMOVE';
    managed_asset_id?: string;
    target_asset_id?: string;
    expected_state_token: string;
    source_file?: string;
    asset_id?: string;
    // Optional assertions only: RELINK cannot retarget through these fields.
    card_id?: string; variant_id?: string; role?: AssetRole;
};
export type PreviewSource = { source_file?: string; asset_id?: string };

const tables = ['art_variants', 'asset_index_scans', 'indexed_asset_files', 'managed_assets',
    'managed_asset_ingest_requests', 'asset_resolution_overrides', 'variant_role_bindings', 'asset_index_diagnostics'] as const;
type Snapshot = Record<typeof tables[number], Record<string, unknown>[]>;
const capture = (db: SqliteDatabase): Snapshot => Object.fromEntries(
    tables.map(table => [table, db.prepare(`SELECT * FROM ${table}`).all()])) as Snapshot;
const restore = (db: SqliteDatabase, snapshot: Snapshot) => {
    for (const table of [...tables].reverse()) db.prepare(`DELETE FROM ${table}`).run();
    for (const table of tables) for (const row of snapshot[table]) {
        const columns = Object.keys(row);
        db.prepare(`INSERT INTO ${table} (${columns.join(',')}) VALUES (${columns.map(() => '?').join(',')})`)
            .run(...columns.map(column => row[column]));
    }
};
function fail(code: string, message: string, status = 422): never { throw new AssetMutationError(code, message, status); }

/** Workspace owns all physical mutations. Recovery files are deliberately retained, including on success. */
export class AssetMutationService {
    readonly tokens: AssetStateTokens;
    private busy = false;
    constructor(private readonly root: string, private readonly persistence: WorkspacePersistence,
        private readonly assets: AssetIndexerService, private readonly recoveryRequired: (message: string) => void,
        private readonly hooks: MutationHooks = {}) { this.tokens = new AssetStateTokens(persistence); }

    private async serial<T>(operation: () => Promise<T>): Promise<T> {
        if (this.busy) fail('ASSET_STATE_STALE', 'Another asset operation is in progress.', 409);
        this.busy = true;
        try { return await operation(); }
        catch (error) {
            if ((error as { code?: string }).code === 'BACKUP_SOURCE_UNSAFE') {
                throw new AssetMutationError('ASSET_SOURCE_UNSAFE', 'Asset or recovery path traverses an unsafe path, link or junction.');
            }
            if (error instanceof AssetMutationError) throw error;
            throw new AssetMutationError('ASSET_MUTATION_FAILED', 'Asset operation could not complete safely.', 503);
        } finally { this.busy = false; }
    }

    private phase(phase: MutationPhase) { return this.hooks.phase?.(phase); }
    private check(token: string) {
        if (typeof token !== 'string' || token !== this.tokens.current()) {
            fail('ASSET_STATE_STALE', 'Authoritative asset state changed; refresh the resolver or preview.', 409);
        }
    }
    private asset(id: string | undefined): IndexedAssetSnapshot {
        const asset = this.assets.listAssets().find(candidate => candidate.assetId === id);
        if (!asset) fail('ASSET_NOT_FOUND', 'Indexed asset was not found.', 404);
        return asset;
    }
    private managed(id: string) {
        const managed = this.persistence.runRepositoryOperation(db => findManagedAssetById(db, id));
        if (!managed) fail('ASSET_NOT_FOUND', 'Managed asset was not found.', 404);
        return managed;
    }
    private candidates(variant: string, role: AssetRole) {
        return this.assets.listAssets().filter(a => a.present && a.validAsset && a.associationState === 'RESOLVED'
            && a.variantId === variant && a.role === role);
    }
    private async validSource(file: string, role: AssetRole) {
        try {
            if (!path.isAbsolute(file)) fail('ASSET_SOURCE_UNSAFE', 'Source must be an absolute file path.');
            noLinks(file);
            if (!lstatSync(file).isFile()) fail('ASSET_SOURCE_INVALID', 'Source is not a regular file.');
            const extension = path.extname(file).slice(1).toLowerCase();
            const image = await inspectAssetImage(file, role, extension);
            if (role === 'OF' && !image.hasTransparency) fail('ASSET_SOURCE_INVALID', 'OF requires usable transparency.');
            noLinks(file);
            return { extension, image };
        } catch (error) {
            if (error instanceof AssetMutationError) throw error;
            if ((error as { code?: string }).code === 'BACKUP_SOURCE_UNSAFE') fail('ASSET_SOURCE_UNSAFE', 'Source traverses a link or junction.');
            return fail('ASSET_SOURCE_INVALID', 'Source is missing, unreadable, or invalid for the target role.');
        }
    }

    /** Persisted state only. Only refresh/execution reconcile physical state. */
    getState() {
        return { expected_state_token: this.tokens.current(), assets: this.assets.listAssets(),
            variants: this.assets.listVariants(), overrides: this.persistence.runRepositoryOperation(db =>
                db.prepare('SELECT asset_id, disposition, variant_id, role FROM asset_resolution_overrides ORDER BY asset_id').all()) };
    }
    refresh() { return this.serial(async () => { await this.assets.scan(); return this.getState(); }); }
    async preview(id: string, operation: 'REPLACE' | 'REMOVE' | 'RELINK', source: PreviewSource = {}) {
        if (!['REPLACE', 'REMOVE', 'RELINK'].includes(operation)) fail('ASSET_OPERATION_INVALID', 'Unsupported preview operation.');
        if (operation === 'REPLACE' && Boolean(source.source_file) === Boolean(source.asset_id)) {
            fail('ASSET_SOURCE_INVALID', 'Replace preview requires exactly one source file or indexed asset.');
        }
        if (operation !== 'REPLACE' && (source.source_file || source.asset_id)) {
            fail('ASSET_SOURCE_INVALID', `${operation} preview does not accept a replacement source.`);
        }
        const managed = this.managed(id);
        const variant = this.assets.listVariants().find(v => v.variantId === managed.variantId);
        if (!variant) fail('ASSET_TARGET_INVALID', 'Managed target variant does not exist.');
        const expectedStateToken = this.tokens.current();
        // No scan, serial mutation lock, staging, marker or DB write belongs in a preview.
        if (operation === 'REPLACE') {
            const indexed = source.asset_id ? this.asset(source.asset_id) : null;
            if (indexed && !indexed.present) fail('ASSET_SOURCE_INVALID', 'Indexed replacement source is not currently present.');
            try {
                const file = indexed ? under(this.root, indexed.relativePath) : source.source_file!;
                const validated = await this.validSource(file, managed.role);
                if (indexed) {
                    const physical = lstatSync(file);
                    if ((indexed.contentHash !== null && indexed.contentHash !== validated.image.contentHash)
                        || indexed.sizeBytes !== physical.size || indexed.modifiedTimeMs !== physical.mtimeMs) {
                        fail('ASSET_STATE_STALE', 'Indexed replacement source differs from persisted state; refresh first.', 409);
                    }
                }
            } catch (error) {
                if ((error as { code?: string }).code === 'BACKUP_SOURCE_UNSAFE') {
                    fail('ASSET_SOURCE_UNSAFE', 'Indexed replacement source traverses an unsafe path, link or junction.');
                }
                throw error;
            }
            if (this.tokens.current() !== expectedStateToken) {
                fail('ASSET_STATE_STALE', 'Asset state changed during preview validation; refresh the preview.', 409);
            }
        }
        return { operation, managed_asset: managed, expected_state_token: expectedStateToken,
            affected_slot: { card_id: managed.cardId, variant_id: managed.variantId, role: managed.role },
            candidates: this.candidates(managed.variantId, managed.role),
            readiness_before: { standard: variant.standard, overframe: variant.overframe },
            readiness_after: readiness({ ...variant.roles, [managed.role]: operation === 'REMOVE' ? null : true }),
            recovery_policy: 'PRESERVE_PREVIOUS_STATE' as const };
    }

    resolve(input: ResolutionRequest) {
        return this.serial(async () => {
            if (input.operation === 'LEAVE') { this.check(input.expected_state_token); return { operation: 'LEAVE', changed: false, ...this.getState() }; }
            await this.assets.scan(); this.check(input.expected_state_token);
            if (!['ATTACH', 'MOVE', 'CHOOSE', 'UNASSIGN'].includes(input.operation)) fail('ASSET_OPERATION_INVALID', 'Unsupported resolution operation.');
            if (input.operation === 'UNASSIGN' && (input.create_variant || input.variant_id || input.role)) fail('ASSET_TARGET_INVALID', 'Unassign does not accept a new target.');
            const asset = this.asset(input.asset_id);
            const role = input.role;
            if (input.operation !== 'UNASSIGN' && (!role || !ASSET_ROLES.includes(role))) fail('ASSET_ROLE_INVALID', 'A valid target role is required.');
            if (input.operation !== 'UNASSIGN') await this.validSource(under(this.root, asset.relativePath), role!);
            if (input.variant_id && input.create_variant) fail('ASSET_TARGET_INVALID', 'Specify an existing variant or explicit resolver variant creation.');
            let variant = input.variant_id;
            if (input.operation !== 'UNASSIGN' && !variant && !input.create_variant) fail('ASSET_TARGET_INVALID', 'A target variant is required.');
            const previous = this.persistence.runRepositoryOperation(capture);
            let conflict: IndexedAssetSnapshot[] = [];
            if (input.operation === 'CHOOSE') {
                if (!variant || input.create_variant) fail('ASSET_TARGET_INVALID', 'Choose requires an existing current conflict slot.');
                conflict = this.candidates(variant, role!);
                if (conflict.length < 2 || !conflict.some(candidate => candidate.assetId === asset.assetId)) {
                    fail('ASSET_CONFLICT_INVALID', 'Winner must belong to the exact current conflict.');
                }
            } else if (variant && this.candidates(variant, role!).some(candidate => candidate.assetId !== asset.assetId)) {
                fail('ASSET_SLOT_OCCUPIED', 'Target has another current candidate; resolve that conflict explicitly.', 409);
            }
            const operationId = randomUUID();
            const operationRoot = directory(this.root, `Temp/AssetMutation/${operationId}`);
            const marker = path.join(operationRoot, 'operation.json');
            atomicJson(marker, { operation_id: operationId, operation: input.operation, status: 'PREPARED', previous });
            try {
                this.persistence.transaction(db => {
                    if (input.create_variant) {
                        const creation = input.create_variant;
                        if (!db.prepare('SELECT 1 FROM canonical_cards WHERE card_id = ?').get(creation.card_id)) fail('ASSET_CARD_NOT_FOUND', 'Target Canonical card does not exist.', 404);
                        let key: string;
                        try { key = normalizeVariantKey(creation.variant_key); } catch { return fail('ASSET_TARGET_INVALID', 'Invalid variant key.'); }
                        if (db.prepare('SELECT 1 FROM art_variants WHERE card_id = ? AND variant_key = ?').get(creation.card_id, key)) fail('ASSET_VARIANT_EXISTS', 'Target variant already exists.', 409);
                        variant = createArtVariant(db, creation.card_id, key, creation.display_label ?? creation.variant_key, new Date().toISOString()).variant_id;
                    }
                    if (input.operation !== 'UNASSIGN' && !db.prepare('SELECT 1 FROM art_variants WHERE variant_id = ?').get(variant!)) fail('ASSET_TARGET_INVALID', 'Target variant does not exist.');
                    setOverride(db, asset.assetId, input.operation === 'UNASSIGN' ? 'UNASSIGN' : 'ASSIGN',
                        input.operation === 'UNASSIGN' ? null : variant!, input.operation === 'UNASSIGN' ? null : role!);
                    for (const loser of conflict) if (loser.assetId !== asset.assetId) setOverride(db, loser.assetId, 'UNASSIGN');
                });
                await this.phase('database'); await this.assets.scan(); await this.phase('reconciliation');
                if (input.operation === 'UNASSIGN') {
                    if (this.asset(asset.assetId).variantId !== null) fail('ASSET_POSTCONDITION_FAILED', 'Asset remained bound after unassign.');
                } else {
                    const bound = this.assets.listVariants().find(v => v.variantId === variant)?.roles[role!];
                    if (bound?.assetId !== asset.assetId || !bound.validAsset || !bound.present) fail('ASSET_POSTCONDITION_FAILED', 'Resolved winner is not the authoritative target binding.');
                }
                await this.phase('postcondition');
                atomicJson(marker, { operation_id: operationId, operation: input.operation, status: 'COMPLETE', previous });
                return { operation: input.operation, operation_id: operationId, changed: true, ...this.getState() };
            } catch (error) {
                await this.compensate(previous, marker, operationId, async () => {});
                if (error instanceof AssetMutationError) throw error;
                throw new AssetMutationError('ASSET_MUTATION_FAILED', 'Resolution failed; previous state was restored.', 503);
            }
        });
    }

    mutate(input: ManagedMutationRequest) {
        return this.serial(async () => {
            await this.assets.scan(); this.check(input.expected_state_token);
            if (!['REPLACE', 'RELINK', 'REMOVE'].includes(input.operation)) fail('ASSET_OPERATION_INVALID', 'Unsupported managed mutation.');
            if (Boolean(input.managed_asset_id) === Boolean(input.target_asset_id)) fail('ASSET_TARGET_INVALID', 'Specify one existing managed ID or missing/broken indexed target ID.');
            const target = input.target_asset_id ? this.asset(input.target_asset_id) : null;
            if (target && input.operation !== 'RELINK') fail('ASSET_MANAGED_REQUIRED', 'Replace and remove require managed ownership.');
            const targetVariant = target ? this.assets.listVariants().find(v => v.variantId === target.variantId) : null;
            if (target && (!targetVariant || !target.role || (target.present && target.validAsset))) {
                fail('ASSET_RELINK_NOT_BROKEN', 'Indexed relink target must have a knowable missing/broken slot identity.');
            }
            if (target && this.persistence.runRepositoryOperation(db => findManagedAssetByTarget(db, targetVariant!.variantId, target.role!))) {
                fail('ASSET_TARGET_INVALID', 'Use the registered managed identity for this target slot.');
            }
            const managed = target ? {
                managedAssetId: randomUUID(), variantId: targetVariant!.variantId, cardId: targetVariant!.cardId,
                variantKey: targetVariant!.variantKey, role: target.role!, managedRelativePath: target.relativePath,
            } : this.managed(input.managed_asset_id!);
            if ((input.card_id && input.card_id !== managed.cardId) || (input.variant_id && input.variant_id !== managed.variantId)
                || (input.role && input.role !== managed.role)) fail('ASSET_TARGET_IMMUTABLE', 'Managed mutation must preserve card/variant/role identity.');
            const indexed = this.assets.listAssets().find(a => a.relativePath === managed.managedRelativePath);
            if (indexed?.associationState === 'RESOLVED' && (indexed.variantId !== managed.variantId || indexed.role !== managed.role)) {
                fail('ASSET_TARGET_IMMUTABLE', 'Managed source has an explicit binding to another slot; resolve its association before mutating ownership.');
            }
            if (input.operation === 'RELINK' && indexed?.present && indexed.validAsset) fail('ASSET_RELINK_NOT_BROKEN', 'Relink requires a missing or invalid managed slot.');
            const source = input.asset_id ? this.asset(input.asset_id) : null;
            if (input.operation !== 'REMOVE' && (Boolean(input.source_file) === Boolean(source))) fail('ASSET_SOURCE_INVALID', 'Provide exactly one source file or indexed asset.');
            if (input.operation === 'REMOVE' && (input.source_file || source)) fail('ASSET_SOURCE_INVALID', 'Remove does not accept a replacement source.');
            const sourcePath = source ? under(this.root, source.relativePath) : input.source_file;
            const validated = sourcePath ? await this.validSource(sourcePath, managed.role) : null;
            const destinationRelative = validated ? `Assets/Managed/${managed.cardId}/${managed.variantKey}/${managed.role}.${validated.extension}` : null;
            const oldPath = under(this.root, managed.managedRelativePath);
            const destination = destinationRelative ? under(this.root, destinationRelative) : null;
            if (destination && destination !== oldPath && existsSync(destination)) fail('ASSET_DESTINATION_OCCUPIED', 'Managed destination is already occupied.', 409);
            const otherCandidates = this.candidates(managed.variantId, managed.role).filter(a => a.relativePath !== managed.managedRelativePath);
            if (input.operation !== 'REMOVE' && otherCandidates.some(a => !source || a.assetId !== source.assetId)) fail('ASSET_SLOT_OCCUPIED', 'Another target candidate requires explicit resolution.', 409);
            const previous = this.persistence.runRepositoryOperation(capture);
            const operationId = randomUUID();
            const operationRoot = directory(this.root, `Temp/AssetMutation/${operationId}`);
            const marker = path.join(operationRoot, 'operation.json');
            const staged = path.join(operationRoot, `replacement.${validated?.extension ?? 'bin'}`);
            const preserved = path.join(operationRoot, 'previous-source');
            const oldIntegrity = existsSync(oldPath) ? await fileIntegrity(oldPath) : null;
            let preservedOld = false; let published = false;
            atomicJson(marker, { operation_id: operationId, operation: input.operation, status: 'PREPARED',
                previous, old_path: managed.managedRelativePath, new_path: destinationRelative, old_integrity: oldIntegrity });
            try {
                if (sourcePath && validated) {
                    await copyFile(sourcePath, staged, constants.COPYFILE_EXCL);
                    const stagedImage = await this.validSource(staged, managed.role);
                    if (stagedImage.image.contentHash !== validated.image.contentHash) fail('ASSET_SOURCE_CHANGED', 'Source changed while staging.', 409);
                    noLinks(sourcePath);
                }
                await this.phase('stage');
                if (oldIntegrity) {
                    noLinks(oldPath); noLinks(operationRoot);
                    if (target) await copyFile(oldPath, preserved, constants.COPYFILE_EXCL);
                    else { renameSync(oldPath, preserved); preservedOld = true; }
                    if ((await fileIntegrity(preserved)).sha256 !== oldIntegrity.sha256) fail('ASSET_SOURCE_CHANGED', 'Previous file changed before preservation.', 409);
                }
                await this.phase('preserve');
                if (destination && destinationRelative) {
                    directory(this.root, path.posix.dirname(destinationRelative)); noLinks(destination, true);
                    if (existsSync(destination)) fail('ASSET_DESTINATION_OCCUPIED', 'Destination changed before publication.', 409);
                    noLinks(staged); renameSync(staged, destination); published = true;
                }
                await this.phase('publication');
                this.persistence.transaction(db => {
                    if (input.operation === 'REMOVE') {
                        db.prepare('DELETE FROM managed_asset_ingest_requests WHERE managed_asset_id = ?').run(managed.managedAssetId);
                        db.prepare('DELETE FROM managed_assets WHERE managed_asset_id = ?').run(managed.managedAssetId);
                    } else if (target) {
                        insertManagedAsset(db, { variantId: managed.variantId, role: managed.role,
                            managedRelativePath: destinationRelative!, contentHash: validated!.image.contentHash,
                            originalFileName: path.basename(sourcePath!), extension: validated!.extension, createdAt: new Date().toISOString() });
                    } else {
                        db.prepare(`UPDATE managed_assets SET managed_relative_path = ?, content_hash = ?, extension = ?, original_file_name = ? WHERE managed_asset_id = ?`)
                            .run(destinationRelative!, validated!.image.contentHash, validated!.extension, path.basename(sourcePath!), managed.managedAssetId);
                    }
                    if (indexed && (input.operation === 'REMOVE' || destinationRelative !== managed.managedRelativePath)) setOverride(db, indexed.assetId, 'IGNORE');
                    if (source && source.relativePath !== destinationRelative && source.variantId === managed.variantId && source.role === managed.role) {
                        setOverride(db, source.assetId, 'IGNORE');
                    }
                });
                await this.phase('database'); await this.assets.scan(); await this.phase('reconciliation');
                const bound = this.assets.listVariants().find(v => v.variantId === managed.variantId)?.roles[managed.role];
                if (input.operation === 'REMOVE') {
                    if (existsSync(oldPath) || this.persistence.runRepositoryOperation(db => findManagedAssetById(db, managed.managedAssetId))) fail('ASSET_POSTCONDITION_FAILED', 'Removed managed source remains active.');
                } else if (!bound || bound.relativePath !== destinationRelative || bound.contentHash !== validated!.image.contentHash || !bound.present || !bound.validAsset) {
                    fail('ASSET_POSTCONDITION_FAILED', 'Published source is not the authoritative valid binding.');
                }
                await this.phase('postcondition');
                atomicJson(marker, { operation_id: operationId, operation: input.operation, status: 'COMPLETE',
                    previous, old_path: managed.managedRelativePath, new_path: destinationRelative, old_integrity: oldIntegrity });
                return { operation: input.operation, operation_id: operationId, changed: true,
                    recovery_relative_path: `Temp/AssetMutation/${operationId}/`, ...this.getState() };
            } catch (error) {
                await this.compensate(previous, marker, operationId, async () => {
                    if (published && destination) { noLinks(destination); renameSync(destination, path.join(operationRoot, 'failed-publication')); }
                    if (preservedOld) {
                        noLinks(oldPath, true); noLinks(preserved);
                        if (existsSync(oldPath)) throw new Error('Previous path was occupied during rollback.');
                        renameSync(preserved, oldPath);
                    }
                    if (oldIntegrity) {
                        if ((await fileIntegrity(oldPath)).sha256 !== oldIntegrity.sha256) throw new Error('Previous physical state could not be proven.');
                    } else if (existsSync(oldPath)) throw new Error('Expected missing previous source is now present.');
                    if (destination && destination !== oldPath && existsSync(destination)) throw new Error('New destination remains after rollback.');
                });
                if (error instanceof AssetMutationError) throw error;
                throw new AssetMutationError('ASSET_MUTATION_FAILED', 'Asset mutation failed; previous state was restored.', 503);
            }
        });
    }

    private async compensate(previous: Snapshot, marker: string, operationId: string, files: () => Promise<void>) {
        try {
            await this.phase('rollback'); await files();
            this.persistence.transaction(db => restore(db, previous));
            // Prove the restored domain matches the saved snapshot without generating new scans.
            const current = this.persistence.runRepositoryOperation(capture);
            const canonical = (snapshot: Snapshot) => JSON.stringify(tables.map(table => snapshot[table]
                .map(row => JSON.stringify(row)).sort()));
            if (canonical(current) !== canonical(previous)) throw new Error('Previous database state could not be proven.');
            const detail = JSON.parse(readFileSync(marker, 'utf8')) as Record<string, unknown>;
            atomicJson(marker, { ...detail, status: 'ROLLED_BACK' });
        } catch {
            this.recoveryRequired(`ASSET_MUTATION_RECOVERY_REQUIRED: operation ${operationId} requires recovery from retained material.`);
            throw new AssetMutationError('ASSET_MUTATION_RECOVERY_REQUIRED', 'Rollback could not prove previous state; recovery material was retained.', 503);
        }
    }
}
