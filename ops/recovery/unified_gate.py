#!/usr/bin/env python3
"""Fail-closed evaluator for the canonical LINGO evidence envelope.

This evaluates supplied records; it does not authenticate external observations,
query GitHub, or mutate infrastructure. Those duties belong to trusted adapters
and an independent verifier.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any

SHA_RE = re.compile(r"^[0-9a-f]{40}$")
HASH_RE = re.compile(r"^[0-9a-f]{64}$")
REQUIRED_LABELS = {"self-hosted", "linux", "x64", "lingo-g02"}


def evaluate(e: dict[str, Any], expected_sha: str, action: str = "release") -> dict[str, Any]:
    gates: list[dict[str, Any]] = []

    def add(gate: str, checks: list[tuple[bool | None, str]], refs: list[str] | None = None) -> None:
        # True=pass, False=observed failure, None=unknown/unverifiable.
        failed = [reason for value, reason in checks if value is False]
        blocked = [reason for value, reason in checks if value is None]
        status = "FAIL" if failed else ("BLOCKED" if blocked else "PASS")
        gates.append({"gate": gate, "status": status, "reasons": failed + blocked,
                      "evidence_references": refs or []})

    source = e.get("source") or {}
    workflow = e.get("workflow") or {}
    job = e.get("job") or {}
    logs = e.get("logs") or {}
    artifacts = e.get("artifacts")
    verification = e.get("verification") or {}
    probes = e.get("release_probes") or {}
    auth = e.get("authorization") or {}

    sha = source.get("commit_sha")
    run_id, attempt, job_id = workflow.get("run_id"), workflow.get("run_attempt"), job.get("job_id")
    add("C0_SOURCE_IDENTITY", [
        (bool(SHA_RE.fullmatch(expected_sha)), "expected SHA must be a full lowercase 40-character SHA"),
        (sha == expected_sha, "source SHA must match expected SHA"),
        (workflow.get("head_sha") == expected_sha, "workflow head SHA must match expected SHA"),
        (isinstance(run_id, int) and run_id > 0, "positive workflow run ID required"),
        (isinstance(attempt, int) and attempt > 0, "positive run attempt required"),
        (isinstance(job_id, int) and job_id > 0, "positive job ID required"),
        (bool(source.get("repository")) and bool(source.get("branch")), "repository and branch required")
    ], [str(workflow.get("url") or "")])

    contract = job.get("runner_contract")
    if contract == "canonical-self-hosted":
        dispatch_checks = [
            (isinstance(job.get("runner_id"), int) and job.get("runner_id") > 0, "positive runner ID required"),
            (job.get("runner_name") == "lingo-legacy-g02", "canonical runner name mismatch"),
            (isinstance(job.get("runner_labels"), list) and REQUIRED_LABELS.issubset(set(job.get("runner_labels", []))), "required canonical runner labels missing"),
            (bool(job.get("runner_group")), "runner group evidence required")
        ]
    elif contract == "hosted-diagnostic":
        dispatch_checks = [
            (isinstance(job.get("runner_id"), int) and job.get("runner_id") > 0, "hosted diagnostic requires observed runner assignment"),
            (bool(job.get("runner_name")), "hosted runner name missing")
        ]
    elif contract == "isolated-staging":
        labels = set(job.get("runner_labels", [])) if isinstance(job.get("runner_labels"), list) else set()
        dispatch_checks = [
            (isinstance(job.get("runner_id"), int) and job.get("runner_id") > 0, "staging runner ID missing"),
            (bool(job.get("runner_name")) and "staging" in job.get("runner_name", "").lower(), "distinct staging runner identity required"),
            ("lingo-legacy-g02-staging" in labels, "staging label missing")
        ]
    else:
        dispatch_checks = [(None, "runner contract unknown; hosted, canonical, and staging evidence cannot be interchanged")]

    # A diagnostic or staging runner can produce useful evidence, but it cannot
    # satisfy the canonical execution requirement for a release action.
    if action == "release" and contract in {"hosted-diagnostic", "isolated-staging"}:
        dispatch_checks.append((False, "release requires the canonical-self-hosted runner contract"))

    add("C1_DISPATCH", dispatch_checks, [str(workflow.get("url") or "")])

    steps = job.get("steps")
    executed = isinstance(steps, list) and any(
        isinstance(s, dict) and s.get("status") == "completed" and s.get("conclusion") == "success"
        for s in steps
    )
    add("C2_EXECUTION", [
        (job.get("status") == "completed", "job completion not established" if job.get("status") in (None, "unknown", "queued", "in_progress") else "job is not completed"),
        (job.get("conclusion") == "success", "job conclusion is not success" if job.get("conclusion") is not None else "job conclusion unknown"),
        (executed if isinstance(steps, list) else None, "at least one successful executed step required"),
        (job.get("sentinel_exit_code") == 0, "sentinel exit code must be observed as zero")
    ], [str(workflow.get("url") or "")])

    artifact_ok = isinstance(artifacts, list) and len(artifacts) > 0
    artifact_checks: list[tuple[bool | None, str]] = [
        (logs.get("retrieval_status") == "available", "retrievable logs required"),
        (artifact_ok if isinstance(artifacts, list) else None, "retrievable artifact record required")
    ]
    if artifact_ok:
        for i, artifact in enumerate(artifacts):
            correlated = (artifact.get("run_id") == run_id and artifact.get("run_attempt") == attempt
                          and artifact.get("commit_sha") == expected_sha)
            artifact_checks.extend([
                (artifact.get("retrieval_status") == "available", f"artifact {i} must be retrievable"),
                (correlated, f"artifact {i} run/attempt/commit correlation mismatch"),
                (bool(artifact.get("artifact_id")) and bool(artifact.get("source_reference")), f"artifact {i} identity/source reference required"),
                (isinstance(artifact.get("sha256"), str) and bool(HASH_RE.fullmatch(artifact.get("sha256", ""))), f"artifact {i} SHA-256 missing or invalid")
            ])
    add("C3_EVIDENCE_INTEGRITY", artifact_checks,
        [str(logs.get("source_reference") or "")] + [str(a.get("source_reference") or "") for a in artifacts if isinstance(a, dict)] if isinstance(artifacts, list) else [])

    distinct = bool(verification.get("producer_identity")) and bool(verification.get("verifier_identity")) and verification.get("producer_identity") != verification.get("verifier_identity")
    checks = verification.get("checks")
    checks_ok = isinstance(checks, list) and len(checks) > 0 and all(isinstance(c, dict) and c.get("status") == "PASS" and c.get("source_reference") for c in checks)
    add("C4_INDEPENDENT_VERIFICATION", [
        (verification.get("status") == "verified", "verification status is not verified"),
        (distinct, "distinct producer and verifier identities required"),
        (bool(verification.get("verified_at_utc")), "verification timestamp missing"),
        (isinstance(verification.get("evidence_digest"), str) and bool(HASH_RE.fullmatch(verification.get("evidence_digest", ""))), "verification digest missing or invalid"),
        (checks_ok if isinstance(checks, list) else None, "all verification checks must pass with source references")
    ], [str(c.get("source_reference") or "") for c in checks if isinstance(c, dict)] if isinstance(checks, list) else [])

    apex = probes.get("apex_status")
    www = probes.get("www_status")
    add("C5_PUBLIC_REACHABILITY", [
        (apex == 200, "independent apex HTTP 200 required" if apex is not None else None),
        (www in (200, 301, 302, 307, 308), "accepted independent www response required" if www is not None else None),
        (probes.get("redirect_validation") == "pass", "redirect validation must pass" if probes.get("redirect_validation") != "unknown" else None),
        (bool(probes.get("source_reference")), "public probe source reference required")
    ], [str(probes.get("source_reference") or "")])

    auth_valid = (auth.get("status") == "authorized" and bool(auth.get("approval_reference"))
                  and auth.get("approved_sha") == expected_sha and auth.get("approved_action") == action
                  and bool(auth.get("approver_identity")))
    add("C6_AUTHORIZATION", [
        (auth_valid, "explicit approval must cover exact SHA and requested action")
    ], [str(auth.get("approval_reference") or "")])

    accepted = all(g["status"] == "PASS" for g in gates)
    return {"schema_version": "lingo.gate-result.v1", "expected_sha": expected_sha,
            "requested_action": action, "status": "PASS" if accepted else "BLOCKED",
            "gates": gates, "release_authorized": accepted}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--evidence", required=True)
    parser.add_argument("--expected-sha", required=True)
    parser.add_argument("--action", default="release")
    args = parser.parse_args()
    try:
        evidence = json.loads(Path(args.evidence).read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        print(json.dumps({"status": "BLOCKED", "error": str(exc)}))
        return 2
    if not isinstance(evidence, dict):
        print(json.dumps({"status": "BLOCKED", "error": "evidence must be a JSON object"}))
        return 2
    result = evaluate(evidence, args.expected_sha, args.action)
    print(json.dumps(result, indent=2))
    return 0 if result["status"] == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
