---
artifact_id: ROUTE-CR-0001-COMBINED-DEPLOY-003
artifact_type: routing_decision
status: FROZEN
protocol_version: "1.0"
source_role: PROJECT_CONTROL
source_instance: PC-001
target_role: DEPLOYMENT_VALIDATION
target_instance: DEPLOY-003
control_parent_sha: 8c0decb8b085aeef0d0d37260cf3bb1679526dca
candidate_branch: feature/workspace-cr-0001-combined
candidate_sha: 64cb5f4ca42348c6c403e64e0d61bdff8c32a281
ops_branch: ops/cr-0001-combined-deploy-003-actions
source_artifacts:
  - validations/CR-0001-COMBINED-001/DESIGN_QA_REPORT.md
  - validations/CR-0001-COMBINED-001/EVIDENCE_REQUEST.md
  - implementations/CR-0001_COMBINED_CANDIDATE_IMPLEMENTATION_REPORT.md
  - validations/P5-CANDIDATE-A-001/ENV-002_ENVIRONMENT_READINESS_REPORT.md
  - validations/P5-CANDIDATE-A-001/DEPLOY-003_VALIDATION_EVIDENCE.md
---

# Route — CR-0001 Combined Candidate bounded operational evidence

## Trigger

DQA-001 issued official combined disposition:

`PARTIAL`

Exact combined SHA:

`64cb5f4ca42348c6c403e64e0d61bdff8c32a281`

Implementation defect:

`NOT IDENTIFIED`

Regression:

`NOT IDENTIFIED`

Candidate B A–J:

`PASS ON EXACT COMBINED SHA`

Missing gate:

`COMBINED EXACT-SHA C-OP-01..C-OP-06`

## Instance reuse

Project Control reuses:

`DEPLOYMENT_VALIDATION / DEPLOY-003`

This is a new assignment on the same completed role instance, not a continuation of Candidate A evidence.

Previous Candidate A assignment remains closed and immutable:

- candidate `61503c6...`;
- A-OP-01..06;
- EVIDENCE READY;
- evidence artifact `validations/P5-CANDIDATE-A-001/DEPLOY-003_VALIDATION_EVIDENCE.md`.

New combined assignment is isolated through a distinct operational branch and distinct evidence artifact.

## Proven substrate

Reuse the already proven GitHub-hosted Actions topology from ENV-002 / prior DEPLOY-003.

No new Environment Readiness gate is required unless that substrate becomes unavailable.

## Operational branch

`ops/cr-0001-combined-deploy-003-actions`

Initial branch point:

`22d89b3bb4c6e15b1dcc56eff84d71093e74947b`

This branch is validation infrastructure only.

DEPLOY-003 may retarget/copy the prior harness here.

The harness must not be committed into the combined candidate tree.

## Exact candidate custody

Every behavioral run must separately checkout:

`feature/workspace-cr-0001-combined @ 64cb5f4ca42348c6c403e64e0d61bdff8c32a281`

and prove before execution:

```text
git rev-parse HEAD
64cb5f4ca42348c6c403e64e0d61bdff8c32a281

git status --porcelain
<empty>
```

Recheck exact SHA and cleanliness after execution.

Any mismatch:

`VALIDATION BLOCKED`.

## Behavioral scope

Execute only:

- C-OP-01 — NORMAL SPELL rendering
- C-OP-02 — NORMAL TRAP rendering
- C-OP-03 — FIELD SPELL icon preservation
- C-OP-04 — COUNTER TRAP icon preservation
- C-OP-05 — NORMAL SPELL/TRAP text-only Carder write-back
- C-OP-06 — Open in Carder running copy

Normative expected behavior and evidence requirements are exclusively those frozen in:

`validations/CR-0001-COMBINED-001/EVIDENCE_REQUEST.md`

Do not repeat Candidate B Level/Rank browser matrix.

Do not broaden the validation scope.

## Evidence requirements

For each case record:

- CASE
- EXPECTED
- OBSERVED
- SHA
- STEPS
- EVIDENCE
- RESULT

Result:
`SATISFACTORY` or `UNSATISFACTORY`.

C-OP-05 must use actual Carder UI/write-back request/response and authoritative Canonical confirmation/revision/provenance before/after.

Use disposable Workspace data only.

## Final operational state

Return:

`EVIDENCE READY`

when all six requested cases were actually executed and evidence captured, even if any case is UNSATISFACTORY.

Return:

`VALIDATION BLOCKED`

only if exact-SHA execution or required evidence acquisition cannot be completed.

## Publication

Publish a NEW role-owned artifact:

`validations/CR-0001-COMBINED-001/DEPLOY-003_VALIDATION_EVIDENCE.md`

Do not modify the prior Candidate A DEPLOY-003 evidence artifact.

After publication:
- obtain exact CONTROL SHA;
- reread the artifact from GitHub;
- return to `DESIGN_QA / DQA-001`.

DQA-001 owns the superseding final combined exact-SHA disposition.

## Guards

- no combined-candidate source edits;
- no Candidate A/B source edits;
- no feature/workspace-v0.1 movement;
- no main movement;
- no RUN 024;
- no integration.
