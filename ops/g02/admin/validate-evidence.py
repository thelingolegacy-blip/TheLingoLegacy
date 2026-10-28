#!/usr/bin/env python3
"""Fail-closed structural validator; never authorizes promotion or deployment."""
import json
import re
import sys
from datetime import datetime
from pathlib import Path

REQUIRED_KINDS = {
    "repository-policy", "runner-inventory", "host-health", "workflow-run",
    "job-allocation", "step-logs", "artifact-integrity", "governance",
}
EXPECTED_STATE = {"g02": "BLOCKED", "production": "HOLD", "fail_closed": "ACTIVE", "lkg": "PROTECTED"}


def valid_time(value):
    if not isinstance(value, str):
        return False
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        return parsed.tzinfo is not None and parsed.utcoffset() is not None
    except ValueError:
        return False


def main():
    if len(sys.argv) != 2:
        print("BLOCKED: usage: validate-evidence.py evidence-manifest.json", file=sys.stderr)
        return 2
    try:
        data = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        print(f"BLOCKED: cannot read manifest: {exc}", file=sys.stderr)
        return 2

    errors = []
    if data.get("schema") != "lingo-g02-administrative-evidence-v1":
        errors.append("unsupported schema")
    if data.get("repository") != "thelingolegacy-blip/TheLingoLegacy":
        errors.append("repository does not match canonical repository")
    if not valid_time(data.get("captured_utc")):
        errors.append("captured_utc must be offset-aware ISO-8601")
    state = data.get("control_state")
    if not isinstance(state, dict) or any(state.get(k) != v for k, v in EXPECTED_STATE.items()):
        errors.append("immutable control state mismatch")

    evidence = data.get("evidence")
    if not isinstance(evidence, list) or not evidence:
        errors.append("evidence must be a non-empty array")
        evidence = []
    verified_kinds = set()
    for i, item in enumerate(evidence):
        if not isinstance(item, dict):
            errors.append(f"evidence[{i}] must be an object")
            continue
        if item.get("kind") in REQUIRED_KINDS and item.get("status") == "VERIFIED":
            verified_kinds.add(item["kind"])
        for key in ("id", "source", "reviewer"):
            if not isinstance(item.get(key), str) or not item[key].strip():
                errors.append(f"evidence[{i}] missing {key}")
        if not valid_time(item.get("captured_utc")):
            errors.append(f"evidence[{i}] timestamp is not offset-aware ISO-8601")
        if not isinstance(item.get("sha256"), str) or not re.fullmatch(r"[0-9a-fA-F]{64}", item["sha256"]):
            errors.append(f"evidence[{i}] missing valid SHA-256")
        if item.get("status") != "VERIFIED":
            errors.append(f"evidence[{i}] is not VERIFIED")
    missing = sorted(REQUIRED_KINDS - verified_kinds)
    if missing:
        errors.append("missing verified evidence classes: " + ", ".join(missing))

    dispatch = data.get("dispatch")
    if not isinstance(dispatch, dict):
        errors.append("dispatch evidence missing")
    else:
        for key in ("run_id", "run_attempt", "job_id", "runner_id"):
            value = dispatch.get(key)
            if not isinstance(value, int) or isinstance(value, bool) or value <= 0:
                errors.append(f"dispatch.{key} must be a positive integer")
        for key, expected in {
            "runner_name": "lingo-legacy-g02", "runner_os": "Linux", "runner_arch": "X64",
            "required_labels_present": True, "steps_instantiated": True,
            "sentinel_executed": True, "logs_retrievable": True,
        }.items():
            if dispatch.get(key) != expected:
                errors.append(f"dispatch.{key} must equal {expected!r}")
        if not isinstance(dispatch.get("commit_sha"), str) or not re.fullmatch(r"[0-9a-fA-F]{40}", dispatch["commit_sha"]):
            errors.append("dispatch.commit_sha must be a 40-character SHA")

    review = data.get("review")
    if not isinstance(review, dict):
        errors.append("independent review record missing")
    else:
        if review.get("disposition") != "ACCEPTED":
            errors.append("independent review must be ACCEPTED")
        if not isinstance(review.get("reviewer"), str) or not review["reviewer"].strip():
            errors.append("reviewer identity missing")
        if not valid_time(review.get("reviewed_utc")):
            errors.append("reviewed_utc must be offset-aware ISO-8601")

    if errors:
        for error in errors:
            print("BLOCKED: " + error, file=sys.stderr)
        print("G02=BLOCKED\nPRODUCTION=HOLD\nFAIL_CLOSED=ACTIVE\nLKG=PROTECTED")
        return 1
    print("STRUCTURAL_PREDICATE=SATISFIED")
    print("INDEPENDENT_AUTHENTICITY=REQUIRES_EXTERNAL_REVIEW")
    print("G02=BLOCKED\nPRODUCTION=HOLD\nFAIL_CLOSED=ACTIVE\nLKG=PROTECTED")
    print("This validator cannot authorize a state transition or deployment.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
