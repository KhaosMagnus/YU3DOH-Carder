export const CANONICAL_CARD_FAMILIES = ['MONSTER', 'SPELL', 'TRAP', 'TOKEN'] as const;
export type CanonicalCardFamily = typeof CANONICAL_CARD_FAMILIES[number];

export const CANONICAL_LANGUAGES = ['EN', 'ES', 'JP'] as const;
export type CanonicalLanguage = typeof CANONICAL_LANGUAGES[number];

export const SUMMON_KINDS = ['MAIN_DECK', 'RITUAL', 'FUSION', 'SYNCHRO', 'XYZ', 'LINK'] as const;
export type SummonKind = typeof SUMMON_KINDS[number];

export const SEMANTIC_BLOCK_KEYS = [
    'STRUCTURE',
    'TEXT:EN',
    'TEXT:ES',
    'TEXT:JP',
    'CLASSIFICATION',
    'RELATIONS',
] as const;
export type SemanticBlockKey = typeof SEMANTIC_BLOCK_KEYS[number];

export type ConfirmationState = 'DRAFT' | 'CONFIRMED';
export type PrintedStat = number | '?' | null;

export type SourceProvenanceInput = {
    sourceKind: string;
    sourceRef?: string | null;
    note?: string | null;
};

export type ProvenanceInput = SourceProvenanceInput & {
    targetKind: string;
    targetKey: string;
};

export type ProvenanceRecord = {
    provenanceId: number;
    targetKind: string;
    targetKey: string;
    sourceKind: string;
    sourceRef: string | null;
    note: string | null;
    createdAt: string;
};

export type MonsterStructureInput = {
    kind: 'MONSTER';
    summonKind: SummonKind | null;
    attributeCode: string | null;
    raceCode: string | null;
    level: number | null;
    rank: number | null;
    atk: PrintedStat;
    def: PrintedStat;
    pendulumScale: number | null;
    abilities: string[];
    linkMarkers: string[];
};

export type TokenStructureInput = {
    kind: 'TOKEN';
    attributeCode: string | null;
    raceCode: string | null;
    level: number | null;
    atk: PrintedStat;
    def: PrintedStat;
};

export type SpellStructureInput = {
    kind: 'SPELL';
    subtypeCode: string | null;
};

export type TrapStructureInput = {
    kind: 'TRAP';
    subtypeCode: string | null;
};

export type CanonicalStructureInput =
    | MonsterStructureInput
    | TokenStructureInput
    | SpellStructureInput
    | TrapStructureInput;

export type MonsterStructureSnapshot = MonsterStructureInput & {
    linkRating: number | null;
};

export type CanonicalStructureSnapshot =
    | MonsterStructureSnapshot
    | TokenStructureInput
    | SpellStructureInput
    | TrapStructureInput
    | null;

export type LocalizedTextInput = {
    language: CanonicalLanguage;
    name: string | null;
    cardText: string | null;
    pendulumText: string | null;
};

export type LocalizedTextSnapshot = LocalizedTextInput;

export type RegistryEntity = {
    id: string;
    code: string;
};

export type ClassificationSnapshot = {
    effectReviewed: boolean;
    archetypes: RegistryEntity[];
    effectClassifiers: RegistryEntity[];
    functionalTags: RegistryEntity[];
};

export type RelationInput = {
    targetCardId: string;
    relationTypeCode: string;
    note?: string | null;
    provenance?: SourceProvenanceInput;
};

export type RelationSnapshot = {
    relationId: string;
    sourceCardId: string;
    targetCardId: string;
    relationTypeCode: string;
    note: string | null;
};

export type ConfirmationMutation = {
    block: SemanticBlockKey;
    state: ConfirmationState;
    provenance?: SourceProvenanceInput;
};

export type ConfirmationSnapshot = {
    block: SemanticBlockKey;
    state: ConfirmationState;
    provenanceId: number | null;
};

export type ClassificationMutation = {
    effectReviewed?: boolean;
    archetypeIds?: string[];
    effectClassifierIds?: string[];
    functionalTagIds?: string[];
};

export type CanonicalCardMutation = {
    password?: string | null;
    structure?: CanonicalStructureInput;
    localizations?: LocalizedTextInput[];
    classification?: ClassificationMutation;
    relations?: RelationInput[];
    confirmations?: ConfirmationMutation[];
    provenance?: ProvenanceInput[];
};

export type CreateCanonicalCardInput = {
    family: CanonicalCardFamily;
    password?: string | null;
    provenance?: SourceProvenanceInput;
};

export type CanonicalCardSnapshot = {
    cardId: string;
    family: CanonicalCardFamily;
    password: string | null;
    revision: string;
    structure: CanonicalStructureSnapshot;
    localizations: LocalizedTextSnapshot[];
    confirmations: ConfirmationSnapshot[];
    provenance: ProvenanceRecord[];
    classification: ClassificationSnapshot;
    relations: RelationSnapshot[];
};

export type StructuralRegistryKind = 'ATTRIBUTE' | 'RACE' | 'ABILITY' | 'LINK_MARKER' | 'RELATION_TYPE';
export type NamedRegistryKind = 'ARCHETYPE' | 'EFFECT_CLASSIFIER' | 'FUNCTIONAL_TAG';
