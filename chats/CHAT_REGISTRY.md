# CHAT REGISTRY

status: ACTIVE
protocol_version: 1.0

Tracks protocol-era chat/agent lineage without requiring full transcripts.

## ID epoch

IDs below start at **Project Control v1.0 activation**.

`DQA-001` means the first Design+QA instance formally registered under Project Control v1.0, not the first historical QA chat.

Pre-v1 predecessors remain `HISTORICAL-ID-PENDING` until evidence-backed migration.

## Registered instances

| Instance | Role | Status | Current / last assignment | Evidence status |
|---|---|---|---|---|
| PC-001 | PROJECT_CONTROL | ACTIVE | P5 QA gate and routing | GitHub/control evidence |
| SCOPE-001 | SCOPE_ARCHITECTURE | AVAILABLE | CR-0001.2 domain freeze completed | GitHub/control evidence |
| DQA-001 | DESIGN_QA | ACTIVE — DUAL QA GATE | Validate Candidate A and Candidate B independently | GitHub/control evidence |
| DEPLOY-001 | DEPLOYMENT_VALIDATION | AVAILABLE | Await QA evidence requests | GitHub/control evidence |
| DEV-001 | DEVELOPMENT | READY FOR EXTERNAL QA | CR-0001.1 + CR-0001.5 candidate `61503c6e...` | GitHub/control evidence |
| DEV-002 | DEVELOPMENT | READY FOR EXTERNAL QA | CR-0001.2 candidate `59fb2924...` | GitHub/control evidence |

## Historical lineage

Known pre-v1 chat generations are intentionally not numbered yet.

Their lineage will be reconstructed during historical migration using control artifacts, Project conversation evidence, prior handoffs and exact checkpoints.

No historical sequence is inferred from memory alone.
