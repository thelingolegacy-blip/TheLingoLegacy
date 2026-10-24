#!/usr/bin/env bash
# Read-only GitHub Actions / runner evidence collector for G02.
# Requires GitHub CLI authenticated as a repository administrator.
# Does not mutate settings, register/delete runners, retry workflows, or read secrets.
set -uo pipefail
umask 077

REPO="${REPO:-thelingolegacy-blip/TheLingoLegacy}"
OUT_DIR="${OUT_DIR:-./g02-admin-evidence-$(date -u +%Y%m%dT%H%M%SZ)}"
# Keep the newest observed pre-job failures first, followed by prior corroborating runs.
RUN_IDS="${RUN_IDS:-40126326096 40126325434 40126324756 40125931937 40125931229 40125930706 40124749265 40124748559 40124747821 40124367746 40124366718 40124365525 40124210534 40124209733 40124209037 40123956734 40123955882 40123955061 40123862743 40123862003 40123861256 40123738025 40123737298 40123736631}"

if [[ ! "$REPO" =~ ^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$ ]]; then
  echo "BLOCKED: REPO must be owner/name; no API calls were made." >&2
  exit 2
fi
mkdir -p "$OUT_DIR" || exit 2
chmod 700 "$OUT_DIR" 2>/dev/null || true
STATUS="$OUT_DIR/collection-status.txt"
: > "$STATUS"
chmod 600 "$STATUS"

if ! command -v gh >/dev/null 2>&1; then
  echo "BLOCKED: GitHub CLI (gh) is not installed." | tee -a "$STATUS"
  exit 2
fi
if ! command -v jq >/dev/null 2>&1; then
  echo "BLOCKED: jq is not installed." | tee -a "$STATUS"
  exit 2
fi
if ! gh auth status >/dev/null 2>&1; then
  echo "BLOCKED: gh is not authenticated. Authenticate interactively as an authorized repository/account owner; do not paste tokens into chat." | tee -a "$STATUS"
  exit 2
fi

record_endpoint() {
  local label="$1" endpoint="$2" output="$3" filter="${4:-.}"
  local tmp="$OUT_DIR/.response.tmp" rc
  if gh api --hostname github.com "$endpoint" > "$tmp" 2>/dev/null; then
    if jq "$filter" "$tmp" > "$OUT_DIR/$output" 2>/dev/null; then
      printf 'PASS %s -> %s\n' "$label" "$output" >> "$STATUS"
    else
      printf 'FAIL %s: response was not valid expected JSON; raw response discarded\n' "$label" >> "$STATUS"
      rm -f "$OUT_DIR/$output"
    fi
  else
    rc=$?
    printf 'BLOCKED %s: GitHub API request failed (exit %s); check owner permissions or endpoint availability\n' "$label" "$rc" >> "$STATUS"
    rm -f "$OUT_DIR/$output"
  fi
  rm -f "$tmp"
}

record_endpoint "Actions permissions" "repos/$REPO/actions/permissions" "actions-permissions.json" \
  '{enabled: .enabled, allowed_actions: .allowed_actions, selected_actions_url: .selected_actions_url, sha_pinning_required: .sha_pinning_required}'
record_endpoint "Runner inventory" "repos/$REPO/actions/runners?per_page=100" "runner-inventory.json" \
  '{total_count: .total_count, runners: [.runners[]? | {id, name, os, status, busy, labels: [.labels[]?.name], ephemeral, disabled, runner_group_id}]}'
record_endpoint "Workflow inventory" "repos/$REPO/actions/workflows?per_page=100" "workflow-inventory.json" \
  '{total_count: .total_count, workflows: [.workflows[]? | {id, name, path, state, html_url}]}'

for run_id in $RUN_IDS; do
  [[ "$run_id" =~ ^[0-9]+$ ]] || {
    printf 'SKIP invalid run ID: %s\n' "$run_id" >> "$STATUS"
    continue
  }
  # Run metadata establishes the server-side conclusion/timestamps alongside job snapshots.
  record_endpoint "Metadata for run $run_id" "repos/$REPO/actions/runs/$run_id" "run-$run_id-metadata.json" \
    '{id, name, workflow_id, run_number, run_attempt, event, status, conclusion, created_at, updated_at, run_started_at, head_branch, head_sha, path, html_url}'
  record_endpoint "Jobs for run $run_id" "repos/$REPO/actions/runs/$run_id/jobs?per_page=100" "run-$run_id-jobs.json" \
    '{total_count: .total_count, jobs: [.jobs[]? | {id, name, status, conclusion, runner_id, runner_name, labels, head_sha, started_at, completed_at, steps: [.steps[]? | {name, status, conclusion, number, started_at, completed_at}]}]}'
  # Capture artifact inventory as well; no downloads or workflow reruns are performed.
  record_endpoint "Artifacts for run $run_id" "repos/$REPO/actions/runs/$run_id/artifacts?per_page=100" "run-$run_id-artifacts.json" \
    '{total_count: .total_count, artifacts: [.artifacts[]? | {id, name, size_in_bytes, expired, created_at, updated_at, expires_at, workflow_run: {id: .workflow_run.id, head_branch: .workflow_run.head_branch, head_sha: .workflow_run.head_sha}}]}'
done

{
  echo "G02_ADMIN_EVIDENCE_COLLECTION"
  echo "captured_utc=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "repository=$REPO"
  echo "collector_mode=read-only"
  echo "settings_mutated=false"
  echo "runner_registered_or_deleted=false"
  echo "workflow_retried_or_dispatched=false"
  echo "secrets_or_environment_dump_read=false"
  echo "run_ids_requested=$(wc -w <<< "$RUN_IDS" | tr -d ' ')"
  echo "review collection-status.txt; missing files mean the endpoint was unavailable or returned unexpected data"
} > "$OUT_DIR/README.txt"
chmod 600 "$OUT_DIR"/* 2>/dev/null || true
rm -f "$OUT_DIR/.response.tmp"
echo "Collection finished: $OUT_DIR"
echo "Status: $STATUS"
echo "Review and redact before sharing. Do not include tokens, credential files, or full environment dumps."
