import importlib.util
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[1] / "unified_gate.py"
SPEC = importlib.util.spec_from_file_location("unified_gate", SCRIPT)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
SPEC.loader.exec_module(MODULE)

SHA = "a" * 40


def valid_evidence():
    return {
        "source": {"repository": "thelingolegacy-blip/TheLingoLegacy", "branch": "test", "commit_sha": SHA},
        "workflow": {"run_id": 123, "run_attempt": 1, "workflow_name": "sentinel", "event": "workflow_dispatch", "head_sha": SHA, "url": "https://github.com/example/run/123"},
        "job": {
            "job_id": 456, "status": "completed", "conclusion": "success",
            "runner_contract": "canonical-self-hosted", "runner_id": 9,
            "runner_name": "lingo-legacy-g02", "runner_group": "Default",
            "runner_labels": ["self-hosted", "linux", "x64", "lingo-g02"],
            "steps": [{"name": "sentinel", "status": "completed", "conclusion": "success"}],
            "sentinel_exit_code": 0
        },
        "logs": {"retrieval_status": "available", "url": "https://example.test/logs", "source_reference": "api:logs:123"},
        "artifacts": [{"artifact_id": 7, "name": "evidence.zip", "run_id": 123, "run_attempt": 1,
                       "commit_sha": SHA, "sha256": "b" * 64, "retrieval_status": "available",
                       "source_reference": "api:artifact:7"}],
        "verification": {"status": "verified", "producer_identity": "collector", "verifier_identity": "reviewer",
                         "verified_at_utc": "2026-10-16T12:00:00Z", "evidence_digest": "c" * 64,
                         "checks": [{"check_id": "correlation", "status": "PASS", "source_reference": "review:1"}]},
        "release_probes": {"apex_status": 200, "www_status": 301, "redirect_validation": "pass", "source_reference": "probe:1"},
        "authorization": {"status": "authorized", "approval_reference": "approval:1", "approved_sha": SHA,
                          "approved_action": "release", "approver_identity": "release-owner"}
    }


class UnifiedGateTests(unittest.TestCase):
    def test_complete_record_passes(self):
        result = MODULE.evaluate(valid_evidence(), SHA)
        self.assertEqual(result["status"], "PASS")
        self.assertTrue(result["release_authorized"])
        self.assertEqual({g["status"] for g in result["gates"]}, {"PASS"})

    def test_unknown_runner_contract_blocks(self):
        e = valid_evidence()
        e["job"]["runner_contract"] = "unknown"
        result = MODULE.evaluate(e, SHA)
        self.assertEqual(result["status"], "BLOCKED")
        self.assertEqual(next(g for g in result["gates"] if g["gate"] == "C1_DISPATCH")["status"], "BLOCKED")

    def test_zero_runner_id_fails_dispatch(self):
        e = valid_evidence()
        e["job"]["runner_id"] = 0
        result = MODULE.evaluate(e, SHA)
        self.assertEqual(next(g for g in result["gates"] if g["gate"] == "C1_DISPATCH")["status"], "FAIL")
        self.assertEqual(result["status"], "BLOCKED")

    def test_commit_mismatch_blocks_source_and_artifact(self):
        e = valid_evidence()
        e["artifacts"][0]["commit_sha"] = "d" * 40
        result = MODULE.evaluate(e, SHA)
        self.assertEqual(next(g for g in result["gates"] if g["gate"] == "C3_EVIDENCE_INTEGRITY")["status"], "FAIL")
        self.assertEqual(result["status"], "BLOCKED")

    def test_missing_logs_blocks_evidence(self):
        e = valid_evidence()
        e["logs"]["retrieval_status"] = "unavailable"
        result = MODULE.evaluate(e, SHA)
        self.assertEqual(next(g for g in result["gates"] if g["gate"] == "C3_EVIDENCE_INTEGRITY")["status"], "FAIL")

    def test_same_producer_and_verifier_fails_independence(self):
        e = valid_evidence()
        e["verification"]["verifier_identity"] = "collector"
        result = MODULE.evaluate(e, SHA)
        self.assertEqual(next(g for g in result["gates"] if g["gate"] == "C4_INDEPENDENT_VERIFICATION")["status"], "FAIL")

    def test_wrong_approval_sha_blocks_release(self):
        e = valid_evidence()
        e["authorization"]["approved_sha"] = "e" * 40
        result = MODULE.evaluate(e, SHA)
        self.assertEqual(next(g for g in result["gates"] if g["gate"] == "C6_AUTHORIZATION")["status"], "FAIL")
        self.assertFalse(result["release_authorized"])

    def test_hosted_diagnostic_cannot_authorize_release(self):
        e = valid_evidence()
        e["job"]["runner_contract"] = "hosted-diagnostic"
        e["job"]["runner_name"] = "GitHub Actions 123"
        e["job"]["runner_labels"] = ["ubuntu-latest"]
        # Even complete evidence and an explicit release approval cannot turn
        # a hosted diagnostic run into canonical self-hosted acceptance.
        result = MODULE.evaluate(e, SHA, action="release")
        self.assertEqual(next(g for g in result["gates"] if g["gate"] == "C1_DISPATCH")["status"], "FAIL")
        self.assertEqual(result["status"], "BLOCKED")
        self.assertFalse(result["release_authorized"])

    def test_hosted_diagnostic_remains_valid_for_diagnostic_action(self):
        e = valid_evidence()
        e["job"]["runner_contract"] = "hosted-diagnostic"
        e["job"]["runner_name"] = "GitHub Actions 123"
        e["job"]["runner_labels"] = ["ubuntu-latest"]
        e["authorization"]["approved_action"] = "diagnostic-only"
        result = MODULE.evaluate(e, SHA, action="diagnostic-only")
        self.assertEqual(next(g for g in result["gates"] if g["gate"] == "C1_DISPATCH")["status"], "PASS")
        self.assertFalse(result["release_authorized"])


if __name__ == "__main__":
    unittest.main()
