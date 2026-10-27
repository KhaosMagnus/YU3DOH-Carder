# BACKLOG

Current canonical CR ledger for the CR-0001 family:

`requests/CR-0001-v17.md`

CR-0002 canonical Scope:

`scopes/CR-0002_LIBRARY_DARK_THEME-v2.md`

CR-0002 frozen Design contract:

`handoffs/CR-0002_LIBRARY_DARK_THEME_IMPLEMENTATION_HANDOFF.md`

## Complete / integrated

- CR-0001.1 / F-01 — INTEGRATED / PASS
- CR-0001.2 / F-02 — INTEGRATED / PASS
- CR-0001.5 / F-05 — INTEGRATED / PASS

## Tranche 1 — RUN 024 integration pending

### Focused Editor / Variant UX Completion

- CR-0001.3 / F-03
- CR-0001.6 / F-06

Exact candidate:

`feature/workspace-run-024 @ e07140d5a9555a17b7b2306a45625c14adfafc8e`

External QA:

`PASS`

Integration:

`AUTHORIZED / IA-002 ASSIGNED / NOT YET VERIFIED COMPLETE`

Target:

`feature/workspace-v0.1 @ 64cb5f4ca42348c6c403e64e0d61bdff8c32a281 → e07140d5a9555a17b7b2306a45625c14adfafc8e`

Method:

`FAST-FORWARD ONLY`

## Protocol portability

`PP-001 — QUEUED / NOT STARTED`

Queue record:

`control/PROTOCOL_PORTABILITY_QUEUE.md`

Activation condition:

verified RUN 024 integration closure by PROJECT_CONTROL / PC-002.

## Tranche 2 — sequenced

### CR-0001.4 / F-04 — Library Grid/List

`IN_SCOPE / SCOPE FROZEN / IMPLEMENTATION NOT AUTHORIZED`

Begins only after RUN 024 integration is verified and closed.

## Tranche 3 — selected

### CR-0002 — Library Dark Theme

`IN_SCOPE / SCOPE FROZEN / DESIGN FROZEN / IMPLEMENTATION NOT AUTHORIZED`

Implementation baseline:

`UNASSIGNED / POST-F04`

Mandatory gate:

`CR-0001.4 QA-PASS + integration → post-F04 compatibility review → baseline assignment`

## Release documentation gate

After all selected roadmap tranches are QA-PASS and integrated into `feature/workspace-v0.1`:

`documentation refresh → Release Hardening`

## Guards

- main integration: NOT AUTHORIZED
- Tranche 2 implementation: NOT AUTHORIZED until RUN 024 integration closes
- CR-0002 implementation: NOT AUTHORIZED
- PP-001 execution: NOT AUTHORIZED until RUN 024 integration closes
- migration 009: NOT AUTHORIZED
- README refresh execution now: NOT AUTHORIZED
