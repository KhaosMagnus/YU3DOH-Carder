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
    formatIngestError,
    formatNeedsAttentionError,
    formatRescanError,
    formatVariantLoadError,
    isolateAssetDetailChannels,
} from '../src/library/asset-channels';
import {
    createIngestKeyCycle,
    filterDiagnosticsByCode,
    ownershipLabel,
    presentNeedsAttention,
    readinessLabel,
    slotStateLabel,
    uniqueDiagnosticCodes,
    variantReadinessTags,
} from '../src/library/asset-state';
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
    type LibraryNeedsAttentionResponse,
    type LibraryVariantDetail,
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

// --- RUN 008: Variant / Asset client contracts ---
const sampleVariant: LibraryVariantDetail = {
    variant_id: 'v1',
    card_id: 'card-1',
    variant_key: 'default',
    display_label: 'Default',
    standard: { state: 'READY', sources: ['BS'] },
    overframe: { state: 'INCOMPLETE', sources: [] },
    roles: {
        BS: {
            slot_state: 'BOUND',
            asset: {
                asset_id: 'a1',
                relative_path: 'Assets/Managed/x.png',
                file_name: 'x.png',
                extension: 'png',
                image_width: 10,
                image_height: 20,
                has_transparency: false,
                present: true,
                valid_asset: true,
                ownership: 'managed',
                managed_asset_id: 'm1',
            },
            issues: [],
        },
        BG: { slot_state: 'EMPTY', asset: null, issues: [] },
        OF: {
            slot_state: 'CONFLICT',
            asset: null,
            issues: [{ code: 'ROLE_CONFLICT', message: 'conflict' }],
        },
    },
};

const tags = variantReadinessTags(sampleVariant);
assert.equal(tags.standard, 'READY');
assert.deepEqual(tags.standardSources, ['BS']);
assert.equal(readinessLabel(tags.standard), 'READY');
assert.equal(slotStateLabel('EMPTY'), 'Empty');
assert.equal(slotStateLabel('CONFLICT'), 'Conflict');
assert.equal(slotStateLabel('MISSING'), 'Missing source');
assert.equal(slotStateLabel('INVALID'), 'Invalid');
assert.notEqual(slotStateLabel('EMPTY'), slotStateLabel('CONFLICT'));
assert.notEqual(slotStateLabel('EMPTY'), slotStateLabel('MISSING'));
assert.notEqual(slotStateLabel('EMPTY'), slotStateLabel('INVALID'));
assert.notEqual(slotStateLabel('MISSING'), slotStateLabel('INVALID'));
assert.equal(ownershipLabel('managed'), 'Managed');
assert.equal(ownershipLabel('unmanaged'), 'Indexed / unmanaged');

const notScanned = presentNeedsAttention({ latest_scan: null, items: [] });
assert.equal(notScanned?.kind, 'not-scanned');
const clean = presentNeedsAttention({
    latest_scan: {
        scan_id: 's1',
        started_at: 't0',
        completed_at: 't1',
        discovered_count: 0,
        present_count: 0,
        diagnostic_count: 0,
    },
    items: [],
});
assert.equal(clean?.kind, 'clean');
assert.notEqual(notScanned?.kind, clean?.kind);

const issuesResponse: LibraryNeedsAttentionResponse = {
    latest_scan: {
        scan_id: 's2',
        started_at: 't0',
        completed_at: 't1',
        discovered_count: 2,
        present_count: 1,
        diagnostic_count: 2,
    },
    items: [
        {
            diagnostic_id: 'd1',
            code: 'ROLE_CONFLICT',
            relative_path: 'Assets/a.png',
            message: 'conflict',
            asset_id: null,
            card_id: 'c1',
            variant_id: null,
            variant_key: 'default',
            role: 'BS',
        },
        {
            diagnostic_id: 'd2',
            code: 'INVALID_FILENAME',
            relative_path: 'Assets/b.png',
            message: 'bad name',
            asset_id: null,
            card_id: null,
            variant_id: null,
            variant_key: null,
            role: null,
        },
    ],
};
const issues = presentNeedsAttention(issuesResponse);
assert.equal(issues?.kind, 'issues');
assert.deepEqual(uniqueDiagnosticCodes(issuesResponse.items), ['INVALID_FILENAME', 'ROLE_CONFLICT']);
assert.equal(filterDiagnosticsByCode(issuesResponse.items, 'ROLE_CONFLICT').length, 1);

const cycle = createIngestKeyCycle();
const firstKey = cycle.current();
assert.equal(cycle.current(), firstKey);
const secondKey = cycle.refresh();
assert.notEqual(firstKey, secondKey);

assert.equal(
    formatVariantLoadError(new LibraryHttpError({ status: 404, code: 'NOT_FOUND', message: 'missing' })),
    'Canonical card not found for variants.',
);
assert.notEqual(
    formatNeedsAttentionError(new LibraryHttpError({ status: 500, code: 'HTTP_500', message: 'diag boom' })),
    'Canonical card not found.',
);
assert.equal(
    formatRescanError(new LibraryHttpError({ status: 503, code: 'WORKSPACE_NOT_READY', message: 'nr' })),
    'Workspace is not READY.',
);
assert.equal(
    formatIngestError(new LibraryHttpError({ status: 409, code: 'TARGET_CONFLICT', message: 'occupied' })),
    'TARGET_CONFLICT: occupied',
);

const isolation = isolateAssetDetailChannels({
    authoritative: sampleDetail,
    detailError: null,
    variantError: 'variants failed',
    needsAttentionError: null,
    rescanError: null,
    ingestError: null,
});
assert.equal(isolation.detailPreserved, true);
assert.equal(isolation.assetFailureMislabelledAsCardNotFound, false);

console.log('Library client RUN 008 asset checks PASS');

// RUN 012: execute deterministic client/resolver orchestration contracts.
import { runAssetResolutionChecks } from './test-library-asset-resolution';
import { runVariantLifecycleChecks } from './test-library-variant-lifecycle';
void runAssetResolutionChecks().then(runVariantLifecycleChecks).catch(error => { console.error(error); process.exitCode = 1; });
