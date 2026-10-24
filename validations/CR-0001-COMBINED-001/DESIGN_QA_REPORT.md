---
artifact_id: CR-0001-COMBINED-001-DESIGN-QA
artifact_type: qa_report
status: VALIDATED
protocol_version: "1.0"
source_role: DESIGN_QA
source_instance: DQA-001
target_role: PROJECT_CONTROL
target_instance: PC-001
control_parent_sha: cec62855ef6c27b8a779a73b9608689bb2a7b309
implementation_control_sha: cec62855ef6c27b8a779a73b9608689bb2a7b309
code_baseline:
  branch: feature/workspace-cr-0001-combined
  sha: 64cb5f4ca42348c6c403e64e0d61bdff8c32a281
related_requests:
  - CR-0001.1
  - CR-0001.2
  - CR-0001.5
source_artifacts:
  - control/OWNER_DECISION_CR_0001_COMBINED.md
  - handoffs/CR-0001_COMBINED_CANDIDATE_HANDOFF.md
  - implementations/CR-0001_COMBINED_CANDIDATE_IMPLEMENTATION_REPORT.md
  - validations/P5-CANDIDATE-A-001/DESIGN_QA_FINAL_DISPOSITION.md
  - validations/P5-CANDIDATE-B-001/DESIGN_QA_REPORT.md
supersedes: null
official_result: PARTIAL
---

# EXTERNAL DESIGN + QA REPORT — CR-0001 COMBINED CANDIDATE

## Exact candidate

Branch:

`feature/workspace-cr-0001-combined`

SHA:

`64cb5f4ca42348c6c403e64e0d61bdff8c32a281`

Frozen baseline:

`4c9b0228bb47ac074c49a977b48dbf0844c33a94`

## Official disposition

```text
PARTIAL
```

No implementation defect or regression has been identified.

The combined candidate satisfies the frozen reconciliation contract at source/test level and preserves Candidate B's deterministic exact-SHA browser evidence. Final combined PASS is not issued because the frozen handoff explicitly forbids claiming combined visual PASS solely from Candidate A's independent run. Candidate A's required Carder visual/write-back/copy evidence has not yet been executed against the exact combined SHA.

## Lineage and assembly review

GitHub confirms the combined branch is exactly at:

`64cb5f4ca42348c6c403e64e0d61bdff8c32a281`

and is five commits ahead of the frozen baseline with merge base exactly:

`4c9b0228bb47ac074c49a977b48dbf0844c33a94`.

Assembly order matches the frozen handoff:

1. Candidate A renderer commit;
2. Candidate A copy commit;
3. Candidate B Canonical bounds commit;
4. Candidate B Library bounds commit;
5. Candidate B External Source bounds commit.

No merge commit was introduced.

Protected refs remain unchanged:
- Candidate A = `61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c`;
- Candidate B = `59fb2924b2240f005fb3e9e6d5afbd8aaca39596`;
- `feature/workspace-v0.1` = `4c9b0228bb47ac074c49a977b48dbf0844c33a94`;
- `main` = `54cc3aad246c89a29f2a18be63c539db68cae041`.

## Diff-boundary review

The combined diff contains exactly the expected 18-path A+B union.

Candidate A non-overlap files are byte-identical to validated Candidate A:
- `src/draw/predefined-section/type-ability.ts`;
- `src/library/open-in-carder.tsx`;
- `scripts/test-workspace-bridge.ts`.

Candidate B production, client-test and operational-harness files are byte-identical to validated Candidate B, including:
- `src/library/detail-panel.tsx`;
- `src/library/editor-form.tsx`;
- `src/library/editor-state.ts`;
- `workspace-server/src/canonical/service.ts`;
- `workspace-server/src/canonical/validation.ts`;
- `workspace-server/src/external-sources/structure-result.ts`;
- Candidate B Canonical/confirmation/external tests and browser harness.

The sole overlapping file is:

`workspace-server/test/carder-write-back.test.ts`.

Independent source inspection confirms the combined file retains both complete CR-0001.1 and CR-0001.2 test blocks. No production-code conflict exists.

## Development validation accepted

Development reports all required commands PASS on exact combined SHA:

```text
yarn compile
yarn build
yarn test:sc
yarn test:library
yarn --cwd workspace-server compile
yarn --cwd workspace-server test
```

Reported full server result:

`1088 passed / 0 failed / 0 skipped`.

Focused A+B server result:

`49 passed / 0 failed / 0 skipped`.

The combined browser run using Candidate B's unchanged deterministic harness also passed at exact combined SHA:
- 8 browser case groups PASS;
- 11 intended successful PATCH requests;
- 0 page exceptions;
- 0 provider requests.

That evidence is accepted for the Candidate B portion of the combined contract.

## Candidate B preservation

The combined SHA preserves Candidate B's validated behavior:

- Level = integer 0..12 inclusive or null;
- Rank = integer 0..13 inclusive or null;
- zero distinct from null;
- no silent clamp;
- invalid new STRUCTURE rejected;
- historical out-of-range values readable and preserved;
- unrelated non-STRUCTURE mutation remains compatible;
- Review/Confirm requires current domain;
- Carder enforcement remains atomic;
- External Preview/Apply bounds remain enforced.

The Candidate B production blobs are byte-identical to the validated B candidate and its deterministic browser harness was executed unchanged on the combined SHA.

```text
COMBINED CANDIDATE — CR-0001.2:
SATISFACTORY
ADDITIONAL DEPLOYMENT EVIDENCE FOR B:
NOT REQUIRED
```

## Candidate A preservation — current evidence

The combined SHA retains Candidate A's renderer and Open in Carder files byte-for-byte. Automated combined tests also preserve:
- NORMAL subtype semantic handling;
- no-op and TEXT-only write-back behavior;
- explicit subtype transitions;
- invalid subtype guards;
- renderer predicate matrix.

No source-level regression was found.

However, Candidate A's prior operational PASS was executed at:

`61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c`

not at the combined SHA.

The frozen combined handoff states:

`Do not claim combined visual PASS solely from the independent Candidate A run.`

Development likewise records that its combined browser harness does not establish Candidate A's Carder visual behavior.

Therefore the following combined exact-SHA evidence remains required before final PASS:
- NORMAL SPELL rendering;
- NORMAL TRAP rendering;
- FIELD SPELL subtype icon;
- COUNTER TRAP subtype icon;
- NORMAL SPELL/TRAP text-only Carder write-back;
- corrected Open in Carder visible copy.

## Version invariants

Externally verified on the exact combined SHA:

```text
database schema = 8
Workspace format = 1
migrations = 001–008
migration 009 = absent
normalizer version = 2
candidate schema version = 1
```

No dependency/lockfile or workflow change is part of the combined candidate.

## Acceptance status

### Candidate A contract

| Item | Combined QA state |
| --- | --- |
| AC-A1 NORMAL SPELL | source/test PASS; combined operational evidence pending |
| AC-A2 NORMAL TRAP | source/test PASS; combined operational evidence pending |
| AC-A3 null subtype distinction | PASS |
| AC-A4 non-NORMAL SPELL icons | source/test PASS; representative combined visual evidence pending |
| AC-A5 non-NORMAL TRAP icons | source/test PASS; representative combined visual evidence pending |
| AC-A6 no-op write-back | PASS |
| AC-A7 text-only write-back | source/server PASS; combined operational evidence pending |
| AC-A8 explicit subtype write-back | PASS |
| AC-A9 invalid guards | PASS |
| AC-A10 RC regression preservation | PASS |
| AC-B1 stale copy removed | PASS |
| AC-B2 visible current copy | source PASS; combined running-UI evidence pending |
| AC-B3 copy-only semantics | PASS |

### Candidate B contract

```text
A–J MATRIX:
PASS on exact combined SHA
```

## Defect/regression classification

```text
IMPLEMENTATION DEFECT:
NOT IDENTIFIED

REGRESSION:
NOT IDENTIFIED

EVIDENCE GAP:
YES — BOUNDED COMBINED CANDIDATE A OPERATIONAL/VISUAL GATE
```

## Deployment evidence decision

```text
DEPLOYMENT_VALIDATION:
REQUIRED — BOUNDED
```

Only the six Candidate-A operational cases must be executed on the exact combined SHA.

The previously proven GitHub-hosted Actions substrate may be reused. No new Environment Readiness gate is necessary unless Project Control loses access to that substrate.

Candidate B's Level/Rank operational suite does not need to be repeated.

## Integration authority

```text
COMBINED EXTERNAL QA:
PARTIAL

FEATURE/WORKSPACE-V0.1 INTEGRATION:
NOT AUTHORIZED

MAIN INTEGRATION:
NOT AUTHORIZED

RUN 024:
NOT AUTHORIZED
```

## Recommended route

```text
DESIGN_QA / DQA-001
→ PROJECT_CONTROL / PC-001
→ DEPLOYMENT_VALIDATION
→ DESIGN_QA / DQA-001
```

After exact combined-SHA operational evidence is returned, DQA-001 must issue a superseding final combined disposition.
