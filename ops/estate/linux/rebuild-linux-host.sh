#!/usr/bin/env bash
set -euo pipefail
umask 077

RUNNER_NAME="${RUNNER_NAME:-lingo-legacy-g02}"
RUNNER_LABELS="${RUNNER_LABELS:-self-hosted,linux,x64,lingo-g02}"
RUNNER_DIR="${RUNNER_DIR:-/opt/actions-runner}"
REPO_URL="${REPO_URL:-https://github.com/thelingolegacy-blip/TheLingoLegacy}"
MODE="${1:---prepare}"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "ERROR: run as root (e.g. sudo bash $0 --prepare)." >&2
  exit 2
fi

case "$MODE" in
  --prepare)
    echo "== OS identity =="
    . /etc/os-release
    printf 'OS=%s %s\n' "${ID:-unknown}" "${VERSION_ID:-unknown}"
    printf 'ARCH=%s\n' "$(uname -m)"
    [[ "${ID:-}" == ubuntu && "${VERSION_ID:-}" == 24.04 ]] || {
      echo "ERROR: expected Ubuntu 24.04 LTS; refusing to prepare an unverified OS." >&2
      exit 3
    }
    [[ "$(uname -m)" == x86_64 ]] || {
      echo "ERROR: G02 target requires x86_64." >&2
      exit 3
    }

    export DEBIAN_FRONTEND=noninteractive
    apt-get update
    apt-get install -y --no-install-recommends ca-certificates curl git jq python3 tar gzip unzip chrony unattended-upgrades
    systemctl enable --now chrony
    id actions-runner >/dev/null 2>&1 || useradd --system --create-home --shell /bin/bash actions-runner
    install -d -o actions-runner -g actions-runner -m 0750 "$RUNNER_DIR"
    install -d -o root -g root -m 0750 /var/lib/lingo-g02
    install -d -o root -g root -m 0750 /var/log/lingo-g02
    echo "LINUX_HOST_PREPARE=PASS"
    echo "RUNNER_REGISTRATION=NOT_PERFORMED"
    echo "Next: generate a short-lived registration token in GitHub's repository runner settings."
    ;;
  --register-runner)
    : "${RUNNER_TOKEN:?Supply a short-lived registration token in RUNNER_TOKEN; never write it to disk or source control.}"
    [[ -x ops/g02/install-runner.sh ]] || {
      echo "ERROR: run from the reviewed repository root; ops/g02/install-runner.sh not found." >&2
      exit 4
    }
    [[ "$(uname -m)" == x86_64 ]] || { echo "ERROR: x86_64 required." >&2; exit 4; }
    . /etc/os-release
    [[ "${ID:-}" == ubuntu && "${VERSION_ID:-}" == 24.04 ]] || { echo "ERROR: Ubuntu 24.04 required." >&2; exit 4; }
    [[ "$RUNNER_NAME" == "lingo-legacy-g02" ]] || { echo "ERROR: canonical runner name mismatch." >&2; exit 4; }
    [[ "$RUNNER_LABELS" == "self-hosted,linux,x64,lingo-g02" ]] || { echo "ERROR: canonical labels mismatch." >&2; exit 4; }

    # The existing reviewed installer configures and starts the matching runner service.
    # Do not echo or persist RUNNER_TOKEN. Avoid tracing this process.
    set +x
    bash ops/g02/install-runner.sh
    unset RUNNER_TOKEN
    echo "RUNNER_INSTALLER_RETURNED=0"
    echo "NOTE: GitHub assignment and G02 acceptance must still be independently verified."
    ;;
  --verify)
    echo "== Host =="
    hostname
    uname -a
    . /etc/os-release
    printf 'OS=%s %s\n' "$PRETTY_NAME" "$VERSION_ID"
    echo "== Resources =="
    df -h /
    free -h || true
    echo "== Time sync =="
    timedatectl show -p NTPSynchronized -p TimeUSec 2>/dev/null || true
    echo "== Runner processes =="
    ps -eo pid,etime,comm,args | grep -E '[R]unner.Listener|[r]unsvc\.sh|[R]unner.Worker' || true
    echo "== Runner services =="
    systemctl list-units --type=service --all --no-legend | grep -Ei 'actions\.runner|lingo.*runner' || true
    echo "== GitHub HTTPS probe =="
    curl --fail --silent --show-error --location --connect-timeout 5 --max-time 15 -o /dev/null -w 'github_api_http=%{http_code}\n' https://api.github.com/
    echo "LINUX_HOST_VERIFY=OBSERVATION_ONLY"
    echo "G02_ACCEPTANCE=NOT_ESTABLISHED"
    ;;
  *)
    echo "Usage: $0 --prepare | --register-runner | --verify" >&2
    exit 2
    ;;
esac
