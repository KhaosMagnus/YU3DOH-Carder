---
artifact_id: RUN-024-DEV-006-CONTINUATION-IMPLEMENTATION-REPORT
artifact_type: implementation_report
status: READY FOR EXTERNAL QA
protocol_version: "1.0"
source_role: DEVELOPMENT
source_instance: DEV-006
target_role: PROJECT_CONTROL
target_instance: PC-002
control_sha_consumed: a778a81928b75ccf910518a1faeba99f46421caf
starting_run_head: 219ac252d50ae11b836a93baa20cc7f7d872367f
product_baseline: 64cb5f4ca42348c6c403e64e0d61bdff8c32a281
final_candidate_sha: e07140d5a9555a17b7b2306a45625c14adfafc8e
implementation_branch: feature/workspace-run-024
---

# RUN 024 — DEV-006 continuation implementation report

**Final Development status: READY FOR EXTERNAL QA.** This is not External QA PASS.

F-03 replaces the numeric multi-select with eight controlled, keyboard-accessible
marker buttons in the frozen 3×3 layout. F-06 presents the exact composition-specific
Preferred warning without changing selection, readiness or launch logic.

Candidate: `e07140d5a9555a17b7b2306a45625c14adfafc8e`.
No product commit was added after validation.

**Evidence qualification:** F06-W1 (STANDARD INCOMPLETE / OVERFRAME READY) was
exercised in the actual Library UI using an explicitly synthetic variants DTO.
The other three readiness states use actual service-produced fixtures. W1 cannot
be produced by the unchanged service: OVERFRAME READY requires OF with BG or BS;
either combination also makes STANDARD READY. No server logic was changed to
manufacture this state. The original and injected DTOs, screenshot, DOM and ARIA
are recorded separately. This is UI-contract evidence, not proof of a live
service state. External QA should retain that distinction when evaluating T1-OP-06.

## Authority and corrected gate

Consumed corrected control SHA `a778a81928b75ccf910518a1faeba99f46421caf`.
Read the corrected route and blocker disposition completely, together with
PROJECT_STATE, prior DEV-006 authorization, ENV-004 READY disposition/report,
frozen Tranche 1 handoff, historical blocker report, Development role,
communication protocol and DEV-006 instance. The original RUN authorization and
CR-0001-v17 were also consumed during this same DEV-006 mission.

The disposition explicitly supersedes conversational root `yarn test` text.
The six authoritative commands are compile, build, test:sc, test:library,
Workspace Service compile and Workspace Service test. No test alias was added.
The prior blocker was CONTROL / TRANSFER TEXT INCONSISTENCY and is resolved;
this is continuation of RUN 024 / DEV-006, not a new RUN or instance.

## Preflight, ancestry and custody

GitHub resolved the required refs before implementation:

| Ref | SHA |
| --- | --- |
| feature/workspace-run-024 | 219ac252d50ae11b836a93baa20cc7f7d872367f |
| feature/workspace-v0.1 | 64cb5f4ca42348c6c403e64e0d61bdff8c32a281 |
| main | 54cc3aad246c89a29f2a18be63c539db68cae041 |
| meta/project-control | a778a81928b75ccf910518a1faeba99f46421caf |

Baseline→start was exactly one historical report-only commit adding
implementations/RUN-024_IMPLEMENTATION_REPORT.md (183 additions).
Candidate has exactly one parent, the required start; start→candidate is one
implementation commit. Merge base with product baseline is exactly the baseline.
The historical product report and prior control blocker report are unchanged.

Publication used GitHub tree/commit/ref operations, `force:false` and exact
`expected_sha:219ac252d50ae11b836a93baa20cc7f7d872367f`. No reset, rebase, recreation,
force push, integration or changes to main/integrated baseline occurred.

Actions independently checked out the candidate detached with complete Git
history. `custody-preflight.json` and `custody-final.json` assert exact local HEAD,
matching remote RUN head, preserved start ancestor, baseline merge base, exact
nine-path allowlist and empty status/unstaged/cached diffs. Protected-path diff
is empty; both package manifests and both lockfiles have identical SHA-256 hashes
before/after execution. The local authoring scratch directory is not represented
as a runnable checkout; runtime custody is proven by Actions.

## Complete product changed-file list and rationale

| Path | Rationale |
| --- | --- |
| src/library/link-marker-state.ts | Frozen eight-code/direction/position table and pure toggle helper. Exact undo restores authoritative array order; render/hydration performs no mutation. |
| src/library/link-marker-selector.tsx | Controlled fieldset with semantic buttons, direction+code names, aria-pressed, native Space/Enter activation, inert center and row-major Tab order. |
| src/library/editor-form.tsx | Replace only applicable numeric marker selection with the graphical component; keep existing derived read-only rating and structural-change path. |
| src/library/detail-panel.tsx | Pass authoritative marker order to the editor for exact undo and existing dirty-state restoration. |
| src/library/library.scss | Scope 3×3 layout, selected/unselected contrast and visible focus to the Library marker component. |
| src/library/preferred-variant-warning.ts | Pure exact W1/W2/W3 copy selection and W4 null result from existing readiness booleans. |
| src/library/open-in-carder.tsx | Render that warning only for the selected Preferred; selection, launch gates and prepare request remain unchanged. |
| scripts/test-library-tranche-one.ts | Deterministic F03/F06 regression assertions including all 256 marker subsets. |
| scripts/test-library-client.ts | Invoke focused checks through the existing test:library entrypoint without manifest changes. |

No other product paths changed. Operational files are separate on
`ops/run-024-dev-006-actions`; this branch was created from the authorized
`5aa54988eec0d8c07626f178677660f817640b2a` and must not be merged into product.

## Architecture and scope invariants

Runtime status reports schema **8**, Workspace format **1**, READY.
All workspace-server files (including production, tests and migrations 001–008),
manifest/lockfiles, Workspace/Carder bridge and shared Carder marker component
are byte-identical to the preserved start. No migration 009, new API, persistence,
readiness calculation, lifecycle semantics or Carder protocol change exists.
F-04/Grid/List, CR-0002, Tranche 2 and RUN 025 were not implemented.
The existing editor-state dirty comparison, patch builder, applicability proposals,
confirmation and Review/Confirm service paths were not changed.

## Automated validation at exact candidate

| Command | Exit | Duration (s) |
| --- | ---: | ---: |
| `yarn install --frozen-lockfile --non-interactive` | 0 | 41.489 |
| `yarn --cwd workspace-server install --frozen-lockfile --non-interactive` | 0 | 4.601 |
| `yarn compile` | 0 | 9.316 |
| `yarn build` | 0 | 3.17 |
| `yarn test:sc` | 0 | 0.431 |
| `yarn test:library` | 0 | 6.079 |
| `yarn --cwd workspace-server compile` | 0 | 4.487 |
| `yarn --cwd workspace-server test` | 0 | 55.795 |


All six required commands and both frozen installs exited 0.
Focused suite: **11,546 assertions PASS**: 11,536 F03 assertions and 10 F06 assertions.
These are assertion counts, not distinct test-case counts.

F03 inventory: exact code/position table; all 256 subsets × eight toggles;
selected membership, count 0–8, uniqueness, inverse restoration including reverse
saved order, input immutability; five invalid aliases/codes per subset; hydration
without derived writable rating or dirty state; STRUCTURE-only dirty delta;
no client link_rating payload; authoritative undo; LINK→non-LINK proposal and
null-kind preservation; incoming LINK clearings with no invented marker.
Browser cases cover semantic activation, retained visible focus, confirmed-block
cancel/save and actual server-derived rating. Existing RC client 32 checks and
Workspace bridge 72 checks pass, including code 5 rejection and unchanged mapping.

F06 inventory: four exact warning results; no Preferred zero/one/multiple variants;
missing Preferred with one/multiple variants; incomplete Preferred retained despite
READY alternate. Browser coverage verifies identity preservation, manual alternate,
button gates, no warning-triggered writes and actual selected-variant prepare.

Workspace Service: **1088 tests / 1088 PASS / 0 fail, skipped, cancelled or todo**.
The unchanged full service suite exercises Canonical validation, confirmations,
Link applicability/derived rating, asset readiness, variants and bridge behavior.
No aggregate count is invented across heterogeneous legacy client scripts.

## Browser case results

| Case | Result and evidence |
| --- | --- |
| T1-OP-01 | PASS. Actual saved LINK [1,4,9], rating 3, Save disabled; exact working props and canonical snapshot; layout/center assertions; T1-OP-01 and T1-OP-01-full-editor PNG/DOM/ARIA/state captures. |
| T1-OP-02 | PASS. Pointer code 2 adds only 2, rating 4, dirty; undo restores exact saved value/rating 3 and not-dirty. No write before Save. Added/restored captures. |
| T1-OP-03 | PASS. Keyboard-only Tab order 1,2,3,4,6,7,8,9; center skipped; Space removes and Enter restores marker 1, focus stays on marker, visible outline and programmatic pressed state captured. |
| T1-OP-04 | PASS. LINK→MAIN_DECK lists link_markers; Cancel preserves value, Apply clears and hides picker. MAIN_DECK→LINK proposes Level, DEF, Pendulum ability/scale clearing; Cancel preserves; Apply starts empty/rating 0. No server writes. |
| T1-OP-05 | PASS. Confirmed Structure modification dialog; Cancel leaves Canonical unchanged. Explicit Move to Draft and Save sends ordinary PATCH with only expected_revision/structure/confirmations; no link_rating. Actual response and reread show [1,2,4,9], rating 4, STRUCTURE DRAFT. |
| T1-OP-06 | PASS for UI contract with qualification. Three real service readiness states plus separately labeled synthetic W1 DTO; exact warnings, info and both button states captured. No readiness/service alteration. |
| T1-OP-07 | PASS. No Preferred zero/sole/multiple behavior; incomplete Preferred retained despite READY alternate; manual alternate changes UI selection only; actual STANDARD prepare uses alternate ID; actual Carder launch/render captured; reselect Preferred restores warning. |

Only disposable runner-created fixtures and generated solid/transparent 2×2 PNGs
were used. No Owner Workspace was opened. The real Service, Library and Carder
ran together in the Actions runner. Browser requests continue unmodified except
the explicitly documented W1 variants-response injection; no W1 launch is claimed.
No product module, service response logic or persisted readiness was patched.
Working forms were read from the current React tree without modifying state.

Canonical before/after prove only the intended Link fixture save changed data;
all other fixture Canonical snapshots are deep-equal. The incomplete Preferred
variant response remains deep-equal before/after manual selection and launch.
Network evidence includes one Canonical PATCH and two actual prepare POSTs
(Library and Carder), with request/response bodies. There is no lifecycle/asset
mutation from warning rendering or manual selection. Browser pageerror list is empty.

## Actions and evidence custody

Final successful Actions [run 40346181389](https://github.com/KhaosMagnus/YU3DOH-Carder/actions/runs/40346181389), [job 121653587088](https://github.com/KhaosMagnus/YU3DOH-Carder/actions/runs/40346181389/job/121653587088).

- Workflow: `.github/workflows/run-024-dev-006-validation.yml`.
- Operational head: `0de56aac07d3f66ed20c4770862ec0cc4bf86de4`.
- Exact product checkout and final remote head: `e07140d5a9555a17b7b2306a45625c14adfafc8e`.
- Evidence [artifact 12662135618](https://github.com/KhaosMagnus/YU3DOH-Carder/actions/runs/40346181389/artifacts/12662135618).
- Artifact name: `dev006-readiness-40346181389-e07140d5a9555a17b7b2306a45625c14adfafc8e`.
- Archive size: 5,236,842 bytes.
- Archive SHA-256: `18365d2ca307762d2e65a1c38f62e2ee4bffde16701aee76f0e2a4378250ba5e`.
- Created: 2026-10-26T15:10:30Z. Expires: 2027-01-24T15:07:19Z.
- Downloaded archive digest matched GitHub; all 110 `manifest.sha256` entries independently matched extracted bytes.
- Browser: Chromium 145.0.7632.6, Playwright 1.58.2.
- OS: Ubuntu 24.04.5 LTS; Node v24.19.0; Yarn 1.22.22.

The Actions run's head SHA identifies the external harness. It is not the product
candidate: separate exact-SHA checkout, environment.json, browser custody and
preflight/final custody records identify the product SHA above. Both frozen installs,
all six gates and all seven browser cases belong to this final run. The corrected
confirmation screenshot visibly includes STRUCTURE, Cancel and Move to Draft and Save.


Evidence archive contains command logs/results, custody before/after, runtime
versions, fixture IDs, canonical before/after, cases, network request/response data,
DOM HTML, ARIA snapshots, control metadata, working props, and screenshots.
Manifest and archive digest were independently verified after downloading.
Visual review confirms marker placement, selected state, visible keyboard focus,
warning copy/buttons and actual Carder render. This is Development review, not an
External QA verdict or a comprehensive accessibility certification.

## Attempt provenance

- Run 40343642563, harness c54712eacf0ed1ef8e9dcec34ba046f4f3611ef1: completed FAILURE during disposable fixture construction: Confirmed TEXT:EN required localized Pendulum text. All six command gates passed, but browser validation did not. This was a harness fixture defect, corrected on the operational branch. No validation credit is taken from this superseded attempt.
- Run 40344100496, harness d8f437a3dab4a3eed182ef7021a6a5f3bf20ab62: full gate and seven browser cases succeeded. Harness-only corrections supplied required Pendulum fixture text, used normalized alternate key and inspected the current React tree. Product SHA unchanged.
- Run 40344898965, job 121649112724, harness 6a5e25965722bb299ddc06562b9a0c84c021d13b: full gate succeeded, adding a full-height editor capture. Artifact 12660229037, SHA-256 35b89d04751ec41dfe97af0088865d9bb8f2bc7f500404b709e181857500453a. Subsequent visual review found the confirmation screenshot caught the modal opening animation.
- Final run 40346181389 waits for the confirmation dialog to finish opening before capture. The full gate was rerun on the same candidate; no product changes followed.

## Warnings, limits and missing evidence

- W1 has no real-service end-to-end fixture because it is unreachable under the frozen readiness function. Its supplied evidence is explicitly synthetic at the UI DTO boundary. All requested UI states were executed; do not reinterpret W1 as real-service behavior.
- Missing required executable UI cases: none. Unavailable real-service evidence: W1 only, for the reason above.
- Browser evidence uses Vite serving exact candidate source; build succeeds separately. Production-bundle serving was not separately exercised.
- One Chromium/Linux environment was exercised; no Windows/native-browser or cross-browser acceptance is claimed.
- Yarn alias cache/unmet-peer warnings and a third-party PURE annotation build warning are retained in logs. Actions v4 Node 20 compatibility warning is platform-generated; actions ran under Node 24 compatibility. All required commands exited 0.
- Actions artifacts expire after 90 days; download/preserve before the recorded expiry if longer retention is needed. This control publication adds only this report, as authorized.
- No self-integration, movement of main/integrated baseline or External QA PASS claim.

## Return envelope

SOURCE: DEVELOPMENT / DEV-006
TARGET: PROJECT_CONTROL / PC-002
CONTROL SHA CONSUMED: a778a81928b75ccf910518a1faeba99f46421caf
PRIMARY ARTIFACT: implementations/RUN-024_DEV-006_CONTINUATION_IMPLEMENTATION_REPORT.md
RUN: 024
CANDIDATE BRANCH: feature/workspace-run-024
EXACT CANDIDATE: e07140d5a9555a17b7b2306a45625c14adfafc8e
STATUS: READY FOR EXTERNAL QA
ACTION: Route this exact candidate and evidence to DQA-001; explicitly carry the W1 synthetic-evidence qualification. Do not integrate until independently authorized.
