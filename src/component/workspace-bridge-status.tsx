import React from 'react';
import type { WorkspaceBridgeSession } from 'src/service/workspace-bridge';

type Props = {
    session: WorkspaceBridgeSession | null;
    error?: string | null;
};

export const WorkspaceBridgeStatus = ({ session, error }: Props) => {
    if (!session && !error) return null;
    return (
        <div
            className="workspace-bridge-status"
            role="status"
            aria-live="polite"
            style={{
                margin: '8px 12px',
                padding: '8px 12px',
                borderRadius: 4,
                background: error ? '#3b1515' : '#1b2a1b',
                border: `1px solid ${error ? '#a33' : '#3a6b3a'}`,
                color: '#f0f0f0',
                fontSize: 13,
            }}
        >
            {error ? (
                <div>
                    <strong>Workspace → Carder bridge failed.</strong>
                    {' '}
                    {error}
                    {' '}
                    Local drafts were not applied as a successful open.
                </div>
            ) : session ? (
                <div>
                    <strong>Opened from Workspace</strong>
                    {' · '}
                    composition {session.composition}
                    {' · '}
                    language {session.contentLanguage}
                    {' · '}
                    revision {session.revision}
                    <div>
                        Working copy is <strong>not saved to Workspace</strong>.
                        Edits stay local/transient in this Carder session.
                    </div>
                </div>
            ) : null}
        </div>
    );
};
