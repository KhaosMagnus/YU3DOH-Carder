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

`AUTHORIZED / IMPLEMENTATION NOT COMPLETED / ACTIONS READINESS ROUTED`

Development attempts:

- DEV-004 — IMPLEMENTATION BLOCKED / executor transport
- DEV-005 — IMPLEMENTATION BLOCKED / executor transport

Environment:

- ENV-003 — ENVIRONMENT BLOCKED
- ENV-004 — ASSIGNED / GitHub-hosted Actions readiness

RUN branch:

`feature/workspace-run-024 @ 219ac252d50ae11b836a93baa20cc7f7d872367f`

No implementation candidate exists.

No successor Development is authorized until ENV-004 returns READY.

## Tranche 2

CR-0001.4 / F-04 — Library Grid/List:

`IN_SCOPE / SCOPE FROZEN / SEQUENCED / IMPLEMENTATION NOT AUTHORIZED`

Required sequence:

after Tranche 1 QA-PASS + authorized integration.

## Tranche 3

CR-0002 — Library Dark Theme:

`IN_SCOPE / SCOPE FROZEN / SELECTED / DESIGN ROUTED / IMPLEMENTATION NOT AUTHORIZED`

Canonical Scope:

`scopes/CR-0002_LIBRARY_DARK_THEME-v2.md`

Project Control disposition:

`control/CR-0002_SCOPE_DISPOSITION.md`

Frozen essentials:

- Library only;
- LIGHT + DARK;
- default/fallback DARK;
- valid stored LIGHT/DARK preserved;
- browser-local persistence;
- SYSTEM/AUTO OUT;
- Carder OUT;
- client/UI only;
- no API/schema/persistence/migration change;
- accessibility required in both themes.

Sequence:

`CR-0001.4 validated + integrated → CR-0002 implementation`

CR-0002 and Grid/List must not share one implementation candidate.

Design assignment:

`DESIGN_QA / DQA-002`

Route:

`routing/ROUTE-CR-0002-DQA-002.md`

DQA-001 remains available for exact-SHA RUN 024 External QA.

## Pre-Release-Hardening documentation gate

After all selected roadmap tranches, including CR-0002, are QA-PASS and integrated:

`documentation refresh → Release Hardening`

Requirement:

`control/PRE_HARDENING_DOCUMENTATION_REQUIREMENT.md`

## Non-authorizations

- feature/workspace-v0.1 movement: NOT AUTHORIZED;
- main integration: NOT AUTHORIZED;
- new implementation RUN for CR-0002: NOT AUTHORIZED;
- RUN 024 scope change: NOT AUTHORIZED;
- CR-0001.4 implementation: NOT AUTHORIZED;
- CR-0002 implementation: NOT AUTHORIZED;
- documentation refresh execution now: NOT AUTHORIZED;
- migration 009: NOT AUTHORIZED.
