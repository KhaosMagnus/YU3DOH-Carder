# PP-002 Q01 — DQA-007 Independent Offline QA Authorization

artifact_id: PP-002-Q01-DQA-007-INDEPENDENT-QA-AUTH
artifact_type: independent_qa_authorization
status: FROZEN / EFFECTIVE
protocol_version: 1.0
source_role: PROJECT_CONTROL
source_instance: PC-003
target_role: DESIGN_QA
target_instance: DQA-007
mode: INDEPENDENT OFFLINE SOURCE / EVIDENCE / TEST REVALIDATION
assignment: Q01-IMPL-001 — Source Retrieval Provenance Collector Guard
candidate_control: 328e57035d34f98c4d8d417729e8b12f91894e95
candidate_report: implementations/PP-002_Q01_OFFLINE_IMPLEMENTATION_REPORT.md
candidate_report_blob: 8f8e6b0a63b0bc5ad4c995134bf20f6d8a74ac76
design_contract: handoffs/PP-002_Q01_COLLECTOR_CORRECTION_DESIGN_HANDOFF.md
design_blob: c72e0a6d0889ceee4e901126a33587072180017f
implementation_authority: control/PP-002_Q01_OFFLINE_IMPLEMENTATION_AUTHORIZATION.md
coordinator_intake: runs/PP-002_Q01_IMPLEMENTATION_INTAKE.md
primary_request: validations/PP-002/Q01-COLLECTOR/DQA-007_EXTERNAL_QA_REQUEST.md
primary_route: routing/ROUTE-PP-002-Q01-DQA-007.md
effective_activation_control: commit publishing this authorization; exact SHA supplied in transfer
status_at_activation: AUTHORIZED / EXECUTION NOT STARTED

## Independence and permitted activity

DQA-007 is a separate DESIGN_QA reviewer instance, NOT PP-002 and NOT the developer. It must independently recover exact candidate source, manifest, evidence, historical immutable inputs, expected results and implementation boundaries from GitHub. Prior developer test logs and PASS claims are claims to audit, not a substitute for independent oracle/re-execution.

Allowed: GitHub source/record reads; read-only materialization of exact candidate and historical corpus; local Python standard-library-only offline static, behavioral and adversarial testing in fresh disposable directories; independent checks of Git blob/content/paths and exact reproduction; publish only new independent QA report/evidence under specified unoccupied QA paths.

QA may publish **only**:
- validations/PP-002/Q01-COLLECTOR/DQA-007_EXTERNAL_QA_REPORT.md
- validations/PP-002/Q01-COLLECTOR/DQA-007/** (new unique files; no overwrite)
- no central mutable files or frozen artifacts.

No code patch or candidate rewrite by DQA-007. If blocking defect is found, report it with exact source path/lines, reproducer, required correction and verdict to PC-003. Developer corrects under new coordinator direction, never self-merges or self-accepts.

## Mandatory review

1. Verify current control compatibility and exact candidate commit 328e57035d34f98c4d8d417729e8b12f91894e95, parent 565a197ce19d3ed140b002e1d709644cfbdda79e, report blob 8f8e6b0a63b0bc5ad4c995134bf20f6d8a74ac76, source blobs and evidence manifest; reconstruct the full parent vs candidate tree showing 692 old blobs unchanged and precisely 5+586+1 new authorized files. Recheck protected operational/product ref SHAs.
2. Independently examine guard/collector/callback composition, explicit issuance envelope and response correlation, exact GitHub URL/ref/path/blob/membership trust boundary, legacy late attestation and UNKNOWN, two claim profiles, authority separation, timestamp provenance, planned vs actual administrative locator and fail-closed publication/use behavior.
3. Independently derive raw historical F05 and F06 Q01 original/ref correction verdict (identical content not request-ref history), and F16/F17 R2 administrative locator behavior from original pinned facts. Do not use implementer's normalizer or expected-results labels as the oracle. Ensure old defective manifest remains defective, corrected projection limited to EXACT_CONTENT, and R2 reconciliation scoped.
4. Materialize all necessary exact source files, fixtures, old checker regression inputs, candidate, and transitive dependencies independently with pins; from a fresh root rerun F01–F31 mandatory families/subcases, both relevant profiles, fake publisher blocked/stale callback tests, positive connected callback and CLI exit semantics 0/1/2/3; do not skip mandatory negative cases. Check F10/F11 equal-clock contrast, F19 swapped responses, F21 malformed path/url/JSON keys, F23 stale approval and F24 guard+state checker composition.
5. Rerun frozen original R1/Gate C negative and positive regression suites on read-only identical baseline copies. Historical negative must still reject all mandatory controls (53 reported diagnostic violations are *expected reference*, not an independently assumed value). Verify test exit receipts, original code pins, no frozen-source modifications.
6. Replicate byte-identical semantic outputs from two clean independent output directories. Compare hashes against each other and delivered 590055-byte SHA-256 fedaf391616e9501c5fa21003dd0e62aa7b158dd3c4159527167063f5aa3f8e3 without normalizing away mismatches. Report any environment-dependent difference as a finding; do not silently patch expected outcomes.
7. Examine containment claims: stdlib-only, no networking, no GitHub client, no credentials, no external processes/actions used for effects; QA may use its own harness only for offline tests. Python-process enforcement is not a hostile-code OS sandbox proof. Independently assess whether a malicious/forged source-pin index remains an explicitly stated unproven trust boundary.
8. Ensure no self-referential hashes or stale publication approval; failure/UNKNOWN must never invoke the fake publish callback. Test that approval is tied to exact source/payload/path/profile/authority and invalidated on alteration. Compare source/expected time and operation safety axes without promoting Q01 EXACT_CONTENT to fresh current operation state.
9. Document actual QA commands, environment, provenance of every retrieved input, test coverage/exit codes, any missing dependencies, deviations and preservation checks; do not report tests executed unless observed by DQA-007 itself.

## Result and absence of evidence

Official QA outcomes: PASS, PARTIAL, FAIL, REGRESSION or INCONCLUSIVE. PASS requires independently sufficient evidence for the entire frozen offline contract; do not substitute inspectability for execution. If immutable raw bytes cannot be independently accessed or replays cannot be reproduced, use INCONCLUSIVE/PARTIAL as appropriate and identify EVIDENCE / PROVENANCE blocker, not an invented product defect. Do not infer a pass from self-test summaries.

Target QA scope is **offline Q01 guard only**, not proof of real platform session separation, post-C-020 predecessor inactivity, safe execution under quota exhaustion, involuntary crash, lost issuance ACK, real GitHub pipeline enforcement or universal exactly-once effects. Gate C remains REVISE; final PP-002 recommendation remains REVISE. Generic Protocol v1.0 and PP-002 v2 frozen. Recovery Gate PROPOSED/NOT ADOPTED.

No additional live workflow, Actions rerun, replacement, cancellation, cleanup or product/protected/historical branch movement. No protocol successor, adoption, live integration or candidate patch is authorized.

Return to PROJECT_CONTROL / PC-003 with exact QA report blob, publication SHA, pinned reproduced evidence/negative findings and independent verdict. All QA artifacts are append-only, expected-head/CAS, force=false. QA must not modify PROJECT_STATE, CHAT_REGISTRY, role indexes, or any existing frozen artifact.
