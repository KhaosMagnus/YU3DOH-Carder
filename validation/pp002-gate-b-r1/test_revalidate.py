"""Required historical cases and adversarial in-memory mutations; no external work."""
import copy
import json
import os
from pathlib import Path
import shutil
import tempfile
import unittest

from revalidate import BASE, CORRECTION, EMITTED, Evidence, derive, stamp, validate


class ConsistencyTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.root = Path(os.environ.get("PP002_R1_INPUT_ROOT", "."))
        cls.manifest = Path(os.environ.get("PP002_R1_MANIFEST", "validations/PP-002/GATE-B-R1/input-manifest.json"))
        cls.evidence = Evidence(cls.root, cls.manifest)
        cls.metadata_at = stamp()

    def setUp(self):
        self.positive = derive(self.evidence, self.metadata_at, self.metadata_at)

    def row(self, oid):
        return next(x for x in self.positive["observed_state"] if x["logical_operation_id"] == oid)

    def errors(self, document=None):
        return validate(document if document is not None else self.positive, self.evidence)["violations"]

    def has(self, code, oid=None, document=None):
        self.assertTrue(any(v["violated_invariant"] == code and (oid is None or v["logical_operation_id"] == oid)
                            for v in self.errors(document)), (code, oid))

    def test_required_original_rejected_with_all_five_operations(self):
        legacy = self.evidence.docs[EMITTED]
        result = validate(legacy, self.evidence)
        self.assertEqual(result["result"], "FAIL")
        for oid in ("GB-INTENT-PUBLISH", "GB-OPS-CREATE", "GB-EMIT", "B1-EFFECT", "B1-HOLD"):
            with self.subTest(operation=oid):
                self.has("NOT_DONE_CONTRADICTS_EXECUTION", oid, legacy)
                self.has("NOT_EMITTED_CONTRADICTS_POSITIVE_ACK", oid, legacy)
                errors = [v for v in result["violations"] if v["logical_operation_id"] == oid]
                self.assertTrue(all(v["source_evidence"] for v in errors))

    def test_required_original_timestamp_defect(self):
        self.has("OBSERVATION_TIME_CONFLATED_WITH_ASSEMBLY", "GB-WORKFLOW", self.evidence.docs[EMITTED])

    def test_corrected_positive_zero_violations(self):
        result = validate(self.positive, self.evidence)
        self.assertEqual(result["result"], "PASS")
        self.assertEqual(result["invariant_violation_count"], 0)
        self.assertEqual(result["operation_count"], 24)

    def test_independent_expected_historical_states(self):
        truth = {"GB-INTENT-PUBLISH": ("CONFIRMED_DONE", "SUCCESS"),
                 "GB-OPS-CREATE": ("CONFIRMED_DONE", "SUCCESS"),
                 "GB-EMIT": ("CONFIRMED_DONE", "SUCCESS"),
                 "B1-EFFECT": ("CONFIRMED_DONE", "SUCCESS"),
                 "B1-HOLD": ("STILL_RUNNING", "UNKNOWN")}
        for oid, values in truth.items():
            with self.subTest(operation=oid):
                row = self.row(oid)
                self.assertEqual((row["lifecycle"], row["outcome"]), values)
                self.assertEqual(row["acknowledgement"], "EMITTED_ACKNOWLEDGED")
        self.assertEqual(self.row("B1-HOLD")["source_id"], BASE + "010_EMITTED.json#/jobs/0/steps/3")
        self.assertEqual(self.row("B1-HOLD")["receipt_at"], "2026-10-29T07:00:15.576Z")
        self.assertEqual(self.row("GB-WORKFLOW")["receipt_at"], "2026-10-29T07:00:15.124Z")

    def test_reintroduced_known_state_defects_rejected(self):
        for oid in ("GB-INTENT-PUBLISH", "GB-OPS-CREATE", "GB-EMIT", "B1-EFFECT", "B1-HOLD"):
            with self.subTest(operation=oid):
                document = copy.deepcopy(self.positive)
                row = next(x for x in document["observed_state"] if x["logical_operation_id"] == oid)
                row["lifecycle"] = "CONFIRMED_NOT_DONE"
                row["acknowledgement"] = "NOT_EMITTED_CONFIRMED"
                self.has("NOT_DONE_CONTRADICTS_EXECUTION", oid, document)
                self.has("NOT_EMITTED_CONTRADICTS_POSITIVE_ACK", oid, document)

    def test_missing_child_observations_are_unknown_not_planned_or_future(self):
        for oid in ("B2-EFFECT", "B3-CHILD", "B3-CLEANUP"):
            with self.subTest(operation=oid):
                row = self.row(oid)
                self.assertEqual(row["source_kind"], "ABSENT_CHILD_OBSERVATION")
                self.assertEqual(row["lifecycle"], "UNCERTAIN")
                self.assertEqual(row["outcome"], "UNKNOWN")
                self.assertEqual(row["acknowledgement"], "UNKNOWN")
        self.row("B2-EFFECT")["lifecycle"] = "CONFIRMED_NOT_DONE"
        self.has("AXIS_NOT_SUPPORTED_BY_SOURCE", "B2-EFFECT")

    def test_operation_specific_pending_step_is_positive_nonstart_evidence(self):
        row = self.row("B1-CLEANUP")
        self.assertEqual(row["lifecycle"], "CONFIRMED_NOT_DONE")
        self.assertEqual(row["acknowledgement"], "NOT_EMITTED_CONFIRMED")
        self.assertEqual(row["source_id"], BASE + "010_EMITTED.json#/jobs/0/steps/4")
        self.assertEqual(self.errors(), [])

    def test_recorded_time_cannot_be_observation_time(self):
        row = self.row("B1-HOLD")
        row["receipt_at"] = row["recorded_at"]
        row["responded_at"] = row["recorded_at"]
        row["state_as_of"] = row["recorded_at"]
        self.has("TIMESTAMP_NOT_TIED_TO_SOURCE", "B1-HOLD")

    def test_verified_time_cannot_fill_absent_receipt(self):
        row = self.row("GB-INTENT-PUBLISH")
        self.assertEqual(row["receipt_at"], "UNKNOWN")
        row["receipt_at"] = row["verified_at"]
        self.has("TIMESTAMP_NOT_TIED_TO_SOURCE", "GB-INTENT-PUBLISH")

    def test_event_time_cannot_be_relabelled_response_time(self):
        row = self.row("B1-EFFECT")
        row["receipt_at"] = row["event_at"]["completed_at"]
        self.has("TIMESTAMP_NOT_TIED_TO_SOURCE", "B1-EFFECT")

    def test_extra_assembly_observation_alias_cannot_bypass_timestamp_checks(self):
        self.positive["external_observation_at"] = self.positive["recorded_at"]
        self.has("UNBOUND_OBSERVATION_TIME_FIELD", "LEDGER")
        self.row("B1-HOLD")["observation_timestamp"] = self.metadata_at
        self.has("UNRECOGNIZED_OBSERVED_FIELD", "B1-HOLD")

    def test_legacy_ack_alias_cannot_coexist_as_an_unchecked_false_claim(self):
        self.row("B1-EFFECT")["acknowledgement_state"] = "NOT_EMITTED_CONFIRMED"
        self.has("UNRECOGNIZED_OBSERVED_FIELD", "B1-EFFECT")

    def test_missing_request_time_remains_unknown(self):
        self.assertEqual(self.row("B1-JOB")["requested_at"], "UNKNOWN")
        self.row("B1-JOB")["requested_at"] = self.metadata_at
        self.has("TIMESTAMP_NOT_TIED_TO_SOURCE", "B1-JOB")

    def test_missing_or_cross_operation_source_rejected(self):
        for oid in ("B1-JOB", "B1-EFFECT"):
            with self.subTest(operation=oid):
                doc = copy.deepcopy(self.positive)
                row = next(x for x in doc["observed_state"] if x["logical_operation_id"] == oid)
                row.pop("source_id")
                self.has("MATERIAL_CLAIM_WITHOUT_TRACEABLE_SOURCE", oid, doc)
        self.row("B1-EFFECT")["source_id"] = self.row("B1-HOLD")["source_id"]
        self.has("SOURCE_BINDING_MISMATCH", "B1-EFFECT")

    def test_intent_is_not_an_observed_state_source(self):
        self.row("B1-EFFECT")["source_id"] = BASE + "000_INTENT.json#/operations/5"
        self.has("SOURCE_BINDING_MISMATCH", "B1-EFFECT")

    def test_later_cleanup_must_not_be_projected_backward(self):
        self.row("B1-EFFECT")["cleanup"] = "CLEANUP_CONFIRMED"
        self.has("AXIS_NOT_SUPPORTED_BY_SOURCE", "B1-EFFECT")

    def test_unknown_outcome_does_not_become_success(self):
        self.row("B1-HOLD")["outcome"] = "SUCCESS"
        self.has("AXIS_NOT_SUPPORTED_BY_SOURCE", "B1-HOLD")

    def test_cannot_drop_or_duplicate_material_claims(self):
        missing = copy.deepcopy(self.positive)
        missing["observed_state"] = missing["observed_state"][1:]
        self.has("MISSING_MATERIAL_OPERATION", "GB-INTENT-PUBLISH", missing)
        duplicate = copy.deepcopy(self.positive)
        duplicate["observed_state"].append(copy.deepcopy(duplicate["observed_state"][0]))
        self.has("DUPLICATE_OPERATION_ID", document=duplicate)

    def test_parent_identity_cannot_silently_change(self):
        self.row("B1-EFFECT")["parent_operation_id"] = "B2-JOB"
        self.has("PARENT_IDENTITY_MISMATCH", "B1-EFFECT")

    def test_validator_does_not_use_d01_report_verdict_list(self):
        memory = copy.copy(self.evidence)
        memory.docs = copy.deepcopy(self.evidence.docs)
        memory.docs[CORRECTION]["defects"][0]["contradictory_operations"] = []
        found = validate(memory.docs[EMITTED], memory)["violations"]
        ids = {v["logical_operation_id"] for v in found if v["violated_invariant"] == "NOT_DONE_CONTRADICTS_EXECUTION"}
        self.assertTrue({"GB-INTENT-PUBLISH", "GB-OPS-CREATE", "GB-EMIT", "B1-EFFECT", "B1-HOLD"} <= ids)

    def test_absent_source_time_does_not_use_current_clock(self):
        memory = copy.copy(self.evidence)
        memory.docs = copy.deepcopy(self.evidence.docs)
        d = memory.docs[CORRECTION]["defects"][1]
        d.pop("actual_initial_job_API_response_time")
        doc = derive(memory, self.metadata_at, self.metadata_at)
        row = next(x for x in doc["observed_state"] if x["logical_operation_id"] == "B1-HOLD")
        self.assertEqual(row["receipt_at"], "UNKNOWN")
        self.assertEqual(row["responded_at"], "UNKNOWN")
        self.assertIsNone(row["time_source_id"])
        self.assertEqual(validate(doc, memory)["result"], "PASS")

    def test_input_byte_mutation_is_rejected(self):
        with tempfile.TemporaryDirectory(prefix="pp002-r1-integrity-") as t:
            root = Path(t)
            for name in self.evidence.manifest["files"]:
                dest = root / name
                dest.parent.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(self.root / name, dest)
            with (root / EMITTED).open("ab") as f:
                f.write(b" ")
            with self.assertRaisesRegex(ValueError, "integrity mismatch"):
                Evidence(root, self.manifest)


if __name__ == "__main__":
    unittest.main()
