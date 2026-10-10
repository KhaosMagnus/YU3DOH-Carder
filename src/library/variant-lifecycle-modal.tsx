import { useEffect, useState } from 'react';
import { Alert, Button, Input, Modal, Spin } from 'antd';
import { ReadinessReview } from './asset-resolution-modal';
import { VariantLifecycleController, lifecycleBusy, type LifecycleEntry } from './variant-lifecycle-state';
export const VariantLifecycleModal = ({entry,onClose,onChanged,onBlocked}:{entry:LifecycleEntry;onClose:()=>void;onChanged:()=>Promise<void>;onBlocked:()=>Promise<void>}) => {
    const [controller]=useState(()=>new VariantLifecycleController(entry));const [view,setView]=useState(controller.view);
    controller.onChanged=onChanged;controller.onBlocked=onBlocked;
    useEffect(()=>{const unsubscribe=controller.subscribe(setView);void controller.load();return unsubscribe;},[controller]);
    const busy=lifecycleBusy(view.phase);const blocked=view.phase==='RECOVERY_BLOCKED';const preview=view.preview;
    const variant=view.state?.variants.find(v=>v.variant_id===entry.variantId);
    const close=()=>{if(controller.cancel())onClose();};
    return <Modal title={`Variant Lifecycle — ${entry.operation}`} visible width={780} maskClosable={false} closable={!busy} onCancel={close}
        footer={[<Button key="cancel" onClick={close} disabled={busy}>Cancel</Button>,
            <Button key="review" disabled={busy||blocked||view.phase==='SUCCESS'||!view.state} onClick={()=>{void controller.review();}}>Review lifecycle</Button>,
            <Button key="confirm" danger={entry.operation==='REMOVE'} type="primary" loading={view.phase==='EXECUTING'} disabled={view.phase!=='CONFIRMING'||busy||blocked} onClick={()=>{void controller.confirm();}}>Confirm {entry.operation.toLowerCase()}</Button>]}>
        {busy&&<Spin tip="Loading authoritative lifecycle state…"/>}
        {view.error&&<Alert role="alert" type="error" showIcon message={view.error}/>}
        {view.phase==='STALE'&&<Alert role="alert" type="warning" message="Variant state changed. Review and confirm again; no operation was replayed."/>}
        {blocked&&<Alert type="error" message="Variant operations blocked — Workspace recovery / readiness required"/>}
        {view.result&&<Alert type={view.phase==='SUCCESS'?'success':'info'} message={view.result}/>}
        <p>Card: {entry.cardId} · Variant: {variant?.display_label??entry.variantId} ({variant?.variant_key})</p>
        <fieldset disabled={busy||blocked||view.phase==='SUCCESS'}>
            {entry.operation==='RENAME'&&<>
                <label>Variant display label<Input value={view.proposal.display_label} onChange={e=>controller.edit({display_label:e.target.value})}/></label>
                <label>Variant key<Input value={view.proposal.variant_key} onChange={e=>controller.edit({variant_key:e.target.value})}/></label>
                <p>Workspace Service normalizes the key. Managed paths may move; unmanaged filenames remain unchanged.</p>
            </>}
            {entry.operation==='PREFERRED'&&<p>Set this variant as Preferred. Readiness does not change; broken Preferred will remain selected.</p>}
            {entry.operation==='CLEAR'&&<p>Clear Preferred. No replacement will be selected automatically.</p>}
            {entry.operation==='REMOVE'&&<>
                <p>Remove this Art Variant, preserving the Canonical card. Managed bytes are retained in recovery material. Unmanaged files remain in place and become unassigned for future resolution.</p>
                {(view.state?.preferred_variant_id===entry.variantId||preview?.preferred)&&<label>
                    <input type="checkbox" checked={view.acknowledge} onChange={e=>controller.edit({},e.target.checked)}/>
                    I acknowledge that removing this variant clears Preferred. No replacement Preferred will be selected automatically.
                </label>}
            </>}
        </fieldset>
        {preview&&<section aria-label="Variant lifecycle preview" className="library-resolution-review">
            <h3>{preview.operation==='RENAME'?'Rename':'Remove'} preview</h3>
            <p>Preferred: {preview.preferred?'yes':'no'} · Recovery policy: {preview.recovery_policy}</p>
            {preview.current&&<p>Current label / key: {preview.current.display_label} ({preview.current.variant_key})</p>}
            {preview.proposed&&<p>Server-normalized target: {preview.proposed.display_label} ({preview.proposed.variant_key}) · Collision: {preview.collision?'yes':'no'}</p>}
            <h4>Managed assets</h4><ul>{preview.managed_assets.map(m=><li key={m.managed_asset_id}>{m.managed_relative_path}{m.destination?` → ${m.destination}`:' → recovery material'}{m.occupied?' — destination occupied':''}</li>)}</ul>
            <h4>Unmanaged sources preserved in place</h4><ul>{preview.unmanaged_assets.map(a=><li key={a.assetId}>{a.relativePath}</li>)}</ul>
            {preview.readiness_before&&<ReadinessReview label="Readiness before" readiness={preview.readiness_before}/>}
            {preview.readiness_after&&<ReadinessReview label="Readiness after" readiness={preview.readiness_after}/>}
            {preview.variant&&<><ReadinessReview label="Removed variant readiness" readiness={preview.variant}/><p>Slots: BS {preview.variant.roles.BS.slot_state} · BG {preview.variant.roles.BG.slot_state} · OF {preview.variant.roles.OF.slot_state}</p></>}
            {preview.remaining_variants&&<p>Remaining variants: {preview.remaining_variants.map(v=>`${v.display_label} (${v.variant_key}): Standard ${v.standard.state}, Overframe ${v.overframe.state}`).join('; ')||'none'}</p>}
        </section>}
        {view.phase==='CONFIRMING'&&<p>Review complete. Confirm explicitly to execute; Cancel leaves the Workspace unchanged.</p>}
    </Modal>;
};
