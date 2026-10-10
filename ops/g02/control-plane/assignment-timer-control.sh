#!/usr/bin/env bash
set -euo pipefail

UNIT="lingo-g02-assignment-watch.timer"
SERVICE="lingo-g02-assignment-watch.service"
ACTION="${1:-status}"
SOURCE_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
SYSTEMD_DIR="/etc/systemd/system"

if ! command -v systemctl >/dev/null 2>&1; then
  echo "ERROR: systemd/systemctl unavailable; no changes made." >&2
  exit 2
fi

require_root() {
  if [[ "${EUID}" -ne 0 ]]; then
    echo "ERROR: this operation requires root; re-run with sudo." >&2
    exit 5
  fi
}

case "$ACTION" in
  create)
    require_root
    for file in assignment-watch.service assignment-watch.timer; do
      if [[ ! -f "$SOURCE_DIR/$file" ]]; then
        echo "ERROR: missing source unit: $SOURCE_DIR/$file" >&2
        exit 6
      fi
    done
    install -o root -g root -m 0644 "$SOURCE_DIR/assignment-watch.service" "$SYSTEMD_DIR/$SERVICE"
    install -o root -g root -m 0644 "$SOURCE_DIR/assignment-watch.timer" "$SYSTEMD_DIR/$UNIT"
    systemctl daemon-reload
    echo "=== INSTALLED UNIT STATUS (NOT ENABLED OR STARTED) ==="
    systemctl status "$UNIT" --no-pager || true
    echo "Units installed. Timer remains disabled; activation requires separate operator review."
    ;;
  status)
    systemctl status "$UNIT" --no-pager
    systemctl list-timers --all --no-pager "$UNIT"
    ;;
  reset)
    require_root
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
