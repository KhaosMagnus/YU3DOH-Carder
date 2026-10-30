# Project Control — Federated Master / Local Instance Strategic Direction

artifact_id: PC-FEDERATED-ARCHITECTURE-DIRECTION
artifact_type: owner_direction_intake_and_coordinator_strategy
status: OWNER-ALIGNED STRATEGIC DIRECTION / NO IMPLEMENTATION OR ADOPTION
protocol_version: 1.0
owner_intake: PROJECT_CONTROL / PC-003 conversation on 2026-10-30 (America/Mexico_City)
source_control_sha: 93dcaa1e5ed935e5add6a1069483e9619a351cf9
coordinator: PROJECT_CONTROL / PC-003
related_design: handoffs/PP-002_Q02_Q01_CONTROL_INTEGRATION_DESIGN_HANDOFF.md @ blob a06fb711662848ccc16d2e32d621be279a9b1f4d
current_generic_protocol: protocols/GENERIC_PROJECT_CONTROL_PROTOCOL-v1.0.md @ blob 1ac3689c1e811d1594291afee6b2c1c6efd093d0
current_bootstrap: bootstrap/PROJECT_CONTROL_BOOTSTRAP-v1.0/
next_prototype_alignment: control/PP-002_Q02_FEDERATED_ALIGNMENT_AND_ISOLATION_PROPOSAL.md

## Owner intention and PC-003 interpretation

Owner endorses developing Project Control toward a **single canonical, evolvable, independently maintained standard** with autonomous, configurable per-project control instances. Each adopting project's own Project Control branch/namespace preserves that project's governance history, authorities, roles, state, evidence and local decisions. A local finding may be proposed upstream for generic evaluation, independent acceptance and a new master release; no project automatically receives it.

This is a strategic target and change-intake record, NOT an effective amendment of the frozen Generic Project Control Protocol v1.0, PP-002 v2, Git control policy, bootstrap v1.0, or any product scope. It neither establishes the future central repository nor creates a live federation/migration. Exact detailed central architecture, release mechanics and security must be separately scoped/designed/authorized after Q02's bounded prototype evidence.

## Invariants for later architecture scope

1. **Canonical core:** One future master repository shall hold versioned generic governance contracts, bootstrap, reusable core/adapters, compatibility/migration policy and approved releases. Release artifacts are immutable/pinned; a development branch can evolve. Its authority covers the **standard**, not the live content/state/operation of any adopting project.
2. **Local autonomy:** Each project explicitly pins the adopted upstream version/digest, and owns its own control state, local scope, role assignments, config, evidence and protected product refs. An upstream change is not an implicit local policy/authority update.
3. **Separation:** distinguish generic invariants, configurable project adapters and local instance data. No embedding YU3DOH-specific paths, branch names, identity instances or historical SHA literals as mandatory generic core settings.
4. **Upstream feedback:** local discovery -> local evidence/diagnosis/design/test -> candidate generic proposal -> compatibility/security review + independent acceptance -> new immutable master release. A locally accepted PASS is NOT automatically a generic PASS or global authority.
5. **Downstream adoption:** project Owner/competent authority explicitly approves version selection, mapping, compatibility/dry-run, preserved local deviations, rollback/stop, state migration if necessary and exact postadoption evidence. No forced synchronization, silent ref move or rewriting of past local frozen contracts.
6. **Minimal roles:** portable responsibilities and separation of authority remain applicable even if a small project consolidates physical chat instances. One actor cannot silently self-implement, self-accept and self-integrate without designated independent authorization.
7. **Trust & privilege:** version pinning/hashes prove integrity of selected bytes, not publisher identity or broad permission isolation. A master repository is not automatically allowed to write any project's control ref; real enforcement requires proved and separately configured credentials/permission boundaries.
8. **Compatibility:** plan an explicit version/compatibility policy for generic contract, adapters, instance schema/bootstrap and upgrades; handle supported, deprecated, incompatible and deferred updates. A master release cannot silently supersede a project's accepted old authority.
9. **Recovery:** all durable local records and exact code/control/standard revisions must remain recoverable without prior chat memory or central runtime availability.
10. **Bounded claims:** Q01 independent offline PASS remains scoped. Q02 prototype I01–I32 is unimplemented. Gate C and PP-002 final official REVISE, P01 UNCERTAIN and P02 UNKNOWN remain unchanged; no broad recovery guarantees are inferred.

## Sequence and exit boundaries

Phase 1 — Q02-PROT-001: isolated offline mock/rehearsal, approved separately, with exact Q01 source reuse, I01–I32 regressions and independent QA. Avoid gratuitous hardcoded project assumptions in newly authored reusable adapters; portability not claimed by local tests alone.

Phase 2 — Post-Q02 architecture extraction: inventory tested generic core vs GitHub adapters vs YU3DOH-local governance; identify remaining permission/real-connector and portability proof gaps; propose central repo scope and release/adoption contracts for separate Owner decision.

Phase 3 — Central repository establishment: separately approved canonical repository identity, governance of upstream decisions, versioned immutable releases, reproducible bootstrap, permission/read/write boundaries, migration/upgrade tools as warranted. Do not create it under this direction alone.

Phase 4 — Independent second-project/synthetic-adopter validation: test clean bootstrap, adoption, downgrade/no-op/blocked incompatible upgrade, upstream changes without local silent writes, preserved source/authority history, and actual compatibility claims. Only then consider describing a generic implementation as portable with bounded evidence.

The first phase is a *technical prototype*, not adoption. The second is architecture work; third is future infrastructure; fourth supplies necessary evidence. Owner may choose to stop or narrow each phase.

## Non-authorizations

NO new experiment, branch/repository creation, offline implementation, code edit, protocol text change, product change, live publisher, privileged writer restriction change, workflow, integration, adoption or migration is authorized by this strategic direction alone.

An Owner decision on experimental branch/location and a separate exact implementation authorization are still pending. See control/PP-002_Q02_B1_OFFLINE_PROTOTYPE_OWNER_DECISION_REQUEST.md.
