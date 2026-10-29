# PP-002 — Execution Interruption Recovery Pilot v2

status: FROZEN
protocol_version: 1.0
experiment_status: ACTIVE / EXPERIMENTAL ONLY
supersedes_experimental_procedure:
control/PP-002_EXECUTION_INTERRUPTION_RECOVERY_PILOT.md

source:
PROJECT_CONTROL / PC-002

accountable_role:
PROTOCOL_PORTABILITY / PP-002

basis:
runs/PP-002_GATE-A_REVISE_DISPOSITION.md
protocols/PP-002_GATE-A_HISTORICAL_RECOVERY_REPLAY.md

Generic Project Control Protocol v1.0:
FROZEN / UNCHANGED

candidate_concept:
EXECUTION INTERRUPTION RECOVERY GATE — PROPOSED / NOT ADOPTED

product_mutation:
FORBIDDEN

product_ref_movement:
FORBIDDEN

live_experiment:
NOT AUTHORIZED

## 1. Recovery trigger

Recovery is required when an interruption leaves the state or effects of an issued materially stateful/external operation uncertain.

A clean pause may remain PAUSED_CLEAN only when:
- no materially stateful operation is in uncertain flight;
- current authority/custody remains clear;
- no external effect could have occurred without durable observation.

After RECOVERY_REQUIRED, a simple instruction such as "Continúa" authorizes recovery first under existing authority.

It does NOT by itself authorize:
- new scope;
- blind retry;
- cancellation;
- replacement/parallel execution;
- product mutation outside existing authority.

Unaffected work may continue only if its safety does not depend on the unresolved operation.

## 2. Operation identity and hierarchy

Every materially relevant operation receives a logical operation record.

Required fields:
- logical_operation_id;
- parent_operation_id or NONE;
- purpose / intended effect;
- operation type;
- accountable owner/closer;
- authority artifact;
- CONTROL SHA;
- product SHA/ref when applicable;
- harness/operational SHA when applicable;
- external operation ID when known;
- emission channel;
- effect/output namespace.

Parent and child operations are separate.

Examples:
workflow != child browser process != artifact upload != fixture cleanup.

A child failure does not establish terminal parent failure.

## 3. Observation freshness

Every state conclusion must record:
- observation source;
- observation timestamp;
- event timestamp if distinct/known;
- last prior observation timestamp if relevant;
- current verification timestamp.

An old nonterminal observation does not prove current nonterminal state.

If current state cannot be queried or verified:
classification = UNCERTAIN.

Silence, missing report/path, lost acknowledgement or unavailable log does not prove failure, nonemission or nonexecution.

Unknown issue/emission acknowledgement time remains explicitly UNKNOWN.

## 4. Core operation classification

Exactly one current classification per operation:

CONFIRMED_DONE
CONFIRMED_NOT_DONE
STILL_RUNNING
UNCERTAIN

Meanings:

CONFIRMED_DONE:
positive evidence shows the named operation reached a terminal lifecycle state.

CONFIRMED_NOT_DONE:
positive evidence shows the intended operation/effect did not occur or the named child operation did not start.

STILL_RUNNING:
a fresh current external observation establishes nonterminal activity.

UNCERTAIN:
identity, emission, current state or material effects cannot be verified sufficiently.

Classification is lifecycle only. It does not encode success.

## 5. Outcome axis

Separately record:

SUCCESS
FAILURE
CANCELLED
PARTIAL
UNKNOWN
NOT_APPLICABLE

CONFIRMED_DONE + CANCELLED is valid.
CONFIRMED_DONE + FAILURE is valid.
CONFIRMED_DONE must never be interpreted automatically as successful usable evidence.

Reuse requires exact, sufficient, attributable SUCCESS for the intended purpose.

## 6. Effect axis

Separately record:

NO_EFFECT_CONFIRMED
EFFECT_CONFIRMED
POSSIBLE_EFFECT
EFFECT_UNKNOWN
NOT_APPLICABLE

For non-idempotent operations, POSSIBLE_EFFECT or EFFECT_UNKNOWN blocks blind retry until reconciled or safely isolated under separate replacement/parallel authority.

## 7. Evidence axis

Separately record:

EVIDENCE_VERIFIED
EVIDENCE_AVAILABLE_UNVERIFIED
EVIDENCE_INACCESSIBLE
EVIDENCE_INSUFFICIENT
NO_EVIDENCE_EXPECTED
UNKNOWN

Evidence existence, accessibility, sufficiency and QA acceptance remain separate concepts.

Evidence transport/access issues ordinarily remain under evidence-management/QA authority and enter this recovery gate only when an issued operation's state/effect itself is uncertain.

## 8. Cleanup axis

Separately record:

CLEANUP_CONFIRMED
CLEANUP_REQUIRED
CLEANUP_UNKNOWN
CLEANUP_NOT_APPLICABLE

Runner/process termination does not prove application-level cleanup.

Cleanup state may block reuse of a specific environment/effect namespace while leaving isolated independently verified evidence usable.

## 9. Emission record

Before or immediately after issuing any materially stateful external operation, durably record when feasible:
- intent;
- authority;
- exact CONTROL/product/harness revisions;
- logical operation ID;
- external ID if acknowledged;
- issuance timestamp;
- acknowledgement state;
- expected effect/output namespace;
- retry/idempotency characteristics;
- named closer.

Emission acknowledgement states:

NOT_EMITTED_CONFIRMED
EMITTED_ACKNOWLEDGED
EMITTED_UNACKNOWLEDGED
UNKNOWN

Absence of a result is not proof of NOT_EMITTED_CONFIRMED.

Infrastructure pushes known to trigger Actions count as operation emissions.

## 10. Recovery decision precedence

For affected operations:

1. verify authority and exact identities;
2. reconstruct emission;
3. obtain a fresh external observation when possible;
4. classify lifecycle;
5. classify outcome;
6. reconcile effect;
7. reconcile evidence;
8. reconcile cleanup;
9. determine terminal ownership;
10. only then choose a safe next action.

Safe next actions:

REUSE_RESULT
KEEP_OBSERVING
RECONCILE_EFFECT
RETRY_JUSTIFIED
BLOCK

Default rules:

STILL_RUNNING:
KEEP_OBSERVING.

UNCERTAIN:
observe/reconcile; BLOCK the affected repeat/mutation if uncertainty remains material.

CONFIRMED_DONE + SUCCESS + sufficient verified evidence/effect:
REUSE_RESULT when exact subject/authority matches.

CONFIRMED_DONE + FAILURE/CANCELLED/PARTIAL:
RECONCILE_EFFECT and cleanup/evidence before any retry decision.

CONFIRMED_NOT_DONE:
RETRY_JUSTIFIED only after need, authority and effect/isolation checks.

## 11. Retry rules

A retry/replacement is never justified solely by:
- elapsed time;
- missing logs;
- lost chat;
- silence;
- a missing final report;
- a child failure while parent remains active;
- successful completion of a different substitute.

Required retry preconditions:
- exact operation identity or explicit lost-ID condition;
- fresh current classification;
- current authority;
- explicit remaining need/delta;
- exact candidate compatibility;
- effect and output namespace reconciliation;
- cleanup/isolation assessment;
- bounded resource/deadline rationale;
- named closer for both original and replacement;
- delegation sufficient for replacement/parallel execution.

Missing material retry fields:
KEEP_OBSERVING, RECONCILE_EFFECT or BLOCK.
Do not invent permission.

## 12. Replacement / parallel exception

Launching a replacement while an original is STILL_RUNNING or UNCERTAIN requires explicit justification.

Record:
- why waiting is insufficient;
- exact delta in replacement method;
- compatibility with the same required candidate/subject;
- isolated runner/state/effects;
- distinct evidence/output namespace;
- bounded cost/deadline;
- authority/delegation for concurrency;
- original operation closer;
- replacement operation closer.

A replacement result does not silently close or cancel the original.

## 13. Late-operation closure

Every emitted operation retains a named closer until all applicable dimensions are dispositioned:
- terminal lifecycle;
- outcome;
- effect;
- evidence;
- cleanup;
- retention/disposal when material.

If executor/instance becomes unavailable:
PROJECT_CONTROL assigns a successor closer.

An accepted substitute does not discharge late-operation closure responsibility.

Late outcomes must be reconciled without rewriting frozen historical reports.

## 14. Scoped continuation

Recovery is operation-scoped.

Unrelated/unaffected work may continue if:
- authority remains valid;
- it cannot conflict with unresolved effect/state;
- its evidence/candidate subject is unchanged.

Affected mutation/retry remains blocked until reconciliation reaches a safe next action.

"Continúa" means:
RECOVER AFFECTED OPERATIONS FIRST,
then automatically continue reconciled/unaffected authorized work.

No additional Owner prompt is required merely to perform read-only recovery within existing authority.

A new mutation/retry outside existing delegation still requires authority.

## 15. Historical information boundary

For retrospective replay distinguish:

OBSERVED EVIDENCE
INFERENCE
PLAUSIBLE HYPOTHESIS
RECOVERY DECISION
POST-HOC RECONCILIATION EVIDENCE

Later outcomes cannot be projected backward into earlier knowledge.

Safe UNCERTAIN/BLOCK is a valid deterministic result when history lacks material telemetry.

## 16. Gate A2 — Revised historical revalidation

status:
AUTHORIZED FOR SEPARATE ROUTE ONLY

mode:
READ-ONLY

Purpose:
Apply this corrected procedure to the same A1–A4 cases and determine whether the revised semantics now yield deterministic safe decisions without hidden redefinition.

Required output:
protocols/PP-002_GATE-A2_REVISED_HISTORICAL_REVALIDATION.md

Result exactly one:
GATE A2 PASS
GATE A2 REVISE
GATE A2 FAIL

GATE A2 PASS is required before Project Control may consider authorizing Gate B.

## 17. Gate B

NOT AUTHORIZED.

No live controlled interruption may begin until Gate A2 PASS is consumed and Project Control separately authorizes Gate B.

## 18. Gate C

NOT AUTHORIZED.

## 19. Protocol adoption

This experimental successor does not modify or supersede Generic Project Control Protocol v1.0.

PP-002 may later recommend PROMOTE / REVISE / REJECT.

Any protocol successor candidate requires separate authorization.
