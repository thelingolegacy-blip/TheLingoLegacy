#!/usr/bin/env bash
# Read-only GitHub Actions / runner evidence collector for G02.
# Requires GitHub CLI authenticated as a repository administrator.
# Does not mutate settings, register/delete runners, retry workflows, or read secrets.
set -uo pipefail
umask 077

REPO="${REPO:-thelingolegacy-blip/TheLingoLegacy}"
ORG="${ORG:-}"
ENTERPRISE_SLUG="${ENTERPRISE_SLUG:-}"
OUT_DIR="${OUT_DIR:-./g02-admin-evidence-$(date -u +%Y%m%dT%H%M%SZ)}"
# Keep the newest observed pre-job failures first, followed by prior corroborating runs.
RUN_IDS="${RUN_IDS:-40127783265 40127528789 40127528124 40127527347 40127462871 40127461935 40127461258 40127295954 40127295226 40127294489 40126492313 40126491618 40126490974 40126326096 40126325434 40126324756 40125931937 40125931229 40125930706 40124749265 40124748559 40124747821 40124367746 40124366718 40124365525 40124210534 40124209733 40124209037 40123956734 40123955882 40123955061 40123862743 40123862003 40123861256 40123738025 40123737298 40123736631}"
CHECK_SUITE_IDS="${CHECK_SUITE_IDS:-108765123220 108765120960 108765119082 108764689096 108764687203 108764685257 108762602894 108762600856 108762599033}"

if [[ ! "$REPO" =~ ^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$ ]]; then
  echo "BLOCKED: REPO must be owner/name; no API calls were made." >&2
  exit 2
fi
if [[ -n "$ORG" && ! "$ORG" =~ ^[A-Za-z0-9_.-]+$ ]]; then
  echo "BLOCKED: ORG must be an organization slug; no API calls were made." >&2
  exit 2
fi
if [[ -n "$ENTERPRISE_SLUG" && ! "$ENTERPRISE_SLUG" =~ ^[A-Za-z0-9_.-]+$ ]]; then
  echo "BLOCKED: ENTERPRISE_SLUG must be an enterprise slug; no API calls were made." >&2
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

record_endpoint "Workflow token permissions" "repos/$REPO/actions/permissions/workflow" "workflow-token-permissions.json" '{default_workflow_permissions, can_approve_pull_request_reviews}'
record_endpoint "Repository runner groups" "repos/$REPO/actions/runner-groups?per_page=100" "repository-runner-groups.json" '{total_count: .total_count, runner_groups: [.runner_groups[]? | {id, name, visibility, allows_public_repositories, restricted_to_workflows, selected_workflows_url, runners_url}]}'
if [[ -n "$ORG" ]]; then
  record_endpoint "Organization Actions permissions" "orgs/$ORG/actions/permissions" "organization-actions-permissions.json" '{enabled_repositories, allowed_actions, selected_actions_url, github_owned_allowed, verified_allowed, patterns_allowed, allowed_actions_configured, default_workflow_permissions, can_approve_pull_request_reviews}'
  record_endpoint "Organization runner groups" "orgs/$ORG/actions/runner-groups?per_page=100" "organization-runner-groups.json" '{total_count: .total_count, runner_groups: [.runner_groups[]? | {id, name, visibility, allows_public_repositories, restricted_to_workflows, selected_repositories_url, runners_url}]}'
fi
if [[ -n "$ENTERPRISE_SLUG" ]]; then
  record_endpoint "Enterprise Actions permissions" "enterprises/$ENTERPRISE_SLUG/actions/permissions" "enterprise-actions-permissions.json" '{enabled_organizations, allowed_actions, github_owned_allowed, verified_allowed, patterns_allowed, allowed_actions_configured}'
  record_endpoint "Enterprise runner groups" "enterprises/$ENTERPRISE_SLUG/actions/runner-groups?per_page=100" "enterprise-runner-groups.json" '{total_count: .total_count, runner_groups: [.runner_groups[]? | {id, name, visibility, allows_public_repositories, restricted_to_workflows, selected_organizations_url, runners_url}]}'
fi

for run_id in $RUN_IDS; do
  [[ "$run_id" =~ ^[0-9]+$ ]] || {
    printf 'SKIP invalid run ID: %s\n' "$run_id" >> "$STATUS"
    continue
  }
  # Run metadata establishes the server-side conclusion/timestamps alongside job snapshots.
  record_endpoint "Metadata for run $run_id" "repos/$REPO/actions/runs/$run_id" "run-$run_id-metadata.json" \
    '{id, name, workflow_id, check_suite_id, run_number, run_attempt, event, status, conclusion, created_at, updated_at, run_started_at, head_branch, head_sha, path, html_url}'
  record_endpoint "Jobs for run $run_id" "repos/$REPO/actions/runs/$run_id/jobs?filter=all&per_page=100" "run-$run_id-jobs.json" \
    '{total_count: .total_count, jobs: [.jobs[]? | {id, name, status, conclusion, runner_id, runner_name, labels, head_sha, started_at, completed_at, steps: [.steps[]? | {name, status, conclusion, number, started_at, completed_at}]}]}'
  # Capture artifact inventory as well; no downloads or workflow reruns are performed.
  record_endpoint "Artifacts for run $run_id" "repos/$REPO/actions/runs/$run_id/artifacts?per_page=100" "run-$run_id-artifacts.json" \
    '{total_count: .total_count, artifacts: [.artifacts[]? | {id, name, size_in_bytes, expired, created_at, updated_at, expires_at, workflow_run: {id: .workflow_run.id, head_branch: .workflow_run.head_branch, head_sha: .workflow_run.head_sha}}]}'
  # Timing helps distinguish a pre-job startup abort from a job that actually consumed runner time.
  record_endpoint "Timing for run $run_id" "repos/$REPO/actions/runs/$run_id/timing" "run-$run_id-timing.json" \
    '{run_duration_ms, billable}'
done

# Dynamically include check-suite IDs discovered from the run metadata just collected.
# This keeps newly observed runs diagnosable even when a wrapper does not expose suite IDs.
DYNAMIC_CHECK_SUITE_IDS=""
for metadata_file in "$OUT_DIR"/run-*-metadata.json; do
  [[ -f "$metadata_file" ]] || continue
  discovered_suite_id="$(jq -r '.check_suite_id // empty' "$metadata_file" 2>/dev/null || true)"
  [[ "$discovered_suite_id" =~ ^[0-9]+$ ]] || continue
  DYNAMIC_CHECK_SUITE_IDS+="$discovered_suite_id "
done
CHECK_SUITE_IDS="$(printf '%s\n%s\n' "$CHECK_SUITE_IDS" "$DYNAMIC_CHECK_SUITE_IDS" | tr ' ' '\n' | awk 'NF && !seen[$0]++' | tr '\n' ' ')"

# Check-suite/check-run diagnostics may expose the platform-side failure reason when job records are absent.
for suite_id in $CHECK_SUITE_IDS; do
  [[ "$suite_id" =~ ^[0-9]+$ ]] || {
    printf 'SKIP invalid check-suite ID: %s\n' "$suite_id" >> "$STATUS"
    continue
  }
  record_endpoint "Check suite $suite_id" "repos/$REPO/check-suites/$suite_id" "check-suite-$suite_id.json" '{id, head_sha, head_branch, status, conclusion, before, after, created_at, updated_at, app: {id: .app.id, slug: .app.slug, name: .app.name, owner: .app.owner.login}, pull_requests: [.pull_requests[]? | {number, head: .head.sha, base: .base.ref}]}'
  record_endpoint "Check runs for suite $suite_id" "repos/$REPO/check-suites/$suite_id/check-runs?filter=all&per_page=100" "check-suite-$suite_id-runs.json" '{total_count: .total_count, check_runs: [.check_runs[]? | {id, name, status, conclusion, started_at, completed_at, details_url, external_id, output: {title: .output.title, summary: .output.summary, text: .output.text}, app: {id: .app.id, slug: .app.slug, name: .app.name}}]}'
done

# Also capture check runs indexed by each distinct commit SHA. This is an independent view
# from workflow-run/job listings and can surface check output when a job graph is absent.
DYNAMIC_HEAD_SHAS=""
for metadata_file in "$OUT_DIR"/run-*-metadata.json; do
  [[ -f "$metadata_file" ]] || continue
  discovered_sha="$(jq -r '.head_sha // empty' "$metadata_file" 2>/dev/null || true)"
  [[ "$discovered_sha" =~ ^[0-9a-fA-F]{40}$ ]] || continue
  DYNAMIC_HEAD_SHAS+="$discovered_sha "
done
HEAD_SHAS="$(printf '%s\n' "$DYNAMIC_HEAD_SHAS" | tr ' ' '\n' | awk 'NF && !seen[$0]++' | tr '\n' ' ')"
for head_sha in $HEAD_SHAS; do
  record_endpoint "Commit check runs for $head_sha" "repos/$REPO/commits/$head_sha/check-runs?filter=all&per_page=100" "commit-$head_sha-check-runs.json" \
    '{total_count: .total_count, check_runs: [.check_runs[]? | {id, name, status, conclusion, started_at, completed_at, details_url, output: {title: .output.title, summary: .output.summary, text: .output.text}, app: {id: .app.id, slug: .app.slug, name: .app.name}}]}'
done

{
  echo "G02_ADMIN_EVIDENCE_COLLECTION"
  echo "captured_utc=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "repository=$REPO"
  echo "organization_scope=${ORG:-not-requested}"
  echo "enterprise_scope=${ENTERPRISE_SLUG:-not-requested}"
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
