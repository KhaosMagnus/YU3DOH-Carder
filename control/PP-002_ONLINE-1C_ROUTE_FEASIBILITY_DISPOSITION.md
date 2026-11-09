# PP-002 — ONLINE-1C-ROUTE-001 / Conditional publisher feasibility and decision

artifact_id: PP-002-ONLINE-1C-ROUTE-001-FEASIBILITY-DISPOSITION
artifact_type: documentary_technical_feasibility_decision
status: FROZEN / DESIGN ONLY / LIVE EXECUTION NO-GO
coordinator: PROJECT_CONTROL / PC-004
date: 2026-11-09 (America/Mexico_City)
owner_authority: GRANTED for read-only review and one documentary commit
diagnostic_input: validations/PP-002/ONLINE-1C-DIAG-001/PC-004_SECONDARY_CAPABILITY_INTAKE.md
provider_question: control/PP-002_ONLINE-1C_PROVIDER_CLARIFICATION_DRAFT.md
predecessor: ONLINE-1C-A1 / TERMINAL INCONCLUSIVE

## Decision

No safe executable A2 route is established in the currently exposed secondary GitHub connector. The next justified work is **provider clarification of connector error semantics and native conditional API support**, not an additional write. Prepare but do not send the clarification without separate Owner approval.

A future custom guarded publisher is a possible alternative, but it is **not presently designed, independently reviewed, permission-qualified, implemented, installed or authorized**. It must not be introduced as a quick workaround by exporting tokens or invoking a CLI from an unverified environment.

## Verified public API distinction

GitHub REST `PATCH /repos/{owner}/{repo}/git/refs/{ref}` accepts `sha` and `force`; `force=false` enforces fast-forward constraints but provides no documented `expected_sha` body input:
https://docs.github.com/en/rest/git/refs

GitHub GraphQL `createCommitOnBranch` has a required `expectedHeadOid` in `CreateCommitOnBranchInput`. The mutation creates a **new commit from file changes** against a branch with a checked expected HEAD; it does not merely move a ref to precreated A/B objects:
https://docs.github.com/en/graphql/reference/commits

These are **public API contracts**, not proof of which internal route the ChatGPT GitHub connector used or proof of availability via secondary installation `180066746`. The user/connector inventory shows the desired native mutation is absent.

## Path decision table

| Path | Current evidence | Decision |
| --- | --- | --- |
| Existing connector `update_ref(expected_sha)` | Parameter exposed; P3 error cause `UNKNOWN`; atomicity unverified | No repeat / NO-GO as CAS safety proof |
| REST update-ref `sha,force=false` | Server fast-forward behavior, no exact-old-head field | Not sufficient for required stale-head test |
| GraphQL `createCommitOnBranch(expectedHeadOid)` | Native conditional field documented, no callable secondary tool | Candidate architecture, EXECUTION BLOCKED |
| Vendor clarification | Prepared nonsecret questions tied to exact correlation marker | Recommended next action, requires separate send approval |
| Isolated constrained publisher | Would provide custom API route only after independent credential/permissions/issuer/CAS design | Contingency only; new scoped Owner decisions required |

## Preconditions for any future A2 experimental execution

1. Verified actual callable native conditional route and per-call issuing principal limited to the authorized laboratory.
2. Explicit frozen baseline, fresh branch, allowed paths/payloads, test vectors, maximum successful/negative mutations and evidence/retention rules.
3. Server-attributable error evidence distinguishing stale expected head from generic failure.
4. Independent inspection and no bypass/fallback with broader credentials.
5. Separate named Owner `GRANTED` for the exact executable route. Historical ONLINE-1B and ONLINE-1C-A1 authorizations do not roll over.
6. Document and demonstrate limits: a sequential stale-check observation is not a proof for actually overlapping requests or arbitrary exactly-once semantics.

## Provider/architecture decision after response

- If the provider confirms an atomic `expected_sha` contract with machine-readable expected-head conflicts and an install-scoped supported route, propose a new, narrowly frozen A2 execution request.
- If no native connector route can be provided, propose a **design-only** isolated publisher with least privilege, explicit issuer proof, no token export, audited operation receipt and independent security review; do not implement without later grant.
- If support cannot attribute P3, preserve it as `UNKNOWN`; do not retroactively upgrade A1.

## Continuing NO-GOs

ONLINE-1C-A2 execution NO-GO. ONLINE-1C-B concurrent experiment NO-GO. Q02-PROT-001 NO-GO. Historical PP-002 Gate C and PP-002 final REVISE unchanged. Generic Protocol v1.0 frozen. All laboratory branches and experimental Git objects remain preserved.
