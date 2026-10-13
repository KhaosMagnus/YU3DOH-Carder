import type { WorkspacePersistence } from '../persistence/database';
import type { BatchRegistry } from './batch-classification';

/** Fixed registry tables; no client-controlled SQL identifiers or registry writes. */
export const loadBatchRegistry = (
    persistence: WorkspacePersistence,
): BatchRegistry =>
    persistence.runRepositoryOperation((database) => {
        const ids = (table: string, column: string) =>
            new Set(
                (
                    database
                        .prepare(`SELECT ${column} AS id FROM ${table}`)
                        .all() as {
                        id: string;
                    }[]
                ).map((row) => row.id),
            );
        return {
            archetype: ids('canonical_archetypes', 'archetype_id'),
            effect_classifier: ids(
                'canonical_effect_classifiers',
                'classifier_id',
            ),
            functional_tag: ids('canonical_functional_tags', 'tag_id'),
        };
    });
