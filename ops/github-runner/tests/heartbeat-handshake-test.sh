#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." && pwd)"
SCRIPT="$ROOT/ops/github-runner/g02-heartbeat-handshake.sh"
PREFLIGHT="$ROOT/ops/github-runner/diagnose-host.sh"
tmp="$(mktemp -d)"
chmod 700 "$tmp"
trap 'rm -rf -- "$tmp"' EXIT

bash -n "$SCRIPT"
bash -n "$PREFLIGHT"
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
printf '403 0.001 0.002\n'
FAKECURL
chmod 700 "$tmp/fakebin/curl"
PATH="$tmp/fakebin:$PATH" bash "$SCRIPT" capture "$tmp/http-403.txt" >/dev/null
grep -q '^API_GITHUB_COM_HTTP_STATUS=403$' "$tmp/http-403.txt"
grep -q '^API_GITHUB_COM_NETWORK_HANDSHAKE=PASS$' "$tmp/http-403.txt"
grep -q '^GITHUB_COM_HTTP_STATUS=403$' "$tmp/http-403.txt"
grep -q '^GITHUB_COM_NETWORK_HANDSHAKE=PASS$' "$tmp/http-403.txt"

# Transport failure must be reported as FAIL with the actual curl exit code.
cat > "$tmp/fakebin/curl" <<'FAKECURLFAIL'
#!/usr/bin/env bash
exit 7
FAKECURLFAIL
chmod 700 "$tmp/fakebin/curl"
PATH="$tmp/fakebin:$PATH" bash "$SCRIPT" capture "$tmp/network-failure.txt" >/dev/null
grep -q '^API_GITHUB_COM_NETWORK_HANDSHAKE=FAIL$' "$tmp/network-failure.txt"
grep -q '^API_GITHUB_COM_CURL_EXIT_CODE=7$' "$tmp/network-failure.txt"
grep -q '^GITHUB_COM_NETWORK_HANDSHAKE=FAIL$' "$tmp/network-failure.txt"
grep -q '^GITHUB_COM_CURL_EXIT_CODE=7$' "$tmp/network-failure.txt"

# Host preflight test uses mocked DNS and HTTPS; it never asserts real host health.
cat > "$tmp/fakebin/getent" <<'FAKEGETENT'
#!/usr/bin/env bash
[[ "${1:-}" == "ahosts" && -n "${2:-}" ]] || exit 2
printf '192.0.2.1 STREAM %s\n' "$2"
FAKEGETENT
cat > "$tmp/fakebin/curl" <<'FAKEPREFLIGHTCURL'
#!/usr/bin/env bash
printf '200 0.001 0.002\n'
FAKEPREFLIGHTCURL
chmod 700 "$tmp/fakebin/getent" "$tmp/fakebin/curl"
PATH="$tmp/fakebin:$PATH" bash "$PREFLIGHT" "$tmp/host-preflight.txt" >/dev/null
grep -q '^G02_HOST_PREFLIGHT_SCHEMA=1$' "$tmp/host-preflight.txt"
grep -q '^GITHUB_DNS=PASS$' "$tmp/host-preflight.txt"
grep -q '^API_GITHUB_DNS=PASS$' "$tmp/host-preflight.txt"
grep -q '^API_GITHUB_HTTPS=PASS$' "$tmp/host-preflight.txt"
grep -q '^G02_ACCEPTANCE=NOT_EVALUATED$' "$tmp/host-preflight.txt"
sha256sum -c "$tmp/host-preflight.txt.sha256" >/dev/null

# Reports must not be silently overwritten.
if PATH="$tmp/fakebin:$PATH" bash "$PREFLIGHT" "$tmp/host-preflight.txt" >/dev/null 2>&1; then
  echo "FAIL: preflight overwrote an existing report" >&2
  exit 1
fi

echo "G02_HEARTBEAT_HANDSHAKE_TEST=PASS"
echo "G02_HOST_PREFLIGHT_TEST=PASS"
echo "AUTHORITATIVE_G02_ACCEPTANCE=NOT_EVALUATED"
