import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { inspectAssetImage, isSupportedAssetFormat } from '../assets/image';
import type { AssetRole } from '../assets/types';
import type { WorkspacePersistence } from '../persistence/database';
import type { CarderAssetGrantScope } from './asset-grants';
import { CarderPrepareError } from './errors';
import { resolveNoLinksFileUnderRoot } from './safe-path';

type IndexedAssetContentRow = {
    asset_id: string;
    relative_path: string;
    content_hash: string | null;
    extension: string;
    present: number;
    valid_asset: number;
    role: string | null;
    card_id: string | null;
    variant_id: string | null;
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
            SELECT asset_id, relative_path, content_hash, extension, present, valid_asset, role,
                card_id, variant_id
            FROM indexed_asset_files
            WHERE asset_id = ? AND EXISTS (
                SELECT 1 FROM variant_role_bindings b WHERE b.asset_id = indexed_asset_files.asset_id
                    AND b.variant_id = indexed_asset_files.variant_id AND b.role = indexed_asset_files.role)
        `).get(assetId) as IndexedAssetContentRow | undefined;
        return row ?? null;
    });

const SUPPORTED_ROLES = new Set(['BS', 'BG', 'OF']);

export type ResolvedAssetContent = {
    bytes: Buffer;
    contentType: string;
    sizeBytes: number;
    hash: string;
};

/**
 * Resolve authoritative indexed asset bytes by asset_id + hash for an already
 * verified prepared-composition grant scope (QA-009-08; authorization happens in
 * the handler before this function is called).
 * Validates row ↔ grant scope (card/variant/role); physical hash = indexed =
 * requested; format; decode; role rules.
 * Path is taken only from DB under the workspace root — never from client input.
 * No writes, no scan/Rescan.
 */
export const resolveAssetContent = async (
    workspaceRoot: string,
    persistence: WorkspacePersistence,
    assetId: string,
    hash: string | undefined,
    scope: CarderAssetGrantScope,
): Promise<ResolvedAssetContent> => {
    if (!hash || hash.trim().length === 0) {
        throw new CarderPrepareError(
            'ASSET_STALE',
            'Asset content hash query parameter is required.',
        );
    }

    const row = findIndexedAssetById(persistence, assetId);
    if (
        !row
        || !row.content_hash
        || row.present !== 1
        || row.valid_asset !== 1
        || !row.role
        || !SUPPORTED_ROLES.has(row.role)
    ) {
        throw new CarderPrepareError(
            'ASSET_STALE',
            `Asset ${assetId} is missing, invalid, or not present for content serving.`,
        );
    }

    // QA-009-08 (Design D-4 step 4): the indexed row must still belong to the
    // prepared card/variant/role the grant was issued for.
    if (
        scope.assetId !== row.asset_id
        || row.card_id !== scope.cardId
        || row.variant_id !== scope.variantId
        || row.role !== scope.role
    ) {
        throw new CarderPrepareError(
            'ASSET_STALE',
            `Asset ${assetId} no longer matches the prepared composition scope.`,
        );
    }

    if (row.content_hash !== hash) {
        throw new CarderPrepareError(
            'ASSET_STALE',
            `Asset ${assetId} content hash does not match authoritative hash.`,
        );
    }

    const absolutePath = await resolveNoLinksFileUnderRoot(workspaceRoot, row.relative_path);

    const pathExt = path.extname(row.relative_path).replace(/^\./, '').toLowerCase();
    const rowExt = row.extension.toLowerCase();
    if (pathExt !== rowExt) {
        throw new CarderPrepareError(
            'ASSET_STALE',
            `Asset ${assetId} path extension does not match indexed extension.`,
        );
    }

    const role = row.role as AssetRole;
    if (!isSupportedAssetFormat(role, rowExt)) {
        throw new CarderPrepareError(
            'ASSET_STALE',
            `Asset ${assetId} format is not supported for role ${role}.`,
        );
    }

    let inspection;
    try {
        inspection = await inspectAssetImage(absolutePath, role, rowExt);
    } catch {
        throw new CarderPrepareError(
            'ASSET_STALE',
            `Asset ${assetId} image decode or role validation failed.`,
        );
    }

    if (inspection.width <= 0 || inspection.height <= 0) {
        throw new CarderPrepareError(
            'ASSET_STALE',
            `Asset ${assetId} image dimensions are invalid.`,
        );
    }

    if (role === 'OF' && !inspection.hasTransparency) {
        throw new CarderPrepareError(
            'ASSET_STALE',
            `Asset ${assetId} OF role requires transparency.`,
        );
    }

    const bytes = await readFile(absolutePath);
    const physical = createHash('sha256').update(bytes).digest('hex');
    if (
        physical !== inspection.contentHash
        || physical !== row.content_hash
        || physical !== hash
    ) {
        throw new CarderPrepareError(
            'ASSET_STALE',
            `Asset ${assetId} physical content hash does not match indexed/requested hash.`,
        );
    }

    return {
        bytes,
        contentType: mimeForExtension(row.extension),
        sizeBytes: bytes.length,
        hash: row.content_hash,
    };
};
