---
artifact_id: PP-002-GATE-A2-REVISED-HISTORICAL-REVALIDATION
artifact_type: experimental_procedure_revalidation
status: FROZEN
protocol_version: "1.0"
source_role: PROTOCOL_PORTABILITY
source_instance: PP-002
target_role: PROJECT_CONTROL
target_instance: PC-002
control_input_sha: f284e26d91364a4555e0cebba24cf76f74eb261f
publication_parent_expected: f284e26d91364a4555e0cebba24cf76f74eb261f
procedure: control/PP-002_EXECUTION_INTERRUPTION_RECOVERY_PILOT-v2.md
predecessor: protocols/PP-002_GATE-A_HISTORICAL_RECOVERY_REPLAY.md
predecessor_publication_sha: 97b74aab7e60af37ca5f25c24e9328d92385b33b
experiment: PP-002
gate: A2
mode: READ-ONLY REVISED HISTORICAL REVALIDATION
report_date: "2026-10-28"
result: PASS
publication_status: BLOCKED_OUTPUT_ALREADY_EXISTS
concurrent_publication_sha: 538cab04ea8964a671fc1cc7286944538d8a5a9a
concurrent_report_blob: b7ef2728a449e27bf2986aefe6b288bcb919e620
product_mutation: false
actions_launched_rerun_cancelled: false
generic_protocol_modified: false
gate_b_authorized: false
gate_c_authorized: false
---

# PP-002 — Gate A2 Revised Historical Revalidation

**Result: PASS for historical revalidation of the frozen v2 procedure.** The corrected record and decision rules produce safe next actions for A1–A4 without adding lifecycle states, inventing historical telemetry or changing the procedure during application. Missing historical observations produce UNCERTAIN and a block on affected repetition; they do not require a fabricated successful reconstruction. Parent/child separation resolves the DEPLOY-005 timeout/active-job problem. Late-operation ownership survives successful replacement. Ordinary evidence access remains outside the interruption trigger.

This result establishes sufficient definition for PC-002 to **consider** a separately authorized Gate B. It does not demonstrate live recovery, at-most-once execution, executor replacement, or protocol adoption. It does not retroactively make historical execution compliant with a procedure that did not then exist. No historical operation was rerun, cancelled or modified.

## 1. Authority, evidence and verification time

Consumed exactly `meta/project-control @ f284e26d91364a4555e0cebba24cf76f74eb261f`:

| Authority / contract | Git blob verified at intake |
| --- | --- |
| [Gate A2 authorization](../control/PP-002_GATE-A2_AUTHORIZATION.md) | `383aec430462aa1c70d7dab802e0f468e1ddbcb8` |
| [Frozen experimental procedure v2](../control/PP-002_EXECUTION_INTERRUPTION_RECOVERY_PILOT-v2.md) | `e9c0cfa89294202e8c499c11ad840d806fffae5e` |
| [Gate A2 route](../routing/ROUTE-PP-002-GATE-A2.md) | `3c10d9ee1ead88b2745232df7efaa6f5f32e2f27` |
| [Predecessor REVISE disposition](../runs/PP-002_GATE-A_REVISE_DISPOSITION.md) | `241e34643c662f80c76a34ea30e6748cba89cdd2` |
| [Predecessor report](PP-002_GATE-A_HISTORICAL_RECOVERY_REPLAY.md) | `a09ee1b06083751ea2a2abf2578bf944ca927362`, unchanged from `97b74aab7e60af37ca5f25c24e9328d92385b33b` |
| [Generic Protocol v1.0](GENERIC_PROJECT_CONTROL_PROTOCOL-v1.0.md) | `1ac3689c1e811d1594291afee6b2c1c6efd093d0`, unchanged |

The PP-002 assignment, role and concurrent-publication policy were also read. The sole delegated repository write is this new report, with expected-head protection. No central index, predecessor, experimental procedure or Generic Protocol edit is authorized.

Evidence sources, all read from GitHub at the input control unless otherwise stated:

| Source | Material inspected |
| --- | --- |
| S1 | [ENV-005 report](../validations/RUN-025/ENV-005_ENVIRONMENT_READINESS_REPORT.md), [request](../validations/RUN-025/ENV-005_ENVIRONMENT_READINESS_REQUEST.md), two Actions runs/jobs/artifact listings and decoded job logs; retained original first-attempt artifact bytes. |
| S2 | [DEPLOY-005 report](../validations/RUN-025/DEPLOY-005_VALIDATION_EVIDENCE.md), [request](../validations/RUN-025/DEPLOY-005_VALIDATION_REQUEST.md), two Actions runs/jobs/artifact listings and decoded logs; retained partial first-attempt ZIP; original harness source at `ba93b7fa39ba8c413ae53de5bb4925a061b5dbf2`. |
| S3 | [Interruption observation](../control/RUN-026_INTERRUPTION_RECOVERY_OBSERVATION.md), [session evaluation](../control/RUN-026_SESSION_PILOT_EVALUATION.md), [implementation report](../implementations/RUN-026_IMPLEMENTATION_REPORT.md); exact historical control tree, DEV-008 authorization/route at `b3b066bf0c34a42d6e7880806ffacaf93ac598e7`; independent candidate Git commit/parent read. |
| S4 | [DQA-005 report](../validations/RUN-026/DQA-005_EXTERNAL_QA_REPORT.md), [INCONCLUSIVE disposition](../runs/RUN-026_DQA-005_INCONCLUSIVE_DISPOSITION.md), [transport authorization](../control/RUN-026_EVIDENCE_TRANSPORT_AUTHORIZATION.md), [DEPLOY-006 report](../validations/RUN-026/DEPLOY-006_EVIDENCE_ACCESS_REPORT.md), [access disposition](../runs/RUN-026_DEPLOY-006_EVIDENCE_ACCESS_DISPOSITION.md), [runner receipt](../validations/RUN-026/DEPLOY-006/transport-verification.json), [retrieval receipt](../validations/RUN-026/DEPLOY-006/retrieval-verification.json); transport Actions run/job/artifact metadata. |

PP-002 re-read the four RUN 025 job logs and independently rechecked the two retained ZIPs from Gate A: byte length, SHA-256, CRC and every manifest entry. They are inherited downloaded bytes reverified in this turn, not a newly executed workflow or newly generated evidence. Successful replacement bundles were not redownloaded/revalidated in full. Their relevant execution/custody/cleanup records and accepted producer reports are inspected evidence of those bounded historical facts, not a new product QA adjudication. The 80 MB DEPLOY-006 package was not downloaded again; its transport/retrieval receipts and official historical dispositions are report evidence, corroborated by current Actions metadata.

### Observation profiles used by every state record

All timestamps below are UTC. The report date above is the user-facing date in America/Mexico_City. A source-read interval is given where the individual response time was not separately logged; the verification timestamp is when its batch/read check completed. No interval endpoint is represented as an exact historical event time.

| Profile | Observation source | Observation timestamp | Event timestamp | Previous observation timestamp | Current verification timestamp |
| --- | --- | --- | --- | --- | --- |
| V-REPO | Pinned GitHub control files/refs | Read interval `2026-10-29T03:02:36Z`–`03:03:15Z` | Historical document/publication time UNKNOWN unless explicitly referenced | Gate A reads existed; exact per-source observation times not inherited | `2026-10-29T03:03:15Z` |
| V-EXT | Fresh run/job/artifact API responses for the five named workflows | Same read interval as V-REPO | `created_at`, `updated_at`, artifact-created time as cited; `updated_at` is not an exact job-completion timestamp | Gate A external reads; exact timestamp UNKNOWN | `2026-10-29T03:03:15Z` |
| V-LOG | Newly fetched four decoded RUN 025 job logs | Read interval `03:03:15Z`–`03:04:52Z` | Timestamped log lines; exact unlogged sub-operation times UNKNOWN | Prior log read in Gate A; timestamp UNKNOWN | `2026-10-29T03:04:52Z` |
| V-ZIP | Retained original/partial ZIP byte and member reinspection | Check completed at `03:05:31Z` | Internal browser-error/cleanup emission times UNKNOWN unless separately logged; ZIP file metadata is not substituted for event telemetry | Gate A download/check, exact timestamp not inherited | `2026-10-29T03:05:31Z` |
| V-HIST | GitHub historical control tree and candidate commit object | Check completed at `03:05:31Z` | Candidate commit author date `2026-10-28T08:37:21Z`; actual push/interruption time UNKNOWN | PC interruption-time observation recounted by S3, timestamp UNKNOWN | `2026-10-29T03:05:31Z` |
| V-HARNESS | Exact original DEPLOY-005 orchestration/browser/workflow source | Read completed at `03:08:04Z` | Commit `ba93b7fa39ba8c413ae53de5bb4925a061b5dbf2`; runtime events from V-LOG, not source code | Gate A source review, timestamp UNKNOWN | `2026-10-29T03:08:04Z` |
| H1 | Historical recovery checkpoint before ENV-005 replacement | **UNKNOWN: no contemporaneous fresh query receipt retained** | Boundary: replacement run created `2026-10-27T18:33:51Z`; actual push/ack time UNKNOWN | E1's old in-progress observation has no preserved exact poll time | Historical current verification **UNKNOWN**; replay verification V-EXT/V-LOG is later |
| H2 | Historical checkpoint before DEPLOY-005 replacement | **UNKNOWN: no contemporaneous fresh query receipt retained** | Boundary: replacement run created `2026-10-27T18:59:03Z`; actual push/ack time UNKNOWN | UNKNOWN | Historical current verification **UNKNOWN**; replay verification V-EXT/V-LOG is later |
| H3 | PC observation and executor UI at DEV-008 interruption | Exact observation timestamp **UNKNOWN**, preserved through S3's attestation | Interruption after candidate publication and before final delivery; exact time UNKNOWN | UNKNOWN | Historical local-process verification **UNKNOWN**; replay V-HIST proves only the stated durable objects/tree |
| H4 | DQA-005 terminal evidence-access checkpoint | Exact observation timestamp **UNKNOWN**, preserved in frozen report | Report revision `cbce21789c8a1ef5496041b0c1cc0a6d03ddd3af`; exact access-attempt times UNKNOWN | UNKNOWN | V-REPO verifies the report, not access on the old executor |

Every state table refers to these profiles; that reference supplies all five freshness fields for each row. Historical missing fresh polls are not filled with today's terminal results. Under v2 §3 they remain UNCERTAIN until observed. Later logs can reconstruct an activity interval as an inference; they cannot create a contemporaneous query receipt.

## 2. Record conventions and exact identity contexts

The tables below are a normalized operation ledger: each identity template plus its explicit context and state row is one complete operation record. References to a shared context avoid copying the same three 40-character revisions into every child. This is presentation of v2's required fields, not a new model. If a row lists multiple IDs, the vector applies separately to each named operation; it does not merge their lifecycles.

The command-batch operation has exactly eight recorded members: two frozen installs, `compile`, `build`, `test:sc`, `test:library`, server compile and server test. Their existing individual receipts remain the member-level evidence. Grouping is limited to a common state/decision; any discrepant member would need its own row. No application mutation is inferred from a command-batch PASS.

| Context | Authority artifact / CONTROL SHA | Product SHA/ref | Harness SHA | Accountable owner / closer | Effect/output namespace |
| --- | --- | --- | --- | --- | --- |
| E1 | ENV-005 readiness request; `af6b13dfa7225d90204eb772915e4f6433bb651d` | `feature/workspace-run-025 @ dd968ba05e579461962bbcced0e9cae3cd4c3d23`; baseline `e07140d5a9555a17b7b2306a45625c14adfafc8e` | `914151e32df22bf0a18d2cd091b0ff60a37db9c4` | ENVIRONMENT_READINESS / ENV-005 | Original runner/run `40559807626`; `env005-evidence/`, disposable `env005-workspace/`, its own artifact |
| E2 | Same authority/control/product as E1 | Same exact candidate and baseline | `c5d5a08bad6ba110121a813a7db18af5d043f670` | ENVIRONMENT_READINESS / ENV-005 | Replacement runner/run `40561137872`; same relative paths in a distinct runner, distinct artifact |
| D1 | DEPLOY-005 validation request; `ff89d489cb225ba10775617dd07aee31c372f4ac` | Same RUN 025 candidate/baseline as E1 | `ba93b7fa39ba8c413ae53de5bb4925a061b5dbf2` | DEPLOYMENT_VALIDATION / DEPLOY-005 | Original runner/run `40564804923`; `deploy005-evidence/`, two disposable roots, Service 4312/4313 and Vite 3000/3001 within that runner |
| D2 | Same authority/control/product as D1 | Same exact candidate and baseline | `f4cc120d21694dc10032bd92cf97f8e5d42f8e14` | DEPLOYMENT_VALIDATION / DEPLOY-005 | Replacement runner/run `40564959018`; isolated runner, roots and artifact; no shared Owner Workspace |
| DEV | `runs/RUN-026_AUTHORIZATION.md` and DEV-008 route; `b3b066bf0c34a42d6e7880806ffacaf93ac598e7` | `feature/workspace-run-026 @ e11579950ef7ed20e4b6eeee88f9c3597c1f074b`; baseline `dd968ba05e579461962bbcced0e9cae3cd4c3d23` | Local validation harness revision UNKNOWN; not an Actions harness SHA | DEVELOPMENT / DEV-008, session S01 | Published product ref; executor-local fixtures/browser/logs UNKNOWN at interruption; final evidence `validations/RUN-026/DEV-008/`, report `implementations/RUN-026_IMPLEMENTATION_REPORT.md` |
| QA5 | DQA-005 QA request/route; `de8e2984b25a4ade0774622eaaf2a75563b58b7c` | Same RUN 026 exact candidate/baseline as DEV | NOT_APPLICABLE | DESIGN_QA / DQA-005 | Independent inspection and new QA report; no product execution claim |
| TR | Transport authorization/request; `7e4a0d68f148ec6216bb830a654d87ad012bc606` | Same RUN 026 exact candidate/baseline; source archive control `6e9f503ed0e05016de50da5630cdeaeb6948725e` | `da47a3668c75b916f23650d38677e58d0b38ba36` | DEPLOYMENT_VALIDATION / DEPLOY-006 | Transport run `40742109392`, raw/companion artifacts, disposable extraction tree and later retrieval receipt; no product fixture |

Main for all contexts is `54cc3aad246c89a29f2a18be63c539db68cae041`. Current integration ref is the RUN 026 candidate, not the historical RUN 025 or RUN 026 baseline. No current ref is projected backward.

Historical assignment-level owners above are durable. A distinct operation-level closer assignment/receipt was not recorded for each historical child. Under v2 §13 these accountable instances retain closure responsibility; PC-002 must name a successor if they are unavailable. This report does not assume an old executor is currently available or appoint a new closer. Unknown issuance/ack times remain UNKNOWN. A server-assigned Actions ID establishes acknowledged server-side emission; whether the interrupted executor saw that acknowledgement is separately UNKNOWN where no receipt exists.

## 3. A1 — ENV-005: replacement while original provisioning continued

### Identity and hierarchy records

For `n=1`, context E1, `run=40559807626`, `job=122385467223`, `artifact=12761156369`. For `n=2`, context E2, `run=40561137872`, `job=122390152741`, `artifact=12761650907`. Each of the following templates instantiates once for each n, yielding 16 logical records.

| logical_operation_id | parent_operation_id | Purpose / intended effect | Operation type | External operation ID | Emission channel | Namespace suffix |
| --- | --- | --- | --- | --- | --- | --- |
| `A1-n-WF` | NONE | Execute isolated readiness workflow | External workflow | run | Watched operational-branch push → Actions; exact push ack time UNKNOWN | Entire run |
| `A1-n-JOB` | `A1-n-WF` | Execute readiness job | External job | job | Actions scheduler | Job/runner |
| `A1-n-GATE` | `A1-n-JOB` | Complete two installs and six literal commands | Sequential command batch | job + named steps/receipts | Runner process spawn | Candidate checkout and command logs |
| `A1-n-PROVISION` | `A1-n-JOB` | Make capture browser/tooling usable | Tool provisioning | job + provisioning step | Runner package/browser commands | Runner tooling/browser paths |
| `A1-n-SMOKE` | `A1-n-JOB` | Capture real Service/Library neutral readiness | Runtime/browser probe | job + neutral-probe step; local PIDs UNKNOWN | Harness process/API/browser | Disposable fixture and captured DOM/network/image |
| `A1-n-CLEAN` | `A1-n-SMOKE` | Remove owned disposable Workspace | Fixture cleanup | Local operation ID UNKNOWN; cleanup receipt identifies root | Harness filesystem/service cleanup; exact issue time UNKNOWN | Owned Workspace root only |
| `A1-n-CUSTODY` | `A1-n-JOB` | Record unchanged exact candidate/protected refs | Custody inspection | job + final-custody step | Git/read-only checks | Final custody JSON |
| `A1-n-UPLOAD` | `A1-n-JOB` | Publish this attempt's evidence archive | Artifact upload | artifact | Actions upload-artifact | Distinct artifact ID/digest |

All identity fields not in this table come explicitly from E1/E2. Emission for WF/JOB and completed named steps is `EMITTED_ACKNOWLEDGED` by server/step records. Cleanup and upload are independently acknowledged by their receipts/artifact records. Exact initial request/acknowledgement times for child operations are UNKNOWN, not inferred from their parent start time.

### Historical information boundary and decision

**OBSERVED EVIDENCE:** first workflow created `2026-10-27T18:25:15Z`; provisioning step began `18:27:34.4609283Z`. Replacement run created at H1, `18:33:51Z`; replacement commit time was `18:33:43Z`. The next first-run probe step occurred only at `18:39:15.5920888Z`. The report's old in-progress observation has no preserved exact poll timestamp.

**INFERENCE:** original provisioning was physically active at H1. A fresh run/job/step query then could have established STILL_RUNNING. That query's actual historical response is not retained. Under v2 §3, the record available without obtaining it yields the following safe H1 decision, not a backdated fresh observation:

| Operation at H1 | Lifecycle | Outcome | Effect | Evidence | Cleanup | Emission | Safe next action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `A1-1-WF`, `A1-1-JOB` | UNCERTAIN | UNKNOWN | EFFECT_CONFIRMED: issued original run exists | EVIDENCE_INSUFFICIENT for full readiness | CLEANUP_UNKNOWN | EMITTED_ACKNOWLEDGED | KEEP_OBSERVING to obtain a current status; BLOCK automatic replacement meanwhile |
| `A1-1-PROVISION` | UNCERTAIN without a fresh query | UNKNOWN | POSSIBLE_EFFECT | EVIDENCE_INSUFFICIENT | CLEANUP_NOT_APPLICABLE for application fixture deletion | EMITTED_ACKNOWLEDGED via known issued job; exact child receipt time UNKNOWN | KEEP_OBSERVING; no inferred terminal failure |
| Proposed replacement before push | UNCERTAIN as to complete historical emission/approval checkpoint; later run existence is not used here | UNKNOWN | POSSIBLE_EFFECT: push can launch Actions | EVIDENCE_INSUFFICIENT for concurrency justification | CLEANUP_UNKNOWN | UNKNOWN at the unrecorded pre-push checkpoint | BLOCK emission absent v2 §12 exception fields |

Profile: H1 for all rows. The proposed replacement row describes the missing decision record, not a claim that an unissued action failed. No lifecycle is inferred from silence. Existing successful earlier substeps can be retained after inspecting their exact receipts; they do not establish full readiness. The not-yet-started downstream steps are reconstructible from later sequential logs, but are not promoted into contemporaneously verified child statuses.

**RECOVERY DECISION:** observe original first. If a current query shows active provisioning, set its WF/JOB/PROVISION records to STILL_RUNNING and KEEP_OBSERVING. If status remains inaccessible, retain UNCERTAIN and BLOCK affected repetition. Neither path automatically launches the substitute. Both prevent an **unjustified** overlapping execution.

The alternative browser channel is a real delta: runner Chrome instead of Playwright's downloaded Chromium, with a three-minute tooling bound. **PLAUSIBLE HYPOTHESIS:** slow provisioning motivated it. The historical record does not preserve why waiting was insufficient, a bounded concurrency budget or a specific two-attempt closer decision. A justified exception would need those fields plus unchanged candidate, isolated effects/outputs and sufficient delegation. The readiness request's harness permission does not itself supply every missing concurrency condition; this is a v2 revalidation, not a retrospective declaration of misconduct.

### POST-HOC RECONCILIATION EVIDENCE and current vectors

Profiles V-EXT/V-LOG apply to terminal workflow/step facts; V-ZIP and S1 apply to the first attempt's raw receipts; V-REPO/S1 to replacement cleanup/custody. Evidence classification is scoped to the stated operation/result, not independent product acceptance or complete revalidation of every image.

| Logical records | Lifecycle | Outcome | Effect | Evidence | Cleanup | Safe next action |
| --- | --- | --- | --- | --- | --- | --- |
| `A1-1-WF`, `A1-1-JOB` | CONFIRMED_DONE | SUCCESS | EFFECT_CONFIRMED | EVIDENCE_VERIFIED: terminal execution and bounded readiness | CLEANUP_CONFIRMED for owned fixture removal | REUSE_RESULT as alternate readiness; reconcile late administrative closure |
| `A1-2-WF`, `A1-2-JOB` | CONFIRMED_DONE | SUCCESS | EFFECT_CONFIRMED | EVIDENCE_VERIFIED: selected readiness report, terminal steps/custody | CLEANUP_CONFIRMED for owned fixture removal | REUSE_RESULT as historically accepted readiness, not QA PASS |
| `A1-1-GATE`, `A1-2-GATE`, `A1-1-PROVISION`, `A1-2-PROVISION` | CONFIRMED_DONE | SUCCESS | EFFECT_CONFIRMED | EVIDENCE_VERIFIED for command/provisioning completion | CLEANUP_NOT_APPLICABLE to application fixture cleanup | REUSE_RESULT only with original candidate/tool provenance |
| `A1-1-SMOKE`, `A1-2-SMOKE` | CONFIRMED_DONE | SUCCESS | EFFECT_CONFIRMED | EVIDENCE_VERIFIED for neutral readiness execution | CLEANUP_CONFIRMED for associated owned root | REUSE_RESULT within neutral-smoke limits |
| `A1-1-CLEAN`, `A1-2-CLEAN` | CONFIRMED_DONE | SUCCESS | EFFECT_CONFIRMED: root removed | EVIDENCE_VERIFIED: explicit removal receipts | CLEANUP_CONFIRMED | REUSE_RESULT for root-removal fact only |
| `A1-1-CUSTODY`, `A1-2-CUSTODY` | CONFIRMED_DONE | SUCCESS | NO_EFFECT_CONFIRMED on protected product refs | EVIDENCE_VERIFIED | CLEANUP_NOT_APPLICABLE | REUSE_RESULT as historical custody |
| `A1-1-UPLOAD`, `A1-2-UPLOAD` | CONFIRMED_DONE | SUCCESS | EFFECT_CONFIRMED | EVIDENCE_VERIFIED for distinct artifact publication; full replacement ZIP not rehashed here | CLEANUP_NOT_APPLICABLE; retention remains material | REUSE_RESULT for publication/identity; preserve retention responsibility |

First-run artifact: **12761156369**, **182,708 bytes**, SHA-256 `67b2e731352ff175c0f3e07d36a6f44e5eeaa2b9a584525d78be2f21ddee8e3a`, CRC valid, **38/38** manifest entries reverified. It records ENVIRONMENT READY, zero behavioral cases and root removal. Its Chromium was **145.0.7632.6**. Replacement artifact: **12761650907**, **182,659 bytes**, digest `293bfc8f1bf586c5008687fbf790cfda9b89c8ac4eb30614e08368de038f1cf6`; its Chrome was **155.0.8059.39**. They are not interchangeable browser-version evidence.

Replacement completed first (`updated_at=18:36:59Z`); original later (`updated_at=18:39:28Z`). These are metadata update times, not exact job exits. Both repeated installs/gates/smoke/custody/upload; the differing provisioning method could warrant an exception, but eventual first-run success was unavailable at H1. Reuse does not rewrite the original report's pending statement or transfer official readiness selection automatically.

ENV-005 remains closer for **both** attempts. The late original's retention expiry is `2027-01-25T18:25:16Z`; the inspected control tree has a replacement ZIP, not a separately pinned original ZIP. PC must disposition retention/terminal ownership if the old instance is unavailable. Fixture removal does not assert graceful shutdown of every operating-system descendant. This report reconciles the available facts and preserves that limitation; no cleanup is performed now.

## 4. A2 — DEPLOY-005: child failure, active parent and uncertain cleanup

### Identity and hierarchy records

For `n=1`, D1, `run=40564804923`, `job=122403104268`, `artifact=12765521243`. For `n=2`, D2, `run=40564959018`, `job=122403657714`, `artifact=12763235984`. Each template expands for both n, yielding 22 records.

| logical_operation_id | parent_operation_id | Purpose / intended effect | Type | External operation ID | Emission channel | Namespace suffix |
| --- | --- | --- | --- | --- | --- | --- |
| `A2-n-WF` | NONE | Execute validation evidence workflow | External workflow | run | Watched harness push → Actions | Whole run |
| `A2-n-JOB` | `A2-n-WF` | Execute evidence job | External job | job | Actions scheduler | Job/runner |
| `A2-n-GATE` | `A2-n-JOB` | Two installs + six literal commands | Command batch | job + eight named steps | Runner subprocesses | Candidate checkout/gate logs |
| `A2-n-RUNTIME` | `A2-n-JOB` | Orchestrate fixtures/browser/finalizers | Harness process/Actions step | job + `Execute F04 B01 through B26` | `deploy005-run.cjs` | Runtime and final-status/snapshots |
| `A2-n-ASSERT` | `A2-n-PROCESS` | Execute browser test routine including baseline setup | Browser assertion task | No separate external ID; routine source and browser.log | Browser harness `run()` | Test routine/case outputs |
| `A2-n-PROCESS` | `A2-n-RUNTIME` | Host browser harness and browser connection | Child process | PID/exit receipt UNKNOWN for first attempt | `spawn` + browser launch | Browser/service connections within runner |
| `A2-n-FIXTURE` | `A2-n-RUNTIME` | Start two disposable real Services/roots | Fixture/runtime process group | Fixture identities in per-port JSON; PIDs UNKNOWN | Harness spawns; 4312/4313 APIs | Two roots; no Owner Workspace |
| `A2-n-CLEAN` | `A2-n-RUNTIME` | Shut down owned children and remove fixture roots | Application cleanup | Cleanup receipt, if produced | Harness finalizer / child signals | Two roots and named owned children |
| `A2-n-CUSTODY` | `A2-n-JOB` | Verify exact checkout and protected refs | Custody inspection | job + final-custody step | Git/read-only checks | Custody JSON |
| `A2-n-EVALUATE` | `A2-n-JOB` | Evaluate complete evidence gate | Gate-evaluation process | job + `Evaluate full gate` | Runner process reading final-status | Gate-evaluation outcome |
| `A2-n-UPLOAD` | `A2-n-JOB` | Preserve attempt's evidence | Artifact upload | artifact | Actions upload-artifact | Distinct artifact/manifest |

Context supplies all remaining identity fields. WF/JOB, started named steps and uploads have server/step acknowledgement `EMITTED_ACKNOWLEDGED`. The historical exact push acknowledgement time is UNKNOWN. First cleanup has emission `UNKNOWN`: no receipt proves its entry or completion. Browser assertions are acknowledged by the actual timeout/result, independently of process exit. First browser process spawn is confirmed by executed browser interaction; exact spawn ack time/PID is UNKNOWN.

### Historical launch boundary

**OBSERVED EVIDENCE:** first run created `2026-10-27T18:57:57Z`; replacement at H2 `18:59:03Z`. Original root-install receipt spans `18:58:46.855Z`–`18:59:12.397Z`. Its runtime/browser orchestration starts only at `19:00:14.0879388Z`. The later baseline locator timeout cannot have been known when replacement began.

**INFERENCE:** the original job was installing at H2. A fresh query could establish STILL_RUNNING; no contemporaneous query receipt is preserved. Profile H2 therefore gives original WF/JOB/GATE **UNCERTAIN / UNKNOWN outcome / EFFECT_CONFIRMED issued run / EVIDENCE_INSUFFICIENT for full validation / CLEANUP_UNKNOWN / EMITTED_ACKNOWLEDGED** until reobserved. Safe action is KEEP_OBSERVING, with automatic replacement BLOCKED while material retry fields are missing. No future timeout or successful substitute may supply those fields retroactively.

The replacement's known delta corrects the later empty-state probe's routing to real Service 4313. It does not repair the original's later baseline-card timeout. **PLAUSIBLE HYPOTHESIS:** that prospective correction motivated replacement. No preserved rationale establishes waiting was insufficient or records every v2 §12 exception field. The new harness may justify a corrected run, but not an automatic one merely because a push can trigger it.

### Parent/child proof under v2

S2/V-HARNESS independently establishes:

1. The orchestrator spawns the browser harness and **awaits its process `exit` event**, then writes `browser-exit.json`.
2. The first baseline `.library-card` click occurs before the browser routine's later `try/finally` closing section. Its rejected locator operation is recorded in `browser.log` as `TimeoutError` after 30 seconds.
3. The top-level catch logs the error and sets `process.exitCode=1`; this is not an observed process exit. No first-attempt `browser-exit.json` exists.
4. The parent runtime step remains open until its cancellation log at `19:38:47.1207900Z`. The workflow then performs custody, failed full-gate evaluation and partial upload before terminal cancellation.

Thus **a completed failed assertion routine, an unconfirmed browser-process exit and a nonterminal parent job are distinct facts/states**. A failed child can coexist with a STILL_RUNNING parent whenever a fresh external query verifies that parent. The exact browser-error timestamp and an actual simultaneous historical status poll remain UNKNOWN; this report does not invent them. The coexisting state pair is supported by the retained error/parent execution path and chronology, not claimed as a preserved live Recovery Gate receipt.

| Record during the failure/parent-active interval | Lifecycle under v2 | Outcome | Effect | Evidence | Cleanup | Decision |
| --- | --- | --- | --- | --- | --- | --- |
| `A2-1-ASSERT` when its error is inspected | CONFIRMED_DONE | FAILURE | EFFECT_CONFIRMED: browser task attempted setup and rejected | EVIDENCE_VERIFIED for timeout, insufficient for acceptance | CLEANUP_NOT_APPLICABLE to the assertion task itself | RECONCILE_EFFECT; no implied parent retry |
| `A2-1-PROCESS` without an exit observation | UNCERTAIN | UNKNOWN for process outcome | EFFECT_CONFIRMED: browser interaction occurred | EVIDENCE_INSUFFICIENT for exit | CLEANUP_UNKNOWN | RECONCILE_EFFECT; BLOCK affected reuse/retry if unresolved |
| `A2-1-JOB` after a **fresh** active-job read | STILL_RUNNING | UNKNOWN | EFFECT_CONFIRMED: runtime/fixtures active or issued | EVIDENCE_INSUFFICIENT for final result | CLEANUP_UNKNOWN | KEEP_OBSERVING |
| Same parent with **no fresh read retained** | UNCERTAIN | UNKNOWN | EFFECT_CONFIRMED | EVIDENCE_INSUFFICIENT | CLEANUP_UNKNOWN | KEEP_OBSERVING to query; BLOCK affected repetition meanwhile |

The last two rows are alternative observation conditions for the same operation, never two simultaneous lifecycle classifications. The fresh-read row is a counterfactual application, not an invented historical poll. V2 supplies both decisions without redefining FAILURE as process termination or CONFIRMED_DONE as success.

### POST-HOC RECONCILIATION EVIDENCE and current vectors

Profiles V-EXT/V-LOG/V-ZIP/V-REPO apply as identified below. All actions retain D1/D2 owners; first cleanup remains unacknowledged/UNKNOWN rather than asserted not emitted.

| Logical records | Lifecycle | Outcome | Effect | Evidence | Cleanup | Safe next action |
| --- | --- | --- | --- | --- | --- | --- |
| `A2-1-WF`, `A2-1-JOB`, `A2-1-RUNTIME` | CONFIRMED_DONE | CANCELLED | EFFECT_CONFIRMED: commands/runtime/fixtures/partial outputs occurred | EVIDENCE_VERIFIED for terminal cancellation and partial provenance | CLEANUP_UNKNOWN | RECONCILE_EFFECT; no automatic retry |
| `A2-1-GATE` | CONFIRMED_DONE | SUCCESS | EFFECT_CONFIRMED | EVIDENCE_VERIFIED: eight zero-exit receipts/logs | CLEANUP_NOT_APPLICABLE to application cleanup | REUSE_RESULT only for this attempt's commands |
| `A2-1-ASSERT` | CONFIRMED_DONE | FAILURE | EFFECT_CONFIRMED | EVIDENCE_VERIFIED for the observed error; this is not complete matrix evidence | CLEANUP_NOT_APPLICABLE to assertion task | RECONCILE_EFFECT |
| `A2-1-PROCESS` | UNCERTAIN | UNKNOWN | EFFECT_CONFIRMED: browser used | EVIDENCE_INSUFFICIENT for a normal exit; runner later logged termination | CLEANUP_UNKNOWN | RECONCILE_EFFECT; BLOCK clean-process/application claims |
| `A2-1-FIXTURE` | CONFIRMED_DONE for fixture creation only | SUCCESS | EFFECT_CONFIRMED: two identities/roots initialized | EVIDENCE_VERIFIED for startup; no final root-removal proof | CLEANUP_UNKNOWN | RECONCILE_EFFECT; no reuse of those roots |
| `A2-1-CLEAN` | UNCERTAIN | UNKNOWN | EFFECT_UNKNOWN | EVIDENCE_INSUFFICIENT | CLEANUP_UNKNOWN | BLOCK cleanup-complete claim and affected namespace reuse; PC disposition required |
| `A2-1-CUSTODY` | CONFIRMED_DONE | SUCCESS | NO_EFFECT_CONFIRMED on protected refs | EVIDENCE_VERIFIED | CLEANUP_NOT_APPLICABLE | REUSE_RESULT as custody only |
| `A2-1-EVALUATE` | CONFIRMED_DONE | FAILURE | NO_EFFECT_CONFIRMED on product | EVIDENCE_VERIFIED: missing final-status caused nonzero evaluation | CLEANUP_NOT_APPLICABLE | RECONCILE_EFFECT; do not recast as missing execution |
| `A2-1-UPLOAD` | CONFIRMED_DONE | SUCCESS | EFFECT_CONFIRMED | EVIDENCE_VERIFIED for a deliberately limited partial artifact | CLEANUP_NOT_APPLICABLE; retention separate | REUSE_RESULT for diagnostics, not acceptance |
| `A2-2-WF`, `A2-2-JOB`, `A2-2-RUNTIME` | CONFIRMED_DONE | SUCCESS | EFFECT_CONFIRMED | EVIDENCE_VERIFIED for completed evidence-production record | CLEANUP_CONFIRMED for recorded roots/children | REUSE_RESULT within the historical evidence-production authority |
| `A2-2-GATE`, `A2-2-ASSERT`, `A2-2-PROCESS`, `A2-2-FIXTURE`, `A2-2-EVALUATE` | CONFIRMED_DONE | SUCCESS | EFFECT_CONFIRMED for executed task/recorded process or fixture; evaluation did not mutate product | EVIDENCE_VERIFIED for these bounded execution facts, not a newly repeated acceptance review | CLEANUP_CONFIRMED where runtime owns cleanup; otherwise CLEANUP_NOT_APPLICABLE | REUSE_RESULT with exact D2 lineage |
| `A2-2-CLEAN` | CONFIRMED_DONE | SUCCESS | EFFECT_CONFIRMED | EVIDENCE_VERIFIED: two removed roots; fixture/empty-fixture/browser exit 0, two Vite exits 143 | CLEANUP_CONFIRMED for named roots/children | REUSE_RESULT for this attempt alone |
| `A2-2-CUSTODY` | CONFIRMED_DONE | SUCCESS | NO_EFFECT_CONFIRMED on protected refs | EVIDENCE_VERIFIED | CLEANUP_NOT_APPLICABLE | REUSE_RESULT |
| `A2-2-UPLOAD` | CONFIRMED_DONE | SUCCESS | EFFECT_CONFIRMED | EVIDENCE_VERIFIED for publication/metadata; whole ZIP not rehashed in A2 | CLEANUP_NOT_APPLICABLE | REUSE_RESULT for artifact identity; inspect contents before any new sufficiency decision |

In rows with different cleanup applicability, the named assertion/gate/evaluation has CLEANUP_NOT_APPLICABLE; fixture/process/runtime has the stated cleanup obligation. These are separate records. A successful evaluation's effect is its output decision, not a product write. No aggregate status is inherited by a different operation.

The original partial ZIP **12765521243** is **92,118 bytes**, SHA-256 `5cab67ae64fe7b2c8ca5258e933dfc438a618612a2a1c95a95177c861b73b305`: CRC and **42/42** manifest entries reverified. `fixture-cleanup.json`, `final-status.json`, `browser-exit.json` and complete final Workspace snapshots are absent. Missing files establish insufficiency, **not** nonemission of cleanup. Its durable repository copy remains [DEPLOY-005_ATTEMPT-1.zip](../validations/RUN-025/DEPLOY-005/DEPLOY-005_ATTEMPT-1.zip).

Cancellation at `19:38:47`, orphan termination logs at `19:38:52` and terminal run metadata `updated_at=19:38:55Z` support external execution closure and runner-level termination activity. They do not prove graceful application shutdown, deletion, rollback or compensation. The specific browser-harness process exit remains unproved even though terminal parent/runner state is known. Replacement evidence completed first (`updated_at=19:02:54Z`), artifact **12763235984**, **5,916,756 bytes**, digest `a0ead6b9440652ffd71966739548a5c98d437ee9577b4a5125ccf0762af8b829`.

**RECOVERY DECISION:** a justified corrected replacement is possible only after v2 §§11–12 fields are satisfied: current need/delta, exact candidate, isolation/output namespaces, bounded cost/deadline, current concurrency delegation and closers for **both** runs. Its success leaves D1's cleanup/evidence/retention duties assigned. DEPLOY-005 or a PC-appointed successor must disposition that residual unknown; no application cleanup is retroactively invented. Root isolation permits separate complete D2 evidence to remain usable while D1 cleanup remains blocked.

## 5. A3 — DEV-008: durable candidate, unknown local operations

### Identity records

All records below use context DEV. Parent is NONE except cleanup, whose parent is `A3-RUNTIME`. The list includes possible/uncompleted operations to reconcile; it does **not** assert every one had been emitted at interruption. An explicit lost-ID/unknown condition is retained rather than supplying fictional local IDs.

| logical_operation_id | Purpose / intended effect | Type | External operation ID | Emission channel | Effect/output namespace |
| --- | --- | --- | --- | --- | --- |
| `A3-CANDIDATE` | Publish exact implementation candidate | Git publication | Candidate SHA and product ref | Git publication; exact initial acknowledgement time UNKNOWN | `feature/workspace-run-026` |
| `A3-GATE` | Two installs/six-command validation | Local command batch | UNKNOWN: executor-local IDs/receipts at boundary absent | Local executor subprocesses | Checkout, logs and native-test fixture state UNKNOWN at H3 |
| `A3-CHROMIUM` | Theme matrix | Local browser execution | UNKNOWN | Local browser harness | Chromium evidence/fixtures |
| `A3-F04` | Retained F04 matrix | Local browser execution | UNKNOWN | Local browser harness | F04 evidence/fixtures |
| `A3-FIREFOX` | Complete Firefox rerun | Local browser execution | UNKNOWN | Native Firefox/harness | Firefox process, evidence and fixtures |
| `A3-RUNTIME` | Host disposable Services/fixtures | Local runtime process group | UNKNOWN | Local executor/API | Exact live roots/processes at interruption UNKNOWN |
| `A3-CLEAN` | Close owned runtime/remove disposable state | Application cleanup | UNKNOWN | Local signals/API/filesystem | `A3-RUNTIME` effects |
| `A3-BUILD-ARCHIVE` | Assemble final evidence archive | Local packaging operation | UNKNOWN | Local executor/filesystem | Final ZIP/manifest staging location at H3 UNKNOWN |
| `A3-PUBLISH-EVIDENCE` | Publish durable ZIP and metadata | Control publication | Final control revision known only later | Git/control publication; in-flight request state at H3 UNKNOWN | `validations/RUN-026/DEV-008/` |
| `A3-PUBLISH-REPORT` | Publish final implementation report | Control publication | Final control revision known only later | Git/control publication; in-flight request state at H3 UNKNOWN | `implementations/RUN-026_IMPLEMENTATION_REPORT.md` |
| `A3-RETURN` | Deliver terminal envelope to PC-002 | Terminal delivery | No external message ID retained | Conversation return attested by PC, exact event time UNKNOWN | DEV-008 → PC-002 return |

Observation profile H3 controls the following historical vectors. UI-reported completion is not final raw evidence. Candidate continuity is a remote effect independently observed by PC; an unknown original push acknowledgement does not erase the verified published result.

| Record at H3 | Lifecycle | Outcome | Effect | Evidence | Cleanup | Emission/acknowledgement | Safe next action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `A3-CANDIDATE` | CONFIRMED_DONE | SUCCESS for publication | EFFECT_CONFIRMED | EVIDENCE_VERIFIED for exact remote identity, not product acceptance | CLEANUP_NOT_APPLICABLE | UNKNOWN for original request acknowledgement; publication independently reconciled through remote verification | REUSE_RESULT: verify and retain candidate, no reimplementation/repush needed |
| `A3-GATE`, `A3-CHROMIUM`, `A3-F04` | UNCERTAIN | UNKNOWN for reusable execution proof; UI claimed completion | EFFECT_UNKNOWN beyond UI claims | EVIDENCE_INSUFFICIENT at boundary | CLEANUP_UNKNOWN for any owned transient state | UNKNOWN | RECONCILE_EFFECT by surviving receipts/process observation; BLOCK affected blind rerun |
| `A3-FIREFOX`, `A3-RUNTIME`, `A3-BUILD-ARCHIVE` | UNCERTAIN | UNKNOWN | POSSIBLE_EFFECT | UNKNOWN | CLEANUP_UNKNOWN | UNKNOWN | KEEP_OBSERVING where queryable; BLOCK affected repeat/mutation if material uncertainty remains |
| `A3-CLEAN` | UNCERTAIN | UNKNOWN | EFFECT_UNKNOWN | UNKNOWN | CLEANUP_UNKNOWN | UNKNOWN | RECONCILE_EFFECT; do not declare clean shutdown |
| `A3-PUBLISH-EVIDENCE`, `A3-PUBLISH-REPORT` | UNCERTAIN | UNKNOWN | POSSIBLE_EFFECT: pending/unacknowledged publication cannot be excluded | EVIDENCE_INSUFFICIENT for final delivery at H3 | CLEANUP_NOT_APPLICABLE to control publication | UNKNOWN | RECONCILE_EFFECT: read current control/destination before a conditional write |
| `A3-RETURN` | UNCERTAIN as to emission record; no terminal return available at H3 | UNKNOWN | EFFECT_UNKNOWN | EVIDENCE_INSUFFICIENT for delivered return | CLEANUP_NOT_APPLICABLE | UNKNOWN | RECONCILE_EFFECT, then return actual completion or blocker |

**OBSERVED EVIDENCE:** S3 preserves direct Owner UI evidence of the usage-limit interruption. At that observation PC verified control `b3b066bf0c34a42d6e7880806ffacaf93ac598e7`, baseline `dd968ba05e579461962bbcced0e9cae3cd4c3d23`, candidate `e11579950ef7ed20e4b6eeee88f9c3597c1f074b`, main unchanged and final report absent. V-HIST independently confirms candidate's sole parent is that baseline; the historical control tree contains neither the final implementation report nor DEV-008 evidence directory. File absence is a tree fact, not proof a publication request was never issued.

UI-only interim claims: six commands passed, Service 1088 pass/zero fail, Chromium complete, F04 assembled, Firefox finishing and final delivery pending. The later PC record preserves those claims, not a process inventory or exact command-exit checkpoint.

**INFERENCE:** a read-only recovery could safely verify candidate/control and inspect surviving local state under existing authority. **PLAUSIBLE HYPOTHESIS:** one or more browser, packaging, cleanup or publication operations remained active/unacknowledged. Which ones, their IDs and exact effect state are not recoverable; they remain UNKNOWN/UNCERTAIN rather than asserted in-flight facts.

**RECOVERY DECISION:** “Continúa” initiates v2 §10 reconciliation first. Required before an affected stateful retry/mutation: current compatible authority/assignment; exact product/control/harness or explicit lost-ID record; emission/ack reconciliation; fresh lifecycle observation where available; effect/output namespace and cleanup/isolation; remaining need; bounded resource/deadline rationale; sufficient delegation and original/replacement closers. Missing material fields block the affected action. Checking immutable Git state, cataloguing evidence and other demonstrably nonconflicting authorized reads may continue; they do not release the browser/fixture or publication write block.

### POST-HOC RECONCILIATION EVIDENCE

S3 records same DEV-008/S01 continuation after Owner's sole “Continúa”, final report/evidence publication at `6e9f503ed0e05016de50da5630cdeaeb6948725e`, unchanged candidate, no second product implementation commit and proactive terminal return. Thus `A3-PUBLISH-EVIDENCE` and `A3-PUBLISH-REPORT` become **CONFIRMED_DONE / SUCCESS / EFFECT_CONFIRMED / EVIDENCE_VERIFIED for publication and attribution / CLEANUP_NOT_APPLICABLE** under V-REPO/S3/S4. Their exact original emission/acknowledgement times remain UNKNOWN; later remote objects reconcile the publication effect, not an unrecorded request history. `A3-RETURN` is **CONFIRMED_DONE / SUCCESS / EFFECT_CONFIRMED / EVIDENCE_VERIFIED as PC's durable delivery observation / CLEANUP_NOT_APPLICABLE**; exact return timestamp and message ID UNKNOWN. These results are reusable within their stated purposes.

Final raw validation evidence later became available through DEPLOY-006 and successor QA. That supports reuse of the **delivered evidence subject** when independently verified; it does not identify or close every executor-local process from H3. The original operation IDs, precise issue/exit/ack times, surviving dirty state, cleanup progress and causal relation of any rerun to the interruption remain unknown. Their local-operation reconciliation is not retrospectively declared complete. Accepted final data is not proof that a potentially active original process was observed before continuation.

The historical event proved **functional/outcome continuity only**, not a formal pre-mutation Recovery Gate and not S01→S02 rollover. The missing proof is exactly the durable checkpoint v2 now requires: operation records and current observations/effects/cleanup/decisions before the next affected write. The procedure can safely handle the gap by BLOCK without reconstructing unavailable telemetry. DEV-008 retains original duties until PC records handover; no additional Owner prompt is needed merely to inspect under existing authority.

## 6. A4 — DQA-005 → DEPLOY-006: boundary test

**Boundary result: ADJACENT / SUPPORTING EVIDENCE.** Ordinary inability to access the binary ZIP is not an execution interruption. DQA-005 issued a normal terminal INCONCLUSIVE decision; no issued product/transport operation was shown to have lost its state/effect through interruption. Under v2 §§1 and 7, this event remains evidence-management/QA work. If a future issued upload/transport itself loses acknowledgement or has uncertain effect, that particular operation could trigger the gate; that condition is not inferred here.

The following records make the boundary explicit. Their state axes are diagnostic application of the same vocabulary, not a claim that ordinary evidence access met the trigger. QA5/TR/DEV contexts supply authority, owner, revisions and namespaces. Parent NONE unless shown.

| logical_operation_id / parent | Purpose / type | External ID; emission channel | Observed dimensions / safe next action |
| --- | --- | --- | --- |
| `A4-SOURCE` / NONE, DEV context | Publish original archive and metadata / control publication | Source control `6e9f503ed0e05016de50da5630cdeaeb6948725e`; Git publication, exact initial acknowledgement time UNKNOWN | At H4: CONFIRMED_DONE; SUCCESS for source existence; EFFECT_CONFIRMED; EVIDENCE_AVAILABLE_UNVERIFIED as raw archive to that reviewer; CLEANUP_NOT_APPLICABLE. REUSE_RESULT as exact source identity, not raw integrity or QA credit. |
| `A4-QA5-ACCESS` / NONE, QA5 context | Retrieve/examine archive / read-and-inspect task | Individual access request IDs/times UNKNOWN; GitHub text/blob access channels recorded in QA report | At H4: failed access attempts were reported, but the full raw-inspection operation remained UNCERTAIN; outcome PARTIAL; effect NO_EFFECT_CONFIRMED on product; EVIDENCE_INACCESSIBLE; CLEANUP_NOT_APPLICABLE; emission acknowledgement UNKNOWN at per-request level. RECONCILE_EFFECT through the ordinary evidence route, not an interruption recovery claim. |
| `A4-QA5-REPORT` / NONE, QA5 context | Publish bounded QA assessment / report publication | Report revision `cbce21789c8a1ef5496041b0c1cc0a6d03ddd3af`; control publication | CONFIRMED_DONE; SUCCESS for completed report publication, **acceptance verdict remains INCONCLUSIVE**; EFFECT_CONFIRMED; EVIDENCE_VERIFIED for that decision record; CLEANUP_NOT_APPLICABLE. REUSE_RESULT as historical disposition; no inherited QA PASS. |
| `A4-TR-WF` / NONE, TR context | Transport existing bytes / workflow | run `40742109392`; watched operational push → Actions | Later V-EXT/S4: CONFIRMED_DONE; SUCCESS; EFFECT_CONFIRMED; EVIDENCE_VERIFIED for terminal transport status; CLEANUP_UNKNOWN for disposal of owned temporary extraction state; EMITTED_ACKNOWLEDGED server-side. REUSE_RESULT for transport result, not acceptance or clean-substrate reuse. |
| `A4-TR-JOB` / `A4-TR-WF`, TR context | Execute transport job / external job | job `123006143442`; Actions scheduler | Same bounded vector as WF; distinct lifecycle record. |
| `A4-TR-VERIFY` / `A4-TR-JOB`, TR context | Extract/hash original bytes / integrity task | Runner verification receipt; harness process/filesystem | Later S4 receipt: CONFIRMED_DONE; SUCCESS; EFFECT_CONFIRMED in extraction/verification output namespace; EVIDENCE_VERIFIED for inspected receipt, underlying bytes not independently rehashed in A2; CLEANUP_UNKNOWN for eventual temporary-tree disposal; emission acknowledgement UNKNOWN for the individual local request. REUSE_RESULT with receipt provenance/limits; no clean-substrate claim. |
| `A4-TR-RAW-UPLOAD` / `A4-TR-JOB`, TR context | Publish original ZIP/raw tree / artifact upload | artifact `12838688889`; upload-artifact | Later V-EXT: CONFIRMED_DONE; SUCCESS; EFFECT_CONFIRMED; EVIDENCE_VERIFIED for upload/identity only; CLEANUP_NOT_APPLICABLE, retention material; EMITTED_ACKNOWLEDGED. REUSE_RESULT for upload, not proof of retrieval. |
| `A4-TR-COMPANION` / `A4-TR-JOB`, TR context | Publish external artifact identity receipt / artifact upload | artifact `12839302886`; upload-artifact | Same upload vector, separate output namespace/digest and lifecycle. |
| `A4-TR-RETRIEVE` / NONE, TR context | Materialize actual uploaded bytes / retrieval/integrity task | Retrieval receipt, download API→local materialization; exact initial request acknowledgement time UNKNOWN | Later S4 receipt: CONFIRMED_DONE; SUCCESS; EFFECT_CONFIRMED; EVIDENCE_VERIFIED for receipt/candidate attribution; CLEANUP_UNKNOWN for eventual retained-local-copy disposal; emission acknowledgement UNKNOWN for the initial request. REUSE_RESULT as demonstrated access, not new product execution or a clean-substrate claim. |

Profiles H4 and V-REPO support the first three rows; V-EXT, V-REPO and S4's explicitly timed receipts support the transport rows. No additional product execution or fallback operation is invented. S4 explicitly reports product execution false. Local transport temporary-file disposal is UNKNOWN, not established by product nonexecution or file extraction; no ordinary retention duty is silently discharged.

**OBSERVED EVIDENCE at H4:** DQA-005 could read metadata structure and identify the existing **22,524,792-byte** ZIP, blob `ae3f9f080d329ae5ca7e1483fe5797ef5bdefe0d`, expected SHA-256 `7bf9ef2fcaa8284457234b6fcfff229b98650955f19af644b6b17d9f91ba8d3c`, 186 manifest members and 92 inventory paths, but could not independently inspect raw bytes. Inaccessibility did not establish corruption, absent execution, product defect or deficient QA behavior.

**RECOVERY DECISION:** preserve candidate/source; use existing evidence transport authority. Product rerun remains unneeded and blocked unless the explicitly authorized fallback conditions—failed integrity, material incompleteness or documented inability to transport—are demonstrated. This decision belongs to evidence management, not a broadened interruption label. Transport plus retrieval receipts are preferred to repeating tests because they cure the observed blocker while preserving the exact acceptance subject.

### POST-HOC RECONCILIATION EVIDENCE

Runner verification occurred `2026-10-28T18:07:12.872361+00:00`–`18:07:15.855001+00:00`; it correctly left retrieval pending. Raw artifact **12838688889** is **80,983,126 bytes**, digest `de8e9a82744e04fad9153b1ba4ea65f4a6ed71cf3f0e318e41e75ab4f9030c08`. Companion **12839302886** is **994 bytes**, digest `c590b1db3c9350b4cfef6a467290e8e21e161b09548c18265d0f5dd6448beac1`. Current metadata reports both unexpired, retention expiry `2027-01-26T18:07:07Z`.

The subsequent retrieval receipt timestamp is `2026-10-28T18:08:23.225005+00:00`, with **186/186** member checks, **92** inventory entries, no member failures, exact source/candidate/harness, original-to-raw byte equality and unchanged product refs. It closes retrieval separately from upload without rewriting the earlier pending receipt. Successor DQA-006's later official adjudication remains a separate acceptance gate, not an outcome inherited from transport.

DEPLOY-006 owns transport/access closure and material retention; PC owns disposition and successor assignment; QA owns evidence sufficiency/acceptance. DQA-005 remains frozen INCONCLUSIVE. Immutable candidate identity prevented new tests/deltas from changing the subject while evidence was transported.

## 7. Decision precedence, retry conditions and scoped continuation

Applied v2 §10 in its frozen order: (1) authority/identity, (2) emission, (3) fresh observation, (4) lifecycle, (5) outcome, (6) effect, (7) evidence, (8) cleanup, (9) closer, (10) safe next action. No new lifecycle value or decision class is introduced. A named assertion task is not its hosting process; an executed failed gate is not classified CONFIRMED_NOT_DONE merely because its desired success was absent. CONFIRMED_NOT_DONE requires positive nonoccurrence/nonstart evidence for the named operation/effect; a missing report alone never supplies it.

| Proposed repeat / continuation | Remaining need / delta | Missing material conditions at historical checkpoint | Deterministic v2 decision |
| --- | --- | --- | --- |
| ENV-005 replacement | Different browser provisioning path; readiness still needed | Fresh original observation; documented reason waiting insufficient; bounded concurrency rationale/delegation and original/replacement closure record | KEEP_OBSERVING, then BLOCK unexplained launch. RETRY_JUSTIFIED only if the separate exception is actually established. |
| DEPLOY-005 replacement | Correct empty-state route to meet frozen matrix | Fresh original observation; explicit effect/namespace/cleanup isolation; waiting rationale, bounded concurrency/delegation and both closers | KEEP_OBSERVING / RECONCILE_EFFECT; BLOCK automatic emission. Corrected delta does not close original. |
| DEV-008 local stateful rerun | Need cannot be established from UI progress alone | Exact IDs or lost-ID condition, surviving state/effects, fresh observation, cleanup/isolation and remaining need | RECONCILE_EFFECT; BLOCK affected repeat while unknown. No duplicate product implementation required. |
| DEV-008 independent reads | Recover authority/candidate, inspect immutable evidence | None when genuinely read-only, authorized and nonconflicting | Continue within authority while preserving affected write/retry block. “Continúa” grants no extra mutation or parallel authority. |
| DEV-008 final publication | Deliver missing report/evidence | In-flight write and current destination/head must first reconcile | Read/reconcile first, then use existing publication authority and expected-head protection if safe; otherwise BLOCK affected write. |
| DQA evidence transport | Existing bytes inaccessible to reviewer | Separate transport authority was required and supplied | Ordinary evidence route; reuse source after verification. No product rerun solely for inaccessible bytes. |

No row claims historical RETRY_JUSTIFIED when its material fields were not preserved. No cancellation permission is inferred from model status. A successful substitute is never the authority or closure condition for its original. Scoped continuation is useful precisely because an unresolved disposable namespace need not freeze nonconflicting immutable-state inspection or invalidate separately verified isolated evidence.

## 8. Measurement and proportionality

The ledger contains **58 logical records**: 16 A1, 22 A2, 11 A3 and 9 A4. Identical child contexts are referenced, not copied. The tables retain separate decisions for operations whose state differs. This is a historical evaluation record, not a requirement for 58 fresh Owner prompts or atomizing every UI action. In a live bounded experiment only materially external/stateful emissions and independently changing child/cleanup/publication obligations need records. Existing runner receipts can populate fields; missing material retry facts enforce a block rather than administrative invention.

| Measurement | A1 | A2 | A3 | A4 |
| --- | --- | --- | --- | --- |
| Checks required | Authority/identity, original status, child provisioning, exception, evidence, cleanup, closer/retention | Same plus task/process/parent distinction and corrected-route delta | Durable candidate/control; local issued-operation/lost-ID inventory; evidence/publication/cleanup reconciliation | Source identity/integrity, actual retrieval, candidate custody and successor evidence route |
| External objects inspected | 2 runs, 2 jobs, 2 artifact registrations; original retained ZIP reverified | 2 runs, 2 jobs, 2 artifact registrations; partial retained ZIP reverified; source orchestration read | 1 candidate/ref publication and final control delivery; historical control tree; identifiable local validation-job count UNKNOWN | 1 run, 1 job, 2 artifacts, runner/retrieval receipts; full binary not redownloaded |
| Duplication prevented | Unjustified automatic overlap, not all justified alternative-channel experiments | Unjustified automatic overlap; corrected harness may still need authorized execution | Blind reimplementation/repush and unknown local repeats; actual interruption-caused rerun count UNKNOWN | Immediate product rerun merely to fix access; historical transport already avoided it |
| Unsafe assumptions avoided | Old in-progress = current; slow provisioning = failure; alternate result closes original | Timeout known at launch; task error = process exit/parent termination; runner kill = cleanup | Same session/final success = formal recovery; missing path = never emitted | Upload = retrieval; inaccessible = corrupt/product failure; transport READY = QA PASS |
| Owner prompts | 0 for read-only observation; separate exception request only if delegation insufficient | Same; no automatic cancellation authority | 1 historical “Continúa”; no additional prompt for existing-authority recovery; missing facts may force blocker return | Ordinary authorized transport/successor route; prompt count not established |
| Safe reuse | Exact candidate, selected readiness, attributed late alternate | Exact custody/command facts, partial diagnostics, independent D2 evidence within its limits | Published candidate and later verified delivery; not unknown local process state | Existing original evidence after transport verification; no inherited acceptance verdict |
| State still requiring observation/block | Missing historical fresh poll; late retention/owner disposition | Unknown original cleanup/normal process exit; block same namespace reuse | Unknown executor-local IDs/exit/effects/cleanup and causality | Ordinary retention/access concerns; no interruption trigger proved |
| Cleanup/closure | Root-removal receipts supported; no global graceful-descendant proof; ENV-005/PC successor | D1 external terminal but application cleanup unknown; D2 receipt independent; DEPLOY-005/PC successor | DEV-008 duties persist until recorded handover; missing historical checkpoint remains | DEPLOY-006 transport/retention; PC coordination; QA sufficiency |
| Inherited vs non-inherited | Gate A raw bytes and S1 provenance inherited/rechecked; no historical live poll inherited | Partial diagnostics inherited/rechecked; no missing cleanup or full original matrix inherited | Durable authority/candidate inherited; executor-local telemetry not inherited | Source bytes/provenance chain inherited; QA decision not inherited through upload |
| Stale-context/baseline error | None demonstrated; current integration not historical baseline | None demonstrated; harness SHA distinct from candidate | None observed; isolated correct baseline retained | None demonstrated; immutable source/candidate preserved |
| Administrative overhead | Compact two-attempt ledger + fresh status and late closure | Moderate, justified by divergent process/parent/cleanup states | Low if emission ledger exists, otherwise reconstruction expensive and incomplete | Existing evidence-management overhead; should not be charged as interruption ceremony |

Time savings and actual historical recovery duration are not measurable from this record. Run-creation separations are 8m36s (A1) and 66s (A2), not recovery durations or saved compute estimates. Gate A2 launched/retried/cancelled **zero** external operations, made **zero** product mutations and needed **zero** additional Owner prompts. Only A3 has direct usage-limit evidence; no quota/model cause is assigned to A1/A2/A4.

## 9. Mandatory validation questions

| # | Question / finding |
| --- | --- |
| 1 | **Deterministic safe decisions without redefining terms? YES.** Missing fresh historical polls produce UNCERTAIN; an actual fresh active-job read would produce STILL_RUNNING; both block unexplained repeats. No unrecorded poll is invented. |
| 2 | **Automatic retry while parent STILL_RUNNING prevented? YES.** KEEP_OBSERVING is the default; replacement requires all explicit exception fields and authority. |
| 3 | **Automatic repeat of materially stateful UNCERTAIN work prevented? YES.** Observation/reconciliation precedes any affected write; unresolved material effects/lost IDs block blind retry. |
| 4 | **CONFIRMED_DONE separated from SUCCESS? YES.** Original DEPLOY parent is DONE+CANCELLED; failed assertion/evaluation are DONE+FAILURE; successful partial upload does not supply complete acceptance evidence. |
| 5 | **Parent/child hierarchy resolves DEPLOY ambiguity? YES.** Assertion rejection, process exit and workflow terminality have different IDs/records. A failed task and freshly observed active parent coexist without conflict. |
| 6 | **Missing material emission/retry fields lead safely to observation/reconciliation/BLOCK? YES.** A1/A2 lack complete launch-time records; A3 lacks local telemetry. No missing field is filled from later success. |
| 7 | **Replacement exception preserves original responsibility? YES.** Both closers are required before justified concurrent work; original remains open across effect/evidence/cleanup/retention obligations. |
| 8 | **Late closure remains assigned after substitute success? YES.** ENV-005 and DEPLOY-005 retain original duties; PC assigns successor if unavailable. Reported substitute success is not closure or cancellation. |
| 9 | **Safe unrelated work can continue? YES.** Authorized nonconflicting reads and separately isolated evidence remain usable while affected namespaces/writes stay blocked. This grants no new action authority. |
| 10 | **Ordinary evidence access outside trigger? YES.** A4 is ADJACENT / SUPPORTING EVIDENCE. Only an actually uncertain issued transport operation would bring that operation inside the gate. |
| 11 | **Record proportionate? YES for materially stateful/external work.** Shared identity contexts and existing receipts limit duplication; no need to apply ceremony to clean pauses or every read. Historical reconstruction length is not required live prompting overhead. Cost magnitude remains unmeasured. |
| 12 | **Further v2 rule revision required before considering a live controlled experiment? NO remaining material correction is forced by these cases.** Missing historical telemetry remains an evidence limit handled by the written model. Experimental substrate, scope, bound, observer/closer and authority must still be frozen by a separately authorized Gate B; that is implementation of a future experiment, not an amendment made here. |

The predecessor's five deficiencies are addressed by v2 §§2–5 and 15 (identity/freshness/hierarchy), §§6–11 (separate dimensions/emission/retry), §§12–13 (parallel exception/late closure), and §§7/14 (evidence boundary/scoped continuation). This revalidation does not add a new threshold, label or implicit permission to make a case pass. Safe UNCERTAIN/BLOCK is expressly an acceptable deterministic result in v2 §15.

## 10. Terminal disposition and return

The best-supported next action is PC-002 consumption of this report, followed only if separately authorized by preparation/execution of Gate B with disposable bounded state and actual emission/observation receipts. Avoid automatic reruns based on silence, child errors or another attempt's success. The highest-impact future evidence is a real lost-observation reconciliation demonstrating that effects occur at most once; the historical replay has not established that live property.

### Publication preflight: existing output recovered

Before creating any remote Git object or moving a ref, PP-002 re-read the live control head. It had advanced to `538cab04ea8964a671fc1cc7286944538d8a5a9a`, a direct child of the consumed input. The independently read compare shows exactly one added path: this mission's required output. That existing FROZEN report, blob `b7ef2728a449e27bf2986aefe6b288bcb919e620`, declares the same input control, role/instance, experiment, gate and PASS result. Its entire text was read. It is a different document from this detailed local revalidation; agreeing verdicts do not make their contents identical or authorize replacing frozen bytes.

The authorization, procedure v2, route and Generic Protocol blobs were re-read at that new head and remain unchanged. No actor identity, duplicate request cause or lost acknowledgement is inferred from the existence of the publication.

[Concurrent Publication Policy](CONCURRENT_PUBLICATION_POLICY.md), Material conflict: **“STOP and route to PROJECT_CONTROL if: … the intended output path already exists unexpectedly.”** That exact condition applies. Publication of this local report is therefore BLOCKED; no create-tree, create-commit, update-ref, overwrite, alternative-path publication or historical edit was performed by this execution. The policy's additive-on-latest-head rule does not authorize overwriting an unexpectedly occupied output path.

PC-002 receives the existing exact publication and this completed local revalidation for reconciliation. The analysis result remains PASS, separately from publication status. PC may consume the existing report, or provide a separately authorized successor path/version if it needs this more detailed ledger published. This is a normal publication-concurrency disposition, not a newly authorized live recovery experiment, Gate B execution or protocol change.

**YU3DOH RETURN ENVELOPE**

SOURCE ROLE / INSTANCE: PROTOCOL_PORTABILITY / PP-002  
TARGET ROLE / INSTANCE: PROJECT_CONTROL / PC-002  
CONTROL INPUT SHA: `f284e26d91364a4555e0cebba24cf76f74eb261f`  
MODE: READ-ONLY REVISED HISTORICAL REVALIDATION  
EXPERIMENT: PP-002 — Execution Interruption Recovery Pilot  
ACTIVE GATE: A2  
RESULT: PASS  
PREDECESSOR: GATE A / REVISE, preserved unchanged  
PROCEDURE: `control/PP-002_EXECUTION_INTERRUPTION_RECOVERY_PILOT-v2.md`  
PRIMARY OUTPUT: `protocols/PP-002_GATE-A2_REVISED_HISTORICAL_REVALIDATION.md`  
PUBLICATION STATUS: STOPPED / REQUIRED OUTPUT PATH ALREADY EXISTS  
EXISTING PUBLICATION SHA: `538cab04ea8964a671fc1cc7286944538d8a5a9a`  
EXISTING REPORT BLOB: `b7ef2728a449e27bf2986aefe6b288bcb919e620`  
EXISTING REPORT RESULT: PASS; same consumed input/mission, independently read, not authored by this execution  
LOCAL REVALIDATION: complete / PASS, retained separately for PC reconciliation; not published over frozen output  
REMOTE COMMITS / REF UPDATES BY THIS EXECUTION: NONE  
PRODUCT BASELINE REFERENCE: `feature/workspace-v0.1 @ e11579950ef7ed20e4b6eeee88f9c3597c1f074b`  
EXACT CANDIDATE REFERENCE: `feature/workspace-run-026 @ e11579950ef7ed20e4b6eeee88f9c3597c1f074b`  
MAIN: `54cc3aad246c89a29f2a18be63c539db68cae041`  
MODEL REDESIGN / EXPERIMENTAL PROCEDURE EDIT: NONE  
PRODUCT MUTATION / PRODUCT REF MOVEMENT: NONE  
ACTIONS LAUNCH / RERUN / CANCEL: NONE  
HISTORICAL REPORT MODIFICATION: NONE  
GENERIC PROTOCOL v1.0: FROZEN / UNCHANGED  
RECOVERY GATE: PROPOSED / NOT ADOPTED  
A4 BOUNDARY: ADJACENT / SUPPORTING EVIDENCE  
HISTORICAL LIMITS: no preserved fresh launch-time polls; original DEPLOY application cleanup unknown; DEV executor-local telemetry unavailable; no formal historical recovery checkpoint  
NEXT ACTION: PC-002 reconciles the existing publication and this local revalidation before its Gate A2 disposition; no Gate B authority is granted here  
GATE B: NOT AUTHORIZED  
GATE C: NOT AUTHORIZED  
PROTOCOL SUCCESSOR / ADOPTION: NOT AUTHORIZED  
AUTO-RETURN: terminal result returned proactively  
RETURN: PROTOCOL_PORTABILITY / PP-002 → PROJECT_CONTROL / PC-002

GATE A2 PASS