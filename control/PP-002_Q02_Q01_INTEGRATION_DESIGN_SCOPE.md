# PP-002 Q02 — Q01 Project Control Integration Architecture / Closure Readiness Scope

artifact_id: PP-002-Q02-Q01-INTEGRATION-DESIGN-SCOPE
artifact_type: bounded_architecture_design_scope
status: FROZEN / DESIGN ONLY
protocol_version: 1.0
coordinator: PROJECT_CONTROL / PC-003
design_owner: PROTOCOL_PORTABILITY / PP-002
owner_design_direction: control/PP-002_Q02_OWNER_DESIGN_APPROVAL.md
control_baseline: 24566ded661eb225017bf407a0219e479afc397b
assignment: Q02-DES-001 — Q01 Project Control Integration Design and Resilience Closure Readiness
official_Q01_offline_disposition: runs/PP-002_Q01_DQA-007_PASS_DISPOSITION.md
offline_disposition_blob: 4f2080c9b90dd4f3d7fcbc780d8b42da0c6d9ba3
validated_code_candidate: meta/project-control @ 328e57035d34f98c4d8d417729e8b12f91894e95
validated_design_blob: c72e0a6d0889ceee4e901126a33587072180017f
accepted_QA_report_blob: e3196b1991d5a1b798b760a37891d70ea9ac10b9
expected_design_output: handoffs/PP-002_Q02_Q01_CONTROL_INTEGRATION_DESIGN_HANDOFF.md
next_decision: PROJECT_CONTROL / PC-003 independent design acceptance and scope disposition

## 1. Baseline and purpose

Q01-IMPL-001 is CLOSED / independently validated PASS *offline only*. Current code provides a pure request/response capture adapter, provenance guard and fake guarded callback. No evidence establishes an installed, enforced production caller or durable request-envelope capture before each real connector invocation. The original R1 and Gate C checkers are distinct frozen operation-state validators. Gate C and the complete PP-002 recommendation stay REVISE; P01 remains UNCERTAIN and P02 UNKNOWN.

Design the narrowest practical, independently testable architecture that makes Q01 custody assurance usable in the Project Control evidence/decision-publication process without accidentally claiming that it is currently deployed. Produce a decision-ready implementation and validation plan, not implementation.

This design is about **control-plane provenance**. It is NOT product Carder/Workspace feature development, not generic v1.0 adoption, and not proof of universal executor recovery.

## 2. Questions that MUST be answered by source-bound analysis

A. **As-is surface inventory:** Identify current actual workflow/tool surfaces, authority holders, file paths, connector capabilities and human/chat handoff boundaries evidenced by the repository. Distinguish a Python pure guard, human-in-the-loop read, Code Mode connector, GitHub API, existing scripts and any speculative always-on orchestrator. Do not assume a host/plugin/interception feature exists merely because it would be convenient.

B. **Placement and architecture alternatives:** Compare at least (i) read-only/manual prepublication evidence bundle check, (ii) explicit tool-call wrapper with durable pre-issuance capture and postreceipt custody, (iii) separately authorized publisher integration. State which is feasible today, which needs unavailable platform hooks, and which is beyond scope. Recommend an incremental minimum viable integration with a decision matrix including security, fidelity, overhead, failure behavior, custody and rollback.

C. **End-to-end boundary:** Specify proposed lifecycle with clear actor + immutable record for each: owner/scope authority; exact request arguments before transport; durable request-envelope acknowledgement; transport invocation; correlated response or missing receipt; returned locator/content/tree membership; clock provenance; exact profile (EXACT_REQUEST_HISTORY versus EXACT_CONTENT); frozen operation-state checker; bundle/authority/closer/payload pre-use recomputation; publication CAS; postpublication verification and append-only error or correction. No implied claim of atomicity where none exists.

D. **Break/glitch states:** Define BLOCK/UNKNOWN/FAIL behavior for lost request-envelope persistence, crash after request write but before call, crash after call before receipt, absent response, mutable ref, same-byte wrong commit, wrong locator R2 case, untrusted source index, swapped response, stale approval, concurrent CAS failure, actor turnover, missing original timing, inaccessible repository, and unavailable connector hooks. Reject invented source facts and blind retries.

E. **Trust and permissions:** Identify what attests request/receipt authenticity, membership binding, clock role, actor identity, immutable source pins, code version and allowed purpose. Show controls against self-asserted forged manifest, credential exposure, URL secrets and privileged writer bypass. State residual unprovable threat models; do not claim content hashing alone authenticates a malicious sender. Separate evidence truth, authorization, publication ability and use policy.

F. **Enforcement:** Propose precise decision-consumption and publication barriers, whether the caller can bypass them, and how to detect/prevent bypass in a realistic environment. Distinguish replayable offline approval from actual live enforcement. Identify direct GitHub writes or agent tool calls outside the wrapper and design safe scope limitations. Capture actual intended publication filename, source dependencies, content hashes and expected control ref; revalidate at point of use. Never treat Q01 guard as permission to publish or as new operation lifecycle classification.

G. **State-check composition:** Specify how Q01's provenance result composes with unchanged R1/Gate C operation-state evidence without editing their frozen code or changing PP-002 v2 observed-state vocabulary. An EXACT_CONTENT PASS may authorize only limited historical content use; not fresh execution-state decisions. A full current-state publish must satisfy fresh source timing, exact request history and independently verified operation-state result.

H. **Human role/turnover cost:** Specify how an agent in a chat creates, persists, reopens and reads custody envelopes across interruptions, including expected-head/CAS handling, duplicate/idempotent publication behavior, output/namespace locks, race exposure, and clear handoffs for PC, PP, DESIGN_QA, development and eventual integration administrator. Estimate *measurable* maintenance burden (source reads, blob pins, files, commits, operator steps), not invented runtime savings.

I. **Verification approach:** Freeze prospective deterministic offline/adversarial integration tests, expected invariant verdicts, callback counts, outage/restart/collision tests, write-root auditing, independent QA, and path/commit preservation. Include positive controls, bypass tests and unknown containment. Separate mock transport from real connector integration; do not call historical Q01 F01–F31 sufficient evidence for live deployment. Define readiness criteria and conditions where the design must return BLOCKED.

J. **Protocol improvement closure:** Create a requirement-by-requirement closure/readiness matrix for (1) already PASS: bounded Q01 offline guard, (2) integration not yet designed/installed, (3) P01/P02 missing platform-side evidence, (4) interrupted execution with lost issuance ACK, (5) real quota/involuntary crash recovery, (6) generic portability and additional protocol-v1.0 evolution, (7) cost/security, (8) explicit Owner adoption gate. Specify which items are essential before claiming *integration ready*, *experiment closure* or *protocol successor drafting*. Never change recorded REVISE/PASS to fit the plan.

## 3. Preferred conceptual architecture for feasibility assessment — NOT a deployment claim

Suggested staged boundary to evaluate:
```
AUTHORIZED INTENT
    -> explicit request capture -> durable issuance record + acknowledged pin
    -> injected/explicit connector call (only where supported)
    -> correlated response or RESPONSE_UNKNOWN
    -> byte-pinned returned content and commit/path membership
    -> Q01 provenance verdict (EXACT_REQUEST_HISTORY / EXACT_CONTENT)
    + separate frozen state checker where current execution state is asserted
    -> pre-use authority/closer/payload/profile recheck and fail-closed gate
    -> separately authorized publisher using CAS, force=false
    -> postpublication receipt, ref verification and append-only error evidence
```
This is a proposed *target* flow. The designer must check whether the actual ChatGPT/GitHub tooling can supply the required capture/persistence/interception. If not, recommend the highest-fidelity manual or offline-only route and mark the automation goal BLOCKED / DEPENDENT on a platform capability. Avoid a cosmetic wrapper that users can trivially bypass.

## 4. In scope / out of scope

IN_SCOPE: source-bound architecture analysis, alternative designs, explicit information flows/data schemas/extensions proposed only, capability gap analysis, threat/failure model, unchanged-checker composition, operational rehearsal plan using fake transports, independent QA acceptance criteria, staged deployment/rollback proposal, decision-ready future scopes, closure-readiness matrix and implementability recommendation.

OUT_OF_SCOPE: actual code edits, modifying any validated source/baseline or original evidence, writing new live issuer/publisher, exercising GitHub Actions/workflows, workflow retry/replacement/cancellation/cleanup, product/workspace changes, mutating protected or historical operational refs, testing a real new interruption or session turnover, adding protocol text to frozen v1.0/v2, changing P01/P02, adopting generic Recovery Gate or protocol successor.

Also OUT_OF_SCOPE: inventing a measured platform API/session identity, automatically transferring agent state across chats or asserting unverified usage quota behavior.

## 5. Expected output and acceptance contract

Write one new coherent design handoff at handoffs/PP-002_Q02_Q01_CONTROL_INTEGRATION_DESIGN_HANDOFF.md, with:
- exact input bibliography and blob/commit/capability evidence;
- as-is vs target architecture diagrams/text and per-surface feasibility;
- selected MVP and alternatives with technical rationale;
- sequence/record schemas for pre-invocation, response, membership, clock, approval, publication and failure;
- field-level trust/provenance boundaries; explicit policy decisions/permissions;
- negative/positive integration test matrix and independently reproducible oracle;
- stepwise offline prototype -> independent QA -> separately Owner-authorized integration -> controlled evaluation -> protocol/closure decision, each with GO/NO-GO;
- residual P01/P02 and lost ACK/crash/quota gaps, no false claim of completion;
- a single **decision request to PC-003**: ACCEPT DESIGN / REVISE DESIGN / BLOCKED, plus clearly identified later Owner decisions.

Must specify actual module reuse versus additions and deterministic test/mock interface; never require overwriting frozen paths. If proposed production integration requires a new version of an original checker, explicit new scope and Owner decision are required; no silent amendment. Self-review of the design is not official QA.

## 6. Authorization boundary

This is a FROZEN **design scope**, not an implementation or integration authorization. Design Owner PROTOCOL_PORTABILITY / PP-002 may inspect repo evidence and publish a single new design artifact only under a separately effective frozen route. PC-003 keeps sole control of central mutable indexes; do not open external operations. When any material environment/tool capability is unknown, label it UNVERIFIED and route an evidence-collection dependency rather than assuming support.

The owner approved starting design now, not approving any future live change or protocol replacement. No formal adoption or PROMOTE result is implicit.
