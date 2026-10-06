CREATE TABLE canonical_cards (
    card_id TEXT PRIMARY KEY NOT NULL CHECK (length(trim(card_id)) > 0),
    family TEXT NOT NULL CHECK (family IN ('MONSTER', 'SPELL', 'TRAP', 'TOKEN')),
    password TEXT,
    revision INTEGER NOT NULL DEFAULT 1 CHECK (revision >= 1),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    CHECK (family <> 'TOKEN' OR password IS NULL)
) STRICT;

CREATE TABLE canonical_summon_kinds (
    code TEXT PRIMARY KEY NOT NULL CHECK (length(trim(code)) > 0)
) STRICT;

INSERT INTO canonical_summon_kinds (code) VALUES
    ('MAIN_DECK'),
    ('RITUAL'),
    ('FUSION'),
    ('SYNCHRO'),
    ('XYZ'),
    ('LINK');

CREATE TABLE canonical_attributes (
    code TEXT PRIMARY KEY NOT NULL CHECK (length(trim(code)) > 0)
) STRICT;

CREATE TABLE canonical_races (
    code TEXT PRIMARY KEY NOT NULL CHECK (length(trim(code)) > 0)
) STRICT;

CREATE TABLE canonical_abilities (
    code TEXT PRIMARY KEY NOT NULL CHECK (length(trim(code)) > 0)
) STRICT;

INSERT INTO canonical_abilities (code) VALUES
    ('NORMAL'),
    ('EFFECT'),
    ('TUNER'),
    ('FLIP'),
    ('GEMINI'),
    ('SPIRIT'),
    ('TOON'),
    ('UNION'),
    ('PENDULUM'),
    ('SPECIAL_SUMMON');

CREATE TABLE canonical_link_marker_codes (
    code TEXT PRIMARY KEY NOT NULL CHECK (length(trim(code)) > 0)
) STRICT;

CREATE TABLE canonical_spell_subtypes (
    code TEXT PRIMARY KEY NOT NULL CHECK (length(trim(code)) > 0)
) STRICT;

INSERT INTO canonical_spell_subtypes (code) VALUES
    ('NORMAL'),
    ('CONTINUOUS'),
    ('EQUIP'),
    ('FIELD'),
    ('QUICK_PLAY'),
    ('RITUAL');

CREATE TABLE canonical_trap_subtypes (
    code TEXT PRIMARY KEY NOT NULL CHECK (length(trim(code)) > 0)
) STRICT;

INSERT INTO canonical_trap_subtypes (code) VALUES
    ('NORMAL'),
    ('CONTINUOUS'),
    ('COUNTER');

CREATE TABLE canonical_archetypes (
    archetype_id TEXT PRIMARY KEY NOT NULL CHECK (length(trim(archetype_id)) > 0),
    code TEXT NOT NULL UNIQUE CHECK (length(trim(code)) > 0)
) STRICT;

CREATE TABLE canonical_effect_classifiers (
    classifier_id TEXT PRIMARY KEY NOT NULL CHECK (length(trim(classifier_id)) > 0),
    code TEXT NOT NULL UNIQUE CHECK (length(trim(code)) > 0)
) STRICT;

CREATE TABLE canonical_functional_tags (
    tag_id TEXT PRIMARY KEY NOT NULL CHECK (length(trim(tag_id)) > 0),
    code TEXT NOT NULL UNIQUE CHECK (length(trim(code)) > 0)
) STRICT;

CREATE TABLE canonical_relation_types (
    code TEXT PRIMARY KEY NOT NULL CHECK (length(trim(code)) > 0)
) STRICT;

INSERT INTO canonical_relation_types (code) VALUES ('CREATES_TOKEN');

CREATE TABLE canonical_provenance (
    provenance_id INTEGER PRIMARY KEY,
    card_id TEXT NOT NULL REFERENCES canonical_cards(card_id) ON DELETE RESTRICT,
    target_kind TEXT NOT NULL CHECK (length(trim(target_kind)) > 0),
    target_key TEXT NOT NULL CHECK (length(trim(target_key)) > 0),
    source_kind TEXT NOT NULL CHECK (length(trim(source_kind)) > 0),
    source_ref TEXT,
    note TEXT,
    created_at TEXT NOT NULL
) STRICT;

CREATE INDEX idx_canonical_provenance_card_target
    ON canonical_provenance(card_id, target_kind, target_key);

CREATE TABLE canonical_monster_structure (
    card_id TEXT PRIMARY KEY NOT NULL REFERENCES canonical_cards(card_id) ON DELETE RESTRICT,
    summon_kind TEXT REFERENCES canonical_summon_kinds(code) ON DELETE RESTRICT,
    attribute_code TEXT REFERENCES canonical_attributes(code) ON DELETE RESTRICT,
    race_code TEXT REFERENCES canonical_races(code) ON DELETE RESTRICT,
    level INTEGER,
    rank INTEGER,
    atk TEXT,
    def TEXT,
    pendulum_scale INTEGER
) STRICT;

CREATE TABLE canonical_monster_abilities (
    card_id TEXT NOT NULL REFERENCES canonical_cards(card_id) ON DELETE RESTRICT,
    ability_code TEXT NOT NULL REFERENCES canonical_abilities(code) ON DELETE RESTRICT,
    sort_order INTEGER NOT NULL CHECK (sort_order >= 0),
    PRIMARY KEY (card_id, ability_code),
    UNIQUE (card_id, sort_order)
) STRICT;

CREATE TABLE canonical_link_markers (
    card_id TEXT NOT NULL REFERENCES canonical_cards(card_id) ON DELETE RESTRICT,
    marker_code TEXT NOT NULL REFERENCES canonical_link_marker_codes(code) ON DELETE RESTRICT,
    PRIMARY KEY (card_id, marker_code)
) STRICT;

CREATE TABLE canonical_token_structure (
    card_id TEXT PRIMARY KEY NOT NULL REFERENCES canonical_cards(card_id) ON DELETE RESTRICT,
    attribute_code TEXT REFERENCES canonical_attributes(code) ON DELETE RESTRICT,
    race_code TEXT REFERENCES canonical_races(code) ON DELETE RESTRICT,
    level INTEGER,
    atk TEXT,
    def TEXT
) STRICT;

CREATE TABLE canonical_spell_structure (
    card_id TEXT PRIMARY KEY NOT NULL REFERENCES canonical_cards(card_id) ON DELETE RESTRICT,
    subtype_code TEXT REFERENCES canonical_spell_subtypes(code) ON DELETE RESTRICT
) STRICT;

CREATE TABLE canonical_trap_structure (
    card_id TEXT PRIMARY KEY NOT NULL REFERENCES canonical_cards(card_id) ON DELETE RESTRICT,
    subtype_code TEXT REFERENCES canonical_trap_subtypes(code) ON DELETE RESTRICT
) STRICT;

CREATE TABLE canonical_localized_text (
    card_id TEXT NOT NULL REFERENCES canonical_cards(card_id) ON DELETE RESTRICT,
    language TEXT NOT NULL CHECK (language IN ('EN', 'ES', 'JP')),
    name TEXT,
    card_text TEXT,
    pendulum_text TEXT,
    PRIMARY KEY (card_id, language)
) STRICT;

CREATE TABLE canonical_classification_state (
    card_id TEXT PRIMARY KEY NOT NULL REFERENCES canonical_cards(card_id) ON DELETE RESTRICT,
    effect_reviewed INTEGER NOT NULL DEFAULT 0 CHECK (effect_reviewed IN (0, 1))
) STRICT;

CREATE TABLE canonical_card_archetypes (
    card_id TEXT NOT NULL REFERENCES canonical_cards(card_id) ON DELETE RESTRICT,
    archetype_id TEXT NOT NULL REFERENCES canonical_archetypes(archetype_id) ON DELETE RESTRICT,
    PRIMARY KEY (card_id, archetype_id)
) STRICT;

CREATE INDEX idx_canonical_card_archetypes_archetype
    ON canonical_card_archetypes(archetype_id, card_id);

CREATE TABLE canonical_card_effect_classifiers (
    card_id TEXT NOT NULL REFERENCES canonical_cards(card_id) ON DELETE RESTRICT,
    classifier_id TEXT NOT NULL REFERENCES canonical_effect_classifiers(classifier_id) ON DELETE RESTRICT,
    PRIMARY KEY (card_id, classifier_id)
) STRICT;

CREATE INDEX idx_canonical_card_effect_classifiers_classifier
    ON canonical_card_effect_classifiers(classifier_id, card_id);

CREATE TABLE canonical_card_functional_tags (
    card_id TEXT NOT NULL REFERENCES canonical_cards(card_id) ON DELETE RESTRICT,
    tag_id TEXT NOT NULL REFERENCES canonical_functional_tags(tag_id) ON DELETE RESTRICT,
    PRIMARY KEY (card_id, tag_id)
) STRICT;

CREATE INDEX idx_canonical_card_functional_tags_tag
    ON canonical_card_functional_tags(tag_id, card_id);

CREATE TABLE canonical_card_relations (
    relation_id TEXT PRIMARY KEY NOT NULL CHECK (length(trim(relation_id)) > 0),
    source_card_id TEXT NOT NULL REFERENCES canonical_cards(card_id) ON DELETE RESTRICT,
    target_card_id TEXT NOT NULL REFERENCES canonical_cards(card_id) ON DELETE RESTRICT,
    relation_type_code TEXT NOT NULL REFERENCES canonical_relation_types(code) ON DELETE RESTRICT,
    note TEXT,
    UNIQUE (source_card_id, target_card_id, relation_type_code)
) STRICT;

CREATE INDEX idx_canonical_card_relations_source
    ON canonical_card_relations(source_card_id);

CREATE INDEX idx_canonical_card_relations_target
    ON canonical_card_relations(target_card_id);

CREATE TABLE canonical_block_states (
    card_id TEXT NOT NULL REFERENCES canonical_cards(card_id) ON DELETE RESTRICT,
    block_key TEXT NOT NULL CHECK (
        block_key IN ('STRUCTURE', 'TEXT:EN', 'TEXT:ES', 'TEXT:JP', 'CLASSIFICATION', 'RELATIONS')
    ),
    state TEXT NOT NULL CHECK (state IN ('DRAFT', 'CONFIRMED')),
    provenance_id INTEGER REFERENCES canonical_provenance(provenance_id) ON DELETE RESTRICT,
    PRIMARY KEY (card_id, block_key)
) STRICT;
