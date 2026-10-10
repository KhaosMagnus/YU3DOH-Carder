import { createHmac, randomBytes, randomUUID } from 'node:crypto';
import type { SqliteDatabase, WorkspacePersistence } from '../persistence/database';
import type { AssetRole } from '../assets/types';

export type Disposition = 'ASSIGN' | 'UNASSIGN' | 'IGNORE';
export type Override = {
    disposition: Disposition; variant_id: string | null; role: AssetRole | null;
    card_id: string | null; variant_key: string | null; display_label: string | null;
};

export const overrideForPath = (db: SqliteDatabase, relative: string): Override | null =>
    (db.prepare(`SELECT o.disposition, o.variant_id, o.role, v.card_id, v.variant_key, v.display_label
        FROM asset_resolution_overrides o JOIN indexed_asset_files a ON a.asset_id = o.asset_id
        LEFT JOIN art_variants v ON v.variant_id = o.variant_id WHERE a.relative_path = ?`).get(relative) as Override | undefined) ?? null;

export const setOverride = (db: SqliteDatabase, asset: string, disposition: Disposition,
    variant: string | null = null, role: AssetRole | null = null) => {
    db.prepare(`INSERT INTO asset_resolution_overrides (asset_id, disposition, variant_id, role, revision, updated_at)
        VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(asset_id) DO UPDATE SET
        disposition = excluded.disposition, variant_id = excluded.variant_id, role = excluded.role,
        revision = excluded.revision, updated_at = excluded.updated_at`)
        .run(asset, disposition, variant, role, randomUUID(), new Date().toISOString());
};

/** Conservative asset-domain concurrency, independent of Canonical card revisions and scan IDs.
 * A process-specific HMAC makes tokens opaque and prevents clients from synthesizing them.
 * Override revisions invalidate ABA changes; unrelated asset changes also invalidate a preview.
 */
export class AssetStateTokens {
    private readonly secret = randomBytes(32);
    constructor(private readonly persistence: WorkspacePersistence) {}
    current(): string {
        return this.persistence.runRepositoryOperation(db => {
            const state = [
                db.prepare(`SELECT asset_id, relative_path, size_bytes, modified_time_ms, content_hash,
                    role, card_id, variant_id, association_state, valid_asset, present
                    FROM indexed_asset_files ORDER BY asset_id`).all(),
                db.prepare('SELECT * FROM asset_resolution_overrides ORDER BY asset_id').all(),
                db.prepare('SELECT * FROM managed_assets ORDER BY managed_asset_id').all(),
                db.prepare('SELECT variant_id, card_id, variant_key, display_label FROM art_variants ORDER BY variant_id').all(),
                db.prepare('SELECT * FROM variant_role_bindings ORDER BY variant_id, role').all(),
                db.prepare('SELECT * FROM card_variant_preferences ORDER BY card_id').all(),
            ];
            return createHmac('sha256', this.secret).update(JSON.stringify(state)).digest('base64url');
        });
    }
}
