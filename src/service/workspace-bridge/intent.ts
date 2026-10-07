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

const FIELD_LABEL: Record<(typeof WORKSPACE_INTENT_KEYS)[number], string> = {
    ws_card_id: 'card ID',
    ws_variant_id: 'Variant ID',
    ws_composition: 'composition',
    ws_lang: 'language',
    ws_revision: 'revision',
};

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

/** Normalize base so it starts and ends with `/`. */
const normalizeCarderBase = (baseUrl: string): string => {
    if (!baseUrl || baseUrl === '/') return '/';
    let base = baseUrl;
    if (!base.startsWith('/')) base = `/${base}`;
    if (!base.endsWith('/')) base = `${base}/`;
    return base;
};

/**
 * Production Carder launch URL from Vite BASE_URL / PUBLIC_PATH semantics.
 * Example: base `/ygocarder/` → `/ygocarder/?ws_...`
 */
export const buildCarderLaunchUrl = (
    baseUrl: string,
    intent: WorkspaceBridgeIntent,
): string => {
    const base = normalizeCarderBase(baseUrl);
    const query = buildWorkspaceIntentSearchParams(intent).toString();
    return `${base}?${query}`;
};

/**
 * Any key whose name starts with `ws_` counts as Workspace intent
 * (even if the value is empty). Zero `ws_*` keys → legacy.
 */
export const hasWorkspaceIntent = (search: string | URLSearchParams): boolean => {
    const params = typeof search === 'string' ? new URLSearchParams(search) : search;
    for (const key of params.keys()) {
        if (key.startsWith('ws_')) return true;
    }
    return false;
};

export const parseWorkspaceIntent = (search: string | URLSearchParams): WorkspaceBridgeIntent => {
    const params = typeof search === 'string' ? new URLSearchParams(search) : search;

    // Unknown ws_* keys are invalid (Design S-7).
    for (const key of params.keys()) {
        if (key.startsWith('ws_') && !(WORKSPACE_INTENT_KEYS as readonly string[]).includes(key)) {
            throw new WorkspaceBridgeError(
                'BRIDGE_INTENT_INVALID',
                `Unknown workspace intent key: ${key}`,
            );
        }
    }

    for (const key of WORKSPACE_INTENT_KEYS) {
        const values = params.getAll(key);
        if (values.length === 0) {
            throw new WorkspaceBridgeError(
                'BRIDGE_INTENT_INVALID',
                `Workspace bridge intent missing ${FIELD_LABEL[key]} (${key}).`,
            );
        }
        if (values.length > 1) {
            throw new WorkspaceBridgeError(
                'BRIDGE_INTENT_INVALID',
                `Workspace bridge intent duplicate ${FIELD_LABEL[key]} (${key}).`,
            );
        }
        const value = values[0] ?? '';
        if (value.length === 0) {
            throw new WorkspaceBridgeError(
                'BRIDGE_INTENT_INVALID',
                `Workspace bridge intent missing ${FIELD_LABEL[key]} (${key}).`,
            );
        }
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
