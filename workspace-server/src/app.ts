import Fastify, { type FastifyInstance, type FastifyReply } from 'fastify';
import type { AssetIndexerService } from './assets/indexer';
import {
    CarderPrepareError,
    CarderPrepareService,
    resolveAssetContent,
    toPrepareWorkingCardRequest,
    type PrepareWorkingCardHttpBody,
} from './carder';
import { CanonicalDomainError } from './canonical/errors';
import type { CanonicalDomainService } from './canonical/service';
import {
    CANONICAL_CARD_FAMILIES,
    CANONICAL_LANGUAGES,
    SEMANTIC_BLOCK_KEYS,
    SUMMON_KINDS,
} from './canonical/types';
import {
    toCanonicalCardMutation,
    toCreateCanonicalCardInput,
    toLibraryCardDetailDto,
    type CreateLibraryCardBody,
    type PatchLibraryCardBody,
} from './library/canonical-dto';
import { loadLibraryEditorMetadata } from './library/editor-metadata';
import {
    LibraryAssetNotFoundError,
    type LibraryAssetService,
} from './library/asset-service';
import type { LibraryQueryService } from './library/service';
import type { LibraryBrowseInput } from './library/types';
import type { ManagedAssetIngestService } from './managed-assets/service';
import { ManagedAssetIngestError } from './managed-assets/types';
import type { WorkspacePersistence } from './persistence/database';
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

const printedStatSchema = {
    anyOf: [
        { type: 'integer' },
        { type: 'string', const: '?' },
        { type: 'null' },
    ],
} as const;

const sourceProvenanceSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['source_kind'],
    properties: {
        source_kind: { type: 'string', minLength: 1 },
        source_ref: nullableStringSchema,
        note: nullableStringSchema,
    },
} as const;

const registryEntitySchema = {
    type: 'object',
    additionalProperties: false,
    required: ['id', 'code'],
    properties: {
        id: { type: 'string' },
        code: { type: 'string' },
    },
} as const;

const monsterStructureResponseSchema = {
    type: 'object',
    additionalProperties: false,
    required: [
        'kind', 'summon_kind', 'attribute_code', 'race_code',
        'level', 'rank', 'atk', 'def', 'pendulum_scale',
        'abilities', 'link_markers', 'link_rating',
    ],
    properties: {
        kind: { type: 'string', const: 'MONSTER' },
        summon_kind: {
            anyOf: [
                { type: 'string', enum: [...SUMMON_KINDS] },
                { type: 'null' },
            ],
        },
        attribute_code: nullableStringSchema,
        race_code: nullableStringSchema,
        level: nullableIntegerSchema,
        rank: nullableIntegerSchema,
        atk: printedStatSchema,
        def: printedStatSchema,
        pendulum_scale: nullableIntegerSchema,
        abilities: { type: 'array', items: { type: 'string' } },
        link_markers: { type: 'array', items: { type: 'string' } },
        link_rating: nullableIntegerSchema,
    },
} as const;

const tokenStructureSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['kind', 'attribute_code', 'race_code', 'level', 'atk', 'def'],
    properties: {
        kind: { type: 'string', const: 'TOKEN' },
        attribute_code: nullableStringSchema,
        race_code: nullableStringSchema,
        level: nullableIntegerSchema,
        atk: printedStatSchema,
        def: printedStatSchema,
    },
} as const;

const spellStructureSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['kind', 'subtype_code'],
    properties: {
        kind: { type: 'string', const: 'SPELL' },
        subtype_code: nullableStringSchema,
    },
} as const;

const trapStructureSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['kind', 'subtype_code'],
    properties: {
        kind: { type: 'string', const: 'TRAP' },
        subtype_code: nullableStringSchema,
    },
} as const;

const structureResponseSchema = {
    anyOf: [
        monsterStructureResponseSchema,
        tokenStructureSchema,
        spellStructureSchema,
        trapStructureSchema,
        { type: 'null' },
    ],
} as const;

const monsterStructureInputSchema = {
    type: 'object',
    additionalProperties: false,
    required: [
        'kind', 'summon_kind', 'attribute_code', 'race_code',
        'level', 'rank', 'atk', 'def', 'pendulum_scale',
        'abilities', 'link_markers',
    ],
    properties: {
        kind: { type: 'string', const: 'MONSTER' },
        summon_kind: {
            anyOf: [
                { type: 'string', enum: [...SUMMON_KINDS] },
                { type: 'null' },
            ],
        },
        attribute_code: nullableStringSchema,
        race_code: nullableStringSchema,
        level: nullableIntegerSchema,
        rank: nullableIntegerSchema,
        atk: printedStatSchema,
        def: printedStatSchema,
        pendulum_scale: nullableIntegerSchema,
        abilities: { type: 'array', items: { type: 'string' } },
        link_markers: { type: 'array', items: { type: 'string' } },
    },
} as const;

const structureInputSchema = {
    anyOf: [
        monsterStructureInputSchema,
        tokenStructureSchema,
        spellStructureSchema,
        trapStructureSchema,
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

const libraryCardDetailResponseSchema = {
    type: 'object',
    additionalProperties: false,
    required: [
        'card_id', 'revision', 'family', 'password',
        'structure', 'localizations', 'confirmations',
        'classification', 'relations', 'provenance',
    ],
    properties: {
        card_id: { type: 'string' },
        revision: { type: 'string' },
        family: { type: 'string', enum: [...CANONICAL_CARD_FAMILIES] },
        password: nullableStringSchema,
        structure: structureResponseSchema,
        localizations: {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: false,
                required: ['language', 'name', 'card_text', 'pendulum_text'],
                properties: {
                    language: { type: 'string', enum: [...CANONICAL_LANGUAGES] },
                    name: nullableStringSchema,
                    card_text: nullableStringSchema,
                    pendulum_text: nullableStringSchema,
                },
            },
        },
        confirmations: {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: false,
                required: ['block', 'state', 'provenance_id'],
                properties: {
                    block: { type: 'string', enum: [...SEMANTIC_BLOCK_KEYS] },
                    state: { type: 'string', enum: ['DRAFT', 'CONFIRMED'] },
                    provenance_id: nullableIntegerSchema,
                },
            },
        },
        classification: {
            type: 'object',
            additionalProperties: false,
            required: ['effect_reviewed', 'archetypes', 'effect_classifiers', 'functional_tags'],
            properties: {
                effect_reviewed: { type: 'boolean' },
                archetypes: { type: 'array', items: registryEntitySchema },
                effect_classifiers: { type: 'array', items: registryEntitySchema },
                functional_tags: { type: 'array', items: registryEntitySchema },
            },
        },
        relations: {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: false,
                required: [
                    'relation_id', 'source_card_id', 'target_card_id',
                    'relation_type_code', 'note',
                ],
                properties: {
                    relation_id: { type: 'string' },
                    source_card_id: { type: 'string' },
                    target_card_id: { type: 'string' },
                    relation_type_code: { type: 'string' },
                    note: nullableStringSchema,
                },
            },
        },
        provenance: {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: false,
                required: [
                    'provenance_id', 'target_kind', 'target_key',
                    'source_kind', 'source_ref', 'note', 'created_at',
                ],
                properties: {
                    provenance_id: { type: 'integer' },
                    target_kind: { type: 'string' },
                    target_key: { type: 'string' },
                    source_kind: { type: 'string' },
                    source_ref: nullableStringSchema,
                    note: nullableStringSchema,
                    created_at: { type: 'string' },
                },
            },
        },
    },
} as const;

const libraryEditorMetadataResponseSchema = {
    type: 'object',
    additionalProperties: false,
    required: [
        'languages', 'summon_kinds', 'attributes', 'races', 'abilities',
        'link_markers', 'spell_subtypes', 'trap_subtypes',
        'archetypes', 'effect_classifiers', 'functional_tags', 'relation_types',
    ],
    properties: {
        languages: { type: 'array', items: { type: 'string', enum: [...CANONICAL_LANGUAGES] } },
        summon_kinds: { type: 'array', items: { type: 'string' } },
        attributes: { type: 'array', items: { type: 'string' } },
        races: { type: 'array', items: { type: 'string' } },
        abilities: { type: 'array', items: { type: 'string' } },
        link_markers: { type: 'array', items: { type: 'string' } },
        spell_subtypes: { type: 'array', items: { type: 'string' } },
        trap_subtypes: { type: 'array', items: { type: 'string' } },
        archetypes: { type: 'array', items: registryEntitySchema },
        effect_classifiers: { type: 'array', items: registryEntitySchema },
        functional_tags: { type: 'array', items: registryEntitySchema },
        relation_types: { type: 'array', items: { type: 'string' } },
    },
} as const;

const createCardBodySchema = {
    type: 'object',
    additionalProperties: false,
    required: ['family'],
    properties: {
        family: { type: 'string', enum: [...CANONICAL_CARD_FAMILIES] },
        password: nullableStringSchema,
    },
} as const;

const patchCardBodySchema = {
    type: 'object',
    additionalProperties: false,
    required: ['expected_revision'],
    properties: {
        expected_revision: { type: 'string', minLength: 1 },
        password: nullableStringSchema,
        structure: structureInputSchema,
        localizations: {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: false,
                required: ['language', 'name', 'card_text', 'pendulum_text'],
                properties: {
                    language: { type: 'string', enum: [...CANONICAL_LANGUAGES] },
                    name: nullableStringSchema,
                    card_text: nullableStringSchema,
                    pendulum_text: nullableStringSchema,
                },
            },
        },
        classification: {
            type: 'object',
            additionalProperties: false,
            properties: {
                effect_reviewed: { type: 'boolean' },
                archetype_ids: { type: 'array', items: { type: 'string' } },
                effect_classifier_ids: { type: 'array', items: { type: 'string' } },
                functional_tag_ids: { type: 'array', items: { type: 'string' } },
            },
        },
        relations: {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: false,
                required: ['target_card_id', 'relation_type_code'],
                properties: {
                    target_card_id: { type: 'string', minLength: 1 },
                    relation_type_code: { type: 'string', minLength: 1 },
                    note: nullableStringSchema,
                    provenance: sourceProvenanceSchema,
                },
            },
        },
        confirmations: {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: false,
                required: ['block', 'state'],
                properties: {
                    block: { type: 'string', enum: [...SEMANTIC_BLOCK_KEYS] },
                    state: { type: 'string', enum: ['DRAFT', 'CONFIRMED'] },
                    provenance: sourceProvenanceSchema,
                },
            },
        },
        provenance: {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: false,
                required: ['target_kind', 'target_key', 'source_kind'],
                properties: {
                    target_kind: { type: 'string', minLength: 1 },
                    target_key: { type: 'string', minLength: 1 },
                    source_kind: { type: 'string', minLength: 1 },
                    source_ref: nullableStringSchema,
                    note: nullableStringSchema,
                },
            },
        },
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

const isSqliteConstraintError = (error: unknown): error is Error =>
    error instanceof Error
    && (
        error.message.includes('FOREIGN KEY constraint failed')
        || error.message.includes('CHECK constraint failed')
        || error.message.includes('UNIQUE constraint failed')
        || error.message.includes('NOT NULL constraint failed')
    );

const sendDomainError = (reply: FastifyReply, error: CanonicalDomainError) => {
    if (error.code === 'NOT_FOUND') {
        return reply.code(404).send({ code: 'NOT_FOUND', message: error.message });
    }
    if (error.code === 'REVISION_CONFLICT') {
        return reply.code(409).send({ code: 'REVISION_CONFLICT', message: error.message });
    }
    return reply.code(422).send({ code: 'DOMAIN_VALIDATION', message: error.message });
};

const sendMutationFailure = (reply: FastifyReply, error: unknown) => {
    if (error instanceof CanonicalDomainError) {
        return sendDomainError(reply, error);
    }
    if (isSqliteConstraintError(error)) {
        return reply.code(422).send({
            code: 'DOMAIN_VALIDATION',
            message: error.message,
        });
    }
    throw error;
};

const workspaceNotReady = (reply: FastifyReply, status: WorkspaceStatus) =>
    reply.code(503).send({
        code: 'WORKSPACE_NOT_READY',
        message: `Workspace is not READY (state: ${status.state}).`,
    });

const sendManagedIngestError = (reply: FastifyReply, error: ManagedAssetIngestError) => {
    const map: Record<string, number> = {
        NOT_FOUND: 404,
        IDEMPOTENCY_CONFLICT: 409,
        TARGET_CONFLICT: 409,
        DESTINATION_CONFLICT: 409,
        INVALID_ROLE: 422,
        INVALID_VARIANT: 422,
        INVALID_SOURCE: 422,
        INVALID_IMAGE: 422,
        UNSAFE_PATH: 422,
        PUBLISH_FAILED: 500,
        PERSISTENCE_FAILED: 500,
        INDEX_RECONCILIATION_FAILED: 500,
    };
    const statusCode = map[error.code] ?? 500;
    return reply.code(statusCode).send({ code: error.code, message: error.message });
};

export const buildWorkspaceApp = (
    status: WorkspaceStatus,
    {
        logger = false,
        library = null,
        canonical = null,
        persistence = null,
        assets = null,
        managedAssets = null,
        libraryAssets = null,
        carderPrepare = null,
        workspaceRoot = '',
    }: {
        logger?: boolean;
        library?: LibraryQueryService | null;
        canonical?: CanonicalDomainService | null;
        persistence?: WorkspacePersistence | null;
        assets?: AssetIndexerService | null;
        managedAssets?: ManagedAssetIngestService | null;
        libraryAssets?: LibraryAssetService | null;
        carderPrepare?: CarderPrepareService | null;
        workspaceRoot?: string;
    } = {},
): FastifyInstance => {
    const app = Fastify({
        logger,
        ajv: {
            customOptions: {
                // Reject undeclared body/query properties (do not silently strip family/link_rating).
                removeAdditional: false,
            },
        },
    });

    const requireReadyLibrary = () =>
        library && status.state === 'READY' ? library : null;

    const requireReadyCanonical = () =>
        canonical && status.state === 'READY' ? canonical : null;

    const requireReadyPersistence = () =>
        persistence && status.state === 'READY' ? persistence : null;

    const requireReadyLibraryAssets = () =>
        libraryAssets && status.state === 'READY' ? libraryAssets : null;

    const requireReadyCarderPrepare = () =>
        carderPrepare && status.state === 'READY' ? carderPrepare : null;

    const requireReadyPersistenceForCarder = () =>
        persistence && status.state === 'READY' ? persistence : null;

    // Keep references so callers/tests can assert injection without unused-binding elision.
    void assets;
    void managedAssets;

    const sendCarderError = (reply: FastifyReply, error: CarderPrepareError) => {
        if (error.code === 'NOT_FOUND') {
            return reply.code(404).send({ code: 'NOT_FOUND', message: error.message });
        }
        if (error.code === 'REVISION_CONFLICT') {
            return reply.code(409).send({ code: 'REVISION_CONFLICT', message: error.message });
        }
        if (error.code === 'ASSET_STALE') {
            return reply.code(409).send({ code: 'ASSET_STALE', message: error.message });
        }
        if (error.code === 'CARDER_MAPPING_UNSUPPORTED') {
            return reply.code(422).send({ code: 'CARDER_MAPPING_UNSUPPORTED', message: error.message });
        }
        return reply.code(422).send({ code: 'CARDER_PREPARATION_NOT_READY', message: error.message });
    };

    const prepareWorkingCardBodySchema = {
        type: 'object',
        additionalProperties: false,
        required: ['card_id', 'variant_id', 'composition', 'content_language', 'expected_revision'],
        properties: {
            card_id: { type: 'string', minLength: 1 },
            variant_id: { type: 'string', minLength: 1 },
            composition: { type: 'string', enum: ['STANDARD', 'OVERFRAME'] },
            content_language: { type: 'string', enum: [...CANONICAL_LANGUAGES] },
            expected_revision: { type: 'string', minLength: 1 },
        },
    } as const;

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
        const libraryService = requireReadyLibrary();
        if (!libraryService) {
            return workspaceNotReady(reply, status);
        }
        const input: LibraryBrowseInput = {
            ...(query.query !== undefined ? { query: query.query } : {}),
            ...(query.preferred_language !== undefined
                ? { preferredLanguage: query.preferred_language }
                : {}),
            ...(query.family !== undefined ? { family: query.family } : {}),
            ...(query.archetype !== undefined ? { archetype: query.archetype } : {}),
            ...(query.effect_classifier !== undefined
                ? { effectClassifier: query.effect_classifier }
                : {}),
            ...(query.functional_tag !== undefined
                ? { functionalTag: query.functional_tag }
                : {}),
            ...(query.limit !== undefined ? { limit: query.limit } : {}),
            ...(query.offset !== undefined ? { offset: query.offset } : {}),
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
        const libraryService = requireReadyLibrary();
        if (!libraryService) {
            return workspaceNotReady(reply, status);
        }
        return libraryService.facets();
    });

    app.get('/api/v1/library/editor-metadata', {
        schema: {
            response: {
                200: libraryEditorMetadataResponseSchema,
                503: libraryErrorResponseSchema,
            },
        },
    }, async (_request, reply) => {
        const readyPersistence = requireReadyPersistence();
        if (!readyPersistence) {
            return workspaceNotReady(reply, status);
        }
        return loadLibraryEditorMetadata(readyPersistence);
    });

    app.get<{ Params: { card_id: string } }>('/api/v1/library/cards/:card_id', {
        schema: {
            params: {
                type: 'object',
                additionalProperties: false,
                required: ['card_id'],
                properties: {
                    card_id: { type: 'string', minLength: 1 },
                },
            },
            response: {
                200: libraryCardDetailResponseSchema,
                404: libraryErrorResponseSchema,
                503: libraryErrorResponseSchema,
            },
        },
    }, async (request, reply) => {
        const domain = requireReadyCanonical();
        if (!domain) {
            return workspaceNotReady(reply, status);
        }
        try {
            const snapshot = domain.getCard(request.params.card_id);
            if (!snapshot) {
                return reply.code(404).send({
                    code: 'NOT_FOUND',
                    message: `Canonical card ${request.params.card_id} was not found.`,
                });
            }
            return toLibraryCardDetailDto(snapshot);
        } catch (error) {
            if (error instanceof CanonicalDomainError) {
                return sendDomainError(reply, error);
            }
            throw error;
        }
    });

    app.post<{ Body: CreateLibraryCardBody }>('/api/v1/library/cards', {
        schema: {
            body: createCardBodySchema,
            response: {
                200: libraryCardDetailResponseSchema,
                422: libraryErrorResponseSchema,
                503: libraryErrorResponseSchema,
            },
        },
    }, async (request, reply) => {
        const domain = requireReadyCanonical();
        if (!domain) {
            return workspaceNotReady(reply, status);
        }
        try {
            const snapshot = domain.createCard(toCreateCanonicalCardInput(request.body));
            return toLibraryCardDetailDto(snapshot);
        } catch (error) {
            return sendMutationFailure(reply, error);
        }
    });

    app.patch<{ Params: { card_id: string }; Body: PatchLibraryCardBody }>(
        '/api/v1/library/cards/:card_id',
        {
            schema: {
                params: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['card_id'],
                    properties: {
                        card_id: { type: 'string', minLength: 1 },
                    },
                },
                body: patchCardBodySchema,
                response: {
                    200: libraryCardDetailResponseSchema,
                    404: libraryErrorResponseSchema,
                    409: libraryErrorResponseSchema,
                    422: libraryErrorResponseSchema,
                    503: libraryErrorResponseSchema,
                },
            },
        },
        async (request, reply) => {
            const domain = requireReadyCanonical();
            if (!domain) {
                return workspaceNotReady(reply, status);
            }
            try {
                const { expectedRevision, mutation } = toCanonicalCardMutation(request.body);
                const snapshot = domain.mutateCard(
                    request.params.card_id,
                    expectedRevision,
                    mutation,
                );
                return toLibraryCardDetailDto(snapshot);
            } catch (error) {
                return sendMutationFailure(reply, error);
            }
        },
    );

    app.get<{ Params: { card_id: string } }>('/api/v1/library/cards/:card_id/variants', {
        schema: {
            params: {
                type: 'object',
                additionalProperties: false,
                required: ['card_id'],
                properties: {
                    card_id: { type: 'string', minLength: 1 },
                },
            },
            response: {
                404: libraryErrorResponseSchema,
                503: libraryErrorResponseSchema,
            },
        },
    }, async (request, reply) => {
        const service = requireReadyLibraryAssets();
        if (!service) {
            return workspaceNotReady(reply, status);
        }
        try {
            return service.getVariants(request.params.card_id);
        } catch (error) {
            if (error instanceof LibraryAssetNotFoundError) {
                return reply.code(404).send({ code: 'NOT_FOUND', message: error.message });
            }
            throw error;
        }
    });

    app.get('/api/v1/library/needs-attention', {
        schema: {
            response: {
                503: libraryErrorResponseSchema,
            },
        },
    }, async (_request, reply) => {
        const service = requireReadyLibraryAssets();
        if (!service) {
            return workspaceNotReady(reply, status);
        }
        return service.getNeedsAttention();
    });

    app.post('/api/v1/library/assets/rescan', {
        schema: {
            response: {
                503: libraryErrorResponseSchema,
            },
        },
    }, async (_request, reply) => {
        const service = requireReadyLibraryAssets();
        if (!service) {
            return workspaceNotReady(reply, status);
        }
        return service.rescan();
    });

    app.post<{
        Params: { card_id: string };
        Body: {
            variant_key: string;
            role: string;
            source_file: string;
            idempotency_key: string;
        };
    }>('/api/v1/library/cards/:card_id/managed-assets', {
        schema: {
            params: {
                type: 'object',
                additionalProperties: false,
                required: ['card_id'],
                properties: {
                    card_id: { type: 'string', minLength: 1 },
                },
            },
            body: {
                type: 'object',
                additionalProperties: false,
                required: ['variant_key', 'role', 'source_file', 'idempotency_key'],
                properties: {
                    variant_key: { type: 'string', minLength: 1 },
                    role: { type: 'string', minLength: 1 },
                    source_file: { type: 'string', minLength: 1 },
                    idempotency_key: { type: 'string', minLength: 1 },
                },
            },
            response: {
                404: libraryErrorResponseSchema,
                409: libraryErrorResponseSchema,
                422: libraryErrorResponseSchema,
                500: libraryErrorResponseSchema,
                503: libraryErrorResponseSchema,
            },
        },
    }, async (request, reply) => {
        const service = requireReadyLibraryAssets();
        if (!service) {
            return workspaceNotReady(reply, status);
        }
        try {
            return await service.ingestManaged(request.params.card_id, request.body);
        } catch (error) {
            if (error instanceof LibraryAssetNotFoundError) {
                return reply.code(404).send({ code: 'NOT_FOUND', message: error.message });
            }
            if (error instanceof ManagedAssetIngestError) {
                return sendManagedIngestError(reply, error);
            }
            throw error;
        }
    });


    app.post<{ Body: PrepareWorkingCardHttpBody }>('/api/v1/carder/prepare-working-card', {
        schema: {
            body: prepareWorkingCardBodySchema,
            response: {
                404: libraryErrorResponseSchema,
                409: libraryErrorResponseSchema,
                422: libraryErrorResponseSchema,
                503: libraryErrorResponseSchema,
            },
        },
    }, async (request, reply) => {
        const service = requireReadyCarderPrepare();
        if (!service) {
            return workspaceNotReady(reply, status);
        }
        try {
            return service.prepareWorkingCard(toPrepareWorkingCardRequest(request.body));
        } catch (error) {
            if (error instanceof CarderPrepareError) {
                return sendCarderError(reply, error);
            }
            throw error;
        }
    });

    app.get<{
        Params: { asset_id: string };
        Querystring: { hash?: string; path?: string };
    }>('/api/v1/carder/assets/:asset_id/content', {
        schema: {
            params: {
                type: 'object',
                additionalProperties: false,
                required: ['asset_id'],
                properties: {
                    asset_id: { type: 'string', minLength: 1 },
                },
            },
            querystring: {
                type: 'object',
                additionalProperties: false,
                properties: {
                    hash: { type: 'string' },
                    path: { type: 'string' },
                },
            },
            response: {
                409: libraryErrorResponseSchema,
                503: libraryErrorResponseSchema,
            },
        },
    }, async (request, reply) => {
        const readyPersistence = requireReadyPersistenceForCarder();
        if (!readyPersistence || status.state !== 'READY') {
            return workspaceNotReady(reply, status);
        }
        // Reject path-like client inputs as a content source (Design §43).
        if (typeof request.query.path === 'string' && request.query.path.length > 0) {
            return reply.code(409).send({
                code: 'ASSET_STALE',
                message: 'Filesystem path query is not accepted for asset content.',
            });
        }
        try {
            const resolved = await resolveAssetContent(
                workspaceRoot,
                readyPersistence,
                request.params.asset_id,
                request.query.hash,
            );
            reply.header('Cache-Control', 'no-store');
            reply.header('Content-Type', resolved.contentType);
            reply.header('Content-Length', String(resolved.sizeBytes));
            return reply.send(resolved.bytes);
        } catch (error) {
            if (error instanceof CarderPrepareError) {
                return sendCarderError(reply, error);
            }
            throw error;
        }
    });

    return app;
};
