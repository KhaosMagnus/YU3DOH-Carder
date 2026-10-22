---
artifact_id: ROUTE-P5-QA-GATE-001
artifact_type: routing_decision
status: FROZEN
protocol_version: "1.0"
source_role: PROJECT_CONTROL
source_instance: PC-001
control_parent_sha: 2331376eae8de28244b39f54544ba37d2eb61d94
---

# P5 QA Gate — Dual Development Candidates

Both active Development routes have completed implementation and published role-owned reports.

## Candidate A — CR-0001.1 + CR-0001.5

Target role: `DQA-001 / DESIGN_QA`

Authority:
- CONTROL SHA: `f026cd085548aba83025b1b93874e3932188e118`
- Implementation report: `implementations/IMPLEMENTATION-CR-0001.1-CR-0001.5-001.md`
- Frozen handoff: `handoffs/CR-0001.1_CORRECTION_HANDOFF.md`
- Candidate branch: `fix/workspace-rc-normal-subtype-icon`
- Candidate SHA: `61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c`

Development status: `READY FOR EXTERNAL QA`.

Required QA:
- validate AC-A1..A10 and AC-B1..B3;
- include required independent visual/operational evidence;
- preserve exact subtype/write-back semantics;
- issue an official QA disposition tied to exact candidate SHA;
- do not integrate refs.

## Candidate B — CR-0001.2

Target role: `DQA-001 / DESIGN_QA`

Authority:
- CONTROL SHA: `2331376eae8de28244b39f54544ba37d2eb61d94`
- Implementation report: `implementations/CR-0001.2_LEVEL_RANK_IMPLEMENTATION_REPORT.md`
- Frozen handoff: `handoffs/CR-0001.2_LEVEL_RANK_DOMAIN_HANDOFF.md`
- Scope authority: `scopes/SCOPE-CR-0001-2-F02-LEVEL-RANK-DOMAIN.md`
- Candidate branch: `feature/workspace-cr-0001-2-level-rank-domain`
- Candidate SHA: `59fb2924b2240f005fb3e9e6d5afbd8aaca39596`

Development status: `READY FOR EXTERNAL QA`.

Required QA:
- validate the frozen A–J acceptance matrix;
- independently review the exact implementation boundary and historical compatibility;
- assess Development browser/operational evidence and request Deployment Validation only if independent evidence remains necessary;
- issue an official QA disposition tied to exact candidate SHA;
- do not integrate refs.

## Independence rule

The candidates were developed independently from the same baseline:
`feature/workspace-v0.1 @ 4c9b0228bb47ac074c49a977b48dbf0844c33a94`.

QA must evaluate them independently.

A PASS or FAIL for one candidate does not imply the same result for the other.

Do not merge/cherry-pick/rebase one candidate into the other for QA.

## P5 closure criterion

P5 closes when both candidates have:
1. an official External Design + QA disposition;
2. a QA artifact published to Project Control;
3. exact candidate SHA traceability preserved.

Integration is not required to close P5.

RUN 024 and main integration remain NOT AUTHORIZED.
