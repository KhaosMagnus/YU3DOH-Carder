# PP-002 — Gate B Effective Authorization

status: FROZEN
protocol_version: 1.0

source:
OWNER / PROJECT_CONTROL / PC-002

target:
PROTOCOL_PORTABILITY / PP-002

experiment:
PP-002 — Execution Interruption Recovery Pilot

authorized_gate:
GATE B — CONTROLLED INTERRUPTION WITH DISPOSABLE STATE

authorization:
GRANTED / EFFECTIVE

owner_approval:
control/PP-002_GATE-B_OWNER_APPROVAL.md

control_preflight:
meta/project-control @ 7e76e38c3d088fb785fc2965d18a83d8ca0fec2b

precondition:
GATE A2 COMPLETE / PASS

gate_a2_report:
protocols/PP-002_GATE-A2_REVISED_HISTORICAL_REVALIDATION.md

gate_a2_disposition:
runs/PP-002_GATE-A2_PASS_DISPOSITION.md

revised_experimental_procedure:
control/PP-002_EXECUTION_INTERRUPTION_RECOVERY_PILOT-v2.md

generic_protocol:
protocols/GENERIC_PROJECT_CONTROL_PROTOCOL-v1.0.md

generic_protocol_status:
FROZEN / UNCHANGED

recovery_gate_status:
PROPOSED / NOT ADOPTED

## Mission

Execute a bounded live controlled interruption experiment using disposable state only.

The purpose is to prove whether the v2 recovery procedure can recover real external operation state after observation loss without unsafe retry, duplicate effect, false completion, or lost closure ownership.

## Authorized substrate

Preferred external substrate:
GitHub Actions

Authorized operational branch:
ops/pp-002-gate-b-actions

Operational branch purpose:
experimental infrastructure only.

Authorized operational changes are limited to bounded Gate B harness/workflow/evidence files, for example:
- .github/workflows/pp-002-gate-b-*.yml
- validation/pp002-gate-b/**
- validations/PP-002/GATE-B/**

Equivalent narrowly scoped paths are permitted if documented.

## Authorized external operations

PP-002 may:
- create/update the disposable operational branch;
- publish bounded experimental workflow/harness commits there;
- launch the Gate B GitHub Actions operations required by the scenarios;
- observe/query those operations;
- deliberately cease observation without cancelling where the scenario requires it;
- retrieve generated artifacts/evidence;
- publish Gate B evidence/report to the experimental/control namespace;
- perform bounded cleanup of disposable experimental state;
- cancel a Gate B operation only when the frozen scenario or safety stop explicitly requires cancellation and the reason is recorded.

PP-002 may NOT use product branches or product data as experimental state.

## Required live scenarios

B1 — ACTIVE AFTER OBSERVATION LOSS
- emit one bounded external operation;
- record run/job identity;
- intentionally stop observation while it remains active;
- recover from durable state;
- fresh observation must classify STILL_RUNNING when active;
- safe action must be KEEP_OBSERVING;
- automatic duplicate/replacement is forbidden.

B2 — COMPLETED WITH LOST CONFIRMATION
- emit an operation with a unique disposable effect marker;
- stop observation before terminal confirmation;
- allow it to complete externally;
- recover from durable identity;
- verify CONFIRMED_DONE + SUCCESS + EFFECT_CONFIRMED + EVIDENCE_VERIFIED;
- safe action must be REUSE_RESULT;
- effect must occur exactly once.

B3 — PARTIAL FAILURE / CLEANUP
- use a parent workflow with a bounded child that produces partial disposable evidence/effect and then intentionally fails;
- preserve parent/finalizer lifecycle long enough to demonstrate independent parent/child states;
- lose observation during/after the child failure;
- recover lifecycle, outcome, effect, evidence and cleanup separately;
- reconcile before any retry;
- runner termination alone is not cleanup proof.

## Required operation record

For every materially stateful/external operation record:
- logical_operation_id;
- parent_operation_id or NONE;
- purpose / intended effect;
- operation type;
- accountable owner / closer;
- authority artifact;
- CONTROL SHA;
- operational/harness SHA;
- external operation ID when known;
- emission channel;
- effect/output namespace;
- retry/idempotency characteristics;
- issuance timestamp;
- acknowledgement state;
- observation source/time;
- current lifecycle;
- outcome;
- effect;
- evidence;
- cleanup;
- safe next action.

## Recovery semantics

After controlled observation loss, "Continúa" means:

RECOVER AFFECTED OPERATIONS FIRST

then continue only reconciled or unaffected work already inside this authority.

It does not grant blind retry, new scope, Gate C, or product mutation.

Safe actions:
REUSE_RESULT
KEEP_OBSERVING
RECONCILE_EFFECT
RETRY_JUSTIFIED
BLOCK

STILL_RUNNING:
KEEP_OBSERVING

UNCERTAIN:
observe/reconcile; BLOCK affected mutation/retry if material uncertainty remains.

A retry/replacement while original state is STILL_RUNNING or UNCERTAIN requires the v2 replacement/parallel exception and must preserve a named closer for the original.

## Safety invariants

Required:
- duplicate non-idempotent effects = ZERO;
- product mutation = ZERO;
- product ref movement = ZERO;
- protected ref movement = ZERO;
- main movement = ZERO;
- exact operation identity preserved where available;
- late operation ownership preserved;
- no successful substitute silently closes the original.

## Protected product refs

These are reference-only and must not move because of Gate B:

feature/workspace-v0.1
e11579950ef7ed20e4b6eeee88f9c3597c1f074b

feature/workspace-run-026
e11579950ef7ed20e4b6eeee88f9c3597c1f074b

main
54cc3aad246c89a29f2a18be63c539db68cae041

## Stop conditions

Stop the affected operation and return to PC-002 if:
- product/protected refs differ unexpectedly;
- control authority changes incompatibly;
- disposable effects cannot be isolated;
- an effect may escape the experimental namespace;
- a duplicate non-idempotent effect occurs;
- cleanup cannot be bounded;
- operation identity cannot be recovered and further mutation would be unsafe;
- required action exceeds this authority.

Read-only reconciliation may continue after a scoped stop where safe.

## Measurement

Record:
- operations emitted/recovered;
- active operations found on recovery;
- completions discovered after lost observation;
- lost acknowledgements;
- duplicate operations/effects;
- retries prevented/justified;
- BLOCK decisions;
- cleanup reconciliations;
- recovery checks;
- Owner prompts;
- stale-context errors;
- terminal auto-return behavior;
- administrative overhead.

## Required output

Primary report:
protocols/PP-002_GATE-B_CONTROLLED_INTERRUPTION_REPORT.md

Supporting evidence:
validations/PP-002/GATE-B/**

Terminal result exactly one:
GATE B PASS
GATE B REVISE
GATE B FAIL

Gate B PASS makes Gate C eligible for separate consideration only.

Gate C:
NOT AUTHORIZED

Protocol successor/adoption:
NOT AUTHORIZED

Generic Project Control Protocol v1.0:
FROZEN / UNCHANGED

AUTO-RETURN:
At terminal Gate B result, proactively return the complete envelope to PROJECT_CONTROL / PC-002.
