import type { StructurePreview } from '../../workspace-server/src/external-sources/structure-acceptance-dto';
export type {
    StructurePreview,
    StructureApplyResult,
} from '../../workspace-server/src/external-sources/structure-acceptance-dto';
export const STRUCTURE_PERSISTED_WARNING =
    'Preview uses persisted Canonical state. Unsaved edits are not included.';
export const STRUCTURE_STALE_WARNING =
    'A successful Apply advances the card revision. This candidate will become stale; it will not be rebased.';
export function structureApplyAllowed(
    preview: StructurePreview | null,
    dirty: boolean,
    enabled: boolean,
    busy: boolean,
    ack: boolean,
) {
    return (
        !!preview &&
        preview.decision === 'READY' &&
        preview.eligible &&
        !dirty &&
        enabled &&
        !busy &&
        (!preview.acknowledgement_required || ack)
    );
}
export function structureReviewRows(preview: StructurePreview) {
    const keys: Record<string, string> = {
        summon_kind: 'summonKind',
        attribute_code: 'attributeCode',
        race_code: 'raceCode',
        pendulum_scale: 'pendulumScale',
        link_markers: 'linkMarkers',
        spell_subtype_code: 'subtypeCode',
        trap_subtype_code: 'subtypeCode',
    };
    const value = (structure: unknown, field: string) =>
        structure && typeof structure === 'object'
            ? ((structure as Record<string, unknown>)[keys[field] ?? field] ??
              null)
            : null;
    return [
        ...preview.changes.map((c) => ({
            field: c.field,
            kind: c.kind,
            current: c.current,
            source: preview.source_structure.fields[c.field] ?? null,
            result: c.result,
            trigger: c.trigger,
        })),
        ...preview.unchanged_fields.map((field) => ({
            field,
            kind: 'UNCHANGED',
            current: value(preview.current_structure, field),
            source: preview.source_structure.fields[field] ?? null,
            result: value(preview.resulting_structure, field),
            trigger: null,
        })),
        ...preview.read_only_evidence.map((r) => ({
            field: r.field,
            kind: 'READ_ONLY',
            current: r.current,
            source: r.source,
            result: r.result,
            trigger: null,
        })),
    ];
}
