# CHAT INSTANCE — DEPLOY-004

role: DEPLOYMENT_VALIDATION
status: COMPLETE — EVIDENCE READY
protocol_version: 1.0

candidate_branch:
  feature/workspace-cr-0001-combined

candidate_sha:
  64cb5f4ca42348c6c403e64e0d61bdff8c32a281

cases:
  - C-OP-01
  - C-OP-02
  - C-OP-03
  - C-OP-04
  - C-OP-05
  - C-OP-06

result:
  cases_executed: 6
  satisfactory: 6
  unsatisfactory: 0
  final_status: EVIDENCE READY
  evidence_artifact: validations/CR-0001-COMBINED-001/DEPLOY-004_VALIDATION_EVIDENCE.md

operational_run:
  actions_run_id: 40079213445
  actions_job_id: 120829045260
  github_artifact_id: 12553963296
  digest: sha256:d0b7cf8cc1e1a6c3de791d42f253e5489be8c2063dc9332eb2dfca41cf98d773

candidate_integrity:
  exact_sha_before_after: true
  clean_before_after: true

final_external_qa:
  PASS

next_expected_role:
  PROJECT_CONTROL / OWNER integration decision.
