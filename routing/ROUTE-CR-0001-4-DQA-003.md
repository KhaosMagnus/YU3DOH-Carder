---
artifact_id: ROUTE-CR-0001-4-DQA-003
artifact_type: routing_decision
status: FROZEN
protocol_version: "1.0"
source_role: PROJECT_CONTROL
source_instance: PC-002
target_role: DESIGN_QA
target_instance: DQA-003
owner_authorization: control/OWNER_AUTH_CR_0001_4_DESIGN.md
canonical_request: requests/CR-0001-v18.md
primary_scope: scopes/POST_P6_ROADMAP_REVIEW.md
code_baseline:
  branch: feature/workspace-v0.1
  sha: e07140d5a9555a17b7b2306a45625c14adfafc8e
implementation_authorized: false
run_assigned: false
---

# Route — CR-0001.4 / F-04 Library Grid/List — DQA-003

## Mode

DESIGN

## Mission

Freeze the implementable and independently testable Design + QA contract for:

CR-0001.4 / F-04 — Library Grid/List

The contract must be based on the exact integrated baseline:

feature/workspace-v0.1
e07140d5a9555a17b7b2306a45625c14adfafc8e

## Read completely

- PROJECT_STATE.md
- requests/CR-0001-v18.md
- scopes/POST_P6_ROADMAP_REVIEW.md
- control/OWNER_AUTH_CR_0001_4_DESIGN.md
- backlog/BACKLOG.md
- roles/DESIGN_QA.md
- protocols/COMMUNICATION_PROTOCOL.md
- chats/instances/DQA-003.md

Inspect the actual current Library implementation at the exact baseline before making implementation-sensitive claims.

Relevant historical validation may be inspected where needed, especially prior Library browse/batch/detail behavior, but historical observations must not replace verification of current code truth.

## Frozen product boundary

Treat as binding:

- explicit Library result view control with at least GRID and LIST;
- LIST preserves current information-rich row behavior or equivalent information access;
- GRID provides compact multi-column cards when width permits;
- responsive collapse to fewer columns is required;
- switching mode preserves active filters/search;
- switching mode preserves page and page size;
- switching mode preserves batch selections, including selections currently hidden by page/filter;
- switching mode preserves selected Detail card where still applicable;
- authoritative browse result set must not change;
- both modes support opening Detail;
- both modes support batch checkbox/select behavior;
- both modes expose visible selected-card state;
- both modes preserve readiness semantics and sufficient readiness cues;
- both modes are keyboard/focus accessible;
- no new server fields are required;
- no Workspace/domain persistence is required;
- cross-browser-restart view preference persistence is NOT a product requirement;
- browser-local presentation preference MAY be allowed only if it creates no Workspace/domain/server persistence and does not broaden scope.

## Architecture invariants

Required unless DQA returns SCOPE REOPEN REQUIRED:

- client/UI presentation layer only;
- database schema = 8;
- Workspace format = 1;
- migrations = 001–008;
- migration 009 = ABSENT / NOT AUTHORIZED;
- no server-domain semantic change;
- no API contract change;
- no Carder protocol change;
- no mutation to readiness computation;
- no change to browse/search/filter semantics;
- no change to batch membership semantics;
- no change to selected Detail identity semantics.

## Contract must freeze

At minimum:

1. exact GRID/LIST control placement and labels;
2. initial/default mode;
3. whether same-session/local browser preference is allowed and exact fallback behavior;
4. List information/interaction requirements;
5. Grid card minimum information/cues;
6. responsive breakpoints/behavior expressed as observable outcomes rather than brittle pixel constants where possible;
7. click-target separation between card opening and batch checkbox;
8. selected-card visual state;
9. batch selection preservation across view switches, filters and pagination;
10. Detail-selection behavior across view switches and result transitions;
11. readiness/status presentation in both modes;
12. keyboard navigation/focus/accessibility contract;
13. loading, empty, error and pagination states in both modes;
14. narrow viewport behavior;
15. deterministic automated test matrix;
16. deterministic browser/visual evidence matrix;
17. combined regression requirements for existing Library browse/batch/detail/readiness behavior;
18. exact expected production-file boundary;
19. forbidden changes and STOP/SCOPE-REOPEN conditions.

## Mandatory evidence design

The contract must distinguish:

AUTOMATED / DETERMINISTIC evidence

from

BROWSER / VISUAL / ACCESSIBILITY evidence.

Browser evidence must cover at minimum:

- LIST baseline;
- GRID baseline at a viewport that supports multiple columns;
- responsive GRID at narrower widths;
- mode switch with active search/filter/page state;
- mode switch with batch selections, including hidden selections where feasible;
- card click versus batch-checkbox interaction;
- selected Detail state across mode change;
- keyboard/focus operation;
- readiness/selection cues;
- loading/empty/error presentation if deterministically fixtureable.

Owner-manual evidence should not be required unless DQA demonstrates an unavoidable reason.

## Scope-reopen triggers

Return SCOPE REOPEN REQUIRED instead of inventing implementation requirements if F-04 is found to require any of:

- new server fields;
- API changes;
- domain/persistence changes;
- schema or Workspace-format changes;
- migration 009;
- altered readiness semantics;
- altered batch membership semantics;
- broader Library workflow redesign beyond presentation/view mode.

## Expected output

Publish:

handoffs/CR-0001_4_LIBRARY_GRID_LIST_IMPLEMENTATION_HANDOFF.md

Return to:

PROJECT_CONTROL / PC-002

with:

- DESIGN CONTRACT: FROZEN or BLOCKED;
- IMPLEMENTABLE: YES/NO;
- TESTABLE: YES/NO;
- SCOPE REOPEN REQUIRED: YES/NO;
- exact baseline consumed;
- exact automated/browser evidence requirements;
- identified implementation boundary;
- residual design questions, if any.

## Non-authorizations

DQA-003 must not:

- authorize implementation;
- assign a RUN number;
- create an implementation branch;
- modify product code;
- move feature/workspace-v0.1;
- move main;
- start CR-0002 implementation;
- modify the frozen F-04 scope by inference.

Any required product decision outside the frozen scope returns to PROJECT_CONTROL / PC-002.
