import assert from 'node:assert/strict';
import * as api from '../src/library/api';
import {
    WorkspaceManagementController,
    initializationAvailable,
    type ManagementClient,
} from '../src/library/workspace-management-state';
import type { WorkspaceStatus } from '../src/library/model';
const status = (state = 'NEEDS_INITIALIZATION'): WorkspaceStatus => ({
    state,
    workspace_id: state === 'READY' ? 'new-id' : null,
    name: null,
    workspace_format_version: state === 'READY' ? 1 : null,
    database_schema_version: state === 'READY' ? 6 : null,
    read_only: state !== 'READY',
    health_summary: state,
});
function fixture() {
    const calls: string[] = [];
    let failure = '';
    let reloadFailure = false;
    let blocked = false;
    let next = status('READY');
    const client = {
        getWorkspaceStatus: async () => {
            calls.push('status');
            return next;
        },
        getWorkspaceBackups: async () => {
            calls.push('backups');
            return { backups: [] };
        },
        createWorkspaceBackup: api.createWorkspaceBackup,
        restoreWorkspaceBackup: api.restoreWorkspaceBackup,
        migrateWorkspace: api.migrateWorkspace,
        initializeWorkspace: async () => {
            calls.push('initialize');
            if (failure)
                throw new api.LibraryHttpError({
                    status: 409,
                    code: failure,
                    message: 'authoritative error',
                });
            return {
                operation: 'INITIALIZE' as const,
                initialized: true as const,
                workspace_id: 'new-id',
                workspace_format_version: 1,
                database_schema_version: 6,
                status: status('READY'),
            };
        },
    } satisfies ManagementClient;
    const c = new WorkspaceManagementController(
        {
            begin: (operation) => calls.push(operation),
            invalidate: () => {
                calls.push('invalidate');
                blocked = true;
            },
            adoptStatus: (s) => calls.push('adopt:' + s?.state),
            reloadLibrary: async (s) => {
                calls.push('reload:' + s.state);
                if (s.state !== 'READY') return;
                if (reloadFailure) throw new Error('reload failed');
                blocked = false;
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
            next = status('INVALID_WORKSPACE');
        },
        reloadFail: (value: boolean) => {
            reloadFailure = value;
        },
        blocked: () => blocked,
    };
}
export async function runInitializationChecks() {
    let count = 0;
    const check = async (name: string, fn: () => void | Promise<void>) => {
        await fn();
        count++;
        console.log(`RUN016 ${name} PASS`);
    };
    await check('Eligibility exactly NEEDS_INITIALIZATION', () => {
        assert(initializationAvailable(status()));
        for (const state of [
            'READY',
            'NEEDS_MIGRATION',
            'RECOVERY_REQUIRED',
            'INVALID_WORKSPACE',
            'UNSUPPORTED_NEWER_SCHEMA',
            'PERSISTENCE_UNVERIFIED',
        ])
            assert(!initializationAvailable(status(state)));
        assert(!initializationAvailable(null));
    });
    await check('Opening/refresh/cancel never Initialize', async () => {
        const f = fixture();
        await f.c.refresh();
        assert(!f.calls.includes('initialize'));
    });
    await check(
        'Wrong lifecycle sends no request or invalidation',
        async () => {
            const f = fixture();
            await f.c.execute('INITIALIZATION', {
                dirty: false,
                status: status('READY'),
            });
            assert.equal(f.calls.length, 0);
        },
    );
    await check(
        'Dirty acknowledgement required, no autosave/request',
        async () => {
            const f = fixture();
            await f.c.execute('INITIALIZATION', {
                dirty: true,
                status: status(),
            });
            assert.equal(f.calls.length, 0);
            assert.match(f.c.view.error!, /acknowledgement/);
        },
    );
    for (const dirty of [false, true])
        await check(
            `Initialize ${dirty ? 'acknowledged dirty' : 'clean'} invalidates before request and refreshes/rebuilds before finish`,
            async () => {
                const f = fixture();
                await f.c.execute('INITIALIZATION', {
                    dirty,
                    discardAcknowledged: dirty,
                    status: status(),
                });
                assert.deepEqual(f.calls, [
                    'INITIALIZATION',
                    'invalidate',
                    'initialize',
                    'status',
                    'adopt:READY',
                    'backups',
                    'reload:READY',
                    'finish',
                ]);
                assert.equal((f.c.view.result as any).workspace_id, 'new-id');
                assert.equal(f.c.view.error, null);
                assert(!f.blocked());
            },
        );
    for (const code of [
        'WORKSPACE_INITIALIZATION_NOT_ALLOWED',
        'WORKSPACE_INITIALIZATION_UNSAFE',
        'WORKSPACE_INITIALIZATION_FAILED',
        'WORKSPACE_MAINTENANCE_ACTIVE',
    ])
        await check(
            `Initialize ${code} remains visible and refreshes authoritative lifecycle`,
            async () => {
                const f = fixture();
                f.fail(code);
                await f.c.execute('INITIALIZATION', {
                    dirty: false,
                    status: status(),
                });
                assert.equal(f.c.view.error, code + ': authoritative error');
                assert.equal(f.c.view.result, null);
                assert(f.calls.includes('adopt:INVALID_WORKSPACE'));
                assert(f.calls.includes('backups'));
                assert(f.blocked());
            },
        );
    await check(
        'Server success survives reload failure; editing blocked until successful Retry',
        async () => {
            const f = fixture();
            f.reloadFail(true);
            await f.c.execute('INITIALIZATION', {
                dirty: false,
                status: status(),
            });
            assert.equal((f.c.view.result as any).initialized, true);
            assert.match(f.c.view.error!, /reload failed/);
            assert(f.blocked());
            f.reloadFail(false);
            await f.c.refresh();
            assert(!f.blocked());
            assert.equal((f.c.view.result as any).initialized, true);
        },
    );
    await check(
        'Concurrent Initialize cannot submit another operation',
        async () => {
            const f = fixture();
            const first = f.c.execute('INITIALIZATION', {
                dirty: false,
                status: status(),
            });
            await f.c.execute('INITIALIZATION', {
                dirty: false,
                status: status(),
            });
            await first;
            assert.equal(f.calls.filter((c) => c === 'initialize').length, 1);
        },
    );
    await check(
        'Late management status cannot resurrect stale state after Initialize',
        async () => {
            const f = fixture();
            let resolveOld!: (s: WorkspaceStatus) => void;
            let reads = 0;
            f.client.getWorkspaceStatus = async () =>
                ++reads === 1
                    ? await new Promise<WorkspaceStatus>((resolve) => {
                          resolveOld = resolve;
                      })
                    : status('READY');
            const old = f.c.refresh();
            await f.c.execute('INITIALIZATION', {
                dirty: false,
                status: status(),
            });
            resolveOld(status('INVALID_WORKSPACE'));
            await old;
            assert(!f.calls.includes('adopt:INVALID_WORKSPACE'));
            assert.equal(f.calls.filter((c) => c === 'reload:READY').length, 1);
        },
    );
    await check(
        'HTTP exactly POST {} without path argument; Initialize exclusive read/write fence',
        async () => {
            const original = globalThis.fetch;
            const calls: Array<{
                url: string;
                method?: string;
                body?: string;
            }> = [];
            globalThis.fetch = async (url, init) => {
                calls.push({
                    url: String(url),
                    method: init?.method,
                    body: String(init?.body ?? ''),
                });
                return new Response(JSON.stringify(status()), { status: 200 });
            };
            try {
                assert.equal(api.initializeWorkspace.length, 0);
                await api.initializeWorkspace();
                assert.deepEqual(calls, [
                    {
                        url: '/api/v1/workspace/initialize',
                        method: 'POST',
                        body: '{}',
                    },
                ]);
                api.setLibraryMaintenanceFence('INITIALIZATION');
                await assert.rejects(api.getLibraryCard('card'), /maintenance/);
                await assert.rejects(
                    api.createLibraryCard({ family: 'SPELL' }),
                    /maintenance/,
                );
                assert.equal(calls.length, 1);
                await api.getWorkspaceStatus();
                assert.equal(calls.length, 2);
            } finally {
                globalThis.fetch = original;
                api.setLibraryMaintenanceFence('NONE');
            }
        },
    );
    console.log(
        `RUN016 Initialization client checks: ${count} PASS / 0 FAIL / 0 SKIP`,
    );
}
