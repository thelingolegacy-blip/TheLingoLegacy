#!/usr/bin/env bash
set -euo pipefail

: "${GITHUB_REPOSITORY:?Set GITHUB_REPOSITORY=thelingolegacy-blip/TheLingoLegacy}"
: "${GITHUB_RUNNER_TOKEN:?Set GITHUB_RUNNER_TOKEN to the short-lived repository runner registration token}"

RUNNER_DIR="${RUNNER_DIR:-$HOME/actions-runner-lingo-recovery}"
RUNNER_LABELS="${RUNNER_LABELS:-self-hosted,lingo-recovery}"
RUNNER_NAME="${RUNNER_NAME:-lingo-recovery-01}"

mkdir -p "$RUNNER_DIR"
cd "$RUNNER_DIR"

if [[ ! -f ./config.sh ]]; then
  latest_url="$(curl -fsSLI -o /dev/null -w '%{url_effective}' https://github.com/actions/runner/releases/latest)"
  version="${latest_url##*/}"
  version="${version#v}"
  archive="actions-runner-${version}-linux-x64-2.tar.gz"

  curl -fsSLo "$archive" "https://github.com/actions/runner/releases/download/v${version}/$archive"
  tar xzf "$archive"
  rm -f "$archive"
fi

./config.sh \
  --unattended \
  --url "https://github.com/$GITHUB_REPOSITORY" \
  --token "$GITHUB_RUNNER_TOKEN" \
  --name "$RUNNER_NAME" \
  --labels "$RUNNER_LABELS" \
  --work "_work"

echo "Runner registered: $RUNNER_NAME"
echo "Repository: $GITHUB_REPOSITORY"
echo "Labels: $RUNNER_LABELS"
echo "Start with: ./run.sh"
