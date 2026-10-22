---
artifact_id: VAL-RC-LOCAL-001-DESIGN-QA-REVIEW
artifact_type: design_qa_review
status: VALIDATED
protocol_version: "1.0"
source_role: DESIGN_QA
source_instance: UNREGISTERED
target_role: PROJECT_CONTROL
control_parent_sha: 62a6b223e80c4c9a2a629e78c5d93a7377b04fa1
code_baseline:
  branch: feature/workspace-v0.1
  sha: 4c9b0228bb47ac074c49a977b48dbf0844c33a94
related_requests:
  - OWNER-LOCAL-RC-RELEASE-REHEARSAL
  - RC-LOCAL-DEFECT-001
  - RC-LOCAL-DEFECT-002
  - RC-LOCAL-OBS-004
  - RC-LOCAL-OBS-005
  - RC-LOCAL-OBS-006
  - RC-LOCAL-OBS-007
  - RC-LOCAL-OBS-008
supersedes: null
created_at: "2026-10-22T08:19:00Z"
approved_at: "2026-10-22T08:19:00Z"
---

# YU3DOH Workspace v0.1 — External Design + QA Review
## VAL-RC-LOCAL-001 · Project Control v1.0 · Pilot 001

**CONTROL PARENT:** `62a6b223e80c4c9a2a629e78c5d93a7377b04fa1`  
**SOURCE ARTIFACT:** `validations/VAL-RC-LOCAL-001/VALIDATION_EVIDENCE.md`  
**CODE BASELINE:** `feature/workspace-v0.1 @ 4c9b0228bb47ac074c49a977b48dbf0844c33a94`  
**SOURCE ROLE:** `DEPLOYMENT_VALIDATION`  
**REVIEW ROLE:** `DESIGN_QA`

## 1. Receipt and authority

This review consumes the exact Project Control v1.0 artifacts and evidence at CONTROL SHA
`62a6b223e80c4c9a2a629e78c5d93a7377b04fa1`, and the exact code candidate
`4c9b0228bb47ac074c49a977b48dbf0844c33a94`.

The following control/code invariants were verified before classification:

- `meta/project-control = 62a6b223e80c4c9a2a629e78c5d93a7377b04fa1`;
- `feature/workspace-v0.1 = 4c9b0228bb47ac074c49a977b48dbf0844c33a94`;
- `main = 54cc3aad246c89a29f2a18be63c539db68cae041`.

No alternate baseline was selected and no reconciliation was performed.

The source evidence is accepted as Deployment Validation evidence with operational status
`EVIDENCE READY`. Its SATISFACTORY case labels are treated as evidence observations,
not as automatic External Design + QA PASS.

## 2. Official result

### External Design + QA official result for this review

```text
FAIL
```

**Scope of this FAIL:** complete candidate readiness of
`feature/workspace-v0.1 @ 4c9b0228bb47ac074c49a977b48dbf0844c33a94`
for the release-closure review represented by VAL-RC-LOCAL-001.

Reason: F-01 is a confirmed functional Workspace → Carder projection/rendering defect in
a supported NORMAL SPELL/TRAP workflow. The defect is within the candidate's supported
round-trip surface and therefore blocks a complete readiness PASS.

This does **not** convert the original null/zero correction into a failure.

### Original RC correction

```text
RC-LOCAL-DEFECT-001:
PASS
```

Deployment Validation reproduced the original corrected scenario on the exact candidate:
after save and actual close/reopen, `rank:null`, `pendulum_scale:null` and
`pendulum_text:null` were preserved. Level and other intended fields remained intact.

The exact-code inspection is consistent with this result: the RC correction added Draft
applicability/coherence and null/zero handling without introducing F-01.

### Regression status

```text
REGRESSION:
NOT ESTABLISHED
```

F-01 is a confirmed defect, but the available evidence does not establish that
`4c9b0228...` newly regressed behavior that was correct at the preceding RUN 023
checkpoint. The RC correction comparison does not modify the Workspace bridge mapping,
Carder prepare path, or Carder subtype renderer involved in F-01. Therefore the correct
classification is **confirmed defect**, not **REGRESSION caused by the RC correction**.

### Evidence completeness

The evidence is sufficient to:
- PASS the original RC correction reproduction;
- confirm F-01;
- classify F-02 through F-09;
- reject an overall candidate-readiness PASS.

The evidence is not a complete substitute for every previously contemplated release
negative test. In particular, an independent stale-Carder-session conflict test was not
executed locally. Because F-01 already blocks the candidate, no additional owner-manual
test is required before routing the defect. Any later corrected candidate should receive
risk-based delta validation plus any still-required outstanding release evidence.

## 3. Finding classification

### F-01 — NORMAL Spell/Trap subtype icon in Carder
Source-conversation identifier: `RC-LOCAL-DEFECT-002`

**FINDING**  
A Canonical NORMAL SPELL/TRAP is projected into Carder with `subFamily: NORMAL`,
which causes Carder to draw a circular subtype icon. NORMAL Spell/Trap should retain
Canonical `subtype_code:NORMAL` while projecting to Carder with no subtype icon
(`subFamily: NO ICON`).

**EVIDENCE**  
Operational evidence shows a clean NORMAL TRAP reopen rendering the unwanted circular
Normal icon. The clean exported working card records `fr:"trap"`, `at:"TRAP"`,
`sf:"NORMAL"`, `ta:["Trap Card"]`.

Exact code inspection at the reviewed SHA confirms the path:
- `src/service/workspace-bridge/mapping-matrix.ts` maps
  `SPELL_TRAP_SUBTYPE_MAP.NORMAL = 'NORMAL'`;
- `mapSpellTrapSubFamily()` returns that mapping for a non-null NORMAL subtype;
- `src/service/workspace-bridge/prepare-working-card.ts` assigns that mapped value
  directly to Carder `subFamily`;
- `src/draw/predefined-section/type-ability.ts` draws a subtype icon when
  `subFamily !== NO_ICON` in the large Spell/Trap type line.

The RC correction commit does not touch those mapping/render paths.

**QA CLASSIFICATION**  
CONFIRMED FUNCTIONAL DEFECT.  
Not a withdrawn item.  
Not a deferred UI enhancement.  
Not established as an RC-correction regression.

**RATIONALE**  
The persisted Canonical structure is correct; the defect is in the supported
Workspace → Carder projection/render behavior. Hiding the symptom by changing Canonical
NORMAL to null would corrupt domain semantics and is not an acceptable correction.

**BLOCKING / NON-BLOCKING**  
**BLOCKING** for complete candidate/release readiness.  
**NON-BLOCKING** to the already-proven narrow null/zero correction itself.

**ROUTING**  
`PROJECT_CONTROL → DESIGN_QA correction contract → DEVELOPMENT`.

No Scope/Owner product decision is required to determine the expected behavior described
above. Project Control must first register the canonical request/disposition; this review
does not create a Change Request ID.

**REQUIRED NEXT ACTION**  
Register the defect canonically, then authorize a bounded correction whose acceptance
criteria include at minimum:
1. Canonical NORMAL SPELL remains `subtype_code:NORMAL`;
2. Canonical NORMAL TRAP remains `subtype_code:NORMAL`;
3. Workspace → Carder maps those NORMAL subtypes to no subtype icon;
4. non-NORMAL supported Spell/Trap subtypes retain their proper icons;
5. Carder write projection does not rewrite Canonical NORMAL to null merely to suppress
   the icon;
6. regression coverage proves both SPELL and TRAP behavior on the exact correction SHA.

---

### F-02 — Level/Rank numeric range contract and transient text-entry UX

**FINDING**  
Level and Rank have no explicit min/max at the editor control and the Canonical server
currently validates integer-ness, not a bounded range. Owner-local evidence demonstrated
numeric out-of-range examples (Level 18 and -6). Alphabetic/symbol working-input states
were reported as temporarily enterable, but persistence of such nonnumeric values was not
demonstrated.

**EVIDENCE**  
At the reviewed SHA:
- `src/library/editor-form.tsx` uses Ant Design `InputNumber` for Level and Rank
  without explicit `min` or `max`;
- `workspace-server/src/canonical/validation.ts` uses
  `assertIntegerOrNull()`, which checks `Number.isInteger` but not a range;
- source evidence explicitly states that no accepted PATCH or authoritative reload of
  alphabetic/symbol values was demonstrated.

The owner has proposed Level 1–12 and Rank 0–13 as a candidate contract, while explicitly
requiring review of exceptional/historical compatibility.

**QA CLASSIFICATION**  
Two-part classification:
1. **PRODUCT/DOMAIN CONTRACT GAP — SCOPE/OWNER DECISION REQUIRED** for Level/Rank ranges.
2. **UX OBSERVATION + EVIDENCE LIMITATION** for temporary nonnumeric editing states.

This is not currently classified as a regression because no frozen range contract has
been identified against which the candidate violates a previously accepted requirement.

**RATIONALE**  
A client-only min/max would be insufficient if domain persistence is intended to enforce
the same rule. Conversely, DESIGN_QA must not invent bounds where historical/exceptional
card behavior has not been settled by Scope/Owner. Temporary editor input behavior must
also be distinguished from persistible Canonical values.

**BLOCKING / NON-BLOCKING**  
**NON-BLOCKING** to the original RC correction and to this candidate under the currently
verified frozen integer-only contract.  
It remains an unresolved owner request and cannot be marked implemented/resolved.

**ROUTING**  
`PROJECT_CONTROL → SCOPE_ARCHITECTURE / OWNER`.

**REQUIRED NEXT ACTION**  
Project Control registers the pending request. Scope/Owner must define:
- allowed Level domain;
- allowed Rank domain;
- handling of zero;
- handling of exceptional/historical records;
- whether Draft may temporarily represent out-of-range values;
- server enforcement requirements;
- client min/max/entry behavior;
- migration/backward-compatibility policy if existing persisted values violate the new
  contract.

After scope freeze, DESIGN_QA may derive implementation/acceptance criteria.

---

### F-03 — Link Markers numeric codes and requested graphical directional selector

**FINDING**  
The LINK editor supports multiple Link Markers and derives Link Rating, but marker
selection remains a multi-select of numeric registry codes instead of the previously
requested eight-direction graphical selector based on the existing YGOCARDER control.

**EVIDENCE**  
At the reviewed SHA, `src/library/editor-form.tsx` renders `Link Markers` as
`<Select mode="multiple">` populated directly from `metadata.link_markers`; displayed
options are the registry codes. The owner evidence shows chips such as 2, 3, 8, 9.
The Link Rating field is already derived, so the statement "only one marker supported"
is not supported by current evidence.

**QA CLASSIFICATION**  
**PREVIOUSLY DEFERRED / UNIMPLEMENTED UI INTERACTION REQUIREMENT.**  
Not a current functional applicability defect.  
Not implemented merely because Link applicability itself works.

**RATIONALE**  
The requested graphical selector changes interaction/visual design, not the already
working multiplicity or derived-rating semantics. The source evidence records this as a
previously requested/deferred design improvement. DEFERRED is not resolved.

**BLOCKING / NON-BLOCKING**  
**NON-BLOCKING** for the current RC correction/candidate under its deferred disposition.

**ROUTING**  
`PROJECT_CONTROL` to preserve canonical deferment and request traceability; if the owner
reactivates it, then `SCOPE_ARCHITECTURE → DESIGN_QA`.

**REQUIRED NEXT ACTION**  
Do not implement automatically. Preserve the prior request as DEFERRED with its reason and
revisit condition. If reactivated, freeze the graphical eight-direction behavior, keyboard
and accessibility behavior, code↔direction mapping, placement, and derived-rating display.

---

### F-04 — Library Grid/List
Source-conversation identifier: `RC-LOCAL-OBS-004`

**FINDING**  
Library continues to present full-width horizontal cards without the requested
space-efficient Grid/List mode.

**EVIDENCE**  
Owner-local screenshots show cards occupying entire rows. At the reviewed SHA,
`src/library/library.scss` defines `.library-results { display: grid; gap: 12px; }`
without a multi-column card grid definition or a Grid/List mode control.

The source evidence records that earlier QA explicitly deferred this preexisting visual
issue from the corrective SHA.

**QA CLASSIFICATION**  
**PREVIOUSLY DEFERRED UI IMPROVEMENT.**

**RATIONALE**  
Absence of a deferred feature is not proof of failed implementation of the narrow RC
correction. At the same time, DEFERRED is not IMPLEMENTED and must remain traceable.

**BLOCKING / NON-BLOCKING**  
**NON-BLOCKING** under the prior deferment.

**ROUTING**  
`PROJECT_CONTROL`; if reprioritized by Owner, then
`SCOPE_ARCHITECTURE → DESIGN_QA`.

**REQUIRED NEXT ACTION**  
Preserve/request canonical DEFERRED tracking and revisit condition. Do not start
implementation from this QA review.

---

### F-05 — Obsolete Open in Carder description
Source-conversation identifier: `RC-LOCAL-OBS-007`

**FINDING**  
The Library UI still states:
`Working edits are not saved back to Workspace in RUN 009.`
The current candidate demonstrably supports selective, acknowledged Carder write-back.

**EVIDENCE**  
Deployment Validation successfully performed a Carder text write-back revision 5→6 with
the correct confirmation-state transition and `CARDER_WRITE_BACK` provenance.
Exact code inspection of `src/library/open-in-carder.tsx` confirms the obsolete RUN 009
copy is still rendered.

**QA CLASSIFICATION**  
**CONFIRMED UI/COPY DEFECT (STALE PRODUCT MESSAGING).**

**RATIONALE**  
The text describes an obsolete capability boundary and contradicts current supported
behavior. This can mislead an operator even though the underlying write-back feature works.

**BLOCKING / NON-BLOCKING**  
**NON-BLOCKING** for candidate functional readiness by itself.

**ROUTING**  
`PROJECT_CONTROL` for canonical registration; downstream correction can be
`DESIGN_QA → DEVELOPMENT` without a new product-architecture decision.

**REQUIRED NEXT ACTION**  
Replace RUN-specific stale wording with current capability wording that accurately states
the read/prepare launch behavior and selective, acknowledged write-back semantics. Do not
change the underlying protocol as part of a copy correction.

---

### F-06 — Preferred Variant unavailable-composition warning
Source-conversation identifier: `RC-LOCAL-OBS-008`

**FINDING**  
When a Preferred Variant has STANDARD READY but OVERFRAME INCOMPLETE, the UI warns:
`Preferred Variant has unavailable composition.`
The warning is technically broad and can be read as though the preferred variant is
generally unusable.

**EVIDENCE**  
Deployment evidence shows `STANDARD READY ← BS` and expected
`OVERFRAME INCOMPLETE`. Exact code inspection of
`src/library/open-in-carder.tsx` emits the generic warning whenever either Standard or
Overframe is unavailable.

**QA CLASSIFICATION**  
**UX OBSERVATION / INTERFACE CLARITY IMPROVEMENT.**

**RATIONALE**  
The underlying readiness state is correct and the actual incomplete Overframe result is
expected for BS-only assets. The defect asserted is clarity/specificity of communication,
not readiness computation.

**BLOCKING / NON-BLOCKING**  
**NON-BLOCKING.**

**ROUTING**  
`PROJECT_CONTROL` for backlog/disposition tracking. No immediate functional correction
is required.

**REQUIRED NEXT ACTION**  
If accepted for implementation later, make the warning composition-specific (for example,
identify exactly which composition is unavailable) without changing readiness semantics.

---

### F-07 — Confirmation note issue
Prior provisional identifier: `RC-LOCAL-OBS-006`

**FINDING**  
The owner initially reported inability to edit a Confirmation note, then corrected the
report after identifying confusion between TEXT and STRUCTURE confirmation workflows.

**EVIDENCE**  
Deployment Validation successfully entered and persisted distinct MANUAL notes for
TEXT:EN and STRUCTURE. Both confirmation flows completed and provenance retained the notes.

**QA CLASSIFICATION**  
**WITHDRAWN. NO DEFECT.**

**RATIONALE**  
The corrected evidence directly disproves the provisional issue. Project Control protocol
forbids silently resurrecting a withdrawn finding.

**BLOCKING / NON-BLOCKING**  
**NON-BLOCKING. CLOSED AS WITHDRAWN.**

**ROUTING**  
`PROJECT_CONTROL` only to preserve the withdrawn disposition if a canonical request
record is created/updated. No Development or Scope routing.

**REQUIRED NEXT ACTION**  
No product implementation. No repeat manual test required solely for this finding.

---

### F-08 — Historical Pendulum applicability observation

**FINDING**  
Historical pre-correction UI exposed Pendulum text for Spell/Trap where not applicable.
The corrected candidate no longer reproduced that behavior.

**EVIDENCE**  
On `4c9b0228...`, owner-local SPELL and TRAP forms did not expose incompatible Pendulum
text controls. MONSTER showed a separate Pendulum intent toggle. The original RC scenario
also preserved null Pendulum state correctly.

**QA CLASSIFICATION**  
**HISTORICAL FINDING — CORRECTED / CURRENTLY SATISFACTORY.**

**RATIONALE**  
Current exact-SHA operational evidence demonstrates the corrected behavior. This
historical trigger must not be forwarded as a fresh defect.

**BLOCKING / NON-BLOCKING**  
**NON-BLOCKING.**

**ROUTING**  
No implementation routing. `PROJECT_CONTROL` may preserve the historical validated
disposition.

**REQUIRED NEXT ACTION**  
None beyond traceability. Re-test only if a future delta touches applicability behavior.

---

### F-09 — Scope tracking and release messaging

**FINDING**  
Owner requests for Level/Rank limits, graphical Link controls and Library Grid/List have
different dispositions but risk being conflated as new observations, implemented behavior,
or resolved work. A focused RC correction PASS is also at risk of being read as a complete
product/release PASS.

**EVIDENCE**  
The source evidence explicitly records:
- the null/zero correction as locally satisfactory;
- Level/Rank contract as pending;
- graphical Link selector as previously requested/deferred;
- Grid/List as previously deferred;
- no RUN 024 authorization;
- overall release acceptance not declared.

Project Control v1.0 additionally requires every acknowledged owner request to end in an
explicit state and states that DEFERRED is not resolved.

**QA CLASSIFICATION**  
**PROJECT-CONTROL / TRACEABILITY FINDING.**  
Not a product-code defect.

**RATIONALE**  
This is exactly the class of ambiguity the no-disappearing-request rule is intended to
prevent. Different historical dispositions must remain distinct.

**BLOCKING / NON-BLOCKING**  
**NON-BLOCKING** to code execution.  
**BLOCKING to clean control-plane closure** until Project Control canonically records the
pending/deferred/withdrawn/corrected dispositions.

**ROUTING**  
`PROJECT_CONTROL`.

**REQUIRED NEXT ACTION**  
Project Control should, without using IDs invented by this review:
- register the confirmed F-01 defect and downstream correction route;
- register the unresolved Level/Rank product-domain decision;
- preserve graphical Link selector as DEFERRED unless Owner explicitly reactivates it;
- preserve Library Grid/List as DEFERRED unless Owner explicitly reactivates it;
- record F-05 as stale UI copy needing correction;
- record F-06 as non-blocking UX improvement;
- preserve F-07 as WITHDRAWN;
- preserve F-08 as historical/currently corrected;
- preserve the distinction between narrow RC-correction PASS and complete candidate
  readiness FAIL.

## 4. Consolidated disposition matrix

| Finding | QA classification | Blocking? | Implementation needed now? | Primary route |
| --- | --- | --- | --- | --- |
| F-01 | Confirmed functional defect | **BLOCKING** full readiness | **Yes, after control registration/correction authorization** | PROJECT_CONTROL → DESIGN_QA → DEVELOPMENT |
| F-02 | Domain contract gap + UX/evidence limitation | Non-blocking under current frozen contract | Not until Scope/Owner decides bounds | PROJECT_CONTROL → SCOPE_ARCHITECTURE / OWNER |
| F-03 | Previously deferred UI interaction requirement | Non-blocking | No automatic implementation | PROJECT_CONTROL; Scope if reactivated |
| F-04 | Previously deferred Grid/List UI improvement | Non-blocking | No automatic implementation | PROJECT_CONTROL; Scope if reactivated |
| F-05 | Confirmed stale UI/copy defect | Non-blocking | Yes, later bounded correction | PROJECT_CONTROL → DESIGN_QA → DEVELOPMENT |
| F-06 | UX clarity improvement | Non-blocking | Optional/later | PROJECT_CONTROL |
| F-07 | WITHDRAWN | Non-blocking | No | PROJECT_CONTROL trace only |
| F-08 | Historical, corrected/currently satisfactory | Non-blocking | No | PROJECT_CONTROL trace only |
| F-09 | Control-plane traceability finding | Blocks clean control closure, not code | Documentation/control action only | PROJECT_CONTROL |

## 5. Operational evidence disposition

The following evidence is accepted as satisfactory for the exact candidate and should not
be discarded merely because the overall review is FAIL:

- exact-SHA preflight and clean detached checkout;
- root/server compile and production client build;
- explicit fresh Workspace initialization to format 1 / schema 8;
- original RC null/zero reproduction;
- representative SPELL/TRAP persistence and applicability;
- confirmation workflow and provenance;
- managed BS ingest / Preferred variant / STANDARD readiness;
- Carder open and selective write-back mechanics apart from F-01 subtype rendering;
- full backup, mutation, restore and authoritative data recovery;
- post-restore asset usability;
- dirty-editor restore guard up to the evidenced disabled action.

A future corrected candidate should use risk-based/delta validation rather than requiring
the owner to repeat already-satisfactory evidence without technical cause.

## 6. Evidence limitations

Recorded limitations remain limitations, not invented failures:

1. No optional live YGOResources smoke was executed.
2. No independent stale Carder session/revision-conflict negative test was executed in
   the owner-local corrected-candidate rehearsal.
3. Nonnumeric Level/Rank persistence was not demonstrated; only transient working-input
   behavior and out-of-range numeric examples were observed.
4. No independent post-restore asset byte SHA-256 was recorded; binding plus successful
   post-restore rendering provides operational evidence.
5. Dirty-editor Restore was proven blocked without acknowledgment; post-cancel editor state
   after that specific final check was not independently evidenced.
6. Browser exact version was not recorded.
7. Screenshot/JSON binaries remain source-conversation evidence and are not GitHub-hosted
   under Pilot 001.

None of these limitations changes the confirmed F-01 result. Additional owner-manual
testing is not required before routing F-01.

## 7. Release and RUN disposition

```text
ORIGINAL RC CORRECTION (RC-LOCAL-DEFECT-001):
PASS

VAL-RC-LOCAL-001 DESIGN_QA OFFICIAL RESULT:
FAIL

COMPLETE CANDIDATE READINESS:
FAIL / BLOCKED BY F-01

BLOCKING CONFIRMED DEFECTS:
F-01

REGRESSION CAUSED BY RC CORRECTION:
NOT ESTABLISHED

RUN 024:
NOT AUTHORIZED

MAIN INTEGRATION:
NOT AUTHORIZED

NEW MIGRATION:
NOT AUTHORIZED

NEW SCHEMA VERSION:
NOT AUTHORIZED
```

F-02/F-03/F-04/F-06 remain separate from F-01 and do not become release blockers merely
because they are unresolved, deferred, or UX-oriented. F-05 is a confirmed non-blocking
UI/copy defect. F-07 remains withdrawn. F-08 remains historical/currently corrected.

## 8. Recommended routing

Because this review produces **multiple downstream destinations** and because Project
Control must first create/maintain the canonical request dispositions, the single next
target is:

```text
PROJECT_CONTROL
```

Recommended downstream routing after Project Control registration:

- F-01 → DESIGN_QA correction contract → DEVELOPMENT;
- F-02 → SCOPE_ARCHITECTURE / OWNER;
- F-03 → remain DEFERRED unless Owner reactivates → then SCOPE_ARCHITECTURE;
- F-04 → remain DEFERRED unless Owner reactivates → then SCOPE_ARCHITECTURE;
- F-05 → DESIGN_QA bounded correction → DEVELOPMENT;
- F-06 → backlog/UX disposition;
- F-07 → preserve WITHDRAWN;
- F-08 → preserve corrected/historical;
- F-09 → PROJECT_CONTROL bookkeeping/routing.

No next-stage work is authorized by this artifact itself.
