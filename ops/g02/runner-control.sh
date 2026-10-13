#!/usr/bin/env bash
set -euo pipefail

# G02 runner recovery controller.
# Default operation is read-only. Mutating commands require both an explicit
# command-line flag and an explicit environment confirmation.
# This controller never declares G02 acceptance.

RUNNER_NAME="${RUNNER_NAME:-lingo-legacy-g02}"
RUNNER_DIR="${RUNNER_DIR:-/opt/actions-runner}"
CONNECT_TIMEOUT_SECONDS="${CONNECT_TIMEOUT_SECONDS:-300}"

command -v systemctl >/dev/null || { echo "systemctl is required" >&2; exit 2; }

service_unit="$(systemctl list-unit-files 'actions.runner.*.service' --no-legend |
  awk -v needle=".${RUNNER_NAME}.service" 'index($1, needle) > 0 { print $1; exit }')"

if [[ -z "$service_unit" ]]; then
  echo "No exact Actions Runner service found for RUNNER_NAME=$RUNNER_NAME." >&2
  echo "No service was started, stopped, enabled, reset, or restarted." >&2
  exit 1
fi

wait_for_active() {
  local deadline now state
  deadline=$(($(date +%s) + CONNECT_TIMEOUT_SECONDS))
  while true; do
    state="$(systemctl is-active "$service_unit" 2>/dev/null || true)"
    if [[ "$state" == "active" ]]; then
      echo "RUNNER_DAEMON_STATE=active"
      echo "RUNNER_CONNECT_WINDOW=PASS"
      return 0
    fi
    now=$(date +%s)
    if (( now >= deadline )); then
      echo "RUNNER_CONNECT_WINDOW=TIMEOUT"
      systemctl --no-pager --full status "$service_unit" --lines=40 || true
      journalctl -u "$service_unit" --no-pager -n 80 || true
      return 1
    fi
    sleep 5
  done
}

status_cmd() {
  echo "RUNNER_NAME=$RUNNER_NAME"
  echo "RUNNER_SERVICE=$service_unit"
  echo "RUNNER_DIR=$RUNNER_DIR"
  systemctl --no-pager --full status "$service_unit" --lines=30 || true
  if [[ -f "$RUNNER_DIR/.runner" ]]; then
    echo "LOCAL_RUNNER_REGISTRATION=present"
  else
    echo "LOCAL_RUNNER_REGISTRATION=absent"
  fi
  echo "NOTE=daemon status is not proof of GitHub job assignment or G02 acceptance"
}

require_mutation_confirmation() {
  local supplied_flag="${2:-}"
  if [[ "$supplied_flag" != "--confirm-host-mutation" || "${G02_CONFIRM_HOST_MUTATION:-}" != "YES" ]]; then
    echo "BLOCKED: host mutation requires --confirm-host-mutation and G02_CONFIRM_HOST_MUTATION=YES." >&2
    exit 3
  fi
  if [[ "$(id -u)" -ne 0 ]]; then
    echo "Run the confirmed host operation as root (or through sudo)." >&2
    exit 2
  fi
}

case "${1:-status}" in
  status)
    if [[ $# -gt 1 ]]; then
      echo "Usage: $0 [status|start|stop|restart|reconnect] [--confirm-host-mutation]" >&2
      exit 2
    fi
    status_cmd
    ;;
  start)
    require_mutation_confirmation "$@"
    systemctl start "$service_unit"
    wait_for_active
    ;;
  stop)
    require_mutation_confirmation "$@"
    systemctl stop "$service_unit"
    echo "RUNNER_STOP_REQUESTED=TRUE"
    ;;
  restart|reconnect)
    require_mutation_confirmation "$@"
    systemctl restart "$service_unit"
    wait_for_active
    echo "NOTE=service active does not prove GitHub has assigned a job"
    ;;
  reset|reboot|enable)
    echo "BLOCKED: '$1' is intentionally unsupported by this controller." >&2
    echo "Use a separately reviewed, host-specific procedure after inventory and evidence review." >&2
    exit 3
    ;;
  *)
    echo "Usage: $0 [status|start|stop|restart|reconnect] [--confirm-host-mutation]" >&2
    exit 2
    ;;
esac
