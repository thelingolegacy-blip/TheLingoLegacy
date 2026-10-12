#!/usr/bin/env bash
# Read-only clock/time-sync diagnostic for the authorized G02 host.
# Does not set time, restart services, or change NTP configuration.
set -uo pipefail
utc_now() { date -u '+%Y-%m-%dT%H:%M:%SZ'; }
echo "clock_check_started_utc=$(utc_now)"
echo "hostname=$(hostname 2>/dev/null || echo unavailable)"
echo "timezone_env=${TZ:-unset}"
echo "epoch_seconds=$(date +%s 2>/dev/null || echo unavailable)"
echo "utc_display=$(date -u '+%Y-%m-%d %H:%M:%S UTC' 2>/dev/null || echo unavailable)"
overall="UNVERIFIED"
if command -v timedatectl >/dev/null 2>&1; then
  echo "--- timedatectl status (read-only) ---"
  timedatectl status 2>&1 || true
  sync_state="$(timedatectl show -p NTPSynchronized --value 2>/dev/null || true)"
  echo "ntp_synchronized=${sync_state:-unknown}"
  if [[ "$sync_state" == "yes" ]]; then overall="PASS"; elif [[ "$sync_state" == "no" ]]; then overall="FAIL"; fi
else
  echo "timedatectl=unavailable"
fi
if command -v chronyc >/dev/null 2>&1; then
  echo "--- chrony tracking (read-only) ---"
  chronyc tracking 2>&1 || true
elif command -v ntpq >/dev/null 2>&1; then
  echo "--- ntpq peers (read-only) ---"
  ntpq -pn 2>&1 || true
else
  echo "chrony_or_ntpq=unavailable"
fi
echo "clock_sync_assessment=$overall"
echo "clock_check_finished_utc=$(utc_now)"
if [[ "$overall" != "PASS" ]]; then
  echo "NOTE: clock sync is not confirmed; inspect host policy/NTP service. This script intentionally makes no configuration changes."
fi
exit 0
