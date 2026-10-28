# RUN 026 — Evidence Transport / Provenance Recovery Authorization

status: FROZEN
protocol_version: 1.0

source:
PROJECT_CONTROL / PC-002

target:
DEPLOYMENT_VALIDATION / DEPLOY-006

trigger:
DQA-005 official INCONCLUSIVE due only to raw evidence accessibility/provenance inspection limits.

dqa_disposition:
runs/RUN-026_DQA-005_INCONCLUSIVE_DISPOSITION.md

exact_candidate:
feature/workspace-run-026 @ e11579950ef7ed20e4b6eeee88f9c3597c1f074b

exact_baseline:
feature/workspace-v0.1 @ dd968ba05e579461962bbcced0e9cae3cd4c3d23

development_evidence_source_control:
6e9f503ed0e05016de50da5630cdeaeb6948725e

existing_evidence_archive:
validations/RUN-026/DEV-008/RUN-026_EVIDENCE.zip

expected_archive_bytes:
22524792

expected_archive_sha256:
7bf9ef2fcaa8284457234b6fcfff229b98650955f19af644b6b17d9f91ba8d3c

expected_manifest_entries:
186

expected_visual_inventory_entries:
92

Authorization:
DEPLOY-006 may perform evidence transport, integrity verification, extraction, indexing, and publication needed to make the existing exact-candidate evidence independently inspectable.

Preferred mechanism:
GitHub-hosted Actions with an operational harness branch separate from product refs.

Recommended operational branch:
ops/run-026-deploy-006-actions

Required primary path:
1. checkout/read the exact control commit containing the existing Development archive;
2. independently recompute the archive SHA-256;
3. test archive integrity;
4. extract the archive in a disposable runner;
5. validate every retained member against manifest.json;
6. validate visual-inventory paths against extracted screenshots;
7. produce an independent transport/provenance report and machine-readable verification index;
8. upload the original archive and/or extracted evidence tree as a GitHub Actions artifact that can be downloaded through the GitHub artifact API;
9. preserve exact run/job/artifact IDs and artifact digest;
10. verify product refs remained unchanged.

The Actions artifact must expose raw bytes, not only summary counts.

DQA successor must be able to download/materialize the artifact and inspect:
- gates/03.log through gates/08.log;
- detailed theme-chromium and theme-firefox case evidence;
- f04-light and f04-dark case evidence;
- additional-surfaces evidence;
- firefox-os.json;
- architecture.json;
- environment/preflight/custody metadata;
- DOM/ARIA evidence;
- network/storage evidence;
- contrast evidence;
- pre/post Workspace/Canonical snapshots;
- screenshots including the explicitly synthetic OVERFRAME-only presentation fixture.

Fallback exact-candidate rerun:
AUTHORIZED ONLY IF the existing archive fails integrity verification, is materially incomplete, or cannot be transported despite a documented attempt.

Any rerun must:
- use exactly e11579950ef7ed20e4b6eeee88f9c3597c1f074b;
- make no product changes;
- preserve the frozen CR-0002 acceptance contract;
- produce raw case-level evidence and a downloadable Actions artifact.

No Development correction is authorized.

No product branch movement is authorized.

No integration or main movement is authorized.

Final DEPLOY-006 status:
EVIDENCE ACCESS READY
or
EVIDENCE RECOVERY BLOCKED

EVIDENCE ACCESS READY is not QA PASS.

Return:
DEPLOYMENT_VALIDATION / DEPLOY-006 → PROJECT_CONTROL / PC-002
