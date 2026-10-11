import { useEffect, useState } from 'react';
import { Alert, Button, Input, Modal, Spin } from 'antd';
import { ConfirmationController } from './confirmation-state';
import type { LibraryCardDetail, SemanticBlock } from './model';
export const ConfirmationModal = ({
    detail,
    block,
    onClose,
    onAdopt,
    enabled = true,
}: {
    detail: LibraryCardDetail;
    block: SemanticBlock;
    onClose: () => void;
    onAdopt: (d: LibraryCardDetail) => void;
    enabled?: boolean;
}) => {
    const [controller] = useState(() => new ConfirmationController(detail, block));
    const [v, setView] = useState(controller.view);
    controller.onAdopt = onAdopt;
    useEffect(() => {
        const un = controller.subscribe(setView);
        if(enabled)void controller.review();
        return un;
    }, [controller]);
    const data =
        block === 'STRUCTURE'
            ? {
                  family: v.detail.family,
                  password: v.detail.password,
                  structure: v.detail.structure,
              }
            : block.startsWith('TEXT:')
              ? (v.detail.localizations.find((l) => l.language === block.slice(5)) ??
                'No persisted localization exists.')
              : block === 'CLASSIFICATION'
                ? v.detail.classification
                : v.detail.relations;
    const busy = controller.busy();
    const valid = v.review?.confirmable && v.review.validation.status === 'PASS';
    return (
        <Modal
            title={`Review / Confirm — ${block}`}
            visible
            width={720}
            maskClosable={false}
            closable={!busy}
            onCancel={() => {
                if (!busy) onClose();
            }}
            footer={[
                <Button key="cancel" disabled={busy} onClick={onClose}>
                    Cancel
                </Button>,
                <Button
                    key="review"
                    disabled={!enabled || busy || v.phase === 'SUCCESS'}
                    onClick={() => {if(enabled)void controller.review();}}
                >
                    Review again
                </Button>,
                <Button
                    key="confirm"
                    type="primary"
                    loading={v.phase === 'CONFIRMING'}
                    disabled={!enabled || !controller.canConfirm()}
                    onClick={() => {if(enabled)void controller.confirm();}}
                >
                    Confirm block
                </Button>,
            ]}
        >
            <p>
                Block: {block} · Revision: {v.detail.revision} · State:{' '}
                {v.detail.confirmations.find((c) => c.block === block)?.state ?? 'DRAFT'}
            </p>
            <h3>Persisted block values</h3>
            <pre>{JSON.stringify(data, null, 2)}</pre>
            {busy && <Spin tip="Waiting for Workspace Service…" />}
            {v.review && (
                <Alert
                    type={v.review.validation.status === 'PASS' ? 'success' : 'error'}
                    message={`Validation: ${v.review.validation.status}`}
                    description={v.review.validation.message}
                />
            )}
            {v.error && <Alert type="error" message={v.error} />}
            {v.phase === 'STALE' && (
                <Alert
                    type="warning"
                    message="Card changed since Review. Authoritative detail refreshed; Review again before confirming. No operation was replayed."
                />
            )}
            {v.phase === 'SUCCESS' && (
                <Alert
                    type="success"
                    message="Block confirmed. Authoritative detail and provenance adopted."
                />
            )}
            <fieldset disabled={!valid || busy || v.phase === 'SUCCESS'}>
                <label>
                    Confirmation source kind
                    <Input
                        value={v.sourceKind}
                        onChange={(e) => controller.provenance(e.target.value, v.sourceRef, v.note)}
                    />
                </label>
                <label>
                    Confirmation source reference (optional)
                    <Input
                        value={v.sourceRef}
                        onChange={(e) =>
                            controller.provenance(v.sourceKind, e.target.value, v.note)
                        }
                    />
                </label>
                <label>
                    Confirmation note (optional)
                    <Input.TextArea
                        value={v.note}
                        onChange={(e) =>
                            controller.provenance(v.sourceKind, v.sourceRef, e.target.value)
                        }
                    />
                </label>
            </fieldset>
        </Modal>
    );
};
