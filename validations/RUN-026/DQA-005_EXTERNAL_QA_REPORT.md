---
artifact_id: RUN-026-DQA-005-EXTERNAL-QA-REPORT
artifact_type: independent_external_qa_report
status: FINAL
protocol_version: "1.0"
source_role: DESIGN_QA
source_instance: DQA-005
target_role: PROJECT_CONTROL
target_instance: PC-002
input_control_sha: de8e2984b25a4ade0774622eaaf2a75563b58b7c
code_baseline: dd968ba05e579461962bbcced0e9cae3cd4c3d23
code_candidate: e11579950ef7ed20e4b6eeee88f9c3597c1f074b
qa_result: INCONCLUSIVE
primary_blocker_class: EVIDENCE / PROVENANCE
report_date: "2026-10-28"
---

# RUN 026 — DQA-005 Independent External QA Report

## 1. Official disposition

**OFFICIAL QA RESULT: INCONCLUSIVE.**

This is an independent, read-only PRODUCT review of **`e11579950ef7ed20e4b6eeee88f9c3597c1f074b`**, not an inherited Development PASS. **No product defect or regression was established by the evidence actually accessible to DQA-005.** The candidate has not earned External QA PASS because the primary raw evidence bundle is not retrievable/inspectable through this QA execution substrate and no independent browser/runtime execution was available. The accessible reports, source code, summary and manifests alone cannot substantiate the required browser, contrast, operational state, exact-runner gate and archive-integrity observations.

**Integration NOT AUTHORIZED. Main movement NOT AUTHORIZED. Candidate/base/main product refs NOT MODIFIED.**

The primary blocker is **EVIDENCE / PROVENANCE (retrieval and independent inspection)**, not an established PRODUCT / IMPLEMENTATION defect. A new Development implementation commit is **not requested** solely to remedy evidence access.

## 2. Authority, scope and exact custody

Read at frozen control `de8e2984b25a4ade0774622eaaf2a75563b58b7c`:
- `validations/RUN-026/DQA-005_EXTERNAL_QA_REQUEST.md`;
- `routing/ROUTE-RUN-026-DQA-005.md`;
- `scopes/CR-0002_LIBRARY_DARK_THEME-v2.md`;
- `handoffs/CR-0002_LIBRARY_DARK_THEME_IMPLEMENTATION_HANDOFF.md`;
- `validations/CR-0002/DQA-002_POST_F04_COMPATIBILITY_REPORT.md`;
- `control/CR-0002_POST_F04_COMPATIBILITY_DISPOSITION.md`;
- `implementations/RUN-026_IMPLEMENTATION_REPORT.md`;
- `runs/RUN-026_DEV-008_DELIVERY_DISPOSITION.md`;
- `control/RUN-026_INTERRUPTION_RECOVERY_OBSERVATION.md`;
- `protocols/GENERIC_PROJECT_CONTROL_PROTOCOL-v1.0.md`.

Independent GitHub branch/ref and compare reads confirmed:
- exact baseline `feature/workspace-v0.1 @ dd968ba05e579461962bbcced0e9cae3cd4c3d23`;
- exact candidate `feature/workspace-run-026 @ e11579950ef7ed20e4b6eeee88f9c3597c1f074b`;
- **ahead 1, behind 0**, merge base identical to baseline, one implementation commit;
- unchanged `main` per source control record; no integration requested or performed by DQA;
- exactly six changed paths: `package.json`, `scripts/test-library-theme.ts`, `src/library/app.tsx`, `src/library/index.tsx`, `src/library/library.scss`, `src/library/theme.ts`.
- no changed paths in `workspace-server/**`, migrations, Library API/model, Carder production, domain/persistence or retained F04/Tranche-1 logic.

This establishes candidate **custody and diff footprint**, not execution success.

## 3. Independent static inspection — favorable, not runtime PASS

Inspected the exact candidate files and GitHub commit patch:
- `src/library/theme.ts`: only LIGHT/DARK; resolver exact-match LIGHT and defaults all other values to DARK; guarded storage access; exact key `yu3doh.library.theme.v1`; no startup write; explicit selection applies DOM attribute before attempting a write; rejected writes retain in-page selected theme and return the exact temporary-status text.
- `src/library/index.tsx`: calls `readLibraryTheme()` then `applyLibraryTheme(initialTheme)` before `ReactDOM.render`; the application theme state receives that initial value. Static architecture supports the no-opposite-theme-first-content requirement, but the mandatory DOM first-mount observation was not independently inspected.
- `src/library/app.tsx`: header `Library theme` radio control offers visible Light/Dark; preference warning has polite status semantics; theme state/handler are separate from browse, filters, pagination, LIST/GRID, Batch, Detail, dirty editor and Workspace management state. No Workspace mutation function is called by the theme handler. Actual no-remount/state/network invariance remains a browser/Service evidence obligation.
- `src/library/library.scss`: theme-scoped semantic palettes exist; Ant Design 4.9.4 selectors target body-portaled Select, Drawer, Modal/confirm, inputs, radios, status alerts, tables, disabled states, focus and Tranche-1/F04 visual hooks. Existence of selectors does **not** prove effective rendered contrast, correct stacking/keyboard interaction or full visual surface coverage.
- `package.json`: `test:library` appends `scripts/test-library-theme.ts` after the previous client, bridge and F04-focused tests; Ant Design version remains 4.9.4; there is no dependency modernization.
- `scripts/test-library-theme.ts`: includes explicit DT-U01–U12 assertions for resolver, invalid data, missing data, read/write failure, key and OS exclusion. The **source assertions** were examined; their recorded execution exit is a Development evidence claim, not a DQA rerun.

At the pinned candidate the `workspace-server/migrations` directory has only SQL files **001–008**; **009 is absent**. There is no product diff expanding schema, Workspace format, server/API or Carder. The frozen schema-8 / format-1 baseline is not contradicted by the diff; an independent live schema-8/format-1 validation was not run.

No clear contract violation was found in this static inspection.

## 4. Evidence provenance and independent accessibility

GitHub serves the following plain-text control artifacts and their contents were independently parsed:
- `validations/RUN-026/DEV-008/summary.json`;
- `validations/RUN-026/DEV-008/manifest.json`;
- `validations/RUN-026/DEV-008/visual-inventory.json`.

Their internal structural checks succeeded:
- summary SHA and manifest candidate both equal `e11579950ef7ed20e4b6eeee88f9c3597c1f074b`;
- **186** unique manifest file paths, each with a positive integer byte count and syntactically valid 64-digit SHA-256;
- **92** unique visual inventory screenshot paths; every path occurs in the manifest;
- summary declares eight zero-exit commands (two installs plus six authoritative commands), 24 DT-B cases per browser, 26 F04-B cases per theme (Chromium), numeric contrast minima and no unexecuted required cases.

The primary archive is represented in GitHub at:
`validations/RUN-026/DEV-008/RUN-026_EVIDENCE.zip`
- GitHub blob SHA observed: `ae3f9f080d329ae5ca7e1483fe5797ef5bdefe0d`;
- GitHub file size observed: **22,524,792 bytes**;
- Development-report SHA-256 claim: `7bf9ef2fcaa8284457234b6fcfff229b98650955f19af644b6b17d9f91ba8d3c` (**not independently recomputed**).

**Blocking access result:** GitHub's UTF-8 fetch rejected the ZIP as binary; contents API with base64 returned an empty file content for this >1 MB object; blob fetch failed with UTF-8 decode error. No usable ZIP byte stream, extracted member, screenshot or raw gate/browser log was delivered to this QA execution substrate. External local container also had no reachable GitHub network, and no candidate checkout/browser test substrate was available for an independent execution. This is **inaccessibility to DQA**, not evidence that the archive is corrupt, absent or that Development did not execute tests.

Consequently the archive SHA-256, 186 member byte sizes and hashes, provenance of each browser measurement, machine-readable case-level assertions, screenshots, gate logs and full pre/post domain/Workspace snapshots **cannot currently be validated independently**.

## 5. Acceptance adjudication by obligation

| Frozen obligations | DQA-005 state | Reason |
| --- | --- | --- |
| 1–2 candidate identity, six-file diff, bounded code scope | VERIFIED | Independent GitHub refs/compare/patch |
| 3–7 theme resolver, fallback, exact key, persistence, OS exclusion, failures | STATIC-CONSISTENT; runtime UNVERIFIED | Inspected module and unit assertions; browser storage execution not inspected |
| 8 first-content hydration/no wrong-theme flash | UNVERIFIED | Correct static ordering; first-mount observer evidence is ZIP-only |
| 9 theme-switch preservation of GRID/LIST, filters, page/size, result identities/revisions, Batch/hidden revisions, Detail, dirty editor, validation, readiness | UNVERIFIED | No raw DT browser network/state snapshots accessible |
| 10 zero Workspace/domain mutation | STATIC-CONSISTENT; E2E UNVERIFIED | No theme-induced API call evident in source; raw network/DB snapshots ZIP-only |
| 11 Carder isolation | STATIC-CONSISTENT; runtime UNVERIFIED | No Carder diff or Library import; V11/DT-B21 ZIP-only |
| 12–14 portals, Link Marker, Preferred warning | STATIC SELECTORS PRESENT; rendered UNVERIFIED | Need raw rendered/ARIA/visual evidence |
| 15 rendered WCAG text, focus, control boundaries | UNVERIFIED | Summary numeric minima cannot substitute raw computed pairs/DOM |
| 16–18 Chromium, Firefox, 1440/900/390 parity | UNVERIFIED | Versions/case counts declared; raw runs/screenshots inaccessible |
| 19 DT-U01–U12 | ASSERTIONS VERIFIED; runtime UNVERIFIED | New test source included; exit log ZIP-only |
| 20 DT-B01–B24 | UNVERIFIED | 24 cases per engine only stated in summary |
| 21 F04-U01–U18 and 23 Tranche-1 focused | TEST WIRING PRESERVED; runtime UNVERIFIED | Source of aggregate test command verified; gate log unavailable |
| 22 F04-B01–B26 in both themes | UNVERIFIED | Summary and report claim 26 per theme; raw case results unavailable |
| 24 authoritative six-command gate | REPORTED ONLY | Six zero exits in summary; actual logs and runner checkout not independently reviewed |
| 25–31 schema 8, Workspace format 1, migrations 001–008/no 009, no API/domain/Carder/major dependency expansion | DIFF-CONFORMANT | Exact path diff, 001–008 directory and package review; no live schema/status run |
| 32 evidence archive integrity and candidate attribution | PARTIAL; BLOCKING | Summary/manifest attribution and structural checks pass; ZIP contents/SHA-256 not verifiable |

The Development figures (Workspace Service **1088 PASS / zero FAIL**; Chromium/Firefox 24 each; **274** explicit contrast pairs; **81,556** rendered text samples; numeric minima **5.404:1 LIGHT**, **6.111:1 DARK** normal and **4.206:1 LIGHT**, **4.251:1 DARK** boundary/focus) are accurately represented as **Development reports**. They have not been independently validated and are not DQA acceptance findings.

## 6. Preferred Variant hypothetical boundary

The frozen contract tests Preferred warning presentation without authorizing a change to readiness semantics. Under the unchanged rule, **OVERFRAME READY implies STANDARD READY**, so a natural real-Service state STANDARD INCOMPLETE / OVERFRAME READY is not reachable.

The reported evidence approach (pure-function `(false,true)` test plus separately labeled `OVERFRAME-only-synthetic` rendered presentation fixture) is **methodologically admissible for DQA examination** under Generic Protocol v1.0 §9, and must not be rejected simply because it is synthetic. It is **not** natural E2E. Independent sufficiency approval nevertheless requires reading the fixture insertion boundary, preserved production rendering path, actual screenshot/DOM measurements and limitations from the raw package. Those materials are currently inaccessible. **Disposition: PENDING EVIDENCE, not FAIL.**

## 7. Exact evidence delta to resolve INCONCLUSIVE

Retain the **same immutable candidate**. Route to **PROJECT_CONTROL / PC-002**, and to **DEPLOYMENT_VALIDATION or an authorized evidence transport/QA substrate** for one of the following equivalent, non-product-mutating remedies:

1. Make the **existing 22,524,792-byte ZIP** available to DQA as a verifiable raw attachment or accessible immutable evidence object; independently compute SHA-256 and compare to `7bf9ef2fcaa8284457234b6fcfff229b98650955f19af644b6b17d9f91ba8d3c`; open the ZIP and validate all 186 entries against `manifest.json` and the 92 screenshots against `visual-inventory.json`.
2. Inspect the existing `gates/03.log`–`08.log` and execution metadata, including actual runner candidate SHA and clean state; inspect detailed `theme-chromium/`, `theme-firefox/`, `f04-light/`, `f04-dark/`, `additional-surfaces/`, `firefox-os.json`, `architecture.json`, and relevant DOM/ARIA, network, storage, contrast, pre/post database and UI screenshots.
3. Adjudicate DT-B01–B24 in both engines, F04-B01–B26 in both themes, state invariance, portal/focus/color contrasts, Carder isolation, and the explicitly synthetic warning presentation without mistaking summary counts for results. If the retained evidence is defective or insufficient, obtain an authorized independent rerun **at exactly `e11579950ef7ed20e4b6eeee88f9c3597c1f074b`** and retain raw case-level artifacts. No product mutation or workflow launch is authorized by this report.

This is an **evidence access/inspection delta**, not a demonstrated failed product case. An independent follow-up QA disposition must be issued after the delta is closed. Do not relabel this report PASS or overwrite it.

## 8. Interruption classification and formal return

DEV-008/S01's confirmed usage-limit interruption and same-session continuation were reviewed as governance provenance only. No candidate SHA change or duplicate product commit was observed. It is neither automatic evidence invalidation nor formal recovery proof. Pilot status remains **REVISE**; Generic Protocol v1.0 unchanged.

**YU3DOH TRANSFER ENVELOPE**

SOURCE ROLE / INSTANCE: **DESIGN_QA / DQA-005**  
TARGET ROLE / INSTANCE: **PROJECT_CONTROL / PC-002**  
CONTROL INPUT: `de8e2984b25a4ade0774622eaaf2a75563b58b7c`  
RUN: **026 — CR-0002**  
CODE BASELINE: `dd968ba05e579461962bbcced0e9cae3cd4c3d23`  
EXACT CANDIDATE: `feature/workspace-run-026 @ e11579950ef7ed20e4b6eeee88f9c3597c1f074b`  
OFFICIAL QA RESULT: **INCONCLUSIVE**  
PRIMARY BLOCKER: **EVIDENCE / PROVENANCE — primary ZIP not independently retrievable/inspectable on the QA substrate**  
STATIC CODE FINDING: **NO DEMONSTRATED PRODUCT DEFECT / NO DEMONSTRATED REGRESSION**  
PRIMARY REPORT: `validations/RUN-026/DQA-005_EXTERNAL_QA_REPORT.md`  
ACTION: **Obtain verifiable raw archive access or equivalent authorized exact-candidate independent evidence, then re-adjudicate through a successor QA report.**  
EXPECTED OUTPUT: **Evidence-sufficiency resolution and official independent QA verdict on unchanged candidate**  
BLOCKER ROUTE: **PROJECT_CONTROL / PC-002 → evidence producer / DEPLOYMENT_VALIDATION as authorized**  
INTEGRATION: **NOT AUTHORIZED**  
MAIN MOVEMENT: **NOT AUTHORIZED**  
PRODUCT MUTATION: **NONE**  
STATUS: **TERMINAL DQA-005 / INCONCLUSIVE; RETURN TO PC-002**
