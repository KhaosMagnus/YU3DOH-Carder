import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rename, rm, symlink, unlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { deflateSync } from 'node:zlib';
import type { AssetRole } from '../src/assets/types';
import type { CanonicalDomainService } from '../src/canonical/service';
import { bootstrapWorkspaceDatabase } from '../src/persistence/operations';
import { createWorkspaceService, type WorkspaceService } from '../src/service';
import { SUPPORTED_WORKSPACE_FORMAT_VERSION, type WorkspaceManifest } from '../src/workspace/types';
import { buildWorkspaceApp } from '../src/app';
import { assertStructureMappable } from '../src/carder/mapping-precheck';
import { CarderPrepareError } from '../src/carder/errors';

const roots: string[] = [];

const manifest = (): WorkspaceManifest => ({
    workspace_id: 'workspace-run009',
    workspace_format_version: SUPPORTED_WORKSPACE_FORMAT_VERSION,
    database_path: 'Data/workspace.db',
    created_at: '2026-10-07T00:00:00.000Z',
    name: 'RUN 009 Carder Prepare Test Workspace',
});

const tempRoot = async (label: string) => {
    const root = await mkdtemp(path.join(os.tmpdir(), `yu3doh run009 ${label} `));
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
    assert.ok(service.carderPrepare);
    assert.ok(service.persistence);
    return {
        root,
        service,
        canonical: service.canonical,
        assets: service.assets,
        persistence: service.persistence,
    };
};

test.after(async () => {
    await Promise.all(roots.map(root => rm(root, { recursive: true, force: true })));
});

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
const png = (alpha = 255, rgb = [10, 20, 30]) => {
    const header = Buffer.alloc(13);
    header.writeUInt32BE(1, 0); header.writeUInt32BE(1, 4);
    header[8] = 8; header[9] = 6;
    const raw = Buffer.from([0, rgb[0] ?? 0, rgb[1] ?? 0, rgb[2] ?? 0, alpha]);
    return Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        pngChunk('IHDR', header), pngChunk('IDAT', deflateSync(raw)), pngChunk('IEND', Buffer.alloc(0)),
    ]);
};

const registerBasics = (canonical: CanonicalDomainService) => {
    for (const code of ['LIGHT', 'DARK', 'SPELL', 'TRAP']) {
        canonical.registerStructuralCode('ATTRIBUTE', code);
    }
    canonical.registerStructuralCode('RACE', 'DRAGON');
    canonical.registerStructuralCode('RACE', 'WARRIOR');
    for (const ability of ['EFFECT', 'PENDULUM', 'TUNER']) {
        canonical.registerStructuralCode('ABILITY', ability);
    }
    for (const marker of ['TOP_LEFT', 'TOP', 'TOP_RIGHT', 'LEFT', 'RIGHT', 'BOTTOM_LEFT', 'BOTTOM', 'BOTTOM_RIGHT']) {
        canonical.registerStructuralCode('LINK_MARKER', marker);
    }
};

const source = { sourceKind: 'MANUAL', sourceRef: 'run009-test' };

const insertVariantWithRoles = async (
    ctx: Awaited<ReturnType<typeof readyService>>,
    cardId: string,
    variantKey: string,
    roles: AssetRole[],
    options: { unicodePath?: boolean; skipBind?: AssetRole } = {},
) => {
    const variantId = randomUUID();
    const scanId = randomUUID();
    const roleAssets: Record<string, { assetId: string; hash: string; relativePath: string }> = {};
    const timestamp = '2026-10-07T00:00:00.000Z';

    for (const role of roles) {
        const contents = png(role === 'OF' ? 128 : 255, [role.charCodeAt(0), 40, 50]);
        const hash = createHash('sha256').update(contents).digest('hex');
        const relativePath = options.unicodePath
            ? `Assets/Art 日本語/${cardId}/${variantKey}/${role}.png`
            : `Assets/${cardId}/${variantKey}/${role}.png`;
        const absolute = path.join(ctx.root, ...relativePath.split('/'));
        await mkdir(path.dirname(absolute), { recursive: true });
        await writeFile(absolute, contents);
        const assetId = randomUUID();
        roleAssets[role] = { assetId, hash, relativePath };
        ctx.persistence.transaction(database => {
            const existingScan = database.prepare('SELECT 1 FROM asset_index_scans WHERE scan_id = ?').get(scanId);
            if (!existingScan) {
                database.prepare(`
                    INSERT INTO asset_index_scans (
                        scan_id, started_at, completed_at, status,
                        discovered_count, present_count, diagnostic_count
                    ) VALUES (?, ?, ?, 'COMPLETE', 0, 0, 0)
                `).run(scanId, timestamp, timestamp);
            }
            const existingVariant = database.prepare('SELECT 1 FROM art_variants WHERE variant_id = ?').get(variantId);
            if (!existingVariant) {
                database.prepare(`
                    INSERT INTO art_variants (
                        variant_id, card_id, variant_key, display_label, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?)
                `).run(variantId, cardId, variantKey, variantKey, timestamp, timestamp);
            }
            database.prepare(`
                INSERT INTO indexed_asset_files (
                    asset_id, relative_path, file_name, extension, size_bytes, modified_time_ms,
                    content_hash, parsed_card_name, parsed_password, role, variant_label, variant_key,
                    association_state, card_id, variant_id, image_width, image_height, has_transparency,
                    valid_asset, present, first_seen_scan_id, last_seen_scan_id, updated_at
                ) VALUES (?, ?, ?, 'png', ?, 1, ?, NULL, NULL, ?, ?, ?, 'RESOLVED', ?, ?, 10, 20, ?, 1, 1, ?, ?, ?)
            `).run(
                assetId, relativePath, path.basename(relativePath), contents.length, hash,
                role, variantKey, variantKey, cardId, variantId,
                role === 'OF' ? 1 : 0, scanId, scanId, timestamp,
            );
            if (options.skipBind !== role) {
                database.prepare(`
                    INSERT INTO variant_role_bindings (variant_id, role, asset_id)
                    VALUES (?, ?, ?)
                `).run(variantId, role, assetId);
            }
        });
    }
    return { variantId, roleAssets };
};

const confirmMonsterStandard = (
    canonical: CanonicalDomainService,
    password: string,
    language: 'EN' | 'ES' | 'JP' = 'EN',
    extras: { abilities?: string[]; summonKind?: string; pendulum?: number } = {},
) => {
    registerBasics(canonical);
    const card = canonical.createCard({ family: 'MONSTER', password });
    const abilities = extras.abilities ?? ['EFFECT'];
    const summonKind = (extras.summonKind as 'MAIN_DECK' | 'LINK' | 'XYZ') ?? 'MAIN_DECK';
    return canonical.mutateCard(card.cardId, card.revision, {
        structure: {
            kind: 'MONSTER',
            summonKind,
            attributeCode: 'LIGHT',
            raceCode: 'DRAGON',
            level: summonKind === 'XYZ' || summonKind === 'LINK' ? null : 4,
            rank: summonKind === 'XYZ' ? 4 : null,
            atk: 1800,
            def: summonKind === 'LINK' ? null : 1200,
            pendulumScale: extras.pendulum ?? null,
            abilities,
            linkMarkers: summonKind === 'LINK' ? ['TOP', 'LEFT'] : [],
        },
        localizations: [{
            language,
            name: `Name ${language}`,
            cardText: `Text ${language}`,
            pendulumText: extras.pendulum != null ? `Pendulum ${language}` : null,
        }],
        confirmations: [
            { block: 'STRUCTURE', state: 'CONFIRMED', provenance: source },
            { block: `TEXT:${language}`, state: 'CONFIRMED', provenance: source },
        ],
    });
};

const confirmSpell = (
    canonical: CanonicalDomainService,
    password: string,
    language: 'EN' | 'ES' | 'JP',
    subtype: string | null = 'QUICK_PLAY',
) => {
    registerBasics(canonical);
    const card = canonical.createCard({ family: 'SPELL', password });
    return canonical.mutateCard(card.cardId, card.revision, {
        structure: { kind: 'SPELL', subtypeCode: subtype },
        localizations: [{ language, name: `Spell ${language}`, cardText: `Spell text ${language}`, pendulumText: null }],
        confirmations: [
            { block: 'STRUCTURE', state: 'CONFIRMED', provenance: source },
            { block: `TEXT:${language}`, state: 'CONFIRMED', provenance: source },
        ],
    });
};

test('1 happy STANDARD + EN prepare returns semantic DTO with relative URLs', async () => {
    const ctx = await readyService('happy-standard-en');
    const card = confirmMonsterStandard(ctx.canonical, '90000001', 'EN');
    const { variantId, roleAssets } = await insertVariantWithRoles(ctx, card.cardId, 'std', ['BS']);
    const response = await ctx.service.app.inject({
        method: 'POST',
        url: '/api/v1/carder/prepare-working-card',
        payload: {
            card_id: card.cardId,
            variant_id: variantId,
            composition: 'STANDARD',
            content_language: 'EN',
            expected_revision: card.revision,
        },
    });
    assert.equal(response.statusCode, 200, response.body);
    const body = response.json();
    assert.equal(body.identity.card_id, card.cardId);
    assert.equal(body.identity.composition, 'STANDARD');
    assert.equal(body.identity.content_language, 'EN');
    assert.equal(body.localized.name, 'Name EN');
    assert.equal(body.structure.family, 'MONSTER');
    assert.deepEqual(body.artwork.sources, ['BS']);
    assert.ok(roleAssets.BS);
    assert.equal(body.artwork.assets[0].asset_id, roleAssets.BS.assetId);
    assert.equal(body.artwork.assets[0].content_url, `/api/v1/carder/assets/${roleAssets.BS.assetId}/content?hash=${roleAssets.BS.hash}`);
    assert.equal(body.artwork.assets[0].content_url.includes('file:'), false);
    assert.equal(body.artwork.assets[0].content_url.includes('\\'), false);
    assert.equal(JSON.stringify(body).includes(ctx.root), false);
    await ctx.service.close();
});

test('2 happy OVERFRAME + ES', async () => {
    const ctx = await readyService('happy-overframe-es');
    const card = confirmSpell(ctx.canonical, '90000002', 'ES', 'NORMAL');
    const { variantId } = await insertVariantWithRoles(ctx, card.cardId, 'of', ['BG', 'OF']);
    const response = await ctx.service.app.inject({
        method: 'POST',
        url: '/api/v1/carder/prepare-working-card',
        payload: {
            card_id: card.cardId,
            variant_id: variantId,
            composition: 'OVERFRAME',
            content_language: 'ES',
            expected_revision: card.revision,
        },
    });
    assert.equal(response.statusCode, 200, response.body);
    const body = response.json();
    assert.equal(body.identity.content_language, 'ES');
    assert.equal(body.localized.name, 'Spell ES');
    assert.deepEqual(body.artwork.sources, ['BG', 'OF']);
    await ctx.service.close();
});

test('3 happy JP language', async () => {
    const ctx = await readyService('happy-jp');
    const card = confirmMonsterStandard(ctx.canonical, '90000003', 'JP');
    const { variantId } = await insertVariantWithRoles(ctx, card.cardId, 'jp', ['BS']);
    const response = await ctx.service.app.inject({
        method: 'POST',
        url: '/api/v1/carder/prepare-working-card',
        payload: {
            card_id: card.cardId,
            variant_id: variantId,
            composition: 'STANDARD',
            content_language: 'JP',
            expected_revision: card.revision,
        },
    });
    assert.equal(response.statusCode, 200, response.body);
    assert.equal(response.json().localized.name, 'Name JP');
    await ctx.service.close();
});

test('4 503 when Workspace not READY', async () => {
    const app = buildWorkspaceApp({
        workspace_id: null,
        name: null,
        workspace_format_version: null,
        database_schema_version: null,
        state: 'MISSING_MANIFEST',
        read_only: true,
        health_summary: 'not ready',
    } as never, { carderPrepare: null });
    const response = await app.inject({
        method: 'POST',
        url: '/api/v1/carder/prepare-working-card',
        payload: {
            card_id: 'x',
            variant_id: 'y',
            composition: 'STANDARD',
            content_language: 'EN',
            expected_revision: '1',
        },
    });
    assert.equal(response.statusCode, 503);
    assert.equal(response.json().code, 'WORKSPACE_NOT_READY');
    await app.close();
});

test('5 422 STRUCTURE missing confirmation', async () => {
    const ctx = await readyService('structure-missing');
    registerBasics(ctx.canonical);
    const card = ctx.canonical.createCard({ family: 'SPELL', password: '90000005' });
    const mutated = ctx.canonical.mutateCard(card.cardId, card.revision, {
        structure: { kind: 'SPELL', subtypeCode: 'NORMAL' },
        localizations: [{ language: 'EN', name: 'A', cardText: 'B', pendulumText: null }],
        confirmations: [{ block: 'TEXT:EN', state: 'CONFIRMED', provenance: source }],
    });
    const { variantId } = await insertVariantWithRoles(ctx, mutated.cardId, 's', ['BS']);
    const response = await ctx.service.app.inject({
        method: 'POST',
        url: '/api/v1/carder/prepare-working-card',
        payload: {
            card_id: mutated.cardId,
            variant_id: variantId,
            composition: 'STANDARD',
            content_language: 'EN',
            expected_revision: mutated.revision,
        },
    });
    assert.equal(response.statusCode, 422);
    assert.equal(response.json().code, 'CARDER_PREPARATION_NOT_READY');
    await ctx.service.close();
});

test('6/12 422 TEXT:EN missing while ES confirmed — no language fallback', async () => {
    const ctx = await readyService('text-en-missing');
    registerBasics(ctx.canonical);
    const card = ctx.canonical.createCard({ family: 'SPELL', password: '90000006' });
    const mutated = ctx.canonical.mutateCard(card.cardId, card.revision, {
        structure: { kind: 'SPELL', subtypeCode: 'NORMAL' },
        localizations: [
            { language: 'ES', name: 'ES Name', cardText: 'ES Text', pendulumText: null },
            { language: 'EN', name: 'EN Name', cardText: 'EN Text', pendulumText: null },
        ],
        confirmations: [
            { block: 'STRUCTURE', state: 'CONFIRMED', provenance: source },
            { block: 'TEXT:ES', state: 'CONFIRMED', provenance: source },
        ],
    });
    const { variantId } = await insertVariantWithRoles(ctx, mutated.cardId, 's', ['BS']);
    const response = await ctx.service.app.inject({
        method: 'POST',
        url: '/api/v1/carder/prepare-working-card',
        payload: {
            card_id: mutated.cardId,
            variant_id: variantId,
            composition: 'STANDARD',
            content_language: 'EN',
            expected_revision: mutated.revision,
        },
    });
    assert.equal(response.statusCode, 422);
    assert.equal(response.json().code, 'CARDER_PREPARATION_NOT_READY');
    assert.match(response.json().message, /TEXT:EN/);
    await ctx.service.close();
});

test('7 422 TEXT:JP missing', async () => {
    const ctx = await readyService('text-jp-missing');
    const card = confirmSpell(ctx.canonical, '90000007', 'EN');
    const { variantId } = await insertVariantWithRoles(ctx, card.cardId, 's', ['BS']);
    const response = await ctx.service.app.inject({
        method: 'POST',
        url: '/api/v1/carder/prepare-working-card',
        payload: {
            card_id: card.cardId,
            variant_id: variantId,
            composition: 'STANDARD',
            content_language: 'JP',
            expected_revision: card.revision,
        },
    });
    assert.equal(response.statusCode, 422);
    assert.equal(response.json().code, 'CARDER_PREPARATION_NOT_READY');
    await ctx.service.close();
});

test('8 409 revision mismatch', async () => {
    const ctx = await readyService('revision-mismatch');
    const card = confirmSpell(ctx.canonical, '90000008', 'EN');
    const { variantId } = await insertVariantWithRoles(ctx, card.cardId, 's', ['BS']);
    const response = await ctx.service.app.inject({
        method: 'POST',
        url: '/api/v1/carder/prepare-working-card',
        payload: {
            card_id: card.cardId,
            variant_id: variantId,
            composition: 'STANDARD',
            content_language: 'EN',
            expected_revision: '999',
        },
    });
    assert.equal(response.statusCode, 409);
    assert.equal(response.json().code, 'REVISION_CONFLICT');
    await ctx.service.close();
});

test('9 404 variant belongs to wrong card', async () => {
    const ctx = await readyService('variant-wrong-card');
    const cardA = confirmSpell(ctx.canonical, '90000009', 'EN');
    const cardB = confirmSpell(ctx.canonical, '90000010', 'EN');
    const { variantId } = await insertVariantWithRoles(ctx, cardA.cardId, 's', ['BS']);
    const response = await ctx.service.app.inject({
        method: 'POST',
        url: '/api/v1/carder/prepare-working-card',
        payload: {
            card_id: cardB.cardId,
            variant_id: variantId,
            composition: 'STANDARD',
            content_language: 'EN',
            expected_revision: cardB.revision,
        },
    });
    assert.equal(response.statusCode, 404);
    assert.equal(response.json().code, 'NOT_FOUND');
    await ctx.service.close();
});

test('10 422 Standard not READY', async () => {
    const ctx = await readyService('standard-not-ready');
    const card = confirmSpell(ctx.canonical, '90000011', 'EN');
    const { variantId } = await insertVariantWithRoles(ctx, card.cardId, 'incomplete', ['OF']);
    const response = await ctx.service.app.inject({
        method: 'POST',
        url: '/api/v1/carder/prepare-working-card',
        payload: {
            card_id: card.cardId,
            variant_id: variantId,
            composition: 'STANDARD',
            content_language: 'EN',
            expected_revision: card.revision,
        },
    });
    assert.equal(response.statusCode, 422);
    assert.equal(response.json().code, 'CARDER_PREPARATION_NOT_READY');
    await ctx.service.close();
});

test('11 422 Overframe not READY', async () => {
    const ctx = await readyService('overframe-not-ready');
    const card = confirmSpell(ctx.canonical, '90000012', 'EN');
    const { variantId } = await insertVariantWithRoles(ctx, card.cardId, 'bsonly', ['BS']);
    const response = await ctx.service.app.inject({
        method: 'POST',
        url: '/api/v1/carder/prepare-working-card',
        payload: {
            card_id: card.cardId,
            variant_id: variantId,
            composition: 'OVERFRAME',
            content_language: 'EN',
            expected_revision: card.revision,
        },
    });
    assert.equal(response.statusCode, 422);
    assert.equal(response.json().code, 'CARDER_PREPARATION_NOT_READY');
    await ctx.service.close();
});

test('13/14 DTO relative URLs only and excludes filesystem paths', async () => {
    const ctx = await readyService('dto-urls');
    const card = confirmSpell(ctx.canonical, '90000013', 'EN');
    const { variantId } = await insertVariantWithRoles(ctx, card.cardId, 'u', ['BS'], { unicodePath: true });
    const response = await ctx.service.app.inject({
        method: 'POST',
        url: '/api/v1/carder/prepare-working-card',
        payload: {
            card_id: card.cardId,
            variant_id: variantId,
            composition: 'STANDARD',
            content_language: 'EN',
            expected_revision: card.revision,
        },
    });
    assert.equal(response.statusCode, 200, response.body);
    const serialized = JSON.stringify(response.json());
    assert.equal(serialized.includes('file://'), false);
    assert.equal(serialized.includes(ctx.root), false);
    assert.equal(serialized.includes('Assets/Art'), false);
    assert.match(response.json().artwork.assets[0].content_url, /^\/api\/v1\/carder\/assets\//);
    await ctx.service.close();
});

test('15 asset content 200 with matching hash + 18 no-store', async () => {
    const ctx = await readyService('asset-content-200');
    const card = confirmSpell(ctx.canonical, '90000015', 'EN');
    const { roleAssets } = await insertVariantWithRoles(ctx, card.cardId, 'c', ['BS'], { unicodePath: true });
    const asset = roleAssets.BS;
    assert.ok(asset);
    const response = await ctx.service.app.inject({
        method: 'GET',
        url: `/api/v1/carder/assets/${asset.assetId}/content?hash=${asset.hash}`,
    });
    assert.equal(response.statusCode, 200, response.body);
    assert.equal(response.headers['cache-control'], 'no-store');
    assert.match(String(response.headers['content-type']), /image\/png/);
    assert.equal(createHash('sha256').update(response.rawPayload).digest('hex'), asset.hash);
    await ctx.service.close();
});

test('16 asset content 409 ASSET_STALE on hash mismatch', async () => {
    const ctx = await readyService('asset-stale');
    const card = confirmSpell(ctx.canonical, '90000016', 'EN');
    const { roleAssets } = await insertVariantWithRoles(ctx, card.cardId, 'c', ['BS']);
    assert.ok(roleAssets.BS);
    const response = await ctx.service.app.inject({
        method: 'GET',
        url: `/api/v1/carder/assets/${roleAssets.BS.assetId}/content?hash=deadbeef`,
    });
    assert.equal(response.statusCode, 409);
    assert.equal(response.json().code, 'ASSET_STALE');
    await ctx.service.close();
});

test('17 asset content rejects path-like inputs', async () => {
    const ctx = await readyService('asset-path-reject');
    const card = confirmSpell(ctx.canonical, '90000017', 'EN');
    const { roleAssets } = await insertVariantWithRoles(ctx, card.cardId, 'c', ['BS']);
    assert.ok(roleAssets.BS);
    const response = await ctx.service.app.inject({
        method: 'GET',
        url: `/api/v1/carder/assets/${roleAssets.BS.assetId}/content?hash=${roleAssets.BS.hash}&path=Assets/evil.png`,
    });
    assert.equal(response.statusCode, 409);
    assert.equal(response.json().code, 'ASSET_STALE');
    await ctx.service.close();
});

test('19/20 prepare does not call rescan and does not mutate Canonical', async () => {
    const ctx = await readyService('no-mutate');
    const card = confirmSpell(ctx.canonical, '90000020', 'EN');
    const before = ctx.canonical.getCard(card.cardId)!;
    const { variantId } = await insertVariantWithRoles(ctx, card.cardId, 'c', ['BS']);
    const scansBefore = ctx.persistence.runRepositoryOperation(database =>
        (database.prepare('SELECT COUNT(*) AS count FROM asset_index_scans').get() as { count: number }).count);
    const response = await ctx.service.app.inject({
        method: 'POST',
        url: '/api/v1/carder/prepare-working-card',
        payload: {
            card_id: card.cardId,
            variant_id: variantId,
            composition: 'STANDARD',
            content_language: 'EN',
            expected_revision: card.revision,
        },
    });
    assert.equal(response.statusCode, 200, response.body);
    const after = ctx.canonical.getCard(card.cardId)!;
    assert.equal(after.revision, before.revision);
    assert.deepEqual(after.confirmations, before.confirmations);
    const scansAfter = ctx.persistence.runRepositoryOperation(database =>
        (database.prepare('SELECT COUNT(*) AS count FROM asset_index_scans').get() as { count: number }).count);
    assert.equal(scansAfter, scansBefore);
    await ctx.service.close();
});

test('21 idempotent re-prepare re-checks gates', async () => {
    const ctx = await readyService('idempotent');
    const card = confirmSpell(ctx.canonical, '90000021', 'EN');
    const { variantId } = await insertVariantWithRoles(ctx, card.cardId, 'c', ['BS']);
    const payload = {
        card_id: card.cardId,
        variant_id: variantId,
        composition: 'STANDARD' as const,
        content_language: 'EN' as const,
        expected_revision: card.revision,
    };
    const first = await ctx.service.app.inject({ method: 'POST', url: '/api/v1/carder/prepare-working-card', payload });
    const second = await ctx.service.app.inject({ method: 'POST', url: '/api/v1/carder/prepare-working-card', payload });
    assert.equal(first.statusCode, 200);
    assert.equal(second.statusCode, 200);
    assert.deepEqual(first.json().identity, second.json().identity);
    const stale = await ctx.service.app.inject({
        method: 'POST',
        url: '/api/v1/carder/prepare-working-card',
        payload: { ...payload, expected_revision: '0' },
    });
    assert.equal(stale.statusCode, 409);
    await ctx.service.close();
});

test('22 STANDARD BG+OF readiness path', async () => {
    const ctx = await readyService('standard-bgof');
    const card = confirmSpell(ctx.canonical, '90000022', 'EN');
    const { variantId } = await insertVariantWithRoles(ctx, card.cardId, 'bgof', ['BG', 'OF']);
    const response = await ctx.service.app.inject({
        method: 'POST',
        url: '/api/v1/carder/prepare-working-card',
        payload: {
            card_id: card.cardId,
            variant_id: variantId,
            composition: 'STANDARD',
            content_language: 'EN',
            expected_revision: card.revision,
        },
    });
    assert.equal(response.statusCode, 200, response.body);
    assert.deepEqual(response.json().artwork.sources, ['BG', 'OF']);
    await ctx.service.close();
});

test('23 OVERFRAME BS+OF readiness path', async () => {
    const ctx = await readyService('overframe-bsof');
    const card = confirmSpell(ctx.canonical, '90000023', 'EN');
    const { variantId } = await insertVariantWithRoles(ctx, card.cardId, 'bsof', ['BS', 'OF']);
    const response = await ctx.service.app.inject({
        method: 'POST',
        url: '/api/v1/carder/prepare-working-card',
        payload: {
            card_id: card.cardId,
            variant_id: variantId,
            composition: 'OVERFRAME',
            content_language: 'EN',
            expected_revision: card.revision,
        },
    });
    assert.equal(response.statusCode, 200, response.body);
    assert.deepEqual(response.json().artwork.sources, ['BS', 'OF']);
    await ctx.service.close();
});

test('24 422 mapping unsupported for null monster summon_kind', async () => {
    const ctx = await readyService('unsupported-summon');
    registerBasics(ctx.canonical);
    const card = ctx.canonical.createCard({ family: 'MONSTER', password: '90000024' });
    // Persist draft with null summon then force confirm via direct DB would violate domain —
    // instead mutate with MAIN_DECK then manually corrupt via DB for gate coverage.
    const drafted = ctx.canonical.mutateCard(card.cardId, card.revision, {
        structure: {
            kind: 'MONSTER',
            summonKind: 'MAIN_DECK',
            attributeCode: 'LIGHT',
            raceCode: 'DRAGON',
            level: 4,
            rank: null,
            atk: 1000,
            def: 1000,
            pendulumScale: null,
            abilities: ['EFFECT'],
            linkMarkers: [],
        },
        localizations: [{ language: 'EN', name: 'X', cardText: 'Y', pendulumText: null }],
        confirmations: [
            { block: 'STRUCTURE', state: 'CONFIRMED', provenance: source },
            { block: 'TEXT:EN', state: 'CONFIRMED', provenance: source },
        ],
    });
    ctx.persistence.transaction(database => {
        database.prepare('UPDATE canonical_monster_structure SET summon_kind = NULL WHERE card_id = ?')
            .run(drafted.cardId);
    });
    const { variantId } = await insertVariantWithRoles(ctx, drafted.cardId, 's', ['BS']);
    const response = await ctx.service.app.inject({
        method: 'POST',
        url: '/api/v1/carder/prepare-working-card',
        payload: {
            card_id: drafted.cardId,
            variant_id: variantId,
            composition: 'STANDARD',
            content_language: 'EN',
            expected_revision: drafted.revision,
        },
    });
    assert.equal(response.statusCode, 422);
    assert.equal(response.json().code, 'CARDER_MAPPING_UNSUPPORTED');
    await ctx.service.close();
});

test('25 404 missing card', async () => {
    const ctx = await readyService('missing-card');
    const response = await ctx.service.app.inject({
        method: 'POST',
        url: '/api/v1/carder/prepare-working-card',
        payload: {
            card_id: randomUUID(),
            variant_id: randomUUID(),
            composition: 'STANDARD',
            content_language: 'EN',
            expected_revision: '1',
        },
    });
    assert.equal(response.statusCode, 404);
    await ctx.service.close();
});

test('26 asset content 503 when not READY', async () => {
    const app = buildWorkspaceApp({
        workspace_id: null,
        name: null,
        workspace_format_version: null,
        database_schema_version: null,
        state: 'MISSING_MANIFEST',
        read_only: true,
        health_summary: 'not ready',
    } as never, {});
    const response = await app.inject({
        method: 'GET',
        url: '/api/v1/carder/assets/abc/content?hash=fff',
    });
    assert.equal(response.statusCode, 503);
    await app.close();
});

test('27 pendulum structure included in DTO', async () => {
    const ctx = await readyService('pendulum-dto');
    const card = confirmMonsterStandard(ctx.canonical, '90000027', 'EN', {
        abilities: ['EFFECT', 'PENDULUM'],
        pendulum: 7,
    });
    const { variantId } = await insertVariantWithRoles(ctx, card.cardId, 'p', ['BS']);
    const response = await ctx.service.app.inject({
        method: 'POST',
        url: '/api/v1/carder/prepare-working-card',
        payload: {
            card_id: card.cardId,
            variant_id: variantId,
            composition: 'STANDARD',
            content_language: 'EN',
            expected_revision: card.revision,
        },
    });
    assert.equal(response.statusCode, 200, response.body);
    assert.equal(response.json().structure.pendulum_scale, 7);
    assert.equal(response.json().localized.pendulum_text, 'Pendulum EN');
    await ctx.service.close();
});

test('28 link markers and rating in DTO', async () => {
    const ctx = await readyService('link-dto');
    const card = confirmMonsterStandard(ctx.canonical, '90000028', 'EN', { summonKind: 'LINK' });
    const { variantId } = await insertVariantWithRoles(ctx, card.cardId, 'l', ['BS']);
    const response = await ctx.service.app.inject({
        method: 'POST',
        url: '/api/v1/carder/prepare-working-card',
        payload: {
            card_id: card.cardId,
            variant_id: variantId,
            composition: 'STANDARD',
            content_language: 'EN',
            expected_revision: card.revision,
        },
    });
    assert.equal(response.statusCode, 200, response.body);
    assert.deepEqual([...response.json().structure.link_markers].sort(), ['LEFT', 'TOP']);
    assert.equal(response.json().structure.link_rating, 2);
    await ctx.service.close();
});

test('29 missing hash query yields ASSET_STALE', async () => {
    const ctx = await readyService('missing-hash');
    const card = confirmSpell(ctx.canonical, '90000029', 'EN');
    const { roleAssets } = await insertVariantWithRoles(ctx, card.cardId, 'c', ['BS']);
    assert.ok(roleAssets.BS);
    const response = await ctx.service.app.inject({
        method: 'GET',
        url: `/api/v1/carder/assets/${roleAssets.BS.assetId}/content`,
    });
    assert.equal(response.statusCode, 409);
    assert.equal(response.json().code, 'ASSET_STALE');
    await ctx.service.close();
});

test('30 token family prepare supported', async () => {
    const ctx = await readyService('token-prepare');
    registerBasics(ctx.canonical);
    const token = ctx.canonical.createCard({ family: 'TOKEN' });
    const confirmed = ctx.canonical.mutateCard(token.cardId, token.revision, {
        structure: {
            kind: 'TOKEN',
            attributeCode: 'LIGHT',
            raceCode: 'DRAGON',
            level: 1,
            atk: '?',
            def: 0,
        },
        localizations: [{ language: 'EN', name: 'Token', cardText: 'Token text', pendulumText: null }],
        confirmations: [
            { block: 'STRUCTURE', state: 'CONFIRMED', provenance: source },
            { block: 'TEXT:EN', state: 'CONFIRMED', provenance: source },
        ],
    });
    const { variantId } = await insertVariantWithRoles(ctx, confirmed.cardId, 't', ['BS']);
    const response = await ctx.service.app.inject({
        method: 'POST',
        url: '/api/v1/carder/prepare-working-card',
        payload: {
            card_id: confirmed.cardId,
            variant_id: variantId,
            composition: 'STANDARD',
            content_language: 'EN',
            expected_revision: confirmed.revision,
        },
    });
    assert.equal(response.statusCode, 200, response.body);
    assert.equal(response.json().structure.family, 'TOKEN');
    await ctx.service.close();
});

// ---------- RUN 009 External QA correction: B-01..B-14 ----------

const sha256 = (buffer: Buffer) => createHash('sha256').update(buffer).digest('hex');

const externalDir = async (label: string) => {
    const dir = await mkdtemp(path.join(os.tmpdir(), `yu3doh run009 ext ${label} `));
    roots.push(dir);
    return dir;
};

const dirLinkType = process.platform === 'win32' ? 'junction' : 'dir';

const getContent = (ctx: Awaited<ReturnType<typeof readyService>>, assetId: string, hash: string) =>
    ctx.service.app.inject({
        method: 'GET',
        url: `/api/v1/carder/assets/${assetId}/content?hash=${hash}`,
    });

const assertStale = (response: { statusCode: number; json: () => { code: string }; headers: Record<string, unknown> }) => {
    assert.equal(response.statusCode, 409);
    assert.equal(response.json().code, 'ASSET_STALE');
    assert.doesNotMatch(String(response.headers['content-type'] ?? ''), /^image\//);
};

const updateIndexedRow = (
    ctx: Awaited<ReturnType<typeof readyService>>,
    assetId: string,
    fields: { relative_path?: string; extension?: string; content_hash?: string },
) => {
    ctx.persistence.transaction(database => {
        if (fields.relative_path !== undefined) {
            database.prepare('UPDATE indexed_asset_files SET relative_path = ? WHERE asset_id = ?')
                .run(fields.relative_path, assetId);
        }
        if (fields.extension !== undefined) {
            database.prepare('UPDATE indexed_asset_files SET extension = ? WHERE asset_id = ?')
                .run(fields.extension, assetId);
        }
        if (fields.content_hash !== undefined) {
            database.prepare('UPDATE indexed_asset_files SET content_hash = ? WHERE asset_id = ?')
                .run(fields.content_hash, assetId);
        }
    });
};

test('B-01 regression A→B without Rescan: old URL 409 ASSET_STALE and B bytes not served', async () => {
    const ctx = await readyService('b01-stale-bytes');
    const password = '90001001';
    const card = confirmSpell(ctx.canonical, password, 'EN');
    const assetA = png(255, [11, 22, 33]);
    const assetB = png(255, [200, 100, 50]);
    assert.notEqual(sha256(assetA), sha256(assetB));
    const relative = path.join('Assets', `${password}-Spell-BS-Default.png`);
    const absolute = path.join(ctx.root, relative);
    await mkdir(path.dirname(absolute), { recursive: true });
    await writeFile(absolute, assetA);
    // (1) real index of asset A
    await ctx.assets.scan();
    const variantId = ctx.persistence.runRepositoryOperation(database =>
        (database.prepare('SELECT variant_id FROM art_variants WHERE card_id = ?').get(card.cardId) as { variant_id: string }).variant_id);
    assert.ok(variantId);
    // (2) prepare → content_url with hash A
    const prepared = await ctx.service.app.inject({
        method: 'POST',
        url: '/api/v1/carder/prepare-working-card',
        payload: {
            card_id: card.cardId,
            variant_id: variantId,
            composition: 'STANDARD',
            content_language: 'EN',
            expected_revision: card.revision,
        },
    });
    assert.equal(prepared.statusCode, 200, prepared.body);
    const contentUrl: string = prepared.json().artwork.assets[0].content_url;
    assert.ok(contentUrl.endsWith(`hash=${sha256(assetA)}`));
    const okA = await ctx.service.app.inject({ method: 'GET', url: contentUrl });
    assert.equal(okA.statusCode, 200);
    assert.equal(sha256(okA.rawPayload), sha256(assetA));

    const scansBefore = ctx.persistence.runRepositoryOperation(database =>
        (database.prepare('SELECT COUNT(*) AS count FROM asset_index_scans').get() as { count: number }).count);
    const rowBefore = ctx.persistence.runRepositoryOperation(database =>
        database.prepare('SELECT * FROM indexed_asset_files WHERE card_id = ?').get(card.cardId));

    // (3) overwrite physically with valid different image B; (4) NO Rescan
    await writeFile(absolute, assetB);
    assert.equal(sha256(await readFile(absolute)), sha256(assetB));

    // (5) GET old URL
    const stale = await ctx.service.app.inject({ method: 'GET', url: contentUrl });
    // (6) 409 ASSET_STALE
    assertStale(stale);
    // (7) bytes B were not served
    assert.equal(stale.rawPayload.includes(assetB), false);
    assert.notEqual(sha256(stale.rawPayload), sha256(assetB));

    const scansAfter = ctx.persistence.runRepositoryOperation(database =>
        (database.prepare('SELECT COUNT(*) AS count FROM asset_index_scans').get() as { count: number }).count);
    const rowAfter = ctx.persistence.runRepositoryOperation(database =>
        database.prepare('SELECT * FROM indexed_asset_files WHERE card_id = ?').get(card.cardId));
    assert.equal(scansAfter, scansBefore);
    assert.deepEqual(rowAfter, rowBefore);
    await ctx.service.close();
});

test('B-02 hash matches but decode fails → 409', async () => {
    const ctx = await readyService('b02-decode');
    const card = confirmSpell(ctx.canonical, '90001002', 'EN');
    const { roleAssets } = await insertVariantWithRoles(ctx, card.cardId, 'c', ['BS']);
    const asset = roleAssets.BS!;
    const corrupt = Buffer.from('not-a-valid-png-but-hash-matches');
    await writeFile(path.join(ctx.root, ...asset.relativePath.split('/')), corrupt);
    updateIndexedRow(ctx, asset.assetId, { content_hash: sha256(corrupt) });
    assertStale(await getContent(ctx, asset.assetId, sha256(corrupt)));
    await ctx.service.close();
});

test('B-03 OF role with opaque PNG and matching hash → 409', async () => {
    const ctx = await readyService('b03-of-opaque');
    const card = confirmSpell(ctx.canonical, '90001003', 'EN');
    const { roleAssets } = await insertVariantWithRoles(ctx, card.cardId, 'c', ['BG', 'OF']);
    const asset = roleAssets.OF!;
    const opaque = png(255, [1, 2, 3]);
    await writeFile(path.join(ctx.root, ...asset.relativePath.split('/')), opaque);
    updateIndexedRow(ctx, asset.assetId, { content_hash: sha256(opaque) });
    assertStale(await getContent(ctx, asset.assetId, sha256(opaque)));
    await ctx.service.close();
});

test('B-04 unsupported format for role (OF + .jpg/.bmp) with matching hash → 409', async () => {
    const ctx = await readyService('b04-format');
    const card = confirmSpell(ctx.canonical, '90001004', 'EN');
    const { roleAssets } = await insertVariantWithRoles(ctx, card.cardId, 'c', ['BG', 'OF']);
    const asset = roleAssets.OF!;
    for (const ext of ['jpg', 'bmp']) {
        const original = path.join(ctx.root, ...asset.relativePath.split('/'));
        const nextRelative = asset.relativePath.replace(/\.[a-z]+$/i, `.${ext}`);
        const next = path.join(ctx.root, ...nextRelative.split('/'));
        await rename(original, next);
        updateIndexedRow(ctx, asset.assetId, { relative_path: nextRelative, extension: ext });
        assertStale(await getContent(ctx, asset.assetId, asset.hash));
        await rename(next, original);
        updateIndexedRow(ctx, asset.assetId, { relative_path: asset.relativePath, extension: 'png' });
    }
    await ctx.service.close();
});

test('B-05 file deleted after index → 409; happy path sha256 + Content-Length', async () => {
    const ctx = await readyService('b05-deleted');
    const card = confirmSpell(ctx.canonical, '90001005', 'EN');
    const { roleAssets } = await insertVariantWithRoles(ctx, card.cardId, 'c', ['BS']);
    const asset = roleAssets.BS!;
    const ok = await getContent(ctx, asset.assetId, asset.hash);
    assert.equal(ok.statusCode, 200);
    assert.equal(sha256(ok.rawPayload), asset.hash);
    assert.equal(Number(ok.headers['content-length']), ok.rawPayload.length);
    await unlink(path.join(ctx.root, ...asset.relativePath.split('/')));
    assertStale(await getContent(ctx, asset.assetId, asset.hash));
    await ctx.service.close();
});

test('B-06 intermediate dir symlink/junction to external identical bytes → 409', async () => {
    const ctx = await readyService('b06-mid-link');
    const card = confirmSpell(ctx.canonical, '90001006', 'EN');
    const { roleAssets } = await insertVariantWithRoles(ctx, card.cardId, 'c', ['BS']);
    const asset = roleAssets.BS!;
    // Assets/<cardId>/c/BS.png → move "c" outside root and link it back.
    const variantDir = path.join(ctx.root, 'Assets', card.cardId, 'c');
    const ext = await externalDir('b06');
    const externalVariant = path.join(ext, 'c');
    await rename(variantDir, externalVariant);
    await symlink(externalVariant, variantDir, dirLinkType);
    // Bytes reachable through the link are identical — the hash alone would pass.
    assert.equal(sha256(await readFile(path.join(variantDir, 'BS.png'))), asset.hash);
    assertStale(await getContent(ctx, asset.assetId, asset.hash));
    await ctx.service.close();
});

test('B-07 final file symlink to external identical file → 409', async t => {
    const ctx = await readyService('b07-file-link');
    const card = confirmSpell(ctx.canonical, '90001007', 'EN');
    const { roleAssets } = await insertVariantWithRoles(ctx, card.cardId, 'c', ['BS']);
    const asset = roleAssets.BS!;
    const file = path.join(ctx.root, ...asset.relativePath.split('/'));
    const ext = await externalDir('b07');
    const externalFile = path.join(ext, 'BS.png');
    await rename(file, externalFile);
    try {
        await symlink(externalFile, file, 'file');
    } catch (error) {
        const code = (error as { code?: string }).code;
        if (process.platform === 'win32' && code === 'EPERM') {
            await ctx.service.close();
            t.skip('Windows lacks privilege for file symlinks (EPERM); junction coverage is B-10.');
            return;
        }
        throw error;
    }
    assert.equal(sha256(await readFile(file)), asset.hash);
    assertStale(await getContent(ctx, asset.assetId, asset.hash));
    await ctx.service.close();
});

test('B-08 Assets ancestor is symlink/junction → 409', async () => {
    const ctx = await readyService('b08-assets-link');
    const card = confirmSpell(ctx.canonical, '90001008', 'EN');
    const { roleAssets } = await insertVariantWithRoles(ctx, card.cardId, 'c', ['BS']);
    const asset = roleAssets.BS!;
    const assetsDir = path.join(ctx.root, 'Assets');
    const ext = await externalDir('b08');
    const externalAssets = path.join(ext, 'Assets');
    await rename(assetsDir, externalAssets);
    await symlink(externalAssets, assetsDir, dirLinkType);
    assert.equal(sha256(await readFile(path.join(ctx.root, ...asset.relativePath.split('/')))), asset.hash);
    assertStale(await getContent(ctx, asset.assetId, asset.hash));
    await ctx.service.close();
});

test('B-09 relative_path with .. segment → 409', async () => {
    const ctx = await readyService('b09-dotdot');
    const card = confirmSpell(ctx.canonical, '90001009', 'EN');
    const { roleAssets } = await insertVariantWithRoles(ctx, card.cardId, 'c', ['BS']);
    const asset = roleAssets.BS!;
    await mkdir(path.join(ctx.root, 'Assets', 'x'), { recursive: true });
    // Lexically resolves to the real file, but contains '..'.
    updateIndexedRow(ctx, asset.assetId, { relative_path: `Assets/x/../${card.cardId}/c/BS.png` });
    assertStale(await getContent(ctx, asset.assetId, asset.hash));
    // Escaping the root.
    const ext = await externalDir('b09');
    await writeFile(path.join(ext, 'BS.png'), await readFile(path.join(ctx.root, ...asset.relativePath.split('/'))));
    updateIndexedRow(ctx, asset.assetId, { relative_path: `../${path.basename(ext)}/BS.png` });
    assertStale(await getContent(ctx, asset.assetId, asset.hash));
    await ctx.service.close();
});

test('B-10 Windows junction in a path component → 409 (runs on windows-latest)', async () => {
    const ctx = await readyService('b10-junction');
    const card = confirmSpell(ctx.canonical, '90001010', 'EN');
    const { roleAssets } = await insertVariantWithRoles(ctx, card.cardId, 'c', ['BS']);
    const asset = roleAssets.BS!;
    const cardDir = path.join(ctx.root, 'Assets', card.cardId);
    const ext = await externalDir('b10');
    const externalCard = path.join(ext, card.cardId);
    await rename(cardDir, externalCard);
    // 'junction' needs no privilege on Windows; on POSIX the type is ignored (dir symlink).
    await symlink(externalCard, cardDir, 'junction');
    assert.equal(sha256(await readFile(path.join(ctx.root, ...asset.relativePath.split('/')))), asset.hash);
    assertStale(await getContent(ctx, asset.assetId, asset.hash));
    console.log(`B-10 junction executed on platform=${process.platform}`);
    await ctx.service.close();
});

const prepareMonster = async (
    label: string,
    password: string,
    abilities: string[],
) => {
    const ctx = await readyService(label);
    ctx.canonical.registerStructuralCode('ABILITY', 'NORMAL');
    const card = confirmMonsterStandard(ctx.canonical, password, 'EN', { abilities });
    const { variantId } = await insertVariantWithRoles(ctx, card.cardId, 'm', ['BS']);
    const response = await ctx.service.app.inject({
        method: 'POST',
        url: '/api/v1/carder/prepare-working-card',
        payload: {
            card_id: card.cardId,
            variant_id: variantId,
            composition: 'STANDARD',
            content_language: 'EN',
            expected_revision: card.revision,
        },
    });
    return { ctx, response };
};

test('B-11 MAIN_DECK NORMAL+EFFECT → 422 CARDER_MAPPING_UNSUPPORTED', async () => {
    const { ctx, response } = await prepareMonster('b11-normal-effect', '90001011', ['NORMAL', 'EFFECT']);
    assert.equal(response.statusCode, 422, response.body);
    assert.equal(response.json().code, 'CARDER_MAPPING_UNSUPPORTED');
    await ctx.service.close();
});

test('B-12 MAIN_DECK TUNER only (no NORMAL/EFFECT) → 422 CARDER_MAPPING_UNSUPPORTED', async () => {
    const { ctx, response } = await prepareMonster('b12-tuner-only', '90001012', ['TUNER']);
    assert.equal(response.statusCode, 422, response.body);
    assert.equal(response.json().code, 'CARDER_MAPPING_UNSUPPORTED');
    await ctx.service.close();
});

test('B-13 MAIN_DECK NORMAL → 200 with NORMAL in DTO abilities', async () => {
    const { ctx, response } = await prepareMonster('b13-normal', '90001013', ['NORMAL']);
    assert.equal(response.statusCode, 200, response.body);
    assert.ok(response.json().structure.abilities.includes('NORMAL'));
    await ctx.service.close();
});

test('B-14 assertStructureMappable LINK rating null / mismatch → CARDER_MAPPING_UNSUPPORTED', () => {
    const base = {
        kind: 'MONSTER' as const,
        summonKind: 'LINK' as const,
        attributeCode: 'DARK',
        raceCode: 'DRAGON',
        level: null,
        rank: null,
        atk: 1000,
        def: null,
        pendulumScale: null,
        abilities: ['EFFECT'],
        linkMarkers: ['TOP', 'LEFT'],
    };
    const isUnsupported = (error: unknown) =>
        error instanceof CarderPrepareError && error.code === 'CARDER_MAPPING_UNSUPPORTED';
    assert.throws(() => assertStructureMappable('MONSTER', { ...base, linkRating: null }), isUnsupported);
    assert.throws(() => assertStructureMappable('MONSTER', { ...base, linkRating: 3 }), isUnsupported);
    assert.throws(() => assertStructureMappable('MONSTER', { ...base, linkRating: 0, linkMarkers: [] }), isUnsupported);
    assert.doesNotThrow(() => assertStructureMappable('MONSTER', { ...base, linkRating: 2 }));
});
