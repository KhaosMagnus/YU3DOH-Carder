# ROUTE — RUN 025 / EXTERNAL QA / DQA-004

status: FROZEN
protocol_version: 1.0

SOURCE:
PROJECT_CONTROL / PC-002

TARGET:
DESIGN_QA / DQA-004

MODE:
EXTERNAL QA

QA REQUEST:
validations/RUN-025/DQA-004_EXTERNAL_QA_REQUEST.md

DEVELOPMENT DISPOSITION:
runs/RUN-025_DEV-007_DELIVERY_DISPOSITION.md

FROZEN CONTRACT:
handoffs/CR-0001_4_LIBRARY_GRID_LIST_IMPLEMENTATION_HANDOFF.md

EXACT CANDIDATE:
feature/workspace-run-025
dd968ba05e579461962bbcced0e9cae3cd4c3d23

CANDIDATE BASE:
e07140d5a9555a17b7b2306a45625c14adfafc8e

MISSION:

Independently validate RUN 025 / CR-0001.4 F-04 against the frozen Design + QA contract.

Do not rely on inaccessible Development-local screenshots/report/ZIP as verified evidence.

Read completely:
- PROJECT_STATE.md
- validations/RUN-025/DQA-004_EXTERNAL_QA_REQUEST.md
- runs/RUN-025_DEV-007_DELIVERY_DISPOSITION.md
- handoffs/CR-0001_4_LIBRARY_GRID_LIST_IMPLEMENTATION_HANDOFF.md
- runs/RUN-025_AUTHORIZATION.md
- requests/CR-0001-v19.md
- roles/DESIGN_QA.md
- protocols/COMMUNICATION_PROTOCOL.md
- chats/instances/DQA-004.md

Verify current GitHub refs before QA-sensitive conclusions.

Required:
- exact candidate diff review;
- authoritative automated gate;
- F04-U01..F04-U18;
- F04-B01..F04-B26;
- disposable fixture;
- exact candidate custody;
- browser/accessibility/network/runtime evidence;
- scope/regression review.

If browser execution cannot be produced independently:
return INCONCLUSIVE/PARTIAL as appropriate and identify the exact evidence delta.
Do not convert Development claims into QA PASS.

EXPECTED OUTPUT:
validations/RUN-025/DQA-004_EXTERNAL_QA_REPORT.md

RETURN:
DESIGN_QA / DQA-004 → PROJECT_CONTROL / PC-002

NON-AUTHORIZATIONS:
- no integration;
- no product ref movement;
- no candidate mutation;
- no CR-0002 implementation;
- no frozen-contract amendment.
