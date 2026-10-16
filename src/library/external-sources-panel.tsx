import { ExternalStructureAcceptancePanel } from './external-structure-acceptance-panel';
import {
    externalTextSelectable,
    externalApplyReview,
    selectionKey,
    type ExternalTextSelection,
} from './external-acceptance-state';
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
    applyExternalSourceText,
    LibraryHttpError,
} from './api';

/** Every network fetch is an explicit button action. Inspection fetches only local persisted evidence. */
export function ExternalSourcesPanel({
    detail,
    dirty,
    enabled,
    onRefresh,
    onApplyingChange,
}: {
    detail: LibraryCardDetail;
    dirty: boolean;
    enabled: boolean;
    onRefresh?: (cardId: string) => Promise<void>;
    onApplyingChange?: (busy: boolean) => void;
}) {
    const [history, setHistory] = useState<ExternalHistory | null>(null);
    const [snapshot, setSnapshot] = useState<ExternalDetail | null>(null);
    const [diff, setDiff] = useState<ExternalDiff | null>(null);
    const [id, setId] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<ExternalTextSelection[]>([]);
    const [reviewOpen, setReviewOpen] = useState(false);
    const [ack, setAck] = useState<string[]>([]);
    const [note, setNote] = useState('');
    const [forcedStale, setForcedStale] = useState(false);
    const [applyMessage, setApplyMessage] = useState<string | null>(null);
    const version = useRef(0);
    const resetApply = () => {
        setSelected([]);
        setReviewOpen(false);
        setAck([]);
        setNote('');
        setForcedStale(false);
        setApplyMessage(null);
    };
    const stale =
        forcedStale ||
        (!!snapshot &&
            (snapshot.retrieval.target_card_id !== detail.card_id ||
                snapshot.retrieval.target_expected_revision !==
                    detail.revision));
    const review = snapshot
        ? externalApplyReview(detail, snapshot, selected)
        : null;
    const candidateCompatible =
        !!snapshot?.candidate &&
        snapshot.candidate.candidate_schema_version === 1 &&
        snapshot.candidate.candidate.candidate_schema_version === 1 &&
        snapshot.candidate.candidate.authoritative === false &&
        ['SUCCESS', 'PARTIAL'].includes(snapshot.retrieval.status);

    const message = (e: unknown) =>
        e instanceof Error ? e.message : 'External Source operation failed.';
    const load = async () => {
        const result = await getExternalSourceHistory(detail.card_id);
        setHistory(result);
        return result;
    };
    useEffect(() => {
        const ticket = ++version.current;
        resetApply();
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
        setReviewOpen(false);
        setAck([]);
        setSelected([]);
    }, [detail.revision]);
    const run = async (operation: () => Promise<void>) => {
        const ticket = version.current;
        setBusy(true);
        setError(null);
        try {
            await operation();
        } catch (e) {
            if (ticket !== version.current) return;
            setError(message(e));
            if (
                e instanceof LibraryHttpError &&
                e.code === 'REVISION_CONFLICT'
            ) {
                setReviewOpen(false);
                setSelected([]);
                setAck([]);
                setDiff(null);
                setForcedStale(true);
                if (onRefresh && !dirty) {
                    try {
                        await onRefresh(detail.card_id);
                    } catch {
                        /* Keep stale and preserve the original conflict. */
                    }
                }
            }
        } finally {
            if (ticket === version.current) setBusy(false);
        }
    };
    const fetchSource = () =>
        run(async () => {
            resetApply();
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
            resetApply();
            setDiff(null);
            const stored = await getExternalSourceRetrieval(retrievalId);
            setSnapshot(stored);
            setId(stored.retrieval.external_record_key);
        });
    const applyText = () =>
        run(async () => {
            if (
                !snapshot?.candidate ||
                !review ||
                !review.rows.length ||
                dirty ||
                stale ||
                !enabled ||
                !onRefresh
            )
                return;
            const ticket = version.current;
            onApplyingChange?.(true);
            try {
                const result = await applyExternalSourceText(
                    snapshot.candidate.candidate_id,
                    {
                        target_card_id: detail.card_id,
                        target_expected_revision:
                            snapshot.retrieval.target_expected_revision,
                        selected_fields: review.rows.map(
                            ({ block, field }) => ({ block, field }),
                        ),
                        acknowledge_move_to_draft_blocks:
                            review.requiredAck.filter((b) => ack.includes(b)),
                        note,
                    },
                );
                if (ticket !== version.current) return;
                setReviewOpen(false);
                setAck([]);
                if (!result.changed) {
                    setApplyMessage('No Canonical values changed.');
                    return;
                }
                setSelected([]);
                setDiff(null);
                setForcedStale(true);
                setApplyMessage(
                    `Applied revision ${result.revision}. Changed blocks: ${result.changed_blocks.join(', ')}. Moved to DRAFT: ${result.moved_to_draft.join(', ') || 'none'}.`,
                );
                await onRefresh(result.card_id);
            } catch (e) {
                if (ticket !== version.current) return;
                throw e;
            } finally {
                onApplyingChange?.(false);
            }
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
            {dirty && (
                <Alert
                    type="info"
                    message="Save, cancel, or discard Canonical editor changes before applying External Source text."
                />
            )}
            {stale && (
                <Alert
                    type="warning"
                    message="This candidate is stale relative to current Canonical. Stored evidence remains inspectable."
                />
            )}
            {applyMessage && <Alert type="success" message={applyMessage} />}
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
                                                <th>Selection</th>
                                                <th>Field</th>
                                                <th>State</th>
                                                <th>Source value</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(fields).map(
                                                ([field, claim]) => (
                                                    <tr key={field}>
                                                        <td>
                                                            {block.startsWith(
                                                                'TEXT:',
                                                            ) && (
                                                                <input
                                                                    type="checkbox"
                                                                    aria-label={`Select ${block}/${field}`}
                                                                    checked={selected.some(
                                                                        (s) =>
                                                                            selectionKey(
                                                                                s,
                                                                            ) ===
                                                                            `${block}/${field}`,
                                                                    )}
                                                                    disabled={
                                                                        busy ||
                                                                        dirty ||
                                                                        !enabled ||
                                                                        stale ||
                                                                        !candidateCompatible ||
                                                                        !externalTextSelectable(
                                                                            detail,
                                                                            block,
                                                                            field,
                                                                            claim,
                                                                        )
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) => {
                                                                        const next =
                                                                            {
                                                                                block,
                                                                                field,
                                                                            } as ExternalTextSelection;
                                                                        setReviewOpen(
                                                                            false,
                                                                        );
                                                                        setAck(
                                                                            [],
                                                                        );
                                                                        setSelected(
                                                                            (
                                                                                current,
                                                                            ) =>
                                                                                e
                                                                                    .target
                                                                                    .checked
                                                                                    ? [
                                                                                          ...current,
                                                                                          next,
                                                                                      ]
                                                                                    : current.filter(
                                                                                          (
                                                                                              s,
                                                                                          ) =>
                                                                                              selectionKey(
                                                                                                  s,
                                                                                              ) !==
                                                                                              selectionKey(
                                                                                                  next,
                                                                                              ),
                                                                                      ),
                                                                        );
                                                                    }}
                                                                />
                                                            )}
                                                        </td>
                                                        <td>{field}</td>
                                                        <td>{claim.state}</td>
                                                        <td>
                                                            {claim.state ===
                                                                'PRESENT' &&
                                                            claim.value === ''
                                                                ? 'Empty string ("")'
                                                                : claimText(
                                                                      claim,
                                                                  )}
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
                            <Button
                                disabled={
                                    busy ||
                                    dirty ||
                                    !enabled ||
                                    stale ||
                                    !onRefresh ||
                                    !selected.length ||
                                    !candidateCompatible
                                }
                                onClick={() => {
                                    setReviewOpen(true);
                                    setAck([]);
                                }}
                            >
                                Review selected text
                            </Button>
                            {reviewOpen && review && (
                                <section
                                    className="library-external-sources__apply-review"
                                    aria-label="Apply text review"
                                >
                                    <h3>Apply text review</h3>
                                    <p>
                                        Candidate{' '}
                                        {snapshot.candidate.candidate_id} ·
                                        source{' '}
                                        {snapshot.retrieval.external_record_key}{' '}
                                        · frozen revision{' '}
                                        {
                                            snapshot.retrieval
                                                .target_expected_revision
                                        }{' '}
                                        · current persisted revision{' '}
                                        {detail.revision}
                                    </p>
                                    <Alert
                                        type="warning"
                                        message="A successful Apply advances the card revision. Select every text field from this candidate that you want to accept in this operation."
                                    />
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Block / field</th>
                                                <th>Source</th>
                                                <th>Current Canonical</th>
                                                <th>State</th>
                                                <th>Impact</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {review.rows.map((row) => (
                                                <tr key={selectionKey(row)}>
                                                    <td>{selectionKey(row)}</td>
                                                    <td>
                                                        {row.source === ''
                                                            ? 'Empty string ("")'
                                                            : JSON.stringify(
                                                                  row.source,
                                                              )}
                                                    </td>
                                                    <td>
                                                        {JSON.stringify(
                                                            row.current,
                                                        )}
                                                    </td>
                                                    <td>{row.state}</td>
                                                    <td>
                                                        {row.changed
                                                            ? 'CHANGE'
                                                            : 'NO_OP'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {review.requiredAck.map((block) => (
                                        <label key={block}>
                                            <input
                                                type="checkbox"
                                                aria-label={`Move ${block} to DRAFT`}
                                                checked={ack.includes(block)}
                                                onChange={(e) =>
                                                    setAck((a) =>
                                                        e.target.checked
                                                            ? [...a, block]
                                                            : a.filter(
                                                                  (b) =>
                                                                      b !==
                                                                      block,
                                                              ),
                                                    )
                                                }
                                            />
                                            Move {block} to DRAFT
                                        </label>
                                    ))}
                                    <label>
                                        Provenance note
                                        <Input
                                            aria-label="Provenance note"
                                            value={note}
                                            onChange={(e) =>
                                                setNote(e.target.value)
                                            }
                                        />
                                    </label>
                                    <Button
                                        disabled={
                                            busy ||
                                            dirty ||
                                            !enabled ||
                                            stale ||
                                            review.rows.some(
                                                (r) => !r.eligible,
                                            ) ||
                                            review.requiredAck.some(
                                                (b) => !ack.includes(b),
                                            )
                                        }
                                        onClick={() => void applyText()}
                                    >
                                        Apply text
                                    </Button>
                                    <Button
                                        disabled={busy}
                                        onClick={() => setReviewOpen(false)}
                                    >
                                        Cancel Apply review
                                    </Button>
                                </section>
                            )}
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
            {snapshot?.candidate && (
                <ExternalStructureAcceptancePanel
                    detail={detail}
                    snapshot={snapshot}
                    dirty={dirty}
                    enabled={enabled}
                    busy={busy}
                    onBusy={(value) => {
                        setBusy(value);
                        onApplyingChange?.(value);
                    }}
                    onRefresh={onRefresh}
                    onChanged={async () => {
                        setDiff(null);
                        setSelected([]);
                        setReviewOpen(false);
                        setAck([]);
                        setForcedStale(true);
                        const ticket = version.current;
                        const value = await getExternalSourceHistory(
                            detail.card_id,
                        );
                        if (ticket === version.current) setHistory(value);
                    }}
                />
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
