import type {
    AssetOperationResponse,
    AssetResolutionRequest,
    AssetResolutionState,
    ManagedAssetMutationRequest,
    ManagedAssetPreview,
    ManagedAssetPreviewRequest,
    LibraryApiError,
    LibraryBrowseFilters,
    LibraryBrowseResult,
    LibraryCardDetail,
    LibraryEditorMetadata,
    LibraryFacets,
    LibraryFamily,
    LibraryManagedIngestResponse,
    LibraryNeedsAttentionResponse,
    LibraryScanSummary,
    LibraryVariantsResponse,
    ManagedIngestBody,
    PrepareWorkingCardBody,
    PrepareWorkingCardDto,
    WorkspaceStatus,
} from './model';
import type { BatchRequest, BatchApplyRequest, BatchPreview, BatchResult } from './batch-classification-state';
import type {ExternalHistory,ExternalDetail,ExternalDiff} from './external-source-model';

export class LibraryHttpError extends Error {
    readonly status: number;
    readonly code: string;

    constructor({ status, code, message }: LibraryApiError) {
        super(message);
        this.name = 'LibraryHttpError';
        this.status = status;
        this.code = code;
    }
}

const parseError = async (response: Response): Promise<LibraryHttpError> => {
    const payload = await response.json().catch(() => null) as unknown;
    const code = (
        payload
        && typeof payload === 'object'
        && 'code' in payload
        && typeof payload.code === 'string'
    ) ? payload.code : `HTTP_${response.status}`;
    const message = (
        payload
        && typeof payload === 'object'
        && 'message' in payload
        && typeof payload.message === 'string'
    ) ? payload.message : `Request failed with HTTP ${response.status}.`;
    return new LibraryHttpError({ status: response.status, code, message });
};

const fetchJson = async <T>(
    url: string,
    init?: RequestInit,
    signal?: AbortSignal,
): Promise<T> => {
    if (maintenanceFence !== 'NONE' && !url.startsWith('/api/v1/workspace/')) {
        const read = !init?.method || init.method === 'GET' || (init.method === 'POST' && (url === '/api/v1/library/batch/classification/preview' || /^\/api\/v1\/library\/external-sources\/candidates\/[^/]+\/diff$/.test(url)));
        if (!read || maintenanceFence !== 'BACKUP') {
            throw new LibraryHttpError({status:409,code:'WORKSPACE_MAINTENANCE_ACTIVE',message:'Wait for the active Workspace maintenance operation to finish.'});
        }
    }
    const response = await fetch(url, {
        ...init,
        headers: {
            Accept: 'application/json',
            ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
            ...(init?.headers ?? {}),
        },
        signal,
    });
    if (!response.ok) {
        throw await parseError(response);
    }
    return await response.json() as T;
};

export const buildLibraryCardsUrl = (filters: LibraryBrowseFilters) => {
    const parameters = new URLSearchParams();
    const query = filters.query.trim();
    if (query) parameters.set('query', query);
    parameters.set('preferred_language', filters.preferredLanguage);
    if (filters.family) parameters.set('family', filters.family);
    if (filters.archetype) parameters.set('archetype', filters.archetype);
    if (filters.effectClassifier) parameters.set('effect_classifier', filters.effectClassifier);
    if (filters.functionalTag) parameters.set('functional_tag', filters.functionalTag);
    parameters.set('limit', String(filters.limit));
    parameters.set('offset', String(filters.offset));
    return `/api/v1/library/cards?${parameters.toString()}`;
};

export const getWorkspaceStatus = (signal?: AbortSignal) =>
    fetchJson<WorkspaceStatus>('/api/v1/workspace/status', undefined, signal);

export const getLibraryFacets = (signal?: AbortSignal) =>
    fetchJson<LibraryFacets>('/api/v1/library/facets', undefined, signal);

export const browseLibraryCards = (filters: LibraryBrowseFilters, signal?: AbortSignal) =>
    fetchJson<LibraryBrowseResult>(buildLibraryCardsUrl(filters), undefined, signal);

export const getLibraryCard = (cardId: string, signal?: AbortSignal) =>
    fetchJson<LibraryCardDetail>(`/api/v1/library/cards/${encodeURIComponent(cardId)}`, undefined, signal);

export const getLibraryEditorMetadata = (signal?: AbortSignal) =>
    fetchJson<LibraryEditorMetadata>('/api/v1/library/editor-metadata', undefined, signal);

export const getExternalSourceHistory=(cardId:string)=>fetchJson<ExternalHistory>(`/api/v1/library/cards/${encodeURIComponent(cardId)}/external-sources`);
export const getExternalSourceRetrieval=(retrievalId:string,raw=false)=>fetchJson<ExternalDetail>(`/api/v1/library/external-sources/retrievals/${encodeURIComponent(retrievalId)}${raw?'?include_raw=true':''}`);
export const retrieveExternalSource=(body:{target_card_id:string;target_expected_revision:string;external_card_id:string})=>fetchJson<ExternalDetail>('/api/v1/library/external-sources/ygoresources/retrieve',{method:'POST',body:JSON.stringify(body)});
export const compareExternalSource=(candidateId:string,body:{target_card_id:string;target_expected_revision:string})=>fetchJson<ExternalDiff>(`/api/v1/library/external-sources/candidates/${encodeURIComponent(candidateId)}/diff`,{method:'POST',body:JSON.stringify(body)});

export const previewBatchClassification = (body: BatchRequest, signal?: AbortSignal) =>
    fetchJson<BatchPreview>('/api/v1/library/batch/classification/preview', { method: 'POST', body: JSON.stringify(body) }, signal);
export const applyBatchClassification = (body: BatchApplyRequest, signal?: AbortSignal) =>
    fetchJson<BatchResult>('/api/v1/library/batch/classification/apply', { method: 'POST', body: JSON.stringify(body) }, signal);

export const createLibraryCard = (
    input: { family: LibraryFamily; password?: string | null },
    signal?: AbortSignal,
) => fetchJson<LibraryCardDetail>('/api/v1/library/cards', {
    method: 'POST',
    body: JSON.stringify(input),
}, signal);

export const patchLibraryCard = (
    cardId: string,
    body: Record<string, unknown>,
    signal?: AbortSignal,
) => fetchJson<LibraryCardDetail>(`/api/v1/library/cards/${encodeURIComponent(cardId)}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
}, signal);

export const getLibraryVariants = (cardId: string, signal?: AbortSignal) =>
    fetchJson<LibraryVariantsResponse>(
        `/api/v1/library/cards/${encodeURIComponent(cardId)}/variants`,
        undefined,
        signal,
    );

export const getLibraryNeedsAttention = (signal?: AbortSignal) =>
    fetchJson<LibraryNeedsAttentionResponse>(
        '/api/v1/library/needs-attention',
        undefined,
        signal,
    );

export const rescanLibraryAssets = (signal?: AbortSignal) =>
    fetchJson<LibraryScanSummary>(
        '/api/v1/library/assets/rescan',
        { method: 'POST', body: '{}' },
        signal,
    );

export const ingestManagedLibraryAsset = (
    cardId: string,
    body: ManagedIngestBody,
    signal?: AbortSignal,
) => fetchJson<LibraryManagedIngestResponse>(
    `/api/v1/library/cards/${encodeURIComponent(cardId)}/managed-assets`,
    {
        method: 'POST',
        body: JSON.stringify(body),
    },
    signal,
);

export const prepareWorkingCardRequest = (
    body: PrepareWorkingCardBody,
    signal?: AbortSignal,
) => fetchJson<PrepareWorkingCardDto>(
    '/api/v1/carder/prepare-working-card',
    {
        method: 'POST',
        body: JSON.stringify(body),
    },
    signal,
);

export const getResolutionState = (signal?: AbortSignal) =>
    fetchJson<AssetResolutionState>('/api/v1/library/assets/resolution-state', undefined, signal);
export const refreshResolutionState = (signal?: AbortSignal) =>
    fetchJson<AssetResolutionState>('/api/v1/library/assets/resolution-state/refresh', { method: 'POST', body: '{}' }, signal);
export const resolveAsset = (body: AssetResolutionRequest, signal?: AbortSignal) =>
    fetchJson<AssetOperationResponse>('/api/v1/library/assets/resolve', { method: 'POST', body: JSON.stringify(body) }, signal);
export const previewManagedAsset = (id: string, body: ManagedAssetPreviewRequest, signal?: AbortSignal) =>
    fetchJson<ManagedAssetPreview>(`/api/v1/library/managed-assets/${encodeURIComponent(id)}/preview`,
        { method: 'POST', body: JSON.stringify(body) }, signal);
export const mutateManagedAsset = (body: ManagedAssetMutationRequest, signal?: AbortSignal) =>
    fetchJson<AssetOperationResponse>('/api/v1/library/managed-assets/mutate', { method: 'POST', body: JSON.stringify(body) }, signal);

export const setPreferredVariant = (cardId: string, preferredVariantId: string | null, expectedStateToken: string) =>
    fetchJson<import('./model').VariantLifecycleResponse>(`/api/v1/library/cards/${encodeURIComponent(cardId)}/preferred-variant`, {
        method: 'POST', body: JSON.stringify({ preferred_variant_id: preferredVariantId, expected_state_token: expectedStateToken }),
    });
export const previewVariantRename = (variantId: string, body: import('./model').VariantRenameProposal) =>
    fetchJson<import('./model').VariantLifecyclePreview>(`/api/v1/library/variants/${encodeURIComponent(variantId)}/rename-preview`, { method: 'POST', body: JSON.stringify(body) });
export const renameVariant = (variantId: string, body: import('./model').VariantRenameProposal & { expected_state_token: string }) =>
    fetchJson<import('./model').VariantLifecycleResponse>(`/api/v1/library/variants/${encodeURIComponent(variantId)}/rename`, { method: 'POST', body: JSON.stringify(body) });
export const previewVariantRemove = (variantId: string) =>
    fetchJson<import('./model').VariantLifecyclePreview>(`/api/v1/library/variants/${encodeURIComponent(variantId)}/remove-preview`, { method: 'POST' });
export const removeVariant = (variantId: string, body: { expected_state_token: string; acknowledge_preferred_clear?: boolean }) =>
    fetchJson<import('./model').VariantLifecycleResponse>(`/api/v1/library/variants/${encodeURIComponent(variantId)}/remove`, { method: 'POST', body: JSON.stringify(body) });

export const reviewCanonicalConfirmation = (cardId: string, block: import('./model').SemanticBlock, expectedRevision: string) =>
    fetchJson<import('./model').ConfirmationReview>(`/api/v1/library/cards/${encodeURIComponent(cardId)}/confirmation-review`, {
        method: 'POST', body: JSON.stringify({block, expected_revision: expectedRevision}),
    });

export const getWorkspaceBackups = () => fetchJson<{backups: import('./workspace-management-state').WorkspaceBackup[]}>('/api/v1/workspace/backups');
export const createWorkspaceBackup = (body: {kind: import('./workspace-management-state').BackupKind; include_output?: boolean}) =>
    fetchJson<import('./workspace-management-state').WorkspaceBackup>('/api/v1/workspace/backups', {method:'POST',body:JSON.stringify(body)});
export const restoreWorkspaceBackup = (backupId: string) =>
    fetchJson<import('./workspace-management-state').RestoreResult>(`/api/v1/workspace/backups/${encodeURIComponent(backupId)}/restore`, {method:'POST'});
export const migrateWorkspace = () => fetchJson<import('./workspace-management-state').MigrationResult>('/api/v1/workspace/migrate', {method:'POST'});

// Prevent launching new ordinary requests during destructive maintenance. This is UI fencing, not a server lock.
let maintenanceFence: 'NONE' | 'BACKUP' | 'RESTORE' | 'MIGRATION' | 'INITIALIZATION' = 'NONE';
export const setLibraryMaintenanceFence = (operation: typeof maintenanceFence) => { maintenanceFence=operation; };

export const initializeWorkspace = () => fetchJson<import('./workspace-management-state').InitializationResult>('/api/v1/workspace/initialize',{method:'POST',body:'{}'});

export const applyExternalSourceText=(candidateId:string,body:import('./external-acceptance-state').ExternalTextApplyRequest)=>
    fetchJson<import('./external-acceptance-state').ExternalTextApplyResult>(`/api/v1/library/external-sources/candidates/${encodeURIComponent(candidateId)}/apply-text`,{method:'POST',body:JSON.stringify(body)});
