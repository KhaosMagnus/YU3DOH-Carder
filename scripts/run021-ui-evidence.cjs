const assert = require('node:assert/strict'),
    fs = require('node:fs/promises'),
    path = require('node:path');
const { execFileSync } = require('node:child_process');
const { chromium } = require('playwright-core');
const output = process.env.YU3DOH_QA_OUTPUT;
if (!output) throw Error('Evidence directory required');
const sha = execFileSync('git', ['rev-parse', 'HEAD'], {
    encoding: 'utf8',
}).trim();
async function api(route, method = 'GET', body) {
    const r = await fetch('http://127.0.0.1:4312' + route, {
        method,
        headers: body ? { 'content-type': 'application/json' } : {},
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
        viewport: { width: 1460, height: 1100 },
    });
    const cases = [],
        requests = [],
        errors = [];
    page.on('request', (r) => {
        requests.push({
            url: r.url(),
            method: r.method(),
            body: r.postDataJSON(),
        });
    });
    page.on('pageerror', (e) => errors.push(e.message));
    const panel = () => page.locator('.library-external-sources');
    const sections = () => page.locator('.library-detail__sections');
    const btn = (name) => panel().getByRole('button', { name, exact: true });
    const box = (name) => panel().getByRole('checkbox', { name, exact: true });
    const snapshot = () => api('/api/v1/workspace/_qa/snapshot');
    const displayedRevision = () =>
        page
            .locator('.library-detail')
            .getByText('revision', { exact: true })
            .locator('..')
            .innerText();
    const shot = async (id) => {
        await page.screenshot({
            path: path.join(output, id + '.png'),
            fullPage: true,
            animations: 'disabled',
        });
        cases.push({ id, result: 'PASS', sha });
        console.log('RUN021 UI ' + id + ' PASS');
    };
    const openStored = async () => {
        await sections()
            .getByRole('button', { name: 'External Sources', exact: true })
            .click();
        await btn('Open stored retrieval').waitFor();
        await btn('Open stored retrieval').click();
        await panel()
            .getByRole('heading', {
                name: 'Candidate · Non-authoritative',
                exact: true,
            })
            .waitFor();
    };
    const openCard = async (key) => {
        await page.goto('http://127.0.0.1:3000/ygocarder/library/');
        await page
            .locator('.library-card')
            .filter({
                has: page.getByRole('heading', {
                    name: 'RUN021 ' + key,
                    exact: true,
                }),
            })
            .click();
        await sections().waitFor();
        await openStored();
    };
    const applyRequests = () =>
        requests.filter((r) => r.url.endsWith('/apply-text'));
    try {
        await openCard('Mixed');
        const before = await snapshot();
        assert.equal(before.providerRequests, 0);
        assert.match(await panel().innerText(), /retrieval is disabled/);
        await shot('UI-21-01-offline-stored-candidate');
        assert.equal(await box('Select TEXT:EN/name').isEnabled(), true);
        assert.equal(await box('Select TEXT:ES/card_text').isEnabled(), true);
        await shot('UI-21-02-eligible-text-selection');
        for (const name of [
            'STRUCTURE/family',
            'TEXT:ES/name',
            'TEXT:ES/pendulum_text',
            'TEXT:JP/name',
        ])
            assert.equal(await box('Select ' + name).isEnabled(), false, name);
        await shot('UI-21-03-structure-absent-unmapped-invalid-disabled');
        assert.equal(
            await box('Select TEXT:EN/pendulum_text').isEnabled(),
            false,
        );
        assert.equal(await box('Select TEXT:JP/card_text').isEnabled(), true);
        assert.match(await panel().innerText(), /Empty string/);
        await shot('UI-21-04-empty-string-and-pendulum-applicability');
        await page.getByRole('button', { name: 'Edit', exact: true }).click();
        const password = page
            .locator('.library-editor-form')
            .getByLabel('Password', { exact: true });
        const input = (await password.count())
            ? password
            : page.locator('.library-detail').locator('input').first();
        await input.fill('21999999');
        await openStored();
        assert.match(await panel().innerText(), /Save, cancel, or discard/);
        assert.equal(await btn('Review selected text').isEnabled(), false);
        await shot('UI-21-05-dirty-editor-blocks-apply');
        await btn('Compare with this card').click();
        await panel().locator('.library-external-sources__diff').waitFor();
        assert.deepEqual((await snapshot()).tables, before.tables);
        await shot('UI-21-06-dirty-history-diff-remain-readable');
        await sections()
            .getByRole('button', { name: 'Canonical', exact: true })
            .click();
        assert.equal(await input.inputValue(), '21999999');
        await page.getByRole('button', { name: 'Cancel', exact: true }).click();
        await openStored();
        await shot('UI-21-07-no-autosave-or-discard');
        await box('Select TEXT:ES/card_text').check();
        await box('Select TEXT:EN/card_text').check();
        await box('Select TEXT:EN/name').check();
        await btn('Compare with this card').click();
        await panel().locator('.library-external-sources__diff').waitFor();
        await btn('Review selected text').click();
        const review = panel().locator(
            '.library-external-sources__apply-review',
        );
        await review.waitFor();
        assert.match(await review.innerText(), /frozen revision/);
        assert.match(await review.innerText(), /current persisted revision/);
        assert.match(await review.innerText(), /Same text/);
        assert.match(await review.innerText(), /CHANGE/);
        assert.match(await review.innerText(), /NO_OP/);
        await shot('UI-21-08-exact-source-current-review');
        assert.match(
            await review.innerText(),
            /A successful Apply advances the card revision/,
        );
        assert.equal(await review.getByRole('checkbox').count(), 1);
        assert.equal(await box('Move TEXT:EN to DRAFT').isChecked(), false);
        assert.equal(await btn('Apply text').isEnabled(), false);
        await shot('UI-21-09-exact-confirmed-block-acknowledgement');
        await box('Move TEXT:EN to DRAFT').check();
        await review
            .getByLabel('Provenance note', { exact: true })
            .fill('  reviewed offline  ');
        const apply = page.waitForResponse((r) =>
            r.url().endsWith('/apply-text'),
        );
        await btn('Apply text').click();
        const applyResponse = await apply;
        assert.equal(applyResponse.status(), 200);
        const response = await applyResponse.json();
        assert.equal(
            response.revision,
            String(Number(info.cases.Mixed.revision) + 1),
        );
        await panel()
            .getByText(/Applied revision/)
            .waitFor();
        await page.waitForLoadState('networkidle');
        await shot('UI-21-10-changed-apply-server-revision');
        assert.equal(await review.count(), 0);
        assert.equal(
            await panel().locator('.library-external-sources__diff').count(),
            0,
        );
        assert.equal(
            await panel()
                .locator('input[aria-label^="Select "]:checked')
                .count(),
            0,
        );
        assert.match(await panel().innerText(), /candidate is stale/);
        assert.equal(await box('Select TEXT:EN/name').isEnabled(), false);
        await shot('UI-21-11-clear-selection-review-diff-and-stale');
        const after = await snapshot();
        for (const [name, rows] of Object.entries(before.tables))
            if (
                ![
                    'canonical_cards',
                    'canonical_localized_text',
                    'canonical_provenance',
                    'canonical_block_states',
                ].includes(name)
            )
                assert.deepEqual(after.tables[name], rows, name);
        assert.equal(after.providerRequests, 0);
        const provenance = after.tables.canonical_provenance.filter(
            (p) => p.source_kind === 'EXTERNAL_SOURCE',
        );
        assert.equal(provenance.length, 2);
        assert(provenance.every((p) => p.note === 'reviewed offline'));
        assert.equal(
            after.tables.canonical_block_states.find(
                (c) =>
                    c.card_id === info.cases.Mixed.card_id &&
                    c.block_key === 'TEXT:EN',
            )?.state ??
                after.tables.canonical_block_states.find(
                    (c) =>
                        c.card_id === info.cases.Mixed.card_id &&
                        c.block === 'TEXT:EN',
                )?.state,
            'DRAFT',
        );
        await shot('UI-21-12-only-selected-text-and-field-provenance');
        assert.equal(
            requests.some((r) => r.url.includes('db.ygoresources.com')),
            false,
        );
        assert.equal(
            await page.evaluate(() => window.REMOTE_EXECUTED),
            undefined,
        );
        assert.equal(await panel().locator('script,img,iframe').count(), 0);
        await shot('UI-21-13-accepted-text-inert-no-provider');
        await sections()
            .getByRole('button', { name: 'Canonical', exact: true })
            .click();
        assert.match(
            await page.locator('.library-detail').innerText(),
            /Accepted Mixed/,
        );
        assert.match(
            await page.locator('.library-detail').innerText(),
            /TEXT:EN: DRAFT|TEXT:EN.*DRAFT/s,
        );
        assert.match(
            await page.locator('.library-detail').innerText(),
            new RegExp('revision.*' + response.revision, 's'),
        );
        assert.equal(
            await displayedRevision(),
            `revision: ${response.revision}`,
        );
        await page.getByText('TEXT:EN: DRAFT', { exact: true }).waitFor();
        await shot('UI-21-14-authoritative-detail-and-draft-refresh');
        await sections()
            .getByRole('button', { name: 'Sources / Provenance', exact: true })
            .click();
        await page
            .getByText('External source', { exact: false })
            .first()
            .waitFor();
        assert.match(
            await page.locator('.library-detail').innerText(),
            /workspace-external-candidate/,
        );
        await shot('UI-21-15-provenance-refresh-label-and-source-ref');
        await openStored();
        assert.equal(await btn('Open stored retrieval').count(), 1);
        assert.match(await panel().innerText(), /candidate is stale/);
        await shot('UI-21-16-history-retained-after-apply');
        await openCard('No-op');
        const noOpBefore = await snapshot();
        const noOpDisplayedRevision = await displayedRevision();
        await box('Select TEXT:EN/name').check();
        await btn('Review selected text').click();
        assert.equal(
            await panel()
                .locator('.library-external-sources__apply-review')
                .getByRole('checkbox')
                .count(),
            0,
        );
        assert.match(
            await panel()
                .locator('.library-external-sources__apply-review')
                .innerText(),
            /NO_OP/,
        );
        await btn('Apply text').click();
        await panel()
            .getByText('No Canonical values changed.', { exact: true })
            .waitFor();
        const noOpAfter = await snapshot();
        assert.deepEqual(noOpAfter.tables, noOpBefore.tables);
        assert.equal(await displayedRevision(), noOpDisplayedRevision);
        assert.equal(await btn('Review selected text').isEnabled(), true);
        assert.doesNotMatch(await panel().innerText(), /candidate is stale/);
        await shot('UI-21-17-no-op-no-revision-provenance-or-stale');
        await openCard('Pendulum');
        assert.equal(
            await box('Select TEXT:EN/pendulum_text').isEnabled(),
            true,
        );
        await box('Select TEXT:EN/pendulum_text').check();
        await btn('Review selected text').click();
        assert.match(
            await panel()
                .locator('.library-external-sources__apply-review')
                .innerText(),
            /Empty string/,
        );
        await btn('Apply text').click();
        await panel()
            .getByText(/Applied revision/)
            .waitFor();
        await page.waitForLoadState('networkidle');
        const pend = await api(
            '/api/v1/library/cards/' + info.cases.Pendulum.card_id,
        );
        assert.equal(
            pend.localizations.find((l) => l.language === 'EN').pendulum_text,
            '',
        );
        assert.deepEqual(pend.structure.abilities, ['PENDULUM']);
        await shot(
            'UI-21-18-pendulum-empty-string-applies-without-structure-write',
        );
        await openCard('Conflict');
        await box('Select TEXT:EN/name').check();
        await btn('Review selected text').click();
        await api('/api/v1/workspace/_qa/conflict', 'POST', {});
        const conflictBefore = await snapshot();
        const count = applyRequests().length;
        await btn('Apply text').click();
        await panel()
            .getByText(/Canonical revision no longer matches/)
            .waitFor();
        await page.waitForLoadState('networkidle');
        assert.equal(applyRequests().length, count + 1);
        assert.equal(
            await displayedRevision(),
            `revision: ${Number(info.cases.Conflict.revision) + 1}`,
        );
        assert.equal(
            await panel()
                .locator('.library-external-sources__apply-review')
                .count(),
            0,
        );
        assert.match(await panel().innerText(), /candidate is stale/);
        assert.deepEqual((await snapshot()).tables, conflictBefore.tables);
        await shot('UI-21-19-revision-conflict-no-retry-rebase-or-optimism');
        assert.equal((await snapshot()).providerRequests, 0);
        assert.equal(errors.length, 0);
        await shot('UI-21-20-no-provider-request-or-javascript-error');
        await fs.writeFile(
            path.join(output, 'evidence.json'),
            JSON.stringify(
                {
                    run: 'RUN021',
                    sha,
                    cases,
                    requests,
                    errors,
                    provider_requests: 0,
                    deterministic: true,
                },
                null,
                2,
            ),
        );
        console.log(
            `RUN021 UI evidence: ${cases.length} PASS / 0 FAIL / 0 SKIP`,
        );
    } finally {
        await browser.close();
    }
}
run().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
