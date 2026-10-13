#!/usr/bin/env bash
set -euo pipefail
OUT="${1:-g02-host-evidence}"
mkdir -p "$OUT"
STAMP="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
printf 'CAPTURED_AT_UTC=%s\n' "$STAMP" > "$OUT/captured-at.txt"
{ echo "HOSTNAME=$(hostname)"; echo "OS=$(uname -s)"; echo "KERNEL=$(uname -r)"; echo "ARCH=$(uname -m)"; } > "$OUT/host-os.txt"
if command -v systemctl >/dev/null 2>&1; then
  systemctl list-units --type=service --all 2>/dev/null | grep -i 'actions.runner' > "$OUT/service-status.txt" || true
  systemctl --no-pager --full status 'actions.runner.*' > "$OUT/service-detail.txt" 2>&1 || true
else
  echo "systemctl unavailable" > "$OUT/service-status.txt"
fi
ps aux 2>/dev/null | grep -E '[R]unner.Listener|[R]unner.Worker' > "$OUT/runner-processes.txt" || true
{ echo "REQUIRED_LABELS=self-hosted,linux,x64,lingo-g02"; echo "HOST_OBSERVATION_ONLY=true"; } > "$OUT/runner-labels.txt"
{ echo "GITHUB_CONNECTIVITY_TEST=NOT_PERFORMED_BY_DEFAULT"; echo "NOTE=Use approved network diagnostics; never print credentials."; } > "$OUT/network-check.txt"
echo "HOST_SUPPORT_COLLECTION=COMPLETE" > "$OUT/collection-status.txt"
echo "This bundle does not establish G02." >> "$OUT/collection-status.txt"
