---
artifact_id: P5-CANDIDATE-A-001-DESIGN-QA-BLOCKER-REVIEW
artifact_type: design_qa_review
status: VALIDATED
protocol_version: "1.0"
source_role: DESIGN_QA
source_instance: DQA-001
target_role: PROJECT_CONTROL
control_parent_sha: 02482d6dcb6932f1d93317c411a95cce508bf8ff
code_baseline:
  branch: fix/workspace-rc-normal-subtype-icon
  sha: 61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c
related_requests:
  - CR-0001.1
  - CR-0001.5
source_artifacts:
  - validations/P5-CANDIDATE-A-001/DESIGN_QA_REPORT.md
  - validations/P5-CANDIDATE-A-001/EVIDENCE_REQUEST.md
  - validations/P5-CANDIDATE-A-001/DEPLOYMENT_VALIDATION_EVIDENCE.md
supersedes: null
official_candidate_result: PARTIAL
blocker_classification: ENVIRONMENT_EXECUTION_ACCESS
---

# DESIGN + QA BLOCKER REVIEW — CANDIDATE A

## Disposition

Deployment's `VALIDATION BLOCKED` return is accepted as an accurate execution-access blocker.

No A-OP case was executed, so no product failure or regression was observed.

Candidate A remains:

```text
SHA:
61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c

OFFICIAL EXTERNAL QA:
PARTIAL — UNCHANGED

PRODUCT DEFECT FROM THIS ATTEMPT:
NOT ESTABLISHED

REGRESSION FROM THIS ATTEMPT:
NOT ESTABLISHED
```

## Classification

```text
BLOCKER CLASS:
ENVIRONMENT / EXECUTION ACCESS
```

DEPLOY-001 could verify remote GitHub refs and source, but could not establish the frozen local preflight: no exact candidate checkout, no local HEAD/clean-tree proof, no usable dependency environment, and no reachable exact-SHA Workspace/Library/Carder runtime. Git network access in that runtime failed at DNS resolution.

This is an evidence-acquisition limitation, not evidence against Candidate A.

## Frozen gate

The existing frozen request remains valid and unchanged:

`validations/P5-CANDIDATE-A-001/EVIDENCE_REQUEST.md`

Still required:

- A-OP-01 NORMAL SPELL render;
- A-OP-02 NORMAL TRAP render;
- A-OP-03 FIELD SPELL icon;
- A-OP-04 COUNTER TRAP icon;
- A-OP-05 NORMAL SPELL/TRAP text-only Carder write-back;
- A-OP-06 Open in Carder copy.

No unrelated RC validation is reopened. No owner-manual repetition is requested.

## Existing CI limitation

Candidate A contains historical workflows that can be manually dispatched, but they do not execute the Candidate-A-specific A-OP-01..06 visual matrix. In particular, the existing RUN017 browser harness is not a substitute for the required NORMAL SPELL/TRAP, FIELD SPELL and COUNTER TRAP rendering evidence.

Therefore dispatching the existing workflows alone would not close this gate.

A new committed harness on Candidate A would change the candidate SHA and is not authorized by this review.

## Required next route

```text
DESIGN_QA / DQA-001
→ PROJECT_CONTROL
→ independent DEPLOYMENT_VALIDATION runtime
→ DESIGN_QA / DQA-001
```

Project Control should reprovision or reassign the same frozen evidence request to an independent runtime that can prove:

1. actual Git checkout with `.git`;
2. HEAD exactly `61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c`;
3. clean working tree;
4. Node/Yarn dependencies available;
5. executable Chromium/browser;
6. disposable Workspace;
7. screenshot capture;
8. actual Carder write-back request/response plus Canonical/provenance observation.

A temporary evidence harness may exist outside the tracked Candidate A tree if needed, provided it drives the actual exact-SHA application and leaves `git status --porcelain` clean.

No Development action is required unless later runtime evidence demonstrates an actual product mismatch.

## Independence

Candidate B remains independently:

```text
59fb2924b2240f005fb3e9e6d5afbd8aaca39596
PASS
VALIDATED / HOLD
```

This blocker does not reopen Candidate B and does not establish an integration order.

## Non-authorizations

```text
RUN 024:
NOT AUTHORIZED

MAIN INTEGRATION:
NOT AUTHORIZED

FEATURE/WORKSPACE-V0.1 INTEGRATION:
NOT AUTHORIZED

CANDIDATE A + B COMBINATION:
NOT AUTHORIZED
```

## Return requirement

The next independent Deployment attempt must return either:

`EVIDENCE READY`

or:

`VALIDATION BLOCKED`

If evidence is collected and a case mismatches expected behavior, return `EVIDENCE READY` with that case UNSATISFACTORY so DQA can classify the observed defect.

If exact-SHA preflight still cannot be established, return `VALIDATION BLOCKED` with the infrastructure cause.
