import * as api from './api';
import type { WorkspaceStatus } from './model';
export type MaintenanceOperation =
    | 'NONE'
    | 'BACKUP'
    | 'RESTORE'
    | 'MIGRATION'
    | 'INITIALIZATION';
export type BackupKind = 'RECOVERY_POINT' | 'FULL';
export type WorkspaceBackup = {
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
    absent_source_roots: string[];
    completion_state: 'COMPLETE';
    protection_state: 'NONE' | 'MIGRATION_PENDING' | 'MIGRATION_FAILED';
};
export type RestoreResult = {
    operation: 'RESTORE';
    restored: boolean;
    backup_id: string;
    restored_at: string;
    workspace_id: string;
    database_schema_version: number;
    status: WorkspaceStatus;
};
export type InitializationResult = {
    operation: 'INITIALIZE';
    initialized: true;
    workspace_id: string;
    workspace_format_version: number;
    database_schema_version: number;
    status: WorkspaceStatus;
};
export const initializationAvailable = (status: WorkspaceStatus | null) =>
    status?.state === 'NEEDS_INITIALIZATION';
export type MigrationResult = {
    migrated: boolean;
    status: WorkspaceStatus;
    backup_id: string | null;
    maintenance_warnings?: Array<{ code: string; message: string }>;
};
export const backupPayload = (kind: BackupKind, output: boolean) =>
    kind === 'FULL' ? { kind, include_output: output } : { kind };
export const migrationAvailable = (status: WorkspaceStatus | null) =>
    status?.state === 'NEEDS_MIGRATION';
export const formatMaintenanceError = (error: unknown) =>
    error instanceof api.LibraryHttpError
        ? `${error.code}: ${error.message}`
        : error instanceof Error
          ? error.message
          : 'Workspace operation failed.';
export type ManagementClient = Pick<
    typeof api,
    | 'getWorkspaceStatus'
    | 'getWorkspaceBackups'
    | 'createWorkspaceBackup'
    | 'restoreWorkspaceBackup'
    | 'migrateWorkspace'
    | 'initializeWorkspace'
>;
export type ManagementEffects = {
    begin: (operation: MaintenanceOperation) => void;
    invalidate: () => void;
    adoptStatus: (status: WorkspaceStatus | null, error: string | null) => void;
    reloadLibrary: (status: WorkspaceStatus) => Promise<void>;
    finish: () => void;
};
export type ManagementView = {
    busy: MaintenanceOperation;
    backups: WorkspaceBackup[];
    error: string | null;
    listError: string | null;
    result:
        | WorkspaceBackup
        | RestoreResult
        | MigrationResult
        | InitializationResult
        | null;
};
/** Orchestrates existing endpoints only; compatibility and maintenance coordination belong to the service. */
export class WorkspaceManagementController {
    view: ManagementView = {
        busy: 'NONE',
        backups: [],
        error: null,
        listError: null,
        result: null,
    };
    private generation = 0;
    private listeners = new Set<(view: ManagementView) => void>();
    constructor(
        private effects: ManagementEffects,
        private client: ManagementClient = api,
    ) {}
    subscribe(listener: (view: ManagementView) => void) {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }
    private update(change: Partial<ManagementView>) {
        this.view = { ...this.view, ...change };
        for (const f of this.listeners) f(this.view);
    }
    async refreshBackups(generation = this.generation) {
        try {
            const { backups } = await this.client.getWorkspaceBackups();
            if (generation === this.generation)
                this.update({ backups, listError: null });
        } catch (error) {
            if (generation === this.generation)
                this.update({ listError: formatMaintenanceError(error) });
        }
    }
    async refreshStatus(generation = this.generation) {
        try {
            const status = await this.client.getWorkspaceStatus();
            if (generation !== this.generation) return null;
            this.effects.adoptStatus(status, null);
            return status;
        } catch (error) {
            if (generation === this.generation)
                this.effects.adoptStatus(null, formatMaintenanceError(error));
            return null;
        }
    }
    async refresh() {
        if (this.view.busy !== 'NONE') return;
        const generation = this.generation;
        const [status] = await Promise.all([
            this.refreshStatus(generation),
            this.refreshBackups(generation),
        ]);
        if (
            status &&
            generation === this.generation &&
            this.view.busy === 'NONE'
        ) {
            try {
                await this.effects.reloadLibrary(status);
            } catch (error) {
                if (generation === this.generation)
                    this.update({ error: formatMaintenanceError(error) });
            }
        }
    }
    async execute(
        operation: Exclude<MaintenanceOperation, 'NONE'>,
        options: {
            kind?: BackupKind;
            includeOutput?: boolean;
            backupId?: string;
            dirty: boolean;
            discardAcknowledged?: boolean;
            status: WorkspaceStatus | null;
        },
    ) {
        if (this.view.busy !== 'NONE') return;
        if (
            operation !== 'BACKUP' &&
            options.dirty &&
            !options.discardAcknowledged
        ) {
            this.update({
                error: 'Explicit acknowledgement to discard unsaved Library edits is required.',
            });
            return;
        }
        if (operation === 'MIGRATION' && !migrationAvailable(options.status))
            return;
        if (
            operation === 'INITIALIZATION' &&
            !initializationAvailable(options.status)
        )
            return;
        if (operation === 'RESTORE' && !options.backupId) return;
        if (operation === 'BACKUP' && !options.kind) return;
        this.generation++;
        this.update({ busy: operation, error: null, result: null });
        this.effects.begin(operation);
        if (operation !== 'BACKUP') this.effects.invalidate();
        let result: ManagementView['result'] = null;
        let error: string | null = null;
        try {
            if (operation === 'BACKUP')
                result = await this.client.createWorkspaceBackup(
                    backupPayload(options.kind!, !!options.includeOutput),
                );
            if (operation === 'RESTORE')
                result = await this.client.restoreWorkspaceBackup(
                    options.backupId!,
                );
            if (operation === 'MIGRATION')
                result = await this.client.migrateWorkspace();
            if (operation === 'INITIALIZATION')
                result = await this.client.initializeWorkspace();
        } catch (e) {
            error = formatMaintenanceError(e);
        }
        // A published backup can exist despite retention errors. Never skip authoritative refresh on failure.
        const status = await this.refreshStatus();
        await this.refreshBackups();
        if (operation !== 'BACKUP' && status) {
            try {
                await this.effects.reloadLibrary(status);
            } catch (e) {
                error = [error, formatMaintenanceError(e)]
                    .filter(Boolean)
                    .join('\n');
            }
        }
        this.update({ error, result, busy: 'NONE' });
        this.effects.finish();
    }
}
