"""Disposable PP-002 Gate B effects. No network, product checkout, or product API."""
import datetime
import hashlib
import json
import os
import pathlib
import shutil
import sys
import time

CONTROL = "930dcab160df28c7606991cff4388fea29f351cf"
NAMESPACE = "pp002-gate-b-r2-20261029-01"
BRANCH = "refs/heads/ops/pp-002-gate-b-r2-actions"


def now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def paths(case):
    assert case in ("B1", "B2", "B3")
    assert os.environ["GITHUB_REF"] == BRANCH
    assert os.environ["GITHUB_RUN_ATTEMPT"] == "1", "No rerun effects permitted"
    root = pathlib.Path(os.environ["RUNNER_TEMP"]).resolve() / NAMESPACE / case
    out = pathlib.Path(os.environ["GITHUB_WORKSPACE"]).resolve() / "gate-b-r2-evidence" / case
    out.mkdir(parents=True, exist_ok=True)
    return root, out


def save(out, name, value):
    target = out / name
    with target.open("x", encoding="utf-8") as f:
        json.dump(value, f, indent=2, sort_keys=True)
        f.write("\n")


def event(out, kind, **fields):
    value = {"time": now(), "event": kind, **fields}
    with (out / "events.jsonl").open("a", encoding="utf-8") as f:
        f.write(json.dumps(value, sort_keys=True) + "\n")
    print(json.dumps(value, sort_keys=True), flush=True)


def metadata(case):
    return {"namespace": NAMESPACE, "case": case, "control_sha": CONTROL,
            "harness_sha": os.environ["GITHUB_SHA"], "run_id": os.environ["GITHUB_RUN_ID"],
            "run_attempt": os.environ["GITHUB_RUN_ATTEMPT"], "job_key": os.environ["GITHUB_JOB"],
            "closer": "PROTOCOL_PORTABILITY / PP-002 / S01", "product_executed": False,
            "product_mutated": False, "emission_channel": "authorized operational branch push -> Actions"}


def main():
    command, case = sys.argv[1:3]
    root, out = paths(case)
    meta = metadata(case)
    if command == "start":
        root.mkdir(parents=True, exist_ok=False)
        marker = {**meta, "logical_operation_id": case + "-EFFECT", "created_at": now(),
                  "effect_kind": "partial" if case == "B3" else "unique-marker"}
        encoded = (json.dumps(marker, sort_keys=True) + "\n").encode()
        with (root / "effect.marker").open("xb") as f:
            f.write(encoded)
        save(out, "marker.json", marker)
        save(out, "startup.json", {**meta, "root": str(root), "started_at": now(),
                                  "marker_sha256": hashlib.sha256(encoded).hexdigest(),
                                  "exclusive_marker_count": len(list(root.glob("effect.marker")))})
        event(out, "effect_created", marker_sha256=hashlib.sha256(encoded).hexdigest(), count=1)
    elif command == "hold":
        seconds = int(sys.argv[3])
        assert 1 <= seconds <= 660
        assert (root / "effect.marker").is_file()
        event(out, "hold_started", seconds=seconds)
        deadline = time.monotonic() + seconds
        while time.monotonic() < deadline:
            time.sleep(min(10, max(0, deadline - time.monotonic())))
            event(out, "heartbeat")
        event(out, "hold_finished")
    elif command == "fail-child":
        assert case == "B3" and (root / "effect.marker").is_file()
        receipt = {**meta, "logical_operation_id": "B3-CHILD", "parent_operation_id": "B3-JOB",
                   "finished_at": now(), "lifecycle": "CONFIRMED_DONE", "outcome": "FAILURE",
                   "effect": "EFFECT_CONFIRMED", "cleanup": "CLEANUP_REQUIRED",
                   "expected_exit_code": 23, "intentional": True, "root": str(root)}
        save(out, "partial.json", receipt)
        event(out, "child_failed_intentionally", exit_code=23)
        sys.exit(23)
    elif command == "cleanup":
        before = root.exists()
        if before:
            marker = json.loads((root / "effect.marker").read_text())
            assert marker["namespace"] == NAMESPACE and marker["case"] == case
            assert marker["run_id"] == os.environ["GITHUB_RUN_ID"]
            shutil.rmtree(root)
        removed = not root.exists()
        save(out, "cleanup.json", {**meta, "observed_at": now(), "root": str(root),
                                  "owned_marker_checked": before, "root_existed_before": before,
                                  "removed": removed, "cleanup": "CLEANUP_CONFIRMED" if removed and before else "CLEANUP_UNKNOWN"})
        event(out, "cleanup_checked", removed=removed, owned_marker_checked=before)
        assert removed and before, "Explicit owned-root cleanup proof required"
    elif command == "finish":
        cleanup = json.loads((out / "cleanup.json").read_text())
        events = [json.loads(line) for line in (out / "events.jsonl").read_text().splitlines()]
        assert sum(e["event"] == "effect_created" for e in events) == 1
        assert cleanup["cleanup"] == "CLEANUP_CONFIRMED"
        if case == "B3":
            assert json.loads((out / "partial.json").read_text())["expected_exit_code"] == 23
        save(out, "final.json", {**meta, "finished_at": now(), "effect_creation_count": 1,
                                "duplicate_effect_count": 0, "root_removed": True,
                                "expected_child_outcome": "FAILURE" if case == "B3" else "NOT_APPLICABLE",
                                "parent_external_outcome": "OBSERVE_EXTERNALLY",
                                "harness_checks": "PASS"})
        members = {}
        for p in sorted(out.iterdir()):
            if p.is_file():
                data = p.read_bytes()
                members[p.name] = {"bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()}
        save(out, "manifest.json", {**meta, "files": members})
        print(json.dumps({"case": case, "harness_checks": "PASS", "files": len(members)}))
    else:
        raise ValueError("Unknown command")


if __name__ == "__main__":
    main()
