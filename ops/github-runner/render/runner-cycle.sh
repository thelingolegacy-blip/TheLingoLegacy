#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

: "${GITHUB_REPOSITORY:?GITHUB_REPOSITORY is required}"
: "${GITHUB_APP_ID:?GITHUB_APP_ID is required}"
: "${GITHUB_APP_INSTALLATION_ID:?GITHUB_APP_INSTALLATION_ID is required}"
: "${GITHUB_APP_PRIVATE_KEY_B64:?GITHUB_APP_PRIVATE_KEY_B64 is required}"

if [[ ! "$GITHUB_REPOSITORY" =~ ^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$ ]]; then
  echo "G02_RENDER_CONFIG_ERROR=INVALID_REPOSITORY" >&2
  exit 20
fi
if [[ ! "$GITHUB_APP_ID" =~ ^[0-9]+$ || ! "$GITHUB_APP_INSTALLATION_ID" =~ ^[0-9]+$ ]]; then
  echo "G02_RENDER_CONFIG_ERROR=INVALID_APP_IDENTIFIERS" >&2
  exit 21
fi

GITHUB_URL="https://github.com/${GITHUB_REPOSITORY}"
RUNNER_NAME_PREFIX="${RUNNER_NAME_PREFIX:-lingo-g02-render}"
RUNNER_LABELS="${RUNNER_LABELS:-self-hosted,linux,x64,lingo-g02-render}"

key_file="$(mktemp /run/g02-app-key.XXXXXX)"
cycle_dir=""
runner_pid=""
cleanup() {
  if [[ -n "$runner_pid" ]]; then
    kill -TERM "$runner_pid" 2>/dev/null || true
    wait "$runner_pid" 2>/dev/null || true
  fi
  if [[ -n "$cycle_dir" && -d "$cycle_dir" ]]; then
    rm -rf -- "$cycle_dir"
  fi
  rm -f -- "$key_file"
}
trap cleanup EXIT
trap 'exit 143' TERM INT
printf '%s' "$GITHUB_APP_PRIVATE_KEY_B64" | base64 --decode > "$key_file"
chmod 0600 "$key_file"

b64url() { openssl base64 -A | tr '+/' '-_' | tr -d '='; }
now="$(date +%s)"
iat="$((now - 60))"
exp="$((now + 540))"
header="$(printf '%s' '{"alg":"RS256","typ":"JWT"}' | b64url)"
payload="$(jq -cn --argjson iat "$iat" --argjson exp "$exp" --argjson iss "$GITHUB_APP_ID" '{iat:$iat,exp:$exp,iss:$iss}' | b64url)"
unsigned="${header}.${payload}"
signature="$(printf '%s' "$unsigned" | openssl dgst -sha256 -sign "$key_file" -binary | b64url)"
app_jwt="${unsigned}.${signature}"

api_headers=(
  -H "Accept: application/vnd.github+json"
  -H "X-GitHub-Api-Version: 2022-11-28"
)
installation_response="$(curl -fsS -X POST "https://api.github.com/app/installations/${GITHUB_APP_INSTALLATION_ID}/access_tokens" \
  "${api_headers[@]}" -H "Authorization: Bearer ${app_jwt}" -d '{}')"
installation_token="$(jq -er '.token' <<< "$installation_response")"
unset installation_response app_jwt signature unsigned payload header

runner_inventory="$(curl -fsS "https://api.github.com/repos/${GITHUB_REPOSITORY}/actions/runners?per_page=100" \
  "${api_headers[@]}" -H "Authorization: Bearer ${installation_token}")"
if jq -e --arg prefix "${RUNNER_NAME_PREFIX}-" \
  '[.runners[]? | select(.name | startswith($prefix)) | select(.status == "online")] | length > 0' \
  <<< "$runner_inventory" >/dev/null; then
  echo "G02_RENDER_DUPLICATE_GUARD=BLOCKED_EXISTING_ONLINE_RUNNER" >&2
  exit 22
fi
unset runner_inventory

registration_response="$(curl -fsS -X POST "https://api.github.com/repos/${GITHUB_REPOSITORY}/actions/runners/registration-token" \
  "${api_headers[@]}" -H "Authorization: Bearer ${installation_token}" -d '{}')"
registration_token="$(jq -er '.token' <<< "$registration_response")"
unset registration_response installation_token

host_suffix="$(hostname | tr -cd 'a-zA-Z0-9-' | cut -c1-12)"
runner_name="${RUNNER_NAME_PREFIX}-${host_suffix}-$(date +%s)-${RANDOM}"
cycle_dir="$(mktemp -d /opt/g02-runner-cycle.XXXXXX)"
cp -a /opt/runner-dist/. "$cycle_dir/"
chown -R runner:runner "$cycle_dir"
chmod -R u+rwX "$cycle_dir"

printf 'G02_RENDER_RUNNER_CONFIG=START name=%s\n' "$runner_name"
runuser -u runner -- env -i HOME=/home/runner PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin \
  bash -c 'cd "$1"; exec ./config.sh --unattended --url "$2" --token "$3" --name "$4" --labels "$5" --ephemeral --disableupdate' \
  _ "$cycle_dir" "$GITHUB_URL" "$registration_token" "$runner_name" "$RUNNER_LABELS" &
runner_pid="$!"
set +e
wait "$runner_pid"
config_rc="$?"
set -e
runner_pid=""
unset registration_token
if [[ "$config_rc" -ne 0 ]]; then
  echo "G02_RENDER_RUNNER_CONFIG=FAILED exit=$config_rc" >&2
  exit "$config_rc"
fi

# Job steps receive a clean environment. GitHub App credentials and API tokens
# stay in the root-owned supervisor and are never inherited by job processes.
printf 'G02_RENDER_RUNNER_LISTENER=START name=%s\n' "$runner_name"
runuser -u runner -- env -i HOME=/home/runner PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin \
  bash -c 'cd "$1"; exec ./run.sh' _ "$cycle_dir" &
runner_pid="$!"
set +e
wait "$runner_pid"
runner_rc="$?"
set -e
runner_pid=""
printf 'G02_RENDER_RUNNER_LISTENER_EXIT=%s name=%s\n' "$runner_rc" "$runner_name"
exit "$runner_rc"
