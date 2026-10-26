---
artifact_id: POST-P6-ROADMAP-REVIEW
artifact_type: scope_roadmap_review
status: FROZEN
protocol_version: "1.0"
source_role: SCOPE_ARCHITECTURE
source_instance: SCOPE-001
target_role: PROJECT_CONTROL
target_instance: PC-001
control_parent_sha: c871599ee3f8ac88ba507c376a560fa4f42fc05a
code_baseline:
  branch: feature/workspace-v0.1
  sha: 64cb5f4ca42348c6c403e64e0d61bdff8c32a281
related_requests:
  - CR-0001.3
  - CR-0001.4
  - CR-0001.6
supersedes: null
created_at: "2026-10-26T05:08:00Z"
approved_at: "2026-10-26T05:08:00Z"
---

# POST-P6 ROADMAP REVIEW

## 1. Authority and review baseline

Owner-selected post-P6 sequence:

```text
ROADMAP REVIEW
        ↓
RELEASE HARDENING
        ↓
RELEASE / MAIN INTEGRATION
```

with allowed iteration:

```text
ROADMAP REVIEW
      ↕
RELEASE HARDENING
```

Exact product baseline reviewed:

```text
feature/workspace-v0.1
64cb5f4ca42348c6c403e64e0d61bdff8c32a281

feature/workspace-cr-0001-combined
64cb5f4ca42348c6c403e64e0d61bdff8c32a281

main
54cc3aad246c89a29f2a18be63c539db68cae041

feature/workspace-run-024
ABSENT

database schema
8

Workspace format
1

migrations
001–008

migration 009
ABSENT
```

P6 is CLOSED.

Residual P6 archival provenance gaps are explicitly excluded from this product roadmap.

This artifact does not authorize implementation, branch creation, RUN numbering, schema change, migration, or main integration.

## 2. Current completed state

The following CR-0001 items are complete at the reviewed baseline and are not reopened:

```text
CR-0001.1 / F-01
INTEGRATED / PASS

CR-0001.2 / F-02
INTEGRATED / PASS

CR-0001.5 / F-05
INTEGRATED / PASS
```

The following remain closed and are not silently reopened:

```text
CR-0001.7 / F-07
REJECTED / WITHDRAWN

CR-0001.8 / F-08
VALIDATED / HISTORICAL

CR-0001.9 / F-09
IMPLEMENTED
```

## 3. Complete pending-item inventory

Frozen Project Control records were reviewed for unresolved evidence-backed product improvements.

The complete current pending product inventory is:

1. CR-0001.3 / F-03 — graphical Link Marker selector.
2. CR-0001.4 / F-04 — Library Grid/List.
3. CR-0001.6 / F-06 — Preferred Variant warning clarity.

No additional evidence-backed pending product improvement is registered in the current canonical CR ledger/backlog.

Historical migration/provenance gaps are not product items.

Previously discussed ideas that are not registered as pending current Project Control requirements are not promoted into this roadmap by inference.

## 4. CR-0001.3 / F-03 — Graphical Link Marker selector

### Current evidence/status

Current disposition:

`DEFERRED`.

At the exact reviewed baseline, the Workspace Canonical editor still renders Link Markers as a numeric multi-select populated from the canonical Link Marker registry.

The Carder codebase already contains an existing graphical 3×3 Link Marker picker using the same canonical marker code layout:

```text
1 2 3
4   6
7 8 9
```

with center position 5 reserved/non-marker and reset behavior.

The current Canonical domain already supports multiple Link Markers and derives Link Rating from the selected marker set.

Therefore the missing capability is interaction/presentation, not domain storage or marker multiplicity.

### Product/user value

HIGH.

The graphical directional selector directly represents the physical arrow positions printed on Link Monsters and removes the cognitive translation from numeric registry codes to directions.

It improves:
- discoverability;
- error prevention;
- editing speed;
- consistency with the existing Carder editing experience.

### Dependencies

Existing Canonical marker codes and Link applicability rules are sufficient.

No new domain concept is required.

### Architectural impact

Client/UI only under the current architecture.

Frozen invariants:

- canonical marker codes remain unchanged;
- center code `5` remains invalid/non-marker;
- Link Rating remains derived from selected marker count;
- server-side Link structure validation remains authoritative;
- Carder/Workspace mapping semantics remain unchanged.

The existing Carder picker may be reused/adapted, but exact component mechanics belong to Design + QA / Development.

### Regression risk

MEDIUM-LOW.

Primary surfaces:
- Canonical editor Link structure editing;
- controlled/uncontrolled UI state synchronization;
- keyboard/accessibility behavior;
- marker code↔direction mapping;
- dirty-state tracking;
- applicability transitions between LINK and non-LINK.

No persistence migration risk.

### Schema/migration implications

```text
schema 8 → 8
migration 009: NONE
Workspace format: 1
```

### Interaction with current exact baseline

The change must preserve the validated CR-0001.2 Level/Rank applicability and all existing Link coherence behavior.

### Bundle/isolate decision

Bundle with CR-0001.6 in the first improvement tranche.

Reason:
- both are localized client UX refinements;
- neither changes persistence;
- F-06 adds negligible regression surface;
- combining them avoids a separate implementation/QA cycle for copy-only work.

Do not bundle F-04 because Library layout has materially broader regression surface.

### Priority

1.

### Disposition

`IN_SCOPE`.

## 5. CR-0001.6 / F-06 — Preferred Variant warning clarity

### Current evidence/status

Current disposition:

`ACKNOWLEDGED UX backlog`.

At the reviewed baseline, when the selected Preferred Variant has one unavailable composition, the UI emits the generic message:

`Preferred Variant has unavailable composition. It remains selected; choose another variant manually if needed.`

The underlying readiness computation is correct and independently tracks STANDARD and OVERFRAME.

### Product/user value

MEDIUM.

The current warning can imply that the Preferred Variant is generally unusable even when one composition remains READY.

A composition-specific message reduces operator ambiguity at the exact decision point before Carder launch.

### Dependencies

None beyond existing per-composition readiness already available in the client.

### Architectural impact

Client copy/presentation only.

No readiness algorithm change.

No Preferred selection behavior change.

No automatic fallback selection.

### Regression risk

LOW.

### Schema/migration implications

None.

```text
schema 8 → 8
migration 009: NONE
```

### Interaction with current exact baseline

Must preserve:
- current Preferred Variant identity;
- STANDARD/OVERFRAME readiness computation;
- launch button enablement;
- manual alternate-variant selection.

### Bundle/isolate decision

Bundle with F-03 in Tranche 1.

### Priority

2.

### Disposition

`IN_SCOPE`.

## 6. CR-0001.4 / F-04 — Library Grid/List

### Current evidence/status

Current disposition:

`DEFERRED`.

At the reviewed baseline, Library results use a single full-width horizontal card presentation. CSS uses a grid container, but there is no user-selectable Grid/List view mode and each result card occupies the row-oriented browse layout.

Browse/search, pagination, filters, multi-select, batch selection, selected-card detail opening, classifications and readiness data are already implemented.

### Product/user value

HIGH for Library-heavy use.

A compact Grid view increases visible card density and makes visual browsing materially more efficient.

A List view preserves the current information-rich horizontal representation.

The feature is presentation-only; it does not change Library query semantics.

### Dependencies

Existing Library browse result data is sufficient.

No new server fields are required.

### Architectural impact

Client/UI only.

The view mode must not alter:
- authoritative browse data;
- search/filter semantics;
- pagination;
- batch selection membership;
- frozen selected revisions used by Batch;
- selected Detail card;
- readiness semantics;
- Canonical state.

No Workspace persistence is required.

For this tranche, persistence of the user's view-mode preference across browser restarts is NOT a product requirement. Design + QA may permit browser-local presentation preference only if it creates no Workspace/domain state and does not broaden the implementation contract.

### Required product behavior

Provide an explicit Library results view control with at least:

```text
GRID
LIST
```

LIST:
- preserves the current information-rich row behavior or equivalent information access.

GRID:
- presents compact multi-column cards when viewport width permits;
- remains responsive and may collapse to fewer columns on narrow viewports;
- preserves card identity, family, display name and key readiness/selection cues sufficient to identify and act on a result.

Switching view mode must preserve:
- active filters/search;
- page and page size;
- batch selections, including selections hidden by filters/page;
- selected Detail card where still applicable;
- authoritative result set.

Both modes must support:
- opening Detail;
- batch checkbox/select behavior;
- keyboard/focus accessibility;
- visible selected-card state;
- readiness status without changing readiness computation.

### Regression risk

MEDIUM.

Primary surfaces:
- responsive layout;
- card click vs batch-checkbox interaction;
- pagination;
- selected-card visual state;
- filter transitions;
- batch selection across pages;
- accessibility/focus;
- narrow viewport behavior.

### Schema/migration implications

```text
schema 8 → 8
migration 009: NONE
Workspace format: 1
```

### Interaction with current exact baseline

Must preserve validated browse/batch behavior from prior RUNs and CR-0001 Combined.

### Bundle/isolate decision

Isolate in a second tranche after F-03/F-06.

Reason:
- wider visual regression surface;
- easier exact-SHA QA and rollback diagnosis;
- avoids a Library layout issue obscuring the smaller Link/Preferred UX changes.

### Priority

3.

### Disposition

`IN_SCOPE`.

## 7. Items explicitly not selected

### Archival provenance gaps

`OUT_OF_SCOPE` for product roadmap.

P6 already closed them as residual archival gaps.

### CR-0001.7 / F-07

`OUT_OF_SCOPE / CLOSED`.

Withdrawn; no new evidence.

### CR-0001.8 / F-08

`OUT_OF_SCOPE / CLOSED`.

Historical/currently satisfactory; no new evidence.

### Integrated CR-0001.1 / .2 / .5

`OUT_OF_SCOPE / COMPLETE`.

Not reopened.

## 8. Ordered proposed roadmap

### NEXT IMPROVEMENT TRANCHE 1 — RUN NUMBER PENDING PROJECT CONTROL AUTHORIZATION

Title:

`Focused Editor / Variant UX Completion`

Contents:

1. CR-0001.3 / F-03 — Graphical Link Marker selector.
2. CR-0001.6 / F-06 — composition-specific Preferred Variant warning clarity.

Expected architecture footprint:

```text
client/UI only
schema 8
Workspace format 1
migrations 001–008
migration 009 absent
no new API/persistence
no Carder protocol change
```

Required chain if Project Control authorizes execution:

```text
Scope artifact
→ External Design + QA technical/acceptance freeze
→ Project Control implementation authorization
→ Development
→ External QA
→ Owner/Project Control authorized integration to feature/workspace-v0.1
```

No RUN number is assigned here.

### NEXT IMPROVEMENT TRANCHE 2 — RUN NUMBER PENDING PROJECT CONTROL AUTHORIZATION

Title:

`Library Browse Grid / List Modes`

Contents:

1. CR-0001.4 / F-04 only.

Expected architecture footprint:

```text
client/UI only
schema 8
Workspace format 1
migrations 001–008
migration 009 absent
no server-domain changes
```

Tranche 2 should begin from the exact integrated Workspace baseline produced after Tranche 1, unless Project Control explicitly changes sequencing.

Required chain:

```text
Scope boundary
→ External Design + QA technical/acceptance freeze
→ Project Control implementation authorization
→ Development
→ External QA
→ Owner/Project Control authorized integration to feature/workspace-v0.1
```

No RUN number is assigned here.

## 9. Why two tranches

All three items are worthwhile before release, but they should not be one implementation unit.

F-03 and F-06:
- localized;
- low persistence risk;
- natural shared UI tranche;
- small enough for focused regression.

F-04:
- broader Library layout surface;
- interacts with browse, batch, pagination and responsive behavior;
- benefits from independent exact-SHA QA.

This split improves traceability:

```text
evidence
→ diagnosis
→ scope
→ implementation
→ exact SHA
→ QA
```

without turning cosmetic/layout regressions into ambiguity around the Link Marker work.

## 10. Release Hardening entry gate

Release Hardening should begin only after all Roadmap-selected IN_SCOPE tranches have:

1. a frozen Design + QA technical/acceptance contract;
2. completed Development on an explicitly authorized branch/tranche;
3. External QA PASS on exact candidate SHA;
4. explicit authorized integration into `feature/workspace-v0.1`;
5. current Project Control ledger updated to show the selected item disposition accurately;
6. no unresolved implementation defect from those tranches;
7. current `feature/workspace-v0.1` exact SHA recorded as the hardening candidate.

Expected persistence entering Hardening remains:

```text
database schema 8
Workspace format 1
migrations 001–008
migration 009 absent
```

If any selected tranche unexpectedly requires schema/persistence changes, it must return to Scope before implementation; this roadmap does not authorize such a change.

## 11. Hardening → bounded correction criteria

A Release Hardening finding should route to a bounded correction rather than full Roadmap Review when ALL of the following hold:

- expected product behavior is already frozen;
- no new product/domain decision is required;
- no architectural boundary needs reopening;
- correction can be narrowly stated as restoring the frozen behavior;
- regression surface is bounded and independently testable;
- correction does not add a new user capability.

Examples:
- wrong Link direction selected for one code despite frozen mapping;
- Grid mode loses an already-selected batch checkbox;
- Preferred warning names the wrong unavailable composition;
- existing supported workflow regresses after a selected tranche.

Such a finding follows:

```text
Hardening evidence
→ Design + QA / Scope classification as needed
→ bounded correction authorization
→ Development
→ External QA
→ authorized integration
→ resume Hardening
```

## 12. Hardening → Roadmap Review criteria

Hardening must return to Roadmap Review when a finding materially requires any of:

- new or changed product behavior rather than restoration;
- Owner prioritization among multiple valid UX choices;
- new user capability;
- architecture/domain decision;
- schema/persistence/workspace-format change;
- broader workflow redesign;
- a finding whose proper resolution changes the scope of more than one bounded feature;
- newly evidenced improvement that should compete with other pre-release work;
- repeated/systemic UX issue better handled as a planned tranche.

Hardening must not smuggle such work into a “correction.”

## 13. Main integration / release gate

Roadmap completion and Release Hardening PASS still do not authorize main movement.

Only after the Roadmap↔Hardening cycle reaches release-ready state may Project Control present a separate Owner decision for:

```text
feature/workspace-v0.1
→ main
```

Main integration remains explicitly unauthorized by this artifact.

## 14. Final disposition matrix

| Item | Current evidence-backed status entering review | Roadmap disposition | Priority | Proposed tranche |
| --- | --- | --- | ---: | --- |
| CR-0001.3 / F-03 Graphical Link Marker selector | DEFERRED, unimplemented UI requirement | IN_SCOPE | 1 | Tranche 1 |
| CR-0001.6 / F-06 Preferred Variant warning clarity | ACKNOWLEDGED UX backlog | IN_SCOPE | 2 | Tranche 1 |
| CR-0001.4 / F-04 Library Grid/List | DEFERRED, unimplemented UI improvement | IN_SCOPE | 3 | Tranche 2 |
| CR-0001.7 / F-07 | REJECTED / WITHDRAWN | OUT_OF_SCOPE / CLOSED | — | none |
| CR-0001.8 / F-08 | VALIDATED / HISTORICAL | OUT_OF_SCOPE / CLOSED | — | none |
| CR-0001.1 / .2 / .5 | INTEGRATED / PASS | OUT_OF_SCOPE / COMPLETE | — | none |
| P6 archival residual gaps | archival only | OUT_OF_SCOPE | — | none |

## 15. Formal Roadmap result

```text
POST-P6 ROADMAP REVIEW:
COMPLETE

PRODUCT BASELINE REVIEWED:
feature/workspace-v0.1 @ 64cb5f4ca42348c6c403e64e0d61bdff8c32a281

PENDING PRODUCT ITEMS FOUND:
3

IN_SCOPE:
CR-0001.3 / F-03
CR-0001.4 / F-04
CR-0001.6 / F-06

DEFERRED AFTER REVIEW:
NONE OF THE THREE CURRENT PENDING ITEMS

BLOCKED:
NONE

PROPOSED TRANCHE 1:
Focused Editor / Variant UX Completion
- CR-0001.3
- CR-0001.6

PROPOSED TRANCHE 2:
Library Browse Grid / List Modes
- CR-0001.4

DATABASE SCHEMA:
8

WORKSPACE FORMAT:
1

MIGRATION 009:
NOT REQUIRED / NOT AUTHORIZED

RUN 024:
NOT AUTHORIZED

MAIN INTEGRATION:
NOT AUTHORIZED

RECOMMENDED NEXT ROUTE:
PROJECT_CONTROL / PC-001
→ authorize/freeze sequencing and route Tranche 1 to External Design + QA

RELEASE HARDENING:
AFTER ALL OWNER/PROJECT-CONTROL-AUTHORIZED ROADMAP TRANCHE WORK IS QA-PASS AND INTEGRATED
```
