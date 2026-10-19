import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
    monsterApplicability,
    proposeMonsterApplicability,
    emptyStructureForFamily,
    detailToWorkingForm,
    buildPatchPayload,
    type WorkingCardForm,
} from '../src/library/editor-state';
import type { LibraryCardDetail } from '../src/library/model';
import { mapLinkMarkers } from '../src/service/workspace-bridge/mapping-matrix';
import { ArrowPositionMap, LinkIconMap } from '../src/model/link';
export async function runRcEditorChecks() {
    let count = 0;
    const check = (name: string, run: () => void) => {
        run();
        console.log(`RC CLIENT ${++count} ${name} PASS`);
    };
    const working = (patch: Record<string, unknown> = {}): WorkingCardForm => ({
        password: null,
        structure: {
            ...emptyStructureForFamily('MONSTER'),
            summon_kind: 'MAIN_DECK',
            abilities: ['EFFECT'],
            ...patch,
        },
        localizations: [
            {
                language: 'EN',
                name: null,
                card_text: null,
                pendulum_text: 'Dormant',
            },
        ],
        classification: {
            effect_reviewed: false,
            archetype_ids: [],
            effect_classifier_ids: [],
            functional_tag_ids: [],
        },
        relations: [],
    });
    for (const kind of ['MAIN_DECK', 'RITUAL', 'FUSION', 'SYNCHRO'])
        check(kind + ' exposes Level only', () => {
            const a = monsterApplicability(
                working({ summon_kind: kind }).structure,
            );
            assert(a.level);
            assert(!a.rank && !a.link);
        });
    check('XYZ exposes Rank only', () => {
        const a = monsterApplicability(
            working({ summon_kind: 'XYZ' }).structure,
        );
        assert(a.rank && !a.level && !a.link);
    });
    check('LINK exposes markers without Pendulum', () => {
        const a = monsterApplicability(
            working({ summon_kind: 'LINK', abilities: ['PENDULUM'] }).structure,
        );
        assert(a.link && !a.level && !a.rank && !a.pendulum);
    });
    check('unknown summon does not invent MAIN_DECK', () => {
        const a = monsterApplicability(
            working({ summon_kind: null }).structure,
        );
        assert(!a.link && !a.level && !a.rank);
    });
    for (const kind of ['MAIN_DECK', 'RITUAL', 'FUSION', 'SYNCHRO', 'XYZ'])
        check(kind + ' PENDULUM independent ability', () =>
            assert(
                monsterApplicability(
                    working({ summon_kind: kind, abilities: ['PENDULUM'] })
                        .structure,
                ).pendulum,
            ),
        );
    for (const value of [0, 4])
        check(
            'XYZ transition explicitly proposes populated Level ' + value,
            () => {
                const w = working({ level: value });
                const before = JSON.stringify(w);
                const p = proposeMonsterApplicability(w, {
                    summon_kind: 'XYZ',
                });
                assert.deepEqual(p.clearings, [{ field: 'level', value }]);
                assert.equal(p.next.structure.level, null);
                assert.equal(JSON.stringify(w), before);
            },
        );
    for (const value of [0, 3])
        check('non-XYZ transition proposes populated Rank ' + value, () => {
            const w = working({ summon_kind: 'XYZ', rank: value });
            const p = proposeMonsterApplicability(w, {
                summon_kind: 'MAIN_DECK',
            });
            assert.deepEqual(p.clearings, [{ field: 'rank', value }]);
            assert.equal(p.next.structure.rank, null);
            assert.equal(w.structure!.rank, value);
        });
    check('LINK transition lists exact clears and preserves text', () => {
        const w = working({
            level: 0,
            rank: 2,
            def: 0,
            pendulum_scale: 0,
            abilities: ['PENDULUM', 'EFFECT'],
        });
        const p = proposeMonsterApplicability(w, { summon_kind: 'LINK' });
        assert.deepEqual(
            p.clearings.map((c) => c.field),
            ['rank', 'level', 'def', 'abilities.PENDULUM', 'pendulum_scale'],
        );
        assert.deepEqual(p.next.structure.abilities, ['EFFECT']);
        assert.deepEqual(p.next.localizations, w.localizations);
    });
    check('non-LINK transition proposes all markers', () => {
        const p = proposeMonsterApplicability(
            working({ summon_kind: 'LINK', link_markers: ['1', '9'] }),
            { summon_kind: 'XYZ' },
        );
        assert.deepEqual(p.clearings, [
            { field: 'link_markers', value: ['1', '9'] },
        ]);
        assert.deepEqual(p.next.structure.link_markers, []);
    });
    for (const scale of [0, 5])
        check(
            'Pendulum off with Scale ' +
                scale +
                ' requires confirmation proposal',
            () => {
                const w = working({
                    abilities: ['EFFECT', 'PENDULUM'],
                    pendulum_scale: scale,
                });
                const p = proposeMonsterApplicability(w, {
                    abilities: ['EFFECT'],
                });
                assert.deepEqual(p.clearings, [
                    { field: 'pendulum_scale', value: scale },
                ]);
                assert.equal(p.next.structure.pendulum_scale, null);
                assert.equal(w.structure!.pendulum_scale, scale);
                assert.deepEqual(p.next.localizations, w.localizations);
            },
        );
    check('empty applicability transition has no destructive clear', () =>
        assert.deepEqual(
            proposeMonsterApplicability(working(), { summon_kind: 'XYZ' })
                .clearings,
            [],
        ),
    );
    check('unknown summon preserves incomplete Level Rank and markers', () => {
        const p = proposeMonsterApplicability(
            working({ level: 0, rank: 0, link_markers: ['1'] }),
            { summon_kind: null },
        );
        assert.deepEqual(p.clearings, []);
        assert.equal(p.next.structure.rank, 0);
    });
    check(
        'historical contradiction not normalized by working-form adoption or TEXT-only patch',
        () => {
            const w = working({ rank: 0, pendulum_scale: 0 });
            const detail = {
                password: w.password,
                structure: w.structure,
                localizations: w.localizations,
                classification: {
                    effect_reviewed: false,
                    archetypes: [],
                    effect_classifiers: [],
                    functional_tags: [],
                },
                relations: [],
                confirmations: [],
                revision: '2',
            } as unknown as LibraryCardDetail;
            const form = detailToWorkingForm(detail);
            assert.equal(form.structure!.rank, 0);
            form.localizations = [
                { ...form.localizations[0], name: 'Changed' },
            ];
            const p = buildPatchPayload(detail, form);
            assert(!('structure' in p));
            assert.equal((p.localizations as unknown[]).length, 1);
        },
    );
    const formSource = readFileSync('src/library/editor-form.tsx', 'utf8');
    check('one explicit Pendulum control', () =>
        assert.equal(
            (formSource.match(/aria-label="Pendulum"/g) || []).length,
            1,
        ),
    );
    check('generic ability picker excludes PENDULUM', () =>
        assert.match(
            formSource,
            /metadata\?\.abilities[\s\S]*?filter\(\s*\(code\) => code !== 'PENDULUM'/,
        ),
    );
    check(
        'clear confirmation is distinct and cancel leaves working untouched',
        () => {
            assert.match(formSource, /onCancel=\{\(\) => setPending\(null\)\}/);
            assert.match(
                formSource.replace(/\s+/g, ' '),
                /This does not acknowledge moving a confirmed block to Draft/,
            );
        },
    );
    check('ordinary text clearing only on explicit input event', () =>
        assert.match(
            formSource.replace(/\s+/g, ''),
            /pendulum_text:event.target.value.trim\(\)\?event.target.value:null/,
        ),
    );
    check('renderer receives same eight marker codes through bridge', () =>
        assert.deepEqual(
            mapLinkMarkers(['1', '2', '3', '4', '6', '7', '8', '9']),
            ['1', '2', '3', '4', '6', '7', '8', '9'],
        ),
    );
    check('center 5 invalid', () => assert.throws(() => mapLinkMarkers(['5'])));
    for (const mode of ['normal', 'pendulum'] as const)
        check('renderer ' + mode + ' coordinate orientation', () => {
            const p = ArrowPositionMap[mode];
            assert(
                p[0].left < p[2].left &&
                    p[0].top < p[6].top &&
                    p[2].top < p[8].top,
            );
            assert(p[3].left < p[5].left);
            assert(p[6].left < p[8].left);
            assert.equal(p[4].width, 0);
            assert.equal(LinkIconMap['2'], '🡑');
            assert.equal(LinkIconMap['8'], '🡓');
        });
    check('renderer indexes the same numeric marker without inversion', () => {
        const renderer = readFileSync(
            'src/draw/predefined-section/layout.ts',
            'utf8',
        );
        assert(renderer.includes('ArrowPositionMap[positionType][entry - 1]'));
        assert(renderer.includes('linkMap.includes(`${entry}`)'));
    });
    console.log(`RC CLIENT ${count} checks PASS`);
}
