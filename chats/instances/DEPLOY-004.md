# CHAT INSTANCE — DEPLOY-004

role: DEPLOYMENT_VALIDATION
status: READY TO START — COMBINED CANDIDATE
protocol_version: 1.0

birth_reason:
  Combined candidate External QA is PARTIAL only because exact-SHA Candidate-A operational/visual evidence remains pending.

assignment:
  route: routing/ROUTE-CR-0001-COMBINED-DEPLOY-004.md
  evidence_request: validations/CR-0001-COMBINED-001/EVIDENCE_REQUEST.md
  candidate_branch: feature/workspace-cr-0001-combined
  candidate_sha: 64cb5f4ca42348c6c403e64e0d61bdff8c32a281
  cases:
    - C-OP-01
    - C-OP-02
    - C-OP-03
    - C-OP-04
    - C-OP-05
    - C-OP-06
  operational_branch: ops/cr-0001-combined-deploy-004-actions
  operational_branch_initial_sha: 22d89b3bb4c6e15b1dcc56eff84d71093e74947b
  substrate: GitHub-hosted Actions / proven

expected_return:
  EVIDENCE READY or VALIDATION BLOCKED.

next_expected_role:
  DQA-001.
