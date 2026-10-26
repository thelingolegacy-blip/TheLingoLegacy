#!/usr/bin/env python3
"""Offline regression tests for fail-closed G02 diagnostic predicates."""
import importlib.util
import unittest
from pathlib import Path
from unittest.mock import patch

MODULE_PATH = Path("ops/g02/dispatch_diagnostics.py")
spec = importlib.util.spec_from_file_location("g02_diagnostics", MODULE_PATH)
g02 = importlib.util.module_from_spec(spec)
spec.loader.exec_module(g02)


def fixture():
    run = {"ok": True, "data": {
        "id": 1234, "run_attempt": 2, "head_sha": "abc123", "conclusion": "success"
    }}
    jobs = {"ok": True, "data": {"jobs": [{
        "id": 5678, "name": "Target runner assignment sentinel",
        "status": "completed", "conclusion": "success",
        "runner_id": 9, "runner_name": "lingo-legacy-g02",
        "steps": [{
            "name": "Emit minimal runner identity and execution sentinel",
            "status": "completed", "conclusion": "success"
        }]
    }]}}
    artifacts = {"ok": True, "data": {"artifacts": [{
        "id": 77, "name": "g02-target-sentinel-1234-2",
        "expired": False, "size_in_bytes": 42
    }]}}
    runners = {"ok": True, "data": {"runners": []}}
    return run, jobs, artifacts, runners


class G02PredicateTests(unittest.TestCase):
    @patch.object(g02, "logs_probe", return_value={"retrievable": True})
    def test_expected_sentinel_step_and_assignment_pass_observable_checks(self, _):
        run, jobs, artifacts, runners = fixture()
        result = g02.evaluate(run, jobs, artifacts, runners, "owner/repo")
        self.assertTrue(result["predicates"]["runner_id_and_name_present"])
        self.assertTrue(result["predicates"]["sentinel_step_completed_successfully"])
        self.assertTrue(result["predicates"]["job_logs_retrievable"])
        self.assertTrue(result["predicates"]["target_artifact_metadata_present"])
        self.assertFalse(result["predicates"]["artifact_content_and_sha_independently_verified"])

    @patch.object(g02, "logs_probe", return_value={"retrievable": True})
    def test_successful_job_without_named_sentinel_fails(self, _):
        run, jobs, artifacts, runners = fixture()
        jobs["data"]["jobs"][0]["steps"][0]["name"] = "Some other successful step"
        result = g02.evaluate(run, jobs, artifacts, runners, "owner/repo")
        self.assertFalse(result["predicates"]["sentinel_step_present"])
        self.assertFalse(result["predicates"]["sentinel_step_completed_successfully"])

    @patch.object(g02, "logs_probe", return_value={"retrievable": True})
    def test_failed_sentinel_step_fails_even_if_job_is_success(self, _):
        run, jobs, artifacts, runners = fixture()
        jobs["data"]["jobs"][0]["steps"][0]["conclusion"] = "failure"
        result = g02.evaluate(run, jobs, artifacts, runners, "owner/repo")
        self.assertFalse(result["predicates"]["sentinel_step_completed_successfully"])

    @patch.object(g02, "logs_probe", return_value={"retrievable": True})
    def test_runner_id_zero_is_not_assignment(self, _):
        run, jobs, artifacts, runners = fixture()
        jobs["data"]["jobs"][0]["runner_id"] = 0
        result = g02.evaluate(run, jobs, artifacts, runners, "owner/repo")
        self.assertFalse(result["predicates"]["runner_id_and_name_present"])

    @patch.object(g02, "logs_probe", return_value={"retrievable": False})
    def test_missing_logs_fail_closed(self, _):
        run, jobs, artifacts, runners = fixture()
        result = g02.evaluate(run, jobs, artifacts, runners, "owner/repo")
        self.assertFalse(result["predicates"]["job_logs_retrievable"])

    @patch.object(g02, "logs_probe", return_value={"retrievable": True})
    def test_unavailable_api_is_not_interpreted_as_empty_success(self, _):
        run, jobs, artifacts, runners = fixture()
        jobs = {"ok": False, "error": "gh_api_failed"}
        result = g02.evaluate(run, jobs, artifacts, runners, "owner/repo")
        self.assertFalse(result["predicates"]["jobs_list_readable"])
        self.assertFalse(result["predicates"]["target_job_present"])

    @patch.object(g02, "logs_probe", return_value={"retrievable": True})
    def test_artifact_name_is_not_claimed_as_content_verification(self, _):
        run, jobs, artifacts, runners = fixture()
        result = g02.evaluate(run, jobs, artifacts, runners, "owner/repo")
        self.assertTrue(result["predicates"]["target_artifact_metadata_present"])
        self.assertFalse(result["predicates"]["artifact_content_and_sha_independently_verified"])


if __name__ == "__main__":
    unittest.main(verbosity=2)
