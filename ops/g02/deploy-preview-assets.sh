#!/usr/bin/env bash
set -euo pipefail

# One-time, fail-closed Stage 3 deployment helper.
# Deploy target is hard-pinned to the isolated lingo-recovery-preview Worker.
# No production routes, custom domains, DNS, or production Worker names are configured.

EXPECTED_REPO="thelingolegacy-blip/TheLingoLegacy"
EXPECTED_BRANCH="studio/lingo-ecosystem-integration-2026-10-04"
EXPECTED_BASE_COMMIT="1a7ff687f60514854e8d7aa9ba4883381a657364"
PREVIEW_WORKER="lingo-recovery-preview"
PREVIEW_HOST="lingo-recovery-preview.thelingolegacy.workers.dev"

usage() {
  echo "Usage: bash ops/g02/deploy-preview-assets.sh [--deploy]" >&2
  echo "Default: authenticated identity check + dry-run only." >&2
  echo "Deployment requires --deploy and LINGO_PREVIEW_DEPLOY_CONFIRM=YES." >&2
}
case "${1:-}" in
  "") MODE="dry-run" ;;
  "--deploy") MODE="deploy" ;;
  *) usage; exit 2 ;;
esac

for cmd in git cp mkdir mktemp; do
  command -v "$cmd" >/dev/null 2>&1 || { echo "BLOCKED: missing required command: $cmd" >&2; exit 2; }
done

ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || {
  echo "BLOCKED: run from inside the existing Git checkout." >&2; exit 2;
}
cd "$ROOT"

BRANCH="$(git branch --show-current)"
[[ "$BRANCH" == "$EXPECTED_BRANCH" ]] || {
  echo "BLOCKED: expected branch $EXPECTED_BRANCH; found ${BRANCH:-detached HEAD}." >&2; exit 3;
}

REMOTE_URL="$(git remote get-url origin 2>/dev/null || true)"
case "$REMOTE_URL" in
  *"github.com:${EXPECTED_REPO}.git"|"https://github.com/${EXPECTED_REPO}.git"|"https://github.com/${EXPECTED_REPO}") ;;
  *)
    echo "BLOCKED: origin does not match $EXPECTED_REPO (refusing unexpected checkout)." >&2
    exit 3
    ;;
esac

if [[ -n "$(git status --porcelain)" ]]; then
  echo "BLOCKED: working tree is not clean. Commit/stash reviewed local changes before running." >&2
  git status --short >&2
  exit 3
fi

SOURCE_SHA="$(git rev-parse HEAD)"
SOURCE_BASE_SHA="$(git rev-parse HEAD^ 2>/dev/null || true)"
[[ "$SOURCE_BASE_SHA" == "$EXPECTED_BASE_COMMIT" ]] || {
  echo "BLOCKED: reviewed base commit mismatch; expected parent $EXPECTED_BASE_COMMIT; found ${SOURCE_BASE_SHA:-no parent}." >&2
  exit 3
}

for file in worker.js index.html assets/lingo-os.css assets/lingo-os.js assets/hq-studio.css assets/studio-grade.css assets/studio-grade.js; do
  [[ -f "$file" ]] || { echo "BLOCKED: required source file missing: $file" >&2; exit 4; }
done
command -v curl >/dev/null 2>&1 || { echo "BLOCKED: curl is required for post-deploy probes." >&2; exit 2; }

if command -v wrangler >/dev/null 2>&1; then
  WRANGLER=(wrangler)
elif [[ -x "$ROOT/node_modules/.bin/wrangler" ]]; then
  WRANGLER=("$ROOT/node_modules/.bin/wrangler")
else
  echo "BLOCKED: Wrangler is not installed in this environment. Do not auto-install dependencies in this recovery script." >&2
  exit 2
fi

echo "SOURCE_REPOSITORY=$EXPECTED_REPO"
echo "SOURCE_BRANCH=$BRANCH"
echo "SOURCE_COMMIT=$SOURCE_SHA"
echo "SOURCE_REVIEWED_BASE_COMMIT=$SOURCE_BASE_SHA"
echo "TARGET_WORKER=$PREVIEW_WORKER"
echo "PRODUCTION_ROUTES=NOT_CONFIGURED"

"${WRANGLER[@]}" whoami

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$TMP/public"
cp worker.js "$TMP/worker.js"
cp index.html "$TMP/public/index.html"
[[ ! -f manifest.webmanifest ]] || cp manifest.webmanifest "$TMP/public/manifest.webmanifest"
cp -a assets "$TMP/public/assets"

# Include the public game registry only when it exists in this checkout.
if [[ -f games/lingo-nexus/registry.json ]]; then
  mkdir -p "$TMP/public/games/lingo-nexus"
  cp games/lingo-nexus/registry.json "$TMP/public/games/lingo-nexus/registry.json"
fi

cat > "$TMP/wrangler.jsonc" <<'CONFIG'
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "lingo-recovery-preview",
  "main": "worker.js",
  "compatibility_date": "2026-07-27",
  "workers_dev": true,
  "vars": {
    "CANONICAL_DOMAIN": "lingo-recovery-preview.thelingolegacy.workers.dev",
    "PUBLIC_SITE_URL": "https://lingo-recovery-preview.thelingolegacy.workers.dev"
  },
  "observability": { "enabled": true },
  "assets": {
    "directory": "public",
    "binding": "ASSETS"
  },
  "compatibility_flags": ["nodejs_compat"]
}
CONFIG

echo "WRANGLER_DRY_RUN=START"
"${WRANGLER[@]}" deploy --config "$TMP/wrangler.jsonc" --dry-run
echo "WRANGLER_DRY_RUN=PASS"

if [[ "$MODE" == "dry-run" ]]; then
  echo "DEPLOYMENT=NOT_REQUESTED"
  echo "NEXT=Review dry-run output, then rerun with --deploy and explicit confirmation if approved."
  exit 0
fi

[[ "${LINGO_PREVIEW_DEPLOY_CONFIRM:-}" == "YES" ]] || {
  echo "BLOCKED: --deploy requires LINGO_PREVIEW_DEPLOY_CONFIRM=YES." >&2
  exit 5
}

echo "DEPLOYMENT_TARGET=$PREVIEW_WORKER"
echo "DEPLOYMENT_CONFIRMATION=EXPLICIT"
"${WRANGLER[@]}" deploy --config "$TMP/wrangler.jsonc"

BASE="https://$PREVIEW_HOST"
probe() {
  local path="$1" expected="$2" code
  code="$(curl --silent --show-error --location --max-time 20 -o "$TMP/probe.body" -w '%{http_code}' "$BASE$path")"
  printf 'PROBE path=%s status=%s expected=%s\n' "$path" "$code" "$expected"
  [[ "$code" == "$expected" ]] || { echo "FAIL: probe $path returned $code" >&2; return 1; }
}
probe "/healthz" "200"
probe "/api/v1/platform/gates" "200"
probe "/api/v1/platform/modules" "200"
probe "/" "200"
probe "/assets/lingo-os.css" "200"
probe "/assets/lingo-os.js" "200"

echo "LIMITATION=HTTP status checks only; inspect content, headers, browser rendering, and Cloudflare binding inventory independently."
echo "PRODUCTION=UNCHANGED_BY_THIS_SCRIPT"
