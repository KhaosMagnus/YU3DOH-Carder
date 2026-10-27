# Project state — adopter working template

Replace `<...>` with verified values; explicit `NOT ESTABLISHED` / `N/A` needs a reason. Do not mark complete with unresolved mandatory governance settings. References below resolve from the configured control root, not necessarily this template directory.

## Identity and authority

PROJECT ID: <stable ID>
OWNER: <identity; authenticated authority source>
BOOTSTRAP / ADOPTION DECISION: <immutable record; authorizer; scope; allowed writes>
DELEGATIONS / RESERVED RIGHTS: <record or explicit none>
CONTROL COORDINATOR / INSTANCE: <identity and assignment>
PROTOCOL: Generic Project Control Protocol v1.0
PROTOCOL PATH / SHA-256: <durable path; actual digest>
ADOPTION EFFECTIVE REVISION: immutable revision containing this approved adoption record
INPUT CONTROL REVISION / PARENT: <exact revision or N/A for new control store>
STATE KIND: <current state index; observations dated below, not a perpetual live-ref claim>
OBSERVED AT / BY: <UTC timestamp; actor>

## Stores, adapter and discovery

GOVERNANCE ADAPTER: <Git/GitHub or equivalent configured adapter>
CONTROL STORE / HEAD LOCATOR: <location; configured branch/namespace>
EXACT CONTROL REVISION RESOLUTION: <how to resolve current immutable head and retrieve history>
PRODUCT STORE / REFS: <location; protected refs or N/A>
PRODUCT BASELINE: <exact observed revision or NOT ESTABLISHED / justified N/A>
VALIDATED CANDIDATE: <exact revision + QA record or N/A>
INTEGRATION TARGET: <store/ref + observed before-revision or N/A>
RUN HISTORY: <verified index or NONE; never infer from bootstrap assignment>
CANDIDATE / HARNESS / EVIDENCE REVISIONS: <separate identities if applicable; otherwise N/A>
DISCOVERY EVIDENCE: <actual inspections; working-tree condition; source locations/revisions>
EXISTING GOVERNANCE RECONCILIATION: <preserved history; adoption/successor approval or N/A>

## Configured control plane

REVISION / INTEGRITY MECHANISM: <immutable identifiers; validation/retrieval>
CONDITIONAL WRITE MECHANISM: <expected-head compare-and-swap; absent-ref guard>
PUBLICATION AUTHORITY / ALLOWED PATHS: <actor; delegation; boundaries>
PATH MAP: <state; roles; instances; requests; decisions; routes; artifact/history index; evidence>
CONCURRENCY: protocol §13; refetch/inspect/preserve compatible changes; STOP on semantic conflict.
FROZEN ARTIFACTS: immutable history under §6. Correct through authorized successor/supersession with exact predecessor, reason, provenance and non-retroactive effect; never rewrite old reports for freshness.
ARTIFACT INDEX / SUPERSESSION DISCOVERY: <durable index or versioned search method; how status and links are found>
CONTRADICTIONS: §3/§7; STOP, record exact conflicting sources and observed facts, route to <authority>.
BLOCKER RECORD / ROUTES: <ledger/record path; designated recipients from role registry; §10>
REQUEST DISPOSITIONS: <ledger path and allowed states; transition authority; defer/revisit rules>

## Evidence policy — fill every setting

ALLOWED EVIDENCE TYPES / ACCEPTANCE MAPPING: <unit; UI-contract; integration; real E2E; readiness; missing/inconclusive; per-contract QA decision>
PROVENANCE REQUIRED: exact control + candidate + harness/bundle IDs when applicable; producer, capture time, commands/steps, fixtures, observed results and omissions.
RUNTIME / ENVIRONMENT RECORD: <required versions; environment identity; clean custody method>
ARTIFACT LOCATION / ACCESS: <durable locations; who can retrieve>
INTEGRITY MECHANISM: <digest/immutable version and verification method>
RETENTION HORIZON: <project-specific duration or permanent, with rationale>
EXPIRY POLICY: <monitor/owner; retrieval or renewal before expiry; missing evidence becomes a recorded gap>
DURABLE ARCHIVAL POLICY / CUSTODIAN: <what must be archived, where, when, by whom; explicit justified N/A if not required>
SYNTHETIC EVIDENCE: §9; disclose boundary, injection, real components and omitted layers; QA judges sufficiency against frozen criterion; never real E2E by relabeling.
ENVIRONMENT / EXECUTION: §8/§11; readiness is not acceptance; separate authoring/execution permitted with exact custody; <configured substrates or N/A pending actual work>.

## Decision gates and recovery

ROLE / HAT-SHARING POLICY: <registry; permitted overlaps; conflicts; designated authorization controls>
QA AUTHORITY: <role and assignment process; independent decision record required>
INTEGRATION AUTHORITY: <Owner/delegate; separate exact-source/target approval required>
INTEGRATION POLICY: <recommended fast-forward + expected-head conditional update, or approved alternative>
ALTERNATE MECHANICS: <disabled until explicit equivalence, extra-delta, resulting-identity and revalidation policy; or policy reference>
EMERGENCY POLICY: NO IMPLICIT BYPASS; <none / separately approved policy with actor, activation, scope, risk, rollback, incident and reconciliation>.
RECOVERY: locate this store's current exact head, protocol, state, ledger, roles, active instance/route and predecessor records; verify actual refs; separate historical checkpoints from current facts; §15.
UNRESOLVED GAPS / BLOCKERS: <IDs, class, facts vs hypothesis, owner, blocked actions, next dependency; or none>
DEVIATIONS FROM DEFAULTS: <decision, rationale and equivalent controls; or none>
NEXT ROUTE: <PROPOSED or separately AUTHORIZED; authority reference>
PRODUCT WORK AUTHORIZED BY THIS BOOTSTRAP: NONE
