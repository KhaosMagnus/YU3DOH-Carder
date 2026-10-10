import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, symlink, unlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { deflateSync } from 'node:zlib';
import Database from 'better-sqlite3';
import { createWorkspaceService, type WorkspaceService } from '../src/service';
import { bootstrapWorkspaceDatabase } from '../src/persistence/operations';
import { loadMigrations } from '../src/persistence/migrations';
import { AssetMutationError } from '../src/asset-mutation/errors';
import type { MutationHooks, MutationPhase } from '../src/asset-mutation/service';
import { inspectWorkspaceRoot } from '../src/workspace/inspect';
import { resolveAssetContent } from '../src/carder/asset-content';

const crcTable = (() => {
    const table = new Uint32Array(256);
    for (let index = 0; index < 256; index += 1) {
        let value = index;
        for (let bit = 0; bit < 8; bit += 1) value = (value & 1) ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
        table[index] = value >>> 0;
    }
    return table;
})();
const crc32 = (buffer: Buffer) => {
    let crc = 0xffffffff;
    for (const byte of buffer) crc = (crcTable[(crc ^ byte) & 0xff] ?? 0) ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
};
const pngChunk = (type: string, data: Buffer) => {
    const typeBuffer = Buffer.from(type, 'ascii');
    const output = Buffer.alloc(12 + data.length);
    output.writeUInt32BE(data.length, 0);
    typeBuffer.copy(output, 4);
    data.copy(output, 8);
    output.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 8 + data.length);
    return output;
};
const png = (alpha: number, rgb = [10, 20, 30]) => {
    const header = Buffer.alloc(13);
    header.writeUInt32BE(1, 0); header.writeUInt32BE(1, 4);
    header[8] = 8; header[9] = 6;
    const raw = Buffer.from([0, rgb[0] ?? 0, rgb[1] ?? 0, rgb[2] ?? 0, alpha]);
    return Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        pngChunk('IHDR', header), pngChunk('IDAT', deflateSync(raw)), pngChunk('IEND', Buffer.alloc(0)),
    ]);
};

const roots: string[] = [];
const services: WorkspaceService[] = [];
const manifest = { workspace_id: 'run011', workspace_format_version: 1, database_path: 'Data/workspace.db',
    created_at: '2026-10-10T00:00:00.000Z', name: 'RUN 011' };
const setup = async (hooks: MutationHooks = {}, schema4 = false) => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'yu3doh run011 日本語 ')); roots.push(root);
    await writeFile(path.join(root, 'workspace.json'), JSON.stringify(manifest));
    if (schema4) {
        await mkdir(path.join(root, 'Data'));
        const db = new Database(path.join(root, 'Data/workspace.db'));
        for (const migration of loadMigrations().filter(m => m.version <= 4)) {
            db.exec(migration.sql);
            db.prepare('INSERT INTO _workspace_migrations (version, name) VALUES (?, ?)').run(migration.version, migration.name);
            db.pragma(`user_version = ${migration.version}`);
        }
        db.close();
    } else bootstrapWorkspaceDatabase(root, manifest);
    const service = await createWorkspaceService({ workspaceRoot: root, host: '127.0.0.1', port: 4312 }, { mutationHooks: hooks });
    services.push(service);
    return { root, service };
};
const sourceFile = async (root: string, name = 'external.png', bytes = png(255)) => {
    const file = path.join(root, name); await writeFile(file, bytes); return file;
};
const managedSlot = async (hooks: MutationHooks = {}) => {
    const { root, service } = await setup(hooks);
    const card = service.canonical!.createCard({ family: 'SPELL', password: '11000001' });
    const source = await sourceFile(root);
    const { managedAsset: managed } = await service.managedAssets!.ingest({ cardId: card.cardId,
        variantKey: 'Default', role: 'BS', sourceFile: source, idempotencyKey: 'initial' });
    return { root, service, card, managed, source, mutations: service.assetMutations! };
};
const token = async (service: WorkspaceService) => (await service.assetMutations!.refresh()).expected_state_token;
const disposition = (service: WorkspaceService, id: string) => service.persistence!.runRepositoryOperation(db =>
    (db.prepare('SELECT disposition FROM asset_resolution_overrides WHERE asset_id = ?').get(id) as { disposition: string } | undefined)?.disposition);
const code = (expected: string) => (error: unknown) => error instanceof AssetMutationError && error.code === expected;
const indexedFile = async (root: string, name: string, bytes = png(255)) => {
    await mkdir(path.join(root, 'Assets'), { recursive: true });
    const file = path.join(root, 'Assets', name); await writeFile(file, bytes); return file;
};
const conflict = async () => {
    const { root, service } = await setup();
    const card = service.canonical!.createCard({ family: 'SPELL', password: '11000002' });
    const a = await indexedFile(root, '11000002-A-BS-Default.png');
    const b = await indexedFile(root, '11000002-B-BS-Default.png');
    await service.assetMutations!.refresh();
    const [variant] = service.assets!.listVariants(card.cardId); assert.ok(variant);
    const assets = service.assets!.listAssets();
    const winner = assets.find(asset => asset.relativePath.endsWith('A-BS-Default.png'))!;
    const loser = assets.find(asset => asset.relativePath.endsWith('B-BS-Default.png'))!;
    return { root, service, card, a, b, variant, winner, loser };
};
test.after(async () => { await Promise.all(services.map(s => s.close())); await Promise.all(roots.map(r => rm(r, { recursive: true, force: true }))); });

test('RUN011 real schema 4 migrates through recovery checkpoint, 005/history validation and runtime READY', async () => {
    const { root, service } = await setup({}, true);
    assert.equal(service.status.state, 'NEEDS_MIGRATION'); assert.equal(service.status.database_schema_version, 4);
    assert.equal(service.assetMutations, null);
    const result = await service.recovery.migrate();
    assert.ok('previousVersion' in result); assert.ok(result.backup_id);
    assert.equal(result.previousVersion, 4); assert.deepEqual(result.appliedVersions, [5]);
    assert.equal(service.status.state, 'READY'); assert.equal(service.status.database_schema_version, 5);
    assert.ok(service.assetMutations);
    assert.deepEqual(service.persistence!.runRepositoryOperation(db => db.prepare('SELECT version FROM _workspace_migrations ORDER BY version').all()), [1,2,3,4,5].map(version => ({ version })));
    const backup = JSON.parse(await readFile(path.join(root, 'Backups', result.backup_id, 'backup.json'), 'utf8'));
    assert.equal(backup.database_schema_version, 4);
    const db = new Database(path.join(root, 'Backups', result.backup_id, 'payload/Data/workspace.db'), { readonly: true });
    assert.equal(db.pragma('user_version', { simple: true }), 4); db.close();
});

test('RELINK-01 repairs missing managed slot preserving card/variant/role and managed identity', async () => {
    const { root, service, managed, mutations } = await managedSlot();
    await unlink(path.join(root, managed.managedRelativePath));
    const recovery = await sourceFile(root, 'new.png', png(255, [90,20,10]));
    const result = await mutations.mutate({ operation: 'RELINK', managed_asset_id: managed.managedAssetId,
        expected_state_token: await token(service), source_file: recovery });
    const bound = result.variants.find(v => v.variantId === managed.variantId)!.roles.BS!;
    assert.equal(bound.cardId, managed.cardId); assert.equal(bound.variantId, managed.variantId); assert.equal(bound.role, 'BS');
    assert.deepEqual(await readFile(path.join(root, managed.managedRelativePath)), await readFile(recovery));
    assert.equal(service.managedAssets!.listManagedAssets()[0]!.managedAssetId, managed.managedAssetId);
});

test('RELINK-02 rejects attempts to change any part of target identity', async () => {
    const { root, service, managed, mutations, source } = await managedSlot();
    await unlink(path.join(root, managed.managedRelativePath));
    for (const target of [{ card_id: 'other' }, { variant_id: 'other' }, { role: 'OF' as const }]) {
        await assert.rejects(mutations.mutate({ operation: 'RELINK', managed_asset_id: managed.managedAssetId,
            expected_state_token: await token(service), source_file: source, ...target }), code('ASSET_TARGET_IMMUTABLE'));
    }
    assert.equal(existsSync(path.join(root, managed.managedRelativePath)), false);
});

test('RELINK-03 indexed source for another legitimate slot preserves its file and association', async () => {
    const { root, service, managed, mutations } = await managedSlot();
    const other = service.canonical!.createCard({ family: 'SPELL', password: '11000003' });
    const file = await indexedFile(root, '11000003-Other-BS-Default.png');
    await unlink(path.join(root, managed.managedRelativePath)); await mutations.refresh();
    const source = service.assets!.listAssets().find(a => a.cardId === other.cardId)!;
    await mutations.mutate({ operation: 'RELINK', managed_asset_id: managed.managedAssetId,
        expected_state_token: mutations.getState().expected_state_token, asset_id: source.assetId });
    assert.equal(existsSync(file), true); assert.equal(disposition(service, source.assetId), undefined);
    assert.equal(service.assets!.listVariants(other.cardId)[0]!.roles.BS!.assetId, source.assetId);
});

test('RELINK-04 same-slot indexed source is preserved and IGNORE prevents duplicate after adoption and Rescan', async () => {
    const { root, service, managed, mutations } = await managedSlot();
    await unlink(path.join(root, managed.managedRelativePath));
    const file = await indexedFile(root, '11000001-Recovered-BS-Default.png');
    await mutations.refresh(); const source = service.assets!.listAssets().find(a => a.relativePath.endsWith('Recovered-BS-Default.png'))!;
    await mutations.mutate({ operation: 'RELINK', managed_asset_id: managed.managedAssetId,
        expected_state_token: mutations.getState().expected_state_token, asset_id: source.assetId });
    await service.assets!.scan();
    assert.equal(existsSync(file), true); assert.equal(disposition(service, source.assetId), 'IGNORE');
    assert.notEqual(service.assets!.listVariants()[0]!.roles.BS!.assetId, source.assetId);
    const latest = await mutations.refresh();
    assert.equal(latest.assets.find(a => a.assetId === source.assetId)!.variantId, null);
    assert.equal(service.libraryAssets!.getNeedsAttention().items.some(d => d.code === 'ROLE_CONFLICT'), false);
});

for (const regression of ['CONFLICT-01', 'CONFLICT-02', 'CONFLICT-03', 'CONFLICT-04', 'CONFLICT-05']) {
    test(`${regression}: explicit winner ASSIGN and losers UNASSIGN preserve resolution availability`, async () => {
        const { service, a, b, variant, winner, loser } = await conflict();
        const result = await service.assetMutations!.resolve({ operation: 'CHOOSE', asset_id: winner.assetId,
            variant_id: variant.variantId, role: 'BS', expected_state_token: await token(service) });
        assert.equal(disposition(service, winner.assetId), 'ASSIGN'); assert.equal(disposition(service, loser.assetId), 'UNASSIGN');
        assert.equal(existsSync(a), true); assert.equal(existsSync(b), true);
        assert.equal(result.variants[0]!.roles.BS!.assetId, winner.assetId);
        assert.equal(result.assets.find(a => a.assetId === loser.assetId)!.variantId, null);
        assert.equal(service.libraryAssets!.getNeedsAttention().items.some(d => d.asset_id === loser.assetId && d.code === 'UNRESOLVED_CARD'), true);
        await service.assets!.scan();
        assert.equal(service.libraryAssets!.getNeedsAttention().items.some(d => d.code === 'ROLE_CONFLICT'), false);
        assert.notEqual(disposition(service, loser.assetId), 'IGNORE');
        if (regression === 'CONFLICT-03') {
            const attached = await service.assetMutations!.resolve({ operation: 'ATTACH', asset_id: loser.assetId, role: 'BS',
                create_variant: { card_id: variant.cardId, variant_key: 'Later' }, expected_state_token: await token(service) });
            assert.equal(attached.variants.find(v => v.variantKey === 'later')!.roles.BS!.assetId, loser.assetId);
        }
    });
}

test('LEAVE changes neither overrides, scans nor physical files', async () => {
    const { service, a, b } = await conflict();
    const before = service.persistence!.runRepositoryOperation(db => db.prepare('SELECT count(*) n FROM asset_index_scans').get());
    const result = await service.assetMutations!.resolve({ operation: 'LEAVE', expected_state_token: service.assetMutations!.getState().expected_state_token });
    assert.equal(result.changed, false);
    assert.deepEqual(service.persistence!.runRepositoryOperation(db => db.prepare('SELECT count(*) n FROM asset_index_scans').get()), before);
    assert.equal(service.persistence!.runRepositoryOperation(db => db.prepare('SELECT count(*) n FROM asset_resolution_overrides').get() as { n: number }).n, 0);
    assert.ok(existsSync(a) && existsSync(b));
});

test('opaque stale tokens detect changed bytes before Rescan and reject HTTP mutation with 409', async () => {
    const { root, service, managed, source } = await managedSlot();
    const preview = await service.assetMutations!.preview(managed.managedAssetId, 'REPLACE');
    await writeFile(path.join(root, managed.managedRelativePath), png(255, [8,8,8]));
    const response = await service.app.inject({ method: 'POST', url: '/api/v1/library/managed-assets/mutate', payload: {
        operation: 'REPLACE', managed_asset_id: managed.managedAssetId, source_file: source, expected_state_token: preview.expected_state_token,
    } });
    assert.equal(response.statusCode, 409, response.body); assert.equal(response.json().code, 'ASSET_STATE_STALE');
});

test('resolver attaches invalid filename to explicit new variant without creating Canonical card; override survives restart', async () => {
    const { root, service } = await setup();
    const card = service.canonical!.createCard({ family: 'SPELL', password: '11000004' });
    const file = await indexedFile(root, 'no filename convention.png');
    await service.assetMutations!.refresh(); const asset = service.assets!.listAssets()[0]!;
    const response = await service.app.inject({ method: 'POST', url: '/api/v1/library/assets/resolve', payload: {
        operation: 'ATTACH', asset_id: asset.assetId, role: 'BS', create_variant: { card_id: card.cardId, variant_key: 'Explicit' },
        expected_state_token: service.assetMutations!.getState().expected_state_token,
    } });
    assert.equal(response.statusCode, 200, response.body); assert.equal(response.json().variants[0].roles.BS.assetId, asset.assetId);
    assert.equal(service.persistence!.runRepositoryOperation(db => (db.prepare('SELECT count(*) n FROM canonical_cards').get() as {n:number}).n), 1);
    await service.close();
    const reopened = await createWorkspaceService({ workspaceRoot: root, host: '127.0.0.1', port: 4312 }); services.push(reopened);
    await reopened.assets!.scan(); assert.equal(reopened.assets!.listVariants()[0]!.roles.BS!.assetId, asset.assetId); assert.ok(existsSync(file));
    const generic = await reopened.app.inject({ method: 'POST', url: '/api/v1/library/variants', payload: { card_id: card.cardId, variant_key: 'Empty' } });
    assert.equal(generic.statusCode, 404);
});

test('physical validity dominates ASSIGN: opaque OF is rejected and missing assigned file remains missing', async () => {
    const { service, root, variant, loser } = await conflict();
    await assert.rejects(service.assetMutations!.resolve({ operation: 'ATTACH', asset_id: loser.assetId, role: 'OF',
        create_variant: { card_id: variant.cardId, variant_key: 'Invalid' }, expected_state_token: await token(service) }), code('ASSET_SOURCE_INVALID'));
    const file = await indexedFile(root, 'opaque target.png', png(10)); await service.assetMutations!.refresh();
    const asset = service.assets!.listAssets().find(a => a.relativePath.endsWith('opaque target.png'))!;
    await service.assetMutations!.resolve({ operation: 'ATTACH', asset_id: asset.assetId, role: 'OF',
        create_variant: { card_id: variant.cardId, variant_key: 'Transparent' }, expected_state_token: await token(service) });
    await unlink(file); await service.assets!.scan();
    const target = service.assets!.listVariants().find(v => v.variantKey === 'transparent')!;
    assert.equal(target.roles.OF, null); assert.equal(service.libraryAssets!.getVariants(variant.cardId).variants.find(v => v.variant_key === 'transparent')!.roles.OF.slot_state, 'MISSING');
});

test('replace then remove preserve previous physical material and remove does not emit historical MISSING_SOURCE', async () => {
    const { root, service, managed, mutations } = await managedSlot();
    const old = await readFile(path.join(root, managed.managedRelativePath));
    const source = await sourceFile(root, 'replacement.png', png(255, [60,60,60]));
    const replaced = await mutations.mutate({ operation: 'REPLACE', managed_asset_id: managed.managedAssetId,
        expected_state_token: await token(service), source_file: source });
    assert.deepEqual(await readFile(path.join(root, replaced.recovery_relative_path, 'previous-source')), old);
    const current = service.assets!.listAssets().find(a => a.relativePath === managed.managedRelativePath)!;
    const removed = await mutations.mutate({ operation: 'REMOVE', managed_asset_id: managed.managedAssetId, expected_state_token: await token(service) });
    assert.deepEqual(await readFile(path.join(root, removed.recovery_relative_path, 'previous-source')), await readFile(source));
    assert.equal(existsSync(path.join(root, managed.managedRelativePath)), false);
    assert.equal(disposition(service, current.assetId), 'IGNORE');
    assert.equal(service.libraryAssets!.getNeedsAttention().items.some(item => item.asset_id === current.assetId), false);
    assert.equal(service.managedAssets!.listManagedAssets().length, 0);
});

for (const operation of ['REPLACE', 'RELINK', 'REMOVE'] as const) for (const boundary of ['stage', 'preserve', 'publication', 'database', 'reconciliation', 'postcondition'] as const) {
    test(`${operation} compensates failure at ${boundary} and proves previous filesystem/database state`, async () => {
        const { root, service, managed, mutations, source } = await managedSlot({ phase: phase => { if (phase === boundary) throw new Error('injected'); } });
        const destination = path.join(root, managed.managedRelativePath);
        const old = await readFile(destination);
        if (operation === 'RELINK') await unlink(destination);
        const before = await token(service);
        await assert.rejects(mutations.mutate({ operation, managed_asset_id: managed.managedAssetId, expected_state_token: before,
            ...(operation !== 'REMOVE' ? { source_file: source } : {}) }), code('ASSET_MUTATION_FAILED'));
        assert.equal(service.status.state, 'READY'); assert.equal(mutations.getState().expected_state_token, before);
        if (operation === 'RELINK') assert.equal(existsSync(destination), false); else assert.deepEqual(await readFile(destination), old);
        const ops = readdirSync(path.join(root, 'Temp/AssetMutation'));
        assert.equal(JSON.parse(readFileSync(path.join(root, 'Temp/AssetMutation', ops[0]!, 'operation.json'), 'utf8')).status, 'ROLLED_BACK');
        assert.equal((await inspectWorkspaceRoot(root)).state, 'READY');
    });
}

test('unprovable compensation reports ASSET_MUTATION_RECOVERY_REQUIRED and fences runtime and restart', async () => {
    const { root, service, managed, source } = await managedSlot({ phase: phase => { if (phase === 'publication' || phase === 'rollback') throw new Error('injected'); } });
    await assert.rejects(service.assetMutations!.mutate({ operation: 'REPLACE', managed_asset_id: managed.managedAssetId,
        source_file: source, expected_state_token: await token(service) }), code('ASSET_MUTATION_RECOVERY_REQUIRED'));
    assert.equal(service.status.state, 'RECOVERY_REQUIRED'); assert.equal(service.persistence, null);
    assert.equal((await inspectWorkspaceRoot(root)).state, 'RECOVERY_REQUIRED');
    assert.equal(existsSync(path.join(root, 'Temp/AssetMutation')), true);
});

test('real source junction/directory link rejects without following it or touching managed bytes', async () => {
    const { root, service, managed } = await managedSlot();
    const real = path.join(root, 'real 日本語'); await mkdir(real); await writeFile(path.join(real, 'image.png'), png(255));
    const linked = path.join(root, 'linked'); await symlink(real, linked, process.platform === 'win32' ? 'junction' : 'dir');
    await assert.rejects(service.assetMutations!.mutate({ operation: 'REPLACE', managed_asset_id: managed.managedAssetId,
        source_file: path.join(linked, 'image.png'), expected_state_token: await token(service) }), code('ASSET_SOURCE_UNSAFE'));
    assert.equal(existsSync(path.join(root, managed.managedRelativePath)), true);
});

test('maintenance lease covers async stage: backup, second mutation and reads are fenced until completion', async () => {
    let release!: () => void; let entered!: () => void;
    const barrier = new Promise<void>(resolve => { entered = resolve; });
    const pause = new Promise<void>(resolve => { release = resolve; });
    const { service, managed, source } = await managedSlot({ phase: async phase => { if (phase === 'stage') { entered(); await pause; } } });
    const expected = await token(service);
    const mutation = service.assetMutations!.mutate({ operation: 'REPLACE', managed_asset_id: managed.managedAssetId, source_file: source, expected_state_token: expected });
    await barrier;
    await assert.rejects(service.recovery.create('RECOVERY_POINT'), (error: unknown) => (error as {code:string}).code === 'WORKSPACE_MAINTENANCE_ACTIVE');
    assert.throws(() => service.assets!.listAssets(), (error: unknown) => (error as {code:string}).code === 'WORKSPACE_MAINTENANCE_ACTIVE');
    assert.throws(() => service.assetMutations!.refresh(), (error: unknown) => (error as {code:string}).code === 'WORKSPACE_MAINTENANCE_ACTIVE');
    release(); await mutation; assert.equal(service.status.state, 'READY');
});

test('Carder stale scope cannot read a replaced, removed or explicitly unassigned prepared source', async () => {
    const { root, service, managed, source } = await managedSlot();
    const asset = service.assets!.listVariants()[0]!.roles.BS!;
    const scope = { assetId: asset.assetId, hash: asset.contentHash!, cardId: managed.cardId, variantId: managed.variantId, role: 'BS' as const, composition: 'STANDARD' as const, revision: '1' };
    // Content resolver uses the verified grant scope; auth endpoint regressions remain in RUN009 suite.
    await writeFile(source, png(255, [60,70,80]));
    await service.assetMutations!.mutate({ operation: 'REPLACE', managed_asset_id: managed.managedAssetId, source_file: source, expected_state_token: await token(service) });
    await assert.rejects(resolveAssetContent(root, service.persistence!, asset.assetId, asset.contentHash!, scope), (error: unknown) => (error as {code:string}).code === 'ASSET_STALE');
    const refreshed = service.assets!.listVariants()[0]!.roles.BS!;
    await service.assetMutations!.mutate({ operation: 'REMOVE', managed_asset_id: managed.managedAssetId, expected_state_token: await token(service) });
    await assert.rejects(resolveAssetContent(root, service.persistence!, refreshed.assetId, refreshed.contentHash!, { ...scope, hash: refreshed.contentHash! }), (error: unknown) => (error as {code:string}).code === 'ASSET_STALE');
});

test('unmanaged missing/broken indexed RELINK establishes managed ownership at the same existing slot', async () => {
    for (const missing of [true, false]) {
        const { root, service } = await setup();
        const card = service.canonical!.createCard({ family: 'SPELL', password: '11000005' });
        const oldFile = await indexedFile(root, '11000005-Broken-BS-Default.png');
        await service.assets!.scan(); const target = service.assets!.listAssets()[0]!;
        if (missing) await unlink(oldFile); else await writeFile(oldFile, 'broken bytes retained');
        const replacement = await sourceFile(root);
        const result = await service.assetMutations!.mutate({ operation: 'RELINK', target_asset_id: target.assetId,
            source_file: replacement, expected_state_token: await token(service) });
        const variant = result.variants.find(v => v.variantId === target.variantId)!;
        assert.equal(variant.cardId, card.cardId); assert.equal(variant.roles.BS!.role, 'BS');
        assert.equal(disposition(service, target.assetId), 'IGNORE');
        assert.equal(service.managedAssets!.listManagedAssets()[0]!.variantId, target.variantId);
        if (missing) assert.equal(existsSync(oldFile), false); else assert.equal(await readFile(oldFile, 'utf8'), 'broken bytes retained');
    }
});

test('MOVE reassigns explicit unmanaged source, keeps physical bytes and revokes previous binding', async () => {
    const { root, service } = await setup();
    const card = service.canonical!.createCard({ family: 'SPELL', password: '11000006' });
    const file = await indexedFile(root, '11000006-Art-BS-Default.png'); await service.assets!.scan();
    const asset = service.assets!.listAssets()[0]!;
    await service.assetMutations!.resolve({ operation: 'MOVE', asset_id: asset.assetId, role: 'BS',
        create_variant: { card_id: card.cardId, variant_key: 'Moved' }, expected_state_token: await token(service) });
    await service.assets!.scan();
    assert.equal(service.assets!.listVariants().find(v => v.variantKey === 'default')!.roles.BS, null);
    assert.equal(service.assets!.listVariants().find(v => v.variantKey === 'moved')!.roles.BS!.assetId, asset.assetId);
    assert.ok(existsSync(file));
});

test('HTTP contract exposes current conflict candidates and requires opaque tokens on resolution/mutation', async () => {
    const { service, variant, winner, loser } = await conflict();
    const details = await service.app.inject({ method: 'GET', url: `/api/v1/library/cards/${variant.cardId}/variants` });
    assert.equal(details.statusCode, 200, details.body);
    const role = details.json().variants[0].roles.BS;
    assert.equal(role.slot_state, 'CONFLICT'); assert.equal(role.candidates.length, 2);
    assert.equal(typeof role.expected_state_token, 'string');
    for (const url of ['/api/v1/library/assets/resolve', '/api/v1/library/managed-assets/mutate']) {
        const response = await service.app.inject({ method: 'POST', url, payload: { operation: url.endsWith('resolve') ? 'CHOOSE' : 'REMOVE' } });
        assert.equal(response.statusCode, 400);
    }
    const result = await service.app.inject({ method: 'POST', url: '/api/v1/library/assets/resolve', payload: {
        operation: 'CHOOSE', asset_id: winner.assetId, variant_id: variant.variantId, role: 'BS', expected_state_token: role.expected_state_token,
    } });
    assert.equal(result.statusCode, 200, result.body); assert.equal(disposition(service, loser.assetId), 'UNASSIGN');
    const stale = await service.app.inject({ method: 'POST', url: '/api/v1/library/assets/resolve', payload: {
        operation: 'UNASSIGN', asset_id: winner.assetId, expected_state_token: role.expected_state_token,
    } });
    assert.equal(stale.statusCode, 409, stale.body); assert.equal(stale.json().code, 'ASSET_STATE_STALE');
});

test('resolution reconciliation failure compensates overrides and explicit variant creation', async () => {
    const { root, service } = await setup({ phase: phase => { if (phase === 'reconciliation') throw new Error('injected'); } });
    const card = service.canonical!.createCard({ family: 'SPELL', password: '11000007' });
    const file = await indexedFile(root, 'unresolved.png'); await service.assetMutations!.refresh();
    const asset = service.assets!.listAssets()[0]!; const before = service.assetMutations!.getState().expected_state_token;
    await assert.rejects(service.assetMutations!.resolve({ operation: 'ATTACH', asset_id: asset.assetId, role: 'BS',
        create_variant: { card_id: card.cardId, variant_key: 'RolledBack' }, expected_state_token: before }), code('ASSET_MUTATION_FAILED'));
    assert.equal(service.assetMutations!.getState().expected_state_token, before);
    assert.equal(service.assets!.listVariants().length, 0); assert.equal(disposition(service, asset.assetId), undefined); assert.ok(existsSync(file));
});

test('conflict loser prepared grant fails after UNASSIGN even with unchanged source hash', async () => {
    const { service, root, variant, winner, loser } = await conflict();
    const scope = { assetId: loser.assetId, hash: loser.contentHash!, cardId: variant.cardId, variantId: variant.variantId,
        composition: 'STANDARD' as const, role: 'BS' as const, revision: '1' };
    const grant = service.carderAssetGrants.issue(scope);
    await service.assetMutations!.resolve({ operation: 'CHOOSE', asset_id: winner.assetId, variant_id: variant.variantId,
        role: 'BS', expected_state_token: await token(service) });
    assert.ok(existsSync(path.join(root, loser.relativePath)));
    const response = await service.app.inject({ method: 'GET', url: `/api/v1/carder/assets/${loser.assetId}/content?hash=${loser.contentHash}&grant=${encodeURIComponent(grant)}` });
    assert.equal(response.statusCode, 409, response.body); assert.equal(response.json().code, 'ASSET_STALE');
});

test('replace/remove HTTP previews identify affected slot and success preserves operation recovery path', async () => {
    const { root, service, managed, source } = await managedSlot();
    for (const operation of ['REPLACE', 'REMOVE'] as const) {
        const preview = await service.app.inject({ method: 'POST', url: `/api/v1/library/managed-assets/${managed.managedAssetId}/preview`, payload: { operation } });
        assert.equal(preview.statusCode, 200, preview.body);
        assert.deepEqual(preview.json().affected_slot, { card_id: managed.cardId, variant_id: managed.variantId, role: managed.role });
        const result = await service.app.inject({ method: 'POST', url: '/api/v1/library/managed-assets/mutate', payload: {
            operation, managed_asset_id: managed.managedAssetId, expected_state_token: preview.json().expected_state_token,
            ...(operation === 'REPLACE' ? { source_file: source } : {}),
        } });
        assert.equal(result.statusCode, 200, result.body); assert.equal(result.json().operation, operation);
        assert.ok(existsSync(path.join(root, result.json().recovery_relative_path, 'operation.json')));
    }
});

test('relink rejects valid slot and managed mutations reject indexed/unmanaged removal', async () => {
    const { service, managed, source } = await managedSlot();
    await assert.rejects(service.assetMutations!.mutate({ operation: 'RELINK', managed_asset_id: managed.managedAssetId,
        source_file: source, expected_state_token: await token(service) }), code('ASSET_RELINK_NOT_BROKEN'));
    const asset = service.assets!.listAssets()[0]!;
    await assert.rejects(service.assetMutations!.mutate({ operation: 'REMOVE', target_asset_id: asset.assetId,
        expected_state_token: await token(service) }), code('ASSET_MANAGED_REQUIRED'));
});

test('managed conflict loser remains available for explicit MOVE and old slot does not imply a binding', async () => {
    const { root, service, managed } = await managedSlot();
    await indexedFile(root, '11000001-Winner-BS-Default.png'); await service.assetMutations!.refresh();
    const winner = service.assets!.listAssets().find(a => a.relativePath.endsWith('Winner-BS-Default.png'))!;
    const loser = service.assets!.listAssets().find(a => a.relativePath === managed.managedRelativePath)!;
    await service.assetMutations!.resolve({ operation: 'CHOOSE', asset_id: winner.assetId, variant_id: managed.variantId,
        role: 'BS', expected_state_token: await token(service) });
    assert.equal(disposition(service, loser.assetId), 'UNASSIGN');
    const moved = await service.assetMutations!.resolve({ operation: 'MOVE', asset_id: loser.assetId, role: 'BS',
        create_variant: { card_id: managed.cardId, variant_key: 'Rescued' }, expected_state_token: await token(service) });
    assert.equal(moved.variants.find(v => v.variantKey === 'rescued')!.roles.BS!.assetId, loser.assetId);
    assert.ok(existsSync(path.join(root, loser.relativePath)));
    await service.assetMutations!.resolve({ operation: 'UNASSIGN', asset_id: winner.assetId, expected_state_token: await token(service) });
    const original = service.libraryAssets!.getVariants(managed.cardId).variants.find(v => v.variant_id === managed.variantId)!;
    assert.equal(original.roles.BS.slot_state, 'EMPTY'); assert.equal(original.roles.BS.asset, null);
});

test('CHOOSE handles every current loser in an A/B/C conflict and prevents all filename fallback', async () => {
    const { root, service, variant, winner, loser } = await conflict();
    const thirdFile = await indexedFile(root, '11000002-C-BS-Default.png');
    await service.assetMutations!.refresh(); const third = service.assets!.listAssets().find(a => a.relativePath.endsWith('C-BS-Default.png'))!;
    await service.assetMutations!.resolve({ operation: 'CHOOSE', asset_id: winner.assetId, variant_id: variant.variantId,
        role: 'BS', expected_state_token: await token(service) });
    assert.equal(disposition(service, loser.assetId), 'UNASSIGN'); assert.equal(disposition(service, third.assetId), 'UNASSIGN');
    await service.assets!.scan(); assert.ok(existsSync(thirdFile));
    assert.equal(service.assets!.listVariants()[0]!.roles.BS!.assetId, winner.assetId);
    assert.equal(service.libraryAssets!.getNeedsAttention().items.some(d => d.code === 'ROLE_CONFLICT'), false);
});
