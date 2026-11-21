#!/usr/bin/env bash
set -uo pipefail

child_pid=""
shutdown() {
  echo "G02_RENDER_SUPERVISOR=SHUTDOWN"
  if [[ -n "$child_pid" ]]; then
    kill -TERM "$child_pid" 2>/dev/null || true
    wait "$child_pid" 2>/dev/null || true
  fi
  exit 0
}
trap shutdown TERM INT

echo "G02_RENDER_SUPERVISOR=START"
while true; do
  /usr/local/bin/runner-cycle.sh &
  child_pid="$!"
  wait "$child_pid"
  rc="$?"
  child_pid=""
  echo "G02_RENDER_CYCLE_EXIT=$rc"
  if [[ "$rc" -eq 0 ]]; then
    sleep 5
  else
    sleep 30
  fi
done
