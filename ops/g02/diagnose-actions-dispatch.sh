#!/usr/bin/env bash
set -euo pipefail

# Read-only bridge from a machine with GitHub CLI access to a compact,
# hashable G02 dispatch evidence report. Never dispatch, rerun, or mutate.
REPO="${GITHUB_REPOSITORY_OVERRIDE:-thelingolegacy-blip/TheLingoLegacy}"
OUT_DIR="${OUT_DIR:-g02-dispatch-evidence-$(date -u +%Y%m%dT%H%M%SZ)}"
EXPECTED_WORKFLOW="G02 Runner Execution Sentinel"
EXPECTED_JOB="Verify Self-Hosted Runner Dispatch"
EXPECTED_STEP="Output runner assignment and sentinel telemetry"

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
  printf 'schema=lingo.g02.dispatch-evidence.v2\n'
  printf 'captured_at_utc=%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  printf 'repository=%s\n' "$REPO"
  printf 'scope=read-only latest 10 workflow runs; no dispatch, rerun, or configuration changes\n'
  printf 'expected_workflow=%s\nexpected_job=%s\nexpected_step=%s\n' "$EXPECTED_WORKFLOW" "$EXPECTED_JOB" "$EXPECTED_STEP"

  while IFS=$'\t' read -r run_id run_sha run_branch run_status run_conclusion run_name run_attempt; do
    [[ -n "$run_id" ]] || continue
    run_name_safe="$(printf '%s' "$run_name" | tr '\t\r\n' '   ')"
    printf '\nRUN id=%s attempt=%s sha=%s branch=%s status=%s conclusion=%s name=%s\n' \
      "$run_id" "$run_attempt" "$run_sha" "$run_branch" "$run_status" "$run_conclusion" "$run_name_safe"

    if ! gh api "repos/$REPO/actions/runs/$run_id/jobs?per_page=100" > "$tmp/jobs.json" 2>"$tmp/jobs.err"; then
      printf 'JOBS run_id=%s status=UNAVAILABLE\n' "$run_id"
      continue
    fi

    if ! gh api "repos/$REPO/actions/runs/$run_id/artifacts" > "$tmp/artifacts.json" 2>"$tmp/artifact.err"; then
      printf 'ARTIFACTS run_id=%s expected_name=g02-sentinel-evidence-%s status=UNAVAILABLE\n' "$run_id" "$run_id"
      artifact_exact=false
    else
      artifact_exact="$(jq -r --arg expected "g02-sentinel-evidence-$run_id" '[.artifacts[]? | select(.name == $expected and .expired == false)] | length == 1' "$tmp/artifacts.json")"
      printf 'ARTIFACTS run_id=%s expected_name=g02-sentinel-evidence-%s exact_unexpired=%s\n' "$run_id" "$run_id" "$artifact_exact"
    fi

    artifact_contents_ok=false
    artifact_sha256=UNAVAILABLE
    evidence_file=""
    if [[ "$artifact_exact" == "true" ]]; then
      artifact_dir="$tmp/artifact-$run_id"
      mkdir -m 700 "$artifact_dir"
      if gh run download "$run_id" --repo "$REPO" --name "g02-sentinel-evidence-$run_id" --dir "$artifact_dir" >/dev/null 2>"$tmp/download.err"; then
        evidence_file="$artifact_dir/g02-sentinel-evidence.txt"
        if [[ -f "$evidence_file" ]]; then
          artifact_sha256="$(sha256sum "$evidence_file" | awk '{print $1}')"
          if grep -Fqx 'G02_RUNNER_ASSIGNMENT=PASS' "$evidence_file" &&
             grep -Fqx 'G02_SENTINEL_EXECUTION=PASS' "$evidence_file"; then
            artifact_contents_ok=true
          fi
        fi
      fi
    fi
    printf 'ARTIFACT_CONTENTS run_id=%s expected_file=g02-sentinel-evidence.txt sentinel_markers_valid=%s\n' "$run_id" "$artifact_contents_ok"

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
      labels_ok="$(jq -r '(["self-hosted","linux","x64","lingo-g02"] - (.labels // [])) | length == 0' <<< "$job_json")"
      step_count="$(jq -r '(.steps // []) | length' <<< "$job_json")"
      sentinel_step="$(jq -c --arg expected "$EXPECTED_STEP" '[.steps[]? | select(.name == $expected)] | if length == 1 then .[0] else {} end' <<< "$job_json")"
      sentinel_step_status="$(jq -r '.status // ""' <<< "$sentinel_step")"
      sentinel_step_conclusion="$(jq -r '.conclusion // ""' <<< "$sentinel_step")"

      if [[ "$job_run_id" == "$run_id" && -n "$run_sha" && "$job_sha" == "$run_sha" ]]; then
        correlation="PASS"
      else
        correlation="FAIL_OR_INCOMPLETE"
      fi
      if [[ "$run_name" == "$EXPECTED_WORKFLOW" && "$job_name" == "$EXPECTED_JOB" ]]; then
        canonical_target="true"
      else
        canonical_target="false"
      fi
      if [[ "$canonical_target" == "true" && "$runner_id" =~ ^[1-9][0-9]*$ && "$runner_name" == "lingo-legacy-g02" && "$labels_ok" == "true" ]]; then
        assignment="CANONICAL_ASSIGNED"
      else
        assignment="UNVERIFIED"
      fi
      artifact_correlated=false
      if [[ -n "${evidence_file:-}" && -f "$evidence_file" ]] &&
         grep -Fqx "Runner ID: $runner_id" "$evidence_file" &&
         grep -Fqx "Runner name: $runner_name" "$evidence_file" &&
         grep -Fqx "Runner OS: Linux" "$evidence_file" &&
         grep -Fqx "Runner architecture: X64" "$evidence_file" &&
         grep -Fqx "Commit: $run_sha" "$evidence_file"; then
        artifact_correlated=true
      fi
      printf 'ARTIFACT_CORRELATION run_id=%s job_id=%s runner_identity_and_commit_match=%s\n' "$run_id" "$job_id" "$artifact_correlated"

      if [[ "$canonical_target" == "true" && "$assignment" == "CANONICAL_ASSIGNED" &&
            "$run_status" == "completed" && "$run_conclusion" == "success" &&
            "$job_status" == "completed" && "$job_conclusion" == "success" &&
            "$sentinel_step_status" == "completed" && "$sentinel_step_conclusion" == "success" &&
            "$artifact_contents_ok" == "true" && "$artifact_correlated" == "true" && "$correlation" == "PASS" ]]; then
        sentinel_execution="PASS_CANDIDATE"
      else
        sentinel_execution="UNVERIFIED"
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

      printf 'JOB id=%s run_id=%s attempt=%s canonical_target=%s name=%s status=%s conclusion=%s runner_id=%s runner_name=%s assignment=%s labels=%s steps=%s sentinel_step_status=%s sentinel_step_conclusion=%s sentinel_execution=%s logs=%s artifact_contents=%s commit_sha=%s correlation=%s\n' \
        "$job_id" "$job_run_id" "$run_attempt" "$canonical_target" "$job_name" "$job_status" "$job_conclusion" \
        "$runner_id" "$runner_name" "$assignment" "$labels" "$step_count" "$sentinel_step_status" \
        "$sentinel_step_conclusion" "$sentinel_execution" "$log_state" "$artifact_contents_ok" "$artifact_sha256" "$job_sha" "$correlation"
    done < <(jq -c '.jobs[]?' "$tmp/jobs.json")
  done < <(jq -r '.workflow_runs[]? | [.id, .head_sha, .head_branch, .status, (.conclusion // "unknown"), (.name // ""), (.run_attempt // 0)] | @tsv' "$tmp/runs.json")
} > "$report"

sha256sum "$report" > "$report.sha256"
echo "EVIDENCE_REPORT=$report"
echo "EVIDENCE_SHA256=$(awk '{print $1}' "$report.sha256")"
echo "LIMITATION=Collector output only; PASS_CANDIDATE is not acceptance. Independently verify source, host identity, run/attempt/job/SHA, logs, artifact hash and contents before acceptance."
