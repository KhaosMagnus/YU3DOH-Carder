# Q01-IMPL-001 — bounded offline retrieval-custody guard

Authority: `control/PP-002_Q01_OFFLINE_IMPLEMENTATION_AUTHORIZATION.md` at
`565a197ce19d3ed140b002e1d709644cfbdda79e`.
Contract: `handoffs/PP-002_Q01_COLLECTOR_CORRECTION_DESIGN_HANDOFF.md`,
blob `c72e0a6d0889ceee4e901126a33587072180017f`.

This additive Python 3.10+ standard-library implementation has no network client,
credential lookup, workflow, retry, cleanup or Git publisher. It does not change
the original R1/Gate C validators or the recovery model. The implementation
self-test is not independent QA, production integration or protocol adoption.

## Files and callable boundaries

- `collector.py`: `capture_request(explicit_arguments, request_source, clock)`
  creates a fresh issuance envelope; `ingest_response(request_envelope,
  raw_receipt, receipt_source, clock)` preserves response identity and correlation.
  Both copy inputs, accept an injected clock and perform no transport. A future
  authorized caller must durably persist the request before a transport call.
  These functions alone do not guarantee that a caller actually persisted it.
- `guard.py`: `validate_bundle(bundle, profile, root)` returns deterministic
  custody findings; `approve` binds those findings to exact source/payload pins,
  authority baseline, profile and paths; `use_if_approved` freshly checks all
  those bytes and the separately supplied state-check binding before invoking
  an injected callback. Only a counted fake callback is used in this assignment.
- `test_guard.py`: F01–F31 raw-fact oracles, historical projections and synthetic
  fault cases; legacy correction prose is not the mismatch oracle.
- `run_contract.py`: isolated worker/child execution, unchanged historical
  regressions, replay and source/write/capability checks.

The input index is a trust boundary. Hashes prove supplied byte identity, not
remote truth or authenticity of a malicious producer. The source index must be
pinned and reviewed by the independently authorized caller; a self-asserted
origin is not an external attestation. No cryptographic source signature,
platform conversation identity or complete activity trace is invented.

## Reproduce offline

From a full checkout containing this implementation, existing frozen historical
files and its evidence, select a NEW output directory in the authorized root:

```bash
python3 -B validation/pp002-q01-collector/run_contract.py --input-root . --output validations/PP-002/Q01-COLLECTOR/Q01-IMPL-001/review-offline-001
```

Do not reuse an occupied output directory. No install/download is required.
The runner verifies the pinned transitive corpus before and after, pins its
own source bytes, runs R1's original runner (22 regressions and original
negative/corrected positive), validates Gate C C-020 and C-060, runs its original
14-test suite, and executes all 31 Q01 families twice in fresh fixture roots.
All child Python commands pass through the same bounded worker.

Worker audit hooks deny socket/HTTP operations, credential/outside-project reads,
writes outside the disposable output root, and unapproved child commands.
The environment passed to workers contains only explicit test/runtime variables;
it does not inherit credentials. A bounded local uname metadata query is permitted.
This is Python-process containment and source review, not an OS network-namespace
or hostile-code sandbox claim. Audit records include nested worker children.

Temporary synthetic files remain in the declared output root; normal fixtures
clean them up. A malformed path/duplicate key is rejected before decision use.
The runner archives replay A's source-deduplicated fixture inputs with a mapping
back to each fixture's original relative paths. Reconstruction uses these maps,
not a new provenance claim. Replay B produces the same semantic output without
duplicating the fixture archive. Clocks that vary by run belong only to receipts.

## Fixed bundle and claim schema

Top-level required fields: `schema_version="Q01-bundle-v1"`, `bundle_id`,
`authority_control_sha`, `authority_artifact`, `allowed_output_root`,
`accountable_closer`, `sources`, `retrievals`,
`locator_reconciliations`, `intended_publication`, `claim_profiles`.
Both fixed profiles must be listed. `run_metadata` is explicitly nonsemantic.
Unknown extra top-level intent metadata is never a source of observed facts.

Each source entry has `source_id, local_path, bytes, sha256, git_blob_sha,
origin_kind, origin_locator, role`; optional `derived_from` lists dependencies,
with cycles/unresolved dependencies rejected. Paths are contained, no symlink
traversal is allowed, JSON keys are unique, and byte pins precede parsing.
Allowed origins are AT_ISSUANCE_RECEIPT, RETAINED_RESPONSE, LATER_ATTESTATION,
SYNTHETIC_FIXTURE and UNKNOWN. Roles are REQUEST_ENVELOPE, CONNECTOR_RECEIPT,
TREE_MEMBERSHIP, CONTENT, HISTORICAL_RECORD, PLAN, RECONCILIATION, AUTHORITY and
LOCAL_RECORD.

A claim is `{value, source_id, pointer, capture_origin}`. A present UNKNOWN
requires `value/source_id/pointer/capture_origin="UNKNOWN"` plus a reason.
It is not null/empty/default. Known values must equal the RFC 6901 pointer's
value in independently pinned source bytes. Only explicit URL_REPOSITORY,
URL_REF or URL_PATH transforms are permitted, labeled as derived identity rather
than transmitted URL. Source origin must match the claim origin.

A retrieval contains:
- `retrieval_id, logical_operation_id, request_source_id,
  response_source_id, content_source_id, membership_source_id`;
- `request` claims repository/ref/path/url at the issuance envelope's exact
  `arguments.repository_full_name/ref/path/url` pointers;
- `response` claims repository/ref/path/url/blob from its own correlated receipt;
- `temporal_provenance` claims requested_at/responded_at/receipt_at/event_at/
  recorded_at/verified_at, each with its own clock_role and optional clock_id;
- optional `declared_identity` ref/blob claims for a legacy manifest;
- optional `planned_locator` with a source-bound planned_path, allowed_namespace,
  product_subject=NONE;
- optional `supersedes` naming exact old claim source/pointer and correction
  source/pointer. The original claim remains defective; annotation does not
  erase the original FAIL.

Time claims require their own role and source. requested_at and receipt_at
bind to the exact correlated envelopes; responded_at may explicitly alias
receipt_at with receipt_alias=true. Recorded/verified clocks cannot serve as
receipt clocks, even if numerically equal. Missing original clocks remain
UNKNOWN. Later-attested time remains later-attested. Same-clock request/receipt
order is checked; event clocks on other machines are not presumed synchronized.

Membership evidence is a retained capture with `requested_url` selecting an
exact GitHub git/trees/40-hex commit, full nontruncated `response.tree`, and
`tree_sha`. Repository, requested commit, exact case-sensitive file path and
its blob are checked against verified content. Its request-to-response binding
is a trusted retained connector receipt, not reconstructed Git Merkle proof.
The API may resolve a commit to a tree SHA; that separately retained tree identity
is accepted, but a later branch lookup is never an earlier atomic resolution.

Supported exact file URLs are HTTPS github.com blob/40-hex/path,
raw.githubusercontent.com owner/repo/40-hex/path, and api.github.com contents/path
with exactly one explicit ref=40-hex. Host/userinfo/port, duplicate query keys,
control text, traversal, invalid or double encoding and path separators are
rejected. Symbolic/default refs are retained as UNKNOWN for immutable history,
not split or guessed. URL/raw path case is preserved.

A locator reconciliation points to an independently pinned disposition with exact
operation, plan path, actual path, publication, blob, namespace, closer and recorded
time, and binds the authority artifact. The original R2 namespace prose has one
explicit legacy suffix parser: " / unchanged isolation root"; no general
substring inference is used. If a later retrieval reads the same file at another
commit, its read ref remains exact. A separate publication-membership source
must prove the original disposition's publication/path/blob; no ref alias is
created. Escaped namespaces and changed product subjects remain blocked.

Publication inventory entries carry actual path/source_id/byte pins/profile/
dependencies/intended_path. All material sources and payload bytes are rehashed
before the fake callback. Any changed source, path, profile, bundle or authority
invalidates approval. Current-state use additionally requires EXACT_REQUEST_HISTORY
and a separately supplied passing operation-check result bound to this bundle.
A content-only PASS never proves freshness or authorizes a workflow.

## Outcomes and CLI

EXACT_REQUEST_HISTORY requires original attributable request arguments, exact
selected/returned identity, membership, content and source clocks.
EXACT_CONTENT can approve verified actual content while explicitly preserving
missing issuance history/timing. FAIL outranks material UNKNOWN, then PASS.
Optional UNKNOWN does not become a claim. A ref mismatch remains FAIL even if
the blob matches. If the earlier blob is unavailable, the diagnostic explicitly
uses REF_MISMATCH_BLOB_RELATION_UNKNOWN rather than inventing a different blob.

```bash
python3 -B validation/pp002-q01-collector/guard.py --input-root ROOT --bundle bundle.json --profile EXACT_CONTENT --output new-result.json
```

Exit 0 = PASS, 1 = FAIL, 2 = required facts UNKNOWN, 3 = invalid invocation/input,
unreadable/unpinned source or occupied output. Output is exclusive-created.
A byte-pin contradiction is a typed FAIL; a missing pin is invalid input.
A duplicate JSON key is invalid input. Diagnostics carry operation/correlation
IDs and exact source pointers, with no operation lifecycle reinterpretation.

Results contain the frozen design fields plus source_custody origin/role entries.
Contradictory/incomplete source values appear only in source_bound_claims with
their explicit validation status; verified_claims contains only complete,
noncontradictory per-retrieval claims for the selected profile. Unsupported URL
text is redacted in semantic diagnostics, while exact pinned raw evidence stays
under the separately controlled input archive.
Canonical semantic bytes are UTF-8, no ASCII escaping, sorted keys, comma/colon
without spaces, one newline, no nonfinite numbers. Input index/retrieval order
and ignored run metadata do not change semantic output.

No guard result grants publication authority, independent acceptance, live
integration, protocol successor/adoption or a new Gate C verdict. Official
Gate C and final experiment remain REVISE; P01 UNCERTAIN and P02 UNKNOWN.

