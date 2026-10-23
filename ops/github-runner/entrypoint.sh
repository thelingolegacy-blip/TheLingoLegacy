#!/usr/bin/env bash
set -euo pipefail
: "${GITHUB_URL:?GITHUB_URL is required}"
: "${RUNNER_TOKEN:?RUNNER_TOKEN is required}"
: "${RUNNER_NAME:?RUNNER_NAME is required}"
LABELS="${RUNNER_LABELS:-self-hosted,linux,x64,lingo-g02}"

./config.sh --unattended \
  --url "${GITHUB_URL}" \
  --token "${RUNNER_TOKEN}" \
  --name "${RUNNER_NAME}" \
  --labels "${LABELS}" \
  --ephemeral \
  --disableupdate

exec ./run.sh
