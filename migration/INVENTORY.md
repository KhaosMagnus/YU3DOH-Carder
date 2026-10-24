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
6. Recovered historical state may be frozen separately from archival import of the original role-owned artifact.

## Verified supporting material

At `feature/workspace-v0.1 @ 4c9b0228...`:

- `library/RUN-012-QA.md` through `library/RUN-020-QA.md`: SUPPORTING QA guides, not official verdicts.
- `workspace-server/BACKUP-RECOVERY.md`: SUPPORTING RUN 010 technical history.
- `workspace-server/ASSET-MUTATION.md`: SUPPORTING RUN 011 technical history.
- `workspace-server/VARIANT-LIFECYCLE.md`: SUPPORTING RUN 013 technical history.

Exact branch-head checkpoints:
`migration/P6_BRANCH_CHECKPOINTS.md`

Verified code lineage:
`migration/P6_RECENT_LINEAGE_020_023_RC.md`

Recovered historical authority:
`migration/P6_RECOVERED_AUTHORITY_020_023_RC.md`

## Resolved authority — RUN 020–023 + RC

- RUN 020 final QA/integration checkpoint: `318e310f3a7f475de00bc427b6654192d615486d`.
- RUN 020 `33a5c07b...`: intermediate corrective candidate, superseded by final `318e310f...`.
- RUN 021 final QA/integration checkpoint: `ec838d9ea0626d52e133937fb790150575ab623e`.
- RUN 022 final QA/integration checkpoint: `4b0aa0d6afdbd07d155844d38b2832ea0acfa201`.
- RUN 023 final QA/integration checkpoint: `c929a6020760525d5cf6daf695b2f44c1d3cd1ca`.
- post-RUN-023 RC correction PASS/integrated checkpoint: `4c9b0228bb47ac074c49a977b48dbf0844c33a94`.

Original role-owned historical QA/integration documents for RUN 020–022 remain to be imported for archival completeness.

## Material still to recover

- Scope 001–004 handoffs and Scope Recovery;
- Workspace roadmap / detailed Library design;
- RUN 001–011 implementation reports and QA verdicts;
- RUN 012–019 official QA verdicts distinct from QA guides;
- original QA/integration artifacts for RUN 020–022;
- pre-v1 chat lineage.

## Next slice

1. reconstruct integration/QA authority backward for RUN 019→009;
2. prioritize RUN 009–013 because their persistence/recovery/asset contracts still materially inform current Workspace behavior;
3. then reconstruct pre-v1 role/chat lineage around those artifacts.

No bulk import is authorized yet.
