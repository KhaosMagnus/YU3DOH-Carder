# BACKLOG

Current canonical CR ledger for the CR-0001 family:

`requests/CR-0001-v17.md`

CR-0002 canonical Scope:

`scopes/CR-0002_LIBRARY_DARK_THEME-v2.md`

## Complete / integrated

- CR-0001.1 / F-01 — INTEGRATED / PASS
- CR-0001.2 / F-02 — INTEGRATED / PASS
- CR-0001.5 / F-05 — INTEGRATED / PASS

## Tranche 1 — active RUN 024

### Focused Editor / Variant UX Completion

- CR-0001.3 / F-03
- CR-0001.6 / F-06

Status:

`AUTHORIZED / IMPLEMENTATION NOT COMPLETED / ENV-004 READINESS`

Existing branch:

`feature/workspace-run-024 @ 219ac252d50ae11b836a93baa20cc7f7d872367f`

No implementation candidate exists.

## Tranche 2 — sequenced

### CR-0001.4 / F-04 — Library Grid/List

`IN_SCOPE / SCOPE FROZEN / IMPLEMENTATION NOT AUTHORIZED`

Sequence:

after Tranche 1 QA-PASS + authorized integration.

## Tranche 3 — selected

### CR-0002 — Library Dark Theme

`IN_SCOPE / SCOPE FROZEN / DESIGN ROUTED / IMPLEMENTATION NOT AUTHORIZED`

Canonical Scope:

`scopes/CR-0002_LIBRARY_DARK_THEME-v2.md`

Frozen states:

- LIGHT;
- DARK;
- default/fallback DARK;
- browser-local persistence;
- SYSTEM/AUTO OUT;
- Carder OUT.

Must remain a separate implementation candidate from Grid/List.

Sequence:

after CR-0001.4 QA-PASS + authorized integration.

Design route:

`routing/ROUTE-CR-0002-DQA-002.md`

## Release documentation gate

After all selected roadmap tranches — now including CR-0002 — are QA-PASS and integrated into `feature/workspace-v0.1`:

`documentation refresh → Release Hardening`

Requirement:

`control/PRE_HARDENING_DOCUMENTATION_REQUIREMENT.md`

## Guards

- main integration: NOT AUTHORIZED
- migration 009: NOT AUTHORIZED
- Tranche 2 implementation: NOT AUTHORIZED
- CR-0002 implementation: NOT AUTHORIZED
- README refresh execution now: NOT AUTHORIZED
