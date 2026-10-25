---
artifact_id: OWNER-AUTH-CR-0001-COMBINED-INTEGRATION
artifact_type: owner_authorization
status: FROZEN
protocol_version: "1.0"
source_role: OWNER
target_role: PROJECT_CONTROL
control_parent_sha: a6441a8f78597bf309704ef9af36ab43fdf37df1
---

# Owner Authorization — CR-0001 Combined Integration

The Owner explicitly authorized:

`fast-forward feature/workspace-v0.1 from 4c9b0228bb47ac074c49a977b48dbf0844c33a94 to 64cb5f4ca42348c6c403e64e0d61bdff8c32a281`.

## Authorized ref movement

From:

`feature/workspace-v0.1 @ 4c9b0228bb47ac074c49a977b48dbf0844c33a94`

To:

`feature/workspace-cr-0001-combined @ 64cb5f4ca42348c6c403e64e0d61bdff8c32a281`

Method:

`FAST-FORWARD ONLY`

## Preconditions

Immediately before movement, Integration Admin must prove:

- `feature/workspace-v0.1 = 4c9b0228bb47ac074c49a977b48dbf0844c33a94`
- `feature/workspace-cr-0001-combined = 64cb5f4ca42348c6c403e64e0d61bdff8c32a281`
- `main = 54cc3aad246c89a29f2a18be63c539db68cae041`
- comparison status = ahead
- ahead_by = 5
- behind_by = 0
- merge-base = `4c9b0228bb47ac074c49a977b48dbf0844c33a94`

Any mismatch:
STOP. Do not reconcile silently.

## Authority boundary

Authorized:
- move `feature/workspace-v0.1` only.

Not authorized:
- move `main`;
- modify Combined;
- modify Candidate A;
- modify Candidate B;
- rebase;
- merge commit;
- force push;
- unrelated branch movement;
- RUN 024.
