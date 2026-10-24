# DOCUMENT MIGRATION INVENTORY

status: ACTIVE
protocol_version: 1.0
phase: P6 — INVENTORY FIRST

Classification:
- AUTHORITATIVE
- SUPERSEDED
- HISTORICAL
- SUPPORTING
- DUPLICATE
- UNKNOWN

## Rules

1. Do not promote a document because its filename looks final.
2. Prefer exact GitHub/code evidence and explicit owner/QA decisions.
3. Preserve source provenance.
4. Record hashes/blob SHAs when available.
5. Do not reinterpret historical product decisions.
6. A QA guide is not an official QA verdict unless the artifact explicitly declares one.
7. Current Project Control artifacts are not re-imported as historical material.

## Verified GitHub sources — current Workspace line

The following files exist at:

`feature/workspace-v0.1 @ 4c9b0228bb47ac074c49a977b48dbf0844c33a94`

### Operational QA guides

| Source | Blob SHA | Classification | Canonical target | Notes |
|---|---|---|---|---|
| `library/RUN-012-QA.md` | `04a7ab555ea30e7497dc84d0a6b06ca6f2060a13` | SUPPORTING | historical RUN 012 record | Operational QA guide; explicitly states it does not declare PASS. |
| `library/RUN-013-QA.md` | `102c3f18c37056c0064d128cda97a8c5369ba573` | SUPPORTING | historical RUN 013 record | Variant Lifecycle QA procedure/evidence instructions. |
| `library/RUN-014-QA.md` | `f95b3a6b431d45f246b7b581cdff1c59e8d7261d` | SUPPORTING | historical RUN 014 record | Canonical Block Review/Confirmation QA procedure. |
| `library/RUN-015-QA.md` | `b39c9eb1c5b43f0f302bc504f437efd9f1a47e73` | SUPPORTING | historical RUN 015 record | Recovery/Maintenance UI QA procedure. |
| `library/RUN-016-QA.md` | verified in current Workspace tree | SUPPORTING | historical RUN 016 record | QA procedure; official disposition still requires separate evidence/artifact recovery. |
| `library/RUN-017-QA.md` | verified in current Workspace tree | SUPPORTING | historical RUN 017 record | QA procedure; not promoted to verdict. |
| `library/RUN-018-QA.md` | verified in current Workspace tree | SUPPORTING | historical RUN 018 record | QA procedure; not promoted to verdict. |
| `library/RUN-019-QA.md` | verified in current Workspace tree | SUPPORTING | historical RUN 019 record | QA procedure; not promoted to verdict. |
| `library/RUN-020-QA.md` | verified in current Workspace tree | SUPPORTING | historical RUN 020 record | QA procedure; final QA/correction lineage must be recovered separately. |

Blob SHAs for RUN 016–020 will be recorded when those files are individually reviewed during the next inventory slice.

### Technical historical documentation

| Source | Blob SHA | Classification | Canonical target | Notes |
|---|---|---|---|---|
| `workspace-server/BACKUP-RECOVERY.md` | `1cb3f54a34f7b226af22f54b94f2645122dcc037` | SUPPORTING | RUN 010 technical history | Describes Backup & Recovery behavior; not by itself an integration/QA verdict. |
| `workspace-server/ASSET-MUTATION.md` | verified in current Workspace tree | SUPPORTING | RUN 011 technical history | Asset mutation/resolution technical contract; authority relationship requires historical handoff/QA recovery. |
| `workspace-server/VARIANT-LIFECYCLE.md` | `166fabd6f3a971932dfe2e7053c36ae9da853661` | SUPPORTING | RUN 013 technical history | Variant Lifecycle service documentation; not treated as present-day control authority. |

## Verified historical Git refs

All Workspace RUN branches 001–023 still exist in GitHub. Their exact branch-head checkpoints are recorded in:

`migration/P6_BRANCH_CHECKPOINTS.md`

These refs are SUPPORTING code evidence. A branch head does not by itself establish the final QA-validated SHA, integration disposition, or canonical design artifact for that RUN.

## Material already under Project Control

Current v1.0 artifacts—including CR-0001, P5 closure, current Scope/QA/Development/Deployment artifacts and active routing—are already authoritative under `meta/project-control` and are not migration targets.

## Historical material still to recover / reconcile

The following classes are known to be relevant but are not yet promoted into Project Control history:

| Material class | Current classification | Expected source | Required P6 action |
|---|---|---|---|
| Scope 001–004 handoffs | UNKNOWN | prior chats/files | locate exact artifacts, establish chronology and supersession |
| Scope Recovery material | UNKNOWN | prior chats/files | locate and classify |
| Workspace roadmap / detailed Library design | UNKNOWN | prior chats/files | locate; determine whether historical or superseded |
| Codex/Development protocol history | UNKNOWN | prior chats/files | recover role/process history only where decision-relevant |
| RUN 001–011 implementation reports / QA verdicts | UNKNOWN | prior chats + Git history | link exact RUN branch SHAs to authoritative verdicts |
| RUN 012–020 official QA verdicts | UNKNOWN | prior chats/files | distinguish verdicts from in-repo QA guides |
| RUN 021–023 implementation/QA/integration reports | UNKNOWN | prior chats/files + Git history | recover exact candidate/final SHA lineage |
| RC correction reports around `4c9b0228...` | PARTLY RECOVERED | Project Control + prior chats | reconcile current CR-0001 provenance with pre-v1 records |
| Historical integration reports into `feature/workspace-v0.1` | UNKNOWN | prior chats/Git history | reconstruct fast-forward/merge decisions and exact SHAs |
| Pre-v1 chat lineage | UNKNOWN | Project conversation history | reconstruct predecessor/successor chain without guessing IDs |

## Next inventory slice

Priority:
1. review RUN 016–020 QA-guide blobs and record exact hashes;
2. inspect RUN 021–023 Git history and identify likely report/validation commits;
3. recover exact historical integration checkpoints for RUN 009–023;
4. then request/chat-recover missing official handoffs/verdicts only where GitHub cannot answer the question.

No bulk historical import is authorized yet.
