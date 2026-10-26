---
artifact_id: RUN-024-ENV-004-ENVIRONMENT-READINESS-REQUEST
artifact_type: environment_readiness_request
status: FROZEN
protocol_version: "1.0"
source_role: PROJECT_CONTROL
source_instance: PC-002
target_role: ENVIRONMENT_READINESS
target_instance: ENV-004
control_parent_sha: d1a9391f06ac749b1ad6c25bdaad1c56c96c5d8d
execution_target:
  branch: feature/workspace-run-024
  sha: 219ac252d50ae11b836a93baa20cc7f7d872367f
code_baseline:
  branch: feature/workspace-v0.1
  sha: 64cb5f4ca42348c6c403e64e0d61bdff8c32a281
substrate: github_hosted_actions
historical_reference:
  branch: ops/candidate-a-env-002-actions
  sha: bc52a568719e30429c4f517b8c49c1ad05f378ef
---

# RUN 024 — ENV-004 GitHub Actions Readiness Request

## Purpose

Prove the current RUN 024 execution target on GitHub-hosted Actions as the exact-SHA execution/evidence plane for a later Development instance.

This request supersedes the assumption that Work/cloud itself must provide both interactive authoring and browser execution.

It does not relax any frozen RUN 024 product or validation requirement.

## Operational branch

ENV-004 is authorized to create, if absent:

`ops/run-024-env-004-actions`

This branch is operational harness infrastructure only.

It must not become the RUN 024 candidate branch and must not be merged into feature/workspace-run-024, feature/workspace-v0.1 or main.

Recommended lineage is the historical proven harness:

`ops/candidate-a-env-002-actions @ bc52a568719e30429c4f517b8c49c1ad05f378ef`

ENV-004 may adapt only external workflow/harness logic required to target RUN 024 and collect readiness evidence.

## Exact target custody

The Actions job must separately check out:

`feature/workspace-run-024 @ 219ac252d50ae11b836a93baa20cc7f7d872367f`

with full Git metadata and prove:

- exact local HEAD;
- exact remote branch identity;
- clean tree before and after;
- merge-base = `64cb5f4ca42348c6c403e64e0d61bdff8c32a281`;
- exactly one commit baseline→target;
- only changed baseline→target path is `implementations/RUN-024_IMPLEMENTATION_REPORT.md`.

The operational harness checkout must remain separate from the target checkout.

## Toolchain and full gate capability

Against the exact RUN 024 execution target, prove the runner can complete:

```text
yarn install --frozen-lockfile --non-interactive
yarn --cwd workspace-server install --frozen-lockfile --non-interactive
yarn compile
yarn build
yarn test:sc
yarn test:library
yarn --cwd workspace-server compile
yarn --cwd workspace-server test
```

These are environment-readiness executions against the pre-implementation target. They provide no PASS credit for a future implementation candidate.

Do not change manifests or lockfiles.

## Shared application/browser proof

Using a neutral disposable fixture that does not exercise F-03 or F-06 acceptance behavior, prove in one Actions runner/network namespace:

- real Workspace Service;
- real Library;
- real Carder;
- supported Chromium/Playwright;
- browser reaches Library and Carder;
- real screenshots from both;
- DOM/accessibility-state capture;
- HTTP request/response interception;
- authoritative Canonical reads before/after;
- no unintended Canonical mutation from readiness activity.

Do not execute T1-OP-01 through T1-OP-07.

## Development publication model

ENV-004 does not commit product changes.

For later Development, candidate publication will use exact GitHub commit/ref operations with:

- current branch HEAD verified immediately before publication;
- candidate commit parent = exact expected RUN 024 head/candidate predecessor;
- non-force ref update;
- expected-head lease;
- no reset/rebase/force-push.

Actions then checks out the resulting exact candidate SHA independently and executes the frozen validation/evidence contract.

ENV-004 must state whether the Actions execution plane is reproducibly usable with this publication model.

## Durable evidence

Required report:

`validations/RUN-024/ENV-004_ENVIRONMENT_READINESS_REPORT.md`

Required durable evidence should include at minimum:

- Actions run ID and job ID;
- operational branch/head;
- exact target SHA;
- environment/tool versions;
- install and validation command results;
- Git preflight/final integrity;
- Workspace status;
- browser/version data;
- Library/Carder screenshots;
- DOM/accessibility evidence;
- HTTP/network trace;
- Canonical before/after;
- artifact ID/digest or equivalent durable hashes.

Final status must be exactly:

- `ENVIRONMENT READY`; or
- `ENVIRONMENT BLOCKED`.

## Prohibitions

ENV-004 must not:

- implement F-03 or F-06;
- execute T1-OP-01..07;
- modify or commit product code on feature/workspace-run-024;
- move feature/workspace-v0.1 or main;
- create RUN 025;
- start Tranche 2;
- claim Development or QA PASS.

Return to:

`PROJECT_CONTROL / PC-002`
