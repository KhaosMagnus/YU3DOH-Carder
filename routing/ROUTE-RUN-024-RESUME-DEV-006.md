---
artifact_id: ROUTE-RUN-024-RESUME-DEV-006
artifact_type: routing_decision
status: FROZEN
protocol_version: "1.0"
source_role: PROJECT_CONTROL
source_instance: PC-002
target_role: DEVELOPMENT
target_instance: DEV-006
control_parent_sha: 4416c5579c96b93256bfe8ffc4417485494b481c
authorization: runs/RUN-024_DEV-006_RESUMPTION_AUTHORIZATION.md
environment_disposition: runs/RUN-024_ENV-004_READY_DISPOSITION.md
implementation_contract: handoffs/POST_P6_TRANCHE_1_IMPLEMENTATION_HANDOFF.md
implementation_branch:
  branch: feature/workspace-run-024
  required_start_sha: 219ac252d50ae11b836a93baa20cc7f7d872367f
execution_substrate: github_hosted_actions
---

# Route — Resume RUN 024 / DEV-006

## Mission

Resume and complete the existing RUN 024 implementation under the proven GitHub + Actions split model.

Do not create a new RUN.

## Read completely

- `PROJECT_STATE.md`
- `runs/RUN-024_AUTHORIZATION.md`
- `runs/RUN-024_ENV-004_READY_DISPOSITION.md`
- `runs/RUN-024_DEV-006_RESUMPTION_AUTHORIZATION.md`
- `validations/RUN-024/ENV-004_ENVIRONMENT_READINESS_REPORT.md`
- `handoffs/POST_P6_TRANCHE_1_IMPLEMENTATION_HANDOFF.md`
- `implementations/RUN-024_IMPLEMENTATION_REPORT.md` from the existing RUN branch
- `requests/CR-0001-v17.md`
- `roles/DEVELOPMENT.md`
- `protocols/COMMUNICATION_PROTOCOL.md`
- `chats/instances/DEV-006.md`

## Preflight

Verify from GitHub:

```text
feature/workspace-run-024
219ac252d50ae11b836a93baa20cc7f7d872367f

feature/workspace-v0.1
64cb5f4ca42348c6c403e64e0d61bdff8c32a281

main
54cc3aad246c89a29f2a18be63c539db68cae041
```

Verify the baseline→RUN delta is still the single historical blocker report.

STOP on an unexplained mismatch.

## Implement

Only:

- CR-0001.3 / F-03;
- CR-0001.6 / F-06.

Preserve all frozen architecture and regression requirements.

## Publication

Publish product changes only to:

`feature/workspace-run-024`

through fast-forward GitHub commit/ref operations with exact expected-head lease.

Operational Actions harness work belongs only on:

`ops/run-024-dev-006-actions`.

## Validate

Use GitHub-hosted Actions against the exact final candidate SHA.

Run the full automated gate and all T1-OP-01..07.

The exact SHA returned as candidate must be the exact SHA validated by the final successful run.

## Report

Publish the NEW control artifact:

`implementations/RUN-024_RESUMED_IMPLEMENTATION_REPORT.md`

to `meta/project-control`, not as a post-validation commit on the product branch.

Return to:

`PROJECT_CONTROL / PC-002`

with:

- exact candidate SHA;
- final status READY FOR EXTERNAL QA or IMPLEMENTATION BLOCKED;
- final Actions run/job and evidence references.

## Blocker route

`PROJECT_CONTROL / PC-002`
