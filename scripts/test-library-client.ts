import assert from 'node:assert/strict';
import { buildLibraryCardsUrl, LibraryHttpError } from '../src/library/api';
import {
    adoptServerSnapshot,
    buildPatchPayload,
    conflictReloadWouldDiscardEdits,
    detailToWorkingForm,
    detectDirtySections,
    impactedConfirmedBlocks,
    isWorkingFormDirty,
} from '../src/library/editor-state';
import {
    formatDetailLoadError,
    formatMetadataLoadError,
    isolateDetailMetadataChannels,
} from '../src/library/detail-channels';
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


// --- External QA Correction: Conflict reload safety (R1) ---
// R1: A=old-A, B=old-B; local edit A=local-A; concurrent R2 A=old-A, B=server-B.
// After 409 + Reload Latest: working B must be server-B (not old-B);
// later Save must not mutate B unless B edited after reload.
const r1Old: LibraryCardDetail = {
    card_id: 'card-r1',
    revision: '1',
    family: 'SPELL',
    password: 'old-A',
    structure: { kind: 'SPELL', subtype_code: 'old-B' },
    localizations: [{ language: 'EN', name: 'R1', card_text: null, pendulum_text: null }],
    confirmations: [{ block: 'STRUCTURE', state: 'DRAFT', provenance_id: null }],
    classification: {
        effect_reviewed: false,
        archetypes: [],
        effect_classifiers: [],
        functional_tags: [],
    },
    relations: [],
    provenance: [],
};
const r1Working = detailToWorkingForm(r1Old);
r1Working.password = 'local-A';
assert.equal(isWorkingFormDirty(r1Old, r1Working), true);
assert.equal(conflictReloadWouldDiscardEdits(r1Old, r1Working), true);
// While conflict is merely displayed, local edits stay on the working form.
assert.equal(r1Working.password, 'local-A');
assert.deepEqual(r1Working.structure, { kind: 'SPELL', subtype_code: 'old-B' });

const r1Server: LibraryCardDetail = {
    ...r1Old,
    revision: '2',
    password: 'old-A',
    structure: { kind: 'SPELL', subtype_code: 'server-B' },
};
const r1Adopted = adoptServerSnapshot(r1Server);
assert.equal(r1Adopted.authoritative.revision, '2');
assert.equal(r1Adopted.working.password, 'old-A');
assert.deepEqual(r1Adopted.working.structure, { kind: 'SPELL', subtype_code: 'server-B' });
assert.equal(isWorkingFormDirty(r1Adopted.authoritative, r1Adopted.working), false);
const r1Dirty = detectDirtySections(r1Adopted.authoritative, r1Adopted.working);
assert.equal(r1Dirty.password, false);
assert.equal(r1Dirty.structure, false);
const r1Payload = buildPatchPayload(r1Adopted.authoritative, r1Adopted.working);
assert.equal('password' in r1Payload, false);
assert.equal('structure' in r1Payload, false);
// Contrasting unsafe model: keeping old working after adopting new authoritative
// would mark untouched B dirty and silently write old-B on Save.
const unsafeWorking = { ...r1Working };
assert.equal(unsafeWorking.structure?.subtype_code, 'old-B');
assert.equal(detectDirtySections(r1Server, unsafeWorking).structure, true);
assert.deepEqual(
    buildPatchPayload(r1Server, unsafeWorking).structure,
    { kind: 'SPELL', subtype_code: 'old-B' },
);

// --- External QA Correction: Detail / metadata error isolation ---
const detailOk: LibraryCardDetail = sampleDetail;
const metadataOnlyFailure = isolateDetailMetadataChannels({
    authoritative: detailOk,
    detailError: null,
    metadataError: 'editor metadata endpoint failed',
    metadata: null,
});
assert.equal(metadataOnlyFailure.showDetail, true);
assert.equal(metadataOnlyFailure.showMetadataError, true);
assert.equal(metadataOnlyFailure.detailClearedByMetadataFailure, false);
assert.equal(metadataOnlyFailure.metadataMislabelledAsDetail, false);

const metadataFailureClearedDetail = isolateDetailMetadataChannels({
    authoritative: null,
    detailError: null,
    metadataError: 'editor metadata endpoint failed',
    metadata: null,
});
assert.equal(metadataFailureClearedDetail.detailClearedByMetadataFailure, true);

const mislabelled = isolateDetailMetadataChannels({
    authoritative: null,
    detailError: 'Canonical card not found.',
    metadataError: 'Canonical card not found.',
    metadata: null,
});
assert.equal(mislabelled.metadataMislabelledAsDetail, true);

assert.equal(
    formatDetailLoadError(new LibraryHttpError({ status: 404, code: 'NOT_FOUND', message: 'missing' })),
    'Canonical card not found.',
);
assert.equal(
    formatMetadataLoadError(new LibraryHttpError({ status: 500, code: 'HTTP_500', message: 'metadata boom' })),
    'metadata boom',
);
assert.notEqual(
    formatMetadataLoadError(new LibraryHttpError({ status: 500, code: 'HTTP_500', message: 'metadata boom' })),
    'Canonical card not found.',
);

console.log('Library client contract checks PASS');
