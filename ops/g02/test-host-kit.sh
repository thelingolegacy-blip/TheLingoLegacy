#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

if [[ "$(id -u)" -ne 0 ]]; then echo "Run as root or with sudo." >&2; exit 2; fi

bash -n "$SCRIPT_DIR/runner-control.sh"
bash -n "$SCRIPT_DIR/install-runner.sh"
bash -n "$SCRIPT_DIR/host-preflight.sh"
bash -n "$SCRIPT_DIR/bootstrap-host.sh"

grep -q 'RUNNER_TOKEN:?' "$SCRIPT_DIR/install-runner.sh"
grep -q 'RUNNER_TOKEN:?' "$SCRIPT_DIR/bootstrap-host.sh"
! grep -RInE '(ghp_|github_pat_|gho_|AIza|BEGIN (RSA|OPENSSH|EC|DSA) PRIVATE KEY|token=gh|Bearer )' "$SCRIPT_DIR" --include="*.sh" --include="*.md"
grep -q 'self-hosted,linux,x64,lingo-g02' "$SCRIPT_DIR/install-runner.sh"
grep -q 'G02 acceptance remains unestablished' "$SCRIPT_DIR/runner-control.sh"
grep -q 'G02 acceptance still requires' "$SCRIPT_DIR/host-preflight.sh"

echo "G02_HOST_KIT_STATIC_TEST=PASS"