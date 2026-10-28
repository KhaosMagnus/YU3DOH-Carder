# RUN 025 — DQA-004 External QA Resumption Request

status: FROZEN
protocol_version: 1.0

source:
PROJECT_CONTROL / PC-002

target:
DESIGN_QA / DQA-004

mode:
EXTERNAL QA RESUMPTION / FINAL ADJUDICATION

run:
RUN 025

request:
CR-0001.4 / F-04 — Library Grid/List

exact_candidate:
feature/workspace-run-025 @ dd968ba05e579461962bbcced0e9cae3cd4c3d23

exact_baseline:
feature/workspace-v0.1 @ e07140d5a9555a17b7b2306a45625c14adfafc8e

prior_dqa_report:
validations/RUN-025/DQA-004_EXTERNAL_QA_REPORT.md

prior_dqa_result:
PARTIAL

prior_dqa_disposition:
runs/RUN-025_DQA-004_PARTIAL_DISPOSITION.md

environment_ready:
runs/RUN-025_ENV-005_READY_DISPOSITION.md

deployment_evidence:
validations/RUN-025/DEPLOY-005_VALIDATION_EVIDENCE.md

deployment_disposition:
runs/RUN-025_DEPLOY-005_EVIDENCE_DISPOSITION.md

frozen_contract:
handoffs/CR-0001_4_LIBRARY_GRID_LIST_IMPLEMENTATION_HANDOFF.md

gate_reconciliation:
control/RUN-025_GATE_RECONCILIATION.md

Mission:
Resume the SAME DQA-004 instance and issue the official final exact-SHA QA verdict for dd968ba05e579461962bbcced0e9cae3cd4c3d23.

Do not repeat work already independently established unless needed to resolve a contradiction.
Do not treat DEPLOY-005 EVIDENCE READY as QA PASS by itself.

Required adjudication inputs:
1. frozen F-04 Design + QA contract;
2. prior DQA-004 PARTIAL report;
3. gate reconciliation;
4. ENV-005 exact-substrate readiness;
5. DEPLOY-005 complete evidence bundle and report;
6. current GitHub custody of candidate/baseline/main.

DQA-004 must explicitly adjudicate:
- authoritative six-command gate;
- F04-U01..F04-U18 using prior DQA findings plus any relevant new evidence;
- F04-B01..F04-B26 using DEPLOY-005 evidence;
- scope/regression/architecture invariants;
- all explicit qualifications, especially:
  - six requestfailed GET /library/facets net::ERR_ABORTED events;
  - baseline-reproduced favicon/React scrollLocker warnings;
  - two deliberate 503 responses used by the error-state case;
  - DOM-synthetic event dispatch behind the modal Drawer for state-preservation cases;
  - first incomplete DEPLOY attempt with no acceptance credit;
  - any distinction between proving state preservation and ordinary pointer reachability.

Official final result must be exactly one of:
PASS
FAIL
REGRESSION
INCONCLUSIVE

Do not return PARTIAL merely because the evidence was produced by DEPLOYMENT_VALIDATION if the evidence is independently sufficient.
Return INCONCLUSIVE only if a material acceptance requirement still cannot be adjudicated.

If PASS:
state clearly that QA PASS does NOT itself authorize integration.

If FAIL/REGRESSION:
identify exact failing cases, expected/observed behavior, evidence references and whether Development correction is required.

If INCONCLUSIVE:
identify the exact remaining evidence delta and why the existing durable package is insufficient.

Required publication:
validations/RUN-025/DQA-004_EXTERNAL_QA_FINAL_REPORT.md

Candidate mutation during adjudication:
FORBIDDEN

Integration:
NOT AUTHORIZED

CR-0002 implementation:
NOT AUTHORIZED

Return:
DESIGN_QA / DQA-004 → PROJECT_CONTROL / PC-002

AUTO-RETURN:
When the final verdict is reached, proactively emit the complete return envelope without waiting for an Owner prompt.
