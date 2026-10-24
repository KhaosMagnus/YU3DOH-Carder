# PROJECT STATE

artifact_id: PROJECT-STATE
artifact_type: project_state
status: ACTIVE
protocol_version: 1.0

## Code truth

- main = `54cc3aad246c89a29f2a18be63c539db68cae041`
- feature/workspace-v0.1 = `4c9b0228bb47ac074c49a977b48dbf0844c33a94`
- Candidate A = `61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c` / PASS
- Candidate B = `59fb2924b2240f005fb3e9e6d5afbd8aaca39596` / PASS
- Combined = `64cb5f4ca42348c6c403e64e0d61bdff8c32a281` / QA PARTIAL

## Combined candidate current gate

Pending only:
C-OP-01..C-OP-06 exact-SHA operational evidence.

Target:
`DEPLOYMENT_VALIDATION / DEPLOY-004`

Route:
`routing/ROUTE-CR-0001-COMBINED-DEPLOY-004.md`

Operational branch:
`ops/cr-0001-combined-deploy-004-actions`

DEPLOY-003 remains closed as the original Candidate A operational-validation instance.

The earlier DEPLOY-003 combined route was superseded before execution.

## P6

IN PROGRESS independently.

## Non-authorizations

- combined integration: NOT AUTHORIZED
- feature/workspace-v0.1 movement: NOT AUTHORIZED
- main movement: NOT AUTHORIZED
- RUN 024: NOT AUTHORIZED
