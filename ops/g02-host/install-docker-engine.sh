#!/usr/bin/env bash
set -Eeuo pipefail

# LINGO G02 host bootstrap for a dedicated Ubuntu 24.04 x86_64 VM.
# Run as root on a newly provisioned, isolated host only.
# This installs Docker Engine; it does NOT register a GitHub runner or start
# assistant workloads. Review ops/g02-host/README.md first.

log() { printf '[g02-host] %s\n' "$*"; }
fail() { printf '[g02-host] ERROR: %s\n' "$*" >&2; exit 1; }

[[ "$(id -u)" -eq 0 ]] || fail "Run as root (sudo)."
[[ -r /etc/os-release ]] || fail "Cannot identify operating system."
. /etc/os-release
[[ "${ID:-}" == "ubuntu" && "${VERSION_ID:-}" == "24.04" ]] || fail "Only Ubuntu 24.04 is approved by this bootstrap."
[[ "$(dpkg --print-architecture)" == "amd64" ]] || fail "Only x86_64/amd64 is approved."

if [[ -e /var/run/docker.sock ]]; then
  log "Existing Docker socket detected; refusing to overwrite an existing engine setup."
  log "Inspect the existing daemon and host inventory before proceeding."
  exit 2
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y --no-install-recommends ca-certificates curl gnupg

install -m 0755 -d /etc/apt/keyrings
curl --fail --show-error --silent --location --retry 3 \
  https://download.docker.com/linux/ubuntu/gpg \
  -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

arch="$(dpkg --print-architecture)"
codename="$(
  . /etc/os-release
  printf '%s' "${UBUNTU_CODENAME:-$VERSION_CODENAME}"
)"
printf 'deb [arch=%s signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu %s stable\n' \
  "$arch" "$codename" > /etc/apt/sources.list.d/docker.list

apt-get update
apt-get install -y --no-install-recommends \
  docker-ce docker-ce-cli containerd.io \
  docker-buildx-plugin docker-compose-plugin

install -d -m 0755 /etc/docker
if [[ -e /etc/docker/daemon.json ]]; then
  cp -a /etc/docker/daemon.json "/etc/docker/daemon.json.pre-g02.$(date -u +%Y%m%dT%H%M%SZ)"
fi
cat > /etc/docker/daemon.json <<'DAEMON'
{
  "live-restore": true,
  "log-driver": "local",
  "log-opts": {
    "max-size": "20m",
    "max-file": "5"
  },
  "userland-proxy": false
}
DAEMON
chmod 0644 /etc/docker/daemon.json

systemctl enable --now containerd.service docker.service
systemctl is-active --quiet docker.service || fail "Docker Engine did not become active."
docker version
docker compose version
docker info --format 'DockerRootDir={{.DockerRootDir}} SecurityOptions={{json .SecurityOptions}}'

log "Docker Engine installed. No GitHub runner was registered."
log "Do not mount /var/run/docker.sock into assistant containers or untrusted jobs."
log "Next: follow ops/g02-host/README.md for firewall, host identity, runner and acceptance gates."
