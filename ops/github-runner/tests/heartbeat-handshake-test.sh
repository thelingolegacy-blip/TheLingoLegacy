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

# A completed TLS/HTTP exchange is a network handshake even when the server
# responds with 403; HTTP status and transport success must remain distinct.
mkdir -p "$tmp/fakebin"
cat > "$tmp/fakebin/curl" <<'FAKECURL'
#!/usr/bin/env bash
printf '403 0.001 0.002\\n'
FAKECURL
chmod 700 "$tmp/fakebin/curl"
PATH="$tmp/fakebin:$PATH" bash "$SCRIPT" capture "$tmp/http-403.txt" >/dev/null
grep -q '^API_GITHUB_COM_HTTP_STATUS=403 "$tmp/http-403.txt"
grep -q '^API_GITHUB_COM_NETWORK_HANDSHAKE=PASS "$tmp/http-403.txt"
grep -q '^GITHUB_COM_HTTP_STATUS=403 "$tmp/http-403.txt"
grep -q '^GITHUB_COM_NETWORK_HANDSHAKE=PASS "$tmp/http-403.txt"

echo "G02_HEARTBEAT_HANDSHAKE_TEST=PASS"
echo "AUTHORITATIVE_G02_ACCEPTANCE=NOT_EVALUATED"
