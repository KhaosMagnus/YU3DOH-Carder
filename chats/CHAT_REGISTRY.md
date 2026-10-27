# CHAT REGISTRY

status: ACTIVE
protocol_version: 1.0

| Instance | Role | Status | Current / last assignment | Evidence status |
|---|---|---|---|---|
| PC-001 | PROJECT_CONTROL | COMPLETE / ROLLED OVER | RUN 024 resumption control | successor PC-002 |
| PC-002 | PROJECT_CONTROL | ACTIVE | RUN 025 control + session pilot | DEV-007/S01 assigned |
| PP-001 | PROTOCOL_PORTABILITY | COMPLETE / BASELINE FROZEN | Generic Project Control extraction | FROZEN v1.0 |
| SIP-001 | PROTOCOL_BOOTSTRAP | SUPERSEDED BEFORE OUTPUT | incorrect SIP interpretation | no output created |
| ZIP-001 | PROTOCOL_BOOTSTRAP_PACKAGE | COMPLETE / PACKAGE ACCEPTED FOR VALIDATION | Project Control Bootstrap ZIP v1.0 | field validation pending separately |
| AR-001 | ARCHIVAL_RECOVERY | COMPLETE / PILOT CLOSED | B05 supplement reviewed | residual gaps frozen |
| SCOPE-001 | SCOPE_ARCHITECTURE | AVAILABLE | CR-0002 scope complete | v2 frozen; default DARK |
| DQA-001 | DESIGN_QA | COMPLETE / EXTERNAL QA PASS | RUN 024 exact-SHA candidate | PASS |
| DQA-002 | DESIGN_QA | COMPLETE / CONTRACT FROZEN | CR-0002 Library Dark Theme | waiting post-F04 compatibility gate |
| DQA-003 | DESIGN_QA | COMPLETE / CONTRACT FROZEN | CR-0001.4 / F-04 Library Grid/List | implementable / testable |
| DEV-001 | DEVELOPMENT | COMPLETE / QA PASS | Candidate A | historical |
| DEV-002 | DEVELOPMENT | COMPLETE / QA PASS | Candidate B | historical |
| DEV-003 | DEVELOPMENT | COMPLETE / QA PASS | combined candidate | historical |
| DEV-004 | DEVELOPMENT | COMPLETE / IMPLEMENTATION BLOCKED | RUN 024 initial attempt | executor transport blocker |
| DEV-005 | DEVELOPMENT | COMPLETE / IMPLEMENTATION BLOCKED | RUN 024 resumption attempt | executor transport blocker |
| DEV-006 | DEVELOPMENT | COMPLETE / READY FOR EXTERNAL QA | RUN 024 candidate e07140d5... | accepted by DQA-001 |
| DEV-007 | DEVELOPMENT | ASSIGNED / IMPLEMENTATION | RUN 025 / CR-0001.4 F-04 | active session DEV-007/S01 |
| ENV-001 | ENVIRONMENT_READINESS | COMPLETE / BLOCKED | historical Candidate A environment gate | historical |
| ENV-002 | ENVIRONMENT_READINESS | COMPLETE / READY | historical Candidate A environment gate | historical Actions substrate |
| ENV-003 | ENVIRONMENT_READINESS | COMPLETE / BLOCKED | RUN 024 Work/cloud readiness | Git/service proved; browser/shared runtime blocked |
| ENV-004 | ENVIRONMENT_READINESS | COMPLETE / READY | RUN 024 Actions readiness | full gate + browser substrate proven |
| DEPLOY-001 | DEPLOYMENT_VALIDATION | BLOCKED / SUPERSEDED | historical Candidate A attempt | historical |
| DEPLOY-002 | DEPLOYMENT_VALIDATION | BLOCKED / SUPERSEDED | historical Candidate A attempt | historical |
| DEPLOY-003 | DEPLOYMENT_VALIDATION | COMPLETE / CLOSED | Candidate A 6/6 EVIDENCE READY | historical |
| DEPLOY-004 | DEPLOYMENT_VALIDATION | COMPLETE / EVIDENCE READY | combined 6/6 SATISFACTORY | historical |
| IA-001 | INTEGRATION_ADMIN | COMPLETE / INTEGRATED | combined → feature/workspace-v0.1 | historical |
| IA-002 | INTEGRATION_ADMIN | COMPLETE / INTEGRATED | RUN 024 → feature/workspace-v0.1 | verified and closed |

Experimental session records are stored separately under chats/sessions/ and do not replace instance identities.
