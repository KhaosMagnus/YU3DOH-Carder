# Git + GitHub adapter — recommended defaults

Git/GitHub is optional. These defaults implement protocol §§2, 8, 13–16; an equivalent store must supply durable immutable revisions/history, scoped authorization, integrity, retrievability and conditional writes. No branch name, executor or runtime is mandatory.

## Configure before writes

Record repository identity/URL, Owner, authenticated bootstrap/adoption decision, product refs/protection, control branch or namespace (chosen by adopter), current full SHAs, permitted paths and control publisher. Prefer a dedicated governance branch/namespace or repository. Do not derive the control name from the source project. Verify existing governance and working-tree changes first; never reset/discard them.

A new project may have no product commits. Its baseline is `NOT ESTABLISHED`; candidate/target may be `N/A`; run history may be `NONE`. A first governance commit is not a product baseline or product validation. Creating a repository/branch requires recorded authority and an absent-ref conditional create; do not reuse an existing branch blindly. Record parent choice (existing verified head, or authorized independent history) and product separation explicitly.

## Guarded control publication

1. Fetch current control head E; compare it with pinned intake, inspect intervening history and authority. Inspect allowed paths and protected refs; record before-values. Stage only explicitly allowed paths, not the whole checkout.
2. Create additive commit N whose parent is E. Verify scope and `git merge-base --is-ancestor E N` (with actual immutable IDs). Preserve frozen bytes/history. For initial absent-ref creation, verify absence and use an atomic create-only operation.
3. Publish with an atomic expected-old-value guard for E → N AND a non-destructive/fast-forward check. A provider operation with explicit compare-and-swap semantics is preferred. A branch read followed by an unguarded write is not equivalent. An API's `force=false` alone is not an explicit expected-head comparison.
4. Git transport may use an explicit `--force-with-lease=refs/heads/<configured-control>:<E>` as the compare-and-swap guard **only after proving E is an ancestor of N**, with the push refspec limited to that one control ref. Despite the option name, this policy forbids any history-rewriting result; never use bare `--force`, a broad push or an implicit lease based on a mutable tracking ref. If server policy disallows this mechanism, use an authorized equivalent atomic conditional operation or report a substrate blocker.
5. On rejection/head movement: refetch, inspect intervening commits, preserve compatible work, regenerate the additive commit atop the new head within existing authority; STOP on semantic conflict. Never retry a stale candidate blindly.
6. Independently read remote head; verify published object/path bytes and preserved ancestry, then compare protected refs. Unexpected movement must be investigated and attributed, not overwritten. Record intake revision and publication parent separately.

Full immutable SHAs identify revisions; branches are locators. A state file cannot embed its own containing commit SHA. Record the adoption-effective containing-revision rule, then resolve and return the actual SHA after publication as described in START_HERE.

## Product gates and evidence

Recommended integration is FAST-FORWARD + EXPECTED-HEAD CONDITIONAL UPDATE, only after independent QA on the exact candidate and separately recorded Owner/delegate approval naming source, target, before-value and mechanics. Verify ancestry, candidate identity and protected refs before/after. Squash/rebase/merge/cherry-pick require explicit policy covering equivalence, additional delta, resulting identity and revalidation. A new resulting SHA is not the exact validated candidate by assertion.

Record candidate SHA separately from harness, control and evidence bundle IDs. Separate authoring/publication and execution/evidence systems are allowed if clean checkout, exact revision custody, runtime, fixtures, logs and final identity are proven. A CI success/HTTP response/readiness probe is not QA acceptance. Select any suitable executor.

Use SHA-256 manifests or equivalent evidence integrity, with declared artifact locations, runtime/provenance, retention horizon, expiry handling and durable archival when required. Hosting retention is not assumed permanent. Resolve current authoritative refs, state/ledger/roles/instances and frozen successor history on recovery; do not resume solely from chat memory.
