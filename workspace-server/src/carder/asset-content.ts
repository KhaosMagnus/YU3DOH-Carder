import { createReadStream, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import type { WorkspacePersistence } from '../persistence/database';
import { CarderPrepareError } from './errors';

type IndexedAssetContentRow = {
    asset_id: string;
    relative_path: string;
    content_hash: string | null;
    extension: string;
    present: number;
    valid_asset: number;
};

const mimeForExtension = (extension: string): string => {
    switch (extension.toLowerCase()) {
        case 'png': return 'image/png';
        case 'jpg':
        case 'jpeg': return 'image/jpeg';
        case 'bmp': return 'image/bmp';
        default: return 'application/octet-stream';
    }
};

const findIndexedAssetById = (
    persistence: WorkspacePersistence,
    assetId: string,
): IndexedAssetContentRow | null =>
    persistence.runRepositoryOperation(database => {
        const row = database.prepare(`
            SELECT asset_id, relative_path, content_hash, extension, present, valid_asset
            FROM indexed_asset_files
            WHERE asset_id = ?
        `).get(assetId) as IndexedAssetContentRow | undefined;
        return row ?? null;
    });

export type ResolvedAssetContent = {
    absolutePath: string;
    contentType: string;
    sizeBytes: number;
    hash: string;
    openStream: () => NodeJS.ReadableStream;
};

/**
 * Resolve authoritative indexed asset bytes by asset_id + hash.
 * Path is taken only from DB under the workspace root — never from client input.
 */
export const resolveAssetContent = (
    workspaceRoot: string,
    persistence: WorkspacePersistence,
    assetId: string,
    hash: string | undefined,
): ResolvedAssetContent => {
    if (!hash || hash.trim().length === 0) {
        throw new CarderPrepareError(
            'ASSET_STALE',
            'Asset content hash query parameter is required.',
        );
    }

    const row = findIndexedAssetById(persistence, assetId);
    if (!row || !row.content_hash || row.present !== 1 || row.valid_asset !== 1) {
        throw new CarderPrepareError(
            'ASSET_STALE',
            `Asset ${assetId} is missing, invalid, or not present for content serving.`,
        );
    }

    if (row.content_hash !== hash) {
        throw new CarderPrepareError(
            'ASSET_STALE',
            `Asset ${assetId} content hash does not match authoritative hash.`,
        );
    }

    const rootResolved = path.resolve(workspaceRoot);
    const absolutePath = path.resolve(rootResolved, ...row.relative_path.split(/[/\\]+/));
    const relativeToRoot = path.relative(rootResolved, absolutePath);
    if (
        relativeToRoot.startsWith('..')
        || path.isAbsolute(relativeToRoot)
    ) {
        throw new CarderPrepareError(
            'ASSET_STALE',
            `Asset ${assetId} path escaped the workspace root.`,
        );
    }

    if (!existsSync(absolutePath) || !statSync(absolutePath).isFile()) {
        throw new CarderPrepareError(
            'ASSET_STALE',
            `Asset ${assetId} file is not present on disk.`,
        );
    }

    const sizeBytes = statSync(absolutePath).size;
    return {
        absolutePath,
        contentType: mimeForExtension(row.extension),
        sizeBytes,
        hash: row.content_hash,
        openStream: () => createReadStream(absolutePath),
    };
};
