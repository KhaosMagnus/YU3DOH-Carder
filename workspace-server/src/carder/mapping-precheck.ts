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

/**
 * Structural precheck shared with Carder adapter policy (Design §§28–35).
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
