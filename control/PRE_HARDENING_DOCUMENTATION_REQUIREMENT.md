---
artifact_id: PRE-HARDENING-DOCUMENTATION-REQUIREMENT
artifact_type: project_control_requirement
status: FROZEN
protocol_version: "1.0"
source_role: PROJECT_CONTROL
source_instance: PC-002
control_parent_sha: a837517a2484e177fac3bd6364556e569e7c6bcf
implementation_authorized: false
---

# Pre-Release-Hardening Documentation Requirement

## Decision

The product README documentation must be reconciled with the actual YU3DOH Workspace release candidate before Release Hardening begins.

This is a documentation/control requirement, not a new product feature and does not require Scope review.

## Why this gate exists

At the current integrated baseline, the root documentation remains substantially inherited from the original YGO Carder project and does not describe the current Workspace architecture or operating model.

A release candidate must not enter Release Hardening with materially stale setup or product documentation.

## Timing

Execute the documentation refresh only after all Project-Control-selected pre-release product tranches have been:

1. implemented;
2. External-QA PASS;
3. explicitly integrated into `feature/workspace-v0.1`.

Then, before entering Release Hardening:

`integrated roadmap candidate → documentation refresh → Release Hardening`

If the roadmap changes before that point, documentation follows the final selected integrated state rather than being repeatedly rewritten per transient RUN.

## Minimum documentation surface

At execution time, inspect the then-current repository and update all materially stale user/developer entry documentation.

Minimum known files:

- `README.md`
- `README.Docker.md`

The final documentation should accurately cover, where applicable:

- YU3DOH Workspace purpose and relationship to Carder;
- prerequisites/toolchain;
- installation;
- local startup;
- Workspace Service;
- Library;
- Carder;
- Workspace/database bootstrap;
- expected ports/URLs;
- current storage/workspace model;
- supported operational workflow;
- Docker instructions if Docker remains supported;
- attribution/credits that must be preserved;
- limitations that remain true for the release candidate.

Do not invent features that are not present in the exact release candidate.

## Branch policy

Transient RUN branches do not each require independent product README rewrites.

RUN-specific implementation/validation history belongs in the existing control, implementation and validation artifacts.

The product README is reconciled against the integrated `feature/workspace-v0.1` release candidate and later follows the separately authorized release/main integration.

A RUN may update README earlier only when its own authorized feature materially changes setup or usage and Project Control explicitly includes documentation in that RUN.

## Validation

Release Hardening entry must verify that documented commands, paths, ports and major workflows match the exact hardening candidate.

Documentation inconsistency discovered during Hardening is a bounded release-documentation defect unless it exposes an unresolved product/scope ambiguity.

## Non-authorizations

This requirement does not authorize:

- documentation edits now;
- product implementation;
- RUN 025;
- Tranche 2 implementation;
- movement of feature/workspace-v0.1 or main.
