---
artifact_id: P5-CANDIDATE-A-001-DEPLOY-002
artifact_type: validation_evidence
status: REVIEW
protocol_version: "1.0"
source_role: DEPLOYMENT_VALIDATION
source_instance: DEPLOY-002
target_role: DESIGN_QA
target_instance: DQA-001
control_parent_sha: b8060a8f1bd2e0f42387f9591749f8018ffebfc2
code_baseline:
  branch: fix/workspace-rc-normal-subtype-icon
  sha: 61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c
related_requests:
  - CR-0001.1
  - CR-0001.5
source_artifacts:
  - routing/ROUTE-P5-CANDIDATE-A-DEPLOY-002.md
  - validations/P5-CANDIDATE-A-001/EVIDENCE_REQUEST.md
  - validations/P5-CANDIDATE-A-001/DEPLOYMENT_VALIDATION_EVIDENCE.md
  - validations/P5-CANDIDATE-A-001/DESIGN_QA_BLOCKER_REVIEW.md
supersedes: null
created_at: "2026-10-24T06:11:03Z"
operational_status: VALIDATION BLOCKED
cases_executed: 0
---

# VALIDATION EVIDENCE REPORT — CANDIDATE A / DEPLOY-002

## 1. Disposition

**FINAL OPERATIONAL STATUS: VALIDATION BLOCKED.**

DEPLOY-002 read completely the eight required Control documents at the exact assigned CONTROL SHA and independently checked current GitHub branch heads. The execution runtime made available to this instance is **not an independently reprovisioned candidate-capable environment**. It exhibits the same critical environment restrictions documented by DEPLOY-001: no candidate checkout including `.git`, no reachable GitHub hostname for cloning, no Yarn binary on PATH, and no running Workspace Service/Library/Carder at the checked local endpoints.

Because the mandatory local exact-SHA HEAD and clean-tree proofs cannot be established, all six frozen cases were **stopped before behavior execution**. This report does not claim that Candidate A passed or failed any case. It is not a product-defect or regression finding. DQA-001's previous official **PARTIAL** disposition remains unchanged.

No screenshots, API request/response captures, Canonical before/after details or provenance observations were obtained. Repeating static code inspection or substituting a mock or a previous-SHA environment would not satisfy the evidence request.

## 2. Control and code identity

Source of truth: authenticated GitHub repository `KhaosMagnus/YU3DOH-Carder`.

| Ref | Remote GitHub SHA verified immediately before publication |
| --- | --- |
| `meta/project-control` | `b8060a8f1bd2e0f42387f9591749f8018ffebfc2` |
| `fix/workspace-rc-normal-subtype-icon` | `61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c` |

Required eight files read from Control commit `b8060a8f1bd2e0f42387f9591749f8018ffebfc2`:

1. `PROJECT_STATE.md`
2. `routing/ROUTE-P5-CANDIDATE-A-DEPLOY-002.md`
3. `validations/P5-CANDIDATE-A-001/EVIDENCE_REQUEST.md`
4. `validations/P5-CANDIDATE-A-001/DEPLOYMENT_VALIDATION_EVIDENCE.md`
5. `validations/P5-CANDIDATE-A-001/DESIGN_QA_BLOCKER_REVIEW.md`
6. `chats/instances/DEPLOY-002.md`
7. `roles/DEPLOYMENT_VALIDATION.md`
8. `protocols/COMMUNICATION_PROTOCOL.md`

These remote SHA checks **do not** replace the frozen local preflight.

## 3. Actual execution environment and mandatory preflight

Inspection at `2026-10-24T06:11:03Z`.

| Property | Observation |
| --- | --- |
| OS | Debian GNU/Linux 13 (trixie), Linux kernel `6.18.55`, x86_64 |
| Git | `2.47.3` |
| Node | `v22.16.0` |
| Yarn | Not on PATH |
| Browser | Chromium `144.0.7559.96` (Debian 13); executable exists, not run against Candidate A |
| Candidate source | No candidate checkout mounted at `/mnt/data`; no accessible checkout found in inspected available working areas |
| `git -C /mnt/data rev-parse HEAD` | `fatal: not a git repository (or any of the parent directories): .git` |
| `git -C /mnt/data status --porcelain` | `fatal: not a git repository (or any of the parent directories): .git` |
| `git ls-remote https://github.com/KhaosMagnus/YU3DOH-Carder.git refs/heads/fix/workspace-rc-normal-subtype-icon` | `fatal: unable to access ... Could not resolve host: github.com` |
| DNS | `getent ahostsv4 github.com` produced no address |
| Local Carder | No service answering at `http://127.0.0.1:3000/` |
| Local Workspace Service | No service answering at `http://127.0.0.1:4312/` |
| Disposable Workspace | Not created: exact-SHA prerequisite failed |
| Screenshots | None |
| Write-back request/response | None |
| Canonical/provenance before/after | None |

A GitHub repository content connector was available for authoritative remote reads and publication, but does **not** expose a live user-host checkout, an executable application deployment, or a binary source archive usable as a complete checkout. There is no available remote compute/browser action with which to run Candidate A. Consequently, no valid `git rev-parse HEAD` or clean `git status --porcelain` proof could be produced.

**Preflight result: FAILED / ENVIRONMENT-EXECUTION ACCESS.** Behavioral testing was not started.

## 4. Frozen case execution records

The following entries preserve the normative test expectations; they are **not case verdicts**. The required `SATISFACTORY` / `UNSATISFACTORY` taxonomy is applicable only once a case has actually been run and observed. Assigning either now would invent evidence.

### A-OP-01

**CASE:** NORMAL SPELL rendering.  
**EXPECTED:** Workspace Canonical SPELL, `subtype_code:NORMAL`, opens through Workspace → Carder as Spell frame; top-right SPELL attribute/icon present; type line `Spell Card`; no circular NORMAL subtype icon; Canonical remains NORMAL.  
**OBSERVED:** No Carder runtime execution; no rendered card or Canonical observation.  
**SHA:** Required `61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c`, confirmed remotely only.  
**STEPS:** Stopped at failed exact-SHA local preflight, before fixture preparation/open.  
**EVIDENCE:** No screenshot, prepared projection or Canonical before/after.  
**RESULT:** NOT EXECUTED — VALIDATION BLOCKED (no individual behavioral verdict).

### A-OP-02

**CASE:** NORMAL TRAP rendering.  
**EXPECTED:** Canonical TRAP, `subtype_code:NORMAL`, opens as Trap frame; top-right TRAP attribute/icon present; `Trap Card` type line; no circular NORMAL subtype icon; Canonical remains NORMAL.  
**OBSERVED:** No Carder runtime execution; no rendered card or Canonical observation.  
**SHA:** Required `61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c`, confirmed remotely only.  
**STEPS:** Stopped at failed local exact-SHA preflight.  
**EVIDENCE:** No screenshot, projection or Canonical before/after.  
**RESULT:** NOT EXECUTED — VALIDATION BLOCKED.

### A-OP-03

**CASE:** FIELD SPELL icon preservation.  
**EXPECTED:** Canonical SPELL with `subtype_code:FIELD` renders as Spell with Field subtype icon visibly present; Canonical remains FIELD.  
**OBSERVED:** No runtime fixture or renderer execution.  
**SHA:** Required `61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c`, confirmed remotely only.  
**STEPS:** Stopped before preparing the FIELD fixture.  
**EVIDENCE:** No screenshot, prepared state or Canonical detail.  
**RESULT:** NOT EXECUTED — VALIDATION BLOCKED.

### A-OP-04

**CASE:** COUNTER TRAP icon preservation.  
**EXPECTED:** Canonical TRAP with `subtype_code:COUNTER` renders as Trap with visible Counter subtype icon; Canonical remains COUNTER.  
**OBSERVED:** No runtime fixture or renderer execution.  
**SHA:** Required `61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c`, confirmed remotely only.  
**STEPS:** Stopped before preparing the COUNTER fixture.  
**EVIDENCE:** No screenshot, prepared state or Canonical detail.  
**RESULT:** NOT EXECUTED — VALIDATION BLOCKED.

### A-OP-05

**CASE:** NORMAL SPELL and NORMAL TRAP text-only Carder write-back, each separately.  
**EXPECTED:** Each starts at `subtype_code:NORMAL`, captured STRUCTURE/TEXT confirmation states and revision; one localized text field edited and acknowledged; only corresponding TEXT block changes; STRUCTURE remains unchanged and does not move to Draft solely for that edit; NORMAL preserved; TEXT confirmation transition, `CARDER_WRITE_BACK` provenance target and revision behavior conform to existing contract.  
**OBSERVED:** Neither of the two write-back paths executed; no state mutation was attempted.  
**SHA:** Required `61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c`, confirmed remotely only.  
**STEPS:** Stopped before disposable Workspace creation, Canonical setup or write-back.  
**EVIDENCE:** No captured request/response, confirmation history, revision, Canonical or provenance before/after for SPELL or TRAP.  
**RESULT:** NOT EXECUTED — VALIDATION BLOCKED (both variants).

### A-OP-06

**CASE:** Open in Carder copy.  
**EXPECTED:** Visible running Library UI explains Workspace snapshot/prepare/open, selectively supported write-back, explicit acknowledgment before confirmed changed blocks become Draft; obsolete `Working edits are not saved back to Workspace in RUN 009.` not displayed.  
**OBSERVED:** No running exact-SHA Library panel was opened or captured.  
**SHA:** Required `61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c`, confirmed remotely only.  
**STEPS:** Stopped before launching Library due to failed preflight.  
**EVIDENCE:** No actual running UI screenshot or visible-UI transcript.  
**RESULT:** NOT EXECUTED — VALIDATION BLOCKED.

## 5. Diagnosis, next route, invariants

**Root operational blocker:** this DEPLOY-002 session was not supplied with the requested independent execution-capable environment. GitHub source/control access succeeded, but a genuine checkout and running application are unavailable. This repeats the *class* of DEPLOY-001's blocker; it is explicitly not a newly observed product fault.

**Required reprovision by PROJECT_CONTROL:** assign an operational executor with clone/checkout access to the exact Candidate A commit, clean `.git` working tree, dependencies, actual browser, isolated Workspace, Workspace Service + Library + Carder, screenshot capture, write-back HTTP request/response capture and authoritative Canonical/provenance views. Only after recording the local HEAD and clean `git status --porcelain` should it execute the existing frozen six cases. No new code implementation is indicated by this blocked attempt.

**Prohibited actions preserved:** no candidate code edits, no code commits, no changes to Candidate A SHA, no migration changes, no Candidate B tests or combination, no merges or movement of `main` / `feature/workspace-v0.1`, no RUN 024 and no owner-manual testing request. Only this new Control-plane evidence document is published; prior QA/Deployment artifacts remain untouched.

## 6. Return

```text
VALIDATION EVIDENCE REPORT — DEPLOY-002
Candidate: fix/workspace-rc-normal-subtype-icon @ 61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c
Frozen cases: A-OP-01 through A-OP-06
Cases actually executed: 0/6
Individual verdicts: NONE (not evaluable)
Operational status: VALIDATION BLOCKED
Blocker class: ENVIRONMENT / EXECUTION ACCESS
Product defect: NOT ESTABLISHED
Regression: NOT ESTABLISHED
External Design + QA disposition: PARTIAL / UNCHANGED
Primary blocker route: PROJECT_CONTROL (independent environment still required)
Review recipient: DESIGN_QA / DQA-001
```
