import type { FastifyInstance } from 'fastify';
import { AssetIndexerService } from './assets/indexer';
import { CanonicalDomainService } from './canonical/service';
import { ManagedAssetIngestService } from './managed-assets/service';
import { LibraryAssetService } from './library/asset-service';
import { LibraryQueryService } from './library/service';
import { CarderAssetGrantRegistry } from './carder/asset-grants';
import { CarderPrepareService } from './carder/prepare-service';
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
    libraryAssets: LibraryAssetService | null;
    carderPrepare: CarderPrepareService | null;
    /** In-memory, per-process prepared-composition grants (QA-009-08). Exposed for tests. */
    carderAssetGrants: CarderAssetGrantRegistry;
    close: () => Promise<void>;
};

export const createWorkspaceService = async (
    config: WorkspaceServiceConfig,
    {
        logger = false,
        carderAssetGrants = new CarderAssetGrantRegistry(),
    }: {
        logger?: boolean;
        /** Test hook only (e.g. a registry with an injected clock). Never persisted. */
        carderAssetGrants?: CarderAssetGrantRegistry;
    } = {},
): Promise<WorkspaceService> => {
    const inspection = await inspectWorkspaceRootWithPersistence(config.workspaceRoot);
    const { status, persistence } = inspection;
    const canonical = persistence ? new CanonicalDomainService(persistence) : null;
    const assets = persistence ? new AssetIndexerService(config.workspaceRoot, persistence) : null;
    const managedAssets = persistence && assets
        ? new ManagedAssetIngestService(config.workspaceRoot, persistence, assets)
        : null;
    const library = persistence ? new LibraryQueryService(persistence) : null;
    const libraryAssets = persistence && assets && managedAssets && canonical
        ? new LibraryAssetService(persistence, assets, managedAssets, canonical)
        : null;
    const carderPrepare = persistence && assets && canonical
        ? new CarderPrepareService(canonical, assets, carderAssetGrants)
        : null;
    const app = buildWorkspaceApp(status, {
        logger,
        library,
        canonical,
        persistence,
        assets,
        managedAssets,
        libraryAssets,
        carderPrepare,
        carderAssetGrants,
        workspaceRoot: config.workspaceRoot,
    });
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
        libraryAssets,
        carderPrepare,
        carderAssetGrants,
        close,
    };
};
