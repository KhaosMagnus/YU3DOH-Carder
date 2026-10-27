# Project Control Bootstrap v1.0 — start here

This package initializes governance only. Possession of the ZIP grants no authority to modify a project. Obtain or verify the receiving project's Owner-authorized bootstrap scope before writes. Do not run product implementation, validation, integration or release as a side effect.

Read `protocol/GENERIC_PROJECT_CONTROL_PROTOCOL-v1.0.md` completely. It is the single normative protocol copy. This guide and the templates operationalize it; they cannot amend it. The protocol's historical extraction metadata and references to “SIP” are preserved provenance, not required adopter names, branches, actors or an instruction to follow an old route. This deliverable is a ZIP bootstrap package; no source-project history is adopted.

## 1. Verify and inspect before writing

Verify the ZIP against its separately supplied SHA-256, inspect archive paths, extract into an isolated directory and verify `MANIFEST.sha256` from the package root (for example `sha256sum -c MANIFEST.sha256`). All payload files except the manifest itself must be listed, with no extras. The manifest detects byte changes; it is not proof of publisher authenticity. Establish the trusted source separately. Read `PACKAGE_METADATA.md`.

Inspect the actual receiving project: repository/store identity, live refs and exact revisions, working-tree changes, existing governance, instructions, role assignments, active requests, frozen contracts and evidence. Do not overwrite existing files, discard local changes, presume a default branch, or replace existing governance. For an existing project, reconcile with its competent authority; conflicting policies require an explicit adoption/successor decision. A missing store or product is an observed gap, not an invented baseline.

## 2. Configure identity, authority and storage

Complete copies of the templates in an authorized durable control location; keep these distributed templates unchanged. Physical names are configurable. Use `adapters/GITHUB_DEFAULT.md` if Git/GitHub is selected, or record equivalent immutable revision, integrity, history, access, conditional-write and recovery semantics for another adapter.

Set project ID, Owner identity and authenticated decision reference, bootstrap permission and allowed writes, delegations and reserved rights, control coordinator/instance, control/product stores, paths and protected refs. Define who may publish control. Explicitly authorize any new control branch/store. Preserve pre-existing control history. Receiving a package is not authorization to create infrastructure or move refs.

## 3. Establish the initial records

- `PROJECT_STATE.md`: discovered facts with inspection time and sources; adapter policy; adoption decision; product baseline as an exact revision or `NOT ESTABLISHED` / justified `N/A`; integration target or `N/A`; validated candidate or `N/A`; truthful run history, including `NONE` when applicable.
- `ROLE_REGISTRY.md`: assign all decision responsibilities, permissions and blocker routes. One human may hold multiple roles only by explicit declaration. Distinct decisions remain mandatory; role names create no self-approval authority. Record designated external authorization under protocol §4 where implementer/acceptance/integration roles overlap. Unassigned downstream roles block their dependent work; they do not imply approval.
- `INSTANCE_REGISTRY.md`: record the accountable bootstrap/control assignment, predecessor if any, exact input revisions, unfinished work and recovery path. An assignment is not a fabricated product RUN.
- `REQUEST_LEDGER.md`: record the actual bootstrap/adoption request and every acknowledged requirement, decision authority, disposition and next route. Empty product backlog is valid. Deferred requests remain unresolved with revisit conditions.

Record the adopted protocol version and digest, approval authority and effective-revision rule. Declare freeze/supersession, evidence, QA, integration, concurrency, contradiction and recovery policies in the state template by reference to the protocol and local choices. Preserve the protocol unchanged, once, at a recorded durable path.

## 4. Fill policy choices; do not guess

Declare evidence classes, provenance, runtime/environment and capture time, location, integrity mechanism, retention horizon, expiry handling and durable archive policy/custodian where required. No universal retention duration exists. Synthetic or boundary-controlled evidence needs explicit boundaries/omissions and independent QA's sufficiency decision against frozen criteria; never label it real E2E. Environment readiness is separate from acceptance. Authoring and execution may use different substrates if exact candidate/harness/evidence custody is proved; no executor is mandatory.

Configure QA and integration authority separately. Development readiness is not QA PASS; QA PASS is not integration permission. Prefer fast-forward plus expected-head conditional updates. Alternate methods require approved equivalence, additional-delta, resulting-identity and revalidation policy before use. No implicit emergency bypass exists: a separate policy must name actor, activation, scope, risk, rollback, incident record and post-event reconciliation; absent that policy, STOP.

Material contradiction: STOP affected work, record exact conflicting sources, observed facts and unexecuted actions in the ledger, and return to control/competent authority. Use the five blocker classes in the role template and protocol §10. A blocker never automatically creates another RUN/instance, more scope or implementation authority. Transfer envelopes route intake; they never silently amend frozen contracts.

## 5. Publish the first exact control revision

Verify adoption approval and completeness of mandatory governance settings, then inspect the live control head immediately before publication. Commit/version only authorized governance records. Conditionally publish against the observed expected head (or absent ref when creating one). If it moved, refetch, inspect intervening history, preserve compatible changes and republish safely within authorization; STOP on semantic conflict. Verify published bytes, history and protected product refs afterward.

Avoid self-referential SHA fields: inside the initial state write “effective revision = immutable revision containing this approved adoption record”; record its pinned parent or `N/A` separately. After publication resolve the actual immutable revision R1. Fill `BOOTSTRAP_RETURN.md` with R1 and verify it externally. If persisting that return requires a second commit R2, label R1 the adoption checkpoint, R2 the publication/current head, and provide R2 in the outgoing envelope after commit. Never invent a future SHA or repeatedly amend a commit to embed its own hash. Resolve the live control head on each recovery.

## 6. Completion and return gate

Before claiming completion, verify project identity; authenticated Owner/bootstrap authority; durable reachable control store and exact published revision; adopted protocol/digest; configured adapter/conditional writes; state, request, role and instance records; contradiction/blocker routes; evidence/retention policy; freeze/supersession rules; explicit QA/integration responsibilities; exact product baseline or truthful absence; no unexplained protected-ref movement; recoverable paths and next route. Required unresolved governance settings mean `BOOTSTRAP BLOCKED`, with class, owner and dependency. Clearly scoped future product gaps may remain open without claiming product readiness.

Return the completed `BOOTSTRAP_RETURN.md` to the project's Owner/control authority, using `TRANSFER_ENVELOPE.md` as needed. The successful result is `PROJECT CONTROL BOOTSTRAP COMPLETE`. It means governance initialization only: no implementation, product validation, QA PASS, integration or release readiness is claimed. Mark the next route `PROPOSED` unless separately authorized. STOP here.
