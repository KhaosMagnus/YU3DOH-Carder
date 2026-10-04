import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { parseWorkspaceManifest } from './manifest';
import {
    SUPPORTED_WORKSPACE_FORMAT_VERSION,
    type WorkspaceLifecycleState,
    type WorkspaceManifest,
    type WorkspaceStatus,
} from './types';

const createStatus = ({
    state,
    healthSummary,
    manifest,
}: {
    state: WorkspaceLifecycleState;
    healthSummary: string;
    manifest?: WorkspaceManifest;
}): WorkspaceStatus => ({
    workspace_id: manifest?.workspace_id ?? null,
    name: manifest?.name ?? null,
    workspace_format_version: manifest?.workspace_format_version ?? null,
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

export const inspectWorkspaceRoot = async (workspaceRoot: string): Promise<WorkspaceStatus> => {
    let rootStat;
    try {
        rootStat = await stat(workspaceRoot);
    } catch (error) {
        if (getErrorCode(error) === 'ENOENT') {
            return createStatus({
                state: 'NEEDS_INITIALIZATION',
                healthSummary: 'Configured Workspace root does not exist.',
            });
        }
        return createStatus({
            state: 'RECOVERY_REQUIRED',
            healthSummary: 'Configured Workspace root could not be inspected.',
        });
    }

    if (!rootStat.isDirectory()) {
        return createStatus({
            state: 'INVALID_WORKSPACE',
            healthSummary: 'Configured Workspace root is not a directory.',
        });
    }

    let entries;
    try {
        entries = await readdir(workspaceRoot, { withFileTypes: true });
    } catch {
        return createStatus({
            state: 'RECOVERY_REQUIRED',
            healthSummary: 'Configured Workspace root could not be read.',
        });
    }

    if (entries.length === 0) {
        return createStatus({
            state: 'NEEDS_INITIALIZATION',
            healthSummary: 'Configured Workspace root is empty and has not been initialized.',
        });
    }

    const manifestEntry = entries.find(entry => entry.name === 'workspace.json');
    if (!manifestEntry) {
        return createStatus({
            state: 'INVALID_WORKSPACE',
            healthSummary: 'Workspace root is non-empty but does not contain workspace.json.',
        });
    }

    if (!manifestEntry.isFile()) {
        return createStatus({
            state: 'INVALID_WORKSPACE',
            healthSummary: 'workspace.json exists but is not a regular file.',
        });
    }

    let manifestRaw: string;
    try {
        manifestRaw = await readFile(path.join(workspaceRoot, 'workspace.json'), 'utf8');
    } catch {
        return createStatus({
            state: 'RECOVERY_REQUIRED',
            healthSummary: 'workspace.json could not be read.',
        });
    }

    const parsed = parseWorkspaceManifest(manifestRaw);
    if (!parsed.ok) {
        return createStatus({
            state: 'INVALID_WORKSPACE',
            healthSummary: parsed.error,
        });
    }

    const { manifest } = parsed;
    if (manifest.workspace_format_version > SUPPORTED_WORKSPACE_FORMAT_VERSION) {
        return createStatus({
            state: 'UNSUPPORTED_NEWER_SCHEMA',
            healthSummary: `Workspace format ${manifest.workspace_format_version} is newer than supported format ${SUPPORTED_WORKSPACE_FORMAT_VERSION}.`,
            manifest,
        });
    }

    if (manifest.workspace_format_version < SUPPORTED_WORKSPACE_FORMAT_VERSION) {
        return createStatus({
            state: 'NEEDS_MIGRATION',
            healthSummary: `Workspace format ${manifest.workspace_format_version} requires migration to format ${SUPPORTED_WORKSPACE_FORMAT_VERSION}.`,
            manifest,
        });
    }

    return createStatus({
        state: 'PERSISTENCE_UNVERIFIED',
        healthSummary: 'Workspace manifest is valid; database persistence health is intentionally not validated in RUN 001.',
        manifest,
    });
};
