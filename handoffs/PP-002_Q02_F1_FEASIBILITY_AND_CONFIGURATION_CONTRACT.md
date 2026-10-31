# PP-002 Q02 F1 — B1 Permission Feasibility and Configuration Contract

artifact_id: PP-002-Q02-F1-FEASIBILITY-AND-CONFIGURATION-CONTRACT
assignment: F1-SEC-FEAS-001
artifact_type: read_only_feasibility_and_future_qualification_contract
contract_version: F1-CONFIG-QUAL-v1 / PROPOSED / UNINSTALLED
author / closer: PROTOCOL_PORTABILITY / PP-002
return_to: PROJECT_CONTROL / PC-003
repository: KhaosMagnus/YU3DOH-Carder
repository_id: 1374186410
repository_owner_id: 328893145
activation_control: 708f014d7af6549f677aedcb2ab01cd53228e4e9
activation_tree: 5ace67b7057ac83504073ddf7ba8ae169a870d47
accepted_B1_design_blob: d89194237b128b76379533412baec5a56f754b20
authority: control/PP-002_Q02_F1_FEASIBILITY_DESIGN_AUTHORIZATION.md
scope: control/PP-002_Q02_F1_FEASIBILITY_CONTRACT_SCOPE.md
route: routing/ROUTE-PP-002-Q02-F1-FEASIBILITY-CONTRACT.md
design_result: READY FOR SEPARATELY ROUTED INDEPENDENT DESIGN_QA
configuration / implementation / qualification_execution: NONE
S1 / S2: NOT INDEPENDENTLY PROVEN
Q02-PROT-001: NOT AUTHORIZED / NO-GO
Q01: INDEPENDENT OFFLINE PASS / UNCHANGED
Q02-DES-001 / B1-SEC-DES-001: ACCEPTED / UNCHANGED
Gate_C / final_PP-002: REVISE / UNCHANGED
P01: UNCERTAIN
P02: UNKNOWN
Generic_Protocol_v1.0 / PP-002_v2: FROZEN / UNCHANGED
protocol_successor / adoption: NOT AUTHORIZED

## 1. Feasibility decision

**B1 is technically plausible with a separately controlled execution and
publication substrate; it is not qualified on the current connected context.**
GitHub offers ref controls useful for protecting this public personal repository,
but neither those controls nor real per-context principal separation are proven
here. An offline child process inside a context that can still select the PC
writer does not meet S1. A second token for the same bypass-capable App does not
meet the Owner's distinct-principal requirement. [SIX] [B1] [ACCEPT]

The recommended B1 candidate is a **partitioned legitimate-writer policy N1**,
described below. It retains default denial of experimental writes outside the
exact experimental ref, but makes legitimate PC and product permissions explicit
per ref and per principal. It replaces an indefinite global product freeze with
reviewed work entries; it cannot offer unrestricted ad hoc product branch
creation while also denying a repository-wide experimental Contents writer.
If ordinary product work cannot tolerate that coordination cost, B1 is the
wrong substrate for this small offline prototype.

**Prefer independently permissioned B2 for the next prototype if distinct routes
and official-ref controls do not already fit the project's security plans.**
B2 must exclude YU3DOH write authority from both executor and experimental
publisher routes. A new repository alone, with the same selectable all-repository
connector, is not isolation. B2 requires a new scope and does not waive S1–S6 or
retroactively protect YU3DOH refs.

This is a reviewable contract proposal, not a deployable packet with actual
actor IDs. Missing identities, feature evidence, writer inventory, exact
configuration readbacks and platform route attestation are named blockers.
Independent DESIGN_QA may accept the completeness and honesty of this paper
contract while B1 implementation remains NO-GO. Actual configuration, disposable
qualification and prototype implementation each require later explicit authority.

## 2. Evidence classifications and current observations

OBSERVED means a named retrieved source actually returned the stated fact.
Connector-declared capability is identified as such; it is not effective-rights
proof. INFERRED means a conclusion from those facts. PROPOSED means a future
control or test. UNKNOWN means unavailable/unestablished. BLOCKED means an
affected action must not proceed with that uncertainty. No missing value is
silently converted into a denial, zero, permission grant or fresh observation.

### Fresh nonsecret read-only observations

All endpoint paths below are under
`https://api.github.com/repos/KhaosMagnus/YU3DOH-Carder`.
Times are UTC caller tool invocation/completed tool receipt boundaries, not
GitHub HTTP-wire timestamps. GitHub event time is UNKNOWN for these metadata
queries. Assembly and verification times are not substituted for receipt time.
The review occurred on 2026-10-30 America/Mexico_City / 2026-10-31 UTC.

| Source | requested_at | receipt_at | OBSERVED result |
|---|---|---|---|
| Repository GET | 2026-10-31T02:11:30.097Z | 2026-10-31T02:11:30.572Z | ID 1374186410; owner ID 328893145, type User; private=false; default main; returned permissions admin/maintain/push/triage/pull=true |
| /rulesets?includes_parents=true | 2026-10-31T02:11:30.097Z | 2026-10-31T02:11:30.395Z | [] |
| /branches?per_page=100 | 2026-10-31T02:11:30.097Z | 2026-10-31T02:11:31.242Z | 47 entries, each protected=false; X absent in returned inventory |
| /pulls?state=open&per_page=100 | 2026-10-31T02:11:30.097Z | 2026-10-31T02:11:30.423Z | [] |
| Connector list_installations(limit=100) | 2026-10-31T02:11:50.293Z | 2026-10-31T02:11:50.573Z | Installation 162412374, KhaosMagnus/account 328893145, User, repository_selection=all; viewer_can_administer=null; complete permissions/App ID absent |
| /branches/main/protection | 2026-10-31T02:12:16.001Z | 2026-10-31T02:12:16.333Z | GitHub 403 Resource not accessible by integration; NOT proof protection is absent |
| /branches/meta%2Fproject-control/protection | 2026-10-31T02:12:16.002Z | 2026-10-31T02:12:16.122Z | Connector INVALID_ARGUMENT invalid repository path; no GitHub observation obtained |
| /rules/branches/main | 2026-10-31T02:12:16.002Z | 2026-10-31T02:12:16.131Z | Connector INVALID_ARGUMENT endpoint not allowed; effective rules unavailable through this request |
| /tags?per_page=100 | 2026-10-31T02:12:16.002Z | 2026-10-31T02:12:16.111Z | Connector INVALID_ARGUMENT endpoint not allowed; tag inventory UNKNOWN |

Successful raw returned UTF-8 response SHA-256 values, first four rows in order:

- b7b3f16ce9d222beb8721dfd4a4fedd06bdc8cbe050f47d271c180a18b870e4d
- 4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945
- 073129bbf66f500b9ed35bcaae090992eaf4326e243277e9a5beabfba891dc31
- 4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945

The single-document scope preserves material query facts, timing, IDs and the
full returned branch/head inventory here, not a separately published raw receipt
archive. These hashes identify the collected responses; they are not signed
provider attestations or a claim that another reader can reconstruct all raw
bytes from the summaries. Independent QA can verify immutable inputs and repeat
reads, retaining any temporal difference. Future qualification must persist its
approved raw nonsecret receipts durably under its own evidence authority.

The frozen PC snapshot independently records the same broad metadata and does
not establish signing credentials. The 403 is consistent with the connector's
declaration that managed App connections lack Administration access, but does
not establish the complete scope or signer of every call. Returned account
admin=true is not an attestation that this request used an admin PAT. Conversely,
one forbidden administrative GET does not prove all ref writes are denied.
[SNAPSHOT] [Q02]

INFERRED: S1 and S2 remain unproven. UNKNOWN: App registration ID, actual IAT/UAT/
other authentication mode per operation, token permission/repository subset,
expiry, other writer routes, tag/classic/inherited protection completeness and
platform isolation. No credentials, connection switch, user-secret endpoint,
configuration operation or authenticated negative write probe was used.

### Product continuity inventory and historical boundaries

[STATE] and [REG] say RUN 026 and CR-0002 are closed/integrated with external QA
PASS; no product RUN/CR is authorized by PP-002. The fresh open-PR collection is
empty. This supports **no identified active product integration**, not a claim
that all developers, unregistered tasks, releases or other integrations are idle.
Owner/PC must confirm the work inventory immediately before any change window.

[BACKLOG] retains an old Gate C pending-approval line. It is stale relative to
current state/official dispositions; it does not reopen Gate C or grant work.
It is preserved without modification. Do not use registry labels as identity
proof or a branch's historical name as authority to freeze it forever.

Appendix B pins all 47 returned branches: 30 feature, 2 fix, 12 ops, one recovery,
main and control. Main, both current product baseline refs and the three PP-002
historical ops refs retain their known exact values. All other returned branches
also require preservation under this assignment. Tag and additional ref-namespace
coverage must be completed externally before a configuration packet is executable.

## 3. Actual principals, permissions and missing proof

The following is a PROPOSED actor model. P/B/C0/U are not provisioned identities.
An installation ID, App ID, OAuth client ID, user ID, chat role and execution
session are different identifiers. Only the repository/Owner/observed installation
IDs above are established. No actor ID placeholder is a valid settings value.

| Actor | Actual status | Required grant and custody | Forbidden route |
|---|---|---|---|
| A/G — Owner/configuration and emergency custodian | Owner account identified; independently usable recovery channel unproven | Separate human-controlled settings channel; time-bounded exact change authorization; no routine ref bypass | Unavailable to E, B and routine P; no shared browser/session/token fallback |
| P — privileged local PC publisher | PC-003 role exists; signing principal UNKNOWN | Dedicated App registration/installation preferred; target repo only, Metadata read/Contents write; exact C update bypass; trusted data-only PC publishing boundary | No settings, X, product/ref creation, Actions, releases, arbitrary API or unreviewed code execution |
| B — experimental publication | No separate principal proven | Different App registration/principal from P; selected target repo only; Metadata read/Contents write; X update bypass only; credential inaccessible to E | No C/product/history/tag/nonstandard ref, P/admin route or general-purpose authenticated client |
| C0 — branch provisioner | Unassigned | Prefer distinct provisioning App, exact create-only service and closed issuance window; may share trusted Owner administration responsibility only under explicit later scope | No standing X update bypass; no E access; no generic branch creation |
| E — experimental executor/context | Existing PP-002 context has a governance writer surface; not attested isolated runtime | No GitHub identity/credentials/network/connector/host privilege; verified input mount and bounded output | Cannot choose P/B/admin connector, inherit host identity, call a credential issuer or request arbitrary signed calls |
| Q — independent verifier / QA | Not appointed by this handoff | Read-only source/configuration access; independently attributable findings; Owner supplies full nonsecret bypass evidence where public reads omit it | No own configuration changes, implementation self-acceptance or real-target write probes |
| U(r) — legitimate product integrator | No active entry identified; identities UNKNOWN | New per-task authorization, separate from B/P, exact product ref r/update route and scope | No experimental principal in an integrator bypass; no all-admin/write-role shortcut |

Separate P and B App registrations avoid assuming token-level branch isolation
that GitHub does not provide. Installation selection and issuer-requested token
subsets must both be checked. User-authorized App calls combine user and App
permissions; installation calls use App installation permissions. Therefore an
Owner login, broad installation selection or two different token strings cannot
establish the effective security boundary. [GH4] [GH5] [GH6]

P/B/C0 must have no Administration, Actions, Workflows, repository-creation,
issue/PR-write or unrelated permission grants in this proposal. Contents write
remains broader than branch update: native rules and the trusted broker must
jointly constrain it. Existing installation 162412374 is not assigned to any
actor by this design. Do not change that shared installation's selection without
a separate dependency review and Owner decision affecting its other repositories.

### Required nonsecret evidence exports

All exports below are future read-only proof requests to the named custodian,
not requests for token strings, keys, raw credential files or environment dumps.
Unavailable material remains UNKNOWN and blocks the relevant gate.

| Evidence ID / custodian | Exact nonsecret evidence required | Acceptance / present gap |
|---|---|---|
| ID-01 Owner/App administrator | App registration numeric ID/slug/owner and allowed permission map for P, B, C0; registration version/update event | P and B distinct; grant matches approved map; all UNKNOWN now |
| ID-02 installation administrator | Installation IDs/account/repository selection and exact repository IDs; suspended status; approved permission map | Binding to 1374186410 and intended actor; current list is incomplete for this proof |
| ID-03 trusted issuer operator | Issuance decision ID, actor/auth mode, installation, requested and effective permission/repo subset, issued/expiry time, revocation policy; secret value omitted at source | Independently witnessed source capture; cannot accept implementer-authored labels alone |
| ID-04 platform administrator | Nonsecret connection-to-principal bindings, context allowlist, selector/fallback policy, tools/sessions available to E/B/P, failure/restart behavior and enforcement mechanism/version | E/B cannot obtain P/A/G or alternate broad writer; no such platform attestation available |
| ID-05 Owner/repository administrator | Complete collaborators/roles, authorized Apps/OAuth routes, PAT/SSH/deploy-key identifiers and write flags, CI/service/GITHUB_TOKEN routes, outside brokers and settings administrators | Completeness/coverage signed by responsible custodian and verified independently; no secrets |
| ID-06 Q with Owner read access | Full current rules, bypass actors, enforcement, classic and inherited layers, exact ref match results, account feature support and tags/other refs | Public rules summaries may omit bypass data; absence is UNKNOWN, not [] |
| ID-07 publisher custodian | Accepted code/config hashes, allowed endpoints/paths/refs, issuer custody and route ACL, no generic signing or credential export; per-request nonsecret signer attestation | No installed publisher accepted today; manual trusted operation possible under qualified controls |
| ID-08 runtime custodian/Q | Actual offline environment policy and mounts, denied capabilities, independently obtained runtime identity and safe disposable qualification results | A child-level Python mock/audit hook is not outer-context isolation |

A signing-principal attestation links request ID, actor type/ID, App/installation,
authentication mode, credential handle (opaque nonsecret ID), effective resource/
permissions, issuer decision/config hash, actual dispatch/receipt boundary,
provider request ID if available, target and payload digest. It is produced by
the trusted issuer/capture channel and independently anchored, not by candidate
code. A Git commit author/email or ordinary commit signature alone cannot prove
which bearer signed a REST ref update. Missing provider headers stay UNKNOWN.

If the provider cannot supply a trustworthy context-binding/export mechanism,
use a separately operated isolated environment and manual trusted upload route
under new authorization, or select B2. Do not promise a global MCP interceptor
or per-chat connection ACL that is not advertised or independently demonstrated.

## 4. Alternative writers and the actual trust boundary

| Route | Required boundary / qualification evidence |
|---|---|
| Shared connector, account switch, alternate browser or conversation | Remove from E/B capability set by platform/host enforcement; role instruction is insufficient; private PC conversation memory is not a control |
| REST direct contents/create-file/Git tree/commit/ref calls | Exact broker method/repository/ref/path binding; server rejects B on official ref equivalents even outside broker |
| GraphQL, HTTPS/SSH Git, alternate service or credential helper | Not exposed to E/B caller; issuer bearer stays in trusted boundary; disposable tests and deployment inventory cover routes actually supported |
| PR merge, web editor, integration bot, deploy key, CI/GITHUB_TOKEN | Inventory acting principal and permissions; no bypass for B/shared write role; legitimate U route separately scoped |
| Release creation/assets/tag changes | Deny at broker; Contents write can reach release APIs even if branch writes are blocked; tag protection is not complete release/API isolation [GH7] |
| Unreferenced objects, notes/other refs, fork/transfer/repository settings | Native branch/tag coverage not assumed; deny unrelated endpoints/namespaces; no experimental repository-creation/admin grant; residual raw-bearer risk explicit |
| Local privileged host/metadata endpoint/mounted socket | No E access; external runtime isolation evidence, not only no imported GitHub library |
| Emergency/settings/issuer channel | Separate trusted root; never a normal fallback. Operator changes scoped/audited; platform/Owner compromise outside claimed guarantee |

The trust boundary contains provider enforcement, Owner settings custody,
credential issuer, data-only publisher and independent verifier. B's Contents
bearer still has broader raw API authority than the exposed method set. Keeping
it outside E is mandatory; server ref rules backstop official refs if the
experimental publication front-end misroutes. They do not protect every API
against a fully compromised issuer. If that residual same-repository risk is
unacceptable, choose B2 rather than claim GitHub provides a per-path token.

## 5. Proposed versioned configuration candidate N1

### Version and exact targets

Policy specification: F1-CONFIG-QUAL-v1, this immutable handoff after publication.
Proposed future REST API version: 2026-03-10, as in the reviewed official docs.
Exact vendor schema/OpenAPI revision/hash and connector implementation version:
UNKNOWN; must be pinned in a future applied packet. This document is not an
executable import file. Numeric App/actor/ruleset IDs must be resolved from real
evidence, all placeholders eliminated, and the resulting configuration bytes
independently reviewed and hashed before Owner approval.

- Target repository ID 1374186410; current name KhaosMagnus/YU3DOH-Carder.
- C = refs/heads/meta/project-control.
- X = refs/heads/experiment/pp002-q02-prot-001, currently absent in the branch list.
- W = exact authorized product/integration ref-to-U(r) work catalog, initially
  **PROPOSED EMPTY**, subject to Owner work inventory confirmation.
- K = exact future product-create ref-to-provisioner catalog, initially
  **PROPOSED EMPTY**; no pattern granting arbitrary new feature branches.
- T = tags; complete current inventory UNKNOWN. Proposed baseline all-tag
  containment requires verified target matching before any activation.

`~ALL` below is the documented all-branches selector for branch conditions.
Use exact full branch names for exclusions. Do not assume `*` matches `/`.
For tags the final packet must preserve an independently verified all-tags
selector from the actual supported schema/UI; do not copy a branch-only selector
or guess that a one-level glob covers nested tags. [GH2] [GH3]

### Proposed rule inventory

All target sets must be expanded to exact reviewed JSON and independently
checked for overlap. There is no precedence priority between rulesets; all
applicable layers aggregate. Ordering below means **installation staging**,
not a way to override a more restrictive rule. [GH1]

| ID | Target; include / exclude | Active rules | Only permitted bypass |
|---|---|---|---|
| N0 | branch; [~ALL] / [] | non_fast_forward; deletion | NONE |
| N1 | branch; [~ALL] / [X plus exact K entries] | creation | NONE |
| N2 | branch; [~ALL] / [C, X, exact W entries] | update, update_allows_fetch_and_merge=false | NONE |
| N3 | branch; [C] / [] | update, update_allows_fetch_and_merge=false | Actual P Integration/App ID, always, solely this ruleset |
| N4 | branch; [X] / [] | update, update_allows_fetch_and_merge=false | Actual B Integration/App ID, always, solely this ruleset |
| N5 | branch; [X] / [] | creation | Actual C0 Integration/App ID, always, only approved provisioning window |
| N6 | tag; verified all-tags target / [] | creation; update with supported parameters; deletion; non_fast_forward where supported | NONE; feature compatibility must be verified |
| N7(r) | branch; [one exact W entry r] / [] | update, update_allows_fetch_and_merge=false | Actual distinct U(r) only, with independently verified supported actor type |
| N8(k) | branch; [one exact K entry k] / [] | creation | Actual named product provisioner for k only |
| N9 | branch; [X] / [] | update | NONE during candidate hold; installed later under exact candidate/hold authority |

N0–N6 are seven baseline rule objects. N7/N8 add one per independently authorized
work entry; N9 is a later hold, not a startup requirement. N2 still freezes
unlisted updates by design. No W/K entry is made effective by this proposal.
The reviewed documentation gives a 75-ruleset repository limit. The filled
packet must count existing plus proposed objects and retain capacity for safe
staging. Group exact refs only when their actor, authority and rule semantics
are identical and independently approved; never broaden a pattern or bypass
to evade capacity limits. An oversized catalog is a B1 feasibility blocker.
Do not exclude main, product baselines or historical ops merely because their
names match a product prefix. Their current freeze remains unless the Owner
separately approves an exact legitimate change scope.

P/B bypass the update rule only; they remain bound by separate N0 force/deletion
restrictions and N1 creation restrictions. N5 does not grant C0 subsequent update
authority. Once X creation is confirmed, close C0 issuance and remove its
creation exception or make N5 deny all under the approved plan; B cannot recreate
a missing branch. No admin/write/maintain-role, shared-App, blanket deploy-key,
OrganizationAdmin or exempt/no-audit bypass. Personal-repository organization-only
roles cannot be presumed available. If exact U/C0 actor type is unsupported,
use a separately approved dedicated App or BLOCK, not a broad role exception.

No new required PR, status check, signature or workflow requirement is added
implicitly. Such policies could strand the established PC publication route
and require their own compatible independent producer and design approval.

### Comparison with accepted R0–R7

| Policy | Benefit | Operational/security cost | F1 conclusion |
|---|---|---|---|
| Original R0–R7 | Simple all-other-ref freeze with narrow P/B paths | Freezes product/future creation and tags without a working integrator catalog | Preserve as accepted design; not recommended as indefinite default |
| N1 partitioned writer catalog | Same experimental denial plus explicitly permitted exact legitimate work | Ref coverage, actor matching and staged exceptions still require administration; unlisted work waits | Preferred B1 candidate, conditional on Owner-confirmed catalog and qualification |
| Protect six named refs only, leave rest freely writable | Fewer immediate settings | B can affect other product/history refs with repository Contents write; misses S2 and alternate effects | REJECT as a shortcut |
| B2 separate repo and restricted route | Experimental bearer has no YU3DOH repository-write grant; fewer coupled product rules | New authority/input custody and independent isolation proof; original S2 still needs disposition | Preferred practical fallback; not authorized here |

There is no established native deny-only-this-App branch policy that preserves
unlisted writers unrestricted. An update restriction operates through allowed
bypass actors. The catalog is therefore a real product workflow change, not a
claim that B1 is administratively free. Its benefit is limiting each exception
to known work, not eliminating the need to coordinate work. [GH2] [GH3]

### Safe additions to W/K without an uncovered interval

For a future exact product ref, independently authorize its U/provisioner first.
Create/read back the narrow N7/N8 restriction **before** excluding that ref from
N2/N1. The default deny remains while the narrow rule is prepared. Remove an
exception by restoring default-deny coverage first, then retiring the narrow
rule. Never temporarily disable N2 globally to let one legitimate change through.
All settings acknowledgements, actor bindings and match readbacks are required;
no mutation is presumed atomic across multiple ruleset objects.

## 6. Publisher and endpoint configuration contract

This is a future trusted-route specification, not source implementation or
installed enforcement. It can be operated manually by an independent trusted
publisher with a locked tool profile; a permanent service is not required.
The prototype's fake publisher must never become this real writer by default.

| Surface | Permitted purpose under later exact authority | Required deny behavior |
|---|---|---|
| Immutable GETs for commits/trees/blobs and explicit path/ref content | Recover authority, parent, allowlist and raw source custody | No default-ref fallback, wrong repo ID, unapproved host/redirect/query or arbitrary mutable-source freshness claim |
| GET exact refs/history/configuration | Fresh verification/read-only reconciliation; separate query IDs | Cannot substitute event/assembly time for receipt; pagination/completeness required |
| Create blob/tree/commit | Only whole-tree-approved data bundle for the specific P or B target, bound parent and modes | Reject unrelated object content, extra parents, deletions/modes/hidden paths outside exact scope; candidate code never executed to inspect it |
| Update exact existing C by P or X by B | Approved expected-old H to prepared N, force=false | Reject caller-selected alternative ref, missing expected head, unauthorized actor or stale approval; inspect history on unknown ACK |
| Create exact X by C0 | One absent-ref/create-only transaction at approved source SHA; closed after verification | No update-as-create, name collision fallback, force or extra branch/tag |
| Ruleset/configuration writes | A/G change operator only under future exact Owner settings packet | Not available to E/B/P; no generic credential-signing endpoint |
| Contents PUT/DELETE, GraphQL mutations, merge APIs, Git push, releases, workflows/Actions, keys, settings, tags and extra namespaces | No route in normal P/B broker for this candidate | Denied even when underlying Contents bearer could invoke some of them; direct bearer access outside broker forbidden |

P can relay legitimate role-owned documentation and independently signed QA
findings only under the respective task authority; it cannot silently change
reviewer conclusions or approve its own implementation. Central indexes remain
PC-owned. B writes only the future exact source/evidence/report bundle on X.
Whole-tree verification checks path bytes/case/normalization, symlink/gitlink,
mode, parent list, size/count and namespace collisions. A matching report hash
does not justify extra content in the same commit. No live publisher is installed
or exercised here.

The path proposals remain [PROTO] proposals: new sources under
`validation/pp002-q02-control-integration/`, evidence under
`validations/PP-002/Q02-CONTROL-INTEGRATION/Q02-PROT-001/`, and
`implementations/PP-002_Q02_OFFLINE_PROTOTYPE_REPORT.md` on X only. Later S3 must
freeze exact files, generated-name grammar and limits; no wildcard in this
handoff is an implementation authorization. Existing Q01/R1/C source/evidence,
central indexes, protocols, product and `.github/workflows` remain outside scope.

### CAS, freshness and Q01 composition

The connector declares `expected_sha` and `force`; GitHub REST ref-update docs
document `sha` and `force`, not an expected-old field. Therefore strict atomic
CAS is a required **qualification fact**, not established by a parameter name.
An independently reviewed publisher/transport must enforce exact expected-old
semantics and demonstrate races in disposable resources, or the real integration
remains BLOCKED. A read followed by an unguarded write is not accepted. Preserve
force=false and single verified parent/whole-tree constraints as additional
no-overwrite protection; they do not manufacture an atomic provider guarantee.
[Q02] [GH8]

The existing authorized governance document publication still uses the normal
connector lease/CAS surface, fresh head, single-parent additive preparation,
force=false and postread. Its success does not qualify global enforcement or
the hidden connector's race implementation.

Q01 EXACT_CONTENT may validate immutable historical inputs; it cannot validate
fresh workflow/permission state as though it were an immutable file request.
EXACT_REQUEST_HISTORY needs actual attributable call/receipt custody. A retained
API response committed later proves retained bytes, not original query freshness.
The future outer composition checks authority, exact candidate/payload/paths,
checker applicability and source/current permission fingerprints at use. Original
R1/Gate C checkers remain historical adapters; no new settings-state checker is
created here. Content-only state N/A is explicit, never a fabricated PASS.

Prepared intent time, actual requested_at, receipt_at/responded_at, provider
event_at, recorded_at and verified_at remain separate, with clock/source roles.
If wire/receipt time or dispatch proof is absent, preserve UNKNOWN. No atomic
Git journal plus external request is assumed. A crash between them leaves an
emission gap until durable independent evidence reconciles it. [Q02]

## 7. Exact future configuration packet and Owner change form

The packet is a data contract to be completed later, **not an approved change**.
Version it by policy, schema, source commit/blob and canonical configuration
hash. Required UNKNOWNs or unreviewed differences make it non-executable.
New actual configuration approval must bind the finalized bytes, not a floating
URL to this proposal. An attestation cannot contain its own future publication
SHA; publication receipt/readback is appended separately.

| Packet record | Required fields / independently verifiable acceptance |
|---|---|
| CFG-00 AuthoritySeed | New Owner approval, scope/route blobs, assignment/phase, operator, independent verifier, exact target numeric repo/owner IDs, allowed actions/effect budget, closer and expiry; F1 alone insufficient |
| CFG-01 BeforeInventory | Current control/source SHA/tree, all branches/tags/other refs and work catalog, complete applicable rules/classic settings/bypasses, actors/routes, feature evidence; raw nonsecret bytes plus hashes and custody clocks; no truncated/paginated gap |
| CFG-02 ActorBindings | ID-01–ID-08, actual P/B/C0/U/Q/A/G IDs; P != B; credential issuance/expiry/revocation constraints and inaccessible fallback routes; independently authenticated issuer attestation |
| CFG-03 ExactDelta | For each object: CREATE/UPDATE/RETIRE, semantic key, actual ID or explicit not-yet-created ID, target/conditions/rules/bypass before and proposed after; raw and canonical hashes; dependencies, expected current fingerprint, inverse/containment action |
| CFG-04 CapabilityPins | Exact provider/API/schema version, broker/config/code digest, runtime policy version, qualifying test source/ref identity and known differences; no assumed future feature support |
| CFG-05 Continuity | Current legitimate PC authority/artifact and positive publication path; W/K product work/actor mapping, blocked operations, change window and Owner tolerance; out-of-band recovery custodian |
| CFG-06 Safety/Custody | No experimental dispatch while partial; data classes/secret exclusion, approved archive/retention, incident contacts, request budget, deadlines and stop conditions |
| CFG-07 Qualification | V01–V20 mapping below, independent oracle/positive controls, disposable-only effects, real-target read-only readbacks; exact needed principal/token-resource mapping and accepted residual differences |
| CFG-08 ChangeJournal | Per logical operation: parent, purpose/type, authority/control, actor, target/output namespace, exact payload hash, planned_intent separate from observed_state, actual issuance/ACK, receipt IDs and six independent v2 dimensions, safe action/closer |
| CFG-09 AfterReadback | Actual returned ruleset/object IDs and source bytes, effective match results, actual actor lists, current refs, before/after/expected diff, custody clocks, independent verifier verdict; no missing bypass field treated as empty |
| CFG-10 Closure | Lifecycle/outcome/effect/evidence/cleanup/ACK, credential expiry/revocation and route closure, resources retained/disposed under authority, incident disposition, PC successor closer and exact evidence commit/blobs |

Canonical configuration hashing preserves array order where semantic, states a
normalization version and excludes only documented volatile response fields;
retain raw hashes too. A semantic match cannot excuse an extra bypass or missing
ref. Actual newly assigned ruleset IDs enter the receipt and finalized mapping
after creation; do not invent IDs for preapproval. GitHub has no multi-object
transaction or automatic expiry guarantee here. Before each later authorized
settings action, re-read the affected object's complete fingerprint, serialize
the Owner change window, and STOP on drift. This is a staged operational guard,
not claimed server-side CAS for settings.

### Owner-facing approval form, to be completed and separately issued

| Field | Required explicit Owner choice; current value |
|---|---|
| Placement | B1/N1 versus separately scoped B2; UNDECIDED FOR CONFIGURATION |
| Packet | Exact CFG record manifest SHA/blob/hash, schema and independent DESIGN_QA result; NOT YET PRODUCED/ACCEPTED |
| Operators/principals | Actual A/G, P, B, C0, U, verifier identities and their permitted phase; UNKNOWN |
| Resources/actions | Numeric target and disposable repo IDs, exact refs/ruleset delta/endpoints and test effects; target repo known, remainder UNAPPROVED |
| Business continuity | Confirm W/K inventory, intentional blocks and maximum window, next legitimate PC publication and emergency route; UNAPPROVED |
| Credential/data custody | Issuer, repository/permission subset, maximum lifetime, revocation/expiry, secret-free public classes and retention; UNAPPROVED |
| Qualification | Exact V tests/subcases, real-target reads only, disposable targets for writes, effect and incident budget, independent acceptance criteria; UNAPPROVED |
| Rollback | Exact contain/repair plan; preservation of no-force/deletion and original refs; no return-to-unprotected default; UNAPPROVED |
| Expiry/stops | Named deadline, drift invalidation, unresolved operation handling and original closer; UNAPPROVED |
| Exclusions | Q02 implementation still separate; no product change, generic protocol/adoption or unscoped App change; MANDATORY |

Proposed credential policy: issuer outside E; only selected approved repository
IDs and minimal explicit permission map; short-lived installation tokens, at
most their documented one-hour lifetime and bounded to the task window, no
automatic renewal after expiry of authority. Token values never enter public
evidence. Revocation/suspension is an operator action requiring the later incident
authority; installation suspension is not presumed to revoke every user-authorized
route. Verify all routes separately. [GH4] [GH6]

## 8. Qualification substrate, independent oracle and V01–V20

**Every V check remains NOT EXECUTED.** Later qualification must have explicit
authority for new disposable resources, real actors and bounded effects. No
denied-write test, no-op ref probe or connection-switch exercise is permitted
against the real repository under F1 or under this proposed qualification plan.

Define D as a separately authorized disposable repository ID, not YU3DOH and
not silently a fork inheriting other policy. It contains synthetic histories
and exact-name equivalents dC/dX/dMain/dProduct/dOps, disposable nested tags and
extra namespace subjects. Use no product data or real secrets. Pin test source
and oracle before execution. Q must observe raw requests/responses, server rule
results where available, before/after refs and the permitted positive control.
The implementer's expected labels are not the independent oracle.

Where actual P/B App identities can be installed in D, bind the same registration
IDs but separately approved D installation/resource subset and expiry. D's token
is not the future YU3DOH token: explicitly compare permission grants, issuer and
route config. Do not broaden a production token to run a test. If actual intended
actor cannot participate, a surrogate's result is only partial; independent Q
must justify the mapping or record S1/S2 BLOCKED.

For every row retain test ID/subcase, source code/config hashes, request ID,
actual signer/issuance attestation, source and target repo/ref IDs, requested_at,
receipt_at/responded_at, event_at separately, recorded_at/verified_at, response
status/reason, before/after commit/tree/blob, counters, expected/actual effect,
cleanup and closer. A 403 from an expired token, bad request or absent access
does not prove the intended ref restriction. Positive controls bracket related
negative cases; anomalous principal/config drift invalidates the batch.

| V ID / retained scope | Principal and future target | Independent oracle, positive/denied controls and closure |
|---|---|---|
| V01 — actor/auth/installation/route bindings | Q with Owner/issuer/platform evidence; actual target read-only | Reconcile ID-01–ID-08 and per-call signer, not user metadata; allowed P/B test reads/allowed D publication show functioning routes; any accessible P/admin fallback from E/B fails S1 |
| V02 — effective rules/bypass/plan | Q actual target read-only; D config comparison | Complete active/classic/inherited rules and actor list plus absent/nested-name matching; disabled/evaluate not enforcement; missing public bypass fields require Owner evidence, never assumed none |
| V03 — normal PC additive CAS | P on dC | Valid permitted doc/tree succeeds once; stale head, extra path or wrong authority rejected; exact parent/readback and signer. An existing separately authorized legitimate real PC publication may supplement continuity, never a fabricated test commit |
| V04 — B official-ref denial | B on dC/dMain/dProduct/dOps | Well-formed permitted-type updates denied by expected server rule, before/after unchanged; B dX positive succeeds. Cover archived and active U product equivalents; no corresponding real-target writes |
| V05 — allowed B publication | B on dX | Exact allowed bundle succeeds once with effective rules active; forbidden sibling ref/extra file rejected; positive effect/blob/parent independently verified |
| V06 — default/wrong target and tree escape | Caller E/B at broker, D only if an allowed call is reached | Omitted branch, wrong repo/ref, extra parent, hidden path, deletion/mode/symlink rejected before remote mutation; valid allowed bundle positive; remote-call counter zero on broker rejection |
| V07 — direct/alternate writer routes | B bearer exercised by trusted tester only on D; E has none | Contents API, Git refs, supported GraphQL/Git paths on official equivalents denied by actual rule; no credential exported to E. Unsupported routes recorded as not covered, not PASS; positive permitted dX route proves valid auth |
| V08 — force/delete with update-bypass identities | P/B and applicable U on D | Non-fast-forward and deletion denied by separate no-bypass history layer even for update-bypass actor; ordinary scoped fast-forward positive succeeds; refs unchanged for denied cases |
| V09 — branch/tag/other namespaces | B on D and broker | Arbitrary branch create, nested tag, tag rewrite/delete and supported extra refs denied where native/broker guarantees apply; C0 exact dX creation/allowed dX update positive; distinguish broker denial from absent native coverage |
| V10 — C0 single creation | C0 on absent dX at pinned synthetic source | Create once succeeds; duplicate creation, changed source/name and subsequent C0 update denied; issuance closed/readback proves closer. Positive absence-check is not itself create authority |
| V11 — shared principal/connection switch | Q/platform tester in disposable context | Deliberately shared-App fixture must yield NO-GO; attempt to obtain privileged route denied by actual context boundary, no production credential/request. Distinct allowed B route positive; unavailable platform control remains UNKNOWN |
| V12 — forged/stale approval/index/reviewer | Untrusted producer to broker with fake/disposable data | Trusted pins/independent reviewer binding reject false/self-approved or stale assertions with zero mutation; valid separately authenticated approval positive; hashes alone cannot authenticate forged facts and index |
| V13 — race / CAS / lost ACK | P/B on D; independent transport observer | Concurrent expected-old conflict rejected; accepted-original ACK loss reconciled by read/history with one accepted effect, no duplicate; allowed non-racing update positive. Strict CAS capability separately demonstrated, not inferred from force=false |
| V14 — partial activation/expired route/unavailable P | A/G in D; P/B test routes | B remains stopped through partially installed rules; expired call not misreported as ref denial; scoped P repair succeeds while common history invariants remain. Missing configuration ACK reconciled before any further mutation |
| V15 — secret/path/unsafe artifact custody | Synthetic bundles at trusted quarantine; approved D upload only | Fake secret-like canary/signed-URL/traversal/symlink rejected before Git object creation; safe bundle positive. No real credential seed; accepted/rejected inventory and zero unsafe-upload callbacks verified |
| V16 — offline execution isolation | E and independent runtime tester in authorized isolated disposable host | Safe local canaries show no network/metadata/host socket/connector/credential route; controlled benign output succeeds. OS/platform enforcement evidence covers outer context; Python mock denial alone insufficient |
| V17 — candidate hold/QA separation | B/P/Q in D then real candidate read-only if later created | Exact candidate SHA/tree held; new B update denied during hold, independent Q can read/replay exact subject; pre-hold allowed update positive. QA identity different from implementer; hash-pinned subject cannot drift |
| V18 — drift/expanded grants/new bypass | A/G changes D fixture only; Q actual read-only drift inspection | Changed principal/permission/repo set/rule/runtime invalidates approval and stops B; unchanged approved fingerprint positive; no live target setting changed as a test |
| V19 — suspension/recovery/rollback | A/G/P/B in D | Contain B first; independently verify suspended route cannot operate, scoped P path restored without force/delete broadening; retained refs/evidence/operation closer checked; stale/original uncertain writes never replayed |
| V20 — B2 scope if selected | B2 publisher and Q, separately approved disposable resources only | Exact sandbox authority positive; separate sacrificial outside-scope target denied. Real YU3DOH used only for nonsecret grant/config reads, never negative write. Public YU3DOH read success is compatible with no write grant |

V01/V02 real-target portions can be read-only once proper evidence access is
available. V03–V19 behavioral effects require a separately approved disposable
qualification environment; V20 is CONDITIONAL/B2, explicitly not applicable to
a B1-only behavioral run rather than silently counted PASS. V16 requires safe
runtime-test authority. No qualification or QA is assigned or started now.

### Mapping disposable results to the real target

Q must produce a difference manifest for numeric repo/owner/installation IDs,
visibility/plan, actor registration/auth mode, grants/token subset, rules/classic
layers/bypasses/conditions, publisher/runtime versions and transport. Only declared
resource substitutions and synthetic content may differ without further review.
Same branch spelling is insufficient. Raw effective-rule readbacks for actual
C/X/main/product/history and the default unknown-name class must agree with
the proposed coverage; tags/other namespaces need their own evidence.

GitHub documents that active branch rules can be read for absent branch names,
but this connector rejected the requested endpoint. Also, public detail responses
may omit bypass_actors unless caller can write the ruleset. Obtain complete
nonsecret Owner-assisted views rather than assign settings-write access to the
independent reviewer by default. UI/export alone must declare actor omissions;
reconcile with full readback. [GH3]

The composite proof establishes actual configuration plus an independently
justified disposable behavior mapping. It does **not** establish empirical
denial against real refs. If Q cannot support that inference or the Owner
requires a real-target negative proof forbidden by the safety scope, the result
is BLOCKED/NO-GO, not permission to probe or lower the gate.

## 9. Staged activation and PC/product continuity

Every future mutation here requires the approved exact CFG packet and separate
Owner authority. B remains disabled until all required pre-execution gates pass.

| Stage | Required action / exit proof | Partial-failure disposition |
|---|---|---|
| F0 Paper review | Independently accept this contract; resolve missing identity/access/continuity facts | Remain design-only; no configuration |
| F1 Recovery and baseline | A/G out-of-band channel, complete before hashes/refs/work catalog, named closer; future incident authority exact | No change if unavailable or business impact unapproved |
| F2 Identity and disposable qualification | Provision distinct routes outside E if explicitly authorized; qualify D policy/transport/runtime including PC and U positive controls | No experimental target create/implementation; failed or surrogate-only proof remains BLOCKED |
| F3 PC continuity preparation | Read current C/task/head; verified P binding and whole-tree expected-old publisher; planned legitimate PC task and A/G repair path | Do not make a bogus control publication or expose admin fallback |
| F4 Narrow gates first | Create/read back N3, N4, N5 and any exact N7/N8 while B stopped; N0 history layer and tag containment staged with readback | Partial protection is not S2 PASS; no B dispatch |
| F5 Complete default coverage | N1/N2 include all remaining names; confirm exceptions already protected; inspect actual effective rules/bypasses and full ref inventory | Unknown settings ACK triggers read-only reconciliation; no duplicate rule creation |
| F6 Independent S1/S2 disposition | Q signs exact identity/config/qualification mapping, actual current refs, P continuity and residual risk | No GO from checklist or publication success alone |
| F7 Separate S3 creation/execution route | Owner freezes source/control/candidate paths and S4/S5 readiness; C0 create once only under new route | No implicit implementation grant from F6; second attempt not presumed authorized |
| F8 Candidate and S6 | Hold exact candidate, independently run I01–I32 and frozen regressions under separate QA route | No acceptance/integration until independent exact-subject disposition |

Current W/K is only proposed empty. Before F4, Owner must confirm no active
writer omitted, or bind exact U/K entries using section 5. Legitimate future
product integration is not globally forbidden by this contract; it requires
its normal product authorization plus a compatible exact permission entry.
No entry may authorize product mutation as part of PP-002. If recurring manual
branch onboarding would delay product work beyond the Owner's accepted window,
choose B2. Do not grant all writers a bypass to avoid the administrative work.
Common deletion/force restrictions also affect ordinary branch retirement and
release/tag administration. Inventory those dependencies before activation;
legitimate cleanup needs its own exact later disposition, not a hidden history
bypass or an assertion that normal product operations are unaffected.

P's first independently verified, already-authorized legitimate document
publication after activation can establish positive actual continuity. If it
fails, stop B and repair only P through A/G. The ordinary expected-head rejection
path follows [CAS]: recover current head/authority; compatible advances permit
explicit reprepare after original attempt disposition, conflicting authority or
occupied paths BLOCK. New source refs never fill missing original request refs.

## 10. S3–S6 execution, custody and acceptance contract

| Gate | Before which action | Required evidence / current truthful state |
|---|---|---|
| S1 | B1 implementation/provisioning GO | Actual distinct principals, complete routes/grants, inaccessible P/admin fallback, Q independent verdict; NOT PROVEN |
| S2 | B1 implementation/provisioning GO | Complete active ref controls/bypass and independently justified behavior mapping, PC/product continuity; NOT PROVEN |
| S3 | Exact X creation | Separate execution authority; exact immutable source SHA/tree plus authority SHA; absence/collision recheck; exact names/modes/limits and preserved refs; PROPOSED ONLY |
| S4 | Code execution and throughout | Credential-free/network-free/connector-free outer environment, independently established enforcement and scoped local inputs/outputs; NOT ESTABLISHED |
| S5 | Any public artifact upload and throughout | Approved public data classes, trusted data-only inspection, quarantine, retention and incident custody; NOT IMPLEMENTED |
| S6 | Candidate acceptance/integration | Separately assigned independent QA on exact SHA/tree and all I01–I32/subcases plus Q01 F01–F31 and unchanged R1/Gate C regressions; NOT EXECUTED |

Do not choose today's activation SHA as an executable baseline by default.
Future S3 must distinguish immutable input snapshot, effective authority,
branch creation source and delivered candidate. Q01 candidate remains
328e57035d34f98c4d8d417729e8b12f91894e95. No copied control index on X is the
live Project Control authority. No source/validator/history is overwritten.

S4 requires externally verified no egress, cloud identity endpoint, credential
helper, SSH agent, host socket, connector selection or writable privileged mount.
Prepare the corpus/dependencies before execution, mount inputs read-only, allow
bounded scratch only, use standard-library offline mocks. Administrative setup,
branch provisioning and authorized upload are separate real-effect phases;
never report them as zero just because the code's tests have zero real calls.

S5 allows approved public inputs and clearly synthetic fixtures only. Reject
headers/tokens/private keys, signed URLs, private logs, raw environment dumps and
unapproved identifiers. Scan/review data without executing candidate code, hooks,
archive instructions or imports. Preserve byte identity of originals; unsafe
raw evidence is quarantined with an explicit gap, not redacted and labeled exact.
Fixtures use fake canaries, never genuine secret values. Public history is
copyable; branch deletion cannot guarantee erasure.

S6 preserves all 32 I families and required subcases at [Q02] section 13, their
independent raw-fact oracle, deterministic two-root semantic-byte comparison,
callback/effect counters, planned-vs-observed separation and unchanged historical
negative controls. Tests I13/I23 must honestly expose internally consistent
forgery/unrestricted bypass limits; a mock PASS cannot attest installed GitHub
security. Q must independently reproduce exact candidate source/config/fixtures,
check all preserved refs and qualify conclusions as offline only. S6 is after
candidate delivery, not a circular startup precondition or a startup waiver.
No tests were run in F1.

## 11. Incidents, lost acknowledgements and rollback

Each emitted future administrative/publication operation has a logical ID,
known external ID or explicit lost-ID state, exact authority/subject/output
namespace, accountable closer and separate lifecycle/outcome/effect/evidence/
cleanup/ACK. Planned steps are not observed effects. C0 creation, a ruleset
change, a Git object and a ref update have independent lifecycles. A child error
does not close an active parent or prove no effect.

| Condition | Safe disposition and required evidence |
|---|---|
| Known authorization/config/identity drift | BLOCK affected B dispatch/publication; obtain fresh authoritative readback; do not continue with stale GO |
| Settings create/update response lost | Reconcile original by semantic key, before/after bytes, returned or recovered ID and history; UNKNOWN if attribution insufficient; no blind second create/update |
| Ref publication ACK lost | Read exact N/C/X/history and output bytes; N current or verified ancestor can reconcile original effect. Absence in one current tree is not proof of no prior issuance |
| Positively rejected CAS | Record failed request/effect separately; inspect compatible current authority/head/path and original closer before explicit authorized reprepare; no force |
| X collision / unexplained extra writer | BLOCK; preserve both histories; no overwrite/delete/reuse by name alone |
| Partial installation or P lockout | Keep B disabled; A/G repairs only approved P binding while no-force/deletion and official coverage stay in force; no all-admin bypass |
| Experimental route leakage / duplicate effect / unsafe public data | Stop affected dispatch; authorized custodian contains/revokes affected route, preserves nonsecret incident evidence; no exposure of P credential as workaround |
| Lost executor/operator continuity | PC-003 names successor closer; recover durable authority/receipt/config state first; silence never means failed/nonemitted |

Recovery order: contain B; preserve raw safe evidence and uncertain originals;
read current rules/actors/refs; verify the last known approved safe partition;
repair only scoped legitimate access; independently verify effects/cleanup;
append incident/closure disposition; decide whether B1 stays NO-GO or moves to
B2 under new scope. A replacement success never closes the original.

Rollback means restoration of a separately approved **known-safe configuration**
or containment, not restoration of the observed empty/unprotected rules state.
Capture exact inverse deltas but do not apply one if it opens a protected writer
path. Do not delete branches/tags, reset history or force refs as a recovery
convenience. Product/operational refs remain observed only.

Default retention preserves candidate, receipts, failed tests and incident
records. Disposable cleanup, temporary grants/route expiry and repository/ref
disposal need explicit later authority and readback; no automatic Git garbage
collection claim. If public exposure occurred, authorized revocation/containment
and assessment of copies are required; not a promise that history can be erased.
Loss of control transport permits safe read-only recovery where available,
not new mutation based on conversation memory.

## 12. B1 versus B2 cost and selection contract

No security qualification, timing benchmark or implementation occurred. Estimates
below are planning assumptions for a small manual qualification with existing
skills, one change window and no new custom service. Provider negotiation or
building a broker can dominate and is excluded, not assumed free.

| Burden | B1/N1 | B2 independently permissioned |
|---|---|---|
| Routine identities | P and B distinct; C0 provisioning; U per actual product work; A/G and Q duties | Existing P untouched; isolated B2 publisher/provisioner plus A/G/Q; still distinct route from P |
| Ref policy | 7 baseline objects + W/K entries + later candidate hold; coverage of 47 existing and future names | Sandbox protection/hold and separate repository selection; original S2 remains its own explicit obligation |
| Shared boundary work | Platform route proof, offline host, custody, independent QA | Same; a second repo does not remove this work |
| Predicted hands-on effort | 24–56 person-hours for packet, configuration/qualification/readback/recovery review, excluding new service | 14–32 person-hours for permission/input mapping, qualification and review, excluding new service and any original-repo S2 remediation |
| Common runtime/custody setup, if absent | Additional 8–24 person-hours, uncertain | Additional 8–24 person-hours, uncertain |
| Recurring work assumption | 0.5–2 hours per changed grant/rule/work entry; original product change scheduling | 0.5–1.5 hours per changed sandbox grant/baseline; controlled export mapping |
| Coupling risk | Wrong rule/bypass can strand PC/product or expose original refs; raw bearer also reaches other same-repo APIs | Broker compromise limited by repository grant; public corpus still exposed; shared all-repo route would negate benefit |

These ranges are not measurements, commitments or a proven cost ratio. Record
actual operator/reviewer time, actor/grant/rule counts, admin touchpoints,
publications/reads, denied/allowed effects, recovery delay, blocked product work
and credential custody. A manual broker avoids service construction only if
its operator/context boundary is actually enforceable.

**B1 conditional selection criteria:** Owner independently wants durable local
PC/product controls; true separate P/B/outer-context isolation is attainable;
complete writer inventory supports N1 without unacceptable business interruption;
Q accepts actual-config/disposable behavior mapping and residual issuer risk;
all phase gates are met under separate execution authority.

**Select separately scoped B2 if:** shared connection cannot be excluded; same
bypass-capable principal is needed for P/B; actual bypass/rights cannot be audited;
strict publication transport cannot be qualified; product onboarding becomes
disproportionate; or same-repo raw-bearer blast radius is unacceptable. B2 must
use a selected-repo-limited identity with no YU3DOH write access or selectable
PC route, not a fork or all-history copy by assumption. Export only required
public pinned inputs with original commit/path/blob membership and archive
hashes; new import commit is not relabeled as the original Q01 candidate.

The future B2 authority must explicitly map S1–S6 and treatment of original
official-ref S2, repository visibility/plan, namespace/retention and publication
return path. It cannot declare original refs safe merely because writes move
elsewhere. No B2 repository, App, token or branch is authorized now. Federation
strategy does not justify standing upstream write access to local projects.

## 13. Independent DESIGN_QA review contract

Proposed later assignment: F1-DESIGN_QA-001, independently named and routed by
PC-003 after this return. This is a recommendation only; no reviewer is started
or self-appointed. Its review can be entirely read-only and must not run V tests,
code or live permission probes unless separately authorized.

| Acceptance criterion | Objective evidence / rejection condition |
|---|---|
| DQ01 Exact authority/custody | Reconstruct activation and immutable input blobs, accepted B1 and F1 scope; handoff publication only one additive file; any silent fallback/ref mismatch rejects |
| DQ02 Honest actual state | Check reported reads/errors/clocks/coverage and reproduce available GETs with new timing; no admin=true to token inference; UNKNOWNs retained |
| DQ03 Principal completeness | P/B/C0/E/Q/A/G/U map and alternate routes; real IDs not invented; same-App exception absent; inability to prove E route separation leaves NO-GO |
| DQ04 Rule correctness and scope | Expand N1 set partition, nested name/tag handling, overlapping restrictive layers, no-bypass history, per-r ref/work exceptions and narrow actor scope; no claimed path restriction from branch rules alone |
| DQ05 Product/PC continuity | Verify current work/PR/47-branch inventory and stale backlog qualification; explicit upcoming work, staging/repair, no hidden global freeze or admin escape |
| DQ06 Executable-packet boundary | All future actual IDs/schema/config hashes, approvals, request clocks, issuer attestation, expiry/rollback/closer fields specified; unresolved fields block execution, not fabricated success |
| DQ07 Qualification coverage | V01–V20 preserved with independent oracles, principals, disposable targets, positive controls, denial reasons, receipts and real-vs-disposable mapping; forbidden real probes absent |
| DQ08 Custody/recovery | Public-data quarantine, no secret request; unknown ACK reconciliation, replay/collision/drift, independent cleanup/retention and no rollback-to-unprotected default |
| DQ09 Layer separation | Read-only design QA distinct from settings qualification, Q02 offline I01–I32 and eventual S6; original Q01/R1/C untouched; no automatic execution/adoption |
| DQ10 Proportionality/decision | Estimates labeled assumptions, B1 limitations and B2 distinct-identity requirement; six gates phased; no PASS from successful documentation publication |

Accepting this handoff means **paper configuration/qualification design ready
for an informed Owner decision**. It does not establish S1/S2, approve filled
settings deltas, install a publisher or authorize Q02-PROT-001. Reviewer outcome
must identify concrete corrections if incomplete, preserve original handoff and
append its independently signed findings through a separately authorized route.

## 14. Source register, publication guard and terminal finding

Appendix A lists the sixteen freshly retrieved activation sources. Each raw
UTF-8 Git blob was recomputed and matched to the complete nontruncated activation
tree. That tree contains 1762 predecessor blobs, 1887 total entries and no
AGENTS.md. Document integrity/format preparation is not code, prototype or V-test
execution. Official vendor references below describe mechanisms, not current
installation, actual bearer rights or provider-proof completeness.

This assignment permits only the new file
`handoffs/PP-002_Q02_F1_FEASIBILITY_AND_CONFIGURATION_CONTRACT.md` on control.
Before publication: re-read head; verify unchanged source authority and no
material incompatible advancement; verify output absent; create one additive
single-parent document commit; compare all predecessor paths/modes/blobs; update
with expected current SHA and force=false. On rejected lease, inspect compatible
new head before any reprepare. Afterwards read exact commit/tree/file and refs.
The actual publication SHA/blob/parent are returned outside this document after
verification, avoiding self-referential future-commit claims. No central index,
frozen design/validator/evidence, ruleset, credential, branch/tag, product or
operational ref is changed.

Terminal finding:

- F1 design contract: READY FOR SEPARATELY ROUTED INDEPENDENT DESIGN_QA.
- B1 feasibility: CONDITIONAL TECHNICAL PATH; NOT QUALIFIED ON CURRENT SUBSTRATE.
- Preferred B1 proposal: N1 partitioned legitimate-writer catalog, not indefinite
  blanket freeze or unprotected-product shortcut.
- Current practical recommendation: B2 with truly independent limited identity
  if missing platform/issuer/rule proof or B1 operational cost cannot be resolved.
- S1/S2: NOT INDEPENDENTLY PROVEN. No V01–V20 executed; no I01–I32 executed.
- Only a later separately reviewed, fully bound packet can support a new Owner
  configuration/qualification decision; prototype authorization remains separate.
- Q01 independent offline PASS, Q02/B1 design acceptance, Gate C/final REVISE,
  P01 UNCERTAIN, P02 UNKNOWN and all frozen protocols remain unchanged.

**DESIGN/CONFIGURATION UNINSTALLED / S1–S2 UNPROVEN / PROTOTYPE NO-GO.**

RETURN: PROTOCOL_PORTABILITY / PP-002 -> PROJECT_CONTROL / PC-003.

## Appendix A. Immutable source register

All paths below were retrieved at `708f014d7af6549f677aedcb2ab01cd53228e4e9` in `KhaosMagnus/YU3DOH-Carder`.
Caller retrieval interval was 2026-10-31T02:11:19.725Z through the subsequent source reads; source commit event time is not the read receipt time.

| Label / pinned source | Git blob |
|---|---|
| [OWNER] [control/PP-002_Q02_F1_OWNER_FEASIBILITY_APPROVAL.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/708f014d7af6549f677aedcb2ab01cd53228e4e9/control/PP-002_Q02_F1_OWNER_FEASIBILITY_APPROVAL.md) | `1475241fc3ffb636498d96b2fb3210bb6566cc68` |
| [SCOPE] [control/PP-002_Q02_F1_FEASIBILITY_CONTRACT_SCOPE.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/708f014d7af6549f677aedcb2ab01cd53228e4e9/control/PP-002_Q02_F1_FEASIBILITY_CONTRACT_SCOPE.md) | `b488bafdc8f642ae1af824477675d6d0658ece08` |
| [AUTH] [control/PP-002_Q02_F1_FEASIBILITY_DESIGN_AUTHORIZATION.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/708f014d7af6549f677aedcb2ab01cd53228e4e9/control/PP-002_Q02_F1_FEASIBILITY_DESIGN_AUTHORIZATION.md) | `58db8439e2147c58ad6eddfaa8c38bc66a5c19d0` |
| [ROUTE] [routing/ROUTE-PP-002-Q02-F1-FEASIBILITY-CONTRACT.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/708f014d7af6549f677aedcb2ab01cd53228e4e9/routing/ROUTE-PP-002-Q02-F1-FEASIBILITY-CONTRACT.md) | `275c8d3548aeba33e429ccc69b9139c1a9c8e1a0` |
| [SNAPSHOT] [validations/PP-002/Q02-B1-SECURITY/PC-003_F1_READ_ONLY_CONFIGURATION_SNAPSHOT.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/708f014d7af6549f677aedcb2ab01cd53228e4e9/validations/PP-002/Q02-B1-SECURITY/PC-003_F1_READ_ONLY_CONFIGURATION_SNAPSHOT.md) | `f101dfbe6eef33b24ffa01e0f0e3e200ebe284bf` |
| [B1] [handoffs/PP-002_Q02_B1_PERMISSION_ISOLATION_DESIGN_HANDOFF.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/708f014d7af6549f677aedcb2ab01cd53228e4e9/handoffs/PP-002_Q02_B1_PERMISSION_ISOLATION_DESIGN_HANDOFF.md) | `d89194237b128b76379533412baec5a56f754b20` |
| [ACCEPT] [runs/PP-002_Q02_B1_SECURITY_DESIGN_ACCEPTANCE.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/708f014d7af6549f677aedcb2ab01cd53228e4e9/runs/PP-002_Q02_B1_SECURITY_DESIGN_ACCEPTANCE.md) | `0f9c4921a2e7a08aa0c52ac800473c25be1bcd9b` |
| [STATE] [PROJECT_STATE.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/708f014d7af6549f677aedcb2ab01cd53228e4e9/PROJECT_STATE.md) | `391ae778b03e0f88030586bfda75079d2ab50d55` |
| [REG] [chats/CHAT_REGISTRY.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/708f014d7af6549f677aedcb2ab01cd53228e4e9/chats/CHAT_REGISTRY.md) | `6f49c0d9571a276dd5cf60a69bd0595f28de67c7` |
| [CAS] [protocols/CONCURRENT_PUBLICATION_POLICY.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/708f014d7af6549f677aedcb2ab01cd53228e4e9/protocols/CONCURRENT_PUBLICATION_POLICY.md) | `9b7c4dfed7b25b98b61e73f342592359b846e490` |
| [GIT] [protocols/GIT_CONTROL_POLICY.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/708f014d7af6549f677aedcb2ab01cd53228e4e9/protocols/GIT_CONTROL_POLICY.md) | `8e00dd5ae7a153a09ce88c2614fbea2ce3f2393d` |
| [SIX] [control/PP-002_Q02_B1_OWNER_SIX_GATE_DECISION.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/708f014d7af6549f677aedcb2ab01cd53228e4e9/control/PP-002_Q02_B1_OWNER_SIX_GATE_DECISION.md) | `16c8ceecb50d59cb2e1d673e53dbaf1cf69610f5` |
| [BACKLOG] [backlog/BACKLOG.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/708f014d7af6549f677aedcb2ab01cd53228e4e9/backlog/BACKLOG.md) | `7e3ab6f88c4b6bdc57d359099f866f3e7db7c692` |
| [Q02] [handoffs/PP-002_Q02_Q01_CONTROL_INTEGRATION_DESIGN_HANDOFF.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/708f014d7af6549f677aedcb2ab01cd53228e4e9/handoffs/PP-002_Q02_Q01_CONTROL_INTEGRATION_DESIGN_HANDOFF.md) | `a06fb711662848ccc16d2e32d621be279a9b1f4d` |
| [PROTO] [control/PP-002_Q02_OFFLINE_PROTOTYPE_PROPOSED_SCOPE.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/708f014d7af6549f677aedcb2ab01cd53228e4e9/control/PP-002_Q02_OFFLINE_PROTOTYPE_PROPOSED_SCOPE.md) | `b546948f2eacb901f57d1b8af5c24d037dccdf78` |
| [Q01] [runs/PP-002_Q01_DQA-007_PASS_DISPOSITION.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/708f014d7af6549f677aedcb2ab01cd53228e4e9/runs/PP-002_Q01_DQA-007_PASS_DISPOSITION.md) | `4f2080c9b90dd4f3d7fcbc780d8b42da0c6d9ba3` |

## Appendix B. Returned branch inventory

OBSERVED from the section 2 branch receipt; all 47 entries had `protected=false`.
These are project preserve requirements, not a statement of effective server protection.
Classification below describes name/known project role, not unrecorded permission or activity.
C is permitted to advance only through the authorized governance publication; all other refs must stay unchanged in F1.

| Exact refs/heads/ suffix | Observed SHA | Class |
|---|---|---|
| feature/serial-v0.1 | `85dcd2f90090ff7da0589c9cf2ae3a4688d35455` | product / historical feature |
| feature/workspace-cr-0001-2-level-rank-domain | `59fb2924b2240f005fb3e9e6d5afbd8aaca39596` | product / historical feature |
| feature/workspace-cr-0001-combined | `64cb5f4ca42348c6c403e64e0d61bdff8c32a281` | product / historical feature |
| feature/workspace-run-001 | `dce133edb3bb64d72ea54434fb4e40a5bf3c04a3` | product / historical feature |
| feature/workspace-run-002 | `070b5ea002211a3bf26a34f80473201495d0b781` | product / historical feature |
| feature/workspace-run-003 | `017c904c22c7842fa1209e3e39885453dda1e63a` | product / historical feature |
| feature/workspace-run-004 | `81c20eb1477e1a0151b6e590d1e31390d82c6de4` | product / historical feature |
| feature/workspace-run-005 | `94c4fed2c114a8d5b38626b48722237d9ec8263d` | product / historical feature |
| feature/workspace-run-006 | `b484f0d5c620dd4fb57054f261a22aaf6e557f0d` | product / historical feature |
| feature/workspace-run-007 | `45d85b6cfd4a28f1b4f241f540159fac076f3978` | product / historical feature |
| feature/workspace-run-008 | `e54800629e46f8fccd653b0bef637dd71e9b97a3` | product / historical feature |
| feature/workspace-run-009 | `3d1a566ceaabdb1eb9bf3346ba87541f26a66782` | product / historical feature |
| feature/workspace-run-010 | `609126af1b0062ca198bcd32e7d21396bb225549` | product / historical feature |
| feature/workspace-run-011 | `1f4b93ee9a3c322b808e8db3f87076b95d6f8d2e` | product / historical feature |
| feature/workspace-run-012 | `590f11f62476a504164055c47aa918e80666ce2c` | product / historical feature |
| feature/workspace-run-013 | `366fea433d6eccde9b2848dee2f9b53297926a69` | product / historical feature |
| feature/workspace-run-014 | `fd13018c881f63764efb60bc1c88b4eb0a400018` | product / historical feature |
| feature/workspace-run-015 | `191454d44f3273cf2efba254bddd8ba5275a08aa` | product / historical feature |
| feature/workspace-run-016 | `163799a60772da69ecabbae03d8b2966a50d6c46` | product / historical feature |
| feature/workspace-run-017 | `0c94aa7990c227690b5d90e2d73ae892a37930ee` | product / historical feature |
| feature/workspace-run-018 | `d7f5d567856503a42d14543d876eb7d1e0c2b311` | product / historical feature |
| feature/workspace-run-019 | `e83de9793c26f78834f748b320161a168943d4ed` | product / historical feature |
| feature/workspace-run-020 | `318e310f3a7f475de00bc427b6654192d615486d` | product / historical feature |
| feature/workspace-run-021 | `ec838d9ea0626d52e133937fb790150575ab623e` | product / historical feature |
| feature/workspace-run-022 | `4b0aa0d6afdbd07d155844d38b2832ea0acfa201` | product / historical feature |
| feature/workspace-run-023 | `c929a6020760525d5cf6daf695b2f44c1d3cd1ca` | product / historical feature |
| feature/workspace-run-024 | `e07140d5a9555a17b7b2306a45625c14adfafc8e` | product / historical feature |
| feature/workspace-run-025 | `dd968ba05e579461962bbcced0e9cae3cd4c3d23` | product / historical feature |
| feature/workspace-run-026 | `e11579950ef7ed20e4b6eeee88f9c3597c1f074b` | product / historical feature |
| feature/workspace-v0.1 | `e11579950ef7ed20e4b6eeee88f9c3597c1f074b` | product / historical feature |
| fix/workspace-rc-canonical-null-zero | `4c9b0228bb47ac074c49a977b48dbf0844c33a94` | historical fix |
| fix/workspace-rc-normal-subtype-icon | `61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c` | historical fix |
| main | `54cc3aad246c89a29f2a18be63c539db68cae041` | main |
| meta/project-control | `708f014d7af6549f677aedcb2ab01cd53228e4e9` | C / governance |
| ops/candidate-a-deploy-003-actions | `22d89b3bb4c6e15b1dcc56eff84d71093e74947b` | historical operational |
| ops/candidate-a-env-002-actions | `bc52a568719e30429c4f517b8c49c1ad05f378ef` | historical operational |
| ops/cr-0001-combined-deploy-003-actions | `22d89b3bb4c6e15b1dcc56eff84d71093e74947b` | historical operational |
| ops/cr-0001-combined-deploy-004-actions | `b4df05521964d97060bd5d1108518a79083afd38` | historical operational |
| ops/pp-002-gate-b-actions | `dd6e8bfecadab0a83c8008ea65300b1f0ba518f8` | historical operational |
| ops/pp-002-gate-b-r2-actions | `0e679ad863076098d92d8a7704f6ca88948b651b` | historical operational |
| ops/pp-002-gate-c-actions | `9c508d06e3862b4b142e998708026a5ed8757fd0` | historical operational |
| ops/run-024-dev-006-actions | `0de56aac07d3f66ed20c4770862ec0cc4bf86de4` | historical operational |
| ops/run-024-env-004-actions | `5aa54988eec0d8c07626f178677660f817640b2a` | historical operational |
| ops/run-025-deploy-005-actions | `f4cc120d21694dc10032bd92cf97f8e5d42f8e14` | historical operational |
| ops/run-025-env-005-actions | `c5d5a08bad6ba110121a813a7db18af5d043f670` | historical operational |
| ops/run-026-deploy-006-actions | `da47a3668c75b916f23650d38677e58d0b38ba36` | historical operational |
| recovery/p6-archival-staging | `6cc7ed5b708b3cf0e88682246a821fd4883020df` | recovery / historical |

## Appendix C. Official mechanism references

Reviewed 2026-10-31 UTC / 2026-10-30 America/Mexico_City. Mutable vendor documentation must be rechecked before any later configuration. No credential example was executed.

- [GH1 — Ruleset layering, visibility and administrator trust root](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
- [GH2 — Branch/tag creation, matching and bypass UI; public push-path limits](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/creating-rulesets-for-a-repository)
- [GH3 — REST rule conditions/parameters, active-rule reads and bypass visibility caveat](https://docs.github.com/en/rest/repos/rules)
- [GH4 — Installation-token repository/permission subset and expiry](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-an-installation-access-token-for-a-github-app)
- [GH5 — App/user/installation permission semantics and Git transport](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/choosing-permissions-for-a-github-app)
- [GH6 — Installed versus user-authorized App access and revocation boundaries](https://docs.github.com/en/apps/using-github-apps/reviewing-and-modifying-installed-github-apps)
- [GH7 — Release creation permission surface](https://docs.github.com/en/rest/releases/releases#create-a-release)
- [GH8 — Git reference operations and documented ref-update parameters](https://docs.github.com/en/rest/git/refs)

This document does not amend the accepted B1 handoff or any frozen protocol.
F1 remains DESIGN/CONFIGURATION UNINSTALLED / S1–S2 UNPROVEN / PROTOTYPE NO-GO.


