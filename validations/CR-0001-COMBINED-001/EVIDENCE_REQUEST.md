---
artifact_id: CR-0001-COMBINED-001-EVIDENCE-REQUEST
artifact_type: validation_evidence_request
status: FROZEN
protocol_version: "1.0"
source_role: DESIGN_QA
source_instance: DQA-001
target_role: DEPLOYMENT_VALIDATION
control_parent_sha: cec62855ef6c27b8a779a73b9608689bb2a7b309
source_qa_artifact: validations/CR-0001-COMBINED-001/DESIGN_QA_REPORT.md
code_baseline:
  branch: feature/workspace-cr-0001-combined
  sha: 64cb5f4ca42348c6c403e64e0d61bdff8c32a281
related_requests:
  - CR-0001.1
  - CR-0001.2
  - CR-0001.5
supersedes: null
---

# VALIDATION EVIDENCE REQUEST — CR-0001 COMBINED CANDIDATE

## Mission

Execute only the Candidate-A operational/visual delta on the exact combined candidate:

`feature/workspace-cr-0001-combined @ 64cb5f4ca42348c6c403e64e0d61bdff8c32a281`.

Do not rerun Candidate B's Level/Rank browser matrix unless technically required to establish the environment. Its combined exact-SHA deterministic evidence is already accepted.

Do not modify the combined candidate.

## Proven substrate

The GitHub-hosted Actions substrate proven by ENV-002 / DEPLOY-003 is acceptable.

The prior DEPLOY-003 harness may be reused or copied as validation infrastructure, but it must be retargeted outside the combined candidate tree to:
- combined branch `feature/workspace-cr-0001-combined`;
- exact SHA `64cb5f4ca42348c6c403e64e0d61bdff8c32a281`.

The validation harness must not be committed into the combined candidate.

## Required preflight

Prove before execution:

```text
repository:
KhaosMagnus/YU3DOH-Carder

branch identity:
feature/workspace-cr-0001-combined

git rev-parse HEAD:
64cb5f4ca42348c6c403e64e0d61bdff8c32a281

git status --porcelain:
<empty>
```

Record OS, Node, Yarn, browser/version and application URLs.

Recheck exact SHA and cleanliness after execution.

## Cases

### C-OP-01 — NORMAL SPELL render

Expected:
- Spell frame;
- SPELL top-right attribute icon;
- `Spell Card` type line;
- no circular NORMAL subtype icon;
- prepared/working state retains semantic NORMAL;
- Canonical subtype remains NORMAL.

Evidence:
actual browser screenshot + renderer canvas + prepared DTO + working projection + Canonical before/after.

### C-OP-02 — NORMAL TRAP render

Expected:
- Trap frame;
- TRAP top-right attribute icon;
- `Trap Card` type line;
- no circular NORMAL subtype icon;
- semantic and Canonical NORMAL preserved.

Evidence:
same classes as C-OP-01.

### C-OP-03 — FIELD SPELL icon preservation

Expected:
- Field subtype icon visibly present;
- normal Spell rendering intact;
- Canonical FIELD preserved.

### C-OP-04 — COUNTER TRAP icon preservation

Expected:
- Counter subtype icon visibly present;
- normal Trap rendering intact;
- Canonical COUNTER preserved.

### C-OP-05 — NORMAL SPELL/TRAP text-only Carder write-back

Execute separately for NORMAL SPELL and NORMAL TRAP.

Expected for each:
- edit only one supported localized text field through actual Carder UI;
- acknowledgement dialog identifies only TEXT:EN;
- real write-back HTTP response succeeds;
- `changed_blocks = ["TEXT:EN"]`;
- STRUCTURE absent from changed blocks;
- Canonical subtype remains NORMAL;
- STRUCTURE remains CONFIRMED;
- TEXT:EN transitions as existing contract requires;
- new `CARDER_WRITE_BACK` provenance targets TEXT:EN only;
- one revision increment;
- no partial or structural mutation.

Capture actual request/response and authoritative Canonical/provenance before/after.

### C-OP-06 — Open in Carder running copy

Expected visible copy:
- describes prepared/read-only Workspace snapshot and Carder working state;
- states supported edits can be selectively saved back;
- states explicit acknowledgement is required before changed confirmed blocks move to Draft;
- obsolete RUN 009 no-write-back statement absent.

Capture actual running UI screenshot/text.

## Evidence taxonomy

For each case record:

```text
CASE
EXPECTED
OBSERVED
SHA
STEPS
EVIDENCE
RESULT
```

Use:
- `SATISFACTORY`; or
- `UNSATISFACTORY`.

If execution succeeds but behavior mismatches, return `EVIDENCE READY` with the mismatch preserved. DQA owns defect classification.

If exact-SHA execution cannot be established, return `VALIDATION BLOCKED`.

## Exclusions

Do not repeat:
- Candidate B Level/Rank browser matrix;
- unrelated RC tests;
- backup/restore;
- Link Marker UI;
- Grid/List;
- owner-manual validation.

Do not modify:
- combined candidate source;
- Candidate A;
- Candidate B;
- `feature/workspace-v0.1`;
- `main`.

## Required return

Publish a role-owned evidence report and return to:

`DESIGN_QA / DQA-001`.

Required summary:

```text
candidate:
64cb5f4ca42348c6c403e64e0d61bdff8c32a281

cases:
C-OP-01..C-OP-06

final operational status:
EVIDENCE READY
or
VALIDATION BLOCKED
```

## Guards

```text
COMBINED INTEGRATION:
NOT AUTHORIZED

FEATURE/WORKSPACE-V0.1 MOVEMENT:
NOT AUTHORIZED

MAIN MOVEMENT:
NOT AUTHORIZED

RUN 024:
NOT AUTHORIZED
```
