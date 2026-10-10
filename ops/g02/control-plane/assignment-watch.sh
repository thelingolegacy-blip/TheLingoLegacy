#!/usr/bin/env bash
set -euo pipefail
umask 077

STATE_DIR="${LINGO_G02_STATE_DIR:-/var/lib/lingo-g02}"
mkdir -p "$STATE_DIR"
timestamp="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
report="$STATE_DIR/assignment-watch-${timestamp//:/-}.log"
tmp="$(mktemp "$STATE_DIR/.assignment-watch.XXXXXX")"
trap 'rm -f "$tmp"' EXIT

{
  printf 'schema=lingo.g02.assignment-watch.v1\n'
  printf 'observed_at_utc=%s\n' "$timestamp"
  printf 'host=%s\n' "$(hostname)"
  printf 'kernel=%s\n' "$(uname -s)"
  printf 'architecture=%s\n' "$(uname -m)"

  if [[ "$(uname -s)" != Linux || "$(uname -m)" != x86_64 ]]; then
    printf 'watch_result=BLOCKED_HOST_PLATFORM_MISMATCH\n'
    exit 20
  fi

  if pgrep -af 'Runner.Listener|runsvc\.sh' > "$tmp"; then
    printf 'runner_process_observed=true\n'
    # Do not dump command lines; they can contain sensitive arguments.
    printf 'runner_process_count=%s\n' "$(wc -l < "$tmp" | tr -d ' ')"
  else
    printf 'runner_process_observed=false\n'
  fi

  if command -v systemctl >/dev/null 2>&1; then
    printf 'systemd_available=true\n'
    for unit in actions.runner.*.service lingo-g02-assignment-watch.timer; do
      if systemctl list-units --all --no-legend "$unit" 2>/dev/null | grep -q .; then
        printf 'unit_present=%s\n' "$unit"
      fi
    done
  else
    printf 'systemd_available=false\n'
  fi

  printf 'watch_result=OBSERVATION_ONLY\n'
} > "$report"

chmod 0600 "$report"
printf 'report_path=%s\n' "$report"
