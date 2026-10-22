# PROJECT STATE

artifact_id: PROJECT-STATE
artifact_type: project_state
status: ACTIVE
protocol_version: 1.0

## Project

YU3DOH

Repository: `KhaosMagnus/YU3DOH-Carder`

## Code truth — verified at bootstrap

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
- initial CONTROL SHA = populated by Git history after bootstrap commit

## Current operational phase

- RC/local operational validation continues independently.
- Project Control v1.0 is activated at the transfer boundary, not mid-test.
- Pilot 001 is Deployment Validation → External Design + QA.

## Current routing

Current validation finishes under its existing procedure. Before transferring results to QA, Deployment Validation adopts the new protocol, publishes `VALIDATION_EVIDENCE.md`, and sends a Transfer Envelope referencing an exact CONTROL SHA.

## Known follow-up class

Previously requested items that were intentionally postponed must be registered as explicit Change Requests with `DEFERRED` state, reason, authority and revisit condition. Deferred does not mean resolved.
