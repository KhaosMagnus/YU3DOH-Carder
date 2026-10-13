import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

/** Opaque process-local write capability. Only secret digests are retained.
 * Bounded FIFO registry, fixed TTL, no persistence or filesystem authority. */
export type CarderWriteGrantScope = {
    cardId: string;
    contentLanguage: import('../canonical/types').CanonicalLanguage;
    revision: string;
};

type GrantEntry = {
    secretDigest: Buffer;
    scope: CarderWriteGrantScope;
    expiresAt: number;
};

export const CARDER_WRITE_GRANT_TTL_MS = 12 * 60 * 60 * 1000;
export const CARDER_WRITE_GRANT_MAX_ENTRIES = 4096;

const GRANT_ID_BYTES = 16;
const GRANT_SECRET_BYTES = 32;
const GRANT_TOKEN_MAX_LENGTH = 128;
const GRANT_TOKEN_PATTERN = /^[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}$/;

const sha256 = (value: Buffer) => createHash('sha256').update(value).digest();

export class CarderWriteGrantRegistry {
    private readonly entries = new Map<string, GrantEntry>();

    private readonly ttlMs: number;

    private readonly maxEntries: number;

    private readonly now: () => number;

    constructor(
        options: {
            ttlMs?: number;
            maxEntries?: number;
            now?: () => number;
        } = {},
    ) {
        this.ttlMs = options.ttlMs ?? CARDER_WRITE_GRANT_TTL_MS;
        this.maxEntries = Math.max(
            1,
            options.maxEntries ?? CARDER_WRITE_GRANT_MAX_ENTRIES,
        );
        this.now = options.now ?? Date.now;
    }

    /** Issue one opaque grant for one prepared card/language/revision. Returns `<id>.<secret>`. */
    issue(scope: CarderWriteGrantScope): string {
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
     * Verify one write capability without consuming it. Any failure → null (uniform;
     * never throws). Pure memory: no DB, no filesystem.
     */
    verify(token: string | undefined): CarderWriteGrantScope | null {
        if (
            typeof token !== 'string' ||
            token.length === 0 ||
            token.length > GRANT_TOKEN_MAX_LENGTH
        ) {
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
        if (
            digest.length !== entry.secretDigest.length ||
            !timingSafeEqual(digest, entry.secretDigest)
        ) {
            return null;
        }

        return { ...entry.scope };
    }

    revoke(token: string) {
        this.entries.delete(token.split('.')[0]!);
    }

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
