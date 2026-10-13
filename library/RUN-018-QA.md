# RUN 018 — Library Multi-Select & Batch Classification

Authorized baseline: `0c94aa7990c227690b5d90e2d73ae892a37930ee`.
Development branch: `feature/workspace-run-018`. Integration and main must remain untouched.

Batch v1 writes only Classification through the existing Canonical service. Every success is a separate Canonical transaction and increments that card's revision once. Preview is read-only; Apply holds the runtime's existing mutation lease for the whole request. Registry validation is global and read-only. No assets, variants, Carder integration logic, migrations, production dependencies, or lockfiles change.

## Validation

Run `yarn compile`, `yarn build`, `yarn test:sc`, `yarn test:library`, `yarn --cwd workspace-server compile`, and `yarn --cwd workspace-server test`.

After committing the candidate, run `node scripts/run018-immutability.cjs`. It checks baseline ancestry, frozen migration/constants/lockfile/Canonical/Carder bytes, dependency declarations, and repository hygiene.

Use `node scripts/run018-operational-qa.cjs` with isolated `playwright-core@1.58.2` in `NODE_PATH`. Set `YU3DOH_QA_OUTPUT` to a directory outside the checkout; optional `YU3DOH_QA_CHROMIUM` selects an installed browser. The harness refuses to reuse an occupied Workspace port, creates disposable data, starts only its own service/Vite/browser processes, and cleans them up.

The workflow `workspace-run-018.yml` runs all required validation on Ubuntu and Windows, including previous RUN012–017 browser regressions. RUN018 executes QA-18-01..20 with no required skips. Artifacts include the exact checkout SHA and OS, screenshots, request DTOs, outcome evidence, and immutability hashes.

## Manual flow

Select individual rows or the current page. Checkboxes do not open Detail. Selection persists through page/filter changes, and revisions stay frozen until explicit deselection/reselection. There is no query-wide selection. The 200-card limit blocks the entire page addition when it would exceed the cap.

Configure one shared set operation using registry labels. Effect Reviewed is Unchanged/True/False. Preview displays authoritative per-card outcomes. Any selection, operation, or note change requires a new Preview. Acknowledgements name the exact CONFIRMED cards that will move to DRAFT.

Dirty Detail permits Preview and blocks Apply. Use the Detail toolbar to open Batch while reviewing unsaved edits. Nothing saves or discards Detail automatically.

After executed Apply, selection clears, the result report remains available through Batch results, browse/facets refresh, and a participating clean Detail reloads. Inspect partial outcomes and expected/observed revisions. Retry only through explicit refresh/reselection/new Preview. An already-open Carder session naturally becomes stale after a Batch revision advance; local Carder edits remain preserved.
