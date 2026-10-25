---
artifact_id: P6-PRIMARY-RECOVERY-RUN-004
artifact_type: archival_recovery
status: FROZEN
protocol_version: "1.0"
source_role: PROJECT_CONTROL
source_instance: PC-001
control_parent_sha: 58165a1b00fbe6efc4664ca8aabb593a3821e6e5
staging_reviewed_sha: 6b175a4beed870971554aac44d271ff47cf5b11e
source_batch: B01
supplements:
  - migration/P6_RECOVERED_AUTHORITY_001_008.md
---

# P6 — Primary archival recovery: RUN 004

## Project Control disposition

`PROMOTED WITH PROVENANCE LIMITATION`

Project Control independently reviewed:

- AR-001-001
- AR-001-002
- AR-001-003
- AR-001-004
- AR-001-005

from non-authoritative staging:

`recovery/p6-archival-staging @ 6b175a4beed870971554aac44d271ff47cf5b11e`

The staging branch was not merged into Project Control.

This artifact records the accepted historical decision sequence for RUN 004 while preserving the provenance limitations of the supplied chat export.

## Historical RUN

`IMPLEMENTATION RUN 004 — Art Variants + Read-Only Asset Indexer`

Baseline:

`017c904c22c7842fa1209e3e39885453dda1e63a`

Final accepted checkpoint:

`81c20eb1477e1a0151b6e590d1e31390d82c6de4`

Database schema:

`3`

## Recovered authoritative sequence

### 1. Original External QA disposition

Target:

`fa592117ccf4408a1a8e8552acafeae3b8e04d17`

Recovered decision text:

`PARTIAL — RETURN TO DEVELOPMENT`

Acceptance summary:

`43 PASS / 1 FAIL`

Blocking finding:

`QA-004-01 — corrupt/unsupported compressed BMP payload could pass image validation and participate in binding/readiness`

Historical disposition of this SHA:

`REJECTED / SUPERSEDED`

It must not be relabeled PASS.

### 2. Correction handoff

The same rejected SHA was returned to Development for localized image-validation correction.

The handoff explicitly required:

- continue the existing RUN 004 branch;
- no reset/rebase/recreate;
- validate supported image encodings;
- exclude invalid/unsupported payloads from binding/readiness;
- targeted regressions;
- Windows validation;
- no integration before Design + QA revalidation.

### 3. Final External QA disposition

Revalidation target:

`81c20eb1477e1a0151b6e590d1e31390d82c6de4`

Prior rejected SHA:

`fa592117ccf4408a1a8e8552acafeae3b8e04d17`

Recovered decision text:

`PASS`

`44 / 44 PASS`

`RUN 004 is formally accepted.`

QA-004-01 was resolved.

### 4. Administrative integration authorization

Recovered handoff authorized direct fast-forward:

```text
feature/workspace-v0.1

017c904c22c7842fa1209e3e39885453dda1e63a
        ↓ fast-forward
81c20eb1477e1a0151b6e590d1e31390d82c6de4
```

with remote-ref and ancestry verification.

Restrictions included:

- no additional content changes;
- no merge commit;
- no squash;
- no rebase;
- no force-push;
- main unchanged.

### 5. Administrative integration report

Recovered returned report states:

`RUN 004 CERRADO E INCORPORADO MEDIANTE FAST-FORWARD`

Reported final refs:

`feature/workspace-v0.1 = 81c20eb1477e1a0151b6e590d1e31390d82c6de4`

`feature/workspace-run-004 = 81c20eb1477e1a0151b6e590d1e31390d82c6de4`

`main = 54cc3aad246c89a29f2a18be63c539db68cae041`

Reported operation:

- direct ref fast-forward;
- prior SHA verification;
- no administrative merge commit;
- no squash;
- no rebase;
- no force-push;
- no files changed during integration;
- no administrative commit.

## Independent GitHub corroboration

Project Control verified:

Baseline → rejected candidate:

- status: `ahead`
- ahead_by: `6`
- behind_by: `0`
- merge-base: exact baseline `017c904c...`

Rejected → accepted:

- status: `ahead`
- ahead_by: `3`
- behind_by: `0`
- merge-base: exact rejected SHA `fa592117...`

Accepted commit:

`81c20eb1477e1a0151b6e590d1e31390d82c6de4`

message:

`chore(validation): finalize RUN 004 QA correction validation`

GitHub Actions corroboration:

- run: `37528830695`
- workflow: `RUN 004 QA correction validation`
- head SHA: `39134cbc5f87f296d9cb03482ffe93cc2a96e0cb`
- conclusion: `success`

This corroborates the correction/validation lineage. Git topology alone does not independently prove the historical ref-update transaction; that transaction is recovered from the historical administrative report.

## Source provenance

Primary source batch:

`B01 — QA-OLD-01 + Owner attachments`

Staging source manifest:

`recovery/workspace/sources/B01_SOURCE_MANIFEST.json`

at exact staging commit:

`6b175a4beed870971554aac44d271ff47cf5b11e`

Relevant source:

`QA_OLD_01_CHAT_PART_002.md`

SHA-256 of supplied source copy:

`b75ca7e386799c538a61b7bdf50c744926d313462ea28a263fd8a1834fc5aaec`

Selected source ranges used by AR-001 include:

- lines 5906–6364 — original QA PARTIAL;
- lines 6366–6597 — correction handoff;
- lines 7542–7995 — final QA PASS;
- lines 7998–8131 — integration authorization;
- lines 8132–8220+ — returned integration report.

## Provenance limitation

The supplied historical chat copy does not preserve machine-verifiable speaker identity or message timestamps, and the source descriptor did not provide the original chat title.

Therefore Project Control classifies the recovered sequence as:

`PRIMARY DECISION TEXT RECOVERED FROM OWNER-SUPPLIED QA CONVERSATION COPY — ROLE ATTRIBUTION CONSISTENT BUT ORIGINAL SPEAKER METADATA UNAVAILABLE`

This limitation affects provenance quality, not the exact-SHA decision sequence, which is internally coherent and GitHub-corroborated.

If a future original standalone role artifact or richer export is recovered, it may strengthen provenance but must not silently overwrite this artifact.

## Final authority

RUN 004:

`CLOSED / PASS / INTEGRATED`

Final accepted/integrated SHA:

`81c20eb1477e1a0151b6e590d1e31390d82c6de4`

Previous rejected candidate:

`fa592117ccf4408a1a8e8552acafeae3b8e04d17 — PARTIAL / SUPERSEDED`

Historical integration method:

`DIRECT FAST-FORWARD`

Primary QA and administrative decision text:

`RECOVERED`

Original standalone role artifacts / speaker metadata:

`STILL DESIRABLE FOR PROVENANCE, NOT REQUIRED TO ESTABLISH THE DECISION SEQUENCE`
