---
artifact_id: CR-0002-LIBRARY-DARK-THEME-IMPLEMENTATION-HANDOFF
artifact_type: implementation_handoff
status: FROZEN
protocol_version: "1.0"
source_role: DESIGN_QA
source_instance: DQA-002
target_role: PROJECT_CONTROL
target_instance: PC-002
control_input_sha: 3d7f9eee831b1ab41df50463494d0d9b519d5d1d
concurrent_control_head_observed: 4416c5579c96b93256bfe8ffc4417485494b481c
primary_scope: scopes/CR-0002_LIBRARY_DARK_THEME-v2.md
project_control_disposition: control/CR-0002_SCOPE_DISPOSITION.md
design_baseline:
  branch: feature/workspace-v0.1
  sha: 64cb5f4ca42348c6c403e64e0d61bdff8c32a281
implementation_baseline: UNASSIGNED_POST_F04
implementation_authorized: false
run_authorized: false
scope_reopen_required_now: false
post_f04_compatibility_gate_required: true
---

# CR-0002 — Library Dark Theme
## External Design + QA Implementation Handoff

## 1. Formal Design + QA disposition

```text
DESIGN CONTRACT:
FROZEN

IMPLEMENTABLE:
YES

TESTABLE:
YES

SCOPE REOPEN REQUIRED NOW:
NO

IMPLEMENTATION:
NOT AUTHORIZED

RUN:
NOT AUTHORIZED

CURRENT DESIGN BASELINE:
feature/workspace-v0.1
64cb5f4ca42348c6c403e64e0d61bdff8c32a281

EVENTUAL IMPLEMENTATION BASELINE:
NOT YET ASSIGNED

MANDATORY PREIMPLEMENTATION GATE:
POST-F04 COMPATIBILITY REVIEW
```

The frozen Scope v2 is implementable as a bounded Library-only client/UI feature on the reviewed architecture. No server, schema, Workspace persistence, Canonical, Carder-protocol or migration change is required.

This handoff does not authorize Development. Project Control must first complete the frozen sequence through CR-0001.4 / F-04, then assign an exact post-F04 implementation baseline after the compatibility gate in §17.

## 2. Evidence and architecture observed at the design baseline

At `64cb5f4ca42348c6c403e64e0d61bdff8c32a281`:

- `library/index.html` is a separate Library HTML entrypoint mounting `#library-root`.
- `vite.config.ts` builds separate `carder` and `library` entrypoints.
- `src/library/index.tsx` imports Ant Design `4.9.4` global CSS and renders `LibraryApp`.
- `src/library/app.tsx` imports `src/library/library.scss`.
- Ant Design version is exactly `4.9.4`; React is `17.0.1`.
- Library has no theme preference state or browser-local theme storage at this baseline.
- `library.scss` contains multiple light-specific literals for canvas, surfaces, borders, text, selection, diagnostics and operational panels.
- Library currently uses Ant Design `Modal`, `Modal.confirm`, `Drawer`, `Select`, `Alert`, `Tag`, `Input`, `InputNumber`, `Radio`, `Checkbox`, `Switch`, `Pagination`, `Spin` and related controls.
- Library-owned overlays include body-portaled Select dropdowns, Modals, confirmation dialogs and Drawer surfaces.
- The current Library header action cluster contains Workspace, Needs Attention, New Draft and Workspace status; it is the appropriate discoverable location for the theme control.
- Current baseline validation commands include `yarn compile`, `yarn build` and `yarn test:library`.

The separate Library entrypoint allows document-scoped Library theming without changing Carder.

## 3. Frozen theme-state model

The only valid user theme values are:

```text
LIGHT
DARK
```

Resolution is exact and case-sensitive:

| Stored state | Effective theme |
| --- | --- |
| exact `LIGHT` | LIGHT |
| exact `DARK` | DARK |
| key missing | DARK |
| empty string | DARK |
| lowercase/mixed-case value | DARK |
| whitespace-padded value | DARK |
| any other value | DARK |
| storage read throws/unavailable | DARK |

There is no coercion and no third state.

```text
SYSTEM:
OUT

AUTO:
OUT

OS prefers-color-scheme:
MUST NOT CONTROL THE RESULT
```

A valid stored explicit choice takes precedence over the DARK fallback.

## 4. Exact theme-control UX

### 4.1 Placement

Place the control in `.library-header__actions`, before the Workspace action.

The control remains part of the Library shell and is available whenever the Library shell renders. It must not require:

- a READY Workspace;
- opening Detail;
- entering editor mode;
- opening Workspace Management;
- any Canonical mutation permission.

The header action layout may gain bounded wrapping needed to keep the control usable at narrow widths. No unrelated header redesign is authorized.

### 4.2 Control type and visible labels

Use one two-option radio-style segmented choice compatible with Ant Design 4.9.4:

```text
Light
Dark
```

Normative semantic values:

```text
Light → LIGHT
Dark  → DARK
```

Normative accessible group name:

```text
Library theme
```

A conforming implementation is an Ant Design `Radio.Group` with two `Radio.Button` children. Replacing it with icon-only buttons or an unlabeled toggle is not conforming.

### 4.3 Keyboard and assistive semantics

The control must expose radio-group semantics.

Required keyboard behavior:

- `Tab` enters the group at the selected option according to native/radio-group behavior.
- Arrow Left/Up moves selection to the previous option.
- Arrow Right/Down moves selection to the next option.
- `Space` selects the focused option.
- Pointer/touch activation selects the chosen option.
- Focus must be visibly rendered in both themes.
- Theme change occurs on selection; there is no separate Apply/Save action.

No custom keyboard shortcut is authorized.

The effective option must be programmatically checked/selected and visually distinguishable without relying on color alone.

## 5. Browser-local persistence contract

### 5.1 Mechanism and key

Persistence mechanism is:

```text
window.localStorage
```

Normative key:

```text
yu3doh.library.theme.v1
```

Only exact `LIGHT` or `DARK` is a valid persisted value.

The key is:

- browser/profile local;
- origin local;
- not Workspace-specific;
- not Canonical;
- not synchronized through the Workspace Service;
- not copied into backup/restore state.

Live cross-tab synchronization is not required. A newly opened or reloaded Library tab must resolve the currently stored valid value.

### 5.2 Startup read

Startup may read the key exactly once for initial resolution, with a guarded read.

A missing, invalid or unreadable preference resolves to DARK.

**Startup fallback must not write storage.**

In particular, initial hydration must not silently:

- create the key when it is missing;
- replace an invalid value;
- delete an invalid value;
- persist DARK merely because DARK is the fallback.

Only an explicit user selection writes the preference.

### 5.3 Explicit selection write

On user selection:

1. apply the selected theme to the current Library immediately;
2. attempt to persist the selected exact value to `localStorage`;
3. do not call any Workspace/API endpoint as part of that action.

If the write succeeds, the selection persists.

If the write throws or storage is unavailable:

- keep the explicitly selected theme active for the current page/session;
- do not revert to DARK solely because the write failed;
- expose a non-blocking textual status:
  `Theme preference could not be saved; this selection is temporary.`
- the status must be programmatically available as a polite status/alert-equivalent and readable in both themes;
- clear the status after a later successful explicit preference write or on normal page reload.

The storage failure must not block Library startup, browsing, Detail or Workspace access.

## 6. Startup, hydration and acceptable theme flash

Before Library-owned interactive content is committed to the DOM, the implementation must resolve the effective theme and apply the normative document attribute:

```text
data-yu3doh-library-theme="LIGHT"
data-yu3doh-library-theme="DARK"
```

Normative scope location:

```text
document.documentElement
```

The React/theme state and document attribute must agree before the first user-visible Library shell is rendered.

Acceptable:

- an unstyled/blank browser document before the Library bundle executes;
- a background-only transient before Library content mounts, provided no Library shell/card/control is visibly rendered in the opposite theme.

Not acceptable:

- rendering the Library shell in LIGHT and then flipping it to resolved DARK;
- rendering the Library shell in DARK and then flipping it to valid stored LIGHT;
- a visible modal/drawer/dropdown in the opposite theme after the effective theme is known.

Automation must prove that the document theme attribute is already correct when `#library-root` first becomes non-empty.

## 7. Frozen Library theme architecture

### 7.1 State and application

Expected architecture:

```text
browser-local resolver
        ↓
single LibraryTheme state: LIGHT | DARK
        ↓
documentElement data-yu3doh-library-theme
        ↓
Library semantic CSS custom properties
        ↓
Library-owned native + Ant Design surfaces
```

A small Library-only theme module is expected so resolution, validation, storage and document application are independently testable.

Recommended production unit:

```text
src/library/theme.ts
```

Equivalent Library-local naming is acceptable if responsibilities remain bounded.

### 7.2 Semantic presentation categories

The implementation must centralize at least these semantic categories rather than duplicating component-specific dark literals:

- canvas/background;
- primary surface;
- elevated/overlay surface;
- subtle/inset surface;
- primary text;
- secondary text;
- muted text;
- inverse text when required;
- standard border;
- strong/interactive border;
- link/action foreground;
- primary action/accent;
- focus indicator;
- selected surface/border;
- hover surface;
- active surface;
- disabled surface/text/border;
- input/control surface/text/placeholder/border;
- code/preformatted surface/text/border;
- table header/body/separator;
- overlay mask;
- shadow;
- success foreground/background/border;
- warning foreground/background/border;
- error foreground/background/border;
- info foreground/background/border.

CSS custom properties are the preferred mechanism.

LIGHT must preserve the existing visual intent. Current baseline references include:

```text
canvas              #f4f5f7
primary surface     #ffffff
subtle surface      #f8fafc
primary text        #1f2328
secondary/muted     #344054 / #667085
common border       #d0d5dd / #dfe3e8
focus/selection     #2563eb / #3b82f6
```

These baseline literals describe existing intent; they are not authority to retain inaccessible combinations.

DARK literal palette selection is an implementation detail **only within the semantic categories above**. Acceptance is determined by the measurable contrast/state protocol in §11, not by arbitrary pixel equality to a DQA-chosen dark palette.

### 7.3 Hard-coded color refactor

Existing Library-specific hard-coded colors may be converted to semantic variables when required for coherent theming.

This authority does not include changes to:

- spacing except bounded theme-control/header wrapping;
- information hierarchy;
- workflow order;
- component ownership;
- API behavior;
- data semantics;
- readiness semantics;
- layout semantics unrelated to Grid/List compatibility.

## 8. Ant Design 4.9.4 overlay/portal contract

Ant Design `4.9.4` is retained.

No Ant Design major upgrade, v5 theme algorithm migration or general dependency modernization is authorized.

Because Library-owned portals are commonly mounted beneath `document.body`, theme scope must be document-level on the Library entrypoint, not only a descendant class on `#library-root`.

Required themed Ant Design surface families, where invoked by Library:

- `.ant-modal*`, including `Modal.confirm`;
- `.ant-drawer*`;
- `.ant-select*`, including dropdown and selected/active options;
- `.ant-input*` and search controls;
- `.ant-input-number*`;
- `.ant-radio*` and radio-button wrappers;
- `.ant-checkbox*`;
- `.ant-switch*`;
- `.ant-pagination*`;
- `.ant-alert*`;
- `.ant-tag*`;
- `.ant-spin*`;
- buttons and danger/primary/disabled states;
- tooltips/popovers if present on the post-F04 implementation baseline.

The implementation must theme portal content by document-scoped Library CSS/semantic variables. It must not force every popup into `#library-root` merely for theme inheritance if doing so changes clipping, positioning or z-index behavior.

No portal may remain visually LIGHT while effective theme is DARK, or vice versa.

## 9. Carder isolation contract

Carder is explicitly outside CR-0002.

The Library theme mechanism must not be imported, initialized or applied by the Carder entrypoint.

Required isolation observations:

- Carder does not set `data-yu3doh-library-theme`.
- Carder does not read `yu3doh.library.theme.v1` to control its presentation.
- Library CSS theme overrides are not added to Carder-owned stylesheets.
- Carder renderer/export images are unchanged.
- Library theme switching must not reload, restyle or mutate Carder.
- The Library-side Open in Carder panel is themed; the launched Carder document is not.

The same-origin existence of the localStorage key is not itself a defect. Carder simply ignores it.

## 10. Full Library surface/state coverage matrix

The eventual post-F04 implementation must cover all rows below in both LIGHT and DARK.

| Surface | Required states/coverage |
| --- | --- |
| Shell / page | canvas, header, title/subtitle, Workspace state READY/not-ready/unavailable |
| Theme control | selected/unselected, hover, keyboard focus, persistence-failure status |
| Browse controls | Search, all Selects, placeholder, disabled, focused, dropdown open, selected option |
| Result mode control after F-04 | GRID/LIST selected/unselected/focus/disabled if such state exists |
| Results LIST | normal card, hover, keyboard focus, selected card, batch checkbox, readiness/status tags |
| Results GRID after F-04 | same semantic states as LIST; compact cards remain readable |
| Result-state panels | connecting, unavailable, not-ready, loading, request error, empty Library, no match |
| Pagination | current, non-current, hover/focus, previous/next disabled |
| Batch toolbar | count text, hidden count, enabled/disabled actions, warning |
| Batch Classification | modal shell, form controls, preview, result rows, checkbox, info/warning/error/success |
| Detail Drawer | mask, drawer shell/header/body, loading, detail error, toolbar/actions |
| Canonical read-only | sections, tags, preformatted/raw structure blocks |
| Canonical editor | text inputs, numeric inputs, selects, switch, checkbox, labels, dirty state |
| Validation | aria-invalid/error text, out-of-domain/history warning, save error/conflict/reload actions |
| Graphical Link Marker selector after Tranche 1 | unselected/selected marker, center invalid/non-marker, hover/focus/disabled |
| Review / Confirm | Review buttons, confirmation modal, confirmation states, source/note fields |
| `Modal.confirm` flows | discard/confirmation dialog content, primary/cancel/danger focus |
| Sources / Provenance | filters, history rows, current marker/tag, long text |
| External Sources | retrieval/history, raw `pre`, tables, selectable claims, diff, review/apply states |
| External Structure | readiness/preview, ineligible/ready diagnostics, table/control states |
| Variants / Assets | variant cards, Preferred marker, readiness, role slots, ownership/issues |
| Ingest | inputs/actions/loading/error/success |
| Asset Resolution | modal, native selects, candidate selection, metadata, preview/confirmation |
| Variant lifecycle | modal, rename/preferred/remove preview, stale/error/success |
| Needs Attention | fixed panel, filters, diagnostic cards, error/warning, action controls |
| Workspace Management | modal(s), metadata, backup rows, status tags, radio/checkbox, warning/recovery states |
| New Draft | modal, family Select, password input, disabled/loading/validation |
| Open in Carder | variant/language Selects, composition warnings, success/error, launch actions |
| Status semantics | success, warning, error, info, READY/incomplete, Preferred, diagnostic codes |
| Portal surfaces | Select dropdown, Modal, Drawer, confirm dialog, tooltip/popover if post-F04 introduces them |
| Narrow viewport | header/theme control, browse controls, results, modal/drawer reachability |

Meaning must never be supplied by color alone. Existing text/icon/status semantics remain authoritative.

## 11. Accessibility and contrast measurement protocol

Both themes are first-class supported states.

### 11.1 Required thresholds

Use rendered/computed colors after transparency and effective background composition.

Required minimums:

- normal text: `4.5:1`;
- large text: `3:1`;
- meaningful non-text control boundaries/graphics: `3:1` against adjacent color where WCAG non-text contrast applies;
- keyboard focus indicator: `3:1` against adjacent colors;
- placeholders: `4.5:1` because they convey user-facing text;
- selected-state boundary/indicator: `3:1` against adjacent unselected surface;
- disabled state: must remain distinguishable and readable; target at least `3:1` for disabled text/boundary even where WCAG exemptions might otherwise apply.

Do not accept a theme because token definitions appear compliant. Measurements are taken from rendered elements.

### 11.2 Mandatory representative measurements per theme

Record numeric ratios for at least:

1. primary shell text vs canvas/surface;
2. muted/secondary header text vs its surface;
3. Library link/action text vs its surface;
4. input value text vs control background;
5. input placeholder vs control background;
6. focused input/select border or focus ring vs adjacent surface;
7. selected result card indicator vs card/surrounding surface;
8. theme-radio focus and selected indicator;
9. dropdown option text and selected option state;
10. Drawer/Modal primary text vs overlay surface;
11. table header/body text and separators;
12. preformatted/raw evidence text vs code surface;
13. success status foreground vs background;
14. warning status foreground vs background;
15. error status foreground vs background;
16. info status foreground vs background;
17. disabled representative control text/boundary;
18. graphical Link Marker selected/focus state on the post-Tranche-1 baseline;
19. Grid and List card identity/readiness text after F-04.

Any critical pair below its required threshold is a QA FAIL, not a visual preference issue.

### 11.3 Non-color requirements

Validate in both themes:

- focus remains visible through keyboard-only traversal;
- selected/unselected is exposed programmatically and visually;
- errors/warnings/success/info retain textual/icon semantics;
- READY/incomplete and Preferred remain textually identifiable;
- disabled controls are visually distinguishable;
- links remain distinguishable by more than a subtle hue shift where surrounded by body text;
- no focus ring is clipped by newly introduced theme CSS.

## 12. Deterministic automated test matrix

Development must add deterministic tests for the theme contract. Exact file naming may follow the post-F04 test layout; the cases are normative.

### Theme resolver/storage unit contract

| ID | Case | Expected |
| --- | --- | --- |
| DT-U01 | storage key missing | DARK; no write |
| DT-U02 | stored `LIGHT` | LIGHT |
| DT-U03 | stored `DARK` | DARK |
| DT-U04 | stored invalid value | DARK; invalid value not rewritten/deleted |
| DT-U05 | storage read throws | DARK; startup continues |
| DT-U06 | explicit LIGHT selection | effective LIGHT immediately; write exact `LIGHT` |
| DT-U07 | explicit DARK selection | effective DARK immediately; write exact `DARK` |
| DT-U08 | explicit write throws | selected theme remains active; temporary-preference status set |
| DT-U09 | later write succeeds | status clears; exact value persisted |
| DT-U10 | resolver input `light`, ` Dark `, empty | all invalid → DARK |
| DT-U11 | SYSTEM/AUTO/OS preference present | no effect on resolver result |
| DT-U12 | storage key | exactly `yu3doh.library.theme.v1` |

### Browser/runtime contract

| ID | Case | Expected |
| --- | --- | --- |
| DT-B01 | first load, no key | document/root first Library content is DARK; control Dark checked |
| DT-B02 | first load, stored LIGHT | first Library content LIGHT; Light checked |
| DT-B03 | first load, stored DARK | first Library content DARK |
| DT-B04 | switch LIGHT→DARK→reload | DARK remains |
| DT-B05 | switch DARK→LIGHT→reload | LIGHT remains |
| DT-B06 | invalid stored value | DARK; no storage repair |
| DT-B07 | localStorage read denied | DARK; Library remains operational |
| DT-B08 | localStorage write denied | in-page selection changes; warning/status; no crash |
| DT-B09 | theme switch while filters/page active | query, facets, page/page-size unchanged |
| DT-B10 | theme switch with batch selection | membership/count/hidden count unchanged |
| DT-B11 | theme switch with Detail open | same card remains open |
| DT-B12 | theme switch with dirty editor | dirty state and unsaved values byte/field-equivalent; no discard prompt |
| DT-B13 | theme switch in GRID | remains GRID and same authoritative result set |
| DT-B14 | theme switch in LIST | remains LIST and same authoritative result set |
| DT-B15 | Select dropdown open in each theme | dropdown matches effective theme; keyboard usable |
| DT-B16 | Drawer open in each theme | mask/header/body/actions coherent |
| DT-B17 | Modal and `Modal.confirm` in each theme | content/header/footer/buttons coherent |
| DT-B18 | External/Variants/Workspace portal surfaces | no opposite-theme island |
| DT-B19 | network capture around theme change | zero POST/PATCH/PUT/DELETE and zero theme-specific Workspace request |
| DT-B20 | Canonical snapshot before/after theme-only interaction | identical |
| DT-B21 | Carder opened with Library preference present | Carder has no Library theme attribute and unchanged presentation contract |
| DT-B22 | OS `prefers-color-scheme` toggled | explicit/stored/fallback result unchanged |
| DT-B23 | narrow viewport | theme control reachable, visible, no horizontal loss of required actions |
| DT-B24 | first-mount observer | correct document theme attribute exists before `#library-root` first non-empty mutation |

### Build/regression gate

At the eventual candidate exact SHA, at minimum:

```text
yarn compile
yarn build
yarn test:library
```

must exit 0.

The post-F04 compatibility review must additionally identify and retain every F-04-specific automated gate. Those tests become mandatory CR-0002 regression gates and must not be replaced by theme tests.

If implementation introduces a separate deterministic theme test command, Project Control/QA must record it and run it in addition to, not instead of, `test:library`.

## 13. Cross-theme functional regression requirements

Theme code must not branch product semantics.

A disposable schema-8 Workspace must execute the following operational smoke sequence once under LIGHT and once under DARK with equivalent functional outcomes:

1. load browse results;
2. search/filter;
3. change page where fixture cardinality permits;
4. select/deselect a result for Batch;
5. switch GRID/LIST after F-04 and preserve selection;
6. open Detail;
7. enter editor, change one field without saving, switch theme, prove dirty value/state preserved;
8. cancel/restore according to existing editor behavior;
9. open and close a Select dropdown;
10. open Review/Confirm or another representative Modal;
11. open Workspace Management;
12. open Variants / Assets;
13. open Needs Attention;
14. inspect External Sources raw/table surface;
15. inspect Library-side Open in Carder readiness controls.

The smoke may avoid destructive mutations. Existing mutation suites remain authoritative and must still pass.

If any product behavior differs by theme beyond presentation/accessibility, candidate disposition is FAIL unless that difference was separately authorized.

## 14. Deterministic browser and visual evidence matrix

### 14.1 Evidence environment

For final External QA, record:

- exact candidate SHA;
- exact post-F04 integrated base SHA;
- OS/runner;
- Node/Yarn;
- browser engine and exact version;
- viewport;
- device scale factor;
- storage seed;
- effective theme;
- Workspace schema/format.

GitHub-hosted Actions is an acceptable evidence substrate. ENV-004 independently demonstrated that an external Playwright harness plus Chromium can execute the real Service + Library + Carder stack without changing target manifests. That readiness does not grant CR-0002 implementation or QA credit; CR-0002 evidence must be rerun against its exact candidate.

### 14.2 Browser matrix

Mandatory behavioral engines:

```text
Chromium
Firefox
```

Record exact versions used.

Mandatory viewports:

```text
Desktop: 1440 × 1000, DPR 1
Narrow:  390 × 844, DPR 1
```

Primary screenshot evidence may use Chromium to avoid cross-engine pixel noise; Firefox remains a behavioral/contrast parity gate.

### 14.3 Required visual scenes

Capture the same fixture/state in LIGHT and DARK for scenes V01–V08:

| Scene | Required visible content |
| --- | --- |
| V01 Browse LIST | header/theme control, browse controls, selected + unselected result, readiness tags, pagination |
| V02 Browse GRID | multiple compact cards, selected state, batch checkbox, readiness/status |
| V03 Detail editor | Drawer, dirty input, validation/error text, keyboard focus |
| V04 Portal controls | Select dropdown open plus representative Modal or confirm dialog |
| V05 External Sources | table, raw/preformatted content, status/diagnostic states |
| V06 Variants / Assets | variant card, Preferred/readiness, role slot, issue/status |
| V07 Workspace / Batch | representative modal with Radio/Checkbox/disabled/action states |
| V08 Narrow shell | theme control, wrapped header actions, browse control, result |

Additional evidence:

- V09 DARK Needs Attention / diagnostic state;
- V10 LIGHT Needs Attention / diagnostic state;
- V11 Carder isolation after Library theme preference is stored.

Screenshots must be full-page or tightly state-scoped, named with theme, scene and candidate SHA prefix/suffix.

### 14.4 Machine-readable evidence accompanying screenshots

Retain:

- DOM/ARIA snapshot for V01, V03 and V04 in both themes;
- computed color/contrast JSON containing the §11 ratios;
- localStorage/effective-theme state for hydration cases;
- network capture for DT-B19;
- Canonical before/after JSON for DT-B20;
- browser console/page errors;
- fixture identity and schema status.

Screenshots alone are insufficient to prove accessibility, persistence or no-mutation behavior.

## 15. Expected production file boundary

The expected production implementation is Library-local.

### Expected/allowed core files

```text
library/index.html
src/library/index.tsx
src/library/app.tsx
src/library/library.scss
src/library/theme.ts            # new, or equivalent Library-local module
```

`library/index.html` need only change if the implementation uses a bounded prepaint/background bootstrap. It is not required if the first-content hydration invariant in §6 is met without it.

### Conditionally allowed Library component edits

Existing files under `src/library/**` may receive bounded semantic class/attribute hooks only when needed to theme a state that cannot be targeted robustly from the shared Library stylesheet.

Examples include the post-F04 Grid/List controls/cards and the post-Tranche-1 graphical Link Marker selector once those exist.

Do not spread theme state through every component as independent local state.

### Expected test/evidence files

Theme tests may extend:

```text
scripts/test-library-client.ts
```

or use a focused new test/evidence script.

External browser evidence tooling may remain outside the product candidate when Project Control uses a proven operational/QA harness.

### Production files not expected to change

Absent a separately documented necessity, CR-0002 must not change:

```text
workspace-server/**
migrations/**
workspace schema/format code
Canonical domain/repositories
Library API contracts
src/service/**
Carder renderer/editor code
Carder-owned styles
index.html                    # Carder entrypoint
package runtime dependencies
```

No runtime theming dependency is expected.

If Development believes a non-Library production file is necessary, STOP before changing it and return the evidence/need to Project Control/DQA for classification.

## 16. Explicit forbidden changes and stop conditions

### Candidate-invalidating forbidden changes

Do not:

- add SYSTEM/AUTO;
- use OS theme preference to override explicit/fallback semantics;
- persist theme in SQLite, `workspace.json`, Canonical state, provenance or Workspace Service;
- add a theme API endpoint;
- create migration 009;
- change schema 8 or Workspace format 1;
- change Carder theming/rendering;
- upgrade Ant Design major version;
- perform general dependency modernization;
- bundle F-04 implementation into the CR-0002 candidate;
- alter browse/filter/pagination/batch/readiness semantics;
- alter status meanings to fit a palette;
- silently write DARK on startup fallback;
- discard dirty editor state on theme switch.

### STOP / return to Project Control or Scope

STOP implementation if any of these becomes necessary:

1. implementation baseline has not passed the post-F04 compatibility gate;
2. F-04 introduces a material product/architecture conflict with this contract;
3. server/API/schema/Workspace persistence is required;
4. Carder code must be themed/refactored;
5. a major Ant Design upgrade is claimed necessary;
6. a shared app-wide theme foundation is claimed necessary beyond the Library entrypoint;
7. a new user-facing theme state is required;
8. required accessibility cannot be achieved without material workflow/layout redesign;
9. theme switching cannot preserve dirty/batch/detail/filter/Grid/List state;
10. a non-Library production dependency is materially required and is not merely a bounded class hook;
11. migration 009 is proposed;
12. Development attempts to start from the obsolete pre-F04 baseline.

Items 3–8 are material architecture/product conflicts and require return to Scope. Implementation-detail changes that preserve all frozen product semantics may be handled by a bounded DQA contract revision after Project Control review.

## 17. Mandatory post-F04 compatibility gate

This section is normative and must be completed before any CR-0002 implementation authorization.

### 17.1 Current design baseline

```text
feature/workspace-v0.1
64cb5f4ca42348c6c403e64e0d61bdff8c32a281
```

This SHA is a design evidence baseline only.

It is **not** the eventual CR-0002 implementation baseline.

### 17.2 Required sequence

```text
CR-0001.4 / F-04
→ External QA PASS
→ authorized integration to feature/workspace-v0.1
→ exact integrated SHA recorded
→ DQA/Project Control compatibility comparison
→ CR-0002 implementation baseline assignment
→ only then may Project Control authorize CR-0002 Development
```

### 17.3 Mandatory comparison

Compare the final integrated post-F04 SHA against `64cb5f4ca42348c6c403e64e0d61bdff8c32a281`.

At minimum inspect:

- `src/library/index.tsx`;
- `src/library/app.tsx`;
- `src/library/library.scss`;
- all F-04-created/modified Library result/view components;
- all F-04 view-mode persistence/client state;
- Library test scripts;
- any Ant Design control/portal introduced by F-04;
- any Tranche-1 Library surface now present, including the graphical Link Marker selector and revised Preferred Variant warning.

The final CR-0002 candidate must theme both:

```text
GRID
LIST
```

including selected/focused/batch/readiness states.

Theme switching must preserve the active F-04 view mode exactly as it preserves filters, page, batch and Detail state.

### 17.4 Compatibility dispositions

If F-04 changes only:

- file/component names;
- class names;
- layout selectors;
- result-card structure;
- view-mode state wiring;
- browser-local view preference independent from theme;

then:

```text
SCOPE REOPEN:
NO

ACTION:
bounded DQA handoff revision permitted
```

If F-04 introduces any material conflict such as:

- theme tied to Workspace/server persistence;
- shared Carder/Library shell requiring Carder changes;
- incompatible dependency/theme framework migration;
- product semantics that make this LIGHT/DARK model insufficient;
- a layout/interaction requirement that cannot satisfy accessibility without changing frozen product behavior;

then:

```text
RETURN TO SCOPE
```

No Development may implement CR-0002 against an obsolete pre-F04 assumption and “reconcile later.”

## 18. Final acceptance criteria

CR-0002 may receive External QA PASS only when all are true on the exact candidate SHA:

1. Light and Dark are explicit accessible choices.
2. exact stored LIGHT loads LIGHT.
3. exact stored DARK loads DARK.
4. missing/invalid/unreadable preference loads DARK.
5. fallback startup performs no storage write.
6. explicit selection applies immediately.
7. explicit selection persists in localStorage when available.
8. write failure is non-blocking and visibly disclosed while current selection remains active.
9. reload/reopen preserves valid explicit choice.
10. theme is not Workspace-specific.
11. no Workspace/domain/API mutation occurs from theme change.
12. first Library content is not rendered in the wrong resolved theme.
13. all Library-owned portal surfaces match the effective theme.
14. LIST is coherent in both themes.
15. GRID is coherent in both themes.
16. filters/page/batch/detail/dirty/view-mode state survive theme changes.
17. full §10 surface matrix has no opposite-theme or unreadable islands.
18. §11 contrast thresholds pass in LIGHT.
19. §11 contrast thresholds pass in DARK.
20. keyboard/focus semantics pass in both themes.
21. status meaning is not color-only.
22. existing Library functional gates pass.
23. post-F04 gates pass unchanged.
24. Carder remains outside the theme mechanism.
25. schema remains 8.
26. Workspace format remains 1.
27. migrations remain 001–008.
28. migration 009 is absent.
29. no server/API persistence change exists.
30. no Ant Design major/general modernization exists.
31. CR-0001.4 remains a separate implementation candidate/history.
32. exact browser/visual/machine-readable evidence required by §§12–14 is retained.

## 19. Scope-reopen finding

```text
SCOPE REOPEN REQUIRED NOW:
NO
```

Reason:

The baseline already supports a bounded Library-only implementation through client state, localStorage, document-scoped semantic CSS and Ant Design 4.9.4 overrides. The separate Library entrypoint provides a clean isolation boundary from Carder.

This finding is conditional on the mandatory post-F04 compatibility gate. A later material F-04 conflict can change the disposition to RETURN TO SCOPE.

## 20. Return to Project Control

Return to:

```text
PROJECT_CONTROL / PC-002
```

with disposition:

```text
CR-0002 DESIGN:
FROZEN / IMPLEMENTABLE / TESTABLE

IMPLEMENTATION AUTHORITY:
NONE

NEW RUN:
NONE

FEATURE/WORKSPACE-V0.1 MOVEMENT:
NONE

MAIN MOVEMENT:
NONE

NEXT CR-0002 ACTION:
wait for F-04 QA-PASS + authorized integration,
then execute §17 compatibility gate and assign exact implementation baseline.
```
