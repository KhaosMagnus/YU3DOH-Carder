import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, readdir, rm, unlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { deflateSync } from 'node:zlib';
import Database from 'better-sqlite3';
import { reconcileAssetIndex } from '../src/assets/repository';
import type { AssetRole } from '../src/assets/types';
import { SUPPORTED_DATABASE_SCHEMA_VERSION } from '../src/persistence/constants';
import { readDatabaseSchemaVersion } from '../src/persistence/database';
import { bootstrapWorkspaceDatabase, migrateWorkspaceDatabase } from '../src/persistence/operations';
import { resolveWorkspaceDatabasePath } from '../src/persistence/path';
import { createWorkspaceService, type WorkspaceService } from '../src/service';
import { inspectWorkspaceRoot } from '../src/workspace/inspect';
import { SUPPORTED_WORKSPACE_FORMAT_VERSION, type WorkspaceManifest } from '../src/workspace/types';

const roots: string[] = [];

const manifest = (): WorkspaceManifest => ({
    workspace_id: 'workspace-run004',
    workspace_format_version: SUPPORTED_WORKSPACE_FORMAT_VERSION,
    database_path: 'Data/workspace.db',
    created_at: '2026-10-06T00:00:00.000Z',
    name: 'RUN 004 Test Workspace',
});

const tempRoot = async (label: string) => {
    const root = await mkdtemp(path.join(os.tmpdir(), `yu3doh run004 ${label} `));
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
    return { root, service, canonical: service.canonical, assets: service.assets };
};

const crcTable = (() => {
    const table = new Uint32Array(256);
    for (let index = 0; index < 256; index += 1) {
        let value = index;
        for (let bit = 0; bit < 8; bit += 1) {
            value = (value & 1) ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
        }
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
    header.writeUInt32BE(1, 0);
    header.writeUInt32BE(1, 4);
    header[8] = 8;
    header[9] = 6;
    header[10] = 0;
    header[11] = 0;
    header[12] = 0;
    const raw = Buffer.from([0, rgb[0] ?? 0, rgb[1] ?? 0, rgb[2] ?? 0, alpha]);
    return Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        pngChunk('IHDR', header),
        pngChunk('IDAT', deflateSync(raw)),
        pngChunk('IEND', Buffer.alloc(0)),
    ]);
};

const jpeg = () => Buffer.from([
    0xff, 0xd8,
    0xff, 0xc0, 0x00, 0x11, 0x08, 0x00, 0x01, 0x00, 0x01, 0x03,
    0x01, 0x11, 0x00, 0x02, 0x11, 0x00, 0x03, 0x11, 0x00,
    0xff, 0xd9,
]);

const bmp = () => {
    const output = Buffer.alloc(58);
    output.write('BM', 0, 'ascii');
    output.writeUInt32LE(output.length, 2);
    output.writeUInt32LE(54, 10);
    output.writeUInt32LE(40, 14);
    output.writeInt32LE(1, 18);
    output.writeInt32LE(1, 22);
    output.writeUInt16LE(1, 26);
    output.writeUInt16LE(24, 28);
    output.writeUInt32LE(4, 34);
    output[54] = 1;
    output[55] = 2;
    output[56] = 3;
    return output;
};

const imageForExtension = (extension: string, transparent = false) => {
    if (extension.toLowerCase() === 'png') return png(transparent ? 0 : 255);
    if (['jpg', 'jpeg'].includes(extension.toLowerCase())) return jpeg();
    if (extension.toLowerCase() === 'bmp') return bmp();
    return Buffer.from('not an image');
};

const writeAsset = async (
    root: string,
    relativePath: string,
    contents?: Buffer,
) => {
    const absolutePath = path.join(root, 'Assets', ...relativePath.split('/'));
    await mkdir(path.dirname(absolutePath), { recursive: true });
    const extension = path.extname(relativePath).slice(1);
    await writeFile(absolutePath, contents ?? imageForExtension(extension));
    return absolutePath;
};

const tokenWithName = async (service: WorkspaceService, name: string) => {
    assert.ok(service.canonical);
    const token = service.canonical.createCard({ family: 'TOKEN' });
    return service.canonical.mutateCard(token.cardId, token.revision, {
        localizations: [{ language: 'EN', name, cardText: 'Token text', pendulumText: null }],
    });
};

const snapshotAssetsTree = async (root: string) => {
    const assetsRoot = path.join(root, 'Assets');
    const values: Array<{ path: string; hash: string }> = [];
    if (!existsSync(assetsRoot)) return values;
    const visit = async (directory: string): Promise<void> => {
        const entries = await readdir(directory, { withFileTypes: true });
        entries.sort((a, b) => a.name.localeCompare(b.name, 'en'));
        for (const entry of entries) {
            const absolute = path.join(directory, entry.name);
            if (entry.isDirectory()) await visit(absolute);
            else if (entry.isFile()) {
                const relative = path.relative(assetsRoot, absolute).split(path.sep).join('/');
                const contents = await readFile(absolute);
                values.push({ path: relative, hash: createHash('sha256').update(contents).digest('hex') });
            }
        }
    };
    await visit(assetsRoot);
    return values;
};

const createSchema2Database = async (root: string) => {
    const databasePath = resolveWorkspaceDatabasePath(root, manifest().database_path);
    await mkdir(path.dirname(databasePath), { recursive: true });
    const database = new Database(databasePath);
    for (const [version, name, fileName] of [
        [1, 'repository_foundation', '001_repository_foundation.sql'],
        [2, 'canonical_domain', '002_canonical_domain.sql'],
    ] as const) {
        database.exec(readFileSync(path.resolve(process.cwd(), 'migrations', fileName), 'utf8'));
        database.prepare('INSERT INTO _workspace_migrations (version, name) VALUES (?, ?)').run(version, name);
        database.pragma(`user_version = ${version}`);
    }
    database.close();
    return databasePath;
};

test.after(async () => {
    await Promise.all(roots.map(root => rm(root, { recursive: true, force: true })));
});

test('schema 2 is NEEDS_MIGRATION without implicit migration and explicit 2->3 succeeds', async () => {
    const root = await tempRoot('schema2 migration');
    const databasePath = await createSchema2Database(root);
    const before = await inspectWorkspaceRoot(root);
    assert.equal(before.state, 'NEEDS_MIGRATION');
    assert.equal(before.database_schema_version, 2);
    const unchanged = new Database(databasePath, { readonly: true, fileMustExist: true });
    assert.equal(readDatabaseSchemaVersion(unchanged), 2);
    unchanged.close();

    const migrated = migrateWorkspaceDatabase(root, manifest());
    assert.equal(migrated.previousVersion, 2);
    assert.equal(migrated.currentVersion, 3);
    assert.deepEqual(migrated.appliedVersions, [3]);
});

test('fresh bootstrap reaches schema 3 through migrations 001, 002, 003', async () => {
    const root = await tempRoot('fresh schema3');
    const result = bootstrapWorkspaceDatabase(root, manifest());
    assert.equal(SUPPORTED_DATABASE_SCHEMA_VERSION, 3);
    assert.equal(result.currentVersion, 3);
    assert.deepEqual(result.appliedVersions, [1, 2, 3]);
    const database = new Database(result.databasePath, { readonly: true, fileMustExist: true });
    assert.deepEqual(database.prepare('SELECT version, name FROM _workspace_migrations ORDER BY version').all(), [
        { version: 1, name: 'repository_foundation' },
        { version: 2, name: 'canonical_domain' },
        { version: 3, name: 'art_variants_asset_index' },
    ]);
    database.close();
});

test('absent Assets directory is controlled and is never created by the indexer', async () => {
    const { root, service, assets } = await readyService('missing assets');
    assert.equal(existsSync(path.join(root, 'Assets')), false);
    const scan = await assets.scan();
    assert.equal(existsSync(path.join(root, 'Assets')), false);
    assert.equal(scan.assets.length, 0);
    assert.equal(scan.diagnostics.some(item => item.code === 'ASSETS_DIRECTORY_MISSING'), true);
    await service.close();
});

test('zero files yields zero variants and an empty Assets directory is valid', async () => {
    const { root, service, assets } = await readyService('empty assets');
    await mkdir(path.join(root, 'Assets'));
    const scan = await assets.scan();
    assert.equal(scan.presentCount, 0);
    assert.deepEqual(scan.variants, []);
    assert.deepEqual(scan.diagnostics, []);
    await service.close();
});

test('multiple variants persist and case-equivalent variant keys reuse one card-relative variant', async () => {
    const { root, service, canonical, assets } = await readyService('variant normalization');
    const card = canonical.createCard({ family: 'SPELL', password: '10000001' });
    await writeAsset(root, 'a/10000001-Name-BS-Pose01.png');
    await writeAsset(root, 'b/10000001-Name-BG-pose01.png');
    await writeAsset(root, 'c/10000001-Name-BS-Alt_Artwork.png');
    const scan = await assets.scan();
    const variants = scan.variants.filter(item => item.cardId === card.cardId);
    assert.equal(variants.length, 2);
    assert.deepEqual(variants.map(item => item.variantKey), ['alt_artwork', 'pose01']);
    const pose = variants.find(item => item.variantKey === 'pose01');
    assert.ok(pose);
    assert.ok(pose.roles.BS);
    assert.ok(pose.roles.BG);
    await service.close();
});

for (const extension of ['png', 'jpg', 'jpeg', 'bmp']) {
    test(`valid BS ${extension.toUpperCase()} is accepted`, async () => {
        const { root, service, canonical, assets } = await readyService(`bs ${extension}`);
        canonical.createCard({ family: 'SPELL', password: '20000001' });
        await writeAsset(root, `20000001-Name-BS-Default.${extension}`);
        const scan = await assets.scan();
        assert.equal(scan.assets[0]?.validAsset, true);
        assert.equal(scan.assets[0]?.role, 'BS');
        await service.close();
    });
}

test('BG accepts PNG/JPG/JPEG/BMP in one recursive scan', async () => {
    const { root, service, canonical, assets } = await readyService('bg formats');
    for (const [index, extension] of ['png', 'jpg', 'jpeg', 'bmp'].entries()) {
        canonical.createCard({ family: 'SPELL', password: `3000000${index}` });
        await writeAsset(root, `nested/${index}/3000000${index}-Name-BG-Default.${extension}`);
    }
    const scan = await assets.scan();
    assert.equal(scan.assets.filter(item => item.validAsset && item.role === 'BG').length, 4);
    await service.close();
});

test('transparent OF PNG is accepted while opaque OF PNG is rejected', async () => {
    const { root, service, canonical, assets } = await readyService('of transparency');
    canonical.createCard({ family: 'SPELL', password: '40000001' });
    canonical.createCard({ family: 'SPELL', password: '40000002' });
    await writeAsset(root, '40000001-Transparent-OF-Default.png', png(0));
    await writeAsset(root, '40000002-Opaque-OF-Default.png', png(255));
    const scan = await assets.scan();
    assert.equal(scan.assets.find(item => item.parsedPassword === '40000001')?.validAsset, true);
    assert.equal(scan.assets.find(item => item.parsedPassword === '40000002')?.validAsset, false);
    assert.equal(scan.diagnostics.some(item => item.code === 'INVALID_OF_TRANSPARENCY'), true);
    await service.close();
});

test('OF rejects JPG/JPEG/BMP as unsupported formats', async () => {
    const { root, service, canonical, assets } = await readyService('of formats');
    for (const [index, extension] of ['jpg', 'jpeg', 'bmp'].entries()) {
        canonical.createCard({ family: 'SPELL', password: `4100000${index}` });
        await writeAsset(root, `4100000${index}-Name-OF-Default.${extension}`);
    }
    const scan = await assets.scan();
    assert.equal(scan.assets.every(item => !item.validAsset), true);
    assert.equal(scan.diagnostics.filter(item => item.code === 'UNSUPPORTED_FORMAT').length, 3);
    await service.close();
});

test('corrupt image creates INVALID_IMAGE and scan continues', async () => {
    const { root, service, canonical, assets } = await readyService('corrupt image');
    canonical.createCard({ family: 'SPELL', password: '42000001' });
    canonical.createCard({ family: 'SPELL', password: '42000002' });
    await writeAsset(root, '42000001-Bad-BS-Default.png', Buffer.from('broken'));
    await writeAsset(root, '42000002-Good-BS-Default.png');
    const scan = await assets.scan();
    assert.equal(scan.diagnostics.some(item => item.code === 'INVALID_IMAGE'), true);
    assert.equal(scan.assets.find(item => item.parsedPassword === '42000002')?.validAsset, true);
    await service.close();
});

test('recursive scan tolerates deep folders, spaces, and Japanese Unicode paths', async () => {
    const { root, service, canonical, assets } = await readyService('paths 日本語');
    canonical.createCard({ family: 'SPELL', password: '43000001' });
    await writeAsset(root, 'Archetypes/氷水/Deep Folder/43000001-Name-BS-Default.png');
    const scan = await assets.scan();
    assert.equal(scan.assets[0]?.relativePath, 'Assets/Archetypes/氷水/Deep Folder/43000001-Name-BS-Default.png');
    assert.equal(scan.assets[0]?.validAsset, true);
    await service.close();
});

test('unique password resolves internal card ID; unknown password stays unresolved without card creation', async () => {
    const { root, service, canonical, assets } = await readyService('password association');
    const card = canonical.createCard({ family: 'SPELL', password: '44000001' });
    await writeAsset(root, '44000001-Known-BS-Default.png');
    await writeAsset(root, '44999999-Unknown-BS-Default.png');
    const scan = await assets.scan();
    assert.equal(scan.assets.find(item => item.parsedPassword === '44000001')?.cardId, card.cardId);
    assert.equal(scan.assets.find(item => item.parsedPassword === '44999999')?.associationState, 'UNRESOLVED');
    assert.equal(scan.diagnostics.some(item => item.code === 'UNRESOLVED_CARD'), true);
    assert.equal(canonical.getCard('44999999'), null);
    await service.close();
});

test('duplicate password matches remain AMBIGUOUS with no arbitrary card selection', async () => {
    const { root, service, canonical, assets } = await readyService('password ambiguous');
    canonical.createCard({ family: 'SPELL', password: '45000001' });
    canonical.createCard({ family: 'TRAP', password: '45000001' });
    await writeAsset(root, '45000001-Ambiguous-BS-Default.png');
    const scan = await assets.scan();
    assert.equal(scan.assets[0]?.associationState, 'AMBIGUOUS');
    assert.equal(scan.assets[0]?.cardId, null);
    assert.equal(scan.diagnostics.some(item => item.code === 'AMBIGUOUS_CARD'), true);
    await service.close();
});

test('passwordless Token normalized name resolves uniquely across underscores/spaces', async () => {
    const { root, service, assets } = await readyService('token unique');
    const token = await tokenWithName(service, 'Icejade Token');
    await writeAsset(root, 'Icejade_Token-BS-Default.png');
    const scan = await assets.scan();
    assert.equal(scan.assets[0]?.associationState, 'RESOLVED');
    assert.equal(scan.assets[0]?.cardId, token.cardId);
    await service.close();
});

test('passwordless Token duplicate normalized names remain AMBIGUOUS', async () => {
    const { root, service, assets } = await readyService('token ambiguous');
    await tokenWithName(service, 'Shared Token');
    await tokenWithName(service, 'Shared Token');
    await writeAsset(root, 'Shared_Token-BS-Default.png');
    const scan = await assets.scan();
    assert.equal(scan.assets[0]?.associationState, 'AMBIGUOUS');
    assert.equal(scan.diagnostics.some(item => item.code === 'AMBIGUOUS_CARD'), true);
    await service.close();
});

test('passwordless draft non-Token is not auto-matched by localized name', async () => {
    const { root, service, canonical, assets } = await readyService('draft non-token');
    const card = canonical.createCard({ family: 'SPELL' });
    canonical.mutateCard(card.cardId, card.revision, {
        localizations: [{ language: 'EN', name: 'Draft Spell', cardText: 'Draft', pendulumText: null }],
    });
    await writeAsset(root, 'Draft_Spell-BS-Default.png');
    const scan = await assets.scan();
    assert.equal(scan.assets[0]?.associationState, 'UNRESOLVED');
    assert.equal(scan.assets[0]?.cardId, null);
    await service.close();
});

test('complex card names parse from the right and folder location remains semantically neutral', async () => {
    const { root, service, canonical, assets } = await readyService('complex filename');
    const card = canonical.createCard({ family: 'SPELL', password: '46000001' });
    await writeAsset(root, 'WrongArchetype/46000001-A-B-Complex_Name-BS-Pose_01.png');
    const scan = await assets.scan();
    assert.equal(scan.assets[0]?.parsedCardName, 'A-B-Complex_Name');
    assert.equal(scan.assets[0]?.variantKey, 'pose_01');
    assert.equal(scan.assets[0]?.cardId, card.cardId);
    await service.close();
});

test('invalid FG role and invalid hyphenated variant produce INVALID_FILENAME diagnostics', async () => {
    const { root, service, canonical, assets } = await readyService('invalid grammar');
    canonical.createCard({ family: 'SPELL', password: '47000001' });
    await writeAsset(root, '47000001-Name-FG-Default.png');
    await writeAsset(root, '47000001-Name-BS-Bad-Variant.png');
    const scan = await assets.scan();
    assert.equal(scan.diagnostics.filter(item => item.code === 'INVALID_FILENAME').length, 2);
    assert.equal(scan.assets.every(item => item.role !== ('FG' as AssetRole)), true);
    await service.close();
});

test('duplicate BS and duplicate OF roles become conflicts with no authoritative binding', async () => {
    const { root, service, canonical, assets } = await readyService('role conflicts');
    const card = canonical.createCard({ family: 'SPELL', password: '48000001' });
    await writeAsset(root, 'one/48000001-Name-BS-Default.png');
    await writeAsset(root, 'two/48000001-Name-BS-default.png');
    await writeAsset(root, 'one/48000001-Name-OF-Default.png', png(0));
    await writeAsset(root, 'two/48000001-Name-OF-default.png', png(0));
    const scan = await assets.scan();
    const variant = scan.variants.find(item => item.cardId === card.cardId);
    assert.ok(variant);
    assert.equal(variant.roles.BS, null);
    assert.equal(variant.roles.OF, null);
    assert.equal(scan.diagnostics.filter(item => item.code === 'ROLE_CONFLICT').length, 4);
    await service.close();
});

test('unchanged rescans are idempotent and retain stable asset/variant IDs', async () => {
    const { root, service, canonical, assets } = await readyService('rescan stable');
    canonical.createCard({ family: 'SPELL', password: '49000001' });
    await writeAsset(root, '49000001-Name-BS-Default.png');
    const first = await assets.scan();
    const second = await assets.scan();
    assert.equal(first.assets.length, second.assets.length);
    assert.equal(first.assets[0]?.assetId, second.assets[0]?.assetId);
    assert.equal(first.variants[0]?.variantId, second.variants[0]?.variantId);
    assert.equal(assets.listAssets().length, 1);
    await service.close();
});

test('modified file reconciles in place with stable asset ID and updated content hash', async () => {
    const { root, service, canonical, assets } = await readyService('modified reconcile');
    canonical.createCard({ family: 'SPELL', password: '50000001' });
    const assetPath = await writeAsset(root, '50000001-Name-BS-Default.png', png(255, [1, 2, 3]));
    const first = await assets.scan();
    await writeFile(assetPath, png(255, [4, 5, 6]));
    const second = await assets.scan();
    assert.equal(first.assets[0]?.assetId, second.assets[0]?.assetId);
    assert.notEqual(first.assets[0]?.contentHash, second.assets[0]?.contentHash);
    await service.close();
});

test('missing source is retained as missing while Canonical card and Art Variant survive', async () => {
    const { root, service, canonical, assets } = await readyService('missing reconcile');
    const card = canonical.createCard({ family: 'SPELL', password: '51000001' });
    const assetPath = await writeAsset(root, '51000001-Name-BS-Default.png');
    const first = await assets.scan();
    assert.equal(first.variants.length, 1);
    await unlink(assetPath);
    const second = await assets.scan();
    assert.equal(second.assets[0]?.present, false);
    assert.equal(second.diagnostics.some(item => item.code === 'MISSING_SOURCE'), true);
    assert.ok(canonical.getCard(card.cardId));
    assert.equal(assets.listVariants(card.cardId).length, 1);
    assert.equal(assets.listVariants(card.cardId)[0]?.roles.BS, null);
    await service.close();
});

test('removing one duplicate role resolves the prior conflict on the next scan', async () => {
    const { root, service, canonical, assets } = await readyService('conflict recovery');
    const card = canonical.createCard({ family: 'SPELL', password: '52000001' });
    await writeAsset(root, 'one/52000001-Name-BS-Default.png');
    const duplicate = await writeAsset(root, 'two/52000001-Name-BS-default.png');
    const first = await assets.scan();
    assert.equal(first.variants.find(item => item.cardId === card.cardId)?.roles.BS, null);
    await unlink(duplicate);
    const second = await assets.scan();
    assert.ok(second.variants.find(item => item.cardId === card.cardId)?.roles.BS);
    assert.equal(second.diagnostics.some(item => item.code === 'ROLE_CONFLICT'), false);
    await service.close();
});

const readinessCase = async (
    label: string,
    roles: AssetRole[],
) => {
    const { root, service, canonical, assets } = await readyService(label);
    const card = canonical.createCard({ family: 'SPELL', password: '53000001' });
    for (const role of roles) {
        await writeAsset(
            root,
            `53000001-Name-${role}-Default.png`,
            role === 'OF' ? png(0) : png(255),
        );
    }
    const scan = await assets.scan();
    const variant = scan.variants.find(item => item.cardId === card.cardId);
    assert.ok(variant);
    return { service, variant };
};

test('BS only gives Standard READY and Overframe INCOMPLETE', async () => {
    const { service, variant } = await readinessCase('readiness bs', ['BS']);
    assert.deepEqual(variant.standard, { state: 'READY', sources: ['BS'] });
    assert.deepEqual(variant.overframe, { state: 'INCOMPLETE', sources: [] });
    await service.close();
});

test('BG + OF gives virtual Standard READY and Overframe READY from BG + OF', async () => {
    const { service, variant } = await readinessCase('readiness bg of', ['BG', 'OF']);
    assert.deepEqual(variant.standard, { state: 'READY', sources: ['BG', 'OF'] });
    assert.deepEqual(variant.overframe, { state: 'READY', sources: ['BG', 'OF'] });
    await service.close();
});

test('BS + OF gives Standard BS and Overframe BS + OF fallback', async () => {
    const { service, variant } = await readinessCase('readiness bs of', ['BS', 'OF']);
    assert.deepEqual(variant.standard, { state: 'READY', sources: ['BS'] });
    assert.deepEqual(variant.overframe, { state: 'READY', sources: ['BS', 'OF'] });
    await service.close();
});

test('OF only leaves both Standard and Overframe INCOMPLETE', async () => {
    const { service, variant } = await readinessCase('readiness of', ['OF']);
    assert.deepEqual(variant.standard, { state: 'INCOMPLETE', sources: [] });
    assert.deepEqual(variant.overframe, { state: 'INCOMPLETE', sources: [] });
    await service.close();
});

test('BS + BG + OF precedence is Standard=BS and Overframe=BG+OF', async () => {
    const { service, variant } = await readinessCase('readiness all', ['BS', 'BG', 'OF']);
    assert.deepEqual(variant.standard, { state: 'READY', sources: ['BS'] });
    assert.deepEqual(variant.overframe, { state: 'READY', sources: ['BG', 'OF'] });
    await service.close();
});

test('source Assets tree remains byte-for-byte and path-for-path unchanged after scan', async () => {
    const { root, service, canonical, assets } = await readyService('source readonly');
    canonical.createCard({ family: 'SPELL', password: '54000001' });
    await writeAsset(root, 'Folder A/日本語/54000001-Name-BS-Default.png');
    const before = await snapshotAssetsTree(root);
    await assets.scan();
    const after = await snapshotAssetsTree(root);
    assert.deepEqual(after, before);
    await service.close();
});

test('failed reconciliation transaction preserves the previous consistent index state', async () => {
    const { root, service, canonical, assets } = await readyService('rollback reconcile');
    canonical.createCard({ family: 'SPELL', password: '55000001' });
    await writeAsset(root, '55000001-Name-BS-Default.png');
    await assets.scan();
    const before = assets.listAssets();
    assert.ok(service.persistence);
    assert.throws(() => service.persistence?.transaction(database => {
        reconcileAssetIndex(database, {
            scanId: '00000000-0000-4000-8000-000000000004',
            startedAt: '2026-10-06T00:00:00.000Z',
            completedAt: '2026-10-06T00:00:01.000Z',
            assets: [],
            scanDiagnostics: [],
        });
        throw new Error('deliberate reconciliation rollback');
    }));
    assert.deepEqual(assets.listAssets(), before);
    await service.close();
});

test('schema-3 Workspace is READY and status endpoint reports database_schema_version 3', async () => {
    const { service } = await readyService('schema3 ready');
    assert.equal(service.status.database_schema_version, 3);
    const response = await service.app.inject({ method: 'GET', url: '/api/v1/workspace/status' });
    assert.equal(response.statusCode, 200);
    assert.equal(response.json().database_schema_version, 3);
    await service.close();
});