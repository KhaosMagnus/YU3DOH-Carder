import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { buildWorkspaceApp } from '../src/app';
import {
    DEFAULT_WORKSPACE_HOST,
    DEFAULT_WORKSPACE_PORT,
    loadWorkspaceConfig,
    type WorkspaceServiceConfig,
} from '../src/config';
import { createWorkspaceService } from '../src/service';
import { inspectWorkspaceRoot } from '../src/workspace/inspect';
import { isWorkspaceRelativePath, parseWorkspaceManifest } from '../src/workspace/manifest';
import {
    SUPPORTED_WORKSPACE_FORMAT_VERSION,
    WORKSPACE_LIFECYCLE_STATES,
    type WorkspaceStatus,
} from '../src/workspace/types';

const tempRoots: string[] = [];

const createTempRoot = async (label = 'workspace path 日本語') => {
    const root = await mkdtemp(path.join(os.tmpdir(), `yu3doh ${label} `));
    tempRoots.push(root);
    return root;
};

const manifest = (overrides: Record<string, unknown> = {}) => ({
    workspace_id: 'workspace-001',
    workspace_format_version: SUPPORTED_WORKSPACE_FORMAT_VERSION,
    database_path: 'Data/workspace.db',
    created_at: '2026-10-04T00:00:00.000Z',
    name: 'YU3DOH Test Workspace',
    ...overrides,
});

const configFor = (workspaceRoot: string): WorkspaceServiceConfig => ({
    workspaceRoot,
    host: DEFAULT_WORKSPACE_HOST,
    port: DEFAULT_WORKSPACE_PORT,
});

test.after(async () => {
    await Promise.all(tempRoots.map(root => rm(root, { recursive: true, force: true })));
});

test('configuration defaults to loopback and supports root/host/port overrides', () => {
    const root = path.join(os.tmpdir(), 'Workspace path 日本語');
    const defaulted = loadWorkspaceConfig({
        env: { YU3DOH_WORKSPACE_ROOT: root },
    });
    assert.equal(defaulted.workspaceRoot, path.resolve(root));
    assert.equal(defaulted.host, '127.0.0.1');
    assert.equal(defaulted.port, 4312);

    const overridden = loadWorkspaceConfig({
        env: {
            YU3DOH_WORKSPACE_ROOT: root,
            YU3DOH_WORKSPACE_HOST: '127.0.0.2',
            YU3DOH_WORKSPACE_PORT: '5312',
        },
    });
    assert.equal(overridden.host, '127.0.0.2');
    assert.equal(overridden.port, 5312);
});

test('application constructs without opening a listener and closes cleanly', async () => {
    const status: WorkspaceStatus = {
        workspace_id: null,
        name: null,
        workspace_format_version: null,
        state: 'NEEDS_INITIALIZATION',
        read_only: true,
        health_summary: 'test',
    };
    const app = buildWorkspaceApp(status);
    assert.equal(app.server.listening, false);
    await app.close();
});

test('status route returns the schema-controlled Workspace status contract', async () => {
    const root = await createTempRoot('empty status');
    const service = await createWorkspaceService(configFor(root));
    const response = await service.app.inject({ method: 'GET', url: '/api/v1/workspace/status' });
    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), {
        workspace_id: null,
        name: null,
        workspace_format_version: null,
        state: 'NEEDS_INITIALIZATION',
        read_only: true,
        health_summary: 'Configured Workspace root is empty and has not been initialized.',
    });
    await service.close();
});

test('valid manifest parsing preserves identity fields and optional name', () => {
    const parsed = parseWorkspaceManifest(JSON.stringify(manifest()));
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    assert.deepEqual(parsed.manifest, manifest());
});

test('invalid JSON, missing identity, and unsafe database paths are rejected', () => {
    assert.equal(parseWorkspaceManifest('{').ok, false);
    assert.equal(parseWorkspaceManifest(JSON.stringify(manifest({ workspace_id: undefined }))).ok, false);

    for (const databasePath of [
        '/var/lib/yu3doh/workspace.db',
        'C:\\Users\\tester\\workspace.db',
        'C:workspace.db',
        '../workspace.db',
        'Data/../../workspace.db',
    ]) {
        const parsed = parseWorkspaceManifest(JSON.stringify(manifest({ database_path: databasePath })));
        assert.equal(parsed.ok, false, databasePath);
        assert.equal(isWorkspaceRelativePath(databasePath), false, databasePath);
    }
});

test('missing and empty Workspace roots are deterministic and non-destructive', async () => {
    const parent = await createTempRoot('missing parent');
    const missing = path.join(parent, 'does not exist 日本語');
    const missingStatus = await inspectWorkspaceRoot(missing);
    assert.equal(missingStatus.state, 'NEEDS_INITIALIZATION');

    const empty = await createTempRoot('empty root');
    const emptyStatus = await inspectWorkspaceRoot(empty);
    assert.equal(emptyStatus.state, 'NEEDS_INITIALIZATION');
    assert.deepEqual(await readdir(empty), []);
});

test('unknown non-empty root is INVALID_WORKSPACE without changing its contents', async () => {
    const root = await createTempRoot('unknown root');
    const marker = path.join(root, 'keep-me.txt');
    await writeFile(marker, 'unchanged', 'utf8');
    const before = await readdir(root);

    const status = await inspectWorkspaceRoot(root);

    assert.equal(status.state, 'INVALID_WORKSPACE');
    assert.deepEqual(await readdir(root), before);
    assert.equal(await readFile(marker, 'utf8'), 'unchanged');
});

test('spaces and Unicode paths inspect a valid manifest without claiming persistence health', async () => {
    const parent = await createTempRoot('unicode parent');
    const root = path.join(parent, 'Workspace With Spaces 日本語');
    await mkdir(root);
    await writeFile(path.join(root, 'workspace.json'), JSON.stringify(manifest()), 'utf8');

    const status = await inspectWorkspaceRoot(root);

    assert.equal(status.state, 'PERSISTENCE_UNVERIFIED');
    assert.equal(status.workspace_id, 'workspace-001');
    assert.equal(status.workspace_format_version, SUPPORTED_WORKSPACE_FORMAT_VERSION);
    assert.equal(status.name, 'YU3DOH Test Workspace');
    assert.equal(status.read_only, true);
});

test('required lifecycle states remain explicit even when persistence-dependent states are not yet reachable', () => {
    for (const requiredState of [
        'READY',
        'NEEDS_INITIALIZATION',
        'NEEDS_MIGRATION',
        'RECOVERY_REQUIRED',
        'UNSUPPORTED_NEWER_SCHEMA',
        'INVALID_WORKSPACE',
    ] as const) {
        assert.equal(WORKSPACE_LIFECYCLE_STATES.includes(requiredState), true, requiredState);
    }
});

test('invalid manifests are controlled non-READY results through the inspection boundary', async () => {
    const cases: Array<{ name: string; contents: string }> = [
        { name: 'invalid json', contents: '{' },
        { name: 'missing identity', contents: JSON.stringify(manifest({ workspace_id: undefined })) },
        { name: 'absolute posix path', contents: JSON.stringify(manifest({ database_path: '/var/lib/yu3doh/workspace.db' })) },
        { name: 'absolute windows path', contents: JSON.stringify(manifest({ database_path: 'C:\\Users\\tester\\workspace.db' })) },
    ];

    for (const entry of cases) {
        const root = await createTempRoot(entry.name);
        await writeFile(path.join(root, 'workspace.json'), entry.contents, 'utf8');
        const status = await inspectWorkspaceRoot(root);
        assert.equal(status.state, 'INVALID_WORKSPACE', entry.name);
        assert.notEqual(status.state, 'READY', entry.name);
    }
});

test('newer manifest format is not overwritten or downgraded', async () => {
    const newerRoot = await createTempRoot('newer format');
    await writeFile(
        path.join(newerRoot, 'workspace.json'),
        JSON.stringify(manifest({ workspace_format_version: SUPPORTED_WORKSPACE_FORMAT_VERSION + 1 })),
        'utf8',
    );
    const newerStatus = await inspectWorkspaceRoot(newerRoot);
    assert.equal(newerStatus.state, 'UNSUPPORTED_NEWER_SCHEMA');
    assert.equal(newerStatus.workspace_format_version, SUPPORTED_WORKSPACE_FORMAT_VERSION + 1);
});

test('running service closes its listener gracefully', async () => {
    const root = await createTempRoot('graceful close');
    const service = await createWorkspaceService(configFor(root));
    await service.app.listen({ host: '127.0.0.1', port: 0 });
    assert.equal(service.app.server.listening, true);
    await service.close();
    assert.equal(service.app.server.listening, false);
});
