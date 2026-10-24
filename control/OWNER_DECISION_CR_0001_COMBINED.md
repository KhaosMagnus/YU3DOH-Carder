---
artifact_id: OWNER-DECISION-CR-0001-COMBINED
artifact_type: owner_decision
status: FROZEN
protocol_version: "1.0"
source_role: OWNER
target_role: PROJECT_CONTROL
control_parent_sha: 36c8f9b012153e7221d81452a98aa03e481fb908
decision: AUTHORIZE_OPTION_C
---

# Owner Decision — CR-0001 Combined Candidate

The Owner explicitly authorized:

`Option C — prepare Combined Candidate A+B`.

## Authorized scope

Prepare a dedicated combined candidate containing the independently validated corrections from:

### Candidate A

`fix/workspace-rc-normal-subtype-icon @ 61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c`

Validated:
- CR-0001.1 / F-01
- CR-0001.5 / F-05

### Candidate B

`feature/workspace-cr-0001-2-level-rank-domain @ 59fb2924b2240f005fb3e9e6d5afbd8aaca39596`

Validated:
- CR-0001.2 / F-02

Authorized baseline:

`feature/workspace-v0.1 @ 4c9b0228bb47ac074c49a977b48dbf0844c33a94`

## Authority boundary

This decision authorizes only:
- creation of a dedicated combined candidate branch;
- minimal reconciliation needed to combine A+B;
- regression/focused validation;
- publication of a combined Implementation Report;
- External Design + QA of the exact combined SHA.

This decision does NOT authorize:
- moving `feature/workspace-v0.1`;
- moving `main`;
- treating independent A/B PASS as combined PASS;
- RUN 024;
- unrelated product changes.
