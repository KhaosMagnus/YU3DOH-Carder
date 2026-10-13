import { SEMANTIC_BLOCKS, type LibraryCardDetail } from './model';

export type ProvenanceRecord = LibraryCardDetail['provenance'][number];
export type ProvenanceFilters = {
    targetKind: string;
    targetKey: string;
    sourceKind: string;
    search: string;
};
export const emptyProvenanceFilters = (): ProvenanceFilters => ({
    targetKind: '',
    targetKey: '',
    sourceKind: '',
    search: '',
});
export const provenanceSourceLabel = (kind: string) =>
    new Map([
        ['MANUAL', 'Manual'],
        ['CARDER_WRITE_BACK', 'Carder write-back'],
        ['LIBRARY_BATCH', 'Library batch'],
    ]).get(kind) ?? kind;
export const provenanceBlockLabel = (key: string) =>
    new Map([
        ['STRUCTURE', 'Structure'],
        ['TEXT:EN', 'English text (TEXT:EN)'],
        ['TEXT:ES', 'Spanish text (TEXT:ES)'],
        ['TEXT:JP', 'Japanese text (TEXT:JP)'],
        ['CLASSIFICATION', 'Classification'],
        ['RELATIONS', 'Relations'],
    ]).get(key) ?? key;
export const provenanceText = (text: string | null) => text ?? '—';
const timestamp = (text: string) => {
    const value = Date.parse(text);
    return Number.isFinite(value) ? value : null;
};
export const provenanceTimeLabel = (text: string) =>
    timestamp(text) === null
        ? 'Timestamp unavailable'
        : new Date(text).toLocaleString();
export const orderProvenance = (records: readonly ProvenanceRecord[]) =>
    [...records].sort((a, b) => {
        const ta = timestamp(a.created_at),
            tb = timestamp(b.created_at);
        // Keep a total, deterministic order: dated records first; unavailable dates use ID order.
        if (ta !== null && tb !== null && ta !== tb) return tb - ta;
        if (ta === null && tb !== null) return 1;
        if (tb === null && ta !== null) return -1;
        return b.provenance_id - a.provenance_id;
    });
export const provenanceOptions = (records: readonly ProvenanceRecord[]) => {
    const values = (key: 'target_kind' | 'target_key' | 'source_kind') =>
        [...new Set(records.map((row) => row[key]))].sort();
    return {
        targetKinds: values('target_kind'),
        targetKeys: values('target_key'),
        sourceKinds: values('source_kind'),
    };
};
export const filterProvenance = (
    records: readonly ProvenanceRecord[],
    filters: ProvenanceFilters,
) => {
    const search = filters.search.trim().toLowerCase();
    return orderProvenance(records).filter(
        (row) =>
            (!filters.targetKind || row.target_kind === filters.targetKind) &&
            (!filters.targetKey || row.target_key === filters.targetKey) &&
            (!filters.sourceKind || row.source_kind === filters.sourceKind) &&
            (!search ||
                [
                    row.source_kind,
                    row.source_ref,
                    row.note,
                    row.target_key,
                    row.target_kind,
                    String(row.provenance_id),
                ].some((value) => value?.toLowerCase().includes(search))),
    );
};
export const currentConfirmationBlocks = (
    detail: LibraryCardDetail,
    record: ProvenanceRecord,
) =>
    detail.confirmations
        .filter(
            (c) =>
                c.state === 'CONFIRMED' &&
                c.provenance_id === record.provenance_id,
        )
        .map((c) => c.block);
export const provenanceTargetContext = (
    detail: LibraryCardDetail,
    record: ProvenanceRecord,
) => {
    if (record.target_kind === 'BLOCK')
        return {
            kind: 'block' as const,
            label: 'Semantic block',
            key: record.target_key,
            blockLabel: provenanceBlockLabel(record.target_key),
            known: SEMANTIC_BLOCKS.some((block) => block === record.target_key),
            state:
                detail.confirmations.find((c) => c.block === record.target_key)
                    ?.state ?? null,
        };
    if (record.target_kind === 'RELATION') {
        const relation = detail.relations.find(
            (r) => r.relation_id === record.target_key,
        );
        return {
            kind: 'relation' as const,
            label: relation ? 'Current relation' : 'Historical relation',
            key: record.target_key,
            relation: relation ?? null,
        };
    }
    return {
        kind: 'generic' as const,
        label:
            record.target_kind === 'CARD' && record.target_key === 'IDENTITY'
                ? 'Card identity'
                : record.target_kind,
        key: record.target_key,
    };
};
