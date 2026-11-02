# Q02 C2 — Frozen Externally Isolated Offline Executor Architecture Design Scope

artifact_id: PP-002-Q02-C2-FROZEN-DESIGN-SCOPE
assignment: C2-EXT-DES-001
status: FROZEN / DESIGN-ONLY / SINGLE ADDITIVE HANDOFF / NO TECHNICAL EXECUTION
coordinator: PROJECT_CONTROL / PC-003
assignee: PROTOCOL_PORTABILITY / PP-002
authority: control/PP-002_Q02_C2_OWNER_DESIGN_APPROVAL.md
authorization: control/PP-002_Q02_C2_DESIGN_AUTHORIZATION.md
request: validations/PP-002/Q02-C2/PP-002_C2_EXTERNAL_ISOLATION_DESIGN_REQUEST.md
route: routing/ROUTE-PP-002-Q02-C2-PP-002-DESIGN.md
sole_output: handoffs/PP-002_Q02_C2_EXTERNAL_ISOLATION_DESIGN_HANDOFF.md
source_activation_CONTROL: exact sha of new PC-003 activation commit
C1_owner_decision_request: control/PP-002_Q02_C2_EXTERNAL_ISOLATION_DESIGN_OWNER_DECISION_REQUEST.md
C1_decision_evidence: runs/PP-002_Q02_C1_CONVERSATION_ISOLATION_DECISION_DISPOSITION.md
Owner_six_gate_control: control/PP-002_Q02_B1_OWNER_SIX_GATE_DECISION.md
F1_frozen_contract: handoffs/PP-002_Q02_F1_FEASIBILITY_AND_CONFIGURATION_CONTRACT.md @ blob 96b23062330006f59790883e87df4c095b37c5b2
F1_independent_QA: validations/PP-002/Q02-F1/DQA-008_INDEPENDENT_DESIGN_QA_REPORT.md @ blob c5c78b74d354ba14c5dfa364a07bc3cdcd751f98
Option_I_source: validations/PP-002/Q02-I/PP-002_IDENTITY_AND_ROUTE_EVIDENCE_REPORT.md @ blob 2d6f3d1911adb3869f69be6bf754be4a7e55a7a2
Option_I_QA: validations/PP-002/Q02-I/DQA-009_INDEPENDENT_EVIDENCE_QA_REPORT.md @ blob 3399a48b75763e650d41f49b2e28fbc52942ca62
Q01_candidate: 328e57035d34f98c4d8d417729e8b12f91894e95 / OFFLINE QA PASS ONLY
deferred_out_of_scope_backlog: backlog/GOV_BRANCH_RETIREMENT_DEFERRED_OBSERVATION.md

## Mission

Design the smallest practicable and independently verifiable **external/offline** prototype isolation boundary. The current ChatGPT GitHub hybrid writing connection is privileged and normal-chat role separation is not an accepted technical ACL. This work is a DESIGN only, not actual environment, actor, network, GitHub grants or tests.

The deliverable is an actionable standalone contract for a future security preflight and then, only with future approvals, a safe prototype. It must clearly separate observations, inference, proposals and missing attestation; avoid credential, platform, role, host or signer assumptions.

## Mandatory deliverable sections

A. Exact source/immutable SHA/blob register, baseline assumptions and authority; enumerate all actors: Owner/PC publisher P, experimental offline executor E, optional distinct limited B, proposed custodian/issuer C0, independent QA Q, repo administrators and any alternate real writer route; draw trust/data/control boundaries. Separate actual connected tool from conceptual offline runner.

B. Compare at least (A1) pure disconnected local/offline E with no GitHub repo needed in E and a later reviewed publication step, and (A2) genuinely restricted separate B2 nonproduct repository + issuer + E. B1 inside original YU3DOH may appear as counterfactual only, with unproven S1/S2 and F1 M01/M02 cost. Compare required actual platform features/independent evidence, security blast radius, continuity costs, operational complexity, recoverability, owner effort and time estimates explicitly as estimates with assumptions. Recommend one narrow design candidate, but never select an implementation placement on Owner's behalf.

C. Threat model and deny-by-default E: GitHub/App token unavailable, separate account/workspace/host, environment/mount/secret inheritance denied, egress/network/hosts/metadata endpoints restricted, no GitHub tools or GitHub connector sockets, exec-fallback/restart/rollover constraints and fail-closed proof path. An API namespace, role label, Python hook or in-process mock cannot prove outer host confinement. List precise nonsecret independent substrate evidence / custodian and hard stop criteria.

D. Synthetic/public-data-only data flow: exact Q01 immutable source without providing live privileged connection to E; staging/copy/air-gap of sanitized inputs; deterministic hashes/manifest, no secrets in source/output; quarantine output, public Git object irreversibility and validation before publication; capture/replay and lost/duplicate artifact handling.

E. Actual distinct publisher design outside E: who is allowed to sign/publish, independent issuer/credential storage and repo-specific least-privilege auth, trusted data-only request, ref/path/source/tree/parent CAS guard, strict fail-closed bypass exclusion, denied alternate raw writers, idempotency and lost acknowledgements, protected original refs, human acceptance plus enforced technical checks. Do not misrepresent optional expected_sha as proven provider atomic compare-and-swap; identify precisely which guarantee is unverified and what future safe qualification would establish it.

F. Explicit full S1–S6 evidence table preserving Owner's original frozen requirements even if B2 chosen; original YU3DOH S2 NOT WAIVED. S3 exact source+absent target+allowlists, S4 real isolation, S5 data privacy, S6 external QA I01–I32 + F01–F31 + relevant R1/Gate C regressions; identify future evidence oracle/provider and what is NOT EXECUTED.

G. F1 prior independent QA M01/M02 (operational continuity, W/K lifecycle and cross-writer denies), L01 tag-source uncertainty; avoid broad repo tag/branch freeze that blocks legitimate work. Specify a future separate configuration authorization, bounded activation/recovery/rollback, and no new ruleset now.

H. Concrete incremental staged implementation *proposal only*: at least design QA → Owner choose candidate → source/identity/host custody evidence → permission/protected-ref preflight with independent S1/S2 proof → frozen S3 → genuine offline S4/S5 → independent S6 → separate integration decision. Include STOP/UNKNOWN, failures/recovery (session interruptions, stale CAS, lost ACK, ambient credential leakage) and residual risks.

I. Design-only independent-review contract: QA reviewer role distinct from author, acceptance/rejection criteria, source pin, how to expose missing facts without fictional security assurance; exact single Markdown output path and return fields (candidate control SHA, blob, author scope conclusion).

## Boundaries

Read-only repository/public policy research necessary for design and locally authored prose are permitted, subject to source attribution. No runtime execution (including prototype/code evaluation), network/host access tests, source compilation/test jobs, live negative writes, permissions configuration, new branches, repositories, accounts, App grants, tokens, secret captures or external provider contact. No technical artifact creation except ONE new design Markdown handoff on existing meta/project-control by current-head compatible expected_sha CAS, force=false. No existing files edited or moved by assignee, especially PROJECT_STATE, registry, backlog, existing protocols, product/ops branches.

Do not treat this design PASS as S1 or S2 or Q02-PROT-001 approval. If essential source can't be read, note UNKNOWN and design proof request. No new QA route until PC-003 separately issues it. GOV-BRANCH-001 DEFERRED, do not audit or delete RUN/ops branches. Checkpoint serial/workspace preserved and must remain recoverable.

## Outcome

One bounded design handoff that supports a real Owner selection in a later turn, not an implemented environment or GO. Return exact CONTROL SHA and blob to PC-003 for independent QA routing.
