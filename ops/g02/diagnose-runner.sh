#!/usr/bin/env bash
# Read-only G02 host diagnostics. Never registers, restarts, or reconfigures the runner.
# Writes a restricted, redacted report and SHA-256 sidecar in the current directory.
set -uo pipefail
umask 077

RUNNER_NAME="${RUNNER_NAME:-lingo-legacy-g02}"
RUNNER_DIR="${RUNNER_DIR:-/opt/actions-runner}"
OUT_DIR="${OUT_DIR:-./g02-host-diagnostics}"
mkdir -p "$OUT_DIR" || exit 2
REPORT="$OUT_DIR/g02-host-diagnostic.txt"
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
  echo "LINGO G02 HOST DIAGNOSTIC"
  echo "schema=lingo-g02-host-diagnostic-v2"
  echo "captured_utc=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "runner_name=$RUNNER_NAME"
  echo "runner_dir=$RUNNER_DIR"
  echo "hostname=$(hostname 2>/dev/null || echo unavailable)"
  echo "uid=$(id -u 2>/dev/null || echo unavailable)"
  echo "kernel=$(uname -srmo 2>/dev/null || echo unavailable)"
  echo "host_arch=$(uname -m 2>/dev/null || echo unavailable)"
  echo

  echo "## Required tools"
  for bin in bash curl systemctl sha256sum python3; do
    if command -v "$bin" >/dev/null 2>&1; then echo "PASS: $bin"; else echo "FAIL: $bin missing"; fi
  done

  echo
  echo "## Runner installation"
  for item in .runner svc.sh run.sh; do
    if [[ -e "$RUNNER_DIR/$item" ]]; then echo "PASS: $item exists"; else echo "FAIL: $item missing"; fi
  done
  if [[ -f "$RUNNER_DIR/.service" ]]; then
    echo "service_file_present=true"
    service_unit="$(basename "$(cat "$RUNNER_DIR/.service" 2>/dev/null)" 2>/dev/null || true)"
    echo "service_unit=$service_unit"
  else
    echo "service_file_present=false"
    service_unit=""
  fi

  echo
  echo "## Systemd runner services (names and states only)"
  if command -v systemctl >/dev/null 2>&1; then
    systemctl list-units --type=service --all --no-legend 'actions.runner.*' 2>&1 | awk '{print $1, $3, $4}' || true
    systemctl list-unit-files 'actions.runner.*.service' --no-legend 2>&1 | awk '{print $1, $2}' || true
    if [[ -n "$service_unit" ]]; then
      echo "### selected service status"
      systemctl show "$service_unit" --property=LoadState,ActiveState,SubState,UnitFileState,Result --no-pager 2>&1 || true
      echo "### selected service journal (redacted; last 60 lines)"
      journalctl -u "$service_unit" -n 60 --no-pager 2>&1 | redact || true
    fi
  fi

  echo
  echo "## Runner diagnostic files (names, size, timestamp only)"
  if [[ -d "$RUNNER_DIR/_diag" ]]; then
    find "$RUNNER_DIR/_diag" -maxdepth 1 -type f \( -name 'Runner_*.log' -o -name 'Worker_*.log' \) -printf '%TY-%Tm-%TdT%TH:%TM:%TSZ %s bytes %f\n' 2>/dev/null | sort | tail -20
    echo "## Recent Runner log tail (redacted; last 40 lines)"
    latest_runner="$(find "$RUNNER_DIR/_diag" -maxdepth 1 -type f -name 'Runner_*.log' -printf '%T@ %p\n' 2>/dev/null | sort -nr | head -1 | cut -d' ' -f2-)"
    if [[ -n "$latest_runner" ]]; then tail -40 "$latest_runner" 2>&1 | redact; else echo "No Runner_*.log found"; fi
    echo "## Recent Worker log tail (redacted; last 40 lines)"
    latest_worker="$(find "$RUNNER_DIR/_diag" -maxdepth 1 -type f -name 'Worker_*.log' -printf '%T@ %p\n' 2>/dev/null | sort -nr | head -1 | cut -d' ' -f2-)"
    if [[ -n "$latest_worker" ]]; then tail -40 "$latest_worker" 2>&1 | redact; else echo "No Worker_*.log found"; fi
  else
    echo "FAIL: diagnostic directory $RUNNER_DIR/_diag missing"
  fi

  echo
  echo "## Process presence (PIDs only)"
  pgrep -x Runner.Listener 2>/dev/null || echo "Runner.Listener not found"
  pgrep -x Runner.Worker 2>/dev/null || echo "Runner.Worker not found"

  echo
  echo "## DNS and HTTPS reachability (no credentials)"
  for host in github.com api.github.com objects.githubusercontent.com; do
    if getent ahosts "$host" >/dev/null 2>&1; then echo "PASS: DNS $host"; else echo "FAIL: DNS $host"; fi
  done
  if command -v curl >/dev/null 2>&1; then
    for url in https://github.com/ https://api.github.com/; do
      curl --silent --show-error --location --output /dev/null --max-time 12 --write-out "$url http=%{http_code} tls_verify=%{ssl_verify_result}\n" "$url" 2>&1 || true
    done
  fi
  echo
  echo "diagnostic_mode=read-only"
  echo "runner_registration_attempted=false"
  echo "service_mutation_attempted=false"
  echo "secret_environment_variables_read=false"
} > "$TMP" 2>&1

redact < "$TMP" > "$REPORT"
chmod 600 "$REPORT"
(cd "$OUT_DIR" && sha256sum "$(basename "$REPORT")" > "$(basename "$REPORT").sha256")
chmod 600 "$OUT_DIR/$(basename "$REPORT").sha256"
echo "Created redacted report: $REPORT"
echo "Created checksum sidecar: $REPORT.sha256"
echo "Review the report before sharing; do not send registration tokens, PATs, cloud credentials, or production secrets."
