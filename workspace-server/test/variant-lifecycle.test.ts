import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, symlink, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import Database from 'better-sqlite3';
import { createWorkspaceService, type WorkspaceService } from '../src/service';
import { bootstrapWorkspaceDatabase } from '../src/persistence/operations';
import { loadMigrations } from '../src/persistence/migrations';
import { WorkspacePersistence, configureOperationalDatabase } from '../src/persistence/database';
import { CanonicalDomainService } from '../src/canonical/service';
import { AssetIndexerService } from '../src/assets/indexer';
import { ManagedAssetIngestService } from '../src/managed-assets/service';
import { VariantLifecycleError } from '../src/variant-lifecycle/service';
import { captureAssetDomain } from '../src/asset-mutation/service';
import type { MutationHooks, MutationPhase } from '../src/asset-mutation/service';
import { png } from './variant-lifecycle-fixture';

const roots: string[] = []; const services: WorkspaceService[] = [];
const manifest = { workspace_id: 'run013', workspace_format_version: 1, database_path: 'Data/workspace.db', created_at: '2026-10-10T00:00:00.000Z', name: 'RUN 013' };
const setup = async (hooks: MutationHooks = {}) => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'yu3doh RUN013 日本語 ')); roots.push(root);
    await writeFile(path.join(root, 'workspace.json'), JSON.stringify(manifest)); bootstrapWorkspaceDatabase(root, manifest);
    const service = await createWorkspaceService({ workspaceRoot: root, host: '127.0.0.1', port: 4312 }, { lifecycleHooks: hooks }); services.push(service);
    const card = service.canonical!.createCard({ family: 'SPELL', password: '13000001' });
    const source = path.join(root, 'source art 日本語.png'); await writeFile(source, png(255));
    return { root, service, card, source, lifecycle: service.variantLifecycle! };
};
const fixture = async (hooks: MutationHooks = {}) => {
    const f = await setup(hooks);
    const managed = (await f.service.managedAssets!.ingest({ cardId: f.card.cardId, variantKey: 'Default', role: 'BS', sourceFile: f.source, idempotencyKey: 'first' })).managedAsset;
    await mkdir(path.join(f.root, 'Assets'), { recursive: true });
    const unmanaged = path.join(f.root, 'Assets', '13000001-Unmanaged-OF-Default.png'); await writeFile(unmanaged, png(128));
    await f.service.assetMutations!.refresh();
    return { ...f, managed, unmanaged, id: managed.variantId };
};
const state = (f: Awaited<ReturnType<typeof setup>>) => f.lifecycle.getState(f.card.cardId);
const token = (f: Awaited<ReturnType<typeof setup>>) => state(f).expected_state_token;
const errorCode = (code: string) => (e: unknown) => e instanceof VariantLifecycleError && e.code === code;
const rename = (f: Awaited<ReturnType<typeof fixture>>, key = 'Renamed', label = 'Renamed label') => f.lifecycle.rename(f.id, { variant_key: key, display_label: label, expected_state_token: token(f) });
const domain = (f: Awaited<ReturnType<typeof setup>>) => f.service.persistence!.runRepositoryOperation(captureAssetDomain);
const disposition = (f: Awaited<ReturnType<typeof setup>>, id: string) => f.service.persistence!.runRepositoryOperation(db =>
    (db.prepare('SELECT disposition FROM asset_resolution_overrides WHERE asset_id = ?').get(id) as { disposition: string } | undefined)?.disposition);
const fileTree = async (dir: string): Promise<unknown[]> => {
    if (!existsSync(dir)) return [];
    const results: unknown[] = [];
    for (const name of readdirSync(dir)) { const p = path.join(dir,name); const fs = await import('node:fs'); results.push([name, fs.lstatSync(p).isDirectory() ? await fileTree(p) : (await readFile(p)).toString('base64')]); }
    return results;
};
test.after(async () => { await Promise.all(services.map(s => s.close())); await Promise.all(roots.map(r => rm(r,{recursive:true,force:true}))); });

test('RUN013 real schema 5 migration: checkpoint, history 001..006, existing variants preferred null', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'run013 old schema 日本語 ')); roots.push(root);
    await writeFile(path.join(root,'workspace.json'), JSON.stringify(manifest)); await mkdir(path.join(root,'Data'));
    const db = new Database(path.join(root,'Data/workspace.db'));
    for (const m of loadMigrations().filter(m => m.version <= 5)) { db.exec(m.sql); db.prepare('INSERT INTO _workspace_migrations (version,name) VALUES (?,?)').run(m.version,m.name); db.pragma(`user_version = ${m.version}`); }
    const p = new WorkspacePersistence(db,configureOperationalDatabase(db)); const card = new CanonicalDomainService(p).createCard({family:'SPELL',password:'13000001'});
    await mkdir(path.join(root,'Assets')); await writeFile(path.join(root,'Assets','13000001-Old-BS-Default.png'),png(255));
    await new AssetIndexerService(root,p).scan(); p.close();
    const service = await createWorkspaceService({workspaceRoot:root,host:'127.0.0.1',port:4312}); services.push(service);
    assert.equal(service.status.state,'NEEDS_MIGRATION'); assert.equal(service.status.database_schema_version,5);
    const result = await service.recovery.migrate(); assert.ok('appliedVersions' in result); assert.deepEqual(result.appliedVersions,[6]); assert.ok(result.backup_id);
    assert.equal(service.status.state,'READY'); assert.equal(service.status.database_schema_version,6);
    assert.equal(service.variantLifecycle!.getState(card.cardId).preferred_variant_id,null);
    assert.equal(service.persistence!.runRepositoryOperation(db => (db.prepare('SELECT count(*) AS n FROM card_variant_preferences').get() as {n:number})).n,0);
    const backup = JSON.parse(await readFile(path.join(root,'Backups',result.backup_id!,'backup.json'),'utf8')); assert.equal(backup.database_schema_version,5);
    assert.deepEqual(service.persistence!.runRepositoryOperation(db=>db.prepare('SELECT version FROM _workspace_migrations ORDER BY version').all()),[1,2,3,4,5,6].map(version=>({version})));
});
test('Preferred first explicit Managed Ingest initializes preference, additional variant preserves it', async () => {
    const f = await fixture(); assert.equal(state(f).preferred_variant_id,f.id);
    await f.service.managedAssets!.ingest({cardId:f.card.cardId,variantKey:'Other',role:'BS',sourceFile:f.source,idempotencyKey:'other'});
    assert.equal(state(f).preferred_variant_id,f.id);
});
test('Preferred passive indexer discovery never invents preference; clear is no fallback', async () => {
    const f=await setup(); await mkdir(path.join(f.root,'Assets')); await writeFile(path.join(f.root,'Assets','13000001-A-BS-Default.png'),png(255));
    await f.service.assets!.scan(); assert.equal(state(f).preferred_variant_id,null);
    const v=state(f).variants[0]!; f.lifecycle.setPreferred(f.card.cardId,v.variant_id,token(f));
    f.lifecycle.setPreferred(f.card.cardId,null,token(f)); await f.service.assets!.scan(); assert.equal(state(f).preferred_variant_id,null);
});
test('Preferred set/change/clear, opaque token invalidation, idempotent no-ops and Canonical/files/bindings preserved', async () => {
    const f=await fixture(); const other=(await f.service.managedAssets!.ingest({cardId:f.card.cardId,variantKey:'Other',role:'BS',sourceFile:f.source,idempotencyKey:'other'})).managedAsset;
    const canonical=f.service.canonical!.getCard(f.card.cardId); const files=await fileTree(path.join(f.root,'Assets')); const bindings=domain(f).variant_role_bindings;
    const old=token(f); f.lifecycle.setPreferred(f.card.cardId,other.variantId,old); assert.notEqual(token(f),old);
    assert.throws(()=>f.lifecycle.setPreferred(f.card.cardId,null,old),errorCode('VARIANT_STATE_STALE'));
    const current=token(f); assert.equal(f.lifecycle.setPreferred(f.card.cardId,other.variantId,current).changed,false); assert.equal(token(f),current);
    f.lifecycle.setPreferred(f.card.cardId,null,current); assert.equal(state(f).preferred_variant_id,null);
    const clear=token(f); assert.equal(f.lifecycle.setPreferred(f.card.cardId,null,clear).changed,false); assert.equal(token(f),clear);
    assert.deepEqual(f.service.canonical!.getCard(f.card.cardId),canonical); assert.deepEqual(await fileTree(path.join(f.root,'Assets')),files); assert.deepEqual(domain(f).variant_role_bindings,bindings);
});
test('Preferred service and composite DB FK reject another-card variant',async()=>{
    const f=await fixture(); const c=f.service.canonical!.createCard({family:'SPELL',password:'13000002'});
    assert.throws(()=>f.lifecycle.setPreferred(c.cardId,f.id,token(f)),errorCode('VARIANT_CARD_MISMATCH'));
    assert.throws(()=>f.service.persistence!.runRepositoryOperation(db=>db.prepare('INSERT INTO card_variant_preferences VALUES (?,?,?,?)').run(c.cardId,f.id,'rev','now')),/FOREIGN KEY/);
});
test('Broken Preferred remains preferred across scans without readiness gate or fallback',async()=>{
    const f=await fixture(); await unlink(path.join(f.root,f.managed.managedRelativePath)); await f.service.assets!.scan();
    assert.equal(state(f).preferred_variant_id,f.id); assert.equal(state(f).variants[0]!.standard.state,'INCOMPLETE');
    f.lifecycle.setPreferred(f.card.cardId,null,token(f)); f.lifecycle.setPreferred(f.card.cardId,f.id,token(f)); assert.equal(state(f).preferred_variant_id,f.id);
});
test('Resolver first explicit create_variant initializes preferred; additional after Clear stays null',async()=>{
    const f=await setup(); await mkdir(path.join(f.root,'Assets')); await writeFile(path.join(f.root,'Assets','13999999-A-BS-Default.png'),png(255));
    let s=await f.service.assetMutations!.refresh(); const a=s.assets[0]!;
    await f.service.assetMutations!.resolve({operation:'ATTACH',asset_id:a.assetId,expected_state_token:s.expected_state_token,role:'BS',create_variant:{card_id:f.card.cardId,variant_key:'Explicit'}});
    assert.equal(state(f).preferred_variant_id,state(f).variants[0]!.variant_id);
    f.lifecycle.setPreferred(f.card.cardId,null,token(f)); s=await f.service.assetMutations!.refresh();
    await f.service.assetMutations!.resolve({operation:'MOVE',asset_id:a.assetId,expected_state_token:s.expected_state_token,role:'BS',create_variant:{card_id:f.card.cardId,variant_key:'Second'}});
    assert.equal(state(f).preferred_variant_id,null);
});
test('Rename/Remove previews are read-only across DB/scans/files/recovery/grants and return stable token/readiness',async()=>{
    const f=await fixture(); const a=f.service.assets!.listAssets().find(a=>a.role==='BS')!;
    const grant=f.service.carderAssetGrants.issue({cardId:f.card.cardId,variantId:f.id,role:'BS',assetId:a.assetId,hash:a.contentHash!,composition:'STANDARD',revision:f.card.revision});
    const before=domain(f); const files=await fileTree(path.join(f.root,'Assets')); const recovery=await fileTree(path.join(f.root,'Temp')); const grants=f.service.carderAssetGrants.size(); assert.equal(grants,1);
    const preview=f.lifecycle.previewRename(f.id,{variant_key:'Ｆｉｎａｌ',display_label:'  Final label  '});
    assert.equal(preview.proposed.variant_key,'final'); assert.equal(preview.proposed.display_label,'Final label'); assert.deepEqual(preview.readiness_before,preview.readiness_after);
    const removed=f.lifecycle.previewRemove(f.id); assert.equal(removed.preferred,true); assert.equal(removed.acknowledge_preferred_clear_required,true); assert.equal(removed.managed_assets.length,1); assert.equal(removed.unmanaged_assets.length,1);
    assert.equal(f.lifecycle.previewRename(f.id,{variant_key:'Final',display_label:'Final'}).expected_state_token,preview.expected_state_token);
    assert.deepEqual(domain(f),before); assert.deepEqual(await fileTree(path.join(f.root,'Assets')),files); assert.deepEqual(await fileTree(path.join(f.root,'Temp')),recovery); assert.equal(f.service.carderAssetGrants.size(),grants);
    assert.ok(f.service.carderAssetGrants.verify(grant,a.assetId,a.contentHash!));
});
test('Managed + unmanaged key Rename preserves IDs/hash/Preferred/composition and source association through Rescan',async()=>{
    const f=await fixture(); const before=state(f); const assets=f.service.assets!.listAssets(); const bytes=await readFile(f.unmanaged);
    const result=await rename(f,'Renamed','New label'); const v=result.variants[0]!;
    assert.equal(v.variant_id,f.id); assert.equal(v.card_id,f.card.cardId); assert.equal(result.preferred_variant_id,f.id); assert.deepEqual(v.standard,before.variants[0]!.standard); assert.deepEqual(v.overframe,before.variants[0]!.overframe);
    const managed=f.service.managedAssets!.listManagedAssets()[0]!; assert.equal(managed.managedAssetId,f.managed.managedAssetId); assert.equal(managed.contentHash,f.managed.contentHash);
    assert.equal(managed.managedRelativePath,`Assets/Managed/${f.card.cardId}/renamed/BS.png`); assert.deepEqual(await readFile(path.join(f.root,managed.managedRelativePath)),png(255)); assert.equal(existsSync(path.join(f.root,f.managed.managedRelativePath)),false);
    await f.service.assets!.scan(); assert.deepEqual(await readFile(f.unmanaged),bytes); assert.deepEqual(f.service.assets!.listAssets().map(a=>a.assetId).sort(),assets.map(a=>a.assetId).sort());
    const unmanaged=f.service.assets!.listAssets().find(a=>a.relativePath.endsWith('Unmanaged-OF-Default.png'))!; assert.equal(unmanaged.variantId,f.id); assert.equal(disposition(f,unmanaged.assetId),'ASSIGN'); assert.equal(state(f).variants.length,1);
});
test('Label-only Rename changes token/label without moving managed files or creating overrides',async()=>{
    const f=await fixture(); const old=token(f); const tree=await fileTree(path.join(f.root,'Assets'));
    await rename(f,'Default','New display'); assert.notEqual(token(f),old); assert.equal(state(f).variants[0]!.display_label,'New display');
    assert.deepEqual(await fileTree(path.join(f.root,'Assets')),tree); assert.equal(domain(f).asset_resolution_overrides.length,0);
});
test('Existing unmanaged ASSIGN keeps its target variant and role across another key Rename and Rescan',async()=>{
    const f=await fixture();const s=await f.service.assetMutations!.refresh();const asset=s.assets.find(a=>a.relativePath.endsWith('Unmanaged-OF-Default.png'))!;
    await f.service.assetMutations!.resolve({operation:'MOVE',asset_id:asset.assetId,variant_id:f.id,role:'OF',expected_state_token:s.expected_state_token});
    const bytes=await readFile(f.unmanaged);await rename(f);await f.service.assets!.scan();
    const current=f.service.assets!.listAssets().find(a=>a.assetId===asset.assetId)!;assert.equal(current.variantId,f.id);assert.equal(current.role,'OF');assert.equal(disposition(f,asset.assetId),'ASSIGN');assert.deepEqual(await readFile(f.unmanaged),bytes);
});
test('Case-insensitive normalized Rename collision preview blocks and execution independently rejects',async()=>{
    const f=await fixture(); await f.service.managedAssets!.ingest({cardId:f.card.cardId,variantKey:'Other',role:'BS',sourceFile:f.source,idempotencyKey:'other'});
    const preview=f.lifecycle.previewRename(f.id,{variant_key:'ＯＴＨＥＲ',display_label:'Collision'}); assert.equal(preview.collision,true); assert.equal(preview.can_execute,false);
    const before=domain(f); const files=await fileTree(path.join(f.root,'Assets')); await assert.rejects(rename(f,'Other'),errorCode('VARIANT_KEY_CONFLICT'));
    assert.deepEqual(await fileTree(path.join(f.root,'Assets')),files); assert.deepEqual(domain(f).art_variants,before.art_variants.map(v=>({...v,updated_at:domain(f).art_variants.find(a=>a.variant_id===v.variant_id)!.updated_at})));
});
test('Invalid key rejects preview, occupied physical destination rejects before publication',async()=>{
    const f=await fixture(); assert.throws(()=>f.lifecycle.previewRename(f.id,{variant_key:'../bad',display_label:'Bad'}),errorCode('VARIANT_KEY_INVALID'));
    const destination=path.join(f.root,'Assets','Managed',f.card.cardId,'occupied','BS.png'); await mkdir(path.dirname(destination),{recursive:true}); await writeFile(destination,'occupied bytes');
    assert.equal(f.lifecycle.previewRename(f.id,{variant_key:'occupied',display_label:'Occupied'}).can_execute,false);
    // Refresh first to distinguish actual occupied destination from stale external changes.
    await f.service.assets!.scan(); await assert.rejects(rename(f,'occupied'),errorCode('VARIANT_DESTINATION_OCCUPIED')); assert.equal(await readFile(destination,'utf8'),'occupied bytes');
});
for(const kind of ['missing','invalid'] as const)test(`Managed ${kind} source stays ${kind} after key Rename`,async()=>{
    const f=await fixture(); const file=path.join(f.root,f.managed.managedRelativePath);
    if(kind==='missing')await unlink(file);else await writeFile(file,'opaque invalid material'); await f.service.assets!.scan();
    await rename(f); const slot=state(f).variants[0]!.roles.BS; assert.equal(slot.slot_state,kind==='missing'?'MISSING':'INVALID');
    const dest=path.join(f.root,'Assets','Managed',f.card.cardId,'renamed','BS.png'); if(kind==='missing')assert.equal(existsSync(dest),false);else assert.equal(await readFile(dest,'utf8'),'opaque invalid material');
});
test('Conflict candidates remain same through Rename; unrelated UNASSIGN/IGNORE stay untouched',async()=>{
    const f=await fixture(); const a=path.join(f.root,'Assets','13000001-Extra-OF-Default.png'); await writeFile(a,png(128));
    await writeFile(path.join(f.root,'Assets','13999999-Unassigned-BS-Default.png'),png(255)); await writeFile(path.join(f.root,'Assets','13999999-Ignored-BS-Default.png'),png(255));
    let s=await f.service.assetMutations!.refresh(); const unassigned=s.assets.find(a=>a.fileName.includes('Unassigned'))!; const ignored=s.assets.find(a=>a.fileName.includes('Ignored'))!;
    await f.service.assetMutations!.resolve({operation:'UNASSIGN',asset_id:unassigned.assetId,expected_state_token:s.expected_state_token});
    f.service.persistence!.runRepositoryOperation(db=>{db.prepare("INSERT INTO asset_resolution_overrides VALUES (?,'IGNORE',NULL,NULL,'r','now')").run(ignored.assetId);});
    await f.service.assets!.scan(); const candidates=state(f).variants[0]!.roles.OF.candidates!.map(a=>a.assetId).sort(); await rename(f); await f.service.assets!.scan();
    assert.equal(state(f).variants[0]!.roles.OF.slot_state,'CONFLICT'); assert.deepEqual(state(f).variants[0]!.roles.OF.candidates!.map(a=>a.assetId).sort(),candidates);
    assert.equal(disposition(f,unassigned.assetId),'UNASSIGN'); assert.equal(disposition(f,ignored.assetId),'IGNORE');
});
for(const op of ['rename','remove'] as const)test(`Stale ${op} rejects without lifecycle/filesystem/DB mutation`,async()=>{
    const f=await fixture(); const stale=token(f); f.lifecycle.setPreferred(f.card.cardId,null,stale); const before=domain(f); const files=await fileTree(path.join(f.root,'Assets'));
    await assert.rejects(op==='rename'?f.lifecycle.rename(f.id,{variant_key:'Renamed',display_label:'Renamed',expected_state_token:stale}):f.lifecycle.remove(f.id,{expected_state_token:stale}),errorCode('VARIANT_STATE_STALE'));
    assert.deepEqual(domain(f),before); assert.deepEqual(await fileTree(path.join(f.root,'Assets')),files);
});
test('Rename rejects real link/junction destinations on Windows and POSIX without touching source',async()=>{
    const f=await fixture(); const real=path.join(f.root,'external 日本語');await mkdir(real); const linked=path.join(f.root,'Assets','Managed',f.card.cardId,'linked');
    await symlink(real,linked,process.platform==='win32'?'junction':'dir'); const original=await readFile(path.join(f.root,f.managed.managedRelativePath));
    assert.throws(()=>f.lifecycle.previewRename(f.id,{variant_key:'linked',display_label:'Linked'}),errorCode('VARIANT_PATH_UNSAFE')); assert.deepEqual(await readFile(path.join(f.root,f.managed.managedRelativePath)),original);
    console.log(`RUN013 real junction executed platform=${process.platform}`);
});
test('Preferred Remove acknowledgement required; success clears preference atomically with no fallback',async()=>{
    const f=await fixture(); const other=(await f.service.managedAssets!.ingest({cardId:f.card.cardId,variantKey:'Other',role:'BS',sourceFile:f.source,idempotencyKey:'other'})).managedAsset;
    await assert.rejects(f.lifecycle.remove(f.id,{expected_state_token:token(f)}),errorCode('PREFERRED_CLEAR_ACK_REQUIRED')); assert.equal(state(f).variants.length,2); assert.equal(state(f).preferred_variant_id,f.id);
    const result=await f.lifecycle.remove(f.id,{expected_state_token:token(f),acknowledge_preferred_clear:true}); assert.equal(result.preferred_variant_id,null);assert.equal(result.variants.length,1);assert.equal(result.variants[0]!.variant_id,other.variantId);
    assert.ok(f.service.canonical!.getCard(f.card.cardId));
});
test('Remove preserves managed recovery bytes, unmanaged UNASSIGN, no false missing and no Rescan resurrection',async()=>{
    const f=await fixture();const managedBytes=await readFile(path.join(f.root,f.managed.managedRelativePath));const unmanagedBytes=await readFile(f.unmanaged);const asset=f.service.assets!.listAssets().find(a=>a.relativePath.endsWith('Unmanaged-OF-Default.png'))!;
    const result=await f.lifecycle.remove(f.id,{expected_state_token:token(f),acknowledge_preferred_clear:true}); assert.equal(result.variants.length,0);
    assert.equal(existsSync(path.join(f.root,f.managed.managedRelativePath)),false); assert.equal(f.service.managedAssets!.listManagedAssets().length,0);
    assert.ok('recovery_relative_path' in result);
    const recovered=readdirSync(path.join(f.root,result.recovery_relative_path!)).filter(p=>p.startsWith('retired-')); assert.equal(recovered.length,1);assert.deepEqual(await readFile(path.join(f.root,result.recovery_relative_path!,recovered[0]!)),managedBytes);
    assert.deepEqual(await readFile(f.unmanaged),unmanagedBytes);assert.equal(disposition(f,asset.assetId),'UNASSIGN');await f.service.assets!.scan();assert.equal(state(f).variants.length,0);
    assert.equal(f.service.libraryAssets!.getNeedsAttention().items.some(d=>d.relative_path===f.managed.managedRelativePath&&d.code==='MISSING_SOURCE'),false);
});
test('Remove non-Preferred preserves other Preferred, converts explicit ASSIGN to UNASSIGN and rejects grants',async()=>{
    const f=await fixture(); const other=(await f.service.managedAssets!.ingest({cardId:f.card.cardId,variantKey:'Other',role:'BS',sourceFile:f.source,idempotencyKey:'other'})).managedAsset;
    f.lifecycle.setPreferred(f.card.cardId,other.variantId,token(f));await rename(f);
    const a=f.service.assets!.listAssets().find(a=>a.variantId===f.id&&a.role==='OF')!;
    const grant=f.service.carderAssetGrants.issue({cardId:f.card.cardId,variantId:f.id,role:'OF',assetId:a.assetId,hash:a.contentHash!,composition:'STANDARD',revision:f.card.revision});
    await f.lifecycle.remove(f.id,{expected_state_token:token(f)});assert.equal(state(f).preferred_variant_id,other.variantId);assert.equal(disposition(f,a.assetId),'UNASSIGN');assert.equal(f.service.carderAssetGrants.verify(grant,a.assetId,a.contentHash!),null);
});
test('Rename safely revokes affected Carder grants even while preserving asset identity',async()=>{
    const f=await fixture();const a=f.service.assets!.listAssets().find(a=>a.role==='BS')!;
    const grant=f.service.carderAssetGrants.issue({cardId:f.card.cardId,variantId:f.id,role:'BS',assetId:a.assetId,hash:a.contentHash!,composition:'STANDARD',revision:f.card.revision});
    await rename(f);assert.equal(f.service.carderAssetGrants.verify(grant,a.assetId,a.contentHash!),null);
});
for(const operation of ['RENAME','REMOVE'] as const)for(const phase of ['stage','publication','database','reconciliation','postcondition'] as MutationPhase[])test(`${operation} injected ${phase} failure compensates complete domain and managed files`,async()=>{
    let armed=false;const f=await fixture({phase:p=>{if(armed&&p===phase)throw new Error('injected');}});const before=domain(f);const files=await fileTree(path.join(f.root,'Assets'));armed=true;
    await assert.rejects(operation==='RENAME'?rename(f):f.lifecycle.remove(f.id,{expected_state_token:token(f),acknowledge_preferred_clear:true}),errorCode('VARIANT_MUTATION_FAILED'));
    // Execution pre-scan legitimately advances scan metadata; lifecycle/ownership/binding/preference is unchanged.
    const after=domain(f);assert.deepEqual(after.art_variants.map(({updated_at,...r})=>r),before.art_variants.map(({updated_at,...r})=>r));assert.deepEqual(after.managed_assets,before.managed_assets);assert.deepEqual(after.asset_resolution_overrides,before.asset_resolution_overrides);assert.deepEqual(after.card_variant_preferences,before.card_variant_preferences);
    assert.deepEqual(await fileTree(path.join(f.root,'Assets')),files);assert.equal(f.service.status.state,'READY');
});
for(const operation of ['RENAME','REMOVE'] as const)test(`${operation} unprovable rollback fences runtime, persists across restart and validated Restore resolves marker`,async()=>{
    let armed=false;const f=await fixture({phase:p=>{if(armed&&['database','rollback'].includes(p))throw new Error('injected');}});const backup=await f.service.recovery.create('FULL');armed=true;
    await assert.rejects(operation==='RENAME'?rename(f):f.lifecycle.remove(f.id,{expected_state_token:token(f),acknowledge_preferred_clear:true}),errorCode('VARIANT_MUTATION_RECOVERY_REQUIRED'));assert.equal(f.service.status.state,'RECOVERY_REQUIRED');await f.service.close();
    const reopened=await createWorkspaceService({workspaceRoot:f.root,host:'127.0.0.1',port:4312});services.push(reopened);assert.equal(reopened.status.state,'RECOVERY_REQUIRED');
    await reopened.recovery.restore(backup.backup_id);assert.equal(reopened.status.state,'READY');assert.equal(reopened.variantLifecycle!.getState(f.card.cardId).variants[0]!.variant_key,'default');
});
for(const existingPreference of [false,true])test(`Failed first explicit Ingest restores ${existingPreference?'existing null preference revision':'absence of preference row'}`,async()=>{
    const f=await setup();
    if(existingPreference)f.service.persistence!.runRepositoryOperation(db=>db.prepare('INSERT INTO card_variant_preferences VALUES (?,NULL,?,?)').run(f.card.cardId,'previous-revision','previous-time'));
    const before=domain(f).card_variant_preferences; const delegate=f.service.assets!;
    let calls=0;
    const proxy={scan:async()=>{const result=await delegate.scan();calls++;return calls===2?{...result,variants:[]}:result;},listVariants:(id?:string)=>delegate.listVariants(id)};
    const failing=new ManagedAssetIngestService(f.root,f.service.persistence!,proxy as never);
    await assert.rejects(failing.ingest({cardId:f.card.cardId,variantKey:'Default',role:'BS',sourceFile:f.source,idempotencyKey:'compensated-first'}),/compensated/);
    assert.deepEqual(domain(f).card_variant_preferences,before);assert.equal(state(f).variants.length,0);assert.equal(state(f).preferred_variant_id,null);
});
for(const operation of ['RENAME','REMOVE'] as const)test(`${operation} revalidates changed physical managed bytes and rejects stale preview before structural mutation`,async()=>{
    const f=await fixture(); const old=token(f); const file=path.join(f.root,f.managed.managedRelativePath); await writeFile(file,png(255,[30,40,50]));
    const before=domain(f);
    await assert.rejects(operation==='RENAME'?f.lifecycle.rename(f.id,{variant_key:'Renamed',display_label:'Renamed',expected_state_token:old}):f.lifecycle.remove(f.id,{expected_state_token:old,acknowledge_preferred_clear:true}),errorCode('VARIANT_STATE_STALE'));
    assert.deepEqual(domain(f).managed_assets,before.managed_assets);assert.deepEqual(domain(f).card_variant_preferences,before.card_variant_preferences);assert.equal(state(f).variants[0]!.variant_key,'default');assert.deepEqual(await readFile(file),png(255,[30,40,50]));assert.equal(existsSync(path.join(f.root,'Temp','VariantLifecycle')),false);
});
test('Exclusive maintenance fences lifecycle mutations while previews use ordinary read lease',async()=>{
    const f=await fixture(); const release=f.service.runtime.maintenance.acquireMaintenance('BACKUP');
    assert.ok(f.lifecycle.previewRename(f.id,{variant_key:'Renamed',display_label:'Renamed'}));
    assert.throws(()=>f.lifecycle.setPreferred(f.card.cardId,null,token(f)),(e:unknown)=>(e as {code:string}).code==='WORKSPACE_MAINTENANCE_ACTIVE');
    assert.throws(()=>rename(f),(e:unknown)=>(e as {code:string}).code==='WORKSPACE_MAINTENANCE_ACTIVE');
    assert.throws(()=>f.lifecycle.remove(f.id,{expected_state_token:token(f),acknowledge_preferred_clear:true}),(e:unknown)=>(e as {code:string}).code==='WORKSPACE_MAINTENANCE_ACTIVE');release();
});
test('Lifecycle HTTP contracts expose preference/token/preview and stable errors with READY fencing',async()=>{
    const f=await fixture();const variants=await f.service.app.inject({method:'GET',url:`/api/v1/library/cards/${f.card.cardId}/variants`});assert.equal(variants.json().preferred_variant_id,f.id);assert.equal(variants.json().expected_state_token,token(f));
    const preview=await f.service.app.inject({method:'POST',url:`/api/v1/library/variants/${f.id}/rename-preview`,payload:{variant_key:'Other',display_label:'Other'}});assert.equal(preview.statusCode,200);assert.equal(preview.json().can_execute,true);
    const stale=await f.service.app.inject({method:'POST',url:`/api/v1/library/variants/${f.id}/rename`,payload:{variant_key:'Other',display_label:'Other',expected_state_token:'stale'}});assert.equal(stale.statusCode,409);assert.equal(stale.json().code,'VARIANT_STATE_STALE');
    const ack=await f.service.app.inject({method:'POST',url:`/api/v1/library/variants/${f.id}/remove`,payload:{expected_state_token:token(f)}});assert.equal(ack.statusCode,422);assert.equal(ack.json().code,'PREFERRED_CLEAR_ACK_REQUIRED');
});
