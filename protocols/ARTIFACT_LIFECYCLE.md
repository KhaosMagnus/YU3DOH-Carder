# ARTIFACT LIFECYCLE v1.0

States:
- DRAFT — work in progress, not execution authority.
- REVIEW — ready for review.
- FROZEN — approved execution authority; immutable.
- EXECUTED — action completed and output exists.
- VALIDATED — responsible authority validated associated result.
- INTEGRATED — validated result incorporated into target checkpoint.
- SUPERSEDED — replaced by explicitly linked artifact.
- ARCHIVED — retained historical evidence, not active authority.

Mandatory metadata where applicable:
artifact_id, artifact_type, status, protocol_version, source_role, source_instance, target_role, related_requests, code_baseline, control_parent_sha, supersedes.

DRAFT/REVIEW may be edited. FROZEN or later historical meaning is never silently rewritten.

Requirement traceability:
CR → Scope → Design → AC → Implementation → QA
