import path from 'node:path';
import type { WorkspaceManifest } from './types';

export type WorkspaceManifestParseResult =
    | { ok: true; manifest: WorkspaceManifest }
    | { ok: false; error: string };

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string =>
    typeof value === 'string' && value.trim() !== '';

export const isWorkspaceRelativePath = (value: string) => {
    if (value.trim() === '' || value.includes('\0')) return false;
    if (path.posix.isAbsolute(value) || path.win32.isAbsolute(value)) return false;
    if (/^[A-Za-z]:/.test(value)) return false;

    const normalizedSegments = value.replace(/\\/g, '/').split('/');
    if (normalizedSegments.some(segment => segment === '..')) return false;

    const normalized = path.posix.normalize(value.replace(/\\/g, '/'));
    return normalized !== '.' && normalized !== '..' && !normalized.startsWith('../');
};

export const parseWorkspaceManifest = (raw: string): WorkspaceManifestParseResult => {
    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        return { ok: false, error: 'workspace.json is not valid JSON.' };
    }

    if (!isRecord(parsed)) {
        return { ok: false, error: 'workspace.json must contain a JSON object.' };
    }

    if (!isNonEmptyString(parsed.workspace_id)) {
        return { ok: false, error: 'workspace_id is required and must be a non-empty string.' };
    }

    if (
        typeof parsed.workspace_format_version !== 'number'
        || !Number.isInteger(parsed.workspace_format_version)
        || parsed.workspace_format_version < 1
    ) {
        return { ok: false, error: 'workspace_format_version must be a positive integer.' };
    }

    if (!isNonEmptyString(parsed.database_path) || !isWorkspaceRelativePath(parsed.database_path)) {
        return { ok: false, error: 'database_path must be a safe Workspace-relative path.' };
    }

    if (!isNonEmptyString(parsed.created_at) || Number.isNaN(Date.parse(parsed.created_at))) {
        return { ok: false, error: 'created_at is required and must contain a valid date/time string.' };
    }

    if (parsed.name !== undefined && typeof parsed.name !== 'string') {
        return { ok: false, error: 'name must be a string when provided.' };
    }

    const manifest: WorkspaceManifest = {
        workspace_id: parsed.workspace_id,
        workspace_format_version: parsed.workspace_format_version,
        database_path: parsed.database_path,
        created_at: parsed.created_at,
    };

    if (parsed.name !== undefined) manifest.name = parsed.name;

    return { ok: true, manifest };
};
