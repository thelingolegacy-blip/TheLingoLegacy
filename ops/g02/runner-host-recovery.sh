#!/usr/bin/env bash
set -Eeuo pipefail

# G02 runner host recovery helper.
# Default mode is read-only. Restart is opt-in and requires an exact service name.
# Never prints runner .credentials files, registration tokens, or environment secrets.

usage() {
  cat <<'USAGE'
Usage:
  bash ops/g02/runner-host-recovery.sh
  sudo bash ops/g02/runner-host-recovery.sh --restart <exact-systemd-service-name>

Default mode reports runner process/service and connectivity diagnostics only.
Restart mode restarts only the exact supplied systemd service after validating that
its name resembles a GitHub Actions runner service. Run on the runner host itself.
USAGE
}

mode="diagnose"
service_name=""
if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then usage; exit 0; fi
if [[ "${1:-}" == "--restart" ]]; then
  mode="restart"
  service_name="${2:-}"
  if [[ -z "$service_name" || "$service_name" == -* ]]; then
    echo "ERROR: --restart requires an exact service name from systemctl list-units." >&2
    usage >&2
    exit 2
  fi
  if [[ ! "$service_name" =~ ^actions\.runner\..+\.service$ ]]; then
    echo "ERROR: Refusing unexpected service name: $service_name" >&2
    exit 2
  fi
elif [[ $# -gt 0 ]]; then
  usage >&2
  exit 2
fi

printf '%s\n' "G02 runner host recovery" "timestamp_utc=$(date -u +%FT%TZ)" "hostname=$(hostname)" "mode=$mode"
printf '\n%s\n' '== OS / architecture =='
uname -a
printf '\n%s\n' '== Runner processes (no command-line secrets) =='
ps -eo pid,comm,args | awk '/Runner\.Listener|Runner\.Worker|runsvc\.sh/ && !/awk/ {print $1, $2, $3}'
printf '\n%s\n' '== Matching systemd units =='
systemctl list-units --type=service --all --no-legend 'actions.runner.*' 2>&1 || true
printf '\n%s\n' '== Failed systemd units =='
systemctl --failed --no-legend 2>&1 || true
printf '\n%s\n' '== GitHub connectivity (no credentials) =='
for url in https://github.com https://api.github.com; do
  if command -v curl >/dev/null 2>&1; then
    curl --silent --show-error --location --max-time 10 --output /dev/null --write-out "$url http_status=%{http_code} remote_ip=%{remote_ip}\n" "$url" || true
  else
    echo "curl unavailable; skipped $url"
  fi
done

if [[ "$mode" == "restart" ]]; then
  if [[ "$EUID" -ne 0 ]]; then
    echo "ERROR: Restart mode requires root; rerun with sudo." >&2
    exit 3
  fi
  echo
  echo "== Exact service before restart: $service_name =="
  systemctl status "$service_name" --no-pager --full || true
  echo
  echo "Restarting the explicitly named runner service: $service_name"
  systemctl restart "$service_name"
  sleep 3
  echo
  echo "== Exact service after restart =="
  systemctl status "$service_name" --no-pager --full
  echo
  echo "== Recent service logs (last 100 lines) =="
  journalctl -u "$service_name" -n 100 --no-pager
fi

printf '\n%s\n' 'NOTE: This host script cannot prove GitHub assignment. Confirm runner_id > 0, populated runner_name, instantiated steps, executed sentinel, retrievable logs, and correlated artifact from GitHub Actions.'
