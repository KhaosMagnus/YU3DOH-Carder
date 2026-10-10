/* Reproducible real-browser QA against run012-qa-fixture.cjs only. */
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { chromium } = require('playwright-core');
const server = 'http://127.0.0.1:4312';
const output = process.env.YU3DOH_QA_OUTPUT || path.resolve('run012-ui-evidence');
const testedSha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const api = async (route, method = 'GET') => {
    const response = await fetch(server + route, { method });
    assert.equal(response.ok, true, await response.clone().text()); return response.json();
};
async function run() {
    await fs.mkdir(output, { recursive: true });
    const info = await api('/_qa/info');
    assert.equal((await api('/api/v1/workspace/status')).workspace_id, 'run012-isolated-qa');
    const browser = await chromium.launch({ headless: true, ...(process.env.YU3DOH_QA_CHROMIUM ? { executablePath: process.env.YU3DOH_QA_CHROMIUM } : {}), args: ['--no-sandbox'] });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    const requests = []; page.on('request', request => { if (request.url().includes('/api/v1/')) requests.push({ path: new URL(request.url()).pathname, method: request.method(), body: request.postDataJSON() }); });
    const cases = [];
    const visible = locator => locator.waitFor({ state: 'visible' });
    const screenshot = async name => { await page.screenshot({ path: path.join(output, name + '.png'), fullPage: true, animations: 'disabled' }); cases.push({ name, sha: testedSha, result: 'PASS' }); console.log(`RUN012 UI ${name} PASS`); };
    const modal = () => page.locator('.ant-modal:visible');
    const action = async op => modal().getByLabel('Action', { exact: true }).selectOption(op);
    const review = async () => { await modal().getByRole('button', { name: /Preview \/ review|Review decision/ }).click(); await modal().getByRole('button', { name: /^Confirm / }).waitFor({ state: 'visible' }); };
    const confirm = async () => { await modal().getByRole('button', { name: /^Confirm (replace|remove|relink|choose conflict winner|move|attach|unassign|leave unresolved)$/ }).click(); };
    const success = async () => visible(modal().getByText(/completed\. Authoritative views refreshed\.|Left unresolved\. No asset changes\./));
    const closeModal = async () => { await modal().getByRole('button', { name: 'Cancel', exact: true }).click(); await page.locator('.ant-modal:visible').waitFor({ state: 'hidden' }); };
    const closeDetail = async () => { const close = page.locator('.ant-drawer:visible .ant-drawer-close'); if (await close.count()) { await close.click(); await page.locator('.ant-drawer:visible').waitFor({ state: 'hidden' }); } };
    const openCard = async name => {
        await closeDetail(); await page.locator('.library-card').filter({ hasText: `QA ${name}` }).click();
        await page.locator('.ant-drawer:visible').getByRole('button', { name: 'Variants / Assets', exact: true }).click();
        await visible(page.locator('.ant-drawer:visible .library-variant-card').first());
    };
    const slotAction = async (role, name = 'Asset actions') => {
        await page.locator('.ant-drawer:visible .library-variant-card').first().locator('.library-role-slot').nth(['BS','BG','OF'].indexOf(role)).getByRole('button', { name }).click();
        await visible(modal().getByLabel('Action', { exact: true }));
    };
    const source = file => modal().getByLabel('Absolute source path', { exact: true }).fill(file);
    const attention = async () => { await closeDetail(); if (!await page.getByRole('heading', { name: 'Needs Attention', exact: true }).isVisible()) await page.getByRole('button', { name: 'Needs Attention', exact: true }).click(); await visible(page.getByRole('heading', { name: 'Needs Attention', exact: true })); };
    const diagnostic = async name => { await attention(); await page.locator('.library-diagnostic').filter({ hasText: name }).getByRole('button', { name: /^(Resolve|Repair)$/ }).click(); await visible(modal().getByLabel('Action', { exact: true })); };
    try {
        await page.goto('http://127.0.0.1:3000/ygocarder/library/');
        await visible(page.locator('.library-card').filter({ hasText: 'QA Managed' }));
        await openCard('Managed'); await slotAction('BS'); await action('REPLACE'); await source(info.sources.bs);
        await screenshot('01-replace-source-selection');
        const domainBefore = await api('/_qa/domain'); await review();
        await visible(modal().getByRole('heading', { name: 'Replace preview', exact: true }));
        assert.deepEqual(await api('/_qa/domain'), domainBefore, 'Replace preview must not alter DB/files/recovery material');
        await screenshot('02-replace-preview-server-readiness'); await confirm(); await success(); await screenshot('03-replace-authoritative-success'); await closeModal();
        await slotAction('BS'); await action('REPLACE'); await modal().getByLabel('Source selection', { exact: true }).selectOption('indexed');
        const indexedState = await api('/api/v1/library/assets/resolution-state'); const indexedBg = indexedState.assets.find(a => a.relativePath === info.managed.BG.managedRelativePath);
        await modal().getByLabel('Indexed source', { exact: true }).selectOption(indexedBg.assetId); await review(); await visible(modal().getByRole('heading', { name: 'Replace preview' }));
        await screenshot('03b-indexed-source-replace'); await confirm(); await success(); await closeModal();
        // REMOVE BS in BS+BG+OF: Standard moves from BS to BG+OF; Overframe remains BG+OF.
        await slotAction('BS'); await action('REMOVE'); const removeBefore = await api('/_qa/domain'); await review();
        await visible(modal().getByRole('heading', { name: 'Remove preview', exact: true }));
        assert.match(await modal().getByLabel('Readiness after').innerText(), /Standard: READY ← BG \+ OF/);
        assert.match(await modal().getByLabel('Readiness after').innerText(), /Overframe: READY ← BG \+ OF/);
        await screenshot('04-remove-preview-composition-precedence'); const count = requests.filter(r => r.path.endsWith('/managed-assets/mutate')).length;
        await closeModal(); assert.deepEqual(await api('/_qa/domain'), removeBefore); assert.equal(requests.filter(r => r.path.endsWith('/managed-assets/mutate')).length, count);
        await screenshot('05-cancel-preview-no-side-effects');
        // OF opaque rejection stays visible and never enables confirmation.
        await slotAction('OF'); await action('REPLACE'); await source(info.sources.opaque); await review();
        await visible(modal().getByText(/ASSET_SOURCE_INVALID/)); assert.equal(await modal().getByRole('button', { name: 'Confirm replace', exact: true }).isEnabled(), false);
        await screenshot('06-opaque-of-rejected'); await source(info.sources.of); await review(); await visible(modal().getByRole('heading', { name: 'Replace preview' }));
        await screenshot('07-transparent-of-preview'); await closeModal();
        // Real physical target changes between preview and execution => stale, with no replay.
        await slotAction('BS'); await action('REPLACE'); await source(info.sources.bs); await review(); await visible(modal().getByRole('heading', { name: 'Replace preview' }));
        await api('/_qa/change-target', 'POST'); await confirm(); await visible(modal().getByText('Asset state changed. Review the updated state before continuing.', { exact: true }));
        assert.equal(await modal().getByRole('button', { name: 'Confirm replace', exact: true }).isEnabled(), false);
        assert.equal(await modal().getByLabel('Absolute source path', { exact: true }).inputValue(), info.sources.bs);
        await screenshot('08-stale-requires-new-review'); await review(); await visible(modal().getByRole('heading', { name: 'Replace preview' })); await confirm(); await success(); await closeModal();
        // Open in Carder consumes refreshed bindings.
        const preparation = page.waitForResponse(r => r.url().endsWith('/api/v1/carder/prepare-working-card'));
        const popup = page.waitForEvent('popup'); await page.locator('.ant-drawer:visible').getByRole('button', { name: 'Open Standard', exact: true }).click();
        const prepared = await preparation; assert.equal(prepared.status(), 200); const preparedBody = await prepared.json(); assert.deepEqual(preparedBody.artwork.sources, ['BS']);
        const tab = await popup; await tab.close(); await screenshot('09-open-carder-after-binding-refresh');
        await slotAction('BG'); await action('REPLACE'); await source(info.sources.bg); await review(); await visible(modal().getByRole('heading', { name: 'Replace preview' })); await screenshot('09b-bg-replace-preview'); await confirm(); await success(); await closeModal();
        await slotAction('BG'); await action('REMOVE'); await review(); await visible(modal().getByRole('heading', { name: 'Remove preview' })); await confirm(); await success(); await screenshot('09c-remove-authoritative-success'); await closeModal();
        // Managed and unmanaged same-slot repair.
        await openCard('Broken'); await slotAction('BS', 'Repair / resolve asset'); await action('RELINK'); await source(info.sources.bs + '.missing'); await review(); await confirm(); await visible(modal().getByText(/ASSET_SOURCE_INVALID/));
        await screenshot('10a-relink-invalid-source-no-success'); await source(info.sources.bs); await review();
        await visible(modal().getByText('The selected source has NOT been preview-validated. Workspace Service validates it during execution.', { exact: true }));
        await screenshot('10-managed-relink-fixed-target-review'); await confirm(); await success(); await closeModal();
        await diagnostic('12000004-Missing'); await source(info.sources.bs); await review(); await screenshot('11-unmanaged-relink-target-asset'); await confirm(); await success(); await closeModal();
        // Conflict candidates are server-provided, initially none selected.
        await openCard('Conflict');
        const defaultVariant = page.locator('.ant-drawer:visible .library-variant-card').filter({ hasText: 'key: default' });
        await defaultVariant.getByRole('button', { name: 'Resolve Conflict' }).click(); await visible(modal().getByRole('radio').first());
        assert.equal(await modal().getByRole('radio').count(), 3); for (const radio of await modal().getByRole('radio').all()) assert.equal(await radio.isChecked(), false);
        await screenshot('12-conflict-all-candidates-no-default'); await action('MOVE'); await modal().getByRole('radio').first().check();
        const variants = await api(`/api/v1/library/cards/${info.cards.Conflict}/variants`); const other = variants.variants.find(v => v.variant_key === 'other');
        await modal().getByLabel('Existing target variant', { exact: true }).selectOption(other.variant_id); await review(); await screenshot('13-conflict-move-existing-variant'); await confirm(); await success(); await closeModal();
        await defaultVariant.getByRole('button', { name: 'Resolve Conflict' }).click(); await visible(modal().getByRole('radio').first());
        const chosen = await modal().getByRole('radio').first().getAttribute('value'); await modal().getByRole('radio').first().check(); await review(); await confirm(); await success();
        const state = await api('/api/v1/library/assets/resolution-state');
        assert.equal(state.overrides.find(o => o.asset_id === chosen).disposition, 'ASSIGN');
        const losers = state.overrides.filter(o => o.disposition === 'UNASSIGN'); assert.equal(losers.length, 1);
        assert.equal(state.assets.find(a => a.assetId === losers[0].asset_id).present, true);
        await screenshot('14-choose-winner-losers-unassigned-preserved'); await closeModal();
        // Attach to existing card + existing variant.
        await diagnostic('12999999-Attach'); await screenshot('15-unresolved-metadata-hints');
        await modal().getByLabel('Find existing card', { exact: true }).fill('QA Broken'); await modal().getByRole('button', { name: 'Search cards', exact: true }).click();
        await modal().getByLabel('Existing card', { exact: true }).selectOption(info.cards.Broken);
        await modal().getByLabel('Existing target variant', { exact: true }).selectOption(info.missing.variantId);
        await modal().getByLabel('Target role', { exact: true }).selectOption('BG');
        await review(); await screenshot('16-attach-existing-card-review'); await confirm(); await success(); await screenshot('17-attention-after-attach-success'); await closeModal(); assert.equal((await api('/api/v1/library/needs-attention')).items.some(i => i.relative_path.includes('12999999-Attach')), false);
        // Resolver-only target variant creation.
        await diagnostic('12999999-NewVariant'); await action('LEAVE'); const leaveBefore = await api('/_qa/domain'); await review(); await confirm(); await success(); assert.deepEqual(await api('/_qa/domain'), leaveBefore); await screenshot('17b-leave-explicit-noop'); await closeModal();
        await diagnostic('12999999-NewVariant'); await modal().getByLabel('Find existing card', { exact: true }).fill('QA Managed'); await modal().getByRole('button', { name: 'Search cards', exact: true }).click();
        await modal().getByLabel('Existing card', { exact: true }).selectOption(info.cards.Managed);
        await modal().getByLabel('Target variant mode', { exact: true }).selectOption('new'); await modal().getByLabel('Target variant key', { exact: true }).fill('ResolverOnly');
        await modal().getByLabel('Target role', { exact: true }).selectOption('BS'); await review(); await screenshot('18-create-variant-inside-attach'); await confirm(); await success(); await closeModal();
        // Matching-password non-TOKEN Draft: explicit fence precedes Canonical creation.
        const draftStart = requests.length;
        await diagnostic('12999999-Draft');
        const beforeIntent = await api('/_qa/domain');
        const draftSource = (await api('/api/v1/library/assets/resolution-state')).assets.find(a => a.relativePath.includes('12999999-Draft'));
        await modal().getByRole('button', { name: 'Create Draft card for this resolution…', exact: true }).click();
        await modal().getByLabel('Draft family', { exact: true }).selectOption('SPELL');
        await modal().getByLabel('Draft password (optional)', { exact: true }).fill('12999999');
        await modal().getByLabel('Target role', { exact: true }).selectOption('BS');
        await modal().getByLabel('Target variant key', { exact: true }).fill('Explicit');
        await modal().getByRole('button', { name: 'Review Create Draft + Attach', exact: true }).click();
        await visible(modal().getByRole('heading', { name: 'Review Create Draft + Attach', exact: true }));
        assert.deepEqual(await api('/_qa/domain'), beforeIntent, 'Intent review cannot mutate DB/files');
        await modal().getByRole('button', { name: 'Confirm protection + Draft creation', exact: true }).scrollIntoViewIfNeeded();
        await screenshot('19a-draft-intent-confirmation-before-fence');
        await modal().getByRole('button', { name: 'Confirm protection + Draft creation', exact: true }).click();
        await visible(modal().getByText('Draft created. Asset not attached; source remains explicitly unassigned.', { exact: true }));
        const draftId = (await modal().getByText(/Retained Draft target:/).innerText()).replace('Retained Draft target: ', '');
        const assertDraftFence = async () => {
            const card = await api(`/api/v1/library/cards/${draftId}`); assert.equal(card.card_id, draftId); assert.equal(card.password, '12999999');
            const state = await api('/api/v1/library/assets/resolution-state');
            const asset = state.assets.find(a => a.assetId === draftSource.assetId);
            assert.equal(asset.cardId, null); assert.equal(asset.variantId, null); assert.equal(asset.associationState, 'UNRESOLVED'); assert.equal(asset.present, true);
            assert.equal(state.overrides.find(o => o.asset_id === asset.assetId).disposition, 'UNASSIGN');
            assert.deepEqual((await api(`/api/v1/library/cards/${draftId}/variants`)).variants, []);
            return state.expected_state_token;
        };
        const protectedToken = await assertDraftFence();
        await api('/api/v1/library/assets/resolution-state/refresh', 'POST');
        assert.equal(await assertDraftFence(), protectedToken, 'Matching Canonical password must not change the protected token on scan');
        await screenshot('19b-matching-password-draft-unassigned-no-automatic-variant');
        await review(); await screenshot('19-draft-created-explicit-attach-review'); await api('/_qa/fault/attachment', 'POST'); await confirm();
        await visible(modal().getByText(/ASSET_MUTATION_FAILED/));
        // The error renders before the authoritative refresh releases its mutation lease.
        await modal().locator('button:not([disabled])').filter({hasText:/Preview \/ review|Review decision/}).waitFor({state:'visible'});
        await assertDraftFence(); await screenshot('20-draft-created-attach-failed-retained');
        await api('/_qa/fault/none', 'POST'); await review(); await confirm(); await success();
        const attachedState = await api('/api/v1/library/assets/resolution-state');
        const attached = attachedState.assets.find(a => a.assetId === draftSource.assetId);
        assert.equal(attached.cardId, draftId); assert.equal(attached.variantKey, 'explicit'); assert.equal(attached.role, 'BS');
        assert.equal(attachedState.overrides.find(o => o.asset_id === attached.assetId).disposition, 'ASSIGN');
        const draftVariants = (await api(`/api/v1/library/cards/${draftId}/variants`)).variants;
        assert.equal(draftVariants.length, 1); assert.equal(draftVariants[0].variant_key, 'explicit');
        const draftRequests = requests.slice(draftStart);
        assert.equal(draftRequests.filter(r => r.path === '/api/v1/library/cards' && r.method === 'POST').length, 1);
        assert.equal(draftRequests.filter(r => r.body?.operation === 'UNASSIGN').length, 1);
        assert.equal(draftRequests.filter(r => r.body?.operation === 'ATTACH').length, 2);
        await screenshot('21-draft-attach-retry-same-card'); await closeModal();
        // Recovery-required is an actual rollback failure only in the disposable harness.
        await openCard('Managed'); await slotAction('BS'); await action('REPLACE'); await source(info.sources.bs); await review();
        await visible(modal().getByRole('heading', { name: 'Replace preview' })); await api('/_qa/fault/recovery', 'POST'); await confirm();
        await visible(modal().getByText('Asset operations blocked', { exact: true })); assert.equal((await api('/api/v1/workspace/status')).state, 'RECOVERY_REQUIRED');
        await screenshot('22-recovery-required-blocking-modal'); await closeModal();
        await visible(page.getByText('Asset operations blocked — Workspace recovery / readiness required', { exact: true }));
        for (const button of await page.getByRole('button', { name: 'Asset actions', exact: true }).all()) assert.equal(await button.isEnabled(), false);
        await screenshot('23-recovery-required-persists-after-close');
        assert.deepEqual(errors, []);
        await fs.writeFile(path.join(output, 'evidence.json'), JSON.stringify({ sha: testedSha, os: process.platform, cases, requests, pageErrors: errors }, null, 2));
        console.log(`RUN012 UI evidence: ${cases.length} PASS / 0 FAIL / 0 SKIP at ${testedSha}`);
    } catch (error) {
        await page.screenshot({ path: path.join(output, 'failure.png'), fullPage: true });
        await fs.writeFile(path.join(output, 'failure.json'), JSON.stringify({ sha: testedSha, error: String(error), cases, requests, pageErrors: errors }, null, 2)); throw error;
    } finally { await browser.close(); }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
