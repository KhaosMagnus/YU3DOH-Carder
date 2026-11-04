# PP-002 — A1-P1 First Bounded Synthetic Rehearsal Design Specification

assignment: A1-P1-DES-001
author: PROTOCOL_PORTABILITY / PP-002
return_to: PROJECT_CONTROL / PC-003
repository: KhaosMagnus/YU3DOH-Carder
control_branch: meta/project-control
activation_CONTROL: e4630fc745c67b8dad636ec3cff4e362a3546109
activation_parent: 1b5b39eb1f66b39ee513eb52e26e8c8b25898808
activation_tree: f4409c3e8b09a054db65a08569878401b18491ef
document_status: PROPOSED DESIGN / READY FOR PC-003 DOCUMENTARY REVIEW
execution_status: NOT AUTHORIZED / NOT PERFORMED
technical_disposition: NO-GO / PREREQUISITES UNRESOLVED
recorded_at_UTC: 2026-11-04T23:08:55.349Z
only_authorized_output: handoffs/PP-002_Q02_A1_P1_SYNTHETIC_REHEARSAL_DESIGN_SPECIFICATION.md

## 1. Purpose and recommendation

**PROPOSED DESIGN:** one supervised, bounded, entirely synthetic rehearsal of source-provenance admission, deterministic Q01 evaluation and data-only result review. The proposed question is: can an independently approved caller preserve exact supplied source identity, refuse missing or untrusted provenance, and produce a reviewable sealed result without giving E any network, credential or publication capability?

This specifies a candidate for later Owner choice. It creates no fixture, implementation, operating procedure, test result, host assignment or security approval. The Owner approved documentary design, not this exact trial contract. [S01–S06]

Retain the proposal's two case families: **N, nominal known synthetic source**, and **R, rejection**. R has three necessary variants: missing membership evidence (M), contradictory returned ref (U), and untrusted source-index root (T). Four logical slots are the smallest proposed set that distinguishes absence, contradiction and a completely self-consistent but untrusted input. These failure classes have different safe outcomes; one negative would not establish all three.

One future batch would evaluate N/M/U/T in each of two fresh, predeclared replay roots. That is eight planned admission slots, six Q01 evaluations and two pre-Q01 blocks. These fixed replays test determinism; they are not retries after failure. No external workflow or GitHub source retrieval belongs to the rehearsal. A failed slot, unsafe interruption or missing prerequisite does not authorize another batch/root.

**Present recommendation:** accept this as a paper candidate for PC-003 review; defer implementation. The most consequential later decisions are the accepted trial scope, code/evidence location and independently qualified E/V/P/security chain. The current documentation-only preference precludes the original C2 code-on-control path without a new explicit exception. No alternative is selected implicitly.

## 2. Threat model and claim boundary

| Threat / failure | Proposed observable oracle | Limit |
|---|---|---|
| Source is absent | M preserves UNKNOWN and prevents the nominal decision sink | No fallback to memory, another ref, NAS or live lookup |
| Returned ref is wrong although content is identical | U retains both identities and rejects the mismatch | Equal blob/content does not make ref history equivalent |
| Producer supplies a forged, internally consistent catalog and receipts | T blocks admission without a separately trusted FixtureSeal | Q01 hashes alone cannot authenticate a producer |
| Planned metadata or report assembly is represented as observation | Separate intent, fixture-simulated clocks and actual custody receipts | Synthetic clocks cannot prove real timing |
| Clean report hides extra files, executable material or changed source | Whole-bundle V inventory and independent pin check | Matching one output digest is insufficient |
| Unchecked result is consumed or substituted after approval | Exact data/purpose/authority binding and connected nominal sink control | This is a proposed caller contract, not an installed enforcement layer |
| Interrupted batch is blindly repeated | Recover original sealed identity and disposition partial effects first | No crash, quota, real lost-ACK or session-rollover claim is tested |

Q01 validates supplied request/receipt/content/membership relationships. Its input catalog is a trust boundary; a producer who controls both receipts and catalog can forge a consistent story. The accepted Q01 candidate has no network client or publisher and does not establish trusted capture or universal caller enforcement. [S19–S22]

The trial can support **synthetic logical behavior and bounded custody accounting** after future authorized execution. It cannot itself establish real GitHub source authenticity, separate acting principals, host isolation, credential absence, original YU3DOH S2, issuer/publisher trust, atomic server CAS, production recovery, global exactly-once or completion of S1–S6. Content, authority, execution state, cleanup and independent acceptance remain separate axes. [S09–S13, S18]

## 3. Proposed synthetic input contract

All names, IDs, clocks and remote-shaped locators in this section are **synthetic test data**, not existing repositories, commits, receipts or authorized endpoints. No locator is to be fetched. No real Owner/device/account identity, message, token, signed URL, key, admin setting, current product data or live GitHub receipt enters the fixture corpus.

### 3.1 Exact content and identity semantics

| Symbol / field | Proposed frozen meaning |
|---|---|
| Repository label R | `P1-SYNTHETIC/NO-REMOTE`; parser-shaped fixture label only, no existence assertion |
| Selected immutable ref A | 40 lowercase `a` characters; synthetic identifier |
| Wrong returned ref B | 40 lowercase `b` characters; synthetic identifier, distinct from A |
| Tree identity T | 40 lowercase `c` characters; synthetic retained-tree identity |
| Simulated authority C | 40 lowercase `d` characters; fixture authority only, never actual execution permission |
| Case path | `fixtures/record.txt`, exact case and spelling |
| Sole content record | Three bytes, hexadecimal `61 62 63` (ASCII abc), no newline/BOM |
| Expected byte count | 3 |
| Expected SHA-256 | `ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad`; proposed known byte oracle, not a measured result of this assignment |
| Expected Git blob Gabc | SHA-1 of the exact byte sequence ASCII `blob 3`, one NUL byte, then `61 62 63`; a deterministic definition, not a claim of a newly observed Git object |
| Nominal URL data | GitHub blob-URL shape with repository R, ref A and the exact case path; literal fixture data, never a transport request |
| U URL data | Same shape, R and path, with returned ref B while the request remains A |
| Membership data | Complete synthetic retained-tree shape with requested repository/ref, `truncated=false`, tree SHA T and exactly one blob entry at the case path, SHA Gabc |
| Logical correlation | One unique retrieval/logical ID per case, consistent in its request and response; replay root is a separate namespace |
| Authority used for actual admission | A later real execution route/CONTROL, separately frozen by PC; UNKNOWN today, not simulated C and not this design grant |

Gabc is fully specified by bytes and algorithm. All numeric source/catalog/result pins, including its concrete value, must be independently materialized, checked and frozen before any future execution under S3. That materialization is not performed here. The expected oracle may not be generated from E's observed output. If independently approved expected bytes/pins are missing, admission is BLOCK; the caller must not fill them from a matching output. Symbols in this design are not valid unresolved values in an executable bundle.

### 3.2 Roles and fixture records

The proposed corpus contains the one content record plus small synthetic authority, policy/seal reference, request, nominal/U response, A/B membership, clock, catalog/bundle and expected-oracle records. Each materialized case has its own consistent correlation IDs; shared content is deduplicated by identity, not confused across cases.

| Data class | Required semantics |
|---|---|
| Independent FixtureSeal | Approved fixture version, all exact file names/modes/counts/bytes/digests, allowed root identity, code/caller pins and expected-oracle pin. A separately qualified reviewer/custody channel establishes its trust; a seal supplied only by E is insufficient. |
| Request | Exact R/A/path/URL and correlation ID. Q01 claims point to `/arguments/repository_full_name`, `/arguments/ref`, `/arguments/path`, `/arguments/url`. |
| Response | Exact own R/ref/path/URL/blob, correlation and request-source binding; no request fields inferred from response. |
| Membership | Requested immutable commit is A for N, B for U; complete response with T, case path and Gabc. This is a retained synthetic mapping, not a real Merkle proof. |
| Source catalog | Exact local data paths, byte counts, SHA-256, Git blob SHA, role, origin and dependency links before use. No missing pin, unresolved path, duplicate key or symlink is accepted. |
| Q01 bundle | Frozen `Q01-bundle-v1` shape; both fixed claim profiles declared as required by Q01; one retrieval per case; no locator reconciliation; no real publication inventory. Evaluation profile proposed below. |
| Expected oracle | Independently approved N/M/U/T expectations and allowed optional UNKNOWNs; distinct from reports produced by E. |
| Actual custody records | Real approved authority, fixture/code pins, actor/closer, handoff identities and clock roles; never inserted into synthetic receipts as if they were source history. |

For deterministic materialization, case bundle IDs are `P1-N-v0`, `P1-M-v0`, `P1-U-v0` and `P1-T-v0`; retrieval/logical IDs are `P1-N-READ`, `P1-M-READ`, `P1-U-READ` and `P1-T-READ`. These labels, catalog IDs, relative source paths and bundle `allowed_output_root=out` are identical across the two replays. Physical root prefixes and unique actual batch/replay custody IDs are supplied separately and never inserted into semantic Q01 identity fields. Q01 `intended_publication` and `locator_reconciliations` are empty arrays. Actual replay receipts distinguish the two physical executions without changing their semantic fixtures.

Every synthetic claim and source is labeled `SYNTHETIC_FIXTURE` consistently. The collector's production-shaped origin values must not be used to disguise manufactured fixtures as captured external receipts. Source roles remain REQUEST_ENVELOPE, CONNECTOR_RECEIPT, TREE_MEMBERSHIP, CONTENT, AUTHORITY or LOCAL_RECORD as applicable. No PLAN becomes observed source evidence. This is compatible with the accepted guard's synthetic-origin handling; no original validator is changed. [S20–S22]

### 3.3 Clocks and UNKNOWN

Fixture request time is proposed as `2000-01-01T00:00:00Z`; receipt time as `2000-01-01T00:00:01Z`, same explicitly synthetic clock domain. Separate LOCAL_RECORD fields may contain fixed simulated recorded/verified times at seconds 2/3. These values are fixture constants, not real events or elapsed performance.

`responded_at` and source `event_at` are explicitly UNKNOWN with reasons in all cases unless separately specified in a later approved fixture revision. No alias is silently invented. Missing Q01 claims retain its exact UNKNOWN representation: value/source_id/pointer/capture_origin all UNKNOWN plus reason. Actual invocation, receipt, event, assembly and verification clocks have distinct fields and sources; missing actual source timing stays UNKNOWN. Cross-host clock synchronization is not assumed.

### 3.4 Proposed ceilings — not measurements or Owner declarations

| Dimension | Proposed ceiling / boundary |
|---|---|
| Semantic data | One 3-byte content record; four case slots; no personal/product data |
| Fixture input | At most 24 regular UTF-8 data files, 96 KiB total, 16 KiB per file |
| Code admitted later | Only exact pinned Q01 modules and at most one separately approved narrow caller/admission module; total source at most 128 KiB; no plugin, generated executable, dependency download or hidden helper |
| Runtime | Qualified pre-existing offline runtime; exact identity/inventory UNKNOWN until later S3; no installation under P1-DES |
| Batch budget | Two fixed replay roots; N/M/U/T once per root; no automatic retries |
| Compute | At most 120 seconds total wall time, 60 CPU seconds and 512 MiB peak memory for the complete future batch |
| Output | At most 16 regular UTF-8 files / 1 MiB total, 256 KiB per file, excluding separately inventoried immutable input/code custody copies |
| Temporary workspace | At most 16 MiB beyond approved read-only runtime/source/input; no unbounded logs or archives |
| Supervised rehearsal | At most 45 minutes for the already-qualified E/V logical/custody exercise; excludes security remediation, independent full QA and later PC publication |
| External effects | Zero network/connector calls from E; zero real GitHub publication callbacks; zero workflow/retry/replacement operations |

These are proposed acceptance ceilings, not performance forecasts. Trusted enforcement/measurement must be part of future qualification; Python hooks or a self-reported zero counter alone do not prove containment. If a later exact implementation cannot fit the limits, return a revised design for approval, not silently enlarge them. These caps do not allocate Erebo/Alucard, reserve time or bound the total unresolved S1/S2 engineering cost.

## 4. Nominal and rejection oracles

The proposed Q01 profile is `EXACT_REQUEST_HISTORY` on the **synthetic** request/receipt history. Both fixed profiles remain listed in its input schema, but this minimal rehearsal evaluates one profile; it is not a new full F01–F31 run. A synthetic PASS under this profile is not authentic external issuance history.

| Slot | Exact proposed delta | Expected Q01 / admission result | Expected data-only decision sink |
|---|---|---|---|
| N — nominal | Trusted sealed input; request and response select R/A/path; content Gabc; full A membership; complete required simulated request/receipt clocks | Q01 PASS; verified claim refers to R/A/path/Gabc and preserves synthetic origin; no invariant violations | Exactly 1 invocation for this slot |
| M — missing source | Same coherent content/request/response as N, but no membership source supplied or cataloged; `membership_source_id=UNKNOWN`; missing source is intentional | Q01 UNKNOWN, with material `MEMBERSHIP_UNKNOWN`; not reusable as verified provenance | 0 |
| U — wrong-ref source | Request remains A; response URL/ref and complete membership use B; bytes/Gabc identical; independently pinned declared identity retains A/Gabc | Q01 FAIL with `REF_MISMATCH_IDENTICAL_BLOB`; exact requested and returned refs retained | 0 |
| T — untrusted root | Internally coherent N-shaped data but catalog/seal origin is not bound to the independently approved FixtureSeal | Caller admission BLOCK before Q01; Q01 NOT_RUN; trust evidence UNKNOWN/UNTRUSTED in the outer record | 0 |

M intentionally models absence without creating an unreadable catalog entry. A source entry pointing to a nonexistent file would instead be Q01 invalid input; that is not relabeled UNKNOWN. U's matching blob is not a reconciliation or authority to substitute B. T is essential because the frozen Q01 guard can accept internally consistent synthetic data; it has no facility to authenticate a producer's self-supplied trust root.

The decision sink is a proposed counted, in-memory **fake content consumer**, not a publisher, source fetcher, operation checker or actual external effect. Its connected N positive control avoids a vacuous claim that all cases are blocked. Across two roots the expected total is 2 fake sink invocations, 0 for rejected/blocked cases, and 0 real publication calls.

The accepted `use_if_approved` API requires a bound state-check result even for a content-only caller. P1 must **not manufacture a state_check=PASS or alter that frozen API**. The proposed narrow future caller uses the unchanged read-only Q01 validation result and a separately reviewed CONTENT_EVIDENCE admission policy, with operation-state checker **N/A because no current external-operation claim is made**. That caller does not exist by this document. Its exact code/config, binding checks and independent acceptance need later authorization; absent them, execution remains BLOCK. [S10, S20–S22]

Content admission must bind the exact approved FixtureSeal, input/code/caller/result bytes, case/purpose, actual authority and closer, namespace, expected oracle and permitted fake sink. Any change invalidates it. An approved slot cannot admit another path, case, caller, authority or new dependency.

Negative Q01 FAIL/UNKNOWN results are expected successful observations of rejection logic. They are not proof that the parent batch process failed, nor a reason to retry it. The current assignment has executed none of these slots.

## 5. Expected outputs, determinism and custody evidence

### Semantic result schema — documentary field contract

| Record / fields | Expected meaning |
|---|---|
| Per-case Q01 result | Preserve frozen `Q01-result-v1` output unchanged: profile, bundle digest, verdict, verified/source-bound/unknown claims, violations, permitted/blocked uses, origins and source pointers |
| Per-case outer decision | Case ID, fixture version, actual authority pin, trusted seal reference, input/code/result pins, admission status, safe content decision, reason, fake sink delta, Q01 invoked flag; T has no fabricated Q01 result |
| Aggregate semantic report | Proposed `P1-semantic-v0` label; fixed scope SYNTHETIC_ONLY; ordered N/M/U/T rows, expected/actual match, mandatory UNKNOWNs, counter totals, logical result, nonclaims |
| Output inventory | Every payload path, mode, exact byte count, SHA-256, Git blob SHA, record kind, dependencies and source-to-output mapping; distinguish original bytes from projections |
| Custody observations | Actual actor/closer, authority, input/output seal IDs, source/receipt clock roles, E completion claim, independent V observations, discrepancies, retention/cleanup disposition |
| V review receipt | Exact candidate/input/output/caller pins and independently derived oracles, what was checked, trust limitations, acceptance axis and accountable reviewer |
| Later P receipt | Only if separately authorized: exact repository/ref/path/tree/parent/commit and actual issuer/CAS/ack/readback provenance; never anticipated in the batch result |

Each known claim cites a source ID and pointer, or a named deterministic transform over pinned bytes. Unknown facts identify what is missing and its effect on acceptance. The report distinguishes an inaccessible source, absent source, contradictory identity and verified content; no unsupported success or cleanup claim is promoted from a negative test result.

Canonical semantic JSON is proposed to use the frozen Q01 convention: UTF-8, sorted keys, no insignificant whitespace, no nonfinite numbers, one terminal newline. Order case records N/M/U/T and fixed ID-keyed collections; exclude actual runtime clocks/host metadata from semantic equality, while preserving those in separately sealed custody receipts. Unknowns and synthetic fixed clocks remain semantic. Every administrative file is still inventoried; exclusion from a digest cycle is not exclusion from review.

Independent replay compares exact semantic bytes for each case and the aggregate across the two fixed roots, not just a summary PASS. Manifest rows for the same payloads must agree; distinct replay labels and observed clocks live outside the equal semantic payload. The inventory excludes its own digest entry; a later custody seal binds the inventory bytes, avoiding self-reference. Nothing in this design claims those bytes or their digests have already been produced.

All safe outputs, including M/U/T rejection evidence, are retained as AUDIT_ONLY unless a later authority grants a narrower use. A rejected fixture cannot justify an affected stateful decision or publication. A later authorized audit publication is distinct from the fake decision-sink counter and is not part of this rehearsal's effects.

## 6. Future acceptance, rejection and STOP contract

Report three axes: **logical behavior**, **custody/security evidence for this bounded run**, and **rehearsal acceptance**. Do not collapse them into an unrestricted PASS.

| Future disposition | Objective proposed criterion |
|---|---|
| Logical PASS | N/M/U/T exactly match their oracles; two-root semantic equality; exact code/input pins; fake sink total 2 and rejected sink total 0; no unexpected source substitution |
| Logical FAIL | Wrong verdict/identity, required UNKNOWN filled, N sink disconnected, rejected sink invoked, changed semantic outputs or unexplained extra data/effect |
| Custody INCONCLUSIVE | Required independent witness/receipt, input identity, full output inventory, measured counter or applicable qualification record missing; E self-report/digest alone is insufficient |
| STOP | Authority/prerequisite absent before admission; unapproved source location/actor; unexpected credential/network access, non-synthetic data, unsafe file, resource breach, loss of effect identity, unbounded cleanup or protected-ref drift |
| Rehearsal PASS, bounded | Logical PASS plus complete independently checked custody and closure, with all prerequisite records valid for the actual substrate and exact authorized trial; means only acceptance of that narrow run |
| Rehearsal FAIL | A material logic or safety violation is established; retain original evidence and contain only under the later authority |
| Rehearsal INCONCLUSIVE | Available outputs do not establish all required facts; no acceptance by inference |
| Rehearsal STOP | Precondition or safety stop prevents continuation; not a retry grant |

A deliberately missing source in M is an expected input, not a stop of the whole safe batch: its result is retained and consumed only by the oracle evaluator. An unexpectedly missing actual trusted seal/qualification record is different and stops admission. Within an admitted batch, a logic discrepancy blocks affected use and any new unplanned work; read-only evidence review may continue if safe. A security/custody breach stops the affected execution under its future containment authority.

Absence of a trusted witness cannot be repaired by a synthetic PASS. Even a bounded rehearsal PASS neither closes original S2 nor substitutes for full S6. No present results are assigned in this specification.

## 7. E/V/P actors and high-level custody boundaries

| Actor / zone | Proposed responsibility | Present evidence / denied inference |
|---|---|---|
| PC-003 / Owner | Later freeze objective, actual authority, source location, named roles/closers and explicit effect/resource limits | This design route alone grants no execution or infrastructure |
| E | Consume only approved synthetic/source inputs in a separately qualified physically disconnected environment; emit bounded local data and honest receipts | Erebo is Owner-proposed only; no host assessment, installation or allocation |
| Owner custodian | Potentially supervise authorized custody, retain identities/records and stop at ambiguity under a later explicit appointment/instructions | Conditional willingness and availability, not operational appointment |
| V | Separately qualified credential-free receiving/review boundary; treat E output as untrusted data, inspect full inventory using trusted tools and independent expected oracle | Alucard is only Owner-reported distinct physical hardware; no credential-free or isolation proof |
| P / actual issuer | Outside E and V; enforce exact accepted data/authority/tree/path/ref/parent and independently qualified least-privilege publication | No restricted publisher is installed or qualified; current connected author is not thereby P |
| Independent reviewer Q | Separately routed paper review and later exact-candidate evidence review as appropriate | DQA-012 and any new independent review remain NOT AUTHORIZED |

F0C availability is reported outside 13:00–22:00 UTC−06:00 for the candidates/custodian; it is a planning constraint without dates, reservation, guaranteed supervision or capacity measurements. New F0C statements remain author-attributed without independently authenticated primary receipt. [S07, S14–S15]

Conceptual custody objects are an actual AuthoritySeed, independent FixtureSeal, approved input inventory, E batch/output seal, V data-review receipt, and separately authorized P publication/closure receipt. Every handoff needs an attributable sender/receiver, exact bytes/identity, clock roles, disposition and closer. This is a responsibility/data model, not instructions for connecting devices or moving files.

V must not execute/import E's candidate, hooks, scripts or active content to review its own evidence. Trusted review tools and policies need independent qualification. Expected oracles must be independently derived from this specification and reviewed before E's result exists; comparing E's report to an oracle E supplied is insufficient.

Data eligibility is resolved **before any remote Git object creation/upload**. A clean report cannot authorize hidden extra files. No secrets, source transcript, active payload, unapproved identifier, archive, symlink, gitlink or unexpected mode is allowed. Exact handling and technical inspection procedures require a later route; none are performed or prescribed here.

## 8. Transport conflicts and unresolved custody

| Conceptual option | Compatibility issue | Required later decision; no selection now |
|---|---|---|
| Direct E-to-NAS/network access during offline execution | Contradicts the proposed disconnected E boundary | Cannot be accepted merely because NAS is practical/fast; no connection is authorized |
| Email, messages, cloud or live connector on E | Same live-connection conflict; also real source/custody/authentication questions | No presumed safe exception or hidden fallback |
| NAS or network staging entirely outside E | Could avoid direct E egress in principle, but does not establish an isolated crossing or trustworthy staging/V/P | Separate architecture, identity, data-flow and contamination review needed |
| Removable/courier medium or intermediary | Could carry offline data in principle; media and both directions remain attack/custody surfaces | Separate Owner approval, exact custody/anti-contamination evidence and technical QA; not assumed safe |
| No approved route | Actual custody cannot be demonstrated | DEFER; no ad hoc transfer to finish the exercise |

The Owner's NAS speed limitation and preference contain no measured throughput. The 45-minute planning ceiling cannot be claimed feasible from that statement. The same candidate pair or a convenient local network does not establish E/V trust separation. This handoff chooses no medium and gives no device, operating-system, media or transfer procedure.

## 9. Source-code and evidence location decision matrix

The only currently authorized new file is this Markdown handoff. The following are future policy alternatives, not writes or chosen architecture.

| Path | What a later exact decision must approve | Tradeoff / mandatory limit |
|---|---|---|
| Original C2 A1 source delivery on existing control | Explicit narrowly enumerated code/evidence policy exception, exact candidate/source/fixture/report paths, actors, limits, immutable QA delivery and retention | Exception is currently WITHHELD. Earlier Q01 exception is not blanket permission; code must not be relabeled Markdown. Owner must deliberately reconsider the documentation-only preference. |
| Dedicated nonproduct source repository / separately approved A2-B2 custody | Actual target identity/visibility, separate restricted publisher/issuer, approved source placement and revised custody route, candidate SHA/tree and independent acceptance | A second repository does not isolate a broad writer, provide a safe P route or waive original YU3DOH S2. No repo, identity or grant is created here. |
| DEFER implementation | Preserve documentary output and frozen evidence pending a location/security decision | The only valid current operating disposition when neither completion route is approved; no local-only substitute for required exact GitHub candidate custody |

The original C2 A1/S6 completion path requires an actual immutable GitHub candidate SHA/tree for independent review. A local bundle hash or this design's publication cannot substitute. If the Owner retains strict no-new-code-on-control, PC must separately seek evaluation/authorization of the external source custody alternative or DEFER. This design does not silently amend S6, select B2 or migrate/delete the frozen Q01 code. [S09, S17, S19]

Pure documentary reports/hashes/refs on control remain subject to the exact later evidence authority and public-data review; this design does not approve a future result namespace. Future source/runtime/caller file inventories and actual repository/ref/path values are UNKNOWN until S3.

## 10. Prerequisites and phase ordering

All rows below are **required future evidence**, not authorized tasks or asserted completion. The original six gates and F1 M01/M02 remain binding; a disconnected toy run cannot waive them. [S09, S11–S13]

| Gate / dependency | Required evidence and timing | Present disposition |
|---|---|---|
| Design choice and independent paper review | Owner accepts/modifies candidate; separately routed independent design QA resolves this handoff's material ambiguities | P1-DES authority only; QA NOT ACTIVATED |
| Actual role/custodian appointment | Named responsibilities, supervision window, closers, successors and retention accountability | Conditional reports only |
| S1 — real identities / rights | Independently verified executor cannot access a privileged writer/fallback; actual principal/App/installation/issuer/context route and least privilege for P/B if applicable | NOT INDEPENDENTLY PROVEN; blocks execution |
| S2 — original official-ref protection | Original YU3DOH product/control/ops protections, bypass boundaries, alternative writer evidence and legitimate PC continuity; no blanket bypass | NOT PROVEN; remains mandatory even if E offline or source store B2 |
| F1 M01/M02 continuity obligations | Exact legitimate-work/maximum-window owner and deferral decision; W/K lifecycle/cross-writer qualification in a separately approved packet | Unresolved for implementation; no branch-retirement investigation here |
| S3 — exact frozen candidate/input scope | Filled real authority, caller/Q01/runtime pins, source location, allowed names/modes/bytes, independent oracle/seal, output identities, resources and attempt budget | NOT EXECUTED; schematic fixture values are not an admission-ready packet |
| E / V readiness | Independent outer-host isolation/capability evidence for E and physically separate credential-free trusted V; no credential/network fallback | Erebo/Alucard are proposals only |
| Trusted P / issuer / CAS | Restricted actual writer and issued rights, fixed allowed methods/paths/ref/tree, server expected-old semantics and no bypass; qualified continuity/recovery | UNKNOWN / NOT QUALIFIED; normal current connector lease success is not this proof |
| S4 — offline execution | Independent readiness before run; enforced/observed absence of network, credential and real publisher capability throughout actual trial | NOT EXECUTED |
| S5 — data/custody | Public/synthetic-only input eligibility, qualified transfer boundary, complete independent receipt chain, whole output review before remote upload, retention/cleanup | NOT EXECUTED; transport unresolved |
| Exact implementation and execution route | Separately authorized source/caller implementation and one bounded execution, with explicit containment budget and no implicit new resources | NOT AUTHORIZED; no F1/F2 or Q02-PROT-001 grant |
| S6 — independent acceptance | Independently routed review of exact actual candidate SHA/tree and applicable full I01–I32, Q01 F01–F31 and unchanged R1/Gate C contracts before full prototype acceptance/integration | NOT EXECUTED; P1's four slots are not a substitute |
| Bounded P1 result review | Separate exact-candidate review of actual P1 oracles/custody/counters if execution is later authorized | No reviewer route now; narrower than full S6 |

Ordering prevents circular acceptance: paper design and source-location choice precede technical implementation authority; actual S1/S2 and applicable S3–S5 readiness precede execution. S4/S5 also require evidence during the run. Candidate delivery for QA can occur only under its own source/publication authority; S6 acceptance follows exact candidate creation, not before it. If a later proposed P1 implementation is part of Q02-PROT-001, that assignment's full conditions remain required. P1-DES creates no smaller security exception.

## 11. Recovery, closure and stop behavior

Use the frozen v2 operation dimensions if later operations exist; do not encode a plan as an observed ledger. Proposed identities such as P1-ADMIT, P1-EVALUATE, P1-V-REVIEW and P1-PUBLISH are planning labels only. Every actual emitted operation needs its own authority, parent where applicable, exact identity, source-bound observation clocks, lifecycle/outcome/effect/evidence/cleanup/acknowledgement, namespace and named closer. [S18]

| Future uncertainty | Safe conceptual decision |
|---|---|
| Missing trusted seed or exact candidate/input pin | BLOCK affected admission; no lookup or untrusted substitute |
| Custody copy missing or changed | Reconcile exact retained seals and last independently acknowledged boundary; UNKNOWN if unresolved |
| E interrupted / result confirmation missing | Recover original batch identity and inspect safely retained evidence; do not infer NOT_DONE or failure from silence |
| Exact completed output independently verified and authority compatible | REUSE_RESULT for its bounded content purpose; no re-execution merely to restore confirmation |
| Partial/corrupt output or unknown cleanup | RECONCILE_EFFECT; retain diagnostic data; BLOCK new use/retry until bounded disposition |
| Current external state is required but unavailable | P1 content check is inapplicable; BLOCK rather than fabricate a state-check PASS |
| Later P publication acknowledgement lost | Read-only reconciliation of original candidate/history/exact payload under its separate authority; no blind repeat or replacement |

No real interruption, lost acknowledgement or stateful publication is added as a P1 scenario. This paper recovery contract does not close the PP-002 quota/crash/lost-issuance-ACK gaps. No automatic retry authority is granted, including after elapsed time or a negative child outcome.

The future named batch closer remains responsible for original effects and partial evidence; a different result or replacement would not close it. PC must assign a successor if the closer becomes unavailable. Closure must disposition local files/processes, source/output identity, unexpected effects, retention and any separately authorized publication; runner termination is not application-level cleanup proof.

Proposed retention follows C2: original safe input/output and rejection/partial evidence, with at least two independently checked custody copies until PC's explicit retention disposition. Actual storage locations/access/lifetime are UNKNOWN and must be approved before use; two directories on one transient disk are not independent custody. Do not delete evidence, wipe media, change branches or remove historical sources to claim cleanup. No cleanup/retirement operation is authorized now.

## 12. Future independent documentary review checklist

These are proposed acceptance criteria for a **separately authorized** reviewer, not a QA activation or self-awarded PASS.

| Criterion | Objective review question |
|---|---|
| P1-DQ01 authority | One handoff only; authored choices labeled proposals; no technical GO, hidden code or operational procedure? |
| P1-DQ02 minimality | Two families/four slots justified; tiny single-record corpus, fixed replay budget and no retries? |
| P1-DQ03 exact source | Nominal repository/ref/path/blob/membership and byte/digest definitions unambiguous; independently frozen future oracle required? |
| P1-DQ04 rejection | M UNKNOWN, U same-blob/wrong-ref FAIL, T pre-Q01 trust BLOCK distinct and no fallback? |
| P1-DQ05 feasibility | Original Q01 profile/API/origin/UNKNOWN behavior preserved; no forged state checker or unsupported new validator capability? |
| P1-DQ06 determinism | Exact semantic comparison, clock separation, self-reference exclusions and whole inventory defined? |
| P1-DQ07 effect proof | Connected fake positive control, zero rejected callbacks/real external calls, independently checked counters and nonclaims? |
| P1-DQ08 custody | E/V/P/Q and custodian roles distinct; host qualification, seal trust and V safe data review unresolved honestly? |
| P1-DQ09 transport | Direct NAS/offline conflict explicit; no assumed safe removable/intermediary route or steps? |
| P1-DQ10 source custody | Original C2/S6 preserved; no-new-code policy, exact exception/external/DEFER alternatives and no implicit B2 selection? |
| P1-DQ11 gates and recovery | Original S1/S2 and all S3–S6, F1 M01/M02, phase order, closers, partial evidence and no blind retries retained? |
| P1-DQ12 history/publication | Historical provenance/official results preserved; immutable source trace, one-path additive publication and no central-index edits? |

An unresolved material ambiguity should return a correction request for this design before any execution route. A paper review may accept design quality only; it cannot qualify E/V, authenticate new F0C receipts or close S1/S2.

## 13. Traceability, UNKNOWNs and preserved dispositions

| Frozen requirement | Specification coverage |
|---|---|
| S02 scope items 1–2: bounded purpose/threat/input semantics | Sections 1–3 |
| S02 items 3–4: expected outputs and outcomes | Sections 4–6 |
| S02 items 5–6: E/V/P and transport | Sections 7–8 |
| S02 item 7: location alternatives without waiver | Section 9 |
| S02 items 8–9: gates, feasibility, review and stops | Sections 10–12 |
| S02 item 10: historical/preservation limits | This section, Section 14 |
| S04 request: exact source and future-only deterministic behavior | Sections 3–6; Appendix A |
| S06 proposal: nominal/missing-source candidate, no automatic trial | Sections 1, 4 and 10 |

Material UNKNOWNs: exact future trial acceptance/authority; trusted FixtureSeal channel; actual source/caller/runtime candidate and full numeric manifest pins; independently qualified E/V/custodian; safe transport/media; P/issuer/atomic CAS and original S1/S2; exact source/evidence store; actual schedule/capacity/performance; retention custody and independent reviewer. They are decision dependencies, not proof of failure or implicit permission.

Preserved status: A1 ARCHITECTURE PREFERENCE ONLY. F0 COMPLETE/PARTIAL OWNER-REPORTED. F0C COMPLETE/PARTIAL OWNER-DECLARED with independently unverified primary receipt. DQA-011 CLOSED/INCONCLUSIVE; F0-Q02 U1–U7 UNCORROBORATED. No new statement authenticates their literal wording/timing/context. Private original-message comparison remains INACTIVE and was not accessed/requested.

DQA-012 NOT AUTHORIZED. S1/S2 NOT INDEPENDENTLY PROVEN; S3–S6 NOT EXECUTED; Q02-PROT-001 NO-GO. C2 documentary PASS, Q01 independent offline PASS, F1 paper PASS and Option I evidence-quality PASS retain their limits. Gate C/final PP-002 REVISE; P01 UNCERTAIN / P02 UNKNOWN. Generic Protocol v1.0 and PP-002 v2 FROZEN/UNCHANGED. GOV-BRANCH-001 IMPORTANT/DEFERRED. No adoption, integration or protocol successor.

## 14. Publication and return custody

Actual work for P1-DES is confined to immutable public documentary GitHub reads, logical analysis and this single additive Markdown publication. No hardware/OS/network/media/NAS access or transfer, commands, tests, software/fixture execution, installations, source implementation, credential/settings/security probes, repository/branch creation, private transcript comparison, QA activation or retirement took place. Inline schemas and digest definitions are documentary examples, not runnable artifacts.

The activation authority resolves to e4630fc745c67b8dad636ec3cff4e362a3546109, parent `1b5b39eb1f66b39ee513eb52e26e8c8b25898808`, tree `f4409c3e8b09a054db65a08569878401b18491ef`. The complete nontruncated tree has 1,861 predecessor non-tree entries and the authorized output path is absent at intake. All 22 cited source pins agree with that tree; Q01 modules were additionally read at their accepted immutable candidate. Before publication, re-read compatible current HEAD and source authority, reject an output collision, preserve every predecessor path/mode/blob and use `expected_sha`, `force=false`. Lease success is normal documentary publication, not independent CAS/issuer security proof.

| Checkpoint reference read for preservation only | SHA at intake |
|---|---|
| `main` | `54cc3aad246c89a29f2a18be63c539db68cae041` |
| `feature/serial-v0.1` | `85dcd2f90090ff7da0589c9cf2ae3a4688d35455` |
| `feature/workspace-v0.1` | `e11579950ef7ed20e4b6eeee88f9c3597c1f074b` |
| `feature/workspace-run-026` | `e11579950ef7ed20e4b6eeee88f9c3597c1f074b` |
| `ops/pp-002-gate-b-actions` | `dd6e8bfecadab0a83c8008ea65300b1f0ba518f8` |
| `ops/pp-002-gate-b-r2-actions` | `0e679ad863076098d92d8a7704f6ca88948b651b` |
| `ops/pp-002-gate-c-actions` | `9c508d06e3862b4b142e998708026a5ed8757fd0` |

No branch-retirement assessment or claim about uninspected branches follows. The actual final publication SHA/blob cannot be embedded self-referentially in this handoff. PP-002 returns them after exact readback and one-path delta verification; PC-003 owns disposition and any next route.

**Terminal design disposition: DESIGN READY FOR PC-003 REVIEW / TECHNICAL NO-GO / NO EXECUTION OR INDEPENDENT QA ACTIVATED.**

## Appendix A — Exact source identities

All sources except S20–S22 were read at activation e4630fc745c67b8dad636ec3cff4e362a3546109. S20–S22 were read at the accepted Q01 candidate `328e57035d34f98c4d8d417729e8b12f91894e95`; their blobs also match activation membership. Historical statements in these sources remain attributed historical evidence, not fresh security observations.

| ID | Immutable source | Git blob |
|---|---|---|
| S01 | [control/PP-002_Q02_A1_P1_DES_OWNER_APPROVAL.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/e4630fc745c67b8dad636ec3cff4e362a3546109/control/PP-002_Q02_A1_P1_DES_OWNER_APPROVAL.md) | `1b5f2cd377602671c90a91fb1b1d3579477b05fd` |
| S02 | [control/PP-002_Q02_A1_P1_DES_FROZEN_SCOPE.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/e4630fc745c67b8dad636ec3cff4e362a3546109/control/PP-002_Q02_A1_P1_DES_FROZEN_SCOPE.md) | `0c10b2120e21d7600138e084623ab0236d7c9e2c` |
| S03 | [control/PP-002_Q02_A1_P1_DES_EFFECTIVE_AUTHORIZATION.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/e4630fc745c67b8dad636ec3cff4e362a3546109/control/PP-002_Q02_A1_P1_DES_EFFECTIVE_AUTHORIZATION.md) | `8fe39bfff7431f0a20eda74e257d897b28f30633` |
| S04 | [validations/PP-002/Q02-A1-P1-DES/PP-002_A1_P1_DOCUMENTARY_DESIGN_REQUEST.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/e4630fc745c67b8dad636ec3cff4e362a3546109/validations/PP-002/Q02-A1-P1-DES/PP-002_A1_P1_DOCUMENTARY_DESIGN_REQUEST.md) | `78af66589540973dbaab4b61b314b49d7ce2fa4c` |
| S05 | [routing/ROUTE-PP-002-Q02-A1-P1-DES-PP-002.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/e4630fc745c67b8dad636ec3cff4e362a3546109/routing/ROUTE-PP-002-Q02-A1-P1-DES-PP-002.md) | `e15d24f481415fd7c238cbf84785e37370d703f9` |
| S06 | [control/PP-002_Q02_A1_P1_SYNTHETIC_REHEARSAL_DEFINITION_PROPOSAL.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/e4630fc745c67b8dad636ec3cff4e362a3546109/control/PP-002_Q02_A1_P1_SYNTHETIC_REHEARSAL_DEFINITION_PROPOSAL.md) | `a6bf2a4275d2c4a41f9878facc801e0e522051c7` |
| S07 | [runs/PP-002_Q02_A1_F0C_INTAKE_DISPOSITION.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/e4630fc745c67b8dad636ec3cff4e362a3546109/runs/PP-002_Q02_A1_F0C_INTAKE_DISPOSITION.md) | `8ff5a77721bd0bb1cdf392f3fdd45e0ae7c54a83` |
| S08 | [control/PP-002_Q02_A1_F0C_NEXT_OWNER_DECISION_REQUEST.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/e4630fc745c67b8dad636ec3cff4e362a3546109/control/PP-002_Q02_A1_F0C_NEXT_OWNER_DECISION_REQUEST.md) | `9dc408d3beeca30fd55299c4d1eb80927650516e` |
| S09 | [handoffs/PP-002_Q02_C2_EXTERNAL_ISOLATION_DESIGN_HANDOFF.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/e4630fc745c67b8dad636ec3cff4e362a3546109/handoffs/PP-002_Q02_C2_EXTERNAL_ISOLATION_DESIGN_HANDOFF.md) | `e90a622fe7980dd9e28f3f09a31ac1ecfacaafbd` |
| S10 | [handoffs/PP-002_Q02_Q01_CONTROL_INTEGRATION_DESIGN_HANDOFF.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/e4630fc745c67b8dad636ec3cff4e362a3546109/handoffs/PP-002_Q02_Q01_CONTROL_INTEGRATION_DESIGN_HANDOFF.md) | `a06fb711662848ccc16d2e32d621be279a9b1f4d` |
| S11 | [control/PP-002_Q02_B1_OWNER_SIX_GATE_DECISION.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/e4630fc745c67b8dad636ec3cff4e362a3546109/control/PP-002_Q02_B1_OWNER_SIX_GATE_DECISION.md) | `16c8ceecb50d59cb2e1d673e53dbaf1cf69610f5` |
| S12 | [handoffs/PP-002_Q02_F1_FEASIBILITY_AND_CONFIGURATION_CONTRACT.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/e4630fc745c67b8dad636ec3cff4e362a3546109/handoffs/PP-002_Q02_F1_FEASIBILITY_AND_CONFIGURATION_CONTRACT.md) | `96b23062330006f59790883e87df4c095b37c5b2` |
| S13 | [validations/PP-002/Q02-F1/DQA-008_INDEPENDENT_DESIGN_QA_REPORT.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/e4630fc745c67b8dad636ec3cff4e362a3546109/validations/PP-002/Q02-F1/DQA-008_INDEPENDENT_DESIGN_QA_REPORT.md) | `c5c78b74d354ba14c5dfa364a07bc3cdcd751f98` |
| S14 | [validations/PP-002/Q02-A1-F0C/PP-002_A1_F0C_DOCUMENTARY_FEASIBILITY_CLARIFICATION_REPORT.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/e4630fc745c67b8dad636ec3cff4e362a3546109/validations/PP-002/Q02-A1-F0C/PP-002_A1_F0C_DOCUMENTARY_FEASIBILITY_CLARIFICATION_REPORT.md) | `082faf4ea6fefb47f466bd2ca48041b676176908` |
| S15 | [runs/PP-002_Q02_A1_F0_DQA011_INCONCLUSIVE_DISPOSITION.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/e4630fc745c67b8dad636ec3cff4e362a3546109/runs/PP-002_Q02_A1_F0_DQA011_INCONCLUSIVE_DISPOSITION.md) | `1aae433307fada71008405ce06a212b0f3d1a9e6` |
| S16 | [protocols/CONCURRENT_PUBLICATION_POLICY.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/e4630fc745c67b8dad636ec3cff4e362a3546109/protocols/CONCURRENT_PUBLICATION_POLICY.md) | `9b7c4dfed7b25b98b61e73f342592359b846e490` |
| S17 | [protocols/GIT_CONTROL_POLICY.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/e4630fc745c67b8dad636ec3cff4e362a3546109/protocols/GIT_CONTROL_POLICY.md) | `8e00dd5ae7a153a09ce88c2614fbea2ce3f2393d` |
| S18 | [control/PP-002_EXECUTION_INTERRUPTION_RECOVERY_PILOT-v2.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/e4630fc745c67b8dad636ec3cff4e362a3546109/control/PP-002_EXECUTION_INTERRUPTION_RECOVERY_PILOT-v2.md) | `e9c0cfa89294202e8c499c11ad840d806fffae5e` |
| S19 | [runs/PP-002_Q01_DQA-007_PASS_DISPOSITION.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/e4630fc745c67b8dad636ec3cff4e362a3546109/runs/PP-002_Q01_DQA-007_PASS_DISPOSITION.md) | `4f2080c9b90dd4f3d7fcbc780d8b42da0c6d9ba3` |
| S20 | [validation/pp002-q01-collector/README.md](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/328e57035d34f98c4d8d417729e8b12f91894e95/validation/pp002-q01-collector/README.md) | `ce02a0f3b53decd85799c478554a06fda85196b2` |
| S21 | [validation/pp002-q01-collector/collector.py](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/328e57035d34f98c4d8d417729e8b12f91894e95/validation/pp002-q01-collector/collector.py) | `10d1407628539798ef93a2d354373eed3091fefd` |
| S22 | [validation/pp002-q01-collector/guard.py](https://github.com/KhaosMagnus/YU3DOH-Carder/blob/328e57035d34f98c4d8d417729e8b12f91894e95/validation/pp002-q01-collector/guard.py) | `e0394656cf4ba1034f09e6bf34ccc6c4b9ec52e0` |

## Appendix B — Retrieval clock custody

These timestamps bracket actual connector invocation/return at the caller, not measured HTTP wire dispatch or authenticated provider event clocks. `recorded_at` above is document assembly only. The source commit event timestamp is not substituted for observation time. Source pin verification is against exact returned content identity and tree membership, not an assertion of independently authenticated signer or original Owner receipt.

| Source | requested_at UTC | receipt_at UTC |
|---|---|---|
| S01 | 2026-11-04T23:01:57.113Z | 2026-11-04T23:01:57.726Z |
| S02 | 2026-11-04T23:01:57.113Z | 2026-11-04T23:01:57.748Z |
| S03 | 2026-11-04T23:01:57.113Z | 2026-11-04T23:01:57.886Z |
| S04 | 2026-11-04T23:01:57.113Z | 2026-11-04T23:01:57.866Z |
| S05 | 2026-11-04T23:01:57.113Z | 2026-11-04T23:01:57.741Z |
| S06 | 2026-11-04T23:02:19.979Z | 2026-11-04T23:02:20.807Z |
| S07 | 2026-11-04T23:02:19.979Z | 2026-11-04T23:02:20.410Z |
| S08 | 2026-11-04T23:02:19.979Z | 2026-11-04T23:02:21.527Z |
| S09 | 2026-11-04T23:02:19.979Z | 2026-11-04T23:02:20.664Z |
| S10 | 2026-11-04T23:02:19.979Z | 2026-11-04T23:02:21.298Z |
| S11 | 2026-11-04T23:02:19.979Z | 2026-11-04T23:02:20.524Z |
| S12 | 2026-11-04T23:02:19.979Z | 2026-11-04T23:02:21.011Z |
| S13 | 2026-11-04T23:02:19.979Z | 2026-11-04T23:02:21.551Z |
| S14 | 2026-11-04T23:02:19.979Z | 2026-11-04T23:02:20.409Z |
| S15 | 2026-11-04T23:02:19.979Z | 2026-11-04T23:02:20.404Z |
| S16 | 2026-11-04T23:02:19.979Z | 2026-11-04T23:02:20.643Z |
| S17 | 2026-11-04T23:02:19.979Z | 2026-11-04T23:02:20.412Z |
| S18 | 2026-11-04T23:02:19.979Z | 2026-11-04T23:02:20.371Z |
| S19 | 2026-11-04T23:02:19.979Z | 2026-11-04T23:02:20.545Z |
| S20 | 2026-11-04T23:02:19.979Z | 2026-11-04T23:02:20.618Z |
| S21 | 2026-11-04T23:02:19.979Z | 2026-11-04T23:02:20.520Z |
| S22 | 2026-11-04T23:02:19.979Z | 2026-11-04T23:02:21.045Z |
