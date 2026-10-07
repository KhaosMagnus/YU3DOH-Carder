import { WorkspaceBridgeError } from './errors';
import type { WorkspaceBridgeComposition, WorkspaceBridgeLanguage } from './session';

export type WorkspaceBridgeIntent = {
    cardId: string;
    variantId: string;
    composition: WorkspaceBridgeComposition;
    contentLanguage: WorkspaceBridgeLanguage;
    revision: string;
};

const COMPOSITIONS = new Set(['STANDARD', 'OVERFRAME']);
const LANGUAGES = new Set(['EN', 'ES', 'JP']);

export const WORKSPACE_INTENT_KEYS = [
    'ws_card_id',
    'ws_variant_id',
    'ws_composition',
    'ws_lang',
    'ws_revision',
] as const;

export const buildWorkspaceIntentSearchParams = (intent: WorkspaceBridgeIntent): URLSearchParams => {
    const params = new URLSearchParams();
    params.set('ws_card_id', intent.cardId);
    params.set('ws_variant_id', intent.variantId);
    params.set('ws_composition', intent.composition);
    params.set('ws_lang', intent.contentLanguage);
    params.set('ws_revision', intent.revision);
    return params;
};

export const buildWorkspaceIntentUrl = (
    baseUrl: string,
    intent: WorkspaceBridgeIntent,
): string => {
    const url = new URL(baseUrl, 'http://localhost');
    const params = buildWorkspaceIntentSearchParams(intent);
    for (const key of WORKSPACE_INTENT_KEYS) {
        url.searchParams.set(key, params.get(key) ?? '');
    }
    // Drop forbidden payload carriers when constructing bridge URLs.
    url.searchParams.delete('data');
    const query = url.searchParams.toString();
    const path = baseUrl.split('?')[0] ?? baseUrl;
    return query ? `${path}?${query}` : path;
};

export const hasWorkspaceIntent = (search: string | URLSearchParams): boolean => {
    const params = typeof search === 'string' ? new URLSearchParams(search) : search;
    return WORKSPACE_INTENT_KEYS.every(key => {
        const value = params.get(key);
        return typeof value === 'string' && value.length > 0;
    });
};

export const parseWorkspaceIntent = (search: string | URLSearchParams): WorkspaceBridgeIntent => {
    const params = typeof search === 'string' ? new URLSearchParams(search) : search;
    if (!hasWorkspaceIntent(params)) {
        throw new WorkspaceBridgeError(
            'BRIDGE_INTENT_INVALID',
            'Workspace bridge intent parameters are missing or incomplete.',
        );
    }
    const composition = params.get('ws_composition') ?? '';
    const language = params.get('ws_lang') ?? '';
    if (!COMPOSITIONS.has(composition)) {
        throw new WorkspaceBridgeError(
            'BRIDGE_INTENT_INVALID',
            `Unsupported ws_composition value: ${composition}`,
        );
    }
    if (!LANGUAGES.has(language)) {
        throw new WorkspaceBridgeError(
            'BRIDGE_INTENT_INVALID',
            `Unsupported ws_lang value: ${language}`,
        );
    }
    return {
        cardId: params.get('ws_card_id')!,
        variantId: params.get('ws_variant_id')!,
        composition: composition as WorkspaceBridgeComposition,
        contentLanguage: language as WorkspaceBridgeLanguage,
        revision: params.get('ws_revision')!,
    };
};
