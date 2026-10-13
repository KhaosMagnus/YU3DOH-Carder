CREATE TABLE external_source_records (
    source_record_id TEXT PRIMARY KEY NOT NULL CHECK (length(trim(source_record_id)) > 0),
    source_code TEXT NOT NULL CHECK (length(trim(source_code)) > 0),
    external_record_key TEXT NOT NULL CHECK (length(trim(external_record_key)) > 0),
    created_at TEXT NOT NULL CHECK (length(trim(created_at)) > 0),
    updated_at TEXT NOT NULL CHECK (length(trim(updated_at)) > 0),
    UNIQUE (source_code, external_record_key)
) STRICT;

CREATE TABLE external_source_retrievals (
    retrieval_id TEXT PRIMARY KEY NOT NULL CHECK (length(trim(retrieval_id)) > 0),
    source_record_id TEXT NOT NULL REFERENCES external_source_records(source_record_id) ON DELETE RESTRICT,
    target_card_id TEXT NOT NULL REFERENCES canonical_cards(card_id) ON DELETE RESTRICT,
    target_expected_revision TEXT NOT NULL CHECK (length(trim(target_expected_revision)) > 0),
    adapter_version INTEGER NOT NULL CHECK (adapter_version > 0),
    status TEXT NOT NULL CHECK (status IN ('SUCCESS', 'PARTIAL', 'FAILED')),
    error_code TEXT,
    error_message TEXT,
    retrieved_at TEXT NOT NULL CHECK (length(trim(retrieved_at)) > 0),
    CHECK ((status <> 'FAILED' AND error_code IS NULL) OR status = 'FAILED')
) STRICT;

CREATE INDEX idx_external_retrievals_source_history
ON external_source_retrievals(source_record_id, retrieved_at DESC, retrieval_id DESC);
CREATE INDEX idx_external_retrievals_target_history
ON external_source_retrievals(target_card_id, retrieved_at DESC, retrieval_id DESC);

CREATE TABLE external_source_documents (
    document_id TEXT PRIMARY KEY NOT NULL CHECK (length(trim(document_id)) > 0),
    retrieval_id TEXT NOT NULL REFERENCES external_source_retrievals(retrieval_id) ON DELETE RESTRICT,
    document_kind TEXT NOT NULL CHECK (document_kind = 'CARD_JSON'),
    source_ref TEXT NOT NULL CHECK (length(trim(source_ref)) > 0),
    status TEXT NOT NULL CHECK (status IN (
        'SUCCESS', 'NOT_FOUND', 'REMOTE_ERROR', 'TIMEOUT', 'REDIRECT_REJECTED',
        'PAYLOAD_TOO_LARGE', 'CONTENT_TYPE_UNSUPPORTED', 'INVALID_JSON'
    )),
    http_status INTEGER CHECK (http_status IS NULL OR (http_status >= 100 AND http_status <= 599)),
    content_type TEXT,
    payload_hash TEXT CHECK (payload_hash IS NULL OR (length(payload_hash) = 64 AND payload_hash = lower(payload_hash))),
    raw_payload TEXT,
    source_cache_revision TEXT CHECK (source_cache_revision IS NULL OR (
        length(source_cache_revision) > 0 AND source_cache_revision NOT GLOB '*[^0-9]*'
    )),
    error_code TEXT,
    error_message TEXT,
    UNIQUE (retrieval_id, document_kind),
    CHECK (status <> 'SUCCESS' OR (
        http_status >= 200 AND http_status <= 299 AND content_type IS NOT NULL
        AND payload_hash IS NOT NULL AND raw_payload IS NOT NULL AND error_code IS NULL
    ))
) STRICT;

CREATE TABLE external_source_candidates (
    candidate_id TEXT PRIMARY KEY NOT NULL CHECK (length(trim(candidate_id)) > 0),
    retrieval_id TEXT NOT NULL UNIQUE REFERENCES external_source_retrievals(retrieval_id) ON DELETE RESTRICT,
    candidate_schema_version INTEGER NOT NULL CHECK (candidate_schema_version > 0),
    normalizer_version INTEGER NOT NULL CHECK (normalizer_version > 0),
    candidate_json TEXT NOT NULL CHECK (length(trim(candidate_json)) > 0),
    diagnostics_json TEXT NOT NULL CHECK (length(trim(diagnostics_json)) > 0),
    created_at TEXT NOT NULL CHECK (length(trim(created_at)) > 0)
) STRICT;
