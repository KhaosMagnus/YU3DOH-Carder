# PROJECT STATE

artifact_id: PROJECT-STATE
artifact_type: project_state
status: ACTIVE
protocol_version: 1.0

## Project

YU3DOH

Repository: KhaosMagnus/YU3DOH-Carder

## Code truth — no integration performed

- main = 54cc3aad246c89a29f2a18be63c539db68cae041
- feature/workspace-v0.1 = 4c9b0228bb47ac074c49a977b48dbf0844c33a94
- Candidate A = 61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c
- Candidate B = 59fb2924b2240f005fb3e9e6d5afbd8aaca39596
- database schema = 8
- Workspace format = 1
- migrations = 001–008

## Control truth

- Forward Control = ACTIVE
- concurrent publication policy = ACTIVE
- active ledger = requests/CR-0001-v4.md

## P5

CLOSED / PASS

Candidate A remains a product-validation loop and does not reopen P5.

## Candidate A

- QA disposition: PARTIAL
- first deployment attempt: VALIDATION BLOCKED / environment
- current route: DEPLOY-002 → DQA-001
- exact candidate: 61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c
- integration: NOT AUTHORIZED

## Candidate B

- QA: PASS
- exact candidate: 59fb2924b2240f005fb3e9e6d5afbd8aaca39596
- state: VALIDATED / HOLD
- integration: NOT AUTHORIZED

## P6 — Historical Documentation Migration

**IN PROGRESS — INVENTORY SLICE 001 COMPLETE**

Artifacts:
- `migration/INVENTORY.md`
- `migration/P6_BRANCH_CHECKPOINTS.md`
- `migration/P6_HISTORICAL_MIGRATION_PLAN.md`

Verified so far:
- all Workspace RUN refs 001–023 still exist in GitHub;
- RUN 012–020 QA guides exist in the current Workspace line and are classified SUPPORTING, not official verdicts;
- Backup/Recovery, Asset Mutation and Variant Lifecycle technical documents exist and are classified SUPPORTING pending linkage to historical frozen authority;
- missing official handoffs/verdicts/integration reports remain UNKNOWN until recovered.

Next P6 slice:
1. exact blob/hash review for RUN 016–020 QA guides;
2. RUN 021–023 Git-history reconstruction;
3. integration-checkpoint reconstruction;
4. targeted chat/file recovery only for unresolved authority questions.

## Non-authorizations

- RUN 024: NOT AUTHORIZED
- feature/workspace-v0.1 integration: NOT AUTHORIZED
- main integration: NOT AUTHORIZED
- Candidate A + Candidate B combination: NOT AUTHORIZED
