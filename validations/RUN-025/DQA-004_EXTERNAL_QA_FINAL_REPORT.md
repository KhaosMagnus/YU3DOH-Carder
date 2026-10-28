---
artifact_id: RUN-025-DQA-004-EXTERNAL-QA-FINAL-REPORT
artifact_type: external_qa_final_report
status: FINAL
official_qa_result: PASS
source_role: DESIGN_QA
source_instance: DQA-004
target_role: PROJECT_CONTROL
target_instance: PC-002
run: RUN 025
request: CR-0001.4 / F-04 — Library Grid/List
candidate_sha: dd968ba05e579461962bbcced0e9cae3cd4c3d23
baseline_sha: e07140d5a9555a17b7b2306a45625c14adfafc8e
control_input_sha: 61aa9bc85e28c4fb549024f5ab2148e12c205b81
---

# RUN 025 — DQA-004 External QA Final Report

## 1. Official verdict

**PASS**

The immutable RUN 025 candidate `dd968ba05e579461962bbcced0e9cae3cd4c3d23` satisfies the frozen CR-0001.4 / F-04 Library Grid/List Design + QA contract.

This final adjudication resumes the same DQA-004 instance. It combines the prior independent deterministic findings with the exact-candidate, durable DEPLOY-005 browser evidence. DEPLOY-005 EVIDENCE READY was treated as evidence input, not as an acceptance decision.

**QA PASS DOES NOT AUTHORIZE INTEGRATION.** Integration requires a separate Project Control decision. CR-0002 implementation remains unauthorized.

## 2. Candidate custody and evidence integrity

Current GitHub refs were independently verified at intake:

- `feature/workspace-run-025` = `dd968ba05e579461962bbcced0e9cae3cd4c3d23`;
- `feature/workspace-v0.1` = `e07140d5a9555a17b7b2306a45625c14adfafc8e`;
- `main` = `54cc3aad246c89a29f2a18be63c539db68cae041`;
- `meta/project-control` = `61aa9bc85e28c4fb549024f5ab2148e12c205b81`;
- `ops/run-025-deploy-005-actions` = `f4cc120d21694dc10032bd92cf97f8e5d42f8e14`.

The candidate remains exactly one commit ahead of the baseline. Its sole parent and merge base are the baseline. Preflight and final DEPLOY-005 custody records agree, show a clean candidate checkout, preserve the same package/lockfile hashes, and record the same seven changed paths. No product ref moved.

The completed successful execution used Actions run `40564959018`, job `122403657714`, and artifact `12763235984`. The preserved `DEPLOY-005_EVIDENCE.zip` SHA-256 independently matches:

`a0ead6b9440652ffd71966739548a5c98d437ee9577b4a5125ccf0762af8b829`

All 211 entries in `manifest.sha256` independently verified against the extracted archive. The package contains the complete case, screenshot, ARIA, runtime, API, fixture, gate, custody, Workspace and cleanup records used below.

## 3. Scope and architecture adjudication

The prior complete diff review remains valid and the new custody records introduce no contradiction. Changed files are exactly:

- `package.json`;
- `src/library/app.tsx`;
- `src/library/library-result-card.tsx`;
- `src/library/library.scss`;
- `scripts/test-library-grid-list.ts`;
- `scripts/run025-qa-fixture.cjs`;
- `scripts/run025-ui-evidence.cjs`.

The `package.json` change extends `test:library` only. There are no dependency or devDependency changes. Production changes remain confined to Library client presentation and interaction targets.

Architecture invariants are satisfied:

- database schema remains 8;
- Workspace format remains 1;
- migrations remain 001–008 and migration 009 is absent;
- no server field or API contract change;
- no domain semantic change;
- no Workspace/Canonical persistence for view mode;
- no Carder code or protocol change;
- no readiness recomputation or per-card readiness fetch;
- no Batch membership or frozen-revision semantic change;
- no selected Detail identity semantic change.

The real-Service Workspace snapshots before and after browser execution are byte-identical. Their published files share SHA-256 `1667c9d9b7821bbbbf35498990872f8e8df48f9a4259558f36ef690738057bb9`; the compact snapshot proof also records identical before/after hash `9c9683e35cf7370f86e79e9218d3cbe66ffb3a7589ec9128b35e2305e0f1077f`.

Scope compliance: **PASS**.

## 4. Authoritative validation gate

Project Control's frozen gate reconciliation correctly restores the six commands defined by the original F-04 contract. The repeated root `yarn test` text was an intake inconsistency and is not a RUN 025 acceptance requirement.

On the exact candidate, with both frozen installations successful, DEPLOY-005 recorded:

| Authoritative command | Exit |
| --- | ---: |
| `yarn compile` | 0 |
| `yarn build` | 0 |
| `yarn test:sc` | 0 |
| `yarn test:library` | 0 |
| `yarn --cwd workspace-server compile` | 0 |
| `yarn --cwd workspace-server test` | 0 |

The server suite reports 1,088 PASS, 0 FAIL, 0 SKIP, 0 cancelled and 0 todo. The focused F-04 deterministic output is present in the literal `test:library` run.

Authoritative gate: **PASS**.

## 5. F04-U01 through F04-U18

The prior DQA-004 independent findings established U01–U16 and independently executed the pre-existing client/bridge/server suites supporting U17–U18. The new literal `yarn test:library` execution reproduces U01–U16 and completes successfully together with the prior Library client and Workspace bridge suites. No contradictory result exists.

| Cases | Final adjudication |
| --- | --- |
| F04-U01–F04-U16 | PASS |
| F04-U17 | PASS — existing Batch deterministic suite preserved |
| F04-U18 | PASS — existing Library client/bridge suites preserved |

## 6. F04-B01 through F04-B26

Environment: Ubuntu 24.04.5 LTS, Linux 6.17.0-1022-azure x64, Node v24.19.0, Yarn 1.22.22, Playwright Core 1.58.2, Google Chrome 155.0.8059.39 using the Chromium engine. Required viewports were 1440×1000, 900×1000 and 390×844 at DPR 1. The real-Service fixture `RUN025-F04-121-v1` contained 121 cards with the required family, password, classification, filter and readiness diversity. No Owner Workspace data was used.

The evidence contains each B case exactly once, tied to the exact candidate. Primary and transient screenshots, ARIA snapshots, DOM/control state, real API bodies and before/after machine-readable proofs were reviewed.

| Case | Final adjudication | Evidence finding |
| --- | --- | --- |
| F04-B01 | PASS | Fresh mount selects LIST; information-rich row and complete classifications/readiness visible. |
| F04-B02 | PASS | 1440×1000 Grid measures three columns; identity, readiness and separate Batch target visible. |
| F04-B03 | PASS | 900×1000 Grid measures two columns. |
| F04-B04 | PASS | 390×844 Grid measures one column; document scroll width equals 390 with no horizontal overflow. |
| F04-B05 | PASS | 390×844 List remains one column; View, Detail and Batch controls are visible/reachable. |
| F04-B06 | PASS | Search `F04 Search`, EN, `F04 Broad`, page 2 and limit 50 survive LIST→GRID→LIST unchanged. |
| F04-B07 | PASS | Both pure-switch windows record zero additional API requests and no mutation request. |
| F04-B08 | PASS | Page-1 Batch member remains selected and hidden on page 2; Preview preserves the same ID and expected revision before/after. |
| F04-B09 | PASS | Two cross-page members remain selected when `F04 Narrow` hides both; Preview preserves both frozen revisions. |
| F04-B10 | PASS | Visible selected card remains checked after the mode switch. |
| F04-B11 | PASS | Pointer checkbox changes Batch without opening/changing Detail. |
| F04-B12 | PASS | Pointer Detail target opens the exact card without changing Batch membership. |
| F04-B13 | PASS | Tab reaches the semantic Detail button; Enter and Space each open the exact card. |
| F04-B14 | PASS | Space toggles the separately focusable Batch checkbox without changing selected Detail identity. |
| F04-B15 | PASS | Accessible group `Library results view`, radios `Grid` and `List`, native ArrowRight behavior and retained focus observed. |
| F04-B16 | PASS | The same Detail identity remains open through both view changes; selected marker and Batch state persist. |
| F04-B17 | PASS | The same Detail remains authoritative when page/filter hides its card; return restores the marker and filtering causes no replacement. |
| F04-B18 | PASS | All 50 visible List and Grid rows match the captured real API variant count and Standard/Overframe booleans; mixed ready/incomplete states are present. |
| F04-B19 | PASS | A held real request produces one full-width loading panel in each mode; release restores results. |
| F04-B20 | PASS | Real empty-Service and real no-match states use the exact baseline messages and span the full result region in both modes. |
| F04-B21 | PASS | Deliberate 503 produces the expected full-width error and Retry; mode persists and Retry restores real results. |
| F04-B22 | PASS | Both modes retain real pagination, 50 cards on page 2, offset 50, limit 50 and no size changer. |
| F04-B23 | PASS | Selected card has persistent `Detail selected` text, distinct boundary/background and selected meaning in the Detail button's accessible name. |
| F04-B24 | PASS | View, Detail and Batch focus are visibly distinct in both modes; computed styles and screenshots agree. |
| F04-B25 | PASS | Ordered DOM `card_id@revision` before/after is identical and independently matches the recorded authoritative page-2 browse response exactly. |
| F04-B26 | PASS | No page exceptions, no F-04-attributable unexpected console error, and identical Workspace snapshots. Qualifications are adjudicated below. |

## 7. Required qualification adjudication

### Six aborted facets requests

Classification: **expected/benign navigation cancellation in this harness; no product regression and no remaining acceptance uncertainty**.

All six records are GET `/library/facets` with `net::ERR_ABORTED`; they are not failed HTTP responses and no write is involved. The harness repeatedly calls `page.goto` through `fresh()` while the component uses an `AbortController` and explicitly aborts the facets request during effect cleanup. Abort errors are intentionally ignored by the client. The same run contains 21 successful HTTP 200 facets responses, no page exception, no persistent facets error state, and successful facet-dependent B06/B09/B17 interactions. The pure mode-switch windows themselves contain zero requests, including zero facets requests. The observed aborts therefore do not contradict the F-04 contract.

### Baseline-reproduced warnings

Classification: **pre-existing baseline behavior; no RUN 025 regression**.

The favicon 404 and React/Ant Design `scrollLocker` warning class reproduce on the exact baseline. F-04 does not modify the favicon, Ant Design Drawer or Detail panel. They remain visible as known baseline debt and do not block this candidate's acceptance.

### Intentional 503 responses

Classification: **controlled test stimulus for F04-B21**.

Exactly two 503 resource errors correspond to the two deliberately injected List/Grid error-state trials. The resulting UI shows `Library request failed`, retains the active mode and restores real results after Retry. The deliberate stimulus is not an unexpected product failure.

### Drawer and synthetic DOM events

Classification: **sufficient for the exact B16/B17 state-preservation requirements**.

The existing modal Detail Drawer intentionally covers background View/page/facet controls. Synthetic DOM events invoke the same existing handlers while the Drawer remains open and establish that mode/page/filter transitions do not clear, replace or reload the selected Detail identity. The frozen B16/B17 criteria require state preservation under those transitions; they do not separately require pointer access through a modal overlay. Ordinary pointer and keyboard reachability of View, Detail and Batch controls with the Drawer closed is independently established by B11–B15 and B24. Treating modal-blocked background controls as a new reachability requirement would broaden the frozen contract.

### First DEPLOY-005 attempt

Classification: **no acceptance credit**.

Run `40564804923` was incomplete/cancelled and lacks complete cleanup/final-status evidence. No finding in this report relies on it. All acceptance credit comes from completed successful run `40564959018`.

### Runtime and non-mutation

Page exceptions are empty. After excluding the exact baseline-reproduced warnings and the two deliberate 503 resource messages, no unexpected console/page error attributable to F-04 remains. Only four POST requests occurred and all are non-mutating Batch Preview operations; no Apply, PUT, PATCH or DELETE occurred. Both disposable Workspace roots were recorded removed after the successful run.

## 8. Regression and evidence sufficiency

No regression is established. Browse/filter/page behavior, Batch membership and frozen revisions, selected Detail identity, readiness values, error/retry behavior, accessibility semantics, result ordering, Workspace state and prior automated suites are preserved.

Evidence is sufficient for final adjudication:

- exact and unchanged candidate custody;
- complete diff and architecture review;
- all-zero authoritative six-command gate;
- U01–U18 PASS;
- B01–B26 PASS;
- required screenshots and machine-readable evidence present;
- API and authoritative result comparisons present;
- runtime exceptions and warnings classified;
- persisted Workspace state unchanged;
- fixture cleanup and final custody complete;
- all explicit qualifications resolved without changing the frozen criteria.

## 9. Final disposition

Official External QA verdict for:

`feature/workspace-run-025 @ dd968ba05e579461962bbcced0e9cae3cd4c3d23`

is:

**PASS**

Development correction required: **NO**.

Candidate mutation: **NONE**.

Integration authority: **NONE**.

CR-0002 implementation authority: **NONE**.

Return: DESIGN_QA / DQA-004 → PROJECT_CONTROL / PC-002.
