import { Checkbox, Tag } from 'antd';
import type { LibraryCardSummary } from './model';

export type LibraryViewMode = 'GRID' | 'LIST';
export const INITIAL_LIBRARY_VIEW: LibraryViewMode = 'LIST';

/** Presentation only: all identity/readiness values come from the browse summary. */
export const LibraryResultCard = ({ card, mode, selected, checked, batchDisabled, onOpen, onSelect }: {
    card: LibraryCardSummary;
    mode: LibraryViewMode;
    selected: boolean;
    checked: boolean;
    batchDisabled: boolean;
    onOpen: () => void;
    onSelect: (checked: boolean) => void;
}) => (
    <article className={`library-card${selected ? ' library-card--selected' : ''}`}
        data-card-id={card.card_id} data-revision={card.revision}>
        <div className="library-card__main">
            <h2><button type="button" className="library-card__open"
                aria-label={`Open ${card.display_name} Detail${selected ? ' — Detail selected' : ''}`}
                onClick={onOpen}>{card.display_name}</button></h2>
            {selected && <strong className="library-card__selected">Detail selected</strong>}
        </div>
        <div className="library-card__identity">
            <Tag>{card.family}</Tag>
            {card.password && <span>Password: {card.password}</span>}
            {card.display_language && <span>Display: {card.display_language}</span>}
            {!card.password && card.family === 'TOKEN' && <span>Token · no password</span>}
        </div>
        {mode === 'LIST' && <div className="library-card__classifications">
            {card.archetypes.map(value => <Tag key={`a-${value}`}>Archetype: {value}</Tag>)}
            {card.effect_classifiers.map(value => <Tag key={`e-${value}`}>Effect: {value}</Tag>)}
            {card.functional_tags.map(value => <Tag key={`f-${value}`}>Tag: {value}</Tag>)}
        </div>}
        <div className="library-card__readiness">
            <span>Variants: {card.variant_count}</span>
            <Tag color={card.has_standard_ready_variant ? 'green' : undefined}>
                Standard {card.has_standard_ready_variant ? 'READY' : 'incomplete'}
            </Tag>
            <Tag color={card.has_overframe_ready_variant ? 'green' : undefined}>
                Overframe {card.has_overframe_ready_variant ? 'READY' : 'incomplete'}
            </Tag>
        </div>
        <div className="library-card__batch">
            <Checkbox aria-label={`Select ${card.display_name} for Batch`} checked={checked}
                disabled={batchDisabled} onChange={event => onSelect(event.target.checked)}>
                Batch
            </Checkbox>
        </div>
    </article>
);
