"""Regression tests for the fail-closed G02 evidence validator."""
import json
import subprocess
import sys
import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path

VALIDATOR = Path(__file__).with_name("validate-evidence.py")
NOW = datetime.now(timezone.utc).isoformat()
KINDS = [
    "repository-policy", "runner-inventory", "host-health", "workflow-run",
    "job-allocation", "step-logs", "artifact-integrity", "governance",
]


def fixture():
    return {
        "schema": "lingo-g02-administrative-evidence-v1",
        "repository": "thelingolegacy-blip/TheLingoLegacy",
        "captured_utc": NOW,
        "control_state": {"g02": "BLOCKED", "production": "HOLD", "fail_closed": "ACTIVE", "lkg": "PROTECTED"},
        "evidence": [
            {"id": f"ev-{kind}", "kind": kind, "source": "test fixture; not real evidence",
             "captured_utc": NOW, "sha256": "a" * 64, "status": "VERIFIED", "reviewer": "test-only"}
            for kind in KINDS
        ],
        "dispatch": {
            "run_id": 1, "run_attempt": 1, "commit_sha": "b" * 40, "job_id": 2, "runner_id": 3,
            "runner_name": "lingo-legacy-g02", "runner_os": "Linux", "runner_arch": "X64",
            "required_labels_present": True, "steps_instantiated": True,
            "sentinel_executed": True, "logs_retrievable": True
        },
        "review": {"disposition": "ACCEPTED", "reviewer": "test-only", "reviewed_utc": NOW}
    }


class ValidatorTests(unittest.TestCase):
    def run_manifest(self, manifest):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "manifest.json"
            path.write_text(json.dumps(manifest), encoding="utf-8")
            return subprocess.run([sys.executable, str(VALIDATOR), str(path)], capture_output=True, text=True)

    def test_structurally_complete_manifest_does_not_authorize_gate(self):
        result = self.run_manifest(fixture())
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("G02=BLOCKED", result.stdout)
        self.assertIn("PRODUCTION=HOLD", result.stdout)
        self.assertIn("FAIL_CLOSED=ACTIVE", result.stdout)
        self.assertIn("LKG=PROTECTED", result.stdout)
        self.assertIn("cannot authorize", result.stdout)

    def test_missing_runner_id_fails_closed(self):
        manifest = fixture()
        manifest["dispatch"]["runner_id"] = 0
        result = self.run_manifest(manifest)
        self.assertEqual(result.returncode, 1)
        self.assertIn("dispatch.runner_id", result.stderr)
        self.assertIn("G02=BLOCKED", result.stdout)

    def test_unverified_evidence_fails_closed(self):
        manifest = fixture()
        manifest["evidence"][0]["status"] = "UNAVAILABLE"
        result = self.run_manifest(manifest)
        self.assertEqual(result.returncode, 1)
        self.assertIn("is not VERIFIED", result.stderr)

    def test_non_accepted_review_fails_closed(self):
        manifest = fixture()
        manifest["review"]["disposition"] = "PENDING"
        result = self.run_manifest(manifest)
        self.assertEqual(result.returncode, 1)
        self.assertIn("must be ACCEPTED", result.stderr)

    def test_mutated_control_state_fails_closed(self):
        manifest = fixture()
        manifest["control_state"]["production"] = "LIVE"
        result = self.run_manifest(manifest)
        self.assertEqual(result.returncode, 1)
        self.assertIn("immutable control state mismatch", result.stderr)


if __name__ == "__main__":
    unittest.main()
