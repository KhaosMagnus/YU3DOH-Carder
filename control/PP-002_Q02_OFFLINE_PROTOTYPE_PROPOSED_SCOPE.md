# PP-002 Q02 — Proposed Offline Integration Prototype Scope

artifact_id: PP-002-Q02-OFFLINE-PROTOTYPE-PROPOSED-SCOPE
artifact_type: coordinator_prepared_implementation_scope
status: PROPOSED / NOT AUTHORIZED / NOT EFFECTIVE
protocol_version: 1.0
coordinator: PROJECT_CONTROL / PC-003
source_design: handoffs/PP-002_Q02_Q01_CONTROL_INTEGRATION_DESIGN_HANDOFF.md
source_design_blob: a06fb711662848ccc16d2e32d621be279a9b1f4d
source_design_acceptance: runs/PP-002_Q02_DESIGN_ACCEPTANCE.md
proposed_assignment: Q02-PROT-001 — Offline Control Custody/Publication Integration Prototype
owner_permission_pending: control/PP-002_Q02_OFFLINE_PROTOTYPE_OWNER_DECISION_REQUEST.md
code_baseline: accepted Q01 source under meta/project-control @ 328e57035d34f98c4d8d417729e8b12f91894e95
control_input: 95a7238f2d9173c90ab6541239ad2fbcba1e062b
implementation_role: to be named by separately effective authorization
independent_QA_role: DESIGN_QA / separate reviewer after candidate return

## Rationale and exact boundary

Propose a bounded standard-library-only Python prototype with injected FakeImmutableStore, FakeTransport, logical clock, FakeDecisionPublisher and permission model. Reuse Q01's immutable source/control interfaces without changing the five validated source files or original R1/Gate C checkers. This is NOT an installed guard, GitHub plugin wrapper, authorized live publisher or real permission restriction.

Candidate **new** source root if Owner explicitly permits the documentation-only control-branch exception:
validation/pp002-q02-control-integration/
Suggested new files, exclusively under that root: README.md, policy_adapter.py, journal_adapter.py, capture_bridge.py, composition.py, publisher_model.py, recovery_reader.py, test_integration.py, run_contract.py, and clearly labeled synthetic fixtures only if needed.

New independent evidence root, after explicit authorization only:
validations/PP-002/Q02-CONTROL-INTEGRATION/Q02-PROT-001/**
Implementation report, after explicit authorization only:
implementations/PP-002_Q02_OFFLINE_PROTOTYPE_REPORT.md

These are **reserved design proposals**, not authorized write paths. Paths must be absent at activation or collision reviewed; freeze exact final allowlist before implementation. No input modification; no rewrites of current historical evidence, frozen original checkers, control/protocol policies, .github/workflows, product, operational refs or Q01 source bytes.

If Owner prefers a new isolated nonproduct prototype branch instead, a different explicit branch baseline, isolation policy and later artifact custody route must be drafted and approved before branch creation. Do not create it under this proposal.

## Prototype target

Implement only the operator-assisted historical/content evidence path M plus *mock* W invocation/durable journal/restart and fake P/CAS permission and publication model. Model a complete record trail (AuthoritySeed, PreparedBatch, PersistReceipt, InvocationCapture, ResponseCapture, MembershipCapture, AcquisitionIndex, StateCheckReceipt or N/A, PublicationIntent, CompositeApproval, PublicationReceipt, VerificationAndClosure), with separately pinned exact source times and immutable object receipts. Define the bootstrap trust root rather than falsely claiming all helper reads were Q01 guarded.

Must distinguish preparation clock from actual invocation clock and preserve crash-after-dispatch-before-receipt UNCERTAIN; no blind stateful retry. Exact request history may be PASS only where actual attributable issuance data is retained. EXACT_CONTENT may be approved for historical content and explicit state N/A, never as fresh workflow evidence. For mock fresh state, only a clearly marked applicable fake checker may be composed; original R1/Gate C checkers run against historical fixtures only.

The fake restricted writer must explicitly model allow/deny edges and disclose that a privileged real GitHub caller can bypass it. The unrestricted mock must demonstrate that bypass rather than passing by denial. No real GitHub authentication, actual direct writer, actual protected-ref permissions, publisher service, credential, network, Actions, GitHub-API write, remote CAS probe, new live event or workflow is permitted by the prototype.

## Prospective frozen test contract

Execute all I01–I32 named cases in section 13 of the frozen Q02 handoff, with original raw-fact oracles, mock truth independently from recovery actor visibility, required subcases and two independent replay roots:
I01–I08: positive content/history paths, durable prepared ACK, lost ACK, crashes and distinct read-only recovery;
I09–I16: correlations, Q01 ref/blob/origin invariants, R2 reconciliation, clocks, forged indexes, secrets handling, checker/applicability and frozen Q01/R1/Gate C regressions;
I17–I24: freshness, stale payload/closer/path/tree, CAS compatibility/denial/ACK loss, explicit unrestricted bypass and modeled restricted writer;
I25–I32: executor turnover/outages, v2 parent/child/closer dimensions, stale approvals across assignments, AUDIT_ONLY counting, every persistence/CAS crash boundary, deterministic semantic bytes, no self-reference and no permissive defaults.

Record actual per-case PASS/FAIL/BLOCK/UNKNOWN, expected callback counts, accepted/attempted fake CAS counts, journal commits, transport emissions and recovery reads, all fixture pins, code hashes, command exits, platform, write/capability audit and byte-hash replay comparisons. **32 cases are proposed, not previously run.** Add tests for each invariant and explicit negative controls; no test automatically passes by checking implementer's own oracle labels.

Original Q01 F01–F31, DQA-007 PASS evidence, R1 and Gate C negative/positive regressions must remain reproducible and unchanged. Test scripts do not have credentials or network access; no package install/download. No accepted extra output may depend on an invented platform signed trace.

## Delivery and QA separation after effective authorization

Proposed implementer: designated PROTOCOL_PORTABILITY / PP-002 for experimental control tooling, or a separately assigned DEVELOPMENT instance with explicit control-only permission; choice to be fixed in the effective route. Independent DESIGN_QA successor must be separate from implementation. Accepted candidate requires pinned source and evidence, preservation of all predecessor blobs and protected refs, measured rather than projected overhead, return report, and separate official QA PASS before any further integration proposal.

A pass would support **offline mock interoperability only**. It could not attest remote CAS atomicity, installed mandatory writer permissions, live connector interception, real platform conversation identity, quota/crash/lost ACK recovery or protocol adoption.

## Policy/permission decision gate

protocols/GIT_CONTROL_POLICY.md states meta/project-control is documentation-only. Specific Q01 code was separately authorized and accepted; that is NOT blanket authority for Q02 code. Before a real prototype starts, Owner explicitly chooses:
A) a narrowly bounded exception allowing only the enumerated *new experimental offline test source and evidence* on meta/project-control, with no merge into product refs, or
B) a separately governed isolated nonproduct branch/store, requiring its own authority and custody design.

PC-003 then publishes an effective Q02-PROT-001 implementation authorization and route against the exact chosen baseline/allowed paths/role, using expected-head/CAS. Neither this scope nor earlier Owner approval for Q02 design is an executable permission. Any desire for actual connector/use/writer installation or privileged access requires its own later Owner authorization and validation.
