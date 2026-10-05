import Fastify, { type FastifyInstance } from 'fastify';
import { WORKSPACE_LIFECYCLE_STATES, type WorkspaceStatus } from './workspace/types';

const nullableStringSchema = {
    anyOf: [
        { type: 'string' },
        { type: 'null' },
    ],
} as const;

const nullableIntegerSchema = {
    anyOf: [
        { type: 'integer' },
        { type: 'null' },
    ],
} as const;

export const workspaceStatusResponseSchema = {
    type: 'object',
    additionalProperties: false,
    required: [
        'workspace_id',
        'name',
        'workspace_format_version',
        'database_schema_version',
        'state',
        'read_only',
        'health_summary',
    ],
    properties: {
        workspace_id: nullableStringSchema,
        name: nullableStringSchema,
        workspace_format_version: nullableIntegerSchema,
        database_schema_version: nullableIntegerSchema,
        state: {
            type: 'string',
            enum: [...WORKSPACE_LIFECYCLE_STATES],
        },
        read_only: { type: 'boolean' },
        health_summary: { type: 'string' },
    },
} as const;

export const buildWorkspaceApp = (
    status: WorkspaceStatus,
    { logger = false }: { logger?: boolean } = {},
): FastifyInstance => {
    const app = Fastify({ logger });

    app.get('/api/v1/workspace/status', {
        schema: {
            response: {
                200: workspaceStatusResponseSchema,
            },
        },
    }, async () => status);

    return app;
};
