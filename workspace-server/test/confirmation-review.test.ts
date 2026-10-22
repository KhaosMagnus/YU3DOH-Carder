import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { bootstrapWorkspaceDatabase } from '../src/persistence/operations';
import { createWorkspaceService, type WorkspaceService } from '../src/service';
import { CanonicalDomainError } from '../src/canonical/errors';
import type { CanonicalStructureInput, SemanticBlockKey } from '../src/canonical/types';
const roots: string[] = [];
const services: WorkspaceService[] = [];
async function setup() {
    const root = await mkdtemp(path.join(os.tmpdir(), 'RUN014 日本語 '));
    roots.push(root);
    const m = {
        workspace_id: 'run014',
        workspace_format_version: 1,
        database_path: 'Data/workspace.db',
        created_at: '2026-10-11T00:00:00Z',
        name: 'RUN014',
    };
    await writeFile(path.join(root, 'workspace.json'), JSON.stringify(m));
    bootstrapWorkspaceDatabase(root, m);
    const service = await createWorkspaceService({
        workspaceRoot: root,
        host: '127.0.0.1',
        port: 4312,
    });
    services.push(service);
    const c = service.canonical!;
    c.registerStructuralCode('ATTRIBUTE', 'LIGHT');
    c.registerStructuralCode('RACE', 'DRAGON');
    c.registerStructuralCode('ABILITY', 'PENDULUM');
    let card = c.createCard({ family: 'SPELL', password: '14000001' });
    card = c.mutateCard(card.cardId, card.revision, {
        structure: { kind: 'SPELL', subtypeCode: 'NORMAL' },
        localizations: ['EN', 'ES', 'JP'].map((language) => ({
            language: language as 'EN' | 'ES' | 'JP',
            name: language,
            cardText: 'Text',
            pendulumText: null,
        })),
        classification: { effectReviewed: true },
    });
    return { service, c, card };
}
const source = { sourceKind: 'MANUAL', sourceRef: 'RUN014', note: 'reviewed' };
const code = (value: string) => (e: unknown) =>
    e instanceof CanonicalDomainError && e.code === value;
const snapshot = (s: WorkspaceService) =>
    s.persistence!.runRepositoryOperation((db) =>
        Object.fromEntries(
            (
                db
                    .prepare(
                        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
                    )
                    .all() as { name: string }[]
            ).map(({ name }) => [name, db.prepare(`SELECT * FROM ${name}`).all()]),
        ),
    );
test.after(async () => {
    await Promise.all(services.map((s) => s.close()));
    await Promise.all(roots.map((r) => rm(r, { recursive: true, force: true })));
});
for (const block of [
    'STRUCTURE',
    'TEXT:EN',
    'TEXT:ES',
    'TEXT:JP',
    'CLASSIFICATION',
    'RELATIONS',
] as SemanticBlockKey[])
    test(`RUN014 ${block} persisted Review is confirmable and read-only across every domain table`, async () => {
        const f = await setup();
        const before = snapshot(f.service);
        const review = f.c.reviewConfirmation(f.card.cardId, f.card.revision, block);
        assert.equal(review.confirmable, true);
        assert.equal(review.validation.status, 'PASS');
        assert.equal(review.revision, f.card.revision);
        assert.deepEqual(snapshot(f.service), before);
        const after = f.c.mutateCard(f.card.cardId, review.revision, {
            confirmations: [{ block, state: 'CONFIRMED', provenance: source }],
        });
        assert.equal(after.confirmations.find((c) => c.block === block)!.state, 'CONFIRMED');
        assert.equal(Number(after.revision), Number(f.card.revision) + 1);
        assert.deepEqual(after.localizations, f.card.localizations);
        assert.deepEqual(after.structure, f.card.structure);
        assert.deepEqual(after.classification, f.card.classification);
        assert.deepEqual(after.relations, f.card.relations);
        assert.equal(after.password, f.card.password);
        assert.deepEqual(
            after.confirmations.filter((c) => c.block !== block),
            f.card.confirmations.filter((c) => c.block !== block),
        );
        assert.equal(after.provenance.length, f.card.provenance.length + 1);
        assert.equal(
            after.provenance.at(-1)!.provenanceId,
            after.confirmations.find((c) => c.block === block)!.provenanceId,
        );
    });
test('RUN014 invalid structure Review FAIL and confirmation rollback leave every table unchanged', async () => {
    const f = await setup();
    const card = f.c.mutateCard(f.card.cardId, f.card.revision, { password: null });
    const before = snapshot(f.service);
    assert.equal(
        f.c.reviewConfirmation(card.cardId, card.revision, 'STRUCTURE').validation.status,
        'FAIL',
    );
    assert.throws(
        () =>
            f.c.mutateCard(card.cardId, card.revision, {
                confirmations: [{ block: 'STRUCTURE', state: 'CONFIRMED', provenance: source }],
            }),
        code('DOMAIN_VALIDATION'),
    );
    assert.deepEqual(snapshot(f.service), before);
});
for (const kind of ['missing', 'name', 'text', 'pendulum'] as const)
    test(`RUN014 localized ${kind} Review and execution share invalid-domain rules`, async () => {
        const f = await setup();
        let card = f.c.createCard({ family: kind === 'pendulum' ? 'MONSTER' : 'SPELL' });
        if (kind !== 'missing') {
            card = f.c.mutateCard(card.cardId, card.revision, {
                localizations: [
                    {
                        language: 'EN',
                        name: kind === 'name' ? null : 'Name',
                        cardText: kind === 'text' ? null : 'Text',
                        pendulumText: null,
                    },
                ],
                ...(kind === 'pendulum'
                    ? {
                          structure: {
                              kind: 'MONSTER',
                              summonKind: 'MAIN_DECK',
                              attributeCode: 'LIGHT',
                              raceCode: 'DRAGON',
                              level: 4,
                              rank: null,
                              atk: 1000,
                              def: 1000,
                              pendulumScale: 0,
                              abilities: ['PENDULUM'],
                              linkMarkers: [],
                          } as CanonicalStructureInput,
                      }
                    : {}),
            });
        }
        const before = snapshot(f.service);
        assert.equal(
            f.c.reviewConfirmation(card.cardId, card.revision, 'TEXT:EN').confirmable,
            false,
        );
        assert.throws(
            () =>
                f.c.mutateCard(card.cardId, card.revision, {
                    confirmations: [{ block: 'TEXT:EN', state: 'CONFIRMED', provenance: source }],
                }),
            code('DOMAIN_VALIDATION'),
        );
        assert.deepEqual(snapshot(f.service), before);
    });
test('RUN014 Classification effect_reviewed is authoritative; empty lists and relations allowed', async () => {
    const f = await setup();
    const card = f.c.createCard({ family: 'SPELL' });
    assert.equal(
        f.c.reviewConfirmation(card.cardId, card.revision, 'CLASSIFICATION').confirmable,
        false,
    );
    assert.equal(f.c.reviewConfirmation(card.cardId, card.revision, 'RELATIONS').confirmable, true);
});
for (const blank of ['', ' ', '   '])
    test(`RUN014 source_kind ${JSON.stringify(blank)} rejected atomically`, async () => {
        const f = await setup();
        const before = snapshot(f.service);
        assert.throws(
            () =>
                f.c.mutateCard(f.card.cardId, f.card.revision, {
                    confirmations: [
                        {
                            block: 'STRUCTURE',
                            state: 'CONFIRMED',
                            provenance: { sourceKind: blank },
                        },
                    ],
                }),
            code('DOMAIN_VALIDATION'),
        );
        assert.deepEqual(snapshot(f.service), before);
    });
test('RUN014 stale Review and stale Confirm reject with no provenance or mutation', async () => {
    const f = await setup();
    const review = f.c.reviewConfirmation(f.card.cardId, f.card.revision, 'STRUCTURE');
    f.c.mutateCard(f.card.cardId, f.card.revision, { password: '14000002' });
    const before = snapshot(f.service);
    assert.throws(
        () => f.c.reviewConfirmation(f.card.cardId, f.card.revision, 'STRUCTURE'),
        code('REVISION_CONFLICT'),
    );
    assert.throws(
        () =>
            f.c.mutateCard(f.card.cardId, review.revision, {
                confirmations: [{ block: 'STRUCTURE', state: 'CONFIRMED', provenance: source }],
            }),
        code('REVISION_CONFLICT'),
    );
    assert.deepEqual(snapshot(f.service), before);
});
for (const kind of ['MONSTER', 'XYZ', 'LINK', 'PENDULUM', 'TOKEN', 'TRAP'] as const)
    test(`RUN014 existing ${kind} valid STRUCTURE rules reused by Review and confirmation`, async () => {
        const f = await setup();
        const family = kind === 'TRAP' ? 'TRAP' : kind === 'TOKEN' ? 'TOKEN' : 'MONSTER';
        let card = f.c.createCard({ family, password: family === 'TOKEN' ? null : '14000003' });
        f.c.registerStructuralCode('LINK_MARKER', 'TOP');
        const structure: CanonicalStructureInput =
            family === 'TRAP'
                ? { kind: 'TRAP', subtypeCode: 'NORMAL' }
                : family === 'TOKEN'
                  ? {
                        kind: 'TOKEN',
                        attributeCode: 'LIGHT',
                        raceCode: 'DRAGON',
                        level: 4,
                        atk: 1000,
                        def: 1000,
                    }
                  : {
                        kind: 'MONSTER',
                        summonKind: kind === 'XYZ' ? 'XYZ' : kind === 'LINK' ? 'LINK' : 'MAIN_DECK',
                        attributeCode: 'LIGHT',
                        raceCode: 'DRAGON',
                        level: kind === 'XYZ' || kind === 'LINK' ? null : 4,
                        rank: kind === 'XYZ' ? 0 : null,
                        atk: 1000,
                        def: kind === 'LINK' ? null : 1000,
                        pendulumScale: kind === 'PENDULUM' ? 0 : null,
                        abilities: kind === 'PENDULUM' ? ['PENDULUM'] : [],
                        linkMarkers: kind === 'LINK' ? ['TOP'] : [],
                    };
        card = f.c.mutateCard(card.cardId, card.revision, { structure });
        assert.equal(
            f.c.reviewConfirmation(card.cardId, card.revision, 'STRUCTURE').confirmable,
            true,
        );
        f.c.mutateCard(card.cardId, card.revision, {
            confirmations: [{ block: 'STRUCTURE', state: 'CONFIRMED', provenance: source }],
        });
        assert.equal(f.c.getCard(card.cardId)!.structure?.kind, structure.kind);
    });
test('RUN014 Token password cannot be introduced under existing domain rules', async () => {
    const f = await setup();
    const card = f.c.createCard({ family: 'TOKEN' });
    assert.throws(
        () => f.c.mutateCard(card.cardId, card.revision, { password: '1' }),
        code('DOMAIN_VALIDATION'),
    );
});
test('RUN014 HTTP read-only/invalid/stale/not-found/malformed/PATCH/provenance and maintenance contracts', async () => {
    const f = await setup();
    const url = `/api/v1/library/cards/${f.card.cardId}`;
    const before = snapshot(f.service);
    const review = await f.service.app.inject({
        method: 'POST',
        url: url + '/confirmation-review',
        payload: { block: 'STRUCTURE', expected_revision: f.card.revision },
    });
    assert.equal(review.statusCode, 200);
    assert.equal(review.json().confirmable, true);
    assert.deepEqual(snapshot(f.service), before);
    for (const [block, revision, status] of [
        ['INVALID', f.card.revision, 400],
        ['STRUCTURE', 'stale', 409],
    ] as const) {
        const r = await f.service.app.inject({
            method: 'POST',
            url: url + '/confirmation-review',
            payload: { block, expected_revision: revision },
        });
        assert.equal(r.statusCode, status);
    }
    assert.equal(
        (
            await f.service.app.inject({
                method: 'POST',
                url: '/api/v1/library/cards/absent/confirmation-review',
                payload: { block: 'STRUCTURE', expected_revision: '1' },
            })
        ).statusCode,
        404,
    );
    const r = await f.service.app.inject({
        method: 'PATCH',
        url,
        payload: {
            expected_revision: f.card.revision,
            confirmations: [
                {
                    block: 'TEXT:ES',
                    state: 'CONFIRMED',
                    provenance: { source_kind: 'MANUAL', source_ref: '   ', note: '   ' },
                },
            ],
        },
    });
    assert.equal(r.statusCode, 200, r.body);
    assert.equal(r.json().confirmations.find((c: any) => c.block === 'TEXT:ES').state, 'CONFIRMED');
    assert.equal(r.json().provenance.length, 1);
    assert.equal(r.json().provenance[0].source_ref, null);
    assert.equal(r.json().provenance[0].note, null);
    const release = f.service.runtime.maintenance.acquireMaintenance('MIGRATION');
    assert.throws(
        () => f.c.reviewConfirmation(f.card.cardId, r.json().revision, 'STRUCTURE'),
        (e: unknown) => (e as any).code === 'WORKSPACE_MAINTENANCE_ACTIVE',
    );
    release();
    f.service.runtime.recoveryRequired('test');
    const blocked = await f.service.app.inject({
        method: 'POST',
        url: url + '/confirmation-review',
        payload: { block: 'STRUCTURE', expected_revision: '1' },
    });
    assert.equal(blocked.statusCode, 503);
    assert.equal(blocked.json().code, 'WORKSPACE_NOT_READY');
});

test('RUN014 HTTP invalid Draft is ordinary FAIL; blank/missing provenance and invalid confirmation persist nothing', async () => {
    const f = await setup();
    const card = f.c.createCard({ family: 'SPELL' });
    const url = `/api/v1/library/cards/${card.cardId}`;
    const before = snapshot(f.service);
    const review = await f.service.app.inject({
        method: 'POST',
        url: url + '/confirmation-review',
        payload: { block: 'STRUCTURE', expected_revision: card.revision },
    });
    assert.equal(review.statusCode, 200);
    assert.deepEqual(review.json().validation.status, 'FAIL');
    assert.equal(review.json().confirmable, false);
    for (const provenance of [undefined, { source_kind: ' ' }, { source_kind: 'MANUAL' }]) {
        const r = await f.service.app.inject({
            method: 'PATCH',
            url,
            payload: {
                expected_revision: card.revision,
                confirmations: [
                    {
                        block: 'STRUCTURE',
                        state: 'CONFIRMED',
                        ...(provenance ? { provenance } : {}),
                    },
                ],
            },
        });
        assert.equal(r.statusCode, 422, r.body);
        assert.deepEqual(snapshot(f.service), before);
    }
});

test('RUN014 positive persisted RELATIONS review/confirm retains targets and introduces no inference', async () => {
    const f = await setup();
    const target = f.c.createCard({ family: 'TOKEN' });
    const card = f.c.mutateCard(f.card.cardId, f.card.revision, {
        relations: [
            { relationTypeCode: 'CREATES_TOKEN', targetCardId: target.cardId, note: 'explicit' },
        ],
    });
    const before = snapshot(f.service);
    assert.equal(f.c.reviewConfirmation(card.cardId, card.revision, 'RELATIONS').confirmable, true);
    assert.deepEqual(snapshot(f.service), before);
    const next = f.c.mutateCard(card.cardId, card.revision, {
        confirmations: [{ block: 'RELATIONS', state: 'CONFIRMED', provenance: source }],
    });
    assert.deepEqual(next.relations, card.relations);
    assert.equal(next.relations.length, 1);
});

for (const [summon, field, max, legacy] of [['MAIN_DECK', 'level', 12, 18], ['XYZ', 'rank', 13, 14]] as const)
    test(`CR-0001.2 F ${field} Review/Confirm current domain, legacy confirmed compatibility and demotion`, async () => {
        const f = await setup();
        let card = f.c.createCard({ family: 'MONSTER', password: '12345678' });
        const structure = (value: number): CanonicalStructureInput => ({ kind: 'MONSTER', summonKind: summon, attributeCode: 'LIGHT', raceCode: 'DRAGON', level: field === 'level' ? value : null, rank: field === 'rank' ? value : null, atk: 0, def: 0, pendulumScale: null, abilities: [], linkMarkers: [] });
        for (const value of [0, max]) {
            card = f.c.mutateCard(card.cardId, card.revision, { structure: structure(value), confirmations: [{ block: 'STRUCTURE', state: 'DRAFT' }] });
            assert.equal(f.c.reviewConfirmation(card.cardId, card.revision, 'STRUCTURE').validation.status, 'PASS');
            card = f.c.mutateCard(card.cardId, card.revision, { confirmations: [{ block: 'STRUCTURE', state: 'CONFIRMED', provenance: source }] });
        }
        f.service.persistence!.runRepositoryOperation(db => db.prepare(`UPDATE canonical_monster_structure SET ${field}=? WHERE card_id=?`).run(legacy, card.cardId));
        card = f.c.mutateCard(card.cardId, card.revision, { localizations: [{ language: 'EN', name: 'Legacy', cardText: 'Text', pendulumText: null }] });
        assert.equal(card.confirmations.find(c => c.block === 'STRUCTURE')!.state, 'CONFIRMED');
        for (const demote of [false, true]) {
            if (demote) card = f.c.mutateCard(card.cardId, card.revision, { confirmations: [{ block: 'STRUCTURE', state: 'DRAFT' }] });
            const before = snapshot(f.service);
            const review = f.c.reviewConfirmation(card.cardId, card.revision, 'STRUCTURE');
            assert.equal(review.validation.status, 'FAIL');
            assert.equal(review.validation.code, 'DOMAIN_VALIDATION');
            assert.match(review.validation.message!, new RegExp(`${field}.*0\\.\\.${max}`));
            const response = await f.service.app.inject({ method: 'PATCH', url: `/api/v1/library/cards/${card.cardId}`, payload: { expected_revision: card.revision, confirmations: [{ block: 'STRUCTURE', state: 'CONFIRMED', provenance: { source_kind: 'MANUAL' } }] } });
            assert.equal(response.statusCode, 422, response.body);
            assert.equal(response.json().code, 'DOMAIN_VALIDATION');
            assert.deepEqual(snapshot(f.service), before);
        }
        card = f.c.mutateCard(card.cardId, card.revision, { structure: structure(max) });
        assert.equal(f.c.reviewConfirmation(card.cardId, card.revision, 'STRUCTURE').validation.status, 'PASS');
    });
