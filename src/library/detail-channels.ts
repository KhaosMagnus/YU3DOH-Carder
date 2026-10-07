import { LibraryHttpError } from './api';
import type { LibraryCardDetail, LibraryEditorMetadata } from './model';

export const formatDetailLoadError = (error: unknown): string => {
    if (error instanceof LibraryHttpError && error.status === 404) {
        return 'Canonical card not found.';
    }
    if (error instanceof LibraryHttpError && error.status === 503) {
        return 'Workspace is not READY.';
    }
    return error instanceof Error ? error.message : 'Failed to load detail.';
};

export const formatMetadataLoadError = (error: unknown): string => {
    if (error instanceof LibraryHttpError && error.status === 503) {
        return 'Workspace is not READY.';
    }
    return error instanceof Error ? error.message : 'Failed to load editor metadata.';
};

/**
 * Detail and editor-metadata are independent failure channels.
 * A metadata failure must not clear an already-loaded authoritative detail
 * and must not be mislabeled as a detail / card-not-found error.
 */
export const isolateDetailMetadataChannels = (input: {
    authoritative: LibraryCardDetail | null;
    detailError: string | null;
    metadataError: string | null;
    metadata: LibraryEditorMetadata | null;
}): {
    showDetail: boolean;
    showMetadataError: boolean;
    detailClearedByMetadataFailure: boolean;
    metadataMislabelledAsDetail: boolean;
} => {
    const metadataMislabelledAsDetail = Boolean(
        input.metadataError
        && input.detailError
        && input.metadataError === input.detailError
        && /not found/i.test(input.detailError),
    );
    return {
        showDetail: Boolean(input.authoritative) && !input.detailError,
        showMetadataError: Boolean(input.metadataError),
        detailClearedByMetadataFailure: Boolean(
            input.metadataError
            && !input.authoritative
            && !input.detailError,
        ),
        metadataMislabelledAsDetail,
    };
};
