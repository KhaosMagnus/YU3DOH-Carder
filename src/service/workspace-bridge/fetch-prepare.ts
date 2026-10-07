import type { PrepareWorkingCardDto } from './mapping-matrix';
import type { WorkspaceBridgeIntent } from './intent';
import { WorkspaceBridgeError } from './errors';

export const fetchPrepareWorkingCard = async (
    intent: WorkspaceBridgeIntent,
    signal?: AbortSignal,
): Promise<PrepareWorkingCardDto> => {
    const response = await fetch('/api/v1/carder/prepare-working-card', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            card_id: intent.cardId,
            variant_id: intent.variantId,
            composition: intent.composition,
            content_language: intent.contentLanguage,
            expected_revision: intent.revision,
        }),
        signal,
    });
    if (!response.ok) {
        const payload = await response.json().catch(() => null) as { code?: string; message?: string } | null;
        const code = payload?.code ?? `HTTP_${response.status}`;
        const message = payload?.message ?? `Prepare failed with HTTP ${response.status}.`;
        if (code === 'WORKSPACE_NOT_READY') {
            throw new WorkspaceBridgeError('WORKSPACE_NOT_READY', message);
        }
        if (code === 'CARDER_PREPARATION_NOT_READY') {
            throw new WorkspaceBridgeError('CARDER_PREPARATION_NOT_READY', message);
        }
        if (code === 'CARDER_MAPPING_UNSUPPORTED') {
            throw new WorkspaceBridgeError('CARDER_MAPPING_UNSUPPORTED', message);
        }
        if (code === 'REVISION_CONFLICT') {
            throw new WorkspaceBridgeError('REVISION_CONFLICT', message);
        }
        if (code === 'ASSET_STALE') {
            throw new WorkspaceBridgeError('ASSET_STALE', message);
        }
        if (code === 'NOT_FOUND' || response.status === 404) {
            throw new WorkspaceBridgeError('NOT_FOUND', message);
        }
        throw new WorkspaceBridgeError('CARDER_PREPARATION_NOT_READY', message);
    }
    return await response.json() as PrepareWorkingCardDto;
};
