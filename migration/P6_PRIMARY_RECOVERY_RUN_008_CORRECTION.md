---
artifact_id: P6-PRIMARY-RECOVERY-RUN-008-CORRECTION
artifact_type: archival_recovery
status: FROZEN
protocol_version: "1.0"
source_role: PROJECT_CONTROL
source_instance: PC-001
control_parent_sha: fd6a7e66341bb936c3b1cc188767b8b0669fb800
staging_reviewed_sha: b3130d21599bebd54be7d70f9a7a3990033525f6
source_batch: B02
supplements:
  - migration/P6_RECOVERED_AUTHORITY_001_008.md
---

# P6 — Primary archival recovery: RUN 008 correction return

## Project Control disposition

`PROMOTED WITH PROVENANCE LIMITATION`

Project Control independently reviewed:

- AR-001-010 — proposed PRIMARY correction handoff;
- AR-001-011 — SUPPORTING Development correction redelivery.

Staging reviewed:

`recovery/p6-archival-staging @ b3130d21599bebd54be7d70f9a7a3990033525f6`

The staging branch was not merged into Project Control.

## Historical RUN

`IMPLEMENTATION RUN 008 — Variant / Asset Management + Diagnostics UI`

Baseline:

`45d85b6cfd4a28f1b4f241f540159fac076f3978`

Rejected candidate:

`1ba9518c402cb5005632b8fc364c20d508f2dc03`

Final correction redelivery checkpoint:

`e54800629e46f8fccd653b0bef637dd71e9b97a3`

## Recovered primary correction decision

Recovered handoff text identifies the External QA result on candidate:

`PARTIAL`

Rejected SHA:

`1ba9518c402cb5005632b8fc364c20d508f2dc03`

Baseline remains:

`45d85b6cfd4a28f1b4f241f540159fac076f3978`

The handoff requires correction of QA-008-01 and explicitly states:

`No integration before a new External QA PASS.`

Therefore the historical authority recovered by this artifact is limited to:

```text
1ba9518c...  PARTIAL / RETURN FOR CORRECTION
             QA-008-01
             NOT AUTHORIZED FOR INTEGRATION
```

This artifact does NOT recover the later final External QA PASS.

## Supporting Development redelivery

Recovered Development report returns:

`READY FOR EXTERNAL QA`

at final SHA:

`e54800629e46f8fccd653b0bef637dd71e9b97a3`

The report explicitly states:

- Internal QA only;
- Internal QA does not close the RUN;
- no official External QA PASS is claimed;
- integration status: `NOT INTEGRATED`;
- `feature/workspace-v0.1` remained at `45d85b6c...` at redelivery time.

Therefore AR-001-011 remains:

`SUPPORTING`

and is not promoted to acceptance authority.

## Independent GitHub corroboration

Project Control verified:

Rejected → final correction redelivery:

- status: `ahead`
- ahead_by: `5`
- behind_by: `0`
- merge-base: exact rejected SHA `1ba9518c402cb5005632b8fc364c20d508f2dc03`

Functional validation SHA:

`4a14bec39b5142462557b36d3c0ba708b86bdd32`

Final correction checkpoint:

`e54800629e46f8fccd653b0bef637dd71e9b97a3`

Functional → final:

- ahead_by: `1`
- behind_by: `0`
- only changed path: removal of `.github/workflows/run008-qa-correction-validation.yml`

GitHub Actions:

- run: `37595782096`
- workflow: `RUN 008 External QA correction validation`
- head SHA: `4a14bec39b5142462557b36d3c0ba708b86bdd32`
- conclusion: `success`

This corroborates the correction lineage only. It does not establish final External QA acceptance.

## Source provenance

Batch:

`B02`

Primary source:

`DEVELOPMENT HANDOFF — RUN 008.md`

SHA-256 of supplied source copy:

`29475bd2ff5cb60bd0a523b9366fdfe305b6c143c81a905590eeb6c0fa3a3c6f`

Supporting source:

`IMPLEMENTATION_REPORT_RUN_008_EXTERNAL_QA_CORRECTION(1).md`

SHA-256:

`39f722754934d078d06e316380f61cc36197b9ecac4602c9fcee6d9a54652bfa`

The supplied artifacts do not preserve authenticated original sender metadata or original message timestamps.

Role attribution for the handoff is based on its content and decision language, not its filename alone.

## Provenance limitation

Classification:

`PRIMARY CORRECTION DECISION TEXT RECOVERED FROM OWNER-SUPPLIED HISTORICAL ARTIFACT — ORIGINAL SENDER/TIMESTAMP METADATA UNAVAILABLE`

This is sufficient to establish the historical PARTIAL/correction decision because:

1. the document directly states External QA PARTIAL;
2. it identifies the rejected exact SHA and baseline;
3. it specifies the correction gate and prohibits integration;
4. GitHub confirms the exact rejected→corrected lineage;
5. the Development redelivery independently preserves the same correction context while explicitly withholding final PASS.

## Current historical authority for RUN 008

Recovered now:

- rejected exact SHA;
- External QA PARTIAL;
- QA-008-01 correction handoff;
- corrected Development redelivery lineage.

Still not recovered as primary authority:

- full original initial External QA report, if distinct from the correction handoff;
- final corrected External QA PASS;
- administrative integration authorization;
- administrative integration report.

Current final RUN 008 checkpoint remains:

`e54800629e46f8fccd653b0bef637dd71e9b97a3`

Its later accepted/integrated status remains established by the existing frozen reconstruction through the RUN 009 authorized baseline until stronger primary final evidence is recovered.

Do not infer final PASS from this artifact.
