# RUN 011 — Asset mutation and resolution foundation

Workspace Service owns resolution persistence, physical mutations, reconciliation and final composition readiness. Schema 5 adds only `asset_resolution_overrides`; migrations 001–004 are unchanged. A schema-4 Workspace uses the existing explicit migration orchestration and receives a pre-migration recovery point before 005.

## HTTP boundary

All routes are under `/api/v1/library`, require a READY Workspace and expose semantic error bodies `{ code, message }`.

| Method/path | Contract |
| --- | --- |
| GET `/assets/resolution-state` | Persisted assets, variants, dispositions and `expected_state_token`; no implicit scan. |
| POST `/assets/resolution-state/refresh` | Reconcile current physical files and return current state/token. |
| GET `/cards/:card_id/variants` | Existing authoritative readiness plus current role candidates and token for each role. |
| POST `/assets/resolve` | Explicit ATTACH, MOVE, CHOOSE, UNASSIGN or LEAVE. |
| POST `/managed-assets/:managed_asset_id/preview` | Read-only body `{ operation: REPLACE\|REMOVE\|RELINK, source_file?, asset_id? }`; affected slot, managed identity, candidates, stable persisted-state token, preservation policy, and server-authoritative readiness before/after. REPLACE requires exactly one source; REMOVE accepts none; legacy RELINK preview remains source-free. |
| POST `/managed-assets/mutate` | REPLACE, RELINK or REMOVE with an expected token. |

Resolution body: `operation`, `expected_state_token`, `asset_id`, and (for assignment) `role` with either `variant_id` or `create_variant: { card_id, variant_key, display_label? }`. Explicit creation is available only inside a successful resolution. It requires an existing Canonical card. No generic empty-variant endpoint or automatic Canonical creation exists. Occupied destinations require explicit conflict resolution. Managed conflict losers remain eligible for explicit reassignment through the same persisted override mechanism; managed physical ownership is retained. A managed physical mutation requires the indexed association to agree with its ownership slot. UNASSIGN has no target. LEAVE writes nothing, including no scan or override.

CHOOSE requires the selected asset to be a candidate in the exact current variant/role conflict. The winner receives ASSIGN and **every** other current candidate receives UNASSIGN. Losers keep their bytes/history, appear as unresolved and remain available to ATTACH/MOVE. Rescans and restarts preserve these dispositions. IGNORE is reserved for sources explicitly superseded by a successful managed operation.

Preview uses the persisted authoritative index and the same server composition rules as reconciliation. It creates no scans, diagnostics, bindings, overrides, recovery material or asset files. REPLACE validates the selected regular file, safe path, supported format, decode, target role and usable OF transparency without publishing; indexed sources must exist, be present and match their persisted physical fingerprint. REMOVE simulates the target role absent; REPLACE simulates a validated successful replacement in the same role. Other persisted roles remain unchanged. Repeated previews of unchanged state return the same opaque token. Preview uses the normal read lease (including availability during BACKUP); refresh/resolve/mutate keep mutation fencing. Execution still reconciles/revalidates physical state and compares the expected token before mutation. External source files are revalidated during execution; indexed target/source changes invalidate the Asset-domain token.

Managed mutation body: `operation`, `expected_state_token`, `managed_asset_id`, and exactly one `source_file` (absolute path) or source `asset_id` for REPLACE/RELINK. REMOVE accepts no replacement source. Optional `card_id`, `variant_id`, `role` are identity assertions, never alternate destinations; a mismatch returns `ASSET_TARGET_IMMUTABLE`. REPLACE/REMOVE require existing managed ownership.

RELINK repairs a missing/broken slot at the same card/variant/role and publishes validated content into `Assets/Managed/<card_id>/<variant_key>/<role>.<extension>`. An existing missing/broken unmanaged indexed target with known identity can instead be selected by `target_asset_id`; that successful repair establishes managed ownership for its existing slot. The original broken unmanaged bytes, when present, are copied into recovery material and remain physically untouched. Historical target association is retired with IGNORE.

Indexed sources are copied, never implicitly moved or unbound from an unrelated slot. An indexed source still bound to the repaired slot is explicitly retired with IGNORE after adoption, avoiding an immediate duplicate while preserving its physical file. Missing/invalid/unsafe files cannot be made valid by ASSIGN. OF still requires a validated PNG with usable transparency.

## Concurrency and recovery

Tokens are process-specific opaque HMACs over the authoritative asset domain, including physical fingerprints, bindings, managed ownership and override revisions. They do not use Canonical revision. This conservative foundation invalidates tokens for **any** changed asset-domain state, including unrelated slots and ABA override transitions. Clients refresh after `409 ASSET_STATE_STALE` or runtime replacement. Mutations reconcile physical state before checking tokens. An unchanged Rescan does not invalidate a token.

The runtime maintenance coordinator serializes mutations across services, retains the lease across asynchronous staging/reconciliation and permits nested calls only in the owning async context. Concurrent operations fail with `409 WORKSPACE_MAINTENANCE_ACTIVE`; backups/restores cannot start during mutation. Readers cannot inspect an intermediate mutation. Existing backup mode retains its read availability and all RUN 010 semantics.

Each mutation retains `Temp/AssetMutation/<operation_id>/operation.json`, previous asset-domain DB rows and previous physical content where present. Managed files are moved into recovery material; replacement sources are staged and validated before publication. Success follows validation, staging, preservation, publication, DB mutation, reconciliation and authoritative postcondition verification. No success is emitted earlier. Success does not prune recovery material.

On failure, new publication is preserved as `failed-publication`, previous managed bytes are restored and the asset-domain DB snapshot is reinstated and verified. A proven rollback yields `ASSET_MUTATION_FAILED` (503), or the original semantic rejection. An unprovable rollback yields `ASSET_MUTATION_RECOVERY_REQUIRED` (503), closes operational persistence and fences the runtime. Startup treats incomplete/unreadable/unsafe operation markers as recovery-required. Recovery material is retained for explicit recovery; this foundation does not add an automatic interrupted-operation repair or a cleanup service.

Errors include `ASSET_STATE_STALE` (409), `ASSET_SLOT_OCCUPIED` / `ASSET_DESTINATION_OCCUPIED` (409), `ASSET_NOT_FOUND` (404), source/role/target validation errors (422), and mutation/recovery failures (503). Carder content additionally requires the current authoritative role binding: unchanged bytes alone cannot keep a removed/unassigned source grant usable.

## Validation

`yarn --cwd workspace-server test` includes RUN 011 service/API, real schema-4 migration, explicit addendum regressions, physical compensation failure boundaries, real directory-link/junction coverage, stale grants and maintenance fencing, alongside all existing suites. `.github/workflows/workspace-run-011.yml` runs the complete required root and Workspace checks on Linux and Windows.
