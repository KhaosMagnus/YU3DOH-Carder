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

### Pilot 001 / Batch B02 review

Staging reviewed:

`recovery/p6-archival-staging @ b3130d21599bebd54be7d70f9a7a3990033525f6`

Project Control promoted:

`AR-001-010`

as primary RUN 008 correction-return authority with provenance limitation.

New artifact:

`migration/P6_PRIMARY_RECOVERY_RUN_008_CORRECTION.md`

AR-001-011 remains SUPPORTING only.

Recovered RUN 008 history now includes:

```text
1ba9518c...  External QA PARTIAL
      ↓ QA-008-01 correction
e5480062...  Development redelivery / READY FOR EXTERNAL QA
              NOT YET FINAL EXTERNAL QA PASS at that historical point
```

The later final PASS/integration remains reconstructed from downstream authority until primary final records are recovered.

### Remaining Pilot 001 targets

- RUN 005 primary QA/integration
- RUN 008 final External QA PASS
- RUN 008 integration authorization/report

AR-001 remains active.

## Separation

Workspace recovery only.
Serial v0.1 remains out of scope for this campaign.

## Non-authorizations

- staging findings are not authority until promoted;
- no wholesale staging merge;
- main integration: NOT AUTHORIZED;
- RUN 024: NOT AUTHORIZED;
- unrelated product/ref movement: NOT AUTHORIZED.
