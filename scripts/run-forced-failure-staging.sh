#!/usr/bin/env bash
set -euo pipefail
ROOT="${STAGING_EVIDENCE_ROOT:-.}"; mkdir -p "$ROOT"
LOG="$ROOT/staging-forced-failure.log"; exec > >(tee "$LOG") 2>&1
source "$(dirname "$0")/staging-target-guard.sh"
req(){ [[ -n "${!1:-}" ]] || { echo "MISSING_ENV=$1"; exit 65; }; }
for v in STAGING_BASELINE_CMD STAGING_MUTATE_CLOUD_RUN_CMD STAGING_MUTATE_FIREBASE_CMD STAGING_MUTATE_WORKER_CMD STAGING_FAILURE_INJECTION_CMD STAGING_ROLLBACK_WORKER_CMD STAGING_ROLLBACK_CLOUD_RUN_CMD STAGING_ROLLBACK_FIREBASE_CMD STAGING_ROLLBACK_VERIFY_CMD; do req "$v"; done
J="node $(dirname "$0")/staging-journal.mjs"
rollback_needed=0
rollback_done=0
rollback(){ [[ "$rollback_needed" == 1 && "$rollback_done" == 0 ]] || return 0; rollback_done=1; echo "ROLLBACK_REQUIRED"; $J '{"phase":"ROLLBACK_REQUIRED"}'; echo "ROLLING_BACK"; $J '{"phase":"ROLLING_BACK"}'; bash -lc "$STAGING_ROLLBACK_WORKER_CMD"; bash -lc "$STAGING_ROLLBACK_CLOUD_RUN_CMD"; bash -lc "$STAGING_ROLLBACK_FIREBASE_CMD"; echo "ROLLBACK COMPLETE"; bash -lc "$STAGING_ROLLBACK_VERIFY_CMD"; $J '{"phase":"ROLLED_BACK","completedAt":"'"$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"'"}'; echo "ROLLED_BACK"; }
trap 'rc=$?; if (( rc != 0 )); then rollback || true; fi; exit $rc' EXIT
echo "STAGING_RUN=FORCED_FAILURE"; echo "SOURCE_SHA=${GITHUB_SHA:-LOCAL}"; echo "STARTED_AT=$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"
echo "BASELINE_CAPTURE"; bash -lc "$STAGING_BASELINE_CMD"; $J '{"phase":"BASELINE_CAPTURED","stagingOnly":true}'
echo "MUTATING"; bash -lc "$STAGING_MUTATE_CLOUD_RUN_CMD"; bash -lc "$STAGING_MUTATE_FIREBASE_CMD"; bash -lc "$STAGING_MUTATE_WORKER_CMD"; $J '{"phase":"MUTATING"}'; rollback_needed=1
echo "FAILURE_INJECTION"; if bash -lc "$STAGING_FAILURE_INJECTION_CMD"; then echo "FAILURE_INJECTION_DID_NOT_FAIL"; exit 66; fi
rollback
