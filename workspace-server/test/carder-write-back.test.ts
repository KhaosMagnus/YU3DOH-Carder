import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import {
    mkdir,
    mkdtemp,
    readFile,
    rename,
    rm,
    symlink,
    unlink,
    writeFile,
} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { deflateSync } from 'node:zlib';
import type { AssetRole } from '../src/assets/types';
import type { CanonicalDomainService } from '../src/canonical/service';
import { bootstrapWorkspaceDatabase } from '../src/persistence/operations';
import { createWorkspaceService, type WorkspaceService } from '../src/service';
import {
    SUPPORTED_WORKSPACE_FORMAT_VERSION,
    type WorkspaceManifest,
} from '../src/workspace/types';
import { buildWorkspaceApp } from '../src/app';
import { assertStructureMappable } from '../src/carder/mapping-precheck';
import { CarderPrepareError } from '../src/carder/errors';
import {
    CARDER_ASSET_GRANT_MAX_ENTRIES,
    CARDER_ASSET_GRANT_TTL_MS,
    CarderAssetGrantRegistry,
    type CarderAssetGrantScope,
} from '../src/carder/asset-grants';

const roots: string[] = [];

const manifest = (): WorkspaceManifest => ({
    workspace_id: 'workspace-run009',
    workspace_format_version: SUPPORTED_WORKSPACE_FORMAT_VERSION,
    database_path: 'Data/workspace.db',
    created_at: '2026-10-07T00:00:00.000Z',
    name: 'RUN 009 Carder Prepare Test Workspace',
});

const tempRoot = async (label: string) => {
    const root = await mkdtemp(
        path.join(os.tmpdir(), `yu3doh run009 ${label} `),
    );
    roots.push(root);
    await writeFile(
        path.join(root, 'workspace.json'),
        JSON.stringify(manifest()),
        'utf8',
    );
    return root;
};

const readyService = async (
    label: string,
    options: { carderAssetGrants?: CarderAssetGrantRegistry } = {},
) => {
    const root = await tempRoot(label);
    bootstrapWorkspaceDatabase(root, manifest());
    const service = await createWorkspaceService(
        { workspaceRoot: root, host: '127.0.0.1', port: 4312 },
        options,
    );
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
    await Promise.all(
        roots.map((root) => rm(root, { recursive: true, force: true })),
    );
});

const crcTable = (() => {
    const table = new Uint32Array(256);
    for (let index = 0; index < 256; index += 1) {
        let value = index;
        for (let bit = 0; bit < 8; bit += 1)
            value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
        table[index] = value >>> 0;
    }
    return table;
})();
const crc32 = (buffer: Buffer) => {
    let crc = 0xffffffff;
    for (const byte of buffer)
        crc = (crcTable[(crc ^ byte) & 0xff] ?? 0) ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
};
const pngChunk = (type: string, data: Buffer) => {
    const typeBuffer = Buffer.from(type, 'ascii');
    const output = Buffer.alloc(12 + data.length);
    output.writeUInt32BE(data.length, 0);
    typeBuffer.copy(output, 4);
    data.copy(output, 8);
    output.writeUInt32BE(
        crc32(Buffer.concat([typeBuffer, data])),
        8 + data.length,
    );
    return output;
};
const png = (alpha = 255, rgb = [10, 20, 30]) => {
    const header = Buffer.alloc(13);
    header.writeUInt32BE(1, 0);
    header.writeUInt32BE(1, 4);
    header[8] = 8;
    header[9] = 6;
    const raw = Buffer.from([0, rgb[0] ?? 0, rgb[1] ?? 0, rgb[2] ?? 0, alpha]);
    return Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        pngChunk('IHDR', header),
        pngChunk('IDAT', deflateSync(raw)),
        pngChunk('IEND', Buffer.alloc(0)),
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
    for (const marker of [
        'TOP_LEFT',
        'TOP',
        'TOP_RIGHT',
        'LEFT',
        'RIGHT',
        'BOTTOM_LEFT',
        'BOTTOM',
        'BOTTOM_RIGHT',
    ]) {
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
    const roleAssets: Record<
        string,
        { assetId: string; hash: string; relativePath: string }
    > = {};
    const timestamp = '2026-10-07T00:00:00.000Z';

    for (const role of roles) {
        const contents = png(role === 'OF' ? 128 : 255, [
            role.charCodeAt(0),
            40,
            50,
        ]);
        const hash = createHash('sha256').update(contents).digest('hex');
        const relativePath = options.unicodePath
            ? `Assets/Art 日本語/${cardId}/${variantKey}/${role}.png`
            : `Assets/${cardId}/${variantKey}/${role}.png`;
        const absolute = path.join(ctx.root, ...relativePath.split('/'));
        await mkdir(path.dirname(absolute), { recursive: true });
        await writeFile(absolute, contents);
        const assetId = randomUUID();
        roleAssets[role] = { assetId, hash, relativePath };
        ctx.persistence.transaction((database) => {
            const existingScan = database
                .prepare('SELECT 1 FROM asset_index_scans WHERE scan_id = ?')
                .get(scanId);
            if (!existingScan) {
                database
                    .prepare(
                        `
                    INSERT INTO asset_index_scans (
                        scan_id, started_at, completed_at, status,
                        discovered_count, present_count, diagnostic_count
                    ) VALUES (?, ?, ?, 'COMPLETE', 0, 0, 0)
                `,
                    )
                    .run(scanId, timestamp, timestamp);
            }
            const existingVariant = database
                .prepare('SELECT 1 FROM art_variants WHERE variant_id = ?')
                .get(variantId);
            if (!existingVariant) {
                database
                    .prepare(
                        `
                    INSERT INTO art_variants (
                        variant_id, card_id, variant_key, display_label, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?)
                `,
                    )
                    .run(
                        variantId,
                        cardId,
                        variantKey,
                        variantKey,
                        timestamp,
                        timestamp,
                    );
            }
            database
                .prepare(
                    `
                INSERT INTO indexed_asset_files (
                    asset_id, relative_path, file_name, extension, size_bytes, modified_time_ms,
                    content_hash, parsed_card_name, parsed_password, role, variant_label, variant_key,
                    association_state, card_id, variant_id, image_width, image_height, has_transparency,
                    valid_asset, present, first_seen_scan_id, last_seen_scan_id, updated_at
                ) VALUES (?, ?, ?, 'png', ?, 1, ?, NULL, NULL, ?, ?, ?, 'RESOLVED', ?, ?, 10, 20, ?, 1, 1, ?, ?, ?)
            `,
                )
                .run(
                    assetId,
                    relativePath,
                    path.basename(relativePath),
                    contents.length,
                    hash,
                    role,
                    variantKey,
                    variantKey,
                    cardId,
                    variantId,
                    role === 'OF' ? 1 : 0,
                    scanId,
                    scanId,
                    timestamp,
                );
            if (options.skipBind !== role) {
                database
                    .prepare(
                        `
                    INSERT INTO variant_role_bindings (variant_id, role, asset_id)
                    VALUES (?, ?, ?)
                `,
                    )
                    .run(variantId, role, assetId);
            }
        });
    }
    return { variantId, roleAssets };
};

const confirmMonsterStandard = (
    canonical: CanonicalDomainService,
    password: string,
    language: 'EN' | 'ES' | 'JP' = 'EN',
    extras: {
        abilities?: string[];
        summonKind?: string;
        pendulum?: number;
    } = {},
) => {
    registerBasics(canonical);
    const card = canonical.createCard({ family: 'MONSTER', password });
    const abilities = extras.abilities ?? ['EFFECT'];
    const summonKind =
        (extras.summonKind as 'MAIN_DECK' | 'LINK' | 'XYZ') ?? 'MAIN_DECK';
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
        localizations: [
            {
                language,
                name: `Name ${language}`,
                cardText: `Text ${language}`,
                pendulumText:
                    extras.pendulum != null ? `Pendulum ${language}` : null,
            },
        ],
        confirmations: [
            { block: 'STRUCTURE', state: 'CONFIRMED', provenance: source },
            {
                block: `TEXT:${language}`,
                state: 'CONFIRMED',
                provenance: source,
            },
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
        localizations: [
            {
                language,
                name: `Spell ${language}`,
                cardText: `Spell text ${language}`,
                pendulumText: null,
            },
        ],
        confirmations: [
            { block: 'STRUCTURE', state: 'CONFIRMED', provenance: source },
            {
                block: `TEXT:${language}`,
                state: 'CONFIRMED',
                provenance: source,
            },
        ],
    });
};

import { CarderWriteGrantRegistry } from '../src/carder/write-grants';
import {
    authoritativeProjection,
    CarderWriteBackService,
    type WriteBackRequest,
    type WriteProjection,
} from '../src/carder/write-back';
const fixture = async (
    kind = 'MONSTER',
    extras: Parameters<typeof confirmMonsterStandard>[3] = {},
) => {
    const ctx = await readyService('write-back');
    let card;
    if (kind === 'MONSTER')
        card = confirmMonsterStandard(ctx.canonical, '17000001', 'EN', extras);
    else if (kind === 'SPELL')
        card = confirmSpell(ctx.canonical, '17000001', 'EN');
    else {
        registerBasics(ctx.canonical);
        const initial = ctx.canonical.createCard({
            family: kind as 'TOKEN' | 'TRAP',
            password: kind === 'TOKEN' ? null : '17000001',
        });
        card = ctx.canonical.mutateCard(initial.cardId, initial.revision, {
            structure:
                kind === 'TOKEN'
                    ? {
                          kind: 'TOKEN',
                          attributeCode: 'LIGHT',
                          raceCode: 'DRAGON',
                          level: 4,
                          atk: 1000,
                          def: 1000,
                      }
                    : { kind: 'TRAP', subtypeCode: 'NORMAL' },
            localizations: [
                {
                    language: 'EN',
                    name: 'Fixture',
                    cardText: 'Fixture text',
                    pendulumText: null,
                },
            ],
            confirmations: [
                { block: 'STRUCTURE', state: 'CONFIRMED', provenance: source },
                { block: 'TEXT:EN', state: 'CONFIRMED', provenance: source },
            ],
        });
    }
    const { variantId } = await insertVariantWithRoles(
        ctx,
        card.cardId,
        'default',
        ['BS'],
    );
    const prepared = ctx.service.carderPrepare!.prepareWorkingCard({
        cardId: card.cardId,
        variantId,
        composition: 'STANDARD',
        contentLanguage: 'EN',
        expectedRevision: card.revision,
    });
    const request: WriteBackRequest = {
        write_grant: prepared.identity.write_grant,
        card_id: card.cardId,
        expected_revision: card.revision,
        content_language: 'EN',
        projection: authoritativeProjection(card, 'EN'),
        acknowledge_move_to_draft: [],
    };
    const send = (r: WriteBackRequest = request) =>
        ctx.service.app.inject({
            method: 'POST',
            url: '/api/v1/carder/write-back',
            payload: r,
        });
    return { ...ctx, card, request, send };
};
const snapshot = (ctx: Awaited<ReturnType<typeof fixture>>) =>
    ctx.service.persistence!.runRepositoryOperation((db) =>
        Object.fromEntries(
            db
                .prepare(
                    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
                )
                .all()
                .map((r: any) => [
                    r.name,
                    db.prepare(`SELECT * FROM ${r.name}`).all(),
                ]),
        ),
    );
const expectError = async (
    ctx: Awaited<ReturnType<typeof fixture>>,
    code: string,
) => {
    const before = snapshot(ctx);
    const response = await ctx.send();
    assert.equal(response.json().code, code, response.body);
    assert.deepEqual(snapshot(ctx), before);
    return response;
};

test('RUN017 successful prepare grants; failed prepare issues zero; runtime reload revokes', async () => {
    const ctx = await fixture();
    try {
        const registry = ctx.service.runtime.current.carderWriteGrants;
        assert.equal(registry.size(), 1);
        assert.ok(registry.verify(ctx.request.write_grant));
        assert.throws(() =>
            ctx.service.carderPrepare!.prepareWorkingCard({
                cardId: ctx.card.cardId,
                variantId: 'missing',
                composition: 'STANDARD',
                contentLanguage: 'EN',
                expectedRevision: ctx.card.revision,
            }),
        );
        assert.equal(registry.size(), 1);
        await ctx.service.runtime.reload();
        await expectError(ctx, 'NO_WORKSPACE_CARDER_SESSION');
    } finally {
        await ctx.service.close();
    }
});
test('RUN017 registry expiry, malformed secret, noncanonical encoding, bounded eviction, failed verification does not consume', () => {
    let clock = 10;
    const registry = new CarderWriteGrantRegistry({
        now: () => clock,
        ttlMs: 10,
        maxEntries: 2,
    });
    const scope = {
        cardId: 'a',
        revision: '1',
        contentLanguage: 'EN' as const,
    };
    const a = registry.issue(scope);
    assert.deepEqual(registry.verify(a), scope);
    assert.equal(registry.verify(a + 'x'), null);
    assert.ok(registry.verify(a));
    const b = registry.issue(scope);
    registry.issue(scope);
    assert.equal(registry.verify(a), null);
    assert.equal(registry.size(), 2);
    clock = 20;
    assert.equal(registry.verify(b), null);
});
for (const [label, mutate, code] of [
    [
        'invalid grant',
        (r: WriteBackRequest) => (r.write_grant = 'bad'),
        'NO_WORKSPACE_CARDER_SESSION',
    ],
    [
        'card identity',
        (r: WriteBackRequest) => (r.card_id = 'other'),
        'SESSION_IDENTITY_MISMATCH',
    ],
    [
        'language identity',
        (r: WriteBackRequest) => (r.content_language = 'ES'),
        'SESSION_IDENTITY_MISMATCH',
    ],
    [
        'grant revision',
        (r: WriteBackRequest) => (r.expected_revision = '0'),
        'REVISION_CONFLICT',
    ],
    [
        'missing ack',
        (r: WriteBackRequest) => (r.projection.name = 'Changed'),
        'CONFIRMED_BLOCK_ACK_REQUIRED',
    ],
    [
        'unexpected ack',
        (r: WriteBackRequest) => (r.acknowledge_move_to_draft = ['STRUCTURE']),
        'CONFIRMED_BLOCK_STATE_CHANGED',
    ],
    [
        'wrong language ack',
        (r: WriteBackRequest) => {
            r.projection.name = 'Changed';
            r.acknowledge_move_to_draft = ['TEXT:ES'];
        },
        'CONFIRMED_BLOCK_STATE_CHANGED',
    ],
    [
        'invalid stat',
        (r: WriteBackRequest) => (r.projection.atk = 'Infinity'),
        'UNSUPPORTED_WRITE_FIELD',
    ],
    [
        'non-pendulum scale',
        (r: WriteBackRequest) => (r.projection.pendulum_scale_red = '3'),
        'UNSUPPORTED_WRITE_FIELD',
    ],
    [
        'non-pendulum effect',
        (r: WriteBackRequest) => (r.projection.pendulum_effect = 'new'),
        'UNSUPPORTED_WRITE_FIELD',
    ],
] as const)
    test(`RUN017 ${label} zero writes and grant retained`, async () => {
        const ctx = await fixture();
        try {
            const original = ctx.request.write_grant;
            mutate(ctx.request);
            await expectError(ctx, code);
            assert.ok(
                ctx.service.runtime.current.carderWriteGrants.verify(original),
            );
        } finally {
            await ctx.service.close();
        }
    });
for (const [label, kind, extras, projection, code] of [
    [
        'Token password',
        'TOKEN',
        {},
        { password: '123' },
        'UNSUPPORTED_WRITE_FIELD',
    ],
    [
        'Link star',
        'MONSTER',
        { summonKind: 'LINK' },
        { star: '2' },
        'UNSUPPORTED_WRITE_FIELD',
    ],
    [
        'Link DEF',
        'MONSTER',
        { summonKind: 'LINK' },
        { def: '1200' },
        'UNSUPPORTED_WRITE_FIELD',
    ],
    [
        'Spell attribute',
        'SPELL',
        {},
        { attribute: 'DARK' },
        'UNSUPPORTED_WRITE_FIELD',
    ],
    ['Trap stats', 'TRAP', {}, { atk: '100' }, 'UNSUPPORTED_WRITE_FIELD'],
    [
        'invalid Spell subtype',
        'SPELL',
        {},
        { sub_family: 'COUNTER' },
        'UNSUPPORTED_WRITE_FIELD',
    ],
    [
        'invalid Trap subtype',
        'TRAP',
        {},
        { sub_family: 'QUICK-PLAY' },
        'UNSUPPORTED_WRITE_FIELD',
    ],
    [
        'unequal Pendulum',
        'MONSTER',
        { abilities: ['EFFECT', 'PENDULUM'], pendulum: 4 },
        { pendulum_scale_red: '3' },
        'UNSUPPORTED_WRITE_FIELD',
    ],
] as const)
    test(`RUN017 ${label}`, async () => {
        const ctx = await fixture(kind, extras as any);
        try {
            Object.assign(ctx.request.projection, projection);
            await expectError(ctx, code);
        } finally {
            await ctx.service.close();
        }
    });
for (const [label, kind, extras, projection, blocks, check] of [
    [
        'Monster attribute',
        'MONSTER',
        {},
        { attribute: 'DARK' },
        ['STRUCTURE'],
        (s: any) => assert.equal(s.attributeCode, 'DARK'),
    ],
    [
        'existing matrix SPELL attribute preserves Monster family',
        'MONSTER',
        {},
        { attribute: 'SPELL' },
        ['STRUCTURE'],
        (s: any) => {
            assert.equal(s.attributeCode, 'SPELL');
            assert.equal(s.kind, 'MONSTER');
        },
    ],
    [
        'existing matrix TRAP attribute preserves Token family',
        'TOKEN',
        {},
        { attribute: 'TRAP' },
        ['STRUCTURE'],
        (s: any) => {
            assert.equal(s.attributeCode, 'TRAP');
            assert.equal(s.kind, 'TOKEN');
        },
    ],
    [
        'Monster Level',
        'MONSTER',
        {},
        { star: '6' },
        ['STRUCTURE'],
        (s: any) => {
            assert.equal(s.level, 6);
            assert.equal(s.rank, null);
        },
    ],
    [
        'Xyz Rank',
        'MONSTER',
        { summonKind: 'XYZ' },
        { star: '6' },
        ['STRUCTURE'],
        (s: any) => {
            assert.equal(s.rank, 6);
            assert.equal(s.level, null);
        },
    ],
    [
        'Token Level',
        'TOKEN',
        {},
        { star: '6' },
        ['STRUCTURE'],
        (s: any) => assert.equal(s.level, 6),
    ],
    [
        'integer stats',
        'MONSTER',
        {},
        { atk: '2500', def: '0' },
        ['STRUCTURE'],
        (s: any) => {
            assert.equal(s.atk, 2500);
            assert.equal(s.def, 0);
        },
    ],
    [
        'signed integer stats',
        'MONSTER',
        {},
        { atk: '-100', def: '-200' },
        ['STRUCTURE'],
        (s: any) => {
            assert.equal(s.atk, -100);
            assert.equal(s.def, -200);
        },
    ],
    [
        'unknown stats',
        'MONSTER',
        {},
        { atk: '?', def: '?' },
        ['STRUCTURE'],
        (s: any) => assert.equal(s.atk, '?'),
    ],
    [
        'null stats',
        'MONSTER',
        {},
        { atk: '', def: '' },
        ['STRUCTURE'],
        (s: any) => assert.equal(s.atk, null),
    ],
    [
        'Spell subtype',
        'SPELL',
        {},
        { sub_family: 'CONTINUOUS' },
        ['STRUCTURE'],
        (s: any) => assert.equal(s.subtypeCode, 'CONTINUOUS'),
    ],
    [
        'Trap subtype',
        'TRAP',
        {},
        { sub_family: 'COUNTER' },
        ['STRUCTURE'],
        (s: any) => assert.equal(s.subtypeCode, 'COUNTER'),
    ],
    [
        'Pendulum zero',
        'MONSTER',
        { abilities: ['EFFECT', 'PENDULUM'], pendulum: 4 },
        { pendulum_scale_red: '0', pendulum_scale_blue: '0' },
        ['STRUCTURE'],
        (s: any) => assert.equal(s.pendulumScale, 0),
    ],
    [
        'TEXT only',
        'MONSTER',
        {},
        { name: 'Changed', effect: 'Changed text' },
        ['TEXT:EN'],
        () => {},
    ],
    [
        'combined',
        'MONSTER',
        {},
        { name: 'Changed', atk: '2000' },
        ['STRUCTURE', 'TEXT:EN'],
        () => {},
    ],
] as const)
    test(`RUN017 ${label} one transaction; precise provenance and DRAFT; nonwritable state preserved`, async () => {
        const ctx = await fixture(kind, extras as any);
        try {
            const before = snapshot(ctx);
            Object.assign(ctx.request.projection, projection);
            ctx.request.acknowledge_move_to_draft = [...blocks];
            const response = await ctx.send();
            assert.equal(response.statusCode, 200, response.body);
            const result = response.json();
            assert.deepEqual(result.changed_blocks, blocks);
            assert.deepEqual(result.moved_to_draft, blocks);
            assert.equal(
                BigInt(result.revision),
                BigInt(ctx.card.revision) + 1n,
            );
            const card = ctx.canonical.getCard(ctx.card.cardId)!;
            check(card.structure);
            assert.deepEqual(card.classification, ctx.card.classification);
            assert.deepEqual(card.relations, ctx.card.relations);
            const writes = card.provenance.filter(
                (p) => p.sourceKind === 'CARDER_WRITE_BACK',
            );
            assert.equal(writes.length, blocks.length);
            assert.deepEqual(
                writes.map((p) => p.targetKey),
                blocks,
            );
            assert.ok(writes.every((p) => p.targetKind === 'BLOCK'));
            assert.equal(
                card.confirmations.filter(
                    (c) =>
                        (blocks as readonly string[]).includes(c.block) &&
                        c.state === 'DRAFT',
                ).length,
                blocks.length,
            );
            const after = snapshot(ctx);
            for (const key of Object.keys(before))
                if (/asset|variant/.test(key))
                    assert.deepEqual(after[key], before[key], key);
            if (
                card.structure?.kind === 'MONSTER' &&
                ctx.card.structure?.kind === 'MONSTER'
            )
                for (const key of [
                    'raceCode',
                    'abilities',
                    'linkMarkers',
                    'summonKind',
                ] as const)
                    assert.deepEqual(
                        card.structure[key],
                        ctx.card.structure[key],
                    );
        } finally {
            await ctx.service.close();
        }
    });
test('RUN017 no-op skips Canonical mutation, rotates grant; repeated saves with returned revision; old replay rejected', async () => {
    const ctx = await fixture();
    try {
        const before = snapshot(ctx);
        const old = ctx.request.write_grant;
        const result = (await ctx.send()).json();
        assert.equal(result.changed, false);
        assert.equal(result.revision, ctx.card.revision);
        assert.deepEqual(snapshot(ctx), before);
        assert.notEqual(result.write_grant, old);
        await expectError(ctx, 'NO_WORKSPACE_CARDER_SESSION');
        ctx.request.write_grant = result.write_grant;
        ctx.request.projection.name = 'First';
        ctx.request.acknowledge_move_to_draft = ['TEXT:EN'];
        const first = (await ctx.send()).json();
        ctx.request.write_grant = first.write_grant;
        ctx.request.expected_revision = first.revision;
        ctx.request.projection.name = 'Second';
        ctx.request.acknowledge_move_to_draft = [];
        const second = await ctx.send();
        assert.equal(second.statusCode, 200, second.body);
        assert.deepEqual(second.json().moved_to_draft, []);
        assert.equal(
            ctx.canonical.getCard(ctx.card.cardId)!.localizations[0]!.name,
            'Second',
        );
    } finally {
        await ctx.service.close();
    }
});
test('RUN017 authoritative revision rejects Library-first and Carder-first races', async () => {
    const ctx = await fixture();
    try {
        ctx.canonical.mutateCard(ctx.card.cardId, ctx.card.revision, {
            password: '12345678',
            confirmations: [{ block: 'STRUCTURE', state: 'DRAFT' }],
        });
        await expectError(ctx, 'REVISION_CONFLICT');
    } finally {
        await ctx.service.close();
    }
    const ctx2 = await fixture();
    try {
        ctx2.request.projection.name = 'winner';
        ctx2.request.acknowledge_move_to_draft = ['TEXT:EN'];
        assert.equal((await ctx2.send()).statusCode, 200);
        assert.throws(
            () =>
                ctx2.canonical.mutateCard(
                    ctx2.card.cardId,
                    ctx2.card.revision,
                    {
                        password: '123',
                    },
                ),
            { code: 'REVISION_CONFLICT' },
        );
    } finally {
        await ctx2.service.close();
    }
});
test('RUN017 transaction rollback retains all fields/provenance/revision/grant after DB error', async () => {
    const ctx = await fixture();
    try {
        ctx.persistence.runRepositoryOperation((db) =>
            db.exec(
                "CREATE TRIGGER fail_write BEFORE UPDATE OF revision ON canonical_cards BEGIN SELECT RAISE(ABORT, 'injected transaction failure'); END",
            ),
        );
        ctx.request.projection.name = 'Changed';
        ctx.request.projection.atk = '2000';
        ctx.request.acknowledge_move_to_draft = ['STRUCTURE', 'TEXT:EN'];
        await expectError(ctx, 'REVISION_CONFLICT');
        assert.ok(
            ctx.service.runtime.current.carderWriteGrants.verify(
                ctx.request.write_grant,
            ),
        );
    } finally {
        await ctx.service.close();
    }
});
test('RUN017 cross-block validation retained; invalid unrelated confirmed block rolls back combined save', async () => {
    const ctx = await fixture();
    try {
        ctx.persistence.runRepositoryOperation((db) => {
            db.prepare(
                "INSERT INTO canonical_localized_text(card_id,language,name,card_text,pendulum_text) VALUES (?, 'ES', NULL, NULL, NULL)",
            ).run(ctx.card.cardId);
            db.prepare(
                "INSERT INTO canonical_block_states(card_id,block_key,state,provenance_id) SELECT ?, 'TEXT:ES', 'CONFIRMED', provenance_id FROM canonical_block_states WHERE card_id=? AND block_key='TEXT:EN'",
            ).run(ctx.card.cardId, ctx.card.cardId);
        });
        ctx.request.projection.name = 'Changed';
        ctx.request.projection.atk = '2000';
        ctx.request.acknowledge_move_to_draft = ['STRUCTURE', 'TEXT:EN'];
        await expectError(ctx, 'DOMAIN_VALIDATION');
    } finally {
        await ctx.service.close();
    }
});
for (const mode of [
    'RESTORE',
    'MIGRATION',
    'INITIALIZATION',
    'BACKUP',
] as const)
    test(`RUN017 maintenance ${mode} rejects`, async () => {
        const ctx = await fixture();
        try {
            const before = snapshot(ctx);
            const release =
                ctx.service.runtime.maintenance.acquireMaintenance(mode);
            try {
                const response = await ctx.send();
                assert.equal(
                    response.json().code,
                    'WORKSPACE_MAINTENANCE_ACTIVE',
                    response.body,
                );
            } finally {
                release();
            }
            assert.deepEqual(snapshot(ctx), before);
        } finally {
            await ctx.service.close();
        }
    });
test('RUN017 contract rejects arbitrary InternalCard/nested fields and keeps active language only', async () => {
    const ctx = await fixture();
    try {
        for (const extra of [
            { art: 'secret' },
            {
                projection: {
                    ...ctx.request.projection,
                    classification: 'bad',
                },
            },
        ]) {
            const before = snapshot(ctx);
            const res = await ctx.service.app.inject({
                method: 'POST',
                url: '/api/v1/carder/write-back',
                payload: { ...ctx.request, ...extra },
            });
            assert.equal(res.statusCode, 400);
            assert.deepEqual(snapshot(ctx), before);
        }
    } finally {
        await ctx.service.close();
    }
});

test('RUN017 true no-op never invokes Canonical mutation; normalized numeric equivalent', async () => {
    const ctx = await fixture();
    try {
        const grants = new CarderWriteGrantRegistry();
        const grant = grants.issue({
            cardId: ctx.card.cardId,
            contentLanguage: 'EN',
            revision: ctx.card.revision,
        });
        let calls = 0;
        const write = new CarderWriteBackService(
            {
                getCard: () => ctx.card,
                mutateCard: () => {
                    calls++;
                    throw new Error('no-op must not mutate');
                },
            } as unknown as CanonicalDomainService,
            grants,
        );
        const result = write.writeBack({
            ...ctx.request,
            write_grant: grant,
            projection: { ...ctx.request.projection, star: '04', atk: '01800' },
        });
        assert.equal(result.changed, false);
        assert.equal(calls, 0);
        assert.equal(grants.verify(grant), null);
        assert.ok(grants.verify(result.write_grant));
    } finally {
        await ctx.service.close();
    }
});
test('RUN017 expired grant and deleted card fail closed before mutation', async () => {
    const ctx = await fixture();
    try {
        let now = 0;
        const grants = new CarderWriteGrantRegistry({
            ttlMs: 10,
            now: () => now,
        });
        const grant = grants.issue({
            cardId: ctx.card.cardId,
            contentLanguage: 'EN',
            revision: ctx.card.revision,
        });
        const write = new CarderWriteBackService(ctx.canonical, grants);
        now = 10;
        assert.throws(
            () => write.writeBack({ ...ctx.request, write_grant: grant }),
            { code: 'NO_WORKSPACE_CARDER_SESSION' },
        );
        const next = grants.issue({
            cardId: ctx.card.cardId,
            contentLanguage: 'EN',
            revision: ctx.card.revision,
        });
        const missing = new CarderWriteBackService(
            {
                getCard: () => null,
                mutateCard: () => {
                    throw new Error('must not mutate');
                },
            } as unknown as CanonicalDomainService,
            grants,
        );
        assert.throws(
            () => missing.writeBack({ ...ctx.request, write_grant: next }),
            { code: 'NOT_FOUND' },
        );
        assert.ok(grants.verify(next));
    } finally {
        await ctx.service.close();
    }
});
test('RUN017 active localization preserves other languages exactly', async () => {
    const ctx = await fixture();
    try {
        const added = ctx.canonical.mutateCard(
            ctx.card.cardId,
            ctx.card.revision,
            {
                localizations: [
                    {
                        language: 'ES',
                        name: ' Español ',
                        cardText: 'Texto',
                        pendulumText: null,
                    },
                    {
                        language: 'JP',
                        name: '日本語',
                        cardText: '本文',
                        pendulumText: null,
                    },
                ],
            },
        );
        const grant = ctx.service.runtime.current.carderWriteGrants.issue({
            cardId: added.cardId,
            contentLanguage: 'EN',
            revision: added.revision,
        });
        ctx.request.write_grant = grant;
        ctx.request.expected_revision = added.revision;
        ctx.request.projection.name = 'Changed';
        ctx.request.acknowledge_move_to_draft = ['TEXT:EN'];
        const result = await ctx.send();
        assert.equal(result.statusCode, 200, result.body);
        assert.deepEqual(
            ctx.canonical
                .getCard(added.cardId)!
                .localizations.filter((x) => x.language !== 'EN'),
            added.localizations.filter((x) => x.language !== 'EN'),
        );
    } finally {
        await ctx.service.close();
    }
});

test('RUN017 not READY fails before grant validation', async () => {
    const ctx = await fixture();
    try {
        ctx.service.runtime.recoveryRequired('Test recovery fence');
        const response = await ctx.send();
        assert.equal(response.statusCode, 503);
        assert.equal(response.json().code, 'WORKSPACE_NOT_READY');
        assert.equal(ctx.service.runtime.current.carderWriteGrants.size(), 0);
    } finally {
        await ctx.service.close();
    }
});

test('RUN017 in-flight ordinary mutation fences write-back', async () => {
    const ctx = await fixture();
    try {
        const before = snapshot(ctx);
        let unblock!: () => void;
        const held = ctx.service.runtime.maintenance.mutate(
            () =>
                new Promise<void>((resolve) => {
                    unblock = resolve;
                }),
        );
        try {
            const response = await ctx.send();
            assert.equal(response.statusCode, 409);
            assert.equal(response.json().code, 'WORKSPACE_MAINTENANCE_ACTIVE');
        } finally {
            unblock();
            await held;
        }
        assert.deepEqual(snapshot(ctx), before);
    } finally {
        await ctx.service.close();
    }
});

for (const [summon, field, values] of [['MAIN_DECK', 'level', [0, 12, -1, 13, 18]], ['XYZ', 'rank', [0, 13, -1, 14]]] as const)
    for (const value of values)
        test(`CR-0001.2 H Carder ${field} ${value} enforced atomically by Canonical`, async () => {
            const f = await fixture('MONSTER', { summonKind: summon });
            try {
                f.request.projection.star = String(value);
                f.request.acknowledge_move_to_draft = ['STRUCTURE'];
                const before = snapshot(f);
                const r = await f.send();
                const valid = value >= 0 && value <= (field === 'level' ? 12 : 13);
                assert.equal(r.statusCode, valid ? 200 : 422, r.body);
                if (valid) assert.equal((f.canonical.getCard(f.card.cardId)!.structure as any)[field], value);
                else {
                    assert.equal(r.json().code, 'DOMAIN_VALIDATION');
                    assert.deepEqual(snapshot(f), before);
                    assert.equal(f.canonical.getCard(f.card.cardId)!.revision, f.card.revision);
                }
            } finally { await f.service.close(); }
        });

for (const mode of ['text', 'repair', 'invalid'] as const)
    test(`CR-0001.2 H Carder legacy Level 18 ${mode}`, async () => {
        const f = await fixture();
        try {
            f.persistence.runRepositoryOperation(db => db.prepare('UPDATE canonical_monster_structure SET level=18 WHERE card_id=?').run(f.card.cardId));
            const historical = f.canonical.getCard(f.card.cardId)!;
            f.request.projection = authoritativeProjection(historical, 'EN');
            if (mode === 'text') {
                f.request.projection.name = 'Updated legacy text';
                f.request.acknowledge_move_to_draft = ['TEXT:EN'];
            } else {
                f.request.projection.star = mode === 'repair' ? '12' : '19';
                f.request.acknowledge_move_to_draft = ['STRUCTURE'];
            }
            const before = snapshot(f);
            const r = await f.send();
            assert.equal(r.statusCode, mode === 'invalid' ? 422 : 200, r.body);
            if (mode === 'invalid') {
                assert.equal(r.json().code, 'DOMAIN_VALIDATION');
                assert.deepEqual(snapshot(f), before);
            } else if (mode === 'text') {
                assert.deepEqual(f.canonical.getCard(f.card.cardId)!.structure, historical.structure);
                assert.equal(f.canonical.getCard(f.card.cardId)!.confirmations.find(c => c.block === 'STRUCTURE')!.state, 'CONFIRMED');
            } else assert.equal((f.canonical.getCard(f.card.cardId)!.structure as any).level, 12);
        } finally { await f.service.close(); }
    });
