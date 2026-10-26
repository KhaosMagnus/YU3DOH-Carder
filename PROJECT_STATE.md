# PROJECT STATE

artifact_id: PROJECT-STATE
artifact_type: project_state
status: ACTIVE
protocol_version: 1.0

## Current code truth

- main = `54cc3aad246c89a29f2a18be63c539db68cae041`
- feature/workspace-v0.1 = `64cb5f4ca42348c6c403e64e0d61bdff8c32a281`
- feature/workspace-cr-0001-combined = `64cb5f4ca42348c6c403e64e0d61bdff8c32a281`
- feature/workspace-run-024 = `219ac252d50ae11b836a93baa20cc7f7d872367f`

## Project Control

Active instance:

`PC-002`

## Tranche 1 / RUN 024

Scope:

- CR-0001.3 / F-03
- CR-0001.6 / F-06

Status:

`AUTHORIZED / DEVELOPMENT RESUMED / DEV-006 ASSIGNED`

Historical Development:

- DEV-004 — IMPLEMENTATION BLOCKED / executor transport
- DEV-005 — IMPLEMENTATION BLOCKED / executor transport

Environment:

- ENV-003 — ENVIRONMENT BLOCKED
- ENV-004 — ENVIRONMENT READY

ENV-004 proven substrate:

`GitHub-hosted Actions`

Successful readiness:

- run `40289640257`;
- job `121461404019`;
- ops head `5aa54988eec0d8c07626f178677660f817640b2a`;
- Service tests `1088/1088 PASS`;
- Service + Library + Carder + Chromium;
- screenshots + DOM/accessibility + HTTP capture;
- exact clean custody + Canonical preservation.

RUN branch resumption head:

`feature/workspace-run-024 @ 219ac252d50ae11b836a93baa20cc7f7d872367f`

Current Development:

`DEVELOPMENT / DEV-006`

Authorization:

`runs/RUN-024_DEV-006_RESUMPTION_AUTHORIZATION.md`

Route:

`routing/ROUTE-RUN-024-RESUME-DEV-006.md`

Execution model:

`GitHub exact authoring/publication + GitHub-hosted Actions exact-SHA validation/evidence`

No implementation candidate exists until DEV-006 returns one.

After a READY FOR EXTERNAL QA Development return, Project Control must route the exact candidate to DQA-001.

## Tranche 2

CR-0001.4 / F-04 — Library Grid/List:

`IN_SCOPE / SCOPE FROZEN / SEQUENCED / IMPLEMENTATION NOT AUTHORIZED`

Required sequence:

after Tranche 1 External QA PASS + authorized integration.

## Tranche 3

CR-0002 — Library Dark Theme:

`IN_SCOPE / SCOPE FROZEN / SELECTED / DESIGN ROUTED / IMPLEMENTATION NOT AUTHORIZED`

Canonical Scope:

`scopes/CR-0002_LIBRARY_DARK_THEME-v2.md`

Frozen essentials:

- Library only;
- LIGHT + DARK;
- default/fallback DARK;
- browser-local persistence;
- SYSTEM/AUTO OUT;
- Carder OUT;
- client/UI only;
- no API/schema/persistence/migration change.

Sequence:

`CR-0001.4 validated + integrated → CR-0002 implementation`

Design assignment:

`DESIGN_QA / DQA-002`

DQA-001 remains reserved for RUN 024 exact-SHA External QA.

## Pre-Release-Hardening documentation gate

After all selected roadmap tranches, including CR-0002, are QA-PASS and integrated:

`documentation refresh → Release Hardening`

## Non-authorizations

- feature/workspace-v0.1 movement: NOT AUTHORIZED;
- main integration: NOT AUTHORIZED;
- RUN 025 creation: NOT AUTHORIZED;
- Tranche 2 implementation: NOT AUTHORIZED;
- CR-0002 implementation: NOT AUTHORIZED;
- documentation refresh execution now: NOT AUTHORIZED;
- migration 009: NOT AUTHORIZED.
