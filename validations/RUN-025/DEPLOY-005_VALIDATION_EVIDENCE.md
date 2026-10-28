---
artifact_id: RUN-025-DEPLOY-005-VALIDATION-EVIDENCE
status: EVIDENCE READY
source_role: DEPLOYMENT_VALIDATION
source_instance: DEPLOY-005
target_role: PROJECT_CONTROL
target_instance: PC-002
control_input_sha: ff89d489cb225ba10775617dd07aee31c372f4ac
candidate_sha: dd968ba05e579461962bbcced0e9cae3cd4c3d23
baseline_sha: e07140d5a9555a17b7b2306a45625c14adfafc8e
official_qa_verdict: NOT ISSUED
---

# RUN 025 — DEPLOY-005 Validation Evidence

**Final status: EVIDENCE READY. This is not QA PASS.** Return to PC-002 for adjudication by the SAME DQA-004.

## Authority and custody

Consumed request, route, ENV-005 report/READY disposition, DQA-004 report/PARTIAL disposition, gate reconciliation, frozen F-04 handoff, role and publication protocols at control SHA `ff89d489cb225ba10775617dd07aee31c372f4ac`.

Candidate `feature/workspace-run-025` is `dd968ba05e579461962bbcced0e9cae3cd4c3d23`; its sole parent and merge-base are baseline `feature/workspace-v0.1` at `e07140d5a9555a17b7b2306a45625c14adfafc8e`. Main remains `54cc3aad246c89a29f2a18be63c539db68cae041`.

The successful Actions runner used a separate exact-candidate checkout, verified an empty working tree before/after, one commit/seven changed paths over baseline, protected remote refs, and unchanged manifest/lockfile hashes. Product refs were independently rechecked before publication. No product edits, merges, integration or CR-0002 work occurred.

## Execution provenance

- Operational branch: `ops/run-025-deploy-005-actions`.
- Executed harness: `f4cc120d21694dc10032bd92cf97f8e5d42f8e14`.
- [Successful Actions run 40564959018](https://github.com/KhaosMagnus/YU3DOH-Carder/actions/runs/40564959018).
- [Job 122403657714](https://github.com/KhaosMagnus/YU3DOH-Carder/actions/runs/40564959018/job/122403657714), conclusion success.
- Ubuntu 24.04.5 LTS; Linux 6.17.0-1022-azure x64; runner image 20261023.334.3; Node v24.19.0; Yarn 1.22.22; playwright-core 1.58.2; Chromium-engine Google Chrome 155.0.8059.39.
- Viewports: 1440×1000, 900×1000, 390×844, all DPR 1.
- Schema 8; Workspace format 1; migrations 001–008, no 009.
- Main fixture: RUN025-F04-121-v1, 121 real-Service cards; mixed MONSTER/SPELL/TRAP/TOKEN, null-password Tokens, classifications, Broad/Narrow filters and seeded asset-binding readiness combinations. UUIDs are generated per execution and recorded with revisions in fixture-info.json; they remain stable throughout the run.
- Empty fixture: separate real Service on port 4313. Main Service port 4312; candidate Vite port 3000; baseline Vite port 3001.
- No Owner Workspace used. Both successful-run roots were removed, recorded in fixture-cleanup.json.

## Literal command gate

The frozen reconciliation resolves the transfer's repeated root `yarn test` typo: authoritative commands are `test:sc` and `test:library`. No root test script was added and no direct-Node substitute was used.

| Command | Exit |
| --- | ---: |
| `yarn install --frozen-lockfile --non-interactive` | 0 |
| `yarn --cwd workspace-server install --frozen-lockfile --non-interactive` | 0 |
| `yarn compile` | 0 |
| `yarn build` | 0 |
| `yarn test:sc` | 0 |
| `yarn test:library` | 0 |
| `yarn --cwd workspace-server compile` | 0 |
| `yarn --cwd workspace-server test` | 0 |

Server suite: 1088 passed, zero failed/skipped/cancelled. Raw logs and timestamped command records are retained. Warnings in these logs are not suppressed.

## Case observations

All 26 cases executed independently in the successful run. “Observed” below records evidence production, not an official acceptance verdict. Every case has F04-Bnn.json, F04-Bnn.aria.yml and F04-Bnn.png in the ZIP; evidence.json contains cross-step proofs and network requests. Additional captures record transient/loading/error/focus states at the moment exercised.

| Case | Stimulus | Observation |
| --- | --- | --- |
| F04-B01 | Fresh load | LIST default and full identity/classification/readiness information observed. |
| F04-B02 | 1440 Grid | 3 columns; identity, readiness and separate checkbox observed. |
| F04-B03 | 900 Grid | 2 columns observed. |
| F04-B04 | 390 Grid | 1 column; document width 390, no horizontal overflow. |
| F04-B05 | 390 List | 1 column; Detail, Batch and view actions reachable. |
| F04-B06 | Search/facet/page | F04 Search + F04 Broad + page 2 + limit 50 preserved both directions. |
| F04-B07 | Pure mode network | Zero additional API requests in recorded switch windows; no mutation request. |
| F04-B08 | Cross-page Batch | One hidden page-1 member preserved; Preview items/revisions equal before/after. |
| F04-B09 | Filtered Batch | Two cross-page members hidden by F04 Narrow; both frozen revisions preserved. |
| F04-B10 | Visible checkbox | Same selected checkbox remains checked after mode change. |
| F04-B11 | Pointer checkbox | Batch changes; no Detail opens. |
| F04-B12 | Pointer Detail | Exact card opens; Batch count unchanged. |
| F04-B13 | Keyboard Detail | Tab reaches action; Enter and Space open exact card. |
| F04-B14 | Keyboard Batch | Space toggles checkbox without changing selected Detail identity. |
| F04-B15 | Keyboard view | Named group and two native radios; ArrowRight selects List and retains focus. |
| F04-B16 | Open Detail/view | Same open Detail identity through both mode changes; selected marker retained. |
| F04-B17 | Open Detail/page/filter | Identity retained when hidden; page return restores marker; filter hides without replacement. |
| F04-B18 | Readiness | All 50 visible summaries compared in both modes against real API variant count and readiness booleans. |
| F04-B19 | Loading | One full-width loading panel in both modes; held real requests then released. |
| F04-B20 | Empty/no match | Real empty Service response and real no-match query; exact full-width messages in both modes. |
| F04-B21 | Error/Retry | Two intentional HTTP 503 responses; error retained mode; Retry restores real results. |
| F04-B22 | Pagination | 50 items on page 2, offset 50, same totals, no size changer in both modes. |
| F04-B23 | Selected accessibility | Visible Detail selected text and accessible button name in both modes. |
| F04-B24 | Focus styling | Visible View, Detail and Batch focus in both modes; screenshot and computed-style records. |
| F04-B25 | Ordered equivalence | Ordered DOM card_id/revision before/after identical and independently matched to captured authoritative browse responses. |
| F04-B26 | Runtime/nonmutation | No page exceptions; baseline warnings and injected errors retained; Workspace snapshots identical. See qualifications. |

## Evidence interpretation and limits

B06/B07/B25: evidence.json proofs B06-B07-B25-page2 and B06-return preserve query, facets, page, ordered IDs/revisions and zero request deltas. Independent post-download checking matched the ordered IDs/revisions against actual recorded browse response bodies. Page size is 50. This does not issue a fresh browse to prove a pure view switch, since a fresh browse would violate the measurement.

B08/B09: Batch membership and expected_revision are read through the real non-mutating Batch Preview API before and after page/filter/mode transitions; four Preview POSTs are recorded. No Apply, PUT, PATCH or DELETE occurred. B10 records visible checkbox restoration. Before/after Workspace table snapshots cover Canonical and other persisted tables, with identical compact-JSON SHA-256:
`9c9683e35cf7370f86e79e9218d3cbe66ffb3a7589ec9128b35e2305e0f1077f`.

B16/B17 qualification: while the existing modal Detail Drawer is open, background view/page/facet controls are covered by the modal. The harness dispatches DOM click/mousedown events to exercise the existing handlers without closing Detail. These observations prove state preservation under those transitions, not ordinary pointer reachability through the modal. Pointer/keyboard controls are separately exercised with the Drawer closed. This limitation is explicitly referred to DQA-004; criteria were not amended.

B19 holds and then continues real browse requests. B20 proxies browse to the independently seeded empty real Service only for the empty state; no-match uses an actual search on the 121-card Service. B21 deliberately injects two 503 responses and then removes interception before Retry. These test stimuli are not product changes.

B26: page exceptions are empty. Raw console includes a favicon 404 and two React scrollLocker warnings; the same warning classes were independently reproduced at the exact baseline. Two resource-error messages correspond to the deliberately injected 503s. Six requestfailed records report GET /library/facets with net::ERR_ABORTED. Their cause was not independently isolated; they remain visible for DQA review and are not called successful HTTP responses. The harness finds no additional unexpected console/page errors attributable to F-04; this is narrower than claiming an entirely empty console/network failure log. Pure mode-switch measurement windows contain zero additional requests.

Readiness comes from real API summaries; asset binding rows use the candidate's existing test fixture pattern rather than Owner artwork. Visual review covered baseline List/Grid, responsive views, search/page state, hidden selections, selected Detail, focus and empty-state screenshots. Narrow Grid and selected Detail focus were additionally inspected at full image size.

## Attempt history

1. Run 40564804923 / job 122403104268, harness ba93b7fa39ba8c413ae53de5bb4925a061b5dbf2: completed six-command gate, but browser.log records a 30-second timeout waiting for the first `.library-card` in the baseline page before the acceptance matrix. The workflow ultimately concluded cancelled after its 40-minute bound; runner logs show orphan process termination. Explicit fixture-cleanup.json and final-status.json were not produced for this attempt. Do not infer successful application-level cleanup or acceptance credit. The precise baseline startup failure cause is unresolved. Its small partial artifact is preserved separately.
2. Run 40564959018 / job 122403657714, harness f4cc120d21694dc10032bd92cf97f8e5d42f8e14: full gate, 26 case observations, cleanup and final custody complete. The only harness revision explicitly routed empty-state requests from the Vite origin to port 4313. It is not asserted to fix the first attempt's unrelated baseline timeout. Evidence readiness rests solely on this complete attempt.

## Durable publication and integrity

[DEPLOY-005_EVIDENCE.zip](DEPLOY-005/DEPLOY-005_EVIDENCE.zip) is a byte-for-byte copy of Actions artifact 12763235984, 5,916,756 bytes. SHA-256:
`a0ead6b9440652ffd71966739548a5c98d437ee9577b4a5125ccf0762af8b829`.

The Actions digest and downloaded ZIP digest match. All 211 entries listed in manifest.sha256 were verified; the archive contains 53 PNG screenshots plus state/ARIA/network/fixture/custody/command records. Core machine-readable records and the manifest are also published beside the ZIP. The manifest paths refer to files inside the extracted ZIP. ZIP.sha256 verifies the archive itself. Actions retention ends 2027-01-25; the Git copy preserves it independently of retention.

[DEPLOY-005_ATTEMPT-1.zip](DEPLOY-005/DEPLOY-005_ATTEMPT-1.zip) preserves partial artifact 12765521243 (92,118 bytes), SHA-256 `5cab67ae64fe7b2c8ca5258e933dfc438a618612a2a1c95a95177c861b73b305`. It provides no acceptance credit.

## Reproduction and return

Rerun Actions run 40564959018 to execute the same operational SHA with the pinned candidate and baseline. The workflow performs frozen installs, six literal commands, real disposable fixtures, browser matrix, cleanup, custody and artifact hashing. Inspect its exact workflow and validation/deploy005-*.cjs at the operational SHA for selectors, inputs, timing and assertions. IDs vary per new fixture and are recorded anew. A startup timeout like attempt 1 can leave browser processes until runner termination; do not substitute incomplete rerun output for this package.

Return: DEPLOYMENT_VALIDATION / DEPLOY-005 → PROJECT_CONTROL / PC-002. Route this evidence and its explicit qualifications to SAME DESIGN_QA / DQA-004 for official exact-candidate adjudication. No DQA-005, QA PASS, integration authorization or product mutation is issued here.

**Final status: EVIDENCE READY.**
