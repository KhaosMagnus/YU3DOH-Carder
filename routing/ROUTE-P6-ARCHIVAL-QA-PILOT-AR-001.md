---
artifact_id: ROUTE-P6-ARCHIVAL-QA-PILOT-AR-001
artifact_type: routing_decision
status: FROZEN
protocol_version: "1.0"
source_role: PROJECT_CONTROL
source_instance: PC-001
target_role: ARCHIVAL_RECOVERY
target_instance: AR-001
control_parent_sha: e83ffd8b9b8050039b5f59cbe9ee03893d8deec5
---

# Route — P6 Archival Recovery Pilot 001

## Mission

Recover primary historical QA/integration evidence for Workspace:

- RUN 004
- RUN 005
- RUN 008

using the Owner-supplied historical Design + QA conversation and every relevant attachment/file available from that conversation.

## Separation rule

Workspace only.

Serial v0.1 is OUT OF SCOPE.

If a source contains both histories, index only the Workspace evidence and mark the Serial material as `OUT_OF_SCOPE_SERIAL`; do not normalize it into Workspace artifacts.

## Staging destination

Branch:

`recovery/p6-archival-staging`

This branch is NON-AUTHORITATIVE.

Do not write to `meta/project-control`.

## Current reconstructed targets

RUN 004:
`81c20eb1477e1a0151b6e590d1e31390d82c6de4`

RUN 005:
`94c4fed2c114a8d5b38626b48722237d9ec8263d`

RUN 008:
`e54800629e46f8fccd653b0bef637dd71e9b97a3`

Existing reconstruction:

`migration/P6_RECOVERED_AUTHORITY_001_008.md`

## What to locate

For each target RUN, locate if present:

- original External QA report/disposition;
- PARTIAL / FAIL / RETURN TO DEVELOPMENT disposition;
- correction handoff;
- final External QA PASS;
- integration authorization;
- administrative integration report;
- exact SHA each decision applies to;
- any explicit statement that a prior candidate was rejected/superseded;
- any contradiction with the current P6 reconstructed record.

Do not assume an artifact exists.

## Required outputs on staging

- `recovery/workspace/RECOVERY_INDEX.md`
- `recovery/workspace/RECOVERY_GAPS.md`
- `recovery/workspace/RECOVERY_CONTRADICTIONS.md`
- normalized candidate files under `recovery/workspace/candidates/`

## Return status

Use one:

`RECOVERY READY FOR PROJECT CONTROL REVIEW`

`RECOVERY INCOMPLETE`

Return a YU3DOH Transfer Envelope to:

`PROJECT_CONTROL / PC-001`

with exact staging branch HEAD and an evidence summary.

No promotion to authority is permitted.
