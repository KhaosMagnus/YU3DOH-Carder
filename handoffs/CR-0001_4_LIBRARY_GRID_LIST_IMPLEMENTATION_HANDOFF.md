---
artifact_id: CR-0001-4-LIBRARY-GRID-LIST-IMPLEMENTATION-HANDOFF
artifact_type: implementation_handoff
status: FROZEN
protocol_version: "1.0"
source_role: DESIGN_QA
source_instance: DQA-003
target_role: PROJECT_CONTROL
target_instance: PC-002
execution_target_role: DEVELOPMENT
control_parent_sha: 7b1af8855be6a784b51f2b96aea389d19bc1ce76
code_baseline:
  branch: feature/workspace-v0.1
  sha: e07140d5a9555a17b7b2306a45625c14adfafc8e
related_requests:
  - CR-0001.4
source_artifacts:
  - PROJECT_STATE.md
  - requests/CR-0001-v18.md
  - scopes/POST_P6_ROADMAP_REVIEW.md
  - control/OWNER_AUTH_CR_0001_4_DESIGN.md
  - backlog/BACKLOG.md
  - roles/DESIGN_QA.md
  - protocols/COMMUNICATION_PROTOCOL.md
  - chats/instances/DQA-003.md
  - routing/ROUTE-CR-0001-4-DQA-003.md
implementation_authorized: false
run_assigned: false
migration_009_authorized: false
---

# CR-0001.4 / F-04 — Library Grid/List
# FROZEN DESIGN + QA IMPLEMENTATION CONTRACT

## 1. Formal disposition

DESIGN CONTRACT:
FROZEN

IMPLEMENTABLE:
YES

TESTABLE:
YES

SCOPE REOPEN REQUIRED:
NO

EXACT BASELINE CONSUMED:

feature/workspace-v0.1
e07140d5a9555a17b7b2306a45625c14adfafc8e

MAIN OBSERVED:

54cc3aad246c89a29f2a18be63c539db68cae041

The live feature/workspace-v0.1 ref was verified at the exact design SHA before freezing this contract.

No implementation authority is granted by this handoff.

## 2. Frozen architecture boundary

F-04 is client/UI presentation work only.

The following remain invariant:

- database schema: 8;
- Workspace format: 1;
- migrations: 001–008;
- migration 009: absent / not authorized;
- new server fields: none;
- API contract changes: none;
- domain semantic changes: none;
- Carder protocol changes: none;
- Workspace persistence: none;
- readiness computation: unchanged;
- browse/search/filter semantics: unchanged;
- pagination semantics: unchanged;
- batch membership semantics: unchanged;
- frozen revisions selected for Batch: unchanged;
- selected Detail identity semantics: unchanged;
- Canonical/domain state: unchanged.

## 3. Binding baseline observations

At e07140d5a9555a17b7b2306a45625c14adfafc8e:

1. Library results are rendered by src/library/app.tsx as one full-width .library-card article per result.
2. src/library/library.scss uses .library-results { display: grid; gap: 12px; } with no user-selectable view mode and no multi-column result-card layout.
3. Library browse state is held in filters with:
   - preferredLanguage = EN;
   - limit = 50;
   - offset = 0.
4. Pagination derives current page from offset/limit and currently disables the page-size changer.
5. Changing search or any browse facet resets offset to 0 through the existing updateFilter behavior.
6. Changing page modifies only offset.
7. selectedCardId and detailOpen are independent client state. Ordinary search/filter/page transitions do not clear the selected Detail identity.
8. batchSelection is an independent Map keyed by card_id.
9. Batch selection stores the revision observed at explicit selection time and does not replace that frozen revision merely because browse results refresh.
10. Batch selections already survive page/filter transitions; hiddenBatchCount reports selected cards absent from the current visible result page.
11. The browse summary already provides all data needed for F-04:
    - card_id;
    - revision;
    - family;
    - password;
    - display_name;
    - display_language;
    - classifications;
    - variant_count;
    - STANDARD readiness boolean;
    - OVERFRAME readiness boolean.
12. Existing result states are loading, error, empty-library, no-match and results.
13. Existing row content exposes display name, family, password or Token/no-password identity, display language, classifications, variant count and STANDARD/OVERFRAME readiness.
14. No additional API field or server computation is necessary to implement the frozen F-04 outcomes.

These observations are implementation evidence, not permission to alter their semantics.

## 4. Results-view control

The Library must expose one explicit view control immediately after the browse/filter controls and before the Batch toolbar.

Visible group label:
View

Accessible group label:
Library results view

Required options, in this visible order:

1. Grid
2. List

Required values:

- GRID
- LIST

The control must use native radio semantics or an equivalent accessible single-choice control. Ant Design Radio.Group / Radio.Button is acceptable on the current dependency baseline.

Only one mode may be active.

Changing mode must be immediate and must not require Apply/Save/Refresh.

## 5. Initial/default mode and preference behavior

Initial/default mode:
LIST

For F-04, view mode is component/session presentation state only.

Required behavior:

- every fresh LibraryApp mount starts in LIST;
- switching mode remains effective for the life of that mounted LibraryApp;
- browser reload/remount returns to LIST;
- no localStorage or sessionStorage persistence is required or authorized by this contract;
- no URL/query-string persistence is introduced;
- no Workspace, SQLite, workspace.json, server or Canonical persistence is introduced.

The frozen Scope permitted browser-local persistence but did not require it. DQA-003 deliberately freezes the smaller deterministic behavior above to avoid unnecessary persistence surface.

A later proposal to add cross-reload browser-local view preference is a Design-contract change and must return to Project Control/DQA before implementation. It does not silently become part of F-04.

## 6. LIST contract

LIST is the information-rich row mode and must preserve the current result information or equivalent immediately visible access.

Every visible List result must expose, without opening Detail:

- display name;
- family;
- password when present;
- explicit Token/no-password identity when family is TOKEN and password is null;
- display language when present;
- every archetype tag in the current summary;
- every effect-classifier tag in the current summary;
- every functional tag in the current summary;
- variant count;
- STANDARD readiness as textual READY or incomplete;
- OVERFRAME readiness as textual READY or incomplete;
- Batch checkbox;
- selected-Detail visual state when this card is the selected Detail identity.

List remains one result per row at all supported viewport widths.

F-04 must not remove information from LIST merely to share markup with GRID.

## 7. GRID contract

GRID is a compact browsing mode.

Every visible Grid card must expose, without opening Detail:

- display name;
- family;
- password when present;
- explicit Token/no-password identity when applicable;
- display language when present;
- variant count;
- STANDARD readiness as textual READY or incomplete;
- OVERFRAME readiness as textual READY or incomplete;
- Batch checkbox;
- selected-Detail visual state when applicable.

Archetype, effect-classifier and functional-tag chips are not mandatory in GRID. They may be omitted from the compact card because LIST and Detail preserve their information access.

Grid cards may reorder the required information for compactness, but must not change any underlying value or readiness meaning.

No image/art thumbnail is required by F-04.

## 8. Responsive observable outcomes

LIST:
- always one result column.

GRID:
- at 1440 × 1000, DPR 1, with a fixture containing at least six results, at least three result columns must be simultaneously visible;
- at 900 × 1000, DPR 1, at least two result columns must be simultaneously visible;
- at 390 × 844, DPR 1, exactly one result column must be used;
- cards must not cause horizontal document scrolling at 390 px viewport width;
- result content must remain readable and required actions reachable at the narrow viewport;
- the View control and Batch toolbar may wrap, but must not overlap or become unreachable.

Exact CSS breakpoint values are implementation detail. The observable outcomes above are normative.

## 9. Pure presentation invariant for mode switching

Changing GRID/LIST must change presentation only.

A view-mode change must not:

- mutate filters;
- mutate preferredLanguage;
- mutate query;
- mutate any facet;
- mutate offset;
- mutate limit;
- call Refresh Library;
- cause a new browse request solely because the mode changed;
- mutate result items;
- change result ordering;
- change card revisions;
- mutate batchSelection;
- reselect cards;
- clear hidden selections;
- alter frozen Batch revisions;
- mutate selectedCardId;
- close Detail;
- open a different Detail;
- alter readiness values;
- mutate Workspace or Canonical state.

The authoritative result set before and after a pure mode switch is the same in-memory browse result.

## 10. Search/filter/page/page-size preservation

When GRID/LIST is changed:

- active search text remains byte-for-byte equivalent;
- preferred language remains unchanged;
- Family remains unchanged;
- Archetype remains unchanged;
- Effect Classifier remains unchanged;
- Functional Tag remains unchanged;
- current page remains unchanged;
- limit remains unchanged.

The current page-size contract remains 50.

F-04 must not introduce a page-size selector.

Existing behavior that resets page to 1 when search/filter criteria change remains unchanged and is not caused by view mode.

## 11. Batch selection preservation

The existing Batch selection model is frozen.

Required across view changes:

- selected card IDs remain identical;
- each selected card retains its originally frozen expected_revision;
- selection count remains identical;
- hidden selection count remains correct for the current visible result page;
- a selected card visible in the new mode shows its Batch checkbox checked;
- cards hidden by page/filter remain selected;
- switching mode must never perform implicit deselection or reselection.

Required across pages/filters:

- an item selected on page 1 remains selected when page 2 is shown;
- an item hidden by a filter remains selected;
- returning to a page/filter where the item is visible restores its checked state from the existing Batch selection;
- browse refresh alone must not update an already frozen selected revision;
- explicit deselection and later explicit reselection retain the existing revision-adoption semantics.

The existing maximum selection of 200 is unchanged.

## 12. Card-open versus Batch-checkbox target contract

The Detail-open target and Batch checkbox are separate interactions.

Pointer behavior:

- activating the Batch checkbox toggles only Batch selection and must not open or change Detail;
- activating the card's Detail-open target opens that card's Detail and must not toggle Batch selection.

Keyboard behavior:

- the Detail-open target is a native button or equivalent semantic control reachable by Tab;
- Enter and Space on the Detail-open target open that card's Detail;
- the Batch checkbox is independently reachable by Tab;
- Space on the Batch checkbox toggles only Batch selection;
- checkbox keyboard activation must not bubble into the Detail-open action.

Accessibility boundary:

- do not create a checkbox nested inside another interactive button/role=button target;
- the result container may be a non-interactive article/card;
- the Detail-open action and Batch checkbox must be sibling interaction targets or otherwise produce equivalent valid accessibility semantics.

The Detail-open action must have an accessible name equivalent to:
Open <display_name> Detail

The Batch checkbox accessible name remains equivalent to:
Select <display_name> for Batch

## 13. Selected-Detail state

When selectedCardId equals a visible result card_id, both LIST and GRID must expose a clearly visible selected-Detail state.

Required:

- selected state is not communicated by color alone;
- retain a distinct visual boundary/background treatment;
- also expose visible text equivalent to Detail selected, or another persistent non-color indicator with the same meaning;
- the selected card remains identifiable with keyboard focus separate from selection state;
- the Detail-open action's accessible name or associated text must expose that the card is the currently selected Detail item.

View switching must preserve the selected Detail identity.

## 14. Detail behavior across view and result transitions

GRID ↔ LIST:

- if Detail is open, it remains open;
- the same selectedCardId remains authoritative;
- no Detail reload is required solely because mode changed;
- if the selected card is visible, selected-card presentation appears in the new mode.

Ordinary page/filter transitions:

- preserve the baseline selected Detail identity behavior;
- changing page/filter does not automatically close or replace the open Detail;
- if the selected card becomes hidden from the current result page, Detail may remain open and no visible result card is marked selected;
- when the same card becomes visible again, its selected-Detail presentation returns.

Workspace invalidation/maintenance behavior that currently clears Detail remains unchanged.

## 15. Readiness/status requirements

Both LIST and GRID must present:

- Variants: <variant_count>;
- Standard READY or Standard incomplete;
- Overframe READY or Overframe incomplete.

The READY/incomplete words are mandatory and remain authoritative. Color may supplement but not replace the text.

F-04 must not:

- recompute readiness;
- infer readiness from variant_count;
- call variant-detail APIs per card;
- change readiness color meaning;
- add automatic ready-variant selection;
- change Open in Carder readiness behavior.

The existing summary booleans are the only result-card readiness source.

## 16. Keyboard/focus/accessibility contract

Required observable behavior:

### View control
- single-choice semantics exposed programmatically;
- accessible group name Library results view;
- options named Grid and List;
- keyboard operation follows native radio semantics;
- the active option is programmatically determinable;
- after keyboard activation, focus remains on the view control and does not jump to the result region.

### Result cards
- each visible card has one keyboard-reachable Detail-open action;
- each visible card has one separately keyboard-reachable Batch checkbox;
- Detail-open action works with Enter and Space;
- Batch checkbox Space toggles selection without opening Detail;
- focus indicators are clearly visible in LIST and GRID;
- selected-Detail presentation must not obscure focus;
- no required information/action becomes pointer-only.

### Tab order
Within each result card, the Detail-open action and Batch checkbox must have a deterministic DOM/tab order. The recommended order is:
1. Detail-open action
2. Batch checkbox

A different order is acceptable only if consistent in both modes and evidenced by browser QA.

## 17. Loading, empty, error and non-ready states

The existing semantic states and copy are preserved.

Required result-state copy remains:

- connecting: Connecting to Workspace…
- unavailable: Library API unavailable.
- not ready: Library browse is unavailable until the Workspace is READY.
- loading: Loading Library…
- empty Library: Library is empty.
- no match: No matching cards.
- browse error: Library request failed, with existing Retry action.

Mode behavior:

- View control may remain operable while no result cards are present;
- switching mode during loading/empty/error changes only the remembered in-page presentation mode for the next rendered results;
- state panels/alerts span the full results region and must not appear as one narrow Grid card;
- no duplicate loading/empty/error panel is rendered per Grid column.

Retry semantics remain unchanged.

## 18. Pagination contract

The existing Pagination component remains the authoritative navigation control.

Both LIST and GRID:

- use the same total;
- use the same offset;
- use the same limit;
- derive the same current page;
- do not duplicate Pagination per view;
- retain showSizeChanger=false;
- retain current limit 50;
- retain the same onChange semantics;
- retain Batch selections when page changes;
- retain selected Detail identity when page changes.

A mode switch on page N must leave Pagination on page N.

Infinite scroll, virtualization that changes pagination semantics, or client-side repagination is outside F-04.

## 19. Narrow viewport contract

At 390 × 844, DPR 1:

- Library shell remains usable without horizontal page scrolling caused by F-04;
- Grid collapses to one column;
- List remains one column;
- View control remains visible and keyboard reachable;
- Batch checkbox remains reachable;
- Detail-open action remains reachable;
- display name/family/readiness remain readable;
- selected-Detail indicator remains visible;
- pagination remains reachable;
- header/browse controls may wrap according to existing responsive behavior.

F-04 does not authorize a general mobile redesign.

## 20. Deterministic automated evidence matrix

Development must preserve all existing automated gates and add focused F-04 coverage.

At the exact implementation candidate SHA, the following commands must exit 0:

~~~text
yarn compile
yarn build
yarn test:sc
yarn test:library
yarn --cwd workspace-server compile
yarn --cwd workspace-server test
~~~

A focused deterministic F-04 test module must be added and included by yarn test:library, preferably:

scripts/test-library-grid-list.ts

or an equivalent bounded client-only test file.

Required automated cases:

| ID | Deterministic case | Required result |
| --- | --- | --- |
| F04-U01 | initial view state | LIST |
| F04-U02 | LIST→GRID→LIST | only view-mode state changes |
| F04-U03 | browse URL before/after pure mode change | byte-equivalent URL for same filters |
| F04-U04 | query/facets before/after mode change | unchanged |
| F04-U05 | offset/limit before/after mode change | unchanged; limit 50 |
| F04-U06 | selected Detail identity/open state model around mode change | unchanged |
| F04-U07 | Batch selection map around mode change | same IDs and same frozen revisions |
| F04-U08 | hidden Batch selections | preserved and hidden count unchanged for same visible page |
| F04-U09 | browse refresh of an already selected card | frozen expected_revision remains unchanged |
| F04-U10 | LIST content projection/contract | includes all baseline identity, classifications, variant count and readiness fields |
| F04-U11 | GRID minimum projection/contract | includes required identity, variant count and readiness fields |
| F04-U12 | readiness labels | Standard/Overframe READY vs incomplete map only from existing booleans |
| F04-U13 | result-state mapping | loading/error/empty-library/no-match/results independent from view mode |
| F04-U14 | checkbox event isolation helper, if retained | checkbox propagation cannot trigger Detail open |
| F04-U15 | forbidden API/domain coupling | no view-mode field added to LibraryBrowseFilters, browse URL or server DTOs |
| F04-U16 | schema/migration guard | schema 8, format 1, migrations 001–008; no 009 |
| F04-U17 | existing Batch deterministic suite | all existing RUN018 Batch checks remain PASS |
| F04-U18 | existing Library client suite | all prior Library client checks remain PASS |

If implementation uses no pure helper for a specific view interaction, that interaction may be proven in the mandatory browser matrix instead, but U03/U05/U07/U09/U15/U16 remain mandatory deterministic invariants.

## 21. Deterministic browser / visual / accessibility evidence environment

Owner-manual QA is NOT required.

F-04 is independently reproducible with a disposable Workspace fixture and browser automation.

Required final evidence must record:

- exact candidate SHA;
- exact base SHA e07140d5a9555a17b7b2306a45625c14adfafc8e;
- OS/runner;
- Node and Yarn versions;
- browser engine and exact version;
- viewport and DPR;
- Workspace schema and format;
- fixture identity/card count;
- browser console/page errors;
- relevant Library API request log.

The existing project pattern using a disposable real Workspace Service + Vite Library + Playwright-compatible Chromium harness is acceptable.

The F-04 fixture must provide at minimum:

- at least 101 browse results so page 1 and page 2 are deterministic with limit 50;
- at least six results visible under a deterministic filter for Grid layout evidence;
- mixed MONSTER/SPELL/TRAP/TOKEN identities;
- at least one Token with null password;
- at least one card with non-empty classifications;
- mixed Standard/Overframe readiness combinations;
- stable card IDs and revisions;
- enough filter diversity to hide a previously selected card without deleting it.

## 22. Browser / visual evidence matrix

Mandatory cases:

| ID | Browser case | Required evidence |
| --- | --- | --- |
| F04-B01 | fresh Library load | LIST active by default; List information-rich row visible |
| F04-B02 | GRID at 1440×1000 DPR1 | at least 3 columns; required Grid identity/readiness/checkbox visible |
| F04-B03 | GRID at 900×1000 DPR1 | at least 2 columns |
| F04-B04 | GRID at 390×844 DPR1 | exactly 1 column; no F-04 horizontal overflow |
| F04-B05 | LIST at 390×844 DPR1 | one usable row column; required actions reachable |
| F04-B06 | active search + facet + page 2, switch LIST↔GRID | exact input/filter values, current page and limit preserved |
| F04-B07 | network capture around pure mode switch | zero additional browse request caused solely by mode switch; zero POST/PATCH/PUT/DELETE |
| F04-B08 | select card on page 1, move to page 2, switch mode | selection count and frozen page-1 selection preserved; hidden count correct |
| F04-B09 | select cards on multiple pages, apply filter hiding them, switch mode | hidden selections remain members; no implicit reselection/revision update |
| F04-B10 | visible selected Batch card, switch mode | same checkbox remains checked |
| F04-B11 | pointer checkbox interaction | Batch toggles; Detail does not open/change |
| F04-B12 | pointer Detail-open interaction | exact card Detail opens; Batch membership unchanged |
| F04-B13 | keyboard Detail-open | Tab focus visible; Enter and Space open exact card |
| F04-B14 | keyboard Batch checkbox | Space toggles Batch only; Detail identity unchanged |
| F04-B15 | keyboard View control | accessible group/options; native radio keyboard behavior; focus retained on control |
| F04-B16 | Detail open + visible selected card, switch mode | same Detail remains open; same card shows selected-Detail indicator |
| F04-B17 | Detail open, page/filter hides selected card | Detail remains same/open; no other card becomes selected; returning restores visible selected state |
| F04-B18 | readiness cues in LIST and GRID | variant count + textual Standard/Overframe READY/incomplete match same API summary |
| F04-B19 | loading state in LIST and GRID | one full-width loading state; no duplicate/narrow card rendering |
| F04-B20 | empty-library and no-match states | exact baseline messages; full-width state presentation |
| F04-B21 | deterministic browse error + Retry | exact error presentation; mode retained in-page; Retry semantics unchanged |
| F04-B22 | pagination in both modes | same total/current page; page size 50; no size changer |
| F04-B23 | selected state accessibility | selected state is visible without color-only dependence and exposed in accessible text/name |
| F04-B24 | focus styling | View, Detail-open and Batch checkbox focus clearly visible in both modes |
| F04-B25 | authoritative result equivalence | ordered card_id + revision list before/after pure mode switch identical |
| F04-B26 | runtime cleanliness | zero unexpected page errors/console errors attributable to F-04 |

Primary screenshots must include at minimum:

1. LIST baseline at 1440×1000;
2. GRID baseline at 1440×1000;
3. responsive GRID at 900×1000;
4. narrow GRID at 390×844;
5. search/filter/page-2 state before and after a mode switch;
6. cross-page Batch selection with hidden selection count;
7. selected Detail card in LIST and GRID;
8. readiness cue comparison between LIST and GRID;
9. keyboard focus on View control;
10. keyboard focus on Detail-open and Batch checkbox.

Machine-readable evidence must accompany screenshots for B06–B09, B16–B18 and B25. Screenshots alone do not prove state preservation.

## 23. Combined regression contract

The candidate must preserve existing Library behavior outside the presentation change.

Mandatory regression surfaces:

### Browse
- current search semantics;
- preferred-language semantics;
- Family/Archetype/Effect Classifier/Functional Tag filters;
- debounce/request behavior except that mode changes must not participate;
- loading/error/empty/no-match classification;
- current ordering and totals.

### Pagination
- offset/limit semantics;
- current page calculation;
- page size 50;
- no page-size changer;
- filter-driven reset to page 1.

### Batch
- individual selection;
- Select current page;
- 200-card limit;
- cross-page membership;
- hidden selection count;
- frozen revisions;
- explicit deselect/reselect semantics;
- Preview/Apply DTOs;
- dirty Detail Apply blocking;
- result reporting.

### Detail
- exact card opening;
- selected Detail identity;
- dirty state;
- ordinary page/filter transitions do not replace Detail;
- workspace invalidation still clears Detail according to existing behavior.

### Readiness
- result summary Standard/Overframe values;
- no per-card readiness recomputation;
- no Open in Carder readiness changes;
- no Preferred Variant semantic changes.

### Workspace/Canonical
- no F-04 mutation;
- no schema change;
- no migration;
- no Workspace-format change;
- no Carder change.

## 24. Expected implementation boundary

Expected production files:

~~~text
src/library/app.tsx
src/library/library.scss
~~~

Bounded new Library-local presentation modules are allowed if useful, for example:

~~~text
src/library/library-result-card.tsx
src/library/library-view-mode.ts
~~~

Such modules must contain presentation/view-state logic only.

Expected test/evidence files may include:

~~~text
scripts/test-library-grid-list.ts
scripts/test-library-client.ts
scripts/<f04>-qa-fixture.cjs
scripts/<f04>-ui-evidence.cjs
scripts/<f04>-operational-qa.cjs
~~~

The exact QA harness filenames are not product requirements.

Production files not expected to change:

~~~text
src/library/api.ts
src/library/model.ts
src/library/batch-classification-state.ts
src/library/detail-panel.tsx
src/library/open-in-carder.tsx
workspace-server/**
migrations/**
Carder renderer/editor/protocol files
package runtime dependencies
workspace format/schema code
~~~

A bounded refactor that moves existing result-card JSX out of app.tsx into a new Library-local component is allowed only if semantics remain identical to this contract.

If Development believes api.ts, model.ts, batch-classification-state.ts, server code, migrations or Carder code must materially change, STOP and return the evidence to Project Control/DQA before editing those surfaces.

## 25. Forbidden changes

F-04 must not:

- create migration 009;
- change schema 8;
- change Workspace format 1;
- add server fields;
- add API parameters for view mode;
- add view mode to LibraryBrowseFilters;
- add Workspace/domain persistence;
- add localStorage/sessionStorage persistence under this frozen contract;
- change page size or add page-size selection;
- replace pagination with infinite scroll;
- alter search/filter semantics;
- alter result ordering;
- alter Batch membership semantics;
- alter frozen selected revisions;
- change Batch limit;
- alter selected Detail identity semantics;
- clear Detail on view switch;
- choose a different Detail on view switch;
- recompute readiness;
- add per-card readiness fetches;
- alter Preferred Variant behavior;
- alter Open in Carder behavior;
- introduce art thumbnails as an F-04 requirement;
- perform general Library workflow redesign;
- start CR-0002 implementation;
- move feature/workspace-v0.1;
- move main.

## 26. STOP / SCOPE-REOPEN conditions

Return to PROJECT_CONTROL / PC-002 and do not silently expand this contract if implementation demonstrates a material need for:

1. new server fields;
2. API contract changes;
3. schema change;
4. Workspace-format change;
5. migration 009;
6. Workspace/domain persistence;
7. readiness semantic changes;
8. Batch membership/frozen-revision semantic changes;
9. selected Detail identity semantic changes;
10. new browse/filter/pagination semantics;
11. broader Library workflow redesign rather than result presentation;
12. Carder protocol/code changes.

Disposition for items 1–12:

SCOPE REOPEN REQUIRED.

Implementation-detail questions that stay inside this frozen client/UI contract may be returned to DQA through Project Control for bounded clarification without automatically reopening Scope.

## 27. Residual design questions

RESIDUAL DESIGN QUESTIONS:
NONE

The baseline already contains sufficient data and independent client state to implement F-04 without architecture expansion.

## 28. Return to Project Control

Return to:

PROJECT_CONTROL / PC-002

with:

DESIGN CONTRACT:
FROZEN

IMPLEMENTABLE:
YES

TESTABLE:
YES

SCOPE REOPEN REQUIRED:
NO

EXACT BASELINE CONSUMED:
feature/workspace-v0.1
e07140d5a9555a17b7b2306a45625c14adfafc8e

IMPLEMENTATION AUTHORITY:
NONE

RUN:
NOT ASSIGNED

IMPLEMENTATION BRANCH:
NOT ASSIGNED

CR-0002 IMPLEMENTATION:
NOT AUTHORIZED

FEATURE/WORKSPACE-V0.1 MOVEMENT:
NONE

MAIN MOVEMENT:
NONE
