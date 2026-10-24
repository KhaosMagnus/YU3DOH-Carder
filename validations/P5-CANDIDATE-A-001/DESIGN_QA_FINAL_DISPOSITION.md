---
artifact_id: P5-CANDIDATE-A-001-DESIGN-QA-FINAL
artifact_type: qa_report
status: VALIDATED
protocol_version: "1.0"
source_role: DESIGN_QA
source_instance: DQA-001
target_role: PROJECT_CONTROL
target_instance: PC-001
control_parent_sha: 9aa46686bcde640248d0ac53a64688a8eeff755b
gate_control_sha: fe9c16a1def8a4be69929c20bbc5bb350f5bfa7f
deployment_evidence_control_sha: dd7e60d160241530826b35f429848b08778223ae
implementation_control_sha: f026cd085548aba83025b1b93874e3932188e118
code_baseline:
  branch: fix/workspace-rc-normal-subtype-icon
  sha: 61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c
related_requests:
  - CR-0001.1
  - CR-0001.5
source_artifacts:
  - handoffs/CR-0001.1_CORRECTION_HANDOFF.md
  - implementations/IMPLEMENTATION-CR-0001.1-CR-0001.5-001.md
  - validations/P5-CANDIDATE-A-001/DESIGN_QA_REPORT.md
  - validations/P5-CANDIDATE-A-001/EVIDENCE_REQUEST.md
  - validations/P5-CANDIDATE-A-001/ENV-002_ENVIRONMENT_READINESS_REPORT.md
  - validations/P5-CANDIDATE-A-001/DEPLOY-003_VALIDATION_EVIDENCE.md
supersedes:
  - validations/P5-CANDIDATE-A-001/DESIGN_QA_REPORT.md
created_at: "2026-10-24T08:06:00Z"
approved_at: "2026-10-24T08:06:00Z"
official_result: PASS
---

# FINAL EXTERNAL DESIGN + QA DISPOSITION — P5 CANDIDATE A
## CR-0001.1 / F-01 + CR-0001.5 / F-05

**EXACT CANDIDATE SHA:**  
`61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c`

**CANDIDATE BRANCH:**  
`fix/workspace-rc-normal-subtype-icon`

## 1. Superseding official disposition

```text
PASS
```

This artifact supersedes the previous Candidate A `PARTIAL` disposition in:

`validations/P5-CANDIDATE-A-001/DESIGN_QA_REPORT.md`

The previous PARTIAL existed solely because the frozen handoff required independent
post-implementation operational/visual evidence that had not yet been available.

DEPLOY-003 has now supplied that missing evidence on the exact Candidate A SHA.

No remaining acceptance gap has been identified for CR-0001.1 or CR-0001.5 within the
frozen correction contract.

## 2. Exact-SHA and execution integrity

External Design + QA verified:

- Candidate A remote branch remains exactly
  `61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c`;
- `feature/workspace-v0.1` remains
  `4c9b0228bb47ac074c49a977b48dbf0844c33a94`;
- `main` remains
  `54cc3aad246c89a29f2a18be63c539db68cae041`;
- Candidate B remains independently
  `59fb2924b2240f005fb3e9e6d5afbd8aaca39596`.

DEPLOY-003 Actions run:

`40076376323`

Job:

`120820475829`

completed successfully.

The job independently checked out Candidate A into a separate Git working tree and proved
before and after execution:

```text
git rev-parse HEAD
61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c

git status --porcelain
<empty>

working diff
<empty>

cached diff
<empty>
```

No Candidate production source, migration, dependency manifest or lockfile was changed by
the validation harness.

The operational harness lived on separate ops branch
`ops/candidate-a-deploy-003-actions`; its commits are validation infrastructure and are
not part of Candidate A.

## 3. Independent evidence integrity review

GitHub artifact:

`12552909783`

Artifact name:

`deploy003-validation-40076376323-61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c`

GitHub-reported digest:

`sha256:071fe5f35ab7e64c8bb2ff34950505f58ef4f6f2e2454301fb8f74ac366e46e1`

DQA-001 independently downloaded the artifact during this final review.

The downloaded ZIP SHA-256 matched the GitHub digest exactly:

`071fe5f35ab7e64c8bb2ff34950505f58ef4f6f2e2454301fb8f74ac366e46e1`

DQA-001 also executed verification of the included `manifest.sha256`; all extracted
evidence files matched their recorded hashes.

The raw screenshots and machine-readable evidence were inspected directly, rather than
accepting only Deployment's SATISFACTORY labels.

## 4. Operational evidence disposition

### A-OP-01 — NORMAL SPELL

```text
RESULT:
SATISFACTORY
```

Direct screenshot inspection confirms:
- Spell frame;
- top-right SPELL attribute icon present;
- type line `Spell Card`;
- no circular NORMAL subtype icon.

Prepared/working evidence retains semantic NORMAL and Canonical before/after remains
`subtype_code:NORMAL` at unchanged revision before write-back.

This closes the visual portion of AC-A1.

### A-OP-02 — NORMAL TRAP

```text
RESULT:
SATISFACTORY
```

Direct screenshot inspection confirms:
- Trap frame;
- top-right TRAP attribute icon present;
- type line `Trap Card`;
- no circular NORMAL subtype icon.

Prepared/working evidence retains semantic NORMAL and Canonical before/after remains
`subtype_code:NORMAL`.

This closes the visual portion of AC-A2.

### A-OP-03 — FIELD SPELL

```text
RESULT:
SATISFACTORY
```

Direct screenshot inspection confirms the Field subtype icon is visibly rendered beside
the Spell type line while the top-right SPELL attribute icon remains present.

Prepared/working and Canonical evidence preserve FIELD.

This supplies the required representative non-NORMAL SPELL visual regression proof for
AC-A4.

### A-OP-04 — COUNTER TRAP

```text
RESULT:
SATISFACTORY
```

Direct screenshot inspection confirms the Counter subtype icon is visibly rendered beside
the Trap type line while the top-right TRAP attribute icon remains present.

Prepared/working and Canonical evidence preserve COUNTER.

This supplies the required representative non-NORMAL TRAP visual regression proof for
AC-A5.

### A-OP-05 — NORMAL SPELL and NORMAL TRAP text-only write-back

```text
SPELL:
SATISFACTORY

TRAP:
SATISFACTORY
```

For each family independently, the actual Carder UI was used to edit only the Name field
and perform the acknowledged Save to Workspace flow.

Both actual HTTP write-back responses returned 200 and reported:

```json
{
  "changed": true,
  "changed_blocks": ["TEXT:EN"],
  "moved_to_draft": ["TEXT:EN"],
  "previous_revision": "2",
  "revision": "3"
}
```

Raw before/after Canonical evidence confirms for both SPELL and TRAP:

- `subtype_code:NORMAL` remains NORMAL;
- STRUCTURE remains CONFIRMED;
- STRUCTURE confirmation provenance link remains unchanged;
- TEXT:EN moves CONFIRMED → DRAFT;
- only the EN name changes in localized content;
- one new `CARDER_WRITE_BACK` provenance event targets
  `BLOCK / TEXT:EN`;
- no STRUCTURE provenance event is added;
- revision advances exactly once.

This closes the operational portion of AC-A7 and independently confirms that the renderer
correction did not corrupt NORMAL write-back semantics.

### A-OP-06 — Open in Carder copy

```text
RESULT:
SATISFACTORY
```

The running exact-SHA Library visibly displays:

`Prepares a read-only Workspace snapshot and opens Carder working state. Supported Carder edits can be selectively saved back to Workspace; changes to confirmed blocks require explicit acknowledgement before those blocks move to Draft.`

The obsolete statement:

`Working edits are not saved back to Workspace in RUN 009.`

is absent.

This closes the operational UI portion of AC-B2.

## 5. Frozen acceptance-criteria result

| Acceptance criterion | Final QA result |
| --- | --- |
| AC-A1 NORMAL SPELL | **PASS** |
| AC-A2 NORMAL TRAP | **PASS** |
| AC-A3 null subtype remains iconless/distinct | **PASS** |
| AC-A4 supported non-NORMAL SPELL icons | **PASS** |
| AC-A5 supported non-NORMAL TRAP icons | **PASS** |
| AC-A6 no-op write-back preservation | **PASS** |
| AC-A7 text-only write-back preservation | **PASS** |
| AC-A8 explicit subtype write-back preservation | **PASS** |
| AC-A9 invalid subtype guards | **PASS** |
| AC-A10 original RC correction remains intact | **PASS** |
| AC-B1 obsolete RUN 009 statement removed | **PASS** |
| AC-B2 current capability described accurately | **PASS** |
| AC-B3 copy-only implementation | **PASS** |

The deterministic/source/server evidence accepted in the earlier QA review remains valid;
DEPLOY-003 closes only the independent operational evidence items that were previously
pending.

## 6. Defect and regression classification

```text
IMPLEMENTATION DEFECT:
NOT IDENTIFIED

OPERATIONAL DEFECT:
NOT IDENTIFIED

REGRESSION:
NOT IDENTIFIED
```

The original F-01 defect is corrected within the frozen Candidate A contract.

No new regression was exposed in:
- NORMAL Spell/Trap rendering;
- supported representative non-NORMAL subtype rendering;
- NORMAL write-back semantics;
- Open in Carder copy.

This does not assert that the original F-01 was caused by the earlier null/zero RC
correction; that historical regression relationship remains unestablished.

## 7. CR dispositions under this candidate

### CR-0001.1 / F-01

```text
VALIDATED:
PASS
```

NORMAL SPELL/TRAP retains Canonical NORMAL semantics and no longer renders the erroneous
circular NORMAL subtype icon.

### CR-0001.5 / F-05

```text
VALIDATED:
PASS
```

The obsolete RUN 009 copy is removed and the running UI accurately describes selective,
acknowledged write-back behavior.

## 8. Evidence limitations

The operational execution was GitHub-hosted Ubuntu/Chromium rather than the historical
owner-local Windows environment.

This is not a blocking limitation because:
- the frozen gate required independent exact-SHA operational/visual evidence, not a
  Windows-specific platform matrix;
- the exact Candidate Git tree was independently proven and remained clean;
- the actual application/service/browser stack was exercised;
- screenshots plus actual HTTP and persisted Canonical/provenance evidence were captured;
- all six requested operational cases were executed and satisfactory.

No additional Deployment Validation is required for this correction contract.

## 9. Integration recommendation and authority boundary

Candidate A is now **QA-validated** and may be considered by Project Control / Owner for
the next administrative integration decision.

This QA PASS does **not** itself authorize:
- merge/cherry-pick/rebase;
- integration to `feature/workspace-v0.1`;
- integration to `main`;
- combination with Candidate B;
- RUN 024.

Candidate A and Candidate B remain independently validated candidates.

Any integration ordering or reconciliation decision belongs to Project Control / Owner and
must preserve exact-SHA traceability.

## 10. Final Candidate A state

```text
CANDIDATE A:
fix/workspace-rc-normal-subtype-icon
61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c

CR-0001.1 / F-01:
PASS

CR-0001.5 / F-05:
PASS

AC-A1..A10:
PASS

AC-B1..B3:
PASS

DEPLOY-003:
EVIDENCE READY

A-OP-01..A-OP-06:
6 / 6 SATISFACTORY

IMPLEMENTATION DEFECT:
NOT IDENTIFIED

REGRESSION:
NOT IDENTIFIED

OFFICIAL FINAL EXTERNAL QA:
PASS

ADDITIONAL DEPLOYMENT VALIDATION:
NOT REQUIRED

INTEGRATION:
NOT AUTHORIZED BY QA

RUN 024:
NOT AUTHORIZED
```

## 11. Recommended next route

```text
DESIGN_QA / DQA-001
→ PROJECT_CONTROL / PC-001
```

Project Control should update the canonical request ledger and Candidate A state from
PARTIAL to VALIDATED / PASS, while preserving the separate Owner/Project-Control decision
for any integration action.
