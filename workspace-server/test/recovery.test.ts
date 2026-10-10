import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import Database from 'better-sqlite3';
import { createWorkspaceService, type WorkspaceService } from '../src/service';
import { bootstrapWorkspaceDatabase } from '../src/persistence/operations';
import { inspectWorkspaceRoot } from '../src/workspace/inspect';
import { loadWorkspaceConfig } from '../src/config';
import { WorkspaceRecoveryError } from '../src/recovery/errors';
import type { BackupMetadata, RecoveryBoundary, RecoveryHooks } from '../src/recovery/types';
import { safeRelative } from '../src/recovery/filesystem';
import { WorkspaceMaintenanceCoordinator } from '../src/workspace/maintenance';

const roots: string[] = [];
const services: WorkspaceService[] = [];
const value = (databasePath = 'Data/workspace.db') => ({ workspace_id: 'run010-identity', workspace_format_version: 1,
    database_path: databasePath, created_at: '2026-10-09T00:00:00.000Z', name: 'Recovery 日本語' });
const setup = async (options: { old?: boolean; db?: string; hooks?: RecoveryHooks; retention?: number } = {}) => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'YU3DOH recovery spaces 日本語 ')); roots.push(root);
    const manifest = value(options.db);
    await writeFile(path.join(root, 'workspace.json'), JSON.stringify(manifest));
    if (options.old) {
        await mkdir(path.dirname(path.join(root, manifest.database_path)), { recursive: true });
        new Database(path.join(root, manifest.database_path)).close();
    } else bootstrapWorkspaceDatabase(root, manifest);
    await mkdir(path.join(root, 'Config', 'nested 日本語'), { recursive: true });
    await writeFile(path.join(root, 'Config', 'nested 日本語', 'settings.txt'), 'original config');
    await mkdir(path.join(root, 'Assets', 'subfolder 日本語'), { recursive: true });
    await writeFile(path.join(root, 'Assets', 'subfolder 日本語', 'asset.txt'), 'original asset');
    await mkdir(path.join(root, 'Output')); await writeFile(path.join(root, 'Output', 'render.txt'), 'original output');
    await mkdir(path.join(root, 'Temp')); await writeFile(path.join(root, 'Temp', 'exclude.txt'), 'temporary');
    const service = await createWorkspaceService({ workspaceRoot: root, host: '127.0.0.1', port: 4312,
        automaticRecoveryPointRetention: options.retention ?? 10 }, { recoveryHooks: options.hooks ?? {} });
    services.push(service);
    return { root, service, manifest };
};
const errorCode = (code: string) => (error: unknown) => error instanceof WorkspaceRecoveryError && error.code === code;
const metadataPath = (root: string, backup: BackupMetadata) => path.join(root, 'Backups', backup.backup_id, 'backup.json');
const payloadPath = (root: string, backup: BackupMetadata, rel: string) => path.join(root, 'Backups', backup.backup_id, 'payload', ...rel.split('/'));
const configureMetadata = (root: string, backup: BackupMetadata, delta: Partial<BackupMetadata>) =>
    writeFileSync(metadataPath(root, backup), JSON.stringify({ ...backup, ...delta }));
const dbCards = (service: WorkspaceService) => service.persistence!.runRepositoryOperation(db =>
    (db.prepare('SELECT COUNT(*) AS n FROM canonical_cards').get() as { n: number }).n);
const defer = () => {
    let resolve!: () => void;
    const promise = new Promise<void>(r => { resolve = r; });
    return { promise, resolve };
};

test.after(async () => {
    for (const service of services) await service.close();
    for (const root of roots) await rm(root, { recursive: true, force: true });
});

test('AC07/14/15/17/18: recovery point snapshots live WAL coherently with complete Config and hashes', async () => {
    const { root, service } = await setup();
    service.canonical!.createCard({ family: 'MONSTER', password: '12345678' });
    service.persistence!.runRepositoryOperation(db => db.pragma('wal_autocheckpoint = 0'));
    service.canonical!.createCard({ family: 'SPELL' });
    assert.ok(existsSync(path.join(root, 'Data/workspace.db-wal')));
    const manifestBefore = await readFile(path.join(root, 'workspace.json'));
    const backup = await service.recovery.create('RECOVERY_POINT');
    assert.equal(backup.backup_format_version, 1); assert.equal(backup.database_schema_version, 6);
    assert.equal(backup.workspace_id, value().workspace_id); assert.equal(backup.completion_state, 'COMPLETE');
    assert.deepEqual(backup.included_roots, ['workspace.json', 'Data/workspace.db', 'Config']);
    assert.deepEqual(backup.excluded_roots, ['Temp', 'Backups', 'Assets', 'Output']);
    assert.equal(backup.origin, 'MANUAL'); assert.equal(backup.protection_state, 'NONE');
    assert.equal(backup.include_output, false); assert.ok(!Number.isNaN(Date.parse(backup.created_at)));
    for (const file of backup.files) {
        const bytes = await readFile(payloadPath(root, backup, file.relative_path));
        assert.equal(file.size_bytes, bytes.length);
        assert.equal(file.sha256, createHash('sha256').update(bytes).digest('hex'));
    }
    const snapshot = new Database(payloadPath(root, backup, 'Data/workspace.db'), { readonly: true });
    assert.equal((snapshot.prepare('SELECT COUNT(*) AS n FROM canonical_cards').get() as { n: number }).n, 2);
    assert.equal(snapshot.pragma('quick_check', { simple: true }), 'ok'); snapshot.close();
    assert.deepEqual(await readFile(path.join(root, 'workspace.json')), manifestBefore);
    assert.equal(dbCards(service), 2);
    assert.equal(await readFile(path.join(root, 'Config/nested 日本語/settings.txt'), 'utf8'), 'original config');
    assert.deepEqual((await service.recovery.list()).map(b => b.backup_id), [backup.backup_id]);
    assert.ok(!(await inspectWorkspaceRoot(path.join(root, 'Backups', backup.backup_id))).state.includes('READY'));
});

test('AC08..13/20: Full includes Assets, optional Output, preserves Unicode/spaces/custom DB structure', async () => {
    const { root, service } = await setup({ db: 'Custom data 日本語/live.db' });
    const full = await service.recovery.create('FULL');
    assert.ok(full.files.some(f => f.relative_path === 'Assets/subfolder 日本語/asset.txt'));
    assert.ok(full.files.some(f => f.relative_path === 'Custom data 日本語/live.db'));
    assert.ok(!full.files.some(f => /^(Temp|Backups|Output)\//.test(f.relative_path)));
    const output = await service.recovery.create('FULL', true);
    assert.ok(output.files.some(f => f.relative_path === 'Output/render.txt'));
    assert.equal(await readFile(payloadPath(root, output, 'Assets/subfolder 日本語/asset.txt'), 'utf8'), 'original asset');
    await assert.rejects(service.recovery.create('RECOVERY_POINT', true), errorCode('BACKUP_INCOMPATIBLE'));
});

test('AC07: absent Config is explicitly represented with an empty directory', async () => {
    const { root, service } = await setup();
    await rm(path.join(root, 'Config'), { recursive: true });
    const backup = await service.recovery.create('RECOVERY_POINT');
    assert.deepEqual(backup.absent_source_roots, ['Config']); assert.ok(backup.directories.includes('Config'));
    assert.deepEqual(readdirSync(payloadPath(root, backup, 'Config')), []);
    assert.equal((await service.recovery.list()).length, 1);
});

test('DB snapshot is substituted inside Config rather than raw-copying WAL DB/sidecars', async () => {
    const { root, service } = await setup({ db: 'Config/SQLite/live.db' });
    service.canonical!.createCard({ family: 'TRAP' });
    const backup = await service.recovery.create('RECOVERY_POINT');
    assert.equal(backup.files.filter(f => f.relative_path === 'Config/SQLite/live.db').length, 1);
    assert.ok(!backup.files.some(f => /-(wal|shm)$/.test(f.relative_path)));
    await service.recovery.restore(backup.backup_id); assert.equal(dbCards(service), 1);
    assert.equal(await readFile(path.join(root, 'Config/nested 日本語/settings.txt'), 'utf8'), 'original config');
});

test('AC22/23/28/30..32/47: lightweight restores exact checkpoint and routes resolve fresh runtime', async () => {
    const { root, service } = await setup();
    const card = service.canonical!.createCard({ family: 'MONSTER' });
    const backup = await service.recovery.create('RECOVERY_POINT');
    const old = service.persistence!; const oldDomain = service.canonical!;
    const oldServices = [service.assets, service.managedAssets, service.library, service.libraryAssets, service.carderPrepare];
    service.canonical!.createCard({ family: 'SPELL' });
    await writeFile(path.join(root, 'Config/nested 日本語/settings.txt'), 'changed config');
    await writeFile(path.join(root, 'Assets/subfolder 日本語/asset.txt'), 'changed asset');
    await writeFile(path.join(root, 'Output/render.txt'), 'changed output');
    const result = await service.app.inject({ method: 'POST', url: `/api/v1/workspace/backups/${backup.backup_id}/restore` });
    assert.equal(result.statusCode, 200, result.body); assert.equal(result.json().status.state, 'READY');
    assert.equal(old.isOpen, false); assert.notEqual(service.persistence, old);
    for (const [index, next] of [service.assets, service.managedAssets, service.library, service.libraryAssets, service.carderPrepare].entries()) assert.notEqual(next, oldServices[index]);
    assert.throws(() => oldDomain.getCard(card.cardId), /closed/);
    assert.equal(dbCards(service), 1); assert.equal(service.status.workspace_id, value().workspace_id);
    assert.equal(await readFile(path.join(root, 'Config/nested 日本語/settings.txt'), 'utf8'), 'original config');
    assert.equal(await readFile(path.join(root, 'Assets/subfolder 日本語/asset.txt'), 'utf8'), 'changed asset');
    assert.equal(await readFile(path.join(root, 'Output/render.txt'), 'utf8'), 'changed output');
    const detail = await service.app.inject({ method: 'GET', url: `/api/v1/library/cards/${card.cardId}` });
    assert.equal(detail.statusCode, 200, detail.body);
    const created = await service.app.inject({ method: 'POST', url: '/api/v1/library/cards', payload: { family: 'TRAP' } });
    assert.equal(created.statusCode, 200, created.body); assert.equal(dbCards(service), 2);
    assert.equal((await inspectWorkspaceRoot(root)).state, 'READY');
});

test('AC29: Full restores Assets and includes Output only when explicitly captured', async () => {
    const { root, service } = await setup();
    const full = await service.recovery.create('FULL');
    await writeFile(path.join(root, 'Assets/subfolder 日本語/asset.txt'), 'changed');
    await writeFile(path.join(root, 'Assets/extra.txt'), 'remove on full restore');
    await writeFile(path.join(root, 'Output/render.txt'), 'keep');
    await service.recovery.restore(full.backup_id);
    assert.equal(await readFile(path.join(root, 'Assets/subfolder 日本語/asset.txt'), 'utf8'), 'original asset');
    assert.equal(existsSync(path.join(root, 'Assets/extra.txt')), false);
    assert.equal(await readFile(path.join(root, 'Output/render.txt'), 'utf8'), 'keep');
    const output = await service.recovery.create('FULL', true);
    await writeFile(path.join(root, 'Output/render.txt'), 'changed again');
    await service.recovery.restore(output.backup_id);
    assert.equal(await readFile(path.join(root, 'Output/render.txt'), 'utf8'), 'keep');
});

for (const scenario of ['identity', 'tamper', 'missing', 'partial', 'version', 'schema', 'unsafe', 'undeclared', 'kind']) {
    test(`AC24..27: restore rejects ${scenario} before active replacement`, async () => {
        const { root, service } = await setup();
        const backup = await service.recovery.create('RECOVERY_POINT');
        const persistence = service.persistence;
        let code = 'BACKUP_INVALID';
        if (scenario === 'identity') { await writeFile(path.join(root, 'workspace.json'), JSON.stringify({ ...value(), workspace_id: 'other' })); code = 'WORKSPACE_ID_MISMATCH'; }
        if (scenario === 'tamper') await writeFile(payloadPath(root, backup, 'Config/nested 日本語/settings.txt'), 'tampered');
        if (scenario === 'missing') await rm(payloadPath(root, backup, 'Data/workspace.db'));
        if (scenario === 'partial') { configureMetadata(root, backup, { completion_state: 'INCOMPLETE' as 'COMPLETE' }); code = 'BACKUP_INCOMPLETE'; }
        if (scenario === 'version') { configureMetadata(root, backup, { backup_format_version: 2 as 1 }); code = 'BACKUP_INCOMPATIBLE'; }
        if (scenario === 'schema') { configureMetadata(root, backup, { database_schema_version: 7 }); code = 'BACKUP_INCOMPATIBLE'; }
        if (scenario === 'unsafe') { configureMetadata(root, backup, { files: [...backup.files, { relative_path: '../escape', size_bytes: 0, sha256: '0'.repeat(64) }] }); code = 'BACKUP_SOURCE_UNSAFE'; }
        if (scenario === 'undeclared') await writeFile(payloadPath(root, backup, 'extra.txt'), 'not inventoried');
        if (scenario === 'kind') configureMetadata(root, backup, { kind: 'FULL' });
        const before = await readFile(path.join(root, 'workspace.json'));
        await assert.rejects(service.recovery.restore(backup.backup_id), errorCode(code));
        assert.deepEqual(await readFile(path.join(root, 'workspace.json')), before);
        assert.equal(service.persistence, persistence); assert.equal(persistence!.isOpen, true);
    });
}

test('AC16/43: staging and incomplete containers are never listed and never pruned', async () => {
    const { root, service } = await setup({ retention: 0 });
    await mkdir(path.join(root, 'Backups/.staging/active'), { recursive: true });
    await writeFile(path.join(root, 'Backups/.staging/active/evidence.txt'), 'preserve');
    await mkdir(path.join(root, 'Backups/incomplete'), { recursive: true });
    await writeFile(path.join(root, 'Backups/incomplete/backup.json'), JSON.stringify({ completion_state: 'INCOMPLETE' }));
    assert.deepEqual(await service.recovery.list(), []);
    await service.recovery.create('FULL');
    assert.ok(existsSync(path.join(root, 'Backups/.staging/active/evidence.txt')));
    assert.ok(existsSync(path.join(root, 'Backups/incomplete/backup.json')));
});

for (const boundary of ['db_snapshot', 'config_copy', 'asset_copy', 'metadata_finalization', 'backup_publish'] as RecoveryBoundary[]) {
    test(`failure injection: ${boundary} leaves no completed partial backup and preserves source`, async () => {
        const { root, service } = await setup({ hooks: { atBoundary: b => { if (b === boundary) throw new Error(`injected ${b}`); } } });
        service.canonical!.createCard({ family: 'TRAP' });
        await assert.rejects(service.recovery.create('FULL'), errorCode('BACKUP_FAILED'));
        assert.deepEqual(await service.recovery.list(), []); assert.equal(dbCards(service), 1);
        assert.equal(service.status.state, 'READY');
        assert.equal(await readFile(path.join(root, 'Config/nested 日本語/settings.txt'), 'utf8'), 'original config');
        assert.equal(await readFile(path.join(root, 'Assets/subfolder 日本語/asset.txt'), 'utf8'), 'original asset');
        assert.equal(service.runtime.maintenance.mode, 'NORMAL');
    });
}

for (const boundary of ['restore_validation', 'active_move', 'incoming_publish', 'runtime_reopen', 'post_restore_inspection'] as RecoveryBoundary[]) {
    test(`failure injection: ${boundary} never reports restore SUCCESS and active state is preserved/rolled back`, async () => {
        let enabled = false;
        const { root, service } = await setup({ hooks: { atBoundary: b => { if (enabled && b === boundary) throw new Error(`injected ${b}`); } } });
        const backup = await service.recovery.create('FULL');
        service.canonical!.createCard({ family: 'TRAP' });
        await writeFile(path.join(root, 'Assets/subfolder 日本語/asset.txt'), 'current');
        enabled = true;
        await assert.rejects(service.recovery.restore(backup.backup_id), errorCode('RESTORE_FAILED'));
        assert.equal(service.status.state, 'READY'); assert.equal(dbCards(service), 1);
        assert.equal(await readFile(path.join(root, 'Assets/subfolder 日本語/asset.txt'), 'utf8'), 'current');
        assert.equal((await service.recovery.list()).length, 1);
        assert.equal((await inspectWorkspaceRoot(root)).state, 'READY');
    });
}

test('failure after first active move rolls back a partially moved Workspace', async () => {
    let moves = 0;
    const { service } = await setup({ hooks: { atBoundary: b => { if (b === 'active_move' && ++moves === 2) throw new Error('second move fails'); } } });
    const backup = await service.recovery.create('RECOVERY_POINT');
    service.canonical!.createCard({ family: 'SPELL' });
    await assert.rejects(service.recovery.restore(backup.backup_id), errorCode('RESTORE_FAILED'));
    assert.equal(dbCards(service), 1); assert.equal(service.status.state, 'READY');
});

test('AC34..36: unprovable rollback is RECOVERY_REQUIRED and explicit recovery resolves interrupted marker', async () => {
    let enabled = false;
    const { root, service } = await setup({ hooks: { atBoundary: b => { if (enabled && ['incoming_publish', 'rollback'].includes(b)) throw new Error('injected rollback failure'); } } });
    const backup = await service.recovery.create('FULL'); enabled = true;
    await assert.rejects(service.recovery.restore(backup.backup_id), errorCode('RECOVERY_REQUIRED'));
    assert.equal(service.status.state, 'RECOVERY_REQUIRED'); assert.equal(service.persistence, null);
    assert.equal((await service.recovery.list()).length, 1);
    const restoreRoot = path.join(root, 'Temp/Restore');
    const operation = readdirSync(restoreRoot)[0]!;
    assert.ok(existsSync(path.join(restoreRoot, operation, 'previous/workspace.json')));
    await service.close();
    const recovered = await createWorkspaceService({ workspaceRoot: root, host: '127.0.0.1', port: 4312 }); services.push(recovered);
    assert.notEqual(recovered.status.state, 'READY');
    const result = await recovered.app.inject({ method: 'POST', url: `/api/v1/workspace/backups/${backup.backup_id}/restore` });
    assert.equal(result.statusCode, 200, result.body); assert.equal(recovered.status.state, 'READY');
    assert.ok(existsSync(path.join(restoreRoot, operation, 'previous/workspace.json')));
});

test('AC35: startup with ACTIVE marker and otherwise valid Workspace must not be READY', async () => {
    const { root, service } = await setup(); const backup = await service.recovery.create('RECOVERY_POINT');
    await service.close();
    await mkdir(path.join(root, 'Temp/Restore/interrupted'), { recursive: true });
    await writeFile(path.join(root, 'Temp/Restore/interrupted/restore-state.json'), JSON.stringify({ state: 'ACTIVE' }));
    const interrupted = await createWorkspaceService({ workspaceRoot: root, host: '127.0.0.1', port: 4312 }); services.push(interrupted);
    assert.equal(interrupted.status.state, 'RECOVERY_REQUIRED'); assert.equal(interrupted.persistence, null);
    assert.equal((await interrupted.recovery.list()).length, 1);
    await interrupted.recovery.restore(backup.backup_id); assert.equal(interrupted.status.state, 'READY');
});

test('AC36: corrupted active DB does not block valid backup listing/restore', async () => {
    const { root, service } = await setup(); const backup = await service.recovery.create('RECOVERY_POINT');
    await service.close(); await writeFile(path.join(root, 'Data/workspace.db'), 'corrupt SQLite');
    const recovery = await createWorkspaceService({ workspaceRoot: root, host: '127.0.0.1', port: 4312 }); services.push(recovery);
    assert.equal(recovery.status.state, 'RECOVERY_REQUIRED');
    assert.equal((await recovery.recovery.list()).length, 1);
    await recovery.recovery.restore(backup.backup_id); assert.equal(recovery.status.state, 'READY');
});

test('AC37/39/40: API migration checkpoints before schema changes, verifies history, no-op creates nothing', async () => {
    const { root, service } = await setup({ old: true, hooks: { atBoundary: b => {
        if (b === 'migration') {
            const backups = readdirSync(path.join(root, 'Backups')).filter(id => !id.startsWith('.'));
            assert.equal(backups.length, 1);
            const metadata: BackupMetadata = JSON.parse(readFileSync(path.join(root, 'Backups', backups[0]!, 'backup.json'), 'utf8'));
            assert.equal(metadata.database_schema_version, 0); assert.equal(metadata.protection_state, 'MIGRATION_PENDING');
            const db = new Database(path.join(root, 'Data/workspace.db')); assert.equal(db.pragma('user_version', { simple: true }), 0); db.close();
        }
    } } });
    const result = await service.app.inject({ method: 'POST', url: '/api/v1/workspace/migrate' });
    assert.equal(result.statusCode, 200, result.body); assert.equal(result.json().migrated, true);
    assert.deepEqual(result.json().appliedVersions, [1, 2, 3, 4, 5, 6]); assert.equal(service.status.state, 'READY');
    const backups = await service.recovery.list(); assert.equal(backups.length, 1); assert.equal(backups[0]!.protection_state, 'NONE');
    const noOp = await service.recovery.migrate(); assert.equal(noOp.migrated, false); assert.equal((await service.recovery.list()).length, 1);
});

test('AC38/42: failure after checkpoint preserves protected snapshot and original schema', async () => {
    const { root, service } = await setup({ old: true, retention: 0, hooks: { atBoundary: b => {
        if (b === 'migration') {
            const db = new Database(path.join(root, 'Data/workspace.db')); db.exec('CREATE TABLE intermediate (id INTEGER)'); db.close();
            throw new Error('migration failure after first mutation');
        }
    } } });
    await assert.rejects(service.recovery.migrate(), errorCode('RECOVERY_REQUIRED'));
    const backups = await service.recovery.list(); assert.equal(backups.length, 1); assert.equal(backups[0]!.protection_state, 'MIGRATION_FAILED');
    assert.equal(backups[0]!.origin, 'PRE_MIGRATION'); assert.equal(backups[0]!.database_schema_version, 0);
    await service.recovery.restore(backups[0]!.backup_id); assert.equal(service.status.state, 'NEEDS_MIGRATION');
    const db = new Database(path.join(root, 'Data/workspace.db'));
    assert.equal(db.prepare("SELECT name FROM sqlite_master WHERE name = 'intermediate'").get(), undefined); db.close();
    assert.equal((await service.recovery.list())[0]!.protection_state, 'MIGRATION_FAILED');
});

test('checkpoint failure prevents migration from performing any schema mutation', async () => {
    let migrated = false;
    const { root, service } = await setup({ old: true, hooks: { atBoundary: b => {
        if (b === 'db_snapshot') throw new Error('snapshot failed'); if (b === 'migration') migrated = true;
    } } });
    await assert.rejects(service.recovery.migrate(), errorCode('MIGRATION_BACKUP_FAILED'));
    assert.equal(migrated, false); assert.deepEqual(await service.recovery.list(), []);
    const db = new Database(path.join(root, 'Data/workspace.db')); assert.equal(db.pragma('user_version', { simple: true }), 0); db.close();
});

test('AC41..44: bounded retention prunes only unprotected automatic ordinary recovery points', async () => {
    const { root, service } = await setup({ retention: 2 });
    const ordinary: string[] = [];
    for (let i = 0; i < 5; i++) {
        const backup = await service.recovery.create('RECOVERY_POINT');
        configureMetadata(root, backup, { origin: 'PRE_MIGRATION' }); ordinary.push(backup.backup_id);
    }
    const pending = await service.recovery.create('RECOVERY_POINT'); configureMetadata(root, pending, { origin: 'PRE_MIGRATION', protection_state: 'MIGRATION_PENDING' });
    const failed = await service.recovery.create('RECOVERY_POINT'); configureMetadata(root, failed, { origin: 'PRE_MIGRATION', protection_state: 'MIGRATION_FAILED' });
    const full = await service.recovery.create('FULL'); const manual = await service.recovery.create('RECOVERY_POINT');
    const backups = await service.recovery.list();
    assert.equal(backups.filter(b => b.origin === 'PRE_MIGRATION' && b.protection_state === 'NONE').length, 2);
    for (const retained of [pending, failed, full, manual]) assert.ok(backups.some(b => b.backup_id === retained.backup_id));
    assert.ok(!existsSync(path.join(root, 'Backups', ordinary[0]!)));
});

test('failure injection: retention cleanup fails visibly and never deletes protected backup', async () => {
    let enabled = false;
    const { root, service } = await setup({ retention: 0, hooks: { atBoundary: b => { if (enabled && b === 'retention_cleanup') throw new Error('retention failure'); } } });
    const protectedBackup = await service.recovery.create('RECOVERY_POINT');
    configureMetadata(root, protectedBackup, { origin: 'PRE_MIGRATION', protection_state: 'MIGRATION_FAILED' });
    const ordinary = await service.recovery.create('RECOVERY_POINT'); configureMetadata(root, ordinary, { origin: 'PRE_MIGRATION' });
    enabled = true;
    await assert.rejects(service.recovery.create('FULL'), errorCode('BACKUP_FAILED'));
    assert.ok(existsSync(metadataPath(root, protectedBackup))); assert.equal(service.status.state, 'READY');
    assert.equal((await service.recovery.list()).filter(b => b.kind === 'FULL').length, 1);
});

test('AC19: backup blocks all existing mutators throughout async snapshot; reads/status remain available', async () => {
    const entered = defer(); const release = defer();
    const { service } = await setup({ hooks: { atBoundary: async b => { if (b === 'db_snapshot') { entered.resolve(); await release.promise; } } } });
    const pending = service.recovery.create('RECOVERY_POINT'); await entered.promise;
    try {
        assert.equal(service.runtime.maintenance.mode, 'BACKUP');
        assert.throws(() => service.canonical!.createCard({ family: 'SPELL' }), errorCode('WORKSPACE_MAINTENANCE_ACTIVE'));
        assert.throws(() => service.canonical!.registerStructuralCode('ATTRIBUTE', 'LIGHT'), errorCode('WORKSPACE_MAINTENANCE_ACTIVE'));
        assert.throws(() => service.canonical!.registerNamedEntity('ARCHETYPE', 'x'), errorCode('WORKSPACE_MAINTENANCE_ACTIVE'));
        await assert.rejects(async () => service.assets!.scan(), errorCode('WORKSPACE_MAINTENANCE_ACTIVE'));
        await assert.rejects(async () => service.libraryAssets!.rescan(), errorCode('WORKSPACE_MAINTENANCE_ACTIVE'));
        await assert.rejects(async () => service.managedAssets!.ingest({} as never), errorCode('WORKSPACE_MAINTENANCE_ACTIVE'));
        await assert.rejects(async () => service.libraryAssets!.ingestManaged('x', {} as never), errorCode('WORKSPACE_MAINTENANCE_ACTIVE'));
        assert.throws(() => service.persistence!.runRepositoryOperation(db => db.exec('CREATE TABLE forbidden (id INTEGER)')), /readonly/);
        assert.deepEqual(service.canonical!.getCard('missing'), null);
        assert.equal((await service.app.inject({ method: 'GET', url: '/api/v1/library/cards' })).statusCode, 200);
        assert.equal((await service.app.inject({ method: 'POST', url: '/api/v1/library/cards', payload: { family: 'SPELL' } })).json().code, 'WORKSPACE_MAINTENANCE_ACTIVE');
        assert.equal((await service.app.inject({ method: 'GET', url: '/api/v1/workspace/status' })).statusCode, 200);
        await assert.rejects(service.recovery.migrate(), errorCode('WORKSPACE_MAINTENANCE_ACTIVE'));
    } finally { release.resolve(); }
    await pending; assert.equal(service.runtime.maintenance.mode, 'NORMAL');
});

test('maintenance refuses backup/restore while a mutation/read lease is in flight and releases on rejection', async () => {
    const coordinator = new WorkspaceMaintenanceCoordinator(); const release = defer();
    const pending = coordinator.mutate(() => release.promise);
    await assert.rejects(coordinator.maintain('BACKUP', async () => undefined), errorCode('WORKSPACE_MAINTENANCE_ACTIVE'));
    release.resolve(); await pending;
    const read = coordinator.acquireRead();
    await assert.rejects(coordinator.maintain('RESTORE', async () => undefined), errorCode('WORKSPACE_MAINTENANCE_ACTIVE')); read();
    await assert.rejects(coordinator.maintain('RESTORE', async () => { coordinator.assertReadable(); }), errorCode('WORKSPACE_MAINTENANCE_ACTIVE'));
    assert.equal(coordinator.mode, 'NORMAL');
});

test('RESTORE blocks Library/Carder/direct reads until runtime reload while status/list remain available', async () => {
    const entered = defer(); const release = defer();
    const { service } = await setup({ hooks: { atBoundary: async b => { if (b === 'active_move') { entered.resolve(); await release.promise; } } } });
    const backup = await service.recovery.create('FULL'); const pending = service.recovery.restore(backup.backup_id); await entered.promise;
    try {
        assert.throws(() => service.canonical!.getCard('x'), errorCode('WORKSPACE_MAINTENANCE_ACTIVE'));
        assert.equal((await service.app.inject({ method: 'GET', url: '/api/v1/library/cards' })).json().code, 'WORKSPACE_MAINTENANCE_ACTIVE');
        assert.equal((await service.app.inject({ method: 'GET', url: '/api/v1/carder/assets/x/content?hash=x' })).json().code, 'WORKSPACE_MAINTENANCE_ACTIVE');
        assert.equal((await service.app.inject({ method: 'GET', url: '/api/v1/workspace/status' })).statusCode, 200);
        assert.equal((await service.app.inject({ method: 'GET', url: '/api/v1/workspace/backups' })).statusCode, 200);
    } finally { release.resolve(); }
    await pending;
});

test('AC21: links/junctions in protected sources and recovery destinations fail closed', async () => {
    const { root, service } = await setup();
    const external = await mkdtemp(path.join(os.tmpdir(), 'YU3DOH external ')); roots.push(external);
    await writeFile(path.join(external, 'secret.txt'), 'must not traverse');
    await symlink(external, path.join(root, 'Config/external'), process.platform === 'win32' ? 'junction' : 'dir');
    await assert.rejects(service.recovery.create('RECOVERY_POINT'), errorCode('BACKUP_SOURCE_UNSAFE'));
    assert.deepEqual(await service.recovery.list(), []);
    await rm(path.join(root, 'Config/external')); await rm(path.join(root, 'Backups'), { recursive: true });
    await symlink(external, path.join(root, 'Backups'), process.platform === 'win32' ? 'junction' : 'dir');
    await assert.rejects(service.recovery.create('FULL'), errorCode('BACKUP_SOURCE_UNSAFE'));
    assert.equal(await readFile(path.join(external, 'secret.txt'), 'utf8'), 'must not traverse');
    assert.deepEqual(readdirSync(external), ['secret.txt']);
});

test('recovery paths reject cross-platform aliases, traversal, alternate data streams and reserved devices', () => {
    for (const rel of ['../x', '/x', 'C:\\x', 'Config/x:stream', 'Config/NUL.txt', 'Config/x.', 'Config/x ', 'Config//x', 'Config/./x']) assert.throws(() => safeRelative(rel), errorCode('BACKUP_SOURCE_UNSAFE'));
    assert.equal(safeRelative('Custom data 日本語\\live.db'), 'Custom data 日本語/live.db');
});

test('retention environment defaults to 10 and rejects invalid limits', () => {
    assert.equal(loadWorkspaceConfig({ env: { YU3DOH_WORKSPACE_ROOT: os.tmpdir() } }).automaticRecoveryPointRetention, 10);
    assert.equal(loadWorkspaceConfig({ env: { YU3DOH_WORKSPACE_ROOT: os.tmpdir(), YU3DOH_AUTOMATIC_RECOVERY_POINT_RETENTION: '0' } }).automaticRecoveryPointRetention, 0);
    for (const retention of ['-1', '1.5', 'abc']) assert.throws(() => loadWorkspaceConfig({ env: { YU3DOH_WORKSPACE_ROOT: os.tmpdir(), YU3DOH_AUTOMATIC_RECOVERY_POINT_RETENTION: retention } }));
});

for (const state of ['INVALID_WORKSPACE', 'UNSUPPORTED_NEWER_SCHEMA'] as const) {
    test(`compatibility-validated restore is available from ${state}`, async () => {
        const { root, service } = await setup(); const backup = await service.recovery.create('FULL'); await service.close();
        if (state === 'INVALID_WORKSPACE') await writeFile(path.join(root, 'workspace.json'), JSON.stringify({ workspace_id: value().workspace_id }));
        else {
            const db = new Database(path.join(root, 'Data/workspace.db')); db.pragma('user_version = 7'); db.close();
        }
        const recover = await createWorkspaceService({ workspaceRoot: root, host: '127.0.0.1', port: 4312 }); services.push(recover);
        assert.equal(recover.status.state, state); assert.equal((await recover.recovery.list()).length, 1);
        await assert.rejects(recover.recovery.create('FULL'), errorCode('BACKUP_INCOMPATIBLE'));
        await assert.rejects(recover.recovery.migrate(), errorCode('BACKUP_INCOMPATIBLE'));
        await recover.recovery.restore(backup.backup_id); assert.equal(recover.status.state, 'READY');
    });
}

test('failure after first incoming publish removes the partial install and rolls back current data', async () => {
    let publishes = 0;
    const { root, service } = await setup({ hooks: { atBoundary: b => { if (b === 'incoming_publish' && ++publishes === 2) throw new Error('second publish fails'); } } });
    const backup = await service.recovery.create('FULL'); service.canonical!.createCard({ family: 'TRAP' });
    await writeFile(path.join(root, 'Config/nested 日本語/settings.txt'), 'current config');
    await assert.rejects(service.recovery.restore(backup.backup_id), errorCode('RESTORE_FAILED'));
    assert.equal(dbCards(service), 1); assert.equal(service.status.state, 'READY');
    assert.equal(await readFile(path.join(root, 'Config/nested 日本語/settings.txt'), 'utf8'), 'current config');
});

test('a backup format failure and unknown backup id return stable API errors', async () => {
    const { root, service } = await setup();
    const missing = await service.app.inject({ method: 'POST', url: '/api/v1/workspace/backups/not-found/restore' });
    assert.equal(missing.statusCode, 404); assert.equal(missing.json().code, 'BACKUP_NOT_FOUND');
    const backup = await service.recovery.create('FULL'); configureMetadata(root, backup, { backup_format_version: 3 as 1 });
    const invalid = await service.app.inject({ method: 'POST', url: `/api/v1/workspace/backups/${backup.backup_id}/restore` });
    assert.equal(invalid.statusCode, 422); assert.equal(invalid.json().code, 'BACKUP_INCOMPATIBLE');
});

test('QA-010-01: retention failure after real migration leaves current schema/READY and reports successful migration', async () => {
    let retentionAttempted = false;
    const { root, service } = await setup({ old: true, retention: 0, hooks: { atBoundary: boundary => {
        if (boundary === 'retention_cleanup') {
            retentionAttempted = true;
            assert.equal(service.status.state, 'READY');
            assert.equal(service.status.database_schema_version, 6);
            throw new Error('injected post-success retention failure');
        }
    } } });
    assert.equal(service.status.state, 'NEEDS_MIGRATION');
    const response = await service.app.inject({ method: 'POST', url: '/api/v1/workspace/migrate' });
    assert.equal(response.statusCode, 200, response.body);
    const result = response.json();
    assert.equal(retentionAttempted, true);
    assert.equal(result.migrated, true);
    assert.equal(result.currentVersion, 6);
    assert.deepEqual(result.appliedVersions, [1, 2, 3, 4, 5, 6]);
    assert.equal(result.status.state, 'READY');
    assert.equal(service.status.state, 'READY');
    assert.equal(service.persistence!.isOpen, true);
    const database = new Database(path.join(root, 'Data/workspace.db'), { readonly: true, fileMustExist: true });
    try {
        assert.equal(database.pragma('user_version', { simple: true }), 6);
        assert.deepEqual(database.prepare('SELECT version FROM _workspace_migrations ORDER BY version').all(),
            [1, 2, 3, 4, 5, 6].map(version => ({ version })));
    } finally { database.close(); }
    assert.deepEqual(result.maintenance_warnings, [{ code: 'RETENTION_CLEANUP_FAILED',
        message: 'Migration completed, but automatic recovery point retention cleanup failed.' }]);
    const checkpoint: BackupMetadata = JSON.parse(readFileSync(path.join(root, 'Backups', result.backup_id, 'backup.json'), 'utf8'));
    assert.equal(checkpoint.database_schema_version, 0);
    assert.equal(checkpoint.protection_state, 'NONE');
    assert.notEqual(checkpoint.protection_state, 'MIGRATION_FAILED');
    assert.ok(existsSync(path.join(root, 'Backups', result.backup_id, 'payload', 'Data', 'workspace.db')));
    assert.equal((await service.recovery.list()).length, 1);
    assert.equal((await inspectWorkspaceRoot(root)).state, 'READY');
});

test('QA-010-01: post-success protection metadata failure does not reclassify a proven migration', async () => {
    const { root, service } = await setup({ old: true, hooks: { atBoundary: boundary => {
        if (boundary === 'migration') {
            const id = readdirSync(path.join(root, 'Backups')).find(entry => !entry.startsWith('.'))!;
            writeFileSync(path.join(root, 'Backups', id, 'backup.json.pending'), 'block metadata update');
        }
    } } });
    const response = await service.app.inject({ method: 'POST', url: '/api/v1/workspace/migrate' });
    assert.equal(response.statusCode, 200, response.body);
    const result = response.json();
    assert.equal(result.migrated, true);
    assert.equal(result.status.state, 'READY');
    assert.equal(service.status.database_schema_version, 6);
    assert.equal(result.maintenance_warnings[0].code, 'CHECKPOINT_PROTECTION_UPDATE_FAILED');
    const checkpoint: BackupMetadata = JSON.parse(readFileSync(path.join(root, 'Backups', result.backup_id, 'backup.json'), 'utf8'));
    assert.equal(checkpoint.protection_state, 'MIGRATION_PENDING');
    assert.equal((await service.recovery.list()).length, 1);
});

for (const oldSchema of [false, true]) {
    test(`QA-010-02: HTTP restore observability contract reports actual schema ${oldSchema ? 0 : 6} and completion timestamp`, async () => {
        const { service } = await setup({ old: oldSchema });
        const backup = await service.recovery.create('RECOVERY_POINT');
        const before = Date.now();
        const response = await service.app.inject({ method: 'POST', url: `/api/v1/workspace/backups/${backup.backup_id}/restore` });
        const after = Date.now();
        assert.equal(response.statusCode, 200, response.body);
        const result = response.json();
        assert.deepEqual(Object.keys(result).sort(), ['operation', 'restored', 'backup_id', 'restored_at',
            'workspace_id', 'database_schema_version', 'status'].sort());
        assert.equal(result.operation, 'RESTORE');
        assert.equal(result.restored, true);
        assert.equal(result.backup_id, backup.backup_id);
        assert.equal(result.workspace_id, value().workspace_id);
        assert.equal(result.database_schema_version, oldSchema ? 0 : 6);
        assert.equal(result.status.state, oldSchema ? 'NEEDS_MIGRATION' : 'READY');
        assert.equal(result.status.workspace_id, result.workspace_id);
        assert.equal(result.status.database_schema_version, result.database_schema_version);
        assert.deepEqual(result.status, service.status);
        assert.equal(typeof result.restored_at, 'string');
        assert.equal(new Date(result.restored_at).toISOString(), result.restored_at);
        assert.ok(Date.parse(result.restored_at) >= before && Date.parse(result.restored_at) <= after);
    });
}
