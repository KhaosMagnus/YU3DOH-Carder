export type SourceClaim = {
    evidence: {
        document_id: string;
        locale: 'EN' | 'ES' | 'JP' | null;
        source_path: string;
        source_paths?: string[];
    };
} & (
    | { state: 'PRESENT'; value: unknown }
    | { state: 'ABSENT' }
    | { state: 'UNMAPPED' | 'INVALID'; raw_value?: unknown }
);
export type ExternalRetrieval = {
    retrieval_id: string;
    source_record_id: string;
    source_code: string;
    external_record_key: string;
    target_card_id: string;
    target_expected_revision: string;
    adapter_version: number;
    status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
    error_code: string | null;
    error_message: string | null;
    retrieved_at: string;
};
export type ExternalHistory = {
    source: { source_code: string; display_name: string; enabled: boolean };
    retrievals: ExternalRetrieval[];
};
export type ExternalDetail = {
    retrieval: ExternalRetrieval;
    document: {
        document_id: string;
        document_kind: string;
        source_ref: string;
        status: string;
        http_status: number | null;
        content_type: string | null;
        payload_hash: string | null;
        source_cache_revision: string | null;
        error_code: string | null;
        error_message: string | null;
        raw_payload?: string | null;
    };
    candidate: {
        candidate_id: string;
        candidate_schema_version: number;
        normalizer_version: number;
        created_at: string;
        candidate: {
            candidate_schema_version: number;
            authoritative: false;
            identity: { source_code: string; external_record_key: string };
            blocks: Record<string, { fields: Record<string, SourceClaim> }>;
        };
        diagnostics: Array<{
            diagnostic_id: string;
            severity: string;
            stage: string;
            code: string;
            block: string | null;
            field: string | null;
            locale: 'EN' | 'ES' | 'JP' | null;
            message: string;
        }>;
    } | null;
};
export type ExternalDiff = {
    candidate_id: string;
    target_card_id: string;
    target_expected_revision: string;
    authoritative: false;
    read_only: true;
    groups: Array<{
        block: string;
        fields: Array<{
            field: string;
            status: string;
            source: SourceClaim;
            canonical_value: unknown;
        }>;
    }>;
};
export const validExternalCardId = (value: string) =>
    value === value.trim() && /^[1-9][0-9]{0,19}$/.test(value);
export const claimText = (claim: SourceClaim) =>
    claim.state === 'PRESENT' ? JSON.stringify(claim.value) : claim.state;
