export type RecoveryErrorCode =
    | 'BACKUP_NOT_FOUND' | 'BACKUP_INVALID' | 'BACKUP_INCOMPATIBLE'
    | 'BACKUP_INCOMPLETE' | 'BACKUP_SOURCE_UNSAFE' | 'BACKUP_FAILED'
    | 'WORKSPACE_MAINTENANCE_ACTIVE' | 'RESTORE_FAILED' | 'WORKSPACE_ID_MISMATCH'
    | 'MIGRATION_BACKUP_FAILED' | 'RECOVERY_REQUIRED';

export class WorkspaceRecoveryError extends Error {
    constructor(readonly code: RecoveryErrorCode, message: string, options?: ErrorOptions) {
        super(message, options);
        this.name = 'WorkspaceRecoveryError';
    }
}
