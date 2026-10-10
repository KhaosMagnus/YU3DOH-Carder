import { randomUUID } from 'node:crypto';
import { constants, copyFileSync, existsSync, lstatSync, renameSync, rmdirSync } from 'node:fs';
import path from 'node:path';
import { normalizeVariantKey } from '../assets/filename';
import type { AssetIndexerService } from '../assets/indexer';
import { captureAssetDomain, restoreAssetDomain, type MutationHooks } from '../asset-mutation/service';
import { AssetStateTokens, setOverride } from '../asset-mutation/state';
import type { CarderAssetGrantRegistry } from '../carder/asset-grants';
import type { LibraryAssetService } from '../library/asset-service';
import type { WorkspacePersistence } from '../persistence/database';
import { atomicJson, directory, fileIntegrity, under } from '../recovery/filesystem';
import { preferredVariant, writePreference } from './preferences';

export class VariantLifecycleError extends Error {
    constructor(readonly code: string, message: string, readonly statusCode = 422) { super(message); this.name = 'VariantLifecycleError'; }
}
function fail(code: string, message: string, status = 422): never { throw new VariantLifecycleError(code, message, status); }
export type RenameProposal = { variant_key: string; display_label: string };
export type LifecycleRequest = { expected_state_token: string; acknowledge_preferred_clear?: boolean } & Partial<RenameProposal>;
type Managed = { managed_asset_id: string; managed_relative_path: string; extension: string; role: string; content_hash: string };

/** Workspace-owned lifecycle; previews never scan/write, mutations retain compensation material. */
export class VariantLifecycleService {
    constructor(private readonly root: string, private readonly persistence: WorkspacePersistence,
        private readonly assets: AssetIndexerService, private readonly library: LibraryAssetService,
        private readonly tokens: AssetStateTokens, private readonly grants: CarderAssetGrantRegistry,
        private readonly recoveryRequired: (message: string) => void, private readonly hooks: MutationHooks = {}) {}
    getState(cardId: string) {
        if (!this.persistence.runRepositoryOperation(db => db.prepare('SELECT 1 FROM canonical_cards WHERE card_id = ?').get(cardId))) fail('VARIANT_NOT_FOUND', 'Target card does not exist.', 404);
        return this.library.getVariants(cardId);
    }
    private check(token: string) {
        if (!token || token !== this.tokens.current()) fail('VARIANT_STATE_STALE', 'Artwork state changed; review current authoritative state.', 409);
    }
    private variant(id: string) {
        const variant = this.assets.listVariants().find(v => v.variantId === id);
        if (!variant) fail('VARIANT_NOT_FOUND', 'Art Variant does not exist.', 404);
        return variant;
    }
    private managed(id: string): Managed[] { return this.persistence.runRepositoryOperation(db =>
        db.prepare('SELECT * FROM managed_assets WHERE variant_id = ? ORDER BY managed_asset_id').all(id) as Managed[]); }
    private associated(id: string) {
        const assigned = this.persistence.runRepositoryOperation(db => db.prepare("SELECT asset_id FROM asset_resolution_overrides WHERE variant_id = ? AND disposition = 'ASSIGN'").all(id) as { asset_id: string }[]);
        const ids = new Set(assigned.map(a => a.asset_id));
        return this.assets.listAssets().filter(a => a.variantId === id || ids.has(a.assetId));
    }
    private safe<T>(operation: () => T): T {
        try { return operation(); } catch (error) {
            if ((error as { code?: string }).code === 'BACKUP_SOURCE_UNSAFE') fail('VARIANT_PATH_UNSAFE', 'Lifecycle path traverses an unsafe path, link or junction.');
            throw error;
        }
    }
    setPreferred(cardId: string, variantId: string | null, token: string) {
        this.check(token);
        this.getState(cardId);
        if (variantId && this.variant(variantId).cardId !== cardId) fail('VARIANT_CARD_MISMATCH', 'Preferred Variant belongs to another card.');
        const changed = this.persistence.transaction(db => {
            if (preferredVariant(db, cardId) === variantId) return false;
            writePreference(db, cardId, variantId); return true;
        });
        return { operation: 'PREFERRED', changed, ...this.getState(cardId) };
    }
    previewRename(id: string, proposed: RenameProposal) {
        return this.safe(() => {
            const variant = this.variant(id);
            let key: string;
            try { key = normalizeVariantKey(proposed.variant_key); } catch { return fail('VARIANT_KEY_INVALID', 'Variant key must follow the existing letters/numbers/underscore policy.'); }
            const label = typeof proposed.display_label === 'string' ? proposed.display_label.normalize('NFKC').trim() : '';
            if (!label) fail('VARIANT_KEY_INVALID', 'Display label must be non-empty.');
            const collision = this.assets.listVariants(variant.cardId).some(v => v.variantId !== id && v.variantKey === key);
            const managed = this.managed(id).map(m => {
                const destination = `Assets/Managed/${variant.cardId}/${key}/${m.role}.${m.extension}`;
                const from = under(this.root, m.managed_relative_path); const to = under(this.root, destination);
                const present = existsSync(from);
                if (present && !lstatSync(from).isFile()) fail('VARIANT_PATH_UNSAFE', 'Managed source must be a regular file.');
                const occupied = destination !== m.managed_relative_path && (existsSync(to) || this.persistence.runRepositoryOperation(db =>
                    !!db.prepare('SELECT 1 FROM indexed_asset_files WHERE relative_path = ?').get(destination)));
                return { ...m, destination, present, occupied: !!occupied, move_required: key !== variant.variantKey };
            });
            const paths = new Set(managed.map(m => m.managed_relative_path));
            const unmanaged = this.associated(id).filter(a => !paths.has(a.relativePath));
            const preferred = this.getState(variant.cardId).preferred_variant_id === id;
            return { operation: 'RENAME' as const, variant_id: id, card_id: variant.cardId,
                current: { variant_key: variant.variantKey, display_label: variant.displayLabel },
                proposed: { variant_key: key, display_label: label }, key_changed: key !== variant.variantKey,
                label_changed: label !== variant.displayLabel, collision, preferred, managed_assets: managed,
                unmanaged_assets: unmanaged, readiness_before: { standard: variant.standard, overframe: variant.overframe },
                readiness_after: { standard: variant.standard, overframe: variant.overframe }, expected_state_token: this.tokens.current(),
                recovery_policy: 'PRESERVE_PREVIOUS_STATE', can_execute: !collision && !managed.some(m => m.occupied) };
        });
    }
    previewRemove(id: string) {
        return this.safe(() => {
            const variant = this.variant(id); const state = this.getState(variant.cardId); const managed = this.managed(id);
            for (const m of managed) { const file = under(this.root, m.managed_relative_path); if (existsSync(file) && !lstatSync(file).isFile()) fail('VARIANT_PATH_UNSAFE', 'Managed source must be regular.'); }
            const paths = new Set(managed.map(m => m.managed_relative_path));
            return { operation: 'REMOVE' as const, variant: state.variants.find(v => v.variant_id === id)!,
                preferred: state.preferred_variant_id === id, acknowledge_preferred_clear_required: state.preferred_variant_id === id,
                managed_assets: managed, unmanaged_assets: this.associated(id).filter(a => !paths.has(a.relativePath)),
                remaining_variants: state.variants.filter(v => v.variant_id !== id), expected_state_token: this.tokens.current(),
                recovery_policy: 'PRESERVE_MANAGED_BYTES_AND_UNMANAGED_SOURCES' };
        });
    }
    rename(id: string, request: LifecycleRequest & RenameProposal) { return this.execute(id, 'RENAME', request); }
    remove(id: string, request: LifecycleRequest) { return this.execute(id, 'REMOVE', request); }
    private async execute(id: string, operation: 'RENAME' | 'REMOVE', request: LifecycleRequest) {
        this.check(request.expected_state_token);
        // Execution reconciles physical state; a preview remains strictly read-only.
        await this.assets.scan(); this.check(request.expected_state_token);
        const variant = this.variant(id);
        const rename = operation === 'RENAME' ? this.previewRename(id, request as RenameProposal) : null;
        const removal = operation === 'REMOVE' ? this.previewRemove(id) : null;
        if (rename?.collision) fail('VARIANT_KEY_CONFLICT', 'Normalized variant key is already used by this card.', 409);
        if (rename?.managed_assets.some(m => m.occupied)) fail('VARIANT_DESTINATION_OCCUPIED', 'Managed destination is occupied.', 409);
        if (removal?.preferred && request.acknowledge_preferred_clear !== true) fail('PREFERRED_CLEAR_ACK_REQUIRED', 'Acknowledge that Preferred will be cleared without a replacement.');
        if (rename && !rename.key_changed && !rename.label_changed) return { operation, changed: false, ...this.getState(variant.cardId) };
        const previous = this.persistence.runRepositoryOperation(captureAssetDomain);
        const operationId = randomUUID();
        const operationRoot = this.safe(() => directory(this.root, `Temp/VariantLifecycle/${operationId}`));
        const marker = path.join(operationRoot, 'operation.json');
        const plans: { from: string; to: string; hash: string; relative: string }[] = [];
        const moved: typeof plans = [];
        const createdDirectories: string[] = [];
        atomicJson(marker, { operation_id: operationId, operation, status: 'PREPARED', previous });
        try {
            const managed = this.managed(id);
            for (const [index, m] of managed.entries()) {
                const from = this.safe(() => under(this.root, m.managed_relative_path));
                if (!existsSync(from) || (rename && !rename.key_changed)) continue;
                const integrity = await fileIntegrity(from);
                const preserved = this.safe(() => under(operationRoot, `preserved-${index}.${m.extension}`));
                copyFileSync(from, preserved, constants.COPYFILE_EXCL);
                if ((await fileIntegrity(preserved)).sha256 !== integrity.sha256) throw new Error('Preserved bytes differ.');
                const relative = rename ? rename.managed_assets.find(a => a.managed_asset_id === m.managed_asset_id)!.destination : `Temp/VariantLifecycle/${operationId}/retired-${index}.${m.extension}`;
                plans.push({ from, to: this.safe(() => under(this.root, relative)), hash: integrity.sha256, relative });
            }
            atomicJson(marker, { operation_id: operationId, operation, status: 'STAGED', previous, plans });
            await this.hooks.phase?.('stage'); await this.hooks.phase?.('preserve');
            for (const plan of plans) {
                const destination = this.safe(() => under(this.root, plan.relative));
                if ((await fileIntegrity(plan.from)).sha256 !== plan.hash || existsSync(destination)) throw new Error('Managed publication changed.');
                const parent = path.posix.dirname(plan.relative);
                if (operation === 'RENAME') {
                    const parts = parent.split('/');
                    for (let n = 1; n <= parts.length; n++) {
                        const relative = parts.slice(0, n).join('/');
                        if (!existsSync(this.safe(() => under(this.root, relative)))) createdDirectories.push(relative);
                    }
                }
                this.safe(() => directory(this.root, parent));
                renameSync(this.safe(() => under(this.root, path.relative(this.root, plan.from).split(path.sep).join('/'))), destination); moved.push(plan);
            }
            await this.hooks.phase?.('publication');
            this.persistence.transaction(db => {
                if (rename) {
                    if (rename.key_changed) {
                        for (const asset of rename.unmanaged_assets) if (asset.role) setOverride(db, asset.assetId, 'ASSIGN', id, asset.role);
                        for (const m of rename.managed_assets) {
                            db.prepare('UPDATE managed_assets SET managed_relative_path = ? WHERE managed_asset_id = ?').run(m.destination, m.managed_asset_id);
                            db.prepare('UPDATE indexed_asset_files SET relative_path = ?, file_name = ? WHERE relative_path = ?')
                                .run(m.destination, path.posix.basename(m.destination), m.managed_relative_path);
                        }
                    }
                    db.prepare('UPDATE art_variants SET variant_key = ?, display_label = ?, updated_at = ? WHERE variant_id = ?')
                        .run(rename.proposed.variant_key, rename.proposed.display_label, new Date().toISOString(), id);
                } else {
                    if (removal!.preferred) writePreference(db, variant.cardId, null);
                    const owned = new Set(managed.map(m => m.managed_relative_path));
                    for (const asset of this.associated(id)) setOverride(db, asset.assetId, owned.has(asset.relativePath) ? 'IGNORE' : 'UNASSIGN');
                    for (const m of managed) {
                        const asset = this.assets.listAssets().find(a => a.relativePath === m.managed_relative_path);
                        if (asset) setOverride(db, asset.assetId, 'IGNORE');
                    }
                    db.prepare('DELETE FROM managed_asset_ingest_requests WHERE managed_asset_id IN (SELECT managed_asset_id FROM managed_assets WHERE variant_id = ?)').run(id);
                    db.prepare('DELETE FROM managed_assets WHERE variant_id = ?').run(id);
                    db.prepare('DELETE FROM variant_role_bindings WHERE variant_id = ?').run(id);
                    db.prepare("UPDATE indexed_asset_files SET card_id = NULL, variant_id = NULL, association_state = 'UNRESOLVED' WHERE variant_id = ?").run(id);
                    db.prepare('DELETE FROM art_variants WHERE variant_id = ?').run(id);
                }
            });
            await this.hooks.phase?.('database'); await this.assets.scan(); await this.hooks.phase?.('reconciliation');
            const state = this.getState(variant.cardId); const current = state.variants.find(v => v.variant_id === id);
            if (rename) {
                if (!current || current.variant_key !== rename.proposed.variant_key || current.display_label !== rename.proposed.display_label
                    || JSON.stringify({ standard: current.standard, overframe: current.overframe }) !== JSON.stringify(rename.readiness_before)) throw new Error('Rename postcondition failed.');
                for (const asset of rename.unmanaged_assets) {
                    const after = this.assets.listAssets().find(a => a.assetId === asset.assetId);
                    if (!after || after.variantId !== id || after.role !== asset.role) throw new Error('Unmanaged association changed.');
                }
            } else if (current || (removal!.preferred && state.preferred_variant_id !== null)) throw new Error('Remove postcondition failed.');
            await this.hooks.phase?.('postcondition');
            this.grants.revokeVariant(id);
            atomicJson(marker, { operation_id: operationId, operation, status: 'COMPLETE', previous, plans });
            return { operation, changed: true, operation_id: operationId, recovery_relative_path: `Temp/VariantLifecycle/${operationId}/`, ...state };
        } catch (error) {
            try {
                await this.hooks.phase?.('rollback');
                for (const plan of [...moved].reverse()) {
                    if (existsSync(plan.from) || (await fileIntegrity(plan.to)).sha256 !== plan.hash) throw new Error('Previous managed bytes cannot be proven.');
                    renameSync(plan.to, plan.from);
                    if ((await fileIntegrity(plan.from)).sha256 !== plan.hash) throw new Error('Rollback bytes differ.');
                }
                for (const relative of [...new Set(createdDirectories)].reverse()) rmdirSync(this.safe(() => under(this.root, relative)));
                this.persistence.transaction(db => restoreAssetDomain(db, previous));
                if (JSON.stringify(this.persistence.runRepositoryOperation(captureAssetDomain)) !== JSON.stringify(previous)) throw new Error('Rollback DB differs.');
                atomicJson(marker, { operation_id: operationId, operation, status: 'ROLLED_BACK', previous, plans });
            } catch {
                this.recoveryRequired('VARIANT_MUTATION_RECOVERY_REQUIRED: coherent previous lifecycle state could not be proven.');
                fail('VARIANT_MUTATION_RECOVERY_REQUIRED', 'Compensation failed; recovery material retained.', 503);
            }
            if (error instanceof VariantLifecycleError) throw error;
            fail('VARIANT_MUTATION_FAILED', 'Lifecycle operation failed; previous coherent state restored.', 503);
        }
    }
}
