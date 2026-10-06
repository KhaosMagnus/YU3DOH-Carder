import { CanonicalDomainError } from './errors';
import {
    CANONICAL_CARD_FAMILIES,
    CANONICAL_LANGUAGES,
    SEMANTIC_BLOCK_KEYS,
    type CanonicalCardFamily,
    type CanonicalCardMutation,
    type CanonicalCardSnapshot,
    type CanonicalStructureInput,
    type LocalizedTextInput,
    type RelationInput,
    type SemanticBlockKey,
} from './types';

const fail = (message: string): never => {
    throw new CanonicalDomainError('DOMAIN_VALIDATION', message);
};

const isNonBlank = (value: string | null) =>
    value !== null && value.trim().length > 0;

const hasDuplicates = (values: string[]) =>
    new Set(values).size !== values.length;

const assertIntegerOrNull = (value: number | null, field: string) => {
    if (value !== null && !Number.isInteger(value)) {
        fail(`${field} must be an integer when present.`);
    }
};

const assertPrintedStat = (value: number | '?' | null, field: string) => {
    if (value !== null && value !== '?' && !Number.isInteger(value)) {
        fail(`${field} must be an integer, '?', or null.`);
    }
};

export const assertSupportedFamily = (family: string): asserts family is CanonicalCardFamily => {
    if (!CANONICAL_CARD_FAMILIES.includes(family as CanonicalCardFamily)) {
        fail(`Unsupported Canonical card family: ${family}`);
    }
};

export const assertNonBlankCode = (code: string, label: string) => {
    if (code.trim().length === 0) fail(`${label} code must not be empty.`);
};

const assertStructureInputShape = (
    family: CanonicalCardFamily,
    structure: CanonicalStructureInput,
) => {
    if (structure.kind !== family) {
        fail(`Structure kind ${structure.kind} does not match card family ${family}.`);
    }

    if (structure.kind === 'MONSTER') {
        assertIntegerOrNull(structure.level, 'level');
        assertIntegerOrNull(structure.rank, 'rank');
        assertIntegerOrNull(structure.pendulumScale, 'pendulum_scale');
        assertPrintedStat(structure.atk, 'atk');
        assertPrintedStat(structure.def, 'def');
        if (hasDuplicates(structure.abilities)) {
            fail('Monster abilities must not contain duplicate codes.');
        }
        if (hasDuplicates(structure.linkMarkers)) {
            fail('Link markers must not contain duplicate codes.');
        }
        return;
    }

    if (structure.kind === 'TOKEN') {
        assertIntegerOrNull(structure.level, 'level');
        assertPrintedStat(structure.atk, 'atk');
        assertPrintedStat(structure.def, 'def');
    }
};

const assertLocalizationMutation = (localizations: LocalizedTextInput[]) => {
    const languages = localizations.map(localization => localization.language);
    if (hasDuplicates(languages)) {
        fail('A mutation cannot contain duplicate localized blocks for the same language.');
    }
    for (const language of languages) {
        if (!CANONICAL_LANGUAGES.includes(language)) {
            fail(`Unsupported Canonical language: ${language}`);
        }
    }
};

const assertRelationMutation = (relations: RelationInput[]) => {
    const keys = relations.map(relation => `${relation.relationTypeCode}\u0000${relation.targetCardId}`);
    if (hasDuplicates(keys)) {
        fail('A mutation cannot contain duplicate positive relations of the same type and target.');
    }
    relations.forEach(relation => {
        assertNonBlankCode(relation.relationTypeCode, 'relation type');
        if (relation.targetCardId.trim().length === 0) {
            fail('Relation target card ID must not be empty.');
        }
    });
};

export const assertMutationShape = (
    family: CanonicalCardFamily,
    mutation: CanonicalCardMutation,
) => {
    if (family === 'TOKEN' && 'password' in mutation && mutation.password !== null) {
        fail('Token password must remain absent.');
    }

    if (mutation.structure) {
        assertStructureInputShape(family, mutation.structure);
    }

    if (mutation.localizations) {
        assertLocalizationMutation(mutation.localizations);
    }

    if (mutation.relations) {
        assertRelationMutation(mutation.relations);
    }

    if (mutation.confirmations) {
        const blocks = mutation.confirmations.map(confirmation => confirmation.block);
        if (hasDuplicates(blocks)) fail('A mutation cannot set the same semantic block twice.');
        for (const block of blocks) {
            if (!SEMANTIC_BLOCK_KEYS.includes(block)) {
                fail(`Unsupported semantic block: ${block}`);
            }
        }
        for (const confirmation of mutation.confirmations) {
            if (confirmation.state === 'CONFIRMED' && !confirmation.provenance) {
                fail(`Confirming ${confirmation.block} requires provenance.`);
            }
        }
    }
};

const assertPasswordForConfirmedStructure = (snapshot: CanonicalCardSnapshot) => {
    if (snapshot.family === 'TOKEN') {
        if (snapshot.password !== null) fail('Confirmed Token structure cannot carry a password.');
        return;
    }
    if (!isNonBlank(snapshot.password)) {
        fail('Confirmed non-Token STRUCTURE requires password/passcode.');
    }
};

const assertMonsterStructureConfirmed = (snapshot: CanonicalCardSnapshot) => {
    const structure = snapshot.structure;
    if (!structure || structure.kind !== 'MONSTER') {
        fail('Confirmed Monster STRUCTURE requires persisted Monster structure.');
    }

    if (!structure.summonKind) fail('Confirmed Monster STRUCTURE requires summon_kind.');
    if (!isNonBlank(structure.attributeCode)) fail('Confirmed Monster STRUCTURE requires attribute.');
    if (!isNonBlank(structure.raceCode)) fail('Confirmed Monster STRUCTURE requires race.');
    if (structure.atk === null) fail('Confirmed Monster STRUCTURE requires ATK.');

    const pendulum = structure.abilities.includes('PENDULUM');
    if (pendulum && structure.pendulumScale === null) {
        fail('Confirmed Pendulum Monster requires one canonical pendulum_scale.');
    }
    if (!pendulum && structure.pendulumScale !== null) {
        fail('Confirmed non-Pendulum Monster cannot carry pendulum_scale.');
    }

    if (structure.summonKind === 'LINK') {
        if (structure.level !== null || structure.rank !== null) {
            fail('Confirmed Link Monster cannot carry Level or Rank.');
        }
        if (structure.def !== null) fail('Confirmed Link Monster DEF must be not applicable.');
        if (structure.linkMarkers.length === 0) {
            fail('Confirmed Link Monster requires at least one Link Marker.');
        }
        if (pendulum) fail('Confirmed Link Monster cannot be Pendulum under the supported model.');
        if (structure.linkRating !== structure.linkMarkers.length) {
            fail('Derived Link Rating must equal Link Marker count.');
        }
        return;
    }

    if (structure.linkMarkers.length !== 0) {
        fail('Only Link Monsters may carry Link Markers.');
    }
    if (structure.def === null) fail('Confirmed non-Link Monster requires DEF.');

    if (structure.summonKind === 'XYZ') {
        if (structure.rank === null) fail('Confirmed Xyz Monster requires Rank.');
        if (structure.level !== null) fail('Confirmed Xyz Monster cannot carry Level.');
        return;
    }

    if (structure.level === null) {
        fail(`Confirmed ${structure.summonKind} Monster requires Level.`);
    }
    if (structure.rank !== null) {
        fail(`Confirmed ${structure.summonKind} Monster cannot carry Rank.`);
    }
};

const assertTokenStructureConfirmed = (snapshot: CanonicalCardSnapshot) => {
    const structure = snapshot.structure;
    if (!structure || structure.kind !== 'TOKEN') {
        fail('Confirmed Token STRUCTURE requires persisted Token structure.');
    }
    if (!isNonBlank(structure.attributeCode)) fail('Confirmed Token requires attribute.');
    if (!isNonBlank(structure.raceCode)) fail('Confirmed Token requires race.');
    if (structure.level === null) fail('Confirmed Token requires Level.');
    if (structure.atk === null) fail('Confirmed Token requires ATK.');
    if (structure.def === null) fail('Confirmed Token requires DEF.');
};

const assertStructureConfirmed = (snapshot: CanonicalCardSnapshot) => {
    assertPasswordForConfirmedStructure(snapshot);

    if (snapshot.family === 'MONSTER') return assertMonsterStructureConfirmed(snapshot);
    if (snapshot.family === 'TOKEN') return assertTokenStructureConfirmed(snapshot);

    if (snapshot.family === 'SPELL') {
        if (!snapshot.structure || snapshot.structure.kind !== 'SPELL' || !isNonBlank(snapshot.structure.subtypeCode)) {
            fail('Confirmed Spell STRUCTURE requires a controlled Spell subtype.');
        }
        return;
    }

    if (!snapshot.structure || snapshot.structure.kind !== 'TRAP' || !isNonBlank(snapshot.structure.subtypeCode)) {
        fail('Confirmed Trap STRUCTURE requires a controlled Trap subtype.');
    }
};

const languageForBlock = (block: SemanticBlockKey) => {
    if (!block.startsWith('TEXT:')) return null;
    return block.slice(5) as import('./types').CanonicalLanguage;
};

const assertTextConfirmed = (snapshot: CanonicalCardSnapshot, block: SemanticBlockKey) => {
    const language = languageForBlock(block);
    if (!language) fail(`Invalid text block key: ${block}`);
    const localized = snapshot.localizations.find(item => item.language === language);
    if (!localized) fail(`Confirmed ${block} requires an actual persisted localized block.`);
    if (!isNonBlank(localized.name)) fail(`Confirmed ${block} requires localized card name.`);
    if (!isNonBlank(localized.cardText)) fail(`Confirmed ${block} requires localized card text.`);

    const structure = snapshot.structure;
    if (
        structure?.kind === 'MONSTER'
        && structure.abilities.includes('PENDULUM')
        && !isNonBlank(localized.pendulumText)
    ) {
        fail(`Confirmed ${block} requires localized Pendulum text for a Pendulum Monster.`);
    }
};

export const assertConfirmedBlocksValid = (snapshot: CanonicalCardSnapshot) => {
    for (const confirmation of snapshot.confirmations) {
        if (confirmation.state !== 'CONFIRMED') continue;
        if (confirmation.provenanceId === null) {
            fail(`Confirmed block ${confirmation.block} must retain provenance.`);
        }

        if (confirmation.block === 'STRUCTURE') {
            assertStructureConfirmed(snapshot);
            continue;
        }
        if (confirmation.block.startsWith('TEXT:')) {
            assertTextConfirmed(snapshot, confirmation.block);
            continue;
        }
        if (confirmation.block === 'CLASSIFICATION' && !snapshot.classification.effectReviewed) {
            fail('Confirmed CLASSIFICATION requires Effect Classification review state.');
        }
    }
};
