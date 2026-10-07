import type {
    ArtVariantSnapshot,
    AssetRole,
    CompositionReadiness,
    IndexedAssetSnapshot,
} from '../assets/types';
import type { LatestCompletedScanRow, EnrichedDiagnosticRow } from '../assets/repository';
import type { ManagedAssetSnapshot } from '../managed-assets/types';

export type SlotState = 'EMPTY' | 'BOUND' | 'CONFLICT' | 'MISSING' | 'INVALID';

export type LibraryBoundAssetDto = {
    asset_id: string | null;
    relative_path: string;
    file_name: string;
    extension: string;
    image_width: number | null;
    image_height: number | null;
    has_transparency: boolean | null;
    present: boolean;
    valid_asset: boolean;
    ownership: 'managed' | 'unmanaged';
    managed_asset_id: string | null;
};

export type LibraryRoleSlotDto = {
    slot_state: SlotState;
    asset: LibraryBoundAssetDto | null;
    issues: Array<{ code: string; message: string }>;
};

export type LibraryVariantDetailDto = {
    variant_id: string;
    card_id: string;
    variant_key: string;
    display_label: string;
    standard: { state: 'READY' | 'INCOMPLETE'; sources: AssetRole[] };
    overframe: { state: 'READY' | 'INCOMPLETE'; sources: AssetRole[] };
    roles: Record<AssetRole, LibraryRoleSlotDto>;
};

export type LibraryVariantsResponseDto = {
    card_id: string;
    variants: LibraryVariantDetailDto[];
};

export type LibraryScanSummaryDto = {
    scan_id: string;
    started_at: string;
    completed_at: string;
    discovered_count: number;
    present_count: number;
    diagnostic_count: number;
};

export type LibraryNeedsAttentionItemDto = {
    diagnostic_id: string;
    code: string;
    relative_path: string;
    message: string;
    asset_id: string | null;
    card_id: string | null;
    variant_id: string | null;
    variant_key: string | null;
    role: string | null;
};

export type LibraryNeedsAttentionResponseDto = {
    latest_scan: LibraryScanSummaryDto | null;
    items: LibraryNeedsAttentionItemDto[];
};

export type LibraryManagedAssetDto = {
    managed_asset_id: string;
    variant_id: string;
    card_id: string;
    variant_key: string;
    display_label: string;
    role: AssetRole;
    managed_relative_path: string;
    content_hash: string;
    original_file_name: string;
    extension: string;
    created_at: string;
};

export type LibraryManagedIngestResponseDto = {
    managed_asset: LibraryManagedAssetDto;
    variant: LibraryVariantDetailDto | null;
    idempotent: boolean;
};

export const toScanSummaryDto = (scan: LatestCompletedScanRow): LibraryScanSummaryDto => ({
    scan_id: scan.scanId,
    started_at: scan.startedAt,
    completed_at: scan.completedAt,
    discovered_count: scan.discoveredCount,
    present_count: scan.presentCount,
    diagnostic_count: scan.diagnosticCount,
});

export const toNeedsAttentionItemDto = (
    row: EnrichedDiagnosticRow,
): LibraryNeedsAttentionItemDto => ({
    diagnostic_id: row.diagnosticId,
    code: row.code,
    relative_path: row.relativePath,
    message: row.message,
    asset_id: row.assetId,
    card_id: row.cardId,
    variant_id: row.variantId,
    variant_key: row.variantKey,
    role: row.role,
});

export const toManagedAssetDto = (snapshot: ManagedAssetSnapshot): LibraryManagedAssetDto => ({
    managed_asset_id: snapshot.managedAssetId,
    variant_id: snapshot.variantId,
    card_id: snapshot.cardId,
    variant_key: snapshot.variantKey,
    display_label: snapshot.displayLabel,
    role: snapshot.role,
    managed_relative_path: snapshot.managedRelativePath,
    content_hash: snapshot.contentHash,
    original_file_name: snapshot.originalFileName,
    extension: snapshot.extension,
    created_at: snapshot.createdAt,
});

const copyReadiness = (value: CompositionReadiness) => ({
    state: value.state,
    sources: [...value.sources] as AssetRole[],
});

const toBoundAssetDto = (
    asset: IndexedAssetSnapshot,
    ownership: 'managed' | 'unmanaged',
    managedAssetId: string | null,
): LibraryBoundAssetDto => ({
    asset_id: asset.assetId,
    relative_path: asset.relativePath,
    file_name: asset.fileName,
    extension: asset.extension,
    image_width: asset.imageWidth,
    image_height: asset.imageHeight,
    has_transparency: asset.hasTransparency,
    present: asset.present,
    valid_asset: asset.validAsset,
    ownership,
    managed_asset_id: managedAssetId,
});

const toManagedOnlyBoundDto = (
    managed: ManagedAssetSnapshot,
    indexed: IndexedAssetSnapshot | null,
): LibraryBoundAssetDto => ({
    asset_id: indexed?.assetId ?? null,
    relative_path: managed.managedRelativePath,
    file_name: managed.originalFileName,
    extension: managed.extension,
    image_width: indexed?.imageWidth ?? null,
    image_height: indexed?.imageHeight ?? null,
    has_transparency: indexed?.hasTransparency ?? null,
    present: indexed?.present ?? false,
    valid_asset: indexed?.validAsset ?? false,
    ownership: 'managed',
    managed_asset_id: managed.managedAssetId,
});

export type RoleSlotEnrichment = {
    candidateCount: number;
    managed: ManagedAssetSnapshot | null;
    managedIndexed: IndexedAssetSnapshot | null;
    issues: Array<{ code: string; message: string }>;
};

export const deriveSlotState = (
    bound: IndexedAssetSnapshot | null,
    enrichment: RoleSlotEnrichment,
): SlotState => {
    if (bound) {
        if (!bound.present) return 'MISSING';
        if (!bound.validAsset) return 'INVALID';
        return 'BOUND';
    }
    if (enrichment.candidateCount > 1) return 'CONFLICT';
    if (enrichment.issues.some(issue => issue.code === 'ROLE_CONFLICT')) return 'CONFLICT';
    if (enrichment.managed) {
        const indexed = enrichment.managedIndexed;
        if (!indexed || !indexed.present) return 'MISSING';
        if (!indexed.validAsset) return 'INVALID';
        // Managed target exists and is present/valid but not bound — treat as BOUND via managed.
        return 'BOUND';
    }
    return 'EMPTY';
};

export const toRoleSlotDto = (
    bound: IndexedAssetSnapshot | null,
    enrichment: RoleSlotEnrichment,
): LibraryRoleSlotDto => {
    const slotState = deriveSlotState(bound, enrichment);
    let asset: LibraryBoundAssetDto | null = null;
    if (bound) {
        const managedId = enrichment.managed?.managedAssetId ?? null;
        const ownership: 'managed' | 'unmanaged' = managedId ? 'managed' : 'unmanaged';
        asset = toBoundAssetDto(bound, ownership, managedId);
    } else if (enrichment.managed) {
        asset = toManagedOnlyBoundDto(enrichment.managed, enrichment.managedIndexed);
    }
    return {
        slot_state: slotState,
        asset,
        issues: enrichment.issues,
    };
};

export const toVariantDetailDto = (
    snapshot: ArtVariantSnapshot,
    roleEnrichment: Record<AssetRole, RoleSlotEnrichment>,
): LibraryVariantDetailDto => ({
    variant_id: snapshot.variantId,
    card_id: snapshot.cardId,
    variant_key: snapshot.variantKey,
    display_label: snapshot.displayLabel,
    standard: copyReadiness(snapshot.standard),
    overframe: copyReadiness(snapshot.overframe),
    roles: {
        BS: toRoleSlotDto(snapshot.roles.BS, roleEnrichment.BS),
        BG: toRoleSlotDto(snapshot.roles.BG, roleEnrichment.BG),
        OF: toRoleSlotDto(snapshot.roles.OF, roleEnrichment.OF),
    },
});
