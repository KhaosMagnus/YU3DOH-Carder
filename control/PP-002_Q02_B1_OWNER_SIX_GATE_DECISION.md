# Q02 B1 — Owner Six Mandatory Security Gates Decision

artifact_id: PP-002-Q02-B1-SIX-GATES-OWNER-DECISION
status: RECORDED / SECURITY PREFLIGHT AUTHORIZED / PROTOTYPE NOT AUTHORIZED
authority: OWNER (via PROJECT_CONTROL / PC-003 conversation)
recording_instance: PROJECT_CONTROL / PC-003
decision_input_control: 032afa84cc48b4117d19c40d7be77b7edb613099
source_proposal: control/PP-002_Q02_B1_OFFLINE_PROTOTYPE_OWNER_DECISION_REQUEST.md
security_evidence: validations/PP-002/Q02-B1-SECURITY/PC-003_READ_ONLY_PERMISSIONS_PREFLIGHT.md
security_design_scope: control/PP-002_Q02_B1_SECURITY_DESIGN_SCOPE.md
security_design_authorization: control/PP-002_Q02_B1_SECURITY_DESIGN_AUTHORIZATION.md
security_design_route: routing/ROUTE-PP-002-Q02-B1-SECURITY-DESIGN.md

## Decision and interpretation

Owner requests actual isolation, permissions and B1 limits before Q02-PROT-001 implementation; subsequently agrees that PC-003's proposed six controls remain mandatory and directs continuation. This approves the **requirements and read-only security design/preflight stage**, not B1 implementation, a ruleset or credential change, new branch/repository, a live negative write test, or any protected-ref update beyond normal coordinator documentation publication.

Freeze six mandatory constraints and stage criteria, not fabricated completion:

| Gate | Required fact or test | Enforced phase / present status |
|---|---|---|
| S1 — Separate identity and rights | Project test executor/publisher cannot use the same unrestricted writer route as local PC; map actual acting GitHub principal, app installation and scope; independently prove least privilege | Before B1 execution/isolation GO; NOT MET |
| S2 — Effective control/product ref protection | Apply and independently inspect appropriate branch rules, bypass actors, non-force policy and safe path for authorized PC publication; prove experimental principal denied | Before B1 execution/isolation GO; NOT MET |
| S3 — Exact immutable baseline, branch and allowlist | Freeze code/control source SHAs, experiment branch identity, permitted new files and ref operations; verify absent target and source byte identity | Before branch creation; PROPOSED, not frozen for execution |
| S4 — Truly offline execution | No network, production connector calls, GitHub credential material or real publisher; fake transport/store/CAS/checker and negative tests | Throughout prototype execution; designed but NOT EXECUTED |
| S5 — Secrets/data custody | Reject credentials, signed URLs and sensitive raw evidence; explicitly approve data classes and secure retention, audit public repository outputs | Before evidence publication / through tests; NOT IMPLEMENTED |
| S6 — Independent QA | Independent exact SHA/tree replay of I01-I32, original Q01 F01-F31 and unchanged R1/Gate C adapters, effect counters, all protected refs unchanged | Before prototype acceptance and any integration; NOT EXECUTED |

The two highest-risk security conditions S1/S2 must be positively proven on the intended technical identities and substrate. A checklist, chat role name, model permission setting, synthetic mock result or self-asserted PASS is insufficient. No unchecked item is silently satisfied.

## Decision limits

Q02-DES-001 remains ACCEPT DESIGN; Q02-PROT-001 remains PROPOSED / NO IMPLEMENTATION. S1/S2 are currently NO-GO. PC-003 may publish bounded security fact collection, threat model and design-only routing documents, but may not change GitHub repository settings or app installation access on the strength of this decision. Any actual ruleset configuration, credential provisioning/rotation, creating experimental branch, negative permission-probe or code changes require new named Owner authorization, exact scope and rollback path.

If B1 cannot demonstrate privileged isolation without a same-principal exception, return to Owner with an independently scoped B2 alternative rather than weaken a mandatory control. The Owner's strategic Project Control federated direction at control/PROJECT_CONTROL_FEDERATED_ARCHITECTURE_DIRECTION.md remains a target only; no central repository creation or adoption.
