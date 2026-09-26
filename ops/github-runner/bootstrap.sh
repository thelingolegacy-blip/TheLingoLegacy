#!/usr/bin/env bash
set -euo pipefail

REPO="thelingolegacy-blip/TheLingoLegacy"
RUNNER_NAME="${RUNNER_NAME:-lingo-g02-01}"

command -v gh >/dev/null || { echo "GitHub CLI (gh) is required"; exit 1; }
command -v docker >/dev/null || { echo "Docker is required"; exit 1; }

gh auth status >/dev/null

echo "Requesting short-lived runner registration token..."
TOKEN="$(gh api --method POST "repos/${REPO}/actions/runners/registration-token" --jq '.token')"

umask 077
cat > .env <<EOF
RUNNER_TOKEN=${TOKEN}
RUNNER_NAME=${RUNNER_NAME}
EOF

echo "Starting ephemeral G02 runner..."
docker compose up --build --abort-on-container-exit --exit-code-from github-runner

rm -f .env
