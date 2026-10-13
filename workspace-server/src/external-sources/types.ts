export const YGORESOURCES_SOURCE = 'YGORESOURCES_CARD_DB' as const;
export const SOURCE_REGISTRY = Object.freeze({
    source_code: YGORESOURCES_SOURCE,
    display_name: 'YGOResources Card Database',
    adapter: 'YgoResourcesCardAdapter',
    adapter_version: 1,
    retrieval_mode: 'EXACT_CARD_ID',
    supported_candidate_locales: ['EN', 'ES', 'JP'],
});
export type Block = 'STRUCTURE' | 'TEXT:EN' | 'TEXT:ES' | 'TEXT:JP';
export type Evidence = {
    document_id: string;
    locale: string | null;
    source_path: string;
};
export type Claim = { evidence: Evidence } & (
    | { state: 'PRESENT'; value: string | number | string[] | null }
    | { state: 'ABSENT' }
    | { state: 'UNMAPPED' | 'INVALID'; raw_value?: unknown }
);
export type Diagnostic = {
    diagnostic_id: string;
    severity: 'INFO' | 'WARNING' | 'ERROR';
    stage: 'RETRIEVAL' | 'PARSER' | 'NORMALIZATION';
    code: string;
    block: Block | null;
    field: string | null;
    locale: string | null;
    message: string;
};
export type Candidate = {
    candidate_schema_version: 1;
    authoritative: false;
    identity: {
        source_code: typeof YGORESOURCES_SOURCE;
        external_record_key: string;
    };
    blocks: Record<Block, { fields: Record<string, Claim> }>;
};
export type DocumentStatus =
    | 'SUCCESS'
    | 'NOT_FOUND'
    | 'REMOTE_ERROR'
    | 'TIMEOUT'
    | 'REDIRECT_REJECTED'
    | 'PAYLOAD_TOO_LARGE'
    | 'CONTENT_TYPE_UNSUPPORTED'
    | 'INVALID_JSON';
export type SourceDocument = {
    document_id: string;
    document_kind: 'CARD_JSON';
    source_ref: string;
    status: DocumentStatus;
    http_status: number | null;
    content_type: string | null;
    payload_hash: string | null;
    raw_payload: string | null;
    source_cache_revision: string | null;
    error_code: string | null;
    error_message: string | null;
};
export type Retrieval = {
    retrieval_id: string;
    source_record_id: string;
    source_code: typeof YGORESOURCES_SOURCE;
    external_record_key: string;
    target_card_id: string;
    target_expected_revision: string;
    adapter_version: number;
    status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
    error_code: string | null;
    error_message: string | null;
    retrieved_at: string;
};
export type StoredCandidate = {
    candidate_id: string;
    retrieval_id: string;
    candidate_schema_version: number;
    normalizer_version: number;
    candidate: Candidate;
    diagnostics: Diagnostic[];
    created_at: string;
};
export type RetrievalDetail = {
    retrieval: Retrieval;
    document: Omit<SourceDocument, 'raw_payload'> & {
        raw_payload?: string | null;
    };
    candidate: StoredCandidate | null;
};
export type Target = {
    target_card_id: string;
    target_expected_revision: string;
};
export type RetrieveRequest = Target & { external_card_id: string };
export type DiffStatus =
    | 'SAME'
    | 'SOURCE_ONLY'
    | 'CANONICAL_ONLY'
    | 'DIFFERENT'
    | 'UNMAPPED'
    | 'INVALID';
export type CandidateDiff = Target & {
    candidate_id: string;
    authoritative: false;
    read_only: true;
    groups: Array<{
        block: Block;
        fields: Array<{
            field: string;
            status: DiffStatus;
            source: Claim;
            canonical_value: unknown;
        }>;
    }>;
};
