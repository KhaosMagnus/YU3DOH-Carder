"""Q01 bounded offline custody checker. Standard library; no transport or publisher.

The caller's pinned input index is the trust boundary. Hashes detect alteration,
not fabrication by an untrusted producer. All findings are scoped to supplied facts.
"""
import argparse
from copy import deepcopy
from datetime import datetime
import hashlib
import json
from pathlib import Path
import re
import sys
from urllib.parse import parse_qsl, unquote, urlsplit

UNKNOWN = "UNKNOWN"
VERSION = "Q01-collector-guard-v1"
PROFILES = ("EXACT_REQUEST_HISTORY", "EXACT_CONTENT")
ORIGINS = {"AT_ISSUANCE_RECEIPT", "RETAINED_RESPONSE", "LATER_ATTESTATION",
           "SYNTHETIC_FIXTURE", UNKNOWN}
ROLES = {"REQUEST_ENVELOPE", "CONNECTOR_RECEIPT", "TREE_MEMBERSHIP", "CONTENT",
         "HISTORICAL_RECORD", "PLAN", "RECONCILIATION", "AUTHORITY", "LOCAL_RECORD"}
HEX = re.compile(r"[0-9a-f]{40}\Z")


class InputError(ValueError):
    pass


class UnsupportedLocator(ValueError):
    pass


def canonical(value):
    return (json.dumps(value, ensure_ascii=False, sort_keys=True,
                       separators=(",", ":"), allow_nan=False) + "\n").encode("utf-8")


def strict_json(data):
    def pairs(items):
        result = {}
        for key, value in items:
            if key in result:
                raise InputError("Duplicate JSON key: " + key)
            result[key] = value
        return result
    try:
        return json.loads(data, object_pairs_hook=pairs,
                          parse_constant=lambda x: (_ for _ in ()).throw(InputError("Nonfinite JSON")))
    except (UnicodeError, json.JSONDecodeError) as exc:
        raise InputError("Invalid UTF-8 JSON") from exc


def digests(data):
    return {"bytes": len(data), "sha256": hashlib.sha256(data).hexdigest(),
            "git_blob_sha": hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest()}


def relative_path(value):
    if not isinstance(value, str) or value in ("", UNKNOWN) or "\\" in value or "\0" in value:
        raise InputError("Invalid relative path")
    p = Path(value)
    if p.is_absolute() or any(x in ("", ".", "..") for x in value.split("/")):
        raise InputError("Path traversal or ambiguous path")
    return value


def contained(root, name):
    relative_path(name)
    base = Path(root).resolve()
    current = base
    for component in name.split("/"):
        current = current / component
        if current.is_symlink():
            raise InputError("Symlink input/output not permitted")
    if not current.resolve().is_relative_to(base):
        raise InputError("Path outside root")
    return current


def pointer(document, expression):
    if expression == "":
        return document
    if not isinstance(expression, str) or not expression.startswith("/"):
        raise ValueError("Invalid JSON pointer")
    value = document
    for token in expression[1:].split("/"):
        if re.search(r"~(?![01])", token):
            raise ValueError("Invalid pointer escape")
        token = token.replace("~1", "/").replace("~0", "~")
        if isinstance(value, list):
            if not re.fullmatch(r"0|[1-9][0-9]*", token):
                raise ValueError("Invalid array pointer")
            value = value[int(token)]
        else:
            value = value[token]
    return value


def _url_parts(url):
    if not isinstance(url, str) or any(ord(x)<32 or ord(x)==127 for x in url):
        raise ValueError('Invalid URL text')
    if re.search(r'%(?![0-9a-fA-F]{2})', url):
        raise ValueError('Invalid percent escape')
    p = urlsplit(url)
    if p.scheme != "https" or p.username or p.password or p.port not in (None, 443) or p.fragment:
        raise ValueError("Unsafe URL authority")
    if p.hostname not in ("github.com", "raw.githubusercontent.com", "api.github.com"):
        raise ValueError("Unexpected host")
    raw = p.path.split("/")[1:]
    if not raw or any(re.search(r"%(?:2f|5c|25)", x, re.I) for x in raw):
        raise ValueError("Ambiguous URL escaping")
    parts = [unquote(x, errors="strict") for x in raw]
    if any(x in ("", ".", "..") or "/" in x or "\\" in x or "\0" in x for x in parts):
        raise ValueError("Unsafe URL path")
    return p, parts


def parse_locator(url):
    p, s = _url_parts(url)
    query = parse_qsl(p.query, keep_blank_values=True, strict_parsing=True)
    if p.hostname == "github.com":
        if len(s) < 5 or s[2] != "blob" or query:
            raise UnsupportedLocator("Unsupported GitHub URL form")
        repo, ref, path = "/".join(s[:2]), s[3], "/".join(s[4:])
    elif p.hostname == "raw.githubusercontent.com":
        if len(s) < 4 or query:
            raise UnsupportedLocator("Unsupported raw URL form")
        repo, ref, path = "/".join(s[:2]), s[2], "/".join(s[3:])
    else:
        if len(s) < 5 or s[0] != "repos" or s[3] != "contents":
            raise UnsupportedLocator("Not an exact contents URL")
        if len(query) != 1 or query[0][0] != "ref":
            raise ValueError("Exactly one ref query required")
        repo, ref, path = "/".join(s[1:3]), query[0][1], "/".join(s[4:])
    if not HEX.fullmatch(ref):
        raise UnsupportedLocator("Immutable commit missing; no branch-path guessing")
    relative_path(path)
    return {"repository": repo, "ref": ref, "path": path}


def parse_tree_locator(url):
    p, s = _url_parts(url)
    if p.hostname != "api.github.com" or len(s) != 6 or s[0] != "repos" or s[3:5] != ["git", "trees"]:
        raise ValueError("Expected immutable tree request")
    query = parse_qsl(p.query, keep_blank_values=True, strict_parsing=True)
    if query not in ([], [("recursive", "1")]) or not HEX.fullmatch(s[5]):
        raise ValueError("Expected immutable tree commit")
    return "/".join(s[1:3]), s[5]


def semantic_bundle(bundle):
    b = deepcopy(bundle)
    b.pop("run_metadata", None)
    for key, idkey in (("sources", "source_id"), ("retrievals", "retrieval_id"),
                       ("locator_reconciliations", "logical_operation_id"),
                       ("intended_publication", "path")):
        b[key] = sorted(b[key], key=lambda x: canonical(x.get(idkey, "")))
    return b


def bundle_digest(bundle):
    return hashlib.sha256(canonical(semantic_bundle(bundle))).hexdigest()


def diagnostic_safe(value):
    if isinstance(value, dict):
        return {k:diagnostic_safe(v) for k,v in value.items()}
    if isinstance(value, list):
        return [diagnostic_safe(x) for x in value]
    if isinstance(value, str) and value.startswith(('https://','http://')):
        try:
            parse_locator(value)
        except (ValueError, InputError, UnicodeError):
            return 'REDACTED_UNSUPPORTED_URL'
    return value


class Catalog:
    def __init__(self, root, entries):
        self.root, self.entries, self.data, self.docs, self.bad = Path(root), {}, {}, {}, []
        self.pin_failures = {}
        if not isinstance(entries, list):
            raise InputError("Sources must be an array")
        for meta in entries:
            required = {"source_id", "local_path", "bytes", "sha256", "git_blob_sha",
                        "origin_kind", "origin_locator", "role"}
            if not isinstance(meta, dict) or not required <= meta.keys():
                raise InputError("Incomplete source pin")
            sid = meta["source_id"]
            if not isinstance(sid, str) or not sid or sid in self.entries:
                raise InputError("Duplicate/invalid source ID")
            if meta["origin_kind"] not in ORIGINS or meta["role"] not in ROLES:
                raise InputError("Unsupported source origin/role")
            if (not isinstance(meta['bytes'], int) or isinstance(meta['bytes'], bool) or meta['bytes'] < 0
                    or not isinstance(meta['sha256'], str) or not re.fullmatch('[0-9a-f]{64}', meta['sha256'])
                    or not isinstance(meta['git_blob_sha'], str) or not HEX.fullmatch(meta['git_blob_sha'])):
                raise InputError('Invalid source digest schema')
            p = contained(root, meta["local_path"])
            try:
                data = p.read_bytes()
            except OSError as exc:
                raise InputError("Unreadable source: " + sid) from exc
            self.entries[sid] = meta
            if any(digests(data)[k] != meta[k] for k in ("bytes", "sha256", "git_blob_sha")):
                self.bad.append(sid)
                self.pin_failures[sid] = {'expected':{k:meta[k] for k in ('bytes','sha256','git_blob_sha')},
                                          'actual':digests(data)}
                continue
            self.data[sid] = data
            if p.suffix == ".json":
                self.docs[sid] = strict_json(data)

    def resolve(self, sid, ptr):
        return pointer(self.docs[sid], ptr)


def validate_bundle(bundle, profile, root="."):
    if profile not in PROFILES:
        raise InputError("Unknown claim profile")
    required = {"schema_version", "bundle_id", "authority_control_sha", "authority_artifact",
                "allowed_output_root", "accountable_closer", "sources", "retrievals",
                "locator_reconciliations", "intended_publication", "claim_profiles"}
    if not isinstance(bundle, dict) or not required <= bundle.keys() or bundle["schema_version"] != "Q01-bundle-v1":
        raise InputError("Invalid bundle schema")
    if not all(isinstance(bundle[k], str) and bundle[k] for k in
               ("bundle_id", "authority_artifact", "accountable_closer")):
        raise InputError("Missing bundle identity/closer")
    if not HEX.fullmatch(bundle["authority_control_sha"]):
        raise InputError("Invalid authority baseline")
    relative_path(bundle["allowed_output_root"])
    if set(bundle["claim_profiles"]) != set(PROFILES):
        raise InputError("Explicit fixed claim profiles required")
    for key in ("retrievals", "locator_reconciliations", "intended_publication"):
        if not isinstance(bundle[key], list):
            raise InputError("Expected array: " + key)
    c = Catalog(root, bundle["sources"])
    issues, unknowns, verified, deviations, source_bound = [], [], [], [], []
    current = {"retrieval_id": "BUNDLE", "logical_operation_id": "NONE"}

    def issue(code, field, expected=UNKNOWN, actual=UNKNOWN, sources=()):
        if not sources and current['retrieval_id'] != 'BUNDLE':
            sources = [dict(source_id=q['source_id'], pointer=q['pointer'])
                       for section in (r.get('request', {}), r.get('response', {}), r.get('declared_identity', {}),
                                       r.get('temporal_provenance', {}))
                       for q in section.values() if isinstance(q, dict) and q.get('source_id', UNKNOWN) != UNKNOWN]
            if r.get('planned_locator'):
                q = r['planned_locator'].get('planned_path', {})
                if q.get('source_id', UNKNOWN) != UNKNOWN:
                    sources.append(dict(source_id=q['source_id'], pointer=q['pointer']))
        # Values are structured identity facts, never raw secret-bearing URLs.
        issues.append(dict(retrieval_id=current["retrieval_id"],
                           logical_operation_id=current["logical_operation_id"],
                           invariant_code=code, affected_claim=field, expected=expected,
                           actual=actual, sources=list(sources), severity="ERROR",
                           blocked_use=profile))

    def missing(code, field, material=True):
        unknowns.append(dict(retrieval_id=current["retrieval_id"], field=field,
                             reason=code, material=material))

    def claim(obj, field, time_role=None):
        q = obj.get(field)
        if not isinstance(q, dict) or not {"value", "source_id", "pointer", "capture_origin"} <= q.keys():
            issue("INVALID_CLAIM", field)
            return UNKNOWN
        value, sid, ptr = q["value"], q["source_id"], q["pointer"]
        if value == UNKNOWN:
            if sid != UNKNOWN or ptr != UNKNOWN or not q.get("reason"):
                issue("UNSUPPORTED_UNKNOWN", field, "UNKNOWN source/pointer plus reason", sid)
            return UNKNOWN
        if sid == UNKNOWN or sid not in c.entries:
            issue("UNSUPPORTED_CLAIM", field, "Pinned independent source", value)
            return UNKNOWN
        src = dict(source_id=sid, pointer=ptr)
        try:
            actual = c.resolve(sid, ptr)
            if q.get('transform'):
                if q['transform'] not in ('URL_REPOSITORY', 'URL_REF', 'URL_PATH'):
                    raise ValueError('Unsupported derivation')
                actual = parse_locator(actual)[q['transform'][4:].lower()]
        except (KeyError, ValueError, IndexError, TypeError):
            issue("SOURCE_POINTER_INVALID", field, "Resolvable independent source", ptr, [src])
            return UNKNOWN
        if actual != value:
            issue("SOURCE_VALUE_MISMATCH", field, actual, value, [src])
        origin = c.entries[sid]["origin_kind"]
        if q["capture_origin"] != origin:
            issue("CAPTURE_ORIGIN_MISMATCH", field, origin, q["capture_origin"], [src])
        if c.entries[sid]["role"] in ("PLAN", "RECONCILIATION") and field not in ("planned_path",):
            issue("PLANNED_OR_DERIVED_SOURCE", field, "Independent capture/content", sid, [src])
        if time_role:
            role = c.entries[sid]['role']
            allowed_roles = ({'REQUEST_ENVELOPE'} if time_role == 'requested_at' else
                             {'CONNECTOR_RECEIPT'} if time_role in ('responded_at', 'receipt_at') else
                             {'LOCAL_RECORD'} if time_role in ('recorded_at', 'verified_at') else
                             {'CONNECTOR_RECEIPT', 'HISTORICAL_RECORD', 'CONTENT'})
            if role not in allowed_roles and origin != 'LATER_ATTESTATION':
                issue('TIMESTAMP_ROLE_CONFLATION', field, sorted(allowed_roles), role, [src])
            if q.get("clock_role") != time_role:
                issue("TIMESTAMP_ROLE_CONFLATION", field, time_role, q.get("clock_role", UNKNOWN), [src])
            # A time may only be sourced at a field with its declared semantic name.
            tail = ptr.rsplit("/", 1)[-1] if isinstance(ptr, str) else ""
            allowed = {time_role}
            if time_role == "responded_at":
                allowed.add("receipt_at")  # explicitly declared alias only
                if tail == "receipt_at" and not q.get("receipt_alias", False):
                    issue("TIMESTAMP_ROLE_CONFLATION", field, "Explicit receipt alias", tail, [src])
            if tail not in allowed:
                issue("TIMESTAMP_ROLE_CONFLATION", field, sorted(allowed), tail, [src])
            try:
                parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
                if parsed.tzinfo is None:
                    raise ValueError("Naive timestamp")
            except (ValueError, AttributeError, TypeError):
                issue("INVALID_TIMESTAMP", field, "Aware ISO-8601", value, [src])
        return value

    for sid in c.bad:
        issue("SOURCE_BYTES_MISMATCH", "source_bytes", c.pin_failures[sid]['expected'],
              c.pin_failures[sid]['actual'], [dict(source_id=sid,pointer='')])
    def visit_source(sid, visiting, visited):
        if sid in visiting:
            issue('SOURCE_DERIVATION_CYCLE', 'sources.derived_from', 'Acyclic independent sources', sid)
            return
        if sid in visited:
            return
        visiting.add(sid)
        for dependency in c.entries[sid].get('derived_from', []):
            if dependency not in c.entries:
                issue('SOURCE_POINTER_INVALID', 'sources.derived_from', 'Pinned source', dependency)
            else:
                visit_source(dependency, visiting, visited)
        visiting.remove(sid)
        visited.add(sid)
    visited = set()
    for sid in sorted(c.entries):
        visit_source(sid, set(), visited)
    ids = [r.get("retrieval_id") for r in bundle["retrievals"] if isinstance(r, dict)]
    if len(ids) != len(bundle["retrievals"]) or len(ids) != len(set(ids)):
        issue("CORRELATION_ID_DUPLICATE", "retrieval_id")
    reconciliation_ids = [x.get("logical_operation_id") for x in bundle["locator_reconciliations"]]
    if len(reconciliation_ids) != len(set(reconciliation_ids)):
        issue("RECONCILIATION_SCOPE_MISMATCH", "duplicate_reconciliation")
    reconciliations = {x.get("logical_operation_id"): x for x in bundle["locator_reconciliations"]}
    for r in sorted(bundle["retrievals"], key=lambda x: str(x.get("retrieval_id"))):
        prior_issues = len(issues)
        current = {"retrieval_id": r.get("retrieval_id", UNKNOWN),
                   "logical_operation_id": r.get("logical_operation_id", "NONE")}
        req, resp = r.get("request", {}), r.get("response", {})
        times = r.get("temporal_provenance", {})
        request_values = {k: claim(req, k) for k in ("repository", "ref", "path", "url")}
        response_values = {k: claim(resp, k) for k in ("repository", "ref", "path", "url", "blob")}
        observed_times = {k: claim(times, k, k) for k in
                          ("requested_at", "responded_at", "receipt_at", "event_at", "recorded_at", "verified_at")}
        request_sid, receipt_sid = r.get("request_source_id", UNKNOWN), r.get("response_source_id", UNKNOWN)
        for sid, role in ((request_sid, "REQUEST_ENVELOPE"), (receipt_sid, "CONNECTOR_RECEIPT")):
            if sid == UNKNOWN:
                missing("REQUEST_IDENTITY_UNKNOWN" if role == "REQUEST_ENVELOPE" else "RECEIPT_UNKNOWN",
                        role, profile == "EXACT_REQUEST_HISTORY" or role == "CONNECTOR_RECEIPT")
            elif sid not in c.entries or c.entries[sid]["role"] != role:
                issue("CORRELATION_SOURCE_INVALID", role, role, sid)
            else:
                d = c.docs.get(sid, {})
                correlation = d.get("retrieval_id", UNKNOWN)
                if correlation != UNKNOWN and correlation != current["retrieval_id"]:
                    issue("CORRELATION_ID_MISMATCH", role, current["retrieval_id"], correlation,
                          [{"source_id": sid, "pointer": "/retrieval_id"}])
                if correlation == UNKNOWN:
                    missing("CORRELATION_UNKNOWN", role, profile == "EXACT_REQUEST_HISTORY")
                if role == "CONNECTOR_RECEIPT" and d.get("request_source_id", current["retrieval_id"]) != current["retrieval_id"]:
                    issue("CORRELATION_ID_MISMATCH", "request_source_id")
        # Request fields cannot be sourced from a plan/returned identity or later attestation.
        for key in ("repository", "ref", "path", "url"):
            q = req.get(key, {})
            if q.get("value", UNKNOWN) == UNKNOWN:
                if key != "url":
                    missing("REQUEST_IDENTITY_UNKNOWN", "request." + key, profile == "EXACT_REQUEST_HISTORY")
                continue
            sid = q.get("source_id")
            if sid != request_sid or sid not in c.entries or c.entries[sid]["role"] != "REQUEST_ENVELOPE":
                issue("UNSUPPORTED_REQUEST_IDENTITY", key, "Issuance envelope", sid)
            elif q.get('pointer') != {'repository': '/arguments/repository_full_name',
                                      'ref': '/arguments/ref', 'path': '/arguments/path',
                                      'url': '/arguments/url'}[key]:
                issue('UNSUPPORTED_REQUEST_IDENTITY', key, 'Explicit issuance argument pointer', q.get('pointer'))
            elif c.entries[sid]["origin_kind"] not in ("AT_ISSUANCE_RECEIPT", "SYNTHETIC_FIXTURE"):
                missing("REQUEST_HISTORY_NOT_AT_ISSUANCE", key, profile == "EXACT_REQUEST_HISTORY")
        for key, q in resp.items():
            if q.get('value', UNKNOWN) != UNKNOWN and q.get('source_id') != receipt_sid:
                issue('RESPONSE_SOURCE_MISMATCH', key, receipt_sid, q.get('source_id'))
        request_ref = request_values["ref"]
        if request_ref != UNKNOWN and not HEX.fullmatch(str(request_ref)):
            missing("UNSUPPORTED_MUTABLE_REF_FOR_EXACT_CUSTODY", "request.ref", profile == "EXACT_REQUEST_HISTORY")

        parsed_return = None
        for values, label in ((request_values, "request"), (response_values, "response")):
            if values["url"] == UNKNOWN:
                if label == "response":
                    missing("RETURNED_IDENTITY_UNKNOWN", label + ".url")
                continue
            try:
                parsed = parse_locator(values["url"])
                if label == "response":
                    parsed_return = parsed
                for k in ("repository", "ref", "path"):
                    if values[k] != UNKNOWN and values[k] != parsed[k]:
                        issue("URL_IDENTITY_MISMATCH", label + "." + k, parsed[k], values[k],
                              [dict(source_id=(req if label == "request" else resp)[k]["source_id"],
                                    pointer=(req if label == "request" else resp)[k]["pointer"])])
            except UnsupportedLocator:
                missing("UNSUPPORTED_URL", label + ".url", label == "response" or profile == "EXACT_REQUEST_HISTORY")
            except (ValueError, InputError, UnicodeError):
                issue("URL_IDENTITY_INVALID", label + ".url", "Supported unambiguous HTTPS locator", "REDACTED_URL")
        for k in ("repository", "path"):
            a, b = request_values[k], response_values[k]
            if a != UNKNOWN and b != UNKNOWN and a != b:
                issue("REQUEST_RESPONSE_IDENTITY_MISMATCH", k, a, b)
        member = r.get("membership_source_id", UNKNOWN)
        content_sid = r.get("content_source_id", UNKNOWN)
        data = c.data.get(content_sid)
        actual_blob = digests(data)["git_blob_sha"] if data is not None else UNKNOWN
        if data is None:
            missing("CONTENT_UNKNOWN", "content")
        if response_values["blob"] != UNKNOWN and actual_blob != UNKNOWN and response_values["blob"] != actual_blob:
            issue("BLOB_MISMATCH", "response.blob", actual_blob, response_values["blob"])
        if response_values["blob"] == UNKNOWN:
            missing("RETURNED_IDENTITY_UNKNOWN", "response.blob")
        a, b = request_ref, response_values["ref"]
        declared = r.get("declared_identity", {})
        declared_ref = claim(declared, 'ref') if 'ref' in declared else UNKNOWN
        previous_blob = claim(declared, 'blob') if 'blob' in declared else UNKNOWN
        for field, compared in [('request.ref', a), ('declared.ref', declared_ref)]:
            if compared != UNKNOWN and HEX.fullmatch(str(compared)) and b != UNKNOWN and compared != b:
                code = ('REF_MISMATCH_BLOB_RELATION_UNKNOWN' if UNKNOWN in (previous_blob, actual_blob) else
                        'REF_MISMATCH_IDENTICAL_BLOB' if previous_blob == actual_blob else 'REF_MISMATCH_DIFFERENT_BLOB')
                issue(code, field, compared, b)
        if (member == UNKNOWN or member not in c.docs or actual_blob == UNKNOWN
                or any(response_values[k] == UNKNOWN for k in ('repository', 'ref', 'path'))):
            missing("MEMBERSHIP_UNKNOWN", "commit_path_membership")
        else:
            try:
                meta = c.entries[member]
                if meta["role"] != "TREE_MEMBERSHIP":
                    raise ValueError("Not membership evidence")
                m = c.docs[member]
                repository, commit = parse_tree_locator(m["requested_url"])
                tree = m["response"]
                if tree.get("truncated") is not False:
                    raise ValueError("Incomplete tree")
                wanted = response_values["path"]
                matches = [x for x in tree["tree"] if x.get("path") == wanted and x.get("type") == "blob"]
                if (repository != response_values["repository"] or commit != response_values["ref"]
                        or len(matches) != 1 or matches[0]["sha"] != actual_blob
                        or tree.get("sha") not in (commit, m.get("tree_sha", UNKNOWN))):
                    issue("MEMBERSHIP_IDENTITY_MISMATCH", "commit_path_blob",
                          {"repository": response_values["repository"], "ref": response_values["ref"],
                           "path": wanted, "blob": actual_blob},
                          {"repository": repository, "ref": commit, "matches": matches},
                          [dict(source_id=member, pointer="/response/tree")])
            except (KeyError, TypeError, ValueError, InputError):
                issue("MEMBERSHIP_IDENTITY_MISMATCH", "commit_path_blob", "Retained immutable complete tree", member)
        for k in ("repository", "ref", "path"):
            if response_values[k] == UNKNOWN:
                missing("RETURNED_IDENTITY_UNKNOWN", "response." + k)
        if response_values["ref"] != UNKNOWN and not HEX.fullmatch(str(response_values["ref"])):
            missing("IMMUTABLE_IDENTITY_UNKNOWN", "response.ref")

        for key in ("requested_at", "receipt_at"):
            q = times.get(key, {})
            if observed_times[key] == UNKNOWN:
                missing("SOURCE_RECEIPT_TIME_UNKNOWN", key, profile == "EXACT_REQUEST_HISTORY")
            elif q.get("capture_origin") not in ("AT_ISSUANCE_RECEIPT", "RETAINED_RESPONSE", "SYNTHETIC_FIXTURE"):
                missing("TIMING_NOT_ORIGINAL_CAPTURE", key, profile == "EXACT_REQUEST_HISTORY")
        for key, expected_sid in [('requested_at', request_sid), ('receipt_at', receipt_sid), ('responded_at', receipt_sid)]:
            q = times.get(key, {})
            if q.get('value', UNKNOWN) != UNKNOWN and q.get('source_id') != expected_sid:
                issue('TIMESTAMP_SOURCE_MISMATCH', key, expected_sid, q.get('source_id'))
        qt, rt = times.get("requested_at", {}), times.get("receipt_at", {})
        if (qt.get("clock_id") and qt.get("clock_id") == rt.get("clock_id")
                and UNKNOWN not in (observed_times["requested_at"], observed_times["receipt_at"])):
            try:
                if datetime.fromisoformat(observed_times["requested_at"].replace("Z", "+00:00")) > datetime.fromisoformat(observed_times["receipt_at"].replace("Z", "+00:00")):
                    issue("TIMESTAMP_ORDER_INVALID", "request_receipt", "request <= receipt", "reversed")
            except (ValueError, TypeError):
                pass  # Invalid time already rejected.

        supersedes = r.get("supersedes")
        if supersedes:
            try:
                src, ptr = supersedes["supersedes_claim_source"], supersedes["supersedes_claim_pointer"]
                old = c.resolve(src, ptr)
                corr = c.resolve(supersedes["correction_source_id"], supersedes["correction_pointer"])
                if (old != corr["original_source_ref"] or corr["actual_fetch_ref"] != response_values["ref"]
                        or corr["git_blob_sha"] != actual_blob or corr["source_url"] != response_values["url"]):
                    raise ValueError("Correction disagrees")
                deviations.append(dict(retrieval_id=current["retrieval_id"], type="APPEND_ONLY_REF_CORRECTION",
                                       supersedes=deepcopy(supersedes), old_ref=old, actual_ref=response_values["ref"]))
            except (KeyError, TypeError, ValueError, IndexError):
                issue("CORRECTION_SCOPE_MISMATCH", "supersedes")

        planned = r.get("planned_locator")
        if planned:
            planpath = claim(planned, "planned_path")
            actualpath = response_values["path"]
            namespace = planned.get("allowed_namespace")
            subject = planned.get("product_subject", "NONE")
            if not isinstance(namespace, str) or not actualpath.startswith(namespace.rstrip("/") + "/") or subject != "NONE":
                issue("NAMESPACE_AUTHORITY_MISMATCH", "actual_path", namespace, actualpath)
            if planpath != actualpath:
                rec = reconciliations.get(current["logical_operation_id"])
                valid = False
                if rec:
                    try:
                        raw = c.resolve(rec["source_id"], rec["pointer"])
                        raw_namespace = raw['effect_namespace']
                        legacy_suffix = ' / unchanged isolation root'
                        if raw_namespace.endswith(legacy_suffix):
                            raw_namespace = raw_namespace[:-len(legacy_suffix)]
                        publication_match = raw['actual_publication'] == response_values['ref']
                        publication_sid = rec.get('publication_membership_source_id')
                        if publication_sid:
                            pm = c.docs[publication_sid]
                            pr, pc = parse_tree_locator(pm['requested_url'])
                            matches = [x for x in pm['response']['tree']
                                       if x.get('path') == actualpath and x.get('type') == 'blob']
                            publication_match = (c.entries[publication_sid]['role'] == 'TREE_MEMBERSHIP'
                                and pr == response_values['repository'] and pc == raw['actual_publication']
                                and pm['response'].get('truncated') is False and len(matches) == 1
                                and matches[0]['sha'] == actual_blob)
                        valid = (c.entries[rec["source_id"]]["role"] == "RECONCILIATION"
                                 and raw["logical_operation_id"] == current["logical_operation_id"]
                                 and raw["planned_literal_path"] == planpath
                                 and raw["actual_published_path"] == actualpath
                                 and raw["actual_blob"] == actual_blob
                                 and publication_match
                                 and raw_namespace.rstrip("/") == namespace.rstrip("/")
                                 and bool(raw["closer"]) and bool(raw["recorded_at"])
                                 and rec["authority_artifact"] == bundle["authority_artifact"]
                                 and subject == "NONE")
                    except (KeyError, ValueError, TypeError, IndexError):
                        valid = False
                    if not valid:
                        issue("RECONCILIATION_SCOPE_MISMATCH", "planned_path")
                if valid:
                    deviations.append(dict(retrieval_id=current["retrieval_id"], type="RECONCILED_ADMINISTRATIVE_LOCATOR",
                                           intended=planpath, actual=actualpath, reconciliation=deepcopy(rec)))
                else:
                    issue("ADMINISTRATIVE_LOCATOR_MISMATCH", "planned_path", planpath, actualpath)
        row = dict(retrieval_id=current["retrieval_id"], actual_identity=response_values,
                             actual_content_blob=actual_blob, temporal_values=observed_times,
                             request_identity=request_values)
        status = ('FAIL' if len(issues)>prior_issues else 'UNKNOWN' if any(
                  x['retrieval_id']==current['retrieval_id'] and x['material'] for x in unknowns) else 'PASS')
        source_bound.append(dict(**row, claim_validation=status))
        if status == 'PASS':
            verified.append(row)
    current = {"retrieval_id": "BUNDLE", "logical_operation_id": "NONE"}
    if not bundle["retrievals"]:
        missing("NO_RETRIEVAL_EVIDENCE", "retrievals")
    seen_payloads = set()
    for item in bundle["intended_publication"]:
        if not {"path", "source_id", "bytes", "sha256", "git_blob_sha", "profile", "dependencies", "intended_path"} <= item.keys():
            raise InputError("Incomplete publication inventory")
        name = relative_path(item["path"])
        if name in seen_payloads:
            issue("PUBLICATION_PATH_DUPLICATE", "path")
        seen_payloads.add(name)
        if not name.startswith(bundle["allowed_output_root"].rstrip("/") + "/"):
            issue("NAMESPACE_AUTHORITY_MISMATCH", "publication.path", bundle["allowed_output_root"], name)
        data = c.data.get(item["source_id"])
        if data is None or any(digests(data)[k] != item[k] for k in ("bytes", "sha256", "git_blob_sha")):
            issue("PUBLICATION_PAYLOAD_MISMATCH", "publication.content")
        if item["profile"] != profile or set(item["dependencies"]) - set(ids):
            issue("PUBLICATION_DEPENDENCY_MISMATCH", "publication.dependencies")
        if item["intended_path"] not in ("NONE", name):
            issue("ADMINISTRATIVE_LOCATOR_MISMATCH", "publication.path", item["intended_path"], name)

    sortkey = lambda x: canonical(x)
    issues.sort(key=lambda x: (x["retrieval_id"], x["logical_operation_id"], x["invariant_code"],
                               x["affected_claim"], canonical(x)))
    unknowns.sort(key=sortkey)
    deviations.sort(key=sortkey)
    verdict = "FAIL" if issues else "UNKNOWN" if any(x["material"] for x in unknowns) else "PASS"
    return diagnostic_safe(dict(schema_version="Q01-result-v1", guard_version=VERSION, bundle_id=bundle["bundle_id"],
                bundle_sha256=bundle_digest(bundle), profile=profile, verdict=verdict,
                verified_claims=sorted(verified, key=sortkey), unknown_claims=unknowns,
                source_bound_claims=sorted(source_bound, key=sortkey),
                violations=issues, resolved_deviations=deviations,
                source_custody=sorted([dict(source_id=k, origin_kind=v['origin_kind'], role=v['role'])
                                       for k,v in c.entries.items()], key=sortkey),
                permitted_uses=[profile] if verdict == "PASS" else ["AUDIT_ONLY"],
                blocked_uses=[] if verdict == "PASS" else [profile]))


def approve(bundle, profile, root="."):
    result = validate_bundle(bundle, profile, root)
    return {"schema_version": "Q01-approval-v1", "bundle_sha256": result["bundle_sha256"],
            "result_sha256": hashlib.sha256(canonical(result)).hexdigest(),
            "profile": profile, "authority_control_sha": bundle["authority_control_sha"],
            "verdict": result["verdict"]}


def use_if_approved(bundle, profile, root, approval, state_check, callback,
                    expected_authority, requires_fresh_state=True):
    """Injected callback is a fake in this assignment. No actual publisher exists."""
    try:
        current = approve(bundle, profile, root)
        if (current != approval or current["verdict"] != "PASS"
                or expected_authority != bundle["authority_control_sha"]):
            return {"invoked": False, "reason": "VALIDATED_BUNDLE_CHANGED_OR_BLOCKED"}
        if requires_fresh_state and profile != "EXACT_REQUEST_HISTORY":
            return {"invoked": False, "reason": "CONTENT_NOT_FRESH_STATE"}
        if (state_check.get("result") != "PASS"
                or state_check.get("bundle_sha256") != current["bundle_sha256"]):
            return {"invoked": False, "reason": "STATE_CHECK_BLOCKED_OR_UNBOUND"}
        callback()
        return {"invoked": True, "reason": "BOTH_SCOPED_CHECKS_PASS"}
    except (InputError, OSError, ValueError):
        return {"invoked": False, "reason": "INVALID_INPUT"}


def write_new(root, name, data):
    p = contained(root, name)
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open("xb") as handle:
        handle.write(data)


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--input-root", required=True)
    p.add_argument("--bundle", required=True)
    p.add_argument("--profile", required=True)
    p.add_argument("--output", required=True)
    try:
        args = p.parse_args(argv)
        bundle = strict_json(contained(args.input_root, args.bundle).read_bytes())
        result = validate_bundle(bundle, args.profile, args.input_root)
        write_new(args.input_root, args.output, canonical(result))
        return {"PASS": 0, "FAIL": 1, "UNKNOWN": 2}[result["verdict"]]
    except (InputError, OSError, ValueError, KeyError, TypeError) as exc:
        print(json.dumps({"error": type(exc).__name__, "detail": str(exc)}), file=sys.stderr)
        return 3
    except SystemExit as exc:
        return 0 if exc.code == 0 else 3


if __name__ == "__main__":
    sys.exit(main())

