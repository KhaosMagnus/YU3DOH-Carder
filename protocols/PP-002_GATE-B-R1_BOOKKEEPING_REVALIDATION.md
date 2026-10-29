---
artifact_id: PP-002-GATE-B-R1-BOOKKEEPING-REVALIDATION
artifact_type: bounded_offline_consistency_revalidation
status: FROZEN
protocol_version: "1.0"
source_role: PROTOCOL_PORTABILITY
source_instance: PP-002
target_role: PROJECT_CONTROL
target_instance: PC-002
control_input_sha: b30b5b30b3526f92598e9727a8aec7a57be4e4b9
publication_parent_expected: b30b5b30b3526f92598e9727a8aec7a57be4e4b9
predecessor_result: GATE B REVISE
gate: B-R1
mode: BOUNDED OFFLINE BOOKKEEPING CORRECTION REVALIDATION
result: PASS
report_date: "2026-10-29"
external_experimental_operations_emitted: 0
actions_launch_rerun_cancel: 0
ops_branch_movement: false
product_mutation: false
product_ref_movement: false
further_live_gate_authorized: false
gate_c_authorized: false
---

# PP-002 — Gate B-R1 Bookkeeping Revalidation

**Result: PASS.** The same deterministic offline validator rejects the defective `010_EMITTED.json`, detects all five required GB-D01 contradictions and GB-D02, and accepts a new append-only historical derivation with **zero invariant violations**. Twenty-two regression tests pass. No workflow was launched, rerun or cancelled; the operational and product refs remain unchanged.

This closes the bounded **offline bookkeeping revalidation**, not the predecessor live gate. Gate B remains historically REVISE. No further live experiment, Gate C, protocol successor or adoption follows from this result.

## 1. Authority and immutable inputs

Consumed `meta/project-control @ b30b5b30b3526f92598e9727a8aec7a57be4e4b9` and read:

| Artifact | Verified Git blob |
| --- | --- |
| [Correction contract](../control/PP-002_GATE-B-R1_BOOKKEEPING_CORRECTION.md) | `53f42e99192808e114d4eafa665e1881b1744d12` |
| [Authorization](../control/PP-002_GATE-B-R1_AUTHORIZATION.md) | `967380f49c1e7c186f9dad4a0f2e63cd48fb88c3` |
| [Route](../routing/ROUTE-PP-002-GATE-B-R1.md) | `287b41b962638c36bb46de388ff582ed31b493ff` |
| [Gate B disposition](../runs/PP-002_GATE-B_REVISE_DISPOSITION.md) | `beb3ddadd6cdca03b5b60c1833bbd4c812d02321` |

The PP-002 assignment and complete source-tree inventory were also inspected. No existing B-R1 implementation, evidence output or report occupied the authorized paths.

All **30 frozen Gate B evidence files** were read from GitHub at that exact input SHA: snapshots 000–060, three job logs and retained raw artifact members/manifests. Local bytes were checked against each returned Git blob SHA. [input-manifest.json](../validations/PP-002/GATE-B-R1/input-manifest.json) preserves the exact path, bytes, SHA-256 and Git blob identity of every input. The implementation rechecks those identities before deriving or validating any state. Frozen source bytes were not edited.

The historical subject is run **40832621820**, attempt 1, harness **dd6e8bfecadab0a83c8008ea65300b1f0ba518f8**. No new Actions state was used to replace its recorded history. Read-only GitHub control/ref inspection and the separately authorized control publication are distinct from experimental operation emission; **zero external experimental executions** were emitted.

## 2. Implemented correction

Implementation and reproduction instructions: [validation/pp002-gate-b-r1/README.md](../validation/pp002-gate-b-r1/README.md).

| New file | Responsibility |
| --- | --- |
| `validation/pp002-gate-b-r1/revalidate.py` | Frozen-byte verification, operation-to-receipt bindings, corrected derivation and the single consistency validator |
| `validation/pp002-gate-b-r1/test_revalidate.py` | Required historical cases and adversarial in-memory/disposable-copy regressions |
| `validation/pp002-gate-b-r1/run_checks.py` | Execute the same CLI against negative/positive inputs, capture exit codes/logs and check deterministic output |

The code uses the Python standard library. The validator contains no networking, workflow or ref-mutation capability. The runner spawns only the local validator and local unit suite.

### Planned intent and observed state

The new [corrected-derivation.json](../validations/PP-002/GATE-B-R1/corrected-derivation.json) contains two distinct structures:

- `planned_intent`: source identity plus operation identity/topology, purpose, authority and namespaces from 000. No lifecycle/outcome/effect/evidence/cleanup/acknowledgement is imported from this structure into observed state.
- `observed_state`: 24 individually bound claims derived from actual publication/branch/update receipt blocks or raw workflow/job/step responses. Each record has all six state dimensions, an operation-specific `source_kind` and resolvable `source_id`, separate request/response/receipt/event/assembly/verification times and a bounded historical decision scope.

The five known GB-D01 contradictions are detected from the **raw receipt blocks**, not by copying the diagnostic operation list in 060. A regression test removes that diagnostic list in memory and still detects all five. Source references into planned intent, another operation, or unrecognized legacy state/time aliases are rejected.

### Timestamp custody

Every claim retains:

`requested_at`, `responded_at`, `receipt_at`, `event_at`, `recorded_at`, `verified_at`, and `time_source_id` when a timing attestation exists.

Original query-response times are available only through the later durable GB-D02 attestation in 060: **07:00:15.124Z** for the workflow-list response and **07:00:15.576Z** for the initial jobs response, on 2026-10-29 UTC. The derivation labels that support explicitly; it does not claim a new API response or an independently re-executed historical timing measurement. The guarded update's own request/acknowledgement times come directly from its preserved emission receipt.

Missing original times remain **UNKNOWN**: 22 request timestamps and two receipt timestamps. `recorded_at` is local derivation assembly time; default `verified_at` is captured after the derivation's consistency check. Neither is substituted for an observation time. The emitted positive fixture records assembly at `2026-10-29T08:23:51.024193+00:00` and verification at `08:23:51.025750+00:00`; those local metadata clocks never become historical receipt clocks.

The derivation is a **historical initial-receipt view**, not current live status. Different sources retain their own receipt times. Later terminal results and cleanup evidence are not projected backward into that view.

## 3. Required negative test

Input: the original frozen [010_EMITTED.json](../validations/PP-002/GATE-B/010_EMITTED.json), with unchanged supporting evidence. Validator exit **1**, expected; **53 invariant violations**. This count includes multiple violations per underlying defect and missing traceability, not 53 distinct historical incidents.

| Required control | Contradiction detected | Positive source evidence |
| --- | --- | --- |
| GB-INTENT-PUBLISH | NOT_DONE and NOT_EMITTED contradict publication | `010#/intent_publication`: immutable commit `0c2102f3e50e135fd88c9f3f414a8da9893708aa` already published |
| GB-OPS-CREATE | NOT_DONE and NOT_EMITTED contradict acknowledged creation | `010#/branch_create`: explicit completed/success/acknowledged receipt |
| GB-EMIT | NOT_DONE and NOT_EMITTED contradict guarded emission | `010#/emission`: acknowledged update, with issued/acknowledged times |
| B1-EFFECT | NOT_DONE contradicts completed execution | `010#/jobs/0/steps/2`: completed/success at `07:00:13Z` |
| B1-HOLD | NOT_DONE contradicts active execution | `010#/jobs/0/steps/3`: in_progress since `07:00:13Z` |
| GB-D02 / GB-WORKFLOW | Claimed observation time is unsupported by the actual recorded response times | `010#/external_observation_at = 07:00:48.933Z`, near assembly `07:00:48.932Z`, conflicts with the two explicit original response-time attestations in `060#/defects/1` |

Each violation emits a logical operation ID, violated invariant, source path/JSON pointer and supporting detail. Full diagnostics: [negative-result.json](../validations/PP-002/GATE-B-R1/negative-result.json). The six required detections are separately asserted in [mandatory-coverage.json](../validations/PP-002/GATE-B-R1/mandatory-coverage.json).

| Invariant class | Count |
| --- | ---: |
| Material claim without traceable source | 24 |
| NOT_DONE contradicts executed/active operation | 5 |
| NOT_EMITTED contradicts positive issuance acknowledgement | 5 |
| Planned state carried across emission without positive nonstart support | 17 |
| Observation time conflated with assembly | 1 |
| Planned/observed structures not separated | 1 |

The negative test therefore fails for the required **content contradictions**, as well as the structural defect. It is not rejected merely by fixture name or schema label.

## 4. Corrected derivation and required positive test

The exact same `validate()` implementation and CLI accepted the new derivation: exit **0**, **zero invariant violations**, 24 source-bound operations. [positive-result.json](../validations/PP-002/GATE-B-R1/positive-result.json) and [execution-receipt.json](../validations/PP-002/GATE-B-R1/execution-receipt.json) preserve the results and commands. Revalidating identical input produced **byte-identical validator output**.

| Historical operation group | Corrected state | Source/limitation |
| --- | --- | --- |
| GB-INTENT-PUBLISH, GB-OPS-CREATE, GB-EMIT | CONFIRMED_DONE / SUCCESS / EMITTED_ACKNOWLEDGED | Actual publication/acknowledgement blocks; original missing response times remain UNKNOWN |
| B1-EFFECT | CONFIRMED_DONE / SUCCESS / EFFECT_CONFIRMED | Operation-specific completed step; cleanup still required at that historical point |
| GB-WORKFLOW and three job records | STILL_RUNNING / UNKNOWN outcome | Their own nonterminal workflow/job receipts, including queued jobs; not an inference of successful completion |
| B1-HOLD | STILL_RUNNING / UNKNOWN outcome | Named in-progress step, at original jobs-response time |
| B1-CLEANUP, B1-FINALIZE, B1-UPLOAD | CONFIRMED_NOT_DONE / NOT_EMITTED_CONFIRMED | Their **explicit operation-specific pending steps** have no start time; this is positive nonstart evidence, not an inherited plan |
| Twelve B2/B3 child operations absent from the initial response | UNCERTAIN / UNKNOWN acknowledgement and outcome | Parent records supply a traceable absence boundary, not proof of individual child nonemission or execution |

Totals: **4 CONFIRMED_DONE, 5 STILL_RUNNING, 3 CONFIRMED_NOT_DONE, 12 UNCERTAIN**. Unknowns were retained even though later Gate B evidence reports eventual child execution and cleanup. They are correct for this bounded historical source view and must not be silently reused as today's external state.

### Regression verification

**22 tests passed.** Coverage includes the original negative/positive pair, independent expected values for the five known operations, reintroduced stale states, source identity removal/cross-binding, intent-as-source rejection, unknown child observations, the positive pending-step exception, outcome/cleanup projection from later results, assembly/verification/event time substitution, invented missing request times, unrecognized timestamp/acknowledgement aliases, duplicate/dropped operation IDs, parent identity changes and input-byte tampering. Missing source receipt time is explicitly tested to remain UNKNOWN rather than using the current clock.

Adversarial tests alter only in-memory copies or temporary local copies. They are not new historical evidence and do not mutate the frozen originals.

Validator SHA-256 used by both required CLI tests:

`0ebe717cb4830d376668a9d3ac193fd026399279c09a68af656e04d566247633`

Execution stdout/stderr, expected exit codes and unit output are preserved alongside the receipt. A byte/hash manifest covers the published implementation, report and evidence package.

## 5. Reproduction, limits and protected state

From a checkout of the published control commit, the README provides commands for a fresh local output directory. The negative command intentionally returns 1; the positive command returns 0. All local outputs use exclusive creation and cannot overwrite an occupied filename. Source files are never written by the engine.

This is a bounded adapter for the captured Gate B receipt shapes. It does not implement live polling, global freshness policy, concurrent job scheduling or exactly-once effect protection. A PASS does not prove that a future live observer will record correctly; it establishes that the corrected offline derivation and consistency checks reject the known failures and tested regressions. No production/general protocol was changed.

Before/after reference checks preserve:

| Ref | Expected unchanged SHA |
| --- | --- |
| `ops/pp-002-gate-b-actions` | `dd6e8bfecadab0a83c8008ea65300b1f0ba518f8` |
| `feature/workspace-v0.1` | `e11579950ef7ed20e4b6eeee88f9c3597c1f074b` |
| `feature/workspace-run-026` | `e11579950ef7ed20e4b6eeee88f9c3597c1f074b` |
| `main` | `54cc3aad246c89a29f2a18be63c539db68cae041` |

Publication is limited to new files under `validation/pp002-gate-b-r1/**`, `validations/PP-002/GATE-B-R1/**` and this report. The original seven snapshots, all Gate B raw/log evidence, predecessor report, PP-002 v2 and Generic Protocol v1.0 remain unchanged. No central Project Control state/assignment file is edited by PP-002.

## 6. Terminal disposition and return

All B-R1 PASS conditions are met: defective 010 rejected; all five known state contradictions and the timestamp defect detected; corrected append-only derivation accepted with zero violations; no source observation time invented; no external experimental operation emitted. The predecessor remains GATE B REVISE. The next supported action is PC-002 adjudication of this offline PASS, then a separate decision on any corrected live Gate B revalidation. Avoid treating this result as live observer validation or Gate C permission.

**YU3DOH RETURN ENVELOPE**

SOURCE ROLE / INSTANCE: PROTOCOL_PORTABILITY / PP-002  
TARGET ROLE / INSTANCE: PROJECT_CONTROL / PC-002  
CONTROL INPUT SHA: `b30b5b30b3526f92598e9727a8aec7a57be4e4b9`  
MODE: BOUNDED OFFLINE BOOKKEEPING CORRECTION REVALIDATION  
EXPERIMENT: PP-002 — Execution Interruption Recovery Pilot  
ACTIVE GATE: B-R1  
RESULT: PASS  
PRIMARY OUTPUT: `protocols/PP-002_GATE-B-R1_BOOKKEEPING_REVALIDATION.md`  
IMPLEMENTATION: `validation/pp002-gate-b-r1/**`  
EVIDENCE: `validations/PP-002/GATE-B-R1/**`  
NEGATIVE: original 010 rejected; 53 violations; all six mandatory controls detected  
POSITIVE: 24 corrected operations; zero invariant violations  
REGRESSION TESTS: 22 PASS  
DETERMINISM: identical input produces byte-identical validation output  
EXTERNAL EXPERIMENTAL OPERATIONS EMITTED: ZERO  
ACTIONS LAUNCH / RERUN / CANCEL: NONE  
OPS / PRODUCT / MAIN REF MOVEMENT: NONE  
FROZEN GATE B EVIDENCE / REPORT MODIFICATION: NONE  
PP-002 v2 / GENERIC PROTOCOL v1.0: FROZEN / UNCHANGED  
PREDECESSOR GATE B: REVISE, historically unchanged  
FURTHER LIVE GATE B: NOT AUTHORIZED  
GATE C: NOT AUTHORIZED  
PROTOCOL SUCCESSOR / ADOPTION: NOT AUTHORIZED  
NEXT ACTION: PC-002 consumes B-R1 PASS and separately considers any corrected live revalidation  
AUTO-RETURN: terminal report and complete return emitted proactively  
RETURN: PROTOCOL_PORTABILITY / PP-002 → PROJECT_CONTROL / PC-002

GATE B-R1 PASS
