# RUN 026 — DQA-005 External QA Request

status: FROZEN
protocol_version: 1.0

source:
PROJECT_CONTROL / PC-002

target:
DESIGN_QA / DQA-005

mode:
INDEPENDENT EXTERNAL QA

run:
RUN 026

request:
CR-0002 — Library Dark Theme

exact_baseline:
feature/workspace-v0.1 @ dd968ba05e579461962bbcced0e9cae3cd4c3d23

exact_candidate:
feature/workspace-run-026 @ e11579950ef7ed20e4b6eeee88f9c3597c1f074b

main:
54cc3aad246c89a29f2a18be63c539db68cae041

frozen_scope:
scopes/CR-0002_LIBRARY_DARK_THEME-v2.md

frozen_design_contract:
handoffs/CR-0002_LIBRARY_DARK_THEME_IMPLEMENTATION_HANDOFF.md

post_f04_compatibility_report:
validations/CR-0002/DQA-002_POST_F04_COMPATIBILITY_REPORT.md

post_f04_compatibility_disposition:
control/CR-0002_POST_F04_COMPATIBILITY_DISPOSITION.md

development_report:
implementations/RUN-026_IMPLEMENTATION_REPORT.md

development_delivery_disposition:
runs/RUN-026_DEV-008_DELIVERY_DISPOSITION.md

development_evidence:
validations/RUN-026/DEV-008/RUN-026_EVIDENCE.zip

evidence_manifest:
validations/RUN-026/DEV-008/manifest.json

evidence_summary:
validations/RUN-026/DEV-008/summary.json

visual_inventory:
validations/RUN-026/DEV-008/visual-inventory.json

governance_interruption_observation:
control/RUN-026_INTERRUPTION_RECOVERY_OBSERVATION.md

Mission:
Issue the official independent External QA verdict for the exact candidate e11579950ef7ed20e4b6eeee88f9c3597c1f074b against the frozen CR-0002 contract and accepted post-F04 compatibility requirements.

Do not inherit Development's READY status as PASS.

Required adjudication:
1. exact candidate custody and one-commit baseline ancestry;
2. complete six-file candidate diff and scope boundary;
3. LIGHT/DARK resolver and storage semantics;
4. fallback DARK / SYSTEM+AUTO out / OS preference ignored;
5. first-content/hydration behavior;
6. theme switching state preservation;
7. no Workspace/domain mutation from theme actions;
8. Carder isolation;
9. portal surfaces;
10. accessibility and rendered contrast;
11. Chromium and Firefox parity;
12. DT-U01..U12;
13. DT-B01..B24;
14. retained F04-U01..U18 and F04-B01..B26 obligations;
15. retained Tranche-1 focused assertions;
16. six authoritative commands;
17. schema 8 / format 1 / migrations 001–008 / no 009;
18. no server/API/domain/Carder/major dependency expansion;
19. evidence integrity/sufficiency and exact-candidate attribution;
20. warnings/limitations and synthetic-evidence qualification.

Synthetic warning qualification:
Development reports that OVERFRAME-only READY is not naturally reachable under unchanged readiness logic because OVERFRAME READY implies STANDARD READY. The fourth warning state is covered by deterministic pure-function input plus an explicitly labeled isolated rendered presentation fixture.

DQA-005 must decide whether that evidence is sufficient for the frozen criterion without mislabeling it as natural real-Service E2E.

Interruption note:
DEV-008/S01 experienced a real usage-limit interruption before final evidence/report publication and later resumed in the same session. This is governance-pilot evidence, not a product defect.

QA must verify that the final durable evidence is complete and tied to the immutable candidate; it must not grant or deny acceptance solely because an interruption occurred.

Official result must be exactly one of:
PASS
FAIL
REGRESSION
INCONCLUSIVE

If PASS:
state explicitly that QA PASS does not authorize integration.

If FAIL/REGRESSION:
identify exact requirement/case, expected/observed behavior, evidence, and whether Development correction is required.

If INCONCLUSIVE:
identify the exact missing or insufficient evidence delta.

Expected report:
validations/RUN-026/DQA-005_EXTERNAL_QA_REPORT.md

Candidate mutation:
FORBIDDEN

Integration:
NOT AUTHORIZED

Main movement:
NOT AUTHORIZED

Return:
DESIGN_QA / DQA-005 → PROJECT_CONTROL / PC-002

AUTO-RETURN:
At terminal verdict, proactively emit the complete return envelope.
