import type { Claim } from './types';

// Reviewed provider vocabulary owned by normalizer v2; never fetched or registered at runtime.
export const PROPERTY_RACES: Readonly<Record<number, string>> = Object.freeze({
    1: 'CREATOR_GOD',
    3: 'BEAST',
    5: 'FISH',
    8: 'SPELLCASTER',
    9: 'MACHINE',
    12: 'WARRIOR',
    13: 'BEAST_WARRIOR',
    14: 'FIEND',
    15: 'FAIRY',
    17: 'SEA_SERPENT',
    21: 'DRAGON',
    22: 'WYRM',
    24: 'ROCK',
    25: 'PLANT',
    29: 'REPTILE',
    30: 'CYBERSE',
    31: 'AQUA',
    32: 'ZOMBIE',
    33: 'PSYCHIC',
    34: 'INSECT',
    35: 'WINGED_BEAST',
    36: 'DINOSAUR',
    37: 'PYRO',
    38: 'THUNDER',
    39: 'DIVINE_BEAST',
    41: 'ILLUSION',
});
export const PROPERTY_ABILITIES: Readonly<Record<number, string>> =
    Object.freeze({
        2: 'SPECIAL_SUMMON',
        4: 'EFFECT',
        6: 'NORMAL',
        7: 'FLIP',
        10: 'UNION',
        16: 'PENDULUM',
        20: 'TUNER',
        26: 'SPIRIT',
        28: 'GEMINI',
        40: 'TOON',
    });
export const PROPERTY_SUMMON_KINDS: Readonly<Record<number, string>> =
    Object.freeze({
        11: 'FUSION',
        18: 'XYZ',
        19: 'SYNCHRO',
        23: 'LINK',
        27: 'RITUAL',
    });
export const ABILITY_ORDER = [
    'NORMAL',
    'EFFECT',
    'TUNER',
    'FLIP',
    'GEMINI',
    'SPIRIT',
    'TOON',
    'UNION',
    'PENDULUM',
    'SPECIAL_SUMMON',
] as const;
export const PROVIDER_LINK_MARKERS: Readonly<Record<string, string>> =
    Object.freeze({
        '1': '7',
        '2': '8',
        '3': '9',
        '4': '4',
        '6': '6',
        '7': '1',
        '8': '2',
        '9': '3',
    });
type PropertyField = 'summon_kind' | 'race_code' | 'abilities';
type Warn = (code: string, field: string | null, message: string) => void;
const propertyPath = '$.cardData.en.properties';
const mapped = (id: number) =>
    [PROPERTY_RACES, PROPERTY_ABILITIES, PROPERTY_SUMMON_KINDS].some(
        (dictionary) => Object.hasOwn(dictionary, id),
    );

export function structuralProperties(
    source: Record<string, unknown>,
    documentId: string,
    warn: Warn,
) {
    const exists = Object.hasOwn(source, 'properties');
    const raw = source.properties;
    const valid =
        Array.isArray(raw) &&
        raw.every(
            (id) =>
                typeof id === 'number' && Number.isSafeInteger(id) && id >= 1,
        ) &&
        new Set(raw).size === raw.length;
    const unknown = valid && raw.some((id: number) => !mapped(id));
    if (exists && !valid)
        warn('SOURCE_FIELD_INVALID', null, 'Malformed properties observation.');
    if (exists && unknown)
        warn('SOURCE_FIELD_UNMAPPED', null, 'Unknown provider property IDs.');
    return (field: PropertyField, direct: Claim, family: Claim): Claim => {
        if (!exists) return direct;
        const evidence = {
            document_id: documentId,
            locale: 'EN' as const,
            source_path: propertyPath,
        };
        let derived: Claim;
        if (!valid) derived = { state: 'INVALID', raw_value: raw, evidence };
        else if (unknown || family.state !== 'PRESENT') {
            derived = { state: 'UNMAPPED', raw_value: raw, evidence };
            if (!unknown)
                warn(
                    'SOURCE_FIELD_UNMAPPED',
                    field,
                    'Properties require a deterministic Monster family.',
                );
        } else if (family.value !== 'MONSTER')
            derived = { state: 'ABSENT', evidence };
        else {
            const dictionary =
                field === 'race_code'
                    ? PROPERTY_RACES
                    : field === 'summon_kind'
                      ? PROPERTY_SUMMON_KINDS
                      : PROPERTY_ABILITIES;
            const values = raw
                .filter((id: number) => Object.hasOwn(dictionary, id))
                .map((id: number) => dictionary[id]!);
            if (field === 'abilities') {
                derived = {
                    state: 'PRESENT',
                    value: ABILITY_ORDER.filter((code) =>
                        values.includes(code),
                    ),
                    evidence,
                };
            } else if (values.length > 1) {
                derived = { state: 'INVALID', raw_value: raw, evidence };
                warn(
                    'SOURCE_FIELD_INVALID',
                    field,
                    'Multiple incompatible properties in this category.',
                );
            } else if (values.length === 1 || field === 'summon_kind') {
                derived = {
                    state: 'PRESENT',
                    value: values[0] ?? 'MAIN_DECK',
                    evidence,
                };
            } else {
                derived = { state: 'UNMAPPED', raw_value: raw, evidence };
                warn(
                    'SOURCE_FIELD_UNMAPPED',
                    field,
                    'No recognized race in fully understood Monster properties.',
                );
            }
        }
        // Explicit invalid/unmapped observations must not be repaired by a second observation.
        if (direct.state !== 'ABSENT') {
            if (direct.state !== 'PRESENT' || derived.state !== 'PRESENT')
                return direct;
            const source_paths = [
                ...new Set([
                    ...(direct.evidence.source_paths ?? [
                        direct.evidence.source_path,
                    ]),
                    propertyPath,
                ]),
            ];
            const combined = { ...direct.evidence, source_paths };
            const equal =
                field === 'abilities'
                    ? JSON.stringify([...(direct.value as string[])].sort()) ===
                      JSON.stringify([...(derived.value as string[])].sort())
                    : direct.value === derived.value;
            if (equal) return { ...direct, evidence: combined };
            warn(
                'SOURCE_FIELD_AMBIGUOUS',
                field,
                'Direct field contradicts properties.',
            );
            const key =
                field === 'summon_kind'
                    ? 'summonKind'
                    : field === 'race_code'
                      ? 'race'
                      : 'abilities';
            return {
                state: 'INVALID',
                raw_value: { [key]: source[key], properties: raw },
                evidence: combined,
            };
        }
        return derived;
    };
}

export function linkMarkers(
    value: unknown,
    fields: Record<string, Claim>,
    evidence: Claim['evidence'],
    warn: Warn,
): Claim {
    if (
        typeof value !== 'string' ||
        !/^[12346789]+$/.test(value) ||
        new Set(value).size !== value.length
    ) {
        return { state: 'INVALID', raw_value: value, evidence };
    }
    const family = fields.family!,
        summon = fields.summon_kind!;
    if (
        (family.state === 'PRESENT' && family.value !== 'MONSTER') ||
        (family.state === 'PRESENT' &&
            family.value === 'MONSTER' &&
            summon.state === 'PRESENT' &&
            summon.value !== 'LINK')
    ) {
        return { state: 'INVALID', raw_value: value, evidence };
    }
    if (family.state !== 'PRESENT' || summon.state !== 'PRESENT') {
        return { state: 'UNMAPPED', raw_value: value, evidence };
    }
    const markers = [...value]
        .map((digit) => PROVIDER_LINK_MARKERS[digit]!)
        .sort();
    const rating = fields.link_rating!;
    if (rating.state === 'PRESENT' && rating.value !== markers.length) {
        warn(
            'SOURCE_FIELD_AMBIGUOUS',
            'link_markers',
            'Link Rating does not equal marker count.',
        );
        warn(
            'SOURCE_FIELD_AMBIGUOUS',
            'link_rating',
            'Link Rating does not equal marker count.',
        );
        fields.link_rating = {
            state: 'INVALID',
            raw_value: rating.value,
            evidence: rating.evidence,
        };
        return { state: 'INVALID', raw_value: value, evidence };
    }
    return { state: 'PRESENT', value: markers, evidence };
}
