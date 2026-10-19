#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/../../.." && pwd)"
bridge="$root/ops/g02/diagnose-actions-dispatch.sh"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
mkdir -p "$tmp/bin" "$tmp/fixtures"

command -v jq >/dev/null || { echo "jq required for fixture tests" >&2; exit 2; }
command -v sha256sum >/dev/null || { echo "sha256sum required for fixture tests" >&2; exit 2; }

cat > "$tmp/bin/gh" <<'MOCK_GH'
#!/usr/bin/env bash
set -euo pipefail
if [[ "$1" == "auth" && "$2" == "status" ]]; then exit 0; fi
if [[ "$1" == "api" ]]; then
  endpoint="$2"
  case "$endpoint" in
    */actions/runs?per_page=10) cat "$FIXTURE_DIR/runs.json" ;;
    */actions/runs/123/attempts/2/jobs?per_page=100) cat "$FIXTURE_DIR/jobs.json" ;;
    */actions/runs/123/artifacts) cat "$FIXTURE_DIR/artifacts.json" ;;
    */actions/jobs/456/logs) if [[ -f "$FIXTURE_DIR/logs-fail" ]]; then echo '404 BlobNotFound' >&2; exit 1; fi; printf 'fixture logs available\n' ;;
    *) echo "Unexpected mock API endpoint: $endpoint" >&2; exit 3 ;;
  esac
  exit 0
fi
if [[ "$1" == "run" && "$2" == "download" ]]; then
  shift 2
  run_id="$1"; shift
  outdir=""
  while (($#)); do
    case "$1" in
      --dir) outdir="$2"; shift 2 ;;
      *) shift ;;
    esac
  done
  [[ "$run_id" == "123" && -n "$outdir" ]] || exit 4
  printf '%s\n' 'Runner ID: 7' 'Runner name: lingo-legacy-g02' 'Runner OS: Linux' 'Runner architecture: X64' 'Commit: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' 'G02_RUNNER_ASSIGNMENT=PASS' 'G02_SENTINEL_EXECUTION=PASS' > "$outdir/g02-sentinel-evidence.txt"
  exit 0
fi
echo "Unexpected mock gh invocation" >&2
exit 5
MOCK_GH
chmod +x "$tmp/bin/gh"

make_fixture() {
  local scenario="$1"
  # Prevent scenario-specific state leaking into the next fixture case.
  rm -f "$tmp/fixtures/logs-fail"
  SCENARIO="$scenario" FIXTURE_DIR="$tmp/fixtures" python3 - <<'PY'
import json, os
from pathlib import Path
p = Path(os.environ["FIXTURE_DIR"])
s = os.environ["SCENARIO"]
run_sha = "a" * 40
job_sha = run_sha if s != "mismatched-sha" else "b" * 40
workflow = "G02 Runner Execution Sentinel" if s != "unrelated-workflow" else "Unrelated Workflow"
steps = [{"name":"Output runner assignment and sentinel telemetry","status":"completed","conclusion":"success"}]
if s == "missing-step":
    steps = [{"name":"Some other step","status":"completed","conclusion":"success"}]
if s == "failed-step":
    steps[0]["conclusion"] = "failure"
runner_id = 7 if s != "runner-zero" else 0
job_conclusion = "failure" if s == "failed-step" else "success"
run_conclusion = "failure" if s == "failed-run" else "success"
runs = {"workflow_runs":[{"id":123,"head_sha":run_sha,"head_branch":"main","status":"completed","conclusion":run_conclusion,"name":workflow,"run_attempt":2}]}
jobs = {"jobs":[{"id":456,"run_id":123,"head_sha":job_sha,"name":"Verify Self-Hosted Runner Dispatch","status":"completed","conclusion":job_conclusion,"runner_id":runner_id,"runner_name":"lingo-legacy-g02","labels":["self-hosted","linux","x64","lingo-g02"],"steps":steps}]}
artifacts = {"total_count":0,"artifacts":[]} if s == "missing-artifact" else {"total_count":1,"artifacts":[{"id":999,"name":"g02-sentinel-evidence-123","expired":False}]}
for name, obj in (("runs.json",runs),("jobs.json",jobs),("artifacts.json",artifacts)):
    (p/name).write_text(json.dumps(obj))
if s == "logs-unavailable":
    (p/"logs-fail").write_text("simulate unavailable job logs")
PY
}

run_case() {
  local scenario="$1" expected="$2"
  make_fixture "$scenario"
  local out="$tmp/out-$scenario"
  PATH="$tmp/bin:$PATH" FIXTURE_DIR="$tmp/fixtures" SCENARIO="$scenario" OUT_DIR="$out" bash "$bridge" >/dev/null
  local report="$out/dispatch-report.txt"
  grep -Fq "sentinel_execution=$expected" "$report" || {
    echo "FAIL | $scenario expected sentinel_execution=$expected" >&2
    cat "$report" >&2
    exit 1
  }
  test -s "$report.sha256"
  echo "PASS | $scenario => $expected"
}

bash -n "$bridge"
run_case unrelated-workflow UNVERIFIED
run_case missing-step UNVERIFIED
run_case failed-step UNVERIFIED
run_case failed-run UNVERIFIED
run_case runner-zero UNVERIFIED
run_case mismatched-sha UNVERIFIED
run_case missing-artifact UNVERIFIED
run_case logs-unavailable UNVERIFIED
run_case canonical-success PASS_CANDIDATE

echo "SCOPE | mocked GitHub API fixtures only; no real GitHub API calls, workflow dispatches, or host inspection"
