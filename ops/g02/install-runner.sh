#!/usr/bin/env bash
set -euo pipefail

# Explicitly gated G02 host bootstrap.
# This script will not unregister, replace, or reset an existing runner.
# It provisions only after the operator has verified the host and remote inventory.

REPO="thelingolegacy-blip/TheLingoLegacy"
REPO_URL="https://github.com/$REPO"
RUNNER_NAME="${RUNNER_NAME:-lingo-legacy-g02}"
RUNNER_LABELS="${RUNNER_LABELS:-self-hosted,linux,x64,lingo-g02}"
RUNNER_DIR="${RUNNER_DIR:-/opt/actions-runner}"

: "${RUNNER_TOKEN:?RUNNER_TOKEN must be supplied through the environment}"
[[ "${G02_CONFIRM_HOST_MUTATION:-}" == "YES" ]] || { echo "Set G02_CONFIRM_HOST_MUTATION=YES only after reviewing the host change." >&2; exit 3; }
[[ "${G02_CONFIRM_RUNNER_REGISTRATION:-}" == "YES" ]] || { echo "Set G02_CONFIRM_RUNNER_REGISTRATION=YES only after approving a new registration." >&2; exit 3; }
[[ "$RUNNER_NAME" == "lingo-legacy-g02" ]] || { echo "Refusing non-canonical runner name: $RUNNER_NAME" >&2; exit 3; }
[[ "$RUNNER_LABELS" == "self-hosted,linux,x64,lingo-g02" ]] || { echo "Refusing non-canonical runner labels." >&2; exit 3; }

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run this bootstrap as root (or through sudo)." >&2
  exit 2
fi

for cmd in curl tar systemctl python3 gh; do
  command -v "$cmd" >/dev/null || { echo "$cmd is required" >&2; exit 2; }
done

gh auth status >/dev/null
existing_runner_ids="$(gh api --paginate "repos/$REPO/actions/runners?per_page=100" --jq '.runners[]? | select(.name == "lingo-legacy-g02") | .id')"
if [[ -n "$existing_runner_ids" ]]; then
  echo "BLOCKED: canonical runner already exists in GitHub inventory (ID(s): $existing_runner_ids)." >&2
  echo "Repair the existing host/daemon; do not create a duplicate or use --replace." >&2
  exit 4
fi

if [[ -e "$RUNNER_DIR/.runner" || -e "$RUNNER_DIR/config.sh" ]]; then
  echo "BLOCKED: $RUNNER_DIR already contains a runner registration or installation." >&2
  echo "No local registration will be removed and no files will be overwritten." >&2
  exit 4
fi

umask 077
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

arch="$(uname -m)"
case "$arch" in
  x86_64) runner_arch="x64" ;;
  aarch64|arm64) runner_arch="arm64" ;;
  *) echo "Unsupported host architecture: $arch" >&2; exit 2 ;;
esac

curl --fail --silent --show-error --location --connect-timeout 15 --max-time 180 \
  -H 'Accept: application/vnd.github+json' \
  https://api.github.com/repos/actions/runner/releases/latest > "$tmp/release.json"

download_url="$(python3 - "$tmp/release.json" "$runner_arch" <<'PY'
import json,sys
d=json.load(open(sys.argv[1], encoding="utf-8"))
arch=sys.argv[2]
for asset in d.get("assets", []):
    name=asset.get("name", "")
    if name.endswith(f"linux-{arch}.tar.gz"):
        print(asset["browser_download_url"])
        raise SystemExit(0)
raise SystemExit("No matching GitHub Actions runner asset found")
PY
)"

install -d -o actions-runner -g actions-runner "$RUNNER_DIR" 2>/dev/null || {
  if ! id actions-runner >/dev/null 2>&1; then
    useradd --system --create-home --shell /bin/bash actions-runner
    install -d -o actions-runner -g actions-runner "$RUNNER_DIR"
  else
    echo "Unable to prepare $RUNNER_DIR for actions-runner." >&2
    exit 1
  fi
}

curl --fail --silent --show-error --location --connect-timeout 15 --max-time 300 \
  "$download_url" -o "$tmp/runner.tar.gz"
tar -xzf "$tmp/runner.tar.gz" -C "$RUNNER_DIR"
chown -R actions-runner:actions-runner "$RUNNER_DIR"

runuser -u actions-runner -- env RUNNER_ALLOW_RUNASROOT=0 \
  "$RUNNER_DIR/config.sh" \
  --unattended \
  --url "$REPO_URL" \
  --token "$RUNNER_TOKEN" \
  --name "$RUNNER_NAME" \
  --labels "$RUNNER_LABELS" \
  --work "_work"

unset RUNNER_TOKEN
"$RUNNER_DIR/svc.sh" install actions-runner

service_unit="$(systemctl list-unit-files 'actions.runner.*.service' --no-legend |
  awk -v needle=".$RUNNER_NAME.service" 'index($1, needle) > 0 { print $1; exit }')"
if [[ -z "$service_unit" ]]; then
  echo "No exact service for $RUNNER_NAME was installed; inspect systemd manually." >&2
  systemctl list-unit-files 'actions.runner.*.service' --no-legend >&2 || true
  exit 1
fi

dropin_dir="/etc/systemd/system/$service_unit.d"
install -d "$dropin_dir"
cat > "$dropin_dir/10-g02-recovery.conf" <<'EOF'
[Service]
TimeoutStartSec=300
TimeoutStopSec=30
Restart=always
RestartSec=5
EOF

systemctl daemon-reload
systemctl enable "$service_unit"
systemctl restart "$service_unit"

echo "Waiting up to 5 minutes for runner daemon activation..."
deadline=$(($(date +%s) + 300))
while true; do
  state="$(systemctl is-active "$service_unit" 2>/dev/null || true)"
  if [[ "$state" == "active" ]]; then
    echo "RUNNER_DAEMON_STATE=active"
    break
  fi
  if (( $(date +%s) >= deadline )); then
    echo "RUNNER_CONNECT_WINDOW=TIMEOUT" >&2
    systemctl --no-pager --full status "$service_unit" --lines=40 || true
    journalctl -u "$service_unit" --no-pager -n 80 || true
    exit 1
  fi
  sleep 5
done

systemctl --no-pager --full status "$service_unit" --lines=25
echo "Bootstrap complete. This is not G02 acceptance."
echo "Require runner_id > 0, populated runner_name, executed steps, retrievable logs/artifact, and independent run/job/commit verification."
