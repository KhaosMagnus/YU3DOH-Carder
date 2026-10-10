import { VariantLifecycleService } from '../variant-lifecycle/service';
import { AssetMutationService, type MutationHooks } from '../asset-mutation/service';
import { AssetIndexerService } from '../assets/indexer';
import { CanonicalDomainService } from '../canonical/service';
import { ManagedAssetIngestService } from '../managed-assets/service';
import { LibraryAssetService } from '../library/asset-service';
import { LibraryQueryService } from '../library/service';
import { CarderAssetGrantRegistry } from '../carder/asset-grants';
import { CarderPrepareService } from '../carder/prepare-service';
import type { WorkspacePersistence } from '../persistence/database';
import { inspectWorkspaceRootWithPersistence } from './inspect';
import type { WorkspaceInspection } from './inspect';
import { WorkspaceMaintenanceCoordinator } from './maintenance';
import type { WorkspaceStatus } from './types';

export type WorkspaceRuntime = {
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
    carderAssetGrants: CarderAssetGrantRegistry;
};

/** All routes and service getters resolve this owner; obsolete connections are closed. */
export class WorkspaceRuntimeManager {
    private runtime: WorkspaceRuntime;
    readonly maintenance = new WorkspaceMaintenanceCoordinator();

    constructor(readonly workspaceRoot: string, inspection: WorkspaceInspection,
        grants = new CarderAssetGrantRegistry(), private readonly mutationHooks: MutationHooks = {}, private readonly lifecycleHooks: MutationHooks = {}) {
        this.runtime = this.build(inspection, grants);
    }

    get current() { return this.runtime; }

    private build({ status, persistence }: WorkspaceInspection, grants: CarderAssetGrantRegistry): WorkspaceRuntime {
        persistence?.attachMaintenance(this.maintenance);
        const guard = <T extends object>(service: T, mutations: string[] = []) => this.maintenance.guard(service, mutations);
        const canonical = persistence ? guard(new CanonicalDomainService(persistence),
            ['registerStructuralCode', 'registerNamedEntity', 'createCard', 'mutateCard', 'addProvenance']) : null;
        const assets = persistence ? guard(new AssetIndexerService(this.workspaceRoot, persistence), ['scan']) : null;
        const managedAssets = persistence && assets
            ? guard(new ManagedAssetIngestService(this.workspaceRoot, persistence, assets), ['ingest']) : null;
        const library = persistence ? guard(new LibraryQueryService(persistence)) : null;
        const assetMutations = persistence && assets ? guard(new AssetMutationService(this.workspaceRoot, persistence,
            assets, message => this.recoveryRequired(message), this.mutationHooks), ['refresh', 'resolve', 'mutate']) : null;
        const libraryAssets = persistence && assets && managedAssets && canonical && assetMutations
            ? guard(new LibraryAssetService(persistence, assets, managedAssets, canonical, assetMutations.tokens), ['rescan', 'ingestManaged']) : null;
        const variantLifecycle = persistence && assets && libraryAssets && assetMutations
            ? guard(new VariantLifecycleService(this.workspaceRoot, persistence, assets, libraryAssets, assetMutations.tokens, grants,
                message => this.recoveryRequired(message), this.lifecycleHooks), ['setPreferred', 'rename', 'remove']) : null;
        const carderPrepare = persistence && assets && canonical
            ? guard(new CarderPrepareService(canonical, assets, grants)) : null;
        return { status, persistence, canonical, assets, managedAssets, library, libraryAssets, assetMutations, carderPrepare, variantLifecycle,
            carderAssetGrants: grants };
    }

    closePersistence() { this.runtime.persistence?.close(); }

    async reload(ignoreRestoreMarkers = false) {
        this.closePersistence();
        const inspection = await inspectWorkspaceRootWithPersistence(this.workspaceRoot, ignoreRestoreMarkers);
        // Restore revokes pre-restore in-memory prepared-composition capabilities.
        this.runtime = this.build(inspection, new CarderAssetGrantRegistry());
        return this.runtime.status;
    }

    recoveryRequired(message: string) {
        this.closePersistence();
        this.runtime = this.build({ status: { ...this.runtime.status, state: 'RECOVERY_REQUIRED',
            read_only: true, health_summary: message }, persistence: null }, new CarderAssetGrantRegistry());
    }
}
