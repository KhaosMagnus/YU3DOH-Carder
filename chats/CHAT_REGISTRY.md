# CHAT REGISTRY

status: ACTIVE
protocol_version: 1.0

| Instance | Role | Status | Current / last assignment | Evidence status |
|---|---|---|---|---|
| PC-001 | PROJECT_CONTROL | COMPLETE / ROLLED OVER | RUN 024 resumption control | successor PC-002 |
| PC-002 | PROJECT_CONTROL | ACTIVE | RUN 025 integration control | IA-003 assigned |
| PP-001 | PROTOCOL_PORTABILITY | COMPLETE / BASELINE FROZEN | Generic Project Control extraction | FROZEN v1.0 |
| SIP-001 | PROTOCOL_BOOTSTRAP | SUPERSEDED BEFORE OUTPUT | incorrect SIP interpretation | no output created |
| ZIP-001 | PROTOCOL_BOOTSTRAP_PACKAGE | COMPLETE / PACKAGE ACCEPTED FOR VALIDATION | Bootstrap ZIP v1.0 | field validation pending separately |
| DQA-001 | DESIGN_QA | COMPLETE / EXTERNAL QA PASS | RUN 024 | PASS |
| DQA-002 | DESIGN_QA | COMPLETE / CONTRACT FROZEN | CR-0002 | waits post-F04 integration gate |
| DQA-003 | DESIGN_QA | COMPLETE / CONTRACT FROZEN | F-04 design | frozen |
| DQA-004 | DESIGN_QA | COMPLETE / EXTERNAL QA PASS | RUN 025 candidate dd968ba0... | PASS |
| DEV-007 | DEVELOPMENT | COMPLETE / READY FOR EXTERNAL QA | RUN 025 candidate dd968ba0... | S01 complete |
| ENV-005 | ENVIRONMENT_READINESS | COMPLETE / ENVIRONMENT READY | RUN 025 substrate | ready |
| DEPLOY-005 | DEPLOYMENT_VALIDATION | COMPLETE / EVIDENCE READY | RUN 025 B01-B26 + gate evidence | durable bundle published |
| IA-003 | INTEGRATION_ADMIN | ASSIGNED / ADMINISTRATIVE INTEGRATION | RUN 025 → feature/workspace-v0.1 | pending |
| ENV-004 | ENVIRONMENT_READINESS | COMPLETE / READY | RUN 024 GitHub Actions | historical proven substrate |
| IA-002 | INTEGRATION_ADMIN | COMPLETE / INTEGRATED | RUN 024 | historical |

Other historical instances remain preserved in repository history and instance files.
