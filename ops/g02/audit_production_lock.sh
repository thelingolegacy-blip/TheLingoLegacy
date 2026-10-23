#!/usr/bin/env bash
set -euo pipefail

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
  echo "[PASS] Non-production Firebase project ID configured (value withheld)."
fi

# Do not print environment values. Fail closed on known production credential
# variable names, while noting this cannot prove no secrets exist elsewhere.
if env | cut -d= -f1 | grep -iE '^(PROD_RUNNER_TOKEN|LIVE_DEPLOY_KEY|PRODUCTION_TOKEN|PRODUCTION_RUNNER_TOKEN|LIVE_RUNNER_TOKEN)$' >/dev/null; then
  echo "[FAIL] Known production credential variable name present (value withheld)."
  errors=$((errors + 1))
else
  echo "[PASS] No known production credential variable names found."
fi

runner_dir="${RUNNER_DIR:-/opt/actions-runner}"
if [[ -f "$runner_dir/.runner" ]]; then
  if python3 - "$runner_dir/.runner" <<'PY'
import json, sys
try:
    d=json.load(open(sys.argv[1], encoding="utf-8"))
    labels=d.get("labels", [])
    name=d.get("agentName", d.get("name", ""))
    print("runner_config_name="+str(name))
    print("runner_config_labels="+",".join(str(x) for x in labels))
    if "lingo-legacy-g02-staging" not in labels or "lingo-legacy-g02" in labels or "staging" not in str(name).lower():
        raise SystemExit(1)
except Exception:
    raise SystemExit(1)
PY
  then
    echo "[PASS] Runner config indicates staging identity/label."
  else
    echo "[FAIL] Runner config could not prove staging isolation."
    errors=$((errors + 1))
  fi
else
  echo "[FAIL] Runner config not found at $runner_dir/.runner; staging isolation is unverified."
  errors=$((errors + 1))
fi

echo "Note: this is a local preflight, not proof of GitHub runner inventory or absence of production secrets."
if (( errors == 0 )); then
  echo "[SUCCESS] Local staging preflight passed; continue only with independent verification."
else
  echo "[FAILURE] Local staging preflight failed ($errors); halt staging execution."
  exit 1
fi
