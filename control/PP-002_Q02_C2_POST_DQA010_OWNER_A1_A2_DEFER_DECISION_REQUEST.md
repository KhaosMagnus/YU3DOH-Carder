# Q02 — Owner Architecture Preference Decision After DQA-010 (A1 / A2 / DEFER)

artifact_id: PP-002-Q02-C2-POST-DQA010-OWNER-ARCHITECTURE-CHOICE
status: PROPOSED / EXPLICIT OWNER CHOICE PENDING / NO EXECUTION OR CODE-LOCATION EXCEPTION
coordinator: PROJECT_CONTROL / PC-003
source_control: 6a8ed1664a12b6972d45bf8bf08371b7941dc235
source_independent_design_QA: validations/PP-002/Q02-C2/DQA-010_INDEPENDENT_DESIGN_QA_REPORT.md @ blob d9fed86b13bc17678ed3630f60c77ffc3b7848c4
official_QA_disposition: runs/PP-002_Q02_C2_DQA-010_DESIGN_PASS_DISPOSITION.md
C2_design_source: handoffs/PP-002_Q02_C2_EXTERNAL_ISOLATION_DESIGN_HANDOFF.md @ abf5391d9de6be831eb9ca9139eb722e7e3b7c17 / blob e90a622fe7980dd9e28f3f09a31ac1ecfacaafbd
Owner_security_gates: control/PP-002_Q02_B1_OWNER_SIX_GATE_DECISION.md
C2_original_authority: control/PP-002_Q02_C2_OWNER_DESIGN_APPROVAL.md
deferred_backlog: backlog/GOV_BRANCH_RETIREMENT_DEFERRED_OBSERVATION.md

## Exactly which decision is requested

Owner chooses **a future architecture preference**, NOT actual installation/implementation/security configuration. Three mutually exclusive options:

**A1 — Preferred for ONE small offline pilot, conditionally (PC-003 RECOMMENDS):** Design around a separately maintained physical E with zero GitHub credentials/connections/network access, sanitized exact inputs, an unprivileged media/output quarantine V and a separate reviewed, technically restricted publisher P. Reuse existing GitHub control as *candidate durable source custody ONLY IF AND WHEN* a **new exact separate Owner code/evidence policy exception** is later granted. No such exception is provided by selecting A1 today. If Owner later refuses the exception, A1 cannot publish Q02 executable sources to meta/project-control; it must return for A2/local-custody-contract re-evaluation or DEFER. No hardware acquisition is authorized.

**A2 / B2 — Dedicated constrained nonproduct repository, conditionally:** Same physically isolated E and V, with **separate** repo-specific B publisher principal/App installation, strictly bounded GitHub target, no YU3DOH permission, trusted issuer and separate protected refs/retention. It avoids future Q02 executable sources on documentation-only control but introduces administration/credential/protection/issuance/QA costs and does NOT waive original YU3DOH S2. Selecting A2 does not authorize creating B2 or its GitHub identities/settings.

**DEFER:** Retain successful design and evidence record; do not start preflight, hardware procurement, permission changes, repo creation or code.

The fact that A1 is conditionally preferred should not prejudge the Owner's desire to keep meta/project-control **strictly documentation-only**. A2 can be strategically preferable for repeated prototyping and governance separation despite a larger estimated setup. Preliminary cost estimates overlap and do not show measured superiority.

## Separate future decisions — NOT granted by any preference

1. **Location policy choice**: A1 needs a separately named Owner permission for exactly enumerated new Q02 source/evidence file paths, data classes, bytes, retention and QA on documentation-only control. Existing Q01 scoped allowance is not a precedent. Declining this exception changes A1 feasibility.
2. **Feasibility preflight**: inventory true isolated host, removable transfer, credential-free V, P/B and issuer source, effective target grants and independent nonsecret evidence, legitimate operations and original refs. Existing host and publisher are UNKNOWN. Any actual provisioning or host access requires its own authority.
3. **Security S1/S2**: independently validate the actual signer, alternate tool writers, strict bridge/CAS transport and effective original YU3DOH ref protections using exact authorized disposable-equivalent checks; no original protected-ref denied writes here. S1/S2 blocking regardless of preference.
4. **S3–S6/implementation**: only after further authorizations and actual positive gate proof; nothing here runs tests, creates experimental resources, adopts protocols or integrates a product.

## Proposed Owner decision text (choose one only)

- `APPROVED — A1 ARCHITECTURE PREFERENCE ONLY; no code-on-control exception, equipment, issuer, settings or prototype authority. Request a separate feasibility/preflight scope and revisit location exception.`
- `APPROVED — A2/B2 ARCHITECTURE PREFERENCE ONLY; no new repository, credentials, security settings or prototype authority. Request a separate feasibility/preflight scope.`
- `DEFER — Preserve all frozen QA evidence and NO-GO gates, with no new work.`

Recommend **A1 preference only** if the purpose is genuinely one bounded offline rehearsal and the Owner remains open to *later considering* a highly constrained, publicly safe source-location exception. If preservation of documentation-only control is non-negotiable, **A2 preference is more consistent**, not an error. If no independently feasible separate host or real publisher can be evidenced, DEFER/NO-GO even with A1/A2 preference.

No A1 exception is active; B2 does not exist; no host, token, App or publisher has been provisioned. S1/S2 NOT PROVEN, S3–S6 NOT EXECUTED, Q02-PROT-001 NO-GO. GOV-BRANCH-001 remains IMPORTANT/DEFERRED.
