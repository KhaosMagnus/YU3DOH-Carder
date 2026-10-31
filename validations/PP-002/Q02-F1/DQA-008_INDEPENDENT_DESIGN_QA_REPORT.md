# DQA-008 — Independent F1 B1 Security Feasibility and Configuration Contract Review

artifact_id: PP-002-Q02-F1-DQA-008-INDEPENDENT-DESIGN-QA-REPORT
assignment: F1-DQA-001
reviewer: DESIGN_QA / DQA-008
return_to: PROJECT_CONTROL / PC-003
repository: KhaosMagnus/YU3DOH-Carder
QA_activation_control: d782f283920bedb24088b65cb45f5d304f839ee2
candidate_control: deabe05ff68facee4ac36a9ef45c599a54331c83
candidate_parent_authority: 708f014d7af6549f677aedcb2ab01cd53228e4e9
candidate_path: handoffs/PP-002_Q02_F1_FEASIBILITY_AND_CONFIGURATION_CONTRACT.md
candidate_blob: 96b23062330006f59790883e87df4c095b37c5b2
paper_design_disposition: PASS
live_configuration_disposition: NOT APPROVED / NOT PERFORMED
S1_S2: NOT INDEPENDENTLY PROVEN
B1_implementation: NO-GO
V01_V20_execution: NONE
Q02_PROT_001_implementation_or_tests: NONE

## 1. Independent conclusion and limits

**PASS for the PAPER DESIGN CONTRACT ONLY.** The proposal is sufficiently source-bound, technically plausible, candid about unavailable facts, and bounded for an informed Owner placement decision and subsequent preparation of a separately reviewed exact configuration packet. This is not acceptance of deployable JSON, current security, a ruleset change, a signer, or a prototype.

No BLOCKING/HIGH paper-design defect was established. Two MEDIUM operational/qualification refinements and one LOW observation improvement are recorded below. They must be addressed in the later packet if B1 is selected; they do not require rewriting the frozen handoff or obtaining real permissions to complete this paper review. The contract already makes unresolved configuration/continuity facts non-executable. Treating this PASS as an S1/S2 PASS would contradict this report and the Owner's six-gate decision.

Independent recommendation: **prefer separately scoped B2 for this bounded offline prototype unless the Owner also independently wants durable YU3DOH writer controls and can obtain enforceable context separation.** The strongest basis is lower coupling and smaller experimental credential blast radius, not the unmeasured effort ratio. B2 with a selectable broad PC connection would still fail isolation. Original-ref S2 remains an explicit Owner/PC obligation under the frozen decision; B2 neither supplies that evidence nor waives it.

This review used permitted GitHub GETs, immutable file/tree/commit comparisons and official GitHub documentation. No settings, credentials, applications, installations, branches, tags, workflows, issues or PRs were created or modified. No V check, prototype, executable negative probe or connection-switch attempt was run. The sole authorized mutation is publication of this new report on the existing control branch. Reviewer role separation is procedural here; this report does not claim that this review context has a separately proven GitHub principal.

## 2. Authority, custody and chronology

The QA scope, authorization, request and route at the exact activation revision were retrieved directly:

| Input at QA activation | Git blob |
|---|---|
| control/PP-002_Q02_F1_DQA-008_INDEPENDENT_REVIEW_SCOPE.md | 44fd25a6f0d568b01a96aedf8210939ffa888cfb |
| control/PP-002_Q02_F1_DQA-008_INDEPENDENT_QA_AUTHORIZATION.md | 30a6d0f64e36c434fed6950196f73ac606bd6f31 |
| validations/PP-002/Q02-F1/DQA-008_INDEPENDENT_DESIGN_QA_REQUEST.md | d2f313eabdaec240141ce7993aedc4cfc9e2c4d8 |
| routing/ROUTE-PP-002-Q02-F1-DQA-008.md | b62cb099421b24baec1bc460601c6bcf01ac5e4a |

Verified relevant publication chain:

1. F1 authority/input control: 708f014d7af6549f677aedcb2ab01cd53228e4e9; tree 5ace67b7057ac83504073ddf7ba8ae169a870d47.
2. Candidate deabe05ff68facee4ac36a9ef45c599a54331c83 has exactly that one parent; tree 5f720a74227cd8e46e4299131287770267bc7efd.
3. QA activation d782f283920bedb24088b65cb45f5d304f839ee2 has exactly candidate deabe05ff68facee4ac36a9ef45c599a54331c83 as parent; tree b5ee5e9d66a51addf612c9d9cbb43b26c7581101.

The REST commit changed-file list and independent full recursive-tree comparison agree: candidate adds only the handoff, mode 100644, blob 96b23062330006f59790883e87df4c095b37c5b2, 76147 bytes. All 1762 predecessor blobs retain paths, modes and SHA identities; no removed/modified predecessor blob. Parent tree: 1887 entries; candidate: 1888; both explicitly nontruncated. Activation tree: 1894 entries, nontruncated; no AGENTS.md. Candidate blob is unchanged at activation.

The activation's nine-file coordinator publication legitimately updates PROJECT_STATE, registry and instance routing and adds the four QA inputs. Those central-index changes belong to PC-003, not the F1 candidate or this reviewer. The historical source versions remain pinned below; they must not be substituted by the current indexes. Current PROJECT_STATE and registry were separately reread and preserve design-only status, Q01 offline PASS, Q02 acceptance and implementation NO-GO. The historical BACKLOG Gate C pending line is stale, not new authority.

All sixteen candidate source-register paths were independently retrieved at 708f014d7af6549f677aedcb2ab01cd53228e4e9 and their returned blob identities matched the nontruncated source tree and the candidate's register. These are GitHub blob/tree identity checks, not a claim to have reconstructed the author's historical HTTP receipt archive.

| Historical input path | Verified Git blob |
|---|---|
| control/PP-002_Q02_F1_OWNER_FEASIBILITY_APPROVAL.md | 1475241fc3ffb636498d96b2fb3210bb6566cc68 |
| control/PP-002_Q02_F1_FEASIBILITY_CONTRACT_SCOPE.md | b488bafdc8f642ae1af824477675d6d0658ece08 |
| control/PP-002_Q02_F1_FEASIBILITY_DESIGN_AUTHORIZATION.md | 58db8439e2147c58ad6eddfaa8c38bc66a5c19d0 |
| routing/ROUTE-PP-002-Q02-F1-FEASIBILITY-CONTRACT.md | 275c8d3548aeba33e429ccc69b9139c1a9c8e1a0 |
| validations/PP-002/Q02-B1-SECURITY/PC-003_F1_READ_ONLY_CONFIGURATION_SNAPSHOT.md | f101dfbe6eef33b24ffa01e0f0e3e200ebe284bf |
| handoffs/PP-002_Q02_B1_PERMISSION_ISOLATION_DESIGN_HANDOFF.md | d89194237b128b76379533412baec5a56f754b20 |
| runs/PP-002_Q02_B1_SECURITY_DESIGN_ACCEPTANCE.md | 0f9c4921a2e7a08aa0c52ac800473c25be1bcd9b |
| PROJECT_STATE.md | 391ae778b03e0f88030586bfda75079d2ab50d55 |
| chats/CHAT_REGISTRY.md | 6f49c0d9571a276dd5cf60a69bd0595f28de67c7 |
| protocols/CONCURRENT_PUBLICATION_POLICY.md | 9b7c4dfed7b25b98b61e73f342592359b846e490 |
| protocols/GIT_CONTROL_POLICY.md | 8e00dd5ae7a153a09ce88c2614fbea2ce3f2393d |
| control/PP-002_Q02_B1_OWNER_SIX_GATE_DECISION.md | 16c8ceecb50d59cb2e1d673e53dbaf1cf69610f5 |
| backlog/BACKLOG.md | 7e3ab6f88c4b6bdc57d359099f866f3e7db7c692 |
| handoffs/PP-002_Q02_Q01_CONTROL_INTEGRATION_DESIGN_HANDOFF.md | a06fb711662848ccc16d2e32d621be279a9b1f4d |
| control/PP-002_Q02_OFFLINE_PROTOTYPE_PROPOSED_SCOPE.md | b546948f2eacb901f57d1b8af5c24d037dccdf78 |
| runs/PP-002_Q01_DQA-007_PASS_DISPOSITION.md | 4f2080c9b90dd4f3d7fcbc780d8b42da0c6d9ba3 |

## 3. Independent current observations

Observation date: 2026-10-30 America/Mexico_City / 2026-10-31 UTC. The times below are this reviewer's caller invocation/completed tool receipt boundaries, not provider HTTP-wire/event timestamps. Provider event times and hidden request authentication remain UNKNOWN. Endpoint paths are relative to https://api.github.com/repos/KhaosMagnus/YU3DOH-Carder.

| GET endpoint | Invocation UTC | Completed receipt UTC | Observed result |
|---|---|---|---|
| (repository) | 2026-10-31T04:33:42.302Z | 2026-10-31T04:33:42.714Z | Repository ID 1374186410; owner User/328893145; public fork, default main; returned account permission flags admin/maintain/push/triage/pull=true |
| /branches?per_page=100 | 2026-10-31T04:33:42.302Z | 2026-10-31T04:33:43.159Z | 47 returned; every protected=false; exact X absent |
| /branches?per_page=100&page=2 | 2026-10-31T04:34:26.460Z | 2026-10-31T04:34:27.120Z | []; no additional branch page |
| /rulesets?includes_parents=true | 2026-10-31T04:33:42.302Z | 2026-10-31T04:33:42.660Z | [] |
| /pulls?state=open&per_page=100 | 2026-10-31T04:33:42.302Z | 2026-10-31T04:33:42.734Z | [] |
| /branches/main/protection | 2026-10-31T04:33:42.302Z | 2026-10-31T04:33:42.711Z | GitHub 403 Resource not accessible by integration |
| /branches/meta%2Fproject-control/protection | 2026-10-31T04:33:42.302Z | 2026-10-31T04:33:42.406Z | Connector INVALID_ARGUMENT invalid repository path; no GitHub result |
| /rules/branches/main | 2026-10-31T04:33:42.302Z | 2026-10-31T04:33:42.507Z | Connector INVALID_ARGUMENT endpoint not allowed |
| /tags?per_page=100 | 2026-10-31T04:33:42.302Z | 2026-10-31T04:33:42.498Z | Connector INVALID_ARGUMENT endpoint not allowed |
| /git/matching-refs/tags/ | 2026-10-31T04:34:26.460Z | 2026-10-31T04:34:26.768Z | []; an alternate permitted Git ref GET returned no tag refs |

The connector list_installations(limit=100) was independently repeated and returned installation 162412374, KhaosMagnus/account 328893145, account_type User, repository_selection=all and viewer_can_administer=null. No App registration ID, complete effective token map or per-call signer was returned. Exact invocation/receipt clock pair for that separate call was not retained; do not substitute this report's assembly time.

These reproduce the candidate's accessible observations and its endpoint failures. The new matching-refs tag read resolves one previously unavailable inventory fact at this later observation time; it does not make the author's earlier UNKNOWN inaccurate, establish future tag matching or prove other namespaces absent. No historical raw response hash or original request time was independently regenerated. Mutable repository metadata naturally differs in pushed_at/control head.

An empty ruleset list and protected=false flags are observations, not a complete attestation of classic/inherited/server enforcement or of all alternative routes. A 403 from an Administration GET does not imply denied Contents writes. Account metadata does not identify the bearer used by a tool. No absent evidence was converted to rights, denial or successful isolation.

## 4. DQ01–DQ10 matrix

PASS here means paper sufficiency within authorized evidence, not live qualification. FINDING identifies refinements or operational constraints; current facts that are deliberately unknown are separately blocked for execution.

| Assertion | Result | Evidence and independent assessment |
|---|---|---|
| DQ01 exact authority/custody | PASS | Section 2 reconstructs relevant single-parent chain, exact candidate blob, one-file additive delta and sixteen source pins. Appendix A independently pins all 47 branches, including six required product/ops refs; X absent. Current indexes are compatible coordinator advances. |
| DQ02 truthful observations | PASS | Section 3 independently repeats metadata, branch, ruleset, PR and denied settings GETs. Author's invocation versus event times and signer limitations are explicit. Later alternate tag GET is an observation delta, not a silent source correction. |
| DQ03 actual identity proof | PASS | Candidate sections 3–4 require P/B distinct principals/Apps, real issuer/auth/resource bindings, C0/Q/A/G/U evidence, and enforceable E/fallback exclusion. No token-string/chat-role equivalence; installation 162412374 is not falsely assigned. Actual S1 remains UNPROVEN. |
| DQ04 N0–N9 policy correctness | FINDING | Ref/update/creation partition is coherent at paper level; layered bypass cannot erase separate N0 invariants. Exact future schema and actor behavior require qualification. M01/M02 add explicit catalog lifecycle/continuity cases; no concrete provider-enforced loophole is established by the paper model. |
| DQ05 PC/product continuity | FINDING | P's C path and per-ref U/provisioner exceptions exist, with safe staging and recovery. Empty PRs are explicitly insufficient to prove idleness. M01: tags, retirement and unlisted work remain blocked absent a bounded approved operational disposition. |
| DQ06 future configuration boundary | PASS | CFG-00–10 require actual identities/JSON/deltas/schema/readbacks, issuer custody, authority, rollback, expiry and independent verifier. Missing values block execution; this is correctly not a deployable import or live settings approval. |
| DQ07 V01–V20 coverage | FINDING | All twenty original families retained; actors, oracles, positives, safe targets, receipts and real/disposable differences specified. M02: expand new W/K lifecycle and cross-writer subcases in later CFG-07. Actual S1/S2 mapping remains BLOCKED until justified. |
| DQ08 evidence/recovery/safety | PASS | Public-data quarantine before object upload, no real secret fixtures, original-operation lost-ACK reconciliation, single-parent/CAS boundaries, independent closer and contain-before-repair recovery. No automatic unprotected rollback. |
| DQ09 phase separation | PASS | F1 paper, later security qualification, S3 creation, S4 runtime, S5 custody and S6 prototype QA remain distinct. No S6-before-candidate circular acceptance and no automatic implementation from S1/S2. Historical Q01/Gate C/protocol statuses preserved. |
| DQ10 decision quality | PASS | Effort is explicitly assumption-dependent and excludes potentially dominant broker/platform work. B2 reduces coupling only with separate upstream-free authority; original-ref S2 cost is excluded and disclosed. Independent selection reasoning in section 9. |

## 5. N1 policy reconstruction and legitimate operations

C = refs/heads/meta/project-control. X = refs/heads/experiment/pp002-q02-prot-001. W is an exact update-ref-to-U catalog; K is an exact create-ref-to-provisioner catalog. W/K are proposals, not verified empty inventories. T comprises tags, whose containment must be independently matched. The installed policy must reject malformed catalog overlaps and normalize exact full refs without widening scope.

| Ref/operation class | Applicable intended gate | Who can proceed under the proposal |
|---|---|---|
| Existing C, normal update | N3; N0 remains independently applicable | P only through approved data/authority/whole-tree publisher |
| Existing X, normal update | N4; N0 | B only; N9 denies further updates during candidate hold |
| Existing W ref r, normal update | N7(r); N0; r excluded from N2 only after narrow rule readback | Exact U(r), subject to actual supported actor binding |
| Any other existing/future branch, update | N2; N0 | Nobody routinely; admit specific W entry first |
| Absent X, creation | N5; excluded from N1 | C0 in closed provisioning window; source and one-time intent also enforced by trusted broker |
| Absent authorized K ref k, creation | N8(k); excluded from N1 | Exact product provisioner; future updates separately need W/N7 |
| Any other branch creation | N1 | Nobody routinely |
| Branch non-fast-forward/deletion | Separate N0 with no bypass | Nobody, including P/B/U update-bypass actors |
| Tags create/update/delete | N6 with no bypass | Nobody under this baseline |
| Nonbranch/tag operations and unreferenced objects | No complete native branch-rule guarantee | Trusted broker/issuer containment; explicitly residual raw-bearer risk |

N0–N6 are seven ruleset objects; N7/N8 add catalog objects; N9 adds a later hold. Several individual rules can reside in one object. The 75-object limit is a capacity bound, not evidence that arbitrarily many current/future tasks fit. Group only identically authorized exact refs and actors, with reserved recovery/hold capacity.

GitHub's documented rule aggregation supports the separation: bypass on N3/N4/N7 does not by itself bypass N0, and an additional restrictive layer still applies. This depends on full installed readback and later behavior tests. No actual bypass list was inspected here. Integration/App IDs must be actual supported IDs, never the installation ID substituted for an App registration. Unsupported personal-repo actors must block or use a separately approved exact App, not a write/admin-role fallback.

For a new authorized product branch, prepare and read back N7/N8 as applicable before removing default N2/N1 coverage. Granting K alone is not a development/update route. Removal reverses the order: restore default coverage before retiring the narrow gate. Ensure W/K exclude C/X, only exact authorized names enter them, and cross-writer intersections do not strand a required writer. These are required filled-packet consistency checks, not new authority from DQA-008.

Creation at a pinned source is not supplied by a ruleset bypass: C0/provisioner source binding and closed issuance are trusted publisher duties. N1/N2 do not provide per-path tokens. N6 does not contain every release API. Raw Contents bearer access can still exceed the broker route. The candidate acknowledges those limits and explicitly trusts the issuer/broker; a compromise of that entire trusted root is outside its claimed protection.

Native ref controls also cannot remove an experimental outer context's selectable P/admin connector. Installing N0–N9 while that route remains accessible cannot establish S1; no combination of branch patterns repairs that context capability leak. B2 with the same connection has the same failure.

The exact API/schema remains a future packet pin. Current official documentation supports 2026-03-10 and branch/tag/ref mechanisms, but no candidate-import validation was performed. All-tag matching, per-rule target compatibility, overlapping classic settings and actual API actor matching must be checked on the intended configuration. The repository is a public personal fork; fork-network push rules are a separate possible inherited surface, not a native public path-allowlist guarantee supplied by N1.

PC continuity is plausible: C is outside N2, P is the sole N3 exception, and ordinary additive fast-forward publication does not violate N0. Before activating N3, the actual P signer/issuer/transport must be usable. F3 preparation alone is not empirical continuity; the first already-authorized legitimate PC publication after activation provides the actual positive check. A fabricated test commit on C is forbidden. If that publication fails, stop B and use the external A/G channel to repair only approved P access while retaining invariants.

No PR/status/signature requirement is silently introduced. Central indexes remain PC-owned; relay of a role report cannot change its conclusion or transfer index ownership. Product integration requires its own product authority and exact U rule, not PP-002 authorization.

## 6. Severity-ranked findings and required later corrections

Severity below concerns the design's operational consequences. The paper acceptance and the live-readiness blockers are deliberately separate.

### M01 — MEDIUM: N1 continuity is bounded, not general product continuity

**Evidence:** candidate sections 5 and 9: N2 denies unlisted updates; N1 denies unlisted creation; N0 denies all branch deletion/force; N6 denies all tag lifecycle operations. Section 9 acknowledges cleanup/release dependencies and requires later disposition. W/K have no actual authorized entries. Current PR list is empty, but the current branch inventory cannot prove developers, local work, release preparation or external writers are idle.

**Effect:** N1 can preserve named PC/product fast-forward publications, but it does not preserve ordinary tag creation or branch retirement. Without an actual maximum window and an operational owner, the nominally bounded prototype policy could become a persistent freeze for omitted work. The security benefit does not justify describing product operations as unaffected.

**Correction before later activation:** CFG-05 must enumerate actual integration, creation, release/tag and cleanup needs; name the blocking/ref admission owner, maximum tolerated delay, next legitimate PC publication and out-of-band closer. Either explicitly accept deferral for a bounded window, supply a separately reviewed safe exact policy for needed operations, or choose B2. Do not add a blanket bypass or silently relax N0/N6. This is a later executable-packet condition already anticipated by the contract, not a reason to mutate the frozen design now.

### M02 — MEDIUM: new W/K transitions need explicit qualification subcases

**Evidence:** candidate section 5 introduces N7/N8 and ordered default-deny exception transitions. V03/V04/V08/V09/V10/V14 and F2 cover relevant families and U positives in general, but the V table does not enumerate the full new catalog lifecycle.

**Effect:** qualifying only C/X and a default product ref could miss a mistaken N2 exclusion, cross-U grant, K-created branch with no valid update route, or lockout during exception retirement. Existing general coverage is adequate for paper planning, not for later treating a 20-row checklist as complete behavioral coverage.

**Correction in CFG-07 before qualification approval:** bind subcases to the existing V families for (a) U(r) positive update and B/P/wrong-U denials, (b) provisioner exact-k positive creation and wrong actor/name/source denial at the appropriate native/broker layer, (c) K-to-W creation/update lifecycle, (d) narrow-first admission and default-first retirement including lost ACK and concurrent drift, (e) malformed W/K overlaps with C/X and absent nested-name classes, (f) force/delete denial despite exact U bypass, and (g) any explicitly authorized release/cleanup disposition. Preserve per-case signer, positive controls, denied-rule oracle, remote-call counter where rejected locally, readback and cleanup. Do not execute any of them under this review.

### L01 — LOW: alternate tag inventory read can improve the future baseline

**Evidence:** direct /tags request was rejected by the connector, matching the candidate. This reviewer later obtained [] from /git/matching-refs/tags/ at the distinct clock pair in section 3.

**Effect:** the historical UNKNOWN was honest; a future packet can use an available nonsecret API route rather than assume this inventory necessarily needs a new administrative surface. This does not resolve exact all-tag pattern behavior or nonstandard refs.

**Correction:** retain the candidate unchanged; refresh this alternate source at CFG-01 time with complete custody and declare remaining namespace gaps. Never relabel this later result as the original author's observation.

### BLOCKING for live GO, not newly discovered paper defects

1. Actual P/B principals, issuance maps, effective grants, route/context ACLs and independent offline host enforcement are still absent. The present broad connection remains unqualified.
2. Actual complete rules/bypass/classic/inherited coverage and target behavior mapping are absent; no N objects are installed by this design.
3. Strict atomic expected-old transport is not established. REST ref update exposes sha/force, not an expected-old field. Connector expected_sha documentation and a successful governance write do not prove its internal race semantics.
4. No exact final settings bytes, approved continuity catalog/window, independent verifier, recovery authority or separately authorized qualification resource exists here.
5. No disposable V behavior evidence exists. If actual-target read-only configuration plus disposable behavior cannot support the frozen original-ref S2 requirement, remain BLOCKED and return that evidence limit to Owner/PC; no real-ref probe or silent gate weakening.

These blockers are honestly named in the candidate. Missing actual IDs/configuration is expected at F1 and must not be misreported as a paper implementation defect.

## 7. V01–V20 independent coverage and proof limits

The original accepted B1 handoff's twenty V families were compared to the F1 table. None was removed or promoted to an executed result.

| V | Paper coverage / required distinction |
|---|---|
| V01 | Actual signer/auth/installation/route evidence; read-only real target, positive D route; unknown fallback blocks S1. |
| V02 | Active/classic/inherited configuration and complete bypass evidence; absent-name matching; omitted bypass data is not an empty list. |
| V03 | P additive publication on dC; valid scope/parent plus stale/extra-path negatives; only an independently authorized legitimate actual C publication supplements continuity. |
| V04 | B denial on disposable C/main/product/ops equivalents, including active and archived classes; functioning B-on-dX positive. Expand U/catalog cases per M02. |
| V05 | B allowed exact dX bundle and forbidden sibling/extra content distinction. Broker path checks are not claimed native ref rules. |
| V06 | Wrong/default target, extra parents/modes/path escape; local rejection must show zero remote dispatch. |
| V07 | Supported direct Contents/Git/alternate routes on D; valid authentication and intended rule denial; unsupported routes remain uncovered. |
| V08 | Force/deletion denied for P/B/applicable U despite update bypass; ordinary fast-forward positive. |
| V09 | Arbitrary branch, nested tags, rewrites/deletion and extra namespaces; distinguish native from broker containment and absent coverage. |
| V10 | C0 exact absent-X create, duplicate/update denial and issuance closure; source pin is also broker/issuer-bound. |
| V11 | Shared-principal fixture must produce NO-GO; real disposable context exclusion, not chat naming or a mock-only label. |
| V12 | Forged/stale/self-approved assertions rejected against independently authenticated authority; hashes alone do not authenticate an assertion. |
| V13 | Concurrent expected-old conflict, lost accepted ACK and original-effect reconciliation; no success inferred from force=false. |
| V14 | Partial activation/expiry/P failure; B remains stopped and exact scoped recovery retains N0. Include catalog transition interruption per M02. |
| V15 | Synthetic unsafe-data canaries, quarantine before object upload, safe positive bundle; never real secret values. |
| V16 | Outer runtime capabilities, network/metadata/socket/connector/credentials; no production probe, and a Python hook is insufficient. |
| V17 | Exact candidate hold and independent reviewer/source identity; post-hold update denied, pre-hold positive and retained custody. |
| V18 | Grant/rule/runtime drift invalidates approval; mutations only in D fixture, actual target inspected read-only. |
| V19 | Contain/revoke affected route first; independent recovery and original-operation/evidence closer, no unprotected default rollback. |
| V20 | Conditional B2 scope; sacrificial outside-scope negative target, public YU3DOH read compatible with absent write grant; not counted PASS/N/A without placement disposition. |

The contract defines a reusable receipt record for each case: actual principal/issuer, config/source hashes, exact numeric resources/ref identities, requested/receipt/event/recorded/verified times, raw nonsecret responses, status/reason, before/after objects, effect counters, cleanup and closer. Positive controls bracket denial tests; a malformed request, expired token or lack of repository access cannot prove intended rule denial.

D is a separately authorized disposable resource. Same spelling is insufficient: compare owner/repo/installation substitutions, visibility/plan/fork layers, actual App registrations/auth modes, grants/token subset, full rules/bypasses, issuer/broker/runtime and transport versions. A surrogate principal yields partial evidence, not original S1/S2 PASS. Real C/main/product/ops remain read-only subjects.

Qualification can establish a composite inference, not empirical real-ref write denial. The frozen six-gate decision requires positive proof on intended identities/substrate. Independent Q must explicitly accept the argument and the limits; if that cannot be done under permitted evidence, the correct outcome is NO-GO. DQA-008 does not pre-approve that future inference.

## 8. Recovery, custody and phase assessment

The proposed containment order is sound: stop B; preserve safe raw evidence and uncertain originals; recover actual state; repair only approved legitimate access; verify effect/cleanup; appoint an accountable successor closer. A replacement success never closes the lost original. Unknown settings ACK requires readback/history attribution, not blind duplicate creation. Rejected CAS and unknown ACK are different states.

Rollback is containment or a known-safe approved partition. The presently empty ruleset response is not a safe rollback target. GitHub settings updates have no multi-object transaction or automatic task expiry demonstrated here. Serialized operator windows, before-action fingerprints and STOP on drift are operational mitigations; they must not be labeled provider CAS. Installation suspension must not be assumed to disable all user-authorized routes.

Public outputs require inspection before Git object creation, not just before ref movement; unreferenced objects and signed URLs remain data-custody hazards. Trusted publishers inspect bundles as data without running imports, hooks or archive instructions. Secret-like canaries must be synthetic. Public history is not guaranteed erasable through branch cleanup.

S1/S2 precede B1 implementation/experimental branch GO. S3 separately freezes exact input/control/source/candidate identities and allowed new files before creation. S4 must establish offline outer enforcement before code execution; S5 gates public data upload; S6 follows an actual held candidate and independently checks I01–I32 plus Q01 F01–F31 and unchanged historical adapters. No layer can be satisfied by this documentation publication.

## 9. Independent B1/B2 proportionality and next action

B1 is technically plausible if the platform or an external controlled substrate genuinely excludes P/admin routes and the Owner wants the resulting exact writer catalog as durable infrastructure. A trusted manual publication operator can avoid building a service, but cannot remove identity/custody/transport verification. N1 is safer than a combined broad bypass rule and more operationally flexible than permanently freezing every product branch; it is still a real workflow and administration change.

For a small offline prototype, B2 has the better supported risk/coupling profile: the experimental repository grant can exclude YU3DOH, reducing the effect of a broker defect and avoiding routine W/K changes across this product repository. This judgment is architectural inference, not measured economics. The quoted 24–56 versus 14–32 person-hours are estimates without task-level measurement; both exclude potentially dominant platform/broker work, and B2 excludes original-S2 remediation. They cannot establish a total-cost saving or completion deadline.

The decisive first missing fact is enforceable outer-context/connection separation. Request nonsecret platform and issuer evidence for ID-01–ID-08 before spending effort on exact N JSON. If the broad PC route cannot be excluded, neither placement is qualified on that context. Use a separately controlled environment/route under new authority or return NO-GO; do not purchase complexity in rulesets to compensate.

Recommended PC-003 action: adjudicate this paper PASS and findings; obtain a placement decision and nonsecret separation/continuity feasibility evidence; only then route a separately authorized exact packet. Avoid configuring N1, adding broad bypasses, creating B2/X or starting the prototype on this report. Any later B2 route must explicitly retain or seek Owner disposition of original-ref S2 without this reviewer waiving it.

## 10. Official mechanism sources and citation limits

Official GitHub documents were independently opened/reviewed on this review date. The following notes paraphrase mechanisms only; none attests actual installation or token rights.

- [About rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets): public-repository availability, repository limit and aggregation; overlapping restrictions remain applicable.
- [Creating rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/creating-rulesets-for-a-repository): exact targeting/bypass UI and slash-sensitive fnmatch matching.
- [Available rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets): creation/update/deletion restrictions and their bypass model.
- [REST rules, 2026-03-10](https://docs.github.com/en/rest/repos/rules?apiVersion=2026-03-10): actual schema and active-rule reads; absent branch names can be queried; complete bypass actor information has caller-access constraints.
- [REST Git refs, 2026-03-10](https://docs.github.com/en/rest/git/refs?apiVersion=2026-03-10): matching refs can inspect namespaces; update body exposes target SHA and force, not strict expected-old CAS.
- [Installation token generation](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-an-installation-access-token-for-a-github-app): repository/permission narrowing is separate from installation selection.

Vendor documents are mutable and must be pinned/refreshed for a later actual packet. The documented mechanism does not certify connector implementation or account-specific actor behavior.

## Appendix A. Independently observed preserved branch inventory

All returned branches had protected=false. This table is a preservation baseline, not security enforcement evidence. The six mandatory preserved refs are main, feature/workspace-v0.1, feature/workspace-run-026 and the three ops/pp-002 gate branches. All other noncontrol branches are equally outside this report's mutation authority.

| Branch suffix under refs/heads/ | Observed SHA |
|---|---|
| feature/serial-v0.1 | 85dcd2f90090ff7da0589c9cf2ae3a4688d35455 |
| feature/workspace-cr-0001-2-level-rank-domain | 59fb2924b2240f005fb3e9e6d5afbd8aaca39596 |
| feature/workspace-cr-0001-combined | 64cb5f4ca42348c6c403e64e0d61bdff8c32a281 |
| feature/workspace-run-001 | dce133edb3bb64d72ea54434fb4e40a5bf3c04a3 |
| feature/workspace-run-002 | 070b5ea002211a3bf26a34f80473201495d0b781 |
| feature/workspace-run-003 | 017c904c22c7842fa1209e3e39885453dda1e63a |
| feature/workspace-run-004 | 81c20eb1477e1a0151b6e590d1e31390d82c6de4 |
| feature/workspace-run-005 | 94c4fed2c114a8d5b38626b48722237d9ec8263d |
| feature/workspace-run-006 | b484f0d5c620dd4fb57054f261a22aaf6e557f0d |
| feature/workspace-run-007 | 45d85b6cfd4a28f1b4f241f540159fac076f3978 |
| feature/workspace-run-008 | e54800629e46f8fccd653b0bef637dd71e9b97a3 |
| feature/workspace-run-009 | 3d1a566ceaabdb1eb9bf3346ba87541f26a66782 |
| feature/workspace-run-010 | 609126af1b0062ca198bcd32e7d21396bb225549 |
| feature/workspace-run-011 | 1f4b93ee9a3c322b808e8db3f87076b95d6f8d2e |
| feature/workspace-run-012 | 590f11f62476a504164055c47aa918e80666ce2c |
| feature/workspace-run-013 | 366fea433d6eccde9b2848dee2f9b53297926a69 |
| feature/workspace-run-014 | fd13018c881f63764efb60bc1c88b4eb0a400018 |
| feature/workspace-run-015 | 191454d44f3273cf2efba254bddd8ba5275a08aa |
| feature/workspace-run-016 | 163799a60772da69ecabbae03d8b2966a50d6c46 |
| feature/workspace-run-017 | 0c94aa7990c227690b5d90e2d73ae892a37930ee |
| feature/workspace-run-018 | d7f5d567856503a42d14543d876eb7d1e0c2b311 |
| feature/workspace-run-019 | e83de9793c26f78834f748b320161a168943d4ed |
| feature/workspace-run-020 | 318e310f3a7f475de00bc427b6654192d615486d |
| feature/workspace-run-021 | ec838d9ea0626d52e133937fb790150575ab623e |
| feature/workspace-run-022 | 4b0aa0d6afdbd07d155844d38b2832ea0acfa201 |
| feature/workspace-run-023 | c929a6020760525d5cf6daf695b2f44c1d3cd1ca |
| feature/workspace-run-024 | e07140d5a9555a17b7b2306a45625c14adfafc8e |
| feature/workspace-run-025 | dd968ba05e579461962bbcced0e9cae3cd4c3d23 |
| feature/workspace-run-026 | e11579950ef7ed20e4b6eeee88f9c3597c1f074b |
| feature/workspace-v0.1 | e11579950ef7ed20e4b6eeee88f9c3597c1f074b |
| fix/workspace-rc-canonical-null-zero | 4c9b0228bb47ac074c49a977b48dbf0844c33a94 |
| fix/workspace-rc-normal-subtype-icon | 61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c |
| main | 54cc3aad246c89a29f2a18be63c539db68cae041 |
| meta/project-control | d782f283920bedb24088b65cb45f5d304f839ee2 |
| ops/candidate-a-deploy-003-actions | 22d89b3bb4c6e15b1dcc56eff84d71093e74947b |
| ops/candidate-a-env-002-actions | bc52a568719e30429c4f517b8c49c1ad05f378ef |
| ops/cr-0001-combined-deploy-003-actions | 22d89b3bb4c6e15b1dcc56eff84d71093e74947b |
| ops/cr-0001-combined-deploy-004-actions | b4df05521964d97060bd5d1108518a79083afd38 |
| ops/pp-002-gate-b-actions | dd6e8bfecadab0a83c8008ea65300b1f0ba518f8 |
| ops/pp-002-gate-b-r2-actions | 0e679ad863076098d92d8a7704f6ca88948b651b |
| ops/pp-002-gate-c-actions | 9c508d06e3862b4b142e998708026a5ed8757fd0 |
| ops/run-024-dev-006-actions | 0de56aac07d3f66ed20c4770862ec0cc4bf86de4 |
| ops/run-024-env-004-actions | 5aa54988eec0d8c07626f178677660f817640b2a |
| ops/run-025-deploy-005-actions | f4cc120d21694dc10032bd92cf97f8e5d42f8e14 |
| ops/run-025-env-005-actions | c5d5a08bad6ba110121a813a7db18af5d043f670 |
| ops/run-026-deploy-006-actions | da47a3668c75b916f23650d38677e58d0b38ba36 |
| recovery/p6-archival-staging | 6cc7ed5b708b3cf0e88682246a821fd4883020df |

Expected publication effect: C advances only by this one additive report. Every other branch above remains unchanged; X remains absent. Tag matching-ref result [] is separately timed, not a multi-ref atomic snapshot. The report makes no claim to inventory every other Git namespace or to exclude a future concurrent external writer.

## Appendix B. Publication and terminal return contract

The authorized report path was absent from the complete activation tree. Before ref movement, re-read current C and its complete tree; confirm frozen QA authority/candidate compatibility and no conflicting output. Prepare one single-parent commit containing only this new 100644 report. Verify every prior blob/mode remains unchanged. Publish with expected current head and force=false. A rejected lease requires fresh compatibility analysis and reprepare; no force fallback.

Afterward, independently read the exact commit/tree/report blob and branch inventory. Exact publication SHA/blob are returned outside this document after readback, rather than invented self-referential values here. Creating immutable Git objects for this authorized documentation publication is not V-test execution or prototype provisioning.

Terminal report disposition: **PASS — PAPER DESIGN CONTRACT ONLY.**
S1/S2: **NOT INDEPENDENTLY PROVEN. B1 IMPLEMENTATION NO-GO.**
Q01 independent offline PASS; Q02 accepted; Q02-PROT-001 not authorized; Gate C/final PP-002 REVISE; P01 UNCERTAIN; P02 UNKNOWN; protocols frozen — all unchanged.

RETURN: DESIGN_QA / DQA-008 -> PROJECT_CONTROL / PC-003.
