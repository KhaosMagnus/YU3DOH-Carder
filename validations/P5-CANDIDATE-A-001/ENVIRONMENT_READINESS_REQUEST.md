---
artifact_id: P5-CANDIDATE-A-001-ENVIRONMENT-READINESS-REQUEST
artifact_type: environment_readiness_request
status: FROZEN
protocol_version: "1.0"
source_role: PROJECT_CONTROL
source_instance: PC-001
target_role: ENVIRONMENT_READINESS
target_instance: ENV-001
control_parent_sha: c5c5ad1cf1d6a3eaf261e3b6c7eea38769b4b0fa
code_baseline:
  branch: fix/workspace-rc-normal-subtype-icon
  sha: 61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c
source_artifacts:
  - validations/P5-CANDIDATE-A-001/DESIGN_QA_DEPLOY_002_BLOCKER_REVIEW.md
  - validations/P5-CANDIDATE-A-001/EVIDENCE_REQUEST.md
---

# ENVIRONMENT READINESS REQUEST — Candidate A

## Mission

Prove that a materially different independently executable substrate exists for Candidate A before any further Deployment Validation routing.

Do NOT execute A-OP-01..A-OP-06.

Do NOT modify Candidate A.

## Proposed substrate

Preferred first attempt:

**ChatGPT Work cloud computer / browser**, or an equivalent dedicated VM/CI runner with real Git checkout and browser execution.

The substrate name is not evidence. It must pass every readiness item below.

## Candidate

Repository:
`KhaosMagnus/YU3DOH-Carder`

Branch:
`fix/workspace-rc-normal-subtype-icon`

Exact SHA:
`61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c`

Validation is pinned to the commit SHA, not merely the mutable branch name.

## Mandatory readiness gate

### A. Code custody

Prove:

1. real filesystem Git checkout with `.git`;
2. repository access sufficient to clone/fetch or an authenticated equivalent object transfer;
3. actual outputs:
   - `git rev-parse --abbrev-ref HEAD`
   - `git rev-parse HEAD`
   - `git status --porcelain`
4. HEAD equals the exact Candidate A SHA;
5. working tree is clean before and after readiness activity;
6. any temporary harness/output exists outside the tracked Candidate tree.

### B. Executable application

Record:

7. OS;
8. Git version;
9. Node version;
10. Yarn version;
11. dependency install method/result using existing immutable lockfiles;
12. browser executable and version;
13. nonsecret environment configuration required to run;
14. disposable Workspace identity/path;
15. actual Workspace Service URL;
16. actual Library URL;
17. actual Carder URL;
18. startup/health evidence from the exact checkout;
19. a basic environment-only browser screenshot proving real UI launch.

The smoke screenshot must not execute or satisfy any frozen A-OP case.

### C. Capture capability

Demonstrate readiness to capture later:

20. real browser pixels/screenshots;
21. prepared/working Carder projection;
22. actual Carder acknowledged write-back HTTP request/response;
23. authoritative Canonical state;
24. confirmation flags;
25. revision;
26. provenance;
27. before/after comparisons;
28. durable external artifact storage;
29. artifact manifest with hashes/references, timestamps, candidate SHA, toolchain versions and fixture identifiers.

Do not perform an unrequested write-back merely to prove readiness. It is enough to demonstrate that interception/logging and authoritative query/export mechanisms are configured and available.

## Candidate integrity

Candidate A must remain byte-for-byte unchanged.

No:
- source edits;
- dependency changes;
- lockfile changes;
- workflow changes on Candidate A;
- commits;
- rebase/cherry-pick/merge;
- mocks replacing renderer/write-back behavior.

## Required output

Publish:

`validations/P5-CANDIDATE-A-001/ENVIRONMENT_READINESS_REPORT.md`

with final status exactly:

`ENVIRONMENT READY`

or:

`ENVIRONMENT BLOCKED`

If READY, include:
- exact local Git proof;
- environment/toolchain proof;
- runtime URLs/logs;
- smoke screenshot reference;
- capture mechanism proof;
- artifact manifest/reference;
- clean-tree proof after readiness.

If BLOCKED, identify the exact failed readiness item(s).

## Next route

If ENVIRONMENT READY:
`PROJECT_CONTROL → DEPLOYMENT_VALIDATION`

Project Control may then assign a new Deployment instance to execute the unchanged frozen A-OP-01..06 request on that proven substrate.

If ENVIRONMENT BLOCKED:
return to `PROJECT_CONTROL / PC-001`.

## Non-authorizations

- A-OP behavior execution: NOT AUTHORIZED BY THIS REQUEST
- Candidate A code changes: NOT AUTHORIZED
- Candidate B work: OUT OF SCOPE
- RUN 024: NOT AUTHORIZED
- integration: NOT AUTHORIZED
