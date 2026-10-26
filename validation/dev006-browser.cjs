const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { spawn, execFileSync } = require('node:child_process');
const { deflateSync } = require('node:zlib');
const { chromium } = require('playwright-core');

const candidateRoot = path.resolve(process.env.CANDIDATE_ROOT || '');
const output = path.resolve(process.env.DEV006_OUTPUT || path.join(os.tmpdir(), 'dev006-evidence'));
const workspaceRoot = path.resolve(process.env.DEV006_WORKSPACE || path.join(os.tmpdir(), 'dev006-workspace'));
const expectedSha = 'e07140d5a9555a17b7b2306a45625c14adfafc8e';
const candidateBranch = 'feature/workspace-run-024';
const children = [];
const network = [];
const pending = [];
let browser;
let service;
let cardId = null;
let errorText = null;

const runGit = (...args) => execFileSync('git', ['-C', candidateRoot, ...args], { encoding: 'utf8' }).trim();
const save = async (name, data) => fs.writeFile(path.join(output, name), typeof data === 'string' ? data : JSON.stringify(data, null, 2));

const crc32 = data => {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const name = Buffer.from(type);
  const result = Buffer.alloc(12 + data.length);
  result.writeUInt32BE(data.length);
  name.copy(result, 4);
  data.copy(result, 8);
  result.writeUInt32BE(crc32(Buffer.concat([name, data])), 8 + data.length);
  return result;
};
const png = (red = 70, alpha = 255) => {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(2, 0);
  header.writeUInt32BE(2, 4);
  header[8] = 8;
  header[9] = 6;
  const pixels = Buffer.from([0, red, 40, 60, alpha, red, 40, 60, alpha, 0, red, 40, 60, alpha, red, 40, 60, alpha]);
  return Buffer.concat([
    Buffer.from('89504e470d0a1a0a', 'hex'),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(pixels)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
};

const waitReady = async url => {
  const deadline = Date.now() + 60000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  throw new Error('Readiness timeout: ' + url);
};

const spawnLogged = async (name, command, args, cwd) => {
  const logPath = path.join(output, name + '.log');
  const handle = await fs.open(logPath, 'w');
  const child = spawn(command, args, { cwd, env: process.env, stdio: ['ignore', 'pipe', 'pipe'] });
  children.push(child);
  child.stdout.on('data', data => handle.write(data));
  child.stderr.on('data', data => handle.write(data));
  child.once('exit', () => handle.close());
  return child;
};

const canonical = async () => {
  const response = await fetch('http://127.0.0.1:4312/api/v1/library/cards/' + cardId);
  const body = await response.text();
  assert.equal(response.status, 200, body);
  return JSON.parse(body);
};

const cases = [];
const allCodes = ['1','2','3','4','6','7','8','9'];
const baseUrl = 'http://127.0.0.1:3000/ygocarder/library/';
let activePage;
const http = async (url, options) => { const r = await fetch('http://127.0.0.1:4312/api/v1/'+url,options); const body=await r.json(); assert.equal(r.status,200,JSON.stringify(body));return body; };
async function main() {
  await fs.mkdir(output,{recursive:true});
  await fs.mkdir(workspaceRoot,{recursive:true});
  assert.equal(runGit('rev-parse','HEAD'),expectedSha);
  assert.equal(runGit('status','--porcelain'),'');
  await save('environment.json',{node:process.version,yarn:execFileSync('yarn',['--version'],{encoding:'utf8'}).trim(),osRelease:await fs.readFile('/etc/os-release','utf8'),playwright:require('playwright-core/package.json').version,run:process.env.GITHUB_RUN_ID,candidate:expectedSha,control:'a778a81928b75ccf910518a1faeba99f46421caf'});
  const {bootstrapWorkspaceDatabase}=require(path.join(candidateRoot,'workspace-server/dist/src/persistence/operations'));
  const {createWorkspaceService}=require(path.join(candidateRoot,'workspace-server/dist/src/service'));
  const manifest={workspace_id:'dev006-disposable',workspace_format_version:1,database_path:'Data/workspace.db',created_at:new Date().toISOString(),name:'DEV006 disposable'};
  await fs.writeFile(path.join(workspaceRoot,'workspace.json'),JSON.stringify(manifest));
  bootstrapWorkspaceDatabase(workspaceRoot,manifest);
  service=await createWorkspaceService({workspaceRoot,host:'127.0.0.1',port:4312});
  const structure={kind:'MONSTER',summonKind:'LINK',attributeCode:'DARK',raceCode:'CYBERSE',level:null,rank:null,atk:1800,def:null,pendulumScale:null,abilities:['EFFECT'],linkMarkers:['1','4','9']};
  let serial=24000000;
  const create=(name,struct=structure)=>{
    const c=service.canonical.createCard({family:'MONSTER',password:String(++serial)});
    return service.canonical.mutateCard(c.cardId,c.revision,{structure:struct,localizations:[{language:'EN',name,cardText:'Disposable RUN024 fixture.',pendulumText:null}],confirmations:['STRUCTURE','TEXT:EN'].map(block=>({block,state:'CONFIRMED',provenance:{sourceKind:'MANUAL',sourceRef:'dev006-fixture'}}))}).cardId;
  };
  const cards={link:create('DEV006 Link'),nonlink:create('DEV006 Nonlink',{...structure,summonKind:'MAIN_DECK',level:4,def:1200,abilities:['EFFECT','PENDULUM'],pendulumScale:2,linkMarkers:[]}),incomplete:create('DEV006 Incomplete'),standard:create('DEV006 Standard'),ready:create('DEV006 Ready'),sole:create('DEV006 Sole'),multiple:create('DEV006 Multiple')};
  const sourceFile=path.join(workspaceRoot,'solid.png'),ofFile=path.join(workspaceRoot,'transparent.png');
  await fs.writeFile(sourceFile,png());await fs.writeFile(ofFile,png(100,128));
  const ingest=async(id,key,role)=>service.managedAssets.ingest({cardId:id,variantKey:key,role,sourceFile:role==='OF'?ofFile:sourceFile,idempotencyKey:id+key+role});
  await ingest(cards.incomplete,'Preferred','BG'); await ingest(cards.incomplete,'Alternate','BS');await ingest(cards.incomplete,'Alternate','OF');
  await ingest(cards.standard,'Preferred','BS');
  await ingest(cards.ready,'Preferred','BS');await ingest(cards.ready,'Preferred','OF');
  await ingest(cards.sole,'Sole','BS');
  await ingest(cards.multiple,'First','BS');await ingest(cards.multiple,'Second','BS');
  for(const id of [cards.sole,cards.multiple]) {const st=service.variantLifecycle.getState(id);service.variantLifecycle.setPreferred(id,null,st.expected_state_token);}
  await service.app.listen({host:'127.0.0.1',port:4312});
  await spawnLogged('runtime-vite',process.execPath,[path.join(candidateRoot,'node_modules/vite/bin/vite.js'),'--host','127.0.0.1','--port','3000','--strictPort'],candidateRoot);
  await waitReady(baseUrl);
  const status=await http('workspace/status');assert.equal(status.database_schema_version,8);assert.equal(status.workspace_format_version,1);await save('workspace-status.json',status);
  const initial={};for(const [key,id] of Object.entries(cards))initial[key]=await http('library/cards/'+id);
  await save('canonical-before.json',initial);await save('fixture-ids.json',cards);
  browser=await chromium.launch({headless:true,args:['--no-sandbox']});await save('browser.json',{version:browser.version(),executable:chromium.executablePath()});
  const context=await browser.newContext({viewport:{width:1440,height:1100}});
  const errors=[];context.on('page',p=>p.on('pageerror',e=>errors.push(String(e))));
  await context.route('**/api/v1/**',async route=>{const r=route.request();network.push({event:'request',method:r.method(),url:r.url(),body:r.postData(),action:'continue-unmodified'});await route.continue();});
  context.on('response',r=>{if(r.url().includes('/api/v1/'))pending.push((async()=>{let body;try{body=await r.text();}catch(e){body=String(e);}network.push({event:'response',url:r.url(),status:r.status(),body});})());});
  let page=await context.newPage();activePage=page;
  const open=async(name,edit=false)=>{
    await page.goto(baseUrl);await page.locator('.library-card').filter({hasText:name}).click();
    const drawer=page.locator('.ant-drawer:visible');await drawer.getByRole('button',{name:'Edit',exact:true}).waitFor();
    if(edit)await drawer.getByRole('button',{name:'Edit',exact:true}).click();
    return drawer;
  };
  const writes=()=>network.filter(e=>e.event==='request'&&!['GET','HEAD'].includes(e.method)).length;
  const working=()=>page.locator('.library-editor-form').evaluate(el=>{
    let f=el[Object.keys(el).find(k=>k.startsWith('__reactFiber$'))];
    while(f){if(f.memoizedProps?.working)return JSON.parse(JSON.stringify(f.memoizedProps.working));f=f.return;}throw Error('Working props not found');
  });
  const markers=()=>page.locator('[data-marker-code][aria-pressed="true"]').evaluateAll(ns=>ns.map(n=>n.dataset.markerCode));
  const saveButton=()=>page.getByRole('button',{name:'Save',exact:true});
  const rating=()=>page.locator('label').filter({hasText:'Link Rating (derived)'}).locator('input').inputValue();
  const snapshot=async(name)=>{
    await page.screenshot({path:path.join(output,name+'.png'),fullPage:true,animations:'disabled'});
    await save(name+'-dom.html',await page.content());await save(name+'-aria.yml',await page.locator('body').ariaSnapshot());
    const state={url:page.url(),controls:await page.locator('button,input,[role="combobox"]').evaluateAll(ns=>ns.map(n=>({tag:n.tagName,label:n.getAttribute('aria-label'),text:n.textContent,value:n.value,disabled:n.disabled,pressed:n.getAttribute('aria-pressed'),code:n.dataset.markerCode,focused:document.activeElement===n,outline:getComputedStyle(n).outline}))),working:await page.locator('.library-editor-form').count()?await working():null};
    await save(name+'-state.json',state);return state;
  };
  const done=async(id,data={})=>{cases.push({id,status:'PASS',...data});await save('cases.json',cases);};
  const selectSummon=async(value)=>{await page.locator('label').filter({hasText:'Summon kind'}).locator('.ant-select').click();await page.locator('.ant-select-item-option').filter({hasText:new RegExp('^'+value+'$')}).click();};
  await open('DEV006 Link',true);
  assert.deepEqual(await markers(),['1','4','9']);assert.equal(await rating(),'3');assert.equal(await saveButton().isDisabled(),true);
  assert.deepEqual((await working()).structure.link_markers,initial.link.structure.link_markers);
  const positions=await page.locator('[data-marker-code]').evaluateAll(ns=>ns.map(n=>({code:n.dataset.markerCode,row:getComputedStyle(n).gridRowStart,column:getComputedStyle(n).gridColumnStart})));
  assert.deepEqual(positions.map(p=>[p.code,p.row,p.column]),[['1','1','1'],['2','1','2'],['3','1','3'],['4','2','1'],['6','2','3'],['7','3','1'],['8','3','2'],['9','3','3']]);
  assert.equal(await page.locator('[data-marker-code="5"]').count(),0);await snapshot('T1-OP-01');await done('T1-OP-01',{authoritative:initial.link.structure,positions});
  let count=writes();await page.locator('[data-marker-code="2"]').click();assert.deepEqual(await markers(),['1','2','4','9']);assert.equal(await rating(),'4');assert.equal(await saveButton().isDisabled(),false);await snapshot('T1-OP-02-added');
  await page.locator('[data-marker-code="2"]').click();assert.equal(await rating(),'3');assert.equal(await saveButton().isDisabled(),true);assert.equal(writes(),count);await snapshot('T1-OP-02-restored');await done('T1-OP-02');
  // Reach the first marker using Tab only, then prove every next target.
  await page.keyboard.press('Control+Home');
  let found=false;for(let n=0;n<150;n++){await page.keyboard.press('Tab');if(await page.evaluate(()=>document.activeElement?.getAttribute('data-marker-code'))==='1'){found=true;break;}}assert.ok(found);
  const focus=[];for(let i=0;i<allCodes.length;i++){const code=allCodes[i];assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('data-marker-code')),code);focus.push(code);if(i===0){const before=await markers();await page.keyboard.press('Space');assert.equal(await page.locator('[data-marker-code="1"]').getAttribute('aria-pressed'),'false');assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('data-marker-code')),'1');await snapshot('T1-OP-03-focus');const outline=await page.locator('[data-marker-code="1"]').evaluate(n=>getComputedStyle(n).outlineWidth);assert.notEqual(outline,'0px');await page.keyboard.press('Enter');assert.deepEqual(await markers(),before);assert.equal(await saveButton().isDisabled(),true);}if(i<7)await page.keyboard.press('Tab');}
  await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('data-marker-code')),null);assert.equal(writes(),count);await done('T1-OP-03',{focusOrder:focus,activation:['Space','Enter']});
  await selectSummon('MAIN_DECK');let dialog=page.getByRole('dialog',{name:'Confirm structural clearing'});assert.ok((await dialog.innerText()).includes('link_markers'));await snapshot('T1-OP-04-proposal');await dialog.getByRole('button',{name:'Cancel',exact:true}).click();assert.deepEqual(await markers(),['1','4','9']);assert.equal((await working()).structure.summon_kind,'LINK');
  await selectSummon('MAIN_DECK');await dialog.getByRole('button',{name:'Apply change and clear',exact:true}).click();assert.equal(await page.locator('[data-marker-code]').count(),0);assert.deepEqual((await working()).structure.link_markers,[]);assert.equal(writes(),count);await snapshot('T1-OP-04-cleared');
  await open('DEV006 Nonlink',true);count=writes();await selectSummon('LINK');dialog=page.getByRole('dialog',{name:'Confirm structural clearing'});const clearing=await dialog.innerText();for(const name of ['level','def','abilities.PENDULUM','pendulum_scale'])assert.ok(clearing.includes(name));await snapshot('T1-OP-04-incoming');await dialog.getByRole('button',{name:'Cancel',exact:true}).click();assert.equal((await working()).structure.level,4);await selectSummon('LINK');await dialog.getByRole('button',{name:'Apply change and clear',exact:true}).click();assert.deepEqual(await markers(),[]);assert.equal(await rating(),'0');assert.equal(writes(),count);await snapshot('T1-OP-04-empty-link');await done('T1-OP-04');
  await open('DEV006 Link',true);count=writes();await page.locator('[data-marker-code="2"]').click();await saveButton().click();dialog=page.getByRole('dialog',{name:'Confirmed block modification'});await snapshot('T1-OP-05-confirm');assert.ok((await dialog.innerText()).includes('STRUCTURE'));await dialog.getByRole('button',{name:'Cancel',exact:true}).click();assert.equal(writes(),count);assert.deepEqual(await http('library/cards/'+cards.link),initial.link);
  await saveButton().click();const saved=page.waitForResponse(r=>r.request().method()==='PATCH'&&r.url().endsWith('/cards/'+cards.link));await dialog.getByRole('button',{name:'Move to Draft and Save',exact:true}).click();const response=await saved;assert.equal(response.status(),200);const payload=response.request().postDataJSON();assert.deepEqual(Object.keys(payload).sort(),['confirmations','expected_revision','structure']);assert.equal('link_rating' in payload.structure,false);assert.deepEqual(payload.confirmations,[{block:'STRUCTURE',state:'DRAFT'}]);
  const after=await http('library/cards/'+cards.link);assert.deepEqual([...after.structure.link_markers].sort(),['1','2','4','9']);assert.equal(after.structure.link_rating,4);assert.equal(after.confirmations.find(c=>c.block==='STRUCTURE').state,'DRAFT');await save('T1-OP-05-request-response.json',{payload,response:await response.json(),authoritative:after});await snapshot('T1-OP-05-saved');await done('T1-OP-05');
  const panel=()=>page.locator('.library-open-carder');
  const openVariants=async name=>{const d=await open(name);await d.getByRole('button',{name:'Variants / Assets',exact:true}).click();await panel().waitFor();};
  const availability=async()=>({standard:!await panel().getByRole('button',{name:'Open Standard',exact:true}).isDisabled(),overframe:!await panel().getByRole('button',{name:'Open Overframe',exact:true}).isDisabled(),warning:await panel().locator('.ant-alert-warning .ant-alert-message').allTextContents(),selected:await panel().locator('.ant-select-selection-item').first().innerText()});
  const suffix=' It remains selected; choose another variant manually if needed.';
  for(const [name,standard,overframe,message] of [['DEV006 Incomplete',false,false,'Preferred Variant: STANDARD and OVERFRAME unavailable.'],['DEV006 Standard',true,false,'Preferred Variant: OVERFRAME unavailable; STANDARD remains available.'],['DEV006 Ready',true,true,null]]){
    count=writes();await openVariants(name);const state=await availability();assert.equal(state.standard,standard);assert.equal(state.overframe,overframe);assert.deepEqual(state.warning,message?[message+suffix]:[]);assert.ok(state.selected.includes('Preferred'));assert.equal(writes(),count);await snapshot('T1-OP-06-'+name.split(' ')[1]);
  }
  // W1 cannot be produced by the frozen service (OVERFRAME READY implies STANDARD READY).
  // An explicitly synthetic DTO exercises the actual Library UI; never claimed as real readiness.
  const w1Url='**/api/v1/library/cards/'+cards.ready+'/variants';
  await page.route(w1Url,async route=>{const actual=await route.fetch();const dto=await actual.json();const original=JSON.parse(JSON.stringify(dto));dto.variants.find(v=>v.variant_id===dto.preferred_variant_id).standard={state:'INCOMPLETE',sources:[]};await save('T1-OP-06-W1-synthetic-fixture.json',{reason:'Unreachable under frozen service readiness; UI contract injection only',original,injected:dto});await route.fulfill({response:actual,json:dto});});
  await openVariants('DEV006 Ready');let state=await availability();assert.equal(state.standard,false);assert.equal(state.overframe,true);assert.deepEqual(state.warning,['Preferred Variant: STANDARD unavailable; OVERFRAME remains available.'+suffix]);await snapshot('T1-OP-06-W1-synthetic');await page.unroute(w1Url);await done('T1-OP-06',{realServiceStates:['INCOMPLETE/INCOMPLETE','READY/INCOMPLETE','READY/READY'],syntheticUiState:'INCOMPLETE/READY',limitation:'W1 is a synthetic DTO at the real UI boundary, not a producible service state.'});
  await openVariants('DEV006 Multiple');assert.ok((await panel().innerText()).includes('No Preferred Variant. Select a variant explicitly.'));assert.equal(await panel().locator('.ant-select-selection-item').count(),1);assert.equal(await panel().getByRole('button',{name:'Open Standard',exact:true}).isDisabled(),true);await snapshot('T1-OP-07-multiple');
  await openVariants('DEV006 Sole');state=await availability();assert.ok(state.selected.includes('Sole'));assert.deepEqual(state.warning,[]);assert.equal((await http('library/cards/'+cards.sole+'/variants')).preferred_variant_id,null);await snapshot('T1-OP-07-sole');
  await openVariants('DEV006 Link');assert.equal(await panel().getByRole('button',{name:'Open Standard',exact:true}).isDisabled(),true);await snapshot('T1-OP-07-zero');
  await openVariants('DEV006 Incomplete');const variantsBefore=await http('library/cards/'+cards.incomplete+'/variants');state=await availability();assert.ok(state.selected.includes('Preferred'));assert.equal(state.standard,false);count=writes();await panel().locator('.ant-select').first().click();await page.locator('.ant-select-item-option').filter({hasText:'Alternate'}).click();state=await availability();assert.equal(state.standard,true);assert.equal(state.overframe,true);assert.deepEqual(state.warning,[]);assert.equal(writes(),count);assert.deepEqual(await http('library/cards/'+cards.incomplete+'/variants'),variantsBefore);await snapshot('T1-OP-07-alternate');
  // Actual launch must retain alternate identity/composition; Carder itself remains unmodified.
  const alternate=variantsBefore.variants.find(v=>v.variant_key==='Alternate');const prep=page.waitForResponse(r=>r.url().endsWith('/carder/prepare-working-card'));const popupEvent=page.waitForEvent('popup');await panel().getByRole('button',{name:'Open Standard',exact:true}).click();const prepared=await prep;assert.equal(prepared.status(),200);assert.equal(prepared.request().postDataJSON().variant_id,alternate.variant_id);assert.equal(prepared.request().postDataJSON().composition,'STANDARD');await save('T1-OP-07-prepare.json',{request:prepared.request().postDataJSON(),response:await prepared.json()});const popup=await popupEvent;await popup.locator('#preview-canvas.js-export-available').waitFor({state:'visible',timeout:60000});await popup.screenshot({path:path.join(output,'T1-OP-07-carder.png'),fullPage:true});await popup.close();
  await panel().locator('.ant-select').first().click();await page.locator('.ant-select-item-option').filter({hasText:'Preferred'}).click();assert.equal((await availability()).warning.length,1);assert.deepEqual(await http('library/cards/'+cards.incomplete+'/variants'),variantsBefore);await done('T1-OP-07');
  const final={};for(const [key,id]of Object.entries(cards))final[key]=await http('library/cards/'+id);for(const key of Object.keys(cards).filter(k=>k!=='link'))assert.deepEqual(final[key],initial[key]);assert.deepEqual(final.link,after);await save('canonical-after.json',final);await Promise.all(pending);await save('browser-errors.json',errors);assert.deepEqual(errors,[]);await save('final-status.json',{status:'READY FOR EXTERNAL QA',candidate:expectedSha,cases,limitation:'W1 synthetic UI DTO; other matrix states use real service fixtures.'});
}
(async()=>{try{await main();}catch(e){errorText=e.stack||String(e);await save('failure.json',{error:errorText});if(activePage){await activePage.screenshot({path:path.join(output,'failure.png'),fullPage:true}).catch(()=>{});await save('failure-dom.html',await activePage.content()).catch(()=>{});}await save('final-status.json',{status:'IMPLEMENTATION BLOCKED',error:errorText,cases});}finally{await Promise.allSettled(pending);await save('network.json',network);if(browser)await browser.close();for(const c of children)if(c.exitCode===null)c.kill('SIGTERM');if(service)await service.close();if(errorText){console.error(errorText);process.exitCode=1;}}})();
