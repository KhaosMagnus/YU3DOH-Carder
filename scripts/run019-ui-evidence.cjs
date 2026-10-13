const assert = require('node:assert/strict'),
    fs = require('node:fs/promises'),
    path = require('node:path'),
    { execFileSync } = require('node:child_process');
const { chromium } = require('playwright-core');
const output =
    process.env.YU3DOH_QA_OUTPUT || path.resolve('run019-ui-evidence');
const sha = execFileSync('git', ['rev-parse', 'HEAD'], {
    encoding: 'utf8',
}).trim();
const qa = '/api/v1/workspace/_qa/';
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
    const info = await api(qa + 'info');
    assert.equal(info.sha, sha);
    assert(info.root.includes('RUN019'));
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
    let popups = 0;
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('popup', () => popups++);
    page.on('request', (r) => {
        if (r.url().includes('/api/v1/') || r.url().includes('example.invalid'))
            requests.push({
                path: new URL(r.url()).pathname,
                url: r.url(),
                method: r.method(),
                body: r.postDataJSON(),
            });
    });
    const sections = () => page.locator('.library-detail__sections');
    const sources = () => page.locator('.library-provenance');
    const row = (id) => sources().locator(`[data-provenance-id="${id}"]`);
    const toSources = async () => {
        await sections()
            .getByRole('button', { name: 'Sources / Provenance', exact: true })
            .click();
        await sources().waitFor();
    };
    const canonical = async () =>
        sections()
            .getByRole('button', { name: 'Canonical', exact: true })
            .click();
    const clear = async () =>
        sources()
            .getByRole('button', {
                name: 'Clear provenance filters',
                exact: true,
            })
            .click();
    const shot = async (id, extra = {}, focus = sources()) => {
        await focus.scrollIntoViewIfNeeded();
        await page.screenshot({
            path: path.join(output, id + '.png'),
            fullPage: true,
            animations: 'disabled',
        });
        cases.push({ id, sha, result: 'PASS', ...extra });
        console.log(`RUN019 UI ${id} PASS`);
    };
    const open = async (name) => {
        if (await page.locator('.ant-drawer-open').count()) {
            await page.locator('.ant-drawer-close').click();
            await page.locator('.ant-drawer-open').waitFor({ state: 'hidden' });
        }
        const loaded = page.waitForResponse(
            (r) =>
                r.url().endsWith('/variants') && r.request().method() === 'GET',
        );
        await page
            .locator('.library-card')
            .filter({ has: page.getByRole('heading', { name, exact: true }) })
            .click();
        await loaded;
        await page.getByRole('button', { name: 'Edit', exact: true }).waitFor();
        await page.waitForLoadState('networkidle');
    };
    const bySource = (kind) =>
        info.card.provenance.find((p) => p.sourceKind === kind);
    const codeRow = (kind) => row(bySource(kind).provenanceId);
    const snapshot = () => api(qa + 'snapshot');
    try {
        await page.goto('http://127.0.0.1:3000/ygocarder/library/');
        await page
            .getByRole('heading', { name: 'RUN019 History', exact: true })
            .waitFor();
        await open('RUN019 History');
        const before = await snapshot();
        const calls = requests.length;
        assert.deepEqual(
            await sections().getByRole('button').allTextContents(),
            ['Canonical', 'Sources / Provenance', 'External Sources', 'Variants / Assets'],
        );
        assert.equal(
            await page
                .locator('.library-detail__readonly')
                .getByRole('heading', { name: 'Provenance', exact: true })
                .count(),
            0,
        );
        await toSources();
        await shot('QA-19-01');
        const expected = [...info.card.provenance]
            .sort((a, b) => {
                const x = Date.parse(a.createdAt),
                    y = Date.parse(b.createdAt);
                return !Number.isFinite(x)
                    ? !Number.isFinite(y)
                        ? b.provenanceId - a.provenanceId
                        : 1
                    : !Number.isFinite(y)
                      ? -1
                      : y - x || b.provenanceId - a.provenanceId;
            })
            .map((p) => String(p.provenanceId));
        assert.deepEqual(
            await sources()
                .locator('[data-provenance-id]')
                .evaluateAll((nodes) =>
                    nodes.map((n) => n.getAttribute('data-provenance-id')),
                ),
            expected,
        );
        for (const p of info.card.provenance) {
            const r = row(p.provenanceId);
            const text = await r.innerText();
            for (const value of [
                p.targetKind,
                p.targetKey,
                p.sourceKind,
                p.createdAt,
                p.sourceRef ?? '—',
                p.note ?? '—',
            ])
                assert(text.includes(value), value);
            assert(text.includes('Recorded time'));
        }
        await shot('QA-19-02');
        assert((await codeRow('MANUAL').innerText()).includes('Manual'));
        await shot('QA-19-03');
        assert(
            (await codeRow('CARDER_WRITE_BACK').innerText()).includes(
                'Carder write-back',
            ),
        );
        await shot('QA-19-04');
        assert(
            (await codeRow('LIBRARY_BATCH').innerText()).includes(
                'Library batch',
            ),
        );
        await shot('QA-19-05');
        assert(
            (await codeRow('FUTURE_SOURCE').innerText()).includes(
                'FUTURE_SOURCE',
            ),
        );
        assert((await codeRow('__proto__').innerText()).includes('__proto__'));
        await shot('QA-19-06');
        const current = info.card.confirmations.filter(
            (c) => c.state === 'CONFIRMED',
        );
        for (const p of info.card.provenance.filter(
            (p) => p.targetKind === 'BLOCK' && p.targetKey === 'CLASSIFICATION',
        ))
            assert(
                (await row(p.provenanceId).innerText()).includes(
                    'Current block state: CONFIRMED',
                ),
            );
        assert(
            (await codeRow('CARDER_WRITE_BACK').innerText()).includes(
                'Current block state: DRAFT',
            ),
        );
        await shot('QA-19-07');
        for (const p of info.card.provenance) {
            const blocks = current
                .filter((c) => c.provenanceId === p.provenanceId)
                .map((c) => c.block);
            assert.equal(
                await row(p.provenanceId)
                    .getByText(/CURRENT CONFIRMATION PROVENANCE/)
                    .count(),
                blocks.length,
            );
            for (const block of blocks)
                assert(
                    (await row(p.provenanceId).innerText()).includes(
                        'CURRENT CONFIRMATION PROVENANCE · ' + block,
                    ),
                );
        }
        await shot(
            'QA-19-08',
            {},
            row(current.find((c) => c.block === 'CLASSIFICATION').provenanceId),
        );
        const newestHistorical = info.card.provenance.find((p) =>
            p.note?.includes('Newest historical'),
        );
        assert.equal(
            await row(newestHistorical.provenanceId)
                .getByText(/CURRENT CONFIRMATION PROVENANCE/)
                .count(),
            0,
        );
        assert.equal(
            await codeRow('CARDER_WRITE_BACK')
                .getByText(/CURRENT CONFIRMATION PROVENANCE/)
                .count(),
            0,
        );
        assert(
            Date.parse(newestHistorical.createdAt) >
                Date.parse(
                    info.card.provenance.find(
                        (p) =>
                            p.provenanceId ===
                            current.find((c) => c.block === 'CLASSIFICATION')
                                .provenanceId,
                    ).createdAt,
                ),
        );
        await shot('QA-19-09', {}, row(newestHistorical.provenanceId));
        const relation = info.card.relations[0];
        const rp = info.card.provenance.find(
            (p) =>
                p.targetKind === 'RELATION' &&
                p.targetKey === relation.relationId,
        );
        assert(
            (await row(rp.provenanceId).innerText()).includes(
                relation.targetCardId,
            ),
        );
        assert((await row(rp.provenanceId).innerText()).includes('RELATED'));
        assert(
            (await row(rp.provenanceId).innerText()).includes(
                'Relation note\n—',
            ),
        );
        await shot('QA-19-10');
        const removed = info.card.provenance.find(
            (p) =>
                p.targetKind === 'RELATION' &&
                p.targetKey !== relation.relationId,
        );
        assert(
            (await row(removed.provenanceId).innerText()).includes(
                'Historical relation',
            ),
        );
        assert(
            (await row(removed.provenanceId).innerText()).includes(
                'Current relation no longer present',
            ),
        );
        await shot('QA-19-11', {}, row(removed.provenanceId));
        assert((await codeRow('MANUAL').innerText()).includes('Card identity'));
        const unknown = info.card.provenance.find(
            (p) => p.targetKind === 'MYSTERY',
        );
        assert(
            (await row(unknown.provenanceId).innerText()).includes(
                'opaque-key',
            ),
        );
        assert((await sources().innerText()).includes('OTHER_IDENTITY'));
        await shot('QA-19-12', {}, row(unknown.provenanceId));
        await sources()
            .getByLabel('Target kind', { exact: true })
            .selectOption('BLOCK');
        await sources()
            .getByLabel('Target key / semantic block', { exact: true })
            .selectOption('CLASSIFICATION');
        await sources()
            .getByLabel('Source kind', { exact: true })
            .selectOption('LIBRARY_BATCH');
        assert.equal(
            await sources().locator('[data-provenance-id]').count(),
            1,
        );
        assert.equal(
            await sources()
                .locator('[data-provenance-id]')
                .getAttribute('data-provenance-id'),
            String(bySource('LIBRARY_BATCH').provenanceId),
        );
        await shot('QA-19-13');
        await clear();
        await sources()
            .getByLabel('Search provenance')
            .fill('  ShArEd BaTcH nOtE  ');
        assert.equal(
            await sources().locator('[data-provenance-id]').count(),
            1,
        );
        await clear();
        assert.equal(
            await sources().locator('[data-provenance-id]').count(),
            info.card.provenance.length,
        );
        await shot('QA-19-14');
        await sources()
            .getByLabel('Search provenance')
            .fill('never matches anything');
        await sources()
            .getByText('No provenance matches the current filters.', {
                exact: true,
            })
            .waitFor();
        await clear();
        assert.equal(
            requests.length,
            calls,
            'Provenance inspection/filtering must issue no HTTP request',
        );
        assert.deepEqual(await snapshot(), before);
        await open('RUN019 Empty');
        await toSources();
        await sources()
            .getByText('No provenance recorded for this card.', { exact: true })
            .waitFor();
        await shot('QA-19-15');
        await open('RUN019 History');
        await toSources();
        assert.equal(await sources().locator('a,[href],script').count(), 0);
        await row(unknown.provenanceId)
            .getByText(unknown.sourceRef, { exact: true })
            .click();
        assert.equal(popups, 0);
        assert(!requests.some((r) => r.url.includes('example.invalid')));
        await shot('QA-19-16', {}, row(unknown.provenanceId));
        await canonical();
        await page.getByRole('button', { name: 'Edit', exact: true }).click();
        const password = page.locator('.library-editor-form input').nth(1);
        await password.fill('19999999');
        const dirtyBefore = await snapshot();
        const dirtyCalls = requests.length;
        await toSources();
        await sources()
            .getByText('Showing persisted Workspace provenance.', {
                exact: true,
            })
            .waitFor();
        await sources()
            .getByText('Unsaved Canonical edits are not represented here.', {
                exact: true,
            })
            .waitFor();
        await sources().getByLabel('Search provenance').fill('manual');
        await clear();
        await canonical();
        assert.equal(await password.inputValue(), '19999999');
        assert(
            await page
                .getByRole('button', { name: 'Save', exact: true })
                .isEnabled(),
        );
        assert.equal(requests.length, dirtyCalls);
        assert.deepEqual(await snapshot(), dirtyBefore);
        await toSources();
        await shot('QA-19-17');
        // An explicit existing Save/Reconfirm creates new authoritative provenance; inspection does not.
        await canonical();
        await page.getByRole('button', { name: 'Save', exact: true }).click();
        const modal = page.locator('.ant-modal:visible');
        await modal.locator('select').selectOption('CONFIRMED');
        await modal
            .getByLabel('note', { exact: true })
            .fill('RUN019 explicit save');
        const saved = page.waitForResponse(
            (r) =>
                r.request().method() === 'PATCH' &&
                r.url().includes('/library/cards/'),
        );
        await modal
            .getByRole('button', { name: 'Reconfirm and Save', exact: true })
            .click();
        assert.equal((await saved).status(), 200);
        await page.getByRole('button', { name: 'Edit', exact: true }).waitFor();
        await toSources();
        await sources()
            .getByText('RUN019 explicit save', { exact: true })
            .waitFor();
        await canonical();
        await page
            .getByRole('button', {
                name: 'Review / Confirm TEXT:EN',
                exact: true,
            })
            .click();
        const confirm = page.locator('.ant-modal:visible');
        await confirm.getByText('Validation: PASS', { exact: true }).waitFor();
        await confirm
            .getByLabel('Confirmation note (optional)')
            .fill('RUN019 explicit confirmation');
        await confirm
            .getByRole('button', { name: 'Confirm block', exact: true })
            .click();
        await confirm
            .getByText(
                'Block confirmed. Authoritative detail and provenance adopted.',
                { exact: true },
            )
            .waitFor();
        await confirm
            .getByRole('button', { name: 'Cancel', exact: true })
            .click();
        await toSources();
        await sources()
            .getByText('RUN019 explicit confirmation', { exact: true })
            .waitFor();
        const refreshed = await api(
            '/api/v1/library/cards/' + info.card.cardId,
        );
        const cp = refreshed.provenance.find(
            (p) => p.note === 'RUN019 explicit confirmation',
        );
        assert(
            (await row(cp.provenance_id).innerText()).includes(
                'CURRENT CONFIRMATION PROVENANCE · TEXT:EN',
            ),
        );
        await api(qa + 'append', 'POST', {});
        await open('RUN019 History');
        await toSources();
        await sources()
            .getByText('Authoritative reload event', { exact: true })
            .waitFor();
        await page.getByRole('button', { name: 'Edit', exact: true }).click();
        assert.equal(await page.locator('.library-editor-form').count(), 1);
        assert.equal(await sources().count(), 0);
        await page.getByRole('button', { name: 'Cancel', exact: true }).click();
        await sections()
            .getByRole('button', { name: 'Variants / Assets', exact: true })
            .click();
        await page
            .getByRole('heading', { name: 'Variants / Assets', exact: true })
            .waitFor();

        await page.getByRole('button', { name: 'Edit', exact: true }).click();
        assert.equal(await page.locator('.library-editor-form').count(), 1);
        assert.equal(await sources().count(), 0);
        await page.getByRole('button', { name: 'Cancel', exact: true }).click();
        await toSources();
        await shot('QA-19-18');
        // Seeded events came from the actual existing services; prior operational suites cover their full UIs.
        assert.equal(
            info.card.localizations[0].cardText,
            'Persisted Carder text',
        );
        assert(
            (await codeRow('CARDER_WRITE_BACK').innerText()).includes(
                'Carder write-back',
            ),
        );
        assert(!requests.some((r) => r.path.includes('/carder/')));
        await shot('QA-19-19');
        assert.equal(info.card.classification.effectReviewed, true);
        assert.match(
            bySource('LIBRARY_BATCH').sourceRef,
            /^library-batch:[0-9a-f-]{36}$/,
        );
        assert(
            (await codeRow('LIBRARY_BATCH').innerText()).includes(
                'Shared Batch note',
            ),
        );
        await shot('QA-19-20');
        assert.equal(cases.length, 20);
        assert.equal(errors.length, 0, errors.join('\n'));
        await fs.writeFile(
            path.join(output, 'evidence.json'),
            JSON.stringify(
                {
                    run: 'RUN019',
                    sha,
                    platform: process.platform,
                    cases,
                    failures: 0,
                    skips: 0,
                    page_errors: errors,
                    requests,
                    read_only_inspection_db_equal: true,
                    dirty_inspection_db_equal: true,
                },
                null,
                2,
            ),
        );
        console.log(
            `RUN019 browser complete: ${cases.length} PASS, 0 FAIL, 0 SKIP; SHA ${sha}`,
        );
    } catch (e) {
        await page
            .screenshot({
                path: path.join(output, 'failure.png'),
                fullPage: true,
            })
            .catch(() => {});
        await fs.writeFile(
            path.join(output, 'failure.json'),
            JSON.stringify({ sha, cases, errors, message: e.stack }, null, 2),
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
