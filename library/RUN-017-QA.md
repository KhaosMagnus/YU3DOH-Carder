# RUN 017 — Carder selective write-back QA

Authorized baseline: `163799a60772da69ecabbae03d8b2966a50d6c46`.
Implementation branch: `feature/workspace-run-017`. Development does not integrate.
Schema 6, Workspace format 1, migrations 001–006 and dependency declarations/locks unchanged.

The write endpoint is `POST /api/v1/carder/write-back`. Its strict transport projection
contains eleven Carder fields, never a complete InternalCard or artwork/variant DTO.
Successful prepare issues an opaque process-local write grant. Grant scope is card,
active language and exact revision; TTL is 12 hours with a 4096-entry bound. Runtime
replacement revokes both write and existing asset grant registries.

Run the complete root compile/build/test:sc/test:library and Workspace compile/test
commands. `.github/workflows/workspace-run-017.yml` repeats all prior operational
Library QA plus the eighteen new scenarios on Ubuntu and Windows, without OS skips.
No changes to production dependencies are needed. The workflow installs its isolated
Playwright tool outside the checkout.

For local browser evidence, compile Workspace first, provide playwright-core through
NODE_PATH and optionally YU3DOH_QA_CHROMIUM, then execute
`node scripts/run017-operational-qa.cjs`. Set YU3DOH_QA_OUTPUT outside the checkout.
The harness refuses an occupied Workspace port and creates only a disposable
Workspace. Text edits use the real Carder Name input and Save is pressed without waiting for debounce; production Save flushes pending edits before classification; remaining matrix inputs use
the production Carder working store. Save controls, acknowledgement dialogs,
maintenance ownership, Canonical transactions and HTTP responses are real, not mocked.

QA-17-01..18 cover Workspace/standalone sessions, text and structure saves, combined
atomic save, guarded fields, renderer-only no-op, Xyz Rank, Link rejection, Pendulum
scales, stale revisions with preserved edits, repeated saves, old-grant replay,
Library/Carder concurrency, domain rollback, Asset/Variant table immutability,
runtime replacement revocation and existing artwork content. Evidence contains
checked-out SHA, OS, screenshots, request trace and a strict PASS ledger. No page
errors are accepted. Server tests additionally inject a transaction failure and
prove rollback of fields, provenance, confirmations and revision.

External Design + QA owns acceptance of the exact final SHA. RUN 018 is not authorized.
