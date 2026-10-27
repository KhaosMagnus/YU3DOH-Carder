# CHAT REGISTRY

status: ACTIVE
protocol_version: 1.0

| Instance | Role | Status | Current / last assignment | Evidence status |
|---|---|---|---|---|
| PC-001 | PROJECT_CONTROL | COMPLETE / ROLLED OVER | RUN 024 resumption control | successor PC-002 |
| PC-002 | PROJECT_CONTROL | ACTIVE | RUN 025 evidence recovery / QA continuation | DEPLOY-005 assigned |
| PP-001 | PROTOCOL_PORTABILITY | COMPLETE / BASELINE FROZEN | Generic Project Control extraction | FROZEN v1.0 |
| SIP-001 | PROTOCOL_BOOTSTRAP | SUPERSEDED BEFORE OUTPUT | incorrect SIP interpretation | no output created |
| ZIP-001 | PROTOCOL_BOOTSTRAP_PACKAGE | COMPLETE / PACKAGE ACCEPTED FOR VALIDATION | Bootstrap ZIP v1.0 | field validation pending separately |
| DQA-001 | DESIGN_QA | COMPLETE / EXTERNAL QA PASS | RUN 024 | PASS |
| DQA-002 | DESIGN_QA | COMPLETE / CONTRACT FROZEN | CR-0002 | waits post-F04 gate |
| DQA-003 | DESIGN_QA | COMPLETE / CONTRACT FROZEN | F-04 design | frozen |
| DQA-004 | DESIGN_QA | PARTIAL / AWAITING EVIDENCE | RUN 025 candidate dd968ba0... | awaits DEPLOY-005 |
| DEV-007 | DEVELOPMENT | COMPLETE / READY FOR EXTERNAL QA | RUN 025 candidate dd968ba0... | S01 complete |
| ENV-005 | ENVIRONMENT_READINESS | COMPLETE / ENVIRONMENT READY | RUN 025 Chromium + tsx substrate | readiness proven |
| DEPLOY-005 | DEPLOYMENT_VALIDATION | ASSIGNED / OPERATIONAL VALIDATION | RUN 025 B01-B26 + gate evidence | pending |
| ENV-004 | ENVIRONMENT_READINESS | COMPLETE / READY | RUN 024 GitHub Actions | historical proven substrate |
| IA-002 | INTEGRATION_ADMIN | COMPLETE / INTEGRATED | RUN 024 | historical |

Other historical instances remain preserved in repository history and their instance files.
