# RUN 025 — Implementation Authorization

status: FROZEN
protocol_version: 1.0

source: PROJECT_CONTROL / PC-002
target: DEVELOPMENT / DEV-007

title:
Library Browse Grid / List Modes

request:
CR-0001.4 / F-04

frozen_contract:
handoffs/CR-0001_4_LIBRARY_GRID_LIST_IMPLEMENTATION_HANDOFF.md

exact_baseline:
feature/workspace-v0.1 @ e07140d5a9555a17b7b2306a45625c14adfafc8e

authorized_branch:
feature/workspace-run-025

required_branch_start:
e07140d5a9555a17b7b2306a45625c14adfafc8e

preflight:
- feature/workspace-v0.1 must equal e07140d5a9555a17b7b2306a45625c14adfafc8e
- main must equal 54cc3aad246c89a29f2a18be63c539db68cae041
- feature/workspace-run-025 must be absent

Mismatch:
IMPLEMENTATION BLOCKED / return to PROJECT_CONTROL / PC-002.

Authorized scope:
Implement only the frozen F-04 client/UI presentation contract.

Required automated gate:
- yarn compile
- yarn build
- yarn test:sc
- yarn test:library
- yarn --cwd workspace-server compile
- yarn --cwd workspace-server test

Required focused evidence:
F04-U01 through F04-U18.

Required browser/visual/accessibility evidence:
F04-B01 through F04-B26.

Owner-manual QA:
NOT REQUIRED.

Required output:
implementations/RUN-025_IMPLEMENTATION_REPORT.md

Final Development status:
READY FOR EXTERNAL QA
or
IMPLEMENTATION BLOCKED

Architecture invariants:
- database schema 8
- Workspace format 1
- migrations 001–008
- migration 009 absent/not authorized
- no new server fields
- no API/domain/persistence change
- no Carder protocol change

STOP / SCOPE REOPEN REQUIRED if implementation materially requires any forbidden architecture or semantic expansion listed by the frozen F-04 contract.

Non-authorizations:
- do not modify feature/workspace-v0.1
- do not modify main
- do not self-integrate
- do not implement CR-0002
- do not broaden frozen F-04 scope

RUN 025 also participates in the separately frozen experimental session pilot:
control/RUN-025_SESSION_PILOT.md

The pilot does not amend Generic Project Control Protocol v1.0.
