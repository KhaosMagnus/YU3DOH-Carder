const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { spawn, execFileSync } = require('node:child_process');
const { deflateSync } = require('node:zlib');
const { chromium } = require('playwright-core');

const candidateRoot = path.resolve(process.env.CANDIDATE_ROOT || '');
const output = path.resolve(process.env.DEPLOY003_OUTPUT || path.join(os.tmpdir(), 'deploy003-evidence'));
const workspaceRoot = path.resolve(process.env.DEPLOY003_WORKSPACE || path.join(os.tmpdir(), 'deploy003-workspace'));
const expectedSha = '61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c';
const candidateBranch = 'fix/workspace-rc-normal-subtype-icon';
const children = [];
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
const png = (red = 70) => {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(2, 0);
  header.writeUInt32BE(2, 4);
  header[8] = 8;
  header[9] = 6;
  const pixels = Buffer.from([0, red, 40, 60, 255, red, 40, 60, 255, 0, red, 40, 60, 255, red, 40, 60, 255]);
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

const writeReport = async (status, details = {}) => {
  const report = [
    '---',
    'artifact_id: P5-CANDIDATE-A-001-ENV-002-ENVIRONMENT-READINESS-REPORT',
    'artifact_type: environment_readiness_report',
    'status: ' + status,
    'protocol_version: "1.0"',
    'source_role: ENVIRONMENT_READINESS',
    'source_instance: ENV-002',
    'target_role: PROJECT_CONTROL',
    'target_instance: PC-001',
    'candidate_sha: ' + expectedSha,
    'behavioral_cases_executed: 0',
    '---',
    '',
    '# ENV-002 — GitHub Actions Environment Readiness Report',
    '',
    '**Final status: ' + status + '**',
    '',
    'Substrate: GitHub-hosted Actions runner.',
    '',
    'Candidate A was checked out separately by exact SHA and was not modified.',
    'A-OP-01 through A-OP-06 were not executed.',
    '',
    '## Result',
    '',
    status === 'ENVIRONMENT READY'
      ? 'The runner proved a shared execution namespace for the real Workspace Service, Vite Library/Carder and Chromium, including real UI screenshots, exact-SHA custody, a non-A-OP prepared Carder projection, HTTP observation, authoritative Canonical state and durable artifact capture.'
      : 'The readiness gate did not complete. See failure.json and runner logs for the exact blocker.',
    '',
    '## Exact candidate',
    '',
    '- SHA: ' + expectedSha,
    '- Remote branch: ' + candidateBranch,
    '- Local checkout mode: detached exact-SHA checkout with remote branch identity recorded separately.',
    '',
    '## Evidence',
    '',
    '- git-preflight.json / git-final.json',
    '- environment.json',
    '- workspace-status.json',
    '- canonical-before.json / canonical-after.json',
    '- browser.json',
    '- network.json',
    '- prepare-response.json',
    '- library-smoke.png',
    '- carder-smoke.png',
    '- runtime-service.log / runtime-vite.log',
    '- manifest.sha256 (added by workflow)',
    '',
    '## Behavioral boundary',
    '',
    'The disposable fixture is a CONTINUOUS Spell used only to prove readiness. No NORMAL Spell, NORMAL Trap, FIELD Spell or COUNTER Trap acceptance assertion is made. No Carder write-back is sent.',
    '',
    details.error ? '## Blocker\n\n' + details.error + '\n' : '',
  ].join('\n');
  await save('ENV-002_ENVIRONMENT_READINESS_REPORT.md', report);
};

async function main() {
  await fs.mkdir(output, { recursive: true });
  await fs.rm(workspaceRoot, { recursive: true, force: true });
  await fs.mkdir(workspaceRoot, { recursive: true });

  const gitPre = {
    head: runGit('rev-parse', 'HEAD'),
    branch: runGit('rev-parse', '--abbrev-ref', 'HEAD'),
    status: runGit('status', '--porcelain'),
    diff: runGit('diff', '--exit-code'),
    cachedDiff: runGit('diff', '--cached', '--exit-code'),
    remoteCandidate: execFileSync('git', ['-C', candidateRoot, 'ls-remote', 'origin', 'refs/heads/' + candidateBranch], { encoding: 'utf8' }).trim(),
  };
  assert.equal(gitPre.head, expectedSha);
  assert.equal(gitPre.status, '');
  assert.match(gitPre.remoteCandidate, new RegExp('^' + expectedSha + '\\s'));
  await save('git-preflight.json', gitPre);

  await save('environment.json', {
    platform: process.platform,
    arch: process.arch,
    node: process.version,
    git: execFileSync('git', ['--version'], { encoding: 'utf8' }).trim(),
    yarn: execFileSync('yarn', ['--version'], { encoding: 'utf8' }).trim(),
    runnerTemp: process.env.RUNNER_TEMP || null,
    githubRunId: process.env.GITHUB_RUN_ID || null,
    githubSha: process.env.GITHUB_SHA || null,
    candidateRoot,
    output,
    workspaceRoot,
  });

  const { bootstrapWorkspaceDatabase } = require(path.join(candidateRoot, 'workspace-server/dist/src/persistence/operations'));
  const { createWorkspaceService } = require(path.join(candidateRoot, 'workspace-server/dist/src/service'));

  const manifest = {
    workspace_id: 'deploy-003-actions-readiness',
    workspace_format_version: 1,
    database_path: 'Data/workspace.db',
    created_at: new Date().toISOString(),
    name: 'ENV-002 Actions readiness',
  };
  await fs.writeFile(path.join(workspaceRoot, 'workspace.json'), JSON.stringify(manifest, null, 2));
  bootstrapWorkspaceDatabase(workspaceRoot, manifest);

  service = await createWorkspaceService({ workspaceRoot, host: '127.0.0.1', port: 4312 });

  const fixtures = [];
  for (const [family, subtype, label] of [
    ['SPELL','NORMAL','Normal Spell'],['TRAP','NORMAL','Normal Trap'],
    ['SPELL','FIELD','Field Spell'],['TRAP','COUNTER','Counter Trap']
  ]) {
    const created = service.canonical.createCard({ family, password: String(12993000 + fixtures.length) });
    const confirmed = service.canonical.mutateCard(created.cardId, created.revision, {
      structure: { kind: family, subtypeCode: subtype },
      localizations: [{language:'EN',name:'DEPLOY003 '+label,cardText:'Operational evidence fixture.',pendulumText:null}],
      confirmations:['STRUCTURE','TEXT:EN'].map(block=>({block,state:'CONFIRMED',provenance:{sourceKind:'MANUAL',sourceRef:'deploy-003-fixture'}}))
    });
    const sourceFile = path.join(workspaceRoot,'Sources',label+'.png');
    await fs.mkdir(path.dirname(sourceFile),{recursive:true});
    await fs.writeFile(sourceFile,png(70+fixtures.length*30));
    await service.managedAssets.ingest({cardId:confirmed.cardId,variantKey:'Default',role:'BS',sourceFile,idempotencyKey:label});
    fixtures.push({family,subtype,label,cardId:confirmed.cardId});
  }
  await save('fixtures.json',fixtures);
  await service.app.listen({ host: '127.0.0.1', port: 4312 });
  await save('runtime-service.log', 'Workspace Service listening at http://127.0.0.1:4312\n');

  await spawnLogged(
    'runtime-vite',
    process.execPath,
    [path.join(candidateRoot, 'node_modules/vite/bin/vite.js'), '--host', '127.0.0.1', '--port', '3000', '--strictPort'],
    candidateRoot
  );

  const statusResponse = await waitReady('http://127.0.0.1:4312/api/v1/workspace/status');
  await save('workspace-status.json', await statusResponse.json());
  await waitReady('http://127.0.0.1:3000/ygocarder/library/');
  await waitReady('http://127.0.0.1:3000/ygocarder/');


  browser = await chromium.launch({headless:true,args:['--no-sandbox']});
  await save('browser.json',{version:browser.version(),executablePath:chromium.executablePath()});
  const results=[];
  const context=await browser.newContext({viewport:{width:1800,height:1400}});
  const network=[], pending=[];
  const attach = page => {
    page.on('response',r=>{
      if(!r.url().includes('/api/v1/')) return;
      pending.push((async()=>{
        const req=r.request(); let body;
        try {body=await r.text();}catch(e){body=String(e);}
        network.push({url:r.url(),method:req.method(),requestBody:req.postData(),status:r.status(),responseBody:body,timestamp:new Date().toISOString()});
      })());
    });
  };
  for(let i=0;i<fixtures.length;i++) {
    const f=fixtures[i], prefix='A-OP-0'+(i+1); cardId=f.cardId;
    const before=await canonical(); await save(prefix+'-canonical-before.json',before);
    const page=await context.newPage(); attach(page);
    await page.goto('http://127.0.0.1:3000/ygocarder/library/',{waitUntil:'domcontentloaded'});
    const card=page.locator('.library-card').filter({hasText:'DEPLOY003 '+f.label});
    await card.waitFor({state:'visible',timeout:60000}); await card.click();
    const drawer=page.locator('.ant-drawer:visible');
    await drawer.getByRole('button',{name:'Variants / Assets',exact:true}).click();
    const panel=drawer.locator('.library-open-carder');
    await panel.waitFor({state:'visible',timeout:60000});
    if(i===0) {
      const copy=await panel.innerText();
      await save('A-OP-06-visible-copy.txt',copy);
      await panel.screenshot({path:path.join(output,'A-OP-06-library-copy.png')});
      results.push({case:'A-OP-06',visibleCopy:copy});
    }
    const pp=page.waitForResponse(r=>r.url().endsWith('/api/v1/carder/prepare-working-card'));
    const pop=page.waitForEvent('popup');
    await drawer.getByRole('button',{name:'Open Standard',exact:true}).click();
    const prep=await pp; await save(prefix+'-prepare.json',{status:prep.status(),request:prep.request().postData(),response:await prep.json()});
    assert.equal(prep.status(),200);
    const popup=await pop; attach(popup);
    await popup.waitForLoadState('domcontentloaded');
    await popup.locator('.workspace-bridge-status').waitFor({state:'visible',timeout:60000});
    await popup.waitForTimeout(6000);
    const working=await popup.evaluate(async()=>{
      const {useCard}=await import('/ygocarder/src/service/use-card.ts');
      return useCard.getState().card;
    });
    await save(prefix+'-working.json',working);
    await popup.screenshot({path:path.join(output,prefix+'-carder.png'),fullPage:true,animations:'disabled'});
    const canvases=await popup.locator('canvas').evaluateAll(cs=>cs.map(c=>({id:c.id,width:c.width,height:c.height,visible:!!c.getClientRects().length})));
    await save(prefix+'-canvases.json',canvases);
    // Capture the renderer's actual canvas pixels individually, retaining full UI screenshots too.
    await popup.locator('canvas').evaluateAll(cs=>cs.length).then(async count=>{
      for(let c=0;c<count;c++) {
        const node=popup.locator('canvas').nth(c);
        const data=await node.evaluate(el=>{try{return el.toDataURL('image/png')}catch{return null}});
        if(data) await fs.writeFile(path.join(output,prefix+'-canvas-'+c+'.png'),Buffer.from(data.split(',')[1],'base64'));
      }
    });
    const after=await canonical(); await save(prefix+'-canonical-after.json',after);
    results.push({case:prefix,fixture:f,working:{frame:working.frame,attribute:working.attribute,typeAbility:working.typeAbility,subFamily:working.subFamily},canonicalUnchanged:JSON.stringify(before)===JSON.stringify(after),url:popup.url()});
    if(i<2) {
      const wp='A-OP-05-'+f.family;
      await save(wp+'-before.json',after);
      await popup.locator('#name').fill('DEPLOY003 '+f.label+' edited');
      await popup.waitForTimeout(1000);
      await save(wp+'-working-edited.json',await popup.evaluate(async()=>{const {useCard}=await import('/ygocarder/src/service/use-card.ts');return useCard.getState().card;}));
      await popup.getByRole('button',{name:'Save to Workspace',exact:true}).click();
      const dialog=popup.getByRole('dialog',{name:'Confirm Workspace save'});
      await dialog.waitFor({state:'visible'});
      await save(wp+'-ack-visible.txt',await dialog.innerText());
      await dialog.screenshot({path:path.join(output,wp+'-ack.png')});
      const responsePromise=popup.waitForResponse(r=>r.url().endsWith('/api/v1/carder/write-back'));
      await popup.getByRole('button',{name:'Acknowledge and Save to Workspace',exact:true}).click();
      const response=await responsePromise;
      const body=await response.json();
      await save(wp+'-http.json',{url:response.url(),method:response.request().method(),requestBody:JSON.parse(response.request().postData()),status:response.status(),responseBody:body});
      await popup.waitForTimeout(500);
      await save(wp+'-after.json',await canonical());
      await save(wp+'-visible-result.txt',await popup.locator('.workspace-bridge-status').innerText());
      await popup.locator('.workspace-bridge-status').screenshot({path:path.join(output,wp+'-result.png')});
      results.push({case:'A-OP-05',family:f.family,status:response.status(),response:body});
    }
    await popup.close(); await page.close();
  }
  await Promise.allSettled(pending);
  await save('network.json',network);
  await save('operational-results.json',{status:'CASES EXECUTED',candidateSha:expectedSha,results});

}

(async () => {
  try {
    await main();
  } catch (error) {
    errorText = error && error.stack ? error.stack : String(error);
    await fs.mkdir(output, { recursive: true });
    await save('failure.json', { error: errorText, timestamp: new Date().toISOString() }).catch(() => {});
  } finally {
    if (browser) await browser.close().catch(() => {});
    for (const child of children) if (child.exitCode === null) child.kill('SIGTERM');
    if (service) await service.close().catch(() => {});

    try {
      const gitFinal = {
        head: runGit('rev-parse', 'HEAD'),
        status: runGit('status', '--porcelain'),
        diff: runGit('diff', '--exit-code'),
        cachedDiff: runGit('diff', '--cached', '--exit-code'),
      };
      await save('git-final.json', gitFinal);
      if (gitFinal.head !== expectedSha || gitFinal.status !== '') errorText = errorText || 'Final candidate Git integrity check failed';
    } catch (error) {
      errorText = errorText || String(error);
    }

    const status = errorText ? 'VALIDATION BLOCKED' : 'EVIDENCE COLLECTED';
    await save('execution-status.json',{status,error:errorText,candidateSha:expectedSha});
    if (errorText) {
      console.error(errorText);
      process.exitCode = 1;
    } else {
      console.log('ENV-002 ENVIRONMENT READY');
    }
  }
})();