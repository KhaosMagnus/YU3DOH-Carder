# RUN 026 — CR-0002 Library Dark Theme — Implementation Report

**Development status: READY FOR EXTERNAL QA. This is not External QA PASS.**

Accountable instance: DEVELOPMENT / DEV-008. Execution session: DEV-008 / S01.

## Authority and exact custody

- Consumed CONTROL: `meta/project-control @ b3b066bf0c34a42d6e7880806ffacaf93ac598e7`.
- Frozen authorization: `runs/RUN-026_AUTHORIZATION.md`; route: `routing/ROUTE-RUN-026-DEV-008.md`.
- Canonical ledger: `requests/CR-0002-v2.md`.
- Frozen Scope: `scopes/CR-0002_LIBRARY_DARK_THEME-v2.md`.
- Normative Design + QA: `handoffs/CR-0002_LIBRARY_DARK_THEME_IMPLEMENTATION_HANDOFF.md`.
- Accepted post-F04 compatibility: `validations/CR-0002/DQA-002_POST_F04_COMPATIBILITY_REPORT.md` and `control/CR-0002_POST_F04_COMPATIBILITY_DISPOSITION.md`.
- Exact implementation baseline: `feature/workspace-v0.1 @ dd968ba05e579461962bbcced0e9cae3cd4c3d23`.
- Main: `54cc3aad246c89a29f2a18be63c539db68cae041`.
- Candidate: `feature/workspace-run-026 @ e11579950ef7ed20e4b6eeee88f9c3597c1f074b`.
- Candidate's sole parent is exactly `dd968ba05e579461962bbcced0e9cae3cd4c3d23`.

Pre-mutation GitHub verification passed: baseline, main and control heads matched the envelope; target was absent; authorization and frozen documents were read; working tree was clean. The original local checkout was main's SHA, so an isolated worktree was created directly from the required baseline. No product code was implemented against that original checkout or the obsolete pre-F04 design SHA.

Branch creation proof: local branch reflog records `Created from dd968ba05e579461962bbcced0e9cae3cd4c3d23`; GitHub branch creation explicitly used that SHA, and `git ls-remote` subsequently returned the same SHA for the new target before the tested candidate was pushed. The push used an exact baseline lease. `preflight.json`, `architecture.json` and final custody evidence retain the observations.

## Complete changed-file inventory and rationale

| File | Rationale |
| --- | --- |
| `src/library/theme.ts` | New Library-only exact resolver, guarded browser storage, document application and explicit-selection write result. No OS lookup or Workspace dependency. |
| `src/library/index.tsx` | Resolve once and set the document attribute before React commits the first Library content; pass the same initial value to LibraryApp. |
| `src/library/app.tsx` | Independent theme/status state and separate accessible Light/Dark radio group before Workspace. Existing product state and component identities are preserved. |
| `src/library/library.scss` | Central LIGHT/DARK semantic palettes; replace Library light literals; cover document-level Ant Design portals, native controls, statuses and focus. Prevent unreadable intermediate color transitions; retain overlay motion. Header wrapping accommodates the control. |
| `scripts/test-library-theme.ts` | Deterministic DT-U01–U12 resolver/storage/application coverage, including denied storage getters, recovery, exact key and ignored OS preference. |
| `package.json` | Append the theme test to the existing `test:library` chain. No dependency or lockfile changes. |

Exactly six files changed. The test/evidence harnesses are retained externally in the evidence archive, not introduced as production architecture or dependencies. No original F04 or Tranche-1 assertions were changed or weakened.

## Architecture and scope proof

Production changes remain Library-local. `architecture.json` records equal baseline/candidate Git objects for the complete `workspace-server` tree, `public`, `src/service`, Carder `index.html`, Vite configuration, lockfile, Library API/model, Link Marker state, Preferred Variant warning and Batch classification state.

Schema remains **8**, Workspace format **1**, migrations **001–008**. Migration 009 is absent. There is no new Workspace API, Workspace/SQLite/Canonical preference, domain revision, provenance record, server synchronization, Carder theme mechanism or dependency modernization. Ant Design remains **4.9.4**.

F04's LIST/GRID radio group, separate Detail button and Batch checkbox, selected Detail text, ordered authoritative results, keyboard behavior and 3/2/1 Grid layout remain intact. Link Marker numeric codes, pressed-state semantics and inert center remain unchanged. Existing readiness algorithms and Preferred selection logic remain byte-identical.

## Theme, storage and first content

Only exact `LIGHT` and `DARK` are accepted. Missing, invalid, case/whitespace variants, unavailable storage and read exceptions resolve to DARK. Startup performs one guarded read and **no storage write or repair**. OS preference, SYSTEM and AUTO do not participate.

Preference is browser/profile/origin-local under exactly `yu3doh.library.theme.v1`; it persists across reload/reopen and is independent of Workspace identity. Explicit choice applies immediately through `data-yu3doh-library-theme` on `document.documentElement`, then attempts storage. A denied write preserves the current choice and exposes the exact polite status: “Theme preference could not be saved; this selection is temporary.” A subsequent successful explicit write clears it.

The initial read and document attribute application occur before React render, outside StrictMode initialization. Browser mutation observers verify the correct attribute when `#library-root` first becomes non-empty for no-key, valid LIGHT/DARK, invalid and denied-read cases. State/control/attribute agree; no wrong-theme first Library content was observed. No HTML bootstrap was needed.

The root attribute covers body-portaled Select, Drawer, Modal and Modal.confirm surfaces without moving portals or changing their modality, positioning or z-index.

## Exact-candidate authoritative gate

Every command below ran at `e11579950ef7ed20e4b6eeee88f9c3597c1f074b` with a clean working tree and exited 0. The first two are reproducibility checks; the remaining six are the literal authoritative gate.

| Command | Exit | Archive log |
| --- | --- | --- |
| `yarn install --frozen-lockfile --non-interactive` | 0 | `gates/01.log` |
| `yarn --cwd workspace-server install --frozen-lockfile --non-interactive` | 0 | `gates/02.log` |
| `yarn compile` | 0 | `gates/03.log` |
| `yarn build` | 0 | `gates/04.log` |
| `yarn test:sc` | 0 | `gates/05.log` |
| `yarn test:library` | 0 | `gates/06.log` |
| `yarn --cwd workspace-server compile` | 0 | `gates/07.log` |
| `yarn --cwd workspace-server test` | 0 | `gates/08.log` |

The Workspace suite reports **1,088 passed, zero failed, skipped or cancelled**. Simplified Chinese passes. Library/client and bridge suites pass, including the retained 72 bridge checks and existing regression families. Tranche-1 focused Link Marker/Preferred assertions remain included. F04-U01–U16 pass; the unchanged suite identifies U17/U18 through the preceding complete client/bridge gates. DT-U01–U12 all pass through the appended test. No root `yarn test` was invented.

## Browser and regression evidence

Both complete DT-B01–B24 matrices pass at the exact candidate:

- Chromium **151.0.7922.173**.
- Firefox **firefox/140.15.0**, distribution Mozilla Firefox 140.15.0esr.

The final matrices are complete uninterrupted executions; earlier harness-development checkpoints are not substituted for final results. Browser page errors are empty. Network, DOM/ARIA, storage seeds/reads/writes, result IDs/revisions, page/facets, selected Detail, dirty values/validation/save state, view mode and visible/hidden Batch state are retained.

F04-B01–B26 pass in **both LIGHT and DARK in Chromium**. Firefox additionally passes the complete theme matrix, state-preservation, keyboard, contrast and layout parity checks. Existing F04 assertions were retained; the external harness awaits the exact fresh browse response and matching DOM identities to avoid a response-capture timing race.

Viewports: **1440×1000**, **900×1000**, **390×844**, all DPR **1**, both themes and LIST/GRID. Grid measures 3/2/1 columns; LIST remains one column; narrow layouts have no horizontal content loss. Keyboard focus, separate Detail/Batch actions, theme radio selection and existing view-mode behavior remain accessible.

Firefox ESR's automation API lacks media emulation, so `firefox-os.json` additionally records **six real native-preference cases**: OS light/dark × no key/stored LIGHT/stored DARK. The observed `matchMedia` result changes with the native preference while Library's resolved choice remains correct. Chromium checks live emulated OS changes.

## Rendered contrast and visual evidence

All required measured pairs pass after effective background composition; token definitions alone were not treated as evidence. Numeric JSON includes text, placeholders, input/control boundaries, focus outlines, selected cards/radios/markers, disabled controls, dropdown options, Drawer/Modal text, tables, raw evidence and success/warning/error/info states.

| Engine | Theme | Minimum normal-text pair | Minimum 3:1 boundary/focus/disabled pair | Pairs |
| --- | --- | --- | --- | --- |
| Chromium | LIGHT | 5.404:1 | 4.206:1 | 64 |
| Chromium | DARK | 6.111:1 | 4.251:1 | 63 |
| Firefox | LIGHT | 5.404:1 | 4.206:1 | 64 |
| Firefox | DARK | 6.111:1 | 4.251:1 | 63 |

There are **274 explicit rendered pairs** and **81556 rendered text samples** across the final matrices and additional surfaces. Full selector, computed color, background, threshold and numeric ratio details are retained; no critical pair is below its threshold. Selected theme choices use bold/underline plus checked semantics; selected Detail, READY/Preferred, diagnostic and warning meanings retain text and accessible state.

The final inventory contains **92 screenshots**, plus DOM/ARIA snapshots and machine-readable evidence. V01–V08 are retained in LIGHT and DARK, in both engines where applicable; V09 is DARK Needs Attention, V10 LIGHT Needs Attention, V11 Carder isolation. The inventory includes LIST/GRID, 900px Grid, narrow scenes, dirty editor/validation/focus, dropdown and confirm dialogs, External Sources tables/raw evidence, Variants/Assets/Preferred, Workspace and Batch.

Additional paired LIGHT/DARK screenshots and rendered checks cover Sources/Provenance native filters, Review/Confirm, Ingest, Variant Lifecycle and Asset Resolution native controls. Their read-only smoke leaves the Workspace snapshot identical.

### Preferred Variant compatibility finding

The unchanged repository formula makes OVERFRAME READY imply STANDARD READY. Therefore **OVERFRAME-only READY cannot occur as a real Workspace state** under this baseline. No domain or readiness algorithm was changed to manufacture it.

The three reachable combinations are validated against real Service-derived variant readiness and warning text. The fourth warning is validated by the existing pure function's `(false, true)` input and an **explicitly labeled isolated rendered presentation fixture** using the same Library warning styles in both themes/engines. Its screenshot and JSON names contain `OVERFRAME-only-synthetic`; it is not represented as an authoritative Workspace state. Tranche-1 deterministic tests retain all four function combinations.

## State, network and data invariance

Theme switches preserve query, language/family/archetype/effect/tag facets, page/page size, ordered card identities and revisions, LIST/GRID, selected Detail/open state, unsaved editor values, dirty/validation state, Batch membership/count/hidden count and existing expected revisions. Main browser snapshots compare these field-for-field. Retained F04 preview assertions additionally verify frozen Batch `card_id`/`expected_revision` payloads after hidden/page/filter transitions.

DT-B19 and individual preservation proofs record **zero theme-triggered Workspace requests**, including browse requests, and zero theme-triggered mutation methods. Complete database snapshots before/after the disposable read-only smoke are equal, covering Canonical, revisions, provenance, assets, variants and Workspace state. Hashes and full JSON are archived. Theme startup/switching remains usable under storage denial.

The realistic disposable fixture is `RUN026-DT-F04-121-v3`: 121 cards, schema 8/format 1, source evidence, Preferred variants and indexed role bindings. Like the retained F04 fixture, seeded asset rows support real repository readiness calculation; no derived readiness result is mocked in the live Workspace tests. The isolated hypothetical warning is separately identified above.

## Carder isolation

Carder production files and shared/domain files are unchanged. The built Carder document does not set the Library attribute, read the preference for presentation, or load Library theme rules. DT-B21 observes Carder with the preference present; V11 retains its screenshot. Library-side Open in Carder controls are themed. No Carder renderer, editor, export or bridge protocol change exists.

## Environment, warnings and execution limits

Runner: managed Debian 13 cloud environment, Linux-6.18.55-x86_64-with-glibc2.41. Node v24.19.0; Yarn 1.22.22; React 17.0.2; ReactDOM 17.0.2; TypeScript 6.0.3; Vite 8.0.14; Sass 1.99.0. External evidence tooling: Playwright Core 1.58.2 and Puppeteer Core 24.15.0. Browser binaries/versions and viewports are recorded above and in JSON.

Frozen installs succeeded without changing the lockfile. Writable task-local npm/node-gyp caches were needed for the native SQLite install. Firefox's Playwright download hosts were blocked by configured policy; the browser was obtained from the allowed Debian distribution, and native Firefox process execution was used for the required checks. No network-policy or product dependency change was made.

Known warnings are retained and classified: upstream build PURE-annotation warnings, existing Yarn peer/cache warnings, favicon 404s, and deliberately injected QA 503 responses. The inherited development-mode Ant Design scrollLocker warning was baseline-reproduced; the final production bundle is the primary browser evidence. No unexplained Library page error is accepted. Intermediate fixture/timing/static-server issues were corrected in external tooling; they did not require product/domain changes or a different candidate SHA.

**Unexecuted required evidence: none.** The hypothetical warning limitation and native Firefox OS-preference method are explicit above. Development's results remain subject to independent External QA.

## Evidence inventory and custody

Primary archive: `validations/RUN-026/DEV-008/RUN-026_EVIDENCE.zip`.

- Archive SHA-256: `7bf9ef2fcaa8284457234b6fcfff229b98650955f19af644b6b17d9f91ba8d3c`.
- Archive bytes: `22524792`.
- `summary.json`: exact candidate, gates, engine/version, case and contrast summary.
- `manifest.json`: byte counts and SHA-256 for retained evidence files.
- `visual-inventory.json`: screenshot paths grouped by engine/surface/theme and SHA.
- Archive `gates/`: all eight install/gate logs and machine-readable exits.
- Archive `theme-chromium/`, `theme-firefox/`: complete DT matrices, computed ratios, DOM/ARIA, network, storage, Workspace snapshots and V01–V11.
- Archive `f04-light/`, `f04-dark/`: 26 retained cases each, authoritative API/custody evidence and screenshots.
- Archive `additional-surfaces/`, `firefox-os.json`, `architecture.json`, `environment.json`, `preflight.json` and `tooling/`: additional rendered surfaces, OS parity, invariants and reproduction scripts.

The candidate working tree and original checkout are clean; protected product refs remain unchanged. The implementation report/evidence are new control artifacts. Frozen sender artifacts and Project State are not rewritten. No integration or main movement is performed.

## Session-pilot history and closure

- Stable accountable instance: DEV-008. Sessions used: **one, S01**.
- Rollover: none; no replacement was forced for the experiment.
- Recovery success/failure: not exercised.
- Stale-context/baseline mistakes: no product baseline or authority mistake; obsolete design SHA was not used for implementation.
- Duplicated work: no duplicated product implementation. Browser harness/fixture corrections required development reruns; final matrices were rerun completely at the same candidate.
- Traceability: exact input CONTROL, baseline, single-parent candidate, retained snapshots and independently published return artifacts preserve custody.
- Administrative overhead: moderate/high validation setup and evidence collection; no session rollover administration.
- Terminal auto-return: this report and the complete return envelope are emitted proactively at READY FOR EXTERNAL QA, without an additional Owner prompt.
- Recommendation: **REVISE**. Retain explicit terminal auto-return, and evaluate genuine replacement/recovery before promoting the session model. No protocol amendment is made.

## Formal Development return

SOURCE: DEVELOPMENT / DEV-008, session S01.
TARGET: PROJECT_CONTROL / PC-002.
STATUS: READY FOR EXTERNAL QA — NOT QA PASS.
CONSUMED CONTROL: `b3b066bf0c34a42d6e7880806ffacaf93ac598e7`.
CODE BASELINE: `dd968ba05e579461962bbcced0e9cae3cd4c3d23`.
CANDIDATE: `feature/workspace-run-026 @ e11579950ef7ed20e4b6eeee88f9c3597c1f074b`.
PRIMARY ARTIFACT: `implementations/RUN-026_IMPLEMENTATION_REPORT.md`.
ACTION: consume the report and route the exact candidate to independent External QA.
EXPECTED OUTPUT: External QA disposition against the frozen CR-0002 contract.
BLOCKER/ESCALATION ROUTE: PROJECT_CONTROL / PC-002; Scope/DQA only for a material contract conflict.
INTEGRATION / MAIN MOVEMENT: not authorized and not performed.
