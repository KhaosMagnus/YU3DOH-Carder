---
artifact_id: P5-CANDIDATE-A-001-DESIGN-QA
artifact_type: qa_report
status: VALIDATED
protocol_version: "1.0"
source_role: DESIGN_QA
source_instance: DQA-001
target_role: PROJECT_CONTROL
control_parent_sha: fe9c16a1def8a4be69929c20bbc5bb350f5bfa7f
gate_control_sha: fe9c16a1def8a4be69929c20bbc5bb350f5bfa7f
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
supersedes: null
created_at: "2026-10-22T18:07:00Z"
approved_at: "2026-10-22T18:07:00Z"
official_result: PARTIAL
---

# EXTERNAL DESIGN + QA REPORT — P5 CANDIDATE A
## CR-0001.1 / F-01 + CR-0001.5 / F-05

**EXACT CANDIDATE SHA:**  
`61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c`

**CANDIDATE BRANCH:**  
`fix/workspace-rc-normal-subtype-icon`

**FROZEN HANDOFF:**  
`handoffs/CR-0001.1_CORRECTION_HANDOFF.md`

**IMPLEMENTATION REPORT:**  
`implementations/IMPLEMENTATION-CR-0001.1-CR-0001.5-001.md`

## 1. Official disposition

```text
PARTIAL
```

The candidate passes source-level, deterministic contract and server write-back review for
the bounded correction, and no implementation defect or scope drift was identified.

Final PASS is **not issued** because the frozen handoff explicitly requires independent
post-implementation operational/visual evidence of the actual Workspace → Carder rendering
path. That evidence is not present in the accepted P5 evidence set for this exact candidate.

This is an evidence gap, not a confirmed failure and not a regression.

```text
REGRESSION:
NOT ESTABLISHED

DEPLOYMENT_VALIDATION:
REQUIRED — BOUNDED VISUAL/OPERATIONAL DELTA ONLY
```

## 2. Exact code lineage and footprint

Verified GitHub lineage:

```text
4c9b0228bb47ac074c49a977b48dbf0844c33a94
  ↓
fab10c237514916d367f4646feda2cd24274b7f6
  ↓
61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c
```

Commit subjects:

- `fab10c237514916d367f4646feda2cd24274b7f6` —
  `fix(carder): suppress normal spell trap subtype icon`
- `61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c` —
  `fix(library): update Open in Carder write-back copy`

Baseline comparison is linear: ahead by 2, behind by 0, merge base exactly
`4c9b0228bb47ac074c49a977b48dbf0844c33a94`.

Exact changed files:

- `src/draw/predefined-section/type-ability.ts`
- `scripts/test-workspace-bridge.ts`
- `workspace-server/test/carder-write-back.test.ts`
- `src/library/open-in-carder.tsx`

No Canonical, persistence, migration, schema, dependency, lockfile, workflow, Workspace
bridge production or server Carder write-back production file changed.

Schema remains 8, Workspace format remains 1, and migrations remain the unchanged
001–008 set.

No GitHub Actions workflow run is associated with the exact candidate SHA. This does not
invalidate Development's reported local test gate, but it provides no additional
independent operational evidence.

## 3. Code-review result

### CR-0001.1 renderer correction

The implementation introduces:

`shouldDrawTypeAbilityIcon({ frame, isMonster, size, subFamily })`

and makes the same predicate control both:
- insertion of the subtype-icon marker in the type/ability text; and
- drawing of the subtype icon asset.

For a non-monster large Spell/Trap type line with `subFamily === NORMAL`, the predicate
returns false.

The semantic `subFamily` remains `NORMAL`; it is not rewritten to `NO ICON`.

Therefore the implementation preserves the frozen design decision:
- Canonical NORMAL remains NORMAL;
- Workspace/Carder write semantics remain NORMAL;
- only the renderer icon decision is suppressed.

### CR-0001.5 copy correction

The obsolete RUN 009 statement is absent.

The new copy states that the panel prepares a read-only Workspace snapshot, opens Carder
working state, supports selective save-back for supported edits, and requires explicit
acknowledgement before changed confirmed blocks move to Draft.

Inspection confirms this commit changes copy only and does not modify launch/readiness,
write-back, acknowledgement, API or persistence behavior.

## 4. Acceptance criteria result

| AC | QA result | Evidence |
|---|---|---|
| A1 NORMAL SPELL | **PASS at code/contract layer; operational visual proof pending** | Prepare path retains Spell frame, SPELL attribute, Spell Card text and semantic NORMAL; renderer predicate suppresses NORMAL icon. |
| A2 NORMAL TRAP | **PASS at code/contract layer; operational visual proof pending** | Same as A1 for Trap. |
| A3 null subtype iconless/distinct | **PASS** | null maps to NO ICON; deterministic matrix and write-back tests keep null distinct from NORMAL. |
| A4 non-NORMAL SPELL icons | **PASS at deterministic layer; representative visual proof pending** | CONTINUOUS, EQUIP, FIELD, QUICK_PLAY/QUICK-PLAY and RITUAL retain icon=true; SPELL COUNTER remains invalid. |
| A5 non-NORMAL TRAP icons | **PASS at deterministic layer; representative visual proof pending** | CONTINUOUS and COUNTER retain icon=true; unsupported Trap subtype matrix remains rejected. |
| A6 no-op write-back | **PASS** | Server tests prove no false STRUCTURE mutation or revision advance and preserve exact subtype. |
| A7 text-only write-back | **PASS at server contract layer; operational delta proof pending** | Server tests prove only TEXT moves to Draft, STRUCTURE remains confirmed, subtype remains exact, provenance targets TEXT. |
| A8 explicit subtype write-back | **PASS** | NORMAL SPELL→FIELD and NORMAL TRAP→COUNTER succeed; subsequent NO ICON clears Canonical subtype to null. |
| A9 invalid subtype guards | **PASS** | Existing invalid Spell/Trap family combinations remain rejected without writes. |
| A10 original RC correction | **PASS by regression evidence** | Candidate does not touch Canonical null/zero/applicability production code; Development reports full server gate and RC null/zero suite passing. |
| B1 stale RUN 009 statement removed | **PASS** | Source inspection. |
| B2 current capability copy accurate | **PASS at source layer; operational UI proof pending** | New wording matches current selective acknowledged write-back contract. |
| B3 copy-only | **PASS** | Exact second-commit diff changes only `src/library/open-in-carder.tsx`. |

All deterministic/source acceptance requirements reviewed above are satisfactory.

The remaining issue is the explicit post-implementation operational evidence requirement in
section 10 of the frozen handoff.

## 5. Development evidence accepted

Development reports the complete required gate passing on the exact candidate:

```text
yarn compile
yarn build
yarn test:sc
yarn test:library
yarn --cwd workspace-server compile
yarn --cwd workspace-server test
```

Reported server result: 1056 passed, 0 failed, 0 skipped.

Independent source review confirms that the new tests exercise:
- the complete supported Spell/Trap subtype icon-decision matrix;
- NORMAL/no-icon semantic distinction;
- no-op write-back;
- text-only write-back;
- explicit subtype transitions;
- invalid subtype rejection.

These results are accepted as technical evidence, but they do not replace the handoff's
separate independent operational/visual gate.

## 6. Evidence limitation

The frozen handoff requires actual operational evidence from the rendered Carder path.

No such independent execution is published for
`61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c`.

DQA-001 did not claim a browser execution it could not independently perform. The current
QA runtime could inspect the exact GitHub source and lineage but could not materialize an
exact candidate checkout for a new browser run, and there is no associated GitHub Actions
run carrying that evidence.

Accordingly, the missing evidence is routed to DEPLOYMENT_VALIDATION rather than inferred
from the pure renderer predicate.

No additional owner-manual testing is requested.

## 7. Required bounded operational evidence

A separate frozen evidence request must cover only the delta required by the handoff:

1. NORMAL SPELL opened from Workspace into Carder:
   - Spell frame;
   - SPELL attribute/top-right attribute icon intact;
   - `Spell Card` type line;
   - no circular NORMAL subtype icon.

2. NORMAL TRAP opened from Workspace into Carder:
   - Trap frame;
   - TRAP attribute/top-right attribute icon intact;
   - `Trap Card` type line;
   - no circular NORMAL subtype icon.

3. representative non-NORMAL SPELL:
   - FIELD is sufficient;
   - expected Field subtype icon visibly rendered.

4. representative non-NORMAL TRAP:
   - COUNTER is sufficient;
   - expected Counter subtype icon visibly rendered.

5. NORMAL SPELL and NORMAL TRAP text-only Carder write-back:
   - Canonical `subtype_code:NORMAL` remains NORMAL;
   - STRUCTURE is not falsely changed;
   - existing TEXT confirmation/provenance behavior is preserved.

6. Open in Carder panel:
   - corrected copy visible;
   - no stale RUN 009 no-write-back statement.

The evidence must be tied to exact SHA
`61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c`.

Already-satisfactory unrelated RC cases must not be repeated.

## 8. Unresolved limitations

Only one release-relevant limitation remains for this candidate:

```text
MANDATORY INDEPENDENT VISUAL/OPERATIONAL DELTA EVIDENCE:
PENDING
```

No code correction is requested at this stage.

If Deployment observes the expected behavior for all requested cases, Candidate A should
return to DESIGN_QA for the final exact-SHA disposition. If it observes a mismatch, return
the exact case evidence for defect classification.

## 9. Recommended route

```text
PROJECT_CONTROL
→ DEPLOYMENT_VALIDATION
→ DESIGN_QA
```

Candidate A must remain isolated at exact SHA
`61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c`.

Do not merge Candidate B, do not integrate to `feature/workspace-v0.1`, and do not create
RUN 024.

## 10. Gate summary

```text
CANDIDATE A:
61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c

CR-0001.1:
TECHNICAL CONTRACT SATISFACTORY
MANDATORY OPERATIONAL/VISUAL EVIDENCE PENDING

CR-0001.5:
SOURCE/COPY CONTRACT SATISFACTORY
OPERATIONAL UI CONFIRMATION PENDING WITH SAME DELTA RUN

OFFICIAL EXTERNAL QA RESULT:
PARTIAL

DEPLOYMENT VALIDATION REQUIRED:
YES

INTEGRATION AUTHORIZED:
NO

RUN 024:
NOT AUTHORIZED
```
