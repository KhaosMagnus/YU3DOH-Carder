# Q02-PROT-001 — Federated Model Alignment and B1 Isolation Proposal

artifact_id: PP-002-Q02-FEDERATED-ALIGNMENT-ISOLATION-PROPOSAL
artifact_type: additive_planning_addendum
status: PROPOSED / NOT AUTHORIZED / NOT EFFECTIVE
protocol_version: 1.0
author: PROJECT_CONTROL / PC-003
input_control_sha: 93dcaa1e5ed935e5add6a1069483e9619a351cf9
strategic_direction: control/PROJECT_CONTROL_FEDERATED_ARCHITECTURE_DIRECTION.md
original_proposed_scope: control/PP-002_Q02_OFFLINE_PROTOTYPE_PROPOSED_SCOPE.md @ blob b546948f2eacb901f57d1b8af5c24d037dccdf78
Q02_frozen_design: handoffs/PP-002_Q02_Q01_CONTROL_INTEGRATION_DESIGN_HANDOFF.md @ blob a06fb711662848ccc16d2e32d621be279a9b1f4d
Q02_design_acceptance: runs/PP-002_Q02_DESIGN_ACCEPTANCE.md
next_owner_decision_request: control/PP-002_Q02_B1_OFFLINE_PROTOTYPE_OWNER_DECISION_REQUEST.md

## Why this addendum exists

The existing prototype scope proposes a limited A exception for executable code on the documentation-only meta/project-control branch, or a separately governed B nonproduct location. The Owner now favors a future federated, centrally maintained Project Control standard with local per-project instances. This planning addendum recommends B1 for the **offline Q02 implementation**, while the existing proposed scope remains an immutable historical proposal; it does not retroactively authorize a changed contract.

## Recommended B1 substrate and custody boundary

- New proposed dedicated branch locator: experiment/pp002-q02-prot-001 (name PROPOSED only, check absence before authorization/create). The final authorized branch name is an Owner-controlled scope decision, not an assumed existing ref.
- Recommend bootstrapping it at a verified immutable meta/project-control checkpoint that includes frozen Q01 sources and the Q02 accepted design. Freeze exact baseline SHA and relevant source/blob digests in the effective implementation authorization before branch creation. Historical control snapshots in branch are inputs, not authority to mutate originals.
- All new source, tests, mock fixtures and evidence belong only to approved new paths within this isolated branch. New code has no credentials, live connector, external Actions, network, ref-writer or real publisher; fake store/transport/CAS/permissions only.
- meta/project-control remains the canonical YU3DOH **local control authority**, documentation-only for new scope, with PC-003 retaining mutable-index ownership. The prototype branch may NOT be merged into main, product, original operational refs or meta/project-control as an implementation; immutable source/evidence is referenced from a verified candidate SHA and accepted QA result through **new coordinator-owned documentation** on the control branch.
- Independent QA receives exact candidate SHA/tree, all declared tests/evidence/commands, verifies I01–I32 plus unchanged Q01/R1/Gate C regressions, honest bypass model and branch/ref preservation; its disposition is distinct from implementer self-test.
- A separate branch limits accidental inclusion of experimental code in official control commits. It does NOT restrict an executor's credentials from writing other refs; permission-boundary claims remain UNVERIFIED and are not a prototype acceptance claim. If real privilege isolation is needed, scope a separately permissioned repo/identity and test it under new authority.
- Source bytes from original Q01/validated old checkers must remain identical. Proposed source root under experimental branch remains validation/pp002-q02-control-integration/; new evidence validations/PP-002/Q02-CONTROL-INTEGRATION/Q02-PROT-001/**; new report implementations/PP-002_Q02_OFFLINE_PROTOTYPE_REPORT.md. Final allowlist fixed in later effective scope.
- No automatic synchronization or upstream generic repo release. Future canonical master is a separate project/approval after local Q02 QA and architecture extraction.

## Portability hygiene without expansion

Parameterize newly written core policy/contracts for project/store, roles/authority, paths, profile, versioned adapter, subject and evidence retention. Keep YU3DOH literals and source-specific reference oracles in configuration and fixtures. Do NOT add a second live project, actual alternate storage adapter, generic installer, release workflow or migrations to Q02-PROT-001. Existing I01–I32 test contract remains intact; QA can inspect project-specific hardcoding as a design-quality finding. No false claim of cross-project interoperability or production-readiness.

## Required later decision

Owner explicitly chooses B1 and permits a *new isolated experiment ref*, without allowing any control/product/ref overwrite. PC-003 then creates a frozen effective prototype scope with exact code baseline/branch allowlist, implementer and closer, tests and QA route; separately authorizes branch creation and **offline implementation only**. A generic central repository will not be created by that authority. Until then: NO implementation, no branch, no tests.
