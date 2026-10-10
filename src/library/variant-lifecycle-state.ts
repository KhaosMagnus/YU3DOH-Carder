import * as api from './api';
import type { LibraryVariantDetail, LibraryVariantsResponse, VariantLifecyclePreview, VariantRenameProposal } from './model';
export type LifecycleEntry = { cardId: string; variantId: string; operation: 'PREFERRED' | 'CLEAR' | 'RENAME' | 'REMOVE' };
export type LifecyclePhase = 'LOADING' | 'SELECTING' | 'PREVIEW_LOADING' | 'CONFIRMING' | 'EXECUTING' | 'STALE' | 'ERROR' | 'SUCCESS' | 'RECOVERY_BLOCKED';
export const defaultCarderVariant = (variants: LibraryVariantDetail[], preferred: string | null): string =>
    preferred ? variants.find(v => v.variant_id === preferred)?.variant_id ?? '' : variants.length === 1 ? variants[0]!.variant_id : '';
export type LifecycleView = { phase: LifecyclePhase; entry: LifecycleEntry; state: LibraryVariantsResponse | null;
    proposal: VariantRenameProposal; acknowledge: boolean; preview: VariantLifecyclePreview | null; error: string | null; result: string | null };
export const lifecycleBusy = (phase: LifecyclePhase) => ['LOADING','PREVIEW_LOADING','EXECUTING'].includes(phase);
export const lifecycleError = (error: unknown) => error instanceof api.LibraryHttpError ? `${error.code}: ${error.message}` : `NETWORK_ERROR: ${error instanceof Error ? error.message : 'Lifecycle request failed.'}`;
export type LifecycleDependencies = Pick<typeof api, 'getLibraryVariants' | 'refreshResolutionState' | 'setPreferredVariant' | 'previewVariantRename' | 'renameVariant' | 'previewVariantRemove' | 'removeVariant'>;
export class VariantLifecycleController {
    view: LifecycleView;
    private listeners = new Set<(v: LifecycleView) => void>();
    private prepared: { token: string; proposal: VariantRenameProposal; acknowledge: boolean } | null = null;
    onChanged: () => Promise<void> = async () => {};
    onBlocked: () => Promise<void> = async () => {};
    constructor(entry: LifecycleEntry, private readonly client: LifecycleDependencies = api) {
        this.view = { entry, phase: 'LOADING', state: null, proposal: {variant_key:'',display_label:''},acknowledge:false,preview:null,error:null,result:null };
    }
    subscribe(listener: (v: LifecycleView) => void) { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; }
    private patch(p: Partial<LifecycleView>) { this.view={...this.view,...p}; for (const l of this.listeners) l(this.view); }
    async load() {
        this.prepared=null;this.patch({phase:'LOADING',preview:null});
        try {
            const state=await this.client.getLibraryVariants(this.view.entry.cardId);
            const variant=state.variants.find(v=>v.variant_id===this.view.entry.variantId);
            if(!variant)throw new api.LibraryHttpError({status:404,code:'VARIANT_NOT_FOUND',message:'Variant is no longer current.'});
            this.patch({state,phase:'SELECTING',proposal:{variant_key:variant.variant_key,display_label:variant.display_label}});
        }catch(error){await this.handle(error);}
    }
    edit(proposal: Partial<VariantRenameProposal>, acknowledge = this.view.acknowledge) {
        if(lifecycleBusy(this.view.phase)||this.view.phase==='RECOVERY_BLOCKED')return;
        this.prepared=null;this.patch({proposal:{...this.view.proposal,...proposal},acknowledge,preview:null,phase:'SELECTING',error:null});
    }
    cancel() { if(lifecycleBusy(this.view.phase))return false; this.prepared=null;return true; }
    async review() {
        if(lifecycleBusy(this.view.phase)||this.view.phase==='RECOVERY_BLOCKED'||!this.view.state)return;
        this.prepared=null;this.patch({phase:'PREVIEW_LOADING',preview:null,error:null});
        try {
            const e=this.view.entry;
            const preview=e.operation==='RENAME'?await this.client.previewVariantRename(e.variantId,{...this.view.proposal})
                :e.operation==='REMOVE'?await this.client.previewVariantRemove(e.variantId):null;
            if(preview && (preview.can_execute===false || preview.collision)) {
                this.patch({preview,phase:'SELECTING',error:preview.collision?'VARIANT_KEY_CONFLICT: Normalized key is already in use.':'VARIANT_DESTINATION_OCCUPIED: Managed destination is occupied.'});return;
            }
            if(preview?.acknowledge_preferred_clear_required&&!this.view.acknowledge){this.patch({preview,phase:'SELECTING',error:'PREFERRED_CLEAR_ACK_REQUIRED: Confirm that Preferred will be cleared without replacement.'});return;}
            this.prepared={token:preview?.expected_state_token??this.view.state!.expected_state_token,
                proposal:{...(preview?.proposed??this.view.proposal)},acknowledge:this.view.acknowledge};
            this.patch({preview,phase:'CONFIRMING'});
        }catch(error){await this.handle(error);}
    }
    async confirm() {
        if(!this.prepared||this.view.phase!=='CONFIRMING')return;
        const prepared=this.prepared;const e=this.view.entry;this.prepared=null;this.patch({phase:'EXECUTING',error:null});
        let completed=false;
        try {
            const result=e.operation==='PREFERRED'||e.operation==='CLEAR'
                ?await this.client.setPreferredVariant(e.cardId,e.operation==='CLEAR'?null:e.variantId,prepared.token)
                :e.operation==='RENAME'?await this.client.renameVariant(e.variantId,{...prepared.proposal,expected_state_token:prepared.token})
                :await this.client.removeVariant(e.variantId,{expected_state_token:prepared.token,acknowledge_preferred_clear:prepared.acknowledge});
            completed=true;this.patch({state:result});await this.onChanged();
            this.patch({phase:'SUCCESS',preview:null,result:result.changed?`${e.operation} completed. Authoritative Library refreshed.`:'No change; authoritative state retained.'});
        }catch(error){await this.handle(error);if(completed)this.patch({result:'Server operation completed; UI refresh failed. Refresh authoritative state.'});}
    }
    private async handle(error: unknown) {
        this.prepared=null;const code=error instanceof api.LibraryHttpError?error.code:'';
        const blocked=['VARIANT_MUTATION_RECOVERY_REQUIRED','ASSET_MUTATION_RECOVERY_REQUIRED','WORKSPACE_NOT_READY'].includes(code);
        this.patch({preview:null,error:lifecycleError(error),phase:blocked?'RECOVERY_BLOCKED':'ERROR'});
        if(blocked){this.patch({state:null});await this.onBlocked().catch(()=>{});return;}
        if(['VARIANT_STATE_STALE','VARIANT_MUTATION_FAILED','VARIANT_NOT_FOUND'].includes(code)) {
            this.patch({phase:'LOADING'});
            try {
                await this.client.refreshResolutionState();
                const state=await this.client.getLibraryVariants(this.view.entry.cardId);this.patch({state,phase:code==='VARIANT_STATE_STALE'?'STALE':'ERROR'});await this.onChanged();
            }catch(refreshError){
                const blockedRefresh = refreshError instanceof api.LibraryHttpError && ['WORKSPACE_NOT_READY','VARIANT_MUTATION_RECOVERY_REQUIRED','ASSET_MUTATION_RECOVERY_REQUIRED'].includes(refreshError.code);
                this.patch({state:null,phase:blockedRefresh?'RECOVERY_BLOCKED':'ERROR',error:`${lifecycleError(error)} Refresh failed: ${lifecycleError(refreshError)}`});
                if(blockedRefresh)await this.onBlocked().catch(()=>{});
            }
        }
    }
}
