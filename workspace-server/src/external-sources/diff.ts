import type { CanonicalCardSnapshot } from '../canonical/types';
import type {
    Block,
    Candidate,
    CandidateDiff,
    Claim,
    DiffStatus,
    Target,
} from './types';

const equal = (a: unknown, b: unknown) =>
    Array.isArray(a) && Array.isArray(b)
        ? JSON.stringify([...a].sort()) === JSON.stringify([...b].sort())
        : a === b;
export function compareClaim(
    source: Claim,
    canonical: unknown,
    notApplicable = false,
): DiffStatus {
    if (source.state === 'UNMAPPED' || source.state === 'INVALID')
        return source.state;
    if (source.state === 'ABSENT')
        return canonical == null || notApplicable ? 'SAME' : 'CANONICAL_ONLY';
    if (source.state !== 'PRESENT') return source.state;
    if (equal(source.value, canonical)) return 'SAME';
    return canonical == null ? 'SOURCE_ONLY' : 'DIFFERENT';
}
export function diffCandidate(
    candidateId: string,
    candidate: Candidate,
    card: CanonicalCardSnapshot,
    target: Target,
): CandidateDiff {
    const s = card.structure;
    const values: Record<string, unknown> = {
        family: card.family,
        summon_kind: s?.kind === 'MONSTER' ? s.summonKind : null,
        attribute_code: s && 'attributeCode' in s ? s.attributeCode : null,
        race_code: s && 'raceCode' in s ? s.raceCode : null,
        level: s && 'level' in s ? s.level : null,
        rank: s && 'rank' in s ? s.rank : null,
        atk: s && 'atk' in s ? s.atk : null,
        def: s && 'def' in s ? s.def : null,
        pendulum_scale: s && 'pendulumScale' in s ? s.pendulumScale : null,
        abilities: s?.kind === 'MONSTER' ? s.abilities : null,
        link_rating: s?.kind === 'MONSTER' ? s.linkRating : null,
        link_markers: s?.kind === 'MONSTER' ? s.linkMarkers : null,
        spell_subtype_code: s?.kind === 'SPELL' ? s.subtypeCode : null,
        trap_subtype_code: s?.kind === 'TRAP' ? s.subtypeCode : null,
    };
    return {
        ...target,
        candidate_id: candidateId,
        authoritative: false,
        read_only: true,
        groups: (Object.keys(candidate.blocks) as Block[]).map((block) => ({
            block,
            fields: Object.entries(candidate.blocks[block].fields).map(
                ([field, source]) => {
                    const locale =
                        block === 'STRUCTURE'
                            ? null
                            : card.localizations.find(
                                  (x) => x.language === block.slice(5),
                              );
                    const value =
                        block === 'STRUCTURE'
                            ? values[field]
                            : field === 'name'
                              ? locale?.name
                              : field === 'card_text'
                                ? locale?.cardText
                                : locale?.pendulumText;
                    const linkDefAbsent =
                        field === 'def' &&
                        s?.kind === 'MONSTER' &&
                        s.summonKind === 'LINK' &&
                        s.def === null;
                    return {
                        field,
                        source,
                        canonical_value: value ?? null,
                        status: compareClaim(source, value, linkDefAbsent),
                    };
                },
            ),
        })),
    };
}
