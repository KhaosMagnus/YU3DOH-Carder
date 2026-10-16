import type { CanonicalDomainService } from '../canonical/service';
import type {
    CanonicalCardSnapshot,
    CanonicalCardMutation,
    SemanticBlockKey,
} from '../canonical/types';
import { assertBlockForConfirmation } from '../canonical/validation';
import { CanonicalDomainError } from '../canonical/errors';
import type { WorkspacePersistence } from '../persistence/database';
import type { WorkspaceMaintenanceCoordinator } from '../workspace/maintenance';
import { acceptanceCandidate } from './repository';
import { YGORESOURCES_SOURCE } from './types';
import {
    REGISTRY_TABLES,
    buildStructureResult,
    type StructureRegistries,
} from './structure-result';
import { assertStructureRequest } from './structure-acceptance-dto';
import {
    StructureAcceptanceError,
    type StructurePreview,
    type StructureRequest,
    type StructureApplyResult,
    type StructureReason,
} from './structure-acceptance-dto';

/** Stored normalized evidence only; Canonical owns the sole write transaction. */
export class ExternalStructureAcceptanceService {
    constructor(
        private readonly persistence: WorkspacePersistence,
        private readonly canonical: Pick<
            CanonicalDomainService,
            'getCard' | 'mutateCard'
        >,
        private readonly maintenance: WorkspaceMaintenanceCoordinator,
        private readonly isCurrent: () => boolean,
    ) {}
    private assertCurrent() {
        if (!this.persistence.isOpen || !this.isCurrent())
            throw new StructureAcceptanceError(
                'WORKSPACE_NOT_READY',
                'Workspace is not READY for STRUCTURE acceptance.',
            );
    }
    private id(candidateId: string) {
        if (typeof candidateId !== 'string' || !candidateId.trim())
            throw new StructureAcceptanceError(
                'EXTERNAL_STRUCTURE_OPERATION_INVALID',
                'candidate_id must be non-empty.',
            );
    }
    previewStructure(candidateId: string, input: unknown): StructurePreview {
        assertStructureRequest(input);
        this.id(candidateId);
        return this.maintenance.read(() => {
            this.assertCurrent();
            return this.evaluate(candidateId, input, false);
        });
    }
    applyStructure(candidateId: string, input: unknown): StructureApplyResult {
        assertStructureRequest(input, true);
        this.id(candidateId);
        return this.maintenance.mutate(() => {
            this.assertCurrent();
            const preview = this.evaluate(candidateId, input, true);
            if (preview.decision === 'INELIGIBLE')
                throw new StructureAcceptanceError(
                    preview.reason_codes.includes(
                        'STRUCTURAL_REGISTRY_VALUE_NOT_AVAILABLE',
                    )
                        ? 'STRUCTURAL_REGISTRY_VALUE_NOT_AVAILABLE'
                        : 'EXTERNAL_STRUCTURE_NOT_ELIGIBLE',
                    'Stored evidence cannot form a coherent complete STRUCTURE.',
                    preview.reason_codes,
                );
            if (preview.decision === 'BLOCKED')
                throw new StructureAcceptanceError(
                    'CONFIRMED_BLOCK_DEPENDENCY_CONFLICT',
                    'Result would invalidate confirmed blocks.',
                    preview.reason_codes,
                    preview.blocking_confirmed_blocks,
                );
            if (
                input.acknowledge_move_to_draft &&
                !preview.acknowledgement_required
            )
                throw new StructureAcceptanceError(
                    'CONFIRMED_BLOCK_STATE_CHANGED',
                    'Acknowledgement is extraneous for the current operation.',
                );
            if (
                preview.acknowledgement_required &&
                !input.acknowledge_move_to_draft
            )
                throw new StructureAcceptanceError(
                    'CONFIRMED_BLOCK_ACK_REQUIRED',
                    'Explicitly acknowledge STRUCTURE moving to DRAFT.',
                );
            const result: StructureApplyResult = {
                card_id: preview.card_id,
                candidate_id: candidateId,
                changed: preview.changed,
                previous_revision: preview.current_revision!,
                revision: preview.current_revision!,
                moved_to_draft: false,
                structure_confirmation_state:
                    preview.structure_confirmation_state,
                changes: preview.changes.map(
                    ({ kind, field, provenance_ref }) => ({
                        kind,
                        field,
                        provenance_ref,
                    }),
                ),
                no_op_fields: preview.unchanged_fields,
                resulting_structure: preview.resulting_structure!,
                stale: false,
            };
            if (!preview.changed) return result;
            const note = input.note?.trim() || null;
            const mutation: CanonicalCardMutation = {
                structure: preview.resulting_structure!,
                provenance: preview.changes.map((c) => ({
                    sourceKind: 'EXTERNAL_SOURCE',
                    targetKind: 'BLOCK',
                    targetKey: 'STRUCTURE',
                    sourceRef: c.provenance_ref,
                    note:
                        c.kind === 'SOURCE_CHANGE'
                            ? note
                            : `Derived clear: ${c.field} became non-applicable because of ${c.trigger}.${note ? ' User note: ' + note : ''}`,
                })),
                ...(preview.acknowledgement_required
                    ? {
                          confirmations: [
                              {
                                  block: 'STRUCTURE' as const,
                                  state: 'DRAFT' as const,
                              },
                          ],
                      }
                    : {}),
            };
            const card = this.canonical.mutateCard(
                preview.card_id,
                input.target_expected_revision,
                mutation,
            );
            return {
                ...result,
                revision: card.revision,
                moved_to_draft: preview.acknowledgement_required,
                structure_confirmation_state: 'DRAFT',
                stale: true,
            };
        });
    }
    private evaluate(
        candidateId: string,
        input: StructureRequest,
        apply: boolean,
    ): StructurePreview {
        const resolved = this.persistence.runRepositoryOperation((db) =>
            acceptanceCandidate(db, candidateId),
        );
        if (!resolved)
            throw new StructureAcceptanceError(
                'NOT_FOUND',
                'Stored candidate not found.',
            );
        const { stored, retrieval } = resolved;
        if (!retrieval)
            throw new StructureAcceptanceError(
                'EXTERNAL_CANDIDATE_NOT_ELIGIBLE',
                'Candidate retrieval is unavailable.',
                ['SOURCE_NOT_SUPPORTED'],
            );
        const c = stored.candidate;
        const reasons: StructureReason[] = [];
        if (
            retrieval.source_code !== YGORESOURCES_SOURCE ||
            c?.identity?.source_code !== YGORESOURCES_SOURCE ||
            typeof c?.identity?.external_record_key !== 'string' ||
            !c.identity.external_record_key ||
            c.identity.external_record_key !== retrieval.external_record_key
        )
            reasons.push('SOURCE_NOT_SUPPORTED');
        if (
            stored.candidate_schema_version !== 1 ||
            c?.candidate_schema_version !== 1
        )
            reasons.push('CANDIDATE_SCHEMA_NOT_SUPPORTED');
        if (stored.normalizer_version !== 2)
            reasons.push('NORMALIZER_VERSION_NOT_SUPPORTED');
        if (c?.authoritative !== false)
            reasons.push('AUTHORITATIVE_CANDIDATE_NOT_SUPPORTED');
        if (!['SUCCESS', 'PARTIAL'].includes(retrieval.status))
            reasons.push('RETRIEVAL_STATUS_NOT_SUPPORTED');
        const preview: StructurePreview = {
            card_id: input.target_card_id,
            candidate_id: candidateId,
            target_expected_revision: input.target_expected_revision,
            current_revision: null,
            source_code: retrieval.source_code,
            candidate_schema_version: stored.candidate_schema_version,
            normalizer_version: stored.normalizer_version,
            retrieval_status: retrieval.status,
            family: null,
            eligible: false,
            decision: 'INELIGIBLE',
            reason_codes: reasons,
            current_structure: null,
            source_structure: { fields: c?.blocks?.STRUCTURE?.fields ?? {} },
            resulting_structure: null,
            changes: [],
            unchanged_fields: [],
            read_only_evidence: [],
            changed: false,
            structure_confirmation_state: 'DRAFT',
            acknowledgement_required: false,
            blocking_confirmed_blocks: [],
            stale_after_success: false,
            persisted_state_only: true,
        };
        if (reasons.length) {
            if (apply)
                throw new StructureAcceptanceError(
                    'EXTERNAL_CANDIDATE_NOT_ELIGIBLE',
                    'Stored candidate is incompatible with STRUCTURE acceptance.',
                    reasons,
                );
            return preview;
        }
        if (retrieval.target_card_id !== input.target_card_id)
            throw new StructureAcceptanceError(
                'CANDIDATE_TARGET_MISMATCH',
                'Candidate is frozen to another target.',
            );
        if (
            retrieval.target_expected_revision !==
            input.target_expected_revision
        )
            throw new StructureAcceptanceError(
                'REVISION_CONFLICT',
                'Candidate revision differs from request.',
            );
        const card = this.canonical.getCard(input.target_card_id);
        if (!card)
            throw new StructureAcceptanceError(
                'NOT_FOUND',
                'Canonical target not found.',
            );
        if (card.revision !== input.target_expected_revision)
            throw new StructureAcceptanceError(
                'REVISION_CONFLICT',
                'Canonical revision differs from frozen candidate.',
            );
        Object.assign(preview, {
            current_revision: card.revision,
            current_structure: card.structure,
            family: card.family,
            structure_confirmation_state:
                card.confirmations.find((c) => c.block === 'STRUCTURE')
                    ?.state ?? 'DRAFT',
            read_only_evidence: [
                {
                    field: 'family',
                    current: card.family,
                    source: preview.source_structure.fields.family ?? null,
                },
                { field: 'password', current: card.password, source: null },
                {
                    field: 'link_rating',
                    current:
                        card.structure?.kind === 'MONSTER'
                            ? card.structure.linkRating
                            : null,
                    source: preview.source_structure.fields.link_rating ?? null,
                },
            ],
        });
        if (
            stored.diagnostics.some(
                (d) =>
                    d.block === 'STRUCTURE' &&
                    [
                        'SOURCE_FIELD_UNMAPPED',
                        'SOURCE_FIELD_INVALID',
                        'SOURCE_FIELD_AMBIGUOUS',
                    ].includes(d.code),
            )
        ) {
            preview.reason_codes = ['STRUCTURE_DIAGNOSTICS_PRESENT'];
            return preview;
        }
        const registries = this.persistence.runRepositoryOperation(
            (db) =>
                Object.fromEntries(
                    REGISTRY_TABLES.map((table) => [
                        table,
                        new Set(
                            (
                                db
                                    .prepare(`SELECT code FROM ${table}`)
                                    .all() as { code: string }[]
                            ).map((r) => r.code),
                        ),
                    ]),
                ) as unknown as StructureRegistries,
        );
        const built = buildStructureResult(
            preview.source_structure.fields,
            card,
            candidateId,
            registries,
        );
        Object.assign(preview, {
            resulting_structure: built.result,
            changes: built.changes,
            unchanged_fields: built.unchanged_fields,
            reason_codes: built.reason_codes,
            changed: built.changes.length > 0,
        });
        if (built.reason_codes.length || !built.result) return preview;
        preview.acknowledgement_required =
            preview.changed &&
            preview.structure_confirmation_state === 'CONFIRMED';
        preview.stale_after_success = preview.changed;
        preview.read_only_evidence = preview.read_only_evidence.map((r) => ({
            ...r,
            result:
                r.field === 'link_rating'
                    ? built.result?.kind === 'MONSTER' &&
                      built.result.summonKind === 'LINK'
                        ? built.result.linkMarkers.length
                        : null
                    : r.current,
        }));
        const hypothetical: CanonicalCardSnapshot = {
            ...card,
            structure:
                built.result.kind === 'MONSTER'
                    ? {
                          ...built.result,
                          linkRating:
                              built.result.summonKind === 'LINK'
                                  ? built.result.linkMarkers.length
                                  : null,
                      }
                    : built.result,
        };
        const order: SemanticBlockKey[] = [
            'TEXT:EN',
            'TEXT:ES',
            'TEXT:JP',
            'CLASSIFICATION',
            'RELATIONS',
        ];
        if (preview.changed)
            for (const block of order)
                if (
                    card.confirmations.some(
                        (c) => c.block === block && c.state === 'CONFIRMED',
                    )
                ) {
                    try {
                        assertBlockForConfirmation(hypothetical, block);
                    } catch (e) {
                        if (!(e instanceof CanonicalDomainError)) throw e;
                        preview.blocking_confirmed_blocks.push(block);
                    }
                }
        if (preview.blocking_confirmed_blocks.length) {
            preview.decision = 'BLOCKED';
            preview.reason_codes = ['CONFIRMED_BLOCK_DEPENDENCY_CONFLICT'];
            return preview;
        }
        preview.eligible = true;
        preview.decision = preview.changed ? 'READY' : 'NO_OP';
        preview.acknowledgement_required =
            preview.changed &&
            preview.structure_confirmation_state === 'CONFIRMED';
        preview.stale_after_success = preview.changed;
        return preview;
    }
}
