import { randomUUID } from 'node:crypto';
import { ExternalSourceError } from './errors';
import {
    YGORESOURCES_SOURCE,
    type Block,
    type Candidate,
    type Claim,
    type Diagnostic,
} from './types';

const object = (value: unknown): value is Record<string, unknown> =>
    value !== null && typeof value === 'object' && !Array.isArray(value);
const own = (value: Record<string, unknown>, key: string) =>
    Object.hasOwn(value, key);
const equivalent = (a: unknown, b: unknown) =>
    JSON.stringify(a) === JSON.stringify(b);
const aliases: Record<string, string[]> = {
    family: ['cardType', 'type'],
    attribute_code: ['attribute', 'englishAttribute'],
    pendulum_text: ['pendulumEffectText', 'pendEffect'],
    pendulum_scale: ['pendulumScale', 'pendScale'],
    spell_subtype_code: ['property', 'englishProperty'],
    trap_subtype_code: ['property', 'englishProperty'],
};
// Version-1, source-owned dictionaries. These never read/write the Canonical registries.
const pairs = (entries: Record<string, string>) =>
    new Map(Object.entries(entries));
const families = pairs({
    Monster: 'MONSTER',
    monster: 'MONSTER',
    MONSTER: 'MONSTER',
    Spell: 'SPELL',
    spell: 'SPELL',
    SPELL: 'SPELL',
    Trap: 'TRAP',
    trap: 'TRAP',
    TRAP: 'TRAP',
    Token: 'TOKEN',
    token: 'TOKEN',
    TOKEN: 'TOKEN',
});
const attributes = pairs(
    Object.fromEntries(
        ['DARK', 'LIGHT', 'EARTH', 'WATER', 'FIRE', 'WIND', 'DIVINE'].flatMap(
            (x) => [
                [x, x],
                [x.toLowerCase(), x],
                [x[0] + x.slice(1).toLowerCase(), x],
            ],
        ),
    ),
);
const raceNames = [
    'Aqua',
    'Beast',
    'Beast-Warrior',
    'Creator God',
    'Cyberse',
    'Dinosaur',
    'Divine-Beast',
    'Dragon',
    'Fairy',
    'Fiend',
    'Fish',
    'Insect',
    'Machine',
    'Plant',
    'Psychic',
    'Pyro',
    'Reptile',
    'Rock',
    'Sea Serpent',
    'Spellcaster',
    'Thunder',
    'Warrior',
    'Winged Beast',
    'Wyrm',
    'Zombie',
    'Illusion',
];
const races = pairs(
    Object.fromEntries(
        raceNames.flatMap((x) => {
            const code = x.toUpperCase().replaceAll(/[ -]/g, '_');
            return [
                [x, code],
                [x.toLowerCase(), code],
                [code, code],
            ];
        }),
    ),
);
const summonKinds = pairs({
    'Main Deck': 'MAIN_DECK',
    MAIN_DECK: 'MAIN_DECK',
    Normal: 'MAIN_DECK',
    Effect: 'MAIN_DECK',
    Ritual: 'RITUAL',
    Fusion: 'FUSION',
    Synchro: 'SYNCHRO',
    Xyz: 'XYZ',
    XYZ: 'XYZ',
    Link: 'LINK',
    LINK: 'LINK',
    RITUAL: 'RITUAL',
    FUSION: 'FUSION',
    SYNCHRO: 'SYNCHRO',
});
const abilities = pairs(
    Object.fromEntries(
        [
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
        ].flatMap((x) => [
            [x, x],
            [x.toLowerCase().replaceAll('_', ' '), x],
            [
                x
                    .toLowerCase()
                    .replaceAll('_', ' ')
                    .replace(/\b[a-z]/g, (c) => c.toUpperCase()),
                x,
            ],
        ]),
    ),
);
const subtypes = pairs({
    Normal: 'NORMAL',
    normal: 'NORMAL',
    NORMAL: 'NORMAL',
    Continuous: 'CONTINUOUS',
    continuous: 'CONTINUOUS',
    CONTINUOUS: 'CONTINUOUS',
    Equip: 'EQUIP',
    equip: 'EQUIP',
    EQUIP: 'EQUIP',
    Field: 'FIELD',
    field: 'FIELD',
    FIELD: 'FIELD',
    'Quick-Play': 'QUICK_PLAY',
    'quick-play': 'QUICK_PLAY',
    QUICK_PLAY: 'QUICK_PLAY',
    Ritual: 'RITUAL',
    ritual: 'RITUAL',
    RITUAL: 'RITUAL',
    Counter: 'COUNTER',
    counter: 'COUNTER',
    COUNTER: 'COUNTER',
});
const spellSubtypes = new Map(
    [...subtypes].filter(([, code]) => code !== 'COUNTER'),
);
const trapSubtypes = new Map(
    [...subtypes].filter(([, code]) =>
        ['NORMAL', 'CONTINUOUS', 'COUNTER'].includes(code),
    ),
);
export const STRUCTURE_FIELDS = [
    'family',
    'summon_kind',
    'attribute_code',
    'race_code',
    'level',
    'rank',
    'atk',
    'def',
    'pendulum_scale',
    'abilities',
    'link_rating',
    'link_markers',
    'spell_subtype_code',
    'trap_subtype_code',
] as const;
const textFields = ['name', 'card_text', 'pendulum_text'] as const;

export function normalizeYgoResources(
    payload: unknown,
    id: string,
    documentId: string,
) {
    if (!object(payload))
        throw new ExternalSourceError(
            'CANDIDATE_NORMALIZATION_FAILED',
            'SOURCE_SHAPE_UNSUPPORTED: expected a JSON object.',
        );
    const returned = payload.cardId;
    if (
        !(typeof returned === 'string' && returned === id) &&
        !(
            typeof returned === 'number' &&
            Number.isSafeInteger(returned) &&
            String(returned) === id
        )
    ) {
        throw new ExternalSourceError(
            'SOURCE_IDENTITY_MISMATCH',
            'Returned cardId does not match the requested ID.',
        );
    }
    if (!object(payload.cardData))
        throw new ExternalSourceError(
            'CANDIDATE_NORMALIZATION_FAILED',
            'PARSER_STRUCTURE_CHANGED: cardData must be an object.',
        );
    const diagnostics: Diagnostic[] = [];
    const candidate: Candidate = {
        candidate_schema_version: 1,
        authoritative: false,
        identity: { source_code: YGORESOURCES_SOURCE, external_record_key: id },
        blocks: {
            STRUCTURE: { fields: {} },
            'TEXT:EN': { fields: {} },
            'TEXT:ES': { fields: {} },
            'TEXT:JP': { fields: {} },
        },
    };
    const diagnostic = (
        code: string,
        block: Block,
        field: string | null,
        locale: 'EN' | 'ES' | 'JP' | null,
        message: string,
    ) => {
        diagnostics.push({
            diagnostic_id: randomUUID(),
            severity: 'WARNING',
            stage: 'NORMALIZATION',
            code,
            block,
            field,
            locale,
            message,
        });
    };
    const claim = (
        source: Record<string, unknown>,
        block: Block,
        field: string,
        locale: 'EN' | 'ES' | 'JP',
        providerKey: 'en' | 'es' | 'ja',
        names: string[],
        convert: (v: unknown) => Omit<Claim, 'evidence'>,
    ): Claim => {
        const present = names.filter((n) => own(source, n));
        const paths = (present.length ? present : [names[0]!]).map(
            (name) => `$.cardData.${providerKey}.${name}`,
        );
        const evidence = {
            document_id: documentId,
            locale,
            source_path: paths[0]!,
            ...(paths.length > 1 ? { source_paths: paths } : {}),
        };
        let result: Omit<Claim, 'evidence'>;
        if (!present.length) result = { state: 'ABSENT' };
        else if (
            present.length > 1 &&
            !present.every(
                (n) =>
                    equivalent(source[n], source[present[0]!]) ||
                    equivalent(
                        convert(source[n]),
                        convert(source[present[0]!]),
                    ),
            )
        ) {
            result = {
                state: 'INVALID',
                raw_value: Object.fromEntries(
                    present.map((n) => [n, source[n]]),
                ),
            } as Omit<Claim, 'evidence'>;
            diagnostic(
                'SOURCE_FIELD_AMBIGUOUS',
                block,
                field,
                locale,
                'Conflicting recognized aliases.',
            );
        } else result = convert(source[present[0]!]);
        if (result.state === 'UNMAPPED' || result.state === 'INVALID')
            diagnostic(
                result.state === 'UNMAPPED'
                    ? 'SOURCE_FIELD_UNMAPPED'
                    : 'SOURCE_FIELD_INVALID',
                block,
                field,
                locale,
                `Source field is ${result.state.toLowerCase()}.`,
            );
        return { ...result, evidence } as Claim;
    };
    const invalid = (v: unknown) =>
        ({ state: 'INVALID', raw_value: v }) as const;
    const present = (value: string | number | string[] | null) =>
        ({ state: 'PRESENT', value }) as const;
    const dictionary = (map: Map<string, string>) => (v: unknown) =>
        typeof v !== 'string'
            ? invalid(v)
            : map.has(v)
              ? present(map.get(v)!)
              : ({ state: 'UNMAPPED', raw_value: v } as const);
    const number = (v: unknown) => {
        const numeric =
            typeof v === 'string' && /^(?:0|[1-9][0-9]*)$/.test(v)
                ? Number(v)
                : v;
        return typeof numeric === 'number' &&
            Number.isSafeInteger(numeric) &&
            numeric >= 0
            ? present(numeric)
            : invalid(v);
    };
    const stat = (v: unknown) => (v === '?' ? present(v) : number(v));
    const text = (v: unknown) =>
        typeof v === 'string' ? present(v) : invalid(v);
    for (const [language, key] of [
        ['EN', 'en'],
        ['ES', 'es'],
        ['JP', 'ja'],
    ] as const) {
        const block = `TEXT:${language}` as Block;
        const source = payload.cardData[key];
        if (!object(source))
            diagnostic(
                'LOCALE_NOT_AVAILABLE',
                block,
                null,
                language,
                'Supported locale is unavailable; no fallback is used.',
            );
        for (const field of textFields) {
            candidate.blocks[block].fields[field] = claim(
                object(source) ? source : {},
                block,
                field,
                language,
                key,
                aliases[field] ?? [
                    field === 'card_text' ? 'effectText' : field,
                ],
                text,
            );
        }
        if (
            object(source) &&
            (candidate.blocks[block].fields.name?.state !== 'PRESENT' ||
                candidate.blocks[block].fields.card_text?.state !== 'PRESENT')
        )
            diagnostic(
                'LOCALE_NOT_AVAILABLE',
                block,
                null,
                language,
                'Supported locale is unusable/partial; no fallback is used.',
            );
    }
    // Structural observations use the explicit English source record; never fallback to translated fields.
    const source = object(payload.cardData.en) ? payload.cardData.en : {};
    const fields = candidate.blocks.STRUCTURE.fields;
    const converters: Record<string, (v: unknown) => Omit<Claim, 'evidence'>> =
        {
            family: dictionary(families),
            summon_kind: dictionary(summonKinds),
            attribute_code: dictionary(attributes),
            race_code: dictionary(races),
            level: number,
            rank: number,
            atk: stat,
            def: stat,
            pendulum_scale: number,
            link_rating: number,
            spell_subtype_code: dictionary(spellSubtypes),
            trap_subtype_code: dictionary(trapSubtypes),
            abilities: (v) => {
                if (!Array.isArray(v) || !v.every((x) => typeof x === 'string'))
                    return invalid(v);
                if (!v.every((x) => abilities.has(x)))
                    return { state: 'UNMAPPED', raw_value: v };
                return present([...new Set(v.map((x) => abilities.get(x)!))]);
            },
            link_markers: (v) => ({ state: 'UNMAPPED', raw_value: v }),
        };
    const keys: Record<string, string[]> = {
        summon_kind: ['summonKind'],
        race_code: ['race'],
        link_rating: ['linkRating'],
        link_markers: ['linkArrows'],
    };
    for (const field of STRUCTURE_FIELDS) {
        const family = fields.family;
        const summon = fields.summon_kind;
        const unresolvedSubtype =
            (field === 'spell_subtype_code' || field === 'trap_subtype_code') &&
            family?.state !== 'PRESENT';
        const notApplicable =
            (field === 'spell_subtype_code' &&
                family?.state === 'PRESENT' &&
                family.value !== 'SPELL') ||
            (field === 'trap_subtype_code' &&
                family?.state === 'PRESENT' &&
                family.value !== 'TRAP') ||
            (field === 'def' &&
                source.def === null &&
                family?.state === 'PRESENT' &&
                family.value === 'MONSTER' &&
                summon?.state === 'PRESENT' &&
                summon.value === 'LINK');
        fields[field] = claim(
            source,
            'STRUCTURE',
            field,
            'EN',
            'en',
            aliases[field] ?? keys[field] ?? [field],
            notApplicable
                ? () => ({ state: 'ABSENT' })
                : unresolvedSubtype
                  ? (value) =>
                        typeof value === 'string'
                            ? { state: 'UNMAPPED', raw_value: value }
                            : invalid(value)
                  : converters[field]!,
        );
    }
    // Property is applicable only to its explicit family, not both Spell and Trap.
    if (fields.family?.state === 'PRESENT') {
        for (const [field, family] of [
            ['spell_subtype_code', 'SPELL'],
            ['trap_subtype_code', 'TRAP'],
        ] as const) {
            if (fields.family.value !== family)
                fields[field] = {
                    state: 'ABSENT',
                    evidence: fields[field]!.evidence,
                };
        }
    }
    const usable = (['TEXT:EN', 'TEXT:ES', 'TEXT:JP'] as Block[]).every(
        (b) =>
            candidate.blocks[b].fields.name?.state === 'PRESENT' &&
            candidate.blocks[b].fields.card_text?.state === 'PRESENT',
    );
    return {
        candidate,
        diagnostics,
        status:
            usable && diagnostics.length === 0
                ? ('SUCCESS' as const)
                : ('PARTIAL' as const),
    };
}
