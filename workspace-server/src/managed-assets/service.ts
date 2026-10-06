import { createHash, randomUUID } from 'node:crypto';
import {
    constants as fsConstants,
    existsSync,
    lstatSync,
    renameSync,
    rmSync,
} from 'node:fs';
import { copyFile, lstat, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import type { AssetIndexerService } from '../assets/indexer';
import { normalizeVariantKey } from '../assets/filename';
import { inspectAssetImage, isSupportedAssetFormat } from '../assets/image';
import { ASSET_ROLES, type AssetRole } from '../assets/types';
import type { WorkspacePersistence } from '../persistence/database';
import {
    canonicalCardExists,
    countCurrentRoleCandidates,
    createArtVariant,
    deleteManagedIngest,
    findArtVariant,
    findIngestRequest,
    findManagedAssetById,
    findManagedAssetByTarget,
    insertIngestRequest,
    insertManagedAsset,
    listManagedAssets,
} from './repository';
import {
    ManagedAssetIngestError,
    type ManagedAssetIngestInput,
    type ManagedAssetIngestResult,
    type ManagedAssetSnapshot,
} from './types';

export type ManagedAssetFilesystem = {
    publishStagedFile: (stagedPath: string, destinationPath: string) => void;
};

const defaultFilesystem: ManagedAssetFilesystem = {
    publishStagedFile: (stagedPath, destinationPath) => renameSync(stagedPath, destinationPath),
};

const asManagedRole = (value: string): AssetRole => {
    const normalized = value.toUpperCase();
    if (!ASSET_ROLES.includes(normalized as AssetRole)) {
        throw new ManagedAssetIngestError('INVALID_ROLE', `Unsupported managed asset role: ${value}.`);
    }
    return normalized as AssetRole;
};

const pathSegments = (absolutePath: string) => {
    const resolved = path.resolve(absolutePath);
    const parsed = path.parse(resolved);
    const relative = resolved.slice(parsed.root.length);
    return { root: parsed.root, segments: relative.split(path.sep).filter(Boolean) };
};

const assertNoFilesystemLinks = async (absolutePath: string) => {
    const { root, segments } = pathSegments(absolutePath);
    let current = root;
    for (const segment of segments) {
        current = path.join(current, segment);
        try {
            const stats = await lstat(current);
            if (stats.isSymbolicLink()) {
                throw new ManagedAssetIngestError('INVALID_SOURCE', 'Source path traverses a filesystem link/junction.');
            }
        } catch (error) {
            if (error instanceof ManagedAssetIngestError) throw error;
            const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : null;
            if (code === 'ENOENT') return;
            throw error;
        }
    }
};

const ensureSafeDirectories = async (workspaceRoot: string, segments: string[]) => {
    let current = path.resolve(workspaceRoot);
    const workspaceStats = await lstat(current);
    if (!workspaceStats.isDirectory() || workspaceStats.isSymbolicLink()) {
        throw new ManagedAssetIngestError('UNSAFE_PATH', 'Workspace root must be a real directory.');
    }
    for (const segment of segments) {
        current = path.join(current, segment);
        try {
            const stats = await lstat(current);
            if (!stats.isDirectory() || stats.isSymbolicLink()) {
                throw new ManagedAssetIngestError('UNSAFE_PATH', `Managed path component is unsafe: ${segment}.`);
            }
        } catch (error) {
            if (error instanceof ManagedAssetIngestError) throw error;
            const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : null;
            if (code !== 'ENOENT') throw error;
            await mkdir(current);
            const stats = await lstat(current);
            if (!stats.isDirectory() || stats.isSymbolicLink()) {
                throw new ManagedAssetIngestError('UNSAFE_PATH', `Managed path component could not be created safely: ${segment}.`);
            }
        }
    }
    return current;
};

const destinationFor = (
    workspaceRoot: string,
    cardId: string,
    variantKey: string,
    role: AssetRole,
    extension: string,
) => {
    for (const [label, segment] of [
        ['card_id', cardId],
        ['variant_key', variantKey],
        ['role', role],
        ['extension', extension],
    ] as const) {
        if (!/^[A-Za-z0-9_-]+$/.test(segment)) {
            throw new ManagedAssetIngestError('UNSAFE_PATH', `${label} cannot form a safe managed path segment.`);
        }
    }
    const relativePath = `Assets/Managed/${cardId}/${variantKey}/${role}.${extension}`;
    const managedRoot = path.resolve(workspaceRoot, 'Assets', 'Managed');
    const destinationPath = path.resolve(workspaceRoot, ...relativePath.split('/'));
    const relativeToManaged = path.relative(managedRoot, destinationPath);
    if (
        !relativeToManaged
        || relativeToManaged.startsWith(`..${path.sep}`)
        || relativeToManaged === '..'
        || path.isAbsolute(relativeToManaged)
    ) {
        throw new ManagedAssetIngestError('UNSAFE_PATH', 'Managed destination escaped Assets/Managed.');
    }
    return { relativePath, destinationPath };
};

const fingerprintFor = (
    cardId: string,
    variantKey: string,
    role: AssetRole,
    contentHash: string,
    extension: string,
) => createHash('sha256')
    .update(JSON.stringify([cardId, variantKey, role, contentHash, extension]))
    .digest('hex');

const isSqliteConstraint = (error: unknown) =>
    error instanceof Error && /constraint|unique/i.test(error.message);

export class ManagedAssetIngestService {
    constructor(
        private readonly workspaceRoot: string,
        private readonly persistence: WorkspacePersistence,
        private readonly assets: AssetIndexerService,
        private readonly filesystem: ManagedAssetFilesystem = defaultFilesystem,
    ) {}

    private getVariant(cardId: string, variantKey: string) {
        return this.persistence.runRepositoryOperation(database => findArtVariant(database, cardId, variantKey));
    }

    private async verifyExistingManagedFile(asset: ManagedAssetSnapshot, expectedHash: string) {
        const destinationPath = path.resolve(this.workspaceRoot, ...asset.managedRelativePath.split('/'));
        try {
            await assertNoFilesystemLinks(destinationPath);
            const stats = await lstat(destinationPath);
            if (!stats.isFile()) {
                throw new ManagedAssetIngestError('TARGET_CONFLICT', 'Registered managed asset is not a regular file.');
            }
            const image = await inspectAssetImage(destinationPath, asset.role, asset.extension);
            if (asset.role === 'OF' && !image.hasTransparency) {
                throw new ManagedAssetIngestError('TARGET_CONFLICT', 'Registered managed OF no longer has usable transparency.');
            }
            if (image.contentHash !== asset.contentHash || image.contentHash !== expectedHash) {
                throw new ManagedAssetIngestError('TARGET_CONFLICT', 'Registered managed asset content differs from requested source.');
            }
        } catch (error) {
            if (error instanceof ManagedAssetIngestError) throw error;
            throw new ManagedAssetIngestError('TARGET_CONFLICT', 'Registered managed asset is missing or invalid.', { cause: error });
        }
    }

    private resultFor(asset: ManagedAssetSnapshot, idempotent: boolean): ManagedAssetIngestResult {
        const variant = this.assets.listVariants(asset.cardId)
            .find(candidate => candidate.variantId === asset.variantId) ?? null;
        return { managedAsset: asset, variant, idempotent };
    }

    private async removePublishedFileIfOwned(destinationPath: string, role: AssetRole, extension: string, contentHash: string) {
        if (!existsSync(destinationPath)) return;
        try {
            const stats = lstatSync(destinationPath);
            if (!stats.isFile() || stats.isSymbolicLink()) return;
            const inspected = await inspectAssetImage(destinationPath, role, extension);
            if (inspected.contentHash === contentHash) rmSync(destinationPath, { force: true });
        } catch {
            // Never delete bytes that cannot be positively identified as our publication.
        }
    }

    private async compensate(asset: ManagedAssetSnapshot, idempotencyKey: string, createdVariant: boolean) {
        const destinationPath = path.resolve(this.workspaceRoot, ...asset.managedRelativePath.split('/'));
        await this.removePublishedFileIfOwned(destinationPath, asset.role, asset.extension, asset.contentHash);
        this.persistence.transaction(database => {
            deleteManagedIngest(
                database,
                asset.managedAssetId,
                asset.variantId,
                idempotencyKey,
                asset.managedRelativePath,
                createdVariant,
            );
        });
        try { await this.assets.scan(); } catch { /* preserve primary error */ }
    }

    async ingest(input: ManagedAssetIngestInput): Promise<ManagedAssetIngestResult> {
        const role = asManagedRole(input.role);
        let variantKey: string;
        try {
            variantKey = normalizeVariantKey(input.variantKey);
        } catch (error) {
            throw new ManagedAssetIngestError('INVALID_VARIANT', 'Managed asset variant key is invalid.', { cause: error });
        }
        const displayLabel = input.variantKey.normalize('NFKC').trim();
        const idempotencyKey = input.idempotencyKey.trim();
        if (!idempotencyKey || idempotencyKey.length > 256) {
            throw new ManagedAssetIngestError('IDEMPOTENCY_CONFLICT', 'idempotency_key must be non-empty and at most 256 characters.');
        }

        const cardExists = this.persistence.runRepositoryOperation(database =>
            canonicalCardExists(database, input.cardId));
        if (!cardExists) {
            throw new ManagedAssetIngestError('NOT_FOUND', `Canonical card ${input.cardId} does not exist.`);
        }

        const resolvedSource = path.resolve(input.sourceFile);
        try {
            await assertNoFilesystemLinks(resolvedSource);
            const sourceStats = await lstat(resolvedSource);
            if (!sourceStats.isFile() || sourceStats.isSymbolicLink()) {
                throw new ManagedAssetIngestError('INVALID_SOURCE', 'source_file must be a regular file and not a filesystem link.');
            }
        } catch (error) {
            if (error instanceof ManagedAssetIngestError) throw error;
            throw new ManagedAssetIngestError('INVALID_SOURCE', 'source_file is missing or unreadable.', { cause: error });
        }

        const extension = path.extname(resolvedSource).slice(1).toLowerCase();
        if (!extension || !isSupportedAssetFormat(role, extension)) {
            throw new ManagedAssetIngestError('INVALID_IMAGE', `Source extension is not supported for role ${role}.`);
        }

        let sourceImage;
        try {
            sourceImage = await inspectAssetImage(resolvedSource, role, extension);
        } catch (error) {
            throw new ManagedAssetIngestError('INVALID_IMAGE', 'Source image is invalid or undecodable.', { cause: error });
        }
        if (role === 'OF' && !sourceImage.hasTransparency) {
            throw new ManagedAssetIngestError('INVALID_IMAGE', 'OF source must contain actual usable transparency.');
        }

        const requestFingerprint = fingerprintFor(
            input.cardId, variantKey, role, sourceImage.contentHash, extension,
        );
        const priorRequest = this.persistence.runRepositoryOperation(database =>
            findIngestRequest(database, idempotencyKey));
        if (priorRequest) {
            if (priorRequest.requestFingerprint !== requestFingerprint) {
                throw new ManagedAssetIngestError('IDEMPOTENCY_CONFLICT', 'idempotency_key was already used for a different request/content.');
            }
            const existing = this.persistence.runRepositoryOperation(database =>
                findManagedAssetById(database, priorRequest.managedAssetId));
            if (!existing) {
                throw new ManagedAssetIngestError('PERSISTENCE_FAILED', 'Idempotency record points to a missing managed asset.');
            }
            await this.verifyExistingManagedFile(existing, sourceImage.contentHash);
            return this.resultFor(existing, true);
        }

        try {
            await this.assets.scan();
        } catch (error) {
            throw new ManagedAssetIngestError('INDEX_RECONCILIATION_FAILED', 'Pre-ingest asset reconciliation failed.', { cause: error });
        }

        const existingVariant = this.getVariant(input.cardId, variantKey);
        if (existingVariant) {
            const existingManaged = this.persistence.runRepositoryOperation(database =>
                findManagedAssetByTarget(database, existingVariant.variant_id, role));
            if (existingManaged) {
                if (existingManaged.contentHash !== sourceImage.contentHash) {
                    throw new ManagedAssetIngestError('TARGET_CONFLICT', 'Managed target already contains different content; replacement is not implemented.');
                }
                await this.verifyExistingManagedFile(existingManaged, sourceImage.contentHash);
                try {
                    this.persistence.transaction(database => {
                        insertIngestRequest(
                            database, idempotencyKey, requestFingerprint,
                            existingManaged.managedAssetId, new Date().toISOString(),
                        );
                    });
                } catch (error) {
                    if (isSqliteConstraint(error)) {
                        throw new ManagedAssetIngestError('IDEMPOTENCY_CONFLICT', 'idempotency_key conflicted during no-op registration.', { cause: error });
                    }
                    throw new ManagedAssetIngestError('PERSISTENCE_FAILED', 'Could not persist idempotent managed ingest request.', { cause: error });
                }
                return this.resultFor(existingManaged, true);
            }

            const occupied = this.persistence.runRepositoryOperation(database =>
                countCurrentRoleCandidates(database, input.cardId, variantKey, role));
            if (occupied > 0) {
                throw new ManagedAssetIngestError('TARGET_CONFLICT', 'Target role is occupied by current unmanaged/conflicting asset state.');
            }
        }

        const { relativePath, destinationPath } = destinationFor(
            this.workspaceRoot, input.cardId, variantKey, role, extension,
        );
        if (existsSync(destinationPath)) {
            throw new ManagedAssetIngestError('DESTINATION_CONFLICT', 'Managed destination already exists without matching registered ownership.');
        }

        await ensureSafeDirectories(this.workspaceRoot, ['Assets', 'Managed', input.cardId, variantKey]);
        const stagingDirectory = await ensureSafeDirectories(this.workspaceRoot, ['Temp', 'ManagedIngest']);
        const stagedPath = path.join(stagingDirectory, `${randomUUID()}.${extension}.stage`);
        let published = false;
        let createdAsset: ManagedAssetSnapshot | null = null;
        let createdVariant = false;

        try {
            await copyFile(resolvedSource, stagedPath, fsConstants.COPYFILE_EXCL);
            const stagedImage = await inspectAssetImage(stagedPath, role, extension);
            if (role === 'OF' && !stagedImage.hasTransparency) {
                throw new ManagedAssetIngestError('INVALID_IMAGE', 'Staged OF lost required transparency.');
            }
            if (stagedImage.contentHash !== sourceImage.contentHash) {
                throw new ManagedAssetIngestError('INVALID_SOURCE', 'Staged copy does not match validated source content.');
            }
            const sourceAfterCopy = await inspectAssetImage(resolvedSource, role, extension);
            if (sourceAfterCopy.contentHash !== sourceImage.contentHash) {
                throw new ManagedAssetIngestError('INVALID_SOURCE', 'source_file changed during ingest.');
            }

            const timestamp = new Date().toISOString();
            try {
                createdAsset = this.persistence.transaction(database => {
                    const retryRequest = findIngestRequest(database, idempotencyKey);
                    if (retryRequest) {
                        throw new ManagedAssetIngestError('IDEMPOTENCY_CONFLICT', 'idempotency_key was claimed concurrently.');
                    }
                    if (!canonicalCardExists(database, input.cardId)) {
                        throw new ManagedAssetIngestError('NOT_FOUND', 'Canonical card disappeared during ingest.');
                    }

                    let variant = findArtVariant(database, input.cardId, variantKey);
                    if (!variant) {
                        variant = createArtVariant(database, input.cardId, variantKey, displayLabel, timestamp);
                        createdVariant = true;
                    }
                    if (findManagedAssetByTarget(database, variant.variant_id, role)) {
                        throw new ManagedAssetIngestError('TARGET_CONFLICT', 'Managed target became occupied during ingest.');
                    }
                    if (countCurrentRoleCandidates(database, input.cardId, variantKey, role) > 0) {
                        throw new ManagedAssetIngestError('TARGET_CONFLICT', 'Target role became occupied during ingest.');
                    }
                    if (existsSync(destinationPath)) {
                        throw new ManagedAssetIngestError('DESTINATION_CONFLICT', 'Managed destination appeared during ingest.');
                    }

                    const asset = insertManagedAsset(database, {
                        variantId: variant.variant_id,
                        role,
                        managedRelativePath: relativePath,
                        contentHash: stagedImage.contentHash,
                        originalFileName: path.basename(resolvedSource),
                        extension,
                        createdAt: timestamp,
                    });
                    insertIngestRequest(database, idempotencyKey, requestFingerprint, asset.managedAssetId, timestamp);
                    try {
                        this.filesystem.publishStagedFile(stagedPath, destinationPath);
                        published = true;
                    } catch (error) {
                        throw new ManagedAssetIngestError('PUBLISH_FAILED', 'Managed destination publication failed.', { cause: error });
                    }
                    return asset;
                });
            } catch (error) {
                if (published) {
                    await this.removePublishedFileIfOwned(destinationPath, role, extension, sourceImage.contentHash);
                }
                if (error instanceof ManagedAssetIngestError) throw error;
                if (isSqliteConstraint(error)) {
                    throw new ManagedAssetIngestError('TARGET_CONFLICT', 'Managed ingest persistence constraint rejected the operation.', { cause: error });
                }
                throw new ManagedAssetIngestError('PERSISTENCE_FAILED', 'Managed ingest persistence failed.', { cause: error });
            }

            if (!createdAsset) throw new ManagedAssetIngestError('PERSISTENCE_FAILED', 'Managed asset was not committed.');
            try {
                const scan = await this.assets.scan();
                const variant = scan.variants.find(candidate => candidate.variantId === createdAsset?.variantId);
                const bound = variant?.roles[role];
                if (!bound || bound.relativePath !== createdAsset.managedRelativePath) {
                    throw new Error('Managed asset did not become authoritative role binding.');
                }
            } catch (error) {
                await this.compensate(createdAsset, idempotencyKey, createdVariant);
                throw new ManagedAssetIngestError(
                    'INDEX_RECONCILIATION_FAILED',
                    'Managed asset was compensated because index reconciliation did not establish its binding.',
                    { cause: error },
                );
            }

            return this.resultFor(createdAsset, false);
        } finally {
            await rm(stagedPath, { force: true }).catch(() => undefined);
        }
    }

    listManagedAssets() {
        return this.persistence.runRepositoryOperation(database => listManagedAssets(database));
    }
}
