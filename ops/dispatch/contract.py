"""Fail-closed validation primitives for LLG Dispatch job envelopes.

This module validates proposed work; it does not dispatch jobs, authenticate
workers, grant permissions, or authorize production changes.
"""
from __future__ import annotations

import json
import math
import re
from pathlib import Path
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
SAFE_TOOLS = frozenset({
    "read-only-github", "read-only-cloudflare", "read-only-firebase",
    "local-unit-tests", "static-analysis", "preview-build",
})
SAFE_PERMISSION_PROFILES = frozenset({
    "least-privilege-read-only", "source-validation-only",
})
ALLOWED_ROLE_PERMISSIONS = frozenset({
    "registry.read", "registry.manage", "dispatch.read", "dispatch.manage",
    "policy.propose", "audit.read", "security.read", "security.manage",
    "identity.review", "infrastructure.read", "infrastructure.propose",
    "source.read", "source.propose", "build.read", "operations.read",
    "dispatch.propose", "portfolio.read", "portfolio.propose",
    "acceptance.read", "acceptance.review", "evidence.read",
    "job.accept", "job.progress", "job.output",
})
OWNER_PROPOSER_PERMISSIONS = frozenset({
    "source.propose", "dispatch.propose", "infrastructure.propose",
    "operations.propose", "portfolio.propose", "policy.propose",
    "registry.manage", "security.manage",
})
REVIEWER_PERMISSIONS = frozenset({"acceptance.review", "audit.read"})
REQUIRED_ROLE_RESTRICTIONS = {
    "super-administrator": frozenset({"cannot_self_approve_release", "cannot_bypass_release_gate"}),
    "enterprise-administrator": frozenset({"cannot_grant_super_administrator", "cannot_approve_own_changes"}),
    "security-administrator": frozenset({"cannot_approve_own_security_change"}),
    "infrastructure-administrator": frozenset({"no_production_mutation_without_release_authorization"}),
    "engineering-administrator": frozenset({"no_self_approval"}),
    "operations-administrator": frozenset({"no_production_mutation_without_release_authorization"}),
    "product-administrator": frozenset({"no_release_authorization"}),
    "independent-auditor": frozenset({"read_only"}),
    "worker": frozenset({"no_identity_admin", "no_policy_admin", "no_release", "no_secret_read_by_default"}),
}


class ContractError(ValueError):
    """Raised when a job envelope violates the dispatch contract."""


def _load_role_catalog() -> dict[str, str]:
    """Load the committed role catalog; fail closed on missing or unsafe data."""
    try:
        catalog = json.loads(Path(__file__).with_name("roles.json").read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ContractError("role catalog is unavailable or invalid") from exc

    if not isinstance(catalog, dict):
        raise ContractError("role catalog must be an object")
    if catalog.get("status") != "ROLE_CATALOG_ONLY":
        raise ContractError("role catalog is not in catalog-only state")
    if catalog.get("identity_assignment") != "UNASSIGNED":
        raise ContractError("role catalog must not contain identity assignments")
    policy = catalog.get("policy")
    if not isinstance(policy, dict) or any((
        policy.get("default") != "deny",
        policy.get("human_identity_required") is not True,
        policy.get("shared_accounts_allowed") is not False,
        policy.get("privileged_mfa_required") is not True,
        policy.get("role_assignment_requires_verified_identity") is not True,
    )):
        raise ContractError("role catalog security policy is missing or unsafe")

    entries = catalog.get("roles")
    if not isinstance(entries, list) or not entries:
        raise ContractError("role catalog must contain role entries")

    roles: dict[str, dict[str, Any]] = {}
    for entry in entries:
        if not isinstance(entry, dict):
            raise ContractError("role catalog contains a malformed role")
        role_id = entry.get("id")
        principal_type = entry.get("principal_type")
        permissions = entry.get("permissions")
        restricted = entry.get("restricted")
        if not isinstance(role_id, str) or not role_id.strip():
            raise ContractError("role catalog contains an invalid role identifier")
        if not isinstance(principal_type, str) or principal_type not in {"human", "service"}:
            raise ContractError(f"role {role_id!r} has an unsupported principal type")
        if not isinstance(permissions, list) or not permissions or not all(
            isinstance(permission, str) and permission.strip() for permission in permissions
        ):
            raise ContractError(f"role {role_id!r} has an invalid permission list")
        if len(set(permissions)) != len(permissions) or set(permissions) - ALLOWED_ROLE_PERMISSIONS:
            raise ContractError(f"role {role_id!r} contains duplicate or unapproved permissions")
        if not isinstance(restricted, list) or not restricted or not all(
            isinstance(rule, str) and rule.strip() for rule in restricted
        ):
            raise ContractError(f"role {role_id!r} has an invalid restriction list")
        required_restrictions = REQUIRED_ROLE_RESTRICTIONS.get(role_id)
        if required_restrictions is None or not required_restrictions.issubset(set(restricted)):
            raise ContractError(f"role {role_id!r} is missing required security restrictions")
        if role_id in roles:
            raise ContractError(f"role catalog contains duplicate role {role_id!r}")
        roles[role_id] = {
            "principal_type": principal_type,
            "permissions": frozenset(permissions),
        }
    return roles


def validate_job(job: dict[str, Any]) -> None:
    """Validate required fields, role assignments, and conservative bounds."""
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

    role_catalog = _load_role_catalog()
    for field in ("owner_role", "reviewer_role"):
        role = job[field]
        if role not in role_catalog:
            raise ContractError(f"{field} references unknown role {role!r}")
        if role_catalog[role]["principal_type"] != "human":
            raise ContractError(f"{field} must reference a human role; service roles are prohibited")

    if not (role_catalog[job["owner_role"]]["permissions"] & OWNER_PROPOSER_PERMISSIONS):
        raise ContractError("owner_role lacks an approved proposal permission")
    if not (role_catalog[job["reviewer_role"]]["permissions"] & REVIEWER_PERMISSIONS):
        raise ContractError("reviewer_role lacks an approved independent-review permission")

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
    if not job["allowed_tools"]:
        raise ContractError("allowed_tools must contain at least one approved tool")
    if not set(job["allowed_tools"]).issubset(SAFE_TOOLS):
        raise ContractError("allowed_tools contains an unapproved tool")
    if len(set(job["allowed_tools"])) != len(job["allowed_tools"]):
        raise ContractError("allowed_tools must not contain duplicates")
    if job["permission_profile"] not in SAFE_PERMISSION_PROFILES:
        raise ContractError("permission_profile is not approved for the v1 contract")
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
    if isinstance(cost, bool) or not isinstance(cost, (int, float)) or not math.isfinite(cost) or cost != 0:
        raise ContractError("cost_ceiling_usd must be exactly zero until a separately approved budget policy exists")


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
