const projectionFields = [
    'password',
    'attribute',
    'star',
    'atk',
    'def',
    'sub_family',
    'name',
    'effect',
    'pendulum_effect',
    'pendulum_scale_red',
    'pendulum_scale_blue',
];
const blocks = ['STRUCTURE', 'TEXT:EN', 'TEXT:ES', 'TEXT:JP'];
export const writeBackBodySchema = {
    type: 'object',
    additionalProperties: false,
    required: [
        'write_grant',
        'card_id',
        'expected_revision',
        'content_language',
        'projection',
        'acknowledge_move_to_draft',
    ],
    properties: {
        write_grant: { type: 'string' },
        card_id: { type: 'string' },
        expected_revision: { type: 'string' },
        content_language: { enum: ['EN', 'ES', 'JP'] },
        projection: {
            type: 'object',
            additionalProperties: false,
            required: projectionFields,
            properties: Object.fromEntries(
                projectionFields.map((k) => [k, { type: 'string' }]),
            ),
        },
        acknowledge_move_to_draft: { type: 'array', items: { enum: blocks } },
    },
};
export const writeBackResponseSchema = {
    type: 'object',
    additionalProperties: false,
    required: [
        'card_id',
        'changed',
        'previous_revision',
        'revision',
        'changed_blocks',
        'moved_to_draft',
        'write_grant',
    ],
    properties: {
        card_id: { type: 'string' },
        changed: { type: 'boolean' },
        previous_revision: { type: 'string' },
        revision: { type: 'string' },
        write_grant: { type: 'string' },
        changed_blocks: { type: 'array', items: { enum: blocks } },
        moved_to_draft: { type: 'array', items: { enum: blocks } },
    },
};
