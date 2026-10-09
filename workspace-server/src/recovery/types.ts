export type BackupKind = 'RECOVERY_POINT' | 'FULL';
export type BackupProtection = 'NONE' | 'MIGRATION_PENDING' | 'MIGRATION_FAILED';
export type BackupFile = { relative_path: string; size_bytes: number; sha256: string };
export type BackupMetadata = {
    backup_format_version: 1;
    backup_id: string;
    kind: BackupKind;
    workspace_id: string;
    workspace_format_version: number;
    database_schema_version: number;
    created_at: string;
    origin: 'MANUAL' | 'PRE_MIGRATION';
    reason: string;
    include_output: boolean;
    included_roots: string[];
    excluded_roots: string[];
    source_database_path: string;
    files: BackupFile[];
    directories: string[];
    absent_source_roots: string[];
    completion_state: 'COMPLETE';
    protection_state: BackupProtection;
};
export type RecoveryBoundary = 'db_snapshot' | 'config_copy' | 'asset_copy' | 'metadata_finalization'
    | 'backup_publish' | 'restore_validation' | 'active_move' | 'incoming_publish'
    | 'runtime_reopen' | 'post_restore_inspection' | 'rollback' | 'migration' | 'retention_cleanup';
/** Failure injection is constructor-only, never an HTTP or environment capability. */
export type RecoveryHooks = { atBoundary?: (boundary: RecoveryBoundary) => void | Promise<void> };
