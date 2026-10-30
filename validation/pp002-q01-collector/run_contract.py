"""Bounded Q01 offline self-test runner. No network, package installation or live publisher."""
import argparse
from contextlib import redirect_stdout
from datetime import datetime, timezone
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import platform
import runpy
import subprocess
import sys
import time
import unittest

HERE = Path(__file__).resolve().parent
BASE = "validations/PP-002/Q01-COLLECTOR/Q01-IMPL-001"
R1 = "validation/pp002-gate-b-r1/"
C = "validation/pp002-gate-c/"


def encode(value):
    return (json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"), allow_nan=False)+"\n").encode()


def hashes(data):
    return dict(bytes=len(data), sha256=hashlib.sha256(data).hexdigest(),
                git_blob_sha=hashlib.sha1(b"blob "+str(len(data)).encode()+b"\0"+data).hexdigest())


def save(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("xb") as f:
        f.write(encode(value))


def verify(root, manifest):
    for name, expected in manifest["files"].items():
        p = root/name
        actual = hashes(p.read_bytes())
        if any(actual[k] != expected[k] for k in actual):
            raise RuntimeError("Pinned input changed: "+name)


def install_audit(root, output, events):
    roots = [root.resolve(), Path(sys.base_prefix).resolve()]
    read_files = {Path("/etc/os-release"), Path("/usr/lib/os-release")}
    output = output.resolve()
    original_run = subprocess.run

    def allowed_path(path, write=False, dir_fd=None):
        if isinstance(path, int):
            return
        p = Path(os.fsdecode(path))
        if not p.is_absolute() and dir_fd not in (None, -1):
            p = Path(os.readlink('/proc/self/fd/'+str(dir_fd)))/p
        p = p.resolve()
        if write:
            if not p.is_relative_to(output):
                events["write_denials"] += 1
                raise PermissionError("Write outside isolated output")
            events["write_events"] += 1
        elif not any(p.is_relative_to(r) for r in roots) and p not in read_files:
            events["read_denials"] += 1
            raise PermissionError("Read outside project/standard library")

    def audit(event, args):
        if event.startswith(("socket.", "urllib.", "http.client.")):
            events["network_denials"] += 1
            raise PermissionError("Offline execution")
        if event == "open":
            path, mode, flags = args
            write = bool((flags or 0) & (os.O_WRONLY|os.O_RDWR|os.O_CREAT|os.O_TRUNC|os.O_APPEND))
            allowed_path(path, write)
        elif event in ("os.remove", "os.rmdir", "os.mkdir"):
            index = 2 if event == 'os.mkdir' else 1
            allowed_path(args[0], True, args[index] if len(args)>index else None)
        elif event in ("os.rename", "os.link", "os.symlink"):
            # A synthetic test symlink is permitted inside output, never followed by the guard.
            allowed_path(args[1], True, args[3] if event=='os.rename' and len(args)>3 else
                         args[2] if event=='os.link' and len(args)>2 else None)
            if event == "os.rename":
                allowed_path(args[0], True, args[2] if len(args)>2 else None)
        elif event == "subprocess.Popen":
            argv = args[1]
            safe_python = isinstance(argv, (list,tuple)) and Path(argv[0]).resolve()==Path(sys.executable).resolve() and str(Path(__file__).resolve()) in argv
            safe_uname = isinstance(argv,(list,tuple)) and list(argv) in (["uname","-p"],["/bin/uname","-p"],["/usr/bin/uname","-p"])
            if not (safe_python or safe_uname):
                events["process_denials"] += 1
                raise PermissionError("Unapproved offline child command")
            events["process_events"] += 1
        elif event in ("os.system", "os.exec", "os.posix_spawn", "os.fork"):
            events["process_denials"] += 1
            raise PermissionError("Unapproved process capability")
    sys.addaudithook(audit)

    def bounded_run(argv, *args, **kwargs):
        if not isinstance(argv, list) or Path(argv[0]).resolve()!=Path(sys.executable).resolve():
            raise PermissionError("Only bounded Python regression commands")
        nested = list(argv[1:])
        if not nested:
            raise PermissionError("Empty child command")
        config = dict(root=str(root), output=str(output), argv=nested,
                      audit=str(output/("nested-audit-"+str(events["process_events"])+".json")))
        return original_run([sys.executable, "-B", str(Path(__file__).resolve()), "--worker", json.dumps(config)],
                            *args, **kwargs)
    subprocess.run = bounded_run


def worker(config):
    root, output = Path(config["root"]).resolve(), Path(config["output"]).resolve()
    events = dict(network_denials=0, process_denials=0, read_denials=0, write_denials=0,
                  process_events=0, write_events=0)
    install_audit(root, output, events)
    status = 0
    try:
        argv = config["argv"]
        if argv[0] == "SELFTEST":
            if config.get('archive_root'):
                os.environ['Q01_CASE_ARCHIVE'] = config['archive_root']
            sys.path.insert(0,str(HERE))
            spec=importlib.util.spec_from_file_location("q01_contract_tests",HERE/"test_guard.py")
            m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
            suite=unittest.defaultTestLoader.loadTestsFromTestCase(m.Contract)
            result=unittest.TextTestRunner(verbosity=2).run(suite)
            rows=sorted(m.RESULTS,key=lambda x:(x["case"],x["profile"]))
            save(Path(config["semantic_output"]),rows)
            save(Path(config["test_output"]),dict(tests_run=result.testsRun,
                 failures=len(result.failures),errors=len(result.errors),successful=result.wasSuccessful(),
                 family_count=len({x["family"] for x in rows}),case_profile_results=len(rows)))
            status=0 if result.wasSuccessful() else 1
        elif argv[:2] == ["-m","unittest"]:
            # Only the two original suites can be selected.
            suitepath=Path(argv[argv.index("-s")+1]).resolve()
            if suitepath not in ((root/R1).resolve(),(root/C).resolve()):
                raise PermissionError("Unknown regression suite")
            sys.path.insert(0,str(suitepath));sys.argv=["unittest"]+argv[2:]
            runpy.run_module("unittest",run_name="__main__")
        else:
            target=Path(argv[0]).resolve()
            allowed={(root/R1/"run_checks.py").resolve(),(root/R1/"revalidate.py").resolve(),
                     (root/C/"observer.py").resolve()}
            if target not in allowed:
                raise PermissionError("Unknown regression program")
            sys.path.insert(0,str(target.parent));sys.argv=argv
            runpy.run_path(str(target),run_name="__main__")
    except SystemExit as exc:
        status=exc.code or 0
    finally:
        save(Path(config["audit"]),events)
    return status


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("--input-root")
    p.add_argument("--output")
    p.add_argument("--worker")
    a=p.parse_args()
    if a.worker:
        return worker(json.loads(a.worker))
    if not a.input_root or not a.output:
        p.error("--input-root and --output required")
    root=Path(a.input_root).resolve();out=Path(a.output).resolve()
    if not out.is_relative_to(root/BASE):
        raise ValueError("Output must be a new directory in authorized evidence root")
    out.mkdir(parents=True,exist_ok=False)
    temp=out/"_tmp";temp.mkdir()
    manifest=json.loads((root/BASE/"input-manifest.json").read_text())
    verify(root,manifest)
    pins={str(x.relative_to(root)):hashes(x.read_bytes()) for x in HERE.glob("*.py")}
    save(out/"implementation-pins.json",pins)
    commands=[];started=time.monotonic()
    env={"PYTHONDONTWRITEBYTECODE":"1","PYTHONHASHSEED":"0","TZ":"UTC",
         "TMPDIR":str(temp),"Q01_INPUT_ROOT":str(root),
         "Q01_REGRESSION_ROOT":str(out/"regression"),
         "PP002_R1_INPUT_ROOT":str(root),
         "PP002_R1_MANIFEST":str(root/"validations/PP-002/GATE-B-R1/input-manifest.json")}
    def run(label,argv,expected=0,extra=None):
        config=dict(root=str(root),output=str(out),argv=argv,
                    audit=str(out/(label+".audit.json")))
        if extra:config.update(extra)
        real=[sys.executable,"-B",str(Path(__file__).resolve()),"--worker",json.dumps(config)]
        before=datetime.now(timezone.utc).isoformat()
        r=subprocess.run(real,capture_output=True,text=True,env=env,cwd=root,timeout=120)
        after=datetime.now(timezone.utc).isoformat()
        for suffix,text in (("stdout",r.stdout),("stderr",r.stderr)):
            with (out/(label+"."+suffix+".log")).open("x") as f:f.write(text)
        commands.append(dict(label=label,argv=argv,started_at=before,receipt_at=after,
                             exit_code=r.returncode,expected_exit=expected))
        save(out/("commands-"+label+".json"),commands[-1])
        if r.returncode!=expected:
            raise RuntimeError(label+" failed; inspect "+str(out/(label+".stderr.log")))
    run("r1",[str(root/R1/"run_checks.py"),"--input-root",str(root),"--manifest",
              str(root/"validations/PP-002/GATE-B-R1/input-manifest.json"),"--output",str(out/"regression/r1")])
    for name,ledger,manifest_name in (
        ("c020","C-020_S01_ROLLOVER_CHECKPOINT.json","C-020_MANIFEST.json"),
        ("c060","C-060_TERMINAL_RECONCILIATION.json","C-060_MANIFEST.json")):
        run(name,[str(root/C/"observer.py"),"--root",str(root),"--manifest",str(root/"validations/PP-002/GATE-C"/manifest_name),
                  "--ledger",str(root/"validations/PP-002/GATE-C"/ledger),
                  "--output",str(out/("regression/"+name+"-copy.json")),
                  "--result",str(out/("regression/"+name+"-result.json"))])
    run("gate-c-unit",["-m","unittest","discover","-s",str(root/C),"-p","test_*.py","-v"])
    for name in ("replay-a","replay-b"):
        (out/name).mkdir()
        run(name,["SELFTEST"],extra={"semantic_output":str(out/name/"semantic-results.json"),
                                   "test_output":str(out/name/"unit-result.json"),
                                   'archive_root':str(out/'fixtures') if name=='replay-a' else None})
    left=(out/"replay-a/semantic-results.json").read_bytes();right=(out/"replay-b/semantic-results.json").read_bytes()
    if left!=right:raise RuntimeError("Semantic replay differs")
    rows=json.loads(left)
    families={x["family"] for x in rows}
    if families!={"F"+str(i).zfill(2) for i in range(1,32)}:raise RuntimeError("Missing family coverage")
    blocked=[x for x in rows if x.get("expected")=="BLOCK_CALLBACK"]
    if any(x["callback_invocations"]!=0 for x in blocked):raise RuntimeError("Blocked callback invoked")
    verify(root,manifest)
    for name,wanted in pins.items():
        if hashes((root/name).read_bytes())!=wanted:raise RuntimeError("Implementation changed during test")
    audits=[json.loads(x.read_text()) for x in sorted(out.glob("*audit*.json"))]
    if any(any(v for k,v in x.items() if k.endswith("denials")) for x in audits):
        raise RuntimeError("Offline audit denied a capability; inspect records")
    coverage={f:[x["case"]+"/"+x["profile"] for x in rows if x["family"]==f] for f in sorted(families)}
    save(out/"coverage.json",coverage)
    receipt=dict(status="SELF_TEST_COMPLETE",independent_qa="NOT_PERFORMED / NOT_AUTHORIZED",
                 python=sys.version,platform=platform.platform(),commands=commands,
                 semantic_output=hashes(left),replay_byte_identical=True,
                 families=len(families),case_profile_results=len(rows),
                 blocked_callback_cases=len(blocked),blocked_callback_invocations=0,
                 positive_fake_callback_invocations=sum(x.get("callback_invocations",0) for x in rows if x.get("expected")=="ALLOW_FAKE"),
                 input_files_verified=len(manifest["files"]),source_files_pinned=len(pins),
                 elapsed_seconds=round(time.monotonic()-started,6),
                 live_external_operations=0,offline_audit=audits,
                 write_scope=str(out),source_and_historical_bytes_unchanged=True)
    save(out/"execution-receipt.json",receipt)
    print(json.dumps({k:receipt[k] for k in ("status","families","case_profile_results","blocked_callback_invocations","replay_byte_identical")}))
    return 0


if __name__=="__main__":
    sys.exit(main())

