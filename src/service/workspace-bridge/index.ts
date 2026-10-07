export { WorkspaceBridgeError } from './errors';
export {
    buildCarderLaunchUrl,
    buildWorkspaceIntentSearchParams,
    buildWorkspaceIntentUrl,
    hasWorkspaceIntent,
    parseWorkspaceIntent,
    WORKSPACE_INTENT_KEYS,
    type WorkspaceBridgeIntent,
} from './intent';
export {
    prepareWorkingCard,
    type PrepareWorkingCardResult,
} from './prepare-working-card';
export type { PrepareWorkingCardDto } from './mapping-matrix';
export {
    createWorkspaceBridgeSession,
    getWorkspaceBridgeSession,
    setWorkspaceBridgeSession,
    type WorkspaceBridgeSession,
} from './session';
export {
    runCarderStartup,
    type StartupDeps,
    type StartupOutcome,
} from './startup';

export { fetchPrepareWorkingCard } from './fetch-prepare';
