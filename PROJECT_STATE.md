# PROJECT STATE

artifact_id: PROJECT-STATE
artifact_type: project_state
status: ACTIVE
protocol_version: 1.0

## Code truth

- main = `54cc3aad246c89a29f2a18be63c539db68cae041`
- feature/workspace-v0.1 = `4c9b0228bb47ac074c49a977b48dbf0844c33a94`
- Candidate A = `61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c`
- Candidate B = `59fb2924b2240f005fb3e9e6d5afbd8aaca39596`

## Candidate A

QA: PARTIAL.

ENV-001:
ENVIRONMENT BLOCKED.

ENV-001 nevertheless proved real exact-SHA checkout, clean tree, Workspace dependencies, schema-8 disposable Workspace and actual Workspace Service execution.

Remaining blocker:
browser/UI and service did not share reachable transport in Work.

Current gate:
`ENV-002 / GitHub-hosted Actions`

Route:
`routing/ROUTE-CANDIDATE-A-ENV-002-ACTIONS.md`

No DEPLOY-003 until ENVIRONMENT READY.

## Candidate B

PASS / VALIDATED / HOLD.

## P5

CLOSED / PASS.

## P6

IN PROGRESS.

RUN 020–023 + RC authority recovered.
RUN 009–013 reconstruction is in progress independently.

## Non-authorizations

- RUN 024: NOT AUTHORIZED
- feature/workspace-v0.1 integration: NOT AUTHORIZED
- main integration: NOT AUTHORIZED
- Candidate A/B combination: NOT AUTHORIZED
