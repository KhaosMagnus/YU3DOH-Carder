---
artifact_id: ROUTE-CR-0002-DQA-002
artifact_type: routing_decision
status: FROZEN
protocol_version: "1.0"
source_role: PROJECT_CONTROL
source_instance: PC-002
target_role: DESIGN_QA
target_instance: DQA-002
control_parent_sha: 2a08d458bb72fac0b91dd4b856a768e24f805841
primary_scope: scopes/CR-0002_LIBRARY_DARK_THEME-v2.md
project_control_disposition: control/CR-0002_SCOPE_DISPOSITION.md
code_baseline:
  branch: feature/workspace-v0.1
  sha: 64cb5f4ca42348c6c403e64e0d61bdff8c32a281
implementation_sequence:
  after: CR-0001.4 / F-04 validated and integrated
implementation_authorized: false
---

# Route — CR-0002 Library Dark Theme / DQA-002

## Mode

`DESIGN`

## Mission

Freeze the implementable and testable External Design + QA contract for:

`CR-0002 — Library Dark Theme`

The Scope v2 is authoritative.

This design mission runs in parallel with RUN 024 infrastructure/execution recovery and does not modify RUN 024.

## Read completely

- `PROJECT_STATE.md`
- `control/CR-0002_SCOPE_DISPOSITION.md`
- `scopes/CR-0002_LIBRARY_DARK_THEME-v2.md`
- `requests/CR-0002.md`
- `scopes/POST_P6_ROADMAP_REVIEW.md`
- `control/POST_P6_ROADMAP_DISPOSITION.md`
- `requests/CR-0001-v17.md`
- `control/PRE_HARDENING_DOCUMENTATION_REQUIREMENT.md`
- `roles/DESIGN_QA.md`
- `protocols/COMMUNICATION_PROTOCOL.md`
- `chats/instances/DQA-002.md`

Verify current GitHub code truth before implementation-sensitive observations.

## Frozen product outcomes

Treat as binding:

- Library entrypoint only;
- Carder explicitly OUT;
- states = LIGHT / DARK;
- valid stored LIGHT remains LIGHT;
- valid stored DARK remains DARK;
- missing/invalid/unavailable preference falls back to DARK;
- SYSTEM/AUTO OUT;
- browser-local persistence;
- no Workspace/server/domain persistence;
- no schema/API/migration/Carder-protocol change;
- functional behavior invariant across themes;
- accessibility/contrast validation required;
- no major Ant Design upgrade/general dependency modernization;
- CR-0001.4 Grid/List remains separate and is implemented/integrated first.

## Design contract requirements

Freeze enough detail for later Development and External QA to operate without inventing requirements.

At minimum define:

1. exact theme-control UX:
   - placement;
   - labels/accessible names;
   - interaction semantics;
   - keyboard behavior;
2. startup/hydration behavior:
   - DARK fallback;
   - stored-value precedence;
   - invalid storage handling;
   - avoid incorrect persistent mutation;
   - define acceptable initial-render/theme-flash behavior;
3. browser-local persistence contract:
   - storage mechanism/key semantics;
   - read/write failure behavior;
   - no Workspace/network mutation;
4. Library theme architecture:
   - root/scope application;
   - semantic token/value categories;
   - Ant Design 4.9.4 compatibility;
   - Library-owned portal/overlay theming;
   - isolation from Carder;
5. full surface/state matrix from Scope;
6. contrast/accessibility measurement protocol;
7. deterministic automated test matrix;
8. deterministic browser/visual evidence matrix;
9. cross-theme functional regression requirements;
10. exact forbidden changes and stop conditions;
11. expected production file boundary where reasonably inferable.

## Mandatory post-F04 compatibility gate

CR-0002 implementation is sequenced after CR-0001.4 / F-04 is QA-PASS and integrated.

Therefore the contract must explicitly state:

- current design baseline is `64cb5f4c...`;
- implementation baseline is not yet assigned;
- before implementation authorization, Project Control/DQA must compare the eventual post-F04 integrated baseline against this design contract;
- if F04 introduces surfaces covered by CR-0002, the final theme contract must cover both Grid and List modes;
- implementation must not start against an obsolete pre-F04 assumption;
- a bounded DQA contract revision may be issued without Scope reopen when product semantics remain unchanged.

## Expected output

Publish:

`handoffs/CR-0002_LIBRARY_DARK_THEME_IMPLEMENTATION_HANDOFF.md`

Return to:

`PROJECT_CONTROL / PC-002`

with:

- design-contract status;
- implementation/testability finding;
- scope-reopen requirement YES/NO;
- exact automated/browser evidence requirements;
- explicit post-F04 compatibility gate.

## Non-authorizations

DQA-002 must not:

- authorize implementation;
- assign a RUN number;
- create an implementation branch;
- modify product code;
- modify RUN 024;
- start CR-0001.4 implementation;
- move feature/workspace-v0.1 or main.
