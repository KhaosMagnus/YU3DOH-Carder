---
artifact_id: P6-LINEAGE-CONSOLIDATION
artifact_type: migration_lineage
status: FROZEN
protocol_version: "1.0"
source_role: PROJECT_CONTROL
source_instance: PC-001
control_parent_sha: 7583c18a9ad84f17b05a7e3e0ef90b2129652e42
---

# P6 — Workspace Historical Lineage Consolidation

## Purpose

Consolidate the recovered pre-v1 Workspace documentation lineage without rewriting historical sources or confusing evidence class with authority.

This artifact is Workspace-only.

YU3DOH Serial v0.1 is a separate lineage and is not part of this P6 migration.

## Authority precedence

For historical Workspace decisions, use the following precedence:

1. OWNER explicit authorization.
2. External Design + QA exact-SHA disposition.
3. Administrative Integration report for the authorized ref movement.
4. PROJECT_CONTROL frozen reconstruction/reconciliation artifacts.
5. Downstream authorized exact baseline as RECONSTRUCTED/CORROBORATING evidence.
6. Development implementation reports as SUPPORTING evidence.
7. Internal QA as preflight SUPPORTING evidence only.
8. Drafts, HOW/design notes and transcript copies according to their recorded provenance.

Internal QA never becomes External QA merely because it says PASS.

Development never self-integrates or self-approves a RUN.

A downstream baseline may establish an integrated checkpoint without fabricating the missing original QA text.

## Recovered role chain

The historical operating model now resolves to:

```text
Scope / implementation contract
        ↓
Technical design / HOW
        ↓
Development implementation
        ↓
Internal QA / preflight
        ↓
External Design + QA
        ↓
Owner / Project Control integration authorization
        ↓
Administrative Integration / ref movement
        ↓
next authorized exact baseline
```

Not every RUN retains every original artifact. Where a role-owned artifact is missing, P6 records the gap explicitly and uses exact downstream authority only at the evidence class it actually supports.

## Historical tranche map

### RUN 001–003

Authority:
`RECONSTRUCTED HISTORICAL CHECKPOINTS`

Exact checkpoints:
- RUN 001 — `dce133edb3bb64d72ea54434fb4e40a5bf3c04a3`
- RUN 002 — `070b5ea002211a3bf26a34f80473201495d0b781`
- RUN 003 — `017c904c22c7842fa1209e3e39885453dda1e63a`

The Git chain and downstream authorized baselines establish PASS / INTEGRATED / CLOSED state. Primary final QA/integration provenance is incomplete.

### RUN 004

Authority:
`PRIMARY RECOVERED + GITHUB CORROBORATED`

Rejected candidate:

`fa592117ccf4408a1a8e8552acafeae3b8e04d17`

Final accepted checkpoint:

`81c20eb1477e1a0151b6e590d1e31390d82c6de4`

Recovered sequence:

`PARTIAL → correction → External QA PASS → direct fast-forward authorization → integration report`

Primary artifact:

`migration/P6_PRIMARY_RECOVERY_RUN_004.md`

### RUN 005

Authority:
`RECONSTRUCTED + CORROBORATED`

Checkpoint:

`94c4fed2c114a8d5b38626b48722237d9ec8263d`

Corroboration:
- RUN 006 required exact baseline = RUN 005 final SHA;
- downstream handoff explicitly lists RUN 005 PASS;
- Git ancestry is linear.

Original final QA/integration sequence:

`ARCHIVAL GAP — NOT RECOVERED AFTER TARGETED SEARCH`

### RUN 006

Authority:
`RECONSTRUCTED`

Checkpoint:

`b484f0d5c620dd4fb57054f261a22aaf6e557f0d`

RUN 007 starts from this exact checkpoint.

Repeated Development report copies were mapped as DUPLICATE and do not add authority.

### RUN 007

Authority:
`EXTERNAL QA PASS EXPLICITLY RECOVERED`

Checkpoint:

`45d85b6cfd4a28f1b4f241f540159fac076f3978`

External QA PASS after a PARTIAL/correction cycle is recovered. Original administrative integration provenance remains incomplete, while RUN 008 exact baseline establishes the integrated checkpoint.

### RUN 008

Authority split:

- correction decision: `PRIMARY RECOVERED`
- final acceptance/integration: `RECONSTRUCTED + CORROBORATED`

Rejected candidate:

`1ba9518c402cb5005632b8fc364c20d508f2dc03`

Corrected final checkpoint:

`e54800629e46f8fccd653b0bef637dd71e9b97a3`

Recovered lineage includes:
- implementation specification;
- technical design;
- initial Development candidate;
- Internal QA preflight;
- External QA PARTIAL / QA-008-01 correction return;
- correction HOW/design;
- corrected Development redelivery;
- Internal QA preflight;
- RUN 009 contract requiring `e5480062...` as integrated baseline.

Missing final corrected External QA PASS and administrative integration artifacts are frozen as:

`ARCHIVAL GAP — NOT RECOVERED AFTER TARGETED SEARCH`

Primary correction artifact:

`migration/P6_PRIMARY_RECOVERY_RUN_008_CORRECTION.md`

Post-closure lineage supplement:

`migration/P6_ARCHIVAL_SUPPLEMENT_B05.md`

### RUN 009–013

Authority:
mixed explicit recovery and downstream exact-baseline reconstruction.

Checkpoints:
- RUN 009 — `3d1a566ceaabdb1eb9bf3346ba87541f26a66782`
- RUN 010 — `609126af1b0062ca198bcd32e7d21396bb225549`
- RUN 011 — `1f4b93ee9a3c322b808e8db3f87076b95d6f8d2e`
- RUN 012 — `590f11f62476a504164055c47aa918e80666ce2c`
- RUN 013 — `366fea433d6eccde9b2848dee2f9b53297926a69`

All are PASS / INTEGRATED / CLOSED.

RUN 011 and RUN 012 final integration checkpoints are established by their next authorized exact baselines without promoting Development reports to External QA authority.

Primary tranche artifact:

`migration/P6_RECOVERED_AUTHORITY_009_013.md`

### RUN 014–019

Checkpoints:
- RUN 014 — `fd13018c881f63764efb60bc1c88b4eb0a400018`
- RUN 015 — `191454d44f3273cf2efba254bddd8ba5275a08aa`
- RUN 016 — `163799a60772da69ecabbae03d8b2966a50d6c46`
- RUN 017 — `0c94aa7990c227690b5d90e2d73ae892a37930ee`
- RUN 018 — `d7f5d567856503a42d14543d876eb7d1e0c2b311`
- RUN 019 — `e83de9793c26f78834f748b320161a168943d4ed`

All are PASS / INTEGRATED / CLOSED.

RUN 014–015 integration is reconstructed from downstream authorized baselines.

RUN 016–019 have explicit recovered closure authority.

Primary tranche artifact:

`migration/P6_RECOVERED_AUTHORITY_014_019.md`

### RUN 020–023 + post-RUN-023 RC

Checkpoints:
- RUN 020 — `318e310f3a7f475de00bc427b6654192d615486d`
- RUN 021 — `ec838d9ea0626d52e133937fb790150575ab623e`
- RUN 022 — `4b0aa0d6afdbd07d155844d38b2832ea0acfa201`
- RUN 023 — `c929a6020760525d5cf6daf695b2f44c1d3cd1ca`
- post-RUN-023 RC — `4c9b0228bb47ac074c49a977b48dbf0844c33a94`

All are recovered PASS / INTEGRATED / CLOSED.

RUN 020 intermediate:

`33a5c07b5ad1ee7b6c777e733dd99f5f7a82b6f2`

is corrective history, not final RUN 020 authority.

Primary tranche artifact:

`migration/P6_RECOVERED_AUTHORITY_020_023_RC.md`

Verified code-lineage support:

`migration/P6_RECENT_LINEAGE_020_023_RC.md`

## CR-0001 lineage after RC

Historical integration baseline:

`feature/workspace-v0.1 @ 4c9b0228bb47ac074c49a977b48dbf0844c33a94`

Validated combined candidate:

`feature/workspace-cr-0001-combined @ 64cb5f4ca42348c6c403e64e0d61bdff8c32a281`

Official final External Design + QA:

`PASS`

Primary QA:

`validations/CR-0001-COMBINED-001/DESIGN_QA_FINAL_DISPOSITION.md`

Owner integration authorization:

`control/OWNER_AUTH_CR_0001_COMBINED_INTEGRATION.md`

Administrative integration:

`integrations/CR-0001_COMBINED_INTEGRATION_REPORT.md`

Method:

`FAST_FORWARD_ONLY`

Result:

`feature/workspace-v0.1 @ 64cb5f4ca42348c6c403e64e0d61bdff8c32a281`

Current `main` remains:

`54cc3aad246c89a29f2a18be63c539db68cae041`

RUN 024 remains absent.

## Supersession / rejection map

### RUN 004

`fa592117...`

= External QA PARTIAL / rejected / SUPERSEDED by corrected accepted `81c20eb1...`.

### RUN 008

`1ba9518c...`

= initial Development candidate / External QA PARTIAL / SUPERSEDED as implementation target by corrected `e5480062...`.

The missing final External QA artifact for `e5480062...` is not fabricated.

### RUN 020

`33a5c07b...`

= intermediate corrective checkpoint / SUPERSEDED as final RUN 020 authority by `318e310f...`.

### CR-0001 Combined QA

The earlier combined PARTIAL QA disposition is superseded by:

`validations/CR-0001-COMBINED-001/DESIGN_QA_FINAL_DISPOSITION.md`

with final result PASS at the same exact combined candidate SHA.

## Duplicate map

Known duplicates do not add independent evidence weight:

- B03 embedded RUN 006 Development report duplicates the previously recovered RUN 006 report.
- B04 Library RUN 008 correction report is byte-identical to B02 correction report.
- B05 RUN 008 initial/correction reports duplicate earlier recovered copies.
- B05 RUN 007 report copies duplicate earlier recovered sources.

## Variant provenance map

RUN 008 correction handoff exists in at least two non-equivalent retained forms:

1. longer B02 owner-supplied issued copy;
2. shorter B05 stored Grok archive variant.

They are not treated as byte-equivalent and neither silently replaces the other.

The longer B02 source remains the richer evidence used for the promoted correction authority.

## Residual provenance gaps

Residual gaps do not block historical authority because the exact checkpoints and closure states are already established.

Highest-significance residual gaps:

- RUN 001–003: original final QA/admin integration provenance incomplete.
- RUN 005: original QA/correction/integration sequence not recovered after targeted search.
- RUN 006: original final External QA/admin integration provenance incomplete.
- RUN 007: original administrative integration artifact still desirable.
- RUN 008: final corrected External QA/admin integration not recovered after targeted search.
- RUN 009–012: some original role-owned final QA/admin artifacts not imported.
- RUN 014–015: original final QA/admin artifacts not imported.
- RUN 020–022: original role-owned QA/admin artifacts not imported.

For RUN 016–019 and RUN 023/RC, recovered explicit authority is sufficient even if a distinct original role artifact may also have existed.

## Closure rule

No residual provenance gap may be converted into a contradictory historical claim without primary evidence.

If a new concrete source later appears:

- preserve it;
- classify it;
- compare against the frozen authority;
- create a supplement or reconciliation artifact;
- never silently rewrite this lineage.

