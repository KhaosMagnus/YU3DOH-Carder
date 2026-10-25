# PROJECT STATE

artifact_id: PROJECT-STATE
artifact_type: project_state
status: ACTIVE
protocol_version: 1.0

## Current code truth

- main = `54cc3aad246c89a29f2a18be63c539db68cae041`
- feature/workspace-v0.1 = `64cb5f4ca42348c6c403e64e0d61bdff8c32a281`
- CR-0001 Combined = INTEGRATED / PASS

## P6 — Historical Documentation Migration

`IN PROGRESS — TARGETED ARCHIVAL RECOVERY`

Authority reconstruction by RUN is complete.

Current pilot:

`P6 ARCHIVAL RECOVERY PILOT 001`

Target:

- RUN 004
- RUN 005
- RUN 008

Worker:

`ARCHIVAL_RECOVERY / AR-001`

Authoritative branch:

`meta/project-control`

Non-authoritative staging:

`recovery/p6-archival-staging`

Protocol:

`migration/P6_ARCHIVAL_RECOVERY_PROTOCOL.md`

Route:

`routing/ROUTE-P6-ARCHIVAL-QA-PILOT-AR-001.md`

## Historical-lineage separation

Workspace archival recovery and Serial v0.1 archival recovery are distinct lineages.

Current P6 pilot:
Workspace only.

Serial v0.1:
OUT OF SCOPE / no recovery action authorized by this route.

## Non-authorizations

- staging findings are not authority;
- staging must not be merged wholesale into meta/project-control;
- main integration: NOT AUTHORIZED;
- RUN 024: NOT AUTHORIZED;
- unrelated product/ref movement: NOT AUTHORIZED.
