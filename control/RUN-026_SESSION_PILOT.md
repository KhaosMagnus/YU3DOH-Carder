# RUN 026 — Instance / Session Pilot Continuation

status: FROZEN
protocol_version: 1.0
experiment_status: ACTIVE FOR RUN 026 ONLY

predecessor_experiment:
control/RUN-025_SESSION_PILOT.md

stable_instance:
DEVELOPMENT / DEV-008

initial_session:
DEV-008/S01

Purpose:
Continue testing stable accountable instance + replaceable execution sessions without changing Generic Protocol v1.0.

Session rollover may create DEV-008/S02, S03, etc. only when role, assignment, authority and accountable ownership remain unchanged.

A conversation change alone does not create DEV-009 or a new RUN.

Every rollover checkpoint must preserve exact CONTROL SHA, code SHA, completed/pending work, blockers, inherited/non-inherited evidence, and rollover reason.

New Development instance requires a material accountability/mission/authority change.

Terminal behavior:
When Development reaches READY FOR EXTERNAL QA or IMPLEMENTATION BLOCKED, proactively emit the complete return envelope without waiting for an Owner prompt.

RUN 025 observations inherited:
- one Development session only;
- no rollover/recovery exercised;
- DEV-007/S01 required explicit Owner prompting for its final return;
- later roles auto-returned successfully under explicit terminal-return instructions.

RUN 026 evaluation must report:
- sessions used;
- rollover reasons;
- recovery success/failure if exercised;
- stale-context/baseline errors;
- duplicated work;
- traceability impact;
- administrative overhead;
- terminal auto-return behavior;
- recommendation PROMOTE / REVISE / REJECT.

No automatic protocol promotion is authorized.
