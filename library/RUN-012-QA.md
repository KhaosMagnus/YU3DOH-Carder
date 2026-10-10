# RUN 012 — operational External QA

Baseline: `1f4b93ee9a3c322b808e8db3f87076b95d6f8d2e`. Implementation branch: `feature/workspace-run-012`.
External Design + QA owns acceptance; this guide does not declare PASS.

## Start the real Library against isolated data

Use Node 24.19.0 and Yarn 1.22.22. From the repository root:

```sh
yarn install --frozen-lockfile --non-interactive
yarn --cwd workspace-server install --frozen-lockfile --non-interactive
yarn --cwd workspace-server compile
node scripts/run012-qa-fixture.cjs
```

The fixture starts Workspace Service on port 4312 and prints its temporary root, card IDs, managed IDs, and source paths. It always creates its own new temporary Workspace; it never accepts or opens an existing user Workspace. Production Workspace startup remains `YU3DOH_WORKSPACE_ROOT=<absolute-root> yarn --cwd workspace-server start` (on PowerShell set `$env:YU3DOH_WORKSPACE_ROOT` first).

In a second terminal from the repository root:

```sh
yarn dev --host 127.0.0.1 --port 3000 --strictPort
```

Open the Library at `http://127.0.0.1:3000/ygocarder/library/`. The existing Vite proxy forwards `/api/v1` to Workspace Service. No upload/file browser is provided: copy a printed absolute source path into the resolver, or choose a current indexed asset.

Fixtures:

- **QA Managed**: managed BS + BG + transparent OF in Default. Replace each role, inspect server before/after readiness, cancel Remove, then confirm Remove. BS removal must use server Standard BG+OF; BG removal must keep Standard BS and Overframe BS+OF.
- **QA Broken**: managed missing BS. Relink must keep card/Default/BS fixed; it must state that source validation occurs at execution. A nonexistent source must fail without optimistic success. Then repair with the printed BS path.
- **QA UnmanagedMissing**: missing indexed BS with known slot identity; resolver uses `target_asset_id` RELINK with no fabricated managed ID/preview.
- **QA Conflict**: Default BS has A/B/C, with no winner selected. Other variant exists. MOVE one candidate to Other/BS, then CHOOSE from the remaining conflict. Check that losers are physically present, UNASSIGN, and actionable in Needs Attention after refresh. LEAVE is an explicit no-op; Cancel calls no resolution endpoint.
- **12999999-Attach**: unresolved image with parsed hints. Search for an existing card, choose a variant and explicit role, review, then confirm Attach.
- **12999999-NewVariant**: unresolved image for explicit variant creation within ATTACH. No standalone empty-variant action exists.
- **12999999-Draft**: choose SPELL and password `12999999`, role BS, target variant `Explicit`. Review Create Draft + Attach is read-only. Confirm protection + Draft creation first applies UNASSIGN and then creates one matching-password Draft. Before Attach, verify the source remains unassigned and the Draft has no Default or Explicit variant, even after Rescan. Review and confirm Attach separately. Failed Attach preserves the Draft, UNASSIGN and zero variants; retry only Attach to the same Draft. If protection fails, no Draft is created. If Draft creation fails, the protected source remains unassigned; explicitly retry creation.
- Printed OF source is transparent. Printed opaque source must fail OF Replace preview. Relative/unsafe paths must be rejected by service.

After a successful mutation, UI reads persisted views; no general Rescan is required to repaint. Existing Rescan Assets remains available as an explicit user action. Current Card Variants, Needs Attention and browse readiness refresh; unsaved Canonical edits are retained. Open in Carder uses the refreshed variant bindings and the existing server grants. No save-back exists.

## Safe fault controls — disposable harness only

The following controls exist only in `scripts/run012-qa-fixture.cjs`, never in production Workspace routes. All bind to loopback and affect only newly seeded temporary data. Do not use them against a user Workspace.

```sh
# Change the managed BS bytes after Replace preview, before Confirm.
# Confirm must produce ASSET_STATE_STALE, preserve source selection, refresh,
# and require another preview/confirmation without automatic replay.
curl -X POST http://127.0.0.1:4312/_qa/change-target

# Fail at the service's existing database phase hook; rollback succeeds.
# Arm only AFTER protection + Draft creation, before confirming Attach.
# Verify Draft retained, source UNASSIGN, no automatic/requested variants; retry same card.
curl -X POST http://127.0.0.1:4312/_qa/fault/attachment
curl -X POST http://127.0.0.1:4312/_qa/fault/none

# Fail database phase AND rollback. This deliberately fences only the disposable
# Workspace as RECOVERY_REQUIRED. Run last; a new fixture process is needed afterward.
curl -X POST http://127.0.0.1:4312/_qa/fault/recovery
```

PowerShell equivalent: `Invoke-RestMethod -Method Post -Uri <url>`. Recovery must block the resolver and remain visibly blocked after Cancel. No mutation retry is automatic. Check Workspace status explicitly after recovery; functionality remains fenced until READY.

Stop fixture and Vite with Ctrl+C. Fixture cleans its temporary Workspace on graceful shutdown. On Windows forced process termination may leave the named temporary fixture directory; it contains only generated QA data.

## Deterministic real-browser evidence

The browser tool is a pinned **external QA tool**, installed outside the repository. No application dependency or lockfile change is needed. Stop any service occupying ports 4312 and 3000 before the orchestrated run.

POSIX:

```sh
npm install --prefix /tmp/run012-ui-tools --no-audit --no-fund playwright-core@1.58.2
node /tmp/run012-ui-tools/node_modules/playwright-core/cli.js install chromium
NODE_PATH=/tmp/run012-ui-tools/node_modules YU3DOH_QA_OUTPUT=/tmp/run012-ui-evidence node scripts/run012-operational-qa.cjs
```

PowerShell:

```powershell
$tools = Join-Path $env:TEMP 'run012-ui-tools'
npm install --prefix $tools --no-audit --no-fund playwright-core@1.58.2
node (Join-Path $tools 'node_modules/playwright-core/cli.js') install chromium
$env:NODE_PATH = Join-Path $tools 'node_modules'
$env:YU3DOH_QA_OUTPUT = Join-Path $env:TEMP 'run012-ui-evidence'
node scripts/run012-operational-qa.cjs
```

If using a preinstalled Chromium instead, set `YU3DOH_QA_CHROMIUM` to its executable. The orchestrator checks readiness, launches only the disposable fixture and Library, executes browser operations, and stops its processes. It does not modify production code or acceptance criteria.

`evidence.json` records the tested Git HEAD, OS, successful scenarios, exact API requests, and page errors; screenshots show the actual rendered UI. If a local worktree is dirty, HEAD alone is not a validated candidate: final evidence must be generated against the clean delivered SHA. GitHub Actions produces and uploads exact-SHA evidence for both Linux and Windows in `run012-ui-<OS>-<SHA>` artifacts. Failure screenshots/logs remain available; failures must not be represented as passing evidence.

Full validation is in `.github/workflows/workspace-run-012.yml`: frozen installs, root compile/build/test:sc/test:library, Workspace compile/all 340 existing tests plus 12 Draft-fence/override regressions, immutability checks, and operational browser evidence on both OSes. Review the Implementation Report for the final SHA and Actions run IDs.
