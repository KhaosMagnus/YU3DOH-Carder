# YU3DOH Project Control — v1.0

Status: **ACTIVE BOOTSTRAP**

This branch is the control plane for YU3DOH project intent, handoffs, operational state and chat/agent continuity.

## Truth model

- **CODE TRUTH** = GitHub code refs and exact code SHA.
- **CONTROL TRUTH** = `meta/project-control` and exact CONTROL SHA.
- **CONVERSATION** = working interface; not authoritative storage.

## Control branch

`meta/project-control`

The branch is documentation-only and MUST NOT be merged into product code branches.

### Bootstrap ancestry note

The GitHub connector used for bootstrap cannot create a root commit with zero parents. Therefore the initial control commit uses `main` as a technical parent while replacing the entire tree with control documentation only. This preserves a documentation-only HEAD but is not a strict orphan history.

This ancestry is an implementation detail only. No product code is present in the control branch HEAD, and the branch remains permanently non-mergeable by policy.

## Core rule

Every material request, decision, handoff, implementation result, validation result and integration record becomes a versioned artifact.

Every cross-role transfer references:
1. exact CONTROL SHA;
2. exact artifact path;
3. exact CODE SHA / CODE BASELINE when code is involved.
