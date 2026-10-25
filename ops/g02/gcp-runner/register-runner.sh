#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

REPO_URL="https://github.com/thelingolegacy-blip/TheLingoLegacy"
RUNNER_NAME="lingo-legacy-g02"
RUNNER_DIR="/opt/actions-runner"
RUNNER_USER="runner"

if [[ "$(id -u)" -eq 0 ]]; then
  echo "Run this script as a sudo-capable administrator, not root." >&2
  exit 2
fi
if ! command -v sudo >/dev/null 2>&1; then
  echo "sudo is required." >&2
  exit 2
fi
if [[ -z "${RUNNER_TOKEN:-}" ]]; then
  read -rsp "Paste the short-lived GitHub repository runner registration token: " RUNNER_TOKEN
  echo
fi
if [[ -z "$RUNNER_TOKEN" ]]; then
  echo "No registration token provided." >&2
  exit 2
fi
if ! id "$RUNNER_USER" >/dev/null 2>&1; then
  echo "Expected Linux account '$RUNNER_USER' is missing; verify VM bootstrap first." >&2
  exit 2
fi
if [[ -e "$RUNNER_DIR/.runner" ]]; then
  echo "A runner configuration already exists at $RUNNER_DIR. Refusing to replace it." >&2
  exit 3
fi

ARCH="$(uname -m)"
case "$ARCH" in
  x86_64) RUNNER_ARCH="x64" ;;
  aarch64|arm64) RUNNER_ARCH="arm64" ;;
  *) echo "Unsupported CPU architecture: $ARCH" >&2; exit 4 ;;
esac

TMP="$(mktemp -d)"
cleanup() {
  unset RUNNER_TOKEN
  rm -rf "$TMP"
}
trap cleanup EXIT

API_JSON="$(curl --fail --silent --show-error https://api.github.com/repos/thelingolegacy-blip/TheLingoLegacy/actions/runners/downloads)"
RUNNER_VERSION="$(jq -er '.actions_runner_latest_version' <<<"$API_JSON")"
TARBALL="actions-runner-linux-${RUNNER_ARCH}-${RUNNER_VERSION}.tar.gz"
curl --fail --location --silent --show-error \
  "https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/${TARBALL}" \
  --output "$TMP/$TARBALL"

# Validate archive integrity before extracting.
tar -tzf "$TMP/$TARBALL" >/dev/null
sudo install -d -o "$RUNNER_USER" -g "$RUNNER_USER" -m 0750 "$RUNNER_DIR"
sudo -u "$RUNNER_USER" tar -xzf "$TMP/$TARBALL" -C "$RUNNER_DIR"

# Token is passed only to the config process; never print it or persist it in a file.
sudo -u "$RUNNER_USER" "$RUNNER_DIR/config.sh" \
  --url "$REPO_URL" \
  --token "$RUNNER_TOKEN" \
  --name "$RUNNER_NAME" \
  --labels "lingo-g02" \
  --work "_work" \
  --unattended

unset RUNNER_TOKEN
sudo "$RUNNER_DIR/bin/installdependencies.sh"
sudo "$RUNNER_DIR/svc.sh" install "$RUNNER_USER"
sudo "$RUNNER_DIR/svc.sh" start
sudo "$RUNNER_DIR/svc.sh" status
echo "Registration command completed. Independently verify runner status in GitHub before routing jobs."
