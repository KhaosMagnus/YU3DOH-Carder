const assert = require('node:assert/strict'),
    fs = require('node:fs/promises'),
    path = require('node:path');
const { execFileSync } = require('node:child_process');
const { chromium } = require('playwright-core');
const output =
    process.env.YU3DOH_QA_OUTPUT || path.resolve('run018-ui-evidence');
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
    assert(info.root.includes('RUN018'));
    assert.equal(info.sha, sha);
    const browser = await chromium.launch({
        headless: true,
        ...(process.env.YU3DOH_QA_CHROMIUM
            ? { executablePath: process.env.YU3DOH_QA_CHROMIUM }
            : {}),
        args: ['--no-sandbox'],
    });
    const page = await browser.newPage({
        viewport: { width: 1440, height: 1050 },
    });
    const cases = [],
        errors = [],
        requests = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('request', (r) => {
        if (r.url().includes('/batch/classification/'))
            requests.push({
                url: new URL(r.url()).pathname,
                body: r.postDataJSON(),
            });
    });
    const name = (c) => c.localizations.find((l) => l.language === 'EN').name;
    const modal = () =>
        page.getByRole('dialog', { name: 'Batch Classification', exact: true });
    const previewResults = () => page.getByTestId('batch-preview-results');
    const applyResults = () => page.getByTestId('batch-apply-results');
    const shot = async (id, evidence = {}) => {
        await page.screenshot({
            path: path.join(output, id + '.png'),
            fullPage: true,
            animations: 'disabled',
        });
        cases.push({ id, result: 'PASS', sha, ...evidence });
        console.log(`RUN018 UI ${id} PASS`);
    };
    const count = async (n) => {
        await page
            .getByTestId('batch-selection-count')
            .filter({ hasText: `Selected: ${n}` })
            .waitFor();
        assert.equal(
            await page.getByTestId('batch-selection-count').innerText(),
            `Selected: ${n}`,
        );
    };
    const clear = async () => {
        if (
            !(await page
                .getByRole('button', { name: 'Clear selection', exact: true })
                .isDisabled())
        )
            await page
                .getByRole('button', { name: 'Clear selection', exact: true })
                .click();
        await count(0);
    };
    const search = async (text) => {
        const p = page.waitForResponse(
            (r) =>
                r.url().includes('/api/v1/library/cards?') &&
                r.request().method() === 'GET',
        );
        const input = page.getByPlaceholder(
            'Search name in EN / ES / JP or password',
        );
        if ((await input.inputValue()) === text)
            await page
                .getByRole('button', { name: 'Refresh Library', exact: true })
                .click();
        else await input.fill(text);
        await p;
        await page
            .locator('.library-results .ant-spin')
            .waitFor({ state: 'hidden' });
    };
    const select = async (c) => {
        await page
            .getByRole('checkbox', {
                name: `Select ${name(c)} for Batch`,
                exact: true,
            })
            .check();
    };
    const choose = async (testid, label) => {
        await page.waitForFunction(
            (id) =>
                !document
                    .querySelector('[data-testid="' + id + '"]')
                    ?.classList.contains('ant-select-disabled'),
            testid,
        );
        await page.getByTestId(testid).locator('.ant-select-selector').click();
        await page
            .locator('.ant-select-dropdown:visible')
            .getByText(label, { exact: true })
            .click();
        await modal()
            .getByText('Batch Classification', { exact: true })
            .click();
        await page
            .locator('.ant-select-dropdown:visible')
            .waitFor({ state: 'hidden' });
    };
    const open = async () => {
        await page
            .getByRole('button', { name: 'Batch Classification…', exact: true })
            .first()
            .click();
        await modal().waitFor();
    };
    const close = async () => {
        await modal()
            .getByRole('button', { name: 'Close', exact: true })
            .last()
            .click();
        await modal().waitFor({ state: 'hidden' });
    };
    const preview = async () => {
        const [response] = await Promise.all([
            page.waitForResponse((r) =>
                r.url().endsWith('/batch/classification/preview'),
            ),
            page.getByTestId('batch-preview').click(),
        ]);
        assert.equal(response.status(), 200);
        const result = await response.json();
        await previewResults().waitFor();
        await previewResults().scrollIntoViewIfNeeded();
        return result;
    };
    const apply = async () => {
        const [response] = await Promise.all([
            page.waitForResponse((r) =>
                r.url().endsWith('/batch/classification/apply'),
            ),
            page.getByTestId('batch-apply').click(),
        ]);
        assert.equal(response.status(), 200);
        const result = await response.json();
        await applyResults().waitFor();
        await applyResults().scrollIntoViewIfNeeded();
        await count(0);
        return result;
    };
    const fresh = async (options = {}) => api(qa + 'create', 'POST', options);
    const selectOnly = async (cards) => {
        await clear();
        for (const c of cards) {
            await search(name(c));
            await select(c);
        }
    };
    const reviewed = async (label) => choose('batch-effect-reviewed', label);
    const readCard = (c) => api(qa + 'card/' + c.cardId);
    const snapshot = () => api(qa + 'snapshot');
    try {
        await page.goto('http://127.0.0.1:3000/ygocarder/library/');
        await page
            .getByRole('checkbox', {
                name: `Select ${name(info.cards[0])} for Batch`,
                exact: true,
            })
            .waitFor();
        await select(info.cards[0]);
        assert.equal(await page.locator('.ant-drawer-open').count(), 0);
        await page.locator('.ant-pagination-item-2').click();
        await page
            .getByRole('checkbox', {
                name: `Select ${name(info.cards[50])} for Batch`,
                exact: true,
            })
            .waitFor();
        await select(info.cards[50]);
        await count(2);
        await shot('QA-18-01', {
            selected: [info.cards[0].cardId, info.cards[50].cardId],
        });
        assert.match(
            await page.getByTestId('batch-hidden-count').innerText(),
            /: 1$/,
        );
        await search(name(info.cards[0]));
        await count(2);
        assert.match(
            await page.getByTestId('batch-hidden-count').innerText(),
            /: 1$/,
        );
        await shot('QA-18-02');
        await clear();
        await search('RUN018 Card');
        await page
            .getByRole('button', { name: 'Select current page', exact: true })
            .click();
        await count(50);
        assert.equal(
            await page
                .getByRole('button', {
                    name: /Select all matching|Apply to query/i,
                })
                .count(),
            0,
        );
        await shot('QA-18-03');
        for (let p = 2; p <= 4; p++) {
            await page.locator('.ant-pagination-item-' + p).click();
            await page
                .getByRole('checkbox', {
                    name: `Select ${name(info.cards[(p - 1) * 50])} for Batch`,
                    exact: true,
                })
                .waitFor();
            await page
                .getByRole('button', {
                    name: 'Select current page',
                    exact: true,
                })
                .click();
            await count(p * 50);
        }
        await page.locator('.ant-pagination-item-5').click();
        await page
            .getByRole('checkbox', {
                name: `Select ${name(info.cards[200])} for Batch`,
                exact: true,
            })
            .waitFor();
        await page
            .getByRole('button', { name: 'Select current page', exact: true })
            .click();
        await count(200);
        await page
            .getByRole('checkbox', {
                name: `Select ${name(info.cards[200])} for Batch`,
                exact: true,
            })
            .click();
        await count(200);
        assert.equal(
            await page
                .getByRole('checkbox', {
                    name: `Select ${name(info.cards[200])} for Batch`,
                    exact: true,
                })
                .isChecked(),
            false,
        );
        await page.getByText(/Maximum selection is 200 cards/).waitFor();
        await shot('QA-18-04');
        await selectOnly([info.cards[0], info.cards[1]]);
        await open();
        await reviewed('True');
        const beforePreview = await snapshot();
        const mixed = await preview();
        assert.deepEqual(
            mixed.results.map((r) => r.status),
            ['WOULD_CHANGE', 'NO_OP'],
        );
        assert.deepEqual(await snapshot(), beforePreview);
        await shot('QA-18-05');
        await close();
        await selectOnly([info.cards[2]]);
        await open();
        await reviewed('Unchanged');
        await choose('batch-add_archetype_ids', 'archetype New');
        const conf = await preview();
        assert.equal(conf.results[0].status, 'CONFIRMED_REQUIRES_ACK');
        assert.equal(conf.results[0].card_id, info.cards[2].cardId);
        assert(await page.getByTestId('batch-apply').isDisabled());
        await shot('QA-18-06');
        await modal().getByRole('checkbox').check();
        const confirmedApplied = await apply();
        assert.equal(confirmedApplied.results[0].moved_to_draft, true);
        assert.equal(
            (await readCard(info.cards[2])).confirmations.find(
                (x) => x.block === 'CLASSIFICATION',
            ).state,
            'DRAFT',
        );
        await shot('QA-18-09');
        await close();
        const association = fresh();
        const associationCard = await association;
        await api(qa + 'prepare-card', 'POST', {
            card_id: associationCard.cardId,
        });
        await selectOnly([associationCard]);
        await open();
        await choose('batch-remove_archetype_ids', 'archetype Old');
        await choose('batch-add_effect_classifier_ids', 'effect New');
        await choose('batch-remove_effect_classifier_ids', 'effect Old');
        await choose('batch-add_functional_tag_ids', 'tag New');
        await choose('batch-remove_functional_tag_ids', 'tag Old');
        await page.getByTestId('batch-note').fill('QA18 shared note');
        const associationBefore = await readCard(associationCard);
        const domainBefore = await snapshot();
        await preview();
        const associationResult = await apply();
        const associationAfter = await readCard(associationCard);
        assert.equal(associationResult.summary.success, 1);
        assert.deepEqual(
            associationAfter.classification.archetypes.map((x) => x.id),
            [info.registries.archetypeNew.id],
        );
        assert.deepEqual(
            associationAfter.classification.effectClassifiers.map((x) => x.id),
            [info.registries.effectNew.id],
        );
        assert.deepEqual(
            associationAfter.classification.functionalTags.map((x) => x.id),
            [info.registries.tagNew.id],
        );
        await shot('QA-18-07');
        const provenance = associationAfter.provenance.filter(
            (p) => p.sourceKind === 'LIBRARY_BATCH',
        );
        assert.equal(provenance.length, 1);
        assert.equal(
            provenance[0].sourceRef,
            'library-batch:' + associationResult.batch_operation_id,
        );
        assert.equal(provenance[0].note, 'QA18 shared note');
        await shot('QA-18-13');
        for (const field of [
            'structure',
            'localizations',
            'relations',
            'password',
        ])
            assert.deepEqual(associationAfter[field], associationBefore[field]);
        await shot('QA-18-17');
        const domainAfter = await snapshot();
        for (const key of Object.keys(domainBefore).filter((k) =>
            /asset|variant/.test(k),
        ))
            assert.deepEqual(domainAfter[key], domainBefore[key]);
        await shot('QA-18-18');
        assert.match(await applyResults().innerText(), /Changed: 1/);
        await count(0);
        await shot('QA-18-15');
        await close();
        await page
            .getByRole('button', { name: 'Batch results', exact: true })
            .click();
        await applyResults().waitFor();
        await close();
        // Start fresh modal operation by removing prior selections through actual ADD/REMOVE controls.
        const clearOperation = async () => {
            for (const testid of [
                'batch-add_archetype_ids',
                'batch-remove_archetype_ids',
                'batch-add_effect_classifier_ids',
                'batch-remove_effect_classifier_ids',
                'batch-add_functional_tag_ids',
                'batch-remove_functional_tag_ids',
            ]) {
                const tags = page
                    .getByTestId(testid)
                    .locator('.ant-select-selection-item-remove');
                while (await tags.count()) await tags.first().click();
            }
            await page.getByTestId('batch-note').fill('');
        };
        const tri = await fresh();
        await selectOnly([tri]);
        await open();
        await clearOperation();
        await reviewed('True');
        await preview();
        await apply();
        assert.equal((await readCard(tri)).classification.effectReviewed, true);
        await close();
        await selectOnly([tri]);
        await open();
        await reviewed('False');
        await preview();
        await apply();
        assert.equal(
            (await readCard(tri)).classification.effectReviewed,
            false,
        );
        await close();
        await selectOnly([tri]);
        await open();
        await reviewed('Unchanged');
        await choose('batch-add_archetype_ids', 'archetype New');
        await preview();
        await apply();
        assert.equal(
            (await readCard(tri)).classification.effectReviewed,
            false,
        );
        await shot('QA-18-08');
        await close();
        const confirmedNoop = await fresh({ confirmed: true });
        await selectOnly([confirmedNoop]);
        await open();
        await clearOperation();
        await reviewed('True');
        const noOpBefore = await snapshot();
        const noOpPreview = await preview();
        assert.equal(noOpPreview.results[0].status, 'NO_OP');
        const noOpResult = await apply();
        assert.equal(noOpResult.summary.no_op, 1);
        assert.deepEqual(await snapshot(), noOpBefore);
        assert.equal(
            (await readCard(confirmedNoop)).confirmations.find(
                (c) => c.block === 'CLASSIFICATION',
            ).state,
            'CONFIRMED',
        );
        await shot('QA-18-10');
        await close();
        // New cards can be selected through independent search without losing prior selection.
        const selectAcross = async (cards) => {
            await clear();
            for (const c of cards) {
                await search(name(c));
                await select(c);
            }
        };
        const success = await fresh(),
            stale = await fresh();
        await selectAcross([success, stale]);
        await open();
        await reviewed('True');
        await preview();
        await api(qa + 'stale', 'POST', { card_id: stale.cardId });
        const partial = await apply();
        assert.deepEqual(
            partial.results.map((x) => x.status),
            ['SUCCESS', 'REVISION_CONFLICT'],
        );
        assert.equal(partial.results[1].expected_revision, stale.revision);
        await shot('QA-18-11');
        await close();
        const domainGood = await fresh(),
            domainBad = await fresh();
        await selectAcross([domainGood, domainBad]);
        await open();
        await reviewed('True');
        await preview();
        await api(qa + 'domain-invalid', 'POST', { card_id: domainBad.cardId });
        const domainBadBefore = await readCard(domainBad);
        const domainPartial = await apply();
        assert.deepEqual(
            domainPartial.results.map((x) => x.status),
            ['SUCCESS', 'DOMAIN_VALIDATION'],
        );
        assert.equal(
            (await readCard(domainGood)).revision,
            String(Number(domainGood.revision) + 1),
        );
        assert.deepEqual(await readCard(domainBad), domainBadBefore);
        await shot('QA-18-12');
        await close();
        await selectOnly([stale]);
        await open();
        await reviewed('False');
        const retryPreview = await preview();
        assert.equal(
            retryPreview.results[0].expected_revision,
            (await readCard(stale)).revision,
        );
        await page.getByTestId('batch-note').fill('changed fingerprint');
        assert(await page.getByTestId('batch-apply').isDisabled());
        await page
            .getByText(
                'Selection, operation, or note changed. Request a new Preview before Apply.',
            )
            .waitFor();
        await preview();
        const retry = await apply();
        assert.equal(retry.summary.success, 1);
        await shot('QA-18-16');
        await close();
        const dirtyCard = await fresh();
        await selectOnly([dirtyCard]);
        await page
            .locator('.library-card')
            .filter({
                has: page.getByRole('heading', {
                    name: name(dirtyCard),
                    exact: true,
                }),
            })
            .click();
        await page.getByRole('button', { name: 'Edit', exact: true }).click();
        await page
            .locator('.library-editor-form input')
            .nth(1)
            .fill('18888888');
        await page
            .locator('.library-detail')
            .getByRole('button', { name: 'Batch Classification…', exact: true })
            .click();
        await reviewed('True');
        const dirtyBefore = await snapshot();
        await preview();
        assert(await page.getByTestId('batch-apply').isDisabled());
        await page
            .getByText(
                'Save, cancel, or discard the active Detail edits before applying Batch changes.',
            )
            .waitFor();
        assert.deepEqual(await snapshot(), dirtyBefore);
        await shot('QA-18-14');
        await close();
        await page
            .locator('.library-detail')
            .getByRole('button', { name: 'Cancel', exact: true })
            .click();
        // Clean participating Detail reloads from the server after an actual Batch execution.
        await page
            .locator('.library-detail')
            .getByRole('button', { name: 'Batch Classification…', exact: true })
            .click();
        await preview();
        const clean = await apply();
        await close();
        await page
            .locator('.library-detail__toolbar')
            .getByText('revision')
            .waitFor();
        await page.waitForFunction(
            (rev) =>
                document
                    .querySelector('.library-detail__toolbar')
                    ?.textContent.includes('revision: ' + rev),
            clean.results[0].revision,
        );
        await page.getByRole('button', { name: 'Edit', exact: true }).click();
        await page.locator('.library-editor-form').getByRole('switch').click();
        const patch = page.waitForResponse(
            (r) =>
                r.request().method() === 'PATCH' &&
                r.url().includes('/library/cards/'),
        );
        await page.getByRole('button', { name: 'Save', exact: true }).click();
        assert.equal((await patch).status(), 200);
        assert.equal(
            (await readCard(dirtyCard)).classification.effectReviewed,
            false,
        );
        await shot('QA-18-19');
        await page.locator('.ant-drawer-close').click();
        const carderCard = await fresh();
        const prepared = await api(qa + 'prepare-card', 'POST', {
            card_id: carderCard.cardId,
        });
        const carder = await browser.newPage();
        carder.on('pageerror', (e) => errors.push(e.message));
        const params = new URLSearchParams({
            ws_card_id: carderCard.cardId,
            ws_variant_id: prepared.variant.variantId,
            ws_composition: 'STANDARD',
            ws_lang: 'EN',
            ws_revision: carderCard.revision,
        });
        await carder.goto('http://127.0.0.1:3000/ygocarder/?' + params);
        await carder
            .getByRole('button', { name: 'Save to Workspace', exact: true })
            .waitFor({ timeout: 60000 });
        await carder
            .locator('.app-loading')
            .waitFor({ state: 'hidden', timeout: 60000 });
        await carder.locator('#name').fill('Local edit must survive Batch');
        await selectOnly([carderCard]);
        await open();
        await reviewed('True');
        await preview();
        await apply();
        await close();
        const staleResponse = carder.waitForResponse((r) =>
            r.url().endsWith('/api/v1/carder/write-back'),
        );
        await carder
            .getByRole('button', { name: 'Save to Workspace', exact: true })
            .click();
        await carder
            .getByRole('button', {
                name: 'Acknowledge and Save to Workspace',
                exact: true,
            })
            .click();
        const staleResult = await staleResponse;
        assert.equal(staleResult.status(), 409);
        assert.equal((await staleResult.json()).code, 'REVISION_CONFLICT');
        await carder.waitForFunction(() =>
            Array.from(document.querySelectorAll('button')).some(
                (button) =>
                    button.textContent.trim() === 'Save to Workspace' &&
                    button.disabled,
            ),
        );
        assert.equal(
            await carder.locator('#name').inputValue(),
            'Local edit must survive Batch',
        );
        assert(
            await carder
                .getByRole('button', { name: 'Save to Workspace', exact: true })
                .isDisabled(),
        );
        await carder.screenshot({
            path: path.join(output, 'QA-18-20-carder.png'),
            fullPage: true,
            animations: 'disabled',
        });
        await shot('QA-18-20');
        await carder.close();
        assert.equal(cases.length, 20);
        assert.equal(errors.length, 0, errors.join('\n'));
        assert(
            requests.every(
                (r) =>
                    Array.isArray(r.body.items) &&
                    r.body.items.length <= 200 &&
                    !('query' in r.body) &&
                    !('preview_id' in r.body),
            ),
        );
        await fs.writeFile(
            path.join(output, 'evidence.json'),
            JSON.stringify(
                {
                    run: 'RUN018',
                    sha,
                    platform: process.platform,
                    fixture_root: info.root,
                    cases,
                    failures: 0,
                    skips: 0,
                    page_errors: errors,
                    requests,
                },
                null,
                2,
            ),
        );
        console.log(
            `RUN018 browser complete: ${cases.length} PASS, 0 FAIL, 0 SKIP; SHA ${sha}`,
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
