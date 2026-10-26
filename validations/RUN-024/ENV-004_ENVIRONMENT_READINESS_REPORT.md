---
artifact_id: RUN-024-ENV-004-ENVIRONMENT-READINESS-REPORT
artifact_type: environment_readiness_report
status: ENVIRONMENT READY
protocol_version: "1.0"
source_role: ENVIRONMENT_READINESS
source_instance: ENV-004
target_role: PROJECT_CONTROL
target_instance: PC-002
control_input_sha: a837517a2484e177fac3bd6364556e569e7c6bcf
execution_branch: feature/workspace-run-024
execution_sha: 219ac252d50ae11b836a93baa20cc7f7d872367f
baseline_sha: 64cb5f4ca42348c6c403e64e0d61bdff8c32a281
substrate: github_hosted_actions
ops_branch: ops/run-024-env-004-actions
ops_head: 5aa54988eec0d8c07626f178677660f817640b2a
actions_run_id: 40289640257
actions_job_id: 121461404019
artifact_id_github: 12635601038
artifact_digest: sha256:1d448982b476db0a5c25f5861d326c107c0d862c6b796bd35e225f7c7cf72b6b
behavioral_cases_executed: 0
---

# RUN 024 — ENV-004 Environment Readiness Report

**Final status: ENVIRONMENT READY**

## Decision and limit

The exact pre-implementation RUN 024 target completed both frozen dependency installations, all six requested validation commands, and a real Service + Library + Carder + Chromium smoke probe in one GitHub-hosted runner/network namespace. Exact clean Git custody, baseline ancestry, screenshots, DOM/accessibility capture, unmodified HTTP interception, authoritative Canonical before/after and durable artifact retrieval were demonstrated.

The Actions execution/evidence plane is usable with the split publication model defined by PC-002. This is environment readiness only. It gives no implementation/External QA PASS, no future candidate test credit and no T1-OP acceptance credit. Only PC-002 may assign successor Development.

## Receipt and authority

At intake, the GitHub connector verified meta/project-control at the exact supplied input SHA. Direct Git ls-remote independently matched it. Main, the integrated baseline and RUN 024 refs matched the envelope.

Read completely at the input SHA:

- PROJECT_STATE.md
- routing/ROUTE-RUN-024-ENV-004.md
- validations/RUN-024/ENV-004_ENVIRONMENT_READINESS_REQUEST.md
- runs/RUN-024_AUTHORIZATION.md
- runs/RUN-024_BLOCKER_DISPOSITION.md
- runs/RUN-024_DEV-005_BLOCKER_DISPOSITION.md
- runs/RUN-024_ENV-003_BLOCKER_DISPOSITION.md
- validations/RUN-024/ENV-003_ENVIRONMENT_READINESS_REPORT.md
- handoffs/POST_P6_TRANCHE_1_IMPLEMENTATION_HANDOFF.md
- roles/ENVIRONMENT_READINESS.md
- protocols/COMMUNICATION_PROTOCOL.md
- chats/instances/ENV-004.md
- validations/P5-CANDIDATE-A-001/ENV-002_ENVIRONMENT_READINESS_REPORT.md

Historical workflow and readiness script were read at bc52a568719e30429c4f517b8c49c1ad05f378ef and adapted externally. Historical pre-authorization statements in the design handoff do not supersede the current ENV-004 route.

Concurrent control publications were observed during execution. They preserved the ENV-004 route and product refs. Publication uses the current control head as parent with a non-force expected-head lease; it does not overwrite those concurrent artifacts or rewrite the sender's frozen artifacts.

## Exact target custody

Operational harness checkout: `$GITHUB_WORKSPACE/ops-control`.

Target checkout: `$GITHUB_WORKSPACE/run-024`, full Git metadata, detached at the exact target commit.

Both preflight and final custody assert:

| Check | Observed |
| --- | --- |
| Local HEAD | 219ac252d50ae11b836a93baa20cc7f7d872367f |
| Remote refs/heads/feature/workspace-run-024 | 219ac252d50ae11b836a93baa20cc7f7d872367f |
| Working status, unstaged diff, cached diff | Empty |
| Merge-base with baseline | 64cb5f4ca42348c6c403e64e0d61bdff8c32a281 |
| Sole target parent | 64cb5f4ca42348c6c403e64e0d61bdff8c32a281 |
| Baseline→target commit count | 1 |
| Only baseline→target path | implementations/RUN-024_IMPLEMENTATION_REPORT.md |

`custody-preflight.json` and `custody-final.json` also retain matching SHA-256 hashes for both manifests and lockfiles. No product source, tests, manifests or lockfiles changed. No branch recreation, reset, rebase or force-push occurred.

## Environment and gate

| Component | Observed |
| --- | --- |
| Runner | GitHub-hosted ubuntu-24.04, Ubuntu 24.04.5 LTS, Linux x64 |
| Node | v24.19.0 |
| Yarn | 1.22.22 |
| Git | 2.55.0 |
| Playwright Core | 1.58.2, installed outside target |
| Chromium | 145.0.7632.6, installed outside target |
| Workspace | format 1, database schema 8, READY, read_only false |

All commands ran against the exact target with unchanged existing lockfiles:

| Command | Exit | Elapsed |
| --- | --- | --- |
| `yarn install --frozen-lockfile --non-interactive` | 0 | 36.83 s |
| `yarn --cwd workspace-server install --frozen-lockfile --non-interactive` | 0 | 4.43 s |
| `yarn compile` | 0 | 8.92 s |
| `yarn build` | 0 | 3.13 s |
| `yarn test:sc` | 0 | 0.43 s |
| `yarn test:library` | 0 | 6.08 s |
| `yarn --cwd workspace-server compile` | 0 | 4.22 s |
| `yarn --cwd workspace-server test` | 0 | 51.81 s |

Server suite: 1088 tests, 1088 pass, 0 fail/cancelled/skipped/todo. Simplified Chinese tests passed. Library client scripts and Workspace bridge checks passed; individual inventories remain in test-library.log (including RC 32 checks and bridge 72 checks). No aggregate count is invented across heterogeneous client scripts.

Non-blocking observations: Yarn reported an alias cache-destination warning and unmet peer dependencies; build reported a third-party PURE annotation warning. The Actions v4 tools were run under the platform's Node 24 compatibility handling. All required commands exited 0. Browser pageerror capture was empty. These observations do not establish F-03/F-06 behavior.

The built output was produced by yarn build. Browser evidence uses the exact target's real Vite entrypoints; serving the built distribution was not separately tested.

## Neutral disposable fixture and real runtime

Workspace: env-004-actions-readiness, created only on the runner outside the target checkout. No Owner Workspace was used.

- Card: d4c1d70a-6b00-4115-bbe9-14e1a77b4ddf.
- Family/subtype: SPELL / CONTINUOUS.
- Password: 12990004.
- Name: ENV004 Continuous Smoke.
- Revision: 2.
- STRUCTURE and TEXT:EN: CONFIRMED, MANUAL provenance source_ref env-004-readiness, provenance IDs 1 and 2.
- One disposable Default variant with a generated 2×2 solid-color BS PNG, used only to enable a neutral STANDARD launch.

The external harness loads the real compiled target service/bootstrap, creates the fixture through its real service APIs, and launches the actual Vite CLI. It does not substitute application routes, renderer logic, readiness computation or API responses.

Reachable on the same runner:

- Service: http://127.0.0.1:4312
- Library: http://127.0.0.1:3000/ygocarder/library/
- Carder: http://127.0.0.1:3000/ygocarder/ with the real Workspace launch intent (full URL in readiness-result.json).

The browser opened Library, selected the neutral card, entered Variants / Assets and invoked Open Standard. It did not edit markers, change preference, exercise warning matrices, save Canonical data or invoke Carder write-back.

The service/browser were closed at probe end and the disposable runner was torn down. This report establishes reproducibility, not a continuously available hosted application. Captured fixture-only asset/write grants refer to that ended local runtime.

## Browser, DOM/accessibility and HTTP evidence

Visual review of library-smoke.png shows the real Library heading, READY status and fixture result. Visual review of carder-smoke.png shows the real Carder interface, Workspace intent banner and rendered CONTINUOUS Spell with fixture name/text/password and solid-color test artwork. The browser waited for the visible completed `#preview-canvas.js-export-available` before Carder capture.

Both applications have:

- full-page PNG screenshots;
- complete DOM HTML;
- Playwright body ARIA snapshots;
- machine-readable control metadata.

These prove capture capability, not an accessibility conformance audit.

`network.json` contains 18 events: 9 intercepted API requests and 9 actual responses, all HTTP 200. Requests were continued unmodified. Response status/headers/body and request method/body/timestamp are captured.

Observed API traffic includes Workspace status, facets, cards/detail, editor metadata, variants, two real prepare-working-card POSTs from the UI flow and one real asset-content GET. The only POST endpoint observed is prepare-working-card; no Canonical mutation or write-back endpoint was invoked. No response was mocked or fulfilled by the harness.

## Authoritative Canonical preservation

Canonical snapshots were read over HTTP directly from the real Service card-detail endpoint, after fixture setup and before/after browser activity. They retain identity, revision, structure, localization, confirmations and provenance.

Files canonical-before.json and canonical-after.json are byte-identical, also asserted as deep-equal in the probe.

Both SHA-256:

`2d6c58d92f6f91e2aaedf4596690091b9e4ecbac1bd4dff1fb7356e7b1029136`

No unintended Canonical change was observed. Fixture creation/confirmation/asset ingest happened before the baseline snapshot, as authorized readiness setup.

## Durable evidence

Successful [Actions run 40289640257](https://github.com/KhaosMagnus/YU3DOH-Carder/actions/runs/40289640257), [job 121461404019](https://github.com/KhaosMagnus/YU3DOH-Carder/actions/runs/40289640257/job/121461404019): success.

Operational branch/head:

`ops/run-024-env-004-actions @ 5aa54988eec0d8c07626f178677660f817640b2a`

[Actions artifact 12635601038](https://github.com/KhaosMagnus/YU3DOH-Carder/actions/runs/40289640257/artifacts/12635601038): 1,027,725 bytes; Actions expiry 2027-01-24T08:03:16Z.

ZIP SHA-256 / Actions digest:

`1d448982b476db0a5c25f5861d326c107c0d862c6b796bd35e225f7c7cf72b6b`

A byte-for-byte copy is retained independently of Actions expiry in this control publication:

[ENV-004 evidence ZIP](ENV-004/ENV-004_EVIDENCE.zip).

The downloaded ZIP digest matched Actions. All 41 manifest entries verified locally. The archive includes manifest.sha256 plus the 41 hashed command logs/results, custody, environment, screenshots, DOM/accessibility, HTTP/network, Canonical and readiness result files. The extracted manifest and core machine-readable results are also retained beside this report for direct review.

## Harness corrections and attempt provenance

Only operational harness files were added relative to historical bc52a568719e30429c4f517b8c49c1ad05f378ef:

- .github/workflows/run-024-env-004-readiness.yml
- validation/env004-command.cjs
- validation/env004-custody.cjs
- validation/env004-readiness.cjs

Earlier attempts are preserved, not relabeled successful:

| Run | Operational SHA | Outcome |
| --- | --- | --- |
| 40288479799 | 0c25f340dec360ae981d0bc83486403076017fb7 | Workflow rejected before jobs; corrected job-level runner-context expressions to github.workspace paths. |
| 40288545041 | 1ca1db98199c57487059a821c4acdfe0b4341fce | Full command gate passed; probe selected hidden debug-canvas and timed out. Final target custody clean. |
| 40289101872 | 3fd364cc6c75a2e80a7eb16056aa4cc4141f26a3 | Full command gate passed; export-canvas was render-ready but hidden outside hover; probe timed out. Final target custody clean. |
| 40289640257 | 5aa54988eec0d8c07626f178677660f817640b2a | Complete gate, neutral probe, final custody and upload succeeded using visible preview canvas. |

These failures arose from the external harness. No product correction was made or inferred necessary.

## Reproduction and later publication model

The final operational workflow is push-triggered for its authorized branch and harness paths. To reproduce the evidence exactly, rerun successful Actions run 40289640257 (same operational commit and pinned target). The job provisions isolated tooling, independently checks out target SHA/history, runs the eight recorded commands, creates a fresh neutral fixture, captures browser evidence, checks final custody and uploads an independently hashed artifact.

GitHub authoring operations successfully constructed operational Git trees/commits and published the initial operational head with non-force expected-head lease. Actions independently obtained the resulting exact operational SHA and the separate exact product SHA. This demonstrates the separation of publication and execution planes without moving a product ref.

A later authorized Development instance can publish a candidate via verified parent + non-force expected-head ref update, then have Actions check out that candidate exactly. It must adapt the external target/custody checks to the authorized candidate and run the complete frozen validation and browser contract afresh. The current readiness workflow deliberately requires the current report-only ancestry and cannot be used unchanged to claim readiness of an implemented candidate.

No product candidate publication was attempted here. Future product edits, focused tests and T1-OP evidence remain unexecuted and require PC-002 authorization.

## Boundaries and return

T1-OP-01 through T1-OP-07: 0 executed. No F-03/F-06 implementation. No product branch commits. No main/integrated-baseline movement. No schema/API/persistence change, migration 009, Tranche 2 work or RUN 025. Publication adds only this ENV-004 report/evidence to control; existing sender artifacts are not rewritten.

Return: ENVIRONMENT_READINESS / ENV-004 → PROJECT_CONTROL / PC-002.

Recommended next action: PC-002 may now evaluate authorization of a successor Development instance for the same RUN 024 using the proven split model. Avoid treating this readiness result as implementation completion or QA approval.

**Final status: ENVIRONMENT READY**
