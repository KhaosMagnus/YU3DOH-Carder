import type { SqliteDatabase } from '../persistence/database';
import type {
    Candidate,
    Diagnostic,
    Retrieval,
    RetrievalDetail,
    SourceDocument,
    StoredCandidate,
} from './types';
import { YGORESOURCES_SOURCE } from './types';

export function publishPackage(
    db: SqliteDatabase,
    recordId: string,
    retrieval: Retrieval,
    document: SourceDocument,
    candidate: StoredCandidate | null,
) {
    db.prepare(
        `INSERT INTO external_source_records VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(source_code, external_record_key) DO UPDATE SET updated_at=excluded.updated_at`,
    ).run(
        recordId,
        YGORESOURCES_SOURCE,
        retrieval.external_record_key,
        retrieval.retrieved_at,
        retrieval.retrieved_at,
    );
    const record = db
        .prepare(
            'SELECT source_record_id FROM external_source_records WHERE source_code=? AND external_record_key=?',
        )
        .get(YGORESOURCES_SOURCE, retrieval.external_record_key) as {
        source_record_id: string;
    };
    db.prepare(
        'INSERT INTO external_source_retrievals VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    ).run(
        retrieval.retrieval_id,
        record.source_record_id,
        retrieval.target_card_id,
        retrieval.target_expected_revision,
        retrieval.adapter_version,
        retrieval.status,
        retrieval.error_code,
        retrieval.error_message,
        retrieval.retrieved_at,
    );
    db.prepare(
        'INSERT INTO external_source_documents VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    ).run(
        document.document_id,
        retrieval.retrieval_id,
        document.document_kind,
        document.source_ref,
        document.status,
        document.http_status,
        document.content_type,
        document.payload_hash,
        document.raw_payload,
        document.source_cache_revision,
        document.error_code,
        document.error_message,
    );
    if (candidate)
        db.prepare(
            'INSERT INTO external_source_candidates VALUES (?, ?, ?, ?, ?, ?, ?)',
        ).run(
            candidate.candidate_id,
            retrieval.retrieval_id,
            candidate.candidate_schema_version,
            candidate.normalizer_version,
            JSON.stringify(candidate.candidate),
            JSON.stringify(candidate.diagnostics),
            candidate.created_at,
        );
}
const retrievalSql = `SELECT r.*, s.source_code, s.external_record_key FROM external_source_retrievals r
    JOIN external_source_records s ON s.source_record_id=r.source_record_id`;
export function history(db: SqliteDatabase, cardId: string): Retrieval[] {
    return db
        .prepare(
            retrievalSql +
                ' WHERE r.target_card_id=? ORDER BY r.retrieved_at DESC, r.retrieval_id DESC',
        )
        .all(cardId) as Retrieval[];
}
export function detail(
    db: SqliteDatabase,
    retrievalId: string,
    raw: boolean,
): RetrievalDetail | null {
    const retrieval = db
        .prepare(retrievalSql + ' WHERE r.retrieval_id=?')
        .get(retrievalId) as Retrieval | undefined;
    if (!retrieval) return null;
    const document = db
        .prepare('SELECT * FROM external_source_documents WHERE retrieval_id=?')
        .get(retrievalId) as SourceDocument & { retrieval_id?: string };
    delete document.retrieval_id;
    const row = db
        .prepare(
            'SELECT * FROM external_source_candidates WHERE retrieval_id=?',
        )
        .get(retrievalId) as
        | (Omit<StoredCandidate, 'candidate' | 'diagnostics'> & {
              candidate_json: string;
              diagnostics_json: string;
          })
        | undefined;
    const candidate: StoredCandidate | null = row
        ? {
              candidate_id: row.candidate_id,
              retrieval_id: row.retrieval_id,
              candidate_schema_version: row.candidate_schema_version,
              normalizer_version: row.normalizer_version,
              created_at: row.created_at,
              candidate: JSON.parse(row.candidate_json) as Candidate,
              diagnostics: JSON.parse(row.diagnostics_json) as Diagnostic[],
          }
        : null;
    const { raw_payload, ...metadata } = document;
    return {
        retrieval,
        document: raw ? { ...metadata, raw_payload } : metadata,
        candidate,
    };
}
