#!/usr/bin/env bash
set -euo pipefail
ROOT="${STAGING_EVIDENCE_ROOT:-.}"; mkdir -p "$ROOT"
LOG="$ROOT/staging-clean-activation.log"; exec > >(tee "$LOG") 2>&1
source "$(dirname "$0")/staging-target-guard.sh"
req(){ [[ -n "${!1:-}" ]] || { echo "MISSING_ENV=$1"; exit 65; }; }
for v in STAGING_BASELINE_CMD STAGING_MUTATE_CLOUD_RUN_CMD STAGING_MUTATE_FIREBASE_CMD STAGING_MUTATE_WORKER_CMD STAGING_POST_MUTATION_VERIFY_CMD STAGING_PROMOTE_CMD STAGING_POST_PROMOTION_VERIFY_CMD; do req "$v"; done
J="node $(dirname "$0")/staging-journal.mjs"
echo "STAGING_RUN=CLEAN_ACTIVATION"; echo "STARTED_AT=$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"; echo "AUTHORIZED"
bash -lc "$STAGING_BASELINE_CMD"; $J '{"phase":"BASELINE_CAPTURED","stagingOnly":true}'
echo "MUTATING"; bash -lc "$STAGING_MUTATE_CLOUD_RUN_CMD"; bash -lc "$STAGING_MUTATE_FIREBASE_CMD"; bash -lc "$STAGING_MUTATE_WORKER_CMD"; $J '{"phase":"MUTATING"}'
echo "POST_MUTATION_VERIFY"; bash -lc "$STAGING_POST_MUTATION_VERIFY_CMD"; $J '{"phase":"POST_MUTATION_VERIFY"}'
echo "PROMOTED"; bash -lc "$STAGING_PROMOTE_CMD"; $J '{"phase":"PROMOTED"}'
echo "POST_PROMOTION_VERIFY"; bash -lc "$STAGING_POST_PROMOTION_VERIFY_CMD"; $J '{"phase":"POST_PROMOTION_VERIFY"}'
$J '{"phase":"ACTIVATED","completedAt":"'"$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"'"}'; echo "ACTIVATED"
