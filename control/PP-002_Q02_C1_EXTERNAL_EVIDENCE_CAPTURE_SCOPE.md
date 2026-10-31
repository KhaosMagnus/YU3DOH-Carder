# Q02 C1 — Frozen External Evidence Capture Scope

artifact_id: PP-002-Q02-C1-FROZEN-EXTERNAL-EVIDENCE-SCOPE
assignment: C1-EXT-EVID-001
mode: OWNER-APPROVED / PC-003 COORDINATED / NONSECRET EXISTING-EVIDENCE INTAKE ONLY
source_control: bc7218357c112730fb12f52378a60203c83d655d
owner_approval: control/PP-002_Q02_C1_OWNER_EXTERNAL_EVIDENCE_APPROVAL.md
authorization: control/PP-002_Q02_C1_EXTERNAL_EVIDENCE_CAPTURE_AUTHORIZATION.md
route: routing/ROUTE-PP-002-Q02-C1_OWNER_CUSTODIAN_INTAKE.md
request: validations/PP-002/Q02-C1/C1_ATTRIBUTABLE_NONSECRET_CUSTODIAN_REQUEST.md
receipt_contract: validations/PP-002/Q02-C1/C1_EVIDENCE_RECEIPT_AND_ADJUDICATION_CONTRACT.md
acceptance_target: attributable platform/issuer/runtime metadata; independently reviewed later; NO S1/S2 self-approval
input_option_I: validations/PP-002/Q02-I/PP-002_IDENTITY_AND_ROUTE_EVIDENCE_REPORT.md @ blob 2d6f3d1911adb3869f69be6bf754be4a7e55a7a2
input_independent_QA: validations/PP-002/Q02-I/DQA-009_INDEPENDENT_EVIDENCE_QA_REPORT.md @ blob 3399a48b75763e650d41f49b2e28fbc52942ca62
frozen_six_gates: control/PP-002_Q02_B1_OWNER_SIX_GATE_DECISION.md
out_of_scope_backlog: backlog/GOV_BRANCH_RETIREMENT_DEFERRED_OBSERVATION.md

## Mission

Determine whether the actual execution environment and GitHub publication path can be bound to separately authorized, least-privileged actors, **including exclusion of the existing Owner/PC writer from E/B under fallback, restart, account/session-switch and direct alternative-tool use**. The previous Option I ID-01–08 matrix is source-bound but incomplete: 01,03,07,08 UNKNOWN and 02,04,05,06 PARTIAL. Do not repeat the existing metadata inventory as a substitute for missing authoritative platform/issuer/runtime evidence.

## Capture priorities / accountable custodians

Priority P0 — **Platform/connection custodian**: authoritative existing nonsecret statement whether per-conversation/project/runtime tool-availability, connected-GitHub-writer selection and account-switching are enforceably restricted. Require policy/system version, exact context/capability scope, allow/deny matrix, inheritance/restart/fallback, independent reviewer path; or affirmative NOT SUPPORTED/NOT AVAILABLE. Mere action-confirmation setting and chat-role distinction inadequate.

Priority P0 — **App/issuer custodian**: existing GitHub App registration ID/slug vs installation ID, actual auth mode per route, repository/operation subsets, the identity granting writes, issuance/expiration/revocation controls, nonsecret opaque event correlation and proof that B cannot obtain P credentials; or explicitly UNKNOWN/NOT AVAILABLE. No key/token/prefix/token-derived hash.

Priority P0 — **Runtime custodian**: if an external executor candidate already exists, nonsecret signed/attributed policy summary showing egress, credential store, host/metadata/socket/SSH helpers, mount/network namespace, nested processes and fallback/restart restrictions; otherwise answer NO EXISTING CANDIDATE or EVIDENCE NOT AVAILABLE. Do not build or probe a host under C1.

Priority P1 — **Repository Owner/administration custodian**: YU3DOH-only App grant and writer categories, branch/ruleset/classic/inherited/bypass and target-ref coverage (including main, control, product/ops), safe per-actor role/operation details and omissions. Do not expose other projects or sensitive collaborators/credentials. Existing GitHub ruleset list [] and protected=false are NOT complete proof of S2.

Priority P1 — **Existing publisher custodian, if any**: accepted immutable version of live data-only/guarded publisher, actual authentication/endpoint/ref/path/parent/CAS enforcement and direct-API fallback exclusion. Q01 offline PASS alone is not evidence of a deployed mandatory route. Missing publisher = NOT EXISTING/UNKNOWN.

## Intake boundaries

- PC-003 may publish this approval, request and nonsecret templates on meta/project-control, and record separately supplied safe evidence only after redaction and source/custody review under a subsequent additive receipt authorization. No other actor is automatically assigned a write permission by this scope.
- A source must state custodian identity/authority, version, exact target/context/repo/principal, observed vs claimed properties, read-only origin, times if available, redaction/coverage and limitations, immutable custody hash where safe and independent QA pathway.
- Public GitHub is **not** a general-purpose confidential evidence vault. Capture safe projections outside secrets first; if safe redaction loses decisive coverage, record that proof cannot be published and use a separately approved private custody process, never commit raw sensitive data then try to remove it.
- Do not send external messages to invented recipients. PC-003 can provide approved request text to Owner; external platform/operator contact requires a known appropriate route. No assertion that provider-side internals are exposed or support can certify features not documented.
- No GitHub/ChatGPT settings mutation, App provisioning, tokens, branches, new repo, destructive or negative write probes (even disposable), V-tests, candidate execution, secrets, external environment inspection, simulated permission claims or Q02 implementation.
- Outcome classifications: RECEIVED/SOURCE VERIFIED; PARTIAL; NOT AVAILABLE; NOT SUPPORTED; NOT EXISTING; UNKNOWN/BLOCKED. A paper QA acceptance of a capture does not certify S1/S2. External evidence MUST undergo independently routed adjudication before any GO recommendation.

## Stop and fallback

If P0 platform/issuer/runtime custodians cannot provide verifiable separation evidence, document the negative capability honestly and return to Owner with a separately authorized **C2 external executor/B2 design-only** proposal; avoid repeated no-new-information paper rounds. Original S2 protection obligation survives any placement change. Six Owner security controls remain unwaived. Q02-PROT-001 and B1/B2 technical implementation remain NO-GO.
