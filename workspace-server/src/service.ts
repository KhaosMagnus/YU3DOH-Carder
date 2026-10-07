import type { FastifyInstance } from 'fastify';
import { AssetIndexerService } from './assets/indexer';
import { CanonicalDomainService } from './canonical/service';
import { ManagedAssetIngestService } from './managed-assets/service';
import { LibraryQueryService } from './library/service';
import { buildWorkspaceApp } from './app';
import type { WorkspaceServiceConfig } from './config';
import type { WorkspacePersistence } from './persistence/database';
import { inspectWorkspaceRootWithPersistence } from './workspace/inspect';
import type { WorkspaceStatus } from './workspace/types';

export type WorkspaceService = {
    app: FastifyInstance;
    status: WorkspaceStatus;
    persistence: WorkspacePersistence | null;
    canonical: CanonicalDomainService | null;
    assets: AssetIndexerService | null;
    managedAssets: ManagedAssetIngestService | null;
    library: LibraryQueryService | null;
    close: () => Promise<void>;
};

export const createWorkspaceService = async (
    config: WorkspaceServiceConfig,
    { logger = false }: { logger?: boolean } = {},
): Promise<WorkspaceService> => {
    const inspection = await inspectWorkspaceRootWithPersistence(config.workspaceRoot);
    const { status, persistence } = inspection;
    const canonical = persistence ? new CanonicalDomainService(persistence) : null;
    const assets = persistence ? new AssetIndexerService(config.workspaceRoot, persistence) : null;
    const managedAssets = persistence && assets
        ? new ManagedAssetIngestService(config.workspaceRoot, persistence, assets)
        : null;
    const library = persistence ? new LibraryQueryService(persistence) : null;
    const app = buildWorkspaceApp(status, { logger, library, canonical, persistence });
    let closePromise: Promise<void> | undefined;

    const close = () => {
        closePromise ??= (async () => {
            try {
                await app.close();
            } finally {
                persistence?.close();
            }
        })();
        return closePromise;
    };

    return {
        app,
        status,
        persistence,
        canonical,
        assets,
        managedAssets,
        library,
        close,
    };
};
