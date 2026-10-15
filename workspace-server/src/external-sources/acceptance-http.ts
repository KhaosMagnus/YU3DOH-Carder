import type { FastifyInstance } from 'fastify';
import type { WorkspaceRuntimeManager } from '../workspace/runtime';
import { CanonicalDomainError } from '../canonical/errors';
import { ExternalSourceError } from './errors';
import {
    applyTextBodySchema,
    applyTextResponseSchema,
    assertApplyTextRequest,
} from './acceptance-dto';
export function registerExternalAcceptanceRoute(
    app: FastifyInstance,
    runtime: WorkspaceRuntimeManager,
) {
    app.post<{ Params: { candidate_id: string } }>(
        '/api/v1/library/external-sources/candidates/:candidate_id/apply-text',
        {
            preValidation: async (request) =>
                assertApplyTextRequest(request.body),
            schema: {
                body: applyTextBodySchema,
                response: { 200: applyTextResponseSchema },
            },
            errorHandler: (error, _request, reply) => {
                if (error.validation || error.code?.startsWith('FST_ERR_CTP_'))
                    return reply
                        .code(400)
                        .send({
                            code: 'EXTERNAL_APPLY_OPERATION_INVALID',
                            message: 'Malformed TEXT acceptance request.',
                        });
                if (error instanceof CanonicalDomainError)
                    return reply
                        .code(
                            error.code === 'DOMAIN_VALIDATION'
                                ? 422
                                : error.code === 'NOT_FOUND'
                                  ? 404
                                  : 409,
                        )
                        .send({ code: error.code, message: error.message });
                throw error;
            },
        },
        async (request) => {
            const current = runtime.current;
            if (
                current.status.state !== 'READY' ||
                current.status.read_only ||
                !current.externalSourceAcceptance
            )
                throw new ExternalSourceError(
                    'WORKSPACE_NOT_READY',
                    'Workspace is not READY for TEXT acceptance.',
                );
            return current.externalSourceAcceptance.applyText(
                request.params.candidate_id,
                request.body,
            );
        },
    );
}
