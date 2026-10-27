const assert = require('node:assert/strict'), fs = require('node:fs/promises'), path = require('node:path'), os = require('node:os');
const { execFileSync } = require('node:child_process');
const { createHash } = require('node:crypto');
const { chromium } = require('playwright-core');
const output = process.env.YU3DOH_QA_OUTPUT;
if (!output) throw Error('YU3DOH_QA_OUTPUT required');
const sha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const base = 'e07140d5a9555a17b7b2306a45625c14adfafc8e';
const url = 'http://127.0.0.1:3000/ygocarder/library/';
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function run() {
    await fs.mkdir(output, { recursive: true });
    const api = async route => { const r = await fetch('http://127.0.0.1:4312' + route); assert(r.ok); return r.json(); };
    const info = await api('/api/v1/workspace/_qa/info');
    assert.equal(info.sha, sha); assert.equal(info.count, 121); assert.equal(info.schema, 8);
    const beforeDB = await api('/api/v1/workspace/_qa/snapshot');
    await fs.writeFile(path.join(output,'fixture-info.json'),JSON.stringify(info,null,2));
    await fs.writeFile(path.join(output,'workspace-before.json'),JSON.stringify(beforeDB,null,2));
    const browser = await chromium.launch({ executablePath: process.env.YU3DOH_QA_CHROMIUM || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
    const allResponses=[], pending=[], requestFailures=[];
    const cases = [], requests = [], responses = [], errors = [], consoleErrors = [], proofs = {};
    const baselineRoot=process.env.YU3DOH_QA_BASELINE_ROOT || '/workspace/work/run025/baseline';
    assert.equal(execFileSync('git',['-C',baselineRoot,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),base);
    const baselinePage=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
    const baselineConsole=[], baselineLocations=[], baselineErrors=[], baselineFailures=[];
    baselinePage.on('console',m=>{if(m.type()==='error'){baselineConsole.push(m.text());baselineLocations.push({text:m.text(),location:m.location()});}});
    baselinePage.on('pageerror',e=>baselineErrors.push(e.message));
    baselinePage.on('response',r=>{if(r.status()>=400)baselineFailures.push({url:r.url(),status:r.status()});});
    await baselinePage.goto(process.env.YU3DOH_QA_BASELINE_URL || 'http://127.0.0.1:3001/ygocarder/library/');
    await baselinePage.locator('.library-card').first().click();
    await baselinePage.locator('.library-detail').waitFor(); await pause(500);
    await baselinePage.close();
    proofs.baselineRuntime={sha:base,consoleErrors:baselineConsole,consoleLocations:baselineLocations,pageErrors:baselineErrors,failedResponses:baselineFailures};
    const failedResponses=[], consoleLocations=[];
    page.on('response',r=>{if(r.status()>=400)failedResponses.push({url:r.url(),status:r.status()});});
    page.on('requestfailed',r=>requestFailures.push({url:r.url(),method:r.method(),failure:r.failure()}));
    page.on('response',r=>{if(r.url().includes('/api/v1/')){const task=(async()=>{let body;try{body=await r.text()}catch(e){body=String(e)}allResponses.push({url:r.url(),status:r.status(),headers:r.headers(),body,time:Date.now()})})();pending.push(task)}});
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') {consoleErrors.push(m.text());consoleLocations.push({text:m.text(),location:m.location()});} });
    page.on('request', r => { if (r.url().includes('/api/v1/')) requests.push({ url: r.url(), method: r.method(), body: r.postDataJSON(), time: Date.now() }); });
    page.on('response', async r => { if (/\/api\/v1\/library\/cards\?/.test(r.url()) && r.ok()) responses.push({ url: r.url(), body: await r.json() }); });
    const pass = async id => { await capture(id); cases.push({ id, observation: 'EXPECTED OBSERVED', sha, evidence: id+'.json' }); console.log(id + ' EXPECTED OBSERVED'); };
    const capture = async name => {
      const state=await snapshot();
      const controls=await page.evaluate(()=>Array.from(document.querySelectorAll('.library-view-control input, .library-results button, .library-results input, input[name="library-results-view"]')).map(el=>({tag:el.tagName,type:el.type,role:el.getAttribute('role'),name:el.getAttribute('aria-label'),checked:el.checked,focused:el===document.activeElement,text:el.textContent,outline:getComputedStyle(el).outline,rect:el.getBoundingClientRect().toJSON()})));
      await fs.writeFile(path.join(output,name+'.json'),JSON.stringify({state,controls,viewport:page.viewportSize(),dpr:await page.evaluate(()=>devicePixelRatio),authoritativeBrowse:responses.at(-1),time:new Date().toISOString()},null,2));
      await fs.writeFile(path.join(output,name+'.aria.yml'),await page.locator('body').ariaSnapshot());
      await page.screenshot({path:path.join(output,name+'.png'),fullPage:false});
    };
    const shot = name => capture(name);
    const cards = () => page.locator('.library-card');
    const radio = name => page.getByRole('radio', { name, exact: true });
    const browseCount = () => requests.filter(r => /\/library\/cards\?/.test(r.url)).length;
    const settle = async () => { await page.waitForFunction(() => document.querySelectorAll('.library-card').length > 0 && !document.querySelector('.library-results .ant-spin')); await pause(300); };
    const fresh = async () => { await page.goto(url); await settle(); };
    const snapshot = () => page.evaluate(() => ({
        mode: document.querySelector('input[name="library-results-view"]:checked')?.value,
        query: document.querySelector('.library-controls input')?.value,
        facets: Array.from(document.querySelectorAll('.library-controls .ant-select-selection-item')).map(el => el.textContent),
        page: document.querySelector('.ant-pagination-item-active')?.textContent,
        selected: document.querySelector('[data-testid="batch-selection-count"]')?.textContent,
        hidden: document.querySelector('[data-testid="batch-hidden-count"]')?.textContent,
        checked: Array.from(document.querySelectorAll('.library-card')).filter(el => el.querySelector('input:checked')).map(el => el.dataset.cardId),
        items: Array.from(document.querySelectorAll('.library-card')).map(el => ({ card_id: el.dataset.cardId, revision: el.dataset.revision })),
        detail: document.querySelector('.ant-drawer-open .library-detail__toolbar')?.textContent || null,
        selectedDetail: Array.from(document.querySelectorAll('.library-card--selected')).map(el => el.dataset.cardId),
    }));
    const switchProof = async (key, programmatic = false) => {
        const before = await snapshot(), count = browseCount(), start = requests.length;
        const next = before.mode === 'LIST' ? 'Grid' : 'List';
        if (programmatic) await radio(next).evaluate(el => el.click()); else await radio(next).click();
        await pause(1100);
        const after = await snapshot();
        const {mode: a, ...oldState} = before, {mode: b, ...newState} = after;
        assert.notEqual(a, b); assert.deepEqual(newState, oldState); assert.equal(browseCount(), count);
        assert.deepEqual(requests.slice(start), []);
        proofs[key] = { before, after, requests: requests.slice(start), stimulus: programmatic ? 'native radio click through DOM while existing modal Drawer is open' : 'pointer' };
    };
    const columns = async () => {
        const measurement=await page.locator('.library-results').evaluate(el => ({columns:getComputedStyle(el).gridTemplateColumns.split(' ').length,viewport:{width:innerWidth,height:innerHeight},dpr:devicePixelRatio,scrollWidth:document.documentElement.scrollWidth,mode:document.querySelector('input[name="library-results-view"]:checked').value}));
        (proofs.layouts ||= []).push(measurement); return measurement.columns;
    };
    const noOverflow = async () => assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    const closeDetail = async () => { await page.locator('.ant-drawer-open .ant-drawer-close').click(); await page.locator('.ant-drawer-open').waitFor({ state: 'hidden' }); await pause(350); };
    const selectFacet = async value => {
        await page.locator('.library-controls .ant-select').nth(2).click();
        await page.locator('.ant-select-dropdown:visible .ant-select-item-option-content').filter({hasText: new RegExp('^'+value+'$')}).click();
        await pause(650); await settle();
    };
    const nextPage = async n => { await page.locator(`.ant-pagination-item-${n}`).click(); await pause(650); await settle(); };
    const checkBatch = async () => {
        await page.getByRole('button', {name: 'Batch Classification…', exact: true}).click();
        await page.getByTestId('batch-effect-reviewed').click();
        await page.locator('.ant-select-dropdown:visible .ant-select-item-option-content').filter({hasText: /^True$/}).click();
        const response = page.waitForResponse(r => r.url().endsWith('/batch/classification/preview'));
        await page.getByTestId('batch-preview').click(); assert.equal((await response).status(), 200);
        const body = requests.filter(r => r.url.endsWith('/batch/classification/preview')).at(-1).body;
        await page.locator('.ant-modal-footer').getByRole('button', {name:'Close',exact:true}).click();
        await page.locator('.ant-modal-content').waitFor({state:'hidden'}); return body;
    };
    try {
        await fresh(); assert(await radio('List').isChecked()); assert.equal(await columns(), 1);
        assert.match(await cards().first().innerText(), /Archetype: F04 Broad/); await shot('01-list-1440'); await pass('F04-B01');
        await radio('Grid').click(); assert((await columns()) >= 3);
        assert.match(await cards().first().innerText(), /Variants:.*Standard.*Overframe/s); assert.equal(await cards().first().getByRole('checkbox').count(), 1);
        await shot('02-grid-1440'); await pass('F04-B02');
        await page.setViewportSize({width:900,height:1000}); assert((await columns()) >= 2); await shot('03-grid-900'); await pass('F04-B03');
        await page.setViewportSize({width:390,height:844}); assert.equal(await columns(),1); await noOverflow(); await shot('04-grid-390'); await pass('F04-B04');
        await radio('List').click(); assert.equal(await columns(),1); await noOverflow();
        for(const target of [radio('Grid'), cards().first().getByRole('button'), cards().first().getByRole('checkbox')]) { await target.scrollIntoViewIfNeeded(); assert(await target.isVisible()); }
        await shot('05-list-390'); await pass('F04-B05');
        await page.setViewportSize({width:1440,height:1000}); await fresh();
        await page.locator('.library-controls input').first().fill('F04 Search'); await pause(650); await selectFacet('F04 Broad'); await nextPage(2);
        assert.match((await snapshot()).page,/2/); assert.match(responses.at(-1).url,/limit=50/); await shot('06-page2-list');
        await switchProof('B06-B07-B25-page2'); await shot('07-page2-grid'); await switchProof('B06-return'); await pass('F04-B06'); await pass('F04-B07'); await pass('F04-B25');
        await fresh(); await cards().first().getByRole('checkbox').check();
        const first = (await snapshot()).items[0]; proofs.B08beforeFrozen=await checkBatch(); await nextPage(2); await switchProof('B08');
        assert.match((await snapshot()).selected,/1/); assert.match((await snapshot()).hidden,/1/); await shot('08-cross-page-hidden');
        const frozen1 = await checkBatch(); assert.deepEqual(frozen1.items,[{card_id:first.card_id,expected_revision:first.revision}]); proofs.B08.frozen = frozen1; assert.deepEqual(frozen1.items,proofs.B08beforeFrozen.items); await pass('F04-B08');
        await cards().first().getByRole('checkbox').check(); const second = (await snapshot()).items[0];
        proofs.B09beforeFrozen=await checkBatch(); await selectFacet('F04 Narrow'); assert.match((await snapshot()).hidden,/2/); await switchProof('B09');
        const frozen2 = await checkBatch(); assert.deepEqual(frozen2.items, [first,second].map(c=>({card_id:c.card_id,expected_revision:c.revision}))); proofs.B09.frozen=frozen2; assert.deepEqual(frozen2.items,proofs.B09beforeFrozen.items); await pass('F04-B09');
        await fresh(); await cards().first().getByRole('checkbox').check(); await switchProof('B10'); assert(await cards().first().getByRole('checkbox').isChecked()); await pass('F04-B10');
        assert.equal(await page.locator('.ant-drawer-open').count(),0); await cards().nth(1).getByRole('checkbox').check(); assert.equal(await page.locator('.ant-drawer-open').count(),0); await pass('F04-B11');
        const selectedCount=(await snapshot()).selected, target=(await snapshot()).items[1].card_id;
        await cards().nth(1).getByRole('button').click(); await page.locator('.library-detail').waitFor();
        assert.match((await snapshot()).detail,new RegExp(target)); assert.equal((await snapshot()).selected,selectedCount); await pass('F04-B12');
        await switchProof('B16',true); await shot('09-selected-detail-list'); await switchProof('B16-return',true); await shot('10-selected-detail-grid'); await pass('F04-B16');
        await closeDetail();
        for(const key of ['Enter','Space']) { const button=cards().nth(2).getByRole('button'); await radio('Grid').focus(); for(let n=0;n<30 && !(await button.evaluate(el=>el===document.activeElement));n++) await page.keyboard.press('Tab'); assert(await button.evaluate(el=>el===document.activeElement)); await capture('B13-focus-'+key); await button.press(key); await page.locator('.library-detail').waitFor(); assert.match((await snapshot()).detail,new RegExp((await snapshot()).items[2].card_id)); await closeDetail(); }
        await pass('F04-B13');
        const identity=(await snapshot()).selectedDetail; const box=cards().nth(3).getByRole('checkbox'); await box.focus(); const was=await box.isChecked(); await box.press('Space'); assert.equal(await box.isChecked(),!was); assert.deepEqual((await snapshot()).selectedDetail,identity); await pass('F04-B14');
        const group=page.getByRole('group',{name:'Library results view',exact:true}); assert.equal(await group.getByRole('radio').count(),2);
        await radio('Grid').focus(); await radio('Grid').press('ArrowRight'); assert(await radio('List').isChecked()); assert(await radio('List').evaluate(el=>el===document.activeElement)); await shot('11-view-keyboard-focus'); await pass('F04-B15');
        await cards().first().getByRole('button').click(); await page.locator('.library-detail').waitFor(); const keep=(await snapshot()).detail; const detailBefore=await snapshot();
        await page.locator('.ant-pagination-item-2').evaluate(el=>el.click()); await pause(650); await settle();
        assert.equal((await snapshot()).detail,keep); assert.deepEqual((await snapshot()).selectedDetail,[]);
        await page.locator('.ant-pagination-item-1').evaluate(el=>el.click()); await pause(650); await settle(); assert.equal((await snapshot()).selectedDetail.length,1); const detailReturned=await snapshot();
        // Hide the selected card with an ordinary facet transition while Drawer remains open.
        await page.locator('.library-controls .ant-select').nth(2).locator('.ant-select-selector').evaluate(el=>el.dispatchEvent(new MouseEvent('mousedown',{bubbles:true})));
        await page.locator('.ant-select-dropdown:visible .ant-select-item-option-content').filter({hasText: /^F04 Narrow$/}).evaluate(el=>el.click()); await pause(650); await settle();
        assert.equal((await snapshot()).detail,keep); assert.deepEqual((await snapshot()).selectedDetail,[]); proofs.B17={before:detailBefore,returned:detailReturned,detail:keep,hidden:await snapshot()}; await closeDetail(); await pass('F04-B17');
        await fresh();
        const summaries=responses.at(-1).body.items;
        proofs.B18={};
        for(const mode of ['List','Grid']) {
            await radio(mode).click(); const data=[];
            for(let i=0;i<summaries.length;i++) { const text=await cards().nth(i).innerText(),c=summaries[i]; assert.ok(text.includes(`Variants: ${c.variant_count}`)); assert.ok(text.includes(`Standard ${c.has_standard_ready_variant?'READY':'incomplete'}`)); assert.ok(text.includes(`Overframe ${c.has_overframe_ready_variant?'READY':'incomplete'}`)); data.push({card_id:c.card_id,revision:c.revision,text}); }
            proofs.B18[mode]=data; await shot('12-readiness-'+mode.toLowerCase());
        }
        assert(summaries.some(c=>c.has_standard_ready_variant)); assert(summaries.some(c=>c.has_overframe_ready_variant)); assert(summaries.some(c=>!c.has_standard_ready_variant)); await pass('F04-B18');
        await cards().first().getByRole('button').click(); await page.locator('.library-detail').waitFor(); await closeDetail();
        for(const mode of ['List','Grid']) { await radio(mode).click(); const selected=page.locator('.library-card--selected'); assert.match(await selected.innerText(),/Detail selected/); assert.match(await selected.getByRole('button').getAttribute('aria-label'),/Detail selected/); }
        await pass('F04-B23');
        for(const mode of ['List','Grid']) {
            await radio(mode).click(); await radio(mode).focus(); await page.keyboard.press('Tab');
            const button=cards().first().getByRole('button'); for(let tab=0;tab<15 && !(await button.evaluate(el=>el===document.activeElement));tab++) await page.keyboard.press('Tab'); assert(await button.evaluate(el=>el===document.activeElement)); assert.equal(await button.evaluate(el=>getComputedStyle(el).outlineStyle),'solid'); await shot('13-detail-focus-'+mode.toLowerCase());
            await page.keyboard.press('Tab'); const checkbox=cards().first().getByRole('checkbox'); assert(await checkbox.evaluate(el=>el===document.activeElement));
            assert.equal(await checkbox.evaluate(el=>getComputedStyle(el.closest('.ant-checkbox-wrapper')).outlineStyle),'solid'); await shot('14-batch-focus-'+mode.toLowerCase());
            await radio(mode).focus(); await page.keyboard.press('ArrowRight'); assert.equal(await page.evaluate(()=>getComputedStyle(document.activeElement).outlineStyle),'solid');
        }
        await pass('F04-B24');
        // Deterministic transport states: response interception only, never production behavior.
        const browsePattern='**/api/v1/library/cards?*';
        for(const mode of ['List','Grid']) {
            await radio(mode).click(); let release; const held=new Promise(resolve=>{release=resolve;});
            await page.route(browsePattern,async route=>{ await held; await route.continue(); });
            await page.getByRole('button',{name:'Refresh Library',exact:true}).click();
            await page.getByText('Loading Library…',{exact:true}).waitFor();
            assert.equal(await page.locator('.library-results > .library-state').count(),1);
            assert.equal(await page.locator('.library-state').first().evaluate(el=>getComputedStyle(el).gridColumn),'1 / -1');
            await capture('B19-loading-'+mode); release(); await settle(); await page.unroute(browsePattern);
        } await pass('F04-B19');
        for(const mode of ['List','Grid']) for(const empty of [true,false]) {
            await radio(mode).click(); if(empty) await page.route(browsePattern,async route=>{const upstream=await fetch(route.request().url().replace(':4312',':4313')); const body=await upstream.text(); proofs.emptyRealService={url:upstream.url,status:upstream.status,body}; await route.fulfill({status:upstream.status,contentType:'application/json',body});});
            if(!empty) { await page.locator('.library-controls input').first().fill('missing'); } else await page.getByRole('button',{name:'Refresh Library',exact:true}).click();
            await page.getByText(empty?'Library is empty.':'No matching cards.',{exact:true}).waitFor(); assert.equal(await page.locator('.library-results > .library-state').count(),1);
            assert.equal(await page.locator('.library-results > .library-state').evaluate(el=>getComputedStyle(el).gridColumn),'1 / -1');
            await capture('B20-'+(empty?'empty':'no-match')+'-'+mode); await page.unroute(browsePattern); await fresh();
        } await pass('F04-B20');
        for(const mode of ['List','Grid']) {
            await radio(mode).click(); await page.route(browsePattern,route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({code:'F04_INJECTED',message:'Disposable QA error'})}));
            await page.getByRole('button',{name:'Refresh Library',exact:true}).click(); await page.getByText('Library request failed',{exact:true}).waitFor();
            assert.equal(await page.locator('.library-results > .ant-alert').evaluate(el=>getComputedStyle(el).gridColumn),'1 / -1');
            await capture('B21-error-'+mode); await page.unroute(browsePattern); await page.locator('.library-results').getByRole('button',{name:'Retry',exact:true}).click(); await settle(); assert(await radio(mode).isChecked());
        } await pass('F04-B21');
        for(const mode of ['List','Grid']) { await radio(mode).click(); await nextPage(2); assert.equal(await cards().count(),50); assert.match(responses.at(-1).url,/offset=50/); assert.match(responses.at(-1).url,/limit=50/); assert.equal(await page.locator('.ant-pagination-options-size-changer').count(),0); await nextPage(1); }
        await pass('F04-B22');
        await page.reload(); await settle(); assert(await radio('List').isChecked()); proofs.reloadDefault='LIST';
        assert.deepEqual(errors,[]);
        // Chromium emits two resource-load console errors for the two deliberate 503 responses.
        const expected=consoleErrors.filter(e=>/Failed to load resource.*503/.test(e));
        assert.equal(expected.length,2);
        const known = e => (/^Warning: React does not recognize.*scrollLocker/s.test(e) && baselineConsole.some(b=>/^Warning: React does not recognize.*scrollLocker/s.test(b))) || (/Failed to load resource.*404/.test(e) && baselineLocations.some(r=>r.text===e && r.location.url.endsWith('/favicon.ico')) && consoleLocations.some(r=>r.text===e && r.location.url.endsWith('/favicon.ico')));
        assert.deepEqual(consoleErrors.filter(e=>!expected.includes(e) && !known(e)),[]);
        assert.deepEqual(failedResponses.filter(r=>r.status!==503 && !(r.status===404 && r.url.endsWith('/favicon.ico'))),[]);
        proofs.runtimeClassification={expectedInjected503:expected,baselineMatched:consoleErrors.filter(known),consoleLocations,failedResponses};
        const afterDB=await api('/api/v1/workspace/_qa/snapshot'); await fs.writeFile(path.join(output,'workspace-after.json'),JSON.stringify(afterDB,null,2)); assert.deepEqual(afterDB,beforeDB); proofs.workspaceUnchanged={beforeHash:createHash('sha256').update(JSON.stringify(beforeDB)).digest('hex'),afterHash:createHash('sha256').update(JSON.stringify(afterDB)).digest('hex')};
        await pass('F04-B26'); assert.equal(cases.length,26);
    } catch(error) {
        await capture('interruption').catch(()=>{});
        await fs.writeFile(path.join(output,'interruption.txt'),error.stack||String(error));
        throw error;
    } finally {
        await Promise.allSettled(pending);
        await fs.writeFile(path.join(output,'responses.json'),JSON.stringify(allResponses,null,2));
        await fs.writeFile(path.join(output,'request-failures.json'),JSON.stringify(requestFailures,null,2));
        await fs.writeFile(path.join(output,'evidence.json'),JSON.stringify({sha,base,environment:{os:os.platform(),release:os.release(),arch:os.arch(),node:process.version,yarn:execFileSync('yarn',['--version'],{encoding:'utf8'}).trim(),browser:browser.version(),engine:'Chromium',viewports:[{width:1440,height:1000},{width:900,height:1000},{width:390,height:844}],dpr:1,schema:info.schema,workspaceFormat:1,fixture:info.fixture,cardCount:info.count,workspaceRoot:info.root},cases,errors,consoleErrors,requests,responses,proofs},null,2));
        await browser.close();
    }
}
run().catch(error=>{console.error(error);process.exitCode=1;});
