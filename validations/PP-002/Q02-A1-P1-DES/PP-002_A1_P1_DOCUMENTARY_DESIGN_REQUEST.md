# A1-P1-DES — Documentary First Synthetic Rehearsal Design Request

assignment: A1-P1-DES-001
status: AUTHORIZED / SINGLE DOCUMENTARY HANDOFF / NO TECHNICAL EXECUTION
source: PROJECT_CONTROL / PC-003
target: PROTOCOL_PORTABILITY / PP-002
repository: KhaosMagnus/YU3DOH-Carder
branch: meta/project-control
activation_control: use exact PC-003 control publication SHA from separate transfer
Owner_approval: control/PP-002_Q02_A1_P1_DES_OWNER_APPROVAL.md
frozen_scope: control/PP-002_Q02_A1_P1_DES_FROZEN_SCOPE.md
effective_authorization: control/PP-002_Q02_A1_P1_DES_EFFECTIVE_AUTHORIZATION.md
effective_route: routing/ROUTE-PP-002-Q02-A1-P1-DES-PP-002.md
single_output: handoffs/PP-002_Q02_A1_P1_SYNTHETIC_REHEARSAL_DESIGN_SPECIFICATION.md
source_proposal: control/PP-002_Q02_A1_P1_SYNTHETIC_REHEARSAL_DEFINITION_PROPOSAL.md @ blob a6bf2a4275d2c4a41f9878facc801e0e522051c7
source_F0C_CONTROL: a3f166d623aa52c72401de64e95c4ffce67106ad
source_F0C_report_blob: 082faf4ea6fefb47f466bd2ca48041b676176908
source_C2_design_blob: e90a622fe7980dd9e28f3f09a31ac1ecfacaafbd

## Assignment
Produce one reviewable Markdown specification of **a candidate for the first bounded Q02 synthetic rehearsal**: purpose; synthetic input/manifest fixture semantics (nominal and missing/untrusted-source cases); deterministic expected outputs/manifest and failure classification; proposed small limits; exact future-only PASS/FAIL/INCONCLUSIVE/STOP criteria; E/V/P separation and high-level custody; paper transport compatibility (offline E vs NAS) and source-code custody decision paths; future security/gating matrix. Draw from the published proposal, but do not mistake its candidate details for a locked Owner test selection. Mark authored choices as PROPOSED DESIGN.

Erebo is Owner-PROPOSED E and Alucard Owner-PROPOSED V, different physical devices by Owner statement only; both reportedly outside 13:00–22:00 UTC−06. Custody conditional. No verified credential-free V or isolated E. NAS preferred as a convenience, not an approved secure transport. Project Control documentation-only and no code exception; alternative future repository not created. The only approved output is the design document, not fixture files, scripts, binaries or source code.

Review accepted paper C2 constraints and original S1/S2/six-gate requirements. Clearly identify that an offline mock's logical PASS cannot qualify real source provenance, physical isolation, trusted publisher/issuer/remote CAS, protected-ref S2 or production recovery. Keep original U1–U7 provenance INCONCLUSIVE, DQA-012 not activated. No private original-message access.

Publish one new additive Markdown output via compatible latest HEAD, exact authority readback, target absence, expected_sha lease and force=false. Do NOT modify coordinator indexes, existing frozen artifacts, create software or start tests, QA or future phases. Return exact output Git blob and commit SHA to PC-003 for intake.
