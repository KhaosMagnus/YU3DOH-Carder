import assert from 'node:assert/strict';
import { getEmptyCard } from '../src/model/card';
import {
    buildWorkspaceIntentUrl,
    hasWorkspaceIntent,
    parseWorkspaceIntent,
} from '../src/service/workspace-bridge/intent';
import {
    mapFrame,
    mapLanguageFormat,
    mapLinkMarkers,
    mapSpellTrapSubFamily,
    mapTypeAbility,
    resolveArtworkLayers,
    type PrepareWorkingCardDto,
} from '../src/service/workspace-bridge/mapping-matrix';
import { prepareWorkingCard } from '../src/service/workspace-bridge/prepare-working-card';
import { getWorkspaceBridgeSession, setWorkspaceBridgeSession } from '../src/service/workspace-bridge/session';
import { WorkspaceBridgeError } from '../src/service/workspace-bridge/errors';
import {
    canOpenComposition,
    formatCarderOpenError,
} from '../src/library/open-in-carder';
import { LibraryHttpError } from '../src/library/api';
import type { LibraryVariantDetail } from '../src/library/model';
import { isWorkingFormDirty, detailToWorkingForm } from '../src/library/editor-state';

const baseDto = (overrides: Partial<PrepareWorkingCardDto> = {}): PrepareWorkingCardDto => ({
    identity: {
        card_id: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
        revision: '3',
        variant_id: 'ffffffff-1111-4222-8333-444444444444',
        composition: 'STANDARD',
        content_language: 'EN',
    },
    localized: {
        name: 'Blue Dragon',
        card_text: 'Effect text',
        pendulum_text: null,
    },
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
        assets: [{
            role: 'BS',
            asset_id: 'asset-bs',
            hash: 'abc',
            content_url: '/api/v1/carder/assets/asset-bs/content?hash=abc',
        }],
    },
    ...overrides,
});

let passed = 0;
const check = (name: string, fn: () => void) => {
    try {
        fn();
        passed += 1;
    } catch (error) {
        console.error(`FAIL ${name}`);
        throw error;
    }
};

check('1 getEmptyCard baseline then map', () => {
    const empty = getEmptyCard();
    assert.equal(empty.name, '');
    const { card } = prepareWorkingCard(baseDto());
    assert.equal(card.name, 'Blue Dragon');
    assert.notEqual(card.name, empty.name);
});

check('2 new InternalCard.id', () => {
    const { card } = prepareWorkingCard(baseDto());
    assert.ok(card.id);
    assert.notEqual(card.id, baseDto().identity.card_id);
});

check('3 session metadata retains workspace card_id', () => {
    setWorkspaceBridgeSession(null);
    const { session } = prepareWorkingCard(baseDto());
    assert.equal(session.cardId, baseDto().identity.card_id);
    assert.equal(getWorkspaceBridgeSession()?.cardId, session.cardId);
});

check('4 session id ≠ internal id', () => {
    const { card, session } = prepareWorkingCard(baseDto());
    assert.notEqual(card.id, session.cardId);
});

check('5 monster basics', () => {
    const { card } = prepareWorkingCard(baseDto());
    assert.equal(card.frame, 'effect');
    assert.equal(card.attribute, 'LIGHT');
    assert.equal(card.atk, '1800');
    assert.equal(card.def, '1200');
    assert.equal(card.star, 4);
    assert.ok(card.typeAbility.includes('Dragon'));
    assert.ok(card.typeAbility.includes('Effect'));
});

check('6 pendulum red/blue from single scale', () => {
    const { card } = prepareWorkingCard(baseDto({
        localized: { name: 'Pend', card_text: 'E', pendulum_text: 'P text' },
        structure: {
            ...baseDto().structure,
            abilities: ['EFFECT', 'PENDULUM'],
            pendulum_scale: 7,
        },
    }));
    assert.equal(card.isPendulum, true);
    assert.equal(card.pendulumScaleRed, '7');
    assert.equal(card.pendulumScaleBlue, '7');
    assert.equal(card.pendulumEffect, 'P text');
});

check('7 link 1–9 mapping', () => {
    assert.deepEqual(mapLinkMarkers(['TOP_LEFT', 'TOP', 'RIGHT', 'BOTTOM']), ['1', '2', '6', '8']);
    const { card } = prepareWorkingCard(baseDto({
        structure: {
            ...baseDto().structure,
            summon_kind: 'LINK',
            level: null,
            def: null,
            link_markers: ['TOP', 'LEFT'],
            link_rating: 2,
            abilities: [],
        },
    }));
    assert.equal(card.frame, 'link');
    assert.equal(card.isLink, true);
    assert.deepEqual(card.linkMap, ['2', '4']);
    assert.equal(card.linkRating, '2');
    assert.equal(card.def, '');
});

check('8 spell mapping', () => {
    const { card } = prepareWorkingCard(baseDto({
        structure: {
            ...baseDto().structure,
            family: 'SPELL',
            summon_kind: null,
            attribute_code: null,
            race_code: null,
            level: null,
            atk: null,
            def: null,
            abilities: [],
            subtype_code: 'FIELD',
        },
        artwork: baseDto().artwork,
    }));
    assert.equal(card.frame, 'spell');
    assert.equal(card.attribute, 'SPELL');
    assert.equal(card.subFamily, 'FIELD');
});

check('9 trap mapping', () => {
    const { card } = prepareWorkingCard(baseDto({
        structure: {
            ...baseDto().structure,
            family: 'TRAP',
            summon_kind: null,
            attribute_code: null,
            race_code: null,
            level: null,
            atk: null,
            def: null,
            abilities: [],
            subtype_code: 'COUNTER',
        },
    }));
    assert.equal(card.frame, 'trap');
    assert.equal(card.attribute, 'TRAP');
    assert.equal(card.subFamily, 'COUNTER');
});

check('10 Standard BS path', () => {
    const layers = resolveArtworkLayers(baseDto());
    assert.equal(layers.hasBackground, false);
    assert.match(layers.art, /asset-bs/);
});

check('11 Standard BG+OF path', () => {
    const layers = resolveArtworkLayers(baseDto({
        artwork: {
            composition: 'STANDARD',
            sources: ['BG', 'OF'],
            assets: [
                { role: 'BG', asset_id: 'bg', hash: 'h', content_url: '/api/v1/carder/assets/bg/content?hash=h' },
                { role: 'OF', asset_id: 'of', hash: 'h', content_url: '/api/v1/carder/assets/of/content?hash=h' },
            ],
        },
    }));
    assert.equal(layers.hasBackground, true);
    assert.match(layers.background, /\/bg\//);
    assert.match(layers.overlay, /\/of\//);
});

check('12 Overframe path', () => {
    const layers = resolveArtworkLayers(baseDto({
        artwork: {
            composition: 'OVERFRAME',
            sources: ['BS', 'OF'],
            assets: [
                { role: 'BS', asset_id: 'bs', hash: 'h', content_url: '/api/v1/carder/assets/bs/content?hash=h' },
                { role: 'OF', asset_id: 'of', hash: 'h', content_url: '/api/v1/carder/assets/of/content?hash=h' },
            ],
        },
    }));
    assert.equal(layers.hasBackground, false);
    assert.match(layers.art, /\/bs\//);
    assert.match(layers.overlay, /\/of\//);
});

check('13 unsupported frame / summon null', () => {
    assert.throws(
        () => mapFrame({ ...baseDto().structure, summon_kind: null }),
        (error: unknown) => error instanceof WorkspaceBridgeError && error.code === 'CARDER_MAPPING_UNSUPPORTED',
    );
});

check('14 unsupported markers', () => {
    assert.throws(
        () => mapLinkMarkers(['CENTER']),
        (error: unknown) => error instanceof WorkspaceBridgeError && error.code === 'CARDER_MAPPING_UNSUPPORTED',
    );
    assert.throws(
        () => mapLinkMarkers(['5']),
        (error: unknown) => error instanceof WorkspaceBridgeError && error.code === 'CARDER_MAPPING_UNSUPPORTED',
    );
});

check('15 QUICK_PLAY → QUICK-PLAY', () => {
    assert.equal(mapSpellTrapSubFamily('SPELL', 'QUICK_PLAY'), 'QUICK-PLAY');
});

check('16 language → region map', () => {
    assert.deepEqual(mapLanguageFormat('EN'), { format: 'tcg', region: 'en' });
    assert.deepEqual(mapLanguageFormat('ES'), { format: 'tcg', region: 'sp' });
    assert.deepEqual(mapLanguageFormat('JP'), { format: 'ocg', region: 'jp' });
});

check('17 ritual/fusion/synchro/xyz frames', () => {
    assert.equal(mapFrame({ ...baseDto().structure, summon_kind: 'RITUAL' }), 'ritual');
    assert.equal(mapFrame({ ...baseDto().structure, summon_kind: 'FUSION' }), 'fusion');
    assert.equal(mapFrame({ ...baseDto().structure, summon_kind: 'SYNCHRO' }), 'synchro');
    assert.equal(mapFrame({ ...baseDto().structure, summon_kind: 'XYZ' }), 'xyz');
});

check('18 token frame', () => {
    assert.equal(mapFrame({
        ...baseDto().structure,
        family: 'TOKEN',
        summon_kind: null,
        abilities: [],
    }), 'token');
});

check('19 opaque intent params only', () => {
    const url = buildWorkspaceIntentUrl('/', {
        cardId: 'card-1',
        variantId: 'var-1',
        composition: 'STANDARD',
        contentLanguage: 'EN',
        revision: '2',
    });
    assert.match(url, /ws_card_id=card-1/);
    assert.match(url, /ws_variant_id=var-1/);
    assert.match(url, /ws_composition=STANDARD/);
    assert.match(url, /ws_lang=EN/);
    assert.match(url, /ws_revision=2/);
    assert.equal(url.includes('data='), false);
    assert.equal(url.includes('Blue'), false);
    assert.equal(url.includes('/Assets/'), false);
});

check('20 intent parse + hasWorkspaceIntent', () => {
    const search = 'ws_card_id=a&ws_variant_id=b&ws_composition=OVERFRAME&ws_lang=JP&ws_revision=9';
    assert.equal(hasWorkspaceIntent(search), true);
    assert.deepEqual(parseWorkspaceIntent(search), {
        cardId: 'a',
        variantId: 'b',
        composition: 'OVERFRAME',
        contentLanguage: 'JP',
        revision: '9',
    });
    assert.equal(hasWorkspaceIntent('data=abc'), false);
});

check('21 READY gating helpers', () => {
    const variant = {
        variant_id: 'v1',
        card_id: 'c1',
        variant_key: 'k',
        display_label: 'K',
        standard: { state: 'READY', sources: ['BS'] },
        overframe: { state: 'INCOMPLETE', sources: [] },
        roles: {
            BS: { slot_state: 'BOUND', asset: null, issues: [] },
            BG: { slot_state: 'EMPTY', asset: null, issues: [] },
            OF: { slot_state: 'EMPTY', asset: null, issues: [] },
        },
    } as LibraryVariantDetail;
    assert.equal(canOpenComposition(variant, 'STANDARD'), true);
    assert.equal(canOpenComposition(variant, 'OVERFRAME'), false);
});

check('22 dirty block detection', () => {
    const detail = {
        card_id: 'c',
        revision: '1',
        family: 'SPELL' as const,
        password: null,
        structure: { kind: 'SPELL', subtype_code: 'NORMAL' },
        localizations: [{ language: 'EN' as const, name: 'A', card_text: 'B', pendulum_text: null }],
        confirmations: [],
        classification: {
            effect_reviewed: false,
            archetypes: [],
            effect_classifiers: [],
            functional_tags: [],
        },
        relations: [],
        provenance: [],
    };
    const working = detailToWorkingForm(detail);
    assert.equal(isWorkingFormDirty(detail, working), false);
    working.password = '1';
    assert.equal(isWorkingFormDirty(detail, working), true);
});

check('23 no false opened error formatting', () => {
    const formatted = formatCarderOpenError(new LibraryHttpError({
        status: 422,
        code: 'CARDER_PREPARATION_NOT_READY',
        message: 'not ready',
    }));
    assert.match(formatted, /CARDER_PREPARATION_NOT_READY/);
});

check('24 typeAbility unknown ability unsupported', () => {
    assert.throws(
        () => mapTypeAbility({
            ...baseDto().structure,
            abilities: ['UNKNOWN_ABILITY'],
        }),
        (error: unknown) => error instanceof WorkspaceBridgeError,
    );
});

check('25 xyz star uses rank', () => {
    const { card } = prepareWorkingCard(baseDto({
        structure: {
            ...baseDto().structure,
            summon_kind: 'XYZ',
            level: null,
            rank: 5,
            abilities: ['EFFECT'],
        },
    }));
    assert.equal(card.frame, 'xyz');
    assert.equal(card.star, 5);
});

check('26 defaults preserve no Limited/SetID/foil automation', () => {
    const { card } = prepareWorkingCard(baseDto());
    assert.equal(card.isLimitedEdition, false);
    assert.equal(card.setId, '');
    assert.equal(card.foil, 'normal');
});

check('27 intent precedes data carrier construction', () => {
    const url = buildWorkspaceIntentUrl('/?data=legacy', {
        cardId: 'c',
        variantId: 'v',
        composition: 'STANDARD',
        contentLanguage: 'EN',
        revision: '1',
    });
    assert.equal(url.includes('data='), false);
    assert.equal(hasWorkspaceIntent(url.split('?')[1] ?? ''), true);
});

check('28 integration prepare DTO → Carder fields', () => {
    const dto = baseDto({
        identity: { ...baseDto().identity, content_language: 'ES', composition: 'OVERFRAME' },
        localized: { name: 'Dragón', card_text: 'Efecto', pendulum_text: null },
        artwork: {
            composition: 'OVERFRAME',
            sources: ['BG', 'OF'],
            assets: [
                { role: 'BG', asset_id: 'bg', hash: '1', content_url: '/api/v1/carder/assets/bg/content?hash=1' },
                { role: 'OF', asset_id: 'of', hash: '2', content_url: '/api/v1/carder/assets/of/content?hash=2' },
            ],
        },
    });
    const { card, session } = prepareWorkingCard(dto);
    assert.equal(card.region, 'sp');
    assert.equal(card.format, 'tcg');
    assert.equal(card.name, 'Dragón');
    assert.equal(card.hasBackground, true);
    assert.equal(session.composition, 'OVERFRAME');
    assert.notEqual(card.id, session.cardId);
});

check('29 unknown spell subtype unsupported', () => {
    assert.throws(
        () => mapSpellTrapSubFamily('SPELL', 'WEIRD'),
        (error: unknown) => error instanceof WorkspaceBridgeError,
    );
});

check('30 numeric link markers identity', () => {
    assert.deepEqual(mapLinkMarkers(['1', '9']), ['1', '9']);
});

console.log(`workspace-bridge adapter/client checks passed: ${passed}`);
