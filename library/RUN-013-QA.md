# RUN 013 — Variant Lifecycle QA

Use Node 24.19.0 and Yarn 1.22.22. Work on `feature/workspace-run-013`; baseline is `590f11f62476a504164055c47aa918e80666ce2c`. Do not integrate or modify `main`.

## Complete validation

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

The RUN 013 Actions workflow executes these checks on Linux and Windows, followed by the existing RUN 012 browser regressions and RUN 013 lifecycle browser scenarios. Real Windows junction coverage is mandatory and does not skip.

## Isolated operational browser QA

Install `playwright-core@1.58.2` outside the checkout, set `NODE_PATH` to that installation's `node_modules`, and install its Chromium browser using `node <tool-directory>/node_modules/playwright-core/cli.js install chromium`. Set `YU3DOH_QA_OUTPUT` to an external evidence directory. Run:

```sh
node scripts/run013-operational-qa.cjs
```

On PowerShell, set the same variables through `$env:NODE_PATH` and `$env:YU3DOH_QA_OUTPUT`. `YU3DOH_QA_CHROMIUM` optionally selects an existing Chromium executable. No application dependency or lockfile change is needed for these QA tools.

The launcher creates a disposable Workspace in an OS temporary directory with spaces and Japanese characters. Its service uses port 4312 and its Library uses port 3000. It refuses to reuse an existing Workspace on port 4312 and terminates its child processes after validation. Every screenshot and `evidence.json` records the checkout's exact HEAD and OS.

For manual inspection, run `node scripts/run013-qa-fixture.cjs` and start the existing Vite development server separately. The fixture seeds five confirmed Canonical cards:

- **Managed:** Default has managed BS/BG/OF and is Preferred; Other has managed BS.
- **Sole:** passive, single Default with null Preferred.
- **Unmanaged:** passive Default and Other with null Preferred.
- **Broken:** missing managed Default remains Preferred; Other is usable.
- **Recovery:** managed Default, reserved for fault injection.

QA-only fixture routes run solely in this disposable launcher: `/_qa/info`, `/_qa/domain`, `/_qa/recovery-files`; `POST /_qa/stale` changes Managed's preference to invalidate an existing preview; `POST /_qa/fault/none`, `/operation`, or `/recovery` select fault injection. Recovery injection fails both publication's following DB phase and rollback. A recovery-required fixture must be closed and recreated or explicitly restored using the existing recovery API.

## Expected behavior

Set/Change/Clear Preferred use authoritative tokens and do not change readiness. Carder selects Preferred even if broken; null plus one variant selects it only in the UI; null plus multiple selects none. Manual selection does not write Preferred.

Rename and Remove require Review and explicit Confirm. Preview and Cancel leave scans, DB, files, recovery material and grants unchanged. Editing invalidates confirmation. Collision and stale state prevent execution; stale never replays automatically.

Managed Rename preserves IDs and content while changing deterministic paths. Unmanaged Rename leaves physical paths untouched and persists ASSIGN so Rescan retains the association. Remove preserves managed bytes under `Temp/VariantLifecycle/<operation_id>/`, retains unmanaged files with UNASSIGN, and never deletes the Canonical card. Removing Preferred requires explicit acknowledgement and does not choose a fallback. Successful Rename/Remove revoke affected Carder grants.

An unprovable rollback produces persistent `VARIANT_MUTATION_RECOVERY_REQUIRED` and blocks asset operations even after the modal closes. Recovery material remains available. Existing validated Restore resolves the interrupted lifecycle marker.
