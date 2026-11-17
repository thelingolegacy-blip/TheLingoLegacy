"""Fail-closed validation primitives for LLG Dispatch job envelopes.

This module validates proposed work; it does not dispatch jobs, authenticate
workers, grant permissions, or authorize production changes.
"""
from __future__ import annotations

import math
import re
from typing import Any

STATUSES = {
    "PROPOSED", "READY", "DISPATCHED", "ACCEPTED", "RUNNING",
    "VERIFYING", "COMPLETE", "BLOCKED", "REJECTED", "FAILED",
    "CANCELLED", "EXPIRED", "QUARANTINED",
}
TRANSITIONS = {
    "PROPOSED": {"READY", "BLOCKED", "REJECTED", "CANCELLED"},
    "READY": {"DISPATCHED", "BLOCKED", "CANCELLED"},
    "DISPATCHED": {"ACCEPTED", "REJECTED", "EXPIRED", "CANCELLED"},
    "ACCEPTED": {"RUNNING", "EXPIRED", "CANCELLED", "QUARANTINED"},
    "RUNNING": {"VERIFYING", "BLOCKED", "FAILED", "CANCELLED", "QUARANTINED"},
    "VERIFYING": {"COMPLETE", "FAILED", "BLOCKED", "QUARANTINED"},
    "BLOCKED": {"READY", "CANCELLED", "QUARANTINED"},
    "REJECTED": set(), "FAILED": {"READY", "QUARANTINED"},
    "CANCELLED": set(), "EXPIRED": {"READY", "QUARANTINED"},
    "QUARANTINED": set(), "COMPLETE": set(),
}
SHA_RE = re.compile(r"^(?:[0-9a-f]{40}|[0-9a-f]{64})$")
REPO_RE = re.compile(r"^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$")
ID_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_.:-]{2,127}$")


class ContractError(ValueError):
    """Raised when a job envelope violates the dispatch contract."""


def validate_job(job: dict[str, Any]) -> None:
    """Validate required fields and conservative execution bounds."""
    if not isinstance(job, dict):
        raise ContractError("job must be an object")
    required = {
        "job_id", "parent_id", "workstream", "owner_role", "reviewer_role",
        "repository", "branch", "commit_sha", "environment", "risk_class",
        "scope", "input_refs", "dependency_ids", "allowed_tools",
        "permission_profile", "idempotency_key", "acceptance_tests",
        "timeout_seconds", "lease_seconds", "heartbeat_seconds",
        "retry_budget", "cost_ceiling_usd", "start_condition",
        "stop_condition", "output_refs", "evidence_refs", "status",
    }
    missing = sorted(required - job.keys())
    if missing:
        raise ContractError("missing fields: " + ", ".join(missing))
    unexpected = sorted(job.keys() - required)
    if unexpected:
        raise ContractError("unexpected fields: " + ", ".join(unexpected))

    for key in ("job_id", "parent_id", "idempotency_key"):
        if not isinstance(job[key], str) or not ID_RE.fullmatch(job[key]):
            raise ContractError(f"{key} is not a valid stable identifier")
    for key in ("workstream", "owner_role", "reviewer_role", "branch",
                "permission_profile", "start_condition", "stop_condition"):
        if not isinstance(job[key], str) or not job[key].strip():
            raise ContractError(f"{key} must be a non-empty string")
    if job["owner_role"] == job["reviewer_role"]:
        raise ContractError("owner and reviewer roles must be independent")
    if not isinstance(job["repository"], str) or not REPO_RE.fullmatch(job["repository"]):
        raise ContractError("repository must use owner/name form")
    if not isinstance(job["commit_sha"], str) or not SHA_RE.fullmatch(job["commit_sha"]):
        raise ContractError("commit_sha must be a full 40- or 64-character SHA")
    if not isinstance(job["environment"], str) or job["environment"] not in {
        "local", "test", "preview", "staging", "production"
    }:
        raise ContractError("unsupported environment")
    if job["environment"] == "production":
        raise ContractError("production jobs require a separate release authorization path")
    if not isinstance(job["risk_class"], str) or job["risk_class"] not in {
        "low", "medium", "high", "critical"
    }:
        raise ContractError("unsupported risk_class")
    if not isinstance(job["status"], str) or job["status"] not in STATUSES:
        raise ContractError("unsupported status")

    array_fields = (
        "scope", "input_refs", "dependency_ids", "allowed_tools",
        "acceptance_tests", "output_refs", "evidence_refs",
    )
    for key in array_fields:
        if not isinstance(job[key], list):
            raise ContractError(f"{key} must be an array")
    for key in ("input_refs", "dependency_ids", "allowed_tools", "output_refs", "evidence_refs"):
        if not all(isinstance(x, str) and x.strip() for x in job[key]):
            raise ContractError(f"{key} must contain only non-empty strings")
    if not job["scope"] or not all(isinstance(x, str) and x.strip() for x in job["scope"]):
        raise ContractError("scope must contain explicit non-empty task strings")
    if not job["acceptance_tests"] or not all(
        isinstance(x, str) and x.strip() for x in job["acceptance_tests"]
    ):
        raise ContractError("at least one explicit acceptance test is required")

    for key in ("timeout_seconds", "lease_seconds", "heartbeat_seconds"):
        if type(job[key]) is not int or job[key] <= 0:
            raise ContractError(f"{key} must be a positive integer")
    if job["heartbeat_seconds"] >= job["lease_seconds"]:
        raise ContractError("heartbeat interval must be shorter than lease")
    if type(job["retry_budget"]) is not int or not 0 <= job["retry_budget"] <= 5:
        raise ContractError("retry_budget must be an integer from 0 through 5")
    cost = job["cost_ceiling_usd"]
    if isinstance(cost, bool) or not isinstance(cost, (int, float)) or not math.isfinite(cost) or cost < 0:
        raise ContractError("cost_ceiling_usd must be a finite non-negative number")


def transition(current: str, target: str, *, evidence_refs: list[str] | None = None,
               reviewer_id: str | None = None, owner_id: str | None = None) -> str:
    """Return target only when the lifecycle transition is permitted."""
    if current not in STATUSES or target not in STATUSES:
        raise ContractError("unknown lifecycle status")
    if target not in TRANSITIONS[current]:
        raise ContractError(f"transition {current} -> {target} is not allowed")
    if target == "COMPLETE":
        if not isinstance(evidence_refs, list) or not evidence_refs or not all(
            isinstance(ref, str) and ref.strip() for ref in evidence_refs
        ):
            raise ContractError("completion requires retrievable evidence references")
        if (
            not isinstance(reviewer_id, str) or not reviewer_id.strip()
            or not isinstance(owner_id, str) or not owner_id.strip()
            or reviewer_id == owner_id
        ):
            raise ContractError("completion requires an independent reviewer")
    return target
