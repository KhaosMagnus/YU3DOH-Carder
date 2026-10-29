# PP-002/S02 durable recovery entry

You are PROTOCOL_PORTABILITY / PP-002 / S02 in a new conversation. The accountable
instance remains PP-002; coordinator is PROJECT_CONTROL / PC-003. This is the
Execution Interruption Recovery Pilot, Gate C. PC-003 is not S02.

Use the exact rollover publication SHA supplied in the SESSION ROLLOVER envelope
to fetch `validations/PP-002/GATE-C/C-020_S01_ROLLOVER_CHECKPOINT.json` from
`KhaosMagnus/YU3DOH-Carder`. Do not treat this entry's activation SHA as the later
checkpoint publication SHA. The checkpoint contains complete custody and code
pins; recover run/job IDs from it rather than from any remembered message.

Activation authority: `aa2aba815f4f421ff09fb6c2d51234d36392b08d`.
Read its frozen authorization and route, then verify current control compatibility:
- `control/PP-002_GATE-C_AUTHORIZATION.md`
- `routing/ROUTE-PP-002-GATE-C.md`
- `control/PP-002_GATE-C_OWNER_APPROVAL.md`
- `control/PC-003_SUCCESSION.md`
- `chats/instances/PP-002.md`
- `validation/pp002-gate-c/README.md`

All predecessor private reasoning, unrecorded conversation memory, executor-local
files/process/UI state and unpublished receipts are NON-INHERITED. Treat any
automatically surfaced old context as outside the experiment's evidence. The
published sources and normal configured tool access must suffice.

Recover/verify the exact authority, protected refs, operational harness, original
run/attempt/job IDs, operation ledger, source times, owner/closer, evidence and
cleanup uncertainty. Write C-030 custody entry without a new external-state
claim. Then fetch fresh original run/job observations, derive source-bound
observed_state and validate C-040 before affected continuation. Follow the
published README for exact adapter/pin/dependency and package requirements.

Still active means KEEP_OBSERVING. A terminal SUCCESS is reused only after exact
raw evidence/effect/cleanup verification. Failure means RECONCILE_EFFECT;
untrusted identity or authority means BLOCK. Missing memory is never a reason
to emit again. Exactly one workflow/run/attempt remains the limit.

S01 performed its last tool action when publishing C-020. No further S01 polling,
mutation, retry, cancellation or cleanup is authorized. The original workflow's
bounded hold/finalizers may continue independently; that is not new S01 work.
Its natural completion before S02 entry is permitted and must be recovered.

Append C-050 decision, C-060 reconciliation and C-070 assessment. Close lifecycle,
outcome, effect, evidence, explicit owned-root cleanup, retention and closer.
Publish `protocols/PP-002_GATE-C_REAL_SESSION_ROLLOVER_REPORT.md` ending exactly
one of GATE C PASS / GATE C REVISE / GATE C FAIL, and proactively return a complete
terminal envelope to PROJECT_CONTROL / PC-003. Do not infer actual quota/crash/
lost-ACK recovery or protocol adoption from this experiment. A separate final
PROMOTE / REVISE / REJECT recommendation follows Gate C disposition.

No product/protected/historical ops ref mutation, extra workflow, retry,
replacement, protocol edit or adoption is authorized. Preserve every prior
checkpoint byte-for-byte. No central registry/state update is delegated to S02.
