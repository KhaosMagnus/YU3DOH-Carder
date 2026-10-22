# PROJECT STATE

artifact_id: PROJECT-STATE
artifact_type: project_state
status: ACTIVE
protocol_version: 1.0

## Project

YU3DOH

Repository: `KhaosMagnus/YU3DOH-Carder`

## Code truth — current checkpoint

- `main` = `54cc3aad246c89a29f2a18be63c539db68cae041`
- `feature/workspace-v0.1` = `4c9b0228bb47ac074c49a977b48dbf0844c33a94`
- `fix/workspace-rc-canonical-null-zero` = `4c9b0228bb47ac074c49a977b48dbf0844c33a94`
- `feature/workspace-run-023` = `c929a6020760525d5cf6daf695b2f44c1d3cd1ca`
- database schema = `8`
- workspace format = `1`
- migrations = `001–008`

## Control truth

- control branch = `meta/project-control`
- protocol version = `1.0`
- canonical active ledger = `requests/CR-0001-v2.md`
- prior frozen ledger = `requests/CR-0001.md`
- parallel routing = `routing/ROUTE-CR-0001-PARALLEL-001.md`

## Pilot 001

**COMPLETE — PROTOCOL PILOT PASS**

Validated flow:
`DEPLOYMENT_VALIDATION → CONTROL → DESIGN_QA → CONTROL → PROJECT_CONTROL`

## Official candidate state

- Original RC null/zero correction: **PASS**
- Complete candidate readiness at `4c9b0228...`: **FAIL / BLOCKED**
- Blocking reason: `CR-0001.1 / F-01`
- Regression caused by RC correction: **NOT ESTABLISHED**
- RUN 024: **NOT AUTHORIZED**
- main integration: **NOT AUTHORIZED**

## Active parallel routing

### Route A — correction implementation

`CR-0001.1 + CR-0001.5 → DEVELOPMENT`

Execution authority:
`handoffs/CR-0001.1_CORRECTION_HANDOFF.md`

Authoritative CONTROL SHA:
`fd5c49e071e89f3e19a378ccc544f9b2272f1391`

Expected branch:
`fix/workspace-rc-normal-subtype-icon`

Expected return:
`READY FOR EXTERNAL QA` or `IMPLEMENTATION BLOCKED`.

### Route B — Level/Rank technical design

`CR-0001.2 → DESIGN_QA`

Scope authority:
`scopes/SCOPE-CR-0001-2-F02-LEVEL-RANK-DOMAIN.md`

Authoritative Scope CONTROL SHA:
`9ea55675b3b1cfef6d4a3ad801892467f1fd470f`

Frozen domain:
Level 0..12 or null; Rank 0..13 or null; zero distinct from null; no silent clamp; server and client enforcement; historical compatibility without migration.

Expected return:
frozen Design+QA technical contract and acceptance matrix.

## Held items

- CR-0001.3: DEFERRED
- CR-0001.4: DEFERRED
- CR-0001.6: ACKNOWLEDGED backlog
- CR-0001.7: WITHDRAWN
- CR-0001.8: historical/currently satisfactory

## Next Project Control priorities

1. send Route A envelope to Development;
2. send Route B envelope to Design+QA;
3. receive/publish both downstream results independently;
4. register active chat instances;
5. activate Forward Control policy for all new transfers;
6. begin prioritized historical documentation migration.
