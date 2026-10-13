import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ProvenancePanel } from '../src/library/provenance-panel';
import {
    currentConfirmationBlocks,
    emptyProvenanceFilters,
    filterProvenance,
    orderProvenance,
    provenanceOptions,
    provenanceSourceLabel,
    provenanceTargetContext,
    provenanceText,
    provenanceTimeLabel,
    provenanceBlockLabel,
    type ProvenanceRecord,
} from '../src/library/provenance-state';
import type { LibraryCardDetail } from '../src/library/model';
export const runProvenanceChecks = async () => {
    let count = 0;
    const check = (name: string, fn: () => void) => {
        fn();
        console.log(`RUN019 client ${++count} ${name} PASS`);
    };
    const row = (
        id: number,
        patch: Partial<ProvenanceRecord> = {},
    ): ProvenanceRecord => ({
        provenance_id: id,
        target_kind: 'BLOCK',
        target_key: 'CLASSIFICATION',
        source_kind: 'MANUAL',
        source_ref: null,
        note: null,
        created_at: '2026-10-12T12:00:00Z',
        ...patch,
    });
    const rows = [
        row(1),
        row(3, {
            created_at: '2026-10-13T12:00:00Z',
            source_kind: 'LIBRARY_BATCH',
            source_ref: 'library-batch:uuid',
            note: 'Batch Note',
        }),
        row(2, {
            source_kind: 'CARDER_WRITE_BACK',
            target_key: 'TEXT:EN',
            source_ref: 'carder-ref',
        }),
        row(4, {
            created_at: 'invalid',
            target_kind: 'MYSTERY',
            target_key: 'future',
            source_kind: 'UNKNOWN',
        }),
    ];
    const detail: LibraryCardDetail = {
        card_id: 'card',
        revision: '7',
        family: 'SPELL',
        password: '123',
        structure: null,
        localizations: [],
        classification: {
            effect_reviewed: true,
            archetypes: [],
            effect_classifiers: [],
            functional_tags: [],
        },
        relations: [
            {
                relation_id: 'relation',
                source_card_id: 'card',
                target_card_id: 'target',
                relation_type_code: 'RELATED',
                note: null,
            },
        ],
        confirmations: [
            { block: 'CLASSIFICATION', state: 'CONFIRMED', provenance_id: 1 },
            { block: 'TEXT:EN', state: 'DRAFT', provenance_id: 2 },
            { block: 'RELATIONS', state: 'CONFIRMED', provenance_id: null },
        ],
        provenance: rows,
    };
    const frozen = JSON.stringify(detail);
    check(
        'newest first with timestamp ties and deterministic ID fallback',
        () =>
            assert.deepEqual(
                orderProvenance(rows).map((r) => r.provenance_id),
                [3, 2, 1, 4],
            ),
    );
    check('invalid timestamps ordered by ID', () =>
        assert.deepEqual(
            orderProvenance([
                row(8, { created_at: '' }),
                row(9, { created_at: 'bad' }),
            ]).map((r) => r.provenance_id),
            [9, 8],
        ),
    );
    check(
        'mixed invalid dates keep total deterministic order regardless input order',
        () =>
            assert.deepEqual(
                orderProvenance([...rows].reverse()),
                orderProvenance(rows),
            ),
    );
    check('sort/filter never mutate authoritative array or snapshot', () => {
        orderProvenance(rows);
        filterProvenance(rows, emptyProvenanceFilters());
        assert.equal(JSON.stringify(detail), frozen);
    });
    for (const [code, label] of [
        ['MANUAL', 'Manual'],
        ['CARDER_WRITE_BACK', 'Carder write-back'],
        ['LIBRARY_BATCH', 'Library batch'],
        ['UNKNOWN', 'UNKNOWN'],
        ['__proto__', '__proto__'],
        ['constructor', 'constructor'],
    ])
        check(`source label ${code}`, () =>
            assert.equal(provenanceSourceLabel(code), label),
        );
    check('null source reference/note is explicit dash', () =>
        assert.equal(provenanceText(null), '—'),
    );
    check('empty/persisted metadata strings remain exact', () => {
        assert.equal(provenanceText(''), '');
        assert.equal(provenanceText('  Note  '), '  Note  ');
    });
    check('valid human timestamp and exact source preserved', () => {
        assert.notEqual(
            provenanceTimeLabel(rows[0].created_at),
            'Timestamp unavailable',
        );
        assert.equal(rows[0].created_at, '2026-10-12T12:00:00Z');
    });
    check('invalid timestamp display fails safely without rewriting', () =>
        assert.equal(provenanceTimeLabel('bad'), 'Timestamp unavailable'),
    );
    check('known block labels retain semantics', () => {
        assert.equal(provenanceBlockLabel('CLASSIFICATION'), 'Classification');
        assert.match(provenanceBlockLabel('TEXT:ES'), /TEXT:ES/);
        assert.equal(provenanceBlockLabel('future'), 'future');
    });
    check('BLOCK current persisted state shown', () => {
        const c = provenanceTargetContext(detail, rows[0]);
        assert.equal(c.kind, 'block');
        assert(c.kind === 'block' && c.state === 'CONFIRMED');
    });
    check('absent confirmation never invents DRAFT', () => {
        const c = provenanceTargetContext(
            detail,
            row(10, { target_key: 'STRUCTURE' }),
        );
        assert(c.kind === 'block' && c.state === null);
    });
    check('unknown block key visible without inferred state', () => {
        const c = provenanceTargetContext(
            detail,
            row(10, { target_key: 'future' }),
        );
        assert(
            c.kind === 'block' &&
                !c.known &&
                c.key === 'future' &&
                c.state === null,
        );
    });
    check('exact CONFIRMED ID link marks associated block', () =>
        assert.deepEqual(currentConfirmationBlocks(detail, rows[0]), [
            'CLASSIFICATION',
        ]),
    );
    check('newest event does not become current confirmation provenance', () =>
        assert.deepEqual(currentConfirmationBlocks(detail, rows[1]), []),
    );
    check('DRAFT with nonnull provenance ID gets no current marker', () =>
        assert.deepEqual(currentConfirmationBlocks(detail, rows[2]), []),
    );
    check('CONFIRMED null link gets no fabricated marker', () =>
        assert.deepEqual(currentConfirmationBlocks(detail, row(99)), []),
    );
    check(
        'confirmation mapping uses exact persisted ID, not target or timestamp inference',
        () =>
            assert.deepEqual(
                currentConfirmationBlocks(
                    detail,
                    row(1, {
                        target_kind: 'CARD',
                        target_key: 'IDENTITY',
                        created_at: 'bad',
                    }),
                ),
                ['CLASSIFICATION'],
            ),
    );
    check('RELATION exact ID resolves type, target ID, note', () => {
        const c = provenanceTargetContext(
            detail,
            row(10, { target_kind: 'RELATION', target_key: 'relation' }),
        );
        assert(
            c.kind === 'relation' &&
                c.relation?.relation_type_code === 'RELATED' &&
                c.relation?.target_card_id === 'target' &&
                c.relation.note === null,
        );
    });
    check('historical removed relation retains raw ID', () => {
        const c = provenanceTargetContext(
            detail,
            row(10, { target_kind: 'RELATION', target_key: 'removed' }),
        );
        assert(
            c.kind === 'relation' &&
                c.relation === null &&
                c.label === 'Historical relation' &&
                c.key === 'removed',
        );
    });
    check('CARD IDENTITY label and raw fields preserved', () =>
        assert.equal(
            provenanceTargetContext(
                detail,
                row(10, { target_kind: 'CARD', target_key: 'IDENTITY' }),
            ).label,
            'Card identity',
        ),
    );
    check('unknown CARD target generic', () =>
        assert.equal(
            provenanceTargetContext(
                detail,
                row(10, { target_kind: 'CARD', target_key: 'OTHER' }),
            ).key,
            'OTHER',
        ),
    );
    check('unknown target kind generic', () =>
        assert.equal(provenanceTargetContext(detail, rows[3]).label, 'MYSTERY'),
    );
    check('filter options derive from all authoritative records', () =>
        assert.deepEqual(provenanceOptions(rows), {
            targetKinds: ['BLOCK', 'MYSTERY'],
            targetKeys: ['CLASSIFICATION', 'TEXT:EN', 'future'],
            sourceKinds: [
                'CARDER_WRITE_BACK',
                'LIBRARY_BATCH',
                'MANUAL',
                'UNKNOWN',
            ],
        }),
    );
    for (const [key, value, ids] of [
        ['targetKind', 'MYSTERY', [4]],
        ['targetKey', 'TEXT:EN', [2]],
        ['sourceKind', 'LIBRARY_BATCH', [3]],
    ] as const)
        check(`${key} local filter`, () =>
            assert.deepEqual(
                filterProvenance(rows, {
                    ...emptyProvenanceFilters(),
                    [key]: value,
                }).map((r) => r.provenance_id),
                ids,
            ),
        );
    check('all filters combine with AND', () =>
        assert.deepEqual(
            filterProvenance(rows, {
                targetKind: 'BLOCK',
                targetKey: 'CLASSIFICATION',
                sourceKind: 'LIBRARY_BATCH',
                search: 'NOTE',
            }).map((r) => r.provenance_id),
            [3],
        ),
    );
    for (const [query, ids] of [
        [' manual ', [1]],
        ['LIBRARY-BATCH:UUID', [3]],
        ['bAtCh nOtE', [3]],
        ['text:en', [2]],
        ['MYSTERY', [4]],
        ['3', [3]],
    ] as const)
        check(`trimmed/case-insensitive search ${query}`, () =>
            assert.deepEqual(
                filterProvenance(rows, {
                    ...emptyProvenanceFilters(),
                    search: query,
                }).map((r) => r.provenance_id),
                ids,
            ),
        );
    check('Clear restores full ordered history', () =>
        assert.deepEqual(
            filterProvenance(rows, emptyProvenanceFilters()),
            orderProvenance(rows),
        ),
    );
    check('no provenance yields explicit empty state', () =>
        assert.match(
            renderToStaticMarkup(
                createElement(ProvenancePanel, {
                    detail: { ...detail, provenance: [] },
                    dirty: false,
                }),
            ),
            /No provenance recorded for this card\./,
        ),
    );
    const html = renderToStaticMarkup(
        createElement(ProvenancePanel, { detail, dirty: true }),
    );
    check('every row renders once with all visible raw fields', () => {
        for (const r of rows)
            assert.equal(
                (
                    html.match(
                        new RegExp(
                            `data-provenance-id="${r.provenance_id}"`,
                            'g',
                        ),
                    ) ?? []
                ).length,
                1,
            );
        for (const label of [
            'Source reference',
            'Note',
            'Target kind',
            'Target key',
            'Recorded time',
        ])
            assert(html.includes(label));
    });
    check('dirty warning renders persisted/unsaved distinction', () => {
        assert(html.includes('Showing persisted Workspace provenance.'));
        assert(
            html.includes('Unsaved Canonical edits are not represented here.'),
        );
    });
    check(
        'panel offers no write/confirm controls or raw JSON competing UI',
        () => {
            assert(!/<pre/.test(html));
            assert(
                !/Confirm block|Move to Draft and Save|Save to Workspace/.test(
                    html,
                ),
            );
        },
    );
    check(
        'untrusted source ref is escaped text, never hyperlink/script',
        () => {
            const text = renderToStaticMarkup(
                createElement(ProvenancePanel, {
                    detail: {
                        ...detail,
                        confirmations: [],
                        provenance: [
                            row(1, {
                                source_ref:
                                    'https://example.invalid/<script>bad</script>',
                            }),
                        ],
                    },
                    dirty: false,
                }),
            );
            assert(!/<a\b|<script\b/.test(text));
            assert(text.includes('&lt;script&gt;'));
            assert(text.includes('https://example.invalid/'));
        },
    );
    check(
        'authoritative snapshot refresh updates marker and rows without separate lifecycle',
        () => {
            const next = {
                ...detail,
                provenance: [...rows, row(20, { source_kind: 'MANUAL' })],
                confirmations: [
                    {
                        block: 'CLASSIFICATION' as const,
                        state: 'CONFIRMED' as const,
                        provenance_id: 20,
                    },
                ],
            };
            assert.deepEqual(
                currentConfirmationBlocks(next, next.provenance[4]),
                ['CLASSIFICATION'],
            );
            assert.deepEqual(currentConfirmationBlocks(next, rows[0]), []);
            assert.equal(
                filterProvenance(next.provenance, emptyProvenanceFilters())
                    .length,
                5,
            );
        },
    );
    check(
        'helpers and SSR perform zero network calls and preserve snapshot',
        () => {
            const original = globalThis.fetch;
            globalThis.fetch = (() => {
                throw new Error('Forbidden network in provenance');
            }) as typeof fetch;
            try {
                filterProvenance(rows, {
                    ...emptyProvenanceFilters(),
                    search: 'note',
                });
                renderToStaticMarkup(
                    createElement(ProvenancePanel, { detail, dirty: false }),
                );
                assert.equal(JSON.stringify(detail), frozen);
            } finally {
                globalThis.fetch = original;
            }
        },
    );
    console.log(`RUN019 client complete: ${count} PASS, 0 FAIL, 0 SKIP`);
};
