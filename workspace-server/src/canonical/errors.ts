export type CanonicalDomainErrorCode =
    | 'NOT_FOUND'
    | 'DOMAIN_VALIDATION'
    | 'REVISION_CONFLICT';

export class CanonicalDomainError extends Error {
    constructor(
        public readonly code: CanonicalDomainErrorCode,
        message: string,
    ) {
        super(message);
        this.name = 'CanonicalDomainError';
    }
}
