---
artifact_id: ROUTE-P5-CANDIDATE-A-DEPLOY-002
artifact_type: routing_decision
status: FROZEN
protocol_version: "1.0"
source_role: PROJECT_CONTROL
source_instance: PC-001
target_role: DEPLOYMENT_VALIDATION
target_instance: DEPLOY-002
control_parent_sha: 79cde83b7230faf852d7a846777074f5df81dcd4
code_baseline:
  branch: fix/workspace-rc-normal-subtype-icon
  sha: 61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c
related_requests:
  - CR-0001.1
  - CR-0001.5
source_artifacts:
  - validations/P5-CANDIDATE-A-001/EVIDENCE_REQUEST.md
  - validations/P5-CANDIDATE-A-001/DEPLOYMENT_VALIDATION_EVIDENCE.md
  - validations/P5-CANDIDATE-A-001/DESIGN_QA_BLOCKER_REVIEW.md
---

# Route — Candidate A independent operational reprovision

## Reason

DEPLOY-001 returned VALIDATION BLOCKED because its execution environment could not materialize or run the exact candidate.

DQA-001 classified the blocker as:

ENVIRONMENT / EXECUTION ACCESS

No product defect or regression was established.

The frozen evidence request remains unchanged.

## New target

DEPLOYMENT_VALIDATION / DEPLOY-002

DEPLOY-002 must be an independent operational environment capable of executing the real exact candidate.

## Mandatory exact-SHA preflight

Before any A-OP case:

git rev-parse HEAD
=
61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c

git status --porcelain
=
empty / clean

The environment must have:
- actual repository checkout including .git;
- Node/Yarn dependencies required by the candidate;
- executable Chromium or equivalent supported browser;
- disposable Workspace;
- Workspace Service + Library + Carder running from the exact candidate;
- screenshot capture;
- actual Carder write-back request/response capture;
- authoritative Canonical/provenance before/after observation.

If exact-SHA preflight cannot be established, return VALIDATION BLOCKED without executing behavioral cases.

## Temporary harness authorization

A temporary evidence harness MAY be created outside the tracked Candidate A tree.

Conditions:
- Candidate A working tree remains clean;
- Candidate A bytes remain unchanged;
- harness drives the real exact-SHA application;
- renderer/write-back behavior is not replaced by mocks;
- exact SHA is recorded in evidence;
- temporary harness is not committed into Candidate A.

## Required cases

Execute only:
- A-OP-01
- A-OP-02
- A-OP-03
- A-OP-04
- A-OP-05
- A-OP-06

The normative steps/expected evidence are exactly those in:
validations/P5-CANDIDATE-A-001/EVIDENCE_REQUEST.md

Do not redesign or reinterpret the cases.

## Required output

Publish a NEW evidence artifact under:
validations/P5-CANDIDATE-A-001/

Do not modify prior Deployment or QA artifacts.

For each case record:
CASE
EXPECTED
OBSERVED
SHA
STEPS
EVIDENCE
RESULT

Case result:
SATISFACTORY or UNSATISFACTORY.

Final status:
EVIDENCE READY
when the six requested cases were actually executed and evidence collected, even if one or more observations are UNSATISFACTORY.

Use:
VALIDATION BLOCKED
only when the exact candidate cannot be validly executed or evidence cannot be acquired.

## Return route

After EVIDENCE READY:
DEPLOY-002 → DQA-001

DQA-001 issues the superseding final exact-SHA Candidate A disposition.

## Non-authorizations

- no code change;
- no candidate SHA change;
- no Development re-entry unless actual evidence demonstrates a product defect;
- no Candidate B combination;
- no RUN 024;
- no feature/workspace-v0.1 integration;
- no main integration.
