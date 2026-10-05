import { existsSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import type { WorkspaceManifest } from '../workspace/types';
import { SUPPORTED_DATABASE_SCHEMA_VERSION } from './constants';
import {
    assertReadableSqliteDatabase,
    configureOperationalDatabase,
    readDatabaseSchemaVersion,
} from './database';
import { applyMigrations, type MigrationResult } from './migrations';
import { resolveWorkspaceDatabasePath } from './path';

export type PersistenceOperationResult = MigrationResult & {
    databasePath: string;
};

const removeNewDatabaseArtifacts = (databasePath: string) => {
    for (const candidate of [databasePath, `${databasePath}-wal`, `${databasePath}-shm`]) {
        rmSync(candidate, { force: true });
    }
};

export const bootstrapWorkspaceDatabase = (
    workspaceRoot: string,
    manifest: WorkspaceManifest,
): PersistenceOperationResult => {
    const databasePath = resolveWorkspaceDatabasePath(workspaceRoot, manifest.database_path);
    if (existsSync(databasePath)) {
        throw new Error('Workspace database already exists; bootstrap will not overwrite it.');
    }

    mkdirSync(path.dirname(databasePath), { recursive: true });
    const database = new Database(databasePath);
    let completed = false;
    try {
        const result = applyMigrations(database);
        configureOperationalDatabase(database);
        completed = true;
        return { ...result, databasePath };
    } finally {
        if (database.open) database.close();
        if (!completed) removeNewDatabaseArtifacts(databasePath);
    }
};

export const migrateWorkspaceDatabase = (
    workspaceRoot: string,
    manifest: WorkspaceManifest,
): PersistenceOperationResult => {
    const databasePath = resolveWorkspaceDatabasePath(workspaceRoot, manifest.database_path);
    const database = new Database(databasePath, { fileMustExist: true });
    try {
        assertReadableSqliteDatabase(database);
        const existingVersion = readDatabaseSchemaVersion(database);
        if (existingVersion > SUPPORTED_DATABASE_SCHEMA_VERSION) {
            throw new Error(
                `Database schema ${existingVersion} is newer than supported schema ${SUPPORTED_DATABASE_SCHEMA_VERSION}.`,
            );
        }
        const result = applyMigrations(database);
        configureOperationalDatabase(database);
        return { ...result, databasePath };
    } finally {
        if (database.open) database.close();
    }
};
