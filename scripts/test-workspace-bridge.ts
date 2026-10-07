import assert from 'node:assert/strict';
import { getEmptyCard } from '../src/model/card';
import {
    buildCarderLaunchUrl,
    buildWorkspaceIntentUrl,
    hasWorkspaceIntent,
    parseWorkspaceIntent,
} from '../src/service/workspace-bridge/intent';
import {
    mapFrame,
    mapLinkMarkers,
    mapLinkRating,
    mapSpellTrapSubFamily,
    mapTypeAbility,
    resolveArtworkComposition,
    type PrepareWorkingCardDto,
} from '../src/service/workspace-bridge/mapping-matrix';
import { prepareWorkingCard } from '../src/service/workspace-bridge/prepare-working-card';
import { getWorkspaceBridgeSession, setWorkspaceBridgeSession } from '../src/service/workspace-bridge/session';
import { WorkspaceBridgeError } from '../src/service/workspace-bridge/errors';
import { runCarderStartup } from '../src/service/workspace-bridge/startup';
import {
    canOpenComposition,
    formatCarderOpenError,
} from '../src/library/open-in-carder';
import { LibraryHttpError } from '../src/library/api';
import type { LibraryVariantDetail } from '../src/library/model';
import { isWorkingFormDirty, detailToWorkingForm } from '../src/library/editor-state';
import type { InternalCard } from '../src/model';

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

const bsUrl = '/api/v1/carder/assets/asset-bs/content?hash=abc';
const bgUrl = '/api/v1/carder/assets/bg/content?hash=h';
const ofUrl = '/api/v1/carder/assets/of/content?hash=h';

const standardBgOfArtwork = (): PrepareWorkingCardDto['artwork'] => ({
    composition: 'STANDARD',
    sources: ['BG', 'OF'],
    assets: [
        { role: 'BG', asset_id: 'bg', hash: 'h', content_url: bgUrl },
        { role: 'OF', asset_id: 'of', hash: 'h', content_url: ofUrl },
    ],
});

const overframeBgOfArtwork = (): PrepareWorkingCardDto['artwork'] => ({
    composition: 'OVERFRAME',
    sources: ['BG', 'OF'],
    assets: [
        { role: 'BG', asset_id: 'bg', hash: 'h', content_url: bgUrl },
        { role: 'OF', asset_id: 'of', hash: 'h', content_url: ofUrl },
    ],
});

const overframeBsOfArtwork = (): PrepareWorkingCardDto['artwork'] => ({
    composition: 'OVERFRAME',
    sources: ['BS', 'OF'],
    assets: [
        { role: 'BS', asset_id: 'bs', hash: 'h', content_url: '/api/v1/carder/assets/bs/content?hash=h' },
        { role: 'OF', asset_id: 'of', hash: 'h', content_url: ofUrl },
    ],
});

let passed = 0;
const checkSync = (name: string, fn: () => void) => {
    try {
        fn();
        passed += 1;
    } catch (error) {
        console.error(`FAIL ${name}`);
        throw error;
    }
};
const checkAsync = async (name: string, fn: () => Promise<void>) => {
    try {
        await fn();
        passed += 1;
    } catch (error) {
        console.error(`FAIL ${name}`);
        throw error;
    }
};


checkSync('1 getEmptyCard baseline then map', () => {
    const empty = getEmptyCard();
    assert.equal(empty.name, '');
    const { card } = prepareWorkingCard(baseDto());
    assert.equal(card.name, 'Blue Dragon');
    assert.notEqual(card.name, empty.name);
});

checkSync('2 new InternalCard.id', () => {
    const { card } = prepareWorkingCard(baseDto());
    assert.ok(card.id);
    assert.notEqual(card.id, baseDto().identity.card_id);
});

checkSync('3 session metadata retains workspace card_id', () => {
    setWorkspaceBridgeSession(null);
    const { session } = prepareWorkingCard(baseDto());
    assert.equal(session.cardId, baseDto().identity.card_id);
    assert.equal(getWorkspaceBridgeSession()?.cardId, session.cardId);
});

checkSync('4 session id ≠ internal id', () => {
    const { card, session } = prepareWorkingCard(baseDto());
    assert.notEqual(card.id, session.cardId);
});

checkSync('5 monster basics', () => {
    const { card } = prepareWorkingCard(baseDto());
    assert.equal(card.frame, 'effect');
    assert.equal(card.attribute, 'LIGHT');
    assert.equal(card.atk, '1800');
    assert.equal(card.def, '1200');
    assert.equal(card.star, 4);
    assert.ok(card.typeAbility.includes('Dragon'));
    assert.ok(card.typeAbility.includes('Effect'));
});

checkSync('6 pendulum red/blue from single scale', () => {
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

checkSync('7 link 1–9 mapping', () => {
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

// T-C1 changed
checkSync('8 spell mapping', () => {
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
    assert.deepEqual(card.typeAbility, ['Spell Card']);
});

// T-C2 changed
checkSync('9 trap mapping', () => {
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
    assert.deepEqual(card.typeAbility, ['Trap Card']);
});

// T-C3 changed — direct working-card assertions for Standard BS
checkSync('10 Standard BS path', () => {
    const empty = getEmptyCard();
    const { card } = prepareWorkingCard(baseDto());
    assert.equal(card.art, bsUrl);
    assert.equal(card.artSource, 'online');
    assert.equal(card.artFit, true);
    assert.equal(card.hasBackground, false);
    assert.equal(card.opacity.boundless, false);
    assert.notEqual(card.art, empty.art);
    assert.equal(card.overlay, '');
});

// T-C4 changed — Standard BG+OF: OF as art, BG as background, neutral overlay
checkSync('11 Standard BG+OF path', () => {
    const empty = getEmptyCard();
    const { card } = prepareWorkingCard(baseDto({ artwork: standardBgOfArtwork() }));
    assert.equal(card.background, bgUrl);
    assert.equal(card.art, ofUrl);
    assert.equal(card.overlay, empty.overlay);
    assert.equal(card.overlay, '');
    assert.equal(card.backgroundType, 'strict');
    assert.equal(card.opacity.boundless, false);
    assert.equal(card.hasBackground, true);
    assert.equal(card.artFit, true);
    assert.equal(card.backgroundFit, true);
    assert.equal(card.artSource, 'online');
    assert.equal(card.backgroundSource, 'online');
    assert.notEqual(card.art, empty.art);
});

// T-C5 changed — Overframe BS+OF
checkSync('12 Overframe path', () => {
    const empty = getEmptyCard();
    const { card } = prepareWorkingCard(baseDto({
        identity: { ...baseDto().identity, composition: 'OVERFRAME' },
        artwork: overframeBsOfArtwork(),
    }));
    assert.equal(card.background, '/api/v1/carder/assets/bs/content?hash=h');
    assert.equal(card.art, ofUrl);
    assert.equal(card.hasBackground, true);
    assert.equal(card.backgroundType, 'full');
    assert.equal(card.opacity.boundless, true);
    assert.equal(card.opacity.frameBorder, true);
    assert.equal(card.artFit, true);
    assert.equal(card.backgroundFit, true);
    assert.equal(card.overlay, '');
    assert.notEqual(card.art, empty.art);
});

checkSync('13 unsupported frame / summon null', () => {
    assert.throws(
        () => mapFrame({ ...baseDto().structure, summon_kind: null }),
        (error: unknown) => error instanceof WorkspaceBridgeError && error.code === 'CARDER_MAPPING_UNSUPPORTED',
    );
});

checkSync('14 unsupported markers', () => {
    assert.throws(
        () => mapLinkMarkers(['CENTER']),
        (error: unknown) => error instanceof WorkspaceBridgeError && error.code === 'CARDER_MAPPING_UNSUPPORTED',
    );
    assert.throws(
        () => mapLinkMarkers(['5']),
        (error: unknown) => error instanceof WorkspaceBridgeError && error.code === 'CARDER_MAPPING_UNSUPPORTED',
    );
});

checkSync('15 QUICK_PLAY → QUICK-PLAY', () => {
    assert.equal(mapSpellTrapSubFamily('SPELL', 'QUICK_PLAY'), 'QUICK-PLAY');
});

// T-C6 changed — language does NOT change renderer profile (QA-009-08 hardening: renamed;
// compares every non-localized stable field EN/ES/JP, excluding only id + localized text).
checkSync('16 content_language does not change Carder profile — all non-localized stable fields equal (EN/ES/JP)', () => {
    const empty = getEmptyCard();
    const localizedText: Record<'EN' | 'ES' | 'JP', PrepareWorkingCardDto['localized']> = {
        EN: { name: 'Dragon', card_text: 'EN text', pendulum_text: 'EN pendulum' },
        ES: { name: 'Dragón', card_text: 'Texto ES', pendulum_text: 'Péndulo ES' },
        JP: { name: 'ドラゴン', card_text: 'JPテキスト', pendulum_text: 'ペンデュラムJP' },
    };
    const mapFor = (language: 'EN' | 'ES' | 'JP') => prepareWorkingCard(baseDto({
        identity: { ...baseDto().identity, content_language: language },
        localized: localizedText[language],
        structure: {
            ...baseDto().structure,
            abilities: ['EFFECT', 'PENDULUM'],
            pendulum_scale: 7,
        },
    }));
    const en = mapFor('EN');
    const es = mapFor('ES');
    const jp = mapFor('JP');

    // Excluded ONLY: InternalCard.id (fresh uuid) and localized name/effect/pendulum text.
    const localizedCardFields = ['id', 'name', 'effect', 'pendulumEffect'] as const;
    const stableCard = (card: InternalCard) => {
        const copy: Record<string, unknown> = { ...card };
        for (const key of localizedCardFields) delete copy[key];
        return copy;
    };
    assert.deepEqual(stableCard(en.card), stableCard(es.card));
    assert.deepEqual(stableCard(en.card), stableCard(jp.card));
    // Sanity: the comparison covers every other field of InternalCard.
    assert.equal(
        Object.keys(stableCard(en.card)).length,
        Object.keys(en.card).length - localizedCardFields.length,
    );
    assert.equal(en.card.isPendulum, true);
    assert.equal(en.card.pendulumScaleRed, '7');

    // P-4/P-5 not reopened: format/region stay getEmptyCard() defaults for every language.
    for (const { card } of [en, es, jp]) {
        assert.equal(card.format, empty.format);
        assert.equal(card.region, empty.region);
    }

    // Localized fields DO follow the requested language.
    for (const [language, { card }] of [['EN', en], ['ES', es], ['JP', jp]] as const) {
        assert.equal(card.name, localizedText[language].name);
        assert.equal(card.effect, localizedText[language].card_text);
        assert.equal(card.pendulumEffect, localizedText[language].pendulum_text);
    }
    assert.notEqual(en.card.id, es.card.id);
    assert.notEqual(en.card.id, jp.card.id);

    // Session: only the language-bearing contentLanguage and transient preparedAt may differ.
    const stableSession = (session: typeof en.session) => {
        const { contentLanguage: _language, preparedAt: _preparedAt, ...rest } = session;
        return rest;
    };
    assert.deepEqual(stableSession(en.session), stableSession(es.session));
    assert.deepEqual(stableSession(en.session), stableSession(jp.session));
    assert.equal(en.session.contentLanguage, 'EN');
    assert.equal(es.session.contentLanguage, 'ES');
    assert.equal(jp.session.contentLanguage, 'JP');
});

checkSync('17 ritual/fusion/synchro/xyz frames', () => {
    assert.equal(mapFrame({ ...baseDto().structure, summon_kind: 'RITUAL' }), 'ritual');
    assert.equal(mapFrame({ ...baseDto().structure, summon_kind: 'FUSION' }), 'fusion');
    assert.equal(mapFrame({ ...baseDto().structure, summon_kind: 'SYNCHRO' }), 'synchro');
    assert.equal(mapFrame({ ...baseDto().structure, summon_kind: 'XYZ' }), 'xyz');
});

// T-C7 changed — Token semantics
checkSync('18 token frame', () => {
    const { card } = prepareWorkingCard(baseDto({
        structure: {
            ...baseDto().structure,
            family: 'TOKEN',
            summon_kind: null,
            abilities: [],
            password: null,
            race_code: 'DRAGON',
            level: 1,
        },
    }));
    assert.equal(card.frame, 'token');
    assert.deepEqual(card.typeAbility, ['Dragon', 'Token']);
    assert.equal(card.star, 1);
    assert.equal(card.password, '');
});

checkSync('19 opaque intent params only', () => {
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

checkSync('20 intent parse + hasWorkspaceIntent', () => {
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

checkSync('21 READY gating helpers', () => {
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

checkSync('22 dirty block detection', () => {
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

checkSync('23 no false opened error formatting', () => {
    const formatted = formatCarderOpenError(new LibraryHttpError({
        status: 422,
        code: 'CARDER_PREPARATION_NOT_READY',
        message: 'not ready',
    }));
    assert.match(formatted, /CARDER_PREPARATION_NOT_READY/);
});

checkSync('24 typeAbility unknown ability unsupported', () => {
    assert.throws(
        () => mapTypeAbility({
            ...baseDto().structure,
            abilities: ['UNKNOWN_ABILITY'],
        }),
        (error: unknown) => error instanceof WorkspaceBridgeError,
    );
});

checkSync('25 xyz star uses rank', () => {
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

checkSync('26 defaults preserve no Limited/SetID/foil automation', () => {
    const { card } = prepareWorkingCard(baseDto());
    assert.equal(card.isLimitedEdition, false);
    assert.equal(card.setId, '');
    assert.equal(card.foil, 'normal');
});

checkSync('27 intent precedes data carrier construction', () => {
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

// T-C8 changed
checkSync('28 integration prepare DTO → Carder fields', () => {
    const empty = getEmptyCard();
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
    assert.equal(card.format, empty.format);
    assert.equal(card.region, empty.region);
    assert.equal(card.name, 'Dragón');
    assert.equal(card.background, '/api/v1/carder/assets/bg/content?hash=1');
    assert.equal(card.art, '/api/v1/carder/assets/of/content?hash=2');
    assert.equal(card.backgroundType, 'full');
    assert.equal(card.opacity.boundless, true);
    assert.equal(card.opacity.frameBorder, true);
    assert.equal(card.overlay, '');
    assert.equal(card.hasBackground, true);
    assert.equal(session.composition, 'OVERFRAME');
    assert.notEqual(card.id, session.cardId);
});

checkSync('29 unknown spell subtype unsupported', () => {
    assert.throws(
        () => mapSpellTrapSubFamily('SPELL', 'WEIRD'),
        (error: unknown) => error instanceof WorkspaceBridgeError,
    );
});

checkSync('30 numeric link markers identity', () => {
    assert.deepEqual(mapLinkMarkers(['1', '9']), ['1', '9']);
});

// ---------- A-01..A-20 added Design tests ----------

checkSync('A-01 four compositions: no empty.art placeholder, overlay neutral', () => {
    const empty = getEmptyCard();
    const cases: PrepareWorkingCardDto['artwork'][] = [
        baseDto().artwork,
        standardBgOfArtwork(),
        overframeBgOfArtwork(),
        overframeBsOfArtwork(),
    ];
    for (const artwork of cases) {
        const { card } = prepareWorkingCard(baseDto({
            identity: {
                ...baseDto().identity,
                composition: artwork.composition,
            },
            artwork,
        }));
        assert.notEqual(card.art, empty.art);
        assert.notEqual(card.art, '');
        assert.equal(card.overlay, '');
    }
});

checkSync('A-02 Overframe BG+OF direct working-card flags', () => {
    const { card } = prepareWorkingCard(baseDto({
        identity: { ...baseDto().identity, composition: 'OVERFRAME' },
        artwork: overframeBgOfArtwork(),
    }));
    assert.equal(card.background, bgUrl);
    assert.equal(card.art, ofUrl);
    assert.equal(card.hasBackground, true);
    assert.equal(card.backgroundType, 'full');
    assert.equal(card.opacity.boundless, true);
    assert.equal(card.opacity.frameBorder, true);
});

checkSync('A-03 invalid compositions → CARDER_MAPPING_UNSUPPORTED', () => {
    const expectUnsupported = (artwork: PrepareWorkingCardDto['artwork']) => {
        assert.throws(
            () => resolveArtworkComposition(baseDto({
                identity: { ...baseDto().identity, composition: artwork.composition },
                artwork,
            })),
            (error: unknown) => error instanceof WorkspaceBridgeError && error.code === 'CARDER_MAPPING_UNSUPPORTED',
        );
    };
    expectUnsupported({
        composition: 'STANDARD',
        sources: ['OF'],
        assets: [{ role: 'OF', asset_id: 'of', hash: 'h', content_url: ofUrl }],
    });
    expectUnsupported({
        composition: 'OVERFRAME',
        sources: ['BS'],
        assets: [{ role: 'BS', asset_id: 'bs', hash: 'h', content_url: bsUrl }],
    });
    expectUnsupported({
        composition: 'STANDARD',
        sources: ['BG', 'BS', 'OF'],
        assets: [
            { role: 'BG', asset_id: 'bg', hash: 'h', content_url: bgUrl },
            { role: 'BS', asset_id: 'bs', hash: 'h', content_url: bsUrl },
            { role: 'OF', asset_id: 'of', hash: 'h', content_url: ofUrl },
        ],
    });
    // Declared source with missing asset
    expectUnsupported({
        composition: 'STANDARD',
        sources: ['BS'],
        assets: [],
    });
});

const fullIntentSearch = 'ws_card_id=a&ws_variant_id=b&ws_composition=STANDARD&ws_lang=EN&ws_revision=1';
const legacyCard = { ...getEmptyCard(), id: 'legacy-1', name: 'Legacy' } as InternalCard;

const missingFieldCases: Array<{ name: string; search: string; field: string }> = [
    { name: 'A-04 missing ws_card_id', search: 'ws_variant_id=b&ws_composition=STANDARD&ws_lang=EN&ws_revision=1', field: 'card ID' },
    { name: 'A-05 missing ws_variant_id', search: 'ws_card_id=a&ws_composition=STANDARD&ws_lang=EN&ws_revision=1', field: 'Variant ID' },
    { name: 'A-06 missing ws_composition', search: 'ws_card_id=a&ws_variant_id=b&ws_lang=EN&ws_revision=1', field: 'composition' },
    { name: 'A-07 missing ws_lang', search: 'ws_card_id=a&ws_variant_id=b&ws_composition=STANDARD&ws_revision=1', field: 'language' },
    { name: 'A-08 missing ws_revision', search: 'ws_card_id=a&ws_variant_id=b&ws_composition=STANDARD&ws_lang=EN', field: 'revision' },
];

const runMissingFieldTests = async () => {
    for (const item of missingFieldCases) {
        await checkAsync(item.name, async () => {
            assert.equal(hasWorkspaceIntent(item.search), true);
            assert.throws(
                () => parseWorkspaceIntent(item.search),
                (error: unknown) =>
                    error instanceof WorkspaceBridgeError
                    && error.code === 'BRIDGE_INTENT_INVALID'
                    && error.message.includes(item.field),
            );
            let retrieveCalls = 0;
            let fetchCalls = 0;
            const outcome = await runCarderStartup({
                search: item.search,
                retrieveSavedCard: async () => {
                    retrieveCalls += 1;
                    return legacyCard;
                },
                fetchPrepare: async () => {
                    fetchCalls += 1;
                    return baseDto();
                },
                prepare: prepareWorkingCard,
            });
            assert.equal(outcome.kind, 'WORKSPACE_FAILED');
            assert.equal(retrieveCalls, 0);
            assert.equal(fetchCalls, 0);
        });
    }
};

const runAsyncAdded = async () => {
    await runMissingFieldTests();

    await checkAsync('A-09 invalid/malformed intent → WORKSPACE_FAILED without retrieve', async () => {
        const cases = [
            'ws_card_id=a&ws_variant_id=b&ws_composition=X&ws_lang=EN&ws_revision=1',
            'ws_card_id=a&ws_variant_id=b&ws_composition=STANDARD&ws_lang=FR&ws_revision=1',
            'ws_card_id=&ws_variant_id=b&ws_composition=STANDARD&ws_lang=EN&ws_revision=1',
            'ws_card_id=a&ws_card_id=a2&ws_variant_id=b&ws_composition=STANDARD&ws_lang=EN&ws_revision=1',
            'ws_foo=1',
        ];
        for (const search of cases) {
            assert.equal(hasWorkspaceIntent(search), true);
            let retrieveCalls = 0;
            const outcome = await runCarderStartup({
                search,
                retrieveSavedCard: async () => {
                    retrieveCalls += 1;
                    return legacyCard;
                },
                fetchPrepare: async () => baseDto(),
                prepare: prepareWorkingCard,
            });
            assert.equal(outcome.kind, 'WORKSPACE_FAILED');
            assert.equal(retrieveCalls, 0);
        }
    });

    await checkAsync('A-10 zero ws_* → LEGACY retrieve exactly once', async () => {
        for (const search of ['', 'data=abc']) {
            let retrieveCalls = 0;
            let fetchCalls = 0;
            const outcome = await runCarderStartup({
                search,
                retrieveSavedCard: async () => {
                    retrieveCalls += 1;
                    return legacyCard;
                },
                fetchPrepare: async () => {
                    fetchCalls += 1;
                    return baseDto();
                },
                prepare: prepareWorkingCard,
            });
            assert.equal(outcome.kind, 'LEGACY');
            assert.equal(retrieveCalls, 1);
            assert.equal(fetchCalls, 0);
        }
    });

    await checkAsync('A-11 valid intent fetchPrepare once; reject → no retrieve', async () => {
        let retrieveCalls = 0;
        let fetchCalls = 0;
        const ok = await runCarderStartup({
            search: fullIntentSearch,
            retrieveSavedCard: async () => {
                retrieveCalls += 1;
                return legacyCard;
            },
            fetchPrepare: async () => {
                fetchCalls += 1;
                return baseDto();
            },
            prepare: prepareWorkingCard,
        });
        assert.equal(ok.kind, 'WORKSPACE');
        assert.equal(fetchCalls, 1);
        assert.equal(retrieveCalls, 0);

        retrieveCalls = 0;
        fetchCalls = 0;
        const failed = await runCarderStartup({
            search: fullIntentSearch,
            retrieveSavedCard: async () => {
                retrieveCalls += 1;
                return legacyCard;
            },
            fetchPrepare: async () => {
                fetchCalls += 1;
                throw new WorkspaceBridgeError('CARDER_PREPARATION_NOT_READY', 'boom');
            },
            prepare: prepareWorkingCard,
        });
        assert.equal(failed.kind, 'WORKSPACE_FAILED');
        assert.equal(fetchCalls, 1);
        assert.equal(retrieveCalls, 0);
    });
};

checkSync('A-12 buildCarderLaunchUrl /ygocarder/ → /ygocarder/?ws_', () => {
    const url = buildCarderLaunchUrl('/ygocarder/', {
        cardId: 'c',
        variantId: 'v',
        composition: 'STANDARD',
        contentLanguage: 'EN',
        revision: '1',
    });
    assert.ok(url.startsWith('/ygocarder/?ws_'), url);
    assert.equal(url.includes('data='), false);
});

checkSync('A-13 buildCarderLaunchUrl base normalization', () => {
    const intent = {
        cardId: 'c',
        variantId: 'v',
        composition: 'STANDARD' as const,
        contentLanguage: 'EN' as const,
        revision: '1',
    };
    assert.ok(buildCarderLaunchUrl('/', intent).startsWith('/?ws_'));
    assert.ok(buildCarderLaunchUrl('/ygocarder', intent).startsWith('/ygocarder/?ws_'));
});

checkSync('A-14 MAIN_DECK NORMAL → normal frame', () => {
    assert.equal(mapFrame({ ...baseDto().structure, abilities: ['NORMAL'] }), 'normal');
    assert.equal(mapFrame({ ...baseDto().structure, abilities: ['NORMAL', 'TUNER'] }), 'normal');
    assert.equal(mapFrame({
        ...baseDto().structure,
        abilities: ['NORMAL', 'PENDULUM'],
        pendulum_scale: 4,
    }), 'normal');
    const { card } = prepareWorkingCard(baseDto({
        structure: { ...baseDto().structure, abilities: ['NORMAL'] },
    }));
    assert.equal(card.frame, 'normal');
});

checkSync('A-15 NORMAL+EFFECT → unsupported MAIN_DECK and FUSION', () => {
    assert.throws(
        () => mapFrame({ ...baseDto().structure, abilities: ['NORMAL', 'EFFECT'] }),
        (error: unknown) => error instanceof WorkspaceBridgeError && error.code === 'CARDER_MAPPING_UNSUPPORTED',
    );
    assert.throws(
        () => mapFrame({
            ...baseDto().structure,
            summon_kind: 'FUSION',
            abilities: ['NORMAL', 'EFFECT'],
        }),
        (error: unknown) => error instanceof WorkspaceBridgeError && error.code === 'CARDER_MAPPING_UNSUPPORTED',
    );
});

checkSync('A-16 MAIN_DECK without NORMAL/EFFECT → unsupported', () => {
    assert.throws(
        () => mapFrame({ ...baseDto().structure, abilities: [] }),
        (error: unknown) => error instanceof WorkspaceBridgeError && error.code === 'CARDER_MAPPING_UNSUPPORTED',
    );
    assert.throws(
        () => mapFrame({ ...baseDto().structure, abilities: ['TUNER'] }),
        (error: unknown) => error instanceof WorkspaceBridgeError && error.code === 'CARDER_MAPPING_UNSUPPORTED',
    );
});

checkSync('A-17 MAIN_DECK NORMAL+incompatible → unsupported', () => {
    for (const ability of ['FLIP', 'GEMINI', 'SPIRIT', 'TOON', 'UNION', 'SPECIAL_SUMMON']) {
        assert.throws(
            () => mapFrame({ ...baseDto().structure, abilities: ['NORMAL', ability] }),
            (error: unknown) => error instanceof WorkspaceBridgeError && error.code === 'CARDER_MAPPING_UNSUPPORTED',
        );
    }
});

checkSync('A-18 LINK link_rating null → unsupported (no linkMap.length fallback)', () => {
    assert.throws(
        () => prepareWorkingCard(baseDto({
            structure: {
                ...baseDto().structure,
                summon_kind: 'LINK',
                level: null,
                def: null,
                link_markers: ['TOP', 'LEFT'],
                link_rating: null,
                abilities: [],
            },
        })),
        (error: unknown) => error instanceof WorkspaceBridgeError && error.code === 'CARDER_MAPPING_UNSUPPORTED',
    );
    assert.throws(
        () => mapLinkRating({
            ...baseDto().structure,
            summon_kind: 'LINK',
            link_markers: ['TOP', 'LEFT'],
            link_rating: null,
            abilities: [],
        }, ['2', '4']),
        (error: unknown) => error instanceof WorkspaceBridgeError && error.code === 'CARDER_MAPPING_UNSUPPORTED',
    );
});

checkSync('A-19 LINK rating mismatch / non-integer / zero → unsupported', () => {
    assert.throws(
        () => prepareWorkingCard(baseDto({
            structure: {
                ...baseDto().structure,
                summon_kind: 'LINK',
                level: null,
                def: null,
                link_markers: ['TOP', 'LEFT'],
                link_rating: 3,
                abilities: [],
            },
        })),
        (error: unknown) => error instanceof WorkspaceBridgeError && error.code === 'CARDER_MAPPING_UNSUPPORTED',
    );
    assert.throws(
        () => mapLinkRating({
            ...baseDto().structure,
            summon_kind: 'LINK',
            link_rating: 0,
            link_markers: [],
            abilities: [],
        }, []),
        (error: unknown) => error instanceof WorkspaceBridgeError && error.code === 'CARDER_MAPPING_UNSUPPORTED',
    );
    assert.throws(
        () => mapLinkRating({
            ...baseDto().structure,
            summon_kind: 'LINK',
            link_rating: 1.5 as unknown as number,
            link_markers: ['TOP'],
            abilities: [],
        }, ['2']),
        (error: unknown) => error instanceof WorkspaceBridgeError && error.code === 'CARDER_MAPPING_UNSUPPORTED',
    );
});

checkSync('A-20 typeAbility only race/summon/ability registry labels', () => {
    const allowedMonster = new Set(['Dragon', 'Effect', 'Tuner', 'Pendulum', 'Fusion', 'Synchro', 'Xyz', 'Link', 'Ritual']);
    const monster = mapTypeAbility({ ...baseDto().structure, abilities: ['EFFECT', 'TUNER'] });
    for (const part of monster) assert.ok(allowedMonster.has(part), part);
    assert.deepEqual(mapTypeAbility({
        ...baseDto().structure,
        family: 'SPELL',
        summon_kind: null,
        race_code: null,
        abilities: [],
        subtype_code: 'NORMAL',
    }), ['Spell Card']);
    assert.deepEqual(mapTypeAbility({
        ...baseDto().structure,
        family: 'TRAP',
        summon_kind: null,
        race_code: null,
        abilities: [],
        subtype_code: 'NORMAL',
    }), ['Trap Card']);
    assert.deepEqual(mapTypeAbility({
        ...baseDto().structure,
        family: 'TOKEN',
        summon_kind: null,
        abilities: [],
        race_code: 'DRAGON',
    }), ['Dragon', 'Token']);
    // DTO does not transport classification — assert no classifier/tag/archetype codes appear
    for (const part of [...monster, 'Spell Card', 'Trap Card', 'Token']) {
        assert.equal(part.includes('ARCHETYPE'), false);
        assert.equal(part.includes('CLASSIFIER'), false);
        assert.equal(part.includes('TAG_'), false);
    }
});

runAsyncAdded()
    .then(() => {
        console.log(`workspace-bridge adapter/client checks passed: ${passed}`);
    })
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
