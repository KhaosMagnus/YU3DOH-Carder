# CHAT INSTANCE — DEPLOY-002

role: DEPLOYMENT_VALIDATION
status: ACTIVE — INDEPENDENT REPROVISION
protocol_version: 1.0

birth_reason:
  DEPLOY-001 was unable to execute Candidate A because of environment/execution-access limitations.

continuation_of:
  DEPLOY-001 for Candidate A evidence mission only

assignment:
  candidate_branch: fix/workspace-rc-normal-subtype-icon
  candidate_sha: 61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c
  route: routing/ROUTE-P5-CANDIDATE-A-DEPLOY-002.md
  frozen_evidence_request: validations/P5-CANDIDATE-A-001/EVIDENCE_REQUEST.md
  cases:
    - A-OP-01
    - A-OP-02
    - A-OP-03
    - A-OP-04
    - A-OP-05
    - A-OP-06

environment_requirements:
  - actual .git checkout
  - exact candidate HEAD
  - clean working tree
  - Node/Yarn dependencies
  - executable browser
  - disposable Workspace
  - running Workspace Service + Library + Carder
  - screenshots
  - actual Carder write-back request/response capture
  - Canonical/provenance before/after evidence

temporary_harness:
  allowed outside tracked Candidate A tree only; must not change candidate bytes or working-tree cleanliness.

expected_return:
  EVIDENCE READY or VALIDATION BLOCKED.

next_expected_role:
  DQA-001 after EVIDENCE READY.
