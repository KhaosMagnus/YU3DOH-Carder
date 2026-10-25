# PROJECT STATE

artifact_id: PROJECT-STATE
artifact_type: project_state
status: ACTIVE
protocol_version: 1.0

## Current code truth

- main = `54cc3aad246c89a29f2a18be63c539db68cae041`
- feature/workspace-v0.1 = `64cb5f4ca42348c6c403e64e0d61bdff8c32a281`
- CR-0001 Combined = INTEGRATED / PASS

## P6 — Historical Documentation Migration

`IN PROGRESS — TARGETED ARCHIVAL RECOVERY`

Authority reconstruction by RUN is complete.

### Pilot 001 / Batch B01 review

Staging reviewed:

`recovery/p6-archival-staging @ 6b175a4beed870971554aac44d271ff47cf5b11e`

Project Control promoted RUN 004 primary decision text with provenance limitation.

New authority artifact:

`migration/P6_PRIMARY_RECOVERY_RUN_004.md`

Recovered RUN 004 sequence:

```text
fa592117...  External QA PARTIAL / SUPERSEDED
      ↓ correction
81c20eb1...  External QA PASS
      ↓ authorized direct fast-forward
feature/workspace-v0.1 @ 81c20eb1...
```

Administrative integration report also recovered.

Source limitation:

Owner-supplied QA chat copy lacks machine-verifiable speaker identity/timestamps and original chat title. Exact-SHA sequence is GitHub-corroborated; provenance limitation remains recorded.

### Pilot 001 remaining targets

- RUN 005 primary QA/integration evidence
- RUN 008 primary final QA/integration evidence

AR-001 remains active for additional source batches.

## Historical-lineage separation

Workspace recovery and Serial v0.1 recovery remain separate.

Current campaign:
Workspace only.

## Non-authorizations

- staging findings are not authority until promoted;
- staging must not be merged wholesale into meta/project-control;
- main integration: NOT AUTHORIZED;
- RUN 024: NOT AUTHORIZED;
- unrelated product/ref movement: NOT AUTHORIZED.
