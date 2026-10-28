# RUN 026 — Integration Report

status: FINAL
protocol_version: 1.0
role: INTEGRATION_ADMIN / IA-004
target: PROJECT_CONTROL / PC-002
mode: AUTHORIZED INTEGRATION
run: RUN 026
request: CR-0002 — Library Dark Theme
report_date: 2026-10-28
final_result: INTEGRATED

## Consumed control authority

- CONTROL SHA: `49561dabb2b1ebc873d9420c9d73184f324af10d` (`meta/project-control`).
- Owner integration authorization: GRANTED / EXPLICIT.
- Primary authorization: `control/RUN-026_INTEGRATION_AUTHORIZATION.md`.
- Primary integration request: `integrations/RUN-026_INTEGRATION_REQUEST.md`.
- Primary route: `routing/ROUTE-RUN-026-IA-004.md`.
- Official external QA: DESIGN_QA / DQA-006 — **PASS**.
- QA report: `validations/RUN-026/DQA-006_EXTERNAL_QA_REPORT.md`.
- Official QA disposition: `runs/RUN-026_DQA-006_PASS_DISPOSITION.md`.
- The live control branch was verified at the exact consumed CONTROL SHA at preflight and immediately prior to report publication; no newer conflicting integration authority was present.

## Exact live pre-mutation preflight

Live GitHub Git ref objects were read immediately before the mutation:

| Ref | Observed SHA | Required SHA | Verdict |
| --- | --- | --- | --- |
| `feature/workspace-run-026` | `e11579950ef7ed20e4b6eeee88f9c3597c1f074b` | `e11579950ef7ed20e4b6eeee88f9c3597c1f074b` | PASS |
| `feature/workspace-v0.1` | `dd968ba05e579461962bbcced0e9cae3cd4c3d23` | `dd968ba05e579461962bbcced0e9cae3cd4c3d23` | PASS |
| `main` | `54cc3aad246c89a29f2a18be63c539db68cae041` | `54cc3aad246c89a29f2a18be63c539db68cae041` | PASS |
| `meta/project-control` | `49561dabb2b1ebc873d9420c9d73184f324af10d` | `49561dabb2b1ebc873d9420c9d73184f324af10d` | PASS |

- Source exactly matched the DQA-006 validated candidate.
- Target exactly matched the authorized target-before.
- Official DQA-006 PASS was verified in the frozen current control disposition.
- Frozen integration authorization identified IA-004 and explicit owner permission.
- The control HEAD matched the consumed authorization revision, excluding a newer conflicting revision at preflight.
- GitHub compare `dd968ba05e579461962bbcced0e9cae3cd4c3d23...e11579950ef7ed20e4b6eeee88f9c3597c1f074b`: `status=ahead`, `ahead_by=1`, `behind_by=0`, `total_commits=1`, merge base `dd968ba05e579461962bbcced0e9cae3cd4c3d23`.
- Candidate's sole Git parent: `dd968ba05e579461962bbcced0e9cae3cd4c3d23` (one parent, no merge commit). The candidate was therefore a direct descendant of target; a pure fast-forward was possible.

## Authorized mutation performed

Exactly one product ref update was requested using the GitHub `update_ref` operation:

```text
repository_full_name: KhaosMagnus/YU3DOH-Carder
branch_name: feature/workspace-v0.1
sha: e11579950ef7ed20e4b6eeee88f9c3597c1f074b
expected_sha: dd968ba05e579461962bbcced0e9cae3cd4c3d23
force: false
```

GitHub mutation response: `success=true`.

Only `refs/heads/feature/workspace-v0.1` moved from `dd968ba05e579461962bbcced0e9cae3cd4c3d23` to `e11579950ef7ed20e4b6eeee88f9c3597c1f074b`. The expected-SHA guard rejected any changed pre-mutation target, and `force=false` required fast-forward semantics.

No force push, force update, reset, rebase, cherry-pick, squash, merge commit, source rewrite, candidate mutation, main movement, or unrelated product change was performed.

## Live post-mutation verification

| Ref | Observed after | Required after | Verdict |
| --- | --- | --- | --- |
| `feature/workspace-v0.1` | `e11579950ef7ed20e4b6eeee88f9c3597c1f074b` | `e11579950ef7ed20e4b6eeee88f9c3597c1f074b` | PASS |
| `feature/workspace-run-026` | `e11579950ef7ed20e4b6eeee88f9c3597c1f074b` | `e11579950ef7ed20e4b6eeee88f9c3597c1f074b` | PASS |
| `main` | `54cc3aad246c89a29f2a18be63c539db68cae041` | `54cc3aad246c89a29f2a18be63c539db68cae041` | PASS |

Additional independent GitHub compare `feature/workspace-v0.1...feature/workspace-run-026`: `status=identical`, `ahead_by=0`, `behind_by=0`, `total_commits=0`, merge base `e11579950ef7ed20e4b6eeee88f9c3597c1f074b`. The candidate commit still has precisely the one original parent `dd968ba05e579461962bbcced0e9cae3cd4c3d23`; no alternate candidate identity or merge commit exists.

**FINAL INTEGRATION RESULT: INTEGRATED**

## Terminal return

```text
YU3DOH RETURN ENVELOPE

SOURCE ROLE / INSTANCE:
INTEGRATION_ADMIN / IA-004

TARGET ROLE / INSTANCE:
PROJECT_CONTROL / PC-002

MODE:
AUTHORIZED INTEGRATION

RUN:
RUN 026

REQUEST:
CR-0002 — Library Dark Theme

CONSUMED CONTROL SHA:
49561dabb2b1ebc873d9420c9d73184f324af10d

PRIMARY AUTHORIZATION:
control/RUN-026_INTEGRATION_AUTHORIZATION.md

OFFICIAL EXTERNAL QA:
DQA-006 / PASS

PRE-MUTATION SOURCE:
feature/workspace-run-026
e11579950ef7ed20e4b6eeee88f9c3597c1f074b

PRE-MUTATION TARGET:
feature/workspace-v0.1
dd968ba05e579461962bbcced0e9cae3cd4c3d23

OPERATION:
GUARDED FAST-FORWARD ONLY
force=false
expected_sha=dd968ba05e579461962bbcced0e9cae3cd4c3d23

RESULT:
INTEGRATED

TARGET AFTER:
feature/workspace-v0.1
e11579950ef7ed20e4b6eeee88f9c3597c1f074b

SOURCE AFTER:
feature/workspace-run-026
e11579950ef7ed20e4b6eeee88f9c3597c1f074b

MAIN AFTER:
main
54cc3aad246c89a29f2a18be63c539db68cae041

SOURCE / TARGET:
IDENTICAL

NO FORCE / REBASE / CHERRY-PICK / SQUASH / MERGE COMMIT:
CONFIRMED

REPORT:
integrations/RUN-026_INTEGRATION_REPORT.md

RETURN:
INTEGRATION_ADMIN / IA-004
->
PROJECT_CONTROL / PC-002
```
