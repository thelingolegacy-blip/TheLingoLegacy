#!/usr/bin/env bash
set -euo pipefail
: "${GITHUB_URL:?GITHUB_URL is required}"
: "${RUNNER_TOKEN:?RUNNER_TOKEN is required}"
: "${RUNNER_NAME:?RUNNER_NAME is required}"
LABELS="${RUNNER_LABELS:-self-hosted,linux,x64,lingo-g02}"
RUNNER_GROUP="${RUNNER_GROUP:-Lingo-G02}"
cleanup() {
  ./config.sh remove --unattended --token "${RUNNER_TOKEN}" || true
}
trap cleanup EXIT INT TERM
./config.sh --unattended   --url "${GITHUB_URL}"   --token "${RUNNER_TOKEN}"   --name "${RUNNER_NAME}"   --labels "${LABELS}"   --runnergroup "${RUNNER_GROUP}"   --ephemeral   --disableupdate
exec ./run.sh
