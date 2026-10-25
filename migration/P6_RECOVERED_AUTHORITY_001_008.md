---
artifact_id: P6-RECOVERED-AUTHORITY-001-008
artifact_type: migration_inventory
status: FROZEN
protocol_version: "1.0"
source_role: PROJECT_CONTROL
source_instance: PC-001
control_parent_sha: 2628f6c9cba8bd86db211d75eddca5669a84a08c
---

# P6 — Recovered historical authority: RUN 001–008

## Purpose

This artifact reconstructs the first Workspace implementation tranche from live GitHub lineage, retained implementation/correction reports, later authorized baselines, and the limited explicit historical QA/integration decisions still recoverable.

It deliberately distinguishes:

- an **explicit primary/post-run authority record**;
- an **integrated checkpoint established by the next authorized RUN baseline**;
- a **Development / Internal QA artifact**, which is supporting evidence only.

A downstream authorized Workspace baseline establishes that the predecessor checkpoint entered `feature/workspace-v0.1` under the project's external-acceptance protocol. It does not pretend that the predecessor's original final QA or administrative integration document has already been recovered.

---

## Verified Git lineage

```text
main
54cc3aad246c89a29f2a18be63c539db68cae041
   ↓
RUN 001
dce133edb3bb64d72ea54434fb4e40a5bf3c04a3
   ↓
RUN 002
070b5ea002211a3bf26a34f80473201495d0b781
   ↓
RUN 003
017c904c22c7842fa1209e3e39885453dda1e63a
   ↓
RUN 004
81c20eb1477e1a0151b6e590d1e31390d82c6de4
   ↓
RUN 005
94c4fed2c114a8d5b38626b48722237d9ec8263d
   ↓
RUN 006
b484f0d5c620dd4fb57054f261a22aaf6e557f0d
   ↓
RUN 007
45d85b6cfd4a28f1b4f241f540159fac076f3978
   ↓
RUN 008
e54800629e46f8fccd653b0bef637dd71e9b97a3
```

Every adjacent comparison is linear:

- status: `ahead`;
- behind_by: `0`;
- merge-base: exact predecessor checkpoint.

No divergence was found.

---

## RUN 001 — Workspace Service Skeleton + Lifecycle

Final branch checkpoint:

`dce133edb3bb64d72ea54434fb4e40a5bf3c04a3`

Recovered implementation title:

`IMPLEMENTATION RUN 001 — Workspace Service Skeleton + Lifecycle`

Baseline:

`main @ 54cc3aad246c89a29f2a18be63c539db68cae041`

Recovered Development evidence:

- service lifecycle/manifest boundary implemented;
- dependency-backed validation completed successfully;
- final cleanup/lock checkpoint `dce133ed...`;
- no SQLite persistence yet;
- Carder product code unchanged by the RUN.

Historical integration authority:

RUN 002 history descends from `dce133ed...`, and the next Workspace persistence stage is built on the validated RUN 001 checkpoint.

Recovered state:

`PASS / INTEGRATED / CLOSED — integration checkpoint reconstructed from downstream authorized lineage`

Classification:

`HISTORICAL AUTHORITY — CHECKPOINT RECOVERED / PRIMARY FINAL QA + INTEGRATION ARTIFACTS PENDING ARCHIVAL RECOVERY`

---

## RUN 002 — SQLite + Migrations + Repository Foundation

Final branch checkpoint:

`070b5ea002211a3bf26a34f80473201495d0b781`

Recovered historical capability label:

`SQLite + Migrations + Repository Foundation`

Key commit:

`53d4be44f7011d750eb2f95f98c027e5afd2b5e7 — feat(workspace): add SQLite persistence foundation`

Final history also includes Windows binding, transaction typing, failed-inspection cleanup and dependency locking.

Established contract recovered from the RUN 003 handoff:

- SQLite ownership;
- versioned migrations;
- repository operation boundary;
- transactions;
- schema inspection;
- database schema version;
- lifecycle integration.

Database schema:

`1`

Migration:

`001_repository_foundation.sql`

Historical integration authority:

RUN 003 was explicitly authorized from:

`feature/workspace-v0.1 @ 070b5ea002211a3bf26a34f80473201495d0b781`

and treats RUN 001 and RUN 002 as required PASS dependencies.

Recovered state:

`PASS / INTEGRATED / CLOSED — exact integrated checkpoint established by downstream authorized baseline`

Classification:

`HISTORICAL AUTHORITY — CHECKPOINT RECOVERED / PRIMARY ROLE-OWNED QA + INTEGRATION ARTIFACTS PENDING ARCHIVAL RECOVERY`

---

## RUN 003 — Canonical Domain Persistence

Final branch checkpoint:

`017c904c22c7842fa1209e3e39885453dda1e63a`

Recovered title:

`IMPLEMENTATION RUN 003 — Canonical Domain Persistence`

Baseline:

`070b5ea002211a3bf26a34f80473201495d0b781`

Database schema:

`2`

New migration:

`002_canonical_domain.sql`

Verified migration blob:

`253fe76054ce3f40d50d09ecd3e90bb1b322deea`

Important recovery cycle:

An earlier technically green candidate did not prove the rule against silent overwrite of confirmed blocks.

Correction:

`055f1d10fe4a6a30d664e95ad3cceac79940a6bd — fix(workspace): protect confirmed canonical blocks`

Windows recovery validation then passed; final clean checkpoint is `017c904...`.

Historical integration authority:

RUN 004 was authorized from:

`feature/workspace-v0.1 @ 017c904c22c7842fa1209e3e39885453dda1e63a`

Recovered state:

`PASS / INTEGRATED / CLOSED — integration checkpoint reconstructed from downstream authorized baseline`

Classification:

`HISTORICAL AUTHORITY — CHECKPOINT + RECOVERY CYCLE RECOVERED / PRIMARY FINAL QA + INTEGRATION ARTIFACTS PENDING`

---

## RUN 004 — Art Variants + Read-Only Asset Indexer

Final branch checkpoint:

`81c20eb1477e1a0151b6e590d1e31390d82c6de4`

Recovered title:

`IMPLEMENTATION RUN 004 — Art Variants + Read-Only Asset Indexer`

Baseline:

`017c904c22c7842fa1209e3e39885453dda1e63a`

Database schema:

`3`

New migration:

`003_art_variants_asset_index.sql`

Verified migration blob:

`7f1aa54649a4b4b73871a50177de492047fe4f83`

Git history proves a corrective validation cycle after the initial asset-indexer implementation, including:

- asset image-validation hardening;
- decodable indexed-image payload requirement;
- dedicated QA-correction Windows validation;
- final clean checkpoint `81c20eb...`.

Historical integration authority:

RUN 005 descends from `81c20eb...`, and subsequent RUN 005 work occurs on top of that exact Asset Indexer checkpoint.

Recovered state:

`PASS / INTEGRATED / CLOSED — correction lineage recovered; integration checkpoint reconstructed from downstream authorized baseline`

Classification:

`HISTORICAL AUTHORITY — CHECKPOINT + QA-CORRECTION LINEAGE RECOVERED / PRIMARY FINAL QA + INTEGRATION ARTIFACTS PENDING`

---

## RUN 005 — Managed Asset Ingest

Final branch checkpoint:

`94c4fed2c114a8d5b38626b48722237d9ec8263d`

Recovered capability:

`Managed Asset Ingest`

Baseline:

`81c20eb1477e1a0151b6e590d1e31390d82c6de4`

Database schema:

`4`

New migration:

`004_managed_asset_ingest.sql`

Verified migration blob:

`2f2f58239d597d34d5608fcf022b9d2f4007da91`

Git history recovers the implementation and correction path:

- `0e6ade0c... — feat(workspace): add managed asset ingest`;
- compensation hardening;
- External-QA correction preventing ingest through existing role conflicts;
- final QA-correction cleanup at `94c4fed...`.

Historical integration authority:

RUN 006 explicitly starts from:

`feature/workspace-v0.1 @ 94c4fed2c114a8d5b38626b48722237d9ec8263d`

Recovered state:

`PASS / INTEGRATED / CLOSED — QA-correction lineage recovered; exact integration checkpoint established by downstream authorized baseline`

Classification:

`HISTORICAL AUTHORITY — CHECKPOINT + CORRECTION CYCLE RECOVERED / PRIMARY FINAL QA + INTEGRATION ARTIFACTS PENDING ARCHIVAL RECOVERY`

---

## RUN 006 — Library Shell + Browse/Search

Final branch checkpoint:

`b484f0d5c620dd4fb57054f261a22aaf6e557f0d`

Recovered title:

`IMPLEMENTATION RUN 006 — Library Shell + Browse/Search`

Baseline:

`94c4fed2c114a8d5b38626b48722237d9ec8263d`

Schema:

`4`

Migrations 001–004 unchanged.

Recovered Development exact-SHA evidence includes:

- 133 PASS / 0 FAIL / 0 skipped;
- compile/build PASS;
- Workspace compile PASS;
- Windows validation PASS;
- no new dependencies.

The Development report correctly ends at `READY FOR QA` and says RUN 006 itself did not integrate its own branch.

Historical integration authority:

RUN 007 is explicitly based on:

`feature/workspace-v0.1 @ b484f0d5c620dd4fb57054f261a22aaf6e557f0d`

Recovered state:

`PASS / INTEGRATED / CLOSED — integration checkpoint reconstructed from downstream authorized baseline`

Classification:

`HISTORICAL AUTHORITY — CHECKPOINT RECOVERED / PRIMARY FINAL QA + INTEGRATION ARTIFACTS PENDING`

---

## RUN 007 — Card Detail + Canonical Editor

Final branch checkpoint:

`45d85b6cfd4a28f1b4f241f540159fac076f3978`

Recovered title:

`IMPLEMENTATION RUN 007 — Card Detail + Canonical Editor`

Baseline:

`b484f0d5c620dd4fb57054f261a22aaf6e557f0d`

Schema:

`4`

Initial candidate:

`0966a0ed0e234e3b7530f3961f91418d8d5b02f9`

Recovered External QA result:

`PARTIAL — RETURN TO DEVELOPMENT`

Correction scope:

- conflict reload safety;
- detail/metadata error isolation.

Correction commits include:

- `63b0b07460576e8d6dd3b2cbd7de72e872551310`;
- `31b5ce16bdade474ae42c56b559c7269d2adc77c`;
- Windows functional validation `b49476dd64f15f16d68f1a4cf6d3bd2fdc47f111`;
- final clean checkpoint `45d85b6...`.

Historical conversation authority explicitly recovers:

- final External Design + QA: `PASS`;
- accepted SHA: `45d85b6...`;
- integration to `feature/workspace-v0.1` authorized after PASS.

RUN 008 then uses that exact SHA as its Workspace baseline.

Recovered state:

`PASS / INTEGRATED / CLOSED`

Classification:

`HISTORICAL AUTHORITY — EXTERNAL QA PASS + CORRECTION CYCLE RECOVERED; PRIMARY ADMINISTRATIVE INTEGRATION ARTIFACT STILL DESIRABLE`

---

## RUN 008 — Variant / Asset Management + Diagnostics UI

Final branch checkpoint:

`e54800629e46f8fccd653b0bef637dd71e9b97a3`

Recovered title:

`IMPLEMENTATION RUN 008 — Variant / Asset Management + Diagnostics UI`

Baseline:

`45d85b6cfd4a28f1b4f241f540159fac076f3978`

Schema:

`4`

Initial candidate:

`1ba9518c402cb5005632b8fc364c20d508f2dc03`

Recovered External QA result on that candidate:

`PARTIAL`

Correction target:

`QA-008-01`

The correction makes MISSING/INVALID unmanaged-asset problem associations distinguishable from truly EMPTY slots and preserves readiness semantics.

Correction lineage:

- `2d5cb9a57548ef9c33aa4869b39ba19d4f69cf83`;
- `2a0d1d112951302919c013cae3637576c7d11b61`;
- `c4a51bd6faa84d92289f5061f75a73f86f9513e3`;
- Windows functional validation `4a14bec39b5142462557b36d3c0ba708b86bdd32`;
- final clean checkpoint `e548006...`.

The retained correction report's Internal QA PASS is explicitly only a preflight and is not promoted to official External QA.

Historical integration authority:

RUN 009 is explicitly based on:

`feature/workspace-v0.1 @ e54800629e46f8fccd653b0bef637dd71e9b97a3`

Under the frozen RUN protocol, this establishes the accepted/integrated RUN 008 checkpoint before RUN 009 authorization.

Recovered state:

`PASS / INTEGRATED / CLOSED — final acceptance/integration checkpoint reconstructed from downstream authorized baseline after the explicit PARTIAL/correction cycle`

Classification:

`HISTORICAL AUTHORITY — CORRECTION CYCLE + INTEGRATED CHECKPOINT RECOVERED / PRIMARY FINAL EXTERNAL QA + INTEGRATION ARTIFACTS PENDING`

---

## Schema progression recovered

```text
RUN 001
no SQLite schema

RUN 002
schema 1
001_repository_foundation.sql

RUN 003
schema 2
+ 002_canonical_domain.sql

RUN 004
schema 3
+ 003_art_variants_asset_index.sql

RUN 005
schema 4
+ 004_managed_asset_ingest.sql

RUN 006
schema 4

RUN 007
schema 4

RUN 008
schema 4
```

This progression is consistent with the later RUN 009 baseline.

---

## Final recovered tranche

```text
RUN 001  dce133ed...  PASS / INTEGRATED / CLOSED
RUN 002  070b5ea0...  PASS / INTEGRATED / CLOSED
RUN 003  017c904c...  PASS / INTEGRATED / CLOSED
RUN 004  81c20eb1...  PASS / INTEGRATED / CLOSED
RUN 005  94c4fed2...  PASS / INTEGRATED / CLOSED
RUN 006  b484f0d5...  PASS / INTEGRATED / CLOSED
RUN 007  45d85b6c...  PASS / INTEGRATED / CLOSED
RUN 008  e5480062...  PASS / INTEGRATED / CLOSED
```

The state line above records the recovered historical product checkpoint. The per-RUN sections define the evidence class and must be consulted before claiming that a primary QA/integration document itself has been archived.

## Remaining archival gaps

Targeted archival recovery remains useful for:

- original final External QA records for RUN 001–006 and RUN 008 where not already archived;
- original administrative integration records for RUN 001–008;
- exact original RUN 002 handoff/title document;
- original RUN 004 and RUN 005 External QA correction dispositions;
- any role-owned source documents currently represented only by retained conversation/library copies.

These are provenance/archive gaps. They do not invalidate the reconstructed integrated checkpoint chain unless later primary evidence contradicts this artifact.

Any contradiction requires a superseding reconciliation artifact.
