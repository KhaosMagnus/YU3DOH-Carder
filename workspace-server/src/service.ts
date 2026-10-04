import type { FastifyInstance } from 'fastify';
import { buildWorkspaceApp } from './app';
import type { WorkspaceServiceConfig } from './config';
import { inspectWorkspaceRoot } from './workspace/inspect';
import type { WorkspaceStatus } from './workspace/types';

export type WorkspaceService = {
    app: FastifyInstance;
    status: WorkspaceStatus;
    close: () => Promise<void>;
};

export const createWorkspaceService = async (
    config: WorkspaceServiceConfig,
    { logger = false }: { logger?: boolean } = {},
): Promise<WorkspaceService> => {
    const status = await inspectWorkspaceRoot(config.workspaceRoot);
    const app = buildWorkspaceApp(status, { logger });
    let closed = false;

    return {
        app,
        status,
        close: async () => {
            if (closed) return;
            closed = true;
            await app.close();
        },
    };
};
