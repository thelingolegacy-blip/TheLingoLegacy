#!/usr/bin/env bash
# Read-only validation for the isolated LINGO Studio / AI Studio prototype.
# This script does not deploy, merge, mutate production, or claim G02 passed.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

fail() { printf 'FAIL: %s\n' "$*" >&2; exit 1; }
pass() { printf 'PASS: %s\n' "$*"; }

for f in studio/index.html studio/lingo-ai/index.html docs/google-ai-studio-lingo-workstream.md studio/google-ai-studio-build-prompt.md docs/creative-experience-upgrade.md; do
  [[ -f "$f" ]] || fail "missing required file: $f"
done
pass "required Studio workstream files exist"

grep -q 'PROTECTED HOLD' studio/index.html || fail "dashboard must display protected hold"
grep -q '/api/v1/platform/status' studio/index.html || fail "dashboard runtime status endpoint missing"
grep -q '/api/v1/platform/gates' studio/index.html || fail "dashboard gate endpoint missing"
grep -qi 'G02' docs/google-ai-studio-lingo-workstream.md || fail "workstream lacks G02 guardrail"
grep -qi 'PRODUCTION LOCKED' studio/google-ai-studio-build-prompt.md || fail "Build prompt lacks production lock"
grep -qi 'server-side' studio/google-ai-studio-build-prompt.md || fail "Build prompt lacks server-side key requirement"
grep -qi 'prototype' studio/lingo-ai/index.html || fail "LINGO AI surface must identify itself as a prototype"
pass "release-lock and secret-handling guardrails present"

if grep -R -n -E 'AIza[0-9A-Za-z_-]{30,}|sk-[A-Za-z0-9]{20,}' studio docs/google-ai-studio-lingo-workstream.md docs/creative-experience-upgrade.md; then
  fail "possible credential-shaped string found; investigate before continuing"
fi
pass "no obvious credential-shaped strings in scoped prototype files"

printf '\nSTUDIO_SANDBOX_VALIDATION=PASS\n'
printf 'PRODUCTION_DEPLOYMENT=NOT_ATTEMPTED\n'
printf 'G02=FAIL_UNVERIFIED_UNCHANGED\n'
printf 'MERGE=NOT_PERFORMED\n'
printf 'ACTIVATION=NOT_AUTHORIZED\n'
