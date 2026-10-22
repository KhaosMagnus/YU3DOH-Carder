---
artifact_id: P5-CANDIDATE-B-001-DESIGN-QA
artifact_type: qa_report
status: VALIDATED
protocol_version: "1.0"
source_role: DESIGN_QA
source_instance: DQA-001
target_role: PROJECT_CONTROL
control_parent_sha: 8e5bb659bb510ae0189bf3730b0e78967f71fc42
gate_control_sha: fe9c16a1def8a4be69929c20bbc5bb350f5bfa7f
implementation_control_sha: 2331376eae8de28244b39f54544ba37d2eb61d94
scope_authority_control_sha: 9ea55675b3b1cfef6d4a3ad801892467f1fd470f
code_baseline:
  branch: feature/workspace-cr-0001-2-level-rank-domain
  sha: 59fb2924b2240f005fb3e9e6d5afbd8aaca39596
related_requests:
  - CR-0001.2
source_artifacts:
  - scopes/SCOPE-CR-0001-2-F02-LEVEL-RANK-DOMAIN.md
  - handoffs/CR-0001.2_LEVEL_RANK_DOMAIN_HANDOFF.md
  - implementations/CR-0001.2_LEVEL_RANK_IMPLEMENTATION_REPORT.md
supersedes: null
created_at: "2026-10-22T18:07:00Z"
approved_at: "2026-10-22T18:07:00Z"
official_result: PASS
---

# EXTERNAL DESIGN + QA REPORT — P5 CANDIDATE B
## CR-0001.2 / F-02 — Level / Rank Domain Contract

**EXACT CANDIDATE SHA:**  
`59fb2924b2240f005fb3e9e6d5afbd8aaca39596`

**CANDIDATE BRANCH:**  
`feature/workspace-cr-0001-2-level-rank-domain`

**SCOPE AUTHORITY:**  
`scopes/SCOPE-CR-0001-2-F02-LEVEL-RANK-DOMAIN.md`

**FROZEN HANDOFF:**  
`handoffs/CR-0001.2_LEVEL_RANK_DOMAIN_HANDOFF.md`

**IMPLEMENTATION REPORT:**  
`implementations/CR-0001.2_LEVEL_RANK_IMPLEMENTATION_REPORT.md`

## 1. Official disposition

```text
PASS
```

Candidate B satisfies the frozen Scope decision and complete Design + QA A–J acceptance
matrix at exact SHA
`59fb2924b2240f005fb3e9e6d5afbd8aaca39596`.

No defect, regression, scope expansion, schema drift, migration drift, normalizer-version
drift, candidate-schema drift or Carder protocol redesign was identified.

The deterministic Linux/Chromium evidence supplied by Development is accepted as sufficient
operational evidence under the frozen handoff. Additional Deployment Validation is not
required for this candidate.

```text
DEPLOYMENT_VALIDATION:
NOT REQUIRED

REGRESSION:
NOT IDENTIFIED
```

## 2. Exact lineage and bounded footprint

Verified GitHub lineage:

```text
4c9b0228bb47ac074c49a977b48dbf0844c33a94
  ↓
ac8fd02a08b8d70dece5734a027452d82e27d8fe
  ↓
89f5d9e51d9c2cc0796c395fa64ec87044351074
  ↓
59fb2924b2240f005fb3e9e6d5afbd8aaca39596
```

Commit subjects:

- `ac8fd02a08b8d70dece5734a027452d82e27d8fe` —
  `fix(canonical): enforce Level and Rank domain bounds`
- `89f5d9e51d9c2cc0796c395fa64ec87044351074` —
  `fix(library): enforce Level and Rank editor bounds`
- `59fb2924b2240f005fb3e9e6d5afbd8aaca39596` —
  `fix(external): enforce Level and Rank acceptance bounds`

Comparison against the frozen baseline is linear: ahead by 3, behind by 0, with merge base
exactly
`4c9b0228bb47ac074c49a977b48dbf0844c33a94`.

Production changes are confined to the six authorized files:

- `workspace-server/src/canonical/validation.ts`
- `workspace-server/src/canonical/service.ts`
- `workspace-server/src/external-sources/structure-result.ts`
- `src/library/editor-state.ts`
- `src/library/editor-form.tsx`
- `src/library/detail-panel.tsx`

All other changed files are bounded tests/evidence scripts authorized by the handoff.

No Candidate A renderer/copy production file changed.

## 3. Canonical server contract review

The implementation adds a reusable current-domain validator:

`assertLevelRankDomain()`

Its exact contract is:

```text
Level:
null OR integer 0..12

Rank:
null OR integer 0..13
```

Zero is tested as and remains an explicit numeric value; it is not coerced to null.

### New STRUCTURE mutations

`assertMutationShape()` applies `assertLevelRankDomain()` whenever a new
`mutation.structure` is submitted.

Therefore out-of-range values are rejected before persistence using the existing
`DOMAIN_VALIDATION` family.

### Historical compatibility

The implementation deliberately separates:
- persisted-block validity; from
- current Review/Confirm domain validity.

`assertConfirmedBlocksValid()` uses the persisted historical invariant path without
retroactively applying the new range.

Therefore an old confirmed card containing Level 18, Level -6 or Rank 14 remains readable
and can receive unrelated non-STRUCTURE changes without being silently normalized or
rejected solely because of that historical number.

### Password / STRUCTURE intent

A password-only mutation is treated as STRUCTURE-impacting under the frozen contract.
When no new structure accompanies that password change, the service validates the
currently persisted Level/Rank and rejects the mutation until the invalid historical
STRUCTURE is repaired.

### Review / Confirm

`assertBlockForConfirmation()` applies the current Level/Rank domain when the block is
STRUCTURE.

Thus historical invalid data may remain stored but cannot receive a new current
STRUCTURE confirmation until repaired.

This is the compatibility split required by Scope.

## 4. Client contract review

The Library editor implements:

```text
Level:
min=0
max=12
step=1

Rank:
min=0
max=13
step=1
```

Level bounds also apply to TOKEN.

Working values are not clamped.

The client:
- preserves an exact hydrated historical value;
- maps blank to null;
- preserves explicit 0;
- marks invalid Level/Rank input with visible validation;
- blocks Save locally when STRUCTURE or password intent would preserve an invalid value;
- allows unrelated TEXT / CLASSIFICATION / RELATIONS changes when STRUCTURE/password are
  not dirty;
- omits unchanged STRUCTURE from those unrelated PATCH requests.

The exact historical numeric value therefore remains visible until explicitly repaired.

## 5. Carder write-back review

No Carder production protocol or write-back production file changed.

The authoritative Canonical boundary enforces the current domain.

Regression tests prove:
- Level 0 and 12 accepted where applicable;
- Rank 0 and 13 accepted for XYZ;
- invalid Level/Rank requests return 422 `DOMAIN_VALIDATION`;
- invalid requests do not partially mutate or advance revision;
- historical Level 18 plus TEXT-only Carder write-back preserves exact STRUCTURE;
- historical Level 18 → 12 is an accepted repair;
- historical Level 18 → 19 is rejected.

Existing acknowledgement and confirmation-state behavior remains unchanged.

## 6. External Source review

The implementation leaves the generic non-negative numeric helper intact and introduces
field-specific acceptance validators:

```text
Level:
safe non-negative integer <= 12

Rank:
safe non-negative integer <= 13
```

These are used by complete STRUCTURE coherence and result construction.

Consequently:
- valid boundary candidates remain eligible;
- out-of-range Level/Rank yields `STRUCTURE_VALUE_INVALID`;
- Preview is INELIGIBLE;
- Apply rejects before Canonical persistence;
- stored source evidence remains unchanged.

No normalizer or candidate schema production code changed.

## 7. A–J acceptance matrix

| Matrix | QA result | Reviewed evidence |
|---|---|---|
| **A — MONSTER Level** | **PASS** | MAIN_DECK/RITUAL/FUSION/SYNCHRO null, 0 and 12 accepted; negative, 13, 18 and non-integer rejected atomically; HTTP boundary returns 422. |
| **B — TOKEN Level** | **PASS** | null, 0 and 12 accepted; negative/13 rejected; client uses same Level bounds. |
| **C — XYZ Rank** | **PASS** | null Draft, 0 and 13 accepted; negative/14 rejected; non-XYZ applicability rules remain separate. |
| **D — null / zero** | **PASS** | Direct, client, persistence/reopen evidence preserves null and zero distinctly. |
| **E — historical compatibility** | **PASS** | Directly seeded Level 18, Level -6 and Rank 14 remain exact across read/reload and unrelated TEXT, CLASSIFICATION, RELATIONS and provenance mutations; password/new STRUCTURE rejected until repair. |
| **F — Review / Confirm** | **PASS** | Boundary values Review/Confirm; legacy invalid Review FAIL; direct Confirm bypass 422; already-confirmed legacy survives unrelated mutation; repair allows Review. |
| **G — Library client** | **PASS** | Bounds/step, zero/null, exact historical hydration, visible invalid state, no clamp, no PATCH on invalid STRUCTURE/password, TEXT-only PATCH omits structure. |
| **H — Carder write-back** | **PASS** | Boundary acceptance, out-of-range 422 atomic rejection, legacy TEXT-only compatibility and valid repair proven. |
| **I — External Source STRUCTURE** | **PASS** | Level/Rank boundaries, invalid Preview/Apply rejection, immutable source evidence, normalizer 2 and candidate schema 1 proven. |
| **J — persistence/version invariants** | **PASS** | schema 8, Workspace format 1, migrations 001–008 only, no 009, normalizer 2, candidate schema 1, no dependency/lock/workflow/protocol drift. |

## 8. Deterministic operational evidence review

Development supplied a dedicated exact-SHA operational harness:

- `scripts/cr-0001-2-operational-qa.cjs`
- `scripts/cr-0001-2-qa-fixture.cjs`
- `scripts/cr-0001-2-ui-evidence.cjs`
- `scripts/cr-0001-2-immutability.cjs`

External Design + QA reviewed these scripts rather than accepting their labels at face
value.

### Why the evidence is accepted

The operational harness:
- creates a disposable Workspace;
- refuses to reuse an unrelated service already on port 4312;
- derives and exposes the actual local `git rev-parse HEAD`;
- makes the browser assert that the fixture SHA equals that HEAD;
- runs the real Library UI under Chromium;
- observes DOM state;
- captures actual PATCH requests;
- asserts that invalid Save attempts produce **zero PATCH requests**;
- rereads persisted Canonical data after valid saves;
- tests Review against the service API;
- tests External STRUCTURE Preview against stored candidate fixtures;
- blocks live provider access and proves zero provider requests;
- records page errors;
- writes screenshots and machine-readable evidence.

The fixture creates historical invalid data directly in SQLite only to model pre-contract
persisted state. New values are otherwise exercised through current application/service
paths.

This is not a circular test that merely calls the same client validator and labels the
result PASS.

Development reports:
- all required compile/build/test gates PASS;
- 1072 server tests PASS with no failed or skipped tests;
- 33 focused CR-0001.2 automated cases PASS;
- 8 deterministic browser case groups PASS;
- zero browser page errors;
- zero live/provider requests.

The frozen handoff explicitly states that independent owner-manual testing is not required
when browser evidence is deterministic and captured by Development or Deployment
Validation. The reviewed harness and reported exact-SHA output satisfy that condition.

Therefore a second Deployment Validation run would be duplicative rather than necessary.

## 9. Version / immutability verification

External QA independently verified from GitHub at the exact candidate:

```text
SUPPORTED_DATABASE_SCHEMA_VERSION = 8
SUPPORTED_WORKSPACE_FORMAT_VERSION = 1
NORMALIZER_VERSION = 2
candidate_schema_version = 1
```

Exactly eight migrations are present:

```text
001_repository_foundation.sql
002_canonical_domain.sql
003_art_variants_asset_index.sql
004_managed_asset_ingest.sql
005_asset_resolution_overrides.sql
006_variant_lifecycle.sql
007_external_source_ingestion.sql
008_standard_structural_registry_baseline.sql
```

Their blob SHAs are unchanged from the frozen baseline.

No migration 009 exists.

## 10. Evidence limitations

The deterministic browser execution reported by Development is Linux/Chromium only.

No separate GitHub Actions workflow is associated with this exact candidate SHA.

These are recorded limitations, not failures:
- the frozen contract did not require a multi-browser or Windows UI matrix;
- all persistence/domain behavior is additionally covered by server tests;
- the browser evidence is reproducible and exact-SHA pinned;
- no unresolved acceptance item depends on a platform-specific behavior identified in this
  delta.

No additional Deployment Validation is required.

## 11. Recommended route

```text
PROJECT_CONTROL
```

Candidate B has an official External QA PASS.

This gate does **not** authorize:
- integration with Candidate A;
- integration to `feature/workspace-v0.1`;
- integration to `main`;
- RUN 024.

Project Control must retain Candidate B as an independently validated candidate and decide
later routing only after respecting Candidate A's independent disposition.

## 12. Gate summary

```text
CANDIDATE B:
59fb2924b2240f005fb3e9e6d5afbd8aaca39596

CR-0001.2:
PASS

A–J MATRIX:
PASS

DEPLOYMENT VALIDATION REQUIRED:
NO

SCHEMA:
8

MIGRATIONS:
001–008

MIGRATION 009:
ABSENT

NORMALIZER:
2

CANDIDATE SCHEMA:
1

REGRESSION:
NOT IDENTIFIED

INTEGRATION AUTHORIZED:
NO

RUN 024:
NOT AUTHORIZED
```
