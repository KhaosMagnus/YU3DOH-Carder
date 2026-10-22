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
- Pilot 001 source evidence = `validations/VAL-RC-LOCAL-001/VALIDATION_EVIDENCE.md`
- Pilot 001 QA review = `validations/VAL-RC-LOCAL-001/DESIGN_QA_REVIEW.md`
- canonical finding ledger = `requests/CR-0001.md`
- routing decision = `routing/ROUTE-VAL-RC-LOCAL-001.md`

## Pilot 001

**Status: COMPLETE — PROTOCOL PILOT PASS**

The first incremental transfer completed successfully:

`DEPLOYMENT_VALIDATION → CONTROL artifact → DESIGN_QA → CONTROL artifact → PROJECT_CONTROL`

The owner did not need to copy the full validation report between roles. Both roles consumed exact CONTROL SHA references and preserved exact CODE SHA identity.

## Official candidate state

- Original RC correction `RC-LOCAL-DEFECT-001`: **PASS**
- Complete candidate readiness at `4c9b0228...`: **FAIL / BLOCKED**
- Blocking reason: `CR-0001.1 / F-01`
- Regression caused by the RC correction: **NOT ESTABLISHED**
- RUN 024: **NOT AUTHORIZED**
- main integration: **NOT AUTHORIZED**

## Active routing

### Immediate
`CR-0001.1` → DESIGN_QA correction contract → DEVELOPMENT.

`CR-0001.5` is a confirmed non-blocking copy defect and may be separately included in bounded correction design if it does not broaden or delay the blocking correction.

### Product decision
`CR-0001.2` → SCOPE_ARCHITECTURE / OWNER.

### Held
`CR-0001.3` and `CR-0001.4` remain DEFERRED until explicit OWNER reactivation.

`CR-0001.6` remains ACKNOWLEDGED backlog.

`CR-0001.7` is WITHDRAWN / NO DEFECT.

`CR-0001.8` is historical/currently satisfactory.

## Next Project Control priorities

1. issue exact Transfer Envelope for Route A to DESIGN_QA;
2. issue independent Scope/Owner transfer for CR-0001.2;
3. register active chat instances after current routing is stable;
4. declare Forward Control mandatory for all new transfers;
5. begin prioritized historical documentation migration.
