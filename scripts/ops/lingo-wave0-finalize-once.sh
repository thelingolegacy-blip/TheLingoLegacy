#!/usr/bin/env bash
# LINGO Legacy Wave 0 one-time final audit
# Read-only against GitHub, Cloudflare, DNS, and production. Writes only a local evidence report.
# Does NOT trigger workflows, merge PRs, change branch protection, deploy, or mutate DNS/Workers/Tunnels/billing/Stripe.
set -Eeuo pipefail
umask 077

REPO="${REPO:-thelingolegacy-blip/TheLingoLegacy}"
EXPECTED_MAIN_SHA="${EXPECTED_MAIN_SHA:-8897ac1549753eb8503fc5e7f60451960a129bfb}"
RUN_ID="${RUN_ID:-39595457587}"
OUT_DIR="${OUT_DIR:-./lingo-wave0-evidence-$(date -u +%Y%m%dT%H%M%SZ)}"
mkdir -p "$OUT_DIR"
REPORT="$OUT_DIR/final-audit.md"
RAW="$OUT_DIR/raw"
mkdir -p "$RAW"
PASS=0; FAIL=0; BLOCKED=0; UNKNOWN=0

record() {
  local status="$1" title="$2" detail="$3"
  printf '\n### [%s] %s\n\n%s\n' "$status" "$title" "$detail" >> "$REPORT"
  case "$status" in PASS) PASS=$((PASS+1));; FAIL) FAIL=$((FAIL+1));; BLOCKED) BLOCKED=$((BLOCKED+1));; *) UNKNOWN=$((UNKNOWN+1));; esac
}
have() { command -v "$1" >/dev/null 2>&1; }
safe_api() {
  local endpoint="$1" out="$2"
  gh api "$endpoint" > "$out" 2>"$out.err"
}
{
  echo "# LINGO Legacy — one-time Wave 0 final audit"
  echo
  echo "- Timestamp UTC: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "- Repository: $REPO"
  echo "- Expected main SHA at script authoring: $EXPECTED_MAIN_SHA"
  echo "- Workflow run observed: $RUN_ID"
  echo "- Mode: read-only audit; no production mutations"
  echo
} > "$REPORT"

for cmd in git gh curl; do
  if have "$cmd"; then record PASS "Dependency: $cmd" "Available: $(command -v "$cmd")"
  else record BLOCKED "Dependency: $cmd" "Missing. Install it and rerun this script; no system packages were installed."; fi
done

if ! have gh; then
  record BLOCKED "GitHub evidence" "GitHub CLI is missing; cannot verify repository, Actions, or branch protection."
else
  if gh auth status >"$RAW/gh-auth.txt" 2>&1; then
    record PASS "GitHub CLI authentication" "Authenticated session detected. The auth output is stored locally; inspect before sharing."
  else
    record BLOCKED "GitHub CLI authentication" "No usable gh authentication. Run 'gh auth login' interactively, then rerun."
  fi

  if safe_api "repos/$REPO" "$RAW/repo.json"; then
    repo_default="$(gh api "repos/$REPO" --jq '.default_branch' 2>/dev/null || true)"
    record PASS "Repository API" "Repository metadata retrieved. Default branch: ${repo_default:-unknown}."
  else
    record BLOCKED "Repository API" "Cannot read repository metadata. See $RAW/repo.json.err (redact before sharing)."
  fi

  if safe_api "repos/$REPO/commits/main" "$RAW/main.json"; then
    main_sha="$(gh api "repos/$REPO/commits/main" --jq '.sha' 2>/dev/null || true)"
    if [[ "$main_sha" == "$EXPECTED_MAIN_SHA" ]]; then
      record PASS "main commit" "main SHA matches expected baseline: $main_sha"
    else
      record FAIL "main commit drift" "Expected $EXPECTED_MAIN_SHA; observed ${main_sha:-unknown}. Review commit and PR history; script will not revert or rewrite history."
    fi
  else
    record BLOCKED "main commit" "Could not read main commit. See $RAW/main.json.err."
  fi

  if safe_api "repos/$REPO/branches/main/protection" "$RAW/main-protection.json"; then
    record PASS "Branch protection API" "GitHub returned branch protection data. Review $RAW/main-protection.json for required checks/reviews."
  else
    record BLOCKED "Branch protection" "Protection is inaccessible or not configured; this error alone cannot distinguish 403 from unprotected. Owner must verify Settings → Branches/rulesets. Error saved in $RAW/main-protection.json.err."
  fi

  if safe_api "repos/$REPO/actions/runs?per_page=10" "$RAW/workflow-runs.json"; then
    gh api "repos/$REPO/actions/runs?per_page=10" --jq '.workflow_runs[] | [.id,.name,.event,.status,.conclusion,.head_branch,.head_sha,.created_at,.html_url] | @tsv' > "$RAW/workflow-runs.tsv" 2>/dev/null || true
    record PASS "Workflow inventory" "Recent workflow-run inventory captured in $RAW/workflow-runs.tsv."
  else
    record BLOCKED "Workflow inventory" "Could not list workflow runs; inspect $RAW/workflow-runs.json.err."
  fi

  if safe_api "repos/$REPO/actions/runs/$RUN_ID" "$RAW/target-run.json"; then
    run_status="$(gh api "repos/$REPO/actions/runs/$RUN_ID" --jq '[.status,.conclusion,.head_sha,.html_url] | @tsv' 2>/dev/null || true)"
    record PASS "Target run $RUN_ID" "Current run record: $run_status"
    if safe_api "repos/$REPO/actions/runs/$RUN_ID/jobs?per_page=100" "$RAW/target-jobs.json"; then
      gh api "repos/$REPO/actions/runs/$RUN_ID/jobs?per_page=100" --jq '.jobs[] | [.id,.name,.status,.conclusion,(.runner_name // "null"),(.runner_id // 0),(.steps|length),(.html_url // "")] | @tsv' > "$RAW/target-jobs.tsv" 2>/dev/null || true
      record PASS "Target run jobs" "Job/runner/step inventory saved in $RAW/target-jobs.tsv. A queued job or empty steps is NOT a pass."
    else
      record BLOCKED "Target run jobs" "Cannot inspect jobs; see $RAW/target-jobs.json.err."
    fi
  else
    record BLOCKED "Target run $RUN_ID" "Cannot read target run; see $RAW/target-run.json.err."
  fi
fi

for host in thelingolegacy.com www.thelingolegacy.com; do
  if have curl; then
    if curl -sSIL --max-time 20 --max-redirs 10 "https://$host/" -o "$RAW/http-$host.headers" -w 'final_url=%{url_effective}\nhttp_code=%{http_code}\nredirects=%{num_redirects}\nremote_ip=%{remote_ip}\n' > "$RAW/http-$host.summary" 2>"$RAW/http-$host.err"; then
      summary="$(tr '\n' ' ' < "$RAW/http-$host.summary")"
      code="$(sed -n 's/^http_code=//p' "$RAW/http-$host.summary" | tail -n1)"
      if [[ "$code" =~ ^2[0-9][0-9]$ ]]; then record PASS "HTTPS route $host" "$summary Full redirect headers: $RAW/http-$host.headers"
      else record FAIL "HTTPS route $host" "$summary Inspect $RAW/http-$host.headers and .err; no DNS changes were made."; fi
    else
      record UNKNOWN "HTTPS route $host" "Probe failed or timed out. See $RAW/http-$host.err. Tool/network failure is not proof DNS is wrong."
    fi
  fi
  if have dig; then
    { echo "A"; dig +time=3 +tries=1 +short A "$host"; echo "AAAA"; dig +time=3 +tries=1 +short AAAA "$host"; echo "CNAME"; dig +time=3 +tries=1 +short CNAME "$host"; } > "$RAW/dns-$host.txt" 2>&1 || true
    record PASS "DNS snapshot $host" "DNS responses saved in $RAW/dns-$host.txt. Review against the approved DNS inventory; script does not infer a correct target."
  else
    record UNKNOWN "DNS snapshot $host" "dig is unavailable; install dnsutils/bind-tools or use an independent DNS probe."
  fi
done

if [[ -n "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  if have curl; then
    # Never print or store the token. Capture only the API response bodies and report HTTP/API success.
    cf_code="$(curl -sS --max-time 20 -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" -H 'Content-Type: application/json' -o "$RAW/cloudflare-zones.json" -w '%{http_code}' 'https://api.cloudflare.com/client/v4/zones?per_page=50' 2>"$RAW/cloudflare.err" || true)"
    if [[ "$cf_code" == "200" ]] && grep -q '"success":true' "$RAW/cloudflare-zones.json"; then
      record PASS "Cloudflare read-only zones" "API accepted token and returned zones. Response saved in $RAW/cloudflare-zones.json; verify token is read-only and compare zone IDs/names. Worker/Tunnel inventory is not automatically certified by this check."
    else
      record BLOCKED "Cloudflare read-only zones" "API status ${cf_code:-no-response}; inspect local response/error without sharing tokens. No Cloudflare resources were changed."
    fi
  else
    record BLOCKED "Cloudflare read-only zones" "curl is unavailable."
  fi
else
  record BLOCKED "Cloudflare inventory" "CLOUDFLARE_API_TOKEN not set; Cloudflare zone/Worker/Tunnel state remains UNKNOWN. Set only a least-privilege read-only token in your shell; never put it in this script or report."
fi

cat >> "$REPORT" <<EOF

## Summary

- PASS: $PASS
- FAIL: $FAIL
- BLOCKED: $BLOCKED
- UNKNOWN: $UNKNOWN

## Safe repair policy

This script performs no remote mutations. It does not trigger or rerun workflows, alter branch protection, merge/revert commits, deploy, modify DNS/Workers/Tunnels, change billing, or enable Stripe live mode. It writes a local evidence bundle only.

## Required release decision

G02 stays BLOCKED and Wave 0 stays OPEN unless the owner-reviewed evidence proves the acceptance predicate. A successful HTTP response, queued run, repository API access, or green-looking summary alone does not certify production. Resolve every FAIL/BLOCKED/UNKNOWN item with the named owner and evidence before promotion.
EOF

echo "Report: $REPORT"
echo "Raw evidence directory: $RAW"
echo "PASS=$PASS FAIL=$FAIL BLOCKED=$BLOCKED UNKNOWN=$UNKNOWN"
echo "Exit code: 0 means the audit ran, NOT that release gates passed."
exit 0
