# ROUTE — Q01-IMPL-001 / DESIGN_QA DQA-007 Independent Review

artifact_id: ROUTE-PP-002-Q01-DQA-007
artifact_type: frozen_qa_route
status: FROZEN
protocol_version: 1.0
source: PROJECT_CONTROL / PC-003
target: DESIGN_QA / DQA-007
assignment: Q01-IMPL-001 — Source Retrieval Provenance Collector Guard
mode: AUTHORIZED INDEPENDENT OFFLINE QA / NO LIVE EXECUTION

PRECONDITION: runs/PP-002_Q01_IMPLEMENTATION_INTAKE.md
QA AUTHORIZATION: control/PP-002_Q01_DQA-007_INDEPENDENT_QA_AUTHORIZATION.md
PRIMARY QA REQUEST: validations/PP-002/Q01-COLLECTOR/DQA-007_EXTERNAL_QA_REQUEST.md
EXACT CODE/EVIDENCE CANDIDATE: meta/project-control @ 328e57035d34f98c4d8d417729e8b12f91894e95
IMPLEMENTATION REPORT: implementations/PP-002_Q01_OFFLINE_IMPLEMENTATION_REPORT.md @ blob 8f8e6b0a63b0bc5ad4c995134bf20f6d8a74ac76
FROZEN DESIGN: handoffs/PP-002_Q01_COLLECTOR_CORRECTION_DESIGN_HANDOFF.md @ blob c72e0a6d0889ceee4e901126a33587072180017f
ORIGINAL IMPLEMENTATION AUTHORITY: control/PP-002_Q01_OFFLINE_IMPLEMENTATION_AUTHORIZATION.md
QA OUTPUT REPORT: validations/PP-002/Q01-COLLECTOR/DQA-007_EXTERNAL_QA_REPORT.md
QA OUTPUT EVIDENCE: validations/PP-002/Q01-COLLECTOR/DQA-007/**
QA ACTIVATION CONTROL: exact coordinator commit containing this route, supplied by PC-003

DQA-007 independently retrieves and byte-pins candidate and all needed retained evidence from GitHub, checks complete source/manifest/authority custody, reproduces the complete offline F01–F31 + regressions + two deterministic replays, independently audits raw Q01/R2 historical oracles and fake callback blocking, and returns PASS / PARTIAL / FAIL / REGRESSION / INCONCLUSIVE with explicit evidence. Separate reviewer from PP-002; do not use implementation self-test as an independent verdict.

PERMITTED WRITES: Only new QA report and new validations/PP-002/Q01-COLLECTOR/DQA-007/** under meta/project-control using expected-head/CAS, no force. Read GitHub and execute local isolated offline test processes without networking. QA does not create/patch candidate code, update central mutable indexes or run GitHub Actions. If inputs unavailable or environment inadequate, return INCONCLUSIVE/PARTIAL with precise blocker; never invent a PASS.

CONTROL PROTECTIONS: Gate C REVISE, final PP-002 REVISE, P01 UNCERTAIN, P02 UNKNOWN; Generic Protocol v1.0 / PP-002 v2 FROZEN, no successor/adoption, no product or protected operational ref mutation.
RETURN: DESIGN_QA / DQA-007 -> PROJECT_CONTROL / PC-003.
