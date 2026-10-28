# ROUTE — RUN 026 / DEV-008

status: FROZEN
protocol_version: 1.0

source: PROJECT_CONTROL / PC-002
target: DEVELOPMENT / DEV-008
session: DEV-008/S01
mode: IMPLEMENTATION

authorization: runs/RUN-026_AUTHORIZATION.md
pilot: control/RUN-026_SESSION_PILOT.md
scope: scopes/CR-0002_LIBRARY_DARK_THEME-v2.md
design: handoffs/CR-0002_LIBRARY_DARK_THEME_IMPLEMENTATION_HANDOFF.md
compatibility: control/CR-0002_POST_F04_COMPATIBILITY_DISPOSITION.md

baseline:
feature/workspace-v0.1 @ dd968ba05e579461962bbcced0e9cae3cd4c3d23

target_branch:
feature/workspace-run-026

Mission:
Implement only CR-0002 under the frozen artifacts above.

Preflight mismatch:
IMPLEMENTATION BLOCKED.

Expected report:
implementations/RUN-026_IMPLEMENTATION_REPORT.md

Return:
DEVELOPMENT / DEV-008 → PROJECT_CONTROL / PC-002

At READY FOR EXTERNAL QA or IMPLEMENTATION BLOCKED, emit the return envelope proactively.
