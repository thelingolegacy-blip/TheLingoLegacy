#!/usr/bin/env bash
set -euo pipefail

# G02 host bootstrap. This script installs a repository-scoped Linux x64
# self-hosted runner with the exact G02 identity. It never contains or
# generates a registration token.

REPO="${GITHUB_REPOSITORY:-thelingolegacy-blip/TheLingoLegacy}"
RUNNER_NAME="${RUNNER_NAME:-lingo-legacy-g02}"
RUNNER_LABELS="self-hosted,linux,x64,lingo-g02"
RUNNER_VERSION="${RUNNER_VERSION:-}"
REG_TOKEN="${GITHUB_RUNNER_TOKEN:-}"
RUNNER_USER="${RUNNER_USER:-lingo-runner}"
RUNNER_DIR="${RUNNER_DIR:-/opt/actions-runner-g02}"

fail() { echo "G02_BOOTSTRAP=FAIL: $*" >&2; exit 1; }

[[ "$(id -u)" -eq 0 ]] || fail "run as root or through sudo"
[[ -n "$REG_TOKEN" ]] || fail "GITHUB_RUNNER_TOKEN is required and must be supplied out-of-band"
[[ -n "$RUNNER_VERSION" ]] || fail "RUNNER_VERSION must be explicitly pinned"
[[ "$REPO" =~ ^[^/]+/[^/]+$ ]] || fail "invalid GITHUB_REPOSITORY"
[[ "$RUNNER_NAME" == "lingo-legacy-g02" ]] || fail "runner name is immutable for G02"
[[ "$RUNNER_LABELS" == "self-hosted,linux,x64,lingo-g02" ]] || fail "runner labels are immutable for G02"

command -v curl >/dev/null || fail "curl missing"
command -v tar >/dev/null || fail "tar missing"
command -v sha256sum >/dev/null || fail "sha256sum missing"
command -v systemctl >/dev/null || fail "systemd required"

arch="$(uname -m)"
[[ "$arch" == "x86_64" ]] || fail "host architecture must be x86_64; detected $arch"

if ! id "$RUNNER_USER" >/dev/null 2>&1; then
  useradd --system --create-home --home-dir "/home/$RUNNER_USER" --shell /usr/sbin/nologin "$RUNNER_USER"
fi

install -d -m 0755 -o "$RUNNER_USER" -g "$RUNNER_USER" "$RUNNER_DIR"
cd "$RUNNER_DIR"

archive="actions-runner-linux-x64-$RUNNER_VERSION.tar.gz"
url="https://github.com/actions/runner/releases/download/v$RUNNER_VERSION/$archive"
tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT

echo "G02_BOOTSTRAP=DOWNLOAD version=$RUNNER_VERSION"
curl --fail --location --proto '=https' --tlsv1.2 --silent --show-error "$url" -o "$tmp"

# Supply-chain rule: the expected SHA256 MUST be provided out-of-band.
[[ -n "${RUNNER_SHA256:-}" ]] || fail "RUNNER_SHA256 must be supplied; refusing unverified runner binary"
echo "$RUNNER_SHA256  $tmp" | sha256sum --check --status || fail "runner archive SHA256 mismatch"

tar -xzf "$tmp" --strip-components=0 --no-same-owner
chown -R "$RUNNER_USER:$RUNNER_USER" "$RUNNER_DIR"

# Remove any stale registration only after the verified runner package exists.
if [[ -f "$RUNNER_DIR/.runner" ]]; then
  sudo -u "$RUNNER_USER" "$RUNNER_DIR/config.sh" remove --token "$REG_TOKEN" || true
fi

echo "G02_BOOTSTRAP=CONFIGURE name=$RUNNER_NAME labels=$RUNNER_LABELS"
sudo -u "$RUNNER_USER" env   RUNNER_ALLOW_RUNASROOT=0   "$RUNNER_DIR/config.sh"   --url "https://github.com/$REPO"   --token "$REG_TOKEN"   --name "$RUNNER_NAME"   --labels "$RUNNER_LABELS"   --work "_work"   --unattended   --replace

# Refuse service installation if identity is not exactly what G02 requires.
sudo -u "$RUNNER_USER" test -f "$RUNNER_DIR/.runner"
grep -Eq '"agentName"\s*:\s*"lingo-legacy-g02"' "$RUNNER_DIR/.runner" || fail "runner identity file does not contain required name"

chown -R "$RUNNER_USER:$RUNNER_USER" "$RUNNER_DIR"
"$RUNNER_DIR/svc.sh" install "$RUNNER_USER"
systemctl enable actions.runner."$REPO//"$RUNNER_NAME".service" 2>/dev/null || true
"$RUNNER_DIR/svc.sh" start

sleep 3
"$RUNNER_DIR/svc.sh" status || fail "runner service is not healthy"

echo "G02_BOOTSTRAP=PASS"
echo "G02_RUNNER_NAME=$RUNNER_NAME"
echo "G02_RUNNER_LABELS=$RUNNER_LABELS"
echo "G02_RUNNER_ARCH=$arch"
echo "G02_SERVICE=STARTED"
echo "G02_EXECUTION_CREDIT=NOT_YET_ESTABLISHED"
echo "G02_NOTE=GitHub job assignment and sentinel execution remain mandatory"
