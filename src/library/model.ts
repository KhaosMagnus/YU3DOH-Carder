export const LIBRARY_LANGUAGES = ['EN', 'ES', 'JP'] as const;
export type LibraryLanguage = typeof LIBRARY_LANGUAGES[number];
export const LIBRARY_FAMILIES = ['MONSTER', 'SPELL', 'TRAP', 'TOKEN'] as const;
export type LibraryFamily = typeof LIBRARY_FAMILIES[number];

export type WorkspaceStatus = {
    workspace_id: string | null;
    name: string | null;
    workspace_format_version: number | null;
    database_schema_version: number | null;
    state: string;
    read_only: boolean;
    health_summary: string;
};

export type LibraryCardSummary = {
    card_id: string;
    revision: string;
    family: LibraryFamily;
    password: string | null;
    display_name: string;
    display_language: LibraryLanguage | null;
    available_languages: LibraryLanguage[];
    archetypes: string[];
    effect_classifiers: string[];
    functional_tags: string[];
    variant_count: number;
    has_standard_ready_variant: boolean;
    has_overframe_ready_variant: boolean;
};

export type LibraryBrowseResult = {
    items: LibraryCardSummary[];
    total: number;
    limit: number;
    offset: number;
};

export type LibraryFacets = {
    families: LibraryFamily[];
    archetypes: string[];
    effect_classifiers: string[];
    functional_tags: string[];
    languages: LibraryLanguage[];
};

export type LibraryBrowseFilters = {
    query: string;
    preferredLanguage: LibraryLanguage;
    family: LibraryFamily | '';
    archetype: string;
    effectClassifier: string;
    functionalTag: string;
    limit: number;
    offset: number;
};

export type LibraryResultState = 'loading' | 'error' | 'empty-library' | 'no-match' | 'results';

export const hasBrowseCriteria = (filters: LibraryBrowseFilters) =>
    Boolean(
        filters.query.trim()
        || filters.family
        || filters.archetype
        || filters.effectClassifier
        || filters.functionalTag
    );

export const getLibraryResultState = ({
    loading,
    error,
    total,
    hasCriteria,
}: {
    loading: boolean;
    error: string | null;
    total: number;
    hasCriteria: boolean;
}): LibraryResultState => {
    if (loading) return 'loading';
    if (error) return 'error';
    if (total === 0) return hasCriteria ? 'no-match' : 'empty-library';
    return 'results';
};

export type WorkspaceShellState = 'connecting' | 'unavailable' | 'not-ready' | 'ready';

export const getWorkspaceShellState = (
    status: WorkspaceStatus | null,
    error: string | null,
): WorkspaceShellState => {
    if (error) return 'unavailable';
    if (!status) return 'connecting';
    return status.state === 'READY' ? 'ready' : 'not-ready';
};
