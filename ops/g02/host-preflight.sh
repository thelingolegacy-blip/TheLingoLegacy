#!/usr/bin/env bash
# Read-only G02 host preflight for the registered self-hosted runner. Does not restart or register a runner.
set -u
umask 077
OUT_DIR="${1:-./g02-evidence}"
mkdir -p "$OUT_DIR" || exit 2
OUT="$OUT_DIR/g02-host-preflight.txt"
{
  echo "LINGO G02 HOST PREFLIGHT"
  echo "evidence_schema=lingo-g02-host-preflight-v1"
  echo "captured_utc=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "hostname=$(hostname 2>/dev/null || echo unavailable)"
  echo "uid=$(id -u)"
  echo "kernel=$(uname -srmo)"
  echo "host_arch=$(uname -m)"
  echo
  echo "## CPU"; nproc 2>&1 || true
  echo
  echo "## Memory"; free -h 2>&1 || true
  echo
  echo "## Disk"; df -hP 2>&1 || true
  echo
  echo "## Inodes"; df -iP 2>&1 || true
  echo
  echo "## DNS"; for h in github.com api.github.com objects.githubusercontent.com; do printf '%s: ' "$h"; getent ahosts "$h" 2>/dev/null | awk '!seen[$1]++ {print $1}' | head -n 3; done
  echo
  echo "## HTTPS"; for u in https://github.com/ https://api.github.com/; do curl -sS -L -o /dev/null --max-time 12 -w "$u http=%{http_code} tls_verify=%{ssl_verify_result}\n" "$u" 2>&1 || true; done
  echo
  echo "## Runner process (process names only)"
  pgrep -x Runner.Listener 2>/dev/null || true
  pgrep -x Runner.Worker 2>/dev/null || true
  echo "Sensitive credentials and environment variables were not read."
} > "$OUT"
chmod 600 "$OUT"
(cd "$OUT_DIR" && sha256sum g02-host-preflight.txt > g02-host-preflight.txt.sha256)
chmod 600 "$OUT_DIR/g02-host-preflight.txt.sha256"
echo "Created $OUT and checksum sidecar. Review host-specific details before sharing."
