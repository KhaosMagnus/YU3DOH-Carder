---
artifact_id: ROUTE-VAL-RC-LOCAL-001
artifact_type: routing_decision
status: FROZEN
protocol_version: "1.0"
source_role: PROJECT_CONTROL
source_instance: UNREGISTERED
control_parent_sha: 0e0184d0cdc7e5ddabfc40c95312ee10eb20d1d0
code_baseline:
  branch: feature/workspace-v0.1
  sha: 4c9b0228bb47ac074c49a977b48dbf0844c33a94
related_requests:
  - CR-0001
---

# Routing — VAL-RC-LOCAL-001 after External Design + QA

## Current authoritative disposition

- Original RC null/zero correction: **PASS**.
- Complete candidate readiness at `4c9b0228...`: **FAIL / BLOCKED by CR-0001.1 (F-01)**.
- Regression caused by RC correction: **NOT ESTABLISHED**.
- RUN 024: **NOT AUTHORIZED**.
- main integration: **NOT AUTHORIZED**.
- new migration/schema: **NOT AUTHORIZED**.

## Route A — immediate blocking correction

Target: `DESIGN_QA`

Scope:
- CR-0001.1 / F-01 — blocking NORMAL Spell/Trap → Carder projection defect.
- CR-0001.5 / F-05 — non-blocking stale copy may be included as a separate bounded correction item only if Design+QA determines this does not broaden risk or delay CR-0001.1. Otherwise split it.

Required output:
A frozen correction implementation handoff with exact baseline, minimal implementation boundary, acceptance criteria, regression matrix and required validation.

No new RUN number is implied or authorized by this route.

## Route B — product/domain decision

Target: `SCOPE_ARCHITECTURE / OWNER`

Scope:
- CR-0001.2 / F-02 only.

Required output:
Frozen domain decision for Level/Rank ranges and compatibility semantics before Design+QA can create implementation criteria.

This route may proceed independently of Route A but is not a blocker to correcting CR-0001.1.

## Held dispositions

- CR-0001.3 / F-03: DEFERRED until explicit OWNER reactivation.
- CR-0001.4 / F-04: DEFERRED until explicit OWNER reactivation.
- CR-0001.6 / F-06: ACKNOWLEDGED backlog item; no automatic implementation.
- CR-0001.7 / F-07: WITHDRAWN / NO DEFECT.
- CR-0001.8 / F-08: historical/currently satisfactory.
- CR-0001.9 / F-09: satisfied by canonical Project Control registration.

## Release gate

No release-closure PASS or integration may be issued while CR-0001.1 remains unresolved and unvalidated.
