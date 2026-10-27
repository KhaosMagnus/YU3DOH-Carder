# PROJECT STATE

artifact_id: PROJECT-STATE
artifact_type: project_state
status: ACTIVE
protocol_version: 1.0

## Code refs

main: 54cc3aad246c89a29f2a18be63c539db68cae041
feature/workspace-v0.1: e07140d5a9555a17b7b2306a45625c14adfafc8e
feature/workspace-run-024: e07140d5a9555a17b7b2306a45625c14adfafc8e
feature/workspace-run-025: ABSENT / CREATION AUTHORIZED TO DEV-007

## Completed control milestones

RUN 024:
CLOSED / INTEGRATED / EXTERNAL QA PASS

PP-001:
COMPLETE / GENERIC PROTOCOL BASELINE FROZEN v1.0

ZIP-001:
COMPLETE / PACKAGE ACCEPTED FOR VALIDATION

## Current product work

Canonical CR ledger:
requests/CR-0001-v19.md

### CR-0001.4 / F-04 — Library Grid/List

Status:
RUN 025 AUTHORIZED / DEVELOPMENT ASSIGNED

Design:
COMPLETE / CONTRACT FROZEN

Design instance:
DQA-003

Frozen contract:
handoffs/CR-0001_4_LIBRARY_GRID_LIST_IMPLEMENTATION_HANDOFF.md

Design disposition:
control/CR-0001_4_DESIGN_DISPOSITION.md

RUN authorization:
runs/RUN-025_AUTHORIZATION.md

Development:
DEVELOPMENT / DEV-007

Active experimental execution session:
DEV-007/S01

Session record:
chats/sessions/DEV-007-S01.md

Session pilot:
control/RUN-025_SESSION_PILOT.md

Exact baseline:
feature/workspace-v0.1 @ e07140d5a9555a17b7b2306a45625c14adfafc8e

Authorized implementation target:
feature/workspace-run-025

Implementation status:
NOT YET DELIVERED

External QA:
NOT STARTED

Integration:
NOT AUTHORIZED

## Session pilot boundary

RUN 025 tests the experimental INSTANCE → SESSION model.

Stable accountable instance:
DEV-007

Initial session:
DEV-007/S01

The experiment does not amend Generic Project Control Protocol v1.0.

Session rollover alone must not create a new Development instance or RUN.

## CR-0002

Library Dark Theme:
IN_SCOPE / SCOPE FROZEN / DESIGN FROZEN / IMPLEMENTATION NOT AUTHORIZED

Required gate:
F-04 External QA PASS
→ authorized F-04 integration
→ post-F04 compatibility review
→ exact CR-0002 implementation baseline assignment
→ separate implementation authorization

## Guards

- feature/workspace-v0.1 must not move during Development.
- main must not move.
- migration 009 is not authorized.
- Development cannot self-integrate.
- CR-0002 implementation is not authorized.
- session-pilot observations cannot silently amend protocol v1.0.

Documentation refresh remains required before Release Hardening after all selected roadmap tranches are integrated.
