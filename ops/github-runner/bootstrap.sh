#!/usr/bin/env bash
set -euo pipefail

REPO="thelingolegacy-blip/TheLingoLegacy"
RUNNER_NAME="lingo-legacy-g02"
ENV_FILE=".env"
RUNNER_STARTED=0

cleanup() {
  rm -f -- "$ENV_FILE"
  if [[ "$RUNNER_STARTED" == "1" ]]; then
    echo "INFO: automatic runner deletion is disabled for safety." >&2
    echo "INFO: allow the ephemeral runner to unregister itself; if it remains, inspect repository Settings -> Actions -> Runners and remove only the exact stale registration after verifying its identity." >&2
  fi
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

command -v gh >/dev/null || { echo "GitHub CLI (gh) is required" >&2; exit 1; }
command -v docker >/dev/null || { echo "Docker is required" >&2; exit 1; }
gh auth status >/dev/null

EXISTING_RUNNER_IDS="$(gh api --paginate "repos/${REPO}/actions/runners?per_page=100" --jq '.runners[]? | select(.name == "lingo-legacy-g02") | .id')"
if [[ -n "$EXISTING_RUNNER_IDS" ]]; then
  echo "Runner lingo-legacy-g02 is already registered (id: ${EXISTING_RUNNER_IDS})." >&2
  echo "Refusing to create a duplicate. Repair its existing daemon or remove its stale registration through repository Settings first." >&2
  exit 2
fi

echo "Requesting short-lived repository runner registration token..."
TOKEN="$(gh api --method POST "repos/${REPO}/actions/runners/registration-token" --jq '.token')"
test -n "$TOKEN"

umask 077
cat > "$ENV_FILE" <<EOF
RUNNER_TOKEN=$TOKEN
RUNNER_NAME=$RUNNER_NAME
EOF
unset TOKEN

echo "Building isolated G02 runner image..."
docker compose --env-file "$ENV_FILE" build github-runner
RUNNER_STARTED=1
echo "Starting ephemeral repository runner as $RUNNER_NAME..."
docker compose --env-file "$ENV_FILE" up --no-build --abort-on-container-exit --exit-code-from github-runner
