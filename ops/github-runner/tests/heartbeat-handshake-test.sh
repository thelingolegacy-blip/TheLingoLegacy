#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." && pwd)"
SCRIPT="$ROOT/ops/github-runner/g02-heartbeat-handshake.sh"
tmp="$(mktemp -d)"
chmod 700 "$tmp"
trap 'rm -rf -- "$tmp"' EXIT

bash -n "$SCRIPT"
bash "$SCRIPT" reset-plan | grep -q '^RESET_ACTION=NOT_PERFORMED$'
bash "$SCRIPT" restore-plan | grep -q '^RESTORE_ACTION=NOT_PERFORMED$'

# Exercise report generation and hash verification without depending on network PASS.
bash "$SCRIPT" capture "$tmp/heartbeat.txt" >/dev/null
[[ -s "$tmp/heartbeat.txt" && -s "$tmp/heartbeat.txt.sha256" ]]
bash "$SCRIPT" verify "$tmp/heartbeat.txt" "$tmp/heartbeat.txt.sha256" | grep -q '^HASH_VERIFICATION=PASS$'

printf '\nmutation-detection\n' >> "$tmp/heartbeat.txt"
if bash "$SCRIPT" verify "$tmp/heartbeat.txt" "$tmp/heartbeat.txt.sha256" >/dev/null 2>&1; then
  echo "FAIL: modified report was accepted" >&2
  exit 1
fi

echo "G02_HEARTBEAT_HANDSHAKE_TEST=PASS"
echo "AUTHORITATIVE_G02_ACCEPTANCE=NOT_EVALUATED"
