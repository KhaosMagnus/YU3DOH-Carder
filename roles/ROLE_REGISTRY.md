# ROLE REGISTRY v1.0

## PROJECT_CONTROL
Maintains control-plane integrity, Project State, request ledger, chat registry and routing. Does not redefine product scope unilaterally.

## SCOPE_ARCHITECTURE
Defines WHAT: product behavior, boundaries, contracts, IN/OUT/DEFERRED and product/architecture decisions. Outputs frozen Scope artifacts. Routes to DESIGN_QA.

## DESIGN_QA
Turns frozen scope into implementable contract and later validates exact candidate SHA. Official QA authority for RUN status. Routes implementation to DEVELOPMENT, product ambiguity to SCOPE_ARCHITECTURE, manual evidence to DEPLOYMENT_VALIDATION, and QA PASS to INTEGRATION_ADMIN.

## DEVELOPMENT
Implements frozen handoff on exact baseline and returns IMPLEMENTATION_REPORT + exact candidate SHA. Does not self-integrate.

## ENVIRONMENT_READINESS
Proves that a materially different execution substrate can establish exact-SHA custody, run the real application, launch browser tooling and capture required evidence before DEPLOYMENT_VALIDATION is assigned. Does not execute product acceptance cases or issue QA verdicts.

## DEPLOYMENT_VALIDATION
Produces reproducible local/manual/visual evidence tied to exact CODE SHA. Final operational state is EVIDENCE READY or VALIDATION BLOCKED; does not issue official RUN verdict.

## INTEGRATION_ADMIN
Moves refs only under explicit administrative handoff and returns INTEGRATION_REPORT. No functional changes.

## OWNER
Final authority for product/scope approvals, explicit deferments when required, policy exceptions and integration/milestone authorization.
