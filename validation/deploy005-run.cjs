const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {spawn,execFileSync}=require('node:child_process');
const out=process.env.DEPLOY005_OUTPUT,root=process.env.CANDIDATE_ROOT,base=process.env.YU3DOH_QA_BASELINE_ROOT;
const children=[]; const roots=[];
const save=(n,x)=>fs.writeFileSync(path.join(out,n),JSON.stringify(x,null,2));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function start(name,cmd,args,cwd){const fd=fs.openSync(path.join(out,name+'.log'),'w');const c=spawn(cmd,args,{cwd,env:process.env,stdio:['ignore',fd,fd]});children.push({name,c,fd});return c;}
async function ready(url){for(let i=0;i<240;i++){try{const r=await fetch(url);if(r.ok)return r;}catch{}await wait(250);}throw Error('Readiness timeout '+url);}
async function main(){
 save('environment.json',{control:'ff89d489cb225ba10775617dd07aee31c372f4ac',candidate:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),baseline:execFileSync('git',['rev-parse','HEAD'],{cwd:base,encoding:'utf8'}).trim(),harness:process.env.GITHUB_SHA,branch:process.env.GITHUB_REF,run:process.env.GITHUB_RUN_ID,job:process.env.GITHUB_JOB,runner:process.env.RUNNER_NAME,image:process.env.ImageOS,imageVersion:process.env.ImageVersion,node:process.version,yarn:execFileSync('yarn',['--version'],{encoding:'utf8'}).trim(),os:os.release(),osRelease:fs.readFileSync('/etc/os-release','utf8'),chrome:execFileSync('google-chrome',['--version'],{encoding:'utf8'}).trim(),migrations:execFileSync('git',['ls-tree','-r','--name-only','HEAD','workspace-server'],{cwd:root,encoding:'utf8'}).split('\n').filter(x=>/\d{3}_.*\.sql$/.test(x))});
 let failure;
 try{
 start('fixture','node',['scripts/run025-qa-fixture.cjs'],root);
 start('empty-fixture','node',[path.join(__dirname,'deploy005-empty-fixture.cjs')],root);
 for(const port of [4312,4313]){const info=await (await ready(`http://127.0.0.1:${port}/api/v1/workspace/_qa/info`)).json();roots.push(info.root);save('fixture-'+port+'.json',info);}
 start('vite','node',['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','3000'],root);
 start('baseline-vite','node',[path.join(root,'node_modules/vite/bin/vite.js'),'--host','127.0.0.1','--port','3001'],base);
 await ready('http://127.0.0.1:3000/ygocarder/library/');await ready('http://127.0.0.1:3001/ygocarder/library/');
 const c=start('browser','node',[path.join(__dirname,'deploy005-browser.cjs')],root);
 const code=await new Promise(r=>c.on('exit',r));save('browser-exit.json',{code});if(code!==0)throw Error('Browser harness exited '+code);
 }catch(e){failure=e;save('runtime-failure.json',{message:e.message,stack:e.stack});}
 finally{
 for(const port of [4312,4313]){try{save('workspace-final-'+port+'.json',await (await fetch(`http://127.0.0.1:${port}/api/v1/workspace/_qa/snapshot`)).json());}catch{}}
 for(const {c} of children)if(c.exitCode===null)c.kill('SIGTERM');
 for(let i=0;i<40&&children.some(({c})=>c.exitCode===null&&c.signalCode===null);i++)await wait(250);
 const cleanup=roots.map(root=>({root,removed:!fs.existsSync(root)}));save('fixture-cleanup.json',{roots:cleanup,children:children.map(({name,c})=>({name,exitCode:c.exitCode,signal:c.signalCode}))});
 if(cleanup.length!==2||cleanup.some(x=>!x.removed))failure ||= Error('Fixture cleanup incomplete');
 save('final-status.json',{status:failure?'VALIDATION BLOCKED':'EVIDENCE READY',error:failure?.message,officialQAVerdict:null});
 }if(failure)throw failure;
}
main().catch(e=>{console.error(e);process.exitCode=1});
