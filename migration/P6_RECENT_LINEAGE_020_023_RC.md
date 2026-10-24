---
artifact_id: P6-RECENT-LINEAGE-020-023-RC
artifact_type: migration_inventory
status: FROZEN
protocol_version: "1.0"
source_role: PROJECT_CONTROL
source_instance: PC-001
control_parent_sha: 9c15cd0139ac4b60facaf3509d1e9e521f8804e1
---

# P6 — Recent Workspace lineage: RUN 020 → RUN 023 → RC

This artifact reconstructs verified Git code lineage only. It does not decide historical QA authority by itself.

## Verified chain

RUN 019 checkpoint:
`e83de9793c26f78834f748b320161a168943d4ed`

RUN 020 current branch ancestry:
1. `89b0c97c3eded7ca6333a7de0660721678897905` — persist YGOResources source snapshots/read-only candidate diffs
2. `3502c42297c62dafa3e84988b431601741a72b5f` — preserve subtype ambiguity
3. `6caa1204df52aaa7dc811d50dfe5b22cb834555d` — Windows fixture cleanup test fix
4. `33a5c07b5ad1ee7b6c777e733dd99f5f7a82b6f2` — normalize evidence locales/JSONPaths/Link observations
5. `318e310f3a7f475de00bc427b6654192d615486d` — preserve unresolved provider properties

Current RUN 020 branch head:
`318e310f3a7f475de00bc427b6654192d615486d`

Important historical distinction:
`33a5c07b...` is the direct parent of current RUN 020 HEAD and was referenced in prior project history as a corrective checkpoint. P6 must not equate current branch HEAD with historical final QA authority until the historical QA artifact is recovered.

RUN 021:
`ec838d9ea0626d52e133937fb790150575ab623e`
parent = RUN 020 current head
commit = `feat(external-sources): accept selected stored TEXT claims through Canonical authority`

RUN 022:
`4b0aa0d6afdbd07d155844d38b2832ea0acfa201`
parent = RUN 021
commit = `feat(external-sources): seed structural registries and normalize properties with v2`

RUN 023:
`c929a6020760525d5cf6daf695b2f44c1d3cd1ca`
parent = RUN 022
commit = `feat(external-sources): accept complete persisted structures with read-only previews`

RC:
`4c9b0228bb47ac074c49a977b48dbf0844c33a94`
parent = RUN 023
commit = `fix(canonical): preserve null intent and enforce Draft applicability`

## Verified present-day ancestry

```text
e83de979... RUN 019
  ↓
89b0c97c...
  ↓
3502c422...
  ↓
6caa1204...
  ↓
33a5c07b...
  ↓
318e310f... RUN 020 current head
  ↓
ec838d9e... RUN 021
  ↓
4b0aa0d6... RUN 022
  ↓
c929a602... RUN 023
  ↓
4c9b0228... RC / feature/workspace-v0.1
```

## Classification

`SUPPORTING / VERIFIED CODE-LINEAGE EVIDENCE`

Still required before historical authority is frozen:
- RUN 020 official QA/correction artifact;
- RUN 021–023 implementation/QA reports;
- exact integration reports into `feature/workspace-v0.1`.
