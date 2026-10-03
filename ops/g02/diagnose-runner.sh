#!/usr/bin/env bash
set -euo pipefail

RUNNER_NAME="${RUNNER_NAME:-lingo-legacy-g02}"
RUNNER_DIR="${RUNNER_DIR:-/opt/actions-runner}"

echo "G02 HOST DIAGNOSTIC"
echo "runner_name=$RUNNER_NAME"
echo "runner_dir=$RUNNER_DIR"
echo

fail=0
check() {
  local label="$1"; shift
  if "$@"; then
    echo "PASS: $label"
  else
    echo "FAIL: $label"
    fail=1
  fi
}

check "runner directory exists" test -d "$RUNNER_DIR"
check "runner config exists" test -f "$RUNNER_DIR/.runner"
check "runner service tooling exists" test -x "$RUNNER_DIR/svc.sh"
check "systemd available" command -v systemctl
check "curl available" command -v curl

service_unit=""
if command -v systemctl >/dev/null 2>&1; then
  service_unit="$(systemctl list-unit-files 'actions.runner.*.service' --no-legend 2>/dev/null | awk -v name="$RUNNER_NAME" 'index($1,name){print $1; exit}')"
fi

if [[ -n "$service_unit" ]]; then
  echo "service_unit=$service_unit"
  check "runner service enabled" systemctl is-enabled "$service_unit"
  check "runner service active" systemctl is-active "$service_unit"
  echo
  echo "---- service status ----"
  systemctl --no-pager --full status "$service_unit" --lines=40 || true
  echo
  echo "---- recent runner logs ----"
  journalctl -u "$service_unit" -n 80 --no-pager || true
else
  echo "FAIL: no systemd service matched RUNNER_NAME=$RUNNER_NAME"
  fail=1
fi

echo
echo "---- runner files ----"
ls -la "$RUNNER_DIR" 2>/dev/null || true

echo
echo "---- recent Worker/Runner logs ----"
find "$RUNNER_DIR/_diag" -maxdepth 1 -type f -printf '%f\n' 2>/dev/null | sort | tail -20 || true
find "$RUNNER_DIR/_diag" -maxdepth 1 -type f -name 'Worker_*.log' -o -name 'Runner_*.log' 2>/dev/null | sort | tail -4 | while read -r f; do
  echo "### $f"
  tail -40 "$f" || true
done

echo
if [[ "$fail" -eq 0 ]]; then
  echo "G02_HOST_DIAGNOSTIC=PASS"
  echo "NOTE: host PASS is not G02 gate PASS; empirical GitHub assignment is still required."
else
  echo "G02_HOST_DIAGNOSTIC=FAIL"
  echo "Repair the failed host checks, then dispatch the G02 qualified evidence probe."
  exit 1
fi
