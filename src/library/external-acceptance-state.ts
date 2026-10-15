import type { ExternalDetail, SourceClaim } from './external-source-model';
import type { LibraryCardDetail } from './model';
export const EXTERNAL_TEXT_BLOCKS = ['TEXT:EN', 'TEXT:ES', 'TEXT:JP'] as const;
export const EXTERNAL_TEXT_FIELDS = [
    'name',
    'card_text',
    'pendulum_text',
] as const;
export type ExternalTextSelection = {
    block: (typeof EXTERNAL_TEXT_BLOCKS)[number];
    field: (typeof EXTERNAL_TEXT_FIELDS)[number];
};
export type ExternalTextApplyRequest = {
    target_card_id: string;
    target_expected_revision: string;
    selected_fields: ExternalTextSelection[];
    acknowledge_move_to_draft_blocks: ExternalTextSelection['block'][];
    note?: string;
};
export type ExternalTextApplyResult = {
    card_id: string;
    candidate_id: string;
    changed: boolean;
    previous_revision: string;
    revision: string;
    changed_blocks: ExternalTextSelection['block'][];
    moved_to_draft: ExternalTextSelection['block'][];
    changed_fields: ExternalTextSelection[];
    no_op_fields: ExternalTextSelection[];
};
export const selectionKey = (s: { block: string; field: string }) =>
    `${s.block}/${s.field}`;
export function externalTextSelectable(
    detail: LibraryCardDetail,
    block: string,
    field: string,
    claim: SourceClaim,
) {
    return (
        EXTERNAL_TEXT_BLOCKS.includes(
            block as ExternalTextSelection['block'],
        ) &&
        EXTERNAL_TEXT_FIELDS.includes(
            field as ExternalTextSelection['field'],
        ) &&
        claim.state === 'PRESENT' &&
        typeof claim.value === 'string' &&
        (field !== 'pendulum_text' ||
            (detail.structure?.kind === 'MONSTER' &&
                Array.isArray(detail.structure.abilities) &&
                detail.structure.abilities.includes('PENDULUM')))
    );
}
export function externalApplyReview(
    detail: LibraryCardDetail,
    snapshot: ExternalDetail,
    selected: ExternalTextSelection[],
) {
    const rows = EXTERNAL_TEXT_BLOCKS.flatMap((block) =>
        EXTERNAL_TEXT_FIELDS.map((field) => ({ block, field })),
    )
        .filter((s) =>
            selected.some((i) => selectionKey(i) === selectionKey(s)),
        )
        .map((s) => {
            const claim =
                snapshot.candidate?.candidate.blocks[s.block]?.fields[s.field];
            const current =
                detail.localizations.find(
                    (l) => l.language === s.block.slice(5),
                )?.[s.field] ?? null;
            const source =
                claim?.state === 'PRESENT' && typeof claim.value === 'string'
                    ? claim.value
                    : null;
            const eligible =
                !!claim &&
                externalTextSelectable(detail, s.block, s.field, claim);
            const state =
                detail.confirmations.find((c) => c.block === s.block)?.state ??
                'DRAFT';
            return {
                ...s,
                current,
                source,
                eligible,
                state,
                changed: eligible && current !== source,
            };
        });
    const requiredAck = EXTERNAL_TEXT_BLOCKS.filter((block) =>
        rows.some(
            (r) => r.block === block && r.changed && r.state === 'CONFIRMED',
        ),
    );
    return { rows, requiredAck };
}
