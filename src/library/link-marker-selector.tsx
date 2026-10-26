import { LINK_MARKER_POSITIONS, toggleLinkMarker } from './link-marker-state';

export const LinkMarkerSelector = ({ value, baseline, onChange }: {
    value: string[];
    baseline: readonly string[];
    onChange: (value: string[]) => void;
}) => (
    <fieldset className="library-link-markers">
        <legend>Link Markers</legend>
        <div className="library-link-markers__grid">
            {LINK_MARKER_POSITIONS.map(({ code, direction, arrow, row, column }) => (
                <button key={code} type="button"
                    style={{ gridRow: row, gridColumn: column }}
                    aria-label={`${direction} Link Marker (${code})`}
                    aria-pressed={value.includes(code)}
                    data-marker-code={code}
                    onClick={() => onChange(toggleLinkMarker(value, code, baseline))}
                >
                    <span aria-hidden="true">{arrow}</span>
                    <small aria-hidden="true">{code}</small>
                </button>
            ))}
            <span className="library-link-markers__center" aria-hidden="true" />
        </div>
    </fieldset>
);
