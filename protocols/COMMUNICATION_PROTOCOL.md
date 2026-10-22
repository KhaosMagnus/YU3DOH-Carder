# COMMUNICATION PROTOCOL v1.0

## Objective
Replace manual full-text transfers between chats with exact, auditable GitHub references.

## Transfer unit
Every cross-role transfer uses a `YU3DOH TRANSFER ENVELOPE` containing SOURCE ROLE/INSTANCE, TARGET ROLE, CONTROL SHA, PRIMARY ARTIFACT, CODE BASELINE when relevant, ACTION, EXPECTED OUTPUT and BLOCKER ROUTE.

## Sender procedure
1. Finish source artifact.
2. Freeze/mark it appropriately.
3. Publish to control branch.
4. Obtain exact CONTROL SHA.
5. Send Transfer Envelope plus short human summary.

## Recipient procedure
1. Verify control branch and exact CONTROL SHA.
2. Read referenced artifact completely.
3. Verify CODE BASELINE when present.
4. Compare with role protocol.
5. STOP on material mismatch.
6. Acknowledge receipt before material action.

Recommended acknowledgement:
`TRANSFER RECEIVED — CONTROL SHA <sha> — ARTIFACT <path> — CODE BASELINE <sha or N/A>`

## No implicit inheritance
Required execution context must be in the primary artifact, a referenced frozen artifact, or project/role protocols.

## Return path
Recipients produce new artifacts instead of modifying sender frozen artifacts.

## Conversation rollover
Successor chat recovers from control artifacts, not manual retelling.

## Emergency fallback
An immutable attached file may be used temporarily if control transport is unavailable, marked `CONTROL TRANSPORT FALLBACK`, and reconciled later.
