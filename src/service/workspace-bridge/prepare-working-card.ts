import { getEmptyCard, type InternalCard } from 'src/model';
import { v4 as uuid } from 'uuid';
import { WorkspaceBridgeError } from './errors';
import {
    mapAttribute,
    mapFrame,
    mapLanguageFormat,
    mapLinkMarkers,
    mapPrintedStat,
    mapSpellTrapSubFamily,
    mapTypeAbility,
    resolveArtworkLayers,
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
    const { format, region } = mapLanguageFormat(dto.identity.content_language);
    const artwork = resolveArtworkLayers(dto);
    const isLink = dto.structure.family === 'MONSTER' && dto.structure.summon_kind === 'LINK';
    const isPendulum = dto.structure.abilities.includes('PENDULUM');
    const linkMap = isLink ? mapLinkMarkers(dto.structure.link_markers) : [];
    const linkRating = isLink
        ? String(dto.structure.link_rating ?? linkMap.length)
        : '';

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

    const internalId = uuid();
    const card: InternalCard = {
        ...empty,
        id: internalId,
        format,
        region,
        frame,
        attribute,
        subFamily,
        star,
        name: dto.localized.name ?? '',
        effect: dto.localized.card_text ?? '',
        atk,
        def,
        password: dto.structure.password ?? '',
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
        art: artwork.art || empty.art,
        artSource: 'online',
        hasBackground: artwork.hasBackground,
        background: artwork.background,
        backgroundSource: 'online',
        overlay: artwork.overlay,
        overlaySource: 'online',
        // Explicit NO automation: foil/Limited/SetID/serial remain getEmptyCard defaults.
    };

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
