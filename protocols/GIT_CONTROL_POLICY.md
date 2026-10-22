# GIT CONTROL POLICY v1.0

Control branch: `meta/project-control`

## Isolation
The branch is documentation-only and MUST NOT be merged into `main`, `feature/workspace-v0.1`, RUN branches or fix branches.

## Bootstrap implementation note
Strict orphan creation was unavailable through the active GitHub connector. The initial commit therefore uses `main` as its technical parent but replaces the entire tree with control documentation only. This does not authorize merge or product ancestry semantics.

## Commit policy
Prefer small semantic commits such as:
- `control(request): register CR-0042`
- `control(scope): freeze disposition`
- `control(qa): freeze RUN handoff`
- `control(validation): record local evidence`
- `control(state): advance project checkpoint`

## History
After bootstrap: no force-push, no history rewrite, no silent deletion of frozen authority. Use SUPERSEDED/ARCHIVED.

## Concurrent writers
Project Control owns central mutable indexes. Role outputs live in role-owned paths and become immutable after freeze.

## Exact references
Transfers reference exact CONTROL SHA. Code operations reference exact code SHA(s).
