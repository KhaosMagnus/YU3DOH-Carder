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
