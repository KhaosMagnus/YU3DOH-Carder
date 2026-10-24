# CHAT INSTANCE — DEPLOY-003

role: DEPLOYMENT_VALIDATION
status: COMPLETE — EVIDENCE READY
protocol_version: 1.0

candidate_sha:
  61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c

assignment:
  cases:
    - A-OP-01
    - A-OP-02
    - A-OP-03
    - A-OP-04
    - A-OP-05
    - A-OP-06

result:
  cases_executed: 6
  satisfactory: 6
  unsatisfactory: 0
  final_status: EVIDENCE READY
  evidence_artifact: validations/P5-CANDIDATE-A-001/DEPLOY-003_VALIDATION_EVIDENCE.md
  publication_control_sha: dd7e60d160241530826b35f429848b08778223ae

operational_run:
  actions_run_id: 40076376323
  actions_job_id: 120820475829
  github_artifact_id: 12552909783
  digest: sha256:071fe5f35ab7e64c8bb2ff34950505f58ef4f6f2e2454301fb8f74ac366e46e1

candidate_integrity:
  exact_sha_before_after: true
  clean_before_after: true

next_expected_role:
  DQA-001
