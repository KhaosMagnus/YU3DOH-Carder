---
artifact_id: ROUTE-CR-0001-PARALLEL-001
artifact_type: routing_decision
status: FROZEN
protocol_version: "1.0"
source_role: PROJECT_CONTROL
source_instance: UNREGISTERED
control_parent_sha: fd5c49e071e89f3e19a378ccc544f9b2272f1391
code_baseline:
  branch: feature/workspace-v0.1
  sha: 4c9b0228bb47ac074c49a977b48dbf0844c33a94
related_requests:
  - CR-0001.1
  - CR-0001.2
  - CR-0001.5
---

# Parallel routing decision — CR-0001

## Route A — Development execution

Target: `DEVELOPMENT`

Authority:
- CONTROL SHA `fd5c49e071e89f3e19a378ccc544f9b2272f1391`
- `handoffs/CR-0001.1_CORRECTION_HANDOFF.md`

Requests:
- CR-0001.1 / F-01 — blocking correction
- CR-0001.5 / F-05 — separate copy-only bounded correction

Action:
`IMPLEMENT`

Expected Development return:
- exact commit SHAs
- final correction branch HEAD
- changed-file list
- acceptance-criteria mapping
- focused tests
- complete regression gate
- final state exactly `READY FOR EXTERNAL QA` or `IMPLEMENTATION BLOCKED`

No merge/integration is authorized.

## Route B — Design + QA technical freeze

Target: `DESIGN_QA`

Authority:
- CONTROL SHA `9ea55675b3b1cfef6d4a3ad801892467f1fd470f`
- `scopes/SCOPE-CR-0001-2-F02-LEVEL-RANK-DOMAIN.md`

Request:
- CR-0001.2 / F-02

Action:
`READ / TECHNICAL FREEZE / DERIVE ACCEPTANCE CONTRACT`

Expected Design+QA return:
A bounded frozen technical contract and acceptance matrix implementing only the frozen Level/Rank domain decision.

No implementation is authorized by Route B until Design+QA publishes its own frozen implementation handoff.

## Concurrency rule

Routes A and B may proceed in parallel.

Neither role may silently consume unpublished work from the other route.

If either route discovers a material dependency on the other, STOP that dependent portion and return to PROJECT_CONTROL.

## Held items

CR-0001.3 and CR-0001.4 remain DEFERRED.
CR-0001.6 remains backlog.
CR-0001.7 remains WITHDRAWN.
CR-0001.8 remains historical/currently satisfactory.
RUN 024 remains NOT AUTHORIZED.
