import assert from 'node:assert/strict';
import { buildLibraryCardsUrl } from '../src/library/api';
import {
    getLibraryResultState,
    hasBrowseCriteria,
    type LibraryBrowseFilters,
} from '../src/library/model';

const filters: LibraryBrowseFilters = {
    query: ' Blue Eyes ',
    preferredLanguage: 'ES',
    family: 'MONSTER',
    archetype: 'Blue-Eyes',
    effectClassifier: 'Summon',
    functionalTag: 'Starter',
    limit: 50,
    offset: 100,
};

const url = buildLibraryCardsUrl(filters);
assert.equal(url.startsWith('/api/v1/library/cards?'), true);
assert.equal(url.includes('query=Blue+Eyes'), true);
assert.equal(url.includes('preferred_language=ES'), true);
assert.equal(url.includes('family=MONSTER'), true);
assert.equal(url.includes('archetype=Blue-Eyes'), true);
assert.equal(url.includes('effect_classifier=Summon'), true);
assert.equal(url.includes('functional_tag=Starter'), true);
assert.equal(url.includes('limit=50'), true);
assert.equal(url.includes('offset=100'), true);
assert.equal(hasBrowseCriteria(filters), true);

assert.equal(getLibraryResultState({ loading: true, error: null, total: 0, hasCriteria: false }), 'loading');
assert.equal(getLibraryResultState({ loading: false, error: 'boom', total: 0, hasCriteria: false }), 'error');
assert.equal(getLibraryResultState({ loading: false, error: null, total: 0, hasCriteria: false }), 'empty-library');
assert.equal(getLibraryResultState({ loading: false, error: null, total: 0, hasCriteria: true }), 'no-match');
assert.equal(getLibraryResultState({ loading: false, error: null, total: 1, hasCriteria: false }), 'results');

console.log('Library client contract checks PASS');
