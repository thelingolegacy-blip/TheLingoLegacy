#!/usr/bin/env bash
set -euo pipefail

REPO="thelingolegacy-blip/TheLingoLegacy"
RUNNER_NAME="lingo-legacy-g02"
ENV_FILE=".env"
# The runner is registered as ephemeral and should unregister after its one job.
# Never delete remote runners by name during cleanup: a same-name registration could
# belong to a different process/operator. If interrupted, inspect the runner inventory
# and remove only the exact stale registration after independently verifying its ID.
cleanup() {
  rm -f -- "$ENV_FILE"
  if [[ "${RUNNER_STARTED}" == "1" ]]; then
    echo "NOTE: bootstrap ended after starting the ephemeral runner. Verify its status in repository Settings -> Actions -> Runners." >&2
    echo "Do not automatically delete a remote runner by name; remove a stale registration only after verifying its exact runner ID." >&2
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
