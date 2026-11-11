# PP-002 — ONLINE-1C-SUPPORT-R1 Owner-Authorized Isolated Reproduction

artifact_id: PP-002-ONLINE-1C-SUPPORT-R1-OWNER-GRANT
status: EFFECTIVE / SINGLE USE / TEST ONLY
assignment: ONLINE-1C-SUPPORT-R1
source_owner_grant: Owner explicit "owner granted" after full bounded reproduction proposal and environment preparation, 2026-11-11
publisher: PROJECT_CONTROL / PC-004
mode: LAB-ONLY CONTROLLED GITHUB MUTATION + USER-CAPTURED VIDEO/HAR
source_control_parent: 056adb5097b7ce067082782e8d8c92b42db9082a
authority_effective_revision: immutable containing Git commit SHA of this authorization document
predecessor: runs/PP-002_ONLINE-1C_SUPPORT_HUMAN_ESCALATION_RECOVERY_CHECKPOINT.md
historical_stale_case: ONLINE-1C-A1 / TERMINAL INCONCLUSIVE / DO NOT MODIFY
github_lab: JormungandrMagnus/pp002-online-1b-lab
github_secondary_account: JormungandrMagnus
reported_app_installation: 180066746 (must be rechecked by secondary)
lab_default_branch: main
frozen_H0: d0aa948053ed81d5ac2b992521eeff6383c039cc
target_new_branch: test/online-1c-support-r1
target_initial_sha: H0
origin_YU3DOH_main: 54cc3aad246c89a29f2a18be63c539db68cae041

## Purpose and evidence boundary

Produce ONE new sequential reproduction of the stale expected-head `github_update_ref` scenario in the disposable lab, while the Owner locally captures an OBS video and a Chrome DevTools HAR (sanitized). Primary product/control and earlier laboratory refs must not change. The new observation may agree with or differ from A1 and is not automatically a root-cause attribution or CAS atomicity proof. This authorization is new; it does not reopen historic A1, A2 or Q02.

Owner reports OBS installed (primary display yet to be selected) and a dedicated Chrome session authenticated into secondary ChatGPT Work with Network pane opened/cleared. Before lab writes, Owner must verify actual video capture/legibility and HAR capture status. Do not inadvertently capture credentials or submit unreviewed HAR.

## Executable freeze and strict caps

Allowed actor: only SECONDARY ChatGPT Work linked to GitHub installation reported as lab-only. No alternative principal, token export, CLI, local Git bypass, alternate app or external Actions. Check identity/installation scope read-only before writes. If unprovable or not lab-only, STOP.

Preflight:
1. GET/read `main==H0`, full current lab branch list exactly consistent with historical refs and branch `test/online-1c-support-r1` absent.
2. Confirm GitHub action inventory includes the connector `github_update_ref(expected_sha,force)` and minimum Git object creation API; no undocumented substitutions.
3. Confirm Owner already started OBS and Network capture, Preserve log checked, Chrome sanitized HAR export available, no login/password prompt will be recorded. User controls capture; secondary executor cannot independently verify the OBS state unless Owner message asserts it.
4. If any preflight condition fails, STOP; no writes.

Permitted writes in one NEW branch only:
- create `refs/heads/test/online-1c-support-r1` pointing at H0 (one branch creation).
- create one synthetically populated UTF-8 JSON blob/file for candidate A under `effects/ONLINE-1C-SUPPORT-R1/WRITER-A.json`; build its tree from H0 and one commit A with parent H0.
- create one synthetically populated UTF-8 JSON blob/file for candidate B under `effects/ONLINE-1C-SUPPORT-R1/STALE-B.json`; build its tree from A and one commit B with parent A. Candidate B MUST be a valid fast-forward child of A.
- generate no other files/commits/branches. No private data or secrets in payload.
- after branch creation, GET branch==H0 and verify both candidate object identities and A->B ancestry read-only.

P2 (one mutation ONLY):
`github_update_ref(repository_full_name="JormungandrMagnus/pp002-online-1b-lab", branch_name="test/online-1c-support-r1", sha=A, expected_sha=H0, force=false)`.
After P2, independent GitHub GET branch MUST equal A. Any failure, unexpected object identity, or branch mismatch -> STOP; do NOT perform P3.

P3 (one mutation ONLY):
`github_update_ref(repository_full_name="JormungandrMagnus/pp002-online-1b-lab", branch_name="test/online-1c-support-r1", sha=B, expected_sha=H0, force=false)`, deliberately stale.
Record full tool response, error_code, error text, error marker and UTC time; GET/read resulting branch. Success/publication of B is a MATERIAL deviation: report immediately and STOP. Generic UNKNOWN cannot be labeled stale conflict; classified cause remains UNKNOWN without provider evidence.

Only user-authorized branch creation and max 2 ref update attempts. At most 2 authored synthetic files, 2 trees and 2 candidate commits; connector may use object-creation steps as required, but no additional history-changing operations beyond freeze. Zero retries of any mutation (including creation). STOP on unexpected partial mutation, differing ref, denied issuer/scope, or ambiguous stage. No forced updates, deletion, reset, cleanup, tags, releases, credentials, policy changes, workflow execution, code changes or writes to source YU3DOH. Do not modify historical A1 or ONLINE-1B refs or main.

## Evidence and capture

Secondary Work shall return: current identity/install readout (no token), read-only preflight and exact refs; branch create receipt; A/B commit/tree/blob SHAs and ancestry; exact args and raw tool response for P2 and P3; UTC timestamps/correlation marker; independent post-readbacks; STOP and explicit bounded outcome. Avoid claiming provider internal atomicity. Work does not upload raw sensitive HAR or video to GitHub.

Owner shall locally capture before first mutation: visible ChatGPT Work + DevTools Network tab, Network recording enabled, Preserve log checked, All filter, prior log cleared, OBS target primary display visible and readable; OBS mic/audio optional off. Keep video and browser HAR local, export sanitized HAR, review/redact cookies, Authorization, tokens, URLs/query/body and message contents before any transfer to support. Capture full tool output and timestamps; compare video and HAR UTC clock if available. Record SHA-256 of preserved originals, sanitized deliverables separately; never claim sanitized file is byte-identical to original.

No prior P3 HAR can be recreated retroactively; this is a NEW run with new evidence. HAR browser layer may not expose server-side Work-to-GitHub API. No automatic provider contact; Owner must explicitly submit sanitized artifacts to already-open support case after reviewing them.

## Results, no-go and close

Secondary runner may execute under THIS Owner GRANTED and its immutable control revision; new user command may route it, but no new Owner approval needed for actions strictly contained in this single-use freeze. After P3/readback, authority consumed; never run second attempt without separate grant. Classify reproduction outcome: ERROR_EXPLICIT_STALE; ERROR_UNKNOWN; OTHER_ERROR; UNEXPECTED_SUCCESS; or BLOCKED/PARTIAL. NONE implies atomic CAS formally established from this sequential experiment alone.

ONLINE-1C-A1 stays TERMINAL INCONCLUSIVE; A2 LIVE NO-GO; B concurrency NO-GO; Q02-PROT-001 NO-GO; original PP-002 Gate C and final REVISE unchanged; PCM-001 separate and unaffected.

After secondary returns, PC-004 independently reads GitHub refs and prepares new evidence intake/disposition under relevant documentation authority, with separately approved publish if required. Do not change existing historical files.
