import { randomUUID } from 'node:crypto';
import { CanonicalDomainError } from '../canonical/errors';
import type { CanonicalDomainService } from '../canonical/service';
import type {
    CanonicalCardSnapshot,
    ClassificationMutation,
} from '../canonical/types';
import {
    assertConfirmedBlocksValid,
    assertMutationShape,
} from '../canonical/validation';

export const BATCH_CLASSIFICATION_LIMIT = 200;
export const BATCH_DIMENSIONS = [
    ['archetype', 'archetypeIds', 'archetypes'],
    ['effect_classifier', 'effectClassifierIds', 'effectClassifiers'],
    ['functional_tag', 'functionalTagIds', 'functionalTags'],
] as const;
export type BatchOperation = {
    add_archetype_ids?: string[];
    remove_archetype_ids?: string[];
    add_effect_classifier_ids?: string[];
    remove_effect_classifier_ids?: string[];
    add_functional_tag_ids?: string[];
    remove_functional_tag_ids?: string[];
    set_effect_reviewed?: boolean;
};
export type BatchItem = { card_id: string; expected_revision: string };
export type BatchRequest = {
    items: BatchItem[];
    operation: BatchOperation;
    note?: string;
};
export type BatchApplyRequest = BatchRequest & {
    acknowledge_move_to_draft_card_ids?: string[];
};
export type BatchRegistry = {
    archetype: Set<string>;
    effect_classifier: Set<string>;
    functional_tag: Set<string>;
};
export class LibraryBatchError extends Error {
    readonly statusCode = 422;
    constructor(
        readonly code:
            | 'BATCH_OPERATION_INVALID'
            | 'BATCH_REGISTRY_REFERENCE_INVALID',
        message: string,
    ) {
        super(message);
    }
}
export type PreviewStatus =
    | 'WOULD_CHANGE'
    | 'CONFIRMED_REQUIRES_ACK'
    | 'NO_OP'
    | 'REVISION_CONFLICT'
    | 'DOMAIN_VALIDATION'
    | 'NOT_FOUND';
export type ApplyStatus =
    | 'SUCCESS'
    | 'NO_OP'
    | 'REVISION_CONFLICT'
    | 'DOMAIN_VALIDATION'
    | 'CONFIRMED_BLOCK_ACK_REQUIRED'
    | 'CONFIRMED_BLOCK_STATE_CHANGED'
    | 'NOT_FOUND';
type PreviewResult = BatchItem & {
    observed_revision: string | null;
    status: PreviewStatus;
    changed: boolean;
    requires_move_to_draft: boolean;
    error_code: string | null;
    message: string | null;
};
type ApplyResult = BatchItem & {
    previous_revision: string | null;
    revision: string | null;
    status: ApplyStatus;
    changed: boolean;
    moved_to_draft: boolean;
    error_code: string | null;
    message: string | null;
};

/** Only Canonical owns writes. The registry dependency is read-only and dimension-specific. */
export class LibraryBatchClassificationService {
    constructor(
        private readonly canonical: CanonicalDomainService,
        private readonly registry: () => BatchRegistry,
    ) {}

    private validate(request: BatchApplyRequest) {
        const invalid = (message: string): never => {
            throw new LibraryBatchError('BATCH_OPERATION_INVALID', message);
        };
        const { items, operation } = request;
        if (!items.length || items.length > BATCH_CLASSIFICATION_LIMIT)
            invalid('Submit between 1 and 200 explicit cards.');
        if (new Set(items.map((i) => i.card_id)).size !== items.length)
            invalid('Duplicate card IDs are not permitted.');
        let nonempty = operation.set_effect_reviewed !== undefined;
        for (const [dimension] of BATCH_DIMENSIONS) {
            const add = operation[`add_${dimension}_ids`] ?? [];
            const remove = operation[`remove_${dimension}_ids`] ?? [];
            if (
                new Set(add).size !== add.length ||
                new Set(remove).size !== remove.length
            )
                invalid('Duplicate operation IDs are not permitted.');
            if (add.some((id) => remove.includes(id)))
                invalid('An ID cannot be both added and removed.');
            nonempty ||= add.length + remove.length > 0;
        }
        if (!nonempty) invalid('Configure at least one Classification change.');
        const ack = request.acknowledge_move_to_draft_card_ids ?? [];
        if (
            new Set(ack).size !== ack.length ||
            ack.some((id) => !items.some((i) => i.card_id === id))
        )
            invalid('Acknowledgements must be unique submitted card IDs.');
        const registry = this.registry();
        for (const [dimension] of BATCH_DIMENSIONS) {
            const ids = [
                ...(operation[`add_${dimension}_ids`] ?? []),
                ...(operation[`remove_${dimension}_ids`] ?? []),
            ];
            if (ids.some((id) => !registry[dimension].has(id)))
                throw new LibraryBatchError(
                    'BATCH_REGISTRY_REFERENCE_INVALID',
                    `Unknown ${dimension} registry reference.`,
                );
        }
    }

    private candidate(card: CanonicalCardSnapshot, operation: BatchOperation) {
        const mutation: ClassificationMutation = {};
        for (const [dimension, key, snapshotKey] of BATCH_DIMENSIONS) {
            const current = new Set(
                card.classification[snapshotKey].map((entity) => entity.id),
            );
            const next = new Set([
                ...current,
                ...(operation[`add_${dimension}_ids`] ?? []),
            ]);
            for (const id of operation[`remove_${dimension}_ids`] ?? [])
                next.delete(id);
            if (
                next.size !== current.size ||
                [...next].some((id) => !current.has(id))
            )
                mutation[key] = [...next].sort();
        }
        if (
            operation.set_effect_reviewed !== undefined &&
            operation.set_effect_reviewed !== card.classification.effectReviewed
        )
            mutation.effectReviewed = operation.set_effect_reviewed;
        return mutation;
    }

    private confirmed(card: CanonicalCardSnapshot) {
        return card.confirmations.some(
            (c) => c.block === 'CLASSIFICATION' && c.state === 'CONFIRMED',
        );
    }

    preview(request: BatchRequest) {
        this.validate(request);
        const results: PreviewResult[] = request.items.map((item) => {
            const card = this.canonical.getCard(item.card_id);
            const result: PreviewResult = {
                ...item,
                observed_revision: card?.revision ?? null,
                status: 'NOT_FOUND',
                changed: false,
                requires_move_to_draft: false,
                error_code: 'NOT_FOUND',
                message: 'Card was not found.',
            };
            if (!card) return result;
            if (card.revision !== item.expected_revision)
                return {
                    ...result,
                    status: 'REVISION_CONFLICT',
                    error_code: 'REVISION_CONFLICT',
                    message:
                        'Card changed since selection; explicitly refresh and reselect.',
                };
            const classification = this.candidate(card, request.operation);
            if (!Object.keys(classification).length)
                return {
                    ...result,
                    status: 'NO_OP',
                    error_code: null,
                    message: null,
                };
            // These are existing pure validators, never a speculative mutation/transaction.
            try {
                assertMutationShape(card.family, { classification });
                assertConfirmedBlocksValid({
                    ...card,
                    confirmations: card.confirmations.filter(
                        (c) => c.block !== 'CLASSIFICATION',
                    ),
                });
            } catch (error) {
                if (
                    !(error instanceof CanonicalDomainError) ||
                    error.code !== 'DOMAIN_VALIDATION'
                )
                    throw error;
                return {
                    ...result,
                    status: 'DOMAIN_VALIDATION',
                    error_code: error.code,
                    message: error.message,
                };
            }
            const confirmed = this.confirmed(card);
            return {
                ...result,
                status: confirmed ? 'CONFIRMED_REQUIRES_ACK' : 'WOULD_CHANGE',
                changed: true,
                requires_move_to_draft: confirmed,
                error_code: null,
                message: null,
            };
        });
        const count = (status: PreviewStatus) =>
            results.filter((r) => r.status === status).length;
        return {
            preview_id: randomUUID(),
            summary: {
                selected: results.length,
                would_change: count('WOULD_CHANGE'),
                confirmed_requires_ack: count('CONFIRMED_REQUIRES_ACK'),
                no_op: count('NO_OP'),
                revision_conflict: count('REVISION_CONFLICT'),
                domain_validation: count('DOMAIN_VALIDATION'),
                not_found: count('NOT_FOUND'),
            },
            results,
        };
    }

    apply(request: BatchApplyRequest) {
        this.validate(request); // All shared failures precede every per-card write.
        const batch_operation_id = randomUUID();
        const acknowledgements = new Set(
            request.acknowledge_move_to_draft_card_ids ?? [],
        );
        const results: ApplyResult[] = [];
        for (const item of request.items) {
            const card = this.canonical.getCard(item.card_id);
            const result: ApplyResult = {
                ...item,
                previous_revision: card?.revision ?? null,
                revision: card?.revision ?? null,
                status: 'NOT_FOUND',
                changed: false,
                moved_to_draft: false,
                error_code: 'NOT_FOUND',
                message: 'Card was not found.',
            };
            const fail = (status: ApplyStatus, message: string) =>
                results.push({
                    ...result,
                    status,
                    error_code: status,
                    message,
                });
            if (!card) {
                results.push(result);
                continue;
            }
            if (card.revision !== item.expected_revision) {
                fail(
                    'REVISION_CONFLICT',
                    'Card changed since selection; explicitly refresh and reselect.',
                );
                continue;
            }
            const classification = this.candidate(card, request.operation);
            const changed = Object.keys(classification).length > 0;
            const confirmed = this.confirmed(card);
            const ack = acknowledgements.has(item.card_id);
            if (ack && (!changed || !confirmed)) {
                fail(
                    'CONFIRMED_BLOCK_STATE_CHANGED',
                    'Acknowledgement no longer matches a changed CONFIRMED Classification. Request a new Preview.',
                );
                continue;
            }
            if (!changed) {
                results.push({
                    ...result,
                    status: 'NO_OP',
                    error_code: null,
                    message: null,
                });
                continue;
            }
            if (confirmed && !ack) {
                fail(
                    'CONFIRMED_BLOCK_ACK_REQUIRED',
                    'Acknowledge this exact card before moving CLASSIFICATION to DRAFT.',
                );
                continue;
            }
            try {
                const updated = this.canonical.mutateCard(
                    item.card_id,
                    item.expected_revision,
                    {
                        classification,
                        provenance: [
                            {
                                targetKind: 'BLOCK',
                                targetKey: 'CLASSIFICATION',
                                sourceKind: 'LIBRARY_BATCH',
                                sourceRef: `library-batch:${batch_operation_id}`,
                                note: request.note ?? null,
                            },
                        ],
                        ...(confirmed
                            ? {
                                  confirmations: [
                                      {
                                          block: 'CLASSIFICATION' as const,
                                          state: 'DRAFT' as const,
                                      },
                                  ],
                              }
                            : {}),
                    },
                );
                results.push({
                    ...result,
                    status: 'SUCCESS',
                    revision: updated.revision,
                    changed: true,
                    moved_to_draft: confirmed,
                    error_code: null,
                    message: null,
                });
            } catch (error) {
                if (!(error instanceof CanonicalDomainError)) throw error; // Unexpected failures must fail the request normally.
                const observed =
                    this.canonical.getCard(item.card_id)?.revision ?? null;
                results.push({
                    ...result,
                    previous_revision: observed,
                    revision: observed,
                    status: error.code,
                    error_code: error.code,
                    message: error.message,
                });
            }
        }
        const count = (status: ApplyStatus) =>
            results.filter((r) => r.status === status).length;
        return {
            batch_operation_id,
            summary: {
                selected: results.length,
                success: count('SUCCESS'),
                no_op: count('NO_OP'),
                revision_conflict: count('REVISION_CONFLICT'),
                domain_validation: count('DOMAIN_VALIDATION'),
                confirmed_block_ack_required: count(
                    'CONFIRMED_BLOCK_ACK_REQUIRED',
                ),
                confirmed_block_state_changed: count(
                    'CONFIRMED_BLOCK_STATE_CHANGED',
                ),
                not_found: count('NOT_FOUND'),
            },
            results,
        };
    }
}
