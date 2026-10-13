import { useMemo, useState } from 'react';
import { Alert, Button, Input, Tag } from 'antd';
import type { LibraryCardDetail } from './model';
import {
    currentConfirmationBlocks,
    emptyProvenanceFilters,
    filterProvenance,
    provenanceOptions,
    provenanceSourceLabel,
    provenanceTargetContext,
    provenanceText,
    provenanceTimeLabel,
} from './provenance-state';

/** Inspection of persisted Detail only. No API, working-form or capability dependency. */
export const ProvenancePanel = ({
    detail,
    dirty,
}: {
    detail: LibraryCardDetail;
    dirty: boolean;
}) => {
    const [filters, setFilters] = useState(emptyProvenanceFilters);
    const options = useMemo(
        () => provenanceOptions(detail.provenance),
        [detail.provenance],
    );
    const rows = useMemo(
        () => filterProvenance(detail.provenance, filters),
        [detail.provenance, filters],
    );
    const select = (
        key: 'targetKind' | 'targetKey' | 'sourceKind',
        label: string,
        values: string[],
    ) => (
        <label>
            {label}
            <select
                aria-label={label}
                value={filters[key]}
                onChange={(e) =>
                    setFilters((old) => ({ ...old, [key]: e.target.value }))
                }
            >
                <option value="">All</option>
                {values.map((value) => (
                    <option key={value} value={value}>
                        {value}
                    </option>
                ))}
            </select>
        </label>
    );
    return (
        <section
            className="library-provenance"
            aria-label="Sources / Provenance inspection"
        >
            <h2>Sources / Provenance</h2>
            <p>
                Recorded provenance events for this card. Only explicit
                persisted confirmation links identify current confirmation
                provenance.
            </p>
            {dirty && (
                <Alert
                    type="info"
                    showIcon
                    message="Showing persisted Workspace provenance."
                    description="Unsaved Canonical edits are not represented here."
                />
            )}
            <div
                className="library-provenance__filters"
                aria-label="Provenance filters"
            >
                {select('targetKind', 'Target kind', options.targetKinds)}
                {select(
                    'targetKey',
                    'Target key / semantic block',
                    options.targetKeys,
                )}
                {select('sourceKind', 'Source kind', options.sourceKinds)}
                <label>
                    Search
                    <Input
                        aria-label="Search provenance"
                        value={filters.search}
                        onChange={(e) =>
                            setFilters((old) => ({
                                ...old,
                                search: e.target.value,
                            }))
                        }
                    />
                </label>
                <Button onClick={() => setFilters(emptyProvenanceFilters())}>
                    Clear provenance filters
                </Button>
            </div>
            <p aria-live="polite">
                Showing {rows.length} of {detail.provenance.length} provenance
                records
            </p>
            {!detail.provenance.length ? (
                <p>No provenance recorded for this card.</p>
            ) : !rows.length ? (
                <p>No provenance matches the current filters.</p>
            ) : (
                <div className="library-provenance__history">
                    {rows.map((row) => {
                        const context = provenanceTargetContext(detail, row);
                        const current = currentConfirmationBlocks(detail, row);
                        return (
                            <article
                                className="library-provenance__row"
                                key={row.provenance_id}
                                data-provenance-id={row.provenance_id}
                                aria-label={`Provenance ${row.provenance_id}`}
                            >
                                <h3>Provenance #{row.provenance_id}</h3>
                                <dl>
                                    <dt>Recorded time</dt>
                                    <dd>
                                        {provenanceTimeLabel(row.created_at)}
                                        <br />
                                        <code>{row.created_at}</code>
                                    </dd>
                                    <dt>Source kind</dt>
                                    <dd>
                                        {provenanceSourceLabel(row.source_kind)}{' '}
                                        · <code>{row.source_kind}</code>
                                    </dd>
                                    <dt>Source reference</dt>
                                    <dd>{provenanceText(row.source_ref)}</dd>
                                    <dt>Note</dt>
                                    <dd>{provenanceText(row.note)}</dd>
                                    <dt>Target kind</dt>
                                    <dd>
                                        <code>{row.target_kind}</code>
                                    </dd>
                                    <dt>Target key</dt>
                                    <dd>
                                        <code>{row.target_key}</code>
                                    </dd>
                                </dl>
                                <div className="library-provenance__context">
                                    <strong>{context.label}</strong> ·{' '}
                                    {context.kind === 'block'
                                        ? context.blockLabel
                                        : context.key}
                                    {context.kind === 'block' &&
                                        context.state !== null && (
                                            <Tag>
                                                Current block state:{' '}
                                                {context.state}
                                            </Tag>
                                        )}
                                    {context.kind === 'relation' &&
                                        (context.relation ? (
                                            <dl>
                                                <dt>Relation type</dt>
                                                <dd>
                                                    {
                                                        context.relation
                                                            .relation_type_code
                                                    }
                                                </dd>
                                                <dt>Target card ID</dt>
                                                <dd>
                                                    {
                                                        context.relation
                                                            .target_card_id
                                                    }
                                                </dd>
                                                <dt>Relation note</dt>
                                                <dd>
                                                    {provenanceText(
                                                        context.relation.note,
                                                    )}
                                                </dd>
                                                <dt>Relation ID</dt>
                                                <dd>
                                                    {
                                                        context.relation
                                                            .relation_id
                                                    }
                                                </dd>
                                            </dl>
                                        ) : (
                                            <p>
                                                Current relation no longer
                                                present · Relation ID:{' '}
                                                {context.key}
                                            </p>
                                        ))}
                                </div>
                                {current.map((block) => (
                                    <div
                                        key={block}
                                        className="library-provenance__current"
                                    >
                                        <Tag color="green">
                                            CURRENT CONFIRMATION PROVENANCE ·{' '}
                                            {block}
                                        </Tag>
                                    </div>
                                ))}
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
};
