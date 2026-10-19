const assert = require('node:assert/strict'),
    fs = require('node:fs/promises'),
    path = require('node:path');
const { execFileSync } = require('node:child_process'),
    { chromium } = require('playwright-core');
const output = process.env.YU3DOH_QA_OUTPUT;
if (!output) throw Error('RC evidence output required');
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
    });
    const cases = [],
        requests = [],
        errors = [],
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
    const editor = () => page.locator('.library-editor-form'),
        label = (name) =>
            editor()
                .locator('label')
                .filter({ hasText: new RegExp('^\\s*' + name) });
    const input = (name) => label(name).locator('input').first();
    const pendText = () =>
        editor()
            .locator('.library-localization')
            .first()
            .locator('label')
            .filter({ hasText: /^\s*Pendulum text/ })
            .locator('textarea');
    const button = (name) => page.getByRole('button', { name, exact: true });
    const pass = async (name) => {
        cases.push({
            id: 'RC-UI-' + String(cases.length + 1).padStart(2, '0'),
            name,
            result: 'PASS',
            sha,
        });
        console.log('RC UI ' + cases.length + ' ' + name + ' PASS');
    };
    const open = async (key) => {
        const current = await api('/api/v1/library/cards/' + info.cards[key]);
        const currentName = current.localizations.find(
            (l) => l.language === 'EN',
        ).name;
        await page.goto('http://127.0.0.1:3000/ygocarder/library/');
        await page
            .locator('.library-card')
            .filter({
                has: page.getByRole('heading', {
                    name: currentName,
                    exact: true,
                }),
            })
            .click();
        await button('Edit').click();
        await editor().waitFor();
    };
    const choose = async (kind) => {
        await label('Summon kind').locator('.ant-select-selector').click();
        await page
            .locator(
                '.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option-content',
            )
            .getByText(kind, { exact: true })
            .click();
    };
    const modal = () =>
        page.getByRole('dialog', { name: 'Confirm structural clearing' });
    const cancel = async () => {
        await modal()
            .getByRole('button', { name: 'Cancel', exact: true })
            .click();
        await modal().waitFor({ state: 'hidden' });
    };
    const confirm = async () => {
        await modal()
            .getByRole('button', {
                name: 'Apply change and clear',
                exact: true,
            })
            .click();
        await modal().waitFor({ state: 'hidden' });
    };
    const save = async (key) => {
        const wait = page.waitForResponse(
            (r) =>
                r.request().method() === 'PATCH' &&
                new URL(r.url()).pathname ===
                    '/api/v1/library/cards/' + info.cards[key],
        );
        await button('Save').click();
        const r = await wait;
        assert.equal(r.status(), 200, await r.text());
        await button('Edit').waitFor();
        return {
            request: r.request().postDataJSON(),
            response: await r.json(),
            reload: await api('/api/v1/library/cards/' + info.cards[key]),
        };
    };
    try {
        await open('MAIN');
        assert.equal(await label('Rank').count(), 0);
        assert.equal(await label('Pendulum Scale').count(), 0);
        assert.equal(
            await editor().getByLabel('Pendulum text', { exact: true }).count(),
            0,
        );
        await pass('MAIN non-applicable Rank Scale Text not editable');
        await input('Level').focus();
        await input('ATK').focus();
        assert.equal(await input('Level').inputValue(), '');
        await pass('blank applicable Level focus-blur stays blank');
        await input('Level').fill('3');
        await input('Level').fill('');
        await input('ATK').fill('1001');
        await editor()
            .locator('.library-localization')
            .first()
            .getByLabel('Name', { exact: true })
            .fill('RC MAIN saved');
        proofs.original = await save('MAIN');
        for (const d of [proofs.original.response, proofs.original.reload]) {
            assert.equal(d.structure.rank, null);
            assert.equal(d.structure.pendulum_scale, null);
            assert.equal(d.localizations[0].pendulum_text, null);
            assert.equal(d.structure.level, null);
        }
        assert.equal(proofs.original.request.structure.rank, null);
        assert.equal(proofs.original.request.structure.pendulum_scale, null);
        assert.equal(
            proofs.original.request.localizations[0].pendulum_text,
            null,
        );
        await pass(
            'original RC reproduction PATCH and authoritative reopen nulls',
        );
        await open('XYZ');
        assert.equal(await label('Level').count(), 0);
        assert.equal(await input('Rank').inputValue(), '');
        await pass('XYZ Rank visible Level absent untouched null');
        await input('Rank').focus();
        await input('ATK').focus();
        assert.equal(await input('Rank').inputValue(), '');
        await pass('blank Rank focus-blur preserves null');
        await input('Rank').fill('7');
        await input('Rank').fill('');
        await input('ATK').fill('1002');
        proofs.rankBlank = await save('XYZ');
        assert.equal(proofs.rankBlank.reload.structure.rank, null);
        await pass('Rank type then clear saves null');
        await open('XYZ');
        await input('Rank').fill('0');
        proofs.rankZero = await save('XYZ');
        assert.equal(proofs.rankZero.reload.structure.rank, 0);
        await pass('explicit XYZ Rank zero persists');
        await open('XYZ');
        await choose('MAIN_DECK');
        await modal().waitFor();
        assert.match(await modal().innerText(), /rank: 0/);
        await pass('Rank zero is populated and needs explicit clear');
        await cancel();
        assert.match(await label('Summon kind').innerText(), /XYZ/);
        assert.equal(await input('Rank').inputValue(), '0');
        await pass('cancel preserves prior kind and Rank');
        await choose('MAIN_DECK');
        await confirm();
        assert.equal(await label('Rank').count(), 0);
        assert.equal(await input('Level').inputValue(), '');
        await pass('confirm changes kind and clears Rank');
        await open('MAIN');
        await input('Level').fill('0');
        await choose('XYZ');
        await modal().waitFor();
        assert.match(await modal().innerText(), /level: 0/);
        await cancel();
        assert.equal(await input('Level').inputValue(), '0');
        await pass('Level zero transition cancelled without partial state');
        await choose('XYZ');
        await confirm();
        assert.equal(await input('Rank').inputValue(), '');
        await pass('confirmed XYZ transition clears Level');
        for (const kind of ['MAIN_DECK', 'RITUAL', 'FUSION', 'SYNCHRO']) {
            await choose(kind);
            assert.equal(await input('Level').count(), 1);
            assert.equal(await label('Rank').count(), 0);
            await pass(kind + ' exposes only Level');
        }
        assert.equal(
            await editor()
                .getByRole('switch', { name: 'Pendulum', exact: true })
                .count(),
            1,
        );
        await pass('one Pendulum intent control');
        await label('Abilities').locator('.ant-select-selector').click();
        assert.equal(
            await page
                .locator(
                    '.ant-select-dropdown:not(.ant-select-dropdown-hidden)',
                )
                .getByText('PENDULUM', { exact: true })
                .count(),
            0,
        );
        await input('ATK').click();
        await pass('generic ability picker excludes PENDULUM');
        for (const kind of [
            'MAIN_DECK',
            'RITUAL',
            'FUSION',
            'SYNCHRO',
            'XYZ',
        ]) {
            await choose(kind);
            const toggle = editor().getByRole('switch', {
                name: 'Pendulum',
                exact: true,
            });
            if ((await toggle.getAttribute('aria-checked')) !== 'true')
                await toggle.click();
            assert.equal(await input('Pendulum Scale').count(), 1);
            assert.equal(await pendText().count(), 1);
            await pass(kind + ' independent PENDULUM available');
        }
        await open('Pendulum');
        await input('Pendulum Scale').fill('');
        await input('ATK').focus();
        assert.equal(await input('Pendulum Scale').inputValue(), '');
        await pass('blank Scale focus-blur stays blank');
        await input('Pendulum Scale').fill('7');
        await input('Pendulum Scale').fill('');
        proofs.scaleBlank = await save('Pendulum');
        assert.equal(proofs.scaleBlank.reload.structure.pendulum_scale, null);
        await pass('Scale type then clear saves null');
        await open('Pendulum');
        await input('Pendulum Scale').fill('0');
        proofs.scaleZero = await save('Pendulum');
        assert.equal(proofs.scaleZero.reload.structure.pendulum_scale, 0);
        await pass('explicit Pendulum Scale zero persists');
        await open('Pendulum');
        await editor()
            .getByRole('switch', { name: 'Pendulum', exact: true })
            .click();
        await modal().waitFor();
        assert.match(await modal().innerText(), /pendulum_scale: 0/);
        await cancel();
        assert.equal(await input('Pendulum Scale').inputValue(), '0');
        assert.equal(await pendText().inputValue(), 'Persisted Pendulum text');
        await pass('Pendulum off cancel preserves toggle Scale and Text');
        await editor()
            .getByRole('switch', { name: 'Pendulum', exact: true })
            .click();
        await confirm();
        assert.equal(await label('Pendulum Scale').count(), 0);
        assert.equal(await pendText().count(), 0);
        proofs.dormant = await save('Pendulum');
        assert(!('localizations' in proofs.dormant.request));
        assert.equal(
            proofs.dormant.reload.localizations[0].pendulum_text,
            'Persisted Pendulum text',
        );
        await pass(
            'confirmed Pendulum off clears only Scale preserves dormant TEXT',
        );
        await open('Pendulum');
        await editor()
            .getByRole('switch', { name: 'Pendulum', exact: true })
            .click();
        assert.equal(await pendText().inputValue(), 'Persisted Pendulum text');
        await pass('reenable reveals persisted Pendulum text');
        await pendText().fill('   ');
        proofs.textClear = await save('Pendulum');
        assert.equal(
            proofs.textClear.request.localizations[0].pendulum_text,
            null,
        );
        assert.equal(
            proofs.textClear.reload.localizations[0].pendulum_text,
            null,
        );
        await pass(
            'ordinary explicitly cleared whitespace Pendulum Text saves null',
        );
        await open('Pendulum');
        await input('Level').fill('0');
        await input('Pendulum Scale').fill('0');
        await choose('LINK');
        await modal().waitFor();
        const content = await modal().innerText();
        for (const f of [
            'level: 0',
            'def: 1000',
            'abilities.PENDULUM',
            'pendulum_scale: 0',
        ])
            assert(content.includes(f));
        await pass(
            'LINK transition lists exact incompatible zero and ability clearings',
        );
        await cancel();
        assert.equal(await input('Level').inputValue(), '0');
        await pass('LINK transition cancel restores entire working state');
        await choose('LINK');
        await confirm();
        assert.equal(await label('Link Markers').count(), 1);
        for (const f of ['Level', 'Rank', 'DEF', 'Pendulum Scale'])
            assert.equal(await label(f).count(), 0);
        assert.equal(
            await editor()
                .getByRole('switch', { name: 'Pendulum', exact: true })
                .count(),
            0,
        );
        await pass('LINK exposes markers without Level Rank DEF Pendulum');
        await open('LINK');
        assert.equal(await input('Link Rating').inputValue(), '8');
        assert(await input('Link Rating').isDisabled());
        await pass('Link Rating derived from eight markers read only');
        await label('Link Markers').locator('.ant-select-selector').click();
        assert.equal(
            await page
                .locator(
                    '.ant-select-dropdown:not(.ant-select-dropdown-hidden)',
                )
                .getByText('5', { exact: true })
                .count(),
            0,
        );
        await input('ATK').click();
        await pass(
            'Link markers retain canonical eight codes with no center 5',
        );
        await choose('XYZ');
        await modal().waitFor();
        assert.match(await modal().innerText(), /link_markers/);
        await cancel();
        await choose('XYZ');
        await confirm();
        assert.equal(await label('Link Markers').count(), 0);
        await pass('LINK to non-LINK marker clearing explicit and cancellable');
        await open('Unknown');
        for (const f of ['Level', 'Rank', 'Link Markers'])
            assert.equal(await label(f).count(), 0);
        await pass('unknown summon has no invented MAIN_DECK fields');
        for (const family of ['SPELL', 'TRAP', 'TOKEN']) {
            await open(family);
            assert.equal(await pendText().count(), 0);
            assert.equal(await label('Pendulum Scale').count(), 0);
            assert.equal(
                await editor()
                    .getByRole('switch', { name: 'Pendulum', exact: true })
                    .count(),
                0,
            );
            await pass(family + ' hides all Pendulum controls');
        }
        const before = await api('/api/v1/workspace/_qa/domain');
        await open('Historical');
        const after = await api('/api/v1/workspace/_qa/domain');
        assert.deepEqual(after.tables, before.tables);
        await pass(
            'historical contradictory Draft opening performs zero rewrite',
        );
        await editor()
            .locator('.library-localization')
            .first()
            .getByLabel('Name', { exact: true })
            .fill('RC Historical text update');
        proofs.historical = await save('Historical');
        assert(!('structure' in proofs.historical.request));
        assert.equal(proofs.historical.reload.structure.rank, 0);
        assert.equal(proofs.historical.reload.structure.pendulum_scale, 0);
        assert.equal(
            proofs.historical.reload.localizations[0].pendulum_text,
            '',
        );
        await pass(
            'historical TEXT-only edit preserves contradictory structure and explicit empty string',
        );
        assert.equal(
            (await api('/api/v1/workspace/_qa/info')).provider_requests,
            0,
        );
        await pass('zero provider requests');
        assert.deepEqual(errors, []);
        await pass('zero browser runtime errors');
        await page.screenshot({
            path: path.join(output, 'rc-final.png'),
            fullPage: true,
            animations: 'disabled',
        });
        await fs.writeFile(
            path.join(output, 'evidence.json'),
            JSON.stringify(
                {
                    sha,
                    result: 'PASS',
                    cases,
                    proofs,
                    requests,
                    errors,
                    provider_requests: 0,
                },
                null,
                2,
            ),
        );
        console.log(`RC UI evidence: ${cases.length} PASS / 0 FAIL / 0 SKIP`);
    } catch (e) {
        await page
            .screenshot({
                path: path.join(output, 'failure.png'),
                fullPage: true,
            })
            .catch(() => {});
        await fs.writeFile(
            path.join(output, 'failure.json'),
            JSON.stringify({ sha, cases, errors, error: String(e) }, null, 2),
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
