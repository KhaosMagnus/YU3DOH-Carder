import type { SqliteDatabase } from '../persistence/database';
import type {
    CanonicalCardFamily,
    CanonicalCardSnapshot,
    CanonicalStructureInput,
    CanonicalStructureSnapshot,
    ClassificationSnapshot,
    ConfirmationSnapshot,
    LocalizedTextInput,
    LocalizedTextSnapshot,
    NamedRegistryKind,
    PrintedStat,
    ProvenanceInput,
    ProvenanceRecord,
    RegistryEntity,
    RelationSnapshot,
    SemanticBlockKey,
    StructuralRegistryKind,
    SummonKind,
} from './types';

type CardRow = {
    card_id: string;
    family: CanonicalCardFamily;
    password: string | null;
    revision: number;
};

type StoredRelationInput = {
    relationId: string;
    targetCardId: string;
    relationTypeCode: string;
    note: string | null;
};

const structuralRegistryTables: Record<StructuralRegistryKind, string> = {
    ATTRIBUTE: 'canonical_attributes',
    RACE: 'canonical_races',
    ABILITY: 'canonical_abilities',
    LINK_MARKER: 'canonical_link_marker_codes',
    RELATION_TYPE: 'canonical_relation_types',
};

const namedRegistryTables: Record<NamedRegistryKind, { table: string; idColumn: string }> = {
    ARCHETYPE: { table: 'canonical_archetypes', idColumn: 'archetype_id' },
    EFFECT_CLASSIFIER: { table: 'canonical_effect_classifiers', idColumn: 'classifier_id' },
    FUNCTIONAL_TAG: { table: 'canonical_functional_tags', idColumn: 'tag_id' },
};

const serializeStat = (value: PrintedStat) => {
    if (value === null) return null;
    return String(value);
};

const deserializeStat = (value: string | null): PrintedStat => {
    if (value === null || value === '?') return value;
    const parsed = Number(value);
    if (!Number.isInteger(parsed)) throw new Error(`Invalid persisted printed stat: ${value}`);
    return parsed;
};

export const getCanonicalCardRow = (database: SqliteDatabase, cardId: string) =>
    database.prepare(`
        SELECT card_id, family, password, revision
        FROM canonical_cards
        WHERE card_id = ?
    `).get(cardId) as CardRow | undefined;

export const insertCanonicalCard = (
    database: SqliteDatabase,
    cardId: string,
    family: CanonicalCardFamily,
    password: string | null,
    timestamp: string,
) => {
    database.prepare(`
        INSERT INTO canonical_cards (
            card_id, family, password, revision, created_at, updated_at
        ) VALUES (?, ?, ?, 1, ?, ?)
    `).run(cardId, family, password, timestamp, timestamp);

    database.prepare(`
        INSERT INTO canonical_classification_state (card_id, effect_reviewed)
        VALUES (?, 0)
    `).run(cardId);
};

export const updateCanonicalPassword = (
    database: SqliteDatabase,
    cardId: string,
    password: string | null,
) => {
    database.prepare('UPDATE canonical_cards SET password = ? WHERE card_id = ?')
        .run(password, cardId);
};

const clearCanonicalStructure = (database: SqliteDatabase, cardId: string) => {
    database.prepare('DELETE FROM canonical_link_markers WHERE card_id = ?').run(cardId);
    database.prepare('DELETE FROM canonical_monster_abilities WHERE card_id = ?').run(cardId);
    database.prepare('DELETE FROM canonical_monster_structure WHERE card_id = ?').run(cardId);
    database.prepare('DELETE FROM canonical_token_structure WHERE card_id = ?').run(cardId);
    database.prepare('DELETE FROM canonical_spell_structure WHERE card_id = ?').run(cardId);
    database.prepare('DELETE FROM canonical_trap_structure WHERE card_id = ?').run(cardId);
};

export const replaceCanonicalStructure = (
    database: SqliteDatabase,
    cardId: string,
    structure: CanonicalStructureInput,
) => {
    clearCanonicalStructure(database, cardId);

    if (structure.kind === 'MONSTER') {
        database.prepare(`
            INSERT INTO canonical_monster_structure (
                card_id, summon_kind, attribute_code, race_code,
                level, rank, atk, def, pendulum_scale
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            cardId,
            structure.summonKind,
            structure.attributeCode,
            structure.raceCode,
            structure.level,
            structure.rank,
            serializeStat(structure.atk),
            serializeStat(structure.def),
            structure.pendulumScale,
        );

        const abilityStatement = database.prepare(`
            INSERT INTO canonical_monster_abilities (card_id, ability_code, sort_order)
            VALUES (?, ?, ?)
        `);
        structure.abilities.forEach((abilityCode, index) => {
            abilityStatement.run(cardId, abilityCode, index);
        });

        const markerStatement = database.prepare(`
            INSERT INTO canonical_link_markers (card_id, marker_code)
            VALUES (?, ?)
        `);
        structure.linkMarkers.forEach(markerCode => markerStatement.run(cardId, markerCode));
        return;
    }

    if (structure.kind === 'TOKEN') {
        database.prepare(`
            INSERT INTO canonical_token_structure (
                card_id, attribute_code, race_code, level, atk, def
            ) VALUES (?, ?, ?, ?, ?, ?)
        `).run(
            cardId,
            structure.attributeCode,
            structure.raceCode,
            structure.level,
            serializeStat(structure.atk),
            serializeStat(structure.def),
        );
        return;
    }

    if (structure.kind === 'SPELL') {
        database.prepare(`
            INSERT INTO canonical_spell_structure (card_id, subtype_code)
            VALUES (?, ?)
        `).run(cardId, structure.subtypeCode);
        return;
    }

    database.prepare(`
        INSERT INTO canonical_trap_structure (card_id, subtype_code)
        VALUES (?, ?)
    `).run(cardId, structure.subtypeCode);
};

export const upsertLocalizedText = (
    database: SqliteDatabase,
    cardId: string,
    localized: LocalizedTextInput,
) => {
    database.prepare(`
        INSERT INTO canonical_localized_text (
            card_id, language, name, card_text, pendulum_text
        ) VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(card_id, language) DO UPDATE SET
            name = excluded.name,
            card_text = excluded.card_text,
            pendulum_text = excluded.pendulum_text
    `).run(
        cardId,
        localized.language,
        localized.name,
        localized.cardText,
        localized.pendulumText,
    );
};

export const setEffectClassificationReviewed = (
    database: SqliteDatabase,
    cardId: string,
    reviewed: boolean,
) => {
    database.prepare(`
        UPDATE canonical_classification_state
        SET effect_reviewed = ?
        WHERE card_id = ?
    `).run(reviewed ? 1 : 0, cardId);
};

type AssociationDimension = 'ARCHETYPE' | 'EFFECT_CLASSIFIER' | 'FUNCTIONAL_TAG';

const associationConfig: Record<AssociationDimension, {
    table: string;
    idColumn: string;
}> = {
    ARCHETYPE: {
        table: 'canonical_card_archetypes',
        idColumn: 'archetype_id',
    },
    EFFECT_CLASSIFIER: {
        table: 'canonical_card_effect_classifiers',
        idColumn: 'classifier_id',
    },
    FUNCTIONAL_TAG: {
        table: 'canonical_card_functional_tags',
        idColumn: 'tag_id',
    },
};

export const replaceClassificationAssociations = (
    database: SqliteDatabase,
    cardId: string,
    dimension: AssociationDimension,
    ids: string[],
) => {
    const config = associationConfig[dimension];
    database.prepare(`DELETE FROM ${config.table} WHERE card_id = ?`).run(cardId);
    const insert = database.prepare(`
        INSERT INTO ${config.table} (card_id, ${config.idColumn})
        VALUES (?, ?)
    `);
    ids.forEach(id => insert.run(cardId, id));
};

export const replaceRelations = (
    database: SqliteDatabase,
    sourceCardId: string,
    relations: StoredRelationInput[],
) => {
    database.prepare('DELETE FROM canonical_card_relations WHERE source_card_id = ?')
        .run(sourceCardId);

    const insert = database.prepare(`
        INSERT INTO canonical_card_relations (
            relation_id, source_card_id, target_card_id, relation_type_code, note
        ) VALUES (?, ?, ?, ?, ?)
    `);
    relations.forEach(relation => {
        insert.run(
            relation.relationId,
            sourceCardId,
            relation.targetCardId,
            relation.relationTypeCode,
            relation.note,
        );
    });
};

export const addProvenance = (
    database: SqliteDatabase,
    cardId: string,
    provenance: ProvenanceInput,
    timestamp: string,
) => {
    const result = database.prepare(`
        INSERT INTO canonical_provenance (
            card_id, target_kind, target_key, source_kind, source_ref, note, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
        cardId,
        provenance.targetKind,
        provenance.targetKey,
        provenance.sourceKind,
        provenance.sourceRef ?? null,
        provenance.note ?? null,
        timestamp,
    );
    return Number(result.lastInsertRowid);
};

export const setBlockState = (
    database: SqliteDatabase,
    cardId: string,
    block: SemanticBlockKey,
    state: 'DRAFT' | 'CONFIRMED',
    provenanceId: number | null,
) => {
    database.prepare(`
        INSERT INTO canonical_block_states (
            card_id, block_key, state, provenance_id
        ) VALUES (?, ?, ?, ?)
        ON CONFLICT(card_id, block_key) DO UPDATE SET
            state = excluded.state,
            provenance_id = excluded.provenance_id
    `).run(cardId, block, state, provenanceId);
};

export const bumpCanonicalRevision = (
    database: SqliteDatabase,
    cardId: string,
    currentRevision: number,
    timestamp: string,
) => {
    const result = database.prepare(`
        UPDATE canonical_cards
        SET revision = revision + 1, updated_at = ?
        WHERE card_id = ? AND revision = ?
    `).run(timestamp, cardId, currentRevision);

    if (result.changes !== 1) {
        throw new Error('Canonical revision changed while mutation was in progress.');
    }
};

export const registerStructuralCode = (
    database: SqliteDatabase,
    kind: StructuralRegistryKind,
    code: string,
) => {
    const table = structuralRegistryTables[kind];
    database.prepare(`INSERT INTO ${table} (code) VALUES (?) ON CONFLICT(code) DO NOTHING`)
        .run(code);
};

export const registerNamedEntity = (
    database: SqliteDatabase,
    kind: NamedRegistryKind,
    id: string,
    code: string,
): RegistryEntity => {
    const config = namedRegistryTables[kind];
    database.prepare(`
        INSERT INTO ${config.table} (${config.idColumn}, code)
        VALUES (?, ?)
        ON CONFLICT(code) DO NOTHING
    `).run(id, code);

    const row = database.prepare(`
        SELECT ${config.idColumn} AS id, code
        FROM ${config.table}
        WHERE code = ?
    `).get(code) as RegistryEntity | undefined;

    if (!row) throw new Error(`Could not register ${kind} code ${code}.`);
    return row;
};

const loadStructure = (
    database: SqliteDatabase,
    row: CardRow,
): CanonicalStructureSnapshot => {
    if (row.family === 'MONSTER') {
        const structure = database.prepare(`
            SELECT
                summon_kind, attribute_code, race_code,
                level, rank, atk, def, pendulum_scale
            FROM canonical_monster_structure
            WHERE card_id = ?
        `).get(row.card_id) as {
            summon_kind: SummonKind | null;
            attribute_code: string | null;
            race_code: string | null;
            level: number | null;
            rank: number | null;
            atk: string | null;
            def: string | null;
            pendulum_scale: number | null;
        } | undefined;

        if (!structure) return null;

        const abilities = database.prepare(`
            SELECT ability_code
            FROM canonical_monster_abilities
            WHERE card_id = ?
            ORDER BY sort_order
        `).all(row.card_id) as Array<{ ability_code: string }>;

        const markers = database.prepare(`
            SELECT marker_code
            FROM canonical_link_markers
            WHERE card_id = ?
            ORDER BY marker_code
        `).all(row.card_id) as Array<{ marker_code: string }>;

        const summonKind = structure.summon_kind;
        const linkMarkers = markers.map(marker => marker.marker_code);
        return {
            kind: 'MONSTER',
            summonKind,
            attributeCode: structure.attribute_code,
            raceCode: structure.race_code,
            level: structure.level,
            rank: structure.rank,
            atk: deserializeStat(structure.atk),
            def: deserializeStat(structure.def),
            pendulumScale: structure.pendulum_scale,
            abilities: abilities.map(ability => ability.ability_code),
            linkMarkers,
            linkRating: summonKind === 'LINK' ? linkMarkers.length : null,
        };
    }

    if (row.family === 'TOKEN') {
        const structure = database.prepare(`
            SELECT attribute_code, race_code, level, atk, def
            FROM canonical_token_structure
            WHERE card_id = ?
        `).get(row.card_id) as {
            attribute_code: string | null;
            race_code: string | null;
            level: number | null;
            atk: string | null;
            def: string | null;
        } | undefined;
        if (!structure) return null;
        return {
            kind: 'TOKEN',
            attributeCode: structure.attribute_code,
            raceCode: structure.race_code,
            level: structure.level,
            atk: deserializeStat(structure.atk),
            def: deserializeStat(structure.def),
        };
    }

    if (row.family === 'SPELL') {
        const structure = database.prepare(`
            SELECT subtype_code
            FROM canonical_spell_structure
            WHERE card_id = ?
        `).get(row.card_id) as { subtype_code: string | null } | undefined;
        return structure ? { kind: 'SPELL', subtypeCode: structure.subtype_code } : null;
    }

    const structure = database.prepare(`
        SELECT subtype_code
        FROM canonical_trap_structure
        WHERE card_id = ?
    `).get(row.card_id) as { subtype_code: string | null } | undefined;
    return structure ? { kind: 'TRAP', subtypeCode: structure.subtype_code } : null;
};

const loadLocalizations = (
    database: SqliteDatabase,
    cardId: string,
): LocalizedTextSnapshot[] => {
    const rows = database.prepare(`
        SELECT language, name, card_text, pendulum_text
        FROM canonical_localized_text
        WHERE card_id = ?
        ORDER BY CASE language WHEN 'EN' THEN 1 WHEN 'ES' THEN 2 ELSE 3 END
    `).all(cardId) as Array<{
        language: import('./types').CanonicalLanguage;
        name: string | null;
        card_text: string | null;
        pendulum_text: string | null;
    }>;
    return rows.map(row => ({
        language: row.language,
        name: row.name,
        cardText: row.card_text,
        pendulumText: row.pendulum_text,
    }));
};

const loadConfirmations = (
    database: SqliteDatabase,
    cardId: string,
): ConfirmationSnapshot[] => {
    const rows = database.prepare(`
        SELECT block_key, state, provenance_id
        FROM canonical_block_states
        WHERE card_id = ?
        ORDER BY block_key
    `).all(cardId) as Array<{
        block_key: SemanticBlockKey;
        state: 'DRAFT' | 'CONFIRMED';
        provenance_id: number | null;
    }>;
    return rows.map(row => ({
        block: row.block_key,
        state: row.state,
        provenanceId: row.provenance_id,
    }));
};

const loadProvenance = (
    database: SqliteDatabase,
    cardId: string,
): ProvenanceRecord[] => {
    const rows = database.prepare(`
        SELECT
            provenance_id, target_kind, target_key,
            source_kind, source_ref, note, created_at
        FROM canonical_provenance
        WHERE card_id = ?
        ORDER BY provenance_id
    `).all(cardId) as Array<{
        provenance_id: number;
        target_kind: string;
        target_key: string;
        source_kind: string;
        source_ref: string | null;
        note: string | null;
        created_at: string;
    }>;
    return rows.map(row => ({
        provenanceId: row.provenance_id,
        targetKind: row.target_kind,
        targetKey: row.target_key,
        sourceKind: row.source_kind,
        sourceRef: row.source_ref,
        note: row.note,
        createdAt: row.created_at,
    }));
};

const loadRegistryAssociations = (
    database: SqliteDatabase,
    cardId: string,
    dimension: AssociationDimension,
): RegistryEntity[] => {
    if (dimension === 'ARCHETYPE') {
        return database.prepare(`
            SELECT registry.archetype_id AS id, registry.code
            FROM canonical_card_archetypes association
            JOIN canonical_archetypes registry
                ON registry.archetype_id = association.archetype_id
            WHERE association.card_id = ?
            ORDER BY registry.code
        `).all(cardId) as RegistryEntity[];
    }
    if (dimension === 'EFFECT_CLASSIFIER') {
        return database.prepare(`
            SELECT registry.classifier_id AS id, registry.code
            FROM canonical_card_effect_classifiers association
            JOIN canonical_effect_classifiers registry
                ON registry.classifier_id = association.classifier_id
            WHERE association.card_id = ?
            ORDER BY registry.code
        `).all(cardId) as RegistryEntity[];
    }
    return database.prepare(`
        SELECT registry.tag_id AS id, registry.code
        FROM canonical_card_functional_tags association
        JOIN canonical_functional_tags registry
            ON registry.tag_id = association.tag_id
        WHERE association.card_id = ?
        ORDER BY registry.code
    `).all(cardId) as RegistryEntity[];
};

const loadClassification = (
    database: SqliteDatabase,
    cardId: string,
): ClassificationSnapshot => {
    const state = database.prepare(`
        SELECT effect_reviewed
        FROM canonical_classification_state
        WHERE card_id = ?
    `).get(cardId) as { effect_reviewed: number } | undefined;

    return {
        effectReviewed: state?.effect_reviewed === 1,
        archetypes: loadRegistryAssociations(database, cardId, 'ARCHETYPE'),
        effectClassifiers: loadRegistryAssociations(database, cardId, 'EFFECT_CLASSIFIER'),
        functionalTags: loadRegistryAssociations(database, cardId, 'FUNCTIONAL_TAG'),
    };
};

const loadRelations = (
    database: SqliteDatabase,
    cardId: string,
): RelationSnapshot[] => {
    const rows = database.prepare(`
        SELECT relation_id, source_card_id, target_card_id, relation_type_code, note
        FROM canonical_card_relations
        WHERE source_card_id = ?
        ORDER BY relation_type_code, target_card_id
    `).all(cardId) as Array<{
        relation_id: string;
        source_card_id: string;
        target_card_id: string;
        relation_type_code: string;
        note: string | null;
    }>;

    return rows.map(row => ({
        relationId: row.relation_id,
        sourceCardId: row.source_card_id,
        targetCardId: row.target_card_id,
        relationTypeCode: row.relation_type_code,
        note: row.note,
    }));
};

export const loadCanonicalCardSnapshot = (
    database: SqliteDatabase,
    cardId: string,
): CanonicalCardSnapshot | null => {
    const row = getCanonicalCardRow(database, cardId);
    if (!row) return null;

    return {
        cardId: row.card_id,
        family: row.family,
        password: row.password,
        revision: String(row.revision),
        structure: loadStructure(database, row),
        localizations: loadLocalizations(database, row.card_id),
        confirmations: loadConfirmations(database, row.card_id),
        provenance: loadProvenance(database, row.card_id),
        classification: loadClassification(database, row.card_id),
        relations: loadRelations(database, row.card_id),
    };
};
