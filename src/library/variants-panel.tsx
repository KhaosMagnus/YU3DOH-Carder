import type { LifecycleEntry } from './variant-lifecycle-state';
import { Alert, Button, Spin, Tag } from 'antd';
import type { ResolverEntry } from './asset-resolution-state';
import { ASSET_ROLES, type LibraryVariantDetail } from './model';
import {
    ownershipLabel,
    readinessLabel,
    slotStateLabel,
    variantReadinessTags,
} from './asset-state';
import { IngestForm } from './ingest-form';

type Props = {
    cardId: string;
    variants: LibraryVariantDetail[];
    loading: boolean;
    error: string | null;
    onIngestSuccess: () => void;
    ingestError: string | null;
    onIngestError: (message: string | null) => void;
    onResolve?: (entry: ResolverEntry) => void;
    assetsEnabled?: boolean;
    preferredVariantId?: string | null;
    onLifecycle?: (entry: LifecycleEntry) => void;
};

const slotColor = (state: string) => {
    switch (state) {
        case 'BOUND': return 'green';
        case 'CONFLICT': return 'red';
        case 'MISSING': return 'orange';
        case 'INVALID': return 'volcano';
        default: return undefined;
    }
};

export const VariantsPanel = ({
    cardId,
    variants,
    loading,
    error,
    onIngestSuccess,
    ingestError,
    onIngestError,
    onResolve,
    assetsEnabled = true,
    preferredVariantId = null,
    onLifecycle,
}: Props) => (
    <section className="library-variants" aria-label="Variants and Assets">
        <h3>Variants / Assets</h3>
        {loading && <div className="library-state"><Spin tip="Loading variants…" /></div>}
        {error && (
            <Alert type="error" showIcon message="Variants unavailable" description={error} />
        )}
        {!loading && !error && variants.length === 0 && (
            <p className="library-muted">No Art Variants indexed for this card yet.</p>
        )}
        {!loading && !error && variants.map(variant => {
            const tags = variantReadinessTags(variant);
            return (
                <article className="library-variant-card" key={variant.variant_id}>
                    <div className="library-variant-card__header">
                        <div>
                            <strong>{variant.display_label}</strong>
                            <span className="library-muted"> · key: {variant.variant_key}</span>
                        </div>
                        <div className="library-variant-card__readiness">
                            <Tag color={tags.standard === 'READY' ? 'green' : undefined}>
                                Standard {readinessLabel(tags.standard)}
                                {tags.standardSources.length > 0 ? ` ← ${tags.standardSources.join('+')}` : ''}
                            </Tag>
                            <Tag color={tags.overframe === 'READY' ? 'green' : undefined}>
                                Overframe {readinessLabel(tags.overframe)}
                                {tags.overframeSources.length > 0 ? ` ← ${tags.overframeSources.join('+')}` : ''}
                            </Tag>
                        </div>
                    </div>
                    {onLifecycle && <div className="library-variant-actions">
                        {preferredVariantId === variant.variant_id && <Tag color="gold">Preferred</Tag>}
                        <Button disabled={!assetsEnabled} onClick={() => onLifecycle({cardId,variantId:variant.variant_id,operation:preferredVariantId===variant.variant_id?'CLEAR':'PREFERRED'})}>
                            {preferredVariantId===variant.variant_id?'Clear Preferred':'Set Preferred'}
                        </Button>
                        <Button disabled={!assetsEnabled} onClick={() => onLifecycle({cardId,variantId:variant.variant_id,operation:'RENAME'})}>Rename Variant</Button>
                        <Button danger disabled={!assetsEnabled} onClick={() => onLifecycle({cardId,variantId:variant.variant_id,operation:'REMOVE'})}>Remove Variant</Button>
                    </div>}
                    <div className="library-role-slots">
                        {ASSET_ROLES.map(role => {
                            const slot = variant.roles[role];
                            return (
                                <div className="library-role-slot" key={role}>
                                    <div className="library-role-slot__title">
                                        <strong>{role}</strong>
                                        <Tag color={slotColor(slot.slot_state)}>
                                            {slotStateLabel(slot.slot_state)}
                                        </Tag>
                                    </div>
                                    {slot.asset ? (
                                        <div className="library-role-slot__asset">
                                            <div>{slot.asset.file_name}</div>
                                            <div className="library-muted">{slot.asset.relative_path}</div>
                                            <div>
                                                <Tag>{ownershipLabel(slot.asset.ownership)}</Tag>
                                                <Tag>{slot.asset.extension}</Tag>
                                                {slot.asset.image_width != null && slot.asset.image_height != null && (
                                                    <Tag>{slot.asset.image_width}×{slot.asset.image_height}</Tag>
                                                )}
                                                {slot.asset.has_transparency != null && (
                                                    <Tag>
                                                        {slot.asset.has_transparency ? 'transparent' : 'opaque'}
                                                    </Tag>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="library-muted">No bound asset</div>
                                    )}
                                    {slot.issues.length > 0 && (
                                        <ul className="library-role-slot__issues">
                                            {slot.issues.map((issue, index) => (
                                                <li key={`${issue.code}-${issue.message}-${index}`}>
                                                    <Tag color="red">{issue.code}</Tag> {issue.message}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    {onResolve && slot.slot_state !== 'EMPTY' && (
                                        <Button disabled={!assetsEnabled} onClick={() => onResolve({ cardId, variantId: variant.variant_id, role,
                                            ...(slot.asset?.asset_id ? { assetId: slot.asset.asset_id } : {}) })}>
                                            {slot.slot_state === 'CONFLICT' ? 'Resolve Conflict' : slot.slot_state === 'MISSING' || slot.slot_state === 'INVALID' ? 'Repair / resolve asset' : 'Asset actions'}
                                        </Button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </article>
            );
        })}
        {assetsEnabled && <IngestForm
            cardId={cardId}
            knownVariantKeys={variants.map(variant => variant.variant_key)}
            onSuccess={onIngestSuccess}
            error={ingestError}
            onError={onIngestError}
        />}
    </section>
);
