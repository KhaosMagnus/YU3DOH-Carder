# PP-002 — Gate C Effective Authorization

artifact_id: PP-002-GATE-C-AUTHORIZATION
artifact_type: execution_authorization
status: FROZEN
protocol_version: 1.0
source_role: OWNER / PROJECT_CONTROL
source_instance: PC-003
target_role: PROTOCOL_PORTABILITY
target_instance: PP-002

experiment: PP-002 — Execution Interruption Recovery Pilot
authorized_gate: GATE C — REAL SESSION ROLLOVER RECOVERY
authorization: GRANTED / EFFECTIVE
execution_at_publication: NOT STARTED
owner_approval: control/PP-002_GATE-C_OWNER_APPROVAL.md
approved_proposal: control/PP-002_GATE-C_PROPOSAL.md
approved_proposal_blob: de46b0d23326fe4c565c5487cf0ebc763954e7f7
coordinator_succession: control/PC-003_SUCCESSION.md
control_preflight: meta/project-control @ d4e253c5db78902de6581e3266e16d2954491532
activation_control: exact Git commit containing this authorization and route; supplied to PP-002/S01 in the activation envelope
precondition: GATE B-R2 COMPLETE / PASS
precondition_disposition: runs/PP-002_GATE-B-R2_PASS_DISPOSITION.md

## Mission and authority

Execute exactly the bounded Gate C experiment defined in the approved proposal, without redesign or scope expansion. The proposal is normative for detailed operational/checkpoint conditions; restrictions in this authorization are additional explicit gates.

Accountable role and instance remain PROTOCOL_PORTABILITY / PP-002, continuously across different actual conversation sessions PP-002/S01 -> PP-002/S02. PROJECT_CONTROL / PC-003 coordinates the turnover but is not the experimental successor session.

New isolated operational branch: ops/pp-002-gate-c-actions.
Branch creation and bounded harness/workflow changes are authorized only after this effective activation. It did not exist during preflight.

Exactly ONE disposable GitHub Actions workflow, ONE run, ONE attempt. No duplicate, rerun, replacement, parallel workflow or ordinary cancellation is permitted. Emergency cancellation only if needed to contain escaped effect, with immediate documentation.

Allowed: publish bounded adapter under validation/pp002-gate-c/**, append-only evidence under validations/PP-002/GATE-C/**, isolated harness under the new ops branch, source-bound run/job observations, safe continuation/reconciliation and bounded cleanup of owned disposable roots.

## Checkpoint and rollover contract

Mandatory append-only checkpoints: C-000, C-010, C-020, C-030, C-040, C-050, C-060, C-070.

S01 must publish durable, fully validated C-020 before exiting. C-020 must pin role PP-002, instance PP-002, session S01, successor S02, exact CONTROL SHA, authority/route, all protected refs, operational branch and harness SHA, workflow/run/attempt/jobs, logical ledger, latest source-bound observations and timestamps, lifecycle/outcome/effect/evidence/cleanup states, accountable closer, inherited vs explicitly NON-INHERITED evidence, uncertainties, safe-next-action, and S01's stop declaration.

After frozen C-020, S01 stops all observation/polling, mutation, retry, cancellation or cleanup, apart from a documented emergency safety stop. It sends a SESSION ROLLOVER envelope, not a terminal Gate C verdict. Owner/PC-003 separately starts PP-002/S02 from that durable handoff.

S02 MUST recover solely from durable state and normally authorized tools. Before any affected continuation, S02 rechecks control authority and protected refs, recovers exact harness/run/job/ledger identities, separates inherited from NON-INHERITED state, obtains fresh external source-bound run/job observations, validates corrected snapshots, reconciles effect/evidence/cleanup, and then determines safe action. No guessed predecessor private memory.

## Corrected bookkeeping and decisions

planned_intent and observed_state are structurally separate. Current observed state only from actual receipts, with source_kind/source_id, requested_at/responded_at/receipt_at where present, event_at separately, recorded_at/verified_at separately. Missing source evidence => UNKNOWN / UNCERTAIN, never invented timestamps or inherited planned lifecycle.

Use B-R1 consistency validator or documented byte-pinned compatible successor on every material decision snapshot, including negative control historical Gate B defective 010.

Allowed continuation: KEEP_OBSERVING for still running; REUSE_RESULT for verified terminal effects and evidence; RECONCILE_EFFECT for failed child while parent remains active; BLOCK if authority or identity materially uncertain. No second workflow/RETRY_JUSTIFIED is proposed.

## Frozen protected refs

main: 54cc3aad246c89a29f2a18be63c539db68cae041
feature/workspace-v0.1: e11579950ef7ed20e4b6eeee88f9c3597c1f074b
feature/workspace-run-026: e11579950ef7ed20e4b6eeee88f9c3597c1f074b
ops/pp-002-gate-b-actions: dd6e8bfecadab0a83c8008ea65300b1f0ba518f8
ops/pp-002-gate-b-r2-actions: 0e679ad863076098d92d8a7704f6ca88948b651b

## Invariants, stop, output

Exactly one run/attempt; zero duplicated non-idempotent effects, retries/replacements, S01 post-checkpoint observations/mutations, guessed non-inherited state, stale observed-state claims, timestamp conflation, product/ref mutations or historical ops-branch movement. All disposable roots must be explicitly closed.

STOP affected execution and return to PC-003 for conflicting control/protected refs, untrustworthy run/job identity, failed ledger validation, escaping effects, bounded cleanup failure or any need for unauthorized attempt.

Output: protocols/PP-002_GATE-C_REAL_SESSION_ROLLOVER_REPORT.md
Evidence: validations/PP-002/GATE-C/**
Adapter: validation/pp002-gate-c/**
S01 checkpoint: validations/PP-002/GATE-C/C-020_S01_ROLLOVER_CHECKPOINT.json
Harness: ops/pp-002-gate-c-actions (bounded files only)

Terminal Gate C result: PASS / REVISE / FAIL. After disposition, PP-002 supplies separate PROMOTE / REVISE / REJECT recommendation, retaining material untested cases (actual quota exhaustion, involuntary crash, lost issuance acknowledgment). A Gate C PASS does not adopt any protocol.

Generic Protocol v1.0: FROZEN / UNCHANGED
PP-002 v2: FROZEN / UNCHANGED
Recovery Gate: PROPOSED / NOT ADOPTED
Protocol successor/adoption: NOT AUTHORIZED
Return: PROTOCOL_PORTABILITY / PP-002 -> PROJECT_CONTROL / PC-003
