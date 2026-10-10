import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, symlink, unlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { deflateSync } from 'node:zlib';
import Database from 'better-sqlite3';
import { ManagedAssetIngestService } from '../src/managed-assets/service';
import { ManagedAssetIngestError } from '../src/managed-assets/types';
import { SUPPORTED_DATABASE_SCHEMA_VERSION } from '../src/persistence/constants';
import { readDatabaseSchemaVersion } from '../src/persistence/database';
import { bootstrapWorkspaceDatabase, migrateWorkspaceDatabase } from '../src/persistence/operations';
import { resolveWorkspaceDatabasePath } from '../src/persistence/path';
import { createWorkspaceService } from '../src/service';
import { inspectWorkspaceRoot } from '../src/workspace/inspect';
import { SUPPORTED_WORKSPACE_FORMAT_VERSION, type WorkspaceManifest } from '../src/workspace/types';

const roots: string[] = [];
const manifest = (): WorkspaceManifest => ({
    workspace_id: 'workspace-run005',
    workspace_format_version: SUPPORTED_WORKSPACE_FORMAT_VERSION,
    database_path: 'Data/workspace.db',
    created_at: '2026-10-06T00:00:00.000Z',
    name: 'RUN 005 Test Workspace',
});
const tempRoot = async (label: string) => {
    const root = await mkdtemp(path.join(os.tmpdir(), `yu3doh run005 ${label} `));
    roots.push(root);
    await writeFile(path.join(root, 'workspace.json'), JSON.stringify(manifest()), 'utf8');
    return root;
};
const readyService = async (label: string) => {
    const root = await tempRoot(label);
    bootstrapWorkspaceDatabase(root, manifest());
    const service = await createWorkspaceService({ workspaceRoot: root, host: '127.0.0.1', port: 4312 });
    assert.equal(service.status.state, 'READY');
    assert.ok(service.canonical);
    assert.ok(service.assets);
    assert.ok(service.managedAssets);
    return { root, service, canonical: service.canonical, assets: service.assets, managed: service.managedAssets };
};

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
const jpeg = () => Buffer.from('/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDwGiiimI//2Q==', 'base64');
const bmp = () => {
    const output = Buffer.alloc(58);
    output.write('BM', 0, 'ascii'); output.writeUInt32LE(output.length, 2); output.writeUInt32LE(54, 10);
    output.writeUInt32LE(40, 14); output.writeInt32LE(1, 18); output.writeInt32LE(1, 22);
    output.writeUInt16LE(1, 26); output.writeUInt16LE(24, 28); output.writeUInt32LE(4, 34);
    output[54] = 1; output[55] = 2; output[56] = 3;
    return output;
};
const hash = (contents: Buffer) => createHash('sha256').update(contents).digest('hex');
const sourceFile = async (root: string, name: string, contents: Buffer) => {
    const directory = path.join(root, 'External Sources 日本語');
    await mkdir(directory, { recursive: true });
    const file = path.join(directory, name);
    await writeFile(file, contents);
    return file;
};
const expectCode = (code: string) => (error: unknown) =>
    error instanceof ManagedAssetIngestError && error.code === code;

const createSchema3Database = async (root: string) => {
    const databasePath = resolveWorkspaceDatabasePath(root, manifest().database_path);
    await mkdir(path.dirname(databasePath), { recursive: true });
    const database = new Database(databasePath);
    for (const [version, name, fileName] of [
        [1, 'repository_foundation', '001_repository_foundation.sql'],
        [2, 'canonical_domain', '002_canonical_domain.sql'],
        [3, 'art_variants_asset_index', '003_art_variants_asset_index.sql'],
    ] as const) {
        database.exec(readFileSync(path.resolve(process.cwd(), 'migrations', fileName), 'utf8'));
        database.prepare('INSERT INTO _workspace_migrations (version, name) VALUES (?, ?)').run(version, name);
        database.pragma(`user_version = ${version}`);
    }
    database.close();
    return databasePath;
};

test.after(async () => { await Promise.all(roots.map(root => rm(root, { recursive: true, force: true }))); });

test('schema 3 remains NEEDS_MIGRATION until explicit 3->4 migration', async () => {
    const root = await tempRoot('schema3');
    const databasePath = await createSchema3Database(root);
    const before = await inspectWorkspaceRoot(root);
    assert.equal(before.state, 'NEEDS_MIGRATION');
    assert.equal(before.database_schema_version, 3);
    const unchanged = new Database(databasePath, { readonly: true, fileMustExist: true });
    assert.equal(readDatabaseSchemaVersion(unchanged), 3); unchanged.close();
    const migrated = migrateWorkspaceDatabase(root, manifest());
    assert.deepEqual(migrated.appliedVersions, [4, 5, 6]);
    assert.equal(migrated.currentVersion, 6);
});

test('fresh bootstrap reaches current schema and records migration 005', async () => {
    const root = await tempRoot('fresh');
    const result = bootstrapWorkspaceDatabase(root, manifest());
    assert.equal(SUPPORTED_DATABASE_SCHEMA_VERSION, 6);
    assert.deepEqual(result.appliedVersions, [1, 2, 3, 4, 5, 6]);
    const database = new Database(result.databasePath, { readonly: true, fileMustExist: true });
    assert.deepEqual(database.prepare('SELECT version, name FROM _workspace_migrations ORDER BY version').all(), [
        { version: 1, name: 'repository_foundation' }, { version: 2, name: 'canonical_domain' },
        { version: 3, name: 'art_variants_asset_index' }, { version: 4, name: 'managed_asset_ingest' },
        { version: 5, name: 'asset_resolution_overrides' },
        { version: 6, name: 'variant_lifecycle' },
    ]);
    database.close();
});

test('managed writer is separate from read-only AssetIndexerService', async () => {
    const { service, assets, managed } = await readyService('boundary');
    assert.equal('ingest' in assets, false);
    assert.equal(typeof managed.ingest, 'function');
    await service.close();
});

test('unknown card, invalid role and invalid variant reject before managed filesystem mutation', async () => {
    const { root, service, canonical, managed } = await readyService('basic validation');
    const source = await sourceFile(root, 'valid.png', png(255));
    await assert.rejects(managed.ingest({ cardId: '00000000-0000-4000-8000-000000000000', variantKey: 'Default', role: 'BS', sourceFile: source, idempotencyKey: 'unknown' }), expectCode('NOT_FOUND'));
    const card = canonical.createCard({ family: 'SPELL', password: '60000001' });
    await assert.rejects(managed.ingest({ cardId: card.cardId, variantKey: 'Default', role: 'FG', sourceFile: source, idempotencyKey: 'bad-role' }), expectCode('INVALID_ROLE'));
    await assert.rejects(managed.ingest({ cardId: card.cardId, variantKey: '../escape', role: 'BS', sourceFile: source, idempotencyKey: 'bad-variant' }), expectCode('INVALID_VARIANT'));
    assert.equal(existsSync(path.join(root, 'Assets', 'Managed')), false);
    await service.close();
});

test('missing source, directory source, and source path through link/junction are rejected', async () => {
    const { root, service, canonical, managed } = await readyService('source safety');
    const card = canonical.createCard({ family: 'SPELL', password: '60000002' });
    await assert.rejects(managed.ingest({ cardId: card.cardId, variantKey: 'Default', role: 'BS', sourceFile: path.join(root, 'missing.png'), idempotencyKey: 'missing' }), expectCode('INVALID_SOURCE'));
    const directory = path.join(root, 'source-directory.png'); await mkdir(directory);
    await assert.rejects(managed.ingest({ cardId: card.cardId, variantKey: 'Default', role: 'BS', sourceFile: directory, idempotencyKey: 'directory' }), expectCode('INVALID_SOURCE'));
    const realDir = path.join(root, 'real-source'); await mkdir(realDir);
    await writeFile(path.join(realDir, 'source.png'), png(255));
    const linkedDir = path.join(root, 'linked-source');
    await symlink(realDir, linkedDir, process.platform === 'win32' ? 'junction' : 'dir');
    await assert.rejects(managed.ingest({ cardId: card.cardId, variantKey: 'Default', role: 'BS', sourceFile: path.join(linkedDir, 'source.png'), idempotencyKey: 'link' }), expectCode('INVALID_SOURCE'));
    await service.close();
});

test('invalid PNG/JPEG/BMP and opaque OF reject without variant, managed owner or final file', async () => {
    const { root, service, canonical, managed, assets } = await readyService('invalid images');
    const card = canonical.createCard({ family: 'SPELL', password: '60000003' });
    for (const [name, role] of [['broken.png', 'BS'], ['broken.jpg', 'BG'], ['broken.bmp', 'BS']] as const) {
        const source = await sourceFile(root, name, Buffer.from('broken'));
        await assert.rejects(managed.ingest({ cardId: card.cardId, variantKey: 'Default', role, sourceFile: source, idempotencyKey: `invalid-${name}` }), expectCode('INVALID_IMAGE'));
    }
    const opaque = await sourceFile(root, 'opaque.png', png(255));
    await assert.rejects(managed.ingest({ cardId: card.cardId, variantKey: 'Default', role: 'OF', sourceFile: opaque, idempotencyKey: 'opaque' }), expectCode('INVALID_IMAGE'));
    assert.equal(assets.listVariants(card.cardId).length, 0);
    assert.equal(managed.listManagedAssets().length, 0);
    await service.close();
});

test('valid BS PNG creates variant and deterministic path, becomes visible without restart, and preserves source', async () => {
    const { root, service, canonical, managed, assets } = await readyService('bs success');
    const card = canonical.createCard({ family: 'SPELL', password: '61000001' });
    const source = await sourceFile(root, 'Source File 日本語.PNG', png(255));
    const before = hash(await readFile(source));
    const result = await managed.ingest({ cardId: card.cardId, variantKey: 'Default', role: 'BS', sourceFile: source, idempotencyKey: 'bs-success' });
    assert.equal(result.managedAsset.managedRelativePath, `Assets/Managed/${card.cardId}/default/BS.png`);
    assert.equal(hash(await readFile(source)), before);
    const variant = assets.listVariants(card.cardId)[0];
    assert.equal(variant?.roles.BS?.relativePath, result.managedAsset.managedRelativePath);
    assert.deepEqual(variant?.standard, { state: 'READY', sources: ['BS'] });
    assert.deepEqual(variant?.overframe, { state: 'INCOMPLETE', sources: [] });
    await service.close();
});

test('valid BG JPEG, supported BMP and transparent OF use RUN 004 validator and readiness', async () => {
    const { root, service, canonical, managed, assets } = await readyService('formats');
    const card = canonical.createCard({ family: 'SPELL', password: '61000002' });
    const bg = await sourceFile(root, 'background.JPEG', jpeg());
    await managed.ingest({ cardId: card.cardId, variantKey: 'Default', role: 'BG', sourceFile: bg, idempotencyKey: 'bg-jpeg' });
    const of = await sourceFile(root, 'subject.png', png(0));
    await managed.ingest({ cardId: card.cardId, variantKey: 'default', role: 'OF', sourceFile: of, idempotencyKey: 'of-png' });
    let variant = assets.listVariants(card.cardId)[0];
    assert.deepEqual(variant?.standard, { state: 'READY', sources: ['BG', 'OF'] });
    assert.deepEqual(variant?.overframe, { state: 'READY', sources: ['BG', 'OF'] });
    const bmpCard = canonical.createCard({ family: 'SPELL', password: '61000003' });
    const bmpSource = await sourceFile(root, 'basic.bmp', bmp());
    const bmpResult = await managed.ingest({ cardId: bmpCard.cardId, variantKey: 'Default', role: 'BS', sourceFile: bmpSource, idempotencyKey: 'bmp' });
    assert.equal(bmpResult.managedAsset.extension, 'bmp');
    variant = assets.listVariants(bmpCard.cardId)[0];
    assert.deepEqual(variant?.standard, { state: 'READY', sources: ['BS'] });
    await service.close();
});

test('case-equivalent existing variant is reused', async () => {
    const { root, service, canonical, managed, assets } = await readyService('variant reuse');
    const card = canonical.createCard({ family: 'SPELL', password: '62000001' });
    const first = await sourceFile(root, 'first.png', png(255));
    const one = await managed.ingest({ cardId: card.cardId, variantKey: 'Default', role: 'BS', sourceFile: first, idempotencyKey: 'reuse-1' });
    const second = await sourceFile(root, 'second.png', png(0));
    const two = await managed.ingest({ cardId: card.cardId, variantKey: 'DEFAULT', role: 'OF', sourceFile: second, idempotencyKey: 'reuse-2' });
    assert.equal(two.managedAsset.variantId, one.managedAsset.variantId);
    assert.equal(assets.listVariants(card.cardId).length, 1);
    await service.close();
});

test('same idempotency key and same request is no-op without duplicates', async () => {
    const { root, service, canonical, managed, assets } = await readyService('idempotent');
    const card = canonical.createCard({ family: 'SPELL', password: '62000002' });
    const source = await sourceFile(root, 'retry.png', png(255));
    const request = { cardId: card.cardId, variantKey: 'Default', role: 'BS', sourceFile: source, idempotencyKey: 'same-key' };
    const first = await managed.ingest(request); const second = await managed.ingest(request);
    assert.equal(second.idempotent, true);
    assert.equal(second.managedAsset.managedAssetId, first.managedAsset.managedAssetId);
    assert.equal(managed.listManagedAssets().length, 1);
    assert.equal(assets.listVariants(card.cardId).length, 1);
    await service.close();
});

test('same idempotency key with different content rejects and leaves original managed/source bytes untouched', async () => {
    const { root, service, canonical, managed } = await readyService('idem conflict');
    const card = canonical.createCard({ family: 'SPELL', password: '62000003' });
    const source = await sourceFile(root, 'content.png', png(255, [1, 2, 3]));
    const first = await managed.ingest({ cardId: card.cardId, variantKey: 'Default', role: 'BS', sourceFile: source, idempotencyKey: 'collision-key' });
    const managedPath = path.join(root, ...first.managedAsset.managedRelativePath.split('/'));
    const beforeManaged = hash(await readFile(managedPath));
    await writeFile(source, png(255, [4, 5, 6])); const beforeSource = hash(await readFile(source));
    await assert.rejects(managed.ingest({ cardId: card.cardId, variantKey: 'Default', role: 'BS', sourceFile: source, idempotencyKey: 'collision-key' }), expectCode('IDEMPOTENCY_CONFLICT'));
    assert.equal(hash(await readFile(source)), beforeSource);
    assert.equal(hash(await readFile(managedPath)), beforeManaged);
    await service.close();
});

test('same target and same hash with new key returns existing asset without duplicate', async () => {
    const { root, service, canonical, managed } = await readyService('same hash');
    const card = canonical.createCard({ family: 'SPELL', password: '62000004' });
    const source = await sourceFile(root, 'one.png', png(255));
    const one = await managed.ingest({ cardId: card.cardId, variantKey: 'Default', role: 'BS', sourceFile: source, idempotencyKey: 'target-1' });
    const two = await managed.ingest({ cardId: card.cardId, variantKey: 'default', role: 'BS', sourceFile: source, idempotencyKey: 'target-2' });
    assert.equal(two.idempotent, true); assert.equal(two.managedAsset.managedAssetId, one.managedAsset.managedAssetId);
    assert.equal(managed.listManagedAssets().length, 1);
    await service.close();
});

test('same managed target with different content conflicts instead of replacing', async () => {
    const { root, service, canonical, managed } = await readyService('target diff');
    const card = canonical.createCard({ family: 'SPELL', password: '62000005' });
    const one = await sourceFile(root, 'one.png', png(255, [1,2,3]));
    const first = await managed.ingest({ cardId: card.cardId, variantKey: 'Default', role: 'BS', sourceFile: one, idempotencyKey: 'd1' });
    const managedPath = path.join(root, ...first.managedAsset.managedRelativePath.split('/')); const before = hash(await readFile(managedPath));
    const two = await sourceFile(root, 'two.png', png(255, [7,8,9]));
    await assert.rejects(managed.ingest({ cardId: card.cardId, variantKey: 'Default', role: 'BS', sourceFile: two, idempotencyKey: 'd2' }), expectCode('TARGET_CONFLICT'));
    assert.equal(hash(await readFile(managedPath)), before);
    await service.close();
});

test('existing unmanaged binding or RUN 004 role conflict blocks ingest', async () => {
    const { root, service, canonical, managed, assets } = await readyService('occupied');
    const bound = canonical.createCard({ family: 'SPELL', password: '63000001' });
    const user = path.join(root, 'Assets', 'User'); await mkdir(user, { recursive: true });
    await writeFile(path.join(user, '63000001-Name-BS-Default.png'), png(255)); await assets.scan();
    const source = await sourceFile(root, 'candidate.png', png(255, [9,8,7]));
    await assert.rejects(managed.ingest({ cardId: bound.cardId, variantKey: 'Default', role: 'BS', sourceFile: source, idempotencyKey: 'occupied' }), expectCode('TARGET_CONFLICT'));

    const conflicted = canonical.createCard({ family: 'SPELL', password: '63000002' });
    for (const folder of ['a','b']) {
        const dir=path.join(root,'Assets',folder); await mkdir(dir,{recursive:true});
        await writeFile(path.join(dir,'63000002-Name-BS-Default.png'),png(255));
    }
    const scan=await assets.scan(); assert.equal(scan.diagnostics.some(item=>item.code==='ROLE_CONFLICT'),true);
    await assert.rejects(managed.ingest({ cardId: conflicted.cardId, variantKey: 'Default', role: 'BS', sourceFile: source, idempotencyKey: 'conflict' }), expectCode('TARGET_CONFLICT'));
    await service.close();
});

test('unexpected destination collision is not overwritten or adopted', async () => {
    const { root, service, canonical, managed } = await readyService('destination');
    const card=canonical.createCard({family:'SPELL',password:'63000003'});
    const dir=path.join(root,'Assets','Managed',card.cardId,'default'); await mkdir(dir,{recursive:true});
    const destination=path.join(dir,'BS.png'); const unexpected=png(255,[1,1,1]); await writeFile(destination,unexpected);
    const source=await sourceFile(root,'candidate.png',png(255,[2,2,2]));
    await assert.rejects(managed.ingest({cardId:card.cardId,variantKey:'Default',role:'BS',sourceFile:source,idempotencyKey:'dest'}),expectCode('DESTINATION_CONFLICT'));
    assert.equal(hash(await readFile(destination)),hash(unexpected));
    await service.close();
});

test('publication failure leaves no final file, owner, binding or orphan variant', async () => {
    const { root, service, canonical, assets }=await readyService('publish fail'); assert.ok(service.persistence);
    const card=canonical.createCard({family:'SPELL',password:'64000001'}); const source=await sourceFile(root,'candidate.png',png(255));
    const failing=new ManagedAssetIngestService(root,service.persistence,assets,{publishStagedFile:()=>{throw new Error('publish');}});
    await assert.rejects(failing.ingest({cardId:card.cardId,variantKey:'Default',role:'BS',sourceFile:source,idempotencyKey:'pub-fail'}),expectCode('PUBLISH_FAILED'));
    assert.equal(failing.listManagedAssets().length,0); assert.equal(assets.listVariants(card.cardId).length,0);
    assert.equal(existsSync(path.join(root,'Assets','Managed',card.cardId,'default','BS.png')),false);
    await service.close();
});

test('DB persistence failure after staging rolls back without final file or orphan variant', async () => {
    const { root, service, canonical, managed, assets }=await readyService('db fail'); assert.ok(service.persistence);
    const card=canonical.createCard({family:'SPELL',password:'64000002'});
    service.persistence.runRepositoryOperation(db=>db.exec(`CREATE TRIGGER fail_managed BEFORE INSERT ON managed_assets BEGIN SELECT RAISE(ABORT,'deliberate managed failure'); END;`));
    const source=await sourceFile(root,'candidate.png',png(255));
    await assert.rejects(managed.ingest({cardId:card.cardId,variantKey:'Default',role:'BS',sourceFile:source,idempotencyKey:'db-fail'}),expectCode('PERSISTENCE_FAILED'));
    assert.equal(managed.listManagedAssets().length,0); assert.equal(assets.listVariants(card.cardId).length,0);
    assert.equal(existsSync(path.join(root,'Assets','Managed',card.cardId,'default','BS.png')),false);
    await service.close();
});

test('post-publication index failure compensates file, ownership and created variant', async () => {
    const { root, service, canonical, assets }=await readyService('index fail'); assert.ok(service.persistence);
    const card=canonical.createCard({family:'SPELL',password:'64000003'}); const source=await sourceFile(root,'candidate.png',png(255));
    class ProxyIndexer {
        private calls=0;
        constructor(private readonly delegate: typeof assets) {}
        async scan(){this.calls+=1;if(this.calls>=2)throw new Error('post publish scan');return this.delegate.scan();}
        listVariants(cardId?:string){return this.delegate.listVariants(cardId);}
    }
    const failing=new ManagedAssetIngestService(root,service.persistence,new ProxyIndexer(assets) as never);
    await assert.rejects(failing.ingest({cardId:card.cardId,variantKey:'Default',role:'BS',sourceFile:source,idempotencyKey:'index-fail'}),expectCode('INDEX_RECONCILIATION_FAILED'));
    assert.equal(failing.listManagedAssets().length,0); assert.equal(assets.listVariants(card.cardId).length,0);
    assert.equal(existsSync(path.join(root,'Assets','Managed',card.cardId,'default','BS.png')),false);
    await service.close();
});

test('successful post-publication scan followed by binding-verification failure compensates indexed state and orphan variant', async () => {
    const { root, service, canonical, assets }=await readyService('verify compensation'); assert.ok(service.persistence);
    const card=canonical.createCard({family:'SPELL',password:'64000004'}); const source=await sourceFile(root,'candidate.png',png(255));
    class VerificationFailureIndexer {
        private calls=0;
        constructor(private readonly delegate: typeof assets) {}
        async scan(){
            this.calls+=1;
            const result=await this.delegate.scan();
            if(this.calls===2)return {...result,variants:[]};
            return result;
        }
        listVariants(cardId?:string){return this.delegate.listVariants(cardId);}
    }
    const proxy=new VerificationFailureIndexer(assets);
    const failing=new ManagedAssetIngestService(root,service.persistence,proxy as never);
    await assert.rejects(
        failing.ingest({cardId:card.cardId,variantKey:'Default',role:'BS',sourceFile:source,idempotencyKey:'verify-fail'}),
        expectCode('INDEX_RECONCILIATION_FAILED'),
    );
    assert.equal(failing.listManagedAssets().length,0);
    assert.equal(assets.listVariants(card.cardId).length,0);
    assert.equal(existsSync(path.join(root,'Assets','Managed',card.cardId,'default','BS.png')),false);
    const indexed=assets.listAssets().find(item=>item.relativePath===`Assets/Managed/${card.cardId}/default/BS.png`);
    assert.equal(indexed?.present,false);
    assert.equal(indexed?.variantId,null);
    await service.close();
});

test('absolute source path is not persisted', async () => {
    const { root, service, canonical, managed }=await readyService('no absolute'); assert.ok(service.persistence);
    const card=canonical.createCard({family:'SPELL',password:'65000001'}); const source=await sourceFile(root,'private.png',png(255));
    await managed.ingest({cardId:card.cardId,variantKey:'Default',role:'BS',sourceFile:source,idempotencyKey:'no-absolute'});
    const rows=service.persistence.runRepositoryOperation(db=>({managed:db.prepare('SELECT * FROM managed_assets').all(),requests:db.prepare('SELECT * FROM managed_asset_ingest_requests').all()}));
    assert.equal(JSON.stringify(rows).includes(path.resolve(source)),false);
    await service.close();
});

test('Unicode/spaces Workspace and source paths work and explicit ingest may create Assets namespace', async () => {
    const parent=await tempRoot('unicode parent'); const root=path.join(parent,'Workspace Managed 日本語'); await mkdir(root);
    await writeFile(path.join(root,'workspace.json'),JSON.stringify(manifest()),'utf8'); bootstrapWorkspaceDatabase(root,manifest());
    const service=await createWorkspaceService({workspaceRoot:root,host:'127.0.0.1',port:4312}); assert.ok(service.canonical&&service.managedAssets);
    assert.equal(existsSync(path.join(root,'Assets')),false);
    const card=service.canonical.createCard({family:'SPELL',password:'65000002'});
    const ext=path.join(parent,'Fuente Externa 日本語'); await mkdir(ext); const source=path.join(ext,'imagen con espacios.png'); await writeFile(source,png(255));
    const result=await service.managedAssets.ingest({cardId:card.cardId,variantKey:'Default',role:'BS',sourceFile:source,idempotencyKey:'unicode'});
    assert.equal(existsSync(path.join(root,...result.managedAsset.managedRelativePath.split('/'))),true);
    await service.close();
});

test('managed ownership resolves BS.png without filename guessing', async () => {
    const { root, service, canonical, managed, assets }=await readyService('ownership');
    const card=canonical.createCard({family:'TOKEN'}); const source=await sourceFile(root,'arbitrary-source.png',png(255));
    const result=await managed.ingest({cardId:card.cardId,variantKey:'Default',role:'BS',sourceFile:source,idempotencyKey:'owner'});
    assert.equal(path.basename(result.managedAsset.managedRelativePath),'BS.png');
    const indexed=assets.listAssets().find(item=>item.relativePath===result.managedAsset.managedRelativePath);
    assert.equal(indexed?.cardId,card.cardId); assert.equal(indexed?.parsedCardName,null); assert.equal(indexed?.validAsset,true);
    await service.close();
});

test('deleted managed file becomes missing while ownership persists', async () => {
    const { root, service, canonical, managed, assets }=await readyService('missing later');
    const card=canonical.createCard({family:'SPELL',password:'66000001'}); const source=await sourceFile(root,'source.png',png(255));
    const result=await managed.ingest({cardId:card.cardId,variantKey:'Default',role:'BS',sourceFile:source,idempotencyKey:'missing-later'});
    await unlink(path.join(root,...result.managedAsset.managedRelativePath.split('/')));
    const scan=await assets.scan(); assert.equal(scan.diagnostics.some(item=>item.code==='MISSING_SOURCE'),true);
    assert.equal(assets.listVariants(card.cardId)[0]?.roles.BS,null); assert.equal(managed.listManagedAssets().length,1);
    await service.close();
});

test('corrupt or valid-content-drifted managed file becomes invalid with no binding', async () => {
    const { root, service, canonical, managed, assets }=await readyService('corrupt later');
    const card=canonical.createCard({family:'SPELL',password:'66000002'}); const source=await sourceFile(root,'source.png',png(255));
    const result=await managed.ingest({cardId:card.cardId,variantKey:'Default',role:'BS',sourceFile:source,idempotencyKey:'corrupt'});
    const managedPath=path.join(root,...result.managedAsset.managedRelativePath.split('/'));
    await writeFile(managedPath,png(255,[8,8,8]));
    const scan=await assets.scan(); assert.equal(scan.diagnostics.some(item=>item.code==='INVALID_IMAGE'),true);
    assert.equal(assets.listVariants(card.cardId)[0]?.roles.BS,null);
    await service.close();
});

test('manual unmanaged duplicate later produces ROLE_CONFLICT without managed precedence', async () => {
    const { root, service, canonical, managed, assets }=await readyService('duplicate later');
    const card=canonical.createCard({family:'SPELL',password:'66000003'}); const source=await sourceFile(root,'source.png',png(255));
    await managed.ingest({cardId:card.cardId,variantKey:'Default',role:'BS',sourceFile:source,idempotencyKey:'dup'});
    const dir=path.join(root,'Assets','User'); await mkdir(dir,{recursive:true}); await writeFile(path.join(dir,'66000003-Name-BS-Default.png'),png(255));
    const scan=await assets.scan(); assert.equal(scan.diagnostics.some(item=>item.code==='ROLE_CONFLICT'),true);
    assert.equal(assets.listVariants(card.cardId)[0]?.roles.BS,null);
    await service.close();
});

test('existing managed same-hash target rejects retry when a later unmanaged duplicate creates ROLE_CONFLICT', async () => {
    const { root, service, canonical, managed, assets }=await readyService('managed conflict retry');
    const card=canonical.createCard({family:'SPELL',password:'66000004'});
    const source=await sourceFile(root,'source.png',png(255));
    const first=await managed.ingest({
        cardId:card.cardId,
        variantKey:'Default',
        role:'BS',
        sourceFile:source,
        idempotencyKey:'managed-conflict-original',
    });

    const duplicateDir=path.join(root,'Assets','User');
    await mkdir(duplicateDir,{recursive:true});
    await writeFile(path.join(duplicateDir,'66000004-Name-BS-Default.png'),png(255));
    const conflicted=await assets.scan();
    assert.equal(conflicted.diagnostics.some(item=>item.code==='ROLE_CONFLICT'),true);
    assert.equal(assets.listVariants(card.cardId)[0]?.roles.BS,null);

    await assert.rejects(
        managed.ingest({
            cardId:card.cardId,
            variantKey:'Default',
            role:'BS',
            sourceFile:source,
            idempotencyKey:'managed-conflict-new-key',
        }),
        expectCode('TARGET_CONFLICT'),
    );

    await assert.rejects(
        managed.ingest({
            cardId:card.cardId,
            variantKey:'Default',
            role:'BS',
            sourceFile:source,
            idempotencyKey:'managed-conflict-original',
        }),
        expectCode('TARGET_CONFLICT'),
    );

    assert.equal(managed.listManagedAssets().length,1);
    assert.equal(first.managedAsset.managedAssetId,managed.listManagedAssets()[0]?.managedAssetId);
    assert.equal(assets.listVariants(card.cardId)[0]?.roles.BS,null);
    await service.close();
});

test('unmanaged RUN 004 filename parsing remains intact beside managed ownership', async () => {
    const { root, service, canonical, managed, assets }=await readyService('unmanaged regression');
    const managedCard=canonical.createCard({family:'SPELL',password:'67000001'}); const unmanagedCard=canonical.createCard({family:'SPELL',password:'67000002'});
    const source=await sourceFile(root,'managed.png',png(255)); await managed.ingest({cardId:managedCard.cardId,variantKey:'Default',role:'BS',sourceFile:source,idempotencyKey:'managed'});
    const dir=path.join(root,'Assets','Unmanaged'); await mkdir(dir,{recursive:true}); await writeFile(path.join(dir,'67000002-Card-BS-Default.png'),png(255));
    await assets.scan(); const unmanaged=assets.listAssets().find(item=>item.parsedPassword==='67000002');
    assert.equal(unmanaged?.cardId,unmanagedCard.cardId); assert.equal(unmanaged?.validAsset,true);
    await service.close();
});

test('managed BS+OF then BS+BG+OF preserves RUN 004 readiness precedence', async () => {
    const { root, service, canonical, managed, assets }=await readyService('readiness');
    const card=canonical.createCard({family:'SPELL',password:'68000001'});
    const bs=await sourceFile(root,'bs.png',png(255)); const of=await sourceFile(root,'of.png',png(0)); const bg=await sourceFile(root,'bg.jpg',jpeg());
    await managed.ingest({cardId:card.cardId,variantKey:'Default',role:'BS',sourceFile:bs,idempotencyKey:'bs'});
    await managed.ingest({cardId:card.cardId,variantKey:'Default',role:'OF',sourceFile:of,idempotencyKey:'of'});
    let variant=assets.listVariants(card.cardId)[0];
    assert.deepEqual(variant?.standard,{state:'READY',sources:['BS']}); assert.deepEqual(variant?.overframe,{state:'READY',sources:['BS','OF']});
    await managed.ingest({cardId:card.cardId,variantKey:'Default',role:'BG',sourceFile:bg,idempotencyKey:'bg'});
    variant=assets.listVariants(card.cardId)[0];
    assert.deepEqual(variant?.standard,{state:'READY',sources:['BS']}); assert.deepEqual(variant?.overframe,{state:'READY',sources:['BG','OF']});
    await service.close();
});
