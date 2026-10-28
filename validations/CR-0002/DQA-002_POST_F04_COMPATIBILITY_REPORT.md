---
artifact_id: CR-0002-DQA-002-POST-F04-COMPATIBILITY-REPORT
artifact_type: design_compatibility_report
status: FINAL
compatibility_result: COMPATIBLE
source_role: DESIGN_QA
source_instance: DQA-002
target_role: PROJECT_CONTROL
target_instance: PC-002
control_input_sha: 0248e66dc2c69b2d72cc816529dc5f714ebd8166
original_design_baseline: 64cb5f4ca42348c6c403e64e0d61bdff8c32a281
exact_implementation_baseline: dd968ba05e579461962bbcced0e9cae3cd4c3d23
scope_reopen_required: false
implementable: true
testable: true
contract_successor: NONE
implementation_authorized: false
run_assigned: false
---

# CR-0002 — DQA-002 Post-F04 Compatibility Report

## 1. Final disposition

**COMPATIBILITY RESULT: COMPATIBLE.**

**EXACT IMPLEMENTATION BASELINE:** `feature/workspace-v0.1 @ dd968ba05e579461962bbcced0e9cae3cd4c3d23`.

**SCOPE REOPEN REQUIRED: NO. IMPLEMENTABLE: YES. TESTABLE: YES. CONTRACT SUCCESSOR: NONE.**

The original frozen `handoffs/CR-0002_LIBRARY_DARK_THEME_IMPLEMENTATION_HANDOFF.md` remains normative and unchanged. Its §§10–18 already include BOTH Grid/List, Link Marker, Preferred Variant, independent local preference, state preservation, post-F04 tests and portal coverage. This report records the precise integrated implementation facts and inherits the verified F-04 gates; it does not amend product semantics. No bounded successor handoff is needed.

**Implementation authority: NONE. RUN: NOT ASSIGNED. Product ref movement: NOT AUTHORIZED. Main movement: NOT AUTHORIZED. CR-0002 Development: NOT AUTHORIZED.**

## 2. Chain of authority and GitHub evidence

Read at control SHA `0248e66dc2c69b2d72cc816529dc5f714ebd8166`: frozen CR-0002 Scope v2 and design handoff, post-F04 authorization/request/route, RUN-025 closure and DQA-004 final QA, CR-0001-v22, PROJECT_STATE, DESIGN_QA role and DQA-002 instance.

GitHub compare `64cb5f4ca42348c6c403e64e0d61bdff8c32a281...dd968ba05e579461962bbcced0e9cae3cd4c3d23` returns `ahead 3 / behind 0`, merge-base `64cb5f4ca42348c6c403e64e0d61bdff8c32a281`. The 16 changed paths are exactly:
- `implementations/RUN-024_IMPLEMENTATION_REPORT.md`
- `package.json`
- `scripts/run025-qa-fixture.cjs`
- `scripts/run025-ui-evidence.cjs`
- `scripts/test-library-client.ts`
- `scripts/test-library-grid-list.ts`
- `scripts/test-library-tranche-one.ts`
- `src/library/app.tsx`
- `src/library/detail-panel.tsx`
- `src/library/editor-form.tsx`
- `src/library/library-result-card.tsx`
- `src/library/library.scss`
- `src/library/link-marker-selector.tsx`
- `src/library/link-marker-state.ts`
- `src/library/open-in-carder.tsx`
- `src/library/preferred-variant-warning.ts`.

`feature/workspace-v0.1` resolves to the exact integrated candidate SHA; `main` remains `54cc3aad246c89a29f2a18be63c539db68cae041`. DQA-004 recorded RUN 025 `PASS`, including all F04-U01–U18 and F04-B01–B26. Those historical QA observations are accepted as F-04 evidence, **not** CR-0002 implementation/QA evidence.

## 3. Code-specific compatibility findings

| Question | Verified post-F04 implementation | Disposition |
| --- | --- | --- |
| LIGHT/DARK, default DARK, SYSTEM/AUTO OUT | No new theme state or competing OS theme mechanism; original contract remains valid | COMPATIBLE |
| Library client/UI boundary | Separate Library `src/library/index.tsx` Ant Design 4.9.4 entry remains; no Server/Carder/theme dependency introduced | COMPATIBLE |
| Browser-local preference independence | `viewMode` is independent `useState<LibraryViewMode>(INITIAL_LIBRARY_VIEW)` inside LibraryApp; no F-04 view storage; planned theme `localStorage` key does not collide | COMPATIBLE |
| State preservation | Filters, result, selectedCardId, detailOpen, editorDirty, batchSelection and viewMode have independently owned state; future theme changes must not remount LibraryApp or invalidate Workspace | COMPATIBLE; regression evidence required |
| Grid/List presentation | `LibraryResultCard` receives identical `card`, `selected`, `checked`, `batchDisabled`, `onOpen`, `onSelect`; `mode` only changes presentation/classifications visibility | COMPATIBLE |
| Link Marker | Eight valid code buttons with `aria-pressed`, code/direction and non-interactive center; selector state remains canonical | COMPATIBLE; test contrast/focus/pressed |
| Preferred warning | Pure `preferredVariantWarning(standardReady,overframeReady)` text derived from current readiness; no algorithm/selection change | COMPATIBLE; test warning readability |
| New portal/control surface | F-04 introduces radio group, result Detail button and separate Batch checkbox; Link Marker adds pressed buttons; no new theme framework or required global portal | Existing thematic categories sufficient |
| Architectural stop conditions | No evidence of schema/migrations/API/Workspace/Carder changes or Ant Design major upgrade | NO SCOPE REOPEN |
| Automated tests | `test:library` now includes both Tranche-1 and F04-focused tests; exact existing gate inherits these | COMPATIBLE |
| Expected file boundary | Library entrypoint, local app/theme/style and bounded Library component selectors; no server/Carder | COMPATIBLE |

### Specific F-04 DOM and CSS hooks to theme

- `.library-view`, `.library-view input:focus-visible`, accessible group `Library results view`, named radio inputs `Grid` and `List`, `INITIAL_LIBRARY_VIEW='LIST'`;
- `.library-results` and `.library-results--grid` at widths 1440/900/390; empty/loading/error panels spanning all grid columns;
- `.library-card`, `.library-card--selected`, `.library-card__selected`, `.library-card__open` and its focus, `.library-card__batch`/checkbox focus, Tag/readiness;
- `.library-link-markers`, `.library-link-markers__grid`, button `aria-pressed=true/false`, button focus, center placeholder;
- `open-in-carder.tsx` warning/Alert severity, preserving Preferred semantics;
- Ant Design body-portaled Select dropdowns/Modal/Drawer/`Modal.confirm` already within original handoff.

The current CSS still contains light-specific colors (including `#f0f7ff` selected result and `#175cd3` Detail link, marker button `#fff` and `#175cd3`). This is expected implementation work for CR-0002, **not** a conflict. Theme colors must become semantic without changing layout, event handling or readiness.

### F-04 accessibility/interaction nuance

F-04 uses a semantic Detail button separate from a Batch checkbox; do not revert to the pre-F04 clickable article. `Detail selected` remains a textual and accessible cue. Link Marker `aria-pressed` continues to represent the canonical selection, not theme selection. The theme selector must be a **separate** labeled radio group `Library theme`, not use the existing `Library results view` group/name.

The modal Detail Drawer intentionally prevents ordinary pointer access to background controls. F04-B16/B17 used synthetic DOM events to prove state preservation through background transitions while the Drawer was open. CR-0002 does not authorize changing Drawer modality. Theme switching while Drawer is open must preserve it through theme state application; accessibility/visual checks of an existing open Drawer are required.

## 4. Exact preserved functional invariants

A theme-only action must preserve, field-for-field:
1. `viewMode` = GRID/LIST and current result layout;
2. browse query, language/family/archetype/effect/tag facets, `filters.limit`, `filters.offset`;
3. result card identity/order, `card_id@revision`, result total and readiness booleans;
4. visible and hidden Batch membership, existing `expected_revision` for every Batch entry;
5. selected Detail ID and open/closed state, including a card hidden by filter/page;
6. editor working values, dirty/validation/confirmation state;
7. warnings and READY/incomplete semantics;
8. no extra theme-induced browse/API request and no POST/PATCH/PUT/DELETE;
9. no Workspace/Canonical/Asset/Variant mutation or unintentional React remount.

The theme state must be independent of `INITIAL_LIBRARY_VIEW='LIST'`, and its storage key is solely `yu3doh.library.theme.v1`; no view-mode storage is added by CR-0002.

## 5. Required automated gates (candidate exact SHA)

Retain the same six RUN-025 authoritative commands **all with exit 0**:

```sh
yarn compile
yarn build
yarn test:sc
yarn test:library
yarn --cwd workspace-server compile
yarn --cwd workspace-server test
```

With frozen dependency installs:

```sh
yarn install --frozen-lockfile --non-interactive
yarn --cwd workspace-server install --frozen-lockfile --non-interactive
```

`yarn test:library` must continue executing:
- `tsx scripts/test-library-client.ts` (includes `runTrancheOneChecks` and other established client suites);
- `tsx scripts/test-workspace-bridge.ts`;
- `tsx scripts/test-library-grid-list.ts` (F04-U01–U16; U17–U18 are preceding client/bridge suite preservation).

Explicit focused cases that must remain executable and PASS:
- Tranche-1 `scripts/test-library-tranche-one.ts`: 8-direction Link Marker mapping, invalid/center code rejection, toggle/undo/baseline order, dirty/revision boundaries, Preferred Variant warning four readiness combinations and default/selection invariant;
- F04-U01–U18 in the existing F-04 suite/inherited suites;
- CR-0002 original DT-U01–U12 resolver/storage unit tests;
- CR-0002 original DT-B01–B24 browser cases, including Grid/List/Link Marker/Preferred and full surface coverage.

CR-0002 tests must ADD to these suites, not replace or weaken their assertions. A new theme-focused command is allowed only as an **additional** gate; it cannot substitute the six canonical commands.

No root `yarn test` aggregate is invented: RUN-025 reconciliation explicitly names the six authoritative commands above.

## 6. Required browser / visual / accessibility evidence

### Retained F-04 contracts

Every **F04-B01–B26** must be reproduced (or equivalently proven without weakening the original frozen assertions) on the eventual CR-0002 exact candidate. In particular:

- B01 LIST default/fresh view; B02 1440 GRID 3 columns; B03 900 GRID 2 columns; B04 390 GRID 1 column/no overflow; B05 390 LIST/controls accessible;
- B06–B10 search/facets/page/limit, zero view-switch request, visible/hidden Batch membership and frozen revisions;
- B11–B15 separate pointer/keyboard Detail and Batch actions; radio semantics, ArrowRight/focus;
- B16–B17 preserve selected Detail through view/filter/page transitions, including hidden result;
- B18 readiness equality to real API; B19 loading; B20 empty/no match; B21 error/retry; B22 pagination;
- B23 persistent text/accessibility selected cue; B24 keyboard focus; B25 exact ordered `card_id@revision` equals browse response; B26 no unexplained page errors/domain mutation.

Retain disposable realistic Service fixtures and API/custody snapshots. Baseline-reproduced favicon-404 and Ant Design `scrollLocker` warning and deliberately stimulated 503 must be classified rather than silently counted as CR-0002 regression or concealed.

### Added cross-product compatibility coverage

Original CR-0002 DT-B01–B24 is binding. Execute theme-specific Grid/List state preservation in BOTH themes. Extend evidence coordinates from original theme design **1440×1000 and 390×844** to additionally retain F-04's **900×1000** intermediate GRID width, DPR 1. For reproducibility capture LIST/GRID against the same fixture and page, with accessible radio/Detail/Batch states and representative disabled, hover and focus variants.

Retain original CR-0002 V01–V11 visual scenes and machine-readable requirements. In V01/V02 measure:
- LIST rich classification vs GRID compact identity/readiness;
- Grid 3/2/1 column counts at 1440/900/390;
- selected card focus/indicator plus text `Detail selected`;
- checkbox focus and independent action;
- view radio focus, checked state and keyboard behavior;
- no horizontal overflow at 390;
- `LinkMarkerSelector` pressed/unpressed/focus/disabled where applicable and inert center;
- Preferred Variant warning with STANDARD-only, OVERFRAME-only, neither, and both READY (no warning).

Required engines remain **Chromium and Firefox** with recorded exact versions; Chromium may be primary pixel capture, Firefox requires behavioral and contrast parity. Capture computed color ratios on rendered normal/muted/placeholder text (4.5:1), large text (3:1), meaningful control boundaries/focus/selected states (3:1), both themes; color-only status signaling is forbidden. Include document-level theme attribute before first Library content, localStorage seed/read/write failure, DOM/ARIA, screenshots, network diff, API result order and Canonical/Workspace snapshots.

The existing F-04 source-side Playwright script `scripts/run025-ui-evidence.cjs` is evidence tooling, not a new product feature. Reuse/adapt it for CR-0002 exact-candidate output and additional DARK/LIGHT state coverage; do not mistake the historical RUN-025 screenshots for CR-0002 validation.

## 7. Precise production file boundary on integrated SHA

**Expected core production files**:
```text
library/index.html                    # optional prepaint only
src/library/index.tsx
src/library/app.tsx
src/library/library.scss
src/library/theme.ts                  # new, or equivalent Library-local theme module
```

**Conditionally in-bound, only for presentation hooks**:
```text
src/library/library-result-card.tsx
src/library/link-marker-selector.tsx
src/library/detail-panel.tsx
src/library/editor-form.tsx
src/library/open-in-carder.tsx
other src/library/** components that require bounded semantic styling hooks
```

**Existing logic files to preserve, not rewrite for theme**:
```text
src/library/link-marker-state.ts
src/library/preferred-variant-warning.ts
src/library/batch-classification-state.ts
src/library/api.ts
src/library/model.ts
```

**Allowed test/evidence**:
```text
scripts/test-library-client.ts
scripts/test-library-grid-list.ts        # preserved
scripts/test-library-tranche-one.ts     # preserved
scripts/test-library-theme.ts           # optional new
scripts/run025-ui-evidence.cjs          # reusable evidence harness, if separately authorized
```

**Out of production scope**: `workspace-server/**`, migrations, Workspace/domain persistence, Carder `index.html`, Carder source/render/export, `src/service/**`, runtime dependencies and major Ant Design upgrade. `package.json` may receive only bounded theme test-script wiring if necessary, not a dependency upgrade.

## 8. Scope review and stop conditions

No material conflict found. The existing document-scoped Library styling approach continues to cover Ant Design 4.9.4 portals, new Grid/List result markup, Link Marker and Preferred warning. The original F-04 separate implementation boundary remains respected.

If future Development reports need for server/API/schema/migration 009, Workspace persistence, Carder redesign, a shared app-wide theme foundation or major Ant Design change, it must STOP and RETURN TO SCOPE. If only class names/selectors/test fixtures drift under the exact integrated code, this report already grounds them; no handoff successor is necessary.

## 9. Residual questions

**NONE** that blocks compatibility. Actual CR-0002 palette contrast, browser hydration, Firefox parity and exhaustive functional behavior are implementation/External-QA validation obligations, **not** achieved or claimed by this design-only compatibility review.

## 10. Formal return

```text
SOURCE:
DESIGN_QA / DQA-002

TARGET:
PROJECT_CONTROL / PC-002

COMPATIBILITY RESULT:
COMPATIBLE

EXACT IMPLEMENTATION BASELINE:
feature/workspace-v0.1
dd968ba05e579461962bbcced0e9cae3cd4c3d23

SCOPE REOPEN REQUIRED:
NO

IMPLEMENTABLE:
YES

TESTABLE:
YES

REQUIRED AUTOMATED GATES:
six-command authoritative gate + original DT-U01–U12 +
F04-U01–U18 + Tranche-1 focused gates

REQUIRED BROWSER/VISUAL/ACCESSIBILITY:
original DT-B01–B24 + V01–V11 +
F04-B01–B26, 1440/900/390 widths, both themes,
Chromium/Firefox, rendered WCAG contrast and state preservation

CONTRACT SUCCESSOR:
NONE

RESIDUAL QUESTIONS:
NONE

IMPLEMENTATION AUTHORITY:
NONE

RUN:
NOT ASSIGNED

PRODUCT REF MOVEMENT:
NOT AUTHORIZED

MAIN MOVEMENT:
NOT AUTHORIZED

CR-0002 DEVELOPMENT:
NOT AUTHORIZED
```
