#!/usr/bin/env python3
"""Conservative offline structural verifier for downloaded G02 evidence."""
import hashlib
import json
import pathlib
import re
import sys

REQUIRED = ("g02-host-preflight.txt", "g02-host-preflight.txt.sha256",
            "g02-runner-allocation.json", "g02-sentinel-result.json")

def main():
    if len(sys.argv) != 2:
        print("Usage: python3 ops/g02/verify-evidence.py <evidence-directory>")
        return 2
    root = pathlib.Path(sys.argv[1])
    missing = [name for name in REQUIRED if not (root / name).is_file()]
    if missing:
        print("BLOCKED: missing " + ", ".join(missing))
        print("A host preflight alone does not prove G02 acceptance.")
        return 1
    data = (root / REQUIRED[0]).read_bytes()
    sidecar = (root / REQUIRED[1]).read_text(errors="replace").strip()
    match = re.fullmatch(r"([0-9a-fA-F]{64})\s+\*?g02-host-preflight\.txt", sidecar)
    if not match or hashlib.sha256(data).hexdigest().lower() != match.group(1).lower():
        print("FAIL: host evidence checksum mismatch or malformed sidecar")
        return 1
    try:
        allocation = json.loads((root / REQUIRED[2]).read_text())
        sentinel = json.loads((root / REQUIRED[3]).read_text())
    except Exception as exc:
        print("FAIL: invalid JSON evidence:", exc)
        return 1
    checks = {
        "repository": allocation.get("repository") == "thelingolegacy-blip/TheLingoLegacy",
        "positive_runner_id": isinstance(allocation.get("runner_id"), int) and allocation.get("runner_id", 0) > 0,
        "exact_runner_name": allocation.get("runner_name") == "lingo-legacy-g02",
        "positive_run_id": isinstance(allocation.get("run_id"), int) and allocation.get("run_id", 0) > 0,
        "positive_job_id": isinstance(allocation.get("job_id"), int) and allocation.get("job_id", 0) > 0,
        "commit_sha_format": bool(re.fullmatch(r"[0-9a-f]{40}", str(allocation.get("commit_sha", "")))),
        "steps_instantiated": isinstance(allocation.get("steps"), list) and bool(allocation.get("steps")),
        "sentinel_exit_zero": sentinel.get("sentinel_exit_code") == 0,
        "run_correlation": sentinel.get("run_id") == allocation.get("run_id"),
        "commit_correlation": sentinel.get("commit_sha") == allocation.get("commit_sha"),
        "logs_retrievable": allocation.get("logs_retrievable") is True,
        "independent_review_recorded": allocation.get("independent_verification_recorded") is True,
    }
    for name, ok in checks.items():
        print(("PASS " if ok else "FAIL ") + name)
    if not all(checks.values()):
        print("DISPOSITION: G02 BLOCKED")
        return 1
    print("DISPOSITION: local structure passes; independent source/API review is still required.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
