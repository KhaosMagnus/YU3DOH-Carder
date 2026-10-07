import type { CanonicalCardFamily, CanonicalLanguage } from '../canonical/types';

export const LIBRARY_DEFAULT_LIMIT = 50;
export const LIBRARY_MAX_LIMIT = 200;

export type LibraryBrowseInput = {
    query?: string;
    preferredLanguage?: CanonicalLanguage;
    family?: CanonicalCardFamily;
    archetype?: string;
    effectClassifier?: string;
    functionalTag?: string;
    limit?: number;
    offset?: number;
};

export type LibraryCardSummary = {
    card_id: string;
    revision: string;
    family: CanonicalCardFamily;
    password: string | null;
    display_name: string;
    display_language: CanonicalLanguage | null;
    available_languages: CanonicalLanguage[];
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
    families: CanonicalCardFamily[];
    archetypes: string[];
    effect_classifiers: string[];
    functional_tags: string[];
    languages: CanonicalLanguage[];
};
