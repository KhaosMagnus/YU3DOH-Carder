# RUN 026 — Interruption / Recovery Observation

status: FROZEN
protocol_version: 1.0
experiment_status: OBSERVATION ONLY / NO PROTOCOL AMENDMENT

source:
PROJECT_CONTROL / PC-002

subject:
DEVELOPMENT / DEV-008 / S01

run:
RUN 026 — CR-0002 Library Dark Theme

## Observed interruption

During active DEV-008/S01 execution, the Owner supplied direct UI evidence showing a terminal usage-limit condition:

- "You've hit your usage limit"
- "You're out of Codex and Work usage"

The interruption occurred after the candidate had already been published, but before Development had published its final implementation report/evidence/return.

Project Control performed read-only GitHub observation at that time and verified:

control:
b3b066bf0c34a42d6e7880806ffacaf93ac598e7

baseline:
feature/workspace-v0.1 @ dd968ba05e579461962bbcced0e9cae3cd4c3d23

candidate:
feature/workspace-run-026 @ e11579950ef7ed20e4b6eeee88f9c3597c1f074b

main:
54cc3aad246c89a29f2a18be63c539db68cae041

implementation report:
ABSENT at interruption observation

The executor UI immediately before interruption reported:
- exact candidate already published;
- six authoritative commands passed;
- Workspace Service 1088 pass / zero fail;
- Chromium theme matrix complete;
- retained F04 cases assembled;
- Firefox complete rerun still finishing;
- final evidence package/report/return still pending.

These UI statements were not treated as final acceptance evidence at the interruption point.

## Resumption

After usage became available again, the Owner resumed the SAME DEV-008/S01 conversation with the simple instruction:

"Continúa"

No new recovery procedure was supplied to the executor.

DEV-008/S01 subsequently published:

implementations/RUN-026_IMPLEMENTATION_REPORT.md

control revision:
6e9f503ed0e05016de50da5630cdeaeb6948725e

final candidate remained:
e11579950ef7ed20e4b6eeee88f9c3597c1f074b

No second product commit was added after the interrupted candidate.

Development also published the durable evidence package and emitted the terminal return envelope proactively.

## Pilot finding

A real execution interruption DID occur.

A session rollover did NOT occur:
DEV-008 remained in S01.

The final Development report states:
"Recovery success/failure: not exercised."

Project Control does not accept that phrase as a complete description of the pilot event.

Correct experimental interpretation:

- interruption: CONFIRMED;
- same-session continuation: CONFIRMED;
- candidate continuity: CONFIRMED;
- no duplicated product implementation commit: CONFIRMED;
- terminal auto-return after resumption: CONFIRMED;
- explicit recovery checkpoint before continuing: NOT OBSERVED / NOT DURABLY RECORDED;
- explicit reconciliation of potentially active external operations before new work: NOT DURABLY RECORDED;
- whether any validation rerun was caused specifically by interruption: NOT ESTABLISHED;
- unsafe product mutation after resumption: NOT OBSERVED;
- S01 -> S02 rollover recovery: NOT EXERCISED.

Therefore the incident demonstrates successful outcome continuity, but does NOT yet prove a formal interruption-recovery mechanism.

## Recommendation

RUN 026 session-pilot disposition remains:
REVISE

Generic Project Control Protocol v1.0 remains frozen.

Candidate future concept remains:
EXECUTION INTERRUPTION RECOVERY GATE — PROPOSED / NOT ADOPTED

The strongest remaining gap is durable operational reconciliation:
before repeating or continuing potentially stateful work after interruption, reconstruct issued operations, current external state, completed/uncertain effects, cleanup, evidence and publication state.

This observation does not affect CR-0002 product acceptance.
Independent External QA remains required.
