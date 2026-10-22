---
artifact_id: P6-HISTORICAL-MIGRATION-PLAN
artifact_type: migration_plan
status: FROZEN
protocol_version: "1.0"
source_role: PROJECT_CONTROL
source_instance: PC-001
control_parent_sha: a9c3ed634dcd5edd9066c806e973c2d1ce605a31
---

# P6 — Historical Documentation Migration Plan

## Status

`OPEN — INVENTORY FIRST`

## Objective

Bring historically relevant project documentation and chat lineage under Project Control without interrupting current product work or falsely promoting historical material to current authority.

## Priority order

1. Current architecture/scope documents still capable of affecting present decisions.
2. Recent RUN/RC handoffs, QA verdicts and integration records linked to the current Workspace baseline.
3. Deferred owner requests and their historical disposition evidence.
4. Chat lineage necessary to recover predecessor/successor context.
5. Older supporting/historical material.
6. Duplicates and low-value transcript-like material last.

## Classification

Every imported item must be classified as one of:
- AUTHORITATIVE
- SUPERSEDED
- HISTORICAL
- SUPPORTING
- DUPLICATE
- UNKNOWN

Filename alone never establishes authority.

## Migration rule

Historical content is not rewritten to look current.

Imported material must retain:
- original role/source when known;
- original code SHA/branch when known;
- original status/verdict;
- supersession relationship;
- uncertainty where evidence is incomplete.

## Codex role

Codex may assist with:
- inventory;
- hashes;
- duplicate detection;
- metadata extraction;
- proposed mapping.

Codex does not decide canonicity.

## P6 first deliverable

Produce an evidence-backed inventory of historical documents/chats relevant to the current Workspace line before bulk migration.

No bulk import is authorized until the inventory is reviewed by Project Control.
