export type CarderPrepareErrorCode =
    | 'CARDER_PREPARATION_NOT_READY'
    | 'CARDER_MAPPING_UNSUPPORTED'
    | 'ASSET_STALE'
    | 'NOT_FOUND'
    | 'REVISION_CONFLICT';

export class CarderPrepareError extends Error {
    constructor(
        public readonly code: CarderPrepareErrorCode,
        message: string,
    ) {
        super(message);
        this.name = 'CarderPrepareError';
    }
}
