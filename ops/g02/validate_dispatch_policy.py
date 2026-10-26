#!/usr/bin/env python3
"""Static, read-only checks for the G02 dispatch policy and workflow."""
from __future__ import annotations
import json
import sys
from pathlib import Path

POLICY_PATH = Path("ops/g02/dispatch-policy.json")
WORKFLOW_PATH = Path(".github/workflows/g02-dispatch-control-plane.yml")

def main() -> int:
    errors = []
    try:
        policy = json.loads(POLICY_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        print(f"FAIL: policy manifest unavailable or invalid JSON ({type(exc).__name__})")
        return 1
    try:
        workflow = WORKFLOW_PATH.read_text(encoding="utf-8")
    except OSError as exc:
        print(f"FAIL: workflow unavailable ({type(exc).__name__})")
        return 1

    def require(condition: bool, message: str) -> None:
        if not condition:
            errors.append(message)

    require(policy.get("schema") == "lingo.g02.dispatch-policy/v1", "unexpected policy schema")
    require(policy.get("control_center", {}).get("release_authorization") is False, "release authorization must remain false")
    require(policy.get("control_center", {}).get("fail_closed") is True, "fail-closed must remain enabled")
    require(policy.get("assignment", {}).get("required_labels") == ["self-hosted", "linux", "x64", "lingo-g02"], "runner label contract changed")
    require(policy.get("assignment", {}).get("manual_probe_default") is False, "target probe must default to disabled")
    require(policy.get("assignment", {}).get("run_on_pull_request") is False, "target probe must not run on pull_request")
    require(policy.get("assignment", {}).get("checkout_on_target_runner") is False, "target runner must not checkout repository code")
    require(policy.get("assignment", {}).get("execute_repository_scripts_on_target_runner") is False, "target runner must not execute repository scripts")
    require(policy.get("triggers", {}).get("scheduled_polling_enabled") is False, "scheduled polling requires separate approval")
    require(policy.get("access", {}).get("secrets_in_artifacts") is False, "secrets must not be included in artifacts")
    require(policy.get("access", {}).get("raw_logs_stored") is False, "raw logs must not be stored by this collector")
    require(policy.get("access", {}).get("runner_inventory_permission_failure_means_zero") is False, "permission failure must not imply zero runners")
    require(policy.get("artifacts", {}).get("retention_days") == 14, "artifact retention differs from reviewed policy")
    require(policy.get("artifacts", {}).get("correlate_exact_run") is True, "run correlation required")
    require(policy.get("artifacts", {}).get("correlate_exact_attempt") is True, "attempt correlation required")
    require(policy.get("acceptance", {}).get("independent_review_required") is True, "independent review required")
    require(policy.get("acceptance", {}).get("diagnostics_can_authorize_release") is False, "diagnostics must never authorize release")
    require(policy.get("release_gates") == {"G02": "BLOCKED", "production": "HOLD", "fail_closed": "ACTIVE", "last_known_good": "PROTECTED"}, "protected gate state changed")
    for marker in ("workflow_dispatch:", "pull_request:", "push:", "actions: read", "contents: read", "enable_target_runner_probe", "default: false", "runs-on: [self-hosted, linux, x64, lingo-g02]", "g02-control-plane-", "g02-target-sentinel-", "BLOCKED"):
        require(marker in workflow, f"workflow missing expected marker: {marker}")
    require("actions: write" not in workflow, "workflow must not request actions: write")
    require("contents: write" not in workflow, "workflow must not request contents: write")
    require("secrets: write" not in workflow, "workflow must not request secrets: write")
    require("ruby -e 'require \"yaml\";" in workflow, "workflow YAML parse step missing")
    require("python3 -m unittest ops/g02/test_dispatch_diagnostics.py" in workflow, "diagnostic regression tests are not wired into CI")
    require("--control-plane-only" in workflow, "control-plane-only diagnostic path missing")
    require("TARGET_PROBE_ENABLED" in workflow, "target probe must be explicitly gated")
    require("validate_completed_target_run" in workflow, "completed-run validation must be explicit")
    require("expected_sha" in workflow, "expected SHA input must be available for historical-run validation")
    require("do not race it" in workflow, "parallel target-job race guard is missing")

    if errors:
        print("G02 DISPATCH POLICY VALIDATION: FAIL")
        for error in errors:
            print(f"- {error}")
        return 1
    print("G02 DISPATCH POLICY VALIDATION: PASS (static policy checks only)")
    print("This is not runner execution evidence and does not change G02 or production authorization.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
