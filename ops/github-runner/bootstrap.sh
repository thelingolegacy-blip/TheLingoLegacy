#!/usr/bin/env bash
set -euo pipefail

REPO="thelingolegacy-blip/TheLingoLegacy"
RUNNER_NAME="${RUNNER_NAME:-lingo-legacy-g02}"
ENV_FILE=".env"

cleanup() {
  rm -f -- "$ENV_FILE"
}
trap cleanup EXIT HUP INT TERM

command -v gh >/dev/null || { echo "GitHub CLI (gh) is required" >&2; exit 1; }
command -v docker >/dev/null || { echo "Docker is required" >&2; exit 1; }
gh auth status >/dev/null

echo "Requesting short-lived runner registration token..."
TOKEN="$(gh api --method POST "repos/${REPO}/actions/runners/registration-token" --jq '.token')"
test -n "$TOKEN"

umask 077
cat > "$ENV_FILE" <<EOF
RUNNER_TOKEN=$TOKEN
RUNNER_NAME=$RUNNER_NAME
EOF
unset TOKEN

echo "Starting ephemeral G02 runner as $RUNNER_NAME..."
docker compose --env-file "$ENV_FILE" up --build --abort-on-container-exit --exit-code-from github-runner
