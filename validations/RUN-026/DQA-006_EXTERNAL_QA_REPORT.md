---
artifact_id: RUN-026-DQA-006-EXTERNAL-QA-REPORT
artifact_type: external_qa_report
status: FINAL
protocol_version: "1.0"
source_role: DESIGN_QA
source_instance: DQA-006
target_role: PROJECT_CONTROL
target_instance: PC-002
control_input_sha: 105bad28026a0cc77c05df8d2a47bad989475b77
run: RUN-026
request: CR-0002
baseline: dd968ba05e579461962bbcced0e9cae3cd4c3d23
candidate: e11579950ef7ed20e4b6eeee88f9c3597c1f074b
result: PASS
report_date: "2026-10-28"
---

# RUN 026 — DQA-006 Independent External QA Report

**OFFICIAL RESULT: PASS**

**QA PASS DOES NOT AUTHORIZE INTEGRATION.**

**Scope of this verdict:** immutable candidate `feature/workspace-run-026 @ e11579950ef7ed20e4b6eeee88f9c3597c1f074b` relative to `feature/workspace-v0.1 @ dd968ba05e579461962bbcced0e9cae3cd4c3d23`. This is a new, independent acceptance adjudication of recovered DEV-008 raw evidence, the frozen contract, candidate source and repository comparison. It is *not* a new browser/product rerun. Neither the Development READY status nor the DEPLOY-006 transport disposition was treated as a QA verdict.

## 1. Authority and evidence custody

Consumed:
- `validations/RUN-026/DQA-006_EXTERNAL_QA_REQUEST.md`, `routing/ROUTE-RUN-026-DQA-006.md`, from `meta/project-control @ 105bad28026a0cc77c05df8d2a47bad989475b77`;
- `scopes/CR-0002_LIBRARY_DARK_THEME-v2.md`;
- `handoffs/CR-0002_LIBRARY_DARK_THEME_IMPLEMENTATION_HANDOFF.md`;
- `validations/CR-0002/DQA-002_POST_F04_COMPATIBILITY_REPORT.md` and the frozen disposition;
- DEV-008 implementation/delivery materials and DEPLOY-006 access report/disposition as provenance, **not as inherited acceptance**;
- actual GitHub candidate files at the exact candidate SHA and independent GitHub base...head comparison;
- actual Actions artifact ZIP **12838688889**, downloaded using GitHub `download_workflow_artifact` (never repository `fetch_file` for binary transport), locally materialized, decompressed and inspected.

Independent binary checks:

| Check | Locally verified |
| --- | --- |
| Actions artifact outer ZIP bytes | **80,983,126** |
| Outer SHA-256 | `de8e9a82744e04fad9153b1ba4ea65f4a6ed71cf3f0e318e41e75ab4f9030c08` |
| Outer ZIP CRC/integrity | PASS; **192 files** |
| Embedded `RUN-026_EVIDENCE.zip` bytes | **22,524,792** |
| Embedded SHA-256 | `7bf9ef2fcaa8284457234b6fcfff229b98650955f19af644b6b17d9f91ba8d3c` |
| Embedded ZIP CRC/integrity | PASS; **187 files** |
| Manifest candidate | `e11579950ef7ed20e4b6eeee88f9c3597c1f074b` |
| Manifest member length/SHA | **186/186 PASS**, 0 failures |
| Visual inventory | **92/92** entries present; 0 missing |
| Published `raw/` vs original embedded ZIP | **byte-equal for every member** |
| All retained PNGs | **126/126** successfully decoded |

This independently closes the specific DQA-005 transport blocker. DQA-005 remains historically **INCONCLUSIVE** and is neither overwritten nor retroactively recast. Original artifact: [Actions run 40742109392](https://github.com/KhaosMagnus/YU3DOH-Carder/actions/runs/40742109392), [artifact 12838688889](https://github.com/KhaosMagnus/YU3DOH-Carder/actions/runs/40742109392/artifacts/12838688889).

## 2. Exact candidate and architectural boundary

GitHub comparison `dd968ba05e579461962bbcced0e9cae3cd4c3d23...e11579950ef7ed20e4b6eeee88f9c3597c1f074b`: **ahead by one commit, behind by zero**, exactly six changed files:

1. `package.json` — Library theme-test wiring only.
2. `scripts/test-library-theme.ts` — theme unit tests.
3. `src/library/app.tsx` — Library-local theme selector/state.
4. `src/library/index.tsx` — theme resolution before first React render.
5. `src/library/library.scss` — Library-only semantic/portal styling.
6. `src/library/theme.ts` — Library-only resolver and storage layer.

Independent source inspection confirmed `LIBRARY_THEME_KEY = 'yu3doh.library.theme.v1'`, `data-yu3doh-library-theme`, explicit `LIGHT | DARK`, default/fallback `DARK`, exact-value storage and nonfatal read/write guards. No OS theme handling, SYSTEM or AUTO state is implemented. `readLibraryTheme()` and `applyLibraryTheme()` run before `ReactDOM.render()`; theme changes update the Library presentation state instead of reconstructing the Library application.

The original `raw/architecture.json` records clean working tree, unchanged `workspace-server`, unchanged `src/service`, unchanged Library API/model/domain logic and unchanged Carder entrypoint and dependency lockfile. GitHub's independent six-file comparison supports the boundary. Schema **8**, Workspace format **1**, exactly migrations **001–008**, and **no 009**, corroborated by `raw/architecture.json`, `raw/theme-*/...-evidence.json` fixture records, and `raw/gates/06.log`. No API, schema, domain, server persistence, Carder protocol or dependency modernization change occurred.

## 3. Independent functional adjudication

| Frozen acceptance obligations | Finding | Direct raw evidence |
| --- | --- | --- |
| 1–2. Custody and six-file change | **PASS** | GitHub compare; `raw/architecture.json`, `raw/preflight.json`, `raw/final-product-refs.txt` |
| 3–8. LIGHT/DARK, DARK fallback for missing/invalid/denied storage, exact key, no SYSTEM/AUTO or OS override, nonfatal storage failures | **PASS** | Candidate `src/library/theme.ts`; `raw/gates/06.log` DT-U01–U12; `raw/theme-chromium/Chromium-evidence.json` and `raw/theme-firefox/Firefox-evidence.json` DT-B01–B08/B22; `raw/firefox-os.json` six native combinations |
| 9. Correct initial hydration/first content | **PASS** | Both browsers DT-B01–B03/B06–B07/B24 `first[]` observations (attribute already set, selected radio and canvas correspond, no startup write); `src/library/index.tsx` |
| 10. Theme switch retains GRID/LIST, search, filters, page, page size, order, Batch membership/hidden state, expected revisions, Detail/card/editor/validation/readiness | **PASS** | Both browsers DT-B09–B14: independently compared complete `proofs[*].before` and `after` snapshots for equality, with **zero** API requests between snapshots. Includes item IDs, revisions, ordered items, selected count, hidden count, open Detail, dirty editor values and validation; F04 retained selection/revision/order proofs corroborate |
| 11. Zero Workspace/domain mutation | **PASS** | DT-B19 zero theme-switch requests; DT-B20 hashes match; literal `raw/theme-{chromium,firefox}/workspace-before.json` and `workspace-after.json` are byte-identical in each engine; additional-surfaces and F04 workspace-invariance hashes also agree |
| 12. Carder isolation | **PASS** | DT-B21 both browsers: Carder document has no Library theme attribute, does not read its key and does not load Library theme CSS; V11 Carder screenshots; unchanged Carder source in six-file diff |
| 13. Ant Design Select, Drawer, Modal, `Modal.confirm` and overlays | **PASS** | Both engines DT-B15–B18; V03, V04 dropdown/confirm, V05–V07, New Draft, Batch, Workspace/Needs Attention screenshot + DOM/ARIA + rendered-color records |
| 14. Link Marker presentation/accessibility | **PASS** | V03 both themes/browsers, pressed/unpressed button semantics, explicit focus and selected-boundary computed contrast, DOM/ARIA snapshots; `raw/gates/06.log` RUN/RC Client checks |
| 15. Preferred Variant warning presentation/accessibility | **PASS with labeled synthetic boundary** | `proofs.preferredWarnings` real fixture states in both themes/engines, plus `proofs.syntheticOverframeOnly` and 4 labeled rendered PNGs; special finding below |
| 16–17. Text, control, focus and boundary contrast | **PASS** | Independently checked numeric `contrast[]` ratios versus per-pair thresholds and every `audit[].measurements[].pass` in both browser JSONs and `raw/additional-surfaces/evidence.json`; no threshold failures |
| 18–22. Chromium, Firefox, desktop/intermediate/mobile sizes | **PASS** | Chromium **151.0.7922.173**, Firefox **140.15.0**. Both engines `proofs.layouts` contain LIST=1 and GRID=3/2/1 columns at **1440×1000**, **900×1000**, **390×844**, DPR=1, with no horizontal document overflow; V01/V02/V08 images and focus/radio checks |
| 23. DT-U01–DT-U12 | **PASS 12/12** | `raw/gates/06.log` plus candidate `scripts/test-library-theme.ts` |
| 24. DT-B01–DT-B24 | **PASS 24/24 per engine** | `raw/theme-chromium/Chromium-evidence.json`; `raw/theme-firefox/Firefox-evidence.json`, logs, browser/DOM/visual outputs |
| 25. F04-U01–F04-U18 preserved | **PASS** | `raw/gates/06.log`; F04-U01–U16 explicit checks in `scripts/test-library-grid-list.ts`. U17–U18 are covered by preceding complete Library client/bridge suites; they are *not* separately labeled assert invocations, and are not misrepresented as such |
| 26. F04-B01–F04-B26 in LIGHT and DARK | **PASS 26/26 per theme** | `raw/f04-light/evidence.json`, `raw/f04-dark/evidence.json`, individual logs, retained screenshots, F04 state/invariance proofs |
| 27. Tranche-1 regressions | **PASS** | `raw/gates/06.log` previous Library/bridge regression suites, Link Marker/Preferred checks, unchanged logical modules; additional-surfaces and F04 checks |
| 28. Six authoritative commands | **PASS** | `raw/gates/gate-results.json`, individual raw `gates/03.log`–`08.log`, exit codes 0 and final outputs; dependency install logs 01/02 also exit 0 |
| 29. Workspace Service suite | **PASS: 1088 pass, 0 fail, 0 skipped** | Actual TAP footer `raw/gates/08.log`; not merely the summary |
| 30–36. Schema 8, format 1, migrations 001–008, no 009, no server/domain/Carder/dependency scope expansion | **PASS** | GitHub six-file diff, `raw/architecture.json`, `raw/gates/06.log`, `raw/environment.json` |
| 37. Attribution to immutable candidate | **PASS** | Exact candidate in manifest, preflight/ref chain, gate results, architecture, both browser JSONs, both F04 JSONs, additional-surfaces/Firefox-OS records and fixture. Independent GitHub diff matches |
| 38. Raw evidence sufficiency | **PASS** | Independent extraction, content validation, browser/DOM/network/state/contrast examination, screenshot inspection and source cross-checks as detailed here |

### Rendered accessibility evidence

Across Chromium and Firefox, independently recalculated result classification from supplied *rendered* measurement records:
- **254** explicit browser contrast pairs, plus **20** additional-surface pairs = **274**, all at or above the recorded threshold;
- **36,106** Chromium text samples, **35,168** Firefox text samples and **10,282** additional-surface text samples = **81,556** records, **zero reported threshold failures**;
- LIGHT minimum recorded normal-text ratio **5.4039:1** and meaningful boundary/focus/disabled ratio **4.2060:1**;
- DARK minimum recorded normal-text ratio **6.1110:1** and boundary/focus/disabled ratio **4.2510:1**;
- recorded normal/placeholder thresholds 4.5:1 and meaningful boundary/focus thresholds 3:1. Browser measurements inspect effective rendered backgrounds, not only theme tokens.

Both browser evidence directories have **41 PNGs and 10 DOM/ARIA files each**. Screenshots include portal overlays, dirty validation, selected Grid/List, focus and 390-pixel mobile. Additional surfaces include Provenance, Review/Confirm, Ingest, Variant Lifecycle, Asset Resolution in LIGHT/DARK. All retained 126 PNGs decoded. Representative images were inspected, including actual mobile Grid DARK and the isolated synthetic warning.

### Synthetic OVERFRAME-only READY: explicit boundary adjudication

The fourth Preferred-warning wording for `STANDARD=false, OVERFRAME=true` is **not a naturally attainable Service state** under unchanged readiness semantics: OVERFRAME READY implies STANDARD READY. The source-side pure function `preferredVariantWarning(false, true)` produces the expected textual distinction; the evidence harness inserts only a labeled isolated `ant-alert ant-alert-warning` presentation component and captures **four** explicitly named `Preferred-OVERFRAME-only-synthetic` PNGs (Chromium/Firefox × LIGHT/DARK), including computed warning contrast. Its message and visual contrast were independently inspected.

**Disposition: sufficient for the frozen hypothetical presentation criterion.** This validates the text and themeable rendering of that boundary, **not** a real Service E2E transition, persistence, or a newly supported readiness combination. The synthetic provenance is preserved without inflating natural E2E coverage. No readiness logic change is required or authorized.

### Runtime classification and limits

The Chromium console's one 503 is an **intentionally injected** unavailable-response scenario in DT-B23. Retained F04 console 503 records are similarly intentional. They are not unexplained product exceptions. `raw/theme-*/...-evidence.json` lists **zero page errors** in both engines, and `raw/f04-{light,dark}/evidence.json` also lists zero page errors. The build log contains a dependency `[INVALID_ANNOTATION]` warning but completes successfully, so it is not a blocking compile/build failure.

This external QA independently **analyzed raw DEV-008 execution, not reran the browser or full 1088-test suite on DQA-006's substrate**. The original log/fixture execution provenance, matched SHA, exact cryptographic contents, comprehensive machine-readable records, source cross-check, browser screenshots and absence of contrary evidence suffice for this assigned evidence-based acceptance review. Browser and console observations are correctly attributed to DEV-008 execution, not invented as DQA-006 rerun observations.

## 4. Findings and final disposition

- **Product defects established:** NONE.
- **Baseline regressions established:** NONE.
- **Remaining blocking evidence gaps:** NONE after successful artifact retrieval and raw inspection.
- **Development correction required:** NO.
- **Scope reopen required:** NO.
- **Product candidate mutated:** NO.
- **Workspace baseline/main mutated:** NO.
- **Integration authorized:** NO.

**OFFICIAL DQA-006 RESULT: PASS.**

**QA PASS DOES NOT AUTHORIZE INTEGRATION.** Project Control retains sole authority to decide subsequent disposition and integration. DQA-005 retains historical **INCONCLUSIVE**. DEV-008/S01's usage-limit interruption is execution-governance context, not a product defect and not evidence of a formal Recovery Gate.

## 5. Return envelope

```text
YU3DOH RETURN ENVELOPE

SOURCE ROLE / INSTANCE:
DESIGN_QA / DQA-006

TARGET ROLE / INSTANCE:
PROJECT_CONTROL / PC-002

CONTROL INPUT SHA:
105bad28026a0cc77c05df8d2a47bad989475b77

MODE:
SUCCESSOR INDEPENDENT EXTERNAL QA

RUN:
RUN 026

REQUEST:
CR-0002 — Library Dark Theme

OFFICIAL RESULT:
PASS

EXACT BASELINE:
feature/workspace-v0.1
dd968ba05e579461962bbcced0e9cae3cd4c3d23

EXACT VALIDATED CANDIDATE:
feature/workspace-run-026
e11579950ef7ed20e4b6eeee88f9c3597c1f074b

RAW EVIDENCE:
Actions artifact 12838688889
Outer ZIP SHA-256 de8e9a82744e04fad9153b1ba4ea65f4a6ed71cf3f0e318e41e75ab4f9030c08
Original ZIP SHA-256 7bf9ef2fcaa8284457234b6fcfff229b98650955f19af644b6b17d9f91ba8d3c

PREDECESSOR DQA-005:
INCONCLUSIVE (historically unchanged)

DEVELOPMENT CORRECTION REQUIRED:
NO

PRODUCT MUTATION:
NONE

INTEGRATION:
NOT AUTHORIZED

MAIN MOVEMENT:
NOT AUTHORIZED

QA PASS DOES NOT AUTHORIZE INTEGRATION.

RETURN:
DESIGN_QA / DQA-006 → PROJECT_CONTROL / PC-002
```
