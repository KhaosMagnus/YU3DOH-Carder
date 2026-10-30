"""F01-F31 offline contract. Oracles below are raw-fact assertions, not guard-derived expectations."""
from contextlib import redirect_stderr
from copy import deepcopy
import hashlib
import io
import json
import os
from pathlib import Path
import tempfile
import unittest

import collector
import guard as g

ROOT = Path(os.environ.get("Q01_INPUT_ROOT", Path(__file__).resolve().parents[2])).resolve()
EVIDENCE = "validations/PP-002/Q01-COLLECTOR/Q01-IMPL-001"
REGRESSION = Path(os.environ.get('Q01_REGRESSION_ROOT', ROOT / EVIDENCE / 'regression'))
CONTROL = "565a197ce19d3ed140b002e1d709644cfbdda79e"
COMMIT = "1" * 40
OTHER = "2" * 40
REPO = "KhaosMagnus/YU3DOH-Carder"
STAMP = "2026-10-29T18:42:51.234Z"
RECEIPT = "2026-10-29T18:42:51.743Z"
RESULTS = []


def archive_fixture(label, profile, f, bundle):
    name = os.environ.get('Q01_CASE_ARCHIVE')
    if not name:
        return
    archive = Path(name)
    (archive/'sources').mkdir(parents=True, exist_ok=True)
    mappings = []
    for source in bundle['sources']:
        raw = (f.root/source['local_path']).read_bytes()
        key = hashlib.sha256(raw).hexdigest()
        target = archive/'sources'/key
        if target.exists():
            assert target.read_bytes() == raw
        else:
            with target.open('xb') as handle:
                handle.write(raw)
        mappings.append(dict(local_path=source['local_path'], archive_source='sources/'+key,
                             actual_pins=pin(raw), declared_source_id=source['source_id']))
    out = archive/(label+'--'+profile+'.json')
    with out.open('xb') as handle:
        handle.write(encoded(dict(fixture_origin='RETAINED_PLUS_SYNTHETIC_CONTRACT',
                                  case=label, profile=profile, bundle=bundle, materialization=mappings)))


def encoded(v):
    return (json.dumps(v, sort_keys=True, ensure_ascii=False, separators=(",", ":"), allow_nan=False) + "\n").encode()


def pin(data):
    return {"bytes": len(data), "sha256": hashlib.sha256(data).hexdigest(),
            "git_blob_sha": hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest()}


def unknown(reason="not retained"):
    return dict(value="UNKNOWN", source_id="UNKNOWN", pointer="UNKNOWN",
                capture_origin="UNKNOWN", reason=reason)


class Fixture:
    def __init__(self):
        self.tmp = tempfile.TemporaryDirectory(prefix="q01-fixture-")
        self.root = Path(self.tmp.name)
        self.serial = 0
        self.b = dict(schema_version="Q01-bundle-v1", bundle_id="synthetic-Q01",
                      authority_control_sha=CONTROL, authority_artifact="control/Q01-offline-only",
                      allowed_output_root="validations/synthetic", accountable_closer="PP-002",
                      sources=[], retrievals=[], locator_reconciliations=[], intended_publication=[],
                      claim_profiles=list(g.PROFILES))
        req = collector.capture_request(dict(repository_full_name=REPO, path="evidence/a.json",
                                             ref=COMMIT, url="https://github.com/" + REPO + "/blob/" + COMMIT + "/evidence/a.json"),
                                        "read-1", lambda: STAMP)
        receipt = collector.ingest_response(req, dict(repository=REPO, ref=COMMIT,
                                            path="evidence/a.json", url=req["arguments"]["url"],
                                            blob=pin(b'{"effect_count":1}\n')["git_blob_sha"]),
                                           "receipt-1", lambda: RECEIPT)
        self.add("req", req, "REQUEST_ENVELOPE")
        self.add("resp", receipt, "CONNECTOR_RECEIPT")
        self.add_bytes("content", b'{"effect_count":1}\n', "CONTENT")
        self.add("clock", dict(recorded_at=RECEIPT, verified_at=RECEIPT), "LOCAL_RECORD")
        self.membership(COMMIT, "evidence/a.json", pin(b'{"effect_count":1}\n')["git_blob_sha"])
        r = dict(retrieval_id="read-1", logical_operation_id="OP-1", request_source_id="req",
                 response_source_id="resp", content_source_id="content", membership_source_id="member",
                 request={k: self.q("req", "/arguments/" + a) for k, a in
                          (("repository", "repository_full_name"), ("ref", "ref"), ("path", "path"), ("url", "url"))},
                 response={k: self.q("resp", "/response/" + k) for k in ("repository", "ref", "path", "url", "blob")},
                 temporal_provenance={})
        for key in ("requested_at", "responded_at", "receipt_at", "event_at", "recorded_at", "verified_at"):
            if key == "event_at":
                q = unknown("No event time claimed")
            else:
                sid = "req" if key == "requested_at" else "resp" if key in ("receipt_at", "responded_at") else "clock"
                q = self.q(sid, "/receipt_at" if key == "responded_at" else "/" + key)
                q.update(clock_role=key, clock_id="observer-clock")
                if key == "responded_at":
                    q["receipt_alias"] = True
            r["temporal_provenance"][key] = q
        self.b["retrievals"] = [r]

    @property
    def r(self):
        return self.b["retrievals"][0]

    def add_bytes(self, sid, data, role, origin="SYNTHETIC_FIXTURE", locator="synthetic-only"):
        self.serial += 1
        path = "sources/" + str(self.serial).zfill(3) + ".bin"
        (self.root / path).parent.mkdir(parents=True, exist_ok=True)
        with (self.root / path).open("xb") as f:
            f.write(data)
        meta = dict(source_id=sid, local_path=path, **pin(data), role=role, origin_kind=origin, origin_locator=locator)
        meta['fixture_provenance'] = 'SYNTHETIC_FIXTURE'
        self.b["sources"] = [s for s in self.b["sources"] if s["source_id"] != sid] + [meta]
        return sid

    def add(self, sid, doc, role, origin="SYNTHETIC_FIXTURE", locator="synthetic-only"):
        self.add_bytes(sid, encoded(doc), role, origin, locator)
        meta = self.meta(sid)
        old = self.root / meta["local_path"]
        new = old.with_suffix(".json")
        old.rename(new)
        meta["local_path"] = str(new.relative_to(self.root))
        return sid

    def meta(self, sid):
        return next(x for x in self.b["sources"] if x["source_id"] == sid)

    def add_file(self, sid, name, role, origin='RETAINED_RESPONSE'):
        raw=(ROOT/name).read_bytes()
        self.add_bytes(sid,raw,role,origin,name)
        m=self.meta(sid);old=self.root/m['local_path'];new=old.with_suffix('.json')
        old.rename(new);m['local_path']=str(new.relative_to(self.root))
        m['fixture_provenance']='RETAINED_RAW_SOURCE'
        m['original_path']=name;m['original_pins']=pin(raw)
        return sid

    def doc(self, sid):
        return json.loads((self.root / self.meta(sid)["local_path"]).read_bytes())

    def q(self, sid, ptr, transform=None):
        v = self.doc(sid)
        for part in ptr.lstrip("/").split("/") if ptr else []:
            part = part.replace("~1", "/").replace("~0", "~")
            v = v[int(part)] if isinstance(v, list) else v[part]
        if transform:
            # Independent fixture oracle: URL known to be exact and simply formed.
            parts = v.split("/")
            v = "/".join(parts[3:5]) if transform == "URL_REPOSITORY" else parts[6] if transform == "URL_REF" else "/".join(parts[7:])
        q = dict(value=v, source_id=sid, pointer=ptr, capture_origin=self.meta(sid)["origin_kind"])
        if transform:
            q["transform"] = transform
        return q

    def replace(self, sid, doc):
        m = self.meta(sid)
        retained=m.get('fixture_provenance')=='RETAINED_RAW_SOURCE'
        origin='SYNTHETIC_FIXTURE' if retained else m['origin_kind']
        self.add(sid, doc, m["role"], origin, m["origin_locator"])
        if retained:
            self.meta(sid)['fixture_provenance']='SYNTHETIC_MUTATION_OF_RETAINED_SOURCE'
            self.meta(sid)['base_source_pins']=m['original_pins']
            for r in self.b['retrievals']:
                for section in ('request','response','declared_identity','temporal_provenance'):
                    for q in r.get(section,{}).values():
                        if q.get('source_id')==sid:q['capture_origin']=origin

    def membership(self, commit, path, blob, sid="member", tree=None):
        response = tree or dict(sha=commit, truncated=False,
                               tree=[dict(path=path, type="blob", sha=blob)])
        self.add(sid, dict(requested_url="https://api.github.com/repos/" + REPO + "/git/trees/" + commit + "?recursive=1",
                           tree_sha=response["sha"], response=response), "TREE_MEMBERSHIP")

    def no_request(self):
        self.r["request_source_id"] = "UNKNOWN"
        self.r["request"] = {k: unknown() for k in ("repository", "ref", "path", "url")}
        self.r["temporal_provenance"]["requested_at"] = unknown()

    def historical_q01(self, corrected=False):
        manifest = json.loads((ROOT / "validations/PP-002/GATE-C/S02/source-recovery-manifest.json").read_text())
        correction = json.loads((ROOT / "validations/PP-002/GATE-C/S02/source-reference-audit-correction.json").read_text())
        self.add_file("legacy", "validations/PP-002/GATE-C/S02/source-recovery-manifest.json", "HISTORICAL_RECORD")
        self.add_file("resp", "validations/PP-002/GATE-C/S02/source-reference-audit-correction.json", "CONNECTOR_RECEIPT", "LATER_ATTESTATION")
        cp = ROOT / "validations/PP-002/GATE-C/C-020_S01_ROLLOVER_CHECKPOINT.json"
        self.add_file("content", str(cp.relative_to(ROOT)), "CONTENT")
        memberfile = ROOT / EVIDENCE / "custody/tree-1352de4daddc6c2143943af2ad7142333f7be963.json"
        self.add_file("member", str(memberfile.relative_to(ROOT)), "TREE_MEMBERSHIP")
        self.no_request()
        self.r["logical_operation_id"] = "C020-RETRIEVAL"
        index = next(i for i, x in enumerate(manifest["files"]) if x["path"].endswith("C-020_S01_ROLLOVER_CHECKPOINT.json"))
        prefix = "/discrepancies/0/"
        self.r["response"] = {
            "repository": self.q("resp", prefix + "source_url", "URL_REPOSITORY"),
            "ref": self.q("resp", prefix + "actual_fetch_ref"),
            "path": self.q("resp", prefix + "path"),
            "url": self.q("resp", prefix + "source_url"),
            "blob": self.q("resp", prefix + "git_blob_sha")}
        self.r['declared_identity'] = {'blob':self.q('legacy','/files/'+str(index)+'/git_blob_sha')}
        if corrected:
            self.r["supersedes"] = dict(supersedes_claim_source="legacy",
                supersedes_claim_pointer="/files/" + str(index) + "/source_ref",
                correction_source_id="resp", correction_pointer="/discrepancies/0")
        else:
            self.r["declared_identity"]['ref'] = self.q("legacy", "/files/" + str(index) + "/source_ref")
        for key in ("responded_at", "receipt_at"):
            q = self.q("resp", prefix + "receipt_at")
            q.update(clock_role=key, clock_id="historic-observer")
            if key == "responded_at":
                q["receipt_alias"] = True
            self.r["temporal_provenance"][key] = q
        self.r["temporal_provenance"]["event_at"] = unknown()
        return manifest, correction, index

    def historical_r2(self, reconcile=False):
        intent = json.loads((ROOT / "validations/PP-002/GATE-B-R2/R2-000_INTENT.json").read_text())
        rec = json.loads((ROOT / "validations/PP-002/GATE-B-R2/planning-path-reconciliation.json").read_text())
        # Actual receipt identity comes from retained original recovery read, not planned fields.
        reads = json.loads((ROOT / "validations/PP-002/GATE-B-R2/recovery-entry.json").read_text())
        actual = next(x for x in reads["durable_recovery_reads"] if x["key"] == "intent")
        self.add_file("plan", "validations/PP-002/GATE-B-R2/R2-000_INTENT.json", "PLAN")
        self.add_file("resp", "validations/PP-002/GATE-B-R2/recovery-entry.json", "CONNECTOR_RECEIPT")
        self.add_file("reconciliation", "validations/PP-002/GATE-B-R2/planning-path-reconciliation.json", "RECONCILIATION", "LATER_ATTESTATION")
        self.add_file("content", "validations/PP-002/GATE-B-R2/R2-000_INTENT.json", "CONTENT")
        tree = json.loads((ROOT / EVIDENCE / "custody/tree-ac0e60ad0126945bd560c32ecb82596a360590bc.json").read_text())
        self.add_file("member", EVIDENCE+"/custody/tree-ac0e60ad0126945bd560c32ecb82596a360590bc.json", "TREE_MEMBERSHIP")
        publication = json.loads((ROOT / EVIDENCE / "custody/tree-e319d4b03cc04fd07dc88df90e06071bfff53ef2.json").read_text())
        self.add_file("publication-member", EVIDENCE+"/custody/tree-e319d4b03cc04fd07dc88df90e06071bfff53ef2.json", "TREE_MEMBERSHIP")
        self.no_request()
        self.r["logical_operation_id"] = "R2-INTENT-PUBLISH"
        i = reads['durable_recovery_reads'].index(actual)
        prefix = '/durable_recovery_reads/' + str(i) + '/'
        self.r['response_source_id'] = 'resp'
        self.r['response'] = dict(repository=self.q('resp', prefix+'display_url', 'URL_REPOSITORY'),
            ref=self.q('resp', prefix+'ref'), path=self.q('resp', prefix+'path'),
            url=self.q('resp', prefix+'display_url'), blob=self.q('resp', prefix+'sha'))
        self.r["planned_locator"] = dict(planned_path=self.q("plan", "/planned_intent/operations/0/effect_output_namespace"),
            allowed_namespace="validations/PP-002/GATE-B-R2/", product_subject="NONE")
        for k in ("requested_at", "responded_at", "receipt_at", "event_at"):
            self.r["temporal_provenance"][k] = unknown()
        if reconcile:
            self.b["locator_reconciliations"] = [dict(logical_operation_id="R2-INTENT-PUBLISH",
                source_id="reconciliation", pointer="", authority_artifact=self.b["authority_artifact"],
                publication_membership_source_id='publication-member')]
        return intent, rec, actual

    def close(self):
        self.tmp.cleanup()


class Contract(unittest.TestCase):
    def setUp(self):
        self.f = Fixture()
        self.addCleanup(self.f.close)

    def check(self, label, expected, codes=(), profiles=g.PROFILES, fixture=None):
        f = fixture or self.f
        for profile in profiles:
            wanted = expected[profile] if isinstance(expected, dict) else expected
            b = deepcopy(f.b)
            for item in b["intended_publication"]:
                item["profile"] = profile
            before = encoded(b)
            result = g.validate_bundle(b, profile, f.root)
            archive_fixture(label, profile, f, b)
            self.assertEqual(result["verdict"], wanted, (label, profile, result["violations"], result["unknown_claims"]))
            self.assertEqual(encoded(b), before, "Guard must not mutate input")
            found = {x["invariant_code"] for x in result["violations"]}
            self.assertTrue(set(codes) <= found, (label, found))
            expected_operation = ('C020-RETRIEVAL' if label.startswith(('F05','F07','F31')) else
                                  'R2-INTENT-PUBLISH' if label.startswith(('F16','F18','F30')) else
                                  f.r['logical_operation_id'])
            for code in codes:
                hits = [x for x in result['violations'] if x['invariant_code']==code]
                self.assertTrue(any(x['logical_operation_id']==expected_operation or x['retrieval_id']=='BUNDLE' for x in hits))
            if label.startswith(('F05','F16')):
                source_id, ptr = ('legacy','/files/') if label.startswith('F05') else ('plan','/planned_intent/operations/0/effect_output_namespace')
                self.assertTrue(any(s['source_id']==source_id and s['pointer'].startswith(ptr)
                                    for x in result['violations'] for s in x['sources']))
            if wanted == "PASS":
                self.assertFalse(result["violations"])
            RESULTS.append(dict(case=label, family=label[:3], profile=profile,
                                expected=wanted, required_invariant_codes=list(codes),
                                expected_operation=expected_operation,
                                actual=result["verdict"], semantic_result=result))
        return result

    def input_error(self, label, action):
        with self.assertRaises(g.InputError):
            action()
        RESULTS.append(dict(case=label, family=label[:3], profile="INPUT", expected="EXIT_3", actual="EXIT_3"))

    def test_F01(self):
        self.check("F01-exact", "PASS")
        for host, url in [('raw','https://raw.githubusercontent.com/'+REPO+'/'+COMMIT+'/evidence/a.json'),
                          ('api','https://api.github.com/repos/'+REPO+'/contents/evidence/a.json?ref='+COMMIT)]:
            f=Fixture();self.addCleanup(f.close)
            d=f.doc('resp');d['response']['url']=url;f.replace('resp',d);f.r['response']['url']=f.q('resp','/response/url')
            self.check('F01-'+host+'-form','PASS',fixture=f)
        before = self.f.doc("req")
        req = collector.capture_request({"ref": COMMIT}, "new", lambda: STAMP)
        resp = collector.ingest_response(req, {"ok": True}, "receipt", lambda: RECEIPT)
        self.assertEqual(resp["retrieval_id"], "new")
        self.assertEqual(req["arguments"]["path"], "UNKNOWN")
        self.assertEqual(before, self.f.doc("req"))

    def test_F02(self):
        doc = self.f.doc("req");doc["arguments"]["url"] = "UNKNOWN";self.f.replace("req", doc)
        self.f.r["request"]["url"] = unknown("NO_URL_ARGUMENT")
        self.check("F02-structured-only", "PASS")

    def test_F03(self):
        self.f.no_request()
        self.check("F03-missing-request", {"EXACT_REQUEST_HISTORY":"UNKNOWN","EXACT_CONTENT":"PASS"})

    def test_F04(self):
        self.f.no_request();self.f.r["request"]["ref"] = dict(value=CONTROL, source_id="UNKNOWN",pointer="UNKNOWN",capture_origin="UNKNOWN")
        self.check("F04-routing-fallback", "FAIL", ["UNSUPPORTED_CLAIM"])
        f=Fixture();self.addCleanup(f.close)
        d=f.doc('req');d['unrelated_control']=COMMIT;f.replace('req',d)
        f.r['request']['ref']=f.q('req','/unrelated_control')
        self.check('F04-wrong-issuance-pointer','FAIL',['UNSUPPORTED_REQUEST_IDENTITY'],fixture=f)

    def test_F05(self):
        _, corr, _ = self.f.historical_q01()
        self.assertEqual(corr["discrepancies"][0]["actual_fetch_ref"], "1352de4daddc6c2143943af2ad7142333f7be963")
        self.check("F05-C030-same-blob", "FAIL", ["REF_MISMATCH_IDENTICAL_BLOB"])
        corr.pop("classification");corr.pop("cause");corr.pop("disposition");self.f.replace("resp",corr)
        self.check("F05-without-diagnostic-prose", "FAIL", ["REF_MISMATCH_IDENTICAL_BLOB"])

    def test_F06(self):
        self.f.historical_q01(True)
        result=self.check("F06-annotated-projection", {"EXACT_REQUEST_HISTORY":"UNKNOWN","EXACT_CONTENT":"PASS"})
        self.assertEqual(result["verified_claims"][0]["request_identity"]["ref"], "UNKNOWN")
        self.assertEqual(result["resolved_deviations"][0]["type"], "APPEND_ONLY_REF_CORRECTION")

    def test_F07(self):
        self.f.historical_q01()
        self.f.add_bytes("content",b"different\n","CONTENT")
        self.check("F07-different-blob","FAIL",["REF_MISMATCH_DIFFERENT_BLOB","BLOB_MISMATCH"])

    def test_F08(self):
        for key,value in (("repository","other/repository"),("path","evidence/A.json")):
            f=Fixture();self.addCleanup(f.close);d=f.doc("resp");d["response"][key]=value;f.replace("resp",d);f.r["response"][key]=f.q("resp","/response/"+key)
            self.check("F08-wrong-"+key,"FAIL",["MEMBERSHIP_IDENTITY_MISMATCH"],fixture=f)
        self.f.membership(OTHER,"evidence/a.json",self.f.meta("content")["git_blob_sha"])
        self.check("F08-wrong-commit-membership","FAIL",["MEMBERSHIP_IDENTITY_MISMATCH"])
        f=Fixture();self.addCleanup(f.close)
        f.add('declared',{'ref':OTHER},'HISTORICAL_RECORD')
        f.r['declared_identity']={'ref':f.q('declared','/ref')}
        self.check('F08-manifest-ref-even-with-correct-request','FAIL',['REF_MISMATCH_BLOB_RELATION_UNKNOWN'],fixture=f)

    def test_F09(self):
        for field in ("response","url","membership"):
            f=Fixture();self.addCleanup(f.close)
            if field=="response":
                f.r["response_source_id"]="UNKNOWN"
                f.r["response"]={k:unknown() for k in f.r["response"]}
                for key in ('receipt_at', 'responded_at'):
                    f.r['temporal_provenance'][key]=unknown()
            elif field=="url": f.r["response"]["url"]=unknown()
            else:f.r["membership_source_id"]="UNKNOWN"
            self.check("F09-missing-"+field,"UNKNOWN",fixture=f)

    def test_F10(self):
        for field in ("recorded_at","verified_at"):
            f=Fixture();self.addCleanup(f.close);q=f.q("clock","/"+field);q.update(clock_role="receipt_at",clock_id="observer-clock")
            f.r["temporal_provenance"]["receipt_at"]=q
            self.check("F10-from-"+field,"FAIL",["TIMESTAMP_ROLE_CONFLATION"],fixture=f)
        f=Fixture();self.addCleanup(f.close);f.add('other-receipt',f.doc('resp'),'CONNECTOR_RECEIPT')
        q=f.q('other-receipt','/receipt_at');q.update(clock_role='receipt_at',clock_id='observer-clock')
        f.r['temporal_provenance']['receipt_at']=q
        self.check('F10-other-receipt-clock','FAIL',['TIMESTAMP_SOURCE_MISMATCH'],fixture=f)

    def test_F11(self):
        self.check("F11-valid-equal-clock-values","PASS")

    def test_F12(self):
        for field in ("requested_at","receipt_at","responded_at"):self.f.r["temporal_provenance"][field]=unknown()
        d=self.f.doc("resp");d["event_at"]="2026-10-01T00:00:00Z";self.f.replace("resp",d)
        q=self.f.q("resp","/event_at");q.update(clock_role="event_at",clock_id="server")
        self.f.r["temporal_provenance"]["event_at"]=q
        self.check("F12-no-clock-substitution",{"EXACT_REQUEST_HISTORY":"UNKNOWN","EXACT_CONTENT":"PASS"})

    def test_F13(self):
        self.f.meta("req")["origin_kind"]="LATER_ATTESTATION"
        for q in self.f.r["request"].values():q["capture_origin"]="LATER_ATTESTATION"
        self.f.r["temporal_provenance"]["requested_at"]["capture_origin"]="LATER_ATTESTATION"
        self.check("F13-later-attestation",{"EXACT_REQUEST_HISTORY":"UNKNOWN","EXACT_CONTENT":"PASS"})
        self.f.r["request"]["ref"]["capture_origin"]="AT_ISSUANCE_RECEIPT"
        self.check("F13-false-origin-upgrade","FAIL",["CAPTURE_ORIGIN_MISMATCH"])

    def test_F14(self):
        for label,stamp in (("malformed","no-time"),("naive","2026-10-29T18:00:00"),("reversed","2026-10-30T00:00:00Z")):
            f=Fixture();self.addCleanup(f.close);d=f.doc("req");d["requested_at"]=stamp;f.replace("req",d)
            f.r["temporal_provenance"]["requested_at"]=f.q("req","/requested_at")
            f.r["temporal_provenance"]["requested_at"].update(clock_role="requested_at",clock_id="observer-clock")
            self.check("F14-"+label,"FAIL",["TIMESTAMP_ORDER_INVALID" if label=="reversed" else "INVALID_TIMESTAMP"],fixture=f)

    def test_F15(self):
        d=self.f.doc("resp");d["event_at"]="2026-10-01T00:00:00Z";d["receipt_at"]="2026-10-29T12:42:51.743-06:00";self.f.replace("resp",d)
        for key in ("responded_at","receipt_at","event_at"):
            q=self.f.q("resp","/event_at" if key=="event_at" else "/receipt_at");q.update(clock_role=key,clock_id="observer-clock")
            if key=="responded_at":q["receipt_alias"]=True
            self.f.r["temporal_provenance"][key]=q
        self.check("F15-offset-and-old-event","PASS")

    def test_F16(self):
        intent,rec,actual=self.f.historical_r2()
        self.assertNotEqual(intent["planned_intent"]["operations"][0]["effect_output_namespace"],rec["actual_published_path"])
        self.assertEqual(actual["sha"],rec["actual_blob"])
        self.check("F16-R2-unreconciled","FAIL",["ADMINISTRATIVE_LOCATOR_MISMATCH"])

    def test_F17(self):
        self.f.historical_r2(True)
        result=self.check("F17-R2-reconciled",{"EXACT_REQUEST_HISTORY":"UNKNOWN","EXACT_CONTENT":"PASS"})
        self.assertEqual(result["resolved_deviations"][0]["type"],"RECONCILED_ADMINISTRATIVE_LOCATOR")

    def test_F18(self):
        for label in ("namespace","subject"):
            f=Fixture();self.addCleanup(f.close);f.historical_r2(True)
            f.r["planned_locator"]["allowed_namespace"]="product" if label=="namespace" else "validations/PP-002/GATE-B-R2/"
            f.r["planned_locator"]["product_subject"]="product-sha" if label=="subject" else "NONE"
            self.check("F18-"+label,"FAIL",["NAMESPACE_AUTHORITY_MISMATCH"],fixture=f)

    def test_F19(self):
        for label in ("wrong-id","swapped-request","duplicate-id"):
            f=Fixture();self.addCleanup(f.close)
            if label=="duplicate-id":f.b["retrievals"].append(deepcopy(f.r))
            else:
                d=f.doc("resp");d["retrieval_id" if label=="wrong-id" else "request_source_id"]="read-other";f.replace("resp",d)
            self.check("F19-"+label,"FAIL",["CORRELATION_ID_DUPLICATE" if label=="duplicate-id" else "CORRELATION_ID_MISMATCH"],fixture=f)
        f=Fixture();self.addCleanup(f.close)
        req2=f.doc('req');req2['retrieval_id']='read-2';f.add('req2',req2,'REQUEST_ENVELOPE')
        resp2=f.doc('resp');resp2['retrieval_id']='read-2';resp2['request_source_id']='read-2';f.add('resp2',resp2,'CONNECTOR_RECEIPT')
        r2=deepcopy(f.r);r2['retrieval_id']='read-2';r2['request_source_id']='req2'
        for key,q in r2['request'].items():q['source_id']='req2'
        r2['temporal_provenance']['requested_at']['source_id']='req2'
        r2['response_source_id']='resp';f.r['response_source_id']='resp2'
        for q in f.r['response'].values():q['source_id']='resp2'
        f.b['retrievals'].append(r2)
        self.check('F19-concurrent-swapped-responses','FAIL',['CORRELATION_ID_MISMATCH'],fixture=f)

    def test_F20(self):
        for label in ("source-bytes","length","git-header","newline","returned-sha"):
            f=Fixture();self.addCleanup(f.close)
            if label in ("source-bytes","newline"):
                p=f.root/f.meta("content")["local_path"];p.write_bytes(p.read_bytes()+(b"\n" if label=="newline" else b"x"))
            elif label=="length":f.meta("content")["bytes"]+=1
            elif label=="git-header":f.meta("content")["git_blob_sha"]=hashlib.sha1(b"wrong-header").hexdigest()
            else:
                d=f.doc("resp");d["response"]["blob"]="f"*40;f.replace("resp",d);f.r["response"]["blob"]=f.q("resp","/response/blob")
            self.check("F20-"+label,"FAIL",["BLOB_MISMATCH" if label=="returned-sha" else "SOURCE_BYTES_MISMATCH"],fixture=f)

    def test_F21(self):
        self.input_error("F21-traversal",lambda:g.contained(self.f.root,"../secret"))
        target=self.f.root/"target";target.write_bytes(b"no");(self.f.root/"link").symlink_to(target)
        self.input_error("F21-symlink",lambda:g.contained(self.f.root,"link"))
        self.input_error("F21-duplicate-json",lambda:g.strict_json(b'{"a":1,"a":2}'))
        urls=["https://github.com/"+REPO+"/blob/"+COMMIT+"/a%2fb",
              "https://api.github.com/repos/"+REPO+"/contents/a?ref="+COMMIT+"&ref="+OTHER,
              "https://evil.invalid/"+REPO+"/blob/"+COMMIT+"/a",
              "https://x@github.com/"+REPO+"/blob/"+COMMIT+"/a"]
        urls += ['https://github.com/'+REPO+'/blob/'+COMMIT+'/a%GG',
                 'https://github.com/'+REPO+'/blob/'+COMMIT+'/a%252fb',
                 'https://github.com/'+REPO+'/blob/'+COMMIT+'/a?token=SYNTHETIC_SECRET']
        for i,url in enumerate(urls):
            f=Fixture();self.addCleanup(f.close);d=f.doc("resp");d["response"]["url"]=url;f.replace("resp",d);f.r["response"]["url"]=f.q("resp","/response/url")
            result=self.check("F21-url-"+str(i),"FAIL" if i<6 else "UNKNOWN",
                              ["URL_IDENTITY_INVALID"] if i<6 else [],fixture=f)
            self.assertNotIn(b'SYNTHETIC_SECRET',encoded(result))
            self.assertEqual(result['verified_claims'],[])

    def test_F22(self):
        for ref in ("feature/branch","UNKNOWN"):
            f=Fixture();self.addCleanup(f.close);d=f.doc("req");d["arguments"]["ref"]=ref;d["arguments"]["url"]="UNKNOWN";f.replace("req",d)
            f.r["request"]["ref"]=unknown() if ref=="UNKNOWN" else f.q("req","/arguments/ref")
            f.r["request"]["url"]=unknown("No URL argument")
            self.check("F22-"+ref.replace("/","-"),{"EXACT_REQUEST_HISTORY":"UNKNOWN","EXACT_CONTENT":"PASS"},fixture=f)

    def fake(self,label,mutate=None,state="PASS",profile="EXACT_REQUEST_HISTORY",fresh=True):
        b=self.f.b
        item=dict(path="validations/synthetic/result.json",source_id="content",profile=profile,
                  dependencies=["read-1"],intended_path="NONE",**pin((self.f.root/self.f.meta("content")["local_path"]).read_bytes()))
        b["intended_publication"]=[item]
        approval=g.approve(b,profile,self.f.root)
        if mutate:mutate()
        calls=[]
        result=g.use_if_approved(b,profile,self.f.root,approval,
            {"result":state,"bundle_sha256":approval["bundle_sha256"]},lambda:calls.append("fake"),
            CONTROL,requires_fresh_state=fresh)
        self.assertEqual(len(calls),0,label)
        RESULTS.append(dict(case=label,family=label[:3],profile=profile,expected="BLOCK_CALLBACK",
                            actual="BLOCK_CALLBACK",callback_invocations=len(calls),reason=result["reason"]))

    def test_F23(self):
        self.fake("F23-output-path-changed",lambda:self.f.b["intended_publication"][0].update(path="validations/synthetic/other.json"))
        f=Fixture();self.addCleanup(f.close);self.f=f
        self.fake("F23-content-changed",lambda:(f.root/f.meta("content")["local_path"]).write_bytes(b"changed"))
        f=Fixture();self.addCleanup(f.close);self.f=f
        self.fake("F23-other-bundle",lambda:f.b.update(bundle_id="another-bundle"))

    def test_F24(self):
        self.fake("F24-state-check-fail",state="FAIL")
        f=Fixture();self.addCleanup(f.close);self.f=f;f.no_request()
        self.fake("F24-provenance-unknown")
        f=Fixture();self.addCleanup(f.close);self.f=f
        d=f.doc('resp');d['response']['blob']='f'*40;f.replace('resp',d);f.r['response']['blob']=f.q('resp','/response/blob')
        self.fake('F24-provenance-fail')
        f=Fixture();self.addCleanup(f.close);self.f=f
        self.fake("F24-content-not-current-state",profile="EXACT_CONTENT")
        # Positive control proves the fake callback is wired and reachable.
        approval=g.approve(f.b,"EXACT_CONTENT",f.root);calls=[]
        result=g.use_if_approved(f.b,"EXACT_CONTENT",f.root,approval,
            {"result":"PASS","bundle_sha256":approval["bundle_sha256"]},lambda:calls.append(1),CONTROL,False)
        self.assertTrue(result["invoked"]);self.assertEqual(calls,[1])
        RESULTS.append(dict(case="F24-positive-fake-only",family="F24",profile="EXACT_CONTENT",
                            expected="ALLOW_FAKE",actual="ALLOW_FAKE",callback_invocations=1))

    def test_F25(self):
        self.f.b["planned_intent"]={"lifecycle":"CONFIRMED_DONE","acknowledgement":"EMITTED_ACKNOWLEDGED"}
        self.f.r["response_source_id"]="UNKNOWN";self.f.r["response"]={k:unknown() for k in self.f.r["response"]}
        for key in ('receipt_at', 'responded_at'):
            self.f.r['temporal_provenance'][key]=unknown()
        self.check("F25-no-plan-inheritance","UNKNOWN")
        receipt=json.loads((REGRESSION/"r1/negative-result.json").read_text())
        self.assertTrue(any(v["violated_invariant"]=="PLANNED_STATE_CARRIED_ACROSS_EMISSION" for v in receipt["violations"]))

    def test_F26(self):
        nr=json.loads((REGRESSION/"r1/negative-result.json").read_text())
        self.assertEqual(nr["result"],"FAIL")
        for oid in ("GB-INTENT-PUBLISH","GB-OPS-CREATE","GB-EMIT","B1-EFFECT","B1-HOLD"):
            self.assertTrue(any(v["logical_operation_id"]==oid and v["violated_invariant"]=="NOT_DONE_CONTRADICTS_EXECUTION" for v in nr["violations"]))
        self.assertTrue(any(v["violated_invariant"]=="OBSERVATION_TIME_CONFLATED_WITH_ASSEMBLY" for v in nr["violations"]))
        RESULTS.append(dict(case="F26-original-negative",family="F26",profile="FROZEN_R1",expected="FAIL",actual="FAIL",
                            violations=nr["invariant_violation_count"],mandatory_controls=6))

    def test_F27(self):
        pr=json.loads((REGRESSION/"r1/positive-result.json").read_text())
        cr=json.loads((REGRESSION/"c060-result.json").read_text())
        self.assertEqual(pr["result"],"PASS");self.assertEqual(cr["result"],"PASS")
        self.assertEqual(pr["invariant_violation_count"],0);self.assertEqual(cr["invariant_violation_count"],0)
        RESULTS.append(dict(case="F27-frozen-positives",family="F27",profile="FROZEN_CHECKERS",expected="PASS",actual="PASS"))

    def test_F28(self):
        a=g.validate_bundle(self.f.b,"EXACT_REQUEST_HISTORY",self.f.root)
        self.f.b["sources"].reverse();self.f.b["run_metadata"]={"local_clock":"different"}
        b=g.validate_bundle(self.f.b,"EXACT_REQUEST_HISTORY",self.f.root)
        self.assertEqual(encoded(a),encoded(b))
        self.check("F28-order-and-run-clock","PASS")

    def test_F29(self):
        f=Fixture();self.addCleanup(f.close);f.r["response"]["ref"]["pointer"]="/missing"
        self.check("F29-pointer","FAIL",["SOURCE_POINTER_INVALID"],fixture=f)
        f=Fixture();self.addCleanup(f.close);del f.meta("content")["sha256"]
        self.input_error("F29-missing-pin",lambda:g.validate_bundle(f.b,"EXACT_CONTENT",f.root))
        self.input_error("F29-unknown-profile",lambda:g.validate_bundle(self.f.b,"NOT_A_PROFILE",self.f.root))
        f=Fixture();self.addCleanup(f.close);f.meta("resp")["derived_from"]=["resp"]
        self.check("F29-cycle","FAIL",["SOURCE_DERIVATION_CYCLE"],fixture=f)
        f=Fixture();self.addCleanup(f.close);d=f.doc("resp");d["request_source_id"]="orphan";f.replace("resp",d)
        self.check("F29-orphan","FAIL",["CORRELATION_ID_MISMATCH"],fixture=f)
        for expected in (0,1,2,3):
            f=Fixture();self.addCleanup(f.close)
            if expected==1:
                d=f.doc('resp');d['response']['blob']='f'*40;f.replace('resp',d);f.r['response']['blob']=f.q('resp','/response/blob')
            elif expected==2:f.no_request()
            with (f.root/'bundle.json').open('xb') as h:h.write(encoded(f.b))
            with redirect_stderr(io.StringIO()):
                actual=g.main(['--input-root',str(f.root),'--bundle','bundle.json','--profile',
                               'WRONG' if expected==3 else 'EXACT_REQUEST_HISTORY','--output','result.json'])
            self.assertEqual(actual,expected)
            RESULTS.append(dict(case='F29-cli-exit-'+str(expected),family='F29',profile='CLI',expected=expected,actual=actual))
            if expected==0:
                before=(f.root/'result.json').read_bytes()
                with redirect_stderr(io.StringIO()):
                    actual=g.main(['--input-root',str(f.root),'--bundle','bundle.json','--profile','EXACT_REQUEST_HISTORY','--output','result.json'])
                self.assertEqual(actual,3);self.assertEqual(before,(f.root/'result.json').read_bytes())
                RESULTS.append(dict(case='F29-cli-exclusive-output',family='F29',profile='CLI',expected=3,actual=3))
        with redirect_stderr(io.StringIO()):
            self.assertEqual(g.main([]),3)

    def test_F30(self):
        self.f.historical_r2(True);self.f.b["locator_reconciliations"][0]["logical_operation_id"]="other-operation"
        self.check("F30-other-operation","FAIL",["ADMINISTRATIVE_LOCATOR_MISMATCH"])
        f=Fixture();self.addCleanup(f.close);f.historical_r2(True)
        rec=f.doc("reconciliation");rec["actual_publication"]="f"*40;f.replace("reconciliation",rec)
        self.check("F30-other-revision","FAIL",["RECONCILIATION_SCOPE_MISMATCH"],fixture=f)

    def test_F31(self):
        manifest,correction,index=self.f.historical_q01()
        original=deepcopy(self.f.r);rows=[]
        for i,row in enumerate(manifest["files"]):
            if i==index:rows.append(deepcopy(original));continue
            r=deepcopy(original);r["retrieval_id"]="legacy-"+str(i);r["logical_operation_id"]="LEGACY-READ"
            r["response_source_id"]="UNKNOWN";r["response"]={k:unknown() for k in r["response"]}
            r["content_source_id"]="UNKNOWN";r["membership_source_id"]="UNKNOWN";r.pop("declared_identity",None)
            for key in ("requested_at","responded_at","receipt_at"):r["temporal_provenance"][key]=unknown()
            rows.append(r)
        self.assertEqual(len(rows),57);self.f.b["retrievals"]=rows
        result=self.check("F31-full-legacy-manifest","FAIL",["REF_MISMATCH_IDENTICAL_BLOB"])
        self.assertTrue(any(x["material"] for x in result["unknown_claims"]))


if __name__ == "__main__":
    unittest.main()

