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

`IN PROGRESS — TARGETED ARCHIVAL RECOVERY`

### Pilot 001 / Batch B03 review

Staging reviewed:

`recovery/p6-archival-staging @ d6be14a95cd78b7a34837290e8a23d0e0ac3ebb3`

Project Control disposition:

```text
AR-001-012  CORROBORATING
AR-001-013  CORROBORATING
AR-001-014  DUPLICATE
PRIMARY PROMOTIONS: NONE
```

Review artifact:

`migration/P6_ARCHIVAL_REVIEW_B03.md`

B03 reinforces:

- RUN 005 exact integrated checkpoint via RUN 006 baseline;
- RUN 008 exact integrated checkpoint via downstream RUN 009 QA baseline.

It does not replace missing original External QA or integration records.

### Remaining Pilot 001 targets

- RUN 005 primary QA/correction/integration sequence
- RUN 008 final corrected External QA PASS
- RUN 008 administrative integration authorization/report

AR-001 remains active for B04.

## Separation

Workspace recovery only.
Serial v0.1 remains out of scope for this campaign.

## Non-authorizations

- corroborating evidence is not primary authority;
- no wholesale staging merge;
- main integration: NOT AUTHORIZED;
- RUN 024: NOT AUTHORIZED;
- unrelated product/ref movement: NOT AUTHORIZED.
