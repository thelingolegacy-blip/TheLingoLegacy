#!/usr/bin/env python3
"""Fail-closed validator for runner, CI, artifact, and public-probe evidence.

This script validates supplied evidence; it does not query services or mutate
infrastructure. Missing/unknown evidence always blocks acceptance.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any

RUNNER_NAME = "lingo-legacy-g02"
SHA_RE = re.compile(r"^[0-9a-f]{40}$")


def evaluate(evidence: dict[str, Any], expected_sha: str) -> tuple[bool, list[str], list[str]]:
    passed: list[str] = []
    blocked: list[str] = []

    def require(condition: bool, gate: str, detail: str) -> None:
        (passed if condition else blocked).append(f"{gate}: {detail}")

    require(bool(SHA_RE.fullmatch(expected_sha)), "C0", "expected SHA is a full 40-character commit SHA")
    require(evidence.get("source_sha") == expected_sha, "C0", "evidence SHA exactly matches expected source SHA")
    require(isinstance(evidence.get("run_id"), int) and evidence["run_id"] > 0, "C0", "run ID is present")
    require(isinstance(evidence.get("job_id"), int) and evidence["job_id"] > 0, "C0", "job ID is present")
    require(isinstance(evidence.get("run_attempt"), int) and evidence["run_attempt"] > 0, "C0", "run attempt is present")

    require(evidence.get("job_status") == "completed", "C1", "job completed")
    require(evidence.get("job_conclusion") == "success", "C1", "job conclusion is success")
    require(isinstance(evidence.get("runner_id"), int) and evidence["runner_id"] > 0, "C1", "real runner ID is nonzero")
    require(evidence.get("runner_name") == RUNNER_NAME, "C1", f"runner name exactly matches {RUNNER_NAME}")
    labels = evidence.get("runner_labels")
    require(isinstance(labels, list) and all(x in labels for x in ["self-hosted", "linux", "x64", "lingo-g02"]), "C1", "required runner labels are present")
    require(bool(str(evidence.get("runner_group_name", "")).strip()), "C1", "runner group is recorded")

    require(isinstance(evidence.get("steps_count"), int) and evidence["steps_count"] >= 1, "C2", "at least one step executed")
    require(evidence.get("sentinel") == "RUNNER_EXECUTION_SENTINEL=PASS", "C2", "execution sentinel passed")
    require(evidence.get("logs_retrievable") is True, "C3", "logs are retrievable")
    require(isinstance(evidence.get("artifact_count"), int) and evidence["artifact_count"] >= 1, "C3", "at least one artifact exists")
    artifact_hash = evidence.get("artifact_sha256")
    require(isinstance(artifact_hash, str) and bool(re.fullmatch(r"[0-9a-f]{64}", artifact_hash)), "C3", "artifact SHA-256 is recorded")
    require(evidence.get("independently_verified") is True, "C4", "independent evidence verification is complete")
    require(evidence.get("public_apex_status") == 200, "C5", "independent apex probe returned HTTP 200")
    require(evidence.get("public_www_status") in (200, 301, 302, 307, 308), "C5", "independent www probe returned an accepted HTTP response")

    return not blocked, passed, blocked


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--evidence", required=True, help="JSON evidence record captured from actual telemetry")
    parser.add_argument("--expected-sha", required=True, help="Expected full commit SHA")
    args = parser.parse_args()

    try:
        evidence = json.loads(Path(args.evidence).read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        print(f"RESULT=BLOCKED\nEvidence file could not be read: {exc}", file=sys.stderr)
        return 2
    if not isinstance(evidence, dict):
        print("RESULT=BLOCKED\nEvidence must be a JSON object.", file=sys.stderr)
        return 2

    accepted, passed, blocked = evaluate(evidence, args.expected_sha)
    for item in passed:
        print(f"PASS {item}")
    for item in blocked:
        print(f"BLOCKED {item}")
    print("RESULT=" + ("PASS" if accepted else "BLOCKED"))
    return 0 if accepted else 1


if __name__ == "__main__":
    raise SystemExit(main())
