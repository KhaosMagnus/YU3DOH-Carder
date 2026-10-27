# SIP-001 — Bootstrap SIP Authorization

status: FROZEN
protocol_version: 1.0

source:
PROJECT_CONTROL / PC-002

target:
PROTOCOL_BOOTSTRAP / SIP-001

basis:
control/PP-001_DISPOSITION.md

frozen_inputs:
- protocols/PROJECT_CONTROL_PORTABILITY_REVIEW-v1.0.md
- protocols/GENERIC_PROJECT_CONTROL_PROTOCOL-v1.0.md

authorized_output:
sip/PROJECT_CONTROL_BOOTSTRAP_SIP-v1.0.md

mission:
Create the first minimal reusable Bootstrap SIP that allows a new project to adopt the Generic Project Control Protocol without importing YU3DOH-specific product assumptions.

Required defaults:
- Git/GitHub is the recommended first adapter, not a universal invariant;
- one person may hold multiple roles only with explicit declared separation of decisions/authority;
- fast-forward + expected-head lease is the default integration topology;
- evidence retention policy must be declared by each adopter;
- no implicit emergency bypass;
- mutable state/indexes must be reconciled at mission closure;
- product baseline/candidate/integration target may start as NOT ESTABLISHED or N/A.

The SIP must not automatically:
- create product implementation work;
- invent historical RUNs;
- authorize integration;
- move any product ref;
- adopt itself into YU3DOH;
- start Tranche 2;
- start CR-0002.

The SIP must end with a bootstrap return/checkpoint stating the new project's control revision, discovered product baseline if any, configured adapter values, unresolved gaps and first authorized next route.

This authorization permits SIP authoring only.
