#!/usr/bin/env python3
"""Build an offline, read-only G02 evidence inventory from saved GitHub API snapshots.

The tool does not call GitHub, download artifacts, execute workflows, or infer
acceptance. It inventories only files explicitly supplied by the operator.
"""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import pathlib
import re
import sys
from typing import Any


def read_json(path: pathlib.Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise ValueError(f"{path} must contain a JSON object")
    return value


def sha256_file(path: pathlib.Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def positive_int(value: Any) -> bool:
    return type(value) is int and value > 0


def safe_digest(value: Any) -> str | None:
    if not isinstance(value, str):
        return None
    candidate = value.removeprefix("sha256:")
    return candidate if re.fullmatch(r"[0-9a-fA-F]{64}", candidate) else None


def step_inventory(payload: dict[str, Any]) -> list[dict[str, Any]]:
    steps = payload.get("steps")
    if not isinstance(steps, list):
        raise ValueError("steps payload must contain a steps array")
    return [
        {
            "number": step.get("number"),
            "name": step.get("name"),
            "status": step.get("status"),
            "conclusion": step.get("conclusion"),
        }
        for step in steps if isinstance(step, dict)
    ]


def build_manifest(
    run: dict[str, Any],
    jobs_payload: dict[str, Any],
    artifacts_payload: dict[str, Any] | None = None,
    steps_dir: pathlib.Path | None = None,
    logs_dir: pathlib.Path | None = None,
    evidence_files: list[pathlib.Path] | None = None,
) -> dict[str, Any]:
    run_id = run.get("id")
    if not positive_int(run_id):
        raise ValueError("run JSON must contain a genuine positive integer id")
    jobs = jobs_payload.get("jobs")
    if not isinstance(jobs, list):
        raise ValueError("jobs JSON must contain a jobs array")

    head_sha = run.get("head_sha")
    if head_sha is not None and (
        not isinstance(head_sha, str) or not re.fullmatch(r"[0-9a-fA-F]{40}", head_sha)
    ):
        raise ValueError("run head_sha must be a 40-character hexadecimal SHA when supplied")

    inventory: list[dict[str, Any]] = []
    missing: list[dict[str, Any]] = []
    supplied_files = list(evidence_files or [])
    for job in jobs:
        if not isinstance(job, dict):
            raise ValueError("each jobs array entry must be an object")
        job_id = job.get("id")
        if not positive_int(job_id):
            raise ValueError("each job must contain a genuine positive integer id")
        if job.get("run_id") is not None and job.get("run_id") != run_id:
            raise ValueError(f"job {job_id} run_id does not match run id")

        steps_path = steps_dir / f"{job_id}.json" if steps_dir else None
        log_path = logs_dir / f"{job_id}.log" if logs_dir else None
        if steps_path and steps_path.is_file():
            steps_payload = read_json(steps_path)
            steps = step_inventory(steps_payload)
            supplied_files.append(steps_path)
            steps_state = "PROVIDED"
        else:
            steps = None
            steps_state = "NOT_RETRIEVABLE" if steps_dir else "NOT_PROVIDED"
            missing.append({"job_id": job_id, "evidence": "steps", "state": steps_state})

        if log_path and log_path.is_file():
            log = {"state": "PROVIDED", "file": log_path.name, "sha256": sha256_file(log_path)}
            supplied_files.append(log_path)
        else:
            log_state = "NOT_RETRIEVABLE" if logs_dir else "NOT_PROVIDED"
            log = {"state": log_state, "file": None, "sha256": None}
            missing.append({"job_id": job_id, "evidence": "logs", "state": log_state})

        runner_id = job.get("runner_id")
        runner_name = job.get("runner_name")
        identity_valid = (
            positive_int(runner_id)
            and isinstance(runner_name, str)
            and bool(runner_name.strip())
        )
        inventory.append({
            "id": job_id,
            "name": job.get("name"),
            "status": job.get("status"),
            "conclusion": job.get("conclusion"),
            "runner": {
                "assigned_identity_valid": identity_valid,
                "id": runner_id if identity_valid else None,
                "name": runner_name.strip() if identity_valid else None,
                "labels": job.get("labels") if isinstance(job.get("labels"), list) else [],
            },
            "steps_state": steps_state,
            "steps": steps,
            "logs": log,
        })

    artifacts: list[dict[str, Any]] | None = None
    if artifacts_payload is None:
        missing.append({"evidence": "artifacts", "state": "NOT_PROVIDED"})
        artifacts_state = "NOT_PROVIDED"
    else:
        raw_artifacts = artifacts_payload.get("artifacts")
        if not isinstance(raw_artifacts, list):
            raise ValueError("artifacts JSON must contain an artifacts array")
        artifacts_state = "PROVIDED"
        artifacts = []
        for artifact in raw_artifacts:
            if not isinstance(artifact, dict):
                raise ValueError("each artifact entry must be an object")
            workflow_run = artifact.get("workflow_run")
            if isinstance(workflow_run, dict):
                artifact_run_id = workflow_run.get("id")
                if artifact_run_id is not None and artifact_run_id != run_id:
                    raise ValueError("artifact workflow_run id does not match run id")
                artifact_sha = workflow_run.get("head_sha")
                if head_sha and artifact_sha and artifact_sha.lower() != head_sha.lower():
                    raise ValueError("artifact workflow_run head_sha does not match run head_sha")
            artifacts.append({
                "id": artifact.get("id"),
                "name": artifact.get("name"),
                "expired": artifact.get("expired"),
                "size_in_bytes": artifact.get("size_in_bytes"),
                "digest_sha256": safe_digest(artifact.get("digest")),
            })

    checksums = []
    seen: set[str] = set()
    for path in supplied_files:
        resolved = path.resolve()
        key = str(resolved)
        if key in seen:
            continue
        seen.add(key)
        if not resolved.is_file():
            raise ValueError(f"evidence file does not exist: {path}")
        checksums.append({
            "file": resolved.name,
            "sha256": sha256_file(resolved),
            "size_bytes": resolved.stat().st_size,
        })

    return {
        "schema": "lingo-g02-evidence-manifest/v1",
        "generated_at_utc": dt.datetime.now(dt.timezone.utc).isoformat(),
        "run": {
            "id": run_id,
            "name": run.get("name"),
            "event": run.get("event"),
            "status": run.get("status"),
            "conclusion": run.get("conclusion"),
            "head_branch": run.get("head_branch"),
            "head_sha": head_sha,
            "created_at": run.get("created_at"),
            "updated_at": run.get("updated_at"),
            "html_url": run.get("html_url"),
        },
        "job_count": len(inventory),
        "jobs": inventory,
        "artifacts_state": artifacts_state,
        "artifacts": artifacts,
        "evidence_checksums": checksums,
        "missing_evidence": missing,
        "root_cause": "NOT_ESTABLISHED_FROM_INVENTORY_ALONE",
        "independent_acceptance": "PENDING",
        "promotion_authorized": False,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--run-json", required=True, type=pathlib.Path)
    parser.add_argument("--jobs-json", required=True, type=pathlib.Path)
    parser.add_argument("--artifacts-json", type=pathlib.Path)
    parser.add_argument("--steps-dir", type=pathlib.Path)
    parser.add_argument("--logs-dir", type=pathlib.Path)
    parser.add_argument("--evidence-file", action="append", default=[], type=pathlib.Path)
    parser.add_argument("--output", type=pathlib.Path, default=pathlib.Path("g02-evidence-manifest.json"))
    args = parser.parse_args()
    try:
        run = read_json(args.run_json)
        jobs = read_json(args.jobs_json)
        artifacts = read_json(args.artifacts_json) if args.artifacts_json else None
        manifest = build_manifest(
            run, jobs, artifacts, args.steps_dir, args.logs_dir,
            [args.run_json, args.jobs_json] + ([args.artifacts_json] if args.artifacts_json else []) + args.evidence_file,
        )
        args.output.write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n", encoding="utf-8")
        print(json.dumps({
            "run_id": manifest["run"]["id"],
            "job_count": manifest["job_count"],
            "missing_evidence_count": len(manifest["missing_evidence"]),
            "independent_acceptance": manifest["independent_acceptance"],
            "promotion_authorized": manifest["promotion_authorized"],
            "output": str(args.output),
        }, indent=2))
        return 0
    except (OSError, json.JSONDecodeError, ValueError) as exc:
        print(f"G02_EVIDENCE_MANIFEST_ERROR: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
