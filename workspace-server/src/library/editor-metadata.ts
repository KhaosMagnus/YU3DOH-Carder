import { CANONICAL_LANGUAGES } from '../canonical/types';
import type { WorkspacePersistence } from '../persistence/database';

const listCodes = (persistence: WorkspacePersistence, table: string): string[] =>
    persistence.runRepositoryOperation(database => {
        const rows = database.prepare(`SELECT code FROM ${table} ORDER BY code`).all() as Array<{ code: string }>;
        return rows.map(row => row.code);
    });

const listNamed = (
    persistence: WorkspacePersistence,
    table: string,
    idColumn: string,
): Array<{ id: string; code: string }> =>
    persistence.runRepositoryOperation(database => {
        const rows = database.prepare(`
            SELECT ${idColumn} AS id, code
            FROM ${table}
            ORDER BY code
        `).all() as Array<{ id: string; code: string }>;
        return rows;
    });

export type LibraryEditorMetadataDto = {
    languages: typeof CANONICAL_LANGUAGES[number][];
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

export const loadLibraryEditorMetadata = (
    persistence: WorkspacePersistence,
): LibraryEditorMetadataDto => ({
    languages: [...CANONICAL_LANGUAGES],
    summon_kinds: listCodes(persistence, 'canonical_summon_kinds'),
    attributes: listCodes(persistence, 'canonical_attributes'),
    races: listCodes(persistence, 'canonical_races'),
    abilities: listCodes(persistence, 'canonical_abilities'),
    link_markers: listCodes(persistence, 'canonical_link_marker_codes'),
    spell_subtypes: listCodes(persistence, 'canonical_spell_subtypes'),
    trap_subtypes: listCodes(persistence, 'canonical_trap_subtypes'),
    archetypes: listNamed(persistence, 'canonical_archetypes', 'archetype_id'),
    effect_classifiers: listNamed(persistence, 'canonical_effect_classifiers', 'classifier_id'),
    functional_tags: listNamed(persistence, 'canonical_functional_tags', 'tag_id'),
    relation_types: listCodes(persistence, 'canonical_relation_types'),
});
