import { useEffect, useState } from 'react';
import { Alert, Button, Checkbox, Modal, Radio, Spin, Tag } from 'antd';
import type { WorkspaceStatus } from './model';
import {
    migrationAvailable,
    initializationAvailable,
    type BackupKind,
    type WorkspaceBackup,
    type WorkspaceManagementController,
} from './workspace-management-state';
export const WorkspaceManagement = ({
    open,
    onClose,
    status,
    statusError,
    dirty,
    controller,
}: {
    open: boolean;
    onClose: () => void;
    status: WorkspaceStatus | null;
    statusError: string | null;
    dirty: boolean;
    controller: WorkspaceManagementController;
}) => {
    const [view, setView] = useState(controller.view);
    const [action, setAction] = useState<
        'BACKUP' | 'RESTORE' | 'MIGRATION' | 'INITIALIZATION' | null
    >(null);
    const [kind, setKind] = useState<BackupKind>('RECOVERY_POINT');
    const [output, setOutput] = useState(false);
    const [backup, setBackup] = useState<WorkspaceBackup | null>(null);
    const [discard, setDiscard] = useState(false);
    useEffect(() => controller.subscribe(setView), [controller]);
    useEffect(() => {
        if (open) void controller.refresh();
    }, [open, controller]);
    const busy = view.busy !== 'NONE';
    const start = (a: typeof action, b: WorkspaceBackup | null = null) => {
        setAction(a);
        setBackup(b);
        setDiscard(false);
        setKind('RECOVERY_POINT');
        setOutput(false);
    };
    const submit = () => {
        if (!action || busy) return;
        const operation = action;
        setAction(null);
        void controller.execute(operation, {
            kind,
            includeOutput: output,
            backupId: backup?.backup_id,
            dirty,
            discardAcknowledged: discard,
            status,
        });
    };
    return (
        <>
            <Modal
                zIndex={1200}
                title="Workspace Management"
                visible={open}
                width={880}
                onCancel={onClose}
                maskClosable={false}
                footer={<Button onClick={onClose}>Close Workspace</Button>}
            >
                {statusError && (
                    <Alert
                        type="error"
                        message="Workspace Service unavailable"
                        description={statusError}
                    />
                )}
                {!status && !statusError && (
                    <Spin tip="Loading Workspace status…" />
                )}
                {status && (
                    <section aria-label="Workspace status">
                        <h3>{status.name ?? 'Workspace'}</h3>
                        <dl className="workspace-management__metadata">
                            <dt>Workspace ID</dt>
                            <dd>{status.workspace_id ?? 'Unavailable'}</dd>
                            <dt>Lifecycle</dt>
                            <dd>{status.state}</dd>
                            <dt>Workspace format</dt>
                            <dd>
                                {status.workspace_format_version ??
                                    'Unavailable'}
                            </dd>
                            <dt>Database schema</dt>
                            <dd>
                                {status.database_schema_version ??
                                    'Unavailable'}
                            </dd>
                            <dt>Read only</dt>
                            <dd>{String(status.read_only)}</dd>
                            <dt>Health</dt>
                            <dd>{status.health_summary}</dd>
                        </dl>
                        {status.state === 'RECOVERY_REQUIRED' && (
                            <Alert
                                type="error"
                                message="Recovery Required"
                                description={status.health_summary}
                            />
                        )}

                        {migrationAvailable(status) && (
                            <Alert
                                type="warning"
                                message="This Workspace requires migration before normal Library use."
                            />
                        )}
                    </section>
                )}
                {busy && (
                    <Alert
                        type="info"
                        message={`Workspace maintenance in progress: ${view.busy}`}
                        description="Library mutations are disabled until authoritative state is refreshed."
                    />
                )}
                <div className="workspace-management__actions">
                    <Button
                        disabled={busy}
                        onClick={() => void controller.refresh()}
                    >
                        Refresh Workspace / Retry
                    </Button>
                    <Button
                        disabled={busy || !status || !!statusError}
                        onClick={() => start('BACKUP')}
                    >
                        Create Backup
                    </Button>
                    {initializationAvailable(status) && (
                        <Button
                            disabled={busy || !!statusError}
                            onClick={() => start('INITIALIZATION')}
                        >
                            Initialize Workspace
                        </Button>
                    )}
                    {migrationAvailable(status) && (
                        <Button
                            disabled={busy || !!statusError}
                            onClick={() => start('MIGRATION')}
                        >
                            Migrate Workspace
                        </Button>
                    )}
                </div>
                {view.error && (
                    <Alert
                        type="error"
                        message="Workspace operation error"
                        description={<pre>{view.error}</pre>}
                    />
                )}
                {view.result && (
                    <section aria-label="Workspace operation result">
                        {'kind' in view.result && (
                            <Alert
                                type="success"
                                message="Backup completed"
                                description={`Backup ID: ${view.result.backup_id}`}
                            />
                        )}
                        {'restored' in view.result && (
                            <Alert
                                type="success"
                                message="Restore completed"
                                description={`Backup ID: ${view.result.backup_id} · Restored at: ${view.result.restored_at} · Resulting state: ${view.result.status.state}`}
                            />
                        )}
                        {'initialized' in view.result && (
                            <Alert
                                type="success"
                                message="Workspace initialized"
                                description={`Workspace ID: ${view.result.workspace_id} · Lifecycle: ${view.result.status.state} · Workspace format: ${view.result.workspace_format_version} · Database schema: ${view.result.database_schema_version}`}
                            />
                        )}
                        {'migrated' in view.result && (
                            <>
                                <Alert
                                    type="success"
                                    message={
                                        view.result.migrated
                                            ? 'Migration completed'
                                            : 'Migration not required'
                                    }
                                    description={`Migrated: ${String(view.result.migrated)} · Resulting state: ${view.result.status.state} · Database schema: ${view.result.status.database_schema_version} · Recovery checkpoint: ${view.result.backup_id ?? 'None'}`}
                                />
                                {(view.result.maintenance_warnings ?? []).map(
                                    (warning, i) => (
                                        <Alert
                                            key={i}
                                            type="warning"
                                            message={warning.code}
                                            description={warning.message}
                                        />
                                    ),
                                )}
                            </>
                        )}
                    </section>
                )}
                <h3>Completed backups</h3>
                {view.listError && (
                    <Alert
                        type="error"
                        message="Backups unavailable"
                        description={view.listError}
                    />
                )}
                {!view.listError && view.backups.length === 0 && (
                    <p>No completed backups listed.</p>
                )}
                {view.backups.map((b) => (
                    <article
                        key={b.backup_id}
                        className="workspace-management__backup"
                        data-backup-id={b.backup_id}
                    >
                        <strong>{b.backup_id}</strong> <Tag>{b.kind}</Tag>
                        <Tag
                            color={
                                b.protection_state === 'NONE'
                                    ? undefined
                                    : 'orange'
                            }
                        >
                            {b.protection_state}
                        </Tag>
                        <p>
                            Created: {b.created_at} · Origin: {b.origin} ·
                            Schema: {b.database_schema_version} · Output:{' '}
                            {b.include_output ? 'included' : 'not included'}
                        </p>
                        <p>Reason: {b.reason}</p>
                        <Button
                            disabled={busy || !!statusError}
                            onClick={() => start('RESTORE', b)}
                        >
                            Restore
                        </Button>
                    </article>
                ))}
            </Modal>
            <Modal
                zIndex={1300}
                title={
                    action === 'INITIALIZATION'
                        ? 'Initialize Workspace — explicit confirmation'
                        : action === 'BACKUP'
                          ? 'Create Backup'
                          : action === 'RESTORE'
                            ? 'Restore Backup — replace persisted Workspace'
                            : 'Migrate Workspace — explicit confirmation'
                }
                visible={action !== null}
                maskClosable={false}
                onCancel={() => setAction(null)}
                onOk={submit}
                okText={
                    action === 'INITIALIZATION'
                        ? 'Initialize configured Workspace'
                        : action === 'BACKUP'
                          ? 'Create backup'
                          : action === 'RESTORE'
                            ? 'Restore selected backup'
                            : 'Confirm migration'
                }
                okButtonProps={{
                    disabled:
                        busy || (action !== 'BACKUP' && dirty && !discard),
                }}
            >
                {action === 'BACKUP' && (
                    <>
                        <Radio.Group
                            value={kind}
                            onChange={(e) => setKind(e.target.value)}
                        >
                            <Radio value="RECOVERY_POINT">Recovery Point</Radio>
                            <Radio value="FULL">Full Backup</Radio>
                        </Radio.Group>
                        {kind === 'FULL' && (
                            <p>
                                <Checkbox
                                    checked={output}
                                    onChange={(e) =>
                                        setOutput(e.target.checked)
                                    }
                                >
                                    Include Output
                                </Checkbox>
                            </p>
                        )}
                        <p>Only persisted Workspace state is captured.</p>
                        {dirty && (
                            <Alert
                                type="warning"
                                message="Unsaved Library edits are not included in this backup."
                            />
                        )}
                    </>
                )}
                {action === 'RESTORE' && backup && (
                    <>
                        <p>
                            Persisted Workspace state will be replaced by this
                            backup according to its contents.
                        </p>
                        <dl className="workspace-management__metadata">
                            <dt>Backup ID</dt>
                            <dd>{backup.backup_id}</dd>
                            <dt>Kind</dt>
                            <dd>{backup.kind}</dd>
                            <dt>Created</dt>
                            <dd>{backup.created_at}</dd>
                            <dt>Database schema</dt>
                            <dd>{backup.database_schema_version}</dd>
                            <dt>Workspace ID</dt>
                            <dd>{backup.workspace_id}</dd>
                            <dt>Workspace format</dt>
                            <dd>{backup.workspace_format_version}</dd>
                            <dt>Included roots</dt>
                            <dd>{backup.included_roots.join(', ')}</dd>
                            <dt>Excluded roots</dt>
                            <dd>
                                {backup.excluded_roots.join(', ') || 'None'}
                            </dd>
                            <dt>Absent source roots</dt>
                            <dd>
                                {backup.absent_source_roots.join(', ') ||
                                    'None'}
                            </dd>
                            <dt>Output</dt>
                            <dd>
                                {backup.include_output
                                    ? 'included'
                                    : 'not included'}
                            </dd>
                            <dt>Completion</dt>
                            <dd>{backup.completion_state}</dd>
                            <dt>Protection</dt>
                            <dd>{backup.protection_state}</dd>
                        </dl>
                    </>
                )}
                {action === 'INITIALIZATION' && (
                    <p>
                        The already-configured Workspace location will be
                        initialized with a new server-generated Workspace
                        identity. This does not switch Workspaces or adopt
                        unknown existing contents.
                    </p>
                )}
                {action === 'MIGRATION' && (
                    <p>
                        The Workspace Service will create the recovery
                        checkpoint, migrate and verify this Workspace. Existing
                        client snapshots will be cleared.
                    </p>
                )}
                {action !== 'BACKUP' && dirty && (
                    <Checkbox
                        checked={discard}
                        onChange={(e) => setDiscard(e.target.checked)}
                    >
                        I acknowledge that unsaved Library edits will be
                        discarded without saving.
                    </Checkbox>
                )}
            </Modal>
        </>
    );
};
