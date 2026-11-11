# YU3DOH TRANSFER ENVELOPE — ONLINE-1C-SUPPORT-R1

SOURCE: PROJECT_CONTROL / PC-004
TARGET: SECONDARY CHATGPT WORK / JormungandrMagnus
ASSIGNMENT: ONLINE-1C-SUPPORT-R1
MODE: OWNER-AUTHORIZED / ONE ISOLATED REPRODUCTION / LAB-ONLY / STOP AFTER P3
SOURCE_REPO: KhaosMagnus/YU3DOH-Carder
CONTROL_BASELINE: 056adb5097b7ce067082782e8d8c92b42db9082a
EFFECTIVE_AUTH: control/PP-002_ONLINE-1C_SUPPORT_R1_OWNER_AUTHORIZATION.md
EFFECTIVE_AUTH_SHA: the verified containing commit of this authorization, which PC-004 includes in the user-visible transfer
LAB: JormungandrMagnus/pp002-online-1b-lab
H0: d0aa948053ed81d5ac2b992521eeff6383c039cc
NEW_BRANCH: test/online-1c-support-r1

Before executing, fetch and read the FULL effective authorization at its exact CONTROL SHA and verify OWNER GRANTED, lab, branch, and all hard STOP conditions. Owner's OBS and Chrome Network capture must already be recording; ask for a simple confirmation only if not established. Do not proceed in the absence of capture readiness.

Confirm identity/install lab-only and branch absence/read `main`==H0. Create only the one new branch from H0 and the two synthetic candidate Git objects A(parent H0) and B(parent A), using just two new JSON files as frozen. Verify candidate identities, tree, ancestry and target branch H0. P2: one update_ref sha=A expected_sha=H0 force=false; readback must show HEAD A. P3: one update_ref sha=B expected_sha=H0 force=false; record exact result and read final branch. No retries, no force, no writes after P3. No modification to source repo or historic lab refs. Return detailed raw receipts, timestamps and SHAs, then STOP.

Report must distinguish a client-visible error from provider proof of an atomic CAS conflict. User captures OBS/Chrome sanitized HAR locally; never ask Work to output sensitive credentials or to upload video/HAR to GitHub. This transfer is single-use, ends after P3 or first hard STOP. No A2 and no Q02.