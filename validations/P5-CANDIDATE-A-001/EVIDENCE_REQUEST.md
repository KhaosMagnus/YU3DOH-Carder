---
artifact_id: P5-CANDIDATE-A-001-EVIDENCE-REQUEST
artifact_type: validation_evidence_request
status: FROZEN
protocol_version: "1.0"
source_role: DESIGN_QA
source_instance: DQA-001
target_role: DEPLOYMENT_VALIDATION
control_parent_sha: bae92f3242dd9eaf3fa6c6750bb5867d7e66e98b
source_qa_artifact: validations/P5-CANDIDATE-A-001/DESIGN_QA_REPORT.md
code_baseline:
  branch: fix/workspace-rc-normal-subtype-icon
  sha: 61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c
related_requests:
  - CR-0001.1
  - CR-0001.5
supersedes: null
created_at: "2026-10-22T18:07:00Z"
approved_at: "2026-10-22T18:07:00Z"
---

# VALIDATION EVIDENCE REQUEST — P5 CANDIDATE A

## 1. Mission

Produce only the independent operational/visual delta evidence still required by External
Design + QA for:

`fix/workspace-rc-normal-subtype-icon @ 61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c`

Do not modify code, create commits, merge branches, move refs, change migrations or combine
Candidate A with Candidate B.

This request does not reopen unrelated RC evidence.

## 2. Required preflight

Before testing, record and prove:

```text
repository:
KhaosMagnus/YU3DOH-Carder

branch:
fix/workspace-rc-normal-subtype-icon

HEAD:
61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c

working tree:
clean
```

Record:
- OS;
- Node version;
- Yarn version;
- browser and exact browser version;
- Carder/Library URLs used.

If HEAD differs or local modifications could contaminate the run, stop with
`VALIDATION BLOCKED`.

Use an isolated/disposable Workspace or fixtures. Do not mutate an owner's real Workspace
for this evidence.

## 3. Required cases

### CASE A-OP-01 — NORMAL SPELL rendering

Prepare/open a Canonical SPELL with:

`subtype_code:NORMAL`

through the supported Workspace → Carder path.

**EXPECTED**

- Carder frame is Spell;
- top-right SPELL attribute/icon remains present;
- type line is `Spell Card`;
- no circular NORMAL subtype icon is rendered;
- Canonical source remains NORMAL.

**EVIDENCE**

- screenshot of the rendered card sufficient to see the attribute and type line;
- captured prepared/working projection showing Spell + semantic NORMAL;
- Canonical detail before/after showing `subtype_code:NORMAL`.

### CASE A-OP-02 — NORMAL TRAP rendering

Prepare/open a Canonical TRAP with:

`subtype_code:NORMAL`

**EXPECTED**

- Carder frame is Trap;
- top-right TRAP attribute/icon remains present;
- type line is `Trap Card`;
- no circular NORMAL subtype icon is rendered;
- Canonical source remains NORMAL.

**EVIDENCE**

Same evidence classes as A-OP-01.

### CASE A-OP-03 — non-NORMAL SPELL icon preservation

Use a SPELL with:

`subtype_code:FIELD`

**EXPECTED**

- Spell renders normally;
- Field subtype icon is visibly present;
- Canonical subtype remains FIELD.

**EVIDENCE**

Rendered screenshot plus prepared/Canonical state.

### CASE A-OP-04 — non-NORMAL TRAP icon preservation

Use a TRAP with:

`subtype_code:COUNTER`

**EXPECTED**

- Trap renders normally;
- Counter subtype icon is visibly present;
- Canonical subtype remains COUNTER.

**EVIDENCE**

Rendered screenshot plus prepared/Canonical state.

### CASE A-OP-05 — NORMAL text-only Carder write-back

Execute separately for NORMAL SPELL and NORMAL TRAP.

Starting state must show:
- Canonical `subtype_code:NORMAL`;
- STRUCTURE confirmation state;
- selected TEXT confirmation state;
- initial revision.

Change only one supported localized text field in Carder and perform the existing
acknowledged write-back as required.

**EXPECTED**

- write-back succeeds;
- only the appropriate TEXT block changes;
- STRUCTURE is not reported as changed;
- Canonical `subtype_code:NORMAL` remains NORMAL;
- STRUCTURE does not move to Draft solely from this edit;
- expected TEXT confirmation transition occurs;
- `CARDER_WRITE_BACK` provenance targets the changed TEXT block;
- revision behavior matches the existing contract.

**EVIDENCE**

Capture request/response plus Canonical detail/provenance after write-back for both SPELL
and TRAP.

### CASE A-OP-06 — Open in Carder copy

Open the Library panel containing Open in Carder.

**EXPECTED**

The visible copy communicates:
- Workspace snapshot/prepare/open behavior;
- supported edits may be selectively saved back;
- changed confirmed blocks require explicit acknowledgement before moving to Draft.

The obsolete statement:

`Working edits are not saved back to Workspace in RUN 009.`

must not be present.

**EVIDENCE**

Screenshot or exact visible UI text from the running exact-SHA candidate.

## 4. Evidence rules

For every case record:

```text
CASE
EXPECTED
OBSERVED
SHA
STEPS
EVIDENCE
RESULT
```

Use only:
- `SATISFACTORY` when observed behavior matches expected; or
- `UNSATISFACTORY` when it does not.

Do not issue an External QA PASS/FAIL. Deployment Validation supplies evidence only.

Screenshots must be attributable to the case and exact candidate SHA.

For write-back evidence, include machine-readable request/response or equivalent captured
API evidence whenever possible; screenshots alone are insufficient for persistence and
confirmation-state assertions.

## 5. Exclusions

Do not retest unless technically necessary:
- CR null/zero scenarios unrelated to this delta;
- Level/Rank CR-0001.2;
- Link Marker UI;
- Library Grid/List;
- backup/restore;
- external source ingestion;
- other already satisfactory owner-local cases.

Do not ask the owner to perform these tests manually.

## 6. Required return

Publish a new Deployment Validation evidence artifact; do not modify this request or the
QA report.

Return:

```text
VALIDATION EVIDENCE REPORT

candidate:
61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c

cases:
A-OP-01 .. A-OP-06

final operational status:
EVIDENCE READY
or
VALIDATION BLOCKED
```

If any case is UNSATISFACTORY, preserve the exact evidence and still use
`EVIDENCE READY` when the requested evidence was successfully collected; External Design
+ QA will classify the observed mismatch.

Next target after evidence publication:

`DESIGN_QA / DQA-001`.

## 7. Prohibitions

```text
RUN 024:
NOT AUTHORIZED

MAIN INTEGRATION:
NOT AUTHORIZED

FEATURE/WORKSPACE INTEGRATION:
NOT AUTHORIZED

CANDIDATE B COMBINATION:
FORBIDDEN
```
