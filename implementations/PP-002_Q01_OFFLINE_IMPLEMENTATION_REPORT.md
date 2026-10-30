# PP-002 — Q01 Offline Implementation Report

artifact_id: PP-002-Q01-IMPL-001-IMPLEMENTATION-REPORT
assignment: Q01-IMPL-001 — Source Retrieval Provenance Collector Guard
author / accountable closer: PROTOCOL_PORTABILITY / PP-002
return_to: PROJECT_CONTROL / PC-003
result: IMPLEMENTED / READY FOR INDEPENDENT REVIEW
result_scope: OFFLINE IMPLEMENTATION AND SELF-TEST ONLY
independent_qa: NOT AUTHORIZED / NOT PERFORMED
activation_control: 565a197ce19d3ed140b002e1d709644cfbdda79e
design_baseline: 638b1d9d486e3863f2c7a6edfc407ea39066f5ce
frozen_design_blob: c72e0a6d0889ceee4e901126a33587072180017f
primary_authorization: control/PP-002_Q01_OFFLINE_IMPLEMENTATION_AUTHORIZATION.md
authorization_blob: 907a5ebed1d19edbf95f2cac5549750ece6ce2ac
primary_route: routing/ROUTE-PP-002_Q01_OFFLINE_IMPLEMENTATION.md
route_blob: 419d225a9a86babe57d3b983b412bded0359d2f8
design_acceptance: runs/PP-002_Q01_DESIGN_ACCEPTANCE.md
acceptance_blob: 8c8d36cf58be90a43c47dc0eece361159a66940b

## Result and accepted limits

The additive Q01 collector, custody guard, fake-callback composition and offline
contract runner are implemented. The final exact source candidate completes
F01–F31, the unchanged R1/Gate C regressions and byte-identical semantic replay.
Seven blocked/stale callback scenarios invoke the fake publisher ZERO times;
one positive fake-only control invokes it once. No live publisher exists in this
implementation and no new Actions operation was queried or emitted.

This is implementer self-test evidence, not official independent QA PASS.
PC-003 must separately route an independent reviewer against the delivered
commit/blob and evidence pins. No live integration or protocol successor follows
from this return.

Official Gate C REVISE and final PP-002 experimental REVISE remain unchanged.
P01 remains UNCERTAIN; P02 remains UNKNOWN. Generic Protocol v1.0 and PP-002 v2
are frozen, and the Recovery Gate remains PROPOSED / NOT ADOPTED.

## Implementation and exact scope

Five new source files occupy validation/pp002-q01-collector/:

| File | Implemented responsibility |
|---|---|
| README.md | Fixed input schema, trust boundary, profiles, exits and reproduction |
| collector.py | Pure capture_request and ingest_response, explicit arguments, copied inputs, injected clocks, receipt correlation; no transport |
| guard.py | Source-byte pins, strict pointers/URLs, commit-path-blob membership, time origins, UNKNOWN, locator reconciliation, scoped verdict and stale-approval guard |
| test_guard.py | All 31 mandatory families, raw-fact assertions, pinned retained sources and clearly labeled synthetic mutations |
| run_contract.py | Offline child containment, corpus/source pin checks, original regressions, two replays, callback counts, write/capability audit |

No R1, R2 or Gate C source file changed. The new guard composes a separate
custody verdict with the unchanged state checker and never adds fields to the
old observed-state schemas or modifies their results.

The guard distinguishes EXACT_REQUEST_HISTORY from EXACT_CONTENT. Missing
issuance metadata cannot be supplied from control authority, intent, matching
logical ID or a returned content hash. A content-only PASS preserves unknown
request history and cannot authorize fresh current-state use. A same-blob
wrong-ref claim is still FAIL; when the prior blob is unknown, the diagnostic
explicitly keeps the blob relation UNKNOWN.

Every known claim resolves to a pinned raw source and JSON pointer with an
explicit origin. Source files use exact byte length, SHA-256 and Git blob hash
independently. Source/correlation IDs, request argument pointers, response
sources and source clocks are bound independently. Duplicate keys, source
cycles, swapped receipts, path/symlink traversal, URL ambiguity and stale
bundle/payload/source pins fail closed.

Timestamp roles are independent: requested_at, responded_at/receipt_at,
event_at, recorded_at and verified_at. Receipt aliases are explicit local
observer semantics, not server wire timing. Numeric equality of a receipt and
assembly clock is not itself a defect; provenance determines validity.

Contradictory or incomplete values remain in source_bound_claims with their
status; verified_claims contains only complete, noncontradictory per-retrieval
claims for the selected profile. Unsupported URL text is redacted in semantic
diagnostics. Raw synthetic fixture inputs are retained separately and labeled.

## Historical custody and bounded adapters

OBSERVED EVIDENCE: 78 input files were pinned before final offline execution and
verified again afterward. The corpus includes source code, authority/design
documents, the full transitive R1 and Gate C inputs, original C-030/Q01 and R2
records, source-materialization receipts and five fresh read-only immutable tree
captures. Materialization happened before tests, through normal GitHub tools.
The test environment performs no fetching.

The input manifest records actual retrieval ref and raw returned locator/blob.
Current authority reads use the activation control. Separate immutable membership
captures bind the checkpoint at 1352de4daddc6c2143943af2ad7142333f7be963 and
34011f6466ce096b310ef1c43c277d2bfd2af7aa, C-030 publication
65c3d4a949fb15416ad180176511f557577eddab, R2 publication
e319d4b03cc04fd07dc88df90e06071bfff53ef2 and its later recovery read at
ac0e60ad0126945bd560c32ecb82596a360590bc. No later tree read is represented as an
original observation clock.

F05 compares the original manifest's checkpoint ref with the actual locator
attributed by the append-only Q01 correction. It rejects the wrong-ref/same-blob
claim even after removal of the correction's diagnostic prose. F06 is a NEW
annotated projection: exact actual content can be reused, original issuance
history remains UNKNOWN, and the original manifest remains defective. Correction
times remain LATER_ATTESTATION, not at-issuance proof.

F16/F17 use the original R2 plan, recovery-entry, correction, actual content and
separate membership evidence. The recovery read's ac0... ref is preserved.
A separate e319... membership proves the original publication; it does not alias
the two refs. R2's namespace field has one explicit legacy suffix parser for
" / unchanged isolation root". No general substring or global path alias is
accepted. The wrong administrative filename never changes an operation-state
axis, and an escaped namespace/product subject remains blocked.

Retained JSON sources are copied as exact raw bytes into historical fixtures.
Deliberate reserialization/mutation is tagged SYNTHETIC_MUTATION_OF_RETAINED_SOURCE
with base pins; ordinary generated inputs are SYNTHETIC_FIXTURE. The final archive
has 118 bundle inputs and 47 deduplicated raw source objects, with reconstruction
maps and an explicit fixture inventory. Neither synthetic source IDs nor imported
historical corrections are promoted to independent platform telemetry.

## Final executed verification

Canonical final evidence directory:
validations/PP-002/Q01-COLLECTOR/Q01-IMPL-001/final-contract-005/

Exact top-level command:

    python -B validation/pp002-q01-collector/run_contract.py --input-root . --output validations/PP-002/Q01-COLLECTOR/Q01-IMPL-001/final-contract-005

Observed exit: 0.

Environment: Python 3.12.14, Clang 22.1.3; Linux 6.18.55 x86_64, glibc 2.39.
Standard library only, no installation/download. Measured final runner elapsed
time: 4.772986 seconds. This is local test runtime, not analyst time, billed
compute, production latency or claimed time savings.

| Verification | Observed final result |
|---|---|
| Q01 replay A | 31 tests, ZERO failures/errors, all 31 families |
| Q01 replay B | 31 tests, ZERO failures/errors, all 31 families |
| Expanded cases | 79 distinct named subcases; 138 case/profile records per replay |
| Historical R1 original runner | Exit 0; 22 regression tests; 24-operation corrected positive, ZERO violations |
| R1 original defective 010 | Expected exit 1; 53 violations; all six mandatory GB-D01/GB-D02 controls detected |
| Gate C unchanged C-020 | Exit 0; 10 operations; ZERO violations |
| Gate C unchanged C-060 | Exit 0; 10 operations; ZERO violations |
| Gate C original unit suite | 14 tests, ZERO failures/errors |
| Callback restriction | Seven blocked/stale cases, ZERO invocations |
| Fake positive control | One invocation per replay, proving callback wiring |
| CLI | Observed exits 0/1/2/3, invalid invocation and exclusive-output rejection |
| Replay | Exact semantic byte equality, 590,055 bytes per replay |
| Corpus preservation | All 78 pinned input files unchanged before/after |
| Source preservation | Four executable source files pinned before/after; README separately delivery-pinned |
| Offline audit | Eleven worker/nested-child records; ZERO network, process, read or write denials |
| Live experimental effects | ZERO workflow emissions, reruns, replacements, cancellations or cleanup calls |

Semantic replay SHA-256:
fedaf391616e9501c5fa21003dd0e62aa7b158dd3c4159527167063f5aa3f8e3

Semantic replay Git blob:
6995ab80a9d852d66436f3a14214f5922a5ebd6a

These counts refer to related fixtures/subcases, not independent reliability
samples or a probability estimate. The historical 53 diagnostics are multiple
invariants against one retained defective ledger, not 53 separate incidents.

## Mandatory coverage F01–F31

The machine-readable coverage and fixture-oracles files enumerate exact executed
subcases, profiles, expected outcomes, required invariant codes and affected
operation assertions. All following families executed; none is a promised test:

| Families | Executed coverage |
|---|---|
| F01–F04 | Exact GitHub/raw/API forms, structured-only request, missing issuance data, control-ref fallback and incorrect issuance pointer |
| F05–F08 | Original C-030 same-blob ref defect, diagnostic-prose removal, limited corrected content, differing blob, wrong repository/path/commit and wrong manifest ref despite correct request |
| F09–F15 | Missing response/URL/membership, assembly/verification and other-receipt clock substitution, valid equal clocks, unknown clocks, later attestation/origin inflation, malformed/naive/reversed clocks, timezone offsets and old event time |
| F16–F18 | R2 unresolved/reconciled administrative path, independent original-publication membership, escaped namespace and changed product subject |
| F19–F22 | Wrong/duplicate/swapped concurrent correlation, byte/length/Git-header/newline/SHA tamper, traversal/symlink/duplicate JSON/host/userinfo/query/escaping, symbolic/default refs and diagnostic redaction |
| F23–F25 | Changed output/content/bundle invalidating approval, checker composition, content-only freshness block, working positive fake callback, no planned-state inheritance |
| F26–F27 | Frozen negative and positive/checker regressions with original defect controls |
| F28–F31 | Order/run-metadata invariance, pointers/pins/cycles/orphans/profiles/CLI/exclusive output, wrong-operation/revision reconciliation and the full 57-entry legacy manifest |

Unsupported but well-formed URL forms are UNKNOWN and blocked for affected use;
contradictory supplied identity is FAIL. Invalid serialization/path input is exit
3. No negative oracle was weakened into approval. The F21 synthetic secret-URL
case tests redaction and correctly retains UNKNOWN for its unsupported form.

## Development findings and correction history

The delivery preserves development-history.json and prior local execution
logs/pins. Initial runs found an orchestration path-expression error, the exact
R2 legacy namespace suffix, and a test-audit dir_fd resolution defect. The last
had falsely counted normal temporary-directory cleanup as writes outside the
output root; resolution now uses the actual dir_fd target.

Stronger correlation checks later exposed missing-response fixtures that had
retained positive receipt clocks. Those fixtures were corrected to represent
genuinely missing evidence rather than inconsistent leftover confirmations.
Further work added source-pointer assertions, automatic nested-worker audit
aggregation, diagnostic redaction and strict raw historical-fixture custody.
The final candidate reran the complete contract after those changes.

Earlier source states were working copies, not separately published candidates.
Their logs/pins document the iterations; their bulky duplicate fixture archives
remain scratch intermediates. Only final-contract-005 is the fully delivered,
source-pinned, independently reproducible candidate. Historical frozen project
evidence was never repaired in place.

## Evidence index and reproduction

Under validations/PP-002/Q01-COLLECTOR/Q01-IMPL-001/:

- input-manifest.json — transitive original/capture file pins and origin refs.
- custody/ — actual source-materialization boundaries, immutable membership
  receipts and protected-ref prepublication observations.
- fixture-oracles.json — explicit test assertions and observed outcomes; not
  a normalizer-generated expected verdict.
- fixture-inventory.json — retained/synthetic source provenance and archive map.
- final-summary.json — observed final measurements and old-checker results.
- development-history.json and retained prior logs/pins — corrections and limits.
- final-contract-005/ — exact commands/exits, stdout/stderr, source pins, original
  regression outputs, all nested audits, two semantic replays, coverage and
  source-deduplicated fixture inputs.
- artifact-manifest.json — delivery file pins, excluding itself and this report
  to avoid a self-referential hash cycle.

The README gives a fresh offline reproduction command and schema. Use a NEW
output directory; do not overwrite canonical evidence. Independent review may
reconstruct each archived fixture in a new root using its materialization map
and compare the guard's canonical bytes to its retained result.

Audit containment is Python-process enforcement with a sanitized child
environment, not an OS network-namespace or hostile-code sandbox proof.
No credential material is passed to workers. Writes are restricted to isolated
test outputs; no original validator/source/evidence file changed. The final
temporary tree contains four empty directories, no retained test payload files;
these bounded scratch directories are excluded from delivery. No external
cleanup obligation was created.

## Exact source identities

| New source | Git blob |
|---|---|
| README.md | ce02a0f3b53decd85799c478554a06fda85196b2 |
| collector.py | 10d1407628539798ef93a2d354373eed3091fefd |
| guard.py | e0394656cf4ba1034f09e6bf34ccc6c4b9ec52e0 |
| test_guard.py | d84329edf65a2557d0e3a2ff6ecdd398ffb3a906 |
| run_contract.py | c63b4fa72493da9d2b1b29446e7e24a223e5bbeb |

Original validators retained:
- R1 blob e189cf780fbb0711fa442f342bec5d760bf4f3b1,
  SHA-256 0ebe717cb4830d376668a9d3ac193fd026399279c09a68af656e04d566247633.
- Gate C blob 80591dd78b7aa414913e7a08767b0e6a2c7e5623,
  SHA-256 3b8fd9b243573b30845b644a1189ae5624e1d644d074e39137a09451d98e29cf.

Full new-source SHA-256/byte pins are in implementation-pins.json and the
artifact manifest. The report's publication/blob identity belongs to the
postpublication return envelope and is not invented before publication.

## Remaining limits and next authority boundary

The source index is an external trust anchor. A malicious producer able to
forge both raw receipts and their trusted pin index is outside the proven
property; these hashes do not cryptographically authenticate GitHub. A retained
request URL binds a tree response as a normal connector receipt, not as an
independent Git Merkle proof. Future callers must establish authority and use
the guard, persist issuance envelopes before transport, and retain original
receipts. This offline implementation is not live pipeline integration.

The fake wrapper freshly rechecks scoped custody, payloads and a separately
supplied state-check binding. It does not independently make that state checker
fresh, validate an untrusted caller's authority or grant an external effect.
It introduces no retries or replacement authority.

This assignment does not resolve platform conversation separation, missing
predecessor activity telemetry, actual revised-procedure recovery under quota
exhaustion, involuntary crash, lost issuance acknowledgement or global exactly-once
effects. No successful offline result upgrades Gate C or the final experiment.

Publication is limited to the five authorized new source files, new evidence
inside Q01-IMPL-001 and this report, using expected-head/CAS, force=false.
The consumed control contains 692 predecessor blobs; all must remain unchanged
in the prepared and published tree. Current control and all six product/
operational refs were checked before publication and must be checked again after.

PROTOCOL_PORTABILITY / PP-002 closes this implementation assignment by delivery
and remains accountable for its evidence. PC-003 should verify the exact
publication, review the known limits and separately assign independent DESIGN_QA.
Do not integrate the guard into live execution or treat self-test as acceptance.

IMPLEMENTED / READY FOR INDEPENDENT REVIEW

