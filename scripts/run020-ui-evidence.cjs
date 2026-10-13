const assert = require('node:assert/strict'),
    fs = require('node:fs/promises'),
    path = require('node:path'),
    { execFileSync } = require('node:child_process');
const { chromium } = require('playwright-core');
const output = process.env.YU3DOH_QA_OUTPUT;
if (!output) throw new Error('Evidence output directory is required.');
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
    assert.equal(info.sha, sha);
    const browser = await chromium.launch({
        headless: true,
        ...(process.env.YU3DOH_QA_CHROMIUM
            ? { executablePath: process.env.YU3DOH_QA_CHROMIUM }
            : {}),
        args: ['--no-sandbox'],
    });
    const page = await browser.newPage({
        viewport: { width: 1450, height: 1100 },
    });
    const requests = [],
        errors = [],
        cases = [];
    let popups = 0;
    page.on('request', (r) => {
        if (r.url().includes('/api/v1/') || r.url().includes('example.invalid'))
            requests.push({
                url: r.url(),
                method: r.method(),
                body: r.postDataJSON(),
            });
    });
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('popup', () => popups++);
    const panel = () => page.locator('.library-external-sources');
    const sections = () => page.locator('.library-detail__sections');
    const shot = async (id, extra = {}) => {
        await panel().scrollIntoViewIfNeeded();
        await page.screenshot({
            path: path.join(output, id + '.png'),
            fullPage: true,
            animations: 'disabled',
        });
        cases.push({ id, result: 'PASS', sha, ...extra });
        console.log(`RUN020 UI ${id} PASS`);
    };
    const snapshot = () => api('/api/v1/workspace/_qa/snapshot');
    const external = async () => {
        await sections()
            .getByRole('button', { name: 'External Sources', exact: true })
            .click();
        await panel()
            .getByText('No stored retrievals for this card.', { exact: true })
            .waitFor();
    };
    const btn = (name) => panel().getByRole('button', { name, exact: true });
    try {
        await page.goto('http://127.0.0.1:3000/ygocarder/library/');
        await page
            .locator('.library-card')
            .filter({
                has: page.getByRole('heading', {
                    name: 'RUN020 Library',
                    exact: true,
                }),
            })
            .click();
        await sections().waitFor();
        await page.waitForLoadState('networkidle');
        const before = await snapshot();
        await external();
        assert.equal((await snapshot()).remoteRequests, 0);
        await shot('UI-20-01-open-zero-provider');
        assert.deepEqual((await snapshot()).tables, before.tables);
        await shot('UI-20-02-inspection-zero-db-writes');
        assert.equal(await btn('Retrieve').isEnabled(), false);
        await panel()
            .getByLabel('External card ID', { exact: true })
            .fill('01');
        assert.equal(await btn('Retrieve').isEnabled(), false);
        await shot('UI-20-03-invalid-id');
        await panel()
            .getByLabel('External card ID', { exact: true })
            .fill('17625');
        assert.equal(await btn('Retrieve').isEnabled(), true);
        await btn('Retrieve').click();
        await panel()
            .getByRole('heading', {
                name: 'Candidate · Non-authoritative',
                exact: true,
            })
            .waitFor();
        assert.equal((await snapshot()).remoteRequests, 1);
        await shot('UI-20-04-explicit-retrieve');
        const after = await snapshot();
        for (const [name, rows] of Object.entries(before.tables))
            if (!name.startsWith('external_source_'))
                assert.deepEqual(after.tables[name], rows, name);
        await shot('UI-20-05-all-authoritative-domains-unchanged');
        await panel()
            .getByRole('heading', { name: 'Locale availability', exact: true })
            .waitFor();
        assert.match(await panel().innerText(), /EN: Usable/);
        assert.match(await panel().innerText(), /ES: Usable/);
        assert.match(await panel().innerText(), /JP: Usable/);
        await shot('UI-20-06-locale-review');
        await btn('Review raw evidence').click();
        await panel().locator('.library-external-sources__raw').waitFor();
        assert.match(
            await panel().locator('.library-external-sources__raw').innerText(),
            /<script>/,
        );
        assert.equal(await panel().locator('script,img,iframe,a').count(), 0);
        assert.equal(
            await page.evaluate(() => window.REMOTE_EXECUTED),
            undefined,
        );
        await shot('UI-20-07-raw-escaped');
        await btn('Compare with this card').click();
        await panel().locator('.library-external-sources__diff').waitFor();
        assert.deepEqual(
            await panel()
                .locator('.library-external-sources__diff h4')
                .allTextContents(),
            ['STRUCTURE', 'TEXT:EN', 'TEXT:ES', 'TEXT:JP'],
        );
        await shot('UI-20-08-read-only-four-groups');
        assert.match(
            await panel()
                .locator('.library-external-sources__diff')
                .innerText(),
            /DIFFERENT/,
        );
        assert.match(
            await panel()
                .locator('.library-external-sources__diff')
                .innerText(),
            /Persisted Canonical text/,
        );
        await shot('UI-20-09-server-persisted-diff');
        assert.equal(await btn('Re-retrieve').isEnabled(), true);
        await shot('UI-20-10-explicit-refresh-action');
        const stored = await snapshot();
        await btn('Open stored retrieval').click();
        await panel()
            .getByRole('heading', { name: 'Snapshot summary', exact: true })
            .waitFor();
        await page.waitForLoadState('networkidle');
        assert.deepEqual(await snapshot(), stored);
        await shot('UI-20-11-open-stored-no-network-or-write');
        for (const name of [
            'Apply',
            'Accept',
            'Import',
            'Create Draft',
            'Confirm',
            'Move to Draft',
            'Merge',
            'Rebase',
            'Auto-match',
        ])
            assert.equal(
                await panel()
                    .getByRole('button', { name, exact: true })
                    .count(),
                0,
            );
        await shot('UI-20-12-no-canonical-actions');
        await btn('Re-retrieve').click();
        await panel()
            .getByRole('heading', {
                name: 'Candidate · Non-authoritative',
                exact: true,
            })
            .waitFor();
        const refreshed = await snapshot();
        assert.equal(refreshed.remoteRequests, 2);
        assert.equal(refreshed.tables.external_source_records.length, 1);
        assert.equal(refreshed.tables.external_source_retrievals.length, 2);
        assert.equal(refreshed.tables.external_source_documents.length, 2);
        assert.equal(refreshed.tables.external_source_candidates.length, 2);
        await shot('UI-20-13-append-only-reretrieve');
        await page.getByRole('button', { name: 'Edit', exact: true }).click();
        const password = page
            .locator('.library-editor-form')
            .getByLabel('Password', { exact: true });
        // Existing editor labels may not associate via htmlFor; use its visible Identity input when necessary.
        const passwordInput = (await password.count())
            ? password
            : page.locator('.library-detail').locator('input').first();
        await passwordInput.fill('29999999');
        await sections()
            .getByRole('button', { name: 'External Sources', exact: true })
            .click();
        await btn('Open stored retrieval').first().waitFor();
        await btn('Open stored retrieval').first().click();
        await panel()
            .getByRole('heading', {
                name: 'Candidate · Non-authoritative',
                exact: true,
            })
            .waitFor();
        assert.match(
            await panel().innerText(),
            /Unsaved Canonical edits are not included/,
        );
        await shot('UI-20-14-dirty-warning');
        await btn('Compare with this card').click();
        await panel().locator('.library-external-sources__diff').waitFor();
        assert.equal(
            (await snapshot()).tables.canonical_cards[0].password,
            '20000001',
        );
        await shot('UI-20-15-dirty-diff-uses-persisted');
        await sections()
            .getByRole('button', { name: 'Canonical', exact: true })
            .click();
        assert.equal(await passwordInput.inputValue(), '29999999');
        await sections()
            .getByRole('button', { name: 'External Sources', exact: true })
            .click();
        await btn('Open stored retrieval').first().waitFor();
        await btn('Open stored retrieval').first().click();
        await panel()
            .getByRole('heading', {
                name: 'Candidate · Non-authoritative',
                exact: true,
            })
            .waitFor();
        await shot('UI-20-16-editor-dirty-preserved');
        const change = await api('/api/v1/workspace/_qa/change', 'POST', {});
        await btn('Compare with this card').click();
        await panel()
            .getByText(
                'Canonical revision does not match the frozen expected revision.',
                { exact: true },
            )
            .waitFor();
        assert.equal(change.revision, String(Number(info.card.revision) + 1));
        await shot('UI-20-17-stale-revision-rejected');
        assert.equal(
            requests.some((r) => r.url.includes('example.invalid')),
            false,
        );
        assert.equal(
            requests.some((r) => r.url.includes('db.ygoresources.com')),
            false,
        );
        assert.equal(popups, 0);
        assert.equal(
            await page.evaluate(() => window.REMOTE_EXECUTED),
            undefined,
        );
        await shot('UI-20-18-no-remote-browser-resource');
        const mutationRequests = requests.filter((r) => r.method !== 'GET');
        assert(
            mutationRequests.every(
                (r) =>
                    r.url.endsWith('/ygoresources/retrieve') ||
                    r.url.endsWith('/diff'),
            ),
        );
        assert.equal(errors.length, 0);
        await shot('UI-20-19-no-unexpected-mutation-or-js-error');
        await fs.writeFile(
            path.join(output, 'evidence.json'),
            JSON.stringify(
                {
                    run: 'RUN020',
                    sha,
                    cases,
                    requests,
                    errors,
                    popups,
                    provider_requests: (await snapshot()).remoteRequests,
                    deterministic: true,
                },
                null,
                2,
            ),
        );
    } finally {
        await browser.close();
    }
}
run().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
