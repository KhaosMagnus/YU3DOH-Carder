const statuses: Record<string, number> = {
    SOURCE_PUBLICATION_FAILED: 500,
    SOURCE_ADAPTER_DISABLED: 403,
    SOURCE_CARD_ID_INVALID: 422,
    SOURCE_DOCUMENT_NOT_FOUND: 404,
    SOURCE_RETRIEVAL_FAILED: 502,
    SOURCE_TIMEOUT: 504,
    SOURCE_REDIRECT_REJECTED: 502,
    SOURCE_PAYLOAD_TOO_LARGE: 413,
    SOURCE_CONTENT_TYPE_UNSUPPORTED: 502,
    SOURCE_PARSE_FAILED: 502,
    SOURCE_IDENTITY_MISMATCH: 422,
    CANDIDATE_NORMALIZATION_FAILED: 422,
    REVISION_CONFLICT: 409,
    CANDIDATE_TARGET_MISMATCH: 409,
    NOT_FOUND: 404,
    WORKSPACE_NOT_READY: 503,
    WORKSPACE_MAINTENANCE_ACTIVE: 409,
    INVALID_REQUEST: 400,
};
export class ExternalSourceError extends Error {
    readonly statusCode: number;
    constructor(
        readonly code: string,
        message: string,
        readonly retrieval_id?: string,
    ) {
        super(message);
        this.name = 'ExternalSourceError';
        this.statusCode = statuses[code] ?? 500;
    }
}
