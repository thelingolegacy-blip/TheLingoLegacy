#!/usr/bin/env bash
# Read-only host telemetry for G02 preflight.
# Run locally on the runner host; this script does not register, start, stop,
# restart, configure, or contact GitHub with credentials.
set +e

section() { printf '\n=== %s ===\n' "$1"; }

section "HOST"
hostname
date -u '+utc=%Y-%m-%dT%H:%M:%SZ'
uname -srm

section "DISK SPACE"
df -h /
df -i /

section "MEMORY AND SWAP"
free -h
if command -v swapon >/dev/null 2>&1; then
  swapon --show --noheadings --output=NAME,TYPE,SIZE,USED,PRIO
else
  printf 'swapon: unavailable\n'
fi

section "RUNNER PROCESSES (NO ARGUMENTS)"
# Deliberately omit process command-line arguments to reduce accidental
# disclosure of tokens or other secrets passed to unrelated processes.
ps -eo pid,ppid,stat,etime,comm \
  | grep -E '(^|[[:space:]])(Runner\.Listener|Runner\.Worker|runsvc\.sh)([[:space:]]|$)' \
  || true

section "RUNNER SERVICES"
if command -v systemctl >/dev/null 2>&1; then
  systemctl list-units --type=service --all --no-pager --no-legend \
    | grep -i runner || true
else
  printf 'systemctl: unavailable (host may not use systemd)\n'
fi

section "DNS LOOKUP (NO AUTHENTICATED REQUESTS)"
if command -v getent >/dev/null 2>&1; then
  getent hosts github.com
  getent hosts api.github.com
else
  printf 'getent: unavailable\n'
fi

section "PREFLIGHT COMPLETE"
printf 'This output is observational only; it does not prove runner registration, assignment, or job execution.\n'
