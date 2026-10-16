import importlib.util
import sys
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[1] / "unified_gate.py"
sys.path.insert(0, str(SCRIPT.parent))
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
                       "commit_sha": SHA, "sha256": "b" * 64, "computed_sha256": "b" * 64,
                       "digest_verification_reference": "review:artifact-sha256:7",
                       "retrieval_status": "available", "source_reference": "api:artifact:7"}],
        "verification": {"status": "verified", "producer_identity": "collector", "verifier_identity": "reviewer",
                         "verified_at_utc": "2026-10-16T12:00:00Z", "evidence_digest": "c" * 64,
                         "checks": [
                             {"check_id": "correlation", "status": "PASS", "source_reference": "review:1"},
                             {"check_id": "artifact_sha256:7", "status": "PASS", "source_reference": "review:artifact-sha256:7"}
                         ]},
        "release_probes": {"apex_status": 200, "www_status": 301, "redirect_validation": "pass", "source_reference": "probe:1"},
        "authorization": {"status": "authorized", "approval_reference": "approval:1", "approved_sha": SHA,
                          "approved_action": "release", "approver_identity": "release-owner"}
    }


class UnifiedGateTests(unittest.TestCase):
    def test_complete_record_passes(self):
        result = MODULE.evaluate(valid_evidence(), SHA, authorization_verified=True)
        self.assertEqual(result["status"], "PASS")
        self.assertTrue(result["release_authorized"])
        self.assertEqual({g["status"] for g in result["gates"]}, {"PASS"})

    def test_missing_source_sha_blocks_source_identity(self):
        e = valid_evidence()
        e["source"]["commit_sha"] = None
        result = MODULE.evaluate(e, SHA)
        self.assertEqual(next(g for g in result["gates"] if g["gate"] == "C0_SOURCE_IDENTITY")["status"], "BLOCKED")

    def test_queued_job_blocks_execution_instead_of_failing(self):
        e = valid_evidence()
        e["job"]["status"] = "queued"
        e["job"]["conclusion"] = None
        e["job"]["steps"] = []
        e["job"]["sentinel_exit_code"] = None
        result = MODULE.evaluate(e, SHA)
        self.assertEqual(next(g for g in result["gates"] if g["gate"] == "C2_EXECUTION")["status"], "BLOCKED")

    def test_blocked_independent_check_does_not_become_failure(self):
        e = valid_evidence()
        e["verification"]["checks"][0]["status"] = "BLOCKED"
        result = MODULE.evaluate(e, SHA)
        self.assertEqual(next(g for g in result["gates"] if g["gate"] == "C4_INDEPENDENT_VERIFICATION")["status"], "BLOCKED")

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

    def test_missing_computed_artifact_digest_blocks_integrity(self):
        e = valid_evidence()
        e["artifacts"][0].pop("computed_sha256")
        result = MODULE.evaluate(e, SHA)
        self.assertEqual(next(g for g in result["gates"] if g["gate"] == "C3_EVIDENCE_INTEGRITY")["status"], "BLOCKED")

    def test_mismatched_computed_artifact_digest_fails_integrity(self):
        e = valid_evidence()
        e["artifacts"][0]["computed_sha256"] = "d" * 64
        result = MODULE.evaluate(e, SHA)
        self.assertEqual(next(g for g in result["gates"] if g["gate"] == "C3_EVIDENCE_INTEGRITY")["status"], "FAIL")
        self.assertEqual(result["status"], "BLOCKED")

    def test_mismatched_artifact_digest_verification_reference_fails_verification(self):
        e = valid_evidence()
        e["artifacts"][0]["digest_verification_reference"] = "review:other-record"
        result = MODULE.evaluate(e, SHA)
        self.assertEqual(next(g for g in result["gates"] if g["gate"] == "C4_INDEPENDENT_VERIFICATION")["status"], "FAIL")
        self.assertEqual(result["status"], "BLOCKED")

    def test_missing_independent_artifact_digest_check_blocks_verification(self):
        e = valid_evidence()
        e["verification"]["checks"] = [c for c in e["verification"]["checks"] if c["check_id"] != "artifact_sha256:7"]
        result = MODULE.evaluate(e, SHA)
        self.assertEqual(next(g for g in result["gates"] if g["gate"] == "C4_INDEPENDENT_VERIFICATION")["status"], "BLOCKED")

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

    def test_unknown_log_retrieval_status_blocks_evidence(self):
        e = valid_evidence()
        e["logs"]["retrieval_status"] = "unknown"
        result = MODULE.evaluate(e, SHA)
        self.assertEqual(next(g for g in result["gates"] if g["gate"] == "C3_EVIDENCE_INTEGRITY")["status"], "BLOCKED")

    def test_unknown_public_probe_status_blocks_reachability(self):
        e = valid_evidence()
        e["release_probes"]["apex_status"] = None
        e["release_probes"]["redirect_validation"] = "unknown"
        result = MODULE.evaluate(e, SHA)
        self.assertEqual(next(g for g in result["gates"] if g["gate"] == "C5_PUBLIC_REACHABILITY")["status"], "BLOCKED")

    def test_missing_approval_evidence_blocks_authorization(self):
        e = valid_evidence()
        e["authorization"].pop("approval_reference")
        result = MODULE.evaluate(e, SHA)
        self.assertEqual(next(g for g in result["gates"] if g["gate"] == "C6_AUTHORIZATION")["status"], "BLOCKED")

    def test_self_asserted_approval_cannot_authorize_release(self):
        result = MODULE.evaluate(valid_evidence(), SHA)
        self.assertEqual(next(g for g in result["gates"] if g["gate"] == "C6_AUTHORIZATION")["status"], "BLOCKED")
        self.assertFalse(result["release_authorized"])

    def test_wrong_approval_sha_blocks_release(self):
        e = valid_evidence()
        e["authorization"]["approved_sha"] = "e" * 40
        result = MODULE.evaluate(e, SHA, authorization_verified=True)
        self.assertEqual(next(g for g in result["gates"] if g["gate"] == "C6_AUTHORIZATION")["status"], "FAIL")
        self.assertFalse(result["release_authorized"])

    def test_hosted_diagnostic_cannot_authorize_release(self):
        e = valid_evidence()
        e["job"]["runner_contract"] = "hosted-diagnostic"
        e["job"]["runner_name"] = "GitHub Actions 123"
        e["job"]["runner_labels"] = ["ubuntu-latest"]
        # Even complete evidence and an explicit release approval cannot turn
        # a hosted diagnostic run into canonical self-hosted acceptance.
        result = MODULE.evaluate(e, SHA, action="release", authorization_verified=True)
        self.assertEqual(next(g for g in result["gates"] if g["gate"] == "C1_DISPATCH")["status"], "FAIL")
        self.assertEqual(result["status"], "BLOCKED")
        self.assertFalse(result["release_authorized"])

    def test_hosted_diagnostic_remains_valid_for_diagnostic_action(self):
        e = valid_evidence()
        e["job"]["runner_contract"] = "hosted-diagnostic"
        e["job"]["runner_name"] = "GitHub Actions 123"
        e["job"]["runner_labels"] = ["ubuntu-latest"]
        e["authorization"]["approved_action"] = "diagnostic-only"
        result = MODULE.evaluate(e, SHA, action="diagnostic-only", authorization_verified=True)
        self.assertEqual(next(g for g in result["gates"] if g["gate"] == "C1_DISPATCH")["status"], "PASS")
        self.assertEqual(result["status"], "PASS")
        self.assertFalse(result["release_authorized"])


if __name__ == "__main__":
    unittest.main()
