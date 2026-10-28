# RUN 025 — DEPLOY-005 Evidence Disposition

status: FROZEN
protocol_version: 1.0

source:
DEPLOYMENT_VALIDATION / DEPLOY-005

target:
PROJECT_CONTROL / PC-002

source_report:
validations/RUN-025/DEPLOY-005_VALIDATION_EVIDENCE.md

source_control_revision:
9d95851f7bb6c40d058774bd38ad531a46440059

result:
EVIDENCE READY

exact_candidate:
feature/workspace-run-025 @ dd968ba05e579461962bbcced0e9cae3cd4c3d23

exact_baseline:
feature/workspace-v0.1 @ e07140d5a9555a17b7b2306a45625c14adfafc8e

successful_actions_run:
40564959018

successful_actions_job:
122403657714

artifact:
12763235984

artifact_sha256:
a0ead6b9440652ffd71966739548a5c98d437ee9577b4a5125ccf0762af8b829

Project Control accepts DEPLOY-005 as EVIDENCE READY.

Independently verified from GitHub:
- meta/project-control matched the DEPLOY return revision;
- feature/workspace-run-025 remains dd968ba05e579461962bbcced0e9cae3cd4c3d23;
- feature/workspace-v0.1 remains e07140d5a9555a17b7b2306a45625c14adfafc8e;
- main remains 54cc3aad246c89a29f2a18be63c539db68cae041;
- Actions run 40564959018 / job 122403657714 completed successfully;
- artifact 12763235984 exists and reports digest sha256:a0ead6b9440652ffd71966739548a5c98d437ee9577b4a5125ccf0762af8b829;
- preserved control bundle contains DEPLOY-005_EVIDENCE.zip, manifest.sha256, ZIP.sha256 and core machine-readable records;
- manifest.sha256 contains 211 entries;
- evidence.json contains exactly F04-B01 through F04-B26 tied to the exact candidate SHA;
- gate-results.json records both frozen installs and all six authoritative validation commands with exitCode 0;
- workspace-before.json and workspace-after.json are the same Git blob;
- fixture cleanup records both disposable roots removed.

Qualifications preserved for DQA adjudication:
- six GET /library/facets requestfailed records with net::ERR_ABORTED;
- baseline-reproduced favicon/React scrollLocker warnings;
- two intentional HTTP 503 test responses;
- DOM-synthetic event dispatch for state-preservation transitions while the existing modal Drawer covers background controls;
- first incomplete/cancelled DEPLOY attempt retained without acceptance credit.

Meaning:
DEPLOY-005 has completed evidence production. It has not issued QA PASS/FAIL.

Official acceptance authority remains:
DESIGN_QA / DQA-004

DQA-004 must adjudicate the exact candidate using:
- its prior PARTIAL report;
- the frozen F-04 contract;
- ENV-005 readiness evidence;
- DEPLOY-005 validation evidence and explicit qualifications.

No integration, candidate mutation, or CR-0002 implementation is authorized by this disposition.
