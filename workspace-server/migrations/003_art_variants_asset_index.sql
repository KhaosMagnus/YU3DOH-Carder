CREATE TABLE art_variants (
    variant_id TEXT PRIMARY KEY NOT NULL CHECK (length(trim(variant_id)) > 0),
    card_id TEXT NOT NULL REFERENCES canonical_cards(card_id) ON DELETE RESTRICT,
    variant_key TEXT NOT NULL CHECK (
        length(variant_key) > 0
        AND variant_key NOT GLOB '*[^a-z0-9_]*'
    ),
    display_label TEXT NOT NULL CHECK (length(trim(display_label)) > 0),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE (card_id, variant_key)
) STRICT;

CREATE INDEX idx_art_variants_card
    ON art_variants(card_id, variant_key);

CREATE TABLE asset_index_scans (
    scan_id TEXT PRIMARY KEY NOT NULL CHECK (length(trim(scan_id)) > 0),
    started_at TEXT NOT NULL,
    completed_at TEXT,
    status TEXT NOT NULL CHECK (status IN ('RUNNING', 'COMPLETE')),
    discovered_count INTEGER NOT NULL DEFAULT 0 CHECK (discovered_count >= 0),
    present_count INTEGER NOT NULL DEFAULT 0 CHECK (present_count >= 0),
    diagnostic_count INTEGER NOT NULL DEFAULT 0 CHECK (diagnostic_count >= 0)
) STRICT;

CREATE TABLE indexed_asset_files (
    asset_id TEXT PRIMARY KEY NOT NULL CHECK (length(trim(asset_id)) > 0),
    relative_path TEXT NOT NULL UNIQUE CHECK (
        length(trim(relative_path)) > 0
        AND relative_path NOT LIKE '/%'
        AND instr(relative_path, char(92)) = 0
    ),
    file_name TEXT NOT NULL CHECK (length(trim(file_name)) > 0),
    extension TEXT NOT NULL,
    size_bytes INTEGER NOT NULL CHECK (size_bytes >= 0),
    modified_time_ms REAL NOT NULL,
    content_hash TEXT,
    parsed_card_name TEXT,
    parsed_password TEXT,
    role TEXT CHECK (role IN ('BS', 'BG', 'OF')),
    variant_label TEXT,
    variant_key TEXT,
    association_state TEXT NOT NULL CHECK (
        association_state IN ('RESOLVED', 'UNRESOLVED', 'AMBIGUOUS', 'INVALID')
    ),
    card_id TEXT REFERENCES canonical_cards(card_id) ON DELETE RESTRICT,
    variant_id TEXT REFERENCES art_variants(variant_id) ON DELETE RESTRICT,
    image_width INTEGER CHECK (image_width IS NULL OR image_width > 0),
    image_height INTEGER CHECK (image_height IS NULL OR image_height > 0),
    has_transparency INTEGER CHECK (has_transparency IS NULL OR has_transparency IN (0, 1)),
    valid_asset INTEGER NOT NULL CHECK (valid_asset IN (0, 1)),
    present INTEGER NOT NULL CHECK (present IN (0, 1)),
    first_seen_scan_id TEXT NOT NULL REFERENCES asset_index_scans(scan_id) ON DELETE RESTRICT,
    last_seen_scan_id TEXT NOT NULL REFERENCES asset_index_scans(scan_id) ON DELETE RESTRICT,
    updated_at TEXT NOT NULL
) STRICT;

CREATE INDEX idx_indexed_asset_files_current
    ON indexed_asset_files(present, card_id, variant_key, role);

CREATE INDEX idx_indexed_asset_files_variant
    ON indexed_asset_files(variant_id, role, present, valid_asset);

CREATE TABLE variant_role_bindings (
    variant_id TEXT NOT NULL REFERENCES art_variants(variant_id) ON DELETE RESTRICT,
    role TEXT NOT NULL CHECK (role IN ('BS', 'BG', 'OF')),
    asset_id TEXT NOT NULL UNIQUE REFERENCES indexed_asset_files(asset_id) ON DELETE RESTRICT,
    PRIMARY KEY (variant_id, role)
) STRICT;

CREATE TABLE asset_index_diagnostics (
    diagnostic_id TEXT PRIMARY KEY NOT NULL CHECK (length(trim(diagnostic_id)) > 0),
    scan_id TEXT NOT NULL REFERENCES asset_index_scans(scan_id) ON DELETE RESTRICT,
    asset_id TEXT REFERENCES indexed_asset_files(asset_id) ON DELETE RESTRICT,
    relative_path TEXT NOT NULL CHECK (
        length(trim(relative_path)) > 0
        AND relative_path NOT LIKE '/%'
        AND instr(relative_path, char(92)) = 0
    ),
    code TEXT NOT NULL CHECK (
        code IN (
            'ASSETS_DIRECTORY_MISSING',
            'UNSAFE_LINK',
            'INVALID_FILENAME',
            'UNSUPPORTED_FORMAT',
            'INVALID_IMAGE',
            'INVALID_OF_TRANSPARENCY',
            'UNRESOLVED_CARD',
            'AMBIGUOUS_CARD',
            'ROLE_CONFLICT',
            'MISSING_SOURCE',
            'SOURCE_READ_ERROR'
        )
    ),
    message TEXT NOT NULL,
    created_at TEXT NOT NULL
) STRICT;

CREATE INDEX idx_asset_index_diagnostics_scan
    ON asset_index_diagnostics(scan_id, code, relative_path);
