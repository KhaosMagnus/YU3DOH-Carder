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

feature/workspace-run-026:
ABSENT / CREATION AUTHORIZED TO DEV-008

## RUN 025

CLOSED / INTEGRATED / EXTERNAL QA PASS

## CR-0002 — Library Dark Theme

Scope:
FROZEN

Design:
FROZEN

Post-F04 compatibility:
COMPATIBLE

Compatibility disposition:
control/CR-0002_POST_F04_COMPATIBILITY_DISPOSITION.md

Exact implementation baseline:
feature/workspace-v0.1 @ dd968ba05e579461962bbcced0e9cae3cd4c3d23

Canonical CR-0002 ledger:
requests/CR-0002-v2.md

Implementation:
RUN 026 AUTHORIZED

Development:
DEVELOPMENT / DEV-008

Initial execution session:
DEV-008/S01

Run authorization:
runs/RUN-026_AUTHORIZATION.md

Route:
routing/ROUTE-RUN-026-DEV-008.md

Session pilot:
control/RUN-026_SESSION_PILOT.md

Implementation target:
feature/workspace-run-026

Required start:
dd968ba05e579461962bbcced0e9cae3cd4c3d23

External QA:
NOT STARTED

Integration:
NOT AUTHORIZED

## CR-0002 invariants

Theme states:
LIGHT / DARK

Fallback:
DARK

SYSTEM/AUTO:
OUT

Architecture:
Library client/UI only.
Schema 8, Workspace format 1, migrations 001–008, no migration 009.
No server/API/domain/Carder expansion authorized.

## Protocol experiment

RUN 026 continues the experimental instance/session model without amending Generic Protocol v1.0.

Stable Development instance:
DEV-008

Initial session:
DEV-008/S01

Actual session rollover remains untested unless RUN 026 naturally requires one.
