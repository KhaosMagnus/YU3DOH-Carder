# PP-002 Q02 F1 — B1 Permission Feasibility and Configuration/Qualification Contract Scope

artifact_id: PP-002-Q02-F1-FEASIBILITY-CONTRACT-SCOPE
type: frozen_design_scope
status: FROZEN / READ-ONLY DESIGN ONLY / NO MUTATION
assignment: F1-SEC-FEAS-001 — B1 Real Permission Feasibility and Configuration Contract
owner_grant: control/PP-002_Q02_F1_OWNER_FEASIBILITY_APPROVAL.md
coordinator: PROJECT_CONTROL / PC-003
assigned_role: PROTOCOL_PORTABILITY / PP-002
control_input_revision: a3d0dcd469c18896c16c01ad79c324df4995a0ce
accepted_B1_design: handoffs/PP-002_Q02_B1_PERMISSION_ISOLATION_DESIGN_HANDOFF.md @ blob d89194237b128b76379533412baec5a56f754b20
accepted_B1_design_disposition: runs/PP-002_Q02_B1_SECURITY_DESIGN_ACCEPTANCE.md
observed_snapshot: validations/PP-002/Q02-B1-SECURITY/PC-003_F1_READ_ONLY_CONFIGURATION_SNAPSHOT.md
frozen_six_mandatory_gates: control/PP-002_Q02_B1_OWNER_SIX_GATE_DECISION.md
design_authorization: control/PP-002_Q02_F1_FEASIBILITY_DESIGN_AUTHORIZATION.md
design_route: routing/ROUTE-PP-002-Q02-F1-FEASIBILITY-CONTRACT.md
single_new_output: handoffs/PP-002_Q02_F1_FEASIBILITY_AND_CONFIGURATION_CONTRACT.md

## Mission and discriminating question

Create an actionable **read-only, nonsecret F1 feasibility and exact future configuration/qualification contract proposal** answering:

"Can an experimental executor and its trusted publication route actually be denied every PC/admin writer route while an authorized local PC document publisher can still operate, without globally freezing unrelated product progress or exposing unrestricted credentials?"

This is a distinct NEXT gate after ACCEPT B1 SECURITY DESIGN. It is not permission to apply the configuration, create the qualification substrate, execute the planned 20 V-tests or implement the 32 Q02 cases.

## Minimum required deliverable

A. **Actual vs missing identity proof.** Refresh available read-only GitHub account/repo/App/installation/ref/rules data; distinguish directly observed, connector-declared, inferred, unknown and externally inspectable facts. Enumerate required owner-side UI/API nonsecret exports without asking for tokens or raw secrets. Explicitly map true principals P (PC publisher), B (experimental proposal publisher), C0 (single branch provisioner), E (credential-free executor), Q (independent reviewer), A/G (Owner recovery), and identify if any can still select unrestricted connection. If unavailable, report S1 UNVERIFIED and NO-GO; never invent IDs or permission grants.
B. **F1 configuration candidate.** Provide a concrete, minimally disruptive, version-pinned proposed ruleset/publisher configuration for GitHub personal public repository. Identify exact branch include/exclude conditions, update/create/delete/force semantics, App/principal bypass scope, native-vs-broker limits, and every remaining alternative API/ref path. Compare original R0-R7 global-freeze design against a narrower policy and B2 with separate credentials. Do not falsely claim paths can be restricted by branch ruleset alone.
C. **PC and product continuity.** Inventory relevant active product work and protected/local refs from GitHub as available. Define exactly how PC-003 continues additive expected-head publication and legitimate product integration or branch creation proceeds during staged activation. No blanket admin/experiment bypass. Show explicit fail-closed and externally authorized recovery for partially installed rules.
D. **Configuration packet specification.** Draft the future exact settings-delta inventory, actor IDs/placeholders, rule ordering, repository ID/ref targets, permitted endpoints, source/after-state hashes/readback evidence, signing-principal attestation requirements, issuance/expiry/revocation/custody, independent verifier responsibility, cleanup/rollback and owner-facing change approval form. No mutation or fake successful attestation.
E. **Qualification packet specification.** Map every existing V01-V20 to independent oracle, required principal and disposable source/target, accepted-denied positive controls and source/ref receipts; only separately authorized disposable resource may later receive negative writes. Distinguish actual target read-only settings attestation from disposable-equivalent behavioral tests; block where proof cannot be mapped. Include incident/lost ACK recovery and replay/collision handling.
F. **Six-stage gates.** S1/S2 must be independently established before B1 implementation GO, S3 exact branch/code/allowlist before creation, S4 before/offline runtime, S5 before any public evidence publication, S6 independent acceptance after candidate. Identify which facts can be established READ-ONLY and what requires later separately authorized work.
G. **Security/operational decision.** Quantify predicted administrative/operational burden as assumptions, not measured costs. State whether B1 may be defensibly qualified on this substrate, what exact missing evidence could change that conclusion, and precise B2 fallback conditions and scope. Finish with current truthful status DESIGN/CONFIGURATION UNINSTALLED / S1-S2 UNPROVEN / PROTOTYPE NO-GO.
H. **Independent review contract.** Specify objective criteria for independent DESIGN_QA acceptance of this paper packet, including verifying exact sources, scope completeness, nonsecret evidence, risk of product freeze, and no out-of-scope writes. Suggest a reviewer assignment for later PC-003 routing; do not self-certify or start that reviewer.

## Strict boundaries

- GitHub READ ONLY for research. Permitted writing is only **one new documentation handoff** at handoffs/PP-002_Q02_F1_FEASIBILITY_AND_CONFIGURATION_CONTRACT.md under meta/project-control, using current-head/source-authority compatibility, expected-head CAS, force=false, with no edits to any existing blob. No central indexes touched by PP-002.
- No GitHub settings, ruleset, credential, App installation, token, identity, repository/branch/tag, workflow, PR, issue, code or tool integration changes; no branch, ref or probe creation.
- No actual V01-V20 execution, permission-denial write probes, connection switching, credential introspection, key/token sharing, malicious bypass exercise, product work, Q02 prototype implementation or automatic independent QA.
- Existing Q01 F01–F31 evidence and R1/Gate C checkers unchanged; Q02 I01–I32 still proposed. No generic/federated project protocol mutation.
- Where data cannot be retrieved, mark NOT VERIFIED/BLOCKED with exact requested source and who could inspect it. Do not perform prohibited writes to fill gaps.
