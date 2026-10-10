import { randomUUID } from 'node:crypto';
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync } from 'node:fs';
import path from 'node:path';
import { WorkspacePersistence, openReadonlyDatabase, readDatabaseSchemaVersion } from '../persistence/database';
import { migrateWorkspaceDatabase, type PersistenceOperationResult } from '../persistence/operations';
import { SUPPORTED_DATABASE_SCHEMA_VERSION } from '../persistence/constants';
import { verifyCurrentMigrationHistory } from '../persistence/migrations';
import { parseWorkspaceManifest } from '../workspace/manifest';
import { SUPPORTED_WORKSPACE_FORMAT_VERSION, type WorkspaceManifest, type WorkspaceStatus } from '../workspace/types';
import type { WorkspaceRuntimeManager } from '../workspace/runtime';
import { WorkspaceRecoveryError } from './errors';
import { atomicJson, copyTree, directory, fileIntegrity, noLinks, under, walk, type Tree } from './filesystem';
import { databaseRelative, readBackupMetadata, validateBackup } from './validate';
import type { BackupKind, BackupMetadata, BackupProtection, RecoveryBoundary, RecoveryHooks } from './types';

function fail(message: string): never { throw new WorkspaceRecoveryError('BACKUP_INCOMPATIBLE', message); };

export class WorkspaceRecoveryService {
    constructor(private readonly runtime: WorkspaceRuntimeManager,
        private readonly retention = 10, private readonly hooks: RecoveryHooks = {}) {
        if (!Number.isSafeInteger(retention) || retention < 0) throw new Error('Recovery retention must be a non-negative integer.');
    }

    private get root() { return this.runtime.workspaceRoot; }
    private async boundary(boundary: RecoveryBoundary) { await this.hooks.atBoundary?.(boundary); }

    private manifest(): WorkspaceManifest {
        const parsed = parseWorkspaceManifest(readFileSync(under(this.root, 'workspace.json'), 'utf8'));
        if (!parsed.ok) fail('Active Workspace manifest is invalid.');
        if (parsed.manifest.workspace_format_version !== SUPPORTED_WORKSPACE_FORMAT_VERSION) fail('Workspace format is incompatible.');
        databaseRelative(parsed.manifest.database_path);
        return parsed.manifest;
    }

    private container(id: string) {
        if (!/^[a-zA-Z0-9_-]+$/.test(id)) throw new WorkspaceRecoveryError('BACKUP_NOT_FOUND', 'Invalid backup identifier.');
        const container = under(this.root, `Backups/${id}`);
        if (!existsSync(container)) throw new WorkspaceRecoveryError('BACKUP_NOT_FOUND', 'Backup not found.');
        return container;
    }

    async list(): Promise<BackupMetadata[]> {
        const backups = under(this.root, 'Backups');
        if (!existsSync(backups)) return [];
        if (!lstatSync(backups).isDirectory()) throw new WorkspaceRecoveryError('BACKUP_SOURCE_UNSAFE', 'Backups must be a real directory.');
        const result: BackupMetadata[] = [];
        for (const id of readdirSync(backups).sort()) {
            if (!/^[a-zA-Z0-9_-]+$/.test(id)) continue;
            try {
                const validated = await validateBackup(this.container(id));
                if (validated.metadata.backup_id === id) result.push(validated.metadata);
            } catch { /* Corrupt/incomplete containers are never advertised as valid recovery points. */ }
        }
        return result.sort((a, b) => b.created_at.localeCompare(a.created_at) || b.backup_id.localeCompare(a.backup_id));
    }

    async create(kind: BackupKind, includeOutput = false) {
        if (!['RECOVERY_POINT', 'FULL'].includes(kind) || (kind === 'RECOVERY_POINT' && includeOutput)) fail('Invalid backup request.');
        return this.runtime.maintenance.maintain('BACKUP', async () => {
            if (!['READY', 'NEEDS_MIGRATION'].includes(this.runtime.current.status.state)) fail('Active Workspace cannot be backed up in its current state.');
            const backup = await this.createOwned(kind, includeOutput, 'MANUAL');
            try { await this.prune(); }
            catch (error) { throw new WorkspaceRecoveryError('BACKUP_FAILED', 'Backup is complete but retention cleanup failed; existing checkpoints are preserved.', { cause: error }); }
            return backup;
        });
    }

    /** Called only under the owning BACKUP or MIGRATION maintenance lease. */
    private async createOwned(kind: BackupKind, includeOutput: boolean, origin: 'MANUAL' | 'PRE_MIGRATION') {
        let staging: string | undefined;
        try {
            const manifest = this.manifest();
            const databasePath = databaseRelative(manifest.database_path);
            const sourceDb = under(this.root, databasePath);
            noLinks(sourceDb);
            const source = openReadonlyDatabase(sourceDb);
            let schema: number;
            try {
                schema = readDatabaseSchemaVersion(source);
                if (schema > SUPPORTED_DATABASE_SCHEMA_VERSION) fail('Newer database schemas cannot be backed up or migrated.');
                verifyCurrentMigrationHistory(source, schema);
                if (source.pragma('quick_check', { simple: true }) !== 'ok') fail('Source database integrity check failed.');
            } finally { source.close(); }
            const id = randomUUID();
            directory(this.root, 'Backups/.staging');
            staging = directory(this.root, `Backups/.staging/${id}`);
            const payload = directory(staging, 'payload');
            const roots = ['workspace.json', databasePath, 'Config', ...(kind === 'FULL' ? ['Assets'] : []), ...(includeOutput ? ['Output'] : [])];
            const excluded = ['Temp', 'Backups', ...(kind === 'RECOVERY_POINT' ? ['Assets'] : []), ...(!includeOutput ? ['Output'] : [])];
            const excludedFiles = new Set([databasePath, `${databasePath}-wal`, `${databasePath}-shm`, `${databasePath}-journal`]);
            await copyTree(this.root, payload, { files: ['workspace.json'], directories: [] });
            const dbParent = path.posix.dirname(databasePath);
            if (dbParent !== '.') directory(payload, dbParent);
            await this.boundary('db_snapshot');
            // Use the live persistence owner when available; old schemas use a readonly SQLite owner.
            const active = this.runtime.current.persistence;
            const temporary = active ? null : new WorkspacePersistence(openReadonlyDatabase(sourceDb),
                { foreignKeys: false, journalMode: 'readonly', busyTimeoutMs: 0 });
            try { await (active ?? temporary)!.backupTo(under(payload, databasePath)); }
            finally { temporary?.close(); }
            const absent: string[] = [];
            for (const subtree of ['Config', ...(kind === 'FULL' ? ['Assets'] : []), ...(includeOutput ? ['Output'] : [])]) {
                await this.boundary(subtree === 'Config' ? 'config_copy' : 'asset_copy');
                const sourcePath = under(this.root, subtree);
                directory(payload, subtree);
                if (!existsSync(sourcePath)) { absent.push(subtree); continue; }
                if (!lstatSync(sourcePath).isDirectory()) throw new WorkspaceRecoveryError('BACKUP_SOURCE_UNSAFE', 'Backup source subtree is not a directory.');
                const tree = walk(this.root, subtree, excludedFiles);
                // Parents may already have been made for the SQLite snapshot.
                await copyTree(this.root, payload, tree);
            }
            const tree = walk(payload);
            const files = [];
            for (const rel of tree.files) files.push({ relative_path: rel, ...await fileIntegrity(under(payload, rel)) });
            const metadata: BackupMetadata = {
                backup_format_version: 1, backup_id: id, kind, workspace_id: manifest.workspace_id,
                workspace_format_version: manifest.workspace_format_version, database_schema_version: schema,
                created_at: new Date().toISOString(), origin, reason: origin === 'MANUAL' ? 'Explicit backup' : 'Pre-migration checkpoint',
                include_output: includeOutput, included_roots: roots, excluded_roots: excluded, source_database_path: databasePath,
                files, directories: tree.directories, absent_source_roots: absent, completion_state: 'COMPLETE',
                protection_state: origin === 'PRE_MIGRATION' ? 'MIGRATION_PENDING' : 'NONE',
            };
            await this.boundary('metadata_finalization');
            atomicJson(under(staging, 'backup.json'), metadata);
            await validateBackup(staging, manifest.workspace_id);
            await this.boundary('backup_publish');
            renameSync(staging, under(this.root, `Backups/${id}`));
            staging = undefined;
            return metadata;
        } catch (error) {
            if (staging) {
                try { noLinks(staging); rmSync(staging, { recursive: true, force: true }); }
                catch { /* Hidden staging is preserved if cleanup is unsafe or unavailable. */ }
            }
            if (error instanceof WorkspaceRecoveryError) throw error;
            throw new WorkspaceRecoveryError('BACKUP_FAILED', 'Backup did not complete.', { cause: error });
        }
    }

    private protection(id: string, state: BackupProtection) {
        const container = this.container(id);
        const metadata = readBackupMetadata(container);
        atomicJson(under(container, 'backup.json'), { ...metadata, protection_state: state });
    }

    private async prune() {
        const candidates = (await this.list()).filter(b => b.kind === 'RECOVERY_POINT'
            && b.origin === 'PRE_MIGRATION' && b.protection_state === 'NONE');
        for (const backup of candidates.slice(this.retention)) {
            await this.boundary('retention_cleanup');
            const container = this.container(backup.backup_id);
            // Revalidate protection immediately before removal; never touch .staging.
            const latest = readBackupMetadata(container);
            if (latest.protection_state !== 'NONE' || latest.origin !== 'PRE_MIGRATION' || latest.kind !== 'RECOVERY_POINT') continue;
            noLinks(container);
            rmSync(container, { recursive: true });
        }
    }

    async migrate() {
        return this.runtime.maintenance.maintain('MIGRATION', async () => {
            if (this.runtime.current.status.state === 'READY') return { migrated: false, status: this.runtime.current.status, backup_id: null };
            if (this.runtime.current.status.state !== 'NEEDS_MIGRATION') fail('Workspace is not eligible for migration.');
            const manifest = this.manifest();
            let checkpoint: BackupMetadata;
            try { checkpoint = await this.createOwned('RECOVERY_POINT', false, 'PRE_MIGRATION'); }
            catch (error) { throw new WorkspaceRecoveryError('MIGRATION_BACKUP_FAILED', 'Migration was not started because its checkpoint failed.', { cause: error }); }
            let result: PersistenceOperationResult;
            let status: WorkspaceStatus;
            try {
                this.runtime.closePersistence();
                await this.boundary('migration');
                result = migrateWorkspaceDatabase(this.root, manifest);
                status = await this.runtime.reload();
                if (status.state !== 'READY' || status.database_schema_version !== SUPPORTED_DATABASE_SCHEMA_VERSION) {
                    throw new Error('Post-migration Workspace inspection did not prove READY.');
                }
            } catch (error) {
                // Keep pending protection even if updating the failure metadata itself fails.
                try { this.protection(checkpoint.backup_id, 'MIGRATION_FAILED'); } catch { /* pending remains protected */ }
                try { await this.runtime.reload(); }
                catch { this.runtime.recoveryRequired('Migration failed and Workspace could not be re-inspected.'); }
                throw new WorkspaceRecoveryError('RECOVERY_REQUIRED', 'Migration did not complete; its checkpoint is preserved.', { cause: error });
            }
            // READY proves migration correctness. Later maintenance cannot invalidate that result.
            const maintenanceWarnings: Array<{ code: string; message: string }> = [];
            try { this.protection(checkpoint.backup_id, 'NONE'); }
            catch {
                maintenanceWarnings.push({ code: 'CHECKPOINT_PROTECTION_UPDATE_FAILED',
                    message: 'Migration completed, but its checkpoint protection metadata could not be updated.' });
            }
            try { await this.prune(); }
            catch {
                maintenanceWarnings.push({ code: 'RETENTION_CLEANUP_FAILED',
                    message: 'Migration completed, but automatic recovery point retention cleanup failed.' });
            }
            return { migrated: true, backup_id: checkpoint.backup_id, ...result, status,
                maintenance_warnings: maintenanceWarnings };
        });
    }

    async restore(id: string) {
        // Validate and stage before acquiring exclusive ownership of active-state replacement.
        const operation = async () => {
            let releaseMaintenance: (() => void) | undefined;
            let operationRoot: string | undefined;
            let marker: { state: string; backup_id: string; moved: string[]; installed: string[] } | undefined;
            let closed = false;
            const moved: string[] = [];
            const installed: string[] = [];
            const operationId = randomUUID();
            const saveMarker = () => atomicJson(under(operationRoot!, 'restore-state.json'), marker);
            try {
                await this.boundary('restore_validation');
                const container = this.container(id);
                let expectedId: string | undefined;
                // Preserve a readable identity even when other active manifest fields are broken.
                try {
                    const raw: unknown = JSON.parse(readFileSync(under(this.root, 'workspace.json'), 'utf8'));
                    if (raw && typeof raw === 'object' && 'workspace_id' in raw && typeof raw.workspace_id === 'string'
                        && raw.workspace_id.trim()) expectedId = raw.workspace_id;
                } catch (error) {
                    if (error instanceof WorkspaceRecoveryError) throw error;
                }
                const validated = await validateBackup(container, expectedId);
                if (validated.metadata.backup_id !== id) throw new WorkspaceRecoveryError('BACKUP_INVALID', 'Backup identifier disagrees with directory.');
                operationRoot = directory(this.root, `Temp/Restore/${operationId}`);
                const incoming = directory(operationRoot, 'incoming');
                const previous = directory(operationRoot, 'previous');
                await copyTree(validated.payload, incoming, walk(validated.payload));
                // Validate the actual staged bytes again, before touching active components.
                for (const file of validated.metadata.files) {
                    const actual = await fileIntegrity(under(incoming, file.relative_path));
                    if (actual.sha256 !== file.sha256 || actual.size_bytes !== file.size_bytes) throw new WorkspaceRecoveryError('BACKUP_INVALID', 'Staged incoming payload changed.');
                }
                releaseMaintenance = this.runtime.maintenance.acquireMaintenance('RESTORE');
                // Recheck identity after staging, in case another authorized restore completed meanwhile.
                try {
                    const raw: unknown = JSON.parse(readFileSync(under(this.root, 'workspace.json'), 'utf8'));
                    if (raw && typeof raw === 'object' && 'workspace_id' in raw && typeof raw.workspace_id === 'string'
                        && raw.workspace_id.trim() && raw.workspace_id !== validated.metadata.workspace_id) {
                        throw new WorkspaceRecoveryError('WORKSPACE_ID_MISMATCH', 'Active identity changed before restore replacement.');
                    }
                } catch (error) { if (error instanceof WorkspaceRecoveryError) throw error; }
                const newDb = validated.metadata.source_database_path;
                let oldDb: string | undefined;
                try { oldDb = databaseRelative(this.manifest().database_path); } catch { /* invalid manifest: recover known incoming path only */ }
                const roots = ['workspace.json', newDb, 'Config', ...(validated.metadata.kind === 'FULL' ? ['Assets'] : []),
                    ...(validated.metadata.include_output ? ['Output'] : [])];
                const uniqueRoots = (values: string[]) => [...new Set(values)].filter(rel => !values.some(other => other !== rel && rel.startsWith(`${other}/`)));
                const targets = uniqueRoots(roots);
                const affected = uniqueRoots([...targets, ...(oldDb ? [oldDb] : []),
                    ...[newDb, ...(oldDb ? [oldDb] : [])].flatMap(db => [`${db}-wal`, `${db}-shm`, `${db}-journal`])]);
                for (const rel of affected) under(this.root, rel); // Reject links before closing the runtime.
                marker = { state: 'ACTIVE', backup_id: id, moved, installed };
                saveMarker();
                this.runtime.closePersistence(); closed = true;
                for (const rel of affected) {
                    const active = under(this.root, rel);
                    if (!existsSync(active)) continue;
                    await this.boundary('active_move');
                    const target = under(previous, rel);
                    mkdirSync(path.dirname(target), { recursive: true });
                    renameSync(active, target); moved.push(rel); saveMarker();
                }
                for (const rel of targets) {
                    await this.boundary('incoming_publish');
                    const active = under(this.root, rel);
                    mkdirSync(path.dirname(active), { recursive: true });
                    renameSync(under(incoming, rel), active); installed.push(rel); saveMarker();
                }
                await this.boundary('runtime_reopen');
                const status = await this.runtime.reload(true);
                await this.boundary('post_restore_inspection');
                const expectedState = validated.metadata.database_schema_version === SUPPORTED_DATABASE_SCHEMA_VERSION ? 'READY' : 'NEEDS_MIGRATION';
                if (status.state !== expectedState || status.workspace_id !== validated.manifest.workspace_id
                    || status.database_schema_version !== validated.metadata.database_schema_version) throw new Error('Post-restore inspection failed.');
                marker.state = 'SUCCESS'; saveMarker();
                // A successful explicit restore resolves older interrupted markers while preserving their recovery material.
                this.resolveOlderMarkers(operationId);
                const verified = await this.runtime.reload();
                if (verified.state !== expectedState) throw new Error('Final restore inspection failed.');
                return { operation: 'RESTORE' as const, restored: true, backup_id: id,
                    restored_at: new Date().toISOString(), workspace_id: verified.workspace_id,
                    database_schema_version: verified.database_schema_version, status: verified };
            } catch (error) {
                if (closed && operationRoot && marker) {
                    try {
                        marker.state = 'ACTIVE'; saveMarker();
                        this.runtime.closePersistence();
                        await this.boundary('rollback');
                        for (const rel of [...installed].reverse()) {
                            const active = under(this.root, rel);
                            if (existsSync(active)) rmSync(active, { recursive: true });
                        }
                        // A failed reopened SQLite connection may have created fresh sidecars.
                        for (const rel of installed.filter(rel => rel !== 'workspace.json' && !['Config', 'Assets', 'Output'].includes(rel))) {
                            for (const suffix of ['-wal', '-shm', '-journal']) rmSync(under(this.root, `${rel}${suffix}`), { force: true });
                        }
                        for (const rel of [...moved].reverse()) {
                            const active = under(this.root, rel);
                            mkdirSync(path.dirname(active), { recursive: true });
                            renameSync(under(operationRoot, `previous/${rel}`), active);
                        }
                        const status = await this.runtime.reload(true);
                        if (!['READY', 'NEEDS_MIGRATION'].includes(status.state)) throw new Error('Rollback did not prove a valid Workspace.');
                        marker.state = 'ROLLED_BACK'; saveMarker();
                    } catch {
                        this.runtime.recoveryRequired('Restore failed and rollback could not prove a valid Workspace. Recovery material is preserved.');
                        throw new WorkspaceRecoveryError('RECOVERY_REQUIRED', 'Restore failed; explicit recovery is required.', { cause: error });
                    }
                }
                if (error instanceof WorkspaceRecoveryError) throw error;
                throw new WorkspaceRecoveryError('RESTORE_FAILED', 'Restore did not complete.', { cause: error });
            } finally { releaseMaintenance?.(); }
        };
        return operation();
    }

    private resolveOlderMarkers(currentId: string) {
        const lifecycleRoot = under(this.root, 'Temp/VariantLifecycle');
        if (existsSync(lifecycleRoot)) for (const id of readdirSync(lifecycleRoot)) {
            const markerPath = under(lifecycleRoot, `${id}/operation.json`);
            if (!existsSync(markerPath)) continue;
            const marker = JSON.parse(readFileSync(markerPath, 'utf8')) as { status?: string };
            if (!['COMPLETE', 'ROLLED_BACK', 'RESOLVED'].includes(marker.status ?? '')) atomicJson(markerPath, { ...marker, status: 'RESOLVED', resolved_by: currentId });
        }
        const parent = under(this.root, 'Temp/Restore');
        for (const id of readdirSync(parent)) {
            if (id === currentId) continue;
            const markerPath = under(parent, `${id}/restore-state.json`);
            if (!existsSync(markerPath)) continue;
            try {
                const marker: unknown = JSON.parse(readFileSync(markerPath, 'utf8'));
                if (marker && typeof marker === 'object' && 'state' in marker && marker.state !== 'SUCCESS' && marker.state !== 'ROLLED_BACK' && marker.state !== 'RESOLVED') {
                    atomicJson(markerPath, { ...marker, state: 'RESOLVED', resolved_by: currentId });
                }
            } catch { throw new WorkspaceRecoveryError('RECOVERY_REQUIRED', 'An older restore marker could not be resolved safely.'); }
        }
    }
}
