# PP-002 — Gate B-R2 Effective Authorization

status: FROZEN
protocol_version: 1.0

source:
OWNER / PROJECT_CONTROL / PC-002

target:
PROTOCOL_PORTABILITY / PP-002

experiment:
PP-002 — Execution Interruption Recovery Pilot

authorized_gate:
GATE B-R2 — CORRECTED LIVE BOOKKEEPING REVALIDATION

authorization:
GRANTED / EFFECTIVE

owner_approval:
control/PP-002_GATE-B-R2_OWNER_APPROVAL.md

approved_proposal:
control/PP-002_GATE-B-R2_PROPOSAL.md

control_preflight:
meta/project-control @ 7641269c3001e0407c920164b2bb3cf319c4be68

precondition:
GATE B-R1 COMPLETE / PASS

precondition_disposition:
runs/PP-002_GATE-B-R1_PASS_DISPOSITION-v2.md

historical_gate_b:
COMPLETE / REVISE

historical_gate_b_report:
protocols/PP-002_GATE-B_CONTROLLED_INTERRUPTION_REPORT.md

bookkeeping_correction_report:
protocols/PP-002_GATE-B-R1_BOOKKEEPING_REVALIDATION.md

generic_protocol:
protocols/GENERIC_PROJECT_CONTROL_PROTOCOL-v1.0.md

generic_protocol_status:
FROZEN / UNCHANGED

pp002_v2:
control/PP-002_EXECUTION_INTERRUPTION_RECOVERY_PILOT-v2.md

pp002_v2_status:
FROZEN / UNCHANGED

recovery_gate_status:
PROPOSED / NOT ADOPTED

## Mission

Execute one new bounded disposable live workflow to prove that the B-R1 bookkeeping correction operates correctly while external state is changing.

Changed variable:
live observer / ledger correction.

Unchanged recovery semantics:
Gate B scenario logic B1/B2/B3.

B-R2 must not redesign the recovery model.

## Authorized operational branch

ops/pp-002-gate-b-r2-actions

This branch may be created and moved only for B-R2 bounded experiment infrastructure.

Historical Gate B branch:
ops/pp-002-gate-b-actions @ dd6e8bfecadab0a83c8008ea65300b1f0ba518f8

MUST NOT MOVE.

## Authorized external execution

Exactly one new bounded GitHub Actions workflow emission / one run attempt is authorized for B-R2.

Permitted:
- create the isolated B-R2 ops branch;
- publish bounded B-R2 harness/workflow files only;
- emit one B-R2 workflow by the authorized branch transition;
- query/observe the emitted run/jobs;
- deliberately stop observation without cancelling for the bounded scenarios;
- retrieve B-R2 artifacts;
- publish B-R2 evidence/report under authorized PP-002 namespaces;
- perform bounded cleanup of disposable B-R2 state.

Not permitted without separate authority:
- second workflow attempt;
- rerun;
- replacement workflow;
- cancellation except a safety-stop condition where cancellation is necessary to contain an experimental effect and is immediately documented;
- historical Gate B branch movement;
- product mutation/ref movement;
- Gate C.

## Required scenarios

B1 — active after observation loss.
Recover fresh STILL_RUNNING and KEEP_OBSERVING; no duplicate.

B2 — completed during observation loss.
Recover terminal SUCCESS / confirmed effect / verified evidence and REUSE_RESULT; no duplicate.

B3 — failed child with independently active parent.
Recover child FAILURE separately from parent lifecycle, reconcile effect and cleanup, no retry.

## Corrected bookkeeping rules

planned_intent and observed_state MUST be structurally distinct.

observed_state:
- derives only from actual source-bound receipts/queries;
- contains source_kind and source_id for every material claim;
- uses UNKNOWN / UNCERTAIN where a receipt is unavailable;
- never copies planned lifecycle/acknowledgement into current state.

Every material live observation must preserve, where actually available:
- requested_at;
- responded_at / receipt_at;
- event_at separately;
- recorded_at;
- verified_at.

recorded_at and verified_at are never observation timestamps.

No observation timestamp may be invented.

## Mandatory live validator

The B-R1 validator at:

validation/pp002-gate-b-r1/**

or a byte-pinned successor whose delta is bounded and documented

must validate each current-state snapshot before that snapshot is used to justify the next affected stateful action.

The validator must also run the historical defective 010 negative control and continue to reject it.

If a current live snapshot fails consistency validation:
- do not retry;
- do not replace;
- do not advance the affected scenario based on that snapshot;
- reconcile the original operation;
- return REVISE/BLOCK if consistency cannot be restored safely.

## Required checkpoints

R2-000 — PRE-EMISSION INTENT

R2-010 — EMITTED / INITIAL OBSERVATION
Must pass live validator before deliberate observation loss begins.

R2-020 — OBSERVATION LOSS CHECKPOINT

R2-030 — RECOVERY OBSERVATION

R2-040 — VERIFIED RECOVERY DECISIONS

R2-050 — TERMINAL RECONCILIATION

All evidence records append-only.

## Safety invariants

- duplicate non-idempotent effects = ZERO;
- workflow attempts = exactly one;
- retries/replacements = ZERO unless separately authorized;
- planned-state leakage into observed_state = ZERO;
- source-time/assembly-time conflation = ZERO;
- product mutation = ZERO;
- product ref movement = ZERO;
- main movement = ZERO;
- historical Gate B branch movement = ZERO;
- exact operation identity retained;
- original closer ownership retained;
- explicit cleanup evidence required.

## Protected refs

feature/workspace-v0.1
e11579950ef7ed20e4b6eeee88f9c3597c1f074b

feature/workspace-run-026
e11579950ef7ed20e4b6eeee88f9c3597c1f074b

main
54cc3aad246c89a29f2a18be63c539db68cae041

historical Gate B ops branch:
ops/pp-002-gate-b-actions
dd6e8bfecadab0a83c8008ea65300b1f0ba518f8

## Stop conditions

Stop affected execution and return to PC-002 if:
- a live current-state snapshot fails consistency validation and cannot be safely reconciled;
- a duplicate non-idempotent effect occurs;
- an unauthorized second workflow/run attempt would be required;
- product/protected refs differ unexpectedly;
- historical Gate B branch moves;
- disposable effects escape their namespace;
- cleanup cannot be bounded;
- external operation identity cannot be recovered;
- control authority changes incompatibly;
- required action exceeds this authority.

Read-only recovery/reconciliation may continue when safe.

## Required output

protocols/PP-002_GATE-B-R2_CORRECTED_LIVE_REVALIDATION_REPORT.md

Supporting evidence:
validations/PP-002/GATE-B-R2/**

Implementation/observer adapter:
validation/pp002-gate-b-r2/**

Operational harness:
bounded files on ops/pp-002-gate-b-r2-actions only.

Terminal result exactly one:
GATE B-R2 PASS
GATE B-R2 REVISE
GATE B-R2 FAIL

PASS requires:
- exactly one workflow / one attempt;
- R2-010 live current-state snapshot passes validator before observation loss;
- all subsequent decision snapshots pass validator before use;
- historical defective 010 negative control still fails;
- B1/B2/B3 produce the expected safe recovery decisions;
- zero stale planned-state claims;
- zero timestamp conflation;
- zero duplicate non-idempotent effects;
- all disposable roots closed;
- historical Gate B branch and protected refs unchanged.

Gate C:
NOT AUTHORIZED

A B-R2 PASS makes Gate C eligible for separate consideration only.

Protocol successor/adoption:
NOT AUTHORIZED

Generic Project Control Protocol v1.0:
FROZEN / UNCHANGED

AUTO-RETURN:
At terminal B-R2 result, proactively return the complete envelope to PROJECT_CONTROL / PC-002.
