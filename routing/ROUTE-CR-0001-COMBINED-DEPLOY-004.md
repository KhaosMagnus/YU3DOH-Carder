---
artifact_id: ROUTE-CR-0001-COMBINED-DEPLOY-004
artifact_type: routing_decision
status: FROZEN
protocol_version: "1.0"
source_role: PROJECT_CONTROL
source_instance: PC-001
target_role: DEPLOYMENT_VALIDATION
target_instance: DEPLOY-004
control_parent_sha: 6ce399ea69fa03cd4c0c4b6c3aa3ae4981f35125
supersedes:
  - routing/ROUTE-CR-0001-COMBINED-DEPLOY-003.md
candidate_branch: feature/workspace-cr-0001-combined
candidate_sha: 64cb5f4ca42348c6c403e64e0d61bdff8c32a281
ops_branch: ops/cr-0001-combined-deploy-004-actions
---

# Route — CR-0001 Combined Candidate bounded operational evidence

## Supersession

The previous routing artifact:

`routing/ROUTE-CR-0001-COMBINED-DEPLOY-003.md`

is superseded BEFORE EXECUTION.

Reason:

Project Control initially interpreted an Owner question about instance reuse as a preference to reuse DEPLOY-003. The Owner clarified that no reuse instruction had been given and authorized use of the cleaner instance model.

No combined validation work was executed under the superseded DEPLOY-003 route.

DEPLOY-003 therefore remains closed solely as the Candidate A operational-validation instance.

## Target

`DEPLOYMENT_VALIDATION / DEPLOY-004`

## Exact candidate

`feature/workspace-cr-0001-combined @ 64cb5f4ca42348c6c403e64e0d61bdff8c32a281`

## Proven substrate

Reuse the GitHub-hosted Actions topology already proven by ENV-002 and Candidate A DEPLOY-003.

No new Environment Readiness gate is required unless that substrate becomes unavailable.

## Operational branch

`ops/cr-0001-combined-deploy-004-actions`

Initial branch point:

`22d89b3bb4c6e15b1dcc56eff84d71093e74947b`

This branch contains validation infrastructure only and begins from the known successful Candidate A DEPLOY-003 harness state.

The previously created but unused branch:

`ops/cr-0001-combined-deploy-003-actions`

is not authoritative for this mission.

## Mandatory preflight

Every behavioral run must separately checkout:

`feature/workspace-cr-0001-combined @ 64cb5f4ca42348c6c403e64e0d61bdff8c32a281`

and prove:

```text
git rev-parse HEAD
64cb5f4ca42348c6c403e64e0d61bdff8c32a281

git status --porcelain
<empty>
```

Repeat exact SHA and cleanliness checks after execution.

Any mismatch:
`VALIDATION BLOCKED`.

## Behavioral scope

Execute only:
- C-OP-01 NORMAL SPELL rendering
- C-OP-02 NORMAL TRAP rendering
- C-OP-03 FIELD SPELL icon preservation
- C-OP-04 COUNTER TRAP icon preservation
- C-OP-05 NORMAL SPELL/TRAP text-only Carder write-back
- C-OP-06 Open in Carder running copy

Normative contract:
`validations/CR-0001-COMBINED-001/EVIDENCE_REQUEST.md`

Do not rerun Candidate B Level/Rank browser matrix.

## Evidence

For each case:
CASE / EXPECTED / OBSERVED / SHA / STEPS / EVIDENCE / RESULT.

Use:
`SATISFACTORY`
or
`UNSATISFACTORY`.

C-OP-05 requires real Carder UI, acknowledged real HTTP write-back, and authoritative Canonical confirmation/revision/provenance before/after.

## Final state

Return:
`EVIDENCE READY`
when all six requested cases execute and evidence is captured, even if any is UNSATISFACTORY.

Return:
`VALIDATION BLOCKED`
only if exact-SHA execution or required evidence acquisition cannot complete.

## Publication

Publish a new role-owned artifact:

`validations/CR-0001-COMBINED-001/DEPLOY-004_VALIDATION_EVIDENCE.md`

Then return to:
`DESIGN_QA / DQA-001`

DQA owns the superseding final combined disposition.

## Guards

No combined source edits.
No Candidate A/B edits.
No feature/workspace-v0.1 movement.
No main movement.
No integration.
No RUN 024.
