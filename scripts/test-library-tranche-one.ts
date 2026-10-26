import assert from 'node:assert/strict';
import { LINK_MARKER_POSITIONS, toggleLinkMarker } from '../src/library/link-marker-state';
import { preferredVariantWarning } from '../src/library/preferred-variant-warning';
import { defaultCarderVariant } from '../src/library/variant-lifecycle-state';
import { buildPatchPayload, detailToWorkingForm, detectDirtySections, impactedConfirmedBlocks, proposeMonsterApplicability } from '../src/library/editor-state';
import type { LibraryCardDetail, LibraryVariantDetail } from '../src/library/model';

export const runTrancheOneChecks = (sample: LibraryCardDetail) => {
    let checks = 0;
    const equal = (actual: unknown, expected: unknown) => { assert.deepEqual(actual, expected); checks++; };
    const codes = ['1','2','3','4','6','7','8','9'];
    equal(LINK_MARKER_POSITIONS.map(p => p.code), codes);
    equal(LINK_MARKER_POSITIONS.map(p => [p.row,p.column]), [[1,1],[1,2],[1,3],[2,1],[2,3],[3,1],[3,2],[3,3]]);
    for (let mask = 0; mask < 256; mask++) {
        const baseline = codes.filter((_, i) => mask & (1 << i)).reverse();
        for (const code of codes) {
            const original = [...baseline];
            const next = toggleLinkMarker(baseline, code, baseline);
            equal(next.includes(code), !baseline.includes(code));
            equal(next.length, baseline.length + (baseline.includes(code) ? -1 : 1));
            equal(new Set(next).size, next.length);
            equal(toggleLinkMarker(next, code, baseline), baseline);
            equal(baseline, original);
        }
        for (const invalid of ['5','CENTER','LEFT','TOP_LEFT','']) equal(toggleLinkMarker(baseline, invalid, baseline), baseline);
    }
    const baseline = ['9','1','4'];
    const detail: LibraryCardDetail = { ...sample, family: 'MONSTER',
        structure: { kind:'MONSTER', summon_kind:'LINK', link_markers:baseline, link_rating:3 } as LibraryCardDetail['structure'] };
    const form = detailToWorkingForm(detail);
    equal(form.structure?.link_markers, baseline);
    equal('link_rating' in form.structure!, false);
    equal(Object.values(detectDirtySections(detail,form)).some(Boolean), false);
    form.structure = { ...form.structure, link_markers:toggleLinkMarker(baseline,'2',baseline) };
    equal(detectDirtySections(detail,form), { password:false, structure:true, localizations:false, classification:false, relations:false });
    equal('link_rating' in (buildPatchPayload(detail,form).structure as object), false);
    equal(impactedConfirmedBlocks(detail,form).filter(b=>b!=='STRUCTURE'), []);
    form.structure.link_markers = toggleLinkMarker(form.structure.link_markers as string[],'2',baseline);
    equal(Object.values(detectDirtySections(detail,form)).some(Boolean), false);
    const outgoing = proposeMonsterApplicability(form,{summon_kind:'MAIN_DECK'});
    equal(outgoing.clearings.find(c=>c.field==='link_markers')?.value, baseline);
    equal(outgoing.next.structure?.link_markers, []);
    equal(form.structure.link_markers, baseline);
    equal(proposeMonsterApplicability(form,{summon_kind:null}).next.structure?.link_markers, baseline);
    const nonLink = { ...form, structure: { kind:'MONSTER',summon_kind:'MAIN_DECK',level:4,rank:null,def:1500,abilities:['EFFECT','PENDULUM'],pendulum_scale:3,link_markers:[] } };
    const incoming = proposeMonsterApplicability(nonLink,{summon_kind:'LINK'});
    equal(incoming.clearings.map(c=>c.field), ['level','def','abilities.PENDULUM','pendulum_scale']);
    equal(incoming.next.structure?.link_markers, []);
    equal(nonLink.structure.level, 4);
    const suffix=' It remains selected; choose another variant manually if needed.';
    equal(preferredVariantWarning(false,true),'Preferred Variant: STANDARD unavailable; OVERFRAME remains available.'+suffix);
    equal(preferredVariantWarning(true,false),'Preferred Variant: OVERFRAME unavailable; STANDARD remains available.'+suffix);
    equal(preferredVariantWarning(false,false),'Preferred Variant: STANDARD and OVERFRAME unavailable.'+suffix);
    equal(preferredVariantWarning(true,true),null);
    const variants = [{variant_id:'preferred',standard:{state:'INCOMPLETE'},overframe:{state:'INCOMPLETE'}},
        {variant_id:'ready',standard:{state:'READY'},overframe:{state:'READY'}}] as LibraryVariantDetail[];
    equal(defaultCarderVariant([],null),'');
    equal(defaultCarderVariant([variants[0]!],null),'preferred');
    equal(defaultCarderVariant(variants,null),'');
    equal(defaultCarderVariant(variants,'preferred'),'preferred');
    equal(defaultCarderVariant(variants,'missing'),'');
    equal(defaultCarderVariant([variants[1]!],'missing'),'');
    console.log(`RUN024 F03/F06 focused deterministic assertions: ${checks} PASS`);
};
