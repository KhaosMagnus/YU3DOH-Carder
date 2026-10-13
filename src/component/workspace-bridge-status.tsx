import React, { useState } from 'react';
const buttonStyle: React.CSSProperties = {
    background: '#27614f',
    color: '#fff',
    border: '1px solid #72a58b',
    borderRadius: 4,
    padding: '6px 10px',
    margin: '6px 6px 6px 0',
};
import type { WorkspaceBridgeSession } from 'src/service/workspace-bridge';
import { useCard, flushPendingCardUpdates } from 'src/service';
import { classifyWrite } from 'src/service/workspace-bridge/write-projection';
import { saveToWorkspace } from 'src/service/workspace-bridge/write-back';

type Props = { session: WorkspaceBridgeSession | null; error?: string | null };
export const WorkspaceBridgeStatus = ({ session, error }: Props) => {
    const card = useCard((s) => s.card);
    const [message, setMessage] = useState('');
    const [busy, setBusy] = useState(false);
    const [ack, setAck] = useState<string[] | null>(null);
    if (!session && !error) return null;
    const classified = session?.write ? classifyWrite(session, card) : null;
    const save = async (blocks: string[]) => {
        if (!session) return;
        setBusy(true);
        setAck(null);
        try {
            flushPendingCardUpdates();
            const result = await saveToWorkspace(
                session,
                useCard.getState().card,
                blocks,
            );
            setMessage(
                `${result.changed ? 'Saved' : 'Unchanged'} · revision ${result.revision} · changed blocks: ${result.changed_blocks.join(', ') || 'none'} · moved to DRAFT: ${result.moved_to_draft.join(', ') || 'none'}`,
            );
        } catch (e) {
            setMessage(
                e instanceof Error
                    ? `${'code' in e ? String(e.code) + ': ' : ''}${e.message}`
                    : String(e),
            );
        } finally {
            setBusy(false);
        }
    };
    const beginSave = () => {
        if (!session) return;
        flushPendingCardUpdates();
        const latest = classifyWrite(session, useCard.getState().card);
        if (latest.unsupported.length) {
            setMessage(`Save blocked by: ${latest.unsupported.join(', ')}`);
            return;
        }
        if (latest.required.length) setAck(latest.required);
        else void save([]);
    };
    return (
        <div
            className="workspace-bridge-status"
            role="status"
            aria-live="polite"
            style={{
                margin: '8px auto',
                maxWidth: 1576,
                padding: '8px 12px',
                background: '#1b2a1b',
                color: '#f0f0f0',
            }}
        >
            {error ? (
                <div>Workspace → Carder bridge failed. {error}</div>
            ) : (
                session && (
                    <>
                        <strong>Opened from Workspace</strong> · composition{' '}
                        {session.composition} · language{' '}
                        {session.contentLanguage} · revision {session.revision}
                        <div>
                            Save to Workspace available for supported Canonical
                            fields. Renderer/artwork changes remain local.
                        </div>
                        {session.write &&
                            card.id === session.write.internalCardId &&
                            classified && (
                                <>
                                    <button
                                        type="button"
                                        style={buttonStyle}
                                        disabled={
                                            busy ||
                                            session.write.stale ||
                                            classified.unsupported.length > 0
                                        }
                                        onClick={beginSave}
                                    >
                                        Save to Workspace
                                    </button>
                                    {classified.unsupported.length > 0 && (
                                        <div>
                                            Save blocked by:{' '}
                                            {classified.unsupported.join(', ')}.
                                            Revert these fields to save.
                                        </div>
                                    )}
                                    {session.write.stale && (
                                        <div>
                                            Workspace session is stale. Carder
                                            edits are preserved. Reopen
                                            explicitly from Library using Open
                                            in Carder.{' '}
                                            <a
                                                href="/ygocarder/library/"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ color: '#9fd8ff' }}
                                            >
                                                Review in Library and reopen
                                            </a>
                                        </div>
                                    )}
                                    {ack && (
                                        <div
                                            role="dialog"
                                            aria-label="Confirm Workspace save"
                                        >
                                            The following confirmed blocks will
                                            move to DRAFT: {ack.join(', ')}.
                                            <button
                                                type="button"
                                                style={buttonStyle}
                                                onClick={() => void save(ack)}
                                            >
                                                Acknowledge and Save to
                                                Workspace
                                            </button>
                                            <button
                                                type="button"
                                                style={buttonStyle}
                                                onClick={() => setAck(null)}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                    {message && <div>{message}</div>}
                                    {Object.values(
                                        session.write.confirmations,
                                    ).includes('DRAFT') && (
                                        <div>
                                            A fresh Open in Carder may require
                                            Library reconfirmation.
                                        </div>
                                    )}
                                </>
                            )}
                    </>
                )
            )}
        </div>
    );
};
