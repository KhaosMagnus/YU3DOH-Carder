# PP-001 — Project Control Disposition

status: FROZEN
protocol_version: 1.0

source:
PROTOCOL_PORTABILITY / PP-001

target:
PROJECT_CONTROL / PC-002

review:
protocols/PROJECT_CONTROL_PORTABILITY_REVIEW-v1.0.md

generic_baseline:
protocols/GENERIC_PROJECT_CONTROL_PROTOCOL-v1.0.md

result:
PORTABILITY REVIEW COMPLETE
GENERIC PROTOCOL BASELINE FROZEN v1.0
SIP READY YES

Project Control accepts both PP-001 outputs.

The residual questions are non-blocking for Bootstrap SIP authoring.

Project Control decisions for the successor SIP task:

1. Governance storage:
   use Git/GitHub as the recommended/default adapter for the first SIP, while keeping the protocol adapter semantics parameterized so a future non-Git adapter remains possible.

2. One-person projects:
   one human MAY hold multiple roles when explicitly declared, but decision records, authority boundaries and acceptance/integration gates remain logically distinct. No role title alone grants self-approval.

3. Integration topology:
   fast-forward + expected-head lease is the default bootstrap policy. Alternate squash/rebase/merge/cherry-pick flows are project-specific policy and require explicit equivalence/revalidation rules before use.

4. Evidence retention:
   the SIP must require each adopting project to declare retention horizon, artifact location, integrity metadata and expiry/escrow policy. No universal time duration is imposed by v1.0.

5. Exceptional urgent intervention:
   no implicit emergency bypass exists in Bootstrap SIP v1.0. If a project needs emergency authority, it must define and authorize a separate explicit exception/incident policy.

6. Mutable checkpoint hygiene:
   mutable indexes/state must be reconciled by Project Control when a mission closes; frozen reports/routes/activation artifacts are never rewritten for freshness.

Disposition:
AUTHORIZE SEPARATE BOOTSTRAP SIP SUCCESSOR ACTION.

The SIP itself is NOT created by this disposition.

Product refs remain outside this workstream.
Tranche 2 and CR-0002 remain not started.
