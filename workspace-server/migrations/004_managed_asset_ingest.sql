CREATE TABLE managed_assets (
    managed_asset_id TEXT PRIMARY KEY NOT NULL CHECK (length(trim(managed_asset_id)) > 0),
    variant_id TEXT NOT NULL REFERENCES art_variants(variant_id) ON DELETE RESTRICT,
    role TEXT NOT NULL CHECK (role IN ('BS', 'BG', 'OF')),
    managed_relative_path TEXT NOT NULL UNIQUE CHECK (
        length(trim(managed_relative_path)) > 0
        AND managed_relative_path LIKE 'Assets/Managed/%'
        AND managed_relative_path NOT LIKE '/%'
        AND instr(managed_relative_path, char(92)) = 0
    ),
    content_hash TEXT NOT NULL CHECK (
        length(content_hash) = 64
        AND content_hash NOT GLOB '*[^0-9a-f]*'
    ),
    original_file_name TEXT NOT NULL CHECK (length(trim(original_file_name)) > 0),
    extension TEXT NOT NULL CHECK (extension IN ('png', 'jpg', 'jpeg', 'bmp')),
    created_at TEXT NOT NULL,
    UNIQUE (variant_id, role)
) STRICT;

CREATE INDEX idx_managed_assets_variant
    ON managed_assets(variant_id, role);

CREATE TABLE managed_asset_ingest_requests (
    idempotency_key TEXT PRIMARY KEY NOT NULL CHECK (
        length(trim(idempotency_key)) > 0
        AND length(idempotency_key) <= 256
    ),
    request_fingerprint TEXT NOT NULL CHECK (
        length(request_fingerprint) = 64
        AND request_fingerprint NOT GLOB '*[^0-9a-f]*'
    ),
    managed_asset_id TEXT NOT NULL REFERENCES managed_assets(managed_asset_id) ON DELETE RESTRICT,
    created_at TEXT NOT NULL
) STRICT;

CREATE INDEX idx_managed_asset_ingest_requests_asset
    ON managed_asset_ingest_requests(managed_asset_id);
