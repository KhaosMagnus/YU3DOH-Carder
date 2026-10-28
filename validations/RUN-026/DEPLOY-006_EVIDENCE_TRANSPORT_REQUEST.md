# RUN 026 — DEPLOY-006 Evidence Transport Request

status: FROZEN
protocol_version: 1.0

source:
PROJECT_CONTROL / PC-002

target:
DEPLOYMENT_VALIDATION / DEPLOY-006

mode:
EVIDENCE TRANSPORT / PROVENANCE RECOVERY

authorization:
control/RUN-026_EVIDENCE_TRANSPORT_AUTHORIZATION.md

dqa_report:
validations/RUN-026/DQA-005_EXTERNAL_QA_REPORT.md

dqa_disposition:
runs/RUN-026_DQA-005_INCONCLUSIVE_DISPOSITION.md

exact_candidate:
feature/workspace-run-026 @ e11579950ef7ed20e4b6eeee88f9c3597c1f074b

exact_baseline:
feature/workspace-v0.1 @ dd968ba05e579461962bbcced0e9cae3cd4c3d23

source_control_commit:
6e9f503ed0e05016de50da5630cdeaeb6948725e

existing_archive:
validations/RUN-026/DEV-008/RUN-026_EVIDENCE.zip

expected_archive_sha256:
7bf9ef2fcaa8284457234b6fcfff229b98650955f19af644b6b17d9f91ba8d3c

Mission:
Close only the DQA-005 evidence-access delta.

Do not modify or reinterpret product code.

Preferred procedure:
- use GitHub-hosted Actions;
- independently hash/test/extract the existing archive;
- verify all 186 manifest entries and all 92 visual-inventory entries;
- publish raw extracted evidence through a downloadable Actions artifact;
- publish machine-readable integrity/provenance results;
- preserve exact run/job/artifact IDs and digest;
- prove source/baseline/main refs unchanged.

The artifact must be suitable for a successor DQA to download through the GitHub artifact API and locally inspect/extract.

Do not substitute a prose report for raw evidence access.

Rerun is fallback only if existing evidence cannot be verified/transported.

If fallback rerun is required:
use exact candidate e11579950ef7ed20e4b6eeee88f9c3597c1f074b and no product mutation.

Required output:
validations/RUN-026/DEPLOY-006_EVIDENCE_ACCESS_REPORT.md

Required final status:
EVIDENCE ACCESS READY
or
EVIDENCE RECOVERY BLOCKED

If EVIDENCE ACCESS READY:
include the exact Actions run, job, artifact ID/name/digest and explicit instructions sufficient for successor DQA to retrieve/materialize the raw artifact.

No QA verdict authority.
No integration authority.
