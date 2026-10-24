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

ENV-001: ENVIRONMENT BLOCKED after proving exact-SHA service execution.

ENV-002: ACTIVE on GitHub-hosted Actions.

Operational branch:
`ops/candidate-a-env-002-actions`

Candidate A itself is checked out separately by exact SHA inside the job and remains unchanged.

No DEPLOY-003 until ENVIRONMENT READY is verified.

## Candidate B

PASS / VALIDATED / HOLD.

## P5

CLOSED / PASS.

## P6

**IN PROGRESS — AUTHORITY RECOVERY**

Recovered:
- RUN 009–013 integration/checkpoint authority;
- RUN 020–023 + RC final authority.

Important provenance distinction:
RUN 011 and RUN 012 exact integrated checkpoints are established from downstream authorized baselines, while their original primary final QA artifacts remain archival gaps.

Next:
RUN 014–019, then RUN 001–008, plus targeted archival recovery of missing role-owned QA/integration reports.

## Non-authorizations

- RUN 024: NOT AUTHORIZED
- feature/workspace-v0.1 integration: NOT AUTHORIZED
- main integration: NOT AUTHORIZED
- Candidate A/B combination: NOT AUTHORIZED
