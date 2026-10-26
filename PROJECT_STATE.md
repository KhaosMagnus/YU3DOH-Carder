# PROJECT STATE

artifact_id: PROJECT-STATE
artifact_type: project_state
status: ACTIVE
protocol_version: 1.0

## Current code truth

- main = `54cc3aad246c89a29f2a18be63c539db68cae041`
- feature/workspace-v0.1 = `64cb5f4ca42348c6c403e64e0d61bdff8c32a281`
- CR-0001 Combined = INTEGRATED / PASS

## P6

`IN PROGRESS — LINEAGE CONSOLIDATION / FINAL MIGRATION INDEX`

### Archival Recovery Pilot 001

`CLOSED / PARTIAL RECOVERY SUCCESSFUL`

Closure remains:

`migration/P6_ARCHIVAL_PILOT_001_CLOSURE.md`

### Post-closure B05 supplement

Reviewed staging:

`recovery/p6-archival-staging @ 6cc7ed5b708b3cf0e88682246a821fd4883020df`

New control artifact:

`migration/P6_ARCHIVAL_SUPPLEMENT_B05.md`

Disposition:

```text
SUPPORTING     2
CORROBORATING  1
DUPLICATE      1 group
UNRESOLVED     1 provenance variant
PRIMARY        0
```

B05 improves RUN 008 specification/design/Internal-QA lineage and adds downstream RUN 009 baseline corroboration.

It does not recover final primary closure for RUN 005 or RUN 008.

Residual gaps remain frozen as:

`ARCHIVAL GAP — NOT RECOVERED AFTER TARGETED SEARCH`

No active search is reopened.

## Next active P6 phase

`LINEAGE CONSOLIDATION / FINAL MIGRATION INDEX`

Use B01–B05 and existing recovered-authority artifacts to build the final role/document lineage, supersession/duplicate map and closure index.

## Separation

Workspace and Serial v0.1 remain separate historical lineages.

## Non-authorizations

- recovery staging is not authority;
- no wholesale staging merge;
- main integration: NOT AUTHORIZED;
- RUN 024: NOT AUTHORIZED;
- unrelated product/ref movement: NOT AUTHORIZED.
