# PROJECT STATE

artifact_id: PROJECT-STATE
artifact_type: project_state
status: ACTIVE
protocol_version: 1.0

## Product refs

main:
54cc3aad246c89a29f2a18be63c539db68cae041

feature/workspace-v0.1:
dd968ba05e579461962bbcced0e9cae3cd4c3d23

feature/workspace-run-025:
dd968ba05e579461962bbcced0e9cae3cd4c3d23

## RUN 025 — CR-0001.4 / F-04

Final state:
CLOSED / INTEGRATED / EXTERNAL QA PASS

Closure disposition:
runs/RUN-025_CLOSURE_DISPOSITION.md

Integration report:
integrations/RUN-025_INTEGRATION_REPORT.md

Exact integrated baseline:
feature/workspace-v0.1 @ dd968ba05e579461962bbcced0e9cae3cd4c3d23

main:
UNCHANGED

Canonical CR-0001 ledger:
requests/CR-0001-v22.md

## CR-0002 — Library Dark Theme

Scope:
FROZEN

Design contract:
FROZEN

Implementation:
NOT AUTHORIZED

RUN:
NOT ASSIGNED

Mandatory post-F04 compatibility gate:
ACTIVE

Design/QA instance:
DQA-002 — RESUMED / POST-F04 COMPATIBILITY REVIEW

Authorization:
control/CR-0002_POST_F04_COMPATIBILITY_AUTHORIZATION.md

Request:
validations/CR-0002/DQA-002_POST_F04_COMPATIBILITY_REQUEST.md

Route:
routing/ROUTE-CR-0002-POST-F04-DQA-002.md

Original CR-0002 design baseline:
64cb5f4ca42348c6c403e64e0d61bdff8c32a281

Exact post-F04 integrated baseline under review:
dd968ba05e579461962bbcced0e9cae3cd4c3d23

Allowed compatibility outcomes:
- COMPATIBLE
- COMPATIBLE WITH BOUNDED HANDOFF REVISION
- RETURN TO SCOPE

No CR-0002 Development authority exists until DQA-002 returns, Project Control accepts the compatibility result, assigns the exact implementation baseline, and separately authorizes a RUN/Development mission.

## Protocol experiment note

RUN 025 Development used only DEV-007/S01.
Actual session rollover/recovery remains untested.

Explicit terminal auto-return instructions improved handoff behavior in DQA-004, ENV-005 and DEPLOY-005.

No Generic Protocol amendment is authorized yet.
