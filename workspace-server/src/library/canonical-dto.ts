import type {
    CanonicalCardMutation,
    CanonicalCardSnapshot,
    CanonicalStructureInput,
    CanonicalStructureSnapshot,
    MonsterStructureInput,
    ClassificationMutation,
    ConfirmationMutation,
    CreateCanonicalCardInput,
    LocalizedTextInput,
    ProvenanceInput,
    RelationInput,
    SourceProvenanceInput,
} from '../canonical/types';

const mapSourceProvenance = (value: {
    source_kind: string;
    source_ref?: string | null;
    note?: string | null;
}): SourceProvenanceInput => ({
    sourceKind: value.source_kind,
    sourceRef: value.source_ref ?? null,
    note: value.note ?? null,
});

const mapStructureToDto = (structure: CanonicalStructureSnapshot) => {
    if (!structure) return null;
    if (structure.kind === 'MONSTER') {
        return {
            kind: 'MONSTER' as const,
            summon_kind: structure.summonKind,
            attribute_code: structure.attributeCode,
            race_code: structure.raceCode,
            level: structure.level,
            rank: structure.rank,
            atk: structure.atk,
            def: structure.def,
            pendulum_scale: structure.pendulumScale,
            abilities: structure.abilities,
            link_markers: structure.linkMarkers,
            link_rating: structure.linkRating,
        };
    }
    if (structure.kind === 'TOKEN') {
        return {
            kind: 'TOKEN' as const,
            attribute_code: structure.attributeCode,
            race_code: structure.raceCode,
            level: structure.level,
            atk: structure.atk,
            def: structure.def,
        };
    }
    if (structure.kind === 'SPELL') {
        return {
            kind: 'SPELL' as const,
            subtype_code: structure.subtypeCode,
        };
    }
    return {
        kind: 'TRAP' as const,
        subtype_code: structure.subtypeCode,
    };
};

const mapStructureFromDto = (structure: Record<string, unknown>): CanonicalStructureInput => {
    const kind = structure.kind;
    if (kind === 'MONSTER') {
        return {
            kind: 'MONSTER',
            summonKind: (structure.summon_kind as MonsterStructureInput['summonKind']) ?? null,
            attributeCode: (structure.attribute_code as string | null) ?? null,
            raceCode: (structure.race_code as string | null) ?? null,
            level: (structure.level as number | null) ?? null,
            rank: (structure.rank as number | null) ?? null,
            atk: structure.atk as number | '?' | null,
            def: structure.def as number | '?' | null,
            pendulumScale: (structure.pendulum_scale as number | null) ?? null,
            abilities: Array.isArray(structure.abilities) ? structure.abilities as string[] : [],
            linkMarkers: Array.isArray(structure.link_markers) ? structure.link_markers as string[] : [],
        };
    }
    if (kind === 'TOKEN') {
        return {
            kind: 'TOKEN',
            attributeCode: (structure.attribute_code as string | null) ?? null,
            raceCode: (structure.race_code as string | null) ?? null,
            level: (structure.level as number | null) ?? null,
            atk: structure.atk as number | '?' | null,
            def: structure.def as number | '?' | null,
        };
    }
    if (kind === 'SPELL') {
        return {
            kind: 'SPELL',
            subtypeCode: (structure.subtype_code as string | null) ?? null,
        };
    }
    if (kind === 'TRAP') {
        return {
            kind: 'TRAP',
            subtypeCode: (structure.subtype_code as string | null) ?? null,
        };
    }
    throw new Error(`Unsupported structure kind in DTO: ${String(kind)}`);
};

export const toLibraryCardDetailDto = (snapshot: CanonicalCardSnapshot) => ({
    card_id: snapshot.cardId,
    revision: snapshot.revision,
    family: snapshot.family,
    password: snapshot.password,
    structure: mapStructureToDto(snapshot.structure),
    localizations: snapshot.localizations.map(item => ({
        language: item.language,
        name: item.name,
        card_text: item.cardText,
        pendulum_text: item.pendulumText,
    })),
    confirmations: snapshot.confirmations.map(item => ({
        block: item.block,
        state: item.state,
        provenance_id: item.provenanceId,
    })),
    classification: {
        effect_reviewed: snapshot.classification.effectReviewed,
        archetypes: snapshot.classification.archetypes.map(item => ({
            id: item.id,
            code: item.code,
        })),
        effect_classifiers: snapshot.classification.effectClassifiers.map(item => ({
            id: item.id,
            code: item.code,
        })),
        functional_tags: snapshot.classification.functionalTags.map(item => ({
            id: item.id,
            code: item.code,
        })),
    },
    relations: snapshot.relations.map(item => ({
        relation_id: item.relationId,
        source_card_id: item.sourceCardId,
        target_card_id: item.targetCardId,
        relation_type_code: item.relationTypeCode,
        note: item.note,
    })),
    provenance: snapshot.provenance.map(item => ({
        provenance_id: item.provenanceId,
        target_kind: item.targetKind,
        target_key: item.targetKey,
        source_kind: item.sourceKind,
        source_ref: item.sourceRef,
        note: item.note,
        created_at: item.createdAt,
    })),
});

export type LibraryCardDetailDto = ReturnType<typeof toLibraryCardDetailDto>;

export type CreateLibraryCardBody = {
    family: CreateCanonicalCardInput['family'];
    password?: string | null;
};

const normalizePassword = (password: string | null | undefined) => {
    if (password === undefined) return undefined;
    if (password === null) return null;
    const trimmed = password.trim();
    return trimmed.length === 0 ? null : trimmed;
};

export const toCreateCanonicalCardInput = (body: CreateLibraryCardBody): CreateCanonicalCardInput => {
    const password = normalizePassword(body.password);
    return {
        family: body.family,
        ...(password !== undefined ? { password } : {}),
    };
};

export type PatchLibraryCardBody = {
    expected_revision: string;
    password?: string | null;
    structure?: Record<string, unknown>;
    localizations?: Array<{
        language: LocalizedTextInput['language'];
        name: string | null;
        card_text: string | null;
        pendulum_text: string | null;
    }>;
    classification?: {
        effect_reviewed?: boolean;
        archetype_ids?: string[];
        effect_classifier_ids?: string[];
        functional_tag_ids?: string[];
    };
    relations?: Array<{
        target_card_id: string;
        relation_type_code: string;
        note?: string | null;
        provenance?: {
            source_kind: string;
            source_ref?: string | null;
            note?: string | null;
        };
    }>;
    confirmations?: Array<{
        block: ConfirmationMutation['block'];
        state: ConfirmationMutation['state'];
        provenance?: {
            source_kind: string;
            source_ref?: string | null;
            note?: string | null;
        };
    }>;
    provenance?: Array<{
        target_kind: string;
        target_key: string;
        source_kind: string;
        source_ref?: string | null;
        note?: string | null;
    }>;
};

export const toCanonicalCardMutation = (body: PatchLibraryCardBody): {
    expectedRevision: string;
    mutation: CanonicalCardMutation;
} => {
    const mutation: CanonicalCardMutation = {};

    if (body.password !== undefined) {
        mutation.password = normalizePassword(body.password) ?? null;
    }

    if (body.structure !== undefined) {
        mutation.structure = mapStructureFromDto(body.structure);
    }

    if (body.localizations !== undefined) {
        mutation.localizations = body.localizations.map(item => ({
            language: item.language,
            name: item.name,
            cardText: item.card_text,
            pendulumText: item.pendulum_text,
        }));
    }

    if (body.classification !== undefined) {
        const classification: ClassificationMutation = {};
        if (body.classification.effect_reviewed !== undefined) {
            classification.effectReviewed = body.classification.effect_reviewed;
        }
        if (body.classification.archetype_ids !== undefined) {
            classification.archetypeIds = body.classification.archetype_ids;
        }
        if (body.classification.effect_classifier_ids !== undefined) {
            classification.effectClassifierIds = body.classification.effect_classifier_ids;
        }
        if (body.classification.functional_tag_ids !== undefined) {
            classification.functionalTagIds = body.classification.functional_tag_ids;
        }
        mutation.classification = classification;
    }

    if (body.relations !== undefined) {
        mutation.relations = body.relations.map((item): RelationInput => ({
            targetCardId: item.target_card_id,
            relationTypeCode: item.relation_type_code,
            note: item.note ?? null,
            ...(item.provenance ? { provenance: mapSourceProvenance(item.provenance) } : {}),
        }));
    }

    if (body.confirmations !== undefined) {
        mutation.confirmations = body.confirmations.map((item): ConfirmationMutation => ({
            block: item.block,
            state: item.state,
            ...(item.provenance ? { provenance: mapSourceProvenance(item.provenance) } : {}),
        }));
    }

    if (body.provenance !== undefined) {
        mutation.provenance = body.provenance.map((item): ProvenanceInput => ({
            targetKind: item.target_kind,
            targetKey: item.target_key,
            sourceKind: item.source_kind,
            sourceRef: item.source_ref ?? null,
            note: item.note ?? null,
        }));
    }

    return {
        expectedRevision: body.expected_revision,
        mutation,
    };
};
