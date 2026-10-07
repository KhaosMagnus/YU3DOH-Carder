export const LIBRARY_LANGUAGES = ['EN', 'ES', 'JP'] as const;
export type LibraryLanguage = typeof LIBRARY_LANGUAGES[number];
export const LIBRARY_FAMILIES = ['MONSTER', 'SPELL', 'TRAP', 'TOKEN'] as const;
export type LibraryFamily = typeof LIBRARY_FAMILIES[number];

export const SEMANTIC_BLOCKS = [
    'STRUCTURE',
    'TEXT:EN',
    'TEXT:ES',
    'TEXT:JP',
    'CLASSIFICATION',
    'RELATIONS',
] as const;
export type SemanticBlock = typeof SEMANTIC_BLOCKS[number];

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

export type PrintedStat = number | '?' | null;

export type LibraryCardDetail = {
    card_id: string;
    revision: string;
    family: LibraryFamily;
    password: string | null;
    structure: Record<string, unknown> | null;
    localizations: Array<{
        language: LibraryLanguage;
        name: string | null;
        card_text: string | null;
        pendulum_text: string | null;
    }>;
    confirmations: Array<{
        block: SemanticBlock;
        state: 'DRAFT' | 'CONFIRMED';
        provenance_id: number | null;
    }>;
    classification: {
        effect_reviewed: boolean;
        archetypes: Array<{ id: string; code: string }>;
        effect_classifiers: Array<{ id: string; code: string }>;
        functional_tags: Array<{ id: string; code: string }>;
    };
    relations: Array<{
        relation_id: string;
        source_card_id: string;
        target_card_id: string;
        relation_type_code: string;
        note: string | null;
    }>;
    provenance: Array<{
        provenance_id: number;
        target_kind: string;
        target_key: string;
        source_kind: string;
        source_ref: string | null;
        note: string | null;
        created_at: string;
    }>;
};

export type LibraryEditorMetadata = {
    languages: LibraryLanguage[];
    summon_kinds: string[];
    attributes: string[];
    races: string[];
    abilities: string[];
    link_markers: string[];
    spell_subtypes: string[];
    trap_subtypes: string[];
    archetypes: Array<{ id: string; code: string }>;
    effect_classifiers: Array<{ id: string; code: string }>;
    functional_tags: Array<{ id: string; code: string }>;
    relation_types: string[];
};

export type LibraryApiError = {
    status: number;
    code: string;
    message: string;
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

export const cloneLibraryCardDetail = (detail: LibraryCardDetail): LibraryCardDetail =>
    JSON.parse(JSON.stringify(detail)) as LibraryCardDetail;

export const getConfirmationState = (
    detail: LibraryCardDetail,
    block: SemanticBlock,
): 'DRAFT' | 'CONFIRMED' =>
    detail.confirmations.find(item => item.block === block)?.state === 'CONFIRMED'
        ? 'CONFIRMED'
        : 'DRAFT';

export const ASSET_ROLES = ['BS', 'BG', 'OF'] as const;
export type AssetRole = typeof ASSET_ROLES[number];

export type SlotState = 'EMPTY' | 'BOUND' | 'CONFLICT' | 'MISSING' | 'INVALID';

export type LibraryBoundAsset = {
    asset_id: string | null;
    relative_path: string;
    file_name: string;
    extension: string;
    image_width: number | null;
    image_height: number | null;
    has_transparency: boolean | null;
    present: boolean;
    valid_asset: boolean;
    ownership: 'managed' | 'unmanaged';
    managed_asset_id: string | null;
};

export type LibraryRoleSlot = {
    slot_state: SlotState;
    asset: LibraryBoundAsset | null;
    issues: Array<{ code: string; message: string }>;
};

export type LibraryVariantDetail = {
    variant_id: string;
    card_id: string;
    variant_key: string;
    display_label: string;
    standard: { state: 'READY' | 'INCOMPLETE'; sources: AssetRole[] };
    overframe: { state: 'READY' | 'INCOMPLETE'; sources: AssetRole[] };
    roles: Record<AssetRole, LibraryRoleSlot>;
};

export type LibraryVariantsResponse = {
    card_id: string;
    variants: LibraryVariantDetail[];
};

export type LibraryScanSummary = {
    scan_id: string;
    started_at: string;
    completed_at: string;
    discovered_count: number;
    present_count: number;
    diagnostic_count: number;
};

export type LibraryNeedsAttentionItem = {
    diagnostic_id: string;
    code: string;
    relative_path: string;
    message: string;
    asset_id: string | null;
    card_id: string | null;
    variant_id: string | null;
    variant_key: string | null;
    role: string | null;
};

export type LibraryNeedsAttentionResponse = {
    latest_scan: LibraryScanSummary | null;
    items: LibraryNeedsAttentionItem[];
};

export type LibraryManagedAsset = {
    managed_asset_id: string;
    variant_id: string;
    card_id: string;
    variant_key: string;
    display_label: string;
    role: AssetRole;
    managed_relative_path: string;
    content_hash: string;
    original_file_name: string;
    extension: string;
    created_at: string;
};

export type LibraryManagedIngestResponse = {
    managed_asset: LibraryManagedAsset;
    variant: LibraryVariantDetail | null;
    idempotent: boolean;
};

export type ManagedIngestBody = {
    variant_key: string;
    role: AssetRole;
    source_file: string;
    idempotency_key: string;
};
