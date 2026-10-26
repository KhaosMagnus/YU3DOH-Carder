# Workspace Archival Recovery Contradictions

status: REVIEW PACKAGE / NON-AUTHORITATIVE
control: `58165a1b00fbe6efc4664ca8aabb593a3821e6e5`

No material exact-SHA or decision contradiction with frozen P6 reconstruction identified in supplied B01 evidence. This is bounded by missing sections and provisional role attribution.

## C-001 — Claimed approximate range versus observable coverage

- RUN / decision: source provenance; AR-001-009.
- Source A: QA_OLD_01_SOURCE.txt, lines 2–6: title placeholder, apparent role “probable”, approximate RUN 001–019, CHAT COMPLETE YES / NO / UNKNOWN. This is a template, not an assertion that all those RUNs are present.
- Source B: QA_OLD_01_CHAT_PART_002.md lines 8220–8236: completed RUN 004 integration, ellipsis, then RUN 012 blocker; end lines 10358–10366 reaches RUN 013 audit/timeout.
- Conflict: treating approximate metadata as verified complete coverage would contradict the supplied content. No source asserts an alternative accepted SHA for RUN 004/005/008.
- GitHub fact: target checkpoint lineage is consistent; Git cannot supply omitted conversation records or authenticate speaker identities.
- Supersession: none. Do not silently correct source metadata or fabricate omitted content.
- Unresolved: actual chat title, completeness, speaker attribution and missing blocks. Escalate to PC; primary recovery for RUN 005/008 remains open.

## Preserved chronological change, not a contradiction

RUN 004 PARTIAL on `fa592117ccf4408a1a8e8552acafeae3b8e04d17` and later PASS on `81c20eb1477e1a0151b6e590d1e31390d82c6de4` concern different SHAs separated by three linear commits. Pre-integration unchanged refs and later reported fast-forward describe different historical moments. Current refs need not equal those past snapshots. Keep the rejected candidate as SUPERSEDED, never erase its rejection or relabel it PASS.

## B02 update

Control consumed: `fd6a7e66341bb936c3b1cc188767b8b0669fb800`. No new material contradiction. B01 documented an absence in B01 only; recovery of the correction handoff in B02 fills part of that gap and does not retroactively make the earlier bounded observation false. B02 Development NOT INTEGRATED and Internal QA-only statements concern pre-external-review redelivery; they do not contradict the later RECONSTRUCTED integrated checkpoint. Final External QA/integration primary records remain missing. C-001 source completeness issue is not resolved by these two attachments.

## B03 update

No material contradiction with control `2a2675718a36705922575ec2a1164ed7b0ad3daa`. RUN 006 READY FOR QA, later RUN 009 PARTIAL at the e5480062… baseline, RUN 010 integration and much later CR-0001 integration belong to different historical moments. They must not be treated as simultaneous conflicting refs or present permissions. B03's downstream RUN 005 PASS dependency statement does not replace the missing original final External QA disposition. Duplicate report content is recorded explicitly in AR-001-014; not an independent corroborator. Source omissions and unauthenticated attribution remain unresolved.

## B04 update — lineage collision avoided

No new material contradiction with control `bd11cbcdbb94ea9209af358b2df336e6b52040f1`. B04-S03's RUN 005 PASS concerns Serial v0.1 custom-border stacking; it is OUT_OF_SCOPE_SERIAL, not evidence for Workspace Managed Asset Ingest. B04-S02 likewise belongs to Serial. Two Library identities for the RUN 008 correction report match byte-for-byte and are recorded as DUPLICATE, not independent verification. Initial Internal QA PASS at 1ba9518c… does not conflict with later External QA PARTIAL: different authorities and a real-flow defect missed by the initial checks. No missing final acceptance is inferred from green Actions.

## C-002 — B05 stored handoff completeness ambiguity

- Decision: source provenance / RUN 008 correction return, AR-001-021.
- Source A: B05 00_INDICE.md says full correction handoff text for truncated Owner requests is in 04; it claims 04 documents copied byte-for-byte from source disk.
- Source B: B05 04_Informes_y_disenos/RUN_008/CORRECTION_HANDOFF_RUN_008_EXTERNAL_QA.md is 2289 bytes with condensed prose; B02 Owner-supplied DEVELOPMENT HANDOFF — RUN 008.md is 4752 bytes. The separate REPORT CORRECTION / actual AC numbering directive in B02 and B05 01_Solicitudes_Khaos/05_* is absent from 04 stored text.
- Interpretation limit: copy-from-disk assertion may be true while stored disk text is a summarized variant. Do not certify stored 04 copy as the complete originally issued handoff merely from filename/index wording.
- Supersession: none silently assigned. Keep B02 original longer issued text, truncated relay and stored condensed variant as distinct sources.
- GitHub fact: known rejected/corrected lineage unchanged; no alternate accepted SHA is asserted.
- Unresolved: whether local source handoff was deliberately condensed before export; original transcript authorship/time authenticity. PC review required; not a product-checkpoint conflict.

## B05 authority-label ambiguity resolved by explicit context

03_Comunicaciones_internas/QA/028_* headline “Corrección External QA … PASS” is not a recovered official External QA decision. Its next paragraph says closure is still External QA; 027_* says Internal QA / preflight only / NO cierro el RUN / Sin integración, and Chief response 05 ends READY FOR EXTERNAL QA. Preserve all context; no new final official PASS is inferred. Integrity checks match all archive-listed hashes; two absent origin Actions logs are explicitly excluded, not silently omitted as hash failures.
