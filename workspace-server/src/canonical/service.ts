import { randomUUID } from 'node:crypto';
import type { WorkspacePersistence } from '../persistence/database';
import { CanonicalDomainError } from './errors';
import {
    addProvenance,
    bumpCanonicalRevision,
    getCanonicalCardRow,
    insertCanonicalCard,
    loadCanonicalCardSnapshot,
    registerNamedEntity,
    registerStructuralCode,
    replaceCanonicalStructure,
    replaceClassificationAssociations,
    replaceRelations,
    setBlockState,
    setEffectClassificationReviewed,
    updateCanonicalPassword,
    upsertLocalizedText,
} from './repository';
import type {
    CanonicalCardMutation,
    CanonicalCardSnapshot,
    CreateCanonicalCardInput,
    NamedRegistryKind,
    ProvenanceInput,
    RegistryEntity,
    StructuralRegistryKind,
} from './types';
import {
    assertConfirmedBlocksExplicitlyTransitioned,
    assertConfirmedBlocksValid,
    assertMutationShape,
    assertNonBlankCode,
    assertSupportedFamily,
} from './validation';

const now = () => new Date().toISOString();

const requireSnapshot = (
    snapshot: CanonicalCardSnapshot | null,
    cardId: string,
): CanonicalCardSnapshot => {
    if (!snapshot) throw new CanonicalDomainError('NOT_FOUND', `Canonical card ${cardId} was not found.`);
    return snapshot;
};

export class CanonicalDomainService {
    constructor(private readonly persistence: WorkspacePersistence) {}

    registerStructuralCode(kind: StructuralRegistryKind, code: string) {
        assertNonBlankCode(code, kind);
        const normalized = code.trim();
        this.persistence.runRepositoryOperation(database => {
            registerStructuralCode(database, kind, normalized);
        });
        return normalized;
    }

    registerNamedEntity(kind: NamedRegistryKind, code: string): RegistryEntity {
        assertNonBlankCode(code, kind);
        const normalized = code.trim();
        return this.persistence.runRepositoryOperation(database =>
            registerNamedEntity(database, kind, randomUUID(), normalized));
    }

    createCard(input: CreateCanonicalCardInput): CanonicalCardSnapshot {
        assertSupportedFamily(input.family);
        const password = input.password ?? null;
        if (input.family === 'TOKEN' && password !== null) {
            throw new CanonicalDomainError('DOMAIN_VALIDATION', 'Token password must remain absent.');
        }

        const cardId = randomUUID();
        return this.persistence.transaction(database => {
            const timestamp = now();
            insertCanonicalCard(database, cardId, input.family, password, timestamp);

            if (input.provenance) {
                addProvenance(database, cardId, {
                    targetKind: 'CARD',
                    targetKey: 'IDENTITY',
                    sourceKind: input.provenance.sourceKind,
                    sourceRef: input.provenance.sourceRef ?? null,
                    note: input.provenance.note ?? null,
                }, timestamp);
            }

            return requireSnapshot(loadCanonicalCardSnapshot(database, cardId), cardId);
        });
    }

    getCard(cardId: string): CanonicalCardSnapshot | null {
        return this.persistence.runRepositoryOperation(database =>
            loadCanonicalCardSnapshot(database, cardId));
    }

    mutateCard(
        cardId: string,
        expectedRevision: string,
        mutation: CanonicalCardMutation,
    ): CanonicalCardSnapshot {
        return this.persistence.transaction(database => {
            const row = getCanonicalCardRow(database, cardId);
            if (!row) {
                throw new CanonicalDomainError('NOT_FOUND', `Canonical card ${cardId} was not found.`);
            }
            if (String(row.revision) !== expectedRevision) {
                throw new CanonicalDomainError(
                    'REVISION_CONFLICT',
                    `Canonical card ${cardId} revision does not match expected_revision.`,
                );
            }

            assertMutationShape(row.family, mutation);
            const current = requireSnapshot(loadCanonicalCardSnapshot(database, cardId), cardId);
            assertConfirmedBlocksExplicitlyTransitioned(current, mutation);
            const timestamp = now();

            if (mutation.password !== undefined) {
                updateCanonicalPassword(database, cardId, mutation.password);
            }

            if (mutation.structure) {
                replaceCanonicalStructure(database, cardId, mutation.structure);
            }

            mutation.localizations?.forEach(localized => {
                upsertLocalizedText(database, cardId, localized);
            });

            if (mutation.classification) {
                if (mutation.classification.effectReviewed !== undefined) {
                    setEffectClassificationReviewed(
                        database,
                        cardId,
                        mutation.classification.effectReviewed,
                    );
                }
                if (mutation.classification.archetypeIds !== undefined) {
                    replaceClassificationAssociations(
                        database,
                        cardId,
                        'ARCHETYPE',
                        mutation.classification.archetypeIds,
                    );
                }
                if (mutation.classification.effectClassifierIds !== undefined) {
                    replaceClassificationAssociations(
                        database,
                        cardId,
                        'EFFECT_CLASSIFIER',
                        mutation.classification.effectClassifierIds,
                    );
                }
                if (mutation.classification.functionalTagIds !== undefined) {
                    replaceClassificationAssociations(
                        database,
                        cardId,
                        'FUNCTIONAL_TAG',
                        mutation.classification.functionalTagIds,
                    );
                }
            }

            if (mutation.relations) {
                const relations = mutation.relations.map(relation => ({
                    relationId: randomUUID(),
                    targetCardId: relation.targetCardId,
                    relationTypeCode: relation.relationTypeCode,
                    note: relation.note ?? null,
                    provenance: relation.provenance,
                }));
                replaceRelations(database, cardId, relations.map(relation => ({
                    relationId: relation.relationId,
                    targetCardId: relation.targetCardId,
                    relationTypeCode: relation.relationTypeCode,
                    note: relation.note,
                })));
                relations.forEach(relation => {
                    if (!relation.provenance) return;
                    addProvenance(database, cardId, {
                        targetKind: 'RELATION',
                        targetKey: relation.relationId,
                        sourceKind: relation.provenance.sourceKind,
                        sourceRef: relation.provenance.sourceRef ?? null,
                        note: relation.provenance.note ?? null,
                    }, timestamp);
                });
            }

            mutation.provenance?.forEach(provenance => {
                addProvenance(database, cardId, provenance, timestamp);
            });

            mutation.confirmations?.forEach(confirmation => {
                let provenanceId: number | null = null;
                if (confirmation.provenance) {
                    provenanceId = addProvenance(database, cardId, {
                        targetKind: 'BLOCK',
                        targetKey: confirmation.block,
                        sourceKind: confirmation.provenance.sourceKind,
                        sourceRef: confirmation.provenance.sourceRef ?? null,
                        note: confirmation.provenance.note ?? null,
                    }, timestamp);
                }
                setBlockState(
                    database,
                    cardId,
                    confirmation.block,
                    confirmation.state,
                    provenanceId,
                );
            });

            const candidate = requireSnapshot(loadCanonicalCardSnapshot(database, cardId), cardId);
            assertConfirmedBlocksValid(candidate);

            try {
                bumpCanonicalRevision(database, cardId, row.revision, timestamp);
            } catch {
                throw new CanonicalDomainError(
                    'REVISION_CONFLICT',
                    `Canonical card ${cardId} revision changed during mutation.`,
                );
            }

            return requireSnapshot(loadCanonicalCardSnapshot(database, cardId), cardId);
        });
    }

    addProvenance(
        cardId: string,
        expectedRevision: string,
        provenance: ProvenanceInput,
    ) {
        return this.mutateCard(cardId, expectedRevision, {
            provenance: [provenance],
        });
    }
}
