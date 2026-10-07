import type { BackgroundType } from 'src/model';
import { WorkspaceBridgeError } from './errors';

export type PrepareDtoStructure = {
    family: 'MONSTER' | 'SPELL' | 'TRAP' | 'TOKEN';
    summon_kind: string | null;
    attribute_code: string | null;
    race_code: string | null;
    level: number | null;
    rank: number | null;
    atk: number | '?' | null;
    def: number | '?' | null;
    pendulum_scale: number | null;
    abilities: string[];
    link_markers: string[];
    link_rating: number | null;
    subtype_code: string | null;
    password: string | null;
};

export type PrepareDtoArtworkAsset = {
    role: 'BS' | 'BG' | 'OF';
    asset_id: string;
    hash: string;
    content_url: string;
};

export type PrepareWorkingCardDto = {
    identity: {
        card_id: string;
        revision: string;
        variant_id: string;
        composition: 'STANDARD' | 'OVERFRAME';
        content_language: 'EN' | 'ES' | 'JP';
    };
    localized: {
        name: string | null;
        card_text: string | null;
        pendulum_text: string | null;
    };
    structure: PrepareDtoStructure;
    artwork: {
        composition: 'STANDARD' | 'OVERFRAME';
        sources: Array<'BS' | 'BG' | 'OF'>;
        assets: PrepareDtoArtworkAsset[];
    };
};

const LINK_MARKER_MAP: Record<string, string> = {
    TOP_LEFT: '1',
    TOP: '2',
    TOP_RIGHT: '3',
    LEFT: '4',
    RIGHT: '6',
    BOTTOM_LEFT: '7',
    BOTTOM: '8',
    BOTTOM_RIGHT: '9',
    '1': '1',
    '2': '2',
    '3': '3',
    '4': '4',
    '6': '6',
    '7': '7',
    '8': '8',
    '9': '9',
};

const SPELL_TRAP_SUBTYPE_MAP: Record<string, string> = {
    NORMAL: 'NORMAL',
    CONTINUOUS: 'CONTINUOUS',
    EQUIP: 'EQUIP',
    FIELD: 'FIELD',
    QUICK_PLAY: 'QUICK-PLAY',
    RITUAL: 'RITUAL',
    COUNTER: 'COUNTER',
};

const ABILITY_LABELS: Record<string, string> = {
    NORMAL: 'Normal',
    EFFECT: 'Effect',
    TUNER: 'Tuner',
    FLIP: 'Flip',
    GEMINI: 'Gemini',
    SPIRIT: 'Spirit',
    TOON: 'Toon',
    UNION: 'Union',
    PENDULUM: 'Pendulum',
    SPECIAL_SUMMON: 'Special Summon',
};

const SUMMON_TYPE_LABELS: Record<string, string> = {
    RITUAL: 'Ritual',
    FUSION: 'Fusion',
    SYNCHRO: 'Synchro',
    XYZ: 'Xyz',
    LINK: 'Link',
};

const SUPPORTED_ATTRIBUTES = new Set([
    'DARK', 'EARTH', 'FIRE', 'LIGHT', 'WATER', 'WIND', 'DIVINE', 'SPELL', 'TRAP',
]);

/** Abilities incompatible with NORMAL on MAIN_DECK (Design S-4). */
const NORMAL_INCOMPATIBLE = new Set([
    'FLIP', 'GEMINI', 'SPIRIT', 'TOON', 'UNION', 'SPECIAL_SUMMON',
]);

const unsupported = (message: string): never => {
    throw new WorkspaceBridgeError('CARDER_MAPPING_UNSUPPORTED', message);
};

export const mapLinkMarkers = (markers: string[]): string[] => {
    const mapped: string[] = [];
    for (const marker of markers) {
        if (marker === 'CENTER' || marker === '5') {
            return unsupported(`Link marker ${marker} is not supported by Carder.`);
        }
        const entry = LINK_MARKER_MAP[marker];
        if (!entry) {
            return unsupported(`Link marker ${marker} is not mappable to Carder.`);
        }
        mapped.push(entry);
    }
    return mapped;
};

export const mapSpellTrapSubFamily = (
    family: 'SPELL' | 'TRAP',
    subtypeCode: string | null,
): string => {
    if (subtypeCode == null) {
        return 'NO ICON';
    }
    const mapped = SPELL_TRAP_SUBTYPE_MAP[subtypeCode];
    if (!mapped) {
        return unsupported(`${family} subtype ${subtypeCode} is not mappable to Carder.`);
    }
    if (family === 'SPELL' && subtypeCode === 'COUNTER') {
        return unsupported('COUNTER subtype is not valid for SPELL.');
    }
    if (family === 'TRAP' && (subtypeCode === 'QUICK_PLAY' || subtypeCode === 'EQUIP' || subtypeCode === 'FIELD' || subtypeCode === 'RITUAL')) {
        return unsupported(`${subtypeCode} subtype is not valid for TRAP.`);
    }
    return mapped;
};

export const mapFrame = (structure: PrepareDtoStructure): string => {
    if (structure.family === 'SPELL') return 'spell';
    if (structure.family === 'TRAP') return 'trap';
    if (structure.family === 'TOKEN') return 'token';
    if (structure.family === 'MONSTER') {
        const abilities = structure.abilities;
        const hasNormal = abilities.includes('NORMAL');
        const hasEffect = abilities.includes('EFFECT');

        if (hasNormal && hasEffect) {
            return unsupported('NORMAL and EFFECT abilities together are not mappable to Carder.');
        }

        switch (structure.summon_kind) {
            case 'MAIN_DECK': {
                if (hasNormal && !hasEffect) {
                    if (abilities.some(ability => NORMAL_INCOMPATIBLE.has(ability))) {
                        return unsupported('NORMAL with effect-style abilities is not mappable to Carder.');
                    }
                    return 'normal';
                }
                if (hasEffect && !hasNormal) {
                    return 'effect';
                }
                return unsupported('MAIN_DECK monster requires exactly one of NORMAL or EFFECT.');
            }
            case 'RITUAL': return 'ritual';
            case 'FUSION': return 'fusion';
            case 'SYNCHRO': return 'synchro';
            case 'XYZ': return 'xyz';
            case 'LINK': return 'link';
            case null:
                return unsupported('Monster summon_kind is null.');
            default:
                return unsupported(`Summon kind ${structure.summon_kind} is unsupported.`);
        }
    }
    return unsupported(`Family ${(structure as { family: string }).family} is unsupported.`);
};

export const mapAttribute = (structure: PrepareDtoStructure): string => {
    if (structure.family === 'SPELL') return 'SPELL';
    if (structure.family === 'TRAP') return 'TRAP';
    const code = structure.attribute_code;
    if (!code) return 'NONE';
    if (!SUPPORTED_ATTRIBUTES.has(code)) {
        return unsupported(`Attribute ${code} is not mappable to Carder.`);
    }
    return code;
};

export const titleCaseCode = (code: string): string =>
    code
        .toLowerCase()
        .split('_')
        .filter(Boolean)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');

export const mapTypeAbility = (structure: PrepareDtoStructure): string[] => {
    if (structure.family === 'SPELL') {
        return ['Spell Card'];
    }
    if (structure.family === 'TRAP') {
        return ['Trap Card'];
    }
    if (structure.family === 'TOKEN') {
        if (!structure.race_code) {
            return unsupported('Race code is required for token Carder mapping.');
        }
        return [titleCaseCode(structure.race_code), 'Token'];
    }
    const parts: string[] = [];
    if (!structure.race_code) {
        return unsupported('Race code is required for monster/token Carder mapping.');
    }
    const raceCode = structure.race_code;
    parts.push(titleCaseCode(raceCode));
    if (structure.family === 'MONSTER' && structure.summon_kind && structure.summon_kind !== 'MAIN_DECK') {
        const summonLabel = SUMMON_TYPE_LABELS[structure.summon_kind];
        if (!summonLabel) return unsupported(`Summon kind ${structure.summon_kind} has no typeAbility label.`);
        parts.push(summonLabel);
    }
    for (const ability of structure.abilities) {
        if (ability === 'NORMAL') continue;
        const label = ABILITY_LABELS[ability];
        if (!label) return unsupported(`Ability ${ability} is not mappable to Carder.`);
        if (!parts.includes(label)) parts.push(label);
    }
    return parts;
};

export const mapPrintedStat = (value: number | '?' | null): string => {
    if (value === null) return '';
    if (value === '?') return '?';
    return String(value);
};

/**
 * Require Canonical link_rating consistent with mapped markers. No linkMap.length fallback.
 */
export const mapLinkRating = (
    structure: PrepareDtoStructure,
    linkMap: string[],
): string => {
    const rating = structure.link_rating;
    if (
        rating == null
        || !Number.isInteger(rating)
        || rating < 1
        || rating !== linkMap.length
    ) {
        return unsupported(
            'LINK requires a consistent Canonical link_rating matching mapped marker count.',
        );
    }
    return String(rating);
};

export type ArtworkComposition = {
    art: string;
    artSource: 'online';
    artFit: true;
    hasBackground: boolean;
    background: string;
    backgroundSource: 'online';
    backgroundFit: boolean;
    backgroundType: BackgroundType;
    opacity: {
        boundless: boolean;
        frameBorder: boolean;
    };
};

export const resolveArtworkComposition = (dto: PrepareWorkingCardDto): ArtworkComposition => {
    const byRole = new Map(dto.artwork.assets.map(asset => [asset.role, asset] as const));
    const sources = dto.artwork.sources;
    const sourceKey = sources.join('+');

    // Every declared source must have a matching asset.
    for (const role of sources) {
        if (!byRole.get(role)) {
            return unsupported(`Composition sources declare ${role} but asset is missing.`);
        }
    }

    if (dto.artwork.composition === 'STANDARD') {
        if (sourceKey === 'BS') {
            const bs = byRole.get('BS')!;
            return {
                art: bs.content_url,
                artSource: 'online',
                artFit: true,
                hasBackground: false,
                background: '',
                backgroundSource: 'online',
                backgroundFit: false,
                backgroundType: 'fit',
                opacity: { boundless: false, frameBorder: true },
            };
        }
        if (sourceKey === 'BG+OF') {
            const bg = byRole.get('BG')!;
            const of = byRole.get('OF')!;
            return {
                art: of.content_url,
                artSource: 'online',
                artFit: true,
                hasBackground: true,
                background: bg.content_url,
                backgroundSource: 'online',
                backgroundFit: true,
                backgroundType: 'strict',
                opacity: { boundless: false, frameBorder: true },
            };
        }
        return unsupported(`Unsupported STANDARD sources: ${sourceKey}`);
    }

    // OVERFRAME
    if (sourceKey === 'BG+OF') {
        const bg = byRole.get('BG')!;
        const of = byRole.get('OF')!;
        return {
            art: of.content_url,
            artSource: 'online',
            artFit: true,
            hasBackground: true,
            background: bg.content_url,
            backgroundSource: 'online',
            backgroundFit: true,
            backgroundType: 'full',
            opacity: { boundless: true, frameBorder: true },
        };
    }
    if (sourceKey === 'BS+OF') {
        const bs = byRole.get('BS')!;
        const of = byRole.get('OF')!;
        return {
            art: of.content_url,
            artSource: 'online',
            artFit: true,
            hasBackground: true,
            background: bs.content_url,
            backgroundSource: 'online',
            backgroundFit: true,
            backgroundType: 'full',
            opacity: { boundless: true, frameBorder: true },
        };
    }
    return unsupported(`Unsupported OVERFRAME sources: ${sourceKey}`);
};
