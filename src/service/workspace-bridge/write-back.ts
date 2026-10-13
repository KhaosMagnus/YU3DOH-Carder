import type { InternalCard } from 'src/model';
import type { WorkspaceBridgeSession, WriteResult } from './session';
import { classifyWrite } from './write-projection';
export class WriteBackError extends Error {
    constructor(
        readonly code: string,
        message: string,
    ) {
        super(message);
    }
}
export const saveToWorkspace = async (
    session: WorkspaceBridgeSession,
    card: InternalCard,
    acknowledged: string[],
    request: typeof fetch = fetch,
): Promise<WriteResult> => {
    const state = session.write;
    if (!state || state.stale)
        throw new WriteBackError(
            'NO_WORKSPACE_CARDER_SESSION',
            'Reopen explicitly from Workspace to obtain a writable session.',
        );
    if (state.inFlight)
        throw new WriteBackError(
            'WRITE_IN_FLIGHT',
            'A save is already in progress.',
        );
    const classification = classifyWrite(session, card);
    if (classification.unsupported.length)
        throw new WriteBackError(
            'UNSUPPORTED_WRITE_FIELD',
            classification.unsupported.join(', '),
        );
    state.inFlight = true;
    try {
        const response = await request('/api/v1/carder/write-back', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                write_grant: state.grant,
                card_id: session.cardId,
                expected_revision: session.revision,
                content_language: session.contentLanguage,
                projection: classification.projection,
                acknowledge_move_to_draft: acknowledged,
            }),
        });
        const payload = await response.json();
        if (!response.ok) {
            if (
                [
                    'REVISION_CONFLICT',
                    'NO_WORKSPACE_CARDER_SESSION',
                    'SESSION_IDENTITY_MISMATCH',
                ].includes(payload.code)
            )
                state.stale = true;
            throw new WriteBackError(
                payload.code ?? `HTTP_${response.status}`,
                payload.message ?? 'Workspace save failed.',
            );
        }
        const result = payload as WriteResult;
        session.revision = result.revision;
        state.grant = result.write_grant;
        state.baseline = { ...classification.projection };
        result.moved_to_draft.forEach((k) => {
            state.confirmations[k] = 'DRAFT';
        });
        state.lastResult = result;
        return result;
    } finally {
        state.inFlight = false;
    }
};
