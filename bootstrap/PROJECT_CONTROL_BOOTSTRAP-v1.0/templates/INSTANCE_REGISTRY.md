# Instance registry — adopter working template

PROJECT ID: <ID>
REGISTRY OWNER: <control coordinator>

Create records for real assignments only; bootstrap does not imply a product RUN. Each record:

- INSTANCE ID / ROLE / ACTOR: <identities>
- MISSION / STATUS: <bounded assignment; active, blocked, closed or declared equivalent>
- AUTHORITY / ALLOWED WRITES: <decision; limitations>
- INPUT CONTROL REVISION: <exact pinned revision or N/A at first creation>
- PRODUCT BASELINE / CANDIDATE: <exact revisions or NOT ESTABLISHED / N/A>
- PRIMARY ROUTE / CONTRACTS: <paths and immutable revisions>
- PREDECESSOR / SUCCESSOR: <record, reason, revisions or NONE>
- COMPLETED / PENDING / DEFERRED / BLOCKED: <request IDs and evidence; do not inherit unproved acceptance>
- NEXT RECIPIENT / ACTION: <authority and bounded route>
- RECOVERY LOCATIONS: <state, ledger, roles, current route, evidence and supersession history>
- CHECKPOINT KIND / TIME: <historical pinned snapshot; timestamp; resolve live heads again on resume>

Reuse an active instance when role, scope and authority continue and context is recoverable. Record rollover or successor when ownership/context changes under protocol §12. Preserve earlier blocker reports and link successor results. A new chat does not confer authority or create a new RUN.
