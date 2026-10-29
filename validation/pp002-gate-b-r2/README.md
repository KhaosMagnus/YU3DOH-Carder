# B-R2 bounded live receipt adapter

This successor leaves B-R1 `revalidate.py` unchanged and requires SHA-256
`0ebe717cb4830d376668a9d3ac193fd026399279c09a68af656e04d566247633` before loading it.
The exact B-R1 `validate` function remains the core checker. Its experiment
constants and receipt-binding/expected-state adapter are supplied for B-R2.
The observed-field vocabulary adds `supplemental_source_ids` for raw package
custody. No lifecycle/outcome/effect/evidence/cleanup/acknowledgement enum changes.

Bounded delta: source-integrity-checked live connector receipts replace the
historical 010/060 timing adapter; raw workflow conclusion is read independently
from children; verified artifact package manifests, marker identity/count and
owned-root cleanup can support final reuse/cleanup. Unknown children stay
uncertain. A separate action check forbids retry/replacement and requires raw
package verification for successful job/effect reuse. Input identity, attempt,
branch, exact harness, intent, supplemental custody and source bytes fail closed.
The historical defective 010 still uses the unchanged original B-R1 adapter and
checker; its 53 violations and six mandatory controls are preserved.

`requested_at` is connector invocation issuance; `receipt_at`/`responded_at` is
completed connector response receipt, captured immediately at that boundary.
These do not claim HTTP wire-level telemetry. GitHub event fields remain
separate. Local assembly/verification clocks never replace a receipt time.
Missing original times are UNKNOWN. Verification is stamped after validation.

Every source manifest pins raw input bytes and JSON-pointer source identities.
Every material checkpoint runs the same core checker before publication/use.
Build and result files are exclusive-created; failed validation cannot authorize
scenario progression. This program has no network or external execution API.

Reproduce a published checkpoint into new output files:

```bash
python3 validation/pp002-gate-b-r2/observer.py --root . \
  --manifest validations/PP-002/GATE-B-R2/R2-010_MANIFEST.json \
  --ledger validations/PP-002/GATE-B-R2/R2-010_EMITTED.json \
  --output /tmp/r2-ledger-copy.json --result /tmp/r2-validation.json
python3 -m unittest discover -s validation/pp002-gate-b-r2 -v
```

The synthetic unit fixtures emit no workflow or experimental marker. Live
semantics are evaluated only by the separately authorized single B-R2 run.
No Generic Protocol / PP-002 v2 modification or Gate C authority follows.
