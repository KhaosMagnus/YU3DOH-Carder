import assert from 'node:assert/strict';
import { existsSync, lstatSync, readFileSync, readdirSync } from 'node:fs';
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
    assert.equal(result.previousVersion, 4); assert.deepEqual(result.appliedVersions, [5, 6]);
    assert.equal(service.status.state, 'READY'); assert.equal(service.status.database_schema_version, 6);
    assert.ok(service.assetMutations);
    assert.deepEqual(service.persistence!.runRepositoryOperation(db => db.prepare('SELECT version FROM _workspace_migrations ORDER BY version').all()), [1,2,3,4,5, 6].map(version => ({ version })));
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
    const preview = await service.assetMutations!.preview(managed.managedAssetId, 'REPLACE', { source_file: source });
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
        const preview = await service.app.inject({ method: 'POST', url: `/api/v1/library/managed-assets/${managed.managedAssetId}/preview`, payload: {
            operation, ...(operation === 'REPLACE' ? { source_file: source } : {}),
        } });
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

// QA-011-01: preview is a read-only persisted-state simulation.
const assetDomainSnapshot = (service: WorkspaceService) => service.persistence!.runRepositoryOperation(db =>
    Object.fromEntries(['art_variants', 'asset_index_scans', 'indexed_asset_files', 'managed_assets',
        'managed_asset_ingest_requests', 'asset_resolution_overrides', 'variant_role_bindings', 'asset_index_diagnostics']
        .map(table => [table, db.prepare(`SELECT * FROM ${table}`).all()])));
const scanCount = (service: WorkspaceService) => service.persistence!.runRepositoryOperation(db =>
    (db.prepare('SELECT count(*) n FROM asset_index_scans').get() as { n: number }).n);
const previewFiles = (root: string) => {
    const files: Record<string, unknown> = {};
    const visit = (relative: string) => {
        const absolute = path.join(root, relative);
        if (!existsSync(absolute)) return;
        const info = lstatSync(absolute);
        files[relative] = info.isDirectory() ? 'directory' : { bytes: readFileSync(absolute).toString('hex'), mtime: info.mtimeMs };
        if (info.isDirectory()) for (const child of readdirSync(absolute).sort()) visit(path.join(relative, child));
    };
    visit('Assets'); visit('Temp');
    return files;
};
const roleSlots = async (roles: Array<'BS' | 'BG' | 'OF'>) => {
    const { root, service } = await setup();
    const card = service.canonical!.createCard({ family: 'SPELL', password: '11000010' });
    const slots: Partial<Record<'BS' | 'BG' | 'OF', { id: string; source: string }>> = {};
    for (const role of roles) {
        const source = await sourceFile(root, `${role}.png`, png(role === 'OF' ? 10 : 255));
        const { managedAsset } = await service.managedAssets!.ingest({ cardId: card.cardId, variantKey: 'Default',
            role, sourceFile: source, idempotencyKey: `slot-${role}` });
        slots[role] = { id: managedAsset.managedAssetId, source };
    }
    return { root, service, slots };
};
const ready = (sources: Array<'BS' | 'BG' | 'OF'>) => ({ state: 'READY', sources });
const incomplete = () => ({ state: 'INCOMPLETE', sources: [] });

test('PREVIEW-01: REMOVE preview does not increase asset_index_scans', async () => {
    const { service, managed } = await managedSlot(); const before = scanCount(service);
    await service.assetMutations!.preview(managed.managedAssetId, 'REMOVE');
    assert.equal(scanCount(service), before);
});

test('PREVIEW-02: REPLACE preview does not increase asset_index_scans', async () => {
    const { service, managed, source } = await managedSlot(); const before = scanCount(service);
    await service.assetMutations!.preview(managed.managedAssetId, 'REPLACE', { source_file: source });
    assert.equal(scanCount(service), before);
});

test('PREVIEW-03: every relevant Asset-domain table stays byte-equivalent across previews', async () => {
    const { service, managed, source } = await managedSlot(); const before = assetDomainSnapshot(service);
    await service.assetMutations!.preview(managed.managedAssetId, 'REMOVE');
    assert.deepEqual(assetDomainSnapshot(service), before);
    await service.assetMutations!.preview(managed.managedAssetId, 'REPLACE', { source_file: source });
    assert.deepEqual(assetDomainSnapshot(service), before);
    await assert.rejects(service.assetMutations!.preview(managed.managedAssetId, 'REPLACE'), code('ASSET_SOURCE_INVALID'));
    assert.deepEqual(assetDomainSnapshot(service), before);
});

test('PREVIEW-04: no Workspace asset create/rename/delete/content change or recovery material from previews', async () => {
    const { root, service, managed, source } = await managedSlot(); const before = previewFiles(root);
    const sourceBefore = await readFile(source);
    await service.assetMutations!.preview(managed.managedAssetId, 'REMOVE');
    await service.assetMutations!.preview(managed.managedAssetId, 'REPLACE', { source_file: source });
    assert.deepEqual(previewFiles(root), before); assert.deepEqual(await readFile(source), sourceBefore);
    assert.equal(existsSync(path.join(root, 'Temp/AssetMutation')), false);
});

for (const [regression, role] of [['PREVIEW-05', 'BS'], ['PREVIEW-06', 'BG'], ['PREVIEW-07', 'OF']] as const) {
    test(`${regression}: REPLACE validates a proposed valid ${role} source and simulates the same slot`, async () => {
        const { service, root, slots } = await roleSlots([role]);
        const source = await sourceFile(root, 'proposed.png', png(role === 'OF' ? 20 : 255, [40,50,60]));
        const before = assetDomainSnapshot(service);
        const result = await service.app.inject({ method: 'POST', url: `/api/v1/library/managed-assets/${slots[role]!.id}/preview`,
            payload: { operation: 'REPLACE', source_file: source } });
        assert.equal(result.statusCode, 200, result.body);
        assert.equal(result.json().affected_slot.role, role); assert.equal(typeof result.json().expected_state_token, 'string');
        assert.deepEqual(result.json().readiness_before, role === 'BS'
            ? { standard: ready(['BS']), overframe: incomplete() } : { standard: incomplete(), overframe: incomplete() });
        assert.deepEqual(result.json().readiness_after, result.json().readiness_before);
        assert.deepEqual(assetDomainSnapshot(service), before);
    });
}

test('PREVIEW-08: REPLACE rejects opaque OF without writes or publication', async () => {
    const { root, service, slots } = await roleSlots(['OF']);
    const opaque = await sourceFile(root, 'opaque.png', png(255));
    const before = assetDomainSnapshot(service); const files = previewFiles(root);
    const result = await service.app.inject({ method: 'POST', url: `/api/v1/library/managed-assets/${slots.OF!.id}/preview`,
        payload: { operation: 'REPLACE', source_file: opaque } });
    assert.equal(result.statusCode, 422); assert.equal(result.json().code, 'ASSET_SOURCE_INVALID');
    assert.deepEqual(assetDomainSnapshot(service), before); assert.deepEqual(previewFiles(root), files);
});

test('PREVIEW-09: REPLACE rejects unsafe paths and real symlink/junction sources', async () => {
    const { root, service, managed } = await managedSlot();
    const real = path.join(root, 'real-preview 日本語'); await mkdir(real); await writeFile(path.join(real, 'valid.png'), png(255));
    const linked = path.join(root, 'preview-link'); await symlink(real, linked, process.platform === 'win32' ? 'junction' : 'dir');
    const before = assetDomainSnapshot(service);
    for (const source of ['relative.png', path.join(linked, 'valid.png')]) {
        await assert.rejects(service.assetMutations!.preview(managed.managedAssetId, 'REPLACE', { source_file: source }), code('ASSET_SOURCE_UNSAFE'));
    }
    assert.deepEqual(assetDomainSnapshot(service), before); assert.ok(existsSync(path.join(root, managed.managedRelativePath)));
    assert.equal(existsSync(path.join(root, 'Temp/AssetMutation')), false);
});

test('PREVIEW-10: REMOVE simulates Standard source fallback and incompleteness on persisted bindings', async () => {
    const { service, slots } = await roleSlots(['BS', 'BG', 'OF']);
    const result = await service.assetMutations!.preview(slots.BS!.id, 'REMOVE');
    assert.deepEqual(result.readiness_before.standard, ready(['BS']));
    assert.deepEqual(result.readiness_after.standard, ready(['BG', 'OF']));
    const single = await managedSlot();
    assert.deepEqual((await single.mutations.preview(single.managed.managedAssetId, 'REMOVE')).readiness_after.standard, incomplete());
});

test('PREVIEW-11: REMOVE simulates Overframe sources and required OF without altering bindings', async () => {
    const { service, slots } = await roleSlots(['BS', 'OF']);
    const before = assetDomainSnapshot(service);
    const removeBS = await service.assetMutations!.preview(slots.BS!.id, 'REMOVE');
    assert.deepEqual(removeBS.readiness_before.overframe, ready(['BS', 'OF']));
    assert.deepEqual(removeBS.readiness_after.overframe, incomplete());
    const removeOF = await service.assetMutations!.preview(slots.OF!.id, 'REMOVE');
    assert.deepEqual(removeOF.readiness_after.overframe, incomplete());
    assert.deepEqual(removeOF.readiness_after.standard, ready(['BS']));
    assert.deepEqual(assetDomainSnapshot(service), before);
});

test('PREVIEW-12: BS+BG+OF removal simulations preserve frozen composition precedence', async () => {
    const { service, slots } = await roleSlots(['BS', 'BG', 'OF']);
    const expected = {
        BS: { standard: ready(['BG', 'OF']), overframe: ready(['BG', 'OF']) },
        BG: { standard: ready(['BS']), overframe: ready(['BS', 'OF']) },
        OF: { standard: ready(['BS']), overframe: incomplete() },
    };
    const before = assetDomainSnapshot(service);
    for (const role of ['BS', 'BG', 'OF'] as const) {
        const result = await service.assetMutations!.preview(slots[role]!.id, 'REMOVE');
        assert.deepEqual(result.readiness_before, { standard: ready(['BS']), overframe: ready(['BG', 'OF']) });
        assert.deepEqual(result.readiness_after, expected[role]);
    }
    assert.deepEqual(assetDomainSnapshot(service), before);
});

test('PREVIEW-13: repeated unchanged REMOVE and REPLACE previews leave opaque token stable', async () => {
    const { service, managed, source } = await managedSlot();
    const before = service.assetMutations!.getState().expected_state_token;
    for (let iteration = 0; iteration < 2; iteration++) {
        assert.equal((await service.assetMutations!.preview(managed.managedAssetId, 'REMOVE')).expected_state_token, before);
        assert.equal((await service.assetMutations!.preview(managed.managedAssetId, 'REPLACE', { source_file: source })).expected_state_token, before);
    }
    assert.equal(service.assetMutations!.getState().expected_state_token, before);
});

test('PREVIEW-14: execution still reconciles and rejects stale physical target/indexed source and revalidates external source', async () => {
    for (const changed of ['target', 'indexed-source', 'external-source'] as const) {
        const { root, service, managed, source } = await managedSlot();
        const indexedPath = await indexedFile(root, '11000001-Proposed-BS-Other.png', png(255, [90,80,70]));
        await service.assets!.scan();
        const indexed = service.assets!.listAssets().find(a => a.relativePath.endsWith('Proposed-BS-Other.png'))!;
        const selection = changed === 'indexed-source' ? { asset_id: indexed.assetId } : { source_file: source };
        const preview = await service.assetMutations!.preview(managed.managedAssetId, 'REPLACE', selection);
        const scans = scanCount(service); const targetBefore = await readFile(path.join(root, managed.managedRelativePath));
        if (changed === 'target') await writeFile(path.join(root, managed.managedRelativePath), png(255, [1,90,2]));
        else if (changed === 'indexed-source') await writeFile(indexedPath, png(255, [6,5,4]));
        else await writeFile(source, 'invalid source after preview');
        const response = await service.app.inject({ method: 'POST', url: '/api/v1/library/managed-assets/mutate', payload: {
            operation: 'REPLACE', managed_asset_id: managed.managedAssetId, expected_state_token: preview.expected_state_token, ...selection,
        } });
        assert.equal(response.statusCode, changed === 'external-source' ? 422 : 409, response.body);
        assert.equal(response.json().code, changed === 'external-source' ? 'ASSET_SOURCE_INVALID' : 'ASSET_STATE_STALE');
        assert.equal(scanCount(service), scans + 1);
        if (changed !== 'target') assert.deepEqual(await readFile(path.join(root, managed.managedRelativePath)), targetBefore);
        assert.equal(existsSync(path.join(root, 'Temp/AssetMutation')), false);
    }
});

test('preview runtime classification permits BACKUP read lease and preserves mutation/restore fencing', async () => {
    const { service, managed, source } = await managedSlot();
    const release = service.runtime.maintenance.acquireMaintenance('BACKUP');
    try {
        const before = assetDomainSnapshot(service);
        assert.equal((await service.assetMutations!.preview(managed.managedAssetId, 'REMOVE')).operation, 'REMOVE');
        assert.equal((await service.assetMutations!.preview(managed.managedAssetId, 'REPLACE', { source_file: source })).operation, 'REPLACE');
        assert.deepEqual(assetDomainSnapshot(service), before);
        for (const operation of [() => service.assetMutations!.refresh(),
            () => service.assetMutations!.resolve({ operation: 'LEAVE', expected_state_token: 'unused' }),
            () => service.assetMutations!.mutate({ operation: 'REMOVE', managed_asset_id: managed.managedAssetId, expected_state_token: 'unused' })]) {
            assert.throws(operation, (error: unknown) => (error as { code: string }).code === 'WORKSPACE_MAINTENANCE_ACTIVE');
        }
    } finally { release(); }
    const endRestore = service.runtime.maintenance.acquireMaintenance('RESTORE');
    try {
        assert.throws(() => service.assetMutations!.preview(managed.managedAssetId, 'REMOVE'),
            (error: unknown) => (error as { code: string }).code === 'WORKSPACE_MAINTENANCE_ACTIVE');
    } finally { endRestore(); }
});

test('REPLACE preview supports current indexed source and rejects missing/stale source or invalid selector combinations', async () => {
    const { root, service, managed, source } = await managedSlot();
    const file = await indexedFile(root, '11000001-Preview-BS-Other.png'); await service.assets!.scan();
    const indexed = service.assets!.listAssets().find(a => a.relativePath.endsWith('Preview-BS-Other.png'))!;
    const before = assetDomainSnapshot(service);
    const response = await service.app.inject({ method: 'POST', url: `/api/v1/library/managed-assets/${managed.managedAssetId}/preview`,
        payload: { operation: 'REPLACE', asset_id: indexed.assetId } });
    assert.equal(response.statusCode, 200, response.body); assert.deepEqual(assetDomainSnapshot(service), before);
    await assert.rejects(service.assetMutations!.preview(managed.managedAssetId, 'REPLACE', { source_file: source, asset_id: indexed.assetId }), code('ASSET_SOURCE_INVALID'));
    await assert.rejects(service.assetMutations!.preview(managed.managedAssetId, 'REPLACE', { asset_id: 'unknown' }), code('ASSET_NOT_FOUND'));
    await assert.rejects(service.assetMutations!.preview(managed.managedAssetId, 'REMOVE', { source_file: source }), code('ASSET_SOURCE_INVALID'));
    await assert.rejects(service.assetMutations!.preview(managed.managedAssetId, 'REMOVE', { asset_id: indexed.assetId }), code('ASSET_SOURCE_INVALID'));
    await writeFile(file, png(255, [20,20,20]));
    await assert.rejects(service.assetMutations!.preview(managed.managedAssetId, 'REPLACE', { asset_id: indexed.assetId }), code('ASSET_STATE_STALE'));
    await unlink(file);
    await assert.rejects(service.assetMutations!.preview(managed.managedAssetId, 'REPLACE', { asset_id: indexed.assetId }), code('ASSET_SOURCE_INVALID'));
    assert.deepEqual(assetDomainSnapshot(service), before);
});

test('REPLACE preview simulates readiness recovery for a persisted missing slot without rebinding it', async () => {
    const { service, slots, root } = await roleSlots(['BS', 'OF']);
    const managed = service.managedAssets!.listManagedAssets().find(a => a.role === 'BS')!;
    await unlink(path.join(root, managed.managedRelativePath)); await service.assets!.scan();
    const before = assetDomainSnapshot(service);
    const result = await service.assetMutations!.preview(managed.managedAssetId, 'REPLACE', { source_file: slots.BS!.source });
    assert.deepEqual(result.readiness_before, { standard: incomplete(), overframe: incomplete() });
    assert.deepEqual(result.readiness_after, { standard: ready(['BS']), overframe: ready(['BS', 'OF']) });
    assert.deepEqual(assetDomainSnapshot(service), before);
});

test('REPLACE preview rejects non-regular, missing, unsupported and undecodable proposed sources without mutation', async () => {
    const { root, service, managed } = await managedSlot();
    const directory = path.join(root, 'directory.png'); await mkdir(directory);
    const unsupported = await sourceFile(root, 'source.gif', png(255));
    const undecodable = await sourceFile(root, 'broken.png', Buffer.from('not an image'));
    const before = assetDomainSnapshot(service); const files = previewFiles(root);
    for (const source of [directory, path.join(root, 'missing.png'), unsupported, undecodable]) {
        await assert.rejects(service.assetMutations!.preview(managed.managedAssetId, 'REPLACE', { source_file: source }), code('ASSET_SOURCE_INVALID'));
    }
    assert.deepEqual(assetDomainSnapshot(service), before); assert.deepEqual(previewFiles(root), files);
});

test('REPLACE simulation restores BG+OF Overframe precedence after validating missing BG replacement', async () => {
    const { root, service, slots } = await roleSlots(['BS', 'BG', 'OF']);
    const bg = service.managedAssets!.listManagedAssets().find(a => a.role === 'BG')!;
    await unlink(path.join(root, bg.managedRelativePath)); await service.assets!.scan();
    const before = assetDomainSnapshot(service);
    const result = await service.assetMutations!.preview(bg.managedAssetId, 'REPLACE', { source_file: slots.BG!.source });
    assert.deepEqual(result.readiness_before, { standard: ready(['BS']), overframe: ready(['BS', 'OF']) });
    assert.deepEqual(result.readiness_after, { standard: ready(['BS']), overframe: ready(['BG', 'OF']) });
    assert.deepEqual(assetDomainSnapshot(service), before);
});

// RUN012: a matching Canonical password must not pierce explicit resolver intent.
const draftFence = async (hooks: MutationHooks = {}) => {
    const { root, service } = await setup(hooks);
    const file = await indexedFile(root, '77770000-DraftSource-BS-Default.png');
    const initial = await service.assetMutations!.refresh();
    const asset = initial.assets[0]!;
    const fenced = await service.assetMutations!.resolve({ operation: 'UNASSIGN', asset_id: asset.assetId,
        expected_state_token: initial.expected_state_token });
    const card = service.canonical!.createCard({ family: 'SPELL', password: '77770000' });
    return { root, service, file, asset, fenced, card };
};
const assertFence = (service: WorkspaceService, assetId: string, cardId: string) => {
    const asset = service.assets!.listAssets().find(a => a.assetId === assetId)!;
    assert.equal(asset.associationState, 'UNRESOLVED'); assert.equal(asset.cardId, null); assert.equal(asset.variantId, null);
    assert.equal(asset.present, true); assert.equal(asset.validAsset, true); assert.equal(asset.parsedPassword, '77770000');
    assert.equal(disposition(service, assetId), 'UNASSIGN');
    assert.equal(service.assets!.listVariants(cardId).length, 0);
    assert.equal(service.libraryAssets!.getNeedsAttention().items.some(i => i.asset_id === assetId && i.code === 'UNRESOLVED_CARD'), true);
};
const attachDraft = (fixture: Awaited<ReturnType<typeof draftFence>>, role: 'BS' | 'OF' = 'BS') => fixture.service.assetMutations!.resolve({
    operation: 'ATTACH', asset_id: fixture.asset.assetId, expected_state_token: fixture.fenced.expected_state_token,
    role, create_variant: { card_id: fixture.card.cardId, variant_key: 'Explicit', display_label: 'Explicit art' },
});

test('DRAFT-FENCE-01 matching-password Draft and scan preserve explicit unresolved source and physical bytes', async () => {
    const f = await draftFence(); const bytes = await readFile(f.file);
    await f.service.assets!.scan(); assertFence(f.service, f.asset.assetId, f.card.cardId);
    assert.deepEqual(await readFile(f.file), bytes);
    await writeFile(f.file, 'invalid bytes'); await f.service.assets!.scan();
    assert.equal(f.service.assets!.listAssets().find(a => a.assetId === f.asset.assetId)!.validAsset, false);
    assert.equal(f.service.assets!.listVariants(f.card.cardId).length, 0);
    await unlink(f.file); await f.service.assets!.scan();
    assert.equal(f.service.assets!.listAssets().find(a => a.assetId === f.asset.assetId)!.present, false);
    assert.equal(disposition(f.service, f.asset.assetId), 'UNASSIGN');
});
test('DRAFT-FENCE-02 fenced scan creates no automatic Art Variant and does not update existing variants', async () => {
    const f = await draftFence();
    f.service.persistence!.runRepositoryOperation(db => db.prepare(`INSERT INTO art_variants
        (variant_id, card_id, variant_key, display_label, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`)
        .run('existing-default', f.card.cardId, 'default', 'Untouched label', 'before', 'before'));
    const before = f.service.persistence!.runRepositoryOperation(db => db.prepare('SELECT * FROM art_variants').all());
    await f.service.assets!.scan();
    assert.deepEqual(f.service.persistence!.runRepositoryOperation(db => db.prepare('SELECT * FROM art_variants').all()), before);
});
test('DRAFT-FENCE-03 protection token survives matching Draft creation and execution pre-scan', async () => {
    const f = await draftFence();
    assert.equal(f.service.assetMutations!.getState().expected_state_token, f.fenced.expected_state_token);
    await f.service.assets!.scan();
    assert.equal(f.service.assetMutations!.getState().expected_state_token, f.fenced.expected_state_token);
    await attachDraft(f);
});
test('DRAFT-FENCE-04 explicit ATTACH creates only requested resolver variant', async () => {
    const f = await draftFence(); const result = await attachDraft(f);
    const variants = result.variants.filter(v => v.cardId === f.card.cardId);
    assert.equal(variants.length, 1); assert.equal(variants[0]!.variantKey, 'explicit');
    assert.equal(variants[0]!.roles.BS!.assetId, f.asset.assetId);
});
test('DRAFT-FENCE-05 UNASSIGN becomes ASSIGN only at explicitly requested target', async () => {
    const f = await draftFence(); assert.equal(disposition(f.service, f.asset.assetId), 'UNASSIGN');
    const result = await attachDraft(f); const asset = result.assets.find(a => a.assetId === f.asset.assetId)!;
    assert.equal(disposition(f.service, f.asset.assetId), 'ASSIGN'); assert.equal(asset.cardId, f.card.cardId);
    assert.equal(asset.variantKey, 'explicit'); assert.equal(asset.role, 'BS');
    await f.service.assets!.scan(); assert.equal(f.service.assets!.listVariants(f.card.cardId).length, 1);
});
test('DRAFT-FENCE-06 injected ATTACH postcondition failure preserves Draft and fence with no automatic/requested variant', async () => {
    let armed = false;
    const f = await draftFence({ phase: phase => { if (armed && phase === 'postcondition') throw new Error('attachment completion failure'); } });
    armed = true; await assert.rejects(attachDraft(f), code('ASSET_MUTATION_FAILED'));
    assertFence(f.service, f.asset.assetId, f.card.cardId);
    assert.ok(f.service.persistence!.runRepositoryOperation(db => db.prepare('SELECT card_id FROM canonical_cards WHERE card_id = ?').get(f.card.cardId)));
});
test('DRAFT-FENCE-07 failure after resolver variant creation compensates Asset domain, preserving Draft and fence', async () => {
    let armed = false;
    const f = await draftFence({ phase: phase => { if (armed && phase === 'database') throw new Error('after variant creation'); } });
    armed = true; await assert.rejects(attachDraft(f), code('ASSET_MUTATION_FAILED'));
    assertFence(f.service, f.asset.assetId, f.card.cardId);
    assert.equal(f.service.assetMutations!.getState().expected_state_token, f.fenced.expected_state_token);
    assert.ok(f.service.persistence!.runRepositoryOperation(db => db.prepare('SELECT card_id FROM canonical_cards WHERE card_id = ?').get(f.card.cardId)));
    armed = false; await attachDraft(f);
});
test('DRAFT-FENCE-08 restart and Rescan preserve fence without automatic binding or variant creation', async () => {
    const f = await draftFence(); await f.service.close();
    const service = await createWorkspaceService({ workspaceRoot: f.root, host: '127.0.0.1', port: 4312 }); services.push(service);
    await service.assets!.scan(); assertFence(service, f.asset.assetId, f.card.cardId);
});
test('OVERRIDE-PRECEDENCE-01 conflict loser remains unassigned through Rescan and available for explicit attachment', async () => {
    const f = await conflict();
    await f.service.assetMutations!.resolve({ operation: 'CHOOSE', asset_id: f.winner.assetId, variant_id: f.variant.variantId,
        role: 'BS', expected_state_token: await token(f.service) });
    await f.service.assets!.scan(); assert.equal(disposition(f.service, f.loser.assetId), 'UNASSIGN');
    assert.equal(f.service.assets!.listAssets().find(a => a.assetId === f.loser.assetId)!.variantId, null);
    const result = await f.service.assetMutations!.resolve({ operation: 'ATTACH', asset_id: f.loser.assetId,
        expected_state_token: f.service.assetMutations!.getState().expected_state_token, role: 'BS',
        create_variant: { card_id: f.card.cardId, variant_key: 'Later' } });
    assert.equal(result.assets.find(a => a.assetId === f.loser.assetId)!.variantKey, 'later'); assert.ok(existsSync(f.b));
});
test('OVERRIDE-PRECEDENCE-02 IGNORE suppresses automatic variant side effects and actionable diagnostics', async () => {
    const f = await draftFence();
    f.service.persistence!.runRepositoryOperation(db => db.prepare("UPDATE asset_resolution_overrides SET disposition = 'IGNORE' WHERE asset_id = ?").run(f.asset.assetId));
    await f.service.assets!.scan();
    assert.equal(f.service.assets!.listVariants(f.card.cardId).length, 0);
    const asset = f.service.assets!.listAssets().find(a => a.assetId === f.asset.assetId)!;
    assert.equal(asset.cardId, null); assert.equal(asset.variantId, null); assert.equal(asset.validAsset, true);
    assert.equal(f.service.libraryAssets!.getNeedsAttention().items.some(i => i.asset_id === f.asset.assetId), false);
    assert.ok(existsSync(f.file));
});
test('OVERRIDE-PRECEDENCE-03 ASSIGN retains explicit target and physical validation precedence', async () => {
    const f = await draftFence(); await attachDraft(f); await writeFile(f.file, png(255, [90, 50, 20]));
    await f.service.assets!.scan();
    const asset = f.service.assets!.listAssets().find(a => a.assetId === f.asset.assetId)!;
    assert.equal(asset.cardId, f.card.cardId); assert.equal(asset.variantKey, 'explicit'); assert.equal(asset.validAsset, true);
    await writeFile(f.file, 'not an image'); await f.service.assets!.scan();
    assert.equal(f.service.assets!.listAssets().find(a => a.assetId === f.asset.assetId)!.validAsset, false);
    assert.equal(disposition(f.service, f.asset.assetId), 'ASSIGN');
});
test('OVERRIDE-PRECEDENCE-04 ordinary filename association without override remains automatic', async () => {
    const { root, service } = await setup(); await indexedFile(root, '77770000-Ordinary-BS-Default.png');
    await service.assets!.scan(); const card = service.canonical!.createCard({ family: 'SPELL', password: '77770000' });
    await service.assets!.scan(); const variant = service.assets!.listVariants(card.cardId)[0]!;
    assert.equal(variant.variantKey, 'default'); assert.equal(variant.roles.BS!.cardId, card.cardId);
    assert.equal(disposition(service, variant.roles.BS!.assetId), undefined);
});
