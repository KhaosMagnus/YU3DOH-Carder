# PP-002 — A1 Prerequisite Evidence-Access Feasibility

assignment: A1-PRE-EVID-001
author: PROTOCOL_PORTABILITY / PP-002
return_to: PROJECT_CONTROL / PC-003
repository: KhaosMagnus/YU3DOH-Carder
control_branch: meta/project-control
activation_CONTROL: 4b54d19b299b5eee0f75e166008edcba7f31c99e
activation_parent: f7561af7febd8d40194c55262a4972b4c020be2e
activation_tree: adc66de02f2b0bd388694a10d4b5b6a5aeae9545
output: validations/PP-002/Q02-A1-PRE/A1_PREREQUISITE_EVIDENCE_ACCESS_FEASIBILITY_REPORT.md
status: DOCUMENTARY FEASIBILITY ASSESSMENT COMPLETE / MATERIAL ACCESS GAPS
overall_security_proof_result: NOT_TESTED
technical_disposition: NO-GO / UNCHANGED
independent_QA: NOT PERFORMED OR ACTIVATED BY THIS ASSIGNMENT
recorded_at_UTC: 2026-11-06T07:56:24.208Z

## 1. Conclusion for PC-003

The permitted public sources support exact documentary custody, the recorded planning/QA baseline and a map of possible future evidence owners. They **cannot establish the actual per-call identity/privilege boundary or independently qualified P/issuer/server-CAS route**. Those actual attributable access mechanisms remain NOT_IDENTIFIED. Other routes are conditional on new authority and independent custody; a compatible actual transport remains UNKNOWN.

The main bottleneck is an independently attributable **issuer/runtime evidence channel outside the current authoring context**, linking a particular operation to the acting principal, effective grant and reachable privileged alternatives. Public Git author/committer fields, chat labels, a matching blob, a successful governance publication and generic provider documentation do not supply that chain. This is lack of established access, not proof that an external solution is impossible.

**Recommended next Owner decision:** a narrowly scoped external-provenance intake contract, with a named eligible issuer/runtime custodian, approved nonsecret fields, a qualified independent verifier and a safe custody channel, before further caller/infrastructure work. No custodian is contacted or appointed here. If a genuinely attributable custodian/channel cannot be identified, choose DEFER or separately authorize B2/identity architecture reconsideration. A second repository alone would not remedy the original S1/S2 requirements.

All eight security proof results are **NOT_TESTED**. No gate is closed, and no overall security PASS is issued.

## 2. Sources, evidence classes and information boundary

The source universe is the exhaustive public/nonsecret allowlist in G02. Reads used exact commit SHAs; no default branch or current CONTROL value was substituted for a selected source ref. Appendix A identifies every repository source/blob.

| Evidence class | Meaning in this report |
|---|---|
| OBSERVED PUBLIC METADATA | Returned public Git commit/tree/file identities, target absence, exact source membership and official documentation text. These observations concern document custody, not real privileges. |
| FROZEN DOCUMENTARY CLAIM | A published architecture, QA finding, coordinator disposition or recorded status at its exact source revision. Its technical statements are not fresh security observations. |
| OWNER-REPORTED | Prospective candidate/custody/availability statements attributed in F0C and carried by the accepted planning record. No new Owner facts or independent primary-message receipts were collected. |
| INFERRED FEASIBILITY | Reasoned future evidence route conditional on its issuer, authority, applicability and independent review. Not a promised capability or security finding. |
| UNKNOWN | Material evidence or source access not established. A source not requested because it is forbidden is not described as an observed 403 or a proven unavailable endpoint. |

The activation commit matches transferred parent `f7561af7febd8d40194c55262a4972b4c020be2e` and tree `adc66de02f2b0bd388694a10d4b5b6a5aeae9545`. Its complete nontruncated tree contains 1,886 non-tree predecessor entries, no AGENTS.md and no report at the authorized output path. All 26 cited repository source blobs match its membership; the design, DQA-013 and Q01 handoff were read at their separately selected immutable SHAs.

G07 PROJECT_STATE includes appended historical stages, including earlier pending states. Later exact DQA-013 disposition G17, Owner planning adoption G10 and this effective activation G01–G06 govern the recorded present assignment. Earlier PENDING/NOT YET DELIVERED prose is not promoted into a contradiction or silently edited by PP-002.

Historical Option I branch flags, repository/account metadata and connection observations are used only as **old published claims** in G22/G23. No current branch inventory, token/installation scope, account, ruleset, bypass or private setting was inspected. A historical public/personal-repository observation does not establish present organization/plan eligibility for an audit facility.

### Public official documentation — conceptual channels only

| ID | Official source | Bounded observation / nonclaim |
|---|---|---|
| D01 | [Generating an installation access token for a GitHub App](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-an-installation-access-token-for-a-github-app) | Repository/permission subsets are documented options within an installation's grant. This identifies a possible issuer-controlled evidence source, not this connection's effective rights. No token was requested or generated. |
| D02 | [Authenticating as a GitHub App installation](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/authenticating-as-a-github-app-installation) | Installation-authenticated requests are attributed to the App. That generic attribution does not identify the authentication mode, actual issuer or per-context route used here. |
| D03 | [Managing rulesets for a repository](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/managing-rulesets-for-a-repository) | Some ruleset views are available to readers; management is distinct. A possible public view does not override this task's prohibition on repository-specific ruleset/bypass inspection. No such page or endpoint was read. |
| D04 | [REST API endpoints for Git references — Update a reference](https://docs.github.com/en/rest/git/refs#update-a-reference) | The documented update body exposes sha and force; no expected-old SHA body field is specified. Fast-forward behavior is not evidence that a connector's expected_sha is atomically enforced remotely. |
| D05 | [GraphQL Commits — CreateCommitOnBranchInput](https://docs.github.com/en/graphql/reference/commits#createcommitonbranchinput) | The documented input includes expectedHeadOid. This is a conceptual candidate for later contract evaluation; it creates/updates a commit and is not proof of this connector's transport or an approved substitute for a prepared-commit publication design. |
| D06 | [Identifying audit log events performed by an access token](https://docs.github.com/en/enterprise-cloud@latest/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization/identifying-audit-log-events-performed-by-an-access-token) | Organization audit evidence can include authentication-related fields. Plan, account type, event coverage, retention and access applicability are unknown here. No organization/audit endpoint, token or token fingerprint was accessed or requested. |

These public pages are mutable documentation, not immutable project evidence or attestations. Original page event/version timestamps and Git blob SHAs are UNKNOWN. The final grouped documentation retrieval was invoked at 2026-11-06T07:50:43.880Z and returned at 2026-11-06T07:50:44.448Z; these are caller tool boundaries, not provider HTTP or event clocks. Targeted earlier excerpts supplied the token permission fields, REST update body and GraphQL expectedHeadOid field.

An older GraphQL input-object URL redirected to a general reference index. That index was not used to support expected-head semantics; the actual official Commits reference was separately retrieved and identified as D05. The percent-encoded organization-doc URL canonicalized to the same official documentation resource. Neither behavior was treated as a project source-ref fallback.

Only these documentation statements support potential methods. No documentation promise is converted into evidence that this project's account, connector, App, token, issuer, publisher or runtime implements them.

## 3. E01–E08 feasibility summary

The access field distinguishes **authorized access now** from whether evidence exists or could be obtained later. YES for a documentary fragment never means YES for the full technical claim.

Feasibility vocabulary:
- ACCESS_PATH_IDENTIFIED: a specific usable permitted documentary path is present for the stated limited fragment; not a security result.
- CONDITIONAL: a plausible owner/method exists, but actual authority, issuer, artifacts or applicability must first be established.
- NOT_IDENTIFIED: no attributable actual proof channel has been identified for the full required claim.
- UNKNOWN: feasibility depends on unprovided substrate/route choices and cannot presently be decided.

| ID | Required family | Authorized access now | Full-claim feasibility | Priority | Security proof |
|---|---|---|---|---|---|
| E01 | Actual per-call principal, grant and privileged alternatives | NO for actual rights/route proof; YES for historical public reports | NOT_IDENTIFIED | P0 / CRITICAL | NOT_TESTED |
| E02 | Original effective S2 and legitimate continuity | NO for target settings/probes; YES for published requirements and generic docs | CONDITIONAL | P0 / CRITICAL | NOT_TESTED |
| E03 | Restricted P, issuer and remote expected-old CAS | NO for actual implementation/issuer proof; YES for public API contracts | NOT_IDENTIFIED | P0 / CRITICAL | NOT_TESTED |
| E04 | Trusted independent FixtureSeal and pre-E oracle | YES for pinned design/bytes; NO for uncreated or unqualified trusted seal | CONDITIONAL | P0 / HIGH | NOT_TESTED |
| E05 | Actual E/V/Owner custody and runtime boundary | NO for device/private qualification; YES for attributed planning declarations | CONDITIONAL | P1 / HIGH | NOT_TESTED |
| E06 | Safe crossing compatible with disconnected E | NO for transfers or technical inspection; YES for the paper conflict analysis | UNKNOWN | P1 / HIGH | NOT_TESTED |
| E07 | Source placement and CONTENT_EVIDENCE composition | YES for public policy/static QA; NO for nonexistent caller validation | CONDITIONAL | P0 caller / P1 placement | NOT_TESTED |
| E08 | Limits, S3–S6, invocations and history | YES for frozen records; NO for measurements or new runtime/QA | CONDITIONAL | P1 dependencies / P2 later acceptance | NOT_TESTED |

For public document acquisition alone, an ACCESS_PATH_IDENTIFIED finding applies across the cited baseline. It does not replace the full-claim findings above. The full-family totals are two NOT_IDENTIFIED, five CONDITIONAL and one UNKNOWN. The detailed rows below preserve every field required by G02.

## 4. Detailed mandatory evidence-access matrix

### E01 — S1 actual identity, scope and alternative writers

| Field | Assessment |
|---|---|
| Exact required claim | Each material call is attributable to the actual acting principal/authentication mode and issued grant; E/V/P/PC capabilities and reachable alternate writers are independently mapped, with no common unrestricted writer or selectable privileged fallback. |
| Present cited source & SHA | G22 at `4b54d19b299b5eee0f75e166008edcba7f31c99e`, blob `2d6f3d1911adb3869f69be6bf754be4a7e55a7a2`; G23 at `4b54d19b299b5eee0f75e166008edcba7f31c99e`, blob `21dac1875e19a695bfdd0062adcd25860f642319`; G13 mandatory S1. |
| Evidence class | FROZEN DOCUMENTARY CLAIM for incomplete prior identity/route evidence; OBSERVED PUBLIC METADATA for those source identities and D01/D02/D06 text; INFERRED FEASIBILITY for possible issuer evidence; actual per-call binding UNKNOWN. |
| Expected independent issuer / trust root | The real connection/credential issuer and runtime capability administrator, with a GitHub-correlated event where available. Actual eligible custodian, relationship and authenticated nonsecret evidence channel are UNKNOWN. PP-002's role label is not that issuer. |
| Authorized access now | NO to token, installation scope, private context policy, privileged identity or audit reads. YES to cited public documents. No restricted read was attempted. |
| Future minimum read or test privilege | Separate Owner authorization for a custodian-supplied nonsecret attestation/extract of existing principal/App/install/grant and context-to-route binding, with time/effect scope and alternate-route coverage. No raw bearer, key, authorization header or token-derived fingerprint is needed from the Owner. Any runtime capability/denial experiment requires distinct technical authority. |
| Independent V / QA method | A separately authorized security reviewer checks authentic issuer provenance, request correlation, grant applicability, time window and completeness of fallback inventory using an approved source channel. A qualified V may hold safe bytes but cannot authenticate the issuer by hashing them. |
| Gap | Published account admin/push metadata or installation-selection statements are not per-call issued rights; public attribution categories are not proof of per-chat ACLs or negative capability. The current context's actual identity/alternate-route channel is NOT_IDENTIFIED. |
| Priority / feasibility / proof | P0 CRITICAL / NOT_IDENTIFIED / NOT_TESTED. |
| STOP / Owner decision | Do not issue another generic metadata inventory as a substitute. Owner/PC must identify a verifiable issuer/runtime custodian and channel, or DEFER/consider separately scoped identity redesign. No contact or privileged source retrieval under this report. |

### E02 — S2 effective original-ref protection, bypass and continuity

| Field | Assessment |
|---|---|
| Exact required claim | Original YU3DOH official/product/control/ops refs are effectively protected against the experimental principal, including bypasses/alternate routes, W/K and cross-writer lifecycle, force/delete, tags/releases/cleanup and a legitimate narrow PC/product continuity path. Negative denial and positive continuity have independent, applicable proof. |
| Present cited source & SHA | G13 at `4b54d19b299b5eee0f75e166008edcba7f31c99e`, blob `16c8ceecb50d59cb2e1d673e53dbaf1cf69610f5`; G19 at `4b54d19b299b5eee0f75e166008edcba7f31c99e`, blob `776e49fbaa8d9d7bdc324e6b79979653897ffee4`; G23 at `4b54d19b299b5eee0f75e166008edcba7f31c99e`, blob `21dac1875e19a695bfdd0062adcd25860f642319`; D03. |
| Evidence class | FROZEN DOCUMENTARY CLAIM for old flags, proposed F1 policy and M01/M02; OBSERVED PUBLIC METADATA only for source custody/docs; effective current rules, actors and behavior UNKNOWN. |
| Expected independent issuer / trust root | Authorized repository/security custodian supplying complete effective configuration and grant scope, correlated to actual GitHub enforcement; independent verifier different from the configuring actor. Relevant inherited/source-repository controls must be considered if applicable, not assumed absent. |
| Authorized access now | NO to repository-specific ruleset/bypass/protection inspection, even where a public view might exist; NO to negative probes. YES to requirements and official method documentation. D03's public-view possibility does not expand G02. |
| Future minimum read or test privilege | Separately approve an exact read-only effective-rule/bypass/alternate-writer inventory and bounded legitimate-work catalog. Any settings change or disposable denial/positive-continuity qualification is a different later grant with named actors, safe targets and containment. No original-ref negative write probe is proposed as an automatic next action. |
| Independent V / QA method | Verify readback completeness, enforcement mode, pattern/actor applicability, inherited rules and source timing. Separately authorized behavior qualification needs functioning positive controls and attributed denials, plus justified mapping from safe disposable targets to original requirements. |
| Gap | Old protected:false flags do not establish current absence or complete rules. Successful normal documentation publication does not prove denial to an experimental principal. F1 M01 legitimate-work/tag/cleanup window and M02 W/K cross-writer lifecycle are still obligations, not performed coverage. |
| Priority / feasibility / proof | P0 CRITICAL / CONDITIONAL / NOT_TESTED. |
| STOP / Owner decision | Select exact custodians/read scope first. Missing bypass, writer, continuity or mapping evidence leaves S2 unproven. No broad bypass, blanket freeze or branch-retirement audit to finish this intake. Original S2 remains mandatory under A1 or B2. |

### E03 — Restricted publisher, issuer and server CAS

| Field | Assessment |
|---|---|
| Exact required claim | A real restricted P/issuer outside E/V enforces exact accepted data, identity, repository/ref/path/tree/parent and authority without generic writer fallback; the chosen server transport enforces the required expected-old operation atomically, and uncertain acknowledgement is safely reconciled. |
| Present cited source & SHA | G20 at `4b54d19b299b5eee0f75e166008edcba7f31c99e`, blob `e90a622fe7980dd9e28f3f09a31ac1ecfacaafbd`; G21 at `4b54d19b299b5eee0f75e166008edcba7f31c99e`, blob `529bab3481b38084b46d62de840f11faa1631568`; G23 at `4b54d19b299b5eee0f75e166008edcba7f31c99e`, blob `21dac1875e19a695bfdd0062adcd25860f642319`; D01/D04/D05. |
| Evidence class | FROZEN DOCUMENTARY CLAIM for proposed P/broker and missing proof; OBSERVED PUBLIC METADATA for generic transport parameters; INFERRED FEASIBILITY for a future fixed adapter; actual implementation and independent issuer UNKNOWN. |
| Expected independent issuer / trust root | Real P/credential issuer, transport implementer and independently qualified reviewer, correlated to GitHub's actual chosen server operation. None is appointed or evidenced by the present publication tool. |
| Authorized access now | YES to conceptual public contracts; NO to issuer/grant inspection, installed publisher investigation, live race/CAS test or alternate write. |
| Future minimum read or test privilege | First authorize a nonsecret attributable implementation/transport contract and existing issuer-policy evidence. Only a later distinct permission may provision a publisher or run bounded disposable concurrency/denial/lost-ACK qualification. Preserve exact parent/tree, no-force and public-data boundaries. |
| Independent V / QA method | Trace the fixed call from accepted payload to authenticated issuer and actual server semantics; verify allowed endpoint/identity/path/ref controls and alternate-route exclusion. Later safe behavioral evidence must bind request/response/expected-old values, effects and original closer without blind retry. |
| Gap | Connector expected_sha exists as an interface, not independently observed wire/server behavior. D04 does not specify an expected-old body field; D05 documents a head-OID field on a different commit-creation operation. Choosing or adapting it changes the reviewed publication contract and needs explicit design acceptance; neither proves this connector uses it. |
| Priority / feasibility / proof | P0 CRITICAL / NOT_IDENTIFIED for actual P/issuer/transport proof; conceptual alternatives identified / NOT_TESTED. |
| STOP / Owner decision | Require attributable issuer/runtime evidence before committing to a transport design. Do not equate a successful lease or documented API with security qualification; do not silently replace prepared-commit/CAS semantics. If the actual boundary cannot be evidenced, DEFER or separately scope an independent publisher/identity architecture. |

### E04 — Trusted FixtureSeal and independent oracle

| Field | Assessment |
|---|---|
| Exact required claim | Expected source bytes/ref/path/blob, fixture/manifest/caller pins and oracles are independently established and sealed before E observes results, through a trusted producer/verifier channel outside E; a self-consistent E-controlled index cannot establish its own authority. |
| Present cited source & SHA | G14 at `04ac9787b2f9eb44e3e75f7084427e1b01614c97`, blob `6b5a718a8d430dd0d65873163a307a5129d72cab`; G15 at `0ead638be59e08572b63ffc7af3906e723d26e6b`, blob `158c5856f503e231cdf52feb7e12b037b118b465`; G24 at `4b54d19b299b5eee0f75e166008edcba7f31c99e`, blob `4f2080c9b90dd4f3d7fcbc780d8b42da0c6d9ba3`. |
| Evidence class | FROZEN DOCUMENTARY CLAIM for the design, static oracle reasoning and Q01 trust limit; OBSERVED PUBLIC METADATA for immutable file identity; INFERRED FEASIBILITY for external sealing; actual trusted seal/issuer UNKNOWN. |
| Expected independent issuer / trust root | A named, independently authorized fixture/oracle producer and verifier with an authenticated approval/custody root separate from E. Qualified V can verify custody after its own qualification; V is not currently a proven root. |
| Authorized access now | YES to public fixed design/QA/Q01 evidence; NO to creating fixtures, computing new oracle artifacts, collecting private custody attestations or inspecting V. |
| Future minimum read or test privilege | Separate documentary authority can define actual producer/channel/approval fields and oracle-generation contract. Actual materialization, digest/replay work, signing/sealing or witness activity requires its own implementation/execution and custody authority. No key or signing secret is requested. |
| Independent V / QA method | Independently derive/check approved expected bytes and all numeric pins, preserve pre-E approval/receipt ordering through source-bound IDs and clocks, check exact manifest membership, and distinguish original bytes from a projection. Validate the seal issuer through the approved channel, not E's report. |
| Gap | Public Git byte identity is available, but authenticity of the producing actor and pre-E custody are not. Synthetic fixed clocks and matching hashes cannot create that trust; T's planned BLOCK is not already an implemented feature. |
| Priority / feasibility / proof | P0 HIGH / CONDITIONAL / NOT_TESTED. |
| STOP / Owner decision | Name the independent producer/verifier and trusted channel before code admission. E-generated or post-result oracles, missing required source times or unresolvable custody block affected use. Do not repair historical U1–U7 by asserting a new seal. |

### E05 — Actual E/V/Owner custody

| Field | Assessment |
|---|---|
| Exact required claim | E is physically and technically disconnected from privileged/network routes; distinct V is credential-free and uses trusted review tooling; runtime/host/media boundaries, actual custodian appointment, supervision and successor/retention duties are independently evidenced. |
| Present cited source & SHA | G25 at `4b54d19b299b5eee0f75e166008edcba7f31c99e`, blob `082faf4ea6fefb47f466bd2ca48041b676176908`; G20 at `4b54d19b299b5eee0f75e166008edcba7f31c99e`, blob `e90a622fe7980dd9e28f3f09a31ac1ecfacaafbd`; G14/G15. |
| Evidence class | OWNER-REPORTED for Erebo/Alucard distinctness, conditional custody and outside-13:00–22:00 UTC−06 availability; FROZEN DOCUMENTARY CLAIM for architecture; actual condition/capability UNKNOWN. |
| Expected independent issuer / trust root | Owner as potential custodian of availability declarations; separately authorized qualified external runtime/host witness for actual isolation, plus an independent reviewer. Neither proposed alias is a technical identity or accepted appointment. |
| Authorized access now | NO to physical/OS/network/media inspection or private host reports; YES to published attributed declarations. No hardware or custodian contact occurred. |
| Future minimum read or test privilege | Later appoint roles and define a nonsecret evidence contract. Actual host/runtime capability qualification requires a separate narrowly bounded technical inspection/test grant with explicit allowed data and stop/containment; no credential access by default. |
| Independent V / QA method | Independent evidence of real capability boundaries and safe input/output custody, exact runtime/code identity and qualified V tools; direct observation/attestation applicability must be established rather than inferred from a different chat or machine name. |
| Gap | Reported physical distinctness/free time does not establish clean hardware, credential absence, trusted runtime, no IPC/egress/fallback or continuous supervision. No independent primary F0C message receipt is supplied by this assessment. |
| Priority / feasibility / proof | P1 HIGH / CONDITIONAL / NOT_TESTED. |
| STOP / Owner decision | Keep aliases as proposals. First identify a qualified witness and permitted nonsecret scope; no access, machine preparation, appointment or scheduling by implication. If usable independent evidence is unavailable, record UNKNOWN/DEFER rather than appointing the author as verifier. |

### E06 — Transport across disconnected E

| Field | Assessment |
|---|---|
| Exact required claim | Input/output can cross the E boundary to outside-E staging and V through an approved bounded custody/anti-contamination process without giving E live network/credential access, losing byte identity or exposing unsafe data. |
| Present cited source & SHA | G14 at `04ac9787b2f9eb44e3e75f7084427e1b01614c97`, blob `6b5a718a8d430dd0d65873163a307a5129d72cab`; G20 at `4b54d19b299b5eee0f75e166008edcba7f31c99e`, blob `e90a622fe7980dd9e28f3f09a31ac1ecfacaafbd`; G25. |
| Evidence class | OWNER-REPORTED NAS preference, speed limitation and proposed alternatives; FROZEN DOCUMENTARY CLAIM for disconnected-E conflict; actual route/security UNKNOWN; only conceptual feasibility inferred. |
| Expected independent issuer / trust root | A later appointed custodian, separately qualified boundary/staging operator and independent host/custody reviewer, with attributable records at each boundary. Actual roles and approved medium are UNKNOWN. |
| Authorized access now | NO to NAS, USB/media/cloud/messages/email contact or transfers; YES to paper comparison only. |
| Future minimum read or test privilege | A separate documentary route may freeze the high-level crossing model and evidence questions. Selecting/connecting media, handling real files, anti-contamination qualification or throughput/resource measurement needs another explicit technical/custody grant. |
| Independent V / QA method | Later review approved custody identities, original byte seals, boundary receipts, approved data eligibility and both-direction effects; qualified evidence must show disconnected E remains disconnected. No handling steps or presumed secure medium are supplied here. |
| Gap | Direct live NAS/email/cloud from E conflicts with the premise. Outside-E network staging or removable/courier concepts might fit only after actual isolation/custody qualification. Speed was not measured; no approved compatible route is currently identified. |
| Priority / feasibility / proof | P1 HIGH / UNKNOWN / NOT_TESTED. |
| STOP / Owner decision | Do not choose NAS by convenience or presume media safe. DEFER actual transfer until a separate architecture/custody decision and qualification route exists. No file transfer is justified to acquire the missing evidence under this assignment. |

### E07 — Source custody and CONTENT_EVIDENCE caller

| Field | Assessment |
|---|---|
| Exact required claim | Executable/source/evidence custody has an explicitly approved location and exact immutable candidate/allowlist; any CONTENT_EVIDENCE caller permits operation-state N/A only under independently reviewed purpose/authority/namespace/case/pin controls, while original Q01 and validators remain frozen. |
| Present cited source & SHA | G11 at `4b54d19b299b5eee0f75e166008edcba7f31c99e`, blob `8e00dd5ae7a153a09ce88c2614fbea2ce3f2393d`; G15 at `0ead638be59e08572b63ffc7af3906e723d26e6b`, blob `158c5856f503e231cdf52feb7e12b037b118b465`; G17 at `4b54d19b299b5eee0f75e166008edcba7f31c99e`, blob `7263254e983a964f83e02aaea77695b6b0060b46`; G14/G20/G24. |
| Evidence class | OBSERVED PUBLIC METADATA for exact policy/source identities; FROZEN DOCUMENTARY CLAIM for Q01 API static inspection and the unimplemented caller; OWNER-REPORTED preference for project documentation and possible dedicated source repo; proposed capability UNKNOWN/unimplemented. |
| Expected independent issuer / trust root | Owner/PC for exact location and scope decision; separately authorized implementer and independent code/contract reviewer for a new caller. The actual issuer/publisher remains E03, not a function-name assumption. |
| Authorized access now | YES to public policy/design/static QA and accepted Q01 reference; NO to code changes, fixtures, new repo/branch, code exception or executing the wrapper. |
| Future minimum read or test privilege | First a separately accepted location/caller contract. Any new source/caller implementation, regression/effect-counter testing, repository provisioning or grants needs its own exact authority; Q02-PROT-001 is not activated. |
| Independent V / QA method | Verify exact Git candidate SHA/tree and approved inventory; inspect original versus proposed API semantics, test only under later scope, check N/A eligibility/byte revalidation/namespace/authority at use, connected nominal sink and zero reject callbacks. Retain applicable full S6 rather than replacing it with four toy slots. |
| Gap | Frozen use_if_approved still requires state_check.result=PASS and matching bundle_sha256 even when requires_fresh_state=false. It cannot accept N/A. DQA-013 statically confirms the proposed separate composition is not implemented; its paper PASS is not a working caller. Control remains documentation-only, and source location is UNDECIDED. |
| Priority / feasibility / proof | P0 HIGH caller / P1 placement; CONDITIONAL / NOT_TESTED. |
| STOP / Owner decision | No forged state-check PASS, Q01 patch, code-as-Markdown or silent A2/B2 choice. Later choose a narrow exact code-policy exception, separately scoped independent nonproduct source custody, or DEFER. A local hash alone cannot replace original C2/S6 immutable Git candidate acceptance. |

### E08 — Limits, S3–S6, invocation accounting and history

| Field | Assessment |
|---|---|
| Exact required claim | Exact S3 authority/source/runtime/fixture/caller/output allowlists and every invocation/effect are frozen; limits are enforceable/measured for the actual run; S4/S5 operate throughout; independent S6 reviews exact candidate and applicable full contracts; historical provenance statuses remain separate. |
| Present cited source & SHA | G15 at `0ead638be59e08572b63ffc7af3906e723d26e6b`, blob `158c5856f503e231cdf52feb7e12b037b118b465`; G08 at `4b54d19b299b5eee0f75e166008edcba7f31c99e`, blob `4b1a7820a75fd52d93131a2fd32683eb799731f5`; G26 at `4b54d19b299b5eee0f75e166008edcba7f31c99e`, blob `1aae433307fada71008405ce06a212b0f3d1a9e6`; G13/G14/G24. |
| Evidence class | FROZEN DOCUMENTARY CLAIM for N/M/U/T, two-root counts, proposed limits and QA findings; OBSERVED PUBLIC METADATA for exact records; resource/implementation behavior UNKNOWN. |
| Expected independent issuer / trust root | Actual future implementer/runtime measurer and separately authorized independent QA/security/custody reviewer; PC for the exact accepted scope. Actual executing source/caller/runtime and reviewer assignment are UNKNOWN. |
| Authorized access now | YES to exact planning/QA/history records; NO to benchmark, fixtures, simulation, runtime audit, full QA replay or private original-message recovery. |
| Future minimum read or test privilege | Separately freeze exact S3 packet after source/caller and security decisions. Resource/runtime measurement and S4/S5 execution require distinct authority. Full S6 independent QA follows actual authorized candidate creation, not beforehand. |
| Independent V / QA method | Whole input/output/mode/count/byte inventory, full invocation trace including approve/revalidation calls, trusted resource/effect observations, exact semantic equality and closure/retention. Distinguish logical negative expected results from process outcome and cleanup state. |
| Gap | DQA-013 M01: 120 seconds/512 MiB and custody schedule are unmeasured proposals. DQA-013 M02: six semantic Q01 evaluations do not account for every possible approval/revalidation invocation. These are distinct from F1 M01 continuity and F1 M02 W/K lifecycle. S3–S6 have not occurred. |
| Priority / feasibility / proof | P1 dependencies / P2 downstream acceptance; CONDITIONAL / NOT_TESTED. |
| STOP / Owner decision | Missing exact code/allowlist, unbounded calls/effects/cleanup or incompatible caps requires revised approval, not silent expansion. Preserve DQA-011 CLOSED/INCONCLUSIVE U1–U7 and DQA-012 INACTIVE; missing original receipts are not repaired by a later successful rehearsal. |

## 5. Access findings that materially change the next decision

### 5.1 Public access is not the missing trust boundary

Exact source identity and recorded paper acceptance are recoverable now. Actual acting-principal exclusion and trusted publication/capture need issuer/runtime evidence. The currently permitted source universe contains no authenticated project-specific issuer/host attestation. No denied access was tested to reach that conclusion; the missing proof is documented as absent from the inspected public corpus and outside this grant.

D03 prevents an overly broad claim that all rule views inherently require administrative permission. It does **not** authorize this assignment to read project-specific rules/settings; a later Owner route may explicitly allow a limited public view before considering privileged extracts. Public visibility still would not prove actual behavior or all alternative writers.

D06 is an organizational/plan-dependent possibility, not a guaranteed channel for this repository or connector. No organization membership, enterprise entitlement, audit availability or retention was discovered here. If a future issuer cannot supply correlation safely, the result remains UNKNOWN; no token string, private log dump or credential hash should be requested to work around it.

### 5.2 CAS feasibility is distinct from verified transport

D04/D05 identify different public contracts. An expected head field suggests a method worth later design review; it is not a qualified actual adapter, an atomicity experiment or permission to replace the accepted publication flow. The caller must ultimately bind whole payload/tree, expected predecessor, actual issuer, outcome and reconciliation. Even a correctly implemented CAS would not establish source truth, E/V isolation or all S2 denial properties.

The report's own normal expected_sha/force=false publication is authorized concurrency bookkeeping. Its success must not appear in E02/E03 as independent proof.

### 5.3 Additional paper QA cannot create absent source evidence

DQA-013 already accepted paper quality while retaining H01–H05 and M01/M02. Another reviewer of the same public statements could improve this report's fidelity but could not supply missing actual issuer, host or remote-effect records. A future review route should state precisely whether it assesses document quality or newly acquired attributable technical evidence, and anticipate INCONCLUSIVE where the latter is unavailable.

## 6. Proposed next Owner decision and dependency order

**Recommendation for consideration only — no successor activated:** ask PC-003 to prepare a bounded **external issuer/runtime provenance intake contract**. Its first exit condition should be identification of a real eligible custodian and independently verifiable channel, not another AI/support paraphrase or private transcript export.

A minimally reviewable proposed packet would identify:

1. The evidence-producing organization/role and authoritative relationship to the actual connection/runtime, with a safe nonsecret way for the independent reviewer to validate that relationship. Actual source/contact details are UNKNOWN; nobody is contacted here.
2. The exact question set for E01/E03: operation correlation, authentication/issuer mode, applicable grants/time window, context capability and excluded privileged alternatives. No raw token/key/header, secret identifier or full private export.
3. An approved independent reviewer and custody path. If verification requires restricted underlying records, a new explicit read-only/private custody scope must define access, permitted projections, retained originals and public-safe disposition before acquisition. Public hashes of a projection must not be represented as full original evidence.
4. Explicit stop at unavailable source, unverifiable issuer, ambiguous correlation, secret-bearing content or required privilege beyond the route; no new credential, setting change, test, publisher or runtime.
5. A bounded return of attributable nonsecret evidence or a documented inability to supply it. An honest inability is actionable and must not be converted to proof of universal technical impossibility.

These points are a proposed authorization contract, not instructions for PP-002 to collect that evidence now.

| Later decision branch | Consequence to propose to Owner |
|---|---|
| Eligible issuer/runtime custodian and verifier can be named | Separately authorize exact nonsecret existing-evidence intake; no live security test. Then decide the smallest E02 rule/continuity read scope using actual identified actors. |
| Custodian requires privileged/private access | Stop at proposal; obtain a separately explicit access/custody authority or retain UNKNOWN. Current approval cannot be stretched. |
| Actual route separation is unavailable or cannot be evidenced | DEFER implementation; optionally authorize distinct B2/issuer architecture design only. B2 creation/grants and original S2 still require separate decisions. |
| Trustworthy FixtureSeal producer/channel absent | DEFER admission; resolve independent root/oracle custody rather than E-authored self-attestation. |
| Host/transport/location unresolved | Keep E05/E06/E07 blocks scoped. A documentation-only location preference does not authorize infrastructure or guarantee a feasible alternate store. |

Only after source identity/security decisions should a later exact caller/source-location scope be considered. It must preserve Q01 and independently review the new CONTENT_EVIDENCE boundary. Original S1/S2 and applicable S3–S5 readiness precede technical execution; S4/S5 require during-run evidence, and full S6 follows actual candidate delivery. No F1/F2, Q02-PROT-001, implementation, provisioning, security configuration, probes or QA activation follows automatically.

## 7. Stop rules, custody and administrative proportionality

No hardware, OS, network, NAS/media/cloud, USB, messages, email, private account, token, installation grants, project rulesets/bypasses, privileged endpoint, security probe or experimental mutable API was accessed. Public documentation pages that describe such mechanisms are not use of those mechanisms.

Any future source read that falls outside its exact grant must stop before access. Do not use browser/session fallback, a different credential/connection, an unapproved default ref or another actor's private material to complete a row. Missing material identity/time/custody stays UNKNOWN; silent source substitution is not recovery.

This assignment inspected 26 distinct pinned repository documents plus their public Git custody and six canonical official documentation sources. Search, targeted excerpts and documentation redirects required multiple retrievals; six sources is not a claim of six total web requests. No Q01/Python/fixture/simulation/benchmark/security diagnostic command ran. Code Mode only orchestrated permitted reads and report assembly/publication.

The proportional next action is one short attributable channel qualification, not a full security or hardware campaign. New source acquisition, independent review, private custody, configuration and behavioral tests are different authority classes and should not be bundled as a generic preflight. Costs/runtime/success probability remain unmeasured.

The sole permitted mutation is this report's additive documentation publication, using compatible current HEAD, a single parent, expected_sha and force=false. No central index, frozen source/validator or product/ops ref is targeted. No fresh inspection of live product/ops heads or protection status is claimed. Full predecessor tree preservation can establish the documentation delta, not independent live-ref security.

## 8. Preserved official status and terminal return

S1/S2 NOT INDEPENDENTLY PROVEN. S3–S6 NOT EXECUTED. CONTENT_EVIDENCE UNIMPLEMENTED. FixtureSeal/oracles, actual E/V, transport, source placement, restricted P/issuer/server CAS remain unqualified. Q02-PROT-001 and F1/F2 NO-GO.

A1-P1 design is the Owner-accepted **documentary planning reference** under G10, with DQA-013 CLOSED/PASS 12/12 for paper quality only; the earlier proposal/QA phrases pending Owner adoption are historical and superseded only within this paper-planning scope. No new trial result exists.

DQA-011 CLOSED/INCONCLUSIVE; F0-Q02 U1–U7 UNCORROBORATED. F0C remains partial Owner-declared planning without independently authenticated primary receipt. DQA-012 INACTIVE; no independent QA allocated by this task. No private original-message comparison accessed or authorized.

Q01 original reference `328e57035d34f98c4d8d417729e8b12f91894e95` retains its independent offline-only PASS. F1 and C2 retain paper/documentary PASS, Option I evidence-quality PASS. Gate C/final PP-002 REVISE; P01 UNCERTAIN / P02 UNKNOWN. Generic Protocol v1.0 and PP-002 v2 FROZEN/UNCHANGED. GOV-BRANCH-001 DEFERRED; no branch-retirement work.

PP-002 returns the exact publication CONTROL SHA, parent, tree and report Git blob after readback, together with E01–E08 findings and the proposed next Owner decision. This report cannot include its own containing publication identity self-referentially. PC-003 owns disposition; no self-approval, security acceptance or successor activation.

**Terminal result: DOCUMENTARY EVIDENCE-ACCESS FEASIBILITY COMPLETE / MATERIAL ACCESS GAPS / ALL SECURITY PROOF NOT_TESTED / TECHNICAL NO-GO. STOP AND RETURN TO PC-003.**

## Appendix A — Repository source custody

Unless separately pinned below, each source was read at activation 4b54d19b299b5eee0f75e166008edcba7f31c99e. G14 was read at frozen design CONTROL `04ac9787b2f9eb44e3e75f7084427e1b01614c97`; G15 at DQA-013 `0ead638be59e08572b63ffc7af3906e723d26e6b`; G16 at Q01 `328e57035d34f98c4d8d417729e8b12f91894e95`. Their exact blobs also match activation membership. Official web documentation has URLs and caller custody above, not invented Git SHAs.

| ID | Exact source revision/path | Git blob |
|---|---|---|
| G01 | [control/PP-002_Q02_A1_PRE_EVID_OWNER_APPROVAL.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/4b54d19b299b5eee0f75e166008edcba7f31c99e/control/PP-002_Q02_A1_PRE_EVID_OWNER_APPROVAL.md) | `21aec7ec0b4d4cf50fb8ff3fc96e5064b05a3c13` |
| G02 | [control/PP-002_Q02_A1_PRE_EVID_FROZEN_SCOPE.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/4b54d19b299b5eee0f75e166008edcba7f31c99e/control/PP-002_Q02_A1_PRE_EVID_FROZEN_SCOPE.md) | `eacb09b4dfa4b4bdce71e7837dddc625a013d2c5` |
| G03 | [control/PP-002_Q02_A1_PRE_EVID_EFFECTIVE_AUTHORIZATION.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/4b54d19b299b5eee0f75e166008edcba7f31c99e/control/PP-002_Q02_A1_PRE_EVID_EFFECTIVE_AUTHORIZATION.md) | `3e3f341cfcba8d7eabab0cf343b7d88252725f02` |
| G04 | [validations/PP-002/Q02-A1-PRE/A1_PRE_EVID_DOCUMENTARY_FEASIBILITY_REQUEST.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/4b54d19b299b5eee0f75e166008edcba7f31c99e/validations/PP-002/Q02-A1-PRE/A1_PRE_EVID_DOCUMENTARY_FEASIBILITY_REQUEST.md) | `92cb438024cae44335c13f96accc86f5ebb4f0b9` |
| G05 | [routing/ROUTE-PP-002-Q02-A1-PRE-EVID-001.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/4b54d19b299b5eee0f75e166008edcba7f31c99e/routing/ROUTE-PP-002-Q02-A1-PRE-EVID-001.md) | `11c669c1807c2a819b6271f62b992b102a668269` |
| G06 | [runs/PP-002_Q02_A1_PRE_EVID_ACTIVATION.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/4b54d19b299b5eee0f75e166008edcba7f31c99e/runs/PP-002_Q02_A1_PRE_EVID_ACTIVATION.md) | `263d22c0294525fda4e33d2907d8e8fab2edf596` |
| G07 | [PROJECT_STATE.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/4b54d19b299b5eee0f75e166008edcba7f31c99e/PROJECT_STATE.md) | `1f2db0b04a147cfd0d22dba0bbd1d2921dd9d9a4` |
| G08 | [control/PP-002_Q02_A1_P1_PREREQUISITE_CLOSURE_PROPOSAL.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/4b54d19b299b5eee0f75e166008edcba7f31c99e/control/PP-002_Q02_A1_P1_PREREQUISITE_CLOSURE_PROPOSAL.md) | `4b1a7820a75fd52d93131a2fd32683eb799731f5` |
| G09 | [control/PP-002_Q02_A1_P1_NEXT_OWNER_EVIDENCE_PREFLIGHT_DECISION_REQUEST.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/4b54d19b299b5eee0f75e166008edcba7f31c99e/control/PP-002_Q02_A1_P1_NEXT_OWNER_EVIDENCE_PREFLIGHT_DECISION_REQUEST.md) | `ee6381de39e833b2c90e58465bf1f878d4a7b014` |
| G10 | [control/PP-002_Q02_A1_P1_POST_DQA013_OWNER_OPTION_A_APPROVAL.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/4b54d19b299b5eee0f75e166008edcba7f31c99e/control/PP-002_Q02_A1_P1_POST_DQA013_OWNER_OPTION_A_APPROVAL.md) | `15f9454f15ea9bd3e863586c3890818a910baf7c` |
| G11 | [protocols/GIT_CONTROL_POLICY.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/4b54d19b299b5eee0f75e166008edcba7f31c99e/protocols/GIT_CONTROL_POLICY.md) | `8e00dd5ae7a153a09ce88c2614fbea2ce3f2393d` |
| G12 | [protocols/CONCURRENT_PUBLICATION_POLICY.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/4b54d19b299b5eee0f75e166008edcba7f31c99e/protocols/CONCURRENT_PUBLICATION_POLICY.md) | `9b7c4dfed7b25b98b61e73f342592359b846e490` |
| G13 | [control/PP-002_Q02_B1_OWNER_SIX_GATE_DECISION.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/4b54d19b299b5eee0f75e166008edcba7f31c99e/control/PP-002_Q02_B1_OWNER_SIX_GATE_DECISION.md) | `16c8ceecb50d59cb2e1d673e53dbaf1cf69610f5` |
| G14 | [handoffs/PP-002_Q02_A1_P1_SYNTHETIC_REHEARSAL_DESIGN_SPECIFICATION.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/04ac9787b2f9eb44e3e75f7084427e1b01614c97/handoffs/PP-002_Q02_A1_P1_SYNTHETIC_REHEARSAL_DESIGN_SPECIFICATION.md) | `6b5a718a8d430dd0d65873163a307a5129d72cab` |
| G15 | [validations/PP-002/Q02-A1-P1-DES/P1_DES_INDEPENDENT_DESIGN_QA_REPORT.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/0ead638be59e08572b63ffc7af3906e723d26e6b/validations/PP-002/Q02-A1-P1-DES/P1_DES_INDEPENDENT_DESIGN_QA_REPORT.md) | `158c5856f503e231cdf52feb7e12b037b118b465` |
| G16 | [handoffs/PP-002_Q01_COLLECTOR_CORRECTION_DESIGN_HANDOFF.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/328e57035d34f98c4d8d417729e8b12f91894e95/handoffs/PP-002_Q01_COLLECTOR_CORRECTION_DESIGN_HANDOFF.md) | `c72e0a6d0889ceee4e901126a33587072180017f` |
| G17 | [runs/PP-002_Q02_A1_P1_DQA013_DOCUMENTARY_PASS_DISPOSITION.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/4b54d19b299b5eee0f75e166008edcba7f31c99e/runs/PP-002_Q02_A1_P1_DQA013_DOCUMENTARY_PASS_DISPOSITION.md) | `7263254e983a964f83e02aaea77695b6b0060b46` |
| G18 | [handoffs/PP-002_Q02_F1_FEASIBILITY_AND_CONFIGURATION_CONTRACT.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/4b54d19b299b5eee0f75e166008edcba7f31c99e/handoffs/PP-002_Q02_F1_FEASIBILITY_AND_CONFIGURATION_CONTRACT.md) | `96b23062330006f59790883e87df4c095b37c5b2` |
| G19 | [runs/PP-002_Q02_F1_DQA-008_PASS_DISPOSITION.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/4b54d19b299b5eee0f75e166008edcba7f31c99e/runs/PP-002_Q02_F1_DQA-008_PASS_DISPOSITION.md) | `776e49fbaa8d9d7bdc324e6b79979653897ffee4` |
| G20 | [handoffs/PP-002_Q02_C2_EXTERNAL_ISOLATION_DESIGN_HANDOFF.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/4b54d19b299b5eee0f75e166008edcba7f31c99e/handoffs/PP-002_Q02_C2_EXTERNAL_ISOLATION_DESIGN_HANDOFF.md) | `e90a622fe7980dd9e28f3f09a31ac1ecfacaafbd` |
| G21 | [runs/PP-002_Q02_C2_DQA-010_DESIGN_PASS_DISPOSITION.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/4b54d19b299b5eee0f75e166008edcba7f31c99e/runs/PP-002_Q02_C2_DQA-010_DESIGN_PASS_DISPOSITION.md) | `529bab3481b38084b46d62de840f11faa1631568` |
| G22 | [validations/PP-002/Q02-I/PP-002_IDENTITY_AND_ROUTE_EVIDENCE_REPORT.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/4b54d19b299b5eee0f75e166008edcba7f31c99e/validations/PP-002/Q02-I/PP-002_IDENTITY_AND_ROUTE_EVIDENCE_REPORT.md) | `2d6f3d1911adb3869f69be6bf754be4a7e55a7a2` |
| G23 | [runs/PP-002_Q02_I_DQA-009_EVIDENCE_PASS_DISPOSITION.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/4b54d19b299b5eee0f75e166008edcba7f31c99e/runs/PP-002_Q02_I_DQA-009_EVIDENCE_PASS_DISPOSITION.md) | `21dac1875e19a695bfdd0062adcd25860f642319` |
| G24 | [runs/PP-002_Q01_DQA-007_PASS_DISPOSITION.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/4b54d19b299b5eee0f75e166008edcba7f31c99e/runs/PP-002_Q01_DQA-007_PASS_DISPOSITION.md) | `4f2080c9b90dd4f3d7fcbc780d8b42da0c6d9ba3` |
| G25 | [validations/PP-002/Q02-A1-F0C/PP-002_A1_F0C_DOCUMENTARY_FEASIBILITY_CLARIFICATION_REPORT.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/4b54d19b299b5eee0f75e166008edcba7f31c99e/validations/PP-002/Q02-A1-F0C/PP-002_A1_F0C_DOCUMENTARY_FEASIBILITY_CLARIFICATION_REPORT.md) | `082faf4ea6fefb47f466bd2ca48041b676176908` |
| G26 | [runs/PP-002_Q02_A1_F0_DQA011_INCONCLUSIVE_DISPOSITION.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/4b54d19b299b5eee0f75e166008edcba7f31c99e/runs/PP-002_Q02_A1_F0_DQA011_INCONCLUSIVE_DISPOSITION.md) | `1aae433307fada71008405ce06a212b0f3d1a9e6` |

## Appendix B — Source-read caller clocks

These clocks mark connector invocation/return, not network wire dispatch, signed provider observation or original Owner-message events. Source event_at and independent identity-attestation time are UNKNOWN unless explicitly supported in a source; report recorded_at is assembly only. A later read of an old report does not make its security observations fresh.

| Source | requested_at UTC | receipt_at UTC |
|---|---|---|
| G01 | 2026-11-06T07:45:07.555Z | 2026-11-06T07:45:07.895Z |
| G02 | 2026-11-06T07:45:07.556Z | 2026-11-06T07:45:07.891Z |
| G03 | 2026-11-06T07:45:07.556Z | 2026-11-06T07:45:08.022Z |
| G04 | 2026-11-06T07:45:07.556Z | 2026-11-06T07:45:07.902Z |
| G05 | 2026-11-06T07:45:07.556Z | 2026-11-06T07:45:07.825Z |
| G06 | 2026-11-06T07:45:07.556Z | 2026-11-06T07:45:07.866Z |
| G07 | 2026-11-06T07:45:42.184Z | 2026-11-06T07:45:42.916Z |
| G08 | 2026-11-06T07:45:42.184Z | 2026-11-06T07:45:42.571Z |
| G09 | 2026-11-06T07:45:42.184Z | 2026-11-06T07:45:42.567Z |
| G10 | 2026-11-06T07:45:42.184Z | 2026-11-06T07:45:42.540Z |
| G11 | 2026-11-06T07:45:42.184Z | 2026-11-06T07:45:42.564Z |
| G12 | 2026-11-06T07:45:42.184Z | 2026-11-06T07:45:42.594Z |
| G13 | 2026-11-06T07:45:42.184Z | 2026-11-06T07:45:42.610Z |
| G14 | 2026-11-06T07:46:46.367Z | 2026-11-06T07:46:46.808Z |
| G15 | 2026-11-06T07:46:46.367Z | 2026-11-06T07:46:46.683Z |
| G16 | 2026-11-06T07:46:46.368Z | 2026-11-06T07:46:46.719Z |
| G17 | 2026-11-06T07:46:46.368Z | 2026-11-06T07:46:46.685Z |
| G18 | 2026-11-06T07:46:46.368Z | 2026-11-06T07:46:46.715Z |
| G19 | 2026-11-06T07:46:46.368Z | 2026-11-06T07:46:46.753Z |
| G20 | 2026-11-06T07:46:46.368Z | 2026-11-06T07:46:46.738Z |
| G21 | 2026-11-06T07:46:46.368Z | 2026-11-06T07:46:46.686Z |
| G22 | 2026-11-06T07:46:46.368Z | 2026-11-06T07:46:46.719Z |
| G23 | 2026-11-06T07:46:46.368Z | 2026-11-06T07:46:46.671Z |
| G24 | 2026-11-06T07:46:46.368Z | 2026-11-06T07:46:46.658Z |
| G25 | 2026-11-06T07:46:46.368Z | 2026-11-06T07:46:46.691Z |
| G26 | 2026-11-06T07:46:46.368Z | 2026-11-06T07:46:46.655Z |
