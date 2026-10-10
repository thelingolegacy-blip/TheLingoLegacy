#!/usr/bin/env bash
# Read-only G02 Linux runner telemetry capture.
# Does not register/reconfigure/restart a runner, print secrets, or mutate production.
set +e
umask 077

RUNNER_ROOT="${RUNNER_ROOT:-/opt/actions-runner}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="${1:-/tmp/lingo-g02-host-telemetry-${STAMP}.txt}"

{
  echo "LINGO_G02_HOST_TELEMETRY_VERSION=1"
  echo "CAPTURED_AT_UTC=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "HOSTNAME=$(hostname 2>/dev/null | tr -cd '[:alnum:]._-')"
  echo "OS=$(uname -s 2>/dev/null)"
  echo "ARCH=$(uname -m 2>/dev/null)"
  echo "KERNEL=$(uname -r 2>/dev/null | tr -cd '[:alnum:]._.+-')"
  echo "RUNNER_ROOT=$RUNNER_ROOT"
  if [ -d "$RUNNER_ROOT" ]; then echo "RUNNER_ROOT_PRESENT=true"; else echo "RUNNER_ROOT_PRESENT=false"; fi
  if [ -f "$RUNNER_ROOT/.runner" ]; then echo "RUNNER_CONFIG_PRESENT=true"; else echo "RUNNER_CONFIG_PRESENT=false"; fi
  if [ -f "$RUNNER_ROOT/.credentials" ]; then echo "RUNNER_CREDENTIALS_FILE_PRESENT=true"; else echo "RUNNER_CREDENTIALS_FILE_PRESENT=false"; fi
  if [ -f "$RUNNER_ROOT/.credentials_rsaparams" ]; then echo "RUNNER_RSA_FILE_PRESENT=true"; else echo "RUNNER_RSA_FILE_PRESENT=false"; fi

  echo "--- RUNNER PROCESSES (PID/ELAPSED/COMMAND ONLY) ---"
  ps -eo pid,etime,comm 2>/dev/null | awk 'tolower($3) ~ /runner.listener|runsvc.sh|runsvc/ {print}'

  echo "--- RUNNER SERVICES (NAMES/STATES ONLY) ---"
  if command -v systemctl >/dev/null 2>&1; then
    systemctl list-units --type=service --all --no-legend --no-pager 2>/dev/null |
      awk 'tolower($1) ~ /runner/ {print $1, $3, $4}'
  else
    echo "SYSTEMD_AVAILABLE=false"
  fi

  echo "--- SERVICE FILES (NAMES ONLY) ---"
  if command -v systemctl >/dev/null 2>&1; then
    systemctl list-unit-files --type=service --no-legend --no-pager 2>/dev/null |
      awk 'tolower($1) ~ /runner/ {print $1, $2}'
  fi

  echo "--- RUNNER DIAGNOSTIC SIGNAL COUNTS (NO LOG LINES) ---"
  if [ -d "$RUNNER_ROOT/_diag" ]; then
    find "$RUNNER_ROOT/_diag" -maxdepth 1 -type f -name 'Runner_*.log' -print0 2>/dev/null |
      xargs -0 -r grep -h -E -i -o 'Connected to GitHub|Listening for Jobs|Failed to connect|403 Forbidden|401 Unauthorized|Runner listener exited|Session expired' 2>/dev/null |
      sort | uniq -c
  else
    echo "DIAG_DIRECTORY_PRESENT=false"
  fi

  echo "--- BASIC NETWORK CHECK ---"
  if command -v curl >/dev/null 2>&1; then
    code="$(curl --silent --show-error --output /dev/null --max-time 8 --write-out '%{http_code}' https://github.com 2>/dev/null)"
    rc=$?
    echo "GITHUB_HTTPS_CURL_EXIT=$rc"
    echo "GITHUB_HTTPS_STATUS=$code"
  else
    echo "CURL_AVAILABLE=false"
  fi
} > "$OUT" 2>&1

rc=$?
chmod 600 "$OUT" 2>/dev/null
echo "TELEMETRY_CAPTURE_EXIT=$rc"
echo "TELEMETRY_REPORT_PATH=$OUT"
echo "TELEMETRY_REPORT_SHA256=$(sha256sum "$OUT" 2>/dev/null | awk '{print $1}')"
echo "READ_ONLY=true"
echo "REDACTION_NOTE=Report intentionally omits credentials, runner tokens, environment variables, full process arguments, and raw diagnostic log lines."
exit "$rc"
