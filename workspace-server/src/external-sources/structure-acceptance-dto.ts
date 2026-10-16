import type {
    CanonicalStructureInput,
    CanonicalStructureSnapshot,
} from '../canonical/types';
import type { Claim } from './types';
import { ExternalSourceError } from './errors';

export const STRUCTURE_REASONS = [
    'SOURCE_NOT_SUPPORTED',
    'CANDIDATE_SCHEMA_NOT_SUPPORTED',
    'NORMALIZER_VERSION_NOT_SUPPORTED',
    'AUTHORITATIVE_CANDIDATE_NOT_SUPPORTED',
    'RETRIEVAL_STATUS_NOT_SUPPORTED',
    'STRUCTURE_DIAGNOSTICS_PRESENT',
    'UNSUPPORTED_FAMILY',
    'FAMILY_MISMATCH',
    'REQUIRED_CLAIM_NOT_PRESENT',
    'NON_APPLICABLE_CLAIM_PRESENT',
    'STRUCTURE_VALUE_INVALID',
    'LINK_PENDULUM_CONFLICT',
    'LINK_RATING_INCONSISTENT',
    'STRUCTURAL_REGISTRY_VALUE_NOT_AVAILABLE',
    'STRUCTURE_INCOHERENT',
    'CONFIRMED_BLOCK_DEPENDENCY_CONFLICT',
] as const;
export type StructureReason = (typeof STRUCTURE_REASONS)[number];
export type StructureRequest = {
    target_card_id: string;
    target_expected_revision: string;
};
export type StructureApplyRequest = StructureRequest & {
    acknowledge_move_to_draft: boolean;
    note?: string;
};
export type StructureChange = {
    kind: 'SOURCE_CHANGE' | 'DERIVED_CLEAR';
    field: string;
    current: unknown;
    result: unknown;
    trigger: string | null;
    provenance_ref: string;
};
export type StructurePreview = {
    card_id: string;
    candidate_id: string;
    target_expected_revision: string;
    current_revision: string | null;
    source_code: string;
    candidate_schema_version: number;
    normalizer_version: number;
    retrieval_status: string;
    family: string | null;
    eligible: boolean;
    decision: 'READY' | 'NO_OP' | 'INELIGIBLE' | 'BLOCKED';
    reason_codes: StructureReason[];
    current_structure: CanonicalStructureSnapshot;
    source_structure: { fields: Record<string, Claim> };
    resulting_structure: CanonicalStructureInput | null;
    changes: StructureChange[];
    unchanged_fields: string[];
    read_only_evidence: Array<{
        field: string;
        current: unknown;
        source: unknown;
        result?: unknown;
    }>;
    changed: boolean;
    structure_confirmation_state: 'DRAFT' | 'CONFIRMED';
    acknowledgement_required: boolean;
    blocking_confirmed_blocks: string[];
    stale_after_success: boolean;
    persisted_state_only: true;
};
export type StructureApplyResult = {
    card_id: string;
    candidate_id: string;
    changed: boolean;
    previous_revision: string;
    revision: string;
    moved_to_draft: boolean;
    structure_confirmation_state: 'DRAFT' | 'CONFIRMED';
    changes: Array<Pick<StructureChange, 'kind' | 'field' | 'provenance_ref'>>;
    no_op_fields: string[];
    resulting_structure: CanonicalStructureInput;
    stale: boolean;
};
export class StructureAcceptanceError extends ExternalSourceError {
    constructor(
        code: string,
        message: string,
        readonly reason_codes: readonly StructureReason[] = [],
        readonly blocking_blocks: readonly string[] = [],
    ) {
        super(code, message);
    }
}
export function assertStructureRequest(
    input: unknown,
    apply = false,
): asserts input is StructureApplyRequest {
    const invalid = (): never => {
        throw new StructureAcceptanceError(
            'EXTERNAL_STRUCTURE_OPERATION_INVALID',
            'Submit only the exact target, positive string revision, and required boolean acknowledgement for Apply.',
        );
    };
    if (!input || typeof input !== 'object' || Array.isArray(input))
        return invalid();
    const v = input as Record<string, unknown>,
        required = [
            'target_card_id',
            'target_expected_revision',
            ...(apply ? ['acknowledge_move_to_draft'] : []),
        ];
    const allowed = [...required, ...(apply ? ['note'] : [])];
    if (
        Object.keys(v).some((k) => !allowed.includes(k)) ||
        required.some((k) => !Object.hasOwn(v, k)) ||
        typeof v.target_card_id !== 'string' ||
        !v.target_card_id.trim() ||
        typeof v.target_expected_revision !== 'string' ||
        !/^[1-9][0-9]*$/.test(v.target_expected_revision) ||
        v.target_expected_revision.trim() !== v.target_expected_revision ||
        (apply && typeof v.acknowledge_move_to_draft !== 'boolean') ||
        ('note' in v && typeof v.note !== 'string')
    )
        return invalid();
}
export const structureBodySchema = (apply: boolean) => ({
    type: 'object',
    additionalProperties: false,
    required: [
        'target_card_id',
        'target_expected_revision',
        ...(apply ? ['acknowledge_move_to_draft'] : []),
    ],
    properties: {
        target_card_id: { type: 'string', minLength: 1 },
        target_expected_revision: { type: 'string', pattern: '^[1-9][0-9]*$' },
        ...(apply
            ? {
                  acknowledge_move_to_draft: { type: 'boolean' },
                  note: { type: 'string' },
              }
            : {}),
    },
});
// Explicit public top-level response contracts; nested domain evidence is server-owned JSON.
export const structureResponseSchema = (apply: boolean) => {
    const strings = apply
        ? [
              'card_id',
              'candidate_id',
              'previous_revision',
              'revision',
              'structure_confirmation_state',
          ]
        : [
              'card_id',
              'candidate_id',
              'target_expected_revision',
              'source_code',
              'retrieval_status',
              'decision',
              'structure_confirmation_state',
          ];
    const booleans = apply
        ? ['changed', 'moved_to_draft', 'stale']
        : [
              'eligible',
              'changed',
              'acknowledgement_required',
              'stale_after_success',
              'persisted_state_only',
          ];
    const arrays = apply
        ? ['changes', 'no_op_fields']
        : [
              'reason_codes',
              'changes',
              'unchanged_fields',
              'read_only_evidence',
              'blocking_confirmed_blocks',
          ];
    const properties: Record<string, unknown> = {};
    strings.forEach((k) => (properties[k] = { type: 'string' }));
    booleans.forEach((k) => (properties[k] = { type: 'boolean' }));
    arrays.forEach((k) => (properties[k] = { type: 'array', items: {} }));
    properties.resulting_structure = {};
    if (!apply)
        Object.assign(properties, {
            current_revision: { anyOf: [{ type: 'string' }, { type: 'null' }] },
            family: { anyOf: [{ type: 'string' }, { type: 'null' }] },
            current_structure: {},
            source_structure: {},
            candidate_schema_version: { type: 'number' },
            normalizer_version: { type: 'number' },
        });
    return {
        type: 'object',
        additionalProperties: false,
        required: Object.keys(properties),
        properties,
    };
};
