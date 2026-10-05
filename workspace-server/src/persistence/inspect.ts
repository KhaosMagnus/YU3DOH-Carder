import { stat } from 'node:fs/promises';
import type { WorkspaceManifest, WorkspaceLifecycleState } from '../workspace/types';
import { SUPPORTED_DATABASE_SCHEMA_VERSION } from './constants';
import {
    acquireWorkspacePersistence,
    openReadonlyDatabase,
    readDatabaseSchemaVersion,
    type WorkspacePersistence,
} from './database';
import { verifyCurrentMigrationHistory } from './migrations';
import { resolveWorkspaceDatabasePath } from './path';

export type PersistenceInspection = {
    state: Extract<WorkspaceLifecycleState, 'READY' | 'NEEDS_MIGRATION' | 'RECOVERY_REQUIRED' | 'UNSUPPORTED_NEWER_SCHEMA'>;
    databaseSchemaVersion: number | null;
    healthSummary: string;
    persistence: WorkspacePersistence | null;
};

const recovery = (healthSummary: string, databaseSchemaVersion: number | null = null): PersistenceInspection => ({
    state: 'RECOVERY_REQUIRED',
    databaseSchemaVersion,
    healthSummary,
    persistence: null,
});

const getErrorCode = (error: unknown) => {
    if (typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string') {
        return error.code;
    }
    return null;
};

export const inspectWorkspacePersistence = async (
    workspaceRoot: string,
    manifest: WorkspaceManifest,
): Promise<PersistenceInspection> => {
    let databasePath: string;
    try {
        databasePath = resolveWorkspaceDatabasePath(workspaceRoot, manifest.database_path);
    } catch {
        return recovery('Workspace database_path could not be resolved safely.');
    }

    let databaseStat;
    try {
        databaseStat = await stat(databasePath);
    } catch (error) {
        if (getErrorCode(error) === 'ENOENT') {
            return recovery('Workspace database file is missing.');
        }
        return recovery('Workspace database path could not be inspected.');
    }

    if (!databaseStat.isFile()) {
        return recovery('Workspace database path is not a regular file.');
    }

    let schemaVersion: number;
    try {
        const database = openReadonlyDatabase(databasePath);
        try {
            schemaVersion = readDatabaseSchemaVersion(database);
            if (schemaVersion < 0) return recovery('Workspace database schema version is invalid.');
            if (schemaVersion <= SUPPORTED_DATABASE_SCHEMA_VERSION) {
                verifyCurrentMigrationHistory(database, schemaVersion);
            }
        } finally {
            database.close();
        }
    } catch {
        return recovery('Workspace database could not be opened or validated as SQLite.');
    }

    if (schemaVersion < SUPPORTED_DATABASE_SCHEMA_VERSION) {
        return {
            state: 'NEEDS_MIGRATION',
            databaseSchemaVersion: schemaVersion,
            healthSummary: `Database schema ${schemaVersion} requires migration to schema ${SUPPORTED_DATABASE_SCHEMA_VERSION}.`,
            persistence: null,
        };
    }

    if (schemaVersion > SUPPORTED_DATABASE_SCHEMA_VERSION) {
        return {
            state: 'UNSUPPORTED_NEWER_SCHEMA',
            databaseSchemaVersion: schemaVersion,
            healthSummary: `Database schema ${schemaVersion} is newer than supported schema ${SUPPORTED_DATABASE_SCHEMA_VERSION}.`,
            persistence: null,
        };
    }

    try {
        const persistence = acquireWorkspacePersistence(databasePath);
        return {
            state: 'READY',
            databaseSchemaVersion: schemaVersion,
            healthSummary: `Workspace database schema ${schemaVersion} is current and operational.`,
            persistence,
        };
    } catch {
        return recovery('Workspace database could not be configured for normal operation.', schemaVersion);
    }
};
