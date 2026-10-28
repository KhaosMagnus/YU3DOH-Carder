# RUN 026 — DEPLOY-006 Evidence Access Disposition

status: FROZEN
protocol_version: 1.0

source:
DEPLOYMENT_VALIDATION / DEPLOY-006

target:
PROJECT_CONTROL / PC-002

final_status:
EVIDENCE ACCESS READY

report:
validations/RUN-026/DEPLOY-006_EVIDENCE_ACCESS_REPORT.md

report_control_revision:
637eaaae808cc9df3c8b8e41266c275f544cee1d

exact_candidate:
feature/workspace-run-026 @ e11579950ef7ed20e4b6eeee88f9c3597c1f074b

exact_baseline:
feature/workspace-v0.1 @ dd968ba05e579461962bbcced0e9cae3cd4c3d23

main:
54cc3aad246c89a29f2a18be63c539db68cae041

Actions:
run 40742109392
job 123006143442
conclusion SUCCESS

raw_artifact:
id 12838688889
name RUN-026-DEPLOY-006-raw-evidence-40742109392
size 80983126
digest sha256:de8e9a82744e04fad9153b1ba4ea65f4a6ed71cf3f0e318e41e75ab4f9030c08

original_dev_archive:
size 22524792
sha256 7bf9ef2fcaa8284457234b6fcfff229b98650955f19af644b6b17d9f91ba8d3c

Project Control independently downloaded the Actions artifact through the GitHub connector and verified:
- outer artifact size and SHA-256 exact;
- outer ZIP integrity PASS;
- 192 outer files;
- original DEV archive size and SHA-256 exact;
- inner ZIP integrity PASS;
- 187 inner files = 186 manifest members + manifest.json;
- manifest candidate equals exact candidate;
- 186/186 manifest members present with exact bytes and SHA-256;
- 92/92 visual inventory entries present;
- zero manifest failures;
- zero missing visual entries.

This closes the blocker that caused DQA-005 INCONCLUSIVE:
raw evidence is now independently downloadable and inspectable through the supported GitHub Actions artifact route.

No product rerun occurred.
No product mutation occurred.
No QA verdict is granted by this disposition.

DQA-005 remains historically INCONCLUSIVE.

Next:
assign successor independent QA DQA-006 against the same immutable candidate and raw artifact.

Integration:
NOT AUTHORIZED

Main movement:
NOT AUTHORIZED
