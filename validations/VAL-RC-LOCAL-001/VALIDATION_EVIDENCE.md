---
artifact_id: VAL-RC-LOCAL-001
artifact_type: validation_evidence
status: REVIEW
operational_status: EVIDENCE READY
protocol_version: "1.0"
source_role: DEPLOYMENT_VALIDATION
source_instance: UNREGISTERED
target_role: DESIGN_QA
control_parent_sha: d0282df9526563c2b64e33cd47d0dc850de7f8ea
code_baseline:
  branch: feature/workspace-v0.1
  sha: 4c9b0228bb47ac074c49a977b48dbf0844c33a94
related_requests:
  - OWNER-LOCAL-RC-RELEASE-REHEARSAL
  - RC-LOCAL-DEFECT-001
  - RC-LOCAL-OBS-004
supersedes: null
created_at: "2026-10-22T07:15:02.558Z"
approved_at: null
---

# OWNER-LOCAL RC OPERATIONAL VALIDATION — VALIDATION EVIDENCE
## VAL-RC-LOCAL-001 · Pilot 001 · Deployment Validation → External Design + QA

**Operational result: EVIDENCE READY. Official QA classification: PENDING.**  
**Original RC correction reproduction: locally satisfactory. Overall release/RC acceptance: not declared.**  
The earlier description, "ENSAYO OPERATIVO COMPLETADO — HALLAZGOS PENDIENTES DE CLASIFICACIÓN", is preserved. This is an evidence artifact, not an official RUN verdict, implementation authorization, owner product decision, or integration approval.

## 1. Authority, scope and immutability

- Repository: `KhaosMagnus/YU3DOH-Carder`.
- CONTROL branch: `meta/project-control`; exact CONTROL parent SHA: `d0282df9526563c2b64e33cd47d0dc850de7f8ea`.
- CODE branch validated: `feature/workspace-v0.1`, exact SHA `4c9b0228bb47ac074c49a977b48dbf0844c33a94`.
- Local checkout for execution: `D:\Local\YU3DOH-Workspace-RC-v0.1`; detached HEAD at exact CODE SHA, rather than moving a development branch.
- Pilot protocol: Project Control v1.0. Publication changes documentation and cross-role routing only; does not change past test procedure.
- No source edits, commits to code branches, migrations, RUN 024 creation, changes to `main`, or new integration were performed by Deployment Validation.
- Formal decisions about defect severity, acceptable limits, scheduling, design and release authority belong to DESIGN_QA / SCOPE_ARCHITECTURE / OWNER as appropriate. Identifiers below retain the terminology already used in the source conversation; classification remains pending.

## 2. Environment and test data

| Item | Recorded evidence |
| --- | --- |
| Host OS | Windows 10 Enterprise LTSC, build 19044 |
| Shell | Windows PowerShell 5.1 |
| Git | 2.52.0.windows.1 |
| Node.js | v24.21.0 |
| Yarn | 1.22.22 |
| Client | Vite 8.0.14; `http://localhost:3000/ygocarder/` and `/ygocarder/library/` |
| Workspace Service | `http://127.0.0.1:4312`, process logged PID 13628 |
| Workspace root | `D:\Local\YU3DOH Workspace RC Correction 日本語` (spaces + Japanese characters) |
| Workspace ID | `3847b123-ae5c-4a46-8919-24aab854f930` |
| Lifecycle/schema | Initialized explicitly: `READY`, Workspace format `1`, SQLite schema `8`, read-only `false` |
| Migrations | Repository exact CODE SHA contains `001`–`008`, no `009` (GitHub tree inspection); runtime UI reported schema 8 |
| Browser | Browser GUI evidenced in screenshots; exact product/build not independently recorded |
| Backup | `efc311a6-62d7-4a45-991a-01484ef59a7d`, FULL, MANUAL, schema 8, Output excluded |
| Source image | `D:\Local\YU3DOH-RC-TRAP-BS-4c9b0228.png`, disposable PNG 1039×1514, 23,945 bytes, opaque |
| Managed asset | `Assets/Managed/d0cdc049-3eca-4292-910c-ed59c0ef30b8/default/BS.png` |

Workspace root was verified nonexistent before launch; service correctly reported `NEEDS_INITIALIZATION`. Explicit owner UI initialization produced `READY`. The previous disposable Workspace and historical clone were not reused for this corrected-SHA reproduction.

### Canonical fixtures

| Family | card_id | Canonical state after initial edit |
| --- | --- | --- |
| MONSTER | `bad45fca-a875-4afe-9b7e-12547d1e4697` | revision 2; MAIN_DECK / DARK / AQUA / Level 4 / ATK 1800 / DEF 1000 / EFFECT; EN name "RC Monster Validation 001", text "Test monster for Workspace RC validation." |
| SPELL | `33aef3d8-b966-48be-b881-9b10db041be6` | revision 2; NORMAL; EN name "RC Spell Validation 001", text "Test spell for Workspace RC validation." |
| TRAP | `d0cdc049-3eca-4292-910c-ed59c0ef30b8` | revision 2; NORMAL; EN name "RC Trap Validation 001", text "Test trap for Workspace RC validation."; subsequently used for confirmations, asset ingest, write-back and restore |

Test-only TRAP password `87654321` was entered to confirm STRUCTURE. It is a fictional disposable-fixture value, not production credentials.

## 3. Cases executed — expected, observed, evidence

| Case | EXPECTED | OBSERVED | Operational evidence result |
| --- | --- | --- | --- |
| DV-01 — Candidate preflight | Exact checked CODE SHA; clean checkout; no branch movement | Remote `feature/workspace-v0.1` resolved to `4c9b0228...`; detached checkout; clean `git status` at prebuild check | SATISFACTORY |
| DV-02 — Build | Client and server compile; production client builds | `yarn compile` 13.06 s; `yarn --cwd workspace-server compile` 3.38 s; Vite transformed 3965 modules and built in 31.35 s (Yarn 51.22 s). Nonblocking Rolldown annotation/plugin-timing notices | SATISFACTORY |
| DV-03 — Workspace initialize | Missing root remains uninitialized until explicit UI action; schema 8 | `Test-Path` False; server `NEEDS_INITIALIZATION`; Library editing disabled; explicit Initialize → `READY`, format 1, schema 8, no backups | SATISFACTORY |
| DV-04 — Original `RC-LOCAL-DEFECT-001` | For non-XYZ, non-PENDULUM MAIN_DECK, Rank and Scale remain null, Pendulum text remains null after save/reopen | MONSTER saved revision 1→2, then closed/reopened: `rank:null`, `pendulum_scale:null`, `pendulum_text:null`, `link_markers:[]`, `link_rating:null`; Level 4 and other data intact | SATISFACTORY LOCAL REPRODUCTION |
| DV-05 — SPELL | NORMAL subtype, EN localization persist; Pendulum not applicable | SPELL revision 1→2, structure `{"kind":"SPELL","subtype_code":"NORMAL"}`, EN text preserved, `pendulum_text:null`; no Pendulum editor fields displayed | SATISFACTORY |
| DV-06 — TRAP | NORMAL subtype, EN localization persist; Pendulum not applicable | TRAP revision 1→2, structure `{"kind":"TRAP","subtype_code":"NORMAL"}`, EN text preserved, `pendulum_text:null`; no Pendulum editor fields displayed | SATISFACTORY |
| DV-07 — Applicability visualization | MAIN_DECK shows Level; XYZ shows Rank; LINK shows markers/rating; Pendulum independently toggled | Screenshots show these field configurations. Link selectors still numeric, not graphical; see outstanding observations | SATISFACTORY FOR APPLICABILITY; UX PENDING |
| DV-08 — Confirm TEXT:EN | Review PASS; explicit confirmation with provenance; revision advancement | TRAP `TEXT:EN` review PASS; MANUAL with optional note; confirm revision 2→3; state CONFIRMED | SATISFACTORY |
| DV-09 — Confirm STRUCTURE | Non-Token requires password; valid structure can be confirmed, without losing TEXT:EN | Fictional password saved revision 3→4; STRUCTURE review PASS; MANUAL confirmation revision 4→5; both STRUCTURE and TEXT:EN CONFIRMED | SATISFACTORY |
| DV-10 — Confirmation provenance | Separate durable source records for confirmed blocks | Provenance #1 MANUAL TEXT:EN and #2 MANUAL STRUCTURE with retained notes, respective current confirmation links | SATISFACTORY |
| DV-11 — Managed ingest | Disposable BS file produces managed bound asset and usable STANDARD variant | `Default`/`default` variant, Preferred; `BS.png` Managed / Bound / PNG / 1039×1514 / opaque; STANDARD READY ← BS; OVERFRAME INCOMPLETE (BG/OF absent) | SATISFACTORY |
| DV-12 — Open in Carder | Prepared confirmed EN/TRAP + BS opens STANDARD in YGOCARDER | Workspace banner showed STANDARD, EN, revision 5, Save to Workspace; artwork/name/text/password and trap frame rendered. Normal-subtype icon incorrect; see finding F-01 | OPEN SATISFACTORY; FINDING |
| DV-13 — Write-back acknowledgment | Only changed confirmed TEXT:EN moves to DRAFT with explicit acknowledgment; STRUCTURE unaffected | Modified text to `Test trap for Workspace RC validation. Write-back 001.`. UI required acknowledgment for TEXT:EN only. Write-back revision 5→6; authoritative Library reopened: text new, TEXT:EN DRAFT, STRUCTURE CONFIRMED, subtype/password preserved | SATISFACTORY |
| DV-14 — Write-back provenance | New provenance event without destroying prior history | Provenance #3 `CARDER_WRITE_BACK`/TEXT:EN, with #1/#2 still present; #2 remained current confirmation provenance of STRUCTURE | SATISFACTORY |
| DV-15 — Full Backup | Completed backup includes durable persisted state and Assets, Output excluded | FULL `efc311a6-62d7-4a45-991a-01484ef59a7d`, MANUAL, COMPLETE, schema 8; included roots listed as `workspace.json`, `Data/workspace.db`, `Config`, `Assets` (Config also listed as absent source root); excluded Temp, Backups, Output | SATISFACTORY |
| DV-16 — Restore mutation and recovery | A postbackup controlled change is undone by Restore; revision/text/blocks and history recovered | Changed TRAP text to `RESTORE TEST 001.`, revision 6→7; Restore reported completed/READY; refreshed Library returned revision 6, `Write-back 001.`, STRUCTURE CONFIRMED, TEXT:EN DRAFT, `pendulum_text:null`; three provenance events retained | SATISFACTORY |
| DV-17 — Asset recovery and reopen | Managed BS still usable after full Restore | Variant remained Preferred/Bound/Managed, STANDARD READY. After TEXT:EN reconfirm (revision 6→7), Open Standard reopened Carder with recovered BS rendered and original pre-mutation text | SATISFACTORY |
| DV-18 — Dirty editor maintenance guard | Restore is blocked on unsaved Library edits without explicit discard acknowledgment | In TRAP editor revision 7, appended unsaved `— UNSAVED TEST`, Save became enabled. Restore confirmation displayed acknowledgment checkbox and disabled `Restore selected backup` until acknowledged; no second Restore executed | SATISFACTORY FOR GUARD; POST-CANCEL STATE NOT EVIDENCED |

**Interpretation:** SATISFACTORY above denotes observed case evidence only, not a QA-authoritative PASS/FAIL for the RC, RUN or release. No additional eleven-case root-cause matrix was repeated after exact-SHA corrective QA evidence; user explicitly requested a focused reproduction, which was completed.

## 4. Field-level authoritative observations

### Original corrected scenario (MONSTER revision 2)

```json
{
  "kind": "MONSTER",
  "summon_kind": "MAIN_DECK",
  "attribute_code": "DARK",
  "race_code": "AQUA",
  "level": 4,
  "rank": null,
  "atk": 1800,
  "def": 1000,
  "pendulum_scale": null,
  "abilities": ["EFFECT"],
  "link_markers": [],
  "link_rating": null
}
```

EN localization: `name="RC Monster Validation 001"`; `card_text="Test monster for Workspace RC validation."`; `pendulum_text=null`.

### SPELL and TRAP (revisions 2)

SPELL `{"kind":"SPELL","subtype_code":"NORMAL"}` and TRAP `{"kind":"TRAP","subtype_code":"NORMAL"}` were saved and reopened with original localized EN names/texts and `pendulum_text:null`. The incompatible Pendulum text control was not visible in these corrected-SHA forms.

### TRAP write-back progression

- rev 2: initial structure/text DRAFT;
- rev 3: TEXT:EN CONFIRMED, provenance #1 (MANUAL);
- rev 4: fictional password saved, TEXT:EN confirmation preserved;
- rev 5: STRUCTURE CONFIRMED, provenance #2 (MANUAL);
- rev 6: Carder write-back only to TEXT:EN, that block moved to DRAFT, provenance #3 (CARDER_WRITE_BACK); STRUCTURE remains CONFIRMED;
- rev 7: independent postbackup text mutation (`RESTORE TEST 001.`);
- Restore → authoritative rev 6 with prior `Write-back 001.` and the three provenance events;
- reconfirm TEXT:EN → rev 7; asset STANDARD successfully reopened and rendered.

Provenance identifiers/timestamps visible in owner screenshots:
- #1, MANUAL / TEXT:EN: `2026-10-21T10:20:52.854Z`;
- #2, MANUAL / STRUCTURE: `2026-10-21T10:26:20.379Z`;
- #3, CARDER_WRITE_BACK / TEXT:EN: `2026-10-21T18:47:41.882Z`.

For #1 and #2 the entered note was `Owner-local RC validation — TRAP TEXT:EN — SHA 4c9b0228` or `Owner-local RC validation — TRAP STRUCTURE — SHA 4c9b0228` respectively. Post-write-back provenance displayed #2 as current for STRUCTURE; #1 as historical, not current, for TEXT:EN.

## 5. Findings and requests for DESIGN_QA review (no official classification)

### F-01 — Existing source-conversation ID `RC-LOCAL-DEFECT-002` — NORMAL Spell/Trap subtype icon in Carder

**EXPECTED:** A Canonical NORMAL SPELL/TRAP retains `subtype_code:NORMAL`, but a normal Spell/Trap renders **without a subtype icon**, i.e. Carder `subFamily:"NO ICON"`. The separate top-right SPELL/TRAP attribute icon is legitimate and not the reported problem.

**OBSERVED:** A NORMAL TRAP, opened repeatedly and independently from Library, rendered a circular "Normal" icon beside `[TRAP CARD]`, with no manual icon change in the clean re-opening. The substantive original report also requested equivalent treatment for NORMAL SPELL.

**Technical evidence, exact CODE SHA:** `src/service/workspace-bridge/mapping-matrix.ts` has `SPELL_TRAP_SUBTYPE_MAP.NORMAL = 'NORMAL'`; `prepare-working-card.ts` uses that value as Carder `subFamily`; `src/draw/predefined-section/type-ability.ts` draws an icon when `subFamily !== NO_ICON`. Current `RC Trap Validation 001(2).json`, exported after clean reopen and a text-only change, includes `fr:"trap"`, `at:"TRAP"`, `sf:"NORMAL"` and `ta:["Trap Card"]`. This is a grounded mapping/rendering mismatch; QA retains severity/RC-disposition authority.

**Evidence caveat:** An earlier exported `RC Trap Validation 001.json` contained `sf:"NO ICON"`, but the owner was experimenting with UI controls at the time. It does not negate the subsequent independent fresh-open screenshot and JSON. One later `RC Trap Validation 001(1).json` showed `fr:"spell"` and `at:"SPELL"`; the owner clarified that frame change was deliberate while demonstrating to another person; it is NOT claimed as an automatic regression. No source code was modified.

**Requested disposition:** review proper mapping for both NORMAL SPELL and TRAP, test visual subtype and write projection, and classify any required change. Do not silently change Canonical subtype to null to hide the symptom.

### F-02 — Numeric range / text-entry UX for Level and Rank

**EXPECTED / owner request:** Formal, explicit domain limits and client/server consistency. Owner cited desired Level 1–12 and Rank 0–13 as a proposed contract; applicability to exceptional/historical cards requires Scope/QA review, not unilateral enforcement.

**OBSERVED:** Owner displayed Level 18 and −6 in the editable field. They also reported alphabetic/symbol inputs being accepted transiently in the numeric UI. At the exact code SHA, the editor uses numeric inputs without explicit min/max for these fields and server validation checks integer type rather than these limits. An accepted PATCH or authoritative reload of alphabetic/symbol values was **not** demonstrated. Distinguish input working-state permissiveness from domain persistence.

**Previously identified:** `RC-LOCAL-OBS-005` (numeric-control UX). The initial original report describes the same issue as "Level/Rank contract pending". QA to determine severity, limits, compatibility and validation location.

### F-03 — Link Markers numeric codes / layout

**EXPECTED / owner request:** Multi-select eight directional arrows matching the YGOCARDER marker selector, with Link Rating derived from selected directions. Consistent field placement: Link Markers in the position alternately occupied by Level/Rank, and derived Rating in a fitting slot.

**OBSERVED:** For LINK, editor exposes Link Markers and computed Rating, but selectable values remain numeric codes; owner screenshot shows multiple chips `2`, `3`, `8`, `9`. Multiple selection is possible, so "only one marker supported" is NOT a validated defect. The graphical-direction selector and requested layout were not implemented in this candidate.

**Status:** previously requested/differed design improvement; QA and Scope to route explicitly, not treat as implemented simply because applicability controls pass.

### F-04 — Existing `RC-LOCAL-OBS-004` — Library Grid/List

**EXPECTED / owner request:** space-efficient visual card grid with optional Grid/List mode.

**OBSERVED:** Library retains full-width horizontal card entries and substantial unused horizontal space. Screenshots show two/three cards occupying full rows. No Grid/List selector appeared. Earlier QA report explicitly deferred this preexisting visual issue from the corrective SHA. Deferment is NOT completion; retain routing/revisit condition.

### F-05 — Existing `RC-LOCAL-OBS-007` — Obsolete Open in Carder description

**OBSERVED:** Library's Open in Carder section says `Working edits are not saved back to Workspace in RUN 009`. In this candidate a selective, acknowledged `Save to Workspace` was shown and successfully committed revision 5→6. The wording is stale and inconsistent with current capabilities. Source-conversation ID retained; QA classifies.

### F-06 — Existing `RC-LOCAL-OBS-008` — Preferred variant warning is nonspecific

**OBSERVED:** The UI shows `Preferred Variant has unavailable composition` even when `STANDARD READY ← BS`, because `OVERFRAME INCOMPLETE`. It may imply the preferred variant is unusable for Standard when Standard is actually ready. Requested improvement: identify unavailable composition(s) accurately. Presence of incomplete Overframe itself is expected for a BS-only asset, not a functional regression.

### F-07 — Prior provisional `RC-LOCAL-OBS-006` — WITHDRAWN after owner correction

The owner initially reported being unable to edit Confirmation note. After clarifying they had confused the TEXT and STRUCTURE confirmation workflows, the owner entered the note successfully; TEXT:EN and STRUCTURE confirmed and their notes persisted. **No defect is asserted.** Password requirement for confirming non-Token STRUCTURE was correctly enforced; it was optional for Draft. Preserve this resolution so an incorrect unresolved defect is not forwarded.

### F-08 — Initial historical Pendulum applicability observation, corrected-SHA visual result

Before the corrective SHA, Spell/Trap forms exposed Pendulum text even where not applicable (`RC-LOCAL-OBS-001` in earlier conversation). On `4c9b0228...` the observed SPELL/TRAP forms hid that field, and the MONSTER applicability UI displayed a separate Pendulum toggle. No fresh outstanding Spell/Trap Pendulum visibility defect is asserted. Preserve distinction between historical trigger and current successful reproduction.

### F-09 — Scope tracking and release messaging

The source conversation repeatedly questioned why previously requested Level/Rank limits, directional Link controls and Library Grid/List had not been incorporated. The corrective scope specifically focused on null/zero intent, Draft consistency and applicability UX; later UI improvements were deferred. Request explicit traceability to future frozen scope/implementation, with owner approval where applicable. A focused corrective QA PASS is not a product-completeness verdict.

## 6. Evidence inventory and retrieval limits

All items here were observed during the owner-local conversation and recorded by Deployment Validation. **The Pilot 001 permission is to publish only this one Markdown file; screenshot binaries and JSON exports were not added to `meta/project-control`.** This section preserves their source names, identifiers, key values and what they demonstrate. They are conversation attachments, not independently GitHub-hosted artifacts. Should QA require the image bytes or raw JSON, route an evidence-access request through PROJECT_CONTROL; do not fabricate GitHub URLs or expose short-lived asset grants.

| Evidence group | Original provided names / identifiers | Demonstrates |
| --- | --- | --- |
| RC null correction | owner screenshots of MONSTER revision 2, edit and authoritative reopen | `rank:null`, `pendulum_scale:null`, `pendulum_text:null`, Level 4 |
| Numeric/applicability | owner images showing Level 18, Level −6, Link tags 2/3/8/9, MAIN_DECK/LINK/XYZ | range and selector UX observations |
| SPELL persistence | owner screenshots SPELL revision 1→2 | NORMAL, EN localization, null Pendulum |
| TRAP persistence | owner screenshots TRAP revision 1→2 | NORMAL, EN localization, null Pendulum |
| Confirmation text | `image(20261021-101411).png`, `image(20261021-102038).png`, `image(20261021-102103).png`, `image(20261021-102242).png` | TEXT:EN review, confirmed rev 3, provenance #1 |
| Confirmation structure | `image(20261021-102431).png`, `image(20261021-102445).png`, `image(20261021-102517).png`, `image(20261021-102613).png`, `image(20261021-102635).png`, `image(20261021-102734).png` | password, structure review/confirm, provenance #2 |
| Asset ingest | `image(20261021-102919).png`, `image(20261021-103446).png`, `image(20261021-103515).png` | managed BS, Preferred Default, Standard READY |
| Carder open and mapping | `image(20261021-103739).png`, `image(20261021-103758).png`, `image(20261021-183943).png`, `RC Trap Validation 001.json` | original Open in Carder and normal subtype icon |
| Manual frame-change correction | `RC Trap Validation 001(1).json`, `image(20261021-184215).png` | earlier SPELL frame screenshot clarified as manual change, not automatic |
| Clean text-only Carder repro | `RC Trap Validation 001(2).json`, `image(20261021-184527).png`, `image(20261021-184702).png` | clean TRAP/sf NORMAL, text-only edit, write-back acknowledgment |
| Write-back authoritative | `image(20261021-184801).png`, `image(20261021-190618).png` | revision 6, text change, provenance #3 |
| Backup creation | `image(20261021-191037).png`, `image(20261022-053139).png`, `image(20261022-054724).png` | FULL selected/completed; backup UUID |
| Controlled pre-restore mutation | `image(20261022-055546).png` | revision 7, RESTORE TEST 001 |
| Restore confirmation and completion | `image(20261022-060450).png`, `image(20261022-061712).png` | selected exact backup; Restore completed, READY |
| Restore authoritative data | `image(20261022-061920).png`, `image(20261022-062014).png` | revision 6, previous text/provenance restored |
| Restored asset / reconfirmation | `image(20261022-062237).png`, `image(20261022-062439).png`, `image(20261022-062508).png`, `image(20261022-062921).png` | variant READY, re-confirm EN to rev 7, Carder rendering BS |
| Dirty maintenance guard | `image(20261022-064253).png`, `image(20261022-064312).png`, `image(20261022-065127).png` | pending edit detected; Restore blocked without discard acknowledgment |

**Sensitive evidence handling:** Exported Carder JSON contains an `/api/v1/carder/assets/...?...grant=...` URL with a short-lived asset authorization token. This document intentionally records only nonsecret field excerpts (`fr`, `at`, `sf`, `ta`, `ef`) and omits grant tokens. Do not distribute the raw export as public evidence.

## 7. Limitations, not executed and scope boundaries

1. External provider LIVE / YGOResources smoke was not executed during this local correction rehearsal. The optional flag `YU3DOH_ENABLED_EXTERNAL_SOURCES=YGORESOURCES_CARD_DB` was not enabled here.
2. An independent stale Carder session/revision-conflict negative test was not executed in this corrected candidate.
3. There was no proof of server persistence for alphabetic/symbol inputs in Level/Rank; only temporary UI entry and screenshoted numeric out-of-range examples.
4. No independent asset byte-level SHA-256 was recorded after restore; Library binding and actual post-restore Carder rendering provide operational recovery evidence.
5. The dirty-editor Restore confirmation was inspected with the checkbox unchecked and action disabled. No second restore executed; the later cleanup/cancel of unsaved editor content is not shown in the evidence.
6. Browser exact version was not captured. No authoritative terminal PATCH request/response capture was demanded for the focused reproduction; exact-snapshot reopen provided the main local persistence evidence.
7. The attachment screenshot/JSON binaries live in the source conversation only, not in this Markdown-only GitHub commit; names and results are inventoried above.
8. No RUN 024, `main` integration, source fix, additional migrations or cleanup outside the disposable Workspace is authorized by this evidence.

## 8. Request to DESIGN_QA

- Officially **review / classify** F-01 (NORMAL Spell/Trap mapping) and determine whether it requires another candidate before owner release acceptance.
- Classify and route F-02 through F-06 and F-09; reconcile prior explicit deferments, scope approval and revisit conditions, without silently treating those requests as completed.
- Retain F-07 as withdrawn and F-08 as historical/current-fixed-context, without resurrecting those as fresh defects.
- Preserve independently verified satisfactory cases as evidence; require only delta-related or risk-based regression checks if a subsequent SHA changes behavior.
- If raw screenshot/JSON binaries are necessary for QA sign-off, use PROJECT_CONTROL as the evidence-access route.
- Do not ask the owner to repeat the original eleven-case null/zero diagnostic merely because Project Control v1.0 has been introduced.
- Do not infer official RUN/RC PASS or authorize RUN 024, implementation, ref movement or merge from this document.

## 9. Final operational conclusion

```text
ARTIFACT: VAL-RC-LOCAL-001
SOURCE ROLE: DEPLOYMENT_VALIDATION
SOURCE INSTANCE: UNREGISTERED
CODE: feature/workspace-v0.1 @ 4c9b0228bb47ac074c49a977b48dbf0844c33a94
CONTROL PARENT: d0282df9526563c2b64e33cd47d0dc850de7f8ea
ORIGINAL RC CORRECTION: OWNER-LOCAL REPRODUCTION SATISFACTORY
OPERATIONAL CASE EVIDENCE: COLLECTED AS DESCRIBED
UNEXPECTED FINDINGS: DOCUMENTED; OFFICIAL QA CLASSIFICATION PENDING
OVERALL RC/RELEASE ACCEPTANCE: NOT DECLARED
FINAL OPERATIONAL STATUS: EVIDENCE READY
NEXT ROLE: DESIGN_QA — REVIEW / CLASSIFY
BLOCKER ROUTE: PROJECT_CONTROL
```
