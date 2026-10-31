# PP-002 Q02 — Option I Identity/Route Evidence Intake Frozen Scope

artifact_id: PP-002-Q02-I-EVIDENCE-INTAKE-SCOPE
assignment: I-SEC-EVID-001
status: FROZEN / EVIDENCE COLLECTION READ-ONLY / NO CONFIGURATION OR EXECUTION
owner_approval: control/PP-002_Q02_I_OWNER_EVIDENCE_INTAKE_APPROVAL.md
coordinator: PROJECT_CONTROL / PC-003
assigned_role: PROTOCOL_PORTABILITY / PP-002
activation_control: exact CONTROL SHA containing authorization and route
source_control: c844fdc730afe8941612b7695f618cfe6bc1ee2e
accepted_F1_contract: handoffs/PP-002_Q02_F1_FEASIBILITY_AND_CONFIGURATION_CONTRACT.md @ blob 96b23062330006f59790883e87df4c095b37c5b2
independent_F1_report: validations/PP-002/Q02-F1/DQA-008_INDEPENDENT_DESIGN_QA_REPORT.md @ blob c5c78b74d354ba14c5dfa364a07bc3cdcd751f98
six_gate_owner_decision: control/PP-002_Q02_B1_OWNER_SIX_GATE_DECISION.md
read_only_baseline: validations/PP-002/Q02-I/PC-003_INITIAL_NONSECRET_EVIDENCE_SNAPSHOT.md
request: validations/PP-002/Q02-I/PP-002_IDENTITY_EVIDENCE_INTAKE_REQUEST.md
authorization: control/PP-002_Q02_I_EVIDENCE_INTAKE_AUTHORIZATION.md
route: routing/ROUTE-PP-002-Q02-I-IDENTITY-EVIDENCE.md
single_expected_report: validations/PP-002/Q02-I/PP-002_IDENTITY_AND_ROUTE_EVIDENCE_REPORT.md
branch_retirement_is_separate: backlog/GOV_BRANCH_RETIREMENT_DEFERRED_OBSERVATION.md

## Mission

Collect and evaluate admissible **NONSECRET / READ-ONLY evidence** for the actual acting principal and access restrictions of the current ChatGPT-connected GitHub environment and any candidate separately controlled executor/publication environment. Determine exactly which facts are OBSERVED vs NOT ACCESSIBLE vs INFERRED and what Owner/platform custodian must provide. The outcome is an evidence matrix and a bounded B1/B2 placement recommendation, **not** S1/S2 certification by the design author.

Priority question: Can a future experimental context be demonstrably incapable of using the same PC/Owner privileged connector or another unrestricted writer route, including after restart/fallback, while a separately controlled legitimate PC publisher remains functional? If the allowed read-only surfaces cannot prove this, STOP at UNKNOWN/BLOCKED; do not make prohibited calls to fill the gap.

## Mandatory evidence matrix (source, claimant, observed-rights boundary)

ID-01: actual GitHub App registration IDs/slugs, owner and scoped permission declarations for proposed P/B/C0; distinguish registration from installation and user/chat login.

ID-02: actual installations, selected repositories, approved grants and resource IDs (YU3DOH repository ID 1374186410); distinguish account display flags from acting token grants and write capacities.

ID-03: nonsecret trusted issuer statement for each proposed signer: auth mode, effective grant and repo list, opaque credential handle, expiration, revocation, signing-event request ID; NEVER expose bearer/token/key.

ID-04: platform/context-to-connection/actor selection ACL, allowed tools, alternative tool/connectors, inheritance, fallback, restart/rollover and account switching; distinguish role separation from enforced capabilities.

ID-05: inventory of privileged alternate writers (human PAT/OAuth, SSH/deploy keys, Actions/GITHUB_TOKEN, collaborators, service bots, UI editor, external broker, release/merge paths); read-only coverage limits.

ID-06: applicable classic protections, active rulesets, exceptions/bypasses, repo type/plan, exact ref matching incl default branch and absent X, tag and other namespaces; failed/forbidden admin reads remain UNKNOWN, not empty.

ID-07: trusted publisher/data-only broker availability, endpoint/ref/path guard and independent authorization/issuer custody. No implementation required or permitted.

ID-08: independent proof of the *outer* execution host lacking credentials, network egress, connector calls, host sockets, credential helpers and privilege fallback. Python mocks/audit hooks or a role name are not proof.

## Required report

1. Source register with immutable revision/response hashes as available, **current observation vs historical prior source**, request/receipt time provenance and complete error/coverage ledger. No invented timestamps or signer IDs.
2. Table ID-01–ID-08 with OBSERVED / PARTIAL / UNKNOWN / BLOCKED, exact available nonsecret material, missing indispensable fact, authorized custodian, read-only reproduction instructions and S1/S2 consequence.
3. Clearly separate which facts can be obtained by **this connection now**, which require Owner-assisted nonsecret UI/export or platform attestation, and which cannot presently be attested.
4. Inventory what can be concluded about real B1 vs B2 feasibility (provisional only), including the possibility of an **external isolated executor/manual guarded publisher**; no presumption that a second repo solves shared-connection privilege.
5. Independent-review acceptance criteria for a later reviewer to corroborate evidence without credential disclosure, prohibited write probes or self-signing. Do not self-authorize that QA.
6. Minimal actionable Owner/custodian evidence request, with explicit redaction/privacy requirements; never request tokens, keys, raw environment, sessions or private operational logs.
7. Maintain M01/M02 future B1 configuration requirements, but DO NOT integrate deferred branch-retirement inventory into Option I or claim W/K authorizations.
8. Truthful terminal conclusion. S1/S2 not independently proven unless a separately appointed independent verifier later accepts real actor/context/config evidence. No prototype GO.

## Stop/limits

Use read-only GitHub API/connector metadata. Do not probe requests with mutation intent, mint, test permissions by denied writes, switch to other accounts or connections, install anything, change settings/rulesets, create branch/repo/tag/issue/PR/workflow, run V01–V20, execute candidate code or Q02 I01–I32. Do not collect secrets or raw sensitive identity material in public GitHub. The only write is ONE NEW markdown evidence report at validations/PP-002/Q02-I/PP-002_IDENTITY_AND_ROUTE_EVIDENCE_REPORT.md on meta/project-control, with complete source/head compatibility, expected-head CAS, force=false and no previous-file edits. PP-002 does not edit central state or backlog/GOV_BRANCH_RETIREMENT_DEFERRED_OBSERVATION.md.

No branch retirement work or deletions during this scope. Owner separately deferred that item.

Return exact control/report blob to PC-003 for independent reviewer routing. Historical Q01 independent PASS, Q02 accepted, F1 paper QA PASS and Gate C/final PP-002 REVISE remain unchanged.
