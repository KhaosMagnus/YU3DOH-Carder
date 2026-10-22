---
artifact_id: ROUTE-P5-CANDIDATE-A-DEPLOY-001
artifact_type: routing_decision
status: FROZEN
protocol_version: "1.0"
source_role: PROJECT_CONTROL
source_instance: PC-001
target_role: DEPLOYMENT_VALIDATION
target_instance: DEPLOY-001
control_parent_sha: a9c3ed634dcd5edd9066c806e973c2d1ce605a31
code_baseline:
  branch: fix/workspace-rc-normal-subtype-icon
  sha: 61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c
related_requests:
  - CR-0001.1
  - CR-0001.5
---

# Route — Candidate A bounded operational evidence

## Authority

QA report:
`validations/P5-CANDIDATE-A-001/DESIGN_QA_REPORT.md`

Frozen evidence request:
`validations/P5-CANDIDATE-A-001/EVIDENCE_REQUEST.md`

Exact candidate:
`fix/workspace-rc-normal-subtype-icon @ 61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c`

## Target

`DEPLOYMENT_VALIDATION / DEPLOY-001`

## Action

Execute only:
- A-OP-01
- A-OP-02
- A-OP-03
- A-OP-04
- A-OP-05
- A-OP-06

using the exact steps/evidence requirements in the frozen evidence request.

Do not repeat unrelated validation.

Do not request owner-manual testing.

## Required output

Publish a new Deployment Validation evidence artifact under:

`validations/P5-CANDIDATE-A-001/`

without modifying the QA report or evidence request.

Final operational status:
- `EVIDENCE READY`, or
- `VALIDATION BLOCKED`.

If a requested case is UNSATISFACTORY but evidence was successfully collected, use `EVIDENCE READY` and preserve the mismatch for DQA classification.

## Return route

`DESIGN_QA / DQA-001`

DQA-001 must issue a superseding final exact-SHA QA disposition for Candidate A after consuming the evidence.

## Prohibitions

- no code edits;
- no code commits;
- no branch integration;
- no Candidate B combination;
- no RUN 024;
- no main integration.
