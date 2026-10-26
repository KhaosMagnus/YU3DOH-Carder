# Workspace Archival Recovery Index

status: RECOVERY READY FOR PROJECT CONTROL REVIEW / NON-AUTHORITATIVE
campaign: P6 ARCHIVAL RECOVERY PILOT 001
worker: ARCHIVAL_RECOVERY / AR-001
control_sha_consumed: `58165a1b00fbe6efc4664ca8aabb593a3821e6e5`
staging_parent: `c49ad51c2948481daa6cdc5f7da0142608fc47a3`
date: 2026-10-25 (America/Mexico_City)
targets: RUN 004, RUN 005, RUN 008

latest_batch: B05
latest_control_sha_consumed: `b149b810415a5633b28e6de1bbe198fb3dd7f7b2`

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

## B02 — RUN 008 correction recovery (2026-10-25)

Current control consumed: `fd6a7e66341bb936c3b1cc188767b8b0669fb800`; B01 routing control above remains historical. Current control explicitly keeps AR-001 active for B02 and records RUN 004 sequence promoted with provenance limitation in `migration/P6_PRIMARY_RECOVERY_RUN_004.md`. Original B01 candidate records remain unchanged.

| Batch | Files | Result |
|---|---:|---|
| B02 / Owner additional attachments | 2 | Both read fully, raw-byte hashes recorded; one PRIMARY correction handoff and one SUPPORTING implementation report |

| Item | Class | Result / action |
|---|---|---|
| [AR-001-010](candidates/AR-001-010.md) | PRIMARY | RUN 008 QA-008-01 handoff records PARTIAL on rejected exact SHA; recommend PC promotion with provenance limitation |
| [AR-001-011](candidates/AR-001-011.md) | SUPPORTING | Corrected redelivery at e5480062…; Internal QA only, READY FOR EXTERNAL QA and NOT INTEGRATED |

[Source manifest](sources/B02_SOURCE_MANIFEST.json), [selected excerpts](sources/B02_SELECTED_EXCERPTS.md), [GitHub corroboration](sources/B02_GITHUB_CORROBORATION.json).

B02 supersedes the *current breadth* of AR-001-008's RUN 008 gap: correction handoff and embedded PARTIAL decision are now recovered. Its B01 absence observation remains historically correct. The full initial QA report, final corrected External QA PASS and administrative authorization/report are still absent from B01+B02. RUN 005 gaps unchanged. No final acceptance is inferred from Internal QA, Actions success or downstream lineage.

Cumulative: 11 normalized items: 6 PRIMARY candidates, 2 SUPPORTING, 1 CORROBORATING, 2 UNRESOLVED (one gap now partially filled). B01 RUN 004 primary text is already promoted by PC at the current control SHA; B02 remains non-authoritative. No duplicate file pair or material contradiction newly identified. Rejected RUN 008 candidate `1ba9518c402cb5005632b8fc364c20d508f2dc03` is preserved as the prior PARTIAL target, replaced as redelivery target by `e54800629e46f8fccd653b0bef637dd71e9b97a3`; this does not certify final acceptance.

Recommended new promotion: AR-001-010 only, after PC verifies role/provenance. Keep AR-001-011 supporting. Next archival priority: final External QA PASS and integration authorization/report for RUN 008; original primary QA/integration for RUN 005.

## B03 — Development history / downstream baseline evidence

Control consumed: `2a2675718a36705922575ec2a1164ed7b0ad3daa`. Current PC state has promoted B02 AR-001-010 as RUN 008 correction-return text with provenance limitation; AR-001-011 remains SUPPORTING. B01/B02 recommendations above describe their historical submission state.

| Batch | Source | Files | Processing result |
|---|---|---:|---|
| B03 | Owner-supplied Development / Programming history, B03-S01 | 1 | Complete source inventoried/searched; target-bearing passages inspected; two CORROBORATING items and one material DUPLICATE report |

| Item | Class | Claim / action |
|---|---|---|
| [AR-001-012](candidates/AR-001-012.md) | CORROBORATING | RUN 006 handoff requires RUN 005 checkpoint and lists RUN 005 PASS; retain downstream context |
| [AR-001-013](candidates/AR-001-013.md) | CORROBORATING | RUN 009 QA report preserves RUN 008 checkpoint as integration baseline; retain downstream context |
| [AR-001-014](candidates/AR-001-014.md) | DUPLICATE | Embedded RUN 006 Development report repeats B01 report used by AR-001-007; do not count as independent verification |

[Manifest](sources/B03_SOURCE_MANIFEST.json), [excerpts](sources/B03_SELECTED_EXCERPTS.md), [GitHub corroboration](sources/B03_GITHUB_CORROBORATION.json).

No new PRIMARY final QA or integration records for RUN 005/008 found. B03 begins at RUN 006 and jumps from its report to RUN 009 QA; later RUN 010 and CR-0001 administrative sections are outside this pilot and not executed or normalized as target authority. Mixed historical refs reflect different epochs, not current product instructions. Serial exclusion at source line 218 is OUT_OF_SCOPE_SERIAL.

Cumulative 14 items: 6 PRIMARY candidates (B01/B02 now reviewed/promoted by PC with limitations as recorded in control), 2 SUPPORTING, 3 CORROBORATING, 2 UNRESOLVED, 1 DUPLICATE. No new material contradiction or newly superseded target candidate in B03. Previously rejected candidates remain preserved. No primary promotion recommended from B03; optionally retain AR-001-012/013 as corroborating context only.

Remaining highest-priority sources: original RUN 005 final QA/correction/integration sequence, and corrected RUN 008 final External QA PASS plus administrative authorization/report. No Internal QA, downstream PASS statement, or current lineage is upgraded to the missing original final decision.

## B04 — Mixed historical sources and linked Library follow-up

Control consumed: `bd11cbcdbb94ea9209af358b2df336e6b52040f1`; current PC review of B03 accepts AR-001-012/013 as CORROBORATING and AR-001-014 as DUPLICATE, no primary promotions. The original routing control remains historical above. Owner explicitly authorized following generated/attached-file clues into project Library.

| Batch | Supplied files | Additional Library documents inspected | Result |
|---|---:|---:|---|
| B04 | 4 | 4 | 1 new SUPPORTING original RUN 008 report; 1 exact-byte DUPLICATE correction report; no new PRIMARY target closure |

| Item | Class | Action |
|---|---|---|
| [AR-001-015](candidates/AR-001-015.md) | SUPPORTING | Initial 1ba9518c… Development report; preserve rejected/superseded target, Internal QA only |
| [AR-001-016](candidates/AR-001-016.md) | DUPLICATE | Library correction report exactly matches B02-S02 / AR-001-011; retain original identity |

[Source manifest](sources/B04_SOURCE_MANIFEST.json), [Library reference investigation](sources/B04_REFERENCED_FILE_SEARCH.md), [excerpts](sources/B04_SELECTED_EXCERPTS.md), [GitHub corroboration](sources/B04_GITHUB_CORROBORATION.json).

Two supplied histories are OUT_OF_SCOPE_SERIAL (B04-S02/S03); their RUN 004/005 labels must never be confused with Workspace targets. Other uploads cover Workspace RUN 001–003 and RUN 013–014; no target final closure found. Two linked early architecture/API drafts were located/read for context; later roadmap/RUN 014 links were indexed by identity only, outside pilot. Negative Library searches are retrieval limits, not proof of absence.

Cumulative 16 normalized items: 6 PRIMARY candidates (previous PC promotions with limitations), 3 SUPPORTING, 3 CORROBORATING, 2 UNRESOLVED, 2 DUPLICATE. No new PRIMARY authority, material contradiction or new target SHA discovered in B04. Rejected 1ba9518c… is preserved, not erased by corrected e5480062…. No primary promotion recommended; retain AR-001-015 as technical support and AR-001-016 as duplicate provenance.

RUN 005 primary QA/correction/integration and RUN 008 corrected final External QA PASS/integration authorization/report remain open. Next source priority remains those original role-owned closure decisions.

## B05 — New Grok Bot source lead / post-closure supplement

Control consumed: `b149b810415a5633b28e6de1bbe198fb3dd7f7b2`. Pilot 001 remains officially CLOSED / PARTIAL RECOVERY SUCCESSFUL per PC. Its new-concrete-source reactivation rule permits bounded inspection of this newly supplied ZIP. This staging supplement does not amend the authority closure or reopen exhausted searches. Source: Owner attachment identified as “de grok bot”.

| Batch | Package | Inventory / integrity | New normalized evidence |
|---|---|---|---|
| B05 | YU3DOH_Carder_Evidencia_Documental_2026-10-25.zip | 216 files; 215/215 listed hashes match; 37 present origin records match; 2 explicitly excluded Actions logs not present | 2 SUPPORTING, 1 CORROBORATING, 1 DUPLICATE group, 1 UNRESOLVED provenance item |

| Item | Class | Action |
|---|---|---|
| [AR-001-017](candidates/AR-001-017.md) | SUPPORTING | Direct RUN 008 Internal QA/preflight communications; no official closure |
| [AR-001-018](candidates/AR-001-018.md) | SUPPORTING | RUN 008 specification + technical design/correction HOW documents located |
| [AR-001-019](candidates/AR-001-019.md) | CORROBORATING | Complete RUN 009 required-baseline contract at e5480062… |
| [AR-001-020](candidates/AR-001-020.md) | DUPLICATE | Four report members exactly match prior sources; no independent evidence inflation |
| [AR-001-021](candidates/AR-001-021.md) | UNRESOLVED | C-002: condensed stored correction handoff vs original B02 full copy; preserve variants |

[Full source manifest](sources/B05_SOURCE_MANIFEST.json), [selected excerpts](sources/B05_SELECTED_EXCERPTS.md), [review notes](sources/B05_REVIEW_NOTES.md), [GitHub corroboration](sources/B05_GITHUB_CORROBORATION.json).

No new PRIMARY final QA/integration recovered for RUN 005 or RUN 008. Frozen residual gaps remain RECONSTRUCTED + CORROBORATED. This package does add pre-v1 role/document lineage, underlying Internal QA messages and the previously unresolved RUN 008 handoff/design filenames. Stored handoff is shortened, not a replacement original. Recommended PC action: review new support/corroboration and provenance variants for lineage consolidation; no new primary final-acceptance promotion; retain frozen closure unless PC independently supersedes it.

Cumulative 21 normalized items: 6 PRIMARY candidates previously reviewed/promoted with limitations, 5 SUPPORTING, 4 CORROBORATING, 3 UNRESOLVED, 3 DUPLICATE groups. Existing rejected/superseded targets retained. No new substantive exact-SHA contradiction; C-002 is source-completeness ambiguity, not an alternative QA/integration decision.
