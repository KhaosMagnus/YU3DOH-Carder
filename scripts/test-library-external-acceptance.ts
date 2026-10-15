import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
    externalTextSelectable,
    externalApplyReview,
    selectionKey,
    type ExternalTextSelection,
} from '../src/library/external-acceptance-state';
import {
    applyExternalSourceText,
    setLibraryMaintenanceFence,
    LibraryHttpError,
} from '../src/library/api';
import {
    provenanceSourceLabel,
    currentConfirmationBlocks,
    filterProvenance,
    emptyProvenanceFilters,
} from '../src/library/provenance-state';
import type { LibraryCardDetail } from '../src/library/model';
import type {
    ExternalDetail,
    SourceClaim,
} from '../src/library/external-source-model';
export async function runExternalAcceptanceChecks() {
    let count = 0;
    const check = async (name: string, fn: () => void | Promise<void>) => {
        await fn();
        console.log(`RUN021 CLIENT ${++count} ${name} PASS`);
    };
    const detail: LibraryCardDetail = {
        card_id: 'card',
        revision: '12',
        family: 'SPELL',
        password: null,
        structure: null,
        localizations: [
            {
                language: 'EN',
                name: 'Old',
                card_text: 'Same',
                pendulum_text: null,
            },
            {
                language: 'ES',
                name: 'Español',
                card_text: 'Texto',
                pendulum_text: null,
            },
        ],
        confirmations: [
            { block: 'TEXT:EN', state: 'CONFIRMED', provenance_id: 1 },
        ],
        classification: {
            effect_reviewed: false,
            archetypes: [],
            effect_classifiers: [],
            functional_tags: [],
        },
        relations: [],
        provenance: [],
    };
    const evidence = {
        document_id: 'document',
        locale: 'EN' as const,
        source_path: '$.cardData.en.name',
    };
    const present = (value: unknown): SourceClaim => ({
        state: 'PRESENT',
        value,
        evidence,
    });
    const snapshot = {
        retrieval: { target_card_id: 'card', target_expected_revision: '12' },
        candidate: {
            candidate_id: 'candidate',
            candidate: {
                blocks: {
                    STRUCTURE: { fields: { family: present('MONSTER') } },
                    'TEXT:EN': {
                        fields: {
                            name: present('New'),
                            card_text: present('Same'),
                            pendulum_text: present(''),
                        },
                    },
                    'TEXT:ES': {
                        fields: {
                            name: present('Español'),
                            card_text: present('Nuevo'),
                        },
                    },
                    'TEXT:JP': { fields: { name: present('') } },
                },
            },
        },
    } as unknown as ExternalDetail;
    const s = (
        block: ExternalTextSelection['block'],
        field: ExternalTextSelection['field'],
    ): ExternalTextSelection => ({ block, field });
    for (const block of ['TEXT:EN', 'TEXT:ES', 'TEXT:JP'])
        for (const field of ['name', 'card_text'])
            await check(`${block}/${field} PRESENT selectable`, () =>
                assert.equal(
                    externalTextSelectable(
                        detail,
                        block,
                        field,
                        present('source'),
                    ),
                    true,
                ),
            );
    for (const state of ['ABSENT', 'UNMAPPED', 'INVALID'])
        await check(`${state} not selectable`, () =>
            assert.equal(
                externalTextSelectable(detail, 'TEXT:EN', 'name', {
                    state,
                    evidence,
                } as SourceClaim),
                false,
            ),
        );
    for (const value of [null, 1, {}, []])
        await check(`non-string ${JSON.stringify(value)} not selectable`, () =>
            assert.equal(
                externalTextSelectable(
                    detail,
                    'TEXT:EN',
                    'name',
                    present(value),
                ),
                false,
            ),
        );
    await check('STRUCTURE not selectable', () =>
        assert.equal(
            externalTextSelectable(detail, 'STRUCTURE', 'name', present('x')),
            false,
        ),
    );
    await check('unsupported field not selectable', () =>
        assert.equal(
            externalTextSelectable(detail, 'TEXT:EN', 'password', present('x')),
            false,
        ),
    );
    await check('PRESENT empty string is selectable', () =>
        assert.equal(
            externalTextSelectable(detail, 'TEXT:EN', 'name', present('')),
            true,
        ),
    );
    await check('Pendulum inapplicable on Spell', () =>
        assert.equal(
            externalTextSelectable(
                detail,
                'TEXT:EN',
                'pendulum_text',
                present(''),
            ),
            false,
        ),
    );
    await check('Pendulum applicable only current Monster+PENDULUM', () => {
        const monster = {
            ...detail,
            family: 'MONSTER' as const,
            structure: { kind: 'MONSTER', abilities: ['PENDULUM'] },
        };
        assert.equal(
            externalTextSelectable(
                monster,
                'TEXT:EN',
                'pendulum_text',
                present(''),
            ),
            true,
        );
        assert.equal(
            externalTextSelectable(
                { ...monster, structure: { kind: 'MONSTER', abilities: [] } },
                'TEXT:EN',
                'pendulum_text',
                present(''),
            ),
            false,
        );
    });
    await check(
        'review exact source/current values, no-op and deterministic order',
        () => {
            const r = externalApplyReview(detail, snapshot, [
                s('TEXT:ES', 'card_text'),
                s('TEXT:EN', 'card_text'),
                s('TEXT:EN', 'name'),
            ]);
            assert.deepEqual(r.rows.map(selectionKey), [
                'TEXT:EN/name',
                'TEXT:EN/card_text',
                'TEXT:ES/card_text',
            ]);
            assert.deepEqual(
                r.rows.map((v) => v.changed),
                [true, false, true],
            );
            assert.deepEqual(r.requiredAck, ['TEXT:EN']);
            assert.equal(r.rows[0]!.current, 'Old');
            assert.equal(r.rows[0]!.source, 'New');
        },
    );
    await check('no-op confirmed block never requires ack', () =>
        assert.deepEqual(
            externalApplyReview(detail, snapshot, [s('TEXT:EN', 'card_text')])
                .requiredAck,
            [],
        ),
    );
    await check('null differs from empty string', () => {
        const r = externalApplyReview(detail, snapshot, [s('TEXT:JP', 'name')]);
        assert.equal(r.rows[0]!.current, null);
        assert.equal(r.rows[0]!.source, '');
        assert.equal(r.rows[0]!.changed, true);
    });
    await check('existing empty string equals empty source', () => {
        const r = externalApplyReview(
            {
                ...detail,
                localizations: [
                    ...detail.localizations,
                    {
                        language: 'JP',
                        name: '',
                        card_text: null,
                        pendulum_text: null,
                    },
                ],
            },
            snapshot,
            [s('TEXT:JP', 'name')],
        );
        assert.equal(r.rows[0]!.changed, false);
    });
    await check('EXTERNAL_SOURCE presentation label', () =>
        assert.equal(
            provenanceSourceLabel('EXTERNAL_SOURCE'),
            'External source',
        ),
    );
    await check(
        'mutation provenance never becomes current confirmation provenance for DRAFT',
        () => {
            const row = {
                provenance_id: 2,
                target_kind: 'BLOCK',
                target_key: 'TEXT:EN',
                source_kind: 'EXTERNAL_SOURCE',
                source_ref:
                    'workspace-external-candidate/candidate/TEXT:EN/name',
                note: null,
                created_at: '2026-01-01',
            };
            const d = {
                ...detail,
                confirmations: [
                    {
                        block: 'TEXT:EN' as const,
                        state: 'DRAFT' as const,
                        provenance_id: 2,
                    },
                ],
            };
            assert.deepEqual(currentConfirmationBlocks(d, row), []);
            assert.equal(
                filterProvenance([row], {
                    ...emptyProvenanceFilters(),
                    search: 'TEXT:EN/name',
                }).length,
                1,
            );
        },
    );
    const previous = globalThis.fetch;
    const calls: { url: string; init?: RequestInit }[] = [];
    try {
        globalThis.fetch = (async (url, init) => {
            calls.push({ url: String(url), init });
            return new Response(
                JSON.stringify({
                    card_id: 'card',
                    candidate_id: 'candidate',
                    changed: false,
                    previous_revision: '12',
                    revision: '12',
                    changed_blocks: [],
                    moved_to_draft: [],
                    changed_fields: [],
                    no_op_fields: [s('TEXT:EN', 'name')],
                }),
                { headers: { 'content-type': 'application/json' } },
            );
        }) as typeof fetch;
        const body = {
            target_card_id: 'card',
            target_expected_revision: '12',
            selected_fields: [s('TEXT:EN', 'name')],
            acknowledge_move_to_draft_blocks: [],
        };
        await check(
            'exact candidate route and string revision, values never supplied by client',
            async () => {
                await applyExternalSourceText('candidate/with space', body);
                assert.equal(
                    calls[0]!.url,
                    '/api/v1/library/external-sources/candidates/candidate%2Fwith%20space/apply-text',
                );
                assert.equal(calls[0]!.init!.method, 'POST');
                assert.deepEqual(
                    JSON.parse(calls[0]!.init!.body as string),
                    body,
                );
            },
        );
        for (const mode of [
            'BACKUP',
            'RESTORE',
            'MIGRATION',
            'INITIALIZATION',
        ] as const)
            await check(
                `client ${mode} blocks Apply before fetch`,
                async () => {
                    setLibraryMaintenanceFence(mode);
                    const n = calls.length;
                    await assert.rejects(
                        applyExternalSourceText('candidate', body),
                        (e: unknown) =>
                            e instanceof LibraryHttpError &&
                            e.code === 'WORKSPACE_MAINTENANCE_ACTIVE',
                    );
                    assert.equal(calls.length, n);
                },
            );
    } finally {
        globalThis.fetch = previous;
        setLibraryMaintenanceFence('NONE');
    }
    await check(
        'UI owns exact warning, explicit empty-string state, block-specific acknowledgements and dirty fencing',
        () => {
            const code = readFileSync(
                'src/library/external-sources-panel.tsx',
                'utf8',
            );
            for (const text of [
                'A successful Apply advances the card revision. Select every text field from this candidate that you want to accept in this operation.',
                'Empty string',
                'Move ${block} to DRAFT',
                'Save, cancel, or discard Canonical editor changes',
            ])
                assert(code.includes(text), text);
            assert(!code.includes('I acknowledge all'));
        },
    );
    console.log(`RUN021 CLIENT ${count} checks PASS`);
}
