import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { randomUUID, createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import Database from 'better-sqlite3';
import { normalizeYgoResources } from '../src/external-sources/normalizer';
import { applyMigrations, loadMigrations } from '../src/persistence/migrations';
import { createWorkspaceService, type WorkspaceService } from '../src/service';
import { publishPackage } from '../src/external-sources/repository';
import type { Candidate, Diagnostic } from '../src/external-sources/types';

const captured = readFileSync(
    path.join(__dirname, 'fixtures/ygoresources-13036-live-v1.json'),
);
const historical = JSON.parse(
    readFileSync(
        path.join(__dirname, 'fixtures/ygoresources-13036-normalizer-v1.json'),
        'utf8',
    ),
) as {
    candidate: Candidate;
    diagnostics: Diagnostic[];
    status: 'PARTIAL';
};
const payload = () => JSON.parse(captured.toString('utf8'));
const normalized = (source: Record<string, unknown>) => {
    const p = payload();
    p.cardData.en = source;
    return normalizeYgoResources(p, '13036', 'test-document');
};
const monster = (extra: Record<string, unknown> = {}) => ({
    cardType: 'Monster',
    ...extra,
});
const fields = (source: Record<string, unknown>) =>
    normalized(source).candidate.blocks.STRUCTURE.fields;
const value = (
    source: Record<string, unknown>,
    field: string,
    expected: unknown,
) => {
    const claim = fields(source)[field]!;
    assert.equal(claim.state, 'PRESENT');
    assert.deepEqual(claim.state === 'PRESENT' && claim.value, expected);
};
const emit = (file: string, data: unknown) => {
    if (!process.env.YU3DOH_QA_OUTPUT) return;
    mkdirSync(process.env.YU3DOH_QA_OUTPUT, { recursive: true });
    writeFileSync(
        path.join(process.env.YU3DOH_QA_OUTPUT, file),
        JSON.stringify(
            {
                sha: execFileSync('git', ['rev-parse', 'HEAD'], {
                    encoding: 'utf8',
                }).trim(),
                provider_metadata_requests: 0,
                live_provider_requests: 0,
                data,
            },
            null,
            2,
        ),
    );
};

test('RUN022 properties absent stays ABSENT, [] is understood and yields MAIN_DECK/empty abilities', () => {
    for (const field of ['race_code', 'summon_kind', 'abilities'])
        assert.equal(fields(monster())[field]!.state, 'ABSENT');
    value(monster({ properties: [] }), 'summon_kind', 'MAIN_DECK');
    value(monster({ properties: [] }), 'abilities', []);
    assert.equal(
        fields(monster({ properties: [] })).race_code!.state,
        'UNMAPPED',
    );
});
const racePairs: Array<[number, string]> = [
    [1, 'CREATOR_GOD'],
    [3, 'BEAST'],
    [5, 'FISH'],
    [8, 'SPELLCASTER'],
    [9, 'MACHINE'],
    [12, 'WARRIOR'],
    [13, 'BEAST_WARRIOR'],
    [14, 'FIEND'],
    [15, 'FAIRY'],
    [17, 'SEA_SERPENT'],
    [21, 'DRAGON'],
    [22, 'WYRM'],
    [24, 'ROCK'],
    [25, 'PLANT'],
    [29, 'REPTILE'],
    [30, 'CYBERSE'],
    [31, 'AQUA'],
    [32, 'ZOMBIE'],
    [33, 'PSYCHIC'],
    [34, 'INSECT'],
    [35, 'WINGED_BEAST'],
    [36, 'DINOSAUR'],
    [37, 'PYRO'],
    [38, 'THUNDER'],
    [39, 'DIVINE_BEAST'],
    [41, 'ILLUSION'],
];
for (const [id, code] of racePairs)
    test(`RUN022 provider race ${id} maps exactly to ${code}`, () =>
        value(monster({ properties: [id] }), 'race_code', code));
for (const [id, code] of [
    [11, 'FUSION'],
    [18, 'XYZ'],
    [19, 'SYNCHRO'],
    [23, 'LINK'],
    [27, 'RITUAL'],
] as const)
    test(`RUN022 provider summon ${id} maps exactly to ${code}`, () =>
        value(monster({ properties: [30, id] }), 'summon_kind', code));
for (const [id, code] of [
    [2, 'SPECIAL_SUMMON'],
    [4, 'EFFECT'],
    [6, 'NORMAL'],
    [7, 'FLIP'],
    [10, 'UNION'],
    [16, 'PENDULUM'],
    [20, 'TUNER'],
    [26, 'SPIRIT'],
    [28, 'GEMINI'],
    [40, 'TOON'],
] as const)
    test(`RUN022 provider ability ${id} maps exactly to ${code}`, () =>
        value(monster({ properties: [30, id] }), 'abilities', [code]));
test('RUN022 abilities use frozen order independent of provider order; SPECIAL_SUMMON is not a summon kind', () => {
    value(
        monster({ properties: [40, 16, 10, 26, 28, 7, 20, 4, 6, 2, 30] }),
        'abilities',
        [
            'NORMAL',
            'EFFECT',
            'TUNER',
            'FLIP',
            'GEMINI',
            'SPIRIT',
            'TOON',
            'UNION',
            'PENDULUM',
            'SPECIAL_SUMMON',
        ],
    );
    value(monster({ properties: [30, 2] }), 'summon_kind', 'MAIN_DECK');
});
for (const [label, raw] of Object.entries({
    null: null,
    object: {},
    string: '30',
    numericString: [30, '23', 4],
    zero: [0],
    negative: [-1],
    fractional: [23.5],
    duplicate: [30, 30],
    nan: [NaN],
    infinity: [Infinity],
    unsafe: [Number.MAX_SAFE_INTEGER + 1],
})) {
    test(`RUN022 malformed properties ${label} rejects whole observation and retains raw evidence`, () => {
        const n = normalized(monster({ properties: raw }));
        for (const field of ['race_code', 'summon_kind', 'abilities']) {
            const c = n.candidate.blocks.STRUCTURE.fields[field]!;
            assert.equal(c.state, 'INVALID');
            assert.deepEqual(c.state === 'INVALID' && c.raw_value, raw);
        }
        assert.ok(
            n.diagnostics.some(
                (d) =>
                    d.code === 'SOURCE_FIELD_INVALID' &&
                    d.field === null &&
                    d.locale === 'EN',
            ),
        );
    });
}
for (const id of [42, 999, Number.MAX_SAFE_INTEGER])
    test(`RUN022 unknown provider ID ${id} prevents incomplete property claims`, () => {
        const raw = [30, 23, 4, id],
            n = normalized(monster({ properties: raw }));
        for (const field of ['race_code', 'summon_kind', 'abilities']) {
            const c = n.candidate.blocks.STRUCTURE.fields[field]!;
            assert.equal(c.state, 'UNMAPPED');
            assert.deepEqual(c.state === 'UNMAPPED' && c.raw_value, raw);
        }
        assert.ok(
            n.diagnostics.some(
                (d) => d.code === 'SOURCE_FIELD_UNMAPPED' && d.field === null,
            ),
        );
    });
test('RUN022 category collisions are field-local', () => {
    const f = fields(monster({ properties: [30, 31, 23, 4] }));
    assert.equal(f.race_code!.state, 'INVALID');
    assert.equal(f.summon_kind!.state, 'PRESENT');
    assert.equal(f.abilities!.state, 'PRESENT');
    const g = fields(monster({ properties: [30, 23, 18, 4] }));
    assert.equal(g.summon_kind!.state, 'INVALID');
    assert.equal(g.race_code!.state, 'PRESENT');
    assert.equal(g.abilities!.state, 'PRESENT');
});
for (const family of ['Token', 'Spell', 'Trap'])
    test(`RUN022 ${family} properties do not fabricate Monster fields`, () => {
        for (const field of ['race_code', 'summon_kind', 'abilities'])
            assert.equal(
                fields({ cardType: family, properties: [30, 23, 4] })[field]!
                    .state,
                'ABSENT',
            );
    });
test('RUN022 unresolved family properties remain UNMAPPED; no ES/JP fallback', () => {
    for (const field of ['race_code', 'summon_kind', 'abilities'])
        assert.equal(
            fields({ properties: [30, 23, 4] })[field]!.state,
            'UNMAPPED',
        );
    const p = payload();
    delete p.cardData.en.properties;
    p.cardData.es.properties = [30, 23, 4];
    assert.equal(
        normalizeYgoResources(p, '13036', 'doc').candidate.blocks.STRUCTURE
            .fields.race_code!.state,
        'ABSENT',
    );
});
for (const [field, key, direct, expected] of [
    ['race_code', 'race', 'Cyberse', 'CYBERSE'],
    ['summon_kind', 'summonKind', 'Link', 'LINK'],
    ['abilities', 'abilities', ['Effect'], ['EFFECT']],
] as const) {
    test(`RUN022 ${field} direct-only and equivalent properties retain exact source paths`, () => {
        value(monster({ [key]: direct }), field, expected);
        const c = fields(monster({ [key]: direct, properties: [30, 23, 4] }))[
            field
        ]!;
        assert.equal(c.state, 'PRESENT');
        assert.deepEqual(c.evidence.source_paths, [
            `$.cardData.en.${key}`,
            '$.cardData.en.properties',
        ]);
        assert.equal(c.evidence.source_path, `$.cardData.en.${key}`);
    });
    test(`RUN022 ${field} valid direct survives unrelated unknown, invalid/unmapped direct is not repaired`, () => {
        value(
            monster({ [key]: direct, properties: [30, 23, 4, 42] }),
            field,
            expected,
        );
        assert.equal(
            fields(monster({ [key]: null, properties: [30, 23, 4] }))[field]!
                .state,
            'INVALID',
        );
        assert.equal(
            fields(
                monster({
                    [key]: field === 'abilities' ? ['UNKNOWN'] : 'UNKNOWN',
                    properties: [30, 23, 4],
                }),
            )[field]!.state,
            'UNMAPPED',
        );
    });
    test(`RUN022 ${field} direct contradiction is INVALID/AMBIGUOUS with both observations`, () => {
        const properties =
            field === 'race_code'
                ? [21, 23, 4]
                : field === 'summon_kind'
                  ? [30, 18, 4]
                  : [30, 23, 6];
        const n = normalized(monster({ [key]: direct, properties })),
            c = n.candidate.blocks.STRUCTURE.fields[field]!;
        assert.equal(c.state, 'INVALID');
        assert.deepEqual(c.state === 'INVALID' && c.raw_value, {
            [key]: direct,
            properties,
        });
        assert.deepEqual(c.evidence.source_paths, [
            `$.cardData.en.${key}`,
            '$.cardData.en.properties',
        ]);
        assert.ok(
            n.diagnostics.some(
                (d) => d.code === 'SOURCE_FIELD_AMBIGUOUS' && d.field === field,
            ),
        );
    });
}
test('RUN022 direct ability consistency compares sets without rewriting direct order', () => {
    value(
        monster({ abilities: ['Tuner', 'Effect'], properties: [30, 4, 20] }),
        'abilities',
        ['TUNER', 'EFFECT'],
    );
});
for (const [label, raw] of Object.entries({
    empty: '',
    center: '5',
    duplicate: '11',
    space: '813 ',
    separator: '8,1,3',
    zero: '0',
    number: 813,
    array: ['8', '1', '3'],
    null: null,
}))
    test(`RUN022 invalid Link Arrow ${label} rejected without coercion`, () =>
        assert.equal(
            fields(monster({ properties: [30, 23, 4], linkArrows: raw }))
                .link_markers!.state,
            'INVALID',
        ));
for (const [provider, canonical] of [
    ['1', '7'],
    ['2', '8'],
    ['3', '9'],
    ['4', '4'],
    ['6', '6'],
    ['7', '1'],
    ['8', '2'],
    ['9', '3'],
])
    test(`RUN022 Link Arrow ${provider} maps to Canonical ${canonical}`, () =>
        value(
            monster({ properties: [30, 23, 4], linkArrows: provider }),
            'link_markers',
            [canonical],
        ));
test('RUN022 absent arrows never derive from rating; markers never derive rating', () => {
    assert.equal(
        fields(monster({ properties: [30, 23, 4], linkRating: 3 }))
            .link_markers!.state,
        'ABSENT',
    );
    const f = fields(monster({ properties: [30, 23, 4], linkArrows: '318' }));
    assert.equal(f.link_rating!.state, 'ABSENT');
    assert.deepEqual(
        f.link_markers!.state === 'PRESENT' && f.link_markers!.value,
        ['2', '7', '9'],
    );
});
test('RUN022 Link Rating mismatch invalidates both fields with ambiguity diagnostic', () => {
    const n = normalized(
        monster({ properties: [30, 23, 4], linkArrows: '813', linkRating: 2 }),
    );
    for (const field of ['link_markers', 'link_rating']) {
        assert.equal(
            n.candidate.blocks.STRUCTURE.fields[field]!.state,
            'INVALID',
        );
        assert.ok(
            n.diagnostics.some(
                (d) => d.code === 'SOURCE_FIELD_AMBIGUOUS' && d.field === field,
            ),
        );
    }
});
test('RUN022 malformed rating stays invalid, markers are independent; unresolved applicability stays unmapped', () => {
    const f = fields(
        monster({
            properties: [30, 23, 4],
            linkArrows: '813',
            linkRating: 'bad',
        }),
    );
    assert.equal(f.link_rating!.state, 'INVALID');
    assert.equal(f.link_markers!.state, 'PRESENT');
    assert.equal(
        fields(monster({ linkArrows: '813' })).link_markers!.state,
        'UNMAPPED',
    );
    assert.equal(fields({ linkArrows: '813' }).link_markers!.state, 'UNMAPPED');
});
for (const family of ['Spell', 'Trap', 'Token', 'Monster'])
    test(`RUN022 deterministic non-Link ${family} arrows are INVALID`, () => {
        assert.equal(
            fields({ cardType: family, properties: [30, 4], linkArrows: '813' })
                .link_markers!.state,
            'INVALID',
        );
    });
test('RUN022 numeric explicit zero is preserved separately from ABSENT', () => {
    value(monster({ rank: 0, pendulumScale: 0 }), 'rank', 0);
    value(monster({ rank: 0, pendulumScale: 0 }), 'pendulum_scale', 0);
    assert.equal(fields(monster()).rank!.state, 'ABSENT');
    assert.equal(fields(monster()).pendulum_scale!.state, 'ABSENT');
});
test('RUN022 exact accepted 13036 v2 oracle resolves all four v1 warnings without source mutation', () => {
    const p = payload(),
        before = JSON.stringify(p),
        n = normalizeYgoResources(p, '13036', 'doc');
    for (const [field, expected] of Object.entries({
        family: 'MONSTER',
        race_code: 'CYBERSE',
        summon_kind: 'LINK',
        abilities: ['EFFECT'],
        link_rating: 3,
        link_markers: ['2', '7', '9'],
    })) {
        const c = n.candidate.blocks.STRUCTURE.fields[field]!;
        assert.equal(c.state, 'PRESENT');
        assert.deepEqual(c.state === 'PRESENT' && c.value, expected);
    }
    assert.equal(n.status, 'SUCCESS');
    assert.deepEqual(n.diagnostics, []);
    assert.equal(JSON.stringify(p), before);
    for (const field of ['race_code', 'summon_kind', 'abilities'])
        assert.equal(
            n.candidate.blocks.STRUCTURE.fields[field]!.evidence.source_path,
            '$.cardData.en.properties',
        );
    assert.equal(
        createHash('sha256').update(captured).digest('hex'),
        '8607fb3931c142a983c243201dbc42ba8ec27396580aa5be2efd4be628971cbf',
    );
    assert.equal(historical.status, 'PARTIAL');
    assert.equal(historical.diagnostics.length, 4);
    emit('run022-normalized-13036.json', n);
});

const attributes = [
    'DARK',
    'LIGHT',
    'EARTH',
    'WATER',
    'FIRE',
    'WIND',
    'DIVINE',
].sort();
const races = racePairs.map(([, code]) => code).sort();
const markers = ['1', '2', '3', '4', '6', '7', '8', '9'];
const seed7 = (db: Database.Database) => {
    for (const m of loadMigrations().filter((m) => m.version <= 7)) {
        db.exec(m.sql);
        db.prepare(
            'INSERT INTO _workspace_migrations(version,name) VALUES (?,?)',
        ).run(m.version, m.name);
        db.pragma(`user_version=${m.version}`);
    }
};
const registry = (db: Database.Database, table: string) =>
    (
        db.prepare(`SELECT code FROM ${table} ORDER BY code`).all() as {
            code: string;
        }[]
    ).map((r) => r.code);
test('RUN022 fresh 0→8 seeds exactly 7/26/8 standard codes and no marker 5; second migration no-op', () => {
    const db = new Database(':memory:');
    try {
        assert.deepEqual(
            applyMigrations(db).appliedVersions,
            [1, 2, 3, 4, 5, 6, 7, 8],
        );
        assert.deepEqual(registry(db, 'canonical_attributes'), attributes);
        assert.deepEqual(registry(db, 'canonical_races'), races);
        assert.deepEqual(registry(db, 'canonical_link_marker_codes'), markers);
        assert.deepEqual(applyMigrations(db).appliedVersions, []);
    } finally {
        db.close();
    }
});
test('RUN022 migration preserves standard row identity and custom attribute/race/marker including custom 5', () => {
    const db = new Database(':memory:');
    try {
        seed7(db);
        db.exec(
            "INSERT INTO canonical_attributes VALUES ('DARK'),('CUSTOM_ATTRIBUTE'); INSERT INTO canonical_races VALUES ('CYBERSE'),('CUSTOM_RACE'); INSERT INTO canonical_link_marker_codes VALUES ('5'),('CUSTOM_MARKER');",
        );
        const row = db
            .prepare("SELECT rowid FROM canonical_attributes WHERE code='DARK'")
            .get();
        assert.deepEqual(applyMigrations(db).appliedVersions, [8]);
        assert.deepEqual(
            db
                .prepare(
                    "SELECT rowid FROM canonical_attributes WHERE code='DARK'",
                )
                .get(),
            row,
        );
        assert.deepEqual(
            registry(db, 'canonical_attributes'),
            [...attributes, 'CUSTOM_ATTRIBUTE'].sort(),
        );
        assert.deepEqual(
            registry(db, 'canonical_races'),
            [...races, 'CUSTOM_RACE'].sort(),
        );
        assert.deepEqual(
            registry(db, 'canonical_link_marker_codes'),
            [...markers, '5', 'CUSTOM_MARKER'].sort(),
        );
    } finally {
        db.close();
    }
});
test('RUN022 real migration SQL failure rolls back seeds/user_version/history and preserves previous rows', () => {
    const db = new Database(':memory:');
    try {
        seed7(db);
        db.exec(
            "INSERT INTO canonical_attributes VALUES ('CUSTOM'); CREATE TRIGGER stop008 BEFORE INSERT ON canonical_races WHEN NEW.code='CYBERSE' BEGIN SELECT RAISE(ABORT,'injected008'); END;",
        );
        assert.throws(() => applyMigrations(db), /injected008/);
        assert.equal(db.pragma('user_version', { simple: true }), 7);
        assert.equal(
            (
                db
                    .prepare(
                        'SELECT max(version) AS v FROM _workspace_migrations',
                    )
                    .get() as { v: number }
            ).v,
            7,
        );
        assert.deepEqual(registry(db, 'canonical_attributes'), ['CUSTOM']);
        assert.deepEqual(registry(db, 'canonical_races'), []);
        assert.deepEqual(registry(db, 'canonical_link_marker_codes'), []);
    } finally {
        db.close();
    }
});

const setup7 = async (t: test.TestContext, fail = false) => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'YU3DOH RUN022 日本語 '));
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
    await mkdir(path.join(root, 'Data'));
    const db = new Database(path.join(root, manifest.database_path));
    seed7(db);
    db.exec(
        "INSERT INTO canonical_attributes VALUES ('CUSTOM_ATTRIBUTE'); INSERT INTO canonical_races VALUES ('CUSTOM_RACE'); INSERT INTO canonical_link_marker_codes VALUES ('5'),('CUSTOM_MARKER');",
    );
    if (fail)
        db.exec(
            "CREATE TRIGGER stop008 BEFORE INSERT ON canonical_races WHEN NEW.code='CYBERSE' BEGIN SELECT RAISE(ABORT,'injected008'); END;",
        );
    db.close();
    let calls = 0;
    const service = await createWorkspaceService(
        {
            workspaceRoot: root,
            host: '127.0.0.1',
            port: 4312,
            enabledExternalSources: ['YGORESOURCES_CARD_DB'],
        },
        {
            externalSourceAdapterOptions: {
                fetch: (async () => {
                    calls++;
                    return new Response(new Uint8Array(captured), {
                        headers: { 'content-type': 'application/json' },
                    });
                }) as typeof fetch,
            },
        },
    );
    t.after(async () => {
        await service.close();
        await rm(root, { recursive: true, force: true });
    });
    return { root, service, calls: () => calls };
};
const authoritative = (s: WorkspaceService) =>
    s.persistence!.runRepositoryOperation((db) =>
        Object.fromEntries(
            (
                db
                    .prepare(
                        "SELECT name FROM sqlite_master WHERE type='table' AND (name LIKE 'canonical_%' OR name LIKE 'art_%' OR name LIKE 'asset_%') ORDER BY name",
                    )
                    .all() as { name: string }[]
            ).map(({ name }) => [
                name,
                db.prepare(`SELECT * FROM ${name} ORDER BY rowid`).all(),
            ]),
        ),
    );
test('RUN022 schema7 explicit migration/checkpoint/metadata/customs, schema8 restore READY, schema7 restore NEEDS_MIGRATION', async (t) => {
    const f = await setup7(t),
        s = f.service;
    assert.equal(s.status.state, 'NEEDS_MIGRATION');
    assert.equal(s.status.database_schema_version, 7);
    const old = await s.recovery.create('RECOVERY_POINT');
    assert.equal(old.database_schema_version, 7);
    const migrate = await s.recovery.migrate();
    assert.ok('appliedVersions' in migrate);
    assert.deepEqual(migrate.appliedVersions, [8]);
    assert.equal(s.status.state, 'READY');
    const checkpoint = JSON.parse(
        readFileSync(
            path.join(f.root, 'Backups', migrate.backup_id!, 'backup.json'),
            'utf8',
        ),
    );
    assert.equal(checkpoint.database_schema_version, 7);
    const metadata = await s.app.inject('/api/v1/library/editor-metadata');
    assert.equal(metadata.statusCode, 200, metadata.body);
    for (const code of [
        ...attributes,
        ...races,
        ...markers,
        'CUSTOM_ATTRIBUTE',
        'CUSTOM_RACE',
        'CUSTOM_MARKER',
        '5',
    ])
        assert.ok(metadata.body.includes('"' + code + '"'), code);
    const current = await s.recovery.create('RECOVERY_POINT');
    assert.equal(current.database_schema_version, 8);
    await s.recovery.restore(current.backup_id);
    assert.equal(s.status.state, 'READY');
    assert.equal(s.status.database_schema_version, 8);
    await s.recovery.restore(old.backup_id);
    assert.equal(s.status.state, 'NEEDS_MIGRATION');
    assert.equal(s.status.database_schema_version, 7);
    const again = await s.recovery.migrate();
    assert.ok('appliedVersions' in again);
    assert.deepEqual(again.appliedVersions, [8]);
    assert.equal(s.status.state, 'READY');
    assert.equal(f.calls(), 0);
    emit('run022-migration-recovery.json', {
        schema_before: 7,
        schema_after: 8,
        first: migrate,
        checkpoint,
        backup8: current,
        restored_schema7: old,
        explicit_after_restore: again,
        metadata: metadata.json(),
        provider_calls: 0,
    });
});
test('RUN022 failed explicit migration never READY8 and protects schema7 recovery material', async (t) => {
    const { service: s } = await setup7(t, true);
    await assert.rejects(s.recovery.migrate());
    assert.notEqual(s.status.state, 'READY');
    const backups = await s.recovery.list();
    assert.ok(
        backups.some(
            (b) =>
                b.database_schema_version === 7 &&
                b.protection_state === 'MIGRATION_FAILED',
        ),
    );
});
test('RUN022 historical v1 immutable, v2 appends, read-only diff and TEXT Apply both versions remain compatible', async (t) => {
    const f = await setup7(t),
        s = f.service;
    await s.recovery.migrate();
    const card = s.canonical!.createCard({ family: 'MONSTER' }),
        before = authoritative(s),
        timestamp = new Date().toISOString();
    const retrievalId = randomUUID(),
        documentId = 'historical-v1-document',
        candidateId = randomUUID();
    const retrieval = {
        retrieval_id: retrievalId,
        source_record_id: randomUUID(),
        source_code: 'YGORESOURCES_CARD_DB' as const,
        external_record_key: '13036',
        target_card_id: card.cardId,
        target_expected_revision: card.revision,
        adapter_version: 1,
        status: 'PARTIAL' as const,
        error_code: null,
        error_message: null,
        retrieved_at: timestamp,
    };
    s.persistence!.transaction((db) =>
        publishPackage(
            db,
            retrieval.source_record_id,
            retrieval,
            {
                document_id: documentId,
                document_kind: 'CARD_JSON',
                source_ref: 'accepted-capture',
                status: 'SUCCESS',
                http_status: 200,
                content_type: 'application/json',
                payload_hash: createHash('sha256')
                    .update(captured)
                    .digest('hex'),
                raw_payload: captured.toString('utf8'),
                source_cache_revision: null,
                error_code: null,
                error_message: null,
            },
            {
                candidate_id: candidateId,
                retrieval_id: retrievalId,
                candidate_schema_version: 1,
                normalizer_version: 1,
                candidate: historical.candidate,
                diagnostics: historical.diagnostics,
                created_at: timestamp,
            },
        ),
    );
    const old = JSON.stringify(
        s.externalSourceIngestion!.detail(retrievalId, true),
    );
    const fresh = await s.externalSourceIngestion!.retrieve({
        target_card_id: card.cardId,
        target_expected_revision: card.revision,
        external_card_id: '13036',
    });
    assert.equal(fresh.retrieval.status, 'SUCCESS');
    assert.equal(fresh.candidate!.normalizer_version, 2);
    assert.equal(fresh.retrieval.adapter_version, 1);
    assert.equal(fresh.candidate!.candidate_schema_version, 1);
    assert.equal(
        JSON.stringify(s.externalSourceIngestion!.detail(retrievalId, true)),
        old,
    );
    for (const cid of [candidateId, fresh.candidate!.candidate_id]) {
        const diff = await s.app.inject({
            method: 'POST',
            url: `/api/v1/library/external-sources/candidates/${cid}/diff`,
            payload: {
                target_card_id: card.cardId,
                target_expected_revision: card.revision,
            },
        });
        assert.equal(diff.statusCode, 200, diff.body);
        assert.equal(diff.json().read_only, true);
    }
    assert.deepEqual(authoritative(s), before);
    const freshBefore = JSON.stringify(
        s.externalSourceIngestion!.detail(fresh.retrieval.retrieval_id, true),
    );
    for (const cid of [candidateId, fresh.candidate!.candidate_id]) {
        // Each exact candidate is frozen at revision 1: restore a Canonical snapshot via real Backup/Restore between independent Apply proofs.
        const recovery = await s.recovery.create('RECOVERY_POINT');
        const result = await s.app.inject({
            method: 'POST',
            url: `/api/v1/library/external-sources/candidates/${cid}/apply-text`,
            payload: {
                target_card_id: card.cardId,
                target_expected_revision: card.revision,
                selected_fields: [{ block: 'TEXT:EN', field: 'name' }],
                acknowledge_move_to_draft_blocks: [],
            },
        });
        assert.equal(result.statusCode, 200, result.body);
        assert.equal(result.json().changed, true);
        assert.equal(result.json().revision, '2');
        await s.recovery.restore(recovery.backup_id);
    }
    assert.equal(
        JSON.stringify(s.externalSourceIngestion!.detail(retrievalId, true)),
        old,
    );
    assert.equal(
        JSON.stringify(
            s.externalSourceIngestion!.detail(
                fresh.retrieval.retrieval_id,
                true,
            ),
        ),
        freshBefore,
    );
    assert.equal(
        f.calls(),
        1,
        'Exactly one mocked CARD_JSON retrieval; no live network/metadata',
    );
    emit('run022-history-text-regression.json', {
        historical_v1: JSON.parse(old),
        fresh_v2: fresh,
        historical_unchanged: true,
        append_only: true,
        structure_read_only: true,
        text_apply_versions: [1, 2],
        mocked_card_requests: 1,
        metadata_requests: 0,
    });
});
