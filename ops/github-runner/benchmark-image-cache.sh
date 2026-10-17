#!/usr/bin/env bash
# Read-only measurement wrapper except for the normal Docker image build/cache writes.
# Never run docker system prune here: preserving existing cache is the purpose.
set -euo pipefail

cd "$(dirname "$0")"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
evidence_dir="${EVIDENCE_DIR:-./cache-benchmark-evidence}"
mkdir -p "$evidence_dir"
log="$evidence_dir/g02-image-cache-$timestamp.log"

{
  echo "G02_IMAGE_CACHE_BENCHMARK=START"
  echo "timestamp_utc=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "host=$(hostname)"
  echo "kernel=$(uname -srmo)"
  echo "docker_version=$(docker --version 2>&1)"
  echo "compose_version=$(docker compose version 2>&1)"
  echo
  echo "=== DOCKER CACHE BEFORE ==="
  docker system df -v
  echo
  echo "=== IMAGE BUILD (normal cache reuse enabled) ==="
  start_epoch="$(date +%s)"
  if /usr/bin/time -p docker compose --progress plain build github-runner; then
    build_rc=0
  else
    build_rc=$?
  fi
  end_epoch="$(date +%s)"
  echo "BUILD_EXIT_STATUS=$build_rc"
  echo "BUILD_DURATION_SECONDS=$((end_epoch - start_epoch))"
  echo
  echo "=== DOCKER CACHE AFTER ==="
  docker system df -v
  echo
  echo "G02_IMAGE_CACHE_BENCHMARK=END"
  echo "timestamp_utc=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
} 2>&1 | tee "$log"

echo "Evidence log written to: $log"
echo "No Docker cache was pruned. This run measures a cache-reuse build; it is not a controlled cold-vs-warm comparison."
