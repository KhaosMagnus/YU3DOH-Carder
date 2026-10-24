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

`VALIDATED / PASS / HOLD`

Validated requests:
- CR-0001.1 / F-01
- CR-0001.5 / F-05

Final QA artifact:
`validations/P5-CANDIDATE-A-001/DESIGN_QA_FINAL_DISPOSITION.md`

Additional Deployment:
NOT REQUIRED.

## Candidate B

`VALIDATED / PASS / HOLD`

Validated request:
- CR-0001.2 / F-02

Final QA artifact:
`validations/P5-CANDIDATE-B-001/DESIGN_QA_REPORT.md`

## Integration decision gate

Current route:

`routing/ROUTE-CR-0001-INTEGRATION-DECISION.md`

A and B both descend from `feature/workspace-v0.1 @ 4c9b0228...` and are mutually diverged.

Known file overlap:
`workspace-server/test/carder-write-back.test.ts`

Therefore independent PASS results do not establish a validated combined tree.

Project Control recommendation:
prepare a dedicated combined candidate only after explicit Owner authorization, then obtain exact-SHA combined QA before moving `feature/workspace-v0.1`.

No integration has been performed.

## P5

CLOSED / PASS.

Both Candidate A and Candidate B now hold final independent PASS dispositions.

## P6

IN PROGRESS.

Historical authority recovery continues independently after the Owner integration decision is recorded.

Current reconstructed tranches:
- RUN 009–013
- RUN 020–023 + RC

RUN 014–019 is next.

## Non-authorizations

- RUN 024: NOT AUTHORIZED
- feature/workspace-v0.1 integration: AWAITING OWNER DECISION
- main integration: NOT AUTHORIZED
- Candidate A + B combination: NOT AUTHORIZED UNTIL EXPLICIT OWNER DECISION
