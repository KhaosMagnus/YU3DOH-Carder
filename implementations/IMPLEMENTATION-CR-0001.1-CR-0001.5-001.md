---
artifact_id: IMPLEMENTATION-CR-0001.1-CR-0001.5-001
artifact_type: implementation_report
status: REVIEW
protocol_version: "1.0"
source_role: DEVELOPMENT
source_instance: UNREGISTERED
target_role: DESIGN_QA
related_requests: [CR-0001.1, CR-0001.5]
input_control_sha: fd5c49e071e89f3e19a378ccc544f9b2272f1391
input_primary_artifact: handoffs/CR-0001.1_CORRECTION_HANDOFF.md
global_state_read_sha: 6c86a95349700d0343d65c0833dbcd1ee6ed9ce9
control_parent_sha: 9919c20d6e7e4a089bb4c125ff9c613e716e843b
code_baseline:
  branch: feature/workspace-v0.1
  sha: 4c9b0228bb47ac074c49a977b48dbf0844c33a94
code_branch: fix/workspace-rc-normal-subtype-icon
commit_a: fab10c237514916d367f4646feda2cd24274b7f6
commit_b: 61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c
final_branch_head: 61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c
development_status: READY FOR EXTERNAL QA
supersedes: null
created_at: 2026-10-22T09:56:42.193384+00:00
approved_at: null
---

# IMPLEMENTATION REPORT — CR-0001.1 / F-01 + CR-0001.5 / F-05

Development status: **READY FOR EXTERNAL QA**.

NORMAL Spell/Trap now suppresses the subtype icon at the renderer while retaining Canonical NORMAL and Carder NORMAL semantics. The obsolete RUN 009 Open in Carder message is corrected in a separate copy-only commit. All six required Development regression commands passed on final HEAD. External QA acceptance has not been issued; section 10 operational visual validation remains with DESIGN_QA / DEPLOYMENT_VALIDATION.

## Authority and recovery provenance

Repository: KhaosMagnus/YU3DOH-Carder.

Execution authority is the complete frozen handoff at CONTROL SHA fd5c49e071e89f3e19a378ccc544f9b2272f1391, path handoffs/CR-0001.1_CORRECTION_HANDOFF.md, Git blob fba0776ac5a77877f2c0a06f5eed0b0fbdd57467. It remains unchanged at the control publication parent. The nine requested protocol/role/state/request/routing documents were read in full at global activation SHA 6c86a95349700d0343d65c0833dbcd1ee6ed9ce9. Later global state did not replace the frozen execution authority.

The handoff metadata control_parent_sha is 461522f47a9fc5dcdb63f01b8b000b6fb1a27b90; that is an ancestor of the execution SHA, not its immediate Git parent. The immediate Git parent is 9ea55675b3b1cfef6d4a3ad801892467f1fd470f. This provenance distinction was verified without changing authority or scope.

Before implementation, GitHub matched integration baseline 4c9b0228bb47ac074c49a977b48dbf0844c33a94, main 54cc3aad246c89a29f2a18be63c539db68cae041, RUN 023 c929a6020760525d5cf6daf695b2f44c1d3cd1ca, RUN 024 absent, and the correction branch absent. Local baseline and working tree were clean. The new correction branch was created directly from the exact authorized baseline; no reset/rebase or existing-branch recreation occurred.

## Exact commits and changed files

| Order | SHA | Parent | Purpose |
|---|---|---|---|
| A | fab10c237514916d367f4646feda2cd24274b7f6 | 4c9b0228bb47ac074c49a977b48dbf0844c33a94 | fix(carder): suppress normal spell trap subtype icon |
| B / final | 61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c | fab10c237514916d367f4646feda2cd24274b7f6 | fix(library): update Open in Carder write-back copy |

GitHub compare baseline → final: ahead, ahead_by 2, behind_by 0, merge-base 4c9b0228bb47ac074c49a977b48dbf0844c33a94. Exactly four existing files changed:

| File | Commit | Change |
|---|---|---|
| src/draw/predefined-section/type-ability.ts | A | Small exported icon predicate and use at the existing drawing guard |
| scripts/test-workspace-bridge.ts | A | 17 focused deterministic checks in existing bridge suite |
| workspace-server/test/carder-write-back.test.ts | A | 16 focused server cases; bounded fixture parameter |
| src/library/open-in-carder.tsx | B | Visible descriptive copy only |

No additional production file, test file, workflow or package was added. Both code commits are published to fix/workspace-rc-normal-subtype-icon. Neither integration nor main was advanced.

## Renderer and copy decisions

The existing icon guard now calls shouldDrawTypeAbilityIcon. It retains the existing NO ICON and large-size conditions and suppresses drawing only for non-monster spell/trap frame with subFamily NORMAL. The same guard controls the subtype icon symbol and icon image request. NORMAL is not remapped to NO ICON. Spell/Trap frame, top-right attribute, type line and source DTO semantics remain unchanged. Monster, Skill and other size behavior retain the old decisions.

All Workspace bridge and server write-back production files remain byte-identical. There is no change to Canonical subtype interpretation, projection, reverse mapping, session/grant logic, confirmation or persistence. The server tests exercise existing HTTP prepare/write paths to prove no-op revision preservation, acknowledged TEXT-only behavior, explicit subtype edits and clearing through NO ICON.

Commit B keeps the existing opening sentence, “Prepares a read-only Workspace snapshot and opens Carder working state.” It replaces the obsolete RUN 009 statement with exactly:

> Supported Carder edits can be selectively saved back to Workspace; changes to confirmed blocks require explicit acknowledgement before those blocks move to Draft.

Exact byte-replacement verification proves this is the only change in that file. Compile/build and source-diff review validate the copy; no brittle copy-mirroring test was added. API calls, launch/readiness behavior and write eligibility are untouched.

## AC mapping

Results below are Development deterministic/source-contract evidence, not an External QA visual verdict.

| AC | Development result | Evidence |
|---|---|---|
| AC-A1 NORMAL SPELL | PASS | Actual prepareWorkingCard mapping preserves spell frame, SPELL attribute, Spell Card type line and NORMAL subFamily; renderer predicate suppresses subtype icon; source DTO unchanged |
| AC-A2 NORMAL TRAP | PASS | Equivalent Trap frame/attribute/type-line/NORMAL preservation and icon suppression |
| AC-A3 null subtype | PASS | Null maps to NO ICON and remains distinct from NORMAL; explicit HTTP clearing to null, subsequent no-op/TEXT preserve null |
| AC-A4 non-NORMAL SPELL | PASS | CONTINUOUS, EQUIP, FIELD, QUICK_PLAY → QUICK-PLAY, RITUAL preserve semantics and positive icon guard |
| AC-A5 non-NORMAL TRAP | PASS | CONTINUOUS and COUNTER preserve semantics and positive icon guard |
| AC-A6 no-op | PASS | Both NORMAL HTTP prepare/no-op cases retain full DB state, revision, STRUCTURE and subtype; bridge classifies zero changed blocks |
| AC-A7 TEXT-only | PASS | Both NORMAL HTTP acknowledged TEXT:EN-only cases preserve subtype/STRUCTURE confirmation; only TEXT:EN changes to Draft with existing revision/provenance semantics |
| AC-A8 explicit subtype | PASS | SPELL NORMAL → FIELD → NO ICON → null and TRAP NORMAL → COUNTER → NO ICON → null exercise existing HTTP contract |
| AC-A9 invalid guards | PASS | SPELL COUNTER and TRAP QUICK-PLAY/EQUIP/FIELD/RITUAL remain rejected without writes, with bridge guard coverage |
| AC-A10 RC null/zero | PASS | Existing unchanged rc-canonical-null-zero suite: 47 passing cases in full server gate; Level/Rank/Pendulum production unchanged |
| AC-B1 stale copy | PASS | Exact obsolete RUN 009 sentence removed |
| AC-B2 accurate copy | PASS | Workspace snapshot opening retained; supported selective write-back and explicit confirmed-block acknowledgement described |
| AC-B3 copy-only | PASS | Commit B has one file and only the exact text replacement; no behavior changes |

## Required matrix

| Family | Canonical subtype | Carder semantic | Icon predicate | Canonical after no-op/TEXT-only |
|---|---|---|---|---|
| SPELL | NORMAL | NORMAL | no subtype icon | NORMAL |
| TRAP | NORMAL | NORMAL | no subtype icon | NORMAL |
| SPELL | null | NO ICON | no subtype icon | null |
| TRAP | null | NO ICON | no subtype icon | null |
| SPELL | CONTINUOUS | CONTINUOUS | icon retained | unchanged |
| SPELL | EQUIP | EQUIP | icon retained | unchanged |
| SPELL | FIELD | FIELD | icon retained | unchanged |
| SPELL | QUICK_PLAY | QUICK-PLAY | icon retained | unchanged |
| SPELL | RITUAL | RITUAL | icon retained | unchanged |
| TRAP | CONTINUOUS | CONTINUOUS | icon retained | unchanged |
| TRAP | COUNTER | COUNTER | icon retained | unchanged |

Null preparation has an existing Canonical CONFIRMED-readiness restriction. This correction does not broaden readiness. Null mapping/icon evidence is exercised directly through the bridge; HTTP null persistence/no-op/TEXT evidence follows explicit NO ICON clearing within an existing valid write session. The other nine rows exercise actual HTTP prepare/no-op/TEXT flows.

## Validation on exact final code SHA

Final SHA: 61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c. Environment: Linux cloud workspace, Node v24.19.0, Yarn 1.22.22. No code changes followed these gates.

| Required command | Result | Evidence |
|---|---|---|
| yarn compile | PASS / exit 0 | Root TypeScript compile |
| yarn build | PASS / exit 0 | Production build |
| yarn test:sc | PASS / exit 0 | “Simplified Chinese card mode tests passed.” |
| yarn test:library | PASS / exit 0 | 416 numbered client/bridge checks, including 72 bridge checks |
| yarn --cwd workspace-server compile | PASS / exit 0 | Server TypeScript compile |
| yarn --cwd workspace-server test | PASS / exit 0 | 1056 tests, 1056 pass, 0 fail, 0 skipped, 0 cancelled, 0 todo |

Focused suite development runs passed: bridge 72 checks (55 existing + 17 new); server Carder write-back 65 cases (49 existing + 16 new). The final full gates include these cases again on final SHA. Client/bridge numbered count increases 399 → 416; server count increases 1040 → 1056. Existing RC null/zero 47 cases all pass. No required test was skipped. Full gate retains existing security, backup/recovery, maintenance and ingestion suites.

New server case names, discoverable in the committed existing test file:

- CR-0001.1 SPELL NORMAL prepare, no-op and TEXT-only retain subtype/STRUCTURE
- CR-0001.1 TRAP NORMAL prepare, no-op and TEXT-only retain subtype/STRUCTURE
- CR-0001.1 SPELL CONTINUOUS prepare, no-op and TEXT-only retain subtype/STRUCTURE
- CR-0001.1 SPELL EQUIP prepare, no-op and TEXT-only retain subtype/STRUCTURE
- CR-0001.1 SPELL FIELD prepare, no-op and TEXT-only retain subtype/STRUCTURE
- CR-0001.1 SPELL QUICK_PLAY prepare, no-op and TEXT-only retain subtype/STRUCTURE
- CR-0001.1 SPELL RITUAL prepare, no-op and TEXT-only retain subtype/STRUCTURE
- CR-0001.1 TRAP CONTINUOUS prepare, no-op and TEXT-only retain subtype/STRUCTURE
- CR-0001.1 TRAP COUNTER prepare, no-op and TEXT-only retain subtype/STRUCTURE
- CR-0001.1 SPELL NORMAL -> FIELD -> NO ICON -> null; null no-op/TEXT remain distinct
- CR-0001.1 TRAP NORMAL -> COUNTER -> NO ICON -> null; null no-op/TEXT remain distinct
- CR-0001.1 SPELL rejects invalid subtype COUNTER without writes
- CR-0001.1 TRAP rejects invalid subtype QUICK-PLAY without writes
- CR-0001.1 TRAP rejects invalid subtype EQUIP without writes
- CR-0001.1 TRAP rejects invalid subtype FIELD without writes
- CR-0001.1 TRAP rejects invalid subtype RITUAL without writes

No GitHub Actions, Windows or browser execution is claimed. The exact frozen Development gate requires the six commands above; it does not add an OS matrix, and workflow changes are forbidden. Final independent visual operational evidence is expressly assigned by handoff section 10 to External Design + QA, optionally DEPLOYMENT_VALIDATION. This is the remaining review activity, not a skipped Development regression command.

Local gate-log SHA-256 digests (logs retained in /workspace/scratch; the report itself contains results for cross-chat review):

| Command | Log | SHA-256 |
|---|---|---|
| yarn compile | CR0001_ROOT_COMPILE.log | d2e29cc2775d600004805ab54c26422a0612204f156fff1e1bc06c67485d7261 |
| yarn build | CR0001_ROOT_BUILD.log | fbc8a8bcf26e4448e0c5b958cd20aa8c3012fd14448e8b365bd221289c6c816c |
| yarn test:sc | CR0001_TEST_SC.log | 5e5ac460928bf7daf6c7362bdc182a80ac2be1b6fc8e11031810a8c3906655b1 |
| yarn test:library | CR0001_TEST_LIBRARY.log | 398002600e100a9bc362cba01ec81e043aa34d64ac077e552fc406df476da1fb |
| yarn --cwd workspace-server compile | CR0001_SERVER_COMPILE.log | 80c9c75535bbf9fc7151a0dc7cbe2e1b414411446fbf87e0517e3abfd3f93dc8 |
| yarn --cwd workspace-server test | CR0001_FULL_SERVER.log | 553b999c49999d49c30a4cd194a769274356b18aacd74f8ed8364550e0e531f0 |

## Immutability and boundaries

Exact code diff is limited to the four listed files. Byte comparison against baseline passes for 166 protected files, including all Workspace server production files, Workspace bridge production, unrelated renderer/Library files, the RC regression suite, packages, lockfiles, migrations and workflows. No Canonical, Classification, Relations, Asset, Variant, backup/recovery or external-source production changes occurred.

Database schema remains 8. Workspace format remains 1. Migration 009 is absent. Complete migration inventory and unchanged SHA-256:

| Migration | SHA-256 |
|---|---|
| 001_repository_foundation.sql | 804707ba8828711788ddd02a974f18a4e9fdd161f304d30e2c2a5d52272fab38 |
| 002_canonical_domain.sql | 32aec1da1c344c6c08bf1b4fed89880307bd04885e84db7210718054d1bb76cd |
| 003_art_variants_asset_index.sql | d43d4e78ce0bd121d1734d6f82152b5e2f516d1b29ad766a8a3e9c351af036a1 |
| 004_managed_asset_ingest.sql | 2ef2007bdb358ab783ce5425c283c8fd9f085a0315d31e3d63e279bdb29c1124 |
| 005_asset_resolution_overrides.sql | 0fcf1c3f6bd85b15a87fe56304e03b5a4b75e17371667542df556719086d5b0a |
| 006_variant_lifecycle.sql | 6f13a440e0c61e7623226653cae6a778b1e453de00a1ddd2a7c7b533624dc25f |
| 007_external_source_ingestion.sql | f7785a2f55f7e33ea376e9ab392fe5d973adc4b8edd0691393cd85bea23822d2 |
| 008_standard_structural_registry_baseline.sql | a1c37e9a5125d3d27daa40e8104d0af8e39a06801f2a4247fe0adbd4d8a8f39b |

Unchanged package/lockfile SHA-256:

| File | SHA-256 |
|---|---|
| package.json | 391cac6302d9993235318e44a40c1a2daebc506796b142f29787b9abc1a26275 |
| workspace-server/package.json | e52e8717fa714b1c7b499d599a1d733d9f55fa7f8a3387f9f05ac50140dcd490 |
| yarn.lock | 7b1b702811b5932aeb1c4375ecac6eed02cf51b2cb4dd500a0a2e972d917b0a7 |
| workspace-server/yarn.lock | 3209163e59d04e1fb53caebded582b4d74bcb69918d89376adeb0e01b7fbb98b |

GitHub refs read back at 2026-10-22T09:56:42.167290+00:00:

| Ref | Observed SHA/state |
|---|---|
| feature/workspace-v0.1 | 4c9b0228bb47ac074c49a977b48dbf0844c33a94 — unchanged |
| fix/workspace-rc-normal-subtype-icon | 61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c |
| main | 54cc3aad246c89a29f2a18be63c539db68cae041 — unchanged |
| feature/workspace-run-023 | c929a6020760525d5cf6daf695b2f44c1d3cd1ca — unchanged |
| feature/workspace-run-024 | ABSENT / NOT STARTED |

Only the correction branch was normally pushed. No integration, merge, squash, rebase, cherry-pick, amendment, history reset or force update was performed. CR-0001.2, .3, .4 and .6 were not implemented or reopened. No subsequent RUN was started.

This new report is the only authorized Project Control publication for this Development transfer. It is appended to the latest control parent with expected-head protection; it does not edit the frozen incoming handoff, PROJECT_STATE, role registry, request ledger, routing or indexes. The output envelope will identify the exact publication commit; this document's input_control_sha remains the original frozen execution authority.

## Next owner and required review

DESIGN_QA should validate exact code SHA 61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c against the frozen input contract. Required operational evidence remains: Workspace → Carder NORMAL SPELL and NORMAL TRAP icon absence, FIELD SPELL and COUNTER TRAP icon presence, NORMAL Spell/Trap TEXT-only write-back preserving Canonical NORMAL, and the revised Open in Carder copy. Route independent browser evidence to DEPLOYMENT_VALIDATION if needed. No integration authorization is requested or implied by this report.

Final Development status: **READY FOR EXTERNAL QA**.
