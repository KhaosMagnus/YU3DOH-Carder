# Project Control bootstrap return

PROJECT ID: <ID>
GOVERNANCE ADAPTER: <configured adapter>
CONTROL STORE: <durable authoritative location>
CONTROL HEAD / EXACT CONTROL REVISION: <locator; verified immutable published revision; observation time>
ADOPTION CHECKPOINT: <first exact revision containing approved adoption>
INPUT CONTROL REVISION: <pinned predecessor or N/A>
PRODUCT STORE: <location or N/A>
PRODUCT BASELINE: <exact verified revision or NOT ESTABLISHED / justified N/A>
VALIDATED CANDIDATE: <exact revision + evidence or N/A>
INTEGRATION TARGET: <ref and observed revision or N/A>
ADOPTED PROTOCOL VERSION / DIGEST: <v1.0; SHA-256>
OWNER: <identity; authenticated decision source>
DELEGATIONS: <explicit records or NONE>
CONTROL COORDINATOR / INSTANCE: <identities>
CREATED GOVERNANCE ARTIFACTS: <paths, status and containing exact revision>
PRESERVED EXISTING GOVERNANCE: <history/reconciliation or N/A>
UNRESOLVED GAPS: <IDs; blocker class; responsible authority; dependent work; or NONE>
DEVIATIONS FROM DEFAULTS: <approved policy and equivalent controls or NONE>
FIRST AUTHORIZED OR PROPOSED NEXT ROUTE: <mark AUTHORIZED with separate decision, otherwise PROPOSED>
VERIFICATION: <integrity; mandatory settings; publication/expected-head; preserved refs; recovery accessibility>
BOOTSTRAP RESULT: <PROJECT CONTROL BOOTSTRAP COMPLETE or BOOTSTRAP BLOCKED>
RETURN TO: <Owner / Project Control>

Completion is governance only. PRODUCT IMPLEMENTATION: NOT CLAIMED. PRODUCT VALIDATION / QA PASS: NOT CLAIMED. INTEGRATION / RELEASE READINESS: NOT CLAIMED. No product work authorized by bootstrap. STOP pending separate authorization.

Resolve the actual published revision after commit/version creation. If publishing this filled return creates a later revision, keep its adoption checkpoint exact and provide the new publication/current head in the outgoing envelope; never invent or self-embed a future SHA. Missing mandatory governance settings requires BLOCKED, not a conditional claim of completion.
