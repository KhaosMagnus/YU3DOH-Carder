# CR-0002 — Post-F04 Compatibility Review Authorization

status: FROZEN
protocol_version: 1.0

source:
PROJECT_CONTROL / PC-002

target:
DESIGN_QA / DQA-002

mode:
POST-F04 COMPATIBILITY REVIEW

scope:
scopes/CR-0002_LIBRARY_DARK_THEME-v2.md

frozen_design_contract:
handoffs/CR-0002_LIBRARY_DARK_THEME_IMPLEMENTATION_HANDOFF.md

original_design_baseline:
feature/workspace-v0.1 @ 64cb5f4ca42348c6c403e64e0d61bdff8c32a281

exact_post_f04_integrated_baseline:
feature/workspace-v0.1 @ dd968ba05e579461962bbcced0e9cae3cd4c3d23

trigger:
RUN 025 / CR-0001.4 F-04 is CLOSED / INTEGRATED / EXTERNAL QA PASS.

Authorization:
DQA-002 may execute the mandatory compatibility gate frozen in §17 of the CR-0002 implementation handoff.

Initial Project Control evidence:
- post-F04 baseline is exactly 3 commits ahead of the original CR-0002 design baseline;
- merge base is 64cb5f4ca42348c6c403e64e0d61bdff8c32a281;
- changed Library surfaces include app.tsx, library.scss, new library-result-card.tsx, Link Marker selector/state, Preferred Variant warning hooks, editor/detail/open-in-carder adjustments, and Library tests;
- this pattern is within the class of changes anticipated by the frozen post-F04 compatibility gate, but Project Control does not pre-adjudicate compatibility.

Authorized outcomes:
COMPATIBLE
COMPATIBLE WITH BOUNDED HANDOFF REVISION
RETURN TO SCOPE

If compatible:
DQA-002 must identify the exact CR-0002 implementation baseline as dd968ba05e579461962bbcced0e9cae3cd4c3d23 and freeze every required post-F04 regression/test adjustment.

If a bounded handoff revision is required:
publish a successor artifact; do not modify the frozen original handoff.

If a material product/architecture conflict is found:
RETURN TO SCOPE.

Not authorized:
- CR-0002 implementation;
- new RUN creation;
- implementation branch creation;
- product code mutation;
- feature/workspace-v0.1 movement;
- main movement;
- schema/API/persistence/Carder changes.
