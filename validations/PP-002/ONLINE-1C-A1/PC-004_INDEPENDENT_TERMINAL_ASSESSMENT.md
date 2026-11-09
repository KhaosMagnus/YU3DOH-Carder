# PP-002 / ONLINE-1C-A1 — Independent terminal validation

artifact_id: PP-002-ONLINE-1C-A1-PC004-TERMINAL-ASSESSMENT
artifact_type: independent_read_only_validation
status: FROZEN / TERMINAL / INCONCLUSIVE
experiment_id: ONLINE-1C-20261109-A1
coordinator: PROJECT_CONTROL / PC-004
decision_date: 2026-11-09 (America/Mexico_City)
owner_run_authority: GRANTED for one bounded isolated lab test
owner_documentation_authority: GRANTED for one canonical documentary closure and read-only diagnostic
laboratory: JormungandrMagnus/pp002-online-1b-lab
experiment_branch: test/online-1c-20261109-a1
source_actor_report: supplied to PC-004 in chat, retained outside GitHub as supplied evidence; GitHub observations were independently repeated by PC-004
source_local_draft: PC004_ONLINE1C_A1_TERMINAL_INCONCLUSIVE.md (local precursor; this is the canonical publication)

## 1. Decision and evidence ranking

The actor-reported P2 call `update_ref(expected_sha=H0, sha=A, force=false)` returned `success=true`. Independent GitHub ref/tree reads confirm A published. Actor-reported P3 `update_ref(expected_sha=H0, sha=B, force=false)` returned `GithubGraphQLAPIError / UNKNOWN`, with no explicit expected-head conflict, native status or provider cause. Independent ref/tree/history reads confirm B was NOT published.

**Disposition of stale-head condition: INCONCLUSIVE.** Absence of publication cannot establish that `expected_sha` caused the error. The observation neither proves a correct guard nor proves the guard failed. No retry or alternative write is authorized; the operational run stopped.

## 2. Exact immutable identities

| Item | SHA |
| --- | --- |
| H0 / laboratory main | `d0aa948053ed81d5ac2b992521eeff6383c039cc` |
| H0 tree | `4724262f79d73d91404a406b27eba05fe2ff27ee` |
| Candidate A commit / terminal branch HEAD | `0204e991389f4b6098a9f57da4d205f0901b7716` |
| Candidate A tree | `1b71dda697927203ace1a2c234197be345be3d19` |
| Candidate A effect blob | `f135711f6d4d5d272934d0ce0ca5f10e3ea90d3c` |
| Candidate B Git object (unreachable from experimental branch) | `3aba7a03d7ceea88c6c8a21eeecb1fc9f0db811c` |
| Candidate B tree | `c8e7f174ace93b520f9a205e14996a8e7dc1f819` |
| Candidate B effect blob | `7b75721173fbd69a1fe94e3d718617041ee1ede0` |
| Preserved ONLINE-1B branch | `1e610f0c0f52c223528dec466201fd2cde12faa1` |
| YU3DOH main at inspection | `54cc3aad246c89a29f2a18be63c539db68cae041` |
| YU3DOH control prior to authorized documentary closure | `ce2e47e0c1c579f6cd9618d29634a44bfa0663ff` |

A is a direct child of H0. B is a direct child of A. GitHub compare `A...B` reported ahead_by=1 / behind_by=0 with only `effects/ONLINE-1C-20261109-A1/STALE-B.json` added: **B is fast-forward compatible with A**. A simple non-fast-forward conflict is not a supported explanation.

At the final PC-004 inspection, the experiment branch points to A; its full nontruncated reachable tree has only the original README and `effects/ONLINE-1C-20261109-A1/WRITER-A.json`, the latter matching the frozen blob. B remains queryable by object SHA but not reachable through the experimental branch. Other lab refs were unchanged and GitHub Actions inventory had total_count=0.

## 3. Original connector receipts as actor-reported evidence

P2 input: `{repo:"JormungandrMagnus/pp002-online-1b-lab", branch:"test/online-1c-20261109-a1", sha:"0204e991389f4b6098a9f57da4d205f0901b7716", expected_sha:"d0aa948053ed81d5ac2b992521eeff6383c039cc", force:false}`. Reported receipt: `structuredContent.success=true`.

P3 input: identical repository, branch, expected_sha=H0 and force=false, target `sha=3aba7a03d7ceea88c6c8a21eeecb1fc9f0db811c`. Reported receipt: `GithubGraphQLAPIError`, `error_code=UNKNOWN`, request time `2026-11-09T08:15:23Z`, marker `1F24:1F4B:36B8130:B502419:6AF1811B`. No original error type guaranteeing a stale mismatch, no HTTP status and no verified internal trace were available.

These responses were reported by the secondary executor; PC-004 did **not** replay the write. The lack of subsequent branch advancement was independently established through GitHub. This rank distinction is material.

## 4. Acceptance matrix

| Control | Result |
| --- | --- |
| Candidate A/B parentage, trees, frozen file bytes/blobs | PASS |
| A published exactly as intended | PASS |
| B not published | PASS |
| B fast-forward compatible with A | PASS |
| P3 failure causally proved to be stale-head rejection | UNKNOWN |
| General CAS atomicity or real concurrent writer exclusion | NOT TESTED |
| No duplicates in inspected reachable history/tree | PASS within scope |
| No lab workflow runs | PASS within queried inventory |
| Original GitHub refs unchanged during lab run | PASS within observed snapshots |
| Global identity/token isolation, predecessor inactivity | NOT PROVEN |

## 5. Source references

- Experiment ref: https://api.github.com/repos/JormungandrMagnus/pp002-online-1b-lab/git/ref/heads/test/online-1c-20261109-a1
- Candidate A Git commit: https://api.github.com/repos/JormungandrMagnus/pp002-online-1b-lab/git/commits/0204e991389f4b6098a9f57da4d205f0901b7716
- Candidate B Git commit: https://api.github.com/repos/JormungandrMagnus/pp002-online-1b-lab/git/commits/3aba7a03d7ceea88c6c8a21eeecb1fc9f0db811c
- Compare A/B: https://api.github.com/repos/JormungandrMagnus/pp002-online-1b-lab/compare/0204e991389f4b6098a9f57da4d205f0901b7716...3aba7a03d7ceea88c6c8a21eeecb1fc9f0db811c
- Git refs and Actions: https://api.github.com/repos/JormungandrMagnus/pp002-online-1b-lab/git/refs ; https://api.github.com/repos/JormungandrMagnus/pp002-online-1b-lab/actions/runs?per_page=100

## 6. Non-authorizations and historical invariants

ONLINE-1B remains LAB-SCOPED PASS. Historical Gate C and PP-002 final stay REVISE, with P01 UNCERTAIN and P02 UNKNOWN. Q02-PROT-001 is NO-GO and S1–S6 are not cleared by this lab. No product ref movement, permission change, workflow, cleanup, another test, or retry of P3 is authorized. Canonical **documentation** under `meta/project-control` is allowed by the subsequent Owner GRANTED and is not part of the experimental write ledger.
