# Q02 — Owner Decision Request: C2 Externally Isolated Prototype Design (NOT IMPLEMENTATION)

artifact_id: PP-002-Q02-C2-EXTERNAL-ISOLATION-DESIGN-OWNER-REQUEST
status: PROPOSED / PENDING EXPLICIT OWNER APPROVAL / DESIGN-ONLY NO-GO UNTIL SELECTED
coordinator: PROJECT_CONTROL / PC-003
source_CONTROL: e90e310299ee56f156f44e9ce64df51d20f2ea4f
decision_evidence: validations/PP-002/Q02-C1/C1_THIRD_AI_SUPPORT_REPLY_AND_PUBLIC_DOC_REVIEW.md
C1_disposition: runs/PP-002_Q02_C1_CONVERSATION_ISOLATION_DECISION_DISPOSITION.md
previous_six_gates: control/PP-002_Q02_B1_OWNER_SIX_GATE_DECISION.md
independent_F1_contract: handoffs/PP-002_Q02_F1_FEASIBILITY_AND_CONFIGURATION_CONTRACT.md @ blob 96b23062330006f59790883e87df4c095b37c5b2
deferred_backlog: backlog/GOV_BRANCH_RETIREMENT_DEFERRED_OBSERVATION.md

## Decision requested

**C2-DESIGN (RECOMMENDED):** Authorize PROTOCOL_PORTABILITY / PP-002 only to design a minimal, verifiably isolated offline Q02 experiment placement outside the existing ChatGPT GitHub privileged connection. Produce an independent handoff and QA criteria in a separate future route. No executable prototype and NO new repository, actor, App, token, platform setting or runtime may be created under this decision alone.

**DEFER:** Preserve current evidence/NO-GO without additional C2 work.

## Frozen C2 design contract proposed (requires Owner approval and later effective route)

1. Define true trust boundaries: E runs outside ChatGPT connected writer surface, with deny-by-default credentials, network/egress, connector socket, filesystem mounts, host helpers, metadata endpoints and fallback/restart; write down actual provider/host policies needed to prove these controls and distinguish proposed from observed.
2. Choose whether B2 as separately permissioned nonproduct repository is required or whether a fully disconnected local executor plus guarded data-only custody is sufficient for an offline pilot; quantify coupling, blast radius and cost before selecting. Merely naming B2, a second chat or a token is NOT isolation.
3. Define immutable/synthetic low-risk input and provenance chain from Q01 candidate without granting E access to the existing source GitHub repository or private material; preserve exact source/blobs and offline test families without executing.
4. Define manual/guarded publication after E with separate actual issuer, repo-scoped minimally authorized writer, explicit human acceptance, path/ref/source/tree allowlist, CAS/concurrency, replay/lost ACK recovery, mandatory independent QA and *absence of bypass routes*. A human approval click alone does not prove issuer separation or no alternative writer.
5. Retain original GitHub protected refs S2 (main, Serial/Carder and Workspace checkpoints, control, relevant ops), even if E operates in a different repository. Carry F1 M01/M02 operational continuity and W/K cases; no ruleset freeze installed in design.
6. Establish stage-gated falsifiable S1–S6 acceptance criteria, independent evidence sources and Owner questions: no simulated negatives as proof, no proof of a runner that has not been instantiated, and no real write/denial tests under design.
7. Provide an incremental and reversible proof-first implementation proposal with minimal privilege/cost and explicit STOP on missing attestations. Handle private/public custody: never publish credentials or runtime secrets in public control repository.
8. Keep branch-retirement GOV-BRANCH-001 separate and DEFERRED; do not review RUN or ops refs as cleanup candidates here.

Design output if later authorized: single standalone new C2 design handoff with exact authorization, SHA and independent design QA route to be frozen by PC-003. The Owner may separately approve a controlled non-secret preflight only if needed. Any actual identity creation, GitHub security/ruleset change, repository provisioning, execution/V tests or Q02-PROT-001 implementation requires a different explicit Owner approval after source-bound independent review.

## Recommendation

Authorize **C2 design only**, not B2 deployment. The previous C1 documentation supports rejecting per-chat privilege isolation as an engineering dependency; it does not itself qualify any external executor or resolve S2. Do not continue repeating AI support paraphrases to seek an unavailable platform guarantee for chat-specific rights.
