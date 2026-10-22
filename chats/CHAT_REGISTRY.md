# CHAT REGISTRY

status: ACTIVE
protocol_version: 1.0

Tracks protocol-era chat/agent lineage without requiring full transcripts.

## ID epoch

IDs below start at **Project Control v1.0 activation**.

Therefore `DQA-001` means "first Design+QA instance formally registered under Project Control v1.0", not "first Design+QA chat in project history".

Pre-v1 predecessors remain `HISTORICAL-ID-PENDING` until evidence-backed migration.

## Registered instances

| Instance | Role | Status | Current / last assignment | Evidence status |
|---|---|---|---|---|
| PC-001 | PROJECT_CONTROL | ACTIVE | Project Control v1.0 governance and routing | GitHub/control evidence |
| SCOPE-001 | SCOPE_ARCHITECTURE | AVAILABLE | CR-0001.2 domain freeze completed | GitHub/control evidence |
| DQA-001 | DESIGN_QA | AVAILABLE / QA GATE | CR-0001.2 handoff frozen; awaiting Development outputs | GitHub/control evidence |
| DEPLOY-001 | DEPLOYMENT_VALIDATION | AVAILABLE | Pilot 001 evidence published | GitHub/control evidence |
| DEV-001 | DEVELOPMENT | ACTIVE | CR-0001.1 + CR-0001.5 | GitHub branch observed |
| DEV-002 | DEVELOPMENT | ACTIVE — OWNER REPORTED | CR-0001.2 | branch not yet observed in GitHub at registration |

## Historical lineage

Known pre-v1 chat generations, including earlier Design+QA replacements caused by conversation limits, are intentionally not numbered yet.

Their lineage will be reconstructed during historical migration using:
- control artifacts;
- Project conversation evidence;
- prior handoffs;
- exact code/control checkpoints where available.

No historical sequence is inferred from memory alone.
