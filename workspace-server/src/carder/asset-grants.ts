import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import type { AssetRole } from '../assets/types';
import type { CarderComposition } from './prepare-dto';

/**
 * RUN 009 QA-009-08 — prepared-composition asset authorization.
 *
 * In-memory, per-process registry of opaque capabilities ("grants"). A successful
 * prepare issues exactly one grant per emitted artwork asset; the GET content
 * endpoint serves bytes only when the grant matches the requested asset_id + hash.
 *
 * - Token: `<grantId>.<secret>`; grantId = base64url(16 random bytes) (22 chars),
 *   secret = base64url(32 random bytes) (43 chars). The token carries no data.
 * - Only sha256(secret) is stored; comparison uses timingSafeEqual over 32-byte
 *   digests after validating the decoded secret length.
 * - Fixed TTL (not sliding) and a hard entry cap with oldest-first eviction.
 * - No persistence, no env, no DB, no I/O: the registry dies with the process.
 */

export type CarderAssetGrantScope = {
    cardId: string;
    variantId: string;
    composition: CarderComposition;
    /** identity.revision of the prepare (bound for traceability; not re-verified on GET, S-9). */
    revision: string;
    assetId: string;
    /** Indexed sha256 hex emitted by the prepare. */
    hash: string;
    role: AssetRole;
};

type GrantEntry = {
    secretDigest: Buffer;
    scope: CarderAssetGrantScope;
    expiresAt: number;
};

export const CARDER_ASSET_GRANT_TTL_MS = 12 * 60 * 60 * 1000;
export const CARDER_ASSET_GRANT_MAX_ENTRIES = 4096;

const GRANT_ID_BYTES = 16;
const GRANT_SECRET_BYTES = 32;
const GRANT_TOKEN_MAX_LENGTH = 128;
const GRANT_TOKEN_PATTERN = /^[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}$/;

const sha256 = (value: Buffer) => createHash('sha256').update(value).digest();

export class CarderAssetGrantRegistry {
    private readonly entries = new Map<string, GrantEntry>();

    private readonly ttlMs: number;

    private readonly maxEntries: number;

    private readonly now: () => number;

    constructor(options: { ttlMs?: number; maxEntries?: number; now?: () => number } = {}) {
        this.ttlMs = options.ttlMs ?? CARDER_ASSET_GRANT_TTL_MS;
        this.maxEntries = Math.max(1, options.maxEntries ?? CARDER_ASSET_GRANT_MAX_ENTRIES);
        this.now = options.now ?? Date.now;
    }

    /** Issue one opaque grant for exactly one emitted asset. Returns `<id>.<secret>`. */
    issue(scope: CarderAssetGrantScope): string {
        const now = this.now();
        if (this.entries.size >= this.maxEntries) {
            this.purgeExpired(now);
        }
        while (this.entries.size >= this.maxEntries) {
            // Map iteration order = insertion order → evict the oldest grant (FIFO).
            const oldest = this.entries.keys().next();
            if (oldest.done) break;
            this.entries.delete(oldest.value);
        }

        let grantId = randomBytes(GRANT_ID_BYTES).toString('base64url');
        while (this.entries.has(grantId)) {
            grantId = randomBytes(GRANT_ID_BYTES).toString('base64url');
        }
        const secret = randomBytes(GRANT_SECRET_BYTES);
        this.entries.set(grantId, {
            secretDigest: sha256(secret),
            scope: { ...scope },
            expiresAt: now + this.ttlMs,
        });
        return `${grantId}.${secret.toString('base64url')}`;
    }

    /**
     * Verify a grant for a requested asset_id + hash. Any failure → null (uniform;
     * never throws). Pure memory: no DB, no filesystem.
     */
    verify(token: string | undefined, assetId: string, hash: string): CarderAssetGrantScope | null {
        if (typeof token !== 'string' || token.length === 0 || token.length > GRANT_TOKEN_MAX_LENGTH) {
            return null;
        }
        if (!GRANT_TOKEN_PATTERN.test(token)) {
            return null;
        }
        const separator = token.indexOf('.');
        const grantId = token.slice(0, separator);
        const secretText = token.slice(separator + 1);

        const entry = this.entries.get(grantId);
        if (!entry) {
            return null;
        }
        if (entry.expiresAt <= this.now()) {
            this.entries.delete(grantId);
            return null;
        }

        const secret = Buffer.from(secretText, 'base64url');
        // Length check BEFORE timingSafeEqual (it throws on length mismatch).
        if (secret.length !== GRANT_SECRET_BYTES) {
            return null;
        }
        // Reject non-canonical encodings (unused trailing bits) so a changed last
        // character can never alias the same secret bytes.
        if (secret.toString('base64url') !== secretText) {
            return null;
        }
        const digest = sha256(secret);
        if (digest.length !== entry.secretDigest.length || !timingSafeEqual(digest, entry.secretDigest)) {
            return null;
        }

        if (entry.scope.assetId !== assetId || entry.scope.hash !== hash) {
            return null;
        }
        return { ...entry.scope };
    }

    /** Number of live entries held (tests: cap / no-issue on failed prepare). */
    size(): number {
        return this.entries.size;
    }

    private purgeExpired(now: number) {
        for (const [grantId, entry] of this.entries) {
            if (entry.expiresAt <= now) {
                this.entries.delete(grantId);
            }
        }
    }
}
