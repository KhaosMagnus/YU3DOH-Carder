import { listArtVariants } from '../assets/repository';
import { loadCanonicalCardSnapshot } from '../canonical/repository';
import {
    CANONICAL_CARD_FAMILIES,
    CANONICAL_LANGUAGES,
    type CanonicalLanguage,
} from '../canonical/types';
import type { SqliteDatabase } from '../persistence/database';
import type {
    LibraryBrowseInput,
    LibraryBrowseResult,
    LibraryCardSummary,
    LibraryFacets,
} from './types';
import { LIBRARY_DEFAULT_LIMIT, LIBRARY_MAX_LIMIT } from './types';

const normalizeText = (value: string) =>
    value.normalize('NFKC').trim().toLocaleLowerCase('en-US');

const displayOrder = (preferred: CanonicalLanguage): CanonicalLanguage[] => [
    preferred,
    ...(['EN', 'ES', 'JP'] as CanonicalLanguage[]).filter(language => language !== preferred),
];

const selectDisplayName = (
    localizations: Array<{ language: CanonicalLanguage; name: string | null }>,
    preferred: CanonicalLanguage,
    password: string | null,
    cardId: string,
) => {
    const names = new Map(
        localizations
            .filter(localized => Boolean(localized.name?.trim()))
            .map(localized => [localized.language, localized.name!.trim()] as const),
    );
    for (const language of displayOrder(preferred)) {
        const name = names.get(language);
        if (name) return { name, language };
    }
    return {
        name: password?.trim() || cardId,
        language: null,
    };
};

const staticFilterSql = (input: LibraryBrowseInput) => {
    const clauses: string[] = [];
    const parameters: unknown[] = [];

    if (input.family) {
        clauses.push('cards.family = ?');
        parameters.push(input.family);
    }
    if (input.archetype) {
        clauses.push(`EXISTS (
            SELECT 1
            FROM canonical_card_archetypes association
            JOIN canonical_archetypes registry
                ON registry.archetype_id = association.archetype_id
            WHERE association.card_id = cards.card_id
              AND registry.code = ?
        )`);
        parameters.push(input.archetype);
    }
    if (input.effectClassifier) {
        clauses.push(`EXISTS (
            SELECT 1
            FROM canonical_card_effect_classifiers association
            JOIN canonical_effect_classifiers registry
                ON registry.classifier_id = association.classifier_id
            WHERE association.card_id = cards.card_id
              AND registry.code = ?
        )`);
        parameters.push(input.effectClassifier);
    }
    if (input.functionalTag) {
        clauses.push(`EXISTS (
            SELECT 1
            FROM canonical_card_functional_tags association
            JOIN canonical_functional_tags registry
                ON registry.tag_id = association.tag_id
            WHERE association.card_id = cards.card_id
              AND registry.code = ?
        )`);
        parameters.push(input.functionalTag);
    }

    return {
        where: clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '',
        parameters,
    };
};

const summaryFor = (
    database: SqliteDatabase,
    cardId: string,
    preferredLanguage: CanonicalLanguage,
): LibraryCardSummary | null => {
    const snapshot = loadCanonicalCardSnapshot(database, cardId);
    if (!snapshot) return null;

    const selected = selectDisplayName(
        snapshot.localizations,
        preferredLanguage,
        snapshot.password,
        snapshot.cardId,
    );
    const variants = listArtVariants(database, cardId);
    const availableLanguages = CANONICAL_LANGUAGES.filter(language =>
        snapshot.localizations.some(localized =>
            localized.language === language && Boolean(localized.name?.trim())));

    return {
        card_id: snapshot.cardId,
        revision: snapshot.revision,
        family: snapshot.family,
        password: snapshot.password,
        display_name: selected.name,
        display_language: selected.language,
        available_languages: availableLanguages,
        archetypes: snapshot.classification.archetypes.map(value => value.code),
        effect_classifiers: snapshot.classification.effectClassifiers.map(value => value.code),
        functional_tags: snapshot.classification.functionalTags.map(value => value.code),
        variant_count: variants.length,
        has_standard_ready_variant: variants.some(variant => variant.standard.state === 'READY'),
        has_overframe_ready_variant: variants.some(variant => variant.overframe.state === 'READY'),
    };
};

const matchesSearch = (
    database: SqliteDatabase,
    cardId: string,
    query: string,
) => {
    if (!query) return true;
    const snapshot = loadCanonicalCardSnapshot(database, cardId);
    if (!snapshot) return false;
    if (snapshot.password && normalizeText(snapshot.password).includes(query)) return true;
    return snapshot.localizations.some(localized =>
        localized.name ? normalizeText(localized.name).includes(query) : false);
};

export const queryLibraryCards = (
    database: SqliteDatabase,
    input: LibraryBrowseInput,
): LibraryBrowseResult => {
    const preferredLanguage = input.preferredLanguage ?? 'EN';
    const limit = Math.min(input.limit ?? LIBRARY_DEFAULT_LIMIT, LIBRARY_MAX_LIMIT);
    const offset = input.offset ?? 0;
    const query = normalizeText(input.query ?? '');
    const filter = staticFilterSql(input);

    const rows = database.prepare(`
        SELECT cards.card_id
        FROM canonical_cards cards
        ${filter.where}
        ORDER BY cards.card_id
    `).all(...filter.parameters) as Array<{ card_id: string }>;

    const items = rows
        .filter(row => matchesSearch(database, row.card_id, query))
        .map(row => summaryFor(database, row.card_id, preferredLanguage))
        .filter((summary): summary is LibraryCardSummary => summary !== null)
        .sort((left, right) => {
            const leftName = normalizeText(left.display_name);
            const rightName = normalizeText(right.display_name);
            if (leftName < rightName) return -1;
            if (leftName > rightName) return 1;
            return left.card_id < right.card_id ? -1 : left.card_id > right.card_id ? 1 : 0;
        });

    return {
        items: items.slice(offset, offset + limit),
        total: items.length,
        limit,
        offset,
    };
};

const listCodes = (database: SqliteDatabase, table: string) =>
    (database.prepare(`SELECT code FROM ${table} ORDER BY code`).all() as Array<{ code: string }>)
        .map(row => row.code);

export const queryLibraryFacets = (database: SqliteDatabase): LibraryFacets => ({
    families: [...CANONICAL_CARD_FAMILIES],
    archetypes: listCodes(database, 'canonical_archetypes'),
    effect_classifiers: listCodes(database, 'canonical_effect_classifiers'),
    functional_tags: listCodes(database, 'canonical_functional_tags'),
    languages: [...CANONICAL_LANGUAGES],
});
