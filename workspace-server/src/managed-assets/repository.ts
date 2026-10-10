import { writePreference } from '../variant-lifecycle/preferences';
import { randomUUID } from 'node:crypto';
import type { AssetRole } from '../assets/types';
import type { SqliteDatabase } from '../persistence/database';
import type { ManagedAssetSnapshot } from './types';

type VariantRow = {
    variant_id: string;
    card_id: string;
    variant_key: string;
    display_label: string;
};

type ManagedRow = {
    managed_asset_id: string;
    variant_id: string;
    card_id: string;
    variant_key: string;
    display_label: string;
    role: AssetRole;
    managed_relative_path: string;
    content_hash: string;
    original_file_name: string;
    extension: string;
    created_at: string;
};

export type ManagedOwnership = {
    managedAssetId: string;
    variantId: string;
    cardId: string;
    variantKey: string;
    displayLabel: string;
    role: AssetRole;
    managedRelativePath: string;
    contentHash: string;
    extension: string;
};

export type IngestRequestRow = {
    idempotencyKey: string;
    requestFingerprint: string;
    managedAssetId: string;
};

const toSnapshot = (row: ManagedRow): ManagedAssetSnapshot => ({
    managedAssetId: row.managed_asset_id,
    variantId: row.variant_id,
    cardId: row.card_id,
    variantKey: row.variant_key,
    displayLabel: row.display_label,
    role: row.role,
    managedRelativePath: row.managed_relative_path,
    contentHash: row.content_hash,
    originalFileName: row.original_file_name,
    extension: row.extension,
    createdAt: row.created_at,
});

export const canonicalCardExists = (database: SqliteDatabase, cardId: string) =>
    Boolean(database.prepare('SELECT 1 AS present FROM canonical_cards WHERE card_id = ?').get(cardId));

export const findArtVariant = (
    database: SqliteDatabase,
    cardId: string,
    variantKey: string,
): VariantRow | null =>
    (database.prepare(`
        SELECT variant_id, card_id, variant_key, display_label
        FROM art_variants
        WHERE card_id = ? AND variant_key = ?
    `).get(cardId, variantKey) as VariantRow | undefined) ?? null;

export const createArtVariant = (
    database: SqliteDatabase,
    cardId: string,
    variantKey: string,
    displayLabel: string,
    timestamp: string,
): VariantRow => {
    const firstExplicitVariant = !database.prepare('SELECT 1 FROM art_variants WHERE card_id = ?').get(cardId);
    const variantId = randomUUID();
    database.prepare(`
        INSERT INTO art_variants (
            variant_id, card_id, variant_key, display_label, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?)
    `).run(variantId, cardId, variantKey, displayLabel, timestamp, timestamp);
    if (firstExplicitVariant) writePreference(database, cardId, variantId);
    return {
        variant_id: variantId,
        card_id: cardId,
        variant_key: variantKey,
        display_label: displayLabel,
    };
};

export const findManagedAssetByTarget = (
    database: SqliteDatabase,
    variantId: string,
    role: AssetRole,
): ManagedAssetSnapshot | null => {
    const row = database.prepare(`
        SELECT
            managed.managed_asset_id, managed.variant_id, variants.card_id,
            variants.variant_key, variants.display_label, managed.role,
            managed.managed_relative_path, managed.content_hash,
            managed.original_file_name, managed.extension, managed.created_at
        FROM managed_assets managed
        JOIN art_variants variants ON variants.variant_id = managed.variant_id
        WHERE managed.variant_id = ? AND managed.role = ?
    `).get(variantId, role) as ManagedRow | undefined;
    return row ? toSnapshot(row) : null;
};

export const findManagedAssetById = (
    database: SqliteDatabase,
    managedAssetId: string,
): ManagedAssetSnapshot | null => {
    const row = database.prepare(`
        SELECT
            managed.managed_asset_id, managed.variant_id, variants.card_id,
            variants.variant_key, variants.display_label, managed.role,
            managed.managed_relative_path, managed.content_hash,
            managed.original_file_name, managed.extension, managed.created_at
        FROM managed_assets managed
        JOIN art_variants variants ON variants.variant_id = managed.variant_id
        WHERE managed.managed_asset_id = ?
    `).get(managedAssetId) as ManagedRow | undefined;
    return row ? toSnapshot(row) : null;
};

export const findManagedOwnershipByRelativePath = (
    database: SqliteDatabase,
    relativePath: string,
): ManagedOwnership | null => {
    const row = database.prepare(`
        SELECT
            managed.managed_asset_id, managed.variant_id, variants.card_id,
            variants.variant_key, variants.display_label, managed.role,
            managed.managed_relative_path, managed.content_hash, managed.extension
        FROM managed_assets managed
        JOIN art_variants variants ON variants.variant_id = managed.variant_id
        WHERE managed.managed_relative_path = ?
    `).get(relativePath) as {
        managed_asset_id: string;
        variant_id: string;
        card_id: string;
        variant_key: string;
        display_label: string;
        role: AssetRole;
        managed_relative_path: string;
        content_hash: string;
        extension: string;
    } | undefined;
    return row ? {
        managedAssetId: row.managed_asset_id,
        variantId: row.variant_id,
        cardId: row.card_id,
        variantKey: row.variant_key,
        displayLabel: row.display_label,
        role: row.role,
        managedRelativePath: row.managed_relative_path,
        contentHash: row.content_hash,
        extension: row.extension,
    } : null;
};

export const findIngestRequest = (
    database: SqliteDatabase,
    idempotencyKey: string,
): IngestRequestRow | null => {
    const row = database.prepare(`
        SELECT idempotency_key, request_fingerprint, managed_asset_id
        FROM managed_asset_ingest_requests
        WHERE idempotency_key = ?
    `).get(idempotencyKey) as {
        idempotency_key: string;
        request_fingerprint: string;
        managed_asset_id: string;
    } | undefined;
    return row ? {
        idempotencyKey: row.idempotency_key,
        requestFingerprint: row.request_fingerprint,
        managedAssetId: row.managed_asset_id,
    } : null;
};

export const insertManagedAsset = (
    database: SqliteDatabase,
    input: {
        variantId: string;
        role: AssetRole;
        managedRelativePath: string;
        contentHash: string;
        originalFileName: string;
        extension: string;
        createdAt: string;
    },
) => {
    const managedAssetId = randomUUID();
    database.prepare(`
        INSERT INTO managed_assets (
            managed_asset_id, variant_id, role, managed_relative_path,
            content_hash, original_file_name, extension, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
        managedAssetId,
        input.variantId,
        input.role,
        input.managedRelativePath,
        input.contentHash,
        input.originalFileName,
        input.extension,
        input.createdAt,
    );
    const created = findManagedAssetById(database, managedAssetId);
    if (!created) throw new Error('Managed asset insert did not round-trip.');
    return created;
};

export const insertIngestRequest = (
    database: SqliteDatabase,
    idempotencyKey: string,
    requestFingerprint: string,
    managedAssetId: string,
    createdAt: string,
) => {
    database.prepare(`
        INSERT INTO managed_asset_ingest_requests (
            idempotency_key, request_fingerprint, managed_asset_id, created_at
        ) VALUES (?, ?, ?, ?)
    `).run(idempotencyKey, requestFingerprint, managedAssetId, createdAt);
};

export const countCurrentRoleCandidates = (
    database: SqliteDatabase,
    cardId: string,
    variantKey: string,
    role: AssetRole,
) => {
    const row = database.prepare(`
        SELECT count(*) AS count
        FROM indexed_asset_files
        WHERE present = 1
          AND valid_asset = 1
          AND association_state = 'RESOLVED'
          AND card_id = ?
          AND variant_key = ?
          AND role = ?
    `).get(cardId, variantKey, role) as { count: number };
    return row.count;
};

export const listManagedAssets = (database: SqliteDatabase): ManagedAssetSnapshot[] =>
    (database.prepare(`
        SELECT
            managed.managed_asset_id, managed.variant_id, variants.card_id,
            variants.variant_key, variants.display_label, managed.role,
            managed.managed_relative_path, managed.content_hash,
            managed.original_file_name, managed.extension, managed.created_at
        FROM managed_assets managed
        JOIN art_variants variants ON variants.variant_id = managed.variant_id
        ORDER BY managed.managed_relative_path
    `).all() as ManagedRow[]).map(toSnapshot);

export const deleteManagedIngest = (
    database: SqliteDatabase,
    managedAssetId: string,
    variantId: string,
    idempotencyKey: string,
    managedRelativePath: string,
    deleteVariant: boolean,
) => {
    database.prepare('DELETE FROM managed_asset_ingest_requests WHERE idempotency_key = ?').run(idempotencyKey);
    database.prepare('DELETE FROM managed_assets WHERE managed_asset_id = ?').run(managedAssetId);
    database.prepare(`
        DELETE FROM variant_role_bindings
        WHERE asset_id IN (
            SELECT asset_id FROM indexed_asset_files WHERE relative_path = ?
        )
    `).run(managedRelativePath);
    database.prepare(`
        UPDATE indexed_asset_files
        SET present = 0, variant_id = NULL
        WHERE relative_path = ? AND variant_id = ?
    `).run(managedRelativePath, variantId);
    if (deleteVariant) {
        database.prepare('DELETE FROM card_variant_preferences WHERE preferred_variant_id = ?').run(variantId);
        database.prepare(`
            DELETE FROM art_variants
            WHERE variant_id = ?
              AND NOT EXISTS (SELECT 1 FROM managed_assets WHERE variant_id = ?)
              AND NOT EXISTS (SELECT 1 FROM indexed_asset_files WHERE variant_id = ?)
              AND NOT EXISTS (SELECT 1 FROM variant_role_bindings WHERE variant_id = ?)
        `).run(variantId, variantId, variantId, variantId);
    }
};
