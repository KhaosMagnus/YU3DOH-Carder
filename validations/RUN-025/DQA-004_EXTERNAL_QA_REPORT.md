# RUN 025 — DQA-004 External QA Report

status: FINAL
official_qa_result: PARTIAL
source: DESIGN_QA / DQA-004
target: PROJECT_CONTROL / PC-002
request: CR-0001.4 / F-04 — Library Grid/List
candidate: feature/workspace-run-025 @ dd968ba05e579461962bbcced0e9cae3cd4c3d23
baseline: feature/workspace-v0.1 @ e07140d5a9555a17b7b2306a45625c14adfafc8e
control_intake: meta/project-control @ 6495bd9a0024aa9d3d7d6dcdd210b44ecde9b5f3

## Custody and scope

Git remote refs were independently checked at intake and immediately before this report. Candidate, baseline, main (`54cc3aad246c89a29f2a18be63c539db68cae041`), and control refs matched the transfer. The candidate's direct parent and merge base are exactly the baseline; it is one commit ahead. QA used a clean detached checkout at the exact candidate. `git diff --check` passed.

Complete candidate diff reviewed. Changed files are exactly `package.json`, `src/library/app.tsx`, `src/library/library-result-card.tsx`, `src/library/library.scss`, `scripts/test-library-grid-list.ts`, `scripts/run025-qa-fixture.cjs`, and `scripts/run025-ui-evidence.cjs`. The sole `package.json` edit appends the focused test to `test:library`; dependencies did not change. Production edits are confined to Library result presentation: session-local LIST/GRID state, native radios, a sibling Detail button and Batch checkbox, result-card markup, and responsive styles. No server, API/model, domain, migration, persistence, Carder, Batch state, or Detail panel file changed. No scope violation or confirmed product regression was found in the diff. Runtime behavior remains subject to the missing browser evidence.

Static architecture guard and tests found schema 8, Workspace format 1, migrations 001–008, and no 009. No view-mode browse parameter, server field, storage persistence, readiness recomputation, or product ref movement was found. These are diff/static findings, not a substitute for the requested browser and Workspace non-mutation trace.

## Environment and provenance

Independent DQA-004 scratch runner: Ubuntu 24.04.3 LTS, Linux 6.18.55 x86_64, Node v24.22.1, Yarn 1.22.22 (Corepack). The candidate and server dependencies were installed with frozen lockfiles. No Owner Workspace data was used. A disposable real Workspace Service fixture started successfully with identity `RUN025-F04-121-v1`, 121 cards, schema 8, Workspace format 1, and root `/tmp/yu3doh-run025-disposable-RiyZvz`; it was stopped and removed at the end. Mixed MONSTER/SPELL/TRAP/TOKEN cards, a null-password Token, classifications, filters, and seeded readiness states are defined by the committed fixture script. Fixture construction was observed; browser rendering and its API responses were not captured.

Browser engine/version: **unavailable**. No browser viewport/DPR execution, screenshots, page/console errors, or browser Library API request log were produced. The requested 1440×1000, 900×1000, and 390×844 at DPR 1 are **unexecuted**, not inferred. The official Playwright Chromium download returned zero MiB and failed ZIP validation. A cloud browser attempting the local Vite URL returned `net::ERR_CONNECTION_REFUSED`. The development-local ZIP/report/screenshots were not transferred and were not used as QA evidence.

## Automated gate

| Command at candidate | Exit | Independent finding |
| --- | ---: | --- |
| `yarn compile` | 0 | TypeScript client compile passed. |
| `yarn build` | 1 | Prebuild `tsx` could not bind `/tmp/tsx-0/*.pipe` (`EPERM` in this runner). Direct `node --import tsx scripts/build-asset-manifest.ts` followed by Vite build exited 0. |
| `yarn test` (first) | 1 | No `test` script exists in candidate `package.json`. |
| `yarn test` (second) | 1 | Same missing script. The transfer asks for this twice, while the frozen handoff names `test:sc` and `test:library`. |
| `yarn test:sc` | 1 | Runner blocks `tsx` IPC socket. Equivalent direct Node execution exited 0. |
| `yarn test:library` | 1 | Same IPC restriction. The three scripts executed individually through `node --import tsx` and exited 0. |
| `yarn --cwd workspace-server compile` | 0 | Server TypeScript compile passed. |
| `yarn --cwd workspace-server test` | 1 | Same `tsx` IPC restriction. Equivalent `node --import tsx --test test/*.test.ts` exited 0: 1,088 passed, zero failed/skipped. |

The literal mandatory gate does **not** satisfy the transfer's all-zero condition. The direct Node commands are useful independent code evidence, but are reported separately and do not rewrite the literal exit results. A runner permitting `tsx` IPC can rerun the frozen six-command gate; Project Control must reconcile the transfer's two nonexistent `yarn test` entries with the frozen contract before they can be treated as a pass condition.

## Focused deterministic matrix

The committed `scripts/test-library-grid-list.ts` executed independently at the candidate with `node --import tsx` and printed PASS for U01–U16. The previous Library client, Workspace bridge, Simplified Chinese, and server suites separately exited 0. Findings below distinguish the assertion's reach from the browser proof it cannot provide.

| Case | Result and qualification |
| --- | --- |
| F04-U01 | PASS — initial constant LIST. |
| F04-U02 | PASS, bounded — LIST/GRID render projection; mounted state transition awaits browser. |
| F04-U03 | PASS, bounded — same URL builder output; zero browser request awaits B07. |
| F04-U04 | PASS — query/facet filter object unchanged in deterministic render. |
| F04-U05 | PASS — offset 50 and limit 50 unchanged in deterministic render. |
| F04-U06 | PASS, bounded — selected marker rendered in both modes; open Detail identity awaits B16/B17. |
| F04-U07 | PASS — same Batch IDs and frozen revisions from selection/request helper. |
| F04-U08 | PASS — hidden count preserved for a hidden selected item. |
| F04-U09 | PASS — refreshed card revision does not overwrite frozen selection. |
| F04-U10 | PASS — LIST identity, all classifications, variant/readiness text, checkbox markup. |
| F04-U11 | PASS — GRID minimum content and password/Token alternatives in markup. |
| F04-U12 | PASS — all four readiness boolean combinations in both render modes. |
| F04-U13 | PASS, bounded — result-state helper is mode-independent; visual span awaits B19–B21. |
| F04-U14 | PASS, bounded — sibling semantic button/checkbox in markup; helper assertion exercises the retained helper, while actual events await B11–B14. |
| F04-U15 | PASS — URL has no view mode, and changed-file guard excludes API/model/server DTO edits. |
| F04-U16 | PASS — schema 8, format 1, exact eight migration files. |
| F04-U17 | PASS by independently executing existing Library client/Batch suite (the focused file itself only prints a pointer to that suite). |
| F04-U18 | PASS by independently executing existing Library client and Workspace bridge suites (the focused file itself only prints a pointer). |

## Browser, visual, accessibility, and machine-readable matrix

**All F04-B01 through F04-B26: NOT EXECUTED / EVIDENCE MISSING.** No case is marked PASS from static code or Development's claims.

| Cases | Required missing evidence |
| --- | --- |
| B01–B05 | Fresh LIST and GRID screenshots, visible fields, measured 3/2/1 columns, LIST narrow layout, overflow and reachability at the exact viewports/DPR. |
| B06–B10 | Search/facet/page and cross-page Batch interaction, before/after state JSON, frozen revisions and hidden counts, checkbox state, screenshots, API request log. |
| B11–B15 | Pointer and keyboard Detail/Batch/View isolation, accessible names/roles, focus and exact card identity. |
| B16–B18 | Detail preservation under mode/page/filter changes and readiness comparison against actual API summaries, with screenshots and machine-readable state/API evidence. |
| B19–B22 | Loading, empty, no-match, injected error/Retry, pagination and page-size visual/runtime observations. |
| B23–B26 | Selected-state accessibility, focus styling, ordered ID/revision equivalence, console/page/network logs, and Workspace before/after non-mutation evidence. |

The ten primary screenshot subjects listed in section 22 of the frozen handoff are all outstanding. Machine-readable before/after proof for B06–B09, B16–B18, and B25 is outstanding. Browser engine/version, viewport/DPR record, page/console errors, relevant Library API request log, and actual fixture response summaries are outstanding. The checked-in `scripts/run025-ui-evidence.cjs` is a possible starting harness, but its existence and Development's claimed output are not independent execution.

## Verdict and exact return delta

**Official result: PARTIAL** for `dd968ba05e579461962bbcced0e9cae3cd4c3d23`. Scope/custody and deterministic code evidence are favorable; mandatory browser proof is absent and the literal automated gate did not pass in this runner. No observed F-04 product defect or regression is asserted. Integration is not authorized by this report; candidate and protected product refs remain untouched.

Route to an Environment / Deployment Validation substrate that can access a local Chromium browser and permits `tsx` IPC. At the immutable candidate, rerun the frozen handoff's six exact commands, execute B01–B26 against a disposable 101+ card real-Service fixture, retain all required screenshots plus JSON state/network/API and Workspace before/after proof, and record the complete environment. Report any failure with case, expected/observed, SHA, steps, and evidence. Project Control should resolve the transfer's `yarn test`/frozen `test:sc` plus `test:library` inconsistency without altering the candidate or silently relaxing the handoff. DQA can then adjudicate a new exact-SHA official result from independently consumable evidence.

RETURN: DESIGN_QA / DQA-004 → PROJECT_CONTROL / PC-002
