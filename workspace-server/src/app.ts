import Fastify, { type FastifyInstance } from 'fastify';
import { CANONICAL_CARD_FAMILIES, CANONICAL_LANGUAGES } from './canonical/types';
import type { LibraryQueryService } from './library/service';
import type { LibraryBrowseInput } from './library/types';
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


const libraryCardSummarySchema = {
    type: 'object',
    additionalProperties: false,
    required: [
        'card_id', 'revision', 'family', 'password',
        'display_name', 'display_language', 'available_languages',
        'archetypes', 'effect_classifiers', 'functional_tags',
        'variant_count', 'has_standard_ready_variant', 'has_overframe_ready_variant',
    ],
    properties: {
        card_id: { type: 'string' },
        revision: { type: 'string' },
        family: { type: 'string', enum: [...CANONICAL_CARD_FAMILIES] },
        password: nullableStringSchema,
        display_name: { type: 'string' },
        display_language: {
            anyOf: [
                { type: 'string', enum: [...CANONICAL_LANGUAGES] },
                { type: 'null' },
            ],
        },
        available_languages: {
            type: 'array',
            items: { type: 'string', enum: [...CANONICAL_LANGUAGES] },
        },
        archetypes: { type: 'array', items: { type: 'string' } },
        effect_classifiers: { type: 'array', items: { type: 'string' } },
        functional_tags: { type: 'array', items: { type: 'string' } },
        variant_count: { type: 'integer', minimum: 0 },
        has_standard_ready_variant: { type: 'boolean' },
        has_overframe_ready_variant: { type: 'boolean' },
    },
} as const;

const libraryBrowseResponseSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['items', 'total', 'limit', 'offset'],
    properties: {
        items: { type: 'array', items: libraryCardSummarySchema },
        total: { type: 'integer', minimum: 0 },
        limit: { type: 'integer', minimum: 1, maximum: 200 },
        offset: { type: 'integer', minimum: 0 },
    },
} as const;

const libraryFacetsResponseSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['families', 'archetypes', 'effect_classifiers', 'functional_tags', 'languages'],
    properties: {
        families: { type: 'array', items: { type: 'string', enum: [...CANONICAL_CARD_FAMILIES] } },
        archetypes: { type: 'array', items: { type: 'string' } },
        effect_classifiers: { type: 'array', items: { type: 'string' } },
        functional_tags: { type: 'array', items: { type: 'string' } },
        languages: { type: 'array', items: { type: 'string', enum: [...CANONICAL_LANGUAGES] } },
    },
} as const;

const libraryErrorResponseSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['code', 'message'],
    properties: {
        code: { type: 'string' },
        message: { type: 'string' },
    },
} as const;

type LibraryHttpQuery = {
    query?: string;
    preferred_language?: 'EN' | 'ES' | 'JP';
    family?: 'MONSTER' | 'SPELL' | 'TRAP' | 'TOKEN';
    archetype?: string;
    effect_classifier?: string;
    functional_tag?: string;
    limit?: number;
    offset?: number;
};

export const buildWorkspaceApp = (
    status: WorkspaceStatus,
    {
        logger = false,
        library = null,
    }: { logger?: boolean; library?: LibraryQueryService | null } = {},
): FastifyInstance => {
    const app = Fastify({ logger });

    const requireLibrary = () => library;

    app.get('/api/v1/workspace/status', {
        schema: {
            response: {
                200: workspaceStatusResponseSchema,
            },
        },
    }, async () => status);

    app.get<{ Querystring: LibraryHttpQuery }>('/api/v1/library/cards', {
        schema: {
            querystring: {
                type: 'object',
                additionalProperties: false,
                properties: {
                    query: { type: 'string', maxLength: 200 },
                    preferred_language: { type: 'string', enum: [...CANONICAL_LANGUAGES] },
                    family: { type: 'string', enum: [...CANONICAL_CARD_FAMILIES] },
                    archetype: { type: 'string', minLength: 1, maxLength: 200 },
                    effect_classifier: { type: 'string', minLength: 1, maxLength: 200 },
                    functional_tag: { type: 'string', minLength: 1, maxLength: 200 },
                    limit: { type: 'integer', minimum: 1, maximum: 200 },
                    offset: { type: 'integer', minimum: 0 },
                },
            },
            response: {
                200: libraryBrowseResponseSchema,
                503: libraryErrorResponseSchema,
            },
        },
    }, async (request, reply) => {
        const query = request.query;
        const libraryService = requireLibrary();
        if (!libraryService || status.state !== 'READY') {
            return reply.code(503).send({
                code: 'WORKSPACE_NOT_READY',
                message: `Workspace is not READY (state: ${status.state}).`,
            });
        }
        const input: LibraryBrowseInput = {
            query: query.query,
            preferredLanguage: query.preferred_language,
            family: query.family,
            archetype: query.archetype,
            effectClassifier: query.effect_classifier,
            functionalTag: query.functional_tag,
            limit: query.limit,
            offset: query.offset,
        };
        return libraryService.browse(input);
    });

    app.get('/api/v1/library/facets', {
        schema: {
            response: {
                200: libraryFacetsResponseSchema,
                503: libraryErrorResponseSchema,
            },
        },
    }, async (_request, reply) => {
        const libraryService = requireLibrary();
        if (!libraryService || status.state !== 'READY') {
            return reply.code(503).send({
                code: 'WORKSPACE_NOT_READY',
                message: `Workspace is not READY (state: ${status.state}).`,
            });
        }
        return libraryService.facets();
    });

    return app;
};
