const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { chromium } = require('playwright-core');
const output =
    process.env.YU3DOH_QA_OUTPUT || path.resolve('run017-ui-evidence');
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
    assert(info.root.includes('RUN017'));
    assert.equal(info.sha, sha);
    const browser = await chromium.launch({
        headless: true,
        ...(process.env.YU3DOH_QA_CHROMIUM
            ? { executablePath: process.env.YU3DOH_QA_CHROMIUM }
            : {}),
        args: ['--no-sandbox'],
    });
    const page = await browser.newPage({
        viewport: { width: 1440, height: 1000 },
    });
    const cases = [],
        errors = [],
        requests = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('request', (r) => {
        if (r.url().includes('/api/v1/carder/write-back'))
            requests.push({
                path: new URL(r.url()).pathname,
                method: r.method(),
                body: r.postDataJSON(),
            });
    });
    const saveButton = () =>
        page.getByRole('button', { name: 'Save to Workspace', exact: true });
    const status = () => page.locator('.workspace-bridge-status');
    const shot = async (name, extra = {}) => {
        await page.screenshot({
            path: path.join(output, name + '.png'),
            fullPage: true,
            animations: 'disabled',
        });
        cases.push({ name, sha, result: 'PASS', ...extra });
        console.log(`RUN017 UI ${name} PASS`);
    };
    let fixture;
    const open = async (options = {}) => {
        fixture = await api(qa + 'create', 'POST', options);
        const params = new URLSearchParams({
            ws_card_id: fixture.card.cardId,
            ws_variant_id: fixture.variant.variantId,
            ws_composition: 'STANDARD',
            ws_lang: 'EN',
            ws_revision: fixture.card.revision,
        });
        await page.goto('http://127.0.0.1:3000/ygocarder/?' + params);
        await saveButton().waitFor({ state: 'visible', timeout: 60000 });
        await page
            .locator('.app-loading')
            .waitFor({ state: 'hidden', timeout: 60000 });
        const s = await session();
        assert(s.write?.grant);
        return fixture;
    };
    const session = () =>
        page.evaluate(async () => {
            const m = await import(
                '/ygocarder/src/service/workspace-bridge/session.ts'
            );
            return m.getWorkspaceBridgeSession();
        });
    // Text edits use the real Carder input. Other matrix values enter its production
    // working store. Wait predicates are synchronous: an async predicate is a truthy
    // Promise in Playwright polling and would allow Save before the input debounce.
    const edit = async (changes) => {
        const { name, ...other } = changes;
        await page.evaluate(async (changes) => {
            const { useCard } = await import(
                '/ygocarder/src/service/use-card.ts'
            );
            window.__run017CardStore = useCard;
            useCard.getState().setCard((c) => ({ ...c, ...changes }));
        }, other);
        if (name !== undefined) {
            await page.locator('#name').fill(name);
            await page.waitForFunction(
                (name) =>
                    window.__run017CardStore.getState().card.name === name,
                name,
            );
        }
    };
    const save = async (ack = true) => {
        const response = page.waitForResponse((r) =>
            r.url().endsWith('/api/v1/carder/write-back'),
        );
        await saveButton().click();
        if (ack) {
            const button = page.getByRole('button', {
                name: 'Acknowledge and Save to Workspace',
                exact: true,
            });
            await button.waitFor({ state: 'visible' });
            await button.click();
        }
        const r = await response;
        return { status: r.status(), body: await r.json() };
    };
    try {
        await open();
        assert.equal(await saveButton().isEnabled(), true);
        await shot('QA-17-01-workspace-session');
        const standalone = await browser.newPage();
        await standalone.goto('http://127.0.0.1:3000/ygocarder/');
        await standalone.waitForSelector('#app');
        assert.equal(
            await standalone
                .getByRole('button', { name: 'Save to Workspace', exact: true })
                .count(),
            0,
        );
        await standalone.close();
        await shot('QA-17-02-standalone-no-save');
        await edit({ name: 'Changed via Carder' });
        const text = await save();
        assert.equal(text.status, 200);
        assert.deepEqual(text.body.changed_blocks, ['TEXT:EN']);
        assert.deepEqual(text.body.moved_to_draft, ['TEXT:EN']);
        const persisted = await api(qa + 'card/' + fixture.card.cardId);
        assert.equal(persisted.localizations[0].name, 'Changed via Carder');
        assert.equal(
            persisted.provenance.filter(
                (p) => p.sourceKind === 'CARDER_WRITE_BACK',
            ).length,
            1,
        );
        await shot('QA-17-03-text-confirmed-to-draft', {
            operation: text.body,
        });
        await open();
        await edit({ atk: '2400' });
        const structure = await save();
        assert.deepEqual(structure.body.changed_blocks, ['STRUCTURE']);
        assert.equal(
            (await api(qa + 'card/' + fixture.card.cardId)).structure.atk,
            2400,
        );
        await shot('QA-17-04-structure');
        await open();
        await edit({ atk: '2500', name: 'Combined' });
        const combined = await save();
        assert.deepEqual(combined.body.changed_blocks, [
            'STRUCTURE',
            'TEXT:EN',
        ]);
        assert.equal(
            BigInt(combined.body.revision),
            BigInt(fixture.card.revision) + 1n,
        );
        await shot('QA-17-05-combined-one-revision');
        await open();
        const initial = await page.evaluate(async () => {
            const { useCard } = await import(
                '/ygocarder/src/service/use-card.ts'
            );
            return useCard.getState().card;
        });
        await edit({ frame: 'fusion', typeAbility: ['Changed'] });
        await page.waitForFunction(() =>
            document
                .querySelector('.workspace-bridge-status')
                ?.textContent.includes('Save blocked by: frame, typeAbility'),
        );
        assert.equal(await saveButton().isDisabled(), true);
        await shot('QA-17-06-guarded-exact-fields');
        await edit({ frame: initial.frame, typeAbility: initial.typeAbility });
        const noOpSnapshot = await api(qa + 'card/' + fixture.card.cardId);
        await edit({ foil: 'gold' });
        const noOp = await save(false);
        assert.equal(noOp.status, 200);
        assert.equal(noOp.body.changed, false);
        assert.equal(noOp.body.revision, noOpSnapshot.revision);
        assert.deepEqual(
            await api(qa + 'card/' + fixture.card.cardId),
            noOpSnapshot,
        );
        await shot('QA-17-07-render-only-noop');
        await open({ kind: 'XYZ' });
        await edit({ star: 6 });
        const xyz = await save();
        assert.equal(xyz.status, 200);
        const xyCard = await api(qa + 'card/' + fixture.card.cardId);
        assert.equal(xyCard.structure.rank, 6);
        assert.equal(xyCard.structure.level, null);
        await shot('QA-17-08-xyz-rank');
        await open({ kind: 'LINK' });
        await edit({ def: '1200', star: 2 });
        await page.waitForFunction(() =>
            document
                .querySelector('.workspace-bridge-status')
                ?.textContent.includes('Save blocked by:'),
        );
        assert.equal(await saveButton().isDisabled(), true);
        assert((await status().textContent()).includes('star'));
        assert((await status().textContent()).includes('def'));
        await shot('QA-17-09-link-guard');
        await open({ pendulum: true });
        await edit({ pendulumScaleRed: '3', pendulumScaleBlue: '4' });
        await page.waitForFunction(() =>
            document
                .querySelector('.workspace-bridge-status')
                ?.textContent.includes('pendulum_scale_red/blue'),
        );
        assert.equal(await saveButton().isDisabled(), true);
        await edit({ pendulumScaleBlue: '3' });
        const pend = await save();
        assert.equal(pend.status, 200);
        assert.equal(
            (await api(qa + 'card/' + fixture.card.cardId)).structure
                .pendulumScale,
            3,
        );
        await shot('QA-17-10-pendulum');
        await open();
        await edit({ name: 'Keep my edits' });
        await api(qa + 'stale', 'POST', { card_id: fixture.card.cardId });
        const stale = await save();
        assert.equal(stale.status, 409);
        assert.equal(stale.body.code, 'REVISION_CONFLICT');
        assert.equal(
            await page.evaluate(async () => {
                const { useCard } = await import(
                    '/ygocarder/src/service/use-card.ts'
                );
                return useCard.getState().card.name;
            }),
            'Keep my edits',
        );
        await page.waitForFunction(() =>
            document
                .querySelector('.workspace-bridge-status')
                ?.textContent.includes('session is stale'),
        );
        assert.equal(await saveButton().isDisabled(), true);
        await shot('QA-17-11-stale-preserves-edits');
        await open();
        const old = await session();
        await edit({ name: 'First save' });
        const first = await save();
        await edit({ name: 'Second save' });
        const second = await save(false);
        assert.equal(second.status, 200);
        assert.deepEqual(second.body.moved_to_draft, []);
        assert.equal((await session()).revision, second.body.revision);
        assert.notEqual(first.body.write_grant, second.body.write_grant);
        await shot('QA-17-12-repeated-save');
        const replay = await page.evaluate(async (old) => {
            const r = await fetch('/api/v1/carder/write-back', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    write_grant: old.write.grant,
                    card_id: old.cardId,
                    expected_revision: old.revision,
                    content_language: old.contentLanguage,
                    projection: old.write.baseline,
                    acknowledge_move_to_draft: [],
                }),
            });
            return { status: r.status, body: await r.json() };
        }, old);
        assert.equal(replay.status, 403);
        assert.equal(replay.body.code, 'NO_WORKSPACE_CARDER_SESSION');
        await shot('QA-17-13-old-grant-replay');
        const race = await page.evaluate(async (fixture) => {
            const r = await fetch(
                '/api/v1/library/cards/' + fixture.card.cardId,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        expected_revision: fixture.card.revision,
                        password: '17000009',
                    }),
                },
            );
            return { status: r.status, body: await r.json() };
        }, fixture);
        assert.equal(race.status, 409);
        assert.equal(race.body.code, 'REVISION_CONFLICT');
        await shot('QA-17-14-carder-library-concurrency');
        await open();
        await api(qa + 'domain-invalid', 'POST', {
            card_id: fixture.card.cardId,
        });
        const beforeDomain = await api(qa + 'card/' + fixture.card.cardId);
        await edit({ name: 'Must roll back', atk: '2200' });
        const domain = await save();
        assert.equal(domain.status, 422);
        assert.equal(domain.body.code, 'DOMAIN_VALIDATION');
        assert.deepEqual(
            await api(qa + 'card/' + fixture.card.cardId),
            beforeDomain,
        );
        await shot('QA-17-15-domain-rollback');
        await open();
        const beforeAssets = await api(qa + 'assets');
        await edit({ name: 'Canonical only', atk: '2200' });
        assert.equal((await save()).status, 200);
        assert.deepEqual(await api(qa + 'assets'), beforeAssets);
        await shot('QA-17-16-zero-assets-variants');
        await open();
        await api(qa + 'reload', 'POST', {});
        const revoked = await save(false);
        assert.equal(revoked.status, 403);
        assert.equal(revoked.body.code, 'NO_WORKSPACE_CARDER_SESSION');
        await page.waitForFunction(() =>
            document
                .querySelector('.workspace-bridge-status')
                ?.textContent.includes('session is stale'),
        );
        await shot('QA-17-17-runtime-reload-revokes');
        await open();
        const artwork = await page.evaluate(async () => {
            const { useCard } = await import(
                '/ygocarder/src/service/use-card.ts'
            );
            const url = useCard.getState().card.art;
            const r = await fetch(url);
            return {
                status: r.status,
                type: r.headers.get('content-type'),
                size: (await r.arrayBuffer()).byteLength,
            };
        });
        assert.equal(artwork.status, 200);
        assert.equal(artwork.type, 'image/png');
        assert(artwork.size > 0);
        await shot('QA-17-18-existing-read-artwork', { artwork });
        assert.equal(cases.length, 18);
        assert.deepEqual(errors, []);
        await fs.writeFile(
            path.join(output, 'evidence.json'),
            JSON.stringify(
                {
                    sha,
                    os: process.platform,
                    workspace: info,
                    cases,
                    requests,
                    page_errors: errors,
                },
                null,
                2,
            ),
        );
        console.log(
            `RUN017 UI evidence: ${cases.length} PASS / 0 FAIL / 0 SKIP at ${sha}`,
        );
    } catch (e) {
        await fs.writeFile(
            path.join(output, 'failure.json'),
            JSON.stringify(
                { sha, error: String(e), cases, requests, page_errors: errors },
                null,
                2,
            ),
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
