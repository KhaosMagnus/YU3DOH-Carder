# PP-002 — Gate B REVISE Disposition

status: FROZEN
protocol_version: 1.0

source:
PROTOCOL_PORTABILITY / PP-002 / S01

target:
PROJECT_CONTROL / PC-002

experiment:
PP-002 — Execution Interruption Recovery Pilot

gate:
GATE B — CONTROLLED INTERRUPTION WITH DISPOSABLE STATE

official_result:
GATE B REVISE

canonical_report:
protocols/PP-002_GATE-B_CONTROLLED_INTERRUPTION_REPORT.md

report_publication_sha:
3f6e3b3c1b9a4d1b8f833ab779c84fde7b5842d4

report_blob:
3f582d4e4521c2289033d9944190c3e1940ce5d1

correction_artifact:
validations/PP-002/GATE-B/060_BOOKKEEPING_CORRECTION.json

correction_blob:
31935ed1f066a6e4fef29faca235337363a47414

consumed_control:
2d22969421bfe92d283bae0202c0aa3764105a2c

operational_branch:
ops/pp-002-gate-b-actions

harness_sha:
dd6e8bfecadab0a83c8008ea65300b1f0ba518f8

actions_run:
40832621820 / attempt 1

jobs:
- B1 123310073647 — SUCCESS
- B2 123310073956 — SUCCESS
- B3 123310073907 — EXPECTED FAILURE

Project Control accepts GATE B REVISE.

The workflow-level FAILURE is expected from the deliberately failing B3 child and is not the reason for the Gate result.

Live safety findings retained:
- B1 recovered STILL_RUNNING and correctly used KEEP_OBSERVING;
- B2 recovered missed terminal confirmation and correctly used REUSE_RESULT;
- B3 separated failed child from active parent and used RECONCILE_EFFECT / KEEP_OBSERVING;
- duplicate non-idempotent effects: ZERO;
- retries: ZERO;
- replacements: ZERO;
- cancellations: ZERO;
- three owned disposable roots explicitly removed;
- no live operation remains pending;
- product mutation/ref movement/main movement: NONE.

Blocking bookkeeping defects:
GB-D01 — planned lifecycle/acknowledgement state was copied into emitted observed-state data, producing at least five false/stale operation-state claims.

GB-D02 — snapshot assembly time was mislabeled as external observation time instead of preserving source request/response timing.

Impact:
The actual recovery decisions happened to be correct because they were based on fresh authority/IDs/external reads, but an intermediate durable ledger could mislead a later recovery consumer toward repeating already-issued work. Successful outcomes therefore do not cure the bookkeeping defect.

Required corrections before any further live experiment:
1. separate planned_intent from observed_state structurally;
2. derive observed state only from source receipts/queries; missing receipt => UNCERTAIN, never inherited NOT_DONE;
3. preserve source request/response timestamps unchanged;
4. record assembly/recorded/verified timestamps separately;
5. add a consistency validator that rejects state claims contradicted by raw receipts in the same snapshot;
6. demonstrate the validator rejects the defective 010 snapshot and accepts a corrected derivation.

Gate C:
NOT AUTHORIZED

Further live Gate B execution:
NOT AUTHORIZED BY THIS DISPOSITION

Generic Project Control Protocol v1.0:
FROZEN / UNCHANGED

Execution Interruption Recovery Gate:
PROPOSED / NOT ADOPTED

Next:
GATE B-R1 — BOOKKEEPING CORRECTION REVALIDATION, no external execution.
