import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { INITIAL_LIBRARY_VIEW, LibraryResultCard, type LibraryViewMode } from '../src/library/library-result-card';
import { buildLibraryCardsUrl } from '../src/library/api';
import { getLibraryResultState, type LibraryBrowseFilters, type LibraryCardSummary } from '../src/library/model';
import { batchRequest, hiddenBatchCount, selectBatchCards, stopBatchCheckboxEvent } from '../src/library/batch-classification-state';

const check = (id: string, run: () => void) => { run(); console.log(`${id} PASS`); };
const card: LibraryCardSummary = Object.freeze<LibraryCardSummary>({ card_id: 'f04-token', revision: '12', family: 'TOKEN', password: null,
    display_name: 'F04 <Token>', display_language: 'EN', available_languages: ['EN'], archetypes: ['Archetype one'],
    effect_classifiers: ['Effect one'], functional_tags: ['Tag one'], variant_count: 3,
    has_standard_ready_variant: true, has_overframe_ready_variant: false });
const filters: LibraryBrowseFilters = Object.freeze({ query: ' Search ', preferredLanguage: 'ES', family: 'TOKEN',
    archetype: 'Archetype one', effectClassifier: 'Effect one', functionalTag: 'Tag one', limit: 50, offset: 50 });
const selection = selectBatchCards(new Map(), [card, { ...card, card_id: 'hidden', revision: '7' }]);
const frozen = JSON.stringify(batchRequest(selection, {}, ''));
const beforeFilters = JSON.stringify(filters), beforeCard = JSON.stringify(card), url = buildLibraryCardsUrl(filters);
const render = (mode: LibraryViewMode, current = card) => renderToStaticMarkup(createElement(LibraryResultCard, {
    card: current, mode, selected: true, checked: true, batchDisabled: false,
    onOpen: () => { throw Error('render must not open Detail'); },
    onSelect: () => { throw Error('render must not change Batch'); },
}));
check('F04-U01', () => assert.equal(INITIAL_LIBRARY_VIEW, 'LIST'));
const list = render('LIST'), grid = render('GRID');
check('F04-U02', () => { assert.equal(render('LIST'), list); assert.notEqual(grid, list); assert.equal(JSON.stringify(card), beforeCard); });
check('F04-U03', () => { render('GRID'); assert.equal(buildLibraryCardsUrl(filters), url); });
check('F04-U04', () => assert.equal(JSON.stringify(filters), beforeFilters));
check('F04-U05', () => { assert.equal(filters.offset, 50); assert.equal(filters.limit, 50); });
check('F04-U06', () => { for (const html of [list, grid]) assert.match(html, /Detail selected/); });
check('F04-U07', () => assert.equal(JSON.stringify(batchRequest(selection, {}, '')), frozen));
check('F04-U08', () => assert.equal(hiddenBatchCount(selection, [card]), 1));
check('F04-U09', () => { const refreshed = selectBatchCards(selection, [{ ...card, revision: '99' }]); assert.equal(refreshed.get(card.card_id)!.expected_revision, '12'); });
check('F04-U10', () => { for (const value of ['F04 &lt;Token&gt;', 'TOKEN', 'Token · no password', 'Display: EN', 'Archetype one', 'Effect one', 'Tag one', 'Variants: 3', 'Standard READY', 'Overframe incomplete', 'type="checkbox"']) assert.ok(list.includes(value), value); });
check('F04-U11', () => { for (const value of ['F04 &lt;Token&gt;', 'TOKEN', 'Token · no password', 'Display: EN', 'Variants: 3', 'Standard READY', 'Overframe incomplete', 'type="checkbox"']) assert.ok(grid.includes(value), value); assert.ok(render('GRID', { ...card, family: 'SPELL', password: '12345678' }).includes('Password: 12345678')); });
check('F04-U12', () => { for (const standard of [false, true]) for (const overframe of [false, true]) for (const mode of ['GRID', 'LIST'] as const) { const html = render(mode, { ...card, has_standard_ready_variant: standard, has_overframe_ready_variant: overframe }); assert.ok(html.includes(`Standard ${standard ? 'READY' : 'incomplete'}`)); assert.ok(html.includes(`Overframe ${overframe ? 'READY' : 'incomplete'}`)); } });
check('F04-U13', () => { for (const mode of ['GRID', 'LIST'] as const) { render(mode); assert.equal(getLibraryResultState({ loading: true, error: null, total: 5, hasCriteria: false }), 'loading'); assert.equal(getLibraryResultState({ loading: false, error: 'error', total: 5, hasCriteria: false }), 'error'); for (const hasCriteria of [false, true]) assert.equal(getLibraryResultState({ loading: false, error: null, total: 0, hasCriteria }), hasCriteria ? 'no-match' : 'empty-library'); } });
check('F04-U14', () => { let stopped = false; stopBatchCheckboxEvent({ stopPropagation: () => { stopped = true; } }); assert.ok(stopped); assert.ok(!list.includes('role="button"')); assert.match(list, /<button[^>]+type="button"/); });
check('F04-U15', () => {
    assert.ok(!/view|mode/i.test(url));
    const changed = execFileSync('git', ['diff', 'e07140d5a9555a17b7b2306a45625c14adfafc8e', '--name-only'], { encoding: 'utf8' });
    assert.ok(!changed.split('\n').some(file => /^(workspace-server\/|src\/library\/(api|model|batch-classification-state)\.)/.test(file)));
});
check('F04-U16', () => {
    assert.match(readFileSync('workspace-server/src/persistence/constants.ts', 'utf8'), /SUPPORTED_DATABASE_SCHEMA_VERSION = 8;/);
    assert.match(readFileSync('workspace-server/src/workspace/types.ts', 'utf8'), /SUPPORTED_WORKSPACE_FORMAT_VERSION = 1;/);
    assert.deepEqual(readdirSync('workspace-server/migrations').filter(f => f.endsWith('.sql')).sort().map(f => f.slice(0, 3)), ['001', '002', '003', '004', '005', '006', '007', '008']);
});
// U17/U18 are bound to the actual complete prior suites, run earlier in test:library.
console.log('F04-U17 / F04-U18: see preceding RUN018 and complete Library client/bridge gate results');
