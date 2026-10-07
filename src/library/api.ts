import type {
    LibraryBrowseFilters,
    LibraryBrowseResult,
    LibraryFacets,
    WorkspaceStatus,
} from './model';

const fetchJson = async <T>(url: string, signal?: AbortSignal): Promise<T> => {
    const response = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal,
    });
    const payload = await response.json().catch(() => null) as unknown;
    if (!response.ok) {
        const message = (
            payload
            && typeof payload === 'object'
            && 'message' in payload
            && typeof payload.message === 'string'
        ) ? payload.message : `Request failed with HTTP ${response.status}.`;
        throw new Error(message);
    }
    return payload as T;
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
    fetchJson<WorkspaceStatus>('/api/v1/workspace/status', signal);

export const getLibraryFacets = (signal?: AbortSignal) =>
    fetchJson<LibraryFacets>('/api/v1/library/facets', signal);

export const browseLibraryCards = (filters: LibraryBrowseFilters, signal?: AbortSignal) =>
    fetchJson<LibraryBrowseResult>(buildLibraryCardsUrl(filters), signal);
