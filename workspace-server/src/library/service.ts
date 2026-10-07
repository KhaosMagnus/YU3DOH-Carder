import {
    CANONICAL_CARD_FAMILIES,
    CANONICAL_LANGUAGES,
    type CanonicalCardFamily,
    type CanonicalLanguage,
} from '../canonical/types';
import type { WorkspacePersistence } from '../persistence/database';
import { queryLibraryCards, queryLibraryFacets } from './repository';
import {
    LIBRARY_DEFAULT_LIMIT,
    LIBRARY_MAX_LIMIT,
    type LibraryBrowseInput,
} from './types';

export class LibraryQueryValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'LibraryQueryValidationError';
    }
}

const requireInteger = (value: number, label: string, minimum: number, maximum?: number) => {
    if (!Number.isInteger(value) || value < minimum || (maximum !== undefined && value > maximum)) {
        throw new LibraryQueryValidationError(
            maximum === undefined
                ? `${label} must be an integer >= ${minimum}.`
                : `${label} must be an integer between ${minimum} and ${maximum}.`,
        );
    }
    return value;
};

export class LibraryQueryService {
    constructor(private readonly persistence: WorkspacePersistence) {}

    browse(input: LibraryBrowseInput = {}) {
        const preferredLanguage: CanonicalLanguage = input.preferredLanguage ?? 'EN';
        if (!CANONICAL_LANGUAGES.includes(preferredLanguage)) {
            throw new LibraryQueryValidationError('preferred_language must be EN, ES, or JP.');
        }
        if (input.family && !CANONICAL_CARD_FAMILIES.includes(input.family as CanonicalCardFamily)) {
            throw new LibraryQueryValidationError('family is not supported.');
        }
        const limit = requireInteger(input.limit ?? LIBRARY_DEFAULT_LIMIT, 'limit', 1, LIBRARY_MAX_LIMIT);
        const offset = requireInteger(input.offset ?? 0, 'offset', 0);
        if ((input.query ?? '').length > 200) throw new LibraryQueryValidationError('query is too long.');

        return this.persistence.runRepositoryOperation(database =>
            queryLibraryCards(database, {
                ...input,
                preferredLanguage,
                limit,
                offset,
            }));
    }

    facets() {
        return this.persistence.runRepositoryOperation(database => queryLibraryFacets(database));
    }
}
