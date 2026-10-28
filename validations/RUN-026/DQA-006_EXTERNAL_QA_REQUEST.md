# RUN 026 — DQA-006 Successor External QA Request

status: FROZEN
protocol_version: 1.0

source:
PROJECT_CONTROL / PC-002

target:
DESIGN_QA / DQA-006

mode:
SUCCESSOR INDEPENDENT EXTERNAL QA

run:
RUN 026

request:
CR-0002 — Library Dark Theme

predecessor_qa:
DESIGN_QA / DQA-005 — INCONCLUSIVE

predecessor_report:
validations/RUN-026/DQA-005_EXTERNAL_QA_REPORT.md

predecessor_disposition:
runs/RUN-026_DQA-005_INCONCLUSIVE_DISPOSITION.md

evidence_access_report:
validations/RUN-026/DEPLOY-006_EVIDENCE_ACCESS_REPORT.md

evidence_access_disposition:
runs/RUN-026_DEPLOY-006_EVIDENCE_ACCESS_DISPOSITION.md

exact_candidate:
feature/workspace-run-026 @ e11579950ef7ed20e4b6eeee88f9c3597c1f074b

exact_baseline:
feature/workspace-v0.1 @ dd968ba05e579461962bbcced0e9cae3cd4c3d23

main:
54cc3aad246c89a29f2a18be63c539db68cae041

frozen_scope:
scopes/CR-0002_LIBRARY_DARK_THEME-v2.md

frozen_design_contract:
handoffs/CR-0002_LIBRARY_DARK_THEME_IMPLEMENTATION_HANDOFF.md

post_f04_compatibility:
validations/CR-0002/DQA-002_POST_F04_COMPATIBILITY_REPORT.md

development_report:
implementations/RUN-026_IMPLEMENTATION_REPORT.md

Mission:
Issue a fresh independent External QA verdict for the same immutable candidate, now using the raw artifact transport path proven by DEPLOY-006.

Do not overwrite or reinterpret DQA-005. DQA-005 remains historical INCONCLUSIVE.

RAW ARTIFACT:

GitHub Actions run:
40742109392

Job:
123006143442

Artifact ID:
12838688889

Artifact name:
RUN-026-DEPLOY-006-raw-evidence-40742109392

Artifact size:
80983126 bytes

Artifact digest:
sha256:de8e9a82744e04fad9153b1ba4ea65f4a6ed71cf3f0e318e41e75ab4f9030c08

Original DEV archive inside artifact:

RUN-026_EVIDENCE.zip

Size:
22524792 bytes

SHA-256:
7bf9ef2fcaa8284457234b6fcfff229b98650955f19af644b6b17d9f91ba8d3c

MANDATORY RETRIEVAL PROCEDURE:

1. Use GitHub download_workflow_artifact for:
   repo KhaosMagnus/YU3DOH-Carder
   artifact_id 12838688889

2. Materialize the returned binary file reference locally.

3. Independently verify:
   - outer size;
   - outer SHA-256;
   - ZIP integrity;
   - original inner archive size/SHA-256;
   - inner ZIP integrity;
   - manifest candidate;
   - 186 manifest members;
   - 92 visual entries;
   - zero manifest/visual failures.

4. Extract and inspect raw evidence directly.

Do NOT use repository fetch_file as the binary retrieval path.

MANDATORY RAW INSPECTION:

Inspect at minimum:
- raw/gates/03.log through 08.log;
- raw/gates/gate-results.json;
- raw/preflight.json;
- raw/environment.json;
- raw/architecture.json;
- raw/final-product-refs.txt;
- raw/theme-chromium/**;
- raw/theme-firefox/**;
- raw/f04-light/**;
- raw/f04-dark/**;
- raw/additional-surfaces/**;
- raw/firefox-os.json;
- DOM/ARIA snapshots;
- network/storage records;
- contrast records;
- Workspace/Canonical before/after snapshots;
- screenshot evidence;
- OVERFRAME-only-synthetic evidence and associated proof boundaries.

Independently adjudicate the same frozen obligations previously assigned to DQA-005, including:
- candidate custody/scope;
- LIGHT/DARK state and persistence semantics;
- fallback DARK;
- SYSTEM/AUTO/OS exclusion;
- hydration;
- state preservation;
- zero Workspace mutation;
- Carder isolation;
- portals;
- Link Marker;
- Preferred warning;
- rendered contrast;
- Chromium/Firefox parity;
- DT-U01..U12;
- DT-B01..B24;
- F04-U01..U18;
- F04-B01..B26;
- Tranche-1 regression;
- six authoritative gate commands;
- schema/format/migration invariants;
- evidence sufficiency and exact-candidate attribution.

Synthetic Preferred warning:
OVERFRAME-only remains explicitly synthetic presentation evidence plus pure-function coverage.
Do not represent it as natural Service E2E.
Adjudicate whether it is sufficient under the frozen contract.

Official result must be exactly one of:
PASS
FAIL
REGRESSION
INCONCLUSIVE

If INCONCLUSIVE:
identify an exact evidence delta that remains AFTER successful raw artifact retrieval/inspection.

Expected report:
validations/RUN-026/DQA-006_EXTERNAL_QA_REPORT.md

Candidate mutation:
FORBIDDEN

Integration:
NOT AUTHORIZED

Main movement:
NOT AUTHORIZED

AUTO-RETURN:
At terminal verdict proactively return to PROJECT_CONTROL / PC-002.
