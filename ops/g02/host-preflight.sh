#!/usr/bin/env bash
set -euo pipefail

# G02 host preflight.
# Purpose: verify the host can support the real Actions Runner polling path.
# This does NOT claim runner connectivity, job assignment, or G02 acceptance.
#
# It intentionally does not install a proxy, intercept TLS, open inbound ports,
# or alter firewall/DNS policy. Any routing remediation remains an operator task.

RUNNER_NAME="${RUNNER_NAME:-lingo-legacy-g02}"
RUNNER_DIR="${RUNNER_DIR:-/opt/actions-runner}"
REPO_URL="${REPO_URL:-https://github.com/thelingolegacy-blip/TheLingoLegacy}"

fail=0

pass() { echo "PASS: $1"; }
warn() { echo "WARN: $1"; }
failcheck() { echo "FAIL: $1"; fail=1; }

echo "G02_HOST_PREFLIGHT=START"
echo "RUNNER_NAME=$RUNNER_NAME"
echo "RUNNER_DIR=$RUNNER_DIR"
echo "REPO_URL=$REPO_URL"

command -v systemctl >/dev/null && pass "systemd available" || failcheck "systemd unavailable"
command -v curl >/dev/null && pass "curl available" || failcheck "curl unavailable"
command -v getent >/dev/null && pass "getent available" || failcheck "getent unavailable"

if command -v timedatectl >/dev/null; then
  sync_state="$(timedatectl show -p NTPSynchronized --value 2>/dev/null || true)"
  [[ "$sync_state" == "yes" ]] && pass "system clock synchronized" || warn "system clock synchronization not confirmed"
fi

for host in github.com api.github.com; do
  if getent hosts "$host" >/dev/null 2>&1; then
    pass "DNS resolves $host"
  else
    failcheck "DNS cannot resolve $host"
  fi
done

for url in https://github.com/ https://api.github.com/; do
  if curl -fsSIL --connect-timeout 10 --max-time 20 "$url" >/dev/null 2>&1; then
    pass "outbound HTTPS reaches $url"
  else
    failcheck "outbound HTTPS cannot reach $url"
  fi
done

if env | grep -qiE '^(HTTP|HTTPS|ALL)_PROXY='; then
  warn "proxy environment variables are present; verify they permit GitHub Actions runner traffic"
else
  pass "no proxy environment variables detected"
fi

if [[ -f "$RUNNER_DIR/.runner" ]]; then
  pass "runner registration file exists"
else
  failcheck "runner registration file missing"
fi

service_unit="$(systemctl list-unit-files 'actions.runner.*.service' --no-legend 2>/dev/null |
  awk -v name="$RUNNER_NAME" 'index($1, name) {print $1; exit}')"

if [[ -n "$service_unit" ]]; then
  pass "runner service unit discovered: $service_unit"
  state="$(systemctl is-active "$service_unit" 2>/dev/null || true)"
  [[ "$state" == "active" ]] && pass "runner service is active" || failcheck "runner service is not active (state=$state)"
else
  failcheck "no Actions Runner service matching $RUNNER_NAME"
fi

echo "G02_HOST_PREFLIGHT_RESULT=$([[ "$fail" -eq 0 ]] && echo PASS || echo FAIL)"
echo "NOTE: PASS here is host readiness only. G02 acceptance still requires a real GitHub job assignment, runner identity, instantiated steps, sentinel execution, retrievable logs, and independent verification."

exit "$fail"
