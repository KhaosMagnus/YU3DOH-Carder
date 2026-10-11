import assert from 'node:assert/strict';
import * as api from '../src/library/api';
import {
    WorkspaceManagementController,
    backupPayload,
    formatMaintenanceError,
    migrationAvailable,
    type ManagementClient,
    type WorkspaceBackup,
} from '../src/library/workspace-management-state';
import type { WorkspaceStatus } from '../src/library/model';
const status = (state = 'READY'): WorkspaceStatus => ({
    workspace_id: 'fixture',
    name: 'Fixture',
    state,
    database_schema_version: 6,
    workspace_format_version: 1,
    read_only: state !== 'READY',
    health_summary: state,
});
const backup: WorkspaceBackup = {
    backup_format_version: 1,
    backup_id: 'backup',
    kind: 'RECOVERY_POINT',
    workspace_id: 'fixture',
    workspace_format_version: 1,
    database_schema_version: 6,
    created_at: '2026-01-01',
    origin: 'PRE_MIGRATION',
    reason: 'migration',
    include_output: false,
    included_roots: ['Data', 'Assets'],
    excluded_roots: ['Output'],
    absent_source_roots: [],
    completion_state: 'COMPLETE',
    protection_state: 'MIGRATION_PENDING',
};
function fixture() {
    const calls: string[] = [];
    let failure = '';
    let state = 'READY';
    let warnings: Array<{ code: string; message: string }> = [];
    const client = {
        getWorkspaceStatus: async () => {
            calls.push('status');
            return status(state);
        },
        getWorkspaceBackups: async () => {
            calls.push('list');
            return { backups: [backup] };
        },
        createWorkspaceBackup: async (body) => {
            calls.push(`backup:${JSON.stringify(body)}`);
            if (failure)
                throw new api.LibraryHttpError({
                    status: 500,
                    code: failure,
                    message: 'injected',
                });
            return backup;
        },
        restoreWorkspaceBackup: async (id) => {
            calls.push(`restore:${id}`);
            if (failure)
                throw new api.LibraryHttpError({
                    status: 409,
                    code: failure,
                    message: 'injected',
                });
            return {
                operation: 'RESTORE',
                restored: true,
                backup_id: id,
                restored_at: '2026-01-01',
                workspace_id: 'fixture',
                database_schema_version: 6,
                status: status(state),
            };
        },
        migrateWorkspace: async () => {
            calls.push('migrate');
            if (failure)
                throw new api.LibraryHttpError({
                    status: 500,
                    code: failure,
                    message: 'injected',
                });
            return {
                migrated: true,
                backup_id: 'checkpoint',
                status: status(state),
                maintenance_warnings: warnings,
            };
        },
    } satisfies ManagementClient;
    const c = new WorkspaceManagementController(
        {
            begin: (op) => calls.push('begin:' + op),
            invalidate: () => calls.push('invalidate'),
            adoptStatus: (s) => calls.push('adopt:' + s?.state),
            reloadLibrary: async (s) => {
                calls.push('reload:' + s.state);
            },
            finish: () => calls.push('finish'),
        },
        client,
    );
    return {
        c,
        calls,
        client,
        fail: (code: string) => {
            failure = code;
        },
        state: (value: string) => {
            state = value;
        },
        warnings: (value: typeof warnings) => {
            warnings = value;
        },
    };
}
export async function runWorkspaceManagementChecks() {
    let count = 0;
    const check = async (name: string, fn: () => void | Promise<void>) => {
        await fn();
        count++;
        console.log(`RUN015 ${name} PASS`);
    };
    await check(
        'Management reads while not READY and preserves server metadata/order',
        async () => {
            const f = fixture();
            f.state('RECOVERY_REQUIRED');
            await f.c.refresh();
            assert.deepEqual(f.c.view.backups, [backup]);
            assert(f.calls.includes('adopt:RECOVERY_REQUIRED'));
        },
    );
    for (const state of [
        'INVALID_WORKSPACE',
        'UNSUPPORTED_NEWER_SCHEMA',
        'NEEDS_MIGRATION',
    ]) {
        await check(`Management remains available in ${state}`, async () => {
            const f = fixture();
            f.state(state);
            await f.c.refresh();
            assert(f.calls.includes('adopt:' + state));
            assert.deepEqual(f.c.view.backups, [backup]);
        });
    }
    for (const [kind, output, expected] of [
        ['RECOVERY_POINT', true, { kind: 'RECOVERY_POINT' }],
        ['FULL', false, { kind: 'FULL', include_output: false }],
        ['FULL', true, { kind: 'FULL', include_output: true }],
    ] as const) {
        await check(`Exact ${kind}/${output} payload`, async () => {
            assert.deepEqual(backupPayload(kind, output), expected);
            const f = fixture();
            await f.c.execute('BACKUP', {
                kind,
                includeOutput: output,
                dirty: true,
                status: status(),
            });
            assert(f.calls.includes('backup:' + JSON.stringify(expected)));
            assert(!f.calls.includes('invalidate'));
            assert(!f.calls.some((c) => /save|discard/.test(c)));
            assert(f.calls.indexOf('list') < f.calls.indexOf('finish'));
        });
    }
    await check('Backup cancellation sends no operation', () => {
        const f = fixture();
        assert.equal(f.calls.length, 0);
    });
    await check(
        'Published backup remains observable after retention failure',
        async () => {
            const f = fixture();
            f.fail('RETENTION_CLEANUP_FAILED');
            await f.c.execute('BACKUP', {
                kind: 'FULL',
                dirty: false,
                status: status(),
            });
            assert.equal(f.c.view.result, null);
            assert.match(f.c.view.error!, /RETENTION_CLEANUP_FAILED/);
            assert.deepEqual(f.c.view.backups, [backup]);
            assert(f.calls.includes('status'));
        },
    );
    for (const operation of ['RESTORE', 'MIGRATION'] as const) {
        await check(
            `Dirty ${operation} requires acknowledgement without request`,
            async () => {
                const f = fixture();
                await f.c.execute(operation, {
                    backupId: 'backup',
                    dirty: true,
                    status: status('NEEDS_MIGRATION'),
                });
                assert.equal(f.calls.length, 0);
                assert.match(f.c.view.error!, /acknowledgement/);
            },
        );
        await check(
            `${operation} invalidates before request and refreshes before finish`,
            async () => {
                const f = fixture();
                await f.c.execute(operation, {
                    backupId: 'backup',
                    dirty: true,
                    discardAcknowledged: true,
                    status: status('NEEDS_MIGRATION'),
                });
                assert(
                    f.calls.indexOf('invalidate') <
                        f.calls.indexOf(
                            operation === 'RESTORE'
                                ? 'restore:backup'
                                : 'migrate',
                        ),
                );
                assert(
                    f.calls.indexOf('reload:READY') < f.calls.indexOf('finish'),
                );
                assert(!f.calls.some((c) => c.includes('save')));
            },
        );
    }
    await check('Restore NEEDS_MIGRATION remains authoritative', async () => {
        const f = fixture();
        f.state('NEEDS_MIGRATION');
        await f.c.execute('RESTORE', {
            backupId: 'backup',
            dirty: false,
            status: status(),
        });
        assert(f.calls.includes('adopt:NEEDS_MIGRATION'));
        assert(migrationAvailable(status('NEEDS_MIGRATION')));
    });
    for (const code of [
        'BACKUP_NOT_FOUND',
        'BACKUP_INVALID',
        'BACKUP_INCOMPATIBLE',
        'BACKUP_INCOMPLETE',
        'BACKUP_SOURCE_UNSAFE',
        'WORKSPACE_ID_MISMATCH',
        'WORKSPACE_MAINTENANCE_ACTIVE',
        'RESTORE_FAILED',
        'RECOVERY_REQUIRED',
    ]) {
        await check(
            `Restore ${code} remains inspectable and refreshes`,
            async () => {
                const f = fixture();
                f.fail(code);
                f.state('RECOVERY_REQUIRED');
                await f.c.execute('RESTORE', {
                    backupId: 'backup',
                    dirty: false,
                    status: status(),
                });
                assert.equal(f.c.view.error, code + ': injected');
                assert.equal(f.c.view.result, null);
                assert(f.calls.includes('adopt:RECOVERY_REQUIRED'));
            },
        );
    }
    await check(
        'Migration only NEEDS_MIGRATION; no initialize/switch/checkpoint requests',
        async () => {
            const f = fixture();
            assert(!migrationAvailable(status()));
            await f.c.execute('MIGRATION', { dirty: false, status: status() });
            assert.equal(f.calls.length, 0);
            await f.c.execute('MIGRATION', {
                dirty: false,
                status: status('NEEDS_MIGRATION'),
            });
            assert(!f.calls.some((c) => c.startsWith('backup:')));
            assert.equal((f.c.view.result as any).backup_id, 'checkpoint');
        },
    );
    await check(
        'All warnings preserved without migration failure',
        async () => {
            const f = fixture();
            const warnings = [
                { code: 'CHECKPOINT_PROTECTION_UPDATE_FAILED', message: 'one' },
                { code: 'RETENTION_CLEANUP_FAILED', message: 'two' },
            ];
            f.warnings(warnings);
            await f.c.execute('MIGRATION', {
                dirty: false,
                status: status('NEEDS_MIGRATION'),
            });
            assert.equal(f.c.view.error, null);
            assert.deepEqual(
                (f.c.view.result as any).maintenance_warnings,
                warnings,
            );
            assert.equal((f.c.view.result as any).migrated, true);
        },
    );
    await check(
        'Migration failure refreshes recovery state without success',
        async () => {
            const f = fixture();
            f.fail('RECOVERY_REQUIRED');
            f.state('RECOVERY_REQUIRED');
            await f.c.execute('MIGRATION', {
                dirty: false,
                status: status('NEEDS_MIGRATION'),
            });
            assert.equal(f.c.view.result, null);
            assert(f.calls.includes('adopt:RECOVERY_REQUIRED'));
        },
    );
    await check(
        'Concurrent operations cannot submit another request',
        async () => {
            const f = fixture();
            const first = f.c.execute('BACKUP', {
                kind: 'FULL',
                dirty: false,
                status: status(),
            });
            await f.c.execute('RESTORE', {
                backupId: 'backup',
                dirty: false,
                status: status(),
            });
            await first;
            assert(!f.calls.includes('restore:backup'));
        },
    );
    await check(
        'HTTP request contracts and mutation/read fencing',
        async () => {
            const original = globalThis.fetch;
            const requests: Array<{
                url: string;
                method?: string;
                body?: unknown;
            }> = [];
            globalThis.fetch = async (url, init) => {
                requests.push({
                    url: String(url),
                    method: init?.method,
                    body: init?.body
                        ? JSON.parse(String(init.body))
                        : undefined,
                });
                return new Response(
                    JSON.stringify({ backups: [], ...backup }),
                    { status: 200 },
                );
            };
            try {
                await api.createWorkspaceBackup(
                    backupPayload('RECOVERY_POINT', true),
                );
                await api.restoreWorkspaceBackup('backup');
                await api.migrateWorkspace();
                assert.deepEqual(requests.slice(0, 3), [
                    {
                        url: '/api/v1/workspace/backups',
                        method: 'POST',
                        body: { kind: 'RECOVERY_POINT' },
                    },
                    {
                        url: '/api/v1/workspace/backups/backup/restore',
                        method: 'POST',
                        body: undefined,
                    },
                    {
                        url: '/api/v1/workspace/migrate',
                        method: 'POST',
                        body: undefined,
                    },
                ]);
                for (const operation of [
                    'BACKUP',
                    'RESTORE',
                    'MIGRATION',
                ] as const) {
                    api.setLibraryMaintenanceFence(operation);
                    const length = requests.length;
                    await assert.rejects(
                        api.createLibraryCard({ family: 'SPELL' }),
                        /maintenance/,
                    );
                    await assert.rejects(
                        api.reviewCanonicalConfirmation(
                            'card',
                            'STRUCTURE',
                            '1',
                        ),
                        /maintenance/,
                    );
                    assert.equal(requests.length, length);
                    if (operation !== 'BACKUP')
                        await assert.rejects(
                            api.getLibraryCard('card'),
                            /maintenance/,
                        );
                    await api.getWorkspaceStatus();
                }
            } finally {
                api.setLibraryMaintenanceFence('NONE');
                globalThis.fetch = original;
            }
        },
    );
    await check(
        'Late pre-maintenance management refresh cannot adopt old status or launch reads',
        async () => {
            const f = fixture();
            let resolveOld!: (s: WorkspaceStatus) => void;
            let reads = 0;
            f.client.getWorkspaceStatus = async () =>
                ++reads === 1
                    ? await new Promise<WorkspaceStatus>((resolve) => {
                          resolveOld = resolve;
                      })
                    : status();
            const oldRefresh = f.c.refresh();
            await f.c.execute('RESTORE', {
                backupId: 'backup',
                dirty: false,
                status: status(),
            });
            resolveOld(status('INVALID_WORKSPACE'));
            await oldRefresh;
            assert(!f.calls.includes('adopt:INVALID_WORKSPACE'));
            assert.equal(f.calls.filter((c) => c === 'reload:READY').length, 1);
        },
    );
    await check('Error formatter preserves server code and message', () =>
        assert.equal(
            formatMaintenanceError(
                new api.LibraryHttpError({
                    status: 409,
                    code: 'WORKSPACE_MAINTENANCE_ACTIVE',
                    message: 'server maintenance',
                }),
            ),
            'WORKSPACE_MAINTENANCE_ACTIVE: server maintenance',
        ),
    );
    console.log(`RUN015 Workspace management checks: ${count} passed`);
}
