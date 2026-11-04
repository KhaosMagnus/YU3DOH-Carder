# Q02 A1 — P1 Proposal for First Bounded Synthetic Rehearsal Definition

artifact_id: PP-002-Q02-A1-P1-SYNTHETIC-REHEARSAL-DEFINITION-PROPOSAL
status: PROPOSED / DESIGN ONLY / NOT AUTHORIZED / NO TECHNICAL EXECUTION
coordinator: PROJECT_CONTROL / PC-003
source_F0C_CONTROL: a3f166d623aa52c72401de64e95c4ffce67106ad
source_F0C_report: validations/PP-002/Q02-A1-F0C/PP-002_A1_F0C_DOCUMENTARY_FEASIBILITY_CLARIFICATION_REPORT.md @ blob 082faf4ea6fefb47f466bd2ca48041b676176908
source_F0C_intake: runs/PP-002_Q02_A1_F0C_INTAKE_DISPOSITION.md
source_architecture: handoffs/PP-002_Q02_C2_EXTERNAL_ISOLATION_DESIGN_HANDOFF.md @ blob e90a622fe7980dd9e28f3f09a31ac1ecfacaafbd
source_QA_limit: runs/PP-002_Q02_A1_F0_DQA011_INCONCLUSIVE_DISPOSITION.md
Owner_decision_needed: control/PP-002_Q02_A1_F0C_NEXT_OWNER_DECISION_REQUEST.md

## Why scope one case next, rather than another generic evidence inventory
Prospective E='Erebo' and V='Alucard' with Owner-reported distinctness and availability outside 13:00–22:00 UTC−06, but actual offline/credential-free boundaries unknown. Owner explicitly could not define the first rehearsal. A smallest test contract is needed to decide future resource, custody, source location and possible formal QA gates. This proposal is a **candidate design brief**, NOT the Owner's choice and NOT an approved executable scenario.

## Proposed P1 trial contract — design candidate, not authority
A **single bounded synthetic provenance/recovery demonstration** (NOT real YU3DOH user data). Objective: establish whether a separately authorized future isolated process can receive a tiny frozen synthetic input set, produce a deterministic evidence/manifest report, reject one intentionally missing/untrusted source under Q01's provenance-guard logic, and return a quarantine artifact for independent V review *without granting GitHub/network privileges to E*. No actual cryptographic/verbal isolation attestation is assumed in the design. This is one proposed pilot shape with one nominal and one missing-source case in **one supervised session**.

**Input candidate:** a tiny, nonsecret, locally generated synthetic manifest and at most a small handful of fixed fixture records; content/number/size limit, precise schema and any executable source are NOT frozen yet. No private messages, live GitHub source, token, account/user identifiers or network-fetched source required.

**Output candidate:** bounded deterministic report and manifest/digest with explicit PASS/REJECT reasons, source/expected identity, and the distinction between E's claimed outputs, V's independent documentary checks and P's as-yet-unqualified GitHub publication custody. A digest **does not** prove safe provenance or secure execution by itself.

**Proposed stop criteria:** source identity absent/mismatched, missing independent verification, unexpectedly non-synthetic data, transfer/custody ambiguity, equipment/network/credential state unknown at any technical gate, prior authority exceeded, or unapproved code storage. Failure/UNKNOWN should be recorded, not worked around by manual overrides or substitution.

**What success could mean (only in future properly authorized execution):** deterministic result on known synthetic fixtures, explicit fail-closed rejection for bad source and complete chain-of-custody accounting within that future separately approved experiment. It would NOT itself qualify original protected-ref S2, real signer/publisher, server checked CAS, recovery under live interruptions, full S1–S6, scalable protocol adoption or production deployment.

## Separation and unresolved architecture gates
- E: Erebo is only Owner-reported candidate, not disconnected or clean. V: Alucard is Owner-reported separate hardware, not proved credential-free. No actual machine allocation or time reservation.
- **NAS tension:** direct live NAS/network access by disconnected E during offline execution is conceptually incompatible with that boundary. An offline custody route (potentially removable-media staging external to E) might be designed later, but not approved, prescribed, tested or presumed secure. No actual file exchange is authorized.
- P/issuer/source: no trusted restricted publisher, separate signer, real remote CAS or original S2 evidence. `meta/project-control` is documentation-only and no source-code exception is granted. The original C2 A1 candidate route would need a new exact Owner exception, or a separately redesigned and approved source custody route (e.g., dedicated nonproduct repository after authority) before an executable pilot. DO NOT create a repo, publish executable code or silently adopt A2/B2.
- The first design deliverable must specify expected input/output schema, size and maximum duration *as **proposed limits**, not observed performance*, data custody map and independent review criteria; it must not contain commands for deployment or access to real infrastructure.

## P1 future work if separately authorized
**Stage P1-DES (DOCUMENT ONLY)**: PC-003 could route to PP-002 (or distinct design role) ONE additive scope-conforming draft design specification, including minimal synthetic fixture semantics; decision tree for source-code custody without selecting unauthorized infrastructure; conceptual E→V custody boundary without operational instructions; minimum explicit gates before execution; and objectively evaluable PASS/FAIL/UNKNOWN. Owner reviews design and chooses/changes case, no implementation.

**Stage P1-QA (LATER SEPARATE)**: independent paper design QA, if Owner separately approves. Review does not certify physical E/V or real CAS.

**Stage P1-EXEC (NOT NOW)**: no permission until new strict owner authorization, actual E/V qualification, source custody decision, trusted P/issuer and original S1/S2 and six-gate constraints are independently addressed. This proposal supplies NO execution authority.

## Strategic distinction
One carefully bounded synthetic pilot is a proof-of-process *candidate*, not an accepted design for cross-project repeatability, central master federation or production Project Control. An offline demonstration's possible PASS is necessarily narrower than the user's long-term multi-project deployment goal. Do not expand the plan to an always-on tool, repeat runs or additional project repos by implication.
