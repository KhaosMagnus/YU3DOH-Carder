# PP-002 — Execution Interruption Recovery Pilot

status: FROZEN
protocol_version: 1.0
experiment_status: ACTIVE / EXPERIMENTAL ONLY

source:
PROJECT_CONTROL / PC-002

accountable_role:
PROTOCOL_PORTABILITY / PP-002

purpose:
Evaluate whether an explicit Execution Interruption Recovery Gate materially improves operational continuity without modifying Generic Project Control Protocol v1.0.

generic_protocol:
protocols/GENERIC_PROJECT_CONTROL_PROTOCOL-v1.0.md

generic_protocol_status:
FROZEN / UNCHANGED

candidate_concept:
EXECUTION INTERRUPTION RECOVERY GATE — PROPOSED / NOT ADOPTED

product_baseline_reference:
feature/workspace-v0.1 @ e11579950ef7ed20e4b6eeee88f9c3597c1f074b

main_reference:
54cc3aad246c89a29f2a18be63c539db68cae041

product_mutation:
FORBIDDEN

protocol_mutation:
FORBIDDEN

## Evidence basis

Primary durable inputs:
- control/RUN-026_SESSION_PILOT_EVALUATION.md
- control/RUN-026_INTERRUPTION_RECOVERY_OBSERVATION.md
- validations/RUN-025/ENV-005_ENVIRONMENT_READINESS_REPORT.md
- validations/RUN-025/DEPLOY-005_VALIDATION_EVIDENCE.md
- runs/RUN-025_ENV-005_READY_DISPOSITION.md
- runs/RUN-025_DQA-004_PARTIAL_DISPOSITION.md
- validations/RUN-026/DQA-005_EXTERNAL_QA_REPORT.md
- validations/RUN-026/DEPLOY-006_EVIDENCE_ACCESS_REPORT.md
- protocols/GENERIC_PROJECT_CONTROL_PROTOCOL-v1.0.md

Use live GitHub state and historical exact revisions/Actions records where conclusions depend on current or external state.

Do not infer quota/model interruption where not directly evidenced.

## Experimental hypothesis

After an interruption where the operational state of an issued action is uncertain, recovery should occur before new mutations.

Candidate semantics:

ACTIVE
->
PAUSED_CLEAN

or

ACTIVE
->
INTERRUPTED / RECOVERY_REQUIRED
->
RECOVERING
->
ACTIVE | SESSION_ROLLOVER | BLOCKED

A simple Owner instruction "Continúa" after a non-clean interruption should authorize recovery first, then automatic continuation only after authority and operational state have been reconciled.

Conversation continuity alone is not proof of operational continuity.

## Per-operation reconciliation model

Each materially stateful or externally running operation should be classified as one of:

CONFIRMED_DONE
CONFIRMED_NOT_DONE
STILL_RUNNING
UNCERTAIN

For each operation recover when available:
- intent;
- operation type;
- exact authority;
- product/control revision;
- external operation identifier;
- issue time;
- last observed state;
- current externally verified state;
- possible effects;
- evidence produced;
- cleanup state;
- whether retry is safe;
- whether retry is necessary;
- whether existing result can be reused;
- accountable observer/closer.

An UNCERTAIN non-idempotent operation must not be blindly repeated.

## Gate structure

### GATE A — Historical Recovery Replay

status:
AUTHORIZED

mode:
READ-ONLY

Purpose:
Apply the proposed recovery procedure retrospectively to real durable traces without modifying repository state or rerunning operations.

Mandatory primary cases:

A1 — RUN 025 / ENV-005:
- Actions run 40559807626
- job 122385467223
- Actions run 40561137872
- job 122390152741

Questions:
- What was the first operation's true state when the second was launched?
- Could recovery have identified STILL_RUNNING?
- Would the proposed gate have avoided duplicate execution?
- What result should have been reused/reconciled when the first completed later?
- Who should close the late-finishing attempt?

A2 — RUN 025 / DEPLOY-005:
- Actions run 40564804923
- job 122403104268
- Actions run 40564959018
- job 122403657714

Questions:
- What was the first operation's true state when the second was launched?
- Was its later browser timeout known at launch time?
- Which effects/cleanup remained uncertain?
- What should recovery have done before launching a substitute?
- How should a later cancelled/partial attempt be closed after another attempt succeeds?

A3 — RUN 026 / DEV-008 usage-limit interruption:
Use only the durable interruption observation and subsequent Development report.
Questions:
- What state was durably knowable at interruption?
- What operational state remained unrecorded?
- Which checks would an explicit gate have required before continuation?
- Which conclusions are impossible because executor-local telemetry was not durably preserved?

A4 — RUN 026 / DQA-005 -> DEPLOY-006 evidence transport:
Questions:
- Distinguish evidence transport failure from product failure and execution interruption.
- Determine whether the recovery model usefully applies to evidence accessibility without conflating it with candidate execution.
- Identify which provenance data made exact recovery possible without rerunning product tests.

Required Gate A output:
protocols/PP-002_GATE-A_HISTORICAL_RECOVERY_REPLAY.md

Gate A must end with exactly one:
GATE A PASS
GATE A REVISE
GATE A FAIL

PASS means the proposed reconciliation procedure produces safe, evidence-supported decisions across the replay cases without inventing unavailable facts.

REVISE means the concept appears useful but its state model/required fields/decision rules need correction before live testing.

FAIL means the proposed gate adds no material safety or produces unsafe/ambiguous decisions in the replay.

### GATE B — Controlled Interruption with Disposable State

status:
NOT AUTHORIZED

May be authorized only by a new Project Control artifact after Gate A is consumed.

Intended purpose:
Use a disposable, auditable external operation with minimal/no product effect to test loss of observation and recovery.

Requirements if later authorized:
- separate operational branch/substrate;
- exact external operation ID;
- deliberately bounded effect;
- no protected product ref movement;
- no production data mutation;
- capture intent/emission/observation/reconciliation;
- test STILL_RUNNING, DONE-with-lost-confirmation and partial-failure/cleanup where feasible;
- demonstrate effect occurs at most once.

### GATE C — Real Session Rollover Recovery

status:
NOT AUTHORIZED

May be authorized only after Gate B disposition.

Intended purpose:
Exercise an actual S01 -> S02 replacement while role, assignment, authority and accountable ownership remain unchanged.

S02 must recover solely from durable state plus normal authorized tool access, not hidden conversational memory.

Required proof if later authorized:
- predecessor session checkpoint;
- exact CONTROL SHA;
- exact product/ref state;
- in-flight operation ledger;
- inherited vs non-inherited evidence;
- current external state reconciliation;
- safe continuation decision;
- terminal return;
- no duplicated non-idempotent effect.

## Decision criteria after all gates

Final PP-002 recommendation must be exactly one:

PROMOTE
REVISE
REJECT

PROMOTE:
sufficient evidence exists to draft a separately authorized protocol successor candidate.

REVISE:
concept remains promising but additional/modified experiments are required.

REJECT:
evidence does not justify adding the mechanism.

No recommendation itself amends Generic Protocol v1.0.

A protocol successor, including any v1.1, requires separate Owner/Project Control authorization and a new frozen artifact.

## Measurement

For each experimental gate record:
- time/steps to recover;
- duplicate operations;
- incorrect state assumptions;
- new Owner prompts required;
- operations safely reused/waited/retried/blocked;
- cleanup closure;
- evidence inherited/not inherited;
- stale-context/baseline errors;
- administrative overhead;
- terminal auto-return behavior.

## Safety and scope

Do not:
- modify Generic Protocol v1.0;
- modify product code;
- move product refs;
- start RUN 027;
- create a product CR;
- launch Gate B or Gate C;
- intentionally exhaust model quota;
- interfere with active unrelated work;
- reinterpret historical silence as proof of failure;
- fabricate external operation state.

Current authorization:
GATE A ONLY.
