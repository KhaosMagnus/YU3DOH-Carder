import { useEffect, useState } from 'react';
import { Alert, Button, Input, Modal, Spin } from 'antd';
import { browseLibraryCards } from './api';
import { ASSET_ROLES, LIBRARY_FAMILIES, type AssetReadiness, type LibraryCardSummary, type LibraryFamily } from './model';
import { AssetResolutionController, resolverAsset, resolverBusy, resolverOperations, resolverSlot,
    type ResolverEntry, type ResolverOperation } from './asset-resolution-state';

const operationLabel: Record<ResolverOperation, string> = {
    ATTACH: 'Attach', MOVE: 'Move', CHOOSE: 'Choose conflict winner', UNASSIGN: 'Unassign', LEAVE: 'Leave unresolved',
    REPLACE: 'Replace', RELINK: 'Relink', REMOVE: 'Remove',
};
export const ReadinessReview = ({ label, readiness }: { label: string; readiness: AssetReadiness }) => (
    <section className="library-resolution-readiness" aria-label={label}>
        <strong>{label}</strong>
        <div>Standard: {readiness.standard.state} {readiness.standard.sources.length ? `← ${readiness.standard.sources.join(' + ')}` : ''}</div>
        <div>Overframe: {readiness.overframe.state} {readiness.overframe.sources.length ? `← ${readiness.overframe.sources.join(' + ')}` : ''}</div>
    </section>
);

type Props = {
    entry: ResolverEntry;
    enabled: boolean;
    onClose: () => void;
    onChanged: () => Promise<void>;
    onBlocked: () => Promise<void>;
};
export const AssetResolutionModal = ({ entry, enabled, onClose, onChanged, onBlocked }: Props) => {
    const [controller] = useState(() => new AssetResolutionController());
    const [view, setView] = useState(controller.view);
    const [search, setSearch] = useState('');
    const [cards, setCards] = useState<LibraryCardSummary[]>([]);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [searching, setSearching] = useState(false);
    const [draftMode, setDraftMode] = useState(false);
    const [family, setFamily] = useState<LibraryFamily>('MONSTER');
    const [password, setPassword] = useState('');
    controller.onChanged = onChanged;
    controller.onBlocked = onBlocked;
    useEffect(() => {
        const unsubscribe = controller.subscribe(setView);
        void controller.open(entry);
        return unsubscribe;
    }, [controller, entry]);
    const selected = view.selection;
    const target = resolverSlot(view);
    const asset = resolverAsset(view);
    const operations = resolverOperations(view);
    const busy = resolverBusy(view.phase);
    const blocked = !enabled || view.phase === 'RECOVERY_BLOCKED';
    const managed = ['REPLACE', 'RELINK', 'REMOVE'].includes(selected.operation);
    const conflict = target?.slot.slot_state === 'CONFLICT';
    const targeting = ['ATTACH', 'MOVE'].includes(selected.operation);
    const review = ['PREVIEW_READY', 'CONFIRMING'].includes(view.phase);
    const selectedSource = selected.sourceMode === 'path' ? selected.sourceFile : view.snapshot?.assets.find(a => a.assetId === selected.sourceAssetId)?.relativePath;
    const select = controller.select.bind(controller);
    const searchCards = async () => {
        setSearching(true); setSearchError(null);
        try {
            const response = await browseLibraryCards({ query: search, preferredLanguage: 'EN', family: '', archetype: '',
                effectClassifier: '', functionalTag: '', limit: 50, offset: 0 });
            setCards(response.items);
        } catch (error) { setSearchError(error instanceof Error ? error.message : 'Card search failed.'); }
        finally { setSearching(false); }
    };
    const close = () => { if (!busy) { controller.close(); onClose(); } };
    return (
        <Modal title="Asset Resolution" visible onCancel={close} width={860} maskClosable={false} closable={!busy}
            footer={[
                <Button key="cancel" onClick={close} disabled={busy}>Cancel</Button>,
                <Button key="refresh" onClick={() => { void controller.refresh(); }} disabled={busy || blocked}>Refresh asset state</Button>,
                <Button key="review" onClick={() => { void controller.review(); }} disabled={busy || blocked || !view.snapshot || view.phase === 'SUCCESS'}>
                    {managed && target?.slot.asset?.managed_asset_id ? 'Preview / review' : 'Review decision'}
                </Button>,
                <Button key="confirm" type="primary" danger={selected.operation === 'REMOVE'} loading={view.phase === 'EXECUTING'}
                    disabled={!review || busy || blocked} onClick={() => { void controller.confirm(); }}>
                    {view.draftReview ? 'Confirm protection + Draft creation' : `Confirm ${selected.operation ? operationLabel[selected.operation].toLowerCase() : 'decision'}`}
                </Button>,
            ]}>
            {busy && <Spin tip={view.phase === 'EXECUTING' ? 'Executing…' : 'Loading authoritative state…'} />}
            {blocked && <Alert type="error" showIcon message="Asset operations blocked"
                description="Workspace must be READY before another asset operation. Recovery-required remains blocked until recovery completes." />}
            {view.warning && <Alert role="alert" type="warning" showIcon message={view.warning} />}
            {view.error && <Alert role="alert" type="error" showIcon message={view.error} />}
            {view.result && <Alert type={view.phase === 'SUCCESS' ? 'success' : 'info'} showIcon message={view.result}
                description={view.createdDraftId ? `Created Draft card: ${view.createdDraftId}. This Draft is retained; retry attaches to the same card.` : undefined} />}
            <fieldset className="library-resolution-fields" disabled={busy || blocked || view.phase === 'SUCCESS'}>
                <legend>Current server state</legend>
                {target && <p>Fixed slot: card <strong>{target.variant.card_id}</strong> · variant <strong>{target.variant.display_label} ({target.variant.variant_key})</strong> · role <strong>{target.role}</strong> · {target.slot.slot_state}</p>}
                {asset && <dl className="library-resolution-metadata">
                    <dt>Filename / path</dt><dd>{asset.fileName}<br />{asset.relativePath}</dd>
                    <dt>Parsed hints</dt><dd>Name: {asset.parsedCardName ?? 'none'} · Password: {asset.parsedPassword ?? 'none'} · Role: {asset.role ?? 'none'} · Variant: {asset.variantLabel ?? 'none'} ({asset.variantKey ?? 'none'})</dd>
                    <dt>Image</dt><dd>{asset.imageWidth ?? '?'} × {asset.imageHeight ?? '?'} · {asset.hasTransparency === null ? 'transparency unknown' : asset.hasTransparency ? 'transparent' : 'opaque'} · {asset.extension}</dd>
                    <dt>Association</dt><dd>{asset.associationState} · Card: {asset.cardId ?? 'none'} · Variant: {asset.variantId ?? 'none'}</dd>
                    <dt>Indexed state</dt><dd>{asset.present ? 'present' : 'missing'} · {asset.validAsset ? 'valid for binding' : 'not currently bindable'}</dd>
                </dl>}
                {target?.slot.asset && <p>Current asset: {target.slot.asset.file_name} · {target.slot.asset.relative_path} · {target.slot.asset.ownership}</p>}
                <label>Action
                    <select aria-label="Action" value={selected.operation} onChange={e => select({ operation: e.target.value as ResolverOperation, candidateId: '' })}>
                        <option value="">Select action</option>
                        {operations.map(op => <option value={op} key={op}>{operationLabel[op]}</option>)}
                    </select>
                </label>
                {conflict && ['CHOOSE', 'MOVE'].includes(selected.operation) && <fieldset>
                    <legend>Current conflict candidates — select explicitly</legend>
                    <p>Choosing a winner preserves every other candidate physically and unassigns them for future resolution.</p>
                    {(target.slot.candidates ?? []).map(candidate => <label className="library-resolution-candidate" key={candidate.assetId}>
                        <input type="radio" name="conflict-candidate" value={candidate.assetId} checked={selected.candidateId === candidate.assetId}
                            onChange={() => select({ candidateId: candidate.assetId })} />
                        <span>{candidate.fileName}<br />{candidate.relativePath}<br />{candidate.imageWidth} × {candidate.imageHeight} · {candidate.hasTransparency ? 'transparent' : 'opaque'}</span>
                    </label>)}
                </fieldset>}
                {managed && selected.operation !== 'REMOVE' && <fieldset>
                    <legend>Replacement / recovery source</legend>
                    <label>Source selection
                        <select aria-label="Source selection" value={selected.sourceMode} onChange={e => select({ sourceMode: e.target.value as 'path' | 'indexed' })}>
                            <option value="path">Absolute source path</option><option value="indexed">Existing indexed asset</option>
                        </select>
                    </label>
                    {selected.sourceMode === 'path' ? <label>Absolute source path
                        <Input value={selected.sourceFile} onChange={e => select({ sourceFile: e.target.value })} placeholder="Absolute path on the Workspace Service machine" />
                    </label> : <label>Indexed source
                        <select aria-label="Indexed source" value={selected.sourceAssetId} onChange={e => select({ sourceAssetId: e.target.value })}>
                            <option value="">Select indexed source</option>
                            {(view.snapshot?.assets ?? []).map(source => <option key={source.assetId} value={source.assetId}>
                                {source.relativePath} · {source.present ? 'present' : 'missing'} / {source.validAsset ? 'valid' : 'invalid'} · {source.role ?? 'no role hint'} · {source.imageWidth ?? '?'}×{source.imageHeight ?? '?'}
                            </option>)}
                        </select>
                    </label>}
                    {selected.operation === 'RELINK' && <Alert type="info" showIcon message="Relink repairs this same card / variant / role."
                        description="The selected source has NOT been preview-validated. Workspace Service validates it during execution." />}
                </fieldset>}
                {targeting && <fieldset>
                    <legend>Explicit resolution target</legend>
                    {conflict ? <p>Target card: {target.variant.card_id} · fixed role: {target.role}</p>
                        : <>
                            {view.createdDraftId ? <p>Retained Draft target: {view.createdDraftId}</p> : <>
                                <label>Find existing card<Input value={search} onChange={e => setSearch(e.target.value)} onPressEnter={() => { void searchCards(); }} /></label>
                                <Button onClick={() => { void searchCards(); }} loading={searching}>Search cards</Button>
                                {searchError && <Alert type="error" message={searchError} />}
                                <label>Existing card<select aria-label="Existing card" value={selected.cardId} onChange={e => { if (e.target.value) void controller.selectCard(e.target.value); }}>
                                    <option value="">Select Canonical card</option>
                                    {selected.cardId && !cards.some(card => card.card_id === selected.cardId) && <option value={selected.cardId}>{selected.cardId}</option>}
                                    {cards.map(card => <option value={card.card_id} key={card.card_id}>{card.display_name} · {card.password ?? 'no password'} · {card.card_id}</option>)}
                                </select></label>
                                {selected.operation === 'ATTACH' && <>
                                    <Button onClick={() => { setDraftMode(value => !value); select({ createVariant: true, variantId: '' }); }}>Create Draft card for this resolution…</Button>
                                    {draftMode && <fieldset><legend>Create Draft + Attach — explicit intent</legend>
                                        <label>Draft family<select aria-label="Draft family" value={family} onChange={e => { setFamily(e.target.value as LibraryFamily); select({}); }}>{LIBRARY_FAMILIES.map(f => <option key={f}>{f}</option>)}</select></label>
                                        {family !== 'TOKEN' && <label>Draft password (optional)<Input value={password} onChange={e => { setPassword(e.target.value); select({}); }} /></label>}
                                        <p>First protect this source with explicit Unassign, then create the Draft with the password supplied. Attach to the selected role and variant requires a separate confirmation. If attachment fails, the Draft is retained and the source stays unassigned for retry.</p>
                                        <Button onClick={() => { void controller.createDraft({ family, ...(family !== 'TOKEN' ? { password: password || null } : {}) }); }}>Review Create Draft + Attach</Button>
                                    </fieldset>}
                                </>}
                            </>}
                            <label>Target role<select aria-label="Target role" value={selected.role} onChange={e => select({ role: e.target.value as typeof selected.role })}>
                                <option value="">Select role explicitly</option>{ASSET_ROLES.map(role => <option key={role}>{role}</option>)}
                            </select></label>
                        </>}
                    <label>Target variant mode<select aria-label="Target variant mode" disabled={!!view.createdDraftId || draftMode} value={selected.createVariant ? 'new' : 'existing'} onChange={e => select({ createVariant: e.target.value === 'new', variantId: '' })}>
                        <option value="existing">Existing variant</option><option value="new">Create target variant inside this resolution</option>
                    </select></label>
                    {selected.createVariant ? <>
                        <label>Target variant key<Input value={selected.variantKey} onChange={e => select({ variantKey: e.target.value })} /></label>
                        <label>Target display label (optional)<Input value={selected.displayLabel} onChange={e => select({ displayLabel: e.target.value })} /></label>
                    </> : <label>Existing target variant<select aria-label="Existing target variant" value={selected.variantId} onChange={e => select({ variantId: e.target.value })}>
                        <option value="">Select target variant</option>
                        {view.targetVariants.filter(v => !conflict || v.variant_id !== target.variant.variant_id).map(v => <option key={v.variant_id} value={v.variant_id}>{v.display_label} ({v.variant_key})</option>)}
                    </select></label>}
                </fieldset>}
            </fieldset>
            {view.preview && <section className="library-resolution-review" aria-label="Managed asset preview">
                <h3>{operationLabel[view.preview.operation]} preview</h3>
                <p>Card: {view.preview.affected_slot.card_id} · Variant: {view.preview.affected_slot.variant_id} · Role: {view.preview.affected_slot.role}</p>
                <p>Current: {view.preview.managed_asset.managedRelativePath}</p>
                {selected.operation !== 'REMOVE' && <p>Proposed source: {selectedSource}</p>}
                <ReadinessReview label="Readiness before" readiness={view.preview.readiness_before} />
                <ReadinessReview label="Readiness after" readiness={view.preview.readiness_after} />
                <p>Recovery policy: {view.preview.recovery_policy}. Previous state and recovery material are retained by Workspace Service.</p>
                {selected.operation === 'REMOVE' && <p>Remove retires the managed asset from this role. The card and variant are retained.</p>}
            </section>}
            {review && !view.preview && <section className="library-resolution-review" aria-label="Resolution confirmation">
                <h3>{view.draftReview ? 'Review Create Draft + Attach' : `Review ${selected.operation && operationLabel[selected.operation]}`}</h3>
                {view.draftReview && <>
                    <p>1. Explicitly unassign this source before creating any Draft.</p>
                    <p>2. Create one {view.draftReview.family} Draft with password: {view.draftReview.password ?? 'none'}.</p>
                    <p>3. Review and confirm Attach separately to role {selected.role}, variant {selected.variantKey}. No variant is created before that attachment.</p>
                    <p>If Draft creation fails, the source remains unassigned. If Attach fails, retain the Draft and the unassigned source; retry only Attach.</p>
                </>}
                <p>Asset: {selected.candidateId || asset?.relativePath || target?.slot.asset?.relative_path || 'current context'}</p>
                {selected.operation === 'RELINK' ? <p>Fixed target: {target?.variant.card_id} / {target?.variant.variant_key} / {target?.role}. Source: {selectedSource}. Source validation occurs during execution.</p>
                    : <p>Target card: {conflict ? target.variant.card_id : selected.cardId || 'unchanged'} · Variant: {selected.createVariant ? `create ${selected.variantKey}` : selected.variantId || 'unchanged'} · Role: {conflict ? target.role : selected.role || 'unchanged'}</p>}
                {selected.operation === 'LEAVE' && <p>Leave unresolved is an explicit no-op. Cancel closes without calling a mutation endpoint.</p>}
                {target && <ReadinessReview label="Current authoritative readiness" readiness={target.variant} />}
            </section>}
            {view.phase === 'SUCCESS' && target && <ReadinessReview label="Refreshed authoritative readiness" readiness={target.variant} />}
        </Modal>
    );
};
