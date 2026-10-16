import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
    previewExternalStructure,
    applyExternalStructure,
    setLibraryMaintenanceFence,
    LibraryHttpError,
} from '../src/library/api';
import {
    structureApplyAllowed,
    structureReviewRows,
    STRUCTURE_PERSISTED_WARNING,
    STRUCTURE_STALE_WARNING,
    type StructurePreview,
} from '../src/library/external-structure-acceptance-state';
export async function runStructureAcceptanceChecks() {
    let count = 0;
    const check = (name: string, run: () => void) => {
        run();
        console.log(`RUN023 CLIENT ${++count} ${name} PASS`);
    };
    const p = {
        decision: 'READY',
        eligible: true,
        acknowledgement_required: false,
        changes: [
            {
                kind: 'SOURCE_CHANGE',
                field: 'atk',
                current: 1000,
                result: 1200,
                trigger: null,
            },
            {
                kind: 'DERIVED_CLEAR',
                field: 'level',
                current: 4,
                result: null,
                trigger: 'summon_kind',
            },
        ],
        unchanged_fields: ['rank'],
        source_structure: {
            fields: { atk: { state: 'PRESENT', value: 1200 } },
        },
        read_only_evidence: [
            {
                field: 'family',
                current: 'MONSTER',
                source: { state: 'PRESENT', value: 'MONSTER' },
                result: 'MONSTER',
            },
            {
                field: 'password',
                current: '12345678',
                source: null,
                result: '12345678',
            },
            {
                field: 'link_rating',
                current: null,
                source: { state: 'PRESENT', value: 3 },
                result: 3,
            },
        ],
    } as unknown as StructurePreview;
    check('server READY permits Apply', () =>
        assert.equal(structureApplyAllowed(p, false, true, false, false), true),
    );
    check('dirty state blocks Apply before request', () =>
        assert.equal(structureApplyAllowed(p, true, true, false, false), false),
    );
    check('disabled runtime blocks Apply', () =>
        assert.equal(
            structureApplyAllowed(p, false, false, false, false),
            false,
        ),
    );
    check('in-flight work blocks duplicate Apply', () =>
        assert.equal(structureApplyAllowed(p, false, true, true, false), false),
    );
    check('CONFIRMED requires acknowledgement', () =>
        assert.equal(
            structureApplyAllowed(
                { ...p, acknowledgement_required: true },
                false,
                true,
                false,
                false,
            ),
            false,
        ),
    );
    check('exact acknowledgement enables valid Preview', () =>
        assert.equal(
            structureApplyAllowed(
                { ...p, acknowledgement_required: true },
                false,
                true,
                false,
                true,
            ),
            true,
        ),
    );
    for (const decision of ['NO_OP', 'BLOCKED', 'INELIGIBLE'] as const)
        check(`${decision} disables mutation`, () =>
            assert.equal(
                structureApplyAllowed(
                    { ...p, decision },
                    false,
                    true,
                    false,
                    true,
                ),
                false,
            ),
        );
    check('client cannot override server eligibility', () =>
        assert.equal(
            structureApplyAllowed(
                { ...p, eligible: false },
                false,
                true,
                false,
                true,
            ),
            false,
        ),
    );
    check('missing Preview cannot mutate', () =>
        assert.equal(
            structureApplyAllowed(null, false, true, false, true),
            false,
        ),
    );
    check('review preserves source/derived/unchanged/read-only classes', () =>
        assert.deepEqual(
            structureReviewRows(p).map((r) => r.kind),
            [
                'SOURCE_CHANGE',
                'DERIVED_CLEAR',
                'UNCHANGED',
                'READ_ONLY',
                'READ_ONLY',
                'READ_ONLY',
            ],
        ),
    );
    check('review preserves derived trigger and explicit null', () => {
        const r = structureReviewRows(p)[1]!;
        assert.equal(r.trigger, 'summon_kind');
        assert.equal(r.result, null);
    });
    check('read-only password and rating remain visible', () =>
        assert.deepEqual(
            structureReviewRows(p)
                .filter((r) => r.kind === 'READ_ONLY')
                .map((r) => r.field),
            ['family', 'password', 'link_rating'],
        ),
    );
    check('persisted-state and stale-after-success warnings explicit', () => {
        assert.match(
            STRUCTURE_PERSISTED_WARNING,
            /persisted Canonical state.*Unsaved edits are not included/,
        );
        assert.match(STRUCTURE_STALE_WARNING, /stale.*not be rebased/);
    });
    const original = globalThis.fetch,
        calls: Array<{ url: string; init: RequestInit | undefined }> = [];
    globalThis.fetch = (async (url, init) => {
        calls.push({ url: String(url), init });
        return new Response(JSON.stringify(p), {
            headers: { 'content-type': 'application/json' },
        });
    }) as typeof fetch;
    const body = { target_card_id: 'card', target_expected_revision: '12' };
    try {
        await previewExternalStructure('candidate space', body);
        check(
            'Preview exact POST candidate route and frozen target/revision',
            () => {
                const c = calls.at(-1)!;
                assert.equal(
                    c.url,
                    '/api/v1/library/external-sources/candidates/candidate%20space/preview-structure',
                );
                assert.equal(c.init!.method, 'POST');
                assert.deepEqual(JSON.parse(String(c.init!.body)), body);
            },
        );
        await applyExternalStructure('candidate', {
            ...body,
            acknowledge_move_to_draft: true,
            note: 'reviewed',
        });
        check(
            'Apply never supplies client result/fields/provider values',
            () => {
                const c = calls.at(-1)!;
                assert.equal(
                    c.url,
                    '/api/v1/library/external-sources/candidates/candidate/apply-structure',
                );
                assert.deepEqual(
                    Object.keys(JSON.parse(String(c.init!.body))).sort(),
                    [
                        'acknowledge_move_to_draft',
                        'note',
                        'target_card_id',
                        'target_expected_revision',
                    ],
                );
            },
        );
        setLibraryMaintenanceFence('BACKUP');
        await previewExternalStructure('candidate', body);
        check('BACKUP permits persisted-state Preview', () =>
            assert.ok(calls.at(-1)!.url.endsWith('/preview-structure')),
        );
        const n = calls.length;
        await assert.rejects(
            applyExternalStructure('candidate', {
                ...body,
                acknowledge_move_to_draft: false,
            }),
            (e) =>
                e instanceof LibraryHttpError &&
                e.code === 'WORKSPACE_MAINTENANCE_ACTIVE',
        );
        check('BACKUP blocks actual Apply before fetch', () =>
            assert.equal(calls.length, n),
        );
        for (const mode of [
            'RESTORE',
            'MIGRATION',
            'INITIALIZATION',
        ] as const) {
            setLibraryMaintenanceFence(mode);
            const n = calls.length;
            await assert.rejects(previewExternalStructure('candidate', body));
            await assert.rejects(
                applyExternalStructure('candidate', {
                    ...body,
                    acknowledge_move_to_draft: false,
                }),
            );
            check(`${mode} fences both routes`, () =>
                assert.equal(calls.length, n),
            );
        }
        setLibraryMaintenanceFence('NONE');
        globalThis.fetch = (async () =>
            new Response(
                JSON.stringify({
                    code: 'CONFIRMED_BLOCK_DEPENDENCY_CONFLICT',
                    message: 'blocked',
                    blocking_blocks: ['TEXT:EN', 'TEXT:ES', 5],
                    reason_codes: ['CONFIRMED_BLOCK_DEPENDENCY_CONFLICT'],
                }),
                {
                    status: 409,
                    headers: { 'content-type': 'application/json' },
                },
            )) as typeof fetch;
        let failure: LibraryHttpError | undefined;
        try {
            await applyExternalStructure('candidate', {
                ...body,
                acknowledge_move_to_draft: false,
            });
        } catch (e) {
            if (e instanceof LibraryHttpError) failure = e;
            else throw e;
        }
        check(
            'server blockers/reasons preserved as strings with HTTP conflict',
            () => {
                assert.equal(failure?.status, 409);
                assert.deepEqual(failure?.blockingBlocks, [
                    'TEXT:EN',
                    'TEXT:ES',
                ]);
                assert.deepEqual(failure?.reasonCodes, [
                    'CONFIRMED_BLOCK_DEPENDENCY_CONFLICT',
                ]);
            },
        );
    } finally {
        globalThis.fetch = original;
        setLibraryMaintenanceFence('NONE');
    }
    const ui = readFileSync(
            'src/library/external-structure-acceptance-panel.tsx',
            'utf8',
        ),
        parent = readFileSync('src/library/external-sources-panel.tsx', 'utf8');
    check(
        'UI uses complete server result without field selections/provider path',
        () => {
            assert.match(ui, /Current Canonical/);
            assert.match(ui, /Source Candidate/);
            assert.match(ui, /Resulting Structure/);
            assert.doesNotMatch(
                ui,
                /selected_fields|retrieveExternalSource|registerStructuralCode/,
            );
            assert.ok(
                parent.includes('block.startsWith(') &&
                    parent.includes("'TEXT:'"),
            );
        },
    );
    check('UI exact ack and authoritative refresh/stale invalidation', () => {
        assert.match(ui, /I understand STRUCTURE will move to DRAFT\./);
        assert.ok(
            ui.includes('await Promise.all') &&
                ui.includes('onRefresh!(value.card_id)'),
        );
        assert.match(parent, /setForcedStale\(true\)/);
        assert.match(parent, /setDiff\(null\)/);
    });
    assert.equal(count, 25);
    console.log(`RUN023 CLIENT ${count} checks PASS`);
}
