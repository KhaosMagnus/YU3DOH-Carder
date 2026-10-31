# Option I — DQA-009 independent source-evidence review scope

assignment: I-DQA-001
status: FROZEN / DOCUMENTARY INDEPENDENT QA / NO EXECUTION
role: DESIGN_QA / DQA-009
coordinator: PROJECT_CONTROL / PC-003
author_excluded: PROTOCOL_PORTABILITY / PP-002
candidate_control: 3d80a1fec9a837e7fad2a278dae17ccf23ad830b
candidate_parent: 40669a7263aa155d404842a4675336bd12bc81de
candidate_report: validations/PP-002/Q02-I/PP-002_IDENTITY_AND_ROUTE_EVIDENCE_REPORT.md
candidate_blob: 2d6f3d1911adb3869f69be6bf754be4a7e55a7a2
Owner_evidence_approval: control/PP-002_Q02_I_OWNER_EVIDENCE_INTAKE_APPROVAL.md
source_frozen_scope: control/PP-002_Q02_I_EVIDENCE_INTAKE_SCOPE.md
source_authorization: control/PP-002_Q02_I_EVIDENCE_INTAKE_AUTHORIZATION.md
QA_authorization: control/PP-002_Q02_I_DQA-009_INDEPENDENT_QA_AUTHORIZATION.md
QA_route: routing/ROUTE-PP-002-Q02-I-DQA-009.md
only_output: validations/PP-002/Q02-I/DQA-009_INDEPENDENT_EVIDENCE_QA_REPORT.md

## IR01–IR08 — mandatory independent checks

- IR01 Authority/custody: pin exact Owner authority, source activation, immutable path, blob SHA, one-file added delta, predecessor tree/refs, no default-ref fallback; reread checkpoint refs feature/serial-v0.1, feature/workspace-v0.1, main, meta/project-control and sampled operational refs.
- IR02 Capsule evidence: verify 13 O01–O09/E01–E04 observations/errors, appendix claim-to-source mapping, representation labels RAW vs CANONICAL_STRUCTURED_CONTENT vs PROJECTION, declared hashes, omission/custody limitations. Do not call a projection a raw HTTP transcript.
- IR03 Time: requested/receipt observer clock vs provider event, recording and verification; new read-only calls have new clocks; no backdating or filling original missing provider headers.
- IR04 Plugin action policy: independently assess, if read-only available, Github app-specific "Allow all actions" and global "Allow low-risk actions"; this is confirmation policy, not bearer rights, separate identity/ACL or Owner authorization. Do not modify setting.
- IR05 ID-01–ID-08: assess four UNKNOWN and four PARTIAL families and their reasoned BLOCKED consequences, actual signer vs user/admin metadata/installation selection, alternate writer routes, issuer/broker and outer host. Unavailable admin endpoints/403 are not security-denial tests.
- IR06 Privacy and authorization: confirm no secret/credential hashes/prefixes/raw logs, no nonauthorized connection switching, no real probes/settings/code changes, no investigation of deferred branch cleanup, no unauthorized issuance; observe public projection hygiene and GOV-BRANCH-001 preservation.
- IR07 Placement interpretation: B1/B2 are only conditional. A second repo with selectable privileged route is NO-GO. Original S2 still required. No S1/S2 certification from read-only source data, no Q02 implementation, Q01/F1/historical state unchanged.
- IR08 Publication and independent result: report PASS/REVISE/FAIL/INCONCLUSIVE for evidence fidelity only; clearly separate absent technical proofs and prioritized findings. Publish ONE additive report with current-head/CAS force=false, unchanged prior sources, return exact CONTROL SHA/blob.

The reviewer may reproduce available nonsecret GitHub GETs and a read-only Plugin Management setting. Missing source/platform attribution must remain UNKNOWN or cause INCONCLUSIVE if material to paper-fidelity assessment. Do not fabricate S1/S2 PASS from a paper PASS.

Forbidden: GitHub App/Plugin settings changes, token/key/session access, real or disposable negative write probes, V-tests, source execution, creating/deleting refs or repos, permission/protection changes, branch cleanup, product mutations, protocol adoption, asking a second account or escalation, changing coordinator indexes or prior artifacts. Sole permitted write: validations/PP-002/Q02-I/DQA-009_INDEPENDENT_EVIDENCE_QA_REPORT.md, one new report under meta/project-control using exact current-head/authority validation, CAS and force=false.
