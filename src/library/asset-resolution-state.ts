import * as api from './api';
import type {
    AssetResolutionOperation, AssetResolutionRequest, AssetResolutionState, AssetSource,
    AssetRole, IndexedLibraryAsset, LibraryFamily, LibraryVariantDetail, ManagedAssetMutationRequest,
    ManagedAssetOperation, ManagedAssetPreview,
} from './model';

export type ResolverEntry = { cardId?: string; variantId?: string; role?: AssetRole; assetId?: string; operation?: ResolverOperation };
export type ResolverOperation = AssetResolutionOperation | ManagedAssetOperation;
export type ResolverPhase = 'CLOSED' | 'LOADING_STATE' | 'SELECTING' | 'PREVIEW_LOADING' | 'PREVIEW_READY'
    | 'CONFIRMING' | 'EXECUTING' | 'STALE' | 'ERROR' | 'SUCCESS' | 'RECOVERY_BLOCKED';
export type ResolverSelection = {
    operation: ResolverOperation | ''; candidateId: string;
    sourceMode: 'path' | 'indexed'; sourceFile: string; sourceAssetId: string;
    cardId: string; variantId: string; role: AssetRole | '';
    createVariant: boolean; variantKey: string; displayLabel: string;
};
export type ResolverView = {
    phase: ResolverPhase; entry: ResolverEntry | null; snapshot: AssetResolutionState | null;
    variants: LibraryVariantDetail[]; targetVariants: LibraryVariantDetail[];
    selection: ResolverSelection; preview: ManagedAssetPreview | null;
    error: string | null; warning: string | null; createdDraftId: string | null;
    result: string | null;
};
const initialSelection = (): ResolverSelection => ({ operation: '', candidateId: '', sourceMode: 'path', sourceFile: '',
    sourceAssetId: '', cardId: '', variantId: '', role: '', createVariant: false, variantKey: '', displayLabel: '' });
const initialView = (): ResolverView => ({ phase: 'CLOSED', entry: null, snapshot: null, variants: [], targetVariants: [],
    selection: initialSelection(), preview: null, error: null, warning: null, createdDraftId: null, result: null });
export const resolverBusy = (phase: ResolverPhase) => ['LOADING_STATE', 'PREVIEW_LOADING', 'EXECUTING'].includes(phase);
export const resolverAsset = (view: ResolverView): IndexedLibraryAsset | undefined =>
    view.snapshot?.assets.find(a => a.assetId === view.entry?.assetId);
export const resolverSlot = (view: ResolverView) => {
    const asset = resolverAsset(view);
    const id = view.entry?.variantId ?? asset?.variantId;
    const role = view.entry?.role ?? asset?.role;
    const variant = view.variants.find(v => v.variant_id === id);
    return variant && role ? { variant, role, slot: variant.roles[role] } : null;
};
/** Eligibility uses server slot/candidate/ownership fields; never composition inference. */
export function resolverOperations(view: ResolverView): ResolverOperation[] {
    if (!view.snapshot || view.phase === 'RECOVERY_BLOCKED') return [];
    const target = resolverSlot(view);
    if (target?.slot.slot_state === 'CONFLICT') return ['CHOOSE', 'MOVE', 'LEAVE'];
    if (target?.slot.asset?.ownership === 'managed' && target.slot.asset.managed_asset_id) {
        if (target.slot.slot_state === 'BOUND') return ['REPLACE', 'REMOVE', 'LEAVE'];
        if (['MISSING', 'INVALID'].includes(target.slot.slot_state)) return ['RELINK', 'REPLACE', 'REMOVE', 'LEAVE'];
    }
    const asset = resolverAsset(view) ?? view.snapshot.assets.find(a => a.assetId === target?.slot.asset?.asset_id);
    const ignored = view.snapshot.overrides.some(o => o.asset_id === asset?.assetId && o.disposition === 'IGNORE');
    if (asset && !ignored) {
        if ((!asset.present || !asset.validAsset) && asset.variantId && asset.cardId && asset.role) return ['RELINK', 'LEAVE'];
        // RUN 011 marks unresolved/ambiguous associations validAsset=false even
        // after image inspection. ATTACH performs the authoritative source validation.
        if (asset.present && (asset.validAsset || ['UNRESOLVED', 'AMBIGUOUS'].includes(asset.associationState))) {
            const assigned = view.snapshot.overrides.some(o => o.asset_id === asset.assetId && o.disposition === 'ASSIGN');
            return [asset.variantId ? 'MOVE' : 'ATTACH', ...(assigned ? ['UNASSIGN' as const] : []), 'LEAVE'];
        }
    }
    return ['LEAVE'];
}
export function assetResolutionError(error: unknown): string {
    const code = error instanceof api.LibraryHttpError ? error.code : 'NETWORK_ERROR';
    const messages: Record<string, string> = {
        ASSET_STATE_STALE: 'Asset state changed. Review the updated state before continuing.',
        ASSET_SLOT_OCCUPIED: 'The target slot is occupied. Choose another target or resolve its conflict.',
        ASSET_DESTINATION_OCCUPIED: 'The managed destination is occupied. Review the target before continuing.',
        ASSET_NOT_FOUND: 'The asset is no longer current. Authoritative state has been refreshed.',
        ASSET_SOURCE_UNSAFE: 'The source path is unsafe and has been rejected.',
        WORKSPACE_MAINTENANCE_ACTIVE: 'Workspace maintenance is active. Try again after maintenance completes.',
        ASSET_MUTATION_FAILED: 'The asset operation failed. Review refreshed state before another attempt.',
        ASSET_MUTATION_RECOVERY_REQUIRED: 'Asset recovery is required. Further asset operations are blocked.',
        WORKSPACE_NOT_READY: 'Workspace is not READY. Asset operations are blocked.',
    };
    return `${code}: ${messages[code] ?? (error instanceof Error ? error.message : 'Asset request failed.')}`;
}
export type ResolverDependencies = Pick<typeof api, 'getResolutionState' | 'refreshResolutionState' | 'getLibraryVariants'
    | 'previewManagedAsset' | 'mutateManagedAsset' | 'resolveAsset' | 'createLibraryCard'>;

/** One controller drives both entry surfaces. Review freezes the exact request executed on confirmation. */
export class AssetResolutionController {
    view = initialView();
    private listeners = new Set<(view: ResolverView) => void>();
    private prepared: { kind: 'managed'; body: ManagedAssetMutationRequest } | { kind: 'resolution'; body: AssetResolutionRequest } | null = null;
    private generation = 0;
    onChanged: () => Promise<void> = async () => {};
    onBlocked: () => Promise<void> = async () => {};
    constructor(private readonly client: ResolverDependencies = api) {}
    subscribe(listener: (view: ResolverView) => void) { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; }
    private patch(patch: Partial<ResolverView>) { this.view = { ...this.view, ...patch }; for (const listener of this.listeners) listener(this.view); }
    close() { if (resolverBusy(this.view.phase)) return; this.generation++; this.prepared = null; this.patch(initialView()); }
    async open(entry: ResolverEntry) {
        if (resolverBusy(this.view.phase)) return;
        const generation = ++this.generation;
        this.prepared = null; this.patch({ ...initialView(), entry, phase: 'LOADING_STATE' });
        try {
            const snapshot = await this.client.getResolutionState();
            const asset = snapshot.assets.find(a => a.assetId === entry.assetId);
            const cardId = entry.cardId ?? asset?.cardId;
            const variants = cardId ? (await this.client.getLibraryVariants(cardId)).variants : [];
            if (generation !== this.generation) return;
            this.patch({ snapshot, variants, phase: 'SELECTING' });
            const operations = resolverOperations(this.view);
            const operation = entry.operation && operations.includes(entry.operation)
                ? entry.operation : operations.find(op => op !== 'LEAVE') ?? 'LEAVE';
            this.patch({ selection: { ...initialSelection(), operation,
                cardId: cardId ?? '', role: operation === 'ATTACH' ? '' : entry.role ?? asset?.role ?? '', variantId: entry.variantId ?? asset?.variantId ?? '' },
                targetVariants: variants });
        } catch (error) { if (generation === this.generation) await this.handleError(error); }
    }
    select(patch: Partial<ResolverSelection>) {
        if (resolverBusy(this.view.phase) || this.view.phase === 'RECOVERY_BLOCKED') return;
        this.prepared = null;
        // Draft identity cannot be replaced accidentally during attach retry.
        if (this.view.createdDraftId && patch.cardId && patch.cardId !== this.view.createdDraftId) return;
        this.patch({ selection: { ...this.view.selection, ...patch }, preview: null, error: null, phase: 'SELECTING', result: null });
    }
    async selectCard(cardId: string) {
        if (resolverBusy(this.view.phase) || this.view.phase === 'RECOVERY_BLOCKED') return;
        this.select({ cardId, variantId: '', createVariant: false });
        if (this.view.selection.cardId !== cardId) return;
        this.patch({ targetVariants: [], phase: 'LOADING_STATE' });
        try {
            const response = await this.client.getLibraryVariants(cardId);
            this.patch({ targetVariants: response.variants, phase: 'SELECTING' });
        } catch (error) { await this.handleError(error); }
    }
    private source(): AssetSource {
        const selected = this.view.selection;
        if (selected.sourceMode === 'path' && selected.sourceFile.trim()) return { source_file: selected.sourceFile.trim() };
        if (selected.sourceMode === 'indexed' && selected.sourceAssetId) return { asset_id: selected.sourceAssetId };
        throw new api.LibraryHttpError({ status: 422, code: 'ASSET_SOURCE_INVALID', message: 'Select exactly one source: an absolute path or an indexed asset.' });
    }
    private async reload(scan: boolean) {
        const snapshot = await (scan ? this.client.refreshResolutionState() : this.client.getResolutionState());
        const asset = snapshot.assets.find(a => a.assetId === this.view.entry?.assetId);
        const cardId = this.view.entry?.cardId ?? asset?.cardId;
        const variants = cardId ? (await this.client.getLibraryVariants(cardId)).variants : [];
        const selectedCard = this.view.selection.cardId;
        const targetVariants = selectedCard && selectedCard !== cardId ? (await this.client.getLibraryVariants(selectedCard)).variants : variants;
        this.patch({ snapshot, variants, targetVariants });
    }
    async refresh() {
        if (resolverBusy(this.view.phase)) return;
        this.prepared = null; this.patch({ preview: null, snapshot: null, phase: 'LOADING_STATE' });
        try { await this.reload(true); await this.onChanged(); this.patch({ phase: 'SELECTING', error: null }); }
        catch (error) { await this.handleError(error); }
    }
    async createDraft(input: { family: LibraryFamily; password?: string | null }) {
        if (resolverBusy(this.view.phase) || this.view.createdDraftId || this.view.phase === 'RECOVERY_BLOCKED') return;
        if (!this.view.snapshot || this.view.selection.operation !== 'ATTACH' || !resolverOperations(this.view).includes('ATTACH')) return;
        this.prepared = null; this.patch({ phase: 'EXECUTING', preview: null, error: null });
        try {
            const card = await this.client.createLibraryCard(input);
            this.patch({ createdDraftId: card.card_id, targetVariants: [], selection: { ...this.view.selection,
                cardId: card.card_id, variantId: '', createVariant: true }, result: 'Draft created. Asset not attached.' });
            await this.reload(false); await this.onChanged(); this.patch({ phase: 'SELECTING' });
        } catch (error) { await this.handleError(error); }
    }
    async review() {
        if (resolverBusy(this.view.phase) || this.view.phase === 'RECOVERY_BLOCKED') return;
        this.prepared = null; this.patch({ error: null, preview: null });
        try {
            const { selection: selected, snapshot } = this.view;
            if (!snapshot || !resolverOperations(this.view).includes(selected.operation as ResolverOperation)) {
                throw new api.LibraryHttpError({ status: 422, code: 'ASSET_OPERATION_INVALID', message: 'Load current state and select an available operation.' });
            }
            const operation = selected.operation as ResolverOperation;
            const target = resolverSlot(this.view);
            if (['REPLACE', 'RELINK', 'REMOVE'].includes(operation)) {
                if (!target) throw new Error('A fixed target slot is required.');
                const managedId = target.slot.asset?.managed_asset_id;
                const targetAssetId = target.slot.asset?.asset_id ?? resolverAsset(this.view)?.assetId;
                const source = operation === 'REMOVE' ? {} : this.source();
                let preview: ManagedAssetPreview | null = null;
                if (managedId) {
                    this.patch({ phase: 'PREVIEW_LOADING' });
                    preview = await this.client.previewManagedAsset(managedId, operation === 'REPLACE'
                        ? { operation: 'REPLACE', ...source } as { operation: 'REPLACE' } & AssetSource
                        : { operation: operation as 'REMOVE' | 'RELINK' });
                    if (preview.operation !== operation || preview.affected_slot.card_id !== target.variant.card_id
                        || preview.affected_slot.variant_id !== target.variant.variant_id || preview.affected_slot.role !== target.role) {
                        throw new Error('Preview target does not match the fixed slot.');
                    }
                } else if (operation !== 'RELINK' || !targetAssetId) throw new Error('This target has no managed mutation contract.');
                this.prepared = { kind: 'managed', body: { operation: operation as ManagedAssetOperation,
                    ...(managedId ? { managed_asset_id: managedId } : { target_asset_id: targetAssetId! }),
                    expected_state_token: preview?.expected_state_token ?? snapshot.expected_state_token, ...source,
                    card_id: target.variant.card_id, variant_id: target.variant.variant_id, role: target.role } };
                this.patch({ preview, phase: 'PREVIEW_READY' });
                return;
            }
            const body: AssetResolutionRequest = { operation: operation as AssetResolutionOperation, expected_state_token: snapshot.expected_state_token };
            const conflict = target?.slot.slot_state === 'CONFLICT';
            const assetId = conflict ? selected.candidateId : resolverAsset(this.view)?.assetId ?? target?.slot.asset?.asset_id;
            if (operation !== 'LEAVE') {
                if (!assetId || (conflict && !target!.slot.candidates?.some(a => a.assetId === assetId))) throw new Error('Select a current candidate explicitly.');
                body.asset_id = assetId;
                if (operation !== 'UNASSIGN') {
                    const role = conflict ? target!.role : selected.role;
                    if (!role) throw new Error('Confirm the target role.');
                    body.role = role;
                    if (operation === 'CHOOSE') body.variant_id = target!.variant.variant_id;
                    else if (selected.createVariant) {
                        const cardId = conflict ? target!.variant.card_id : selected.cardId;
                        if (!cardId || !selected.variantKey.trim()) throw new Error('Select a card and enter a target variant key.');
                        body.create_variant = { card_id: cardId, variant_key: selected.variantKey.trim(),
                            ...(selected.displayLabel.trim() ? { display_label: selected.displayLabel.trim() } : {}) };
                    } else {
                        const valid = this.view.targetVariants.find(v => v.variant_id === selected.variantId
                            && v.card_id === (conflict ? target!.variant.card_id : selected.cardId));
                        if (!valid || (conflict && valid.variant_id === target!.variant.variant_id)) throw new Error('Select another current target variant.');
                        body.variant_id = valid.variant_id;
                    }
                }
            }
            this.prepared = { kind: 'resolution', body };
            this.patch({ phase: 'CONFIRMING' });
        } catch (error) { await this.handleError(error); }
    }
    async confirm() {
        if (!this.prepared || !['PREVIEW_READY', 'CONFIRMING'].includes(this.view.phase)) return;
        const request = this.prepared;
        this.prepared = null; this.patch({ phase: 'EXECUTING', error: null });
        let completed = false;
        try {
            const response = request.kind === 'managed' ? await this.client.mutateManagedAsset(request.body) : await this.client.resolveAsset(request.body);
            completed = true;
            await this.reload(false); await this.onChanged();
            this.patch({ phase: 'SUCCESS', preview: null, result: response.changed ? `${response.operation} completed. Authoritative views refreshed.` : 'Left unresolved. No asset changes.' });
        } catch (error) {
            await this.handleError(error);
            if (completed) this.patch({ result: 'Server operation completed, but refreshing the UI failed. Refresh authoritative state before continuing.' });
        }
    }
    private async handleError(error: unknown) {
        this.prepared = null;
        const code = error instanceof api.LibraryHttpError ? error.code : '';
        const blocked = ['ASSET_MUTATION_RECOVERY_REQUIRED', 'WORKSPACE_NOT_READY'].includes(code);
        this.patch({ preview: null, error: assetResolutionError(error), phase: blocked ? 'RECOVERY_BLOCKED' : 'ERROR',
            ...(this.view.createdDraftId ? { result: 'Draft created. Asset not attached.' } : {}) });
        if (blocked) { this.patch({ snapshot: null }); await this.onBlocked().catch(() => {}); return; }
        if (['ASSET_STATE_STALE', 'ASSET_NOT_FOUND', 'ASSET_MUTATION_FAILED'].includes(code)) {
            this.patch({ snapshot: null, phase: 'LOADING_STATE', warning: code === 'ASSET_STATE_STALE'
                ? 'Asset state changed. Review the updated state before continuing.' : 'Review refreshed authoritative state before another attempt.' });
            try { await this.reload(true); await this.onChanged(); this.patch({ phase: code === 'ASSET_STATE_STALE' ? 'STALE' : 'ERROR' }); }
            catch (refreshError) {
                this.patch({ phase: 'ERROR', snapshot: null, error: `${assetResolutionError(error)} Refresh failed: ${assetResolutionError(refreshError)}` });
                if (refreshError instanceof api.LibraryHttpError && ['WORKSPACE_NOT_READY', 'ASSET_MUTATION_RECOVERY_REQUIRED'].includes(refreshError.code)) {
                    this.patch({ phase: 'RECOVERY_BLOCKED' }); await this.onBlocked().catch(() => {});
                }
            }
        }
    }
}
