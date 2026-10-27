---
artifact_id: RUN-024-DQA-001-EXTERNAL-QA-REPORT
artifact_type: external_qa_report
status: PASS
protocol_version: "1.0"
source_role: DESIGN_QA
source_instance: DQA-001
target_role: PROJECT_CONTROL
target_instance: PC-002
control_input_sha: 347481cc098dea58540451cbe35d215ecd2b4b51
candidate_branch: feature/workspace-run-024
candidate_sha: e07140d5a9555a17b7b2306a45625c14adfafc8e
candidate_parent: 219ac252d50ae11b836a93baa20cc7f7d872367f
product_baseline: 64cb5f4ca42348c6c403e64e0d61bdff8c32a281
main_sha: 54cc3aad246c89a29f2a18be63c539db68cae041
development_actions_run: 40346181389
development_actions_job: 121653587088
evidence_artifact_id: 12662135618
evidence_artifact_digest: sha256:18365d2ca307762d2e65a1c38f62e2ee4bffde16701aee76f0e2a4378250ba5e
official_result: PASS
---

# RUN 024 — DQA-001 External QA Report

## 1. Official result

```text
RUN 024 EXTERNAL QA:
PASS

CR-0001.3 / F-03:
PASS

CR-0001.6 / F-06:
PASS

COMBINED REGRESSION:
PASS

CANDIDATE:
feature/workspace-run-024
e07140d5a9555a17b7b2306a45625c14adfafc8e

INTEGRATION:
NOT PERFORMED / NOT AUTHORIZED

TRANCHE 2:
NOT STARTED / NOT AUTHORIZED
```

DQA-001 independently inspected the exact candidate diff, the frozen Design + QA contract, the Development report, the exact GitHub Actions execution and the preserved evidence artifact. No blocking contract failure, regression, architecture deviation or unresolved evidence delta was found.

## 2. Authority and intake

Consumed control input:

`meta/project-control @ 347481cc098dea58540451cbe35d215ecd2b4b51`

Primary QA request:

`validations/RUN-024/DQA-001_EXTERNAL_QA_REQUEST.md`

Frozen contract:

`handoffs/POST_P6_TRANCHE_1_IMPLEMENTATION_HANDOFF.md`

Exact candidate:

`feature/workspace-run-024 @ e07140d5a9555a17b7b2306a45625c14adfafc8e`

The input control SHA was still the exact head of `meta/project-control` immediately before publication of this report.

No product code, product branch, integration baseline, main ref, migration or Tranche 2 work was modified by DQA-001.

## 3. Exact-SHA custody

Independent GitHub checks established:

| Check | Result |
| --- | --- |
| `feature/workspace-run-024` | exact `e07140d5a9555a17b7b2306a45625c14adfafc8e` |
| candidate parent comparison | exactly 1 commit over `219ac252d50ae11b836a93baa20cc7f7d872367f` |
| candidate merge base with parent | exact parent |
| `feature/workspace-v0.1` | unchanged at `64cb5f4ca42348c6c403e64e0d61bdff8c32a281` |
| `main` | unchanged at `54cc3aad246c89a29f2a18be63c539db68cae041` |
| post-validation product commit | none |
| Development custody preflight/final | clean and identical |

The candidate changes exactly nine paths:

1. `scripts/test-library-client.ts`
2. `scripts/test-library-tranche-one.ts`
3. `src/library/detail-panel.tsx`
4. `src/library/editor-form.tsx`
5. `src/library/library.scss`
6. `src/library/link-marker-selector.tsx`
7. `src/library/link-marker-state.ts`
8. `src/library/open-in-carder.tsx`
9. `src/library/preferred-variant-warning.ts`

The Development custody harness independently asserted an empty protected diff for `workspace-server`, root manifests/locks, `src/service/workspace-bridge`, shared Carder Link Marker code and implementation-history paths. Root and Workspace Service manifest/lock hashes were unchanged before/after execution.

Architecture invariants therefore remain:

```text
database schema = 8
Workspace format = 1
migrations = 001–008
migration 009 = absent
new API = none
new persistence = none
Carder protocol change = none
```

Result: **PASS**.

## 4. Independent candidate diff assessment

### F-03 implementation

The candidate introduces a Workspace-local controlled Link Marker selector.

`link-marker-state.ts` defines only the frozen canonical markers:

`1,2,3,4,6,7,8,9`

with exact 3×3 positions and directions. Code `5` is absent. The toggle helper rejects invalid aliases/codes and restores the exact authoritative order when an edit is undone.

`link-marker-selector.tsx` uses a `fieldset` / `legend` labeled `Link Markers`, eight native `button type="button"` controls, direction+code accessible names and `aria-pressed`. The center is an inert `aria-hidden` span.

`editor-form.tsx` replaces only the applicable numeric Link Marker multi-select. Link Rating remains disabled and derived from current marker count. No writable `link_rating` input was introduced.

`detail-panel.tsx` supplies the authoritative marker array only to support exact undo/not-dirty restoration.

`library.scss` scopes the 3×3 layout, selected state and visible `:focus-visible` outline to the Workspace Library component.

No server/domain/mapping change was introduced.

### F-06 implementation

`preferred-variant-warning.ts` is a pure presentation helper. It returns exactly W1/W2/W3 copy and returns no warning for W4.

`open-in-carder.tsx` renders the warning only when the currently selected variant is the exact Preferred Variant. Existing selection, preference, readiness, language gate, dirty gate, opening gate, prepare request and launch intent remain unchanged.

The existing `defaultCarderVariant` behavior remains authoritative: a missing Preferred identity does not fall back; no Preferred with exactly one variant retains the sole-variant convenience; multiple variants remain unselected.

Result: **PASS**.

## 5. F-03 acceptance matrix

| Criterion | Independent QA disposition | Evidence |
| --- | --- | --- |
| F03-AC-01 layout | PASS | code table + T1-OP-01 DOM/computed grid + screenshot show 1/2/3, 4/center/6, 7/8/9 |
| F03-AC-02 center invalid | PASS | no code-5 control; center inert; keyboard order skips it; existing code-5 rejection regression passes |
| F03-AC-03 multi-select | PASS | all 256 marker subsets exercised deterministically; browser multi-marker state confirmed |
| F03-AC-04 exact canonical codes | PASS | fixed eight-code table; invalid 5/CENTER/aliases are no-op |
| F03-AC-05 hydration | PASS | T1-OP-01 opens saved [1,4,9], rating 3, Save disabled; deterministic hydration test preserves order |
| F03-AC-06 pointer toggle | PASS | T1-OP-02 adds/removes only marker 2 |
| F03-AC-07 keyboard toggle | PASS | T1-OP-03 Space removes and Enter restores focused marker; `aria-pressed` changes |
| F03-AC-08 focus order | PASS | keyboard-only traversal proves 1,2,3,4,6,7,8,9; center skipped; visible outline; focus retained |
| F03-AC-09 derived rating | PASS | browser rating 3→4→3 and 0 on empty LINK; disabled field; no client `link_rating` |
| F03-AC-10 dirty semantics | PASS | marker edit dirties STRUCTURE only; exact undo restores not-dirty; navigation/focus causes no write |
| F03-AC-11 confirmed Structure | PASS | T1-OP-05 Cancel causes no persistence; explicit Move to Draft and Save uses existing flow |
| F03-AC-12 LINK→non-LINK | PASS | T1-OP-04 clearing proposal includes `link_markers`; Cancel preserves; Apply clears [] and hides picker |
| F03-AC-13 non-LINK→LINK | PASS | T1-OP-04 existing Level/DEF/PENDULUM/Scale clearing flow preserved; no marker invented |
| F03-AC-14 applicability | PASS | selector rendered only under current LINK applicability; hidden after concrete non-LINK adoption |
| F03-AC-15 validation | PASS | server production unchanged; full 1088-test service suite passes existing Link/confirmation validation |
| F03-AC-16 Carder mapping | PASS | bridge/shared Carder code unchanged; RC client mapping checks and code-5 rejection pass |

**F-03 result: PASS.**

## 6. F-06 acceptance matrix

| Criterion | Independent QA disposition | Evidence |
| --- | --- | --- |
| F06-AC-01 W1 | PASS, qualified evidence | exact W1 copy + Standard disabled / Overframe enabled in actual candidate UI using explicitly synthetic response-boundary DTO; Preferred identity preserved |
| F06-AC-02 W2 | PASS | real service fixture; exact W2 copy; Standard enabled / Overframe disabled |
| F06-AC-03 W3 | PASS | real service fixture; exact W3 copy; both disabled |
| F06-AC-04 W4 | PASS | real service fixture; no availability warning; both enabled subject to orthogonal gates |
| F06-AC-05 button readiness | PASS | all four matrix branches show composition-specific state; W1 qualified as below |
| F06-AC-06 no mutation/recompute | PASS | warning helper is presentation-only; browser write count unchanged; no readiness/service code changed |
| F06-AC-07 incomplete Preferred retained | PASS | T1-OP-07 retains Preferred despite READY alternate |
| F06-AC-08 manual alternate | PASS | alternate selection changes UI only; service variants response remains deep-equal; readiness follows alternate |
| F06-AC-09 no Preferred + multiple | PASS | no default variant; explicit-selection information remains |
| F06-AC-10 no Preferred + sole | PASS | sole variant convenience retained; service Preferred remains null |
| F06-AC-11 missing Preferred | PASS | unchanged `defaultCarderVariant` + deterministic checks prove no fallback |
| F06-AC-12 prepare/launch | PASS | actual prepare request uses manually selected alternate variant ID and `STANDARD`; Carder launch/render completes |

**F-06 result: PASS.**

## 7. F06-W1 evidence qualification

Frozen W1 is:

```text
STANDARD = INCOMPLETE
OVERFRAME = READY
```

Development correctly did **not** claim this as a naturally produced service state. Under the unchanged current readiness model, the asset combinations that make OVERFRAME READY also make STANDARD READY.

DQA-001 inspected the operational harness. For W1 it:

1. requests the real variants DTO from the unchanged Service;
2. preserves the original DTO separately;
3. changes only the selected Preferred Variant's browser-facing `standard` readiness to `INCOMPLETE`;
4. fulfills that single variants response to the actual candidate Library UI;
5. verifies selected Preferred identity, exact W1 warning, Standard disabled and Overframe enabled;
6. captures DOM, ARIA, state and screenshot evidence;
7. removes the route afterward.

The pure warning helper is additionally covered deterministically for all four readiness pairs. The other three matrix states are exercised with real service-produced fixtures, proving the normal service→UI wiring.

### DQA-001 sufficiency decision

**The W1 evidence is sufficient for the frozen F-06 UI contract.**

Reason:

- F-06 is explicitly client/UI presentation and consumption of existing readiness state.
- Service readiness semantics are frozen and were not authorized to change.
- The unreachable W1 combination therefore does not create a missing service-domain behavior that RUN 024 must implement.
- The response-boundary injection exercises the exact production candidate UI code at the narrowest boundary necessary to enter the otherwise unreachable UI branch.
- Exact copy, selected identity and both composition gates are observed in the real UI.
- No claim is made that the unchanged service can naturally emit W1.

Accordingly, DQA-001 does **not** classify W1 as real service E2E evidence, but also does **not** require Deployment Validation merely to manufacture an architecture-invalid service state.

No remaining W1 acceptance delta exists.

## 8. T1 operational evidence review

| Case | QA result | Key independently inspected evidence |
| --- | --- | --- |
| T1-OP-01 | PASS | saved [1,4,9], rating 3, exact grid, initial not-dirty, screenshot/DOM/ARIA/state |
| T1-OP-02 | PASS | pointer adds marker 2 only, rating +1, dirty; undo exact; no pre-Save write |
| T1-OP-03 | PASS | keyboard-only row-major Tab order; center skipped; Space/Enter; `aria-pressed`; visible focus; focus retained |
| T1-OP-04 | PASS | outgoing/incoming applicability clearing, Cancel/Apply behavior, no persistence before Save |
| T1-OP-05 | PASS | confirmed-Structure dialog, Cancel no mutation, real PATCH, no `link_rating`, server-derived rating 4 |
| T1-OP-06 | PASS | three real service matrix states + separately labeled synthetic W1 UI-boundary state |
| T1-OP-07 | PASS | no-Preferred cases, incomplete Preferred retention, manual alternate no persistence, actual selected-variant prepare + Carder render |

All required T1-OP cases are present and materially auditable.

## 9. Automated and regression evidence

Actions run `40346181389`, job `121653587088`, concluded success.

DQA-001 independently inspected the job steps and logs rather than accepting the Development table alone.

Required commands:

| Command | Result |
| --- | --- |
| frozen root install | PASS |
| frozen Workspace Service install | PASS |
| `yarn compile` | PASS |
| `yarn build` | PASS |
| `yarn test:sc` | PASS |
| `yarn test:library` | PASS |
| `yarn --cwd workspace-server compile` | PASS |
| `yarn --cwd workspace-server test` | PASS |

Focused F03/F06 deterministic suite:

`11,546 assertions PASS`

Workspace Service:

`1088 / 1088 PASS / 0 FAIL`

Existing regression evidence also includes:

- RC client 32 checks PASS, including code 5 rejection and unchanged marker mapping;
- Workspace bridge 72 checks PASS;
- CR-0001.2 Level/Rank validation/no-clamp regression checks PASS;
- unchanged full Workspace Service suite covering Canonical confirmation/applicability, readiness, variant lifecycle, asset behavior and bridge semantics.

No combined-regression failure was observed.

**Combined regression result: PASS.**

## 10. Evidence artifact integrity

GitHub Actions artifact:

`12662135618`

Name:

`dev006-readiness-40346181389-e07140d5a9555a17b7b2306a45625c14adfafc8e`

GitHub digest:

`sha256:18365d2ca307762d2e65a1c38f62e2ee4bffde16701aee76f0e2a4378250ba5e`

DQA-001 independently downloaded the archive. The locally computed ZIP SHA-256 matched the GitHub digest exactly, and every entry listed by `manifest.sha256` verified successfully.

The archive contains custody, environment, command results/logs, browser cases, network captures, Canonical before/after, DOM, ARIA, state and screenshots.

Result: **evidence integrity PASS**.

## 11. Findings and limitations

### Blocking defects

None.

### Regressions

None detected.

### Scope deviations

None detected.

### Evidence gaps requiring Deployment Validation

None.

### Qualified limitation — W1

W1 is **not** real service end-to-end evidence. It is accepted only as sufficient response-boundary evidence for the frozen UI contract, for the reasons recorded in Section 7.

### Informational environment limitation

The deterministic browser evidence ran on Chromium 145 / Playwright 1.58.2 / Ubuntu 24.04.5 / Node 24.19.0 / Yarn 1.22.22 using the exact candidate source served by Vite. The production build was separately proven by `yarn build`; a production-bundle browser pass and Windows/cross-browser pass were not part of the frozen RUN 024 acceptance contract and are not treated as missing acceptance evidence.

## 12. Final disposition

```text
OFFICIAL EXTERNAL QA RESULT:
PASS

EXACT CANDIDATE:
feature/workspace-run-024
e07140d5a9555a17b7b2306a45625c14adfafc8e

F-03:
PASS

F-06:
PASS

W1:
UI CONTRACT PROVEN WITH EXPLICITLY QUALIFIED SYNTHETIC RESPONSE-BOUNDARY EVIDENCE
NOT CLAIMED AS REAL SERVICE E2E

COMBINED REGRESSION:
PASS

ARCHITECTURE INVARIANTS:
PRESERVED

SCOPE DEVIATION:
NONE

DEPLOYMENT VALIDATION REQUIRED FOR RUN 024 ACCEPTANCE:
NO

READY TO RETURN TO PROJECT_CONTROL:
YES

INTEGRATION:
NOT AUTHORIZED BY THIS REPORT

TRANCHE 2:
NOT AUTHORIZED BY THIS REPORT
```

Return:

`DESIGN_QA / DQA-001 → PROJECT_CONTROL / PC-002`
