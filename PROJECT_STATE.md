# PROJECT STATE

artifact_id: PROJECT-STATE
artifact_type: project_state
status: ACTIVE
protocol_version: 1.0

## Product refs

main:
54cc3aad246c89a29f2a18be63c539db68cae041

feature/workspace-v0.1:
e07140d5a9555a17b7b2306a45625c14adfafc8e

feature/workspace-run-025:
dd968ba05e579461962bbcced0e9cae3cd4c3d23

## RUN 025 — CR-0001.4 / F-04

Development:
DEV-007 COMPLETE / READY FOR EXTERNAL QA

Initial External QA:
DQA-004 PARTIAL

Environment readiness:
ENV-005 COMPLETE / ENVIRONMENT READY

Operational validation:
DEPLOY-005 COMPLETE / EVIDENCE READY

Deployment evidence:
validations/RUN-025/DEPLOY-005_VALIDATION_EVIDENCE.md

Deployment disposition:
runs/RUN-025_DEPLOY-005_EVIDENCE_DISPOSITION.md

Current active authority:
SAME DESIGN_QA / DQA-004 — RESUMED / FINAL ADJUDICATION

Resumption request:
validations/RUN-025/DQA-004_EXTERNAL_QA_RESUMPTION_REQUEST.md

Resumption route:
routing/ROUTE-RUN-025-RESUME-DQA-004.md

Expected final report:
validations/RUN-025/DQA-004_EXTERNAL_QA_FINAL_REPORT.md

Candidate:
dd968ba05e579461962bbcced0e9cae3cd4c3d23

Candidate mutation:
NOT AUTHORIZED

Integration:
NOT AUTHORIZED

## Evidence status

Authoritative six-command gate:
evidence produced at exact candidate with all required commands exit 0.

F04-B01..F04-B26:
evidence produced and durably published by DEPLOY-005.

Explicit qualifications remain for DQA-004 adjudication:
- six requestfailed facets GETs with net::ERR_ABORTED;
- baseline-reproduced favicon/React scrollLocker warnings;
- intentional 503 error-state stimuli;
- synthetic DOM events behind the existing modal Drawer for state-preservation cases;
- first incomplete DEPLOY attempt carries no acceptance credit.

EVIDENCE READY is not QA PASS.

## CR-0002

Implementation remains unauthorized until RUN 025 receives official QA PASS and authorized integration, followed by post-F04 compatibility review and exact baseline assignment.

## Session / response pilot

DEV-007/S01 required explicit Owner prompt for final return.
DQA-004 PARTIAL, ENV-005 READY and DEPLOY-005 EVIDENCE READY all auto-returned under explicit terminal-return instructions.

No Generic Protocol amendment is authorized yet.
