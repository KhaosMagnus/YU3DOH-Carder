# Variant Lifecycle service — RUN 013

Schema 6 adds `card_variant_preferences`, separate from Canonical identity/revision. A composite foreign key enforces same-card Preferred ownership. Migration 006 performs no preference backfill. Only explicit Managed Ingest or resolver creation of the first variant on a zero-variant card initializes Preferred. Passive indexing never initializes it; additional creation and Clear do not invent a fallback.

The existing opaque Asset state token additionally includes variant display labels and preference rows. Variants GET returns `card_id`, `preferred_variant_id`, `expected_state_token`, and server-authoritative variants/readiness.

| Method | Route under `/api/v1/library` | Body |
|---|---|---|
| POST | `/cards/:card_id/preferred-variant` | `preferred_variant_id` (ID or null), `expected_state_token` |
| POST | `/variants/:variant_id/rename-preview` | `variant_key`, `display_label` |
| POST | `/variants/:variant_id/rename` | same proposal plus `expected_state_token` |
| POST | `/variants/:variant_id/remove-preview` | none |
| POST | `/variants/:variant_id/remove` | `expected_state_token`, optional `acknowledge_preferred_clear` |

Previews use persisted authoritative index state and ordinary read leases. Set Preferred, Rename and Remove use the existing mutation/maintenance guard. Rename/Remove check the token, physically reconcile, compare the token again, stage/preserve, publish filesystem changes, commit DB changes, reconcile and verify postconditions before reporting success.

Each structural operation retains a marker, domain snapshot and actual managed recovery bytes in `Temp/VariantLifecycle/<operation_id>/`. Managed moves verify actual byte hashes, including invalid material. Compensation restores owned files and domain snapshot and removes newly created empty managed destination directories. If prior coherence cannot be proven, runtime and restart detection require recovery. Explicit validated Restore resolves older interrupted lifecycle markers through the existing recovery mechanism.

Rename preserves variant/card/preference/managed/indexed identities. Key changes explicitly ASSIGN current unmanaged members to preserve association across Rescan without renaming those files. Remove retires managed ownership and uses IGNORE only for retired managed history; preserved unmanaged members become UNASSIGN. Preferred clear and variant deletion share the same DB transaction. Both successful structural operations revoke affected Carder capabilities; Canonical metadata is untouched.
