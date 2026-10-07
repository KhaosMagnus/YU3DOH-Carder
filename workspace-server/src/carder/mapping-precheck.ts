import type { CanonicalCardFamily, CanonicalStructureSnapshot } from '../canonical/types';
import { CarderPrepareError } from './errors';

const SUPPORTED_SPELL_SUBTYPES = new Set([
    'NORMAL', 'CONTINUOUS', 'EQUIP', 'FIELD', 'QUICK_PLAY', 'RITUAL',
]);
const SUPPORTED_TRAP_SUBTYPES = new Set([
    'NORMAL', 'CONTINUOUS', 'COUNTER',
]);
const SUPPORTED_LINK_MARKERS = new Set([
    'TOP_LEFT', 'TOP', 'TOP_RIGHT', 'LEFT', 'RIGHT',
    'BOTTOM_LEFT', 'BOTTOM', 'BOTTOM_RIGHT',
    '1', '2', '3', '4', '6', '7', '8', '9',
]);
const SUPPORTED_ATTRIBUTES = new Set([
    'DARK', 'EARTH', 'FIRE', 'LIGHT', 'WATER', 'WIND', 'DIVINE', 'SPELL', 'TRAP',
]);
const SUPPORTED_ABILITIES = new Set([
    'NORMAL', 'EFFECT', 'TUNER', 'FLIP', 'GEMINI', 'SPIRIT', 'TOON', 'UNION',
    'PENDULUM', 'SPECIAL_SUMMON',
]);
const SUPPORTED_SUMMON_KINDS = new Set([
    'MAIN_DECK', 'RITUAL', 'FUSION', 'SYNCHRO', 'XYZ', 'LINK',
]);
/** Abilities incompatible with NORMAL on MAIN_DECK (Design S-4). */
const NORMAL_INCOMPATIBLE = new Set([
    'FLIP', 'GEMINI', 'SPIRIT', 'TOON', 'UNION', 'SPECIAL_SUMMON',
]);

const assertNormalEffectRules = (
    summonKind: string | null,
    abilities: string[],
): void => {
    const hasNormal = abilities.includes('NORMAL');
    const hasEffect = abilities.includes('EFFECT');

    if (hasNormal && hasEffect) {
        throw new CarderPrepareError(
            'CARDER_MAPPING_UNSUPPORTED',
            'NORMAL and EFFECT abilities together are not mappable to Carder.',
        );
    }

    if (summonKind === 'MAIN_DECK') {
        if (!hasNormal && !hasEffect) {
            throw new CarderPrepareError(
                'CARDER_MAPPING_UNSUPPORTED',
                'MAIN_DECK monster requires exactly one of NORMAL or EFFECT.',
            );
        }
        if (hasNormal && abilities.some(ability => NORMAL_INCOMPATIBLE.has(ability))) {
            throw new CarderPrepareError(
                'CARDER_MAPPING_UNSUPPORTED',
                'NORMAL with effect-style abilities is not mappable to Carder.',
            );
        }
    }
};

const assertLinkRatingConsistent = (
    structure: Extract<CanonicalStructureSnapshot, { kind: 'MONSTER' }>,
): void => {
    if (structure.summonKind !== 'LINK') return;
    const rating = structure.linkRating;
    if (
        rating == null
        || !Number.isInteger(rating)
        || rating < 1
        || rating !== structure.linkMarkers.length
    ) {
        throw new CarderPrepareError(
            'CARDER_MAPPING_UNSUPPORTED',
            'LINK requires a consistent Canonical link_rating matching mapped marker count.',
        );
    }
};

/**
 * Structural precheck shared with Carder adapter policy (Design §§28–35 + QA-009-07).
 * Throws CARDER_MAPPING_UNSUPPORTED when the snapshot cannot map into Carder.
 */
export const assertStructureMappable = (
    family: CanonicalCardFamily,
    structure: CanonicalStructureSnapshot,
): void => {
    if (!structure) {
        throw new CarderPrepareError(
            'CARDER_MAPPING_UNSUPPORTED',
            'Confirmed STRUCTURE snapshot is missing.',
        );
    }

    if (structure.kind === 'SPELL') {
        if (structure.subtypeCode != null && !SUPPORTED_SPELL_SUBTYPES.has(structure.subtypeCode)) {
            throw new CarderPrepareError(
                'CARDER_MAPPING_UNSUPPORTED',
                `Spell subtype ${structure.subtypeCode} is not mappable to Carder.`,
            );
        }
        return;
    }

    if (structure.kind === 'TRAP') {
        if (structure.subtypeCode != null && !SUPPORTED_TRAP_SUBTYPES.has(structure.subtypeCode)) {
            throw new CarderPrepareError(
                'CARDER_MAPPING_UNSUPPORTED',
                `Trap subtype ${structure.subtypeCode} is not mappable to Carder.`,
            );
        }
        return;
    }

    if (structure.kind === 'TOKEN') {
        if (structure.attributeCode && !SUPPORTED_ATTRIBUTES.has(structure.attributeCode)) {
            throw new CarderPrepareError(
                'CARDER_MAPPING_UNSUPPORTED',
                `Token attribute ${structure.attributeCode} is not mappable to Carder.`,
            );
        }
        return;
    }

    if (structure.kind === 'MONSTER') {
        if (structure.summonKind == null || !SUPPORTED_SUMMON_KINDS.has(structure.summonKind)) {
            throw new CarderPrepareError(
                'CARDER_MAPPING_UNSUPPORTED',
                'Monster summon_kind is null or unsupported for Carder mapping.',
            );
        }
        if (structure.attributeCode && !SUPPORTED_ATTRIBUTES.has(structure.attributeCode)) {
            throw new CarderPrepareError(
                'CARDER_MAPPING_UNSUPPORTED',
                `Monster attribute ${structure.attributeCode} is not mappable to Carder.`,
            );
        }
        for (const ability of structure.abilities) {
            if (!SUPPORTED_ABILITIES.has(ability)) {
                throw new CarderPrepareError(
                    'CARDER_MAPPING_UNSUPPORTED',
                    `Ability ${ability} is not mappable to Carder.`,
                );
            }
        }
        for (const marker of structure.linkMarkers) {
            if (!SUPPORTED_LINK_MARKERS.has(marker) || marker === '5' || marker === 'CENTER') {
                throw new CarderPrepareError(
                    'CARDER_MAPPING_UNSUPPORTED',
                    `Link marker ${marker} is not mappable to Carder.`,
                );
            }
        }
        assertNormalEffectRules(structure.summonKind, structure.abilities);
        assertLinkRatingConsistent(structure);
        if (family !== 'MONSTER') {
            throw new CarderPrepareError(
                'CARDER_MAPPING_UNSUPPORTED',
                'Structure kind MONSTER does not match card family.',
            );
        }
        return;
    }

    throw new CarderPrepareError(
        'CARDER_MAPPING_UNSUPPORTED',
        'Card structure kind is not mappable to Carder.',
    );
};
