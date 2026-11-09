# PP-002 — ONLINE-1C-A2 Conditional Mutation Controlled Revalidation

artifact_id: PP-002-ONLINE-1C-A2-PROPOSED-SCOPE
artifact_type: proposed_run_design_and_owner_decision_dependency
status: DESIGN PROPOSAL / EXECUTION NOT AUTHORIZED / ADMISSION BLOCKED
coordinator: PROJECT_CONTROL / PC-004
date: 2026-11-09 (America/Mexico_City)
predecessor: ONLINE-1C-A1 / TERMINAL INCONCLUSIVE
diagnostic: validations/PP-002/ONLINE-1C-DIAG-001/PC-004_READONLY_CONNECTOR_CAPABILITY_DIAGNOSTIC.md

## Objective

Measure an explicit stale-head mismatch from **GitHub's native conditional commit mechanism**, without relying on connector-specific ambiguous `update_ref` error mapping. Restrict proof to one sequential stale-state scenario. True concurrent writer exclusion remains a different experiment.

## Admission prerequisites before Owner execution request

1. Read-only confirmation of an actually callable GraphQL `createCommitOnBranch` route under the lab-only JormungandrMagnus installation `180066746`, or a separately approved secure publisher whose identity and atomic expected-head behavior can be independently demonstrated.
2. No unrestricted fallback principal, token export, CLI workaround, owner-secret sharing, workflow or privilege increase. If current connector lacks the action, report BLOCKED rather than improvising a route.
3. New explicit Owner `GRANTED` with exact fresh branch name, frozen base SHA, payload/path allowlist, maximum mutation count, immutable oracles, retention policy, stop and rollback plan. A1 GRANTED cannot be reused.
4. The exact server/API error surface must expose stale-head mismatch in an attributable manner. A generic UNKNOWN GraphQL error is not a positive result.
5. Independent observer must be capable of reading current/previous refs, new commit, changed files and exact response receipts.

## Future proposed test vector (not frozen or executed)

- Start from a fresh immutable H0 in a disposable lab-only branch, never reuse/reset A1.
- Native GraphQL `createCommitOnBranch` A uses `expectedHeadOid=H0`, creates effect A once, captures returned commit/ref and checks branch HEAD.
- One native GraphQL B call presents the same old H0 plus a **distinct path** while A is now HEAD. Require an explicit expected-head mismatch response and B absent from reachable branch.
- Fresh reconciliatory read with no blind retry; main, ONLINE-1B and A1 frozen refs unmodified.
- Preserve API receipts and both success/negative evidence; no second call or hidden fallback if negative result is ambiguous.

## Proposed acceptance matrix

PASS only if scoped principal and exact native surface are verified, A creates a single effect, B is explicitly rejected for stale expected HEAD, HEAD is unchanged after B, no duplicate or unintended effects, and an independent reviewer reproduces ref/commit/file evidence.

INCONCLUSIVE on generic error or absent causal evidence. FAIL on B publication, unauthorized writes or duplicate effect. BLOCKED before execution if capability, identity, custody, scope or immutable test baseline is unresolved.

**Acceptance limit:** PASS would establish one native sequential stale-head conflict handling scenario, NOT generic atomicity under truly simultaneous clients. A future ONLINE-1C-B would require separate authorization, real overlapping requests and independent traces.

## Next Owner decision (not requested for immediate execution)

After receipt of read-only secondary capability inventory and any official nonsecret connector error explanation, PC-004 shall propose `GRANTED / DEFERRED / REVISE` on the **specific executable A2 route**. Until then, DO NOT EXECUTE A2.
