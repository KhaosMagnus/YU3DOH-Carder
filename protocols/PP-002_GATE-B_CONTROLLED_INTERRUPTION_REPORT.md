---
artifact_id: PP-002-GATE-B-CONTROLLED-INTERRUPTION-REPORT
artifact_type: live_controlled_recovery_experiment
status: FROZEN
protocol_version: "1.0"
source_role: PROTOCOL_PORTABILITY
source_instance: PP-002
execution_session: S01
target_role: PROJECT_CONTROL
target_instance: PC-002
control_input_sha: 2d22969421bfe92d283bae0202c0aa3764105a2c
activation_publication_revision: f0359a46ea16803b53d62415df112db679919d28
operational_branch: ops/pp-002-gate-b-actions
harness_sha: dd6e8bfecadab0a83c8008ea65300b1f0ba518f8
actions_run_id: 40832621820
actions_run_attempt: 1
gate: B
result: REVISE
report_date: "2026-10-29"
product_mutation: false
product_ref_movement: false
generic_protocol_modified: false
gate_c_authorized: false
---

# PP-002 — Gate B Controlled Interruption Report

**Result: REVISE.** The live scenarios demonstrated the required recovery decisions, zero duplicate effects and explicit cleanup. The observer's intermediate ledger nevertheless copied planned states into an emitted-state snapshot, creating at least five false lifecycle/acknowledgement claims. It also mislabeled snapshot assembly time as external-observation time. Those bookkeeping defects must be corrected before another live gate. They were discovered, preserved and corrected through a new append-only evidence artifact; no historical record was overwritten.

The result is not caused by B3's intentional failure. That child was required to fail. The experiment remained bounded: one workflow, three jobs, three distinct logical markers, four artifacts, no retry/replacement/cancellation and no product execution. All emitted jobs are terminal and all three owned disposable roots have explicit removal receipts.

## 1. Authority and custody

Consumed exact control `2d22969421bfe92d283bae0202c0aa3764105a2c` and read:

- [Owner approval](../control/PP-002_GATE-B_OWNER_APPROVAL.md), blob `908c9b6ba98fda9928826b9539449c3ee606b9d9`;
- [effective authorization](../control/PP-002_GATE-B_AUTHORIZATION.md), blob `357a1a2b37cb86334a1bdb90e2ccf7fd676a1e6e`;
- [route](../routing/ROUTE-PP-002-GATE-B.md), blob `0bb83904bb28507a8f3389eed064e0246e330717`;
- [v2 procedure](../control/PP-002_EXECUTION_INTERRUPTION_RECOVERY_PILOT-v2.md), [A2 PASS disposition](../runs/PP-002_GATE-A2_PASS_DISPOSITION.md), PP-002 assignment and concurrent-publication policy;
- [Generic Protocol v1.0](GENERIC_PROJECT_CONTROL_PROTOCOL-v1.0.md), unchanged blob `1ac3689c1e811d1594291afee6b2c1c6efd093d0`.

The v2 document's historical “Gate B not authorized” checkpoint was satisfied by the separately frozen effective Gate B authority; it was not edited or silently reinterpreted as self-authorization.

Preflight found the operational branch absent, zero Gate B workflow runs, no existing report/ledger and exact expected protected refs. The harness commit was created as an unreferenced object first, with only two added paths over the consumed control tree:

| Operational file | Purpose |
| --- | --- |
| `.github/workflows/pp-002-gate-b-controlled.yml` | One watched push, three independent bounded jobs, explicit evidence and cleanup steps |
| `validation/pp002-gate-b/run.py` | Standard-library-only marker, wait, intentional child failure, owned-root removal and hashed receipts |

Exact operational commit: [`dd6e8bfecadab0a83c8008ea65300b1f0ba518f8`](https://github.com/KhaosMagnus/YU3DOH-Carder/commit/dd6e8bfecadab0a83c8008ea65300b1f0ba518f8). Python AST/workflow structure checks passed before emission; no local effect experiment was substituted for Actions execution. Jobs use Ubuntu 24.04, sparse checkout of the experimental harness, read-only contents permission and no persisted checkout credential. No product code, Workspace, database or product API is used.

The [pre-emission intent](../validations/PP-002/GATE-B/000_INTENT.json) was published at `0c2102f3e50e135fd88c9f3f414a8da9893708aa` before branch creation or the workflow-emitting push. The ops branch was first created at the control commit, which contained no experimental workflow, and independently checked with zero runs. A single guarded update then moved only the ops branch to the exact harness, `force=false`, expected previous SHA equal to the consumed control. This transition, not a retry API, emitted the workflow.

## 2. Durable operation record and evidence chain

The JSON records supply logical/parent IDs, purpose/type, authority/control/harness, closer, emission/acknowledgement, effect/output namespaces, retry properties, timestamps, lifecycle/outcome/effect/evidence/cleanup and safe decisions. The 24 predeclared logical records comprise four infrastructure/parent operations, three job/effect/wait/cleanup/finalize/upload groups, and B3's failing child plus partial upload. This is a logical ledger count, not a count of API calls. Control/evidence publications additionally have exact guarded commit provenance below.

| Artifact | Immutable publication | Meaning |
| --- | --- | --- |
| [000_INTENT.json](../validations/PP-002/GATE-B/000_INTENT.json) | `0c2102f3e50e135fd88c9f3f414a8da9893708aa` | Durable pre-emission identity, namespaces, bounds and closure plan |
| [010_EMITTED.json](../validations/PP-002/GATE-B/010_EMITTED.json) | `2413ee25beedf3ada943bdcc4daa02f3557d314a` | Actual run/job IDs and raw initial state; embedded copied operation states contain the defects identified below |
| [020_OBSERVATION_LOSS.json](../validations/PP-002/GATE-B/020_OBSERVATION_LOSS.json) | `73912331677cc78d69d5ba7a41de7390e448d034` | Last fresh states, deliberate no-poll method, durable recovery entry and named closer |
| [030_RECOVERY_OBSERVATION.json](../validations/PP-002/GATE-B/030_RECOVERY_OBSERVATION.json) | `dc521d192a5ed0ee2b1e0705141d4645c694cb52` | Fresh authority/ref/ID recovery and external run/jobs/artifact observations; B2 raw verification still pending |
| [040_VERIFIED_RECOVERY_DECISIONS.json](../validations/PP-002/GATE-B/040_VERIFIED_RECOVERY_DECISIONS.json) | `e3062092cfb5bc1147fc8e55b7b6d58ae707e5f8` | Verified B2 reuse and B3 partial effect, with original bytes copied into raw evidence paths |
| [050_TERMINAL_RECONCILIATION.json](../validations/PP-002/GATE-B/050_TERMINAL_RECONCILIATION.json) | `49a035a6c82e0ae0848aa747df2a52105c19c275` | Terminal operation vectors, all four raw verifications, cleanup, protected refs, run inventory and measurements |
| [060_BOOKKEEPING_CORRECTION.json](../validations/PP-002/GATE-B/060_BOOKKEEPING_CORRECTION.json) | `76072cff8fab099714f2c185abbf5046c9fbaa63` | Exact defects, corrected interpretation of stale-state metrics/timing, required emitter fix and REVISE disposition |

The correction has precedence over the unqualified zero stale-context claim in 050. The copied operation-state array in 010 must not be consumed as a current observed ledger. Raw original observations, intermediate records and contradictory fields remain preserved for audit.

## 3. Actual chronology and observation loss

All times are UTC, 2026-10-29. Events are distinguished from observer receipt/verification timestamps.

| Time | Observed event / source |
| --- | --- |
| `06:59:40.651Z` | Intent record assembled; later published before external workflow emission |
| `07:00:03.762Z`–`07:00:05.126Z` | Workflow-emitting guarded ops update issued/acknowledged |
| `07:00:07Z` | GitHub workflow creation event |
| `07:00:15.124Z` / `07:00:15.576Z` | Initial workflow-list/job response receipt times; B1 running, B2/B3 still queued in that initial response |
| `07:00:54.604Z` | Fresh pre-loss job observation: all three jobs in progress; B3 child already failed; B2 completion still unobserved |
| `07:01:20.545Z` | Deliberate no-poll interval began after durable loss-checkpoint publication |
| `07:01:24.350Z`–`07:02:19.351Z` and `07:02:26.628Z`–`07:03:21.630Z` | Two explicit 55-second waits with zero Actions queries; a progress message between them made no new execution-state claim |
| `07:01:48Z` | B2 job completed successfully while observation was discontinued; discovered later, not known then |
| `07:03:47.052Z` | Fresh recovery observation completed after durable-input/authority/ref reads: B1 active, B2 success, B3 active with failed child |
| `07:05:16Z` | B1 job terminal success |
| `07:05:47Z` | B3 job terminal failure after explicit cleanup/final evidence; the child failure remained its only failed step |
| `07:05:51.230Z` | Observer verified all jobs terminal; workflow conclusion failure, as expected from B3 |
| `07:07:18.755586+00:00` | All downloaded archives/member manifests and cleanup receipts reverified |

The strict measured Actions-query-free wait is **at least 110 seconds**. The 146.507 seconds in 050 is onset-to-completed-recovery-observation, including final read latency; it is not asserted as an exact no-query interval. Source requests, response/observation times, record-assembly times and event times must remain separate.

Observation loss was deliberate cessation of polling within the same S01 session. No workflow was killed, cancelled, quota-exhausted or corrupted to simulate it. Recovery fetched current control/authority/protected/ops refs, re-read 000 and 020 from GitHub, recovered their exact IDs/harness, and only then queried external state. Terminal status was obtained from those new reads, not from a remembered predecessor result. This is not session rollover or Gate C.

## 4. Live scenario results

### B1 — active operation recovered

Job **123310073647** was in progress before loss and still in progress at the fresh `07:03:47.052Z` observation. The 300-second bounded hold was active; the completed marker step and later raw receipt identified one B1 effect.

Recovery classification: **STILL_RUNNING**, outcome UNKNOWN, effect confirmed for the issued marker, final cleanup still required. Safe action: **KEEP_OBSERVING**. Automatic replacement/retry was blocked; no new operation was emitted. Later terminal success and explicit root removal closed the original job without a substitute.

### B2 — completed operation with missed terminal confirmation

Job **123310073956** was in progress at the pre-loss observation and completed successfully at `07:01:48Z`, within the no-poll period. At recovery, its terminal result and artifact were discovered through durable identity. The initial recovery record conservatively used EVIDENCE_AVAILABLE_UNVERIFIED until the actual archive, manifest members, marker count and cleanup receipt were checked.

After raw verification: **CONFIRMED_DONE / SUCCESS / EFFECT_CONFIRMED / EVIDENCE_VERIFIED / CLEANUP_CONFIRMED**, safe action **REUSE_RESULT**. Exactly one B2 creation event exists, one B2 job/run attempt exists, and no repeat was emitted. The missed acknowledgement was terminal confirmation; the workflow-emitting request acknowledgement itself was not lost. The experiment does not claim to have tested an unacknowledged Git write.

### B3 — failed child and independently active parent

Job **123310073907** produced one partial marker and the child deliberately exited **23** at `07:00:12.963287+00:00`. GitHub recorded that step as completed/failure. A separate partial artifact was uploaded before the parent's 330-second active window.

At recovery, the child was **CONFIRMED_DONE + FAILURE**, while the parent job and workflow remained **STILL_RUNNING**. Partial effect and evidence were confirmed; application cleanup was **CLEANUP_REQUIRED**. The decision was **RECONCILE_EFFECT** for the child and **KEEP_OBSERVING** for its parent, with no retry. This was an actual fresh simultaneous observation, not a retrospective hypothesis.

The parent later completed with **FAILURE**, retaining the intentional child error. Its cleanup and final receipts succeeded. Explicit ownership checks, deletion and a post-deletion absence check prove removal of the disposable B3 root. Runner termination is not used as application-level cleanup proof.

| Subject | Final lifecycle | Outcome | Effect / evidence | Cleanup | Decision disposition |
| --- | --- | --- | --- | --- | --- |
| Workflow `40832621820` | CONFIRMED_DONE | FAILURE | Three intended scenario effects; all attributable raw evidence verified | Three owned roots removed | RECONCILE_EFFECT completed; expected failed child, no retry |
| B1 job | CONFIRMED_DONE | SUCCESS | One exclusive B1 marker, verified | CLEANUP_CONFIRMED | Original KEEP_OBSERVING completed; result reusable |
| B2 job | CONFIRMED_DONE | SUCCESS | One exclusive B2 marker, verified | CLEANUP_CONFIRMED | REUSE_RESULT, no repeat |
| B3 child | CONFIRMED_DONE | FAILURE | One partial effect and retained error receipt, verified | Shared owned root removal confirmed later | RECONCILE_EFFECT completed |
| B3 parent job | CONFIRMED_DONE | FAILURE | Partial/final evidence preserved independently of outcome | CLEANUP_CONFIRMED | RECONCILE_EFFECT completed; no substitute |
| Four artifact uploads | CONFIRMED_DONE each | SUCCESS each | Distinct IDs; ZIP integrity/digests/member bytes checked | No application cleanup implied by upload | Evidence retained under explicit disposition |

## 5. Raw evidence and at-most-once scope

Workflow: [Actions run 40832621820](https://github.com/KhaosMagnus/YU3DOH-Carder/actions/runs/40832621820), attempt **1**, exact harness `dd6e8bfecadab0a83c8008ea65300b1f0ba518f8`.

| Artifact | ID | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| B1 final | 12879053427 | 3,370 | `e84c26896dd137c3d2ab0926cb14052bb38c9517fe243ce3999140e39481606f` |
| B2 final | 12879024432 | 3,225 | `2739cee316bfdd6dda9f9cad119b39365a880fc914fe19d969eefbc10a5fe302` |
| B3 partial | 12879037812 | 614 | `76bd92e16e71758a238e0aaa9ebdb8bb8ad6837a784c90e6f49b1485b51c9810` |
| B3 final | 12879496366 | 4,063 | `4f09339d0d8b2e50e2edc62780f7964ea8f3b6a39be53462ea54ebc6c77db263` |

All four ZIPs passed CRC/size/SHA-256 checks. The three final manifests contain **16** checked members total (5 B1, 5 B2, 6 B3); the separate partial ZIP was also inspected. Exact decoded raw members and manifests are preserved under `validations/PP-002/GATE-B/raw/<artifact_id>/`. Full job logs are preserved under `validations/PP-002/GATE-B/logs/{123310073647,123310073956,123310073907}.log`.

Proof of zero duplicates is bounded to this controlled execution: the branch-wide run inventory contains exactly **one** workflow, attempt **1**, one job per scenario; each verified event history has exactly one creation; each marker was created with exclusive file creation; all three namespaces are distinct. The B3 partial and final archives repeat **evidence of the same effect**, not a second effect. No retry, rerun, replacement or second push was used.

This is not a claim of global idempotency against arbitrary future duplicate workflow emissions. The script rejects run attempts other than 1, but exclusive runner-local creation alone would not deduplicate separate newly emitted runs. Avoiding such emission through identity/state reconciliation, then checking the complete branch run inventory, supplied the required proof in this experiment.

## 6. Bookkeeping defects requiring REVISE

### GB-D01 — planned states copied as observed states

010 copied the pre-emission templates, updating only workflow/job parent records. It retained `CONFIRMED_NOT_DONE / NOT_EMITTED_CONFIRMED` for operations that its own raw receipts already proved issued or complete:

| Operation | Incorrect inherited claim | Positive evidence already available |
| --- | --- | --- |
| `GB-INTENT-PUBLISH` | Not done / not emitted | The snapshot references the already-published intent commit |
| `GB-OPS-CREATE` | Not done / not emitted | Successful creation receipt and independent exact branch read |
| `GB-EMIT` | Not done / not emitted | Guarded-update acknowledgement plus assigned workflow ID |
| `B1-EFFECT` | Not done / not emitted | Raw initial job step completed/success at `07:00:13Z` |
| `B1-HOLD` | Not done / not emitted | Raw initial job hold step in progress since `07:00:13Z` |

This is at least **five stale operation-state claims**, not an absence-of-evidence problem. A recovery consumer using that array could be misled toward repeating already issued work. Actual recovery instead used the durable IDs and new external queries; no repeat was emitted and the three scenario decisions were correct. That favorable outcome does not make the intermediate ledger safe.

### GB-D02 — observation time replaced by assembly time

010 records `external_observation_at=07:00:48.933Z`, but the copied initial workflow/job responses were received at `07:00:15.124Z` / `07:00:15.576Z`. The later timestamp describes snapshot construction, not a new status read. Its actual prior template observation timestamp was even older (`06:59:40.651Z`). Those fields must not be silently interpreted as a fresh observation at assembly time.

Both defects are preserved in 010 and precisely documented in [060](../validations/PP-002/GATE-B/060_BOOKKEEPING_CORRECTION.json). The unqualified `stale_context_errors=0` metric in 050 is superseded: product baseline/authority errors and actual recovery-decision errors were zero, but operation-ledger recording errors were not.

Required correction before further live use:

1. Keep `planned_intent` separate from `observed_state`. Once emission occurs, derive every material operation from its own receipt/query; unobserved state becomes UNCERTAIN. Never carry a planned nonemission/nonstart assertion across parent emission without fresh positive evidence.
2. Capture request/response observation timestamps at the actual read, preserve them unchanged, and record assembly/verification times separately.
3. Add a pre-publication consistency check that rejects a supposedly current child/admin NOT_DONE claim contradicted by the same snapshot's raw completed/active receipt. Preserve event source and observation time for every derived state.

These are corrections to the experiment's observer/emitter bookkeeping. No Generic Protocol or frozen v2 amendment is made here. A corrected, separately bounded revalidation must demonstrate the fix before proceeding to another live gate; no extra workflow was launched to erase or repair this result.

## 7. Measurements and administrative burden

| Measurement | Observed result / limit |
| --- | --- |
| Workflow / job executions | 1 workflow, 3 jobs, attempt 1 |
| Recovered jobs | 3: two active, one already complete |
| Completion during observation loss | 1: B2, missed terminal confirmation recovered |
| Lost emission acknowledgements | 0; this scenario tested missed terminal confirmation, not a lost submission response |
| Logical marker effects / duplicates | 3 distinct effects / **0 duplicates** |
| Retries / replacements / cancellations | **0 / 0 / 0** |
| Automatic retry paths suppressed | 2: active B1 replacement and failed-child/active-parent B3 replacement; B2 separately reused |
| Scoped BLOCK decisions | 2 affected repeat/replacement paths; original observations/finalizers continued |
| Cleanup reconciliations | 3 explicit owned-root removals |
| Recovery checks | 12 semantic precedence checks from the transfer, not an HTTP-call count |
| Additional Owner prompts | **0** |
| Actual recovery-decision errors | 0 in B1/B2/B3 |
| Product baseline/authority errors | 0 |
| Ledger defects | 2 defect classes; at least 5 stale operation-state claims |
| Raw verification | 4 archives; 16 manifest members plus separate partial receipt verified |
| Product execution/mutation/ref movement | **0 / 0 / 0** |
| Session rollover / quota exhaustion | 0 / 0; deliberate polling pause only |
| Job bounds / planned total resource ceiling | 8 minutes per job; at most 24 total job-minutes; holds 300/90/330 seconds |
| Run wall-clock interval | Created `07:00:07Z`, last job completed `07:05:47Z`: about 5m40s, excluding report/publication work |
| Terminal auto-return | This report and complete return emitted proactively at terminal REVISE |

The administrative record has 24 predeclared logical operations, seven append-only evidence snapshots (000–060), four archive inspections, three raw job logs and a final report. Native Actions receipts supplied most execution facts; the observer's copied-state/timestamp defects show that hand-built bookkeeping itself is a material risk. Reusing raw observations and deriving checked state vectors is preferable to repeatedly copying templates.

The experiment's minimum two-minute observation pause and 5m40s workflow are measured; exact active analyst time and a generalized production cost are not. This overhead is defensible for a controlled materially stateful test, but its reliability is not yet sufficient to justify Gate C. Do not impose the record as ceremony on every clean pause or ordinary evidence-access problem.

## 8. Cleanup, retention and final protected state

Explicit receipts prove removal of each owned runner-local root. No process/runner termination inference supplies this proof. All four artifacts were verified; raw members/manifests/logs are durably published in the control evidence namespace. Actions retention is configured for **30 days**. The operational branch/harness is retained read-only for PC review and reproducibility; no automatic branch deletion, artifact deletion, release/tag or other destructive disposal occurred. PP-002/S01 remains the named closer for these records and their retention disposition; PC assigns a successor if it becomes unavailable. There are no pending live jobs, retries, cancellations or owned-root cleanup tasks.

Protected refs independently verified before emission, during recovery and after all jobs completed:

| Ref | Unchanged SHA |
| --- | --- |
| `feature/workspace-v0.1` | `e11579950ef7ed20e4b6eeee88f9c3597c1f074b` |
| `feature/workspace-run-026` | `e11579950ef7ed20e4b6eeee88f9c3597c1f074b` |
| `main` | `54cc3aad246c89a29f2a18be63c539db68cae041` |

The ops branch remains `dd6e8bfecadab0a83c8008ea65300b1f0ba518f8`; only its two experimental paths differ from the consumed control tree. Control publications are additive Gate B evidence/report only, guarded by expected-head checks; central coordinator files and frozen predecessors are untouched.

## 9. Terminal recommendation and return

The evidence supports retaining the v2 reconciliation approach: B1 waited, B2 reused, B3 reconciled failure independently of parent/cleanup, and duplicate effects stayed zero. **The observer implementation is not yet sufficiently trustworthy:** its emitted snapshot contradicted available execution evidence. Correct the two exact bookkeeping defects, validate the state derivation/timestamp invariants, and have PC-002 disposition a bounded corrective experiment before any Gate C consideration. Avoid treating the successful scenario decisions or final cleanup as proof that an inconsistent ledger is safe.

**YU3DOH RETURN ENVELOPE**

SOURCE ROLE / INSTANCE: PROTOCOL_PORTABILITY / PP-002, S01  
TARGET ROLE / INSTANCE: PROJECT_CONTROL / PC-002  
CONTROL INPUT SHA: `2d22969421bfe92d283bae0202c0aa3764105a2c`  
MODE: AUTHORIZED LIVE CONTROLLED INTERRUPTION EXPERIMENT  
EXPERIMENT: PP-002 — Execution Interruption Recovery Pilot  
ACTIVE GATE: B  
RESULT: REVISE  
PRIMARY OUTPUT: `protocols/PP-002_GATE-B_CONTROLLED_INTERRUPTION_REPORT.md`  
EVIDENCE: `validations/PP-002/GATE-B/000_INTENT.json` through `060_BOOKKEEPING_CORRECTION.json`, raw members and job logs  
OPERATIONAL BRANCH: `ops/pp-002-gate-b-actions`  
HARNESS SHA: `dd6e8bfecadab0a83c8008ea65300b1f0ba518f8`  
ACTIONS RUN / ATTEMPT: `40832621820` / 1  
JOBS: B1 `123310073647` success; B2 `123310073956` success; B3 `123310073907` expected failure  
WORKFLOW OUTCOME: FAILURE from intentional B3 child; distinct from Gate B REVISE  
DUPLICATE NON-IDEMPOTENT EFFECTS: ZERO  
RETRIES / REPLACEMENTS / CANCELLATIONS: ZERO  
CLEANUP: THREE OWNED ROOTS EXPLICITLY REMOVED; NO LIVE OPERATION LEFT OPEN  
CORRECTION ARTIFACT: `validations/PP-002/GATE-B/060_BOOKKEEPING_CORRECTION.json`  
REMAINING DEFECTS: planned states copied as observed states; observation time conflated with record assembly time  
PRODUCT MUTATION / PRODUCT REF MOVEMENT / MAIN MOVEMENT: NONE  
GENERIC PROTOCOL v1.0: FROZEN / UNCHANGED  
RECOVERY GATE: PROPOSED / NOT ADOPTED  
NEXT ACTION: PC-002 adjudicates REVISE and a bounded correction/revalidation route; no automatic rerun  
GATE C: NOT AUTHORIZED  
PROTOCOL SUCCESSOR / ADOPTION: NOT AUTHORIZED  
RETURN: PROTOCOL_PORTABILITY / PP-002 → PROJECT_CONTROL / PC-002

GATE B REVISE
