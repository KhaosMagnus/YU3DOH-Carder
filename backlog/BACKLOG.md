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
- CR-0001.3 / F-03 — INTEGRATED / PASS
- CR-0001.5 / F-05 — INTEGRATED / PASS
- CR-0001.6 / F-06 — INTEGRATED / PASS

RUN 024:
CLOSED / INTEGRATED / EXTERNAL QA PASS

Integrated baseline:
`feature/workspace-v0.1 @ e07140d5a9555a17b7b2306a45625c14adfafc8e`

## Protocol portability

`PP-001 — COMPLETE`

Outputs:

- `protocols/PROJECT_CONTROL_PORTABILITY_REVIEW-v1.0.md`
- `protocols/GENERIC_PROJECT_CONTROL_PROTOCOL-v1.0.md`

Generic protocol baseline:
`FROZEN v1.0`

## Bootstrap package

`SIP-001 — SUPERSEDED BEFORE OUTPUT`

Reason:
incorrect interpretation of ZIP as SIP.

`ZIP-001 — ASSIGNED / PACKAGE ASSEMBLY`

Authorization:
`control/ZIP-001_AUTHORIZATION.md`

Route:
`routing/ROUTE-ZIP-001.md`

Required archive:
`bootstrap/dist/PROJECT_CONTROL_BOOTSTRAP-v1.0.zip`

Required digest:
`bootstrap/dist/PROJECT_CONTROL_BOOTSTRAP-v1.0.zip.sha256`

Required package report:
`bootstrap/ZIP-001_PACKAGE_REPORT.md`

ZIP-001 creates the reusable package only. It does not adopt it into any project.

## Tranche 2 — sequenced

### CR-0001.4 / F-04 — Library Grid/List

`IN_SCOPE / SCOPE FROZEN / NOT STARTED / IMPLEMENTATION NOT AUTHORIZED`

ZIP-001 does not block or authorize Tranche 2.

## Tranche 3 — selected

### CR-0002 — Library Dark Theme

`IN_SCOPE / SCOPE FROZEN / DESIGN FROZEN / NOT STARTED / IMPLEMENTATION NOT AUTHORIZED`

Implementation baseline remains:

`UNASSIGNED / POST-F04`

Mandatory gate:

`CR-0001.4 QA-PASS + integration → post-F04 compatibility review → baseline assignment`

## Release documentation gate

After all selected roadmap tranches are QA-PASS and integrated into `feature/workspace-v0.1`:

`documentation refresh → Release Hardening`
