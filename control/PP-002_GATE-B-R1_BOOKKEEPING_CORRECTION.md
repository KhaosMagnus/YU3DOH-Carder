# PP-002 — Gate B-R1 Bookkeeping Correction Contract

status: FROZEN
protocol_version: 1.0

experiment:
PP-002 — Execution Interruption Recovery Pilot

predecessor:
GATE B REVISE

predecessor_report:
protocols/PP-002_GATE-B_CONTROLLED_INTERRUPTION_REPORT.md

predecessor_disposition:
runs/PP-002_GATE-B_REVISE_DISPOSITION.md

correction_source:
validations/PP-002/GATE-B/060_BOOKKEEPING_CORRECTION.json

mode:
BOUNDED OFFLINE / READ-ONLY EXTERNAL STATE / NO ACTIONS EMISSION

purpose:
Correct and deterministically validate the observer/ledger bookkeeping defects GB-D01 and GB-D02 before any additional live experiment.

This contract does not amend Generic Protocol v1.0 or the frozen PP-002 v2 procedure. It corrects the experimental observer implementation/recording discipline.

## Structural rule

planned_intent and observed_state MUST be distinct structures.

planned_intent:
may contain proposed/nonemitted expectations before issuance.

observed_state:
MUST be derived from actual receipts/queries after issuance.

No lifecycle, acknowledgement, effect, evidence or cleanup field may be copied from planned_intent into observed_state merely because a logical operation ID matches.

If a material state lacks a supporting observation:
use UNCERTAIN / UNKNOWN as applicable.

Do not inherit:
CONFIRMED_NOT_DONE
or
NOT_EMITTED_CONFIRMED
across an emission boundary without positive operation-specific evidence.

## Source-timestamp rule

Every external observation used for a current state MUST retain:
- source_kind;
- source_id;
- requested_at, if durably captured, otherwise UNKNOWN;
- responded_at / receipt_at from the actual read;
- event_at separately where source supplies it;
- recorded_at for snapshot assembly;
- verified_at for later consistency verification.

recorded_at is never an observation timestamp.

verified_at is never an observation timestamp.

If source receipt time is absent:
mark it UNKNOWN; do not substitute assembly time.

## Derivation rule

Observed lifecycle/outcome/effect/evidence/cleanup are derived from explicit source facts.

Examples required by Gate B evidence:
- raw completed/success step contradicts CONFIRMED_NOT_DONE for that named operation;
- raw in_progress step contradicts CONFIRMED_NOT_DONE;
- acknowledged workflow ID contradicts NOT_EMITTED_CONFIRMED for the workflow emission;
- already-published immutable commit contradicts NOT_EMITTED_CONFIRMED for that publication.

## Consistency validator

A deterministic validator MUST reject at least:
1. NOT_EMITTED_CONFIRMED when the same snapshot/source contains a positive issuance acknowledgement;
2. CONFIRMED_NOT_DONE when the same snapshot/source shows completed, active or otherwise positively executed state for the same operation;
3. a claimed observation time that equals assembly/recorded time without a source receipt supporting that time;
4. observed-state entries without traceable source identifiers for material external claims;
5. silent carry-forward of planned states after parent/workflow emission.

The validator MUST emit exact operation IDs and violated invariants.

## Required negative test

Input:
validations/PP-002/GATE-B/010_EMITTED.json
plus
validations/PP-002/GATE-B/060_BOOKKEEPING_CORRECTION.json

Expected:
FAIL as a current observed ledger.

It must detect at minimum the five stale operation-state claims already identified:
GB-INTENT-PUBLISH
GB-OPS-CREATE
GB-EMIT
B1-EFFECT
B1-HOLD

It must also detect the observation-time / assembly-time defect.

## Required corrected derivation

Create a new append-only corrected derivation from existing Gate B receipts.

Do NOT rewrite:
010_EMITTED.json
020_OBSERVATION_LOSS.json
030_RECOVERY_OBSERVATION.json
040_VERIFIED_RECOVERY_DECISIONS.json
050_TERMINAL_RECONCILIATION.json
060_BOOKKEEPING_CORRECTION.json

For each corrected state:
- cite source receipt;
- use source-tied observation time;
- use UNCERTAIN when evidence is absent;
- separate event time from receipt time and assembly time.

## Required positive test

The corrected derivation MUST pass the same consistency validator with zero invariant violations.

## Scope

Permitted:
- read existing GitHub Gate B evidence;
- local/offline deterministic computation;
- add bounded validator/fixture code under validation/pp002-gate-b-r1/**;
- add append-only evidence under validations/PP-002/GATE-B-R1/**;
- publish the Gate B-R1 report.

Forbidden:
- create, rerun or cancel GitHub Actions;
- push/update ops/pp-002-gate-b-actions;
- modify Gate B frozen evidence;
- modify the Gate B report;
- modify Generic Protocol v1.0;
- modify PP-002 v2;
- product mutation;
- product ref movement;
- main movement;
- Gate C execution.

## Required output

protocols/PP-002_GATE-B-R1_BOOKKEEPING_REVALIDATION.md

Supporting evidence:
validations/PP-002/GATE-B-R1/**

Optional bounded validator implementation:
validation/pp002-gate-b-r1/**

Terminal result exactly one:
GATE B-R1 PASS
GATE B-R1 REVISE
GATE B-R1 FAIL

PASS requires:
- defective 010 rejected;
- all known GB-D01 contradictions detected;
- GB-D02 timestamp conflation detected;
- corrected append-only derivation accepted;
- zero contradictions in positive fixture;
- no source timestamp invented;
- no external operation emitted.

PASS does NOT authorize another live experiment.

After PASS, Project Control may consider a separately authorized corrected live Gate B revalidation.

Gate C remains NOT AUTHORIZED.
