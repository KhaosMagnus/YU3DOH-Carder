# RUN 015 — Workspace Recovery & Maintenance UI QA

Baseline: `fd13018c881f63764efb60bc1c88b4eb0a400018`.
Implementation branch: `feature/workspace-run-015`. Schema: **6**, no migration.

Workspace Service is authoritative for status, compatibility, backup publication, restore,
rollback, migration and maintenance coordination. This RUN adds client UI/contracts only.
Production Workspace server code, migrations, dependencies and lockfiles remain unchanged.

## Management flow

Use **Workspace** in the Library header or Card Detail toolbar. It remains available outside
READY and when the service is unavailable. Identity uses the Workspace name and logical ID.
Retry refreshes status and completed backups. Backup order follows the server; protected
PRE_MIGRATION checkpoints have a separate protection badge.

Create Backup offers Recovery Point or Full, with Output selectable only for Full. Unsaved
Canonical edits are explicitly excluded. Backup never saves/discards/closes that editor.
Every attempt refreshes status and the backup list, including an HTTP failure after publication.

Restore opens a destructive summary. Dirty editor state requires explicit discard acknowledgement.
Migration appears only for NEEDS_MIGRATION, requires confirmation, and uses the same dirty fence.
The client never creates a migration checkpoint. Service results, checkpoint ID and every
maintenance warning are presented independently; a warning does not negate migration success.

All maintenance operations fence new Library mutations. Restore/Migration also prevent new
ordinary Library reads, clear transient mutation surfaces, discard acknowledged local state,
and invalidate browse/facets/detail/variants/resolver/Needs Attention via a generation and request
epoch. After every attempt status is refreshed, and READY data is rebuilt before mutations resume.
Old async responses cannot restore pre-operation browse/facet/Needs Attention data.
RECOVERY_REQUIRED is persistent; Workspace management remains reachable.

## Deterministic validation

`yarn test:library` executes `scripts/test-workspace-management.ts` alongside previous RUN
contracts. RUN 015 checks real client orchestration and HTTP payloads, including failure refresh,
discard gating, invalidation ordering, migration warnings and concurrent request prevention.
It does not duplicate server compatibility logic.

Required commands (Node 24.19.0 / Yarn 1.22.22):

```sh
yarn install --frozen-lockfile --non-interactive
yarn compile
yarn build
yarn test:sc
yarn test:library
yarn --cwd workspace-server install --frozen-lockfile --non-interactive
yarn --cwd workspace-server compile
yarn --cwd workspace-server test
```

## Isolated operational browser QA

Install `playwright-core@1.58.2` outside application dependencies. Set NODE_PATH to that
installation's node_modules; install Chromium using its CLI, or provide
YU3DOH_QA_CHROMIUM pointing to an installed Chromium. YU3DOH_QA_OUTPUT must point outside
this checkout. Then run:

```sh
node scripts/run015-operational-qa.cjs
```

The launcher rejects an occupied Workspace service port. It creates a disposable root with
spaces/Japanese characters, serves only loopback, starts Library and destroys its own fixture.
No user Workspace is opened. QA-only routes and constructor hooks exist exclusively in the
fixture script; no production route or recovery semantic is added.

Evidence contains HEAD SHA, OS, root/logical identity, scenario results, actual requests,
page errors and screenshots. All scenarios must pass with zero skips:

| Scenario | Contract |
|---|---|
| QA-01 | READY status and logical identity; no Migration action |
| QA-02 | Completed backup metadata, protection badges, server order |
| QA-03 | RECOVERY_POINT exact payload; no Output option |
| QA-04 | FULL with include_output false |
| QA-05 | FULL with include_output true, included Output root |
| QA-06 | Dirty backup warning; unchanged persisted revision and intact local form |
| QA-07 | Cancel backup sends no mutation |
| QA-08 | Complete Restore summary; cancellation preserves persisted state |
| QA-09 | Dirty Restore cannot submit before acknowledgement |
| QA-10 | Real Restore; stale detail removed, dirty edits never saved |
| QA-11 | Valid old schema Restore yields NEEDS_MIGRATION and blocks Library |
| QA-12 | Backup made incompatible after listing: server error, no false success |
| QA-13 | Persistent RECOVERY_REQUIRED, management and Restore accessible |
| QA-14 | Explicit Migration eligibility outside READY |
| QA-15 | Dirty Migration acknowledgement; no automatic Save |
| QA-16 | Actual migration to schema 6/READY, checkpoint ID and client invalidation |
| QA-17 | Actual post-success retention warning with migration success retained |
| QA-18 | Failed migration with unprovable disposable DB, authoritative recovery block |
| QA-19 | Held real Backup: Save/New Draft disabled, no Canonical PATCH |
| QA-20 | No Initialize/Switch/path/delete/export/cloud controls |
| QA-21 | Held real Restore: no fresh ordinary Library requests |
| QA-22 | Backup published before retention error remains listed after refresh |
| QA-23 | Unavailable service remains distinguishable, Retry recovers status |
| QA-24 | Failed authoritative Library reload keeps mutations fenced until successful Retry |

The RUN 015 Actions workflow runs the full command matrix on ubuntu-latest and windows-latest,
including the unmodified server recovery suite and real Windows junction coverage. It also
retains RUN 012 (30 scenarios), RUN 013 (23), RUN 014 (14) and RUN 015 browser evidence against
separate disposable fixtures. Artifacts are named with OS and exact commit SHA.

## Boundaries

No Initialize, Workspace switching, host path selector, backup deletion/pruning/export/cloud,
schema 7, new persistence, global Canonical state, Rank/Pendulum change, generic empty variant,
Carder save-back or new production dependency. Development does not integrate this RUN or start
RUN 016. External Design + QA accepts the final exact SHA.
