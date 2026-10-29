# ROUTE — PP-002 Q01 Bounded Collector Correction Design

artifact_id: ROUTE-PP-002-Q01-COLLECTOR-CORRECTION-DESIGN
artifact_type: design_only_route
status: FROZEN
protocol_version: 1.0
source: PROJECT_CONTROL / PC-003
target: PROTOCOL_PORTABILITY / PP-002
mode: AUTHORIZED OFFLINE DESIGN AND TEST CONTRACT / NO IMPLEMENTATION
assignment: Q01 — Source Retrieval Provenance Collector Guard
source_final_disposition: runs/PP-002_FINAL_REVISE_DISPOSITION.md
source_final_report: protocols/PP-002_FINAL_EXECUTION_INTERRUPTION_RECOVERY_RECOMMENDATION.md
source_report_blob: b89d24271eeec9a6880a68ce97fa788326cbbe0a
primary_scope: control/PP-002_Q01_COLLECTOR_CORRECTION_SCOPE.md
source_defect: validations/PP-002/GATE-C/S02/source-reference-audit-correction.json
prior_requirements: control/PP-002_GATE-C_PROVENANCE_CORRECTION_REQUIREMENTS.md
existing_p01_p02_assessment: control/PP-002_P01_P02_EXISTING_EVIDENCE_ASSESSMENT.md

## Work

Read current exact CONTROL HEAD and the frozen scope/defect evidence. Prepare an implementable DESIGN + deterministic OFFLINE validation contract that would prevent wrong requested-ref fallback and unvalidated source URL/ref/blob/time mismatch, without corrupting historical evidence or conflating planned locator with observed state.

Propose allowed adapter/collector file boundaries and explicit no-change areas, test fixture inventory, pass/fail/UNKNOWN semantics, publication guard behavior, regression protection and independent validation procedure. Show whether this can be implemented as additive experimental validation code without modifying the byte-pinned original Gate C observer and R1 validator; otherwise identify the exact need for a separately authorized versioned successor. Do not invent results of unrun tests.

expected_output: handoffs/PP-002_Q01_COLLECTOR_CORRECTION_DESIGN_HANDOFF.md
publication: new append-only artifact on meta/project-control with exact parent/head lease (expected-head/CAS, no force)
return: PROTOCOL_PORTABILITY / PP-002 -> PROJECT_CONTROL / PC-003
blocking_ambiguity: return to PC-003; do not self-expand scope

## Explicit exclusions

No product mutation, operational branch movement, new workflow, rerun, external effect, cleanup, implementation source edit, frozen artifact edit, new protocol adoption or retroactive Gate C PASS. A subsequent offline implementation requires a separate frozen authorization after design review. P01/P02 remain separate evidence-provenance questions; code guard tests cannot substitute for a platform conversation boundary or predecessor stop trace.
