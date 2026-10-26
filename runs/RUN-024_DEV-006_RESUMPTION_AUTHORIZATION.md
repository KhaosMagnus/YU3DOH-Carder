---
artifact_id: RUN-024-DEV-006-RESUMPTION-AUTHORIZATION
artifact_type: implementation_resumption_authorization
status: FROZEN
protocol_version: "1.0"
source_role: PROJECT_CONTROL
source_instance: PC-002
control_parent_sha: 4416c5579c96b93256bfe8ffc4417485494b481c
target_role: DEVELOPMENT
target_instance: DEV-006
source_authorization: runs/RUN-024_AUTHORIZATION.md
implementation_contract: handoffs/POST_P6_TRANCHE_1_IMPLEMENTATION_HANDOFF.md
environment_disposition: runs/RUN-024_ENV-004_READY_DISPOSITION.md
implementation_branch:
  branch: feature/workspace-run-024
  required_start_sha: 219ac252d50ae11b836a93baa20cc7f7d872367f
product_baseline:
  branch: feature/workspace-v0.1
  sha: 64cb5f4ca42348c6c403e64e0d61bdff8c32a281
execution_substrate: github_hosted_actions
---

# RUN 024 — DEV-006 Resumption Authorization

## Authorization

Project Control authorizes DEV-006 to resume the already-authorized:

`IMPLEMENTATION RUN 024 — Focused Editor / Variant UX Completion`

Contents remain exactly:

- CR-0001.3 / F-03 — Graphical Link Marker selector;
- CR-0001.6 / F-06 — Preferred Variant warning clarity.

No new RUN is created.

## Exact resumption point

Existing implementation branch:

`feature/workspace-run-024`

Required starting head:

`219ac252d50ae11b836a93baa20cc7f7d872367f`

This historical head is the exact product baseline plus the preserved DEV-004 blocker-report commit.

DEV-006 must preserve that ancestry.

Do not recreate, reset, rebase or force-push the branch.

Before the first product mutation, DEV-006 must independently verify that the remote branch still equals the required starting head. A mismatch that is not a commit created by DEV-006 under this authorization is:

`IMPLEMENTATION BLOCKED`

and returns to PC-002.

## Authorized split execution model

### A. GitHub authoring / candidate publication

DEV-006 may inspect source and construct product commits through GitHub-backed exact file/blob/tree/commit operations.

Every update of `feature/workspace-run-024` must:

- descend from the exact verified current branch head;
- be a normal fast-forward;
- use an expected-head lease;
- never use force;
- never reset/rebase/drop the preserved blocker-report ancestor.

The implementation branch is the only authorized product branch for this RUN.

### B. GitHub-hosted Actions execution/evidence

DEV-006 must use GitHub-hosted Actions to execute the exact candidate.

The proven ENV-004 operational harness may be used as the starting point.

DEV-006 is authorized to create, if absent:

`ops/run-024-dev-006-actions`

from:

`ops/run-024-env-004-actions @ 5aa54988eec0d8c07626f178677660f817640b2a`

That branch is operational harness infrastructure only.

It must not be merged into:

- feature/workspace-run-024;
- feature/workspace-v0.1;
- main.

The ENV-004 workflow is readiness-specific and must not be reused unchanged to claim candidate validation. DEV-006 must adapt external custody/evidence logic to the exact implementation candidate and the frozen T1-OP contract.

## Frozen implementation scope

Implement only the existing frozen contract in:

`handoffs/POST_P6_TRANCHE_1_IMPLEMENTATION_HANDOFF.md`

Expected production scope remains client/UI only.

No scope deviation is authorized.

If implementation appears to require any of:

- Workspace Service production behavior;
- schema or Workspace format change;
- migration 009;
- new API;
- new persistence;
- Preferred Variant persistence-semantic change;
- readiness service change;
- Carder protocol/write-back change;
- package manifest or lockfile change;
- CR-0001.4 / Grid/List work;

STOP and return:

`SCOPE REOPEN REQUIRED / PROJECT_CONTROL`.

## Required automated validation

At the exact final product candidate SHA:

```text
yarn compile
yarn build
yarn test:sc
yarn test:library
yarn --cwd workspace-server compile
yarn --cwd workspace-server test
```

All must exit 0.

Frozen root/service dependency installs must also succeed in Actions without manifest/lockfile modification.

Focused deterministic tests must cover every automatable F03/F06 acceptance item specified by the frozen handoff.

## Mandatory browser evidence

At the same exact candidate SHA, execute all:

- T1-OP-01 — Graphical LINK selector baseline;
- T1-OP-02 — pointer marker edit + dirty/rating restoration;
- T1-OP-03 — keyboard/focus/accessibility;
- T1-OP-04 — LINK applicability transitions and clearing confirmation;
- T1-OP-05 — confirmed Structure marker save / server-derived Link Rating;
- T1-OP-06 — Preferred warning four-state readiness matrix;
- T1-OP-07 — No Preferred + manual alternate behavior.

Use disposable fixtures only.

No Owner Workspace data.

Capture durable browser evidence appropriate to each case, including screenshots and machine-readable DOM/accessibility/request/state evidence required by the frozen contract.

## Exact-SHA rule

The candidate returned as READY FOR EXTERNAL QA must be the exact product SHA exercised by the final successful Actions validation/evidence run.

No product commit may be added after that final successful run and still be called the validated candidate.

If the implementation changes after a successful run, rerun the complete required candidate gate against the new exact SHA.

## Implementation report publication

The historical file on the product branch:

`implementations/RUN-024_IMPLEMENTATION_REPORT.md`

is preserved and must not be rewritten.

DEV-006 must publish a new report:

`implementations/RUN-024_RESUMED_IMPLEMENTATION_REPORT.md`

as a NEW artifact on:

`meta/project-control`

after the final candidate Actions run.

The report is a control artifact, not a product-candidate commit. This avoids changing the exact validated candidate SHA after validation.

When publishing the report to `meta/project-control`:

- use the current control head as parent;
- use a non-force expected-head lease;
- add the new report artifact only;
- do not rewrite frozen sender artifacts;
- do not mutate PROJECT_STATE, registries or central dispositions;
- if the control head moved concurrently, reread the new head and publish atop it without dropping concurrent control history.

## Required Development report

The resumed implementation report must include:

- exact CONTROL SHA consumed;
- exact required starting RUN head;
- exact final candidate SHA;
- candidate ancestry proof;
- complete changed-file list and per-file reason;
- scope-boundary proof;
- proof schema/API/persistence/migrations/manifests/lockfiles remained unchanged as required;
- focused automated F03/F06 test inventory/results;
- all required compile/build/test results;
- T1-OP-01..07 result/evidence references;
- Actions run/job IDs and evidence artifact identifiers/digests;
- browser/OS/Node/Yarn versions;
- exact candidate custody before/after;
- warnings/limitations;
- explicit missing-evidence list, if any.

Final status must be exactly one of:

- `READY FOR EXTERNAL QA`;
- `IMPLEMENTATION BLOCKED`.

## Non-authorizations

DEV-006 must not:

- move feature/workspace-v0.1;
- move main;
- self-integrate;
- start Tranche 2;
- implement CR-0001.4;
- implement CR-0002;
- create migration 009;
- change schema/Workspace format;
- broaden scope;
- label its result External QA PASS.
