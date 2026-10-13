import type { LibraryCardSummary } from './model';

export const BATCH_SELECTION_LIMIT = 200;
export type SelectedBatchCard = Pick<
    LibraryCardSummary,
    'card_id' | 'display_name' | 'family' | 'password' | 'display_language'
> & { expected_revision: string };
export type BatchSelection = Map<string, SelectedBatchCard>;
export type BatchOperation = {
    add_archetype_ids?: string[];
    remove_archetype_ids?: string[];
    add_effect_classifier_ids?: string[];
    remove_effect_classifier_ids?: string[];
    add_functional_tag_ids?: string[];
    remove_functional_tag_ids?: string[];
    set_effect_reviewed?: boolean;
};
export const BATCH_DIMENSIONS = [
    'archetype',
    'effect_classifier',
    'functional_tag',
] as const;
export type BatchRequest = {
    items: { card_id: string; expected_revision: string }[];
    operation: BatchOperation;
    note?: string;
};
export type BatchApplyRequest = BatchRequest & {
    acknowledge_move_to_draft_card_ids: string[];
};
export type BatchPreviewStatus =
    | 'WOULD_CHANGE'
    | 'CONFIRMED_REQUIRES_ACK'
    | 'NO_OP'
    | 'REVISION_CONFLICT'
    | 'DOMAIN_VALIDATION'
    | 'NOT_FOUND';
export type BatchApplyStatus =
    | 'SUCCESS'
    | 'NO_OP'
    | 'REVISION_CONFLICT'
    | 'DOMAIN_VALIDATION'
    | 'CONFIRMED_BLOCK_ACK_REQUIRED'
    | 'CONFIRMED_BLOCK_STATE_CHANGED'
    | 'NOT_FOUND';
export type BatchPreview = {
    preview_id: string;
    summary: Record<
        | 'selected'
        | 'would_change'
        | 'confirmed_requires_ack'
        | 'no_op'
        | 'revision_conflict'
        | 'domain_validation'
        | 'not_found',
        number
    >;
    results: {
        card_id: string;
        expected_revision: string;
        observed_revision: string | null;
        status: BatchPreviewStatus;
        changed: boolean;
        requires_move_to_draft: boolean;
        error_code: string | null;
        message: string | null;
    }[];
};
export type BatchResult = {
    batch_operation_id: string;
    summary: Record<
        | 'selected'
        | 'success'
        | 'no_op'
        | 'revision_conflict'
        | 'domain_validation'
        | 'confirmed_block_ack_required'
        | 'confirmed_block_state_changed'
        | 'not_found',
        number
    >;
    results: {
        card_id: string;
        expected_revision: string;
        previous_revision: string | null;
        revision: string | null;
        status: BatchApplyStatus;
        changed: boolean;
        moved_to_draft: boolean;
        error_code: string | null;
        message: string | null;
    }[];
};

const freezeCard = (card: LibraryCardSummary): SelectedBatchCard =>
    Object.freeze({
        card_id: card.card_id,
        expected_revision: card.revision,
        display_name: card.display_name,
        family: card.family,
        password: card.password,
        display_language: card.display_language,
    });
export const selectBatchCards = (
    selection: BatchSelection,
    cards: LibraryCardSummary[],
) => {
    const additions = cards.filter((card) => !selection.has(card.card_id));
    if (
        new Set([...selection.keys(), ...additions.map((card) => card.card_id)])
            .size > BATCH_SELECTION_LIMIT
    )
        throw new Error(
            'Maximum selection is 200 cards. Deselect cards before adding this card or the current page.',
        );
    const next = new Map(selection);
    for (const card of additions) next.set(card.card_id, freezeCard(card));
    return next;
};
export const deselectBatchCard = (selection: BatchSelection, id: string) => {
    const next = new Map(selection);
    next.delete(id);
    return next;
};
export const hiddenBatchCount = (
    selection: BatchSelection,
    visible: LibraryCardSummary[],
) => {
    const ids = new Set(visible.map((c) => c.card_id));
    return [...selection.keys()].filter((id) => !ids.has(id)).length;
};
export const normalizeBatchOperation = (
    operation: BatchOperation,
): BatchOperation => {
    const result: BatchOperation = {};
    for (const dimension of BATCH_DIMENSIONS)
        for (const action of ['add', 'remove'] as const) {
            const key = `${action}_${dimension}_ids` as const;
            result[key] = [...(operation[key] ?? [])].sort();
        }
    if (operation.set_effect_reviewed !== undefined)
        result.set_effect_reviewed = operation.set_effect_reviewed;
    return result;
};
export const batchOperationError = (
    operation: BatchOperation,
): string | null => {
    let nonempty = operation.set_effect_reviewed !== undefined;
    for (const dimension of BATCH_DIMENSIONS) {
        const add = operation[`add_${dimension}_ids`] ?? [];
        const remove = operation[`remove_${dimension}_ids`] ?? [];
        if (
            new Set(add).size !== add.length ||
            new Set(remove).size !== remove.length
        )
            return 'Duplicate registry IDs are not permitted.';
        if (add.some((id) => remove.includes(id)))
            return 'An ID cannot be both ADD and REMOVE in the same dimension.';
        nonempty ||= add.length + remove.length > 0;
    }
    return nonempty ? null : 'Configure at least one Classification change.';
};
export const batchRequest = (
    selection: BatchSelection,
    operation: BatchOperation,
    note: string,
): BatchRequest => ({
    items: [...selection.values()].map(({ card_id, expected_revision }) => ({
        card_id,
        expected_revision,
    })),
    operation: normalizeBatchOperation(operation),
    note,
});
export const batchFingerprint = (
    selection: BatchSelection,
    operation: BatchOperation,
    note: string,
) => JSON.stringify(batchRequest(selection, operation, note));
export const batchRequiredAcknowledgements = (preview: BatchPreview) =>
    preview.results
        .filter((r) => r.status === 'CONFIRMED_REQUIRES_ACK')
        .map((r) => r.card_id);
export const batchApplyRequest = (
    request: BatchRequest,
    preview: BatchPreview,
    ack: Set<string>,
): BatchApplyRequest => ({
    ...request,
    acknowledge_move_to_draft_card_ids: batchRequiredAcknowledgements(
        preview,
    ).filter((id) => ack.has(id)),
});
export const batchCanApply = (args: {
    previewMatches: boolean;
    preview: BatchPreview | null;
    ack: Set<string>;
    editorDirty: boolean;
    mutationEnabled: boolean;
    busy: boolean;
}) =>
    args.previewMatches &&
    !!args.preview &&
    !args.editorDirty &&
    args.mutationEnabled &&
    !args.busy &&
    batchRequiredAcknowledgements(args.preview).every((id) => args.ack.has(id));
export const batchParticipatingDetail = (
    result: BatchResult,
    detailId: string | null,
    dirty: boolean,
) =>
    !dirty &&
    !!detailId &&
    result.results.some((row) => row.card_id === detailId);
export const stopBatchCheckboxEvent = (event: { stopPropagation(): void }) =>
    event.stopPropagation();
export const BATCH_STATUS_LABELS: Record<
    BatchPreviewStatus | BatchApplyStatus,
    string
> = {
    WOULD_CHANGE: 'Would change',
    CONFIRMED_REQUIRES_ACK: 'Confirmed → DRAFT acknowledgement required',
    NO_OP: 'No-op',
    REVISION_CONFLICT: 'Conflict',
    DOMAIN_VALIDATION: 'Validation failure',
    NOT_FOUND: 'Not found',
    SUCCESS: 'Changed',
    CONFIRMED_BLOCK_ACK_REQUIRED: 'Acknowledgement required',
    CONFIRMED_BLOCK_STATE_CHANGED: 'Acknowledgement stale/state changed',
};
