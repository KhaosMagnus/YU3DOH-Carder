---
artifact_id: CR-0001-COMBINED-001-DEPLOY-004-VALIDATION-EVIDENCE
artifact_type: validation_evidence_report
status: FROZEN
operational_status: EVIDENCE_READY
protocol_version: "1.0"
source_role: DEPLOYMENT_VALIDATION
source_instance: DEPLOY-004
target_role: DESIGN_QA
target_instance: DQA-001
assignment_control_sha: c1d9d9f12ce2ebe05c19a12028536a092b9c36ce
control_parent_sha: c1d9d9f12ce2ebe05c19a12028536a092b9c36ce
related_requests: [CR-0001.1, CR-0001.2, CR-0001.5]
code_baseline:
  branch: feature/workspace-cr-0001-combined
  sha: 64cb5f4ca42348c6c403e64e0d61bdff8c32a281
ops_branch: ops/cr-0001-combined-deploy-004-actions
behavioral_ops_sha: cbf1ec9ef956efc7860551d0c5ef64ef9a19c6f7
retrieval_ops_sha: b4df05521964d97060bd5d1108518a79083afd38
actions_run_id: 40079213445
actions_job_id: 120829045260
github_artifact_id: 12553963296
artifact_digest: sha256:d0b7cf8cc1e1a6c3de791d42f253e5489be8c2063dc9332eb2dfca41cf98d773
retrieval_run_id: 40081520720
cases_executed: 6
cases_satisfactory: 6
cases_unsatisfactory: 0
supersedes: null
---

# DEPLOY-004 — Combined Candidate Operational Validation Evidence

Final operational status: **EVIDENCE READY**.

C-OP-01 through C-OP-06 actually executed against exact combined SHA `64cb5f4ca42348c6c403e64e0d61bdff8c32a281`. All six are **SATISFACTORY**, including separate NORMAL SPELL and NORMAL TRAP executions within C-OP-05. Actual screenshots, renderer pixels, prepared DTOs, working projections, acknowledged HTTP exchanges and authoritative Canonical snapshots were inspected. No mismatch was observed within this bounded contract.

This is operational evidence for DESIGN_QA / DQA-001. It does not issue the superseding final combined QA disposition. The current combined QA disposition remains PARTIAL until DQA acts.

## Authority and bounded execution

The following assignment documents were read completely at CONTROL SHA `c1d9d9f12ce2ebe05c19a12028536a092b9c36ce`:

- `PROJECT_STATE.md`
- `routing/ROUTE-CR-0001-COMBINED-DEPLOY-004.md`
- `validations/CR-0001-COMBINED-001/DESIGN_QA_REPORT.md`
- `validations/CR-0001-COMBINED-001/EVIDENCE_REQUEST.md`
- `implementations/CR-0001_COMBINED_CANDIDATE_IMPLEMENTATION_REPORT.md`
- `validations/P5-CANDIDATE-A-001/ENV-002_ENVIRONMENT_READINESS_REPORT.md`
- `chats/instances/DEPLOY-004.md`
- `roles/DEPLOYMENT_VALIDATION.md`
- `protocols/COMMUNICATION_PROTOCOL.md`

The frozen combined EVIDENCE_REQUEST defines EXPECTED behavior. Git control, artifact lifecycle and concurrent publication policies were also read. The current control HEAD was reread before publication; the assignment authority remains unchanged. Only this new role-owned control artifact is published.

The proven ENV-002 / Candidate A DEPLOY-003 GitHub-hosted Actions topology was reused: separate candidate Git checkout, real Workspace Service, Vite Library/Carder and Chromium in the same runner namespace. No new readiness gate was needed. Candidate B's accepted exact-combined-SHA Level/Rank matrix was not repeated. No unrelated RC cases were executed.

There was exactly **one behavioral run**, `40079213445`. Its external harness is `validation/deploy004.cjs` and workflow is `.github/workflows/combined-deploy-004.yml` at operational SHA `cbf1ec9ef956efc7860551d0c5ef64ef9a19c6f7`, descended from the assigned initial ops SHA `22d89b3bb4c6e15b1dcc56eff84d71093e74947b`. Only validation infrastructure was changed on the ops branch.

## Exact-SHA custody and environment

Repository: `KhaosMagnus/YU3DOH-Carder`.

Candidate: `feature/workspace-cr-0001-combined @ 64cb5f4ca42348c6c403e64e0d61bdff8c32a281`.

Actions checked out the candidate by exact commit into `combined-candidate/`, with its own Git metadata, separately from `ops-control/`. Detached HEAD is intentional; remote branch identity was checked independently.

| Check | Before execution | After execution |
| --- | --- | --- |
| git rev-parse HEAD | `64cb5f4ca42348c6c403e64e0d61bdff8c32a281` | `64cb5f4ca42348c6c403e64e0d61bdff8c32a281` |
| git status --porcelain | empty | empty |
| working diff | empty | empty |
| cached diff | empty | empty |
| remote candidate identity | requested branch at exact SHA | combined branch remains at exact SHA |

The workflow and harness both enforce SHA and cleanliness checks. The final integrity workflow step completed successfully. Evidence: `git-preflight.json`, `git-final.json`, original job logs.

Environment recorded by the original behavioral run:

- GitHub-hosted Ubuntu 24.04.5 LTS, x64, kernel `6.17.0-1022-azure`; runner image `ubuntu-24.04`, image version `20261012.334.1`.
- Node `v24.19.0`; Yarn `1.22.22`; Git `2.55.0`.
- Playwright Core `1.58.2`; Chromium `145.0.7632.6`, headless; viewport 1800 × 1400.
- Workspace Service: `http://127.0.0.1:4312`.
- Library: `http://127.0.0.1:3000/ygocarder/library/`.
- Carder: `http://127.0.0.1:3000/ygocarder/`, opened through the real prepared Workspace intent.
- Disposable Workspace: `deploy-004-combined-validation`, under `/home/runner/work/_temp/deploy004-workspace`; READY, Workspace format 1, database schema 8.
- Run interval: 2026-10-24 02:44:25–02:46:37 America/Mexico_City (`08:44:25Z`–`08:46:37Z`).

Root and Workspace Service dependencies were installed from existing frozen lockfiles; Workspace Service compilation passed. No combined source, dependency manifest or lockfile was edited. All fixture cards, confirmation records and solid-color BS artwork were generated in the disposable Workspace.

## Evidence custody, retrieval and inspection

- [Original behavioral run 40079213445](https://github.com/KhaosMagnus/YU3DOH-Carder/actions/runs/40079213445), job `120829045260`: completed/success.
- [Original artifact 12553963296](https://github.com/KhaosMagnus/YU3DOH-Carder/actions/runs/40079213445/artifacts/12553963296).
- Artifact name: `deploy004-validation-40079213445-64cb5f4ca42348c6c403e64e0d61bdff8c32a281`.
- ZIP size: 17,902,627 bytes.
- GitHub artifact digest: `sha256:d0b7cf8cc1e1a6c3de791d42f253e5489be8c2063dc9332eb2dfca41cf98d773`, also recorded by the original upload step. An independent local ZIP digest is not claimed.
- GitHub retention currently expires `2027-01-22T08:44:25Z`.
- Original artifact manifest: **141 files**.

Local download access to the artifact's storage redirect was denied. An initial redacted retrieval-only run, `40079587186`, completed, but its combined log exceeded the connector transport capacity. The resulting acquisition-only VALIDATION BLOCKED state was temporary.

The Owner explicitly approved smaller retrieval jobs and restricted continuation to retrieval/inspection of the existing run, with no behavioral rerun and transient grants redacted. [Retrieval run 40081520720](https://github.com/KhaosMagnus/YU3DOH-Carder/actions/runs/40081520720), at ops SHA `b4df05521964d97060bd5d1108518a79083afd38`, completed all seven jobs successfully:

| Group | Job ID |
| --- | --- |
| meta | 120835899384 |
| render1 | 120835899414 |
| render2 | 120835899224 |
| render3 | 120835899530 |
| render4 | 120835899541 |
| spellwrite | 120835899394 |
| trapwrite | 120835899359 |

Those jobs only downloaded the existing artifact, verified every one of its 141 manifest entries, and exposed a fixed selection of 54 files for inspection. They did not checkout or run the candidate, start an application, create fixtures, or perform mutations. Workflow path filtering prevented a new behavioral run.

Transient grants and asset URL query grants were redacted in inspection copies. The original evidence artifact remains unchanged. PNGs, text files and the manifest were recovered byte-for-byte and independently matched their original hashes. JSON inspection copies were reformatted and grant-redacted; their original source hashes were checked against the manifest, and the complete original bytes were verified by each retrieval job before redaction. Hashes below refer to original artifact files, not reformatted inspection JSON.

The actual full browser screenshots, four `preview-canvas` exports, acknowledgement captures, result captures and running Library copy screenshot were visually inspected. Each `C-OP-0N-canvas-1.png` is the actual renderer's 813 × 1185 `preview-canvas`; `C-OP-0N-canvases.json` maps its DOM ID and dimensions. No image was reconstructed.

Prepared/working state was observed through the real prepare response and the application's existing `useCard.getState().card` store. The store was not mutated by the harness. Name edits, Save to Workspace and acknowledgement were performed through the actual visible Carder UI. Offline comparisons of the captured files verified the Canonical and working-state deltas; these comparisons did not execute product behavior.

## Common rendering steps

1. Bootstrap the disposable Workspace with the candidate's persistence/service APIs. Create four generated fixtures and confirm STRUCTURE and TEXT:EN; ingest generated solid-color BS artwork.
2. Start the real Workspace Service and Vite; open Library in Chromium.
3. Select the fixture card, enter Variants / Assets, and click Open Standard.
4. Capture the actual prepare-working-card HTTP request/response and prepared DTO; allow the resulting popup to run the normal Carder bridge.
5. Capture working projection, full browser screenshot and actual renderer canvas pixels. Read authoritative Canonical detail through HTTP before and after opening, before any C-OP-05 edit.

## Case results

### CASE C-OP-01 — NORMAL SPELL

**EXPECTED:** Spell frame; top-right SPELL attribute icon; `Spell Card` type line; no circular NORMAL subtype icon; semantic NORMAL retained in prepared/working state and Canonical.

**OBSERVED:** The actual browser screenshot and renderer pixels show the Spell frame, top-right SPELL attribute icon and `Spell Card` type line, with no circular NORMAL subtype icon. The prepare request returned HTTP 200. Prepared DTO: `family:SPELL`, `subtype_code:NORMAL`. Working projection: `frame:spell`, `attribute:SPELL`, `subFamily:NORMAL`, `typeAbility:["Spell Card"]`. Authoritative Canonical before/after is identical, with subtype `NORMAL` and revision `2`.

**SHA:** `64cb5f4ca42348c6c403e64e0d61bdff8c32a281`.

**STEPS:** Common rendering steps 1–5; fixture `DEPLOY004 Normal Spell`, card ID `eeb60b83-c269-456d-bf6f-7bbeefa32f29`.

**EVIDENCE:** `C-OP-01-carder.png`; `C-OP-01-canvas-1.png`; `C-OP-01-canvases.json`; `C-OP-01-prepare.json`; `C-OP-01-working.json`; `C-OP-01-canonical-before.json`; `C-OP-01-canonical-after.json`. All paths are relative to the original artifact root; grant-redacted inspection copies are in the corresponding retrieval job log.

**RESULT:** `SATISFACTORY`.

### CASE C-OP-02 — NORMAL TRAP

**EXPECTED:** Trap frame; top-right TRAP attribute icon; `Trap Card` type line; no circular NORMAL subtype icon; semantic NORMAL retained in prepared/working state and Canonical.

**OBSERVED:** The actual browser screenshot and renderer pixels show the Trap frame, top-right TRAP attribute icon and `Trap Card` type line, with no circular NORMAL subtype icon. The prepare request returned HTTP 200. Prepared DTO: `family:TRAP`, `subtype_code:NORMAL`. Working projection: `frame:trap`, `attribute:TRAP`, `subFamily:NORMAL`, `typeAbility:["Trap Card"]`. Authoritative Canonical before/after is identical, with subtype `NORMAL` and revision `2`.

**SHA:** `64cb5f4ca42348c6c403e64e0d61bdff8c32a281`.

**STEPS:** Common rendering steps 1–5; fixture `DEPLOY004 Normal Trap`, card ID `b57f978e-151e-40ae-aa58-c07ec1a58990`.

**EVIDENCE:** `C-OP-02-carder.png`; `C-OP-02-canvas-1.png`; `C-OP-02-canvases.json`; `C-OP-02-prepare.json`; `C-OP-02-working.json`; `C-OP-02-canonical-before.json`; `C-OP-02-canonical-after.json`. All paths are relative to the original artifact root; grant-redacted inspection copies are in the corresponding retrieval job log.

**RESULT:** `SATISFACTORY`.

### CASE C-OP-03 — FIELD SPELL

**EXPECTED:** Spell rendering intact; Field subtype icon visibly present; Canonical FIELD preserved.

**OBSERVED:** The actual browser screenshot and renderer pixels show the Spell frame, top-right SPELL attribute icon and `Spell Card` type line, with the Field subtype icon visibly present beside the type line. The prepare request returned HTTP 200. Prepared DTO: `family:SPELL`, `subtype_code:FIELD`. Working projection: `frame:spell`, `attribute:SPELL`, `subFamily:FIELD`, `typeAbility:["Spell Card"]`. Authoritative Canonical before/after is identical, with subtype `FIELD` and revision `2`.

**SHA:** `64cb5f4ca42348c6c403e64e0d61bdff8c32a281`.

**STEPS:** Common rendering steps 1–5; fixture `DEPLOY004 Field Spell`, card ID `e7c9d316-b3ea-4b18-95d2-5a57ce72bb6b`.

**EVIDENCE:** `C-OP-03-carder.png`; `C-OP-03-canvas-1.png`; `C-OP-03-canvases.json`; `C-OP-03-prepare.json`; `C-OP-03-working.json`; `C-OP-03-canonical-before.json`; `C-OP-03-canonical-after.json`. All paths are relative to the original artifact root; grant-redacted inspection copies are in the corresponding retrieval job log.

**RESULT:** `SATISFACTORY`.

### CASE C-OP-04 — COUNTER TRAP

**EXPECTED:** Trap rendering intact; Counter subtype icon visibly present; Canonical COUNTER preserved.

**OBSERVED:** The actual browser screenshot and renderer pixels show the Trap frame, top-right TRAP attribute icon and `Trap Card` type line, with the Counter subtype icon visibly present beside the type line. The prepare request returned HTTP 200. Prepared DTO: `family:TRAP`, `subtype_code:COUNTER`. Working projection: `frame:trap`, `attribute:TRAP`, `subFamily:COUNTER`, `typeAbility:["Trap Card"]`. Authoritative Canonical before/after is identical, with subtype `COUNTER` and revision `2`.

**SHA:** `64cb5f4ca42348c6c403e64e0d61bdff8c32a281`.

**STEPS:** Common rendering steps 1–5; fixture `DEPLOY004 Counter Trap`, card ID `8c0e3767-1d62-4715-b8bf-3c387bd1cbfc`.

**EVIDENCE:** `C-OP-04-carder.png`; `C-OP-04-canvas-1.png`; `C-OP-04-canvases.json`; `C-OP-04-prepare.json`; `C-OP-04-working.json`; `C-OP-04-canonical-before.json`; `C-OP-04-canonical-after.json`. All paths are relative to the original artifact root; grant-redacted inspection copies are in the corresponding retrieval job log.

**RESULT:** `SATISFACTORY`.

### CASE C-OP-05 — NORMAL SPELL and NORMAL TRAP text-only write-back

**EXPECTED:** Separately for each family, edit only one supported localized text field through the actual Carder UI. The acknowledgement identifies only TEXT:EN. The actual write-back HTTP response succeeds with `changed_blocks=["TEXT:EN"]`, excluding STRUCTURE. Canonical subtype remains NORMAL; STRUCTURE remains CONFIRMED; TEXT:EN follows the acknowledgement contract; exactly one new CARDER_WRITE_BACK provenance event targets TEXT:EN only; revision increments once; no partial or structural mutation occurs.

**OBSERVED:** Both independent actual UI saves returned HTTP 200. Working-state comparison identifies **only `name`** as changed. Both visible acknowledgement dialogs list only `TEXT:EN`; neither lists STRUCTURE. Each actual POST `/api/v1/carder/write-back` request acknowledges `["TEXT:EN"]` and carries `expected_revision:"2"` and `sub_family:"NORMAL"`. Each actual response reports `changed:true`, `changed_blocks:["TEXT:EN"]`, `moved_to_draft:["TEXT:EN"]`, `previous_revision:"2"`, `revision:"3"`.

Authoritative Canonical comparison confirms unchanged card identity, family, password, structure, classification and relations, and unchanged EN card_text/pendulum_text. Only the EN name and required revision/confirmation/provenance bookkeeping changed. Historical provenance remains intact. Each save adds exactly one BLOCK / TEXT:EN / CARDER_WRITE_BACK event; no STRUCTURE event is added.

| Check | NORMAL SPELL | NORMAL TRAP |
| --- | --- | --- |
| Card ID | `eeb60b83-c269-456d-bf6f-7bbeefa32f29` | `b57f978e-151e-40ae-aa58-c07ec1a58990` |
| EN name before | DEPLOY004 Normal Spell | DEPLOY004 Normal Trap |
| EN name after | DEPLOY004 Normal Spell edited | DEPLOY004 Normal Trap edited |
| Canonical subtype | NORMAL → NORMAL | NORMAL → NORMAL |
| STRUCTURE state | CONFIRMED → CONFIRMED | CONFIRMED → CONFIRMED |
| STRUCTURE provenance link | 1 → 1 | 3 → 3 |
| TEXT:EN state | CONFIRMED → DRAFT | CONFIRMED → DRAFT |
| TEXT:EN confirmation provenance link | 2 → null | 4 → null |
| Revision | 2 → 3 | 2 → 3 |
| New provenance ID | 9 | 10 |
| New provenance target | BLOCK / TEXT:EN | BLOCK / TEXT:EN |
| New provenance source_kind | CARDER_WRITE_BACK | CARDER_WRITE_BACK |

The new write-back provenance is an event on TEXT:EN. It does not become confirmation provenance for a Draft block. The resulting UI shows `Saved · revision 3 · changed blocks: TEXT:EN · moved to DRAFT: TEXT:EN`.

**SHA:** `64cb5f4ca42348c6c403e64e0d61bdff8c32a281`.

**STEPS:** For NORMAL SPELL and NORMAL TRAP independently: preserve authoritative Canonical starting detail; fill only actual Carder `#name` with the original value plus ` edited`; click Save to Workspace; capture Confirm Workspace save; click Acknowledge and Save to Workspace; capture the actual HTTP request and response; capture UI result; GET authoritative Canonical detail after save. No direct HTTP mutation or simulated acknowledgement replaced this flow.

**EVIDENCE:** For each FAMILY = SPELL and TRAP: `C-OP-05-FAMILY-before.json`, `C-OP-05-FAMILY-working-edited.json`, `C-OP-05-FAMILY-ack-visible.txt`, `C-OP-05-FAMILY-ack.png`, `C-OP-05-FAMILY-http.json`, `C-OP-05-FAMILY-after.json`, `C-OP-05-FAMILY-visible-result.txt`, `C-OP-05-FAMILY-result.png`; original `network.json`. The HTTP inspection copies preserve the actual projection, acknowledgement, status and response fields with transient grants redacted.

Actual captured request/response excerpts, with transient grants omitted here:

SPELL:

```json
{
  "method": "POST",
  "endpoint": "/api/v1/carder/write-back",
  "request": {
    "card_id": "eeb60b83-c269-456d-bf6f-7bbeefa32f29",
    "expected_revision": "2",
    "content_language": "EN",
    "projection": {
      "password": "12993000",
      "attribute": "SPELL",
      "star": "6",
      "atk": "",
      "def": "",
      "sub_family": "NORMAL",
      "name": "DEPLOY004 Normal Spell edited",
      "effect": "Operational evidence fixture.",
      "pendulum_effect": "",
      "pendulum_scale_red": "4",
      "pendulum_scale_blue": "4"
    },
    "acknowledge_move_to_draft": [
      "TEXT:EN"
    ]
  },
  "status": 200,
  "response": {
    "card_id": "eeb60b83-c269-456d-bf6f-7bbeefa32f29",
    "changed": true,
    "previous_revision": "2",
    "revision": "3",
    "changed_blocks": [
      "TEXT:EN"
    ],
    "moved_to_draft": [
      "TEXT:EN"
    ]
  }
}
```

TRAP:

```json
{
  "method": "POST",
  "endpoint": "/api/v1/carder/write-back",
  "request": {
    "card_id": "b57f978e-151e-40ae-aa58-c07ec1a58990",
    "expected_revision": "2",
    "content_language": "EN",
    "projection": {
      "password": "12993001",
      "attribute": "TRAP",
      "star": "6",
      "atk": "",
      "def": "",
      "sub_family": "NORMAL",
      "name": "DEPLOY004 Normal Trap edited",
      "effect": "Operational evidence fixture.",
      "pendulum_effect": "",
      "pendulum_scale_red": "4",
      "pendulum_scale_blue": "4"
    },
    "acknowledge_move_to_draft": [
      "TEXT:EN"
    ]
  },
  "status": 200,
  "response": {
    "card_id": "b57f978e-151e-40ae-aa58-c07ec1a58990",
    "changed": true,
    "previous_revision": "2",
    "revision": "3",
    "changed_blocks": [
      "TEXT:EN"
    ],
    "moved_to_draft": [
      "TEXT:EN"
    ]
  }
}
```

**RESULT:** NORMAL SPELL `SATISFACTORY`; NORMAL TRAP `SATISFACTORY`; C-OP-05 `SATISFACTORY`.

### CASE C-OP-06 — Open in Carder running copy

**EXPECTED:** Visible copy describes the prepared/read-only Workspace snapshot and Carder working state, supported edits selectively saved back, and explicit acknowledgement before changed confirmed blocks move to Draft. The obsolete RUN 009 no-write-back statement is absent.

**OBSERVED:** The actual running Library panel visibly displays:

> Prepares a read-only Workspace snapshot and opens Carder working state. Supported Carder edits can be selectively saved back to Workspace; changes to confirmed blocks require explicit acknowledgement before those blocks move to Draft.

The obsolete `Working edits are not saved back to Workspace in RUN 009.` statement is absent from the captured panel text. Open Standard is enabled for the generated BS-only fixture.

**SHA:** `64cb5f4ca42348c6c403e64e0d61bdff8c32a281`.

**STEPS:** Open the running Library, select DEPLOY004 Normal Spell, enter Variants / Assets, inspect and capture the Open in Carder panel before opening Carder.

**EVIDENCE:** `C-OP-06-library-copy.png` (actual browser panel screenshot); `C-OP-06-visible-copy.txt` (complete captured panel text). Both were recovered byte-for-byte and inspected.

**RESULT:** `SATISFACTORY`.

## Original evidence SHA-256 index

These hashes bind the selected inspection sources to the unchanged original artifact. The complete `manifest.sha256` covers all 141 evidence files, including additional renderer layer canvases, `operational-results.json`, `network.json` and runtime logs. JSON redaction/reformatting changes inspection-copy hashes; the listed hashes refer to the verified original bytes.

| Original artifact-relative path | SHA-256 |
| --- | --- |
| `C-OP-01-canonical-after.json` | `d0149c252febd95a6cbe0d4eb6fa4609e329293a350f84db3cb04badcf330c82` |
| `C-OP-01-canonical-before.json` | `d0149c252febd95a6cbe0d4eb6fa4609e329293a350f84db3cb04badcf330c82` |
| `C-OP-01-canvas-1.png` | `759c10be58121d6a08b07d6ef9033d73f2aad43e37933fe7f01f30bd9d9c16c8` |
| `C-OP-01-canvases.json` | `f8ec915c4508081ce6d7774c636dd2a83b9b555ca1f572793a786bde7058048e` |
| `C-OP-01-carder.png` | `2a98dc471a4d6a198411fae06f5608e5c99d3e177c2d1854a4cef6ac9d5a30c2` |
| `C-OP-01-prepare.json` | `6f4aaae6a970cf284d307273a89c1ec02969113c9c4512ce04ede2c6ed548932` |
| `C-OP-01-working.json` | `ac618294e65e5cf2227bc386ab761dc8932309baccd3319f8f5bb1427dce3af1` |
| `C-OP-02-canonical-after.json` | `11d5005b042551911bdea17d1473692808d0cee9da8c3e6a3f74a44c3f2f5ab9` |
| `C-OP-02-canonical-before.json` | `11d5005b042551911bdea17d1473692808d0cee9da8c3e6a3f74a44c3f2f5ab9` |
| `C-OP-02-canvas-1.png` | `2bd87131300a522af25fc5e7ffe0f1d7e6518bdecaa49ac17a3d328ee571cf14` |
| `C-OP-02-canvases.json` | `f8ec915c4508081ce6d7774c636dd2a83b9b555ca1f572793a786bde7058048e` |
| `C-OP-02-carder.png` | `f40f4c088829c51bdd6325489eff9bbaadb910cdf1b5444128286ecbb3a1267a` |
| `C-OP-02-prepare.json` | `0cbea27aa6e53f927939628aa9b2e238a0447094bc6e17435b0bab6541e1792e` |
| `C-OP-02-working.json` | `f27fa8465761fa912afce70352559c4b732e6f762e2405ce8ebd9a71bbb74f8c` |
| `C-OP-03-canonical-after.json` | `74cb625499406ba428d2995b87b1ceb78be4c44e540eac05fadb1008df4cbe90` |
| `C-OP-03-canonical-before.json` | `74cb625499406ba428d2995b87b1ceb78be4c44e540eac05fadb1008df4cbe90` |
| `C-OP-03-canvas-1.png` | `83b26b3bbf9143473ccfd37a613d8c0d00e2c2ff2cd41f54cc3dee880c7c7435` |
| `C-OP-03-canvases.json` | `f8ec915c4508081ce6d7774c636dd2a83b9b555ca1f572793a786bde7058048e` |
| `C-OP-03-carder.png` | `58d7a31b18681861fc95598b165a15eb98e70efedccbac0e7815279b0b14fdc3` |
| `C-OP-03-prepare.json` | `1c1809f875e443685c972ba8c27d9eabac5683968cc5f3171bc1fb7b0f95cb9d` |
| `C-OP-03-working.json` | `357f1a832a17d068a9e6ab3aafb3af19b0a941ae94ab48f18c92fa8c89012022` |
| `C-OP-04-canonical-after.json` | `ebb75042bf23b9de02d137891096356766ded9015d48e131210fd1d200cc2aae` |
| `C-OP-04-canonical-before.json` | `ebb75042bf23b9de02d137891096356766ded9015d48e131210fd1d200cc2aae` |
| `C-OP-04-canvas-1.png` | `656ffd660ddc9260fec5e71c4903514b2517facf8238d463baff7ded2ade4523` |
| `C-OP-04-canvases.json` | `f8ec915c4508081ce6d7774c636dd2a83b9b555ca1f572793a786bde7058048e` |
| `C-OP-04-carder.png` | `e431e9f6558fe08f6e07ef3374ce81b59c9ab4afec45a74c3e7d8fff65611b4e` |
| `C-OP-04-prepare.json` | `c9281c347db466db00c1c4d387c264ec1fbd17e3f2ce37f3031d0816f70f3294` |
| `C-OP-04-working.json` | `f81d0bd141594c273496786cace2443492d96408eae547a7a99264122d19106c` |
| `C-OP-05-SPELL-ack-visible.txt` | `bab409aa5ecd6e3e41260cfe2712b2af8f17737052158e9c56a98fea2d714b31` |
| `C-OP-05-SPELL-ack.png` | `dba96ae2b52c5b226f60fdb99881aaa6c0bd08b124703ac7a884feb9a66b574c` |
| `C-OP-05-SPELL-after.json` | `77a29e7ad9d177beaa836001aa5e0a34d3eb933ea3776049307e3db71c744ddc` |
| `C-OP-05-SPELL-before.json` | `d0149c252febd95a6cbe0d4eb6fa4609e329293a350f84db3cb04badcf330c82` |
| `C-OP-05-SPELL-http.json` | `a3dd3269fcb5459488ad4b9873ea62ff3db4d8af722e5fefb1ddfda3447b2c47` |
| `C-OP-05-SPELL-result.png` | `ef8bae4053903b47d61fe3c5e5229ebe7630b0bda69de2580215cf06a3feb1a6` |
| `C-OP-05-SPELL-visible-result.txt` | `03b203c29eff8643caf00a5e92f6ce573ae3d78a8ef97678eb6443afc5698904` |
| `C-OP-05-SPELL-working-edited.json` | `94a711e25493873cd60db865ac46111ad231c3d4b1f49ed7c22473e5a6146ca5` |
| `C-OP-05-TRAP-ack-visible.txt` | `bab409aa5ecd6e3e41260cfe2712b2af8f17737052158e9c56a98fea2d714b31` |
| `C-OP-05-TRAP-ack.png` | `0b70d17c649f702664b161d848063e5572d8489b5ebd530a0bc99a6d99773072` |
| `C-OP-05-TRAP-after.json` | `ad7e217b00748e12eec906458dfd257fcfed15cffe67aeea582001f20f9eb4b6` |
| `C-OP-05-TRAP-before.json` | `11d5005b042551911bdea17d1473692808d0cee9da8c3e6a3f74a44c3f2f5ab9` |
| `C-OP-05-TRAP-http.json` | `32205dbdd64fd6a84791a33bb47629f72f67cc5066f773ffdc3c7e432e7737c6` |
| `C-OP-05-TRAP-result.png` | `850e92d4cbd83dc10935f5d3bf7f44a5977b4d723e11bac45bbb15c6287bbee0` |
| `C-OP-05-TRAP-visible-result.txt` | `03b203c29eff8643caf00a5e92f6ce573ae3d78a8ef97678eb6443afc5698904` |
| `C-OP-05-TRAP-working-edited.json` | `db90328fbf77134006cde234931cd197987a02e5c6ced88ea75c42b620018f11` |
| `C-OP-06-library-copy.png` | `74377d26f9a35f73cbd76d46ccc221a3ac6e01cbbcf48136afe861e41376f5e4` |
| `C-OP-06-visible-copy.txt` | `8da65971959daf911b1c445354f09c203f7e75fc53f5ff655abbc0b839a4ef42` |
| `browser.json` | `0992b32c1e4762c70c303c74a14243da13417a7577ba22c84815fa9be6788055` |
| `environment.json` | `10f90249ffd28d2c6951132cfcca751b2bcff732f2e42974838c508917345a11` |
| `execution-status.json` | `af609915d78d04e4616e7bbeb88cded0f26eb1c1f706e6045fc6c50f07b9a00e` |
| `fixtures.json` | `6526dad974fe6c703b10776518aa37a717dcdb6335cd86b8dbf9eacde3243328` |
| `git-final.json` | `72398d6a18dbb7c5e3a05eeeb58fe48f248c699ef6fd1bd5b3699d5ee0bc4cd9` |
| `git-preflight.json` | `708df1fbf8b1d9da5435c9ef0d8930b303c4e83df6d1e8bc3eeadf6be5ccc2af` |
| `manifest.sha256` | `a38493fc90f414a25f9200c78b11ee00eea99bbef2a26c5247f10ca82b70b901` |
| `workspace-status.json` | `5e6d2f8993b594e92165f8500515c0286821745de4781d1af05fbe5a372a6f53` |

## Boundaries and authorized return

Final operational status: **EVIDENCE READY**.

Cases C-OP-01..C-OP-06: **6 executed; 6 SATISFACTORY; 0 UNSATISFACTORY**. The previous acquisition-only blocker is resolved.

Candidate B's accepted exact-combined-SHA A–J disposition is not changed by this evidence. No Candidate B matrix or other behavioral suite was rerun. No candidate source was edited, no integration was performed, and no RUN 024 was created.

Protected refs remain:

| Ref | SHA |
| --- | --- |
| Combined candidate | `64cb5f4ca42348c6c403e64e0d61bdff8c32a281` |
| Candidate A | `61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c` |
| Candidate B | `59fb2924b2240f005fb3e9e6d5afbd8aaca39596` |
| feature/workspace-v0.1 | `4c9b0228bb47ac074c49a977b48dbf0844c33a94` |
| main | `54cc3aad246c89a29f2a18be63c539db68cae041` |

The original `validations/P5-CANDIDATE-A-001/DEPLOY-003_VALIDATION_EVIDENCE.md` remains unchanged, Git blob `eada04d948c1f1a9138d814f440d87fd2712060a`. It belongs permanently to original Candidate A validation; this report does not supersede or rewrite it.

Next target: **DESIGN_QA / DQA-001**, to inspect this new combined exact-SHA evidence and issue the superseding final combined QA disposition. Any authority or publication conflict routes to **PROJECT_CONTROL / PC-001**. Combined integration, feature/workspace-v0.1 movement, main movement and RUN 024 remain NOT AUTHORIZED.
