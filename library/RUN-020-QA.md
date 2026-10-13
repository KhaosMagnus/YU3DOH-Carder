# RUN 020 — External Source Ingestion Phase 1

Baseline: `e83de9793c26f78834f748b320161a168943d4ed`.
Branch: `feature/workspace-run-020`. Database schema 7; Workspace format 1.

Only `YGORESOURCES_CARD_DB` is supported. Retrieval is disabled by default. To enable it explicitly in Workspace Service, set `YU3DOH_ENABLED_EXTERNAL_SOURCES=YGORESOURCES_CARD_DB` (or the equivalent `enabledExternalSources` service configuration). This setting enables the provider only.

Open an existing Library card, then **External Sources**. Enter its explicit provider card ID and use **Retrieve**. Opening the card or this section only reads local state. Existing snapshots can be opened without a provider request. **Re-retrieve** appends a new retrieval/document/candidate; it does not overwrite the previous snapshot. Candidate fields and raw evidence are non-authoritative. **Compare with this card** uses the server's persisted Canonical revision, including when the editor has unsaved changes. There is no Apply, Import, matching, search, bulk or sync action.

## Deterministic validation

Run the existing root compile/build, test:sc and test:library commands, and the complete workspace-server compile/test commands. The Workspace suite now includes `test/external-sources.test.ts`; test:library includes the RUN 020 client contracts.

`workspace-server/test/fixtures/ygoresources-card-v1.json` is a synthetic, frozen contract fixture, not a claim of a successful live provider retrieval. All normal tests and the Ubuntu/Windows Actions matrix use mocked HTTP, never live provider access.

The RUN 020 Actions workflow also executes all existing RUN 012–019 operational UI regressions and `scripts/run020-operational-qa.cjs`. Browser tooling is isolated from product dependencies. Evidence contains the exact tested SHA, screenshots, network requests and database snapshots. Existing Windows junction/path tests remain enabled.

## Live operational smoke

After compiling workspace-server, choose a unique subset of the four approved IDs explicitly:

```sh
YU3DOH_QA_OUTPUT=/absolute/path/outside-checkout node scripts/run020-live-smoke.cjs 4007 11213 13036 17625
```

This tool creates a disposable Workspace and uses the production Workspace Service/API and adapter. It performs at most one request per selected fixture, with no retries, search, crawling or ID enumeration. Do not repeat an ID to work around a failed attempt. Output includes retrieval packages, raw evidence when available, hashes, authoritative-domain immutability and the adapter/normalizer/service code hashes.

Live transport/provider failures are reported separately from deterministic correctness. They do not constitute a successful live-source validation or an automatically granted QA waiver. External Design + QA owns final acceptance and any documented outage waiver.

## Boundaries and recovery

Migration 007 contains only the four frozen STRICT External Source tables and required history indexes. Migrations 001–006 and dependency/lockfile metadata are preserved. No source-registry table is added.

Retrieval releases its read lease before network I/O and acquires mutation ownership only for publication. No SQLite transaction spans the network. Publication against closed or replaced persistence fails with zero publication rows. Candidates and their diagnostics are published atomically with the retrieval and document. Failed retrieval packages have no candidate.

No Canonical writes, revision bumps, confirmation transitions, provenance, Relations, Asset, Variant or Carder writes are performed by this capability. Backups naturally include External Source rows in the existing SQLite snapshot. A valid schema-6 restore remains NEEDS_MIGRATION until explicit migration 007.

Review the exact final SHA and the consolidated Implementation Report. RUN 020 must not be integrated without a separate administrative authorization.
