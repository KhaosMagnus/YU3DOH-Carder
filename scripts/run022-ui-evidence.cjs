const assert = require('node:assert/strict'),
    fs = require('node:fs/promises'),
    path = require('node:path');
const { execFileSync } = require('node:child_process'),
    { chromium } = require('playwright-core');
const output = process.env.YU3DOH_QA_OUTPUT;
if (!output) throw Error('Evidence output required');
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
    const cases = [],
        proofs = {},
        initial = await api('/api/v1/workspace/_qa/snapshot');
    const pass = (id) => {
        cases.push({ id, result: 'PASS', sha });
        console.log(`RUN022 UI ${id} PASS`);
    };
    assert.equal(initial.status.state, 'NEEDS_MIGRATION');
    assert.equal(initial.status.database_schema_version, 7);
    pass('UI-22-01-schema7-no-implicit-migration');
    proofs.migration = await api('/api/v1/workspace/migrate', 'POST');
    assert.deepEqual(proofs.migration.appliedVersions, [8]);
    assert.equal(proofs.migration.status.database_schema_version, 8);
    pass('UI-22-02-explicit-migration8-ready');
    const metadata = await api('/api/v1/library/editor-metadata');
    proofs.metadata = metadata;
    for (const code of [
        'DIVINE',
        'CYBERSE',
        'ILLUSION',
        '1',
        '2',
        '3',
        '4',
        '6',
        '7',
        '8',
        '9',
    ])
        assert(JSON.stringify(metadata).includes('"' + code + '"'));
    pass('UI-22-03-standard-registry-metadata');
    for (const code of [
        'CUSTOM_ATTRIBUTE',
        'CUSTOM_RACE',
        'CUSTOM_MARKER',
        '5',
    ])
        assert(JSON.stringify(metadata).includes('"' + code + '"'));
    pass('UI-22-04-custom-registry-preserved');
    const browser = await chromium.launch({
        headless: true,
        ...(process.env.YU3DOH_QA_CHROMIUM
            ? { executablePath: process.env.YU3DOH_QA_CHROMIUM }
            : {}),
        args: ['--no-sandbox'],
    });
    const page = await browser.newPage({
            viewport: { width: 1450, height: 1100 },
        }),
        errors = [],
        requests = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('request', (r) => {
        if (r.url().includes('/api/v1/'))
            requests.push({
                url: r.url(),
                method: r.method(),
                body: r.postDataJSON(),
            });
    });
    const panel = () => page.locator('.library-external-sources');
    const button = (name) => panel().getByRole('button', { name, exact: true });
    try {
        await page.goto('http://127.0.0.1:3000/ygocarder/library/');
        await page
            .locator('.library-card')
            .filter({
                has: page.getByRole('heading', {
                    name: 'RUN022 Library',
                    exact: true,
                }),
            })
            .click();
        await page
            .locator('.library-detail__sections')
            .getByRole('button', { name: 'External Sources', exact: true })
            .click();
        await button('Open stored retrieval').click();
        await panel()
            .getByRole('heading', {
                name: 'Candidate · Non-authoritative',
                exact: true,
            })
            .waitFor();
        assert.match(await panel().innerText(), /normalizer 1/);
        assert.match(await panel().innerText(), /UNMAPPED/);
        pass('UI-22-05-historical-v1-inspectable');
        const old = await api(
            '/api/v1/library/external-sources/retrievals/' +
                info.historical_retrieval_id +
                '?include_raw=true',
        );
        proofs.historical_v1 = old;
        await panel()
            .getByLabel('External card ID', { exact: true })
            .fill('13036');
        await button('Re-retrieve').click();
        await panel()
            .getByText(/normalizer 2/)
            .waitFor();
        pass('UI-22-06-explicit-v2-append');
        const state = await api('/api/v1/workspace/_qa/snapshot');
        const newRow = state.tables.external_source_candidates.find(
            (c) => c.normalizer_version === 2,
        );
        assert(newRow);
        const candidate = JSON.parse(newRow.candidate_json);
        proofs.candidate_v2 = candidate;
        for (const [field, value] of Object.entries({
            race_code: 'CYBERSE',
            summon_kind: 'LINK',
            abilities: ['EFFECT'],
            link_rating: 3,
            link_markers: ['2', '7', '9'],
        }))
            assert.deepEqual(
                candidate.blocks.STRUCTURE.fields[field].value,
                value,
            );
        assert.match(await panel().innerText(), /CYBERSE/);
        assert.match(await panel().innerText(), /LINK/);
        assert.match(await panel().innerText(), /EFFECT/);
        pass('UI-22-07-captured-v2-oracle-visible');
        assert.equal(JSON.parse(newRow.diagnostics_json).length, 0);
        assert.match(await panel().innerText(), /No diagnostics/);
        pass('UI-22-08-four-warnings-resolved');
        await button('Compare with this card').click();
        await panel()
            .getByRole('heading', { name: /Read-only diff/ })
            .waitFor();
        const afterDiff = await api('/api/v1/workspace/_qa/snapshot');
        assert.deepEqual(afterDiff.tables, state.tables);
        pass('UI-22-09-read-only-diff-no-writes');
        for (const label of [
            'Apply Structure',
            'Accept Structure',
            'Merge Structure',
            'Create Imported Draft',
        ])
            assert.equal(
                await page
                    .getByRole('button', { name: label, exact: true })
                    .count(),
                0,
            );
        for (const field of [
            'race_code',
            'summon_kind',
            'abilities',
            'link_markers',
        ])
            assert.equal(
                await panel()
                    .getByLabel('Select STRUCTURE/' + field, { exact: true })
                    .isDisabled(),
                true,
            );
        pass('UI-22-10-no-structure-actions');
        await page.screenshot({
            path: path.join(output, 'v2-read-only-structure.png'),
            fullPage: true,
        });
        await panel()
            .getByLabel('Select TEXT:EN/name', { exact: true })
            .check();
        await button('Review selected text').click();
        await button('Apply text').waitFor();
        assert.equal(await button('Apply text').isEnabled(), true);
        pass('UI-22-11-text-review-v2-available');
        await button('Apply text').click();
        await page.waitForFunction(() =>
            document.body.innerText.includes('Applied revision'),
        );
        const after = await api('/api/v1/workspace/_qa/snapshot');
        assert.deepEqual(
            after.tables.canonical_monster_structure,
            state.tables.canonical_monster_structure,
        );
        const apply = requests.filter((r) => r.url.endsWith('/apply-text'));
        assert.equal(apply.length, 1);
        assert.deepEqual(apply[0].body.selected_fields, [
            { block: 'TEXT:EN', field: 'name' },
        ]);
        pass('UI-22-12-text-apply-no-structure');
        assert.deepEqual(
            await api(
                '/api/v1/library/external-sources/retrievals/' +
                    info.historical_retrieval_id +
                    '?include_raw=true',
            ),
            old,
        );
        assert.equal(after.tables.external_source_candidates.length, 2);
        assert.deepEqual(
            after.tables.external_source_candidates,
            state.tables.external_source_candidates,
        );
        pass('UI-22-13-append-only-history-unchanged');
        assert.equal(after.mockedCardRequests, 1);
        assert.equal(after.providerMetadataRequests, 0);
        assert.equal(after.liveProviderRequests, 0);
        pass('UI-22-14-zero-live-and-metadata-requests');
        assert.deepEqual(errors, []);
        assert.equal(
            await page
                .getByRole('button', { name: /registry administration/i })
                .count(),
            0,
        );
        pass('UI-22-15-no-js-error-or-registry-ui');
        proofs.final = after;
        await page.screenshot({
            path: path.join(output, 'text-apply-result.png'),
            fullPage: true,
        });
    } finally {
        await fs.writeFile(
            path.join(output, 'evidence.json'),
            JSON.stringify({ sha, cases, errors, requests, proofs }, null, 2),
        );
        await browser.close();
    }
}
run().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
