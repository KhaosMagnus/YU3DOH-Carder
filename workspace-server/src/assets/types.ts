export const ASSET_ROLES = ['BS', 'BG', 'OF'] as const;
export type AssetRole = typeof ASSET_ROLES[number];

export const ASSET_DIAGNOSTIC_CODES = [
    'ASSETS_DIRECTORY_MISSING',
    'UNSAFE_LINK',
    'INVALID_FILENAME',
    'UNSUPPORTED_FORMAT',
    'INVALID_IMAGE',
    'INVALID_OF_TRANSPARENCY',
    'UNRESOLVED_CARD',
    'AMBIGUOUS_CARD',
    'ROLE_CONFLICT',
    'MISSING_SOURCE',
    'SOURCE_READ_ERROR',
] as const;
export type AssetDiagnosticCode = typeof ASSET_DIAGNOSTIC_CODES[number];

export type AssetAssociationState = 'RESOLVED' | 'UNRESOLVED' | 'AMBIGUOUS' | 'INVALID';

export type ParsedAssetFilename = {
    fileName: string;
    extension: string;
    password: string | null;
    cardName: string;
    role: AssetRole;
    variantLabel: string;
    variantKey: string;
};

export type ImageInspection = {
    width: number;
    height: number;
    hasTransparency: boolean;
    contentHash: string;
};

export type DiscoveryDiagnostic = {
    relativePath: string;
    code: AssetDiagnosticCode;
    message: string;
};

export type DiscoveredAsset = {
    relativePath: string;
    fileName: string;
    extension: string;
    sizeBytes: number;
    modifiedTimeMs: number;
    contentHash: string | null;
    parsedCardName: string | null;
    parsedPassword: string | null;
    role: AssetRole | null;
    variantLabel: string | null;
    variantKey: string | null;
    associationState: AssetAssociationState;
    cardId: string | null;
    imageWidth: number | null;
    imageHeight: number | null;
    hasTransparency: boolean | null;
    validAsset: boolean;
    diagnostics: DiscoveryDiagnostic[];
};

export type AssetDiagnosticSnapshot = {
    diagnosticId: string;
    scanId: string;
    assetId: string | null;
    relativePath: string;
    code: AssetDiagnosticCode;
    message: string;
};

export type IndexedAssetSnapshot = {
    assetId: string;
    relativePath: string;
    fileName: string;
    extension: string;
    sizeBytes: number;
    modifiedTimeMs: number;
    contentHash: string | null;
    parsedCardName: string | null;
    parsedPassword: string | null;
    role: AssetRole | null;
    variantLabel: string | null;
    variantKey: string | null;
    associationState: AssetAssociationState;
    cardId: string | null;
    variantId: string | null;
    imageWidth: number | null;
    imageHeight: number | null;
    hasTransparency: boolean | null;
    validAsset: boolean;
    present: boolean;
};

export type CompositionReadiness = {
    state: 'READY' | 'INCOMPLETE';
    sources: AssetRole[];
};

export type ArtVariantSnapshot = {
    variantId: string;
    cardId: string;
    variantKey: string;
    displayLabel: string;
    roles: Record<AssetRole, IndexedAssetSnapshot | null>;
    standard: CompositionReadiness;
    overframe: CompositionReadiness;
};

export type AssetScanSnapshot = {
    scanId: string;
    startedAt: string;
    completedAt: string;
    discoveredCount: number;
    presentCount: number;
    diagnosticCount: number;
    assets: IndexedAssetSnapshot[];
    variants: ArtVariantSnapshot[];
    diagnostics: AssetDiagnosticSnapshot[];
};
