import { overrideForPath } from '../asset-mutation/state';
import { randomUUID } from 'node:crypto';
import { lstat, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import type { WorkspacePersistence } from '../persistence/database';
import { inspectAssetImage, isSupportedAssetFormat } from './image';
import { parseAssetFilename } from './filename';
import { findManagedOwnershipByRelativePath, type ManagedOwnership } from '../managed-assets/repository';
import {
    findCanonicalCardIdsByPassword,
    findTokenCardIdsByNormalizedName,
    listArtVariants,
    listDiagnosticsForScan,
    listIndexedAssets,
    reconcileAssetIndex,
} from './repository';
import type {
    AssetDiagnosticCode,
    AssetScanSnapshot,
    DiscoveredAsset,
    DiscoveryDiagnostic,
} from './types';

const asWorkspaceRelativePath = (relativeWithinAssets: string) => {
    const normalized = relativeWithinAssets.split(path.sep).join('/');
    return normalized ? `Assets/${normalized}` : 'Assets';
};

const getErrorCode = (error: unknown) => {
    if (typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string') {
        return error.code;
    }
    return null;
};

const diagnostic = (
    relativePath: string,
    code: AssetDiagnosticCode,
    message: string,
): DiscoveryDiagnostic => ({ relativePath, code, message });

type DiscoveredFile = {
    absolutePath: string;
    relativePath: string;
    fileName: string;
    sizeBytes: number;
    modifiedTimeMs: number;
};

type DiscoveryResult = {
    files: DiscoveredFile[];
    diagnostics: DiscoveryDiagnostic[];
};

const discoverAssetFiles = async (workspaceRoot: string): Promise<DiscoveryResult> => {
    const assetsRoot = path.join(workspaceRoot, 'Assets');
    const files: DiscoveredFile[] = [];
    const diagnostics: DiscoveryDiagnostic[] = [];

    let rootStats;
    try {
        rootStats = await lstat(assetsRoot);
    } catch (error) {
        if (getErrorCode(error) === 'ENOENT') {
            diagnostics.push(diagnostic(
                'Assets',
                'ASSETS_DIRECTORY_MISSING',
                'Workspace Assets directory does not exist; the indexer did not create it.',
            ));
            return { files, diagnostics };
        }
        diagnostics.push(diagnostic('Assets', 'SOURCE_READ_ERROR', 'Workspace Assets directory could not be inspected.'));
        return { files, diagnostics };
    }

    if (rootStats.isSymbolicLink() || !rootStats.isDirectory()) {
        diagnostics.push(diagnostic(
            'Assets',
            rootStats.isSymbolicLink() ? 'UNSAFE_LINK' : 'SOURCE_READ_ERROR',
            rootStats.isSymbolicLink()
                ? 'Assets root is a filesystem link and was not followed.'
                : 'Assets path exists but is not a directory.',
        ));
        return { files, diagnostics };
    }

    const visit = async (directory: string, relativeDirectory: string): Promise<void> => {
        let entries;
        try {
            entries = await readdir(directory, { withFileTypes: true });
        } catch {
            diagnostics.push(diagnostic(
                asWorkspaceRelativePath(relativeDirectory),
                'SOURCE_READ_ERROR',
                'Asset directory could not be read.',
            ));
            return;
        }

        entries.sort((left, right) => left.name.localeCompare(right.name, 'en'));
        for (const entry of entries) {
            const absolutePath = path.join(directory, entry.name);
            const relativeWithinAssets = path.join(relativeDirectory, entry.name);
            const relativePath = asWorkspaceRelativePath(relativeWithinAssets);
            let entryStats;
            try {
                entryStats = await lstat(absolutePath);
            } catch {
                diagnostics.push(diagnostic(relativePath, 'SOURCE_READ_ERROR', 'Asset source entry could not be inspected.'));
                continue;
            }
            if (entryStats.isSymbolicLink()) {
                diagnostics.push(diagnostic(
                    relativePath,
                    'UNSAFE_LINK',
                    'Filesystem link/junction was skipped; the indexer does not follow links.',
                ));
                continue;
            }
            if (entryStats.isDirectory()) {
                await visit(absolutePath, relativeWithinAssets);
                continue;
            }
            if (!entryStats.isFile()) continue;
            files.push({
                absolutePath,
                relativePath,
                fileName: entry.name,
                sizeBytes: entryStats.size,
                modifiedTimeMs: entryStats.mtimeMs,
            });
        }
    };

    await visit(assetsRoot, '');
    return { files, diagnostics };
};

const invalidDiscoveredAsset = (
    file: DiscoveredFile,
    extension: string,
    details: Partial<DiscoveredAsset>,
    diagnostics: DiscoveryDiagnostic[],
): DiscoveredAsset => ({
    relativePath: file.relativePath,
    fileName: file.fileName,
    extension,
    sizeBytes: file.sizeBytes,
    modifiedTimeMs: file.modifiedTimeMs,
    contentHash: details.contentHash ?? null,
    parsedCardName: details.parsedCardName ?? null,
    parsedPassword: details.parsedPassword ?? null,
    role: details.role ?? null,
    variantLabel: details.variantLabel ?? null,
    variantKey: details.variantKey ?? null,
    associationState: details.associationState ?? 'INVALID',
    cardId: details.cardId ?? null,
    imageWidth: details.imageWidth ?? null,
    imageHeight: details.imageHeight ?? null,
    hasTransparency: details.hasTransparency ?? null,
    validAsset: false,
    diagnostics,
});

export class AssetIndexerService {
    constructor(
        private readonly workspaceRoot: string,
        private readonly persistence: WorkspacePersistence,
    ) {}

    private resolveAssociation(password: string | null, cardName: string) {
        return this.persistence.runRepositoryOperation(database => {
            const candidates = password !== null
                ? findCanonicalCardIdsByPassword(database, password)
                : findTokenCardIdsByNormalizedName(database, cardName);
            if (candidates.length === 1) {
                return { state: 'RESOLVED' as const, cardId: candidates[0] ?? null };
            }
            if (candidates.length === 0) return { state: 'UNRESOLVED' as const, cardId: null };
            return { state: 'AMBIGUOUS' as const, cardId: null };
        });
    }

    /** When filename parse already yielded role/variant/password, retain diagnostic association even if the asset is invalid. */
    private withKnowableAssociation(
        details: Partial<DiscoveredAsset>,
        password: string | null,
        cardName: string,
    ): Partial<DiscoveredAsset> {
        const association = this.resolveAssociation(password, cardName);
        if (association.state !== 'RESOLVED') return details;
        return {
            ...details,
            associationState: 'RESOLVED',
            cardId: association.cardId,
        };
    }

    private async inspectManagedFile(file: DiscoveredFile, ownership: ManagedOwnership): Promise<DiscoveredAsset> {
        const baseDetails: Partial<DiscoveredAsset> = {
            role: ownership.role,
            variantLabel: ownership.displayLabel,
            variantKey: ownership.variantKey,
            associationState: 'RESOLVED',
            cardId: ownership.cardId,
        };
        if (!isSupportedAssetFormat(ownership.role, ownership.extension)) {
            return invalidDiscoveredAsset(file, ownership.extension, baseDetails, [diagnostic(
                file.relativePath,
                'UNSUPPORTED_FORMAT',
                `Registered managed extension ${ownership.extension} is not supported for role ${ownership.role}.`,
            )]);
        }
        let image;
        try {
            image = await inspectAssetImage(file.absolutePath, ownership.role, ownership.extension);
        } catch (error) {
            return invalidDiscoveredAsset(file, ownership.extension, baseDetails, [diagnostic(
                file.relativePath,
                'INVALID_IMAGE',
                error instanceof Error ? error.message : 'Managed image could not be decoded.',
            )]);
        }
        const inspectedDetails: Partial<DiscoveredAsset> = {
            ...baseDetails,
            contentHash: image.contentHash,
            imageWidth: image.width,
            imageHeight: image.height,
            hasTransparency: image.hasTransparency,
        };
        if (ownership.role === 'OF' && !image.hasTransparency) {
            return invalidDiscoveredAsset(file, ownership.extension, inspectedDetails, [diagnostic(
                file.relativePath,
                'INVALID_OF_TRANSPARENCY',
                'Managed OF PNG is fully opaque and does not contain usable transparency.',
            )]);
        }
        if (image.contentHash !== ownership.contentHash) {
            return invalidDiscoveredAsset(file, ownership.extension, inspectedDetails, [diagnostic(
                file.relativePath,
                'INVALID_IMAGE',
                'Managed asset content hash no longer matches committed ownership.',
            )]);
        }
        return {
            relativePath: file.relativePath,
            fileName: file.fileName,
            extension: ownership.extension,
            sizeBytes: file.sizeBytes,
            modifiedTimeMs: file.modifiedTimeMs,
            contentHash: image.contentHash,
            parsedCardName: null,
            parsedPassword: null,
            role: ownership.role,
            variantLabel: ownership.displayLabel,
            variantKey: ownership.variantKey,
            associationState: 'RESOLVED',
            cardId: ownership.cardId,
            imageWidth: image.width,
            imageHeight: image.height,
            hasTransparency: image.hasTransparency,
            validAsset: true,
            diagnostics: [],
        };
    }

    private async inspectFile(file: DiscoveredFile): Promise<DiscoveredAsset> {
        const explicit = this.persistence.runRepositoryOperation(db => overrideForPath(db, file.relativePath));
        if (explicit?.disposition === 'ASSIGN') {
            const extension = path.extname(file.fileName).slice(1).toLowerCase();
            const details: Partial<DiscoveredAsset> = { role: explicit.role, cardId: explicit.card_id,
                variantKey: explicit.variant_key, variantLabel: explicit.display_label, associationState: 'RESOLVED' };
            try {
                const image = await inspectAssetImage(file.absolutePath, explicit.role!, extension);
                const inspected = { ...details, contentHash: image.contentHash, imageWidth: image.width,
                    imageHeight: image.height, hasTransparency: image.hasTransparency };
                if (explicit.role === 'OF' && !image.hasTransparency) {
                    return invalidDiscoveredAsset(file, extension, inspected,
                        [diagnostic(file.relativePath, 'INVALID_OF_TRANSPARENCY', 'Assigned OF image is opaque.')]);
                }
                // Registered ownership integrity remains authoritative even with an override.
                const owner = this.persistence.runRepositoryOperation(db => findManagedOwnershipByRelativePath(db, file.relativePath));
                if (owner && owner.contentHash !== image.contentHash) {
                    return invalidDiscoveredAsset(file, extension, inspected,
                        [diagnostic(file.relativePath, 'INVALID_IMAGE', 'Managed content differs from committed ownership.')]);
                }
                return { ...invalidDiscoveredAsset(file, extension, inspected, []), validAsset: true };
            } catch {
                return invalidDiscoveredAsset(file, extension, details,
                    [diagnostic(file.relativePath, 'INVALID_IMAGE', 'Assigned source is not a valid image for this role.')]);
            }
        }
        const managedOwnership = this.persistence.runRepositoryOperation(database =>
            findManagedOwnershipByRelativePath(database, file.relativePath));
        if (managedOwnership) return this.inspectManagedFile(file, managedOwnership);

        let parsed;
        try {
            parsed = parseAssetFilename(file.fileName);
        } catch (error) {
            const extension = path.extname(file.fileName).slice(1).toLowerCase();
            return invalidDiscoveredAsset(file, extension, {}, [diagnostic(
                file.relativePath,
                'INVALID_FILENAME',
                error instanceof Error ? error.message : 'Asset filename is invalid.',
            )]);
        }

        const baseDetails: Partial<DiscoveredAsset> = {
            parsedCardName: parsed.cardName,
            parsedPassword: parsed.password,
            role: parsed.role,
            variantLabel: parsed.variantLabel,
            variantKey: parsed.variantKey,
        };

        if (!isSupportedAssetFormat(parsed.role, parsed.extension)) {
            return invalidDiscoveredAsset(
                file,
                parsed.extension,
                this.withKnowableAssociation(baseDetails, parsed.password, parsed.cardName),
                [diagnostic(
                    file.relativePath,
                    'UNSUPPORTED_FORMAT',
                    `Extension ${parsed.extension || '(none)'} is not supported for role ${parsed.role}.`,
                )],
            );
        }

        let image;
        try {
            image = await inspectAssetImage(file.absolutePath, parsed.role, parsed.extension);
        } catch (error) {
            return invalidDiscoveredAsset(
                file,
                parsed.extension,
                this.withKnowableAssociation(baseDetails, parsed.password, parsed.cardName),
                [diagnostic(
                    file.relativePath,
                    'INVALID_IMAGE',
                    error instanceof Error ? error.message : 'Image could not be decoded.',
                )],
            );
        }

        const inspectedDetails: Partial<DiscoveredAsset> = {
            ...baseDetails,
            contentHash: image.contentHash,
            imageWidth: image.width,
            imageHeight: image.height,
            hasTransparency: image.hasTransparency,
        };

        if (parsed.role === 'OF' && !image.hasTransparency) {
            return invalidDiscoveredAsset(
                file,
                parsed.extension,
                this.withKnowableAssociation(inspectedDetails, parsed.password, parsed.cardName),
                [diagnostic(
                    file.relativePath,
                    'INVALID_OF_TRANSPARENCY',
                    'OF PNG is fully opaque and does not contain usable transparency.',
                )],
            );
        }

        // A fenced source is still physically inspected, but Canonical creation must
        // not change its validity/token or revive filename association.
        const suppressed = explicit?.disposition === 'UNASSIGN' || explicit?.disposition === 'IGNORE';
        const association = suppressed ? { state: 'UNRESOLVED' as const, cardId: null }
            : this.resolveAssociation(parsed.password, parsed.cardName);
        if (!suppressed && association.state !== 'RESOLVED') {
            return invalidDiscoveredAsset(
                file,
                parsed.extension,
                { ...inspectedDetails, associationState: association.state },
                [diagnostic(
                    file.relativePath,
                    association.state === 'AMBIGUOUS' ? 'AMBIGUOUS_CARD' : 'UNRESOLVED_CARD',
                    association.state === 'AMBIGUOUS'
                        ? 'Asset association matched multiple eligible Canonical cards.'
                        : 'Asset association did not match an eligible Canonical card.',
                )],
            );
        }

        return {
            relativePath: file.relativePath,
            fileName: file.fileName,
            extension: parsed.extension,
            sizeBytes: file.sizeBytes,
            modifiedTimeMs: file.modifiedTimeMs,
            contentHash: image.contentHash,
            parsedCardName: parsed.cardName,
            parsedPassword: parsed.password,
            role: parsed.role,
            variantLabel: parsed.variantLabel,
            variantKey: parsed.variantKey,
            associationState: association.state,
            cardId: association.cardId,
            imageWidth: image.width,
            imageHeight: image.height,
            hasTransparency: image.hasTransparency,
            validAsset: true,
            diagnostics: [],
        };
    }

    async scan(): Promise<AssetScanSnapshot> {
        const startedAt = new Date().toISOString();
        const scanId = randomUUID();
        const discovery = await discoverAssetFiles(this.workspaceRoot);
        const inspected: DiscoveredAsset[] = [];
        for (const file of discovery.files) {
            inspected.push(await this.inspectFile(file));
        }
        const completedAt = new Date().toISOString();

        this.persistence.transaction(database => {
            reconcileAssetIndex(database, {
                scanId,
                startedAt,
                completedAt,
                assets: inspected,
                scanDiagnostics: discovery.diagnostics,
            });
        });

        return this.persistence.runRepositoryOperation(database => {
            const scan = database.prepare(`
                SELECT started_at, completed_at, discovered_count, present_count, diagnostic_count
                FROM asset_index_scans WHERE scan_id = ?
            `).get(scanId) as {
                started_at: string;
                completed_at: string;
                discovered_count: number;
                present_count: number;
                diagnostic_count: number;
            } | undefined;
            if (!scan) throw new Error(`Asset index scan ${scanId} was not persisted.`);
            return {
                scanId,
                startedAt: scan.started_at,
                completedAt: scan.completed_at,
                discoveredCount: scan.discovered_count,
                presentCount: scan.present_count,
                diagnosticCount: scan.diagnostic_count,
                assets: listIndexedAssets(database),
                variants: listArtVariants(database),
                diagnostics: listDiagnosticsForScan(database, scanId),
            };
        });
    }

    listAssets() {
        return this.persistence.runRepositoryOperation(database => listIndexedAssets(database));
    }

    listVariants(cardId?: string) {
        return this.persistence.runRepositoryOperation(database => listArtVariants(database, cardId));
    }

    listDiagnostics(scanId: string) {
        return this.persistence.runRepositoryOperation(database => listDiagnosticsForScan(database, scanId));
    }
}