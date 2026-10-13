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
import { useCard } from 'src/service';
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
            const result = await saveToWorkspace(session, card, blocks);
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
                                        onClick={() =>
                                            classified.required.length
                                                ? setAck(classified.required)
                                                : void save([])
                                        }
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
                                            in Carder.
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
                                    {session.write.lastResult?.moved_to_draft
                                        .length !== undefined &&
                                        session.write.lastResult.moved_to_draft
                                            .length > 0 && (
                                            <div>
                                                A fresh Open in Carder may
                                                require Library reconfirmation.
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
