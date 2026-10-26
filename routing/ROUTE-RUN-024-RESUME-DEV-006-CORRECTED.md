---
artifact_id: ROUTE-RUN-024-RESUME-DEV-006-CORRECTED
artifact_type: routing_decision
status: FROZEN
protocol_version: "1.0"
source_role: PROJECT_CONTROL
source_instance: PC-002
target_role: DEVELOPMENT
target_instance: DEV-006
blocker_disposition: runs/RUN-024_DEV-006_BLOCKER_DISPOSITION.md
prior_authorization: runs/RUN-024_DEV-006_RESUMPTION_AUTHORIZATION.md
implementation_contract: handoffs/POST_P6_TRANCHE_1_IMPLEMENTATION_HANDOFF.md
implementation_branch:
  branch: feature/workspace-run-024
  required_head_sha: 219ac252d50ae11b836a93baa20cc7f7d872367f
execution_substrate: github_hosted_actions
---

# Corrected Route — Continue RUN 024 / DEV-006

Continue the SAME DEV-006 mission after Project Control resolution of the validation-command text inconsistency.

No new RUN. No new Development instance.

Read completely:

- PROJECT_STATE.md
- runs/RUN-024_DEV-006_BLOCKER_DISPOSITION.md
- runs/RUN-024_DEV-006_RESUMPTION_AUTHORIZATION.md
- runs/RUN-024_ENV-004_READY_DISPOSITION.md
- handoffs/POST_P6_TRANCHE_1_IMPLEMENTATION_HANDOFF.md
- implementations/RUN-024_RESUMED_IMPLEMENTATION_REPORT.md
- validations/RUN-024/ENV-004_ENVIRONMENT_READINESS_REPORT.md
- roles/DEVELOPMENT.md
- protocols/COMMUNICATION_PROTOCOL.md
- chats/instances/DEV-006.md

Before implementation verify feature/workspace-run-024 remains exactly:

219ac252d50ae11b836a93baa20cc7f7d872367f

and preserve its historical report-only ancestry.

Authoritative automated candidate gate:

yarn compile
yarn build
yarn test:sc
yarn test:library
yarn --cwd workspace-server compile
yarn --cwd workspace-server test

All must exit 0 against the exact final candidate SHA.

There is no required root yarn test command. Do not modify package manifests or lockfiles to create one.

Implement only CR-0001.3 / F-03 and CR-0001.6 / F-06.

All prior GitHub authoring + Actions execution rules remain binding. All T1-OP-01..07 remain mandatory.

Do not rewrite implementations/RUN-024_RESUMED_IMPLEMENTATION_REPORT.md.

Publish a NEW final control artifact:

implementations/RUN-024_DEV-006_CONTINUATION_IMPLEMENTATION_REPORT.md

Final status must be READY FOR EXTERNAL QA or IMPLEMENTATION BLOCKED.

Return to PROJECT_CONTROL / PC-002.
