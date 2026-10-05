#!/usr/bin/env bash
set -euo pipefail

# G02 runner recovery controller.
# This controls only the host-side Actions Runner daemon/registration.
# It never declares G02 acceptance; acceptance still requires live job evidence.
#
# Commands:
#   status      show service/runner state
#   start       enable and start the runner
#   stop        stop the runner
#   restart     restart the runner
#   reconnect   restart and wait up to 5 minutes for the daemon to become active
#   reset       remove local runner registration, re-register, then reconnect
#   reboot      reboot the host (explicit operator action)
#
# Required for reset:
#   RUNNER_TOKEN=<short-lived registration token>
#
# Optional:
#   RUNNER_DIR=/opt/actions-runner
#   RUNNER_NAME=lingo-legacy-g02
#   RUNNER_LABELS=self-hosted,linux,x64,lingo-g02
#   REPO_URL=https://github.com/thelingolegacy-blip/TheLingoLegacy
#   CONNECT_TIMEOUT_SECONDS=300

REPO_URL="${REPO_URL:-https://github.com/thelingolegacy-blip/TheLingoLegacy}"
RUNNER_NAME="${RUNNER_NAME:-lingo-legacy-g02}"
RUNNER_LABELS="${RUNNER_LABELS:-self-hosted,linux,x64,lingo-g02}"
RUNNER_DIR="${RUNNER_DIR:-/opt/actions-runner}"
CONNECT_TIMEOUT_SECONDS="${CONNECT_TIMEOUT_SECONDS:-300}"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run as root (or through sudo)." >&2
  exit 2
fi

command -v systemctl >/dev/null || { echo "systemctl is required" >&2; exit 2; }

service_unit="$(systemctl list-unit-files 'actions.runner.*.service' --no-legend |
  awk -v name="$RUNNER_NAME" 'index($1, name) {print $1; exit}')"

if [[ -z "$service_unit" ]]; then
  echo "No Actions Runner service matching RUNNER_NAME=$RUNNER_NAME." >&2
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
      systemctl --no-pager --full status "$service_unit" --lines=50 || true
      journalctl -u "$service_unit" --no-pager -n 100 || true
      return 1
    fi
    sleep 5
  done
}

status_cmd() {
  echo "RUNNER_NAME=$RUNNER_NAME"
  echo "RUNNER_SERVICE=$service_unit"
  echo "RUNNER_DIR=$RUNNER_DIR"
  echo "RUNNER_LABELS=$RUNNER_LABELS"
  systemctl --no-pager --full status "$service_unit" --lines=40 || true
  if [[ -f "$RUNNER_DIR/.runner" ]]; then
    echo "RUNNER_REGISTRATION=present"
  else
    echo "RUNNER_REGISTRATION=absent"
  fi
}

restart_cmd() {
  systemctl enable "$service_unit"
  systemctl restart "$service_unit"
  wait_for_active
}

reconnect_cmd() {
  systemctl enable "$service_unit"
  systemctl restart "$service_unit"
  wait_for_active
  echo "RUNNER_RECONNECT=PASS"
  echo "Expected next state: GitHub job assignment must be observed independently."
}

reset_cmd() {
  : "${RUNNER_TOKEN:?RUNNER_TOKEN must be supplied for reset}"
  if [[ -f "$RUNNER_DIR/.runner" ]]; then
    runuser -u actions-runner -- "$RUNNER_DIR/config.sh" remove --token "$RUNNER_TOKEN" || true
  fi
  runuser -u actions-runner -- env RUNNER_ALLOW_RUNASROOT=0     "$RUNNER_DIR/config.sh"     --unattended     --url "$REPO_URL"     --token "$RUNNER_TOKEN"     --name "$RUNNER_NAME"     --labels "$RUNNER_LABELS"     --work "_work"     --replace
  systemctl enable "$service_unit"
  systemctl restart "$service_unit"
  wait_for_active
  echo "RUNNER_RESET_RECONNECT=PASS"
  echo "G02 acceptance remains unestablished until a real job is assigned and independently verified."
}

case "${1:-status}" in
  status) status_cmd ;;
  start) systemctl enable "$service_unit"; systemctl start "$service_unit"; wait_for_active ;;
  stop) systemctl stop "$service_unit" ;;
  restart) restart_cmd ;;
  reconnect) reconnect_cmd ;;
  reset) reset_cmd ;;
  reboot)
    echo "REBOOT_REQUESTED=TRUE"
    echo "Rebooting host now; runner will reconnect only if its service is enabled."
    systemctl enable "$service_unit"
    systemctl reboot
    ;;
  *)
    echo "Usage: $0 {status|start|stop|restart|reconnect|reset|reboot}" >&2
    exit 2
    ;;
esac
