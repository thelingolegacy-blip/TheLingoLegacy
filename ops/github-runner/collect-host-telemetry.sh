#!/usr/bin/env bash
# Read-only G02 host telemetry collector. Does not prune, restart, register, or mutate services.
set -uo pipefail
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
# Shared production sanitizer; sourcing defines functions without running collection.
# shellcheck source=/dev/null
source "$SCRIPT_DIR/lib/telemetry-sanitizer.sh"
OUT="${1:-g02-host-telemetry-$(date -u +%Y%m%dT%H%M%SZ).txt}"
umask 077
{
  echo "G02_HOST_TELEMETRY_SCHEMA=1"
  echo "CAPTURED_AT_UTC=$(date -u +%FT%TZ)"
  echo "HOSTNAME=$(hostname 2>/dev/null || echo unavailable)"
  echo "USER=$(id -un 2>/dev/null || echo unavailable)"
  echo
  echo "=== OS / ARCH / CPU ==="
  uname -a 2>&1
  (grep -E '^(PRETTY_NAME|VERSION_ID)=' /etc/os-release 2>/dev/null || true)
  (nproc 2>/dev/null || true)
  (lscpu 2>/dev/null | grep -E '^(Architecture|CPU\(s\)|Model name|Thread|Core|Socket)' || true)
  echo
  echo "=== DISK CAPACITY / INODES ==="
  df -hT 2>&1
  df -i 2>&1
  for p in /var/lib/docker /var/lib/containerd /opt/actions-runner "$HOME"; do
    if [ -e "$p" ]; then
      echo "--- $p ---"
      df -hT "$p" 2>&1
      du -sh "$p" 2>&1
    fi
  done
  echo
  echo "=== MEMORY / SWAP / CGROUP LIMITS ==="
  free -h 2>&1
  (swapon --show 2>/dev/null || true)
  for f in /sys/fs/cgroup/memory.max /sys/fs/cgroup/memory.current /sys/fs/cgroup/memory/memory.limit_in_bytes /sys/fs/cgroup/memory/memory.usage_in_bytes; do
    if [ -r "$f" ]; then printf '%s=' "$f"; cat "$f"; fi
  done
  echo
  echo "=== DOCKER / BUILDX / COMPOSE ==="
  if command -v docker >/dev/null 2>&1; then
    docker --version 2>&1
    docker compose version 2>&1
    docker buildx version 2>&1
    docker info --format 'ServerVersion={{.ServerVersion}} StorageDriver={{.Driver}} DockerRootDir={{.DockerRootDir}} NCPU={{.NCPU}} MemTotal={{.MemTotal}} OSType={{.OSType}} Architecture={{.Architecture}}' 2>&1
    docker system df -v 2>&1
    docker buildx ls 2>&1
  else
    echo "DOCKER_CLI=MISSING"
  fi
  echo
  echo "=== KUBERNETES CLIENT / CONTEXT METADATA ==="
  if command -v kubectl >/dev/null 2>&1; then
    kubectl version --client 2>&1
    kubectl config current-context 2>&1
  else
    echo "KUBECTL_CLIENT=MISSING"
  fi
  echo
  echo "=== RUNNER PROCESS / SERVICE ==="
  (pgrep -af 'Runner.Listener|runsvc.sh|run.sh|config.sh' 2>/dev/null | sanitize_telemetry || true)
  (systemctl --no-pager --type=service --state=running 2>/dev/null | grep -iE 'actions.runner|github.runner' || true)
  echo
  echo "=== RUNNER DIAGNOSTIC FILE INVENTORY (NO LOG CONTENT) ==="
  for d in "$HOME"/actions-runner/_diag /opt/actions-runner/_diag ./_diag; do
    if [ -d "$d" ]; then
      echo "DIAG_DIR=$d"
      find "$d" -maxdepth 1 -type f -printf '%f %s bytes %TY-%Tm-%TdT%TH:%TM:%TS\n' 2>/dev/null | sort | tail -n 30
    fi
  done
  echo
  echo "=== RECENT KERNEL RESOURCE SIGNALS ==="
  (dmesg --ctime 2>/dev/null | grep -iE 'out of memory|oom-kill|killed process|no space left|I/O error|filesystem.*error' | tail -n 40 || true)
  echo
  echo "=== RESULT ==="
  echo "TELEMETRY_CAPTURE=COMPLETE_IF_ALL_SECTIONS_PRESENT"
  echo "NOTE=This file contains host metadata. Review it before sharing; do not include credentials or raw runner logs."
} > "$OUT" 2>&1
chmod 600 "$OUT" 2>/dev/null || true
echo "Wrote read-only telemetry report: $OUT"
echo "Review before sharing; do not paste secrets or raw runner logs."
