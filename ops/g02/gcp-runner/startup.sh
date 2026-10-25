#!/usr/bin/env bash
set -Eeuo pipefail
exec > >(tee -a /var/log/lingo-g02-startup.log | logger -t lingo-g02-startup -s 2>/dev/console) 2>&1

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y --no-install-recommends ca-certificates curl git jq tar unzip build-essential
id --user runner >/dev/null 2>&1 || useradd --create-home --shell /bin/bash runner
install -d -o runner -g runner -m 0750 /opt/actions-runner
install -d -o root -g root -m 0755 /var/log/lingo-g02
printf '%s\n' "Bootstrap completed. Runner registration is a separate, token-protected manual step." > /var/log/lingo-g02/bootstrap-status.txt
chmod 0640 /var/log/lingo-g02/bootstrap-status.txt
