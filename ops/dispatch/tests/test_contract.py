import unittest

from ops.dispatch.contract import ContractError, transition, validate_job


def valid_job():
    return {
        "job_id": "job:dispatch:001",
        "parent_id": "epic:control:001",
        "workstream": "github-ci",
        "owner_role": "engineering-administrator",
        "reviewer_role": "independent-auditor",
        "repository": "thelingolegacy-blip/TheLingoLegacy",
        "branch": "feat/dispatch-contract-v1-2026-11-16",
        "commit_sha": "a" * 40,
        "environment": "preview",
        "risk_class": "low",
        "scope": ["validate a proposed dispatch envelope"],
        "input_refs": [],
        "dependency_ids": [],
        "allowed_tools": ["read-only-github"],
        "permission_profile": "least-privilege-read-only",
        "idempotency_key": "dispatch:job:001",
        "acceptance_tests": ["python -m unittest discover -s ops/dispatch/tests -v"],
        "timeout_seconds": 600,
        "lease_seconds": 300,
        "heartbeat_seconds": 60,
        "retry_budget": 0,
        "cost_ceiling_usd": 0,
        "start_condition": "dependencies satisfied and dispatch accepted",
        "stop_condition": "policy failure, lease expiry, or scope drift",
        "output_refs": [],
        "evidence_refs": [],
        "status": "PROPOSED",
    }


class DispatchContractTests(unittest.TestCase):
    def test_valid_preview_job(self):
        validate_job(valid_job())

    def test_unknown_owner_role_rejected(self):
        job = valid_job()
        job["owner_role"] = "unknown-operator"
        with self.assertRaisesRegex(ContractError, "unknown role"):
            validate_job(job)

    def test_unknown_reviewer_role_rejected(self):
        job = valid_job()
        job["reviewer_role"] = "unlisted-reviewer"
        with self.assertRaisesRegex(ContractError, "unknown role"):
            validate_job(job)

    def test_service_role_rejected_for_owner(self):
        job = valid_job()
        job["owner_role"] = "worker"
        with self.assertRaisesRegex(ContractError, "human role"):
            validate_job(job)

    def test_service_role_rejected_for_reviewer(self):
        job = valid_job()
        job["reviewer_role"] = "worker"
        with self.assertRaisesRegex(ContractError, "human role"):
            validate_job(job)

    def test_missing_field_fails_closed(self):
        job = valid_job()
        del job["reviewer_role"]
        with self.assertRaisesRegex(ContractError, "missing fields"):
            validate_job(job)

    def test_unknown_fields_rejected(self):
        job = valid_job()
        job["admin_override"] = True
        with self.assertRaisesRegex(ContractError, "unexpected fields"):
            validate_job(job)

    def test_owner_cannot_review_own_job(self):
        job = valid_job()
        job["reviewer_role"] = job["owner_role"]
        with self.assertRaisesRegex(ContractError, "independent"):
            validate_job(job)

    def test_short_commit_sha_rejected(self):
        job = valid_job()
        job["commit_sha"] = "abc123"
        with self.assertRaisesRegex(ContractError, "full"):
            validate_job(job)

    def test_production_environment_rejected(self):
        job = valid_job()
        job["environment"] = "production"
        with self.assertRaisesRegex(ContractError, "separate release"):
            validate_job(job)

    def test_malformed_enums_fail_closed(self):
        for key in ("environment", "risk_class", "status"):
            job = valid_job()
            job[key] = []
            with self.subTest(key=key), self.assertRaises(ContractError):
                validate_job(job)

    def test_heartbeat_must_fit_inside_lease(self):
        job = valid_job()
        job["heartbeat_seconds"] = job["lease_seconds"]
        with self.assertRaisesRegex(ContractError, "shorter"):
            validate_job(job)

    def test_negative_cost_rejected(self):
        job = valid_job()
        job["cost_ceiling_usd"] = -1
        with self.assertRaisesRegex(ContractError, "finite non-negative"):
            validate_job(job)

    def test_non_finite_cost_rejected(self):
        import math
        for value in (math.nan, math.inf, -math.inf, True):
            job = valid_job()
            job["cost_ceiling_usd"] = value
            with self.subTest(value=value), self.assertRaisesRegex(
                ContractError, "finite non-negative"
            ):
                validate_job(job)

    def test_reference_arrays_reject_non_strings(self):
        job = valid_job()
        job["allowed_tools"] = [{"tool": "all"}]
        with self.assertRaisesRegex(ContractError, "non-empty strings"):
            validate_job(job)

    def test_schema_rejects_empty_reference_strings(self):
        import json
        from pathlib import Path

        schema = json.loads(
            Path("ops/dispatch/job-envelope.schema.json").read_text()
        )
        for key in (
            "input_refs", "dependency_ids", "allowed_tools",
            "output_refs", "evidence_refs",
        ):
            with self.subTest(key=key):
                self.assertEqual(
                    schema["properties"][key]["items"]["minLength"], 1
                )

    def test_schema_rejects_whitespace_only_strings(self):
        import json
        from pathlib import Path

        schema = json.loads(
            Path("ops/dispatch/job-envelope.schema.json").read_text()
        )
        for key in (
            "workstream", "owner_role", "reviewer_role", "branch",
            "permission_profile", "start_condition", "stop_condition",
        ):
            with self.subTest(key=key):
                self.assertEqual(schema["properties"][key]["pattern"], r".*\S.*")
        for key in (
            "scope", "input_refs", "dependency_ids", "allowed_tools",
            "acceptance_tests", "output_refs", "evidence_refs",
        ):
            with self.subTest(key=key):
                self.assertEqual(schema["properties"][key]["items"]["pattern"], r".*\S.*")

    def test_valid_lifecycle_transition(self):
        self.assertEqual(transition("PROPOSED", "READY"), "READY")
        self.assertEqual(transition("RUNNING", "VERIFYING"), "VERIFYING")

    def test_invalid_lifecycle_transition_rejected(self):
        with self.assertRaisesRegex(ContractError, "not allowed"):
            transition("PROPOSED", "COMPLETE")

    def test_completion_requires_evidence_and_independent_review(self):
        with self.assertRaisesRegex(ContractError, "evidence"):
            transition("VERIFYING", "COMPLETE", evidence_refs=[])
        with self.assertRaisesRegex(ContractError, "independent"):
            transition(
                "VERIFYING", "COMPLETE", evidence_refs=["sha256:abc"],
                reviewer_id="same", owner_id="same",
            )
        self.assertEqual(
            transition(
                "VERIFYING", "COMPLETE", evidence_refs=["sha256:abc"],
                reviewer_id="reviewer-1", owner_id="owner-1",
            ),
            "COMPLETE",
        )

    def test_completion_rejects_malformed_evidence_references(self):
        for evidence in (None, "sha256:abc", [""], [None], [{}]):
            with self.subTest(evidence=evidence), self.assertRaisesRegex(
                ContractError, "evidence references"
            ):
                transition(
                    "VERIFYING", "COMPLETE", evidence_refs=evidence,
                    reviewer_id="reviewer-1", owner_id="owner-1",
                )

    def test_completion_rejects_missing_or_malformed_reviewer_identity(self):
        for reviewer, owner in (
            (None, "owner-1"), ("", "owner-1"), ("reviewer-1", None),
            ("reviewer-1", ""), ([], "owner-1"),
        ):
            with self.subTest(reviewer=reviewer, owner=owner), self.assertRaisesRegex(
                ContractError, "independent reviewer"
            ):
                transition(
                    "VERIFYING", "COMPLETE", evidence_refs=["sha256:abc"],
                    reviewer_id=reviewer, owner_id=owner,
                )


if __name__ == "__main__":
    unittest.main()
