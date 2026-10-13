import assert from 'node:assert/strict';
import {
    applyBatchClassification,
    previewBatchClassification,
    setLibraryMaintenanceFence,
} from '../src/library/api';
import type { LibraryCardSummary } from '../src/library/model';
import {
    batchApplyRequest,
    batchCanApply,
    batchFingerprint,
    batchOperationError,
    batchParticipatingDetail,
    batchRequest,
    batchRequiredAcknowledgements,
    BATCH_STATUS_LABELS,
    deselectBatchCard,
    hiddenBatchCount,
    normalizeBatchOperation,
    selectBatchCards,
    stopBatchCheckboxEvent,
    type BatchOperation,
    type BatchPreview,
    type BatchResult,
    type BatchSelection,
} from '../src/library/batch-classification-state';

export const runBatchClassificationChecks = async () => {
    let count = 0;
    const check = (name: string, fn: () => void) => {
        fn();
        console.log(`RUN018 client ${++count} ${name} PASS`);
    };
    const card = (id: number, revision = '12'): LibraryCardSummary => ({
        card_id: `card-${id}`,
        revision,
        display_name: `Card ${id}`,
        family: 'SPELL',
        password: String(id),
        display_language: 'EN',
        available_languages: ['EN'],
        archetypes: [],
        effect_classifiers: [],
        functional_tags: [],
        variant_count: 0,
        has_standard_ready_variant: false,
        has_overframe_ready_variant: false,
    });
    let selected: BatchSelection = new Map();
    check('individual selection freezes identity/revision', () => {
        selected = selectBatchCards(selected, [card(1)]);
        assert.deepEqual(selected.get('card-1'), {
            card_id: 'card-1',
            expected_revision: '12',
            display_name: 'Card 1',
            family: 'SPELL',
            password: '1',
            display_language: 'EN',
        });
    });
    check('cross-page addition preserves first page', () => {
        selected = selectBatchCards(selected, [card(51)]);
        assert.equal(selected.size, 2);
        assert(selected.has('card-1'));
    });
    check('hidden count on next page', () =>
        assert.equal(hiddenBatchCount(selected, [card(51)]), 1),
    );
    check('filter excludes everything without deselection', () => {
        assert.equal(hiddenBatchCount(selected, []), 2);
        assert.equal(selected.size, 2);
    });
    check('browse refresh cannot update frozen revision', () => {
        selected = selectBatchCards(selected, [card(1, '99')]);
        assert.equal(selected.get('card-1')!.expected_revision, '12');
    });
    check('deselection is explicit', () => {
        selected = deselectBatchCard(selected, 'card-1');
        assert(!selected.has('card-1'));
    });
    check('explicit reselection adopts new revision', () => {
        selected = selectBatchCards(selected, [card(1, '99')]);
        assert.equal(selected.get('card-1')!.expected_revision, '99');
    });
    check('Select current page materializes IDs/revisions only', () => {
        const page = selectBatchCards(new Map(), [card(1), card(2, '3')]);
        assert.deepEqual(
            batchRequest(page, { set_effect_reviewed: true }, '').items,
            [
                { card_id: 'card-1', expected_revision: '12' },
                { card_id: 'card-2', expected_revision: '3' },
            ],
        );
    });
    const full = selectBatchCards(
        new Map(),
        Array.from({ length: 200 }, (_, n) => card(n)),
    );
    check('200 active cards supported', () => assert.equal(full.size, 200));
    check('201 blocked with visible-cap explanation', () => {
        assert.throws(
            () => selectBatchCards(full, [card(201)]),
            /Maximum selection is 200/,
        );
        assert.equal(full.size, 200);
    });
    check('Select page exceeding cap is all-or-nothing', () => {
        const start = selectBatchCards(
            new Map(),
            Array.from({ length: 190 }, (_, n) => card(n)),
        );
        assert.throws(() =>
            selectBatchCards(
                start,
                Array.from({ length: 20 }, (_, n) => card(190 + n)),
            ),
        );
        assert.equal(start.size, 190);
        assert(!start.has('card-190'));
    });
    check('existing selected page rows count once', () =>
        assert.equal(selectBatchCards(full, [card(1, 'new')]).size, 200),
    );
    check('selection independent of Detail checkbox propagation', () => {
        let stopped = false;
        stopBatchCheckboxEvent({
            stopPropagation() {
                stopped = true;
            },
        });
        assert(stopped);
    });
    check('empty Classification operation blocked', () =>
        assert.match(batchOperationError({})!, /at least one/),
    );
    for (const dimension of [
        'archetype',
        'effect_classifier',
        'functional_tag',
    ] as const)
        check(`${dimension} ADD/REMOVE collision blocked`, () =>
            assert.match(
                batchOperationError({
                    [`add_${dimension}_ids`]: ['x'],
                    [`remove_${dimension}_ids`]: ['x'],
                })!,
                /both ADD and REMOVE/,
            ),
        );
    check('effect-reviewed True is a valid operation', () =>
        assert.equal(batchOperationError({ set_effect_reviewed: true }), null),
    );
    check('effect-reviewed False is a valid operation', () =>
        assert.equal(batchOperationError({ set_effect_reviewed: false }), null),
    );
    check('effect-reviewed Unchanged stays omitted', () =>
        assert(
            !(
                'set_effect_reviewed' in
                normalizeBatchOperation({ add_archetype_ids: ['a'] })
            ),
        ),
    );
    const operation: BatchOperation = {
        add_archetype_ids: ['b', 'a'],
        remove_effect_classifier_ids: ['e'],
        add_functional_tag_ids: ['f'],
        set_effect_reviewed: false,
    };
    const baseFingerprint = batchFingerprint(selected, operation, 'note');
    check('set ordering does not invalidate fingerprint', () =>
        assert.equal(
            batchFingerprint(
                selected,
                { ...operation, add_archetype_ids: ['a', 'b'] },
                'note',
            ),
            baseFingerprint,
        ),
    );
    check('selection invalidates Preview', () =>
        assert.notEqual(
            batchFingerprint(
                deselectBatchCard(selected, 'card-1'),
                operation,
                'note',
            ),
            baseFingerprint,
        ),
    );
    check('frozen revision invalidates Preview on explicit reselection', () =>
        assert.notEqual(
            batchFingerprint(
                selectBatchCards(deselectBatchCard(selected, 'card-1'), [
                    card(1, '100'),
                ]),
                operation,
                'note',
            ),
            baseFingerprint,
        ),
    );
    check('operation invalidates Preview', () =>
        assert.notEqual(
            batchFingerprint(
                selected,
                { ...operation, set_effect_reviewed: true },
                'note',
            ),
            baseFingerprint,
        ),
    );
    check('note invalidates Preview', () =>
        assert.notEqual(
            batchFingerprint(selected, operation, 'other'),
            baseFingerprint,
        ),
    );
    const preview: BatchPreview = {
        preview_id: 'correlation',
        summary: {
            selected: 2,
            would_change: 0,
            confirmed_requires_ack: 1,
            no_op: 1,
            revision_conflict: 0,
            domain_validation: 0,
            not_found: 0,
        },
        results: [
            {
                card_id: 'card-1',
                expected_revision: '99',
                observed_revision: '99',
                status: 'CONFIRMED_REQUIRES_ACK',
                changed: true,
                requires_move_to_draft: true,
                error_code: null,
                message: null,
            },
            {
                card_id: 'card-51',
                expected_revision: '12',
                observed_revision: '12',
                status: 'NO_OP',
                changed: false,
                requires_move_to_draft: false,
                error_code: null,
                message: null,
            },
        ],
    };
    check('acknowledgement list is exact confirmed-card IDs', () =>
        assert.deepEqual(batchRequiredAcknowledgements(preview), ['card-1']),
    );
    const dto = batchRequest(selected, operation, 'note');
    check(
        'Apply strips stale/unlisted acknowledgement IDs and has no Preview authority',
        () => {
            const body = batchApplyRequest(
                dto,
                preview,
                new Set(['card-1', 'card-51', 'outsider']),
            );
            assert.deepEqual(body.acknowledge_move_to_draft_card_ids, [
                'card-1',
            ]);
            assert(!('preview_id' in body));
            assert(!('classification' in body));
        },
    );
    const enabled = {
        previewMatches: true,
        preview,
        ack: new Set(['card-1']),
        editorDirty: false,
        mutationEnabled: true,
        busy: false,
    };
    check('valid exact Preview + ack enables Apply', () =>
        assert(batchCanApply(enabled)),
    );
    check('dirty Detail globally blocks Apply', () =>
        assert(!batchCanApply({ ...enabled, editorDirty: true })),
    );
    check('missing exact ack blocks Apply', () =>
        assert(!batchCanApply({ ...enabled, ack: new Set(['card-51']) })),
    );
    check('invalidated Preview blocks Apply', () =>
        assert(!batchCanApply({ ...enabled, previewMatches: false })),
    );
    check('no Preview blocks Apply', () =>
        assert(!batchCanApply({ ...enabled, preview: null })),
    );
    check(
        'not-ready/read-only/maintenance/clientDataBlocked gate blocks Apply',
        () => assert(!batchCanApply({ ...enabled, mutationEnabled: false })),
    );
    check('request in flight blocks Apply', () =>
        assert(!batchCanApply({ ...enabled, busy: true })),
    );
    const result: BatchResult = {
        batch_operation_id: 'batch-uuid',
        summary: {
            selected: 2,
            success: 1,
            no_op: 0,
            revision_conflict: 1,
            domain_validation: 0,
            confirmed_block_ack_required: 0,
            confirmed_block_state_changed: 0,
            not_found: 0,
        },
        results: [
            {
                card_id: 'card-1',
                expected_revision: '99',
                previous_revision: '99',
                revision: '100',
                status: 'SUCCESS',
                changed: true,
                moved_to_draft: true,
                error_code: null,
                message: null,
            },
            {
                card_id: 'card-51',
                expected_revision: '12',
                previous_revision: '15',
                revision: '15',
                status: 'REVISION_CONFLICT',
                changed: false,
                moved_to_draft: false,
                error_code: 'REVISION_CONFLICT',
                message: 'Refresh and explicitly reselect.',
            },
        ],
    };
    check('partial statuses/revisions/reasons retained', () => {
        assert.equal(BATCH_STATUS_LABELS[result.results[1].status], 'Conflict');
        assert.equal(result.results[1].expected_revision, '12');
        assert.equal(result.results[1].previous_revision, '15');
        assert(result.results[1].message);
    });
    check('selection clear does not erase result report', () => {
        selected = new Map();
        assert.equal(selected.size, 0);
        assert.equal(result.results.length, 2);
        assert.equal(result.summary.success, 1);
    });
    check('participating clean Detail triggers reload', () =>
        assert(batchParticipatingDetail(result, 'card-1', false)),
    );
    check('dirty/nonparticipating Detail never overwritten', () => {
        assert(!batchParticipatingDetail(result, 'card-1', true));
        assert(!batchParticipatingDetail(result, 'other', false));
    });
    check('retry requires new explicit selection and Preview', () => {
        assert(!batchCanApply({ ...enabled, previewMatches: false }));
        const again = selectBatchCards(new Map(), [card(51, '15')]);
        assert.equal(again.get('card-51')!.expected_revision, '15');
    });
    const originalFetch = globalThis.fetch;
    const calls: { url: string; body: any }[] = [];
    globalThis.fetch = (async (
        url: string | URL | Request,
        init?: RequestInit,
    ) => {
        calls.push({ url: String(url), body: JSON.parse(String(init?.body)) });
        return new Response(
            JSON.stringify(String(url).endsWith('/preview') ? preview : result),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
    }) as typeof fetch;
    try {
        await previewBatchClassification(dto);
        check('Preview exact dedicated endpoint and frozen DTO', () => {
            assert.equal(
                calls[0].url,
                '/api/v1/library/batch/classification/preview',
            );
            assert.deepEqual(calls[0].body, dto);
            assert.equal(calls[0].body.note, 'note');
        });
        // Preview does not consult the active Detail dirty signal; it remains a read.
        setLibraryMaintenanceFence('BACKUP');
        await previewBatchClassification(dto);
        check('Preview permitted under read-only BACKUP fencing', () =>
            assert.equal(calls.length, 2),
        );
        await assert.rejects(
            applyBatchClassification(
                batchApplyRequest(dto, preview, enabled.ack),
            ),
            (e: any) => e.code === 'WORKSPACE_MAINTENANCE_ACTIVE',
        );
        check('Apply blocked by actual client maintenance fence', () =>
            assert.equal(calls.length, 2),
        );
        setLibraryMaintenanceFence('NONE');
        await applyBatchClassification(
            batchApplyRequest(dto, preview, enabled.ack),
        );
        check('Apply exact DTO and endpoint', () => {
            assert.equal(
                calls[2].url,
                '/api/v1/library/batch/classification/apply',
            );
            assert.deepEqual(
                calls[2].body,
                batchApplyRequest(dto, preview, enabled.ack),
            );
        });
        check('no hidden split/retry/query-defined writes', () => {
            assert.equal(calls.length, 3);
            assert(
                calls.every(
                    (call) =>
                        Array.isArray(call.body.items) &&
                        !('query' in call.body),
                ),
            );
        });
    } finally {
        globalThis.fetch = originalFetch;
        setLibraryMaintenanceFence('NONE');
    }
    console.log(`RUN018 client complete: ${count} PASS, 0 FAIL, 0 SKIP`);
};
