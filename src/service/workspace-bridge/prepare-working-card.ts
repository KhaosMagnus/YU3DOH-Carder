import { getEmptyCard, type InternalCard } from 'src/model';
import { v4 as uuid } from 'uuid';
import { WorkspaceBridgeError } from './errors';
import {
    mapAttribute,
    mapFrame,
    mapLinkMarkers,
    mapLinkRating,
    mapPrintedStat,
    mapSpellTrapSubFamily,
    mapTypeAbility,
    resolveArtworkComposition,
    type PrepareWorkingCardDto,
} from './mapping-matrix';
import {
    createWorkspaceBridgeSession,
    setWorkspaceBridgeSession,
    type WorkspaceBridgeSession,
} from './session';

export type PrepareWorkingCardResult = {
    card: InternalCard;
    session: WorkspaceBridgeSession;
};

export const prepareWorkingCard = (dto: PrepareWorkingCardDto): PrepareWorkingCardResult => {
    if (!dto?.identity?.card_id || !dto.structure || !dto.artwork) {
        throw new WorkspaceBridgeError(
            'CARDER_MAPPING_UNSUPPORTED',
            'Prepare DTO is incomplete for Carder adaptation.',
        );
    }

    const empty = getEmptyCard();
    const frame = mapFrame(dto.structure);
    const attribute = mapAttribute(dto.structure);
    // QA-009-02: format/region stay getEmptyCard() defaults; language only selects text.
    const artwork = resolveArtworkComposition(dto);
    const isLink = dto.structure.family === 'MONSTER' && dto.structure.summon_kind === 'LINK';
    const isPendulum = dto.structure.abilities.includes('PENDULUM');
    const linkMap = isLink ? mapLinkMarkers(dto.structure.link_markers) : [];
    const linkRating = isLink ? mapLinkRating(dto.structure, linkMap) : '';

    let star = empty.star;
    if (dto.structure.family === 'MONSTER' || dto.structure.family === 'TOKEN') {
        if (dto.structure.summon_kind === 'XYZ') {
            star = dto.structure.rank ?? 0;
        } else if (dto.structure.summon_kind === 'LINK') {
            star = 0;
        } else {
            star = dto.structure.level ?? 0;
        }
    }

    let subFamily = empty.subFamily;
    if (dto.structure.family === 'SPELL' || dto.structure.family === 'TRAP') {
        subFamily = mapSpellTrapSubFamily(dto.structure.family, dto.structure.subtype_code);
    }

    const typeAbility = mapTypeAbility(dto.structure);
    const atk = mapPrintedStat(dto.structure.atk);
    const def = isLink ? '' : mapPrintedStat(dto.structure.def);

    // TOKEN password stays empty when Canonical is NULL (Design S-5).
    const password = dto.structure.family === 'TOKEN'
        ? ''
        : (dto.structure.password ?? '');

    const internalId = uuid();
    const card: InternalCard = {
        ...empty,
        id: internalId,
        // format / region inherited from empty (tcg / en)
        frame,
        attribute,
        subFamily,
        star,
        name: dto.localized.name ?? '',
        effect: dto.localized.card_text ?? '',
        atk,
        def,
        password,
        typeAbility,
        isLink: isLink ? true : null,
        linkMap,
        linkRating,
        isPendulum,
        pendulumEffect: isPendulum ? (dto.localized.pendulum_text ?? '') : '',
        pendulumScaleRed: isPendulum && dto.structure.pendulum_scale != null
            ? String(dto.structure.pendulum_scale)
            : empty.pendulumScaleRed,
        pendulumScaleBlue: isPendulum && dto.structure.pendulum_scale != null
            ? String(dto.structure.pendulum_scale)
            : empty.pendulumScaleBlue,
        art: artwork.art,
        artSource: artwork.artSource,
        artFit: artwork.artFit,
        hasBackground: artwork.hasBackground,
        background: artwork.background,
        backgroundSource: artwork.backgroundSource,
        backgroundFit: artwork.backgroundFit,
        backgroundType: artwork.backgroundType,
        opacity: {
            ...empty.opacity,
            boundless: artwork.opacity.boundless,
            frameBorder: artwork.opacity.frameBorder,
        },
        // overlay / overlaySource / overlayFit / overlayType remain empty defaults.
        // Explicit NO automation: foil/Limited/SetID/serial remain getEmptyCard defaults.
    };

    if (card.art === empty.art || card.art === '') {
        throw new WorkspaceBridgeError(
            'CARDER_MAPPING_UNSUPPORTED',
            'Prepared composition must supply artwork; empty-card placeholder is forbidden.',
        );
    }

    const session = createWorkspaceBridgeSession({
        cardId: dto.identity.card_id,
        variantId: dto.identity.variant_id,
        composition: dto.identity.composition,
        contentLanguage: dto.identity.content_language,
        revision: dto.identity.revision,
    });
    setWorkspaceBridgeSession(session);

    if (card.id === session.cardId) {
        throw new WorkspaceBridgeError(
            'CARDER_MAPPING_UNSUPPORTED',
            'InternalCard.id must not equal Workspace card_id.',
        );
    }

    return { card, session };
};
