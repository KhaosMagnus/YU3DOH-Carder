# Workspace Archival Recovery Index

status: RECOVERY READY FOR PROJECT CONTROL REVIEW / NON-AUTHORITATIVE
campaign: P6 ARCHIVAL RECOVERY PILOT 001
worker: ARCHIVAL_RECOVERY / AR-001
control_sha_consumed: `58165a1b00fbe6efc4664ca8aabb593a3821e6e5`
staging_parent: `c49ad51c2948481daa6cdc5f7da0142608fc47a3`
date: 2026-10-25 (America/Mexico_City)
targets: RUN 004, RUN 005, RUN 008

## Source batches

| Batch | Source | Apparent role | Observed coverage | Files | Processing status |
|---|---|---|---|---:|---|
| B01 | QA-OLD-01 + Owner attachments | Design + QA conversation containing pasted Development reports; attribution inferred | RUN 001–004; explicit jump to RUN 012–013. Separate reports RUN 001, 003, 006, 007. Actual chat title unknown. | 10 | All inventoried and searched; target decision blocks examined; unrelated historical sections not normalized |

Exact original filenames, source IDs, Library file IDs, byte counts, line counts and SHA-256 digests: [source manifest](sources/B01_SOURCE_MANIFEST.json). Source descriptor is a template, not proof of completeness. The mission file is routing, not historical QA evidence.

## Recovery items

| Item ID | RUN | Claim | Exact SHA(s) | Source role | Evidence class | Proposed action | Candidate |
|---|---|---|---|---|---|---|---|
| AR-001-001 | RUN 004 | Original External QA PARTIAL | `fa592117ccf4408a1a8e8552acafeae3b8e04d17`; baseline `017c904c22c7842fa1209e3e39885453dda1e63a` | Design + QA (inferred from report and surrounding first-person QA text) | PRIMARY | PROMOTE PRIMARY EVIDENCE; preserve rejected candidate as SUPERSEDED by AR-001-003 | [AR-001-001](candidates/AR-001-001.md) |
| AR-001-002 | RUN 004 | Correction handoff | `fa592117ccf4408a1a8e8552acafeae3b8e04d17`; baseline `017c904c22c7842fa1209e3e39885453dda1e63a` | Design + QA (inferred from handoff context) | PRIMARY | PROMOTE PRIMARY EVIDENCE | [AR-001-002](candidates/AR-001-002.md) |
| AR-001-003 | RUN 004 | Final External QA PASS | accepted `81c20eb1477e1a0151b6e590d1e31390d82c6de4`; prior rejected `fa592117ccf4408a1a8e8552acafeae3b8e04d17`; baseline `017c904c22c7842fa1209e3e39885453dda1e63a` | Design + QA (inferred from report and surrounding audit narrative) | PRIMARY | PROMOTE PRIMARY EVIDENCE | [AR-001-003](candidates/AR-001-003.md) |
| AR-001-004 | RUN 004 | Administrative integration authorization | from `017c904c22c7842fa1209e3e39885453dda1e63a` to `81c20eb1477e1a0151b6e590d1e31390d82c6de4` | Design + QA (inferred from administrative handoff context) | PRIMARY | PROMOTE PRIMARY EVIDENCE | [AR-001-004](candidates/AR-001-004.md) |
| AR-001-005 | RUN 004 | Administrative integration report | from `017c904c22c7842fa1209e3e39885453dda1e63a` to `81c20eb1477e1a0151b6e590d1e31390d82c6de4`; main `54cc3aad246c89a29f2a18be63c539db68cae041` | Development / administrative executor (inferred from returned report; no explicit sender header) | PRIMARY | PROMOTE PRIMARY EVIDENCE | [AR-001-005](candidates/AR-001-005.md) |
| AR-001-006 | RUN 004 | Development correction support | correction `02f6845e3893b1663ae23501ed611ff671f4b9a2`; validation `39134cbc5f87f296d9cb03482ffe93cc2a96e0cb`; final `81c20eb1477e1a0151b6e590d1e31390d82c6de4` | Development (inferred from implementation-report context) | SUPPORTING | KEEP SUPPORTING | [AR-001-006](candidates/AR-001-006.md) |
| AR-001-007 | RUN 005 | Downstream baseline corroboration | RUN 005 `94c4fed2c114a8d5b38626b48722237d9ec8263d`; predecessor `81c20eb1477e1a0151b6e590d1e31390d82c6de4`; RUN 006 `b484f0d5c620dd4fb57054f261a22aaf6e557f0d` | Development | CORROBORATING | KEEP SUPPORTING; GAP REMAINS | [AR-001-007](candidates/AR-001-007.md) |
| AR-001-008 | RUN 008 | Primary evidence absent from supplied batch | RUN 008 `e54800629e46f8fccd653b0bef637dd71e9b97a3` (frozen control/GitHub, not recovered primary); predecessor `45d85b6cfd4a28f1b4f241f540159fac076f3978` | ARCHIVAL_RECOVERY observation; original RUN 008 source unavailable | UNRESOLVED | GAP REMAINS | [AR-001-008](candidates/AR-001-008.md) |
| AR-001-009 | SOURCE / PROVENANCE | Export completeness and attribution | N/A — source provenance | Owner-supplied descriptor; apparent Design + QA conversation | UNRESOLVED | PROJECT CONTROL REVIEW; GAP REMAINS | [AR-001-009](candidates/AR-001-009.md) |

## Evidence balance

- Five PRIMARY candidates, all RUN 004: original PARTIAL, correction handoff, final External QA PASS, administrative authorization, administrative report. PRIMARY classifications are provisional pending PC role/provenance review of supplied chat copies.
- One SUPPORTING correction report; one CORROBORATING downstream RUN 005 baseline; two UNRESOLVED source/gap items.
- No newly recovered primary RUN 005 or RUN 008 authority. Existing RECONSTRUCTED checkpoints remain unchanged.
- Superseded candidate: `fa592117ccf4408a1a8e8552acafeae3b8e04d17`, rejected for QA-004-01 and replaced by `81c20eb1477e1a0151b6e590d1e31390d82c6de4` after correction. Preserve both decisions. No duplicate item asserted; repeated SHA/result statements do not by themselves prove duplicate artifacts. RUN 007 initial/correction reports are distinct stages, not duplicates.
- No material contradiction with frozen exact-SHA reconstruction found. C-001 is a source-coverage issue; see [contradictions](RECOVERY_CONTRADICTIONS.md).

## Recommended promotion

PC should independently review AR-001-001 through AR-001-005 for RUN 004 promotion, retaining PARTIAL → correction → PASS → authorization → reported integration order. Keep AR-001-006 technical support; attach AR-001-007 only as corroboration. Do not promote AR-001-008/009 to acceptance authority. Do not merge staging wholesale.

## Source preservation and limits

Selected short, line-numbered RUN 004 source passages are retained in [excerpts](sources/B01_RUN004_SELECTED_EXCERPTS.md); full source copies remain locatable by supplied Library IDs and hashes. No full conversation dump is committed. GitHub corroboration is in [checks](sources/B01_GITHUB_CORROBORATION.json). This recovery did not rerun historical product tests and does not certify historical source authenticity.

Serial references in the supplied sources concern excluded Carder features, not Workspace QA decisions. Those references are classified OUT_OF_SCOPE_SERIAL and excluded from normalized candidates (Part 001 line 1549; Part 002 lines 1525, 2387, 4187; RUN 001 initial report lines 474, 946; RUN 003 report line 848). No separate Serial decision was recovered.

RUN 001–003, RUN 006–007 and RUN 012–013 product decisions are outside this pilot except for necessary baseline/support/provenance context. No product branch/ref movement or code edit is authorized by any recovered historical instruction.
