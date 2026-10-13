#!/usr/bin/env bash
set -euo pipefail

REPO="thelingolegacy-blip/TheLingoLegacy"
RUNNER_NAME="lingo-legacy-g02"
ENV_FILE=""
RUNNER_STARTED=0

# Keep the short-lived registration token outside the checkout, never overwrite
# an operator's existing .env, and remove only the temporary file created here.
cleanup() {
  if [[ -n "${ENV_FILE}" && -f "${ENV_FILE}" ]]; then
    rm -f -- "${ENV_FILE}"
  fi
  if [[ "${RUNNER_STARTED}" == "1" ]]; then
    echo "NOTE: runner launch ended. Verify its exact status and ID in repository Settings -> Actions -> Runners." >&2
    echo "Do not delete a remote runner by name; remove a stale registration only after independently verifying its runner ID." >&2
  fi
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

fail() { echo "G02 startup preflight FAILED: $*" >&2; exit 1; }

[[ "$(uname -s)" == "Linux" ]] || fail "a dedicated Linux host is required"
[[ "$(uname -m)" == "x86_64" ]] || fail "a Linux x86_64 host is required"

command -v gh >/dev/null || fail "GitHub CLI (gh) is required"
command -v docker >/dev/null || fail "Docker is required"
docker compose version >/dev/null 2>&1 || fail "Docker Compose plugin is unavailable"
docker info >/dev/null 2>&1 || fail "Docker daemon is unavailable; start/repair Docker before runner registration"
gh auth status >/dev/null 2>&1 || fail "GitHub CLI authentication is unavailable"

REPO_ADMIN="$(gh api "repos/${REPO}" --jq '.permissions.admin' 2>/dev/null)" ||
  fail "cannot read repository permissions"
[[ "${REPO_ADMIN}" == "true" ]] ||
  fail "authenticated GitHub account must have repository administrator permissions"

EXISTING_RUNNER_IDS="$(gh api --paginate "repos/${REPO}/actions/runners?per_page=100" --jq '.runners[]? | select(.name == "lingo-legacy-g02") | .id')" ||
  fail "cannot inspect repository runner inventory"
if [[ -n "${EXISTING_RUNNER_IDS}" ]]; then
  echo "Runner lingo-legacy-g02 is already registered (id: ${EXISTING_RUNNER_IDS})." >&2
  echo "Refusing to create a duplicate. Repair the existing daemon or remove a stale registration through repository Settings after verifying its exact ID." >&2
  exit 2
fi

# Validate the Compose model and build the image before creating a registration
# token. This avoids spending a short-lived token on a broken local build.
RUNNER_TOKEN="preflight-placeholder" RUNNER_NAME="${RUNNER_NAME}" docker compose config --quiet ||
  fail "Docker Compose configuration is invalid"
echo "Building isolated G02 runner image..."
docker compose build github-runner ||
  fail "runner image build failed; no registration token was requested"

echo "Requesting short-lived repository runner registration token..."
TOKEN="$(gh api --method POST "repos/${REPO}/actions/runners/registration-token" --jq '.token')" ||
  fail "GitHub refused to issue a runner registration token"
[[ -n "${TOKEN}" ]] || fail "GitHub returned an empty runner registration token"

umask 077
ENV_FILE="$(mktemp "${TMPDIR:-/tmp}/lingo-g02-runner.XXXXXX")"
printf 'RUNNER_TOKEN=%s\nRUNNER_NAME=%s\n' "${TOKEN}" "${RUNNER_NAME}" > "${ENV_FILE}"
unset TOKEN
chmod 600 "${ENV_FILE}"

echo "Starting ephemeral repository runner as ${RUNNER_NAME}..."
RUNNER_STARTED=1
docker compose --env-file "${ENV_FILE}" up --no-build --abort-on-container-exit --exit-code-from github-runner
