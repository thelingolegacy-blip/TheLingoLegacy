#!/usr/bin/env bash
set -euo pipefail

# One-command G02 host bootstrap.
# Run on the actual Linux host as root/sudo.
# A short-lived GitHub runner registration token must be supplied at runtime.
# No token is stored, logged intentionally, or committed.

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
: "${RUNNER_TOKEN:?Set RUNNER_TOKEN to a short-lived GitHub Actions runner registration token}"

echo "== G02 host bootstrap =="
echo "This prepares the host; it does not establish G02 acceptance."

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run as root or with sudo." >&2
  exit 2
fi

apt-get update
apt-get install -y curl tar python3 ca-certificates systemd

echo "== Network preflight =="
"$SCRIPT_DIR/host-preflight.sh" || true

echo "== Runner installation/registration =="
"$SCRIPT_DIR/install-runner.sh"

echo "== Final host preflight =="
"$SCRIPT_DIR/host-preflight.sh"

echo
echo "HOST_BOOTSTRAP_COMPLETE=TRUE"
echo "NEXT_REQUIRED_EVENT=GITHUB_JOB_ASSIGNMENT"
echo "G02_ACCEPTANCE=NOT_ESTABLISHED"
