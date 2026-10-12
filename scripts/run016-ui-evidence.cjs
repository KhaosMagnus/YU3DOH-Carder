const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { chromium } = require('playwright-core');
const output =
    process.env.YU3DOH_QA_OUTPUT || path.resolve('run016-ui-evidence');
const sha = execFileSync('git', ['rev-parse', 'HEAD'], {
    encoding: 'utf8',
}).trim();
async function api(route, method = 'GET', body) {
    const r = await fetch('http://127.0.0.1:4312' + route, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : {},
        body: body ? JSON.stringify(body) : undefined,
    });
    assert(r.ok, await r.clone().text());
    return r.json();
}
const qa = '/api/v1/workspace/_qa/';
async function run() {
    await fs.mkdir(output, { recursive: true });
    const info = await api(qa + 'info');
    assert(info.root.includes('RUN016'));
    const browser = await chromium.launch({
        headless: true,
        ...(process.env.YU3DOH_QA_CHROMIUM
            ? { executablePath: process.env.YU3DOH_QA_CHROMIUM }
            : {}),
        args: ['--no-sandbox'],
    });
    const page = await browser.newPage({
        viewport: { width: 1440, height: 1100 },
    });
    const cases = [],
        requests = [],
        errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('request', (r) => {
        if (r.url().includes('/api/v1/'))
            requests.push({
                path: new URL(r.url()).pathname,
                method: r.method(),
                body: r.postDataJSON(),
            });
    });
    const management = () =>
        page.locator('.ant-modal:visible').filter({
            has: page.getByText('Workspace Management', { exact: true }),
        });
    const modal = () => page.locator('.ant-modal:visible').last();
    const visible = (l) => l.waitFor({ state: 'visible' });
    const shot = async (name, extra = {}) => {
        const filesystem = await api(qa + 'fs');
        await page.screenshot({
            path: path.join(output, name + '.png'),
            fullPage: true,
            animations: 'disabled',
        });
        cases.push({
            name,
            sha,
            result: 'PASS',
            filesystem,
            operation_result: extra.result ?? null,
        });
        console.log(`RUN016 UI ${name} PASS`);
    };
    const open = async () => {
        await page
            .getByRole('button', { name: 'Workspace', exact: true })
            .last()
            .click();
        await visible(
            management().getByText('Completed backups', { exact: true }),
        );
    };
    const refresh = async () => {
        await management()
            .getByRole('button', {
                name: 'Refresh Workspace / Retry',
                exact: true,
            })
            .click();
    };
    const eligible = async () => {
        await visible(
            management().getByRole('button', {
                name: 'Initialize Workspace',
                exact: true,
            }),
        );
    };
    const summary = async () => {
        await management()
            .getByRole('button', { name: 'Initialize Workspace', exact: true })
            .click();
        await visible(
            modal().getByText(/already-configured Workspace location/),
        );
    };
    const submit = async () => {
        const response = page.waitForResponse(
            (r) =>
                r.url().endsWith('/workspace/initialize') &&
                r.request().method() === 'POST',
        );
        await modal()
            .getByRole('button', {
                name: 'Initialize configured Workspace',
                exact: true,
            })
            .click();
        return await response;
    };
    const settled = async () => {
        const deadline = Date.now() + 30000;
        while (Date.now() < deadline) {
            if (
                await management()
                    .getByRole('button', {
                        name: 'Refresh Workspace / Retry',
                        exact: true,
                    })
                    .isEnabled()
            )
                return;
            await page.waitForTimeout(50);
        }
        throw new Error('Client initialization refresh did not settle');
    };
    const reset = async (kind) => {
        await api(qa + 'reset', 'POST', { kind });
        await refresh();
    };
    const success = async () => {
        const r = await submit();
        assert(r.ok(), await r.text());
        const result = await r.json();
        assert.equal(result.operation, 'INITIALIZE');
        assert.equal(result.initialized, true);
        assert.equal(result.status.state, 'READY');
        assert.equal(result.status.read_only, false);
        assert.equal(result.workspace_format_version, 1);
        assert.equal(result.database_schema_version, 6);
        await settled();
        await visible(
            management().getByText('Workspace initialized', { exact: true }),
        );
        return result;
    };
    try {
        await page.goto('http://127.0.0.1:3000/ygocarder/library/');
        await open();
        await eligible();
        const before = await api(qa + 'fs');
        assert(!before.root_exists);
        assert.equal(
            requests.filter((r) => r.path.endsWith('/initialize')).length,
            0,
        );
        await refresh();
        await eligible();
        assert.deepEqual(await api(qa + 'fs'), before);
        await shot('QA-16-01-explicit-initialize-no-automatic-work');
        await summary();
        assert.equal(
            await modal().locator('input:not([type="checkbox"])').count(),
            0,
        );
        await modal()
            .getByRole('button', { name: 'Cancel', exact: true })
            .click();
        assert.equal(
            requests.filter((r) => r.path.endsWith('/initialize')).length,
            0,
        );
        assert.deepEqual(await api(qa + 'fs'), before);
        await shot('QA-16-02-cancel-no-mutation');
        await summary();
        const first = await success();
        const initialized = await api(qa + 'fs');
        const manifest = JSON.parse(
            initialized.files.find((f) => f.relative_path === 'workspace.json')
                .text,
        );
        assert.equal(manifest.workspace_id, first.workspace_id);
        assert.equal(manifest.database_path, 'Data/workspace.db');
        assert(
            initialized.files.some(
                (f) => f.relative_path === 'Data/workspace.db',
            ),
        );
        assert.equal((await api(qa + 'info')).configured_root, info.root);
        await shot('QA-16-03-missing-root-READY', { result: first });
        await reset('EMPTY');
        await eligible();
        assert.deepEqual((await api(qa + 'fs')).files, []);
        await summary();
        const second = await success();
        assert.notEqual(first.workspace_id, second.workspace_id);
        assert(info.root.includes('日本語') && info.root.includes(' '));
        await shot('QA-16-04-empty-Unicode-root-READY', { result: second });
        await reset('FOREIGN');
        await visible(
            management().getByText('INVALID_WORKSPACE', { exact: true }),
        );
        assert.equal(
            await management()
                .getByRole('button', {
                    name: 'Initialize Workspace',
                    exact: true,
                })
                .count(),
            0,
        );
        assert.equal(
            (await api(qa + 'fs')).files[0].text,
            'original unknown content',
        );
        await shot('QA-16-05-unknown-content-preserved');
        await reset('EMPTY');
        await eligible();
        await summary();
        await api(qa + 'foreign', 'POST');
        const stale = await submit();
        assert.equal(stale.status(), 409);
        assert.equal(
            (await stale.json()).code,
            'WORKSPACE_INITIALIZATION_NOT_ALLOWED',
        );
        await settled();
        await visible(
            management().getByText(/WORKSPACE_INITIALIZATION_NOT_ALLOWED:/),
        );
        assert.equal(
            (await api(qa + 'fs')).files[0].text,
            'stale foreign content',
        );
        await shot('QA-16-06-stale-root-rejected');
        await reset('EMPTY');
        await eligible();
        await summary();
        await success();
        await api(qa + 'seed', 'POST');
        await refresh();
        await management()
            .getByRole('button', { name: 'Close Workspace', exact: true })
            .click();
        await page
            .locator('.library-card')
            .filter({ hasText: 'QA Stale Card' })
            .click();
        await page.getByRole('button', { name: 'Edit', exact: true }).click();
        await page.getByLabel('Password', { exact: true }).fill('16999999');
        await api(qa + 'reset', 'POST', { kind: 'EMPTY' });
        await open();
        await eligible();
        await summary();
        const attempts = requests.filter((r) =>
            r.path.endsWith('/initialize'),
        ).length;
        assert.equal(
            await modal()
                .getByRole('button', {
                    name: 'Initialize configured Workspace',
                    exact: true,
                })
                .isEnabled(),
            false,
        );
        assert.equal(requests.filter((r) => r.method === 'PATCH').length, 0);
        await shot('QA-16-07-dirty-acknowledgement-required');
        await modal()
            .getByLabel(
                'I acknowledge that unsaved Library edits will be discarded without saving.',
                { exact: true },
            )
            .check();
        const clean = await success();
        assert.equal(
            requests.filter((r) => r.path.endsWith('/initialize')).length,
            attempts + 1,
        );
        assert.equal(requests.filter((r) => r.method === 'PATCH').length, 0);
        assert.equal(await page.locator('.ant-drawer:visible').count(), 0);
        assert.equal(await page.locator('.library-card').count(), 0);
        assert.equal((await api('/api/v1/library/cards')).total, 0);
        await shot('QA-16-08-invalidates-stale-client-new-empty-Workspace', {
            result: clean,
        });
        await reset('EMPTY');
        await eligible();
        await api(qa + 'mode', 'POST', { mode: 'FAIL' });
        await summary();
        const failed = await submit();
        assert.equal(failed.status(), 500);
        assert.equal(
            (await failed.json()).code,
            'WORKSPACE_INITIALIZATION_FAILED',
        );
        await settled();
        assert.deepEqual((await api(qa + 'fs')).files, []);
        assert.equal(
            (await api(qa + 'info')).status.state,
            'NEEDS_INITIALIZATION',
        );
        assert.equal(
            await management()
                .getByText('Workspace initialized', { exact: true })
                .count(),
            0,
        );
        await shot('QA-16-09-controlled-rollback-no-false-success');
        await api(qa + 'mode', 'POST', { mode: 'FOREIGN_FAIL' });
        await summary();
        assert.equal((await submit()).status(), 500);
        await settled();
        const foreign = await api(qa + 'fs');
        assert.deepEqual(
            foreign.files.map((f) => f.relative_path),
            ['keep-me.txt'],
        );
        assert.equal(foreign.files[0].text, 'foreign bytes to preserve');
        assert.equal(
            (await api(qa + 'info')).status.state,
            'INVALID_WORKSPACE',
        );
        await shot('QA-16-10-rollback-preserves-foreign-file');
        await reset('EMPTY');
        await eligible();
        await api(qa + 'mode', 'POST', { mode: 'CONFLICT' });
        await summary();
        const conflict = await submit();
        assert.equal(conflict.status(), 409);
        assert.equal(
            (await conflict.json()).code,
            'WORKSPACE_MAINTENANCE_ACTIVE',
        );
        await settled();
        await visible(management().getByText(/WORKSPACE_MAINTENANCE_ACTIVE:/));
        assert.deepEqual((await api(qa + 'fs')).files, []);
        await shot('QA-16-11-maintenance-conflict-no-partial-initialization');
        await api(qa + 'release', 'POST');
        await refresh();
        await eligible();
        await summary();
        const final = await success();
        await visible(
            management().getByText(
                new RegExp('Workspace ID: ' + final.workspace_id),
            ),
        );
        assert(!(await management().innerText()).includes(info.root));
        await shot('QA-16-12-authoritative-identity-format-schema-result', {
            result: final,
        });
        await reset('EMPTY');
        await eligible();
        await page.route('**/api/v1/library/facets', (r) =>
            r.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify({
                    code: 'QA_RELOAD_FAILED',
                    message: 'QA-only client reload failure',
                }),
            }),
        );
        await summary();
        const reload = await success();
        assert.equal((await api(qa + 'info')).status.state, 'READY');
        assert.equal(
            await page
                .getByRole('button', { name: 'New Draft', exact: true })
                .isEnabled(),
            false,
        );
        await visible(
            page.getByText('Library refresh required before editing', {
                exact: true,
            }),
        );
        const n = requests.filter((r) => r.path.endsWith('/initialize')).length;
        await page.unroute('**/api/v1/library/facets');
        await refresh();
        await page.waitForFunction(() =>
            Array.from(document.querySelectorAll('button')).some(
                (b) => b.textContent === 'New Draft' && !b.disabled,
            ),
        );
        assert.equal(
            requests.filter((r) => r.path.endsWith('/initialize')).length,
            n,
        );
        await shot('QA-16-13-success-preserved-reload-failure-Retry', {
            result: reload,
        });
        const text = await management().innerText();
        for (const word of [
            'Select root',
            'Choose folder',
            'Host Launcher',
            'Locate Existing',
            'Switch Workspace',
            'Multi-Workspace',
        ])
            assert(!text.includes(word));
        assert.equal(
            await management().locator('input[type="file"]').count(),
            0,
        );
        await shot('QA-16-14-scope-exclusions');
        await reset('EMPTY');
        await eligible();
        await api(qa + 'mode', 'POST', { mode: 'HOLD' });
        await summary();
        const heldResponse = page.waitForResponse((r) =>
            r.url().endsWith('/workspace/initialize'),
        );
        heldResponse.catch(() => {});
        await modal()
            .getByRole('button', {
                name: 'Initialize configured Workspace',
                exact: true,
            })
            .click();
        await visible(
            management().getByText(
                'Workspace maintenance in progress: INITIALIZATION',
                { exact: true },
            ),
        );
        const deadline = Date.now() + 30000;
        while (!(await api(qa + 'info')).held) {
            assert(Date.now() < deadline);
            await page.waitForTimeout(50);
        }
        const start = requests.length;
        await page.waitForTimeout(350);
        assert.equal(
            requests
                .slice(start)
                .filter((r) => r.path.startsWith('/api/v1/library/')).length,
            0,
        );
        assert.deepEqual((await api(qa + 'fs')).files, []);
        await shot('QA-16-15-exclusive-initialization-read-fence');
        await api(qa + 'release', 'POST');
        assert((await heldResponse).ok());
        await settled();
        for (const request of requests.filter((r) =>
            r.path.endsWith('/workspace/initialize'),
        )) {
            assert.equal(request.method, 'POST');
            assert.deepEqual(request.body, {});
        }
        assert.deepEqual(errors, []);
    } catch (error) {
        console.error('RUN016 scenario failure:', error);
        await page.screenshot({
            path: path.join(output, 'failure.png'),
            fullPage: true,
        });
        throw error;
    } finally {
        await fs.writeFile(
            path.join(output, 'evidence.json'),
            JSON.stringify(
                {
                    sha,
                    os: process.platform,
                    fixture: info,
                    cases,
                    requests,
                    page_errors: errors,
                },
                null,
                2,
            ),
        );
        await browser.close();
    }
    console.log(
        `RUN016 UI evidence: ${cases.length} PASS / 0 FAIL / 0 SKIP at ${sha}`,
    );
}
run().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
