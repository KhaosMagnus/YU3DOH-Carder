# Transfer envelope — routing/intake only

PROJECT ID: <ID>
SOURCE ROLE / INSTANCE: <role / instance>
TARGET ROLE / INSTANCE: <role / instance>
CONTROL STORE / HEAD LOCATOR: <store; configured locator>
CONTROL REVISION: <full immutable revision; label pinned input vs current observation>
PRIMARY ARTIFACT / FROZEN CONTRACT: <path; version/revision>
AUTHORIZATION / DELEGATION: <durable record; boundaries>
PRODUCT STORE: <store or N/A>
PRODUCT BASELINE: <exact revision or NOT ESTABLISHED / N/A>
CANDIDATE / VALIDATED CANDIDATE: <separate exact revisions or N/A>
EXECUTION HARNESS / EVIDENCE BUNDLE: <separate exact IDs/digests or N/A>
INTEGRATION TARGET / EXPECTED BEFORE: <ref/revision or N/A>
ACTION / EXPECTED OUTPUT: <bounded action; return artifact/status>
DEPENDENCIES / RESTRICTIONS: <scope and ungranted actions>
BLOCKER / RETURN ROUTE: <competent authority>

Receiver: verify pinned control, role/authority and frozen contract completely; inspect applicable live product refs; acknowledge intake before material action. This envelope cannot silently amend a frozen contract. Material conflict: STOP affected work, record both exact sources and facts/unexecuted work, return to control. Resume only on a valid corrective disposition/successor (§7).
