#!/usr/bin/env bash
set -euo pipefail

# G02 host bootstrap for thelingolegacy-blip/TheLingoLegacy.
# This script never changes the G02 acceptance predicate.
# Supply a short-lived GitHub Actions runner registration token via RUNNER_TOKEN.
# Do not commit the token or place it in this file.

REPO_URL="${REPO_URL:-https://github.com/thelingolegacy-blip/TheLingoLegacy}"
RUNNER_NAME="${RUNNER_NAME:-lingo-legacy-g02}"
RUNNER_LABELS="${RUNNER_LABELS:-self-hosted,linux,x64,lingo-g02}"
RUNNER_DIR="${RUNNER_DIR:-/opt/actions-runner}"

: "${RUNNER_TOKEN:?RUNNER_TOKEN must be supplied in the environment}"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run this bootstrap as root (or through sudo)." >&2
  exit 2
fi

command -v curl >/dev/null || { echo "curl is required" >&2; exit 2; }
command -v tar >/dev/null || { echo "tar is required" >&2; exit 2; }
command -v systemctl >/dev/null || { echo "systemctl is required" >&2; exit 2; }

id actions-runner >/dev/null 2>&1 || useradd --system --create-home --shell /bin/bash actions-runner
install -d -o actions-runner -g actions-runner "$RUNNER_DIR"

arch="$(uname -m)"
case "$arch" in
  x86_64) runner_arch="x64" ;;
  aarch64|arm64) runner_arch="arm64" ;;
  *) echo "Unsupported host architecture: $arch" >&2; exit 2 ;;
esac

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

release_json="$tmp/release.json"
curl --fail --silent --show-error --location \
  -H 'Accept: application/vnd.github+json' \
  https://api.github.com/repos/actions/runner/releases/latest > "$release_json"

download_url="$(python3 - "$release_json" "$runner_arch" <<'PY'
import json,sys
d=json.load(open(sys.argv[1]))
arch=sys.argv[2]
for a in d.get("assets",[]):
    n=a.get("name","")
    if n.endswith(f"linux-{arch}.tar.gz"):
        print(a["browser_download_url"])
        raise SystemExit
raise SystemExit("No matching GitHub Actions runner asset found")
PY
)"

curl --fail --silent --show-error --location "$download_url" -o "$tmp/runner.tar.gz"
tar -xzf "$tmp/runner.tar.gz" -C "$RUNNER_DIR"
chown -R actions-runner:actions-runner "$RUNNER_DIR"

# Remove only a stale local registration for this runner name; no repository state is changed.
if [[ -f "$RUNNER_DIR/.runner" ]]; then
  runuser -u actions-runner -- "$RUNNER_DIR/config.sh" remove --token "$RUNNER_TOKEN" || true
fi

runuser -u actions-runner -- env RUNNER_ALLOW_RUNASROOT=0 \
  "$RUNNER_DIR/config.sh" \
  --unattended \
  --url "$REPO_URL" \
  --token "$RUNNER_TOKEN" \
  --name "$RUNNER_NAME" \
  --labels "$RUNNER_LABELS" \
  --work "_work" \
  --replace

"$RUNNER_DIR/svc.sh" install actions-runner

# Select only the service corresponding to this runner name. Never restart an
# unrelated actions.runner.* service when multiple runners exist on the host.
service_unit="$(systemctl list-unit-files 'actions.runner.*.service' --no-legend |
  awk -v name="$RUNNER_NAME" 'index($1, name) {print $1; exit}')"

if [[ -z "$service_unit" ]]; then
  echo "No Actions Runner service matching RUNNER_NAME=$RUNNER_NAME was installed." >&2
  systemctl list-unit-files 'actions.runner.*.service' --no-legend >&2 || true
  exit 1
fi

systemctl enable "$service_unit"
systemctl restart "$service_unit"
systemctl --no-pager --full status "$service_unit" --lines=30

echo
echo "Host bootstrap complete."
echo "Expected daemon state: Connected to GitHub / Listening for Jobs."
echo "Runner name: $RUNNER_NAME"
echo "Labels: $RUNNER_LABELS"
echo
echo "Do NOT treat registration/online state as G02 acceptance."
echo "G02 passes only after empirical assignment, steps, sentinel exit 0, logs, and independent verification."
