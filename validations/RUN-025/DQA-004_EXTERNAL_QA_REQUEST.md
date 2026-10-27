# RUN 025 — External QA Request

status: FROZEN
protocol_version: 1.0

source:
PROJECT_CONTROL / PC-002

target:
DESIGN_QA / DQA-004

mode:
EXTERNAL QA

run:
RUN 025

request:
CR-0001.4 / F-04 — Library Grid/List

frozen_contract:
handoffs/CR-0001_4_LIBRARY_GRID_LIST_IMPLEMENTATION_HANDOFF.md

development_disposition:
runs/RUN-025_DEV-007_DELIVERY_DISPOSITION.md

exact_candidate:
feature/workspace-run-025 @ dd968ba05e579461962bbcced0e9cae3cd4c3d23

exact_baseline:
feature/workspace-v0.1 @ e07140d5a9555a17b7b2306a45625c14adfafc8e

External QA must treat the Development-local delivery ZIP/report as NON-TRANSFERRED and unavailable.

Therefore DQA-004 must independently:
1. verify candidate custody and exact baseline relationship;
2. inspect the full candidate diff;
3. verify changed-file scope and package.json test-only change;
4. run the authoritative automated gate;
5. verify F04-U01..F04-U18;
6. reproduce F04-B01..F04-B26 using disposable fixtures;
7. inspect runtime/console/network evidence;
8. determine evidence sufficiency under the frozen contract;
9. issue an official exact-SHA verdict.

Official verdict must be one of:
PASS
PARTIAL
FAIL
REGRESSION
INCONCLUSIVE

If the available QA substrate cannot execute required browser evidence, do not infer PASS.
Return the missing evidence delta to Project Control for environment/deployment-validation routing.

No Owner-manual QA is required.

QA PASS does not authorize integration.

CR-0002 implementation remains unauthorized.
