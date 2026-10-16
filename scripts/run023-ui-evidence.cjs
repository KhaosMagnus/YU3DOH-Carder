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
async function api(route) {
    const r = await fetch('http://127.0.0.1:4312' + route);
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
            viewport: { width: 1500, height: 1100 },
        }),
        cases = [],
        errors = [],
        requests = [],
        proofs = {};
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('request', (r) => {
        if (r.url().includes('/api/v1/'))
            requests.push({
                url: r.url(),
                method: r.method(),
                body: r.postDataJSON(),
            });
    });
    const panel = () => page.locator('.library-external-sources'),
        structure = () => page.locator('.library-external-structure'),
        review = () =>
            structure().locator('.library-external-structure__review'),
        sections = () => page.locator('.library-detail__sections');
    const sbutton = (name) =>
            structure().getByRole('button', { name, exact: true }),
        pbutton = (name) => panel().getByRole('button', { name, exact: true });
    const snapshot = () => api('/api/v1/workspace/_qa/snapshot');
    const pass = async (id) => {
        cases.push({ id, result: 'PASS', sha });
        console.log('RUN023 UI ' + id + ' PASS');
    };
    const openStored = async () => {
        await sections()
            .getByRole('button', { name: 'External Sources', exact: true })
            .click();
        await pbutton('Open stored retrieval').click();
        await panel()
            .getByRole('heading', {
                name: 'Candidate · Non-authoritative',
                exact: true,
            })
            .waitFor();
    };
    const open = async (key) => {
        await page.goto('http://127.0.0.1:3000/ygocarder/library/');
        await page
            .locator('.library-card')
            .filter({
                has: page.getByRole('heading', {
                    name: 'RUN023 ' + key,
                    exact: true,
                }),
            })
            .click();
        await sections().waitFor();
        await openStored();
    };
    const preview = async () => {
        const response = page.waitForResponse((r) =>
            r.url().endsWith('/preview-structure'),
        );
        await sbutton('Preview complete STRUCTURE').click();
        const r = await response;
        assert.equal(r.status(), 200, await r.text());
        const p = await r.json();
        await review().waitFor();
        return p;
    };
    try {
        await open('Mixed');
        await pass('UI-23-01-open-eligible-stored-v2');
        const initial = await snapshot(),
            p = await preview();
        proofs.initial_preview = p;
        assert.equal(p.decision, 'READY');
        assert.equal(p.persisted_state_only, true);
        assert.deepEqual((await snapshot()).tables, initial.tables);
        await pass('UI-23-02-preview-persisted-zero-writes');
        await page.getByRole('button', { name: 'Edit', exact: true }).click();
        const password = page
            .locator('.library-editor-form')
            .getByLabel('Password', { exact: true });
        await password.fill('99999999');
        await openStored();
        assert.match(
            await structure().innerText(),
            /Preview uses persisted Canonical state. Unsaved edits are not included/,
        );
        await pass('UI-23-03-dirty-warning');
        const dirty = await preview();
        assert.equal(
            dirty.read_only_evidence.find((r) => r.field === 'password')
                .current,
            '12345678',
        );
        assert.equal(
            (await snapshot()).tables.canonical_cards.find(
                (c) => c.card_id === info.cases.Mixed.card_id,
            ).password,
            '12345678',
        );
        await pass('UI-23-04-dirty-preview-uses-persisted-state');
        await structure()
            .getByRole('checkbox', {
                name: 'I understand STRUCTURE will move to DRAFT.',
                exact: true,
            })
            .check();
        assert.equal(
            await sbutton('Apply complete STRUCTURE').isEnabled(),
            false,
        );
        assert.equal((await snapshot()).applyCalls, 0);
        await pass('UI-23-05-dirty-blocks-apply-before-network');
        for (const name of [
            'Current Canonical',
            'Source Candidate',
            'Resulting Structure',
        ])
            await review()
                .getByRole('heading', { name, exact: true })
                .waitFor();
        await pass('UI-23-06-current-source-result-visible');
        for (const [n, kind] of [
            ['07', 'SOURCE_CHANGE'],
            ['08', 'DERIVED_CLEAR'],
            ['09', 'UNCHANGED'],
        ]) {
            assert(await review().getByText(kind, { exact: true }).count());
            await pass('UI-23-' + n + '-' + kind.toLowerCase() + '-visible');
        }
        const rows = review().locator('tr');
        for (const field of ['family', 'password', 'link_rating'])
            assert.match(
                await rows
                    .filter({
                        has: page.getByRole('cell', {
                            name: field,
                            exact: true,
                        }),
                    })
                    .innerText(),
                /READ_ONLY/,
            );
        await pass('UI-23-10-readonly-family-password-rating');
        assert.equal(
            await panel()
                .getByRole('checkbox', { name: /Select STRUCTURE\// })
                .count(),
            0,
        );
        await pass('UI-23-11-no-structure-field-checkboxes');
        assert.match(
            await review().innerText(),
            new RegExp(
                'normalizer 2.*frozen candidate revision ' +
                    info.cases.Mixed.revision +
                    '.*current Canonical revision ' +
                    info.cases.Mixed.revision +
                    '.*STRUCTURE CONFIRMED',
                's',
            ),
        );
        await pass('UI-23-12-version-revisions-confirmation-visible');
        await sections()
            .getByRole('button', { name: 'Canonical', exact: true })
            .click();
        assert.equal(await password.inputValue(), '99999999');
        await page.getByRole('button', { name: 'Cancel', exact: true }).click();
        await openStored();
        await preview();
        assert.equal(
            await sbutton('Apply complete STRUCTURE').isEnabled(),
            false,
        );
        await structure()
            .getByRole('checkbox', {
                name: 'I understand STRUCTURE will move to DRAFT.',
                exact: true,
            })
            .check();
        assert.equal(
            await sbutton('Apply complete STRUCTURE').isEnabled(),
            true,
        );
        await pass('UI-23-13-exact-confirmed-ack');
        await page.screenshot({
            path: path.join(output, 'confirmed-structure-review.png'),
            fullPage: true,
        });
        await open('Blocked');
        const blocked = await preview();
        proofs.blocked = blocked;
        assert.equal(blocked.decision, 'BLOCKED');
        assert.deepEqual(blocked.blocking_confirmed_blocks, [
            'TEXT:EN',
            'TEXT:ES',
        ]);
        assert.match(
            await review().innerText(),
            /Blocking confirmed blocks: TEXT:EN, TEXT:ES/,
        );
        assert.equal(
            await sbutton('Apply complete STRUCTURE').isEnabled(),
            false,
        );
        await pass('UI-23-14-exact-confirmed-blockers');
        await open('No-op');
        assert.equal((await preview()).decision, 'NO_OP');
        assert.match(
            await review().innerText(),
            /No Canonical structural changes/,
        );
        assert.equal(
            await sbutton('Apply complete STRUCTURE').isEnabled(),
            false,
        );
        await pass('UI-23-15-noop-disables-apply');
        await open('Token');
        assert.equal((await preview()).decision, 'INELIGIBLE');
        assert.match(await review().innerText(), /UNSUPPORTED_FAMILY/);
        assert.equal(
            await sbutton('Apply complete STRUCTURE').isEnabled(),
            false,
        );
        await pass('UI-23-16-token-ineligible');
        await open('V1');
        assert.match(await panel().innerText(), /normalizer 1/);
        assert.equal((await preview()).decision, 'INELIGIBLE');
        assert.match(
            await review().innerText(),
            /NORMALIZER_VERSION_NOT_SUPPORTED/,
        );
        await pass('UI-23-17-v1-inspectable-structure-ineligible');
        assert.equal(
            await panel()
                .getByRole('checkbox', {
                    name: 'Select TEXT:EN/name',
                    exact: true,
                })
                .isEnabled(),
            true,
        );
        await panel()
            .getByRole('checkbox', { name: 'Select TEXT:EN/name', exact: true })
            .check();
        await pbutton('Review selected text').click();
        await panel()
            .locator('.library-external-sources__apply-review')
            .waitFor();
        proofs.text_review_separate = true;
        await open('Mixed');
        await pbutton('Compare with this card').click();
        await panel().locator('.library-external-sources__diff').waitFor();
        await preview();
        await structure()
            .getByRole('checkbox', {
                name: 'I understand STRUCTURE will move to DRAFT.',
                exact: true,
            })
            .check();
        await structure()
            .getByLabel('STRUCTURE provenance note', { exact: true })
            .fill('  browser reviewed  ');
        const before = await snapshot(),
            response = page.waitForResponse((r) =>
                r.url().endsWith('/apply-structure'),
            );
        await sbutton('Apply complete STRUCTURE').click();
        const r = await response;
        assert.equal(r.status(), 200, await r.text());
        proofs.apply = await r.json();
        assert.equal(
            proofs.apply.revision,
            String(Number(info.cases.Mixed.revision) + 1),
        );
        await structure()
            .getByText(/Applied STRUCTURE revision/)
            .waitFor();
        await page.waitForFunction((rev) => {
            const el = document.querySelector('.library-detail');
            return el && new RegExp('revision.*' + rev, 's').test(el.innerText);
        }, proofs.apply.revision);
        const after = await snapshot();
        assert.equal(after.mutateCalls, 1);
        assert.equal(after.applyCalls, 1);
        assert.ok(
            after.tables.canonical_provenance.length >
                before.tables.canonical_provenance.length,
        );
        assert.equal(await review().count(), 0);
        await pass('UI-23-18-refresh-authoritative-detail-provenance');
        assert.match(await panel().innerText(), /candidate is stale/i);
        assert.equal(proofs.apply.structure_confirmation_state, 'DRAFT');
        await pass('UI-23-19-new-revision-draft-stale');
        assert.equal(
            await panel().locator('.library-external-sources__diff').count(),
            0,
        );
        assert.equal(
            requests.filter(
                (r) =>
                    r.url.endsWith('/diff') &&
                    r.body?.target_expected_revision === proofs.apply.revision,
            ).length,
            0,
        );
        await pass('UI-23-20-old-diff-cleared-never-rebased');
        assert.equal(proofs.text_review_separate, true);
        await pass('UI-23-21-text-apply-separate');
        const apply = requests.filter((r) =>
            r.url.endsWith('/apply-structure'),
        );
        assert.equal(apply.length, 1);
        assert.deepEqual(Object.keys(apply[0].body).sort(), [
            'acknowledge_move_to_draft',
            'note',
            'target_card_id',
            'target_expected_revision',
        ]);
        assert.deepEqual(Object.keys(after.lastMutation).sort(), [
            'confirmations',
            'provenance',
            'structure',
        ]);
        assert.deepEqual(
            after.tables.canonical_localizations,
            before.tables.canonical_localizations,
        );
        await pass('UI-23-22-no-combined-structure-text-mutation');
        assert.equal(after.providerRequests, 0);
        await pass('UI-23-23-zero-provider-requests');
        assert.equal(
            await page
                .getByRole('button', { name: /registry administration/i })
                .count(),
            0,
        );
        await pass('UI-23-24-no-registry-admin');
        assert.deepEqual(errors, []);
        await pass('UI-23-25-no-js-runtime-error');
        proofs.after = after;
        for (const name of [
            'external_source_records',
            'external_source_retrievals',
            'external_source_documents',
            'external_source_candidates',
        ])
            assert.deepEqual(after.tables[name], before.tables[name]);
        await page.screenshot({
            path: path.join(output, 'structure-apply-stale.png'),
            fullPage: true,
        });
        assert.equal(cases.length, 25);
        console.log('RUN023 UI evidence: 25 PASS / 0 FAIL / 0 SKIP');
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
