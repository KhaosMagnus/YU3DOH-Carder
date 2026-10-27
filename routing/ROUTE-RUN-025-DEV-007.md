# ROUTE — RUN 025 / DEVELOPMENT / DEV-007

status: FROZEN
protocol_version: 1.0

SOURCE:
PROJECT_CONTROL / PC-002

TARGET:
DEVELOPMENT / DEV-007

INITIAL SESSION:
DEV-007/S01

MODE:
IMPLEMENTATION

RUN AUTHORIZATION:
runs/RUN-025_AUTHORIZATION.md

SESSION PILOT:
control/RUN-025_SESSION_PILOT.md

FROZEN IMPLEMENTATION CONTRACT:
handoffs/CR-0001_4_LIBRARY_GRID_LIST_IMPLEMENTATION_HANDOFF.md

CANONICAL REQUEST:
requests/CR-0001-v18.md

EXACT REQUIRED BASELINE:
feature/workspace-v0.1
e07140d5a9555a17b7b2306a45625c14adfafc8e

AUTHORIZED IMPLEMENTATION TARGET:
feature/workspace-run-025

REQUIRED TARGET START:
e07140d5a9555a17b7b2306a45625c14adfafc8e

MISSION:

Implement only CR-0001.4 / F-04 Library Grid/List under the frozen Design + QA contract.

Before any product mutation verify:
- control authority and frozen contract;
- feature/workspace-v0.1 exact baseline;
- main exact protected reference;
- feature/workspace-run-025 is absent;
- clean working state and allowed path boundary.

If any required preflight differs:
IMPLEMENTATION BLOCKED
and return to PROJECT_CONTROL / PC-002.

Required final automated gate:
- yarn compile
- yarn build
- yarn test:sc
- yarn test:library
- yarn --cwd workspace-server compile
- yarn --cwd workspace-server test

Required deterministic evidence:
F04-U01..F04-U18

Required browser evidence:
F04-B01..F04-B26

Use disposable fixtures.
Owner-manual QA is not required.

Expected output:
implementations/RUN-025_IMPLEMENTATION_REPORT.md

Development must include the RUN-025 session history and pilot observations in its final report.

Do not:
- move feature/workspace-v0.1;
- move main;
- self-integrate;
- implement CR-0002;
- create migration 009;
- alter API/domain/persistence/Carder semantics;
- rewrite frozen control artifacts.

Return:
DEVELOPMENT / DEV-007 → PROJECT_CONTROL / PC-002
