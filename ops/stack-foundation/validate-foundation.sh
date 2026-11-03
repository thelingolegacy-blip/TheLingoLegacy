#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
python3 ops/stack-foundation/validate-foundation.py
python3 -m json.tool config/stack-foundation/stack-registry.json >/dev/null
bash -n ops/stack-foundation/validate-foundation.sh
printf '%s\n' "PASS: local stack foundation contract"
