# RUN 025 — ENV-005 Environment Readiness Request

status: FROZEN
protocol_version: 1.0

source:
PROJECT_CONTROL / PC-002

target:
ENVIRONMENT_READINESS / ENV-005

run:
RUN 025

candidate:
feature/workspace-run-025 @ dd968ba05e579461962bbcced0e9cae3cd4c3d23

baseline:
feature/workspace-v0.1 @ e07140d5a9555a17b7b2306a45625c14adfafc8e

qa_partial:
runs/RUN-025_DQA-004_PARTIAL_DISPOSITION.md

gate_reconciliation:
control/RUN-025_GATE_RECONCILIATION.md

historical_ready_reference:
validations/RUN-024/ENV-004_ENVIRONMENT_READINESS_REPORT.md

preferred_substrate:
GitHub-hosted Actions

Purpose:
Prove a current exact-SHA substrate capable of executing the RUN 025 candidate with the authoritative six-command gate, tsx IPC, real Chromium, disposable Workspace Service, and durable browser/network evidence capture.

This is environment readiness only.
It provides no F04-B acceptance credit and no QA PASS.

Required readiness proof:

1. Exact custody
- detached or otherwise exact checkout at dd968ba05e579461962bbcced0e9cae3cd4c3d23;
- remote feature/workspace-run-025 still equals that SHA;
- baseline merge-base equals e07140d5a9555a17b7b2306a45625c14adfafc8e;
- clean tree before and after;
- protected refs unchanged.

2. Frozen installs
- yarn install --frozen-lockfile --non-interactive
- yarn --cwd workspace-server install --frozen-lockfile --non-interactive

3. Authoritative six-command gate capability
- yarn compile
- yarn build
- yarn test:sc
- yarn test:library
- yarn --cwd workspace-server compile
- yarn --cwd workspace-server test

All six must exit 0 for ENVIRONMENT READY.
Do not substitute root yarn test.

4. Browser substrate
Prove in one runner/network namespace:
- real Workspace Service;
- real Library;
- Chromium/Playwright-compatible browser;
- browser reaches the local Library;
- screenshot capture;
- DOM/accessibility capture;
- HTTP request/response interception;
- page/console error capture;
- machine-readable JSON evidence writing;
- disposable fixture cleanup.

Use a neutral readiness smoke only.
Do NOT execute or claim F04-B01..B26 as acceptance cases during ENV-005.

5. Durable evidence
Publish:
validations/RUN-025/ENV-005_ENVIRONMENT_READINESS_REPORT.md

Record:
- Actions run/job IDs;
- operational branch/head;
- exact candidate;
- environment/tool/browser versions;
- command results;
- screenshot/network/capture proof;
- artifact ID/digest or equivalent durable reference;
- final custody proof.

Operational branch:
ENV-005 may create/use a dedicated operational branch such as:
ops/run-025-env-005-actions

The operational harness must remain separate from product branches and must not be merged into feature/workspace-run-025, feature/workspace-v0.1 or main.

Historical ENV-004 harness may be adapted, but historical readiness itself is not accepted as current readiness.

Final result:
ENVIRONMENT READY
or
ENVIRONMENT BLOCKED

Non-authorizations:
- no product code mutation;
- no candidate ref mutation;
- no F04-B acceptance verdict;
- no QA PASS;
- no integration;
- no CR-0002 work.
