---
artifact_id: ROUTE-P5-CANDIDATE-A-DEPLOY-003
artifact_type: routing_decision
status: FROZEN
protocol_version: "1.0"
source_role: PROJECT_CONTROL
source_instance: PC-001
target_role: DEPLOYMENT_VALIDATION
target_instance: DEPLOY-003
control_parent_sha: ebff454113a9fc1db4ebd57bd85dfacfd659dcd2
candidate_branch: fix/workspace-rc-normal-subtype-icon
candidate_sha: 61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c
ops_branch: ops/candidate-a-deploy-003-actions
source_artifacts:
  - validations/P5-CANDIDATE-A-001/EVIDENCE_REQUEST.md
  - validations/P5-CANDIDATE-A-001/ENV-002_ENVIRONMENT_READINESS_REPORT.md
---

# Route — Candidate A DEPLOY-003 on proven GitHub Actions substrate

## Trigger

ENV-002 returned:

`ENVIRONMENT READY`

The DQA prerequisite for a materially different proven execution substrate is satisfied.

Readiness authority:

`validations/P5-CANDIDATE-A-001/ENV-002_ENVIRONMENT_READINESS_REPORT.md`

Readiness publication CONTROL SHA:

`ebff454113a9fc1db4ebd57bd85dfacfd659dcd2`

Proven Actions run:

`40073048304`

Artifact:

`12551219292`

Digest:

`sha256:ebf6f23e672f877c39b1f9e96e5b90f27b9cbe5f63a5b25531572a2bedf85f4b`

## Target

`DEPLOYMENT_VALIDATION / DEPLOY-003`

## Exact candidate

`fix/workspace-rc-normal-subtype-icon @ 61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c`

Candidate A is immutable for this mission.

## Proven substrate

Use GitHub-hosted Actions using the established same-runner topology:

real exact-SHA Git checkout
+
real Workspace Service
+
real Vite Library/Carder
+
real Chromium/Playwright
+
external artifact capture.

Do not use the restricted Work/chat/container substrates that blocked DEPLOY-001 and DEPLOY-002.

## Operational branch

Provisioned:

`ops/candidate-a-deploy-003-actions`

Initial branch point:

`bc52a568719e30429c4f517b8c49c1ad05f378ef`

This branch inherits the successful ENV-002 operational harness/workflow only.

DEPLOY-003 MAY modify/add validation workflow/harness files on this `ops/` branch solely to execute the frozen evidence request.

Such commits are validation infrastructure, not product implementation.

Candidate A itself must always be checked out separately at exact SHA and remain clean.

## Mandatory preflight

Every behavioral Actions run must prove:

- Candidate checkout contains `.git`;
- remote Candidate branch points to `61503c6...`;
- local Candidate HEAD = `61503c6...`;
- `git status --porcelain` is empty before cases;
- exact frozen dependency installs;
- real Chromium available;
- final Candidate HEAD still exact;
- final Candidate status/diff/cached diff clean.

Any mismatch:
`VALIDATION BLOCKED`.

## Behavioral scope

Execute ONLY:

- `A-OP-01`
- `A-OP-02`
- `A-OP-03`
- `A-OP-04`
- `A-OP-05`
- `A-OP-06`

Normative behavior and evidence are exclusively those frozen in:

`validations/P5-CANDIDATE-A-001/EVIDENCE_REQUEST.md`

Do not redesign, weaken or broaden the contract.

## Evidence requirements

Preserve for each case:

- CASE
- EXPECTED
- OBSERVED
- exact Candidate SHA
- STEPS
- screenshot/reference where required
- prepared/working projection evidence
- actual HTTP request/response evidence where required
- Canonical confirmation/revision/provenance before/after where required
- RESULT = SATISFACTORY or UNSATISFACTORY

A-OP-05 requires actual acknowledged Carder write-back, not a readiness simulation.

Use only disposable Workspace data.

## Final operational state

Return:

`EVIDENCE READY`

when all six cases were actually executed and the required evidence was captured, even if one or more cases are UNSATISFACTORY.

Return:

`VALIDATION BLOCKED`

only when exact-SHA execution or required evidence acquisition cannot be completed.

## Publication

Publish a NEW artifact under:

`validations/P5-CANDIDATE-A-001/`

Recommended name:

`DEPLOY-003_VALIDATION_EVIDENCE.md`

Do not modify any previous QA, Deployment or Environment Readiness artifact.

After publication, reread it from GitHub and return an exact Transfer Envelope to:

`DESIGN_QA / DQA-001`

DQA-001 owns the superseding final Candidate A disposition.

## Prohibitions

- no Candidate A source edits;
- no Candidate A commits;
- no Development re-entry unless evidence demonstrates a product defect;
- no Candidate B combination;
- no RUN 024;
- no feature/workspace-v0.1 integration;
- no main integration.
