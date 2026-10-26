#!/usr/bin/env python3
"""Read-only, fail-closed G02 Actions diagnostics.

This collector never authorizes release. Metadata presence is not proof that
artifact contents match a run; artifact-content verification remains an
independent acceptance step.
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import time
from pathlib import Path
from typing import Any


TARGET_JOB_NAME = "target runner assignment sentinel"
TARGET_SENTINEL_STEP = "emit minimal runner identity and execution sentinel"


def gh_api(path: str) -> dict[str, Any]:
    """Return sanitized API status; never persist response bodies on errors."""
    try:
        proc = subprocess.run(
            ["gh", "api", path],
            capture_output=True,
            text=True,
            timeout=20,
            check=False,
        )
        if proc.returncode:
            # stderr may contain URLs or other sensitive details; do not copy it.
            return {"ok": False, "error": "gh_api_failed", "status": proc.returncode}
        try:
            return {"ok": True, "data": json.loads(proc.stdout)}
        except json.JSONDecodeError:
            return {"ok": False, "error": "invalid_json_response"}
    except (OSError, subprocess.TimeoutExpired) as exc:
        return {"ok": False, "error": type(exc).__name__}


def logs_probe(repo: str, job_id: int) -> dict[str, Any]:
    """Test endpoint retrieval without retaining log bodies or redirect URLs."""
    try:
        proc = subprocess.run(
            ["gh", "api", f"/repos/{repo}/actions/jobs/{job_id}/logs"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            timeout=20,
            check=False,
        )
        return {"retrievable": proc.returncode == 0}
    except (OSError, subprocess.TimeoutExpired) as exc:
        return {"retrievable": False, "error": type(exc).__name__}


def evaluate(run_result: dict[str, Any], jobs_result: dict[str, Any],
             artifacts_result: dict[str, Any], runners_result: dict[str, Any],
             repo: str) -> dict[str, Any]:
    """Pure predicate evaluation; unavailable data is unknown, never success."""
    run = run_result.get("data", {}) if run_result.get("ok") else {}
    jobs_data = jobs_result.get("data", {}) if jobs_result.get("ok") else {}
    artifacts_data = artifacts_result.get("data", {}) if artifacts_result.get("ok") else {}
    runners_data = runners_result.get("data", {}) if runners_result.get("ok") else {}

    jobs = jobs_data.get("jobs", []) if isinstance(jobs_data, dict) else []
    artifacts = artifacts_data.get("artifacts", []) if isinstance(artifacts_data, dict) else []
    runners = runners_data.get("runners", []) if isinstance(runners_data, dict) else []

    target_jobs = [
        job for job in jobs
        if TARGET_JOB_NAME in str(job.get("name", "")).lower()
    ]
    assigned_jobs = [
        job for job in target_jobs
        if isinstance(job.get("runner_id"), int)
        and job.get("runner_id") > 0
        and bool(job.get("runner_name"))
    ]

    sentinel_steps = []
    for job in target_jobs:
        for step in job.get("steps") or []:
            if TARGET_SENTINEL_STEP in str(step.get("name", "")).lower():
                sentinel_steps.append({
                    "job_id": job.get("id"),
                    "job_status": job.get("status"),
                    "job_conclusion": job.get("conclusion"),
                    "step_name": step.get("name"),
                    "step_status": step.get("status"),
                    "step_conclusion": step.get("conclusion"),
                })

    run_id = str(run.get("id") or "")
    attempt = run.get("run_attempt")
    expected_artifact_name = f"g02-target-sentinel-{run_id}-{attempt}" if run_id and attempt else None
    artifact_records = [
        {
            "id": item.get("id"),
            "name": item.get("name"),
            "expired": item.get("expired"),
            "size_in_bytes": item.get("size_in_bytes"),
            "created_at": item.get("created_at"),
        }
        for item in artifacts
        if expected_artifact_name
        and item.get("name") == expected_artifact_name
        and item.get("expired") is False
    ]

    log_checks = []
    for job in assigned_jobs:
        if job.get("id") is not None:
            log_checks.append({
                "job_id": job["id"],
                "runner_id": job.get("runner_id"),
                "runner_name": job.get("runner_name"),
                **logs_probe(repo, int(job["id"])),
            })

    predicates = {
        "run_record_readable": bool(run_result.get("ok")),
        "jobs_list_readable": bool(jobs_result.get("ok")),
        "artifacts_list_readable": bool(artifacts_result.get("ok")),
        "runner_inventory_readable": bool(runners_result.get("ok")),
        "target_job_present": bool(target_jobs),
        "runner_id_and_name_present": bool(assigned_jobs),
        "sentinel_step_present": bool(sentinel_steps),
        "sentinel_step_completed_successfully": any(
            step["step_status"] == "completed"
            and step["step_conclusion"] == "success"
            and step["job_status"] == "completed"
            and step["job_conclusion"] == "success"
            for step in sentinel_steps
        ),
        "job_logs_retrievable": any(item.get("retrievable") for item in log_checks),
        "target_artifact_metadata_present": bool(artifact_records),
        # This collector does not download/unpack artifact bytes. Never claim
        # the contents, embedded SHA, or provenance have been verified here.
        "artifact_content_and_sha_independently_verified": False,
    }

    return {
        "run": run,
        "jobs": jobs,
        "artifacts": artifacts,
        "runners": runners,
        "target_jobs": target_jobs,
        "assigned_jobs": assigned_jobs,
        "sentinel_steps": sentinel_steps,
        "artifact_records": artifact_records,
        "log_checks": log_checks,
        "predicates": predicates,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default="g02-evidence")
    parser.add_argument("--target-run-id", default="")
    parser.add_argument("--expected-sha", default="")
    args = parser.parse_args()

    repo = os.environ.get("GITHUB_REPOSITORY", "")
    current_run = os.environ.get("GITHUB_RUN_ID", "")
    target_run = (args.target_run_id or os.environ.get("TARGET_RUN_ID", "").strip()
                  or current_run)
    if "/" not in repo or not target_run.isdigit():
        print("FAIL: repository or target run ID is missing/invalid.", file=sys.stderr)
        return 2

    base = f"/repos/{repo}/actions"
    run_result = gh_api(f"{base}/runs/{target_run}")
    jobs_result = gh_api(f"{base}/runs/{target_run}/jobs?per_page=100")
    artifacts_result = gh_api(f"{base}/runs/{target_run}/artifacts?per_page=100")
    runners_result = gh_api(f"/repos/{repo}/actions/runners?per_page=100")
    evaluated = evaluate(run_result, jobs_result, artifacts_result, runners_result, repo)

    run = evaluated["run"]
    target_sha = args.expected_sha or str(run.get("head_sha") or "")
    observed_sha = str(run.get("head_sha") or "")
    sha_matches = bool(target_sha and observed_sha and target_sha == observed_sha)
    predicates = dict(evaluated["predicates"])
    predicates["expected_commit_sha_matches_run"] = sha_matches
    # Even when all observable predicates pass, an independent artifact-content
    # review and human acceptance are required; this report cannot unlock G02.
    report = {
        "schema": "lingo.g02.dispatch-diagnostics/v2",
        "generated_at_utc_epoch": int(time.time()),
        "repository": repo,
        "collector_run": {
            key: os.environ.get(key)
            for key in ("GITHUB_RUN_ID", "GITHUB_RUN_ATTEMPT", "GITHUB_SHA",
                        "GITHUB_EVENT_NAME", "GITHUB_REF_NAME")
        },
        "target_run": {
            key: run.get(key)
            for key in ("id", "name", "event", "status", "conclusion",
                        "head_branch", "head_sha", "run_attempt", "html_url")
        },
        "expected_sha": target_sha or None,
        "api_access": {
            "run": {"ok": run_result.get("ok", False), "error": run_result.get("error")},
            "jobs": {"ok": jobs_result.get("ok", False), "error": jobs_result.get("error")},
            "artifacts": {"ok": artifacts_result.get("ok", False), "error": artifacts_result.get("error")},
            "runner_inventory": {"ok": runners_result.get("ok", False), "error": runners_result.get("error")},
        },
        "job_evidence": [
            {
                "job_id": job.get("id"),
                "name": job.get("name"),
                "status": job.get("status"),
                "conclusion": job.get("conclusion"),
                "runner_id": job.get("runner_id"),
                "runner_name": job.get("runner_name"),
                "steps": [
                    {"name": step.get("name"), "status": step.get("status"),
                     "conclusion": step.get("conclusion")}
                    for step in (job.get("steps") or [])
                ],
            }
            for job in evaluated["jobs"]
        ],
        "sentinel_step_evidence": evaluated["sentinel_steps"],
        "runner_inventory": {
            "readable": bool(runners_result.get("ok")),
            "count_returned": len(evaluated["runners"]) if runners_result.get("ok") else None,
            "runners": [
                {"id": runner.get("id"), "name": runner.get("name"),
                 "status": runner.get("status"), "busy": runner.get("busy"),
                 "labels": [label.get("name") for label in runner.get("labels", [])]}
                for runner in evaluated["runners"]
            ] if runners_result.get("ok") else None,
            "limitation": None if runners_result.get("ok")
                else "Inventory unavailable to this token; count is unknown, not zero.",
        },
        "log_retrieval_checks": evaluated["log_checks"],
        "artifact_metadata": evaluated["artifact_records"],
        "g02_predicates": predicates,
        "g02_status": "BLOCKED_PENDING_INDEPENDENT_ACCEPTANCE",
        "release_authorization": False,
        "release_gates": {
            "G02": "BLOCKED", "production": "HOLD",
            "fail_closed": "ACTIVE", "last_known_good": "PROTECTED",
        },
        "limitations": [
            "Artifact metadata/name does not prove artifact bytes or embedded SHA.",
            "Log endpoint retrieval does not independently inspect log contents.",
            "Runner inventory visibility is limited by the token's repository/org scope.",
            "A successful diagnostic report cannot authorize release.",
        ],
        "interpretation": "Diagnostic evidence only; independent acceptance and separate release authorization remain mandatory.",
    }

    out = Path(args.output)
    out.mkdir(parents=True, exist_ok=True)
    (out / "dispatch-diagnostics.json").write_text(
        json.dumps(report, indent=2, sort_keys=True) + "\n", encoding="utf-8"
    )
    summary = [
        "# G02 Dispatch Diagnostics", "",
        f"- Target run: {target_run}",
        f"- Run conclusion: {run.get('conclusion') or 'unknown / in progress'}",
        f"- Jobs returned: {len(evaluated['jobs']) if jobs_result.get('ok') else 'unavailable'}",
        f"- Target runner job found: {predicates['target_job_present']}",
        f"- Runner assigned: {predicates['runner_id_and_name_present']}",
        f"- Sentinel step succeeded: {predicates['sentinel_step_completed_successfully']}",
        f"- Logs retrievable: {predicates['job_logs_retrievable']}",
        f"- Artifact metadata present: {predicates['target_artifact_metadata_present']}",
        "- Artifact contents independently verified: False (not performed by this collector)",
        "- G02: BLOCKED pending independent acceptance",
        "- Production: HOLD; fail-closed: ACTIVE; last-known-good: PROTECTED",
    ]
    (out / "summary.md").write_text("\n".join(summary) + "\n", encoding="utf-8")
    print("\n".join(summary))
    # A diagnostic collection can be useful while reporting failures, but the
    # process exits nonzero whenever required APIs are inaccessible or the
    # observable target predicates fail.
    required = (
        "run_record_readable", "jobs_list_readable", "artifacts_list_readable",
        "target_job_present", "runner_id_and_name_present", "sentinel_step_present",
        "sentinel_step_completed_successfully", "job_logs_retrievable",
        "target_artifact_metadata_present", "expected_commit_sha_matches_run",
    )
    return 0 if all(predicates.get(key) is True for key in required) else 1


if __name__ == "__main__":
    sys.exit(main())
