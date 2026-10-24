# DOCUMENT MIGRATION INVENTORY

status: ACTIVE
protocol_version: 1.0
phase: P6 — INVENTORY FIRST

Classification: AUTHORITATIVE, SUPERSEDED, HISTORICAL, SUPPORTING, DUPLICATE, UNKNOWN.

## Rules

1. Do not promote a document because its filename looks final.
2. Prefer exact GitHub/code evidence and explicit owner/QA decisions.
3. Preserve source provenance and exact SHAs.
4. A QA guide is not an official QA verdict unless it explicitly declares one.
5. Frozen historical authority is not rewritten when later refs move.

## Verified supporting material

At `feature/workspace-v0.1 @ 4c9b0228...`:

- `library/RUN-012-QA.md` through `library/RUN-020-QA.md` exist and are classified **SUPPORTING** QA guides, not official verdicts.
- `workspace-server/BACKUP-RECOVERY.md` is **SUPPORTING** RUN 010 technical history.
- `workspace-server/ASSET-MUTATION.md` is **SUPPORTING** RUN 011 technical history.
- `workspace-server/VARIANT-LIFECYCLE.md` is **SUPPORTING** RUN 013 technical history.

Exact branch-head checkpoints for RUN 001–023:
`migration/P6_BRANCH_CHECKPOINTS.md`

Recent code lineage:
`migration/P6_RECENT_LINEAGE_020_023_RC.md`

## Known unresolved authority

- RUN 020 current branch HEAD is `318e310f...`.
- `33a5c07b...` is its direct parent and a historically referenced correction checkpoint.
- Which SHA held the relevant final External QA disposition remains **UNKNOWN** until the historical report is recovered.

## Material still to recover

- Scope 001–004 handoffs and Scope Recovery;
- Workspace roadmap / detailed Library design;
- RUN 001–011 implementation reports and QA verdicts;
- RUN 012–020 official QA verdicts distinct from QA guides;
- RUN 021–023 implementation/QA/integration reports;
- historical integration records into `feature/workspace-v0.1`;
- pre-v1 chat lineage.

## Next slice

1. recover RUN 020 authority around `33a5c07b...` vs `318e310f...`;
2. recover RUN 021–023 official reports;
3. reconstruct integration checkpoints backward from current `feature/workspace-v0.1`;
4. then begin targeted import of verified historical artifacts.

No bulk import is authorized yet.
