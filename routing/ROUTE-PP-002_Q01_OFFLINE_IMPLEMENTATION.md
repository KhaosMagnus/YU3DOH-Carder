# ROUTE — PP-002 Q01 Offline Collector Implementation

artifact_id: ROUTE-PP-002-Q01-OFFLINE-IMPLEMENTATION
artifact_type: bounded_offline_implementation_route
status: FROZEN
protocol_version: 1.0
source: PROJECT_CONTROL / PC-003
target: PROTOCOL_PORTABILITY / PP-002
mode: AUTHORIZED OFFLINE IMPLEMENTATION AND SELF-TEST / NO LIVE EXECUTION
assignment: Q01-IMPL-001 — Source Retrieval Provenance Collector Guard

DESIGN ACCEPTANCE: runs/PP-002_Q01_DESIGN_ACCEPTANCE.md
PRIMARY AUTHORIZATION: control/PP-002_Q01_OFFLINE_IMPLEMENTATION_AUTHORIZATION.md
FROZEN IMPLEMENTATION CONTRACT: handoffs/PP-002_Q01_COLLECTOR_CORRECTION_DESIGN_HANDOFF.md
DESIGN BLOB: c72e0a6d0889ceee4e901126a33587072180017f
INPUT CONTROL SHA: 638b1d9d486e3863f2c7a6edfc407ea39066f5ce
ACTIVATION CONTROL SHA: exact control commit publishing this route, supplied by PC-003
ORIGINAL Q01 EVIDENCE: validations/PP-002/GATE-C/S02/source-reference-audit-correction.json
EVIDENCE ROOT: validations/PP-002/Q01-COLLECTOR/Q01-IMPL-001/**
IMPLEMENTATION REPORT: implementations/PP-002_Q01_OFFLINE_IMPLEMENTATION_REPORT.md

ACTION: Implement the additive Q01 collector/guard and complete the F01–F31 offline deterministic test contract (including subcases), original R1/Gate C byte-pinned regression validation and fake publisher blocking checks. Materialize source corpus read-only with pins; no network in the implementation/test environment; no external Actions operations. Publish permitted new source, evidence and report paths only with expected-head/CAS and verify preservation and refs.

SOURCE FILES: validation/pp002-q01-collector/README.md, collector.py, guard.py, test_guard.py, run_contract.py, optional fixtures/** exclusively new.
ORIGINAL VALIDATORS / PROTOCOL FILES / HISTORICAL MANIFESTS: DO NOT MODIFY
PRODUCT / MAIN / HISTORICAL OPS / GATE C HARNESS REFS: DO NOT MOVE
ADDITIONAL WORKFLOW / RETRY / REPLACEMENT / CLEANUP: FORBIDDEN
NEW PROTOCOL SUCCESSOR / ADOPTION: NOT AUTHORIZED

SELF-TEST RESULT: IMPLEMENTED / READY FOR INDEPENDENT REVIEW or BLOCKED / CORRECTION REQUIRED; not external QA PASS.
INDEPENDENT REVIEW: DESIGN_QA / separately assigned instance, routed only by PC-003 after delivery. No QA session or authority is instantiated by this document.
CLOSER: PROTOCOL_PORTABILITY / PP-002 (PC-003 reassigns on loss).
RETURN: PROTOCOL_PORTABILITY / PP-002 -> PROJECT_CONTROL / PC-003, complete report/SHAs/test/evidence inventory and explicit no-live-operation statement.
