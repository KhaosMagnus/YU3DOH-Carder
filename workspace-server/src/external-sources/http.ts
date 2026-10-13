import type { FastifyInstance } from 'fastify';
import type { WorkspaceRuntimeManager } from '../workspace/runtime';
import { ExternalSourceError } from './errors';
import type { RetrieveRequest, Target } from './types';

export const RETRIEVE_ROUTE =
    '/api/v1/library/external-sources/ygoresources/retrieve';
const text = { type: 'string', minLength: 1 };
const targetSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['target_card_id', 'target_expected_revision'],
    properties: { target_card_id: text, target_expected_revision: text },
};
function assertTransport(body: unknown, retrieve = false) {
    if (!body || typeof body !== 'object' || Array.isArray(body))
        throw new ExternalSourceError(
            'INVALID_REQUEST',
            'Expected an object request.',
        );
    const values = body as Record<string, unknown>;
    for (const key of [
        'target_card_id',
        'target_expected_revision',
        ...(retrieve ? ['external_card_id'] : []),
    ]) {
        if (typeof values[key] !== 'string')
            throw new ExternalSourceError(
                'INVALID_REQUEST',
                `${key} must be transported as a string.`,
            );
    }
}
export function registerExternalSourceRoutes(
    app: FastifyInstance,
    runtime: WorkspaceRuntimeManager,
) {
    const service = () => {
        const current = runtime.current;
        if (
            current.status.state !== 'READY' ||
            !current.externalSourceIngestion
        )
            throw new ExternalSourceError(
                'WORKSPACE_NOT_READY',
                'Workspace is not READY for External Sources.',
            );
        return current.externalSourceIngestion;
    };
    app.post<{ Body: RetrieveRequest }>(
        RETRIEVE_ROUTE,
        {
            preValidation: async (request) =>
                assertTransport(request.body, true),
            schema: {
                body: {
                    ...targetSchema,
                    required: [...targetSchema.required, 'external_card_id'],
                    properties: {
                        ...targetSchema.properties,
                        external_card_id: text,
                    },
                },
            },
        },
        async (request) => service().retrieve(request.body),
    );
    app.get<{ Params: { card_id: string } }>(
        '/api/v1/library/cards/:card_id/external-sources',
        async (request) => service().history(request.params.card_id),
    );
    app.get<{
        Params: { retrieval_id: string };
        Querystring: { include_raw?: boolean };
    }>(
        '/api/v1/library/external-sources/retrievals/:retrieval_id',
        {
            schema: {
                querystring: {
                    type: 'object',
                    additionalProperties: false,
                    properties: { include_raw: { type: 'boolean' } },
                },
            },
        },
        async (request) =>
            service().detail(
                request.params.retrieval_id,
                request.query.include_raw ?? false,
            ),
    );
    app.post<{ Params: { candidate_id: string }; Body: Target }>(
        '/api/v1/library/external-sources/candidates/:candidate_id/diff',
        {
            preValidation: async (request) => assertTransport(request.body),
            schema: { body: targetSchema },
        },
        async (request) =>
            service().diff(request.params.candidate_id, request.body),
    );
}
