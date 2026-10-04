export const SUPPORTED_WORKSPACE_FORMAT_VERSION = 1;

export const WORKSPACE_LIFECYCLE_STATES = [
    'READY',
    'NEEDS_INITIALIZATION',
    'NEEDS_MIGRATION',
    'RECOVERY_REQUIRED',
    'UNSUPPORTED_NEWER_SCHEMA',
    'INVALID_WORKSPACE',
    'PERSISTENCE_UNVERIFIED',
] as const;

export type WorkspaceLifecycleState = typeof WORKSPACE_LIFECYCLE_STATES[number];

export type WorkspaceManifest = {
    workspace_id: string;
    workspace_format_version: number;
    database_path: string;
    created_at: string;
    name?: string;
};

export type WorkspaceStatus = {
    workspace_id: string | null;
    name: string | null;
    workspace_format_version: number | null;
    state: WorkspaceLifecycleState;
    read_only: boolean;
    health_summary: string;
};
