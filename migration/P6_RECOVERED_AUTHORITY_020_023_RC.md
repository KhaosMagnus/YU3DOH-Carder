---
artifact_id: P6-RECOVERED-AUTHORITY-020-023-RC
artifact_type: migration_inventory
status: FROZEN
protocol_version: "1.0"
source_role: PROJECT_CONTROL
source_instance: PC-001
control_parent_sha: ad108b5601dfa93e1fdf981e7088993f7e0c5512
---

# P6 — Recovered historical authority: RUN 020 → RUN 023 → RC

## Evidence basis

This record combines:

1. live GitHub ancestry/current refs;
2. preserved project conversation records;
3. retained Library/pasted historical handoffs and reports.

It intentionally distinguishes **recovered historical authority** from the still-missing original role-owned QA/integration artifacts.

## RUN 020 — External Source Ingestion Phase 1

### Recovered final authority

Final QA-validated SHA:

`318e310f3a7f475de00bc427b6654192d615486d`

Historical External Design + QA disposition:

`PASS`

Historical integration disposition:

`PASS / INTEGRATED / CLOSED`

Integration target:

`feature/workspace-v0.1`

### Correction lineage

Previous correction candidate:

`33a5c07b5ad1ee7b6c777e733dd99f5f7a82b6f2`

The preserved Development correction report identifies:

- pre-correction HEAD: `33a5c07b...`;
- new correction commit/final Development HEAD: `318e310f...`;
- direct parent: `33a5c07b...`;
- External QA still pending at Development-report time.

Later project history records External QA PASS at `318e310f...` and direct fast-forward integration into `feature/workspace-v0.1`.

Therefore:

`33a5c07b...` = intermediate corrective candidate, **not** final RUN 020 authority.

`318e310f...` = recovered final QA/integration checkpoint.

GitHub ancestry is consistent with this reconstruction.

### Classification

`HISTORICAL AUTHORITY — RECOVERED / ORIGINAL QA ARTIFACT NOT YET IMPORTED`

## RUN 021 — External Source Selective TEXT Acceptance

Recovered final QA-validated SHA:

`ec838d9ea0626d52e133937fb790150575ab623e`

Recovered External Design + QA disposition:

`PASS`

Recovered integration:

`feature/workspace-v0.1` fast-forwarded to the same SHA.

Historical state:

`PASS / INTEGRATED / CLOSED`

Current Git ancestry corroborates that RUN 021 is exactly one descendant commit after RUN 020 final checkpoint.

Classification:

`HISTORICAL AUTHORITY — RECOVERED / ORIGINAL QA ARTIFACT NOT YET IMPORTED`

## RUN 022 — Canonical Structural Registry Baseline + External Source STRUCTURE Normalizer v2

Recovered final QA-validated SHA:

`4b0aa0d6afdbd07d155844d38b2832ea0acfa201`

Recovered External Design + QA disposition:

`PASS`

Recovered integration state:

`PASS / INTEGRATED / CLOSED`

Integration checkpoint:

`feature/workspace-v0.1 = 4b0aa0d6...`

Schema:

`8`

Workspace format:

`1`

Migrations:

`001–008`

Migration 008:

`workspace-server/migrations/008_standard_structural_registry_baseline.sql`

Migration 009:

absent.

Current Git ancestry corroborates RUN 022 as exactly one descendant commit after RUN 021.

Classification:

`HISTORICAL AUTHORITY — RECOVERED / ORIGINAL QA ARTIFACT NOT YET IMPORTED`

## RUN 023 — External Source Complete STRUCTURE Acceptance

Recovered and independently retained final QA-validated SHA:

`c929a6020760525d5cf6daf695b2f44c1d3cd1ca`

External Design + QA:

`PASS`

Integration:

direct fast-forward to `feature/workspace-v0.1`.

Historical state:

`PASS / INTEGRATED / CLOSED`

Current Git ancestry corroborates RUN 023 as exactly one descendant commit after RUN 022.

Classification:

`HISTORICAL AUTHORITY — RECOVERED`

## Post-RUN-023 RC correction — Canonical Editor Applicability & Null/Zero Intent

Validated correction SHA:

`4c9b0228bb47ac074c49a977b48dbf0844c33a94`

External Design + QA:

`PASS`

Administrative integration:

complete into `feature/workspace-v0.1`.

Current exact refs remain:

- `feature/workspace-v0.1 = 4c9b0228...`
- `fix/workspace-rc-canonical-null-zero = 4c9b0228...`
- `feature/workspace-run-023 = c929a602...`
- `main = 54cc3aad...`

Classification:

`HISTORICAL AUTHORITY — RECOVERED / CURRENT BASELINE ANCESTOR`

## Verified chain with recovered authority

```text
RUN 020 PASS / integrated
318e310f...
   ↓
RUN 021 PASS / integrated
ec838d9e...
   ↓
RUN 022 PASS / integrated
4b0aa0d6...
   ↓
RUN 023 PASS / integrated
c929a602...
   ↓
RC correction PASS / integrated
4c9b0228...
```

## Remaining P6 work

This reconstruction resolves the historical **state/SHA ambiguity** for RUN 020–023.

Still missing for archival completeness:

- original role-owned External QA report(s) for RUN 020;
- original role-owned External QA report(s) for RUN 021;
- original role-owned External QA report(s) for RUN 022;
- original integration handoffs/reports for RUN 020–022;
- exact pre-v1 chat lineage that produced those artifacts.

Those missing originals are archival gaps, not current uncertainty about the recovered final SHA/state above, unless contradictory primary evidence is later found.

If contradictory primary evidence appears, Project Control must create a reconciliation artifact rather than silently rewriting this frozen record.
