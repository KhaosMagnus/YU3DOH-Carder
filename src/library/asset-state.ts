import type {
    LibraryNeedsAttentionItem,
    LibraryNeedsAttentionResponse,
    LibraryVariantDetail,
    SlotState,
} from './model';

/** Presentational only — never recompute readiness from roles. */
export const readinessLabel = (state: 'READY' | 'INCOMPLETE') => state;

export const slotStateLabel = (state: SlotState): string => {
    switch (state) {
        case 'EMPTY': return 'Empty';
        case 'BOUND': return 'Bound';
        case 'CONFLICT': return 'Conflict';
        case 'MISSING': return 'Missing source';
        case 'INVALID': return 'Invalid';
        default: return state;
    }
};

export const ownershipLabel = (ownership: 'managed' | 'unmanaged') =>
    ownership === 'managed' ? 'Managed' : 'Indexed / unmanaged';

export type NeedsAttentionPresentation =
    | { kind: 'not-scanned' }
    | { kind: 'clean'; scan: NonNullable<LibraryNeedsAttentionResponse['latest_scan']> }
    | { kind: 'issues'; scan: NonNullable<LibraryNeedsAttentionResponse['latest_scan']>; items: LibraryNeedsAttentionItem[] };

/** no-scan-yet ≠ clean (diagnostic_count 0 with a completed scan). */
export const presentNeedsAttention = (
    response: LibraryNeedsAttentionResponse | null,
): NeedsAttentionPresentation | null => {
    if (!response) return null;
    if (!response.latest_scan) return { kind: 'not-scanned' };
    if (response.latest_scan.diagnostic_count === 0 || response.items.length === 0) {
        return { kind: 'clean', scan: response.latest_scan };
    }
    return { kind: 'issues', scan: response.latest_scan, items: response.items };
};

export const filterDiagnosticsByCode = (
    items: LibraryNeedsAttentionItem[],
    code: string,
): LibraryNeedsAttentionItem[] => {
    const trimmed = code.trim();
    if (!trimmed) return items;
    return items.filter(item => item.code === trimmed);
};

export const uniqueDiagnosticCodes = (items: LibraryNeedsAttentionItem[]): string[] =>
    [...new Set(items.map(item => item.code))].sort((a, b) => a.localeCompare(b));

/** Stable idempotency key for one submit/retry cycle. Fresh operation → new key. */
export const createIngestIdempotencyKey = (): string => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return `ingest-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export type IngestKeyCycle = {
    key: string;
    /** Reuse the same key for retries of this submission. */
    current: () => string;
    /** Start a fresh user-initiated ingest operation. */
    refresh: () => string;
};

export const createIngestKeyCycle = (): IngestKeyCycle => {
    let key = createIngestIdempotencyKey();
    return {
        get key() { return key; },
        current: () => key,
        refresh: () => {
            key = createIngestIdempotencyKey();
            return key;
        },
    };
};

/** Display server readiness as-is; do not derive from role occupancy. */
export const variantReadinessTags = (variant: LibraryVariantDetail) => ({
    standard: variant.standard.state,
    standardSources: variant.standard.sources,
    overframe: variant.overframe.state,
    overframeSources: variant.overframe.sources,
});
