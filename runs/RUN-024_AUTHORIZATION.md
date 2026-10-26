---
artifact_id: RUN-024-AUTHORIZATION
artifact_type: implementation_authorization
status: FROZEN
protocol_version: "1.0"
source_role: PROJECT_CONTROL
source_instance: PC-001
target_role: DEVELOPMENT
target_instance: DEV-004
control_parent_sha: d2e810f3c322ec12b4bfbdf60c939159ca3ec904
code_baseline:
  branch: feature/workspace-v0.1
  sha: 64cb5f4ca42348c6c403e64e0d61bdff8c32a281
implementation_branch:
  branch: feature/workspace-run-024
  required_start_sha: 64cb5f4ca42348c6c403e64e0d61bdff8c32a281
source_contract: handoffs/POST_P6_TRANCHE_1_IMPLEMENTATION_HANDOFF.md
related_requests:
  - CR-0001.3
  - CR-0001.6
---

# RUN 024 — Implementation Authorization

## Authorized RUN

`IMPLEMENTATION RUN 024 — Focused Editor / Variant UX Completion`

Contents:

- CR-0001.3 / F-03 — Graphical Link Marker selector.
- CR-0001.6 / F-06 — Preferred Variant warning clarity.

This is the first implementation RUN after P6 closure.

## Exact baseline

Development must consume:

`feature/workspace-v0.1 @ 64cb5f4ca42348c6c403e64e0d61bdff8c32a281`

Immediately before branch creation, Development must verify from GitHub:

```text
feature/workspace-v0.1
= 64cb5f4ca42348c6c403e64e0d61bdff8c32a281

main
= 54cc3aad246c89a29f2a18be63c539db68cae041

feature/workspace-run-024
= ABSENT
```

Any mismatch:

`IMPLEMENTATION BLOCKED`

Return to PROJECT_CONTROL / PC-001. Do not reconcile silently.

## Authorized branch

Development is authorized to create:

`feature/workspace-run-024`

directly from the exact baseline:

`64cb5f4ca42348c6c403e64e0d61bdff8c32a281`

No rebase/reset/force-push.

## Frozen implementation contract

Primary contract:

`handoffs/POST_P6_TRANCHE_1_IMPLEMENTATION_HANDOFF.md`

Development must implement only that frozen contract.

Scope deviation:

`NONE AUTHORIZED`

If implementation requires server/domain/API/persistence/migration/Carder-protocol change:

STOP and return:

`SCOPE REOPEN REQUIRED`

## Architecture invariants

Must remain:

```text
database schema = 8
Workspace format = 1
migrations = 001–008
migration 009 = absent
new API = none
new persistence = none
Carder protocol change = none
```

Expected production scope:

- client/UI only;
- likely `src/library/editor-form.tsx`;
- bounded `src/library/editor-state.ts` helper work if needed;
- `src/library/open-in-carder.tsx`;
- `src/library/library.scss`;
- optional new client-only helper/component files under `src/library/`;
- focused tests/scripts.

If shared Carder component code is changed, Development must justify it and prove no Carder regression.

## Required validation

At exact final candidate SHA:

```text
yarn compile
yarn build
yarn test:sc
yarn test:library
yarn --cwd workspace-server compile
yarn --cwd workspace-server test
```

All must PASS.

Focused deterministic tests must cover the complete frozen F03/F06 acceptance matrix where automatable.

Mandatory browser evidence:

- T1-OP-01 — Graphical LINK selector baseline
- T1-OP-02 — Pointer marker edit + dirty/rating restoration
- T1-OP-03 — Keyboard/focus/accessibility
- T1-OP-04 — LINK applicability transitions and clearing confirmation
- T1-OP-05 — Confirmed Structure marker save / server-derived Link Rating
- T1-OP-06 — Preferred warning four-state readiness matrix
- T1-OP-07 — No Preferred + manual alternate behavior

Use disposable fixtures. Do not use Owner Workspace data.

Owner-manual validation:

`NOT REQUIRED`

If deterministic browser evidence cannot be produced, Development must report the exact missing cases as an evidence gap. It must not self-label those cases PASS.

## Required Development output

Publish:

`implementations/RUN-024_IMPLEMENTATION_REPORT.md`

The report must include:

- exact CONTROL SHA consumed;
- exact incoming baseline;
- branch-creation proof;
- exact final candidate SHA;
- complete changed-file list;
- per-file reason;
- scope-boundary proof;
- proof schema/API/persistence/migrations/lockfiles remained unchanged;
- all required compile/build/test results;
- focused F03/F06 test inventory and counts;
- T1-OP-01..07 evidence/results;
- browser/OS/Node/Yarn versions;
- clean working-tree proof before/after browser evidence;
- known warnings/limitations;
- explicit list of any evidence case not executed.

Final Development status must be one of:

`READY FOR EXTERNAL QA`

or

`IMPLEMENTATION BLOCKED`

Development PASS is not External QA PASS.

## Non-authorizations

Development must NOT:

- modify `feature/workspace-v0.1`;
- modify `main`;
- self-integrate;
- start Tranche 2;
- implement CR-0001.4 / F-04;
- create migration 009;
- change schema/Workspace format;
- alter frozen control artifacts;
- broaden scope based on convenience.

## Return route

`DEVELOPMENT / DEV-004 → PROJECT_CONTROL / PC-001`

Project Control will route the exact candidate to External Design + QA after Development delivery.

