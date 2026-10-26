---
artifact_id: ROUTE-POST-P6-TRANCHE-1-DQA-001
artifact_type: routing_decision
status: FROZEN
protocol_version: "1.0"
source_role: PROJECT_CONTROL
source_instance: PC-001
target_role: DESIGN_QA
target_instance: DQA-001
control_parent_sha: 4de94c987e67762cb1652c17088d67355d31d861
code_baseline:
  branch: feature/workspace-v0.1
  sha: 64cb5f4ca42348c6c403e64e0d61bdff8c32a281
source_scope: scopes/POST_P6_ROADMAP_REVIEW.md
project_control_disposition: control/POST_P6_ROADMAP_DISPOSITION.md
canonical_cr_ledger: requests/CR-0001-v16.md
---

# Route — Post-P6 Tranche 1 External Design + QA

## Mode

`DESIGN MODE`

No candidate implementation exists yet.

Do not perform QA acceptance against a nonexistent candidate.

## Mission

Produce the frozen implementable/testable contract for:

`NEXT IMPROVEMENT TRANCHE 1 — Focused Editor / Variant UX Completion`

Contents:

- CR-0001.3 / F-03 — Graphical Link Marker selector.
- CR-0001.6 / F-06 — Preferred Variant warning clarity.

Exact design baseline:

`feature/workspace-v0.1 @ 64cb5f4ca42348c6c403e64e0d61bdff8c32a281`

## Read completely

- `PROJECT_STATE.md`
- `control/OWNER_DIRECTION_POST_P6_SEQUENCE.md`
- `control/POST_P6_ROADMAP_DISPOSITION.md`
- `scopes/POST_P6_ROADMAP_REVIEW.md`
- `requests/CR-0001-v16.md`
- `roles/DESIGN_QA.md`
- `protocols/COMMUNICATION_PROTOCOL.md`

Inspect the exact current implementation where needed to make the contract implementable and regression-aware.

## F-03 contract must freeze

At minimum:

- graphical 3×3 Link Marker interaction;
- canonical mapping `1 2 3 / 4 [5 invalid] 6 / 7 8 9`;
- multiple simultaneous markers;
- marker 5 impossible/non-selectable;
- selected markers remain canonical marker codes;
- Link Rating remains derived from marker count;
- no domain/persistence semantic change;
- correct transitions for LINK ↔ non-LINK applicability;
- dirty-state behavior;
- keyboard/focus/accessibility expectations;
- regression expectations for current structural validation;
- no Carder mapping/protocol semantic change.

Design may reuse/adapt the existing Carder graphical picker, but must freeze observable behavior, not prescribe unnecessary implementation internals.

## F-06 contract must freeze

At minimum:

- warning becomes composition-specific;
- distinguish STANDARD and OVERFRAME availability accurately;
- do not change Preferred Variant identity;
- do not change readiness computation;
- do not introduce automatic fallback variant selection;
- do not change launch enablement rules;
- preserve manual alternate-variant behavior;
- define exact warning behavior when:
  - STANDARD unavailable only;
  - OVERFRAME unavailable only;
  - both unavailable;
  - both ready;
  - no Preferred Variant where current behavior applies.

## Architecture invariants

Expected:

```text
client/UI only
database schema = 8
Workspace format = 1
migrations = 001–008
migration 009 = absent
new API = none
new persistence = none
Carder protocol change = none
```

If the design cannot satisfy these constraints:

STOP and return `SCOPE REOPEN REQUIRED` to PROJECT_CONTROL.

## Acceptance contract

Produce exact, testable acceptance criteria for both items and their combined regression surface.

Include:

- functional cases;
- negative cases;
- accessibility/keyboard cases;
- applicability transitions;
- regression cases for existing Canonical editor behavior;
- regression cases for Preferred Variant readiness/launch semantics;
- required automated validation;
- whether any manual/operational evidence will be required later at External QA;
- exact evidence expected from Development.

The contract must be suitable for later exact-SHA External QA.

## Required output

Publish a frozen artifact, recommended path:

`handoffs/POST_P6_TRANCHE_1_IMPLEMENTATION_HANDOFF.md`

Return a YU3DOH Transfer Envelope to:

`PROJECT_CONTROL / PC-001`

Include:

- exact CONTROL SHA consumed;
- exact baseline;
- frozen behaviors;
- acceptance criteria;
- validation/evidence contract;
- scope deviations, if any;
- recommended Development boundaries.

## Authority boundary

Do NOT:

- assign RUN 024;
- create an implementation branch;
- authorize Development;
- change schema/migrations;
- route Tranche 2;
- authorize main integration.

After Design + QA freezes the contract, return to Project Control for a separate implementation authorization decision.

## Blocker route

`PROJECT_CONTROL / PC-001`
