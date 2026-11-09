# PP-002 — ONLINE-1C Stale-Writer Rejection and Conditional Write Admission

artifact_id: PP-002-ONLINE-1C-CONCURRENCY-ADMISSION-PROPOSAL
artifact_type: successor_experiment_design_proposal
status: PROPOSED / NO OWNER EXECUTION AUTHORIZATION
coordinator: PROJECT_CONTROL / PC-004
date: 2026-11-09 (America/Mexico_City)
predecessor: ONLINE-1B-20261108-R1 / TERMINAL LAB-SCOPED PASS
source_disposition: runs/PP-002_ONLINE-1B_R1_TERMINAL_PASS_DISPOSITION.md

## 1. Rationale and target

ONLINE-1B verified a single-writer connected recovery but did not verify atomic conditional write admission under stale or competing writers. That is the highest-impact next technical uncertainty before a generic operational Project Control publisher can rely on GitHub writes. Merely reading HEAD before calling GitHub `create_file` does not protect against a writer modifying the branch between read and write.

**Goal:** show that a stale writer cannot advance the experimental branch when a different actor has already published a new head, and that the rejected actor reconciles without blind retries or duplicate effects.

## 2. Proposed sequence (not executed)

**ONLINE-1C-A — Deterministic stale-head collision:** In a separate newly frozen experiment ref inside an explicitly authorized disposable GitHub laboratory, prepare two candidate operations from the *same* exact starting head. Publish candidate A through a guarded writer with exact `expected_sha` compare-and-swap. Submit candidate B with the stale expected SHA and require explicit rejection, no head movement, no extra effect and no fallback to unrestricted writing. Freshly reconcile the new branch head and decide whether B must stop or be rebuilt with renewed authority.

**ONLINE-1C-B — Actual concurrent admission (optional, separately qualified):** Only if distinct clients, correctly scoped credentials and an independently observable race can be demonstrated, arrange simultaneous competing submissions. One accepted write maximum for the guarded ref. If the environment only supports sequential submissions, call it stale-state test, **not** proven concurrent safety. The original GitHub connector exposes an `update_ref` expected-head parameter, but its real atomicity and behavior on the intended experimental installation must be measured before assigning PASS.

**Negative cases:** stale read, branch advance between read and write, missing acknowledgement after accepted CAS, repeated publication request, invalid candidate payload, missing/extra ref, permission denied, and interrupted reconciliation. STOP rather than silently using a broader writer.

## 3. Prerequisites / STOP gates

1. New explicit Owner authorization specifying exact laboratory, fresh branch, allowed new paths, writers, preflight and disposal/retention. Existing ONLINE-1B `GRANTED` is not reusable for new effects.
2. Freeze lab base HEAD, test vector, logical effect IDs, candidate blob/tree identities and intended outputs **before** execution.
3. Confirm GitHub principal and installation-scoped permissions for every actual test writer, including presence/absence of privileged fallback. No principal may write the original YU3DOH product/control branches.
4. Confirm that the chosen publisher supplies an enforced expected-head transition; if not, implement/choose a bounded guarded publisher in a separately authorized location. A client-side HEAD read is insufficient.
5. Independent observer captures before/after refs, exact API receipts, commit/tree/blobs, rejected-writer status and all side effects. Retain negative evidence and any uncertain results without concealment.
6. Prohibit deletion, force-push, modifications to security rules, workflow invocation and product/control changes. Abort on any unexpected state or authorization mismatch.

## 4. Proposed acceptance

PASS for 1C-A only if: candidate A publishes exactly once; stale candidate B is rejected without changing the ref; expected head/parent, payload and admissible file allowlist match; no duplicate logical effect; reconciliation uses fresh receipts and chooses STOP/REVALIDATE rather than blind retry; independent inspection agrees. PASS for 1C-B additionally requires measured truly overlapping requests, not only nominal second actors.

FAIL on any unauthorized publication or duplicate effect. BLOCKED / INCONCLUSIVE on insufficient permission/issuer evidence, partial response, missing expected-head enforcement or unobservable concurrency. No test may broaden claims beyond its measured scenario.

## 5. Strategic next work and non-authorizations

If 1C-A passes, propose a reusable guarded Git publication pattern and negative-case regression suite, then independently assess permissions and multi-identity isolation before considering any general Project Control acceptance. Do not assume this lifts the S1–S6 conditions for the original offline Q02 prototype, historical Gate C REVISE, or adoption/federation gates.

**Owner decision to request later:** authorize bounded ONLINE-1C-A setup/execution or DEFER/REVISE the proposal. This document itself authorizes no branch creation, account connection, settings change or write.
