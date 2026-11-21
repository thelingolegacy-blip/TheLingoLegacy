#!/usr/bin/env bash
set -Eeuo pipefail
umask 027
exec > >(tee -a /var/log/lingo-g02-startup.log | logger -t lingo-g02-startup -s 2>/dev/console) 2>&1

export DEBIAN_FRONTEND=noninteractive
export NEEDRESTART_MODE=a

retry() {
  local attempts="${1:?attempt count required}"
  shift
  local n=1
  until "$@"; do
    if (( n >= attempts )); then
      echo "Command failed after ${n} attempts: $*" >&2
      return 1
    fi
    echo "Attempt ${n}/${attempts} failed; retrying in ${n}0 seconds: $*" >&2
    sleep "$((n * 10))"
    n=$((n + 1))
  done
}

retry 5 apt-get update
retry 5 apt-get install -y --no-install-recommends ca-certificates curl git jq tar unzip build-essential sudo

if ! id --user runner >/dev/null 2>&1; then
  useradd --create-home --shell /bin/bash --user-group runner
fi

install -d -o runner -g runner -m 0750 /opt/actions-runner
install -d -o root -g root -m 0755 /var/log/lingo-g02
printf '%s\n' "Bootstrap completed. Runner registration is a separate, token-protected manual step." > /var/log/lingo-g02/bootstrap-status.txt
chmod 0640 /var/log/lingo-g02/bootstrap-status.txt
echo "G02 base bootstrap completed; no registration token was requested or stored."
