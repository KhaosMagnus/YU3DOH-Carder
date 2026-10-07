export type WorkspaceBridgeComposition = 'STANDARD' | 'OVERFRAME';
export type WorkspaceBridgeLanguage = 'EN' | 'ES' | 'JP';

export type WorkspaceBridgeSession = {
    cardId: string;
    variantId: string;
    composition: WorkspaceBridgeComposition;
    contentLanguage: WorkspaceBridgeLanguage;
    revision: string;
    preparedAt: string;
    provenance: 'workspace-prepare';
};

let activeSession: WorkspaceBridgeSession | null = null;

export const getWorkspaceBridgeSession = (): WorkspaceBridgeSession | null => activeSession;

export const setWorkspaceBridgeSession = (session: WorkspaceBridgeSession | null) => {
    activeSession = session;
};

export const createWorkspaceBridgeSession = (
    input: Omit<WorkspaceBridgeSession, 'preparedAt' | 'provenance'> & {
        preparedAt?: string;
    },
): WorkspaceBridgeSession => ({
    cardId: input.cardId,
    variantId: input.variantId,
    composition: input.composition,
    contentLanguage: input.contentLanguage,
    revision: input.revision,
    preparedAt: input.preparedAt ?? new Date().toISOString(),
    provenance: 'workspace-prepare',
});
