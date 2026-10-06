#!/usr/bin/env bash
set -euo pipefail

fail(){ echo "G02_PREFLIGHT=FAIL: $*" >&2; exit 1; }

[[ "${RUNNER_NAME:-}" == "lingo-legacy-g02" ]] || fail "runner name mismatch"
[[ "${RUNNER_OS:-}" == "Linux" ]] || fail "runner OS mismatch"
[[ "${RUNNER_ARCH:-}" == "X64" ]] || fail "runner architecture mismatch"
[[ "${RUNNER_ENVIRONMENT:-}" == "self-hosted" ]] || fail "runner is not an allocated self-hosted runner"
if [[ -n "${RUNNER_ID:-}" ]]; then
  [[ "${RUNNER_ID}" != "0" ]] || fail "runner is not allocated"
fi

for cmd in bash curl git jq sha256sum tar gzip unzip zip systemctl; do
  command -v "$cmd" >/dev/null || fail "missing command: $cmd"
done

command -v docker >/dev/null || fail "docker missing"
docker info >/dev/null || fail "docker daemon unavailable"

echo "G02_PREFLIGHT=PASS"
