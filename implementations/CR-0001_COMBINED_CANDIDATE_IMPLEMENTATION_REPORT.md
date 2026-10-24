---
artifact_id: IMPL-CR-0001-COMBINED-CANDIDATE-DEV-003
artifact_type: implementation_report
status: FROZEN
protocol_version: "1.0"
source_role: DEVELOPMENT
source_instance: DEV-003
target_role: DESIGN_QA
target_instance: DQA-001
related_requests: [CR-0001.1, CR-0001.2, CR-0001.5]
input_control_sha: eada2b8af396d9e1d1dda5be436c0fe2d0cfb5e8
input_artifact: handoffs/CR-0001_COMBINED_CANDIDATE_HANDOFF.md
control_parent_sha: eada2b8af396d9e1d1dda5be436c0fe2d0cfb5e8
code_baseline:
  branch: feature/workspace-v0.1
  sha: 4c9b0228bb47ac074c49a977b48dbf0844c33a94
candidate_branch: feature/workspace-cr-0001-combined
candidate_sha: 64cb5f4ca42348c6c403e64e0d61bdff8c32a281
development_status: READY FOR EXTERNAL QA
supersedes: null
created_at: 2026-10-24T08:27:15.418514+00:00
---

# CR-0001 Combined Candidate — Implementation Report

Development status: **READY FOR EXTERNAL QA**.

Candidate A's NORMAL subtype renderer/copy corrections and Candidate B's Level/Rank bounds are combined at `64cb5f4ca42348c6c403e64e0d61bdff8c32a281`. All six required regression commands, 49 focused A+B server cases, and the unchanged Candidate B browser/operational harness passed at that exact SHA. Independent combined External QA remains pending.

## Authority and exact inputs

Repository: `KhaosMagnus/YU3DOH-Carder`.

All eight documents requested by the DEV-003 assignment were read completely at CONTROL SHA `eada2b8af396d9e1d1dda5be436c0fe2d0cfb5e8`: PROJECT_STATE, Owner decision, combined handoff, DEV-003 route, CR-0001-v10, DEV-003 instance, DEVELOPMENT role, and communication protocol. Receipt was acknowledged before branch creation. The Git, artifact lifecycle, and concurrent publication policies were also read. The current control parent was re-read before publication; the eight input documents retain their exact Git blobs. Only this new role-owned report is published to Project Control.

| Input | Branch | Exact SHA |
|---|---|---|
| Frozen baseline | `feature/workspace-v0.1` | `4c9b0228bb47ac074c49a977b48dbf0844c33a94` |
| Candidate A | `fix/workspace-rc-normal-subtype-icon` | `61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c` |
| Candidate B | `feature/workspace-cr-0001-2-level-rank-domain` | `59fb2924b2240f005fb3e9e6d5afbd8aaca39596` |
| Protected main | `main` | `54cc3aad246c89a29f2a18be63c539db68cae041` |

## Branch-creation evidence

Initial checkout was clean on local `work` at protected main SHA `54cc3aad246c89a29f2a18be63c539db68cae041`. Remote heads were fetched. `git for-each-ref` showed no local or remote-tracking combined branch. A fresh `git ls-remote --heads origin` query for the exact combined branch, protected refs, and RUN 024 returned the four protected refs at the input SHAs and no combined/RUN 024 entries. Evidence is retained in `refs-before.txt` and `remote-before.txt`.

The branch was created using:

```sh
git switch -c feature/workspace-cr-0001-combined 4c9b0228bb47ac074c49a977b48dbf0844c33a94
git rev-parse HEAD
```

The immediate HEAD output was exactly `4c9b0228bb47ac074c49a977b48dbf0844c33a94`. The branch reflog records `branch: Created from 4c9b0228bb47ac074c49a977b48dbf0844c33a94` before all five cherry-picks. No mutable branch name was used as the creation start point.

## Exact assembly and traceability

Each source commit was incorporated with `git cherry-pick -x`, using normal Git three-way semantics, in this order. Each resulting commit retains its original author and a full source-SHA trailer.

| Order | Source commit | Combined commit | Intent |
|---|---|---|---|
| 1 | `fab10c237514916d367f4646feda2cd24274b7f6` | `e710d3ee9366863cc2def11ce773415893f29f0e` | A renderer correction and regression coverage |
| 2 | `61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c` | `1142afa64c6815169b3dd7641214bafd219364e1` | A Open in Carder copy correction |
| 3 | `ac8fd02a08b8d70dece5734a027452d82e27d8fe` | `e406933c39873379227bdce0ebedd9d6c6642fd9` | B Canonical bounds and tests; expected test reconciliation |
| 4 | `89f5d9e51d9c2cc0796c395fa64ec87044351074` | `c255333d9469b3d9fbf9e1442c246b6db3958c37` | B Library bounds and tests |
| 5 | `59fb2924b2240f005fb3e9e6d5afbd8aaca39596` | `64cb5f4ca42348c6c403e64e0d61bdff8c32a281` | B External bounds and existing QA scripts |

The combined branch has exactly five commits after the frozen baseline, no merge commits, and the baseline is its merge base. Nothing was squashed or integrated into a protected branch.

## Conflict and reconciliation record

Only step 3 conflicted, in the anticipated `workspace-server/test/carder-write-back.test.ts`. Both candidates appended independent test groups at the baseline file's end. Candidate A's full CR-0001.1 block was retained first, followed by Candidate B's full CR-0001.2 block, separated by one blank line. Conflict markers alone were removed; no assertion or test body was edited or added. The result was staged and `git cherry-pick --continue` completed the original source commit with its traceability trailer.

Byte verification proves the resolved file equals the complete Candidate A final file, followed by one newline and Candidate B's entire appended Level/Rank block. Candidate A's existing non-conflicting fixture change also remains. This preserves all 16 A server cases and all 12 B Carder cases. Resolution is contained in `e406933c39873379227bdce0ebedd9d6c6642fd9`; no separate reconciliation commit was required. No production-code or unexpected file conflict occurred. The original combined conflict diff is retained as `conflict.diff`.

## Exact changed-file list and scope proof

There are exactly 18 changed paths relative to the frozen baseline, equal to the set union of both candidate diffs:

- `scripts/cr-0001-2-immutability.cjs`
- `scripts/cr-0001-2-operational-qa.cjs`
- `scripts/cr-0001-2-qa-fixture.cjs`
- `scripts/cr-0001-2-ui-evidence.cjs`
- `scripts/test-library-client.ts`
- `scripts/test-workspace-bridge.ts`
- `src/draw/predefined-section/type-ability.ts`
- `src/library/detail-panel.tsx`
- `src/library/editor-form.tsx`
- `src/library/editor-state.ts`
- `src/library/open-in-carder.tsx`
- `workspace-server/src/canonical/service.ts`
- `workspace-server/src/canonical/validation.ts`
- `workspace-server/src/external-sources/structure-result.ts`
- `workspace-server/test/canonical-domain.test.ts`
- `workspace-server/test/carder-write-back.test.ts`
- `workspace-server/test/confirmation-review.test.ts`
- `workspace-server/test/structure-acceptance.test.ts`

Production changes are exactly the eight authorized files: A's renderer and Open in Carder files, plus B's three Library and three Workspace server files. All 17 non-overlapping changed files are byte-identical to their corresponding final candidate blobs. The sole overlapping file has the exact test union described above. Every other tracked path is unchanged. `git diff --check` passes and the working tree is clean. No product work, cleanup, formatting sweep, dependency, lockfile, workflow, or migration change was introduced.

Candidate B's `cr-0001-2-immutability.cjs` is retained unchanged for source fidelity. Its hard-coded B branch and B-only allowlist do not apply to a combined branch, so it was not presented as a combined validation. The combined scope/version check used the exact A+B file union, origin blob comparisons, overlap byte equation, baseline ancestry, clean status, and protected-file checks; `scope-invariants.json` records PASS.

## Validation at exact combined SHA

All commands below ran with HEAD `64cb5f4ca42348c6c403e64e0d61bdff8c32a281`. No source commit or working-tree edit followed the gate. Environment: Linux, Node `v24.19.0`, Yarn `1.22.22`, Chromium `151.0.7922.173`, isolated Playwright Core `1.58.2`.

Yarn was provisioned through Corepack outside tracked source. Root/server installs used `--frozen-lockfile`; an initial server install hit the read-only default npm/cache location and succeeded after selecting writable caches under `work/`. Shell network-enabled execution was used for dependency downloads, IPC and disposable local listeners. No package versions or lockfiles were edited.

| Required command | Result |
|---|---|
| `yarn compile` | PASS / exit 0 |
| `yarn build` | PASS / exit 0 |
| `yarn test:sc` | PASS / exit 0 |
| `yarn test:library` | PASS / exit 0; includes 72 bridge checks and Level/Rank Library checks |
| `yarn --cwd workspace-server compile` | PASS / exit 0 |
| `yarn --cwd workspace-server test` | PASS / exit 0; 1088 tests passed, 0 failed/cancelled/skipped/todo |

Focused command, from `workspace-server`:

```sh
node --import tsx --test '--test-name-pattern=CR-0001[.][12]' \
  test/canonical-domain.test.ts test/confirmation-review.test.ts \
  test/carder-write-back.test.ts test/structure-acceptance.test.ts \
  test/rc-canonical-null-zero.test.ts
```

Result: **49 passed, 0 failed/cancelled/skipped/todo**: 16 Candidate A cases plus 33 Candidate B cases. Existing RC null/zero coverage also ran unfiltered in the full server gate. Candidate A renderer checks executed in the bridge portion of `yarn test:library`; all 72 bridge checks passed, including its 17 CR-0001.1 checks.

| Required preserved behavior | Combined evidence |
|---|---|
| NORMAL Spell/Trap have no circular NORMAL subtype icon; supported non-NORMAL icons remain | Existing renderer predicate/preparation matrix in bridge checks passes; renderer blob is exactly Candidate A |
| Canonical NORMAL and text-only write-back retain STRUCTURE | CR-0001.1 HTTP prepare/no-op/TEXT-only tests pass for both NORMAL families and other supported subtypes; full shared test coverage passes |
| Corrected Open in Carder copy | Exact Candidate A final blob retained; compile/build pass |
| Level integer 0..12/null; Rank integer 0..13/null; distinct zero/null; no clamp | Canonical direct/HTTP cases, Library pure checks, browser min/max/step, arrows, invalid retention, and persistence/reopen pass |
| Invalid new STRUCTURE rejected; history remains exact; unrelated legacy non-STRUCTURE mutation allowed | Canonical compatibility tests and historical browser TEXT-only save pass |
| Review/Confirm requires current domain | Confirmation-review cases and browser invalid-history/repair Review pass |
| Carder enforcement atomic | B Level/Rank accepted/rejected write-back and legacy TEXT/repair cases pass; rejected paths preserve snapshots/revision |
| External Preview/Apply bounds retained | Structure acceptance cases pass for valid/invalid Level/Rank and immutable evidence; browser repeats Preview 18 INELIGIBLE / 12 READY |

## Unchanged browser/operational harness

Executed unchanged:

```sh
NODE_PATH=/workspace/.rc-qa-tools/node_modules \
YU3DOH_QA_CHROMIUM=/usr/bin/chromium \
YU3DOH_QA_OUTPUT=/workspace/work/cr-0001-combined/browser \
node scripts/cr-0001-2-operational-qa.cjs
```

The runner started disposable Workspace fixtures and Vite, asserted the fixture and browser HEAD SHA, and shut down its child processes. It opened no user Workspace. Result: **exit 0, 8 case groups PASS, 11 intended successful PATCH requests, 0 page exceptions, 0 provider requests**. Invalid local submissions produced no additional PATCH. Evidence JSON and screenshots are tied to `64cb5f4ca42348c6c403e64e0d61bdff8c32a281`.

| Case group | Result |
|---|---|
| MAIN bounds, arrows, typed invalid/no-clamp/no-PATCH | PASS |
| MAIN max/zero/null persistence and reopen | PASS |
| XYZ bounds, arrows, typed invalid/no-clamp/no-PATCH | PASS |
| XYZ max/zero/null persistence and reopen | PASS |
| TOKEN bounds, arrows, typed invalid/no-clamp/no-PATCH | PASS |
| TOKEN max/zero/null persistence and reopen | PASS |
| historical exact value, TEXT-only save, password/structure gate, repair and Review | PASS |
| External Preview 18 ineligible / 12 eligible | PASS |

Existing dependency/build and React/Ant Design warnings appeared; all required commands exited successfully and the harness observed no page exceptions. This browser evidence covers Candidate B's operational behaviors. It does not establish a combined visual PASS for Candidate A's Carder icon behavior. No independent A visual result is inherited as combined approval.

## Version invariants

Compared byte-for-byte with frozen baseline: database schema constants, Workspace format constants, normalizer/candidate-schema source, all migration files, both package manifests and both Yarn lockfiles remain unchanged.

| Invariant | Result |
|---|---|
| Database schema | 8 |
| Workspace format | 1 |
| Migrations | 001–008, exactly eight unchanged SQL files |
| Migration 009 | ABSENT |
| Normalizer version | 2 |
| Candidate schema version | 1 |
| Dependency/lockfile changes | NONE |

Migration inventory:

- `001_repository_foundation.sql`
- `002_canonical_domain.sql`
- `003_art_variants_asset_index.sql`
- `004_managed_asset_ingest.sql`
- `005_asset_resolution_overrides.sql`
- `006_variant_lifecycle.sql`
- `007_external_source_ingestion.sql`
- `008_standard_structural_registry_baseline.sql`

## Publication and ref hygiene

The new combined branch was normally pushed to `origin`; no force update or source-branch rewrite was used. Post-push GitHub ref readback:

```text
59fb2924b2240f005fb3e9e6d5afbd8aaca39596	refs/heads/feature/workspace-cr-0001-2-level-rank-domain
64cb5f4ca42348c6c403e64e0d61bdff8c32a281	refs/heads/feature/workspace-cr-0001-combined
4c9b0228bb47ac074c49a977b48dbf0844c33a94	refs/heads/feature/workspace-v0.1
61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c	refs/heads/fix/workspace-rc-normal-subtype-icon
54cc3aad246c89a29f2a18be63c539db68cae041	refs/heads/main
```

The readback also queried `feature/workspace-run-024`; it remained absent. All four protected refs exactly equal their preflight SHAs. Local combined HEAD and remote combined HEAD agree. The control publication adds only `implementations/CR-0001_COMBINED_CANDIDATE_IMPLEMENTATION_REPORT.md`, retaining the frozen incoming authority, central mutable indexes, state, routing, and registry unchanged.

## Evidence digests

Logs and compact proofs are retained outside source in `work/cr-0001-combined/`; a user-facing evidence archive contains these files and browser captures without dependency caches.

| Command/evidence | Log | SHA-256 |
|---|---|---|
| `yarn compile` | `root-compile.log` | `ed2c7292831ff28c32cb02be234e642e833b2f4814b8bbc2040119557f5a7fb0` |
| `yarn build` | `root-build.log` | `d9817527c60cb646979a41b63ae6eca6c1d5ae16616d6b45711b859ac1a63405` |
| `yarn test:sc` | `test-sc.log` | `27321cfc6d95d90522cdaa3a3401b0046151eb19bde9ca19ace6b143a4ed897b` |
| `yarn test:library` | `test-library.log` | `5046b99ee3d292b7f463b11db29698cdeec0252dc2bfbc2ff640a2ce816abdd8` |
| `yarn --cwd workspace-server compile` | `server-compile.log` | `93455b8f4f14aa75523f858e48d788dd5e0b57acabf320d22c758922d2a6fb26` |
| `yarn --cwd workspace-server test` | `server-test.log` | `92f195f311884977897a892ac8586ec3136236dfb4487a309ac1bd209f07e728` |
| `Focused A+B server cases` | `focused-server.log` | `9dfbf3db3d545479878e33de8f876e8c1aa1ad9c051e21e009e9ceab3c000784` |
| `Unchanged Candidate B browser harness` | `browser.log` | `0918a51760cca05e986fc0bc6152cefc019c81360d2c3b3cbb08b3619e1e7916` |

## Remaining limitations and next owner

No implementation blocker remains. Development evidence is Linux/Chromium only. Combined External Design + QA has not issued a disposition. DESIGN_QA / DQA-001 must validate exact combined SHA `64cb5f4ca42348c6c403e64e0d61bdff8c32a281` and decide whether additional DEPLOYMENT_VALIDATION evidence is required, including combined Carder visual behavior. This report does not authorize integration or deployment. `feature/workspace-v0.1` and `main` remain at their frozen SHAs; RUN 024 and migration 009 were not created.

Final Development status: **READY FOR EXTERNAL QA**.
