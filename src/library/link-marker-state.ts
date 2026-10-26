/** Workspace canonical positions; the center is deliberately absent. */
export const LINK_MARKER_POSITIONS = [
    { code: '1', direction: 'Top-Left', arrow: '↖', row: 1, column: 1 },
    { code: '2', direction: 'Top', arrow: '↑', row: 1, column: 2 },
    { code: '3', direction: 'Top-Right', arrow: '↗', row: 1, column: 3 },
    { code: '4', direction: 'Left', arrow: '←', row: 2, column: 1 },
    { code: '6', direction: 'Right', arrow: '→', row: 2, column: 3 },
    { code: '7', direction: 'Bottom-Left', arrow: '↙', row: 3, column: 1 },
    { code: '8', direction: 'Bottom', arrow: '↓', row: 3, column: 2 },
    { code: '9', direction: 'Bottom-Right', arrow: '↘', row: 3, column: 3 },
] as const;

/** Only user activation changes values. Restore original order on an exact undo. */
export const toggleLinkMarker = (value: readonly string[], code: string, baseline: readonly string[] = []): string[] => {
    if (!LINK_MARKER_POSITIONS.some(position => position.code === code)) return [...value];
    const next = value.includes(code) ? value.filter(item => item !== code) : [...value, code];
    return next.length === baseline.length && baseline.every(item => next.includes(item))
        ? [...baseline] : next;
};
