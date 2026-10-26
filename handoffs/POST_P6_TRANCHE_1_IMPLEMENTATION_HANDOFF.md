---
artifact_id: POST-P6-TRANCHE-1-IMPLEMENTATION-HANDOFF
artifact_type: implementation_handoff
status: FROZEN
protocol_version: "1.0"
source_role: DESIGN_QA
source_instance: DQA-001
target_role: PROJECT_CONTROL
target_instance: PC-001
execution_target_role: DEVELOPMENT
control_parent_sha: 2a5d3bd19ea83dc1314c9117d320ed38fcbd2e5c
code_baseline:
  branch: feature/workspace-v0.1
  sha: 64cb5f4ca42348c6c403e64e0d61bdff8c32a281
related_requests:
  - CR-0001.3
  - CR-0001.6
source_artifacts:
  - control/OWNER_DIRECTION_POST_P6_SEQUENCE.md
  - control/POST_P6_ROADMAP_DISPOSITION.md
  - scopes/POST_P6_ROADMAP_REVIEW.md
  - requests/CR-0001-v16.md
  - routing/ROUTE-POST-P6-TRANCHE-1-DQA-001.md
implementation_authorized: false
run_024_authorized: false
migration_009_authorized: false
---

# POST-P6 TRANCHE 1 — FROZEN DESIGN + QA IMPLEMENTATION CONTRACT

Title:

`Focused Editor / Variant UX Completion`

Contents:

- CR-0001.3 / F-03 — Graphical Link Marker selector.
- CR-0001.6 / F-06 — Preferred Variant warning clarity.

Exact design baseline:

`feature/workspace-v0.1 @ 64cb5f4ca42348c6c403e64e0d61bdff8c32a281`

## 1. Scope result

```text
SCOPE REOPEN REQUIRED:
NO

SCOPE DEVIATION:
NONE
```

Both items are implementable inside the frozen architecture boundary as client/UI work only.

Required invariants:

```text
database schema:
8

Workspace format:
1

migrations:
001–008

migration 009:
ABSENT

new API:
NONE

new persistence:
NONE

Carder protocol change:
NONE
```

No server-domain semantic change is required or authorized.

## 2. Baseline observations that bind this contract

At the exact baseline:

- Workspace Canonical editor exposes Link Markers as a numeric multi-select.
- Canonical registry codes are exactly:
  `1, 2, 3, 4, 6, 7, 8, 9`.
- code `5` is absent from the registry and existing Carder mapping rejects `5` / `CENTER`.
- Link Rating is not a writable client field; the editor displays it as the current marker count.
- server validation remains authoritative for Link applicability and confirmation.
- populated `link_markers` are cleared through the existing structural-clearing proposal when moving from LINK to a concrete non-LINK summon kind.
- working-form hydration removes derived `link_rating` and dirty detection compares editable Structure only.
- current Preferred Variant selection uses identity, not readiness.
- an unavailable Preferred Variant remains selected.
- STANDARD and OVERFRAME readiness are independently evaluated on the selected variant.
- no automatic ready-variant fallback exists.
- with no Preferred Variant, a sole variant is selected as an existing convenience; multiple variants have no automatic selection.
- launch-button enablement is driven by dirty state, confirmed-language readiness, selected-variant composition readiness and opening state.

These semantics are frozen unless explicitly changed below.

# PART A — CR-0001.3 / F-03
# Graphical Link Marker selector

## 3. Frozen graphical layout and canonical mapping

The Workspace Canonical editor must replace the numeric Link Marker multi-select with a graphical 3×3 selector whenever Link Markers are applicable.

Canonical visual layout:

```text
1 2 3
4   6
7 8 9
```

Direction mapping:

| Code | Direction |
| --- | --- |
| 1 | Top-Left |
| 2 | Top |
| 3 | Top-Right |
| 4 | Left |
| 6 | Right |
| 7 | Bottom-Left |
| 8 | Bottom |
| 9 | Bottom-Right |

The center cell represents no marker.

```text
CODE 5:
INVALID / NON-MARKER
```

The center cell:
- must not emit `5`;
- must not be selectable;
- must not be used as a reset control;
- must not be part of marker keyboard focus order.

A separate reset/clear-all capability is not part of Tranche 1.

## 4. Marker interaction contract

Each of the eight valid positions is an independent toggle.

Required behavior:
- activating an unselected marker adds that exact canonical string code;
- activating a selected marker removes that exact code;
- multiple markers may be selected simultaneously;
- zero through eight markers are representable while editing a Draft;
- the UI must never synthesize aliases such as TOP_LEFT, LEFT, CENTER or numeric 5 into Workspace state;
- the editable value remains `structure.link_markers: string[]`;
- no new Link Marker representation is introduced.

The selector must render from the current working value and remain controlled by that value.

Hydration/rendering alone must not:
- reorder;
- normalize;
- clear;
- add;
- or otherwise mutate
the current `link_markers` value.

Therefore opening an unchanged Link card must not create dirty state.

## 5. Link Rating contract

Link Rating remains derived only from marker count.

For an applicable LINK working structure:

`displayed Link Rating = link_markers.length`

Required:
- the displayed Link Rating remains read-only/non-editable;
- no `link_rating` input is added;
- no `link_rating` field is sent in editor mutation payloads;
- changing selected markers updates the displayed derived rating immediately;
- selecting all eight valid markers displays 8;
- selecting none displays 0 while editing.

Server-side confirmed-Structure rules remain authoritative. A Draft may temporarily contain zero Link Markers; Review/Confirm must continue to reject a confirmed LINK with no markers.

## 6. Dirty-state and confirmation contract

Graphical marker interaction is an ordinary STRUCTURE edit.

Required:
- changing marker membership makes Structure dirty;
- marker interaction must not mark TEXT, CLASSIFICATION or RELATIONS dirty;
- merely focusing or navigating the selector must not create dirty state;
- rendering an already selected marker must not create dirty state;
- returning the working Structure to the authoritative marker value must restore the existing not-dirty behavior when no other edits exist;
- Save/build-patch behavior remains the existing Canonical editor behavior;
- changing markers in a CONFIRMED STRUCTURE must continue to require the existing explicit transition/acknowledgement before that block can move to Draft;
- cancelling that confirmation must leave authoritative data unchanged.

No special Link-marker persistence path is permitted.

## 7. Applicability transitions

Existing `proposeMonsterApplicability` semantics are frozen.

### non-LINK → LINK

Changing a MONSTER to `summon_kind:LINK` must preserve the current applicability-clearing contract.

Where populated, existing incompatible values are proposed for clearing exactly as today, including:
- Rank where applicable;
- Level;
- DEF;
- PENDULUM ability;
- Pendulum Scale.

The graphical selector becomes applicable only after the LINK working state is actually adopted.

No marker is automatically selected merely because the summon kind becomes LINK.

If no Link Markers existed, the selector begins empty.

### LINK → concrete non-LINK

When a LINK working structure contains markers and the user proposes a concrete non-LINK summon kind:
- all current `link_markers` must appear in the existing structural-clearing proposal;
- Cancel must preserve LINK and the exact marker set;
- Apply change and clear must set `link_markers:[]` and adopt the target summon kind;
- the graphical selector then becomes inapplicable/hidden;
- no marker may survive into a concrete non-LINK structure.

If the LINK structure already has zero markers, no marker-specific destructive-clear prompt is required.

### incomplete / null summon kind

Current incomplete-Draft behavior is preserved.

Changing to `summon_kind:null` must not introduce a new normalization rule or silently destroy values solely for this tranche.

## 8. Keyboard / focus / accessibility contract

The graphical selector must be operable without a pointing device.

Required observable behavior:
- the eight valid marker positions are semantic interactive controls, not click-only `div` elements;
- the selector has an accessible group/field label equivalent to `Link Markers`;
- each control exposes an accessible name containing both direction and code, for example:
  `Top-Left Link Marker (1)`;
- selected state is programmatically exposed using native checked semantics or `aria-pressed`;
- keyboard activation with Space and Enter toggles the focused marker;
- Tab navigation can reach every valid marker in row-major order:
  `1,2,3,4,6,7,8,9`;
- the center cell is skipped;
- focus remains visibly identifiable;
- activation does not unexpectedly move focus away from the marker just toggled.

Arrow-key navigation is optional and is not an acceptance requirement if the component uses ordinary toggle-button/checkbox semantics.

Pointer and keyboard activation must produce identical `link_markers` values.

## 9. Existing structural validation preserved

No server validation change is authorized.

The existing rules must remain true:
- duplicate Link Marker codes are invalid;
- non-LINK concrete summon kinds cannot carry Link Markers;
- confirmed LINK requires at least one Link Marker;
- Link Rating equals marker count;
- marker codes remain controlled by the existing registry;
- code 5 remains unsupported;
- existing Level/Rank applicability remains unchanged;
- LINK still cannot carry Level, Rank, DEF, PENDULUM ability or Pendulum Scale under the supported model.

## 10. Carder / Workspace mapping invariant

No mapping or protocol change is authorized.

Existing mapping must remain:

```text
1 → 1
2 → 2
3 → 3
4 → 4
6 → 6
7 → 7
8 → 8
9 → 9
```

Existing rejection of `5` / `CENTER` remains.

The graphical Workspace selector changes presentation only.

# PART B — CR-0001.6 / F-06
# Preferred Variant warning clarity

## 11. Frozen warning trigger

The composition-specific warning applies when:
- a Preferred Variant identity exists;
- that exact Preferred Variant is the variant currently selected in Open in Carder;
- at least one of its two composition readiness states is not READY.

The warning must not:
- change Preferred Variant identity;
- set/clear a preference;
- select another variant;
- trigger a variant lifecycle API call;
- trigger asset mutation;
- recompute readiness.

The existing informational alert:

`Preferred Variant selected: <display_label>`

remains valid while the Preferred Variant is currently selected.

## 12. Exact composition-specific warning matrix

When the selected variant is the Preferred Variant:

### F06-W1 — STANDARD unavailable only

Input state:

```text
STANDARD = INCOMPLETE
OVERFRAME = READY
```

Required warning text:

`Preferred Variant: STANDARD unavailable; OVERFRAME remains available. It remains selected; choose another variant manually if needed.`

Launch state, assuming language-ready, not dirty and not opening:
- Open Standard: disabled;
- Open Overframe: enabled.

### F06-W2 — OVERFRAME unavailable only

Input state:

```text
STANDARD = READY
OVERFRAME = INCOMPLETE
```

Required warning text:

`Preferred Variant: OVERFRAME unavailable; STANDARD remains available. It remains selected; choose another variant manually if needed.`

Launch state:
- Open Standard: enabled;
- Open Overframe: disabled.

### F06-W3 — both unavailable

Input state:

```text
STANDARD = INCOMPLETE
OVERFRAME = INCOMPLETE
```

Required warning text:

`Preferred Variant: STANDARD and OVERFRAME unavailable. It remains selected; choose another variant manually if needed.`

Launch state:
- Open Standard: disabled;
- Open Overframe: disabled.

### F06-W4 — both ready

Input state:

```text
STANDARD = READY
OVERFRAME = READY
```

Required:
- no availability warning;
- Preferred Variant remains selected;
- existing Preferred Variant informational alert remains;
- both composition buttons are enabled subject only to existing orthogonal gates.

### F06-W5 — no Preferred Variant

No Preferred-specific availability warning is shown.

Existing selection behavior remains:
- zero variants: no variant selected;
- one variant: the sole variant may remain automatically selected as the existing convenience behavior; this does not create a Preferred Variant;
- multiple variants: no array-order/default variant is selected automatically and the existing informational message
  `No Preferred Variant. Select a variant explicitly.`
  remains applicable.

A missing/stale Preferred Variant ID must not silently fall back to another variant.

## 13. Manual alternate-variant behavior

If a Preferred Variant is selected and the user manually selects another variant:
- `preferred_variant_id` remains unchanged;
- the alternate remains the current Open in Carder selection under existing state rules;
- the Preferred availability warning is no longer required while the alternate is selected;
- STANDARD/OVERFRAME enablement is computed from the alternate variant's existing readiness state;
- switching variants must not mutate readiness or persist a new preference;
- the user may manually reselect the Preferred Variant, at which point its appropriate composition warning returns.

No automatic selection of a READY alternate is permitted when the Preferred Variant is incomplete.

## 14. Readiness and launch invariants

Existing readiness computation is frozen:

```text
STANDARD ready
iff selectedVariant.standard.state === READY

OVERFRAME ready
iff selectedVariant.overframe.state === READY
```

Existing launch-button gates remain:

```text
disabled when:
editor dirty
OR confirmed language unavailable
OR selected composition not READY
OR launch already opening
```

The warning is explanatory only.

It must not alter:
- prepare-working-card request shape;
- selected variant ID passed to prepare;
- selected composition passed to prepare;
- confirmed-language logic;
- dirty-editor blocking;
- Carder launch intent;
- success/error handling.

# PART C — Combined acceptance contract

## 15. F-03 acceptance criteria

### F03-AC-01 — layout
A LINK MONSTER editor shows a 3×3 graphical Link Marker selector in the canonical positions 1/2/3, 4/[center]/6, 7/8/9.

### F03-AC-02 — center invalid
The center cannot be selected, cannot receive marker focus, cannot emit code 5 and does not act as reset.

### F03-AC-03 — multi-select
Any combination of the eight valid codes can be selected simultaneously with no duplicate output.

### F03-AC-04 — exact canonical codes
The working value contains only the existing string codes `1,2,3,4,6,7,8,9`.

### F03-AC-05 — hydration
Opening a saved LINK with multiple markers displays exactly those markers selected and does not dirty the editor.

### F03-AC-06 — pointer toggle
Pointer activation toggles only the targeted marker.

### F03-AC-07 — keyboard toggle
Space and Enter toggle only the focused marker and expose selected state accessibly.

### F03-AC-08 — focus order
Tab can reach all eight markers in row-major order while skipping the center, with visible focus.

### F03-AC-09 — derived rating
Displayed Link Rating always equals the current selected-marker count and remains non-editable.

### F03-AC-10 — dirty semantics
Changing marker membership dirties only STRUCTURE; returning to the authoritative structure clears that marker-induced dirty state.

### F03-AC-11 — confirmed Structure
Saving marker changes to confirmed STRUCTURE uses the existing confirmation/Draft transition contract; cancel performs no persistence mutation.

### F03-AC-12 — LINK → non-LINK
A populated marker set is included in the existing clearing confirmation; cancel preserves it, confirm clears it.

### F03-AC-13 — non-LINK → LINK
Existing incompatible structural values use the existing clearing contract and no marker is invented automatically.

### F03-AC-14 — applicability
The graphical marker selector is not shown as editable for concrete non-LINK summon kinds.

### F03-AC-15 — validation
Existing Draft/Review/Confirm Link validation remains unchanged, including confirmed LINK requiring at least one marker.

### F03-AC-16 — Carder mapping
Existing Workspace→Carder marker mapping stays byte/semantic compatible and code 5 remains rejected.

## 16. F-06 acceptance criteria

### F06-AC-01
STANDARD unavailable only produces exactly F06-W1 and does not change selected/preferred identity.

### F06-AC-02
OVERFRAME unavailable only produces exactly F06-W2.

### F06-AC-03
Both unavailable produces exactly F06-W3.

### F06-AC-04
Both READY produces no warning.

### F06-AC-05
Each warning matrix state preserves the existing composition-button enablement.

### F06-AC-06
Warning rendering performs no API mutation and causes no readiness recomputation.

### F06-AC-07
An incomplete Preferred Variant remains selected even if another variant is READY.

### F06-AC-08
Manual alternate selection remains manual, does not modify preference and uses the alternate's readiness.

### F06-AC-09
No Preferred + multiple variants preserves no-default-selection behavior and existing explicit-selection info.

### F06-AC-10
No Preferred + sole variant preserves the existing sole-variant convenience without creating a preference.

### F06-AC-11
Missing Preferred identity does not silently fall back to another variant.

### F06-AC-12
Prepare/launch requests retain the exact selected variant and composition and are not affected by warning copy.

## 17. Combined regression acceptance

The tranche must additionally preserve:

- CR-0001.2 Level/Rank bounds and no-clamp behavior;
- current Pendulum applicability and structural clearing;
- ATK/DEF applicability;
- ability editing;
- Canonical dirty detection and reload/conflict behavior;
- confirmed-block acknowledgement behavior;
- Review/Confirm semantics;
- Spell/Trap subtype editing;
- current Preferred Variant set/change/clear lifecycle;
- variant rename/remove lifecycle;
- readiness computation;
- asset resolution state;
- Open in Carder dirty blocking;
- confirmed-language gating;
- Carder prepare/write-back mapping;
- existing NORMAL Spell/Trap renderer correction;
- existing Carder write-back behavior.

No regression in these surfaces may be accepted as incidental to Tranche 1.

# PART D — Validation and evidence contract

## 18. Required automated Development validation

At the exact implementation candidate SHA, Development must run at minimum:

```text
yarn compile
yarn build
yarn test:sc
yarn test:library
yarn --cwd workspace-server compile
yarn --cwd workspace-server test
```

All must exit 0.

Development must add focused deterministic automated coverage for every F03-AC and F06-AC item that can be asserted without visual inspection.

At minimum focused automated evidence must prove:

### F-03
- exact code↔position mapping;
- no code 5 control/output;
- multiple simultaneous markers;
- pointer-equivalent state helper behavior if helper exists;
- derived rating count;
- no hydration-induced dirty state;
- marker change dirties STRUCTURE only;
- LINK↔non-LINK clearing proposal behavior;
- existing Review/Confirm server validation unchanged;
- existing Carder marker mapping unchanged.

### F-06
- all four Preferred readiness combinations;
- exact warning message chosen for the three incomplete combinations;
- both-ready no warning;
- no-Preferred zero/one/multiple variant behavior;
- missing Preferred identity no fallback;
- manual alternate selection preserves preference;
- button readiness remains selected-variant composition-specific;
- no automatic READY fallback.

## 19. Mandatory deterministic browser evidence

Operational/browser evidence is required because this tranche changes visible interaction and accessibility.

Owner-manual validation is NOT required.

Development should produce exact-SHA deterministic browser evidence when feasible. If the Development environment cannot produce independently auditable evidence, External QA must route only the missing browser delta to DEPLOYMENT_VALIDATION.

Required browser cases:

### T1-OP-01 — Graphical LINK selector baseline
Open an actual Canonical LINK card with at least three saved markers distributed across the grid.
Capture:
- full editor screenshot;
- selected-state DOM/accessibility data;
- authoritative/working marker values;
- displayed Link Rating;
- proof editor is initially not dirty.

### T1-OP-02 — pointer marker edit
Toggle one unselected marker, then toggle it back.
Prove:
- correct code membership;
- Link Rating +1 then restore;
- dirty true then restore to false when no other edit exists;
- no persistence request before Save.

### T1-OP-03 — keyboard/accessibility
Using browser keyboard input only:
- focus each valid marker in row-major order;
- prove center is skipped;
- Space or Enter toggles a marker;
- selected state is exposed programmatically;
- visible focus exists;
- focus remains on the activated marker.

Capture accessibility/DOM metadata plus screenshot.

### T1-OP-04 — LINK applicability transition
Starting with populated Link Markers:
- propose LINK → a concrete non-LINK summon kind;
- capture the structural-clearing dialog containing `link_markers`;
- Cancel and prove markers/LINK remain;
- repeat and confirm, proving markers become [] and picker disappears;
- prove no server write occurs until ordinary Save.

Also exercise non-LINK → LINK with at least one incompatible populated structural value and prove the existing clearing flow remains.

### T1-OP-05 — confirmed Structure save
On a confirmed LINK Structure:
- change one marker;
- Save through the existing confirmation path;
- capture actual request/response;
- prove only existing STRUCTURE semantics are used;
- prove no `link_rating` client input is sent;
- reread Canonical state and prove marker set plus server-derived Link Rating are correct.

### T1-OP-06 — Preferred warning matrix
Using actual Library/Open in Carder UI, demonstrate:
1. STANDARD unavailable only;
2. OVERFRAME unavailable only;
3. both unavailable;
4. both READY.

Capture exact warning text and both button disabled/enabled states for each case.

### T1-OP-07 — no Preferred / manual alternate
Demonstrate:
- no Preferred with multiple variants → no default selection + explicit-selection info;
- no Preferred with sole variant → sole-variant convenience remains;
- incomplete Preferred remains selected even when another READY variant exists;
- manual alternate selection changes only current UI selection, not Preferred identity;
- after manual alternate selection, launch enablement follows alternate readiness.

No owner Workspace may be used. Use disposable fixtures.

## 20. Development evidence package

Development's implementation report must include:

- exact incoming baseline SHA;
- exact implementation candidate SHA;
- complete changed-file list;
- per-file reason;
- proof no unexpected production path changed;
- proof no server/API/persistence/migration/lockfile change occurred;
- exact compile/build/test command results;
- focused F-03/F-06 test inventory with pass counts;
- deterministic browser case results T1-OP-01..07;
- screenshots and machine-readable DOM/request/state evidence;
- exact browser/OS/Node/Yarn versions;
- exact candidate HEAD and clean working-tree proof before/after browser execution;
- schema/workspace/migration/version invariants;
- known warnings or limitations;
- explicit statement whether any browser case could not be executed.

If any required browser case is absent, Development must not label the evidence gap as PASS; return the missing evidence clearly for External QA routing.

# PART E — Recommended implementation boundary

## 21. Recommended production boundary

Expected product changes should remain within the client/UI layer.

Likely acceptable existing files:
- `src/library/editor-form.tsx`;
- `src/library/editor-state.ts` only if a pure UI/state helper is necessary without changing domain semantics;
- `src/library/open-in-carder.tsx`;
- `src/library/library.scss`;
- optional new client-only component/helper files under `src/library/`.

Focused test/script changes are expected.

The existing Carder graphical picker may be visually referenced or adapted, but it is not compliant as-is with this contract because:
- its center currently acts as reset;
- its marker cells are click-only divs rather than keyboard-accessible semantic controls;
- it is internally stateful from `defaultValue`, while Workspace needs controlled working-form synchronization.

Preferred implementation boundary:
- implement a Workspace-controlled graphical selector or safely adapt shared visual logic without changing Carder behavior.

If Development modifies shared `src/component/link-marker/*` or other Carder UI code, it must prove existing Carder behavior did not regress and explain why a Workspace-local implementation was insufficient.

## 22. Explicitly unauthorized production changes

Without a new Project Control/Scope route, Development must not change:

- `workspace-server/src/**` production behavior;
- migrations;
- schema/version constants;
- Workspace format;
- variant lifecycle persistence;
- Preferred Variant persistence semantics;
- readiness computation service logic;
- Workspace/Carder bridge protocol shape;
- Carder write-back protocol;
- package manifests or lockfiles;
- external source behavior;
- Tranche 2 Library Grid/List behavior.

Any discovered necessity for such a change is:

```text
SCOPE REOPEN REQUIRED
```

and must return to PROJECT_CONTROL / PC-001 before implementation.

# PART F — Authority boundary

## 23. Non-authorizations

This handoff freezes design only.

```text
RUN 024:
NOT AUTHORIZED

IMPLEMENTATION BRANCH:
NOT AUTHORIZED

DEVELOPMENT:
NOT AUTHORIZED

TRANCHE 2 IMPLEMENTATION:
NOT AUTHORIZED

MIGRATION 009:
NOT AUTHORIZED

MAIN INTEGRATION:
NOT AUTHORIZED
```

Project Control must separately authorize any Development branch and execution.

## 24. Frozen Design + QA result

```text
POST-P6 TRANCHE 1 DESIGN CONTRACT:
FROZEN

BASELINE:
feature/workspace-v0.1
64cb5f4ca42348c6c403e64e0d61bdff8c32a281

CR-0001.3 / F-03:
IMPLEMENTABLE / TESTABLE CONTRACT FROZEN

CR-0001.6 / F-06:
IMPLEMENTABLE / TESTABLE CONTRACT FROZEN

ARCHITECTURE:
CLIENT/UI ONLY

SCOPE DEVIATION:
NONE

SCOPE REOPEN REQUIRED:
NO

MANDATORY BROWSER EVIDENCE:
YES — T1-OP-01..T1-OP-07

OWNER-MANUAL EVIDENCE:
NO

NEXT AUTHORITY:
PROJECT_CONTROL / PC-001
```
