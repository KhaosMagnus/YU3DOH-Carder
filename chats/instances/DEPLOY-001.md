# CHAT INSTANCE — DEPLOY-001

role: DEPLOYMENT_VALIDATION
status: ACTIVE — BOUNDED DELTA
protocol_version: 1.0

assignment:
  candidate_branch: fix/workspace-rc-normal-subtype-icon
  candidate_sha: 61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c
  qa_request: validations/P5-CANDIDATE-A-001/EVIDENCE_REQUEST.md
  cases:
    - A-OP-01
    - A-OP-02
    - A-OP-03
    - A-OP-04
    - A-OP-05
    - A-OP-06

scope:
  independent visual/operational delta evidence only.

expected_return:
  EVIDENCE READY or VALIDATION BLOCKED, followed by routing back to DQA-001.

prohibitions:
  - no code modification
  - no unrelated retest
  - no Candidate B combination
  - no integration
  - no RUN 024
