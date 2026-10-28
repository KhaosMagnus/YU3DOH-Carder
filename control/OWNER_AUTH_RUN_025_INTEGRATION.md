# OWNER AUTH — RUN 025 INTEGRATION

status: FROZEN
protocol_version: 1.0

source:
OWNER

captured_by:
PROJECT_CONTROL / PC-002

owner_direction:
Proceed with RUN 025 integration.

authorized_source:
feature/workspace-run-025 @ dd968ba05e579461962bbcced0e9cae3cd4c3d23

authorized_target:
feature/workspace-v0.1

required_target_before:
e07140d5a9555a17b7b2306a45625c14adfafc8e

official_external_qa:
DESIGN_QA / DQA-004 — PASS

qa_report:
validations/RUN-025/DQA-004_EXTERNAL_QA_FINAL_REPORT.md

authorized_method:
FAST-FORWARD ONLY

Required preflight immediately before movement:
- feature/workspace-run-025 still equals dd968ba05e579461962bbcced0e9cae3cd4c3d23;
- feature/workspace-v0.1 still equals e07140d5a9555a17b7b2306a45625c14adfafc8e;
- main still equals 54cc3aad246c89a29f2a18be63c539db68cae041;
- source is ahead of target;
- behind_by = 0;
- merge-base equals e07140d5a9555a17b7b2306a45625c14adfafc8e;
- exact validated source SHA has not changed.

Authorized operation:
Advance feature/workspace-v0.1 by fast-forward only to:
dd968ba05e579461962bbcced0e9cae3cd4c3d23

On any mismatch:
STOP and return to PROJECT_CONTROL / PC-002.
Do not reconcile silently.

Not authorized:
- moving main;
- modifying feature/workspace-run-025;
- creating functional changes;
- merge commits;
- squash;
- rebase;
- cherry-pick;
- force push;
- CR-0002 implementation.

After successful verified integration:
return to PROJECT_CONTROL / PC-002 for RUN 025 closure and post-F04 compatibility sequencing.
