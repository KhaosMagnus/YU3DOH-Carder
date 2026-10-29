"""Offline Gate B receipt adapter, append-only derivation and consistency validator.

No networking or external execution. Historical receipt facts are not live status.
The D01 diagnostic list is deliberately NOT used to generate contradictions.
"""
from __future__ import annotations

import argparse
import copy
from dataclasses import dataclass
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import re
import sys

BASE = "validations/PP-002/GATE-B/"
INTENT = BASE + "000_INTENT.json"
EMITTED = BASE + "010_EMITTED.json"
CORRECTION = BASE + "060_BOOKKEEPING_CORRECTION.json"
CONTROL = "b30b5b30b3526f92598e9727a8aec7a57be4e4b9"
UNKNOWN = "UNKNOWN"
AXES = ("lifecycle", "outcome", "effect", "evidence", "cleanup", "acknowledgement")
OBSERVED_FIELDS = {"logical_operation_id", "parent_operation_id", *AXES, "source_kind", "source_id",
                   "requested_at", "responded_at", "receipt_at", "event_at", "recorded_at", "verified_at",
                   "time_source_id", "temporal_support", "evidence_scope", "state_as_of",
                   "safe_next_action", "action_scope"}
ENUMS = {
    "lifecycle": {"CONFIRMED_DONE", "CONFIRMED_NOT_DONE", "STILL_RUNNING", "UNCERTAIN"},
    "outcome": {"SUCCESS", "FAILURE", "CANCELLED", "PARTIAL", UNKNOWN, "NOT_APPLICABLE"},
    "effect": {"NO_EFFECT_CONFIRMED", "EFFECT_CONFIRMED", "POSSIBLE_EFFECT", "EFFECT_UNKNOWN", "NOT_APPLICABLE"},
    "evidence": {"EVIDENCE_VERIFIED", "EVIDENCE_AVAILABLE_UNVERIFIED", "EVIDENCE_INACCESSIBLE", "EVIDENCE_INSUFFICIENT", "NO_EVIDENCE_EXPECTED", UNKNOWN},
    "cleanup": {"CLEANUP_CONFIRMED", "CLEANUP_REQUIRED", "CLEANUP_UNKNOWN", "CLEANUP_NOT_APPLICABLE"},
    "acknowledgement": {"NOT_EMITTED_CONFIRMED", "EMITTED_ACKNOWLEDGED", "EMITTED_UNACKNOWLEDGED", UNKNOWN},
}
STEPS = {
    "B1": {"EFFECT": "Create exactly one B1 effect", "HOLD": "B1 bounded active observation window", "CLEANUP": "Explicit B1 owned-root cleanup", "FINALIZE": "B1 final receipt and manifest", "UPLOAD": "Preserve B1 raw evidence"},
    "B2": {"EFFECT": "Create exactly one B2 effect", "HOLD": "B2 completion during observer gap", "CLEANUP": "Explicit B2 owned-root cleanup", "FINALIZE": "B2 final receipt and manifest", "UPLOAD": "Preserve B2 raw evidence"},
    "B3": {"EFFECT": "Create exactly one B3 partial effect", "HOLD": "B3 parent remains active after child failure", "CHILD": "B3 intentionally failing child", "PARTIAL-UPLOAD": "Preserve B3 partial evidence before parent completion", "CLEANUP": "Explicit B3 owned-root cleanup", "FINALIZE": "B3 final receipt and manifest", "UPLOAD": "Preserve B3 final raw evidence"},
}


def stamp():
    return datetime.now(timezone.utc).isoformat()


def ref(path, pointer=""):
    return path + "#" + pointer


def digest_bytes(data):
    return {"bytes": len(data), "sha256": hashlib.sha256(data).hexdigest(),
            "git_blob_sha": hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest()}


class Evidence:
    """Verify frozen input bytes before resolving any JSON pointer."""
    def __init__(self, root, manifest):
        self.root = Path(root).resolve()
        self.manifest = json.loads(Path(manifest).read_text(encoding="utf-8"))
        if self.manifest.get("source_control_sha") != CONTROL:
            raise ValueError("Input control identity mismatch")
        self.docs = {}
        for name, expected in sorted(self.manifest["files"].items()):
            path = (self.root / name).resolve()
            if not path.is_relative_to(self.root):
                raise ValueError("Input path escapes evidence root")
            data = path.read_bytes()
            if digest_bytes(data) != expected:
                raise ValueError("Frozen evidence integrity mismatch: " + name)
            if name.endswith(".json"):
                self.docs[name] = json.loads(data)
        self.verified_at = stamp()

    def resolve(self, source_id):
        name, pointer = source_id.split("#", 1)
        value = self.docs[name]
        if pointer:
            if not pointer.startswith("/"):
                raise ValueError("Invalid JSON pointer")
            for bit in pointer[1:].split("/"):
                bit = bit.replace("~1", "/").replace("~0", "~")
                value = value[int(bit)] if isinstance(value, list) else value[bit]
        return value


@dataclass(frozen=True)
class Binding:
    operation_id: str
    parent: str
    kind: str
    source_id: str
    role: str


def bindings(evidence):
    """Identity comes from intent; state never does. Bind each identity to raw facts."""
    original = evidence.docs[EMITTED]
    jobs = {j["name"][:2]: (i, j) for i, j in enumerate(original["jobs"])}
    result = []
    for op in evidence.docs[INTENT]["operations"]:
        oid, parent = op["logical_operation_id"], op["parent_operation_id"]
        fixed = {
            "GB-INTENT-PUBLISH": ("GIT_PUBLICATION_REFERENCE", "/intent_publication", "publication"),
            "GB-OPS-CREATE": ("BRANCH_CREATE_ACK", "/branch_create", "branch"),
            "GB-EMIT": ("REF_UPDATE_ACK", "/emission", "emission"),
            "GB-WORKFLOW": ("WORKFLOW_QUERY_RECEIPT", "/workflow_status", "workflow"),
        }
        if oid in fixed:
            kind, pointer, role = fixed[oid]
        else:
            case, role = oid.split("-", 1)
            index, job = jobs[case]
            pointer = "/jobs/" + str(index)
            if role == "JOB":
                kind = "JOB_QUERY_RECEIPT"
            else:
                name = STEPS[case][role]
                found = [i for i, s in enumerate(job.get("steps", [])) if s["name"] == name]
                if found:
                    if len(found) != 1:
                        raise ValueError("Ambiguous named step")
                    kind = "STEP_QUERY_RECEIPT"
                    pointer += "/steps/" + str(found[0])
                else:
                    kind = "ABSENT_CHILD_OBSERVATION"
        result.append(Binding(oid, parent, kind, ref(EMITTED, pointer), role))
    return result


def receipt_time(evidence, category):
    """Only the preserved D02 timing attestation, never assembly/verification time."""
    key = "actual_initial_job_API_response_time" if category == "jobs" else "actual_initial_run_list_response_time"
    defects = evidence.docs[CORRECTION].get("defects", [])
    for i, d in enumerate(defects):
        if d.get("id") == "GB-D02" and key in d:
            return d[key], ref(CORRECTION, "/defects/" + str(i) + "/" + key)
    return UNKNOWN, None


def expected(evidence, binding):
    """Literal receipt facts + declared operation semantics, at their historical read."""
    node = evidence.resolve(binding.source_id)
    result = {"lifecycle": "UNCERTAIN", "outcome": UNKNOWN, "effect": "EFFECT_UNKNOWN",
              "evidence": "EVIDENCE_INSUFFICIENT", "cleanup": "CLEANUP_UNKNOWN",
              "acknowledgement": UNKNOWN, "requested_at": UNKNOWN,
              "responded_at": UNKNOWN, "receipt_at": UNKNOWN, "event_at": UNKNOWN,
              "time_source_id": None, "temporal_support": "No original receipt time retained"}
    kind = binding.kind
    if kind in {"JOB_QUERY_RECEIPT", "STEP_QUERY_RECEIPT", "ABSENT_CHILD_OBSERVATION"}:
        time, origin = receipt_time(evidence, "jobs")
        result.update(receipt_at=time, responded_at=time, time_source_id=origin,
                      temporal_support="Later durable GB-D02 attestation of original query response; not a new live read")
    elif kind == "WORKFLOW_QUERY_RECEIPT":
        time, origin = receipt_time(evidence, "workflow")
        result.update(receipt_at=time, responded_at=time, time_source_id=origin,
                      temporal_support="Later durable GB-D02 attestation of original workflow-list response")

    if kind == "ABSENT_CHILD_OBSERVATION":
        # A queued parent is not an operation-specific receipt for an absent child.
        return result
    if kind == "GIT_PUBLICATION_REFERENCE":
        if not isinstance(node, str) or not re.fullmatch(r"[0-9a-f]{40}", node):
            raise ValueError("Missing immutable publication identity")
        result.update(lifecycle="CONFIRMED_DONE", outcome="SUCCESS", effect="EFFECT_CONFIRMED",
                      evidence="EVIDENCE_VERIFIED", cleanup="CLEANUP_NOT_APPLICABLE",
                      acknowledgement="EMITTED_ACKNOWLEDGED")
        return result
    if kind == "BRANCH_CREATE_ACK":
        if node.get("logical_operation_id") != binding.operation_id or node.get("acknowledgement") != "EMITTED_ACKNOWLEDGED":
            return result
        result.update(lifecycle=node["lifecycle"], outcome=node["outcome"], effect="EFFECT_CONFIRMED",
                      evidence="EVIDENCE_VERIFIED", cleanup="CLEANUP_NOT_APPLICABLE",
                      acknowledgement=node["acknowledgement"], requested_at=node.get("issued_at", UNKNOWN),
                      event_at={"issued_at": node.get("issued_at", UNKNOWN)})
        return result
    if kind == "REF_UPDATE_ACK":
        if node.get("logical_operation_id") != binding.operation_id or node.get("acknowledgement") != "EMITTED_ACKNOWLEDGED":
            return result
        ack = node.get("acknowledged_at", UNKNOWN)
        result.update(lifecycle="CONFIRMED_DONE", outcome="SUCCESS", effect="EFFECT_CONFIRMED",
                      evidence="EVIDENCE_VERIFIED", cleanup="CLEANUP_NOT_APPLICABLE",
                      acknowledgement=node["acknowledgement"], requested_at=node.get("issued_at", UNKNOWN),
                      responded_at=ack, receipt_at=ack, time_source_id=ref(EMITTED, "/emission/acknowledged_at"),
                      temporal_support="Original guarded-update acknowledgement timestamp preserved in receipt",
                      event_at={"issued_at": node.get("issued_at", UNKNOWN), "acknowledged_at": ack})
        return result

    if kind == "WORKFLOW_QUERY_RECEIPT":
        status, conclusion = node, None
        result["event_at"] = {"created_at": evidence.docs[EMITTED]["workflow_created_at"]}
    else:
        status, conclusion = node["status"], node.get("conclusion")
        result["event_at"] = {k: node.get(k) or UNKNOWN for k in ("started_at", "completed_at")}
        if kind == "JOB_QUERY_RECEIPT":
            result["event_at"]["created_at"] = node.get("created_at", UNKNOWN)
    result.update(evidence="EVIDENCE_VERIFIED", acknowledgement="EMITTED_ACKNOWLEDGED")
    if status in {"queued", "in_progress", "waiting", "pending", "requested"} and kind != "STEP_QUERY_RECEIPT":
        result.update(lifecycle="STILL_RUNNING", outcome=UNKNOWN, effect="POSSIBLE_EFFECT")
    elif status == "in_progress":
        result.update(lifecycle="STILL_RUNNING", outcome=UNKNOWN, effect="POSSIBLE_EFFECT", cleanup="CLEANUP_NOT_APPLICABLE")
    elif status == "pending" and node.get("started_at") is None:
        result.update(lifecycle="CONFIRMED_NOT_DONE", outcome="NOT_APPLICABLE", effect="NO_EFFECT_CONFIRMED",
                      acknowledgement="NOT_EMITTED_CONFIRMED",
                      cleanup="CLEANUP_REQUIRED" if binding.role == "CLEANUP" else "CLEANUP_NOT_APPLICABLE")
    elif status == "completed":
        outcome = {"success": "SUCCESS", "failure": "FAILURE", "cancelled": "CANCELLED"}.get(conclusion, UNKNOWN)
        result.update(lifecycle="CONFIRMED_DONE", outcome=outcome, effect="EFFECT_CONFIRMED",
                      cleanup="CLEANUP_REQUIRED" if binding.role in {"EFFECT", "CHILD"} else "CLEANUP_NOT_APPLICABLE")
    return result


def derive(evidence, recorded_at, verified_at):
    intent = evidence.docs[INTENT]
    plan = [{k: op[k] for k in ("logical_operation_id", "parent_operation_id", "purpose", "operation_type",
                                "authority_artifact", "CONTROL_SHA", "harness_SHA", "effect_output_namespace", "closer")}
            for op in intent["operations"]]
    claims = []
    for b in bindings(evidence):
        claim = {"logical_operation_id": b.operation_id, "parent_operation_id": b.parent,
                 "source_kind": b.kind, "source_id": b.source_id, **expected(evidence, b),
                 "recorded_at": recorded_at, "verified_at": verified_at,
                 "evidence_scope": "Historical source receipt/absence only; not current external state or product acceptance"}
        claim["state_as_of"] = claim["receipt_at"]
        claim["safe_next_action"] = "BLOCK" if claim["lifecycle"] in {"UNCERTAIN", "CONFIRMED_NOT_DONE"} else (
            "KEEP_OBSERVING" if claim["lifecycle"] == "STILL_RUNNING" else (
            "RECONCILE_EFFECT" if claim["outcome"] in {"FAILURE", "CANCELLED", "PARTIAL"} else "REUSE_RESULT"))
        claim["action_scope"] = "Historical decision classification only; no present execution or retry authority"
        claims.append(claim)
    return {"schema": "PP002-GATE-B-R1-corrected-derivation-v1", "revalidation_control_sha": CONTROL,
            "subject_control_sha": intent["input_control_sha"], "harness_sha": intent["harness_sha"],
            "scope": "HISTORICAL_INITIAL_RECEIPTS; NOT_A_FRESH_EXTERNAL_STATUS",
            "recorded_at": recorded_at, "verified_at": verified_at,
            "planned_intent": {"source_id": ref(INTENT), "identity_only": plan},
            "observed_state": claims, "input_manifest": copy.deepcopy(evidence.manifest)}


def valid_time(value):
    if value == UNKNOWN:
        return True
    if not isinstance(value, str):
        return False
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00")).tzinfo is not None
    except ValueError:
        return False


def validate(document, evidence):
    """Identical validator for legacy negative, corrected positive and mutations."""
    problems = []
    def reject(oid, invariant, sources, detail):
        problems.append({"logical_operation_id": oid, "violated_invariant": invariant,
                         "source_evidence": sources, "detail": detail})
    all_bindings = {b.operation_id: b for b in bindings(evidence)}
    normalized = "observed_state" in document
    records = document.get("observed_state" if normalized else "operations", [])
    if not normalized or not isinstance(document.get("planned_intent"), dict):
        reject("LEDGER", "PLANNED_INTENT_NOT_SEPARATE_FROM_OBSERVED_STATE", [ref(INTENT), ref(EMITTED, "/operations")],
               "A copied mixed operations array cannot stand as a current observed ledger")
    if normalized and document.get("revalidation_control_sha") != CONTROL:
        reject("LEDGER", "CONTROL_IDENTITY_MISMATCH", [], "Derivation must bind the authorized input control")
    if normalized:
        for alias in ("observation_timestamp", "external_observation_at", "observed_at"):
            if alias in document:
                reject("LEDGER", "UNBOUND_OBSERVATION_TIME_FIELD", [], {"field": alias, "detail": "No single assembly-time alias may stand for independently timed source receipts"})
    ids = [r.get("logical_operation_id") for r in records if isinstance(r, dict)]
    if len(ids) != len(set(ids)):
        reject("LEDGER", "DUPLICATE_OPERATION_ID", [], "Exactly one claim per operation in this historical receipt view")
    for missing in sorted(set(all_bindings) - set(ids)):
        reject(missing, "MISSING_MATERIAL_OPERATION", [ref(INTENT)], "Cannot drop a material operation to make validation pass")

    if not normalized:
        actual = document.get("external_observation_at", UNKNOWN)
        expected_times = [receipt_time(evidence, x) for x in ("workflow", "jobs")]
        known = [(t, s) for t, s in expected_times if t != UNKNOWN]
        if actual != UNKNOWN and (not known or actual not in {t for t, _ in known}):
            reject("GB-WORKFLOW", "OBSERVATION_TIME_CONFLATED_WITH_ASSEMBLY", [ref(EMITTED, "/external_observation_at"), ref(EMITTED, "/recorded_at")] + [s for _, s in known],
                   {"claimed": actual, "recorded_at": document.get("recorded_at"), "supported_original_receipts": [t for t, _ in known]})

    for row in records:
        if not isinstance(row, dict):
            reject("LEDGER", "INVALID_OPERATION_RECORD", [], "Expected object")
            continue
        oid = row.get("logical_operation_id", "UNKNOWN_ID")
        if oid not in all_bindings:
            reject(oid, "UNBOUND_OPERATION_ID", [], "No frozen source binding")
            continue
        b = all_bindings[oid]
        proof = expected(evidence, b)
        claimed = {k: row.get("acknowledgement_state" if k == "acknowledgement" and not normalized else k) for k in AXES}
        sources = [b.source_id]
        if proof["time_source_id"]:
            sources.append(proof["time_source_id"])
        if proof["acknowledgement"] == "EMITTED_ACKNOWLEDGED" and claimed["acknowledgement"] == "NOT_EMITTED_CONFIRMED":
            reject(oid, "NOT_EMITTED_CONTRADICTS_POSITIVE_ACK", sources, "Positive issuance/publication/execution receipt already exists")
        if proof["lifecycle"] in {"CONFIRMED_DONE", "STILL_RUNNING"} and claimed["lifecycle"] == "CONFIRMED_NOT_DONE":
            reject(oid, "NOT_DONE_CONTRADICTS_EXECUTION", sources, {"supported": proof["lifecycle"], "claimed": claimed["lifecycle"]})
        if not normalized and (claimed["lifecycle"] == "CONFIRMED_NOT_DONE" or claimed["acknowledgement"] == "NOT_EMITTED_CONFIRMED") and proof["lifecycle"] != "CONFIRMED_NOT_DONE":
            reject(oid, "PLANNED_STATE_CARRIED_ACROSS_EMISSION", sources + [ref(EMITTED, "/run_id")],
                   "No operation-specific positive nonstart receipt supports the inherited planned state")
        if not row.get("source_kind") or not row.get("source_id"):
            reject(oid, "MATERIAL_CLAIM_WITHOUT_TRACEABLE_SOURCE", sources, "Observed fields need a resolvable operation-specific receipt identity")
        elif row["source_kind"] != b.kind or row["source_id"] != b.source_id:
            reject(oid, "SOURCE_BINDING_MISMATCH", sources, {"claimed_source": row["source_id"], "required_source": b.source_id})
        else:
            try:
                evidence.resolve(row["source_id"])
            except (KeyError, ValueError, IndexError, TypeError):
                reject(oid, "SOURCE_NOT_RESOLVABLE", sources, "Invalid source identity")
        if normalized:
            for field in sorted(set(row) - OBSERVED_FIELDS):
                reject(oid, "UNRECOGNIZED_OBSERVED_FIELD", sources, {"field": field, "detail": "Do not silently carry legacy/planned aliases into the canonical observed-state schema"})
            if row.get("parent_operation_id") != b.parent:
                reject(oid, "PARENT_IDENTITY_MISMATCH", [ref(INTENT)], "Operation identity only may be inherited from intent")
            for axis in AXES:
                if not isinstance(claimed[axis], str) or claimed[axis] not in ENUMS[axis]:
                    reject(oid, "INVALID_AXIS_VALUE", sources, {"axis": axis, "value": claimed[axis]})
                elif claimed[axis] != proof[axis]:
                    reject(oid, "AXIS_NOT_SUPPORTED_BY_SOURCE", sources, {"axis": axis, "claimed": claimed[axis], "supported": proof[axis]})
            for field in ("requested_at", "responded_at", "receipt_at", "event_at", "time_source_id"):
                if row.get(field) != proof[field]:
                    reject(oid, "TIMESTAMP_NOT_TIED_TO_SOURCE" if field != "event_at" else "EVENT_TIME_NOT_TIED_TO_SOURCE", sources,
                           {"field": field, "claimed": row.get(field), "supported": proof[field]})
            for field in ("requested_at", "responded_at", "receipt_at", "recorded_at", "verified_at"):
                if field not in row or not valid_time(row[field]):
                    reject(oid, "INVALID_OR_MISSING_TIMESTAMP_FIELD", sources, {"field": field})
            if row.get("state_as_of") != proof["receipt_at"]:
                reject(oid, "STATE_AS_OF_NOT_SOURCE_RECEIPT", sources, "Do not substitute assembly, verification or event time")
    problems.sort(key=lambda p: (p["logical_operation_id"], p["violated_invariant"], json.dumps(p["detail"], sort_keys=True)))
    return {"validator": "PP002-GATE-B-R1-consistency-v1", "result": "FAIL" if problems else "PASS",
            "valid_current_observed_ledger": not problems, "claim_scope": "Historical source-receipt view only",
            "operation_count": len(records), "invariant_violation_count": len(problems), "violations": problems}


def write_new(path, value):
    p = Path(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open("x", encoding="utf-8") as f:
        json.dump(value, f, indent=2, sort_keys=True)
        f.write("\n")


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--input-root", default=".")
    p.add_argument("--manifest", required=True)
    sub = p.add_subparsers(dest="command", required=True)
    d = sub.add_parser("derive")
    d.add_argument("--output", required=True)
    d.add_argument("--recorded-at")
    d.add_argument("--verified-at")
    v = sub.add_parser("validate")
    v.add_argument("--ledger", required=True)
    v.add_argument("--result")
    args = p.parse_args()
    evidence = Evidence(args.input_root, args.manifest)
    if args.command == "derive":
        recorded = args.recorded_at or stamp()
        verified = args.verified_at or UNKNOWN
        if not valid_time(recorded) or not valid_time(verified) or recorded == UNKNOWN:
            raise ValueError("Assembly/verification timestamps must be explicit timezone-aware values")
        document = derive(evidence, recorded, verified)
        check = validate(document, evidence)
        if check["result"] != "PASS":
            raise ValueError(json.dumps(check))
        # This clock reading is taken AFTER the consistency verification, not at
        # assembly. An explicitly supplied value reproduces archived metadata.
        if args.verified_at is None:
            verified = stamp()
            document["verified_at"] = verified
            for row in document["observed_state"]:
                row["verified_at"] = verified
        write_new(args.output, document)
        print(json.dumps({"output": args.output, "operations": len(document["observed_state"]), "result": "PASS"}, sort_keys=True))
        return 0
    document = json.loads(Path(args.ledger).read_text(encoding="utf-8"))
    result = validate(document, evidence)
    if args.result:
        write_new(args.result, result)
    print(json.dumps(result, indent=2, sort_keys=True))
    return 0 if result["result"] == "PASS" else 1


if __name__ == "__main__":
    sys.exit(main())
