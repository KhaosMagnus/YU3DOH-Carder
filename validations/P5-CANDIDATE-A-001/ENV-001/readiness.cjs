const fs = require('node:fs');
const path = require('node:path');
const base = path.resolve(__dirname, '../candidate-a');
const { bootstrapWorkspaceDatabase } = require(base+'/workspace-server/src/persistence/operations.ts');
const { createWorkspaceService } = require(base+'/workspace-server/src/service.ts');
async function main(){
 const root=path.join(__dirname,'disposable-workspace'); fs.mkdirSync(root,{recursive:true});
 const manifest={workspace_id:'env-001-smoke',workspace_format_version:1,database_path:'Data/workspace.db',created_at:new Date().toISOString()};
 fs.writeFileSync(path.join(root,'workspace.json'),JSON.stringify(manifest,null,2));
 if(!fs.existsSync(path.join(root,manifest.database_path))) bootstrapWorkspaceDatabase(root,manifest);
 const service=await createWorkspaceService({workspaceRoot:root,host:'127.0.0.1',port:4312},{logger:true});
 const fixture=fs.existsSync(path.join(__dirname,'fixture.json'))?JSON.parse(fs.readFileSync(path.join(__dirname,'fixture.json'),'utf8')):service.canonical.createCard({family:'MONSTER',password:'10000001'});
 fs.writeFileSync(path.join(__dirname,'fixture.json'),JSON.stringify(fixture,null,2));
 const captured=new Map();
 service.app.addHook('preHandler',async(req)=>{captured.set(req.id,{timestamp:new Date().toISOString(),method:req.method,url:req.url,request_body:req.body??null});});
 service.app.addHook('onSend',async(req,reply,payload)=>{
  const row={...captured.get(req.id),status:reply.statusCode,response_body:typeof payload==='string'?payload:'[stream/binary]'};
  fs.appendFileSync(path.join(__dirname,'http-trace.jsonl'),JSON.stringify(row)+'\n'); captured.delete(req.id); return payload;
 });
 await service.app.listen({host:'127.0.0.1',port:4312});
 console.log(JSON.stringify({root,status:service.status,fixture_id:fixture.cardId}));
 const health=await fetch('http://127.0.0.1:4312/api/v1/workspace/status');
 fs.writeFileSync(path.join(__dirname,'health.json'),JSON.stringify({status:health.status,body:await health.json()},null,2));
 const detail=await fetch('http://127.0.0.1:4312/api/v1/library/cards/'+fixture.cardId);
 fs.writeFileSync(path.join(__dirname,'canonical.json'),JSON.stringify({status:detail.status,body:await detail.json()},null,2));
 if(process.env.ENV_READINESS_ONESHOT==='1'){await service.close();return;}
 for(const signal of ['SIGINT','SIGTERM'])process.once(signal,async()=>{await service.close();process.exit(0)});
}
main().catch(e=>{console.error(e);process.exitCode=1});
