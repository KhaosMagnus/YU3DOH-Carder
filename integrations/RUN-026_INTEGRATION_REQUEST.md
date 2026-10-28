# RUN 026 — Integration Request

status: FROZEN
protocol_version: 1.0

source:
PROJECT_CONTROL / PC-002

target:
INTEGRATION_ADMIN / IA-004

authorization:
control/RUN-026_INTEGRATION_AUTHORIZATION.md

run:
RUN 026

request:
CR-0002 — Library Dark Theme

official_external_qa:
PASS

source_ref:
feature/workspace-run-026

source_sha:
e11579950ef7ed20e4b6eeee88f9c3597c1f074b

target_ref:
feature/workspace-v0.1

required_target_before:
dd968ba05e579461962bbcced0e9cae3cd4c3d23

required_operation:
FAST-FORWARD ONLY

main:
54cc3aad246c89a29f2a18be63c539db68cae041

Mission:
Perform exact-ref preflight and, only if all preconditions hold, fast-forward feature/workspace-v0.1 from dd968ba05e579461962bbcced0e9cae3cd4c3d23 to e11579950ef7ed20e4b6eeee88f9c3597c1f074b.

Do not modify main.

Do not create merge commits, rebases, squashes, cherry-picks or force updates.

If any exact ref differs, STOP and return INTEGRATION BLOCKED.

Required report:
integrations/RUN-026_INTEGRATION_REPORT.md

Required postflight:
source unchanged;
target equals source;
main unchanged.

Return:
INTEGRATION_ADMIN / IA-004 -> PROJECT_CONTROL / PC-002
