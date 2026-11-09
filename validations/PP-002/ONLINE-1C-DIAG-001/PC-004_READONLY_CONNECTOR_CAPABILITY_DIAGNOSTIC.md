# ONLINE-1C-DIAG-001 — Read-only GitHub conditional publisher diagnostic

artifact_id: PP-002-ONLINE-1C-DIAG-001-CAPABILITY-REPORT
artifact_type: bounded_read_only_connector_and_public_documentation_review
status: PARTIAL / READ-ONLY REVIEW COMPLETE IN PRIMARY CHAT / SECONDARY-RUNTIME CAPABILITY UNVERIFIED
coordinator: PROJECT_CONTROL / PC-004
date: 2026-11-09 (America/Mexico_City)
owner_authorization: GRANTED for one read-only diagnostic; no further lab writes
source_experiment: ONLINE-1C-20261109-A1 / INCONCLUSIVE
source_disposition: runs/PP-002_ONLINE-1C_A1_TERMINAL_INCONCLUSIVE_DISPOSITION.md

## 1. Question, finding, and evidence confidence

Question: Why did secondary GitHub `update_ref` with stale `expected_sha` fail, and is an enforceable conditional commit interface available without broader credentials?

**Finding:** Exact P3 root cause remains UNKNOWN. The actor-provided response is `GithubGraphQLAPIError` with `error_code=UNKNOWN`, timestamp `2026-11-09T08:15:23Z`, marker `1F24:1F4B:36B8130:B502419:6AF1811B`. GitHub ref readback corroborates only nonpublication of B. The provider's internal request handling, whether expected-head is checked atomically, and error classification cannot be established from this receipt. No provider response tied to the marker was supplied.

## 2. Verified connector surface available to PC-004

GitHub plugin exposes `update_ref({repository_full_name, branch_name, sha, force?:false, expected_sha?:string})`, described as rejecting a mismatched expected SHA and advising inspection before retry. In the **connected primary-chat action inventory** (89 GitHub actions), there is no `createCommitOnBranch` action and no arbitrary authenticated GraphQL request action. `fetch` is restricted to approved public GitHub **GET** resources and is not a GraphQL mutation path.

This is a finding about **this active connection's advertised tools**, not proof that the secondary ChatGPT installation or external GitHub environment has no suitable API access. The secondary route has not been re-inventoried in this documentary review.

## 3. External API contract comparison

**REST Git reference update**: GitHub documents `PATCH /repos/{owner}/{repo}/git/refs/{ref}` with input `sha` and `force`, but no `expected_sha`. With `force=false`, the server checks fast-forward compatibility, which does not reject a stale client expectation when B directly descends from A. Thus REST alone does not furnish the requested exact-old-head CAS parameter.

Official reference: https://docs.github.com/en/rest/git/refs

**GraphQL `createCommitOnBranch`**: GitHub documents `CreateCommitOnBranchInput.expectedHeadOid: GitObjectID!`, alongside `branch`, `fileChanges` and `message`. It commits files to a branch as the authenticated caller and changes that branch's head. This is a promising server-side conditional commit surface, but accessible invocation by the restricted secondary GitHub installation has NOT been established. The native GraphQL mutation changes API shape; it is not equivalent to publishing pre-created commits A/B via `update_ref`.

Official reference: https://docs.github.com/en/graphql/reference/commits

**Error caveat:** `GithubGraphQLAPIError` is not a reliable by-itself indication of a particular GitHub API path or reject reason. No native server error code, status, provider transaction trace, or normal-versus-stale control pair has been verified.

## 4. Read-only laboratory inspection

Fresh GitHub queries after STOP confirm:
- Ref `test/online-1c-20261109-a1 @ 0204e991389f4b6098a9f57da4d205f0901b7716`.
- Lab `main @ d0aa948053ed81d5ac2b992521eeff6383c039cc`.
- Lab `test/online-1b-20261108-r1 @ 1e610f0c0f52c223528dec466201fd2cde12faa1`.
- Reachable A tree includes README and WRITER-A only; STALE-B is absent.
- GitHub Actions reported zero runs.
- YU3DOH main and Project Control refs remained as expected before this expressly authorized documentary update.

## 5. Decision matrix

| Candidate surface | Known contract | Actual available scoped path | Decision |
| --- | --- | --- | --- |
| GitHub connector `update_ref(expected_sha)` | Parameter is exposed; mismatch promised by tool description | Available to secondary according to completed run; error semantics/atomicity unresolved | NO-GO for safety certification or repeating the same test as proof |
| REST `PATCH git/refs` | `sha`/`force`, no expected-head input | A token would be needed; not sourced here | NO-GO for exact-head CAS by itself |
| GraphQL `createCommitOnBranch(expectedHeadOid)` | Native expected-head parameter documented | No callable action in primary tool inventory; secondary capability UNKNOWN | PROMISING / EXECUTION BLOCKED UNTIL VERIFIED |
| Dedicated guarded publisher | Would need verified issuer, policy, credentials, atomic transition, immutable audit | Not implemented, not authorized | DESIGN OPTION ONLY |

## 6. Remaining admissible read-only evidence

Secondary ChatGPT can perform an inventory using `routing/ROUTE-PP-002-ONLINE-1C-DIAG-001-SECONDARY-READONLY.md`. It must report whether an actual native GraphQL mutation is callable under the verified lab-only installation **without invoking it**. It must not extract/print tokens or discover ways around connector restrictions. If absent, return NO-GO and request bounded provider/connector clarification referencing the P3 marker; support communication would need separate operational approval if external outreach is needed.

**Current decision: CONDITIONAL NO-GO FOR LIVE A2.** The diagnostic's primary-only evidence is complete as a partial assessment, but effective secondary write-route admission is not established.

## 7. Non-authorizations

No GitHub lab writes, retry P3, branch creation, new tokens, permission/ruleset changes, CLI workflows, untrusted GitHub App installation, product mutation, Q02 prototype, ONLINE-1C-A2 execution, or ONLINE-1C-B concurrency under this diagnostic. Historical Gate C and official PP-002 final REVISE remain.
