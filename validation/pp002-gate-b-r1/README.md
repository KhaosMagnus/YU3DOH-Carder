# PP-002 Gate B-R1 offline consistency revalidation

Requires Python 3.10+ standard library only. No package installation, networking,
product execution, workflow dispatch, rerun, cancellation or ref movement exists
in the validator or runner. `run_checks.py` spawns only this local validator and
the local unittest suite.

From a checkout of the published **control** commit, use a fresh output directory:

```bash
python3 validation/pp002-gate-b-r1/run_checks.py \
  --input-root . \
  --manifest validations/PP-002/GATE-B-R1/input-manifest.json \
  --output /tmp/pp002-r1-recheck
```

The negative validator exits **1 intentionally**; the orchestrator expects it.
The corrected positive validator exits 0 with zero violations. All outputs are
created exclusively; an occupied output filename is never overwritten.

To revalidate either fixture with the **same** checker directly:

```bash
python3 validation/pp002-gate-b-r1/revalidate.py --input-root . \
  --manifest validations/PP-002/GATE-B-R1/input-manifest.json \
  validate --ledger validations/PP-002/GATE-B/010_EMITTED.json

python3 validation/pp002-gate-b-r1/revalidate.py --input-root . \
  --manifest validations/PP-002/GATE-B-R1/input-manifest.json \
  validate --ledger validations/PP-002/GATE-B-R1/corrected-derivation.json
```

The derivation reconstructs the **initial historical receipt view**. It does not
describe current live jobs. Each operation binds to its own JSON pointer in the
frozen raw receipt blocks. Intent supplies identity/topology only. Missing child
receipts become UNCERTAIN/UNKNOWN; explicit pending child steps may support
nonstart. Later terminal/cleanup facts are never projected into this view.

The five D01 contradictions are independently inferred from raw publication,
branch/update acknowledgements and B1 step data. The checker does not consume
060's D01 diagnostic list as its verdict. For original query response times it
does use 060's explicit **later durable timing attestation**, cited separately
through `time_source_id`. No original request time is reconstructed unless it
exists in an operation acknowledgement. Missing receipt times stay UNKNOWN.

`recorded_at` is local assembly time. By default `verified_at` is captured after
the derivation's consistency check. Neither becomes a source observation time.
`derive --recorded-at ... --verified-at ...` may reproduce archived metadata;
state inference and validation output are deterministic for identical inputs.

The input manifest pins every existing Gate B input's full bytes, SHA-256 and
Git blob identity at the authorized control SHA. Tests alter only in-memory
copies or disposable local test copies, never the frozen source files.

This bounded adapter validates the captured Gate B vocabulary/receipts. It is
not a production observer, a scheduler, a freshness threshold policy or proof
of a corrected live interruption experiment. No further live authority follows.
