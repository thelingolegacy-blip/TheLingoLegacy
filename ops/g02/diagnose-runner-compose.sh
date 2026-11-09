#!/usr/bin/env bash
# Read-only diagnostics for the repository's Docker Compose / ephemeral G02 runner.
# Never registers, restarts, removes, or reconfigures a runner or container.
set -uo pipefail
umask 077

SCRIPT_DIR="$(cd -- "$(dirname -- "\${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="\${REPO_ROOT:-$(cd -- "$SCRIPT_DIR/../.." && pwd)}"
COMPOSE_DIR="\${RUNNER_COMPOSE_DIR:-$REPO_ROOT/ops/github-runner}"
COMPOSE_FILE="\${RUNNER_COMPOSE_FILE:-$COMPOSE_DIR/docker-compose.yml}"
COMPOSE_SERVICE="\${RUNNER_COMPOSE_SERVICE:-github-runner}"
OUT_DIR="\${OUT_DIR:-$REPO_ROOT/g02-host-diagnostics}"
REPORT="$OUT_DIR/g02-compose-diagnostic.txt"

mkdir -p "$OUT_DIR" || exit 2
TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT

redact() {
  sed -E \
    -e 's/((token|password|passwd|secret|authorization|private[_ -]?key|client[_ -]?secret)[[:space:]"]*[:=][[:space:]"]*)[^[:space:]"]+/\1[REDACTED]/Ig' \
    -e 's/(gh[pousr]_[A-Za-z0-9_]{20,})/[REDACTED_GITHUB_TOKEN]/g' \
    -e 's/(github_pat_[A-Za-z0-9_]{20,})/[REDACTED_GITHUB_TOKEN]/g' \
    -e 's/(AKIA[0-9A-Z]{16})/[REDACTED_AWS_ACCESS_KEY]/g'
}

{
  echo "LINGO G02 DOCKER COMPOSE DIAGNOSTIC"
  echo "schema=lingo-g02-compose-diagnostic-v1"
  echo "captured_utc=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "hostname=$(hostname 2>/dev/null || echo unavailable)"
  echo "uid=$(id -u 2>/dev/null || echo unavailable)"
  echo "kernel=$(uname -srmo 2>/dev/null || echo unavailable)"
  echo "host_arch=$(uname -m 2>/dev/null || echo unavailable)"
  echo "compose_file=$COMPOSE_FILE"
  echo "compose_service=$COMPOSE_SERVICE"
  echo

  echo "## Required tools"
  for bin in bash docker curl getent sha256sum; do
    if command -v "$bin" >/dev/null 2>&1; then echo "PASS: $bin"; else echo "FAIL: $bin missing"; fi
  done

  echo
  echo "## Docker daemon"
  if command -v docker >/dev/null 2>&1; then
    docker --version 2>&1 || true
    if docker info --format 'server_version={{.ServerVersion}} os={{.OperatingSystem}} arch={{.Architecture}}' 2>&1; then
      echo "docker_daemon=ACCESSIBLE"
    else
      echo "docker_daemon=UNAVAILABLE_OR_PERMISSION_DENIED"
    fi
    docker compose version 2>&1 || true
  else
    echo "docker_daemon=NOT_CHECKED_DOCKER_MISSING"
  fi

  echo
  echo "## Compose runner inventory (read-only)"
  if [[ -f "$COMPOSE_FILE" ]] && command -v docker >/dev/null 2>&1; then
    if docker compose --project-directory "$COMPOSE_DIR" -f "$COMPOSE_FILE" ps \
      --format 'container={{.Name}} state={{.State}} status={{.Status}}' "$COMPOSE_SERVICE" 2>&1; then
      echo "compose_ps=QUERY_COMPLETED"
    else
      echo "compose_ps=QUERY_FAILED"
    fi

    echo
    echo "## Runner container logs (redacted tail; last 60 lines)"
    docker compose --project-directory "$COMPOSE_DIR" -f "$COMPOSE_FILE" \
      logs --no-color --tail 60 "$COMPOSE_SERVICE" 2>&1 | redact || true
  else
    echo "compose_runner=NOT_CHECKED_COMPOSE_FILE_OR_DOCKER_MISSING"
  fi

  echo
  echo "## Bare-metal systemd runner (secondary compatibility check)"
  if command -v systemctl >/dev/null 2>&1; then
    systemctl list-units --type=service --all --no-legend 'actions.runner.*' 2>&1 \
      | awk '{print $1, $3, $4}' || true
  else
    echo "systemd=NOT_AVAILABLE"
  fi

  echo
  echo "## Outbound DNS"
  for host in github.com api.github.com objects.githubusercontent.com pipelines.actions.githubusercontent.com; do
    if getent ahosts "$host" >/dev/null 2>&1; then echo "PASS: DNS $host"; else echo "FAIL: DNS $host"; fi
  done

  echo
  echo "## Outbound HTTPS (unauthenticated probes only)"
  if command -v curl >/dev/null 2>&1; then
    for url in https://github.com/ https://api.github.com/; do
      curl --silent --show-error --location --output /dev/null --max-time 12 \
        --write-out "$url http=%{http_code} tls_verify=%{ssl_verify_result}\n" "$url" 2>&1 || true
    done
  fi

  echo
  echo "diagnostic_mode=read-only"
  echo "runner_registration_attempted=false"
  echo "container_mutation_attempted=false"
  echo "service_mutation_attempted=false"
  echo "secret_environment_variables_read=false"
  echo "runner_token_read=false"
} > "$TMP" 2>&1

redact < "$TMP" > "$REPORT"
chmod 600 "$REPORT"
(
  cd "$OUT_DIR"
  sha256sum "$(basename "$REPORT")" > "$(basename "$REPORT").sha256"
)
chmod 600 "$REPORT.sha256"

echo "Created redacted report: $REPORT"
echo "Created checksum sidecar: $REPORT.sha256"
echo "Review before sharing; never send registration tokens, PATs, cloud credentials, or production secrets."
