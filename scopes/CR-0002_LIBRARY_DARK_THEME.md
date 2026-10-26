---
artifact_id: CR-0002-LIBRARY-DARK-THEME
artifact_type: scope_decision
status: FROZEN
protocol_version: "1.0"
source_role: SCOPE_ARCHITECTURE
source_instance: SCOPE-001
target_role: PROJECT_CONTROL
target_instance: PC-002
control_parent_sha: e48cc0fe3d18beb8421379901f8649e8631541e8
code_baseline:
  branch: feature/workspace-v0.1
  sha: 64cb5f4ca42348c6c403e64e0d61bdff8c32a281
related_requests:
  - CR-0002
related_scopes:
  - scopes/POST_P6_ROADMAP_REVIEW.md
supersedes: null
created_at: "2026-10-26T07:53:00Z"
approved_at: "2026-10-26T07:53:00Z"
---

# SCOPE DECISION — CR-0002
## Library Dark Theme

## 1. Authority and boundary

This artifact freezes the product and architecture scope for:

`CR-0002 — Library Dark Theme`.

Exact product baseline reviewed:

```text
feature/workspace-v0.1
64cb5f4ca42348c6c403e64e0d61bdff8c32a281
```

Current Project Control state at intake:

```text
RUN 024:
AUTHORIZED / IMPLEMENTATION NOT COMPLETED / ENV-004 READINESS ROUTE

CR-0001.4 / F-04:
IN_SCOPE / TRANCHE 2 / IMPLEMENTATION NOT AUTHORIZED

CR-0002:
ACKNOWLEDGED / SCOPE REVIEW REQUIRED
```

CR-0002 is a parallel planning item.

This artifact does not modify, delay, supersede or broaden RUN 024.

It does not authorize implementation, a new RUN, branch creation, schema change, migration, ref movement or main integration.

## 2. Current implementation evidence

At the reviewed code baseline:

- Library is built as a separate Vite entrypoint from Carder:
  - `library/index.html` mounts `#library-root` and `src/library/index.tsx`;
  - Carder uses the separate root `index.html` / `#root`.
- Library imports Ant Design `4.9.4` and its global Ant Design stylesheet.
- Library also owns `src/library/library.scss`.
- Current Library styling is predominantly light and contains multiple hard-coded light-background, text, border, selection and status colors.
- Library owns multiple Ant Design overlays and portal-based surfaces including Drawers, Modals, Select dropdowns, confirmation dialogs and related controls.
- No existing browser-local Library theme preference was found at the reviewed baseline.
- No Workspace/server/domain state currently represents a visual theme.

Therefore CR-0002 can remain a bounded Library client/UI capability. A shared Library-only theming mechanism is architecturally justified, but it must not become an application-wide/Carder theme project.

## 3. Product disposition

```text
CR-0002:
IN_SCOPE
```

Product objective:

```text
The user can explicitly select LIGHT or DARK appearance for the YU3DOH Workspace Library.
```

This is a presentation preference only.

It does not alter Canonical data, Workspace identity, Workspace state, assets, variants, Carder content, confirmation state, revisions or provenance.

## 4. Exact user-facing surface boundary

### 4.1 IN SCOPE — Library entrypoint

The theme applies to the complete user-facing YU3DOH Workspace Library experience rendered from the Library entrypoint.

This includes, where present:

- Library page/background and shell;
- Library header and Workspace status presentation;
- browse/search/filter controls;
- pagination;
- result cards / result presentation;
- batch-selection toolbar;
- empty/loading/error/unavailable states;
- selected/focused result states;
- Detail Drawer;
- Canonical read-only detail;
- Canonical editor;
- New Draft;
- Review / Confirm surfaces;
- confirmation and acknowledgement dialogs;
- Classification and Relations editing surfaces;
- Sources / Provenance;
- External Sources;
- External Structure acceptance/review surfaces;
- Variants / Assets;
- asset ingest;
- asset resolution;
- managed-asset mutation/review surfaces;
- Variant lifecycle;
- Needs Attention;
- Workspace Management;
- Batch Classification;
- Library-side Open in Carder panel and controls;
- buttons, inputs, numeric inputs, checkboxes, radio controls, selects, tags, tables, alerts, tooltips/popovers and similar UI used by Library;
- Library-owned modal/drawer/dropdown/portal overlays even when the UI library mounts those nodes outside the literal `#library-root` DOM subtree;
- all normal, hover, focus, selected, disabled, warning, success, error and informational states exposed by Library.

The scope follows product ownership, not only DOM ancestry: an overlay invoked by Library is part of the Library theme.

### 4.2 Explicitly OUT OF SCOPE — Carder

Carder is explicitly OUT.

CR-0002 does not theme or redesign:

- the Carder entrypoint;
- Carder editor chrome;
- card renderer;
- rendered/exported card artwork;
- Carder dialogs/panels;
- Carder theme variables;
- Carder-generated images;
- Workspace→Carder visual semantics.

The Library-side `Open in Carder` panel is IN because it belongs to Library.

The launched Carder experience itself is OUT.

### 4.3 Other OUT-OF-SCOPE surfaces

Also OUT:

- Workspace Service/server console output;
- SQLite/database representation;
- filesystem assets;
- external-provider content;
- operating-system UI;
- browser chrome;
- product documentation theming;
- global application redesign;
- Carder/Library visual unification beyond what is necessary for Library itself.

## 5. Theme state contract

CR-0002 v1 exposes exactly two user-selectable states:

```text
LIGHT
DARK
```

### LIGHT

LIGHT preserves the existing light-presentation intent.

Implementation may normalize inconsistent current hard-coded colors into semantic theme values, but LIGHT must remain recognizably equivalent to the current Library presentation and must not become a visual redesign under the guise of theming.

### DARK

DARK provides a coherent dark visual treatment for the full IN-SCOPE Library surface.

Dark mode is not merely:

```text
dark page background
```

while leaving cards, drawers, modals, tables, selects or overlays in incompatible light styling.

All in-scope surfaces must remain visually coherent and usable.

### Default

When no valid stored preference exists:

```text
default = LIGHT
```

This preserves existing behavior for current users.

## 6. SYSTEM / AUTO disposition

```text
SYSTEM / AUTO:
OUT_OF_SCOPE FOR CR-0002
```

Rationale:

The Owner requested a user-selectable dark theme. Explicit LIGHT/DARK satisfies that request without adding:

- OS preference detection;
- media-query change listeners;
- precedence semantics between explicit selection and system state;
- runtime switching triggered outside the application;
- a third theme state that requires additional QA combinations.

A future SYSTEM/AUTO option may be considered through a separate request.

It must not be silently added to CR-0002.

## 7. Preference lifetime and persistence boundary

The selected theme is a user-agent presentation preference.

Frozen lifetime:

```text
browser-local
persistent across Library reloads/reopens in the same browser/profile
not Workspace-specific
not server-synchronized
```

Required behavior:

1. explicit user selection takes effect immediately in Library;
2. selection survives normal page reload and later Library reopen in the same browser/profile;
3. the preference applies regardless of which Workspace root the same Library client later connects to;
4. a missing, invalid or unavailable stored preference falls back safely to LIGHT;
5. preference failure must not block Library startup or Workspace access.

The theme preference must NOT be stored in:

- SQLite;
- Workspace database tables;
- `workspace.json`;
- Canonical domain;
- Workspace Service;
- Workspace backup/restore state;
- provenance;
- revisioned data.

No API is required for theme persistence.

Exact browser-storage mechanism/key belongs to Design + QA / Development.

Cross-device, cross-browser or account synchronization is OUT.

## 8. Theme selection UX

A discoverable user-facing theme control must exist within the Library shell.

It must allow explicit selection of:

```text
LIGHT
DARK
```

The control must be available without entering Canonical edit mode or mutating Workspace data.

Changing theme:

- must not dirty the Canonical editor;
- must not affect batch selections;
- must not alter filters, pagination or Detail selection;
- must not call Workspace mutation APIs;
- must not change revisions;
- must not close/open a different Workspace.

Exact control type, iconography and placement belong to Design + QA, provided the control remains discoverable and accessible.

## 9. Accessibility and contrast contract

Both LIGHT and DARK are first-class supported themes.

DARK must not be accepted merely because text is visible on a dark background.

Design + QA must freeze measurable accessibility validation consistent with WCAG AA contrast expectations.

Minimum Scope outcomes:

- normal text and critical textual content provide at least 4.5:1 contrast against their effective background where WCAG contrast applies;
- large text may use the corresponding 3:1 threshold;
- meaningful non-text UI boundaries, controls and focus indicators provide sufficient contrast, targeting at least 3:1 where applicable;
- keyboard focus remains clearly visible in both themes;
- selected vs unselected states remain distinguishable;
- enabled vs disabled states remain distinguishable;
- warning/error/success/info states remain distinguishable from surrounding UI;
- meaning must not depend on color alone;
- links remain distinguishable from surrounding text/state;
- input values, placeholders, labels and validation messages remain readable;
- table headers/body/separators remain understandable;
- modal/drawer/dropdown boundaries remain visually clear;
- tags/badges/readiness states remain legible;
- hover/focus/active styles must not reduce readability below acceptable levels.

Existing semantic status meaning must not change because the palette changes.

Accessibility must be validated in both theme states, not inferred from token definitions alone.

## 10. Architecture boundary

CR-0002 is expected to remain:

```text
client / UI only
```

Frozen architecture footprint:

```text
database schema:
8

Workspace format:
1

migrations:
001–008

migration 009:
NONE

new Workspace API:
NONE

new Workspace persistence:
NONE

Canonical changes:
NONE

Carder protocol changes:
NONE
```

### Shared Library theme mechanism

A bounded shared Library theme abstraction is IN SCOPE as enabling architecture.

The implementation should not require each component to invent unrelated dark colors.

The intended architecture is:

```text
one Library theme state
→ semantic Library presentation values/tokens
→ Library-owned surfaces and third-party controls rendered by Library
```

Exact implementation may use CSS custom properties, scoped classes, Ant Design-compatible overrides, provider/context state or an equivalent mechanism determined by Design + QA.

Scope does not require a specific implementation technology.

### Dependency constraint

An Ant Design major upgrade or general dependency modernization is NOT part of CR-0002.

Current baseline uses Ant Design 4.9.4.

If Design + QA determines that CR-0002 cannot be implemented cleanly without:

- a major Ant Design upgrade;
- broad app-wide stylesheet replacement;
- Carder theme refactoring;
- server/persistence changes;

then:

```text
STOP
RETURN TO SCOPE
```

Do not hide an architectural expansion inside theme implementation.

## 11. Hard-coded Library styling

The existing light stylesheet contains hard-coded colors.

CR-0002 authorizes refactoring those Library-specific visual literals into a bounded semantic theme system where needed to support LIGHT/DARK coherently.

This refactor is IN only when it preserves existing product behavior.

It is not authority to redesign:

- spacing;
- information architecture;
- workflows;
- component hierarchy;
- unrelated layout;
- brand identity;
- interaction semantics.

## 12. Relationship to CR-0001.4 / F-04 Grid/List

Decision:

```text
DO NOT BUNDLE CR-0002 WITH CR-0001.4 IN ONE IMPLEMENTATION CANDIDATE.
```

CR-0001.4 changes Library result layout and responsive interaction.

CR-0002 changes the visual/theme system across the entire Library surface.

Although both are presentation work, bundling them would combine two independent regression dimensions:

```text
layout / interaction
×
theme / contrast
```

That would complicate defect attribution and QA.

### Recommended sequencing

```text
CR-0001.4 / F-04 Grid/List
→ validated + authorized integration
→ CR-0002 Library Dark Theme
```

Reason:

Dark-theme work should be frozen/validated against the final selected Grid/List presentation so the theme covers both result modes once, rather than styling the pre-Grid/List browse presentation and immediately reopening it.

This recommendation does not authorize CR-0001.4 implementation and does not modify its current Project Control state.

CR-0002 should become a separate later improvement tranche if Project Control accepts the sequencing.

Suggested planning label only:

```text
NEXT IMPROVEMENT TRANCHE — RUN NUMBER PENDING PROJECT CONTROL AUTHORIZATION
Library Theme Completion
```

No RUN number is assigned or authorized by Scope.

## 13. Regression surface

Design + QA must treat the following as primary regression areas:

### Theme-state behavior

- first load with no preference;
- explicit LIGHT selection;
- explicit DARK selection;
- reload persistence;
- invalid/missing preference fallback;
- no Workspace/network mutation on theme change.

### Library core

- browse/results;
- search/filters;
- pagination;
- result selection;
- batch selection;
- empty/loading/error states.

### Detail/editor

- Drawer;
- read-only Canonical;
- editor;
- dirty state;
- validation states;
- Review/Confirm;
- confirmations/acknowledgements.

### Workspace operational UI

- Workspace Management;
- backup/restore/migration/initialization surfaces;
- maintenance warnings/fences.

### External Source

- retrieval/history;
- raw evidence;
- diff;
- TEXT apply review;
- STRUCTURE preview/apply;
- tables/diagnostics.

### Assets/Variants

- Variants / Assets;
- Preferred state;
- readiness tags;
- ingest;
- Needs Attention;
- asset resolution;
- lifecycle modals.

### Library-side Carder launch

- selected variant;
- language;
- Standard/Overframe readiness;
- warnings/errors;
- launch buttons.

### Third-party/portal surfaces

- Modal;
- Drawer;
- Select dropdowns;
- confirmation dialogs;
- overlays/tooltips/popovers used by Library.

### Accessibility

- contrast;
- keyboard focus;
- disabled/selected/readiness distinctions;
- non-color-only semantics.

### Cross-theme functional invariance

All existing supported Library actions must behave identically in LIGHT and DARK except for presentation.

No test may treat successful styling as authority to change functional semantics.

## 14. IN SCOPE

```text
Library LIGHT theme support
Library DARK theme support
explicit user theme selector
browser-local theme persistence
default LIGHT fallback
full Library-owned surface coverage
Library-owned portal/overlay coverage
semantic Library theme abstraction
Library-specific hard-coded color refactor where required
WCAG-AA-oriented contrast/focus/state validation
LIGHT/DARK regression coverage
```

## 15. OUT OF SCOPE

```text
Carder theming
Carder renderer changes
global application redesign
SYSTEM/AUTO theme
OS theme synchronization
cross-device/account theme sync
Workspace/database preference persistence
new Workspace API
schema change
migration 009
custom color picker
custom themes
multiple dark variants
scheduled theme switching
new brand/design language
unrelated layout redesign
Grid/List implementation itself
RUN 024 scope changes
documentation refresh execution
main integration
```

## 16. DEFERRED

The following may be considered later only through separate authority:

```text
SYSTEM/AUTO
Carder dark theme
cross-device/account synchronization
user-defined palettes/themes
theme scheduling
```

DEFERRED is not implemented/resolved.

## 17. Acceptance-level outcomes

External Design + QA must derive a technical/acceptance contract that proves at minimum:

1. LIGHT is available explicitly.
2. DARK is available explicitly.
3. first use/no valid preference defaults to LIGHT.
4. explicit theme selection takes effect without Workspace mutation.
5. preference survives Library reload/reopen in the same browser/profile.
6. theme choice is not stored in Workspace/database/server state.
7. invalid/unavailable local preference falls back safely to LIGHT.
8. browse/results are coherent in both themes.
9. Detail Drawer and editor are coherent in both themes.
10. all Library modals/dialogs are coherent in both themes.
11. Select/dropdown/portal overlays opened from Library are coherent in both themes.
12. tables and raw/preformatted evidence remain readable.
13. External Sources surfaces remain readable.
14. Variants/Assets/Needs Attention surfaces remain readable.
15. Workspace Management remains readable.
16. Library-side Open in Carder remains readable.
17. focus is visible in both themes.
18. selected/disabled/error/warning/success/info states remain distinguishable.
19. status meaning is not conveyed by color alone.
20. required contrast targets are demonstrated for representative critical surfaces.
21. switching theme preserves filters, pagination, selection, batch state, Detail state and dirty Canonical state.
22. switching theme performs no Canonical/Asset/Variant/Workspace mutation.
23. Carder presentation remains unchanged.
24. schema remains 8.
25. Workspace format remains 1.
26. migrations remain 001–008.
27. migration 009 remains absent.
28. no server/API change is introduced.
29. no major dependency upgrade is introduced under CR-0002.
30. CR-0001.4 remains a separate implementation scope.

## 18. Documentation interaction

Project Control has already frozen a pre-Release-Hardening README reconciliation requirement.

CR-0002 does not require a separate transient README rewrite merely for planning.

If CR-0002 is selected, implemented, QA-PASS and integrated before Release Hardening, the final pre-hardening documentation refresh should describe the user-selectable Library theme where relevant.

This artifact does not authorize documentation edits now.

## 19. Owner decision status

No additional Owner product decision is required to define CR-0002 v1.

Scope has resolved:

- surface = Library only;
- states = LIGHT/DARK;
- SYSTEM/AUTO = OUT;
- persistence = browser-local;
- accessibility = first-class requirement;
- Carder = OUT;
- architecture = client/UI only;
- bundling = separate from Grid/List;
- sequencing recommendation = after CR-0001.4.

Project Control retains authority over whether and when this proposed scope enters the roadmap execution sequence.

## 20. Formal disposition

```text
CR-0002:
SCOPE FROZEN

DISPOSITION:
IN_SCOPE

TITLE:
Library Dark Theme

USER-FACING STATES:
LIGHT
DARK

DEFAULT:
LIGHT

SYSTEM / AUTO:
OUT_OF_SCOPE

PREFERENCE LIFETIME:
BROWSER-LOCAL
PERSISTENT ACROSS LIBRARY RELOAD/REOPEN
NOT WORKSPACE-SPECIFIC

WORKSPACE / DATABASE PERSISTENCE:
NONE

SERVER / API CHANGE:
NONE

CARDER:
EXPLICITLY OUT_OF_SCOPE

ACCESSIBILITY:
REQUIRED
LIGHT + DARK

ARCHITECTURE:
CLIENT / UI ONLY
BOUNDED LIBRARY THEME ABSTRACTION AUTHORIZED

CR-0001.4 BUNDLING:
NO

RECOMMENDED SEQUENCE:
CR-0001.4 INTEGRATED FIRST
THEN CR-0002 AS SEPARATE TRANCHE

DATABASE SCHEMA:
8

WORKSPACE FORMAT:
1

MIGRATIONS:
001–008

MIGRATION 009:
NOT REQUIRED / NOT AUTHORIZED

RUN 024:
UNCHANGED / INDEPENDENT

IMPLEMENTATION:
NOT AUTHORIZED

READY FOR DESIGN + QA:
YES, AFTER PROJECT CONTROL ROUTING/AUTHORIZATION

OWNER DECISION BLOCKING:
NONE

MAIN INTEGRATION:
NOT AUTHORIZED
```

## 21. Next gate

Return to:

`PROJECT_CONTROL / PC-002`

Recommended Project Control action:

- register CR-0002 as `IN_SCOPE / SCOPE FROZEN`;
- preserve RUN 024 independently;
- preserve CR-0001.4 as separate Tranche 2;
- decide sequencing/roadmap authorization for a later CR-0002 tranche;
- when authorized for design work, route this frozen scope to External Design + QA.

No implementation authority is created by this artifact.
