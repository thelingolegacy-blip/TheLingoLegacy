#!/usr/bin/env bash
# Run from the sidecar directory: bash ops/validate-local.sh
# Emits evidence only for checks that actually execute; unavailable tools are SKIP, never PASS.
set -Eeuo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
OUT="${EVIDENCE_OUT:-$ROOT/validation-evidence.json}"
STARTED_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
RESULTS="$(mktemp)"
trap 'rm -f "$RESULTS"' EXIT
record() { printf '%s\n' "$1" >> "$RESULTS"; }
run_check() {
  local name="$1"; shift
  local log="$ROOT/.validation-${name}.log"
  if "$@" >"$log" 2>&1; then
    record "{\"check\":\"$name\",\"status\":\"PASS\",\"log\":\"$(basename "$log")\"}"
  else
    local rc=$?
    record "{\"check\":\"$name\",\"status\":\"FAIL\",\"exit_code\":$rc,\"log\":\"$(basename "$log")\"}"
    cat "$log" >&2
    return "$rc"
  fi
}
failed=0
run_check "npm-lock" npm install --package-lock-only --ignore-scripts --no-audit || failed=1
run_check "npm-ci" npm ci --no-audit || failed=1
run_check "frontend-build" npm run build || failed=1
run_check "python-syntax" python3 -m py_compile lambda/app.py || failed=1
run_check "python-unit-tests" python3 -m unittest discover -s tests -v || failed=1

if command -v docker >/dev/null 2>&1; then
  run_check "docker-build" docker build -t lingosonic-nextus-sidecar:validation . || failed=1
else
  record '{"check":"docker-build","status":"SKIP","reason":"docker CLI unavailable"}'
fi

if command -v cfn-lint >/dev/null 2>&1; then
  run_check "cloudformation-lint" cfn-lint infra/template.yaml || failed=1
else
  record '{"check":"cloudformation-lint","status":"SKIP","reason":"cfn-lint unavailable; install it before release"}'
fi

if command -v aws >/dev/null 2>&1; then
  if aws sts get-caller-identity >"$ROOT/.validation-aws-identity.log" 2>&1; then
    record '{"check":"aws-identity","status":"PASS","log":".validation-aws-identity.log"}'
    if aws cloudformation validate-template --template-body "file://$ROOT/infra/template.yaml" >"$ROOT/.validation-cloudformation.log" 2>&1; then
      record '{"check":"cloudformation-validate","status":"PASS","log":".validation-cloudformation.log"}'
    else
      record '{"check":"cloudformation-validate","status":"FAIL","log":".validation-cloudformation.log"}'
      cat "$ROOT/.validation-cloudformation.log" >&2
      failed=1
    fi
  else
    record '{"check":"aws-identity","status":"FAIL","log":".validation-aws-identity.log"}'
    cat "$ROOT/.validation-aws-identity.log" >&2
    failed=1
  fi
else
  record '{"check":"aws-identity","status":"SKIP","reason":"aws CLI unavailable; AWS account and template validation remain unverified"}'
  record '{"check":"cloudformation-validate","status":"SKIP","reason":"aws CLI unavailable"}'
fi

# Refuse to silently certify a checkout with potential secret material.
if find . -type f \( -name ".env" -o -name "*.pem" -o -name "*.key" \) -not -path "./node_modules/*" -not -path "./.git/*" | grep -q .; then
  record '{"check":"secret-file-scan","status":"FAIL","reason":"Potential secret file path found"}'
  failed=1
else
  record '{"check":"secret-file-scan","status":"PASS","note":"Filename scan only; not a full secret scanner"}'
fi

python3 - "$OUT" "$STARTED_AT" "$failed" "$RESULTS" <<'PY'
import datetime, json, pathlib, subprocess, sys
out, started, failed, results_file = sys.argv[1:]
try:
    sha = subprocess.check_output(["git", "rev-parse", "HEAD"], text=True, stderr=subprocess.DEVNULL).strip()
except Exception:
    sha = None
checks = [json.loads(line) for line in pathlib.Path(results_file).read_text().splitlines() if line.strip()]
doc = {
    "schemaVersion": "1.0.0",
    "suite": "LINGOsonic Nexus local validation",
    "startedAtUtc": started,
    "finishedAtUtc": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    "gitHeadSha": sha,
    "overall": "FAIL" if failed == "1" else ("PASS_WITH_SKIPS" if any(c["status"] == "SKIP" for c in checks) else "PASS"),
    "checks": checks,
    "note": "This report records this execution only. Preserve logs and verify the SHA independently before accepting it as release evidence."
}
pathlib.Path(out).write_text(json.dumps(doc, indent=2) + "\n")
print(json.dumps({"evidence": out, "gitHeadSha": sha, "overall": doc["overall"], "checks": checks}, indent=2))
PY
if [[ "$failed" -ne 0 ]]; then exit 1; fi
