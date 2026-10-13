# RUN 019 — Sources / Provenance inspection

Authorized baseline: `d7f5d567856503a42d14543d876eb7d1e0c2b311`. Branch: `feature/workspace-run-019`.

The production feature is client-only and read-only. It consumes the existing authoritative Detail snapshot, never the dirty working form. No API/server/persistence/dependency/lockfile changes are required or permitted.

Detail sections are Canonical → Sources / Provenance → Variants / Assets. Switching sections preserves the working form. Edit from another section returns to visible Canonical editing. The panel shows raw metadata and current context; it never treats newest events as the source of current values. Only exact current CONFIRMED provenance IDs receive current-confirmation markers. Source references remain escaped plain text.

History sorts a copy by descending valid timestamp and descending ID for ties. Records with unavailable/invalid dates follow dated records and use descending ID, producing a deterministic total order without rewriting timestamps. Filters/search are local AND conditions; Clear restores all rows. No filter preference or history state is persisted.

Run all existing required commands: `yarn compile`, `yarn build`, `yarn test:sc`, `yarn test:library`, `yarn --cwd workspace-server compile`, `yarn --cwd workspace-server test`.

After committing, `node scripts/run019-immutability.cjs` proves exact baseline ancestry, clean repository, entire unchanged server production tree/package, migration hashes, constants, dependencies and lockfiles. CI preserves Git blob bytes before checkout on Windows/Linux.

Operational QA: use isolated `playwright-core@1.58.2` through `NODE_PATH`, set `YU3DOH_QA_OUTPUT` outside the checkout, then run `node scripts/run019-operational-qa.cjs`. Optional `YU3DOH_QA_CHROMIUM` selects an installed browser. The harness refuses an occupied Workspace port, owns disposable data/processes, and captures exact-SHA screenshots and JSON evidence for QA-19-01..20. Full database snapshots and browser request counts prove inspection/filtering/search/dirty navigation causes no writes or network requests. Explicit existing Save/Confirmation/reload operations separately prove authoritative refresh. No required skips.

The RUN019 workflow runs Ubuntu and Windows, the full server/client suites, all prior RUN012–018 browser suites and RUN019 inspection QA. Artifacts include OS, exact SHA, cases, request evidence and frozen-byte hashes. Development must not integrate RUN019 or start RUN020.
