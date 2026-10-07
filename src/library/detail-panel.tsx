import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Drawer, Input, Modal, Spin, Tag } from 'antd';
import { LibraryHttpError, getLibraryCard, getLibraryEditorMetadata, patchLibraryCard } from './api';
import { EditorForm } from './editor-form';
import {
    buildPatchPayload,
    detailToWorkingForm,
    impactedConfirmedBlocks,
    isWorkingFormDirty,
    type WorkingCardForm,
} from './editor-state';
import {
    cloneLibraryCardDetail,
    getConfirmationState,
    type LibraryCardDetail,
    type LibraryEditorMetadata,
    type SemanticBlock,
} from './model';

type Props = {
    cardId: string | null;
    open: boolean;
    onClose: () => void;
    onSaved: (detail: LibraryCardDetail) => void;
};

export const DetailPanel = ({ cardId, open, onClose, onSaved }: Props) => {
    const [loading, setLoading] = useState(false);
    const [detailError, setDetailError] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [conflict, setConflict] = useState(false);
    const [authoritative, setAuthoritative] = useState<LibraryCardDetail | null>(null);
    const [working, setWorking] = useState<WorkingCardForm | null>(null);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [metadata, setMetadata] = useState<LibraryEditorMetadata | null>(null);
    const [pendingConfirmations, setPendingConfirmations] = useState<SemanticBlock[] | null>(null);
    const [confirmMode, setConfirmMode] = useState<'DRAFT' | 'CONFIRMED'>('DRAFT');
    const [confirmSourceKind, setConfirmSourceKind] = useState('MANUAL');
    const [confirmSourceRef, setConfirmSourceRef] = useState('');
    const [confirmNote, setConfirmNote] = useState('');

    const dirty = useMemo(
        () => Boolean(authoritative && working && isWorkingFormDirty(authoritative, working)),
        [authoritative, working],
    );

    const loadDetail = async (id: string, preserveWorking = false) => {
        setLoading(true);
        setDetailError(null);
        setSaveError(null);
        setConflict(false);
        try {
            const [detail, editorMetadata] = await Promise.all([
                getLibraryCard(id),
                metadata ? Promise.resolve(metadata) : getLibraryEditorMetadata(),
            ]);
            setAuthoritative(detail);
            if (!preserveWorking || !working) {
                setWorking(detailToWorkingForm(detail));
            }
            setMetadata(editorMetadata);
        } catch (error) {
            if (error instanceof LibraryHttpError && error.status === 404) {
                setDetailError('Canonical card not found.');
            } else if (error instanceof LibraryHttpError && error.status === 503) {
                setDetailError('Workspace is not READY.');
            } else {
                setDetailError(error instanceof Error ? error.message : 'Failed to load detail.');
            }
            setAuthoritative(null);
            setWorking(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!open || !cardId) return;
        setEditing(false);
        void loadDetail(cardId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, cardId]);

    const requestClose = () => {
        if (dirty) {
            Modal.confirm({
                title: 'Discard unsaved changes?',
                content: 'Switching away will discard local editor changes.',
                okText: 'Discard',
                onOk: () => {
                    setEditing(false);
                    onClose();
                },
            });
            return;
        }
        setEditing(false);
        onClose();
    };

    const cancelEdit = () => {
        if (!authoritative) return;
        setWorking(detailToWorkingForm(authoritative));
        setEditing(false);
        setSaveError(null);
        setConflict(false);
    };

    const performSave = async (
        confirmations?: Array<{
            block: SemanticBlock;
            state: 'DRAFT' | 'CONFIRMED';
            provenance?: { source_kind: string; source_ref?: string | null; note?: string | null };
        }>,
    ) => {
        if (!authoritative || !working) return;
        setSaving(true);
        setSaveError(null);
        setConflict(false);
        try {
            const payload = buildPatchPayload(authoritative, working, confirmations);
            const updated = await patchLibraryCard(authoritative.card_id, payload);
            setAuthoritative(updated);
            setWorking(detailToWorkingForm(updated));
            setEditing(false);
            setPendingConfirmations(null);
            onSaved(updated);
        } catch (error) {
            if (error instanceof LibraryHttpError && error.code === 'REVISION_CONFLICT') {
                setConflict(true);
                setSaveError(error.message);
                return;
            }
            setSaveError(error instanceof Error ? error.message : 'Save failed.');
        } finally {
            setSaving(false);
        }
    };

    const onSave = () => {
        if (!authoritative || !working) return;
        const impacted = impactedConfirmedBlocks(authoritative, working);
        if (impacted.length > 0) {
            setPendingConfirmations(impacted);
            setConfirmMode('DRAFT');
            setConfirmSourceKind('MANUAL');
            setConfirmSourceRef('');
            setConfirmNote('');
            return;
        }
        void performSave();
    };

    return (
        <Drawer
            title={authoritative ? `Card detail · ${authoritative.family}` : 'Card detail'}
            visible={open}
            width={720}
            onClose={requestClose}
            destroyOnClose
        >
            {loading && <div className="library-state"><Spin tip="Loading detail…" /></div>}
            {!loading && detailError && (
                <Alert type="error" showIcon message="Detail unavailable" description={detailError} />
            )}
            {!loading && authoritative && working && (
                <div className="library-detail">
                    <div className="library-detail__toolbar">
                        <div>
                            <div><strong>card_id</strong>: {authoritative.card_id}</div>
                            <div><strong>revision</strong>: {authoritative.revision}</div>
                        </div>
                        <div className="library-detail__actions">
                            {!editing && (
                                <Button type="primary" onClick={() => setEditing(true)}>Edit</Button>
                            )}
                            {editing && (
                                <>
                                    <Button onClick={cancelEdit} disabled={saving}>Cancel</Button>
                                    <Button type="primary" loading={saving} onClick={onSave} disabled={!dirty}>
                                        Save
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {conflict && (
                        <Alert
                            type="warning"
                            showIcon
                            message="Revision conflict"
                            description="The server version changed. Local edits are preserved. Reload latest to replace the authoritative snapshot."
                            action={(
                                <Button onClick={() => void loadDetail(authoritative.card_id, true)}>
                                    Reload latest
                                </Button>
                            )}
                        />
                    )}
                    {saveError && !conflict && (
                        <Alert type="error" showIcon message="Save failed" description={saveError} />
                    )}

                    {!editing && (
                        <div className="library-detail__readonly">
                            <section>
                                <h3>Identity</h3>
                                <Tag>{authoritative.family}</Tag>
                                <div>Password: {authoritative.password ?? '—'}</div>
                            </section>
                            <section>
                                <h3>Structure</h3>
                                <pre>{JSON.stringify(authoritative.structure, null, 2)}</pre>
                            </section>
                            <section>
                                <h3>Localizations</h3>
                                <pre>{JSON.stringify(authoritative.localizations, null, 2)}</pre>
                            </section>
                            <section>
                                <h3>Confirmations</h3>
                                {(['STRUCTURE', 'TEXT:EN', 'TEXT:ES', 'TEXT:JP', 'CLASSIFICATION', 'RELATIONS'] as SemanticBlock[])
                                    .map(block => (
                                        <Tag key={block}>
                                            {block}: {getConfirmationState(authoritative, block)}
                                        </Tag>
                                    ))}
                            </section>
                            <section>
                                <h3>Classification</h3>
                                <pre>{JSON.stringify(authoritative.classification, null, 2)}</pre>
                            </section>
                            <section>
                                <h3>Relations</h3>
                                <pre>{JSON.stringify(authoritative.relations, null, 2)}</pre>
                            </section>
                            <section>
                                <h3>Provenance</h3>
                                <pre>{JSON.stringify(authoritative.provenance, null, 2)}</pre>
                            </section>
                        </div>
                    )}

                    {editing && (
                        <EditorForm
                            family={authoritative.family}
                            working={working}
                            metadata={metadata}
                            onChange={setWorking}
                        />
                    )}
                </div>
            )}

            <Modal
                title="Confirmed block modification"
                visible={Boolean(pendingConfirmations)}
                onCancel={() => setPendingConfirmations(null)}
                onOk={() => {
                    if (!pendingConfirmations) return;
                    const confirmations = pendingConfirmations.map(block => ({
                        block,
                        state: confirmMode,
                        ...(confirmMode === 'CONFIRMED'
                            ? {
                                provenance: {
                                    source_kind: confirmSourceKind.trim() || 'MANUAL',
                                    source_ref: confirmSourceRef.trim() || null,
                                    note: confirmNote.trim() || null,
                                },
                            }
                            : {}),
                    }));
                    void performSave(confirmations);
                }}
                okText={confirmMode === 'DRAFT' ? 'Move to Draft and Save' : 'Reconfirm and Save'}
                confirmLoading={saving}
            >
                <p>These confirmed blocks are impacted:</p>
                <ul>
                    {(pendingConfirmations ?? []).map(block => <li key={block}>{block}</li>)}
                </ul>
                <div className="library-field-grid">
                    <label>
                        Decision
                        <select
                            value={confirmMode}
                            onChange={event => setConfirmMode(event.target.value as 'DRAFT' | 'CONFIRMED')}
                        >
                            <option value="DRAFT">A. Move block to Draft</option>
                            <option value="CONFIRMED">B. Reconfirm with new provenance</option>
                        </select>
                    </label>
                    {confirmMode === 'CONFIRMED' && (
                        <>
                            <label>
                                source_kind
                                <Input value={confirmSourceKind} onChange={event => setConfirmSourceKind(event.target.value)} />
                            </label>
                            <label>
                                source_ref
                                <Input value={confirmSourceRef} onChange={event => setConfirmSourceRef(event.target.value)} />
                            </label>
                            <label>
                                note
                                <Input value={confirmNote} onChange={event => setConfirmNote(event.target.value)} />
                            </label>
                        </>
                    )}
                </div>
            </Modal>
        </Drawer>
    );
};

export const adoptAuthoritativeDetail = (detail: LibraryCardDetail) => cloneLibraryCardDetail(detail);
