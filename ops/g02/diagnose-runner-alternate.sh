#!/usr/bin/env bash
# G02 alternate host diagnostic. Read-only: does not install, register, restart, or mutate production.
set -uo pipefail

EXPECTED_NAME="${RUNNER_NAME:-lingo-legacy-g02}"
CANDIDATES=("${RUNNER_DIR:-}" "/opt/actions-runner-g02" "/opt/actions-runner")
declare -a DIRS=()
for d in "${CANDIDATES[@]}"; do
  [[ -n "$d" ]] || continue
  found=0
  for prior in "${DIRS[@]}"; do [[ "$prior" == "$d" ]] && found=1; done
  [[ "$found" -eq 1 ]] || DIRS+=("$d")
done

fail=0
echo "G02_ALTERNATE_DIAGNOSTIC=START"
date -u
hostname
uname -a
printf 'expected_runner_name=%s\n' "$EXPECTED_NAME"

echo
echo "=== CANDIDATE INSTALLATIONS ==="
for d in "${DIRS[@]}"; do
  echo "--- $d ---"
  if [[ -d "$d" ]]; then
    echo "directory=FOUND"
    [[ -f "$d/.runner" ]] && echo "registration_file=FOUND" || echo "registration_file=MISSING"
    [[ -x "$d/svc.sh" ]] && echo "service_script=FOUND" || echo "service_script=MISSING"
    if [[ -d "$d/_diag" ]]; then
      echo "diag_directory=FOUND"
      find "$d/_diag" -maxdepth 1 -type f -printf '%f\n' 2>/dev/null | sort | tail -10
    else
      echo "diag_directory=MISSING"
    fi
  else
    echo "directory=MISSING"
  fi
done

echo
echo "=== SYSTEMD RUNNER UNITS ==="
if command -v systemctl >/dev/null 2>&1; then
  units="$(systemctl list-unit-files 'actions.runner.*.service' --no-legend 2>&1)"
  rc=$?
  echo "$units"
  echo "list_unit_files_exit_code=$rc"
  if [[ "$rc" -ne 0 ]]; then fail=1; fi

  matched="$(printf '%s\n' "$units" | awk -v name="$EXPECTED_NAME" 'index($1,name){print $1}')"
  if [[ -z "$matched" ]]; then
    echo "MATCHED_SERVICE=NONE"
    echo "NEXT=Check runner service name and whether svc.sh install was completed."
    fail=1
  else
    while IFS= read -r unit; do
      [[ -n "$unit" ]] || continue
      echo "--- service: $unit ---"
      systemctl is-enabled "$unit" 2>&1; echo "is_enabled_exit_code=$?"
      systemctl is-active "$unit" 2>&1; echo "is_active_exit_code=$?"
      systemctl --no-pager --full status "$unit" --lines=30 2>&1 || true
      journalctl -u "$unit" -n 60 --no-pager 2>&1 || true
    done <<< "$matched"
  fi
else
  echo "SYSTEMD=UNAVAILABLE"
  fail=1
fi

echo
echo "=== RUNNER PROCESSES ==="
ps -eo pid,etime,user,comm,args 2>&1 | grep -E '[R]unner.Listener|[r]unsvc\.sh' || true

echo
echo "=== CONNECTIVITY CHECK ==="
if command -v curl >/dev/null 2>&1; then
  curl -sSIL --connect-timeout 5 --max-time 12 https://api.github.com/ -o /dev/null -w 'github_api_http_status=%{http_code}\n' 2>&1
  echo "github_api_curl_exit_code=$?"
else
  echo "curl=MISSING"
  fail=1
fi

echo
if [[ "$fail" -eq 0 ]]; then
  echo "G02_ALTERNATE_DIAGNOSTIC=COMPLETE_WITHOUT_DETECTED_PREREQUISITE_FAILURE"
  echo "G02_ACCEPTANCE=NOT_GRANTED"
  exit 0
else
  echo "G02_ALTERNATE_DIAGNOSTIC=ISSUES_FOUND"
  echo "G02_ACCEPTANCE=NOT_GRANTED"
  exit 1
fi
