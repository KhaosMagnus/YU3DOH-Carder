const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { spawn, execFileSync } = require('node:child_process');
const { deflateSync } = require('node:zlib');
const { chromium } = require('playwright-core');

const candidateRoot = path.resolve(process.env.CANDIDATE_ROOT || '');
const output = path.resolve(process.env.ENV005_OUTPUT || path.join(os.tmpdir(), 'env005-evidence'));
const workspaceRoot = path.resolve(process.env.ENV005_WORKSPACE || path.join(os.tmpdir(), 'env005-workspace'));
const expectedSha = 'dd968ba05e579461962bbcced0e9cae3cd4c3d23';
const candidateBranch = 'feature/workspace-run-025';
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
    controlSha: 'af6b13dfa7225d90204eb772915e4f6433bb651d',
    osRelease: await fs.readFile('/etc/os-release', 'utf8'),
    playwright: require('playwright-core/package.json').version,
    candidateRoot,
    output,
    workspaceRoot,
  });

  const { bootstrapWorkspaceDatabase } = require(path.join(candidateRoot, 'workspace-server/dist/src/persistence/operations'));
  const { createWorkspaceService } = require(path.join(candidateRoot, 'workspace-server/dist/src/service'));

  const manifest = {
    workspace_id: 'env-005-actions-readiness',
    workspace_format_version: 1,
    database_path: 'Data/workspace.db',
    created_at: new Date().toISOString(),
    name: 'ENV-005 Actions readiness',
  };
  await fs.writeFile(path.join(workspaceRoot, 'workspace.json'), JSON.stringify(manifest, null, 2));
  bootstrapWorkspaceDatabase(workspaceRoot, manifest);

  service = await createWorkspaceService({ workspaceRoot, host: '127.0.0.1', port: 4312 });
  const created = service.canonical.createCard({ family: 'SPELL', password: '12990005' });
  const confirmed = service.canonical.mutateCard(created.cardId, created.revision, {
    structure: { kind: 'SPELL', subtypeCode: 'CONTINUOUS' },
    localizations: [{ language: 'EN', name: 'ENV005 Continuous Smoke', cardText: 'Environment readiness fixture only.', pendulumText: null }],
    confirmations: ['STRUCTURE', 'TEXT:EN'].map(block => ({
      block,
      state: 'CONFIRMED',
      provenance: { sourceKind: 'MANUAL', sourceRef: 'env-005-readiness' },
    })),
  });
  cardId = confirmed.cardId;

  const sourceFile = path.join(workspaceRoot, 'Sources', 'env005-bs.png');
  await fs.mkdir(path.dirname(sourceFile), { recursive: true });
  await fs.writeFile(sourceFile, png());
  await service.managedAssets.ingest({ cardId, variantKey: 'Default', role: 'BS', sourceFile, idempotencyKey: 'env005-bs' });

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

  const before = await canonical();
  await save('canonical-before.json', before);
  assert.equal(before.card_id, cardId);
  assert.ok(Array.isArray(before.confirmations));
  assert.ok(before.confirmations.length >= 2);
  assert.ok(Array.isArray(before.provenance));
  assert.ok(before.provenance.length >= 2);

  browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--no-sandbox'] });
  const browserInfo = { version: browser.version(), channel: 'chrome', executablePath: execFileSync('which',['google-chrome'],{encoding:'utf8'}).trim() };
  await save('browser.json', browserInfo);

  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const errors = []; const consoleErrors = [];
  page.on('console', m => {if(m.type()==='error') consoleErrors.push({text:m.text(),location:m.location()});});
  context.on('page', p => p.on('pageerror', e => errors.push(String(e))));
  page.on('pageerror', e => errors.push(String(e)));
  await context.route('**/api/v1/**', async route => {
    const request = route.request();
    network.push({ event: 'intercept', url: request.url(), method: request.method(), postData: request.postData(), timestamp: new Date().toISOString(), action: 'continue-unmodified' });
    await route.continue();
  });
  context.on('response', response => {
    if (!response.url().includes('/api/v1/')) return;
    pending.push((async () => {
      let body = null;
      let bodyError = null;
      try { body = (await response.body()).toString('utf8'); } catch (e) { bodyError = String(e); }
      network.push({event: 'response', url: response.url(), status: response.status(), headers: response.headers(), body, bodyError, timestamp: new Date().toISOString()});
    })());
  });
  const captureDom = async (target, name) => {
    await save(name + '-dom.html', await target.content());
    await save(name + '-accessibility.yml', await target.locator('body').ariaSnapshot());
    await save(name + '-controls.json', await target.locator('button,input,select,a,[role]').evaluateAll(nodes => nodes.map(n => ({ tag: n.tagName, role: n.getAttribute('role'), label: n.getAttribute('aria-label'), text: n.textContent, disabled: n.disabled, checked: n.getAttribute('aria-checked'), pressed: n.getAttribute('aria-pressed') }))));
  };

  await page.goto('http://127.0.0.1:3000/ygocarder/library/', { waitUntil: 'domcontentloaded' });
  const card = page.locator('.library-card').filter({ hasText: 'ENV005 Continuous Smoke' });
  await card.waitFor({ state: 'visible', timeout: 60000 });
  await page.screenshot({ path: path.join(output, 'library-smoke.png'), fullPage: true, animations: 'disabled' });

  await captureDom(page, 'library');
  await Promise.all(pending);
  await save('browser-errors.json', errors);
  await save('console-errors.json', consoleErrors);
  assert.ok(network.some(e=>e.event==='intercept'));
  assert.ok(network.some(e=>e.event==='response' && e.status===200));
  const after = await canonical();
  await save('canonical-after.json', after);
  assert.deepEqual(after, before, 'Readiness open-in-Carder probe must be read-only for Canonical state');

  await save('network.json', {
    writebackCaptureConfigured: true,
    writebackExecuted: false,
    captureFields: ['url', 'method', 'postData', 'responseStatus', 'timestamp'],
    events: network,
  });

  await save('readiness-result.json', {
    status: 'ENVIRONMENT READY',
    candidateSha: expectedSha,
    cardId,
    fixtureSubtype: 'CONTINUOUS',
    serviceUrl: 'http://127.0.0.1:4312',
    libraryUrl: 'http://127.0.0.1:3000/ygocarder/library/',
    viewport: {width:1440,height:1000}, deviceScaleFactor:1,
    browser: browserInfo,
    canonicalUnchanged: true,
    consoleErrorCaptureConfigured: true, pageErrorCaptureConfigured: true,
    screenshots: ['library-smoke.png'],
    f04AcceptanceCasesExecuted: 0,
    domAndAccessibilityCaptured: true,
    httpInterceptionContinuedUnmodified: true,
  });
}

(async () => {
  try {
    await main();
  } catch (error) {
    errorText = error && error.stack ? error.stack : String(error);
    await fs.mkdir(output, { recursive: true });
    await save('failure.json', { error: errorText, timestamp: new Date().toISOString() }).catch(() => {});
  } finally {
    await Promise.allSettled(pending);
    await save('network.json', {writebackExecuted: false, events: network}).catch(() => {});
    if (browser) await browser.close().catch(() => {});
    for (const child of children) if (child.exitCode === null) child.kill('SIGTERM');
    if (service) await service.close().catch(() => {});
    try { await fs.rm(workspaceRoot,{recursive:true,force:true}); await save('fixture-cleanup.json',{removed:true,workspaceRoot}); } catch(e) {errorText=errorText||String(e);}

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

    const status = errorText ? 'ENVIRONMENT BLOCKED' : 'ENVIRONMENT READY';
    await save('final-status.json', {status, error: errorText, behavioralCasesExecuted: 0}).catch(() => {});
    if (errorText) {
      console.error(errorText);
      process.exitCode = 1;
    } else {
      console.log('ENV-005 ENVIRONMENT READY');
    }
  }
})();