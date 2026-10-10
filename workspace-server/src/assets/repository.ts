import { randomUUID } from 'node:crypto';
import type { SqliteDatabase } from '../persistence/database';
import { normalizeAssociationName } from './filename';
import type {
    ArtVariantSnapshot,
    AssetAssociationState,
    AssetDiagnosticCode,
    AssetDiagnosticSnapshot,
    AssetRole,
    DiscoveredAsset,
    IndexedAssetSnapshot,
} from './types';

export type ReconcileInput = {
    scanId: string;
    startedAt: string;
    completedAt: string;
    assets: DiscoveredAsset[];
    scanDiagnostics: Array<{ relativePath: string; code: AssetDiagnosticCode; message: string }>;
};

type ExistingAssetRow = {
    asset_id: string;
    relative_path: string;
    first_seen_scan_id: string;
};

type CandidateCardRow = { card_id: string };

type VariantRow = {
    variant_id: string;
    card_id: string;
    variant_key: string;
    display_label: string;
};

type IndexedAssetRow = {
    asset_id: string;
    relative_path: string;
    file_name: string;
    extension: string;
    size_bytes: number;
    modified_time_ms: number;
    content_hash: string | null;
    parsed_card_name: string | null;
    parsed_password: string | null;
    role: AssetRole | null;
    variant_label: string | null;
    variant_key: string | null;
    association_state: AssetAssociationState;
    card_id: string | null;
    variant_id: string | null;
    image_width: number | null;
    image_height: number | null;
    has_transparency: number | null;
    valid_asset: number;
    present: number;
};

const toAssetSnapshot = (row: IndexedAssetRow): IndexedAssetSnapshot => ({
    assetId: row.asset_id,
    relativePath: row.relative_path,
    fileName: row.file_name,
    extension: row.extension,
    sizeBytes: row.size_bytes,
    modifiedTimeMs: row.modified_time_ms,
    contentHash: row.content_hash,
    parsedCardName: row.parsed_card_name,
    parsedPassword: row.parsed_password,
    role: row.role,
    variantLabel: row.variant_label,
    variantKey: row.variant_key,
    associationState: row.association_state,
    cardId: row.card_id,
    variantId: row.variant_id,
    imageWidth: row.image_width,
    imageHeight: row.image_height,
    hasTransparency: row.has_transparency === null ? null : row.has_transparency === 1,
    validAsset: row.valid_asset === 1,
    present: row.present === 1,
});

export const findCanonicalCardIdsByPassword = (database: SqliteDatabase, password: string) =>
    (database.prepare(`
        SELECT card_id
        FROM canonical_cards
        WHERE password = ?
        ORDER BY card_id
    `).all(password) as CandidateCardRow[]).map(row => row.card_id);

export const findTokenCardIdsByNormalizedName = (database: SqliteDatabase, nameHint: string) => {
    const normalizedHint = normalizeAssociationName(nameHint);
    const rows = database.prepare(`
        SELECT cards.card_id, text.name
        FROM canonical_cards cards
        JOIN canonical_localized_text text ON text.card_id = cards.card_id
        WHERE cards.family = 'TOKEN' AND cards.password IS NULL AND text.name IS NOT NULL
        ORDER BY cards.card_id, text.language
    `).all() as Array<{ card_id: string; name: string }>;
    return [...new Set(rows
        .filter(row => normalizeAssociationName(row.name) === normalizedHint)
        .map(row => row.card_id))];
};

const upsertVariant = (
    database: SqliteDatabase,
    cardId: string,
    variantKey: string,
    displayLabel: string,
    timestamp: string,
) => {
    const existing = database.prepare(`
        SELECT variant_id, card_id, variant_key, display_label
        FROM art_variants
        WHERE card_id = ? AND variant_key = ?
    `).get(cardId, variantKey) as VariantRow | undefined;
    if (existing) {
        database.prepare('UPDATE art_variants SET updated_at = ? WHERE variant_id = ?')
            .run(timestamp, existing.variant_id);
        return existing.variant_id;
    }
    const variantId = randomUUID();
    database.prepare(`
        INSERT INTO art_variants (
            variant_id, card_id, variant_key, display_label, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?)
    `).run(variantId, cardId, variantKey, displayLabel, timestamp, timestamp);
    return variantId;
};

const insertDiagnostic = (
    database: SqliteDatabase,
    scanId: string,
    assetId: string | null,
    relativePath: string,
    code: AssetDiagnosticCode,
    message: string,
    timestamp: string,
) => {
    database.prepare(`
        INSERT INTO asset_index_diagnostics (
            diagnostic_id, scan_id, asset_id, relative_path, code, message, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(randomUUID(), scanId, assetId, relativePath, code, message, timestamp);
};

export const reconcileAssetIndex = (database: SqliteDatabase, input: ReconcileInput) => {
    database.prepare(`
        INSERT INTO asset_index_scans (
            scan_id, started_at, status, discovered_count, present_count, diagnostic_count
        ) VALUES (?, ?, 'RUNNING', ?, 0, 0)
    `).run(input.scanId, input.startedAt, input.assets.length);

    const existingRows = database.prepare(`
        SELECT asset_id, relative_path, first_seen_scan_id
        FROM indexed_asset_files
    `).all() as ExistingAssetRow[];
    const existingByPath = new Map(existingRows.map(row => [row.relative_path, row]));

    database.prepare(`
        UPDATE indexed_asset_files
        SET present = 0
        WHERE present = 1
    `).run();

    const upsert = database.prepare(`
        INSERT INTO indexed_asset_files (
            asset_id, relative_path, file_name, extension, size_bytes, modified_time_ms,
            content_hash, parsed_card_name, parsed_password, role, variant_label, variant_key,
            association_state, card_id, variant_id, image_width, image_height, has_transparency,
            valid_asset, present, first_seen_scan_id, last_seen_scan_id, updated_at
        ) VALUES (
            @assetId, @relativePath, @fileName, @extension, @sizeBytes, @modifiedTimeMs,
            @contentHash, @parsedCardName, @parsedPassword, @role, @variantLabel, @variantKey,
            @associationState, @cardId, @variantId, @imageWidth, @imageHeight, @hasTransparency,
            @validAsset, 1, @firstSeenScanId, @lastSeenScanId, @updatedAt
        )
        ON CONFLICT(relative_path) DO UPDATE SET
            file_name = excluded.file_name,
            extension = excluded.extension,
            size_bytes = excluded.size_bytes,
            modified_time_ms = excluded.modified_time_ms,
            content_hash = excluded.content_hash,
            parsed_card_name = excluded.parsed_card_name,
            parsed_password = excluded.parsed_password,
            role = excluded.role,
            variant_label = excluded.variant_label,
            variant_key = excluded.variant_key,
            association_state = excluded.association_state,
            card_id = excluded.card_id,
            variant_id = excluded.variant_id,
            image_width = excluded.image_width,
            image_height = excluded.image_height,
            has_transparency = excluded.has_transparency,
            valid_asset = excluded.valid_asset,
            present = 1,
            last_seen_scan_id = excluded.last_seen_scan_id,
            updated_at = excluded.updated_at
    `);

    const explicitDisposition = database.prepare('SELECT disposition FROM asset_resolution_overrides WHERE asset_id = ?');
    for (const asset of input.assets) {
        const existing = existingByPath.get(asset.relativePath);
        const disposition = existing ? (explicitDisposition.get(existing.asset_id) as { disposition: string } | undefined)?.disposition : undefined;
        // Explicit retirement/unassignment fences automatic variant writes, not physical validation.
        const suppressAutomaticAssociation = disposition === 'UNASSIGN' || disposition === 'IGNORE';
        // Diagnostic association: persist variant_id when association is knowable,
        // independent of validAsset. Bindings still require present+valid+RESOLVED.
        const variantId = !suppressAutomaticAssociation && asset.associationState === 'RESOLVED'
            && asset.cardId
            && asset.variantKey
            && asset.variantLabel
            ? upsertVariant(database, asset.cardId, asset.variantKey, asset.variantLabel, input.completedAt)
            : null;
        const assetId = existing?.asset_id ?? randomUUID();
        upsert.run({
            assetId,
            relativePath: asset.relativePath,
            fileName: asset.fileName,
            extension: asset.extension,
            sizeBytes: asset.sizeBytes,
            modifiedTimeMs: asset.modifiedTimeMs,
            contentHash: asset.contentHash,
            parsedCardName: asset.parsedCardName,
            parsedPassword: asset.parsedPassword,
            role: asset.role,
            variantLabel: asset.variantLabel,
            variantKey: asset.variantKey,
            associationState: suppressAutomaticAssociation ? 'UNRESOLVED' : asset.associationState,
            cardId: suppressAutomaticAssociation ? null : asset.cardId,
            variantId,
            imageWidth: asset.imageWidth,
            imageHeight: asset.imageHeight,
            hasTransparency: asset.hasTransparency === null ? null : asset.hasTransparency ? 1 : 0,
            validAsset: asset.validAsset ? 1 : 0,
            firstSeenScanId: existing?.first_seen_scan_id ?? input.scanId,
            lastSeenScanId: input.scanId,
            updatedAt: input.completedAt,
        });
        for (const diagnostic of asset.diagnostics) {
            insertDiagnostic(
                database,
                input.scanId,
                assetId,
                diagnostic.relativePath,
                diagnostic.code,
                diagnostic.message,
                input.completedAt,
            );
        }
    }

    for (const diagnostic of input.scanDiagnostics) {
        insertDiagnostic(
            database,
            input.scanId,
            null,
            diagnostic.relativePath,
            diagnostic.code,
            diagnostic.message,
            input.completedAt,
        );
    }

    // Explicit dispositions survive rescans and suppress automatic filename binding.
    database.prepare(`UPDATE indexed_asset_files SET card_id = NULL, variant_id = NULL,
        association_state = 'UNRESOLVED' WHERE asset_id IN (
        SELECT asset_id FROM asset_resolution_overrides WHERE disposition IN ('UNASSIGN', 'IGNORE'))`).run();
    database.prepare(`UPDATE indexed_asset_files SET variant_id = (
        SELECT variant_id FROM asset_resolution_overrides WHERE asset_id = indexed_asset_files.asset_id),
        card_id = (SELECT v.card_id FROM asset_resolution_overrides o JOIN art_variants v ON v.variant_id = o.variant_id
            WHERE o.asset_id = indexed_asset_files.asset_id),
        role = (SELECT role FROM asset_resolution_overrides WHERE asset_id = indexed_asset_files.asset_id),
        association_state = 'RESOLVED' WHERE asset_id IN (
            SELECT asset_id FROM asset_resolution_overrides WHERE disposition = 'ASSIGN')`).run();
    database.prepare(`DELETE FROM asset_index_diagnostics WHERE scan_id = ? AND asset_id IN (
        SELECT asset_id FROM asset_resolution_overrides WHERE disposition = 'IGNORE')`).run(input.scanId);
    const unassigned = database.prepare(`SELECT a.asset_id, a.relative_path FROM indexed_asset_files a
        JOIN asset_resolution_overrides o ON o.asset_id = a.asset_id
        WHERE o.disposition = 'UNASSIGN' AND a.present = 1`).all() as Array<{asset_id: string; relative_path: string}>;
    for (const row of unassigned) insertDiagnostic(database, input.scanId, row.asset_id, row.relative_path,
        'UNRESOLVED_CARD', 'Explicitly unassigned asset remains available for resolution.', input.completedAt);

    const missing = database.prepare(`
        SELECT asset_id, relative_path
        FROM indexed_asset_files
        WHERE present = 0 AND last_seen_scan_id <> ? AND asset_id NOT IN (
            SELECT asset_id FROM asset_resolution_overrides WHERE disposition = 'IGNORE')
        ORDER BY relative_path
    `).all(input.scanId) as Array<{ asset_id: string; relative_path: string }>;
    for (const row of missing) {
        insertDiagnostic(
            database,
            input.scanId,
            row.asset_id,
            row.relative_path,
            'MISSING_SOURCE',
            'Previously indexed source file is no longer present.',
            input.completedAt,
        );
    }

    database.prepare('DELETE FROM variant_role_bindings').run();
    const currentCandidates = database.prepare(`
        SELECT asset_id, variant_id, role, relative_path
        FROM indexed_asset_files
        WHERE present = 1
          AND valid_asset = 1
          AND association_state = 'RESOLVED'
          AND variant_id IS NOT NULL
          AND role IS NOT NULL
        ORDER BY variant_id, role, relative_path
    `).all() as Array<{
        asset_id: string;
        variant_id: string;
        role: AssetRole;
        relative_path: string;
    }>;

    const grouped = new Map<string, typeof currentCandidates>();
    for (const row of currentCandidates) {
        const key = `${row.variant_id}\u0000${row.role}`;
        const values = grouped.get(key) ?? [];
        values.push(row);
        grouped.set(key, values);
    }

    const insertBinding = database.prepare(`
        INSERT INTO variant_role_bindings (variant_id, role, asset_id)
        VALUES (?, ?, ?)
    `);
    for (const group of grouped.values()) {
        const first = group[0];
        if (!first) continue;
        if (group.length === 1) {
            insertBinding.run(first.variant_id, first.role, first.asset_id);
            continue;
        }
        for (const row of group) {
            insertDiagnostic(
                database,
                input.scanId,
                row.asset_id,
                row.relative_path,
                'ROLE_CONFLICT',
                `Multiple current assets resolve to the same variant role ${row.role}; no candidate was selected.`,
                input.completedAt,
            );
        }
    }

    const counts = database.prepare(`
        SELECT
            (SELECT count(*) FROM indexed_asset_files WHERE present = 1) AS present_count,
            (SELECT count(*) FROM asset_index_diagnostics WHERE scan_id = ?) AS diagnostic_count
    `).get(input.scanId) as { present_count: number; diagnostic_count: number };

    database.prepare(`
        UPDATE asset_index_scans
        SET completed_at = ?, status = 'COMPLETE', present_count = ?, diagnostic_count = ?
        WHERE scan_id = ?
    `).run(input.completedAt, counts.present_count, counts.diagnostic_count, input.scanId);
};

export const listIndexedAssets = (database: SqliteDatabase): IndexedAssetSnapshot[] =>
    (database.prepare(`
        SELECT
            asset_id, relative_path, file_name, extension, size_bytes, modified_time_ms,
            content_hash, parsed_card_name, parsed_password, role, variant_label, variant_key,
            association_state, card_id, variant_id, image_width, image_height, has_transparency,
            valid_asset, present
        FROM indexed_asset_files
        ORDER BY relative_path
    `).all() as IndexedAssetRow[]).map(toAssetSnapshot);

export const listDiagnosticsForScan = (
    database: SqliteDatabase,
    scanId: string,
): AssetDiagnosticSnapshot[] => {
    const rows = database.prepare(`
        SELECT diagnostic_id, scan_id, asset_id, relative_path, code, message
        FROM asset_index_diagnostics
        WHERE scan_id = ?
        ORDER BY relative_path, code, diagnostic_id
    `).all(scanId) as Array<{
        diagnostic_id: string;
        scan_id: string;
        asset_id: string | null;
        relative_path: string;
        code: AssetDiagnosticCode;
        message: string;
    }>;
    return rows.map(row => ({
        diagnosticId: row.diagnostic_id,
        scanId: row.scan_id,
        assetId: row.asset_id,
        relativePath: row.relative_path,
        code: row.code,
        message: row.message,
    }));
};

export const readiness = (roles: Record<AssetRole, IndexedAssetSnapshot | null | true>) => ({
    standard: roles.BS
        ? { state: 'READY' as const, sources: ['BS'] as AssetRole[] }
        : roles.BG && roles.OF
            ? { state: 'READY' as const, sources: ['BG', 'OF'] as AssetRole[] }
            : { state: 'INCOMPLETE' as const, sources: [] as AssetRole[] },
    overframe: !roles.OF
        ? { state: 'INCOMPLETE' as const, sources: [] as AssetRole[] }
        : roles.BG
            ? { state: 'READY' as const, sources: ['BG', 'OF'] as AssetRole[] }
            : roles.BS
                ? { state: 'READY' as const, sources: ['BS', 'OF'] as AssetRole[] }
                : { state: 'INCOMPLETE' as const, sources: [] as AssetRole[] },
});

export const listArtVariants = (
    database: SqliteDatabase,
    cardId?: string,
): ArtVariantSnapshot[] => {
    const variants = (cardId
        ? database.prepare(`
            SELECT variant_id, card_id, variant_key, display_label
            FROM art_variants WHERE card_id = ? ORDER BY variant_key
        `).all(cardId)
        : database.prepare(`
            SELECT variant_id, card_id, variant_key, display_label
            FROM art_variants ORDER BY card_id, variant_key
        `).all()) as VariantRow[];

    const assetRows = database.prepare(`
        SELECT
            files.asset_id, files.relative_path, files.file_name, files.extension,
            files.size_bytes, files.modified_time_ms, files.content_hash,
            files.parsed_card_name, files.parsed_password, files.role,
            files.variant_label, files.variant_key, files.association_state,
            files.card_id, files.variant_id, files.image_width, files.image_height,
            files.has_transparency, files.valid_asset, files.present
        FROM variant_role_bindings bindings
        JOIN indexed_asset_files files ON files.asset_id = bindings.asset_id
        ORDER BY files.variant_id, bindings.role
    `).all() as IndexedAssetRow[];
    const byVariantRole = new Map<string, IndexedAssetSnapshot>();
    for (const row of assetRows) {
        if (!row.variant_id || !row.role) continue;
        byVariantRole.set(`${row.variant_id}\u0000${row.role}`, toAssetSnapshot(row));
    }

    return variants.map(variant => {
        const roles: Record<AssetRole, IndexedAssetSnapshot | null> = {
            BS: byVariantRole.get(`${variant.variant_id}\u0000BS`) ?? null,
            BG: byVariantRole.get(`${variant.variant_id}\u0000BG`) ?? null,
            OF: byVariantRole.get(`${variant.variant_id}\u0000OF`) ?? null,
        };
        const calculated = readiness(roles);
        return {
            variantId: variant.variant_id,
            cardId: variant.card_id,
            variantKey: variant.variant_key,
            displayLabel: variant.display_label,
            roles,
            standard: calculated.standard,
            overframe: calculated.overframe,
        };
    });
};
export type LatestCompletedScanRow = {
    scanId: string;
    startedAt: string;
    completedAt: string;
    discoveredCount: number;
    presentCount: number;
    diagnosticCount: number;
};

/** Latest COMPLETE scan only. Ordering: completed_at DESC, started_at DESC, scan_id DESC. */
export const findLatestCompletedScan = (
    database: SqliteDatabase,
): LatestCompletedScanRow | null => {
    const row = database.prepare(`
        SELECT
            scan_id, started_at, completed_at,
            discovered_count, present_count, diagnostic_count
        FROM asset_index_scans
        WHERE status = 'COMPLETE' AND completed_at IS NOT NULL
        ORDER BY completed_at DESC, started_at DESC, scan_id DESC
        LIMIT 1
    `).get() as {
        scan_id: string;
        started_at: string;
        completed_at: string;
        discovered_count: number;
        present_count: number;
        diagnostic_count: number;
    } | undefined;
    if (!row) return null;
    return {
        scanId: row.scan_id,
        startedAt: row.started_at,
        completedAt: row.completed_at,
        discoveredCount: row.discovered_count,
        presentCount: row.present_count,
        diagnosticCount: row.diagnostic_count,
    };
};

export type EnrichedDiagnosticRow = {
    diagnosticId: string;
    scanId: string;
    assetId: string | null;
    relativePath: string;
    code: AssetDiagnosticCode;
    message: string;
    cardId: string | null;
    variantId: string | null;
    variantKey: string | null;
    role: AssetRole | null;
};

/** Diagnostics for one scan, enriched with indexed asset association fields when available. */
export const listEnrichedDiagnosticsForScan = (
    database: SqliteDatabase,
    scanId: string,
): EnrichedDiagnosticRow[] => {
    const rows = database.prepare(`
        SELECT
            d.diagnostic_id, d.scan_id, d.asset_id, d.relative_path, d.code, d.message,
            files.card_id, files.variant_id, files.variant_key, files.role
        FROM asset_index_diagnostics d
        LEFT JOIN indexed_asset_files files ON files.asset_id = d.asset_id
        WHERE d.scan_id = ?
        ORDER BY d.relative_path, d.code, d.diagnostic_id
    `).all(scanId) as Array<{
        diagnostic_id: string;
        scan_id: string;
        asset_id: string | null;
        relative_path: string;
        code: AssetDiagnosticCode;
        message: string;
        card_id: string | null;
        variant_id: string | null;
        variant_key: string | null;
        role: AssetRole | null;
    }>;
    return rows.map(row => ({
        diagnosticId: row.diagnostic_id,
        scanId: row.scan_id,
        assetId: row.asset_id,
        relativePath: row.relative_path,
        code: row.code,
        message: row.message,
        cardId: row.card_id,
        variantId: row.variant_id,
        variantKey: row.variant_key,
        role: row.role,
    }));
};

export const countRoleCandidatesForVariant = (
    database: SqliteDatabase,
    variantId: string,
    role: AssetRole,
): number => {
    const row = database.prepare(`
        SELECT count(*) AS count
        FROM indexed_asset_files
        WHERE present = 1
          AND valid_asset = 1
          AND association_state = 'RESOLVED'
          AND variant_id = ?
          AND role = ?
    `).get(variantId, role) as { count: number };
    return row.count;
};


/** Problem (missing/invalid) indexed asset associated to a variant role — diagnostic, not authoritative binding. */
export const findProblemIndexedAssetForVariantRole = (
    database: SqliteDatabase,
    variantId: string,
    role: AssetRole,
): IndexedAssetSnapshot | null => {
    const row = database.prepare(`
        SELECT
            asset_id, relative_path, file_name, extension, size_bytes, modified_time_ms,
            content_hash, parsed_card_name, parsed_password, role, variant_label, variant_key,
            association_state, card_id, variant_id, image_width, image_height, has_transparency,
            valid_asset, present
        FROM indexed_asset_files
        WHERE variant_id = ?
          AND role = ?
          AND (present = 0 OR valid_asset = 0)
        ORDER BY
            CASE WHEN present = 0 THEN 0 ELSE 1 END,
            relative_path,
            asset_id
        LIMIT 1
    `).get(variantId, role) as IndexedAssetRow | undefined;
    return row ? toAssetSnapshot(row) : null;
};

export const findIndexedAssetByRelativePath = (
    database: SqliteDatabase,
    relativePath: string,
): IndexedAssetSnapshot | null => {
    const row = database.prepare(`
        SELECT
            asset_id, relative_path, file_name, extension, size_bytes, modified_time_ms,
            content_hash, parsed_card_name, parsed_password, role, variant_label, variant_key,
            association_state, card_id, variant_id, image_width, image_height, has_transparency,
            valid_asset, present
        FROM indexed_asset_files
        WHERE relative_path = ?
    `).get(relativePath) as IndexedAssetRow | undefined;
    return row ? toAssetSnapshot(row) : null;
};
