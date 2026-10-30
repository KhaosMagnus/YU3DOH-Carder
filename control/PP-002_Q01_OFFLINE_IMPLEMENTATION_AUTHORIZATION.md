# PP-002 — Q01 Bounded Offline Implementation Authorization

artifact_id: PP-002-Q01-OFFLINE-IMPLEMENTATION-AUTHORIZATION
artifact_type: bounded_offline_implementation_authorization
status: FROZEN
protocol_version: 1.0
source_role: PROJECT_CONTROL
source_instance: PC-003
target_role: PROTOCOL_PORTABILITY
target_instance: PP-002
assignment: Q01-IMPL-001 — Q01 Source Retrieval Provenance Collector Guard
authorization: GRANTED / OFFLINE IMPLEMENTATION AND SELF-TEST ONLY
design_acceptance: runs/PP-002_Q01_DESIGN_ACCEPTANCE.md
frozen_design: handoffs/PP-002_Q01_COLLECTOR_CORRECTION_DESIGN_HANDOFF.md
design_blob: c72e0a6d0889ceee4e901126a33587072180017f
original_scope: control/PP-002_Q01_COLLECTOR_CORRECTION_SCOPE.md
original_correction: validations/PP-002/GATE-C/S02/source-reference-audit-correction.json
baseline_control: meta/project-control @ 638b1d9d486e3863f2c7a6edfc407ea39066f5ce
activation_control: exact commit containing this authorization and route, supplied by PC-003 in return envelope
primary_route: routing/ROUTE-PP-002_Q01_OFFLINE_IMPLEMENTATION.md

## Objective and exact allowed scope

Implement the new Q01 pure, capability-free source retrieval provenance guard and collector defined in the complete frozen design handoff. Verify only its bounded offline properties. The acceptance-contract document is normative; this authorization freezes its permitted paths, run identity, verification separation and stop rules without changing the contract.

Allowed **new** source paths only:
- validation/pp002-q01-collector/README.md
- validation/pp002-q01-collector/collector.py
- validation/pp002-q01-collector/guard.py
- validation/pp002-q01-collector/test_guard.py
- validation/pp002-q01-collector/run_contract.py
- validation/pp002-q01-collector/fixtures/** (if needed; exclusively new non-executable fixture records)

Allowed **new** evidence/output only:
- validations/PP-002/Q01-COLLECTOR/Q01-IMPL-001/** (exclusive create, no overwrite)
- implementations/PP-002_Q01_OFFLINE_IMPLEMENTATION_REPORT.md (exclusive create)

No other repository file creation/change is authorized. In particular, existing R1/R2/Gate C validation sources, historical evidence, source manifests and corrections, Generic Protocol v1.0, PP-002 v2, protected product/operational branches, .github/workflows/**, central PROJECT_STATE/CHAT_REGISTRY/instance indexes and any existing FROZEN artifacts MUST NOT be modified by PP-002. Only PC-003 may update central indexes after delivery.

## Exact frozen inputs

- Design SHA/blob: 638b1d9d486e3863f2c7a6edfc407ea39066f5ce / c72e0a6d0889ceee4e901126a33587072180017f.
- Q01 correction source: validations/PP-002/GATE-C/S02/source-reference-audit-correction.json @ blob f53d082705f74e4e9bbe8dac84817baf511fea17.
- Historical C-030 manifest: validations/PP-002/GATE-C/S02/source-recovery-manifest.json @ original publication 65c3d4a949fb15416ad180176511f557577eddab, blob a6135c91d13e267fbffb9c72fa0def6aa9712b67.
- C-020 checkpoint: validations/PP-002/GATE-C/C-020_S01_ROLLOVER_CHECKPOINT.json @ 1352de4daddc6c2143943af2ad7142333f7be963 and 34011f6466ce096b310ef1c43c277d2bfd2af7aa, exact blob 1b8055add2533d04e6c3b42e6344e3bee9c46614.
- R2 planned-path correction: validations/PP-002/GATE-B-R2/planning-path-reconciliation.json @ blob 71aa7dcfa78b91c3aa4771ffb95bbacd96e4a27e.
- Frozen original Gate C observer: validation/pp002-gate-c/observer.py @ Git blob 80591dd78b7aa414913e7a08767b0e6a2c7e5623; SHA-256 3b8fd9b243573b30845b644a1189ae5624e1d644d074e39137a09451d98e29cf.
- Frozen R1 validator: validation/pp002-gate-b-r1/revalidate.py @ Git blob e189cf780fbb0711fa442f342bec5d760bf4f3b1; SHA-256 0ebe717cb4830d376668a9d3ac193fd026399279c09a68af656e04d566247633.
- Further historical fixture and dependency pins are enumerated in the design section 13. Materialize transitive dependencies read-only before execution; missing data is BLOCKED, never synthetic historical evidence.

## Offline technical implementation and test limits

Python 3.10+ standard library only; no install/download, sockets, HTTP, GitHub client, credential reads, Actions commands or arbitrary shell network operations in the implementation, test harness or fake publisher. Existing corpus may be read from GitHub through normally authorized read tools *before* entering offline tests, with exact SHA/blob/content checks. No new experimental live operation may be issued.

Implement explicit capture_request / ingest_response / validate_bundle boundaries, supported strict GitHub exact-commit URL forms, independent source-byte Git SHA + SHA-256 verification, true commit/path membership backed by retained immutable sources, structured source pointers, origin/clock roles, explicit UNKNOWN, typed FAIL/UNKNOWN/PASS and fixed CLI exits 0/1/2/3. Do not authorize exact request history from later attestation, derived URLs or a matching content blob.

The future wrapper's only publishing action in tests is a **fake injected callback** with a counted invocation. All affected FAIL/UNKNOWN/stale payload approvals must produce ZERO callback invocations. The guard itself has no publishing or network capability. No production GitHub publication behavior is delegated to it.

Execute all 31 mandatory F01–F31 families including explicitly identified subcases and both applicable profiles. Independent oracle must derive expectations from raw facts, not from the implementation normalizer. Preserve F05 contradiction and F06 limited-content repair without altering original manifest; F16/F17 administrative path distinction without changing operation axes; F10/F11 clock-role equality distinction. Verify positive, negative, adversarial, duplicate key, URL ambiguity, symlink traversal, mutable ref handling, missing receipt, stale approval and request/response swap cases.

Run the original R1/Gate C negative, positive and regression checks unchanged using complete pinned local inputs and isolated scratch outputs, subject to their documented commands. Original negative fixture remains rejected as expected. Duplicate deterministic replay in two fresh locations and hash byte-identical semantic outputs. Record measured counts, failures, hashes, exact environment, input pins, command/exit logs and write-root audit. No unexecuted test may be reported PASS.

## Publication and separation of duties

Only publish new additive source/evidence/report paths under meta/project-control. Use current-head preflight and expected-head/CAS, force=false; verify old frozen blobs, input authority and all six protected/operational refs before/after. If head changes or a path is occupied, inspect, reconcile and return BLOCKED when necessary; no silent overwrite or force. Code and evidence publication into meta/project-control is experimental validation tooling, never product integration or modification of historical protocol.

Implementer / accountable operation closer: PROTOCOL_PORTABILITY / PP-002.
Independent acceptance reviewer: DESIGN_QA role, separate instance assigned by PC-003 after implementation return; **not currently activated**. PP-002 may report IMPLEMENTED / READY FOR INDEPENDENT REVIEW or BLOCKED / CORRECTION REQUIRED, never its own official independent QA PASS. PC-003 must separately authorize the independent reviewer and verify the exact implementation/evidence SHAs.

If the approved output namespace, source corpus, semantics or frozen validators require change, STOP and return a scope conflict. Do not implement a versioned successor or expand the authorization.

Required delivery: implementations/PP-002_Q01_OFFLINE_IMPLEMENTATION_REPORT.md, complete implemented code, test/evidence bundle under validations/PP-002/Q01-COLLECTOR/Q01-IMPL-001/**, exact committed SHAs, observed rather than claimed test results, deficiencies and closer statement.

Authorized result scope: OFFLINE GUARD IMPLEMENTATION ONLY. No automatic integration into existing live execution or Project Control publication pipeline. Neither implementation nor offline QA validates P01/P02, quota exhaustion, involuntary crash, lost ACK or generic exactly-once operation claims.

Gate C: REVISE / FROZEN. Final PP-002 experiment: REVISE / ACCEPTED. Recovery Gate: PROPOSED / NOT ADOPTED. Generic Protocol v1.0 / PP-002 v2: FROZEN / UNCHANGED. Protocol successor/adoption: NOT AUTHORIZED.
