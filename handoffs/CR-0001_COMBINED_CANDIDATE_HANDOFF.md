---
artifact_id: CR-0001-COMBINED-CANDIDATE-HANDOFF
artifact_type: implementation_handoff
status: FROZEN
protocol_version: "1.0"
source_role: PROJECT_CONTROL
source_instance: PC-001
target_role: DEVELOPMENT
target_instance: DEV-003
control_parent_sha: 36c8f9b012153e7221d81452a98aa03e481fb908
owner_authority: control/OWNER_DECISION_CR_0001_COMBINED.md
---

# Implementation Handoff — CR-0001 Combined Candidate A+B

## Mission

Create one exact combined candidate containing the already validated behavior of Candidate A and Candidate B, with no scope expansion.

This is reconciliation/integration preparation, not a new product feature.

## Frozen inputs

### Baseline

`feature/workspace-v0.1 @ 4c9b0228bb47ac074c49a977b48dbf0844c33a94`

### Candidate A

Branch:
`fix/workspace-rc-normal-subtype-icon`

Exact SHA:
`61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c`

Commits from baseline:
1. `fab10c237514916d367f4646feda2cd24274b7f6` — F-01 renderer correction
2. `61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c` — F-05 copy-only correction

Official QA:
`PASS`

### Candidate B

Branch:
`feature/workspace-cr-0001-2-level-rank-domain`

Exact SHA:
`59fb2924b2240f005fb3e9e6d5afbd8aaca39596`

Commits from baseline:
1. `ac8fd02a08b8d70dece5734a027452d82e27d8fe` — Canonical Level/Rank bounds
2. `89f5d9e51d9c2cc0796c395fa64ec87044351074` — Library Level/Rank bounds
3. `59fb2924b2240f005fb3e9e6d5afbd8aaca39596` — External Source Level/Rank bounds

Official QA:
`PASS`

## Expected branch

Create only after verifying it is absent:

`feature/workspace-cr-0001-combined`

Branch from exact baseline:

`4c9b0228bb47ac074c49a977b48dbf0844c33a94`

Do not branch from mutable `feature/workspace-v0.1` without first proving it still equals that SHA.

## Deterministic assembly order

Preferred/reproducible order:

1. incorporate Candidate A commit `fab10c237...`;
2. incorporate Candidate A commit `61503c6...`;
3. incorporate Candidate B commit `ac8fd02...`;
4. incorporate Candidate B commit `89f5d9e...`;
5. incorporate Candidate B commit `59fb292...`.

Use normal Git three-way semantics.

Do not squash away origin traceability.

Record the resulting commit SHAs if cherry-pick recreates B commits.

## Known overlap

The only changed-file overlap identified by Project Control is:

`workspace-server/test/carder-write-back.test.ts`

If this file conflicts:
- preserve the full Candidate A test intent;
- preserve the full Candidate B test intent;
- resolve to the union of both validated test coverages;
- add no unrelated assertions;
- document the conflict and exact resolution in the Implementation Report.

A reconciliation commit is permitted only when necessary.

Any unexpected conflict in production code or another file:
`IMPLEMENTATION BLOCKED`
and return to Project Control before making a semantic choice.

## Required combined behavior

The final combined tree must preserve all validated Candidate A behavior:

- NORMAL Spell renders without circular NORMAL subtype icon;
- NORMAL Trap renders without circular NORMAL subtype icon;
- supported non-NORMAL Spell/Trap subtype icons remain;
- Canonical NORMAL semantics remain intact;
- Carder text-only write-back preserves NORMAL structure;
- corrected Open in Carder copy remains.

The final combined tree must preserve all validated Candidate B behavior:

- Level = integer 0..12 inclusive or null;
- Rank = integer 0..13 inclusive or null;
- 0 remains distinct from null;
- no silent clamp;
- invalid new STRUCTURE rejected;
- historical out-of-range values remain readable/preserved;
- unrelated non-STRUCTURE mutation remains compatible with legacy invalid structure;
- Review/Confirm requires current domain;
- Carder write-back server enforcement remains atomic;
- External Source Preview/Apply bounds remain enforced.

## Version invariants

Must remain:

- database schema = 8;
- Workspace format = 1;
- migrations = 001–008;
- migration 009 absent;
- normalizer version = 2;
- candidate schema version = 1.

No dependency or lockfile changes are authorized unless a pre-existing candidate already changed them; neither validated candidate did.

## Combined diff boundary

The final production diff relative to baseline must be the semantic union of Candidate A + Candidate B only.

Known union includes:

Candidate A:
- `src/draw/predefined-section/type-ability.ts`
- `src/library/open-in-carder.tsx`

Candidate B:
- `src/library/detail-panel.tsx`
- `src/library/editor-form.tsx`
- `src/library/editor-state.ts`
- `workspace-server/src/canonical/service.ts`
- `workspace-server/src/canonical/validation.ts`
- `workspace-server/src/external-sources/structure-result.ts`

Validation/test/script files from both candidates may coexist.

No unrelated refactor, formatting sweep or cleanup.

## Required validation

At exact final combined SHA run at minimum:

```text
yarn compile
yarn build
yarn test:sc
yarn test:library
yarn --cwd workspace-server compile
yarn --cwd workspace-server test
```

Also run/preserve focused coverage proving:
- Candidate A NORMAL Spell/Trap renderer and write-back assertions remain;
- Candidate B Level/Rank Canonical, Library, Carder and External Source assertions remain;
- the reconciled `carder-write-back.test.ts` includes both sets of coverage.

If the existing Candidate B browser/operational harness can execute unchanged on the combined tree, run it and record the result.

Do not claim combined visual PASS solely from the independent Candidate A run.

External DQA decides whether new Deployment evidence is needed after Development return.

## Immutability/hygiene

Verify and report:
- `main` unchanged;
- `feature/workspace-v0.1` unchanged;
- Candidate A unchanged;
- Candidate B unchanged;
- no RUN 024 branch;
- no migration 009;
- no Candidate A/B source branch rewrites.

## Required Development output

Publish a role-owned Implementation Report under:

`implementations/CR-0001_COMBINED_CANDIDATE_IMPLEMENTATION_REPORT.md`

It must include:
- exact input SHAs;
- exact assembly order;
- conflict/reconciliation record;
- final combined SHA;
- changed files;
- validation commands/results;
- version invariants;
- ref hygiene proof;
- remaining limitations.

Final Development status must be exactly:

`READY FOR EXTERNAL QA`

or

`IMPLEMENTATION BLOCKED`

Do not integrate the combined candidate into `feature/workspace-v0.1`.
