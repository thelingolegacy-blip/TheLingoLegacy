#!/usr/bin/env bash
set -euo pipefail

# Local staging preflight. Does not change runner, Firebase, or production state.
# GitHub API inventory—not the local .runner file—is authoritative for runner labels.
readonly REPOSITORY="thelingolegacy-blip/TheLingoLegacy"
readonly REQUIRED_LABEL="lingo-legacy-g02-staging"
readonly FORBIDDEN_LABEL="lingo-legacy-g02"

echo "=== G02 STAGING / PRODUCTION-LOCK AUDIT ==="
errors=0
branch="$(git branch --show-current 2>/dev/null || true)"
echo "[INFO] branch=$branch"
if [[ -z "$branch" || "$branch" == "main" || "$branch" == "master" ]]; then
  echo "[FAIL] Not on a named isolated branch."
  errors=$((errors + 1))
else
  echo "[PASS] Isolated branch name."
fi

if [[ "${FIREBASE_ENV:-}" != "staging" ]]; then
  echo "[FAIL] FIREBASE_ENV must be staging."
  errors=$((errors + 1))
else
  echo "[PASS] FIREBASE_ENV=staging."
fi
if [[ -z "${FIREBASE_PROJECT_ID:-}" || "${FIREBASE_PROJECT_ID:-}" == "lingo-legacy-production" ]]; then
  echo "[FAIL] Dedicated non-production FIREBASE_PROJECT_ID is not configured."
  errors=$((errors + 1))
else
  echo "[INFO] Non-production project ID is configured (value withheld)."
  echo "[WARN] This script cannot independently prove project ownership or separation; verify the project in Firebase/Google Cloud Console."
fi

# Do not print environment values. This catches only known variable names and
# is not proof that production credentials are absent from the host.
if env | cut -d= -f1 | grep -iE '^(PROD_RUNNER_TOKEN|LIVE_DEPLOY_KEY|PRODUCTION_TOKEN|PRODUCTION_RUNNER_TOKEN|LIVE_RUNNER_TOKEN)$' >/dev/null; then
  echo "[FAIL] Known production credential variable name present (value withheld)."
  errors=$((errors + 1))
else
  echo "[PASS] No known production credential variable names found."
fi

# Query GitHub's authenticated runner inventory. Requires gh CLI authenticated
# with a read-only token permitted to view repository Actions runners (Actions: read).
# Never print token material. Local .runner configuration does not prove labels.
runner_name="${RUNNER_NAME:-}"
if [[ -z "$runner_name" ]]; then
  echo "[FAIL] RUNNER_NAME is unset; cannot correlate this host to GitHub inventory."
  errors=$((errors + 1))
elif ! command -v gh >/dev/null 2>&1; then
  echo "[FAIL] GitHub CLI (gh) is unavailable; runner inventory cannot be verified."
  errors=$((errors + 1))
else
  if inventory="$(gh api --paginate --slurp "repos/${REPOSITORY}/actions/runners?per_page=100" 2>/dev/null)"; then
    if printf '%s' "$inventory" | python3 -c '
import json, sys
try:
    name, required_label, forbidden_label = sys.argv[1:4]
    pages=json.load(sys.stdin)
    runners=[r for page in pages for r in page.get("runners", [])]
    matches=[r for r in runners if r.get("name")==name]
    if len(matches)!=1:
        print("[FAIL] GitHub inventory did not return exactly one matching runner.")
        raise SystemExit(1)
    r=matches[0]
    labels={str(label.get("name", "")) for label in r.get("labels", [])}
    print("github_runner_status="+str(r.get("status", "unknown")))
    print("github_runner_busy="+str(r.get("busy", "unknown")))
    print("github_runner_name="+name)
    if r.get("status")!="online":
        print("[FAIL] Matching GitHub runner is not online.")
        raise SystemExit(1)
    if required_label not in labels or forbidden_label in labels:
        print("[FAIL] GitHub runner labels do not prove isolated staging identity.")
        raise SystemExit(1)
    print("[PASS] GitHub API confirms online runner has staging label and lacks production G02 label.")
except Exception as exc:
    print("[FAIL] GitHub runner inventory parse/verification failed: "+type(exc).__name__)
    raise SystemExit(1)
' "$runner_name" "$REQUIRED_LABEL" "$FORBIDDEN_LABEL"; then
      :
    else
      errors=$((errors + 1))
    fi
  else
    echo "[FAIL] GitHub runner inventory query failed; check gh authentication and Actions read permission."
    errors=$((errors + 1))
  fi
fi

echo "Note: this is a local preflight, not proof of Firebase project separation, credential absence elsewhere, or G02 acceptance."
if (( errors == 0 )); then
  echo "[SUCCESS] Local staging preflight passed; independent evidence review is still required."
else
  echo "[FAILURE] Local staging preflight failed ($errors); halt staging execution."
  exit 1
fi
