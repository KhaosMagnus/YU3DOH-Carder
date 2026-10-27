# ROUTE — RUN 025 / ENVIRONMENT_READINESS / ENV-005

status: FROZEN
protocol_version: 1.0

SOURCE:
PROJECT_CONTROL / PC-002

TARGET:
ENVIRONMENT_READINESS / ENV-005

MODE:
ENVIRONMENT READINESS

PRIMARY REQUEST:
validations/RUN-025/ENV-005_ENVIRONMENT_READINESS_REQUEST.md

DQA PARTIAL DISPOSITION:
runs/RUN-025_DQA-004_PARTIAL_DISPOSITION.md

GATE RECONCILIATION:
control/RUN-025_GATE_RECONCILIATION.md

HISTORICAL SUBSTRATE REFERENCE:
validations/RUN-024/ENV-004_ENVIRONMENT_READINESS_REPORT.md

EXACT CANDIDATE:
feature/workspace-run-025
dd968ba05e579461962bbcced0e9cae3cd4c3d23

EXACT BASELINE:
feature/workspace-v0.1
e07140d5a9555a17b7b2306a45625c14adfafc8e

MISSION:

Prove a Chromium-capable, tsx-compatible, durable-evidence substrate for the exact RUN 025 candidate.

Preferred substrate:
GitHub-hosted Actions.

Use a neutral readiness smoke only.

Do NOT execute F04-B01..B26 as acceptance cases.

Required literal validation commands for readiness capability:

yarn compile
yarn build
yarn test:sc
yarn test:library
yarn --cwd workspace-server compile
yarn --cwd workspace-server test

There is NO required root yarn test command.

Required browser readiness:
- real Service;
- real Library;
- Chromium;
- screenshot;
- DOM/accessibility;
- request/response capture;
- page/console error capture;
- JSON evidence output;
- disposable fixture cleanup;
- durable artifact publication.

Expected output:
validations/RUN-025/ENV-005_ENVIRONMENT_READINESS_REPORT.md

Final status:
ENVIRONMENT READY
or
ENVIRONMENT BLOCKED

If READY:
return to PROJECT_CONTROL / PC-002.
Project Control may then route DEPLOYMENT_VALIDATION / DEPLOY-005 to execute the missing acceptance evidence.

Non-authorizations:
- no product mutation;
- no candidate mutation;
- no QA verdict;
- no integration;
- no CR-0002 implementation.
