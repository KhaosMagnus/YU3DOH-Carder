# PP-002 — Gate B-R2 Corrected Live Bookkeeping Revalidation

status: FROZEN / TERMINAL
protocol_version: 1.0
author: PROTOCOL_PORTABILITY / PP-002 / S01
return_to: PROJECT_CONTROL / PC-002
report_date: 2026-10-29 (America/Mexico_City)
source_event_times: UTC, preserved literally
input_CONTROL_SHA: 930dcab160df28c7606991cff4388fea29f351cf

## Decision and bounded claim

The corrected live observer passed the authorized single-run revalidation.
Every one of the five material live state snapshots passed the consistency
validator before publication/decision use, with 24 operation records and zero
invariant violations. The unchanged historical negative control still failed
with 53 violations and all six mandatory controls detected. No live scenario
was repeated. The only workflow failure was the deliberately failing B3 child;
workflow outcome and experimental acceptance are separate.

This report validates corrected live bookkeeping on disposable infrastructure.
It does not establish resilience to an actual executor crash, conversation
rollover, usage exhaustion or lost issuance acknowledgement. The controlled
loss was same-session absence of Actions observation. It supplies no product
acceptance and does not adopt the proposed Recovery Gate.

## Authority and exact custody

| Subject | Frozen identity |
|---|---|
| Control branch/input | meta/project-control @ 930dcab160df28c7606991cff4388fea29f351cf |
| Owner approval | control/PP-002_GATE-B-R2_OWNER_APPROVAL.md; blob f7ffe9ab6136d3aef5c8a70a6e921de379489a8b |
| Effective authorization | control/PP-002_GATE-B-R2_AUTHORIZATION.md; blob d70a449107254b081c684195d4734f964f65bc08 |
| Route | routing/ROUTE-PP-002-GATE-B-R2.md; blob 2ef326be474b7e8bc0cde4395fb5735a1c7d53be |
| Approved proposal | control/PP-002_GATE-B-R2_PROPOSAL.md; blob 06c89385e44c3c1100d7c8daf4112829dd00e6e8 |
| Predecessor | Gate B-R1 PASS; runs/PP-002_GATE-B-R1_PASS_DISPOSITION-v2.md |
| B-R2 harness | ops/pp-002-gate-b-r2-actions @ 0e679ad863076098d92d8a7704f6ca88948b651b |
| Harness parent | 930dcab160df28c7606991cff4388fea29f351cf; only two bounded harness files added |
| Run / attempt | [40916583578 / 1](https://github.com/KhaosMagnus/YU3DOH-Carder/actions/runs/40916583578) |
| Disposable namespace | pp002-gate-b-r2-20261029-01 |
| Historical Gate B | REVISE / unchanged; ops/pp-002-gate-b-actions @ dd6e8bfecadab0a83c8008ea65300b1f0ba518f8 |

The branch was absent and its run inventory empty before creation. It was
created at the verified control input, which contained no workflow files.
A single expected-head, non-force advance to the harness commit emitted the
workflow. Its issuance was 2026-10-29T16:57:06.014Z; positive
acknowledgement arrived 2026-10-29T16:57:07.529Z. The initial
empty inventory immediately after issuance was treated as registration latency,
not failure or permission to emit again. Subsequent discovery established the
exact run identity. No dispatch, rerun, replacement or cancellation was issued.

The operational commit adds only
`.github/workflows/pp-002-gate-b-r2-controlled.yml` and
`validation/pp002-gate-b-r2/run.py`. Sparse checkout targets the experimental
folder; the script has no network, product API or database operation. It checks
the exact operational ref and attempt 1, exclusively creates each case root and
marker, and removes only a root whose marker proves namespace/case/run ownership.
No product code was exercised or modified.

## Corrected mechanism and bounded delta

`validation/pp002-gate-b-r2/observer.py` loads the unchanged B-R1 engine only after
checking SHA-256
`0ebe717cb4830d376668a9d3ac193fd026399279c09a68af656e04d566247633`.
The B-R1 `validate` function is byte-unchanged. The successor supplies B-R2
experiment constants and a source adapter for live workflow/job/step and
publication/ref acknowledgement receipts. It adds one allowed field,
`supplemental_source_ids`, to trace verified marker/cleanup packages. Axis enums
and recovery semantics are unchanged. Separate fail-closed checks bind exact
control, harness, branch, run/attempt, frozen intent, input bytes, package
custody and safe next action. This is not a PP-002 v2 amendment.

The source-bound adapter is byte-pinned before emission:

| File | SHA-256 |
|---|---|
| observer.py | 283f49bd26534730156eb7a0ef165a18baec8a7b6b3a7c8ae6c2a152d4645edb |
| test_observer.py | f41c9156e82a785ac785766649a36b1b63ec99ec7c78e59b803311a2cd94fb0e |

Those bytes remained unchanged through final revalidation. Sixteen adversarial
synthetic receipt tests passed before issuance. They cover stale NOT_DONE and
nonemission, unsupported source/time/cleanup/outcome/action, missing/cross-bound
sources, dropped operations, foreign attempt and tampered source bytes. Synthetic
fixtures are unit evidence only and emit no experimental workflow/effect.

`R2-000_INTENT.json` contains only structurally separate `planned_intent`.
It has no observed-state axes. Identity, parent topology, purpose, authority,
closer, namespace and retry characteristics may be inherited as identity data;
observed axes never are. Every observed row is derived from an actual receipt
and a resolvable JSON pointer. Explicit pending/null-start step receipts support
operation-specific CONFIRMED_NOT_DONE, never a parent's silence. Absent step
receipts yield UNCERTAIN/UNKNOWN. All 24 named operations were visible in the
actual initial job receipt, so the live run did not need the absence fallback.

Raw input manifests bind bytes, SHA-256 and Git blob hashes. Exact package
identity, member hashes, marker digest/count, one effect_created event and
explicit ownership/deletion receipts are required for successful job/effect
reuse. A passing API execution status alone is insufficient for that reuse.

## Source time custody

`requested_at` is the observed connector invocation boundary; `receipt_at` and
`responded_at` identify completed connector response receipt. These are real
observer boundaries, not claimed HTTP wire telemetry. GitHub events and
runner-produced effect/cleanup events remain independent. Missing original
source time remains UNKNOWN, including the untimed intake inventory preserved
as `raw/intake-inventory.json`. No reconstruction substitutes local assembly.

The initial B1 hold illustrates separation:

| Field | Actual value / meaning |
|---|---|
| source_id | validations/PP-002/GATE-B-R2/raw/initial-jobs.json#/response/jobs/1/steps/3 |
| requested_at | 2026-10-29T16:57:39.016Z |
| receipt_at / responded_at | 2026-10-29T16:57:39.550Z |
| event_at | `{"completed_at": "UNKNOWN", "started_at": "2026-10-29T16:57:15Z"}` |
| recorded_at | 2026-10-29T16:57:53.669598+00:00 — local assembly |
| verified_at | 2026-10-29T16:57:53.670857+00:00 — after consistency verification |
| state_as_of | 2026-10-29T16:57:39.550Z — source receipt only |

Runner `cleanup.json#/observed_at` is the runner's post-deletion event time;
it is not the external observer's response receipt. Artifact metadata event
and expiry times, download connector boundaries and byte retrieval boundaries
are preserved in the respective `raw/*-verification.json` files. Supplemental
package sources are explicit in the observed rows. No timestamp-conflation
defect or invented source observation time was detected.

## Append-only checkpoint sequence

| Checkpoint | Content / immutable publication | Validation |
|---|---|---|
| R2-000 | Intent + pinned adapter + negative/test evidence; e319d4b03cc04fd07dc88df90e06071bfff53ef2 | Pre-emission plan; no synthesized observed state |
| R2-010 | Emitted receipt/state; 6198a89e2b9757ba11e1538b2b74be2f50e56150 | PASS, 24 operations, 0 violations before loss |
| R2-020 | Last fresh observations, IDs, closer and recovery entry; ac0e60ad0126945bd560c32ecb82596a360590bc | PASS, 24 operations, 0 violations before loss |
| R2-030 | Durable recovery then fresh reads; 2911861089924ad08091cc9f72309274478d76a3 | PASS, 24 operations, 0 violations |
| R2-040 | Exact B2 package reuse; partial B3 reconciliation; fa7f201bd60726c2773fe9177b4811186133c83d | PASS, 24 operations, 0 violations before decisions |
| R2-050 | Final actual outcomes, all packages, cleanup, retention and this report | PASS, 24 operations, 0 violations; publication SHA in auto-return |

Every state file has its own `_MANIFEST.json`, `_VALIDATION.json` and
`_VALIDATION.log`. All five final replays reproduced both the original ledger
bytes and validator result bytes exactly. No failed live snapshot was consumed;
no repair, weakening of a validator or second execution was necessary.

Operation inventory: three administrative operations (intent publication, branch
creation, workflow-emitting advance), one workflow, three jobs and seventeen
named scenario children = 24 ledger operations. The seventeen children comprise
three effect creators, three bounded holds, three cleanups, three finalizers,
four artifact uploads and the deliberately failing child. Every row carries
all six axes and source/time fields; `R2-000` carries purpose/type, owner/closer,
authority, control/harness, namespace, emission and retry characteristics.
External run/job identities are in raw source nodes. Parent lifecycle never
inherits a child's outcome.

## Controlled loss and recovery entry

The last pre-loss Actions receipt was R2-020_LOSS_PLAN.json#/last_actions_receipt_at:
2026-10-29T16:59:04.204Z.
Four bounded 55-second timer waits supplied 220 seconds of deliberate waiting.
The complete no-Actions-query interval to the first recovery invocation was
295.040 seconds, ending
2026-10-29T17:03:59.244Z.
This interval includes control publication/local work; it excludes the recovery
query's duration. It must not be described as 295 seconds of timer sleep.

After the pause, immutable authorization, intent, loss snapshot and recovery
entry were fetched from GitHub before any new Actions query. The run/harness
identity came from the recovered snapshot's manifest, not conversational memory.
`recovery-entry.json` records those exact control revisions, file blobs and
request/receipt boundaries. No remembered terminal result was inherited.

## Scenario evidence and decisions

| Case | Fresh recovery evidence / observed state | Decision and consequence |
|---|---|---|
| B1 | Job 123598315315 and B1 hold nonterminal; B1-EFFECT already terminal SUCCESS; effect remains owned pending cleanup | STILL_RUNNING → KEEP_OBSERVING; no second run/effect; later actual job SUCCESS, explicit cleanup verified |
| B2 | Job 123598314893 completed SUCCESS at 2026-10-29T17:00:17Z, strictly inside no-query interval | Initially reconcile exact evidence; after package verification CONFIRMED_DONE + SUCCESS + EFFECT_CONFIRMED + EVIDENCE_VERIFIED → REUSE_RESULT; one marker, no repeat |
| B3 child | Child step completed FAILURE; raw partial receipt records intentional exit 23 and exact run/control/harness | CONFIRMED_DONE + FAILURE → RECONCILE_EFFECT; partial effect retained and later reconciled; no retry |
| B3 parent | Job 123598315617 and parent hold independently nonterminal while the child is failed | STILL_RUNNING → KEEP_OBSERVING; no inference of terminal parent failure from child |
| B3 final | Actual parent job later completed FAILURE; only failed step is the intended child | Preserve expected failure outcome; reconcile partial effect, explicit cleanup and retention; close original, no substitute |

**OBSERVED EVIDENCE:** Recovery raw job/step receipts show those simultaneous
states. B2's terminal package proves one exclusive marker/effect event and
explicit owned-root removal. The B3 partial artifact is byte-identical to the
partial receipt included in its final package. Actual final GitHub conclusions
are independently retained, not inferred from intended scenario outcomes.

**INFERENCE:** Within the owned disposable namespace, exclusive creation,
run/attempt inventory, one effect event per case, digest verification and
closure receipts support zero duplicate effects. This is a scoped experimental
conclusion, not an omniscient claim about unrelated repository activity.

**PLAUSIBLE HYPOTHESIS:** None is needed to explain the observed experiment.
The transient empty inventory after acknowledged emission was not diagnosed as
an executor or model failure and did not justify a retry.

**RECOVERY DECISION:** Keep observing B1/B3 parents; reuse exact verified B2
result; reconcile B3 partial effect. No authority for retries/replacements was
created by the observer or by successful B2 completion.

**POST-HOC RECONCILIATION EVIDENCE:** B1 final job SUCCESS at
2026-10-29T17:07:19Z; B3 final job FAILURE at 2026-10-29T17:08:19Z; actual workflow
terminal FAILURE; three final package manifests/cleanup receipts. None of this
later evidence was projected into R2-010/020/030 or used as pre-loss knowledge.

## Raw artifact custody and cleanup closure

| Artifact ID | Subject | ZIP SHA-256 |
|---|---|---|
| 12915339190 | pp002-gate-b-r2-20261029-01-B2-40916583578 | 75def08d3157105a07e1833bbf250fa2bcb62fb22ac9716c50ec6454cb10589f |
| 12916121707 | pp002-gate-b-r2-20261029-01-B3-partial-40916583578 | 2a9fbbff64ce3a15e4bd1058476172fd0bd185a7fc59ad4c69901b98a0027149 |
| 12916812833 | pp002-gate-b-r2-20261029-01-B3-40916583578 | 521a64402b70239b109515c51452064f95f43e5c007cd943ff7b12f78d577573 |
| 12917007252 | pp002-gate-b-r2-20261029-01-B1-40916583578 | 50ccb0913ed3433754c27412bec206d38376b65d5b120fe6c3a75f8f93948d76 |

All four ZIP byte sizes/digests and CRCs matched GitHub metadata. Twenty raw
members are retained (6 B1, 6 B2, 7 B3 final, 1 B3 partial). The three final
manifests verify sixteen member entries, including the B3 partial receipt;
manifest self-files are not circularly hashed. Raw decoded job logs for all
three jobs are retained. The ZIP download URLs are transient and are not
publication evidence; immutable artifact IDs/digests and copied raw members are.

Each cleanup receipt proves the expected owned root existed, its marker ownership
was checked and the root was absent after removal. Each final receipt confirms
one effect, zero duplicates and removed root. Parent workflow/job failure and
runner post-job process termination are not used as cleanup proof.

All 24 ledger operations are terminal. Applicable cleanup dimensions are
CONFIRMED; the others are explicitly NOT_APPLICABLE. The workflow and B3 parent/
child keep FAILURE outcomes. Their RECONCILE_EFFECT disposition has been performed
through package/cleanup/retention reconciliation; no live effect remains pending.
PP-002/S01 closes every original operation. PC-002 would assign a successor only
if that closer became unavailable; no reassignment was needed.

Artifacts retain their individually recorded 30-day Actions expiry on
2026-11-28. Raw receipts/logs/members are preserved in immutable Git evidence.
The B-R2 branch/harness is retained read-only for PC review. Later branch/evidence
retention disposal belongs to PC-002; neither branch deletion nor extra live
execution is implicit. See `terminal-closure.json`.

## Measurements, administrative cost and remaining limits

| Measurement | Observed result |
|---|---|
| Workflow executions / attempts | 1 / 1; exact harness and run ID preserved |
| Material ledger operations emitted/recovered | 24 / 24; 1 workflow, 3 jobs, 17 named scenario children, 3 administrative operations |
| Active records at recovery | 5: workflow, B1 job/hold, B3 job/hold |
| Completion during observation loss | B2 job/effect chain; one missed terminal confirmation |
| Issuance acknowledgements lost | 0; no lost-ID experiment claimed |
| Duplicate workflows / effects | 0 / 0 |
| Retries / justified retries / replacements / cancellations | 0 / 0 / 0 / 0 |
| Repeat paths disallowed by recovery | 3 scenario repeats disallowed; no actual retry command was attempted |
| BLOCK records | R2-010: 9; R2-020: 9; R2-030: 6; R2-040: 6; R2-050: 0 |
| Execution stop / consistency failures | 0 / 0 |
| Cleanup reconciliations | 3 owned roots, including B3 partial effect |
| Live snapshots / invariant violations | 5 / 0; all 24 operations each; deterministic repeat matches |
| Negative control | Original 010 FAIL, exit 1 expected, 53 violations, all six mandatory controls |
| Adversarial unit tests | 16 PASS; no external effects |
| Additional Owner prompts | 0 |
| Administrative planning-path discrepancy | 1, reconciled append-only; 0 observed-state / baseline errors |
| Operational identities inspected | 1 run, 3 jobs, 17 named scenario steps, 4 artifacts; hierarchy explicit, not additive independent runs |
| Actions observation connector calls by terminal evidence capture | 17 API reads (including one untimed intake inventory), 4 artifact downloads, 3 decoded-log retrievals; HTTP redirect/request count not asserted |
| Control administration | 6 additive expected-head publications including this terminal checkpoint/report; 1 isolated branch creation + 1 emitting advance; no central registry/state edits |
| Bounded infrastructure cost | 14 minutes/job timeout, 42 job-minute maximum; summed observed job wall time 24.317 minutes, not a billing measurement |

BLOCK counts are operation-scoped prohibitions on manually issuing/repeating
pending children or unsupported work; they are not global stops of the already
authorized original workflow schedule. No pending child was manually duplicated.
KEEP_OBSERVING preserves that original lifecycle. At terminal closure no BLOCK
remains. Do not add checkpoint incidences as unique blocked operations.

Twelve recovery check groups were performed: (1) frozen authority, (2) exact
control/harness/ref, (3) durable emission/ack, (4) unique run/attempt, (5) fresh
parent status, (6) independent child status, (7) source/time custody, (8) ledger
consistency, (9) raw evidence integrity and exact effect count, (10) owned cleanup,
(11) closer/retention, (12) protected-ref and historical-file preservation.
Machine-readable counts and all deterministic rechecks are in
`final-measurements.json`.

The record is deliberately explicit for this pilot: repeated 24-row snapshots,
raw query bodies, five validator manifests/results and six control publications
add material storage/authoring cost. That cost is visible; this one experiment
cannot establish a general cost/benefit threshold for routine work. Authoring
and reasoning preparation were not continuously timed, so no total analyst-hour
or CPU-time claim is made. The safety benefit demonstrated here is narrower and
concrete: a false planned state cannot silently become the current ledger, source
receipt times remain distinct, and actual parent/child/cleanup/evidence states
support deterministic decisions without duplicating the one issued workflow.

State safely reused: exact intent/authority/IDs, immutable acknowledgements,
verified B2 result and final raw evidence. State requiring observation: B1/B3
active parents. State requiring effect reconciliation: failed B3 child and final
expected-failure parent/workflow. Retry requiring new justification/authority:
none was needed or granted. State requiring BLOCK: unsupported manual repeat of
pending/uncertain children. Inherited evidence: frozen v2 semantics, B-R1 core,
original negative fixture and source manifest. Non-inherited evidence: historical
Gate B outcomes as proof for B-R2, product QA acceptance, executor rollover or
usage-exhaustion recovery.

## Administrative planning-path reconciliation

Final review found one stale administrative literal in the frozen plan:
`R2-INTENT-PUBLISH.effect_output_namespace` names
`validations/PP-002/GATE-B-R2/000_INTENT.json`; the file actually published is
`validations/PP-002/GATE-B-R2/R2-000_INTENT.json`. The directory isolation
namespace is unchanged. The real file/blob is bound by every source manifest
and was independently fetched at its actual path during recovery. The incorrect
planned literal was never used to derive an observed axis, recover a run ID,
repeat an operation or claim a source observation timestamp.

`planning-path-reconciliation.json` explicitly records both locators, actual
immutable publication/blob, source custody and closure. Original intent bytes
remain frozen. This is one detected planning metadata error, now reconciled;
it is not silently counted as zero errors. It does not invalidate the five
source-bound state validations or require a model/validator change: all frozen
state/time/duplicate/cleanup PASS conditions remain met. PC-002 should retain
this qualification when consuming the report. No extra execution is authorized.

## Preservation and result criteria

Pre-emission and final source receipts verify:
- feature/workspace-v0.1 = e11579950ef7ed20e4b6eeee88f9c3597c1f074b;
- feature/workspace-run-026 = e11579950ef7ed20e4b6eeee88f9c3597c1f074b;
- main = 54cc3aad246c89a29f2a18be63c539db68cae041;
- historical Gate B ops = dd6e8bfecadab0a83c8008ea65300b1f0ba518f8;
- B-R2 ops = 0e679ad863076098d92d8a7704f6ca88948b651b after its sole emitting advance.

No protected/product ref mutation was issued; observed protected endpoints match.
Every original input-control blob is compared before additive publication,
including historical Gate B 000–060, historical reports, B-R1, PP-002 v2 and
Generic Protocol v1.0. No frozen predecessor was rewritten. Publication uses
expected-head/CAS, force=false; final publication/path/blob verification is
reported in the return envelope.

All frozen PASS criteria are met: one workflow/attempt; live R2-010 validation
before loss; validated subsequent decision snapshots; historical negative still
rejected; active B1 without duplicate; completed B2 safely reused; failed B3 child
separate from active parent; zero stale planned claims/time conflations/duplicate
effects; explicit closure of every disposable root; protected/historical refs
and artifacts preserved. No further live execution is necessary for this gate.

PC-002 may consume this report and separately consider Gate C. Gate C, protocol
successor/adoption, product mutation and additional live workflows remain
unauthorized. Generic Protocol v1.0 and PP-002 v2 remain frozen/unchanged.

GATE B-R2 PASS
