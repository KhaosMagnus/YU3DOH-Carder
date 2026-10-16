import type { FastifyInstance } from 'fastify';
import type { WorkspaceRuntimeManager } from '../workspace/runtime';
import { CanonicalDomainError } from '../canonical/errors';
import { ExternalSourceError } from './errors';
import {
    assertStructureRequest,
    structureBodySchema,
    structureResponseSchema,
    StructureAcceptanceError,
} from './structure-acceptance-dto';

export function registerStructureAcceptanceRoutes(
    app: FastifyInstance,
    runtime: WorkspaceRuntimeManager,
) {
    for (const apply of [false, true])
        app.post<{ Params: { candidate_id: string } }>(
            `/api/v1/library/external-sources/candidates/:candidate_id/${apply ? 'apply' : 'preview'}-structure`,
            {
                preValidation: async (request) => {
                    assertStructureRequest(request.body, apply);
                    if (!request.params.candidate_id.trim())
                        throw new StructureAcceptanceError(
                            'EXTERNAL_STRUCTURE_OPERATION_INVALID',
                            'candidate_id must be non-empty.',
                        );
                },
                schema: {
                    body: structureBodySchema(apply),
                    response: { 200: structureResponseSchema(apply) },
                },
                errorHandler: (error, _request, reply) => {
                    if (
                        error.validation ||
                        error.code?.startsWith('FST_ERR_CTP_')
                    )
                        return reply
                            .code(400)
                            .send({
                                code: 'EXTERNAL_STRUCTURE_OPERATION_INVALID',
                                message:
                                    'Malformed STRUCTURE acceptance request.',
                            });
                    if (error instanceof StructureAcceptanceError)
                        return reply
                            .code(error.statusCode)
                            .send({
                                code: error.code,
                                message: error.message,
                                ...(error.reason_codes.length
                                    ? { reason_codes: error.reason_codes }
                                    : {}),
                                ...(error.code ===
                                'CONFIRMED_BLOCK_DEPENDENCY_CONFLICT'
                                    ? { blocking_blocks: error.blocking_blocks }
                                    : {}),
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
                    !current.externalStructureAcceptance
                )
                    throw new ExternalSourceError(
                        'WORKSPACE_NOT_READY',
                        'Workspace is not READY for STRUCTURE acceptance.',
                    );
                return apply
                    ? current.externalStructureAcceptance.applyStructure(
                          request.params.candidate_id,
                          request.body,
                      )
                    : current.externalStructureAcceptance.previewStructure(
                          request.params.candidate_id,
                          request.body,
                      );
            },
        );
}
