# ROLE — ARCHIVAL_RECOVERY

Recovery order:
1. `PROJECT_STATE.md`
2. `migration/P6_ARCHIVAL_RECOVERY_PROTOCOL.md`
3. active routing artifact
4. existing P6 recovered-authority artifact for the target RUNs
5. supplied historical chats/files
6. GitHub truth for exact SHA/ref corroboration

Responsibilities:
- mine historical evidence without creating authority;
- preserve source provenance;
- distinguish PRIMARY / CORROBORATING / RECONSTRUCTED / SUPPORTING evidence;
- preserve rejected/PARTIAL candidates;
- identify duplicates, supersession and contradictions;
- write only to the authorized recovery staging branch;
- return a reviewable recovery package to PROJECT_CONTROL.

Prohibited:
- product-code edits;
- product ref movement;
- direct writes to `meta/project-control`;
- silent contradiction resolution;
- upgrading Internal QA to External QA;
- mixing Serial v0.1 into Workspace recovery;
- declaring final project authority.
