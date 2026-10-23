#!/usr/bin/env bash
# Read-only diagnostic adapter for an authorized Linux runner host.
# Does not restart services, alter registrations, read credentials, or mutate infrastructure.
set -uo pipefail

timestamp="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "RECOVERY_DIAGNOSTIC_VERSION=1"
echo "timestamp_utc=$timestamp"
echo "hostname=$(hostname 2>/dev/null || echo unavailable)"
echo "kernel=$(uname -srmo 2>/dev/null || echo unavailable)"
echo "architecture=$(uname -m 2>/dev/null || echo unavailable)"
echo "uid=$(id -u 2>/dev/null || echo unavailable)"
echo "runner_name_env=${RUNNER_NAME:-unset}"
echo "runner_os_env=${RUNNER_OS:-unset}"
echo "runner_arch_env=${RUNNER_ARCH:-unset}"

if command -v timedatectl >/dev/null 2>&1; then
  ntp="$(timedatectl show -p NTPSynchronized --value 2>/dev/null || true)"
  echo "ntp_synchronized=${ntp:-unknown}"
else
  echo "ntp_synchronized=unknown"
fi

if command -v systemctl >/dev/null 2>&1; then
  echo "runner_service_units_begin"
  systemctl list-units --type=service --all --no-legend 2>/dev/null |
    awk '$1 ~ /^actions\.runner\./ { print $1, $3, $4 }' || true
  echo "runner_service_units_end"
else
  echo "systemd_available=false"
fi

if command -v pgrep >/dev/null 2>&1; then
  pids="$(pgrep -f 'Runner.Listener' 2>/dev/null | tr '\n' ',' | sed 's/,$//' || true)"
  echo "runner_listener_pids=${pids:-none}"
else
  echo "runner_listener_pids=unknown"
fi

if command -v getent >/dev/null 2>&1; then
  if getent ahosts github.com >/dev/null 2>&1; then
    echo "dns_github_com=PASS"
  else
    echo "dns_github_com=FAIL"
  fi
  if getent ahosts api.github.com >/dev/null 2>&1; then
    echo "dns_api_github_com=PASS"
  else
    echo "dns_api_github_com=FAIL"
  fi
else
  echo "dns_resolution=unknown"
fi

if command -v curl >/dev/null 2>&1; then
  for url in https://github.com/ https://api.github.com/; do
    host="${url#https://}"
    host="${host%%/*}"
    result="$(curl --silent --show-error --location --max-time 10 --output /dev/null --write-out '%{http_code}' "$url" 2>/dev/null || true)"
    if [[ "$result" =~ ^[0-9]{3}$ ]]; then
      echo "https_${host}_status=$result"
    else
      echo "https_${host}_status=FAIL"
    fi
  done
else
  echo "https_probe=unknown"
fi

echo "DIAGNOSTIC_ONLY=true"
echo "MUTATIONS_PERFORMED=0"
