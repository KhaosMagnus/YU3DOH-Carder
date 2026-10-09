import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { noLinks, under } from '../recovery/filesystem';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { inspectWorkspacePersistence } from '../persistence/inspect';
import type { WorkspacePersistence } from '../persistence/database';
import { parseWorkspaceManifest } from './manifest';
import {
    SUPPORTED_WORKSPACE_FORMAT_VERSION,
    type WorkspaceLifecycleState,
    type WorkspaceManifest,
    type WorkspaceStatus,
} from './types';

export type WorkspaceInspection = {
    status: WorkspaceStatus;
    persistence: WorkspacePersistence | null;
};

const createStatus = ({
    state,
    healthSummary,
    manifest,
    databaseSchemaVersion = null,
}: {
    state: WorkspaceLifecycleState;
    healthSummary: string;
    manifest?: WorkspaceManifest;
    databaseSchemaVersion?: number | null;
}): WorkspaceStatus => ({
    workspace_id: manifest?.workspace_id ?? null,
    name: manifest?.name ?? null,
    workspace_format_version: manifest?.workspace_format_version ?? null,
    database_schema_version: databaseSchemaVersion,
    state,
    read_only: state !== 'READY',
    health_summary: healthSummary,
});

const getErrorCode = (error: unknown) => {
    if (typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string') {
        return error.code;
    }
    return null;
};

const withoutPersistence = (status: WorkspaceStatus): WorkspaceInspection => ({
    status,
    persistence: null,
});

export const inspectWorkspaceRootWithPersistence = async (workspaceRoot: string, ignoreRestoreMarkers = false): Promise<WorkspaceInspection> => {
    let rootStat;
    try {
        rootStat = await stat(workspaceRoot);
    } catch (error) {
        if (getErrorCode(error) === 'ENOENT') {
            return withoutPersistence(createStatus({
                state: 'NEEDS_INITIALIZATION',
                healthSummary: 'Configured Workspace root does not exist.',
            }));
        }
        return withoutPersistence(createStatus({
            state: 'RECOVERY_REQUIRED',
            healthSummary: 'Configured Workspace root could not be inspected.',
        }));
    }

    if (!rootStat.isDirectory()) {
        return withoutPersistence(createStatus({
            state: 'INVALID_WORKSPACE',
            healthSummary: 'Configured Workspace root is not a directory.',
        }));
    }

    let entries;
    try {
        entries = await readdir(workspaceRoot, { withFileTypes: true });
    } catch {
        return withoutPersistence(createStatus({
            state: 'RECOVERY_REQUIRED',
            healthSummary: 'Configured Workspace root could not be read.',
        }));
    }

    if (entries.length === 0) {
        return withoutPersistence(createStatus({
            state: 'NEEDS_INITIALIZATION',
            healthSummary: 'Configured Workspace root is empty and has not been initialized.',
        }));
    }

    const manifestEntry = entries.find(entry => entry.name === 'workspace.json');
    if (!manifestEntry) {
        return withoutPersistence(createStatus({
            state: 'INVALID_WORKSPACE',
            healthSummary: 'Workspace root is non-empty but does not contain workspace.json.',
        }));
    }

    if (!manifestEntry.isFile()) {
        return withoutPersistence(createStatus({
            state: 'INVALID_WORKSPACE',
            healthSummary: 'workspace.json exists but is not a regular file.',
        }));
    }

    let manifestRaw: string;
    try {
        manifestRaw = await readFile(path.join(workspaceRoot, 'workspace.json'), 'utf8');
    } catch {
        return withoutPersistence(createStatus({
            state: 'RECOVERY_REQUIRED',
            healthSummary: 'workspace.json could not be read.',
        }));
    }

    const parsed = parseWorkspaceManifest(manifestRaw);
    if (!parsed.ok) {
        return withoutPersistence(createStatus({
            state: 'INVALID_WORKSPACE',
            healthSummary: parsed.error,
        }));
    }

    const { manifest } = parsed;
    if (manifest.workspace_format_version > SUPPORTED_WORKSPACE_FORMAT_VERSION) {
        return withoutPersistence(createStatus({
            state: 'UNSUPPORTED_NEWER_SCHEMA',
            healthSummary: `Workspace format ${manifest.workspace_format_version} is newer than supported format ${SUPPORTED_WORKSPACE_FORMAT_VERSION}.`,
            manifest,
        }));
    }

    if (manifest.workspace_format_version < SUPPORTED_WORKSPACE_FORMAT_VERSION) {
        return withoutPersistence(createStatus({
            state: 'NEEDS_MIGRATION',
            healthSummary: `Workspace format ${manifest.workspace_format_version} requires migration to format ${SUPPORTED_WORKSPACE_FORMAT_VERSION}.`,
            manifest,
        }));
    }

    if (!ignoreRestoreMarkers) {
        try {
            noLinks(workspaceRoot);
            const restoreRoot = under(workspaceRoot, 'Temp/Restore');
            if (existsSync(restoreRoot)) {
                for (const id of readdirSync(restoreRoot)) {
                    const marker = under(restoreRoot, `${id}/restore-state.json`);
                    if (!existsSync(marker)) continue;
                    const value: unknown = JSON.parse(readFileSync(marker, 'utf8'));
                    if (!value || typeof value !== 'object' || !('state' in value)
                        || !['SUCCESS', 'ROLLED_BACK', 'RESOLVED'].includes(String(value.state))) {
                        return withoutPersistence(createStatus({ state: 'RECOVERY_REQUIRED', manifest,
                            healthSummary: 'Interrupted restore requires explicit validated recovery.' }));
                    }
                }
            }
            noLinks(under(workspaceRoot, manifest.database_path));
        } catch {
            return withoutPersistence(createStatus({ state: 'RECOVERY_REQUIRED', manifest,
                healthSummary: 'Recovery paths or restore markers could not be verified safely.' }));
        }
    }

    const persistenceInspection = await inspectWorkspacePersistence(workspaceRoot, manifest);
    return {
        status: createStatus({
            state: persistenceInspection.state,
            healthSummary: persistenceInspection.healthSummary,
            manifest,
            databaseSchemaVersion: persistenceInspection.databaseSchemaVersion,
        }),
        persistence: persistenceInspection.persistence,
    };
};

export const inspectWorkspaceRoot = async (workspaceRoot: string): Promise<WorkspaceStatus> => {
    const inspection = await inspectWorkspaceRootWithPersistence(workspaceRoot);
    inspection.persistence?.close();
    return inspection.status;
};
