import { ExternalSourceError } from './errors';

export const TEXT_BLOCKS = ['TEXT:EN', 'TEXT:ES', 'TEXT:JP'] as const;
export const TEXT_FIELDS = ['name', 'card_text', 'pendulum_text'] as const;
export type TextBlock = (typeof TEXT_BLOCKS)[number];
export type TextField = (typeof TEXT_FIELDS)[number];
export type TextSelection = { block: TextBlock; field: TextField };
export type ApplyTextRequest = {
    target_card_id: string;
    target_expected_revision: string;
    selected_fields: TextSelection[];
    acknowledge_move_to_draft_blocks: TextBlock[];
    note?: string;
};
export type ApplyTextResult = {
    card_id: string;
    candidate_id: string;
    changed: boolean;
    previous_revision: string;
    revision: string;
    changed_blocks: TextBlock[];
    moved_to_draft: TextBlock[];
    changed_fields: TextSelection[];
    no_op_fields: TextSelection[];
};
const selectionSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['block', 'field'],
    properties: {
        block: { type: 'string', enum: [...TEXT_BLOCKS] },
        field: { type: 'string', enum: [...TEXT_FIELDS] },
    },
};
export const applyTextBodySchema = {
    type: 'object',
    additionalProperties: false,
    required: [
        'target_card_id',
        'target_expected_revision',
        'selected_fields',
        'acknowledge_move_to_draft_blocks',
    ],
    properties: {
        target_card_id: { type: 'string', minLength: 1 },
        target_expected_revision: { type: 'string', pattern: '^[1-9][0-9]*$' },
        selected_fields: {
            type: 'array',
            minItems: 1,
            maxItems: 9,
            uniqueItems: true,
            items: selectionSchema,
        },
        acknowledge_move_to_draft_blocks: {
            type: 'array',
            maxItems: 3,
            uniqueItems: true,
            items: { type: 'string', enum: [...TEXT_BLOCKS] },
        },
        note: { type: 'string' },
    },
};
export const applyTextResponseSchema = {
    type: 'object',
    additionalProperties: false,
    required: [
        'card_id',
        'candidate_id',
        'changed',
        'previous_revision',
        'revision',
        'changed_blocks',
        'moved_to_draft',
        'changed_fields',
        'no_op_fields',
    ],
    properties: {
        card_id: { type: 'string' },
        candidate_id: { type: 'string' },
        changed: { type: 'boolean' },
        previous_revision: { type: 'string' },
        revision: { type: 'string' },
        changed_blocks: {
            type: 'array',
            items: { type: 'string', enum: [...TEXT_BLOCKS] },
        },
        moved_to_draft: {
            type: 'array',
            items: { type: 'string', enum: [...TEXT_BLOCKS] },
        },
        changed_fields: { type: 'array', items: selectionSchema },
        no_op_fields: { type: 'array', items: selectionSchema },
    },
};
const object = (v: unknown): v is Record<string, unknown> =>
    !!v && typeof v === 'object' && !Array.isArray(v);
export function assertApplyTextRequest(
    value: unknown,
): asserts value is ApplyTextRequest {
    const invalid = (): never => {
        throw new ExternalSourceError(
            'EXTERNAL_APPLY_OPERATION_INVALID',
            'Submit an exact target, string revision, unique TEXT selections and exact block acknowledgements.',
        );
    };
    if (!object(value)) return invalid();
    const keys = [
        'target_card_id',
        'target_expected_revision',
        'selected_fields',
        'acknowledge_move_to_draft_blocks',
        'note',
    ];
    if (
        Object.keys(value).some((k) => !keys.includes(k)) ||
        keys.slice(0, 4).some((k) => !Object.hasOwn(value, k)) ||
        typeof value.target_card_id !== 'string' ||
        value.target_card_id.length === 0 ||
        typeof value.target_expected_revision !== 'string' ||
        !/^[1-9][0-9]*$/.test(value.target_expected_revision) ||
        value.target_expected_revision.trim() !==
            value.target_expected_revision ||
        ('note' in value && typeof value.note !== 'string')
    )
        return invalid();
    const selected = value.selected_fields,
        ack = value.acknowledge_move_to_draft_blocks;
    if (
        !Array.isArray(selected) ||
        selected.length < 1 ||
        selected.length > 9 ||
        !Array.isArray(ack) ||
        ack.length > 3
    )
        return invalid();
    const pairs = new Set<string>();
    for (const item of selected) {
        if (
            !object(item) ||
            Object.keys(item).length !== 2 ||
            Object.keys(item).some((k) => k !== 'block' && k !== 'field') ||
            !TEXT_BLOCKS.includes(item.block as TextBlock) ||
            !TEXT_FIELDS.includes(item.field as TextField)
        )
            return invalid();
        const key = `${item.block}/${item.field}`;
        if (pairs.has(key)) return invalid();
        pairs.add(key);
    }
    if (
        ack.some((b) => !TEXT_BLOCKS.includes(b)) ||
        new Set(ack).size !== ack.length
    )
        return invalid();
}
