# RUN 025 — ADMIN INTEGRATION HANDOFF

status: FROZEN
protocol_version: 1.0

SOURCE:
PROJECT_CONTROL / PC-002

TARGET:
INTEGRATION_ADMIN / IA-003

Owner authorization:
control/OWNER_AUTH_RUN_025_INTEGRATION.md

External QA:
validations/RUN-025/DQA-004_EXTERNAL_QA_FINAL_REPORT.md

Official QA result:
PASS

Exact validated candidate:
feature/workspace-run-025
dd968ba05e579461962bbcced0e9cae3cd4c3d23

Target integration branch:
feature/workspace-v0.1

Required target-before SHA:
e07140d5a9555a17b7b2306a45625c14adfafc8e

Main required unchanged:
54cc3aad246c89a29f2a18be63c539db68cae041

Authorized operation:
fast-forward feature/workspace-v0.1 to dd968ba05e579461962bbcced0e9cae3cd4c3d23.

Preconditions:
- source ref still equals the exact validated candidate;
- target ref still equals the required target-before SHA;
- main still equals the protected SHA;
- compare target→source reports ahead_by >= 1 and behind_by 0;
- merge-base equals required target-before SHA;
- candidate remains the exact External-QA-PASS SHA.

Integration method:
FAST-FORWARD ONLY.

Forbidden:
- merge commit;
- squash;
- rebase;
- cherry-pick;
- force push;
- product code edits;
- source candidate edits;
- main movement;
- CR-0002 implementation.

On any mismatch:
STOP and return to PROJECT_CONTROL / PC-002.

After movement, verify:
- feature/workspace-v0.1 equals dd968ba05e579461962bbcced0e9cae3cd4c3d23;
- feature/workspace-run-025 remains dd968ba05e579461962bbcced0e9cae3cd4c3d23;
- main remains unchanged;
- compare target/source is identical;
- no unexpected ref movement occurred.

Expected output:
integrations/RUN-025_INTEGRATION_REPORT.md

Return:
INTEGRATION_ADMIN / IA-003 → PROJECT_CONTROL / PC-002
