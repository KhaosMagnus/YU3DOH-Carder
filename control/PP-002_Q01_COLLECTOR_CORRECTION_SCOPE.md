# PP-002 — Q01 Source Retrieval Provenance Collector Correction Scope

artifact_id: PP-002-Q01-COLLECTOR-CORRECTION-SCOPE
artifact_type: bounded_correction_design_scope
status: FROZEN / DESIGN ONLY
protocol_version: 1.0
authorizing_coordinator: PROJECT_CONTROL / PC-003
input_control: 39e0d313bbb966fc6d609e5afc2d1d6986e303b3
source_report: protocols/PP-002_FINAL_EXECUTION_INTERRUPTION_RECOVERY_RECOMMENDATION.md
source_report_blob: b89d24271eeec9a6880a68ce97fa788326cbbe0a
defect_evidence: validations/PP-002/GATE-C/S02/source-reference-audit-correction.json
defect_blob: f53d082705f74e4e9bbe8dac84817baf511fea17
prior_frozen_requirements: control/PP-002_GATE-C_PROVENANCE_CORRECTION_REQUIREMENTS.md
scope: EXPERIMENTAL EVIDENCE COLLECTION / NOT PRODUCT CODE

## Observed defect

During S02 C-030 retrieval the manifest claimed source_ref 34011f6466ce096b310ef1c43c277d2bfd2af7aa while the actual source fetch URL for the frozen C-020 checkpoint selected 1352de4daddc6c2143943af2ad7142333f7be963. The Git blob 1b8055add2533d04e6c3b42e6344e3bee9c46614 was correct in both revisions. A collector defaulted an unrecorded request-ref to routing control instead of retaining actual or UNKNOWN. Correction was appended; the collector prevention guard has not been implemented or tested.

## Required DESIGN contract

Specify a bounded source retrieval provenance guard that:
1. Captures requested source identity/ref and URL AT issuance; never uses unrelated routing/CONTROL SHA as fallback. Where actual identity cannot be established, preserve UNKNOWN with explicit uncertainty.
2. Separately records request start, receipt/response and source event times from record assembly/verification times. Never invent source timestamps.
3. Binds actual source URL/ref, file path, immutable blob and connector-returned identity; disallows silent disagreements before publication or decision use.
4. Preserves predecessor immutable manifests and the append-only Q01 correction; new output uses additive paths/versioning, without changing original checkpoint/test evidence.
5. Defines typed outcomes for valid exact request/ref, missing/UNKNOWN, mismatched ref with identical blob, mismatched ref with differing blob, missing receipt/URL, and material intended/actual output path disagreement.
6. Defines deterministic positive, negative and adversarial OFFLINE fixtures including the actual C-030 ref fallback and R2 planned administrative path discrepancy. Distinguish administrative locator mismatch from an observed external-state contradiction.
7. Provides machine-checkable fail-closed behavior for material provenance contradictions while allowing explicit UNKNOWN when safe; logs exact source linkage.
8. States the test oracle, scope of core observer/checker validation, expected limits and evidence of byte-reproducible results for synthetic/retained inputs.

## Authorization boundaries

This publication authorizes only the DESIGN/specification and test-contract proposal under the separate route. It does NOT authorize implementing collector code, altering frozen v2 or Generic Protocol v1.0, changing historical manifests, modifying product branches, launching Actions, rerunning workflows, deleting retained evidence or upgrading the final experimental REVISE.

Design owner: PROTOCOL_PORTABILITY / PP-002 (separate bounded assignment).
Proposed design output: handoffs/PP-002_Q01_COLLECTOR_CORRECTION_DESIGN_HANDOFF.md (new additive artifact, no code).
After that handoff, PC-003 independently decides whether to authorize a distinct OFFLINE implementation and testing assignment with explicit paths, baseline and independent verification. The decision is not pre-approved by the design route.
