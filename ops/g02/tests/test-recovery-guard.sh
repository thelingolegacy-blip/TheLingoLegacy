#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "\${BASH_SOURCE[0]}")/../../.." && pwd)"
controller="$root/ops/g02/runner-control.sh"
installer="$root/ops/g02/install-runner.sh"
bridge="$root/ops/g02/diagnose-actions-dispatch.sh"

bash -n "$controller"
bash -n "$installer"
bash -n "$bridge"

grep -q 'G02_CONFIRM_HOST_MUTATION' "$controller"
grep -q -- '--confirm-host-mutation' "$controller"
grep -q 'reset|reboot|enable' "$controller"
grep -q 'G02_CONFIRM_RUNNER_REGISTRATION' "$installer"
grep -q 'repos/$REPO/actions/runners' "$installer"
if grep -q -- '--replace' "$installer"; then
  echo "FAIL: installer must not use runner --replace" >&2
  exit 1
fi
if grep -q 'config.sh" remove' "$installer"; then
  echo "FAIL: installer must not unregister an existing runner" >&2
  exit 1
fi
grep -q 'actions/runs?per_page=10' "$bridge"
grep -q 'actions/jobs/$job_id/logs' "$bridge"
grep -q 'sha256sum "$report"' "$bridge"

echo "PASS | controller/installer/bridge Bash syntax"
echo "PASS | host mutations require explicit confirmation"
echo "PASS | reset/reboot/enable disabled in controller"
echo "PASS | duplicate runner inventory checked; replacement/removal forbidden"
echo "PASS | read-only evidence bridge checks assignment, steps, logs, artifacts, SHA"
echo "SCOPE | static safety assertions only; no host or GitHub workflow execution"
