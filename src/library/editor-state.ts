import type { LibraryCardDetail, SemanticBlock } from './model';
import { getConfirmationState } from './model';

export type WorkingCardForm = {
    password: string | null;
    structure: Record<string, unknown> | null;
    localizations: LibraryCardDetail['localizations'];
    classification: {
        effect_reviewed: boolean;
        archetype_ids: string[];
        effect_classifier_ids: string[];
        functional_tag_ids: string[];
    };
    relations: Array<{
        target_card_id: string;
        relation_type_code: string;
        note: string | null;
    }>;
};

export const detailToWorkingForm = (detail: LibraryCardDetail): WorkingCardForm => ({
    password: detail.password,
    structure: detail.structure
        ? (() => {
            const { link_rating: _ignored, ...rest } = detail.structure as Record<string, unknown>;
            return { ...rest };
        })()
        : null,
    localizations: detail.localizations.map(item => ({ ...item })),
    classification: {
        effect_reviewed: detail.classification.effect_reviewed,
        archetype_ids: detail.classification.archetypes.map(item => item.id),
        effect_classifier_ids: detail.classification.effect_classifiers.map(item => item.id),
        functional_tag_ids: detail.classification.functional_tags.map(item => item.id),
    },
    relations: detail.relations.map(item => ({
        target_card_id: item.target_card_id,
        relation_type_code: item.relation_type_code,
        note: item.note,
    })),
});

const stable = (value: unknown) => JSON.stringify(value);

export const detectDirtySections = (
    authoritative: LibraryCardDetail,
    working: WorkingCardForm,
) => {
    const baseline = detailToWorkingForm(authoritative);
    return {
        password: stable(baseline.password) !== stable(working.password),
        structure: stable(baseline.structure) !== stable(working.structure),
        localizations: stable(baseline.localizations) !== stable(working.localizations),
        classification: stable(baseline.classification) !== stable(working.classification),
        relations: stable(baseline.relations) !== stable(working.relations),
    };
};

export const isWorkingFormDirty = (
    authoritative: LibraryCardDetail,
    working: WorkingCardForm,
) => {
    const dirty = detectDirtySections(authoritative, working);
    return Object.values(dirty).some(Boolean);
};

export const impactedConfirmedBlocks = (
    authoritative: LibraryCardDetail,
    working: WorkingCardForm,
): SemanticBlock[] => {
    const dirty = detectDirtySections(authoritative, working);
    const impacted: SemanticBlock[] = [];
    if ((dirty.password || dirty.structure) && getConfirmationState(authoritative, 'STRUCTURE') === 'CONFIRMED') {
        impacted.push('STRUCTURE');
    }
    if (dirty.localizations) {
        const baseline = new Map(authoritative.localizations.map(item => [item.language, item]));
        for (const localization of working.localizations) {
            const previous = baseline.get(localization.language);
            if (stable(previous ?? null) !== stable(localization)) {
                const block = `TEXT:${localization.language}` as SemanticBlock;
                if (getConfirmationState(authoritative, block) === 'CONFIRMED' && !impacted.includes(block)) {
                    impacted.push(block);
                }
            }
        }
    }
    if (dirty.classification && getConfirmationState(authoritative, 'CLASSIFICATION') === 'CONFIRMED') {
        impacted.push('CLASSIFICATION');
    }
    if (dirty.relations && getConfirmationState(authoritative, 'RELATIONS') === 'CONFIRMED') {
        impacted.push('RELATIONS');
    }
    return impacted;
};

export const buildPatchPayload = (
    authoritative: LibraryCardDetail,
    working: WorkingCardForm,
    confirmations?: Array<{
        block: SemanticBlock;
        state: 'DRAFT' | 'CONFIRMED';
        provenance?: { source_kind: string; source_ref?: string | null; note?: string | null };
    }>,
) => {
    const dirty = detectDirtySections(authoritative, working);
    const payload: Record<string, unknown> = {
        expected_revision: authoritative.revision,
    };
    if (dirty.password) payload.password = working.password;
    if (dirty.structure && working.structure) payload.structure = working.structure;
    if (dirty.localizations) {
        const baseline = new Map(authoritative.localizations.map(item => [item.language, item]));
        payload.localizations = working.localizations.filter(item =>
            stable(baseline.get(item.language) ?? null) !== stable(item));
    }
    if (dirty.classification) payload.classification = working.classification;
    if (dirty.relations) payload.relations = working.relations;
    if (confirmations && confirmations.length > 0) {
        payload.confirmations = confirmations;
    }
    return payload;
};

export const emptyStructureForFamily = (family: LibraryCardDetail['family']): Record<string, unknown> | null => {
    if (family === 'MONSTER') {
        return {
            kind: 'MONSTER',
            summon_kind: null,
            attribute_code: null,
            race_code: null,
            level: null,
            rank: null,
            atk: null,
            def: null,
            pendulum_scale: null,
            abilities: [],
            link_markers: [],
        };
    }
    if (family === 'TOKEN') {
        return {
            kind: 'TOKEN',
            attribute_code: null,
            race_code: null,
            level: null,
            atk: null,
            def: null,
        };
    }
    if (family === 'SPELL') {
        return { kind: 'SPELL', subtype_code: null };
    }
    if (family === 'TRAP') {
        return { kind: 'TRAP', subtype_code: null };
    }
    return null;
};
