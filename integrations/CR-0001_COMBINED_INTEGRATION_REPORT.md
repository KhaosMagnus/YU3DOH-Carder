---
artifact_id: CR-0001-COMBINED-INTEGRATION-REPORT
artifact_type: integration_report
status: INTEGRATED
protocol_version: "1.0"
source_role: INTEGRATION_ADMIN
source_instance: IA-001
target_role: PROJECT_CONTROL
target_instance: PC-001
control_sha_consumed: c66df3ad8fed0d6c9f6b721a3999707afded7db2
owner_authorization: control/OWNER_AUTH_CR_0001_COMBINED_INTEGRATION.md
validated_candidate:
  branch: feature/workspace-cr-0001-combined
  sha: 64cb5f4ca42348c6c403e64e0d61bdff8c32a281
integration_target:
  branch: feature/workspace-v0.1
  before_sha: 4c9b0228bb47ac074c49a977b48dbf0844c33a94
  after_sha: 64cb5f4ca42348c6c403e64e0d61bdff8c32a281
method: FAST_FORWARD_ONLY
---

# Integration Report — CR-0001 Combined Candidate

## Final status

```text
INTEGRATED
```

## Control authority consumed

Exact CONTROL SHA consumed:

`c66df3ad8fed0d6c9f6b721a3999707afded7db2`

Owner authorization artifact:

`control/OWNER_AUTH_CR_0001_COMBINED_INTEGRATION.md`

Administrative handoff:

`handoffs/CR-0001_COMBINED_INTEGRATION_HANDOFF.md`

Official External Design + QA disposition:

`validations/CR-0001-COMBINED-001/DESIGN_QA_FINAL_DISPOSITION.md`

Official result:

`PASS`

## Pre-operation GitHub verification

Immediately before ref movement, GitHub reported:

```text
feature/workspace-v0.1
= 4c9b0228bb47ac074c49a977b48dbf0844c33a94

feature/workspace-cr-0001-combined
= 64cb5f4ca42348c6c403e64e0d61bdff8c32a281

fix/workspace-rc-normal-subtype-icon
= 61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c

feature/workspace-cr-0001-2-level-rank-domain
= 59fb2924b2240f005fb3e9e6d5afbd8aaca39596

main
= 54cc3aad246c89a29f2a18be63c539db68cae041

feature/workspace-run-024
= ABSENT
```

All mandatory preconditions matched the frozen handoff exactly.

## Ancestry verification

Comparison:

`4c9b0228bb47ac074c49a977b48dbf0844c33a94...64cb5f4ca42348c6c403e64e0d61bdff8c32a281`

GitHub result:

```text
status: ahead
ahead_by: 5
behind_by: 0
merge-base:
4c9b0228bb47ac074c49a977b48dbf0844c33a94
total_commits: 5
```

Therefore the authorized target was a direct fast-forward descendant of the integration baseline.

## Exact ref operation

Only the authorized product integration ref was moved:

`refs/heads/feature/workspace-v0.1`

From:

`4c9b0228bb47ac074c49a977b48dbf0844c33a94`

To:

`64cb5f4ca42348c6c403e64e0d61bdff8c32a281`

Operation guard:

```text
expected_sha:
4c9b0228bb47ac074c49a977b48dbf0844c33a94

target_sha:
64cb5f4ca42348c6c403e64e0d61bdff8c32a281

force:
false
```

GitHub update result:

`success: true`

No merge commit was created.
No cherry-pick was performed.
No rebase was performed.
No force push was performed.
No functional code was modified.
No additional code commit was created by Integration Admin.

## Post-operation GitHub verification

After the guarded ref update, GitHub reported:

```text
feature/workspace-v0.1
= 64cb5f4ca42348c6c403e64e0d61bdff8c32a281

feature/workspace-cr-0001-combined
= 64cb5f4ca42348c6c403e64e0d61bdff8c32a281

fix/workspace-rc-normal-subtype-icon
= 61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c

feature/workspace-cr-0001-2-level-rank-domain
= 59fb2924b2240f005fb3e9e6d5afbd8aaca39596

main
= 54cc3aad246c89a29f2a18be63c539db68cae041

feature/workspace-run-024
= ABSENT
```

## Integration target identity proof

Comparison:

`64cb5f4ca42348c6c403e64e0d61bdff8c32a281...feature/workspace-v0.1`

GitHub result:

```text
status: identical
ahead_by: 0
behind_by: 0
merge-base:
64cb5f4ca42348c6c403e64e0d61bdff8c32a281
total_commits: 0
```

This proves the integration branch points exactly at the validated Combined candidate and that the administrative operation introduced no integration commit.

## Non-authorized refs

Confirmed unchanged:

- Combined: `64cb5f4ca42348c6c403e64e0d61bdff8c32a281`
- Candidate A: `61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c`
- Candidate B: `59fb2924b2240f005fb3e9e6d5afbd8aaca39596`
- main: `54cc3aad246c89a29f2a18be63c539db68cae041`

Confirmed absent:

- `feature/workspace-run-024`

No unrelated product ref was moved.

The subsequent advancement of `meta/project-control` is solely the required publication of this integration evidence artifact and is not a product/code integration ref movement.

## Main protection proof

Before operation:

`main = 54cc3aad246c89a29f2a18be63c539db68cae041`

After operation:

`main = 54cc3aad246c89a29f2a18be63c539db68cae041`

Result:

`UNCHANGED`

## Final disposition

```text
CR-0001 COMBINED CANDIDATE:
INTEGRATED

feature/workspace-v0.1:
64cb5f4ca42348c6c403e64e0d61bdff8c32a281

main:
UNCHANGED

RUN 024:
ABSENT / NOT STARTED

FINAL STATUS:
INTEGRATED
```

## Return route

```text
INTEGRATION_ADMIN / IA-001
→ PROJECT_CONTROL / PC-001
```
