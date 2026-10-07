import assert from 'node:assert/strict';
import { buildLibraryCardsUrl, LibraryHttpError } from '../src/library/api';
import {
    buildPatchPayload,
    detailToWorkingForm,
    detectDirtySections,
    impactedConfirmedBlocks,
    isWorkingFormDirty,
} from '../src/library/editor-state';
import {
    getLibraryResultState,
    getWorkspaceShellState,
    hasBrowseCriteria,
    type LibraryBrowseFilters,
    type LibraryCardDetail,
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

assert.equal(getWorkspaceShellState(null, null), 'connecting');
assert.equal(getWorkspaceShellState(null, 'offline'), 'unavailable');
assert.equal(getWorkspaceShellState({
    workspace_id: 'workspace',
    name: 'Workspace',
    workspace_format_version: 1,
    database_schema_version: 4,
    state: 'NEEDS_MIGRATION',
    read_only: true,
    health_summary: 'needs migration',
}, null), 'not-ready');
assert.equal(getWorkspaceShellState({
    workspace_id: 'workspace',
    name: 'Workspace',
    workspace_format_version: 1,
    database_schema_version: 4,
    state: 'READY',
    read_only: false,
    health_summary: 'ready',
}, null), 'ready');

const sampleDetail: LibraryCardDetail = {
    card_id: 'card-1',
    revision: '3',
    family: 'SPELL',
    password: '11111111',
    structure: { kind: 'SPELL', subtype_code: 'NORMAL' },
    localizations: [{ language: 'EN', name: 'Sample', card_text: 'Text', pendulum_text: null }],
    confirmations: [
        { block: 'STRUCTURE', state: 'CONFIRMED', provenance_id: 1 },
        { block: 'TEXT:EN', state: 'DRAFT', provenance_id: null },
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

const working = detailToWorkingForm(sampleDetail);
assert.equal(isWorkingFormDirty(sampleDetail, working), false);
working.structure = { kind: 'SPELL', subtype_code: 'CONTINUOUS' };
assert.equal(isWorkingFormDirty(sampleDetail, working), true);
assert.deepEqual(detectDirtySections(sampleDetail, working).structure, true);
assert.deepEqual(impactedConfirmedBlocks(sampleDetail, working), ['STRUCTURE']);

const cancelRestore = detailToWorkingForm(sampleDetail);
assert.equal(isWorkingFormDirty(sampleDetail, cancelRestore), false);

const payload = buildPatchPayload(sampleDetail, working, [
    { block: 'STRUCTURE', state: 'DRAFT' },
]);
assert.equal(payload.expected_revision, '3');
assert.deepEqual(payload.structure, { kind: 'SPELL', subtype_code: 'CONTINUOUS' });
assert.ok(Array.isArray(payload.confirmations));

const conflictPreserved = { ...working };
assert.equal(isWorkingFormDirty(sampleDetail, conflictPreserved), true);

const facetsError = 'facets failed';
const browseError = null as string | null;
assert.notEqual(facetsError, browseError);
assert.equal(getLibraryResultState({
    loading: false,
    error: browseError,
    total: 1,
    hasCriteria: false,
}), 'results');

const typed = new LibraryHttpError({
    status: 409,
    code: 'REVISION_CONFLICT',
    message: 'stale',
});
assert.equal(typed.status, 409);
assert.equal(typed.code, 'REVISION_CONFLICT');

console.log('Library client contract checks PASS');
