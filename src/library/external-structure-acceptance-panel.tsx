import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Input, Spin } from 'antd';
import type { LibraryCardDetail } from './model';
import type { ExternalDetail } from './external-source-model';
import {
    LibraryHttpError,
    previewExternalStructure,
    applyExternalStructure,
} from './api';
import {
    STRUCTURE_PERSISTED_WARNING,
    STRUCTURE_STALE_WARNING,
    structureReviewRows,
    structureApplyAllowed,
    type StructurePreview,
} from './external-structure-acceptance-state';
const text = (v: unknown) => (v === undefined ? '—' : JSON.stringify(v));
export function ExternalStructureAcceptancePanel({
    detail,
    snapshot,
    dirty,
    enabled,
    busy,
    onBusy,
    onRefresh,
    onChanged,
}: {
    detail: LibraryCardDetail;
    snapshot: ExternalDetail;
    dirty: boolean;
    enabled: boolean;
    busy: boolean;
    onBusy: (value: boolean) => void;
    onRefresh?: (id: string) => Promise<void>;
    onChanged: () => Promise<void>;
}) {
    const [preview, setPreview] = useState<StructurePreview | null>(null),
        [ack, setAck] = useState(false),
        [note, setNote] = useState(''),
        [error, setError] = useState<string | null>(null),
        [receipt, setReceipt] = useState<string | null>(null);
    const owner = useRef('');
    const key = detail.card_id + '/' + snapshot.candidate?.candidate_id;
    owner.current = key;
    useEffect(() => {
        setPreview(null);
        setAck(false);
        setNote('');
        setError(null);
        setReceipt(null);
    }, [key]);
    useEffect(() => {
        setPreview(null);
        setAck(false);
    }, [detail.revision]);
    const request = () => ({
        target_card_id: detail.card_id,
        target_expected_revision: snapshot.retrieval.target_expected_revision,
    });
    const run = async (apply: boolean) => {
        if (
            !snapshot.candidate ||
            busy ||
            !enabled ||
            (apply &&
                (!onRefresh ||
                    !structureApplyAllowed(preview, dirty, enabled, busy, ack)))
        )
            return;
        const ticket = key;
        onBusy(true);
        setError(null);
        try {
            if (!apply) {
                const value = await previewExternalStructure(
                    snapshot.candidate.candidate_id,
                    request(),
                );
                if (owner.current === ticket) {
                    setPreview(value);
                    setAck(false);
                    setReceipt(null);
                }
                return;
            }
            const value = await applyExternalStructure(
                snapshot.candidate.candidate_id,
                {
                    ...request(),
                    acknowledge_move_to_draft:
                        preview!.acknowledgement_required && ack,
                    note,
                },
            );
            if (owner.current !== ticket) return;
            setPreview(null);
            setAck(false);
            if (!value.changed) {
                setReceipt('No Canonical structural changes.');
                return;
            }
            setReceipt(
                `Applied STRUCTURE revision ${value.revision}. STRUCTURE is DRAFT${value.moved_to_draft ? ' (moved to DRAFT)' : ''}. Candidate is stale.`,
            );
            await Promise.all([onChanged(), onRefresh!(value.card_id)]);
        } catch (e) {
            if (owner.current !== ticket) return;
            setAck(false);
            const message =
                e instanceof Error ? e.message : 'STRUCTURE operation failed.';
            setError(
                (e instanceof LibraryHttpError ? e.code + ': ' : '') +
                    message +
                    (e instanceof LibraryHttpError && e.blockingBlocks.length
                        ? ' Blocking blocks: ' + e.blockingBlocks.join(', ')
                        : '') +
                    (e instanceof LibraryHttpError && e.reasonCodes.length
                        ? ' Reasons: ' + e.reasonCodes.join(', ')
                        : ''),
            );
            if (e instanceof LibraryHttpError && e.status === 409)
                setPreview(null);
            if (
                e instanceof LibraryHttpError &&
                e.code === 'REVISION_CONFLICT'
            ) {
                await Promise.all([
                    onChanged(),
                    ...(!dirty && onRefresh ? [onRefresh(detail.card_id)] : []),
                ]);
            }
        } finally {
            if (owner.current === ticket) onBusy(false);
        }
    };
    return (
        <section
            className="library-external-structure"
            aria-label="Complete STRUCTURE acceptance"
        >
            <h3>Complete STRUCTURE acceptance</h3>
            <Alert
                type={dirty ? 'warning' : 'info'}
                message={STRUCTURE_PERSISTED_WARNING}
                showIcon
            />
            {dirty && (
                <p>
                    Apply is disabled while the Canonical editor has unsaved
                    changes.
                </p>
            )}
            <p>{STRUCTURE_STALE_WARNING}</p>
            {error && <Alert type="error" message={error} showIcon />}
            {receipt && <Alert type="success" message={receipt} showIcon />}
            <Button
                disabled={busy || !enabled || !snapshot.candidate}
                onClick={() => void run(false)}
            >
                Preview complete STRUCTURE
            </Button>
            {busy && <Spin />}
            {preview && (
                <div className="library-external-structure__review">
                    <h4>STRUCTURE Preview · {preview.decision}</h4>
                    <p>
                        normalizer {preview.normalizer_version} · frozen
                        candidate revision {preview.target_expected_revision} ·
                        current Canonical revision{' '}
                        {preview.current_revision ?? 'unavailable'} · STRUCTURE{' '}
                        {preview.structure_confirmation_state}
                    </p>
                    <p>
                        Acknowledgement required:{' '}
                        {preview.acknowledgement_required ? 'yes' : 'no'}
                    </p>
                    {preview.reason_codes.length > 0 && (
                        <Alert
                            type="warning"
                            message={preview.reason_codes.join(', ')}
                        />
                    )}
                    {preview.blocking_confirmed_blocks.length > 0 && (
                        <Alert
                            type="error"
                            message={
                                'Blocking confirmed blocks: ' +
                                preview.blocking_confirmed_blocks.join(', ')
                            }
                        />
                    )}
                    {preview.decision === 'NO_OP' && (
                        <p>No Canonical structural changes.</p>
                    )}
                    <h4>Current Canonical</h4>
                    <pre>
                        {JSON.stringify(preview.current_structure, null, 2)}
                    </pre>
                    <h4>Source Candidate</h4>
                    <pre>
                        {JSON.stringify(preview.source_structure, null, 2)}
                    </pre>
                    <h4>Resulting Structure</h4>
                    <pre>
                        {JSON.stringify(preview.resulting_structure, null, 2)}
                    </pre>
                    <table>
                        <thead>
                            <tr>
                                <th>Field</th>
                                <th>Kind</th>
                                <th>Current Canonical</th>
                                <th>Source Candidate</th>
                                <th>Resulting Structure</th>
                                <th>Trigger</th>
                            </tr>
                        </thead>
                        <tbody>
                            {structureReviewRows(preview).map((r, i) => (
                                <tr key={r.kind + '/' + r.field + '/' + i}>
                                    <td>{r.field}</td>
                                    <td>{r.kind}</td>
                                    <td>{text(r.current)}</td>
                                    <td>{text(r.source)}</td>
                                    <td>{text(r.result)}</td>
                                    <td>{r.trigger ?? '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {preview.acknowledgement_required && (
                        <label>
                            <input
                                type="checkbox"
                                checked={ack}
                                disabled={busy}
                                onChange={(e) => setAck(e.target.checked)}
                            />
                            I understand STRUCTURE will move to DRAFT.
                        </label>
                    )}
                    <label>
                        STRUCTURE provenance note
                        <Input.TextArea
                            value={note}
                            disabled={busy}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </label>
                    <Button
                        disabled={
                            !onRefresh ||
                            !structureApplyAllowed(
                                preview,
                                dirty,
                                enabled,
                                busy,
                                ack,
                            )
                        }
                        onClick={() => void run(true)}
                    >
                        Apply complete STRUCTURE
                    </Button>
                </div>
            )}
        </section>
    );
}
