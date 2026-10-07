import type { InternalCard } from 'src/model';
import { WorkspaceBridgeError } from './errors';
import {
    hasWorkspaceIntent,
    parseWorkspaceIntent,
    type WorkspaceBridgeIntent,
} from './intent';
import type { PrepareWorkingCardDto } from './mapping-matrix';
import type { PrepareWorkingCardResult } from './prepare-working-card';
import type { WorkspaceBridgeSession } from './session';

export type StartupDeps = {
    search: string;
    retrieveSavedCard: () => Promise<InternalCard>;
    fetchPrepare: (intent: WorkspaceBridgeIntent) => Promise<PrepareWorkingCardDto>;
    prepare: (dto: PrepareWorkingCardDto) => PrepareWorkingCardResult;
};

export type StartupOutcome =
    | { kind: 'LEGACY'; card: InternalCard }
    | { kind: 'WORKSPACE'; card: InternalCard; session: WorkspaceBridgeSession }
    | { kind: 'WORKSPACE_FAILED'; error: WorkspaceBridgeError };

export const runCarderStartup = async (deps: StartupDeps): Promise<StartupOutcome> => {
    if (!hasWorkspaceIntent(deps.search)) {
        const card = await deps.retrieveSavedCard();
        return { kind: 'LEGACY', card };
    }

    try {
        const intent = parseWorkspaceIntent(deps.search);
        const dto = await deps.fetchPrepare(intent);
        const { card, session } = deps.prepare(dto);
        return { kind: 'WORKSPACE', card, session };
    } catch (failure) {
        const error = failure instanceof WorkspaceBridgeError
            ? failure
            : new WorkspaceBridgeError(
                'BRIDGE_LAUNCH_ABORTED',
                failure instanceof Error ? failure.message : 'Workspace bridge failed.',
            );
        return { kind: 'WORKSPACE_FAILED', error };
    }
};
