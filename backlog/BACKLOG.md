# BACKLOG

Current canonical CR ledger for the CR-0001 family:

`requests/CR-0001-v17.md`

CR-0002 canonical Scope:

`scopes/CR-0002_LIBRARY_DARK_THEME-v2.md`

## Complete / integrated

- CR-0001.1 / F-01 — INTEGRATED / PASS
- CR-0001.2 / F-02 — INTEGRATED / PASS
- CR-0001.5 / F-05 — INTEGRATED / PASS

## Tranche 1 — RUN 024 active

### Focused Editor / Variant UX Completion

- CR-0001.3 / F-03
- CR-0001.6 / F-06

Status:

`AUTHORIZED / DEVELOPMENT RESUMED`

Environment:

- ENV-003 — BLOCKED / Work-cloud shared browser transport
- ENV-004 — READY / GitHub-hosted Actions

Development:

- DEV-004 — BLOCKED / executor transport
- DEV-005 — BLOCKED / executor transport
- DEV-006 — ASSIGNED / GitHub authoring + Actions execution

Required resumption head:

`feature/workspace-run-024 @ 219ac252d50ae11b836a93baa20cc7f7d872367f`

No implementation candidate exists yet.

## Tranche 2 — sequenced

### CR-0001.4 / F-04 — Library Grid/List

`IN_SCOPE / SCOPE FROZEN / IMPLEMENTATION NOT AUTHORIZED`

Begins only after Tranche 1 QA-PASS + authorized integration.

## Tranche 3 — selected

### CR-0002 — Library Dark Theme

`IN_SCOPE / SCOPE FROZEN / DESIGN ROUTED / IMPLEMENTATION NOT AUTHORIZED`

- LIGHT + DARK;
- default/fallback DARK;
- browser-local persistence;
- SYSTEM/AUTO OUT;
- Carder OUT.

Must remain separate from Grid/List.

## Release documentation gate

After all selected roadmap tranches are QA-PASS and integrated into `feature/workspace-v0.1`:

`documentation refresh → Release Hardening`

## Guards

- main integration: NOT AUTHORIZED
- feature/workspace-v0.1 movement: NOT AUTHORIZED
- Tranche 2 implementation: NOT AUTHORIZED
- CR-0002 implementation: NOT AUTHORIZED
- migration 009: NOT AUTHORIZED
- README refresh execution now: NOT AUTHORIZED
