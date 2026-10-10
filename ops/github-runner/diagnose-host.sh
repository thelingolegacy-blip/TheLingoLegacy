#!/usr/bin/env bash
# Read-only host preflight for LINGO Legacy G02.
# Does not change DNS, restart services, register runners, or mutate production.
set -uo pipefail
umask 077

usage() {
  echo "Usage: bash ops/github-runner/diagnose-host.sh [report-path]" >&2
}

out="${1:-g02-host-preflight-$(date -u +%Y%m%dT%H%M%SZ).txt}"
if [[ "$out" == "-" ]]; then
  echo "Refusing stdout report: a hash sidecar and reviewable file are required." >&2
  usage
  exit 2
fi
if [[ -e "$out" || -e "${out}.sha256" ]]; then
  echo "Refusing to overwrite an existing report or checksum." >&2
  exit 3
fi

tmp="${out}.tmp.$$"
trap 'rm -f -- "$tmp"' EXIT
mkdir -p -- "$(dirname -- "$out")" || exit 1

emit_resolution() {
  local host="$1" key="$2" count=0 rc=0 addresses=""
  if ! command -v getent >/dev/null 2>&1; then
    printf '%s_DNS=UNAVAILABLE_GETENT_MISSING\n' "$key"
    return
  fi
  if command -v timeout >/dev/null 2>&1; then
    addresses="$(timeout 8s getent ahosts "$host" 2>/dev/null)"
    rc=$?
  else
    addresses="$(getent ahosts "$host" 2>/dev/null)"
    rc=$?
  fi
  if [[ "$rc" -eq 0 ]]; then
    count="$(printf '%s\n' "$addresses" | awk 'NF && !seen[$1]++ {n++} END {print n+0}')"
    printf '%s_DNS=PASS\n' "$key"
    printf '%s_DNS_ADDRESS_COUNT=%s\n' "$key" "$count"
  else
    printf '%s_DNS=FAIL\n' "$key"
    printf '%s_DNS_EXIT_CODE=%s\n' "$key" "$rc"
  fi
}

emit_https() {
  local host="$1" key="$2" result rc
  if ! command -v curl >/dev/null 2>&1; then
    printf '%s_HTTPS=UNAVAILABLE_CURL_MISSING\n' "$key"
    return
  fi
  result="$(curl --connect-timeout 5 --max-time 12 --silent --show-error \
    --output /dev/null --write-out '%{http_code} %{time_connect} %{time_appconnect}' \
    "https://$host/" 2>/dev/null)"
  rc=$?
  if [[ "$rc" -eq 0 ]]; then
    printf '%s_HTTPS=PASS\n' "$key"
    printf '%s_HTTP_STATUS=%s\n' "$key" "$(printf '%s' "$result" | awk '{print $1}')"
    printf '%s_CONNECT_SECONDS=%s\n' "$key" "$(printf '%s' "$result" | awk '{print $2}')"
    printf '%s_TLS_SECONDS=%s\n' "$key" "$(printf '%s' "$result" | awk '{print $3}')"
  else
    printf '%s_HTTPS=FAIL\n' "$key"
    printf '%s_CURL_EXIT_CODE=%s\n' "$key" "$rc"
  fi
}

{
  printf 'G02_HOST_PREFLIGHT_SCHEMA=1\n'
  printf 'CAPTURED_AT_UTC=%s\n' "$(date -u +%FT%TZ)"
  printf 'HOSTNAME=%s\n' "$(hostname 2>/dev/null || echo unavailable)"
  printf 'OS=%s\n' "$(uname -s 2>/dev/null || echo unavailable)"
  printf 'ARCH=%s\n' "$(uname -m 2>/dev/null || echo unavailable)"
  if git rev-parse --show-toplevel >/dev/null 2>&1; then
    printf 'REPOSITORY_ROOT=%s\n' "$(git rev-parse --show-toplevel)"
    printf 'SOURCE_SHA=%s\n' "$(git rev-parse HEAD)"
    printf 'GIT_WORKTREE_STATE=%s\n' "$(if [[ -z "$(git status --porcelain 2>/dev/null)" ]]; then echo CLEAN; else echo DIRTY; fi)"
  else
    printf 'REPOSITORY_ROOT=NOT_FOUND\n'
    printf 'SOURCE_SHA=NOT_AVAILABLE\n'
    printf 'GIT_WORKTREE_STATE=NOT_AVAILABLE\n'
  fi

  emit_resolution github.com GITHUB
  emit_resolution api.github.com API_GITHUB
  emit_https api.github.com API_GITHUB
  emit_https github.com GITHUB

  printf 'RUNNER_LISTENER='
  if pgrep -x Runner.Listener >/dev/null 2>&1; then echo PRESENT; else echo ABSENT_OR_UNOBSERVABLE; fi

  printf 'RUNNER_SERVICE_UNITS_BEGIN\n'
  if command -v systemctl >/dev/null 2>&1; then
    if command -v timeout >/dev/null 2>&1; then
      timeout 8s systemctl list-units --type=service --all --no-legend 2>/dev/null |
        awk 'tolower($0) ~ /actions\.runner|github\.runner/ {print $1, $3, $4}' |
        head -n 20
    else
      systemctl list-units --type=service --all --no-legend 2>/dev/null |
        awk 'tolower($0) ~ /actions\.runner|github\.runner/ {print $1, $3, $4}' |
        head -n 20
    fi
    printf 'RUNNER_SERVICE_UNITS_END\n'
  else
    printf 'SYSTEMCTL=UNAVAILABLE\nRUNNER_SERVICE_UNITS_END\n'
  fi

  printf 'RUNNER_PROCESS_SUMMARY_BEGIN\n'
  if command -v pgrep >/dev/null 2>&1; then
    pgrep -x -a Runner.Listener 2>/dev/null | awk '{print "RUNNER_PROCESS_PID=" $1}' | head -n 10
  fi
  printf 'RUNNER_PROCESS_SUMMARY_END\n'

  if command -v docker >/dev/null 2>&1; then
    printf 'DOCKER_ENGINE=AVAILABLE\n'
    if command -v timeout >/dev/null 2>&1; then
      timeout 8s docker info >/dev/null 2>&1
    else
      docker info >/dev/null 2>&1
    fi
    docker_info_rc=$?
    if [[ "$docker_info_rc" -eq 0 ]]; then
      printf 'DOCKER_DAEMON=PASS\n'
      printf 'RUNNER_CONTAINERS_BEGIN\n'
      if command -v timeout >/dev/null 2>&1; then
        timeout 8s docker ps -a --format '{{.Names}}|{{.Status}}|{{.Image}}' 2>/dev/null |
          awk 'tolower($0) ~ /runner|github.actions/ {print}' | head -n 20
      else
        docker ps -a --format '{{.Names}}|{{.Status}}|{{.Image}}' 2>/dev/null |
          awk 'tolower($0) ~ /runner|github.actions/ {print}' | head -n 20
      fi
      printf 'RUNNER_CONTAINERS_END\n'
    else
      printf 'DOCKER_DAEMON=FAIL_OR_PERMISSION_DENIED\n'
    fi
  else
    printf 'DOCKER_ENGINE=UNAVAILABLE\n'
  fi

  printf 'DISK_ROOT='
  df -Pk / 2>/dev/null | awk 'NR==2 {printf "SIZE_KB=%s USED_KB=%s AVAILABLE_KB=%s USE_PERCENT=%s\n",$2,$3,$4,$5; found=1} END {if (!found) print "UNAVAILABLE"}'
  printf 'MEMORY='
  if command -v free >/dev/null 2>&1; then free -b 2>/dev/null | awk '/^Mem:/ {printf "TOTAL_BYTES=%s AVAILABLE_BYTES=%s\n",$2,$7; found=1} END {if (!found) print "UNAVAILABLE"}'; else echo UNAVAILABLE; fi
  printf 'GITHUB_RUNNER_POLLING=NOT_PROVEN_BY_PREFLIGHT\n'
  printf 'G02_ACCEPTANCE=NOT_EVALUATED\n'
} > "$tmp" || exit 1

mv -- "$tmp" "$out" || exit 1
sha256sum "$out" > "${out}.sha256" || exit 1
chmod 600 "$out" "${out}.sha256" 2>/dev/null || true
trap - EXIT
printf 'HOST_PREFLIGHT_REPORT=%s\n' "$out"
printf 'HOST_PREFLIGHT_SHA256_FILE=%s\n' "${out}.sha256"
sha256sum "$out"
printf 'HOST_PREFLIGHT_EXIT_CODE=0\n'
