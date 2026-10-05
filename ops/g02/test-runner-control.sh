#!/usr/bin/env bash
set -euo pipefail

# Static safety test for the G02 host recovery controller and preflight.
# This test never contacts GitHub and never changes host state.

SCRIPT="ops/g02/runner-control.sh"
PREFLIGHT="ops/g02/host-preflight.sh"
test -f "$SCRIPT"
test -f "$PREFLIGHT"

bash -n "$SCRIPT"
bash -n "$PREFLIGHT"

for command in status start stop restart reconnect reset reboot; do
  grep -q "  $command)" "$SCRIPT"
done

grep -q 'CONNECT_TIMEOUT_SECONDS="${CONNECT_TIMEOUT_SECONDS:-300}"' "$SCRIPT"
grep -q 'systemctl restart "$service_unit"' "$SCRIPT"
grep -q 'systemctl reboot' "$SCRIPT"

grep -q 'G02_HOST_PREFLIGHT_RESULT=' "$PREFLIGHT"
grep -q 'G02 acceptance still requires' "$PREFLIGHT"
grep -q 'curl -fsSIL' "$PREFLIGHT"

echo "G02_RUNNER_CONTROL_STATIC_TEST=PASS"
