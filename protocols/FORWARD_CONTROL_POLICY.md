---
artifact_id: FORWARD-CONTROL-POLICY
artifact_type: control_policy
status: FROZEN
protocol_version: "1.0"
source_role: PROJECT_CONTROL
source_instance: PC-001
control_parent_sha: 1e454fe97b2ffeeeee8e14c9afaf5f1d32604868
---

# FORWARD CONTROL POLICY

Effective from this publication onward, all new material project actions must use Project Control.

## Mandatory rule

A Scope decision, Design handoff, Implementation Report, QA review, validation evidence, integration handoff, routing decision or material owner request is not authoritative merely because it exists in a chat.

Before cross-role execution, it must be represented by:
- an artifact in `meta/project-control`;
- an exact CONTROL SHA;
- an exact CODE SHA/CODE BASELINE when code is involved.

## Conversation role

Chats remain the working interface for reasoning, drafting, review and owner interaction.

They are not the final authoritative store for project state.

## Existing work

Pre-policy work is not invalidated.

Historical material is migrated incrementally when relevant.

## Exceptions

Emergency fallback may use an immutable attached file only under the existing Communication Protocol and must later be reconciled to Project Control.

## Enforcement

Any new cross-role transfer that omits its exact CONTROL SHA and primary artifact path is incomplete and must be returned to PROJECT_CONTROL before execution.
