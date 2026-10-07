import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Drawer, Input, Modal, Spin, Tag } from 'antd';
import { LibraryHttpError, getLibraryCard, getLibraryEditorMetadata, patchLibraryCard } from './api';
import {
    formatDetailLoadError,
    formatMetadataLoadError,
} from './detail-channels';
import { EditorForm } from './editor-form';
import {
    adoptServerSnapshot,
    buildPatchPayload,
    conflictReloadWouldDiscardEdits,
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
    const [metadataError, setMetadataError] = useState<string | null>(null);
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

    const loadMetadata = async () => {
        setMetadataError(null);
        try {
            const editorMetadata = await getLibraryEditorMetadata();
            setMetadata(editorMetadata);
            setMetadataError(null);
        } catch (error) {
            setMetadataError(formatMetadataLoadError(error));
        }
    };

    const loadDetail = async (id: string) => {
        setLoading(true);
        setDetailError(null);
        setSaveError(null);
        setConflict(false);
        try {
            const detail = await getLibraryCard(id);
            const adopted = adoptServerSnapshot(detail);
            setAuthoritative(adopted.authoritative);
            setWorking(adopted.working);
            setDetailError(null);
        } catch (error) {
            setDetailError(formatDetailLoadError(error));
            setAuthoritative(null);
            setWorking(null);
        } finally {
            setLoading(false);
        }
        // Metadata is an independent channel: failure must not clear detail.
        await loadMetadata();
    };

    const applyConflictReload = async (cardIdToReload: string) => {
        setLoading(true);
        setSaveError(null);
        try {
            const detail = await getLibraryCard(cardIdToReload);
            const adopted = adoptServerSnapshot(detail);
            setAuthoritative(adopted.authoritative);
            setWorking(adopted.working);
            setConflict(false);
            setDetailError(null);
        } catch (error) {
            setDetailError(formatDetailLoadError(error));
        } finally {
            setLoading(false);
        }
    };

    const onReloadLatest = () => {
        if (!authoritative || !working) return;
        const cardIdToReload = authoritative.card_id;
        if (conflictReloadWouldDiscardEdits(authoritative, working)) {
            Modal.confirm({
                title: 'Discard local edits and reload latest?',
                content:
                    'Reload Latest adopts the newest server snapshot as both the authoritative detail and the working form. Unsaved local edits will be discarded.',
                okText: 'Discard and reload',
                onOk: () => applyConflictReload(cardIdToReload),
            });
            return;
        }
        void applyConflictReload(cardIdToReload);
    };

    useEffect(() => {
        if (!open || !cardId) return;
        setEditing(false);
        setMetadataError(null);
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
            const adopted = adoptServerSnapshot(updated);
            setAuthoritative(adopted.authoritative);
            setWorking(adopted.working);
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
                            description="The server version changed. Local edits are preserved while the conflict is displayed. Reload Latest adopts the newest server snapshot as both authoritative state and working form."
                            action={(
                                <Button onClick={onReloadLatest}>
                                    Reload latest
                                </Button>
                            )}
                        />
                    )}
                    {saveError && !conflict && (
                        <Alert type="error" showIcon message="Save failed" description={saveError} />
                    )}
                    {metadataError && (
                        <Alert
                            type="warning"
                            showIcon
                            message="Editor metadata unavailable"
                            description={metadataError}
                            action={<Button onClick={() => void loadMetadata()}>Retry metadata</Button>}
                        />
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
