import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import Database from 'better-sqlite3';
import { SQLITE_BUSY_TIMEOUT_MS, SUPPORTED_DATABASE_SCHEMA_VERSION } from '../src/persistence/constants';
import {
    acquireWorkspacePersistence,
    readDatabaseSchemaVersion,
} from '../src/persistence/database';
import { inspectWorkspacePersistence } from '../src/persistence/inspect';
import { applyMigrations } from '../src/persistence/migrations';
import { bootstrapWorkspaceDatabase, migrateWorkspaceDatabase } from '../src/persistence/operations';
import { resolveWorkspaceDatabasePath } from '../src/persistence/path';
import { createWorkspaceService } from '../src/service';
import { inspectWorkspaceRoot } from '../src/workspace/inspect';
import { SUPPORTED_WORKSPACE_FORMAT_VERSION, type WorkspaceManifest } from '../src/workspace/types';

const tempRoots: string[] = [];

const createTempRoot = async (label = 'persistence 日本語') => {
    const root = await mkdtemp(path.join(os.tmpdir(), `yu3doh ${label} `));
    tempRoots.push(root);
    return root;
};

const manifest = (overrides: Partial<WorkspaceManifest> = {}): WorkspaceManifest => ({
    workspace_id: 'workspace-persistence-001',
    workspace_format_version: SUPPORTED_WORKSPACE_FORMAT_VERSION,
    database_path: 'Data/workspace.db',
    created_at: '2026-10-05T00:00:00.000Z',
    name: 'Persistence Test',
    ...overrides,
});

const writeManifest = async (root: string, value = manifest()) => {
    await writeFile(path.join(root, 'workspace.json'), JSON.stringify(value), 'utf8');
};

const createEmptyDatabase = async (root: string, value = manifest()) => {
    const databasePath = resolveWorkspaceDatabasePath(root, value.database_path);
    await mkdir(path.dirname(databasePath), { recursive: true });
    const database = new Database(databasePath);
    database.close();
    return databasePath;
};

test.after(async () => {
    await Promise.all(tempRoots.map(root => rm(root, { recursive: true, force: true })));
});

test('safe database path resolution rejects escape attempts independently of manifest parsing', async () => {
    const root = await createTempRoot('path defense');
    assert.equal(
        resolveWorkspaceDatabasePath(root, 'Data/workspace.db'),
        path.join(root, 'Data', 'workspace.db'),
    );
    for (const candidate of ['../outside.db', 'Data/../../outside.db', '/tmp/outside.db', 'C:\\outside.db']) {
        assert.throws(() => resolveWorkspaceDatabasePath(root, candidate), candidate);
    }
});

test('missing database inspection is RECOVERY_REQUIRED and does not create files', async () => {
    const root = await createTempRoot('missing db');
    const value = manifest();
    await writeManifest(root, value);
    const databasePath = resolveWorkspaceDatabasePath(root, value.database_path);

    const inspection = await inspectWorkspacePersistence(root, value);

    assert.equal(inspection.state, 'RECOVERY_REQUIRED');
    assert.equal(inspection.databaseSchemaVersion, null);
    assert.equal(inspection.persistence, null);
    assert.equal(existsSync(databasePath), false);
});

test('explicit bootstrap creates a fresh database at current schema', async () => {
    const root = await createTempRoot('fresh bootstrap');
    const value = manifest();
    await writeManifest(root, value);

    const result = bootstrapWorkspaceDatabase(root, value);

    assert.equal(result.previousVersion, 0);
    assert.equal(result.currentVersion, SUPPORTED_DATABASE_SCHEMA_VERSION);
    assert.deepEqual(result.appliedVersions, [1, 2]);
    assert.equal(existsSync(result.databasePath), true);

    const status = await inspectWorkspaceRoot(root);
    assert.equal(status.state, 'READY');
    assert.equal(status.database_schema_version, SUPPORTED_DATABASE_SCHEMA_VERSION);
    assert.equal(status.read_only, false);
});

test('migration operation brings an older schema to current and records ordered history', async () => {
    const root = await createTempRoot('migrate old');
    const value = manifest();
    await writeManifest(root, value);
    const databasePath = await createEmptyDatabase(root, value);

    const before = await inspectWorkspaceRoot(root);
    assert.equal(before.state, 'NEEDS_MIGRATION');
    assert.equal(before.database_schema_version, 0);

    const result = migrateWorkspaceDatabase(root, value);
    assert.deepEqual(result.appliedVersions, [1, 2]);
    assert.equal(result.currentVersion, SUPPORTED_DATABASE_SCHEMA_VERSION);

    const database = new Database(databasePath, { readonly: true, fileMustExist: true });
    const history = database.prepare('SELECT version, name FROM _workspace_migrations ORDER BY version').all();
    assert.deepEqual(history, [
        { version: 1, name: 'repository_foundation' },
        { version: 2, name: 'canonical_domain' },
    ]);
    database.close();
});

test('second migration run is idempotent and does not reapply applied versions', async () => {
    const root = await createTempRoot('idempotent migration');
    const value = manifest();
    await writeManifest(root, value);
    await createEmptyDatabase(root, value);

    const first = migrateWorkspaceDatabase(root, value);
    const second = migrateWorkspaceDatabase(root, value);

    assert.deepEqual(first.appliedVersions, [1, 2]);
    assert.deepEqual(second.appliedVersions, []);
    assert.equal(second.previousVersion, SUPPORTED_DATABASE_SCHEMA_VERSION);
    assert.equal(second.currentVersion, SUPPORTED_DATABASE_SCHEMA_VERSION);
});

test('older database inspection never performs implicit migration', async () => {
    const root = await createTempRoot('old inspect');
    const value = manifest();
    await writeManifest(root, value);
    const databasePath = await createEmptyDatabase(root, value);

    const status = await inspectWorkspaceRoot(root);

    assert.equal(status.state, 'NEEDS_MIGRATION');
    assert.equal(status.database_schema_version, 0);
    const database = new Database(databasePath, { readonly: true, fileMustExist: true });
    assert.equal(readDatabaseSchemaVersion(database), 0);
    const migrationTable = database.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='_workspace_migrations'").get();
    assert.equal(migrationTable, undefined);
    database.close();
});

test('current schema is READY only after real persistence acquisition and configuration', async () => {
    const root = await createTempRoot('current schema');
    const value = manifest();
    await writeManifest(root, value);
    bootstrapWorkspaceDatabase(root, value);

    const service = await createWorkspaceService({ workspaceRoot: root, host: '127.0.0.1', port: 4312 });

    assert.equal(service.status.state, 'READY');
    assert.equal(service.status.database_schema_version, SUPPORTED_DATABASE_SCHEMA_VERSION);
    assert.equal(service.status.read_only, false);
    assert.equal(service.persistence?.isOpen, true);
    await service.close();
});

test('future schema is UNSUPPORTED_NEWER_SCHEMA without downgrade or mutation', async () => {
    const root = await createTempRoot('future schema');
    const value = manifest();
    await writeManifest(root, value);
    const databasePath = await createEmptyDatabase(root, value);
    const futureVersion = SUPPORTED_DATABASE_SCHEMA_VERSION + 1;
    const database = new Database(databasePath, { fileMustExist: true });
    database.pragma(`user_version = ${futureVersion}`);
    database.close();

    const status = await inspectWorkspaceRoot(root);

    assert.equal(status.state, 'UNSUPPORTED_NEWER_SCHEMA');
    assert.equal(status.database_schema_version, futureVersion);
    assert.equal(status.read_only, true);
    const after = new Database(databasePath, { readonly: true, fileMustExist: true });
    assert.equal(readDatabaseSchemaVersion(after), futureVersion);
    after.close();
});

test('corrupt non-SQLite database is controlled RECOVERY_REQUIRED and preserved', async () => {
    const root = await createTempRoot('corrupt db');
    const value = manifest();
    await writeManifest(root, value);
    const databasePath = resolveWorkspaceDatabasePath(root, value.database_path);
    await mkdir(path.dirname(databasePath), { recursive: true });
    const corruptContents = 'not a sqlite database — preserve 日本語';
    await writeFile(databasePath, corruptContents, 'utf8');

    const status = await inspectWorkspaceRoot(root);

    assert.equal(status.state, 'RECOVERY_REQUIRED');
    assert.equal(status.database_schema_version, null);
    assert.equal(status.read_only, true);
    assert.equal(await readFile(databasePath, 'utf8'), corruptContents);
});

test('database path pointing to a directory is controlled RECOVERY_REQUIRED', async () => {
    const root = await createTempRoot('db path directory');
    const value = manifest();
    await writeManifest(root, value);
    const databasePath = resolveWorkspaceDatabasePath(root, value.database_path);
    await mkdir(databasePath, { recursive: true });

    const status = await inspectWorkspaceRoot(root);

    assert.equal(status.state, 'RECOVERY_REQUIRED');
    assert.equal(status.database_schema_version, null);
});

test('failed migration rolls back schema changes and user_version advancement', () => {
    const database = new Database(':memory:');
    const failingMigration = [{
        version: 1,
        name: 'deliberate_failure',
        sql: `
            CREATE TABLE _workspace_migrations (
                version INTEGER PRIMARY KEY CHECK (version > 0),
                name TEXT NOT NULL UNIQUE
            ) STRICT;
            CREATE TABLE should_rollback (id INTEGER PRIMARY KEY);
            INSERT INTO table_that_does_not_exist (id) VALUES (1);
        `,
    }];

    assert.throws(() => applyMigrations(database, failingMigration));
    assert.equal(readDatabaseSchemaVersion(database), 0);
    const partial = database.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='should_rollback'").get();
    const history = database.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='_workspace_migrations'").get();
    assert.equal(partial, undefined);
    assert.equal(history, undefined);
    database.close();
});

test('transaction foundation commits successful work', async () => {
    const root = await createTempRoot('transaction commit');
    const value = manifest();
    await writeManifest(root, value);
    const result = bootstrapWorkspaceDatabase(root, value);
    const persistence = acquireWorkspacePersistence(result.databasePath);
    persistence.runRepositoryOperation(database => database.exec('CREATE TABLE tx_probe (value TEXT NOT NULL)'));

    persistence.transaction(database => {
        database.prepare('INSERT INTO tx_probe (value) VALUES (?)').run('committed');
    });

    const row = persistence.runRepositoryOperation(database => database.prepare('SELECT value FROM tx_probe').get()) as { value: string };
    assert.equal(row.value, 'committed');
    persistence.close();
});

test('transaction foundation rolls back failed work', async () => {
    const root = await createTempRoot('transaction rollback');
    const value = manifest();
    await writeManifest(root, value);
    const result = bootstrapWorkspaceDatabase(root, value);
    const persistence = acquireWorkspacePersistence(result.databasePath);
    persistence.runRepositoryOperation(database => database.exec('CREATE TABLE tx_probe (value TEXT NOT NULL)'));

    assert.throws(() => persistence.transaction(database => {
        database.prepare('INSERT INTO tx_probe (value) VALUES (?)').run('rolled-back');
        throw new Error('deliberate transaction failure');
    }));

    const row = persistence.runRepositoryOperation(database => database.prepare('SELECT COUNT(*) AS count FROM tx_probe').get()) as { count: number };
    assert.equal(row.count, 0);
    persistence.close();
});

test('operational connection verifies foreign_keys, WAL, and bounded busy_timeout', async () => {
    const root = await createTempRoot('pragmas');
    const value = manifest();
    await writeManifest(root, value);
    bootstrapWorkspaceDatabase(root, value);
    const service = await createWorkspaceService({ workspaceRoot: root, host: '127.0.0.1', port: 4312 });

    const runtime = service.persistence?.getRuntimeConfiguration();
    assert.deepEqual(runtime, {
        foreignKeys: true,
        journalMode: 'wal',
        busyTimeoutMs: SQLITE_BUSY_TIMEOUT_MS,
    });
    assert.ok(SQLITE_BUSY_TIMEOUT_MS > 0);
    assert.ok(Number.isFinite(SQLITE_BUSY_TIMEOUT_MS));
    await service.close();
});

test('spaces and Japanese/Unicode Workspace paths operate with real SQLite', async () => {
    const parent = await createTempRoot('unicode parent');
    const root = path.join(parent, 'Workspace With Spaces 日本語 カード');
    await mkdir(root);
    const value = manifest({ database_path: 'データ files/workspace.db' });
    await writeManifest(root, value);

    const bootstrap = bootstrapWorkspaceDatabase(root, value);
    const service = await createWorkspaceService({ workspaceRoot: root, host: '127.0.0.1', port: 4312 });

    assert.equal(existsSync(bootstrap.databasePath), true);
    assert.equal(service.status.state, 'READY');
    assert.equal(service.status.database_schema_version, SUPPORTED_DATABASE_SCHEMA_VERSION);
    await service.close();
});
