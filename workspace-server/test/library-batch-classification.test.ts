import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { deflateSync } from 'node:zlib';
import { createWorkspaceService, type WorkspaceService } from '../src/service';
import { bootstrapWorkspaceDatabase } from '../src/persistence/operations';
import type {
    BatchRequest,
    BatchApplyRequest,
    BatchOperation,
} from '../src/library/batch-classification';
import type {
    CanonicalCardSnapshot,
    ClassificationMutation,
} from '../src/canonical/types';
import { authoritativeProjection } from '../src/carder/write-back';

const fixture = async (t: test.TestContext) => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'yu3doh RUN018 日本語 '));
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
    const canonical = service.canonical!;
    const a = canonical.registerNamedEntity('ARCHETYPE', 'Archetype A').id;
    const a2 = canonical.registerNamedEntity('ARCHETYPE', 'Archetype B').id;
    const e = canonical.registerNamedEntity('EFFECT_CLASSIFIER', 'Effect A').id;
    const f = canonical.registerNamedEntity('FUNCTIONAL_TAG', 'Tag A').id;
    const create = (
        classification: ClassificationMutation = {},
        confirmed = false,
    ) => {
        const c = canonical.createCard({
            family: 'SPELL',
            password: '18000001',
        });
        return canonical.mutateCard(c.cardId, c.revision, {
            structure: { kind: 'SPELL', subtypeCode: 'NORMAL' },
            localizations: [
                {
                    language: 'EN',
                    name: 'Batch test',
                    cardText: 'Text',
                    pendulumText: null,
                },
            ],
            classification: { effectReviewed: confirmed, ...classification },
            ...(confirmed
                ? {
                      confirmations: [
                          {
                              block: 'CLASSIFICATION',
                              state: 'CONFIRMED',
                              provenance: { sourceKind: 'QA' },
                          },
                      ],
                  }
                : {}),
        });
    };
    return { root, service, canonical, create, a, a2, e, f };
};
const item = (c: CanonicalCardSnapshot) => ({
    card_id: c.cardId,
    expected_revision: c.revision,
});
const snapshot = (s: WorkspaceService) =>
    s.persistence!.runRepositoryOperation((db) =>
        Object.fromEntries(
            (
                db
                    .prepare(
                        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name",
                    )
                    .all() as { name: string }[]
            ).map(({ name }) => [
                name,
                db.prepare(`SELECT * FROM "${name}"`).all(),
            ]),
        ),
    );
const request = async (s: WorkspaceService, action: string, payload: unknown) =>
    s.app.inject({
        method: 'POST',
        url: `/api/v1/library/batch/classification/${action}`,
        payload: payload as object,
    });

const invalidCases: [string, (r: BatchApplyRequest) => BatchApplyRequest][] = [
    ['empty items', (r) => ({ ...r, items: [] })],
    [
        '201 items',
        (r) => ({
            ...r,
            items: Array.from({ length: 201 }, () => ({
                card_id: randomUUID(),
                expected_revision: '0',
            })),
        }),
    ],
    ['duplicate cards', (r) => ({ ...r, items: [r.items[0]!, r.items[0]!] })],
    [
        'duplicate ADD IDs',
        (r) => ({ ...r, operation: { add_archetype_ids: ['x', 'x'] } }),
    ],
    [
        'duplicate REMOVE IDs',
        (r) => ({ ...r, operation: { remove_functional_tag_ids: ['x', 'x'] } }),
    ],
    [
        'ADD REMOVE overlap',
        (r) => ({
            ...r,
            operation: {
                add_effect_classifier_ids: ['x'],
                remove_effect_classifier_ids: ['x'],
            },
        }),
    ],
    ['empty operation', (r) => ({ ...r, operation: {} })],
];
for (const action of ['preview', 'apply'])
    for (const [name, transform] of invalidCases)
        test(`RUN018 ${action} globally rejects ${name} with zero writes`, async (t) => {
            const { service, create } = await fixture(t);
            const c = create();
            const before = snapshot(service);
            const r = await request(
                service,
                action,
                transform({
                    items: [item(c)],
                    operation: { set_effect_reviewed: true },
                }),
            );
            assert.equal(r.statusCode, 422);
            assert.equal(r.json().code, 'BATCH_OPERATION_INVALID');
            assert.deepEqual(snapshot(service), before);
        });
for (const action of ['preview', 'apply'])
    for (const dimension of [
        'archetype',
        'effect_classifier',
        'functional_tag',
    ])
        for (const kind of ['unknown', 'wrong registry'])
            test(`RUN018 ${action} validates ${dimension} ${kind} before writes`, async (t) => {
                const { service, create, a, f } = await fixture(t);
                const c = create();
                const before = snapshot(service);
                const id =
                    kind === 'unknown'
                        ? randomUUID()
                        : dimension === 'archetype'
                          ? f
                          : a;
                const r = await request(service, action, {
                    items: [item(c)],
                    operation: { [`remove_${dimension}_ids`]: [id] },
                });
                assert.equal(r.statusCode, 422);
                assert.equal(r.json().code, 'BATCH_REGISTRY_REFERENCE_INVALID');
                assert.deepEqual(snapshot(service), before);
            });
for (const [name, extras] of [
    ['duplicate ack', (id: string) => [id, id]],
    ['ack not in items', () => [randomUUID()]],
] as const)
    test(`RUN018 rejects ${name} globally`, async (t) => {
        const { service, create } = await fixture(t);
        const c = create();
        const before = snapshot(service);
        const r = await request(service, 'apply', {
            items: [item(c)],
            operation: { set_effect_reviewed: true },
            acknowledge_move_to_draft_card_ids: extras(c.cardId),
        });
        assert.equal(r.statusCode, 422);
        assert.equal(r.json().code, 'BATCH_OPERATION_INVALID');
        assert.deepEqual(snapshot(service), before);
    });
for (const action of ['preview', 'apply'])
    for (const extra of ['root', 'item', 'operation'])
        test(`RUN018 ${action} rejects additional ${extra} transport property with 400`, async (t) => {
            const { service, create } = await fixture(t);
            const c = create();
            const before = snapshot(service);
            const body: any = {
                items: [item(c)],
                operation: { set_effect_reviewed: true },
            };
            if (extra === 'root') body.preview_id = randomUUID();
            else if (extra === 'item') body.items[0].classification = {};
            else body.operation.password = '123';
            assert.equal(
                (await request(service, action, body)).statusCode,
                400,
            );
            assert.deepEqual(snapshot(service), before);
        });
test('RUN018 Preview mixed statuses, exact response order and full DB zero-write snapshot; never mutateCard', async (t) => {
    const { service, canonical, create } = await fixture(t);
    const draft = create(),
        confirmed = create({}, true),
        noop = create({ effectReviewed: true }),
        stale = create();
    const body: BatchRequest = {
        items: [
            item(draft),
            item(confirmed),
            item(noop),
            { ...item(stale), expected_revision: 'old' },
            { card_id: randomUUID(), expected_revision: '0' },
        ],
        operation: { set_effect_reviewed: true },
    };
    const before = snapshot(service);
    canonical.mutateCard = () => {
        throw new Error('Preview attempted mutation');
    };
    // CONFIRMED is a NO_OP for reviewed=true, so change its associations separately in another preview.
    const r = await request(service, 'preview', body);
    assert.equal(r.statusCode, 200);
    assert.deepEqual(
        r.json().results.map((x: any) => x.status),
        ['WOULD_CHANGE', 'NO_OP', 'NO_OP', 'REVISION_CONFLICT', 'NOT_FOUND'],
    );
    assert.deepEqual(
        r.json().results.map((x: any) => x.card_id),
        body.items.map((i) => i.card_id),
    );
    assert.deepEqual(r.json().summary, {
        selected: 5,
        would_change: 1,
        confirmed_requires_ack: 0,
        no_op: 2,
        revision_conflict: 1,
        domain_validation: 0,
        not_found: 1,
    });
    assert.match(r.json().preview_id, /^[0-9a-f-]{36}$/);
    assert.notEqual(
        (await request(service, 'preview', body)).json().preview_id,
        r.json().preview_id,
    );
    assert.deepEqual(snapshot(service), before);
});
test('RUN018 Preview exposes exact changed CONFIRMED cards without demotion or provenance', async (t) => {
    const { service, create, a } = await fixture(t);
    const c = create({}, true);
    const before = snapshot(service);
    const r = await request(service, 'preview', {
        items: [item(c)],
        operation: { add_archetype_ids: [a] },
    });
    assert.equal(r.json().results[0].status, 'CONFIRMED_REQUIRES_ACK');
    assert.equal(r.json().results[0].requires_move_to_draft, true);
    assert.equal(r.json().results[0].changed, true);
    assert.deepEqual(snapshot(service), before);
});
for (const [dimension, key, snapshotKey] of [
    ['archetype', 'archetypeIds', 'archetypes'],
    ['effect_classifier', 'effectClassifierIds', 'effectClassifiers'],
    ['functional_tag', 'functionalTagIds', 'functionalTags'],
] as const)
    for (const action of ['add', 'remove'] as const)
        test(`RUN018 Apply ${action} ${dimension} changes only the matching set`, async (t) => {
            const x = await fixture(t);
            const id =
                dimension === 'archetype'
                    ? x.a
                    : dimension === 'effect_classifier'
                      ? x.e
                      : x.f;
            const c = x.create({
                archetypeIds: [x.a2],
                effectReviewed: true,
                ...(action === 'remove' ? { [key]: [id] } : {}),
            });
            const original = x.canonical.mutateCard.bind(x.canonical);
            let calls = 0;
            x.canonical.mutateCard = (cardId, revision, mutation) => {
                calls++;
                assert.deepEqual(Object.keys(mutation.classification!), [key]);
                assert.deepEqual(Object.keys(mutation).sort(), [
                    'classification',
                    'provenance',
                ]);
                return original(cardId, revision, mutation);
            };
            const r = x.service.libraryBatchClassification!.apply({
                items: [item(c)],
                operation: { [`${action}_${dimension}_ids`]: [id] },
            });
            assert.equal(r.results[0]!.status, 'SUCCESS');
            assert.equal(calls, 1);
            const next = x.canonical.getCard(c.cardId)!;
            assert.equal(next.revision, String(Number(c.revision) + 1));
            assert.equal(
                next.classification[snapshotKey].some((v) => v.id === id),
                action === 'add',
            );
            for (const field of [
                'effectReviewed',
                'archetypes',
                'effectClassifiers',
                'functionalTags',
            ] as const)
                if (field !== snapshotKey)
                    assert.deepEqual(
                        next.classification[field],
                        c.classification[field],
                    );
        });
for (const value of [true, false, undefined])
    test(`RUN018 effect_reviewed ${String(value)} respects tri-state`, async (t) => {
        const { service, canonical, create, a } = await fixture(t);
        const c = create({ effectReviewed: value !== true });
        const r = service.libraryBatchClassification!.apply({
            items: [item(c)],
            operation: {
                add_archetype_ids: [a],
                ...(value === undefined ? {} : { set_effect_reviewed: value }),
            },
        });
        assert.equal(r.results[0]!.status, 'SUCCESS');
        assert.equal(
            canonical.getCard(c.cardId)!.classification.effectReviewed,
            value ?? c.classification.effectReviewed,
        );
    });
for (const confirmed of [false, true])
    test(`RUN018 semantic no-op ${confirmed ? 'CONFIRMED' : 'DRAFT'} leaves full DB exact and never calls mutateCard`, async (t) => {
        const { service, canonical, create, a, a2, e, f } = await fixture(t);
        const c = create(
            { archetypeIds: [a, a2], effectReviewed: true },
            confirmed,
        );
        const before = snapshot(service);
        canonical.mutateCard = () => {
            throw new Error('No-op attempted mutation');
        };
        const r = service.libraryBatchClassification!.apply({
            items: [item(c)],
            operation: {
                add_archetype_ids: [a2, a],
                remove_effect_classifier_ids: [e],
                remove_functional_tag_ids: [f],
                set_effect_reviewed: true,
            },
        });
        assert.equal(r.results[0]!.status, 'NO_OP');
        assert.equal(r.results[0]!.revision, c.revision);
        assert.equal(r.results[0]!.changed, false);
        assert.equal(r.results[0]!.moved_to_draft, false);
        assert.deepEqual(snapshot(service), before);
    });
for (const scenario of [
    'missing ack',
    'stale ack no-op',
    'unexpected ack DRAFT',
    'accepted ack',
])
    test(`RUN018 acknowledgement ordering ${scenario}`, async (t) => {
        const { service, canonical, create, a } = await fixture(t);
        const confirmed = scenario !== 'unexpected ack DRAFT';
        const c = create({}, confirmed);
        const before = snapshot(service);
        const r = service.libraryBatchClassification!.apply({
            items: [item(c)],
            operation:
                scenario === 'stale ack no-op'
                    ? { set_effect_reviewed: true }
                    : { add_archetype_ids: [a] },
            acknowledge_move_to_draft_card_ids:
                scenario === 'missing ack' ? [] : [c.cardId],
        });
        const expected =
            scenario === 'accepted ack'
                ? 'SUCCESS'
                : scenario === 'missing ack'
                  ? 'CONFIRMED_BLOCK_ACK_REQUIRED'
                  : 'CONFIRMED_BLOCK_STATE_CHANGED';
        assert.equal(r.results[0]!.status, expected);
        if (expected !== 'SUCCESS') assert.deepEqual(snapshot(service), before);
        else {
            const next = canonical.getCard(c.cardId)!;
            assert.equal(r.results[0]!.moved_to_draft, true);
            assert.equal(
                next.confirmations.find((x) => x.block === 'CLASSIFICATION')!
                    .state,
                'DRAFT',
            );
            assert.deepEqual(
                next.confirmations.filter((x) => x.block !== 'CLASSIFICATION'),
                c.confirmations.filter((x) => x.block !== 'CLASSIFICATION'),
            );
            assert.equal(next.provenance.length, c.provenance.length + 1);
        }
    });
const makeInvalidConfirmedText = (
    s: WorkspaceService,
    c: CanonicalCardSnapshot,
) =>
    s.persistence!.runRepositoryOperation((db) => {
        db.prepare(
            "UPDATE canonical_localized_text SET name=NULL WHERE card_id=? AND language='EN'",
        ).run(c.cardId);
        db.prepare(
            "INSERT INTO canonical_block_states(card_id, block_key, state, provenance_id) VALUES (?, 'TEXT:EN', 'CONFIRMED', ?)",
        ).run(c.cardId, c.provenance[0]!.provenanceId);
    });
test('RUN018 mixed SUCCESS/domain rollback/revision conflict/not found preserves independent commits, one revision, exact provenance and boundaries', async (t) => {
    const { root, service, canonical, create, a } = await fixture(t);
    const first = create(),
        invalid = create({}, true),
        stale = create(),
        last = create();
    const crc = (data: Buffer) => {
        let value = 0xffffffff;
        for (const byte of data) {
            value ^= byte;
            for (let bit = 0; bit < 8; bit++)
                value = (value >>> 1) ^ (value & 1 ? 0xedb88320 : 0);
        }
        return (value ^ 0xffffffff) >>> 0;
    };
    const chunk = (kind: string, data: Buffer) => {
        const type = Buffer.from(kind),
            output = Buffer.alloc(12 + data.length);
        output.writeUInt32BE(data.length);
        type.copy(output, 4);
        data.copy(output, 8);
        output.writeUInt32BE(crc(Buffer.concat([type, data])), 8 + data.length);
        return output;
    };
    const header = Buffer.alloc(13);
    header.writeUInt32BE(1);
    header.writeUInt32BE(1, 4);
    header[8] = 8;
    header[9] = 6;
    const source = path.join(root, 'source.png');
    await writeFile(
        source,
        Buffer.concat([
            Buffer.from('89504e470d0a1a0a', 'hex'),
            chunk('IHDR', header),
            chunk('IDAT', deflateSync(Buffer.from([0, 20, 40, 60, 255]))),
            chunk('IEND', Buffer.alloc(0)),
        ]),
    );
    await service.managedAssets!.ingest({
        cardId: first.cardId,
        variantKey: 'default',
        role: 'BS',
        sourceFile: source,
        idempotencyKey: 'run018-populated-boundary',
    });
    assert.ok(service.assets!.listVariants(first.cardId).length);
    makeInvalidConfirmedText(service, invalid);
    const invalidBefore = canonical.getCard(invalid.cardId);
    const before = snapshot(service);
    const body = {
        items: [
            item(first),
            item(invalid),
            { ...item(stale), expected_revision: 'old' },
            { card_id: randomUUID(), expected_revision: '1' },
            item(last),
        ],
        operation: { add_archetype_ids: [a] },
        acknowledge_move_to_draft_card_ids: [invalid.cardId],
        note: 'shared 日本語 note',
    };
    const preview = service.libraryBatchClassification!.preview(body);
    assert.equal(preview.results[1]!.status, 'DOMAIN_VALIDATION');
    assert.deepEqual(snapshot(service), before);
    const r = await request(service, 'apply', body);
    assert.equal(r.statusCode, 200);
    const result = r.json();
    assert.deepEqual(
        result.results.map((x: any) => x.status),
        [
            'SUCCESS',
            'DOMAIN_VALIDATION',
            'REVISION_CONFLICT',
            'NOT_FOUND',
            'SUCCESS',
        ],
    );
    assert.deepEqual(
        result.results.map((x: any) => x.card_id),
        body.items.map((i) => i.card_id),
    );
    assert.deepEqual(result.summary, {
        selected: 5,
        success: 2,
        no_op: 0,
        revision_conflict: 1,
        domain_validation: 1,
        confirmed_block_ack_required: 0,
        confirmed_block_state_changed: 0,
        not_found: 1,
    });
    assert.deepEqual(canonical.getCard(invalid.cardId), invalidBefore);
    assert.deepEqual(canonical.getCard(stale.cardId), stale);
    for (const c of [first, last]) {
        const next = canonical.getCard(c.cardId)!;
        assert.equal(next.revision, String(Number(c.revision) + 1));
        assert.deepEqual(next.structure, c.structure);
        assert.deepEqual(next.localizations, c.localizations);
        assert.deepEqual(next.relations, c.relations);
        assert.deepEqual(next.confirmations, c.confirmations);
        assert.equal(next.password, c.password);
        const provenance = next.provenance.filter(
            (p) => p.sourceKind === 'LIBRARY_BATCH',
        );
        assert.equal(provenance.length, 1);
        assert.deepEqual(
            {
                kind: provenance[0]!.targetKind,
                key: provenance[0]!.targetKey,
                ref: provenance[0]!.sourceRef,
                note: provenance[0]!.note,
            },
            {
                kind: 'BLOCK',
                key: 'CLASSIFICATION',
                ref: `library-batch:${result.batch_operation_id}`,
                note: body.note,
            },
        );
    }
    const after = snapshot(service);
    for (const name of Object.keys(before).filter(
        (n) =>
            /asset|variant|structure|localized|relation/.test(n) ||
            [
                'canonical_archetypes',
                'canonical_effect_classifiers',
                'canonical_functional_tags',
            ].includes(n),
    ))
        assert.deepEqual(after[name], before[name], name);
    assert.equal(result.results[3].previous_revision, null);
    assert.equal(result.results[3].revision, null);
    assert.equal(result.results[1].previous_revision, invalid.revision);
});
test('RUN018 unexpected programming failure propagates normally, preserving earlier commit and avoiding fabricated partial response', async (t) => {
    const { root, service, canonical, create, a } = await fixture(t);
    const first = create(),
        second = create();
    const original = canonical.mutateCard.bind(canonical);
    canonical.mutateCard = (id, revision, mutation) => {
        if (id === second.cardId)
            throw new Error('unexpected infrastructure failure');
        return original(id, revision, mutation);
    };
    const r = await request(service, 'apply', {
        items: [item(first), item(second)],
        operation: { add_archetype_ids: [a] },
    });
    assert.equal(r.statusCode, 500);
    assert.equal(
        canonical.getCard(first.cardId)!.revision,
        String(Number(first.revision) + 1),
    );
    assert.deepEqual(canonical.getCard(second.cardId), second);
});
test('RUN018 valid all-semantic-failures Apply returns 200 with Batch UUID and no writes', async (t) => {
    const { service, create } = await fixture(t);
    const c = create();
    const before = snapshot(service);
    const r = await request(service, 'apply', {
        items: [
            { ...item(c), expected_revision: 'old' },
            { card_id: randomUUID(), expected_revision: '0' },
        ],
        operation: { set_effect_reviewed: true },
    });
    assert.equal(r.statusCode, 200);
    assert.match(r.json().batch_operation_id, /^[0-9a-f-]{36}$/);
    assert.equal(r.json().summary.success, 0);
    assert.deepEqual(snapshot(service), before);
});
test('RUN018 exact 200-item Apply succeeds without splitting and shared provenance UUID', async (t) => {
    const { service, create, canonical } = await fixture(t);
    const cards = Array.from({ length: 200 }, () => create());
    const r = service.libraryBatchClassification!.apply({
        items: cards.map(item),
        operation: { set_effect_reviewed: true },
    });
    assert.equal(r.summary.success, 200);
    assert.equal(
        new Set(
            cards.map(
                (c) => canonical.getCard(c.cardId)!.provenance[0]!.sourceRef,
            ),
        ).size,
        1,
    );
});
for (const mode of [
    'BACKUP',
    'RESTORE',
    'MIGRATION',
    'INITIALIZATION',
] as const)
    test(`RUN018 ${mode} fencing preserves Preview read / Apply mutation distinction`, async (t) => {
        const { service, create } = await fixture(t);
        const c = create();
        const release = service.runtime.maintenance.acquireMaintenance(mode);
        try {
            const p = await request(service, 'preview', {
                items: [item(c)],
                operation: { set_effect_reviewed: true },
            });
            assert.equal(p.statusCode, mode === 'BACKUP' ? 200 : 409);
            const a = await request(service, 'apply', {
                items: [item(c)],
                operation: { set_effect_reviewed: true },
            });
            assert.equal(a.statusCode, 409);
            assert.equal(a.json().code, 'WORKSPACE_MAINTENANCE_ACTIVE');
        } finally {
            release();
        }
    });
test('RUN018 whole Apply owns one mutation lease even between per-card transactions', async (t) => {
    const { service, canonical, create } = await fixture(t);
    const cards = [create(), create()];
    const original = canonical.getCard.bind(canonical);
    let attempts = 0;
    canonical.getCard = (id) => {
        for (const mode of ['BACKUP', 'MIGRATION', 'RESTORE'] as const) {
            attempts++;
            assert.throws(
                () => service.runtime.maintenance.acquireMaintenance(mode),
                (e: any) => e.code === 'WORKSPACE_MAINTENANCE_ACTIVE',
            );
        }
        return original(id);
    };
    assert.equal(
        service.libraryBatchClassification!.apply({
            items: cards.map(item),
            operation: { set_effect_reviewed: true },
        }).summary.success,
        2,
    );
    assert.ok(attempts >= 6);
    const release = service.runtime.maintenance.acquireMaintenance('RESTORE');
    release();
});
test('RUN018 not READY endpoints return stable 503 and runtime reload reconstructs Batch ownership', async (t) => {
    const { service, create } = await fixture(t);
    const c = create();
    const old = service.libraryBatchClassification;
    await service.runtime.reload();
    assert.notEqual(service.libraryBatchClassification, old);
    service.runtime.current.status = {
        ...service.status,
        state: 'RECOVERY_REQUIRED',
        read_only: true,
    };
    for (const action of ['preview', 'apply']) {
        const r = await request(service, action, {
            items: [item(c)],
            operation: { set_effect_reviewed: true },
        });
        assert.equal(r.statusCode, 503);
        assert.equal(r.json().code, 'WORKSPACE_NOT_READY');
    }
});
test('RUN018 successful Batch makes existing RUN017 Carder grant stale without side effects', async (t) => {
    const { service, canonical, create } = await fixture(t);
    const c = create();
    const grant = service.carderWriteGrants.issue({
        cardId: c.cardId,
        contentLanguage: 'EN',
        revision: c.revision,
    });
    const projection = authoritativeProjection(c, 'EN');
    projection.name = 'Preserved local edit';
    service.libraryBatchClassification!.apply({
        items: [item(c)],
        operation: { set_effect_reviewed: true },
    });
    const before = snapshot(service);
    assert.throws(
        () =>
            service.carderWriteBack!.writeBack({
                write_grant: grant,
                card_id: c.cardId,
                expected_revision: c.revision,
                content_language: 'EN',
                projection,
                acknowledge_move_to_draft: [],
            }),
        (e: any) => e.code === 'REVISION_CONFLICT',
    );
    assert.equal(projection.name, 'Preserved local edit');
    assert.deepEqual(snapshot(service), before);
    assert.equal(
        canonical.getCard(c.cardId)!.localizations[0]!.name,
        c.localizations[0]!.name,
    );
});
