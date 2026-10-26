const fs=require('node:fs'); const path=require('node:path');
const base=path.resolve(__dirname,'../run-024');
const {bootstrapWorkspaceDatabase}=require(base+'/workspace-server/dist/src/persistence/operations.js');
const {createWorkspaceService}=require(base+'/workspace-server/dist/src/service.js');
(async()=>{
const root=path.join(__dirname,'neutral-workspace');fs.mkdirSync(root,{recursive:true});
const manifest={workspace_id:'env-003-neutral-readiness',workspace_format_version:1,database_path:'Data/workspace.db',created_at:new Date().toISOString()};
fs.writeFileSync(root+'/workspace.json',JSON.stringify(manifest,null,2));bootstrapWorkspaceDatabase(root,manifest);
const service=await createWorkspaceService({workspaceRoot:root,host:'127.0.0.1',port:4312},{logger:true});
const created=service.canonical.createCard({family:'SPELL',password:'12990003'});
const fixture=service.canonical.mutateCard(created.cardId,created.revision,{structure:{kind:'SPELL',subtypeCode:'CONTINUOUS'},localizations:[{language:'EN',name:'ENV003 Neutral Smoke',cardText:'Disposable environment fixture only.',pendulumText:null}],confirmations:['STRUCTURE','TEXT:EN'].map(block=>({block,state:'CONFIRMED',provenance:{sourceKind:'MANUAL',sourceRef:'env-003-neutral-readiness'}}))});
fs.writeFileSync(__dirname+'/fixture.json',JSON.stringify(fixture,null,2));
service.app.addHook('onSend',async(req,reply,payload)=>{fs.appendFileSync(__dirname+'/http-trace.jsonl',JSON.stringify({timestamp:new Date().toISOString(),method:req.method,url:req.url,request_body:req.body??null,status:reply.statusCode,response_body:typeof payload==='string'?payload:'[binary/stream]'})+'\n');return payload;});
await service.app.listen({host:'127.0.0.1',port:4312});
for(const [name,url] of [['workspace-status','/api/v1/workspace/status'],['canonical-before','/api/v1/library/cards/'+fixture.cardId],['canonical-after','/api/v1/library/cards/'+fixture.cardId]]){let r=await fetch('http://127.0.0.1:4312'+url);fs.writeFileSync(__dirname+'/'+name+'.json',JSON.stringify({status:r.status,body:await r.json()},null,2));}
console.log('ENV003_SERVICE_LISTENING');for(const signal of ['SIGINT','SIGTERM'])process.once(signal,async()=>{await service.close();process.exit(0)});
})().catch(e=>{console.error(e);process.exitCode=1});
