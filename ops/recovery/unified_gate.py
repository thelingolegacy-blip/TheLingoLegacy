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
        (None if sha is None else sha == expected_sha, "source SHA must match expected SHA"),
        (None if workflow.get("head_sha") is None else workflow.get("head_sha") == expected_sha, "workflow head SHA must match expected SHA"),
        (None if run_id is None else isinstance(run_id, int) and run_id > 0, "positive workflow run ID required"),
        (None if attempt is None else isinstance(attempt, int) and attempt > 0, "positive run attempt required"),
        (None if job_id is None else isinstance(job_id, int) and job_id > 0, "positive job ID required"),
        (None if not source.get("repository") or not source.get("branch") else True, "repository and branch required")
    ], [str(workflow.get("url") or "")])

    contract = job.get("runner_contract")
    if contract == "canonical-self-hosted":
        dispatch_checks = [
            (None if job.get("runner_id") is None else isinstance(job.get("runner_id"), int) and job.get("runner_id") > 0, "positive runner ID required"),
            (None if not job.get("runner_name") else job.get("runner_name") == "lingo-legacy-g02", "canonical runner name mismatch"),
            (None if job.get("runner_labels") is None else isinstance(job.get("runner_labels"), list) and REQUIRED_LABELS.issubset(set(job.get("runner_labels", []))), "required canonical runner labels missing"),
            (None if job.get("runner_group") is None else bool(job.get("runner_group")), "runner group evidence required")
        ]
    elif contract == "hosted-diagnostic":
        dispatch_checks = [
            (None if job.get("runner_id") is None else isinstance(job.get("runner_id"), int) and job.get("runner_id") > 0, "hosted diagnostic requires observed runner assignment"),
            (None if not job.get("runner_name") else True, "hosted runner name missing")
        ]
    elif contract == "isolated-staging":
        labels = set(job.get("runner_labels", [])) if isinstance(job.get("runner_labels"), list) else set()
        dispatch_checks = [
            (None if job.get("runner_id") is None else isinstance(job.get("runner_id"), int) and job.get("runner_id") > 0, "staging runner ID missing"),
            (None if not job.get("runner_name") else "staging" in job.get("runner_name", "").lower(), "distinct staging runner identity required"),
            (None if job.get("runner_labels") is None else "lingo-legacy-g02-staging" in labels, "staging label missing")
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
    job_status = job.get("status")
    conclusion = job.get("conclusion")
    sentinel_exit = job.get("sentinel_exit_code")
    add("C2_EXECUTION", [
        (True if job_status == "completed" else None if job_status in (None, "unknown", "queued", "in_progress") else False, "job completion not established"),
        (True if conclusion == "success" else None if conclusion is None else False, "job conclusion is not success"),
        (executed if isinstance(steps, list) else None, "at least one successful executed step required"),
        (None if sentinel_exit is None else sentinel_exit == 0, "sentinel exit code must be observed as zero")
    ], [str(workflow.get("url") or "")])

    artifact_ok = isinstance(artifacts, list) and len(artifacts) > 0
    logs_status = logs.get("retrieval_status")
    logs_check = True if logs_status == "available" else (
        False if logs_status in {"unavailable", "error", "not_found"} else None
    )
    artifact_checks: list[tuple[bool | None, str]] = [
        (logs_check, "retrievable logs required"),
        (artifact_ok if isinstance(artifacts, list) else None, "retrievable artifact record required")
    ]
    if artifact_ok:
        for i, artifact in enumerate(artifacts):
            correlation_fields = (artifact.get("run_id"), artifact.get("run_attempt"), artifact.get("commit_sha"))
            correlated = None if any(value is None for value in correlation_fields) else (
                artifact.get("run_id") == run_id and artifact.get("run_attempt") == attempt
                and artifact.get("commit_sha") == expected_sha
            )
            artifact_id_check = None if artifact.get("artifact_id") is None else bool(artifact.get("artifact_id"))
            source_ref_check = None if artifact.get("source_reference") is None else bool(artifact.get("source_reference"))
            artifact_sha = artifact.get("sha256")
            sha_check = None if artifact_sha is None else (
                isinstance(artifact_sha, str) and bool(HASH_RE.fullmatch(artifact_sha))
            )
            artifact_checks.extend([
                (True if artifact.get("retrieval_status") == "available" else (
                    False if artifact.get("retrieval_status") in {"unavailable", "error", "not_found"} else None
                ), f"artifact {i} must be retrievable"),
                (correlated, f"artifact {i} run/attempt/commit correlation mismatch"),
                (artifact_id_check, f"artifact {i} identity required"),
                (source_ref_check, f"artifact {i} source reference required"),
                (sha_check, f"artifact {i} SHA-256 missing or invalid")
            ])
    add("C3_EVIDENCE_INTEGRITY", artifact_checks,
        [str(logs.get("source_reference") or "")] + [str(a.get("source_reference") or "") for a in artifacts if isinstance(a, dict)] if isinstance(artifacts, list) else [])

    producer = verification.get("producer_identity")
    verifier = verification.get("verifier_identity")
    distinct = (None if not producer or not verifier else producer != verifier)
    checks = verification.get("checks")
    checks_ok = (
        None if not isinstance(checks, list) or not checks else
        False if any(isinstance(c, dict) and c.get("status") == "FAIL" for c in checks) else
        None if any(not isinstance(c, dict) or c.get("status") != "PASS" or not c.get("source_reference") for c in checks) else
        True
    )
    verification_status = verification.get("status")
    digest = verification.get("evidence_digest")
    digest_check = None if digest is None else (
        isinstance(digest, str) and bool(HASH_RE.fullmatch(digest))
    )
    add("C4_INDEPENDENT_VERIFICATION", [
        (True if verification_status == "verified" else False if verification_status in {"failed", "rejected"} else None, "verification status is not verified"),
        (distinct, "distinct producer and verifier identities required"),
        (True if verification.get("verified_at_utc") else None, "verification timestamp missing"),
        (digest_check, "verification digest missing or invalid"),
        (checks_ok, "all verification checks must pass with source references")
    ], [str(c.get("source_reference") or "") for c in checks if isinstance(c, dict)] if isinstance(checks, list) else [])

    apex = probes.get("apex_status")
    www = probes.get("www_status")
    redirect_status = probes.get("redirect_validation")
    add("C5_PUBLIC_REACHABILITY", [
        (True if apex == 200 else False if apex is not None else None, "independent apex HTTP 200 required"),
        (True if www in (200, 301, 302, 307, 308) else False if www is not None else None, "accepted independent www response required"),
        (True if redirect_status == "pass" else False if redirect_status == "fail" else None, "redirect validation must pass"),
        (True if probes.get("source_reference") else None, "public probe source reference required")
    ], [str(probes.get("source_reference") or "")])

    auth_fields = ("status", "approval_reference", "approved_sha", "approved_action", "approver_identity")
    if any(not auth.get(field) for field in auth_fields):
        auth_check = None
    else:
        auth_check = (
            auth.get("status") == "authorized"
            and auth.get("approved_sha") == expected_sha
            and auth.get("approved_action") == action
        )
    add("C6_AUTHORIZATION", [
        (auth_check, "explicit approval must cover exact SHA and requested action")
    ], [str(auth.get("approval_reference") or "")])

    accepted = all(g["status"] == "PASS" for g in gates)
    release_authorized = accepted and action == "release"
    return {"schema_version": "lingo.gate-result.v1", "expected_sha": expected_sha,
            "requested_action": action, "status": "PASS" if accepted else "BLOCKED",
            "gates": gates, "release_authorized": release_authorized}


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
