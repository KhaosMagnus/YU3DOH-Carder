# RUN 026 — Integration Authorization

status: FROZEN
protocol_version: 1.0

source:
OWNER / PROJECT_CONTROL / PC-002

authorized_role:
INTEGRATION_ADMIN / IA-004

run:
RUN 026

request:
CR-0002 — Library Dark Theme

owner_authorization:
EXPLICIT

owner_instruction:
Integrate the validated RUN 026 candidate into feature/workspace-v0.1.

official_qa:
DQA-006 COMPLETE / PASS

qa_report:
validations/RUN-026/DQA-006_EXTERNAL_QA_REPORT.md

qa_disposition:
runs/RUN-026_DQA-006_PASS_DISPOSITION.md

source_ref:
feature/workspace-run-026

source_sha:
e11579950ef7ed20e4b6eeee88f9c3597c1f074b

target_ref:
feature/workspace-v0.1

required_target_before:
dd968ba05e579461962bbcced0e9cae3cd4c3d23

main_ref:
main

required_main:
54cc3aad246c89a29f2a18be63c539db68cae041

Authorized operation:
FAST-FORWARD ONLY

Permitted target movement:

feature/workspace-v0.1
dd968ba05e579461962bbcced0e9cae3cd4c3d23
->
e11579950ef7ed20e4b6eeee88f9c3597c1f074b

Required preflight immediately before mutation:
- source still equals e11579950ef7ed20e4b6eeee88f9c3597c1f074b;
- target still equals dd968ba05e579461962bbcced0e9cae3cd4c3d23;
- main still equals 54cc3aad246c89a29f2a18be63c539db68cae041;
- source is a descendant of target and can be fast-forwarded without merge commit;
- official DQA-006 PASS remains the current acceptance disposition;
- no newer conflicting integration authority exists.

Forbidden:
- force push;
- reset;
- rebase;
- cherry-pick;
- squash;
- merge commit;
- source rewrite;
- main movement;
- any product mutation beyond the authorized target ref movement.

If any exact-ref precondition differs:
STOP / BLOCKED
and return to PROJECT_CONTROL / PC-002.

Required postflight:
- feature/workspace-v0.1 == e11579950ef7ed20e4b6eeee88f9c3597c1f074b;
- feature/workspace-run-026 remains e11579950ef7ed20e4b6eeee88f9c3597c1f074b;
- main remains 54cc3aad246c89a29f2a18be63c539db68cae041;
- source/target identity and ancestry recorded;
- integration report published.

Expected report:
integrations/RUN-026_INTEGRATION_REPORT.md

Terminal status:
INTEGRATED
or
INTEGRATION BLOCKED

Return:
INTEGRATION_ADMIN / IA-004 -> PROJECT_CONTROL / PC-002

AUTO-RETURN:
At terminal status, proactively emit complete return envelope.
