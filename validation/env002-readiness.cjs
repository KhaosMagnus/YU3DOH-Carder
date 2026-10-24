const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { spawn, execFileSync } = require('node:child_process');
const { deflateSync } = require('node:zlib');
const { chromium } = require('playwright-core');

const candidateRoot = path.resolve(process.env.CANDIDATE_ROOT || '');
const output = path.resolve(process.env.ENV002_OUTPUT || path.join(os.tmpdir(), 'env002-evidence'));
const workspaceRoot = path.resolve(process.env.ENV002_WORKSPACE || path.join(os.tmpdir(), 'env002-workspace'));
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
  assert.equal(response.status, 200, await response.text());
  return response.json();
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
    workspace_id: 'env-002-actions-readiness',
    workspace_format_version: 1,
    database_path: 'Data/workspace.db',
    created_at: new Date().toISOString(),
    name: 'ENV-002 Actions readiness',
  };
  await fs.writeFile(path.join(workspaceRoot, 'workspace.json'), JSON.stringify(manifest, null, 2));
  bootstrapWorkspaceDatabase(workspaceRoot, manifest);

  service = await createWorkspaceService({ workspaceRoot, host: '127.0.0.1', port: 4312 });
  const created = service.canonical.createCard({ family: 'SPELL', password: '12990002' });
  const confirmed = service.canonical.mutateCard(created.cardId, created.revision, {
    structure: { kind: 'SPELL', subtypeCode: 'CONTINUOUS' },
    localizations: [{ language: 'EN', name: 'ENV002 Continuous Smoke', cardText: 'Environment readiness fixture only.', pendulumText: null }],
    confirmations: ['STRUCTURE', 'TEXT:EN'].map(block => ({
      block,
      state: 'CONFIRMED',
      provenance: { sourceKind: 'MANUAL', sourceRef: 'env-002-readiness' },
    })),
  });
  cardId = confirmed.cardId;

  const sourceFile = path.join(workspaceRoot, 'Sources', 'env002-bs.png');
  await fs.mkdir(path.dirname(sourceFile), { recursive: true });
  await fs.writeFile(sourceFile, png());
  await service.managedAssets.ingest({ cardId, variantKey: 'Default', role: 'BS', sourceFile, idempotencyKey: 'env002-bs' });

  service.app.get('/_env002/info', async () => ({ cardId, workspaceRoot, sourceFile }));
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

  browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const browserInfo = { version: browser.version(), executablePath: chromium.executablePath() };
  await save('browser.json', browserInfo);

  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
  const page = await context.newPage();
  const network = [];
  const attachNetwork = target => {
    target.on('request', request => {
      if (request.url().includes('/api/v1/')) network.push({
        event: 'request', url: request.url(), method: request.method(),
        postData: request.postData(), timestamp: new Date().toISOString(),
      });
    });
    target.on('response', response => {
      if (response.url().includes('/api/v1/')) network.push({
        event: 'response', url: response.url(), status: response.status(),
        timestamp: new Date().toISOString(),
      });
    });
  };
  attachNetwork(page);

  await page.goto('http://127.0.0.1:3000/ygocarder/library/', { waitUntil: 'domcontentloaded' });
  const card = page.locator('.library-card').filter({ hasText: 'ENV002 Continuous Smoke' });
  await card.waitFor({ state: 'visible', timeout: 60000 });
  await page.screenshot({ path: path.join(output, 'library-smoke.png'), fullPage: true, animations: 'disabled' });

  await card.click();
  const drawer = page.locator('.ant-drawer:visible');
  await drawer.waitFor({ state: 'visible' });
  const openButton = drawer.getByRole('button', { name: 'Open Standard', exact: true });
  await openButton.waitFor({ state: 'visible' });

  const preparePromise = page.waitForResponse(r => r.url().endsWith('/api/v1/carder/prepare-working-card'));
  const popupPromise = page.waitForEvent('popup');
  await openButton.click();
  const prepareResponse = await preparePromise;
  assert.equal(prepareResponse.status(), 200);
  await save('prepare-response.json', await prepareResponse.json());

  const popup = await popupPromise;
  attachNetwork(popup);
  await popup.waitForLoadState('domcontentloaded');
  await popup.waitForTimeout(1500);
  await popup.screenshot({ path: path.join(output, 'carder-smoke.png'), fullPage: true, animations: 'disabled' });

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
    carderUrl: popup.url(),
    browser: browserInfo,
    canonicalUnchanged: true,
    preparedProjectionCaptured: true,
    screenshots: ['library-smoke.png', 'carder-smoke.png'],
    aOpCasesExecuted: 0,
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

    const status = errorText ? 'ENVIRONMENT BLOCKED' : 'ENVIRONMENT READY';
    await writeReport(status, { error: errorText }).catch(() => {});
    if (errorText) {
      console.error(errorText);
      process.exitCode = 1;
    } else {
      console.log('ENV-002 ENVIRONMENT READY');
    }
  }
})();