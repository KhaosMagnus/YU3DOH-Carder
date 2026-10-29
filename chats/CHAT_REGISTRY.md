# CHAT REGISTRY

status: ACTIVE
protocol_version: 1.0

| Instance | Role | Status | Current / last assignment | Evidence status |
|---|---|---|---|---|
| PC-003 | PROJECT_CONTROL | ACTIVE | PP-002 Gate C coordinator / effective authorization | Owner approval frozen; execution not started |
| PC-002 | PROJECT_CONTROL | COMPLETE / ROLLED OVER | PP-002 Gate C intake predecessor | Succeeded by PC-003; history retained |
| PP-002 | PROTOCOL_PORTABILITY | GATE C ACTIVE / S01 C-020 ACCEPTED / S02 NOT YET STARTED | Execution Interruption Recovery Pilot; S01 -> S02 | C-020 durable, validator PASS; terminal pending |
| IA-004 | INTEGRATION_ADMIN | COMPLETE / INTEGRATED | RUN 026 / CR-0002 | fast-forward verified |
| DQA-006 | DESIGN_QA | COMPLETE / EXTERNAL QA PASS | RUN 026 / CR-0002 | PASS |
| DEPLOY-006 | DEPLOYMENT_VALIDATION | COMPLETE / EVIDENCE ACCESS READY | RUN 026 evidence transport | artifact 12838688889 |
| DQA-005 | DESIGN_QA | COMPLETE / INCONCLUSIVE | RUN 026 / CR-0002 | historical |
| DEV-008 | DEVELOPMENT | COMPLETE / READY FOR EXTERNAL QA | RUN 026 / CR-0002 | S01 complete |
| PP-001 | PROTOCOL_PORTABILITY | COMPLETE / BASELINE FROZEN | Generic protocol v1.0 | frozen |

Product baseline:
feature/workspace-v0.1 @ e11579950ef7ed20e4b6eeee88f9c3597c1f074b

PP-002 Gate B:
COMPLETE / REVISE

PP-002 Gate B-R1:
COMPLETE / PASS

PP-002 Gate B-R2:
COMPLETE / PASS

PP-002 Gate C:
ACTIVE / NONTERMINAL / S01 C-020 ROLLOVER ACCEPTED / S02 NEW CONVERSATION PENDING

Rollover publication:
1352de4daddc6c2143943af2ad7142333f7be963

S02 route:
routing/ROUTE-PP-002-GATE-C-S02.md

Current Project Control: PC-003 (PC-002 rolled over)
Gate C authority: control/PP-002_GATE-C_AUTHORIZATION.md
Gate C route: routing/ROUTE-PP-002-GATE-C.md

Historical instances remain preserved in repository history and instance files.
