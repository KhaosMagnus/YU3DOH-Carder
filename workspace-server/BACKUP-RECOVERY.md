# Workspace Backup & Recovery (RUN 010)

Workspace Service exclusively owns local recovery. Database schema remains **4**;
SQL migrations 001–004 and both Yarn lockfiles are unchanged. No archive dependency
or Library UI is introduced.

## API

| Method/path | Request | Result |
| --- | --- | --- |
| `GET /api/v1/workspace/backups` | none | `{ backups: BackupMetadata[] }`, newest first; fully validated COMPLETE containers only |
| `POST /api/v1/workspace/backups` | `{ kind: "RECOVERY_POINT" \| "FULL", include_output?: boolean }` | completed metadata |
| `POST /api/v1/workspace/backups/:backup_id/restore` | none | `{ restored: true, backup_id, status }` after final inspection |
| `POST /api/v1/workspace/migrate` | none | `{ migrated, backup_id, status, ...migrationResult }`; current schema is a no-op |

`include_output` defaults to false and is only valid for FULL. Management routes
remain available without operational persistence. Backup/migration require READY
or NEEDS_MIGRATION as applicable. Restore validates compatibility independently
of a corrupt, missing, invalid or newer active database. A readable active
`workspace_id`, including from an otherwise invalid manifest, must match.

Stable recovery error codes are defined in `src/recovery/errors.ts`. Missing backup:
404; identity/maintenance conflict: 409; invalid/incomplete/incompatible/unsafe
backup: 422; operational failures: 503. A retention error is reported visibly,
even if its newly completed backup was already published; it does not undo or
hide that complete recovery point. No endpoint silently downgrades a newer schema.

## Format 1

```
Backups/<uuid>/backup.json
Backups/<uuid>/payload/workspace.json
Backups/<uuid>/payload/<exact safe relative database_path>
Backups/<uuid>/payload/Config/...
Backups/<uuid>/payload/Assets/...  # FULL only
Backups/<uuid>/payload/Output/...  # FULL, explicitly requested
```

The manifest retains its database_path. Inventory paths use portable `/` separators.
The metadata includes format and backup IDs, kind, logical Workspace identity,
Workspace/database versions, UTC creation time, origin/reason, Output flag,
included/excluded roots, source DB path, file path/byte-size/SHA-256 inventory,
COMPLETE state, and protection state. Directory inventory preserves empty
subdirectories. Missing Config/Assets/Output sources are explicitly recorded as
`absent_source_roots` and represented by empty backup directories when included.

RECOVERY_POINT contains manifest, DB, and the complete Config subtree. FULL adds
Assets and optionally Output. Temp and recursive Backups history are never walked.
If a DB is inside an included subtree, the live DB and sidecars are excluded from
filesystem copying and replaced by its online snapshot. Recovery management roots,
manifest collisions, device names, traversal, alternate data streams, Windows
aliases and filesystem links/junctions are rejected with controlled errors.

`WorkspacePersistence.backupTo()` owns better-sqlite3's SQLite online backup. It
converts only the resulting snapshot to standalone DELETE journal mode, so the
published payload has no WAL/SHM dependencies. The active database is never copied
as a raw file or changed to DELETE journal mode.

Backup builds under `Backups/.staging/<uuid>`, computes all integrity entries,
validates inventory, identity, SQLite quick_check and migration history, and
publishes by same-parent directory rename. Failed staging is cleaned safely or
remains hidden; it is never enumerated as a recovery point.

## Maintenance and runtime ownership

A WorkspaceRuntimeManager owns current status, persistence and all dependent
services. Service getters and routes resolve its current runtime. Public service
calls are guarded, including async asset scan, managed ingest, Library mutations
and all Canonical mutators. Leases last until promise settlement. New destructive
service entrypoints must be registered as mutation methods in the runtime owner;
repository transactions also enforce the mutation guard. Raw repository callbacks
run query-only during BACKUP to prevent accidental SQLite writes.

- NORMAL: ordinary operations.
- BACKUP: mutations blocked; reads allowed. Refuses entry with an in-flight mutation.
- MIGRATION: exclusively owns mutations and blocks ordinary data operations.
- RESTORE: blocks ordinary Workspace data operations. Status/listing remain available.

Exclusive maintenance refuses to begin with an in-flight read or mutation rather
than canceling that operation or closing its database underneath it. HTTP read
leases cover complete responses, including asynchronous Carder asset reads.

## Restore transaction

1. Fully validate COMPLETE metadata, paths, exact file/directory inventory, every
   size/hash, manifest identity/format, DB schema/readability/integrity/history.
2. Copy to `Temp/Restore/<operation>/incoming` and verify staged hashes again.
3. Acquire exclusive RESTORE and recheck active identity; reject unsafe active paths.
4. Persist ACTIVE `restore-state.json`, close current persistence, and move affected
   components and SQLite sidecars into `previous`.
5. Install incoming components by directory/file rename; record each moved/installed
   component in the operation marker.
6. Reinspect and build fresh persistence and domain services. Old connections are
   closed; pre-restore Carder grants are revoked. Current schema must inspect READY;
   an older compatible checkpoint must inspect NEEDS_MIGRATION.
7. Mark success, resolve earlier interrupted markers without deleting their recovery
   material, then reinspect again without a marker override before returning success.

A lightweight restore changes only manifest, DB and Config. Assets and Output are
untouched. FULL replaces Assets; Output only when included. No implicit asset scan.
A changed DB path also removes the old active DB/sidecars into recovery material.

Any failure after closing persistence attempts reverse-order rollback and fresh
inspection. If valid resulting state cannot be proven, runtime becomes
RECOVERY_REQUIRED, connections are closed, and recovery material/ACTIVE markers
are preserved. Startup will not declare an otherwise valid DB READY with unresolved
restore markers. Recovery requires an explicit validated restore, not automatic
marker replay. Successful and rolled-back operation material is retained in Temp
for diagnosis and is excluded from every backup.

## Migration and retention

External orchestration is the Workspace migration endpoint, not the lower-level
migration function. It requires NEEDS_MIGRATION, creates and publishes a coherent
RECOVERY_POINT with PRE_MIGRATION origin and MIGRATION_PENDING protection before
calling ordered migrations, then inspects schema/history and rebuilds runtime.
A checkpoint failure prevents any schema mutation. Success makes protection NONE;
failure retains MIGRATION_FAILED (or pending if the metadata update itself fails).
The lower-level migration/bootstrap primitives remain internal building blocks
and preserve their existing tests.

`YU3DOH_AUTOMATIC_RECOVERY_POINT_RETENTION` (or
`automaticRecoveryPointRetention` service config) defaults to **10** and accepts
non-negative integers. Only COMPLETE, PRE_MIGRATION, unprotected RECOVERY_POINTs
are pruned. FULL/manual/protected/staging containers are never automatically pruned.
Zero disables keeping ordinary automatic points, not protected points.

## Validation

```
yarn install --frozen-lockfile --non-interactive
yarn compile
yarn build
yarn test:sc
yarn test:library
yarn --cwd workspace-server install --frozen-lockfile --non-interactive
yarn --cwd workspace-server compile
yarn --cwd workspace-server test
```

`test/recovery.test.ts` tests WAL coherence, inventories, custom/Unicode paths,
checkpoint exclusivity, restore identity/tamper/partial rejection, runtime reload,
partial moves/publishes and rollback, interrupted/corrupt DB recovery, migration
sequencing/protection, retention, unsafe links/junctions and API errors. Constructor
hooks inject failures at DB snapshot, Config/Asset copy, metadata finalization,
backup rename, restore validation, active move, incoming publish, runtime reopen,
post-restore inspection, migration after checkpoint and retention cleanup. Hooks
are not configurable via HTTP or environment variables.

`.github/workflows/workspace-run-010.yml` runs root checks, Workspace compilation,
full suites and hygiene on Linux and Windows for the exact pushed RUN SHA. It has
read-only repository permissions and cannot advance integration or main.
