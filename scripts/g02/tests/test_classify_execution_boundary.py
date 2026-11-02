import importlib.util
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[1] / "classify-execution-boundary.py"
SPEC = importlib.util.spec_from_file_location("classify_execution_boundary", SCRIPT)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class ExecutionBoundaryTests(unittest.TestCase):
    def test_zero_jobs_is_pre_job_without_root_cause_claim(self):
        report = MODULE.classify({"id": 101, "event": "schedule"}, {"jobs": []})
        self.assertEqual(report["execution_boundary"], "PRE_JOB_NO_JOBS")
        self.assertEqual(report["job_count"], 0)
        self.assertEqual(report["root_cause"], "NOT_ESTABLISHED_FROM_RUN_AND_JOBS_API_EVIDENCE")
        self.assertFalse(report["promotion_authorized"])

    def test_job_without_runner_assignment_is_separate_boundary(self):
        report = MODULE.classify({}, {"jobs": [{"id": 1, "name": "build", "runner_id": None}]})
        self.assertEqual(report["execution_boundary"], "JOB_EXISTS_RUNNER_UNASSIGNED")
        self.assertEqual(report["job_count"], 1)

    def test_positive_runner_identity_is_assigned(self):
        report = MODULE.classify({}, {"jobs": [{"id": 2, "runner_id": 77, "runner_name": "hosted-linux"}]})
        self.assertEqual(report["execution_boundary"], "RUNNER_ASSIGNED")

    def test_missing_jobs_array_is_rejected(self):
        with self.assertRaises(ValueError):
            MODULE.classify({}, {})


if __name__ == "__main__":
    unittest.main()
