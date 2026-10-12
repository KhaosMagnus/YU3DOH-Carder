import assert from 'node:assert/strict';
import test from 'node:test';
import {
    existsSync,
    readFileSync,
    readdirSync,
    writeFileSync,
    mkdirSync,
    lstatSync,
    unlinkSync,
} from 'node:fs';
import { mkdtemp, rm, symlink } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import Database from 'better-sqlite3';
import { createWorkspaceService, type WorkspaceService } from '../src/service';
import { bootstrapWorkspaceDatabase } from '../src/persistence/operations';
import type { InitializationHooks } from '../src/workspace/initialization';
const roots: string[] = [];
const services: WorkspaceService[] = [];
test.after(async () => {
    for (const s of services) await s.close();
    for (const r of roots)
        await rm(r, {
            recursive: true,
            force: true,
            maxRetries: 5,
            retryDelay: 100,
        });
});
const manifest = () => ({
    workspace_id: 'existing-identity',
    workspace_format_version: 1,
    database_path: 'Data/workspace.db',
    created_at: new Date().toISOString(),
});
async function setup(
    options: {
        missing?: boolean;
        hooks?: InitializationHooks;
        prepare?: (root: string) => void;
    } = {},
) {
    const parent = await mkdtemp(
        path.join(os.tmpdir(), 'RUN016 initialization 日本語 spaces '),
    );
    roots.push(parent);
    const root = path.join(parent, 'configured root 日本語');
    if (!options.missing) mkdirSync(root);
    options.prepare?.(root);
    const s = await createWorkspaceService(
        { workspaceRoot: root, host: '127.0.0.1', port: 0 },
        { initializationHooks: options.hooks ?? {} },
    );
    services.push(s);
    return { root, s };
}
const call = (s: WorkspaceService, payload: Record<string, unknown> = {}) =>
    s.app.inject({
        method: 'POST',
        url: '/api/v1/workspace/initialize',
        payload,
    });
for (const missing of [false, true])
    test(`INIT-01/02: ${missing ? 'missing' : 'empty'} spaces/Unicode root -> exact manifest, schema/history/services READY`, async () => {
        const { root, s } = await setup({ missing });
        const registry = s.carderAssetGrants;
        const grant = registry.issue({
            cardId: 'old-card',
            variantId: 'old-variant',
            composition: 'STANDARD',
            revision: '1',
            assetId: 'old-asset',
            hash: 'old-hash',
            role: 'BS',
        });
        assert(registry.verify(grant, 'old-asset', 'old-hash'));
        assert.equal(s.status.state, 'NEEDS_INITIALIZATION');
        const response = await call(s);
        assert.equal(response.statusCode, 200, response.body);
        const result = response.json();
        assert.equal(result.operation, 'INITIALIZE');
        assert.equal(result.initialized, true);
        assert.match(
            result.workspace_id,
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
        );
        const m = JSON.parse(
            readFileSync(path.join(root, 'workspace.json'), 'utf8'),
        );
        assert.deepEqual(Object.keys(m).sort(), [
            'created_at',
            'database_path',
            'workspace_format_version',
            'workspace_id',
        ]);
        assert.equal(m.workspace_id, result.workspace_id);
        assert.equal(m.workspace_format_version, 1);
        assert.equal(m.database_path, 'Data/workspace.db');
        assert(!Number.isNaN(Date.parse(m.created_at)));
        assert.equal(result.status.state, 'READY');
        assert.equal(result.status.read_only, false);
        assert.equal(result.database_schema_version, 6);
        assert.equal(result.status.workspace_id, result.workspace_id);
        assert(s.persistence?.isOpen);
        assert.notEqual(s.carderAssetGrants, registry);
        assert.equal(
            s.carderAssetGrants.verify(grant, 'old-asset', 'old-hash'),
            null,
        );
        assert.equal(s.runtime.workspaceRoot, root);
        for (const name of [
            'canonical',
            'assets',
            'managedAssets',
            'library',
            'libraryAssets',
            'assetMutations',
            'variantLifecycle',
            'carderPrepare',
        ] as const)
            assert(s[name], name);
        const db = new Database(path.join(root, 'Data/workspace.db'));
        assert.equal(db.pragma('user_version', { simple: true }), 6);
        const tables = db
            .prepare("SELECT name FROM sqlite_master WHERE type='table'")
            .all() as { name: string }[];
        const history = tables.find((t) => t.name.includes('migration'));
        assert(history);
        const records = db
            .prepare(`SELECT * FROM ${history.name}`)
            .all() as any[];
        assert.equal(records.length, 6);
        assert.deepEqual(
            records.map((row) => row.version),
            [1, 2, 3, 4, 5, 6],
        );
        db.close();
        assert.deepEqual(readdirSync(root).sort(), ['Data', 'workspace.json']);
        for (const optional of [
            'Assets',
            'Config',
            'Backups',
            'Temp',
            'Output',
        ])
            assert(!existsSync(path.join(root, optional)));
        assert.equal(
            (
                await s.app.inject({
                    method: 'GET',
                    url: '/api/v1/library/cards',
                })
            ).statusCode,
            200,
        );
        const card = s.canonical!.createCard({ family: 'SPELL' });
        const scan = await s.assets!.scan();
        assert(
            scan.diagnostics.some(
                (item) => item.code === 'ASSETS_DIRECTORY_MISSING',
            ),
        );
        assert(!existsSync(path.join(root, 'Assets')));
        const bytes = readFileSync(path.join(root, 'workspace.json'));
        const repeated = await call(s);
        assert.equal(repeated.statusCode, 409);
        assert.equal(
            repeated.json().code,
            'WORKSPACE_INITIALIZATION_NOT_ALLOWED',
        );
        assert.deepEqual(
            readFileSync(path.join(root, 'workspace.json')),
            bytes,
        );
        assert.equal(s.status.workspace_id, result.workspace_id);
        assert.deepEqual(s.canonical!.getCard(card.cardId), card);
    });
const cases: Array<[string, (root: string) => void, string]> = [
    [
        'unknown content',
        (r) => writeFileSync(path.join(r, 'keep-me.txt'), 'foreign'),
        'INVALID_WORKSPACE',
    ],
    [
        'malformed manifest',
        (r) =>
            writeFileSync(
                path.join(r, 'workspace.json'),
                'invalid foreign manifest',
            ),
        'INVALID_WORKSPACE',
    ],
    [
        'missing DB',
        (r) =>
            writeFileSync(
                path.join(r, 'workspace.json'),
                JSON.stringify(manifest()),
            ),
        'RECOVERY_REQUIRED',
    ],
    [
        'old DB',
        (r) => {
            const m = manifest();
            writeFileSync(path.join(r, 'workspace.json'), JSON.stringify(m));
            mkdirSync(path.join(r, 'Data'));
            new Database(path.join(r, m.database_path)).close();
        },
        'NEEDS_MIGRATION',
    ],
    [
        'newer format',
        (r) =>
            writeFileSync(
                path.join(r, 'workspace.json'),
                JSON.stringify({ ...manifest(), workspace_format_version: 2 }),
            ),
        'UNSUPPORTED_NEWER_SCHEMA',
    ],
    [
        'ready',
        (r) => {
            const m = manifest();
            writeFileSync(path.join(r, 'workspace.json'), JSON.stringify(m));
            bootstrapWorkspaceDatabase(r, m);
        },
        'READY',
    ],
    [
        'non-directory',
        (r) => {
            require('node:fs').rmdirSync(r);
            writeFileSync(r, 'foreign file');
        },
        'INVALID_WORKSPACE',
    ],
];
for (const [name, prepare, state] of cases)
    test(`INIT-eligibility: ${name} rejected/preserved`, async () => {
        const { root, s } = await setup({ prepare });
        assert.equal(s.status.state, state);
        const snapshot = lstatSync(root).isFile()
            ? readFileSync(root)
            : Object.fromEntries(
                  readdirSync(root)
                      .filter((n) => lstatSync(path.join(root, n)).isFile())
                      .map((n) => [n, readFileSync(path.join(root, n))]),
              );
        const response = await call(s);
        assert.equal(response.statusCode, 409, response.body);
        assert.equal(
            response.json().code,
            'WORKSPACE_INITIALIZATION_NOT_ALLOWED',
        );
        const after = lstatSync(root).isFile()
            ? readFileSync(root)
            : Object.fromEntries(
                  readdirSync(root)
                      .filter((n) => lstatSync(path.join(root, n)).isFile())
                      .map((n) => [n, readFileSync(path.join(root, n))]),
              );
        assert.deepEqual(after, snapshot);
    });
test('INIT-stale: fresh inspection inside lease rejects a previously empty root changed before request', async () => {
    const { root, s } = await setup();
    writeFileSync(path.join(root, 'foreign.bin'), 'must survive');
    const response = await call(s);
    assert.equal(response.statusCode, 409);
    assert.deepEqual(readdirSync(root), ['foreign.bin']);
    assert.equal(
        readFileSync(path.join(root, 'foreign.bin'), 'utf8'),
        'must survive',
    );
    assert.equal(s.status.state, 'INVALID_WORKSPACE');
});
test('INIT-lease: mutation after acquired lease is reinspected before any own content', async () => {
    let root = '';
    const f = await setup({
        hooks: {
            atBoundary: (b) => {
                if (b === 'leased')
                    writeFileSync(path.join(root, 'foreign.txt'), 'external');
            },
        },
    });
    root = f.root;
    const response = await call(f.s);
    assert.equal(response.statusCode, 409);
    assert.deepEqual(readdirSync(root), ['foreign.txt']);
});
for (const boundary of [
    'bootstrap',
    'db_staged',
    'db_published',
    'manifest_published',
    'runtime_reloaded',
] as const)
    test(`INIT-rollback: controlled ${boundary} failure removes only owned files and empty created root`, async () => {
        const { root, s } = await setup({
            missing: true,
            hooks: {
                atBoundary: (b) => {
                    if (b === boundary)
                        throw new Error('injected initialization failure');
                },
            },
        });
        const r = await call(s);
        assert.equal(r.statusCode, 500, r.body);
        assert.equal(r.json().code, 'WORKSPACE_INITIALIZATION_FAILED');
        assert(!existsSync(root));
        assert.equal(s.status.state, 'NEEDS_INITIALIZATION');
    });
test('INIT-foreign manifest publication race: never overwritten or deleted', async () => {
    let root = '';
    const foreign = JSON.stringify(manifest());
    const f = await setup({
        hooks: {
            atBoundary: (b) => {
                if (b === 'db_published')
                    writeFileSync(path.join(root, 'workspace.json'), foreign, {
                        flag: 'wx',
                    });
            },
        },
    });
    root = f.root;
    const r = await call(f.s);
    assert.equal(r.statusCode, 409, r.body);
    assert.equal(
        readFileSync(path.join(root, 'workspace.json'), 'utf8'),
        foreign,
    );
    assert(!existsSync(path.join(root, 'Data/workspace.db')));
    assert.equal(f.s.status.state, 'RECOVERY_REQUIRED');
});
test('INIT-foreign file during rollback: no recursive root cleanup', async () => {
    let root = '';
    const f = await setup({
        missing: true,
        hooks: {
            atBoundary: (b) => {
                if (b === 'manifest_published') {
                    writeFileSync(
                        path.join(root, 'keep-me.txt'),
                        'foreign bytes',
                    );
                    throw new Error('failure');
                }
            },
        },
    });
    root = f.root;
    const r = await call(f.s);
    assert.equal(r.statusCode, 500);
    assert.deepEqual(readdirSync(root), ['keep-me.txt']);
    assert.equal(
        readFileSync(path.join(root, 'keep-me.txt'), 'utf8'),
        'foreign bytes',
    );
    assert.equal(f.s.status.state, 'INVALID_WORKSPACE');
});
test('INIT-foreign manifest replacing own published manifest is preserved', async () => {
    let root = '';
    const f = await setup({
        hooks: {
            atBoundary: (b) => {
                if (b === 'manifest_published') {
                    unlinkSync(path.join(root, 'workspace.json'));
                    writeFileSync(
                        path.join(root, 'workspace.json'),
                        'foreign replacement',
                    );
                    throw new Error('fail');
                }
            },
        },
    });
    root = f.root;
    const r = await call(f.s);
    assert.equal(r.statusCode, 500);
    assert.equal(
        readFileSync(path.join(root, 'workspace.json'), 'utf8'),
        'foreign replacement',
    );
    assert.equal(f.s.status.state, 'INVALID_WORKSPACE');
});
test('INIT-bootstrap refuses foreign DB; no opened/overwritten foreign staging content', async () => {
    let root = '';
    const f = await setup({
        hooks: {
            atBoundary: (b) => {
                if (b === 'bootstrap') {
                    const stage = readdirSync(root).find((n) =>
                        n.startsWith('.initialization-'),
                    )!;
                    writeFileSync(
                        path.join(root, stage, 'workspace.db'),
                        'foreign DB bytes',
                    );
                }
            },
        },
    });
    root = f.root;
    const r = await call(f.s);
    assert.equal(r.statusCode, 500);
    const stage = readdirSync(root)[0]!;
    assert.equal(
        readFileSync(path.join(root, stage, 'workspace.db'), 'utf8'),
        'foreign DB bytes',
    );
    assert(!existsSync(path.join(root, 'workspace.json')));
    assert.equal(f.s.status.state, 'INVALID_WORKSPACE');
});
test('INIT-postcondition: unprovable final runtime never reports success', async () => {
    let s: WorkspaceService;
    const f = await setup({
        hooks: {
            atBoundary: (b) => {
                if (b === 'runtime_reloaded')
                    s.runtime.recoveryRequired('test postcondition failure');
            },
        },
    });
    s = f.s;
    const r = await call(s);
    assert.equal(r.statusCode, 500);
    assert.equal(s.status.state, 'NEEDS_INITIALIZATION');
});
for (const field of [
    'root',
    'workspaceRoot',
    'workspace_id',
    'database_path',
    'workspace_format_version',
    'name',
])
    test(`INIT-HTTP: reject unexpected ${field} before touching filesystem`, async () => {
        const { root, s } = await setup({ missing: true });
        const r = await call(s, { [field]: 'untrusted' });
        assert.equal(r.statusCode, 400);
        assert(!existsSync(root));
    });
test('INIT-real junction/symlink target and ancestor rejected without following', async () => {
    const { root, s } = await setup({ missing: true });
    const target = path.join(path.dirname(root), 'target');
    mkdirSync(target);
    await symlink(
        target,
        root,
        process.platform === 'win32' ? 'junction' : 'dir',
    );
    const r = await call(s);
    assert.equal(r.statusCode, 422);
    assert.equal(r.json().code, 'WORKSPACE_INITIALIZATION_UNSAFE');
    assert.deepEqual(readdirSync(target), []);
    console.log('RUN016 real junction executed platform=' + process.platform);
});
test('INIT-concurrency: exclusive lease blocks reads/writes and all management mutations', async () => {
    let enter!: () => void, release!: () => void;
    const entered = new Promise<void>((r) => (enter = r)),
        held = new Promise<void>((r) => (release = r));
    const { root, s } = await setup({
        missing: true,
        hooks: {
            atBoundary: async (b) => {
                if (b === 'leased') {
                    enter();
                    await held;
                }
            },
        },
    });
    const first = call(s);
    await entered;
    for (const [url, payload] of [
        ['/api/v1/workspace/initialize', {}],
        ['/api/v1/workspace/backups', { kind: 'RECOVERY_POINT' }],
        ['/api/v1/workspace/migrate', {}],
        ['/api/v1/workspace/backups/absent/restore', {}],
    ] as const) {
        const r = await s.app.inject({ method: 'POST', url, payload });
        assert.equal(r.statusCode, 409, r.body);
        assert.equal(r.json().code, 'WORKSPACE_MAINTENANCE_ACTIVE');
    }
    assert.equal(
        (await s.app.inject({ method: 'GET', url: '/api/v1/library/cards' }))
            .statusCode,
        409,
    );
    assert.equal(
        (
            await s.app.inject({
                method: 'POST',
                url: '/api/v1/library/cards',
                payload: { family: 'SPELL' },
            })
        ).statusCode,
        409,
    );
    assert.equal(
        (await s.app.inject({ method: 'GET', url: '/api/v1/workspace/status' }))
            .statusCode,
        200,
    );
    assert(!existsSync(root));
    release();
    assert.equal((await first).statusCode, 200);
});
for (const mode of ['BACKUP', 'RESTORE', 'MIGRATION'] as const)
    test(`INIT-conflict: active ${mode} rejects initialization without filesystem mutation`, async () => {
        const { root, s } = await setup({ missing: true });
        const release = s.runtime.maintenance.acquireMaintenance(mode);
        try {
            const r = await call(s);
            assert.equal(r.statusCode, 409);
            assert.equal(r.json().code, 'WORKSPACE_MAINTENANCE_ACTIVE');
            assert(!existsSync(root));
        } finally {
            release();
        }
    });
test('INIT-conflict: in-flight read and in-flight mutation prevent initialization', async () => {
    const { root, s } = await setup({ missing: true });
    const release = s.runtime.maintenance.acquireRead();
    assert.equal((await call(s)).statusCode, 409);
    release();
    let done!: () => void;
    const active = s.runtime.maintenance.mutate(
        () => new Promise<void>((r) => (done = r)),
    );
    assert.equal((await call(s)).statusCode, 409);
    done();
    await active;
    assert(!existsSync(root));
});

test('INIT-real junction ancestor for missing configured child is rejected', async () => {
    const parent = await mkdtemp(
        path.join(os.tmpdir(), 'RUN016 ancestor 日本語 '),
    );
    roots.push(parent);
    const target = path.join(parent, 'real');
    mkdirSync(target);
    const link = path.join(parent, 'alias');
    await symlink(
        target,
        link,
        process.platform === 'win32' ? 'junction' : 'dir',
    );
    const s = await createWorkspaceService({
        workspaceRoot: path.join(link, 'missing-child'),
        host: '127.0.0.1',
        port: 0,
    });
    services.push(s);
    const r = await call(s);
    assert.equal(r.statusCode, 422);
    assert.deepEqual(readdirSync(target), []);
});

test('INIT-foreign Data/DB appearing before publication is never overwritten', async () => {
    let root = '';
    const f = await setup({
        hooks: {
            atBoundary: (b) => {
                if (b === 'db_staged') {
                    mkdirSync(path.join(root, 'Data'));
                    writeFileSync(
                        path.join(root, 'Data/workspace.db'),
                        'foreign database bytes',
                    );
                }
            },
        },
    });
    root = f.root;
    const r = await call(f.s);
    assert.equal(r.statusCode, 409);
    assert.equal(
        readFileSync(path.join(root, 'Data/workspace.db'), 'utf8'),
        'foreign database bytes',
    );
    assert(!existsSync(path.join(root, 'workspace.json')));
});
test('INIT-in-place foreign manifest edit is preserved on failure', async () => {
    let root = '';
    const f = await setup({
        hooks: {
            atBoundary: (b) => {
                if (b === 'manifest_published') {
                    writeFileSync(
                        path.join(root, 'workspace.json'),
                        'foreign in-place edit',
                    );
                    throw new Error('injected');
                }
            },
        },
    });
    root = f.root;
    const r = await call(f.s);
    assert.equal(r.statusCode, 500);
    assert.equal(
        readFileSync(path.join(root, 'workspace.json'), 'utf8'),
        'foreign in-place edit',
    );
    assert.equal(f.s.status.state, 'INVALID_WORKSPACE');
});
test('INIT-created root replaced by real junction before artifacts fails closed', async () => {
    let root = '';
    let target = '';
    const f = await setup({
        missing: true,
        hooks: {
            atBoundary: async (b) => {
                if (b === 'root_created') {
                    require('node:fs').rmdirSync(root);
                    await symlink(
                        target,
                        root,
                        process.platform === 'win32' ? 'junction' : 'dir',
                    );
                }
            },
        },
    });
    root = f.root;
    target = path.join(path.dirname(root), 'target-after-root');
    mkdirSync(target);
    const r = await call(f.s);
    assert.equal(r.statusCode, 422);
    assert.deepEqual(readdirSync(target), []);
    assert(lstatSync(root).isSymbolicLink());
});
