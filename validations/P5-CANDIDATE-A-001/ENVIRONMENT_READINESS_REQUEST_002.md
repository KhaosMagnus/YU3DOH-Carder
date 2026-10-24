---
artifact_id: P5-CANDIDATE-A-001-ENVIRONMENT-READINESS-REQUEST-002
artifact_type: environment_readiness_request
status: FROZEN
protocol_version: "1.0"
source_role: PROJECT_CONTROL
source_instance: PC-001
target_role: ENVIRONMENT_READINESS
target_instance: ENV-002
control_parent_sha: b84606279899e75a4bccf7d8e6fb6a82e292f09d
code_baseline:
  branch: fix/workspace-rc-normal-subtype-icon
  sha: 61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c
source_artifacts:
  - validations/P5-CANDIDATE-A-001/ENVIRONMENT_READINESS_REPORT.md
  - validations/P5-CANDIDATE-A-001/DESIGN_QA_DEPLOY_002_BLOCKER_REVIEW.md
---

# ENV-002 — GitHub-hosted Actions readiness

## Objective

Resolve only the transport/execution gap left by ENV-001 using a materially different substrate: a GitHub-hosted Actions runner where Git, Workspace Service, Vite/Library/Carder and Chromium execute in one job/network namespace.

## Exact candidate custody

The operational workflow itself must NOT run Candidate A from an altered tree.

It must checkout the immutable candidate by exact SHA into a dedicated path:

`61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c`

and prove:
- real .git checkout;
- HEAD exact;
- clean status before/after;
- Candidate tracked bytes unchanged.

Operational workflow/harness files must live on a separate `ops/` branch, not Candidate A.

## Readiness behavior

Readiness may create a disposable non-A-OP fixture and use the real Candidate A Workspace Service and UI.

It may:
- install root/workspace dependencies with frozen lockfiles;
- compile the real Workspace Service;
- launch a disposable real Workspace Service;
- launch Vite from exact Candidate A;
- launch Chromium/Playwright in the same runner;
- open Library and Carder;
- create an environment-only screenshot;
- demonstrate browser request/response interception;
- demonstrate a real non-A-OP Carder prepared/working projection using a disposable fixture;
- query authoritative Canonical state including confirmation/revision/provenance;
- prove before/after comparison capability using a read-only readiness transition;
- upload readiness evidence.

It must NOT execute A-OP-01..A-OP-06 and must not perform Carder write-back.

## Success gate

ENVIRONMENT READY requires the unresolved ENV-001 items to be proven, particularly:
- completed root and Workspace installs;
- actual browser executable/version;
- actual Service, Library and Carder URLs;
- browser reachability to those URLs;
- real application screenshot;
- prepared/working projection capture capability;
- HTTP request/response capture configuration;
- authoritative Canonical/confirmation/revision/provenance capture;
- durable uploaded artifact manifest;
- final clean exact-SHA checkout.

## Output

Publish a new role-owned report:

`validations/P5-CANDIDATE-A-001/ENV-002_ENVIRONMENT_READINESS_REPORT.md`

Final state:
- ENVIRONMENT READY
or
- ENVIRONMENT BLOCKED

No Deployment Validation assignment is authorized until Project Control verifies READY.
