#!/usr/bin/env bash
# G02 heartbeat, network handshake, and evidence-integrity probe.
# This tool is deliberately non-destructive: it never restarts, resets,
# re-registers, deletes, or restores the runner/service.
set -uo pipefail
umask 077

usage() {
  cat <<'USAGE'
Usage:
  bash ops/github-runner/g02-heartbeat-handshake.sh capture [report-path]
  bash ops/github-runner/g02-heartbeat-handshake.sh verify <report-path> <sha256-file>
  bash ops/github-runner/g02-heartbeat-handshake.sh reset-plan
  bash ops/github-runner/g02-heartbeat-handshake.sh restore-plan

capture      Writes a timestamped heartbeat/evidence report and SHA-256 sidecar.
verify       Recomputes the report hash and validates the sidecar.
reset-plan   Prints a gated reset plan only; does not reset anything.
restore-plan Prints a gated restore plan only; does not restore anything.
USAGE
}

mode="${1:-}"
case "$mode" in
  capture)
    out="${2:-g02-heartbeat-$(date -u +%Y%m%dT%H%M%SZ).txt}"
    hash_file="${out}.sha256"
    tmp="${out}.tmp.$$"
    trap 'rm -f -- "$tmp"' EXIT
    {
      printf 'G02_HEARTBEAT_SCHEMA=1\n'
      printf 'CAPTURED_AT_UTC=%s\n' "$(date -u +%FT%TZ)"
      printf 'HOSTNAME=%s\n' "$(hostname 2>/dev/null || printf unavailable)"
      printf 'OS=%s\n' "$(uname -s 2>/dev/null || printf unavailable)"
      printf 'ARCH=%s\n' "$(uname -m 2>/dev/null || printf unavailable)"
      printf 'HEARTBEAT_SIGNAL=GENERATED\n'
      printf 'HEARTBEAT_PID=%s\n' "$$"
      printf 'RUNNER_LISTENER_PROCESS='
      if pgrep -f '[R]unner.Listener' >/dev/null 2>&1; then printf 'PRESENT\n'; else printf 'ABSENT_OR_UNOBSERVABLE\n'; fi
      printf 'RUNNER_SERVICE_STATE='
      if command -v systemctl >/dev/null 2>&1; then
        systemctl list-units --type=service --all --no-legend 2>/dev/null |
          awk 'tolower($0) ~ /actions\.runner|github\.runner/ {print $3; found=1} END {if (!found) print "NOT_FOUND_OR_UNOBSERVABLE"}' |
          tr '\n' ',' | sed 's/,$//'
        printf '\n'
      else
        printf 'SYSTEMCTL_UNAVAILABLE\n'
      fi

      for host in api.github.com github.com; do
        key="$(printf '%s' "$host" | tr '[:lower:].' '[:upper:]_')"
        if command -v curl >/dev/null 2>&1; then
          result="$(curl --connect-timeout 5 --max-time 12 --silent --show-error \
            --output /dev/null --write-out '%{http_code} %{time_connect} %{time_appconnect}' \
            "https://$host/" 2>&1)"
          rc=$?
          if [ "$rc" -eq 0 ]; then
            http_code="$(printf '%s' "$result" | awk '{print $1}')"
            connect_time="$(printf '%s' "$result" | awk '{print $2}')"
            tls_time="$(printf '%s' "$result" | awk '{print $3}')"
            printf '%s_HTTP_STATUS=%s\n' "$key" "${http_code:-unknown}"
            printf '%s_CONNECT_SECONDS=%s\n' "$key" "${connect_time:-unknown}"
            printf '%s_TLS_HANDSHAKE_SECONDS=%s\n' "$key" "${tls_time:-unknown}"
            case "$http_code" in
              2*|3*) printf '%s_NETWORK_HANDSHAKE=PASS\n' "$key" ;;
              *) printf '%s_NETWORK_HANDSHAKE=FAIL_OR_HTTP_ERROR\n' "$key" ;;
            esac
          else
            printf '%s_NETWORK_HANDSHAKE=FAIL\n' "$key"
            printf '%s_CURL_EXIT_CODE=%s\n' "$key" "$rc"
            # Avoid persisting arbitrary curl stderr that could contain local details.
          fi
        else
          printf '%s_NETWORK_HANDSHAKE=UNAVAILABLE_CURL_MISSING\n' "$key"
        fi
      done

      printf 'GITHUB_RUNNER_POLLING=NOT_PROVEN_BY_GENERIC_HTTPS_PROBE\n'
      printf 'G02_ACCEPTANCE=NOT_EVALUATED\n'
      printf 'RESET_ACTION=NOT_PERFORMED\n'
      printf 'RESTORE_ACTION=NOT_PERFORMED\n'
      printf 'NOTE=Review report before sharing; never include tokens or runner credentials.\n'
    } > "$tmp"
    mv -- "$tmp" "$out" || exit 1
    sha256sum "$out" > "$hash_file" || exit 1
    chmod 600 "$out" "$hash_file" 2>/dev/null || true
    printf 'HEARTBEAT_REPORT=%s\n' "$out"
    printf 'HEARTBEAT_SHA256_FILE=%s\n' "$hash_file"
    sha256sum "$out"
    printf 'HEARTBEAT_CAPTURE_EXIT_CODE=0\n'
    ;;
  verify)
    report="${2:-}"
    hash_file="${3:-}"
    if [ -z "$report" ] || [ -z "$hash_file" ] || [ ! -s "$report" ] || [ ! -s "$hash_file" ]; then
      echo 'HASH_VERIFICATION=FAIL_INPUT_MISSING'
      usage >&2
      exit 2
    fi
    computed="$(sha256sum "$report" | awk '{print $1}')"
    expected="$(awk 'NR==1 {print $1}' "$hash_file")"
    if [[ "$expected" =~ ^[[:xdigit:]]{64}$ ]] && [ "$computed" = "$expected" ]; then
      echo 'HASH_VERIFICATION=PASS'
      echo "SHA256=$computed"
    else
      echo 'HASH_VERIFICATION=FAIL_MISMATCH'
      echo "EXPECTED_SHA256=$expected"
      echo "COMPUTED_SHA256=$computed"
      exit 1
    fi
    ;;
  reset-plan)
    cat <<'PLAN'
RESET_PLAN=BLOCKED_PENDING_EVIDENCE
1. Preserve current runner configuration and _diag metadata.
2. Collect heartbeat report, checksum, runner service state, and GitHub runner inventory.
3. Correlate runner ID/name/labels with the queued job and runner service logs.
4. Obtain independent review and explicit operator authorization.
5. Only then decide whether a controlled service restart is justified.
RESET_ACTION=NOT_PERFORMED
PLAN
    ;;
  restore-plan)
    cat <<'PLAN'
RESTORE_PLAN=BLOCKED_PENDING_EVIDENCE
1. Identify the last-known-good runner configuration and its provenance.
2. Verify hashes and compare current configuration before any change.
3. Confirm runner registration scope, labels, and service unit.
4. Prepare a reversible restore plan and capture pre-change evidence.
5. Require independent review and explicit operator authorization before restoring.
RESTORE_ACTION=NOT_PERFORMED
PLAN
    ;;
  *)
    usage >&2
    exit 2
    ;;
esac
