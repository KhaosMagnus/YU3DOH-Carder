---
artifact_id: CONCURRENT-PUBLICATION-POLICY
artifact_type: control_policy
status: FROZEN
protocol_version: "1.0"
source_role: PROJECT_CONTROL
source_instance: PC-001
control_parent_sha: 1e454fe97b2ffeeeee8e14c9afaf5f1d32604868
---

# CONCURRENT PUBLICATION POLICY

## Purpose

Allow independent roles to work from frozen CONTROL SHAs while `meta/project-control` continues advancing.

## Frozen-authority rule

A task keeps the exact CONTROL SHA and artifact that authorized it.

A later CONTROL HEAD does not silently replace that authority.

## Before publication

Every role must:
1. re-read the current `meta/project-control` HEAD;
2. confirm its own source authority still exists unchanged;
3. publish only a new role-owned artifact path;
4. avoid rewriting another role's frozen artifact;
5. avoid editing central mutable indexes.

## Central mutable files

Only PROJECT_CONTROL may modify:
- `PROJECT_STATE.md`;
- `chats/CHAT_REGISTRY.md`;
- `backlog/BACKLOG.md`;
- canonical routing/index summaries.

## Concurrent advancement

A role must not fail merely because CONTROL HEAD advanced after its assignment.

If its own authority artifact remains intact and no material contradiction exists, it may publish its output on top of the latest CONTROL HEAD.

## Material conflict

STOP and route to PROJECT_CONTROL if:
- the source authority was superseded;
- a new artifact changes the same requirement's execution contract;
- the intended output path already exists unexpectedly;
- a central index update would be required;
- code baseline identity changed.

## Publication lease

Writers should use a current-head check / lease when moving the control ref.

If the lease fails because another role published first:
- fetch the new HEAD;
- revalidate authority;
- rebuild the documentation commit on top of the new HEAD;
- do not force-push.
