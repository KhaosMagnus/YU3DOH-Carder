import * as api from './api';
import {
    cloneLibraryCardDetail,
    getConfirmationState,
    type ConfirmationReview,
    type LibraryCardDetail,
    type SemanticBlock,
} from './model';
export const canReviewBlock = (detail: LibraryCardDetail, block: SemanticBlock, editing: boolean) =>
    !editing && getConfirmationState(detail, block) === 'DRAFT';
export type ConfirmationPhase =
    | 'SELECTING'
    | 'REVIEWING'
    | 'REVIEWED'
    | 'CONFIRMING'
    | 'SUCCESS'
    | 'STALE'
    | 'ERROR';
export type ConfirmationView = {
    detail: LibraryCardDetail;
    block: SemanticBlock;
    phase: ConfirmationPhase;
    review: ConfirmationReview | null;
    sourceKind: string;
    sourceRef: string;
    note: string;
    error: string | null;
};
export type ConfirmationClient = Pick<
    typeof api,
    'reviewCanonicalConfirmation' | 'patchLibraryCard' | 'getLibraryCard'
>;
export class ConfirmationController {
    view: ConfirmationView;
    private listeners = new Set<(v: ConfirmationView) => void>();
    onAdopt: (d: LibraryCardDetail) => void = () => {};
    constructor(
        detail: LibraryCardDetail,
        block: SemanticBlock,
        private readonly client: ConfirmationClient = api,
    ) {
        this.view = {
            detail: cloneLibraryCardDetail(detail),
            block,
            phase: 'SELECTING',
            review: null,
            sourceKind: 'MANUAL',
            sourceRef: '',
            note: '',
            error: null,
        };
    }
    subscribe(l: (v: ConfirmationView) => void) {
        this.listeners.add(l);
        return () => {
            this.listeners.delete(l);
        };
    }
    private patch(p: Partial<ConfirmationView>) {
        this.view = { ...this.view, ...p };
        for (const l of this.listeners) l(this.view);
    }
    busy() {
        return ['REVIEWING', 'CONFIRMING'].includes(this.view.phase);
    }
    canConfirm() {
        const r = this.view.review;
        return (
            this.view.phase === 'REVIEWED' &&
            r?.confirmable === true &&
            r.validation.status === 'PASS' &&
            !!this.view.sourceKind.trim()
        );
    }
    provenance(sourceKind: string, sourceRef: string, note: string) {
        if (!this.busy()) this.patch({ sourceKind, sourceRef, note });
    }
    async review() {
        if (this.busy() || !canReviewBlock(this.view.detail, this.view.block, false)) return;
        this.patch({ phase: 'REVIEWING', review: null, error: null });
        try {
            const r = await this.client.reviewCanonicalConfirmation(
                this.view.detail.card_id,
                this.view.block,
                this.view.detail.revision,
            );
            if (
                r.card_id !== this.view.detail.card_id ||
                r.block !== this.view.block ||
                r.revision !== this.view.detail.revision
            )
                throw new Error('Review response does not match the displayed block and revision.');
            this.patch({ review: r, phase: 'REVIEWED' });
        } catch (e) {
            await this.failure(e);
        }
    }
    async confirm() {
        if (!this.canConfirm()) return;
        const v = this.view;
        const reviewed = v.review!;
        this.patch({ phase: 'CONFIRMING', error: null });
        try {
            const detail = await this.client.patchLibraryCard(v.detail.card_id, {
                expected_revision: reviewed.revision,
                confirmations: [
                    {
                        block: v.block,
                        state: 'CONFIRMED',
                        provenance: {
                            source_kind: v.sourceKind.trim(),
                            source_ref: v.sourceRef.trim() || null,
                            note: v.note.trim() || null,
                        },
                    },
                ],
            });
            this.patch({ detail, phase: 'SUCCESS', review: null });
            this.onAdopt(detail);
        } catch (e) {
            await this.failure(e);
        }
    }
    private async failure(e: unknown) {
        const error =
            e instanceof api.LibraryHttpError
                ? `${e.code}: ${e.message}`
                : `NETWORK_ERROR: ${e instanceof Error ? e.message : 'Service request failed.'}`;
        this.patch({ phase: 'ERROR', review: null, error });
        if (e instanceof api.LibraryHttpError && e.code === 'REVISION_CONFLICT') {
            this.patch({ phase: 'REVIEWING' });
            try {
                const detail = await this.client.getLibraryCard(this.view.detail.card_id);
                this.patch({ detail, phase: 'STALE' });
                this.onAdopt(detail);
            } catch (refresh) {
                this.patch({
                    error: `${error} Authoritative refresh failed: ${refresh instanceof api.LibraryHttpError ? refresh.code : 'NETWORK_ERROR'}.`,
                    phase: 'ERROR',
                });
            }
        }
    }
}
