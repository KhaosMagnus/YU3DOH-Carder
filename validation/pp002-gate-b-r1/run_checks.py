"""Run the bounded offline revalidation and retain append-only local receipts."""
import argparse
from collections import Counter
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import platform
import re
import subprocess
import sys


def now():
    return datetime.now(timezone.utc).isoformat()


def save(path, value):
    with path.open("x", encoding="utf-8") as f:
        json.dump(value, f, sort_keys=True, indent=2)
        f.write("\n")


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--input-root", default=".")
    p.add_argument("--manifest", required=True)
    p.add_argument("--output", required=True)
    args = p.parse_args()
    out = Path(args.output)
    out.mkdir(parents=True, exist_ok=True)
    here = Path(__file__).resolve().parent
    engine = here / "revalidate.py"
    common = [sys.executable, str(engine), "--input-root", args.input_root, "--manifest", args.manifest]
    commands = []

    def run(label, argv, expected, env=None):
        started = now()
        result = subprocess.run(argv, capture_output=True, text=True, env=env)
        finished = now()
        for suffix, text in (("stdout", result.stdout), ("stderr", result.stderr)):
            with (out / (label + "." + suffix + ".log")).open("x", encoding="utf-8") as f:
                f.write(text)
        commands.append({"label": label, "argv": argv, "started_at": started,
                         "finished_at": finished, "exit_code": result.returncode, "expected_exit": expected})
        if result.returncode != expected:
            raise RuntimeError(label + ": " + result.stderr)
        return result

    original = Path(args.input_root) / "validations/PP-002/GATE-B/010_EMITTED.json"
    negative = run("negative-010", common + ["validate", "--ledger", str(original),
                                            "--result", str(out / "negative-result.json")], 1)
    run("derive-corrected", common + ["derive", "--output", str(out / "corrected-derivation.json")], 0)
    positive = run("positive-corrected", common + ["validate", "--ledger", str(out / "corrected-derivation.json"),
                                                 "--result", str(out / "positive-result.json")], 0)
    repeat = run("deterministic-repeat", common + ["validate", "--ledger", str(out / "corrected-derivation.json")], 0)
    assert positive.stdout == repeat.stdout, "Validator result must be byte-identical for identical input"
    nr, pr = json.loads(negative.stdout), json.loads(positive.stdout)
    coverage = []
    for oid in ("GB-INTENT-PUBLISH", "GB-OPS-CREATE", "GB-EMIT", "B1-EFFECT", "B1-HOLD"):
        hits = [v for v in nr["violations"] if v["logical_operation_id"] == oid
                and v["violated_invariant"] == "NOT_DONE_CONTRADICTS_EXECUTION"]
        assert hits, oid
        coverage.append({"logical_operation_id": oid, "detected": True, "violations": hits})
    times = [v for v in nr["violations"] if v["violated_invariant"] == "OBSERVATION_TIME_CONFLATED_WITH_ASSEMBLY"]
    assert times
    coverage.append({"logical_operation_id": "GB-WORKFLOW", "defect": "GB-D02", "detected": True, "violations": times})
    assert pr["result"] == "PASS" and pr["invariant_violation_count"] == 0
    save(out / "mandatory-coverage.json", {"required_checks": 6, "detected": 6, "coverage": coverage})
    env = dict(os.environ, PP002_R1_INPUT_ROOT=args.input_root, PP002_R1_MANIFEST=args.manifest)
    unit = run("unit-tests", [sys.executable, "-m", "unittest", "discover", "-s", str(here), "-p", "test_*.py", "-v"], 0, env)
    unit_count = int(re.search(r"Ran (\d+) tests", unit.stderr).group(1))
    corrected = json.loads((out / "corrected-derivation.json").read_text())
    receipt = {"recorded_at": now(), "python": sys.version, "platform": platform.platform(),
               "input_control_sha": "b30b5b30b3526f92598e9727a8aec7a57be4e4b9", "commands": commands,
               "validator_sha256": hashlib.sha256(engine.read_bytes()).hexdigest(),
               "runner_sha256": hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
               "negative_expected_exit": 1, "negative_actual_exit": 1,
               "negative_violations": nr["invariant_violation_count"],
               "positive_violations": pr["invariant_violation_count"], "corrected_operations": pr["operation_count"],
               "mandatory_checks_detected": 6, "repeated_positive_output_byte_equal": True,
               "lifecycle_counts": dict(Counter(x["lifecycle"] for x in corrected["observed_state"])),
               "unit_tests": unit_count, "unit_exit_code": unit.returncode,
               "external_experimental_operations_emitted": 0, "Actions_launch_rerun_cancel": 0,
               "scope": "Offline computation only; no workflow or operational ref action"}
    save(out / "execution-receipt.json", receipt)
    print(json.dumps({k: receipt[k] for k in ("negative_violations", "positive_violations", "mandatory_checks_detected",
                                            "corrected_operations", "unit_tests", "external_experimental_operations_emitted")}, sort_keys=True))


if __name__ == "__main__":
    main()
