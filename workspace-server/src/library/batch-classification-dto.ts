const text = { type: 'string', minLength: 1 } as const;
const ids = { type: 'array', items: text } as const;
const item = {
    type: 'object',
    additionalProperties: false,
    required: ['card_id', 'expected_revision'],
    properties: { card_id: text, expected_revision: text },
} as const;
const operation = {
    type: 'object',
    additionalProperties: false,
    properties: {
        add_archetype_ids: ids,
        remove_archetype_ids: ids,
        add_effect_classifier_ids: ids,
        remove_effect_classifier_ids: ids,
        add_functional_tag_ids: ids,
        remove_functional_tag_ids: ids,
        set_effect_reviewed: { type: 'boolean' },
    },
} as const;
export const batchPreviewBodySchema = {
    type: 'object',
    additionalProperties: false,
    required: ['items', 'operation'],
    properties: {
        items: { type: 'array', items: item },
        operation,
        note: { type: 'string' },
    },
} as const;
export const batchApplyBodySchema = {
    ...batchPreviewBodySchema,
    properties: {
        ...batchPreviewBodySchema.properties,
        acknowledge_move_to_draft_card_ids: ids,
    },
} as const;
const nullableText = { anyOf: [{ type: 'string' }, { type: 'null' }] } as const;
const bool = { type: 'boolean' } as const;
const summary = (keys: string[]) => ({
    type: 'object',
    additionalProperties: false,
    required: keys,
    properties: Object.fromEntries(
        keys.map((key) => [key, { type: 'integer', minimum: 0 }]),
    ),
});
const result = (apply: boolean) => {
    const properties = {
        ...item.properties,
        status: {
            type: 'string',
            enum: apply
                ? [
                      'SUCCESS',
                      'NO_OP',
                      'REVISION_CONFLICT',
                      'DOMAIN_VALIDATION',
                      'CONFIRMED_BLOCK_ACK_REQUIRED',
                      'CONFIRMED_BLOCK_STATE_CHANGED',
                      'NOT_FOUND',
                  ]
                : [
                      'WOULD_CHANGE',
                      'CONFIRMED_REQUIRES_ACK',
                      'NO_OP',
                      'REVISION_CONFLICT',
                      'DOMAIN_VALIDATION',
                      'NOT_FOUND',
                  ],
        },
        changed: bool,
        error_code: nullableText,
        message: nullableText,
        ...(apply
            ? {
                  previous_revision: nullableText,
                  revision: nullableText,
                  moved_to_draft: bool,
              }
            : {
                  observed_revision: nullableText,
                  requires_move_to_draft: bool,
              }),
    };
    return {
        type: 'object',
        additionalProperties: false,
        required: Object.keys(properties),
        properties,
    };
};
export const batchPreviewResponseSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['preview_id', 'summary', 'results'],
    properties: {
        preview_id: text,
        summary: summary([
            'selected',
            'would_change',
            'confirmed_requires_ack',
            'no_op',
            'revision_conflict',
            'domain_validation',
            'not_found',
        ]),
        results: { type: 'array', items: result(false) },
    },
};
export const batchApplyResponseSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['batch_operation_id', 'summary', 'results'],
    properties: {
        batch_operation_id: text,
        summary: summary([
            'selected',
            'success',
            'no_op',
            'revision_conflict',
            'domain_validation',
            'confirmed_block_ack_required',
            'confirmed_block_state_changed',
            'not_found',
        ]),
        results: { type: 'array', items: result(true) },
    },
};
