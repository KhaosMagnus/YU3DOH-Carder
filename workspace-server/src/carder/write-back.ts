import { CanonicalDomainError } from '../canonical/errors';
import type { CanonicalDomainService } from '../canonical/service';
import type {
    CanonicalCardMutation,
    CanonicalCardSnapshot,
    CanonicalLanguage,
    CanonicalStructureInput,
    SemanticBlockKey,
} from '../canonical/types';
import { CarderWriteGrantRegistry } from './write-grants';

export class CarderWriteError extends Error {
    constructor(
        readonly code: string,
        message: string,
        readonly statusCode: number,
    ) {
        super(message);
    }
}
const unsupported = (field: string): never => {
    throw new CarderWriteError(
        'UNSUPPORTED_WRITE_FIELD',
        `Unsupported write field: ${field}`,
        422,
    );
};
export type WriteProjection = Record<
    | 'password'
    | 'attribute'
    | 'star'
    | 'atk'
    | 'def'
    | 'sub_family'
    | 'name'
    | 'effect'
    | 'pendulum_effect'
    | 'pendulum_scale_red'
    | 'pendulum_scale_blue',
    string
>;
export type WriteBackRequest = {
    write_grant: string;
    card_id: string;
    expected_revision: string;
    content_language: CanonicalLanguage;
    projection: WriteProjection;
    acknowledge_move_to_draft: SemanticBlockKey[];
};
const text = (s: string) => (s.trim() ? s : null);
const stat = (s: string, field: string): number | '?' | null => {
    const v = s.trim();
    if (!v) return null;
    if (v === '?') return '?';
    if (!/^-?\d+$/.test(v) || !Number.isSafeInteger(Number(v)))
        return unsupported(field);
    return Number(v);
};
const integer = (s: string, field: string): number => {
    const v = s.trim();
    if (!/^-?\d+$/.test(v) || !Number.isSafeInteger(Number(v)))
        return unsupported(field);
    return Number(v);
};
export const authoritativeProjection = (
    card: CanonicalCardSnapshot,
    language: CanonicalLanguage,
): WriteProjection => {
    const s = card.structure;
    if (!s) return unsupported('structure');
    const monster = s.kind === 'MONSTER',
        creature = monster || s.kind === 'TOKEN';
    const pendulum = monster && s.abilities.includes('PENDULUM');
    const loc = card.localizations.find((x) => x.language === language);
    return {
        password: card.family === 'TOKEN' ? '' : (card.password ?? ''),
        attribute: creature ? (s.attributeCode ?? 'NONE') : s.kind,
        star: String(
            monster && s.summonKind === 'LINK'
                ? 0
                : monster && s.summonKind === 'XYZ'
                  ? (s.rank ?? 0)
                  : creature
                    ? (s.level ?? 0)
                    : 6,
        ),
        atk: creature ? String(s.atk ?? '') : '',
        def:
            monster && s.summonKind === 'LINK'
                ? ''
                : creature
                  ? String(s.def ?? '')
                  : '',
        sub_family: !creature
            ? s.subtypeCode === 'QUICK_PLAY'
                ? 'QUICK-PLAY'
                : (s.subtypeCode ?? 'NO ICON')
            : 'NO ICON',
        name: loc?.name ?? '',
        effect: loc?.cardText ?? '',
        pendulum_effect: pendulum ? (loc?.pendulumText ?? '') : '',
        pendulum_scale_red: String(pendulum ? (s.pendulumScale ?? 4) : 4),
        pendulum_scale_blue: String(pendulum ? (s.pendulumScale ?? 4) : 4),
    };
};
export class CarderWriteBackService {
    constructor(
        private readonly canonical: CanonicalDomainService,
        private readonly grants: CarderWriteGrantRegistry,
    ) {}
    writeBack(input: WriteBackRequest) {
        const grant = this.grants.verify(input.write_grant);
        if (!grant)
            throw new CarderWriteError(
                'NO_WORKSPACE_CARDER_SESSION',
                'A valid Workspace Carder write session is required.',
                403,
            );
        if (
            grant.cardId !== input.card_id ||
            grant.contentLanguage !== input.content_language
        )
            throw new CarderWriteError(
                'SESSION_IDENTITY_MISMATCH',
                'Card or language differs from prepared session.',
                403,
            );
        if (grant.revision !== input.expected_revision)
            throw new CarderWriteError(
                'REVISION_CONFLICT',
                'Revision differs from prepared session.',
                409,
            );
        const card = this.canonical.getCard(grant.cardId);
        if (!card)
            throw new CarderWriteError(
                'NOT_FOUND',
                'Canonical card no longer exists.',
                404,
            );
        if (card.revision !== grant.revision)
            throw new CarderWriteError(
                'REVISION_CONFLICT',
                'Canonical card changed; reopen explicitly.',
                409,
            );
        const baseline = authoritativeProjection(card, grant.contentLanguage),
            p = input.projection;
        const structure = card.structure!;
        const next: CanonicalStructureInput = { ...structure };
        const creature = next.kind === 'MONSTER' || next.kind === 'TOKEN';
        const link = next.kind === 'MONSTER' && next.summonKind === 'LINK';
        const pendulum =
            next.kind === 'MONSTER' && next.abilities.includes('PENDULUM');
        const mutation: CanonicalCardMutation = {};
        const rejectChanged = (field: keyof WriteProjection) => {
            const normalize = (v: string) =>
                ['star', 'pendulum_scale_red', 'pendulum_scale_blue'].includes(
                    field,
                ) && /^-?\d+$/.test(v.trim())
                    ? String(Number(v))
                    : field === 'password'
                      ? v.trim()
                      : v;
            if (normalize(p[field]) !== normalize(baseline[field]))
                unsupported(field);
        };
        if (card.family === 'TOKEN') rejectChanged('password');
        else if (
            (p.password.trim() || null) !== (card.password?.trim() || null)
        )
            mutation.password = p.password.trim() || null;
        if (creature) {
            if (p.attribute !== baseline.attribute) {
                if (
                    ![
                        'DARK',
                        'EARTH',
                        'FIRE',
                        'LIGHT',
                        'WATER',
                        'WIND',
                        'DIVINE',
                        'SPELL',
                        'TRAP',
                        'NONE',
                    ].includes(p.attribute)
                )
                    unsupported('attribute');
                next.attributeCode =
                    p.attribute === 'NONE' ? null : p.attribute;
            }
            if (link) rejectChanged('star');
            else if (p.star !== baseline.star) {
                if (next.kind === 'MONSTER' && next.summonKind === 'XYZ')
                    next.rank = integer(p.star, 'star');
                else next.level = integer(p.star, 'star');
            }
            next.atk = stat(p.atk, 'atk');
            if (link) rejectChanged('def');
            else next.def = stat(p.def, 'def');
            rejectChanged('sub_family');
        } else {
            for (const key of ['attribute', 'star', 'atk', 'def'] as const)
                rejectChanged(key);
            if (p.sub_family !== baseline.sub_family) {
                const mapping: Record<string, string | null> = {
                    'NO ICON': null,
                    NORMAL: 'NORMAL',
                    CONTINUOUS: 'CONTINUOUS',
                    EQUIP: 'EQUIP',
                    FIELD: 'FIELD',
                    'QUICK-PLAY': 'QUICK_PLAY',
                    RITUAL: 'RITUAL',
                    COUNTER: 'COUNTER',
                };
                if (
                    !Object.hasOwn(mapping, p.sub_family) ||
                    (next.kind === 'SPELL' && p.sub_family === 'COUNTER') ||
                    (next.kind === 'TRAP' &&
                        ![
                            'NO ICON',
                            'NORMAL',
                            'CONTINUOUS',
                            'COUNTER',
                        ].includes(p.sub_family))
                )
                    unsupported('sub_family');
                next.subtypeCode = mapping[p.sub_family]!;
            }
        }
        if (pendulum && next.kind === 'MONSTER') {
            const red = integer(p.pendulum_scale_red, 'pendulum_scale_red'),
                blue = integer(p.pendulum_scale_blue, 'pendulum_scale_blue');
            if (red !== blue) unsupported('pendulum_scale_red/blue');
            if (
                p.pendulum_scale_red !== baseline.pendulum_scale_red ||
                p.pendulum_scale_blue !== baseline.pendulum_scale_blue
            )
                next.pendulumScale = red;
        } else
            for (const key of [
                'pendulum_scale_red',
                'pendulum_scale_blue',
                'pendulum_effect',
            ] as const)
                rejectChanged(key);
        // Preserve all authoritative structural fields; derived Link rating is not a mutation field.
        const original = { ...structure };
        if ('linkRating' in original)
            delete (original as Partial<typeof original>).linkRating;
        if ('linkRating' in next)
            delete (
                next as CanonicalStructureInput & { linkRating?: number | null }
            ).linkRating;
        if (JSON.stringify(original) !== JSON.stringify(next))
            mutation.structure = next;
        const loc = card.localizations.find(
            (x) => x.language === grant.contentLanguage,
        );
        const localized = {
            language: grant.contentLanguage,
            name: text(p.name),
            cardText: text(p.effect),
            pendulumText: pendulum
                ? text(p.pendulum_effect)
                : (loc?.pendulumText ?? null),
        };
        if (
            localized.name !== loc?.name ||
            localized.cardText !== loc?.cardText ||
            localized.pendulumText !== loc?.pendulumText
        )
            mutation.localizations = [localized];
        const changed: SemanticBlockKey[] = [];
        if (mutation.password !== undefined || mutation.structure)
            changed.push('STRUCTURE');
        if (mutation.localizations)
            changed.push(`TEXT:${grant.contentLanguage}`);
        const required = changed.filter((block) =>
            card.confirmations.some(
                (c) => c.block === block && c.state === 'CONFIRMED',
            ),
        );
        const ack = input.acknowledge_move_to_draft;
        if (
            new Set(ack).size !== ack.length ||
            ack.some((block) => !required.includes(block))
        )
            throw new CarderWriteError(
                'CONFIRMED_BLOCK_STATE_CHANGED',
                'Acknowledgement no longer matches changed confirmed blocks.',
                409,
            );
        if (required.some((block) => !ack.includes(block)))
            throw new CarderWriteError(
                'CONFIRMED_BLOCK_ACK_REQUIRED',
                `Acknowledge moving ${required.join(', ')} to DRAFT.`,
                409,
            );
        let revision = card.revision;
        if (changed.length) {
            mutation.confirmations = required.map((block) => ({
                block,
                state: 'DRAFT',
            }));
            mutation.provenance = changed.map((targetKey) => ({
                targetKind: 'BLOCK',
                targetKey,
                sourceKind: 'CARDER_WRITE_BACK',
            }));
            try {
                revision = this.canonical.mutateCard(
                    card.cardId,
                    card.revision,
                    mutation,
                ).revision;
            } catch (error) {
                if (
                    error &&
                    typeof error === 'object' &&
                    'code' in error &&
                    String(error.code).startsWith('SQLITE_CONSTRAINT')
                )
                    throw new CanonicalDomainError(
                        'DOMAIN_VALIDATION',
                        'Canonical mutation violates a domain constraint.',
                    );
                throw error;
            }
        }
        const replacement = this.grants.issue({ ...grant, revision });
        this.grants.revoke(input.write_grant);
        return {
            card_id: card.cardId,
            changed: changed.length > 0,
            previous_revision: card.revision,
            revision,
            changed_blocks: changed,
            moved_to_draft: required,
            write_grant: replacement,
        };
    }
}
