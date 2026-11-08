#!/usr/bin/env bash
# Read-only telemetry collector for an authorized Linux x64 runner host.
# Does not install software, register runners, restart services, or print environment secrets.
set -uo pipefail
OUT_DIR="${1:-./g02-host-evidence}"
mkdir -p "$OUT_DIR"
REPORT="$OUT_DIR/host-report.txt"
{
  echo "schema=lingo-g02-host-report-v1"
  echo "captured_at_utc=$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
  echo "hostname=$(hostname 2>/dev/null || echo unavailable)"
  echo "kernel=$(uname -s 2>/dev/null || echo unavailable)"
  echo "architecture=$(uname -m 2>/dev/null || echo unavailable)"
  echo "uid=$(id -u 2>/dev/null || echo unavailable)"
  echo
  echo "== runner processes =="
  ps -eo pid,etime,comm,args 2>/dev/null | grep -E '[R]unner.Listener|[r]unsvc\.sh|[R]unner.Worker' || true
  echo
  echo "== likely runner service units =="
  if command -v systemctl >/dev/null 2>&1; then
    systemctl list-units --type=service --all --no-legend 2>/dev/null | grep -Ei 'actions\.runner|github.*runner|lingo.*runner' || true
  else
    echo "systemctl unavailable"
  fi
  echo
  echo "== runner install paths (names only) =="
  for base in "$HOME" /opt /srv; do
    [ -d "$base" ] || continue
    find "$base" -maxdepth 5 -type f \( -name config.sh -o -name run.sh -o -name svc.sh \) -print 2>/dev/null | head -100
  done
  echo
  echo "== disk and memory =="
  df -h "$HOME" 2>/dev/null || true
  if command -v free >/dev/null 2>&1; then free -h; fi
  echo
  echo "== connectivity (no credentials) =="
  if command -v curl >/dev/null 2>&1; then
    curl -sS -o /dev/null -w 'github_api_http=%{http_code}\n' --connect-timeout 5 --max-time 10 https://api.github.com/ || echo "github_api_probe=FAILED"
  fi
} >"$REPORT" 2>&1
sha256sum "$REPORT" > "$REPORT.sha256"
printf 'HOST_REPORT=%s\nHOST_REPORT_SHA256_FILE=%s\n' "$REPORT" "$REPORT.sha256"
echo "READ_ONLY_DIAGNOSTIC_COMPLETE=1"
echo "NOTE=This report does not prove runner registration or job assignment."
