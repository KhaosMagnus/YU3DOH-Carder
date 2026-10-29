# PP-002 — Gate B-R2 Corrected Live Revalidation Proposal

status: PROPOSED / PENDING OWNER APPROVAL
protocol_version: 1.0

source:
PROJECT_CONTROL / PC-002

target_if_approved:
PROTOCOL_PORTABILITY / PP-002

experiment:
PP-002 — Execution Interruption Recovery Pilot

proposed_gate:
GATE B-R2 — CORRECTED LIVE BOOKKEEPING REVALIDATION

basis:
runs/PP-002_GATE-B-R1_PASS_DISPOSITION-v2.md

historical_gate_b:
COMPLETE / REVISE

bookkeeping_correction_gate:
GATE B-R1 COMPLETE / PASS

canonical_b_r1_report:
protocols/PP-002_GATE-B-R1_BOOKKEEPING_REVALIDATION.md

## Purpose

Demonstrate that the corrected bookkeeping mechanism validated offline in B-R1 works correctly while external state is actually changing.

This proposal specifically tests whether the live observer:
- keeps planned_intent separate from observed_state;
- derives material state only from source receipts/queries;
- preserves source request/response/receipt/event timestamps;
- keeps recorded_at / verified_at separate from observation time;
- runs the consistency validator before publishing/consuming a current observed-state snapshot;
- blocks progression when live ledger consistency fails.

B-R2 does not redesign PP-002 v2 and does not re-adjudicate the historical Gate B result.

## Proposed substrate

New isolated operational branch:
ops/pp-002-gate-b-r2-actions

New branch is preferred over reusing the historical Gate B branch so run inventory, harness identity and at-most-once evidence remain unambiguous.

Existing historical branch:
ops/pp-002-gate-b-actions @ dd6e8bfecadab0a83c8008ea65300b1f0ba518f8

must remain unchanged.

## Proposed live shape

One new bounded workflow, one attempt, with three isolated scenario jobs:

B1 — active after observation loss;
B2 — completed during observation loss;
B3 — failed child / independently active parent / cleanup adjudication.

The scenario semantics are intentionally the same as Gate B so the changed variable is the observer/ledger correction, not a new recovery model.

## Corrected bookkeeping requirements

Before emission:
- publish durable planned_intent;
- no observed_state may be synthesized from planned values.

After emission and each material external read:
- retain raw source receipt;
- capture requested_at / responded_at or receipt_at when available;
- retain event_at separately where supplied;
- derive observed_state only from source-bound receipts;
- unknown/unobserved values remain UNCERTAIN / UNKNOWN;
- record recorded_at and verified_at separately.

Every material current snapshot MUST pass the B-R1 consistency validator or an equivalent byte-pinned successor before that snapshot may be used to justify the next affected stateful action.

A failed consistency validation:
- does not authorize retry;
- does not authorize replacement;
- does not erase the external operation;
- requires reconciliation of the original operation and return of REVISE/BLOCK as applicable.

## Required live checkpoints

R2-000 — PRE-EMISSION INTENT

R2-010 — EMITTED / INITIAL OBSERVATION
Must pass consistency validation before observation-loss phase begins.

R2-020 — OBSERVATION LOSS CHECKPOINT
Must identify durable operation IDs and last fresh source-bound observations.

R2-030 — RECOVERY OBSERVATION
Fresh external reads after deliberate no-poll interval.

R2-040 — VERIFIED RECOVERY DECISIONS
Raw evidence verification and safe decisions.

R2-050 — TERMINAL RECONCILIATION
All jobs/effects/evidence/cleanup/retention dispositioned.

Every snapshot is append-only.

## Negative-control requirement

In addition to the live corrected snapshots, re-run the B-R1 validator against the historical defective 010 fixture as a control.

Expected:
FAIL with the known contradiction/timestamp classes.

This confirms the validator has not been weakened merely to accept the new run.

## Positive live requirement

Every live B-R2 current-state snapshot intended for decision use must pass the consistency validator with zero material invariant violations.

No planned state may silently cross into observed state.

No source timestamp may be replaced with assembly time.

## Safety invariants

- duplicate non-idempotent effects: ZERO;
- retries/replacements/cancellations unless separately justified: ZERO expected;
- product mutation: ZERO;
- product ref movement: ZERO;
- main movement: ZERO;
- historical Gate B ops branch movement: ZERO;
- external operation identity preserved;
- late closer ownership preserved;
- cleanup evidenced explicitly, not inferred from runner termination.

## Protected refs

feature/workspace-v0.1
e11579950ef7ed20e4b6eeee88f9c3597c1f074b

feature/workspace-run-026
e11579950ef7ed20e4b6eeee88f9c3597c1f074b

main
54cc3aad246c89a29f2a18be63c539db68cae041

Historical Gate B ops branch:
ops/pp-002-gate-b-actions
dd6e8bfecadab0a83c8008ea65300b1f0ba518f8

## Proposed outputs

Primary report:
protocols/PP-002_GATE-B-R2_CORRECTED_LIVE_REVALIDATION_REPORT.md

Evidence:
validations/PP-002/GATE-B-R2/**

Implementation / live observer adapter:
validation/pp002-gate-b-r2/**

Operational harness:
bounded files on ops/pp-002-gate-b-r2-actions only.

## Proposed terminal result

Exactly one:

GATE B-R2 PASS
GATE B-R2 REVISE
GATE B-R2 FAIL

PASS requires:
- one bounded workflow / one attempt;
- live emitted snapshot passes corrected validator before use;
- all source times trace to real read receipts;
- B1 recovers STILL_RUNNING without duplicate;
- B2 recovers completed result and reuses it;
- B3 separates failed child from active parent and reconciles cleanup;
- zero stale planned-state claims;
- zero timestamp-conflation defects;
- zero duplicate non-idempotent effects;
- all owned disposable roots closed;
- protected refs unchanged;
- no historical Gate B artifact rewritten.

PASS would make Gate C eligible for separate consideration only.

## Not authorized by this proposal

This proposal grants NO execution authority.

Until explicit Owner approval and a separately published effective authorization:
- do not create/update ops/pp-002-gate-b-r2-actions;
- do not launch Actions;
- do not rerun/cancel any workflow;
- do not publish B-R2 live evidence as if executed;
- do not execute Gate C.

Generic Project Control Protocol v1.0 remains FROZEN / UNCHANGED.

PP-002 v2 remains FROZEN / UNCHANGED.

Recovery Gate remains PROPOSED / NOT ADOPTED.

## Suggested Owner approval

APPROVED — Authorize PP-002 Gate B-R2 Corrected Live Bookkeeping Revalidation under control/PP-002_GATE-B-R2_PROPOSAL.md, with one isolated disposable workflow, corrected source-bound ledger validation, no product mutation, no historical Gate B branch movement, and Gate C remaining unauthorized.

After approval, PC-002 must reverify the then-current control/ref state and publish a separate frozen effective authorization and route.
