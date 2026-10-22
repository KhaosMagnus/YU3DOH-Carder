# PILOT 001 — DEPLOYMENT VALIDATION → EXTERNAL DESIGN + QA

status: FROZEN
protocol_version: 1.0

## Purpose
Introduce Project Control at the current validation transfer boundary without changing test procedure mid-execution.

## Phase 1 — Finish current validation
Deployment Validation completes requested local/manual checks, screenshots/logs, exact CODE SHA verification and objective observations. Do not redo tests solely because the control protocol now exists.

## Phase 2 — Adopt protocol
Before results are sent to QA, Project Control sends Deployment Validation exact CONTROL SHA, role protocol, communication protocol and assigned output path. Deployment Validation acknowledges.

## Phase 3 — Publish evidence
Create `validations/<validation-id>/VALIDATION_EVIDENCE.md` with mission, exact CODE SHA, environment, test data, cases, expected/observed, evidence refs, unexpected findings, completeness and EVIDENCE READY / VALIDATION BLOCKED.

## Phase 4 — Transfer
Deployment returns short summary + exact CONTROL SHA + Transfer Envelope targeted to DESIGN_QA.

## Phase 5 — QA adoption
Project Control sends QA exact CONTROL SHA, QA role protocol, communication protocol and Transfer Envelope. QA reads evidence from control branch.

## Phase 6 — QA result
QA produces official result. Additional evidence routes back to DEPLOYMENT_VALIDATION via a new evidence request artifact.

## Success criteria
1. Owner does not manually copy full validation report.
2. Both roles consume same exact control artifact.
3. No evidence is lost.
4. QA identifies exact CODE SHA and evidence source.
5. Control history records handoff.

## Rollback
If pilot fails operationally, preserve evidence, use legacy transfer once, record protocol failure and correct the protocol. Do not block product validation to prove the control system.
