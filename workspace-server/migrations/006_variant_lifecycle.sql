-- Workspace preference is independent of Canonical identity. No migration backfill.
CREATE UNIQUE INDEX idx_art_variants_card_identity ON art_variants(card_id, variant_id);
CREATE TABLE card_variant_preferences (
    card_id TEXT PRIMARY KEY NOT NULL REFERENCES canonical_cards(card_id) ON DELETE RESTRICT,
    preferred_variant_id TEXT,
    revision TEXT NOT NULL CHECK (length(revision) > 0),
    updated_at TEXT NOT NULL,
    FOREIGN KEY (card_id, preferred_variant_id)
        REFERENCES art_variants(card_id, variant_id) ON DELETE RESTRICT
) STRICT;
