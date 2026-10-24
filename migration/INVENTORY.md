# DOCUMENT MIGRATION INVENTORY

status: ACTIVE
protocol_version: 1.0
phase: P6 — INVENTORY / AUTHORITY RECOVERY

Classification: AUTHORITATIVE, SUPERSEDED, HISTORICAL, SUPPORTING, DUPLICATE, UNKNOWN.

## Rules

1. Do not promote a document because its filename looks final.
2. Prefer exact GitHub/code evidence and explicit owner/QA decisions.
3. Preserve source provenance and exact SHAs.
4. A QA guide is not an official QA verdict unless it explicitly declares one.
5. Frozen historical authority is not rewritten when later refs move.
6. Downstream baseline/integration evidence may establish an integrated checkpoint without pretending the missing primary QA artifact has been recovered.

## Recovered authority records

- `migration/P6_RECOVERED_AUTHORITY_009_013.md`
- `migration/P6_RECOVERED_AUTHORITY_020_023_RC.md`
- `migration/P6_RECENT_LINEAGE_020_023_RC.md`
- `migration/P6_BRANCH_CHECKPOINTS.md`

## RUN 009–013

- RUN 009 integrated checkpoint: `3d1a566ceaabdb1eb9bf3346ba87541f26a66782`; PASS/INTEGRATED/CLOSED recovered; primary final QA artifact remains archival gap.
- RUN 010: `609126af1b0062ca198bcd32e7d21396bb225549`; CLOSED/PASS/INTEGRATED explicitly recovered.
- RUN 011: `1f4b93ee9a3c322b808e8db3f87076b95d6f8d2e`; integration checkpoint established by RUN 012 baseline; primary final QA artifact pending.
- RUN 012: `590f11f62476a504164055c47aa918e80666ce2c`; integration checkpoint established by RUN 013 baseline; primary final QA artifact pending.
- RUN 013: `366fea433d6eccde9b2848dee2f9b53297926a69`; CLOSED/PASS/INTEGRATED explicitly recovered.

## RUN 020–023 + RC

- RUN 020 final = `318e310f3a7f475de00bc427b6654192d615486d`.
- RUN 021 final = `ec838d9ea0626d52e133937fb790150575ab623e`.
- RUN 022 final = `4b0aa0d6afdbd07d155844d38b2832ea0acfa201`.
- RUN 023 final = `c929a6020760525d5cf6daf695b2f44c1d3cd1ca`.
- post-RUN-023 RC = `4c9b0228bb47ac074c49a977b48dbf0844c33a94`.

## Supporting in-tree material

- `library/RUN-012-QA.md` through `library/RUN-020-QA.md`: SUPPORTING QA guides.
- `workspace-server/BACKUP-RECOVERY.md`: SUPPORTING RUN 010 technical history.
- `workspace-server/ASSET-MUTATION.md`: SUPPORTING RUN 011 technical history.
- `workspace-server/VARIANT-LIFECYCLE.md`: SUPPORTING RUN 013 technical history.

## Next P6 target

Reconstruct RUN 014–019 authority and then RUN 001–008, while separately recovering original role-owned artifacts for the archival gaps above.

No bulk transcript import is authorized.
