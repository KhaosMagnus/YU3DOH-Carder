---
artifact_id: ADMIN-INTEGRATION-HANDOFF-CR-0001-COMBINED
artifact_type: admin_integration_handoff
status: FROZEN
protocol_version: "1.0"
source_role: PROJECT_CONTROL
source_instance: PC-001
target_role: INTEGRATION_ADMIN
target_instance: IA-001
control_parent_sha: a6441a8f78597bf309704ef9af36ab43fdf37df1
owner_authorization: control/OWNER_AUTH_CR_0001_COMBINED_INTEGRATION.md
validated_candidate:
  branch: feature/workspace-cr-0001-combined
  sha: 64cb5f4ca42348c6c403e64e0d61bdff8c32a281
integration_target:
  branch: feature/workspace-v0.1
  expected_before_sha: 4c9b0228bb47ac074c49a977b48dbf0844c33a94
  authorized_after_sha: 64cb5f4ca42348c6c403e64e0d61bdff8c32a281
---

# Administrative Integration Handoff — CR-0001 Combined Candidate

## Authority

Owner authorization is explicit and frozen in:

`control/OWNER_AUTH_CR_0001_COMBINED_INTEGRATION.md`

## Exact validated candidate

Branch:

`feature/workspace-cr-0001-combined`

SHA:

`64cb5f4ca42348c6c403e64e0d61bdff8c32a281`

Official final External QA:

`PASS`

Primary QA artifact:

`validations/CR-0001-COMBINED-001/DESIGN_QA_FINAL_DISPOSITION.md`

## Target

`feature/workspace-v0.1`

Required before SHA:

`4c9b0228bb47ac074c49a977b48dbf0844c33a94`

Authorized after SHA:

`64cb5f4ca42348c6c403e64e0d61bdff8c32a281`

## Required method

Direct fast-forward ref movement only.

Do not create a merge commit.
Do not cherry-pick.
Do not rebase.
Do not force push.

## Mandatory immediate pre-operation verification

Verify from GitHub immediately before ref movement:

```text
feature/workspace-v0.1
= 4c9b0228bb47ac074c49a977b48dbf0844c33a94

feature/workspace-cr-0001-combined
= 64cb5f4ca42348c6c403e64e0d61bdff8c32a281

main
= 54cc3aad246c89a29f2a18be63c539db68cae041
```

Compare baseline → combined:

```text
status: ahead
ahead_by: 5
behind_by: 0
merge_base:
4c9b0228bb47ac074c49a977b48dbf0844c33a94
```

If any value differs:
STOP and return `INTEGRATION BLOCKED` to PROJECT_CONTROL.

## Operation

Move only:

`refs/heads/feature/workspace-v0.1`

from:

`4c9b0228bb47ac074c49a977b48dbf0844c33a94`

to:

`64cb5f4ca42348c6c403e64e0d61bdff8c32a281`

using a non-force expected-SHA guarded update.

## Post-operation verification

Re-read GitHub and prove:

- `feature/workspace-v0.1 = 64cb5f4ca42348c6c403e64e0d61bdff8c32a281`
- Combined still = same SHA
- Candidate A unchanged
- Candidate B unchanged
- `main` unchanged
- RUN 024 absent

## Required output

Publish:

`integrations/CR-0001_COMBINED_INTEGRATION_REPORT.md`

Include:
- exact CONTROL SHA consumed;
- exact Owner authority artifact;
- pre-operation refs;
- ancestry verification;
- exact ref operation;
- post-operation refs;
- proof no force push;
- proof main unchanged;
- proof no unrelated refs moved.

Final status:

`INTEGRATED`

or

`INTEGRATION BLOCKED`

After publication, return to:

`PROJECT_CONTROL / PC-001`.
