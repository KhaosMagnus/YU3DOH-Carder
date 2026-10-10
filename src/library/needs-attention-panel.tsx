import { useMemo, useState } from 'react';
import { Alert, Button, Select, Spin, Tag } from 'antd';
import type { LibraryNeedsAttentionResponse } from './model';
import type { ResolverEntry } from './asset-resolution-state';
import { ASSET_ROLES } from './model';
import {
    filterDiagnosticsByCode,
    presentNeedsAttention,
    uniqueDiagnosticCodes,
} from './asset-state';

const { Option } = Select;

type Props = {
    open: boolean;
    data: LibraryNeedsAttentionResponse | null;
    loading: boolean;
    error: string | null;
    rescanError: string | null;
    rescanning: boolean;
    onRescan: () => void;
    onClose: () => void;
    onNavigateCard?: (cardId: string) => void;
    onResolve?: (entry: ResolverEntry) => void;
    assetsEnabled?: boolean;
};

export const NeedsAttentionPanel = ({
    open,
    data,
    loading,
    error,
    rescanError,
    rescanning,
    onRescan,
    onClose,
    onNavigateCard,
    onResolve,
    assetsEnabled = true,
}: Props) => {
    const [codeFilter, setCodeFilter] = useState('');
    const presentation = useMemo(() => presentNeedsAttention(data), [data]);
    const codes = useMemo(
        () => uniqueDiagnosticCodes(data?.items ?? []),
        [data],
    );
    const items = useMemo(
        () => filterDiagnosticsByCode(data?.items ?? [], codeFilter),
        [data, codeFilter],
    );

    if (!open) return null;

    return (
        <aside className="library-needs-attention" aria-label="Needs Attention">
            <div className="library-needs-attention__header">
                <h2>Needs Attention</h2>
                <div className="library-needs-attention__actions">
                    <Button
                        type="primary"
                        loading={rescanning}
                        disabled={rescanning || !assetsEnabled}
                        onClick={onRescan}
                    >
                        Rescan Assets
                    </Button>
                    <Button onClick={onClose}>Close</Button>
                </div>
            </div>

            {error && (
                <Alert type="error" showIcon message="Needs Attention unavailable" description={error} />
            )}
            {rescanError && (
                <Alert type="error" showIcon message="Rescan failed" description={rescanError} />
            )}
            {loading && <div className="library-state"><Spin tip="Loading diagnostics…" /></div>}

            {!loading && !error && presentation?.kind === 'not-scanned' && (
                <Alert
                    type="info"
                    showIcon
                    message="Assets have not been scanned yet."
                    description="Use Rescan Assets to build the current Asset Index. An empty list here does not mean there are no issues."
                />
            )}

            {!loading && !error && presentation?.kind === 'clean' && (
                <Alert
                    type="success"
                    showIcon
                    message="No current asset issues."
                    description={`Last scan completed at ${presentation.scan.completed_at}.`}
                />
            )}

            {!loading && !error && presentation?.kind === 'issues' && (
                <>
                    <div className="library-needs-attention__meta">
                        <span>Last scan: {presentation.scan.completed_at}</span>
                        <Tag color="orange">
                            {presentation.scan.diagnostic_count} diagnostic
                            {presentation.scan.diagnostic_count === 1 ? '' : 's'}
                        </Tag>
                        <Select
                            allowClear
                            placeholder="Filter by code"
                            value={codeFilter || undefined}
                            onChange={value => setCodeFilter(value ?? '')}
                            style={{ minWidth: 220 }}
                        >
                            {codes.map(code => <Option key={code} value={code}>{code}</Option>)}
                        </Select>
                    </div>
                    <div className="library-needs-attention__list">
                        {items.map(item => (
                            <article className="library-diagnostic" key={item.diagnostic_id}>
                                <div className="library-diagnostic__top">
                                    <Tag color="red">{item.code}</Tag>
                                    <span className="library-muted">{item.relative_path}</span>
                                </div>
                                <p>{item.message}</p>
                                {onResolve && item.asset_id && !['ASSETS_DIRECTORY_MISSING', 'UNSAFE_LINK', 'SOURCE_READ_ERROR'].includes(item.code) && (
                                    <Button disabled={!assetsEnabled} onClick={() => onResolve({ assetId: item.asset_id!,
                                        ...(item.card_id ? { cardId: item.card_id } : {}),
                                        ...(item.variant_id ? { variantId: item.variant_id } : {}),
                                        ...(ASSET_ROLES.includes(item.role as any) ? { role: item.role as typeof ASSET_ROLES[number] } : {}) })}>
                                        {item.code === 'ROLE_CONFLICT' ? 'Resolve Conflict' : item.code === 'MISSING_SOURCE' ? 'Repair' : 'Resolve'}
                                    </Button>
                                )}
                                {(item.card_id || item.variant_key || item.role) && (
                                    <div className="library-diagnostic__assoc">
                                        {item.card_id && onNavigateCard && (
                                            <button
                                                type="button"
                                                className="library-link-button"
                                                onClick={() => onNavigateCard(item.card_id!)}
                                            >
                                                Open card
                                            </button>
                                        )}
                                        {item.variant_key && <Tag>variant: {item.variant_key}</Tag>}
                                        {item.role && <Tag>role: {item.role}</Tag>}
                                    </div>
                                )}
                            </article>
                        ))}
                    </div>
                </>
            )}
        </aside>
    );
};
