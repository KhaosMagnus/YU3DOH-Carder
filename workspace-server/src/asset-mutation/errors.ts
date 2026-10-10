export class AssetMutationError extends Error {
    constructor(readonly code: string, message: string, readonly statusCode = 422) {
        super(message); this.name = 'AssetMutationError';
    }
}
