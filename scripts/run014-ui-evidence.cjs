const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { chromium } = require('playwright-core');
const output = process.env.YU3DOH_QA_OUTPUT || path.resolve('run014-ui-evidence');
const sha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const api = async (route, method = 'GET') => {
    const r = await fetch('http://127.0.0.1:4312' + route, { method });
    assert.equal(r.ok, true, await r.clone().text());
    return r.json();
};
async function run() {
    await fs.mkdir(output, { recursive: true });
    const info = await api('/_qa/info');
    assert.equal(info.workspace_id, 'run014-isolated-qa');
    const browser = await chromium.launch({
        headless: true,
        ...(process.env.YU3DOH_QA_CHROMIUM
            ? { executablePath: process.env.YU3DOH_QA_CHROMIUM }
            : {}),
        args: ['--no-sandbox'],
    });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
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
    const shot = async (name) => {
        await page.screenshot({
            path: path.join(output, name + '.png'),
            fullPage: true,
            animations: 'disabled',
        });
        cases.push({ name, sha, result: 'PASS' });
        console.log(`RUN014 UI ${name} PASS`);
    };
    const modal = () => page.locator('.ant-modal:visible');
    const visible = (l) => l.waitFor({ state: 'visible' });
    const close = async () => {
        await modal().getByRole('button', { name: 'Cancel', exact: true }).click();
        await page.locator('.ant-modal:visible').waitFor({ state: 'hidden' });
    };
    const open = async (name) => {
        const x = page.locator('.ant-drawer:visible .ant-drawer-close');
        if (await x.count()) {
            await x.click();
            await page.locator('.ant-drawer:visible').waitFor({ state: 'hidden' });
        }
        await page
            .locator('.library-card')
            .filter({ hasText: `QA ${name}` })
            .click();
        await visible(page.getByRole('button', { name: 'Edit', exact: true }));
    };
    const review = async (block) => {
        await page.getByRole('button', { name: `Review / Confirm ${block}`, exact: true }).click();
        await visible(modal().getByText(/Validation: PASS|Validation: FAIL/));
    };
    const confirm = async () => {
        await modal().getByRole('button', { name: 'Confirm block', exact: true }).click();
        await visible(
            modal().getByText('Block confirmed. Authoritative detail and provenance adopted.', {
                exact: true,
            }),
        );
    };
    const card = (name) => api(`/api/v1/library/cards/${info.cards[name]}`);
    const state = (d, block) => d.confirmations.find((c) => c.block === block)?.state || 'DRAFT';
    try {
        await page.goto('http://127.0.0.1:3000/ygocarder/library/');
        await open('Valid');
        const before = await api('/_qa/domain');
        await review('STRUCTURE');
        assert.equal(
            await modal().getByRole('button', { name: 'Confirm block', exact: true }).isEnabled(),
            true,
        );
        assert.deepEqual(await api('/_qa/domain'), before);
        await shot('01-valid-draft-review-read-only');
        await close();
        assert.deepEqual(await api('/_qa/domain'), before);
        await shot('02-cancel-read-only');
        const previous = await card('Valid');
        await review('STRUCTURE');
        await modal().getByLabel('Confirmation source kind', { exact: true }).fill('   ');
        assert.equal(
            await modal().getByRole('button', { name: 'Confirm block', exact: true }).isEnabled(),
            false,
        );
        await shot('03-blank-provenance-blocked');
        await modal().getByLabel('Confirmation source kind', { exact: true }).fill('MANUAL');
        await modal()
            .getByLabel('Confirmation note (optional)', { exact: true })
            .fill('RUN014 browser provenance');
        await confirm();
        const changed = await card('Valid');
        assert.equal(state(changed, 'STRUCTURE'), 'CONFIRMED');
        assert.equal(Number(changed.revision), Number(previous.revision) + 1);
        for (const key of ['password', 'structure', 'localizations', 'classification', 'relations'])
            assert.deepEqual(changed[key], previous[key]);
        assert.equal(changed.provenance.at(-1).note, 'RUN014 browser provenance');
        const mutations = requests.filter((r) => r.method === 'PATCH');
        assert.deepEqual(Object.keys(mutations[0].body).sort(), [
            'confirmations',
            'expected_revision',
        ]);
        assert.equal(mutations[0].body.confirmations.length, 1);
        await shot('04-confirm-authoritative-provenance');
        await close();
        assert.equal(
            await page
                .getByRole('button', { name: 'Review / Confirm STRUCTURE', exact: true })
                .count(),
            0,
        );
        await open('Invalid');
        const invalidBefore = await api('/_qa/domain');
        await review('STRUCTURE');
        await visible(modal().getByText('Validation: FAIL', { exact: true }));
        assert.equal(
            await modal().getByRole('button', { name: 'Confirm block', exact: true }).isEnabled(),
            false,
        );
        assert.deepEqual(await api('/_qa/domain'), invalidBefore);
        await shot('05-invalid-draft-domain-reason');
        await close();
        await open('Languages');
        for (const language of ['ES', 'JP', 'EN']) {
            const previous = await card('Languages');
            await review(`TEXT:${language}`);
            await confirm();
            const next = await card('Languages');
            assert.equal(state(next, `TEXT:${language}`), 'CONFIRMED');
            for (const other of ['EN', 'ES', 'JP'].filter((l) => l !== language))
                assert.equal(state(next, `TEXT:${other}`), state(previous, `TEXT:${other}`));
            await shot(`06-language-${language}-independent`);
            await close();
        }
        await open('Stale');
        await review('STRUCTURE');
        await api('/_qa/stale', 'POST');
        const staleBefore = await api('/_qa/domain');
        await modal().getByRole('button', { name: 'Confirm block', exact: true }).click();
        await visible(
            modal().getByText(
                'Card changed since Review. Authoritative detail refreshed; Review again before confirming. No operation was replayed.',
                { exact: true },
            ),
        );
        assert.deepEqual(await api('/_qa/domain'), staleBefore);
        assert.equal(
            await modal().getByRole('button', { name: 'Confirm block', exact: true }).isEnabled(),
            false,
        );
        await shot('07-stale-no-replay-authoritative-refresh');
        await modal().getByRole('button', { name: 'Review again', exact: true }).click();
        await visible(modal().getByText('Validation: PASS', { exact: true }));
        await confirm();
        await close();
        await open('Valid');
        await page.getByRole('button', { name: 'Edit', exact: true }).click();
        assert.equal(await page.getByRole('button', { name: /Review \/ Confirm/ }).count(), 0);
        await page.getByLabel('Password', { exact: true }).fill('14000010');
        await page.getByRole('button', { name: 'Save', exact: true }).click();
        await visible(modal().getByText('Confirmed block modification', { exact: true }));
        await shot('08-confirmed-edit-guard');
        await modal().getByRole('button', { name: 'Move to Draft and Save', exact: true }).click();
        await visible(
            page.getByRole('button', { name: 'Review / Confirm STRUCTURE', exact: true }),
        );
        assert.equal(state(await card('Valid'), 'STRUCTURE'), 'DRAFT');
        await shot('09-existing-move-to-draft');
        await review('STRUCTURE');
        await confirm();
        await close();
        await page.getByRole('button', { name: 'Edit', exact: true }).click();
        await page.getByLabel('Password', { exact: true }).fill('14000011');
        await page.getByRole('button', { name: 'Save', exact: true }).click();
        await modal().locator('select').selectOption('CONFIRMED');
        await modal().getByRole('button', { name: 'Reconfirm and Save', exact: true }).click();
        await visible(page.getByRole('button', { name: 'Edit', exact: true }));
        assert.equal(state(await card('Valid'), 'STRUCTURE'), 'CONFIRMED');
        await shot('10-existing-reconfirm-on-edit');
        await page.getByRole('button', { name: 'Variants / Assets', exact: true }).click();
        assert.equal(
            await page.getByRole('button', { name: 'Open Standard', exact: true }).isEnabled(),
            false,
        );
        await shot('11-carder-unconfirmed-language-blocked');
        await page.getByRole('button', { name: 'Canonical', exact: true }).click();
        await review('TEXT:EN');
        await confirm();
        await close();
        await page.getByRole('button', { name: 'Variants / Assets', exact: true }).click();
        const response = page.waitForResponse((r) =>
            r.url().endsWith('/api/v1/carder/prepare-working-card'),
        );
        const popup = page.waitForEvent('popup');
        await page.getByRole('button', { name: 'Open Standard', exact: true }).click();
        assert.equal((await response).status(), 200);
        await (await popup).close();
        await shot('12-carder-confirmed-language-launch');
        assert.deepEqual(errors, []);
        await fs.writeFile(
            path.join(output, 'evidence.json'),
            JSON.stringify(
                { sha, os: process.platform, workspace: info, cases, requests, pageErrors: errors },
                null,
                2,
            ),
        );
        console.log(`RUN014 UI evidence: ${cases.length} PASS / 0 FAIL / 0 SKIP at ${sha}`);
    } catch (e) {
        await page.screenshot({ path: path.join(output, 'failure.png'), fullPage: true });
        await fs.writeFile(
            path.join(output, 'failure.json'),
            JSON.stringify({ sha, error: String(e), cases, requests, pageErrors: errors }, null, 2),
        );
        throw e;
    } finally {
        await browser.close();
    }
}
run().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
