# PP-002 — Gate C Real Session Rollover Recovery Proposal

status: PROPOSED / PENDING OWNER APPROVAL
protocol_version: 1.0

source:
PROJECT_CONTROL / PC-002

target_if_approved:
PROTOCOL_PORTABILITY / PP-002

experiment:
PP-002 — Execution Interruption Recovery Pilot

proposed_gate:
GATE C — REAL SESSION ROLLOVER RECOVERY

basis:
runs/PP-002_GATE-B-R2_PASS_DISPOSITION.md

historical_gate_b:
COMPLETE / REVISE

gate_b_r1:
COMPLETE / PASS

gate_b_r2:
COMPLETE / PASS

canonical_b_r2_report:
protocols/PP-002_GATE-B-R2_CORRECTED_LIVE_REVALIDATION_REPORT.md

## Purpose

Exercise an actual PP-002/S01 -> PP-002/S02 session rollover while:
- role remains PROTOCOL_PORTABILITY;
- accountable instance remains PP-002;
- bounded assignment remains PP-002 — Execution Interruption Recovery Pilot;
- authority remains frozen and unchanged;
- product refs remain untouched.

S02 must recover solely from durable repository/control state plus normally authorized tool access.

S02 must NOT depend on hidden/private predecessor-session memory.

## What Gate C is intended to prove

1. A durable predecessor session checkpoint can carry exact authority and operational custody across session replacement.
2. S02 can reconstruct exact CONTROL SHA, product/protected refs, operational branch/harness, external operation identity and last source-bound observations.
3. S02 distinguishes inherited durable evidence from non-inherited conversational/executor-local state.
4. S02 obtains fresh external observations before any affected stateful continuation.
5. S02 preserves the corrected B-R1/B-R2 planned_intent vs observed_state and source-timestamp discipline.
6. S02 can make a safe continuation decision without duplicate non-idempotent effect.
7. S02 closes the operation and proactively returns terminal evidence.
8. The rollover does not implicitly create a new accountable instance or new product scope.

## Explicit limit

Gate C focuses on real session/conversation rollover.

It does NOT automatically claim to test:
- actual model quota exhaustion;
- involuntary executor crash;
- lost issuance acknowledgement.

If those conditions occur naturally, they may be recorded.
They must not be simulated by corrupting state, intentionally exhausting quota or suppressing known evidence.

After Gate C, PP-002 must still issue a final PROMOTE / REVISE / REJECT recommendation based on the complete evidence record and any remaining material gaps.

## Proposed session topology

Stable:
ROLE = PROTOCOL_PORTABILITY
INSTANCE = PP-002
ASSIGNMENT = Execution Interruption Recovery Pilot

Predecessor:
SESSION = PP-002/S01

Successor:
SESSION = PP-002/S02

S01 and S02 are different session/conversation execution contexts under the same durable PP-002 accountability record.

No new PP-003 or successor instance is created merely for the rollover.

## Proposed disposable substrate

New isolated operational branch:
ops/pp-002-gate-c-actions

Historical branches:
- ops/pp-002-gate-b-actions @ dd6e8bfecadab0a83c8008ea65300b1f0ba518f8
- ops/pp-002-gate-b-r2-actions @ 0e679ad863076098d92d8a7704f6ca88948b651b

Both historical branches must remain unchanged.

## Proposed live operation

One bounded disposable GitHub Actions workflow / one attempt.

The workflow should remain active long enough for S01 to:
- emit it;
- discover exact run/job identity;
- publish a source-bound current snapshot;
- publish a durable rollover checkpoint;
- stop active execution/observation without cancelling the workflow.

The session rollover must occur while the external operation is:
STILL_RUNNING

or, if external timing naturally completes between checkpoint and S02 recovery:
terminal but not yet observed by S02.

No duplicate/replacement workflow is allowed.

## S01 required checkpoint

Before S01 exits, publish an append-only durable checkpoint containing at minimum:

- ROLE;
- INSTANCE_ID = PP-002;
- SESSION_ID = PP-002/S01;
- successor_expected = PP-002/S02;
- exact CONTROL SHA;
- exact Gate C authorization and route identities;
- product/protected refs;
- Gate C operational branch;
- harness SHA;
- workflow run/attempt;
- job IDs;
- logical operation ledger;
- latest validated source-bound snapshot;
- observation timestamps;
- in-flight/terminal classifications;
- effect/evidence/cleanup states;
- accountable closer;
- inherited evidence inventory;
- explicitly NON-INHERITED state;
- unresolved/uncertain items;
- exact safe next action;
- explicit statement that S01 will perform no further observation/mutation after checkpoint.

Checkpoint must pass the same corrected consistency discipline before S01 rollover.

## Non-inherited state declaration

S01 must explicitly mark as NON-INHERITED:
- private chain of thought;
- unrecorded conversation memory;
- transient executor-local assumptions;
- UI observations not durably captured;
- local process state not represented by durable evidence;
- any source receipt not actually published into the checkpoint/evidence package.

S02 must not claim those facts as inherited.

## Rollover boundary

After checkpoint publication:

S01 MUST stop.

No polling, mutation, retry, cancellation or cleanup may be performed by S01 after the frozen rollover checkpoint except an emergency safety action explicitly required to contain an escaping effect.

S01 returns a SESSION ROLLOVER envelope rather than a terminal Gate C result.

Owner/Project Control then starts PP-002/S02 with the frozen rollover transfer.

This is the controlled session-replacement event.

## S02 recovery requirements

S02 must begin from the durable transfer/checkpoint only.

Before affected mutation or continuation:

1. resolve current meta/project-control;
2. verify Gate C authority is still valid;
3. verify same PP-002 instance/assignment;
4. verify exact product/protected refs;
5. recover operational branch/harness;
6. recover run/job IDs from durable state;
7. identify inherited vs non-inherited evidence;
8. fetch fresh external run/job state;
9. derive observed_state from those fresh source-bound receipts;
10. run consistency validation;
11. reconcile effect/evidence/cleanup;
12. choose safe next action.

Permitted decisions:
REUSE_RESULT
KEEP_OBSERVING
RECONCILE_EFFECT
BLOCK

RETRY_JUSTIFIED is not expected and no second workflow is proposed.

## Required safe outcomes

If S02 finds the operation STILL_RUNNING:
KEEP_OBSERVING

If it completed while sessions rolled:
verify terminal effect/evidence and:
REUSE_RESULT

If a child failed while parent remains active:
reconcile child effect separately and:
KEEP_OBSERVING parent / RECONCILE_EFFECT child

If durable identities cannot be trusted:
BLOCK

No missing predecessor memory may be converted into a guessed state.

## Corrected bookkeeping requirement

All current S02 observed snapshots must preserve:
- planned_intent separate from observed_state;
- source_kind / source_id;
- requested_at / responded_at / receipt_at when available;
- event_at separately;
- recorded_at;
- verified_at;
- UNKNOWN / UNCERTAIN where source evidence is absent.

The B-R1 validator or a documented byte-pinned compatible successor must reject any inconsistent current snapshot before use.

Historical defective Gate B 010 should remain a negative control.

## Proposed Gate C checkpoints

C-000 — PRE-EMISSION INTENT

C-010 — EMISSION / INITIAL VALIDATED OBSERVATION

C-020 — S01 PRE-ROLLOVER CHECKPOINT

C-030 — S02 RECOVERY ENTRY
No external state claim yet; authority/custody recovery only.

C-040 — S02 FRESH EXTERNAL OBSERVATION + VALIDATION

C-050 — S02 SAFE CONTINUATION DECISION

C-060 — TERMINAL RECONCILIATION

C-070 — SESSION ROLLOVER ASSESSMENT / TERMINAL RETURN

All append-only.

## Safety invariants

- workflow runs: exactly one;
- run attempts: exactly one;
- duplicate non-idempotent effects: ZERO;
- retries/replacements: ZERO;
- S01 post-checkpoint external observations/mutations: ZERO;
- guessed predecessor state: ZERO;
- stale planned-state claims: ZERO;
- timestamp conflations: ZERO;
- product mutation: ZERO;
- product ref movement: ZERO;
- main movement: ZERO;
- historical Gate B/B-R2 branch movement: ZERO;
- same accountable instance across S01 -> S02;
- successor session must explicitly identify non-inherited evidence;
- all disposable roots explicitly closed.

## Protected refs

feature/workspace-v0.1
e11579950ef7ed20e4b6eeee88f9c3597c1f074b

feature/workspace-run-026
e11579950ef7ed20e4b6eeee88f9c3597c1f074b

main
54cc3aad246c89a29f2a18be63c539db68cae041

Historical Gate B:
ops/pp-002-gate-b-actions
dd6e8bfecadab0a83c8008ea65300b1f0ba518f8

Historical B-R2:
ops/pp-002-gate-b-r2-actions
0e679ad863076098d92d8a7704f6ca88948b651b

## Proposed outputs

Session checkpoint:
validations/PP-002/GATE-C/C-020_S01_ROLLOVER_CHECKPOINT.json

S02 recovery evidence:
validations/PP-002/GATE-C/**

Final report:
protocols/PP-002_GATE-C_REAL_SESSION_ROLLOVER_REPORT.md

Implementation/adapter:
validation/pp002-gate-c/**

Operational harness:
bounded files on ops/pp-002-gate-c-actions only.

## Proposed terminal result

Exactly one:

GATE C PASS
GATE C REVISE
GATE C FAIL

PASS requires:
- genuine PP-002/S01 -> PP-002/S02 session rollover;
- frozen S01 checkpoint before rollover;
- S01 stops after checkpoint;
- S02 recovers same instance/assignment/authority from durable state;
- exact CONTROL/product/operational identities recovered;
- inherited vs non-inherited evidence explicitly separated;
- fresh external state queried before affected continuation;
- all S02 decision snapshots validated;
- safe continuation without duplicate effect;
- one workflow / one attempt;
- all owned disposable state closed;
- protected/historical refs unchanged;
- proactive terminal return.

## After Gate C

Gate C PASS does NOT adopt the Recovery Gate.

After terminal Gate C disposition, PP-002 must provide a separate final experimental recommendation:

PROMOTE
REVISE
or
REJECT

PROMOTE means only:
sufficient evidence exists to draft a separately authorized protocol successor candidate.

A Generic Protocol successor requires separate Owner / Project Control authorization.

## Not authorized by this proposal

This proposal grants NO execution authority.

Until explicit Owner approval and effective frozen authorization:
- do not create ops/pp-002-gate-c-actions;
- do not launch Actions;
- do not create an S01 rollover checkpoint as if Gate C were active;
- do not initiate PP-002/S02;
- do not modify Generic Protocol v1.0 or PP-002 v2;
- do not publish protocol successor/adoption artifacts.

## Suggested Owner approval

APPROVED — Authorize PP-002 Gate C Real Session Rollover Recovery under control/PP-002_GATE-C_PROPOSAL.md, using one isolated disposable workflow, stable PP-002 accountability across S01 -> S02, durable pre-rollover checkpointing, successor recovery only from durable state and normal authorized tool access, no product mutation, no historical operational-branch movement, and no protocol adoption.

After approval, PC-002 must reverify current control/protected refs and publish a separate effective Gate C authorization and route.
