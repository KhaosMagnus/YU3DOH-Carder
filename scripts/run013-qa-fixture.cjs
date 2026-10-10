/* Isolated QA harness only. Never opens a user Workspace. No production routes/hooks are changed. */
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { deflateSync } = require('node:zlib');
const { bootstrapWorkspaceDatabase } = require('../workspace-server/dist/src/persistence/operations');
const { createWorkspaceService } = require('../workspace-server/dist/src/service');
const crc32 = data => {
    let crc = 0xffffffff;
    for (const byte of data) { crc ^= byte; for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0); }
    return (crc ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
    const name = Buffer.from(type); const result = Buffer.alloc(12 + data.length);
    result.writeUInt32BE(data.length); name.copy(result, 4); data.copy(result, 8);
    result.writeUInt32BE(crc32(Buffer.concat([name, data])), 8 + data.length); return result;
};
const png = (alpha, red = 20) => {
    const header = Buffer.alloc(13); header.writeUInt32BE(2, 0); header.writeUInt32BE(2, 4); header[8] = 8; header[9] = 6;
    return Buffer.concat([Buffer.from('89504e470d0a1a0a', 'hex'), chunk('IHDR', header),
        chunk('IDAT', deflateSync(Buffer.from([0, red, 40, 60, alpha, red, 40, 60, alpha, 0, red, 40, 60, alpha, red, 40, 60, alpha]))), chunk('IEND', Buffer.alloc(0))]);
};
async function run() {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'yu3doh RUN013 QA 日本語 '));
    const manifest={workspace_id:'run013-isolated-qa',workspace_format_version:1,database_path:'Data/workspace.db',created_at:new Date().toISOString(),name:'RUN 013 disposable QA'};
    await fs.writeFile(path.join(root,'workspace.json'),JSON.stringify(manifest));bootstrapWorkspaceDatabase(root,manifest);
    let fault='';
    const service=await createWorkspaceService({workspaceRoot:root,host:'127.0.0.1',port:4312},{lifecycleHooks:{phase:p=>{
        if(['operation','recovery'].includes(fault)&&p==='database')throw new Error('RUN013 isolated database fault');
        if(fault==='recovery'&&p==='rollback')throw new Error('RUN013 isolated rollback fault');
    }}});
    const write=async(relative,bytes)=>{const file=path.join(root,relative);await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,bytes);return file;};
    const sources={bs:await write('Sources/BS art 日本語.png',png(255)),bg:await write('Sources/BG art 日本語.png',png(255,80)),of:await write('Sources/OF art 日本語.png',png(128))};
    const cards={};const card=(name,password)=>{const c=service.canonical.createCard({family:'SPELL',password});
        const confirmed=service.canonical.mutateCard(c.cardId,c.revision,{structure:{kind:'SPELL',subtypeCode:'NORMAL'},localizations:[{language:'EN',name:`QA ${name}`,cardText:'RUN013 fixture.',pendulumText:null}],confirmations:['STRUCTURE','TEXT:EN'].map(block=>({block,state:'CONFIRMED',provenance:{sourceKind:'MANUAL',sourceRef:'run013-isolated'}}))});cards[name]=confirmed.cardId;return confirmed.cardId;};
    const managedCard=card('Managed','13000001');const managed={};
    for(const role of ['BS','BG','OF'])managed[role]=(await service.managedAssets.ingest({cardId:managedCard,variantKey:'Default',role,sourceFile:sources[role.toLowerCase()],idempotencyKey:role})).managedAsset;
    const other=(await service.managedAssets.ingest({cardId:managedCard,variantKey:'Other',role:'BS',sourceFile:sources.bs,idempotencyKey:'other'})).managedAsset;
    card('Sole','13000002');await write('Assets/13000002-Sole-BS-Default.png',png(255));
    card('Unmanaged','13000003');const unmanaged=[];
    for(const role of ['BS','OF'])unmanaged.push(await write(`Assets/13000003-Original-${role}-Default.png`,png(role==='OF'?128:255)));
    await write('Assets/13000003-Other-BS-Other.png',png(255));
    const brokenCard=card('Broken','13000004');const broken=(await service.managedAssets.ingest({cardId:brokenCard,variantKey:'Default',role:'BS',sourceFile:sources.bs,idempotencyKey:'broken'})).managedAsset;
    await service.managedAssets.ingest({cardId:brokenCard,variantKey:'Other',role:'BS',sourceFile:sources.bs,idempotencyKey:'broken-other'});await fs.unlink(path.join(root,broken.managedRelativePath));
    const recoveryCard=card('Recovery','13000005');const recovery=(await service.managedAssets.ingest({cardId:recoveryCard,variantKey:'Default',role:'BS',sourceFile:sources.bs,idempotencyKey:'recovery'})).managedAsset;
    await service.assetMutations.refresh();
    const info={root,cards,sources,managed,other,unmanaged,broken,recovery};
    service.app.get('/_qa/info',async()=>info);
    service.app.post('/_qa/fault/:kind',async request=>{const kind=request.params.kind;if(!['none','operation','recovery'].includes(kind))throw new Error('Unknown fault');fault=kind==='none'?'':kind;return{fault};});
    service.app.post('/_qa/stale',async()=>{const s=service.variantLifecycle.getState(cards.Managed);const id=s.preferred_variant_id===other.variantId?managed.BS.variantId:other.variantId;return service.variantLifecycle.setPreferred(cards.Managed,id,s.expected_state_token);});
    service.app.get('/_qa/domain',async()=>{
        const tables=['art_variants','asset_index_scans','indexed_asset_files','managed_assets','managed_asset_ingest_requests','asset_resolution_overrides','variant_role_bindings','asset_index_diagnostics','card_variant_preferences'];
        const db=service.persistence.runRepositoryOperation(database=>Object.fromEntries(tables.map(t=>[t,database.prepare(`SELECT * FROM ${t}`).all()])));
        const files=[];const walk=async(dir)=>{for(const e of await fs.readdir(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory())await walk(f);else files.push([path.relative(root,f),(await fs.readFile(f)).toString('base64')]);}};await walk(path.join(root,'Assets'));
        const recovery=await fs.readdir(path.join(root,'Temp','VariantLifecycle')).catch(()=>[]);return{db,files:files.sort((a,b)=>a[0].localeCompare(b[0])),recovery:recovery.sort(),grants:service.carderAssetGrants.size()};
    });
    service.app.get('/_qa/recovery-files',async()=>{const files=[];const start=path.join(root,'Temp','VariantLifecycle');
        const walk=async(dir)=>{for(const e of await fs.readdir(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory())await walk(f);else if(e.name.startsWith('retired-'))files.push([path.relative(root,f),(await fs.readFile(f)).toString('base64')]);}};if(await fs.stat(start).catch(()=>false))await walk(start);return{files};});
    await service.app.listen({host:'127.0.0.1',port:4312});console.log(JSON.stringify({ready:true,...info}));
    for(const signal of ['SIGINT','SIGTERM'])process.once(signal,async()=>{await service.close();await fs.rm(root,{recursive:true,force:true});process.exit(0);});
}
run().catch(error=>{console.error(error);process.exitCode=1;});
