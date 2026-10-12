import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import {
    Alert,
    Button,
    Input,
    Pagination,
    Select,
    Spin,
    Tag,
} from 'antd';
import {
    browseLibraryCards,
    createLibraryCard,
    getLibraryFacets,
    getLibraryNeedsAttention,
    getWorkspaceStatus,
    LibraryHttpError,
    rescanLibraryAssets,
    setLibraryMaintenanceFence,
} from './api';
import {
    formatNeedsAttentionError,
    formatRescanError,
} from './asset-channels';
import { DetailPanel } from './detail-panel';
import { NeedsAttentionPanel } from './needs-attention-panel';
import { NewDraftModal } from './new-draft-modal';
import { AssetResolutionModal } from './asset-resolution-modal';
import type { ResolverEntry } from './asset-resolution-state';
import {
    getLibraryResultState,
    getWorkspaceShellState,
    hasBrowseCriteria,
    type LibraryBrowseFilters,
    type LibraryBrowseResult,
    type LibraryCardDetail,
    type LibraryFacets,
    type LibraryFamily,
    type LibraryLanguage,
    type LibraryNeedsAttentionResponse,
    type WorkspaceStatus,
} from './model';
import { WorkspaceManagement } from './workspace-management';
import { WorkspaceManagementController, type MaintenanceOperation } from './workspace-management-state';
import './library.scss';

const { Option } = Select;

const initialFilters: LibraryBrowseFilters = {
    query: '',
    preferredLanguage: 'EN',
    family: '',
    archetype: '',
    effectClassifier: '',
    functionalTag: '',
    limit: 50,
    offset: 0,
};

const emptyResult: LibraryBrowseResult = {
    items: [],
    total: 0,
    limit: 50,
    offset: 0,
};

export const LibraryApp = () => {
    const [status, setStatus] = useState<WorkspaceStatus | null>(null);
    const [statusError, setStatusError] = useState<string | null>(null);
    const [facets, setFacets] = useState<LibraryFacets | null>(null);
    const [filters, setFilters] = useState(initialFilters);
    const [result, setResult] = useState<LibraryBrowseResult>(emptyResult);
    const [loading, setLoading] = useState(true);
    const [browseError, setBrowseError] = useState<string | null>(null);
    const [facetsError, setFacetsError] = useState<string | null>(null);
    const [retryNonce, setRetryNonce] = useState(0);
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [newDraftOpen, setNewDraftOpen] = useState(false);
    const [creatingDraft, setCreatingDraft] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const [needsAttentionOpen, setNeedsAttentionOpen] = useState(false);
    const [needsAttention, setNeedsAttention] = useState<LibraryNeedsAttentionResponse | null>(null);
    const [needsAttentionLoading, setNeedsAttentionLoading] = useState(false);
    const [needsAttentionError, setNeedsAttentionError] = useState<string | null>(null);
    const [rescanError, setRescanError] = useState<string | null>(null);
    const [rescanning, setRescanning] = useState(false);
    const [resolverEntry, setResolverEntry] = useState<ResolverEntry | null>(null);
    const [assetsRevision, setAssetsRevision] = useState(0);
    const [assetBlocked, setAssetBlocked] = useState(false);

    const [clientDataBlocked, setClientDataBlocked] = useState(false);
    const [maintenanceError, setMaintenanceError] = useState<string | null>(
        null,
    );
    const [managementOpen, setManagementOpen] = useState(false);
    const [maintenance, setMaintenance] =
        useState<MaintenanceOperation>('NONE');
    const [editorDirty, setEditorDirty] = useState(false);
    const [workspaceGeneration, setWorkspaceGeneration] = useState(0);
    const maintenanceRef = useRef<MaintenanceOperation>('NONE');
    const filtersRef = useRef(filters);
    filtersRef.current = filters;
    const dataEpoch = useRef(0);
    const invalidateWorkspace = useCallback(() => {
        dataEpoch.current++;
        setClientDataBlocked(true);
        setWorkspaceGeneration((n) => n + 1);
        setSelectedCardId(null);
        setDetailOpen(false);
        setEditorDirty(false);
        setResolverEntry(null);
        setNeedsAttentionOpen(false);
        setNeedsAttention(null);
        setNewDraftOpen(false);
        setResult(emptyResult);
        setFacets(null);
        setBrowseError(null);
        setFacetsError(null);
        setNeedsAttentionError(null);
        setRescanError(null);
        setAssetBlocked(false);
    }, []);
    const [managementController] = useState(
        () =>
            new WorkspaceManagementController({
                begin: (operation) => {
                    maintenanceRef.current = operation;
                    setLibraryMaintenanceFence(operation);
                    setMaintenance(operation);
                    dataEpoch.current++;
                    setNewDraftOpen(false);
                    setResolverEntry(null);
                },
                invalidate: invalidateWorkspace,
                adoptStatus: (current, error) => {
                    setStatus(current);
                    setStatusError(error);
                },
                reloadLibrary: async (current) => {
                    if (current.state !== 'READY') return;
                    // Permit persisted reads for the authoritative rebuild; keep all mutation controls fenced.
                    if (maintenanceRef.current !== 'NONE')
                        setLibraryMaintenanceFence('BACKUP');
                    const epoch=dataEpoch.current;
                    const [freshFacets, freshResult] = await Promise.all([
                        getLibraryFacets(),
                        browseLibraryCards(filtersRef.current),
                    ]);
                    if(epoch!==dataEpoch.current)return;
                    setFacets(freshFacets);
                    setResult(freshResult);
                    setLoading(false);
                    setClientDataBlocked(false);
                },
                finish: () => {
                    maintenanceRef.current = 'NONE';
                    setLibraryMaintenanceFence('NONE');
                    setMaintenance('NONE');
                },
            }),
    );
    useEffect(() => () => setLibraryMaintenanceFence('NONE'), []);
    useEffect(
        () =>
            managementController.subscribe((v) => setMaintenanceError(v.error)),
        [managementController],
    );

    useEffect(() => {
        if(maintenanceRef.current!=='NONE')return;
        const controller = new AbortController();
        setStatus(null);
        setStatusError(null);
        const epoch=dataEpoch.current;
        getWorkspaceStatus(controller.signal)
            .then(current => { if(epoch!==dataEpoch.current)return; setStatus(current); if (current.state === 'READY') setAssetBlocked(false); })
            .catch(error => {
                if (epoch!==dataEpoch.current || (error instanceof Error && error.name === 'AbortError')) return;
                setStatusError(error instanceof Error ? error.message : 'Workspace Service is unavailable.');
            });
        return () => controller.abort();
    }, [retryNonce]);

    useEffect(() => {
        if (status?.state !== 'READY' || maintenanceRef.current==='RESTORE' || maintenanceRef.current==='MIGRATION'||maintenanceRef.current==='INITIALIZATION') {
            setFacets(null);
            setFacetsError(null);
            setLoading(false);
            return;
        }
        const controller = new AbortController();
        setFacetsError(null);
        const epoch=dataEpoch.current;
        getLibraryFacets(controller.signal)
            .then(value=>{if(epoch===dataEpoch.current)setFacets(value);})
            .catch(error => {
                if (epoch!==dataEpoch.current || (error instanceof Error && error.name === 'AbortError')) return;
                setFacetsError(error instanceof Error ? error.message : 'Could not load Library facets.');
            });
        return () => controller.abort();
    }, [status, retryNonce]);

    useEffect(() => {
        if (status?.state !== 'READY' || maintenanceRef.current==='RESTORE' || maintenanceRef.current==='MIGRATION'||maintenanceRef.current==='INITIALIZATION') {
            setLoading(false);
            return;
        }
        const controller = new AbortController();
        const epoch=dataEpoch.current;
        const timeout = window.setTimeout(() => {
            if(epoch!==dataEpoch.current)return;
            setLoading(true);
            setBrowseError(null);
            browseLibraryCards(filters, controller.signal)
                .then(value=>{if(epoch===dataEpoch.current)setResult(value);})
                .catch(error => {
                    if (epoch!==dataEpoch.current || (error instanceof Error && error.name === 'AbortError')) return;
                    setBrowseError(error instanceof LibraryHttpError ? `${error.code}: ${error.message}` : error instanceof Error ? error.message : 'Library request failed.');
                })
                .finally(() => setLoading(false));
        }, 200);
        return () => {
            window.clearTimeout(timeout);
            controller.abort();
        };
    }, [status, filters, retryNonce, assetsRevision]);

    const criteria = useMemo(() => hasBrowseCriteria(filters), [filters]);
    const resultState = getLibraryResultState({
        loading,
        error: browseError,
        total: result.total,
        hasCriteria: criteria,
    });

    const updateFilter = <K extends keyof LibraryBrowseFilters>(
        key: K,
        value: LibraryBrowseFilters[K],
    ) => setFilters(current => ({
        ...current,
        [key]: value,
        offset: key === 'offset' ? value as number : 0,
    }));

    const workspaceShellState = getWorkspaceShellState(status, statusError);
    const workspaceReady = workspaceShellState === 'ready';
    const mutationEnabled = workspaceReady && !status?.read_only && maintenance==='NONE' && !clientDataBlocked;
    const ordinaryReadsEnabled=workspaceReady && maintenance!=='RESTORE' && maintenance!=='MIGRATION' && maintenance!=='INITIALIZATION';
    const assetsEnabled = mutationEnabled && !assetBlocked;

    const openDetail = (cardId: string) => {
        if(maintenanceRef.current==='RESTORE'||maintenanceRef.current==='MIGRATION'||maintenanceRef.current==='INITIALIZATION')return;
        setSelectedCardId(cardId);
        setDetailOpen(true);
    };

    const handleCreated = async (input: { family: LibraryFamily; password?: string | null }) => {
        if(!mutationEnabled)return;
        setCreatingDraft(true);
        setCreateError(null);
        try {
            const detail = await createLibraryCard(input);
            setNewDraftOpen(false);
            setRetryNonce(value => value + 1);
            openDetail(detail.card_id);
        } catch (error) {
            setCreateError(error instanceof LibraryHttpError
                ? error.message
                : error instanceof Error ? error.message : 'Could not create Draft.');
        } finally {
            setCreatingDraft(false);
        }
    };

    const handleSaved = (_detail: LibraryCardDetail) => {
        setRetryNonce(value => value + 1);
    };

    const loadNeedsAttention = async () => {
        if (status?.state !== 'READY' || maintenanceRef.current==='RESTORE'||maintenanceRef.current==='MIGRATION'||maintenanceRef.current==='INITIALIZATION') return;
        const epoch=dataEpoch.current;
        setNeedsAttentionLoading(true);
        setNeedsAttentionError(null);
        try {
            const data = await getLibraryNeedsAttention();
            if(epoch===dataEpoch.current)setNeedsAttention(data);
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') return;
            setNeedsAttentionError(formatNeedsAttentionError(error));
        } finally {
            setNeedsAttentionLoading(false);
        }
    };

    const handleRescan = async () => {
        if(!assetsEnabled)return;
        setRescanError(null);
        setRescanning(true);
        try {
            await rescanLibraryAssets();
            await loadNeedsAttention();
            setAssetsRevision(value => value + 1);
        } catch (error) {
            setRescanError(formatRescanError(error));
        } finally {
            setRescanning(false);
        }
    };

    const refreshAssetViews = async () => {
        // Mutation already reconciled; these are persisted reads, not another Rescan.
        if (needsAttentionOpen) await loadNeedsAttention();
        setAssetsRevision(value => value + 1);
    };
    const blockAssetViews = async () => {
        setAssetBlocked(true);
        try { setStatus(await getWorkspaceStatus()); }
        catch (error) { setStatusError(error instanceof Error ? error.message : 'Workspace status unavailable.'); }
    };

    return (
        <main className="library-shell">
            <header className="library-header">
                <div>
                    <h1>YU3DOH Library</h1>
                    <p>Canonical card browse/search + detail editor</p>
                </div>
                <div className="library-header__actions">
                    <Button onClick={()=>setManagementOpen(true)}>Workspace</Button>
                    <Button
                        disabled={!ordinaryReadsEnabled}
                        onClick={() => {
                            setNeedsAttentionOpen(true);
                            void loadNeedsAttention();
                        }}
                    >
                        Needs Attention
                    </Button>
                    <Button
                        type="primary"
                        disabled={!mutationEnabled}
                        onClick={() => {
                            setCreateError(null);
                            setNewDraftOpen(true);
                        }}
                    >
                        New Draft
                    </Button>
                    <div className={`workspace-state workspace-state--${workspaceReady ? 'ready' : 'not-ready'}`}>
                        {statusError
                            ? 'Service unavailable'
                            : status
                                ? `Workspace: ${status.state}`
                                : 'Workspace: loading'}
                    </div>
                </div>
            </header>

            {maintenance!=='NONE' && <Alert type="info" showIcon message={`Workspace maintenance: ${maintenance}`} description="Library mutations are disabled until authoritative refresh completes."/>}

            {statusError && (
                <Alert
                    type="error"
                    showIcon
                    message="Workspace Service unavailable"
                    description={statusError}
                    action={<Button onClick={() => setRetryNonce(value => value + 1)}>Retry</Button>}
                />
            )}

            {!statusError && status && !workspaceReady && (
                <Alert
                    type={status.state==='RECOVERY_REQUIRED'?'error':'warning'}
                    showIcon
                    message={status.state==='RECOVERY_REQUIRED'?'Recovery Required':'Workspace is not ready'}
                    description={status.health_summary}
                />
            )}
            {maintenanceError?.includes('RECOVERY_REQUIRED') && status?.state!=='READY' && <Alert type="error" showIcon message="Recovery Required — Workspace operation could not prove completion" description={maintenanceError}/>}
            {clientDataBlocked && workspaceReady && maintenance==='NONE' && <Alert type="error" message="Library refresh required before editing" description="Workspace status is READY, but Library data has not been rebuilt. Open Workspace and Retry."/>}
            {assetBlocked && <Alert type="error" showIcon message="Asset operations blocked — Workspace recovery / readiness required"
                description={status?.health_summary ?? 'Check Workspace status before continuing.'}
                action={<Button onClick={() => setRetryNonce(value => value + 1)}>Check Workspace status</Button>} />}

            {facetsError && workspaceReady && (
                <Alert
                    type="warning"
                    showIcon
                    message="Facets unavailable"
                    description={facetsError}
                />
            )}

            {createError && (
                <Alert type="error" showIcon message="New Draft failed" description={createError} />
            )}

            <section className="library-controls" aria-label="Library browse controls">
                <Input.Search
                    allowClear
                    placeholder="Search name in EN / ES / JP or password"
                    value={filters.query}
                    onChange={event => updateFilter('query', event.target.value)}
                    onSearch={value => updateFilter('query', value)}
                    disabled={!ordinaryReadsEnabled}
                />

                <Select
                    value={filters.preferredLanguage}
                    onChange={value => updateFilter('preferredLanguage', value as LibraryLanguage)}
                    disabled={!ordinaryReadsEnabled}
                    aria-label="Preferred language"
                >
                    {(facets?.languages ?? ['EN', 'ES', 'JP']).map(language => (
                        <Option key={language} value={language}>{language}</Option>
                    ))}
                </Select>

                <Select
                    allowClear
                    placeholder="Family"
                    value={filters.family || undefined}
                    onChange={value => updateFilter('family', (value ?? '') as LibraryBrowseFilters['family'])}
                    disabled={!ordinaryReadsEnabled}
                >
                    {(facets?.families ?? []).map(value => <Option key={value} value={value}>{value}</Option>)}
                </Select>

                <Select
                    allowClear
                    showSearch
                    placeholder="Archetype"
                    value={filters.archetype || undefined}
                    onChange={value => updateFilter('archetype', value ?? '')}
                    disabled={!ordinaryReadsEnabled}
                >
                    {(facets?.archetypes ?? []).map(value => <Option key={value} value={value}>{value}</Option>)}
                </Select>

                <Select
                    allowClear
                    showSearch
                    placeholder="Effect Classifier"
                    value={filters.effectClassifier || undefined}
                    onChange={value => updateFilter('effectClassifier', value ?? '')}
                    disabled={!ordinaryReadsEnabled}
                >
                    {(facets?.effect_classifiers ?? []).map(value => <Option key={value} value={value}>{value}</Option>)}
                </Select>

                <Select
                    allowClear
                    showSearch
                    placeholder="Functional Tag"
                    value={filters.functionalTag || undefined}
                    onChange={value => updateFilter('functionalTag', value ?? '')}
                    disabled={!ordinaryReadsEnabled}
                >
                    {(facets?.functional_tags ?? []).map(value => <Option key={value} value={value}>{value}</Option>)}
                </Select>
            </section>

            <section className="library-results" aria-live="polite">
                {workspaceShellState === 'connecting' && (
                    <div className="library-state"><Spin tip="Connecting to Workspace…" /></div>
                )}
                {workspaceShellState === 'unavailable' && (
                    <div className="library-state">Library API unavailable.</div>
                )}
                {workspaceShellState === 'not-ready' && (
                    <div className="library-state">Library browse is unavailable until the Workspace is READY.</div>
                )}
                {workspaceReady && resultState === 'loading' && (
                    <div className="library-state"><Spin tip="Loading Library…" /></div>
                )}
                {workspaceReady && resultState === 'error' && (
                    <Alert
                        type="error"
                        showIcon
                        message="Library request failed"
                        description={browseError}
                        action={<Button onClick={() => setRetryNonce(value => value + 1)}>Retry</Button>}
                    />
                )}
                {workspaceReady && resultState === 'empty-library' && (
                    <div className="library-state">Library is empty.</div>
                )}
                {workspaceReady && resultState === 'no-match' && (
                    <div className="library-state">No matching cards.</div>
                )}
                {workspaceReady && resultState === 'results' && result.items.map(card => (
                    <article
                        className={`library-card${selectedCardId === card.card_id ? ' library-card--selected' : ''}`}
                        key={card.card_id}
                        onClick={() => openDetail(card.card_id)}
                        onKeyDown={event => {
                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                openDetail(card.card_id);
                            }
                        }}
                        role="button"
                        tabIndex={0}
                    >
                        <div className="library-card__main">
                            <h2>{card.display_name}</h2>
                            <div className="library-card__identity">
                                <Tag>{card.family}</Tag>
                                {card.password && <span>Password: {card.password}</span>}
                                {card.display_language && <span>Display: {card.display_language}</span>}
                                {!card.password && card.family === 'TOKEN' && <span>Token · no password</span>}
                            </div>
                        </div>
                        <div className="library-card__classifications">
                            {card.archetypes.map(value => <Tag key={`a-${value}`}>Archetype: {value}</Tag>)}
                            {card.effect_classifiers.map(value => <Tag key={`e-${value}`}>Effect: {value}</Tag>)}
                            {card.functional_tags.map(value => <Tag key={`f-${value}`}>Tag: {value}</Tag>)}
                        </div>
                        <div className="library-card__readiness">
                            <span>Variants: {card.variant_count}</span>
                            <Tag color={card.has_standard_ready_variant ? 'green' : undefined}>
                                Standard {card.has_standard_ready_variant ? 'READY' : 'incomplete'}
                            </Tag>
                            <Tag color={card.has_overframe_ready_variant ? 'green' : undefined}>
                                Overframe {card.has_overframe_ready_variant ? 'READY' : 'incomplete'}
                            </Tag>
                        </div>
                    </article>
                ))}
            </section>

            {workspaceReady && result.total > 0 && (
                <footer className="library-pagination">
                    <Pagination
                        current={Math.floor(filters.offset / filters.limit) + 1}
                        pageSize={filters.limit}
                        total={result.total}
                        showSizeChanger={false}
                        onChange={page => updateFilter('offset', (page - 1) * filters.limit)}
                    />
                </footer>
            )}

            <DetailPanel
                key={workspaceGeneration}
                onOpenWorkspace={()=>setManagementOpen(true)}
                maintenanceActive={maintenance!=='NONE'}
                mutationEnabled={mutationEnabled}
                onDirtyChange={setEditorDirty}
                cardId={selectedCardId}
                open={detailOpen}
                onClose={() => setDetailOpen(false)}
                onSaved={handleSaved}
                onAssetsChanged={() => {
                    setAssetsRevision(value => value + 1);
                    if (needsAttentionOpen) void loadNeedsAttention();
                }}
                onResolve={setResolverEntry}
                assetsRevision={assetsRevision}
                assetsEnabled={assetsEnabled}
                onLifecycleBlocked={blockAssetViews}
            />

            <NeedsAttentionPanel
                key={`attention-${workspaceGeneration}`}
                open={needsAttentionOpen}
                data={needsAttention}
                loading={needsAttentionLoading}
                error={needsAttentionError}
                rescanError={rescanError}
                rescanning={rescanning}
                onRescan={() => { void handleRescan(); }}
                onClose={() => setNeedsAttentionOpen(false)}
                onNavigateCard={cardId => {
                    openDetail(cardId);
                }}
                onResolve={setResolverEntry}
                assetsEnabled={assetsEnabled}
            />

            {resolverEntry && <AssetResolutionModal entry={resolverEntry} enabled={assetsEnabled}
                onClose={() => setResolverEntry(null)} onChanged={refreshAssetViews} onBlocked={blockAssetViews} />}

            <WorkspaceManagement open={managementOpen} onClose={()=>setManagementOpen(false)} status={status} statusError={statusError} dirty={editorDirty} controller={managementController}/>

            <NewDraftModal
                open={newDraftOpen && mutationEnabled}
                confirming={creatingDraft}
                onCancel={() => setNewDraftOpen(false)}
                onCreate={input => { void handleCreated(input); }}
            />
        </main>
    );
};
