#!/usr/bin/env bash
set -Eeuo pipefail

# Run on a fresh Ubuntu 22.04/24.04 VM as root.
# Supply a short-lived repository registration token only through the environment.
: "${RUNNER_TOKEN:?Set RUNNER_TOKEN to a short-lived GitHub runner registration token}"
: "${RUNNER_TARBALL_URL:?Set RUNNER_TARBALL_URL to the official GitHub runner release tarball URL}"
: "${RUNNER_TARBALL_SHA256:?Set RUNNER_TARBALL_SHA256 to the published SHA-256 checksum}"

RUNNER_NAME="${RUNNER_NAME:-lingo-legacy-g02}"
RUNNER_LABELS="${RUNNER_LABELS:-lingo-g02}"
RUNNER_USER="actions"

# Enforce the exact G02 identity and custom label; do not register a near-duplicate.
[[ "$RUNNER_NAME" == "lingo-legacy-g02" ]] || { echo "Refusing non-canonical runner name: $RUNNER_NAME" >&2; exit 3; }
[[ "$RUNNER_LABELS" == "lingo-g02" ]] || { echo "Refusing non-canonical runner labels: $RUNNER_LABELS" >&2; exit 3; }
RUNNER_DIR="/opt/actions-runner"

if [[ $EUID -ne 0 ]]; then
  echo "Run this installer as root (sudo)." >&2
  exit 1
fi
if [[ "$RUNNER_TARBALL_URL" != https://github.com/actions/runner/releases/download/* ]]; then
  echo "Runner tarball must come from the official github.com/actions/runner release." >&2
  exit 1
fi
if id "$RUNNER_USER" >/dev/null 2>&1 || [[ -e "$RUNNER_DIR" ]]; then
  echo "Runner user or install directory already exists; inspect the host before continuing." >&2
  exit 1
fi

apt-get update
DEBIAN_FRONTEND=noninteractive apt-get install -y ca-certificates curl tar gzip
useradd --system --create-home --home-dir "/home/$RUNNER_USER" --shell /usr/sbin/nologin "$RUNNER_USER"
install -d -o "$RUNNER_USER" -g "$RUNNER_USER" -m 0750 "$RUNNER_DIR"

tmp="$(mktemp)"
trap 'rm -f "$tmp"; unset RUNNER_TOKEN' EXIT
curl --fail --location --proto '=https' --tlsv1.2 "$RUNNER_TARBALL_URL" -o "$tmp"
printf '%s  %s\n' "$RUNNER_TARBALL_SHA256" "$tmp" | sha256sum --check --status || {
  echo "Runner archive checksum mismatch." >&2
  exit 1
}
tar -xzf "$tmp" -C "$RUNNER_DIR"
chown -R "$RUNNER_USER:$RUNNER_USER" "$RUNNER_DIR"

# Use the runner release’s own dependency installer for Ubuntu LTS compatibility.
"$RUNNER_DIR/bin/installdependencies.sh"

# Pass values through the process environment; never interpolate them into shell source.
runuser -u "$RUNNER_USER" -- env RUNNER_TOKEN="$RUNNER_TOKEN" RUNNER_NAME="$RUNNER_NAME" RUNNER_LABELS="$RUNNER_LABELS" bash -c '
  cd /opt/actions-runner
  ./config.sh --unattended \
    --url "https://github.com/thelingolegacy-blip/TheLingoLegacy" \
    --token "$RUNNER_TOKEN" \
    --name "$RUNNER_NAME" \
    --labels "$RUNNER_LABELS" \
    --work "_work"
'
unset RUNNER_TOKEN
rm -f "$tmp"
cd "$RUNNER_DIR"
./svc.sh install "$RUNNER_USER"
./svc.sh start

echo "Runner installation attempted. Verify online status in GitHub Settings > Actions > Runners."
echo "Security: do not run untrusted pull-request code on this runner; do not add production secrets."
