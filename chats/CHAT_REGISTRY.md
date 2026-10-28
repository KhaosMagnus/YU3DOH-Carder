# CHAT REGISTRY

status: ACTIVE
protocol_version: 1.0

| Instance | Role | Status | Current / last assignment | Evidence status |
|---|---|---|---|---|
| PC-001 | PROJECT_CONTROL | COMPLETE / ROLLED OVER | RUN 024 resumption control | successor PC-002 |
| PC-002 | PROJECT_CONTROL | ACTIVE | RUN 025 closure + CR-0002 compatibility control | DQA-002 resumed |
| PP-001 | PROTOCOL_PORTABILITY | COMPLETE / BASELINE FROZEN | Generic Project Control extraction | FROZEN v1.0 |
| SIP-001 | PROTOCOL_BOOTSTRAP | SUPERSEDED BEFORE OUTPUT | incorrect SIP interpretation | no output created |
| ZIP-001 | PROTOCOL_BOOTSTRAP_PACKAGE | COMPLETE / PACKAGE ACCEPTED FOR VALIDATION | Bootstrap ZIP v1.0 | field validation pending separately |
| DQA-001 | DESIGN_QA | COMPLETE / EXTERNAL QA PASS | RUN 024 | PASS |
| DQA-002 | DESIGN_QA | RESUMED / POST-F04 COMPATIBILITY REVIEW | CR-0002 Library Dark Theme | post-F04 gate active |
| DQA-003 | DESIGN_QA | COMPLETE / CONTRACT FROZEN | F-04 design | frozen |
| DQA-004 | DESIGN_QA | COMPLETE / EXTERNAL QA PASS | RUN 025 | PASS |
| DEV-007 | DEVELOPMENT | COMPLETE / READY FOR EXTERNAL QA | RUN 025 | S01 complete |
| ENV-005 | ENVIRONMENT_READINESS | COMPLETE / ENVIRONMENT READY | RUN 025 substrate | ready |
| DEPLOY-005 | DEPLOYMENT_VALIDATION | COMPLETE / EVIDENCE READY | RUN 025 | durable evidence |
| IA-003 | INTEGRATION_ADMIN | COMPLETE / INTEGRATED | RUN 025 → feature/workspace-v0.1 | verified |
| ENV-004 | ENVIRONMENT_READINESS | COMPLETE / READY | RUN 024 GitHub Actions | historical |
| IA-002 | INTEGRATION_ADMIN | COMPLETE / INTEGRATED | RUN 024 | historical |

Other historical instances remain preserved in repository history and instance files.
