# DOCUMENT MIGRATION INVENTORY

status: ACTIVE
protocol_version: 1.0
phase: P6 — LINEAGE CONSOLIDATION / FINAL MIGRATION INDEX

Classification: AUTHORITATIVE, SUPERSEDED, HISTORICAL, SUPPORTING, DUPLICATE, UNKNOWN.

## Rules

1. Do not promote a document because its filename looks final.
2. Prefer exact GitHub/code evidence and explicit owner/QA decisions.
3. Preserve source provenance and exact SHAs.
4. Internal QA is not External QA.
5. Frozen historical authority is not rewritten when later refs move.
6. Downstream authorized baselines may establish accepted/integrated checkpoints without pretending missing primary artifacts were recovered.
7. Correction-cycle evidence must preserve rejected/PARTIAL candidates.
8. Missing sender/timestamp metadata remains an explicit provenance limitation.
9. Duplicate content adds no independent evidence weight.
10. Exhausted searches may close as residual archival gaps without inventing artifacts.
11. Variant historical copies with different completeness must be preserved separately unless exact equivalence is proven.

## Recovered authority / review records

- `migration/P6_RECOVERED_AUTHORITY_001_008.md`
- `migration/P6_PRIMARY_RECOVERY_RUN_004.md`
- `migration/P6_PRIMARY_RECOVERY_RUN_008_CORRECTION.md`
- `migration/P6_ARCHIVAL_REVIEW_B03.md`
- `migration/P6_ARCHIVAL_REVIEW_B04.md`
- `migration/P6_ARCHIVAL_PILOT_001_CLOSURE.md`
- `migration/P6_ARCHIVAL_SUPPLEMENT_B05.md`
- `migration/P6_RECOVERED_AUTHORITY_009_013.md`
- `migration/P6_RECOVERED_AUTHORITY_014_019.md`
- `migration/P6_RECOVERED_AUTHORITY_020_023_RC.md`
- `migration/P6_RECENT_LINEAGE_020_023_RC.md`
- `migration/P6_BRANCH_CHECKPOINTS.md`

## RUN 001–008

- RUN 001 = `dce133edb3bb64d72ea54434fb4e40a5bf3c04a3`; PASS / INTEGRATED / CLOSED; provenance incomplete.
- RUN 002 = `070b5ea002211a3bf26a34f80473201495d0b781`; PASS / INTEGRATED / CLOSED; provenance incomplete.
- RUN 003 = `017c904c22c7842fa1209e3e39885453dda1e63a`; PASS / INTEGRATED / CLOSED; provenance incomplete.
- RUN 004 = `81c20eb1477e1a0151b6e590d1e31390d82c6de4`; primary PARTIAL → correction → PASS → integration sequence recovered/promoted with provenance limitation.
- RUN 005 = `94c4fed2c114a8d5b38626b48722237d9ec8263d`; `RECONSTRUCTED + CORROBORATED`; original QA/integration sequence remains a frozen residual archival gap.
- RUN 006 = `b484f0d5c620dd4fb57054f261a22aaf6e557f0d`; PASS / INTEGRATED / CLOSED; Development report duplication mapped.
- RUN 007 = `45d85b6cfd4a28f1b4f241f540159fac076f3978`; External QA PASS explicitly recovered after PARTIAL/correction; admin integration provenance incomplete.
- RUN 008 = `e54800629e46f8fccd653b0bef637dd71e9b97a3`; primary PARTIAL/correction return recovered; final acceptance/integration `RECONSTRUCTED + CORROBORATED`; residual final-primary gap remains frozen.

## B05 lineage supplement

Accepted classifications:

- AR-001-017 = SUPPORTING — Internal QA / Chief correction communications.
- AR-001-018 = SUPPORTING — RUN 008 specification/design/correction-HOW lineage.
- AR-001-019 = CORROBORATING — RUN 009 required baseline at `e5480062...`.
- AR-001-020 = DUPLICATE — exact report copies.
- AR-001-021 = UNRESOLVED provenance variant — condensed stored handoff vs longer B02 issued copy.

B05 does not change Pilot 001 closure or residual gaps.

See:

`migration/P6_ARCHIVAL_SUPPLEMENT_B05.md`

## RUN 009–023 + RC

Authority remains as frozen in the existing recovered-authority artifacts.

## Next P6 target

`LINEAGE CONSOLIDATION / FINAL MIGRATION INDEX`

B05 material should be consumed there as pre-v1 lineage support.

No bulk transcript import is authorized.
