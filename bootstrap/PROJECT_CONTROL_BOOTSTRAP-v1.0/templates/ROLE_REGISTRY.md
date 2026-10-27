# Role and authority registry — adopter working template

PROJECT ID: <ID>
APPROVING AUTHORITY / RECORD: <Owner; immutable decision>
INPUT CONTROL REVISION: <exact revision or N/A for first adoption>

All responsibilities below must be allocated to a role with an assignment or an explicit assignment-before-use rule. Owner and control coordinator must be identified for bootstrap completion. Titles and paths are configurable; protocol §4 governs permissions.

| Responsibility | Actor / assignment rule | Permitted decisions and writes | Reserved boundary |
|---|---|---|---|
| Owner/policy principal | <identity> | Scope/policy, integration permission, delegations | Record decisions; no retroactive silent change |
| Control coordinator | <identity/instance> | State, ledger, routing, delegated control publication | No invented scope, QA or integration authority |
| Scope/specification | <assignment> | Freeze WHAT; disposition ambiguity | No silent scope expansion |
| Design/acceptance contract | <assignment> | Freeze measurable criteria/evidence requirements | No post-development silent relaxation |
| Development/authoring | <assignment> | Authorized implementation; readiness evidence | Readiness is not independent QA PASS |
| Execution/environment | <assignment> | Readiness and exact-candidate evidence | ENVIRONMENT READY is not acceptance |
| Independent QA/acceptance | <assignment> | Exact-candidate verdict/evidence sufficiency | PASS does not authorize integration |
| Integration administrator | <assignment> | Separately authorized guarded target operation | No extra code/delta or unrelated ref movement |

HAT-SHARING: <explicit allowed combinations and actors; conflicts and controls; or none>.
One human may hold multiple roles; distinct auditable decisions and authority boundaries remain mandatory. Names alone grant no self-approval. Implementer acceptance plus integration cannot be unilateral without the designated external authorization required by protocol §4. Record who provides that authorization and its scope; unresolved overlap blocks the affected gate.

DELEGATIONS: <grantor, grantee, decisions/writes, limits, source, effective revision, expiry/revocation; or none>.
INTEGRATION DECISION: always separately recorded for exact validated source, target/before revision, mechanics and boundaries (§14).

## Blocker routing

| Primary class | Responsible recipient (fill identity/route) |
|---|---|
| PRODUCT / IMPLEMENTATION | <development/design-QA; scope authority if expansion needed> |
| SPECIFICATION / CONTROL | <coordinator + competent contract/Owner authority> |
| ENVIRONMENT / SUBSTRATE | <operational/environment owner> |
| EVIDENCE / PROVENANCE | <producer; QA for acceptance sufficiency> |
| AUTHORITY MISMATCH | <coordinator/Owner> |

Record exact sources/revisions, observed facts, diagnosis confidence, not-run work and recovery dependency. Blockers grant no new RUN, instance, scope or implementation permission. Default escalation: <control identity and durable intake location>.
