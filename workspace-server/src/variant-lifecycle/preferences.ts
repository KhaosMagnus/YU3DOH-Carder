import { randomUUID } from 'node:crypto';
import type { SqliteDatabase } from '../persistence/database';
export const preferredVariant = (db: SqliteDatabase, cardId: string): string | null =>
    (db.prepare('SELECT preferred_variant_id FROM card_variant_preferences WHERE card_id = ?').get(cardId) as { preferred_variant_id: string | null } | undefined)?.preferred_variant_id ?? null;
export const writePreference = (db: SqliteDatabase, cardId: string, variantId: string | null) => {
    db.prepare(`INSERT INTO card_variant_preferences (card_id, preferred_variant_id, revision, updated_at) VALUES (?, ?, ?, ?)
        ON CONFLICT(card_id) DO UPDATE SET preferred_variant_id = excluded.preferred_variant_id,
        revision = excluded.revision, updated_at = excluded.updated_at`).run(cardId, variantId, randomUUID(), new Date().toISOString());
};
