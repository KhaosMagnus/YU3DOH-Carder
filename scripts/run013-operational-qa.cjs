/* Launch only disposable fixtures and the Library; preserve browser evidence outside the checkout. */
const { spawn } = require('node:child_process');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const children = [];
const start = args => {
    const child = spawn(process.execPath, args, { cwd: root, env: process.env, stdio: 'inherit' }); children.push(child); return child;
};
const waitReady = async url => {
    const deadline = Date.now() + 60000;
    while (Date.now() < deadline) {
        if (children.some(child => child.exitCode !== null)) throw new Error('QA child exited before readiness');
        try { if ((await fetch(url)).ok) return; } catch {}
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error('QA startup readiness timed out: ' + url);
};
async function run() {
    // Prevent accidental reuse of an unrelated local Workspace Service.
    let occupied = false;
    try { await fetch('http://127.0.0.1:4312/api/v1/workspace/status'); occupied = true; } catch {}
    if (occupied) throw new Error('Port 4312 already serves a Workspace. Stop it before launching isolated operational QA.');
    try {
        start(['scripts/run013-qa-fixture.cjs']);
        await waitReady('http://127.0.0.1:4312/_qa/info');
        start([path.join(root, 'node_modules/vite/bin/vite.js'), '--host', '127.0.0.1', '--port', '3000', '--strictPort']);
        await waitReady('http://127.0.0.1:3000/ygocarder/library/');
        const evidence = start(['scripts/run013-ui-evidence.cjs']);
        const code = await new Promise((resolve, reject) => { evidence.once('error', reject); evidence.once('exit', resolve); });
        if (code !== 0) throw new Error('Operational UI evidence failed with exit code ' + code);
    } finally { for (const child of children) if (child.exitCode === null) child.kill('SIGTERM'); }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
