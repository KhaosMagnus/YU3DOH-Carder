# DQA-007 — Independent External QA Request for Q01-IMPL-001

artifact_id: PP-002-Q01-DQA-007-EXTERNAL-QA-REQUEST
artifact_type: frozen_independent_qa_request
status: FROZEN / AWAITING DQA-007 EXECUTION
protocol_version: 1.0
source: PROJECT_CONTROL / PC-003
target: DESIGN_QA / DQA-007
assignment: Q01-IMPL-001
mode: OFFLINE INDEPENDENT QA / NO LIVE EXECUTION

CANDIDATE: meta/project-control @ 328e57035d34f98c4d8d417729e8b12f91894e95
IMPLEMENTATION REPORT: implementations/PP-002_Q01_OFFLINE_IMPLEMENTATION_REPORT.md @ 8f8e6b0a63b0bc5ad4c995134bf20f6d8a74ac76
PRIMARY AUTHORIZATION: control/PP-002_Q01_DQA-007_INDEPENDENT_QA_AUTHORIZATION.md
PRIMARY ROUTE: routing/ROUTE-PP-002-Q01-DQA-007.md
DESIGN: handoffs/PP-002_Q01_COLLECTOR_CORRECTION_DESIGN_HANDOFF.md
DESIGN BLOB: c72e0a6d0889ceee4e901126a33587072180017f
REPORT OUT: validations/PP-002/Q01-COLLECTOR/DQA-007_EXTERNAL_QA_REPORT.md
QA EVIDENCE OUT: validations/PP-002/Q01-COLLECTOR/DQA-007/**

SOURCE CANDIDATE:
- validation/pp002-q01-collector/README.md @ ce02a0f3b53decd85799c478554a06fda85196b2
- validation/pp002-q01-collector/collector.py @ 10d1407628539798ef93a2d354373eed3091fefd
- validation/pp002-q01-collector/guard.py @ e0394656cf4ba1034f09e6bf34ccc6c4b9ec52e0
- validation/pp002-q01-collector/test_guard.py @ d84329edf65a2557d0e3a2ff6ecdd398ffb3a906
- validation/pp002-q01-collector/run_contract.py @ c63b4fa72493da9d2b1b29446e7e24a223e5bbeb

EXPECTED IMPLEMENTER SELF-TEST:
F01–F31 / 79 named subcases / 138 case-profile records per replay / 590055 semantic bytes / SHA-256 fedaf391616e9501c5fa21003dd0e62aa7b158dd3c4159527167063f5aa3f8e3. Frozen R1 22 tests, 53 historical negative diagnostics, Gate C 14 tests. Seven blocked/stale fake callback cases had zero calls; one positive fake control reported. THESE ARE NOT OFFICIAL QA RESULTS.

DQA-007 must independently reproduce and adjudicate. Missing evidence = honest INCONCLUSIVE, not PASS. No live workflow, source ref changes, existing evidence overwrite, developer self-QA, product mutation, adoption or protocol upgrade.
