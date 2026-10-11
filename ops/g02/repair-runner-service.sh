#!/usr/bin/env bash
# G02 service recovery helper. Fail-closed: never installs or re-registers a runner.
# Run on the intended Linux host as root. Does not change production application services.
set -uo pipefail

RUNNER_NAME="${RUNNER_NAME:-lingo-legacy-g02}"
CANDIDATES=("${RUNNER_DIR:-}" "/opt/actions-runner-g02" "/opt/actions-runner")
if [[ "$(id -u)" -ne 0 ]]; then
  echo "ERROR=must_run_as_root"
  exit 2
fi
command -v systemctl >/dev/null 2>&1 || { echo "ERROR=systemctl_missing"; exit 2; }

echo "G02_SERVICE_RECOVERY=START"
date -u
hostname
uname -a
echo "RUNNER_NAME=$RUNNER_NAME"

mapfile -t units < <(systemctl list-unit-files 'actions.runner.*.service' --no-legend 2>/dev/null |
  awk -v name="$RUNNER_NAME" 'index($1,name){print $1}')

if [[ "${#units[@]}" -eq 0 ]]; then
  echo "RESULT=BLOCKED"
  echo "REASON=no_matching_runner_service"
  echo "NEXT=Inspect both installation directories and runner registration before installing or registering anything."
  systemctl list-unit-files 'actions.runner.*.service' --no-legend 2>&1 || true
  exit 10
fi
if [[ "${#units[@]}" -gt 1 ]]; then
  echo "RESULT=BLOCKED"
  echo "REASON=multiple_matching_services_fail_closed"
  printf 'MATCH=%s\n' "${units[@]}"
  echo "NEXT=Identify the intended service manually; this script will not restart an ambiguous runner."
  exit 11
fi

unit="${units[0]}"
echo "MATCHED_SERVICE=$unit"
echo
echo "=== CANDIDATE INSTALLATION PATHS ==="
found_dir=""
for d in "${CANDIDATES[@]}"; do
  [[ -n "$d" ]] || continue
  if [[ -f "$d/.runner" && -x "$d/svc.sh" ]]; then
    echo "REGISTERED_INSTALLATION=$d"
    if [[ -n "$found_dir" && "$found_dir" != "$d" ]]; then
      echo "RESULT=BLOCKED"
      echo "REASON=multiple_registered_installations"
      exit 12
    fi
    found_dir="$d"
  else
    echo "NOT_COMPLETE_INSTALLATION=$d"
  fi
done

if [[ -z "$found_dir" ]]; then
  echo "RESULT=BLOCKED"
  echo "REASON=no_candidate_has_both_registration_and_service_script"
  echo "NEXT=Inspect service ExecStart and provisioning history; do not re-register blindly."
  systemctl --no-pager --full status "$unit" --lines=40 2>&1 || true
  journalctl -u "$unit" -n 60 --no-pager 2>&1 || true
  exit 13
fi

echo "RUNNER_DIR=$found_dir"
echo
echo "=== BEFORE STATE ==="
systemctl is-enabled "$unit" 2>&1; echo "IS_ENABLED_EXIT_CODE=$?"
before="$(systemctl is-active "$unit" 2>/dev/null || true)"
echo "SERVICE_STATE_BEFORE=${before:-unknown}"

if [[ "$before" != "active" ]]; then
  echo "ACTION=START_EXISTING_MATCHED_SERVICE"
  systemctl enable "$unit" || { echo "RESULT=BLOCKED"; echo "REASON=service_enable_failed"; exit 20; }
  systemctl start "$unit" || {
    echo "RESULT=BLOCKED"
    echo "REASON=service_start_failed"
    systemctl --no-pager --full status "$unit" --lines=50 2>&1 || true
    journalctl -u "$unit" -n 100 --no-pager 2>&1 || true
    exit 21
  }
else
  echo "ACTION=NO_RESTART_SERVICE_ALREADY_ACTIVE"
fi

after="$(systemctl is-active "$unit" 2>/dev/null || true)"
echo "SERVICE_STATE_AFTER=${after:-unknown}"
systemctl --no-pager --full status "$unit" --lines=35 2>&1 || true
echo
echo "=== RUNNER LISTENER ==="
ps -eo pid,etime,user,comm,args | grep -E '[R]unner.Listener|[r]unsvc\.sh' || true
echo
journalctl -u "$unit" -n 50 --no-pager 2>&1 || true

if [[ "$after" == "active" ]]; then
  echo "G02_SERVICE_RECOVERY=PASS"
  echo "NOTE=Service active is not proof of GitHub assignment."
  echo "G02_ACCEPTANCE=NOT_GRANTED"
  exit 0
fi
echo "G02_SERVICE_RECOVERY=FAIL"
echo "G02_ACCEPTANCE=NOT_GRANTED"
exit 22
