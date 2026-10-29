# PP-002 — Q01 Source Retrieval Provenance Collector Guard
## Design handoff and deterministic offline test contract

artifact_id: PP-002-Q01-COLLECTOR-CORRECTION-DESIGN-HANDOFF
artifact_type: design_and_offline_test_contract
status: DESIGN COMPLETE / IMPLEMENTATION NOT AUTHORIZED
author: PROTOCOL_PORTABILITY / PP-002
recipient: PROJECT_CONTROL / PC-003
repository: KhaosMagnus/YU3DOH-Carder
consumed_control: b3049c7e3505e386a84dde16d47b5a7f0881b7da
authority_route: routing/ROUTE-PP-002_Q01_COLLECTOR_CORRECTION_DESIGN.md
frozen_scope: control/PP-002_Q01_COLLECTOR_CORRECTION_SCOPE.md
official_final_experiment_recommendation: REVISE / ACCEPTED
official_gate_c_result: REVISE / UNCHANGED
implementation_status: NOT IMPLEMENTED
test_execution_status: NOT RUN — EXPECTATIONS BELOW ARE CONTRACTS
new_live_execution_authority: NONE

## 1. Decision and bounded deliverable

Implement Q01, if separately authorized, as a new experimental retrieval-custody
adapter and pure offline guard alongside the original operation-state checkers.
Keep their source bytes, historical inputs, ledgers, manifests, corrections and
verdicts unchanged. No versioned successor of the R1 checker or Gate C observer
is necessary for this design: the new guard validates an additional, separately
pinned provenance sidecar and composes its verdict with the existing checker.
It neither adds fields to the old checkers' closed observed-state vocabulary nor
redefines PP-002 v2.

This handoff defines the fields, validation order, outcomes, publication boundary,
fixtures, deterministic oracle and independent verification needed for a bounded
offline implementation. It does not implement or run that implementation.
Publication of this design is the only authorized repository write.

Q01 prevents an unsupported retrieval-history claim even when the retrieved
content happens to be correct. It also detects intended/actual locator divergence
without turning an administrative filename discrepancy into an external operation
failure. The guard must never infer current workflow state, issue an operation,
retry a retrieval, choose a replacement, perform cleanup or move a ref.

## 2. Evidence and historical distinctions

**OBSERVED EVIDENCE — Q01.** The original C-030 manifest records the C-020 checkpoint
source_ref as 34011f6466ce096b310ef1c43c277d2bfd2af7aa. The retained append-only
correction attributes its actual fetch URL/ref to
1352de4daddc6c2143943af2ad7142333f7be963, with checkpoint blob
1b8055add2533d04e6c3b42e6344e3bee9c46614. This assignment independently retrieved
the checkpoint at both immutable revisions and verified that same blob.
That present read verifies content identity at those revisions; it does not
reconstruct the original connector invocation or its missing fields.
The correction reports original requested_at 2026-10-29T18:42:51.234Z and receipt_at
2026-10-29T18:42:51.743Z; those are historical, correction-attested facts, not
fresh observations. Its recorded_at is a later assembly clock. [Q01] [C-MAN]

**INFERENCE.** A blob-only check cannot detect this wrong revision attribution.
A guard needs distinct routing authority, request identity, returned identity,
commit/path membership and content digest. A later URL can establish a returned
locator without proving what the caller explicitly supplied at issuance.

**OBSERVED EVIDENCE — R2.** R2-INTENT-PUBLISH planned the literal
validations/PP-002/GATE-B-R2/000_INTENT.json, but published
validations/PP-002/GATE-B-R2/R2-000_INTENT.json at
e319d4b03cc04fd07dc88df90e06071bfff53ef2, blob
f2563ec430bce506abcf8d4bcc4d032a9272ee40. The original intent, R2-010 manifest,
recovery-entry and appended planning-path reconciliation bind the actual path.
The isolation root remained unchanged; no observed-state axis was derived from
the erroneous planned filename. [R2-I] [R2-M] [R2-REC] [R2-PATH]

**DESIGN DECISION.** Detect both discrepancies before a new decision bundle is
published or consumed. Preserve original defective bytes as negative evidence.
Allow an explicit, source-bound reconciliation of an administrative locator;
never silently replace the plan, alias all paths with identical bytes, or
relabel the historical incident as an external-state contradiction.

**PLAUSIBLE HYPOTHESIS — not a finding.** A similar fallback with a different blob
could select the wrong evidence subject. Differing-blob adversarial fixtures test
that risk; this did not happen in the established Q01 incident.

**POST-HOC RECONCILIATION EVIDENCE.** [Q01] and [R2-PATH] are later correction
records. They can support a new annotated projection, never retroactively make
the original manifests correct or prove the prevention guard existed.

P01 remains UNCERTAIN; P02 remains UNKNOWN. This design, its eventual unit tests
and a new collector cannot prove a platform conversation boundary or a missing
predecessor stop trace. Final experimental REVISE and Gate C REVISE stay frozen.

## 3. Proposed implementation boundary — not permission to implement

| Proposed additive path | Responsibility after separate authorization |
|---|---|
| validation/pp002-q01-collector/README.md | Contract, supported GitHub forms, limitations and offline commands |
| validation/pp002-q01-collector/collector.py | Request-envelope creation and response ingestion; supplied transport receipts only, no built-in network or publication client |
| validation/pp002-q01-collector/guard.py | Pure input-bundle validation and canonical verdict generation |
| validation/pp002-q01-collector/test_guard.py | Offline fixtures, mutations, metamorphic checks and oracle assertions |
| validation/pp002-q01-collector/run_contract.py | Bounded local runner, immutable pins, old checker regressions, reproducibility and write-boundary checks |
| validations/PP-002/Q01-COLLECTOR/<implementation-id>/** | Exclusive-created source copies, fixture index, sidecars, results, checksums and future implementation report |

These are proposed paths only. An implementation authorization must freeze the
actual baseline, allowed paths, dependency/command boundaries, output namespace,
closer and test contract. The implementation-id must be fixed, not silently
reused. No files in these paths are created by this assignment.

No-change areas: validation/pp002-gate-b-r1/**,
validation/pp002-gate-b-r2/**, validation/pp002-gate-c/**,
all historical validations/PP-002/GATE-*/** including correction files,
product code, .github/workflows/**, operational branches, Generic Protocol v1.0
and PP-002 v2. New evidence must cite original paths without editing them.

A future wrapper may invoke the original checkers in separate local processes,
with their pinned inputs, writing only to a fresh disposable output directory.
It may not monkey-patch, replace, weaken or reinterpret their verdicts.
The Gate C adapter's existing internal loading of the R1 core remains as frozen.
If integration ever requires changing their schema, constants or validation
semantics, stop and request a separately authorized versioned successor; that is
outside this additive design.

## 4. Input contract and separation of identities

Use strict UTF-8 JSON with duplicate object keys rejected. Identifiers are
nonempty strings; explicit missing values use the literal UNKNOWN plus a reason.
Absence, null, empty string and UNKNOWN must not silently mean the same thing.
Schema omissions are invalid; a present UNKNOWN is a typed uncertainty.

The input bundle contains immutable raw sources, a byte/digest index, retrieval
records, optional locator reconciliations, intended publication inventory and
an explicit claim profile for each use. It must carry:

| Object | Required fields / meaning |
|---|---|
| bundle | schema_version, bundle_id, authority_control_sha, authority_artifact, allowed_output_root, accountable_closer, sources, retrievals, locator_reconciliations, intended_publication, claim_profiles |
| source index entry | source_id, relative local_path, byte_length, sha256, git_blob_sha where applicable, origin_kind, origin_locator, authority/attestation scope |
| planned_locator | logical_operation_id, intended_repository, intended_ref, intended_path, allowed_namespace, plan_source_id and JSON pointer |
| request_capture | retrieval_id, logical_operation_id or NONE, transport_kind, raw explicit arguments, repository, requested_ref, requested_path, requested_url or UNKNOWN, requested_at, source pointers, capture_origin |
| response_capture | retrieval_id, tool/receipt source_id, returned repository/ref/path/URL or UNKNOWN, connector_blob_sha or UNKNOWN, content_source_id, response status, responded_at, receipt_at, source pointers |
| identity_binding | actual repository, actual immutable commit, actual path, actual URL, computed Git blob, returned blob, byte length, SHA-256, commit/path membership source_id, field-by-field derivation references |
| temporal_provenance | requested_at, responded_at, receipt_at, event_at, recorded_at, verified_at; each value plus source_id, JSON pointer, clock_role, capture_origin |
| locator_reconciliation | logical_operation_id, exact intended and actual locators, immutable plan/receipt/content references, discrepancy class, namespace check, authority artifact, closer, recorded_at, disposition and affected uses |
| publication inventory item | actual relative output path, content byte length/SHA-256/Git blob, source/claim dependencies, profile, intended-path linkage or NONE |

authority_control_sha is an authority field only. It is never an implicit
requested_ref, actual_ref, receipt time or file path. planned_locator contains
intent only; it supplies neither observed fields nor a substitute request.

For a normal connector fetch_file call, explicit repository/path/ref arguments
at issuance are primary request evidence. It is valid to have no caller URL
because that interface accepts structured arguments: requested_url is UNKNOWN
with reason NO_URL_ARGUMENT; the returned display URL stays returned identity.
A deterministic display URL constructed for comparison is labeled derived and
is not a record of a transmitted HTTP request.

Capture the immutable request envelope before invoking a transport in any
future authorized integration. Response ingestion requires that envelope ID,
then stores the raw response and joins by that ID, never by logical operation ID
alone, array position, filename or routing control. Prevent response A attaching
to request B, concurrent-task overwrite, and accidental reuse of a prior receipt.
No response permits RESPONSE_UNKNOWN, not a failed or nonissued operation.
An offline unit test may exercise this interface using a fake transport only.

Legacy import preserves absent original arguments as UNKNOWN. A surviving URL
or a later attestation is separately attributed; it must not be relabeled
AT_ISSUANCE. Permitted capture_origin values are AT_ISSUANCE_RECEIPT,
RETAINED_RESPONSE, LATER_ATTESTATION, SYNTHETIC_FIXTURE and UNKNOWN. A
LATER_ATTESTATION must reference its attestor and exact source; it is not an
independent original wire trace. Test records must never be represented as
historical or live receipts.

Proposed callable boundaries are capture_request(explicit_arguments,
request_source, clock), ingest_response(request_envelope, raw_receipt,
receipt_source, clock), and validate_bundle(bundle, profile). The first two
return new records without mutating their arguments; the last returns only a
verdict. The transport itself is supplied outside this module. Source pointers
use an exact source_id plus RFC 6901 JSON pointer; all must resolve to pinned
input bytes or a separately pinned capture envelope. No derived claim may be
its own supporting source. Duplicate retrieval/source IDs are invalid.

## 5. Exact identity and URL rules

1. Verify every source index entry against its raw bytes before parsing facts.
   Compute Git blob ID over the exact bytes using Git's blob header, independently
   of SHA-256; preserve UTF-8 bytes and line endings. A returned SHA is not proof
   that the path belongs to a particular commit.
2. Validate structured request repository/ref/path against the actual call
   envelope. Parse any requested URL independently. Preserve raw and parsed
   forms; compare every supplied identity field, rather than preferring whichever
   one matches the plan.
3. Bounded supported exact-locator forms are HTTPS GitHub blob URLs with an
   explicit 40-hex commit, raw.githubusercontent.com with an explicit 40-hex
   commit, and api.github.com repository contents URLs with one explicit
   ref=40-hex query parameter. A git/blob object endpoint establishes blob
   content only and requires a separate commit/path binding. Unsupported forms
   yield UNKNOWN for unsupported facts; they must not be guessed.
4. Parse hosts and URL components with a real parser. Reject userinfo,
   unexpected host/port, duplicate identity query keys, ambiguous escaping,
   traversal, absolute local paths and encoded path separators. Decode path
   segments once; preserve path case and exact repository file bytes. Do not
   split a branch name with slashes as if it were an immutable ref. Comparison
   allows only documented canonical host spelling and equivalent unambiguous
   percent encoding, never silent path/ref case folding or Unicode normalization.
   Reject cross-repository identity rather than inferring a repository redirect.
   Do not retain secrets or signed download query tokens in published diagnostics.
5. Compare request identity, returned identity, source URL identity, declared
   manifest fields and expectations. An exact requested commit differing from
   an exact returned/manifest commit is a contradiction even if their blobs are
   equal. Different blobs or wrong paths/repositories are additional violations.
   Missing request identity is UNKNOWN, not proof that returned identity is wrong.
6. Pin actual commit/path-to-blob membership with a retained Git tree/contents
   source at that immutable commit and verified content bytes. Check that it
   binds this repository, commit and case-sensitive path to this blob. A file
   with the same digest at a different path or commit is not an equivalent
   provenance claim. The local bundle index alone is not remote membership
   evidence.
7. Explicit mutable refs/default-branch requests are captured faithfully but
   are outside this first bounded guard's exact-request approval profile. They
   yield UNKNOWN for immutable selection unless already accompanied by an
   attributable exact membership source for an expressly limited content claim.
   A later branch-head query must never be treated as an atomic resolution of
   the earlier fetch. No auto-fetch or retry is part of this guard.
8. A connector display URL is a claimed locator, not independently conclusive
   HTTP redirect/wire evidence. If requested and returned exact refs differ,
   block and retain both. An unrelated matching-blob lookup cannot repair
   the request history.

## 6. Timestamp provenance rules

Every timestamp field carries its own source identity and clock role.
requested_at measures local connector invocation start when actually captured.
receipt_at measures completed observer receipt when actually captured.
responded_at may equal receipt_at only where the receipt explicitly defines
that alias; it is not an inferred server response clock. event_at refers to an
identified event inside the source, potentially much earlier.
recorded_at is local record assembly. verified_at is completion of the specific
verification run, not the external observation.

A valid value needs a resolvable pointer or a pinned request/receipt envelope
field. Missing original source timing stays UNKNOWN. A later attestation may
supply its reported value with LATER_ATTESTATION and its real source, never an
invented original capture. For an unchanged historical receipt, verification now
does not refresh that receipt's observation time.

Validate timezone-aware ISO-8601 values and compare instants without changing
the retained literal. For a single declared local observer clock, known request
start must not exceed known receipt completion. Do not require cross-machine
event clocks to order against local clocks without a stated clock relation.
A known contradiction in the same declared clock is FAIL, not silently clamped.
No arbitrary age/freshness threshold is introduced by Q01.

Clock-role provenance, not numerical inequality, detects GB-D02-style errors.
receipt_at taken from recorded_at or verified_at is invalid even if formatted
correctly. Genuine receipt and assembly values that happen to be equal are
allowed when independently bound to their proper sources. A source containing
a field named observed_at is not automatically a receipt clock: its actual
semantics and derivation must be bound. Unknown source time cannot be replaced
with implementation run time.

For byte-reproducible tests, recorded_at and verified_at are fixed explicit
fixture clocks labeled SYNTHETIC_FIXTURE, or supplied replay metadata. For a real
future validation run, its new local verification clock belongs to a separate
run envelope. The deterministic semantic result excludes that variable envelope;
neither test replay nor a replay timestamp is a fresh external observation.

## 7. Locator discrepancy and reconciliation rule

Compare intended exact administrative output path with actual publication
inventory/receipt path. A discrepancy must be reported before decision-bundle
publication; no suffix guessing or global path aliases are allowed.

For R2, classify ADMINISTRATIVE_LOCATOR_MISMATCH, not
OBSERVED_OPERATION_STATE_CONTRADICTION. Before a valid reconciliation, the
affected administrative locator/use is blocked, while raw diagnosis and unrelated
work within authority can remain available. Do not change lifecycle, outcome,
effect, evidence, cleanup or acknowledgement axes merely because these paths
differ.

An explicit reconciliation may validate the actual administrative locator only
if it binds both old and actual names, exact blob/publication, unchanged allowed
namespace/subject, authorized disposition and closer, and explains any affected
uses. It preserves the plan and emits RECONCILED_ADMINISTRATIVE_LOCATOR with
all source references. A digest match alone is insufficient. No reconciliation
can expand an authorized namespace or product subject. Escaped namespace or
missing authority requires BLOCK/referral to PC-003; a record author cannot
invent permission. Historical [R2-PATH] is admissible as a retained reconciliation
for historical projections, not approval to change that plan or rerun anything.

## 8. Deterministic evaluation, verdicts and diagnostics

Evaluate sources and derived claims in this order: schema and file boundaries;
source-byte pins; request/receipt correlation; URL and structured identities;
commit/path/blob membership; timestamp roles; locator/namespace consistency;
claim-profile completeness; composed publication eligibility. Collect all
independently determinable violations in stable order. Missing evidence cannot
mask a contradiction already established by other evidence.

Every issue has retrieval_id, logical_operation_id or NONE, invariant_code,
affected_claim, expected, actual, source references with JSON pointers, severity
and blocked_use. Multiple issues for one defect are diagnostics, not multiple
incidents. No diagnostics are inferred from an expected-results file.

| Condition | Typed finding | Profile verdict / consequence |
|---|---|---|
| Exact explicit request, returned URL/ref/path, membership and bytes agree | EXACT_IDENTITY_VERIFIED | PASS if profile's other required facts hold |
| Requested ref unavailable | REQUEST_IDENTITY_UNKNOWN | UNKNOWN for exact request-history use; no routing fallback |
| Exact refs differ, same blob | REF_MISMATCH_IDENTICAL_BLOB | FAIL for the conflicting provenance; content equality does not waive it |
| Exact refs differ, different blobs | REF_MISMATCH_DIFFERENT_BLOB and blob violations as supported | FAIL / BLOCK affected use |
| Response/receipt absent | RECEIPT_UNKNOWN | UNKNOWN; no nonemission/failure inference |
| Caller URL absent in a structured-argument call | NO_URL_ARGUMENT | Explicit field UNKNOWN; not a failure if complete structured identity and supported returned locator suffice |
| Required returned locator or membership missing | RETURNED_IDENTITY_UNKNOWN or MEMBERSHIP_UNKNOWN | UNKNOWN for exact content use; block that use |
| Receipt time missing, identity/content verified | SOURCE_RECEIPT_TIME_UNKNOWN | UNKNOWN for freshness-dependent use; can pass limited content-only profile |
| Timestamp uses assembly/verification pointer | TIMESTAMP_ROLE_CONFLATION | FAIL / BLOCK affected use |
| Material intended/actual path mismatch, unresolved | ADMINISTRATIVE_LOCATOR_MISMATCH | FAIL for affected locator use; no automatic state-axis change |
| Valid scoped administrative reconciliation present | RECONCILED_ADMINISTRATIVE_LOCATOR | Resolved deviation retained; actual-locator profile may PASS |
| Sources/bytes change after validation | VALIDATED_BUNDLE_CHANGED | FAIL / no publication authorization from earlier verdict |

The same guard supports two fixed, explicit profiles:

- EXACT_REQUEST_HISTORY requires attributable issuance arguments, exact immutable
  requested identity, matching returned locator, commit/path membership, bytes,
  and traceable request/receipt clocks. Missing material fields give UNKNOWN.
  event_at may remain UNKNOWN if no source event is claimed.
- EXACT_CONTENT requires exact actual repository/commit/path membership and
  verified bytes/returned locator, with no unresolved material contradiction.
  Missing issuance arguments/times remain explicitly UNKNOWN and cannot be
  used to claim accurate request history, freshness or current execution state.
  An annotated corrected historical projection may PASS only this narrow profile.

For either profile, FAIL outranks UNKNOWN, which outranks PASS. Optional UNKNOWN
values do not prevent PASS for a profile that explicitly excludes those claims.
Verdict output includes profile, verified_claims, unknown_claims, violations,
resolved_deviations, permitted_uses, blocked_uses, source and bundle digests and
a fixed guard version. No output says generic EVIDENCE_VERIFIED or changes an
operational safe action just because this custody guard passes.

A decision consumer that needs fresh operation state must also pass its frozen
operation-state checker and that checker's source timing/authority/effect rules.
EXACT_CONTENT PASS is insufficient for such use. Missing a required source/
observation fact gives BLOCK for that affected decision; no blind retry.
No new v2 safe-action vocabulary is introduced.

CLI contract for a future guard: exit 0 = requested profile PASS; exit 1 = FAIL;
exit 2 = UNKNOWN/incomplete material evidence; exit 3 = invalid invocation or
unreadable/unpinned input. All nonzero exits prohibit approval of affected
decision publication. Expected-negative test execution can succeed as a test
while the guard correctly exits 1.

Proposed command interface, specified only and not executed here:
python3 validation/pp002-q01-collector/guard.py --input-root ROOT --bundle FILE
--profile EXACT_REQUEST_HISTORY|EXACT_CONTENT --output NEW_RESULT_FILE.
Paths are root-relative and checked before reading; output is exclusive-created.
The result schema has schema_version, guard_version, bundle_id, bundle_sha256,
profile, verdict, verified_claims, unknown_claims, violations,
resolved_deviations, permitted_uses and blocked_uses. No default profile is
allowed. Source index and candidate payload digests exclude the result itself.
Only fixed input facts affect semantic output; local execution metadata is a
separate envelope. The implementation must pin its complete schema before tests.

A corrected historical projection explicitly names supersedes_claim_source and
supersedes_claim_pointer, retains the original false claim as audit evidence,
and attributes the replacement to its correction source. It does not change
the original manifest's FAIL. In particular F06 cannot pass by merely deleting
the contradictory source_ref or asserting that identical blobs reconcile refs.

## 9. Publication and decision-use boundary

The future guard is a capability-free precondition checker, not a GitHub writer.
It produces an approval record bound to the exact candidate bundle index digest,
every payload path/content digest, profile and authority baseline. The orchestrator
must rehash those exact bytes immediately before any authorized publication or
decision consumption. A changed payload, target path, source dependency or
authority baseline invalidates approval; validate the new candidate instead of
reusing a prior PASS.

For current-state decision bundles, all material provenance dependencies and the
unchanged operation checker must pass for the intended use. Neither checker alone
approves the bundle. An original defective manifest cannot be excused by a PASS
from the independent state ledger.

FAIL or UNKNOWN does not delete evidence. Raw defective sources and append-only
diagnostics may be retained under a clearly AUDIT_ONLY namespace with status,
prohibited uses and links to the original defect. Such archival is distinct from
publishing an approved current observed ledger. No automatic correction, retry,
replacement or workflow emission follows a failed guard.

Publication inventory must include the actual target filename, including planned
administrative locator comparisons. Avoid self-referential hashes: approval pins
source and candidate payload bytes; its own diagnostic bytes and any later Git
commit/ref receipt are separate append-only custody records. The candidate cannot
contain its not-yet-created Git commit SHA as an observed fact. A prepublication
tree check verifies the proposed inventory; a later independently recorded receipt
can verify actual publication.

Existing expected-head/CAS, force=false, unchanged predecessor blobs, unoccupied
new paths and protected-ref checks still govern any separately authorized writer.
CAS failure requires read-only inspection and reconciliation, not an automatic
rebase/write loop. The guard neither grants publication authority nor proves
that a client actually used it; end-to-end tests must verify the wrapper blocks
the publication callback before side effects when approval is non-PASS or stale.

## 10. Offline fixture inventory and oracle

All following results are **expected, not executed**. Fixtures are exclusive new
copies under the future assignment's allowed evidence root. Each index entry
pins origin commit/path/blob, byte count and SHA-256; synthetic deltas carry an
explicit base and delta description. Never modify an original to obtain PASS.

Historical minimum corpus:

- Original C-030 source-recovery-manifest at its publication
  65c3d4a949fb15416ad180176511f557577eddab, blob
  a6135c91d13e267fbffb9c72fa0def6aa9712b67, plus [Q01].
- C-020 checkpoint at both 1352de4daddc6c2143943af2ad7142333f7be963 and
  34011f6466ce096b310ef1c43c277d2bfd2af7aa, same verified blob, with exact
  commit/path membership sources. Current design retrievals are not substitutes
  for the missing original issuance envelope.
- [R2-I], [R2-M], [R2-REC], [R2-PATH] and their cited publication receipt, with
  actual immutable path membership. Preserve corrections as later attestations.
- Unchanged Gate B 010 negative, R1 input-manifest/corrected derivation/test suite,
  and Gate C original adapter/test suite and their exact input dependencies.
  The later implementation must pin the complete transitive corpus before tests;
  no lazy network download is permitted inside the offline runner.

| ID | Input / mutation | Required oracle |
|---|---|---|
| F01 | Complete synthetic explicit-commit request and matching receipt/URL/tree/bytes | Both profiles PASS, zero violations, no UNKNOWN for required fields |
| F02 | Same complete structured call, no caller URL argument | PASS with requested_url UNKNOWN/NO_URL_ARGUMENT; no fabricated transmitted URL |
| F03 | Remove retained requested_ref and request evidence; keep unrelated control SHA | EXACT_REQUEST_HISTORY UNKNOWN; requested_ref remains UNKNOWN; no fallback |
| F04 | F03 plus copy routing SHA into requested_ref without a source pointer | FAIL: unsupported request identity even if a matching file exists there |
| F05 | Historical C-030 checkpoint row compared to [Q01]'s attributed actual URL and both membership bindings | FAIL: REF_MISMATCH_IDENTICAL_BLOB; report original row, correction pointer, both refs, exact same blob |
| F06 | New append-only historical Q01 projection: request identity UNKNOWN where original issuance absent; actual locator from attributed correction, bytes/membership pinned | EXACT_CONTENT PASS with limited claims; EXACT_REQUEST_HISTORY UNKNOWN; no manufactured at-issuance proof |
| F07 | F05 with distinct returned content/blob at the actual ref | FAIL: ref mismatch and supported content/blob discrepancy, never equal by logical ID |
| F08 | Correct blob bytes but wrong repository, case-sensitive path or commit/path membership | FAIL for each supplied contradictory identity; no cross-path digest alias |
| F09 | Missing response, missing required returned URL, or missing membership, separate cases | Relevant profile UNKNOWN with explicit blocked claim; never failed/nonissued inference |
| F10 | Receipt timestamp populated from recorded_at or verified_at, including equal numeric values | FAIL: TIMESTAMP_ROLE_CONFLATION with exact inappropriate pointer |
| F11 | Correct independent receipt and assembly pointers, coincidentally equal time values | PASS; no inequality heuristic |
| F12 | Missing original request/receipt times; independently source-bound event time present | Times remain UNKNOWN; request-history UNKNOWN; limited content PASS if all identity facts verified; event not substituted |
| F13 | Later attestation for source times | Origin remains LATER_ATTESTATION; no AT_ISSUANCE upgrade; claimed stronger history fails |
| F14 | Malformed/naive times, or reversed known request/receipt on one clock | FAIL with timestamp code; no clock repair |
| F15 | Old event timestamp versus later receipt; timezone-equivalent literals | PASS when properly attributed; retain literals, compare instants only where required |
| F16 | Historical R2 plan and actual path, reconciliation withheld | FAIL: ADMINISTRATIVE_LOCATOR_MISMATCH for R2-INTENT-PUBLISH; no operation-axis mutation |
| F17 | F16 plus valid [R2-PATH], actual receipt/membership and unchanged namespace | Actual-locator use PASS with RECONCILED_ADMINISTRATIVE_LOCATOR; preserve plan and both names |
| F18 | R2-like different output root or product subject, even with matching bytes and self-authored correction | FAIL / BLOCK: no authority expansion from reconciliation |
| F19 | Request A receives receipt B, repeated retrieval ID, swapped concurrent responses | FAIL: correlation/identity errors, not a best-match join |
| F20 | Modified source bytes, blob header/length, newline or returned blob SHA | FAIL: independent digest/binding checks; no reserialization before hashing |
| F21 | Traversal/symlink escape, ambiguous URL ref/path, duplicate ref query, hostile host/userinfo, duplicate JSON key | Reject invalid input deterministically; no external access or path escape |
| F22 | Symbolic ref with slash or omitted default ref | Preserve literal/missing request; UNKNOWN for exact-history profile; never parse a guessed SHA |
| F23 | Candidate output/content changed after approval, or approval copied to a second bundle | FAIL on pre-use binding; publication fake callback count ZERO |
| F24 | Only operation-state checker passes but Q01 guard fails; then reverse the two | Composed approval false in both cases; affected publication callback ZERO |
| F25 | Change planned lifecycle/ACK, IDs unchanged; omit actual receipt | No observed-state derivation from intent; relevant custody UNKNOWN, old checker rejects unsupported operation claim |
| F26 | Historical defective Gate B 010 through frozen R1 checker | FAIL; existing six mandatory GB-D01/D02 controls remain detected; Q01 does not replace/reinterpret them |
| F27 | Corrected R1 derivation and pinned Gate C ledger through their unchanged checkers | Preserve their existing valid results; Q01 is a separate dimension, not retroactive correction |
| F28 | Reorder source index/object keys and issue ordering; repeat same fixed input/clocks twice | Identical canonical semantic result bytes; stable issue order and digest |
| F29 | Invalid source pointer, missing pin, cyclic/self-derived identity, orphan receipt, unknown profile | No permissive default; FAIL or invocation/input exit 3 as typed below |
| F30 | Wrong-path reconciliation applied to different operation or revision | FAIL: reconciliation scope mismatch; no global alias table |
| F31 | Full legacy 57-entry C manifest with partial original request metadata | Known Q01 contradiction is reported; missing fields elsewhere stay UNKNOWN; no assertion that all 57 exact histories are reconstructable |

For F21, malformed serialization/duplicate keys or unreadable/escaped local input
is exit 3; well-formed but contradictory supplied URL identity is FAIL/exit 1.
For F29, unreadable/unpinned/unparseable input or unknown profile is exit 3;
a well-formed claim with unresolved/false source pointer, a cycle or orphan
correlation is FAIL/exit 1. Ordinary explicitly missing historical fields are
UNKNOWN/exit 2, not malformed input. These distinctions are fixed test oracles.

The fixture expected-results index specifies minimum invariant codes, affected
IDs, required pointers and permitted/blocked uses, independently authored from
raw facts. The guard must derive findings by comparing source values, not by
reading diagnostic labels in [Q01], [R2-PATH] or expected-results.
For F05, [Q01]'s URL/ref/time statements are explicitly later attestations;
omitting its classification/cause/disposition prose must not remove the ref
mismatch finding. For F17, raw plan/receipt values and a valid scoped disposition
are required, not acceptance of a string containing RECONCILED.

## 11. Determinism and independent offline validation procedure

The subsequent authorization should name an implementer and an independent
reviewer/closer. This does not require or authorize spawning agents now.
Use Python 3.10+ standard library and no package installation, sockets, GitHub
client, Actions command, shell network command or credential lookup.

1. Materialize the frozen input corpus as authorized read-only evidence before
   entering the offline test environment. Pin the exact implementation, source
   corpus, original validators and fixtures; reject incomplete transitive inputs.
   Record provenance limitations of each legacy source.
2. Independently verify Git blob IDs, SHA-256, byte counts, original source file
   equality and allowed write roots. The fixture generator may not manufacture
   missing historic request fields or receipt times.
3. Review F05/F16 by reading original fields, actual URL/ref/blob/membership and
   literal planned/actual paths. Derive expected findings without importing the
   guard. Keep this oracle independent of the implementation's normalizer.
4. Run the same guard against all positive, negative and adversarial fixtures.
   Assert verdict, exit, minimum invariant codes, IDs, source pointers, UNKNOWN
   preservation, permitted uses, and zero publication callback invocations for
   any affected non-PASS use. A normalizer-only unit test is insufficient.
5. Execute unchanged R1/Gate C regression suites and original negative/positive
   checks from their materialized dependency-complete inputs, outputs directed
   to new scratch paths. Retain old expected results as historical expectations;
   do not claim this handoff reran them. A proposed implementation must report
   actual commands, exit codes and fixture coverage, including any input gaps.
6. Repeat identical fixed-clock fixtures in two fresh output directories.
   Canonical JSON is UTF-8 without ASCII escaping, sorted keys, comma/colon
   separators without spaces, one terminal newline,
   no NaN/Infinity; sort issues by retrieval ID, logical operation ID, code,
   affected claim and canonical detail. Require exact byte equality and digests
   for each semantic result. Report measured digests, not promised hashes.
7. Vary ignored local run-clock metadata and index order: semantic identity,
   state of UNKNOWN facts and decisions must remain invariant. Keep the variable
   verification-run envelope separate and hash it separately.
8. Check that original files and validators are byte-identical after tests,
   outputs are exclusive-created, writes stayed within the fresh roots and no
   network/publication capability was used. Any input tamper or occupied output
   causes failure without overwrite. No shell arbitrary-command fixture hooks.
9. Reviewer reproduces from pinned bytes and checks results against the
   independent oracle, not only an implementer summary. Missing reproducibility
   or unresolved material contradictions returns correction/blocked acceptance;
   no live retest is implied.

The proposed gate is offline acceptance of a collector guard, not a new Gate B
or C. Its PASS would mean only the bounded contract was implemented and
reproducibly satisfied. It would not prove platform separation, actual quota/
crash handling, lost issuance acknowledgement recovery, production exactly-once
effects, remote truth of an untrusted connector, or enforced use by every
possible publisher. Future live integration requires its own authority.

## 12. Acceptance contract and measurements

A future offline correction can be accepted only if all mandatory fixtures meet
their exact oracle, no required negative case is skipped, complete synthetic
positive fixtures have zero violations, UNKNOWN remains explicit in incomplete
fixtures, and original validators/evidence remain byte-identical. It must
demonstrate:

- known C-030 wrong-ref/same-blob rejected, no routing fallback;
- R2 wrong locator rejected before scoped reconciliation, administrative axes
  unchanged, valid actual locator accepted after source-bound reconciliation;
- URL/structured ref/path/blob/membership mismatches rejected before affected
  fake publication/decision callback;
- assembly/verification clocks never used as source receipt clocks, with both
  equality-positive and equality-negative tests;
- incomplete evidence fails closed for the exact affected profile without
  fabricating information or blocking unrelated authorized content use;
- stale approvals invalidated by actual path/source/payload changes;
- unchanged old-checker regression behavior and byte-reproducible guard results;
- ZERO live emissions, retries, replacements, external effects or ref changes.

Record fixture counts by type and profile, issue coverage, UNKNOWN field counts,
reconciled locator counts, original blob checks, result byte/digest comparisons,
wall time and bounded local resource use. Fake callback counts and local write
audits are separate from real operations; do not label them live recovery.
Record actual manual preparation/reviewer effort if measured, not invented cost
savings. Use one source bundle and per-retrieval records plus a fixed policy;
do not require a new operation ledger for every pure file read.

No test results, performance values, reproducibility hashes or preventive
effectiveness are asserted by this design. Missing baseline inputs, guard
ambiguities or an integration requiring frozen-file changes must return to
PC-003 before implementation scope expands.

## 13. Verified source inventory

All sources below were read from GitHub at the consumed control unless the row
specifies another immutable revision. Their returned Git blob identities were
checked against exact content bytes locally. At consumed control the recursive
tree was complete, contained 688 blobs, contained no AGENTS.md, and the handoff
output path was absent. This is custody verification of design inputs, not
execution of the proposed tests.

| Label / repository path | Git blob |
|---|---|
| [DISP] runs/PP-002_FINAL_REVISE_DISPOSITION.md | ea9b4fcf6cf9771c79fe0606a4d0e21143717771 |
| [ROUTE] routing/ROUTE-PP-002_Q01_COLLECTOR_CORRECTION_DESIGN.md | 4b80f62dfcc8e91346943a83aa971747d5e9f596 |
| [SCOPE] control/PP-002_Q01_COLLECTOR_CORRECTION_SCOPE.md | 87725e4081547a1082e7bfa7dd3c44ba95ce2ed8 |
| [Q01] validations/PP-002/GATE-C/S02/source-reference-audit-correction.json | f53d082705f74e4e9bbe8dac84817baf511fea17 |
| [REQ] control/PP-002_GATE-C_PROVENANCE_CORRECTION_REQUIREMENTS.md | cb6623ad2317e5d8549e58bba7ec4a9a371ac3d5 |
| [R2-PATH] validations/PP-002/GATE-B-R2/planning-path-reconciliation.json | 71aa7dcfa78b91c3aa4771ffb95bbacd96e4a27e |
| [C-MAN] validations/PP-002/GATE-C/S02/source-recovery-manifest.json | a6135c91d13e267fbffb9c72fa0def6aa9712b67 |
| [C-CODE] validation/pp002-gate-c/observer.py | 80591dd78b7aa414913e7a08767b0e6a2c7e5623 |
| [R1-CODE] validation/pp002-gate-b-r1/revalidate.py | e189cf780fbb0711fa442f342bec5d760bf4f3b1 |
| [P01-P02] control/PP-002_P01_P02_EXISTING_EVIDENCE_ASSESSMENT.md | d91530a5393f2c6b92dd55fadbf88ab367c1345b |
| [R2-I] validations/PP-002/GATE-B-R2/R2-000_INTENT.json | f2563ec430bce506abcf8d4bcc4d032a9272ee40 |
| [R2-M] validations/PP-002/GATE-B-R2/R2-010_MANIFEST.json | 1ff5d37285d13f0ce422d161fa29abe5070f29b3 |
| [R2-REC] validations/PP-002/GATE-B-R2/recovery-entry.json | 393a0db65358b2182a4224895dd7d269f712553e |
| [C-README] validation/pp002-gate-c/README.md | 9c1fe1926e4218012fb1eb0300fae0ae220b0b99 |
| [R1-README] validation/pp002-gate-b-r1/README.md | 6dcc8ec548b818111bd3d7752bd48bb0fe8ae97f |
| [C020] validations/PP-002/GATE-C/C-020_S01_ROLLOVER_CHECKPOINT.json — separately read at 1352de4daddc6c2143943af2ad7142333f7be963 and 34011f6466ce096b310ef1c43c277d2bfd2af7aa | 1b8055add2533d04e6c3b42e6344e3bee9c46614 |
| [FINAL] protocols/PP-002_FINAL_EXECUTION_INTERRUPTION_RECOVERY_RECOMMENDATION.md | b89d24271eeec9a6880a68ce97fa788326cbbe0a |

Verified source-code SHA-256 pins:
- C-CODE: 3b8fd9b243573b30845b644a1189ae5624e1d644d074e39137a09451d98e29cf
- R1-CODE: 0ebe717cb4830d376668a9d3ac193fd026399279c09a68af656e04d566247633

Original controls, evidence and implementation sources stay at their historical
locations. This handoff creates no new copy represented as the canonical old
source and no new authority over it.

## 14. Publication custody and return contract

Expected parent/head lease: b3049c7e3505e386a84dde16d47b5a7f0881b7da.
Publication scope: this new handoff only, on meta/project-control, force=false.
Verify the new report blob/parent, preservation of every predecessor blob and
unchanged protected/operational refs after publication. Report the publication
SHA and handoff blob in the return envelope; they cannot be self-embedded as
observed facts before this artifact exists.

Protected/ref baseline independently checked for this assignment:

| Ref | Frozen SHA |
|---|---|
| main | 54cc3aad246c89a29f2a18be63c539db68cae041 |
| feature/workspace-v0.1 | e11579950ef7ed20e4b6eeee88f9c3597c1f074b |
| feature/workspace-run-026 | e11579950ef7ed20e4b6eeee88f9c3597c1f074b |
| ops/pp-002-gate-b-actions | dd6e8bfecadab0a83c8008ea65300b1f0ba518f8 |
| ops/pp-002-gate-b-r2-actions | 0e679ad863076098d92d8a7704f6ca88948b651b |
| ops/pp-002-gate-c-actions | 9c508d06e3862b4b142e998708026a5ed8757fd0 |

Terminal design disposition: DESIGN HANDOFF COMPLETE — REVIEW REQUIRED BY PC-003.
No new gate PASS/REVISE/FAIL is issued for this design-only assignment.
PC-003 may review this contract and separately authorize bounded offline
implementation and independent testing. That authorization is not presumed.

RETURN: PROTOCOL_PORTABILITY / PP-002 -> PROJECT_CONTROL / PC-003.
Official final recommendation REVISE and Gate C REVISE remain unchanged.
P01 UNCERTAIN; P02 UNKNOWN. Generic Protocol v1.0 and PP-002 v2 remain frozen.
Implementation, live execution, product/protected/historical operational ref
movement, protocol successor and adoption remain NOT AUTHORIZED.

