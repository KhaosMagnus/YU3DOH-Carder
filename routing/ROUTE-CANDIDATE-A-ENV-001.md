---
artifact_id: ROUTE-CANDIDATE-A-ENV-001
artifact_type: routing_decision
status: FROZEN
protocol_version: "1.0"
source_role: PROJECT_CONTROL
source_instance: PC-001
target_role: ENVIRONMENT_READINESS
target_instance: ENV-001
control_parent_sha: c5c5ad1cf1d6a3eaf261e3b6c7eea38769b4b0fa
related_requests:
  - CR-0001.1
  - CR-0001.5
---

# Route — Candidate A execution-substrate readiness

## Trigger

DEPLOY-001 and DEPLOY-002 both returned VALIDATION BLOCKED with 0/6 behavioral cases executed.

DQA-001 classified both blockers as ENVIRONMENT / EXECUTION ACCESS and explicitly prohibited blind DEPLOY-003 routing.

## Action

ENV-001 must execute only the frozen Environment Readiness Request:

`validations/P5-CANDIDATE-A-001/ENVIRONMENT_READINESS_REQUEST.md`

## Proposed execution substrate

Use a materially different runtime.

Preferred first option:
ChatGPT Work cloud computer/browser with repository access, if available to the operator.

Equivalent acceptable substrates include:
- dedicated VM;
- authorized CI runner;
- other persistent execution environment with real Git + browser + artifact capture.

A normal restricted chat/container identical to DEPLOY-001/002 is not acceptable.

## Gate

No further Deployment instance exists for Candidate A until ENV-001 returns ENVIRONMENT READY.

## Success route

ENV-001 → PROJECT_CONTROL

then, only after verification:

PROJECT_CONTROL → new DEPLOYMENT_VALIDATION instance → DQA-001.

## Failure route

ENVIRONMENT BLOCKED → PROJECT_CONTROL.

Do not create DEPLOY-003 merely to retry the same substrate class.
