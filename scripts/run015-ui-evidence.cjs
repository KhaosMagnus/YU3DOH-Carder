const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { chromium } = require('playwright-core');
const output =
    process.env.YU3DOH_QA_OUTPUT || path.resolve('run015-ui-evidence');
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
async function run() {
    await fs.mkdir(output, { recursive: true });
    const info = await api('/api/v1/workspace/_qa/info');
    assert.equal(info.workspace_id, 'run015-isolated-qa');
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
    const modal = () => page.locator('.ant-modal:visible').last();
    const management = () =>
        page.locator('.ant-modal:visible').filter({
            has: page.getByText('Workspace Management', { exact: true }),
        });
    const visible = (l) => l.waitFor({ state: 'visible' });
    const shot = async (name) => {
        await page.screenshot({
            path: path.join(output, name + '.png'),
            fullPage: true,
            animations: 'disabled',
        });
        cases.push({ name, sha, result: 'PASS' });
        console.log(`RUN015 UI ${name} PASS`);
    };
    const openManagement = async () => {
        await page
            .getByRole('button', { name: 'Workspace', exact: true })
            .last()
            .click();
        await visible(
            management().getByText('Completed backups', { exact: true }),
        );
        await visible(
            management().locator(
                '[data-backup-id="' + info.ready_backup_id + '"]',
            ),
        );
    };
    const closeManagement = async () => {
        await management()
            .getByRole('button', { name: 'Close Workspace', exact: true })
            .click();
        await management().waitFor({ state: 'hidden' });
    };
    const cancel = async () => {
        await modal()
            .getByRole('button', { name: 'Cancel', exact: true })
            .click();
    };
    const create = async (kind = 'RECOVERY_POINT', output = false) => {
        await management()
            .getByRole('button', { name: 'Create Backup', exact: true })
            .click();
        if (kind === 'FULL') {
            await modal().getByLabel('Full Backup', { exact: true }).check();
            if (output)
                await modal()
                    .getByLabel('Include Output', { exact: true })
                    .check();
        } else
            assert.equal(
                await modal()
                    .getByLabel('Include Output', { exact: true })
                    .count(),
                0,
            );
        const done = page.waitForResponse(
            (r) =>
                r.url().endsWith('/api/v1/workspace/backups') &&
                r.request().method() === 'POST',
        );
        await modal()
            .getByRole('button', { name: 'Create backup', exact: true })
            .click();
        const response = await done;
        assert(response.ok(), await response.text());
        const b = await response.json();
        await visible(
            management().locator(`[data-backup-id="${b.backup_id}"]`),
        );
        await visible(
            management().getByText('Backup completed', { exact: true }),
        );
        return b;
    };
    const restoreSummary = async (id) => {
        await management()
            .locator(`[data-backup-id="${id}"]`)
            .getByRole('button', { name: 'Restore', exact: true })
            .click();
        await visible(modal().getByText('Included roots', { exact: true }));
    };
    const restoreSubmit = async () => {
        const done = page.waitForResponse(
            (r) =>
                r.url().endsWith('/restore') && r.request().method() === 'POST',
        );
        await modal()
            .getByRole('button', {
                name: 'Restore selected backup',
                exact: true,
            })
            .click();
        const response = await done;
        return response;
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
        throw new Error('Client maintenance refresh did not settle');
    };
    const waitHeld = async () => {
        const deadline = Date.now() + 30000;
        while (Date.now() < deadline) {
            if ((await api('/api/v1/workspace/_qa/info')).held) return;
            await page.waitForTimeout(50);
        }
        throw new Error(
            'Fixture never entered the actual maintenance boundary',
        );
    };
    const openDirty = async () => {
        await page
            .locator('.library-card')
            .filter({ hasText: 'QA Recovery Card' })
            .click();
        await page.getByRole('button', { name: 'Edit', exact: true }).click();
        await page.getByLabel('Password', { exact: true }).fill('15999999');
    };
    const readyRestore = async () => {
        await restoreSummary(info.ready_backup_id);
        const r = await restoreSubmit();
        assert(r.ok(), await r.text());
        await settled();
    };
    try {
        await page.goto('http://127.0.0.1:3000/ygocarder/library/');
        await openManagement();
        for (const text of [
            'Workspace ID',
            'Lifecycle',
            'Workspace format',
            'Database schema',
            'Read only',
            'Health',
            'run015-isolated-qa',
        ])
            await visible(management().getByText(text, { exact: true }));
        assert(!(await management().innerText()).includes(info.root));
        assert.equal(
            await management()
                .getByRole('button', { name: 'Migrate Workspace', exact: true })
                .count(),
            0,
        );
        await shot('QA-01-workspace-status');
        await visible(
            management().getByText('MIGRATION_PENDING', { exact: true }),
        );
        await visible(
            management().getByText(
                'Reason: QA protected pre-migration checkpoint',
                { exact: true },
            ),
        );
        const listed = await api('/api/v1/workspace/backups');
        assert.deepEqual(
            await management()
                .locator('[data-backup-id]')
                .evaluateAll((es) => es.map((e) => e.dataset.backupId)),
            listed.backups.map((b) => b.backup_id),
        );
        await shot('QA-02-backup-list-protection-order');
        const rp = await create();
        assert.equal(rp.include_output, false);
        assert.equal(rp.kind, 'RECOVERY_POINT');
        await shot('QA-03-recovery-point');
        const full = await create('FULL');
        assert.equal(full.include_output, false);
        await shot('QA-04-full-without-output');
        const withOutput = await create('FULL', true);
        assert.equal(withOutput.include_output, true);
        assert(withOutput.included_roots.includes('Output'));
        await shot('QA-05-full-with-output');
        await closeManagement();
        await openDirty();
        const saved = await api('/api/v1/library/cards/' + info.card_id);
        const patches = requests.filter((r) => r.method === 'PATCH').length;
        await openManagement();
        await management()
            .getByRole('button', { name: 'Create Backup', exact: true })
            .click();
        await visible(
            modal().getByText(
                'Unsaved Library edits are not included in this backup.',
                { exact: true },
            ),
        );
        await cancel();
        await create();
        await closeManagement();
        assert.equal(
            await page.getByLabel('Password', { exact: true }).inputValue(),
            '15999999',
        );
        assert.equal(
            (await api('/api/v1/library/cards/' + info.card_id)).revision,
            saved.revision,
        );
        assert.equal(
            requests.filter((r) => r.method === 'PATCH').length,
            patches,
        );
        await shot('QA-06-dirty-backup-preserves-form');
        await openManagement();
        const beforeCancel = (await api('/api/v1/workspace/backups')).backups;
        await management()
            .getByRole('button', { name: 'Create Backup', exact: true })
            .click();
        await cancel();
        assert.deepEqual(
            (await api('/api/v1/workspace/backups')).backups,
            beforeCancel,
        );
        await shot('QA-07-backup-cancel-no-mutation');
        await restoreSummary(info.ready_backup_id);
        for (const label of [
            'Backup ID',
            'Kind',
            'Created',
            'Database schema',
            'Workspace ID',
            'Workspace format',
            'Included roots',
            'Output',
            'Completion',
            'Protection',
        ])
            await visible(modal().getByText(label, { exact: true }));
        await cancel();
        assert.equal(
            (await api('/api/v1/library/cards/' + info.card_id)).revision,
            saved.revision,
        );
        await shot('QA-08-restore-summary-cancel');
        const changedPersisted = await api(
            '/api/v1/workspace/_qa/change-persisted',
            'POST',
        );
        assert.equal(
            (await api('/api/v1/library/cards/' + info.card_id)).password,
            '15888888',
        );
        await management()
            .getByRole('button', {
                name: 'Refresh Workspace / Retry',
                exact: true,
            })
            .click();
        await visible(
            page
                .locator('.library-card')
                .filter({ hasText: 'QA Post Backup Card' }),
        );

        await restoreSummary(info.ready_backup_id);
        assert.equal(
            await modal()
                .getByRole('button', {
                    name: 'Restore selected backup',
                    exact: true,
                })
                .isEnabled(),
            false,
        );
        assert.equal(
            requests.filter((r) => r.path.endsWith('/restore')).length,
            0,
        );
        await shot('QA-09-dirty-restore-acknowledgement');
        await modal()
            .getByLabel(
                'I acknowledge that unsaved Library edits will be discarded without saving.',
                { exact: true },
            )
            .check();
        const restored = await restoreSubmit();
        assert(restored.ok(), await restored.text());
        await settled();
        await visible(
            management().getByText('Restore completed', { exact: true }),
        );
        assert.equal(await page.locator('.ant-drawer:visible').count(), 0);
        assert.equal(
            requests.filter((r) => r.method === 'PATCH').length,
            patches,
        );
        assert.equal(
            (await api('/api/v1/library/cards/' + info.card_id)).password,
            '15000001',
        );
        assert.equal(
            await page
                .locator('.library-card')
                .filter({ hasText: 'QA Post Backup Card' })
                .count(),
            0,
        );
        await shot('QA-10-restore-success-invalidates-client');
        await restoreSummary(info.old_backup_id);
        const old = await restoreSubmit();
        assert(old.ok());
        assert.equal((await old.json()).status.state, 'NEEDS_MIGRATION');
        await settled();
        await visible(
            management().getByRole('button', {
                name: 'Migrate Workspace',
                exact: true,
            }),
        );
        assert.equal(
            await page
                .getByRole('button', { name: 'New Draft', exact: true })
                .isEnabled(),
            false,
        );
        await shot('QA-11-restore-old-schema');
        await readyRestore();
        await restoreSummary(full.backup_id);
        await api('/api/v1/workspace/_qa/incompatible', 'POST', {
            backup_id: full.backup_id,
        });
        const incompatible = await restoreSubmit();
        assert(!incompatible.ok());
        assert.equal((await incompatible.json()).code, 'BACKUP_INCOMPATIBLE');
        await settled();
        await visible(management().getByText(/BACKUP_INCOMPATIBLE:/));
        assert.equal(
            await management()
                .getByText('Restore completed', { exact: true })
                .count(),
            0,
        );
        await shot('QA-12-incompatible-server-error');
        await api('/api/v1/workspace/_qa/recovery', 'POST');
        await management()
            .getByRole('button', {
                name: 'Refresh Workspace / Retry',
                exact: true,
            })
            .click();
        await visible(
            management().getByText('Recovery Required', { exact: true }),
        );
        assert.equal(
            await page
                .getByRole('button', { name: 'New Draft', exact: true })
                .isEnabled(),
            false,
        );
        await shot('QA-13-persistent-recovery-access');
        await readyRestore();
        await api('/api/v1/workspace/_qa/old', 'POST');
        await management()
            .getByRole('button', {
                name: 'Refresh Workspace / Retry',
                exact: true,
            })
            .click();
        await visible(
            management().getByRole('button', {
                name: 'Migrate Workspace',
                exact: true,
            }),
        );
        await shot('QA-14-migration-availability');
        await readyRestore();
        await closeManagement();
        await openDirty();
        await api('/api/v1/workspace/_qa/old', 'POST');
        await openManagement();
        await visible(
            management().getByRole('button', {
                name: 'Migrate Workspace',
                exact: true,
            }),
        );
        await management()
            .getByRole('button', { name: 'Migrate Workspace', exact: true })
            .click();
        assert.equal(
            await modal()
                .getByRole('button', { name: 'Confirm migration', exact: true })
                .isEnabled(),
            false,
        );
        assert.equal(
            requests.filter((r) => r.path.endsWith('/migrate')).length,
            0,
        );
        await shot('QA-15-dirty-migration-acknowledgement');
        await modal()
            .getByLabel(
                'I acknowledge that unsaved Library edits will be discarded without saving.',
                { exact: true },
            )
            .check();
        const migrating = page.waitForResponse((r) =>
            r.url().endsWith('/migrate'),
        );
        await modal()
            .getByRole('button', { name: 'Confirm migration', exact: true })
            .click();
        const migrated = await (await migrating).json();
        assert.equal(migrated.migrated, true);
        assert.equal(migrated.status.state, 'READY');
        assert.equal(migrated.status.database_schema_version, 7);
        assert(migrated.backup_id);
        await settled();
        await visible(
            management().getByText('Migration completed', { exact: true }),
        );
        assert.equal(await page.locator('.ant-drawer:visible').count(), 0);
        assert.equal(
            requests.filter((r) => r.method === 'PATCH').length,
            patches,
        );
        await shot('QA-16-migration-success-checkpoint');
        await api('/api/v1/workspace/_qa/old', 'POST');
        await api('/api/v1/workspace/_qa/mode', 'POST', {
            mode: 'WARN_RETENTION',
        });
        await management()
            .getByRole('button', {
                name: 'Refresh Workspace / Retry',
                exact: true,
            })
            .click();
        await visible(
            management().getByRole('button', {
                name: 'Migrate Workspace',
                exact: true,
            }),
        );
        await management()
            .getByRole('button', { name: 'Migrate Workspace', exact: true })
            .click();
        const warningResponse = page.waitForResponse((r) =>
            r.url().endsWith('/migrate'),
        );
        await modal()
            .getByRole('button', { name: 'Confirm migration', exact: true })
            .click();
        const warning = await (await warningResponse).json();
        assert.equal(warning.migrated, true);
        await settled();
        await visible(
            management().getByText('Migration completed', { exact: true }),
        );
        await visible(
            management().getByText('RETENTION_CLEANUP_FAILED', { exact: true }),
        );
        await shot('QA-17-success-maintenance-warning');
        await api('/api/v1/workspace/_qa/mode', 'POST', {
            mode: 'FAIL_MIGRATION',
        });
        await api('/api/v1/workspace/_qa/old', 'POST');
        await management()
            .getByRole('button', {
                name: 'Refresh Workspace / Retry',
                exact: true,
            })
            .click();
        await visible(
            management().getByRole('button', {
                name: 'Migrate Workspace',
                exact: true,
            }),
        );
        await management()
            .getByRole('button', { name: 'Migrate Workspace', exact: true })
            .click();
        const failResponse = page.waitForResponse((r) =>
            r.url().endsWith('/migrate'),
        );
        await modal()
            .getByRole('button', { name: 'Confirm migration', exact: true })
            .click();
        assert.equal((await failResponse).ok(), false);
        await settled();
        await visible(
            management().getByText('Recovery Required', { exact: true }),
        );
        assert.equal(
            await management()
                .getByText('Migration completed', { exact: true })
                .count(),
            0,
        );
        await shot('QA-18-migration-failure-recovery');
        await api('/api/v1/workspace/_qa/mode', 'POST', { mode: 'NONE' });
        await readyRestore();
        await closeManagement();
        await openDirty();
        await openManagement();
        await api('/api/v1/workspace/_qa/mode', 'POST', {
            mode: 'HOLD_BACKUP',
        });
        const heldBackupResponse = page.waitForResponse(
            (r) =>
                r.url().endsWith('/backups') && r.request().method() === 'POST',
        );
        await management()
            .getByRole('button', { name: 'Create Backup', exact: true })
            .click();
        await modal()
            .getByRole('button', { name: 'Create backup', exact: true })
            .click();
        await visible(
            management().getByText(
                'Workspace maintenance in progress: BACKUP',
                { exact: true },
            ),
        );
        await closeManagement();
        assert.equal(
            await page
                .getByRole('button', { name: 'Save', exact: true })
                .isEnabled(),
            false,
        );
        assert.equal(
            await page
                .getByRole('button', { name: 'New Draft', exact: true })
                .isEnabled(),
            false,
        );
        assert.equal(
            requests.filter((r) => r.method === 'PATCH').length,
            patches,
        );
        await shot('QA-19-maintenance-mutation-fence');
        await api('/api/v1/workspace/_qa/release', 'POST');
        assert((await heldBackupResponse).ok());
        await openManagement();
        await settled();
        const texts = await management().innerText();
        for (const excluded of [
            'Initialize',
            'Switch Workspace',
            'Delete backup',
            'Export backup',
            'Cloud backup',
            'Choose path',
        ])
            assert(!texts.includes(excluded));
        await shot('QA-20-scope-exclusions');
        // Also prove destructive maintenance launches no fresh ordinary Library reads.
        await api('/api/v1/workspace/_qa/mode', 'POST', {
            mode: 'HOLD_RESTORE',
        });
        const heldRestoreResponse = page.waitForResponse(
            (r) =>
                r.url().endsWith('/restore') && r.request().method() === 'POST',
        );
        heldRestoreResponse.catch(() => {});
        await restoreSummary(info.ready_backup_id);
        await modal()
            .getByLabel(
                'I acknowledge that unsaved Library edits will be discarded without saving.',
                { exact: true },
            )
            .check();
        await modal()
            .getByRole('button', {
                name: 'Restore selected backup',
                exact: true,
            })
            .click();
        await visible(
            management().getByText(
                'Workspace maintenance in progress: RESTORE',
                { exact: true },
            ),
        );
        await waitHeld();
        const readStart = requests.length;
        await closeManagement();
        await openManagement();
        await page.waitForTimeout(350);
        assert.equal(
            requests
                .slice(readStart)
                .filter((r) => r.path.startsWith('/api/v1/library/')).length,
            0,
        );
        await shot('QA-21-exclusive-read-fence');
        await api('/api/v1/workspace/_qa/release', 'POST');
        assert((await heldRestoreResponse).ok());
        await settled();
        // Published backup followed by retention failure must still appear after refresh.
        await api('/api/v1/workspace/_qa/retention-candidate', 'POST');
        await api('/api/v1/workspace/_qa/mode', 'POST', {
            mode: 'WARN_RETENTION',
        });
        const countBefore = (await api('/api/v1/workspace/backups')).backups
            .length;
        await management()
            .getByRole('button', { name: 'Create Backup', exact: true })
            .click();
        const failBackup = page.waitForResponse(
            (r) =>
                r.url().endsWith('/backups') && r.request().method() === 'POST',
        );
        await modal()
            .getByRole('button', { name: 'Create backup', exact: true })
            .click();
        assert.equal((await failBackup).ok(), false);
        await settled();
        assert.equal(
            (await api('/api/v1/workspace/backups')).backups.length,
            countBefore + 1,
        );
        await visible(
            management().getByText('Workspace operation error', {
                exact: true,
            }),
        );
        await shot('QA-22-published-backup-on-error-refresh');
        await api('/api/v1/workspace/_qa/mode', 'POST', { mode: 'NONE' });
        await page.route('**/api/v1/library/facets', (route) =>
            route.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify({
                    code: 'QA_RELOAD_FAILED',
                    message: 'QA-only authoritative reload failure',
                }),
            }),
        );
        await restoreSummary(info.ready_backup_id);
        const reloadRestore = await restoreSubmit();
        assert(reloadRestore.ok());
        await settled();
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
        await page.unroute('**/api/v1/library/facets');
        await management()
            .getByRole('button', {
                name: 'Refresh Workspace / Retry',
                exact: true,
            })
            .click();
        await page.waitForFunction(() =>
            Array.from(document.querySelectorAll('button')).some(
                (b) => b.textContent === 'New Draft' && !b.disabled,
            ),
        );
        await shot('QA-24-failed-library-reload-stays-fenced-until-retry');
        await closeManagement();
        await page.route('**/api/v1/workspace/status', (route) =>
            route.abort(),
        );
        await page.reload();
        await page
            .getByRole('button', { name: 'Workspace', exact: true })
            .click();
        await visible(
            management().getByText('Workspace Service unavailable', {
                exact: true,
            }),
        );
        await visible(
            management().getByRole('button', {
                name: 'Refresh Workspace / Retry',
                exact: true,
            }),
        );
        await shot('QA-23-service-unavailable-retry');
        await page.unroute('**/api/v1/workspace/status');
        await management()
            .getByRole('button', {
                name: 'Refresh Workspace / Retry',
                exact: true,
            })
            .click();
        await visible(
            management().getByText('run015-isolated-qa', { exact: true }),
        );
        assert.deepEqual(errors, []);
    } catch (error) {
        console.error('RUN015 scenario failure:', error);
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
    console.log(`RUN015 UI ${cases.length} passed; 0 failed; 0 skipped`);
}
run().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
