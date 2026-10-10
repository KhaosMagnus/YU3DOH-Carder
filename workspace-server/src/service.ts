import type { AssetMutationService, MutationHooks } from './asset-mutation/service';
import { WorkspaceRuntimeManager } from './workspace/runtime';
import { WorkspaceRecoveryService } from './recovery/service';
import type { RecoveryHooks } from './recovery/types';
import type { FastifyInstance } from 'fastify';
import type { AssetIndexerService } from './assets/indexer';
import type { CanonicalDomainService } from './canonical/service';
import type { ManagedAssetIngestService } from './managed-assets/service';
import type { LibraryAssetService } from './library/asset-service';
import type { LibraryQueryService } from './library/service';
import { CarderAssetGrantRegistry } from './carder/asset-grants';
import type { CarderPrepareService } from './carder/prepare-service';
import { buildWorkspaceApp } from './app';
import type { WorkspaceServiceConfig } from './config';
import type { WorkspacePersistence } from './persistence/database';
import { inspectWorkspaceRootWithPersistence } from './workspace/inspect';
import type { WorkspaceStatus } from './workspace/types';

export type WorkspaceService = {
    app: FastifyInstance;
    runtime: WorkspaceRuntimeManager;
    recovery: WorkspaceRecoveryService;
    status: WorkspaceStatus;
    persistence: WorkspacePersistence | null;
    canonical: CanonicalDomainService | null;
    assets: AssetIndexerService | null;
    managedAssets: ManagedAssetIngestService | null;
    library: LibraryQueryService | null;
    libraryAssets: LibraryAssetService | null;
    assetMutations: AssetMutationService | null;
    carderPrepare: CarderPrepareService | null;
    /** In-memory, per-process prepared-composition grants (QA-009-08). Exposed for tests. */
    carderAssetGrants: CarderAssetGrantRegistry;
    close: () => Promise<void>;
};

export const createWorkspaceService = async (
    config: WorkspaceServiceConfig,
    {
        logger = false,
        recoveryHooks = {},
        mutationHooks = {},
        carderAssetGrants = new CarderAssetGrantRegistry(),
    }: {
        logger?: boolean;
        recoveryHooks?: RecoveryHooks;
        mutationHooks?: MutationHooks;
        /** Test hook only (e.g. a registry with an injected clock). Never persisted. */
        carderAssetGrants?: CarderAssetGrantRegistry;
    } = {},
): Promise<WorkspaceService> => {
    const inspection = await inspectWorkspaceRootWithPersistence(config.workspaceRoot);
    const runtime = new WorkspaceRuntimeManager(config.workspaceRoot, inspection, carderAssetGrants, mutationHooks);
    const recovery = new WorkspaceRecoveryService(runtime, config.automaticRecoveryPointRetention ?? 10, recoveryHooks);
    const app = buildWorkspaceApp(runtime.current.status, {
        logger, runtimeManager: runtime, recovery, workspaceRoot: config.workspaceRoot,
    });
    let closePromise: Promise<void> | undefined;

    const close = () => {
        closePromise ??= (async () => {
            try {
                await app.close();
            } finally {
                runtime.closePersistence();
            }
        })();
        return closePromise;
    };

    return {
        app, runtime, recovery,
        get status() { return runtime.current.status; },
        get persistence() { return runtime.current.persistence; },
        get canonical() { return runtime.current.canonical; },
        get assets() { return runtime.current.assets; },
        get managedAssets() { return runtime.current.managedAssets; },
        get library() { return runtime.current.library; },
        get libraryAssets() { return runtime.current.libraryAssets; },
        get assetMutations() { return runtime.current.assetMutations; },
        get carderPrepare() { return runtime.current.carderPrepare; },
        get carderAssetGrants() { return runtime.current.carderAssetGrants; },
        close,
    };
};
