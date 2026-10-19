import assert from 'node:assert/strict';
import test from 'node:test';
import { randomUUID } from 'node:crypto';
import { mkdtemp, writeFile, rm, mkdir } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { createWorkspaceService } from '../src/service';
import { bootstrapWorkspaceDatabase } from '../src/persistence/operations';
import type { CanonicalStructureInput } from '../src/canonical/types';

const monster = (patch: Record<string, unknown> = {}) => ({
    kind: 'MONSTER',
    summon_kind: 'MAIN_DECK',
    attribute_code: null,
    race_code: null,
    level: null,
    rank: null,
    atk: null,
    def: null,
    pendulum_scale: null,
    abilities: ['EFFECT'],
    link_markers: [],
    ...patch,
});
async function setup(
    t: test.TestContext,
    family: 'MONSTER' | 'SPELL' | 'TRAP' | 'TOKEN' = 'MONSTER',
) {
    const root = await mkdtemp(
        path.join(os.tmpdir(), 'YU3DOH RC null zero 日本語 '),
    );
    const manifest = {
        workspace_id: randomUUID(),
        workspace_format_version: 1,
        database_path: 'Data/workspace.db',
        created_at: new Date().toISOString(),
    };
    await writeFile(
        path.join(root, 'workspace.json'),
        JSON.stringify(manifest),
    );
    bootstrapWorkspaceDatabase(root, manifest);
    const service = await createWorkspaceService({
        workspaceRoot: root,
        host: '127.0.0.1',
        port: 4312,
    });
    t.after(async () => {
        await service.close();
        await rm(root, { recursive: true, force: true });
    });
    const card = service.canonical!.createCard({ family });
    const route = '/api/v1/library/cards/' + card.cardId;
    const get = async () =>
        (await service.app.inject({ method: 'GET', url: route })).json();
    const patch = async (body: Record<string, unknown>) =>
        service.app.inject({
            method: 'PATCH',
            url: route,
            payload: { expected_revision: (await get()).revision, ...body },
        });
    const snapshot = () => {
        const db = service.persistence!.runRepositoryOperation(db => db);
        return db
            .prepare(
                "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
            )
            .all()
            .map((row) => {
                const name = (row as { name: string }).name;
                return [
                    name,
                    db
                        .prepare(
                            'SELECT * FROM "' +
                                name.replaceAll('"', '""') +
                                '" ORDER BY rowid',
                        )
                        .all(),
                ];
            });
    };
    return { service, card, patch, get, snapshot };
}
async function proof(name: string, value: unknown) {
    if (!process.env.YU3DOH_QA_OUTPUT) return;
    await mkdir(process.env.YU3DOH_QA_OUTPUT, { recursive: true });
    await writeFile(
        path.join(process.env.YU3DOH_QA_OUTPUT, name + '.json'),
        JSON.stringify(
            {
                sha: execFileSync('git', ['rev-parse', 'HEAD'], {
                    encoding: 'utf8',
                }).trim(),
                provider_requests: 0,
                value,
            },
            null,
            2,
        ),
    );
}

test('RC T-01/03/05/06/09/10/12 original defect: null survives real PATCH and authoritative reopen', async (t) => {
    const f = await setup(t);
    const request = {
        structure: monster(),
        password: null,
        localizations: [
            {
                language: 'EN',
                name: null,
                card_text: null,
                pendulum_text: null,
            },
        ],
    };
    const r = await f.patch(request);
    assert.equal(r.statusCode, 200, r.body);
    const response = r.json();
    const reload = await f.get();
    assert.deepEqual(reload, response);
    for (const key of [
        'attribute_code',
        'race_code',
        'level',
        'rank',
        'atk',
        'def',
        'pendulum_scale',
        'link_rating',
    ])
        assert.equal(reload.structure[key], null, key);
    assert.equal(reload.password, null);
    for (const key of ['name', 'card_text', 'pendulum_text'])
        assert.equal(reload.localizations[0][key], null, key);
    await proof('rc-original-reproduction', {
        request,
        response,
        authoritative_reload: reload,
        result: 'PASS',
    });
});
for (const [field, structure] of [
    ['level', monster({ level: 0 })],
    ['rank', monster({ summon_kind: 'XYZ', rank: 0 })],
    [
        'pendulum_scale',
        monster({ abilities: ['EFFECT', 'PENDULUM'], pendulum_scale: 0 }),
    ],
    ['atk', monster({ atk: 0 })],
    ['def', monster({ def: 0 })],
] as const)
    test(`RC T-02/07 explicit applicable ${field} zero survives HTTP`, async (t) => {
        const f = await setup(t);
        const r = await f.patch({ structure });
        assert.equal(r.statusCode, 200, r.body);
        assert.equal(r.json().structure[field], 0);
        assert.equal((await f.get()).structure[field], 0);
    });
for (const field of ['atk', 'def'])
    test(`RC T-08 printed ${field} question mark survives HTTP`, async (t) => {
        const f = await setup(t);
        const r = await f.patch({ structure: monster({ [field]: '?' }) });
        assert.equal(r.statusCode, 200, r.body);
        assert.equal(r.json().structure[field], '?');
    });
for (const kind of ['SPELL', 'TRAP', 'TOKEN'] as const)
    test(`RC T-09 ${kind} nullable structural scalars remain null`, async (t) => {
        const f = await setup(t, kind);
        const structure =
            kind === 'TOKEN'
                ? {
                      kind,
                      attribute_code: null,
                      race_code: null,
                      level: null,
                      atk: null,
                      def: null,
                  }
                : { kind, subtype_code: null };
        const r = await f.patch({ structure });
        assert.equal(r.statusCode, 200, r.body);
        assert.deepEqual(r.json().structure, structure);
    });
test('RC nullable summon kind stays null rather than manufacturing applicability', async (t) => {
    const f = await setup(t);
    const r = await f.patch({
        structure: monster({
            summon_kind: null,
            rank: 0,
            level: 2,
            link_markers: ['1'],
        }),
    });
    assert.equal(r.statusCode, 200, r.body);
    assert.equal(r.json().structure.summon_kind, null);
    assert.equal(r.json().structure.rank, 0);
    assert.equal(r.json().structure.level, 2);
});
test('RC T-04 explicit empty localization strings remain distinct from null', async (t) => {
    const f = await setup(t);
    const r = await f.patch({
        localizations: [
            { language: 'EN', name: '', card_text: '', pendulum_text: '' },
        ],
    });
    assert.equal(r.statusCode, 200, r.body);
    assert.deepEqual(r.json().localizations[0], {
        language: 'EN',
        name: '',
        card_text: '',
        pendulum_text: '',
    });
    assert.deepEqual((await f.get()).localizations, r.json().localizations);
});
test('RC nullable provenance and relation refs/notes remain null', async (t) => {
    const f = await setup(t);
    const target = f.service.canonical!.createCard({ family: 'SPELL' });
    const relationType = (
        f.service
            .persistence!.runRepositoryOperation(db => db).prepare(
                'SELECT code FROM canonical_relation_types LIMIT 1',
            )
            .get() as { code: string }
    ).code;
    const r = await f.patch({
        relations: [
            {
                target_card_id: target.cardId,
                relation_type_code: relationType,
                note: null,
                provenance: {
                    source_kind: 'MANUAL',
                    source_ref: null,
                    note: null,
                },
            },
        ],
        provenance: [
            {
                target_kind: 'BLOCK',
                target_key: 'STRUCTURE',
                source_kind: 'MANUAL',
                source_ref: null,
                note: null,
            },
        ],
    });
    assert.equal(r.statusCode, 200, r.body);
    assert.equal(r.json().relations[0].note, null);
    const rows = f.service
        .persistence!.runRepositoryOperation(db => db).prepare(
            'SELECT source_ref, note FROM canonical_provenance WHERE card_id = ?',
        )
        .all(f.card.cardId);
    assert(rows.length > 0);
    for (const row of rows)
        assert.deepEqual(row, { source_ref: null, note: null });
});
test('RC T-11 query coercion still converts integer query strings; invalid remains rejected', async (t) => {
    const f = await setup(t);
    const ok = await f.service.app.inject({
        method: 'GET',
        url: '/api/v1/library/cards?limit=1&offset=0',
    });
    assert.equal(ok.statusCode, 200, ok.body);
    const bad = await f.service.app.inject({
        method: 'GET',
        url: '/api/v1/library/cards?limit=bad',
    });
    assert.equal(bad.statusCode, 400);
});

const contradictory: Array<[string, Record<string, unknown>]> = [
    ['MAIN rank zero', { rank: 0 }],
    ['RITUAL rank', { summon_kind: 'RITUAL', rank: 2 }],
    ['FUSION rank', { summon_kind: 'FUSION', rank: 2 }],
    ['SYNCHRO rank', { summon_kind: 'SYNCHRO', rank: 2 }],
    ['XYZ level zero', { summon_kind: 'XYZ', level: 0 }],
    ['MAIN markers', { link_markers: ['1'] }],
    ['XYZ markers', { summon_kind: 'XYZ', link_markers: ['9'] }],
    ['LINK level', { summon_kind: 'LINK', level: 0 }],
    ['LINK rank', { summon_kind: 'LINK', rank: 0 }],
    ['LINK DEF', { summon_kind: 'LINK', def: 0 }],
    ['LINK PENDULUM', { summon_kind: 'LINK', abilities: ['PENDULUM'] }],
    [
        'LINK scale',
        { summon_kind: 'LINK', abilities: ['PENDULUM'], pendulum_scale: 0 },
    ],
    ['non-PENDULUM scale zero', { pendulum_scale: 0 }],
    [
        'unknown summon non-PENDULUM scale',
        { summon_kind: null, pendulum_scale: 0 },
    ],
];
for (const [name, patch] of contradictory)
    test(`RC Draft rejects ${name} with atomic 422 DOMAIN_VALIDATION`, async (t) => {
        const f = await setup(t);
        const before = f.snapshot();
        const r = await f.patch({ structure: monster(patch) });
        assert.equal(r.statusCode, 422, r.body);
        assert.equal(r.json().code, 'DOMAIN_VALIDATION');
        assert.match(
            r.json().message,
            /rank|level|link_markers|def|PENDULUM|pendulum_scale/,
        );
        assert.deepEqual(f.snapshot(), before);
        assert.equal((await f.get()).revision, f.card.revision);
    });
for (const summon of [
    'MAIN_DECK',
    'RITUAL',
    'FUSION',
    'SYNCHRO',
    'XYZ',
    'LINK',
    null,
])
    test(`RC incomplete Draft ${summon} still persists`, async (t) => {
        const f = await setup(t);
        const r = await f.patch({
            structure: monster({ summon_kind: summon }),
        });
        assert.equal(r.statusCode, 200, r.body);
    });
for (const summon of ['MAIN_DECK', 'RITUAL', 'FUSION', 'SYNCHRO', 'XYZ'])
    test(`RC incomplete ${summon} PENDULUM with null scale still persists`, async (t) => {
        const f = await setup(t);
        const r = await f.patch({
            structure: monster({
                summon_kind: summon,
                abilities: ['EFFECT', 'PENDULUM'],
            }),
        });
        assert.equal(r.statusCode, 200, r.body);
    });
test('RC direct Canonical domain rejects contradictory structure, not only HTTP', async (t) => {
    const f = await setup(t);
    const structure: CanonicalStructureInput = {
        kind: 'MONSTER',
        summonKind: 'MAIN_DECK',
        attributeCode: null,
        raceCode: null,
        level: null,
        rank: 0,
        atk: null,
        def: null,
        pendulumScale: null,
        abilities: [],
        linkMarkers: [],
    };
    assert.throws(
        () =>
            f.service.canonical!.mutateCard(f.card.cardId, f.card.revision, {
                structure,
            }),
        /rank is not applicable to MAIN_DECK/,
    );
});
for (const section of ['TEXT', 'CLASSIFICATION', 'RELATIONS'])
    test(`RC historical contradiction readable; ${section}-only mutation succeeds without cleanup`, async (t) => {
        const f = await setup(t);
        let r = await f.patch({
            structure: monster({
                attribute_code: 'LIGHT',
                race_code: 'DRAGON',
            }),
            localizations: [
                {
                    language: 'EN',
                    name: 'Historical',
                    card_text: null,
                    pendulum_text: '',
                },
            ],
        });
        assert.equal(r.statusCode, 200, r.body);
        f.service
            .persistence!.runRepositoryOperation(db => db).prepare(
                'UPDATE canonical_monster_structure SET rank=0, pendulum_scale=0 WHERE card_id=?',
            )
            .run(f.card.cardId);
        const before = f.snapshot();
        const historical = await f.get();
        assert.deepEqual(f.snapshot(), before);
        assert.equal(historical.structure.rank, 0);
        assert.equal(historical.structure.pendulum_scale, 0);
        const mutation =
            section === 'TEXT'
                ? {
                      localizations: [
                          {
                              language: 'EN',
                              name: 'Updated',
                              card_text: null,
                              pendulum_text: '',
                          },
                      ],
                  }
                : section === 'CLASSIFICATION'
                  ? { classification: { effect_reviewed: true } }
                  : { relations: [] };
        r = await f.patch(mutation);
        assert.equal(r.statusCode, 200, r.body);
        const after = await f.get();
        assert.equal(after.structure.rank, 0);
        assert.equal(after.structure.pendulum_scale, 0);
        assert.equal(after.localizations[0].pendulum_text, '');
        const beforeReject = f.snapshot();
        r = await f.patch({
            structure: { ...after.structure, link_rating: undefined },
        });
        assert.equal(r.statusCode, 422, r.body);
        assert.deepEqual(f.snapshot(), beforeReject);
        await proof('rc-historical-' + section, {
            historical,
            mutation,
            after,
            structure_rejection: r.json(),
        });
    });
test('RC clearing structure preserves dormant Pendulum Text and external empty strings', async (t) => {
    const f = await setup(t);
    let r = await f.patch({
        structure: monster({
            abilities: ['EFFECT', 'PENDULUM'],
            pendulum_scale: 0,
        }),
        localizations: [
            {
                language: 'EN',
                name: 'P',
                card_text: null,
                pendulum_text: 'Dormant text',
            },
            { language: 'ES', name: null, card_text: null, pendulum_text: '' },
        ],
    });
    assert.equal(r.statusCode, 200, r.body);
    r = await f.patch({ structure: monster() });
    assert.equal(r.statusCode, 200, r.body);
    assert.equal(r.json().localizations[0].pendulum_text, 'Dormant text');
    assert.equal(r.json().localizations[1].pendulum_text, '');
});
test('RC confirmed block acknowledgement and stricter confirmation remain unchanged', async (t) => {
    const f = await setup(t);
    let r = await f.patch({
        password: '12345678',
        structure: monster({
            attribute_code: 'LIGHT',
            race_code: 'DRAGON',
            level: 4,
            atk: 1000,
            def: 1000,
        }),
        confirmations: [
            {
                block: 'STRUCTURE',
                state: 'CONFIRMED',
                provenance: { source_kind: 'MANUAL' },
            },
        ],
    });
    assert.equal(r.statusCode, 200, r.body);
    const state = r.json();
    r = await f.patch({ structure: monster() });
    assert.equal(r.statusCode, 422);
    assert.equal((await f.get()).revision, state.revision);
    r = await f.patch({
        structure: monster(),
        confirmations: [{ block: 'STRUCTURE', state: 'DRAFT' }],
    });
    assert.equal(r.statusCode, 200, r.body);
    const incomplete = r.json();
    r = await f.patch({
        confirmations: [
            {
                block: 'STRUCTURE',
                state: 'CONFIRMED',
                provenance: { source_kind: 'MANUAL' },
            },
        ],
    });
    assert.equal(r.statusCode, 422);
    assert.equal((await f.get()).revision, incomplete.revision);
});
