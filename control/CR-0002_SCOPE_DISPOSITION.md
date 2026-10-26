---
artifact_id: CR-0002-SCOPE-DISPOSITION
artifact_type: project_control_disposition
status: FROZEN
protocol_version: "1.0"
source_role: PROJECT_CONTROL
source_instance: PC-002
control_parent_sha: 2a08d458bb72fac0b91dd4b856a768e24f805841
source_scope: scopes/CR-0002_LIBRARY_DARK_THEME-v2.md
superseded_scope: scopes/CR-0002_LIBRARY_DARK_THEME.md
code_baseline:
  branch: feature/workspace-v0.1
  sha: 64cb5f4ca42348c6c403e64e0d61bdff8c32a281
---

# Project Control Disposition — CR-0002 Library Dark Theme

## Decision

Project Control accepts the frozen Scope v2 for:

`CR-0002 — Library Dark Theme`

Canonical Scope artifact:

`scopes/CR-0002_LIBRARY_DARK_THEME-v2.md`

The v1 Scope artifact remains historical and is superseded only by v2.

The Owner revision is accepted:

```text
valid stored LIGHT → LIGHT
valid stored DARK  → DARK
missing/invalid preference → DARK
```

LIGHT remains explicitly selectable.

SYSTEM/AUTO remains OUT_OF_SCOPE.

## Roadmap disposition

CR-0002 is registered as:

`IN_SCOPE / SCOPE FROZEN / SELECTED ROADMAP TRANCHE 3`

Sequence:

```text
Tranche 1
RUN 024
CR-0001.3 / F-03
CR-0001.6 / F-06

→ validated + authorized integration

Tranche 2
CR-0001.4 / F-04 — Library Grid/List

→ validated + authorized integration

Tranche 3
CR-0002 — Library Dark Theme
```

CR-0002 must not be bundled into the CR-0001.4 implementation candidate.

This sequencing is accepted because Grid/List changes layout/responsive interaction while Dark Theme changes cross-Library presentation/contrast; combining them would multiply independent regression dimensions and weaken defect attribution.

## Product/architecture boundary accepted

Frozen:

- Library only;
- LIGHT and DARK;
- default/fallback DARK;
- browser-local persistence;
- not Workspace-specific;
- no SQLite/workspace.json/server persistence;
- no new Workspace API;
- no schema change;
- no migration 009;
- Carder explicitly OUT;
- client/UI only;
- bounded Library theme abstraction permitted;
- major Ant Design upgrade/general dependency modernization OUT;
- accessibility validation required in both themes.

## Design sequencing

Design + QA work may proceed now because the product contract is frozen.

However implementation remains sequenced after CR-0001.4 integration.

Because CR-0001.4 may alter the final Library result DOM/layout, the Design + QA contract must contain a mandatory post-F04 baseline-compatibility check before any CR-0002 implementation authorization.

If the later integrated F04 baseline changes only implementation details, DQA may issue a bounded contract refresh/version.

If it creates a material product/architecture conflict, return to Scope.

## Release Hardening interaction

CR-0002 is now a selected pre-release roadmap tranche.

Therefore the existing documentation gate applies after Tranche 3 integration:

`all selected roadmap tranches integrated → documentation refresh → Release Hardening`

The README refresh is not authorized now.

## Non-authorizations

This disposition does NOT authorize:

- CR-0002 implementation;
- a CR-0002 implementation branch;
- a new RUN number;
- CR-0001.4 implementation;
- RUN 024 modification;
- migration 009;
- feature/workspace-v0.1 movement;
- main movement.

## Next route

`DESIGN_QA / DQA-002`

Mission:

freeze the implementable/testable CR-0002 design contract while preserving the mandatory post-F04 baseline-compatibility gate.
