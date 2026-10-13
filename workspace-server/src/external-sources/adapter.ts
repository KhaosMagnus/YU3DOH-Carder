import { createHash } from 'node:crypto';
import { ExternalSourceError } from './errors';
import type { SourceDocument } from './types';

export const SOURCE_TIMEOUT_MS = 10_000;
export const SOURCE_MAX_BYTES = 4_194_304;
export function assertExternalCardId(id: unknown): asserts id is string {
    // JS `$` also matches before a trailing newline; the trim check enforces the frozen no-whitespace rule.
    if (
        typeof id !== 'string' ||
        id !== id.trim() ||
        !/^[1-9][0-9]{0,19}$/.test(id)
    ) {
        throw new ExternalSourceError(
            'SOURCE_CARD_ID_INVALID',
            'External card ID must be 1–20 ASCII decimal digits, without whitespace or leading zero.',
        );
    }
}
export type AdapterOptions = {
    /** Dependency injection for deterministic tests; provider URL/headers are never configurable. */
    fetch?: typeof fetch;
    deadline?: (callback: () => void, milliseconds: number) => () => void;
};
export class YgoResourcesCardAdapter {
    constructor(private readonly options: AdapterOptions = {}) {}

    async retrieve(
        id: string,
        documentId: string,
    ): Promise<{ document: SourceDocument; payload?: unknown }> {
        assertExternalCardId(id);
        const document: SourceDocument = {
            document_id: documentId,
            document_kind: 'CARD_JSON',
            source_ref: `https://db.ygoresources.com/data/card/${id}`,
            status: 'REMOTE_ERROR',
            http_status: null,
            content_type: null,
            payload_hash: null,
            raw_payload: null,
            source_cache_revision: null,
            error_code: null,
            error_message: null,
        };
        const controller = new AbortController();
        let timedOut = false;
        let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
        const failure = (
            status: SourceDocument['status'],
            code: string,
            message: string,
        ) => {
            document.status = status;
            document.error_code = code;
            document.error_message = message;
            return { document };
        };
        let timeoutReject!: (error: Error) => void;
        const timeout = new Promise<never>((_, reject) => {
            timeoutReject = reject;
        });
        const setDeadline =
            this.options.deadline ??
            ((callback: () => void, ms: number) => {
                const timer = setTimeout(callback, ms);
                return () => clearTimeout(timer);
            });
        const cancelDeadline = setDeadline(() => {
            timedOut = true;
            controller.abort();
            void reader?.cancel().catch(() => undefined);
            timeoutReject(new Error('Source deadline exceeded.'));
        }, SOURCE_TIMEOUT_MS);
        const consume = async () => {
            const response = await (this.options.fetch ?? fetch)(
                document.source_ref,
                {
                    method: 'GET',
                    redirect: 'manual',
                    credentials: 'omit',
                    signal: controller.signal,
                    headers: {
                        Accept: 'application/json',
                        'User-Agent': 'YU3DOH-Workspace/0.1.0',
                    },
                },
            );
            if (timedOut) {
                void response.body?.cancel().catch(() => undefined);
                throw new Error('Source deadline exceeded.');
            }
            document.http_status = response.status;
            document.content_type = response.headers.get('content-type');
            const revision = response.headers.get('x-cache-revision');
            document.source_cache_revision =
                revision !== null &&
                revision === revision.trim() &&
                /^[0-9]+$/.test(revision)
                    ? revision
                    : null;
            if (response.status >= 300 && response.status <= 399) {
                void response.body?.cancel().catch(() => undefined);
                return failure(
                    'REDIRECT_REJECTED',
                    'SOURCE_REDIRECT_REJECTED',
                    'Provider redirects are not followed.',
                );
            }
            if (!response.ok) {
                void response.body?.cancel().catch(() => undefined);
                return response.status === 404 || response.status === 410
                    ? failure(
                          'NOT_FOUND',
                          'SOURCE_DOCUMENT_NOT_FOUND',
                          'Provider document was not found.',
                      )
                    : failure(
                          'REMOTE_ERROR',
                          'SOURCE_RETRIEVAL_FAILED',
                          `Provider returned HTTP ${response.status}.`,
                      );
            }
            if (
                !/^application\/(?:json|[a-z0-9!#$&^_.+-]+\+json)(?:\s*;\s*charset\s*=\s*(?:[a-z0-9_-]+|"[a-z0-9_-]+"))?\s*$/i.test(
                    document.content_type ?? '',
                )
            ) {
                void response.body?.cancel().catch(() => undefined);
                return failure(
                    'CONTENT_TYPE_UNSUPPORTED',
                    'SOURCE_CONTENT_TYPE_UNSUPPORTED',
                    'Provider must return a JSON Content-Type.',
                );
            }
            const chunks: Uint8Array[] = [];
            let total = 0;
            reader = response.body?.getReader();
            if (reader)
                while (true) {
                    const chunk = await reader.read();
                    if (timedOut)
                        throw new Error('Timed out while consuming body.');
                    if (chunk.done) break;
                    total += chunk.value.byteLength;
                    if (total > SOURCE_MAX_BYTES) {
                        controller.abort();
                        void reader.cancel().catch(() => undefined);
                        return failure(
                            'PAYLOAD_TOO_LARGE',
                            'SOURCE_PAYLOAD_TOO_LARGE',
                            'Provider JSON exceeds 4 MiB.',
                        );
                    }
                    chunks.push(chunk.value);
                }
            const bytes = Buffer.concat(chunks, total);
            document.payload_hash = createHash('sha256')
                .update(bytes)
                .digest('hex');
            try {
                // Fatal UTF-8 decoding preserves evidence; no replacement characters or HTML interpretation.
                document.raw_payload = new TextDecoder('utf-8', {
                    fatal: true,
                    ignoreBOM: true,
                }).decode(bytes);
                const payload: unknown = JSON.parse(document.raw_payload);
                document.status = 'SUCCESS';
                return { document, payload };
            } catch {
                return failure(
                    'INVALID_JSON',
                    'SOURCE_PARSE_FAILED',
                    'Provider body is not valid UTF-8 JSON.',
                );
            }
        };
        try {
            return await Promise.race([consume(), timeout]);
        } catch {
            return timedOut
                ? failure(
                      'TIMEOUT',
                      'SOURCE_TIMEOUT',
                      'Provider request exceeded 10,000 ms.',
                  )
                : failure(
                      'REMOTE_ERROR',
                      'SOURCE_RETRIEVAL_FAILED',
                      'Provider retrieval failed.',
                  );
        } finally {
            cancelDeadline();
        }
    }
}
