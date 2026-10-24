---
artifact_id: P5-CANDIDATE-A-001-DEPLOY-001
artifact_type: validation_evidence
status: REVIEW
protocol_version: "1.0"
source_role: DEPLOYMENT_VALIDATION
source_instance: DEPLOY-001
target_role: DESIGN_QA
target_instance: DQA-001
control_parent_sha: f15c40e96321083125ed2bebf3a08c17ef8580de
code_baseline:
  branch: fix/workspace-rc-normal-subtype-icon
  sha: 61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c
related_requests:
  - CR-0001.1
  - CR-0001.5
source_artifacts:
  - routing/ROUTE-P5-CANDIDATE-A-DEPLOY-001.md
  - validations/P5-CANDIDATE-A-001/EVIDENCE_REQUEST.md
  - validations/P5-CANDIDATE-A-001/DESIGN_QA_REPORT.md
supersedes: null
created_at: "2026-10-24T05:55:54.859Z"
approved_at: null
operational_status: VALIDATION BLOCKED
---

# DEPLOYMENT VALIDATION EVIDENCE — P5 CANDIDATE A / DEPLOY-001

## 1. Operational disposition

**FINAL OPERATIONAL STATUS: `VALIDATION BLOCKED`.**

The frozen request requires independent real-browser visual evidence of the actual Workspace → Carder renderer and transactional write-back on exact candidate `61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c`. That evidence could **not** be executed reliably from the available execution environment. **No A-OP-01 through A-OP-06 case was run.** No individual case is rated `SATISFACTORY` or `UNSATISFACTORY`, because both terms require observed runtime behavior. This is an **execution/access blocker**, not evidence of a defect, regression or behavioral failure in Candidate A.

This is not an official Design + QA disposition. The previous DQA-001 candidate result remains **PARTIAL**, with the independent operational gate unfulfilled. This artifact does not supersede the QA report or alter the frozen evidence request.

## 2. Source-of-truth verification

| Reference | Source | Verified exact SHA |
| --- | --- | --- |
| CONTROL | GitHub branch `meta/project-control` | `f15c40e96321083125ed2bebf3a08c17ef8580de` |
| Candidate A | GitHub branch `fix/workspace-rc-normal-subtype-icon` | `61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c` |

Both GitHub branch heads matched the route at the start of this attempt. GitHub was used to read completely the six required documents on CONTROL SHA `f15c40e96321083125ed2bebf3a08c17ef8580de`: `PROJECT_STATE.md`, the route, the DQA report, the frozen evidence request, `chats/instances/DEPLOY-001.md`, and `roles/DEPLOYMENT_VALIDATION.md`.

Exact GitHub candidate source was additionally read (not executed):

- `src/draw/predefined-section/type-ability.ts`: includes `shouldDrawTypeAbilityIcon`, which suppresses drawing for semantic NORMAL on a nonmonster large Spell/Trap type line. This is a **static observation**, not a rendered screenshot.
- `src/library/open-in-carder.tsx`: includes the updated panel text describing the read-only prepared snapshot, selective write-back and explicit acknowledgment. This is a **static observation**, not visible exact-SHA UI evidence.

The QA report had already assessed these source-level properties; they are **not** counted as newly collected A-OP execution evidence.

### Required local preflight — blocked

The frozen request requires a local checkout on branch `fix/workspace-rc-normal-subtype-icon`, HEAD exactly `61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c`, with clean working tree, plus exact OS, Node, Yarn, browser and running URLs. Only the **remote GitHub HEAD** was established. There is no exact candidate checkout or running Workspace Service/Carder accessible in the execution environment.

| Environment property | Observed |
| --- | --- |
| Available isolated runtime | Linux x86_64, kernel `6.18.55` |
| Git | `2.47.3` |
| Node.js | `v22.16.0` |
| Yarn | Not installed / not on PATH |
| Chromium | `144.0.7559.96`, Debian 13 build |
| Candidate checkout | Not present in mounted workspace; local Git HEAD/working-tree cleanliness therefore unverified |
| Git fetch test | `git ls-remote https://github.com/KhaosMagnus/YU3DOH-Carder.git refs/heads/fix/workspace-rc-normal-subtype-icon` returned `fatal: unable to access ... Could not resolve host: github.com` (exit 128) |
| Workspace Service URL | No running exact-candidate service reachable from this environment |
| Carder / Library URLs | No running exact-candidate UI reachable from this environment |
| Disposable Workspace/fixtures | Not initialized, since the candidate could not be materialized and run |
| Browser screenshot / write-back API capture | None collected for this candidate |

The historical owner-local Windows environment at `D:\Local\YU3DOH-Workspace-RC-v0.1` pertains to a **different SHA** (`4c9b0228...`) and is outside this execution environment. It was neither accessed nor used as a substitute. Per the frozen request, the owner was **not** asked to perform new manual tests.

## 3. Bounded case records

The following six case records preserve the frozen EXPECTED and the factual execution blocker. **No behavioral OBSERVED exists** for the exact candidate, therefore the individual SATISFACTORY/UNSATISFACTORY taxonomy is not applied.

### A-OP-01 — NORMAL SPELL rendering

**CASE:** A-OP-01  
**EXPECTED:** Workspace Canonical SPELL `subtype_code:NORMAL` opens as Spell frame, SPELL attribute/top-right icon intact, `Spell Card` type line, **no circular NORMAL subtype icon**; Canonical remains NORMAL.  
**OBSERVED:** No exact-SHA browser/session/render execution; expected result not verified.  
**SHA:** `61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c` (remote candidate confirmed; local execution not established).  
**STEPS:** Inspected exact GitHub source and runtime availability; exact checkout unavailable; stopped before preparing fixture/opening Carder.  
**EVIDENCE:** GitHub branch SHA and static renderer predicate; **no** screenshot, prepared/working projection or Canonical before/after detail.  
**RESULT:** **NOT EVALUABLE — VALIDATION BLOCKED** (not a SATISFACTORY/UNSATISFACTORY verdict).

### A-OP-02 — NORMAL TRAP rendering

**CASE:** A-OP-02  
**EXPECTED:** Workspace Canonical TRAP `subtype_code:NORMAL` opens as Trap frame, TRAP attribute/top-right icon intact, `Trap Card` type line, **no circular NORMAL subtype icon**; Canonical remains NORMAL.  
**OBSERVED:** No exact-SHA browser/session/render execution; expected result not verified.  
**SHA:** `61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c` (remote verified only).  
**STEPS:** Checked candidate and absence of executable local checkout; stopped before setup.  
**EVIDENCE:** GitHub source inspection only; **no** rendered screenshot, projection or before/after Canonical detail.  
**RESULT:** **NOT EVALUABLE — VALIDATION BLOCKED**.

### A-OP-03 — non-NORMAL SPELL icon preservation

**CASE:** A-OP-03  
**EXPECTED:** Canonical SPELL `subtype_code:FIELD` opens in Carder with Spell rendering, visible Field subtype icon; Canonical subtype remains FIELD.  
**OBSERVED:** No runtime FIELD fixture or rendering executed.  
**SHA:** `61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c` (remote verified only).  
**STEPS:** Environment preflight failed before fixture creation.  
**EVIDENCE:** No screenshot, prepared/working state or authoritative Canonical state captured.  
**RESULT:** **NOT EVALUABLE — VALIDATION BLOCKED**.

### A-OP-04 — non-NORMAL TRAP icon preservation

**CASE:** A-OP-04  
**EXPECTED:** Canonical TRAP `subtype_code:COUNTER` opens with Trap frame, visible Counter subtype icon, Canonical subtype remains COUNTER.  
**OBSERVED:** No runtime COUNTER fixture or rendering executed.  
**SHA:** `61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c` (remote verified only).  
**STEPS:** Environment preflight failed before fixture creation.  
**EVIDENCE:** No screenshot, prepared/working state or authoritative Canonical state captured.  
**RESULT:** **NOT EVALUABLE — VALIDATION BLOCKED**.

### A-OP-05 — NORMAL text-only Carder write-back

**CASE:** A-OP-05 (SPELL and TRAP independently, both unexecuted).  
**EXPECTED:** Starting Canonical NORMAL subtype, STRUCTURE/TEXT confirmation state and initial revision captured for each; change one localized text field per card; perform acknowledged write-back; only corresponding TEXT block changes, STRUCTURE stays unchanged/not moved to Draft, Canonical NORMAL preserved, TEXT transition and `CARDER_WRITE_BACK` provenance correct; revision increments according to contract.  
**OBSERVED:** No exact-candidate prepared session, mutation, acknowledgment, API request/response, Canonical reload or provenance capture was executed for either family.  
**SHA:** `61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c` (remote verified only).  
**STEPS:** Did not initiate write operations without verified exact-SHA checkout and disposable service.  
**EVIDENCE:** No machine-readable API capture or authoritative before/after states for SPELL or TRAP. Historical previous-SHA write-back evidence was **not** reused.  
**RESULT:** **NOT EVALUABLE — VALIDATION BLOCKED** for both SPELL and TRAP.

### A-OP-06 — Open in Carder copy

**CASE:** A-OP-06  
**EXPECTED:** Running Library panel visibly explains Workspace prepare/read-only snapshot, selectively saving supported Carder edits back to Workspace, explicit acknowledgement before changed confirmed blocks move to Draft, and omits `Working edits are not saved back to Workspace in RUN 009.`  
**OBSERVED:** Source-level updated copy confirmed by exact GitHub read, but the running UI was not launched; **visible** text not observed.  
**SHA:** `61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c` (remote verified; source read).  
**STEPS:** Fetched `src/library/open-in-carder.tsx` from exact SHA; attempted to establish runtime; no checkout or reachable browser session.  
**EVIDENCE:** Exact-SHA source lines, **no running UI screenshot or captured visible UI text**.  
**RESULT:** **NOT EVALUABLE — VALIDATION BLOCKED**.

## 4. Blocker diagnosis and safe resumption

**Root blocker:** the available isolated runtime cannot materialize or execute the exact candidate. The container lacks the repository working tree, the required pinned dependency installation/Yarn environment and a reachable local Workspace/Library/Carder application. The direct Git fetch attempt failed at DNS resolution. GitHub connector can verify refs and read repository text but does **not** provide a live execution/browse session of the user's Windows host; evaluating a constructed mock renderer would not satisfy the frozen operational gate.

**Consequences:** no full `working tree: clean` preflight; no reproducible exact-SHA fixture; no independent screenshot; no actual write-back request/response; thus none of A-OP-01..06 can be graded honestly.

**Safe recovery route:** PROJECT_CONTROL must arrange an independent operational environment with authorized exact-SHA checkout, dependencies, browser capture and a disposable Workspace, or a new evidence request accepting deterministically captured browser/HTTP artifacts with independently verifiable provenance. DQA-001 determines sufficiency. Do **not** request owner-manual repetitions and do **not** reuse evidence from the previous RC SHA. This is an environment/evidence transport request, not a request to modify the candidate.

## 5. Scope preservation and non-actions

- Candidate B `59fb2924b2240f005fb3e9e6d5afbd8aaca39596` remains out of scope and was not tested; its independently reported PASS is not re-evaluated.
- No code modifications or code-branch commits.
- No changes to `main`, `feature/workspace-v0.1`, any fix/RUN branch.
- No merges, ref integrations, migration changes or RUN 024.
- No modifications to `DESIGN_QA_REPORT.md` or `EVIDENCE_REQUEST.md`.
- No earlier RC tests repeated; no owner-manual testing requested.
- No official DQA PASS/FAIL, defect/regression classification, release approval or integration authorization emitted.

## 6. Return

```text
VALIDATION EVIDENCE REPORT
Artifact: P5-CANDIDATE-A-001-DEPLOY-001
Candidate: fix/workspace-rc-normal-subtype-icon @ 61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c
Cases: A-OP-01 .. A-OP-06
Cases executed: 0
Independent rendered screenshots: 0
Independent write-back API captures: 0
Final operational status: VALIDATION BLOCKED
Reason: exact-candidate execution environment unavailable; cannot satisfy local preflight
Next target: DESIGN_QA / DQA-001
Blocker route: PROJECT_CONTROL
Official QA result: UNCHANGED / PARTIAL (pending independent operational evidence)
```
