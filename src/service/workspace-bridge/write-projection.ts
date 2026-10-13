import type { InternalCard } from 'src/model';
import type { WorkspaceBridgeSession } from './session';
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
export const projectionOf = (card: InternalCard): WriteProjection => ({
    password: card.password,
    attribute: card.attribute,
    star: String(card.star),
    atk: card.atk,
    def: card.def,
    sub_family: card.subFamily,
    name: card.name,
    effect: card.effect,
    pendulum_effect: card.pendulumEffect,
    pendulum_scale_red: card.pendulumScaleRed,
    pendulum_scale_blue: card.pendulumScaleBlue,
});
export const guardedFields = [
    'frame',
    'typeAbility',
    'isLink',
    'isPendulum',
    'linkMap',
    'linkRating',
] as const;
export const guardedOf = (card: InternalCard) =>
    Object.fromEntries(
        guardedFields.map((k) => [k, JSON.parse(JSON.stringify(card[k]))]),
    );
const normalize = (key: string, value: string) => {
    const v = ['name', 'effect', 'pendulum_effect'].includes(key)
        ? value.trim()
            ? value
            : ''
        : value.trim();
    return [
        'star',
        'atk',
        'def',
        'pendulum_scale_red',
        'pendulum_scale_blue',
    ].includes(key) && /^-?\d+$/.test(v)
        ? String(Number(v))
        : v;
};
export const classifyWrite = (
    session: WorkspaceBridgeSession,
    card: InternalCard,
) => {
    const state = session.write;
    if (!state)
        return {
            unsupported: ['NO_WORKSPACE_CARDER_SESSION'],
            changedBlocks: [] as string[],
            required: [] as string[],
            projection: projectionOf(card),
        };
    const projection = projectionOf(card),
        unsupported = guardedFields.filter(
            (k) =>
                JSON.stringify(card[k]) !==
                JSON.stringify(state.guardedBaseline[k]),
        ) as string[];
    if (card.id !== state.internalCardId)
        unsupported.push('NO_WORKSPACE_CARDER_SESSION');
    const changed = (k: keyof WriteProjection) =>
        normalize(k, projection[k]) !== normalize(k, state.baseline[k]);
    const { family, summonKind, pendulum } = state.context;
    const creature = family === 'MONSTER' || family === 'TOKEN';
    const nonWritable: Array<keyof WriteProjection> = [];
    if (family === 'TOKEN') nonWritable.push('password');
    if (!creature) nonWritable.push('attribute', 'star', 'atk', 'def');
    else nonWritable.push('sub_family');
    if (summonKind === 'LINK') nonWritable.push('star', 'def');
    if (!pendulum)
        nonWritable.push(
            'pendulum_scale_red',
            'pendulum_scale_blue',
            'pendulum_effect',
        );
    for (const key of nonWritable) if (changed(key)) unsupported.push(key);
    if (
        pendulum &&
        normalize('pendulum_scale_red', projection.pendulum_scale_red) !==
            normalize('pendulum_scale_blue', projection.pendulum_scale_blue)
    )
        unsupported.push('pendulum_scale_red/blue');
    const changedBlocks: string[] = [];
    if (
        (
            [
                'password',
                'attribute',
                'star',
                'atk',
                'def',
                'sub_family',
                'pendulum_scale_red',
                'pendulum_scale_blue',
            ] as const
        ).some((k) => changed(k) && !nonWritable.includes(k))
    )
        changedBlocks.push('STRUCTURE');
    if (
        (['name', 'effect', 'pendulum_effect'] as const).some(
            (k) => changed(k) && !nonWritable.includes(k),
        )
    )
        changedBlocks.push(`TEXT:${session.contentLanguage}`);
    return {
        unsupported,
        projection,
        changedBlocks,
        required: changedBlocks.filter(
            (k) => state.confirmations[k] === 'CONFIRMED',
        ),
    };
};
