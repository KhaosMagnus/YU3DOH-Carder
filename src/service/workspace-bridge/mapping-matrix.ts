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
        switch (structure.summon_kind) {
            case 'MAIN_DECK': return 'effect';
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
    if (structure.family === 'SPELL' || structure.family === 'TRAP') {
        return [];
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

export const mapLanguageFormat = (language: 'EN' | 'ES' | 'JP'): { format: 'tcg' | 'ocg'; region: string } => {
    if (language === 'EN') return { format: 'tcg', region: 'en' };
    if (language === 'ES') return { format: 'tcg', region: 'sp' };
    return { format: 'ocg', region: 'jp' };
};

export type ArtworkLayers = {
    art: string;
    background: string;
    overlay: string;
    hasBackground: boolean;
};

export const resolveArtworkLayers = (dto: PrepareWorkingCardDto): ArtworkLayers => {
    const byRole = new Map(dto.artwork.assets.map(asset => [asset.role, asset] as const));
    const sources = dto.artwork.sources;
    const sourceKey = sources.join('+');

    if (dto.artwork.composition === 'STANDARD') {
        if (sourceKey === 'BS') {
            const bs = byRole.get('BS');
            if (!bs) return unsupported('STANDARD BS composition missing BS asset.');
            return {
                art: bs.content_url,
                background: '',
                overlay: '',
                hasBackground: false,
            };
        }
        if (sourceKey === 'BG+OF') {
            const bg = byRole.get('BG');
            const of = byRole.get('OF');
            if (!bg || !of) return unsupported('STANDARD BG+OF composition missing assets.');
            return {
                art: '',
                background: bg.content_url,
                overlay: of.content_url,
                hasBackground: true,
            };
        }
        return unsupported(`Unsupported STANDARD sources: ${sourceKey}`);
    }

    // OVERFRAME
    if (sourceKey === 'BG+OF') {
        const bg = byRole.get('BG');
        const of = byRole.get('OF');
        if (!bg || !of) return unsupported('OVERFRAME BG+OF composition missing assets.');
        return {
            art: '',
            background: bg.content_url,
            overlay: of.content_url,
            hasBackground: true,
        };
    }
    if (sourceKey === 'BS+OF') {
        const bs = byRole.get('BS');
        const of = byRole.get('OF');
        if (!bs || !of) return unsupported('OVERFRAME BS+OF composition missing assets.');
        return {
            art: bs.content_url,
            background: '',
            overlay: of.content_url,
            hasBackground: false,
        };
    }
    return unsupported(`Unsupported OVERFRAME sources: ${sourceKey}`);
};
