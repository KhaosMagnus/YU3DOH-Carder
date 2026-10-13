import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Checkbox, Input, Modal, Select } from 'antd';
import {
    applyBatchClassification,
    getLibraryEditorMetadata,
    previewBatchClassification,
} from './api';
import type { LibraryEditorMetadata } from './model';
import {
    BATCH_DIMENSIONS,
    BATCH_STATUS_LABELS,
    batchApplyRequest,
    batchCanApply,
    batchFingerprint,
    batchOperationError,
    batchRequest,
    batchRequiredAcknowledgements,
    type BatchOperation,
    type BatchPreview,
    type BatchResult,
    type BatchSelection,
    type SelectedBatchCard,
} from './batch-classification-state';

type Props = {
    open: boolean;
    selection: BatchSelection;
    readEnabled: boolean;
    mutationEnabled: boolean;
    editorDirty: boolean;
    generation: number;
    onClose(): void;
    onBusyChange(busy: boolean): void;
    onApplied(result: BatchResult): Promise<void>;
};
export const BatchClassificationModal = ({
    open,
    selection,
    readEnabled,
    mutationEnabled,
    editorDirty,
    generation,
    onClose,
    onBusyChange,
    onApplied,
}: Props) => {
    const [metadata, setMetadata] = useState<LibraryEditorMetadata | null>(
        null,
    );
    const [operation, setOperation] = useState<BatchOperation>({});
    const [note, setNote] = useState('');
    const [preview, setPreview] = useState<BatchPreview | null>(null);
    const [previewFingerprint, setPreviewFingerprint] = useState<string | null>(
        null,
    );
    const [ack, setAck] = useState(new Set<string>());
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [report, setReport] = useState<BatchResult | null>(null);
    const [reportCards, setReportCards] = useState(
        new Map<string, SelectedBatchCard>(),
    );
    const fingerprint = batchFingerprint(selection, operation, note);
    const current = useRef({ fingerprint, generation });
    current.current = { fingerprint, generation };
    const epoch = useRef(0);
    useEffect(() => {
        epoch.current++;
        setPreview(null);
        setPreviewFingerprint(null);
        setAck(new Set());
        setReport(null);
        setReportCards(new Map());
        setMetadata(null);
    }, [generation]);
    useEffect(() => {
        setAck(new Set());
    }, [fingerprint]);
    useEffect(() => {
        if (!open || !readEnabled) return;
        const controller = new AbortController();
        const owner = epoch.current;
        getLibraryEditorMetadata(controller.signal)
            .then((value) => {
                if (owner === epoch.current) {
                    setMetadata(value);
                    setError(null);
                }
            })
            .catch((e) => {
                if (owner === epoch.current && e.name !== 'AbortError')
                    setError(e.message);
            });
        return () => controller.abort();
    }, [open, readEnabled, generation]);
    const matches = previewFingerprint === fingerprint;
    const operationError = batchOperationError(operation);
    const changeBusy = (value: boolean) => {
        setBusy(value);
        onBusyChange(value);
    };
    const doPreview = async () => {
        if (busy || !readEnabled || !selection.size || operationError) return;
        const owner = { ...current.current };
        const request = batchRequest(selection, operation, note);
        changeBusy(true);
        setError(null);
        setPreview(null);
        setPreviewFingerprint(null);
        setAck(new Set());
        try {
            const value = await previewBatchClassification(request);
            if (
                owner.fingerprint !== current.current.fingerprint ||
                owner.generation !== current.current.generation
            )
                return;
            setPreview(value);
            setPreviewFingerprint(owner.fingerprint);
        } catch (e) {
            if (owner.generation === current.current.generation)
                setError(e instanceof Error ? e.message : 'Preview failed.');
        } finally {
            changeBusy(false);
        }
    };
    const canApply = batchCanApply({
        previewMatches: matches,
        preview,
        ack,
        editorDirty,
        mutationEnabled,
        busy,
    });
    const doApply = async () => {
        if (!canApply || !preview) return;
        const request = batchApplyRequest(
            batchRequest(selection, operation, note),
            preview,
            ack,
        );
        const cards = new Map(selection);
        const owner = current.current.generation;
        changeBusy(true);
        setError(null);
        // A submission consumes the UX preview even if transport fails. Never retry automatically.
        setPreviewFingerprint(null);
        try {
            const value = await applyBatchClassification(request);
            if (owner !== current.current.generation) return;
            setReport(value);
            setReportCards(cards);
            setPreview(null);
            setAck(new Set());
            try {
                await onApplied(value);
            } catch (e) {
                setError(
                    `Batch executed; Library refresh failed: ${e instanceof Error ? e.message : 'Retry refresh explicitly.'}`,
                );
            }
        } catch (e) {
            if (owner === current.current.generation)
                setError(
                    e instanceof Error
                        ? e.message
                        : 'Apply failed. Review authoritative state before retrying.',
                );
        } finally {
            changeBusy(false);
        }
    };
    const registries = {
        archetype: metadata?.archetypes ?? [],
        effect_classifier: metadata?.effect_classifiers ?? [],
        functional_tag: metadata?.functional_tags ?? [],
    };
    const required =
        matches && preview ? batchRequiredAcknowledgements(preview) : [];
    return (
        <Modal
            visible={open}
            title="Batch Classification"
            width={1000}
            zIndex={1100}
            bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
            onCancel={() => {
                if (!busy) onClose();
            }}
            maskClosable={false}
            footer={
                <>
                    <Button disabled={busy} onClick={onClose}>
                        Close
                    </Button>
                    <Button
                        data-testid="batch-preview"
                        loading={busy}
                        disabled={
                            !readEnabled ||
                            !metadata ||
                            !selection.size ||
                            !!operationError ||
                            busy
                        }
                        onClick={() => void doPreview()}
                    >
                        Preview
                    </Button>
                    <Button
                        data-testid="batch-apply"
                        type="primary"
                        disabled={!canApply}
                        onClick={() => void doApply()}
                    >
                        Apply
                    </Button>
                </>
            }
        >
            <div className="library-batch-modal">
                <p>
                    Selected: {selection.size}. Classification only. Each card
                    commits independently; failures do not roll back other
                    successes.
                </p>
                {error && <Alert type="error" message={error} />}
                {editorDirty && (
                    <Alert
                        type="warning"
                        message="Save, cancel, or discard the active Detail edits before applying Batch changes."
                        description="Preview remains available."
                    />
                )}
                {BATCH_DIMENSIONS.map((dimension) => (
                    <fieldset key={dimension}>
                        <legend>{dimension.replace(/_/g, ' ')}</legend>
                        {(['add', 'remove'] as const).map((action) => {
                            const key = `${action}_${dimension}_ids` as const;
                            return (
                                <label key={key}>
                                    {action.toUpperCase()}
                                    <Select
                                        dropdownStyle={{ zIndex: 1200 }}
                                        data-testid={`batch-${key}`}
                                        aria-label={`${action.toUpperCase()} ${dimension}`}
                                        mode="multiple"
                                        disabled={busy || !metadata}
                                        value={operation[key] ?? []}
                                        onChange={(ids: string[]) =>
                                            setOperation((value) => ({
                                                ...value,
                                                [key]: ids,
                                            }))
                                        }
                                        options={registries[dimension].map(
                                            (value) => ({
                                                value: value.id,
                                                label: value.code,
                                            }),
                                        )}
                                    />
                                </label>
                            );
                        })}
                    </fieldset>
                ))}
                <label>
                    Effect Reviewed
                    <Select
                        dropdownStyle={{ zIndex: 1200 }}
                        data-testid="batch-effect-reviewed"
                        aria-label="Batch Effect Reviewed"
                        disabled={busy}
                        value={
                            operation.set_effect_reviewed === undefined
                                ? 'unchanged'
                                : String(operation.set_effect_reviewed)
                        }
                        onChange={(value: string) =>
                            setOperation((old) => {
                                const next = { ...old };
                                if (value === 'unchanged')
                                    delete next.set_effect_reviewed;
                                else
                                    next.set_effect_reviewed = value === 'true';
                                return next;
                            })
                        }
                        options={[
                            { value: 'unchanged', label: 'Unchanged' },
                            { value: 'true', label: 'True' },
                            { value: 'false', label: 'False' },
                        ]}
                    />
                </label>
                <label>
                    Shared provenance note
                    <Input.TextArea
                        data-testid="batch-note"
                        disabled={busy}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                </label>
                {operationError && (
                    <Alert type="info" message={operationError} />
                )}
                {preview && !matches && (
                    <Alert
                        type="warning"
                        message="Selection, operation, or note changed. Request a new Preview before Apply."
                    />
                )}
                {preview && matches && (
                    <section data-testid="batch-preview-results">
                        <h3>Preview</h3>
                        <p>
                            Selected: {preview.summary.selected} · Would change:{' '}
                            {preview.summary.would_change} · Acknowledgement
                            required: {preview.summary.confirmed_requires_ack} ·
                            No-op: {preview.summary.no_op} · Conflicts:{' '}
                            {preview.summary.revision_conflict} · Validation
                            failures: {preview.summary.domain_validation} · Not
                            found: {preview.summary.not_found}
                        </p>
                        {preview.results.map((row) => (
                            <div
                                className="library-batch-result"
                                key={row.card_id}
                                data-card-id={row.card_id}
                            >
                                <strong>
                                    {selection.get(row.card_id)?.display_name ??
                                        row.card_id}
                                </strong>
                                <span>{BATCH_STATUS_LABELS[row.status]}</span>
                                <span>
                                    Expected revision: {row.expected_revision} ·
                                    Observed:{' '}
                                    {row.observed_revision ?? 'absent'}
                                </span>
                                {row.message && (
                                    <span>
                                        {row.error_code}: {row.message}
                                    </span>
                                )}
                                {row.status === 'CONFIRMED_REQUIRES_ACK' && (
                                    <Checkbox
                                        checked={ack.has(row.card_id)}
                                        disabled={busy}
                                        onChange={(e) =>
                                            setAck((old) => {
                                                const next = new Set(old);
                                                if (e.target.checked)
                                                    next.add(row.card_id);
                                                else next.delete(row.card_id);
                                                return next;
                                            })
                                        }
                                    >
                                        Acknowledge{' '}
                                        {selection.get(row.card_id)
                                            ?.display_name ?? row.card_id}
                                        : CLASSIFICATION → DRAFT
                                    </Checkbox>
                                )}
                            </div>
                        ))}
                        {!!required.length && (
                            <Button
                                disabled={busy}
                                onClick={() => setAck(new Set(required))}
                            >
                                Acknowledge all listed
                            </Button>
                        )}
                    </section>
                )}
                {report && (
                    <section data-testid="batch-apply-results">
                        <h3>Batch result</h3>
                        <p>Operation: {report.batch_operation_id}</p>
                        <p>
                            Selected: {report.summary.selected} · Changed:{' '}
                            {report.summary.success} · No-op:{' '}
                            {report.summary.no_op} · Conflicts:{' '}
                            {report.summary.revision_conflict} · Validation
                            failures: {report.summary.domain_validation} ·
                            Acknowledgement required:{' '}
                            {report.summary.confirmed_block_ack_required} ·
                            Acknowledgement stale/state changed:{' '}
                            {report.summary.confirmed_block_state_changed} · Not
                            found: {report.summary.not_found}
                        </p>
                        {report.results.map((row) => (
                            <div
                                className="library-batch-result"
                                key={row.card_id}
                            >
                                <strong>
                                    {reportCards.get(row.card_id)
                                        ?.display_name ?? row.card_id}
                                </strong>
                                <span>
                                    {BATCH_STATUS_LABELS[row.status]}
                                    {row.moved_to_draft
                                        ? ' · CLASSIFICATION moved to DRAFT'
                                        : ''}
                                </span>
                                <span>
                                    Expected revision: {row.expected_revision} ·
                                    Observed:{' '}
                                    {row.previous_revision ?? 'absent'} ·
                                    Result: {row.revision ?? 'absent'}
                                </span>
                                {row.message && (
                                    <span>
                                        {row.error_code}: {row.message}
                                    </span>
                                )}
                            </div>
                        ))}
                        <Alert
                            type="info"
                            message="Review results. To retry, refresh Library, explicitly reselect cards, and request a new Preview."
                        />
                    </section>
                )}
            </div>
        </Modal>
    );
};
