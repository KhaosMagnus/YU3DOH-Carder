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
