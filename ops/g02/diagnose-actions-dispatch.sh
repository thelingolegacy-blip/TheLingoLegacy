#!/usr/bin/env bash
set -euo pipefail

# Read-only bridge from a machine with GitHub CLI access to a compact,
# hashable G02 dispatch evidence report. Never dispatch, rerun, or mutate.
REPO="${GITHUB_REPOSITORY_OVERRIDE:-thelingolegacy-blip/TheLingoLegacy}"
OUT_DIR="${OUT_DIR:-g02-dispatch-evidence-$(date -u +%Y%m%dT%H%M%SZ)}"

for cmd in gh jq sha256sum; do
  command -v "$cmd" >/dev/null || { echo "$cmd is required" >&2; exit 2; }
done
gh auth status >/dev/null

if [[ -e "$OUT_DIR" ]]; then
  echo "Refusing to overwrite existing evidence directory: $OUT_DIR" >&2
  exit 2
fi

umask 077
mkdir -m 700 -p "$OUT_DIR"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
report="$OUT_DIR/dispatch-report.txt"

runs_json="$(gh api "repos/$REPO/actions/runs?per_page=10")"
printf '%s\n' "$runs_json" > "$tmp/runs.json"

{
  printf 'schema=lingo.g02.dispatch-evidence.v1\n'
  printf 'captured_at_utc=%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  printf 'repository=%s\n' "$REPO"
  printf 'scope=read-only latest 10 workflow runs; no dispatch, rerun, or configuration changes\n'

  while IFS=$'\t' read -r run_id run_sha run_branch run_status run_conclusion; do
    [[ -n "$run_id" ]] || continue
    printf '\nRUN id=%s sha=%s branch=%s status=%s conclusion=%s\n' \
      "$run_id" "$run_sha" "$run_branch" "$run_status" "$run_conclusion"

    if artifact_count="$(gh api "repos/$REPO/actions/runs/$run_id/artifacts" --jq '.total_count // 0' 2>"$tmp/artifact.err")"; then
      printf 'ARTIFACTS run_id=%s count=%s\n' "$run_id" "$artifact_count"
    else
      printf 'ARTIFACTS run_id=%s status=UNAVAILABLE\n' "$run_id"
    fi

    if ! gh api "repos/$REPO/actions/runs/$run_id/jobs?per_page=100" > "$tmp/jobs.json" 2>"$tmp/jobs.err"; then
      printf 'JOBS run_id=%s status=UNAVAILABLE\n' "$run_id"
      continue
    fi

    while IFS= read -r job_json; do
      [[ -n "$job_json" ]] || continue
      job_id="$(jq -r '.id // 0' <<< "$job_json")"
      job_run_id="$(jq -r '.run_id // 0' <<< "$job_json")"
      job_sha="$(jq -r '.head_sha // ""' <<< "$job_json")"
      job_name="$(jq -r '.name // ""' <<< "$job_json" | tr '\t\r\n' '   ')"
      job_status="$(jq -r '.status // ""' <<< "$job_json")"
      job_conclusion="$(jq -r '.conclusion // ""' <<< "$job_json")"
      runner_id="$(jq -r '.runner_id // 0' <<< "$job_json")"
      runner_name="$(jq -r '.runner_name // ""' <<< "$job_json")"
      labels="$(jq -r '(.labels // []) | join(",")' <<< "$job_json")"
      step_count="$(jq -r '(.steps // []) | length' <<< "$job_json")"
      executed_steps="$(jq -r '[.steps[]? | select(.status == "completed" and .conclusion != null)] | length' <<< "$job_json")"

      if [[ "$job_run_id" == "$run_id" && -n "$run_sha" && "$job_sha" == "$run_sha" ]]; then
        correlation="PASS"
      else
        correlation="FAIL_OR_INCOMPLETE"
      fi
      if [[ "$runner_id" =~ ^[1-9][0-9]*$ && -n "$runner_name" ]]; then
        assignment="ASSIGNED"
      else
        assignment="UNVERIFIED"
      fi

      if gh api "repos/$REPO/actions/jobs/$job_id/logs" >/dev/null 2>"$tmp/log.err"; then
        log_state="RETRIEVABLE"
      elif grep -Eqi '404|BlobNotFound' "$tmp/log.err"; then
        log_state="FAIL_404_OR_BLOB_NOT_FOUND"
      elif grep -Eqi '401|403|forbidden|unauthorized' "$tmp/log.err"; then
        log_state="FAIL_ACCESS"
      else
        log_state="FAIL_OR_UNKNOWN"
      fi

      printf 'JOB id=%s run_id=%s name=%s status=%s conclusion=%s runner_id=%s runner_name=%s assignment=%s labels=%s steps=%s executed_steps=%s logs=%s commit_sha=%s correlation=%s\n' \
        "$job_id" "$job_run_id" "$job_name" "$job_status" "$job_conclusion" \
        "$runner_id" "$runner_name" "$assignment" "$labels" "$step_count" \
        "$executed_steps" "$log_state" "$job_sha" "$correlation"
    done < <(jq -c '.jobs[]?' "$tmp/jobs.json")
  done < <(jq -r '.workflow_runs[]? | [.id, .head_sha, .head_branch, .status, (.conclusion // "")] | @tsv' "$tmp/runs.json")
} > "$report"

sha256sum "$report" > "$report.sha256"
echo "EVIDENCE_REPORT=$report"
echo "EVIDENCE_SHA256=$(awk '{print $1}' "$report.sha256")"
echo "LIMITATION=This report is a collector output, not independent acceptance; verify host identity, source authority, and hashes separately."
