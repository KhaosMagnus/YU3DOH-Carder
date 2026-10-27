---
artifact_id: RUN-025-ENV-005-ENVIRONMENT-READINESS-REPORT
artifact_type: environment_readiness_report
status: ENVIRONMENT READY
source_role: ENVIRONMENT_READINESS
source_instance: ENV-005
target_role: PROJECT_CONTROL
target_instance: PC-002
control_input_sha: af6b13dfa7225d90204eb772915e4f6433bb651d
candidate_sha: dd968ba05e579461962bbcced0e9cae3cd4c3d23
baseline_sha: e07140d5a9555a17b7b2306a45625c14adfafc8e
ops_branch: ops/run-025-env-005-actions
ops_head: c5d5a08bad6ba110121a813a7db18af5d043f670
actions_run_id: 40561137872
actions_job_id: 122390152741
github_artifact_id: 12761650907
artifact_digest: sha256:293bfc8f1bf586c5008687fbf790cfda9b89c8ac4eb30614e08368de038f1cf6
behavioral_acceptance_cases_executed: 0
---

# RUN 025 — ENV-005 Environment Readiness Report

**Final status: ENVIRONMENT READY**

## Decision and authority

A new GitHub-hosted Actions execution proved both frozen installations, all six authoritative commands, real Workspace Service + real Library + supported Chromium-based Google Chrome in one runner/network namespace, evidence capture, fixture removal, clean exact-SHA custody, and externally retrievable evidence.

This is environment readiness only. F04-B01 through F04-B26 were not executed as acceptance cases. This report gives no QA PASS or integration authority. DQA-004's official PARTIAL remains unchanged. Return to PC-002 for separate DEPLOY-005 authorization.

Consumed control SHA: af6b13dfa7225d90204eb772915e4f6433bb651d.
Primary request: validations/RUN-025/ENV-005_ENVIRONMENT_READINESS_REQUEST.md.
Also consumed the ENV-005 route, ENVIRONMENT_READINESS role, DQA-004 report and PARTIAL disposition, RUN-025 gate reconciliation, frozen F-04 handoff, communication protocol, and historical ENV-004 report/harness.

The chat transfer repeated two root yarn test entries despite also saying they were not required. The primary request, route, reconciliation and frozen contract consistently identify yarn test:sc and yarn test:library. This execution uses that authoritative six-command set without adding a root test script or substituting direct Node commands.

Historical ENV-004 readiness was used only as infrastructure reference. No historical test result supplies current credit.

## Exact custody

Candidate: feature/workspace-run-025 @ dd968ba05e579461962bbcced0e9cae3cd4c3d23.
Baseline: feature/workspace-v0.1 @ e07140d5a9555a17b7b2306a45625c14adfafc8e.
Main: 54cc3aad246c89a29f2a18be63c539db68cae041.

The successful runner checked out the product separately from the operational harness at:
`/home/runner/work/YU3DOH-Carder/YU3DOH-Carder/run-025`.

Preflight and final custody both establish:
- exact local candidate HEAD and matching remote candidate ref;
- empty git status --porcelain, unstaged diff and cached diff;
- merge base and sole parent equal the exact baseline;
- exactly one commit ahead and the known seven-file candidate delta;
- candidate, integration and main remote refs unchanged;
- identical SHA-256 hashes before/after for both package manifests and both lockfiles.

Evidence: custody-preflight.json, custody-final.json, git-preflight.json, git-final.json.
The operational branch contains infrastructure only and was not merged into product branches.

## Current environment

| Component | Observed |
| --- | --- |
| Substrate | GitHub-hosted Actions, ubuntu-24.04 |
| OS | Ubuntu 24.04.5 LTS, Linux x64 |
| Runner agent | 2.338.0 |
| Runner image | ubuntu-24.04 / 20261012.334.1 |
| Node | v24.19.0 |
| Yarn | 1.22.22 |
| Git | 2.55.0 |
| External capture tooling | playwright-core 1.58.2 |
| Browser | Google Chrome 155.0.8059.39, Chromium engine, headless channel chrome |
| Browser executable | /usr/bin/google-chrome |
| Neutral smoke viewport | 1440 × 1000, DPR 1 |

Playwright was installed outside the candidate. Chrome was supplied by the runner. No candidate dependency, manifest or lockfile was modified. The narrow and intermediate acceptance viewports remain for DEPLOY-005; this neutral smoke does not claim their acceptance outcomes.

## Dependency installations and authoritative gate

All commands executed literally in the exact candidate checkout through an external logging wrapper.

| Command | Exit | Elapsed seconds |
| --- | --- | --- |
| yarn install --frozen-lockfile --non-interactive | 0 | 36.370 |
| yarn --cwd workspace-server install --frozen-lockfile --non-interactive | 0 | 4.819 |
| yarn compile | 0 | 8.670 |
| yarn build | 0 | 5.096 |
| yarn test:sc | 0 | 0.413 |
| yarn test:library | 0 | 6.755 |
| yarn --cwd workspace-server compile | 0 | 4.019 |
| yarn --cwd workspace-server test | 0 | 56.109 |

Server suite: **1088 PASS / 0 FAIL / 0 SKIP**, zero cancelled/todo.
Actual Yarn/tsx execution succeeded; no direct-Node substitute was used for the gate.
Individual logs and command JSON records retain exact arguments, timestamps and exit codes.
Nonfatal dependency/build warnings remain in raw logs; zero exits are not a claim that logs contain no warnings.

## Real runtime and neutral smoke

The harness used the exact candidate's compiled bootstrap/service and actual Vite entrypoint. No API responses or application components were mocked.

- Service: http://127.0.0.1:4312
- Library: http://127.0.0.1:3000/ygocarder/library/
- Disposable Workspace: env-005-actions-readiness.
- Fixture card: 199115a3-4e7a-4ebb-b442-faf4a0cf4822.
- Fixture: one CONTINUOUS Spell named ENV005 Continuous Smoke, password 12990005, confirmations/provenance and one tiny generated managed BS asset.
- Browser activity: open Library, wait for the fixture result, capture screenshot/DOM/accessibility/control metadata. No mode switch, Batch interaction, Detail interaction or Carder launch was performed.
- Canonical HTTP snapshots before and after are byte-identical.
- Browser and real service closed; Vite was signaled to terminate; disposable Workspace removal succeeded and is recorded in fixture-cleanup.json.

The screenshot was visually inspected after download and shows the real Library heading, Workspace READY and the neutral fixture. This verifies capture/reachability, not product layout acceptance. Browser runtime used Vite; built distribution serving was not separately probed.

## Capture evidence

- library-smoke.png: actual full-page screenshot.
- library-dom.html: actual DOM.
- library-accessibility.yml: Playwright ARIA snapshot.
- library-controls.json: machine-readable control metadata.
- network.json: 6 events, comprising 3 intercepted requests continued unmodified and 3 actual HTTP 200 responses, including bodies/headers.
- Captured API endpoints: workspace/status, library/facets, library/cards with EN / limit 50 / offset 0.
- browser-errors.json: empty page-error capture.
- console-errors.json: empty console-error capture.
- readiness-result.json, environment.json, browser.json, workspace-status.json and final-status.json: machine-readable runtime records.
- canonical-before.json and canonical-after.json: identical authoritative Service responses.
- fixture-cleanup.json: disposable Workspace removed.

Page/console listeners were configured before navigation and produced empty arrays. No synthetic application error was injected. DOM/ARIA capture is a capability demonstration, not an accessibility audit.

## Durable evidence and integrity

Successful [Actions run 40561137872](https://github.com/KhaosMagnus/YU3DOH-Carder/actions/runs/40561137872).
Successful [job 122390152741](https://github.com/KhaosMagnus/YU3DOH-Carder/actions/runs/40561137872/job/122390152741).

Operational head: c5d5a08bad6ba110121a813a7db18af5d043f670 on ops/run-025-env-005-actions.

[Artifact 12761650907](https://github.com/KhaosMagnus/YU3DOH-Carder/actions/runs/40561137872/artifacts/12761650907):
182,659 bytes; Actions expiration 2027-01-25T18:33:51Z.

Downloaded ZIP SHA-256 matches the Actions digest:
`293bfc8f1bf586c5008687fbf790cfda9b89c8ac4eb30614e08368de038f1cf6`.

All 38 entries in manifest.sha256 were independently verified after download.
A byte-for-byte copy is committed with this report at [ENV-005/ENV-005_EVIDENCE.zip](ENV-005/ENV-005_EVIDENCE.zip), preserving evidence independently of Actions retention. Core text records are also published beside the ZIP for direct review.

## Attempt provenance

| Attempt | Operational SHA | Observed outcome |
| --- | --- | --- |
| 40559807626 / job 122385467223 | 914151e32df22bf0a18d2cd091b0ff60a37db9c4 | Six-command gate and installs succeeded, but browser provisioning remained in_progress at report preparation. No readiness credit. It was not relabeled PASS or represented as a confirmed failed run. |
| 40561137872 / job 122390152741 | c5d5a08bad6ba110121a813a7db18af5d043f670 | Complete execution, smoke, final custody and artifact publication succeeded. |

Attempt 1 used Playwright's install --with-deps chromium provisioning. Its prolonged provisioning has no confirmed root cause in this report; its downloadable job log was unavailable while active. Attempt 2 uses the runner's installed Chrome and bounds isolated capture-tool installation to three minutes. No product correction was made.

Attempt 1 may finish later under its original 40-minute workflow timeout. Its final GitHub conclusion must be consulted separately; no claim of cancellation or completed cleanup for that attempt is made here. The readiness decision rests exclusively on the fully completed second attempt.

## Reproduction and return

Rerun successful Actions run 40561137872 to use its exact operational commit and pinned product SHA. A fresh runner recreates the disposable fixture, executes both installations and all six literal commands, captures evidence, removes the fixture, checks final custody and publishes a hashed artifact.

This proves an executable substrate, not a continuously hosted application. DEPLOY-005 must run the missing acceptance matrix and required viewports/state/network evidence afresh under separate PC-002 authorization. Avoid treating this neutral screenshot as any F04-B acceptance result.

No candidate/product ref mutation, QA verdict, integration, dependency change or CR-0002 implementation occurred.

RETURN: ENVIRONMENT_READINESS / ENV-005 → PROJECT_CONTROL / PC-002.

**Final status: ENVIRONMENT READY**
