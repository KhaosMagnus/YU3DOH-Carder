import { loadWorkspaceConfig } from './config';
import { createWorkspaceService, type WorkspaceService } from './service';

const closeAfterStartupFailure = async (service: WorkspaceService | undefined) => {
    if (!service) return;
    try {
        await service.close();
    } catch {
        // Preserve the original startup error as the primary diagnostic.
    }
};

const run = async () => {
    const config = loadWorkspaceConfig();
    let service: WorkspaceService | undefined;

    try {
        service = await createWorkspaceService(config, { logger: true });
        let shuttingDown = false;

        const shutdown = async (signal: NodeJS.Signals) => {
            if (shuttingDown) return;
            shuttingDown = true;
            service?.app.log.info({ signal }, 'Workspace Service shutting down');
            try {
                await service?.close();
            } catch (error) {
                service?.app.log.error({ err: error }, 'Workspace Service shutdown failed');
                process.exitCode = 1;
            }
        };

        process.once('SIGINT', () => {
            void shutdown('SIGINT');
        });
        process.once('SIGTERM', () => {
            void shutdown('SIGTERM');
        });

        await service.app.listen({
            host: config.host,
            port: config.port,
        });

        service.app.log.info({
            host: config.host,
            port: config.port,
            state: service.status.state,
        }, 'YU3DOH Workspace Service started');
    } catch (error) {
        await closeAfterStartupFailure(service);
        throw error;
    }
};

void run().catch(error => {
    console.error('[workspace-service] startup failed:', error);
    process.exitCode = 1;
});
