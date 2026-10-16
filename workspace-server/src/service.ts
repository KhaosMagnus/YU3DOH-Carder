import type { ExternalStructureAcceptanceService } from './external-sources/structure-acceptance';
import { ExternalSourceAcceptanceService } from './external-sources/acceptance';
import { WorkspaceInitializationService, type InitializationHooks } from './workspace/initialization';
import type { ExternalSourceIngestionService } from './external-sources/service';
import type { AdapterOptions } from './external-sources/adapter';
import type { LibraryBatchClassificationService } from './library/batch-classification';
import type { VariantLifecycleService } from './variant-lifecycle/service';
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
import type { CarderWriteBackService } from './carder/write-back';
import type { CarderWriteGrantRegistry } from './carder/write-grants';
import type { CarderPrepareService } from './carder/prepare-service';
import { buildWorkspaceApp } from './app';
import type { WorkspaceServiceConfig } from './config';
import type { WorkspacePersistence } from './persistence/database';
import { inspectWorkspaceRootWithPersistence } from './workspace/inspect';
import type { WorkspaceStatus } from './workspace/types';

export type WorkspaceService = {
    externalSourceIngestion: ExternalSourceIngestionService | null;
    externalSourceAcceptance: ExternalSourceAcceptanceService | null;
    externalStructureAcceptance: ExternalStructureAcceptanceService | null;
    app: FastifyInstance;
    runtime: WorkspaceRuntimeManager;
    recovery: WorkspaceRecoveryService;
    initialization: WorkspaceInitializationService;
    status: WorkspaceStatus;
    persistence: WorkspacePersistence | null;
    canonical: CanonicalDomainService | null;
    assets: AssetIndexerService | null;
    managedAssets: ManagedAssetIngestService | null;
    library: LibraryQueryService | null;
    libraryAssets: LibraryAssetService | null;
    assetMutations: AssetMutationService | null;
    carderPrepare: CarderPrepareService | null;
    variantLifecycle: VariantLifecycleService | null;
    /** In-memory, per-process prepared-composition grants (QA-009-08). Exposed for tests. */
    carderAssetGrants: CarderAssetGrantRegistry;
    carderWriteGrants: CarderWriteGrantRegistry;
    carderWriteBack: CarderWriteBackService | null;
    libraryBatchClassification: LibraryBatchClassificationService | null;
    close: () => Promise<void>;
};

export const createWorkspaceService = async (
    config: WorkspaceServiceConfig,
    {
        logger = false,
        recoveryHooks = {},
        initializationHooks = {},
        mutationHooks = {},
        lifecycleHooks = {},
        externalSourceAdapterOptions = {},
        carderAssetGrants = new CarderAssetGrantRegistry(),
    }: {
        logger?: boolean;
        recoveryHooks?: RecoveryHooks;
        initializationHooks?: InitializationHooks;
        mutationHooks?: MutationHooks;
        lifecycleHooks?: MutationHooks;
        externalSourceAdapterOptions?: AdapterOptions;
        /** Test hook only (e.g. a registry with an injected clock). Never persisted. */
        carderAssetGrants?: CarderAssetGrantRegistry;
    } = {},
): Promise<WorkspaceService> => {
    if (config.enabledExternalSources !== undefined && (!Array.isArray(config.enabledExternalSources) || config.enabledExternalSources.some(code=>code !== 'YGORESOURCES_CARD_DB'))) throw new Error('Unknown External Source enablement.');
    const inspection = await inspectWorkspaceRootWithPersistence(config.workspaceRoot);
    const runtime = new WorkspaceRuntimeManager(config.workspaceRoot, inspection, carderAssetGrants, mutationHooks, lifecycleHooks,
        {enabled:config.enabledExternalSources?.includes('YGORESOURCES_CARD_DB') ?? false,adapterOptions:externalSourceAdapterOptions});
    const recovery = new WorkspaceRecoveryService(runtime, config.automaticRecoveryPointRetention ?? 10, recoveryHooks);
    const initialization=new WorkspaceInitializationService(runtime,initializationHooks);
    const app = buildWorkspaceApp(runtime.current.status, {
        logger, runtimeManager: runtime, recovery, initialization, workspaceRoot: config.workspaceRoot,
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
        app, runtime, recovery, initialization,
        get status() { return runtime.current.status; },
        get persistence() { return runtime.current.persistence; },
        get externalStructureAcceptance() { return runtime.current.externalStructureAcceptance; },
        get externalSourceAcceptance() { return runtime.current.externalSourceAcceptance; },
        get externalSourceIngestion() { return runtime.current.externalSourceIngestion; },
        get canonical() { return runtime.current.canonical; },
        get assets() { return runtime.current.assets; },
        get managedAssets() { return runtime.current.managedAssets; },
        get library() { return runtime.current.library; },
        get libraryAssets() { return runtime.current.libraryAssets; },
        get assetMutations() { return runtime.current.assetMutations; },
        get variantLifecycle() { return runtime.current.variantLifecycle; },
        get carderPrepare() { return runtime.current.carderPrepare; },
        get carderWriteGrants() { return runtime.current.carderWriteGrants; },
        get carderWriteBack() { return runtime.current.carderWriteBack; },
        get libraryBatchClassification() { return runtime.current.libraryBatchClassification; },
        get carderAssetGrants() { return runtime.current.carderAssetGrants; },
        close,
    };
};
