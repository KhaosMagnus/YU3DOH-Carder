# PP-002 Gate C bounded session-rollover adapter

Authority: `control/PP-002_GATE-C_AUTHORIZATION.md` at activation control
`aa2aba815f4f421ff09fb6c2d51234d36392b08d`.
Coordinator: PROJECT_CONTROL / PC-003. Accountable instance remains PP-002.

## Exact bounded delta

`observer.py` is a successor of the frozen B-R2 adapter at blob
`4c679972f1d3d3ec2501f6aebf9a6484d7bf8316`. Changes are limited to Gate C
control/path/branch/schema constants, ten-operation registry, the C1 step-name
vocabulary, one-case package custody, removal of unused B3 partial-package
handling, and validation/attachment of the S01 rollover custody header.
The original B-R1 `validate` function is loaded unchanged after enforcing its
SHA-256 `0ebe717cb4830d376668a9d3ac193fd026399279c09a68af656e04d566247633`.
The same supplemental-source vocabulary and action restrictions as B-R2 apply.
No PP-002 v2 lifecycle/axis/decision semantics are changed.

`implementation-pin.json` pins source bytes before workflow emission, and
`adapter-delta.diff` records the full B-R2-to-C adapter delta. Fourteen adversarial
synthetic receipt/custody tests emit no workflow or experimental marker.
The original defective Gate B 010 remains an unchanged negative control.

## Source custody and validation

`planned_intent` is structurally separate from `observed_state`; identity data
alone may come from intent. Every axis is derived from a resolvable raw receipt.
No child receipt means UNCERTAIN/UNKNOWN. A positively pending/null-start step
can support NOT_DONE for that named step, never a blanket nonemission claim.

`requested_at` and `receipt_at` are actual connector invocation/completed-response
boundaries, not HTTP-wire telemetry. `responded_at` uses that receipt boundary;
event timestamps remain source events. Missing source times remain UNKNOWN.
`recorded_at` and post-validation `verified_at` are local assembly/check clocks.

Source manifests pin full bytes, SHA-256 and Git blob IDs. Raw final package
member digests, exact control/harness/run/case, one marker/event and explicit
owned-root removal are needed before result reuse. Runner exit is not cleanup.

Revalidate C-020 from a materialized control checkpoint with Python 3.10+:

```bash
python3 validation/pp002-gate-c/observer.py --root . \
  --manifest validations/PP-002/GATE-C/C-020_MANIFEST.json \
  --ledger validations/PP-002/GATE-C/C-020_S01_ROLLOVER_CHECKPOINT.json \
  --output /tmp/c020-copy.json --result /tmp/c020-check.json
python3 -m unittest discover -s validation/pp002-gate-c -v
```

Outputs are exclusive-created; use new paths. The adapter has no network,
workflow/ref emission, retry, cancellation or product API capability.

## S02 durable-only recovery

Start a genuinely different conversation as PROTOCOL_PORTABILITY / PP-002 / S02
from the SESSION ROLLOVER envelope and C-020's immutable GitHub revision. S02 is
not a subagent pretending to be a new conversation and is not PC-003.
Treat any automatically exposed predecessor context as NON-INHERITED for this
experiment; facts must be recovered from the durable artifacts and new reads.

1. Resolve current `meta/project-control`; read authorization/route, PC-003
   succession, PP-002 assignment and C-020. Verify no incompatible authority
   change and all five protected refs; verify the Gate C operational ref/harness.
2. Recover context from `C-020_S01_ROLLOVER_CHECKPOINT.json`'s `input_manifest`
   and `rollover`: exact run/attempt/job IDs, source files, owner/closer and pins.
   Fetch every required source/code file from GitHub and verify its Git blob
   and digest. Do not depend on S01 scratch or conversation history.
3. Append C-030 recovery entry: inherited vs NON-INHERITED inventory and
   authority/custody findings; do not call the old nonterminal receipt current.
4. Fetch fresh run and jobs through normal configured GitHub access. Preserve
   raw source bodies and real invocation/receipt boundaries. Never replace
   missing times with assembly time. Check exact branch/harness/attempt/IDs.
5. Create a new manifest using the recovered intent/admin receipt paths and
   new run/job receipt files. Keep `verified_packages` empty until raw artifacts
   have actually been downloaded, identity/digest/manifest/count/cleanup checked.
6. Build and validate C-040 from that new manifest with this observer CLI before
   consuming its state. Existing S01 records remain immutable. A stale or
   inconsistent ledger does not permit retry or replacement.
7. C-050 records KEEP_OBSERVING if active; terminal SUCCESS requires raw
   evidence/effect verification before REUSE_RESULT; failure requires
   RECONCILE_EFFECT; material uncertainty requires BLOCK. No second run.
8. Fetch the sole run's artifact and decoded job log when available. Verify
   GitHub archive size/SHA-256/CRC, all final manifest members, marker count,
   source identity and explicit cleanup receipt. The expected artifact is
   `pp002-gate-c-20261029-01-C1-RUN_ID` with literal RUN_ID substituted.
9. Add the verified raw package directory as `verified_packages.C1`, create a
   fresh final source manifest and validate C-060. Reconcile retention/closer
   explicitly. The harness independently finalizes/cleans its already-issued
   bounded operation; S01 performs no active post-checkpoint action.
10. C-070 assesses genuine rollover and publishes the required terminal report
    with exactly GATE C PASS, GATE C REVISE or GATE C FAIL as its final line;
    proactively return to PROJECT_CONTROL / PC-003. Gate C does not prove actual
    quota exhaustion, involuntary crash or lost issuance acknowledgement.
    Final PROMOTE/REVISE/REJECT recommendation follows Gate C disposition.

The control append-only paths are `validations/PP-002/GATE-C/**` and the final
report `protocols/PP-002_GATE-C_REAL_SESSION_ROLLOVER_REPORT.md`; bounded adapter
changes require a new documented pin. Central state/registry edits belong to PC.
Every control publication uses expected-head/CAS, force=false, preserved frozen
blobs and protected refs. Incompatible changes or occupied output paths require
reconciliation, not overwrite.

## S01 stopping boundary

Before advancing the control ref that publishes C-020, S01 verifies the prepared
commit tree, all source/code hashes, ledger result and latest protected refs.
The successful guarded C-020 ref advance is S01's final tool action. Its positive
acknowledgement and exact publication SHA are transmitted in the return envelope.
S01 performs no post-publication read, poll, mutation, cancellation or cleanup.
S02 independently verifies publication/head/source custody on entry.

If the workflow finishes naturally before S02 starts, recover and verify that
result; do not repeat it. The maximum hold is 900 seconds, one job timeout is
18 minutes, and one owned runner-local root is cleaned by the original harness.
Actions evidence retention is 30 days; S02 copies raw evidence into Git. Keep the
Gate C branch for PC disposition. Historical ops/product refs, Generic Protocol
v1.0, PP-002 v2 and protocol adoption remain outside mutation authority.
