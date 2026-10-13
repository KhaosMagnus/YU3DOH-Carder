import assert from 'node:assert/strict';
import { getEmptyCard } from '../src/model/card';
import { prepareWorkingCard } from '../src/service/workspace-bridge/prepare-working-card';
import type { PrepareWorkingCardDto } from '../src/service/workspace-bridge/mapping-matrix';
import {
    classifyWrite,
    guardedFields,
} from '../src/service/workspace-bridge/write-projection';
import { saveToWorkspace } from '../src/service/workspace-bridge/write-back';
const dto = (): PrepareWorkingCardDto => ({
    identity: {
        card_id: 'canonical',
        revision: '2',
        variant_id: 'v',
        composition: 'STANDARD',
        content_language: 'EN',
        write_grant: 'opaque',
    },
    localized: { name: 'Name', card_text: 'Text', pendulum_text: null },
    structure: {
        family: 'MONSTER',
        summon_kind: 'MAIN_DECK',
        attribute_code: 'LIGHT',
        race_code: 'DRAGON',
        level: 4,
        rank: null,
        atk: 1800,
        def: 1200,
        pendulum_scale: null,
        abilities: ['EFFECT'],
        link_markers: [],
        link_rating: null,
        subtype_code: null,
        password: '12345678',
    },
    artwork: {
        composition: 'STANDARD',
        sources: ['BS'],
        assets: [
            {
                role: 'BS',
                asset_id: 'a',
                hash: 'h',
                content_url: '/api/v1/carder/assets/a/content?hash=h&grant=x',
            },
        ],
    },
});
export async function runCarderWriteChecks() {
    let count = 0;
    const check = (name: string, fn: () => void) => {
        fn();
        console.log(`RUN017 CLIENT ${++count} PASS ${name}`);
    };
    const prepared = prepareWorkingCard(dto()),
        { session, card } = prepared;
    check('prepared supported baseline and opaque capability', () => {
        assert.equal(session.write?.grant, 'opaque');
        assert.deepEqual(classifyWrite(session, card).changedBlocks, []);
    });
    check('prepared guarded fields snapshot', () => {
        for (const key of guardedFields)
            assert.deepEqual(session.write!.guardedBaseline[key], card[key]);
    });
    for (const key of guardedFields)
        check(`guarded field exact label ${key}`, () => {
            const next = {
                ...card,
                [key]:
                    key === 'isLink'
                        ? true
                        : key === 'isPendulum'
                          ? true
                          : key === 'typeAbility' || key === 'linkMap'
                            ? ['changed']
                            : 'changed',
            };
            assert.ok(classifyWrite(session, next).unsupported.includes(key));
        });
    check('render-only does not block', () => {
        const c = classifyWrite(session, {
            ...card,
            foil: 'gold',
            name: 'Changed',
        });
        assert.deepEqual(c.changedBlocks, ['TEXT:EN']);
        assert.deepEqual(c.unsupported, []);
    });
    check('render-only no Workspace changes', () =>
        assert.deepEqual(
            classifyWrite(session, {
                ...card,
                art: 'https://example.test/local',
                password: card.password,
            }).changedBlocks,
            [],
        ),
    );
    check('exact projection excludes artwork/guarded/identity', () => {
        const c = classifyWrite(session, card);
        assert.equal(Object.keys(c.projection).length, 11);
        assert.ok(!('art' in c.projection));
        assert.ok(!('frame' in c.projection));
    });
    check('confirmed blocks acknowledgement selection', () =>
        assert.deepEqual(
            classifyWrite(session, { ...card, atk: '2000', name: 'Changed' })
                .required,
            ['STRUCTURE', 'TEXT:EN'],
        ),
    );
    check('standalone session has no writable state', () => {
        const d = dto();
        delete d.identity.write_grant;
        assert.equal(prepareWorkingCard(d).session.write, undefined);
    });
    check('Token password unsupported', () => {
        const d = dto();
        d.structure.family = 'TOKEN';
        d.structure.password = null;
        d.structure.abilities = [];
        const x = prepareWorkingCard(d);
        assert.ok(
            classifyWrite(x.session, {
                ...x.card,
                password: '123',
            }).unsupported.includes('password'),
        );
    });
    check('Link star and DEF unsupported', () => {
        const d = dto();
        Object.assign(d.structure, {
            summon_kind: 'LINK',
            level: null,
            def: null,
            link_markers: ['TOP'],
            link_rating: 1,
        });
        const x = prepareWorkingCard(d);
        const r = classifyWrite(x.session, { ...x.card, star: 2, def: '1' });
        assert.ok(r.unsupported.includes('star'));
        assert.ok(r.unsupported.includes('def'));
    });
    check('Pendulum unequal scales unsupported', () => {
        const d = dto();
        d.structure.abilities.push('PENDULUM');
        d.structure.pendulum_scale = 4;
        d.localized.pendulum_text = 'Pendulum';
        const x = prepareWorkingCard(d);
        assert.ok(
            classifyWrite(x.session, {
                ...x.card,
                pendulumScaleRed: '3',
            }).unsupported.includes('pendulum_scale_red/blue'),
        );
    });
    let payload: any;
    const request = async (_url: any, options: any) => {
        payload = JSON.parse(options.body);
        return {
            ok: true,
            json: async () => ({
                card_id: 'canonical',
                changed: true,
                previous_revision: session.revision,
                revision: '3',
                changed_blocks: ['TEXT:EN'],
                moved_to_draft: ['TEXT:EN'],
                write_grant: 'replacement',
            }),
        } as Response;
    };
    const changed = { ...card, name: 'Changed' };
    await saveToWorkspace(
        session,
        changed,
        ['TEXT:EN'],
        request as typeof fetch,
    );
    check('narrow exact write request', () => {
        assert.deepEqual(
            Object.keys(payload).sort(),
            [
                'write_grant',
                'card_id',
                'expected_revision',
                'content_language',
                'projection',
                'acknowledge_move_to_draft',
            ].sort(),
        );
        assert.equal(payload.expected_revision, '2');
        assert.equal(payload.card_id, 'canonical');
        assert.equal(payload.write_grant, 'opaque');
    });
    check('authoritative revision/grant/baseline adoption', () => {
        assert.equal(session.revision, '3');
        assert.equal(session.write!.grant, 'replacement');
        assert.equal(session.write!.baseline.name, 'Changed');
        assert.equal(session.write!.confirmations['TEXT:EN'], 'DRAFT');
    });
    check('current working copy remains; guarded baseline preserved', () => {
        assert.equal(changed.name, 'Changed');
        assert.deepEqual(session.write!.guardedBaseline.frame, card.frame);
    });
    await saveToWorkspace(session, changed, [], request as typeof fetch);
    check(
        'repeated save uses replacement grant/new revision without extra acknowledgement',
        () => {
            assert.equal(payload.expected_revision, '3');
            assert.equal(payload.write_grant, 'replacement');
            assert.deepEqual(payload.acknowledge_move_to_draft, []);
        },
    );
    let calls = 0;
    const failing = async () => {
        calls++;
        return {
            ok: false,
            json: async () => ({ code: 'REVISION_CONFLICT', message: 'stale' }),
        } as Response;
    };
    await assert.rejects(
        saveToWorkspace(session, changed, [], failing as typeof fetch),
        { code: 'REVISION_CONFLICT' },
    );
    check('revision conflict marks stale and preserves Carder edits', () => {
        assert.equal(session.write!.stale, true);
        assert.equal(changed.name, 'Changed');
        assert.equal(session.revision, '3');
    });
    await assert.rejects(
        saveToWorkspace(session, changed, [], failing as typeof fetch),
        { code: 'NO_WORKSPACE_CARDER_SESSION' },
    );
    check('no automatic retry or replay', () => assert.equal(calls, 1));
    const noop = prepareWorkingCard(dto());
    let noOpCalls = 0;
    await saveToWorkspace(noop.session, noop.card, [], (async () => {
        noOpCalls++;
        return {
            ok: true,
            json: async () => ({
                card_id: 'canonical',
                changed: false,
                previous_revision: '2',
                revision: '2',
                changed_blocks: [],
                moved_to_draft: [],
                write_grant: 'noop-rotated',
            }),
        } as Response;
    }) as typeof fetch);
    check('no-op adopts rotated grant without local revision increment', () => {
        assert.equal(noOpCalls, 1);
        assert.equal(noop.session.revision, '2');
        assert.equal(noop.session.write!.grant, 'noop-rotated');
    });
    console.log(`RUN017 CLIENT ${count} checks PASS`);
}
