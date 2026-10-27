---
artifact_id: GENERIC-PROJECT-CONTROL-PROTOCOL-v1.0
artifact_type: portable_governance_protocol
status: FROZEN
version: "1.0"
review_source: protocols/PROJECT_CONTROL_PORTABILITY_REVIEW-v1.0.md
source_role: PROTOCOL_PORTABILITY
source_instance: PP-001
governing_control_revision_at_extraction: 6e42f0ced51d32b333730593466dc45159b39994
deployment_status: BASELINE_FOR_FUTURE_ADOPTION_NOT_AUTOMATICALLY_INSTALLED
---

# Generic Project Control Protocol — v1.0

## 0. Status, audience and normative terms

This is an **independently versioned, frozen, portable governance baseline** intended for projects with changeable specifications, implementations, tests, approval gates and/or operational handoffs. Adoption into any project, including a replacement of an existing project protocol, requires that project's authorized governance decision. Publication of this document alone does not authorize implementation, integration, migration or a bootstrap action.

**MUST / MUST NOT** are invariants; **SHOULD / RECOMMENDED** are defaults that can be replaced by documented controls of equivalent strength; **MAY** is explicitly allowed. An adapter may use Git/GitHub, another VCS or an equivalent immutable revisioned store. Where this document says **exact revision**, use a full immutable Git commit SHA for Git artifacts, or an equally immutable content/version identifier for other stores. Mutable labels/branch names are human locators, **never substitutes** for exact revisions.

**Authority vs truth:** authoritative evidence of what exists is not permission to perform a new action. A source of truth resolves observations; authorization grants a bounded action. A role title, a chat instruction, a validation status and a branch pointer must never be confused.

## 1. Control objective and traceability

Maintain auditable lineage:

`request / evidence → diagnosis → disposition / specification → authorized implementation → immutable candidate revision → execution evidence → independent acceptance decision → integration authorization → guarded integration → verified state`.

Projects MAY have research, design-only or infrastructure-only work without code; absent stages are explicitly `NOT APPLICABLE` or `NOT YET ESTABLISHED`, not fictitious tests or commits. Every claimed stage links its source decision, scope, evidence and exact revisions. Durable artifacts, not chat memory, own project history.

## 2. Parameterized project adapter

At adoption, document these project-specific settings, with no required folder or branch literal:

| Parameter | Required meaning |
|---|---|
| PROJECT_ID | Stable project identifier |
| CONTROL_STORE / CONTROL_HEAD | Durable authoritative governance location and its exact current revision |
| PRODUCT_STORE / PRODUCT_REFS | Code or deliverable authority, revision semantics; optionally N/A before first product |
| REVISION_MECHANISM | Immutable object IDs, integrity checks and conditional ref/record writes |
| OWNER / DELEGATIONS | Who may decide scope, exceptions, integration and control publication |
| CONTROL_COORDINATOR | Accountable Project Control function and current instance |
| ROLE_DIRECTORY / ASSIGNMENTS | Role definitions, permitted writes, independent decision gates and active assignees |
| STATE_LEDGER / REQUEST_LEDGER | Current state, explicit dispositions, dependencies and authorized baselines |
| ARTIFACT_INDEX / HISTORY | Frozen records, successor links, protocol versions and search/recovery method |
| EVIDENCE_POLICY | Which runtime/test layers count, recording/retention, digest and expiry policy |
| INTEGRATION_POLICY | Authorized targets, allowed mechanics, tests and exact before/after identity proof |
| BLOCKER_ROUTE | Recipient for each blocker class; default coordination authority |
| NAMING_AND_PATHS | Optional configured physical paths and human instance labels |

A project MUST make these semantics recoverable. One document can implement several of them. Implementations are free to choose physical names, including a single file, database records, issues, versioned docs or separate repositories. This baseline imposes no product runtime, schema or tooling command.

## 3. Sources of truth and the two-revision model

**CONTROL TRUTH** is the approved governance record at an exact CONTROL REVISION: adopted policy, owner decisions, request dispositions, frozen scope, design/acceptance contract, role assignment, routes and authorizations.

**PRODUCT/CODE TRUTH** is the actual committed product/deliverable state at an exact PRODUCT REVISION, including observed metadata and repository refs. For Git projects the full commit hash is a CODE SHA. Control revision may also be a Git SHA but is a *different identity*.

**CONVERSATION** is an intake/working/interface medium, not an independent durable authority. A user/Owner request can initiate an authoritative action; the resulting scope/policy exception must be recorded as an authenticated decision before dependent roles act on the change.

Whenever a claim or action depends on both contract and implementation, record **both** exact control and exact product revisions, along with human locators and relevant artifact paths. Also distinguish **baseline**, **candidate**, **execution harness**, **evidence bundle**, **validated candidate** and **integration target** revisions when materially different. An execution job's own repository revision is not necessarily the candidate tested.

An artifact must state whether its revision is a **historical checkpoint**, a **pinned input** or the **current mutable head**. If two records disagree, verify their timestamps/roles and exact authorized revisions instead of assuming a stale snapshot is current.

### Contradiction/precedence rule

1. **For existence of code or ref state:** independently verified product revision wins over conversation or outdated snapshot claims.
2. **For approved intent/acceptance contract:** controlling frozen version and its valid authorized successor prevail over informal summaries or envelopes.
3. **For authority:** authenticated Owner decisions establish reserved product/policy/integration permission; the control coordinator records and routes them under adopted protocol. A role may act only inside its delegation. A later authorized, explicitly linked replacement can supersede an earlier frozen requirement; neither elapsed time nor an unrecorded message silently changes it.
4. **On material conflict:** STOP the affected work; preserve evidence and exact refs; route a contradiction record to the competent authority. Do not choose a convenient version, invent an implicit exception, self-amend scope or silently reconcile.

A new Owner direction that would alter a frozen contract is a *change request* until authenticated, dispositioned and versioned as an approved successor. Non-conflicting administrative routes may refine logistics but cannot modify frozen product criteria.

## 4. Authority and separation of duties

All projects MUST allocate the following **decision responsibilities**, although the physical team, titles and chat count may differ:

| Authority/function | Can decide/do | Cannot silently do |
|---|---|---|
| Owner or named policy principal | Reserve scope/policy decisions, project milestones, integration permission, exceptions and delegation | Treat an unrecorded claim as a retroactive modification to a frozen artifact |
| Control coordinator | Maintain central state, register decisions and instances, classify/route blockers, authorize delegated work inside recorded policy, close work with evidence | Invent owner scope decisions, grant itself unspecified integration/QA permission, erase concurrent history |
| Scope/specification authority | Disposition requests and freeze WHAT/architecture constraints, ambiguity resolution and revisit conditions under owner policy | Reinterpret deferrals as completed, amend the approved scope by convenience |
| Design/acceptance-contract authority | Freeze implementable measurable acceptance rules, test coverage and evidence requirements | Silently relax criteria after development |
| Development/authoring function | Implement authorized scope on verified baseline; publish candidate and evidence/limitations | Issue independent QA PASS, mutate protected frozen artifacts, self-integrate |
| Execution/environment function | Prove readiness and/or produce reproducible operational evidence at exact candidate revision | Decide official product acceptance from an environment smoke, silently alter candidate |
| Independent QA/acceptance authority | Evaluate exact candidate, frozen criteria, evidence quality/sufficiency and official PASS/PARTIAL/FAIL/REGRESSION/INCONCLUSIVE or equivalent policy result | Integrate by verdict alone; amend scope or fabricate omitted layers |
| Integration administrator/function | Reverify authorization, candidate QA identity and target; perform only authorized guarded integration; publish before/after report | Add functional code, integrate an unvalidated candidate or move other targets |

**Independence means separate, auditable decision and authorization gates, not necessarily different human bodies.** If resource-constrained projects combine personnel, their adoption policy MUST explicitly declare allowed hat-sharing/conflicts, preserve distinct decisions and prohibit an implementer from unilaterally declaring its own acceptance plus integration without the designated external authorization. A project MAY require stronger personnel separation.

**Precedence is by domain and recorded authority, not by instance number or message recency.** Owner decisions govern reserved rights; QA owns acceptance sufficiency under frozen criteria; Control routes and freezes the accountable decisions; integrator owns only the mechanical authorized ref operation. Policy exceptions require explicit issuing authority, scope, rationale, expiry if applicable, replacement effect and immutable record.

## 5. Request ledger and no-disappearing-request rule

Every acknowledged request or material requirement MUST have a durable unique ID and one explicit disposition: e.g. `PROPOSED`, `ACKNOWLEDGED`, `IN_SCOPE`, `IMPLEMENTING`, `IMPLEMENTED`, `VALIDATED`, `INTEGRATED`, `DEFERRED`, `REJECTED`, `SUPERSEDED`, `BLOCKED`, or an equivalent declared finite state set.

Record responsible decision authority, source request, affected scope, evidence, dependencies, destination and next action. `DEFERRED` is **unresolved**, not PASS or silently excluded: specify why, who decided, what condition reopens it and which artifact carries it. Progression between states requires evidence at the correct gate; a reported plan is not executed code, a Development-ready candidate is not QA PASS, and QA PASS is not integration.

## 6. Artifact lifecycle and frozen contract precedence

Minimum artifact lifecycle: **DRAFT/WORKING → REVIEWED/APPROVED → FROZEN** or an explicit **BLOCKED/REJECTED** disposition. Frozen content is immutable, including prior blockers, QA reports, scope freezes, authorities and historical validation statements.

A correction or continuation MUST be a **new immutable artifact** or new explicitly versioned edition with:
- original artifact identity/revision and status;
- reason for correction/continuation, effective scope and competent authorizer;
- exact successor artifact/revision, if known;
- clear supersedes/continues relationship;
- non-retroactive explanation of which past claims remain valid;
- unchanged historical predecessor preserved.

Never overwrite, delete, or rewrite frozen history to make a later run look successful. Central mutable indexes MAY update after authorized state reconciliation, but MUST preserve immutable history and include the new referencing control revision. Freeze status is an artifact content rule, not a guarantee the physical branch head never advances: append-only control commits are permitted if the old frozen file's bytes and history remain intact.

Minimum provenance on a material artifact: unique ID/type/status, protocol version, author role/instance, input CONTROL REVISION, relevant product baseline/candidate revision, scope/contract references, observed evidence vs inference, decision/limitations, output/return recipient and link to predecessor. External evidence may live elsewhere if its immutable ID, digest and retrieval strategy are recorded.

## 7. Transfer envelopes and contradiction handling

A transfer envelope is a **routing and intake notice**, not a specification amendment, authority grant or autonomous source of truth. Recommended fields: source/target role+instance, exact control revision, primary frozen artifact, baseline/candidate revision if relevant, task/action, expected output, dependencies, blocker route and explicit restrictions.

Receiver MUST:
1. authenticate the recorded role/route and fetch the pinned exact control revision;
2. read the primary referenced contract and relevant authority/role artifacts fully;
3. verify live product refs when needed and distinguish pinned state from current mutable head;
4. compare envelope wording against frozen criteria and effective authorized successors;
5. acknowledge receipt before material action;
6. STOP on a material mismatch, missing authority, missing artifact or unsupported evidence claim.

The receiver MUST NOT silently privilege convenience, oral/chat wording or later routing summary over a referenced frozen contract. A conflict record states both precise sources, the actual observed state, proposed disposition and which work remains unexecuted. Only the proper authority publishes a separate corrected disposition/route or new frozen contract. Continue with same instance when the assignment remains active and control has resolved the mismatch; preserve the original report.

A receiver MAY use a temporary immutable offline attachment during transport failure if explicitly labeled `CONTROL TRANSPORT FALLBACK`, with integrity and later reconciliation; it grants no new substantive authority.

## 8. Exact candidate custody and reproducibility

Prior to writing or validating, independently verify source refs, exact baseline revision, contract control revision and allowed scope. For Git, establish commit ancestry and clean working tree before/after execution; protect unapproved paths. An unverified branch name or local file copy is insufficient.

A validation claim MUST bind:
- exact candidate revision and source repository;
- frozen acceptance/control revision and applicable requirement IDs;
- environment/runtime/tools (including any necessary lockfile/toolchain versions);
- test commands/steps, fixture and observed result;
- evidence location, digest/integrity where feasible, capture time and known omissions;
- independent acceptance authority and its verdict if one is claimed.

The **accepted candidate** MUST be exactly the product revision actually exercised by the final required successful validation set. A subsequent product commit or material artifact mutation invalidates automatic carryover of that acceptance: rerun affected or complete gates **as the approved validation policy requires**, and issue a new QA decision on the new exact revision. Where a frozen contract explicitly demands a full rerun, no partial shortcut is allowed. A report-only control publication does not itself change product SHA.

The authoring/publication plane and execution/evidence plane **MAY be different**. Custody then MUST prove: exact remote object identity; actual runner checkout of the candidate (not just harness HEAD); clean state; baseline ancestry; fixture isolation; runtime and logs; final unchanged candidate identity; durable results. Both harness and candidate revisions are separately recorded. Merely invoking a CI job, viewing a build log or obtaining service HTTP 200 never proves full product acceptance.

## 9. Evidence taxonomy; qualified and synthetic inputs

At least distinguish:
1. **Unit/deterministic evidence:** isolated logic or assertions, with asserted scope.
2. **UI-contract evidence:** actual candidate UI behavior for specified input at a declared boundary, potentially injected.
3. **Integration evidence:** multiple real modules/services exercised together, identifying exactly which boundaries remain stubbed.
4. **Real E2E evidence:** real required layers connected in the claimed production-equivalent path, with no undisclosed synthetic substitution.
5. **Environment readiness evidence:** feasibility of execution/capture substrate, not product acceptance.
6. **Missing/inconclusive evidence:** not executed, inaccessible, corrupt, nondeterministic or insufficiently attributable.

Synthetic, mocked or boundary-controlled evidence MAY support an acceptance item only if the frozen requirement is at that layer and **independent QA explicitly approves its sufficiency**. It MUST disclose the injected input/delta, insertion boundary, untouched production components, code path exercised, observed outputs, omitted layers and limits. It MUST NOT be labeled real E2E nor be used to claim that an upstream production service naturally generates the injected state.

Where service behavior is out of scope and a hypothetical UI state is not naturally reachable, a narrowly controlled UI-boundary probe can be legitimate; this is **permission to assess**, not blanket evidence acceptance. If the frozen criterion mandates natural E2E, only the authorized scope/contract authority can change that criterion via a successor; Development cannot downgrade it. QA owns the official evidence sufficiency determination even if Development produced the logs, fixtures, screenshots and proposed qualifications.

Preserve raw results, failed/superseded attempts, hashes, expiry/retention metadata and limitations where required. Do not aggregate heterogeneous assertions/tests as interchangeable counts or credit an earlier readiness run as later candidate acceptance.

## 10. Blocker taxonomy and disposition

Any blocked role MUST publish or return an auditable record with observed facts, not-run work, exact revisions, affected authority, diagnosis confidence and proposed next route. Assign exactly one **primary blocker class** for triage, with linked secondary conditions where appropriate:

| Primary class | Test for classification | Decision route |
|---|---|---|
| PRODUCT / IMPLEMENTATION | Candidate violates frozen product contract or technical defect is demonstrated | Development/design-QA correction; scope authority if repair needs expansion |
| SPECIFICATION / CONTROL | Contradictory/ambiguous frozen requirements, routing text, commands or central state | Control coordinator + competent contract/owner authority |
| ENVIRONMENT / SUBSTRATE | Required real checkout, install, runtime, transport, browser or evidence capture cannot be proven | Environment readiness / operational owner; do not infer product defect |
| EVIDENCE / PROVENANCE | Candidate may run, but test coverage, artifact integrity, reproducibility, retrieval or layer sufficiency is missing | Evidence producer; independent QA decides sufficiency |
| AUTHORITY MISMATCH | Missing, expired, conflicting or unauthorized role/owner/integration delegation | Control coordinator / Owner as applicable; freeze affected action |

One incident may have multiple observations; distinguish the **observed failure** from the **hypothesized cause**. If evidence cannot distinguish defect vs substrate failure, mark diagnosis uncertain and do not assert either as confirmed.

Project Control or the equivalent coordinator records **BLOCKED**, preserved refs, recovery dependency and next owner. A blocker is neither terminal closure of the project nor automatic authority to start a new run, expand product scope or discard previous history.

## 11. Environment readiness versus product acceptance

Environment readiness proves a usable substrate for an exact revision and its requested evidence class: checkout, dependency/toolchain availability, runtime connectivity, browser if required, capture mechanism, test fixture isolation, artifact durability and clean custody. Its outcomes may be `READY`/`BLOCKED` or declared equivalents.

It grants **no** implementation credit, acceptance case PASS, scope change or integration permission. Product behavior acceptance requires separate evidence at the final exact candidate and a separate official QA decision. Historical readiness on one branch, host, toolchain or date is not automatically transferable to another; identify changed dependencies and rerun necessary readiness.

## 12. Instance lifecycle and role turnover

**Assignment identity**, **role**, **instance** and **conversation** are distinct concepts. An instance is a durable accountability record, not merely a chat tab.

**Reuse existing instance** when same role and bounded mission continue, authority remains valid, context is recoverable and a blocker/correction is resolved. A new route or successor report alone does not compel a new instance.

**New successor instance** SHOULD be assigned when prior assignment has completed/closed, the role/personnel boundary changes, the executor must switch materially and independent ownership is useful, prior role context cannot reliably continue, or the conversation expires and a fresh accountable context is required. Record why, predecessor, exact start state, uncompleted work, inherited/not-inherited evidence and authority. A new instance does **not** invent a new RUN, candidate or scope.

**Rollover** is conversation continuity caused by context limits or access loss; it need not reopen project work. Record predecessor/successor, role, control revision, current requests, exact product refs, unfinished duties, blockers and current authority. Never assume chats communicate implicitly or that an old chat's recollection overrides repository state.

A completed blocker report remains frozen when the **same** instance resumes; its successor report must identify the earlier blocker, the corrective authority and the results actually obtained after resumption. Never relabel an earlier blocked report as PASS.

Instance names, prefixes and numbering are optional presentation conventions. Neither increasing sequence nor role code confers substantive authority.

## 13. Control publication concurrency

A mutable authoritative control head MUST be protected against lost updates:
1. obtain current exact head and inspect changes since the pinned intake revision;
2. verify the planned write is authorized and only touches allowed artifacts;
3. create a new additive/versioned artifact against current head;
4. conditionally advance the head using its **expected** previous revision (compare-and-swap / expected-head lease); for ordinary work, reject non-fast-forward destructive updates;
5. after success, verify committed paths, resulting head, preserved predecessor ancestry and unchanged protected refs.

If the head changes concurrently, **do not** retry blindly, overwrite an intervening document or reset it. Re-fetch, assess whether intervening commits alter mission authority/contract, and either re-author a non-conflicting additive commit atop the latest head under the original authorization, or STOP for coordinator reconciliation when semantics conflict. Keep a record of which control revision was consumed and which revision was used as publication parent; they can differ if compatible intervening publications are preserved.

Never silently drop concurrent control history; use explicit owner/controller disposition for conflicting writes. Central ledgers and registries are coordinator-controlled unless delegated. Publication of a role's new report does not authorize rewriting the project state or unrelated frozen files.

## 14. QA and integration gates

Minimum separated gates:

**A. Candidate delivery:** Development returns exact revision, scope-delta inventory, checks/tests, evidence and qualifications. Status such as `READY FOR EXTERNAL QA` is *not* QA PASS.

**B. Independent acceptance:** designated QA reads frozen contract, reviews exact candidate diff, test/evidence integrity, gaps and limitations, and issues an official decision on that **same exact revision**. Partial/qualified acceptance is recorded precisely. Unless project policy explicitly authorizes otherwise, only official PASS satisfying the frozen release gate can proceed.

**C. Explicit integration authorization:** Owner or approved delegate authorizes exact validated source, target, required before-revision, method, boundaries and allowed writes. QA PASS alone never authorizes or moves refs. The implementation author must not self-integrate absent a separately recorded explicit delegation compliant with the project's separation policy.

**D. Independent integration preflight:** integrator fetches current authoritative control revision, Owner/delegate approval, QA report, source candidate and target; verifies exact identity, unchanged qualification, ancestry/allowed method and no incompatible intervening history. Mismatch → STOP, return to coordinator/QA/Owner as appropriate.

**E. Guarded operation:** update only the authorized target with a conditional expected-before revision. Prefer non-force fast-forward when possible. Rebase/reset/force/squash/cherry-pick/merge mechanics that create new product identity are **not implicit substitutes**: they need project-specific authorization, equivalence/extra-delta proof and any resulting-build revalidation required by the acceptance contract. Never assert a different integrated SHA is the exact validated candidate without proof.

**F. Post-operation:** independently verify target-after, untouched protected refs, candidate provenance, actual method and report SHA. Integration administrator publishes a separate frozen report; control coordinator independently verifies closure and then updates central state. No unrelated roadmap, new phase or bootstrap process starts automatically on successful integration.

Failure at any gate preserves the source and target as observed and returns an explicit blocker; never silently resolve with force or unapproved code changes.

## 15. Recovery from lost chat or inaccessible state

Successor/recovery workflow:
1. locate project ID and durable CONTROL STORE; resolve exact current governing revision and protocol version;
2. read authoritative project state, current request ledger, role/authority directory and instance/assignment record;
3. inspect predecessor instance and current route, input contract and linked blocker/successor history;
4. verify real product refs and the last validated candidate/integration evidence independently;
5. identify which files are historical pinned checkpoints versus current mutable state; handle mismatches explicitly;
6. report completed, pending, deferred and blocked scope; identify next authority and permitted action;
7. publish a successor instance/route if authorized; do not inherit acceptance merely through conversation succession.

If control transport is unavailable, use an explicitly labeled immutable fallback only for permitted safe analysis. No product mutation, acceptance declaration or ref movement predicated on unverified control authority. When access is restored, reconcile fallback provenance via coordinator without erasing prior history.

## 16. Adoption constraints and minimum initial state

A new project MUST establish, at minimum, a durable identified control authority and revision mechanism; Owner/delegation and control-coordinator roles; a current state/request ledger (even if empty); an adopted versioned protocol and artifact lifecycle; role/instance assignments; source-of-truth/contradiction rules; a route for blocked requests; explicit integration/acceptance decision responsibilities; an evidence provenance policy; and a conditional update mechanism.

Its first product baseline MAY be `NOT ESTABLISHED`; integration target, validated candidate and execution environment MAY be `N/A`. Do not fabricate historical commits or initial RUNs. Adoption MUST explicitly record the effective control revision and which project-specific adapter choices implement the semantic requirements.

**Recommended defaults, not mandates:** a Git repository, separate governance namespace/branch, a project-state Markdown document, folders for roles/routing/handoffs/control/validations/integrations, numbered work/instance IDs, exact-SHA transfer envelopes, immutable SHA-256 manifests, isolated runner, and fast-forward/expected-head integration.

An adopter MUST establish its own frozen product-specific scope, validation commands, safety boundaries and release criteria before authorizing work. This generic governance protocol deliberately specifies none of those values.

## 17. Versioning, deviations and close-out

This v1.0 file is **FROZEN**. Correcting it requires a separately authorized, explicitly linked successor version; do not edit its historical bytes. Projects may define stricter local controls. A local exception that weakens an invariant is not a silent variant: require Owner/policy authority, explicit rationale/risk, affected rule, scope, duration, compensation and auditable immutable record, with independent QA/integration duties still bound by applicable authorization.

Adoption, implementation work, integration and a Bootstrap SIP are **separate** decisions. This baseline is ready to inform a later *minimal bootstrap SIP* once Project Control authorizes that distinct activity. No SIP is created by this document.

**Portable protocol baseline disposition: FROZEN v1.0.**
