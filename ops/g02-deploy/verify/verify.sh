#!/usr/bin/env bash
set -euo pipefail

fail(){ echo "G02_VERIFY=FAIL: $*" >&2; exit 1; }

[[ "${G02_VERIFIED:-false}" == "true" ]] || fail "G02 verification has not been established"

echo "G02_VERIFY=PASS"
echo "PRODUCTION_PROMOTION=BLOCKED_UNLESS_AUTHORIZED"
