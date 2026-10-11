# RUN 014 — Canonical Block Review & Initial Confirmation QA

Baseline: `366fea433d6eccde9b2848dee2f9b53297926a69`. Branch: `feature/workspace-run-014`. Schema remains 6; no migration. Do not integrate or modify main.

Use Node 24.19.0 / Yarn 1.22.22 and run:

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

The RUN 014 Actions workflow executes these commands plus RUN 012, RUN 013 and RUN 014 browser scenarios on Linux and Windows. Existing real Windows junction/path tests remain active, without skips.

## Disposable browser QA

Install `playwright-core@1.58.2` outside the checkout; set `NODE_PATH` to its `node_modules`; install Chromium with `node <tool-directory>/node_modules/playwright-core/cli.js install chromium`. Set `YU3DOH_QA_OUTPUT` to an external evidence directory. Optionally set `YU3DOH_QA_CHROMIUM` to an existing Chromium executable. On PowerShell, use `$env:NODE_PATH`, `$env:YU3DOH_QA_OUTPUT` and the same Node command:

```sh
node scripts/run014-operational-qa.cjs
```

The launcher creates only a disposable Workspace with a Unicode/spaces OS temporary path, starts the service on port 4312 and Vite on 3000, checks readiness and closes its processes afterward. It refuses to reuse an existing Workspace on 4312. Evidence JSON records exact HEAD, OS, Workspace identity/path, request contracts and scenario results; screenshots record the reviewed state.

For manual inspection, run `node scripts/run014-qa-fixture.cjs` and start Vite separately. Seeded cards:

- **QA Valid:** valid Spell STRUCTURE/TEXT:EN in Draft; usable managed Default BS.
- **QA Invalid:** non-Token without password; STRUCTURE cannot confirm.
- **QA Languages:** independent EN/ES/JP localized Draft blocks.
- **QA Stale:** reserved for concurrent revision injection.

Fixture-only routes: `GET /_qa/info`, `GET /_qa/domain` (all user-domain tables), `POST /_qa/stale` (changes Stale's Canonical password/revision). These are absent from the production app.

## Expected workflow

Canonical Detail shows six per-block states. Only Draft blocks offer Review / Confirm, outside editing. Review is read-only and displays persisted values plus server PASS/FAIL. Invalid data cannot confirm. Valid data exposes provenance, initially MANUAL, with optional source reference/note. Blank source kind disables Confirm. Cancel changes no revision, provenance, content or state.

Explicit Confirm sends only reviewed `expected_revision` and one confirmation transition/provenance through existing PATCH. Success adopts authoritative detail and provenance immediately. Stale review/confirmation clears the old review, reloads authoritative detail and requires Review again; no automatic replay. Network, validation, not-found and Workspace-not-ready errors remain distinct.

The browser suite covers review/cancel snapshots, blank provenance, confirmation-only success, invalid Draft, independent ES/JP/EN, stale/no replay, existing confirmed edit guard, Move to Draft, Reconfirm, and Carder language gating/launch. No whole-card confirmation or global Canonical status is introduced.
