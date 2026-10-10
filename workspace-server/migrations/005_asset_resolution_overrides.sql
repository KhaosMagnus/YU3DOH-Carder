CREATE TABLE asset_resolution_overrides (
    asset_id TEXT PRIMARY KEY NOT NULL REFERENCES indexed_asset_files(asset_id) ON DELETE RESTRICT,
    disposition TEXT NOT NULL CHECK (disposition IN ('ASSIGN', 'UNASSIGN', 'IGNORE')),
    variant_id TEXT REFERENCES art_variants(variant_id) ON DELETE RESTRICT,
    role TEXT CHECK (role IN ('BS', 'BG', 'OF')),
    revision TEXT NOT NULL CHECK (length(revision) > 0),
    updated_at TEXT NOT NULL,
    CHECK (
        (disposition = 'ASSIGN' AND variant_id IS NOT NULL AND role IS NOT NULL)
        OR (disposition <> 'ASSIGN' AND variant_id IS NULL AND role IS NULL)
    )
) STRICT;
