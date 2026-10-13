import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Input, Spin, Tag } from 'antd';
import type { LibraryCardDetail } from './model';
import type {
    ExternalHistory,
    ExternalDetail,
    ExternalDiff,
} from './external-source-model';
import { claimText, validExternalCardId } from './external-source-model';
import {
    getExternalSourceHistory,
    getExternalSourceRetrieval,
    retrieveExternalSource,
    compareExternalSource,
} from './api';

/** Every network fetch is an explicit button action. Inspection fetches only local persisted evidence. */
export function ExternalSourcesPanel({
    detail,
    dirty,
    enabled,
}: {
    detail: LibraryCardDetail;
    dirty: boolean;
    enabled: boolean;
}) {
    const [history, setHistory] = useState<ExternalHistory | null>(null);
    const [snapshot, setSnapshot] = useState<ExternalDetail | null>(null);
    const [diff, setDiff] = useState<ExternalDiff | null>(null);
    const [id, setId] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const version = useRef(0);
    const message = (e: unknown) =>
        e instanceof Error ? e.message : 'External Source operation failed.';
    const load = async () => {
        const result = await getExternalSourceHistory(detail.card_id);
        setHistory(result);
        return result;
    };
    useEffect(() => {
        const ticket = ++version.current;
        setHistory(null);
        setSnapshot(null);
        setDiff(null);
        setError(null);
        getExternalSourceHistory(detail.card_id)
            .then((result) => {
                if (ticket === version.current) setHistory(result);
            })
            .catch((e) => {
                if (ticket === version.current) setError(message(e));
            });
        return () => {
            version.current++;
        };
    }, [detail.card_id]);
    useEffect(() => {
        setDiff(null);
    }, [detail.revision]);
    const run = async (operation: () => Promise<void>) => {
        setBusy(true);
        setError(null);
        try {
            await operation();
        } catch (e) {
            setError(message(e));
        } finally {
            setBusy(false);
        }
    };
    const fetchSource = () =>
        run(async () => {
            setSnapshot(null);
            setDiff(null);
            try {
                setSnapshot(
                    await retrieveExternalSource({
                        target_card_id: detail.card_id,
                        target_expected_revision: detail.revision,
                        external_card_id: id,
                    }),
                );
            } finally {
                await load();
            }
        });
    const openStored = (retrievalId: string) =>
        run(async () => {
            setDiff(null);
            const stored = await getExternalSourceRetrieval(retrievalId);
            setSnapshot(stored);
            setId(stored.retrieval.external_record_key);
        });
    const hasStored = Boolean(
        history?.retrievals.some((row) => row.external_record_key === id),
    );
    return (
        <section
            className="library-external-sources"
            aria-label="External Sources"
        >
            <h2>External Sources</h2>
            <p>
                YGOResources Card Database · Non-authoritative snapshots ·
                Read-only comparison
            </p>
            {dirty && (
                <Alert
                    type="info"
                    message="External Source comparison uses persisted Workspace data. Unsaved Canonical edits are not included."
                />
            )}
            {history && !history.source.enabled && (
                <Alert
                    type="info"
                    message="YGOResources retrieval is disabled in Workspace Service configuration. Stored evidence remains available."
                />
            )}
            {error && (
                <Alert
                    type="error"
                    message="External Sources unavailable"
                    description={error}
                />
            )}
            <div className="library-external-sources__retrieve">
                <label>
                    External card ID
                    <Input
                        aria-label="External card ID"
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                        maxLength={20}
                    />
                </label>
                <Button
                    disabled={
                        !enabled ||
                        !history?.source.enabled ||
                        !validExternalCardId(id) ||
                        busy
                    }
                    loading={busy}
                    onClick={() => void fetchSource()}
                >
                    {hasStored ? 'Re-retrieve' : 'Retrieve'}
                </Button>
            </div>
            {busy && <Spin />}
            <h3>Stored retrievals</h3>
            {history?.retrievals.length === 0 && (
                <p>No stored retrievals for this card.</p>
            )}
            {(history?.retrievals ?? []).map((row) => (
                <div
                    key={row.retrieval_id}
                    className="library-external-sources__history"
                >
                    <Tag>{row.status}</Tag>
                    <span>
                        {row.external_record_key} · {row.retrieved_at}
                    </span>
                    {row.error_code && <span>{row.error_code}</span>}
                    <Button
                        disabled={busy}
                        onClick={() => void openStored(row.retrieval_id)}
                    >
                        Open stored retrieval
                    </Button>
                </div>
            ))}
            {snapshot && (
                <article data-retrieval-id={snapshot.retrieval.retrieval_id}>
                    <h3>Snapshot summary</h3>
                    <p>
                        {snapshot.retrieval.status} · ID{' '}
                        {snapshot.retrieval.external_record_key} · frozen
                        Canonical revision{' '}
                        {snapshot.retrieval.target_expected_revision}
                    </p>
                    <h4>Raw evidence metadata</h4>
                    <pre>
                        {JSON.stringify(
                            snapshot.document.raw_payload === undefined
                                ? snapshot.document
                                : {
                                      ...snapshot.document,
                                      raw_payload: undefined,
                                  },
                            null,
                            2,
                        )}
                    </pre>
                    <Button
                        disabled={busy}
                        onClick={() =>
                            void run(async () =>
                                setSnapshot(
                                    await getExternalSourceRetrieval(
                                        snapshot.retrieval.retrieval_id,
                                        true,
                                    ),
                                ),
                            )
                        }
                    >
                        Review raw evidence
                    </Button>
                    {snapshot.document.raw_payload !== undefined && (
                        <pre className="library-external-sources__raw">
                            {snapshot.document.raw_payload ??
                                'No raw payload available.'}
                        </pre>
                    )}
                    {snapshot.candidate && (
                        <>
                            <h3>Candidate · Non-authoritative</h3>
                            <p>
                                Candidate schema{' '}
                                {snapshot.candidate.candidate_schema_version} ·
                                normalizer{' '}
                                {snapshot.candidate.normalizer_version} ·
                                adapter {snapshot.retrieval.adapter_version}
                            </p>
                            <h4>Locale availability</h4>
                            {['EN', 'ES', 'JP'].map((locale) => {
                                const fields =
                                    snapshot.candidate!.candidate.blocks[
                                        `TEXT:${locale}`
                                    ]?.fields;
                                return (
                                    <Tag key={locale}>
                                        {locale}:{' '}
                                        {fields?.name?.state === 'PRESENT' &&
                                        fields?.card_text?.state === 'PRESENT'
                                            ? 'Usable'
                                            : 'Unavailable / partial'}
                                    </Tag>
                                );
                            })}
                            {Object.entries(
                                snapshot.candidate.candidate.blocks,
                            ).map(([block, { fields }]) => (
                                <section key={block}>
                                    <h4>{block}</h4>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Field</th>
                                                <th>State</th>
                                                <th>Source value</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(fields).map(
                                                ([field, claim]) => (
                                                    <tr key={field}>
                                                        <td>{field}</td>
                                                        <td>{claim.state}</td>
                                                        <td>
                                                            {claimText(claim)}
                                                            <details>
                                                                <summary>
                                                                    Evidence
                                                                </summary>
                                                                <pre>
                                                                    {JSON.stringify(
                                                                        claim,
                                                                        null,
                                                                        2,
                                                                    )}
                                                                </pre>
                                                            </details>
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                </section>
                            ))}
                            <h4>Diagnostics</h4>
                            {snapshot.candidate.diagnostics.length === 0 ? (
                                <p>No diagnostics.</p>
                            ) : (
                                snapshot.candidate.diagnostics.map((d) => (
                                    <p key={d.diagnostic_id}>
                                        {d.severity} · {d.stage} · {d.code} ·{' '}
                                        {d.block} / {d.field} · {d.message}
                                    </p>
                                ))
                            )}
                            <Button
                                disabled={busy}
                                onClick={() =>
                                    void run(async () =>
                                        setDiff(
                                            await compareExternalSource(
                                                snapshot.candidate!
                                                    .candidate_id,
                                                {
                                                    target_card_id:
                                                        detail.card_id,
                                                    target_expected_revision:
                                                        detail.revision,
                                                },
                                            ),
                                        ),
                                    )
                                }
                            >
                                Compare with this card
                            </Button>
                        </>
                    )}
                </article>
            )}
            {diff && (
                <div className="library-external-sources__diff">
                    <h3>
                        Read-only diff · persisted Canonical revision{' '}
                        {diff.target_expected_revision}
                    </h3>
                    {diff.groups.map((group) => (
                        <section key={group.block}>
                            <h4>{group.block}</h4>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Field</th>
                                        <th>Status</th>
                                        <th>Source</th>
                                        <th>Canonical</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {group.fields.map((field) => (
                                        <tr key={field.field}>
                                            <td>{field.field}</td>
                                            <td>{field.status}</td>
                                            <td>{claimText(field.source)}</td>
                                            <td>
                                                {JSON.stringify(
                                                    field.canonical_value,
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </section>
                    ))}
                </div>
            )}
        </section>
    );
}
