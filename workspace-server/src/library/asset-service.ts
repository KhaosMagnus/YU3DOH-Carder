import type { AssetStateTokens } from '../asset-mutation/state';
import { listIndexedAssets } from '../assets/repository';
import type { AssetIndexerService } from '../assets/indexer';
import {
    countRoleCandidatesForVariant,
    findIndexedAssetByRelativePath,
    findLatestCompletedScan,
    findProblemIndexedAssetForVariantRole,
    listEnrichedDiagnosticsForScan,
} from '../assets/repository';
import { ASSET_ROLES, type AssetRole } from '../assets/types';
import type { CanonicalDomainService } from '../canonical/service';
import type { ManagedAssetIngestService } from '../managed-assets/service';
import {
    findManagedAssetById,
    findManagedAssetByTarget,
    findManagedOwnershipByRelativePath,
} from '../managed-assets/repository';
import {
    ManagedAssetIngestError,
    type ManagedAssetIngestInput,
} from '../managed-assets/types';
import type { WorkspacePersistence } from '../persistence/database';
import {
    toManagedAssetDto,
    toNeedsAttentionItemDto,
    toScanSummaryDto,
    toVariantDetailDto,
    type LibraryManagedIngestResponseDto,
    type LibraryNeedsAttentionResponseDto,
    type LibraryScanSummaryDto,
    type LibraryVariantDetailDto,
    type LibraryVariantsResponseDto,
    type RoleSlotEnrichment,
} from './asset-dto';

export class LibraryAssetNotFoundError extends Error {
    readonly code = 'NOT_FOUND' as const;

    constructor(message: string) {
        super(message);
        this.name = 'LibraryAssetNotFoundError';
    }
}

export class LibraryAssetService {
    constructor(
        private readonly persistence: WorkspacePersistence,
        private readonly assets: AssetIndexerService,
        private readonly managedAssets: ManagedAssetIngestService,
        private readonly canonical: CanonicalDomainService,
        private readonly stateTokens?: AssetStateTokens,
    ) {}

    private requireCard(cardId: string) {
        const card = this.canonical.getCard(cardId);
        if (!card) {
            throw new LibraryAssetNotFoundError(`Canonical card ${cardId} was not found.`);
        }
        return card;
    }

    private enrichVariant(snapshot: ReturnType<AssetIndexerService['listVariants']>[number]): LibraryVariantDetailDto {
        return this.persistence.runRepositoryOperation(database => {
            const latest = findLatestCompletedScan(database);
            const diagnostics = latest
                ? listEnrichedDiagnosticsForScan(database, latest.scanId)
                : [];
            const roleEnrichment = {} as Record<AssetRole, RoleSlotEnrichment>;
            for (const role of ASSET_ROLES) {
                const candidateCount = countRoleCandidatesForVariant(database, snapshot.variantId, role);
                const bound = snapshot.roles[role];
                let ownershipManaged = findManagedAssetByTarget(database, snapshot.variantId, role);
                if (!ownershipManaged && bound) {
                    const byPath = findManagedOwnershipByRelativePath(database, bound.relativePath);
                    if (byPath) {
                        ownershipManaged = findManagedAssetById(database, byPath.managedAssetId);
                    }
                }
                if (ownershipManaged) {
                    const disposition = database.prepare(`SELECT o.disposition, o.variant_id, o.role FROM asset_resolution_overrides o
                        JOIN indexed_asset_files a ON a.asset_id = o.asset_id WHERE a.relative_path = ?`)
                        .get(ownershipManaged.managedRelativePath) as { disposition: string; variant_id: string | null; role: string | null } | undefined;
                    if (disposition && (disposition.disposition !== 'ASSIGN' || disposition.variant_id !== snapshot.variantId || disposition.role !== role)) ownershipManaged = null;
                }
                const managedIndexed = ownershipManaged
                    ? findIndexedAssetByRelativePath(database, ownershipManaged.managedRelativePath)
                    : null;
                const problemAsset = bound
                    ? null
                    : findProblemIndexedAssetForVariantRole(database, snapshot.variantId, role);
                const problemCodes = new Set([
                    'MISSING_SOURCE',
                    'INVALID_IMAGE',
                    'INVALID_OF_TRANSPARENCY',
                    'SOURCE_READ_ERROR',
                    'UNSUPPORTED_FORMAT',
                ]);
                const issues = diagnostics
                    .filter(item => {
                        if (item.role === role) {
                            if (item.variantId === snapshot.variantId) return true;
                            if (
                                item.cardId === snapshot.cardId
                                && item.variantKey === snapshot.variantKey
                            ) return true;
                        }
                        if (
                            item.code === 'ROLE_CONFLICT'
                            && item.variantId === snapshot.variantId
                            && item.role === role
                        ) return true;
                        if (
                            bound
                            && item.assetId === bound.assetId
                            && problemCodes.has(item.code)
                        ) return true;
                        if (
                            problemAsset
                            && item.assetId === problemAsset.assetId
                            && problemCodes.has(item.code)
                        ) return true;
                        return false;
                    })
                    .map(item => ({ code: item.code, message: item.message }));
                // Also surface ROLE_CONFLICT when candidates > 1 even if diagnostic join missed variant_id
                if (candidateCount > 1 && !issues.some(issue => issue.code === 'ROLE_CONFLICT')) {
                    issues.push({
                        code: 'ROLE_CONFLICT',
                        message: `Multiple current assets resolve to the same variant role ${role}; no candidate was selected.`,
                    });
                }
                roleEnrichment[role] = {
                    candidateCount,
                    candidates: listIndexedAssets(database).filter(a => a.variantId === snapshot.variantId && a.role === role
                        && a.present && a.validAsset && a.associationState === 'RESOLVED'),
                    ...(this.stateTokens ? { expectedStateToken: this.stateTokens.current() } : {}),
                    managed: ownershipManaged,
                    managedIndexed,
                    problemAsset,
                    issues,
                };
            }
            return toVariantDetailDto(snapshot, roleEnrichment);
        });
    }

    getVariants(cardId: string): LibraryVariantsResponseDto {
        this.requireCard(cardId);
        // Read persisted index only — never scan().
        const variants = this.assets.listVariants(cardId).map(variant => this.enrichVariant(variant));
        return { card_id: cardId, variants };
    }

    getNeedsAttention(): LibraryNeedsAttentionResponseDto {
        return this.persistence.runRepositoryOperation(database => {
            const latest = findLatestCompletedScan(database);
            if (!latest) {
                return { latest_scan: null, items: [] };
            }
            const items = listEnrichedDiagnosticsForScan(database, latest.scanId)
                .map(toNeedsAttentionItemDto);
            return {
                latest_scan: toScanSummaryDto(latest),
                items,
            };
        });
    }

    async rescan(): Promise<LibraryScanSummaryDto> {
        const scan = await this.assets.scan();
        return {
            scan_id: scan.scanId,
            started_at: scan.startedAt,
            completed_at: scan.completedAt,
            discovered_count: scan.discoveredCount,
            present_count: scan.presentCount,
            diagnostic_count: scan.diagnosticCount,
        };
    }

    async ingestManaged(
        cardId: string,
        body: {
            variant_key: string;
            role: string;
            source_file: string;
            idempotency_key: string;
        },
    ): Promise<LibraryManagedIngestResponseDto> {
        this.requireCard(cardId);
        const input: ManagedAssetIngestInput = {
            cardId,
            variantKey: body.variant_key,
            role: body.role,
            sourceFile: body.source_file,
            idempotencyKey: body.idempotency_key,
        };
        let result;
        try {
            result = await this.managedAssets.ingest(input);
        } catch (error) {
            if (error instanceof ManagedAssetIngestError) throw error;
            throw error;
        }
        // Re-read enriched variant without an extra general scan (ingest already reconciled).
        const variants = this.assets.listVariants(cardId);
        const matched = variants.find(variant => variant.variantId === result.managedAsset.variantId)
            ?? variants.find(variant => variant.variantKey === result.managedAsset.variantKey)
            ?? result.variant;
        const enriched = matched ? this.enrichVariant(matched) : null;
        return {
            managed_asset: toManagedAssetDto(result.managedAsset),
            variant: enriched,
            idempotent: result.idempotent,
        };
    }
}
