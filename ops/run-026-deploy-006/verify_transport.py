"""Transport frozen DEV-008 bytes; never execute or modify product code."""
import datetime
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import shutil
import stat
import urllib.request
import zipfile

REPO = "KhaosMagnus/YU3DOH-Carder"
CONTROL = "7e4a0d68f148ec6216bb830a654d87ad012bc606"
SOURCE = "6e9f503ed0e05016de50da5630cdeaeb6948725e"
CANDIDATE = "e11579950ef7ed20e4b6eeee88f9c3597c1f074b"
BASELINE = "dd968ba05e579461962bbcced0e9cae3cd4c3d23"
MAIN = "54cc3aad246c89a29f2a18be63c539db68cae041"
ARCHIVE_SHA = "7bf9ef2fcaa8284457234b6fcfff229b98650955f19af644b6b17d9f91ba8d3c"
EXPECTED_REFS = {"feature/workspace-run-026": CANDIDATE,
                 "feature/workspace-v0.1": BASELINE, "main": MAIN}
OUT = Path(os.environ.get("TRANSPORT_OUTPUT", "transport-output"))


def utc():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def digest(path):
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


def api(path):
    request = urllib.request.Request(
        f"https://api.github.com/repos/{REPO}/{path}",
        headers={"Authorization": "Bearer " + os.environ["GH_TOKEN"],
                 "Accept": "application/vnd.github+json",
                 "X-GitHub-Api-Version": "2022-11-28"})
    with urllib.request.urlopen(request, timeout=90) as response:
        return json.load(response)


def refs():
    return {name: api("git/ref/heads/" + name)["object"]["sha"]
            for name in EXPECTED_REFS}


def safe_path(value):
    p = PurePosixPath(value)
    if not value or p.is_absolute() or ".." in p.parts or "\\" in value:
        raise ValueError(f"Unsafe archive/manifest path: {value!r}")
    return p


def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2) + "\n", encoding="utf-8")


def verify_members(raw, manifest, inventory, result):
    files = manifest["files"]
    result["manifest_entry_count"] = len(files)
    if manifest["candidate"] != CANDIDATE or len(files) != 186:
        raise ValueError("Manifest candidate/count mismatch")
    # Retain the ZIP's original hierarchy; locate its unique evidence root.
    roots = [p.parent for p in raw.rglob("summary.json")
             if all((p.parent / safe_path(name)).is_file() for name in files)]
    if len(roots) != 1:
        raise ValueError(f"Expected one complete evidence root; found {len(roots)}")
    root = roots[0]
    result["evidence_root"] = str(root.relative_to(OUT))
    checks = []
    for name, expected in files.items():
        member = root / safe_path(name)
        actual_bytes = member.stat().st_size if member.is_file() else None
        actual_sha = digest(member) if member.is_file() else None
        checks.append({"path": name, "expected_bytes": expected["bytes"],
                       "actual_bytes": actual_bytes, "expected_sha256": expected["sha256"],
                       "actual_sha256": actual_sha,
                       "passed": actual_bytes == expected["bytes"] and actual_sha == expected["sha256"]})
    result["member_checks"] = checks
    result["passed_member_count"] = sum(c["passed"] for c in checks)
    result["failed_member_count"] = len(checks) - result["passed_member_count"]
    expected_archive_files = {str((root / name).relative_to(raw)) for name in files}
    actual_archive_files = {str(p.relative_to(raw)) for p in raw.rglob("*") if p.is_file()}
    extras = sorted(actual_archive_files - expected_archive_files)
    result["unexpected_files"] = extras
    # A manifest cannot hash itself. If retained in the ZIP, compare it to the pinned source.
    permitted_manifest = str((root / "manifest.json").relative_to(raw))
    unexplained = list(extras)
    if permitted_manifest in unexplained and (root / "manifest.json").read_bytes() == (OUT / "manifest.json").read_bytes():
        unexplained.remove(permitted_manifest)
        result["unmanifested_source_manifest_verified"] = True
    result["unexplained_files"] = unexplained
    visual_checks = []
    result["visual_entry_count"] = len(inventory)
    for name in inventory:
        p = root / safe_path(name)
        png = p.is_file() and p.read_bytes()[:8] == b"\x89PNG\r\n\x1a\n"
        visual_checks.append({"path": name, "manifest_member": name in files,
                              "exists": p.is_file(), "png_signature": png,
                              "passed": name in files and png})
    result["visual_checks"] = visual_checks
    result["missing_visual_count"] = sum(not v["passed"] for v in visual_checks)
    result["duplicate_visual_count"] = len(inventory) - len(set(inventory))
    for name in ("summary.json", "visual-inventory.json"):
        if (root / name).read_bytes() != (OUT / name).read_bytes():
            raise ValueError(f"Pinned source and extracted {name} differ")
    if json.loads((root / "summary.json").read_text())["sha"] != CANDIDATE:
        raise ValueError("Extracted summary candidate mismatch")
    required = [f"gates/{n:02}.log" for n in range(3, 9)] + [
        "firefox-os.json", "architecture.json", "environment.json", "preflight.json",
        "final-product-refs.txt", "gates/gate-results.json",
        "theme-chromium/Chromium-evidence.json", "theme-firefox/Firefox-evidence.json",
        "f04-light/evidence.json", "f04-dark/evidence.json", "additional-surfaces/evidence.json",
        "theme-chromium/workspace-before.json", "theme-chromium/workspace-after.json",
        "theme-firefox/workspace-before.json", "theme-firefox/workspace-after.json"]
    result["required_raw_members_missing"] = [p for p in required if p not in files or not (root / p).is_file()]
    result["synthetic_screenshots"] = [p for p in inventory if "OVERFRAME-only-synthetic" in p]
    if (result["failed_member_count"] or result["missing_visual_count"] or len(inventory) != 92
            or result["duplicate_visual_count"] or unexplained or result["required_raw_members_missing"]
            or not result["synthetic_screenshots"]):
        raise ValueError("Raw member / visual / required-evidence validation failed; see complete checks")


def run():
    OUT.mkdir(parents=True, exist_ok=False)
    result = {"schema": "DEPLOY-006-transport-v1", "started_at": utc(),
              "authorization_control_sha": CONTROL, "source_control_sha": SOURCE,
              "candidate_sha": CANDIDATE, "baseline_sha": BASELINE, "main_sha": MAIN,
              "operational_harness_sha": os.environ["GITHUB_SHA"],
              "actions_run_id": int(os.environ["GITHUB_RUN_ID"]),
              "actions_run_attempt": int(os.environ["GITHUB_RUN_ATTEMPT"]),
              "job_key": os.environ["GITHUB_JOB"],
              "artifact_name": "RUN-026-DEPLOY-006-raw-evidence-" + os.environ["GITHUB_RUN_ID"],
              "archive_byte_size": None, "archive_sha256": None,
              "zip_integrity_result": "NOT_RUN", "extraction_result": "NOT_RUN",
              "manifest_entry_count": None, "passed_member_count": 0, "failed_member_count": None,
              "visual_entry_count": None, "missing_visual_count": None, "unexpected_files": [],
              "status": "EVIDENCE RECOVERY BLOCKED", "product_execution": False,
              "product_mutation": False, "qa_verdict": None}
    errors = []
    try:
        result["initial_product_refs"] = refs()
        if result["initial_product_refs"] != EXPECTED_REFS:
            raise ValueError("Live product refs do not match frozen custody")
        jobs = api(f"actions/runs/{os.environ['GITHUB_RUN_ID']}/jobs")["jobs"]
        matching = [j["id"] for j in jobs if j["name"] == "Transport frozen DEV-008 evidence"]
        if len(matching) != 1:
            raise ValueError("Cannot identify unique Actions job ID")
        result["actions_job_id"] = matching[0]
        downloads = []
        for name in ("RUN-026_EVIDENCE.zip", "manifest.json", "visual-inventory.json", "summary.json"):
            url = f"https://raw.githubusercontent.com/{REPO}/{SOURCE}/validations/RUN-026/DEV-008/{name}"
            with urllib.request.urlopen(url, timeout=180) as response, (OUT / name).open("wb") as stream:
                shutil.copyfileobj(response, stream)
            downloads.append({"path": name, "source_url": url, "bytes": (OUT / name).stat().st_size,
                              "sha256": digest(OUT / name)})
        result["downloads"] = downloads
        archive = OUT / "RUN-026_EVIDENCE.zip"
        result["archive_byte_size"] = archive.stat().st_size
        result["archive_sha256"] = digest(archive)
        if result["archive_byte_size"] != 22524792 or result["archive_sha256"] != ARCHIVE_SHA:
            raise ValueError("Original archive size/SHA-256 mismatch")
        raw = OUT / "raw"
        raw.mkdir()
        with zipfile.ZipFile(archive) as z:
            names = z.namelist()
            if len(names) != len(set(names)):
                raise ValueError("Duplicate ZIP entries")
            for entry in z.infolist():
                safe_path(entry.filename)
                if stat.S_ISLNK(entry.external_attr >> 16):
                    raise ValueError("Symbolic link in ZIP")
            bad = z.testzip()
            result["zip_integrity_result"] = "PASS" if bad is None else "FAIL: " + bad
            if bad is not None:
                raise ValueError("ZIP CRC integrity failed")
            z.extractall(raw)
        result["extraction_result"] = "PASS"
        verify_members(raw, json.loads((OUT / "manifest.json").read_text()),
                       json.loads((OUT / "visual-inventory.json").read_text()), result)
        result["integrity_verified"] = True
    except Exception as error:
        errors.append(f"{type(error).__name__}: {error}")
    finally:
        try:
            result["final_product_refs"] = refs()
            result["product_ref_custody_unchanged"] = result["final_product_refs"] == EXPECTED_REFS == result.get("initial_product_refs")
            if not result["product_ref_custody_unchanged"]:
                errors.append("Product ref custody mismatch")
        except Exception as error:
            errors.append(f"Final custody unavailable: {type(error).__name__}: {error}")
        result["errors"] = errors
        result["finished_at"] = utc()
        if not errors and result.get("integrity_verified"):
            result["status"] = "RAW INTEGRITY VERIFIED; ACTIONS ARTIFACT RETRIEVAL PENDING"
        write_json(OUT / "transport-verification.json", result)
        print(json.dumps({k: v for k, v in result.items() if k not in ("member_checks", "visual_checks")}, indent=2))
    if errors:
        raise SystemExit(1)


if __name__ == "__main__":
    run()
