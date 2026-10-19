import assert from 'node:assert/strict';
import test from 'node:test';
import { randomUUID } from 'node:crypto';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { mkdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import { createWorkspaceService } from '../src/service';
import { bootstrapWorkspaceDatabase } from '../src/persistence/operations';
import { publishPackage } from '../src/external-sources/repository';
import { STRUCTURE_FIELDS } from '../src/external-sources/normalizer';
import type {
    Candidate,
    Claim,
    Diagnostic,
    StoredCandidate,
    Retrieval,
} from '../src/external-sources/types';
import type {
    CanonicalCardMutation,
    CanonicalStructureInput,
    SemanticBlockKey,
} from '../src/canonical/types';
import type {
    StructurePreview,
    StructureApplyResult,
} from '../src/external-sources/structure-acceptance-dto';
import { coherentStructure } from '../src/external-sources/structure-result';
import { authoritativeProjection } from '../src/carder/write-back';

const sourceFields = (
    family = 'MONSTER',
    summon = 'MAIN_DECK',
): Record<string, Claim> => {
    const f = Object.fromEntries(
        STRUCTURE_FIELDS.map((field) => [
            field,
            {
                state: 'ABSENT',
                evidence: {
                    document_id: 'doc',
                    locale: 'EN',
                    source_path: '$.fixture.' + field,
                },
            },
        ]),
    ) as Record<string, Claim>;
    const set = (key: string, value: string | number | string[]) => {
        f[key] = { state: 'PRESENT', value, evidence: f[key]!.evidence };
    };
    set('family', family);
    if (family === 'MONSTER') {
        for (const [k, v] of Object.entries({
            summon_kind: summon,
            attribute_code: 'LIGHT',
            race_code: 'DRAGON',
            atk: 1200,
            abilities: ['EFFECT'],
        }))
            set(k, v);
        if (summon === 'LINK') {
            set('link_markers', ['2', '7', '9']);
            set('link_rating', 3);
        } else {
            set(summon === 'XYZ' ? 'rank' : 'level', 4);
            set('def', 1000);
        }
    } else if (family === 'SPELL' || family === 'TRAP')
        set(
            family === 'SPELL' ? 'spell_subtype_code' : 'trap_subtype_code',
            'CONTINUOUS',
        );
    return f;
};
const present = (v: unknown): Claim => ({
    state: 'PRESENT',
    value: v as never,
    evidence: { document_id: 'doc', locale: 'EN', source_path: '$.test' },
});
const original = (family = 'MONSTER'): CanonicalStructureInput =>
    family === 'MONSTER'
        ? {
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
          }
        : family === 'TOKEN'
          ? {
                kind: 'TOKEN',
                attributeCode: 'LIGHT',
                raceCode: 'DRAGON',
                level: 4,
                atk: 0,
                def: 0,
            }
          : { kind: family as 'SPELL' | 'TRAP', subtypeCode: 'NORMAL' };
const setup = async (
    t: test.TestContext,
    options: {
        family?: string;
        summon?: string;
        current?: CanonicalStructureInput;
        fields?: Record<string, Claim>;
        confirmed?: SemanticBlockKey[];
        password?: string | null;
        normalizer?: number;
        diagnostics?: Diagnostic[];
    } = {},
) => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'YU3DOH RUN023 日本語 ')),
        manifest = {
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
                    throw Error('Provider forbidden');
                }) as typeof fetch,
            },
        },
    );
    t.after(async () => {
        await service.close();
        await rm(root, { recursive: true, force: true });
    });
    const family = options.family ?? 'MONSTER';
    let card = service.canonical!.createCard({
        family: family as 'MONSTER',
        password:
            family === 'TOKEN'
                ? null
                : options.password === undefined
                  ? '12345678'
                  : options.password,
    });
    card = service.canonical!.mutateCard(card.cardId, card.revision, {
        structure: options.current ?? original(family),
        localizations: ['EN', 'ES', 'JP'].map((language) => ({
            language: language as 'EN',
            name: 'Original ' + language,
            cardText: 'Existing text',
            pendulumText: null,
        })),
        confirmations: (options.confirmed ?? []).map((block) => ({
            block,
            state: 'CONFIRMED',
            provenance: { sourceKind: 'MANUAL', sourceRef: 'before' },
        })),
    });
    const rid = randomUUID(),
        cid = randomUUID(),
        did = randomUUID(),
        timestamp = new Date().toISOString();
    const fields = options.fields ?? sourceFields(family, options.summon);
    for (const c of Object.values(fields)) c.evidence.document_id = did;
    const candidate: Candidate = {
        candidate_schema_version: 1,
        authoritative: false,
        identity: {
            source_code: 'YGORESOURCES_CARD_DB',
            external_record_key: '13036',
        },
        blocks: {
            STRUCTURE: { fields },
            'TEXT:EN': { fields: { name: present('Accepted text name') } },
            'TEXT:ES': { fields: {} },
            'TEXT:JP': { fields: {} },
        },
    };
    const stored: StoredCandidate = {
        candidate_id: cid,
        retrieval_id: rid,
        candidate_schema_version: 1,
        normalizer_version: options.normalizer ?? 2,
        candidate,
        diagnostics: options.diagnostics ?? [],
        created_at: timestamp,
    };
    const retrieval: Retrieval = {
        retrieval_id: rid,
        source_record_id: randomUUID(),
        source_code: 'YGORESOURCES_CARD_DB',
        external_record_key: '13036',
        target_card_id: card.cardId,
        target_expected_revision: card.revision,
        adapter_version: 1,
        status: 'SUCCESS',
        error_code: null,
        error_message: null,
        retrieved_at: timestamp,
    };
    service.persistence!.transaction((db) =>
        publishPackage(
            db,
            retrieval.source_record_id,
            retrieval,
            {
                document_id: did,
                document_kind: 'CARD_JSON',
                source_ref: 'frozen-test',
                status: 'SUCCESS',
                http_status: 200,
                content_type: 'application/json',
                payload_hash: '0'.repeat(64),
                raw_payload: 'not interpreted by acceptance',
                source_cache_revision: null,
                error_code: null,
                error_message: null,
            },
            stored,
        ),
    );
    const body = {
            target_card_id: card.cardId,
            target_expected_revision: card.revision,
        },
        applyBody = { ...body, acknowledge_move_to_draft: false };
    let mutations = 0,
        transactions = 0,
        lastMutation: CanonicalCardMutation | undefined;
    const mutate = service.canonical!.mutateCard.bind(service.canonical);
    Object.defineProperty(service.canonical, 'mutateCard', {
        configurable: true,
        value: (id: string, rev: string, m: CanonicalCardMutation) => {
            mutations++;
            lastMutation = m;
            assert.throws(() =>
                service.runtime.maintenance.acquireMaintenance('RESTORE'),
            );
            return mutate(id, rev, m);
        },
    });
    const tx = service.persistence!.transaction.bind(service.persistence);
    Object.defineProperty(service.persistence, 'transaction', {
        configurable: true,
        value: (op: Parameters<typeof tx>[0]) => {
            transactions++;
            return tx(op);
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
                    db.prepare(`SELECT * FROM "${name}" ORDER BY rowid`).all(),
                ]),
            ),
        );
    const send = (
        apply = false,
        value: unknown = apply ? applyBody : body,
        id: string = cid,
    ) =>
        service.app.inject({
            method: 'POST',
            url: `/api/v1/library/external-sources/candidates/${id}/${apply ? 'apply' : 'preview'}-structure`,
            payload: value as never,
        });
    const alter = (fn: (c: Candidate) => void) => {
        fn(candidate);
        service.persistence!.runRepositoryOperation((db) =>
            db
                .prepare(
                    'UPDATE external_source_candidates SET candidate_json=? WHERE candidate_id=?',
                )
                .run(JSON.stringify(candidate), cid),
        );
    };
    return {
        root,
        service,
        card,
        cid,
        rid,
        did,
        body,
        applyBody,
        candidate,
        stored,
        retrieval,
        send,
        snapshot,
        alter,
        counts: () => ({ mutations, transactions, providerCalls }),
        mutation: () => lastMutation,
    };
};
const preview = async (f: Awaited<ReturnType<typeof setup>>) => {
    const r = await f.send();
    assert.equal(r.statusCode, 200, r.body);
    return r.json<StructurePreview>();
};
const error = async (
    f: Awaited<ReturnType<typeof setup>>,
    code: string,
    status: number = 422,
    body: unknown = f.applyBody,
) => {
    const before = f.snapshot(),
        counts = f.counts(),
        r = await f.send(true, body);
    assert.equal(r.statusCode, status, r.body);
    assert.equal(r.json().code, code, r.body);
    assert.deepEqual(f.snapshot(), before);
    assert.deepEqual(f.counts(), counts);
    return r.json();
};
const emit = (name: string, value: unknown) => {
    if (!process.env.YU3DOH_QA_OUTPUT) return;
    mkdirSync(process.env.YU3DOH_QA_OUTPUT, { recursive: true });
    writeFileSync(
        path.join(process.env.YU3DOH_QA_OUTPUT, name),
        JSON.stringify(
            {
                sha: execFileSync('git', ['rev-parse', 'HEAD'], {
                    encoding: 'utf8',
                }).trim(),
                provider_requests: 0,
                metadata_requests: 0,
                value,
            },
            null,
            2,
        ),
    );
};

for (const [name, patch] of Object.entries({
    extra: { resulting_structure: {} },
    fieldSelection: { selected_fields: [] },
    sourceValue: { source_values: {} },
    numericRevision: { target_expected_revision: 2 },
    whitespaceRevision: { target_expected_revision: ' 2' },
    trailingNewlineRevision: { target_expected_revision: '2\n' },
    zeroRevision: { target_expected_revision: '0' },
    emptyTarget: { target_card_id: '' },
    missingAck: { acknowledge_move_to_draft: undefined },
    stringAck: { acknowledge_move_to_draft: 'true' },
    nullNote: { note: null },
}))
    test(`RUN023 DTO ${name} rejects coercion/extra input before writes`, async (t) => {
        const f = await setup(t);
        await error(f, 'EXTERNAL_STRUCTURE_OPERATION_INVALID', 400, {
            ...f.applyBody,
            ...patch,
        });
    });
for (const [name, patch] of Object.entries({
    ackInPreview: { acknowledge_move_to_draft: true },
    noteInPreview: { note: '' },
    numericTarget: { target_card_id: 4 },
    missingRevision: { target_expected_revision: undefined },
}))
    test(`RUN023 Preview DTO ${name} rejects exact read contract`, async (t) => {
        const f = await setup(t),
            before = f.snapshot(),
            r = await f.send(false, { ...f.body, ...patch });
        assert.equal(r.statusCode, 400, r.body);
        assert.equal(r.json().code, 'EXTERNAL_STRUCTURE_OPERATION_INVALID');
        assert.deepEqual(f.snapshot(), before);
    });
test('RUN023 malformed JSON and empty candidate transport return stable 400', async (t) => {
    const f = await setup(t);
    const r = await f.service.app.inject({
        method: 'POST',
        url: `/api/v1/library/external-sources/candidates/${f.cid}/apply-structure`,
        headers: { 'content-type': 'application/json' },
        payload: '{',
    });
    assert.equal(r.statusCode, 400);
    assert.equal(r.json().code, 'EXTERNAL_STRUCTURE_OPERATION_INVALID');
    const blank = await f.send(false, f.body, '%20');
    assert.equal(blank.statusCode, 400);
});
test('RUN023 missing candidate is 404 before target/revision', async (t) => {
    const f = await setup(t);
    const before = f.snapshot();
    const r = await f.send(
        true,
        { ...f.applyBody, target_card_id: 'wrong' },
        'missing',
    );
    assert.equal(r.statusCode, 404);
    assert.equal(r.json().code, 'NOT_FOUND');
    assert.deepEqual(f.snapshot(), before);
});
for (const [name, mutate, reason] of [
    [
        'source',
        (f: Awaited<ReturnType<typeof setup>>) =>
            f.alter((c) => {
                c.identity.source_code = 'OTHER' as never;
            }),
        'SOURCE_NOT_SUPPORTED',
    ],
    [
        'identity-key',
        (f: Awaited<ReturnType<typeof setup>>) =>
            f.alter((c) => {
                c.identity.external_record_key = 'different';
            }),
        'SOURCE_NOT_SUPPORTED',
    ],
    [
        'candidate-schema',
        (f: Awaited<ReturnType<typeof setup>>) =>
            f.alter((c) => {
                c.candidate_schema_version = 9 as never;
            }),
        'CANDIDATE_SCHEMA_NOT_SUPPORTED',
    ],
    [
        'authority',
        (f: Awaited<ReturnType<typeof setup>>) =>
            f.alter((c) => {
                c.authoritative = true as never;
            }),
        'AUTHORITATIVE_CANDIDATE_NOT_SUPPORTED',
    ],
] as const)
    test(`RUN023 incompatible ${name} precedes target and is read-only INELIGIBLE`, async (t) => {
        const f = await setup(t);
        mutate(f);
        const p = await preview(f);
        assert.equal(p.decision, 'INELIGIBLE');
        assert.ok(p.reason_codes.includes(reason));
        await error(f, 'EXTERNAL_CANDIDATE_NOT_ELIGIBLE', 422, {
            ...f.applyBody,
            target_card_id: 'wrong',
        });
    });
for (const [field, value, reason] of [
    ['normalizer_version', 1, 'NORMALIZER_VERSION_NOT_SUPPORTED'],
    ['candidate_schema_version', 2, 'CANDIDATE_SCHEMA_NOT_SUPPORTED'],
] as const)
    test(`RUN023 stored ${field} compatibility gate`, async (t) => {
        const f = await setup(t);
        f.service.persistence!.runRepositoryOperation((db) =>
            db
                .prepare(
                    `UPDATE external_source_candidates SET ${field}=? WHERE candidate_id=?`,
                )
                .run(value, f.cid),
        );
        assert.deepEqual((await preview(f)).reason_codes, [reason]);
        await error(f, 'EXTERNAL_CANDIDATE_NOT_ELIGIBLE');
    });
test('RUN023 FAILED retrieval is ineligible; adapter_version is informational', async (t) => {
    const f = await setup(t);
    f.service.persistence!.runRepositoryOperation((db) =>
        db
            .prepare(
                "UPDATE external_source_retrievals SET status='FAILED' WHERE retrieval_id=?",
            )
            .run(f.rid),
    );
    assert.deepEqual((await preview(f)).reason_codes, [
        'RETRIEVAL_STATUS_NOT_SUPPORTED',
    ]);
    await error(f, 'EXTERNAL_CANDIDATE_NOT_ELIGIBLE');
    const g = await setup(t);
    g.service.persistence!.runRepositoryOperation((db) =>
        db
            .prepare(
                'UPDATE external_source_retrievals SET adapter_version=99 WHERE retrieval_id=?',
            )
            .run(g.rid),
    );
    assert.equal((await preview(g)).decision, 'READY');
});
for (const [name, change] of [
    ['target', { target_card_id: 'wrong' }],
    ['frozen-revision', { target_expected_revision: '999' }],
] as const)
    test(`RUN023 strict ${name} HTTP conflict`, async (t) => {
        const f = await setup(t);
        await error(
            f,
            name === 'target'
                ? 'CANDIDATE_TARGET_MISMATCH'
                : 'REVISION_CONFLICT',
            409,
            { ...f.applyBody, ...change },
        );
        const r = await f.send(false, { ...f.body, ...change });
        assert.equal(r.statusCode, 409);
    });
test('RUN023 current revision conflict; no adoption/rebase', async (t) => {
    const f = await setup(t);
    f.service.canonical!.addProvenance(f.card.cardId, f.card.revision, {
        targetKind: 'CARD',
        targetKey: 'IDENTITY',
        sourceKind: 'MANUAL',
    });
    await error(f, 'REVISION_CONFLICT', 409);
});
for (const code of [
    'SOURCE_FIELD_UNMAPPED',
    'SOURCE_FIELD_INVALID',
    'SOURCE_FIELD_AMBIGUOUS',
])
    test(`RUN023 persisted STRUCTURE ${code} blocks without interpreting raw`, async (t) => {
        const d: Diagnostic = {
            diagnostic_id: randomUUID(),
            severity: 'WARNING',
            stage: 'NORMALIZATION',
            block: 'STRUCTURE',
            field: null,
            locale: 'EN',
            code,
            message: 'persisted',
        };
        const f = await setup(t, { diagnostics: [d] });
        assert.deepEqual((await preview(f)).reason_codes, [
            'STRUCTURE_DIAGNOSTICS_PRESENT',
        ]);
        await error(f, 'EXTERNAL_STRUCTURE_NOT_ELIGIBLE');
    });
test('RUN023 PARTIAL TEXT-only diagnostics remain STRUCTURE eligible', async (t) => {
    const f = await setup(t, {
        diagnostics: [
            {
                diagnostic_id: 'locale',
                severity: 'WARNING',
                stage: 'NORMALIZATION',
                block: 'TEXT:ES',
                field: null,
                locale: 'ES',
                code: 'LOCALE_NOT_AVAILABLE',
                message: 'missing locale',
            },
        ],
    });
    f.service.persistence!.runRepositoryOperation((db) =>
        db
            .prepare(
                "UPDATE external_source_retrievals SET status='PARTIAL' WHERE retrieval_id=?",
            )
            .run(f.rid),
    );
    assert.equal((await preview(f)).decision, 'READY');
});
for (const [name, family] of [
    ['token', 'TOKEN'],
    ['family-mismatch', 'SPELL'],
] as const)
    test(`RUN023 ${name} cannot mutate target family`, async (t) => {
        const f = await setup(t, { fields: sourceFields(family) });
        const p = await preview(f);
        assert.ok(
            p.reason_codes.includes(
                name === 'token' ? 'UNSUPPORTED_FAMILY' : 'FAMILY_MISMATCH',
            ),
        );
        await error(f, 'EXTERNAL_STRUCTURE_NOT_ELIGIBLE');
    });
for (const state of ['ABSENT', 'UNMAPPED', 'INVALID'])
    test(`RUN023 required family ${state} is never source-backed`, async (t) => {
        const f = await setup(t);
        f.alter((c) => {
            c.blocks.STRUCTURE.fields.family = {
                ...c.blocks.STRUCTURE.fields.family!,
                state,
            } as Claim;
        });
        assert.ok(
            (await preview(f)).reason_codes.includes(
                'REQUIRED_CLAIM_NOT_PRESENT',
            ),
        );
        await error(f, 'EXTERNAL_STRUCTURE_NOT_ELIGIBLE');
    });
for (const summon of [
    'MAIN_DECK',
    'RITUAL',
    'FUSION',
    'SYNCHRO',
    'XYZ',
    'LINK',
])
    test(`RUN023 complete ${summon} Preview/Apply exact result and readonly password/rating`, async (t) => {
        const f = await setup(t, { summon, password: null }),
            before = f.snapshot(),
            p = await preview(f);
        assert.equal(p.decision, 'READY', JSON.stringify(p));
        assert.equal(p.persisted_state_only, true);
        assert.deepEqual(f.snapshot(), before);
        assert.equal(p.resulting_structure!.kind, 'MONSTER');
        const r = await f.send(true);
        assert.equal(r.statusCode, 200, r.body);
        const result = r.json<StructureApplyResult>();
        assert.equal(result.changed, true);
        assert.equal(result.revision, String(Number(f.card.revision) + 1));
        assert.deepEqual(f.counts(), {
            mutations: 1,
            transactions: 1,
            providerCalls: 0,
        });
        assert.deepEqual(Object.keys(f.mutation()!).sort(), [
            'provenance',
            'structure',
        ]);
        assert.equal('linkRating' in f.mutation()!.structure!, false);
        assert.equal('password' in f.mutation()!, false);
        assert.equal(
            f.service.canonical!.getCard(f.card.cardId)!.password,
            null,
        );
    });
for (const family of ['SPELL', 'TRAP'])
    test(`RUN023 complete ${family} replaces only subtype`, async (t) => {
        const f = await setup(t, { family });
        const p = await preview(f);
        assert.deepEqual(p.resulting_structure, {
            kind: family,
            subtypeCode: 'CONTINUOUS',
        });
        const r = await f.send(true);
        assert.equal(r.statusCode, 200, r.body);
        assert.deepEqual(f.mutation()!.structure, p.resulting_structure);
        assert.equal(
            r.json().changes[0].field,
            family === 'SPELL' ? 'spell_subtype_code' : 'trap_subtype_code',
        );
    });
for (const field of [
    'summon_kind',
    'attribute_code',
    'race_code',
    'atk',
    'abilities',
    'level',
    'def',
])
    for (const state of ['ABSENT', 'UNMAPPED', 'INVALID'])
        test(`RUN023 required ${field} ${state} never deletes or imports`, async (t) => {
            const f = await setup(t);
            f.alter((c) => {
                c.blocks.STRUCTURE.fields[field] = {
                    ...c.blocks.STRUCTURE.fields[field]!,
                    state,
                } as Claim;
            });
            assert.equal((await preview(f)).decision, 'INELIGIBLE');
            await error(f, 'EXTERNAL_STRUCTURE_NOT_ELIGIBLE');
        });
for (const [field, value] of [
    ['rank', 1],
    ['link_markers', ['1']],
    ['link_rating', 1],
    ['pendulum_scale', 1],
    ['spell_subtype_code', 'NORMAL'],
    ['trap_subtype_code', 'NORMAL'],
] as const)
    test(`RUN023 non-applicable ${field} PRESENT is a contradiction`, async (t) => {
        const f = await setup(t);
        f.alter((c) => {
            c.blocks.STRUCTURE.fields[field] = present(value);
        });
        assert.ok(
            (await preview(f)).reason_codes.includes(
                'NON_APPLICABLE_CLAIM_PRESENT',
            ),
        );
        await error(f, 'EXTERNAL_STRUCTURE_NOT_ELIGIBLE');
    });
for (const [field, value] of [
    ['atk', '?'],
    ['def', '?'],
    ['level', 0],
] as const)
    test(`RUN023 source ${field} ${JSON.stringify(value)} is explicit`, async (t) => {
        const f = await setup(t);
        f.alter((c) => {
            c.blocks.STRUCTURE.fields[field] = present(value);
        });
        assert.equal((await preview(f)).decision, 'READY');
        assert.equal((await f.send(true)).statusCode, 200);
    });
for (const scale of [0, 7])
    test(`RUN023 PENDULUM scale ${scale} preserved; confirmed TEXT blockers absent when DRAFT`, async (t) => {
        const f = await setup(t);
        f.alter((c) => {
            c.blocks.STRUCTURE.fields.abilities = present([
                'EFFECT',
                'PENDULUM',
            ]);
            c.blocks.STRUCTURE.fields.pendulum_scale = present(scale);
        });
        const p = await preview(f);
        assert.equal(p.decision, 'READY');
        assert.equal(
            p.resulting_structure!.kind === 'MONSTER' &&
                p.resulting_structure!.pendulumScale,
            scale,
        );
        assert.equal((await f.send(true)).statusCode, 200);
    });
test('RUN023 XYZ zero Rank preserved, never interpreted as ABSENT', async (t) => {
    const f = await setup(t, { summon: 'XYZ' });
    f.alter((c) => {
        c.blocks.STRUCTURE.fields.rank = present(0);
    });
    const p = await preview(f);
    assert.equal(p.decision, 'READY');
    assert.equal(
        p.resulting_structure!.kind === 'MONSTER' &&
            p.resulting_structure!.rank,
        0,
    );
});
for (const [field, value] of [
    ['atk', -1],
    ['atk', '1000'],
    ['def', null],
    ['level', 0.5],
    ['level', Number.MAX_SAFE_INTEGER + 1],
    ['abilities', ['EFFECT', 'EFFECT']],
    ['abilities', 'EFFECT'],
] as const)
    test(`RUN023 malformed ${field} ${JSON.stringify(value)} rejected`, async (t) => {
        const f = await setup(t);
        f.alter((c) => {
            c.blocks.STRUCTURE.fields[field] = present(value);
        });
        assert.ok(
            (await preview(f)).reason_codes.includes('STRUCTURE_VALUE_INVALID'),
        );
        await error(f, 'EXTERNAL_STRUCTURE_NOT_ELIGIBLE');
    });
for (const [name, patch, reason] of [
    ['empty-markers', { link_markers: [] }, 'STRUCTURE_VALUE_INVALID'],
    [
        'duplicate-markers',
        { link_markers: ['1', '1'] },
        'STRUCTURE_VALUE_INVALID',
    ],
    ['pendulum', { abilities: ['PENDULUM'] }, 'LINK_PENDULUM_CONFLICT'],
    ['rating-mismatch', { link_rating: 2 }, 'LINK_RATING_INCONSISTENT'],
    ['link-level', { level: 4 }, 'NON_APPLICABLE_CLAIM_PRESENT'],
] as const)
    test(`RUN023 Link ${name} rejects inconsistent complete source`, async (t) => {
        const f = await setup(t, { summon: 'LINK' });
        f.alter((c) => {
            for (const [field, value] of Object.entries(patch))
                c.blocks.STRUCTURE.fields[field] = present(value);
        });
        assert.ok((await preview(f)).reason_codes.includes(reason));
        await error(f, 'EXTERNAL_STRUCTURE_NOT_ELIGIBLE');
    });
test('RUN023 Link absent rating stays readonly and no synthesis/write occurs', async (t) => {
    const f = await setup(t, { summon: 'LINK' });
    f.alter((c) => {
        c.blocks.STRUCTURE.fields.link_rating = {
            state: 'ABSENT',
            evidence: c.blocks.STRUCTURE.fields.link_rating!.evidence,
        };
    });
    assert.equal((await preview(f)).decision, 'READY');
    const r = await f.send(true);
    assert.equal(r.statusCode, 200);
    assert.equal('linkRating' in f.mutation()!.structure!, false);
});
for (const family of ['SPELL', 'TRAP'])
    for (const field of [
        'atk',
        'abilities',
        'link_rating',
        family === 'SPELL' ? 'trap_subtype_code' : 'spell_subtype_code',
    ])
        test(`RUN023 ${family} non-applicable ${field} blocked`, async (t) => {
            const f = await setup(t, { family });
            f.alter((c) => {
                c.blocks.STRUCTURE.fields[field] = present(
                    field === 'abilities' ? [] : field === 'atk' ? 1 : 'NORMAL',
                );
            });
            assert.equal((await preview(f)).decision, 'INELIGIBLE');
            await error(f, 'EXTERNAL_STRUCTURE_NOT_ELIGIBLE');
        });
for (const [field, value, family, summon] of [
    ['summon_kind', 'UNKNOWN', 'MONSTER', 'MAIN_DECK'],
    ['attribute_code', 'UNKNOWN', 'MONSTER', 'MAIN_DECK'],
    ['race_code', 'UNKNOWN', 'MONSTER', 'MAIN_DECK'],
    ['abilities', ['UNKNOWN'], 'MONSTER', 'MAIN_DECK'],
    ['link_markers', ['UNKNOWN'], 'MONSTER', 'LINK'],
    ['spell_subtype_code', 'UNKNOWN', 'SPELL', 'MAIN_DECK'],
    ['trap_subtype_code', 'UNKNOWN', 'TRAP', 'MAIN_DECK'],
] as const)
    test(`RUN023 missing registry ${field} never lazy-registers`, async (t) => {
        const f = await setup(t, { family, summon });
        f.alter((c) => {
            c.blocks.STRUCTURE.fields[field] = present(value);
            if (field === 'link_markers')
                c.blocks.STRUCTURE.fields.link_rating = present(1);
        });
        assert.ok(
            (await preview(f)).reason_codes.includes(
                'STRUCTURAL_REGISTRY_VALUE_NOT_AVAILABLE',
            ),
        );
        await error(f, 'STRUCTURAL_REGISTRY_VALUE_NOT_AVAILABLE');
    });
test('RUN023 Preview repeated is zero-write and tokenless, no provider or mutation calls', async (t) => {
    const f = await setup(t),
        before = f.snapshot();
    assert.deepEqual(await preview(f), await preview(f));
    assert.deepEqual(f.snapshot(), before);
    assert.deepEqual(f.counts(), {
        mutations: 0,
        transactions: 0,
        providerCalls: 0,
    });
});
for (const confirmed of [false, true])
    test(`RUN023 exact no-op preserves ${confirmed ? 'CONFIRMED' : 'DRAFT'} snapshots and requires false ack`, async (t) => {
        const f = await setup(t, { confirmed: confirmed ? ['STRUCTURE'] : [] });
        f.alter((c) => {
            c.blocks.STRUCTURE.fields.atk = present(1000);
        });
        const before = f.snapshot(),
            p = await preview(f);
        assert.equal(p.decision, 'NO_OP');
        assert.equal(p.acknowledgement_required, false);
        const r = await f.send(true);
        assert.equal(r.statusCode, 200, r.body);
        assert.equal(r.json().changed, false);
        assert.equal(r.json().revision, f.card.revision);
        assert.deepEqual(f.snapshot(), before);
        assert.deepEqual(f.counts(), {
            mutations: 0,
            transactions: 0,
            providerCalls: 0,
        });
        await error(f, 'CONFIRMED_BLOCK_STATE_CHANGED', 409, {
            ...f.applyBody,
            acknowledge_move_to_draft: true,
        });
        emit('run023-no-op.json', {
            request: f.applyBody,
            confirmed,
            preview: p,
            response: r.json(),
            counts: f.counts(),
            before_after_identical: true,
        });
    });
for (const kind of ['abilities', 'markers'])
    test(`RUN023 ${kind} order-only differences are NO_OP with canonical output order`, async (t) => {
        const current = original() as Extract<
            CanonicalStructureInput,
            { kind: 'MONSTER' }
        >;
        current.abilities = ['TUNER', 'EFFECT'];
        const flds = sourceFields();
        flds.atk = present(1000);
        flds.abilities = present(['EFFECT', 'TUNER']);
        if (kind === 'markers') {
            current.summonKind = 'LINK';
            current.level = null;
            current.def = null;
            current.linkMarkers = ['9', '2', '7'];
            Object.assign(flds, sourceFields('MONSTER', 'LINK'));
            flds.atk = present(1000);
            flds.abilities = present(['EFFECT', 'TUNER']);
            flds.link_markers = present(['7', '9', '2']);
        }
        const f = await setup(t, { current, fields: flds });
        assert.equal((await preview(f)).decision, 'NO_OP');
        assert.equal((await f.send(true)).json().changed, false);
        assert.equal(f.counts().mutations, 0);
    });
test('RUN023 changed DRAFT rejects extraneous ack; missing CONFIRMED ack precedes mutation', async (t) => {
    const f = await setup(t);
    await error(f, 'CONFIRMED_BLOCK_STATE_CHANGED', 409, {
        ...f.applyBody,
        acknowledge_move_to_draft: true,
    });
    const g = await setup(t, { confirmed: ['STRUCTURE'] });
    await error(g, 'CONFIRMED_BLOCK_ACK_REQUIRED', 409);
});
test('RUN023 changed CONFIRMED exact acknowledgement demotes STRUCTURE only with no confirmation provenance', async (t) => {
    const f = await setup(t, { confirmed: ['STRUCTURE', 'TEXT:EN'] });
    const old = f.service.canonical!.getCard(f.card.cardId)!;
    const r = await f.send(true, {
        ...f.applyBody,
        acknowledge_move_to_draft: true,
        note: '  reviewed  ',
    });
    assert.equal(r.statusCode, 200, r.body);
    assert.equal(r.json().moved_to_draft, true);
    const after = f.service.canonical!.getCard(f.card.cardId)!;
    assert.deepEqual(after.localizations, old.localizations);
    assert.deepEqual(after.classification, old.classification);
    assert.deepEqual(after.relations, old.relations);
    assert.deepEqual(
        after.confirmations.find((c) => c.block === 'TEXT:EN'),
        old.confirmations.find((c) => c.block === 'TEXT:EN'),
    );
    assert.deepEqual(
        after.confirmations.find((c) => c.block === 'STRUCTURE'),
        { block: 'STRUCTURE', state: 'DRAFT', provenanceId: null },
    );
    assert.deepEqual(Object.keys(f.mutation()!).sort(), [
        'confirmations',
        'provenance',
        'structure',
    ]);
    assert.equal(f.mutation()!.provenance!.length, 1);
    assert.equal(f.mutation()!.provenance![0]!.note, 'reviewed');
});
for (const blockers of [
    ['TEXT:EN'],
    ['TEXT:EN', 'TEXT:ES', 'TEXT:JP'],
] as SemanticBlockKey[][])
    test(`RUN023 dependency conflict identifies ${blockers.join(',')} before ack, never demotes TEXT`, async (t) => {
        const f = await setup(t, { confirmed: ['STRUCTURE', ...blockers] });
        f.alter((c) => {
            c.blocks.STRUCTURE.fields.abilities = present([
                'EFFECT',
                'PENDULUM',
            ]);
            c.blocks.STRUCTURE.fields.pendulum_scale = present(0);
        });
        const p = await preview(f);
        assert.equal(p.decision, 'BLOCKED');
        assert.deepEqual(p.blocking_confirmed_blocks, blockers);
        const e = await error(f, 'CONFIRMED_BLOCK_DEPENDENCY_CONFLICT', 409);
        assert.deepEqual(e.blocking_blocks, blockers);
        emit('run023-cross-block.json', {
            request: f.applyBody,
            snapshot_unchanged: true,
            preview: p,
            error: e,
            counts: f.counts(),
        });
    });
test('RUN023 Link derived clearings and source provenance order/ref/note; stale second Apply and diff', async (t) => {
    const current = original() as Extract<
        CanonicalStructureInput,
        { kind: 'MONSTER' }
    >;
    current.abilities = ['PENDULUM', 'EFFECT'];
    current.pendulumScale = 0;
    const f = await setup(t, { current, summon: 'LINK' }),
        beforeHistory = JSON.stringify(
            f.service.externalSourceIngestion!.detail(f.rid, true),
        );
    // Historical contradictory Draft: new STRUCTURE submissions now reject it.
    f.service.persistence!.runRepositoryOperation(db => db).prepare(
        'UPDATE canonical_monster_structure SET rank = 6 WHERE card_id = ?',
    ).run(f.card.cardId);
    const p = await preview(f);
    assert.equal(p.decision, 'READY');
    assert.deepEqual(
        p.changes.filter((c) => c.kind === 'DERIVED_CLEAR').map((c) => c.field),
        ['level', 'rank', 'def', 'pendulum_scale'],
    );
    const r = await f.send(true, { ...f.applyBody, note: '  inspected  ' });
    assert.equal(r.statusCode, 200, r.body);
    assert.deepEqual(f.counts(), {
        mutations: 1,
        transactions: 1,
        providerCalls: 0,
    });
    const prov = f.mutation()!.provenance!;
    assert.deepEqual(
        prov.map((p) => p.sourceRef),
        p.changes.map((c) => c.provenance_ref),
    );
    for (const c of p.changes) {
        const row = prov.find((p) => p.sourceRef === c.provenance_ref)!;
        assert.equal(row.targetKey, 'STRUCTURE');
        assert.equal(row.sourceKind, 'EXTERNAL_SOURCE');
        assert.equal(
            row.note,
            c.kind === 'SOURCE_CHANGE'
                ? 'inspected'
                : `Derived clear: ${c.field} became non-applicable because of ${c.trigger}. User note: inspected`,
        );
    }
    assert.equal(
        JSON.stringify(f.service.externalSourceIngestion!.detail(f.rid, true)),
        beforeHistory,
    );
    const stale = await f.send(true);
    assert.equal(stale.statusCode, 409);
    assert.equal(stale.json().code, 'REVISION_CONFLICT');
    const diff = await f.service.app.inject({
        method: 'POST',
        url: `/api/v1/library/external-sources/candidates/${f.cid}/diff`,
        payload: f.body,
    });
    assert.equal(diff.statusCode, 409);
    emit('run023-mixed-self-review.json', {
        preview_request: f.body,
        apply_request: { ...f.applyBody, note: '  inspected  ' },
        frozen_revision: f.card.revision,
        preview: p,
        mutation: f.mutation(),
        response: r.json(),
        counts: f.counts(),
        history_unchanged: true,
        second_apply: stale.json(),
        stale_diff: diff.json(),
    });
});
test('RUN023 Link→non-Link actually clears markers; already-null scale/rank do not produce provenance', async (t) => {
    const current = original() as Extract<
        CanonicalStructureInput,
        { kind: 'MONSTER' }
    >;
    current.summonKind = 'LINK';
    current.level = null;
    current.def = null;
    current.linkMarkers = ['2'];
    const f = await setup(t, { current });
    const p = await preview(f);
    assert.deepEqual(
        p.changes.filter((c) => c.kind === 'DERIVED_CLEAR').map((c) => c.field),
        ['link_markers'],
    );
    assert.equal((await f.send(true)).statusCode, 200);
});
test('RUN023 late provenance SQL failure rolls back structure, revision, confirmations and all events', async (t) => {
    const f = await setup(t);
    f.service.persistence!.runRepositoryOperation((db) =>
        db.exec(
            "CREATE TRIGGER fail_structure_prov BEFORE INSERT ON canonical_provenance WHEN NEW.source_kind='EXTERNAL_SOURCE' BEGIN SELECT RAISE(ABORT,'injected provenance failure'); END;",
        ),
    );
    const before = f.snapshot();
    const r = await f.send(true);
    assert.equal(r.statusCode, 500);
    assert.deepEqual(f.snapshot(), before);
    assert.equal(f.counts().mutations, 1);
    assert.equal(f.counts().transactions, 1);
});
for (const mode of [
    'BACKUP',
    'MIGRATION',
    'RESTORE',
    'INITIALIZATION',
] as const)
    test(`RUN023 ${mode} fencing preserves read Preview and mutation Apply`, async (t) => {
        const f = await setup(t);
        const release = f.service.runtime.maintenance.acquireMaintenance(mode);
        try {
            if (mode === 'BACKUP') {
                assert.equal(
                    f.service.externalStructureAcceptance!.previewStructure(
                        f.cid,
                        f.body,
                    ).decision,
                    'READY',
                );
            } else
                assert.throws(
                    () =>
                        f.service.externalStructureAcceptance!.previewStructure(
                            f.cid,
                            f.body,
                        ),
                    (e) =>
                        (e as { code: string }).code ===
                        'WORKSPACE_MAINTENANCE_ACTIVE',
                );
            assert.throws(
                () =>
                    f.service.externalStructureAcceptance!.applyStructure(
                        f.cid,
                        f.applyBody,
                    ),
                (e) =>
                    (e as { code: string }).code ===
                    'WORKSPACE_MAINTENANCE_ACTIVE',
            );
        } finally {
            release();
        }
        assert.deepEqual(f.counts(), {
            mutations: 0,
            transactions: 0,
            providerCalls: 0,
        });
    });
test('RUN023 read-only/not READY/obsolete runtime never publishes', async (t) => {
    const f = await setup(t);
    f.service.runtime.current.status.read_only = true;
    assert.equal((await f.send()).statusCode, 503);
    assert.equal((await f.send(true)).statusCode, 503);
    f.service.runtime.current.status.read_only = false;
    const old = f.service.externalStructureAcceptance!;
    await f.service.runtime.reload();
    assert.throws(
        () => old.applyStructure(f.cid, f.applyBody),
        (e) => (e as { code: string }).code === 'WORKSPACE_NOT_READY',
    );
});
test('RUN023 real Backup/Restore preserves candidate and deterministic Preview/Apply', async (t) => {
    const f = await setup(t);
    const p = await preview(f),
        history = JSON.stringify(
            f.service.externalSourceIngestion!.detail(f.rid, true),
        );
    const backup = await f.service.recovery.create('RECOVERY_POINT');
    assert.equal(backup.database_schema_version, 8);
    assert.equal((await f.send(true)).statusCode, 200);
    await f.service.recovery.restore(backup.backup_id);
    assert.equal(f.service.status.state, 'READY');
    assert.equal(f.service.status.database_schema_version, 8);
    assert.deepEqual(await preview(f), p);
    assert.equal(
        JSON.stringify(f.service.externalSourceIngestion!.detail(f.rid, true)),
        history,
    );
    assert.equal((await f.send(true)).statusCode, 200);
    emit('run023-backup-restore.json', {
        backup,
        preview: p,
        candidate_unchanged: true,
        schema: 8,
        workspace_format: 1,
    });
});
test('RUN023 changed STRUCTURE naturally makes previous Carder write-back revision stale without grant manipulation', async (t) => {
    const f = await setup(t, { confirmed: ['STRUCTURE', 'TEXT:EN'] });
    const grant = f.service.carderWriteGrants.issue({
        cardId: f.card.cardId,
        contentLanguage: 'EN',
        revision: f.card.revision,
    });
    const request = {
        card_id: f.card.cardId,
        write_grant: grant,
        expected_revision: f.card.revision,
        content_language: 'EN',
        projection: authoritativeProjection(f.card, 'EN'),
        acknowledge_move_to_draft: [],
    };
    assert.equal(
        (
            await f.send(true, {
                ...f.applyBody,
                acknowledge_move_to_draft: true,
            })
        ).statusCode,
        200,
    );
    const r = await f.service.app.inject({
        method: 'POST',
        url: '/api/v1/carder/write-back',
        payload: request,
    });
    assert.equal(r.statusCode, 409, r.body);
    assert.equal(r.json().code, 'REVISION_CONFLICT');
    assert.ok(f.service.carderWriteGrants.verify(grant));
});
for (const normalizer of [1, 2])
    test(`RUN023 does not narrow existing TEXT Apply normalizer-v${normalizer}`, async (t) => {
        const f = await setup(t, { normalizer });
        const r = await f.service.app.inject({
            method: 'POST',
            url: `/api/v1/library/external-sources/candidates/${f.cid}/apply-text`,
            payload: {
                ...f.body,
                selected_fields: [{ block: 'TEXT:EN', field: 'name' }],
                acknowledge_move_to_draft_blocks: [],
            },
        });
        assert.equal(r.statusCode, 200, r.body);
        assert.equal(r.json().changed, true);
    });
test('RUN023 pure strict coherence rejects Draft-incoherent results independently of password', () => {
    const c = original();
    assert.equal(coherentStructure(c), true);
    assert.equal(
        coherentStructure({
            ...c,
            kind: 'MONSTER',
            summonKind: 'LINK',
            abilities: ['PENDULUM'],
            linkMarkers: [],
            rank: null,
            level: null,
            atk: 1,
            def: null,
            pendulumScale: null,
            attributeCode: 'LIGHT',
            raceCode: 'DRAGON',
        }),
        false,
    );
    assert.equal(
        coherentStructure({ kind: 'SPELL', subtypeCode: null }),
        false,
    );
});

test('RUN023 retrieval source gate is independent of valid candidate identity', async (t) => {
    const f = await setup(t);
    f.service.persistence!.runRepositoryOperation((db) =>
        db
            .prepare(
                "UPDATE external_source_records SET source_code='OTHER' WHERE external_record_key='13036'",
            )
            .run(),
    );
    assert.deepEqual((await preview(f)).reason_codes, ['SOURCE_NOT_SUPPORTED']);
    await error(f, 'EXTERNAL_CANDIDATE_NOT_ELIGIBLE');
});
test('RUN023 missing Canonical target returns NOT_FOUND after frozen revision validation', async (t) => {
    const f = await setup(t);
    Object.defineProperty(f.service.canonical, 'getCard', {
        configurable: true,
        value: () => null,
    });
    await error(f, 'REVISION_CONFLICT', 409, {
        ...f.applyBody,
        target_expected_revision: '999',
    });
    await error(f, 'NOT_FOUND', 404);
});
test('RUN023 actual TOKEN target has no complete STRUCTURE acceptance', async (t) => {
    const f = await setup(t, { family: 'TOKEN' });
    assert.deepEqual((await preview(f)).reason_codes, ['UNSUPPORTED_FAMILY']);
    await error(f, 'EXTERNAL_STRUCTURE_NOT_ELIGIBLE');
});
test('RUN023 compatibility reason codes keep the exact frozen order before target errors', async (t) => {
    const f = await setup(t);
    f.alter((c) => {
        c.identity.source_code = 'OTHER' as never;
        c.candidate_schema_version = 9 as never;
        c.authoritative = true as never;
    });
    f.service.persistence!.runRepositoryOperation((db) => {
        db.prepare(
            'UPDATE external_source_candidates SET normalizer_version=1 WHERE candidate_id=?',
        ).run(f.cid);
        db.prepare(
            "UPDATE external_source_retrievals SET status='FAILED' WHERE retrieval_id=?",
        ).run(f.rid);
    });
    const expected = [
        'SOURCE_NOT_SUPPORTED',
        'CANDIDATE_SCHEMA_NOT_SUPPORTED',
        'NORMALIZER_VERSION_NOT_SUPPORTED',
        'AUTHORITATIVE_CANDIDATE_NOT_SUPPORTED',
        'RETRIEVAL_STATUS_NOT_SUPPORTED',
    ];
    assert.deepEqual((await preview(f)).reason_codes, expected);
    const e = await error(f, 'EXTERNAL_CANDIDATE_NOT_ELIGIBLE', 422, {
        ...f.applyBody,
        target_card_id: 'wrong',
    });
    assert.deepEqual(e.reason_codes, expected);
});
test('RUN023 applicability/build reasons use exact frozen order independently of discovery order', async (t) => {
    const f = await setup(t);
    f.alter((c) => {
        c.blocks.STRUCTURE.fields.atk = present('bad');
        c.blocks.STRUCTURE.fields.level = {
            state: 'ABSENT',
            evidence: c.blocks.STRUCTURE.fields.level!.evidence,
        };
        c.blocks.STRUCTURE.fields.rank = present(2);
    });
    assert.deepEqual((await preview(f)).reason_codes, [
        'REQUIRED_CLAIM_NOT_PRESENT',
        'NON_APPLICABLE_CLAIM_PRESENT',
        'STRUCTURE_VALUE_INVALID',
    ]);
    await error(f, 'EXTERNAL_STRUCTURE_NOT_ELIGIBLE');
});
