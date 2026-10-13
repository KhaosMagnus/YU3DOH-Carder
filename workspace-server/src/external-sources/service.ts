import { randomUUID } from 'node:crypto';
import type { CanonicalDomainService } from '../canonical/service';
import type { WorkspacePersistence } from '../persistence/database';
import type { WorkspaceMaintenanceCoordinator } from '../workspace/maintenance';
import { WorkspaceRecoveryError } from '../recovery/errors';
import { assertExternalCardId, YgoResourcesCardAdapter } from './adapter';
import { ExternalSourceError } from './errors';
import { diffCandidate } from './diff';
import { normalizeYgoResources } from './normalizer';
import { detail, history, publishPackage } from './repository';
import {
    SOURCE_REGISTRY,
    type RetrieveRequest,
    type Retrieval,
    type StoredCandidate,
    type Target,
} from './types';

/** Only getCard is available here: no Canonical/Asset/Variant/Carder mutation capability. */
export class ExternalSourceIngestionService {
    constructor(
        private readonly persistence: WorkspacePersistence,
        private readonly canonical: Pick<CanonicalDomainService, 'getCard'>,
        private readonly maintenance: WorkspaceMaintenanceCoordinator,
        private readonly isCurrent: () => boolean,
        private readonly enabled: boolean,
        private readonly adapter = new YgoResourcesCardAdapter(),
    ) {}

    private assertCurrent() {
        if (!this.isCurrent() || !this.persistence.isOpen)
            throw new ExternalSourceError(
                'WORKSPACE_NOT_READY',
                'Workspace runtime changed or is not READY.',
            );
    }
    private target(target: Target) {
        this.assertCurrent();
        if (
            typeof target.target_card_id !== 'string' ||
            !target.target_card_id ||
            typeof target.target_expected_revision !== 'string' ||
            !/^[1-9][0-9]*$/.test(target.target_expected_revision)
        )
            throw new ExternalSourceError(
                'INVALID_REQUEST',
                'Target card and expected revision must be strings.',
            );
        const card = this.canonical.getCard(target.target_card_id);
        if (!card)
            throw new ExternalSourceError(
                'NOT_FOUND',
                'Canonical target was not found.',
            );
        if (card.revision !== target.target_expected_revision)
            throw new ExternalSourceError(
                'REVISION_CONFLICT',
                'Canonical revision does not match the frozen expected revision.',
            );
        return card;
    }
    async retrieve(input: RetrieveRequest) {
        const request: RetrieveRequest = {
            target_card_id: input.target_card_id,
            target_expected_revision: input.target_expected_revision,
            external_card_id: input.external_card_id,
        };
        this.maintenance.read(() => {
            this.target(request);
            if (!this.enabled)
                throw new ExternalSourceError(
                    'SOURCE_ADAPTER_DISABLED',
                    'YGORESOURCES_CARD_DB is disabled in Workspace Service configuration.',
                );
            assertExternalCardId(request.external_card_id);
        });
        // No transaction or maintenance lease survives this boundary.
        const retrievalId = randomUUID(),
            documentId = randomUUID();
        const fetched = await this.adapter.retrieve(
            request.external_card_id,
            documentId,
        );
        const timestamp = new Date().toISOString();
        let error: ExternalSourceError | null = fetched.document.error_code
            ? new ExternalSourceError(
                  fetched.document.error_code,
                  fetched.document.error_message!,
                  retrievalId,
              )
            : null;
        let candidate: StoredCandidate | null = null;
        let status: Retrieval['status'] = 'FAILED';
        if (!error) {
            try {
                const normalized = normalizeYgoResources(
                    fetched.payload,
                    request.external_card_id,
                    documentId,
                );
                status = normalized.status;
                candidate = {
                    candidate_id: randomUUID(),
                    retrieval_id: retrievalId,
                    candidate_schema_version: 1,
                    normalizer_version: 1,
                    candidate: normalized.candidate,
                    diagnostics: normalized.diagnostics,
                    created_at: timestamp,
                };
            } catch (e) {
                error =
                    e instanceof ExternalSourceError
                        ? new ExternalSourceError(
                              e.code,
                              e.message,
                              retrievalId,
                          )
                        : new ExternalSourceError(
                              'CANDIDATE_NORMALIZATION_FAILED',
                              'Candidate normalization failed.',
                              retrievalId,
                          );
            }
        }
        const retrieval: Retrieval = {
            retrieval_id: retrievalId,
            source_record_id: randomUUID(),
            source_code: SOURCE_REGISTRY.source_code,
            external_record_key: request.external_card_id,
            target_card_id: request.target_card_id,
            target_expected_revision: request.target_expected_revision,
            adapter_version: 1,
            status,
            error_code: error?.code ?? null,
            error_message: error?.message ?? null,
            retrieved_at: timestamp,
        };
        const published = (() => {
            try {
                return this.maintenance.mutate(() => {
                    this.assertCurrent();
                    // The expected revision stays frozen even when the card changed during I/O.
                    return this.persistence.transaction((db) => {
                        publishPackage(
                            db,
                            retrieval.source_record_id,
                            retrieval,
                            fetched.document,
                            candidate,
                        );
                        return detail(db, retrievalId, false)!;
                    });
                });
            } catch (e) {
                if (
                    e instanceof ExternalSourceError ||
                    e instanceof WorkspaceRecoveryError
                )
                    throw e;
                throw new ExternalSourceError(
                    'SOURCE_PUBLICATION_FAILED',
                    'External Source publication failed; no rows from this package were committed.',
                );
            }
        })();
        if (error) throw error;
        return published;
    }
    history(cardId: string) {
        return this.maintenance.read(() => {
            this.assertCurrent();
            if (!this.canonical.getCard(cardId))
                throw new ExternalSourceError(
                    'NOT_FOUND',
                    'Canonical target was not found.',
                );
            return {
                source: { ...SOURCE_REGISTRY, enabled: this.enabled },
                retrievals: this.persistence.runRepositoryOperation((db) =>
                    history(db, cardId),
                ),
            };
        });
    }
    detail(retrievalId: string, raw = false) {
        return this.maintenance.read(() => {
            this.assertCurrent();
            const stored = this.persistence.runRepositoryOperation((db) =>
                detail(db, retrievalId, raw),
            );
            if (!stored)
                throw new ExternalSourceError(
                    'NOT_FOUND',
                    'Retrieval was not found.',
                );
            return stored;
        });
    }
    diff(candidateId: string, target: Target) {
        return this.maintenance.read(() => {
            const card = this.target(target);
            const retrievalId = this.persistence.runRepositoryOperation(
                (db) =>
                    (
                        db
                            .prepare(
                                'SELECT retrieval_id FROM external_source_candidates WHERE candidate_id=?',
                            )
                            .get(candidateId) as
                            | { retrieval_id: string }
                            | undefined
                    )?.retrieval_id,
            );
            if (!retrievalId)
                throw new ExternalSourceError(
                    'NOT_FOUND',
                    'Candidate was not found.',
                );
            const stored = this.detail(retrievalId);
            if (stored.retrieval.target_card_id !== target.target_card_id)
                throw new ExternalSourceError(
                    'CANDIDATE_TARGET_MISMATCH',
                    'Candidate belongs to a different Canonical target.',
                );
            if (
                stored.retrieval.target_expected_revision !==
                target.target_expected_revision
            )
                throw new ExternalSourceError(
                    'REVISION_CONFLICT',
                    'Candidate target revision is frozen; no automatic rebase.',
                );
            return diffCandidate(
                candidateId,
                stored.candidate!.candidate,
                card,
                target,
            );
        });
    }
}
