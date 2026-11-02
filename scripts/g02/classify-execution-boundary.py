#!/usr/bin/env python3
"""Classify GitHub Actions startup evidence without inferring an unsupported root cause.

Inputs are saved JSON responses from:
  GET /repos/{owner}/{repo}/actions/runs/{run_id}
  GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs

This tool is offline and read-only. It never calls GitHub, dispatches workflows,
registers runners, changes repository state, or authorizes a release.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import pathlib
import sys
from typing import Any


def load_json(path: pathlib.Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise ValueError(f"{path} must contain a JSON object")
    return value


def classify(run: dict[str, Any], jobs_payload: dict[str, Any]) -> dict[str, Any]:
    jobs = jobs_payload.get("jobs")
    if not isinstance(jobs, list):
        raise ValueError("jobs payload must contain a jobs array")

    if not jobs:
        boundary = "PRE_JOB_NO_JOBS"
        explanation = (
            "The Jobs API response contains no job objects. The failure is observable "
            "before job initialization; this evidence alone does not identify the upstream cause."
        )
        next_evidence = [
            "GitHub-side workflow startup/control-plane diagnostics for this run ID and UTC timestamp",
            "Repository and organization Actions policy snapshot",
            "A controlled comparison run on an approved independent hosted workflow",
        ]
    else:
        assigned = [
            job for job in jobs
            if isinstance(job, dict)
            and isinstance(job.get("runner_id"), int)
            and job.get("runner_id") > 0
            and bool(job.get("runner_name"))
        ]
        if assigned:
            boundary = "RUNNER_ASSIGNED"
            explanation = (
                "At least one job has a positive runner ID and runner name. "
                "Inspect its steps, conclusion, logs, and artifact evidence to locate any later failure."
            )
            next_evidence = [
                "Per-job steps and conclusion",
                "Retrievable job logs",
                "Commit-correlated artifacts and checksums",
            ]
        else:
            boundary = "JOB_EXISTS_RUNNER_UNASSIGNED"
            explanation = (
                "One or more job objects exist, but none exposes both a positive runner ID "
                "and runner name. This does not establish why assignment has not occurred."
            )
            next_evidence = [
                "Job status and labels",
                "Eligible runner/group configuration and availability",
                "GitHub-side runner allocation diagnostics",
            ]

    return {
        "schema": "lingo-g02-execution-boundary-report/v1",
        "classified_at_utc": dt.datetime.now(dt.timezone.utc).isoformat(),
        "run": {
            "id": run.get("id"),
            "name": run.get("name"),
            "event": run.get("event"),
            "status": run.get("status"),
            "conclusion": run.get("conclusion"),
            "head_branch": run.get("head_branch"),
            "head_sha": run.get("head_sha"),
            "created_at": run.get("created_at"),
            "run_started_at": run.get("run_started_at"),
            "updated_at": run.get("updated_at"),
            "html_url": run.get("html_url"),
        },
        "job_count": len(jobs),
        "execution_boundary": boundary,
        "explanation": explanation,
        "root_cause": "NOT_ESTABLISHED_FROM_RUN_AND_JOBS_API_EVIDENCE",
        "next_evidence_required": next_evidence,
        "acceptance_verdict": "PENDING_INDEPENDENT_REVIEW",
        "promotion_authorized": False,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--run-json", required=True, type=pathlib.Path)
    parser.add_argument("--jobs-json", required=True, type=pathlib.Path)
    parser.add_argument("--output", type=pathlib.Path, default=pathlib.Path("g02-execution-boundary.json"))
    args = parser.parse_args()
    try:
        report = classify(load_json(args.run_json), load_json(args.jobs_json))
        args.output.write_text(json.dumps(report, indent=2, sort_keys=True) + "\n", encoding="utf-8")
        print(json.dumps({
            "execution_boundary": report["execution_boundary"],
            "job_count": report["job_count"],
            "root_cause": report["root_cause"],
            "output": str(args.output),
        }, indent=2))
        return 0
    except (OSError, json.JSONDecodeError, ValueError) as exc:
        print(f"G02_BOUNDARY_CLASSIFICATION_ERROR: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
