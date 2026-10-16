import importlib.util
from pathlib import Path
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / "incident_collector.py"
SPEC = importlib.util.spec_from_file_location("incident_collector", SCRIPT)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
SPEC.loader.exec_module(MODULE)

REPO = MODULE.DEFAULT_REPOSITORY
SHA = "a" * 40
RUN_ID, ATTEMPT, JOB_ID = 12345, 2, 67890


def run_data():
    return {"id": RUN_ID, "run_attempt": ATTEMPT, "head_sha": SHA, "status": "completed",
            "conclusion": "failure", "repository": {"full_name": REPO}}


def job_data(status="in_progress", runner_id=91, runner_name="lingo-legacy-g02", steps=None):
    if steps is None:
        steps = [{"name": "sentinel", "status": "in_progress", "conclusion": None}]
    return {"id": JOB_ID, "run_id": RUN_ID, "run_attempt": ATTEMPT, "status": status,
            "conclusion": None, "runner_id": runner_id, "runner_name": runner_name,
            "runner_group_name": "Default", "labels": ["self-hosted", "linux", "x64", "lingo-g02"],
            "steps": steps}


def request(**overrides):
    data = {"repository": REPO, "run_id": RUN_ID, "attempt": ATTEMPT,
            "job_id": JOB_ID, "commit_sha": SHA}
    data.update(overrides)
    return data


class FakeClient:
    def __init__(self, run=None, jobs=None, logs="sentinel executed", artifacts=None,
                 fail_run=False, fail_jobs=False, fail_logs=False, fail_artifacts=False):
        self.run_data = run_data() if run is None else run
        self.job_list = [job_data()] if jobs is None else jobs
        self.log_text = logs
        self.artifact_list = [{"id": 44, "workflow_run": {"id": RUN_ID}}] if artifacts is None else artifacts
        self.fail_run, self.fail_jobs = fail_run, fail_jobs
        self.fail_logs, self.fail_artifacts = fail_logs, fail_artifacts

    def run(self, repo, run_id):
        if self.fail_run: raise RuntimeError("private transport detail")
        return self.run_data

    def jobs(self, repo, run_id, attempt):
        if self.fail_jobs: raise RuntimeError("private transport detail")
        return self.job_list

    def logs(self, repo, job_id):
        if self.fail_logs: raise RuntimeError("private transport detail")
        return self.log_text

    def artifacts(self, repo, run_id):
        if self.fail_artifacts: raise RuntimeError("private transport detail")
        return self.artifact_list


class IncidentCollectorTests(unittest.TestCase):
    def collect(self, client=None, incident=None):
        return MODULE.collect_incident(incident or request(), client or FakeClient())

    def test_missing_run_blocks(self):
        report = self.collect(FakeClient(fail_run=True))
        self.assertEqual(report["status"], "BLOCKED")
        self.assertIn("inaccessible", report["findings"][0])

    def test_sha_mismatch_blocks(self):
        bad_run = run_data()
        bad_run["head_sha"] = "b" * 40
        report = self.collect(FakeClient(run=bad_run))
        self.assertEqual(report["status"], "BLOCKED")
        self.assertIn("SHA does not match", report["findings"][0])

    def test_repository_mismatch_blocks_before_api_access(self):
        client = FakeClient(fail_run=True)
        report = self.collect(client, request(repository="other/repo"))
        self.assertEqual(report["status"], "BLOCKED")
        self.assertIn("repository does not match", report["findings"][0])

    def test_queued_job_without_runner_is_unassigned(self):
        job = job_data(status="queued", runner_id=0, runner_name="", steps=[])
        report = self.collect(FakeClient(jobs=[job]))
        self.assertEqual(report["status"], "RUNNER_UNASSIGNED")
        self.assertEqual(report["acceptance"]["g02"], "BLOCKED")

    def test_assigned_runner_without_executed_steps_is_unverified(self):
        job = job_data(status="in_progress", steps=[{"name": "setup", "status": "queued"}])
        report = self.collect(FakeClient(jobs=[job]))
        self.assertEqual(report["status"], "EXECUTION_UNVERIFIED")

    def test_steps_without_retrievable_logs_are_incomplete(self):
        report = self.collect(FakeClient(fail_logs=True))
        self.assertEqual(report["status"], "EVIDENCE_INCOMPLETE")
        self.assertFalse(report["evidence"]["logs_retrievable"])

    def test_logs_without_artifact_are_incomplete(self):
        report = self.collect(FakeClient(artifacts=[]))
        self.assertEqual(report["status"], "EVIDENCE_INCOMPLETE")
        self.assertEqual(report["evidence"]["artifact_count"], 0)

    def test_correlated_evidence_does_not_unlock_g02(self):
        report = self.collect()
        self.assertEqual(report["status"], "EVIDENCE_VERIFIED")
        self.assertTrue(report["acceptance"]["incident_correlation"])
        self.assertEqual(report["acceptance"]["g02"], "BLOCKED")
        self.assertEqual(report["acceptance"]["production_promotion"], "BLOCKED")
        self.assertEqual(report["acceptance"]["last_known_good"], "PROTECTED")
        self.assertFalse(report["acceptance"]["repair_authorized"])
        self.assertFalse(report["evidence"]["independently_verified"])

    def test_attempt_mismatch_blocks(self):
        bad_run = run_data()
        bad_run["run_attempt"] = ATTEMPT + 1
        report = self.collect(FakeClient(run=bad_run))
        self.assertEqual(report["status"], "BLOCKED")
        self.assertIn("attempt does not match", report["findings"][0])

    def test_job_not_in_attempt_blocks(self):
        report = self.collect(FakeClient(jobs=[]))
        self.assertEqual(report["status"], "BLOCKED")
        self.assertIn("job not found", report["findings"][0])


if __name__ == "__main__":
    unittest.main()
