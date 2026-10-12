# RUN 016 — Single-Workspace Initialization QA

Baseline: `191454d44f3273cf2efba254bddd8ba5275a08aa`.
Branch: `feature/workspace-run-016`. Schema **6**, Workspace format **1**, no migration 007.

The process still owns exactly one externally configured, immutable workspaceRoot. The existing
YU3DOH_WORKSPACE_ROOT/config override selects it before service construction. Initialize never
accepts a root, ID, name, version or database path from the browser.

## Server algorithm

The initialization owner uses runtime.workspaceRoot and the existing coordinator's exclusive
INITIALIZATION lease. Current eligibility and a fresh inspection inside that lease must both
be NEEDS_INITIALIZATION. Missing ancestors/root are created exclusively and tracked; the root
is revalidated as a real empty directory immediately before owned artifacts are created.
Existing noLinks semantics reject root/ancestor symlinks and Windows junctions.

A private, exclusively created `.initialization-<uuid>` directory under the configured root
stages the DB. Existing bootstrapWorkspaceDatabase(root, staged-manifest-path) applies untouched
SQL 001–006 and configures/cleans SQLite. Its existing DB refusal is retained. This is temporary
operation material, not a journal, persistent recovery model or new validity requirement.

Data is created exclusively. Validated staged DB bytes are published to Data/workspace.db using
an exclusively opened `wx+` descriptor; existing files cannot be replaced. Staging is removed
only when owned/unchanged/empty. workspace.json uses the same exclusive descriptor publication,
complete write/fsync/close; there is no rename over destination. Identity and ISO timestamp are
server-generated, database_path is relative, and optional name is absent.

The existing runtime.reload reconstructs persistence and all dependent services, revoking the
old grant registry. Strict READY/read_only=false/generated-ID/format-1/schema-6/persistence
postconditions and published file ownership/content proofs are required before success.

On handled failure, close persistence and remove only files with matching ownership/content
proofs. Partial exclusive writes can be proven via their descriptors. Remove tracked directories
only when still owned and empty, in reverse order. Never recursively delete foreign content.
Reinspect/reload to publish the actual resulting lifecycle. Unproven/replaced/modified artifacts
are preserved, and the root may become INVALID_WORKSPACE or RECOVERY_REQUIRED.

POST /api/v1/workspace/initialize accepts exactly {} with additionalProperties:false. Errors
remain inspectable: NOT_ALLOWED 409, UNSAFE 422, FAILED 500, MAINTENANCE_ACTIVE 409. Initialize
is not repair, restore, migration or takeover. Optional Assets/Config/Backups/Temp/Output remain
optional. No initialize journal or automatic interrupted-operation recovery is introduced.

The only recovery-owner adjustment rejects Restore validation/staging while INITIALIZATION
is active; behavior in existing modes is unchanged. This makes all management writes share the
existing coordinator rather than inventing another lock.

## Client / operational checks

Workspace Management exposes Initialize only in NEEDS_INITIALIZATION. Opening/refreshing does
not initialize. Explicit confirmation explains configured-location initialization and new identity,
without path input. Dirty browser state requires acknowledgement; no Save is issued. App invalidation
precedes the request, INITIALIZATION fences ordinary reads/writes, and every attempt refreshes
status/backups. READY Library data must rebuild before edits resume. Server success survives a
client rebuild failure; editing remains blocked until successful Retry.

Deterministic checks run through existing yarn test:library. Server initialization tests are
included in the complete Workspace test script. Dependencies/lockfiles are unchanged; only the
Workspace package test script is extended to include the new file.

Run required validation using Node 24.19.0 / Yarn 1.22.22:

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

Install playwright-core 1.58.2 outside application dependencies; point NODE_PATH at its node_modules.
Use its installed Chromium or set YU3DOH_QA_CHROMIUM. Set YU3DOH_QA_OUTPUT outside the checkout.

```sh
node scripts/run016-operational-qa.cjs
```

The launcher rejects an occupied service port. Only disposable fixtures are opened, with a
stable root containing spaces/Unicode. QA-only reset/mode/fs helpers exist in the fixture file,
never production. Reset simulates external filesystem/service changes at the same configured root;
it does not switch roots. Evidence records exact SHA, platform, logical/physical fixture identity,
actual filesystem hashes/text, HTTP requests, page errors and screenshots.

| Case | Required evidence |
|---|---|
| QA-16-01 | NEEDS_INITIALIZATION reachable; open/refresh performs no initialization |
| QA-16-02 | Explicit confirmation cancelled; no POST and unchanged missing root |
| QA-16-03 | Missing root -> READY; manifest and DB physically present; configured root unchanged |
| QA-16-04 | Empty spaces/Unicode root -> READY; distinct generated ID |
| QA-16-05 | Non-empty unknown root INVALID; original bytes preserved |
| QA-16-06 | Previously eligible root changed before POST rejected; foreign bytes preserved |
| QA-16-07 | Dirty stale form blocks submission without acknowledgement, zero PATCH |
| QA-16-08 | Acknowledged initialization clears stale detail/browse; fresh empty Library |
| QA-16-09 | Controlled post-bootstrap failure cleans owned files; non-READY, no false success |
| QA-16-10 | Failed operation with foreign file preserves only that file |
| QA-16-11 | Existing maintenance returns MAINTENANCE_ACTIVE without partial initialization |
| QA-16-12 | Generated ID, READY, format 1, schema 6 and no host-path identity |
| QA-16-13 | Successful server init + failed Library reload remains fenced; Retry rebuilds without another Initialize |
| QA-16-14 | No root selector/input, Launcher, Locate, Switch or multiple-Workspace controls |
| QA-16-15 | Held real INITIALIZATION lease; no fresh ordinary Library reads |

Exact-SHA Actions runs all commands on ubuntu-latest/windows-latest, the unweakened previous
server suites, real Windows junction tests and all operational RUN012–016 regressions. Per-OS
artifacts contain evidence.json and screenshots.

## Boundaries / residual limits

External filesystem processes cannot be globally locked. Repeated path/ownership/content checks
and exclusive publication handle detected races without overwriting unknown content. Cleanup
preserves anything not proven operation-owned. Abrupt OS termination has no new persistent journal
or automatic retry; normal inspection exposes the actual disk state. Initialization is explicit,
single-root, server-owned; no schema/dependency change, Switch/Launcher/path picker, Carder write-back,
global Canonical state, Rank/Pendulum change or generic empty Variant is added.

Development returns READY FOR EXTERNAL DESIGN + QA. Integration/main refs remain preserved.
No RUN017 or later work is authorized by this RUN.
