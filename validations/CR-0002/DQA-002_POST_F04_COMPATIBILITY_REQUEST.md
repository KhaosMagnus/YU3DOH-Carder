# CR-0002 — DQA-002 Post-F04 Compatibility Request

status: FROZEN
protocol_version: 1.0

source:
PROJECT_CONTROL / PC-002

target:
DESIGN_QA / DQA-002

mode:
POST-F04 COMPATIBILITY REVIEW

authorization:
control/CR-0002_POST_F04_COMPATIBILITY_AUTHORIZATION.md

scope:
scopes/CR-0002_LIBRARY_DARK_THEME-v2.md

frozen_design_contract:
handoffs/CR-0002_LIBRARY_DARK_THEME_IMPLEMENTATION_HANDOFF.md

original_design_baseline:
feature/workspace-v0.1 @ 64cb5f4ca42348c6c403e64e0d61bdff8c32a281

exact_integrated_baseline:
feature/workspace-v0.1 @ dd968ba05e579461962bbcced0e9cae3cd4c3d23

run_025_closure:
runs/RUN-025_CLOSURE_DISPOSITION.md

Mission:
Execute the mandatory §17 post-F04 compatibility gate before any CR-0002 implementation authorization.

Read completely:
- scopes/CR-0002_LIBRARY_DARK_THEME-v2.md
- handoffs/CR-0002_LIBRARY_DARK_THEME_IMPLEMENTATION_HANDOFF.md
- control/CR-0002_POST_F04_COMPATIBILITY_AUTHORIZATION.md
- runs/RUN-025_CLOSURE_DISPOSITION.md
- validations/RUN-025/DQA-004_EXTERNAL_QA_FINAL_REPORT.md
- requests/CR-0001-v22.md
- PROJECT_STATE.md
- roles/DESIGN_QA.md
- chats/instances/DQA-002.md

Inspect actual GitHub code at both exact baselines.

Mandatory comparison:
64cb5f4ca42348c6c403e64e0d61bdff8c32a281
→
dd968ba05e579461962bbcced0e9cae3cd4c3d23

At minimum inspect:
- src/library/index.tsx
- src/library/app.tsx
- src/library/library.scss
- src/library/library-result-card.tsx
- src/library/link-marker-selector.tsx
- src/library/link-marker-state.ts
- src/library/preferred-variant-warning.ts
- src/library/detail-panel.tsx
- src/library/editor-form.tsx
- src/library/open-in-carder.tsx
- scripts/test-library-client.ts
- scripts/test-library-tranche-one.ts
- scripts/test-library-grid-list.ts
- package.json
- all relevant F-04 Grid/List state and regression hooks.

Required determinations:

1. Does the frozen LIGHT/DARK state model remain valid?
2. Can implementation remain Library client/UI only?
3. Does browser-local persistent theme storage remain valid and independent of F-04 view state?
4. Can theme switching preserve GRID/LIST mode, search/filter/page, Batch, Detail and dirty editor state?
5. Can both GRID and LIST be themed coherently under the existing semantic contract?
6. Can Link Marker / Preferred Variant warning surfaces be covered without redesign?
7. Do F-04 or Tranche-1 introduce new Ant Design/portal/theming surfaces requiring bounded contract additions?
8. Does the no-server/no-schema/no-Carder/no-migration boundary remain valid?
9. Are existing CR-0002 test/evidence matrices sufficient after adding exact post-F04 regression gates?
10. What exact automated commands/tests become mandatory for CR-0002?
11. What exact implementation file boundary is valid on dd968ba...?
12. Is Scope reopen required?

Mandatory F-04 regression preservation:
The eventual CR-0002 candidate must retain all RUN 025 F-04 deterministic and browser contracts relevant to Grid/List behavior.

At minimum preserve:
- Grid/List default and explicit selection semantics;
- mode state during theme switching;
- filters/search/page/page-size;
- Batch membership and expected revisions;
- selected Detail identity;
- readiness summaries;
- accessibility/focus semantics;
- ordered result equivalence;
- no extra Workspace/domain mutation from theme switching.

Required output:
validations/CR-0002/DQA-002_POST_F04_COMPATIBILITY_REPORT.md

If bounded revision is required, also publish a successor handoff such as:
handoffs/CR-0002_LIBRARY_DARK_THEME_IMPLEMENTATION_HANDOFF-v2.md

Do NOT modify the original frozen handoff.

Final compatibility result must be exactly one of:
COMPATIBLE
COMPATIBLE WITH BOUNDED HANDOFF REVISION
RETURN TO SCOPE

Return must also state:
- exact implementation baseline;
- implementation boundary;
- exact retained/added automated gates;
- exact retained/added browser evidence requirements;
- Scope reopen YES/NO;
- implementation authority remains NONE.

No product code changes are authorized.
