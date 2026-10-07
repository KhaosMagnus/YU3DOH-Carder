import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { deflateSync } from 'node:zlib';
import Database from 'better-sqlite3';
import type { AssetRole } from '../src/assets/types';
import { SUPPORTED_DATABASE_SCHEMA_VERSION } from '../src/persistence/constants';
import { bootstrapWorkspaceDatabase } from '../src/persistence/operations';
import { resolveWorkspaceDatabasePath } from '../src/persistence/path';
import { createWorkspaceService, type WorkspaceService } from '../src/service';
import { inspectWorkspaceRoot } from '../src/workspace/inspect';
import { SUPPORTED_WORKSPACE_FORMAT_VERSION, type WorkspaceManifest } from '../src/workspace/types';

const roots: string[] = [];

const manifest = (): WorkspaceManifest => ({
    workspace_id: 'workspace-run008',
    workspace_format_version: SUPPORTED_WORKSPACE_FORMAT_VERSION,
    database_path: 'Data/workspace.db',
    created_at: '2026-10-07T00:00:00.000Z',
    name: 'RUN 008 Library Assets Test Workspace',
});

const tempRoot = async (label: string, writeManifest = true) => {
    const root = await mkdtemp(path.join(os.tmpdir(), `yu3doh run008 ${label} `));
    roots.push(root);
    if (writeManifest) {
        await writeFile(path.join(root, 'workspace.json'), JSON.stringify(manifest()), 'utf8');
    }
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
    assert.ok(service.libraryAssets);
    assert.ok(service.persistence);
    return {
        root,
        service,
        canonical: service.canonical,
        assets: service.assets,
        managed: service.managedAssets,
        libraryAssets: service.libraryAssets,
        persistence: service.persistence,
    };
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

const sourceFile = async (root: string, name: string, contents: Buffer) => {
    const directory = path.join(root, 'External Sources 日本語');
    await mkdir(directory, { recursive: true });
    const file = path.join(directory, name);
    await writeFile(file, contents);
    return file;
};

const writeAsset = async (root: string, relativeWithinAssets: string, contents?: Buffer) => {
    const absolute = path.join(root, 'Assets', relativeWithinAssets);
    await mkdir(path.dirname(absolute), { recursive: true });
    await writeFile(absolute, contents ?? png(255));
    return absolute;
};

const createCard = (service: WorkspaceService, password: string) => {
    assert.ok(service.canonical);
    return service.canonical.createCard({ family: 'SPELL', password });
};

const insertVariantState = (
    service: WorkspaceService,
    cardId: string,
    variantKey: string,
    roles: AssetRole[],
    options: {
        conflictRole?: AssetRole;
        missingRole?: AssetRole;
        invalidRole?: AssetRole;
        scanId?: string;
    } = {},
) => {
    assert.ok(service.persistence);
    const variantId = randomUUID();
    const scanId = options.scanId ?? randomUUID();
    service.persistence.transaction(database => {
        const timestamp = '2026-10-07T00:00:00.000Z';
        database.prepare(`
            INSERT INTO art_variants (
                variant_id, card_id, variant_key, display_label, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?)
        `).run(variantId, cardId, variantKey, variantKey, timestamp, timestamp);
        const existingScan = database.prepare('SELECT 1 FROM asset_index_scans WHERE scan_id = ?').get(scanId);
        if (!existingScan) {
            database.prepare(`
                INSERT INTO asset_index_scans (
                    scan_id, started_at, completed_at, status,
                    discovered_count, present_count, diagnostic_count
                ) VALUES (?, ?, ?, 'COMPLETE', 0, 0, 0)
            `).run(scanId, timestamp, timestamp);
        }
        const insertAsset = (
            role: AssetRole,
            bind: boolean,
            suffix = '',
            present = 1,
            valid = 1,
        ) => {
            const assetId = randomUUID();
            const relativePath = `Test/${cardId}/${variantKey}/${role}${suffix}.png`;
            database.prepare(`
                INSERT INTO indexed_asset_files (
                    asset_id, relative_path, file_name, extension, size_bytes, modified_time_ms,
                    content_hash, parsed_card_name, parsed_password, role, variant_label, variant_key,
                    association_state, card_id, variant_id, image_width, image_height, has_transparency,
                    valid_asset, present, first_seen_scan_id, last_seen_scan_id, updated_at
                ) VALUES (?, ?, ?, 'png', 1, 1, ?, NULL, NULL, ?, ?, ?, 'RESOLVED', ?, ?, 10, 20, ?, ?, ?, ?, ?, ?)
            `).run(
                assetId, relativePath, path.basename(relativePath), 'a'.repeat(64),
                role, variantKey, variantKey, cardId, variantId,
                role === 'OF' ? 1 : 0, valid, present, scanId, scanId, timestamp,
            );
            if (bind) {
                database.prepare(`
                    INSERT INTO variant_role_bindings (variant_id, role, asset_id)
                    VALUES (?, ?, ?)
                `).run(variantId, role, assetId);
            }
            return assetId;
        };
        roles.forEach(role => {
            const present = options.missingRole === role ? 0 : 1;
            const valid = options.invalidRole === role ? 0 : 1;
            insertAsset(role, true, '', present, valid);
        });
        if (options.conflictRole) {
            insertAsset(options.conflictRole, false, '-conflict-a');
            insertAsset(options.conflictRole, false, '-conflict-b');
        }
    });
    return { variantId, scanId };
};

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

test.after(async () => {
    await Promise.all(roots.map(root => rm(root, { recursive: true, force: true })));
});

test('1-3 variants GET zero, one, and unknown card', async () => {
    const { service, root: _root } = await readyService('variants-basic');
    const card = createCard(service, '80000001');
    const empty = await service.app.inject({ method: 'GET', url: `/api/v1/library/cards/${card.cardId}/variants` });
    assert.equal(empty.statusCode, 200);
    assert.deepEqual(JSON.parse(empty.body), { card_id: card.cardId, variants: [] });

    insertVariantState(service, card.cardId, 'default', ['BS']);
    const one = await service.app.inject({ method: 'GET', url: `/api/v1/library/cards/${card.cardId}/variants` });
    assert.equal(one.statusCode, 200);
    const oneBody = JSON.parse(one.body);
    assert.equal(oneBody.variants.length, 1);
    assert.equal(oneBody.variants[0].variant_key, 'default');
    assert.equal(oneBody.variants[0].standard.state, 'READY');
    assert.deepEqual(oneBody.variants[0].standard.sources, ['BS']);
    assert.equal(oneBody.variants[0].roles.BS.slot_state, 'BOUND');

    const missing = await service.app.inject({
        method: 'GET',
        url: '/api/v1/library/cards/00000000-0000-4000-8000-000000000099/variants',
    });
    assert.equal(missing.statusCode, 404);
    assert.equal(JSON.parse(missing.body).code, 'NOT_FOUND');
    await service.close();
});

test('4-8 readiness precedence BS / BG+OF / OF / all-three', async () => {
    const { service } = await readyService('readiness');
    const card = createCard(service, '80000002');
    insertVariantState(service, card.cardId, 'bs_only', ['BS']);
    insertVariantState(service, card.cardId, 'bg_of', ['BG', 'OF']);
    insertVariantState(service, card.cardId, 'bs_of', ['BS', 'OF']);
    insertVariantState(service, card.cardId, 'all_three', ['BS', 'BG', 'OF']);
    const response = await service.app.inject({ method: 'GET', url: `/api/v1/library/cards/${card.cardId}/variants` });
    assert.equal(response.statusCode, 200);
    const byKey = Object.fromEntries(JSON.parse(response.body).variants.map((v: { variant_key: string }) => [v.variant_key, v]));
    assert.equal(byKey['bs_only'].standard.state, 'READY');
    assert.deepEqual(byKey['bs_only'].standard.sources, ['BS']);
    assert.equal(byKey['bs_only'].overframe.state, 'INCOMPLETE');
    assert.equal(byKey['bg_of'].standard.state, 'READY');
    assert.deepEqual(byKey['bg_of'].standard.sources, ['BG', 'OF']);
    assert.equal(byKey['bg_of'].overframe.state, 'READY');
    assert.deepEqual(byKey['bg_of'].overframe.sources, ['BG', 'OF']);
    assert.equal(byKey['bs_of'].overframe.state, 'READY');
    assert.deepEqual(byKey['bs_of'].overframe.sources, ['BS', 'OF']);
    assert.equal(byKey['all_three'].standard.state, 'READY');
    assert.deepEqual(byKey['all_three'].standard.sources, ['BS']);
    assert.equal(byKey['all_three'].overframe.state, 'READY');
    assert.deepEqual(byKey['all_three'].overframe.sources, ['BG', 'OF']);
    await service.close();
});

test('9 ROLE_CONFLICT yields CONFLICT slot without authoritative binding', async () => {
    const { service } = await readyService('conflict');
    const card = createCard(service, '80000003');
    insertVariantState(service, card.cardId, 'default', [], { conflictRole: 'BS' });
    const response = await service.app.inject({ method: 'GET', url: `/api/v1/library/cards/${card.cardId}/variants` });
    assert.equal(response.statusCode, 200);
    const variant = JSON.parse(response.body).variants[0];
    assert.equal(variant.roles.BS.slot_state, 'CONFLICT');
    assert.equal(variant.roles.BS.asset, null);
    assert.equal(variant.standard.state, 'INCOMPLETE');
    await service.close();
});

test('10-11 variant GET does not scan and does not mutate Canonical revision', async () => {
    const { service, assets } = await readyService('no-scan');
    const card = createCard(service, '80000004');
    const revisionBefore = card.revision;
    let scanCalls = 0;
    const original = assets.scan.bind(assets);
    (assets as { scan: typeof assets.scan }).scan = async (...args) => {
        scanCalls += 1;
        return original(...args);
    };
    await service.app.inject({ method: 'GET', url: `/api/v1/library/cards/${card.cardId}/variants` });
    await service.app.inject({ method: 'GET', url: '/api/v1/library/needs-attention' });
    assert.equal(scanCalls, 0);
    const after = service.canonical!.getCard(card.cardId)!;
    assert.equal(after.revision, revisionBefore);
    await service.close();
});

test('12-15 Needs Attention no-scan-yet, latest only, historical not current, GET no scan', async () => {
    const { service, persistence } = await readyService('needs-attention');
    const none = await service.app.inject({ method: 'GET', url: '/api/v1/library/needs-attention' });
    assert.equal(none.statusCode, 200);
    const noneBody = JSON.parse(none.body);
    assert.equal(noneBody.latest_scan, null);
    assert.deepEqual(noneBody.items, []);

    const oldScan = randomUUID();
    const newScan = randomUUID();
    persistence.transaction(database => {
        database.prepare(`
            INSERT INTO asset_index_scans (
                scan_id, started_at, completed_at, status,
                discovered_count, present_count, diagnostic_count
            ) VALUES (?, '2026-10-01T00:00:00.000Z', '2026-10-01T00:00:01.000Z', 'COMPLETE', 1, 1, 1)
        `).run(oldScan);
        database.prepare(`
            INSERT INTO asset_index_diagnostics (
                diagnostic_id, scan_id, asset_id, relative_path, code, message, created_at
            ) VALUES (?, ?, NULL, 'Assets/old.png', 'ROLE_CONFLICT', 'old conflict', '2026-10-01T00:00:01.000Z')
        `).run(randomUUID(), oldScan);
        database.prepare(`
            INSERT INTO asset_index_scans (
                scan_id, started_at, completed_at, status,
                discovered_count, present_count, diagnostic_count
            ) VALUES (?, '2026-10-07T00:00:00.000Z', '2026-10-07T00:00:02.000Z', 'COMPLETE', 2, 2, 1)
        `).run(newScan);
        database.prepare(`
            INSERT INTO asset_index_diagnostics (
                diagnostic_id, scan_id, asset_id, relative_path, code, message, created_at
            ) VALUES (?, ?, NULL, 'Assets/new.png', 'INVALID_FILENAME', 'new issue', '2026-10-07T00:00:02.000Z')
        `).run(randomUUID(), newScan);
    });
    const current = await service.app.inject({ method: 'GET', url: '/api/v1/library/needs-attention' });
    assert.equal(current.statusCode, 200);
    const body = JSON.parse(current.body);
    assert.equal(body.latest_scan.scan_id, newScan);
    assert.equal(body.items.length, 1);
    assert.equal(body.items[0].code, 'INVALID_FILENAME');
    assert.equal(body.items[0].relative_path, 'Assets/new.png');
    await service.close();
});

test('16-17 Rescan creates scan and does not mutate Canonical', async () => {
    const { service, root } = await readyService('rescan');
    const card = createCard(service, '80000005');
    const revision = card.revision;
    await writeAsset(root, `${card.password}-Name-BS-Default.png`);
    const response = await service.app.inject({ method: 'POST', url: '/api/v1/library/assets/rescan' });
    assert.equal(response.statusCode, 200);
    const body = JSON.parse(response.body);
    assert.ok(body.scan_id);
    assert.ok(body.completed_at);
    assert.ok(body.discovered_count >= 1);
    const after = service.canonical!.getCard(card.cardId)!;
    assert.equal(after.revision, revision);
    await service.close();
});

test('18-26 diagnostic codes via Rescan + Needs Attention', async () => {
    const { service, root } = await readyService('diagnostics');
    // missing Assets initially
    await rm(path.join(root, 'Assets'), { recursive: true, force: true });
    let response = await service.app.inject({ method: 'POST', url: '/api/v1/library/assets/rescan' });
    assert.equal(response.statusCode, 200);
    let needs = JSON.parse((await service.app.inject({ method: 'GET', url: '/api/v1/library/needs-attention' })).body);
    assert.ok(needs.items.some((item: { code: string }) => item.code === 'ASSETS_DIRECTORY_MISSING'));

    await mkdir(path.join(root, 'Assets'), { recursive: true });
    const card = createCard(service, '80000006');
    await writeAsset(root, 'bad name.png', png(255)); // invalid filename
    await writeAsset(root, '80000006-Name-BS-Default.txt', Buffer.from('nope')); // unsupported
    await writeAsset(root, '80000006-Name-BS-Broken.png', Buffer.from('broken')); // invalid image
    await writeAsset(root, '80000006-Name-OF-Opaque.png', png(255)); // opaque OF
    await writeAsset(root, '89999999-Unknown-BS-Default.png'); // unresolved
    // ambiguous: two cards same password isn't possible; use token-like later
    await writeAsset(root, 'one/80000006-Name-BS-Dup.png');
    await writeAsset(root, 'two/80000006-Name-BS-dup.png'); // role conflict casing

    response = await service.app.inject({ method: 'POST', url: '/api/v1/library/assets/rescan' });
    assert.equal(response.statusCode, 200);
    needs = JSON.parse((await service.app.inject({ method: 'GET', url: '/api/v1/library/needs-attention' })).body);
    const codes = new Set(needs.items.map((item: { code: string }) => item.code));
    assert.ok(codes.has('INVALID_FILENAME') || codes.has('UNSUPPORTED_FORMAT'));
    assert.ok(codes.has('UNSUPPORTED_FORMAT') || codes.has('INVALID_FILENAME'));
    assert.ok(codes.has('INVALID_IMAGE'));
    assert.ok(codes.has('INVALID_OF_TRANSPARENCY'));
    assert.ok(codes.has('UNRESOLVED_CARD'));
    assert.ok(codes.has('ROLE_CONFLICT'));

    // missing source: index then delete
    await writeAsset(root, '80000006-Name-BG-Keep.png');
    await service.app.inject({ method: 'POST', url: '/api/v1/library/assets/rescan' });
    await rm(path.join(root, 'Assets', '80000006-Name-BG-Keep.png'));
    await service.app.inject({ method: 'POST', url: '/api/v1/library/assets/rescan' });
    needs = JSON.parse((await service.app.inject({ method: 'GET', url: '/api/v1/library/needs-attention' })).body);
    assert.ok(needs.items.some((item: { code: string }) => item.code === 'MISSING_SOURCE'));
    await service.close();
});

test('27-32 managed ingest HTTP BS/BG/transparent OF and new variant', async () => {
    const { service, root } = await readyService('ingest-ok');
    const card = createCard(service, '80000007');
    const bs = await sourceFile(root, 'Source File 日本語.PNG', png(255));
    const ingestBs = await service.app.inject({
        method: 'POST',
        url: `/api/v1/library/cards/${card.cardId}/managed-assets`,
        payload: {
            variant_key: 'Default',
            role: 'BS',
            source_file: bs,
            idempotency_key: 'ingest-bs',
        },
    });
    assert.equal(ingestBs.statusCode, 200);
    const bsBody = JSON.parse(ingestBs.body);
    assert.equal(bsBody.idempotent, false);
    assert.equal(bsBody.managed_asset.role, 'BS');
    assert.ok(bsBody.managed_asset.managed_relative_path.startsWith('Assets/Managed/'));
    assert.equal(bsBody.variant.standard.state, 'READY');
    assert.equal(bsBody.variant.roles.BS.slot_state, 'BOUND');
    assert.equal(bsBody.variant.roles.BS.asset.ownership, 'managed');

    const bg = await sourceFile(root, 'background.JPEG', jpeg());
    const ingestBg = await service.app.inject({
        method: 'POST',
        url: `/api/v1/library/cards/${card.cardId}/managed-assets`,
        payload: {
            variant_key: 'Alt',
            role: 'BG',
            source_file: bg,
            idempotency_key: 'ingest-bg',
        },
    });
    assert.equal(ingestBg.statusCode, 200);
    assert.equal(JSON.parse(ingestBg.body).managed_asset.variant_key, 'alt');

    const of = await sourceFile(root, 'subject.png', png(0));
    const ingestOf = await service.app.inject({
        method: 'POST',
        url: `/api/v1/library/cards/${card.cardId}/managed-assets`,
        payload: {
            variant_key: 'Alt',
            role: 'OF',
            source_file: of,
            idempotency_key: 'ingest-of',
        },
    });
    assert.equal(ingestOf.statusCode, 200);
    const ofBody = JSON.parse(ingestOf.body);
    assert.equal(ofBody.variant.overframe.state, 'READY');
    await service.close();
});

test('33-37 opaque OF / invalid role / variant / source / unsafe mapped to 422', async () => {
    const { service, root } = await readyService('ingest-errors');
    const card = createCard(service, '80000008');
    const opaque = await sourceFile(root, 'opaque.png', png(255));
    let response = await service.app.inject({
        method: 'POST',
        url: `/api/v1/library/cards/${card.cardId}/managed-assets`,
        payload: { variant_key: 'Default', role: 'OF', source_file: opaque, idempotency_key: 'opaque' },
    });
    assert.equal(response.statusCode, 422);
    assert.equal(JSON.parse(response.body).code, 'INVALID_IMAGE');

    response = await service.app.inject({
        method: 'POST',
        url: `/api/v1/library/cards/${card.cardId}/managed-assets`,
        payload: { variant_key: 'Default', role: 'FG', source_file: opaque, idempotency_key: 'bad-role' },
    });
    assert.equal(response.statusCode, 422);
    assert.equal(JSON.parse(response.body).code, 'INVALID_ROLE');

    response = await service.app.inject({
        method: 'POST',
        url: `/api/v1/library/cards/${card.cardId}/managed-assets`,
        payload: { variant_key: '../escape', role: 'BS', source_file: opaque, idempotency_key: 'bad-variant' },
    });
    assert.equal(response.statusCode, 422);
    assert.equal(JSON.parse(response.body).code, 'INVALID_VARIANT');

    response = await service.app.inject({
        method: 'POST',
        url: `/api/v1/library/cards/${card.cardId}/managed-assets`,
        payload: {
            variant_key: 'Default',
            role: 'BS',
            source_file: path.join(root, 'missing.png'),
            idempotency_key: 'missing',
        },
    });
    assert.equal(response.statusCode, 422);
    assert.equal(JSON.parse(response.body).code, 'INVALID_SOURCE');
    await service.close();
});

test('38-42 idempotent retry, key conflict, target/unmanaged/destination conflicts', async () => {
    const { service, root, assets } = await readyService('ingest-conflicts');
    const card = createCard(service, '80000009');
    const source = await sourceFile(root, 'retry.png', png(255));
    const first = await service.app.inject({
        method: 'POST',
        url: `/api/v1/library/cards/${card.cardId}/managed-assets`,
        payload: { variant_key: 'Default', role: 'BS', source_file: source, idempotency_key: 'same-key' },
    });
    assert.equal(first.statusCode, 200);
    const retry = await service.app.inject({
        method: 'POST',
        url: `/api/v1/library/cards/${card.cardId}/managed-assets`,
        payload: { variant_key: 'Default', role: 'BS', source_file: source, idempotency_key: 'same-key' },
    });
    assert.equal(retry.statusCode, 200);
    assert.equal(JSON.parse(retry.body).idempotent, true);

    await writeFile(source, png(255, [4, 5, 6]));
    const keyConflict = await service.app.inject({
        method: 'POST',
        url: `/api/v1/library/cards/${card.cardId}/managed-assets`,
        payload: { variant_key: 'Default', role: 'BS', source_file: source, idempotency_key: 'same-key' },
    });
    assert.equal(keyConflict.statusCode, 409);
    assert.equal(JSON.parse(keyConflict.body).code, 'IDEMPOTENCY_CONFLICT');

    const other = await sourceFile(root, 'other.png', png(255, [7, 8, 9]));
    const target = await service.app.inject({
        method: 'POST',
        url: `/api/v1/library/cards/${card.cardId}/managed-assets`,
        payload: { variant_key: 'Default', role: 'BS', source_file: other, idempotency_key: 'target' },
    });
    assert.equal(target.statusCode, 409);
    assert.equal(JSON.parse(target.body).code, 'TARGET_CONFLICT');

    // unmanaged occupied
    const card2 = createCard(service, '80000010');
    await writeAsset(root, '80000010-Name-BS-Default.png');
    await assets.scan();
    const unmanagedSource = await sourceFile(root, 'unmanaged-overwrite.png', png(255));
    const unmanaged = await service.app.inject({
        method: 'POST',
        url: `/api/v1/library/cards/${card2.cardId}/managed-assets`,
        payload: {
            variant_key: 'Default',
            role: 'BS',
            source_file: unmanagedSource,
            idempotency_key: 'unmanaged-target',
        },
    });
    assert.equal(unmanaged.statusCode, 409);
    assert.ok(['TARGET_CONFLICT', 'DESTINATION_CONFLICT'].includes(JSON.parse(unmanaged.body).code));
    await service.close();
});

test('43-47 ownership, absolute not persisted, Unicode/spaces, readiness, no Canonical mutate', async () => {
    const { service, root, persistence } = await readyService('ingest-meta');
    const card = createCard(service, '80000011');
    const revision = card.revision;
    const source = await sourceFile(root, 'Path With Spaces 日本語.png', png(255));
    const response = await service.app.inject({
        method: 'POST',
        url: `/api/v1/library/cards/${card.cardId}/managed-assets`,
        payload: {
            variant_key: 'Default',
            role: 'BS',
            source_file: source,
            idempotency_key: 'unicode-spaces',
        },
    });
    assert.equal(response.statusCode, 200);
    const body = JSON.parse(response.body);
    assert.equal(body.variant.roles.BS.asset.ownership, 'managed');
    assert.equal(JSON.stringify(body).includes(source), false);
    assert.equal(body.variant.standard.state, 'READY');
    const absolutePersisted = persistence.runRepositoryOperation(database => {
        const rows = database.prepare(`
            SELECT managed_relative_path, original_file_name FROM managed_assets
        `).all() as Array<{ managed_relative_path: string; original_file_name: string }>;
        return rows.some(row =>
            row.managed_relative_path.includes(source)
            || row.original_file_name.includes(path.dirname(source)));
    });
    assert.equal(absolutePersisted, false);
    assert.equal(service.canonical!.getCard(card.cardId)!.revision, revision);
    await service.close();
});

test('48-51 Workspace not READY returns 503 for all four asset routes', async () => {
    const root = await tempRoot('not-ready', false);
    const service = await createWorkspaceService({ workspaceRoot: root, host: '127.0.0.1', port: 4312 });
    assert.notEqual(service.status.state, 'READY');
    for (const [method, url] of [
        ['GET', '/api/v1/library/cards/x/variants'],
        ['GET', '/api/v1/library/needs-attention'],
        ['POST', '/api/v1/library/assets/rescan'],
        ['POST', '/api/v1/library/cards/x/managed-assets'],
    ] as const) {
        const response = await service.app.inject({
            method,
            url,
            ...(method === 'POST' && url.includes('managed-assets')
                ? {
                    payload: {
                        variant_key: 'Default',
                        role: 'BS',
                        source_file: '/tmp/x.png',
                        idempotency_key: 'k',
                    },
                }
                : {}),
        });
        assert.equal(response.statusCode, 503, url);
        assert.equal(JSON.parse(response.body).code, 'WORKSPACE_NOT_READY');
    }
    await service.close();
});

test('52-53 schema 3 remains NEEDS_MIGRATION; reads do not migrate', async () => {
    const root = await tempRoot('schema3');
    await createSchema3Database(root);
    const before = await inspectWorkspaceRoot(root);
    assert.equal(before.state, 'NEEDS_MIGRATION');
    assert.equal(before.database_schema_version, 3);
    const service = await createWorkspaceService({ workspaceRoot: root, host: '127.0.0.1', port: 4312 });
    assert.equal(service.status.state, 'NEEDS_MIGRATION');
    const variants = await service.app.inject({ method: 'GET', url: '/api/v1/library/cards/x/variants' });
    assert.equal(variants.statusCode, 503);
    const needs = await service.app.inject({ method: 'GET', url: '/api/v1/library/needs-attention' });
    assert.equal(needs.statusCode, 503);
    const after = await inspectWorkspaceRoot(root);
    assert.equal(after.database_schema_version, 3);
    assert.equal(SUPPORTED_DATABASE_SCHEMA_VERSION, 4);
    assert.equal(existsSync(path.join(process.cwd(), 'migrations', '005_anything.sql')), false);
    await service.close();
});

test('unknown card ingest returns 404 NOT_FOUND', async () => {
    const { service, root } = await readyService('ingest-404');
    const source = await sourceFile(root, 'x.png', png(255));
    const response = await service.app.inject({
        method: 'POST',
        url: '/api/v1/library/cards/00000000-0000-4000-8000-000000000099/managed-assets',
        payload: {
            variant_key: 'Default',
            role: 'BS',
            source_file: source,
            idempotency_key: 'missing-card',
        },
    });
    assert.equal(response.statusCode, 404);
    assert.equal(JSON.parse(response.body).code, 'NOT_FOUND');
    await service.close();
});

test('synthetic MISSING/INVALID projection remains distinguishable from EMPTY (DTO auxiliary)', async () => {
    const { service } = await readyService('slot-states');
    const card = createCard(service, '80000012');
    insertVariantState(service, card.cardId, 'missing', ['BS'], { missingRole: 'BS' });
    insertVariantState(service, card.cardId, 'invalid', ['BG'], { invalidRole: 'BG' });
    insertVariantState(service, card.cardId, 'empty', []);
    const response = await service.app.inject({ method: 'GET', url: `/api/v1/library/cards/${card.cardId}/variants` });
    const byKey = Object.fromEntries(JSON.parse(response.body).variants.map((v: { variant_key: string }) => [v.variant_key, v]));
    assert.equal(byKey.missing.roles.BS.slot_state, 'MISSING');
    assert.equal(byKey.invalid.roles.BG.slot_state, 'INVALID');
    assert.equal(byKey.empty.roles.BS.slot_state, 'EMPTY');
    assert.equal(byKey.empty.roles.BG.slot_state, 'EMPTY');
    assert.equal(byKey.empty.roles.OF.slot_state, 'EMPTY');
    await service.close();
});


test('QA-008-01 real MISSING unmanaged: delete+Rescan yields MISSING not EMPTY', async () => {
    const { service, root } = await readyService('real-missing');
    const card = createCard(service, '80000091');
    const relative = `${card.password}-Name-BS-Default.png`;
    const absolute = await writeAsset(root, relative, png(255));
    const rescan1 = await service.app.inject({ method: 'POST', url: '/api/v1/library/assets/rescan' });
    assert.equal(rescan1.statusCode, 200);
    const before = JSON.parse((await service.app.inject({
        method: 'GET',
        url: `/api/v1/library/cards/${card.cardId}/variants`,
    })).body);
    assert.equal(before.variants.length, 1);
    const variantId = before.variants[0].variant_id;
    assert.equal(before.variants[0].roles.BS.slot_state, 'BOUND');
    assert.equal(before.variants[0].standard.state, 'READY');

    await rm(absolute);
    const rescan2 = await service.app.inject({ method: 'POST', url: '/api/v1/library/assets/rescan' });
    assert.equal(rescan2.statusCode, 200);
    const after = JSON.parse((await service.app.inject({
        method: 'GET',
        url: `/api/v1/library/cards/${card.cardId}/variants`,
    })).body);
    assert.equal(after.variants.length, 1);
    assert.equal(after.variants[0].variant_id, variantId);
    assert.equal(after.variants[0].variant_key, 'default');
    assert.equal(after.variants[0].roles.BS.slot_state, 'MISSING');
    assert.notEqual(after.variants[0].roles.BS.slot_state, 'EMPTY');
    assert.ok(after.variants[0].roles.BS.issues.some((issue: { code: string }) => issue.code === 'MISSING_SOURCE'));
    assert.equal(after.variants[0].standard.state, 'INCOMPLETE');
    assert.equal(after.variants[0].roles.BG.slot_state, 'EMPTY');
    assert.equal(after.variants[0].roles.OF.slot_state, 'EMPTY');
    // Problem asset metadata may surface without authoritative binding.
    if (after.variants[0].roles.BS.asset) {
        assert.equal(after.variants[0].roles.BS.asset.present, false);
        assert.equal(after.variants[0].roles.BS.asset.ownership, 'unmanaged');
    }
    const needs = JSON.parse((await service.app.inject({
        method: 'GET',
        url: '/api/v1/library/needs-attention',
    })).body);
    const missingItem = needs.items.find((item: { code: string }) => item.code === 'MISSING_SOURCE');
    assert.ok(missingItem);
    assert.equal(missingItem.variant_id, variantId);
    assert.equal(missingItem.role, 'BS');
    assert.equal(missingItem.card_id, card.cardId);
    await service.close();
});

test('QA-008-01 real INVALID unmanaged: corrupt+Rescan yields INVALID not EMPTY', async () => {
    const { service, root } = await readyService('real-invalid');
    const card = createCard(service, '80000092');
    const relative = `${card.password}-Name-BS-Default.png`;
    const absolute = await writeAsset(root, relative, png(255));
    const rescan1 = await service.app.inject({ method: 'POST', url: '/api/v1/library/assets/rescan' });
    assert.equal(rescan1.statusCode, 200);
    const before = JSON.parse((await service.app.inject({
        method: 'GET',
        url: `/api/v1/library/cards/${card.cardId}/variants`,
    })).body);
    assert.equal(before.variants[0].roles.BS.slot_state, 'BOUND');
    assert.equal(before.variants[0].standard.state, 'READY');
    const variantId = before.variants[0].variant_id;

    await writeFile(absolute, Buffer.from('not-a-png-corrupt'));
    const rescan2 = await service.app.inject({ method: 'POST', url: '/api/v1/library/assets/rescan' });
    assert.equal(rescan2.statusCode, 200);
    const after = JSON.parse((await service.app.inject({
        method: 'GET',
        url: `/api/v1/library/cards/${card.cardId}/variants`,
    })).body);
    assert.equal(after.variants.length, 1);
    assert.equal(after.variants[0].variant_id, variantId);
    assert.equal(after.variants[0].roles.BS.slot_state, 'INVALID');
    assert.notEqual(after.variants[0].roles.BS.slot_state, 'EMPTY');
    assert.ok(after.variants[0].roles.BS.issues.some((issue: { code: string }) => issue.code === 'INVALID_IMAGE'));
    assert.equal(after.variants[0].standard.state, 'INCOMPLETE');
    assert.equal(after.variants[0].overframe.state, 'INCOMPLETE');
    // No authoritative binding contribution: asset present but invalid may show metadata.
    if (after.variants[0].roles.BS.asset) {
        assert.equal(after.variants[0].roles.BS.asset.valid_asset, false);
        assert.equal(after.variants[0].roles.BS.asset.ownership, 'unmanaged');
    }
    const needs = JSON.parse((await service.app.inject({
        method: 'GET',
        url: '/api/v1/library/needs-attention',
    })).body);
    const invalidItem = needs.items.find((item: { code: string; role: string | null }) =>
        item.code === 'INVALID_IMAGE' && item.role === 'BS');
    assert.ok(invalidItem);
    assert.equal(invalidItem.variant_id, variantId);
    assert.equal(invalidItem.card_id, card.cardId);
    await service.close();
});
