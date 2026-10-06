import type { AssetRole, ArtVariantSnapshot } from '../assets/types';

export const MANAGED_ASSET_ERROR_CODES = [
    'NOT_FOUND',
    'INVALID_ROLE',
    'INVALID_VARIANT',
    'INVALID_SOURCE',
    'INVALID_IMAGE',
    'IDEMPOTENCY_CONFLICT',
    'TARGET_CONFLICT',
    'DESTINATION_CONFLICT',
    'UNSAFE_PATH',
    'PUBLISH_FAILED',
    'PERSISTENCE_FAILED',
    'INDEX_RECONCILIATION_FAILED',
] as const;

export type ManagedAssetErrorCode = typeof MANAGED_ASSET_ERROR_CODES[number];

export class ManagedAssetIngestError extends Error {
    constructor(
        readonly code: ManagedAssetErrorCode,
        message: string,
        options?: { cause?: unknown },
    ) {
        super(message, options);
        this.name = 'ManagedAssetIngestError';
    }
}

export type ManagedAssetIngestInput = {
    cardId: string;
    variantKey: string;
    role: string;
    sourceFile: string;
    idempotencyKey: string;
};

export type ManagedAssetSnapshot = {
    managedAssetId: string;
    variantId: string;
    cardId: string;
    variantKey: string;
    displayLabel: string;
    role: AssetRole;
    managedRelativePath: string;
    contentHash: string;
    originalFileName: string;
    extension: string;
    createdAt: string;
};

export type ManagedAssetIngestResult = {
    managedAsset: ManagedAssetSnapshot;
    variant: ArtVariantSnapshot | null;
    idempotent: boolean;
};
