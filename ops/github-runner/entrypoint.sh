#!/usr/bin/env bash
set -euo pipefail
: "${GITHUB_URL:?GITHUB_URL is required}"
: "${RUNNER_NAME:?RUNNER_NAME is required}"
LABELS="${RUNNER_LABELS:-self-hosted,linux,x64,lingo-g02}"

# Render supplies a repository-scoped GitHub token as GH_TOKEN. Exchange it
# for a short-lived runner registration token at container startup. Local
# bootstrap.sh may continue to supply RUNNER_TOKEN directly.
if [[ -z "${RUNNER_TOKEN:-}" ]]; then
  : "${GH_TOKEN:?GH_TOKEN or RUNNER_TOKEN is required}"
  REPO_PATH="${GITHUB_URL#https://github.com/}"
  REPO_PATH="${REPO_PATH%/}"
  RUNNER_TOKEN="$(curl --fail --silent --show-error \
    --request POST \
    --header "Accept: application/vnd.github+json" \
    --header "Authorization: Bearer ${GH_TOKEN}" \
    --header "X-GitHub-Api-Version: 2022-11-28" \
    "https://api.github.com/repos/${REPO_PATH}/actions/runners/registration-token" \
    | jq --exit-status --raw-output '.token')"
  unset GH_TOKEN
fi
: "${RUNNER_TOKEN:?GitHub did not return a registration token}"

./config.sh --unattended \
  --url "${GITHUB_URL}" \
  --token "${RUNNER_TOKEN}" \
  --name "${RUNNER_NAME}" \
  --labels "${LABELS}" \
  --ephemeral \
  --disableupdate
unset RUNNER_TOKEN

exec ./run.sh
