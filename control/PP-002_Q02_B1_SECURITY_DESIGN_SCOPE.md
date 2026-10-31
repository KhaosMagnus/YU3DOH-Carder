# Q02 B1 — Permissions and Isolation Security Design Scope

artifact_id: PP-002-Q02-B1-SECURITY-DESIGN-SCOPE
assignment: B1-SEC-DES-001 — B1 Real Permission Boundary and Six-Gate GO/NO-GO Design
status: FROZEN / DESIGN ONLY / NO EXECUTION
role: PROTOCOL_PORTABILITY / PP-002
coordinator: PROJECT_CONTROL / PC-003
source_control: 032afa84cc48b4117d19c40d7be77b7edb613099
owner_decision: control/PP-002_Q02_B1_OWNER_SIX_GATE_DECISION.md
observed_preflight: validations/PP-002/Q02-B1-SECURITY/PC-003_READ_ONLY_PERMISSIONS_PREFLIGHT.md
prior_Q02_design: handoffs/PP-002_Q02_Q01_CONTROL_INTEGRATION_DESIGN_HANDOFF.md @ blob a06fb711662848ccc16d2e32d621be279a9b1f4d
federated_direction: control/PROJECT_CONTROL_FEDERATED_ARCHITECTURE_DIRECTION.md

## Mission

Independently design a minimal, auditable, realistically enforceable **B1** permission architecture satisfying all six Owner-mandated gates without disabling legitimate PC-003 publications or falsely equating role chat separation to GitHub identity. Compare B1 vs independently permissioned B2 only as a no-go fallback. This is architectural SECURITY REVIEW; no tool mutation, credential provisioning, test run, policy installation, branch creation, live negative probe or implementation.

## Required deliverable (single additive handoff)

1. Read as-is actual GitHub refs, rulesets response, branch protection flags, repo visibility, installation selection, account identity and connector interfaces (identify exactly what cannot be learned from available APIs).
2. State threat model: inadvertent wrong-branch publication, malicious/buggy executor, privileged credential sharing, direct write bypass, compromised approval/index, out-of-band admin, wrong actor, self-approval, stolen/secrets-in-public-repo. Explicitly separate trusted platform/provider vs caller claims.
3. Provide full actor/operation/resource/permission matrix, including roles OWNER, PC coordinator, experimental writer, QA reader, emergency administrator. Distinguish actual named GitHub principals/Apps from chat roles, and only map an identity when evidenced.
4. Produce concrete proposed branch ruleset configurations and order of activation: targets main, meta/project-control, existing operational refs, and experimental branch. Specify update/create/delete/force restrictions, bypass actors, audit route, compatibility with PC publication and recovery if rule blocks legitimate PC work. Do not grant blanket admin bypass to the experimental principal.
5. Identify how the current all-repositories installation and admin user metadata do/don't translate to effective scopes. List exact external account/settings inspections that would be needed to certify credential separation, without claiming the connector can edit GitHub Settings.
6. Propose a **non-destructive** acceptance test matrix under later separate authorization: settings introspection, isolated test identity/branch, rejected unintended writes, permitted expected PC writes on expendable targets, immutable readback, ruleset and actor proof, and rollback; never probe protected historical refs with writes.
7. Map six mandatory Owner gates to precise GO/NO-GO acceptance evidence, phases and independent QA identity. Consider whether B1 can be GO with existing shared app; if no, recommend B2, separately permissioned repository or identity. No weakening of S1/S2 merely to permit development.
8. Plan containment of public data/credentials, exact SHA branch baseline, immutable Q01 byte identity, branch namespace, no merge into control/product, safe deletion/retention policy (never rewrite historical records).
9. Cost/maintenance/privilege risk analysis and prioritized recommendation, including administrative friction and future federated Project Control portability. Distinguish feasibility, permission claims and actual tests.
10. Return clear terminal classification: B1 DESIGNABLE / S1-S2 PROVEN? / IMPLEMENTATION NO-GO until separately verified; enumerate required Owner actions and exactly what is and is not authorized.

## Boundaries

Output: handoffs/PP-002_Q02_B1_PERMISSION_ISOLATION_DESIGN_HANDOFF.md only (one new documentation blob). Use GitHub READ operations only for source collection; no publishing code or experimental branch. Publishing this authorized design handoff to meta/project-control via normal additive expected-head/CAS documentation procedure is the sole permitted write by assigned role. Do not edit original Q02, Q01, PP-002 experiment, protocol, frozen policies, or central indexes. Do not modify product or ops refs. Keep original Gate C/final PP-002 REVISE and P01/P02 uncertainty.
