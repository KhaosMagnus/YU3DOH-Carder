/** Presentation only: consumes existing composition readiness without changing it. */
export const preferredVariantWarning = (standardReady: boolean, overframeReady: boolean): string | null => {
    if (standardReady && overframeReady) return null;
    const availability = standardReady
        ? 'OVERFRAME unavailable; STANDARD remains available.'
        : overframeReady
            ? 'STANDARD unavailable; OVERFRAME remains available.'
            : 'STANDARD and OVERFRAME unavailable.';
    return `Preferred Variant: ${availability} It remains selected; choose another variant manually if needed.`;
};
