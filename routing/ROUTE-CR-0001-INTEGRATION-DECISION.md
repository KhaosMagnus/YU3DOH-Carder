---
artifact_id: ROUTE-CR-0001-INTEGRATION-DECISION
artifact_type: routing_decision
status: FROZEN
protocol_version: "1.0"
source_role: PROJECT_CONTROL
source_instance: PC-001
target_role: OWNER
control_parent_sha: 1f38260d84afd993795e4d067802a5b7e48f7acb
---

# Candidate Integration Decision Gate — CR-0001

## Trigger

Both independently developed candidates now hold official External QA PASS dispositions.

### Candidate A

Branch:
`fix/workspace-rc-normal-subtype-icon`

SHA:
`61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c`

Validated requests:
- CR-0001.1 / F-01
- CR-0001.5 / F-05

Final QA:
`PASS`

### Candidate B

Branch:
`feature/workspace-cr-0001-2-level-rank-domain`

SHA:
`59fb2924b2240f005fb3e9e6d5afbd8aaca39596`

Validated request:
- CR-0001.2 / F-02

Final QA:
`PASS`

## Current integration baseline

`feature/workspace-v0.1 @ 4c9b0228bb47ac074c49a977b48dbf0844c33a94`

`main @ 54cc3aad246c89a29f2a18be63c539db68cae041`

Neither candidate is integrated.

## Technical relationship

Both candidates descend from the same current Workspace baseline.

Candidate A:
- ahead by 2 commits from baseline.

Candidate B:
- ahead by 3 commits from baseline.

A vs B:
`diverged`

B vs A:
`diverged`

Known changed-file overlap:

`workspace-server/test/carder-write-back.test.ts`

No claim is made that the combined tree is validated.

Independent PASS + independent PASS does NOT equal combined PASS.

## Owner decision options

### Option A — integrate Candidate A only

Technically eligible for direct fast-forward from current `feature/workspace-v0.1`, subject to immediate pre-operation ref/ancestry verification.

Candidate B remains VALIDATED / HOLD.

### Option B — integrate Candidate B only

Technically eligible for direct fast-forward from current `feature/workspace-v0.1`, subject to immediate pre-operation ref/ancestry verification.

Candidate A remains VALIDATED / HOLD.

### Option C — incorporate both validated corrections

Recommended if the Owner wants all currently validated CR-0001 corrections in Workspace v0.1.

Do NOT fast-forward one candidate and then silently merge/cherry-pick the other.

Required route:

1. Owner explicitly authorizes combined-candidate preparation.
2. Project Control freezes exact A, B and baseline SHAs.
3. DEVELOPMENT or a specifically authorized reconciliation role creates a dedicated combined candidate branch from the authorized baseline/head.
4. Incorporate the other validated candidate with minimal reconciliation.
5. Any conflict or manual resolution is treated as new combined-candidate implementation evidence.
6. Run the full required regression gate plus focused A/B acceptance coverage.
7. DESIGN_QA validates the exact combined SHA.
8. Only after combined QA PASS may INTEGRATION_ADMIN receive authority to move `feature/workspace-v0.1`.

This preserves the rule that the independently validated candidates were not previously authorized as a combination.

## Recommendation

Project Control recommends **Option C through a dedicated combined-candidate gate**, because CR-0001.1, CR-0001.2 and CR-0001.5 are all independently validated corrections intended for the Workspace v0.1 line.

The recommendation is NOT authorization.

## Authority boundary

Only the Owner may authorize the next integration path.

Until explicit Owner authorization:

- Candidate A = VALIDATED / HOLD
- Candidate B = VALIDATED / HOLD
- feature/workspace-v0.1 remains unchanged
- main remains unchanged
- Candidate A + B combination remains NOT AUTHORIZED
- RUN 024 remains NOT AUTHORIZED
