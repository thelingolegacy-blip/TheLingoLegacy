#!/usr/bin/env bash
set -euo pipefail

: "${PROJECT_KEY:?PROJECT_KEY is required}"
: "${COMMAND:?COMMAND is required}"
: "${FROM_STAGE:?FROM_STAGE is required}"
: "${TO_STAGE:?TO_STAGE is required}"
: "${EVIDENCE_URL:?EVIDENCE_URL is required}"

fail() { echo "::error::$1" >&2; exit 1; }
valid_stage() {
  case "$1" in
    NOT_ASSESSED|PLANNED|READY|IN_PROGRESS|REPAIR|VERIFICATION|REVIEW|APPROVED|COMPLETED|RELEASE_READY|RELEASED|BLOCKED|PAUSED|REJECTED|ROLLBACK) return 0 ;;
    *) return 1 ;;
  esac
}

[[ "$PROJECT_KEY" =~ ^[A-Za-z0-9][A-Za-z0-9._-]{1,63}$ ]] || fail "PROJECT_KEY must be 2-64 safe characters."
valid_stage "$FROM_STAGE" || fail "Unknown FROM_STAGE: $FROM_STAGE"
valid_stage "$TO_STAGE" || fail "Unknown TO_STAGE: $TO_STAGE"
[[ "$EVIDENCE_URL" =~ ^https://[^[:space:]]+$ ]] || fail "EVIDENCE_URL must be an HTTPS URL."
[[ -n "${RATIONALE:-}" ]] || fail "RATIONALE is required."
PROJECT_REGISTRY="${PROJECT_REGISTRY:-ops/manual-control/projects.json}"
python3 - "$PROJECT_KEY" "$PROJECT_REGISTRY" <<'PY'
import json, sys
project_key, registry_path = sys.argv[1], sys.argv[2]
try:
    with open(registry_path, encoding="utf-8") as registry_file:
        registry = json.load(registry_file)
except Exception as error:
    print(f"::error::Cannot read project registry: {error}", file=sys.stderr)
    raise SystemExit(1)
if not any(item.get("project_key") == project_key for item in registry.get("projects", [])):
    print(f"::error::Unregistered project key: {project_key}", file=sys.stderr)
    raise SystemExit(1)
PY

case "$COMMAND:$FROM_STAGE:$TO_STAGE" in
  assess:NOT_ASSESSED:PLANNED) ;;
  advance:PLANNED:READY|advance:READY:IN_PROGRESS|advance:IN_PROGRESS:REPAIR|advance:IN_PROGRESS:VERIFICATION|advance:REPAIR:VERIFICATION|advance:VERIFICATION:REVIEW|advance:APPROVED:COMPLETED|advance:COMPLETED:RELEASE_READY) ;;
  request-review:VERIFICATION:REVIEW) ;;
  approve:REVIEW:APPROVED) ;;
  hold:PLANNED:PAUSED|hold:READY:PAUSED|hold:IN_PROGRESS:PAUSED|hold:REPAIR:PAUSED|hold:VERIFICATION:PAUSED|hold:REVIEW:PAUSED|hold:APPROVED:PAUSED|hold:COMPLETED:PAUSED|hold:RELEASE_READY:PAUSED|hold:BLOCKED:PAUSED) ;;
  block:PLANNED:BLOCKED|block:READY:BLOCKED|block:IN_PROGRESS:BLOCKED|block:REPAIR:BLOCKED|block:VERIFICATION:BLOCKED|block:REVIEW:BLOCKED|block:APPROVED:BLOCKED|block:COMPLETED:BLOCKED|block:RELEASE_READY:BLOCKED) ;;
  resume:PAUSED:READY|resume:PAUSED:IN_PROGRESS|resume:PAUSED:REPAIR|resume:PAUSED:VERIFICATION|resume:PAUSED:REVIEW|resume:PAUSED:APPROVED|resume:PAUSED:COMPLETED|resume:PAUSED:RELEASE_READY|resume:BLOCKED:READY|resume:BLOCKED:IN_PROGRESS|resume:BLOCKED:REPAIR|resume:BLOCKED:VERIFICATION|resume:BLOCKED:REVIEW|resume:BLOCKED:APPROVED|resume:BLOCKED:COMPLETED|resume:BLOCKED:RELEASE_READY) ;;
  request-release:COMPLETED:RELEASE_READY) ;;
  record-release:RELEASE_READY:RELEASED) ;;
  reject:REVIEW:REJECTED) ;;
  rollback:RELEASED:ROLLBACK|rollback:RELEASE_READY:ROLLBACK) ;;
  *) fail "Unsupported transition: $COMMAND $FROM_STAGE -> $TO_STAGE." ;;
esac

is_authorized_approver() {
  [[ -n "${GITHUB_ACTOR:-}" ]] || fail "GITHUB_ACTOR is required for privileged actions."
  [[ -n "${AUTHORIZED_APPROVERS:-}" ]] || fail "AUTHORIZED_APPROVERS must be configured before privileged actions are enabled."
  python3 - "${GITHUB_ACTOR}" "${AUTHORIZED_APPROVERS}" <<'PY'
import sys
actor = sys.argv[1]
allowed = {item.strip() for item in sys.argv[2].split(",") if item.strip()}
if actor not in allowed:
    print("::error::Actor is not in the configured privileged-approver allowlist.", file=sys.stderr)
    raise SystemExit(1)
PY
}

if [[ "$COMMAND" == "approve" ]]; then
  [[ "${CONFIRMATION:-}" == "APPROVE $PROJECT_KEY" ]] || fail "Confirmation must exactly equal: APPROVE $PROJECT_KEY"
  is_authorized_approver
fi

if [[ "$COMMAND" == "record-release" ]]; then
  [[ "${CONFIRMATION:-}" == "RELEASE $PROJECT_KEY" ]] || fail "Confirmation must exactly equal: RELEASE $PROJECT_KEY"
  is_authorized_approver
  [[ "${DEPLOYMENT_EVIDENCE_URL:-}" =~ ^https://[^[:space:]]+$ ]] || fail "DEPLOYMENT_EVIDENCE_URL must point to deployed/live verification evidence."
fi

echo "VALID: $PROJECT_KEY $COMMAND $FROM_STAGE -> $TO_STAGE"
echo "G02/Fallgate dependency: NONE"
echo "This validator records a requested transition; it does not deploy or modify production."
