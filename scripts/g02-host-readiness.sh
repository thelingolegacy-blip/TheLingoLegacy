#!/usr/bin/env bash
# G02 host-side precheck. Read-only: does not restart services, alter firewall,
# register runners, or contact GitHub APIs with credentials.
set -u
umask 077

out="${1:-g02-host-readiness.txt}"
tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT
overall=PASS
{
  printf 'schema=lingo-g02-host-precheck-v1\n'
  printf 'captured_utc=%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  printf 'hostname=%s\n' "$(hostname 2>/dev/null || printf unknown)"
  printf 'kernel=%s\n' "$(uname -srm 2>/dev/null || printf unknown)"

  running_services="$(systemctl list-units --type=service --state=running --no-legend 'actions.runner*' 2>/dev/null || true)"
  if [ -n "$running_services" ]; then
    printf 'runner_service_state=RUNNING\n'
    printf 'runner_services=%s\n' "$(printf '%s' "$running_services" | tr '\n' ';' | sed 's/;*$//')"
  else
    printf 'runner_service_state=NOT_CONFIRMED_RUNNING\n'
    overall=FAIL
  fi

  if pgrep -af 'Runner.Listener|Runner.Worker' >/dev/null 2>&1; then
    printf 'runner_process_state=FOUND\n'
    # Deliberately record process names only; never dump full command lines.
    pgrep -af 'Runner.Listener|Runner.Worker' 2>/dev/null | sed -E 's/^[0-9]+[[:space:]]+//' | sed -E 's/ .*//' | sort -u | while IFS= read -r proc; do
      printf 'runner_process=%s\n' "$proc"
    done
  else
    printf 'runner_process_state=NOT_FOUND\n'
    overall=FAIL
  fi

  for host in github.com api.github.com; do
    if getent ahosts "$host" >/dev/null 2>&1; then
      printf 'dns_%s=PASS\n' "$host"
    else
      printf 'dns_%s=FAIL\n' "$host"
      overall=FAIL
    fi
  done

  for host in github.com api.github.com; do
    result="$(curl -sS -o /dev/null --connect-timeout 8 --max-time 15 -w '%{http_code}' "https://$host" 2>/dev/null)"
    rc=$?
    if [ "$rc" -eq 0 ] && [ -n "$result" ] && [ "$result" != "000" ]; then
      printf 'https_%s=PASS\n' "$host"
      printf 'https_%s_status=%s\n' "$host" "$result"
    else
      printf 'https_%s=FAIL\n' "$host"
      printf 'https_%s_status=%s\n' "$host" "${result:-000}"
      overall=FAIL
    fi
  done

  printf 'host_precheck=%s\n' "$overall"
  printf 'scope=HOST_DIAGNOSTICS_ONLY_NOT_GITHUB_ASSIGNMENT_PROOF\n'
} > "$tmp"

cat "$tmp"
cp "$tmp" "$out"
sha256sum "$out" | awk '{print "report_sha256=" $1}'
