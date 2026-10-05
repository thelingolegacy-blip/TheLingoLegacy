#!/usr/bin/env bash
set -euo pipefail

REPO="${GITHUB_REPOSITORY:-thelingolegacy-blip/TheLingoLegacy}"
RUNNER_NAME="${RUNNER_NAME:-lingo-legacy-g02}"
RUNNER_LABELS="self-hosted,linux,x64,lingo-g02"
RUNNER_VERSION="${RUNNER_VERSION:-}"
REG_TOKEN="${GITHUB_RUNNER_TOKEN:-}"
RUNNER_SHA256="${RUNNER_SHA256:-}"
RUNNER_USER="${RUNNER_USER:-lingo-runner}"
RUNNER_DIR="${RUNNER_DIR:-/opt/actions-runner-g02}"

fail() { echo "G02_BOOTSTRAP=FAIL: $*" >&2; exit 1; }

[[ "$(id -u)" -eq 0 ]] || fail "run as root or through sudo"
[[ -n "$REG_TOKEN" ]] || fail "GITHUB_RUNNER_TOKEN is required and must be supplied out-of-band"
[[ -n "$RUNNER_VERSION" ]] || fail "RUNNER_VERSION must be explicitly pinned"
[[ -n "$RUNNER_SHA256" ]] || fail "RUNNER_SHA256 must be supplied; refusing an unverified runner binary"
[[ "$REPO" =~ ^[^/]+/[^/]+$ ]] || fail "invalid GITHUB_REPOSITORY"
[[ "$RUNNER_NAME" == "lingo-legacy-g02" ]] || fail "runner name is immutable for G02"
[[ "$RUNNER_LABELS" == "self-hosted,linux,x64,lingo-g02" ]] || fail "runner labels are immutable for G02"

arch="$(uname -m)"
[[ "$arch" == "x86_64" ]] || fail "host architecture must be x86_64; detected $arch"

install_packages() {
  if command -v apt-get >/dev/null 2>&1; then
    export DEBIAN_FRONTEND=noninteractive
    apt-get update
    apt-get install -y --no-install-recommends \
      bash ca-certificates curl git tar gzip unzip zip jq \
      sha256sum coreutils systemd sudo rsync \
      build-essential python3 python3-pip python3-venv \
      openssh-client gnupg lsb-release
  elif command -v dnf >/dev/null 2>&1; then
    dnf install -y \
      bash ca-certificates curl git tar gzip unzip zip jq \
      coreutils systemd sudo rsync \
      gcc gcc-c++ make python3 python3-pip \
      openssh-clients gnupg2
  elif command -v yum >/dev/null 2>&1; then
    yum install -y \
      bash ca-certificates curl git tar gzip unzip zip jq \
      coreutils systemd sudo rsync \
      gcc gcc-c++ make python3 python3-pip \
      openssh-clients gnupg2
  else
    fail "supported package manager not found"
  fi
}

echo "G02_BOOTSTRAP=INSTALL_BASE_PACKAGES"
install_packages

if ! command -v docker >/dev/null 2>&1; then
  echo "G02_BOOTSTRAP=INSTALL_DOCKER"
  if command -v apt-get >/dev/null 2>&1; then
    install -d -m 0755 /etc/apt/keyrings
    curl --fail --location --proto '=https' --tlsv1.2 \
      https://download.docker.com/linux/ubuntu/gpg \
      -o /etc/apt/keyrings/docker.asc
    chmod a+r /etc/apt/keyrings/docker.asc
    . /etc/os-release
    echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/${ID} ${VERSION_CODENAME} stable" \
      > /etc/apt/sources.list.d/docker.list
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  elif command -v dnf >/dev/null 2>&1; then
    dnf -y install dnf-plugins-core
    dnf config-manager --add-repo https://download.docker.com/linux/fedora/docker-ce.repo
    dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  else
    fail "Docker installation is supported here only for apt/dnf hosts"
  fi
fi

systemctl enable --now docker
docker info >/dev/null || fail "Docker daemon is unavailable"

for bin in bash curl git tar gzip unzip zip jq sha256sum systemctl runuser docker python3; do
  command -v "$bin" >/dev/null || fail "$bin missing after provisioning"
done

docker run --rm hello-world >/dev/null || fail "Docker execution test failed"

if ! id "$RUNNER_USER" >/dev/null 2>&1; then
  useradd --system --create-home --home-dir "/home/$RUNNER_USER" --shell /usr/sbin/nologin "$RUNNER_USER"
fi

usermod -aG docker "$RUNNER_USER"

install -d -m 0755 -o "$RUNNER_USER" -g "$RUNNER_USER" "$RUNNER_DIR"
cd "$RUNNER_DIR"

archive="actions-runner-linux-x64-$RUNNER_VERSION.tar.gz"
url="https://github.com/actions/runner/releases/download/v$RUNNER_VERSION/$archive"
tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT

echo "G02_BOOTSTRAP=DOWNLOAD_RUNNER version=$RUNNER_VERSION"
curl --fail --location --proto '=https' --tlsv1.2 --silent --show-error "$url" -o "$tmp"
echo "$RUNNER_SHA256  $tmp" | sha256sum --check --status || fail "runner archive SHA256 mismatch"

tar -xzf "$tmp" --no-same-owner
chown -R "$RUNNER_USER:$RUNNER_USER" "$RUNNER_DIR"

runuser -u "$RUNNER_USER" -- "$RUNNER_DIR/bin/installdependencies.sh" || fail "GitHub runner dependency installation failed"

if [[ -f "$RUNNER_DIR/.runner" ]]; then
  runuser -u "$RUNNER_USER" -- "$RUNNER_DIR/config.sh" remove --token "$REG_TOKEN" || true
fi

echo "G02_BOOTSTRAP=CONFIGURE name=$RUNNER_NAME labels=$RUNNER_LABELS"
runuser -u "$RUNNER_USER" -- "$RUNNER_DIR/config.sh" \
  --url "https://github.com/$REPO" \
  --token "$REG_TOKEN" \
  --name "$RUNNER_NAME" \
  --labels "$RUNNER_LABELS" \
  --work "_work" \
  --unattended \
  --replace

test -f "$RUNNER_DIR/.runner" || fail "runner identity file missing"
grep -Eq '"agentName"\s*:\s*"lingo-legacy-g02"' "$RUNNER_DIR/.runner" || fail "runner identity does not match required name"

chown -R "$RUNNER_USER:$RUNNER_USER" "$RUNNER_DIR"
"$RUNNER_DIR/svc.sh" install "$RUNNER_USER"
"$RUNNER_DIR/svc.sh" start
sleep 3
"$RUNNER_DIR/svc.sh" status || fail "runner service is not healthy"

echo "G02_BOOTSTRAP=PASS"
echo "G02_RUNNER_NAME=$RUNNER_NAME"
echo "G02_RUNNER_LABELS=$RUNNER_LABELS"
echo "G02_RUNNER_ARCH=$arch"
echo "G02_DOCKER=PASS"
echo "G02_DEPENDENCIES=PASS"
echo "G02_SERVICE=STARTED"
echo "G02_EXECUTION_CREDIT=NOT_YET_ESTABLISHED"
echo "G02_NOTE=GitHub assignment, step execution, logs, and independent verification remain mandatory"
