import assert from 'node:assert/strict';
import test from 'node:test';
import { randomUUID, createHash } from 'node:crypto';
import { mkdtemp, writeFile, rm, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { createWorkspaceService } from '../src/service';
import { bootstrapWorkspaceDatabase } from '../src/persistence/operations';
import { publishPackage } from '../src/external-sources/repository';
import { ExternalSourceError } from '../src/external-sources/errors';
import type {
    Candidate,
    StoredCandidate,
    Retrieval,
    SourceDocument,
} from '../src/external-sources/types';
import type { ApplyTextRequest } from '../src/external-sources/acceptance-dto';
import type { CanonicalCardMutation } from '../src/canonical/types';
import type { SqliteDatabase } from '../src/persistence/database';

const fields = ['name', 'card_text', 'pendulum_text'] as const;
const blocks = ['TEXT:EN', 'TEXT:ES', 'TEXT:JP'] as const;
const selection = (block = 'TEXT:EN', field = 'name') => ({ block, field });
const setup = async (
    t: test.TestContext,
    { confirmed = [] as string[], pendulum = false } = {},
) => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'YU3DOH RUN021 日本語 '));
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
    let providerCalls = 0;
    const service = await createWorkspaceService(
        { workspaceRoot: root, host: '127.0.0.1', port: 4312 },
        {
            externalSourceAdapterOptions: {
                fetch: (async () => {
                    providerCalls++;
                    throw new Error('Provider forbidden during Apply');
                }) as typeof fetch,
            },
        },
    );
    t.after(async () => {
        await service.close();
        await rm(root, { recursive: true, force: true });
    });
    let card = service.canonical!.createCard({
        family: pendulum ? 'MONSTER' : 'SPELL',
    });
    if (pendulum) {
        service.canonical!.registerStructuralCode('ABILITY', 'PENDULUM');
        card = service.canonical!.mutateCard(card.cardId, card.revision, {
            structure: {
                kind: 'MONSTER',
                summonKind: 'MAIN_DECK',
                attributeCode: null,
                raceCode: null,
                level: null,
                rank: null,
                atk: null,
                def: null,
                pendulumScale: null,
                abilities: ['PENDULUM'],
                linkMarkers: [],
            },
        });
    }
    card = service.canonical!.mutateCard(card.cardId, card.revision, {
        localizations: [
            {
                language: 'EN',
                name: 'Old name',
                cardText: 'Current text',
                pendulumText: pendulum ? 'Old pendulum' : null,
            },
            {
                language: 'ES',
                name: 'Nombre',
                cardText: 'Texto',
                pendulumText: pendulum ? 'Péndulo' : null,
            },
        ],
        confirmations: confirmed.map((b) => ({
            block: b as 'TEXT:EN',
            state: 'CONFIRMED',
            provenance: {
                sourceKind: 'MANUAL',
                sourceRef: 'confirmation-before-apply',
            },
        })),
    });
    const retrievalId = randomUUID(),
        candidateId = randomUUID(),
        documentId = randomUUID(),
        timestamp = new Date().toISOString();
    const candidate: Candidate = {
        candidate_schema_version: 1,
        authoritative: false,
        identity: {
            source_code: 'YGORESOURCES_CARD_DB',
            external_record_key: '13036',
        },
        blocks: {
            STRUCTURE: { fields: {} },
            'TEXT:EN': { fields: {} },
            'TEXT:ES': { fields: {} },
            'TEXT:JP': { fields: {} },
        },
    };
    const values = {
        EN: ['New name', 'Current text', ''],
        ES: ['Nombre', 'Nuevo texto', 'Nuevo péndulo'],
        JP: ['日本語', '日本語テキスト', '日本語Ｐ'],
    };
    for (const block of blocks)
        for (const [i, field] of fields.entries())
            candidate.blocks[block].fields[field] = {
                state: 'PRESENT',
                value: values[block.slice(5) as 'EN'][i]!,
                evidence: {
                    document_id: documentId,
                    locale: block.slice(5) as 'EN',
                    source_path: '$.fixture.' + field,
                },
            };
    const stored: StoredCandidate = {
        candidate_id: candidateId,
        retrieval_id: retrievalId,
        candidate_schema_version: 1,
        normalizer_version: 1,
        candidate,
        diagnostics: [],
        created_at: timestamp,
    };
    const retrieval: Retrieval = {
        retrieval_id: retrievalId,
        source_record_id: randomUUID(),
        source_code: 'YGORESOURCES_CARD_DB',
        external_record_key: '13036',
        target_card_id: card.cardId,
        target_expected_revision: card.revision,
        adapter_version: 1,
        status: 'PARTIAL',
        error_code: null,
        error_message: null,
        retrieved_at: timestamp,
    };
    const document: SourceDocument = {
        document_id: documentId,
        document_kind: 'CARD_JSON',
        source_ref: 'captured-fixture',
        status: 'SUCCESS',
        http_status: 200,
        content_type: 'application/json',
        payload_hash: createHash('sha256').update('{}').digest('hex'),
        raw_payload: '{}',
        source_cache_revision: null,
        error_code: null,
        error_message: null,
    };
    service.persistence!.transaction((db) =>
        publishPackage(
            db,
            retrieval.source_record_id,
            retrieval,
            document,
            stored,
        ),
    );
    const body: ApplyTextRequest = {
        target_card_id: card.cardId,
        target_expected_revision: card.revision,
        selected_fields: [
            selection() as ApplyTextRequest['selected_fields'][number],
        ],
        acknowledge_move_to_draft_blocks: [],
    };
    let mutations = 0,
        transactions = 0;
    let mutation: CanonicalCardMutation | undefined;
    const original = service.canonical!.mutateCard.bind(service.canonical);
    Object.defineProperty(service.canonical, 'mutateCard', {
        configurable: true,
        value: (id: string, revision: string, m: CanonicalCardMutation) => {
            mutations++;
            mutation = m;
            assert.throws(() =>
                service.runtime.maintenance.acquireMaintenance('BACKUP'),
            );
            return original(id, revision, m);
        },
    });
    const transaction = service.persistence!.transaction.bind(
        service.persistence,
    );
    Object.defineProperty(service.persistence, 'transaction', {
        configurable: true,
        value: <T>(op: (db: SqliteDatabase) => T) => {
            transactions++;
            return transaction(op);
        },
    });
    const snapshot = () =>
        service.persistence!.runRepositoryOperation((db) =>
            Object.fromEntries(
                (
                    db
                        .prepare(
                            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
                        )
                        .all() as { name: string }[]
                ).map(({ name }) => [
                    name,
                    db.prepare(`SELECT * FROM "${name}"`).all(),
                ]),
            ),
        );
    const invoke = (value: unknown = body, id: string = candidateId) =>
        service.app.inject({
            method: 'POST',
            url: `/api/v1/library/external-sources/candidates/${encodeURIComponent(id)}/apply-text`,
            payload: value as object,
        });
    const tamper = (change: (c: any) => void) =>
        service.persistence!.runRepositoryOperation((db) => {
            const row = db
                .prepare(
                    'SELECT candidate_json FROM external_source_candidates WHERE candidate_id=?',
                )
                .get(candidateId) as { candidate_json: string };
            const c = JSON.parse(row.candidate_json);
            change(c);
            db.prepare(
                'UPDATE external_source_candidates SET candidate_json=? WHERE candidate_id=?',
            ).run(JSON.stringify(c), candidateId);
        });
    return {
        root,
        service,
        card,
        body,
        candidateId,
        retrievalId,
        stored,
        invoke,
        tamper,
        snapshot,
        counts: () => ({ mutations, transactions, providerCalls }),
        mutation: () => mutation,
    };
};
const error = async (
    f: Awaited<ReturnType<typeof setup>>,
    body: unknown,
    status: number,
    code: string | null,
    id: string = f.candidateId,
) => {
    const before = f.snapshot();
    const r = await f.invoke(body, id);
    assert.equal(r.statusCode, status, r.body);
    if (code !== null) assert.equal(r.json().code, code);
    assert.deepEqual(f.snapshot(), before);
    assert.equal(f.counts().providerCalls, 0);
    return r;
};
for (const [label, alter] of [
    [
        'missing required',
        (b: any) => {
            delete b.selected_fields;
        },
    ],
    [
        'numeric revision',
        (b: any) => {
            b.target_expected_revision = 2;
        },
    ],
    [
        'trailing newline revision',
        (b: any) => {
            b.target_expected_revision = '2\n';
        },
    ],
    [
        'zero revision',
        (b: any) => {
            b.target_expected_revision = '0';
        },
    ],
    [
        'additional property',
        (b: any) => {
            b.values = { name: 'client text' };
        },
    ],
    [
        'nested extra',
        (b: any) => {
            b.selected_fields[0].value = 'client text';
        },
    ],
    [
        'empty selection',
        (b: any) => {
            b.selected_fields = [];
        },
    ],
    [
        'too many',
        (b: any) => {
            b.selected_fields = Array(10).fill(selection());
        },
    ],
    [
        'duplicate pair',
        (b: any) => {
            b.selected_fields = [selection(), selection()];
        },
    ],
    [
        'missing ack',
        (b: any) => {
            delete b.acknowledge_move_to_draft_blocks;
        },
    ],
    [
        'duplicate ack',
        (b: any) => {
            b.acknowledge_move_to_draft_blocks = ['TEXT:EN', 'TEXT:EN'];
        },
    ],
    [
        'unsupported ack',
        (b: any) => {
            b.acknowledge_move_to_draft_blocks = ['STRUCTURE'];
        },
    ],
    [
        'unsupported block',
        (b: any) => {
            b.selected_fields = [selection('STRUCTURE')];
        },
    ],
    [
        'unsupported field',
        (b: any) => {
            b.selected_fields = [selection('TEXT:EN', 'password')];
        },
    ],
    [
        'null note',
        (b: any) => {
            b.note = null;
        },
    ],
    [
        'numeric target',
        (b: any) => {
            b.target_card_id = 123;
        },
    ],
    ['array body', (b: any) => []],
] as const)
    test(`RUN021 malformed ${label} -> stable 400 and zero writes`, async (t) => {
        const f = await setup(t);
        const b = structuredClone(f.body);
        const v = alter(b);
        await error(f, v ?? b, 400, 'EXTERNAL_APPLY_OPERATION_INVALID');
    });
test('RUN021 missing candidate -> 404 before target/revision/claims', async (t) => {
    const f = await setup(t);
    await error(
        f,
        { ...f.body, target_card_id: 'other', target_expected_revision: '999' },
        404,
        'NOT_FOUND',
        'absent',
    );
});
for (const [label, change] of [
    [
        'authoritative',
        (c: any) => {
            c.authoritative = true;
        },
    ],
    [
        'schema',
        (c: any) => {
            c.candidate_schema_version = 2;
        },
    ],
    [
        'identity source',
        (c: any) => {
            c.identity.source_code = 'OTHER';
        },
    ],
    [
        'external identity',
        (c: any) => {
            c.identity.external_record_key = 'other';
        },
    ],
    [
        'missing identity',
        (c: any) => {
            delete c.identity;
        },
    ],
    [
        'null candidate',
        (c: any) => {
            c.candidate_schema_version = null;
        },
    ],
] as const)
    test(`RUN021 incompatible ${label} precedes target mismatch`, async (t) => {
        const f = await setup(t);
        f.tamper(change);
        await error(
            f,
            { ...f.body, target_card_id: 'other' },
            422,
            'EXTERNAL_CANDIDATE_NOT_ELIGIBLE',
        );
    });
for (const [column, value] of [['candidate_schema_version', 2]] as const)
    test('RUN021 stored schema incompatibility', async (t) => {
        const f = await setup(t);
        f.service.persistence!.runRepositoryOperation((db) =>
            db
                .prepare(`UPDATE external_source_candidates SET ${column}=?`)
                .run(value),
        );
        await error(f, f.body, 422, 'EXTERNAL_CANDIDATE_NOT_ELIGIBLE');
    });
test('RUN021 wrong retrieval source rejects candidate', async (t) => {
    const f = await setup(t);
    f.service.persistence!.runRepositoryOperation((db) =>
        db
            .prepare("UPDATE external_source_records SET source_code='OTHER'")
            .run(),
    );
    await error(f, f.body, 422, 'EXTERNAL_CANDIDATE_NOT_ELIGIBLE');
});
test('RUN021 FAILED retrieval rejects candidate', async (t) => {
    const f = await setup(t);
    f.service.persistence!.runRepositoryOperation((db) =>
        db
            .prepare("UPDATE external_source_retrievals SET status='FAILED'")
            .run(),
    );
    await error(f, f.body, 422, 'EXTERNAL_CANDIDATE_NOT_ELIGIBLE');
});
test('RUN021 target mismatch precedes frozen revision mismatch', async (t) => {
    const f = await setup(t);
    await error(
        f,
        { ...f.body, target_card_id: 'other', target_expected_revision: '999' },
        409,
        'CANDIDATE_TARGET_MISMATCH',
    );
});
test('RUN021 frozen revision mismatch precedes field eligibility', async (t) => {
    const f = await setup(t);
    f.tamper((c) => {
        c.blocks['TEXT:EN'].fields.name.state = 'ABSENT';
    });
    await error(
        f,
        { ...f.body, target_expected_revision: '999' },
        409,
        'REVISION_CONFLICT',
    );
});
test('RUN021 current revision mismatch precedes field eligibility', async (t) => {
    const f = await setup(t);
    f.service.canonical!.addProvenance(f.card.cardId, f.card.revision, {
        sourceKind: 'MANUAL',
        targetKind: 'CARD',
        targetKey: 'IDENTITY',
    });
    f.tamper((c) => {
        c.blocks['TEXT:EN'].fields.name.state = 'ABSENT';
    });
    await error(f, f.body, 409, 'REVISION_CONFLICT');
});
for (const state of ['ABSENT', 'UNMAPPED', 'INVALID', 'MISSING'])
    test(`RUN021 selected ${state} cannot write or delete Canonical`, async (t) => {
        const f = await setup(t);
        f.tamper((c) => {
            if (state === 'MISSING') delete c.blocks['TEXT:EN'].fields.name;
            else c.blocks['TEXT:EN'].fields.name.state = state;
        });
        await error(f, f.body, 422, 'EXTERNAL_FIELD_NOT_ELIGIBLE');
    });
for (const value of [null, 1, {}, [], true])
    test(`RUN021 PRESENT non-string ${JSON.stringify(value)} -> 422`, async (t) => {
        const f = await setup(t);
        f.tamper((c) => {
            c.blocks['TEXT:EN'].fields.name.value = value;
        });
        await error(f, f.body, 422, 'EXTERNAL_FIELD_NOT_ELIGIBLE');
    });
test('RUN021 inapplicable Pendulum uses current Canonical, not candidate STRUCTURE', async (t) => {
    const f = await setup(t);
    f.tamper((c) => {
        c.blocks.STRUCTURE.fields.abilities = {
            state: 'PRESENT',
            value: ['PENDULUM'],
        };
    });
    await error(
        f,
        { ...f.body, selected_fields: [selection('TEXT:EN', 'pendulum_text')] },
        422,
        'EXTERNAL_FIELD_NOT_APPLICABLE',
    );
});
test('RUN021 selected claim eligibility precedes Pendulum applicability across all selections', async (t) => {
    const f = await setup(t);
    f.tamper((c) => {
        c.blocks['TEXT:ES'].fields.name.state = 'ABSENT';
    });
    await error(
        f,
        {
            ...f.body,
            selected_fields: [
                selection('TEXT:EN', 'pendulum_text'),
                selection('TEXT:ES', 'name'),
            ],
        },
        422,
        'EXTERNAL_FIELD_NOT_ELIGIBLE',
    );
});
test('RUN021 applicable Pendulum PRESENT empty string replaces persisted nonempty text exactly', async (t) => {
    const f = await setup(t, { pendulum: true });
    const r = await f.invoke({
        ...f.body,
        selected_fields: [selection('TEXT:EN', 'pendulum_text')],
    });
    assert.equal(r.statusCode, 200, r.body);
    assert.equal(
        f.service.canonical!.getCard(f.card.cardId)!.localizations[0]!
            .pendulumText,
        '',
    );
    assert.equal(f.counts().mutations, 1);
});
test('RUN021 PRESENT empty string differs from Canonical null; missing localization starts null/null/null', async (t) => {
    const f = await setup(t);
    f.tamper((c) => {
        c.blocks['TEXT:JP'].fields.name.value = '';
    });
    const r = await f.invoke({
        ...f.body,
        selected_fields: [selection('TEXT:JP', 'name')],
    });
    assert.equal(r.statusCode, 200, r.body);
    const jp = f.service
        .canonical!.getCard(f.card.cardId)!
        .localizations.find((l) => l.language === 'JP');
    assert.deepEqual(jp, {
        language: 'JP',
        name: '',
        cardText: null,
        pendulumText: null,
    });
});
for (const value of ['Old name', 'Old name ', '  text  ', 'e\u0301', ''])
    test(`RUN021 exact equality preserves text ${JSON.stringify(value)} without normalization`, async (t) => {
        const f = await setup(t);
        f.tamper((c) => {
            c.blocks['TEXT:EN'].fields.name.value = value;
        });
        const r = await f.invoke();
        assert.equal(r.statusCode, 200, r.body);
        assert.equal(r.json().changed, value !== 'Old name');
        assert.equal(
            f.service.canonical!.getCard(f.card.cardId)!.localizations[0]!.name,
            value,
        );
    });
for (const ack of [[], ['TEXT:EN'], ['TEXT:ES'], ['TEXT:ES', 'TEXT:JP']])
    test(`RUN021 exact ack ${JSON.stringify(ack)} validates stale before missing`, async (t) => {
        const f = await setup(t, { confirmed: ['TEXT:EN'] });
        if (ack.length === 1 && ack[0] === 'TEXT:EN') {
            const r = await f.invoke({
                ...f.body,
                acknowledge_move_to_draft_blocks: ack,
            });
            assert.equal(r.statusCode, 200, r.body);
            assert.deepEqual(r.json().moved_to_draft, ['TEXT:EN']);
        } else
            await error(
                f,
                { ...f.body, acknowledge_move_to_draft_blocks: ack },
                409,
                ack.length
                    ? 'CONFIRMED_BLOCK_STATE_CHANGED'
                    : 'CONFIRMED_BLOCK_ACK_REQUIRED',
            );
    });
test('RUN021 all-no-op invokes zero mutateCard/transaction, keeps revision/provenance/confirmations and candidate reusable', async (t) => {
    const f = await setup(t, { confirmed: ['TEXT:EN'] });
    const before = f.snapshot();
    const r = await f.invoke({
        ...f.body,
        selected_fields: [selection('TEXT:EN', 'card_text')],
    });
    assert.equal(r.statusCode, 200, r.body);
    assert.deepEqual(r.json(), {
        card_id: f.card.cardId,
        candidate_id: f.candidateId,
        changed: false,
        previous_revision: f.card.revision,
        revision: f.card.revision,
        changed_blocks: [],
        moved_to_draft: [],
        changed_fields: [],
        no_op_fields: [selection('TEXT:EN', 'card_text')],
    });
    assert.deepEqual(f.snapshot(), before);
    assert.deepEqual(f.counts(), {
        mutations: 0,
        transactions: 0,
        providerCalls: 0,
    });
    const noOpCard = f.service.canonical!.getCard(f.card.cardId)!;
    const noOpCounts = f.counts();
    const next = await f.invoke({
        ...f.body,
        acknowledge_move_to_draft_blocks: ['TEXT:EN'],
    });
    assert.equal(next.statusCode, 200, next.body);
    if (process.env.YU3DOH_QA_OUTPUT) {
        await mkdir(process.env.YU3DOH_QA_OUTPUT, { recursive: true });
        await writeFile(
            path.join(
                process.env.YU3DOH_QA_OUTPUT,
                'selective-text-no-op.json',
            ),
            JSON.stringify(
                {
                    sha: execFileSync('git', ['rev-parse', 'HEAD'], {
                        encoding: 'utf8',
                    }).trim(),
                    before: f.card,
                    after: noOpCard,
                    counts: noOpCounts,
                    response: r.json(),
                    mutate_calls: 0,
                    unchanged_snapshot: true,
                    provider_requests: 0,
                },
                null,
                2,
            ),
        );
    }
});
test('RUN021 all-no-op with stale acknowledgement still rejects', async (t) => {
    const f = await setup(t, { confirmed: ['TEXT:EN'] });
    await error(
        f,
        {
            ...f.body,
            selected_fields: [selection('TEXT:EN', 'card_text')],
            acknowledge_move_to_draft_blocks: ['TEXT:EN'],
        },
        409,
        'CONFIRMED_BLOCK_STATE_CHANGED',
    );
});
test('RUN021 no-op-only CONFIRMED block omitted; mixed DRAFT change causes no demotion of unrelated block', async (t) => {
    const f = await setup(t, { confirmed: ['TEXT:EN'] });
    const r = await f.invoke({
        ...f.body,
        selected_fields: [
            selection('TEXT:ES', 'card_text'),
            selection('TEXT:EN', 'card_text'),
        ],
    });
    assert.equal(r.statusCode, 200, r.body);
    assert.deepEqual(r.json().changed_blocks, ['TEXT:ES']);
    assert.deepEqual(r.json().moved_to_draft, []);
    assert.deepEqual(
        f.mutation()!.localizations!.map((l) => l.language),
        ['ES'],
    );
    assert.equal(
        f.service
            .canonical!.getCard(f.card.cardId)!
            .confirmations.find((c) => c.block === 'TEXT:EN')!.state,
        'CONFIRMED',
    );
});
test('RUN021 changed self-review: mixed changes/no-op, CONFIRMED demotion, DRAFT preservation, deterministic provenance and stale second Apply/Diff', async (t) => {
    const f = await setup(t, { confirmed: ['TEXT:EN'] });
    const before = f.snapshot();
    const beforeCard = f.service.canonical!.getCard(f.card.cardId)!;
    const request = {
        ...f.body,
        selected_fields: [
            selection('TEXT:ES', 'card_text'),
            selection('TEXT:EN', 'card_text'),
            selection('TEXT:EN', 'name'),
        ],
        acknowledge_move_to_draft_blocks: ['TEXT:EN'],
        note: '  reviewed source  ',
    };
    const r = await f.invoke(request);
    assert.equal(r.statusCode, 200, r.body);
    const result = r.json();
    assert.equal(result.revision, (BigInt(f.card.revision) + 1n).toString());
    assert.deepEqual(result.changed_fields, [
        selection('TEXT:EN', 'name'),
        selection('TEXT:ES', 'card_text'),
    ]);
    assert.deepEqual(result.no_op_fields, [selection('TEXT:EN', 'card_text')]);
    assert.deepEqual(f.counts(), {
        mutations: 1,
        transactions: 1,
        providerCalls: 0,
    });
    const afterCard = f.service.canonical!.getCard(f.card.cardId)!;
    assert.equal(afterCard.localizations[0]!.cardText, 'Current text');
    assert.equal(
        afterCard.localizations.find((l) => l.language === 'ES')!.name,
        'Nombre',
    );
    assert.equal(
        afterCard.confirmations.find((c) => c.block === 'TEXT:EN')!.state,
        'DRAFT',
    );
    assert.equal(
        afterCard.confirmations.find((c) => c.block === 'TEXT:EN')!
            .provenanceId,
        null,
    );
    const provenance = afterCard.provenance.filter(
        (p) => p.sourceKind === 'EXTERNAL_SOURCE',
    );
    assert.deepEqual(
        provenance.map((p) => ({
            kind: p.targetKind,
            key: p.targetKey,
            ref: p.sourceRef,
            note: p.note,
        })),
        [
            {
                kind: 'BLOCK',
                key: 'TEXT:EN',
                ref: `workspace-external-candidate/${f.candidateId}/TEXT:EN/name`,
                note: 'reviewed source',
            },
            {
                kind: 'BLOCK',
                key: 'TEXT:ES',
                ref: `workspace-external-candidate/${f.candidateId}/TEXT:ES/card_text`,
                note: 'reviewed source',
            },
        ],
    );
    assert.deepEqual(Object.keys(f.mutation()!).sort(), [
        'confirmations',
        'localizations',
        'provenance',
    ]);
    const after = f.snapshot();
    for (const name of Object.keys(before))
        if (
            ![
                'canonical_cards',
                'canonical_localized_text',
                'canonical_provenance',
                'canonical_block_states',
            ].includes(name)
        )
            assert.deepEqual(after[name], before[name], name);
    await error(
        f,
        { ...f.body, target_expected_revision: result.revision },
        409,
        'REVISION_CONFLICT',
    );
    const diff = await f.service.app.inject({
        method: 'POST',
        url: `/api/v1/library/external-sources/candidates/${f.candidateId}/diff`,
        payload: {
            target_card_id: f.card.cardId,
            target_expected_revision: result.revision,
        },
    });
    assert.equal(diff.statusCode, 409, diff.body);
    if (process.env.YU3DOH_QA_OUTPUT) {
        await mkdir(process.env.YU3DOH_QA_OUTPUT, { recursive: true });
        await writeFile(
            path.join(
                process.env.YU3DOH_QA_OUTPUT,
                'selective-text-self-review.json',
            ),
            JSON.stringify(
                {
                    sha: execFileSync('git', ['rev-parse', 'HEAD'], {
                        encoding: 'utf8',
                    }).trim(),
                    frozen_revision: f.card.revision,
                    request,
                    before: beforeCard,
                    response: result,
                    after: afterCard,
                    mutation: f.mutation(),
                    counts: f.counts(),
                    candidate_history_unchanged: true,
                    second_apply: 'REVISION_CONFLICT',
                    diff: 'REVISION_CONFLICT',
                },
                null,
                2,
            ),
        );
    }
});
test('RUN021 multiple CONFIRMED blocks acknowledge order-insensitively; deterministic language/field ordering', async (t) => {
    const f = await setup(t, { confirmed: ['TEXT:EN', 'TEXT:ES'] });
    const r = await f.invoke({
        ...f.body,
        selected_fields: [
            selection('TEXT:JP', 'name'),
            selection('TEXT:ES', 'card_text'),
            selection('TEXT:EN', 'name'),
        ],
        acknowledge_move_to_draft_blocks: ['TEXT:ES', 'TEXT:EN'],
    });
    assert.equal(r.statusCode, 200, r.body);
    assert.deepEqual(r.json().moved_to_draft, ['TEXT:EN', 'TEXT:ES']);
    assert.deepEqual(
        f.mutation()!.localizations!.map((l) => l.language),
        ['EN', 'ES', 'JP'],
    );
});
for (const note of [undefined, '', '   '])
    test(`RUN021 provenance note ${JSON.stringify(note)} stores null`, async (t) => {
        const f = await setup(t);
        const r = await f.invoke({
            ...f.body,
            ...(note === undefined ? {} : { note }),
        });
        assert.equal(r.statusCode, 200, r.body);
        assert.equal(
            f.service.canonical!.getCard(f.card.cardId)!.provenance.at(-1)!
                .note,
            null,
        );
    });
test('RUN021 provenance write failure atomically rolls back all languages, confirmations and revision', async (t) => {
    const f = await setup(t, { confirmed: ['TEXT:EN'] });
    f.service.persistence!.runRepositoryOperation((db) =>
        db.exec(
            "CREATE TRIGGER qa_fail_external BEFORE INSERT ON canonical_provenance WHEN NEW.source_kind='EXTERNAL_SOURCE' BEGIN SELECT RAISE(ABORT,'injected provenance failure'); END;",
        ),
    );
    await error(
        f,
        {
            ...f.body,
            selected_fields: [selection(), selection('TEXT:ES', 'card_text')],
            acknowledge_move_to_draft_blocks: ['TEXT:EN'],
        },
        500,
        null,
    );
});
for (const mode of ['BACKUP', 'RESTORE', 'MIGRATION'] as const)
    test(`RUN021 ${mode} fences Apply`, async (t) => {
        const f = await setup(t);
        const release = f.service.runtime.maintenance.acquireMaintenance(mode);
        try {
            const r = await f.invoke();
            assert.equal(r.statusCode, 409, r.body);
            assert.equal(r.json().code, 'WORKSPACE_MAINTENANCE_ACTIVE');
        } finally {
            release();
        }
        assert.equal(f.counts().mutations, 0);
    });
test('RUN021 not-READY and read-only return 503', async (t) => {
    const f = await setup(t);
    f.service.status.read_only = true;
    const r = await f.invoke();
    assert.equal(r.statusCode, 503, r.body);
    assert.equal(r.json().code, 'WORKSPACE_NOT_READY');
});
test('RUN021 obsolete in-process capability cannot publish through replaced runtime', async (t) => {
    const f = await setup(t);
    const old = f.service.externalSourceAcceptance!;
    await f.service.runtime.reload();
    assert.throws(
        () => old.applyText(f.candidateId, f.body),
        (e: unknown) =>
            e instanceof ExternalSourceError &&
            e.code === 'WORKSPACE_NOT_READY',
    );
    const r = await f.invoke();
    assert.equal(r.statusCode, 200, r.body);
    assert.equal(f.counts().providerCalls, 0);
});

test('RUN021 Canonical validation failure is 422 and rolls back all attempted fields/provenance', async (t) => {
    const f = await setup(t, { confirmed: ['TEXT:EN'] });
    f.service.persistence!.runRepositoryOperation((db) =>
        db
            .prepare(
                "UPDATE canonical_localized_text SET card_text=NULL WHERE language='EN'",
            )
            .run(),
    );
    await error(
        f,
        { ...f.body, selected_fields: [selection('TEXT:ES', 'card_text')] },
        422,
        'DOMAIN_VALIDATION',
    );
});
test('RUN021 missing current Canonical follows frozen revision check and precedes field eligibility', async (t) => {
    const f = await setup(t);
    Object.defineProperty(f.service.canonical, 'getCard', {
        configurable: true,
        value: () => null,
    });
    await error(f, f.body, 404, 'NOT_FOUND');
    await error(
        f,
        { ...f.body, target_expected_revision: '999' },
        409,
        'REVISION_CONFLICT',
    );
});

test('RUN021 multiple changed fields in one language use one localization and per-field ordered provenance', async (t) => {
    const f = await setup(t);
    f.tamper((c) => {
        c.blocks['TEXT:EN'].fields.card_text.value = 'New card text';
    });
    const r = await f.invoke({
        ...f.body,
        selected_fields: [
            selection('TEXT:EN', 'card_text'),
            selection('TEXT:EN', 'name'),
        ],
    });
    assert.equal(r.statusCode, 200, r.body);
    assert.deepEqual(r.json().changed_fields, [
        selection('TEXT:EN', 'name'),
        selection('TEXT:EN', 'card_text'),
    ]);
    assert.equal(f.mutation()!.localizations!.length, 1);
    assert.equal(f.mutation()!.provenance!.length, 2);
    assert.equal(f.mutation()!.localizations![0]!.pendulumText, null);
    assert.deepEqual(f.counts(), {
        mutations: 1,
        transactions: 1,
        providerCalls: 0,
    });
});
test('RUN021 Canonical empty string equals source empty string and invokes no mutation', async (t) => {
    const f = await setup(t);
    f.tamper((c) => {
        c.blocks['TEXT:EN'].fields.name.value = '';
    });
    f.service.persistence!.runRepositoryOperation((db) =>
        db
            .prepare(
                "UPDATE canonical_localized_text SET name='' WHERE language='EN'",
            )
            .run(),
    );
    const before = f.snapshot();
    const r = await f.invoke();
    assert.equal(r.statusCode, 200, r.body);
    assert.equal(r.json().changed, false);
    assert.deepEqual(f.snapshot(), before);
    assert.equal(f.counts().mutations, 0);
});
test('RUN021 Monster without authoritative PENDULUM cannot accept pendulum_text', async (t) => {
    const f = await setup(t, { pendulum: true });
    f.service.persistence!.runRepositoryOperation((db) =>
        db.prepare('DELETE FROM canonical_monster_abilities').run(),
    );
    await error(
        f,
        { ...f.body, selected_fields: [selection('TEXT:EN', 'pendulum_text')] },
        422,
        'EXTERNAL_FIELD_NOT_APPLICABLE',
    );
});
test('RUN021 invalid JSON uses stable malformed-operation HTTP contract', async (t) => {
    const f = await setup(t);
    const before = f.snapshot();
    const r = await f.service.app.inject({
        method: 'POST',
        url: `/api/v1/library/external-sources/candidates/${f.candidateId}/apply-text`,
        headers: { 'content-type': 'application/json' },
        payload: '{',
    });
    assert.equal(r.statusCode, 400, r.body);
    assert.equal(r.json().code, 'EXTERNAL_APPLY_OPERATION_INVALID');
    assert.deepEqual(f.snapshot(), before);
});

test('RUN021 accepts the full nine-field allowlist in one atomic mutation with deterministic no-op separation', async (t) => {
    const f = await setup(t, { pendulum: true });
    const selected = blocks
        .flatMap((block) => fields.map((field) => ({ block, field })))
        .reverse();
    const r = await f.invoke({ ...f.body, selected_fields: selected });
    assert.equal(r.statusCode, 200, r.body);
    assert.equal(r.json().changed_fields.length, 7);
    assert.equal(r.json().no_op_fields.length, 2);
    assert.deepEqual(r.json().changed_blocks, blocks);
    assert.equal(f.mutation()!.localizations!.length, 3);
    assert.equal(f.mutation()!.provenance!.length, 7);
    assert.deepEqual(f.counts(), {
        mutations: 1,
        transactions: 1,
        providerCalls: 0,
    });
});
