# Request and disposition ledger — adopter working template

PROJECT ID: <ID>
LEDGER AUTHORITY: <control coordinator/delegation>
ALLOWED STATES: PROPOSED, ACKNOWLEDGED, IN_SCOPE, IMPLEMENTING, IMPLEMENTED, VALIDATED, INTEGRATED, DEFERRED, REJECTED, SUPERSEDED, BLOCKED (declare any equivalents).

Create one record for each actual acknowledged request, including bootstrap/adoption. No fabricated product requests or run history. Use a record per request rather than dropping details from a wide table:

- REQUEST ID / RECEIVED AT: <unique ID; time>
- SOURCE / AUTHORITY: <request location; authenticated actor/decision reference>
- SCOPE / REQUIREMENTS: <bounded request; frozen contract and revision if present>
- DISPOSITION / DECIDED BY / RECORD: <state; competent authority; immutable decision>
- CONTROL REVISION / PRODUCT REVISION: <separate exact inputs; NOT ESTABLISHED / N/A as justified>
- EVIDENCE / CONFIDENCE / LIMITATIONS: <observed facts vs inference; locations and integrity>
- DEPENDENCIES / NEXT RECIPIENT / ACTION: <explicit owner and route>
- DEFERMENT / REVISIT: <reason, deciding authority, reopening condition, carrying artifact; or N/A>
- BLOCKER: <primary class, exact conflicting sources if any, unexecuted actions, recovery condition; or NONE>
- PREDECESSOR / SUCCESSOR / HISTORY: <exact linked decisions; preserve frozen predecessors>

Transitions require the correct recorded gate (§5/§14). Bootstrap completion does not place a product request in VALIDATED or INTEGRATED. Development readiness, independent QA and integration approval are separate records. Mutable index entries may point to new dispositions; old frozen decisions/reports remain intact.
