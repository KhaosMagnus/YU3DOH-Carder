import type {
    CanonicalCardSnapshot,
    CanonicalStructureInput,
    MonsterStructureInput,
} from '../canonical/types';
import type { Claim } from './types';
import {
    STRUCTURE_REASONS,
    type StructureChange,
    type StructureReason,
} from './structure-acceptance-dto';

export const SOURCE_STRUCTURE_FIELDS = [
    'summon_kind',
    'attribute_code',
    'race_code',
    'level',
    'rank',
    'atk',
    'def',
    'pendulum_scale',
    'abilities',
    'link_markers',
    'spell_subtype_code',
    'trap_subtype_code',
] as const;
export const REGISTRY_TABLES = [
    'canonical_summon_kinds',
    'canonical_attributes',
    'canonical_races',
    'canonical_abilities',
    'canonical_link_marker_codes',
    'canonical_spell_subtypes',
    'canonical_trap_subtypes',
] as const;
export type StructureRegistries = Record<
    (typeof REGISTRY_TABLES)[number],
    ReadonlySet<string>
>;
const abilities = [
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
];
const markers = ['1', '2', '3', '4', '6', '7', '8', '9'];
const monsterFields = SOURCE_STRUCTURE_FIELDS.slice(0, 10);
const numeric = (v: unknown): v is number =>
    typeof v === 'number' && Number.isSafeInteger(v) && v >= 0;
const levelValue = (v: unknown) => numeric(v) && v <= 12;
const rankValue = (v: unknown) => numeric(v) && v <= 13;
const stat = (v: unknown) => numeric(v) || v === '?';
const code = (v: unknown): v is string =>
    typeof v === 'string' && v.trim().length > 0;
const array = (v: unknown): v is string[] =>
    Array.isArray(v) && v.every(code) && new Set(v).size === v.length;
const ordered = (v: string[], order: readonly string[]) =>
    [...v].sort((a, b) => {
        const ai = order.indexOf(a),
            bi = order.indexOf(b);
        return (
            (ai < 0 ? order.length : ai) - (bi < 0 ? order.length : bi) ||
            (a < b ? -1 : a > b ? 1 : 0)
        );
    });
export const structureEqualValue = (a: unknown, b: unknown) =>
    Array.isArray(a) && Array.isArray(b)
        ? JSON.stringify([...new Set(a)].sort()) ===
          JSON.stringify([...new Set(b)].sort())
        : a === b;
export const orderStructureReasons = (reasons: Iterable<StructureReason>) =>
    STRUCTURE_REASONS.filter((r) => new Set(reasons).has(r));

/** Strict source-acceptance coherence, independently of Draft permissiveness and password. */
export function coherentStructure(s: CanonicalStructureInput): boolean {
    if (s.kind === 'SPELL' || s.kind === 'TRAP') return code(s.subtypeCode);
    if (
        s.kind !== 'MONSTER' ||
        !s.summonKind ||
        !['MAIN_DECK', 'RITUAL', 'FUSION', 'SYNCHRO', 'XYZ', 'LINK'].includes(
            s.summonKind,
        ) ||
        !code(s.attributeCode) ||
        !code(s.raceCode) ||
        !stat(s.atk) ||
        !array(s.abilities) ||
        !array(s.linkMarkers)
    )
        return false;
    const pendulum = s.abilities.includes('PENDULUM');
    if (s.summonKind === 'LINK')
        return (
            !pendulum &&
            s.level === null &&
            s.rank === null &&
            s.def === null &&
            s.pendulumScale === null &&
            s.linkMarkers.length > 0
        );
    if (
        s.linkMarkers.length ||
        !stat(s.def) ||
        (pendulum ? !numeric(s.pendulumScale) : s.pendulumScale !== null)
    )
        return false;
    return s.summonKind === 'XYZ'
        ? rankValue(s.rank) && s.level === null
        : levelValue(s.level) && s.rank === null;
}
export function buildStructureResult(
    fields: Record<string, Claim>,
    current: CanonicalCardSnapshot,
    candidateId: string,
    registries: StructureRegistries,
) {
    const reasons = new Set<StructureReason>();
    const required = new Set<string>(),
        derived = new Map<string, string>();
    const present = (
        field: string,
        valid: (v: unknown) => boolean,
    ): unknown => {
        const c = fields[field];
        if (c?.state !== 'PRESENT') {
            reasons.add('REQUIRED_CLAIM_NOT_PRESENT');
            return undefined;
        }
        if (!valid(c.value)) reasons.add('STRUCTURE_VALUE_INVALID');
        required.add(field);
        return c.value;
    };
    const absent = (field: string, trigger?: string) => {
        const c = fields[field];
        if (c?.state === 'PRESENT') reasons.add('NON_APPLICABLE_CLAIM_PRESENT');
        else if (c?.state !== 'ABSENT') reasons.add('STRUCTURE_VALUE_INVALID');
        if (trigger) derived.set(field, trigger);
    };
    const family = present('family', code);
    if (
        family !== undefined &&
        !['MONSTER', 'SPELL', 'TRAP'].includes(String(family))
    )
        reasons.add('UNSUPPORTED_FAMILY');
    if (family !== undefined && family !== current.family)
        reasons.add('FAMILY_MISMATCH');
    let result: CanonicalStructureInput | null = null;
    if (family === 'MONSTER') {
        const summon = present('summon_kind', code),
            attribute = present('attribute_code', code),
            race = present('race_code', code),
            atk = present('atk', stat),
            ability = present('abilities', array);
        absent('spell_subtype_code');
        absent('trap_subtype_code');
        let level: unknown = null,
            rank: unknown = null,
            def: unknown = null,
            scale: unknown = null,
            link: unknown = [];
        if (summon === 'LINK') {
            link = present('link_markers', (v) => array(v) && v.length > 0);
            for (const field of ['level', 'rank', 'def'])
                absent(field, 'summon_kind');
            absent('pendulum_scale', 'abilities');
            if (Array.isArray(ability) && ability.includes('PENDULUM'))
                reasons.add('LINK_PENDULUM_CONFLICT');
            const rating = fields.link_rating;
            if (rating?.state === 'PRESENT') {
                if (!numeric(rating.value))
                    reasons.add('STRUCTURE_VALUE_INVALID');
                else if (Array.isArray(link) && rating.value !== link.length)
                    reasons.add('LINK_RATING_INCONSISTENT');
            } else if (rating?.state !== 'ABSENT')
                reasons.add('STRUCTURE_VALUE_INVALID');
        } else {
            if (summon === 'XYZ') {
                rank = present('rank', rankValue);
                absent('level', 'summon_kind');
            } else {
                level = present('level', levelValue);
                absent('rank', 'summon_kind');
            }
            def = present('def', stat);
            absent('link_markers', 'summon_kind');
            absent('link_rating');
            if (Array.isArray(ability) && ability.includes('PENDULUM'))
                scale = present('pendulum_scale', numeric);
            else absent('pendulum_scale', 'abilities');
        }
        if (reasons.size === 0)
            result = {
                kind: 'MONSTER',
                summonKind: summon as MonsterStructureInput['summonKind'],
                attributeCode: attribute as string,
                raceCode: race as string,
                atk: atk as MonsterStructureInput['atk'],
                def: def as MonsterStructureInput['def'],
                level: level as number | null,
                rank: rank as number | null,
                pendulumScale: scale as number | null,
                abilities: ordered(ability as string[], abilities),
                linkMarkers: ordered(link as string[], markers),
            };
    } else if (family === 'SPELL' || family === 'TRAP') {
        const field =
                family === 'SPELL' ? 'spell_subtype_code' : 'trap_subtype_code',
            opposite =
                family === 'SPELL' ? 'trap_subtype_code' : 'spell_subtype_code';
        const subtype = present(field, code);
        monsterFields.forEach((f) => absent(f));
        absent('link_rating');
        absent(opposite);
        if (reasons.size === 0)
            result = { kind: family, subtypeCode: subtype as string };
    }
    if (result) {
        const check = (
            table: (typeof REGISTRY_TABLES)[number],
            values: readonly (string | null)[],
        ) => {
            if (values.some((v) => v === null || !registries[table].has(v)))
                reasons.add('STRUCTURAL_REGISTRY_VALUE_NOT_AVAILABLE');
        };
        if (result.kind === 'MONSTER') {
            check('canonical_summon_kinds', [result.summonKind]);
            check('canonical_attributes', [result.attributeCode]);
            check('canonical_races', [result.raceCode]);
            check('canonical_abilities', result.abilities);
            check('canonical_link_marker_codes', result.linkMarkers);
        } else if (result.kind === 'SPELL')
            check('canonical_spell_subtypes', [result.subtypeCode]);
        else if (result.kind === 'TRAP')
            check('canonical_trap_subtypes', [result.subtypeCode]);
        if (!coherentStructure(result)) reasons.add('STRUCTURE_INCOHERENT');
    }
    const changes: StructureChange[] = [],
        unchanged_fields: string[] = [];
    const names: Record<string, string> = {
        summon_kind: 'summonKind',
        attribute_code: 'attributeCode',
        race_code: 'raceCode',
        pendulum_scale: 'pendulumScale',
        link_markers: 'linkMarkers',
        spell_subtype_code: 'subtypeCode',
        trap_subtype_code: 'subtypeCode',
    };
    const change = (field: string, trigger: string | null) => {
        const key = names[field] ?? field,
            old =
                (
                    current.structure as unknown as Record<
                        string,
                        unknown
                    > | null
                )?.[key] ??
                (['abilities', 'link_markers'].includes(field) ? [] : null),
            next = (result as unknown as Record<string, unknown>)[key];
        if (structureEqualValue(old, next)) {
            unchanged_fields.push(field);
            return;
        }
        changes.push({
            kind: trigger ? 'DERIVED_CLEAR' : 'SOURCE_CHANGE',
            field,
            current: old,
            result: next,
            trigger,
            provenance_ref: `workspace-external-candidate/${candidateId}/STRUCTURE/${trigger ? trigger + '/derived-clear/' : ''}${field}`,
        });
    };
    if (result && !reasons.size) {
        SOURCE_STRUCTURE_FIELDS.filter((f) => required.has(f)).forEach((f) =>
            change(f, null),
        );
        for (const f of [
            'level',
            'rank',
            'def',
            'pendulum_scale',
            'link_markers',
        ])
            if (derived.has(f)) change(f, derived.get(f)!);
    }
    return {
        result,
        changes,
        unchanged_fields,
        reason_codes: orderStructureReasons(reasons),
    };
}
