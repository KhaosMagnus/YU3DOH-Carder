---
artifact_id: SCOPE-CR-0001-2-F02
artifact_type: scope_decision
status: FROZEN
protocol_version: "1.0"
source_role: SCOPE_ARCHITECTURE
source_instance: UNREGISTERED
target_role: DESIGN_QA
control_parent_sha: 461522f47a9fc5dcdb63f01b8b000b6fb1a27b90
code_baseline:
  branch: feature/workspace-v0.1
  sha: 4c9b0228bb47ac074c49a977b48dbf0844c33a94
related_requests:
  - CR-0001.2
supersedes: null
created_at: "2026-10-22T09:14:00Z"
approved_at: "2026-10-22T09:14:00Z"
---

# SCOPE DECISION — CR-0001.2 / F-02
## Canonical Level / Rank Numeric Domain Contract

## 1. Authority and boundary

This artifact resolves only:

`CR-0001.2 / F-02 — Level/Rank range contract and transient input UX`.

It does not authorize implementation, RUN 024, a new migration, a new schema version, or main integration.

It does not reactivate CR-0001.3 or CR-0001.4.

GitHub code baseline:

`feature/workspace-v0.1 @ 4c9b0228bb47ac074c49a977b48dbf0844c33a94`.

Control parent:

`meta/project-control @ 461522f47a9fc5dcdb63f01b8b000b6fb1a27b90`.

## 2. Evidence

### 2.1 Current implementation

At the code baseline:

- Canonical Level and Rank are nullable numeric fields.
- Canonical validation requires integer-ness when present but has no explicit range.
- Draft coherence already distinguishes Level/Rank applicability by summon kind.
- The ordinary Library editor uses numeric controls without an explicit Level/Rank domain limit.
- SQLite migration 002 stores Level/Rank as INTEGER without range CHECK constraints.
- External STRUCTURE normalization accepts safe integers and later applies structural applicability rules.

Therefore Level 18 and Level -6 can currently reach durable Canonical state if they otherwise satisfy the existing structural shape/applicability rules.

### 2.2 Yu-Gi-Oh! printed-card domain

The supported Canonical fields represent the card's printed/displayed structural Level or Rank, not a transient in-duel Level/Rank after card effects modify it.

Domain evidence establishes:

- printed TCG/OCG Level values currently span 0 through 12;
- printed Level 0 exists on exceptional official cards such as `Ultimaya Tzolkin`;
- Rank 0 is visibly printed on official Xyz cards such as `Number F0: Utopic Future`, even though card conditions may treat their original Rank differently;
- Rank 13 exists on official Xyz cards;
- negative printed Levels are not part of the TCG/OCG card domain.

The previously discussed `Level 1–12 / Rank 0–13` proposal is therefore rejected because Level 0 must remain representable.

Reference material used for this product-domain decision:
- Yugipedia, “Level” — TCG/OCG printed Level 0–12; cites Konami Perfect Rulebook 2015 p. 48.
- Yugipedia, “Rank” — current printed/original Rank domain up to 13 and documented Rank-0 presentation exceptions; cites Konami Perfect Rulebook 2015 p. 48.
- Yugipedia, “Number F0: Utopic Future” — printed Rank 0 example.
- Yugipedia, “Ultimaya Tzolkin” — printed Level 0 example.

These external references define game-domain evidence only. GitHub remains authoritative for the implemented YU3DOH state.

## 3. Frozen Canonical numeric domain

### 3.1 Level

Permitted persisted Canonical Level:

```text
integer
0 <= level <= 12
```

This applies to every Canonical structure that owns a Level field under the existing model, including MONSTER and TOKEN structures when Level is applicable/present.

### 3.2 Rank

Permitted persisted Canonical Rank:

```text
integer
0 <= rank <= 13
```

Rank remains applicable only according to the already-frozen MONSTER/XYZ structural rules.

### 3.3 Zero

Zero is a valid explicit Canonical value for both fields:

```text
level = 0
rank = 0
```

Zero is never equivalent to absence.

```text
0 != null
```

No `0 → null` coercion is permitted.

### 3.4 Null

`null` retains its existing meaning:

- value absent while Draft is incomplete; or
- value structurally non-applicable under the existing summon-kind contract.

This decision does not alter the already-frozen Level-vs-Rank-vs-Link applicability rules.

## 4. Exceptional, historical and custom values

### 4.1 Official printed zero values

Official cards printed with Level 0 or Rank 0 are valid first-class Canonical data.

Their effect/condition text may state that an original Level/Rank is treated as another number. That rule remains card-text/gameplay semantics and does not replace the printed structural value stored in `level` or `rank`.

Therefore no special override or alternate structural field is introduced by CR-0001.2.

### 4.2 Rank 13

Rank 13 is valid Canonical Rank.

### 4.3 Values outside the frozen domain

For Workspace v0.1, these are invalid Canonical structural values:

```text
level < 0
level > 12
rank < 0
rank > 13
```

This includes custom/fan-created cards. YU3DOH Workspace v0.1 does not persist extended custom Level/Rank ranges outside the frozen TCG/OCG printed-card domain.

A future official card or explicit owner requirement outside these bounds requires a new Scope/domain decision. Bounds must not widen automatically from provider input.

## 5. Draft contract

Freeze:

```text
DRAFT MAY BE INCOMPLETE
BUT
A NON-NULL LEVEL/RANK IN DRAFT MUST ALREADY BE WITHIN THE CANONICAL DOMAIN.
```

Therefore:

Valid Draft examples:

```text
level = null
level = 0
level = 12

rank = null
rank = 0
rank = 13
```

Invalid Draft examples:

```text
level = -6
level = 13
level = 18

rank = -1
rank = 14
```

Draft status is not authority to persist semantically out-of-domain numbers.

This range validation is independent from completeness. A Draft may omit an applicable value with `null`; it may not substitute an invalid number.

## 6. Server-side persistence enforcement

The Workspace Service / Canonical domain is authoritative.

Every new Canonical STRUCTURE submission that contains non-null Level or Rank must enforce the frozen range before durable persistence.

This includes all existing controlled write paths that can submit Canonical structure, including ordinary Library editing, Carder selective write-back, and External Source STRUCTURE acceptance.

Expected rejection semantics remain within the existing Canonical validation boundary:

```text
HTTP 422
DOMAIN_VALIDATION
```

The error must identify the invalid field and permitted range.

No new persistence error family is required.

No provider, client, or adapter is allowed to widen the Canonical domain.

Where an existing read-only Preview claims that a candidate/result is structurally eligible, Design + QA must ensure an out-of-range Level/Rank is surfaced before an Apply can claim eligibility.

## 7. Temporary editor-input UX

Temporary editor input is not Canonical persisted state.

The ordinary editor may maintain a transient local editing state while the user is typing, including an incomplete or temporarily out-of-range numeric entry, provided it is clearly treated as invalid local input and never silently committed.

Frozen user-intent behavior:

```text
blank
→ null

explicit 0
→ 0

valid Level entry
→ integer 0..12

valid Rank entry
→ integer 0..13
```

Client controls must expose the correct bounds:

```text
Level: min 0, max 12, integer step
Rank:  min 0, max 13, integer step
```

Exact component mechanics belong to Design + QA, but the product behavior is frozen:

- spinner/keyboard affordances must respect the bounds;
- direct typed input outside the bounds may be temporarily visible while editing but must be marked invalid;
- Save/submit must not send an out-of-range value as valid Canonical structure;
- do not silently clamp `18 → 12`, `-6 → 0`, `14 → 13`, or any other invalid input;
- clearing a field yields `null`;
- alphabetic/symbol transient editor states are never valid Canonical Level/Rank values.

## 8. Historical persisted compatibility

No migration or automatic cleanup is authorized.

Existing cards that already contain out-of-range Level/Rank values must:

- remain readable;
- display the exact stored value rather than being clamped or normalized;
- remain identifiable as legacy/out-of-domain when edited or reviewed;
- not be silently rewritten on startup, load, rescan, migration, or unrelated mutation.

Compatibility rule:

```text
legacy out-of-range persisted value
+ no STRUCTURE submission
→ may remain stored/readable

new STRUCTURE submission
→ must satisfy Level/Rank domain
```

Therefore an unrelated mutation that does not submit STRUCTURE must not be rejected solely because an old stored STRUCTURE contains a legacy out-of-range Level/Rank.

If the user edits/submits STRUCTURE, the legacy invalid field must be repaired into the frozen domain or `null` where existing applicability rules permit null.

Existing confirmation state is not silently demoted or rewritten by this decision. However, a new STRUCTURE Review/Confirm/reconfirmation may not newly validate an out-of-range value.

Exact compatibility mechanics belong to Design + QA and must preserve this outcome without new durable compatibility state unless Scope is explicitly reopened.

## 9. Migration / schema policy

Frozen decision:

```text
database schema:
8 → 8

migration 009:
FORBIDDEN FOR CR-0001.2

Workspace format:
1
```

Rationale:

- the existing schema can represent the frozen values;
- the Canonical domain service is already the controlled write authority;
- a database CHECK migration would conflict with the required ability to read historical out-of-range records;
- no new durable state is required.

Existing migrations 001–008 remain immutable.

If Design + QA concludes a new migration, new persisted compatibility flag, or schema change is required, it must STOP and return to Scope rather than inventing one.

## 10. External Source compatibility

External source evidence is not authority to bypass this Canonical domain.

A persisted candidate may retain source evidence exactly as received, but Canonical acceptance must not persist:

```text
level < 0 or level > 12
rank < 0 or rank > 13
```

Official source records using valid Level 0, Rank 0, Level 12 or Rank 13 remain supported.

No normalizer version change is authorized by this Scope decision unless Design + QA demonstrates it is technically necessary to represent the frozen product behavior. Such a requirement must return to Scope before implementation.

## 11. Carder compatibility

Carder remains an editor/renderer downstream of the Canonical domain.

Carder must not be allowed to persist a Level/Rank outside the frozen Canonical range through selective write-back.

No Carder protocol redesign is authorized.

Rendering/working-state behavior outside persistence enforcement is a Design + QA implementation-detail question so long as invalid values cannot become new Canonical durable state.

## 12. Acceptance-level outcomes for Design + QA

Design + QA must derive technical acceptance criteria covering at minimum:

1. Level `0` persists when Level is applicable.
2. Level `12` persists.
3. Level `-1` is rejected.
4. Level `13` is rejected.
5. Level `18` is rejected.
6. Rank `0` persists for XYZ.
7. Rank `13` persists for XYZ.
8. Rank `-1` is rejected.
9. Rank `14` is rejected.
10. `null` remains distinct from zero.
11. clearing an editor field produces `null`.
12. client Level bounds communicate 0–12.
13. client Rank bounds communicate 0–13.
14. invalid transient typed values are not silently clamped and cannot be submitted as valid.
15. historical out-of-range values remain readable and byte/value-preserved until explicitly repaired.
16. unrelated non-STRUCTURE mutation is not blocked solely by a historical out-of-range value.
17. new STRUCTURE submission cannot preserve an out-of-range legacy value.
18. Review/Confirm cannot newly validate out-of-range Level/Rank.
19. External Source cannot persist an out-of-range Level/Rank.
20. Carder write-back cannot persist an out-of-range Level/Rank.
21. existing Level/Rank applicability and null/zero regressions remain PASS.
22. schema remains 8; migrations remain 001–008.
23. no migration 009.
24. CR-0001.3 and CR-0001.4 remain untouched.

## 13. Disposition

```text
CR-0001.2 / F-02:
SCOPE FROZEN

PERMITTED LEVEL:
0..12 inclusive

PERMITTED RANK:
0..13 inclusive

ZERO:
VALID FOR LEVEL AND RANK

NULL:
DISTINCT FROM ZERO
RETAINS INCOMPLETE / NON-APPLICABLE SEMANTICS

OUT-OF-RANGE NEW PERSISTENCE:
FORBIDDEN

HISTORICAL OUT-OF-RANGE DATA:
READABLE / NOT AUTO-MIGRATED / MUST BE REPAIRED ON STRUCTURE RESUBMISSION

SERVER ENFORCEMENT:
REQUIRED

CLIENT BOUNDS:
REQUIRED

SILENT CLAMPING:
FORBIDDEN

DATABASE SCHEMA:
8 → 8

MIGRATION 009:
FORBIDDEN

RUN 024:
NOT AUTHORIZED

CR-0001.3:
NOT REACTIVATED

CR-0001.4:
NOT REACTIVATED

READY FOR DESIGN + QA:
YES
```

## 14. Next gate

Target role:

`DESIGN_QA`

Expected next action:

Convert this frozen product/domain contract into a bounded technical design and acceptance contract.

No implementation is authorized by this artifact.
