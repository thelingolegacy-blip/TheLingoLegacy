#!/usr/bin/env bash
set -euo pipefail

# Static safety test for the G02 host recovery controller.
# This test never contacts GitHub and never changes host state.

SCRIPT="ops/g02/runner-control.sh"
test -f "$SCRIPT"

bash -n "$SCRIPT"

for command in status start stop restart reconnect reset reboot; do
  grep -q "  $command)" "$SCRIPT"
done

grep -q 'CONNECT_TIMEOUT_SECONDS="${CONNECT_TIMEOUT_SECONDS:-300}"' "$SCRIPT"
grep -q 'systemctl restart "$service_unit"' "$SCRIPT"
grep -q 'systemctl reboot' "$SCRIPT"

echo "G02_RUNNER_CONTROL_STATIC_TEST=PASS"
