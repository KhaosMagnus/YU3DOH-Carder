import { LibraryHttpError } from './api';
import type { LibraryCardDetail } from './model';

export const formatVariantLoadError = (error: unknown): string => {
    if (error instanceof LibraryHttpError && error.status === 404) {
        return 'Canonical card not found for variants.';
    }
    if (error instanceof LibraryHttpError && error.status === 503) {
        return 'Workspace is not READY.';
    }
    return error instanceof Error ? error.message : 'Failed to load variants.';
};

export const formatNeedsAttentionError = (error: unknown): string => {
    if (error instanceof LibraryHttpError && error.status === 503) {
        return 'Workspace is not READY.';
    }
    return error instanceof Error ? error.message : 'Failed to load Needs Attention.';
};

export const formatRescanError = (error: unknown): string => {
    if (error instanceof LibraryHttpError && error.status === 503) {
        return 'Workspace is not READY.';
    }
    return error instanceof Error ? error.message : 'Rescan failed.';
};

export const formatIngestError = (error: unknown): string => {
    if (error instanceof LibraryHttpError) {
        return `${error.code}: ${error.message}`;
    }
    return error instanceof Error ? error.message : 'Managed ingest failed.';
};

/**
 * Asset channels must not clear Canonical detail or be mislabeled as card-not-found.
 */
export const isolateAssetDetailChannels = (input: {
    authoritative: LibraryCardDetail | null;
    detailError: string | null;
    variantError: string | null;
    needsAttentionError: string | null;
    rescanError: string | null;
    ingestError: string | null;
}): {
    detailPreserved: boolean;
    assetFailureMislabelledAsCardNotFound: boolean;
} => {
    const assetErrors = [
        input.variantError,
        input.needsAttentionError,
        input.rescanError,
        input.ingestError,
    ].filter(Boolean) as string[];
    const assetFailureMislabelledAsCardNotFound = assetErrors.some(message =>
        /card not found/i.test(message)
        && !input.detailError
        && Boolean(input.authoritative));
    return {
        detailPreserved: Boolean(input.authoritative) || Boolean(input.detailError),
        assetFailureMislabelledAsCardNotFound,
    };
};
