#!/usr/bin/env bash
set -euo pipefail

UNIT="lingo-g02-assignment-watch.timer"
ACTION="${1:-status}"

if ! command -v systemctl >/dev/null 2>&1; then
  echo "ERROR: systemd/systemctl unavailable; no changes made." >&2
  exit 2
fi

case "$ACTION" in
  create)
    if ! systemctl cat "$UNIT" >/dev/null 2>&1; then
      echo "ERROR: $UNIT is not installed. Install and review the unit files first." >&2
      exit 3
    fi
    systemctl status "$UNIT" --no-pager || true
    echo "Timer unit exists. Enable/start is intentionally not automatic."
    ;;
  status)
    systemctl status "$UNIT" --no-pager
    systemctl list-timers --all --no-pager "$UNIT"
    ;;
  reset)
    if ! systemctl cat "$UNIT" >/dev/null 2>&1; then
      echo "ERROR: $UNIT is not installed; reset refused." >&2
      exit 3
    fi
    echo "=== PRE-RESET TIMER STATUS ==="
    systemctl status "$UNIT" --no-pager || true
    echo "=== RESETTING ONLY THE ASSIGNMENT-WATCH TIMER ==="
    systemctl restart "$UNIT"
    echo "=== POST-RESET TIMER STATUS ==="
    systemctl status "$UNIT" --no-pager
    ;;
  enable)
    echo "ERROR: enabling the timer requires separate operator review after host preflight." >&2
    exit 4
    ;;
  *)
    echo "Usage: $0 {create|status|reset}" >&2
    exit 64
    ;;
esac
