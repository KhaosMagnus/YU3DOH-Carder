---
artifact_id: RUN-024-ENV-003-BLOCKER-DISPOSITION
artifact_type: environment_blocker_disposition
status: FROZEN
protocol_version: "1.0"
source_role: PROJECT_CONTROL
source_instance: PC-002
control_parent_sha: d1a9391f06ac749b1ad6c25bdaad1c56c96c5d8d
source_report: validations/RUN-024/ENV-003_ENVIRONMENT_READINESS_REPORT.md
blocked_environment_instance: ENV-003
successor_environment_instance: ENV-004
execution_target:
  branch: feature/workspace-run-024
  sha: 219ac252d50ae11b836a93baa20cc7f7d872367f
---

# RUN 024 — ENV-003 Blocker Disposition

## Finding

ENV-003 returned:

`ENVIRONMENT BLOCKED`

Project Control accepts that result.

ENV-003 materially improved the diagnosis:

- the DEV-004/DEV-005 proxy-class Git transport failure was not reproduced;
- direct Git transport and exact RUN 024 checkout succeeded;
- exact baseline ancestry and the one report-only delta were proved;
- Workspace Service dependencies installed and the service compiled;
- schema 8 READY and authoritative Canonical HTTP reads were proved.

The remaining blocker is not Git custody.

The remaining blocker is the Work/cloud execution topology required for the browser evidence path:

- another executor invocation could not reach the service listener;
- the cloud browser could not reach the service listener;
- local Chromium provisioning failed;
- root dependency installation did not finish;
- Library and Carder were therefore not demonstrated.

No product defect is established by this evidence.

## Historical evidence

Historical ENV-002 already proved that GitHub-hosted Actions can provide, in one runner/network namespace:

- exact Git checkout;
- frozen root and Workspace Service dependency installs;
- Workspace Service;
- Library;
- Carder;
- Chromium;
- screenshots;
- HTTP interception;
- authoritative Canonical reads;
- durable artifact upload.

That historical READY is not inherited as current RUN 024 readiness. It is sufficient evidence to choose GitHub-hosted Actions as the next substrate instead of repeating Work/cloud.

## Decision

Do not assign another Development instance yet.

Do not repeat the same Work/cloud topology as ENV-005 or another blind environment attempt.

Route ENV-004 to prove the current RUN 024 target on GitHub-hosted Actions.

## Split Development model

If ENV-004 returns READY, Project Control may authorize a successor Development instance using:

- GitHub exact-ref/commit operations as the authoring and candidate-publication plane;
- GitHub-hosted Actions as the exact-SHA execution and browser-evidence plane.

This is an execution-governance decision only. It changes no product scope, frozen acceptance criterion, schema/API boundary or RUN identity.

## Preserved refs

```text
main
54cc3aad246c89a29f2a18be63c539db68cae041

feature/workspace-v0.1
64cb5f4ca42348c6c403e64e0d61bdff8c32a281

feature/workspace-run-024
219ac252d50ae11b836a93baa20cc7f7d872367f
```

RUN 024 remains one report-only commit ahead of the baseline.

No implementation candidate exists.
