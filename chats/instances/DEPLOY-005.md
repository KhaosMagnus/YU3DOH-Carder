# CHAT INSTANCE — DEPLOY-005

role: DEPLOYMENT_VALIDATION
status: ASSIGNED / OPERATIONAL VALIDATION
protocol_version: 1.0

assignment:
  RUN 025 — CR-0001.4 / F-04 missing evidence production

request:
  validations/RUN-025/DEPLOY-005_VALIDATION_REQUEST.md

route:
  routing/ROUTE-RUN-025-DEPLOY-005.md

environment_ready:
  runs/RUN-025_ENV-005_READY_DISPOSITION.md

dqa_status:
  DQA-004 PARTIAL / AWAITING EVIDENCE

exact_candidate:
  feature/workspace-run-025 @ dd968ba05e579461962bbcced0e9cae3cd4c3d23

exact_baseline:
  feature/workspace-v0.1 @ e07140d5a9555a17b7b2306a45625c14adfafc8e

expected_output:
  validations/RUN-025/DEPLOY-005_VALIDATION_EVIDENCE.md

evidence_bundle:
  validations/RUN-025/DEPLOY-005/

official_qa_authority:
  DESIGN_QA / DQA-004

product_changes_authorized:
  NO

integration_authorized:
  NO

return_to:
  PROJECT_CONTROL / PC-002
