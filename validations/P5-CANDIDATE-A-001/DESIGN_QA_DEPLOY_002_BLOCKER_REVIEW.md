---
artifact_id: P5-CANDIDATE-A-001-DESIGN-QA-DEPLOY-002-BLOCKER-REVIEW
artifact_type: design_qa_review
status: VALIDATED
protocol_version: "1.0"
source_role: DESIGN_QA
source_instance: DQA-001
target_role: PROJECT_CONTROL
target_instance: PC-001
control_parent_sha: 18bae0692506e637bc6d4b6ea4832561843f0b5b
code_baseline:
  branch: fix/workspace-rc-normal-subtype-icon
  sha: 61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c
related_requests:
  - CR-0001.1
  - CR-0001.5
source_artifacts:
  - validations/P5-CANDIDATE-A-001/DEPLOY-002_VALIDATION_EVIDENCE.md
  - validations/P5-CANDIDATE-A-001/DEPLOYMENT_VALIDATION_EVIDENCE.md
  - validations/P5-CANDIDATE-A-001/DESIGN_QA_BLOCKER_REVIEW.md
  - validations/P5-CANDIDATE-A-001/EVIDENCE_REQUEST.md
  - PROJECT_STATE.md
supersedes: null
official_candidate_disposition: PARTIAL
deploy_002_status: VALIDATION BLOCKED
deploy_002_cases_executed: 0
blocker_classification: ENVIRONMENT_EXECUTION_ACCESS
decision: REPROVISION_MATERIALLY_DIFFERENT_EXECUTION_SUBSTRATE
---

# DESIGN + QA CLASSIFICATION — DEPLOY-002 BLOCKER RETURN

## 1. Official classification

**DEPLOY-002 VALIDATION BLOCKED: ACCEPTED.**

The second Deployment attempt did not establish the mandatory exact-candidate local checkout/HEAD/clean working tree and did not launch the actual Candidate A application. Consequently, A-OP-01 through A-OP-06 remain **0/6 executed** and there is no independent rendered, write-back, Canonical, or provenance evidence. No individual `SATISFACTORY` or `UNSATISFACTORY` determination is possible without execution.

**Blocker class: `ENVIRONMENT / EXECUTION ACCESS` — repeated.** This is a limitation of the available execution substrate, not a product failure or regression. No such failure or regression has been observed.

Candidate A external QA remains **`PARTIAL`**, exact source SHA `61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c`. This assessment does not change the product correction, frozen requirements or prior QA authority.

## 2. Source verification

All four requested documents were read completely from GitHub at `meta/project-control @ 18bae0692506e637bc6d4b6ea4832561843f0b5b`:

- `validations/P5-CANDIDATE-A-001/DEPLOY-002_VALIDATION_EVIDENCE.md`
- `validations/P5-CANDIDATE-A-001/DESIGN_QA_BLOCKER_REVIEW.md`
- `validations/P5-CANDIDATE-A-001/EVIDENCE_REQUEST.md`
- `PROJECT_STATE.md`

GitHub ref verification at review:

- `meta/project-control` = `18bae0692506e637bc6d4b6ea4832561843f0b5b`;
- `fix/workspace-rc-normal-subtype-icon` = `61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c`;
- `feature/workspace-v0.1` = `4c9b0228bb47ac074c49a977b48dbf0844c33a94`.

Remote source identity does not establish the separate mandatory runtime preflight.

## 3. Diagnosis and impact

DEPLOY-002 reproduced DEPLOY-001's execution-access **blocker class**:

- No true local checkout containing `.git` for Candidate A;
- `git rev-parse HEAD` cannot prove required SHA;
- `git status --porcelain` cannot prove a clean working tree;
- GitHub DNS failed from the proposed isolated execution runtime;
- Yarn was not on PATH;
- no exact-SHA Workspace Service, Library, Carder, disposable Workspace, screenshots or actual write-back API captures.

The two reports do **not** constitute two independent product executions. Reassigning the same mission to another chat on the same restricted substrate is unlikely to improve evidence acquisition, irrespective of instance identity.

Consequence: the operational gate remains unsatisfied; this does **not** justify Development re-entry, rollback or integration.

## 4. Evidentiary decision

**Decision: Option 1 — the frozen six-case independent operational requirement remains mandatory, and Project Control must provision a materially different, executable substrate.**

Option 2 is valid **only as a change in collection/transport mechanism, not as weaker evidence**: an authorized external runner may capture the real application and transfer the original screenshot/HTTP/Canonical/provenance evidence for independent DQA review. A temporary harness is permitted **outside** the tracked Candidate A working tree, provided it drives the real exact-SHA Workspace/Library/Carder code and never mocks renderer or write-back.

Evidence is not satisfied by:

- GitHub source inspection or static predicates;
- the existing generic CI/workflow outputs or RUN017 browser harness without the six frozen cases;
- GitHub remote SHA alone without actual local HEAD/clean-tree proof;
- manually synthesized screenshots or mock APIs;
- an earlier source SHA or a different runtime whose source identity cannot be verified;
- screenshots alone for the A-OP-05 persistence/confirmation assertions.

An existing **independently captured** exact-SHA corpus could be considered without rerunning only if it demonstrably covers *every* frozen A-OP expectation, exact-candidate checkout/clean-tree provenance, real browser screenshots and complete authoritative write-back/Canonical/provenance evidence. **No such corpus has been identified in the two Deployment returns.** The frozen contract is not amended.

## 5. Mandatory substrate acceptance gate — before any DEPLOY-003 routing

**Do not create a third Deployment chat/instance before Project Control verifies an actually different execution substrate.** The new platform must support independent command execution with a persistent working directory and artifact collection. A dedicated isolated VM or an authorized CI runner with a real execution job is appropriate. This must be a runtime, **not merely a GitHub content connector or another isolated chat/container with blocked DNS**.

A proposed runner is ACCEPTABLE FOR ROUTING only after an environment-readiness operator demonstrates and records all of the following, without executing A-OP behavior cases:

### A. Code custody and preflight

1. Real filesystem-based Git checkout of `KhaosMagnus/YU3DOH-Carder` with `.git` present and repository access authorized.
2. Outbound GitHub DNS/authentication and clone/fetch access, **or** a proven authenticated/mirrored Git object transfer that reconstructs the same exact checkout with Git history and provenance.
3. Local checked-out `fix/workspace-rc-normal-subtype-icon` resolved to `61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c`; capture actual `git rev-parse --abbrev-ref HEAD`, `git rev-parse HEAD` and empty `git status --porcelain` before any behavioral test.
4. Record the remote branch SHA and pin validation to the **commit SHA**, not a mutable ref. If the branch or local HEAD differs, halt and route the discrepancy; do not silently validate another version.
5. Candidate tracked bytes and working tree remain unchanged; working tree must still be clean after evidence capture. Harness, fixture DB, captured data, screenshots and logs live outside the tracked tree. Do not commit into Candidate A.

### B. Executable application

6. Record OS, Node version, Yarn version, dependency/lockfile install resolution, browser executable/version, and any nonsecret environment configuration needed for replay.
7. Confirm actual installed Node/Yarn dependencies needed by this exact source. Use the repository's supported toolchain and immutable lockfile; do not change dependencies or tracked manifests to force an execution.
8. Launch the real Workspace Service, Library and Carder from that exact checkout; capture health/startup logs and the actual listening service/UI URLs.
9. Establish a disposable, isolated Workspace with known Canonical fixtures and with no owner real data. Database schema/migrations must be those of the exact candidate, without modifications.
10. Confirm real Chromium (or supported equivalent) can open the running UI and save a basic **environment-only** screenshot to external artifact storage. An app launch/smoke probe does not by itself satisfy any A-OP case.

### C. Capture capability

11. Demonstrate a browser-driven capture mechanism for actual pixels/screenshots and prepared/working projections; no renderer substitution.
12. Demonstrate that network interception/logging is configured to capture real Carder acknowledged write-back HTTP requests and responses (body/status/acknowledgement, including errors) **when A-OP-05 executes**, without mocking the write route. The readiness check itself must **not** perform an additional write-back or an unrequested behavioral case.
13. Demonstrate authoritative query/export access to Canonical state, confirmation flags, revision and provenance **before and after** each write-back.
14. Store an artifact manifest containing candidate SHA, pre/post Git proof, runner/toolchain versions, fixture identifiers, timestamps, screenshot case IDs, API-trace paths and hashes of captured artifacts. Exclude secrets and private owner data.
15. Confirm the executor can publish immutable evidence (or its cryptographic hashes plus durable references) for DQA's independent review.

**Route threshold:** Project Control should first obtain proof of items 1–15 in a short **ENVIRONMENT READINESS REPORT** and confirm actual artifact availability. Until then, no A-OP cases, no renewed Deployment instance, and no claim of operational validation.

A CI workflow from a separate authorized validation repository, or a dedicated runner/VM, may orchestrate the harness if it checks out Candidate A at the SHA and captures the actual application. A workflow whose only action is to run existing unrelated tests is **insufficient**. Do not assume a workflow added solely to a nondefault branch can be manually dispatched or that such a workflow exists; verify runner/workflow availability before choosing this route. New workflow files, repository/runner provisioning, permissions and transport are Project Control operational concerns and do not authorize a code branch change.

## 6. Unchanged frozen behavioral gate

Once readiness is established, Deployment executes only the original frozen request:

| Case | Observable gate |
| --- | --- |
| `A-OP-01` | NORMAL SPELL renderer screenshot, projection and Canonical before/after |
| `A-OP-02` | NORMAL TRAP renderer screenshot, projection and Canonical before/after |
| `A-OP-03` | FIELD SPELL preserved icon, screenshot and prepared/Canonical state |
| `A-OP-04` | COUNTER TRAP preserved icon, screenshot and prepared/Canonical state |
| `A-OP-05` | Separate NORMAL SPELL/TRAP text-only acknowledged write-backs, initial confirmation/revision, actual API request/response and Canonical/provenance transitions |
| `A-OP-06` | Running Library Open in Carder visible copy or screenshot |

The exact EXPECTED and evidence requirements remain exclusively those in `EVIDENCE_REQUEST.md`. No reinterpretation, new tests or broadened RC scope are authorized.

After all six cases have been executed and their required evidence collected, Deployment returns `EVIDENCE READY` even if one or more individual results are `UNSATISFACTORY`. A `VALIDATION BLOCKED` return remains appropriate only for inability to execute or collect required evidence.

## 7. Decision and routing

**DQA determination:** DEPLOY-002 `VALIDATION BLOCKED` is a valid execution-access blocker; Candidate A remains **`PARTIAL`**. No product defect or regression has been established. No Development re-entry.

**Next target:** `PROJECT_CONTROL / PC-001`.

**Requested action:** provision and **prove** a materially different independently executable substrate using the Section 5 readiness gate; only then assign the unchanged frozen request to Deployment Validation. Preserve the exact-SHA evidence chain and continue QA review after `EVIDENCE READY`.

**Blocker route:** `PROJECT_CONTROL — EXECUTION SUBSTRATE PROVISIONING`.

**Unchanged invariants:**

- Candidate A: `61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c` / PARTIAL, isolated.
- Candidate B: `59fb2924b2240f005fb3e9e6d5afbd8aaca39596` / PASS, VALIDATED, HOLD; **not reopened**.
- P5 protocol milestone: CLOSED / PASS; Candidate A product evidence loop remains open.
- No Candidate A edits or commits; no code movement.
- RUN 024: NOT AUTHORIZED.
- `feature/workspace-v0.1` integration: NOT AUTHORIZED.
- `main` integration: NOT AUTHORIZED.
- Candidate A/B combination: NOT AUTHORIZED.
- No owner-manual repetition request.
