import importlib.util
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[1] / "checkpoint_gate.py"
SPEC = importlib.util.spec_from_file_location("checkpoint_gate", SCRIPT)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
SPEC.loader.exec_module(MODULE)

SHA = "a" * 40


def valid_evidence():
    return {
        "source_sha": SHA,
        "run_id": 123,
        "run_attempt": 1,
        "job_id": 456,
        "job_status": "completed",
        "job_conclusion": "success",
        "runner_id": 9,
        "runner_name": "lingo-legacy-g02",
        "runner_group_name": "Default",
        "runner_labels": ["self-hosted", "linux", "x64", "lingo-g02"],
        "steps_count": 2,
        "sentinel": "RUNNER_EXECUTION_SENTINEL=PASS",
        "logs_retrievable": True,
        "artifact_count": 1,
        "artifact_sha256": "b" * 64,
        "independently_verified": True,
        "public_apex_status": 200,
        "public_www_status": 301,
    }


class CheckpointGateTests(unittest.TestCase):
    def test_complete_correlated_evidence_passes(self):
        accepted, passed, blocked = MODULE.evaluate(valid_evidence(), SHA)
        self.assertTrue(accepted)
        self.assertGreaterEqual(len(passed), 14)
        self.assertEqual(blocked, [])

    def test_zero_runner_id_blocks(self):
        evidence = valid_evidence()
        evidence["runner_id"] = 0
        accepted, _, blocked = MODULE.evaluate(evidence, SHA)
        self.assertFalse(accepted)
        self.assertTrue(any("real runner ID is nonzero" in item for item in blocked))

    def test_missing_logs_and_artifact_block(self):
        evidence = valid_evidence()
        evidence["logs_retrievable"] = False
        evidence["artifact_count"] = 0
        accepted, _, blocked = MODULE.evaluate(evidence, SHA)
        self.assertFalse(accepted)
        self.assertTrue(any("logs are retrievable" in item for item in blocked))
        self.assertTrue(any("at least one artifact exists" in item for item in blocked))

    def test_sha_mismatch_blocks(self):
        accepted, _, blocked = MODULE.evaluate(valid_evidence(), "c" * 40)
        self.assertFalse(accepted)
        self.assertTrue(any("evidence SHA exactly matches" in item for item in blocked))

    def test_unknown_public_status_blocks(self):
        evidence = valid_evidence()
        evidence["public_apex_status"] = None
        accepted, _, blocked = MODULE.evaluate(evidence, SHA)
        self.assertFalse(accepted)
        self.assertTrue(any("independent apex probe" in item for item in blocked))


if __name__ == "__main__":
    unittest.main()
