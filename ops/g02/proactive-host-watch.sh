#!/usr/bin/env bash
# LINGO G02 proactive host watch — read-only diagnostics only.
# Never restarts services, changes runner registration, reads environment secrets, or deploys.
set -uo pipefail
umask 077

OUT_DIR="${1:-./g02-watch-evidence}"
EXPECTED_UNIT="actions.runner.lingo-legacy-g02.service"
RUNNER_ROOT="${RUNNER_ROOT:-}"
mkdir -p "$OUT_DIR" || exit 2
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="$OUT_DIR/g02-watch-$STAMP.txt"
WARNINGS=0
CRITICALS=0

warn() { WARNINGS=$((WARNINGS + 1)); printf 'WARN: %s\n' "$*"; }
critical() { CRITICALS=$((CRITICALS + 1)); printf 'CRITICAL: %s\n' "$*"; }
section() { printf '\n## %s\n' "$1"; }

{
  printf 'LINGO G02 PROACTIVE WATCH\n'
  printf 'schema=lingo-g02-proactive-watch-v1\n'
  printf 'captured_utc=%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  printf 'hostname=%s\n' "$(hostname 2>/dev/null || printf unavailable)"
  printf 'kernel=%s\n' "$(uname -srmo 2>/dev/null || printf unavailable)"
  printf 'expected_runner_unit=%s\n' "$EXPECTED_UNIT"
  printf 'mode=READ_ONLY_NO_RESTART_NO_REGISTRATION_CHANGES\n'

  section "Runner service discovery"
  UNITS="$(systemctl list-units 'actions.runner*' --all --no-legend --no-pager 2>/dev/null || true)"
  if [[ -n "$UNITS" ]]; then
    printf '%s\n' "$UNITS" | awk '{print "unit="$1, "load="$2, "active="$3, "sub="$4}'
  else
    printf 'runner_units=NONE_OR_SYSTEMD_UNAVAILABLE\n'
  fi

  UNIT="$EXPECTED_UNIT"
  INITIAL_LOAD_STATE="$(systemctl show "$UNIT" --property=LoadState --value 2>/dev/null || printf unknown)"
  if [[ -z "$INITIAL_LOAD_STATE" || "$INITIAL_LOAD_STATE" == "not-found" || "$INITIAL_LOAD_STATE" == "unknown" ]]; then
    DISCOVERED="$(printf '%s\n' "$UNITS" | awk '$1 ~ /^actions\.runner.*\.service$/ {print $1; exit}')"
    if [[ -n "$DISCOVERED" ]]; then UNIT="$DISCOVERED"; fi
  fi
  LOAD_STATE="$(systemctl show "$UNIT" --property=LoadState --value 2>/dev/null || printf unknown)"
  ACTIVE_STATE="$(systemctl is-active "$UNIT" 2>/dev/null || true)"
  SUB_STATE="$(systemctl show "$UNIT" --property=SubState --value 2>/dev/null || printf unknown)"
  printf 'selected_unit=%s\nunit_load_state=%s\nunit_active_state=%s\nunit_sub_state=%s\n' "$UNIT" "$LOAD_STATE" "${ACTIVE_STATE:-unknown}" "$SUB_STATE"
  if [[ "$LOAD_STATE" == "not-found" || -z "$LOAD_STATE" ]]; then
    critical "No discoverable systemd unit for the canonical runner; confirm installation/service name."
  elif [[ "$ACTIVE_STATE" != "active" ]]; then
    critical "Runner service is not active (state=${ACTIVE_STATE:-unknown}); preserve logs before any repair."
  fi

  section "Runner process signals"
  LISTENER_COUNT="$(pgrep -x Runner.Listener 2>/dev/null | wc -l | tr -d ' ' || true)"
  WORKER_COUNT="$(pgrep -x Runner.Worker 2>/dev/null | wc -l | tr -d ' ' || true)"
  printf 'runner_listener_processes=%s\nrunner_worker_processes=%s\n' "${LISTENER_COUNT:-0}" "${WORKER_COUNT:-0}"
  if [[ "${LISTENER_COUNT:-0}" -eq 0 ]]; then
    critical "Runner.Listener process not found; service may be stopped or failing to launch."
  fi

  section "Resource pressure"
  CPU_COUNT="$(getconf _NPROCESSORS_ONLN 2>/dev/null || printf 1)"
  LOAD1="$(awk '{print $1}' /proc/loadavg 2>/dev/null || printf 0)"
  printf 'cpu_count=%s\nload_1m=%s\n' "$CPU_COUNT" "$LOAD1"
  LOAD_RATIO="$(awk -v l="$LOAD1" -v c="$CPU_COUNT" 'BEGIN {if(c>0) printf "%.2f", l/c; else print "0"}')"
  printf 'load_per_cpu=%s\n' "$LOAD_RATIO"
  if awk -v x="$LOAD_RATIO" 'BEGIN {exit !(x>=2.0)}'; then critical "1-minute load is at least 2x online CPU count."
  elif awk -v x="$LOAD_RATIO" 'BEGIN {exit !(x>=1.0)}'; then warn "1-minute load is at least online CPU count."
  fi

  MEM_TOTAL="$(awk '/MemTotal:/ {print $2}' /proc/meminfo 2>/dev/null || printf 0)"
  MEM_AVAIL="$(awk '/MemAvailable:/ {print $2}' /proc/meminfo 2>/dev/null || printf 0)"
  if [[ "$MEM_TOTAL" -gt 0 ]]; then
    MEM_USED_PCT="$(awk -v t="$MEM_TOTAL" -v a="$MEM_AVAIL" 'BEGIN {printf "%.1f", 100*(t-a)/t}')"
    printf 'memory_used_percent=%s\n' "$MEM_USED_PCT"
    if awk -v x="$MEM_USED_PCT" 'BEGIN {exit !(x>=95)}'; then critical "Memory utilization is at least 95%."
    elif awk -v x="$MEM_USED_PCT" 'BEGIN {exit !(x>=90)}'; then warn "Memory utilization is at least 90%."
    fi
  else
    warn "Memory utilization could not be calculated from /proc/meminfo."
  fi

  section "Disk and inode pressure"
  df -P -x tmpfs -x devtmpfs 2>/dev/null | awk 'NR==1 {print "disk_header="$0; next} {gsub(/%/,"",$5); print "disk_mount="$6, "used_percent="$5; if ($5+0 >= 95) print "DISK_CRITICAL="$6; else if ($5+0 >= 90) print "DISK_WARN="$6}' | while IFS= read -r line; do
    printf '%s\n' "$line"
  done
  DISK_CRIT="$(df -P -x tmpfs -x devtmpfs 2>/dev/null | awk 'NR>1 {gsub(/%/,"",$5); if($5+0>=95) n++} END{print n+0}')"
  DISK_WARN="$(df -P -x tmpfs -x devtmpfs 2>/dev/null | awk 'NR>1 {gsub(/%/,"",$5); if($5+0>=90 && $5+0<95) n++} END{print n+0}')"
  INODE_CRIT="$(df -Pi -x tmpfs -x devtmpfs 2>/dev/null | awk 'NR>1 {gsub(/%/,"",$5); if($5+0>=95) n++} END{print n+0}')"
  INODE_WARN="$(df -Pi -x tmpfs -x devtmpfs 2>/dev/null | awk 'NR>1 {gsub(/%/,"",$5); if($5+0>=90 && $5+0<95) n++} END{print n+0}')"
  printf 'disk_mounts_critical=%s\ndisk_mounts_warning=%s\ninode_mounts_critical=%s\ninode_mounts_warning=%s\n' "$DISK_CRIT" "$DISK_WARN" "$INODE_CRIT" "$INODE_WARN"
  if [[ "$DISK_CRIT" -gt 0 || "$INODE_CRIT" -gt 0 ]]; then critical "At least one filesystem or inode pool is at least 95% utilized."
  elif [[ "$DISK_WARN" -gt 0 || "$INODE_WARN" -gt 0 ]]; then warn "At least one filesystem or inode pool is at least 90% utilized."
  fi

  section "GitHub network reachability"
  for host in github.com api.github.com objects.githubusercontent.com; do
    if getent ahosts "$host" >/dev/null 2>&1; then
      printf 'dns_%s=PASS\n' "$host"
    else
      printf 'dns_%s=FAIL\n' "$host"
      critical "DNS lookup failed for $host."
    fi
  done
  for url in https://github.com/ https://api.github.com/; do
    if command -v curl >/dev/null 2>&1; then
      RESULT="$(curl -sS -L -o /dev/null --connect-timeout 5 --max-time 12 -w 'http=%{http_code} tls_verify=%{ssl_verify_result}' "$url" 2>&1)"
      RC=$?
      printf 'https_target=%s result=%s curl_exit=%s\n' "$url" "$RESULT" "$RC"
      if [[ "$RC" -ne 0 ]] || ! printf '%s' "$RESULT" | grep -Eq 'http=[1-5][0-9][0-9] tls_verify=0'; then
        critical "HTTPS/TLS check failed for $url."
      fi
    else
      warn "curl is unavailable; HTTPS/TLS reachability was not tested."
      break
    fi
  done

  section "Runner diagnostic log metadata"
  if [[ -n "$RUNNER_ROOT" && -d "$RUNNER_ROOT/_diag" ]]; then
    DIAG_DIR="$RUNNER_ROOT/_diag"
  else
    DIAG_DIR=""
  fi
  if [[ -n "$DIAG_DIR" ]]; then
    LATEST_DIAG="$(find "$DIAG_DIR" -maxdepth 1 -type f -name 'Runner_*' -printf '%T@ %p\n' 2>/dev/null | sort -nr | head -n 1 | cut -d' ' -f2-)"
    if [[ -n "$LATEST_DIAG" ]]; then
      printf 'runner_diag_latest_file=%s\n' "$(basename "$LATEST_DIAG")"
      printf 'runner_diag_latest_mtime=%s\n' "$(date -u -r "$LATEST_DIAG" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || printf unavailable)"
      printf 'runner_diag_error_keyword_count=%s\n' "$(grep -Eic 'error|fatal|exception|failed|unauthorized|forbidden|timeout|TLS' "$LATEST_DIAG" 2>/dev/null || printf unavailable)"
      printf 'runner_diag_raw_contents=NOT_EMITTED\n'
    else
      warn "Runner _diag directory exists but no Runner_* log was found."
    fi
  else
    printf 'runner_diag=UNCONFIGURED_OR_UNREADABLE\n'
  fi

  section "Recent service journal signal counts"
  if command -v journalctl >/dev/null 2>&1 && [[ "$LOAD_STATE" != "not-found" ]]; then
    JOURNAL="$(journalctl -u "$UNIT" -n 300 --no-pager 2>/dev/null || true)"
    printf 'journal_lines_sampled=%s\n' "$(printf '%s\n' "$JOURNAL" | wc -l | tr -d ' ')"
    printf 'journal_error_keyword_count=%s\n' "$(printf '%s\n' "$JOURNAL" | grep -Eic 'error|fatal|exception|failed|unauthorized|forbidden|timeout|TLS' || true)"
    printf 'journal_raw_contents=NOT_EMITTED\n'
  else
    printf 'journal_signal=UNAVAILABLE\n'
  fi

  section "Disposition"
  if [[ "$CRITICALS" -gt 0 ]]; then
    printf 'severity=CRITICAL\n'
    printf 'trigger=PAGE_OPERATOR_AND_PRESERVE_EVIDENCE\n'
  elif [[ "$WARNINGS" -gt 0 ]]; then
    printf 'severity=WARNING\n'
    printf 'trigger=INVESTIGATE_WITHIN_1_BUSINESS_HOUR\n'
  else
    printf 'severity=OBSERVATION_ONLY\n'
    printf 'trigger=CONTINUE_SCHEDULED_MONITORING\n'
  fi
  printf 'critical_count=%s\nwarning_count=%s\n' "$CRITICALS" "$WARNINGS"
  printf 'production_change=NONE\ng02_acceptance=NOT_EVALUATED\n'
} > "$OUT" 2>&1

chmod 600 "$OUT"
(cd "$OUT_DIR" && sha256sum "$(basename "$OUT")" > "$(basename "$OUT").sha256")
chmod 600 "$OUT_DIR/$(basename "$OUT").sha256"
printf 'Evidence report: %s\n' "$OUT"
printf 'Checksum: %s.sha256\n' "$OUT"
printf 'Review and redact host-specific details before sharing. Raw runner logs and environment variables were not emitted.\n'

if grep -q '^severity=CRITICAL$' "$OUT"; then exit 2; fi
if grep -q '^severity=WARNING$' "$OUT"; then exit 1; fi
exit 0
