import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[1] / "build-evidence-manifest.py"
SPEC = importlib.util.spec_from_file_location("build_evidence_manifest", SCRIPT)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class EvidenceManifestTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.steps = self.root / "steps"
        self.logs = self.root / "logs"
        self.steps.mkdir()
        self.logs.mkdir()
        self.run = {"id": 9001, "head_sha": "a" * 40, "event": "workflow_dispatch"}
        self.jobs = {"jobs": [{
            "id": 11, "run_id": 9001, "name": "build", "status": "completed",
            "conclusion": "success", "runner_id": 21, "runner_name": "g02-host",
            "labels": ["self-hosted", "linux"],
        }]}

    def tearDown(self):
        self.temp.cleanup()

    def test_missing_steps_logs_and_artifacts_remain_missing(self):
        report = MODULE.build_manifest(self.run, self.jobs, steps_dir=self.steps, logs_dir=self.logs)
        self.assertEqual(report["jobs"][0]["steps_state"], "NOT_RETRIEVABLE")
        self.assertEqual(report["jobs"][0]["logs"]["state"], "NOT_RETRIEVABLE")
        self.assertEqual(report["artifacts_state"], "NOT_PROVIDED")
        self.assertEqual(len(report["missing_evidence"]), 3)
        self.assertFalse(report["promotion_authorized"])
        self.assertEqual(report["independent_acceptance"], "PENDING")

    def test_successful_inventory_hashes_supplied_steps_and_log(self):
        step_file = self.steps / "11.json"
        step_file.write_text(json.dumps({"steps": [{"number": 1, "name": "checkout", "status": "completed", "conclusion": "success"}]}))
        log_file = self.logs / "11.log"
        log_file.write_text("synthetic fixture log\n")
        report = MODULE.build_manifest(self.run, self.jobs, {"artifacts": []}, self.steps, self.logs)
        self.assertEqual(report["jobs"][0]["steps"][0]["name"], "checkout")
        self.assertEqual(report["jobs"][0]["logs"]["state"], "PROVIDED")
        self.assertEqual(len(report["evidence_checksums"]), 2)
        self.assertEqual(report["artifacts"], [])

    def test_invalid_boolean_run_id_rejected(self):
        with self.assertRaises(ValueError):
            MODULE.build_manifest({"id": True}, self.jobs)

    def test_mismatched_job_run_id_rejected(self):
        jobs = {"jobs": [{"id": 11, "run_id": 9002}]}
        with self.assertRaises(ValueError):
            MODULE.build_manifest(self.run, jobs)

    def test_mismatched_artifact_run_id_rejected(self):
        artifacts = {"artifacts": [{"id": 1, "workflow_run": {"id": 9002}}]}
        with self.assertRaises(ValueError):
            MODULE.build_manifest(self.run, self.jobs, artifacts)

    def test_mismatched_artifact_commit_rejected(self):
        artifacts = {"artifacts": [{"id": 1, "workflow_run": {"id": 9001, "head_sha": "b" * 40}}]}
        with self.assertRaises(ValueError):
            MODULE.build_manifest(self.run, self.jobs, artifacts)

    def test_invalid_runner_identity_is_not_reported_as_assigned(self):
        jobs = {"jobs": [{"id": 11, "runner_id": True, "runner_name": "g02-host"}]}
        report = MODULE.build_manifest(self.run, jobs)
        self.assertFalse(report["jobs"][0]["runner"]["assigned_identity_valid"])
        self.assertIsNone(report["jobs"][0]["runner"]["id"])

    def test_artifact_digest_only_accepts_sha256(self):
        artifacts = {"artifacts": [{"id": 3, "name": "bundle", "digest": "sha256:" + "c" * 64}]}
        report = MODULE.build_manifest(self.run, self.jobs, artifacts)
        self.assertEqual(report["artifacts"][0]["digest_sha256"], "c" * 64)
        self.assertFalse(report["promotion_authorized"])


if __name__ == "__main__":
    unittest.main()
