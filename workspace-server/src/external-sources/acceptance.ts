import type { CanonicalDomainService } from '../canonical/service';
import type {
    CanonicalCardMutation,
    LocalizedTextInput,
} from '../canonical/types';
import type { WorkspacePersistence } from '../persistence/database';
import type { WorkspaceMaintenanceCoordinator } from '../workspace/maintenance';
import { acceptanceCandidate } from './repository';
import { YGORESOURCES_SOURCE } from './types';
import { ExternalSourceError } from './errors';
import {
    assertApplyTextRequest,
    TEXT_BLOCKS,
    TEXT_FIELDS,
    type ApplyTextResult,
    type TextSelection,
} from './acceptance-dto';

/** Stored evidence only. Canonical alone owns the sole write transaction. */
export class ExternalSourceAcceptanceService {
    constructor(
        private readonly persistence: WorkspacePersistence,
        private readonly canonical: Pick<
            CanonicalDomainService,
            'getCard' | 'mutateCard'
        >,
        private readonly maintenance: WorkspaceMaintenanceCoordinator,
        private readonly isCurrent: () => boolean,
    ) {}

    applyText(candidateId: string, input: unknown): ApplyTextResult {
        assertApplyTextRequest(input);
        if (typeof candidateId !== 'string' || candidateId.length === 0)
            throw new ExternalSourceError(
                'EXTERNAL_APPLY_OPERATION_INVALID',
                'candidate_id must be a non-empty string.',
            );
        return this.maintenance.mutate(() => {
            if (!this.persistence.isOpen || !this.isCurrent())
                throw new ExternalSourceError(
                    'WORKSPACE_NOT_READY',
                    'Workspace is not READY for TEXT acceptance.',
                );
            const fail = (code: string, message: string): never => {
                throw new ExternalSourceError(code, message);
            };
            const resolved = this.persistence.runRepositoryOperation((db) =>
                acceptanceCandidate(db, candidateId),
            );
            if (!resolved)
                return fail('NOT_FOUND', 'Stored candidate was not found.');
            const { stored, retrieval } = resolved;
            const c = stored.candidate;
            if (
                !retrieval ||
                retrieval.source_code !== YGORESOURCES_SOURCE ||
                !['SUCCESS', 'PARTIAL'].includes(retrieval.status) ||
                stored.candidate_schema_version !== 1 ||
                !c ||
                typeof c !== 'object' ||
                c.candidate_schema_version !== 1 ||
                c.authoritative !== false ||
                c.identity?.source_code !== YGORESOURCES_SOURCE ||
                typeof c.identity.external_record_key !== 'string' ||
                !c.identity.external_record_key ||
                c.identity.external_record_key !== retrieval.external_record_key
            )
                return fail(
                    'EXTERNAL_CANDIDATE_NOT_ELIGIBLE',
                    'Stored candidate is incompatible with TEXT acceptance.',
                );
            if (retrieval.target_card_id !== input.target_card_id)
                return fail(
                    'CANDIDATE_TARGET_MISMATCH',
                    'The candidate is frozen to another Canonical target.',
                );
            if (
                retrieval.target_expected_revision !==
                input.target_expected_revision
            )
                return fail(
                    'REVISION_CONFLICT',
                    'Candidate revision does not match the requested revision.',
                );
            const card = this.canonical.getCard(input.target_card_id);
            if (!card)
                return fail('NOT_FOUND', 'Canonical target was not found.');
            if (card.revision !== input.target_expected_revision)
                return fail(
                    'REVISION_CONFLICT',
                    'Canonical revision no longer matches the frozen candidate.',
                );
            const selected = TEXT_BLOCKS.flatMap((block) =>
                TEXT_FIELDS.map((field) => ({ block, field })),
            ).filter((s) =>
                input.selected_fields.some(
                    (i) => i.block === s.block && i.field === s.field,
                ),
            );
            const values = new Map<string, string>();
            for (const s of selected) {
                const claim = c.blocks?.[s.block]?.fields?.[s.field];
                if (
                    claim?.state !== 'PRESENT' ||
                    typeof claim.value !== 'string'
                )
                    return fail(
                        'EXTERNAL_FIELD_NOT_ELIGIBLE',
                        `${s.block}/${s.field} is not PRESENT text.`,
                    );
                values.set(`${s.block}/${s.field}`, claim.value);
            }
            if (
                selected.some((s) => s.field === 'pendulum_text') &&
                !(
                    card.structure?.kind === 'MONSTER' &&
                    card.structure.abilities.includes('PENDULUM')
                )
            )
                return fail(
                    'EXTERNAL_FIELD_NOT_APPLICABLE',
                    'Pendulum text requires current Canonical Monster+PENDULUM structure.',
                );
            const changed: TextSelection[] = [],
                noOp: TextSelection[] = [];
            const localizations: LocalizedTextInput[] = [];
            const keys = {
                name: 'name',
                card_text: 'cardText',
                pendulum_text: 'pendulumText',
            } as const;
            for (const block of TEXT_BLOCKS) {
                const language = block.slice(
                    5,
                ) as LocalizedTextInput['language'];
                const current = card.localizations.find(
                    (l) => l.language === language,
                );
                const next: LocalizedTextInput = {
                    language,
                    name: current?.name ?? null,
                    cardText: current?.cardText ?? null,
                    pendulumText: current?.pendulumText ?? null,
                };
                let blockChanged = false;
                for (const s of selected.filter((s) => s.block === block)) {
                    const value = values.get(`${s.block}/${s.field}`)!;
                    if (next[keys[s.field]] === value) noOp.push(s);
                    else {
                        changed.push(s);
                        blockChanged = true;
                        next[keys[s.field]] = value;
                    }
                }
                if (blockChanged) localizations.push(next);
            }
            const changedBlocks = TEXT_BLOCKS.filter((block) =>
                changed.some((s) => s.block === block),
            );
            const requiredAck = changedBlocks.filter((block) =>
                card.confirmations.some(
                    (c) => c.block === block && c.state === 'CONFIRMED',
                ),
            );
            if (
                input.acknowledge_move_to_draft_blocks.some(
                    (b) => !requiredAck.includes(b),
                )
            )
                return fail(
                    'CONFIRMED_BLOCK_STATE_CHANGED',
                    'An acknowledgement no longer matches a changed CONFIRMED block.',
                );
            if (
                requiredAck.some(
                    (b) => !input.acknowledge_move_to_draft_blocks.includes(b),
                )
            )
                return fail(
                    'CONFIRMED_BLOCK_ACK_REQUIRED',
                    'Explicitly acknowledge every changed CONFIRMED block.',
                );
            const result: ApplyTextResult = {
                card_id: card.cardId,
                candidate_id: candidateId,
                changed: changed.length > 0,
                previous_revision: card.revision,
                revision: card.revision,
                changed_blocks: changedBlocks,
                moved_to_draft: requiredAck,
                changed_fields: changed,
                no_op_fields: noOp,
            };
            if (!changed.length) return result;
            const mutation: CanonicalCardMutation = {
                localizations,
                provenance: changed.map((s) => ({
                    sourceKind: 'EXTERNAL_SOURCE',
                    targetKind: 'BLOCK',
                    targetKey: s.block,
                    sourceRef: `workspace-external-candidate/${candidateId}/${s.block}/${s.field}`,
                    note: input.note?.trim() || null,
                })),
                confirmations: requiredAck.map((block) => ({
                    block,
                    state: 'DRAFT',
                })),
            };
            const updated = this.canonical.mutateCard(
                card.cardId,
                input.target_expected_revision,
                mutation,
            );
            return { ...result, revision: updated.revision };
        });
    }
}
