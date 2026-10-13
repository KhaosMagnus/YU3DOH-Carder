import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { mkdtemp, rm, writeFile, mkdir, readFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import Database from 'better-sqlite3';
import { createWorkspaceService, type WorkspaceService } from '../src/service';
import { bootstrapWorkspaceDatabase } from '../src/persistence/operations';
import { loadMigrations } from '../src/persistence/migrations';
import {
    WorkspacePersistence,
    configureOperationalDatabase,
} from '../src/persistence/database';
import { CanonicalDomainService } from '../src/canonical/service';
import {
    YgoResourcesCardAdapter,
    assertExternalCardId,
    SOURCE_MAX_BYTES,
    SOURCE_TIMEOUT_MS,
    type AdapterOptions,
} from '../src/external-sources/adapter';
import { normalizeYgoResources } from '../src/external-sources/normalizer';
import { compareClaim } from '../src/external-sources/diff';
import { ExternalSourceError } from '../src/external-sources/errors';
import type { Claim } from '../src/external-sources/types';
import { loadWorkspaceConfig } from '../src/config';

const raw = readFileSync(
    path.join(__dirname, 'fixtures/ygoresources-card-v1.json'),
    'utf8',
);
const payload = () =>
    JSON.parse(raw) as {
        cardId: unknown;
        cardData: Record<string, Record<string, unknown>>;
    };
const source = (
    body = raw,
    status = 200,
    headers: Record<string, string> = { 'content-type': 'application/json' },
) => new Response(body, { status, headers });
const mock = (
    fn: (url: string, init: RequestInit) => Promise<Response> | Response,
): typeof fetch =>
    ((url, init) => Promise.resolve(fn(String(url), init!))) as typeof fetch;
const code = (value: string) => (e: unknown) =>
    e instanceof ExternalSourceError && e.code === value;
const deferred = () => {
    let resolve!: () => void;
    const promise = new Promise<void>((r) => {
        resolve = r;
    });
    return { promise, resolve };
};
const setup = async (
    t: test.TestContext,
    options: AdapterOptions = {},
    enabled = true,
) => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'YU3DOH RUN020 日本語 '));
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
    const service = await createWorkspaceService(
        {
            workspaceRoot: root,
            host: '127.0.0.1',
            port: 4312,
            ...(enabled
                ? { enabledExternalSources: ['YGORESOURCES_CARD_DB'] }
                : {}),
        },
        {
            externalSourceAdapterOptions: {
                fetch: mock(() => source()),
                ...options,
            },
        },
    );
    t.after(async () => {
        await service.close();
        await rm(root, { recursive: true, force: true });
    });
    const card = service.canonical!.createCard({ family: 'SPELL' });
    const request = {
        target_card_id: card.cardId,
        target_expected_revision: card.revision,
        external_card_id: '17625',
    };
    return { root, manifest, service, card, request };
};
const tables = [
    'external_source_records',
    'external_source_retrievals',
    'external_source_documents',
    'external_source_candidates',
];
const counts = (s: WorkspaceService) =>
    s.persistence!.runRepositoryOperation((db) =>
        tables.map(
            (n) =>
                (
                    db.prepare(`SELECT count(*) AS n FROM ${n}`).get() as {
                        n: number;
                    }
                ).n,
        ),
    );
const authoritative = (s: WorkspaceService) =>
    s.persistence!.runRepositoryOperation((db) =>
        Object.fromEntries(
            (
                db
                    .prepare(
                        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'external_source_%' AND name NOT LIKE 'sqlite_%' ORDER BY name",
                    )
                    .all() as { name: string }[]
            ).map(({ name }) => [
                name,
                db.prepare(`SELECT * FROM "${name}"`).all(),
            ]),
        ),
    );

for (const id of [
    '',
    '0',
    '01',
    ' 1',
    '1 ',
    '1\n',
    '1\r',
    '1\r\n',
    '+1',
    '-1',
    '1.0',
    '1e3',
    '１２',
    '١',
    '1/../../',
    'https://example.com',
    '1?x=2',
    '123456789012345678901',
    1,
    null,
])
    test(`AC15 rejects ID ${JSON.stringify(id)} before remote I/O`, async () => {
        let calls = 0;
        const adapter = new YgoResourcesCardAdapter({
            fetch: mock(() => {
                calls++;
                return source();
            }),
        });
        await assert.rejects(
            adapter.retrieve(id as string, 'doc'),
            code('SOURCE_CARD_ID_INVALID'),
        );
        assert.equal(calls, 0);
    });
test('AC11..18 exact fixed URL, GET, JSON/User-Agent headers, no credentials or caller options', async () => {
    let calls = 0;
    const adapter = new YgoResourcesCardAdapter({
        fetch: mock((url, init) => {
            calls++;
            assert.equal(
                url,
                'https://db.ygoresources.com/data/card/12345678901234567890',
            );
            assert.equal(init.method, 'GET');
            assert.equal(init.redirect, 'manual');
            assert.equal(init.credentials, 'omit');
            assert.deepEqual(init.headers, {
                Accept: 'application/json',
                'User-Agent': 'YU3DOH-Workspace/0.1.0',
            });
            return source();
        }),
    });
    await adapter.retrieve('12345678901234567890', 'doc');
    assert.equal(calls, 1);
    assertExternalCardId('1');
    assertExternalCardId('99999999999999999999');
});
for (const [http, expected] of [
    [301, 'SOURCE_REDIRECT_REJECTED'],
    [302, 'SOURCE_REDIRECT_REJECTED'],
    [307, 'SOURCE_REDIRECT_REJECTED'],
    [308, 'SOURCE_REDIRECT_REJECTED'],
    [404, 'SOURCE_DOCUMENT_NOT_FOUND'],
    [410, 'SOURCE_DOCUMENT_NOT_FOUND'],
    [429, 'SOURCE_RETRIEVAL_FAILED'],
    [500, 'SOURCE_RETRIEVAL_FAILED'],
    [503, 'SOURCE_RETRIEVAL_FAILED'],
    [401, 'SOURCE_RETRIEVAL_FAILED'],
] as const)
    test(`HTTP ${http} -> ${expected}, no retries`, async () => {
        let calls = 0;
        const adapter = new YgoResourcesCardAdapter({
            fetch: mock(() => {
                calls++;
                return source('ignored', http, {
                    'content-type': 'application/json',
                    location: 'https://db.ygoresources.com/data/card/17625',
                });
            }),
        });
        const result = await adapter.retrieve('17625', 'doc');
        assert.equal(result.document.error_code, expected);
        assert.equal(calls, 1);
        assert.equal(result.document.raw_payload, null);
    });
test('AC19 hard 10000ms deadline covers request even if transport ignores abort', async () => {
    let trigger!: () => void,
        calls = 0,
        cancelled = 0;
    const adapter = new YgoResourcesCardAdapter({
        fetch: mock(() => {
            calls++;
            return new Promise<Response>(() => {});
        }),
        deadline: (fn, ms) => {
            assert.equal(ms, 10000);
            trigger = fn;
            return () => {
                cancelled++;
            };
        },
    });
    const pending = adapter.retrieve('17625', 'doc');
    trigger();
    const result = await pending;
    assert.equal(SOURCE_TIMEOUT_MS, 10000);
    assert.equal(result.document.error_code, 'SOURCE_TIMEOUT');
    assert.equal(calls, 1);
    assert.equal(cancelled, 1);
});
test('AC19 deadline also bounds a stalled response body', async () => {
    let trigger!: () => void,
        reads = 0;
    const body = new ReadableStream<Uint8Array>({
        pull() {
            reads++;
            return new Promise<void>(() => {});
        },
    });
    const adapter = new YgoResourcesCardAdapter({
        fetch: mock(
            () =>
                new Response(body, {
                    headers: { 'content-type': 'application/json' },
                }),
        ),
        deadline: (fn) => {
            trigger = fn;
            return () => {};
        },
    });
    const pending = adapter.retrieve('17625', 'doc');
    await new Promise((r) => setImmediate(r));
    trigger();
    assert.equal((await pending).document.error_code, 'SOURCE_TIMEOUT');
    assert.ok(reads <= 1);
});
for (const size of [SOURCE_MAX_BYTES, SOURCE_MAX_BYTES + 1])
    test(`AC22/23 streamed ${size} byte boundary ignores dishonest Content-Length`, async () => {
        let cancelled = false,
            chunks = 0;
        let signal: AbortSignal | null | undefined;
        const bytes = Buffer.from('{}' + ' '.repeat(size - 2));
        const body = new ReadableStream<Uint8Array>({
            pull(controller) {
                if (chunks < bytes.length) {
                    controller.enqueue(
                        bytes.subarray(chunks, (chunks += 65536)),
                    );
                } else controller.close();
            },
            cancel() {
                cancelled = true;
            },
        });
        const adapter = new YgoResourcesCardAdapter({
            fetch: mock((_url, init) => {
                signal = init.signal;
                return new Response(body, {
                    headers: {
                        'content-type': 'application/json',
                        'content-length': '2',
                    },
                });
            }),
        });
        const result = await adapter.retrieve('17625', 'doc');
        assert.equal(
            result.document.status,
            size === SOURCE_MAX_BYTES ? 'SUCCESS' : 'PAYLOAD_TOO_LARGE',
        );
        assert.equal(
            result.document.error_code,
            size === SOURCE_MAX_BYTES ? null : 'SOURCE_PAYLOAD_TOO_LARGE',
        );
        if (size === SOURCE_MAX_BYTES)
            assert.equal(
                result.document.payload_hash,
                createHash('sha256').update(bytes).digest('hex'),
            );
        else assert.ok(cancelled || signal?.aborted);
    });
for (const contentType of [
    'application/json',
    'application/json; charset=utf-8',
    'application/vnd.card+json',
    'application/problem+json; charset="UTF-8"',
    'text/html',
    'text/json',
    'application/javascript',
    'application/jsonx',
])
    test(`AC24 Content-Type ${contentType}`, async () => {
        const result = await new YgoResourcesCardAdapter({
            fetch: mock(() =>
                source(raw, 200, { 'content-type': contentType }),
            ),
        }).retrieve('17625', 'doc');
        assert.equal(
            result.document.error_code,
            contentType.startsWith('application/') &&
                !['application/javascript', 'application/jsonx'].includes(
                    contentType,
                )
                ? null
                : 'SOURCE_CONTENT_TYPE_UNSUPPORTED',
        );
    });
test('AC25 invalid JSON stores hash and inert bounded evidence but no parsed payload', async () => {
    const bytes = '<script>throw new Error()</script>';
    const result = await new YgoResourcesCardAdapter({
        fetch: mock(() => source(bytes)),
    }).retrieve('17625', 'doc');
    assert.equal(result.document.error_code, 'SOURCE_PARSE_FAILED');
    assert.equal(result.document.raw_payload, bytes);
    assert.equal(
        result.document.payload_hash,
        createHash('sha256').update(bytes).digest('hex'),
    );
});
for (const revision of [
    '0',
    '00123',
    '12345678901234567890',
    '',
    '+1',
    ' 1',
    '1 ',
    'abc',
    '١',
])
    test(`AC27 cache revision ${JSON.stringify(revision)} decimal metadata only`, async () => {
        // Headers intentionally normalize HTTP OWS; invalid nondecimal values are still rejected.
        const response = source(raw, 200, {
            'content-type': 'application/json',
            ...(revision === '١' ? {} : { 'x-cache-revision': revision }),
        });
        if (revision === '١') {
            const get = response.headers.get.bind(response.headers);
            Object.defineProperty(response.headers, 'get', {
                value: (name: string) =>
                    name === 'x-cache-revision' ? revision : get(name),
            });
        }
        const actual = response.headers.get('x-cache-revision')!;
        const result = await new YgoResourcesCardAdapter({
            fetch: mock(() => response),
        }).retrieve('17625', 'doc');
        assert.equal(
            result.document.source_cache_revision,
            /^[0-9]+$/.test(actual) ? actual : null,
        );
    });
test('AC26 provider identity string/number matching is exact; unsafe numeric identity fails', () => {
    for (const id of [999, '999', null, undefined, 1.7625, 9007199254740992]) {
        const p = payload();
        p.cardId = id;
        assert.throws(
            () => normalizeYgoResources(p, '17625', 'doc'),
            code('SOURCE_IDENTITY_MISMATCH'),
        );
    }
    const p = payload();
    p.cardId = '17625';
    assert.equal(
        normalizeYgoResources(p, '17625', 'doc').candidate.identity
            .external_record_key,
        '17625',
    );
});
test('AC46..63 locale claims, evidence, absent vs empty, inert FAQ/QA and separate diagnostics', () => {
    const p = payload();
    delete p.cardData.es;
    p.cardData.en!.pendEffect = '';
    const n = normalizeYgoResources(p, '17625', 'doc');
    assert.equal(n.status, 'PARTIAL');
    assert.equal(n.candidate.authoritative, false);
    assert.equal(n.candidate.candidate_schema_version, 1);
    assert.equal(n.candidate.blocks['TEXT:ES'].fields.name!.state, 'ABSENT');
    assert.equal(n.candidate.blocks['TEXT:JP'].fields.name!.state, 'PRESENT');
    assert.deepEqual(n.candidate.blocks['TEXT:EN'].fields.pendulum_text, {
        state: 'PRESENT',
        value: '',
        evidence: {
            document_id: 'doc',
            locale: 'en',
            source_path: 'cardData.en.pendEffect',
        },
    });
    assert.ok(n.diagnostics.some((d) => d.code === 'LOCALE_NOT_AVAILABLE'));
    assert.ok(
        n.diagnostics.every(
            (d) => d.diagnostic_id && d.severity && d.stage && d.message,
        ),
    );
    assert.equal('faqData' in n.candidate, false);
    assert.deepEqual(Object.keys(n.candidate.blocks), [
        'STRUCTURE',
        'TEXT:EN',
        'TEXT:ES',
        'TEXT:JP',
    ]);
});
test('AC64..72 explicit dictionaries, validated stats, level/rank, scale, Link observation never invents markers', () => {
    const p = payload();
    p.cardData.en = {
        name: 'Monster',
        effectText: 'Effect',
        cardType: 'Monster',
        type: 'MONSTER',
        attribute: 'LIGHT',
        englishAttribute: 'light',
        race: 'Dragon',
        summonKind: 'Link',
        level: 3,
        rank: 4,
        atk: '3000',
        def: '?',
        pendulumScale: 8,
        pendScale: '8',
        abilities: ['Effect', 'Pendulum'],
        linkRating: 3,
    };
    const n = normalizeYgoResources(p, '17625', 'doc');
    const f = n.candidate.blocks.STRUCTURE.fields;
    const value = (name: string) => {
        const c = f[name]!;
        assert.equal(c.state, 'PRESENT');
        return c.state === 'PRESENT' ? c.value : undefined;
    };
    assert.equal(value('family'), 'MONSTER');
    assert.equal(value('attribute_code'), 'LIGHT');
    assert.equal(value('race_code'), 'DRAGON');
    assert.equal(value('summon_kind'), 'LINK');
    assert.equal(value('level'), 3);
    assert.equal(value('rank'), 4);
    assert.equal(value('atk'), 3000);
    assert.equal(value('def'), '?');
    assert.equal(value('pendulum_scale'), 8);
    assert.equal(value('link_rating'), 3);
    assert.equal(f.link_markers!.state, 'ABSENT');
    p.cardData.en.linkMarkers = ['NW'];
    assert.equal(
        normalizeYgoResources(p, '17625', 'doc').candidate.blocks.STRUCTURE
            .fields.link_markers!.state,
        'UNMAPPED',
    );
    p.cardData.en.attribute = 'NEW_VALUE';
    delete p.cardData.en.englishAttribute;
    p.cardData.en.def = { bad: true };
    const bad = normalizeYgoResources(p, '17625', 'doc');
    assert.equal(
        bad.candidate.blocks.STRUCTURE.fields.attribute_code!.state,
        'UNMAPPED',
    );
    assert.equal(bad.candidate.blocks.STRUCTURE.fields.def!.state, 'INVALID');
});
for (const [a, b, field] of [
    ['cardType', 'type', 'family'],
    ['attribute', 'englishAttribute', 'attribute_code'],
    ['pendulumScale', 'pendScale', 'pendulum_scale'],
    ['property', 'englishProperty', 'spell_subtype_code'],
    ['pendulumEffectText', 'pendEffect', 'pendulum_text'],
])
    test(`AC72 ${a}/${b} conflicting aliases INVALID`, () => {
        const p = payload();
        p.cardData.en![a!] = 'A';
        p.cardData.en![b!] = 'B';
        const n = normalizeYgoResources(p, '17625', 'doc');
        const block = field === 'pendulum_text' ? 'TEXT:EN' : 'STRUCTURE';
        assert.equal(
            n.candidate.blocks[block].fields[field!]!.state,
            'INVALID',
        );
        assert.ok(n.diagnostics.some((d) => d.code === 'SOURCE_FIELD_INVALID'));
    });
test('root parser structure change and unsupported shape are fatal, not guessed', () => {
    for (const p of [[], null, 'json', { cardId: 17625, cardData: [] }])
        assert.throws(
            () => normalizeYgoResources(p, '17625', 'doc'),
            code('CANDIDATE_NORMALIZATION_FAILED'),
        );
});
test('AC84..89 all six diff statuses and applicability-aware absence', () => {
    const evidence = {
        document_id: 'doc',
        locale: 'en',
        source_path: 'cardData.en.def',
    };
    const c = (state: Claim['state'], value?: unknown) =>
        ({
            state,
            ...(state === 'PRESENT' ? { value } : {}),
            evidence,
        }) as Claim;
    assert.equal(compareClaim(c('PRESENT', 'x'), 'x'), 'SAME');
    assert.equal(compareClaim(c('PRESENT', 'x'), null), 'SOURCE_ONLY');
    assert.equal(compareClaim(c('ABSENT'), 'x'), 'CANONICAL_ONLY');
    assert.equal(compareClaim(c('PRESENT', 'x'), 'y'), 'DIFFERENT');
    assert.equal(compareClaim(c('UNMAPPED'), 'x'), 'UNMAPPED');
    assert.equal(compareClaim(c('INVALID'), 'x'), 'INVALID');
    assert.equal(compareClaim(c('ABSENT'), null, true), 'SAME');
    assert.equal(compareClaim(c('PRESENT', ''), null), 'SOURCE_ONLY');
    assert.equal(
        compareClaim(c('PRESENT', ['TUNER', 'EFFECT']), ['EFFECT', 'TUNER']),
        'SAME',
    );
});
test('AC28 explicitly enabled config only; disabled default makes zero requests', async (t) => {
    assert.deepEqual(
        loadWorkspaceConfig({ env: { YU3DOH_WORKSPACE_ROOT: '/tmp' } })
            .enabledExternalSources,
        [],
    );
    assert.deepEqual(
        loadWorkspaceConfig({
            env: {
                YU3DOH_WORKSPACE_ROOT: '/tmp',
                YU3DOH_ENABLED_EXTERNAL_SOURCES: 'YGORESOURCES_CARD_DB',
            },
        }).enabledExternalSources,
        ['YGORESOURCES_CARD_DB'],
    );
    assert.throws(() =>
        loadWorkspaceConfig({
            env: {
                YU3DOH_WORKSPACE_ROOT: '/tmp',
                YU3DOH_ENABLED_EXTERNAL_SOURCES: 'NEURON',
            },
        }),
    );
    let calls = 0;
    const f = await setup(
        t,
        {
            fetch: mock(() => {
                calls++;
                return source();
            }),
        },
        false,
    );
    await assert.rejects(
        f.service.externalSourceIngestion!.retrieve(f.request),
        code('SOURCE_ADAPTER_DISABLED'),
    );
    assert.equal(calls, 0);
    assert.equal(
        f.service.externalSourceIngestion!.history(f.card.cardId).source
            .enabled,
        false,
    );
});
test('AC23/35..54/73..79 frozen STRICT/FKs, atomic history, versioning, exact raw hash and zero authoritative side effects', async (t) => {
    let calls = 0;
    const f = await setup(t, {
        fetch: mock(() => {
            calls++;
            return source(raw, 200, {
                'content-type': 'application/json',
                'x-cache-revision': '123',
            });
        }),
    });
    const before = authoritative(f.service);
    let transactions = 0;
    const originalTransaction = f.service.persistence!.transaction.bind(
        f.service.persistence,
    );
    Object.defineProperty(f.service.persistence, 'transaction', {
        value: (
            operation: Parameters<WorkspacePersistence['transaction']>[0],
        ) => {
            transactions++;
            return originalTransaction(operation);
        },
    });
    const s = f.service.externalSourceIngestion!;
    const first = await s.retrieve(f.request),
        second = await s.retrieve(f.request);
    assert.equal(transactions, 2, 'Exactly one transaction per publication');
    assert.equal(first.retrieval.status, 'SUCCESS');
    assert.equal(
        second.retrieval.source_record_id,
        first.retrieval.source_record_id,
    );
    assert.notEqual(
        first.retrieval.retrieval_id,
        second.retrieval.retrieval_id,
    );
    assert.deepEqual(counts(f.service), [1, 2, 2, 2]);
    assert.equal(first.retrieval.adapter_version, 1);
    assert.equal(first.candidate!.normalizer_version, 1);
    assert.equal(first.candidate!.candidate_schema_version, 1);
    assert.equal('raw_payload' in first.document, false);
    const full = s.detail(first.retrieval.retrieval_id, true);
    assert.equal(full.document.raw_payload, raw);
    assert.equal(
        full.document.payload_hash,
        createHash('sha256').update(Buffer.from(raw)).digest('hex'),
    );
    assert.equal(full.document.source_cache_revision, '123');
    assert.equal(s.history(f.card.cardId).retrievals.length, 2);
    assert.equal(calls, 2);
    const diff = s.diff(first.candidate!.candidate_id, {
        target_card_id: f.card.cardId,
        target_expected_revision: f.card.revision,
    });
    assert.deepEqual(
        diff.groups.map((g) => g.block),
        ['STRUCTURE', 'TEXT:EN', 'TEXT:ES', 'TEXT:JP'],
    );
    assert.equal(diff.read_only, true);
    assert.deepEqual(authoritative(f.service), before);
    f.service.persistence!.runRepositoryOperation((db) => {
        const rows = db.prepare('PRAGMA table_list').all() as {
            name: string;
            strict: number;
        }[];
        for (const name of tables)
            assert.equal(rows.find((r) => r.name === name)!.strict, 1);
        assert.equal(
            db.prepare('PRAGMA foreign_key_list(external_source_records)').all()
                .length,
            0,
        );
        assert.throws(
            () =>
                db
                    .prepare(
                        'DELETE FROM external_source_retrievals WHERE retrieval_id=?',
                    )
                    .run(first.retrieval.retrieval_id),
            /FOREIGN KEY/,
        );
        assert.throws(
            () =>
                db
                    .prepare(
                        'INSERT INTO external_source_documents SELECT * FROM external_source_documents LIMIT 1',
                    )
                    .run(),
            /UNIQUE/,
        );
    });
    for (const endpoint of [
        `/api/v1/library/external-sources/retrievals/${first.retrieval.retrieval_id}`,
        `/api/v1/library/external-sources/candidates/${first.candidate!.candidate_id}`,
    ]) {
        assert.equal(
            (await f.service.app.inject({ method: 'DELETE', url: endpoint }))
                .statusCode,
            404,
        );
        assert.equal(
            (
                await f.service.app.inject({
                    method: 'PATCH',
                    url: endpoint,
                    payload: {},
                })
            ).statusCode,
            404,
        );
    }
});
test('AC42 trigger-injected candidate publication failure rolls back record/retrieval/document/candidate together', async (t) => {
    const f = await setup(t);
    f.service.persistence!.runRepositoryOperation((db) =>
        db.exec(
            "CREATE TRIGGER fail_candidate BEFORE INSERT ON external_source_candidates BEGIN SELECT RAISE(ABORT,'injected publication failure'); END",
        ),
    );
    await assert.rejects(
        f.service.externalSourceIngestion!.retrieve(f.request),
        code('SOURCE_PUBLICATION_FAILED'),
    );
    assert.deepEqual(counts(f.service), [0, 0, 0, 0]);
});
for (const [body, status, expected] of [
    ['invalid', 200, 'SOURCE_PARSE_FAILED'],
    [
        JSON.stringify({ ...JSON.parse(raw), cardId: 999 }),
        200,
        'SOURCE_IDENTITY_MISMATCH',
    ],
    ['not found', 404, 'SOURCE_DOCUMENT_NOT_FOUND'],
])
    test(`FAILED package ${expected} is durable, no candidate`, async (t) => {
        const f = await setup(t, {
            fetch: mock(() => source(body as string, status as number)),
        });
        const before = authoritative(f.service);
        await assert.rejects(
            f.service.externalSourceIngestion!.retrieve(f.request),
            code(expected as string),
        );
        assert.deepEqual(counts(f.service), [1, 1, 1, 0]);
        assert.deepEqual(authoritative(f.service), before);
        assert.equal(
            f.service.externalSourceIngestion!.history(f.card.cardId)
                .retrievals[0]!.status,
            'FAILED',
        );
    });
test('preflight missing target and revision mismatch cause zero network calls', async (t) => {
    let calls = 0;
    const f = await setup(t, {
        fetch: mock(() => {
            calls++;
            return source();
        }),
    });
    await assert.rejects(
        f.service.externalSourceIngestion!.retrieve({
            ...f.request,
            target_card_id: randomUUID(),
        }),
        code('NOT_FOUND'),
    );
    await assert.rejects(
        f.service.externalSourceIngestion!.retrieve({
            ...f.request,
            target_expected_revision: '999',
        }),
        code('REVISION_CONFLICT'),
    );
    assert.equal(calls, 0);
    assert.deepEqual(counts(f.service), [0, 0, 0, 0]);
});
test('AC80..83 frozen target revision rejects stale diff, cross-card comparison, and automatic adoption', async (t) => {
    const f = await setup(t);
    const s = f.service.externalSourceIngestion!;
    const stored = await s.retrieve(f.request);
    const id = stored.candidate!.candidate_id;
    const other = f.service.canonical!.createCard({ family: 'SPELL' });
    assert.throws(
        () =>
            s.diff(id, {
                target_card_id: other.cardId,
                target_expected_revision: other.revision,
            }),
        code('CANDIDATE_TARGET_MISMATCH'),
    );
    const changed = f.service.canonical!.mutateCard(
        f.card.cardId,
        f.card.revision,
        { password: '12345678' },
    );
    assert.throws(
        () =>
            s.diff(id, {
                target_card_id: f.card.cardId,
                target_expected_revision: f.card.revision,
            }),
        code('REVISION_CONFLICT'),
    );
    assert.throws(
        () =>
            s.diff(id, {
                target_card_id: f.card.cardId,
                target_expected_revision: changed.revision,
            }),
        code('REVISION_CONFLICT'),
    );
});
test('AC91 no DB transaction/read/mutation lease during fetch; card revision change freezes snapshot and later diff conflicts', async (t) => {
    const start = deferred(),
        finish = deferred();
    let f!: Awaited<ReturnType<typeof setup>>;
    f = await setup(t, {
        fetch: mock(async () => {
            f.service.persistence!.runRepositoryOperation((db) =>
                assert.equal(db.inTransaction, false),
            );
            const release =
                f.service.runtime.maintenance.acquireMaintenance('RESTORE');
            release();
            start.resolve();
            await finish.promise;
            return source();
        }),
    });
    const pending = f.service.app.inject({
        method: 'POST',
        url: '/api/v1/library/external-sources/ygoresources/retrieve',
        payload: f.request,
    });
    await start.promise;
    f.service.canonical!.mutateCard(f.card.cardId, f.card.revision, {
        password: '12345678',
    });
    finish.resolve();
    const response = await pending;
    assert.equal(response.statusCode, 200, response.body);
    const stored = response.json();
    assert.equal(stored.retrieval.target_expected_revision, f.card.revision);
    assert.throws(
        () =>
            f.service.externalSourceIngestion!.diff(
                stored.candidate.candidate_id,
                f.request,
            ),
        code('REVISION_CONFLICT'),
    );
});
for (const mode of ['BACKUP', 'RESTORE', 'MIGRATION'] as const)
    test(`AC92 ${mode} owns publication race: no rows or second request`, async (t) => {
        const start = deferred(),
            finish = deferred();
        let calls = 0;
        const f = await setup(t, {
            fetch: mock(async () => {
                calls++;
                start.resolve();
                await finish.promise;
                return source();
            }),
        });
        const pending = f.service.externalSourceIngestion!.retrieve(f.request);
        await start.promise;
        const release = f.service.runtime.maintenance.acquireMaintenance(mode);
        finish.resolve();
        try {
            await assert.rejects(
                pending,
                (e: unknown) =>
                    e instanceof Error &&
                    'code' in e &&
                    e.code === 'WORKSPACE_MAINTENANCE_ACTIVE',
            );
        } finally {
            release();
        }
        assert.equal(calls, 1);
        assert.deepEqual(counts(f.service), [0, 0, 0, 0]);
    });
test('AC93 full runtime reload during HTTP fetch proceeds and rejects stale persistence publication', async (t) => {
    const start = deferred(),
        finish = deferred();
    let calls = 0;
    const f = await setup(t, {
        fetch: mock(async () => {
            calls++;
            start.resolve();
            await finish.promise;
            return source();
        }),
    });
    const old = f.service.persistence;
    const pending = f.service.app.inject({
        method: 'POST',
        url: '/api/v1/library/external-sources/ygoresources/retrieve',
        payload: f.request,
    });
    await start.promise;
    await f.service.runtime.maintenance.maintain('RESTORE', () =>
        f.service.runtime.reload(),
    );
    assert.equal(old!.isOpen, false);
    finish.resolve();
    const response = await pending;
    assert.equal(response.statusCode, 503);
    assert.equal(response.json().code, 'WORKSPACE_NOT_READY');
    assert.equal(calls, 1);
    assert.deepEqual(counts(f.service), [0, 0, 0, 0]);
});
test('AC94 actual Backup/Restore captures schema-7 External Source evidence, then schema-6 restore requires checkpointed migration007', async (t) => {
    const f = await setup(t);
    const s = f.service.externalSourceIngestion!;
    const stored = await s.retrieve(f.request);
    const backup = await f.service.recovery.create('RECOVERY_POINT');
    await s.retrieve(f.request);
    assert.deepEqual(counts(f.service), [1, 2, 2, 2]);
    await f.service.recovery.restore(backup.backup_id);
    assert.equal(f.service.status.state, 'READY');
    assert.deepEqual(counts(f.service), [1, 1, 1, 1]);
    assert.equal(
        f.service.externalSourceIngestion!.detail(
            stored.retrieval.retrieval_id,
            true,
        ).document.raw_payload,
        raw,
    );
    // Construct a real schema-6 database using only original migrations, then take an existing Recovery snapshot.
    await f.service.close();
    await rm(path.join(f.root, 'Data'), { recursive: true, force: true });
    await mkdir(path.join(f.root, 'Data'));
    const db = new Database(path.join(f.root, 'Data/workspace.db'));
    for (const m of loadMigrations().filter((m) => m.version <= 6)) {
        db.exec(m.sql);
        db.prepare(
            'INSERT INTO _workspace_migrations(version,name) VALUES (?,?)',
        ).run(m.version, m.name);
        db.pragma(`user_version=${m.version}`);
    }
    db.close();
    const older = await createWorkspaceService({
        workspaceRoot: f.root,
        host: '127.0.0.1',
        port: 4312,
    });
    t.after(() => older.close());
    assert.equal(older.status.state, 'NEEDS_MIGRATION');
    const oldBackup = await older.recovery.create('RECOVERY_POINT');
    assert.equal(oldBackup.database_schema_version, 6);
    await older.recovery.migrate();
    assert.equal(older.status.database_schema_version, 7);
    await older.recovery.restore(oldBackup.backup_id);
    assert.equal(older.status.state, 'NEEDS_MIGRATION');
    assert.equal(older.status.database_schema_version, 6);
    const migration = await older.recovery.migrate();
    assert.ok('appliedVersions' in migration);
    assert.deepEqual(migration.appliedVersions, [7]);
    assert.equal(older.status.state, 'READY');
    assert.equal(older.status.workspace_format_version, 1);
    const checkpoint = JSON.parse(
        await readFile(
            path.join(f.root, 'Backups', migration.backup_id!, 'backup.json'),
            'utf8',
        ),
    );
    assert.equal(checkpoint.database_schema_version, 6);
    assert.deepEqual(
        older.persistence!.runRepositoryOperation((db) =>
            db
                .prepare(
                    'SELECT version FROM _workspace_migrations ORDER BY version',
                )
                .all(),
        ),
        [1, 2, 3, 4, 5, 6, 7].map((version) => ({ version })),
    );
});
test('HTTP contract rejects extra properties, numeric IDs/revisions, arbitrary URLs, raw query extras; no network preflight leakage', async (t) => {
    let calls = 0;
    const f = await setup(t, {
        fetch: mock(() => {
            calls++;
            return source();
        }),
    });
    for (const payload of [
        { ...f.request, url: 'https://evil.invalid' },
        { ...f.request, external_card_id: 17625 },
        { ...f.request, target_expected_revision: 1 },
        { ...f.request, source_code: 'NEURON' },
    ]) {
        const r = await f.service.app.inject({
            method: 'POST',
            url: '/api/v1/library/external-sources/ygoresources/retrieve',
            payload,
        });
        assert.equal(r.statusCode, 400, r.body);
    }
    assert.equal(calls, 0);
    const badId = await f.service.app.inject({
        method: 'POST',
        url: '/api/v1/library/external-sources/ygoresources/retrieve',
        payload: { ...f.request, external_card_id: '01' },
    });
    assert.equal(badId.statusCode, 422);
    assert.equal(badId.json().code, 'SOURCE_CARD_ID_INVALID');
    const stored = await f.service.externalSourceIngestion!.retrieve(f.request);
    const detail = await f.service.app.inject(
        `/api/v1/library/external-sources/retrievals/${stored.retrieval.retrieval_id}`,
    );
    assert.equal(detail.statusCode, 200);
    assert.equal('raw_payload' in detail.json().document, false);
    const rawDetail = await f.service.app.inject(
        `/api/v1/library/external-sources/retrievals/${stored.retrieval.retrieval_id}?include_raw=true`,
    );
    assert.equal(rawDetail.json().document.raw_payload, raw);
    const badQuery = await f.service.app.inject(
        `/api/v1/library/external-sources/retrievals/${stored.retrieval.retrieval_id}?url=https://evil.invalid`,
    );
    assert.equal(badQuery.statusCode, 400);
    const badDiff = await f.service.app.inject({
        method: 'POST',
        url: `/api/v1/library/external-sources/candidates/${stored.candidate!.candidate_id}/diff`,
        payload: { target_card_id: f.card.cardId },
    });
    assert.equal(badDiff.statusCode, 400);
    assert.equal(calls, 1);
});

test('AC21 every 3xx including 300/304/399 is rejected without redirect following', async () => {
    for (let status = 300; status <= 399; status++) {
        let calls = 0;
        const result = await new YgoResourcesCardAdapter({
            fetch: mock(() => {
                calls++;
                return new Response(null, {
                    status,
                    headers: {
                        location: 'https://db.ygoresources.com/data/card/17625',
                    },
                });
            }),
        }).retrieve('17625', 'doc');
        assert.equal(
            result.document.error_code,
            'SOURCE_REDIRECT_REJECTED',
            String(status),
        );
        assert.equal(calls, 1);
    }
});
test('applicability-aware Link DEF null is absence; subtype dictionaries cannot invent cross-family codes', () => {
    const p = payload();
    p.cardData.en = {
        name: 'Link',
        effectText: 'Text',
        cardType: 'Monster',
        summonKind: 'Link',
        def: null,
        linkRating: 3,
    };
    const link = normalizeYgoResources(p, '17625', 'doc');
    assert.equal(link.candidate.blocks.STRUCTURE.fields.def!.state, 'ABSENT');
    assert.equal(
        compareClaim(link.candidate.blocks.STRUCTURE.fields.def!, null, true),
        'SAME',
    );
    assert.equal(
        link.candidate.blocks.STRUCTURE.fields.link_markers!.state,
        'ABSENT',
    );
    p.cardData.en = {
        name: 'Spell',
        effectText: 'Text',
        cardType: 'Spell',
        property: 'Counter',
    };
    assert.equal(
        normalizeYgoResources(p, '17625', 'doc').candidate.blocks.STRUCTURE
            .fields.spell_subtype_code!.state,
        'UNMAPPED',
    );
});
test('AC42 failed second publication preserves the complete prior snapshot and source record timestamp', async (t) => {
    const f = await setup(t);
    await f.service.externalSourceIngestion!.retrieve(f.request);
    const before = f.service.persistence!.runRepositoryOperation((db) =>
        Object.fromEntries(
            tables.map((name) => [
                name,
                db.prepare(`SELECT * FROM ${name}`).all(),
            ]),
        ),
    );
    f.service.persistence!.runRepositoryOperation((db) =>
        db.exec(
            "CREATE TRIGGER fail_document BEFORE INSERT ON external_source_documents BEGIN SELECT RAISE(ABORT,'document insert failed'); END",
        ),
    );
    await assert.rejects(
        f.service.externalSourceIngestion!.retrieve(f.request),
        code('SOURCE_PUBLICATION_FAILED'),
    );
    assert.deepEqual(
        f.service.persistence!.runRepositoryOperation((db) =>
            Object.fromEntries(
                tables.map((name) => [
                    name,
                    db.prepare(`SELECT * FROM ${name}`).all(),
                ]),
            ),
        ),
        before,
    );
});

test('frozen request identity/revision cannot be changed by an in-process caller during remote I/O', async (t) => {
    const start = deferred(),
        finish = deferred();
    const f = await setup(t, {
        fetch: mock(async () => {
            start.resolve();
            await finish.promise;
            return source();
        }),
    });
    const pending = f.service.externalSourceIngestion!.retrieve(f.request);
    await start.promise;
    f.request.target_card_id = randomUUID();
    f.request.target_expected_revision = '999';
    f.request.external_card_id = '999';
    finish.resolve();
    const stored = await pending;
    assert.equal(stored.retrieval.target_card_id, f.card.cardId);
    assert.equal(stored.retrieval.target_expected_revision, f.card.revision);
    assert.equal(stored.retrieval.external_record_key, '17625');
});

for (const family of [undefined, 'FUTURE_FAMILY'])
    test(`AC64/70 generic property cannot qualify subtype when family is ${String(family)}`, () => {
        const p = payload();
        p.cardData.en = {
            name: 'Unknown family',
            effectText: 'Text',
            property: 'Continuous',
            ...(family ? { cardType: family } : {}),
        };
        const normalized = normalizeYgoResources(p, '17625', 'doc');
        const fields = normalized.candidate.blocks.STRUCTURE.fields;
        assert.equal(fields.family!.state, family ? 'UNMAPPED' : 'ABSENT');
        assert.equal(fields.spell_subtype_code!.state, 'UNMAPPED');
        assert.equal(fields.trap_subtype_code!.state, 'UNMAPPED');
        assert.equal(normalized.status, 'PARTIAL');
        assert.ok(
            normalized.diagnostics.some(
                (d) => d.code === 'SOURCE_FIELD_UNMAPPED',
            ),
        );
    });
