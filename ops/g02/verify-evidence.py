#!/usr/bin/env python3
"""Fail-closed local verifier for downloaded G02 source evidence plus independent review."""
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

def load_json(path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ValueError(f"invalid JSON evidence in {path.name}: {exc}") from exc

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

    data = (root / REQUIRED[0]).read_bytes()
    sidecar = (root / REQUIRED[1]).read_text(encoding="utf-8", errors="replace").strip()
    match = re.fullmatch(r"([0-9a-fA-F]{64})\\s+\\*?g02-host-preflight\\.txt", sidecar)
    if not match or hashlib.sha256(data).hexdigest().lower() != match.group(1).lower():
        print("FAIL: host evidence checksum mismatch or malformed sidecar")
        return 1

    try:
        allocation = load_json(root / "g02-runner-allocation.json")
        sentinel = load_json(root / "g02-sentinel-result.json")
        review = load_json(root / "g02-independent-verification.json")
    except ValueError as exc:
        print(f"FAIL: {exc}")
        return 1

    checks = {
        "allocation_repository": allocation.get("repository") == "thelingolegacy-blip/TheLingoLegacy",
        "positive_runner_id": isinstance(allocation.get("runner_id"), int) and allocation.get("runner_id", 0) > 0,
        "exact_runner_name": allocation.get("runner_name") == "lingo-legacy-g02",
        "positive_run_id": isinstance(allocation.get("run_id"), int) and allocation.get("run_id", 0) > 0,
        "positive_job_id": isinstance(allocation.get("job_id"), int) and allocation.get("job_id", 0) > 0,
        "commit_sha_format": bool(re.fullmatch(r"[0-9a-f]{40}", str(allocation.get("commit_sha", "")))),
        "steps_instantiated": isinstance(allocation.get("steps"), list) and bool(allocation.get("steps")),
        "sentinel_exit_zero": sentinel.get("sentinel_exit_code") == 0,
        "sentinel_run_correlation": sentinel.get("run_id") == allocation.get("run_id"),
        "sentinel_attempt_correlation": sentinel.get("run_attempt") == allocation.get("run_attempt"),
        "sentinel_commit_correlation": sentinel.get("commit_sha") == allocation.get("commit_sha"),
        "review_schema": review.get("schema") == "lingo-g02-independent-verification-v1",
        "reviewer_recorded": isinstance(review.get("reviewer"), str) and bool(review.get("reviewer").strip()),
        "review_timestamp_recorded": isinstance(review.get("reviewed_utc"), str) and bool(review.get("reviewed_utc").strip()),
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
    }
    for name, ok in checks.items():
        print(("PASS " if ok else "FAIL ") + name)
    if not all(checks.values()):
        print("DISPOSITION: G02 BLOCKED")
        return 1
    print("DISPOSITION: local evidence predicates pass; reviewer must retain source API/log/artifact evidence for audit.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
