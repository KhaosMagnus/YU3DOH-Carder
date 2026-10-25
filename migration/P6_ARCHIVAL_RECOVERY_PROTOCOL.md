---
artifact_id: P6-ARCHIVAL-RECOVERY-PROTOCOL
artifact_type: protocol
status: FROZEN
protocol_version: "1.0"
source_role: PROJECT_CONTROL
source_instance: PC-001
control_parent_sha: e83ffd8b9b8050039b5f59cbe9ee03893d8deec5
---

# P6 Archival Recovery Protocol

## Purpose

Recover primary historical Workspace evidence from pre-Project-Control conversations and attached files without allowing an archival worker to rewrite project authority.

This protocol applies to YU3DOH Workspace historical recovery only.

Serial v0.1 is a separate historical lineage and is OUT OF SCOPE for this recovery campaign unless separately routed.

## Authority model

Authoritative branch:

`meta/project-control`

Non-authoritative staging branch:

`recovery/p6-archival-staging`

The staging branch may contain:

- raw-source inventories;
- extracted candidate evidence;
- duplicates;
- unresolved contradictions;
- provisional classifications;
- proposed normalized artifacts.

Nothing on the staging branch becomes project authority merely because it is committed there.

Only PROJECT_CONTROL may promote accepted recovery findings into `meta/project-control`, using a new semantic control commit after review.

Do NOT merge the staging branch wholesale into `meta/project-control`.

## Worker role

Role:

`ARCHIVAL_RECOVERY`

The worker may:

- inspect supplied historical chats;
- inspect every file attached to those chats;
- correlate historical artifacts with exact GitHub SHAs;
- identify primary vs supporting evidence;
- preserve PARTIAL/FAIL/rejected candidates;
- classify duplicates and superseded artifacts provisionally;
- create normalized recovery candidates on staging;
- record gaps and contradictions.

The worker may NOT:

- alter product code;
- move product refs;
- modify `main` or `feature/workspace-v0.1`;
- create or authorize RUN 024;
- modify `meta/project-control`;
- declare a missing artifact found without source evidence;
- promote Internal QA to External QA;
- resolve contradictions silently;
- infer an External QA PASS merely from a Development/Internal-QA PASS;
- mix Serial v0.1 evidence into Workspace recovery.

## Evidence classes

Use exactly:

`PRIMARY`
= role-owned artifact or direct authoritative decision from the role that owned the decision.

`CORROBORATING`
= independent supporting evidence consistent with a primary/reconstructed authority claim.

`RECONSTRUCTED`
= authority established indirectly through exact downstream baseline/ref history under the frozen project protocol.

`SUPPORTING`
= useful technical/contextual evidence without decision authority.

`DUPLICATE`
= materially duplicated source.

`SUPERSEDED`
= historically valid but replaced by a later decision/artifact.

`CONTRADICTORY`
= conflicts materially with another source or GitHub truth.

`UNRESOLVED`
= provenance or authority cannot yet be established.

## Recovery item contract

For every material candidate, record:

- RECOVERY ITEM ID
- Workspace RUN / decision
- claim
- exact SHA(s), when applicable
- source chat identifier/title supplied by Owner
- source file name, when applicable
- source role
- source type
- evidence class
- exact evidence location or concise excerpt
- relation to current P6 reconstructed state
- proposed classification/action
- contradictions
- unresolved questions

Do not copy large transcripts into normalized artifacts.

## Required aggregate outputs

Maintain on staging:

`recovery/workspace/RECOVERY_INDEX.md`

`recovery/workspace/RECOVERY_GAPS.md`

`recovery/workspace/RECOVERY_CONTRADICTIONS.md`

and normalized candidates under:

`recovery/workspace/candidates/`

Raw source files should not be committed blindly when they contain irrelevant conversation bulk. Preserve their names/provenance in the index. Commit source copies only when needed for durable evidence and when appropriate to repository hygiene.

## Promotion gate

The worker returns:

`RECOVERY READY FOR PROJECT CONTROL REVIEW`

or:

`RECOVERY INCOMPLETE`

PROJECT_CONTROL then independently reviews candidates against:

1. exact GitHub truth;
2. existing frozen P6 reconstruction;
3. source role authority;
4. supersession order;
5. contradictions.

Accepted evidence is re-authored/promoted by PROJECT_CONTROL in semantic commits on `meta/project-control`.

No staging merge is authorized.

## Initial campaign

Pilot targets:

- RUN 004
- RUN 005
- RUN 008

Priority evidence:

1. original External QA disposition;
2. correction disposition / return-to-development;
3. final External QA PASS;
4. administrative integration authorization/report;
5. exact accepted/integrated SHA;
6. contradictions with current P6 reconstructed authority.

The pilot determines whether the recovery workflow is reliable enough to expand to remaining archival gaps.
