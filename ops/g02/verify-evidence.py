#!/usr/bin/env python3
"""Fail-closed local verifier for G02 evidence and a separate independent review."""
import datetime as dt
import hashlib
import json
import pathlib
import re
import sys

REQUIRED = (
    "g02-host-preflight.txt",
    "g02-host-preflight.txt.sha256",
    "g02-runner-allocation.json",
    "g02-sentinel-result.json",
    "g02-independent-verification.json",
)
REPOSITORY = "thelingolegacy-blip/TheLingoLegacy"
RUNNER_NAME = "lingo-legacy-g02"
REQUIRED_LABELS = {"self-hosted", "linux", "x64", "lingo-g02"}
REQUIRED_SOURCE_KINDS = {"run", "job", "logs", "artifact"}
SHA_RE = re.compile(r"[0-9a-f]{40}")


def load_json(path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ValueError(f"invalid JSON evidence in {path.name}: {exc}") from exc


def valid_timestamp(value):
    if not isinstance(value, str) or not value.strip() or value.startswith("REPLACE_"):
        return False
    try:
        parsed = dt.datetime.fromisoformat(value.strip().replace("Z", "+00:00"))
    except ValueError:
        return False
    return parsed.tzinfo is not None


def main():
    if len(sys.argv) != 2:
        print("Usage: python3 ops/g02/verify-evidence.py <evidence-directory>")
        return 2

    root = pathlib.Path(sys.argv[1])
    missing = [name for name in REQUIRED if not (root / name).is_file()]
    if missing:
        print("BLOCKED: missing " + ", ".join(missing))
        print("A host preflight or workflow-produced artifact alone does not prove G02 acceptance.")
        return 1

    host_bytes = (root / "g02-host-preflight.txt").read_bytes()
    host_text = host_bytes.decode("utf-8", errors="replace")
    sidecar = (root / "g02-host-preflight.txt.sha256").read_text(
        encoding="utf-8", errors="replace"
    ).strip()
    match = re.fullmatch(
        r"([0-9a-fA-F]{64})\s+\*?g02-host-preflight\.txt", sidecar
    )
    checksum_ok = bool(
        match and hashlib.sha256(host_bytes).hexdigest().lower() == match.group(1).lower()
    )

    try:
        allocation = load_json(root / "g02-runner-allocation.json")
        sentinel = load_json(root / "g02-sentinel-result.json")
        review = load_json(root / "g02-independent-verification.json")
    except ValueError as exc:
        print(f"FAIL: {exc}")
        return 1

    steps = allocation.get("steps")
    steps = steps if isinstance(steps, list) else []
    sentinel_step_ok = any(
        isinstance(step, dict)
        and step.get("name") == "Sentinel execution proof"
        and step.get("status") == "completed"
        and step.get("conclusion") == "success"
        for step in steps
    )

    labels = allocation.get("runner_labels")
    normalized_labels = {
        str(label).strip().lower() for label in labels
    } if isinstance(labels, list) else set()

    sources = review.get("evidence_sources")
    sources = sources if isinstance(sources, list) else []
    source_kinds = {
        source.get("kind")
        for source in sources
        if isinstance(source, dict)
        and isinstance(source.get("url"), str)
        and source["url"].startswith("https://")
    }
    source_urls_valid = (
        len(sources) >= len(REQUIRED_SOURCE_KINDS)
        and REQUIRED_SOURCE_KINDS.issubset(source_kinds)
        and all(
            isinstance(source, dict)
            and isinstance(source.get("url"), str)
            and source["url"].startswith("https://")
            for source in sources
        )
    )

    checks = {
        "host_preflight_schema": "evidence_schema=lingo-g02-host-preflight-v1" in host_text,
        "host_preflight_checksum": checksum_ok,
        "allocation_schema": allocation.get("schema") == "lingo-g02-runner-allocation-v1",
        "allocation_repository": allocation.get("repository") == REPOSITORY,
        "positive_runner_id": type(allocation.get("runner_id")) is int and allocation.get("runner_id", 0) > 0,
        "exact_runner_name": allocation.get("runner_name") == RUNNER_NAME,
        "required_runner_labels": REQUIRED_LABELS.issubset(normalized_labels),
        "positive_run_id": type(allocation.get("run_id")) is int and allocation.get("run_id", 0) > 0,
        "positive_run_attempt": type(allocation.get("run_attempt")) is int and allocation.get("run_attempt", 0) > 0,
        "positive_job_id": type(allocation.get("job_id")) is int and allocation.get("job_id", 0) > 0,
        "commit_sha_format": bool(SHA_RE.fullmatch(str(allocation.get("commit_sha", "")).lower())),
        "steps_instantiated": bool(steps),
        "sentinel_step_completed_successfully": sentinel_step_ok,
        "sentinel_schema": sentinel.get("schema") == "lingo-g02-sentinel-result-v1",
        "sentinel_repository": sentinel.get("repository") == REPOSITORY,
        "sentinel_exit_zero": type(sentinel.get("sentinel_exit_code")) is int and sentinel.get("sentinel_exit_code") == 0,
        "sentinel_run_correlation": sentinel.get("run_id") == allocation.get("run_id"),
        "sentinel_attempt_correlation": sentinel.get("run_attempt") == allocation.get("run_attempt"),
        "sentinel_commit_correlation": sentinel.get("commit_sha") == allocation.get("commit_sha"),
        "review_schema": review.get("schema") == "lingo-g02-independent-verification-v1",
        "reviewer_recorded": isinstance(review.get("reviewer"), str) and bool(review.get("reviewer").strip()) and not review.get("reviewer", "").startswith("REPLACE_"),
        "review_timestamp_valid": valid_timestamp(review.get("reviewed_utc")),
        "review_run_correlation": review.get("source_run_id") == allocation.get("run_id"),
        "review_attempt_correlation": review.get("source_run_attempt") == allocation.get("run_attempt"),
        "review_job_correlation": review.get("source_job_id") == allocation.get("job_id"),
        "review_commit_correlation": review.get("source_commit_sha") == allocation.get("commit_sha"),
        "review_runner_id_correlation": review.get("source_runner_id") == allocation.get("runner_id"),
        "review_runner_name_correlation": review.get("source_runner_name") == allocation.get("runner_name"),
        "verified_run_success": review.get("verified_run_conclusion") == "success",
        "verified_job_success": review.get("verified_job_conclusion") == "success",
        "logs_retrievable": review.get("logs_retrievable") is True,
        "artifact_downloaded": review.get("artifact_downloaded") is True,
        "independent_verification_recorded": review.get("independent_verification_recorded") is True,
        "source_urls_cover_run_job_logs_artifact": source_urls_valid,
    }

    for name, ok in checks.items():
        print(("PASS " if ok else "FAIL ") + name)
    if not all(checks.values()):
        print("DISPOSITION: G02 BLOCKED")
        return 1

    print(
        "DISPOSITION: local evidence predicates pass; retain the linked source API, "
        "log, artifact, and host evidence for independent audit."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
