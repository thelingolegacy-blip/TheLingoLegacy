#!/usr/bin/env bash
set -u
umask 077

# Read-only G02 host evidence collector. Does not start/stop/reconfigure services,
# access runner registration credentials, or print .runner/.credentials contents.
OUT="${1:-evidence/host-capture-$(date -u +%Y%m%dT%H%M%SZ)}"
RUNNER_NAME="${RUNNER_NAME:-lingo-legacy-g02}"
RUNNER_DIR="${RUNNER_DIR:-/opt/actions-runner}"
mkdir -p "$OUT" || exit 2
OUT="$(cd "$OUT" && pwd -P)" || exit 2

{
  echo "capture_utc=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "runner_name_expected=$RUNNER_NAME"
  echo "runner_dir=$RUNNER_DIR"
  echo "host_os=$(uname -s 2>/dev/null || echo UNKNOWN)"
  echo "host_kernel=$(uname -r 2>/dev/null || echo UNKNOWN)"
  echo "host_arch=$(uname -m 2>/dev/null || echo UNKNOWN)"
  echo "os_release_id=$(awk -F= '/^ID=/{gsub(/"/,"",$2); print $2; exit}' /etc/os-release 2>/dev/null || echo UNKNOWN)"
  echo "systemd_available=$(command -v systemctl >/dev/null 2>&1 && echo yes || echo no)"
} > "$OUT/runner-context.txt"

fail=0
{
  check() {
    label="$1"; shift
    if "$@" >/dev/null 2>&1; then printf 'PASS: %s\n' "$label"
    else printf 'FAIL: %s\n' "$label"; fail=1
    fi
  }
  check "runner directory exists" test -d "$RUNNER_DIR"
  check "runner config marker exists (contents not read)" test -s "$RUNNER_DIR/.runner"
  check "runner service script exists" test -x "$RUNNER_DIR/svc.sh"
  check "systemctl available" command -v systemctl
  check "curl available" command -v curl

  service_unit=""
  if command -v systemctl >/dev/null 2>&1; then
    service_unit="$(systemctl list-unit-files 'actions.runner.*.service' --no-legend 2>/dev/null | awk -v n="$RUNNER_NAME" 'index($1,n){print $1; exit}')"
  fi
  if [ -n "$service_unit" ]; then
    printf 'service_unit=%s\n' "$service_unit"
    active="$(systemctl is-active "$service_unit" 2>/dev/null || true)"
    enabled="$(systemctl is-enabled "$service_unit" 2>/dev/null || true)"
    printf 'service_active_state=%s\n' "${active:-unknown}"
    printf 'service_enabled_state=%s\n' "${enabled:-unknown}"
    systemctl show "$service_unit" --no-pager \
      --property=ActiveState,SubState,UnitFileState,ExecMainPID,ExecMainStartTimestamp 2>/dev/null \
      | sed 's/[^=]*=/service_property=/' || true
    [ "$active" = "active" ] || fail=1
  else
    echo "service_unit=NOT_FOUND"
    fail=1
  fi

  if pgrep -af '[R]unner.Listener|[r]unsvc.sh' >/dev/null 2>&1; then
    echo "runner_process_present=yes"
    pgrep -af '[R]unner.Listener|[r]unsvc.sh' 2>/dev/null | sed -E 's/(--token|--password|token=|password=)[^ ]+/\1[REDACTED]/Ig' | cut -c1-300
  else
    echo "runner_process_present=no"
    fail=1
  fi

  if [ -d "$RUNNER_DIR/_diag" ]; then
    echo "diagnostic_directory_present=yes"
    find "$RUNNER_DIR/_diag" -maxdepth 1 -type f \( -name 'Worker_*.log' -o -name 'Runner_*.log' \) -printf '%f %s bytes %TY-%Tm-%TdT%TH:%TM:%TS\n' 2>/dev/null | sort | tail -20
  else
    echo "diagnostic_directory_present=no"
  fi
  echo "host_checks_exit_code=$fail"
} > "$OUT/host-checks.txt" 2>&1

# No sentinel result is synthesized here. It must come from a real GitHub job.
{
  echo "sentinel_result=NOT_CAPTURED_BY_HOST_SCRIPT"
  echo "reason=Sentinel proof must be collected from a real assigned GitHub Actions job."
} > "$OUT/sentinel-result.txt"

(
  cd "$OUT" || exit 2
  sha256sum runner-context.txt host-checks.txt sentinel-result.txt > SHA256SUMS
)

echo "G02_HOST_CAPTURE_DIR=$OUT"
echo "G02_HOST_CAPTURE_EXIT_CODE=$fail"
echo "G02_HOST_CAPTURE_SHA256SUMS=$OUT/SHA256SUMS"
echo "NOTE: This is host telemetry only; it cannot establish G02 acceptance."
exit "$fail"
