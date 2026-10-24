---
artifact_id: P5-CANDIDATE-A-001-DEPLOY-003-VALIDATION-EVIDENCE
artifact_type: validation_evidence_report
status: EVIDENCE_READY
protocol_version: "1.0"
source_role: DEPLOYMENT_VALIDATION
source_instance: DEPLOY-003
target_role: DESIGN_QA
target_instance: DQA-001
assignment_control_sha: caafbe5e7be82624f2a57950ed1bc0f1bc38daa7
candidate_branch: fix/workspace-rc-normal-subtype-icon
candidate_sha: 61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c
ops_branch: ops/candidate-a-deploy-003-actions
ops_head: 22d89b3bb4c6e15b1dcc56eff84d71093e74947b
actions_run_id: 40076376323
actions_job_id: 120820475829
github_artifact_id: 12552909783
artifact_digest: sha256:071fe5f35ab7e64c8bb2ff34950505f58ef4f6f2e2454301fb8f74ac366e46e1
cases_executed: 6
cases_satisfactory: 6
cases_unsatisfactory: 0
---

# VALIDATION EVIDENCE REPORT — DEPLOY-003

Final operational status: **EVIDENCE READY**.

All six frozen operational cases were actually executed on the real exact-SHA Candidate A. Each is SATISFACTORY. This report supplies operational evidence; it does not issue or supersede the External QA disposition. DQA-001 owns that decision.

## Authority and scope

The following were read completely at assignment CONTROL SHA `caafbe5e7be82624f2a57950ed1bc0f1bc38daa7`:

- `PROJECT_STATE.md`
- `routing/ROUTE-P5-CANDIDATE-A-DEPLOY-003.md`
- `validations/P5-CANDIDATE-A-001/EVIDENCE_REQUEST.md`
- `validations/P5-CANDIDATE-A-001/ENV-002_ENVIRONMENT_READINESS_REPORT.md`
- `chats/instances/DEPLOY-003.md`
- `roles/DEPLOYMENT_VALIDATION.md`
- `protocols/COMMUNICATION_PROTOCOL.md`

The frozen EVIDENCE_REQUEST alone defines EXPECTED behavior. The subsequent route and owner instruction explicitly authorize external validation workflow/harness commits on the provisioned ops branch. No Candidate source, migration, dependency manifest or lockfile was edited. No prior QA, Deployment or Environment Readiness artifact was modified.

ENV-002 readiness run `40073048304` was independently verified completed/success. The new operational run uses its same-runner topology: separate real Candidate Git checkout, real Workspace Service, real Vite Library/Carder and real Chromium. No mocks, substituted renderer, simulated write-back or owner-manual execution were used.

## Execution and exact-SHA custody

Repository: `KhaosMagnus/YU3DOH-Carder`.

Candidate branch: `fix/workspace-rc-normal-subtype-icon`.

Candidate SHA: `61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c`.

The branch was verified on GitHub before work. Actions separately checked out this exact commit into `candidate-a/` with `.git`; its detached HEAD is intentional. The operational harness was checked out into `ops-control/`.

| Evidence | Before behavior | After behavior |
| --- | --- | --- |
| `git rev-parse HEAD` | `61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c` | same exact SHA |
| `git status --porcelain` | empty | empty |
| working diff | empty | empty |
| cached diff | empty | empty |
| remote Candidate ref | exact requested SHA | Candidate was not changed |

The workflow fails on final SHA or cleanliness mismatch; final integrity completed successfully. See `git-preflight.json`, `git-final.json` and the job logs. Frozen root and Workspace Service lockfiles were installed with `--frozen-lockfile --non-interactive`; Workspace Service compilation succeeded.

Environment:

- GitHub-hosted Ubuntu 24.04.5 LTS, x64; runner image `ubuntu-24.04`, version `20261012.334.1` (job setup log).
- Node `v24.19.0`; Yarn `1.22.22`; Git `2.55.0`.
- Playwright Core `1.58.2`; Chromium `145.0.7632.6`, headless, viewport 1800 × 1400.
- Workspace Service: `http://127.0.0.1:4312`.
- Library: `http://127.0.0.1:3000/ygocarder/library/`.
- Carder: `http://127.0.0.1:3000/ygocarder/`, with real Workspace intent parameters. Full launched URLs are in `operational-results.json`.
- Disposable Workspace ID `deploy-003-actions-readiness`, path `/home/runner/work/_temp/deploy003-workspace`; schema 8, READY. The ID retains the readiness harness naming suffix. All data belongs to this disposable operational run.
- Run interval: `2026-10-24T08:00:55Z`–`2026-10-24T08:02:50Z` (02:00:55–02:02:50 America/Mexico_City).

Only two infrastructure files were added on `ops/candidate-a-deploy-003-actions`:

- `validation/deploy003.cjs`, commit `2f818361475a2867b767b191c6e5e514f772f1d0`.
- `.github/workflows/candidate-a-deploy-003.yml`, final ops commit `22d89b3bb4c6e15b1dcc56eff84d71093e74947b`.

One DEPLOY-003 Actions run was required; no corrective rerun occurred.

## Evidence location and integrity

- [Actions run 40076376323](https://github.com/KhaosMagnus/YU3DOH-Carder/actions/runs/40076376323), job `120820475829`, completed/success.
- [Evidence artifact 12552909783](https://github.com/KhaosMagnus/YU3DOH-Carder/actions/runs/40076376323/artifacts/12552909783).
- Artifact name: `deploy003-validation-40076376323-61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c`.
- ZIP size: 17,909,305 bytes.
- GitHub digest and independently downloaded ZIP SHA-256 both equal `071fe5f35ab7e64c8bb2ff34950505f58ef4f6f2e2454301fb8f74ac366e46e1`.
- Every extracted evidence file was verified against `manifest.sha256`; all matched.
- GitHub retention currently expires `2027-01-22T08:00:55Z`. Hashes and operational conclusions are preserved in this control artifact; raw evidence is retained in the linked Actions artifact for that period.

All evidence filenames below are relative to this artifact's root. `A-OP-0N-carder.png` is an actual browser screenshot. `A-OP-0N-canvas-1.png` is the actual renderer's `preview-canvas` PNG at 813 × 1185; it was visually inspected, not reconstructed. `A-OP-0N-canvases.json` maps every canvas index to its DOM ID and size. The other individual canvas exports are supplementary renderer evidence.

The browser's working state was read through the running Vite module's existing `useCard.getState().card` solely for observation. No store mutation or product source instrumentation was used. The A-OP-05 edits were made through the actual visible Name input and actual save/acknowledgement buttons.

## Common rendering steps

1. Bootstrap the disposable Workspace with Candidate's existing persistence/service APIs. Create and confirm STRUCTURE and TEXT:EN for each fixture, and ingest a small solid-color BS image through the managed-asset API.
2. Start the real service and Vite; open Library in Chromium.
3. Select the named Library card, enter `Variants / Assets`, and click `Open Standard`.
4. Capture the actual prepare-working-card POST request, HTTP 200 response and prepared DTO. Let the resulting popup execute Candidate's normal bridge/startup path.
5. Capture the working projection, full browser screenshot and renderer canvas pixels; read authoritative Canonical detail through HTTP before/after opening.

The solid-color artwork is intentional disposable fixture content. Rendering cases' before/after snapshots precede any A-OP-05 text edit.

## Case results

### CASE A-OP-01 — NORMAL SPELL

**EXPECTED:** Spell frame, top-right SPELL attribute icon retained, type line `Spell Card`, no circular NORMAL subtype icon, Canonical remains NORMAL.

**OBSERVED:** Actual browser screenshot and renderer pixels show the Spell frame, top-right SPELL attribute icon and `Spell Card` type line. No circular NORMAL subtype icon appears. Prepared DTO: `family:SPELL`, `subtype_code:NORMAL`. Working state: `frame:spell`, `attribute:SPELL`, `subFamily:NORMAL`, `typeAbility:["Spell Card"]`. Authoritative Canonical detail is identical before/after opening: subtype `NORMAL`, revision `2`.

**SHA:** `61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c`.

**STEPS:** Common rendering steps 1–5, fixture `DEPLOY003 Normal Spell`, card ID `733abcd9-4d56-4239-a3e0-ec45a78c724a`.

**EVIDENCE:** `A-OP-01-carder.png`; `A-OP-01-canvas-1.png`; `A-OP-01-prepare.json`; `A-OP-01-working.json`; `A-OP-01-canonical-before.json`; `A-OP-01-canonical-after.json`. Actual HTTP prepare response: 200. The artifact manifest binds each file to its hash and this exact run.

**RESULT:** `SATISFACTORY`.

### CASE A-OP-02 — NORMAL TRAP

**EXPECTED:** Trap frame, top-right TRAP attribute icon retained, type line `Trap Card`, no circular NORMAL subtype icon, Canonical remains NORMAL.

**OBSERVED:** Actual browser screenshot and renderer pixels show the Trap frame, top-right TRAP attribute icon and `Trap Card` type line. No circular NORMAL subtype icon appears. Prepared DTO: `family:TRAP`, `subtype_code:NORMAL`. Working state: `frame:trap`, `attribute:TRAP`, `subFamily:NORMAL`, `typeAbility:["Trap Card"]`. Authoritative Canonical detail is identical before/after opening: subtype `NORMAL`, revision `2`.

**SHA:** `61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c`.

**STEPS:** Common rendering steps 1–5, fixture `DEPLOY003 Normal Trap`, card ID `a0a257e0-fc78-4883-a0e8-92d360bdfe9e`.

**EVIDENCE:** `A-OP-02-carder.png`; `A-OP-02-canvas-1.png`; `A-OP-02-prepare.json`; `A-OP-02-working.json`; `A-OP-02-canonical-before.json`; `A-OP-02-canonical-after.json`. Actual HTTP prepare response: 200. The artifact manifest binds each file to its hash and this exact run.

**RESULT:** `SATISFACTORY`.

### CASE A-OP-03 — FIELD SPELL

**EXPECTED:** Spell renders normally, Field subtype icon visibly retained, Canonical remains FIELD.

**OBSERVED:** Actual browser screenshot and renderer pixels show the Spell frame, top-right SPELL attribute icon and `Spell Card` type line. The Field icon is visibly present beside the type line. Prepared DTO: `family:SPELL`, `subtype_code:FIELD`. Working state: `frame:spell`, `attribute:SPELL`, `subFamily:FIELD`, `typeAbility:["Spell Card"]`. Authoritative Canonical detail is identical before/after opening: subtype `FIELD`, revision `2`.

**SHA:** `61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c`.

**STEPS:** Common rendering steps 1–5, fixture `DEPLOY003 Field Spell`, card ID `abdd1635-25bc-44d3-a2f7-28cc16a4c3f3`.

**EVIDENCE:** `A-OP-03-carder.png`; `A-OP-03-canvas-1.png`; `A-OP-03-prepare.json`; `A-OP-03-working.json`; `A-OP-03-canonical-before.json`; `A-OP-03-canonical-after.json`. Actual HTTP prepare response: 200. The artifact manifest binds each file to its hash and this exact run.

**RESULT:** `SATISFACTORY`.

### CASE A-OP-04 — COUNTER TRAP

**EXPECTED:** Trap renders normally, Counter subtype icon visibly retained, Canonical remains COUNTER.

**OBSERVED:** Actual browser screenshot and renderer pixels show the Trap frame, top-right TRAP attribute icon and `Trap Card` type line. The Counter icon is visibly present beside the type line. Prepared DTO: `family:TRAP`, `subtype_code:COUNTER`. Working state: `frame:trap`, `attribute:TRAP`, `subFamily:COUNTER`, `typeAbility:["Trap Card"]`. Authoritative Canonical detail is identical before/after opening: subtype `COUNTER`, revision `2`.

**SHA:** `61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c`.

**STEPS:** Common rendering steps 1–5, fixture `DEPLOY003 Counter Trap`, card ID `b96fcccb-6e60-468e-962f-833c1d302c91`.

**EVIDENCE:** `A-OP-04-carder.png`; `A-OP-04-canvas-1.png`; `A-OP-04-prepare.json`; `A-OP-04-working.json`; `A-OP-04-canonical-before.json`; `A-OP-04-canonical-after.json`. Actual HTTP prepare response: 200. The artifact manifest binds each file to its hash and this exact run.

**RESULT:** `SATISFACTORY`.

### CASE A-OP-05 — separate NORMAL SPELL and NORMAL TRAP text-only write-backs

**EXPECTED:** For each family independently, the acknowledged save succeeds, only the appropriate TEXT block changes, STRUCTURE is not reported changed, Canonical NORMAL is preserved, STRUCTURE stays CONFIRMED, the changed confirmed TEXT block moves to DRAFT after explicit acknowledgement, CARDER_WRITE_BACK provenance targets that TEXT block, and revision follows the existing mutation contract.

**SHA:** `61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c`.

**STEPS:** For each of A-OP-01 and A-OP-02 independently, preserve authoritative Canonical starting detail; fill only Carder's `#name` input with the original name plus ` edited`; click `Save to Workspace`; capture the visible `Confirm Workspace save` dialog listing only TEXT:EN; click `Acknowledge and Save to Workspace`; capture the real POST `/api/v1/carder/write-back` request/response and UI result; GET authoritative Canonical detail after save. No direct write-back call was substituted for the Carder UI.

**OBSERVED:** Both acknowledged requests returned HTTP 200. Browser working-state before/after comparison shows only `name` changed. Both responses report `changed:true`, `changed_blocks:["TEXT:EN"]`, `moved_to_draft:["TEXT:EN"]`, `previous_revision:"2"`, `revision:"3"`. STRUCTURE is absent from both changed-block lists. Canonical comparison confirms unchanged family/password/structure/classification/relations and unchanged localized card_text/pendulum_text; only the selected EN name and its required revision/confirmation/provenance bookkeeping changed. The single mutation increased revision once, consistent with the existing Carder write-back/canonical mutation contract.

| Check | NORMAL SPELL | NORMAL TRAP |
| --- | --- | --- |
| card_id | `733abcd9-4d56-4239-a3e0-ec45a78c724a` | `a0a257e0-fc78-4883-a0e8-92d360bdfe9e` |
| EN name before | DEPLOY003 Normal Spell | DEPLOY003 Normal Trap |
| EN name after | DEPLOY003 Normal Spell edited | DEPLOY003 Normal Trap edited |
| Canonical subtype before → after | NORMAL → NORMAL | NORMAL → NORMAL |
| STRUCTURE state before → after | CONFIRMED → CONFIRMED | CONFIRMED → CONFIRMED |
| STRUCTURE provenance link before → after | 1 → 1 | 3 → 3 |
| TEXT:EN state before → after | CONFIRMED → DRAFT | CONFIRMED → DRAFT |
| TEXT:EN confirmation provenance link | 2 → null | 4 → null |
| revision before → after | 2 → 3 | 2 → 3 |
| new provenance ID | 9 | 10 |
| new provenance source_kind | CARDER_WRITE_BACK | CARDER_WRITE_BACK |
| new provenance target_kind / target_key | BLOCK / TEXT:EN | BLOCK / TEXT:EN |

Historical provenance entries remain intact. The new write-back provenance is an event on TEXT:EN; it does not become confirmation provenance for a Draft block. No new STRUCTURE provenance event was added.

**EVIDENCE:** For each `FAMILY` = `SPELL` and `TRAP`: `A-OP-05-FAMILY-before.json`, `A-OP-05-FAMILY-working-edited.json`, `A-OP-05-FAMILY-ack-visible.txt`, `A-OP-05-FAMILY-ack.png`, `A-OP-05-FAMILY-http.json`, `A-OP-05-FAMILY-after.json`, `A-OP-05-FAMILY-visible-result.txt`, `A-OP-05-FAMILY-result.png`; also `network.json`. The HTTP evidence contains the full actual request body including write grant, projection and acknowledgement, plus actual status/response including replacement write grant. Grants are from the terminated disposable service.

Exact captured request projection and acknowledgement (grant/card identity remain in the original HTTP evidence):

SPELL:

```json
{
  "card_id": "733abcd9-4d56-4239-a3e0-ec45a78c724a",
  "expected_revision": "2",
  "content_language": "EN",
  "projection": {
    "password": "12993000",
    "attribute": "SPELL",
    "star": "6",
    "atk": "",
    "def": "",
    "sub_family": "NORMAL",
    "name": "DEPLOY003 Normal Spell edited",
    "effect": "Operational evidence fixture.",
    "pendulum_effect": "",
    "pendulum_scale_red": "4",
    "pendulum_scale_blue": "4"
  },
  "acknowledge_move_to_draft": [
    "TEXT:EN"
  ]
}
```

TRAP:

```json
{
  "card_id": "a0a257e0-fc78-4883-a0e8-92d360bdfe9e",
  "expected_revision": "2",
  "content_language": "EN",
  "projection": {
    "password": "12993001",
    "attribute": "TRAP",
    "star": "6",
    "atk": "",
    "def": "",
    "sub_family": "NORMAL",
    "name": "DEPLOY003 Normal Trap edited",
    "effect": "Operational evidence fixture.",
    "pendulum_effect": "",
    "pendulum_scale_red": "4",
    "pendulum_scale_blue": "4"
  },
  "acknowledge_move_to_draft": [
    "TEXT:EN"
  ]
}
```

**RESULT:** `SATISFACTORY` (NORMAL SPELL) and `SATISFACTORY` (NORMAL TRAP); combined A-OP-05 `SATISFACTORY`.

### CASE A-OP-06 — running Library Open in Carder copy

**EXPECTED:** Visible copy communicates Workspace snapshot/prepare/open, selectively saving supported edits, and explicit acknowledgement before changed confirmed blocks move to Draft. The obsolete RUN 009 no-write-back statement is absent.

**OBSERVED:** The running exact-SHA Library panel visibly displays:

> Prepares a read-only Workspace snapshot and opens Carder working state. Supported Carder edits can be selectively saved back to Workspace; changes to confirmed blocks require explicit acknowledgement before those blocks move to Draft.

The obsolete statement `Working edits are not saved back to Workspace in RUN 009.` is absent from the captured panel text. The panel's STANDARD action is enabled; its OVERFRAME action is unavailable for the deliberately BS-only fixture.

**SHA:** `61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c`.

**STEPS:** Open running Library, select DEPLOY003 Normal Spell, enter Variants / Assets, inspect the visible Open in Carder panel before launching Carder.

**EVIDENCE:** `A-OP-06-library-copy.png` (actual browser panel screenshot); `A-OP-06-visible-copy.txt` (complete panel innerText); `operational-results.json`.

**RESULT:** `SATISFACTORY`.

## Required evidence hash index

These are SHA-256 hashes of the actual extracted files. The complete manifest in the linked artifact covers the additional layer canvases and logs as well.

| Artifact-relative path | SHA-256 |
| --- | --- |
| `git-preflight.json` | `db390c62d725eff6e1ebd63782cd96fa781a4fc96c931d1d460f3c38221004b6` |
| `git-final.json` | `08780991e121aff5ec48732c8307301b5aee7577ee2df6c3a12805b94d6e7bb5` |
| `environment.json` | `992d89319b10e00c6340a8d1851ef0d7d1cae5880e87f84f96b632a8007809b7` |
| `browser.json` | `0992b32c1e4762c70c303c74a14243da13417a7577ba22c84815fa9be6788055` |
| `workspace-status.json` | `ecae2e018ca5f3cdcf2ba705d50600d9a9712befaadebd8cf58bac4a15d5df95` |
| `fixtures.json` | `c1e1a63a6cc619d852f46a19f79511e60380022d22edb6a43df58e308ead29b4` |
| `operational-results.json` | `c23eb29d3be8fda0ffc310f68337c77202ee2472366328217f37c4c0cae0025c` |
| `network.json` | `b94533b63a1e5a79247b6e254a8c2f61cb6eda610fe4ca2c78c26174b3bfb74e` |
| `manifest.sha256` | `497d987ec146b408fc3ea12f09fb18cad013381f7061b2940a939992bf2368f2` |
| `A-OP-01-carder.png` | `194d8ffcb0d721783a2ed927ab2eebf089d323c78fa2c5ddf7cba59b3e00bc0e` |
| `A-OP-01-canvas-1.png` | `8a48bab7118e8e34943f5166fe78c16d778cd627a2bff60a4a3f76f54f83bdf8` |
| `A-OP-01-prepare.json` | `76ab8c910e5bbadfd63c19aa5c8dfe1330de535988bdf26d5c254cede603123c` |
| `A-OP-01-working.json` | `85a8f4b0dbec731937e0980c59e7348df7ea9e3dedbcd2fa4bb6897d90b7aa1d` |
| `A-OP-01-canonical-before.json` | `56e1d1e510ad882e1d95175c85a65f9f52565ac783b9eb926c90bcc778fc6cb4` |
| `A-OP-01-canonical-after.json` | `56e1d1e510ad882e1d95175c85a65f9f52565ac783b9eb926c90bcc778fc6cb4` |
| `A-OP-02-carder.png` | `77c979857ffc6d8982770187f9d778ba73ac920175ee0145d63a3a035a2f58fa` |
| `A-OP-02-canvas-1.png` | `6c6733c186dfb36aa6105a46af39ebc7a27ba0a76b883fa126b555c65405c559` |
| `A-OP-02-prepare.json` | `394e01f9ad331ab5221c435a2d34e87cfa4d31013f6226049a3631111c303c7f` |
| `A-OP-02-working.json` | `2e30542a7a390315fd43057068646d977273f12000af51dbd38b6980f97034b9` |
| `A-OP-02-canonical-before.json` | `00da28ec3f5d140a72ecd861ef9310582250867c234f68610249dc5b063d60cb` |
| `A-OP-02-canonical-after.json` | `00da28ec3f5d140a72ecd861ef9310582250867c234f68610249dc5b063d60cb` |
| `A-OP-03-carder.png` | `25725272c317b701f9a2a904cd03719a28016adeeb9cab8caafac36ba9ef96fa` |
| `A-OP-03-canvas-1.png` | `24b7a8d021d218d9aa806316e4f1d50073560f0d853472093651c06e4432cc00` |
| `A-OP-03-prepare.json` | `d85628509e4ee492bd9cf47810673af2031ac156c3fad37636b061b45f45e86f` |
| `A-OP-03-working.json` | `f2f1a3868f5777456415e17854f1aa5f2fcc242fa1fb8ab038ce6c4c5a256530` |
| `A-OP-03-canonical-before.json` | `b2ea1a974e9bce2d82b89cfbc1587872d7d6e66fbf18b7830662e0a6210d3229` |
| `A-OP-03-canonical-after.json` | `b2ea1a974e9bce2d82b89cfbc1587872d7d6e66fbf18b7830662e0a6210d3229` |
| `A-OP-04-carder.png` | `8e1e5e4799d3b7b7ab6eaef011785744dbc4c7094207970face4e082feb2dada` |
| `A-OP-04-canvas-1.png` | `d936ca4fbfcd1cf3b10c0f947ebe29d6efd9858ced94e3b063dcc9ef713fc7f9` |
| `A-OP-04-prepare.json` | `099cc25c0d7876e845a000563676994747685d9d8ea0b3cc002dd7886d443114` |
| `A-OP-04-working.json` | `2542b2e26f40912bed9d43d962ff75996b1ce2b0fdbf07f1b9d3801a90941677` |
| `A-OP-04-canonical-before.json` | `ee535b6c8d122473f05853eea551bb71bdb7d9f179a53793fff873bf16b5b84b` |
| `A-OP-04-canonical-after.json` | `ee535b6c8d122473f05853eea551bb71bdb7d9f179a53793fff873bf16b5b84b` |
| `A-OP-05-SPELL-before.json` | `56e1d1e510ad882e1d95175c85a65f9f52565ac783b9eb926c90bcc778fc6cb4` |
| `A-OP-05-SPELL-working-edited.json` | `f684e552b096807f52f43d7b159b034c5cba76818336d51437cbd72fff778f18` |
| `A-OP-05-SPELL-ack-visible.txt` | `bab409aa5ecd6e3e41260cfe2712b2af8f17737052158e9c56a98fea2d714b31` |
| `A-OP-05-SPELL-ack.png` | `b63c7e72209b50a862c338af20f1295115d0885a3b78e2b585d7c832e5d0dc8a` |
| `A-OP-05-SPELL-http.json` | `d858431d452fccc780b0be5673789c5b8433f5d28f82752f97345fb2f6fb0822` |
| `A-OP-05-SPELL-after.json` | `59812e7b6e332df88cb3f41547d92e7bbd49e0330f0dfe88c95a90dd7b0765b3` |
| `A-OP-05-SPELL-visible-result.txt` | `03b203c29eff8643caf00a5e92f6ce573ae3d78a8ef97678eb6443afc5698904` |
| `A-OP-05-SPELL-result.png` | `ef8bae4053903b47d61fe3c5e5229ebe7630b0bda69de2580215cf06a3feb1a6` |
| `A-OP-05-TRAP-before.json` | `00da28ec3f5d140a72ecd861ef9310582250867c234f68610249dc5b063d60cb` |
| `A-OP-05-TRAP-working-edited.json` | `cdcf504b767811617d2e23e7651fac64eb2021c7172c7caf69eaf3aff2c7e5be` |
| `A-OP-05-TRAP-ack-visible.txt` | `bab409aa5ecd6e3e41260cfe2712b2af8f17737052158e9c56a98fea2d714b31` |
| `A-OP-05-TRAP-ack.png` | `f69ff3ddf2f053f61035eedce356e1d0c3a32103fb4e7c74c61f2eeefde5cd96` |
| `A-OP-05-TRAP-http.json` | `8cc58217b10270bcbdd283da0e5da93fc9449bede32cb634b82533cecace2eaf` |
| `A-OP-05-TRAP-after.json` | `c8b8bb507d5234e7a0bf6501d1504ddb487db4e2039eb47f22ab2161d8e39ffc` |
| `A-OP-05-TRAP-visible-result.txt` | `03b203c29eff8643caf00a5e92f6ce573ae3d78a8ef97678eb6443afc5698904` |
| `A-OP-05-TRAP-result.png` | `850e92d4cbd83dc10935f5d3bf7f44a5977b4d723e11bac45bbb15c6287bbee0` |
| `A-OP-06-library-copy.png` | `74377d26f9a35f73cbd76d46ccc221a3ac6e01cbbcf48136afe861e41376f5e4` |
| `A-OP-06-visible-copy.txt` | `8da65971959daf911b1c445354f09c203f7e75fc53f5ff655abbc0b839a4ef42` |

## Return and boundaries

Cases A-OP-01 through A-OP-06: 6/6 executed; 6 SATISFACTORY; 0 UNSATISFACTORY.

Final operational status: **EVIDENCE READY**.

No operational product defect was observed within this frozen contract. No Development re-entry was requested. Candidate A remained exact and clean. Candidate B combination, RUN 024, feature/workspace-v0.1 integration and main integration were not performed. Previous frozen artifacts remain untouched.

Next target: **DESIGN_QA / DQA-001** to evaluate this evidence and own the superseding final Candidate A QA disposition. The current PARTIAL QA disposition is not changed by Deployment Validation itself.
