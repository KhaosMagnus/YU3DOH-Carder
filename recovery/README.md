# P6 ARCHIVAL STAGING

status: NON-AUTHORITATIVE

Parent control:
`58165a1b00fbe6efc4664ca8aabb593a3821e6e5`

Authoritative branch:
`meta/project-control`

Worker:
`ARCHIVAL_RECOVERY / AR-001`

Pilot:
RUN 004 / RUN 005 / RUN 008

Rules:
- Workspace evidence only.
- Serial v0.1 is out of scope.
- Do not modify product code.
- Do not move refs.
- Do not treat staging as authority.
- Preserve PARTIAL / rejected candidates.
- Record contradictions; do not resolve them silently.
- Never promote Internal QA to External QA.
- Do not merge this branch wholesale into meta/project-control.

Required outputs:
- recovery/workspace/RECOVERY_INDEX.md
- recovery/workspace/RECOVERY_GAPS.md
- recovery/workspace/RECOVERY_CONTRADICTIONS.md
- recovery/workspace/candidates/
