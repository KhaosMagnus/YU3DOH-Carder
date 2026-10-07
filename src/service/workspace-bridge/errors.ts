export type WorkspaceBridgeErrorCode =
    | 'CARDER_MAPPING_UNSUPPORTED'
    | 'CARDER_PREPARATION_NOT_READY'
    | 'ASSET_STALE'
    | 'REVISION_CONFLICT'
    | 'NOT_FOUND'
    | 'WORKSPACE_NOT_READY'
    | 'BRIDGE_INTENT_INVALID'
    | 'BRIDGE_LAUNCH_ABORTED';

export class WorkspaceBridgeError extends Error {
    constructor(
        public readonly code: WorkspaceBridgeErrorCode,
        message: string,
    ) {
        super(message);
        this.name = 'WorkspaceBridgeError';
    }
}
