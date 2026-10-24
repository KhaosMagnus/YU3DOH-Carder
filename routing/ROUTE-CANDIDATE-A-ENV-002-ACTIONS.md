---
artifact_id: ROUTE-CANDIDATE-A-ENV-002-ACTIONS
artifact_type: routing_decision
status: FROZEN
protocol_version: "1.0"
source_role: PROJECT_CONTROL
source_instance: PC-001
target_role: ENVIRONMENT_READINESS
target_instance: ENV-002
control_parent_sha: b84606279899e75a4bccf7d8e6fb6a82e292f09d
---

# Route — Candidate A ENV-002 GitHub Actions readiness

ENV-001 is accepted as ENVIRONMENT BLOCKED.

ENV-001 proved exact Git custody and real Workspace Service execution, but failed the shared browser/server transport gate.

ENV-002 therefore uses a materially different substrate:

`GitHub-hosted Actions runner`

Operational provisioning may use a separate `ops/` branch containing only readiness workflow/harness material. Candidate A itself remains unchanged and is checked out inside the job by exact SHA.

Authority:
`validations/P5-CANDIDATE-A-001/ENVIRONMENT_READINESS_REQUEST_002.md`

No DEPLOY-003 exists yet.

Success:
ENV-002 → ENVIRONMENT READY → PROJECT_CONTROL verification → then new DEPLOYMENT_VALIDATION routing.

Failure:
ENV-002 → ENVIRONMENT BLOCKED → PROJECT_CONTROL.
